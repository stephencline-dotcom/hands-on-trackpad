/* Shared manual Freeze + server-owned countdown. Timer state is never permanent. */
(()=>{'use strict';
const SETTINGS='/api/settings',STATE='/api/classroom-state',TIMER='/api/freeze-timer';
const TEACHER='handsOnTrackpadTeacherSession',FEATURE='freezeScreenFeatureEnabled',ARMED='freezeScreenArmed',DURATION='handsOnTrackpadFreezeTimerSeconds';
const scriptURL=document.currentScript?.src||new URL('/freeze-screen.js',location.href).href,homeURL=new URL('index.html',scriptURL).href;
const parse=(v,f=false)=>v===undefined||v===null?f:v===true||v==='true';
let teacher=false,locked=false,armedAt=0,shared={freezeScreenFeatureEnabled:false,freezeScreenArmed:false,freezeScreenImmediate:false,freezeTimerEndsAt:null};
let epoch=null,revision=-1,issued=0,applied=0,remainingAt=0,timerSupported=false,inFlight=false,busy=false,stopped=false,pollHandle,drawHandle,heartbeatHandle,ui=null,errorText='';
function teacherSession(){return sessionStorage.getItem(TEACHER)==='true';}
function element(tag,id,text){const e=document.createElement(tag);if(id)e.id=id;if(text!==undefined)e.textContent=text;return e;}
function overlay(){if(!document.getElementById('freezeKinderVisualStyle')){const s=element('style','freezeKinderVisualStyle');s.textContent='.freeze-kinder-message{width:min(900px,95vw);padding:20px;box-sizing:border-box}.freeze-kinder-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.freeze-kinder-panel{background:#fff9e8;border:5px solid #ffd54a;border-radius:22px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}.freeze-kinder-panel svg{display:block;width:min(100%,250px);max-height:34vh;overflow:hidden}.freeze-kinder-panel strong{color:#17324d;font-size:clamp(1rem,2.3vw,1.6rem);font-weight:900;text-align:center}.freeze-kinder-message p{margin:18px 0 0;color:white;font-size:clamp(1rem,2vw,1.45rem)}.freeze-head-rise{animation:freezeHeadRise 4.8s ease-in-out infinite}.freeze-headphones-lower{animation:freezeHeadphonesLower 4.8s ease-in-out infinite}@keyframes freezeHeadRise{0%,15%{transform:translateY(34px)}38%,85%{transform:translateY(0)}100%{transform:translateY(34px)}}@keyframes freezeHeadphonesLower{0%,15%{transform:translateY(-30px)}38%,85%{transform:translateY(0)}100%{transform:translateY(-30px)}}@media(prefers-reduced-motion:reduce){.freeze-head-rise,.freeze-headphones-lower{animation:none!important}}@media(max-width:520px){.freeze-kinder-message{padding:10px}.freeze-kinder-grid{gap:8px}.freeze-kinder-panel{padding:8px 4px;border-width:3px}.freeze-kinder-panel svg{max-height:26vh}}';document.head.append(s);}let e=document.getElementById('studentFreezeOverlay');if(e)return e;e=element('div','studentFreezeOverlay');e.className='student-freeze-overlay';e.hidden=true;e.setAttribute('role','alert');e.innerHTML='<div class="student-freeze-message freeze-kinder-message"><div class="freeze-kinder-grid"><div class="freeze-kinder-panel"><svg viewBox="0 0 240 180" role="img" aria-label="Child lifts head from computer and looks toward teacher"><rect x="3" y="3" width="234" height="174" rx="20" fill="#dff4ff"/><rect x="13" y="144" width="214" height="13" rx="5" fill="#b17d51"/><path d="M54 176 Q52 125 120 124 Q188 125 186 176" fill="#f1a13e"/><g class="freeze-head-rise"><rect x="109" y="91" width="23" height="31" rx="9" fill="#eab18b"/><ellipse cx="120" cy="70" rx="43" ry="48" fill="#f5c39e"/><path d="M77 62 Q65 15 117 18 Q166 14 164 62 Q145 36 120 39 Q91 39 77 62" fill="#75452f"/><ellipse cx="105" cy="72" rx="9" ry="11" fill="#fff"/><ellipse cx="136" cy="72" rx="9" ry="11" fill="#fff"/><circle cx="108" cy="72" r="4" fill="#263b51"/><circle cx="139" cy="72" r="4" fill="#263b51"/><path d="M107 94 Q121 105 136 93" stroke="#a75f53" stroke-width="4" fill="none" stroke-linecap="round"/></g><rect x="53" y="110" width="134" height="57" rx="9" fill="#477db1" stroke="#24567e" stroke-width="5"/><rect x="65" y="120" width="110" height="32" rx="4" fill="#a5d8ed"/><path d="M96 176 H145" stroke="#315777" stroke-width="8" stroke-linecap="round"/></svg><strong>EYES UP FRONT</strong></div><div class="freeze-kinder-panel"><svg viewBox="0 0 240 180" role="img" aria-label="Child lowers headphones from ears to rest around neck"><rect x="3" y="3" width="234" height="174" rx="20" fill="#e5f6e2"/><path d="M50 176 Q50 126 120 125 Q190 126 190 176" fill="#54a8d2"/><rect x="108" y="104" width="24" height="31" rx="9" fill="#eab18b"/><g class="freeze-headphones-lower"><path d="M81 139 V130 Q81 105 120 105 Q159 105 159 130 V139" fill="none" stroke="#315db4" stroke-width="13" stroke-linecap="round"/></g><ellipse cx="120" cy="72" rx="43" ry="49" fill="#f4c29c"/><path d="M77 65 Q65 18 120 19 Q170 20 163 65 Q145 42 121 41 Q96 42 77 65" fill="#68452e"/><ellipse cx="104" cy="76" rx="8" ry="10" fill="#fff"/><ellipse cx="137" cy="76" rx="8" ry="10" fill="#fff"/><circle cx="106" cy="76" r="4" fill="#293c50"/><circle cx="139" cy="76" r="4" fill="#293c50"/><path d="M108 99 Q121 109 135 99" stroke="#a85e52" stroke-width="4" fill="none" stroke-linecap="round"/><g class="freeze-headphones-lower"><rect x="71" y="130" width="23" height="30" rx="9" fill="#ffbf39" stroke="#315db4" stroke-width="5"/><rect x="146" y="130" width="23" height="30" rx="9" fill="#ffbf39" stroke="#315db4" stroke-width="5"/></g></svg><strong>HEADPHONES DOWN</strong></div></div><p>Hands off your trackpad.</p></div>';document.body.append(e);return e;}
function lock(){if(teacherSession()||locked)return;locked=true;overlay().hidden=false;document.body.classList.add('student-screen-frozen');}
function unlock(){locked=false;const e=document.getElementById('studentFreezeOverlay');if(e)e.hidden=true;if(document.body.classList.contains('student-screen-frozen'))document.body.classList.remove('student-screen-frozen');}
function applyShared(data,id){
 if(stopped||id<applied)return;
 const nextEpoch=data.freezeStateEpoch||'legacy',nextRevision=Number(data.freezeStateRevision)||0;
 if(epoch===nextEpoch&&nextRevision<revision)return;
 applied=id;epoch=nextEpoch;revision=nextRevision;
 const wasArmed=shared.freezeScreenArmed;
 shared={freezeScreenFeatureEnabled:parse(data.freezeScreenFeatureEnabled),freezeScreenArmed:parse(data.freezeScreenArmed),freezeScreenImmediate:parse(data.freezeScreenImmediate),freezeTimerEndsAt:Number.isFinite(data.freezeTimerEndsAt)?data.freezeTimerEndsAt:null};
 timerSupported=Object.prototype.hasOwnProperty.call(data,'freezeTimerEndsAt');
 remainingAt=shared.freezeTimerEndsAt===null?0:performance.now()+Math.max(0,shared.freezeTimerEndsAt-(Number(data.serverNow)||Date.now()));
 localStorage.setItem(FEATURE,String(shared.freezeScreenFeatureEnabled));
 if(teacher){sessionStorage.setItem(ARMED,String(shared.freezeScreenArmed));unlock();}
 else if(!shared.freezeScreenFeatureEnabled||!shared.freezeScreenArmed)unlock();
 else if(shared.freezeScreenImmediate)lock();
 else if(!wasArmed)armedAt=performance.now();
 render();
}
function blockInput(e){
 if(teacherSession())return;
 if(!locked&&shared.freezeScreenFeatureEnabled&&shared.freezeScreenArmed&&e.pointerType!=='touch'&&performance.now()-armedAt>=650&&(e.type==='pointermove'||e.type==='pointerdown'))lock();
 if(locked){e.preventDefault();e.stopImmediatePropagation();}
}
async function read(url){const id=++issued,response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Could not read Freeze controls.');const data=await response.json();applyShared(data,id);return data;}
async function poll(){if(stopped||inFlight||busy||document.hidden)return;inFlight=true;try{await read(STATE);}catch{/* Keep the last confirmed classroom state while offline. */}finally{inFlight=false;}}
async function change(url,body){
 if(busy||stopped||!teacherSession())return false;
 busy=true;errorText='';render();const id=++issued;
 try{const response=await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw Error(data.error||'Freeze command failed. Try again.');applyShared(data,id);return true;}
 catch(error){errorText=error.message||'Could not update Freeze. Try again.';return false;}
 finally{busy=false;render();}
}
function timeText(){const seconds=Math.max(0,Math.ceil((remainingAt-performance.now())/1000));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function render(){
 if(!ui)return;
 const enabled=shared.freezeScreenFeatureEnabled,armed=shared.freezeScreenArmed,running=shared.freezeTimerEndsAt!==null;
 ui.freeze.disabled=busy||!enabled;ui.freeze.classList.toggle('is-armed',armed);ui.freeze.classList.toggle('is-off',!armed);ui.freeze.setAttribute('aria-pressed',String(armed));ui.freeze.setAttribute('aria-label',armed?'Release class':'Arm Freeze Screen');ui.freeze.title=armed?'Release class':'Arm Freeze Screen';
 ui.clock.classList.toggle('has-countdown',running);ui.readout.hidden=!running;ui.readout.textContent=running?timeText():'';ui.clock.title=running?'Freeze in '+timeText()+' — timer controls':'Freeze timer';ui.clock.setAttribute('aria-label',ui.clock.title);
 ui.display.textContent=running?timeText():shared.freezeScreenImmediate?'Class frozen':armed?'Freeze armed':'Ready';
 ui.start.disabled=busy||!enabled||!timerSupported;ui.cancel.disabled=busy||!running;ui.release.disabled=busy||(!armed&&!running);ui.logout.disabled=busy;ui.minutes.disabled=ui.seconds.disabled=busy;
 ui.status.classList.toggle('is-error',!!errorText);
 ui.status.textContent=errorText||(!timerSupported?'Restart the Node server, then refresh to use the timer.':!enabled?'Enable Freeze Screen in Teacher Settings first.':shared.freezeScreenImmediate?'Time is up. Student screens are frozen.':running?'The class will freeze automatically when this reaches zero.':armed?'Freeze is armed. Use Release class when you are ready.':'Set working time, then start. Starting a timer releases the class until time is up.');
}
function buildTeacherControls(){
 const freeze=element('button','teacherFreezeButton');freeze.type='button';freeze.className='teacher-freeze-button';freeze.addEventListener('click',()=>change(SETTINGS,{freezeScreenArmed:!shared.freezeScreenArmed}));document.body.append(freeze);
 const clock=element('button','teacherFreezeTimerButton');clock.type='button';clock.className='teacher-freeze-timer-button';clock.setAttribute('aria-expanded','false');clock.setAttribute('aria-controls','teacherFreezeTimerPanel');
 const symbol=element('span',null,'◷');symbol.setAttribute('aria-hidden','true');const readout=element('span','teacherFreezeTimerReadout');readout.hidden=true;clock.append(symbol,readout);document.body.append(clock);
 const panel=element('section','teacherFreezeTimerPanel');panel.className='teacher-freeze-timer-panel';panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','teacherFreezeTimerHeading');
 const heading=element('div');heading.className='freeze-timer-heading';const title=element('h2','teacherFreezeTimerHeading','Freeze timer'),close=element('button',null,'×');close.type='button';close.setAttribute('aria-label','Close timer controls');heading.append(title,close);panel.append(heading);
 const display=element('output','teacherFreezeTimerCountdown','Ready');display.className='freeze-timer-countdown';display.setAttribute('aria-live','off');panel.append(display);
 let saved=Number(sessionStorage.getItem(DURATION));if(!Number.isInteger(saved)||saved<1||saved>86400)saved=300;
 const fields=element('div');fields.className='freeze-timer-fields';const minLabel=element('label',null,'Minutes'),secLabel=element('label',null,'Seconds');
 const minutes=element('input','teacherFreezeTimerMinutes'),seconds=element('input','teacherFreezeTimerSeconds');
 for(const input of [minutes,seconds]){input.type='number';input.min='0';input.step='1';input.required=true;input.inputMode='numeric';}minutes.max='1440';seconds.max='59';minutes.value=String(Math.floor(saved/60));seconds.value=String(saved%60);minLabel.append(minutes);secLabel.append(seconds);fields.append(minLabel,secLabel);panel.append(fields);
 const actions=element('div');actions.className='freeze-timer-actions';const start=element('button','teacherFreezeTimerStart','Start timer'),cancel=element('button','teacherFreezeTimerCancel','Cancel timer'),release=element('button','teacherFreezeTimerRelease','Release class'),logout=element('button','teacherFreezeTimerLogout','Log out');
 for(const button of [start,cancel,release,logout]){button.type='button';actions.append(button);}panel.append(actions);
 const status=element('p','teacherFreezeTimerStatus');status.setAttribute('role','status');status.setAttribute('aria-live','polite');panel.append(status);document.body.append(panel);
 ui={freeze,clock,readout,panel,display,minutes,seconds,start,cancel,release,logout,status};
 clock.addEventListener('click',()=>{panel.hidden=!panel.hidden;clock.setAttribute('aria-expanded',String(!panel.hidden));render();if(!panel.hidden)minutes.focus();});
 close.addEventListener('click',()=>{panel.hidden=true;clock.setAttribute('aria-expanded','false');clock.focus();});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;clock.setAttribute('aria-expanded','false');clock.focus();}});
 start.addEventListener('click',async()=>{
  const m=Number(minutes.value),s=Number(seconds.value),total=m*60+s;
  if(minutes.value.trim()===''||seconds.value.trim()===''||!Number.isInteger(m)||!Number.isInteger(s)||m<0||s<0||s>59||total<1||total>86400){errorText='Enter minutes and seconds, from one second to 24 hours.';render();return;}
  if(await change(TIMER,{durationSeconds:total}))sessionStorage.setItem(DURATION,String(total));
 });
 cancel.addEventListener('click',()=>change(TIMER,{action:'cancel'}));release.addEventListener('click',()=>change(SETTINGS,{freezeScreenArmed:false}));
 async function logoutTeacher(){
  if(!teacherSession()||busy)return false;
  // Keep the teacher session if release fails; never redirect a teacher into a locked student screen.
  if(!await change(SETTINGS,{freezeScreenArmed:false}))return false;
  try { const r=await fetch("/api/teacher-session",{method:"DELETE"});if(!r.ok)throw Error("Logout failed"); } catch { errorText="Could not complete logout. Try again.";render();return false; }
  stopped=true;window.clearInterval(pollHandle);window.clearInterval(drawHandle);window.clearInterval(heartbeatHandle);sessionStorage.removeItem(TEACHER);sessionStorage.removeItem(ARMED);unlock();window.location.assign(homeURL);return true;
 }
 window.handsOnTrackpadTeacherLogout=logoutTeacher;logout.addEventListener('click',logoutTeacher);render();
}
async function initialize(){
 teacher=teacherSession();
 if(teacher){
  try{
   const r=await fetch('/api/teacher-session',{cache:'no-store'});
   if(r.status===401){
    teacher=false;
    sessionStorage.removeItem(TEACHER);
    sessionStorage.removeItem(ARMED);
   }else if(!r.ok){
    teacher=false;
   }else{
    const status=await r.json();
    teacher=status.authenticated===true;
    if(!teacher){
     sessionStorage.removeItem(TEACHER);
     sessionStorage.removeItem(ARMED);
    }
   }
  }
  catch{
   // A temporary connection failure is not a confirmed logout.
   // Do not grant teacher controls without server verification.
   teacher=false;
  }
 }
 shared.freezeScreenFeatureEnabled=parse(localStorage.getItem(FEATURE));
 if(teacher){shared.freezeScreenArmed=parse(sessionStorage.getItem(ARMED));buildTeacherControls();}
 else{overlay();for(const type of ['pointermove','pointerdown','pointerup','click','dblclick','wheel','keydown','contextmenu','dragstart','drop'])document.addEventListener(type,blockInput,{capture:true,passive:false});}
 try{await read(SETTINGS);}catch{if(teacher){errorText='Could not load Freeze controls. Check the server and refresh.';render();}}
 pollHandle=window.setInterval(poll,500);
 if(teacher){
  drawHandle=window.setInterval(render,250);
  heartbeatHandle=window.setInterval(async()=>{
   if(stopped||document.hidden)return;
   try{const r=await fetch('/api/teacher-session',{method:'PUT'});if(!r.ok)throw Error('Expired');}
   catch{errorText='Teacher connection lost. Freeze will release automatically if not restored.';render();}
  },5000);
 }
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){render();poll();}});window.addEventListener('focus',()=>{render();poll();});window.addEventListener('pageshow',()=>{render();poll();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
