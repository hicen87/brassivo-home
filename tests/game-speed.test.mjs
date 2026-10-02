import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../block-kart/index.html',import.meta.url),'utf8');
test('fastest kart cruises at 170 KM/H and boosts to 200 KM/H, with boosts capped and difficulty and grass still effective',()=>{
 const scope={G:{diff:2,tr:{N:100}},Math,emit(){},useItem(){},sfx(){}};vm.createContext(scope);
 vm.runInContext(html.slice(html.indexOf('const B = 3,'),html.indexOf('/* ================= device & quality'))+html.slice(html.indexOf('const NOIN ='),html.indexOf('  // drift & steering'))+'}',scope);
 const run=(diff,boost,lat=0)=>{scope.G.diff=diff;scope.k={ch:vm.runInContext('CHARS[4]',scope),isPlayer:true,speed:0,lat,boostT:boost,spinT:0,rollT:0};for(let i=0;i<3600;i++)vm.runInContext('updateKart(k,{thr:1,brk:false},1/60)',scope);return scope.k.speed*3.2;};
 assert(Math.abs(run(2,0)-170)<1e-8);assert(Math.abs(run(2,1000)-200)<1e-8);assert(run(1,0)<170);assert(run(0,0)<run(1,0));assert(run(2,0,20)<100);
});

test('AI opponents are stronger in all three difficulties while respecting the 200 KM/H cap',()=>{
 const scope={G:{diff:0,tr:{N:100}},Math,emit(){},useItem(){},sfx(){}};vm.createContext(scope);
 vm.runInContext(html.slice(html.indexOf('const B = 3,'),html.indexOf('/* ================= device & quality'))+html.slice(html.indexOf('const NOIN ='),html.indexOf('  // drift & steering'))+'}',scope);
 for(let diff=0;diff<3;diff++){
  scope.G.diff=diff;
  const run=(isPlayer,old=false)=>{scope.k={ch:vm.runInContext('CHARS[4]',scope),isPlayer,speed:0,lat:0,boostT:0,spinT:0,rollT:0,aiMul:vm.runInContext('DIFFS[G.diff].ai',scope)/(old?1.5:1)};for(let i=0;i<3600;i++)vm.runInContext('updateKart(k,{thr:1,brk:false},1/60)',scope);return scope.k.speed*3.2;};
  const ai=run(false);assert(ai>run(false,true));assert(ai>run(true));assert(ai<=200+1e-8);
 }
});
