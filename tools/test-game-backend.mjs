// Runs against a local, disposable D1 database; never creates production accounts.
import assert from 'node:assert/strict';import {VERSION,TRACK_VERSION,BANK_VERSION,playlist} from '../game/backend/rules.mjs';import {execFileSync} from 'node:child_process';import fs from 'node:fs';
const base=process.env.KART_TEST_API||'http://127.0.0.1:8788';if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))throw Error('Integration test requires local API');let cookie='';
async function call(path,body,origin='https://brassivo.com'){const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{Connection:'close',Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();return {r,j};}
const username='qa_'+Date.now(),password='Local-only-qa-2026';let x=await call('/register',{username,password});assert.equal(x.r.status,200);cookie=x.r.headers.get('set-cookie').split(';')[0];assert.equal((await call('/me')).j.user.username,username);
const c={track:0,diff:1,study:true,grade:4,subject:'english',mode:'quick',seed:123,laps:1,rules:VERSION,trackVersion:TRACK_VERSION,bank:BANK_VERSION,questionIds:playlist({grade:4,subject:'english'},2,123)};
x=await call('/runs',c);assert.equal(x.r.status,200);const id=x.j.runId;
assert.equal((await call('/runs',{...c,bank:'wrong'})).r.status,400);assert.equal((await call('/runs',{...c,questionIds:['bad','bad']})).r.status,400);
const bank=JSON.parse(fs.readFileSync(new URL('../block-kart/question-bank.json',import.meta.url))),answers=c.questionIds.map(id=>({id,answer:bank.questions.find(q=>q.id===id).answer}));
const finish={runId:id,rules:VERSION,ms:30000,lapTimes:[30000],laps:1,hits:2,answers};
assert.equal((await call('/finish',finish)).r.status,400); // Cannot finish before actual elapsed wall time.
const cli=process.env.KART_WRANGLER;if(!cli)throw Error('Set KART_WRANGLER to local wrangler executable');
// Age only this local test run so integration tests can verify a legitimate elapsed finish without sleeping.
execFileSync(cli,['d1','execute','brassivo-games-test','--local','--config','/tmp/kart-worker-test/wrangler-v2.toml','--command',`UPDATE game_runs SET started=started-60000 WHERE id='${id}'`],{stdio:'pipe'});
x=await call('/finish',{...finish,answers:answers.slice(1)});assert.equal(x.r.status,400);
x=await call('/finish',{...finish,correct:0,total:999});assert.equal(x.r.status,200);assert.equal(x.j.correct,2);assert.equal(x.j.total,2);assert.equal(x.j.points,690);
x=await call('/finish',finish);assert.equal(x.r.status,200);assert.equal(x.j.alreadySaved,true);
x=await call('/leaderboard?track=0&diff=1&study=1&grade=4&subject=english&mode=quick&version='+VERSION);assert.equal(x.r.status,200);assert(x.j.rows.some(r=>r.username===username&&r.points===690));
x=await call('/leaderboard?track=0&diff=1&study=1&grade=4&subject=english&mode=race&version='+VERSION);assert(!x.j.rows.some(r=>r.username===username));
x=await call('/question-report',{id:'qa-'+Date.now(),questionId:answers[0].id,reason:'题意不清',bank:BANK_VERSION});assert.equal(x.r.status,200);
assert.equal((await call('/scores')).r.status,200);
const event={id:crypto.randomUUID(),day:new Date().toISOString().slice(0,10),cohort:new Date().toISOString().slice(0,10),event:'start'};assert.equal((await call('/metrics',{events:[event]})).r.status,200);assert.equal((await call('/metrics',{events:[event]})).r.status,200);assert.equal((await call('/metrics',{events:[{...event,event:'private'}]})).r.status,400);assert((await call('/metrics-summary')).j.rows.length);
assert.equal((await call('/runs',c,'https://example.com')).r.status,403);await call('/logout',{});cookie='';assert.equal((await call('/finish',finish)).r.status,401);
console.log('Local D1 auth, version isolation, issued questions, server answer grading, elapsed/lap validation, idempotent retry, boards, report and CORS passed.');
