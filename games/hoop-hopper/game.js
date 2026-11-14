(() => {
 'use strict';
 const M=window.HoopHopperModel,$=id=>document.getElementById(id),canvas=$('hpCanvas'),ctx=canvas.getContext('2d'),overlay=$('hpOverlay'),cue=$('hpCue');
 const BEST_KEY='hoop-hopper-best-v1',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let state=M.create(),mode='ready',primary=null,secondary=null,best=0,runSaved=false,clock=0,last=0,camera=0,particles=[],trail=[],callout=null,fallTime=0,landingPulse=0;
 let settingsReady=false,settingsBusy=false,active=true,soundOn=localStorage.getItem('soundEnabled')!=='false',globalSound=true,audio=null,voices=new Set(),forecast=false,nextForecast=0;
 let frame={width:480,height:720,scale:1,x:0,y:0,dpr:1};
 const OUTBOX_KEY='hoop-hopper-score-outbox-v1';
 let runId='',runPeak=0,practice=false,namesEnabled=false,showLeaders=false,showScoreNames=false,scoreBusy=false,topScores=[],outbox=[];
 try{const saved=JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]');if(Array.isArray(saved))outbox=saved.filter(v=>v&&typeof v.runId==='string'&&Number.isInteger(v.score)&&v.score>0).slice(0,20);}catch{}
 function newRunId(){return window.crypto?.randomUUID?.()||`${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;}
 function saveOutbox(){try{localStorage.setItem(OUTBOX_KEY,JSON.stringify(outbox));}catch{}}
 function scoreRecord(){let name='';if(namesEnabled){try{name=window.trackpadStudentProfile?.getName?.()||localStorage.getItem('moving-sound-student-name-v1')||'';}catch{}}return {runId,studentId:window.trackpadStudentProfile?.getStudentId?.()||'',score:runPeak,...(name?{name:String(name).trim().slice(0,40)}:{})};}
 function queueScore(flush=true){if(practice||!runId||runPeak<1)return;const record=scoreRecord(),previous=outbox.find(v=>v.runId===runId);if(previous){previous.score=Math.max(previous.score,record.score);if(record.name)previous.name=record.name;else delete previous.name;}else outbox.push(record);outbox.sort((a,b)=>b.score-a.score);outbox=outbox.slice(0,20);saveOutbox();if(flush)syncScores();}
 function renderLeaders(){const panel=$('hpLeaders');if(!panel)return;panel.hidden=!showLeaders;document.body.classList.toggle('hoop-top-scores-on',showLeaders);document.body.classList.toggle('hoop-score-names-on',showLeaders&&showScoreNames);for(let i=0;i<3;i++){const record=topScores[i];$('hpTop'+(i+1)).textContent=record?record.score:'—';const label=$('hpTopName'+(i+1));label.textContent=showLeaders&&showScoreNames&&record?record.name||'Player':'';label.title=label.textContent;}}
 async function syncScores(){if(scoreBusy||document.hidden)return;scoreBusy=true;let succeeded=false;try{
  for(const record of outbox.map(value=>({...value}))){const response=await fetch('/api/hoop-hopper-scores',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(record)});if(!response.ok){if(response.status===400){outbox=outbox.filter(v=>v.runId!==record.runId);saveOutbox();continue;}throw Error('Score save unavailable');}const data=await response.json();topScores=Array.isArray(data.scores)?data.scores:[];outbox=outbox.filter(v=>v.runId!==record.runId||v.score!==record.score||v.name!==record.name);saveOutbox();}
  if(showLeaders){const response=await fetch('/api/hoop-hopper-scores',{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw Error('Score board unavailable');const data=await response.json();topScores=Array.isArray(data.scores)?data.scores:[];showScoreNames=data.showNames===true;}
 succeeded=true;}catch{/* Keep pending scores for a later attempt; gameplay remains available. */}finally{scoreBusy=false;renderLeaders();if(succeeded&&outbox.length&&!document.hidden)Promise.resolve().then(syncScores);}}

 try{const value=Number(localStorage.getItem(BEST_KEY));best=Number.isFinite(value)?Math.max(0,Math.floor(value)):0;}catch{}
 function frozen(){return document.body.classList.contains('student-screen-frozen')||document.getElementById('studentFreezeOverlay')?.hidden===false;}
 function stopAudio(){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
 function tone(hz,length=.11,kind='sine',volume=.12,endHz=hz,delay=0){
  if(!soundOn||!globalSound||document.hidden||frozen()||mode==='paused'||!audio||audio.state==='closed')return;
  try{const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+delay;osc.type=kind;osc.frequency.setValueAtTime(hz,t);osc.frequency.exponentialRampToValueAtTime(Math.max(40,endHz),t+length);gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(Math.min(.16,volume),t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+length);osc.connect(gain);gain.connect(audio.destination);voices.add(osc);osc.onended=()=>voices.delete(osc);osc.start(t);osc.stop(t+length+.015);}catch{}
 }
 function sfx(name){const sounds={start:[[440,.08,'triangle',.1,580,0],[660,.11,'sine',.13,760,.075]],jump:[[280,.14,'sine',.13,670,0]],land:[[790,.085,'sine',.13,1060,0]],milestone:[[660,.1,'sine',.11,660,0],[880,.1,'sine',.12,880,.08],[1100,.15,'sine',.14,1200,.16]],fall:[[360,.25,'triangle',.12,100,0]],toggle:[[620,.09,'sine',.11,840,0]]};for(const note of sounds[name]||[])tone(...note);}
 function unlockAudio(){try{if(!audio||audio.state==='closed'){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)audio=new Audio();}if(audio?.state==='suspended')audio.resume().catch(()=>{});}catch{}}
 function soundIcon(){const on=soundOn&&globalSound,b=$('hpSound');b.textContent=on?'🔊':'🔇';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'Sound on':'Sound off');b.title=on?'Sound on':'Sound off';}
 function status(text){$('hpStatus').textContent=text;}
 function updateBest(){if(!practice)runPeak=Math.max(runPeak,state.score);if(state.score>best){best=state.score;try{localStorage.setItem(BEST_KEY,String(best));}catch{}}}
 function stats(){$('hpScore').textContent=state.score;$('hpBest').textContent=best;}
 function dialog(title,description,label,handler,other,otherHandler,footnote=''){
  overlay.hidden=false;$('hpHeading').textContent=title;$('hpDescription').textContent=description;$('hpStart').textContent=label;primary=handler;$('hpSecondary').textContent=other||'';$('hpSecondary').hidden=!other;secondary=otherHandler;$('hpFootnote').textContent=footnote;$('hpStart').focus({preventScroll:true});
 }
 function prepare(){queueScore();runId=newRunId();runPeak=0;practice=false;stopAudio();state=M.create();mode='ready';runSaved=false;camera=0;particles=[];trail=[];callout=null;fallTime=0;landingPulse=0;nextForecast=0;forecast=false;stats();cue.hidden=true;$('hpStart').disabled=!settingsReady;$('hpSecondary').disabled=!settingsReady;$('hpPause').disabled=true;$('hpEyebrow').textContent='How high can you go?';$('hpInstructions').textContent='Wait for the gap, then click once to jump to the next platform.';
  dialog('Hop into the sky','Click once to jump through the opening. Start with simple rings, then watch for new shapes and layered obstacles.',"Let's hop!",start,'Show me',beginDemo,'20 points per platform · A fresh climb every run');
 }
 function start(){if(!settingsReady||!active)return;unlockAudio();mode='playing';overlay.hidden=true;$('hpPause').disabled=false;sfx('start');canvas.focus({preventScroll:true});status('Wait for the gap, then click once to jump.');}
 function pause(){if(mode!=='playing'&&mode!=='demo')return;const resume=mode;mode='paused';stopAudio();cue.hidden=true;dialog('Paused','Your ball is waiting on its climb.','Keep jumping',()=>{mode=resume;overlay.hidden=true;canvas.focus({preventScroll:true});},'New run',()=>{prepare();start();},'A new run starts at zero. Your best score stays saved.');}
 function beginDemo(){if(!settingsReady||!active)return;practice=true;unlockAudio();state=M.create(78123);mode='demo';camera=0;particles=[];trail=[];callout=null;nextForecast=0;forecast=false;overlay.hidden=true;$('hpPause').disabled=false;stats();status('Watch the ball wait, then jump through the opening.');}
 function jump(){if(mode!=='playing'||frozen()||!active)return;unlockAudio();if(M.jump(state)){sfx('jump');cue.hidden=true;burst(state.player.x,state.player.y,'#c7f9f2',9);}}
 function burst(x,y,color,count=18){if(reduced)count=5;for(let i=0;i<count;i++){const angle=i*Math.PI*2/count;particles.push({x,y,vx:Math.cos(angle)*(25+Math.random()*80),vy:Math.sin(angle)*(25+Math.random()*80),time:0,life:.45+Math.random()*.5,color});}}
 function saveResult(){queueScore();if(runSaved||!window.gameResultsStore)return;runSaved=true;let name='Student';try{name=(localStorage.getItem('moving-sound-student-name-v1')||'Student').trim().slice(0,60)||'Student';}catch{}
  window.gameResultsStore.saveResult({gameName:'Hoop Hopper',studentName:name,levelCompleted:0,correctClicks:state.jumps,missedClicks:state.misses,totalClicks:state.attempts,playedAtMs:Date.now()}).catch(()=>status('Run ended. Result could not be saved.'));
 }
 function crash(){const demo=mode==='demo';mode=demo?'demo-falling':'falling';fallTime=0;trail=[];cue.hidden=true;callout=null;stopAudio();sfx('fall');burst(state.player.x,state.player.y,'#dfc3ff',24);$('hpPause').disabled=true;if(!demo){updateBest();saveResult();}status('Your ball touched the hoop. Try again to beat your best.');}
 function gameOver(){mode='lost';$('hpEyebrow').textContent='A new personal best is waiting';dialog('Nice climb!',`Score: ${state.score} · Best: ${best}. ${state.jumps} platforms reached.`,'Try again',()=>{prepare();start();},state.score>=75?'Continue −75':null,()=>{if(M.continueRun(state)){runSaved=false;fallTime=0;particles=[];camera=M.point(state,state.current).y;mode='playing';overlay.hidden=true;nextForecast=0;$('hpPause').disabled=false;stats();sfx('start');canvas.focus({preventScroll:true});}},state.score>=75?'Continue from this platform for 75 points, or start a fresh run.':'20 points for each landing. Every new run starts at zero.');}
 function fitCanvas(){const rect=canvas.getBoundingClientRect(),width=Math.max(1,rect.width),height=Math.max(1,rect.height),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);const scale=Math.min(width/480,height/720);frame={width,height,dpr,scale,x:(width-480*scale)/2,y:(height-720*scale)/2};}
 function project(x,y){return {x,y:540-(y-camera)};}
 function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
 function text(value,x,y,size,color='#fff',weight=800){ctx.font=`${weight} ${size}px system-ui`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(value,x,y);}
 function line(x1,y1,x2,y2,color,width){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
 function blend(a,b,t){const aa=parseInt(a.slice(1),16),bb=parseInt(b.slice(1),16),parts=[16,8,0].map(shift=>Math.round(((aa>>shift)&255)*(1-t)+((bb>>shift)&255)*t));return `rgb(${parts.join(',')})`;}
 function background(){const palettes=[['#102743','#24376c'],['#292147','#664f8c'],['#123847','#28757c'],['#29294f','#5d7797']],band=Math.floor(state.current/12)%4,t=(state.current%12)/12;
  const top=blend(palettes[band][0],palettes[(band+1)%4][0],t),bottom=blend(palettes[band][1],palettes[(band+1)%4][1],t);
  ctx.setTransform(frame.dpr,0,0,frame.dpr,0,0);const sky=ctx.createLinearGradient(0,0,0,frame.height);sky.addColorStop(0,top);sky.addColorStop(1,bottom);ctx.fillStyle=sky;ctx.fillRect(0,0,frame.width,frame.height);
  ctx.setTransform(frame.dpr*frame.scale,0,0,frame.dpr*frame.scale,frame.dpr*frame.x,frame.dpr*frame.y);
  for(let i=0;i<115;i++){const x=(i*137.2)%1700-610,y=((i*71.6+camera*.12)%780+780)%780-30;ctx.globalAlpha=reduced?.5:.25+.45*Math.sin(clock*.45+i)**2;circle(x,y,i%9===0?2:1,'#d2eaff');}ctx.globalAlpha=1;
  const glow=ctx.createRadialGradient(95,195,1,95,195,180);glow.addColorStop(0,'#6e92e91a');glow.addColorStop(1,'#6e92e900');circle(95,195,180,glow);
 }
 function drawStations(){
  const focus=M.point(state,state.current),center=project(focus.x,focus.y+M.BALL);
  ctx.save();ctx.strokeStyle='#6dcce244';ctx.lineWidth=1.2;
  for(const side of [-1,1]){
   ctx.beginPath();ctx.moveTo(center.x+side*166,center.y-124);ctx.lineTo(center.x+side*166,center.y-88);ctx.lineTo(center.x+side*154,center.y-76);ctx.lineTo(center.x+side*154,center.y+86);ctx.lineTo(center.x+side*141,center.y+100);ctx.stroke();
   for(let y=-65;y<=70;y+=10)line(center.x+side*151,center.y+y,center.x+side*146,center.y+y,'#7ecce844',1);
  }
  for(const side of [-1,1])line(center.x+side*65,center.y,center.x+side*36,center.y,'#88bfdb33',1);
  ctx.restore();
  for(let i=state.base+state.stations.length-1;i>=state.base;i--){const station=M.point(state,i),p=project(station.x,station.y),active=station.activeAt!==null;if(p.y< -180||p.y>900)continue;
   for(const ring of M.rings(station,state.time)){
    const rp=project(ring.x,ring.y),color=station.double&&ring.r>100?'#d3a6ff':'#7adee4';
    ctx.save();ctx.translate(rp.x,rp.y);ctx.scale(1,-1);
    const angle=ring.orientation||0,gradient=ctx.createLinearGradient(-Math.cos(angle)*ring.r,-Math.sin(angle)*ring.r,Math.cos(angle)*ring.r,Math.sin(angle)*ring.r);
    gradient.addColorStop(0,'#ff5b51');gradient.addColorStop(.27,'#ffcc4e');gradient.addColorStop(.5,'#fff26a');gradient.addColorStop(.73,'#62ced2');gradient.addColorStop(1,'#9b59b4');
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=ring.width;ctx.strokeStyle=gradient;ctx.shadowColor=color;ctx.shadowBlur=reduced?0:5;ctx.globalAlpha=active?1:.85;
    ctx.beginPath();
    for(const arc of M.arcs(ring)){
     if(arc.type==='line'){ctx.moveTo(arc.ax-ring.x,arc.ay-ring.y);ctx.lineTo(arc.bx-ring.x,arc.by-ring.y);}
     else{ctx.moveTo(arc.x-ring.x+Math.cos(arc.start)*arc.r,arc.y-ring.y+Math.sin(arc.start)*arc.r);ctx.arc(arc.x-ring.x,arc.y-ring.y,arc.r,arc.start,arc.start+arc.span);}
    }
    ctx.stroke();
    ctx.restore();
   }

   ctx.globalAlpha=1;circle(p.x,p.y+10,35,'#00000022');line(p.x-45,p.y+5,p.x+45,p.y+5,'#4a547f',13);line(p.x-44,p.y,p.x+44,p.y,'#d8e9ff',11);line(p.x-35,p.y-3,p.x+35,p.y-3,'#ffffff',2);
   if(i>0&&i%5===0)text('✦',p.x+64,p.y+6,18,'#ffe28e');
  }}
 function drawBall(){if(mode==='lost')return;if(state.outcome!=='lost'){for(let i=0;i<trail.length;i++){const pos=project(trail[i].x,trail[i].y);circle(pos.x,pos.y,2+i/trail.length*3,'#fff0aa55');}}const p=project(state.player.x,state.player.y),fall=state.outcome==='lost'?fallTime:0,y=p.y+fall*fall*360,r=M.BALL*(1-Math.min(.6,fall*.5));ctx.save();ctx.globalAlpha=Math.max(0,1-fall*.7);
  const glow=ctx.createRadialGradient(p.x,y,1,p.x,y,30);glow.addColorStop(0,'#fff2aa66');glow.addColorStop(1,'#fff2aa00');circle(p.x,y,30,glow);
  const g=ctx.createRadialGradient(p.x-5,y-6,1,p.x,y,r);g.addColorStop(0,'#fffbc7');const ballColor=['#ff963e','#ff4c9f','#2bd2ea','#ffe353','#f12ac4'][state.current%5];g.addColorStop(.5,ballColor);g.addColorStop(1,blend(ballColor,'#23374b',.16));circle(p.x,y,r+landingPulse*2,g);circle(p.x-4,y-5,4,'#fffde5bb');ctx.restore();
 }
 function draw(){background();if(state.outcome==='lost'){drawBall();drawStations();}else{drawStations();drawBall();}for(const p of particles){const pos=project(p.x,p.y);ctx.globalAlpha=Math.max(0,1-p.time/p.life);circle(pos.x,pos.y,3,p.color);}ctx.globalAlpha=1;if(callout){const p=project(callout.x,callout.y);ctx.globalAlpha=1-callout.time;text(callout.text,p.x,p.y-25-callout.time*30,24,'#fff0a3');ctx.globalAlpha=1;}}
 function animate(now){const dt=Math.min((now-last)/1000||0,.034);last=now;if(!document.hidden&&!frozen()){
   clock+=dt;landingPulse=Math.max(0,landingPulse-dt*4);
   if(mode==='playing'||mode==='demo'){
    if(!state.flight&&(state.jumps<3||mode==='demo')&&state.time>=nextForecast){forecast=M.safeJump(state);nextForecast=state.time+.035;}
    if(mode==='demo'&&!state.flight&&forecast){if(M.jump(state)){sfx('jump');forecast=false;}}
    const events=M.step(state,dt);for(const event of events){if(event.type==='land'){landingPulse=1;burst(event.x,event.y,'#fff0a3');callout={x:event.x,y:event.y,text:state.jumps%5===0?`${state.score}!`:'+20',time:0};sfx(state.jumps%5===0?'milestone':'land');nextForecast=0;forecast=false;if(mode==='playing'){updateBest();if(state.jumps%5===0)queueScore();}status(`Score ${state.score}.`);}else crash();}
    if(mode==='demo'&&state.jumps>=3){prepare();status('Your turn. Click once when the hoop opening is above your ball.');}
    if(state.flight){trail.push({x:state.player.x,y:state.player.y});if(trail.length>14)trail.shift();}else if(trail.length)trail.shift();
    stats();
   }else if(mode==='falling'||mode==='demo-falling'){fallTime+=dt;if(fallTime>.68){if(mode==='demo-falling')prepare();else gameOver();}}
   const target=Math.max(M.point(state,state.current).y,state.player.y-150);if(!reduced)camera+=Math.max(0,target-camera)*(1-Math.exp(-dt*7));else camera=Math.max(camera,target);
   particles=particles.filter(p=>p.time<p.life);for(const p of particles){p.time+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=100*dt;}
   if(callout){callout.time+=dt;if(callout.time>=1)callout=null;}
  }else stopAudio();
  const teaching=(mode==='playing'&&state.jumps<3)||mode==='demo';cue.hidden=!teaching||!!state.flight;if(teaching){cue.textContent=mode==='demo'?'Watch: wait… then hop!':forecast?'CLICK ONCE TO HOP!':'Wait for the opening…';cue.classList.toggle('open',forecast);}
  if(mode==='playing')$('hpInstructions').textContent=state.jumps<3?'Wait for the gap, then click once to jump to the next platform.':'Keep climbing. Beat your best!';draw();requestAnimationFrame(animate);
 }
 async function readSettings(){if(settingsBusy)return;settingsBusy=true;try{const r=await fetch('/api/settings',{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('settings');const data=await r.json();active=data.hoopHopperGameActive!==false;namesEnabled=data.studentNameEntryEnabled===true;showLeaders=data.hoopHopperShowTopScores===true;showScoreNames=data.hoopHopperShowScoreNames===true;window.trackpadStudentProfile?.configure?.(data);renderLeaders();globalSound=data.soundEnabled!==false;try{localStorage.setItem('hoopHopperGameActive',String(active));}catch{}if(!globalSound)stopAudio();soundIcon();if(!active)location.replace('../../index.html');}
  catch{try{active=localStorage.getItem('hoopHopperGameActive')!=='false';}catch{}if(!active)location.replace('../../index.html');}
  finally{settingsReady=true;settingsBusy=false;$('hpStart').disabled=false;$('hpSecondary').disabled=false;syncScores();}
 }
 canvas.addEventListener('click',event=>{if(event.button===0)jump();});canvas.addEventListener('keydown',event=>{if((event.code==='Space'||event.code==='Enter')&&!event.repeat){event.preventDefault();jump();}});
 $('hpStart').onclick=()=>{if(!frozen()){unlockAudio();primary?.();}};$('hpSecondary').onclick=()=>{if(!frozen()){unlockAudio();secondary?.();}};$('hpPause').onclick=pause;
 $('hpSound').onclick=()=>{soundOn=!(soundOn&&globalSound);if(soundOn){unlockAudio();sfx('toggle');}else stopAudio();soundIcon();};
 window.addEventListener('trackpadStudentNamePromptOpen',()=>{stopAudio();pause();});window.addEventListener('trackpadStudentNameChanged',()=>queueScore());
 window.addEventListener('blur',()=>{stopAudio();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();pause();}});
 window.addEventListener('resize',fitCanvas);if(window.ResizeObserver)new ResizeObserver(fitCanvas).observe($('hpStage'));
 const poll=setInterval(readSettings,5000);window.addEventListener('pagehide',()=>{queueScore(false);if(!practice&&runId&&runPeak>0){fetch('/api/hoop-hopper-scores',{method:'POST',keepalive:true,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(scoreRecord())}).catch(()=>{});}stopAudio();clearInterval(poll);audio?.close();},{once:true});
 fitCanvas();soundIcon();prepare();readSettings();requestAnimationFrame(animate);
})();
