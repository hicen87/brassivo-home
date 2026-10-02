import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
function setup(){
 const scheduled=[],intervals=new Map();let nextId=0;
 const param=()=>({value:0,setValueAtTime(v,t){scheduled.push({v,t});},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
 const node=()=>({gain:param(),frequency:param(),connect(){},disconnect(){},start(t){scheduled.push({start:t});},stop(){}});
 const ctx={currentTime:0,sampleRate:8000,state:'running',destination:{},createGain:node,createOscillator:node,createBiquadFilter:node,createBufferSource:node,createBuffer:(_c,n)=>({getChannelData:()=>new Float32Array(n)})};
 const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('../block-kart/music.js',import.meta.url),'utf8'),scope);
 const music=scope.KartMusicFactory({random:()=>.1,setTimer:fn=>{intervals.set(++nextId,fn);return nextId;},clearTimer:id=>intervals.delete(id)});
 const advance=seconds=>{for(let i=0;i<seconds*20;i++){ctx.currentTime+=.05;for(const fn of intervals.values())fn();}};
 return {music,ctx,scheduled,intervals,advance};
}
test('music waits for a supplied audio context, starts one scheduler and pauses cleanly',()=>{const {music,ctx,scheduled,intervals}=setup();music.start();assert.equal(music.status().playing,false);music.attach(ctx);music.start();music.start();assert.equal(intervals.size,1);assert(scheduled.some(x=>x.start>=0));assert(music.tracks.some(t=>t.name===music.status().track));music.stop();assert.equal(intervals.size,0);assert.equal(music.status().playing,false);music.start();assert.equal(intervals.size,1);music.settings({enabled:false});assert.equal(intervals.size,0);music.start();assert.equal(music.status().playing,false);});
test('zero volume disables scheduling, settings clamp and a cycle visits all tracks without adjacent repeats',()=>{const {music,ctx,advance}=setup();music.attach(ctx);music.settings({volume:0});music.start();assert.equal(music.status().playing,false);music.settings({volume:2});assert.equal(music.status().volume,1);music.start();const names=[music.status().track];for(let i=0;i<1400;i++){advance(.05);const name=music.status().track;if(name!==names.at(-1))names.push(name);}assert.equal(new Set(names.slice(0,3)).size,3);assert(names.length>=3);music.settings({volume:-1});assert.equal(music.status().playing,false);});
test('a delayed audio callback skips stale beats rather than replaying a backlog',()=>{const {music,ctx,intervals,scheduled}=setup();music.attach(ctx);music.start();scheduled.length=0;ctx.currentTime=90;for(const fn of intervals.values())fn();assert(scheduled.filter(x=>x.start!==undefined).every(x=>x.start>=90));assert(scheduled.length<100);});

test('new races select a new track while pause resumes the current track',()=>{const {music,ctx}=setup();music.attach(ctx);music.newRace();const first=music.status().track;music.start();music.stop();music.start();assert.equal(music.status().track,first);music.newRace();assert.notEqual(music.status().track,first);assert.equal(music.status().playing,false);});
