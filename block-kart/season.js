var KartSeason;
(function(root){
'use strict';
const RULES='kart-english-20261003',TRACKS='equal1300-lines-v3',BANK='english-skills-20261003';
function week(date=new Date()){const d=new Date(date);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10);}
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function valid(c){return c&&c.v===RULES&&Number.isInteger(c.track)&&c.track>=0&&c.track<3&&Number.isInteger(c.diff)&&c.diff>=0&&c.diff<3&&Number.isInteger(c.grade)&&c.grade>=1&&c.grade<=6&&['race','quick','practice','weekly','friend'].includes(c.mode)&&c.study===true&&c.subject==='english'&&Number.isInteger(c.seed)&&c.seed>=0&&c.seed<=4294967295;}
function encode(c){if(!valid(c))throw Error('挑战设置无效');return 'BK2-'+btoa(JSON.stringify(c)).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');}
function decode(code){try{if(typeof code!=='string'||!code.startsWith('BK2-')||code.length>800)return null;const c=JSON.parse(atob(code.slice(4).replace(/-/g,'+').replace(/_/g,'/')));return valid(c)?c:null;}catch{return null;}}
function weekly(grade,date=new Date()){const w=week(date);return {v:RULES,mode:'weekly',track:hash(w)%3,diff:1,study:true,grade:Number(grade),subject:'english',seed:hash(w+':'+grade),week:w};}
KartSeason=root.KartSeason={RULES,TRACKS,BANK,week,hash,rng,encode,decode,weekly,laps:mode=>['quick','practice'].includes(mode)?1:6,key:c=>[RULES,c.mode||'race',c.track,c.diff,c.study?c.grade:0,c.study?c.subject:'none',c.mode==='weekly'||c.mode==='friend'?c.seed:0].join('_')};
})(globalThis);
