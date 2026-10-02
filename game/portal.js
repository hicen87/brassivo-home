(async()=>{
const $=id=>document.getElementById(id),api=GameAPI;
const tracks=['青草环线','赤砂峡谷','雪峰回廊'],diffs=['休闲','标准','极速'];
const names={all:'综合',math:'数学',olympiad:'奥数',chinese:'语文',english:'英语',science:'科学',ethics:'道德与法治',music:'音乐',art:'美术',pe:'体育与健康',labor:'劳动',it:'信息科技',practice:'综合实践'};
const fmt=ms=>`${Math.floor(ms/60000)}:${((ms%60000)/1000).toFixed(2).padStart(5,'0')}`;
let sequence=0;
function status(text){$('accountStatus').textContent=text;}
const account=GameAccount.mount({onUser:u=>{if(u)loadMine();else $('myScores').textContent='';}});
async function loadMine(){try{const r=await api.call('/scores');$('myScores').textContent='';if(!r.rows.length){$('myScores').textContent='你还没有云端成绩，开始第一场比赛吧。';return;}for(const x of r.rows){const p=document.createElement('p');p.textContent=`${tracks[x.track]} · ${diffs[x.diff]} · ${x.study?x.grade+'年级'+names[x.subject]:'普通模式'}：${fmt(x.ms)}`;$('myScores').append(p);}}catch(e){$('myScores').textContent=e.message;}}
async function board(){const seq=++sequence;KartSubjects.populate($('boardSubject'),$('boardGrade').value);const study=$('boardMode').value==='study';$('boardGrade').disabled=$('boardSubject').disabled=!study;const params=new URLSearchParams({track:$('boardTrack').value,diff:$('boardDiff').value,study:study?'1':'0',grade:study?$('boardGrade').value:'0',subject:study?$('boardSubject').value:'none'});$('boardStatus').textContent='正在加载排行榜…';try{const r=await api.call('/leaderboard?'+params);if(seq!==sequence)return;$('boardRows').textContent='';$('boardStatus').textContent=r.rows.length?'按综合分排名，同分按用时排序。每位玩家展示该分类最高分。':'这个榜单还没有成绩，来争夺第一名吧！';r.rows.forEach((x,i)=>{const tr=document.createElement('tr');for(const text of [i<3?['🥇','🥈','🥉'][i]:String(i+1),x.username,x.points==null?'—':String(KartScore.fromStored(x.points)),x.total?`${x.correct}/${x.total} · ${Math.round(100*x.correct/x.total)}%`:'—']){const td=document.createElement('td');td.textContent=text;tr.append(td);}$('boardRows').append(tr);});}catch(e){if(seq===sequence)$('boardStatus').textContent='排行榜暂时不可用，请稍后刷新。';}}
['boardMode','boardTrack','boardDiff','boardGrade','boardSubject'].forEach(id=>$(id).onchange=board);$('refreshBoard').onclick=board;
await account.refresh();
board();
})();
