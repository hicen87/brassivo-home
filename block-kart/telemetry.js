var KartTelemetry;
/* Optional aggregate counters. No account, answer, IP, persistent visitor ID or movement data in payload. */
(function(root){
'use strict';const KEY='bk_anonymous_metrics_v1';let busy=false;
function read(){try{return JSON.parse(localStorage.getItem(KEY))||{days:[],pending:[]};}catch{return {days:[],pending:[]};}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
function record(name){if(localStorage.getItem('bk_metrics_optin')!=='true'||!['start','finish','second_race','save_fail'].includes(name))return;const s=read(),day=new Date().toISOString().slice(0,10);if(name==='start'&&!s.days.includes(day)){const first=s.first||s.days[0],days=first?Math.round((Date.parse(day)-Date.parse(first))/86400000):0;s.pending.push({id:crypto.randomUUID(),day,event:days===1?'return_d1':days===7?'return_d7':first?'active_day':'new_player',cohort:first||day});s.first=first||day;s.days.push(day);s.days=s.days.slice(-30);}s.pending.push({id:crypto.randomUUID(),day,event:name,cohort:s.first||s.days[0]||day});s.pending=s.pending.slice(-100);write(s);}
async function flush(){if(busy||localStorage.getItem('bk_metrics_optin')!=='true')return;const s=read();if(!s.pending.length)return;busy=true;const batch=s.pending.slice(0,20);try{await GameAPI.call('/metrics',{events:batch});const current=read(),ids=new Set(batch.map(x=>x.id));current.pending=current.pending.filter(x=>!ids.has(x.id));write(current);}catch{}finally{busy=false;}}
KartTelemetry=root.KartTelemetry={record,flush};root.addEventListener('online',flush);setInterval(flush,30000);
})(globalThis);
