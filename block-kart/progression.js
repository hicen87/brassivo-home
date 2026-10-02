var KartProgressFactory;
(function(root){
'use strict';
const KEY='bk_learning_progress_v2';
function create(storage,clock=Date.now){
 function read(){try{const s=JSON.parse(storage.getItem(KEY));if(s?.version===2)return s;}catch{}return {version:2,xp:0,runs:0,topics:{},wrong:[],metrics:{},days:[],reports:[]};}
 function write(s){try{storage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
 function answer(q,correct,{review=false}={}){const s=read(),key=q.grade+':'+q.subject+':'+(q.topic||q.family||'综合');const t=s.topics[key]||{grade:q.grade,subject:q.subject,name:q.topic||q.family||'综合',correct:0,total:0,streak:0};t.total++;t.correct+=Number(correct);t.streak=correct?t.streak+1:0;s.topics[key]=t;
  const old=s.wrong.find(x=>x.q.id===q.id);if(!correct){const x=old||{q,misses:0};x.q=q;x.misses++;x.due=s.runs+3;x.resolved=false;if(!old)s.wrong.push(x);}else if(old){old.due=s.runs+5;old.resolved=true;}
  if(correct&&!review)s.xp+=10;s.wrong=s.wrong.slice(-100);write(s);return s;
 }
 function finish(){const s=read();s.runs++;s.xp+=20;write(s);return s;}
 function event(name,value=1){const s=read();s.metrics[name]=(s.metrics[name]||0)+value;const day=new Date(clock()).toISOString().slice(0,10);if(!s.days.includes(day))s.days.push(day);s.days=s.days.slice(-30);write(s);root.KartTelemetry?.record(name);}
 function due(grade,subject){const s=read();return s.wrong.filter(x=>!x.resolved&&x.due<=s.runs&&x.q.grade===Number(grade)&&(subject==='all'?x.q.subject!=='olympiad':x.q.subject===subject));}
 const cosmetics=[{id:'classic',name:'原色',xp:0,color:null},{id:'sky',name:'晴空蓝',xp:100,color:0x56b8eb},{id:'pink',name:'樱花粉',xp:300,color:0xed83b4},{id:'gold',name:'冠军金',xp:600,color:0xecc14f}];
 return {read,answer,finish,event,due,cosmetics,title:s=>s.xp>=600?'复习达人':s.xp>=300?'弯道学者':s.xp>=100?'学习车手':'新车手',report(q,reason){const s=read();const id=root.crypto?.randomUUID?.()||String(clock());s.reports.push({id,questionId:q.id,reason,bank:root.KartSeason.BANK});s.reports=s.reports.slice(-20);if(!write(s))throw Error('本机反馈保存失败，请检查存储空间');return id;},removeReport(id){const s=read();s.reports=s.reports.filter(x=>x.id!==id);write(s);}};
}
KartProgressFactory=root.KartProgressFactory=create;
})(globalThis);
