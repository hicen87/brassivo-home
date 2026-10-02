(function(root){
  let bank=null;const histories=new Map(),gradeRecent=new Map(),pools=new Map(),vectors=new Map();
  const BANK_VERSION='20261002-readable-v7';
  const VERSION='20261002-diverse-v6',STORAGE='bk_question_history_v6';
  function restore(){try{const saved=JSON.parse(root.localStorage.getItem(STORAGE)||'null');if(saved?.version!==VERSION)return;for(const [k,v] of Object.entries(saved.histories||{}))if(Array.isArray(v.ids)&&Array.isArray(v.recent))histories.set(k,v);for(const [g,v] of Object.entries(saved.gradeRecent||{}))if(Array.isArray(v))gradeRecent.set(g,v);}catch(_){}}
  function save(){try{root.localStorage.setItem(STORAGE,JSON.stringify({version:VERSION,histories:Object.fromEntries(histories),gradeRecent:Object.fromEntries(gradeRecent)}));}catch(_){}}
  async function load(){if(!bank){const r=await fetch('question-bank.json?v='+BANK_VERSION,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('题库加载失败');bank=await r.json();restore();}return bank;}
  function pool(grade,subject){
    const key=Number(grade)+':'+subject;if(pools.has(key))return pools.get(key);
    const allowed=KartSubjects.available(grade);
    const items=bank.questions.filter(q=>q.grade===Number(grade)&&allowed.includes(q.subject)&&(subject==='all'?q.subject!=='olympiad':q.subject===subject));
    pools.set(key,items);return items;
  }
  function vector(q){
    if(vectors.has(q.id))return vectors.get(q.id);
    const text=q.text.toLowerCase().replace(/\d+(?:\.\d+)?/g,'#').replace(/\b(?:amy|ben|lily|tom|lucy|sam|anna|mike|kate|jack|sarah|john)\b/g,'person').replace(/小[明红华丽刚军]/g,'某人');
    const tokens=new Set(text.match(/[a-z]+|[\u4e00-\u9fff]{1,}/g)?.flatMap(t=>/^[a-z]+$/.test(t)?(["the","a","an","is","are","it","of","to","in","and","which","what"].includes(t)?[]:[t]):Array.from({length:Math.max(0,t.length-1)},(_,i)=>t.slice(i,i+2)))||[]);
    vectors.set(q.id,tokens);return tokens;
  }
  function similarity(a,b){const x=vector(a),y=vector(b);let common=0;for(const t of x)if(y.has(t))common++;return x.size+y.size?2*common/(x.size+y.size):0;}
  function question(grade=1,subject='all',random=Math.random){
    if(!bank)throw Error('题库尚未加载');
    const items=pool(grade,subject);if(!items.length)throw Error('该题库暂时没有题目');
    const key=Number(grade)+':'+subject,byId=new Map(items.map(q=>[q.id,q]));
    const history=histories.get(key)||{ids:[],recent:[]};history.ids=history.ids.filter(id=>byId.has(id));
    const seen=new Set(history.ids);let fresh=items.filter(q=>!seen.has(q.id));
    if(!fresh.length){const last=history.recent.at(-1);history.ids=[];fresh=items.filter(q=>items.length===1||q.id!==last);}
    const across=gradeRecent.get(String(Number(grade)))||[];
    const recentIds=[...new Set([...history.recent,...across])];
    const recent=recentIds.map(id=>bank.questions.find(q=>q.id===id)).filter(Boolean);
    const novel=fresh.filter(q=>!recent.some(old=>q.id===old.id||q.family&&q.family===old.family||similarity(q,old)>=.55));
    let candidates=novel;
    if(!candidates.length){const scored=fresh.map(q=>({q,score:Math.max(0,...recent.map(old=>similarity(q,old)+((q.family&&q.family===old.family)? .5 : 0)))}));const min=Math.min(...scored.map(x=>x.score));candidates=scored.filter(x=>x.score<=min+.03).map(x=>x.q);}
    // Balance knowledge groups, then favor reasoning difficulty without shrinking the pool.
    const families=[...new Set(candidates.map(q=>q.family||q.id))];
    const family=families[Math.min(families.length-1,Math.floor(random()*families.length))];
    candidates=candidates.filter(q=>(q.family||q.id)===family);
    const weights=candidates.map(q=>q.level>=2?2:1);let ticket=random()*weights.reduce((a,b)=>a+b,0),q=candidates.at(-1);
    for(let i=0;i<candidates.length;i++){ticket-=weights[i];if(ticket<0){q=candidates[i];break;}}
    history.ids.push(q.id);history.recent=[...history.recent,q.id].slice(-6);histories.set(key,history);
    gradeRecent.set(String(Number(grade)),[...across,q.id].slice(-6));save();
    const options=q.options.slice();for(let i=options.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[options[i],options[j]]=[options[j],options[i]];}
    return {...q,options,subjectName:bank.subjects[q.subject]};
  }
  function poolInfo(grade=1,subject='all'){if(!bank)return {count:0,topics:0};const items=pool(grade,subject);return {count:items.length,topics:new Set(items.map(q=>q.family||q.id)).size};}
  root.KartLearning={load,question,poolInfo};
})(typeof window==='undefined'?globalThis:window);
