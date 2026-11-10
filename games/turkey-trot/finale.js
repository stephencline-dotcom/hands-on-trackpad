(()=>{'use strict';
const C=document.getElementById('game'),g=C.getContext('2d'),$=id=>document.getElementById(id),W=1000,H=650;
let state='ready',time=0,last=0,run=0,lane=-1,laneX=-1,obstacles=[],spawnTimer=0,cleared=0,hits=0,freeze=false,sound=true,sceneTime=0,jump=null,impact=0,invincible=0,sequence=0,tractorGap=1,scenePlayed=false,particles=[],runningGoal=20;
const soundFiles={gobble:'gobble.mp3',run:'running-feet.mp3',land:'newlanding.mp3',bump:'cartoonstumble.mp3',hay:'strawrustle.mp3',win:'success.mp3',fail:'fail.mp3',horn:'farmbell.mp3',farm:'farmambience.mp3',theme:'turkeytheme.mp3',corn:'cornrustle.mp3',gate:'gatecreak.mp3',pumpkin:'pumpkinhit.mp3',roll:'cartoonroll.mp3',flap:'turkeyflap.mp3',victory:'magicvictory.mp3',getTurkey:'getturkey.mp3',turkeyGo:'turkeygo.mp3',eatTurkey:'eatturkey.mp3',noTurkey:'noturkey.mp3'};
const audio={};for(const [k,f] of Object.entries(soundFiles)){const a=new Audio('../../sounds/'+f);a.preload='none';a.volume=k==='farm'?.08:k==='run'?.055:.23;a.loop=k==='farm'||k==='run'||k==='theme';audio[k]=a;}
audio.theme.volume=.08;audio.corn.volume=.11;audio.gate.volume=.18;audio.roll.volume=.20;audio.flap.volume=.17;const trotCaps={corn:1.15,gate:1.6,roll:1.4,flap:.75,fish:1.15,drip:1.6,tractorStart:2.5,tractorHorn:1.3,hay:1.1,step:2.0};for(const [key,clip] of Object.entries(audio)){if(!clip.loop){clip.addEventListener('timeupdate',()=>{const limit=trotCaps[key];if(limit&&clip.currentTime>=limit){clip.pause();clip.currentTime=0;}});}}function play(k){if(!sound||freeze)return;let a=audio[k];if(!a)return;if(!a.loop){a.pause();a.currentTime=0;}a.play().catch(()=>{});}function stop(){Object.values(audio).forEach(a=>{a.pause();a.currentTime=0;});}function sync(){if(!sound||freeze){stop();return;}if(state==='running'&&!freeze&&sound){for(const k of ['farm','run','theme'])if(audio[k].paused)play(k);}else{audio.farm.pause();audio.run.pause();audio.theme.pause();}}
function blocked(){return document.hidden||document.body.classList.contains('student-screen-frozen');}function checkFreeze(){freeze=blocked();if(freeze)stop();else sync();last=0;}document.addEventListener('visibilitychange',checkFreeze);new MutationObserver(checkFreeze).observe(document.body,{attributes:true,attributeFilter:['class']});window.addEventListener('blur',()=>{freeze=true;stop();});window.addEventListener('focus',checkFreeze);window.addEventListener('pagehide',stop);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),mix=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a);
function fill(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}function oval(x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);g.fill();}function path(pts,color){g.fillStyle=color;g.beginPath();g.moveTo(...pts[0]);pts.slice(1).forEach(p=>g.lineTo(...p));g.closePath();g.fill();}function stroke(pts,color,w=3){g.beginPath();g.moveTo(...pts[0]);pts.slice(1).forEach(p=>g.lineTo(...p));g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke();}function label(s,x,y,size=36,color='#fff6d9'){g.textAlign='center';g.font=`900 ${size}px system-ui`;g.lineWidth=7;g.strokeStyle='#59351f';g.strokeText(s,x,y);g.fillStyle=color;g.fillText(s,x,y);}
function section(){return cleared<6?0:Math.min(3,1+Math.floor((cleared-6)/Math.max(1,runningGoal)*3));}const names=['CORN MAZE','PUMPKIN PANIC','SWINGING GATES','FINAL DASH'];
function tree(x,y,s,shade=0){g.save();g.translate(x,y);g.scale(s,s);oval(0,0,55,13,'#334d2b55');fill(-10,-110,20,112,'#76502f');stroke([[0,-30],[-25,-75]],'#76502f',8);stroke([[0,-60],[30,-95]],'#76502f',8);for(const [a,b,r,c] of [[-24,-120,37,'#b25a31'],[26,-122,39,'#e5a446'],[0,-155,50,shade?'#d17a30':'#c86c33'],[-22,-170,29,'#e8a342'],[29,-161,27,'#a84d2d']])oval(a,b,r,r*.78,c);g.restore();}
function corn(x,y,s){g.save();g.translate(x,y);g.scale(s,s);for(let i=-2;i<=2;i++){const dx=i*14;stroke([[dx,0],[dx,-100-i%2*13]],'#5b8c34',5);path([[dx,-25],[dx-36,-68],[dx-5,-52]],'#7aaf46');path([[dx,-43],[dx+31,-85],[dx+4,-60]],'#82ae3f');oval(dx,-93,7,17,'#f0c34b');}g.restore();}
function pumpkin(x,y,s){g.save();g.translate(x,y);g.scale(s,s);oval(0,0,35,12,'#443d2740');oval(0,-25,33,27,'#e57c29');oval(-12,-26,13,25,'#f39b39');oval(12,-26,13,25,'#c96720');stroke([[0,-49],[3,-59],[12,-60]],'#4f7635',5);g.restore();}
function barn(x,y,s){g.save();g.translate(x,y);g.scale(s,s);fill(-94,-130,188,130,'#a94736');path([[-105,-130],[0,-212],[105,-130]],'#754433');fill(-39,-93,78,93,'#643d2a');stroke([[-38,-92],[38,0]],'#e8d4a2',5);stroke([[38,-92],[-38,0]],'#e8d4a2',5);fill(-94,-129,9,129,'#f0d9ae');fill(85,-129,9,129,'#f0d9ae');g.restore();}
function background(t,sec){let sky=g.createLinearGradient(0,0,0,440);sky.addColorStop(0,sec===3?'#e6a45f':'#79bfe1');sky.addColorStop(1,'#ffe3a7');fill(0,0,W,H,sky);oval(800,95,54,54,'#ffdf91');path([[0,365],[180,265],[380,337],[630,270],[1000,348],[1000,650],[0,650]],'#92b278');path([[0,395],[230,317],[460,369],[720,317],[1000,390],[1000,650],[0,650]],'#75a05d');
if(sec===0){for(let j=0;j<13;j++){let z=((j*91+t*72)%390)/390,y=352+z*325,s=.14+z*.95;for(let side of [-1,1])corn(500+side*(44+z*460),y,s);}}
else {for(let j=0;j<10;j++){let z=((j*106+t*82)%420)/420,y=350+z*325,s=.15+z*1.1;for(let side of [-1,1])tree(500+side*(80+z*460),y,s,j%2);}}
if(sec===1){for(let j=0;j<9;j++){let z=((j*131+t*73)%380)/380;for(let side of [-1,1])pumpkin(500+side*(72+z*455),350+z*320,.25+z*.65);}}
if(sec===3){barn(155,359,.58);barn(843,349,.43);}
const left=sec===0?140:110,right=1000-left;path([[472,342],[528,342],[right,650],[left,650]],'#9c754f');path([[479,342],[521,342],[right-23,650],[left+23,650]],sec===3?'#e5b986':'#d6a476');for(let i=0;i<18;i++){let z=((i*71+t*110)%320)/320,y=346+z*302,x=500+(i%2?-1:1)*z*275;oval(x,y,2+z*5,1+z*2,'#a87c53');}
if(sec===3){const z=((t*120)%250)/250;for(let side of [-1,1])stroke([[500+side*42,349],[500+side*(85+z*360),650]],'#f4d2a1',5);}
}
function turkey(x,y,t,s=1,air=0,front=false){g.save();g.translate(x,y-air);g.scale(s,s);oval(0,16,37,10,'#4a3e2944');for(let i=-4;i<=4;i++){const a=i*.24;g.save();g.rotate(a+Math.sin(t*5)*.025);oval(0,-55,15,65,i%2?'#d97832':'#e8a448');oval(0,-93,9,21,'#f5c36d');g.restore();}oval(0,-40,44,50,'#8b522f');for(let side of [-1,1]){g.save();g.translate(side*38,-42);g.rotate(side*(.3+Math.sin(t*12+side)*.16));oval(0,0,18,32,'#a66537');g.restore();}oval(0,-83,18,22,'#985a31');if(front){oval(-8,-87,4,6,'white');oval(8,-87,4,6,'white');oval(-7,-87,2,3,'#28231d');oval(9,-87,2,3,'#28231d');path([[-10,-72],[10,-72],[0,-64]],'#e9a133');}for(let side of [-1,1]){let kick=air?0:Math.sin(t*15+side*2)*8;stroke([[side*17,-4],[side*18+kick,19]],'#e69a38',7);stroke([[side*18+kick,19],[side*28+kick,22]],'#e69a38',5);}g.restore();}
function farmer(x,y,s,t,color){g.save();g.translate(x,y);g.scale(s,s);oval(0,0,25,8,'#4b443550');for(let side of [-1,1]){let step=Math.sin(t*12+side*2)*16;stroke([[side*13,-36],[side*13+step,0]],'#3b4b59',12);oval(side*13+step,2,12,5,'#49392b');}fill(-26,-112,52,75,color);fill(-28,-83,56,49,color);stroke([[-20,-110],[-16,-70]],'#f0d7a9',6);stroke([[20,-110],[16,-70]],'#f0d7a9',6);oval(0,-130,22,24,'#e9b988');fill(-27,-155,54,8,'#76502e');fill(-19,-177,38,25,'#76502e');stroke([[24,-106],[40,-62]],'#e9b988',9);stroke([[40,-62],[48,-146]],'#815c36',5);for(let k=-1;k<=1;k++)stroke([[48+k*9,-146],[48+k*9,-173]],'#c6c6bd',4);g.restore();}
function project(o){let z=clamp(o.z,0,1.12),y=350+z*z*285;const across=o.type==='gate'||o.type==='log';return{x:across?500:500+o.lane*(26+z*165)+Math.sin(o.phase||0)*((o.type==='pumpkin')?z*78:0),y,s:.16+z*.99};}
function obstacle(o){const p=project(o);g.save();g.translate(p.x,p.y);g.scale(p.s,p.s);
 if(o.type==='gate'){
  // Two road-width leaves with a fixed safe lane. The closed leaf blocks the
  // other lane, while the safe leaf is visibly swung back toward its fence.
  const safe=o.lane,edge=285,mid=0;
  for(const side of [-1,1]){
   const x=side*edge;
   oval(x,8,23,10,'#49351f55');
   fill(x-12,-150,24,151,'#865532');fill(x-9,-147,7,140,'#c99a67');
   oval(x,-151,15,9,'#c99a67');
   // Fence continuation belongs outside the road, not across its lanes.
   for(const y of [-119,-75,-31]){
    stroke([[x+side*13,y],[x+side*112,y-10]],'#7d4c2d',12);
    stroke([[x+side*13,y-3],[x+side*112,y-13]],'#d4a46f',4);
   }
   const open=side===safe;
   const reach=open?65:edge;
   const end=x-side*reach;
   const top=open?-130:-134,bottom=-24;
   path([[x,top],[end,top+(open?19:0)],[end,bottom-(open?8:0)],[x,bottom]],'#9e653a');
   for(const y of [-117,-80,-42])stroke([[x,y],[end,y+(open?14:0)]],'#d7a16b',10);
   stroke([[x,-125],[end,-33+(open?10:0)]],'#704528',8);
   for(const y of [-119,-36])oval(x-side*8,y,5,5,'#4c4b43');
   oval((x+end)/2,8,Math.abs(x-end)/2,9,'#49351f45');
  }
 }else if(o.type==='log'){
  // Mandatory jump: the timber visibly reaches both road edges at every depth.
  oval(0,9,306,18,'#473e3055');
  fill(-294,-51,588,51,'#78502e');
  fill(-294,-51,588,9,'#a77649');
  for(const side of [-1,1]){
   const x=side*294;oval(x,-25,23,28,'#a77b50');
   oval(x,-25,15,19,'#d1a779');oval(x,-25,8,11,'#9c7047');
  }
  for(let i=-5;i<=5;i++){
   const x=i*51;stroke([[x-9,-44],[x+5,-8]],i%2?'#a77747':'#5f4028',3);
  }
 }else{
  oval(0,5,65,15,'#473e3055');
  if(o.type==='pumpkin'){pumpkin(0,0,1.6);}
  else if(o.type==='corn'){for(let i=-2;i<=2;i++)corn(i*19,0,.7);}
  else if(o.type==='hay'){fill(-61,-65,122,67,'#c9983c');for(let i=0;i<8;i++)stroke([[-58,-59+i*8],[58,-59+i*8]],'#f4d176',2);stroke([[-20,-65],[-20,0]],'#9b7139',5);stroke([[21,-65],[21,0]],'#9b7139',5);}
  else{fill(-60,-80,120,80,'#98683f');stroke([[-60,-80],[60,0]],'#d7a477',8);stroke([[60,-80],[-60,0]],'#d7a477',8);}
 }
 g.restore();}
