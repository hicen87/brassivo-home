(function(root){
  let bank=null, recent=[];
  async function load(){if(!bank){const r=await fetch('question-bank.json?v=20261002');if(!r.ok)throw Error('题库加载失败');bank=await r.json();}return bank;}
  function question(grade=1,subject='all',random=Math.random){
    if(!bank)throw Error('题库尚未加载');
    let pool=bank.questions.filter(q=>q.grade===Number(grade)&&(subject==='all'||q.subject===subject));
    if(!pool.length)throw Error('该题库暂时没有题目');
    let fresh=pool.filter(q=>!recent.includes(q.id));if(!fresh.length){recent=[];fresh=pool;}
    const q=fresh[Math.floor(random()*fresh.length)];recent.push(q.id);if(recent.length>30)recent.shift();
    const options=q.options.slice();for(let i=options.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
    return {...q,options,subjectName:bank.subjects[q.subject]};
  }
  root.KartLearning={load,question};
})(typeof window==='undefined'?globalThis:window);
