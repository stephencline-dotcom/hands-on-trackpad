/* Shared named classroom Top 3. Game code supplies its actual score explicitly. */
(() => {
 'use strict';
 if(window.classroomScores||/\/(?:admin(?:-settings)?|teacher)\.html$/i.test(location.pathname))return;
 const STORE='classroom-score-outbox-v1',NAME='moving-sound-student-name-v1';
 const titles={'car-game':'Car Game','deer-run':'Deer Run','bug-meadow':'Bug Meadow','haunted-street':'Haunted Street','monster-lunch':'Monster Lunch','firefly-forest':'Firefly Forest','sense-rescue':'Sense Rescue','follow-bird-moving':'Follow the Bird · Moving','follow-bird-clicking':'Follow the Bird · Clicking','light-tap':'Light Tap','street-car':'Street Car','dragon-dodge':'Dragon Dodge','firefighter-rescue':'Firefighter Rescue','martian-madness':'Martian Madness'};
 for(let i=0;i<4;i++)titles['zig-zag-trail-'+i]='Zig Zag Trail · Trail '+(i+1);
 titles['golden-dot']='Golden Dot · Level & stars';
 const screens={'light-tap':'#gameScreen','street-car':'#carGameScreen','dragon-dodge':'#dragonGameScreen','firefighter-rescue':'#fireGameScreen','martian-madness':'#martianGameScreen'};
 let settings={},active='',board=null,busy=false,pending=[],shown=[],lastFetch=0;const runs=new Map();
 const uuid=()=>window.crypto?.randomUUID?.()||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+'_'+Math.random().toString(36).slice(2);
 const name=()=>{try{return (window.trackpadStudentProfile?.getName?.()||localStorage.getItem(NAME)||'').trim().slice(0,40);}catch{return '';}};
 const studentId=()=>{try{if(window.trackpadStudentProfile?.getStudentId)return window.trackpadStudentProfile.getStudentId();const key='trackpad-score-device-v1';let id=localStorage.getItem(key);if(!id){id=uuid();localStorage.setItem(key,id);}return id;}catch{return '';}};
 try{const saved=JSON.parse(localStorage.getItem(STORE)||'[]');if(Array.isArray(saved))pending=saved.filter(v=>v&&titles[v.game]&&Number.isInteger(v.score)&&v.score>0).slice(0,100);}catch{}
 function persist(){try{localStorage.setItem(STORE,JSON.stringify(pending));}catch{}}
 function hostFor(key){if(key==='sense-rescue')return document.querySelector('#senseRescuePlayfield');const root=screens[key]?document.querySelector(screens[key]):document;return root?.querySelector('.game-stage')||root?.querySelector('#senseRescuePlayfield');}
 function activate(key){if(!titles[key]||active===key)return;active=key;shown=[];render();sync();}
 function begin(key){if(!titles[key])return;const old=runs.get(key);if(old?.score>0)enqueue(key,old);runs.set(key,{runId:uuid(),score:0,name:name(),studentId:studentId()});const host=hostFor(key);if(host&&!host.closest('[hidden]'))activate(key);}
 function enqueue(key,run){if(run.score<1)return;const record={game:key,runId:run.runId,score:run.score,studentId:run.studentId,...(run.name?{name:run.name}:{})};const old=pending.find(v=>v.game===key&&v.runId===run.runId);if(old)Object.assign(old,record);else pending.push(record);pending=pending.slice(-100);persist();}
 function update(key,score){if(!titles[key]||!Number.isInteger(score)||score<1)return;const currentName=name();let run=runs.get(key);if(!run||run.name!==currentName){begin(key);run=runs.get(key);}if(score>run.score){run.score=score;enqueue(key,run);}activate(key);render();sync();}
 function record(key,score){begin(key);update(key,score);}
 function render(){
  const show=settings.hoopHopperShowTopScores===true&&!!active,host=hostFor(active);
  if(!board&&host){board=document.createElement('section');board.className='classroom-score-board';board.setAttribute('aria-label','Classroom top three students');board.innerHTML='<div class="classroom-score-title"></div><ol>'+[1,2,3].map(i=>'<li><span class="classroom-score-rank">'+i+'</span><strong class="classroom-score-name"></strong><b class="classroom-score-number">—</b></li>').join('')+'</ol>';}
  if(!board)return;if(host&&board.parentNode!==host){if(getComputedStyle(host).position==='static')host.style.position='relative';host.append(board);}board.hidden=!show;
  board.querySelector('.classroom-score-title').textContent='CLASSROOM TOP 3 · '+(titles[active]||'');
  board.querySelectorAll('li').forEach((row,i)=>{const v=shown[i];row.querySelector('.classroom-score-name').textContent=v?(settings.hoopHopperShowScoreNames===true?(v.name||'Player'):'Score'):'—';row.querySelector('.classroom-score-number').textContent=v?(active==='golden-dot'?'Lv '+Math.floor(v.score/100)+' · ★ '+(v.score%100):v.score):'—';});
 }
 async function sync(){if(busy||document.hidden)return;busy=true;let succeeded=false;try{
  for(const value of pending.map(v=>({...v}))){const response=await fetch('/api/game-scores?game='+encodeURIComponent(value.game),{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});if(!response.ok){if(response.status===400){pending=pending.filter(v=>v.runId!==value.runId);persist();continue;}throw Error('Scores unavailable');}await response.json();pending=pending.filter(v=>v.runId!==value.runId||v.score!==value.score||v.name!==value.name);persist();}
  if(active&&settings.hoopHopperShowTopScores===true){const key=active,response=await fetch('/api/game-scores?game='+encodeURIComponent(key),{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw Error('Scores unavailable');const data=await response.json();if(key===active){shown=Array.isArray(data.scores)?data.scores:[];settings.hoopHopperShowScoreNames=data.showNames===true;lastFetch=Date.now();}}
 succeeded=true;}catch{/* Retain pending scores and retry, without interrupting a game. */}finally{busy=false;render();if(succeeded&&pending.length&&!document.hidden)Promise.resolve().then(sync);}}
 async function refresh(){try{const response=await fetch('/api/settings',{cache:'no-store',credentials:'same-origin'});if(response.ok){settings=await response.json();window.trackpadStudentProfile?.configure?.(settings);if(settings.hoopHopperShowScoreNames!==true)shown=shown.map(v=>({score:v.score}));render();}}catch{}await sync();}
 const style=document.createElement('style');style.textContent='.classroom-score-board[hidden]{display:none!important}.classroom-score-board{position:absolute;top:8px;right:8px;z-index:25;pointer-events:none;width:min(290px,calc(100% - 16px));box-sizing:border-box;padding:8px 11px;border:1px solid #a5deedaa;border-radius:12px;background:#09253dec;color:white;box-shadow:0 3px 14px #0004;font-family:system-ui;line-height:1.25}.classroom-score-title{font-size:9px;font-weight:750;color:#a6dfef;letter-spacing:.5px;margin-bottom:5px}.classroom-score-board ol{list-style:none;margin:0;padding:0;display:grid;gap:3px}.classroom-score-board li{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:7px}.classroom-score-rank{font-size:11px;color:#a9ccdf}.classroom-score-name{font-size:16px;font-weight:850;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.classroom-score-number{font-size:16px;font-weight:800;color:#ffe395;font-variant-numeric:tabular-nums}';document.head.append(style);
 const path=location.pathname;
 if(path.includes('moving-sound-mini-game'))active=({light:'light-tap',car:'street-car',dragon:'dragon-dodge',fire:'firefighter-rescue',martian:'martian-madness'})[new URLSearchParams(location.search).get('game')]||'light-tap';
 else if(path.endsWith('/car.html'))active='car-game';
 else if(path.endsWith('/follow-the-bird.html'))active='follow-bird-moving';
 else for(const key of ['deer-run','bug-meadow','haunted-street','monster-lunch','firefly-forest','sense-builder','zig-zag-trail','golden-dot'])if(path.includes('/games/'+key+'/'))active=key==='sense-builder'?'sense-rescue':key==='zig-zag-trail'?'zig-zag-trail-0':key==='golden-dot'?'golden-dot':key;
 window.classroomScores=Object.freeze({begin,update,record,activate,refresh});
 window.dispatchEvent(new CustomEvent('classroomScoresReady'));
 window.addEventListener('trackpadStudentNameChanged',()=>{for(const [key,run]of runs){if(!run.name&&run.score>0){run.name=name();run.studentId=studentId();enqueue(key,run);}}sync();});
 window.addEventListener('online',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 window.addEventListener('pagehide',()=>{persist();for(const value of pending.slice(-10))fetch('/api/game-scores?game='+encodeURIComponent(value.game),{method:'POST',keepalive:true,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)}).catch(()=>{});});
 // Games without scores do not poll or display a board, but can still retry saved scores.
 if(active||pending.length){refresh();setInterval(refresh,5000);}
})();
