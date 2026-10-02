const VERSION='composite-v1';
const SUBJECTS=['all','math','olympiad','english','chinese','science','ethics','music','art','pe','labor','it','practice','local'];
const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function sha(v){return hex(await crypto.subtle.digest('SHA-256',enc.encode(v)));}
async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
function equal(a,b){let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;}
function config(body){const {track,diff}=body;if(!Number.isInteger(track)||track<0||track>2||!Number.isInteger(diff)||diff<0||diff>2)throw Error('赛道或难度无效');const study=body.study===true;const grade=study?Number(body.grade):0,subject=study?body.subject:'none';if(study&&(!Number.isInteger(grade)||grade<1||grade>6||!SUBJECTS.includes(subject)))throw Error('年级或科目无效');return {track,diff,study:study?1:0,grade,subject};}
const schema=[
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
 if(path==='/health')return reply({ok:true,version:VERSION});
 if(!env.DB)return reply({ok:false,error:'游戏存储未配置'},503);
 try{
  if(!ready)ready=env.DB.batch(schema.map(sql=>env.DB.prepare(sql))).catch(e=>{ready=null;throw e;});await ready;
  const now=Date.now();
  if(Math.random()<0.01)await env.DB.batch([env.DB.prepare('DELETE FROM game_limits WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM game_sessions WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM game_runs WHERE started<?').bind(now-86400000)]);
  if(req.method==='POST'){
   if(!allowed.includes(origin))return reply({ok:false,error:'请求来源无效'},403);
   if(Number(req.headers.get('Content-Length')||0)>4096)return reply({ok:false,error:'请求过大'},413);
   if(!req.headers.get('Content-Type')?.includes('application/json'))return reply({ok:false,error:'请求格式无效'},415);
   const ip=req.headers.get('CF-Connecting-IP')||'unknown';const auth=path==='/register'||path==='/login';const key=await sha(ip)+':'+(auth?'auth':'write')+':'+Math.floor(now/60000);
   const rate=await env.DB.prepare('INSERT INTO game_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+120000).first();
   if(rate.count>(auth?10:60))return reply({ok:false,error:'操作频繁，请稍后重试'},429);
  }
  const cookie=req.headers.get('Cookie')||'';const token=(cookie.match(/(?:^|;\s*)game_session=([a-f0-9]{64})(?:;|$)/)||[])[1];
  const me=token?await env.DB.prepare('SELECT u.id,u.username FROM game_sessions s JOIN game_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?').bind(await sha(token),now).first():null;
  if(path==='/me'&&req.method==='GET')return reply({ok:true,user:me?{username:me.username}:null});
  if((path==='/register'||path==='/login')&&req.method==='POST'){
   const raw=await req.text();if(raw.length>4096)return reply({ok:false,error:'请求过大'},413);const b=JSON.parse(raw),username=String(b.username||'').trim().toLowerCase(),password=b.password;
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
  if(path==='/leaderboard'&&req.method==='GET'){
   const c=config({track:Number(url.searchParams.get('track')),diff:Number(url.searchParams.get('diff')),study:url.searchParams.get('study')==='1',grade:Number(url.searchParams.get('grade')),subject:url.searchParams.get('subject')});
   const results=await env.DB.prepare('SELECT username,ms,correct,total,created,laps,hits,points FROM (SELECT u.username,s.ms,s.correct,s.total,s.created,d.laps,d.hits,d.points,ROW_NUMBER() OVER(PARTITION BY s.user_id ORDER BY d.points DESC,s.ms,s.created) AS rn FROM game_scores s JOIN game_users u ON u.id=s.user_id JOIN game_score_details d ON d.run_id=s.run_id WHERE version=? AND track=? AND diff=? AND study=? AND grade=? AND subject=?) WHERE rn=1 ORDER BY points DESC,ms,created LIMIT 50').bind(VERSION,c.track,c.diff,c.study,c.grade,c.subject).all();return reply({ok:true,rows:results.results});
  }
  if(path==='/scores'&&req.method==='GET'){if(!me)return reply({ok:false,error:'请先登录'},401);const r=await env.DB.prepare('SELECT track,diff,study,grade,subject,MIN(ms) AS ms FROM game_scores WHERE user_id=? AND version=? GROUP BY track,diff,study,grade,subject ORDER BY ms LIMIT 200').bind(me.id,VERSION).all();return reply({ok:true,rows:r.results});}
  if(path==='/runs'&&req.method==='POST'){
   if(!me)return reply({ok:false,error:'请先登录'},401);const body=await req.json();if(body.laps!==6)return reply({ok:false,error:'请刷新到6圈新版再开始比赛'},400);const c=config(body),id='6lap-'+crypto.randomUUID();await env.DB.prepare('INSERT INTO game_runs(id,user_id,track,diff,study,grade,subject,started) VALUES(?,?,?,?,?,?,?,?)').bind(id,me.id,c.track,c.diff,c.study,c.grade,c.subject,now).run();return reply({ok:true,runId:id});
  }
  if(path==='/finish'&&req.method==='POST'){
   if(!me)return reply({ok:false,error:'请先登录'},401);const b=await req.json(),r=await env.DB.prepare('SELECT * FROM game_runs WHERE id=? AND user_id=?').bind(b.runId,me.id).first();
   if(!r||r.used||!r.id.startsWith('6lap-'))return reply({ok:false,error:'比赛无效或已提交'},409);
   if(!Number.isInteger(b.ms)||b.ms<20000||b.ms>3600000||b.ms>now-r.started+1500||now-r.started>7200000)return reply({ok:false,error:'成绩时间无效'},400);
   const total=b.total,correct=b.correct;if(!Number.isInteger(total)||!Number.isInteger(correct)||total<0||total>500||correct<0||correct>total||(!r.study&&(total!==0||correct!==0)))return reply({ok:false,error:'答题统计无效'},400);
   const laps=b.laps,hits=b.hits;if(laps!==6||!Number.isInteger(hits)||hits<0||hits>500)return reply({ok:false,error:'圈数或击倒统计无效'},400);
   const points=Math.round((total?correct/total:0)*600)+laps*50+Math.min(hits,5)*20;
   const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO game_scores SELECT id,user_id,track,diff,study,grade,subject,?,?,?, ?,? FROM game_runs WHERE id=? AND user_id=? AND used=0').bind(b.ms,correct,total,VERSION,now,r.id,me.id),
    env.DB.prepare('INSERT INTO game_score_details SELECT id,?,?,? FROM game_runs WHERE id=? AND user_id=? AND used=0').bind(laps,hits,points,r.id,me.id),
    env.DB.prepare('UPDATE game_runs SET used=1 WHERE id=? AND user_id=?').bind(r.id,me.id)]);
   if(!result[0].meta.changes)return reply({ok:false,error:'成绩已提交'},409);return reply({ok:true});
  }
  return reply({ok:false,error:'接口不存在'},404);
 }catch(e){return reply({ok:false,error:e instanceof SyntaxError?'请求格式无效':'服务暂时不可用，请重试'},e instanceof SyntaxError?400:503);}
}};
