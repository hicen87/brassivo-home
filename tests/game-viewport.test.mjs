import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../block-kart/index.html',import.meta.url),'utf8');
test('drawing buffer and camera follow actual stage through delayed rotation and zero sizes',()=>{
 let bounds={width:1280,height:588},size,updates=0;
 const scope={$:()=>({getBoundingClientRect:()=>bounds}),Math,renderer:{setSize:(w,h)=>size=[w,h]},camera:{updateProjectionMatrix:()=>updates++},G:{}};
 vm.createContext(scope);vm.runInContext(html.slice(html.indexOf('function resize()'),html.indexOf("window.addEventListener('resize', resize)")),scope);
 scope.resize();assert.deepEqual(size,[1280,588]);assert.equal(scope.camera.aspect,1280/588);
 bounds={width:390,height:844};scope.resize();assert.equal(scope.G.baseFov,82);
 bounds={width:844,height:390};scope.resize();assert.deepEqual(size,[844,390]);assert.equal(scope.camera.aspect,844/390);assert.equal(scope.G.baseFov,68);
 bounds={width:0,height:0};scope.resize();assert.deepEqual(size,[1,1]);assert.equal(updates,4);
});
