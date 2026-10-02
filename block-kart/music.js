(function(root){
  const tracks=[
    {name:'像素冲刺',bpm:124,key:48,chords:[0,5,7,5],melody:[0,4,7,12,7,4,2,4,5,9,12,9,7,5,4,2,7,11,14,12,11,7,4,2,5,9,12,14,12,9,7,4]},
    {name:'霓虹弯道',bpm:132,key:45,chords:[0,5,8,7],melody:[0,3,7,10,12,10,7,3,5,8,12,15,12,8,7,5,8,12,15,19,15,12,10,8,7,11,14,17,14,11,7,-1]},
    {name:'晴空飞车',bpm:118,key:50,chords:[0,7,9,5],melody:[0,4,7,4,2,4,7,12,7,11,14,11,9,7,4,2,9,12,16,12,14,12,9,7,5,9,12,9,7,5,4,-1]}
  ];
  root.KartMusicFactory=function({random=Math.random,setTimer=setInterval,clearTimer=clearInterval}={}){
    let ctx=null,mix=null,noise=null,timer=null,playing=false,enabled=true,volume=.35,bag=[],track=null,previous=null,step=0,next=0;
    const voices=new Set();
    function choose(){
      if(!bag.length){bag=tracks.slice();for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.at(-1)===previous)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];}
      track=bag.pop();previous=track;step=0;
    }
    function attach(context){
      if(ctx===context||!context)return;
      stop();ctx=context;mix=ctx.createGain();mix.gain.value=0;mix.connect(ctx.destination);
      noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.3),ctx.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    }
    function envelope(source,time,duration,gain,filter=null){
      const g=ctx.createGain();source.connect(filter||g);if(filter)filter.connect(g);g.connect(mix);
      g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(gain,time+.008);g.gain.exponentialRampToValueAtTime(.0001,time+duration);
      voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();g.disconnect();if(filter)filter.disconnect();};source.start(time);source.stop(time+duration+.02);
    }
    function tone(note,time,duration,gain,type='triangle'){
      const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(440*2**((note-69)/12),time);envelope(o,time,duration,gain);
    }
    function drum(time,kind){
      if(kind==='kick'){const o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(135,time);o.frequency.exponentialRampToValueAtTime(42,time+.16);envelope(o,time,.2,.3);return;}
      const source=ctx.createBufferSource();source.buffer=noise;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=kind==='hat'?6500:1300;envelope(source,time,kind==='hat'?.045:.14,kind==='hat'?.028:.1,f);
    }
    function beat(time){
      const sixteenth=60/track.bpm/4,bar=Math.floor(step/16),tick=step%16,chord=track.chords[bar%4];
      if(tick===0||tick===8||((bar%4===3)&&tick===14))drum(time,'kick');
      if(tick===4||tick===12)drum(time,'snare');
      if(tick%2===0)drum(time,'hat');
      if(tick===0||tick===6||tick===8||tick===14)tone(track.key-12+chord,time,sixteenth*1.5,.105,'sine');
      if(tick===0){const minor=track.name==='霓虹弯道'?[0,5].includes(chord):chord===9;for(const n of [0,minor?3:4,7])tone(track.key+chord+n,time,sixteenth*7,.023,'triangle');}
      if(tick%2===0){const note=track.melody[(bar*8+tick/2)%track.melody.length];if(note>=0)tone(track.key+24+note,time,sixteenth*1.6,.055,bar%8<4?'triangle':'sine');}
    }
    function schedule(){
      if(!playing||!ctx||ctx.state!=='running')return;
      // Never replay a backlog after the browser throttles a background tab.
      if(next<ctx.currentTime-.15)next=ctx.currentTime+.03;
      while(next<ctx.currentTime+.12){if(step>=256)choose();beat(next);next+=60/track.bpm/4;step++;}
    }
    function stop(){
      if(!playing&&timer===null&&voices.size===0)return;
      if(timer!==null){clearTimer(timer);timer=null;}playing=false;
      if(mix)mix.gain.setTargetAtTime(0,ctx.currentTime,.025);
      for(const voice of voices){try{voice.stop(ctx.currentTime+.03);}catch(e){}}voices.clear();
    }
    function start(){
      if(!ctx||!enabled||volume<=0||playing)return;
      if(!track)choose();playing=true;next=ctx.currentTime+.04;mix.gain.setTargetAtTime(volume,ctx.currentTime,.06);schedule();timer=setTimer(schedule,25);
    }
    function settings(value={}){
      if(value.enabled!==undefined)enabled=!!value.enabled;
      if(value.volume!==undefined)volume=Math.min(1,Math.max(0,Number(value.volume)||0));
      if(!enabled||volume===0)stop();else if(playing)mix.gain.setTargetAtTime(volume,ctx.currentTime,.06);
    }
    return {attach,settings,start,stop,newRace(){stop();choose();},status:()=>({playing,enabled,volume,track:track?.name||null,bpm:track?.bpm||null}),tracks:tracks.map(({name,bpm})=>({name,bpm}))};
  };
})(globalThis);
