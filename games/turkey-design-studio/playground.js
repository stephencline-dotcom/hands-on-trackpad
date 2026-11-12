(()=>{'use strict';
const $=id=>document.getElementById(id),api=window.TurkeyStudioAPI,M=window.TurkeyModel;
if(!api)return;
const toolbar=document.createElement('div');toolbar.className='playground-tools';toolbar.innerHTML=`<button id="magic" class="picture-action magic-action" type="button" aria-label="Magic Surprise: add three silly decorations" title="Magic Surprise"><svg viewBox="0 0 90 76" aria-hidden="true"><path d="M24 58L63 19" stroke="#7c4b98" stroke-width="11" stroke-linecap="round"/><path d="M24 58L63 19" stroke="#d7a9ef" stroke-width="6" stroke-linecap="round"/><path d="M64 3l6 12 13 3-12 7-2 14-10-10-14 2 7-12-4-13 13 6z" fill="#ffd14f" stroke="#a76a26" stroke-width="2.5"/><path d="M13 9v15M5 16h16M79 48v15M71 56h16" stroke="#e9a742" stroke-width="4" stroke-linecap="round"/><circle cx="15" cy="40" r="5" fill="#ed8eaa"/><circle cx="54" cy="60" r="4" fill="#6db4ca"/></svg><span>Surprise!</span></button><button id="photo" class="picture-action photo-action" type="button" aria-label="Photo Booth: make four silly turkey pictures" title="Photo Booth"><svg viewBox="0 0 90 76" aria-hidden="true"><rect x="12" y="20" width="65" height="43" rx="8" fill="#72b4ca" stroke="#486778" stroke-width="4"/><rect x="22" y="13" width="21" height="11" rx="3" fill="#e9a24c" stroke="#99632e" stroke-width="3"/><circle cx="44" cy="42" r="18" fill="#fff3d6" stroke="#486778" stroke-width="4"/><circle cx="44" cy="42" r="11" fill="#a86c44"/><path d="M35 35l-4-10 8 5 5-12 5 12 8-5-4 10" fill="#f5b957" stroke="#8f593a" stroke-width="2"/><circle cx="40" cy="40" r="2" fill="#27221e"/><circle cx="48" cy="40" r="2" fill="#27221e"/><path d="M40 46l4 4 4-4" fill="#ffd06c"/><circle cx="66" cy="29" r="4" fill="#fff4b4"/></svg><span>Photo Booth</span></button>`;
document.querySelector('.finish-tools').insertBefore(toolbar, document.getElementById('save'));
const panel=document.createElement('section');panel.className='playground-panel';panel.hidden=true;panel.setAttribute('aria-label','Creative playground');$('stage').parentElement.append(panel);
let boothStyle=0,boothOpen=false;
function closePanel(){if(typeof stopBooth==='function')stopBooth();panel.classList.remove('boardwalk-active','boardwalk-shooting','boardwalk-finished');panel.hidden=true;panel.innerHTML='';boothOpen=false;document.body.classList.remove('booth-open');boothLastFocus?.focus?.();}
function showPanel(html){panel.innerHTML=html;panel.hidden=false;document.body.classList.add('booth-open');panel.querySelector('[data-close]')?.addEventListener('click',closePanel);}
panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Turkey Photo Booth');
const shade=document.createElement('div');shade.className='playground-shade';shade.addEventListener('click',closePanel);document.body.append(shade);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&boothOpen){e.preventDefault();closePanel();}});
$('magic').onclick=()=>{
  if(!api.usable())return;
  api.commitMove();
  const d=api.getDesign(),before=M.copy(d);
  const pools=[
    [{kind:'hat',styles:[0,1,2,3,4,5]},{kind:'glasses',styles:[0,1,2,3,4,5]},{kind:'sticker',styles:[0,2,6]}],
    [{kind:'eyes',styles:[0,1,2,3,4,5,6,7]},{kind:'beak',styles:[0,1,2,3,4,5,6,7]},{kind:'sticker',styles:[0,2,6]}],
    [{kind:'hat',styles:[0,1,2,3,4,5]},{kind:'costume',styles:[2,3,4]},{kind:'fun',styles:[3,5,6,7,8]}],
    [{kind:'glasses',styles:[0,1,2,3,4,5]},{kind:'sticker',styles:[0,2,6]},{kind:'fun',styles:[2,6,7,8]}]
  ];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const used=new Set(d.parts.map(p=>p.kind+':'+p.style));
  const combo=pick(pools);
  let added=0;
  for(const slot of combo){
    if(d.parts.length>=60)break;
    const available=slot.styles.filter(style=>!used.has(slot.kind+':'+style));
    const style=pick(available.length?available:slot.styles);
    const p=M.add(d,slot.kind,style);
    if(!p)continue;
    // M.add supplies item-specific design coordinates. Do not scatter them randomly.
    // Multiple copies are offset slightly by M.add so they remain independently editable.
    used.add(slot.kind+':'+style);
    added++;
  }
  if(added){
    api.history.save(before);api.save();api.react('fun',4);api.playGobble();
    $('message').textContent='Surprise! '+added+' new decorations! Undo removes them together.';
  }else $('message').textContent='Your turkey is full of decorations!';
};
// Boardwalk booth: snapshots render the entire design with one shared transform.
// This keeps every student's decoration attached without modifying its saved position.
let boothTimers=[],boothFrames=[],boothSession=0,boothAnimation=null,boothLastFocus=null;
const expressions=['wink','laugh','tongue','crossed','sleepy','surprised','dizzy','grin','side-eye','mischief'];
const bodyPoses=[
 {name:'Upside down!',angle:Math.PI,dx:0,dy:4,scale:.55,icon:'✦'},
 {name:'Sideways silly!',angle:-.48,dx:-12,dy:10,scale:.66,icon:'★'},
 {name:'Jumping turkey!',angle:.10,dx:8,dy:-36,scale:.67,icon:'✦'},
 {name:'Squish!',angle:-.06,dx:0,dy:35,scale:.67,sx:1.18,sy:.75,icon:'♥'},
 {name:'Stretch!',angle:.05,dx:0,dy:-20,scale:.62,sx:.82,sy:1.18,icon:'★'},
 {name:'Dance party!',angle:.26,dx:14,dy:2,scale:.66,icon:'♫'},
 {name:'Head tilt!',angle:-.24,dx:-12,dy:0,scale:.68,icon:'✦'},
 {name:'Superstar!',angle:.16,dx:10,dy:-14,scale:.68,icon:'★'}
];
let sessionPoses=[],previousKeys=new Set();
function choosePoses(){
 const all=[];for(let i=0;i<bodyPoses.length;i++)for(let j=0;j<expressions.length;j++)all.push({body:i,face:j,key:i+':'+j});
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const fresh=shuffle(all.filter(p=>!previousKeys.has(p.key)));const selected=[],usedBody=new Set(),usedFace=new Set();
 // Include a deliberately outrageous pose in every set.
 const outrageous=fresh.find(p=>p.body===0||p.body===3||p.body===4);if(outrageous){selected.push(outrageous);usedBody.add(outrageous.body);usedFace.add(outrageous.face);}
 for(const p of fresh){if(selected.length===4)break;if(usedBody.has(p.body)||usedFace.has(p.face))continue;selected.push(p);usedBody.add(p.body);usedFace.add(p.face);}
 previousKeys=new Set(selected.map(p=>p.key));return selected.map(p=>({...bodyPoses[p.body],expression:expressions[p.face],key:p.key}));
}
function expressionFace(g,expression){
 const ink='#593a30',cream='#fff8e7';g.save();g.lineCap='round';g.lineJoin='round';
 const oval=(x,y,rx,ry,fill)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=fill;g.fill();};
 const arc=(x,y,r,start,end,width=9)=>{g.beginPath();g.arc(x,y,r,start,end);g.strokeStyle=ink;g.lineWidth=width;g.stroke();};
 const open=(x,y,rx=22,ry=26)=>{oval(x,y,rx,ry,cream);oval(x+3,y+3,rx*.48,ry*.62,ink);oval(x+7,y-4,4,5,'white');};
 const shut=(x,y)=>arc(x,y+8,24,Math.PI*1.10,Math.PI*1.90,10);
 if(expression==='wink'){shut(444,267);open(557,267);}
 else if(expression==='laugh'){shut(444,267);shut(557,267);}
 else if(expression==='tongue'){open(444,267);open(557,267);}
 else if(expression==='crossed'){for(const x of [444,557]){oval(x,267,25,29,cream);oval(x+(x<500?15:-15),272,12,17,ink);}}
 else if(expression==='sleepy'){for(const x of [444,557]){g.fillStyle='#9a603c';g.fillRect(x-29,260,58,19);arc(x,266,24,0,Math.PI,8);}}
 else if(expression==='surprised'){open(444,267,28,35);open(557,267,28,35);}
 else if(expression==='dizzy'){for(const x of [444,557]){g.strokeStyle=ink;g.lineWidth=9;g.beginPath();g.moveTo(x-17,252);g.lineTo(x+17,280);g.moveTo(x+17,252);g.lineTo(x-17,280);g.stroke();}}
 else if(expression==='side-eye'){for(const x of [444,557]){oval(x,267,27,29,cream);oval(x+15,270,12,17,ink);}}
 else if(expression==='mischief'){open(444,267);shut(557,267);g.strokeStyle=ink;g.lineWidth=6;g.beginPath();g.moveTo(416,237);g.lineTo(464,247);g.stroke();}
 else {shut(444,267);shut(557,267);}
 if(expression==='surprised'||expression==='dizzy'){oval(500,330,24,30,'#753d37');oval(500,337,10,11,'#d77980');}
 else if(expression==='tongue'){oval(500,329,39,22,'#753d37');oval(500,348,16,22,'#ef8a99');g.strokeStyle='#a94e60';g.lineWidth=3;g.beginPath();g.moveTo(500,346);g.lineTo(500,359);g.stroke();}
 else if(expression==='sleepy'){g.strokeStyle=ink;g.lineWidth=8;g.beginPath();g.moveTo(478,326);g.quadraticCurveTo(500,339,522,326);g.stroke();}
 else {oval(500,327,40,24,'#783d32');oval(500,337,24,10,'#e68b91');g.fillStyle=cream;g.fillRect(479,313,42,6);}
 g.restore();
}
function boothSchedule(fn,ms){const timer=setTimeout(fn,ms);boothTimers.push(timer);}
function stopBooth(){boothSession++;boothTimers.forEach(clearTimeout);boothTimers=[];if(boothAnimation){cancelAnimationFrame(boothAnimation);boothAnimation=null;}boothFrames=[];}
function boothSound(type){if(!api.getSound()||document.hidden||document.body.classList.contains('student-screen-frozen'))return;try{const ac=new(window.AudioContext||window.webkitAudioContext)();const now=ac.currentTime;const o=ac.createOscillator(),gain=ac.createGain();o.type=type==='flash'?'square':'triangle';o.frequency.setValueAtTime(type==='flash'?850:320,now);o.frequency.exponentialRampToValueAtTime(type==='flash'?330:520,now+.13);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(type==='flash'?.035:.025,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.18);o.connect(gain);gain.connect(ac.destination);o.start(now);o.stop(now+.19);o.onended=()=>ac.close().catch(()=>{});}catch{}}
function posePicture(index,live=0){
 const pose=sessionPoses[index%sessionPoses.length]||bodyPoses[0],cv=document.createElement('canvas');cv.width=500;cv.height=530;
 const g=cv.getContext('2d');const grad=g.createLinearGradient(0,0,0,530);grad.addColorStop(0,'#f9deb1');grad.addColorStop(1,'#e6a9a0');g.fillStyle=grad;g.fillRect(0,0,500,530);
 g.fillStyle='#8e3552';g.fillRect(0,0,58,530);g.fillRect(442,0,58,530);
 g.fillStyle='#c15c70';g.beginPath();g.moveTo(0,0);g.lineTo(78,0);g.lineTo(52,530);g.lineTo(0,530);g.fill();g.beginPath();g.moveTo(422,0);g.lineTo(500,0);g.lineTo(500,530);g.lineTo(448,530);g.fill();
 g.save();g.translate(250+pose.dx,283+pose.dy+Math.sin(live)*4);g.rotate(pose.angle+Math.sin(live)*.018);g.scale(pose.scale*(pose.sx||1),pose.scale*(pose.sy||1));g.translate(-500,-355);
 // Render all accessories with the same transform; only facial features are temporarily substituted.
 const design=api.getDesign(),facial=design.parts.filter(p=>p.kind==='eyes'||p.kind==='beak');
 const base={...design,parts:design.parts.filter(p=>p.kind!=='eyes'&&p.kind!=='beak'&&p.kind!=='glasses')};
 const art=window.TurkeyArt.create(g);g.save();g.beginPath();g.rect(0,0,1000,600);g.clip();art.draw(base,0,null,false,false,0,false,null);
 expressionFace(g,pose.expression||'grin');
 for(const p of design.parts.filter(p=>p.kind==='glasses'))art.part(p,0,false,0);
 g.restore();g.restore();
 g.fillStyle='#fff3c7';g.strokeStyle='#a46d46';g.lineWidth=5;g.beginPath();g.roundRect(16,15,468,56,14);g.fill();g.stroke();g.fillStyle='#693b31';g.textAlign='center';g.font='bold 25px system-ui';g.fillText('BOARDWALK PHOTO BOOTH',250,52);
 g.font='bold 48px system-ui';g.fillStyle='#fff0a2';g.fillText(pose.icon||'★',75,125);g.fillText(pose.icon||'★',425,125);
 g.font='bold 24px system-ui';g.fillStyle='#fff8e6';g.fillText((pose.name||'Silly turkey').toUpperCase(),250,506);
 return cv;
}
function booth(){
 boothLastFocus=document.activeElement;boothOpen=true;stopBooth();
 showPanel(`<div class="boardwalk-shell"><header class="boardwalk-header"><div class="boardwalk-lights" aria-hidden="true">✦ ✦ ✦ ✦ ✦ ✦ ✦</div><h2>THE GOBBLE PHOTO BOOTH</h2><button data-close type="button" class="boardwalk-close" aria-label="Close photo booth">✕</button></header><div class="boardwalk-content"><div class="boardwalk-machine"><div class="boardwalk-curtain left"></div><div class="boardwalk-curtain right"></div><canvas id="boardwalkLive" width="500" height="530" aria-label="Your decorated turkey in the photo booth"></canvas><div class="boardwalk-flash" aria-hidden="true"></div><div class="boardwalk-count" aria-live="polite"></div></div><div class="boardwalk-results"><div class="boardwalk-label">YOUR SILLY PICTURES!</div><div id="boardwalkStrip" class="boardwalk-strip"><div class="boardwalk-placeholder">📸<span>Four funny photos will appear here!</span></div></div></div></div><footer class="boardwalk-controls"><button id="boardwalkStart" type="button" class="boardwalk-start">📸 <span>TAKE PICTURES!</span></button><button id="boardwalkAgain" type="button" class="boardwalk-again" hidden>↻ <span>AGAIN!</span></button></footer></div>`);
 panel.classList.add('boardwalk-active');
 const live=$('boardwalkLive'),ctx=live.getContext('2d'),count=panel.querySelector('.boardwalk-count'),flash=panel.querySelector('.boardwalk-flash'),strip=$('boardwalkStrip');
 function liveFrame(time){if(!boothOpen)return;if(document.hidden||document.body.classList.contains('student-screen-frozen')){boothAnimation=requestAnimationFrame(liveFrame);return;}const cv=posePicture(Math.min(boothFrames.length,3),time/500);ctx.clearRect(0,0,500,530);ctx.drawImage(cv,0,0);boothAnimation=requestAnimationFrame(liveFrame);}
 boothAnimation=requestAnimationFrame(liveFrame);
 function session(){if(!boothOpen)return;boothTimers.forEach(clearTimeout);boothTimers=[];boothSession++;const sessionId=boothSession;boothFrames=[];sessionPoses=choosePoses();strip.innerHTML='';$('boardwalkStart').hidden=true;$('boardwalkAgain').hidden=true;panel.classList.add('boardwalk-shooting');let elapsed=0;
 function next(){if(!boothOpen||sessionId!==boothSession)return;if(document.hidden||document.body.classList.contains('student-screen-frozen')){boothSchedule(next,250);return;}const index=boothFrames.length;if(index===4){count.textContent='';panel.classList.remove('boardwalk-shooting');panel.classList.add('boardwalk-finished');$('boardwalkAgain').hidden=false;$('boardwalkAgain').focus();return;}let n=3;count.textContent=String(n);boothSound('count');function tick(){if(!boothOpen||sessionId!==boothSession)return;if(document.hidden||document.body.classList.contains('student-screen-frozen')){boothSchedule(tick,250);return;}n--;if(n>0){count.textContent=String(n);boothSound('count');boothSchedule(tick,650);}else{count.textContent='';flash.classList.remove('flash-now');void flash.offsetWidth;flash.classList.add('flash-now');boothSound('flash');const shot=posePicture(index);boothFrames.push(shot);const slot=document.createElement('div');slot.className='boardwalk-photo';slot.append(shot);strip.append(slot);boothSchedule(next,850);}}boothSchedule(tick,650);}
 next();}
 $('boardwalkStart').onclick=session;$('boardwalkAgain').onclick=session;
 panel.querySelector('[data-close]').onclick=closePanel;
 panel.querySelector('[data-close]').focus();
}
$('photo').onclick=()=>{if(!api.usable())return;api.commitMove();booth();};
window.TurkeyPlayground={fashionStart(){closePanel();},fashionEnd(){},frame(){},pause(){closePanel();},mute(){}};
})();
