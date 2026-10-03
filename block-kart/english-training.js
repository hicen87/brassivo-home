var KartEnglishTraining;
(function(root){
'use strict';
let active=null,playback=null,releaseRecord=null;
function normalize(s){return String(s).trim().toLowerCase().replace(/[.,!?]/g,'').replace(/\s+/g,' ');}
function stopVoice(){const p=playback;playback=null;if(p){root.clearTimeout(p.timer);p.done();}try{root.speechSynthesis?.cancel();}catch{}}
function stop(){const rec=active;active=null;if(releaseRecord){const release=releaseRecord;releaseRecord=null;release();}try{rec?.abort();}catch{}stopVoice();}
function say(text,status,done=()=>{}){
 stop();
 if(!root.speechSynthesis||!root.SpeechSynthesisUtterance){status.textContent='当前浏览器不支持播放，可改用文字作答。';done();return false;}
 const p={done,timer:null};playback=p;
 const finish=message=>{if(playback!==p)return;playback=null;root.clearTimeout(p.timer);if(message)status.textContent=message;done();};
 try{
  const u=new root.SpeechSynthesisUtterance(text);p.utterance=u;u.lang='en-US';u.rate=.8;
  const voices=root.speechSynthesis.getVoices?.()||[];u.voice=voices.find(v=>/^en[-_]/i.test(v.lang))||null;
  status.textContent='正在播放示范音；播放后再点击开始朗读。';
  u.onend=()=>finish('播放完毕，可以朗读或继续作答。');
  u.onerror=()=>finish('播放失败，可重试或改用文字作答。');
  p.timer=root.setTimeout(()=>{finish('播放未响应，请重试或改用文字作答。');try{root.speechSynthesis.cancel();}catch{}},8000);
  root.speechSynthesis.speak(u);return true;
 }catch{finish('无法播放示范音，请改用文字作答。');return false;}
}
function mount(box,q,submit){
 stop();box.textContent='';box.classList.toggle('vertical',!!q.practiceType||q.options.some(s=>s.length>6));
 let answered=false,record;
 const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='grid-column:1/-1;font-size:20px;line-height:1.5';
 const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;box.append(b);return b;};
 const answer=s=>{if(answered)return;answered=true;stop();submit(normalize(s)===normalize(q.answer)?q.answer:String(s));};
 const skip=()=>button('跳过本题，继续比赛（不获得道具）',()=>answer(''));
 function choices(){q.options.forEach(a=>button(a,()=>answer(a)));}
 function spelling(){const form=document.createElement('form');form.style.cssText='grid-column:1/-1;display:grid;gap:12px';const input=document.createElement('input');input.type='text';input.autocomplete='off';input.spellcheck=false;input.autocapitalize='none';input.setAttribute('aria-label','英文拼写');input.placeholder='输入英文单词';input.style.cssText='box-sizing:border-box;width:100%;min-width:0;font-size:26px;padding:12px';const send=document.createElement('button');send.textContent='提交拼写';form.append(input,send);form.onsubmit=e=>{e.preventDefault();if(input.value.trim()){input.disabled=send.disabled=true;answer(input.value);}};box.append(form);}
 if(q.practiceType==='spell')spelling();
 else if(q.practiceType==='listen'){button('▶ 播放英文',()=>say(q.answer,status));button('改用中文提示',()=>{stop();status.textContent='中文提示：'+q.meaning;});choices();skip();}
 else if(q.practiceType==='read'){
 const Recognition=root.SpeechRecognition||root.webkitSpeechRecognition;
 button('▶ 听示范发音',()=>{stop();if(record)record.disabled=true;say(q.answer,status,()=>{if(record)record.disabled=!Recognition||answered;});});
 record=button('🎤 开始朗读',()=>{
  if(!Recognition||record.disabled||answered)return;
  stop();record.disabled=true;status.textContent='正在听，请朗读目标词（最多12秒）；可随时改用拼写。';
  let rec,timer;
  const release=()=>{root.clearTimeout(timer);record.disabled=!Recognition||answered;};
  const fail=message=>{if(active!==rec)return;active=null;releaseRecord=null;release();try{rec.abort();}catch{}status.textContent=message;};
  try{
   rec=new Recognition();active=rec;releaseRecord=release;rec.lang='en-US';rec.interimResults=false;rec.continuous=false;rec.maxAlternatives=3;
   rec.onresult=e=>{
    if(active!==rec)return;
    const candidates=Array.from(e.results?.[e.resultIndex||0]||[],x=>x.transcript).filter(x=>typeof x==='string'&&x.trim());
    if(!candidates.length){fail('未识别到内容，请重试或改用拼写。');return;}
    const match=candidates.find(x=>normalize(x)===normalize(q.answer));status.textContent='识别结果：'+(match||candidates[0]);answer(match||candidates[0]);
   };
   rec.onerror=e=>fail(e.error==='not-allowed'||e.error==='service-not-allowed'?'麦克风或语音服务未获授权，可改用拼写作答。':'识别失败，请重试或改用拼写。');
   rec.onend=()=>fail('未收到可判断的语音，请重试或改用拼写。');
   timer=root.setTimeout(()=>fail('语音识别超时，已停止麦克风；请重试或改用拼写。'),12000);
   rec.start();
  }catch{if(rec&&active===rec)active=null;releaseRecord=null;release();try{rec?.abort();}catch{}status.textContent='无法启动语音识别，请改用拼写。';}
 });record.disabled=!Recognition;
 status.textContent=Recognition?'点击开始朗读才使用麦克风。声音可能由浏览器语音服务处理；本站不保存录音。仅判断目标词是否被识别，不能评价口音或音素质量。':'此浏览器不支持语音识别，可听示范并改用拼写作答。';
 button('改用拼写作答',()=>{if(answered)return;stop();box.textContent='';spelling();skip();box.append(status);status.textContent='请拼写“'+q.meaning+'”。';});skip();
 }else choices();
 box.append(status);
}
KartEnglishTraining=root.KartEnglishTraining={normalize,stop,say,mount};
})(globalThis);
