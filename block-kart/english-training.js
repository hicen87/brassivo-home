var KartEnglishTraining;
(function(root){
'use strict';
let active=null;
function normalize(s){return String(s).trim().toLowerCase().replace(/[.,!?]/g,'').replace(/\s+/g,' ');}
function stop(){if(active){try{active.abort();}catch{}active=null;}root.speechSynthesis?.cancel();}
function say(text,status){if(!root.speechSynthesis||!root.SpeechSynthesisUtterance){status.textContent='当前浏览器不支持朗读，可改用文字题。';return false;}root.speechSynthesis.cancel();const u=new root.SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.8;u.onerror=()=>{status.textContent='播放失败，请重试或改用文字题。';};root.speechSynthesis.speak(u);return true;}
function mount(box,q,submit){
 stop();box.textContent='';box.classList.toggle('vertical',!!q.practiceType||q.options.some(s=>s.length>6));
 const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='grid-column:1/-1;font-size:20px;line-height:1.5';
 const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;box.append(b);return b;};
 const answer=s=>{stop();submit(normalize(s)===normalize(q.answer)?q.answer:String(s));};
 function choices(){q.options.forEach(a=>button(a,()=>answer(a)));}
 function spelling(){const form=document.createElement('form');form.style.cssText='grid-column:1/-1;display:grid;gap:12px';const input=document.createElement('input');input.type='text';input.autocomplete='off';input.spellcheck=false;input.autocapitalize='none';input.setAttribute('aria-label','英文拼写');input.placeholder='输入英文单词';input.style.cssText='box-sizing:border-box;width:100%;min-width:0;font-size:26px;padding:12px';const send=document.createElement('button');send.textContent='提交拼写';form.append(input,send);form.onsubmit=e=>{e.preventDefault();if(input.value.trim()){input.disabled=send.disabled=true;answer(input.value);}};box.append(form);}
 if(q.practiceType==='spell')spelling();
 else if(q.practiceType==='listen'){button('▶ 播放英文',()=>say(q.answer,status));button('改用中文提示',()=>{status.textContent='中文提示：'+q.meaning;});choices();}
 else if(q.practiceType==='read'){
 button('▶ 听示范发音',()=>say(q.answer,status));
 const Recognition=root.SpeechRecognition||root.webkitSpeechRecognition;
 const record=button('🎤 开始朗读',()=>{
  if(!Recognition)return;
  stop();record.disabled=true;status.textContent='请朗读目标词；识别只检查内容，不是专业发音评分。';
  const rec=new Recognition();active=rec;rec.lang='en-US';rec.interimResults=false;rec.maxAlternatives=3;
  rec.onresult=e=>{if(active!==rec)return;const candidates=Array.from(e.results[0],x=>x.transcript);const match=candidates.find(x=>normalize(x)===normalize(q.answer));status.textContent='识别结果：'+(match||candidates[0]||'未识别');record.disabled=false;active=null;answer(match||candidates[0]||'未识别');};
  rec.onerror=e=>{if(active!==rec)return;active=null;record.disabled=false;status.textContent=e.error==='not-allowed'?'麦克风未获授权，可使用拼写作答。':'识别失败，请重试或改用拼写。';};
  rec.onend=()=>{if(active===rec){active=null;record.disabled=false;status.textContent='未收到可判断的语音，请重试或改用拼写。';}};
  try{rec.start();}catch{active=null;record.disabled=false;status.textContent='无法启动语音识别，请改用拼写。';}
 });record.disabled=!Recognition;
 status.textContent=Recognition?'点击开始朗读才使用麦克风。声音可能由浏览器语音服务处理；本站不保存录音。仅判断目标词是否被识别，不能评价口音或音素质量。':'此浏览器不支持语音识别，可听示范并改用拼写作答。';
 button('改用拼写作答',()=>{stop();box.textContent='';spelling();box.append(status);status.textContent='请拼写“'+q.meaning+'”。';});
 }else choices();
 box.append(status);
}
KartEnglishTraining=root.KartEnglishTraining={normalize,stop,say,mount};
})(globalThis);
