(function(root){
  let bank=null;const histories=new Map();
  async function load(){if(!bank){const r=await fetch('question-bank.json?v=20261002-expanded-v3',{signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('题库加载失败');bank=await r.json();}return bank;}
  function question(grade=1,subject='all',random=Math.random){
    if(!bank)throw Error('题库尚未加载');
    const allowed=KartSubjects.available(grade);
    let pool=bank.questions.filter(q=>q.grade===Number(grade)&&allowed.includes(q.subject)&&(subject==='all'||q.subject===subject));
    if(!pool.length)throw Error('该题库暂时没有题目');
    const key=Number(grade)+':'+subject;let recent=histories.get(key)||[];
    let fresh=pool.filter(q=>!recent.includes(q.id));
    if(!fresh.length){const last=recent.at(-1);recent=[];fresh=pool.filter(q=>pool.length===1||q.id!==last);}
    const q=fresh[Math.floor(random()*fresh.length)];recent.push(q.id);histories.set(key,recent);
    const options=q.options.slice();for(let i=options.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
    return {...q,options,subjectName:bank.subjects[q.subject]};
  }
  root.KartLearning={load,question};
})(typeof window==='undefined'?globalThis:window);
