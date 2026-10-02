import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../block-kart/index.html',import.meta.url),'utf8');
test('incoming-target warning hints the exact shield slot and clears on pause, expiry or loss of target',()=>{
 const nodes={'#missileWarning':{hidden:true},'#missileWarningText':{textContent:''}};const p={item:'spring',itemQueue:['shield','smoke']};const scope={G:{state:'race',paused:false,player:p,study:true,touch:false},world:{missiles:[]},$:id=>nodes[id],heldItems:k=>[k.item,...k.itemQueue]};vm.createContext(scope);vm.runInContext(html.slice(html.indexOf('function updateMissileWarning()'),html.indexOf('function updateHud(dt)')),scope);
 const update=()=>vm.runInContext('updateMissileWarning()',scope);update();assert(nodes['#missileWarning'].hidden);
 const m={target:p,owner:{},life:5};scope.world.missiles=[m];update();assert(!nodes['#missileWarning'].hidden);assert(nodes['#missileWarningText'].textContent.includes('按 O'));
 p.shieldT=8;update();assert(nodes['#missileWarningText'].textContent.includes('已开启'));p.shieldT=0;scope.G.touch=true;update();assert(nodes['#missileWarningText'].textContent.includes('道具按钮'));
 for(const condition of ['pause','expired','otherTarget','finished','results']){scope.G.paused=condition==='pause';scope.G.state=condition==='results'?'results':'race';p.finished=condition==='finished';m.life=condition==='expired'?0:5;m.target=condition==='otherTarget'?{}:p;update();assert(nodes['#missileWarning'].hidden,condition);}
});
