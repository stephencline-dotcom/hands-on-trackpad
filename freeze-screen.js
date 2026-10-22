/* Shared manual Freeze + server-owned countdown. Timer state is never permanent. */
(()=>{'use strict';
const SETTINGS='/api/settings',STATE='/api/classroom-state',TIMER='/api/freeze-timer';
const TEACHER='handsOnTrackpadTeacherSession',FEATURE='freezeScreenFeatureEnabled',ARMED='freezeScreenArmed',DURATION='handsOnTrackpadFreezeTimerSeconds';
const scriptURL=document.currentScript?.src||new URL('/freeze-screen.js',location.href).href,homeURL=new URL('index.html',scriptURL).href;
const parse=(v,f=false)=>v===undefined||v===null?f:v===true||v==='true';
let teacher=false,locked=false,armedAt=0,shared={freezeScreenFeatureEnabled:false,freezeScreenArmed:false,freezeScreenImmediate:false,freezeTimerEndsAt:null};
let epoch=null,revision=-1,issued=0,applied=0,remainingAt=0,timerSupported=false,inFlight=false,busy=false,stopped=false,pollHandle,drawHandle,ui=null,errorText='';
function teacherSession(){return sessionStorage.getItem(TEACHER)==='true';}
function element(tag,id,text){const e=document.createElement(tag);if(id)e.id=id;if(text!==undefined)e.textContent=text;return e;}
function overlay(){let e=document.getElementById('studentFreezeOverlay');if(e)return e;e=element('div','studentFreezeOverlay');e.className='student-freeze-overlay';e.hidden=true;e.setAttribute('role','alert');e.innerHTML='<div class="student-freeze-message"><div class="student-freeze-eyes">👀</div><h2>EYES UP FRONT</h2><p>Hands off your trackpad.</p></div>';document.body.append(e);return e;}
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
  stopped=true;window.clearInterval(pollHandle);window.clearInterval(drawHandle);sessionStorage.removeItem(TEACHER);sessionStorage.removeItem(ARMED);unlock();window.location.assign(homeURL);return true;
 }
 window.handsOnTrackpadTeacherLogout=logoutTeacher;logout.addEventListener('click',logoutTeacher);render();
}
async function initialize(){
 teacher=teacherSession();shared.freezeScreenFeatureEnabled=parse(localStorage.getItem(FEATURE));
 if(teacher){shared.freezeScreenArmed=parse(sessionStorage.getItem(ARMED));buildTeacherControls();}
 else{overlay();for(const type of ['pointermove','pointerdown','pointerup','click','dblclick','wheel','keydown','contextmenu','dragstart','drop'])document.addEventListener(type,blockInput,{capture:true,passive:false});}
 try{await read(SETTINGS);}catch{if(teacher){errorText='Could not load Freeze controls. Check the server and refresh.';render();}}
 pollHandle=window.setInterval(poll,500);if(teacher)drawHandle=window.setInterval(render,250);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){render();poll();}});window.addEventListener('focus',()=>{render();poll();});window.addEventListener('pageshow',()=>{render();poll();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
