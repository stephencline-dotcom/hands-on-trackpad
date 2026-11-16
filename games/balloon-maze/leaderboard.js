(()=>{'use strict';
const KEY='balloon-maze-leaderboard-outbox-v1',ID='balloon-maze-stable-student-id-v1';
const uuid=()=>window.crypto?.randomUUID?.()||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+'_'+Math.random().toString(36).slice(2);
function identity(){let id=localStorage.getItem(ID);if(!id){id=uuid();localStorage.setItem(ID,id);}return id;}
function name(){return (window.trackpadStudentProfile?.getName?.()||localStorage.getItem('moving-sound-student-name-v1')||'').trim().slice(0,40);}
let outbox=[];try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(v))outbox=v.filter(x=>x&&Number.isInteger(x.level)&&Number.isInteger(x.timeMs)).slice(-100);}catch{}
let busy=false,board=null,rows=[],visible=false,sessionId=null,classSession=null;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(outbox));}catch{}}
function format(ms){
  const tenths=Math.floor(ms/100);
  const minutes=Math.floor(tenths/600);
  const seconds=Math.floor(tenths/10)%60;
  return `${minutes}:${String(seconds).padStart(2,'0')}.${tenths%10}`;
}
function render(){
  if(!board)return;
  const list=board.querySelector('ol');
  list.replaceChildren();

  for(let i=0;i<3;i++){
    const v=rows[i];
    const li=document.createElement('li');
    li.className='bm-rank bm-rank-'+(i+1);

    const rank=document.createElement('span');
    rank.className='bm-rank-number';
    rank.textContent=['1st','2nd','3rd'][i];

    const details=document.createElement('span');
    details.className='bm-rank-details';

    const student=document.createElement('strong');
    student.textContent=v?(v.name||'Player'):'Waiting for player';

    const levels=document.createElement('small');
    levels.textContent=v?`${v.levels}/30 levels completed`:'No score yet';

    details.append(student,levels);

    const time=document.createElement('span');
    time.className='bm-rank-time';
    time.textContent=v?format(v.totalMs):'--:--.-';

    li.append(rank,details,time);
    list.append(li);
  }
}
async function refresh(){
 if(busy)return;busy=true;
 try{
  const response=await fetch('/api/balloon-maze-scores',{cache:'no-store',credentials:'same-origin'});
  if(!response.ok)throw Error('Leaderboard unavailable');
  const data=await response.json();
  if(typeof data.sessionId!=='string'||typeof data.classSession!=='string')throw Error('Class session unavailable');
  classSession=data.classSession;
  const changed=sessionId!==data.sessionId;
  sessionId=data.sessionId;
  // Old pending submissions must never cross into a new class session.
  outbox=outbox.filter(item=>item.sessionId===sessionId&&item.classSession===classSession);persist();
  rows=Array.isArray(data.scores)?data.scores:[];visible=data.show===true;
  if(board)board.hidden=!visible;render();
  for(const item of [...outbox]){
   const sent=await fetch('/api/balloon-maze-scores',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});
   if(sent.status===409){sessionId=null;outbox=[];persist();break;}
   if(!sent.ok)throw Error('Score upload unavailable');
   outbox=outbox.filter(v=>v.runId!==item.runId);persist();
  }
  if(changed||outbox.length===0){
   const latest=await fetch('/api/balloon-maze-scores',{cache:'no-store',credentials:'same-origin'});
   if(latest.ok){const d=await latest.json();if(d.sessionId!==sessionId||d.classSession!==classSession){sessionId=d.sessionId;classSession=d.classSession;outbox=[];persist();}rows=Array.isArray(d.scores)?d.scores:[];visible=d.show===true;if(board)board.hidden=!visible;render();}
  }
 }catch{/* Retain only current-session pending results for retry. */}
 finally{busy=false;}
}
function record(level,timeMs){const studentName=name();if(!studentName||!sessionId||!Number.isInteger(level)||level<1||level>30||!Number.isInteger(timeMs)||timeMs<100||timeMs>3600000){refresh();return false;}
 const item={studentId:identity(),name:studentName,level,timeMs,runId:uuid(),sessionId,classSession};outbox.push(item);outbox=outbox.slice(-100);persist();refresh();return true;}
function init(){const host=document.querySelector('main');if(!host)return;board=document.createElement('section');board.className='bm-leaderboard';board.setAttribute('aria-label','Balloon Maze classroom top three');const h=document.createElement('h2');h.textContent='Classroom Top 3';const sub=document.createElement('p');sub.textContent='Most levels, then fastest total time';const ol=document.createElement('ol');board.append(h,sub,ol);const hud=host.querySelector('.hud');
if(hud)hud.insertAdjacentElement('afterend',board);
else host.append(board);
board.hidden=true;render();refresh();}
window.balloonMazeLeaderboard=Object.freeze({record,refresh});
window.addEventListener('trackpadStudentNameChanged',()=>{const n=name();if(n&&sessionId){for(const item of outbox)item.name=n;persist();fetch('/api/balloon-maze-scores',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({rename:true,studentId:identity(),name:n,sessionId,classSession})}).then(refresh).catch(()=>{});}refresh();});
window.addEventListener('online',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
setInterval(()=>{if(!document.hidden)refresh();},15000);
})();
