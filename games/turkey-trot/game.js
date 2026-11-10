(()=>{'use strict';
const canvas=document.getElementById('game'),c=canvas.getContext('2d'),$=id=>document.getElementById(id);const W=1000,H=650;let state='ready',lane=-1,targetLane=-1,obstacles=[],completed=0,hits=0,clock=0,spawn=0,last=0,run=0,jumpAt=-99,successFlash=0,hitFlash=0,sound=true,ambience=null,blocked=false,finishAt=16,jumpUntil=-1,jumpQueuedFor=null,landingPlayed=false,jumpStartedFor=null,cinematic=0,cinematicDuration=0,reaction=null,particles=[],introSeen=false,endingWin=false;const clips={gobble:'gobble.mp3',step:'running-feet.mp3',mud:'mudsplash.mp3',hay:'strawrustle.mp3',land:'newlanding.mp3',hit:'pumpkinhit.mp3',crate:'woodclicks.mp3',oof:'littlehurt.mp3',win:'success.mp3',farm:'farmambience.mp3',bell:'farmbell.mp3',fail:'fail.mp3',theme:'turkeytheme.mp3',flap:'turkeyflap.mp3',roll:'cartoonroll.mp3',getTurkey:'getturkey.mp3',turkeyGo:'turkeygo.mp3',eatTurkey:'eatturkey.mp3',noTurkey:'noturkey.mp3'};const audio={};for(const [k,v]of Object.entries(clips)){audio[k]=new Audio('../../sounds/'+v);audio[k].preload='none';audio[k].volume=k==='farm'?.11:k==='step'?.08:.26;}audio.farm.loop=true;audio.step.loop=true;audio.theme.loop=true;audio.theme.volume=.08;audio.flap.volume=.17;audio.roll.volume=.19;const trotCaps={corn:1.15,gate:1.6,roll:1.4,flap:.75,fish:1.15,drip:1.6,tractorStart:2.5,tractorHorn:1.3,hay:1.1,step:2.0};for(const [key,clip] of Object.entries(audio)){if(!clip.loop){clip.addEventListener('timeupdate',()=>{const limit=trotCaps[key];if(limit&&clip.currentTime>=limit){clip.pause();clip.currentTime=0;}});}}let voiceStage=0;function stopVoice(){for(const k of ['getTurkey','turkeyGo','eatTurkey','noTurkey']){audio[k].pause();audio[k].currentTime=0;}}function voiceTick(){if(blocked||!sound)return;const cue=state==='intro'?'getTurkey':state==='winScene'?'turkeyGo':state==='loseScene'?'eatTurkey':null;const threshold=state==='intro'?2.3:state==='winScene'?6.1:3.5;if(cue&&voiceStage===0&&cinematic>=threshold){voiceStage=1;play(cue);}}let victoryGobblePlayed=false;let soundsStarted=false;function play(k){if(!sound||blocked)return;const a=audio[k];if(!a)return;if(k!=='farm'&&k!=='step'&&k!=='theme'){a.pause();a.currentTime=0;}a.play().catch(()=>{});}function stopAll(){Object.values(audio).forEach(a=>{a.pause();a.currentTime=0;});soundsStarted=false;}function syncAudio(){if(state==='running'&&sound&&!blocked){if(!soundsStarted){play('farm');play('step');play('theme');soundsStarted=true;}}else stopAll();}function freezeCheck(){blocked=document.hidden||document.body.classList.contains('student-screen-frozen');syncAudio();}new MutationObserver(freezeCheck).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',freezeCheck);window.addEventListener('blur',()=>{blocked=true;syncAudio();});window.addEventListener('focus',freezeCheck);window.addEventListener('pagehide',stopAll);
const rnd=(a,b)=>a+Math.random()*(b-a),lerp=(a,b,t)=>a+(b-a)*t;function ellipse(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}function line(points,color,width=3){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}function poly(pts,color){c.fillStyle=color;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fill();}
function tree(x,y,s){c.save();c.translate(x,y);c.scale(s,s);ellipse(0,0,48,11,'#394b2a44');rect(-10,-112,20,113,'#76502f');line([[-2,-67],[-27,-102]],'#76502f',8);line([[3,-81],[30,-113]],'#76502f',8);for(const [dx,dy,r,col]of [[-25,-117,36,'#a84e2a'],[24,-125,40,'#e8a33e'],[0,-152,49,'#ce722d'],[-15,-170,30,'#f5bc55'],[30,-163,26,'#d75d34']]){ellipse(dx,dy,r,r*.88,col);ellipse(dx-9,dy-10,r*.38,r*.24,'#ffffff20');}c.restore();}
function barn(x,y,s){c.save();c.translate(x,y);c.scale(s,s);rect(-115,-150,230,150,'#9d352c');poly([[-130,-151],[-115,-168],[0,-242],[115,-168],[130,-151]],'#713c2e');poly([[-116,-151],[0,-225],[116,-151]],'#a85a37');for(let i=0;i<6;i++)line([[-104+i*35,-163],[0,-225]],'#c5804a55',2);rect(-108,-147,216,10,'#f5e0bc');rect(-46,-104,92,104,'#6c3325');rect(-40,-98,80,98,'#7e4431');line([[-40,-98],[40,0]],'#e4c393',7);line([[40,-98],[-40,0]],'#e4c393',7);rect(-21,-190,42,35,'#fff1c7');rect(-16,-185,32,25,'#8c5d43');line([[0,-185],[0,-160]],'#f4d6a5',4);line([[-16,-172],[16,-172]],'#f4d6a5',4);rect(-105,-142,10,142,'#e9c69b');rect(95,-142,10,142,'#e9c69b');c.restore();}
function bush(x,y,s,variant){c.save();c.translate(x,y);c.scale(s,s);ellipse(0,3,42,9,'#355f3240');rect(-5,-28,10,30,'#5a7035');for(const [dx,dy,r,col]of [[-23,-26,25,'#3e793c'],[20,-29,26,'#478b43'],[0,-47,32,variant?'#589c49':'#4c913f'],[-12,-54,13,'#83b95c'],[16,-42,12,'#6eaa51']])ellipse(dx,dy,r,r*.76,col);for(let k=0;k<4;k++)ellipse(-22+k*14,-29-(k%2)*14,3,5,'#c1d57a');c.restore();}
function farm(t){const sky=c.createLinearGradient(0,0,0,430);sky.addColorStop(0,'#7cc6e8');sky.addColorStop(.75,'#f3d7a6');sky.addColorStop(1,'#fff1c4');rect(0,0,W,H,sky);ellipse(810,89,55,55,'#ffe3a0');for(let k=0;k<5;k++){const x=95+k*208+(k%2)*36;ellipse(x,90+(k%2)*40,52,17,'#ffffffb5');ellipse(x+37,88+(k%2)*40,37,14,'#ffffffb5');}poly([[0,344],[155,250],[285,305],[470,240],[650,305],[815,258],[1000,330],[1000,650],[0,650]],'#93b27b');poly([[0,366],[190,300],[405,353],[660,305],[1000,344],[1000,650],[0,650]],'#6f9c5a');rect(0,352,W,298,'#80a761');barn(162,357,.76);barn(835,350,.49);
// The path and its shoulders share one perspective origin.
poly([[470,342],[530,342],[900,650],[100,650]],'#ae8054');poly([[474,342],[526,342],[877,650],[123,650]],'#d8a878');poly([[478,342],[522,342],[852,650],[148,650]],'#edc08c');line([[500,348],[500,650]],'#f8dbad77',3);
const progression=((t*95)%340);for(let i=0;i<15;i++){let y=352+((i*58+progression)%330),z=(y-342)/308;for(const side of [-1,1]){const edge=500+side*(30+z*374),outer=500+side*(48+z*418),scale=.13+z*.9; // road-side plants are perspective anchored
bush(outer,y,scale,i%2);if(i%2===0){const fx=500+side*(41+z*393);line([[fx,y-25*scale],[fx,y+19*scale]],'#80603a',Math.max(2,7*scale));line([[fx,y-13*scale],[fx+side*33*scale,y-13*scale]],'#dfc38d',Math.max(2,6*scale));line([[fx,y+1*scale],[fx+side*33*scale,y+1*scale]],'#dfc38d',Math.max(2,6*scale));}}}
for(let i=0;i<12;i++){const y=353+((i*63+t*174)%300),z=(y-342)/308;ellipse(500+(i%2?-1:1)*(12+z*230),y,2+z*7,1+z*3,'#a77c54');}for(let i=0;i<8;i++){const y=355+((i*83+t*110)%300),z=(y-342)/308;const side=i%2?-1:1;const x=500+side*(95+z*520);if(x>-50&&x<1050)tree(x,y,.14+z*.62);}}
function obstacleX(lane,z){return 500+lane*(29+z*164);}function obstacleY(z){return 350+z*292;}function drawObstacle(o){const z=o.z;if(z<0||z>1.15)return;const x=o.kind==='log'?500:obstacleX(o.lane,z),y=obstacleY(z),s=.18+z*1.15;c.save();c.translate(x,y);c.scale(s,s);ellipse(0,5,60,12,'#4b392b88');if(o.kind==='hay'){rect(-50,-55,100,55,'#d6a039');for(let i=0;i<4;i++)line([[-47,-42+i*12],[47,-39+i*12]],'#f8d96c',4);rect(-4,-55,8,55,'#9d7033');}else if(o.kind==='pumpkin'){for(let i=-1;i<=1;i++){ellipse(i*24,-19,29,25,i===0?'#f1932f':'#e87b23');line([[i*24,-36],[i*24+3,-42]],'#47783a',6);}}else if(o.kind==='mud'){
 // Irregular shallow puddle, embedded in the road rather than a floating oval.
 c.save();c.translate(0,-5);
 const outline=[[-76,0],[-67,-13],[-46,-20],[-27,-17],[-8,-23],[18,-18],[41,-21],[66,-10],[75,1],[60,12],[36,15],[12,12],[-12,18],[-37,13],[-62,12]];
 poly(outline,'#8d694b');
 c.save();c.scale(.92,.73);poly(outline,'#513d32');c.restore();
 c.save();c.scale(.83,.57);poly(outline,'#79543e');c.restore();
 line([[-51,-4],[-32,-9],[-10,-7]],'#b18c69',3);
 line([[10,2],[31,-1],[48,2]],'#c09b73',3);
 ellipse(-30,5,12,2,'#d3b18b88');ellipse(28,-8,9,2,'#d6b68c77');
 for(const [px,py,r] of [[-67,9,4],[-49,17,3],[58,13,4],[73,-4,3]])ellipse(px,py,r,r*.55,'#76533b');
 c.restore();}else if(o.kind==='crate'){rect(-48,-58,96,58,'#9d6535');line([[-48,-58],[48,0]],'#e3b46c',6);line([[48,-58],[-48,0]],'#e3b46c',6);}else{const half=128;line([[-half,-19],[half,-19]],'#7a5336',19);ellipse(-half,-19,11,11,'#b0804c');ellipse(half,-19,11,11,'#b0804c');}c.restore();}
function turkey(x,y,t,scale=1,jumping=false){
 c.save();const phase=Math.max(0,Math.min(1,(jumpUntil-t)/1.35));const hop=jumping?118*Math.sin(Math.PI*(1-phase)):0;
 c.translate(x,y-hop);c.scale(scale,scale);const step=Math.sin(t*17),lean=(targetLane-lane)*.10;c.rotate(lean);
 // Feet and their ground shadow sit behind the body, with a visibly raised shadow on jumps.
 c.save();c.translate(0,hop);ellipse(0,16,60+hop*.22,12+hop*.04,'#4e39294b');c.restore();
 for(const side of [-1,1]){const lift=jumping?-16:step*side*12;line([[side*22,-9],[side*27,6+lift],[side*39,12+lift]],'#c56b23',11);ellipse(side*42,13+lift,20,8,'#ed922d');for(let toe=0;toe<3;toe++)line([[side*42+(toe-1)*8,12+lift],[side*42+(toe-1)*9,19+lift]],'#d57b22',4);}
 // The head points toward the horizon; it is a small silhouette behind the tail.
 ellipse(0,-132,25,32,'#8c532e');ellipse(0,-71,72,84,'#86502f');
 for(const side of [-1,1]){c.save();c.translate(side*61,-69);c.rotate(side*(.28+Math.sin(t*16)*.12+(jumping?.30:0)));ellipse(0,0,23,43,'#ac7044');line([[0,10],[side*7,28]],'#85502f',3);c.restore();}
 // Tail fan is the foremost, dominant feature in this REAR view, attached to the back.
 c.save();c.translate(0,-78);c.rotate(Math.sin(t*9)*.025);
 for(let i=-4;i<=4;i++){c.save();c.rotate(i*.205+Math.sin(t*9+i*.7)*.012);ellipse(0,-53,24,83,i%2?'#c35d2d':'#e5a044');ellipse(0,-101,15,26,i%2?'#f0b44b':'#f6c46c');line([[0,-122],[0,-71]],'#f6d391',2);c.restore();}
 ellipse(0,-13,48,48,'#8d512f');ellipse(-14,-21,17,23,'#a9693e');ellipse(17,-19,17,23,'#a9693e');c.restore();c.restore();}
function turkeyVictoryFace(x,y,t,scale=1){
 // A dedicated front-facing portrait: the tail stays BEHIND the face.
 c.save();c.translate(x,y);c.scale(scale,scale);
 const sway=Math.sin(t*7)*.055;c.rotate(sway);
 for(let i=-4;i<=4;i++){c.save();c.rotate(i*.19);ellipse(0,-91,19,71,i%2?'#c96832':'#e9a443');ellipse(0,-140,13,23,'#f7c36d');c.restore();}
 ellipse(0,-37,65,72,'#955832');
 for(const side of [-1,1]){c.save();c.translate(side*57,-44);c.rotate(side*(.16+Math.sin(t*12)*.22));ellipse(0,0,21,38,'#b87746');c.restore();}
 line([[-23,17],[-25,31]],'#ce7a29',8);line([[23,17],[25,31]],'#ce7a29',8);
 ellipse(0,-104,40,43,'#a96639');ellipse(-16,-112,12,15,'#fff9e9');ellipse(16,-112,12,15,'#fff9e9');
 ellipse(-14+Math.sin(t*3)*2,-111,5,8,'#30251d');ellipse(18+Math.sin(t*3)*2,-111,5,8,'#30251d');
 const speaking=t>=8.55&&t<=9.55;
 const open=speaking?7+6*Math.abs(Math.sin(t*21)):3;
 ellipse(0,-89,20,open,'#e9a12d');ellipse(0,-88,10,Math.max(2,open-4),'#9b4929');
 ellipse(18,-76,7,15,'#c83f35');
 c.restore();
}
function chasers(t){
 // Farmers are the same rear-view characters from the opening, always behind the turkey.
 // Scale rises with collisions, while their feet remain inside the stage.
 const closeness=Math.min(1,(hits+.65)/3.65);
 for(const side of [-1,1]){
  const x=500+side*(408-closeness*72), y=646-closeness*16;
  const scale=.65+closeness*.18;
  c.save();c.translate(x,y);c.scale(scale,scale);
  drawGuest(0,0,t+(side===1?.35:0),side===-1?'#6388a9':'#bc7051','rear');
  c.restore();
 }
}
function reset(){const next=document.getElementById('woodlandNext');if(next)next.hidden=true;reaction=null;particles=[];cinematic=0;state='ready';lane=-1;targetLane=-1;obstacles=[];completed=0;hits=0;clock=0;spawn=1.4;run=0;jumpAt=-99;jumpUntil=-1;jumpQueuedFor=null;jumpStartedFor=null;landingPlayed=false;successFlash=0;hitFlash=0;updateHud();$('jump').hidden=true;$('heading').textContent='Run, Turkey, Run!';$('description').textContent='Two lanes! Click the clear LEFT or RIGHT side. Jump over logs from either lane!' ;$('start').textContent='Start Running!';$('overlay').hidden=false;syncAudio();}function start(){reset();$('overlay').hidden=true;if(!introSeen){voiceStage=0;state='intro';cinematic=0;cinematicDuration=10;introSeen=true;showSkip(true);}else{beginRun();}}function beginRun(){state='running';$('overlay').hidden=true;showSkip(false);play('gobble');syncAudio();}function updateHud(){$('distance').textContent=completed+' / '+finishAt;$('hearts').textContent='❤️'.repeat(Math.max(0,3-hits))+'🖤'.repeat(hits);}function finish(won){voiceStage=0;victoryGobblePlayed=false;endingWin=won;state=won?'winScene':'loseScene';cinematic=0;cinematicDuration=won?10:9;reaction=null;syncAudio();$('jump').hidden=true;$('overlay').hidden=true;showSkip(true);play(won?'win':'bell');}function finishScene(){stopVoice();state=endingWin?'won':'lost';showSkip(false);$('overlay').hidden=false;$('heading').textContent=endingWin?'You Escaped! 🎉':'Thanksgiving Dinner!';$('description').textContent=endingWin?'The guests ran past the hiding turkey! Great clicking!':'The guests found a big turkey dinner. Try again and help the running turkey escape!';$('start').textContent='Play Again';if(endingWin){let next=document.getElementById('woodlandNext');if(!next){next=document.createElement('a');next.id='woodlandNext';next.href='woodland.html';next.textContent='Continue to Woodland Dash!';next.style.cssText='display:inline-block;margin-top:15px;padding:12px 20px;background:#a9ed86;border:3px solid #365d32;border-radius:16px;color:#21431e;font:bold 22px system-ui;text-decoration:none';$('overlay').appendChild(next);}next.hidden=false;}}
function collision(o){if(o.done)return;o.done=true;const dodged=o.kind==='log'?(jumpStartedFor===o&&clock<jumpUntil):Math.abs(lane-o.lane)>1.35;if(!dodged){hits++;hitFlash=.5;reaction={kind:o.kind,time:0,duration:o.kind==='mud'?1.15:1.85,obstacle:o,final:false};if(o.kind==='mud'){for(let i=0;i<28;i++){const side=i%2?-1:1;particles.push({x:500+lane*172+side*rnd(8,24),y:570,vx:side*rnd(55,230),vy:-rnd(130,390),life:rnd(.55,1.1),size:rnd(3,10)});}}play(o.kind==='mud'?'mud':o.kind==='hay'?'hay':o.kind==='crate'?'crate':'hit');if(o.kind!=='mud')play('oof');play('roll');if(hits>=3){updateHud();reaction.final=true;return;}}else{successFlash=.18;if(o.kind==='hay')play('hay');}completed++;updateHud();if(completed>=finishAt)finish(true);}function update(dt){clock+=dt;if(state==='intro'||state==='winScene'||state==='loseScene'){cinematic+=dt;voiceTick();if(state==='winScene'&&!victoryGobblePlayed&&cinematic>=8.55){victoryGobblePlayed=true;play('gobble');}if(cinematic>=cinematicDuration){if(state==='intro')beginRun();else finishScene();}return;}if(state!=='running')return;if(reaction){audio.step.pause();$('jump').hidden=true;reaction.time+=dt;for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=480*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);if(reaction.time>=reaction.duration){const final=reaction.final;reaction=null;particles=[];if(!final&&sound&&!blocked&&state==='running')play('step');if(final){finish(false);return;}}return;}run+=dt;lane=lerp(lane,targetLane,Math.min(1,dt*11));spawn-=dt;if(spawn<=0&&completed+obstacles.filter(o=>!o.done).length<finishAt){const kind=completed<3?['hay','pumpkin','crate'][Math.floor(Math.random()*3)]:['hay','pumpkin','crate','mud','log'][Math.floor(Math.random()*5)];obstacles.push({kind,lane:kind==='log'?0:(Math.random()<.5?-1:1),z:0,done:false});spawn=Math.max(1.3,2.6-completed*.06);}const speed=.24+completed*.004;for(const o of obstacles){o.z+=dt*speed;if(o.z>=.87&&!o.done)collision(o);}obstacles=obstacles.filter(o=>o.z<1.18);const jumpObstacle=obstacles.find(o=>o.kind==='log'&&!o.done&&o.z>.30&&o.z<.87);$('jump').hidden=!jumpObstacle;if(jumpObstacle){$('jump').textContent='⬆ JUMP!';}if(jumpQueuedFor&&!jumpQueuedFor.done&&jumpQueuedFor.z>=.54&&jumpStartedFor!==jumpQueuedFor){jumpAt=clock;jumpUntil=clock+1.35;landingPlayed=false;jumpStartedFor=jumpQueuedFor;}if(jumpQueuedFor&&jumpQueuedFor.done)jumpQueuedFor=null;if(jumpUntil>0&&clock>=jumpUntil&&!landingPlayed){landingPlayed=true;play('land');}successFlash=Math.max(0,successFlash-dt);hitFlash=Math.max(0,hitFlash-dt);}
function drawGuest(x,y,t,shirt,view='front'){
 c.save();c.translate(x,y);
 const p=Math.sin(t*10),bounce=Math.abs(p)*3;
 c.translate(0,-bounce);
 // Both views use identical character proportions, hat, boots, and clothing.
 ellipse(0,13,43,10,'#563a2b44');
 for(const side of [-1,1]){
  c.save();c.translate(side*17,-8);c.rotate(side*p*.17);
  rect(-13,0,26,46,'#44556c');ellipse(side*4,46,18,10,'#49352b');c.restore();
 }
 poly([[-38,-94],[38,-94],[44,-14],[-44,-14]],shirt);
 rect(-18,-87,36,73,'#e0b98b');rect(-10,-84,20,68,shirt);
 // Arms swing, but the right hand grips a pitchfork that shares its transform.
 c.save();c.translate(-37,-83);c.rotate(-.15-p*.18);
 line([[0,0],[-10,30],[-15,49]],'#e7a879',16);ellipse(-15,49,10,10,'#e7a879');c.restore();
 c.save();c.translate(37,-83);c.rotate(.12+p*.15);
 line([[0,0],[11,27],[17,43]],'#e7a879',16);
 // Handle passes through the hand: no free-floating fork.
 line([[17,55],[17,-67]],'#866445',7);
 line([[17,-67],[17,-93]],'#9ba9aa',5);
 for(let k=-1;k<=1;k++)line([[17+k*11,-90],[17+k*11,-113]],'#a8b7b8',4);
 line([[6,-88],[28,-88]],'#9ba9aa',4);
 ellipse(17,43,11,10,'#e7a879');c.restore();
 ellipse(0,-119,30,34,'#efb98e');
 if(view==='front'){
  ellipse(-10,-120,4,5,'#33271e');ellipse(10,-120,4,5,'#33271e');
  line([[-8,-105],[0,-101],[9,-105]],'#8d4a35',3);
  ellipse(-11,-131,5,3,'#fff6d9');ellipse(9,-131,5,3,'#fff6d9');
 }else{
  // Hair and hat brim hide the face from the rear.
  ellipse(0,-123,29,29,'#70442d');
  line([[-26,-107],[26,-107]],'#855435',3);
 }
 ellipse(0,-148,31,12,'#66422d');rect(-23,-166,46,18,'#785033');ellipse(0,-151,40,7,'#98613b');
 c.restore();
}
function drawIntro(){
 const t=cinematic;
 // Four animated beats: peaceful turkey, farmers emerge, everyone turns, chase into gameplay.
 farm(t<5?0:(t-5)*.38);
 c.save();c.fillStyle='#f9e9bd';c.globalAlpha=.08;c.fillRect(0,0,W,H);c.restore();
 if(t<2.3){
  turkey(515,565,t,1.08,false);
 }else if(t<4.5){
  const alarm=Math.min(1,(t-2.3)/1.1);
  turkey(515+alarm*35,565,t,1.08,false);
 }else{
  // Turkey and farmers all run AWAY from the camera, shrinking into the road.
  const progress=Math.min(1,(t-4.5)/5.5);
  const ease=progress*progress*(3-2*progress);
  const ty=565-ease*165, ts=1.08-ease*.42;
  turkey(560+ease*35,ty,t*1.7,ts,false);
 }
 if(t>=1.4&&t<4.5){
  const emerge=Math.min(1,(t-1.4)/1.25);
  const move=emerge*emerge*(3-2*emerge);
  // Walk out from the left barn, holding the forks in their hands.
  drawGuest(170+move*140,505+move*70,t,'#6388a9','front');
  drawGuest(235+move*190,505+move*70,t+.45,'#bc7051','front');
 }
 if(t>=4.5){
  const progress=Math.min(1,(t-4.5)/5.5);
  const ease=progress*progress*(3-2*progress);
  for(const side of [-1,1]){
   const x=(side===-1?350:455)+ease*(side===-1?50:65);
   const y=575-ease*105;
   const sc=1-ease*.37;
   c.save();c.translate(x,y);c.scale(sc,sc);
   drawGuest(0,0,t*1.6+(side===1?.45:0),side===-1?'#6388a9':'#bc7051','rear');
   c.restore();
  }
 }
 c.textAlign='center';c.fillStyle='#fff8d8';c.strokeStyle='#633e28';c.lineWidth=8;c.font='bold 40px system-ui';
 const caption=t<1.5?'A peaceful day on the farm...':t<3.6?'Uh-oh! Dinner guests!':t<5?'GOBBLE! RUN!':'The chase is on!';
 c.strokeText(caption,500,110);c.fillText(caption,500,110);
}
function drawBarnEscape(t){
 // Keep the background and barn at fixed world positions throughout the finale.
 farm(0);
 const bx=500,by=438,scale=1.52;
 barn(bx,by,scale);
 // Replace the barn's closed-door artwork with an open doorway and hinged doors.
 c.save();c.translate(bx,by);c.scale(scale,scale);
 rect(-47,-105,94,106,'#392a22');
 rect(-40,-98,80,96,'#51402c');
 for(let i=0;i<4;i++)line([[-37,-20-i*18],[37,-20-i*18]],'#665039',2);
 const opening=Math.min(1,t/1.25);
 c.save();c.translate(-47,-102);c.transform(1,0,-.16*opening,1,0,0);
 poly([[0,0],[-5-39*opening,4],[-5-39*opening,104],[0,104]],'#a45a36');
 line([[-3,8],[-3-37*opening,98]],'#f0c894',4);c.restore();
 c.save();c.translate(47,-102);c.transform(1,0,.16*opening,1,0,0);
 poly([[0,0],[5+39*opening,4],[5+39*opening,104],[0,104]],'#a45a36');
 line([[3,8],[3+37*opening,98]],'#f0c894',4);c.restore();
 // Hay bales inside the doorway: the hiding place.
 for(const [x,y,w,h] of [[-34,-31,34,30],[3,-34,37,33],[-15,-55,34,22]]){
  rect(x,y,w,h,'#c99539');line([[x,y+h*.45],[x+w,y+h*.45]],'#f3cb69',3);
  line([[x+w*.5,y],[x+w*.5,y+h]],'#9b692f',3);
 }
 c.restore();
 // Turkey approaches the doorway in perspective, then vanishes behind the hay.
 if(t<3.55){
  const u=Math.max(0,Math.min(1,(t-.45)/3.1));const e=u*u*(3-2*u);
  const ty=581-e*148,tx=500,sz=1.13-e*.72;
  turkey(tx,ty,t*1.8,sz,false);
 }
 // Farmers approach after the turkey disappears, search, then turn and leave.
 if(t>=2.8&&t<8.2){
  const u=Math.max(0,Math.min(1,(t-2.8)/1.7));const e=u*u*(3-2*u);
  const departing=Math.max(0,Math.min(1,(t-6.1)/2.1));
  for(const side of [-1,1]){
   const startX=500+side*250,endX=500+side*100;
   const x=startX+(endX-startX)*e+side*departing*145;
   const y=603-e*155+departing*105;
   const size=.91-e*.38+departing*.22;
   c.save();c.translate(x,y);c.scale(size,size);
   // Looking around at the doorway, then walking away toward the camera.
   const searching=t>=4.45&&t<6.15;
   if(searching)c.rotate(Math.sin(t*5+side)*.09);
   drawGuest(0,0,t*2+(side===1?.6:0),side===-1?'#6388a9':'#bc7051',departing>.35?'front':'rear');
   c.restore();
  }
 }
 // Only peek out once the farmers have gone.
 if(t>=8.2){
  const u=Math.min(1,(t-8.2)/.6);
  c.save();c.beginPath();c.rect(432,285,136,152);c.clip();
  turkeyVictoryFace(521,458-u*20,t,.43);
  c.restore();
  // Keep a hay bale in front of the peeking turkey.
  rect(492,409,58,27,'#d5a044');line([[492,421],[550,421]],'#f3d079',3);
 }
 c.textAlign='center';c.font='bold 39px system-ui';c.lineWidth=7;
 c.strokeStyle='#513822';c.fillStyle='#fff6cd';
 const caption=t<3.6?'Quick! Hide in the barn!':t<6.2?'Where did the turkey go?':t<8.2?'They give up and leave!':'The turkey escaped!';
 c.strokeText(caption,500,95);c.fillText(caption,500,95);
}
function drawEnding(won){const t=cinematic;if(won){drawBarnEscape(t);return;}
// Non-graphic dinner-table cutaway; fully drawn characters and a recognizable roast bird.
const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f9dfb7');g.addColorStop(1,'#bc7950');rect(0,0,W,H,g);
rect(0,0,W,190,'#e8b785');for(let i=0;i<9;i++)rect(i*125,0,9,190,'#fff0c0');
rect(60,72,880,280,'#f7d9a7');rect(88,100,824,228,'#9fb9a4');for(let i=0;i<6;i++)rect(100+i*140,100,9,228,'#f5dfb8');
drawGuest(115,593,t,'#6489a7');drawGuest(885,593,t+.5,'#b96e55');
rect(190,472,620,165,'#945735');rect(200,453,600,67,'#f9eac7');
for(const x of [265,370,630,735]){ellipse(x,483,46,14,'#fef7df');ellipse(x,480,26,8,'#d6b47b');}
// Platter, roast body, two drumsticks, wings, and decorative greens.
c.save();c.translate(500,450);c.scale(.72,.72);c.translate(-500,-450);
ellipse(500,466,246,56,'#fdf5dc');ellipse(500,463,205,43,'#d5ad78');
ellipse(500,419,145,71,'#a95e2b');ellipse(500,403,124,53,'#d58a42');ellipse(488,386,78,24,'#f2b66d');
for(const side of [-1,1]){c.save();c.translate(500+side*127,431);c.rotate(side*.34);ellipse(0,0,49,26,'#c77b39');ellipse(side*44,4,15,13,'#d9914b');line([[side*49,4],[side*77,4]],'#f8e9d3',10);ellipse(side*81,0,9,8,'#f8e9d3');ellipse(side*81,10,9,8,'#f8e9d3');c.restore();}
for(let i=0;i<11;i++)ellipse(500+Math.sin(i*2.3)*202,465+Math.cos(i*2.3)*28,13,7,i%2?'#79a958':'#e7aa4b');c.restore();

c.textAlign='center';c.font='bold 46px system-ui';c.lineWidth=8;c.strokeStyle='#613a25';c.fillStyle='#fff6d7';c.strokeText('Thanksgiving Dinner!',500,65);c.fillText('Thanksgiving Dinner!',500,65);}
function draw(){if(state==='intro'){drawIntro();return;}if(state==='winScene'||state==='loseScene'){drawEnding(state==='winScene');return;}farm(run);// Visual-only depth: a cleared obstacle recedes beneath/behind the runner.
 // Collision state, obstacle positions and removal timing are untouched.
 obstacles.slice().sort((a,b)=>a.z-b.z).forEach(o=>{
   c.save();
   if(o.done && o.z>=.87){c.globalAlpha=Math.max(0,Math.min(1,(1.01-o.z)/.14));}
   drawObstacle(o);
   c.restore();
 });if(reaction&&reaction.kind!=='mud'){
 const q=Math.min(1,reaction.time/reaction.duration),x=500+lane*172;
 // A forward stumble over the actual object: approach, hop over, land and rise.
 const forward=q<.62?q/.62:1, lift=q<.62?95*Math.sin(Math.PI*forward):0;
 const tip=q<.18?q/.18*.24:q<.58?.24+Math.sin((q-.18)/.4*Math.PI)*.34:q<.82?.24*(1-(q-.58)/.24):0;
 c.save();c.translate(x,575-85*forward-lift);c.rotate(tip*(lane<0?1:-1));
 turkey(0,0,clock,1.15,false);c.restore();
 for(let i=0;i<4;i++){const a=q*4+i*.8;ellipse(x+Math.sin(a)*65,570+Math.cos(a)*9,5,3,'#b78b59aa');}
 }else{turkey(500+lane*172,575,clock,1.15,clock<jumpUntil);if(reaction&&reaction.kind==='mud'){for(const p of particles){c.globalAlpha=Math.max(0,Math.min(1,p.life));ellipse(p.x,p.y,p.size,p.size*.8,'#805335');ellipse(p.x-2,p.y-2,Math.max(1,p.size*.3),Math.max(1,p.size*.2),'#c69b72');}c.globalAlpha=1;
 // Contact ripples stay at the feet while the mud spray arcs upward.
 const splash=Math.max(0,1-reaction.time/reaction.duration);
 c.save();c.globalAlpha=splash*.75;
 for(const side of [-1,1]){
   c.beginPath();c.ellipse(500+lane*172+side*27,584,20+45*(1-splash),5+9*(1-splash),0,Math.PI,Math.PI*2);
   c.strokeStyle='#9b704d';c.lineWidth=3;c.stroke();
 }
 c.restore();}}chasers(clock);if(hitFlash){rect(0,0,W,H,`rgba(230,40,20,${hitFlash*.3})`);}if(successFlash){rect(0,0,W,H,`rgba(255,230,90,${successFlash*.18})`);}}function frame(ms){let dt=last?Math.min(.05,(ms-last)/1000):0;last=ms;if(!blocked)update(dt);draw();requestAnimationFrame(frame);}canvas.addEventListener('pointerdown',e=>{if(state!=='running'||blocked||reaction)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;targetLane=x<.5?-1:1;});$('jump').addEventListener('pointerdown',e=>{e.stopPropagation();if(state!=='running'||blocked||reaction)return;const o=obstacles.find(o=>o.kind==='log'&&!o.done&&o.z>.30&&o.z<.87);if(!o||jumpStartedFor===o)return;jumpQueuedFor=o;if(o.z>=.53){jumpAt=clock;jumpUntil=clock+1.35;landingPlayed=false;jumpStartedFor=jumpQueuedFor;}play('flap');});$('start').onclick=start;const skip=document.createElement('button');skip.id='skipScene';skip.textContent='Skip Animation ▶';skip.hidden=true;document.getElementById('stage').appendChild(skip);function showSkip(visible){skip.hidden=!visible;}skip.onclick=()=>{if(state==='intro')beginRun();else if(state==='winScene'||state==='loseScene')finishScene();};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'🔊':'🔇';syncAudio();};reset();requestAnimationFrame(frame);

fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(s=>{const n=Number(s.turkeyTrotLevel1Count);if(Number.isInteger(n)&&n>=3&&n<=20)finishAt=n;updateHud();}).catch(()=>{});
})();
