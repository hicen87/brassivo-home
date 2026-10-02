import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),THREE=require('../block-kart/vendor/three.min.js');const html=fs.readFileSync(new URL('../block-kart/index.html',import.meta.url),'utf8');
test('all three track lengths match at 150% of the old longest while retaining their distinct shapes and road width',()=>{
 const scope={THREE,Math,Float32Array};vm.createContext(scope);vm.runInContext(html.slice(html.indexOf('const B = 3,'),html.indexOf('/* ================= device & quality'))+html.slice(html.indexOf('function trackCurve(def)'),html.indexOf('const NR =')),scope);
 const tracks=vm.runInContext('TRACKS.map(buildTrack)',scope),oldLongest=vm.runInContext('Math.max(...TRACKS.map(d=>trackCurve(d).getLength()))',scope);assert.equal(tracks.length,3);
 for(const tr of tracks){assert(Math.abs(tr.len-oldLongest*1.5)<1e-6);let polygon=0;for(let i=0;i<tr.N;i++){const j=(i+1)%tr.N;polygon+=Math.hypot(tr.px[j]-tr.px[i],tr.pz[j]-tr.pz[i]);}assert(Math.abs(polygon-tr.len)/tr.len<.001);assert.equal(tr.N,tracks[0].N);assert.equal(tr.step,tracks[0].step);}
 assert.equal(vm.runInContext('ROAD',scope),14);assert(new Set(tracks.map(tr=>Array.from(tr.th).slice(0,50).join(','))).size===3);
 console.log('common length',tracks[0].len);
});