let lastCornCue=-99,lastGateCue=-99;function generate(){const sec=section(),index=cleared+obstacles.filter(o=>!o.done).length;let type,ln=Math.random()<.5?-1:1;if(sec===0)type=index%4===3?'log':index%3===0?'corn':'hay';else if(sec===1)type=index%4===2?'log':'pumpkin';else if(sec===2)type=index%4===3?'log':'gate';else type=index%3===0?'log':index%3===1?'pumpkin':'gate';if(type==='gate'&&time-lastGateCue>2){play('gate');lastGateCue=time;}obstacles.push({z:.03,lane:ln,type,phase:Math.random()*6,done:false,hit:false,id:sequence++});}
// Corn maze: separate overhead navigation; later sections retain the original runner.

// Twelve prevalidated maze variations. Generated once, selected per round.
const MAZE_VARIANTS=(()=>{
 const layouts=[];
 for(let seed=0;seed<12;seed++){
  let rng=(seed+1)*48271;
  const rand=()=>{rng=(rng*16807)%2147483647;return rng/2147483647;};
  const cells=Array.from({length:15},()=>Array(15).fill('#'));
  const visited=new Set(['1,13']),stack=[[1,13]];cells[13][1]='.';
  while(stack.length){const [x,y]=stack[stack.length-1];const dirs=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>{let a=x+dx,b=y+dy;return a>0&&a<14&&b>0&&b<14&&!visited.has(a+','+b);});
   if(!dirs.length){stack.pop();continue;}
   const [dx,dy]=dirs[Math.floor(rand()*dirs.length)],nx=x+dx,ny=y+dy;
   cells[y+dy/2][x+dx/2]='.';cells[ny][nx]='.';visited.add(nx+','+ny);stack.push([nx,ny]);
  }
  // A few loops on easier layouts make wrong turns recoverable.
  const loops=seed<3?15:seed<6?10:seed<9?6:3;
  for(let i=0;i<loops;i++){const x=1+Math.floor(rand()*13),y=1+Math.floor(rand()*13);if(cells[y][x]!=='#')continue;
   if((cells[y][x-1]==='.'&&cells[y][x+1]==='.')||(cells[y-1][x]==='.'&&cells[y+1][x]==='.'))cells[y][x]='.';
  }
  layouts.push(cells.map(row=>row.join('')));
 }
 return layouts;
})();
let MAZE=MAZE_VARIANTS[0],mazeSolution=[],mazeVariantIndex=-1;
function selectMaze(){
 const tiers={easy:[0,1,2],normal:[3,4,5],hard:[6,7,8],expert:[9,10,11]};
 const options=tiers[mazeDifficulty]||tiers.easy;
 const eligible=options.filter(i=>i!==mazeVariantIndex);
 mazeVariantIndex=eligible[Math.floor(Math.random()*eligible.length)];
 MAZE=MAZE_VARIANTS[mazeVariantIndex];mazeSolution=mazeBfs(mazeStart,mazeExit);
 if(!mazeSolution.length)throw Error('Corn maze has no exit route');
}
const mazeStart=[1,13],mazeExit=[13,1];
let mazeDifficulty="easy",mazeDragRequired=false,mazePointerHeld=false,mazePointer=null,mazeFarmerClock=0,mazeGrace=0;
let mazePos=[...mazeStart],mazeTarget=null,mazeFarmer=[1,13],mazeCamera=[...mazeStart],mazeWalk=0,mazeProgress=0,mazeHint=0,mazePath=[],mazeRoute=[],mazeLastTile='';
const openTile=(x,y)=>y>=0&&y<MAZE.length&&x>=0&&x<MAZE[0].length&&MAZE[y][x]==='.';
const tileKey=(x,y)=>x+','+y;
function mazeBfs(from,to){const q=[[...from]],seen=new Set([tileKey(...from)]),parent=new Map();for(let i=0;i<q.length;i++){let [x,y]=q[i];if(x===to[0]&&y===to[1]){const result=[[x,y]];while(parent.has(tileKey(x,y))){[x,y]=parent.get(tileKey(x,y));result.unshift([x,y]);}return result;}for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const nx=x+dx,ny=y+dy,k=tileKey(nx,ny);if(openTile(nx,ny)&&!seen.has(k)){seen.add(k);parent.set(k,[x,y]);q.push([nx,ny]);}}}return [];}
function beginMaze(){stopVoice();lastCornCue=-99;selectMaze();state='maze';$('guide').textContent='MOVE TO GUIDE THE TURKEY';sceneTime=0;mazePos=[...mazeStart];mazeTarget=null;mazeFarmer=[...mazeStart];mazeCamera=[...mazeStart];mazeProgress=0;mazeHint=0;mazePath=[];mazeRoute=[];mazeWalk=0;mazeFarmerClock=0;mazeGrace=({easy:6,normal:4,hard:2.5,expert:1.5}[mazeDifficulty]||6);mazePointer=null;mazePointerHeld=false;cleared=0;hits=0;$('overlay').hidden=true;$('finaleSkip').hidden=true;$('finaleJump').hidden=true;updateHud();sync();}
function mazeScreen(){const tile=79,centerX=500,centerY=350;return {tile,ox:centerX-mazeCamera[0]*tile,oy:centerY-mazeCamera[1]*tile};}
function drawMaze(){fill(0,0,1000,650,'#6c9444');const {tile,ox,oy}=mazeScreen();g.save();g.beginPath();g.rect(0,0,1000,650);g.clip();for(let y=0;y<MAZE.length;y++)for(let x=0;x<MAZE[0].length;x++){let px=ox+x*tile,py=oy+y*tile;if(px>1040||px+tile< -40||py>690||py+tile< -40)continue;if(openTile(x,y)){fill(px,py,tile+1,tile+1,'#c69b69');fill(px+5,py+5,tile-10,tile-10,'#d9b080');for(let i=0;i<3;i++)oval(px+16+(i*23+x*7)%52,py+16+(i*19+y*11)%48,2.5,1.5,'#aa835d');}else{fill(px,py,tile+1,tile+1,'#4e7e35');for(let k=0;k<4;k++){let cx=px+10+k*20,cy=py+tile-7;stroke([[cx,cy],[cx-2,py+10]],'#477e30',5);path([[cx,cy-18],[cx-14,cy-42],[cx,cy-34]],'#6ba63e');path([[cx,cy-35],[cx+14,cy-61],[cx,cy-49]],'#83b948');oval(cx-2,py+17,6,13,'#f2c44d');}stroke([[px+2,py+tile-3],[px+tile-2,py+tile-3]],'#365f2c',5);}}
const exitX=ox+mazeExit[0]*tile+tile/2,exitY=oy+mazeExit[1]*tile+tile/2;oval(exitX,exitY,25,25,'#f9db79');g.fillStyle='#28563c';g.textAlign='center';g.font='bold 17px system-ui';g.fillText('EXIT',exitX,exitY+5);
function actor(pos,kind){let x=ox+(pos[0]+.5)*tile,y=oy+(pos[1]+.5)*tile;if(kind==='turkey'){g.save();g.translate(x,y);g.rotate(Math.sin(time*7)*.035);g.scale(.46,.46);turkey(0,40,time,1,0,false);g.restore();}else{g.save();g.translate(x,y);g.scale(.45,.45);farmer(0,45,1,time,kind==='blue'?'#6388a9':'#b96f50');g.restore();}}
actor(mazeFarmer,'blue');actor([mazeFarmer[0]-.24,mazeFarmer[1]+.16],'red');actor(mazePos,'turkey');g.restore();
fill(235,10,530,51,'#fff2cf');g.fillStyle='#31533b';g.font='bold 23px system-ui';g.textAlign='center';g.fillText(mazeDragRequired?'Hold and drag through the corn!':'Move the pointer to guide the turkey!',500,43);fill(350,590,300,42,'#fff2cf');g.fillStyle='#31533b';g.font='bold 20px system-ui';g.fillText('Find the glowing exit',500,617);
}
function mazePointerMove(e){
 if(state!=='maze'||freeze||mazeDragRequired&&!mazePointerHeld)return;
 const r=C.getBoundingClientRect(),px=(e.clientX-r.left)*W/r.width,py=(e.clientY-r.top)*H/r.height;
 if(px<0||px>W||py<0||py>H)return;
 const {tile,ox,oy}=mazeScreen(),tx=Math.floor((px-ox)/tile),ty=Math.floor((py-oy)/tile);
 if(!openTile(tx,ty))return;
 const route=mazeBfs(mazePos,[tx,ty]);
 // Only guide into nearby connected corridors; never autopilot across the maze.
 if(route.length>1&&route.length<=4){mazeRoute=route.slice(1);mazePointer=[tx,ty];}
 else if(route.length===1){mazeRoute=[];mazePointer=[tx,ty];}
}
function updateMaze(dt){if(time-lastCornCue>5&&state==='maze'&&mazePointer){play('corn');lastCornCue=time;}
 time+=dt;mazeWalk+=dt;mazeFarmerClock+=dt;mazeGrace=Math.max(0,mazeGrace-dt);
 mazeCamera[0]=mix(mazeCamera[0],mazePos[0],clamp(dt*6,0,1));mazeCamera[1]=mix(mazeCamera[1],mazePos[1],clamp(dt*6,0,1));
 if(mazeWalk>.145&&mazeRoute.length){
  mazeWalk=0;mazePos=mazeRoute.shift();
  const progress=mazeSolution.findIndex(p=>p[0]===mazePos[0]&&p[1]===mazePos[1]);
  mazeProgress=Math.max(mazeProgress,progress);cleared=Math.min(5,Math.floor(mazeProgress/Math.max(1,mazeSolution.length-1)*6));updateHud();
  if(mazePos[0]===mazeExit[0]&&mazePos[1]===mazeExit[1]){cleared=6;$('guide').textContent='CLICK LEFT ◀  •  ▶ CLICK RIGHT';state='running';run=0;spawnTimer=1.8;obstacles=[];lane=-1;laneX=-1;mazeRoute=[];updateHud();sync();return;}
 }
 if(mazeGrace===0 && mazeFarmerClock>({easy:.66,normal:.49,hard:.34,expert:.24}[mazeDifficulty]||.66)){
  mazeFarmerClock=0;
  const route=mazeBfs(mazeFarmer,mazePos);
  if(route.length>1)mazeFarmer=route[1];
  if(mazeGrace===0&&mazeFarmer[0]===mazePos[0]&&mazeFarmer[1]===mazePos[1]){
   mazeRoute=[];mazePointerHeld=false;state='mazeCaught';sceneTime=0;voiceStage=0;stop();play('fail');$('finaleSkip').hidden=false;return;
  }
 }
}

