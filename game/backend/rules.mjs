import manifest from './question-manifest.json' with {type:'json'};
export const VERSION='kart-s2-20261002',TRACK_VERSION='equal1758-lines-v2',BANK_VERSION='20261002-readable-v7';
export const SUBJECTS=['all','math','olympiad','english','chinese','science','ethics','music','art','pe','labor','it','practice'];
export function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function week(now){const d=new Date(now);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10);}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function validQuestion(id,c){const q=manifest[id];return !!q&&q[0]===c.grade&&(c.subject==='all'?q[1]!=='olympiad':q[1]===c.subject)&&(c.grade>=3||!['english','it'].includes(q[1]));}
export function playlist(c,count,seed){const items=Object.keys(manifest).filter(id=>validQuestion(id,c)),random=rng(seed),used=new Set(),out=[];while(out.length<count&&items.length){const novel=items.filter(id=>!used.has(manifest[id][3]));const choices=novel.length?novel:items;const id=choices[Math.floor(random()*choices.length)];out.push(id);used.add(manifest[id][3]);items.splice(items.indexOf(id),1);}return out;}
export function answerHash(id){return manifest[id]?.[2];}
export function validateFinish(b,r,m,now){
 if(m.rules!==VERSION||m.track_version!==TRACK_VERSION||m.bank!==BANK_VERSION||b.rules!==VERSION)throw Error('比赛版本不一致');
 if(now>m.expires)throw Error('比赛已过保存期限');
 if(!Number.isInteger(b.ms)||b.ms<m.laps*19000||b.ms>3600000||b.ms>now-r.started+1500)throw Error('成绩时间无效');
 if(b.laps!==m.laps||!Number.isInteger(b.hits)||b.hits<0||b.hits>m.laps*20)throw Error('圈数或击倒统计无效');
 if(!Array.isArray(b.lapTimes)||b.lapTimes.length!==m.laps||b.lapTimes.some(t=>!Number.isInteger(t)||t<19000)||Math.abs(b.lapTimes.reduce((a,t)=>a+t,0)-b.ms)>1000)throw Error('圈速数据无效');
 const ids=JSON.parse(m.questions);
 if(!Array.isArray(b.answers)||b.answers.length!==ids.length||b.answers.some((a,i)=>a.id!==ids[i]||typeof a.answer!=='string'||a.answer.length>500))throw Error('答题记录无效');
 return ids;
}
