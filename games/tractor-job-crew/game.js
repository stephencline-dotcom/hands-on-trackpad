(()=>{'use strict';
const canvas=document.getElementById('world'),c=canvas.getContext('2d'),msg=document.getElementById('message'),score=document.getElementById('score'),welcome=document.getElementById('welcome');
let W=1200;const H=690;let level=1,stage=0,plowRows=[],cargo=[];const LEVEL_NAMES=['Hay Bale Hustle','Runaway Hay Wagon','Harvest Hauler','Farm Rescue','Master Farm Operator'];let tractor,hay,delivered,phase='intro',target=null,last=0,active=true,sound=false,audio=null,helpAt=0;
function announce(t){msg.textContent=t;if(sound&&window.speechSynthesis&&phase==='playing'){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.92;u.pitch=1.12;speechSynthesis.speak(u)}}
let tractorAllowedLevels=[true,false,false,false,false];
function firstTractorLevel(){const n=tractorAllowedLevels.findIndex(Boolean);return n<0?1:n+1}
function nextTractorLevel(current){for(let n=current+1;n<=5;n++)if(tractorAllowedLevels[n-1])return n;return null}
function tractorLevelPicker(){
 let picker=document.getElementById('tractorLevelPicker');
 if(!picker){picker=document.createElement('div');picker.id='tractorLevelPicker';picker.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px auto;max-width:95%';document.getElementById('welcomeText').after(picker)}
 picker.replaceChildren();
 tractorAllowedLevels.forEach((enabled,i)=>{if(!enabled)return;const b=document.createElement('button');b.type='button';b.textContent=`${i+1}. ${LEVEL_NAMES[i]}`;b.style.cssText='font-size:14px;padding:7px 10px;border-radius:12px;border:2px solid #5a8b46;background:'+(level===i+1?'#ffe48a':'#fff');b.addEventListener('click',()=>{level=i+1;setupLevel()});picker.append(b)});
 picker.hidden=phase==='playing';
}
async function loadTractorLevels(){try{const r=await fetch('/api/settings',{cache:'no-store'});if(!r.ok)throw Error('settings');const s=await r.json();if(Array.isArray(s.tractorJobCrewLevels)&&s.tractorJobCrewLevels.length===5&&s.tractorJobCrewLevels.some(v=>v===true))tractorAllowedLevels=s.tractorJobCrewLevels.map(v=>v===true)}catch(e){console.warn('Tractor level settings unavailable; using safe defaults',e)}level=firstTractorLevel();setupLevel()}
function reset(){level=firstTractorLevel();setupLevel()}
function setupLevel(){W=level===1?1600:1200;canvas.width=W;canvas.height=H;document.getElementById('scene').style.setProperty('--farm-ratio',W+' / '+H);if(level===2)RunawayWagon.reset();safeDriveHistory.length=0;collisionWait=0;tractor={x:level===2||level===5?130:520,y:level===2||level===5?540:410,angle:0,speed:0,load:0,wagonAngle:0,wheelSpin:0,steer:0,dust:[]};farmerPose='seated';hay=[{x:690,y:185},{x:1050,y:270},{x:1420,y:470}];delivered=0;target=null;score.textContent='0 / 3';phase='intro';stage=0;plowRows=[false,false,false];fieldPasses=[0,0,0];plowTimer=0;farmerWalk=0;plowAttached=false;hitchReady=false;plowClickPending=false;furrowCoverage=Array.from({length:3},()=>[new Set(),new Set()]);cargo=[];document.getElementById('title').textContent=LEVEL_NAMES[level-1];welcome.hidden=false;document.getElementById('welcomeTitle').textContent=LEVEL_NAMES[level-1]+'!';document.getElementById('welcomeText').textContent=level===1?'Collect hay, drive through the barn doors, and pull your wagon onto the unloading spot!':level===2?'A runaway hay wagon is racing downhill! Catch it and click the hitch to rescue it.':level===3?'Gather three crates of harvested crops and haul them to the barn.':level===4?'A storm is coming. Move three supply crates safely into the barn.': 'Complete the farm jobs: plow the field, then haul supplies to the barn.';document.getElementById('start').textContent='Start driving!';tractorLevelPicker();announce(level===1?'Drive to the golden hay bales!':'Get ready for your next farm job!')}
function blocked(){return document.hidden||!document.hasFocus()||!!document.querySelector('[id*="freeze"][style*="display: block"],.freeze-screen-overlay:not([hidden])')}
function ellipse(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function poly(points,fill,stroke='#0000',width=1){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=fill;c.fill();if(stroke!=='#0000'){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function path(){c.lineCap='round';c.lineJoin='round';c.strokeStyle='#a37c4d';c.lineWidth=120;c.beginPath();c.moveTo(95,520);c.bezierCurveTo(340,500,380,260,610,285);c.bezierCurveTo(970,290,1180,500,W-35,450);c.stroke();c.strokeStyle='#e7c18a';c.lineWidth=109;c.stroke();c.strokeStyle='#f7dca5';c.lineWidth=92;c.stroke();c.strokeStyle='#e5bd82';c.lineWidth=3;c.setLineDash([5,26]);c.stroke();c.setLineDash([])}
function tree(x,y,r=38){ellipse(x+9,y+22,r*.8,r*.32,'#577d38');box(x-7,y-6,14,44,'#926139');for(const [dx,dy,sz,col] of [[-20,-22,.76,'#3b8b43'],[18,-29,.9,'#438f42'],[0,-45,1,'#59a84d'],[-11,-54,.6,'#6bb756']])ellipse(x+dx,y+dy,r*sz,r*sz*.86,col)}
function fence(x,y,w){for(let i=0;i<=w;i+=38){box(x+i,y-17,8,47,'#a56b32');poly([[x+i-2,y-17],[x+i+4,y-28],[x+i+12,y-17]],'#d59c51')}box(x,y-7,w+8,8,'#d8a15a');box(x,y+14,w+8,8,'#d8a15a')}
const TREES=[{x:85,y:95,r:36},{x:1080,y:85,r:39},{x:1085,y:615,r:43},{x:440,y:585,r:32},{x:43,y:665,r:28},{x:660,y:580,r:29}];
let plowTimer=0, farmerWalk=0, fieldPasses=[0,0,0], plowAttached=false;
// Three fields, two furrows per field. Coverage is based on actual tractor travel.
const PLOW_FIELDS=[{x:420,y:75,w:310,h:140},{x:805,y:270,w:305,h:145},{x:440,y:490,w:310,h:145}];
const PLOW_PARK={x:270,y:535},PLOW_HITCH={x:325,y:535};
let farmerPose='seated';
function isPlowMission(){return level===2||(level===5&&stage<6)}
let furrowCoverage=[],hitchReady=false,plowClickPending=false;
function nextFurrow(){for(let i=0;i<3;i++)for(let j=0;j<2;j++)if(furrowCoverage[i][j].size<7)return {i,j};return null}
function plowPoint(i,j){return {x:PLOW_FIELDS[i].x+28,y:PLOW_FIELDS[i].y+42+j*64}}
function hitchClick(e){if(phase!=='playing'||stage!==1||!hitchReady||blocked())return;const p=point(e);if(Math.hypot(p.x-PLOW_HITCH.x,p.y-PLOW_HITCH.y)<66){plowClickPending=true;announce('Hitch clicked! Watch the farmer secure the plow.')}}
let cowState={x:835,y:145,goalX:835,goalY:145,rest:0,chew:0,tail:0};
const BARN={left:95,right:369,top:167,bottom:410,centerX:232};
// The tractor pulls beyond the unload pad so the trailing wagon can reach it.
const BARN_DROP={x:230,y:237};
const BARN_WAGON_PAD={x:230,y:320};
function barn(t){
 // Barn footprint, cast shadow, timber floor and walls stay visible as the roof fades.
 ellipse(238,387,162,56,'#587d3b77');
 box(93,177,279,229,'#8c4b34');
 box(111,194,243,196,'#cfa36c');
 for(let y=201;y<390;y+=24)box(114,y,240,2,'#ae7949');
 // Hay stacks on either side of the drive-through lane.
 for(let y of [252,310,365]){bale(122,y,.36);bale(342,y,.36)}
 box(93,177,20,225,'#ae3e2d');box(352,177,20,225,'#ae3e2d');
 for(let y=196;y<392;y+=24){box(97,y,12,3,'#df7956');box(356,y,12,3,'#df7956')}
 // Two open ends make this a genuine north-south drive-through barn.
 box(114,177,16,13,'#8e4e2c');box(330,177,22,13,'#8e4e2c');
 box(130,177,200,6,'#f9e4b1');
 box(114,390,16,13,'#8e4e2c');box(330,390,22,13,'#8e4e2c');
 box(130,395,200,6,'#f9e4b1');
 // Unloading zone is placed inside the building, not on its exterior wall.
 box(184,285,96,77,'#a87846');
 c.strokeStyle='#fff2b3';c.lineWidth=4;c.setLineDash([7,8]);c.strokeRect(192,293,80,60);c.setLineDash([]);
 c.font='bold 13px Trebuchet MS';c.textAlign='center';c.fillStyle='#fff4d2';c.fillText('UNLOAD',232,332);c.textAlign='left';
 if(tractor.load){const pulse=3*Math.sin(t/260);c.strokeStyle='#ffe46b';c.lineWidth=4;c.beginPath();c.ellipse(232,324,44+pulse,43+pulse,0,0,Math.PI*2);c.stroke()}
}
function wagonPosition(){
 const hx=tractor.x-Math.cos(tractor.angle)*49,hy=tractor.y-Math.sin(tractor.angle)*49;
 return {x:hx-Math.cos(tractor.wagonAngle)*58,y:hy-Math.sin(tractor.wagonAngle)*58};
}
function barnRoof(t){
 const w=wagonPosition();
 // Fade before the tractor reaches the doors; stay faded until the wagon exits.
 const proximity=Math.min(Math.hypot(tractor.x-232,tractor.y-315),Math.hypot(w.x-232,w.y-315));
 const inside= (tractor.x>105&&tractor.x<365&&tractor.y>168&&tractor.y<425) ||
              (w.x>105&&w.x<365&&w.y>168&&w.y<425);
 const fade=inside?0.07:Math.max(.07,Math.min(1,(proximity-145)/105));
 c.save();c.globalAlpha=fade;
 // Roof has two shaded slopes and a strong white ridge; its front edge sits above the doors.
 poly([[80,190],[231,108],[386,190],[386,355],[231,273],[80,355]],'#f5e9d0','#ffffff',8);
 poly([[87,191],[231,119],[231,273],[87,346]],'#a84031');
 poly([[231,119],[379,191],[379,346],[231,273]],'#79392e');
 c.strokeStyle='#e5b28c';c.lineWidth=3;
 for(let i=0;i<4;i++){let d=i*36;c.beginPath();c.moveTo(94+d*.72,200+d);c.lineTo(230,130+d);c.stroke()}
 c.strokeStyle='#fdf5df';c.lineWidth=7;c.beginPath();c.moveTo(231,115);c.lineTo(231,273);c.stroke();
 c.restore();
 // The entry is visible even when the roof is opaque.
 box(130,375,200,13,'#753e2d');
 c.fillStyle='#fff3d3';c.font='bold 13px Trebuchet MS';c.textAlign='center';c.fillText('ANIMAL BARN',232,386);c.textAlign='left';
}

function bale(x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);ellipse(5,23,35,12,'#5b713c77');poly([[-30,-14],[18,-14],[34,-5],[-14,-5]],'#ffe18a');poly([[-14,-5],[34,-5],[34,25],[-14,25]],'#c28a2f');poly([[-30,-14],[-14,-5],[-14,25],[-30,15]],'#dda83f');c.strokeStyle='#9d702e';c.lineWidth=3;for(let q of [0,20]){c.beginPath();c.moveTo(q-16,-9);c.lineTo(q,0);c.lineTo(q,23);c.stroke()}c.restore()}
function cow(x,y,t){
 c.save();c.translate(x,y);const grazing=cowState.rest>0;const sway=Math.sin(t/240)*2;
 ellipse(2,34,61,17,'#5c8a4766');
 // Four legs, visible hooves and moving tail.
 for(const [lx,ly] of [[-31,-22],[-31,23],[27,-22],[27,23]]){
  ellipse(lx,ly+8,10,14,'#eee9da');ellipse(lx+1,ly+17,8,5,'#62605b');
 }
 c.strokeStyle='#eee9da';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-46,0);c.quadraticCurveTo(-65,-15+sway,-62,-31+sway);c.stroke();
 ellipse(-3,0,53,34,'#fffdf0');ellipse(-21,-10,17,16,'#373e43');ellipse(12,15,16,12,'#373e43');ellipse(28,-14,11,9,'#373e43');
 const headY=grazing?11:-13;
 ellipse(43,headY,27,24,'#fffaf0');ellipse(36,headY-20,12,8,'#f1c3c2');ellipse(57,headY-20,12,8,'#f1c3c2');
 // Broad cow muzzle with nostrils at the sides, not a round pig snout.
 ellipse(61,headY+12,23,12,'#e9b9ae');ellipse(48,headY+11,4,2.4,'#946c67');ellipse(72,headY+11,4,2.4,'#946c67');
 c.strokeStyle='#b98c83';c.lineWidth=1.8;c.beginPath();c.moveTo(56,headY+20);c.quadraticCurveTo(61,headY+23,67,headY+20);c.stroke();
 ellipse(45,headY-6,3.5,4,'#292d2d');ellipse(59,headY-6,3.5,4,'#292d2d');
 if(grazing){for(let i=0;i<3;i++){c.strokeStyle='#347d37';c.lineWidth=3;c.beginPath();c.moveTo(62+i*5,headY+22);c.lineTo(65+i*5,headY+15+Math.sin(t/130+i)*3);c.stroke()}}
 c.restore();
}
function updateCow(dt,t){
 cowState.tail=t;
 if(cowState.rest>0){cowState.rest-=dt;cowState.chew+=dt;return}
 const dx=cowState.goalX-cowState.x,dy=cowState.goalY-cowState.y,d=Math.hypot(dx,dy);
 if(d<5){cowState.rest=2.5+Math.random()*3.5;cowState.goalX=770+Math.random()*120;cowState.goalY=115+Math.random()*52;return}
 const step=Math.min(d,dt*15);cowState.x+=dx/d*step;cowState.y+=dy/d*step;
}
function treeCollision(x,y,r){return isPlowMission()?false:TREES.some(tr=>Math.hypot(x-tr.x,y-(tr.y+8))<r+tr.r)}
// Collision geometry follows the three visible pasture fence sections. The cow stays inside.
const PASTURE_FENCES=[{x1:700,y1:73,x2:900,y2:73},{x1:720,y1:192,x2:915,y2:192},{x1:990,y1:196,x2:1145,y2:196}];
function pointSegmentDistance(px,py,a){const dx=a.x2-a.x1,dy=a.y2-a.y1;const u=Math.max(0,Math.min(1,((px-a.x1)*dx+(py-a.y1)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-a.x1-u*dx,py-a.y1-u*dy)}
function pastureCollision(x,y,r){return PASTURE_FENCES.some(f=>pointSegmentDistance(x,y,f)<r+13)||Math.hypot(x-cowState.x,y-cowState.y)<r+49}
// Tractor movement and trailer placement are checked independently.
// A blocked trailer must not disable the tractor's steering or forward motion.
// Continuous barn-wall collision: solid side walls, open north and south doorways.
// Use the same geometry for tractor and wagon to prevent entry/exit seams.
function barnWallCollision(x,y,r){
 const left=93,right=372,top=177,bottom=403;
 const frontDoorLeft=130,frontDoorRight=330;
 const rearDoorLeft=130,rearDoorRight=330;
 const walls=[
  // North exit is open directly opposite the south entrance.
  {x1:left,y1:top,x2:rearDoorLeft,y2:top},
  {x1:rearDoorRight,y1:top,x2:right,y2:top},
  {x1:left,y1:top,x2:left,y2:bottom},
  {x1:right,y1:top,x2:right,y2:bottom},
  {x1:left,y1:bottom,x2:frontDoorLeft,y2:bottom},
  {x1:frontDoorRight,y1:bottom,x2:right,y2:bottom}
 ];
 return walls.some(w=>pointSegmentDistance(x,y,w)<r+3);
}
function tractorClear(x,y){
 if(x<56||x>W-56||y<55||y>H-55)return false;
 if(isPlowMission())return true;
 if(treeCollision(x,y,30)||pastureCollision(x,y,30))return false;
 if(barnWallCollision(x,y,27))return false;
 return true;
}
function wagonClear(x,y,angle,wagonAngle){
 if(isPlowMission())return true;
 const wx=x-Math.cos(angle)*49-Math.cos(wagonAngle)*58;
 const wy=y-Math.sin(angle)*49-Math.sin(wagonAngle)*58;
 if(wx<35||wx>W-35||wy<35||wy>H-35)return false;
 if(treeCollision(wx,wy,26)||pastureCollision(wx,wy,26))return false;
 // The wagon uses the same north and south openings as the tractor.
 if(barnWallCollision(wx,wy,23))return false;
 return true;
}
function canDrive(x,y,angle,wagonAngle){return tractorClear(x,y)&&wagonClear(x,y,angle,wagonAngle)}
function chooseWagonAngle(x,y,angle,preferred){
 if(isPlowMission())return preferred;
 const norm=a=>Math.atan2(Math.sin(a),Math.cos(a));
 for(const a of [preferred,tractor.wagonAngle,angle,...[.15,.3,.5,.8,1.2,1.7,2.3,3.14].flatMap(d=>[angle+d,angle-d])]){
  if(wagonClear(x,y,angle,a))return norm(a);
 }
 return null;
}
// Collision recovery: retain recent safe configurations, never teleport through obstacles.
const safeDriveHistory=[];
let collisionWait=0;
let collisionHelpCooldown=0;
function rememberSafeDrive(){
 const state={x:tractor.x,y:tractor.y,angle:tractor.angle,wagonAngle:tractor.wagonAngle};
 if(!tractorClear(state.x,state.y))return;
 const prev=safeDriveHistory[safeDriveHistory.length-1];
 if(!prev||Math.hypot(prev.x-state.x,prev.y-state.y)>12){safeDriveHistory.push(state);if(safeDriveHistory.length>65)safeDriveHistory.shift()}
}
function moveSafely(nx,ny,wa){
 const dx=nx-tractor.x,dy=ny-tractor.y;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
 const sx=dx/steps,sy=dy/steps;
 let moved=false;
 for(let i=0;i<steps;i++){
  const x=tractor.x+sx,y=tractor.y+sy;
  let chosen=null;
  for(const p of [[x,y],[x,tractor.y],[tractor.x,y]]){
   if(tractorClear(p[0],p[1])){chosen=p;break}
  }
  if(!chosen)break;
  // A trailer obstacle cannot lock the tractor; its heading is resolved separately.
  const nextWagon=chooseWagonAngle(chosen[0],chosen[1],tractor.angle,wa);
  tractor.x=chosen[0];tractor.y=chosen[1];
  if(nextWagon!==null)tractor.wagonAngle=nextWagon;
  moved=true;
 }
 if(moved)rememberSafeDrive();
 return moved;
}
function steerClearance(nextAngle,nextWagon){
 const diff=Math.atan2(Math.sin(nextAngle-tractor.angle),Math.cos(nextAngle-tractor.angle));
 // Steering never depends on trailer collision; turn in place when necessary.
 if(!tractorClear(tractor.x,tractor.y))return false;
 tractor.angle+=diff;
 const candidate=chooseWagonAngle(tractor.x,tractor.y,tractor.angle,nextWagon);
 if(candidate!==null)tractor.wagonAngle=candidate;
 return true;
}
function recoverTractor(){
 if(phase!=='playing'||blocked())return;
 // Prefer a recent position with generous obstacle clearance.
 const candidates=[...safeDriveHistory].reverse();
 const defaults=level===2||level===5?[{x:130,y:540,angle:0,wagonAngle:0}]:[
  {x:520,y:410,angle:0,wagonAngle:0},
  {x:550,y:340,angle:0,wagonAngle:0},
  {x:390,y:455,angle:0,wagonAngle:0}
 ];
 let chosen=null;
 for(const p of [...candidates,...defaults]){
  if(!canDrive(p.x,p.y,p.angle,p.wagonAngle))continue;
  // Prefer clearance from trees and fences, including the trailer.
  const wx=p.x-Math.cos(p.angle)*49-Math.cos(p.wagonAngle)*58;
  const wy=p.y-Math.sin(p.angle)*49-Math.sin(p.wagonAngle)*58;
  if(!isPlowMission()&&(treeCollision(p.x,p.y,42)||pastureCollision(p.x,p.y,42)||treeCollision(wx,wy,40)||pastureCollision(wx,wy,40)))continue;
  chosen=p;break;
 }
 if(!chosen){announce('Try steering toward open ground.');return}
 Object.assign(tractor,{x:chosen.x,y:chosen.y,angle:chosen.angle,wagonAngle:chosen.wagonAngle,speed:0,steer:0,dust:[]});
 target=null;collisionWait=0;safeDriveHistory.length=0;rememberSafeDrive();
 announce('Ready! Steer toward an open path.');
}
function scenery(t){if(level===2){journeyLandscape(t);return}if(isPlowMission()){plowLandscape(t);return}box(0,0,W,H,'#9ccc67');for(let i=0;i<300;i++){let x=(i*191+53)%W,y=(i*137+31)%H;ellipse(x,y,2+i%3,1+i%2,i%3?'#80ba55':'#c2df81')}poly([[940,0],[1200,0],[1200,150],[1070,185],[990,120]],'#77b65a');for(let i=0;i<9;i++){let x=950+i*30;poly([[x,25],[x+12,20],[x+17,95],[x+5,101]],i%2?'#e5b94e':'#79ad45')};path();fence(700,73,200);fence(990,196,155);fence(720,192,195);cow(cowState.x,cowState.y,t);tree(85,95,48);tree(1080,85,51);tree(1085,615,57);tree(440,585,42);tree(43,665,37);if(!isPlowMission())tree(660,580,37);box(142,56,182,100,'#d7bb83');for(let y=68;y<148;y+=23)box(150,y,166,2,'#c6a674');barn(t);if(level===1){
 // Expanded eastern farm: new world coordinates, not stretched artwork.
 c.save();
 for(let k=0;k<46;k++){const x=1208+(k*67)%380,y=20+(k*109)%650;
   ellipse(x,y,3+(k%3),2,'#e3eab0');
 }
 // A distant crop patch, orchard fence and flower meadow beyond the old boundary.
 box(1300,72,230,93,'#7fb858');
 for(let r=0;r<4;r++){box(1312,86+r*20,207,9,'#709d47');for(let q=0;q<10;q++)ellipse(1323+q*21,89+r*20,5,3,'#d7c36a')}
 for(let k=0;k<6;k++){const x=1260+k*53;ellipse(x,604,7,4,'#4e9947');ellipse(x-4,599,4,4,'#f8e8a8');ellipse(x+4,601,4,4,'#fff7e6')}
 // Decorative trees are away from the driving road.
 tree(1510,94,35);tree(1495,635,37);
 c.restore();
 }for(let i=0;i<40;i++){const x=(i*227+91)%W,y=(i*169+83)%H;if((x-600)**2+(y-345)**2>18000){ellipse(x,y,4,4,'#fff9da');ellipse(x+5,y+3,3,3,'#ffdc66')}}}
function drawPlow(x,y,a){
 c.save();c.translate(x,y);c.rotate(a);
 ellipse(-2,15,49,18,'#496d3e66');
 // Steel three-point hitch, sturdy frame, curved shares and depth wheel.
 c.strokeStyle='#344d59';c.lineWidth=6;c.lineJoin='round';c.beginPath();c.moveTo(49,0);c.lineTo(26,0);c.lineTo(12,-25);c.lineTo(-37,-25);c.lineTo(-37,24);c.lineTo(12,24);c.lineTo(26,0);c.stroke();
 box(-39,-29,55,7,'#59849b');box(-39,21,55,7,'#41687c');
 for(const q of [-27,-3,21]){
  poly([[q-10,-15],[q+8,-13],[q+3,7],[q-13,16]],'#91b9c5','#36596a',2);
  poly([[q-13,16],[q+3,7],[q+16,18],[q-2,28]],'#607f8a','#36596a',1.5);
  ellipse(q+5,2,3,3,'#d9e6e7');
 }
 ellipse(-39,25,9,9,'#25333b');ellipse(-39,25,4,4,'#aab8b8');
 ellipse(31,0,5,5,'#f5c65d');c.restore();
}
function drawFarmer(x,y,t,walking,working){
 c.save();c.translate(x,y);ellipse(0,14,13,5,'#54773e66');
 const step=walking?Math.sin(t/110)*5:0;
 c.strokeStyle='#3c4b5c';c.lineWidth=5;c.lineCap='round';
 c.beginPath();c.moveTo(-5,7);c.lineTo(-6+step,18);c.moveTo(5,7);c.lineTo(6-step,18);c.stroke();
 ellipse(0,-1,12,15,'#2777a8');
 c.strokeStyle='#edb988';c.lineWidth=4;c.beginPath();c.moveTo(-10,-7);c.lineTo(-16,working?4:7);c.moveTo(10,-7);c.lineTo(17,working?3:7);c.stroke();
 ellipse(0,-19+(working?5:0),9,9,'#e8b58a');box(-13,-31+(working?5:0),26,7,'#b18b36');
 c.restore();
}
function farmFlower(x,y,col='#f9d866'){
 for(let a=0;a<5;a++){const th=a*Math.PI*2/5;ellipse(x+Math.cos(th)*4,y+Math.sin(th)*4,3,3,col)}ellipse(x,y,2.5,2.5,'#e7a94c');
}
function fieldMarker(x,y,label){
 ellipse(x+2,y+5,48,9,'#537b3c55');box(x-3,y-3,6,25,'#80603b');
 box(x-44,y-25,88,27,'#8f5d35');box(x-40,y-22,80,21,'#bc8b4d');
 c.fillStyle='#fff3ce';c.font='bold 12px Trebuchet MS';c.textAlign='center';c.fillText(label,x,y-7);c.textAlign='left';
}
function fieldEdgeDetail(f,i,t){
 // Details live outside the drivable furrows, leaving the work area clear.
 for(let k=0;k<12;k++){
  const x=f.x+14+k*(f.w-28)/11;
  const y=f.y-14+(k%3)*2;
  if(k%3===0)farmFlower(x,y,i===1?'#f8d0e0':'#fff0a1');
  else {ellipse(x,y,4,3,'#589f4e');ellipse(x+4,y-3,3,4,'#72b45b')}
  const by=f.y+f.h+13+(k%2)*2;
  ellipse(x,by,5,3,'#568f45');ellipse(x+2,by-4,3,5,'#6daf52');
 }
 if(i===1){
  for(const [dx,dy] of [[-38,12],[f.w+38,48]]){
   const x=f.x+dx,y=f.y+dy;ellipse(x+8,y+24,26,10,'#4e7c3b55');box(x-4,y,8,31,'#8d5a32');
   ellipse(x,y-10,28,23,'#438c43');ellipse(x-8,y-19,17,16,'#6eb75a');
   for(const a of [[-11,-12],[10,-5],[2,-22]])ellipse(x+a[0],y+a[1],4,4,'#d95237');
  }
 }
 if(i===2){for(const [dx,dy] of [[-25,40],[f.w+27,85],[55,-29]]){
  const x=f.x+dx,y=f.y+dy;ellipse(x+3,y+5,15,5,'#6d7c5b55');
  poly([[x-14,y+3],[x-8,y-9],[x+6,y-12],[x+14,y-1],[x+9,y+5]],'#a5a49a','#777d73',1);
 }}
 if(i===0){for(let k=0;k<4;k++){const x=f.x+20+k*70;ellipse(x,f.y+f.h+29,5,3,'#b79d70')}}
}
function fieldSoilDetail(f,i){
 // Seed-bed texture, small clods and fine furrows; no changes to collision or coverage.
 for(let k=0;k<90;k++){
  const x=f.x+9+(k*71+i*19)%(f.w-18),y=f.y+9+(k*37+i*13)%(f.h-18);
  ellipse(x,y,1.5+(k%4),1+(k%2),k%3===0?'#8e663e':k%3===1?'#d3ab76':'#ad7f4e');
 }
 for(let row=0;row<2;row++){
  const y=f.y+42+row*64;
  for(let k=0;k<16;k++){
   const x=f.x+17+k*(f.w-34)/16;
   c.strokeStyle='#b18a5b';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y-11);c.lineTo(x+7,y-8);c.stroke();
  }
 }
}
function plowLandscape(t){
 box(0,0,W,H,'#9ecf76');
 for(let i=0;i<210;i++){const x=(i*157+49)%W,y=(i*103+23)%H;ellipse(x,y,2.5,1.6,i%3?'#8bc365':'#c4df8d')}
 // Paths link the open parking apron and the three fields.
 c.lineCap='round';c.lineJoin='round';c.strokeStyle='#b48c5b';c.lineWidth=68;
 c.beginPath();c.moveTo(70,540);c.bezierCurveTo(280,435,275,310,510,270);c.bezierCurveTo(740,230,760,230,1040,220);c.stroke();
 c.strokeStyle='#efcf9a';c.lineWidth=58;c.stroke();
 c.beginPath();c.moveTo(315,540);c.bezierCurveTo(380,425,720,430,910,475);c.strokeStyle='#b48c5b';c.lineWidth=54;c.stroke();
 c.strokeStyle='#efcf9a';c.lineWidth=46;c.stroke();
 // Parked implement rests in a clear gravel area.
 ellipse(260,541,146,77,'#d5b780');ellipse(260,541,132,66,'#dfc694');
 for(let i=0;i<14;i++){const x=115+(i*47)%280,y=498+(i*23)%86;ellipse(x,y,3,2,'#f3dfb9')}
 // Landscape dressing around each field; working rows stay unobstructed.
 for(const [i,f] of PLOW_FIELDS.entries()){
  fieldEdgeDetail(f,i,t);
  fieldMarker(f.x+65,f.y-35,['PRACTICE','LONG ROWS','ROCKY FIELD'][i]);
 }
 // Low, scattered roadside plants and flowers away from field interiors.
 for(let k=0;k<36;k++){
  const x=35+(k*179)%1125,y=28+(k*113)%610;
  if(PLOW_FIELDS.some(f=>x>f.x-25&&x<f.x+f.w+25&&y>f.y-32&&y<f.y+f.h+35))continue;
  if(Math.hypot(x-260,y-541)<150)continue;
  if(k%3===0)farmFlower(x,y,k%2?'#ffffff':'#ffdf79');
  else {ellipse(x,y,5,3,'#7fbf61');ellipse(x+3,y-3,3,4,'#66ad52')}
 }
 // A few pieces of parked equipment beside the gravel, outside the hitch zone.
 box(92,566,24,22,'#996f44');box(95,561,18,6,'#bd925b');
 ellipse(106,589,16,5,'#6d8850aa');
 for(let k=0;k<3;k++){box(112+k*15,604,12,21,'#c7a45e');box(112+k*15,601,12,4,'#ead184')}
 // Distant landscape details stay clear of the driving lanes.
 for(const p of [[80,95],[1150,92],[1145,620]]){
  ellipse(p[0]+7,p[1]+20,35,14,'#69934d');box(p[0]-5,p[1]-3,10,33,'#93623b');
  ellipse(p[0],p[1]-20,36,31,'#4b9a47');ellipse(p[0]-12,p[1]-32,23,21,'#68b75a');
 }
}
function missionScenery(t){
 if(level===2)return;
 if(isPlowMission()){
  // A simple equipment parking area: no shed and no hay wagon.
  c.strokeStyle='#ffe6a3';c.lineWidth=4;c.setLineDash([9,7]);
  c.strokeRect(PLOW_PARK.x-42,PLOW_PARK.y-42,85,84);c.setLineDash([]);
  c.fillStyle='#315b35';c.font='bold 15px Trebuchet MS';c.fillText('PLOW PARKING',202,476);
  if(!plowAttached){drawPlow(PLOW_HITCH.x,PLOW_HITCH.y,0)}
  for(let i=0;i<3;i++){
   const f=PLOW_FIELDS[i];
   // Separate textured fields with rounded earth margins and field markers.
   box(f.x-10,f.y-11,f.w+20,f.h+22,'#668e46');
   box(f.x-4,f.y-5,f.w+8,f.h+10,'#8f643a');
   box(f.x,f.y,f.w,f.h,'#b48b58');
   fieldSoilDetail(f,i);
   for(let p=0;p<16;p++){
    const xx=f.x+11+(p*43+i*17)%(f.w-22), yy=f.y+7+(p*29+i*11)%(f.h-14);
    ellipse(xx,yy,2+(p%3),1.5,p%2?'#9c7042':'#d4ac73');
   }

   for(let j=0;j<2;j++){
    const y=f.y+42+j*64;
    box(f.x+9,y-12,f.w-18,25,'#d8b47f');
    c.strokeStyle='#c19a67';c.lineWidth=2;
    for(let q=-6;q<=6;q+=6){c.beginPath();c.moveTo(f.x+10,y+q);c.lineTo(f.x+f.w-10,y+q);c.stroke()}
    for(let k=0;k<9;k++)if(furrowCoverage[i][j].has(k)){
     box(f.x+12+k*((f.w-24)/9),y-11,(f.w-24)/9,22,'#76502f');
     c.strokeStyle='#53351d';c.lineWidth=2;
     for(let q=-7;q<=7;q+=7){c.beginPath();c.moveTo(f.x+12+k*((f.w-24)/9),y+q);c.lineTo(f.x+12+(k+1)*((f.w-24)/9),y+q);c.stroke()}
    }
   }
   // A few weeds and stones beside the workable rows, not blocking the tractor.
   for(let p=0;p<5;p++){
    const xx=f.x+18+p*(f.w-35)/4;
    ellipse(xx,f.y+8,3,2,p%2?'#d9d2bd':'#7f9e4b');
    ellipse(xx+7,f.y+f.h-7,2.5,2,'#d6c3a1');
   }
  }
  if(stage===1||stage===2||stage===4||stage===5){
   const walkingOut=stage===1||stage===2;
   const progress=stage===1?Math.min(1,plowTimer/2.4):stage===2?1:stage===4?Math.min(1,plowTimer/2):1;
   const fx=PLOW_PARK.x+(PLOW_HITCH.x-PLOW_PARK.x)*progress;
   const fy=PLOW_PARK.y+(PLOW_HITCH.y-PLOW_PARK.y)*progress;
   drawFarmer(fx,fy,t,walkingOut&&plowTimer<2.4,stage===2||stage===5);
  }
  if(stage===1&&hitchReady&&!plowClickPending){
   c.strokeStyle='#ffea50';c.lineWidth=5;c.beginPath();c.arc(PLOW_HITCH.x,PLOW_HITCH.y,36+5*Math.sin(t/220),0,Math.PI*2);c.stroke();
   c.fillStyle='#fff8dc';c.font='bold 15px Trebuchet MS';c.fillText('CLICK HITCH',PLOW_HITCH.x-51,PLOW_HITCH.y-51);
  }
  if(plowAttached){const px=tractor.x-Math.cos(tractor.angle)*83,py=tractor.y-Math.sin(tractor.angle)*83;drawPlow(px,py,tractor.angle+Math.sin(tractor.steer)*.10)}
 }else if(level>1){for(const item of cargo){if(!item.done)bale(item.x,item.y,.95)}}
}
function finishLevel(){phase='complete';target=null;welcome.hidden=false;document.getElementById('welcomeTitle').textContent=level===5?'Master Farm Operator!':'Great farm work!';document.getElementById('welcomeText').textContent=level===5?'You finished every farm job!':'Job complete! Ready for the next farm adventure?';document.getElementById('start').textContent=nextTractorLevel(level)?'Next level →':'Choose a level';tractorLevelPicker()}
function missionUpdate(){
 if(level===2)return journeyUpdate();
 if(level===1)return false;
 if(isPlowMission()){
  if(stage===0){
   if(Math.hypot(tractor.x-PLOW_PARK.x,tractor.y-PLOW_PARK.y)<65){stage=1;plowTimer=0;hitchReady=false;plowClickPending=false;tractor.speed=0;target=null;announce('Parked! The farmer is climbing down to connect the plow.')}return true;
  }
  if(stage===1){
   plowTimer+=1/60;farmerWalk=Math.min(1,plowTimer/2.4);tractor.speed=0;
   if(farmerWalk>=1&&!hitchReady){hitchReady=true;announce('Click the glowing hitch to connect the plow!')}
   if(plowClickPending){stage=2;plowTimer=0;hitchReady=false;announce('Connecting the plow! Watch the farmer work.')}return true;
  }
  if(stage===2){
   plowTimer+=1/60;tractor.speed=0;
   if(plowTimer>2.1){plowAttached=true;stage=3;announce('Plow attached! Drive along both rows in each field.');target=plowPoint(0,0)}return true;
  }
  if(stage===3){
   if(plowAttached&&tractor.speed>12){for(let i=0;i<3;i++)for(let j=0;j<2;j++){
    const f=PLOW_FIELDS[i],y=f.y+42+j*64;
    if(tractor.x>=f.x+12&&tractor.x<=f.x+f.w-5&&Math.abs(tractor.y-y)<21){
     const cell=Math.max(0,Math.min(8,Math.floor((tractor.x-f.x-12)/((f.w-24)/9))));furrowCoverage[i][j].add(cell);
    }
   }}
   for(let i=0;i<3;i++)plowRows[i]=furrowCoverage[i].every(row=>row.size>=9);
   const done=furrowCoverage.flat().filter(row=>row.size>=9).length;score.textContent=done+' / 6 rows';
   if(!nextFurrow()){stage=4;announce('All three fields are ready! Return the plow to its parking area.');target={...PLOW_PARK}}return true;
  }
  if(stage===4){
   if(Math.hypot(tractor.x-PLOW_PARK.x,tractor.y-PLOW_PARK.y)<70){stage=5;plowTimer=0;tractor.speed=0;target=null;announce('The farmer is disconnecting the plow.')}return true;
  }
  if(stage===5){plowTimer+=1/60;tractor.speed=0;if(plowTimer>2.7){plowAttached=false;stage=6;
   if(level===5){cargo=[{x:600,y:180},{x:825,y:255},{x:960,y:490}];tractor.load=0;delivered=0;announce('Fields ready! Now haul supplies to the barn.');target=cargo[0]}else finishLevel()}
   return true;
  }
  return true;
 }
 if(!cargo.length)cargo=level===4?[{x:590,y:175},{x:830,y:255},{x:955,y:490}]:[{x:610,y:180},{x:825,y:255},{x:960,y:490}];
 if(!tractor.load){const item=cargo.find(i=>!i.done&&Math.hypot(i.x-tractor.x,i.y-tractor.y)<75);if(item){item.done=true;tractor.load=1;announce('Cargo loaded! Drive to the animal barn.');target={...BARN_DROP}}}
 else if(wagonInsideUnload()){tractor.load=0;delivered++;score.textContent=delivered+' / 3';if(delivered===3)finishLevel();else{announce('Delivered! Find the next load.');target=cargo.find(i=>!i.done)}}
 return true;
}
function vehicle(t){
 const speed=tractor.speed, moving=speed>8;
 const hitchX=tractor.x-Math.cos(tractor.angle)*49,hitchY=tractor.y-Math.sin(tractor.angle)*49;
 const wagonX=hitchX-Math.cos(tractor.wagonAngle)*58,wagonY=hitchY-Math.sin(tractor.wagonAngle)*58;
 // articulated hitch and separate wagon rotate independently
 if(!isPlowMission()){
 c.strokeStyle='#4b4e47';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(hitchX,hitchY);c.lineTo(wagonX+Math.cos(tractor.wagonAngle)*35,wagonY+Math.sin(tractor.wagonAngle)*35);c.stroke();
 c.save();c.translate(wagonX,wagonY);c.rotate(tractor.wagonAngle);
 ellipse(5,8,59,37,'#426a2d66');
 for(const x of [-33,29])for(const y of [-36,36]){ellipse(x,y,15,12,'#222c2b');ellipse(x,y,6,6,'#d2a451')}
 poly([[-49,-30],[45,-30],[45,30],[-49,30]],'#985825','#58371e',5);
 poly([[-41,-23],[37,-23],[37,23],[-41,23]],'#c88a43','#e8b467',3);
 for(let x=-35;x<38;x+=16)box(x,-21,3,42,'#a56c31');
 if(tractor.load){bale(-19,-8,.66);bale(19,-8,.66)}
 c.restore();
 }
 c.save();c.translate(tractor.x,tractor.y);c.rotate(tractor.angle);
 const bounce=moving?Math.sin(t/90)*1.1:0;c.translate(0,bounce);
 ellipse(-2,10,67,43,'#385e2b66');
 // Rear large tires, smaller steerable front tires: overhead geometry
 for(const y of [-39,39]){
  c.save();c.translate(-31,y);c.fillStyle='#242b2b';c.beginPath();c.roundRect(-23,-14,43,28,7);c.fill();
  for(let s=-1;s<=1;s++)box(-14+s*12,-13,5,26,'#414a48');c.restore();
 }
 for(const y of [-32,32]){
  c.save();c.translate(46,y);c.rotate(tractor.steer*.48);c.fillStyle='#252b2c';c.beginPath();c.roundRect(-14,-10,29,20,5);c.fill();c.restore();
 }
 // red chassis and tall engine hood, front pointing right
 poly([[-46,-25],[53,-23],[69,-15],[69,15],[53,23],[-46,25]],'#b82e23','#7d211d',4);
 poly([[5,-21],[53,-19],[65,-12],[65,12],[53,19],[5,21]],'#ed4730','#b22c22',3);
 poly([[10,-14],[53,-13],[58,-7],[10,-7]],'#ff7650');
 for(let x=18;x<52;x+=9){box(x,8,4,7,'#85352a')}
 box(64,-13,7,26,'#3a4142');box(69,-10,4,20,'#f7e7a5');
 // glass roof with visible driver and steering wheel
 poly([[-48,-29],[2,-29],[11,29],[-48,29]],'#c53b2a','#762d26',4);
 poly([[-39,-22],[-4,-22],[3,22],[-39,22]],'#8fd2df','#f5e4b3',3);
 if(level!==2||journey.scene!==0||journey.step==='ready'){ellipse(-22,2,16,16,'#eec28d');ellipse(-25,-1,14,9,'#b97b37');}
 c.strokeStyle='#354044';c.lineWidth=4;c.beginPath();c.arc(-1,0,11,0,Math.PI*2);c.stroke();
 c.strokeStyle='#ffffff99';c.lineWidth=3;c.beginPath();c.moveTo(-36,-17);c.lineTo(-29,-17);c.stroke();
 // exhaust stack and gentle puff
 ellipse(22,-12,6,6,'#303638');ellipse(22,-12,3,3,'#9fa6a1');
 if(moving){ellipse(-51,0,3+Math.sin(t/90)*1.5,3,'#fff6cfaa')}
 c.restore();
 for(const p of tractor.dust){ellipse(p.x,p.y,p.r,p.r*.7,'#d5bb7a66')}
}
function draw(t){if(level===2){c.clearRect(0,0,W,H);RunawayWagon.draw(c,W,H,t/1000);return;}c.clearRect(0,0,W,H);scenery(t);
 for(let i=0;i<(level===1?hay.length:0);i++){
  const h=hay[i],next=!tractor.load&&i===0;
  if(next){const pulse=(Math.sin(t/210)+1)/2;
   ellipse(h.x,h.y+10,59+pulse*9,45+pulse*8,'#fff4a455');
   c.strokeStyle='#ffed59';c.lineWidth=6+pulse*3;c.beginPath();c.arc(h.x,h.y,45+pulse*8,0,Math.PI*2);c.stroke();
   for(let k=0;k<7;k++){const a=k*Math.PI*2/7+t/1100;ellipse(h.x+Math.cos(a)*58,h.y+Math.sin(a)*46,3+pulse*2,3+pulse*2,'#fffde6')}
  }
  bale(h.x,h.y,1.1)
 }
 missionScenery(t);vehicle(t);if(level===2)journeyForeground(t);
 // Canopies render above the vehicle while trunks remain solid obstacles.
 // Only the overhanging foliage is foreground; the tractor cannot pass through trunks.
 for(const [treeIndex,tr] of TREES.entries()){
   if(isPlowMission())continue;
   if(Math.hypot(tractor.x-tr.x,tractor.y-(tr.y-24))<tr.r+94 || Math.hypot(wagonPosition().x-tr.x,wagonPosition().y-(tr.y-24))<tr.r+70){
     c.save();c.globalAlpha=.94;
     ellipse(tr.x-17,tr.y-26,tr.r*.77,tr.r*.66,'#3c8b44');
     ellipse(tr.x+15,tr.y-33,tr.r*.79,tr.r*.75,'#458f44');
     ellipse(tr.x,tr.y-51,tr.r*.91,tr.r*.79,'#60aa51');
     ellipse(tr.x-12,tr.y-59,tr.r*.38,tr.r*.31,'#78bc61');
     c.restore();
   }
 }
 if(!isPlowMission())barnRoof(t)}
function wagonInsideUnload(){
 const w=wagonPosition();
 return w.x>190&&w.x<275&&w.y>284&&w.y<363 &&
        tractor.x>150&&tractor.x<320&&tractor.y>165&&tractor.y<350;
}
function update(dt,t){if(phase!=='playing'||!active||blocked())return;if(level===2){RunawayWagon.update(dt);if(RunawayWagon.S.mode==='saved'&&RunawayWagon.S.finish>3){finishLevel();}return;}updateCow(dt,t);
 // Never teleport or reverse during ordinary driving. The Get Unstuck control is manual.
 const dest=target;if(dest){const dx=dest.x-tractor.x,dy=dest.y-tractor.y,d=Math.hypot(dx,dy);if(d>10){const want=Math.atan2(dy,dx);let delta=Math.atan2(Math.sin(want-tractor.angle),Math.cos(want-tractor.angle));tractor.steer=Math.max(-.8,Math.min(.8,delta));const proposedAngle=tractor.angle+Math.max(-dt*2.2,Math.min(dt*2.2,delta));const proposedWagon=tractor.wagonAngle+Math.atan2(Math.sin(proposedAngle-tractor.wagonAngle),Math.cos(proposedAngle-tractor.wagonAngle))*Math.min(1,dt*2.0);steerClearance(proposedAngle,proposedWagon);tractor.speed=Math.abs(delta)>1.0?0:Math.min(isPlowMission()?115:160,tractor.speed+dt*115);const nextWagon=tractor.wagonAngle;
 const nx=Math.max(60,Math.min(W-60,tractor.x+Math.cos(tractor.angle)*tractor.speed*dt));
 const ny=Math.max(60,Math.min(H-60,tractor.y+Math.sin(tractor.angle)*tractor.speed*dt));
 if(tractor.speed<1||moveSafely(nx,ny,nextWagon)){
  collisionWait=0;
 }else{
  if(isPlowMission()){
   // Never auto-reverse or rewind a tractor carrying a plow.
   // Stop at the obstacle and let the child steer into a clear direction.
   tractor.speed=0;
   collisionWait=0;
   if(t-collisionHelpCooldown>5500){
    announce('Turn toward an open path to continue plowing!');
    collisionHelpCooldown=t;
   }
  }else{
   // No automatic backing or rewind. Keep the vehicle stationary on contact;
   // the pointer can still steer it toward an open route.
   tractor.speed=0;
   collisionWait=0;
   if(t-collisionHelpCooldown>5500){
    announce('Turn toward an open path to continue driving!');
    collisionHelpCooldown=t;
   }
  }
 }
 tractor.wheelSpin+=tractor.speed*dt/17;
 if(tractor.speed>8&&Math.random()<dt*13)tractor.dust.push({x:tractor.x-Math.cos(tractor.angle)*64+(Math.random()-.5)*18,y:tractor.y-Math.sin(tractor.angle)*64+(Math.random()-.5)*18,r:4,life:.7});
 }else {collisionWait=0;tractor.speed=Math.max(0,tractor.speed-dt*240);tractor.steer*=.85;}
 tractor.dust=tractor.dust.filter(p=>(p.life-=dt)>0);for(const p of tractor.dust)p.r+=dt*17;
 }if(missionUpdate())return;if(!tractor.load){const idx=hay.findIndex(h=>Math.hypot(h.x-tractor.x,h.y-tractor.y)<86);if(idx>=0){hay.splice(idx,1);tractor.load=1;announce('Hay loaded! Drive through the barn doors to the glowing unloading spot!');target={...BARN_DROP}}}else if(wagonInsideUnload()){tractor.load=0;delivered++;score.textContent=delivered+' / 3';if(delivered===3){finishLevel();document.getElementById('welcomeText').textContent='You delivered all three hay bales. The animals are fed!'+(nextTractorLevel(level)?' Ready for the next farm adventure?':' Ask your teacher to enable the next level to continue.')}else{announce('Hay delivered inside the barn! Find the next bale!');target=hay[0]}}}
function frame(t){const dt=Math.min(.035,(t-last)/1000||0);last=t;update(dt,t);draw(t);requestAnimationFrame(frame)}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
let pointerMoves=0;canvas.addEventListener('pointermove',e=>{if(phase==='playing'&&++pointerMoves>5)document.getElementById('trackpadCoach')?.classList.add('used');if(level===2){RunawayWagon.move(point(e));return;}if(phase==='playing'&&e.buttons===0&&!blocked()&&!(isPlowMission()&&(stage===1||stage===2||stage===5)))target=point(e)});canvas.addEventListener('pointerdown',e=>{if(phase==='playing'&&!blocked()){if(level===2){RunawayWagon.click(point(e));return;}if(stage===1&&hitchReady){hitchClick(e);return}target=point(e)}});
document.getElementById('start').addEventListener('click',()=>{if(phase==='complete'){level=['The sun went down!','The blue farmer wins!'].includes(document.getElementById('welcomeTitle').textContent)?2:(nextTractorLevel(level)||firstTractorLevel());setupLevel();}phase='playing';welcome.hidden=true;if(level===2)RunawayWagon.start();pointerMoves=0;document.getElementById('trackpadCoach')?.classList.remove('used');target=null;announce(level===1?'Drive toward the sparkling golden hay bale!':level===2?'The hay wagon is rolling away! Chase it!' :'Drive to your next farm job!')});document.getElementById('reset').addEventListener('click',reset);document.getElementById('unstuck').addEventListener('click',recoverTractor);function showCoach(){document.getElementById('trackpadCoach')?.classList.remove('used');pointerMoves=0;}document.getElementById('coachReplay').addEventListener('click',showCoach);document.getElementById('hint').addEventListener('click',()=>{document.getElementById('trackpadCoach')?.classList.remove('used');pointerMoves=0;if(phase==='playing'){target=level===1?(tractor.load?BARN_DROP:hay[0]):level===2?(null):target;announce(level===2?'Steer around obstacles, catch lightning, then click the glowing wagon hitch!':tractor.load?'Take the hay to the animal barn!':'Look for the sparkling golden hay bale!')}});document.getElementById('sound').addEventListener('click',e=>{sound=!sound;e.currentTarget.textContent=sound?'🔊 Voice on':'🔇 Voice off';if(!sound&&speechSynthesis)speechSynthesis.cancel()});window.addEventListener('blur',()=>{active=false;if(window.speechSynthesis)speechSynthesis.cancel()});window.addEventListener('focus',()=>active=true);document.addEventListener('visibilitychange',()=>{if(document.hidden&&window.speechSynthesis)speechSynthesis.cancel()});
// FIELD FIXER JOURNEY: a separate four-scene Level 2, without changing other levels.
const J_ROWS=[3],J_NAMES=['Equipment Yard','Sunset Plow Race'];
const SUNSET_SECONDS=240;
let sunset={remaining:SUNSET_SECONDS,last:0,boost:null,boostTime:0,boostUntil:0,particles:[],events:0};
function sunsetReset(){sunset={remaining:SUNSET_SECONDS,last:performance.now(),boost:null,boostTime:0,boostUntil:0,particles:[],events:0};}
function sunsetObstacle(type,row){const x=215+Math.floor(Math.random()*4)*70,y=sceneRowY(row);return {type,x,y,row,done:false,step:'drive',farmer:{x:0,y:0},goal:null,lever:{x:1055,y:558},carrot:{x:1085,y:552},progress:0,rockRoll:0,rockTilt:0,impact:0,rabbitHop:0,rabbitStartX:x,rabbitStartY:y,mudClicks:0};}
function sunsetNextObstacle(){const j=journey;const next=j.obstacles.find(o=>!o.done);j.obstacle=next||null;}
function sunsetFinish(){phase='complete';target=null;tractor.speed=0;welcome.hidden=false;document.getElementById('welcomeTitle').textContent='The sun went down!';document.getElementById('welcomeText').textContent='The tractor headlights are on. Try the sunset race again!';document.getElementById('start').textContent='Try again!';tractorLevelPicker();}

const J_FIELD={x:66,y:142,w:480,h:402};
const RIVAL_FIELD={x:655,y:142,w:480,h:402};
let rival={progress:0,delay:0,last:0,finished:false};
function rivalReset(){rival={progress:0,delay:0,last:performance.now(),finished:false};}
function rivalLose(){phase='complete';target=null;tractor.speed=0;welcome.hidden=false;document.getElementById('welcomeTitle').textContent='The blue farmer wins!';document.getElementById('welcomeText').textContent='Great effort! Race again and try to finish your field first!';document.getElementById('start').textContent='Race again!';tractorLevelPicker();}
let journey={scene:0,step:'walkToPlow',farmer:{x:225,y:445},selected:false,dragging:false,carrying:false,goal:null,coverage:[],row:0,exit:false,travel:0,obstacle:null};
function journeyReset(){journey={scene:0,step:'walkToPlow',farmer:{x:225,y:445},selected:false,dragging:false,carrying:false,goal:null,coverage:[],row:0,exit:false,travel:0,obstacle:null,obstacles:[]};sunsetReset();}
function journeyStartScene(scene){
 const j=journey;j.scene=scene;j.exit=false;j.row=0;j.coverage=Array.from({length:scene===1?3:0},()=>new Set());j.obstacles=scene===1?[sunsetObstacle('rock',0),sunsetObstacle('rabbit',1),sunsetObstacle('mud',2)]:[];
 j.obstacle=j.obstacles[0]||null;tractor.x=95;tractor.y=575;tractor.angle=-.55;tractor.wagonAngle=tractor.angle;tractor.speed=0;target=null;safeDriveHistory.length=0;
 if(scene===1){sunsetReset();rivalReset();score.textContent='0 / 3 rows';announce('The Great Plow Race! Finish your field before the blue farmer!');}
 else{score.textContent='Get the plow';announce('Get the plow ready!')}
}

function sceneRowY(r){return J_FIELD.y+38+r*(J_FIELD.h-76)/2}
function jFarmerNear(p,r=47){return Math.hypot(journey.farmer.x-p.x,journey.farmer.y-p.y)<r}
function journeyHitch(){return {x:tractor.x-Math.cos(tractor.angle)*75,y:tractor.y-Math.sin(tractor.angle)*75}}
function journeyCab(){return {x:tractor.x-10,y:tractor.y-48}}
function journeyClick(e){if(level!==2||phase!=='playing')return false;
 if(journey.scene>0&&journey.scene<3&&journey.obstacle&&!journey.obstacle.done)return obstacleClick(point(e));
 if(journey.scene!==0)return false;
 const p=point(e),j=journey;
 if(j.step==='walkToPlow'&&Math.hypot(p.x-360,p.y-350)<58&&jFarmerNear({x:360,y:350},75)){
  j.step='carry';j.carrying=true;j.goal=null;announce('Great! Guide the farmer and plow back to the tractor.');return true;
 }
 if(j.step==='carry'&&Math.hypot(p.x-journeyHitch().x,p.y-journeyHitch().y)<58&&jFarmerNear(journeyHitch(),76)){
  j.step='connecting';j.travel=0;j.goal=null;announce('Click! The farmer is attaching the plow.');return true;
 }
 if(j.step==='return'&&Math.hypot(p.x-journeyCab().x,p.y-journeyCab().y)<62&&jFarmerNear(journeyCab(),78)){
  j.step='boarding';j.travel=0;j.goal=null;announce('The farmer is climbing into the tractor!');return true;
 }
 if(j.step==='ready')return false;
 return true;
}
function journeyMove(e){if(level!==2||phase!=='playing')return false;
 if(journey.scene>0&&journey.scene<3&&journey.obstacle&&!journey.obstacle.done&&journey.obstacle.step!=='drive'){journey.obstacle.goal=point(e);return true;}
 if(journey.scene!==0)return false;
 if(['walkToPlow','carry','return'].includes(journey.step)){journey.goal=point(e);return true;}
 if(['connecting','boarding'].includes(journey.step))return true;
 return false;
}
function obstacleClick(p){const o=journey.obstacle;if(!o||o.step==='drive')return false;
 const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r;
 if(o.step==='exit'&&near(p,{x:tractor.x-18,y:tractor.y-65},75)){o.step=o.type==='mud'?'mud':'tool';announce(o.type==='rock'?'Walk to the wooden lever and click it!':o.type==='rabbit'?'Walk to the carrot basket and click a carrot!':'Click the two wheels back and forth to escape the mud!');return true;}
 if(o.step==='mud'){const left={x:tractor.x-30,y:tractor.y-38},right={x:tractor.x-30,y:tractor.y+38};const side=near(p,left,47)?0:near(p,right,47)?1:-1;if(side>=0&&side!==o.lastSide){o.lastSide=side;o.mudClicks++;o.impact=1;if(o.mudClicks>=6){o.step='return';announce('The tractor is free! Climb back in!')}}return true;}
 const tool=o.type==='rock'?o.lever:o.carrot;
 if(o.step==='tool'&&near(p,tool,65)&&near(o.farmer,tool,85)){o.step='carry';announce(o.type==='rock'?'Bring the lever to the boulder!':'Carry the carrot to the rabbit!');return true;}
 if(o.step==='carry'&&near(p,o,75)&&near(o.farmer,o,90)){o.step=o.type==='rock'?'push':'place';o.progress=0;o.rockTilt=0;o.rabbitStartX=o.x;o.rabbitStartY=o.y;announce(o.type==='rock'?'Click the boulder to rock it loose!':'Set down the carrot and watch the rabbit hop to safety!');return true;}
 if(o.step==='push'&&near(p,o,85)){o.progress=Math.min(3,(o.progress||0)+1);o.rockTilt=1;o.impact=1;if(o.progress>=3){o.step='rolling';o.rockRoll=0;announce('The boulder is rolling away!')}return true;}
 if(o.step==='return'&&near(p,{x:tractor.x-18,y:tractor.y-65},78)&&near(o.farmer,{x:tractor.x-18,y:tractor.y-65},95)){o.done=true;o.step='done';target=null;sunsetNextObstacle();announce('All aboard! Keep plowing before sunset!');return true;}
 return true;
}
function journeyUpdate(){const j=journey;
 if(j.scene===1){
  const now=performance.now(),dt=Math.min(.06,Math.max(0,(now-sunset.last)/1000));sunset.last=now;
  const paused=j.obstacle&&!j.obstacle.done&&j.obstacle.step!=='drive';
  if(!paused){sunset.boostTime+=dt;
   if(!sunset.boost&&sunset.boostTime>11){const row=Math.floor(Math.random()*3);sunset.boost={x:140+Math.random()*340,y:sceneRowY(row),life:8};sunset.boostTime=0;}
   if(sunset.boost){sunset.boost.life-=dt;if(Math.hypot(tractor.x-sunset.boost.x,tractor.y-sunset.boost.y)<65){sunset.boost=null;sunset.boostUntil=now+5000;announce('Lightning boost! Zoom!')}else if(sunset.boost.life<=0)sunset.boost=null;}
   if(now<sunset.boostUntil&&target&&tractor.speed>0){tractor.speed=Math.min(190,tractor.speed+dt*95);}
  }
  // Rival keeps moving while the student solves obstacles, with occasional pauses.
  if(phase==='playing'&&!j.exit){rival.delay-=dt;if(rival.delay<=0&&Math.random()<dt*.13)rival.delay=2+Math.random()*3;
   if(rival.delay<=0)rival.progress=Math.min(1,rival.progress+dt/170);
   if(rival.progress>=1&&!rival.finished){rival.finished=true;rivalLose();return true;}}
 }

 if(j.scene===0&&j.goal&&['walkToPlow','carry','return'].includes(j.step)){
  const dx=j.goal.x-j.farmer.x,dy=j.goal.y-j.farmer.y,d=Math.hypot(dx,dy);
  if(d>3){const step=Math.min(3.7,d);j.farmer.x+=dx/d*step;j.farmer.y+=dy/d*step;}
 }
 if(j.scene===0){
  if(j.step!=='ready')tractor.speed=0;
  if(j.step==='connecting'){j.travel+=1/60;if(j.travel>1.25){plowAttached=true;j.carrying=false;j.step='return';j.farmer.x=tractor.x+15;j.farmer.y=tractor.y-102;j.goal=null;announce('Plow attached! Walk to the tractor cab and click to climb in.');}}
  if(j.step==='boarding'){j.travel+=1/60;if(j.travel>1){j.step='ready';j.exit=true;j.goal=null;score.textContent='Plow attached';announce('All aboard! Drive to the glowing road arrow for Field 1.');}}
 }else{
  const o=j.obstacle;
  if(o&&!o.done){
   if(o.step==='drive'&&Math.hypot(tractor.x-o.x,tractor.y-o.y)<125){o.step='exit';o.farmer={x:tractor.x+50,y:tractor.y-95};tractor.speed=0;target=null;announce(o.type==='rock'?'CLANG! Boulder ahead! Click the cab to climb out.':o.type==='rabbit'?'A bunny! Stop and help it cross!':'SPLASH! The tractor is stuck in mud! Click the cab!');}
   if(o.step!=='drive'){tractor.speed=0;target=null;
    if(o.goal&&['tool','carry','return'].includes(o.step)){const dx=o.goal.x-o.farmer.x,dy=o.goal.y-o.farmer.y,d=Math.hypot(dx,dy);if(d>3){const v=Math.min(3.7,d);o.farmer.x+=dx/d*v;o.farmer.y+=dy/d*v;}}
    if(o.step==='place'){o.progress=(o.progress||0)+1/60;o.rabbitHop=Math.min(1,o.progress/2.4);if(o.progress>2.7){o.step='return';announce('The rabbit is safe! Walk back to the tractor and click the cab.')}}
    if(o.step==='rolling'){o.rockRoll=(o.rockRoll||0)+1/60;o.x+=Math.min(5,1.5+o.rockRoll*3);o.y+=Math.sin(o.rockRoll*8)*.9;if(o.rockRoll>1.7){o.step='return';announce('Rock cleared! Walk back to the tractor and click the cab.')}}
    o.impact=Math.max(0,(o.impact||0)-.035);o.rockTilt=Math.max(0,(o.rockTilt||0)-.025);
   }
  }
  if(!j.exit&&(!o||o.step==='drive'||o.done)&&tractor.speed>9){const n=J_ROWS[j.scene-1],f=J_FIELD;for(let r=0;r<n;r++){
   const y=f.y+38+r*(f.h-76)/(n-1);
   if(tractor.x>=f.x+18&&tractor.x<=f.x+f.w-18&&Math.abs(tractor.y-y)<23){const cell=Math.max(0,Math.min(15,Math.floor((tractor.x-f.x-18)/(f.w-36)*16)));for(let k=Math.max(0,cell-1);k<=Math.min(15,cell+1);k++)j.coverage[r].add(k)}
  }}
  j.row=j.coverage.filter(x=>x.size>=16).length;
  score.textContent=`${j.row} / ${J_ROWS[j.scene-1]} rows`;
  if(j.row===3&&j.obstacles.every(o=>o.done))rival.finished=true;
  if(j.row===J_ROWS[j.scene-1]&&j.obstacles.every(o=>o.done)&&!j.exit){j.exit=true;announce('Field finished! Follow the glowing arrow to the next farm area.')}
 }
 if(j.exit&&tractor.x>1080&&tractor.y>390&&tractor.y<660){
  if(j.scene<1){journeyStartScene(j.scene+1)}else{j.scene=4;j.step='home';j.exit=false;tractor.x=95;tractor.y=575;tractor.angle=-.55;tractor.wagonAngle=tractor.angle;tractor.speed=0;target=null;announce('All fields plowed! Return the plow to the equipment yard.')}
 }
 if(j.scene===4&&Math.hypot(tractor.x-310,tractor.y-430)<105){plowAttached=false;finishLevel()}
 return true;
}
function journeyLandscape(t){const j=journey;box(0,0,W,H,'#a2cb70');
 for(let k=0;k<220;k++){const x=(k*173+47)%W,y=(k*113+71)%H;ellipse(x,y,2.5,1.7,k%3?'#8fc15f':'#c6df8a')}
 // The road is a real destination and the glowing arrow is only enabled after the field is done.
 c.strokeStyle='#d8b47d';c.lineWidth=84;c.beginPath();c.moveTo(0,594);c.lineTo(1200,594);c.stroke();
 c.strokeStyle='#f3d6a0';c.lineWidth=65;c.stroke();
 if(j.scene===0||j.scene===4){
  box(235,310,220,160,'#9a9e83');box(248,324,194,135,'#c8c3a6');
  for(let k=0;k<12;k++)ellipse(254+(k*41)%181,337+(k*23)%109,3,2,'#8d927d');
  box(270,294,145,15,'#946f4b');box(278,286,9,32,'#795638');box(399,286,9,32,'#795638');
  c.font='bold 21px Trebuchet MS';c.fillStyle='#31522d';c.fillText('PLOW PARKING',255,275);
  for(let k=0;k<5;k++){ellipse(700+k*90,130+Math.sin(k)*23,26,20,'#5a9d4c');ellipse(700+k*90,120+Math.sin(k)*23,20,17,'#75b860')}
 }else{
  const f=J_FIELD,n=J_ROWS[j.scene-1];box(f.x-22,f.y-22,f.w+44,f.h+44,'#71934c');box(f.x-12,f.y-12,f.w+24,f.h+24,'#90633e');box(f.x,f.y,f.w,f.h,j.scene===3?'#b09169':'#b9986c');
  for(let k=0;k<210;k++){const x=f.x+(k*113+37)%f.w,y=f.y+(k*71+17)%f.h;ellipse(x,y,2+(k%3),1.3,k%2?'#a77c51':'#d4b58b')}
  for(let r=0;r<n;r++){
   const y=sceneRowY(r);box(f.x+12,y-15,f.w-24,30,'#d8ba8b');
   for(let k=0;k<16;k++){const x=f.x+18+k*(f.w-36)/16,w=(f.w-36)/16;
    if(j.coverage[r].has(k)){box(x,y-13,w+1,26,'#765032');for(let q=-8;q<=8;q+=8)box(x,y+q,w,2,'#56381f')}
    else{box(x,y-8,w,2,'#c49d6b')}
   }
   if(!j.exit&&j.coverage[r].size<16){const pulse=(Math.sin(t/270+r*.65)+1)/2;c.strokeStyle=`rgba(255,226,91,${.42+pulse*.32})`;c.lineWidth=4;c.strokeRect(f.x+8,y-19,f.w-16,38)}
  }
  if(j.scene===2){
   // Orchard trees are entirely outside the plow field, leaving a generous turning lane.
   const orchardTrees=[{x:115,y:125,r:35},{x:115,y:290,r:34},{x:115,y:465,r:34},
     {x:1082,y:120,r:36},{x:1082,y:300,r:35},{x:1082,y:475,r:35}];
   for(const [i,tr] of orchardTrees.entries()){
    ellipse(tr.x+7,tr.y+19,tr.r*.88,tr.r*.39,'#557b3d66');
    box(tr.x-7,tr.y-2,14,32,'#865632');
    ellipse(tr.x-12,tr.y-20,tr.r*.79,tr.r*.76,'#367d3b');
    ellipse(tr.x+13,tr.y-24,tr.r*.83,tr.r*.82,'#4e9e45');
    ellipse(tr.x,tr.y-36,tr.r*.69,tr.r*.67,'#71b85a');
    for(let a=0;a<5;a++){
     const theta=(a*2.4+i*.7),ax=tr.x+Math.cos(theta)*tr.r*.48,ay=tr.y-23+Math.sin(theta)*tr.r*.4;
     ellipse(ax,ay,5.2,5,'#d7442d');ellipse(ax-1.4,ay-1.6,1.4,1.2,'#ffab76');
    }
   }
   for(let k=0;k<12;k++){
    const x=47+(k*83)%1100,y=k%2?77:555;
    ellipse(x,y,3.5,3.5,'#f7e6a6');ellipse(x+6,y+2,3,3,'#f4b6c7');
   }
   // Small sign at the edge, away from the highlighted rows.
   box(34,22,12,59,'#87623e');box(16,17,163,43,'#ad7747');
   c.strokeStyle='#f2d39b';c.lineWidth=3;c.strokeRect(19,20,157,37);
   c.fillStyle='#fff0c7';c.font='bold 19px Trebuchet MS';c.fillText('APPLE ORCHARD',25,45);
  }
  if(j.scene===1){
   drawRivalField(t);
   for(let k=0;k<13;k++){const x=35+k*89,y=k%2?88:557;
    ellipse(x,y,7,3,'#5a9b43');ellipse(x-5,y-4,4,4,'#fff4ca');ellipse(x+3,y-6,4,4,'#f5d567');
   }
  }
  if(j.scene===2){
   for(let k=0;k<15;k++){const x=53+k*76,y=k%2?83:558;
    ellipse(x+4,y+5,17,8,'#6e694d');ellipse(x,y,15,10,'#98978a');ellipse(x-4,y-4,6,3,'#c4c2b3');
    ellipse(x+25,y+6,8,3,'#659b48');
   }
  }
  for(let k=0;k<8;k++){const x=50+k*151;ellipse(x,40,4,4,'#ffef7b');ellipse(x+5,42,3,3,'#fff9e5')}
  if(j.scene!==2){box(30,16,280,48,'#f8e7b7');c.fillStyle='#3d5733';c.font='bold 23px Trebuchet MS';c.fillText(J_NAMES[j.scene],44,47);}
 }
}
function drawRivalField(t){
 const f=RIVAL_FIELD,n=3;
 box(f.x-16,f.y-16,f.w+32,f.h+32,'#638b47');box(f.x-9,f.y-9,f.w+18,f.h+18,'#8c603e');box(f.x,f.y,f.w,f.h,'#b9976c');
 for(let r=0;r<n;r++){
  const y=f.y+38+r*(f.h-76)/2;
  box(f.x+12,y-17,f.w-24,34,'#d8ba88');
  const fraction=Math.max(0,Math.min(1,rival.progress*3-r));
  for(let k=0;k<16;k++){
   const x=f.x+18+k*(f.w-36)/16,w=(f.w-36)/16;
   if(k/16<fraction){box(x,y-15,w+1,30,'#775033');for(let q=-10;q<=10;q+=7)box(x,y+q,w,2,'#52371f')}
   else box(x,y-9,w,2,'#c49d6b');
  }
 }
 const current=Math.min(2,Math.floor(rival.progress*3));
 const fraction=Math.min(1,rival.progress*3-current);
 const x=f.x+22+fraction*(f.w-44),y=f.y+38+current*(f.h-76)/2;
 c.save();c.translate(x,y);c.rotate(Math.sin(t/380)*.035);
 ellipse(-12,15,48,16,'#694d3355');
 // Detailed miniature blue tractor with plow, wheels, exhaust, and driver.
 for(let i=0;i<4;i++){const wx=i<2?-24:27,wy=i%2?-23:23;ellipse(wx,wy,13,12,'#252d35');ellipse(wx,wy,6,6,'#9ca9ad');}
 box(-39,-17,73,34,'#397fbd');box(-18,-20,29,40,'#c5e9f4');box(-13,-15,19,28,'#8cc8e3');
 ellipse(-4,0,8,8,'#e6ad74');box(18,-12,22,24,'#4d99d2');
 for(let i=0;i<4;i++)box(21+i*4,-9,2,18,'#285a8a');
 box(-60,-4,20,8,'#76634b');for(let i=0;i<3;i++){poly([[-69-i*8,-14],[-63-i*8,13],[-58-i*8,13],[-57-i*8,-14]],'#6e8493');}
 ellipse(32,-20,3,5,'#eeeecc');c.restore();
 for(let i=0;i<4;i++){const dx=x-56-i*13;ellipse(dx,y+17+(i%2)*6,4+Math.sin(t/130+i)*2,3,'#dfc39a88')}
}
function journeyForeground(t){const j=journey;
 if(j.scene===1){
  // Head-to-head scoreboard: the moving blue tractor is the opponent, not a timer.
  c.fillStyle='#fff2cc';c.font='bold 23px Trebuchet MS';c.fillText('RED FARMER',72,35);
  c.fillStyle='#d9f0ff';c.fillText('BLUE FARMER',661,35);
  box(72,51,465,18,'#735537');box(76,55,457*(j.coverage.reduce((a,r)=>a+r.size,0)/48),10,'#e66a42');
  box(661,51,465,18,'#735537');box(665,55,457*rival.progress,10,'#4f9edb');
  c.fillStyle='#fff7dc';c.font='bold 18px Trebuchet MS';c.fillText('PLOW RACE!',514,104);
  if(sunset.boost){const b=sunset.boost,pulse=1+.14*Math.sin(t/120);ellipse(b.x,b.y,32*pulse,32*pulse,'#ffeb7166');c.fillStyle='#fff05c';c.font='bold 55px Trebuchet MS';c.fillText('⚡',b.x-22,b.y+20);}
  if(performance.now()<sunset.boostUntil){for(let i=0;i<5;i++)ellipse(tractor.x-75-i*13,tractor.y+(i%2?15:-15),6,4,'#ffdd62aa')}
 }

 if(j.scene===0||j.scene===4){
  if(j.scene===4||(!plowAttached&&!j.carrying))drawPlow(360,350,0);
  if(j.scene===0&&j.step!=='ready'){
   if(j.carrying){drawPlow(j.farmer.x-37,j.farmer.y+12,0);
    c.strokeStyle='#765a3d';c.lineWidth=4;c.beginPath();c.moveTo(j.farmer.x-12,j.farmer.y+5);c.lineTo(j.farmer.x-5,j.farmer.y+12);c.stroke();}
   drawFarmer(j.farmer.x,j.farmer.y,t,['walkToPlow','carry','return'].includes(j.step),j.step==='connecting'||j.step==='boarding');
   let cue=null;
   if(j.step==='walkToPlow'&&jFarmerNear({x:360,y:350},75))cue={x:360,y:350};
   if(j.step==='carry'&&jFarmerNear(journeyHitch(),76))cue=journeyHitch();
   if(j.step==='return')cue=journeyCab();
   if(cue){if(j.step==='return'){ellipse(cue.x,cue.y,52,48,'#fff4a455');c.fillStyle='#fff8d9';c.font='bold 17px Trebuchet MS';c.fillText('CLIMB IN',cue.x-43,cue.y-57);}c.strokeStyle='#ffe653';c.lineWidth=5;c.setLineDash([10,7]);c.beginPath();c.arc(cue.x,cue.y,36+4*Math.sin(t/240),0,Math.PI*2);c.stroke();c.setLineDash([]);}
  }
 }
 if(j.scene>0&&j.scene<3&&j.obstacle){const o=j.obstacle;
  if(!o.done){if(o.type==='mud'){ellipse(o.x,o.y,65,36,'#6b4b32');ellipse(o.x-20,o.y+5,22,10,'#9a7044');ellipse(o.x+25,o.y-6,18,8,'#a67b4b');for(let k=0;k<5;k++)ellipse(o.x-45+k*23,o.y+Math.sin(t/170+k)*8,5,3,'#c39a69');}else if(o.type==='rock'){
   const wobble=(o.rockTilt||0)*Math.sin(t/52)*.25,rolling=o.step==='rolling';
   c.save();c.translate(o.x,o.y);c.rotate(wobble+(rolling?(o.rockRoll||0)*4:0));
   ellipse(5,13,40,13,'#735d43');ellipse(0,0,35,29,'#777d7c');ellipse(-12,-12,15,9,'#afb8b3');ellipse(12,8,10,6,'#5f6664');c.restore();
   if(o.step==='rolling'||(o.impact||0)>.1){for(let d=0;d<6;d++){const a=d*1.1+t/430;ellipse(o.x+Math.cos(a)*(38+(o.rockRoll||0)*9),o.y+18+Math.sin(a)*13,3+d%3,2,'#d9ba88')}}
  }else{
   const hop=o.step==='place'?(o.rabbitHop||0):0;
   const rx=o.x+hop*115,ry=o.y+hop*54-Math.abs(Math.sin(hop*6*Math.PI))*25;
   ellipse(rx+3,ry+16,25,7,'#886c4b66');ellipse(rx,ry,25,16,'#a77847');ellipse(rx+18,ry-12,13,12,'#b88a58');
   ellipse(rx+14,ry-31+Math.sin(t/140)*2,5,20,'#c89c70');ellipse(rx+26,ry-30-Math.sin(t/150)*2,5,19,'#c89c70');
   ellipse(rx+23,ry-14,2.4,2.4,'#231d16');ellipse(rx-17,ry-5,7,7,'#ead4b4');
   if(o.step==='place'&&hop>.85){for(let d=0;d<4;d++)ellipse(rx+30+d*5,ry-16-d%2*7,2.5,2.5,'#f9d46e')}
  }}
  if(o.step!=='drive'&&!o.done){const tool=o.type==='rock'?o.lever:o.carrot;
   if((o.step==='tool'||o.step==='exit')&&o.type!=='mud'){
    if(o.type==='rock'){c.save();c.translate(tool.x,tool.y);c.rotate(-.35);box(-6,-33,12,66,'#9c5e2e');box(-9,-35,18,10,'#c99754');c.restore();}
    else{ellipse(tool.x,tool.y,19,12,'#ac7845');ellipse(tool.x,tool.y-8,9,17,'#ef8b27');ellipse(tool.x+3,tool.y-23,4,12,'#62a348');}
   }
   if(o.step==='carry'&&o.type!=='mud'){
    if(o.type==='rock'){c.save();c.translate(o.farmer.x+18,o.farmer.y-15);c.rotate(-.6);box(-5,-34,10,65,'#a66b35');c.restore();}
    else{ellipse(o.farmer.x+17,o.farmer.y-22,8,16,'#f38d29');ellipse(o.farmer.x+17,o.farmer.y-38,5,10,'#62a348');}
   }
   if(o.step!=='mud')drawFarmer(o.farmer.x,o.farmer.y,t,true,false);
   if(o.step==='mud'){for(const [i,dy] of [-38,38].entries()){const wx=tractor.x-30,wy=tractor.y+dy;ellipse(wx,wy,25+4*Math.sin(t/180+i),23,'#ffe66b77');c.strokeStyle='#ffea67';c.lineWidth=4;c.beginPath();c.arc(wx,wy,25,0,Math.PI*2);c.stroke();}c.fillStyle='#fff2b5';c.font='bold 24px Trebuchet MS';c.fillText(''+(o.mudClicks||0)+'/6',tractor.x-23,tractor.y-85);}
   const cue=o.step==='exit'||o.step==='return'?{x:tractor.x-18,y:tractor.y-65}:o.step==='mud'?{x:tractor.x-30,y:tractor.y-38}:o.step==='tool'?tool:o;
   if(['tool','carry','return'].includes(o.step)){
    const dest=o.step==='tool'?tool:o.step==='carry'?o:{x:tractor.x-18,y:tractor.y-65};
    const dx=dest.x-o.farmer.x,dy=dest.y-o.farmer.y,len=Math.hypot(dx,dy);
    if(len>95){for(let k=1;k<=4;k++){const f=(k/5+((t/1900)%1))%1;ellipse(o.farmer.x+dx*f,o.farmer.y+dy*f,4+2*Math.sin(f*Math.PI),3,'#ffe28caa')}}
   }
   if(o.step==='push'){c.fillStyle='#fff6cd';c.font='bold 28px Trebuchet MS';c.fillText('✋',o.x-14,o.y-52);for(let k=0;k<3;k++)ellipse(o.x-23+k*23,o.y+45,8,8,k<(o.progress||0)?'#ffdd65':'#8a6b48')}
   if(o.step==='place'){ellipse(o.farmer.x+18,o.farmer.y+7,10,14,'#f38d29');ellipse(o.farmer.x+17,o.farmer.y-9,4,9,'#6fa348')}

   c.strokeStyle='#ffe653';c.lineWidth=5;c.setLineDash([9,7]);c.beginPath();c.arc(cue.x,cue.y,42+3*Math.sin(t/200),0,Math.PI*2);c.stroke();c.setLineDash([]);
  }
 }
 if(plowAttached){drawPlow(tractor.x-Math.cos(tractor.angle)*83,tractor.y-Math.sin(tractor.angle)*83,tractor.angle)}
 if(j.exit){const pulse=1+Math.sin(t/210)*.1;ellipse(1155,575,47*pulse,54*pulse,'#fff19b99');c.fillStyle='#7d531f';c.font='bold 72px Trebuchet MS';c.fillText('➜',1100,597)}
}

document.getElementById('sound').textContent='🔇 Voice off';setupLevel();loadTractorLevels();requestAnimationFrame(frame);
})();
