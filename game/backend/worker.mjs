import {VERSION,TRACK_VERSION,BANK_VERSION,SUBJECTS,hash,week,playlist,validQuestion,answerHash,validateFinish} from './rules.mjs';
const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function sha(v){return hex(await crypto.subtle.digest('SHA-256',enc.encode(v)));}
async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
function equal(a,b){let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;}
function config(body){const {track,diff}=body;if(!Number.isInteger(track)||track<0||track>2||!Number.isInteger(diff)||diff<0||diff>2)throw Error('赛道或难度无效');const study=body.study===true;const grade=study?Number(body.grade):0,subject=study?body.subject:'none';if(study&&(!Number.isInteger(grade)||grade<1||grade>6||(!SUBJECTS.includes(subject)||(grade<3&&['it'].includes(subject)))))throw Error('年级或科目无效');return {track,diff,study:study?1:0,grade,subject};}
async function readBody(req){const raw=await req.text();if(raw.length>16000)throw new SyntaxError('请求过大');return JSON.parse(raw);}
const schema=[
'CREATE TABLE IF NOT EXISTS game_metrics (id TEXT PRIMARY KEY, day TEXT NOT NULL, event TEXT NOT NULL, cohort TEXT NOT NULL)',
'CREATE TABLE IF NOT EXISTS game_run_meta (run_id TEXT PRIMARY KEY, rules TEXT NOT NULL, track_version TEXT NOT NULL, bank TEXT NOT NULL, laps INTEGER NOT NULL, mode TEXT NOT NULL, seed INTEGER NOT NULL, questions TEXT NOT NULL, expires INTEGER NOT NULL)',
'CREATE TABLE IF NOT EXISTS game_reports (id TEXT PRIMARY KEY, question_id TEXT NOT NULL, reason TEXT NOT NULL, bank TEXT NOT NULL, created INTEGER NOT NULL)',
'CREATE TABLE IF NOT EXISTS game_score_details (run_id TEXT PRIMARY KEY, laps INTEGER NOT NULL, hits INTEGER NOT NULL, points INTEGER NOT NULL)',
'CREATE TABLE IF NOT EXISTS game_users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created INTEGER NOT NULL)',
'CREATE TABLE IF NOT EXISTS game_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL)',
'CREATE TABLE IF NOT EXISTS game_runs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, track INTEGER NOT NULL, diff INTEGER NOT NULL, study INTEGER NOT NULL, grade INTEGER NOT NULL, subject TEXT NOT NULL, started INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0)',
'CREATE TABLE IF NOT EXISTS game_scores (run_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, track INTEGER NOT NULL, diff INTEGER NOT NULL, study INTEGER NOT NULL, grade INTEGER NOT NULL, subject TEXT NOT NULL, ms INTEGER NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL, version TEXT NOT NULL, created INTEGER NOT NULL)',
'CREATE INDEX IF NOT EXISTS game_scores_board ON game_scores(version,track,diff,study,grade,subject,ms)',
'CREATE TABLE IF NOT EXISTS game_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)'];
let ready;
export default {async fetch(req,env){
 const origin=req.headers.get('Origin');const allowed=['https://brassivo.com','https://www.brassivo.com'];
 const C={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Credentials':'true'};
 if(allowed.includes(origin))C['Access-Control-Allow-Origin']=origin;
 const reply=(data,status=200,extra={})=>new Response(status===204?null:JSON.stringify(data),{status,headers:{...C,...extra}});
 if(req.method==='OPTIONS')return reply({},204);
 const url=new URL(req.url),path=url.pathname;
 if(path==='/health')return reply({ok:true,version:VERSION,track:TRACK_VERSION,bank:BANK_VERSION});
 if(!env.DB)return reply({ok:false,error:'游戏存储未配置'},503);
 try{
  if(!ready)ready=env.DB.batch(schema.map(sql=>env.DB.prepare(sql))).catch(e=>{ready=null;throw e;});await ready;
  const now=Date.now();
  if(Math.random()<0.01)await env.DB.batch([env.DB.prepare('DELETE FROM game_limits WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM game_sessions WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM game_runs WHERE started<? AND used=0').bind(now-7*86400000)]);
  if(req.method==='POST'){
   if(!allowed.includes(origin))return reply({ok:false,error:'请求来源无效'},403);
   if(Number(req.headers.get('Content-Length')||0)>16000)return reply({ok:false,error:'请求过大'},413);
   if(!req.headers.get('Content-Type')?.includes('application/json'))return reply({ok:false,error:'请求格式无效'},415);
   const ip=req.headers.get('CF-Connecting-IP')||'unknown';const auth=path==='/register'||path==='/login';const key=await sha(ip)+':'+(auth?'auth':'write')+':'+Math.floor(now/60000);
   const rate=await env.DB.prepare('INSERT INTO game_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+120000).first();
   if(rate.count>(auth?10:60))return reply({ok:false,error:'操作频繁，请稍后重试'},429);
  }
  const cookie=req.headers.get('Cookie')||'';const token=(cookie.match(/(?:^|;\s*)game_session=([a-f0-9]{64})(?:;|$)/)||[])[1];
  const me=token?await env.DB.prepare('SELECT u.id,u.username FROM game_sessions s JOIN game_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?').bind(await sha(token),now).first():null;
  if(path==='/me'&&req.method==='GET')return reply({ok:true,user:me?{username:me.username}:null});
  if((path==='/register'||path==='/login')&&req.method==='POST'){
   const raw=await req.text();if(raw.length>16000)return reply({ok:false,error:'请求过大'},413);const b=JSON.parse(raw),username=String(b.username||'').trim().toLowerCase(),password=b.password;
   if(!/^[a-z0-9_]{3,20}$/.test(username)||typeof password!=='string'||password.length<8||password.length>128)return reply({ok:false,error:'账号需3–20位英文字母、数字或下划线；密码需8–128位'},400);
   let user=await env.DB.prepare('SELECT * FROM game_users WHERE username=?').bind(username).first();
   if(path==='/register'){
    if(user)return reply({ok:false,error:'账号已被使用'},409);
    const salt=random(),id=crypto.randomUUID(),hash=await passwordHash(password,salt);
    try{await env.DB.prepare('INSERT INTO game_users VALUES(?,?,?,?,?)').bind(id,username,salt,hash,now).run();}catch(e){return reply({ok:false,error:'账号已被使用'},409);}user={id,username};
   }else{
    const hash=await passwordHash(password,user?.salt||'dummy-salt');if(!user||!equal(hash,user.password_hash))return reply({ok:false,error:'账号或密码不正确'},401);
   }
   const session=random();await env.DB.prepare('INSERT INTO game_sessions VALUES(?,?,?)').bind(await sha(session),user.id,now+7*86400000).run();
   return reply({ok:true,user:{username:user.username}},200,{'Set-Cookie':`game_session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`});
  }
  if(path==='/logout'&&req.method==='POST'){if(token)await env.DB.prepare('DELETE FROM game_sessions WHERE token_hash=?').bind(await sha(token)).run();return reply({ok:true},200,{'Set-Cookie':'game_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});}
  if(path==='/metrics'&&req.method==='POST'){
   const b=await readBody(req),events=b.events;if(!Array.isArray(events)||events.length<1||events.length>20)return reply({ok:false,error:'统计无效'},400);
   const allowedEvents=['start','finish','second_race','save_fail','new_player','return_d1','return_d7','active_day'],today=new Date(now).toISOString().slice(0,10);
   if(events.some(x=>typeof x.id!=='string'||!/^[-a-z0-9]{36}$/.test(x.id)||!allowedEvents.includes(x.event)||!/^\d{4}-\d{2}-\d{2}$/.test(x.day)||!/^\d{4}-\d{2}-\d{2}$/.test(x.cohort)||!Number.isFinite(Date.parse(x.day))||!Number.isFinite(Date.parse(x.cohort))||x.day>today||x.cohort>x.day||now-Date.parse(x.day)>31*86400000))return reply({ok:false,error:'统计无效'},400);
   await env.DB.batch(events.map(x=>env.DB.prepare('INSERT OR IGNORE INTO game_metrics VALUES(?,?,?,?)').bind(x.id,x.day,x.event,x.cohort)));return reply({ok:true});
  }
  if(path==='/metrics-summary'&&req.method==='GET'){
   const r=await env.DB.prepare('SELECT day,event,COUNT(*) AS count FROM game_metrics WHERE day>=? GROUP BY day,event ORDER BY day DESC,event LIMIT 100').bind(new Date(now-30*86400000).toISOString().slice(0,10)).all();return reply({ok:true,rows:r.results});
  }
  if(path==='/question-report'&&req.method==='POST'){
   const b=await readBody(req);if(typeof b.id!=='string'||b.id.length>80||!answerHash(b.questionId)||!['乱码或显示问题','题目或答案有误','超出年级范围','题意不清'].includes(b.reason)||b.bank!==BANK_VERSION)return reply({ok:false,error:'反馈内容无效'},400);
   await env.DB.prepare('INSERT OR IGNORE INTO game_reports VALUES(?,?,?,?,?)').bind(b.id,b.questionId,b.reason,b.bank,now).run();return reply({ok:true});
  }
  if(path==='/leaderboard'&&req.method==='GET'){
   const c=config({track:Number(url.searchParams.get('track')),diff:Number(url.searchParams.get('diff')),study:url.searchParams.get('study')==='1',grade:Number(url.searchParams.get('grade')),subject:url.searchParams.get('subject')});
   const version=url.searchParams.get('version')||VERSION;if(![VERSION,'kart-english-20261003','kart-s2-1300-20261003','kart-s2-20261002','composite-v1','six-laps-v1','wide-v1'].includes(version))return reply({ok:false,error:'赛季无效'},400);
   const mode=url.searchParams.get('mode')||'race',seed=Number(url.searchParams.get('seed')||0);if(!['race','quick','weekly','friend'].includes(mode)||!Number.isInteger(seed)||seed<0||seed>4294967295)return reply({ok:false,error:'挑战无效'},400);
   const racing=url.searchParams.get('sort')==='time',order=racing?'s.ms,s.created':'d.points DESC,s.ms,s.created',outer=racing?'ms,created':'points DESC,ms,created';
   const results=await env.DB.prepare(`SELECT username,ms,correct,total,created,laps,hits,points FROM (SELECT u.username,s.ms,s.correct,s.total,s.created,d.laps,d.hits,d.points,ROW_NUMBER() OVER(PARTITION BY s.user_id ORDER BY ${order}) AS rn FROM game_scores s JOIN game_users u ON u.id=s.user_id LEFT JOIN game_score_details d ON d.run_id=s.run_id LEFT JOIN game_run_meta m ON m.run_id=s.run_id WHERE version=? AND track=? AND diff=? AND study=? AND grade=? AND subject=? AND COALESCE(m.mode,'race')=? AND CASE WHEN COALESCE(m.mode,'race') IN ('weekly','friend') THEN m.seed ELSE 0 END=?) WHERE rn=1 ORDER BY ${outer} LIMIT 50`).bind(version,c.track,c.diff,c.study,c.grade,c.subject,mode,seed).all();return reply({ok:true,version,rows:results.results});
  }
  if(path==='/scores'&&req.method==='GET'){if(!me)return reply({ok:false,error:'请先登录'},401);const r=await env.DB.prepare(`SELECT s.track,s.diff,s.study,s.grade,s.subject,COALESCE(m.mode,'race') AS mode,CASE WHEN m.mode IN ('weekly','friend') THEN m.seed ELSE 0 END AS seed,MIN(s.ms) AS ms FROM game_scores s LEFT JOIN game_run_meta m ON m.run_id=s.run_id WHERE s.user_id=? AND s.version=? GROUP BY s.track,s.diff,s.study,s.grade,s.subject,COALESCE(m.mode,'race'),CASE WHEN m.mode IN ('weekly','friend') THEN m.seed ELSE 0 END ORDER BY ms LIMIT 200`).bind(me.id,VERSION).all();return reply({ok:true,rows:r.results});}
  if(path==='/runs'&&req.method==='POST'){
   if(!me)return reply({ok:false,error:'请先登录'},401);const body=await readBody(req);if(body.rules!==VERSION||body.trackVersion!==TRACK_VERSION||body.bank!==BANK_VERSION)return reply({ok:false,error:'请刷新到新赛季再开始比赛'},400);
   const c=config(body),mode=body.mode||'race',laps=mode==='quick'?1:6;
   if(!['race','quick','weekly','friend'].includes(mode)||body.laps!==laps)return reply({ok:false,error:'比赛模式无效'},400);
   let seed=Number(body.seed);if(!Number.isInteger(seed)||seed<0||seed>4294967295)return reply({ok:false,error:'随机种子无效'},400);
   if(mode==='weekly'){const w=week(now);if(!c.study||c.subject!=='english'||c.diff!==1||c.track!==hash(w)%3||seed!==hash(w+':'+c.grade))return reply({ok:false,error:'本周挑战设置已更新'},400);}
   let ids=[];if(c.study){ids=['weekly','friend'].includes(mode)?playlist(c,laps*2+1,seed):body.questionIds;if(!Array.isArray(ids)||ids.length!==laps*2+1||new Set(ids).size!==ids.length||ids.some(id=>!validQuestion(id,c)))return reply({ok:false,error:'题目配置无效'},400);}
   const id='s2-'+crypto.randomUUID();await env.DB.batch([env.DB.prepare('INSERT INTO game_runs(id,user_id,track,diff,study,grade,subject,started) VALUES(?,?,?,?,?,?,?,?)').bind(id,me.id,c.track,c.diff,c.study,c.grade,c.subject,now),env.DB.prepare('INSERT INTO game_run_meta VALUES(?,?,?,?,?,?,?,?,?)').bind(id,VERSION,TRACK_VERSION,BANK_VERSION,laps,mode,seed,JSON.stringify(ids),now+7*86400000)]);return reply({ok:true,runId:id,questionIds:ids,rules:VERSION});
  }
  if(path==='/finish'&&req.method==='POST'){
   if(!me)return reply({ok:false,error:'请先登录'},401);const b=await readBody(req),r=await env.DB.prepare('SELECT * FROM game_runs WHERE id=? AND user_id=?').bind(b.runId,me.id).first();
   if(!r)return reply({ok:false,error:'比赛无效'},409);
   if(r.used){const previous=await env.DB.prepare('SELECT points FROM game_score_details WHERE run_id=?').bind(r.id).first();return previous?reply({ok:true,alreadySaved:true,points:previous.points}):reply({ok:false,error:'比赛无效'},409);}
   const m=await env.DB.prepare('SELECT * FROM game_run_meta WHERE run_id=?').bind(r.id).first();if(!m)return reply({ok:false,error:'旧版比赛只能查看历史成绩'},409);
   let ids;try{ids=validateFinish(b,r,m,now);}catch(e){return reply({ok:false,error:e.message},400);}
   let correct=0;for(const a of b.answers)if(await sha(a.answer)===answerHash(a.id))correct++;
   const total=ids.length,points=Math.round((total?correct/total:0)*600)+m.laps*50+Math.min(b.hits,5)*20;
   const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO game_scores SELECT id,user_id,track,diff,study,grade,subject,?,?,?, ?,? FROM game_runs WHERE id=? AND user_id=? AND used=0').bind(b.ms,correct,total,m.rules,now,r.id,me.id),
    env.DB.prepare('INSERT INTO game_score_details SELECT id,?,?,? FROM game_runs WHERE id=? AND user_id=? AND used=0').bind(m.laps,b.hits,points,r.id,me.id),
    env.DB.prepare('UPDATE game_runs SET used=1 WHERE id=? AND user_id=?').bind(r.id,me.id)]);
   return reply({ok:true,alreadySaved:!result[0].meta.changes,points,correct,total});
  }
  return reply({ok:false,error:'接口不存在'},404);
 }catch(e){return reply({ok:false,error:e instanceof SyntaxError?'请求格式无效':'服务暂时不可用，请重试'},e instanceof SyntaxError?400:503);}
}};
