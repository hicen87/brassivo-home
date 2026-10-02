var KartSaveFactory;
(function(root){
'use strict';
function create(storage,api,clock=Date.now){
 const key='bk_pending_scores_v2';let busy=false;
 function read(){try{return JSON.parse(storage.getItem(key)||'[]').filter(x=>x&&x.body?.runId).slice(-50);}catch{return [];}}
 function write(rows){storage.setItem(key,JSON.stringify(rows));}
 function enqueue(username,body){const rows=read();if(!rows.some(x=>x.body.runId===body.runId)){rows.push({username,body,created:clock(),attempts:0});write(rows);}return rows.length;}
 async function flush(username){if(busy||!username)return {pending:read().filter(x=>x.username===username).length};busy=true;let saved=0,error='';try{for(const item of read().filter(x=>x.username===username&&!x.blocked)){
  try{await api.call('/finish',item.body);write(read().filter(x=>x.body.runId!==item.body.runId));saved++;}
  catch(e){error=e.message;const rows=read(),r=rows.find(x=>x.body.runId===item.body.runId);if(r){r.attempts++;r.error=e.message;if([400,409,410,422].includes(e.status))r.blocked=true;write(rows);}break;}
 }}finally{busy=false;}const pending=read().filter(x=>x.username===username).length;return {saved,pending,error};}
 return {enqueue,flush,read};
}
KartSaveFactory=root.KartSaveFactory=create;
})(globalThis);
