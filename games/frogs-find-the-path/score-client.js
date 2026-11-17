/* Session-bound classroom results; shared visibility and new-class controls. */
(()=>{
'use strict';
const API='/api/frog-path-scores',KEY='frog-path-outbox-v1',ALIAS='frog-path-name-identities-v1';
const uuid=()=>crypto.randomUUID?.()||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+'_'+Math.random().toString(36).slice(2);
const get=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const put=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
const name=()=>String(window.trackpadStudentProfile?.getName?.()||get('moving-sound-student-name-v1')||'').trim().slice(0,40);
let aliases={};try{aliases=JSON.parse(get(ALIAS)||'{}');if(!aliases||Array.isArray(aliases)||typeof aliases!=='object')aliases={};}catch{}
const normalized=n=>n.normalize('NFKC').toLowerCase();
function identity(){const key=normalized(name())||'guest';if(!Object.hasOwn(aliases,key)||!/^[-\w]{16,100}$/.test(aliases[key])){Object.defineProperty(aliases,key,{value:uuid(),writable:true,enumerable:true,configurable:true});put(ALIAS,JSON.stringify(aliases));}return aliases[key];}
let currentIdentity=identity(),currentName=name(),session=null,pending=[],rows=[],show=false,busy=false,again=false;
try{const p=JSON.parse(get(KEY)||'[]');if(Array.isArray(p))pending=p.filter(v=>v&&typeof v.sessionId==='string'&&typeof v.classSession==='string'&&(v.rename===true||Number.isInteger(v.level)&&v.level>=1&&v.level<=45&&Number.isInteger(v.attempts)&&v.attempts>0)&&typeof v.studentId==='string').slice(-200);}catch{}
const persist=()=>put(KEY,JSON.stringify(pending));
function token(){return session?session.classSession+'|'+session.sessionId:null;}
function formatTime(ms){const t=Math.floor(Math.max(0,Number(ms)||0)/100);return `${Math.floor(t/600)}:${String(Math.floor(t/10)%60).padStart(2,'0')}.${t%10}`;}
function render(){const board=document.getElementById('leaderboard'),list=document.getElementById('leaders');if(!board||!list)return;board.hidden=!show;list.replaceChildren();for(let i=0;i<3;i++){const row=rows[i],li=document.createElement('li'),rank=document.createElement('span'),details=document.createElement('div'),student=document.createElement('strong'),score=document.createElement('span');rank.className='rank';rank.textContent=String(i+1);details.className='rank-detail';student.textContent=row?(row.name||'Player'):'Your spot awaits';score.textContent=row?`Level ${row.levels} · ${formatTime(row.totalMs)}`:'Hop home to join!';details.append(student,score);li.append(rank,details);list.append(li);}}
function accept(d){if(typeof d.classSession!=='string'||typeof d.sessionId!=='string')throw Error('Session unavailable');const old=token();session={classSession:d.classSession,sessionId:d.sessionId};pending=pending.filter(v=>v.classSession===session.classSession&&v.sessionId===session.sessionId);persist();rows=Array.isArray(d.scores)?d.scores:[];show=d.show===true;render();if(old!==token())window.dispatchEvent(new CustomEvent('frogPathScoreSession',{detail:{token:token(),classSession:session.classSession}}));}
async function refresh(){
 if(busy){again=true;return;}busy=true;again=false;
 try{
  const r=await fetch(API,{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error('Scores unavailable');accept(await r.json());
  for(const item of [...pending]){
   const sent=await fetch(API,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});
   if(sent.status===409){pending=pending.filter(v=>v.sessionId!==item.sessionId||v.classSession!==item.classSession);persist();again=true;break;}
   if(sent.status===400){pending=pending.filter(v=>v.runId!==item.runId);persist();continue;}
   if(!sent.ok)throw Error('Upload unavailable');pending=pending.filter(v=>v.runId!==item.runId);persist();accept(await sent.json());
  }
 }catch{/* Session-bound outbox retries after reconnecting. */}
 finally{busy=false;if(again){again=false;queueMicrotask(refresh);}}
}
function record({level,timeMs,attempts,startedToken}){const n=name();if(!n||!session||startedToken!==token()||!Number.isInteger(level)||level<1||level>45||!Number.isInteger(attempts)||attempts<1)return false;pending.push({...session,studentId:currentIdentity,name:n,level,timeMs:Math.max(100,Math.min(3600000,Math.round(timeMs))),attempts,runId:uuid()});pending=pending.slice(-200);persist();refresh();return true;}
function rename(){const n=name();if(!n)return;if(currentName&&n!==currentName){Object.defineProperty(aliases,normalized(n),{value:currentIdentity,writable:true,enumerable:true,configurable:true});put(ALIAS,JSON.stringify(aliases));for(const p of pending)if(p.studentId===currentIdentity)p.name=n;persist();if(session){pending.push({...session,rename:true,studentId:currentIdentity,name:n,runId:uuid()});persist();}}else currentIdentity=identity();currentName=n;refresh();}
window.frogPathScores=Object.freeze({refresh,record,token,identity:()=>currentIdentity,name});
window.addEventListener('trackpadStudentNameChanged',rename);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});document.addEventListener('DOMContentLoaded',()=>{render();refresh();});setInterval(()=>{if(!document.hidden)refresh();},12000);
})();
