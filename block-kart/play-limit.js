/* A shared browser clock: active races (including pauses/questions) count; menus do not. */
(function(root){
'use strict';
const DURATION=30*60*1000,KEY='block-kart-play-limit-v1';
function create(storage,clock=Date.now){
 let last=clock(),fallback={used:0,until:0,claimed:0};
 function tick(active){
  const now=clock();let state=fallback;
  try{const saved=JSON.parse(storage.getItem(KEY));if(saved&&Number.isFinite(saved.used)&&Number.isFinite(saved.until)&&Number.isFinite(saved.claimed))state=saved;}catch{}
  if(state.until && now>=state.until)state={used:0,until:0,claimed:now};
  if(!state.until && active){state.used+=Math.max(0,now-Math.max(last,state.claimed));state.claimed=now;if(state.used>=DURATION)state.until=now+DURATION;}
  last=now;fallback=state;try{storage.setItem(KEY,JSON.stringify(state));}catch{}
  return {locked:state.until>now,remaining:Math.max(0,state.until-now),used:state.used};
 }
 return {tick};
}
root.KartPlayLimitFactory=create;
let storage;try{storage=root.localStorage;}catch{storage={getItem(){},setItem(){}};}
root.KartPlayLimit=create(storage);
})(globalThis);
