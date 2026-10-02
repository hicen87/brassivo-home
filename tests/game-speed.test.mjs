import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../block-kart/index.html',import.meta.url),'utf8');
test('fastest kart cruises at 170 KM/H and boosts to 200 KM/H, with boosts capped and difficulty and grass still effective',()=>{
 const scope={G:{diff:2,tr:{N:100}},Math,emit(){},useItem(){},sfx(){}};vm.createContext(scope);
 vm.runInContext(html.slice(html.indexOf('const B = 3,'),html.indexOf('/* ================= device & quality'))+html.slice(html.indexOf('const NOIN ='),html.indexOf('  // drift & steering'))+'}',scope);
 const run=(diff,boost,lat=0)=>{scope.G.diff=diff;scope.k={ch:vm.runInContext('CHARS[4]',scope),isPlayer:true,speed:0,lat,boostT:boost,spinT:0,rollT:0};for(let i=0;i<3600;i++)vm.runInContext('updateKart(k,{thr:1,brk:false},1/60)',scope);return scope.k.speed*3.2;};
 assert(Math.abs(run(2,0)-170)<1e-8);assert(Math.abs(run(2,1000)-200)<1e-8);assert(run(1,0)<170);assert(run(0,0)<run(1,0));assert(run(2,0,20)<100);
});

test('player and AI have identical acceleration and limits in every difficulty and status',()=>{
 const scope={G:{diff:0,tr:{N:100}},Math,emit(){},useItem(){},sfx(){}};vm.createContext(scope);
 vm.runInContext(html.slice(html.indexOf('const B = 3,'),html.indexOf('/* ================= device & quality'))+html.slice(html.indexOf('const NOIN ='),html.indexOf('  // drift & steering'))+'}',scope);
 for(let diff=0;diff<3;diff++)for(const status of [{},{boostT:1000},{lat:20},{freezeT:1000},{smokeT:1000}]){
  scope.G.diff=diff;
  const run=isPlayer=>{scope.k={ch:vm.runInContext('CHARS[4]',scope),isPlayer,speed:0,lat:0,boostT:0,spinT:0,rollT:0,aiMul:99,...status};const speeds=[];for(let i=0;i<3600;i++){vm.runInContext('updateKart(k,{thr:1,brk:false},1/60)',scope);if(i===59||i===3599)speeds.push(scope.k.speed*3.2);}return speeds;};
  assert.deepEqual(run(false),run(true),JSON.stringify({diff,status}));
 }
 assert(!html.includes('k.aiMul'));
});
test('all six car styles share acceleration, top speed, handling and collision weight',()=>{
 const scope={G:{diff:2,tr:{N:100}},Math,emit(){},useItem(){},sfx(){}};vm.createContext(scope);
 vm.runInContext(html.slice(html.indexOf('const B = 3,'),html.indexOf('/* ================= device & quality'))+html.slice(html.indexOf('const NOIN ='),html.indexOf('  // drift & steering'))+'}',scope);
 const cars=vm.runInContext('CHARS',scope),samples=[];
 for(const ch of cars){scope.k={ch,isPlayer:true,speed:0,lat:0,boostT:0,spinT:0,rollT:0};const speeds=[];for(let i=0;i<3600;i++){vm.runInContext('updateKart(k,{thr:1,brk:false},1/60)',scope);if(i===59||i===3599)speeds.push(scope.k.speed);}samples.push(speeds);assert.equal(ch.hnd,1);assert.equal(ch.w,1);}
 assert.equal(cars.length,6);for(const sample of samples)assert.deepEqual(sample,samples[0]);assert.equal(new Set(cars.map(c=>c.color)).size,6);assert(!html.includes('id="charStats"'));
});
