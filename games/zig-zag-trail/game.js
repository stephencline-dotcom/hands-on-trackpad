(() => {
  'use strict';
  const M=window.ZigZagModel,$=id=>document.getElementById(id);
  const canvas=$('zigCanvas'),ctx=canvas.getContext('2d'),overlay=$('zigOverlay'),cue=$('zigCue');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let s=M.create(0),mode='ready',action=null,clock=0,last=0,camera={x:0,y:0},particles=[],trail=[],demoTurns=0,callout=null;
  let settingsReady=false,soundOn=localStorage.getItem('soundEnabled')!=='false',globalSound=true,audio=null,active=true,settingsBusy=false;
  const voices=new Set();
  const bestKeys=M.levels.map((_,i)=>`zigzag-best-v2-${i}`);
  let runSaved=false,frame={scale:1,x:0,y:0,width:1000,height:480,dpr:1};
  function best(){try{return Math.max(0,Number(localStorage.getItem(bestKeys[s.index]))||0);}catch{return 0;}}
  function updateBest(){if(s.correct>best()){try{localStorage.setItem(bestKeys[s.index],String(s.correct));}catch{}}}
  function fitCanvas(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const width=Math.max(1,rect.width),height=Math.max(1,rect.height);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);const scale=Math.min(width/1000,height/480);frame={width,height,scale,x:(width-1000*scale)/2,y:(height-480*scale)/2,dpr};}
  function beginFrame(){ctx.setTransform(frame.dpr,0,0,frame.dpr,0,0);const sky=ctx.createLinearGradient(0,frame.y,0,frame.y+480*frame.scale);sky.addColorStop(0,s.level.sky[0]);sky.addColorStop(1,s.level.sky[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,frame.width,frame.height);ctx.setTransform(frame.dpr*frame.scale,0,0,frame.dpr*frame.scale,frame.dpr*frame.x,frame.dpr*frame.y);}

  function frozen(){return document.body.classList.contains('student-screen-frozen')||document.getElementById('studentFreezeOverlay')?.hidden===false;}
  function audioStop(){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
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
  function soundIcon(){const on=soundOn&&globalSound;const b=$('zigSound');b.textContent=on?'🔊':'🔇';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'Sound on':'Sound off');b.title=on?'Sound on':'Sound off';}
  function status(text){$('zigStatus').textContent=text;}
  function stats(){ $('zigLevel').textContent=best();$('zigTurns').textContent=s.correct; }

  function dialog(title,description,label,handler,footnote='',showDemo=false){
    overlay.hidden=false;$('zigHeading').textContent=title;$('zigDescription').textContent=description;$('zigStart').textContent=label;$('zigStart').hidden=false;
    $('zigFootnote').textContent=footnote;$('zigDemo').hidden=!showDemo;$('zigTrailChoices').hidden=true;action=handler;
  }
  function prepare(index){audioStop();s=M.create(index);runSaved=false;trail=[];particles=[];callout=null;camera={x:s.x,y:s.y};mode='ready';stats();
    $('zigEyebrow').textContent=`${s.level.name} · Endless run`;
    dialog(index===0?'Ready to roll?':s.level.name,'Your ball rolls by itself. Tap once at each glowing corner to turn. No dragging needed!',"Let's roll!",start,'A fresh path every run · Beat your best score',true);
    cue.hidden=false;cue.textContent='Ready to roll?';const instructions=document.querySelector('.game-instructions');if(instructions)instructions.textContent='Tap or click anywhere on the trail to turn. Wait for the glowing corner!';cue.classList.remove('turn-now');$('zigPause').textContent='Ⅱ';$('zigPause').setAttribute('aria-label','Pause game');
  }
  function start(){if(!settingsReady||!active)return;unlockAudio();overlay.hidden=true;mode='playing';sfx('start');canvas.focus({preventScroll:true});status('Rolling. Tap at a glowing corner.');}
  function pause(){if(mode!=='playing'&&mode!=='demo')return;const resumeMode=mode;mode='paused';audioStop();dialog('Take a breath','Your ball is waiting right here.','Keep rolling',()=>{mode=resumeMode;overlay.hidden=true;canvas.focus({preventScroll:true});},'Your progress is safe.');status('Game paused.');}
  function showTrails(){audioStop();mode='choosing';$('zigEyebrow').textContent='Four flavors. Endless possibilities.';dialog('Pick a trail','Choose your scenery. Every trail goes on forever and has its own best score.','Roll this trail',()=>prepare(s.index),'Short zigs, long zags, quick steps, and big sweeps.');$('zigStart').hidden=true;
    const choices=$('zigTrailChoices');choices.hidden=false;choices.replaceChildren();M.levels.forEach((level,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(i===s.index));b.textContent=`${i+1}. ${level.name}`;const small=document.createElement('small');small.textContent=`Endless · Best: ${Number(localStorage.getItem(bestKeys[i]))||0}`;b.append(small);b.onclick=()=>prepare(i);choices.append(b);});
  }
  function beginDemo(){if(!settingsReady||!active)return;unlockAudio();s=M.create(s.index);stats();camera={x:0,y:0};trail=[];demoTurns=0;overlay.hidden=true;mode='demo';status('Watch: one tap at each glowing corner. This demonstration does not count toward your score.');}
  function burst(x,y,color,count=18){if(reduced)count=5;for(let i=0;i<count;i++){const a=Math.PI*2*i/count;particles.push({x,y,vx:Math.cos(a)*(25+Math.random()*65),vy:Math.sin(a)*(25+Math.random()*65)-45,t:0,life:.65+Math.random()*.4,color});}}
  function turn(){if(mode!=='playing'||frozen()||!active)return;unlockAudio();const ok=M.turn(s);const p=project(s.x,s.y);if(ok){sfx(s.correct%10===0?'milestone':'turn',s.correct);burst(p.x,p.y-14,'#fff39c',s.correct%10===0?35:18);callout={text:s.correct%10===0?`${s.correct} TURNS!`:'+1',time:0};updateBest();status(`Score ${s.correct}.${s.correct%10===0?' Keep it going!':''}`);}else{sfx('miss');}stats();}
  function fall(){const wasDemo=mode==='demo';mode=wasDemo?'demo-falling':'falling';s.fall=0;cue.hidden=true;trail=[];particles=[];callout=null;audioStop();sfx('fall');if(!wasDemo){updateBest();saveResult();}status('Run ended. Try again to beat your best score.');}
  function saveResult(){if(runSaved||!window.gameResultsStore)return;runSaved=true;let name='Student';try{name=(localStorage.getItem('moving-sound-student-name-v1')||'Student').trim().slice(0,60)||'Student';}catch{}
    const total=s.correct+s.misses;
    // An endless run has no completed levels. Correct turns are the run score.
    window.gameResultsStore.saveResult({gameName:'Zig Zag Trail',studentName:name,levelCompleted:0,correctClicks:s.correct,missedClicks:s.misses,totalClicks:total,playedAtMs:Date.now()}).catch(()=>{status('Run ended. Result could not be saved.');});
  }
  // This nested game needs an explicit home destination; the legacy shared access
  // helper assumes a root page and does not redirect nested index.html pages.
  async function readSettings(){if(settingsBusy)return;settingsBusy=true;try{const r=await fetch('/api/settings',{cache:'no-store'});if(!r.ok)throw Error('settings unavailable');const data=await r.json();active=data.zigZagGameActive!==false;globalSound=data.soundEnabled!==false;localStorage.setItem('zigZagGameActive',String(active));if(!globalSound)audioStop();soundIcon();if(!active)location.replace('../../index.html');}
    catch{active=localStorage.getItem('zigZagGameActive')!=='false';if(!active)location.replace('../../index.html');}
    finally{settingsReady=true;settingsBusy=false;}
  }
  function project(x,y,z=0){const dx=x-camera.x,dy=y-camera.y;return {x:500+(dx-dy)*.83,y:315-(dx+dy)*.43-z};}
  function polygon(points,fill,stroke,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function ellipse(x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function line(x1,y1,x2,y2,color,width=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function text(str,x,y,size,color='#fff',align='center'){ctx.font=`800 ${size}px system-ui`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(str,x,y);}
  function cloud(x,y,scale,alpha=.6){ctx.save();ctx.globalAlpha=alpha;ellipse(x,y,62*scale,15*scale,'#fff');ellipse(x-25*scale,y-10*scale,25*scale,24*scale,'#fff');ellipse(x+12*scale,y-18*scale,32*scale,29*scale,'#fff');ellipse(x+40*scale,y-4*scale,23*scale,17*scale,'#fff');ctx.restore();}
  function island(x,y,scale){const night=s.index>1;polygon([{x:x-70*scale,y},{x:x+65*scale,y},{x:x+30*scale,y:y+65*scale},{x:x-5*scale,y:y+85*scale}],night?'#5b6793':'#559797');ellipse(x,y,70*scale,22*scale,night?'#a6b7cb':'#95d3b3');
    for(let j=0;j<3;j++){const tx=x+(j-1)*28*scale,ty=y-(j===1?27:10)*scale;
      if(s.index===3){polygon([{x:tx,y:ty-52*scale},{x:tx+12*scale,y:ty-19*scale},{x:tx,y:ty},{x:tx-12*scale,y:ty-19*scale}],j%2?'#c6a9ee':'#9de3ee','#e5faff',scale);line(tx,ty-49*scale,tx,ty-5*scale,'#e8faff',scale);}
      else if(s.index===1){line(tx,ty,tx+4*scale,ty-42*scale,'#927a62',4*scale);for(let k=0;k<5;k++){const a=k*Math.PI*.42+.1;polygon([{x:tx+4*scale,y:ty-42*scale},{x:tx+(4+Math.cos(a)*30)*scale,y:ty+(-42+Math.sin(a)*14)*scale},{x:tx+(4+Math.cos(a+.35)*21)*scale,y:ty+(-42+Math.sin(a+.35)*10)*scale}],'#438b7c');}}
      else{line(tx,ty,tx,ty-28*scale,'#6a807e',4*scale);polygon([{x:tx-16*scale,y:ty-10*scale},{x:tx,y:ty-65*scale},{x:tx+16*scale,y:ty-10*scale}],night?'#728d9e':'#4b9b8f');if(night)ellipse(tx+3*scale,ty-20*scale,3*scale,3*scale,'#ffdf9f');}
    }

  }
  function background(){const l=s.level,gradient=ctx.createLinearGradient(0,0,0,480);gradient.addColorStop(0,l.sky[0]);gradient.addColorStop(1,l.sky[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,1000,480);
    if(s.index===3){for(let i=0;i<65;i++){const x=(i*137.7)%1000,y=(i*63.31)%350;ctx.globalAlpha=.4+.5*Math.sin(clock*.8+i)**2;ellipse(x,y,i%4===0?1.9:1,i%4===0?1.9:1,'#fff5c8');}ctx.globalAlpha=1;ellipse(830,85,37,37,'#fff4c9');ellipse(845,75,34,34,l.sky[0]);}else{const sun=ctx.createRadialGradient(840,88,4,840,88,95);sun.addColorStop(0,'#fff4bd');sun.addColorStop(1,'#fff4bd00');ctx.fillStyle=sun;ctx.fillRect(740,0,200,190);ellipse(840,88,35,35,'#fff1bc');}
    for(let i=0;i<6;i++){const drift=reduced?0:clock*(3+i%3);cloud(((i*211+drift)%1250)-100,75+(i%3)*93,.5+(i%3)*.25,s.index===3?.12:.38);}
    island(130,250+(reduced?0:Math.sin(clock*.4)*7),.85);island(880,320+(reduced?0:Math.sin(clock*.3+2)*7),.7);island(285,100,.28);island(700,158,.36);
    // Tiny distant glider, moving slowly across the horizon.
    const gx=reduced?340:((clock*9+290)%1250)-100,gy=60+Math.sin(clock*.5)*7;ellipse(gx,gy,26,8,'#fff5db');polygon([{x:gx-6,y:gy},{x:gx+15,y:gy-14},{x:gx+2,y:gy+1}],'#d37c72');line(gx,gy+8,gx,gy+17,'#667d8a');ellipse(gx,gy+19,7,3,'#725b62');
  }
  function platform(a,b,width){const h=width/2,minX=Math.min(a.x,b.x)-h,maxX=Math.max(a.x,b.x)+h,minY=Math.min(a.y,b.y)-h,maxY=Math.max(a.y,b.y)+h;
    const corners=[project(minX,minY),project(maxX,minY),project(maxX,maxY),project(minX,maxY)],drop=24;
    for(const [i,j]of [[0,1],[0,3]]){polygon([corners[i],corners[j],{x:corners[j].x,y:corners[j].y+drop},{x:corners[i].x,y:corners[i].y+drop}],s.level.side);line(corners[i].x,corners[i].y+drop,corners[j].x,corners[j].y+drop,'#244f6725',2);}
    polygon(corners,s.level.top,s.level.edge,2.2);
    const pa=project(a.x,a.y),pb=project(b.x,b.y);ctx.save();ctx.setLineDash([4,15]);line(pa.x,pa.y,pb.x,pb.y,'#ffffff57',2);ctx.restore();
  }
  function gem(p,phase){const bob=reduced?0:Math.sin(clock*3+phase)*4;const y=p.y-20+bob;ellipse(p.x,p.y,11,4,'#1f5f7233');polygon([{x:p.x,y:y-10},{x:p.x+9,y},{x:p.x,y:y+12},{x:p.x-9,y}],'#fff299','#fffbea',1.5);polygon([{x:p.x,y:y-10},{x:p.x+9,y},{x:p.x,y:y+12}],'#ffc45e');line(p.x-5,y,p.x,y-5,'#fff',2);}
  function flag(p,checkpoint=false){line(p.x,p.y-4,p.x,p.y-55,'#f6fff3',4);polygon([{x:p.x+2,y:p.y-55},{x:p.x+34,y:p.y-45},{x:p.x+2,y:p.y-33}],checkpoint?'#ffe08c':'#fff');if(checkpoint)text('✓',p.x+14,p.y-40,13,'#676139');}
  function drawRoad(){const from=Math.max(s.base,s.segment-3),to=Math.min(s.base+s.path.length-2,s.segment+6);for(let i=to;i>=from;i--)platform(M.point(s,i),M.point(s,i+1),M.point(s,i).width);
    for(let i=to+1;i>=Math.max(1,from);i--){const p=project(M.point(s,i).x,M.point(s,i).y);if(p.y< -50||p.y>540)continue;if(i>s.segment)gem(p,i);if(i%10===0)flag({x:p.x-s.level.width*.55,y:p.y},true);}
    if(!s.ended&&M.reminders(s,mode==='demo')){const next=M.point(s,s.segment+1),p=project(next.x,next.y),near=M.canTurn(s),pulse=reduced?0:Math.sin(clock*7)*3;
      ctx.beginPath();ctx.ellipse(p.x,p.y,s.level.width*.62+pulse,s.level.width*.32+pulse*.4,0,0,Math.PI*2);ctx.strokeStyle=near?'#fffbce':'#ffffff77';ctx.lineWidth=near?5:2;ctx.stroke();
      if(near){ellipse(p.x,p.y,s.level.width*.56,s.level.width*.29,'#fff39c66');text('TAP',p.x,p.y-44,17,'#214f59');}
      const after=M.point(s,s.segment+2),sign=after.x>next.x?1:-1;const arrowY=p.y-7;line(p.x-sign*13,arrowY+sign*6,p.x+sign*13,arrowY-sign*6,'#366d6d80',3);
    }

  }
  function drawBall(){if(s.ended&&mode==='retry')return;const p=project(s.x,s.y),falling=s.ended?s.fall:0;let y=p.y-17+falling*falling*170;const r=17*(1-Math.min(falling*.35,.65));ctx.save();ctx.globalAlpha=Math.max(0,1-falling*.8);if(!s.ended)ellipse(p.x,p.y+2,18,7,'#21536344');
    for(let i=0;i<trail.length;i++){const t=trail[i],tp=project(t.x,t.y);ellipse(tp.x,tp.y-15,Math.max(1,(i/trail.length)*5),Math.max(1,(i/trail.length)*4),'#fff6ce55');}
    const g=ctx.createRadialGradient(p.x-6,y-8,1,p.x,y,r);g.addColorStop(0,'#fff4bb');g.addColorStop(.3,'#ffdb69');g.addColorStop(.75,'#f9a44b');g.addColorStop(1,'#db7352');ellipse(p.x,y,r,r,g);
    ctx.save();ctx.beginPath();ctx.arc(p.x,y,r,0,Math.PI*2);ctx.clip();ctx.translate(p.x,y);ctx.rotate((s.x+s.y)*.025);ctx.beginPath();ctx.ellipse(0,0,r*.45,r*1.3,0,0,Math.PI*2);ctx.strokeStyle='#ffeeb9';ctx.lineWidth=4;ctx.stroke();ctx.restore();ellipse(p.x-6,y-7,5,3,'#fff8d9aa');ctx.restore();
  }
  function animate(now){const dt=Math.min((now-last)/1000||0,.034);last=now;const stopped=document.hidden||frozen();
    if(stopped){audioStop();}else{
      clock+=dt;
      if(mode==='playing'||mode==='demo'){
        if(mode==='demo'&&M.canTurn(s)&&M.remaining(s)<3){M.turn(s);demoTurns++;sfx('turn',demoTurns);if(demoTurns===3){prepare(s.index);status('Your turn. Tap once at each glowing corner.');}}
        if(mode==='playing'||mode==='demo'){const outcome=M.step(s,dt);if(outcome==='fall')fall();}
        if(mode==='playing'||mode==='demo'){trail.push({x:s.x,y:s.y});if(trail.length>14)trail.shift();}
        stats();
      }else if(mode==='falling'||mode==='demo-falling'){s.fall+=dt;if(s.fall>.7){if(mode==='demo-falling'){prepare(s.index);}else{mode='retry';$('zigEyebrow').textContent='Your next personal best is waiting';dialog('Nice run!',`Score: ${s.correct} · Best: ${best()} · ${s.level.name}. A new path is ready!`,'Try again',()=>{const index=s.index;prepare(index);start();},'Every run is different. How far can you go?');}}}

      if(!reduced){const t=1-Math.exp(-dt*8);camera.x+=(s.x-camera.x)*t;camera.y+=(s.y-camera.y)*t;}else{camera.x=s.x;camera.y=s.y;}
      if(callout){callout.time+=dt;if(callout.time>1)callout=null;}
      particles=particles.filter(p=>p.t<p.life);for(const p of particles){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;}
    }
    beginFrame();background();
    // Every platform is opaque. A falling ball is below its top and side faces,
    // so render it first and let the road occlude it instead of showing through.
    if(s.ended){drawBall();drawRoad();}else{drawRoad();drawBall();}for(const p of particles){ctx.globalAlpha=Math.max(0,1-p.t/p.life);ellipse(p.x,p.y,3,3,p.color);}ctx.globalAlpha=1;if(callout){ctx.globalAlpha=1-callout.time;text(callout.text,500,240-callout.time*35,callout.text==='+1'?23:31,'#fff5b3');ctx.globalAlpha=1;}
    if(mode==='playing'||mode==='demo'){
      const teaching=M.reminders(s,mode==='demo');
      cue.hidden=!teaching;
      const instructions=document.querySelector('.game-instructions');
      if(instructions)instructions.textContent=teaching?'Tap or click to turn. Wait for the glowing corner!':`${s.level.name} · Keep rolling. Beat your best!`;
      if(teaching){const next=mode==='demo'?'Watch: one tap at each corner':M.canTurn(s)?'TAP NOW · one click to turn':M.remaining(s)<110?'Get ready…':'Watch the next corner';if(cue.textContent!==next)cue.textContent=next;}
      cue.classList.toggle('turn-now',teaching&&M.canTurn(s));
    }

    requestAnimationFrame(animate);
  }
  canvas.addEventListener('click',e=>{if(e.button!==0)return;turn();});
  canvas.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&!e.repeat){e.preventDefault();turn();}});
  $('zigStart').onclick=()=>{if(frozen())return;unlockAudio();action?.();};$('zigDemo').onclick=beginDemo;$('zigPause').onclick=pause;$('zigLevels').onclick=showTrails;
  $('zigSound').onclick=()=>{soundOn=!(soundOn&&globalSound);if(soundOn){unlockAudio();sfx('toggle');}else audioStop();soundIcon();};
  window.addEventListener('blur',()=>{audioStop();pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){audioStop();pause();}});

  window.addEventListener('pagehide',()=>{audioStop();clearInterval(poll);audio?.close();},{once:true});
  fitCanvas();window.addEventListener('resize',fitCanvas);if(window.ResizeObserver){new ResizeObserver(fitCanvas).observe($('zigStage'));}
  const poll=setInterval(readSettings,5000);readSettings();soundIcon();prepare(0);requestAnimationFrame(animate);
})();
