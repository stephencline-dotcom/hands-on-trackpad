(() => {
 'use strict';
 const M=window.GoldenDotModel,$=id=>document.getElementById(id),canvas=$('gdCanvas'),ctx=canvas.getContext('2d'),overlay=$('gdOverlay'),board=$('gdLevelBoard');
 const PROGRESS_KEY='golden-dot-progress-v1',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let progress=M.parseProgress(null);try{progress=M.parseProgress(localStorage.getItem(PROGRESS_KEY));}catch{}
 let state=M.create(0),mode='levels',primary=null,secondary=null,preview=false,runSaved=false,settingsReady=false,settingsBusy=false,goal=50,active=true;
 let soundOn=localStorage.getItem('soundEnabled')!=='false',globalSound=true,audio=null,voices=new Set(),clock=0,last=0,hitPulse=0,shotPulse=0,shake=0,particles=[],demoHits=0,demoReturn={level:0,preview:false};
 let frame={width:480,height:720,scale:1,x:0,y:0,dpr:1};
 function frozen(){return document.body.classList.contains('student-screen-frozen')||document.getElementById('studentFreezeOverlay')?.hidden===false;}
 function stopAudio(){for(const osc of voices){try{osc.stop();}catch{}}voices.clear();}
  // Short synthesized effects need no downloaded audio files. Scheduled notes
  // remain in voices so mute, pause and Freeze cancel the complete sound.
  function tone(hz,length=.11,kind='sine',volume=.12,endHz=hz,delay=0){
    if(!soundOn||!globalSound||document.hidden||frozen()||mode==='paused'||!audio||audio.state==='closed')return;
    try{
      const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+delay;
      osc.type=kind;osc.frequency.setValueAtTime(hz,t);osc.frequency.exponentialRampToValueAtTime(Math.max(40,endHz),t+length);
      gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(Math.min(.16,volume),t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+length);
      osc.connect(gain);gain.connect(audio.destination);voices.add(osc);osc.onended=()=>voices.delete(osc);osc.start(t);osc.stop(t+length+.015);
    }catch{/* Audio is optional; a blocked device must not interrupt gameplay. */}
  }
  function sfx(name,variation=0){
    const sounds={
      start:[[440,.08,'triangle',.10,580,0],[660,.11,'sine',.13,760,.075]],
      turn:[[680+(variation%5)*35,.09,'sine',.14,950+(variation%5)*35,0]],
      milestone:[[660,.1,'sine',.11,660,0],[880,.1,'sine',.12,880,.08],[1100,.15,'sine',.14,1200,.16]],
      fall:[[380,.24,'triangle',.13,110,0]],
      shoot:[[720,.065,'triangle',.11,340,0]],
      hit:[[900+(variation%4)*30,.1,'sine',.14,1250+(variation%4)*30,0]],
      miss:[[210,.11,'triangle',.13,120,0]],
      win:[[523,.12,'triangle',.10,523,0],[659,.12,'triangle',.11,659,.09],[784,.2,'sine',.14,1046,.18]],
      lose:[[330,.14,'triangle',.12,220,0],[220,.2,'triangle',.11,110,.11]],
      toggle:[[620,.09,'sine',.11,840,0]]
    };
    for(const note of sounds[name]||[])tone(...note);
  }
  function unlockAudio(){
    try{
      if(!audio||audio.state==='closed'){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)audio=new Audio();}
      if(audio?.state==='suspended')audio.resume().catch(()=>{});
    }catch{/* Continue silently if the browser cannot open an audio device. */}
  }
 function soundIcon(){const on=soundOn&&globalSound,b=$('gdSound');b.textContent=on?'🔊':'🔇';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'Sound on':'Sound off');b.title=on?'Sound on':'Sound off';}
 function status(text){$('gdStatus').textContent=text;}
 function stats(){$('gdLevel').textContent=`${state.level+1} / 30`;$('gdHits').textContent=`${state.hits} / ${state.goal}`;}
 function publishLeaderboard(){const stars=progress.stars.reduce((sum,value)=>sum+value,0);if(stars>0)window.classroomScores?.record('golden-dot',progress.unlocked*100+stars);}
 function saveProgress(){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify({stars:progress.stars}));}catch{status('Level complete. This browser could not save progress.');}}
 function renderGrid(){const grid=$('gdGrid');grid.replaceChildren();M.levels.forEach((level,index)=>{
  const number=index+1,unlocked=number<=progress.unlocked,b=document.createElement('button');b.type='button';b.className='gd-level'+(unlocked?' available':'')+(progress.stars[index]?' completed':'');b.disabled=!unlocked||!settingsReady;b.setAttribute('aria-label',unlocked?`Level ${number}: ${level.name}${progress.stars[index]?`, ${progress.stars[index]} stars`:''}`:`Level ${number} locked`);
  if(unlocked){b.textContent=String(number);if(progress.stars[index]){const stars=document.createElement('span');stars.className='gd-mini-stars';stars.textContent='★'.repeat(progress.stars[index]);stars.setAttribute('aria-hidden','true');b.append(stars);}}
  else{b.innerHTML='<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M6 10V7a6 6 0 0112 0v3h1a3 3 0 013 3v11a3 3 0 01-3 3H5a3 3 0 01-3-3V13a3 3 0 013-3zm3 0h6V7a3 3 0 00-6 0zm3 6a2 2 0 00-1 3.73V23h2v-3.27A2 2 0 0012 16z"/></svg>';}
  b.onclick=()=>{if(number<=progress.unlocked&&settingsReady)prepare(index);};grid.append(b);
 });$('gdBoardNote').textContent=settingsReady?'Complete a level to unlock the next. Your stars save on this browser.':'Loading classroom settings…';}
 function showLevels(){mode='levels';stopAudio();particles=[];overlay.hidden=true;board.hidden=false;$('gdPause').disabled=true;renderGrid();status('Choose an unlocked level.');}
 function dialog(title,description,label,handler,otherLabel,otherHandler,footnote=''){
  overlay.hidden=false;$('gdHeading').textContent=title;$('gdDescription').textContent=description;$('gdStart').textContent=label;primary=handler;$('gdStart').focus({preventScroll:true});$('gdSecondary').textContent=otherLabel||'';$('gdSecondary').hidden=!otherLabel;secondary=otherHandler;$('gdFootnote').textContent=footnote;
 }
 function prepare(index,teacherPreview=false){window.classroomScores?.activate('golden-dot');stopAudio();state=M.create(index,goal);preview=teacherPreview;runSaved=false;particles=[];hitPulse=0;shotPulse=0;shake=0;mode='ready';board.hidden=true;$('gdStars').textContent='';stats();$('gdPause').disabled=true;$('gdEyebrow').textContent=`Level ${index+1} · ${M.levels[index].name}${preview?' · Teacher preview':''}`;
  dialog('Find the opening',`Click once to send a spark. Hit the golden dot ${state.goal} times and avoid the white barriers. You have three lives.`,'Start level',start,'Show me',beginDemo,preview?'Teacher preview does not unlock levels or save results.':'No timer. Watch, wait, then tap.');
 }
 function start(){if(!settingsReady||!active)return;unlockAudio();mode='playing';sfx('start');overlay.hidden=true;$('gdPause').disabled=false;canvas.focus({preventScroll:true});status(`Level ${state.level+1}. Wait for a clear opening, then click.`);}
 function pause(){if(mode!=='playing'&&mode!=='demo')return;const resume=mode;mode='paused';stopAudio();dialog('Paused','Your sparks and lives are waiting right here.','Keep playing',()=>{mode=resume;overlay.hidden=true;canvas.focus({preventScroll:true});},'Levels',showLevels);}
 function beginDemo(){if(!settingsReady)return;unlockAudio();demoReturn={level:state.level,preview};state=M.create(0,5);mode='demo';demoHits=0;particles=[];overlay.hidden=true;$('gdPause').disabled=false;stats();status('Watch the spark fly through the gap.');}
 function shoot(){if(mode!=='playing'||frozen()||!active)return;unlockAudio();if(M.fire(state)){shotPulse=1;sfx('shoot');}}
 function burst(x,y,color,count=20){if(reduced)count=5;for(let i=0;i<count;i++){const a=i*Math.PI*2/count;particles.push({x,y,vx:Math.cos(a)*(30+Math.random()*85),vy:Math.sin(a)*(30+Math.random()*85),t:0,life:.45+Math.random()*.45,color});}}
 function recordResult(){if(runSaved||preview||!window.gameResultsStore)return;runSaved=true;let name='Student';try{name=(localStorage.getItem('moving-sound-student-name-v1')||'Student').trim().slice(0,60)||'Student';}catch{}
  window.gameResultsStore.saveResult({gameName:'Golden Dot',studentName:name,levelCompleted:state.level+1,correctClicks:state.hits,missedClicks:state.misses,totalClicks:state.hits+state.misses,playedAtMs:Date.now()}).catch(()=>status('Level complete. Result could not be saved.'));
 }
 function finish(){mode='won';stopAudio();sfx('win');$('gdPause').disabled=true;const stars=state.lives;$('gdStars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  if(!preview){progress=M.complete(progress,state.level,state.lives);saveProgress();publishLeaderboard();recordResult();}
  burst(M.C.x,M.C.y,'#ffe78f',55);$('gdEyebrow').textContent=preview?'Teacher preview complete':'Beautiful timing!';
  dialog(state.level===29?'All thirty levels!':'Level complete!',preview?'This preview did not change student progress.':`${state.hits} golden hits! ${stars===3?'Perfect timing—three stars!':'Try again anytime to earn more stars.'}`,state.level===29?'Choose a level':'Next level',()=>state.level===29?showLevels():prepare(state.level+1,preview),'Play again',()=>prepare(state.level,preview),preview?'Teacher skips never unlock student levels.':'Each new level brings a different moving pattern.');status(`Level ${state.level+1} complete.`);
 }
 function lose(){mode='lost';stopAudio();sfx('lose');$('gdPause').disabled=true;$('gdStars').textContent='';$('gdEyebrow').textContent='Watch the pattern. Find your moment.';dialog('Try another spark',`${state.hits} of ${state.goal} hits. Let the barrier move away, then send a spark through the opening.`,'Try again',()=>{prepare(state.level,preview);start();},'Levels',showLevels,'Only this level restarts. Your unlocked levels stay saved.');status('Three barriers hit. Try this level again.');}
 function fitCanvas(){const r=canvas.getBoundingClientRect(),width=Math.max(1,r.width),height=Math.max(1,r.height),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);const scale=Math.min(width/480,height/720);frame={width,height,dpr,scale,x:(width-480*scale)/2,y:(height-720*scale)/2};}
 function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
 function line(x1,y1,x2,y2,color,width){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
 function text(value,x,y,size,color='#fff',weight=700){ctx.font=`${weight} ${size}px system-ui`;ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(value,x,y);}
 function draw(){
  ctx.setTransform(frame.dpr,0,0,frame.dpr,0,0);const bg=ctx.createLinearGradient(0,0,0,frame.height);bg.addColorStop(0,'#1b5480');bg.addColorStop(1,'#102c46');ctx.fillStyle=bg;ctx.fillRect(0,0,frame.width,frame.height);
  ctx.setTransform(frame.scale*frame.dpr,0,0,frame.scale*frame.dpr,frame.x*frame.dpr,frame.y*frame.dpr);
  if(shake&&!reduced)ctx.translate(Math.sin(clock*90)*shake*4,0);
  const palettes=[['#4aa8d8','#287caf'],['#54b6c6','#267f98'],['#887bc3','#4e5794'],['#4b8fbf','#294771'],['#529fbe','#28667f'],['#6a78bb','#35427a']],palette=palettes[Math.floor(state.level/5)];
  const sky=ctx.createLinearGradient(0,0,0,720);sky.addColorStop(0,palette[0]);sky.addColorStop(1,palette[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,480,720);
  ctx.fillStyle='#ffffff07';for(let y=0;y<760;y+=40)for(let x=-40;x<520;x+=40){ctx.beginPath();ctx.moveTo(x,y+20);ctx.lineTo(x+20,y);ctx.lineTo(x+40,y+20);ctx.lineTo(x+20,y+40);ctx.closePath();ctx.fill();}
  for(const radius of [80,120,165]){ctx.beginPath();ctx.arc(M.C.x,M.C.y,radius,0,Math.PI*2);ctx.strokeStyle='#dcf5ff18';ctx.lineWidth=1;ctx.stroke();}
  if(mode==='levels')return;
  const glow=ctx.createRadialGradient(M.C.x,M.C.y,10,M.C.x,M.C.y,70+hitPulse*18);glow.addColorStop(0,'#fff2a66b');glow.addColorStop(1,'#fff2a600');circle(M.C.x,M.C.y,70+hitPulse*18,glow);
  const core=ctx.createRadialGradient(M.C.x-12,M.C.y-15,2,M.C.x,M.C.y,36);core.addColorStop(0,'#fff9b8');core.addColorStop(.55,'#ffdf5b');core.addColorStop(1,'#f5b632');circle(M.C.x,M.C.y,34+hitPulse*4,core);circle(M.C.x-10,M.C.y-12,7,'#fffad299');
  ctx.beginPath();ctx.arc(M.C.x,M.C.y,45,-Math.PI/2,-Math.PI/2+Math.PI*2*state.hits/state.goal);ctx.strokeStyle='#ffe578';ctx.lineWidth=4;ctx.lineCap='round';ctx.stroke();
  text(String(state.goal-state.hits),M.C.x,M.C.y+8,24,'#70571e');
  for(const shape of M.geometry(state.level,state.time)){
   ctx.shadowColor='#0d527455';ctx.shadowBlur=3;ctx.shadowOffsetY=3;
   if(shape.type==='circle')circle(shape.x,shape.y,shape.r,'#f4fcff');
   else if(shape.type==='segment')line(shape.ax,shape.ay,shape.bx,shape.by,'#f5fcff',shape.width);
   else{ctx.beginPath();ctx.arc(shape.x,shape.y,shape.r,shape.start,shape.start+shape.span);ctx.strokeStyle='#f5fcff';ctx.lineWidth=shape.width;ctx.lineCap='round';ctx.stroke();}
  }ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  for(const shot of state.shots){line(shot.x,shot.y+19,shot.x,shot.y+4,'#ffe99866',5);circle(shot.x,shot.y,6,'#fff1a2');circle(shot.x-1,shot.y-1,2,'#fff');}
  const launcherY=M.LAUNCH.y+shotPulse*5;circle(M.LAUNCH.x,launcherY,32,'#1b668c');circle(M.LAUNCH.x,launcherY,25,'#98dbee');circle(M.LAUNCH.x,launcherY,17,'#fff3a1');line(M.LAUNCH.x,launcherY-22,M.LAUNCH.x,launcherY-34,'#fff6be',13);
  for(let i=0;i<3;i++)text(i<state.lives?'♥':'♡',M.LAUNCH.x+(i-1)*35,678,27,i<state.lives?'#fff0a2':'#b1d8e1');
  if(mode==='demo')text('WATCH THE OPENING',240,543,12,'#f0faff');else if(mode==='playing'&&state.attempts<4)text('CLICK ONCE TO SEND A SPARK',240,543,12,'#e9fbff');
  for(const p of particles){ctx.globalAlpha=Math.max(0,1-p.t/p.life);circle(p.x,p.y,3,p.color);}ctx.globalAlpha=1;
 }
 function animate(now){const dt=Math.min((now-last)/1000||0,.034);last=now;
  if(!document.hidden&&!frozen()){
   clock+=dt;hitPulse=Math.max(0,hitPulse-dt*4);shotPulse=Math.max(0,shotPulse-dt*7);shake=Math.max(0,shake-dt*4);
   if(mode==='playing'||mode==='demo'){
    if(mode==='demo'&&state.shots.length===0&&Math.sin(state.time*.65*M.obstacleSpeed(0)+.7)<.35)M.fire(state);
    const events=M.step(state,dt);for(const e of events){if(e.type==='hit'){hitPulse=1;burst(M.C.x,M.C.y,'#ffe987');sfx('hit',state.hits);if(mode==='demo')demoHits++;}else{shake=1;burst(e.x,e.y,'#eafaff');sfx('miss');}}
    stats();if(mode==='demo'&&(demoHits>=3||state.outcome!=='playing')){prepare(demoReturn.level,demoReturn.preview);status('Your turn. Wait for an opening, then click.');}
    else if(state.outcome==='won')finish();else if(state.outcome==='lost')lose();
   }
   particles=particles.filter(p=>p.t<p.life);for(const p of particles){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;}
  }else stopAudio();draw();requestAnimationFrame(animate);
 }
 async function readSettings(){if(settingsBusy)return;settingsBusy=true;try{const r=await fetch('/api/settings',{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('settings');const data=await r.json();goal=M.clampGoal(data.goldenDotHitsGoal);active=data.goldenDotGameActive!==false;globalSound=data.soundEnabled!==false;localStorage.setItem('goldenDotGameActive',String(active));if(!globalSound)stopAudio();soundIcon();if(!active)location.replace('../../index.html');}
  catch{active=localStorage.getItem('goldenDotGameActive')!=='false';if(!active)location.replace('../../index.html');}
  finally{settingsBusy=false;settingsReady=true;if(mode==='levels')renderGrid();}
 }
 canvas.addEventListener('click',e=>{if(e.button===0)shoot();});canvas.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&!e.repeat){e.preventDefault();shoot();}});
 window.addEventListener('classroomScoresReady',publishLeaderboard);window.addEventListener('trackpadStudentNameChanged',publishLeaderboard);
 window.addEventListener('trackpadStudentNamePromptOpen',()=>{stopAudio();pause();});
 $('gdStart').onclick=()=>{if(frozen())return;unlockAudio();primary?.();};$('gdSecondary').onclick=()=>{if(frozen())return;unlockAudio();secondary?.();};$('gdLevels').onclick=showLevels;$('gdPause').onclick=pause;
 $('gdSound').onclick=()=>{soundOn=!(soundOn&&globalSound);if(soundOn){unlockAudio();sfx('toggle');}else stopAudio();soundIcon();};
 window.addEventListener('blur',()=>{stopAudio();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();pause();}});
 window.trackpadTeacherSkipAdapter={advance(){if(state.level===29)return false;prepare(state.level+1,true);return true;}};
 window.addEventListener('resize',fitCanvas);if(window.ResizeObserver)new ResizeObserver(fitCanvas).observe($('gdStage'));
 const poll=setInterval(readSettings,5000);window.addEventListener('pagehide',()=>{stopAudio();clearInterval(poll);audio?.close();},{once:true});
 fitCanvas();soundIcon();showLevels();publishLeaderboard();readSettings();requestAnimationFrame(animate);
})();
