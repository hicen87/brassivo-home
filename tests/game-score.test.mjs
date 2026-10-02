import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('../block-kart/score.js',import.meta.url),'utf8'),scope);
test('composite score weights accuracy, laps, and effective hits with caps',()=>{const score=scope.KartScore.calculate;assert.equal(score({correct:7,total:7,laps:6,hits:5}).points,100);assert.equal(score({correct:1,total:2,laps:6,hits:2}).points,64);assert.equal(score({correct:0,total:0,laps:6,hits:100}).points,40);assert.equal(score({correct:1,total:2,laps:3,hits:1}).points,47);});

test('stored historical scores share the same 100-point scale',()=>{assert.equal(scope.KartScore.fromStored(1000),100);assert.equal(scope.KartScore.fromStored(640),64);assert.equal(scope.KartScore.fromStored(857),85.7);assert.equal(scope.KartScore.calculate({correct:99,total:7,laps:99,hits:99}).points,100);});
