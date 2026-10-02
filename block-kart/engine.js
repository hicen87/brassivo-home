(function(root){
  const ratios=[4,2.9,2.15,1.7,1.38,1.16];
  function model(){
    let gear=1,rpm=1100,lastShift=-10,cutUntil=0,lastTime=null;
    function reset(){gear=1;rpm=1100;lastShift=-10;cutUntil=0;lastTime=null;}
    function update({speed=0,throttle=0,boost=false,neutral=false},time){
      const dt=lastTime===null?.02:Math.min(.1,Math.max(0,time-lastTime));lastTime=time;
      const v=Math.abs(speed),load=Math.min(1,Math.max(0,throttle)),reverse=speed<-.5;let shift=null;
      let target=neutral?1100+load*3800:1100+v*ratios[gear-1]*100+(boost?450:0);
      if(!neutral&&!reverse&&time-lastShift>.42){
        if(target>6200&&gear<6&&(load>.1||boost)){gear++;shift='up';cutUntil=time+.14;}
        else if(target<2650&&gear>1){gear--;shift='down';}
        if(shift){lastShift=time;target=1100+v*ratios[gear-1]*100+(boost?450:0);rpm=Math.min(7200,target+(shift==='down'?450:0));}
      }
      if(reverse){gear=1;target=1100+v*260;}
      target=Math.min(7200,Math.max(1000,target));rpm+=(target-rpm)*(1-Math.exp(-dt/(load>.1?.09:.18)));
      return {gear:neutral?'N':reverse?'R':gear,rpm,shift,cut:time<cutUntil,load};
    }
    return {update,reset};
  }
  function create(ctx){
    const state=model(),master=ctx.createGain(),mix=ctx.createGain(),filter=ctx.createBiquadFilter(),shape=ctx.createWaveShaper();
    master.gain.value=0;mix.gain.value=.23;filter.type='lowpass';filter.frequency.value=900;filter.Q.value=.7;
    const curve=new Float32Array(256);for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*1.7)/Math.tanh(1.7);}shape.curve=curve;
    mix.connect(filter);filter.connect(shape);shape.connect(master);master.connect(ctx.destination);
    // Unequal exhaust harmonics add a low rumble rather than a single buzzing sawtooth.
    const real=new Float32Array(17),imag=new Float32Array(17);
    for(const [n,a] of [[1,.45],[2,.32],[3,.12],[4,.7],[6,.22],[8,.32],[12,.14],[16,.06]])imag[n]=a;
    const wave=ctx.createPeriodicWave(real,imag),voices=[];
    for(const [detune,level] of [[-7,.55],[9,.4]]){const o=ctx.createOscillator(),g=ctx.createGain();o.setPeriodicWave(wave);o.detune.value=detune;o.frequency.value=1100/120;g.gain.value=level;o.connect(g);g.connect(mix);o.start();voices.push(o);}
    const bass=ctx.createOscillator(),bassGain=ctx.createGain();bass.type='triangle';bass.frequency.value=1100/60;bassGain.gain.value=.28;bass.connect(bassGain);bassGain.connect(mix);bass.start();
    const noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const breath=ctx.createBufferSource(),breathFilter=ctx.createBiquadFilter(),breathGain=ctx.createGain();breath.buffer=noise;breath.loop=true;breathFilter.type='bandpass';breathFilter.frequency.value=650;breathFilter.Q.value=.45;breathGain.gain.value=.009;breath.connect(breathFilter);breathFilter.connect(breathGain);breathGain.connect(master);breath.start();
    let current={gear:1,rpm:1100,shift:null,cut:false,load:0};
    function update(input,time=ctx.currentTime){
      if(!input.on||input.muted){master.gain.setTargetAtTime(0,time,.055);return current;}
      current=state.update(input,time);
      const {rpm,cut,load,shift}=current;
      for(const o of voices)o.frequency.setTargetAtTime(rpm/120,time,shift?.015:.055);
      bass.frequency.setTargetAtTime(rpm/60,time,.045);
      filter.frequency.setTargetAtTime(650+rpm*.12+load*450+(input.boost?200:0),time,.06);
      breathFilter.frequency.setTargetAtTime(450+rpm*.14,time,.08);
      breathGain.gain.setTargetAtTime(.008+load*.014,time,.06);
      master.gain.setTargetAtTime((cut?.095:.31)+load*.055,time,shift?.018:.075);
      return current;
    }
    return {update,reset:()=>{state.reset();current={gear:1,rpm:1100,shift:null,cut:false,load:0};},status:()=>({...current})};
  }
  root.KartEngine={model,create};
})(globalThis);
