(function(root){
  let center=null,axis=0,value=0,enabled=false,last=0,rotation=null;
  const clamp=v=>Math.max(-1,Math.min(1,v));
  function sample(e){
    if(!enabled||!Number.isFinite(e.gamma)||!Number.isFinite(e.beta))return;
    const angle=root.screen?.orientation?.angle??root.orientation??0;
    const r=angle*Math.PI/180;axis=e.gamma*Math.cos(r)+e.beta*Math.sin(r);
    if(rotation!==angle){rotation=angle;center=null;value=0;}
    if(center===null)center=axis;
    const delta=axis-center,target=Math.abs(delta)<2?0:clamp(delta/25);
    value=value*.65+target*.35;last=Date.now();
  }
  root.addEventListener('deviceorientation',sample);
  const api={sample,calibrate(){center=null;value=0;},steer(){return Date.now()-last<1000?value:0;},async enable(){
    if(!root.isSecureContext||!root.DeviceOrientationEvent)return false;
    try{if(typeof root.DeviceOrientationEvent.requestPermission==='function'&&await root.DeviceOrientationEvent.requestPermission()!=='granted')return false;}catch{return false;}
    enabled=true;api.calibrate();const started=Date.now();
    if(last&&started-last<1000)return true;
    return new Promise(resolve=>{const timer=setInterval(()=>{if(last>=started){clearInterval(timer);resolve(true);}else if(Date.now()-started>1600){clearInterval(timer);enabled=false;resolve(false);}},80);});
  }};
  root.KartTilt=api;
})(window);
