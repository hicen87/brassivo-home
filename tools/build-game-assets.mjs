import fs from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),bank=JSON.parse(fs.readFileSync(new URL('block-kart/question-bank.json',root))),check=process.argv.includes('--check');
const assets=new Map();for(let grade=1;grade<=6;grade++)assets.set('block-kart/questions/grade-'+grade+'.json',JSON.stringify({...Object.fromEntries(Object.entries(bank).filter(([k])=>k!=='questions')),questions:bank.questions.filter(q=>q.grade===grade)}));
assets.set('game/backend/question-manifest.json',JSON.stringify(Object.fromEntries(bank.questions.map(q=>[q.id,[q.grade,q.subject,createHash('sha256').update(q.answer).digest('hex'),q.family||q.id]]))));
for(const [path,data] of assets){const file=new URL(path,root);if(check){if(fs.readFileSync(file,'utf8')!==data)throw Error('Generated game asset differs: '+path);}else{fs.mkdirSync(new URL('.',file),{recursive:true});fs.writeFileSync(file,data);}}
console.log(check?'Question shards and server answer manifest match canonical bank.':'Generated grade shards and server answer manifest.');
