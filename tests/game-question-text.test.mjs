import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const bank=JSON.parse(fs.readFileSync(new URL('../block-kart/question-bank.json',import.meta.url)));
test('every grade and subject has readable stems, answers, choices and explanations',()=>{
 for(const q of bank.questions)for(const field of ['text','answer','options','explanation'])for(const text of Array.isArray(q[field])?q[field]:[q[field]]){
  assert(!/[\u0000-\u001f\u007f-\u009f\ufffd]|\\[a-zA-Z%_]|[{}^]|\$[^$]+\$/u.test(text),`${q.id}/${field}: ${JSON.stringify(text)}`);
  assert(!/\p{Private_Use}|\p{Surrogate}/u.test(text),q.id);
 }
});
test('math importer preserves division, fractions, degrees, placeholders, recurring decimals and currency',()=>{
 const script=String.raw`import sys
sys.path.insert(0,'tools')
from question_text import readable,validate
cases=[('$12 \\div 3$','12 ÷ 3'),('$72 \bdiv 9$','72 ÷ 9'),('$2 \times 3$','2 × 3'),('$13 - 6 = \text{?}$','13 - 6 = ?'),('$90^{\\circ}$','90°'),('$a^{3}$','a³'),('$\\frac{1}{8}$','(1/8)'),('$4 \x0crac{1}{2}$','4 (1/2)'),('$\\frac{1+2}{3}$','(1+2)/(3)'),('$2 \bigcirc 5$','2 ○ 5'),('$0.4\bdot{8}\bdot{1}$','0.481（循环节81）'),('It\'s $20.','It\'s $20.'),('$10 \x00 3$','10 ÷ 3')]
for raw,expected in cases:
 assert readable(raw)==expected,(repr(raw),readable(raw),expected)
 validate(readable(raw))
try: validate(readable('$\\unknown{3}$'))
except AssertionError: pass
else: raise AssertionError('unknown formula accepted')
`;
 execFileSync('python3',['-c',script],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
});
test('reviewed source errors no longer contradict their answer',()=>{
 const q=bank.questions.find(q=>q.id==='licensed-g3up-u4-kp1-5');assert.equal(q.answer,'205 + 396');assert.equal(q.options.filter(x=>x.split('+').map(Number).reduce((a,b)=>a+b)>600).length,1);
 assert(bank.questions.find(q=>q.id==='licensed-g6down-u4-kp2-1').explanation.includes('底 × 高 ÷ 2'));
 assert(bank.questions.find(q=>q.id==='licensed-g6down-u4-kp2-3').explanation.includes('图上距离 ÷ 实际距离'));
});
