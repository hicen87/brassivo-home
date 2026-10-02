/* Prevent browser double-tap zoom without swallowing pointer-based game controls. */
(()=>{
 document.addEventListener('dblclick',e=>e.preventDefault(),{capture:true,passive:false});
 let previous=null;
 document.addEventListener('touchend',e=>{
  if(e.touches.length||e.changedTouches.length!==1||!e.target.closest?.('#stage,#touch,#hud')){previous=null;return;}
  const t=e.changedTouches[0],current={time:e.timeStamp,x:t.clientX,y:t.clientY};
  if(previous&&current.time-previous.time<350&&Math.hypot(current.x-previous.x,current.y-previous.y)<40)e.preventDefault();
  previous=current;
 },{capture:true,passive:false});
})();
