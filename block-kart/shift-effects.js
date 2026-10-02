(function(root){
  root.KartShiftEffects={emit(k,shift,emit,random=Math.random){
    if(!['up','down'].includes(shift)||!k||k.finished||k.speed<3)return 0;
    const fx=Math.sin(k.heading),fz=Math.cos(k.heading),rx=fz,rz=-fx,strong=shift==='up';let count=0;
    for(const side of [-1,1]){
      const x=k.x-fx*2.3+rx*side*.6,y=k.y+.86,z=k.z-fz*2.3+rz*side*.6;
      for(let i=0;i<(strong?5:3);i++){
        const trail=10+random()*9,spread=(random()-.5)*2,drift=Math.max(0,k.speed)*.5-trail;
        emit(x,y,z,fx*drift+rx*spread,1.3+random()*2,fz*drift+rz*spread,[0xfff4c1,0xffcf43,0xff8428][i%3],(strong?.48:.34)+random()*.2,.18+random()*.13);count++;
      }
      for(let i=0;i<(strong?10:6);i++){
        const trail=13+random()*11,spread=(random()-.5)*8,drift=Math.max(0,k.speed)*.5-trail;
        emit(x,y,z,fx*drift+rx*spread,2+random()*5,fz*drift+rz*spread,i%2?0xffc33f:0xfff2ad,.08+random()*.09,.22+random()*.18);count++;
      }
    }
    return count;
  }};
})(globalThis);
