import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../block-kart/index.html',import.meta.url),'utf8');
test('autopilot toggle clears pressed controls and switches accessible state and touch visibility',()=>{
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v;},classList:{toggle(){}}});return nodes.get(id);};
 let cleared=0;const p={lat:4,aiDriftT:2,aiItemT:5};const scope={G:{player:p,state:'race',touch:true,autopilot:false},$:get,resetInput(){cleared++;}};vm.createContext(scope);
 vm.runInContext(html.slice(html.indexOf('function syncAutopilot()'),html.indexOf('function syncTouchControls()')),scope);
 scope.setAutopilot(true);assert.equal(scope.G.autopilot,true);assert.equal(get('#autopilotBtn').attrs['aria-pressed'],'true');assert.equal(get('#touch').hidden,false);assert.equal(p.aiLat,4);assert.equal(p.aiDriftT,0);assert.equal(p.aiItemT,0);
 scope.setAutopilot(false);assert.equal(get('#touch').hidden,false);assert.equal(get('#autopilotBtn').attrs['aria-pressed'],'false');assert.equal(cleared,2);
 scope.G.state='menu';scope.syncAutopilot();assert.equal(get('#touch').hidden,true);
});
test('automatic racing uses AI steering while keeping manual item input and keeps normal checkpoints',()=>{
 for(const autopilot of [false,true]){let manual=0,automatic=0,gates=0;const p={isPlayer:true,finished:false,along:1,lastLap:1,wrongT:0,speed:20};const scope={G:{player:p,karts:[p],state:'race',autopilot,raceTime:0,tr:{N:100},lapTimes:[],finishT:0},LAPS:1,Math,readInput(){manual++;return {thr:.5,item:true,choice:2};},aiInput(k,dt,autoItems){assert.equal(autoItems,false);automatic++;return {thr:1};},updateKart(k,inp){k.throttle=inp.thr;k.usedSlot=inp.choice;},studyLapGate(){gates++;return false;},syncKartMesh(){},interactions(){},computeOrder(){},engineSound(){},sfx(){},flash(){}};
 vm.createContext(scope);vm.runInContext(html.slice(html.indexOf('function step(dt)'),html.indexOf('/* ================= menu UI')),scope);scope.step(.1);assert.equal(manual,1);assert.equal(p.usedSlot,2);assert.equal(automatic,autopilot?1:0);assert.equal(gates,1);assert.equal(p.throttle,autopilot?1:.5);
 }
});
test('AI auto-uses held shield for an incoming missile, but never consumes items while hit or finished',()=>{
 for(const state of ['active','spin','finished','player-auto']){const used=[];const p={isPlayer:true,skill:1,aiLatT:1,aiLat:0,aiLatGoal:0,aiItemT:0,aiDriftT:0,idx:0,x:0,z:0,heading:0,speed:0,shieldT:0,spinT:state==='spin'?1:0,finished:state==='finished'};const scope={G:{diff:0,study:true,tr:{N:100,px:Array(100).fill(0),pz:Array(100).fill(10),tx:Array(100).fill(0),tz:Array(100).fill(1),th:Array(100).fill(0)},karts:[p]},DIFFS:[{ai:1.44}],world:{missiles:[{target:p,life:1}],jellies:[]},Math,BASE:50,lerp:(a,b,t)=>a+(b-a)*t,wrapAng:v=>v,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),heldItems:()=>['shield',null,null],useItem(k,i){used.push(i);},rankOf:()=>0};vm.createContext(scope);vm.runInContext(html.slice(html.indexOf('function aiInput(k, dt, autoItems=true)'),html.indexOf('const NOIN')),scope);assert.equal(scope.aiInput(p,.1,state!=='player-auto').thr,1);assert.deepEqual(used,state==='active'?[0]:[]);}
});