function showOverlay(title,desc,button){$('heading').textContent=title;$('description').textContent=desc;$('start').textContent=button;$('overlay').hidden=false;}
let voiceStage=0;function stopVoice(){for(const k of ['getTurkey','turkeyGo','eatTurkey','noTurkey']){audio[k].pause();audio[k].currentTime=0;}}function voiceTick(){if(freeze||!sound)return;let key=null,at=0;if(state==='intro'){key='getTurkey';at=1.4;}else if(state==='victory'){key='noTurkey';at=7;}else if(state==='caught'){key='eatTurkey';at=3.3;}else if(state==='mazeCaught'){key='eatTurkey';at=3.6;}if(key&&voiceStage===0&&sceneTime>=at){voiceStage=1;play(key);}}function begin(){voiceStage=0;state='intro';sceneTime=0;$('overlay').hidden=true;$('finaleSkip').hidden=false;play('gobble');}
function runStart(){state='running';sceneTime=0;run=0;lane=-1;laneX=-1;obstacles=[];cleared=0;hits=0;spawnTimer=0;jump=null;invincible=0;impact=0;tractorGap=1;particles=[];$('overlay').hidden=true;$('finaleSkip').hidden=true;updateHud();sync();}
function updateHud(){$('distance').textContent=`${cleared} / ${6+runningGoal}`;$('hearts').textContent='❤️'.repeat(3-hits)+'🖤'.repeat(hits);$('finaleStatus').textContent=names[section()];}
function end(win){voiceStage=0;state=win?'victory':'caught';sceneTime=0;stop();$('finaleSkip').hidden=false;play(win?'victory':'fail');}
function finish(){stopVoice();if(state==='intro'){runStart();return;}if(state==='victory'){state='doneWin';showOverlay('Turkey Trot Champion!','The turkey found its family in the peaceful meadow. All four adventures are complete!','Play Final Level Again');}else{state='doneLose';showOverlay('Thanksgiving Dinner!','The farmers caught up. Try the final getaway again!','Try Again');}$('finaleSkip').hidden=true;}
function update(dt){voiceTick();if(state==='maze'){updateMaze(dt);return;}if(state==='mazeCaught'){sceneTime+=dt;if(sceneTime>=8)finish();return;}time+=dt;if(state==='intro'||state==='victory'||state==='caught'){sceneTime+=dt;if(state==='intro'&&sceneTime>=7)beginMaze();if(state==='victory'&&sceneTime>=13)finish();if(state==='caught'&&sceneTime>=9)finish();return;}if(state!=='running')return;run+=dt*(1+cleared*.008);laneX=mix(laneX,lane,clamp(dt*11,0,1));invincible=Math.max(0,invincible-dt);impact=Math.max(0,impact-dt);tractorGap=clamp(tractorGap+dt*.008,0,1);if(jump){jump.age+=dt;if(jump.age>=1.05){jump=null;play('land');}}spawnTimer-=dt;if(spawnTimer<=0&&cleared+obstacles.filter(o=>!o.done).length<6+runningGoal){generate();spawnTimer=2.6-Math.min(.52,cleared*.018);}let speed=dt*(.32+Math.min(.065,cleared*.0025));for(const o of obstacles){o.z+=speed;o.phase+=dt*(o.type==='gate'?2.3:1.6);if(o.done)continue;if(o.z>=.94){o.done=true;const safe=o.type==='log'?(!!jump&&jump.age>.12&&jump.age<.98):o.type==='gate'?(lane===o.lane):(o.lane!==lane);if(!safe&&invincible<=0){hits++;invincible=1.6;impact=1.15;tractorGap=Math.max(.1,tractorGap-.3);play(o.type==='hay'?'hay':o.type==='pumpkin'?'pumpkin':o.type==='gate'?'gate':'bump');play('roll');if(hits>=3){updateHud();end(false);return;}}else if(safe)play('land');cleared++;updateHud();if(cleared>=6+runningGoal){end(true);return;}}}obstacles=obstacles.filter(o=>o.z<1.18);const near=obstacles.find(o=>o.type==='log'&&!o.done&&o.z>.39&&o.z<.89);$('finaleJump').hidden=!near;sync();}
function scene(){const sec=section();background(run,sec);const progress=clamp((1-tractorGap),0,1);farmer(225,633-progress*45,.58+progress*.10,time,'#6388a9');farmer(775,633-progress*45,.58+progress*.10,time+.4,'#b96f50');obstacles.slice().sort((a,b)=>a.z-b.z).forEach(o=>{g.save();if(o.done)g.globalAlpha=clamp((1.17-o.z)/.2,0,1);obstacle(o);g.restore();});const air=jump?Math.sin(Math.PI*clamp(jump.age/1.05,0,1))*105:0;
 if(impact>0){const u=1-impact/1.15;g.save();g.translate(500+laneX*170,575);g.rotate(Math.sin(Math.PI*Math.min(1,u))*Math.PI*1.6);g.translate(-(500+laneX*170),-575);turkey(500+laneX*170,575,time,1.13,Math.sin(Math.PI*u)*34);g.restore();}
 else turkey(500+laneX*170,575,time,1.13,air);if(impact>0){for(let i=0;i<7;i++)oval(500+laneX*170+Math.sin(i*2+time*5)*50,560+Math.cos(i+time*6)*20,4,4,'#dfc18c');}}
function intro(){
 // Cornfield entrance: the farmers follow the turkey on foot.
 background(0,0);
 for(let i=0;i<9;i++){const z=i/9;corn(100+i*42,490+z*130,.8+z*.3);corn(900-i*42,490+z*130,.8+z*.3);}
 const t=sceneTime;
 turkey(500,560-Math.min(t,6)*18,t,1.1-Math.min(t,6)*.09,0);
 if(t>1.2){farmer(390,650-Math.min(t-1.2,5)*35,.68,t,'#6388a9');farmer(610,650-Math.min(t-1.2,5)*35,.68,t+.4,'#b96f50');}
 label(t<2?'A PATH THROUGH THE CORN!':t<4?'THE FARMERS SPOT THE TURKEY!':'QUICK! INTO THE MAZE!',500,105,32);
}
function victory(){let t=sceneTime;const sky=g.createLinearGradient(0,0,0,650);sky.addColorStop(0,'#efb16e');sky.addColorStop(1,'#fff0ba');fill(0,0,1000,650,sky);path([[0,380],[260,320],[500,365],[750,300],[1000,365],[1000,650],[0,650]],'#82b26c');for(let i=0;i<9;i++)tree(i*130,420,.6+(i%3)*.1,i%2);if(t<5){for(let i=0;i<5;i++)fill(690+i*18,560-i*5,42,25,'#d4a045');farmer(720,590,.65,t,'#6388a9');farmer(845,590,.65,t+.6,'#b96f50');turkey(350,580,t,1.1,0);label('THE TURKEY ESCAPED!',500,90,37);}else{for(let i=0;i<4;i++)turkey(240+i*155,550+Math.sin(t*3+i)*8,t+i*.6,.65,0,i%2===0);turkey(500,580,t,1.25,0,true);for(let i=0;i<24;i++){let x=(i*137+t*20)%1000,y=(i*97+t*36)%650;oval(x,y,5,3,i%2?'#e6a33d':'#d46e34');}label('TURKEY TROT CHAMPION!',500,100,47);label('SAFE WITH THE FLOCK!',500,145,29);}}
function caughtDinner(){const t=sceneTime;fill(0,0,1000,650,'#f4d5a7');fill(0,0,1000,230,'#e5b687');for(let i=0;i<8;i++)fill(i*135,0,9,230,'#fff0cb');farmer(160,600,1.12,t,'#6388a9');farmer(840,600,1.12,t+.4,'#b96f50');fill(240,440,520,170,'#9c603b');fill(235,420,530,55,'#f4e4c4');oval(500,426,180,44,'#f9f1da');oval(500,402,119,57,'#bc7135');oval(490,384,88,40,'#e5a052');for(let side of [-1,1]){oval(500+side*110,415,42,23,'#b97839');stroke([[500+side*139,414],[500+side*175,418]],'#f8e6d0',11);}label('Thanksgiving Dinner!',500,98,46);}
function caught(){const t=sceneTime;if(t<3){background(0,3);farmer(350,565,.82,t,'#6388a9');farmer(650,565,.82,t+.4,'#b96f50');turkey(500,575,t,1.0,0,true);label('THE FARMERS CAUGHT UP!',500,105,37);return;}fill(0,0,1000,650,'#f4d5a7');fill(0,0,1000,230,'#e5b687');for(let i=0;i<8;i++)fill(i*135,0,9,230,'#fff0cb');farmer(160,600,1.12,t,'#6388a9');farmer(840,600,1.12,t+.4,'#b96f50');fill(240,440,520,170,'#9c603b');fill(235,420,530,55,'#f4e4c4');oval(500,426,180,44,'#f9f1da');oval(500,402,119,57,'#bc7135');oval(490,384,88,40,'#e5a052');for(let side of [-1,1]){oval(500+side*110,415,42,23,'#b97839');stroke([[500+side*139,414],[500+side*175,418]],'#f8e6d0',11);}for(let i=0;i<7;i++)oval(350+i*50,445,13,9,i%2?'#8eb15a':'#e9a64b');label('Thanksgiving Dinner!',500,98,46);}
function draw(){g.clearRect(0,0,W,H);$('stage').classList.toggle('maze-mode',state==='maze'||state==='mazeCaught'||state==='intro');if(state==='maze')drawMaze();else if(state==='mazeCaught'){if(sceneTime<3.5){drawMaze();g.save();g.fillStyle='rgba(30,40,24,.34)';g.fillRect(0,0,W,H);g.restore();label('THE FARMERS CAUGHT THE TURKEY!',500,145,34);}else caughtDinner();}else if(state==='intro')intro();else if(state==='victory'||state==='doneWin')victory();else if(state==='caught'||state==='doneLose')caught();else scene();}
function frame(ms){const dt=last?Math.min(.05,(ms-last)/1000):0;last=ms;if(!freeze)update(dt);draw();requestAnimationFrame(frame);}C.addEventListener('pointerdown',e=>{if(state==='maze'&&!freeze){mazePointerHeld=true;mazePointerMove(e);return;}if(state!=='running'||freeze||impact>0)return;const r=C.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;lane=x<.5?-1:1;});C.addEventListener('pointermove',mazePointerMove);window.addEventListener('pointerup',()=>{mazePointerHeld=false;if(mazeDragRequired&&state==='maze')mazeRoute=[];});C.addEventListener('pointerleave',()=>{if(mazeDragRequired)mazeRoute=[];});
fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(data=>{mazeDragRequired=data.turkeyTrotMazeRequireClickAndDrag===true;mazeDifficulty=['easy','normal','hard','expert'].includes(data.turkeyTrotMazeDifficulty)?data.turkeyTrotMazeDifficulty:'easy';const n=Number(data.turkeyTrotLevel4Count);if(Number.isInteger(n)&&n>=3&&n<=20)runningGoal=n;updateHud();}).catch(()=>{});
for(const [id,value] of [['finaleLeft',-1],['finaleRight',1]])$(id).addEventListener('pointerdown',e=>{e.stopPropagation();if(state==='running'&&!freeze&&impact<=0)lane=value;});$('finaleJump').addEventListener('pointerdown',e=>{e.stopPropagation();if(state!=='running'||freeze||jump)return;const o=obstacles.find(o=>o.type==='log'&&!o.done&&o.z>.39&&o.z<.89);if(!o)return;jump={age:0};play('flap');});$('start').onclick=()=>{if(state==='ready'||state==='doneWin'||state==='doneLose')begin();};$('finaleSkip').onclick=()=>{if(state==='intro')beginMaze();else finish();};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'🔊':'🔇';if(!sound)stop();else sync();};requestAnimationFrame(frame);
})();
