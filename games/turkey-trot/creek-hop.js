(()=>{'use strict';
const canvas=document.getElementById('game'),c=canvas.getContext('2d'),$=id=>document.getElementById(id),W=1000,H=650;
let tractorSoundStage=0;let state='ready',t=0,last=0,hop=0,platforms=[],current={x:500,y:545,w:145,h:39,type:'rock',id:-1,phase:0},flight=null,splashAt=0,blocked=false,sound=true,opening=0,finishAt=0,particles=[],travel=0,failPhase=0,failStart=0,failSound=false,victorySoundStage=0,hopGoal=20;
const LAND_Y=545, FAR_Y=335, STEP=LAND_Y-FAR_Y;
const sounds={gobble:'gobble.mp3',jump:'flying.mp3',land:'newlanding.mp3',splash:'mudsplash.mp3',win:'success.mp3',fail:'fail.mp3',water:'riverambience.mp3',fish:'paddlesplash.mp3',bear:'roar.mp3',steps:'running-feet.mp3',theme:'turkeytheme.mp3',flap:'turkeyflap.mp3',fish:'fishjump.mp3',tractorStart:'tractorstart.mp3',tractorDrive:'tractordrive.mp3',tractorHorn:'tractorhorn.mp3',drip:'waterdrip.mp3',getTurkey:'getturkey.mp3',turkeyGo:'turkeygo.mp3',eatTurkey:'eatturkey.mp3',noTurkey:'noturkey.mp3'};
const audio={};for(const [k,f] of Object.entries(sounds)){audio[k]=new Audio('../../sounds/'+f);audio[k].preload='none';audio[k].volume=k==='water'?.11:.23;}audio.water.loop=true;audio.theme.loop=true;audio.theme.volume=.08;audio.tractorDrive.volume=.12;audio.flap.volume=.17;audio.drip.volume=.14;const trotCaps={corn:1.15,gate:1.6,roll:1.4,flap:.75,fish:1.15,drip:1.6,tractorStart:2.5,tractorHorn:1.3,hay:1.1,step:2.0};for(const [key,clip] of Object.entries(audio)){if(!clip.loop){clip.addEventListener('timeupdate',()=>{const limit=trotCaps[key];if(limit&&clip.currentTime>=limit){clip.pause();clip.currentTime=0;}});}}audio.bear.volume=.12;audio.fish.volume=.12;audio.steps.volume=.12;
function play(k){if(!sound||blocked)return;const a=audio[k];if(!a)return;if(k!=='water'&&k!=='theme'&&k!=='tractorDrive'){a.pause();a.currentTime=0;}a.play().catch(()=>{});}function stop(){Object.values(audio).forEach(a=>{a.pause();a.currentTime=0;});}function sync(){blocked=document.hidden||document.body.classList.contains('student-screen-frozen');if(blocked||!sound||!['intro','play','flight','win'].includes(state)){stop();return;}if(audio.water.paused)play('water');if(audio.theme.paused)play('theme');}
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);window.addEventListener('blur',()=>{blocked=true;stop();});window.addEventListener('focus',sync);window.addEventListener('pagehide',stop);
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'🔊':'🔇';sync();};
function rand(n){return (Math.sin(n*91.71+31.43)*43758.5453)%1;}function rnd(n){return Math.abs(rand(n));}function lerp(a,b,p){return a+(b-a)*p;}function ease(p){return p*p*(3-2*p);}function oval(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fill();}function line(x,y,X,Y,color,w=3){c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();}
function makePlatform(i){const type=i%5===3?'log':i%6===5?'small':'rock';const x=500+Math.sin(i*2.13)*155+(i%3===0?35:0);const w=type==='small'?103:type==='log'?165:145;return {id:i,type,x,y:FAR_Y,w,h:type==='log'?33:40,phase:i*.81};}
function drift(p){return p.type==='log'?Math.sin(t*1.2+p.phase)*22:0;}
function supportedX(){return current.x+drift(current);}
function next(){platforms=[makePlatform(hop)];$('distance').textContent=`${hop} / ${hopGoal} hops`;}
function reset(){voiceStage=0;tractorSoundStage=0;victorySoundStage=0;setFinaleSkip(false);failPhase=0;failSound=false;hop=0;t=0;travel=0;current={x:500,y:LAND_Y,w:145,h:39,type:'rock',id:-1,phase:0};flight=null;particles=[];next();state='intro';opening=0;sync();$('overlay').hidden=true;}
function finish(ok){voiceStage=0;state=ok?'win':'fail';finishAt=t;stop();if(!ok)play('splash');$('heading').textContent=ok?'Creek Hop Complete!':'SPLASH!';$('description').textContent=ok?'The turkey escaped the creek on a tractor!':'The farmers caught the turkey! Try the creek again!';$('start').textContent=ok?'Play Again':'Try Again';$('overlay').hidden=ok;const next=$('finaleNext');if(next)next.hidden=true;setFinaleSkip(ok);if(ok){victorySoundStage=0;tractorSoundStage=0;sync();}}
$('start').onclick=reset;
// Victory is a cinematic only. No platform, collision, or input calculations change.
const finaleSkip=document.createElement('button');finaleSkip.type='button';finaleSkip.textContent='Skip Animation ▶';finaleSkip.setAttribute('aria-label','Skip creek victory animation');finaleSkip.style.cssText='position:absolute;right:14px;bottom:18px;z-index:12;padding:12px 18px;border:3px solid #83542d;border-radius:18px;background:#ffebae;color:#53331e;font:bold 18px system-ui;cursor:pointer;box-shadow:0 3px 0 #a57c48';
const finaleHost=canvas.parentElement; if(getComputedStyle(finaleHost).position==='static')finaleHost.style.position='relative';finaleHost.appendChild(finaleSkip);
function setFinaleSkip(show){finaleSkip.hidden=!show;finaleSkip.style.display=show?'block':'none';}
setFinaleSkip(false);
let voiceStage=0;function voiceTick(){if(blocked||!sound)return;let key=null,at=0;if(state==='intro'){key='getTurkey';at=1.6;}else if(state==='win'){key='turkeyGo';at=9.5;}else if(state==='caught'){key='eatTurkey';at=4.4;}if(key&&voiceStage===0&&(state==='intro'?opening:state==='win'?t-finishAt:t-failStart)>=at){voiceStage=1;play(key);}}function tractorAudioTick(){if(state!=='win'||blocked||!sound)return;const elapsed=t-finishAt;if(elapsed>=5.5&&tractorSoundStage<1){tractorSoundStage=1;play('tractorStart');}if(elapsed>=7&&tractorSoundStage<2){tractorSoundStage=2;play('tractorDrive');}if(elapsed>=9.4&&tractorSoundStage<3){tractorSoundStage=3;audio.tractorDrive.pause();play('drip');}}
function endVictory(){if(state!=='win')return;setFinaleSkip(false);stop();play('win');$('overlay').hidden=false;const next=$('finaleNext');if(next)next.hidden=window.turkeyTrotNextLevel===null;}
finaleSkip.addEventListener('click',endVictory);
function drawBarn(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);oval(0,7,92,17,'#5b7947');c.fillStyle='#b74331';c.fillRect(-82,-125,164,129);c.fillStyle='#f1d9a8';c.fillRect(-71,-112,142,8);c.fillStyle='#84432f';c.beginPath();c.moveTo(-102,-125);c.lineTo(0,-203);c.lineTo(102,-125);c.closePath();c.fill();c.fillStyle='#704431';c.fillRect(-40,-81,80,85);line(-36,-77,36,0,'#edc995',7);line(36,-77,-36,0,'#edc995',7);c.restore();}
function finaleScene(){
 const elapsed=t-finishAt;
 const u=Math.min(1,Math.max(0,elapsed));
 // A fixed riverside camera: the bank and barn never slide with the turkey.
 const sky=c.createLinearGradient(0,0,0,650);sky.addColorStop(0,'#a5d8d3');sky.addColorStop(1,'#e6d6a2');c.fillStyle=sky;c.fillRect(0,0,W,H);
 for(let i=0;i<11;i++){const x=i*112-30;oval(x,246+Math.sin(i*2)*16,72,115,i%2?'#85a76f':'#a5b777');}
 c.fillStyle='#729b60';c.fillRect(0,275,1000,375);
 // Water in foreground, a broad fixed landing bank, and a woodland road beyond.
 c.fillStyle='#3b8eaa';c.beginPath();c.moveTo(0,440);c.bezierCurveTo(290,410,570,475,1000,423);c.lineTo(1000,650);c.lineTo(0,650);c.fill();
 c.fillStyle='#bda177';c.beginPath();c.moveTo(430,280);c.lineTo(565,280);c.lineTo(735,445);c.lineTo(260,445);c.closePath();c.fill();
 c.fillStyle='#65934f';c.beginPath();c.moveTo(0,392);c.quadraticCurveTo(230,365,350,406);c.quadraticCurveTo(510,447,670,402);c.quadraticCurveTo(840,370,1000,401);c.lineTo(1000,465);c.quadraticCurveTo(500,520,0,460);c.closePath();c.fill();
 for(let i=0;i<8;i++){const x=60+i*135;oval(x,386,38,19,i%2?'#527d45':'#638d4c');oval(x-11,374,29,18,'#83a95c');}
 drawBarn(825,347,.46);
 for(let i=0;i<13;i++){const x=(i*89+Math.sin(t+i)*11)%1000;line(x,535+i*9,x+22,533+i*9,'#a4e0e5',2);}
 // 0-2.8 s: final leap from a foreground stone to the fixed dry bank.
 if(elapsed<2.8){
   const p=ease(Math.min(1,elapsed/2.35));
   oval(500,564,82,23,'#446f79');oval(500,543,74,22,'#748780');
   const x=lerp(500,520,p),y=lerp(500,389,p)-Math.sin(Math.PI*p)*120;
   turkey(x,y,lerp(1,.73,p),p>.76,t*11);
   if(elapsed>2.25)for(let i=0;i<9;i++)oval(520+(i-4)*12,425+Math.sin(t*8+i)*5,4,3,'#d8b477');
 }
 // 2.8-6.5 s: farmers attempt the same crossing; one slips and splashes.
 else if(elapsed<6.5){
   turkey(565,365,.76,true,t*8);
   const a=elapsed-2.8;
   farmer(285+Math.min(a,1.4)*75,433,1.08,'#4a6d8b',0,false);
   if(a<1.45)farmer(700-Math.min(a,1.45)*74,435,1.08,'#9b6949',1.7,false);
   else{
     const fall=Math.min(1,(a-1.45)/.9);
     c.save();c.translate(600,490+fall*70);c.rotate(Math.min(.7,fall*.7));farmer(0,0,1.04,'#9b6949',1.7,true);c.restore();
     if(a>2.05){for(let i=0;i<18;i++){const dx=(i-8.5)*10;oval(605+dx,560-Math.abs(Math.sin(t*7+i))*28,5,8,'#c3f0e8');}}
   }
 }
 // 6.5-13 s: the turkey spots a parked tractor, climbs aboard, and drives away.
 else{
  const drive=Math.max(0,Math.min(1,(elapsed-9.0)/3.7));
  const startX=710, tractorX=startX+drive*430;
  // The farmer who slipped climbs out of the shallow creek, soaked and dripping.
  const rise=ease(Math.max(0,Math.min(1,(elapsed-6.5)/1.7)));
  farmer(605,550-rise*108,1.02,'#9b6949',1.7,true);
  for(let i=0;i<8;i++)oval(580+i*8,480+rise*18+Math.sin(t*5+i)*8,3,7,'#a6e4eb');
  farmer(270,460,.9,'#4a6d8b',0,true);
  // Tractor remains on the dry path and its wheels rotate as it drives away.
  c.save();c.translate(tractorX,368);c.scale(.78,.78);
  oval(0,22,155,20,'#54774a');
  c.fillStyle='#bd6333';c.fillRect(-20,-78,115,61);c.fillStyle='#dc8c3f';c.fillRect(-139,-104,105,83);
  c.fillStyle='#567c56';c.fillRect(-124,-134,62,32);c.fillStyle='#f2d38e';c.fillRect(-114,-125,36,25);
  for(const [x,r] of [[-102,34],[75,39]]){oval(x,6,r,r,'#303a36');oval(x,6,r*.48,r*.48,'#aeb1a4');
   line(x,6,x+Math.cos(t*8)*r*.39,6+Math.sin(t*8)*r*.39,'#596b66',5);}
  for(let i=0;i<4;i++)oval(-32-drive*25-i*20,-118-i*10,10+i*3,7+i*2,'#e5e6d8');
  c.restore();
  if(elapsed<9){turkey(560+(710-560)*ease((elapsed-6.5)/2.5),376,.78,true,t*8);}
  else turkey(tractorX+4,292,.63,true,t*8);
  if(victorySoundStage<2&&!blocked&&elapsed>=9){victorySoundStage=2;play('gobble');}
  c.font='bold 30px system-ui';c.textAlign='center';c.fillStyle='#fff3c8';c.strokeStyle='#6e5336';c.lineWidth=4;
  c.strokeText('THE TURKEY DRIVES AWAY!',500,115);c.fillText('THE TURKEY DRIVES AWAY!',500,115);
 }
 if(elapsed>=13.1)endVictory();
}

function bounds(){return canvas.getBoundingClientRect();}
canvas.addEventListener('pointerdown',e=>{if(blocked||state!=='play')return;const r=bounds(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;const p=platforms[0];if(!p)return;const px=p.x+drift(p),py=p.y;const dx=(x-px)/(p.w*.55),dy=(y-py)/(p.h*.85);const miss=dx*dx+dy*dy>1;flight={fromX:supportedX(),fromY:LAND_Y,toX:miss?x:px,toY:miss?y:LAND_Y,target:p,start:t,duration:.9,miss};state='flight';play('jump');play('flap');});
function scenery(){const sky=c.createLinearGradient(0,0,0,650);sky.addColorStop(0,'#9ad5d5');sky.addColorStop(.5,'#c5e6c5');sky.addColorStop(1,'#78a66e');c.fillStyle=sky;c.fillRect(0,0,W,H);for(let i=0;i<12;i++){const x=i*103-30;oval(x,205+Math.sin(i)*23,86,130,i%2?'#7d9e69':'#a6b870');}c.fillStyle='#67945c';c.beginPath();c.moveTo(0,280);c.bezierCurveTo(180,238,270,300,350,270);c.bezierCurveTo(630,205,800,290,1000,245);c.lineTo(1000,650);c.lineTo(0,650);c.fill();
// Broad creek with gently curving natural banks.
c.fillStyle='#3d765b';c.beginPath();c.moveTo(350,235);c.bezierCurveTo(265,330,305,460,170,650);c.lineTo(870,650);c.bezierCurveTo(680,470,740,350,640,235);c.closePath();c.fill();const water=c.createLinearGradient(300,280,760,650);water.addColorStop(0,'#4aa4b5');water.addColorStop(.55,'#398db0');water.addColorStop(1,'#2c7c9c');c.fillStyle=water;c.beginPath();c.moveTo(362,245);c.bezierCurveTo(290,350,330,470,200,650);c.lineTo(835,650);c.bezierCurveTo(655,475,715,365,625,245);c.closePath();c.fill();
for(let i=0;i<24;i++){const z=(i*49+t*48+travel*.72)%440;const y=255+z,x=500+Math.sin(i*2.7+y*.008)*140;line(x-20,y,x+15,y-3,'#a3e7e3',1.5+z/300);}
for(const side of [-1,1]){for(let i=0;i<8;i++){const y=270+((i*55+travel*.36)%440),edge=side<0?330-(y-270)*.31:660+(y-270)*.31,x=edge+side*58;line(x,y+55,x+3,y-65,'#694b32',12+i*2);for(let j=0;j<5;j++){oval(x+(j-2)*19,y-69+Math.sin(j+i)*13,27,23,['#c98139','#e4a44a','#b85d35','#8c9d4b'][Math.abs(i+j)%4]);}for(let j=0;j<3;j++)oval(edge+side*(12+j*15),y+12+j*7,19,9,'#4d8655');}}
for(let i=0;i<12;i++){const x=(i*197)%1000,y=290+(i*71)%340;if(x>310&&x<715)continue;oval(x,y,9,6,'#e8b35c');oval(x+13,y-6,6,4,'#bd703c');}}
function drawPlatform(p,atY=p.y){const movement=drift(p),x=p.x+movement,y=atY,w=p.w;oval(x,y+19,w*.57,16,'#23687e');for(let k=0;k<3;k++)oval(x+(k-1)*w*.3,y+22,15,5,'#a7e4df');if(p.type==='log'){c.save();c.translate(x,y);c.rotate(Math.sin(t*1.4+p.phase)*.04);c.fillStyle='#805034';c.beginPath();c.roundRect(-w/2,-15,w,30,13);c.fill();c.strokeStyle='#ad7b4d';c.lineWidth=4;for(let k=-2;k<=2;k++)line(k*27,-11,k*27+9,10,'#b98c60',3);oval(-w/2+4,0,13,15,'#bd8a58');oval(-w/2+4,0,8,10,'#795034');c.restore();}else{c.fillStyle='#53675f';c.beginPath();c.moveTo(x-w*.53,y+7);c.lineTo(x-w*.42,y-13);c.lineTo(x-w*.16,y-23);c.lineTo(x+w*.32,y-20);c.lineTo(x+w*.54,y-4);c.lineTo(x+w*.47,y+14);c.lineTo(x-w*.3,y+19);c.closePath();c.fill();c.fillStyle='#83968b';c.beginPath();c.moveTo(x-w*.42,y-12);c.lineTo(x-w*.12,y-22);c.lineTo(x+w*.31,y-19);c.lineTo(x+w*.42,y-5);c.lineTo(x-w*.22,y+2);c.closePath();c.fill();oval(x-w*.27,y-12,16,6,'#77965a');oval(x+w*.23,y-13,12,5,'#6c8e55');line(x-w*.05,y-11,x+w*.18,y-2,'#5b7068',2);}}
function turkey(x,y,scale=1,front=false,flap=0){c.save();c.translate(x,y);c.scale(scale,scale);oval(0,29,38,9,'#285b70');for(let i=0;i<9;i++){const a=(-.91+i*.227);c.save();c.rotate(a);oval(0,-42,15,49,['#b85d32','#e59b42','#d27635','#e9bd5b'][i%4]);oval(0,-70,9,14,'#f0c36e');c.restore();}oval(0,-2,35,42,'#8b4d2e');for(const s of [-1,1]){c.save();c.translate(s*28,-7);c.rotate(s*(.23+Math.sin(flap)*.19));oval(s*7,7,16,28,'#a45f32');c.restore();}line(-15,28,-18,42,'#e49a37',7);line(15,28,18,42,'#e49a37',7);oval(0,-38,22,25,'#9e6139');if(front){oval(-9,-42,6,8,'#fff6e8');oval(9,-42,6,8,'#fff6e8');oval(-8,-42,3,5,'#282d24');oval(10,-42,3,5,'#282d24');c.fillStyle='#edac36';c.beginPath();c.moveTo(-12,-28);c.lineTo(12,-28);c.lineTo(0,-18);c.closePath();c.fill();}c.restore();}
// Wildlife is decorative and deliberately never participates in pointer hit-testing.
function fishJump(x,y,phase,size=1){const u=((t*.34+phase)%1+1)%1;if(u>.72)return;const a=u/.72,fx=x+Math.sin(phase*8)*18+35*a,fy=y-65*Math.sin(Math.PI*a);c.save();c.translate(fx,fy);c.rotate(-.25+.6*a);oval(0,0,14*size,6*size,'#c9dce0');oval(4*size,-2*size,8*size,3*size,'#e9f3e8');c.fillStyle='#96b9c6';c.beginPath();c.moveTo(-12*size,0);c.lineTo(-23*size,-9*size);c.lineTo(-23*size,9*size);c.closePath();c.fill();oval(8*size,-2*size,1.7*size,1.7*size,'#273f46');c.restore();if(a<.13||a>.87){for(let j=0;j<3;j++)oval(x+(j-1)*13,y+5,6,2,'#b3e8ed');}}
// Decorative bank bears: enter from cover, fish at the waterline, and leave.
// Each visit is time-based and anchored to a dry bank rather than the canopy.
function bearFishing(){
 const cycle=16, elapsed=((t+1.5)%cycle+cycle)%cycle;
 const side=Math.floor((t+1.5)/cycle)%2===0?-1:1;
 // Hide the bear between visits; alternate left and right riverbanks.
 if(elapsed>11.5)return;
 const enter=Math.max(0,Math.min(1,(elapsed-.35)/2.3));
 const leave=Math.max(0,Math.min(1,(elapsed-8.6)/2.2));
 const smooth=u=>u*u*(3-2*u);
 const bankX=side<0?245:755, coverX=side<0?78:922;
 const x=lerp(coverX,bankX,smooth(enter))+(coverX-bankX)*smooth(leave);
 const groundY=505+Math.sin(travel*.004)*5;
 const reaching=elapsed>=3.5&&elapsed<6.5;
 const fishHeld=elapsed>=5.6&&elapsed<10.8;
 const pawLift=reaching?Math.sin(Math.min(1,(elapsed-3.5)/2.1)*Math.PI)*26:0;
 const walk=(elapsed<3.1||elapsed>8.6)?Math.sin(t*9)*10:0;
 const facing=-side; // face the water on the inward side of each bank
 c.save();c.translate(x,groundY);c.scale(side<0?1:-1,1);
 // The contact shadow and feet are on the riverbank, never in the tree canopy.
 oval(0,4,48,10,'#466c48');
 for(const s of [-1,1]){
  line(s*22,-24,s*23+walk*s,0,'#69432f',16);
  oval(s*23+walk*s,0,17,8,'#65402d');
 }
 oval(0,-62,46,55,'#795039');
 oval(-24,-69,21,32,'#86573a');
 oval(22,-70,21,32,'#86573a');
 oval(0,-118,36,34,'#91603f');
 oval(-25,-142,12,13,'#795039');oval(25,-142,12,13,'#795039');
 oval(-25,-142,6,7,'#ad7b54');oval(25,-142,6,7,'#ad7b54');
 oval(5,-109,21,15,'#c7986b');oval(16,-112,5,4,'#332a24');
 oval(-10,-124,3.5,4.5,'#292823');oval(14,-124,3.5,4.5,'#292823');
 // The front paw reaches toward the creek, splashes, then lifts its catch.
 const pawX=56+(reaching?10:0),pawY=-71+(reaching?28:0)-pawLift;
 line(25,-87,pawX,pawY,'#86573a',19);oval(pawX,pawY,13,12,'#795039');
 if(reaching&&elapsed>4.2&&elapsed<5.6){
  for(let i=0;i<4;i++)oval(64+(i-1.5)*9,-26-Math.abs(Math.sin(t*7+i))*13,4,7,'#bce8df');
 }
 if(fishHeld){
  const wiggle=Math.sin(t*13)*3;
  c.save();c.translate(pawX+12,pawY-4+wiggle);c.rotate(-.3);
  oval(0,0,17,7,'#d7e7df');oval(5,-2,8,3,'#f7f5e9');
  c.fillStyle='#9ebcc3';c.beginPath();c.moveTo(-13,0);c.lineTo(-25,-10);c.lineTo(-25,10);c.closePath();c.fill();
  oval(11,-2,2,2,'#273f46');c.restore();
 }
 c.restore();
}
function farmer(x,y,scale,coat,phase,front=false,net=false){c.save();c.translate(x,y+Math.sin(t*10+phase)*4*scale);c.scale(scale,scale);const stride=Math.sin(t*10+phase);line(-12,18,-13+stride*13,56,'#4c3c32',12);line(12,18,12-stride*13,56,'#4c3c32',12);oval(-14+stride*13,58,13,6,'#46382f');oval(12-stride*13,58,13,6,'#46382f');c.fillStyle=coat;c.beginPath();c.roundRect(-27,-56,54,78,13);c.fill();c.fillStyle='#354d68';c.fillRect(-19,-42,12,61);c.fillRect(7,-42,12,61);oval(0,-76,23,27,'#e6b48c');oval(0,-99,34,9,'#775139');c.fillStyle='#8c633f';c.fillRect(-21,-118,42,20);line(-25,-35,-38+stride*5,8,'#e4b28a',12);line(25,-35,37-stride*5,6,'#e4b28a',12);if(front){oval(-9,-80,3,4,'#322d2a');oval(9,-80,3,4,'#322d2a');line(-7,-67,7,-67,'#70472f',2);}if(net){line(37-stride*5,6,72,-95,'#89613b',7);c.strokeStyle='#d2e3da';c.lineWidth=4;c.beginPath();c.ellipse(80,-113,31,36,-.2,0,Math.PI*2);c.stroke();for(let i=-2;i<=2;i++){line(58+i*9,-140,69+i*9,-86,'#c0d7cc',1);line(52,-116+i*10,107,-116+i*10,'#c0d7cc',1);}}else{line(37-stride*5,6,54,-119,'#7b5435',6);for(let k=-1;k<=1;k++)line(54+k*8,-119,54+k*8,-151,'#b5b8b5',4);line(46,-119,62,-119,'#b5b8b5',4);}c.restore();}
function bankChasers(){// Fixed to dry banks, outside all landing-platform hit areas.
 const d=Math.min(1,hop/20);farmer(87,515,1.05+d*.13,'#4a6d8b',0);farmer(912,516,1.04+d*.13,'#9b6949',1.7);
}
function creekWildlife(){if(state==='intro'||state==='play'||state==='flight'||state==='win'){fishJump(412,405,.14,.95);fishJump(630,493,.53,1.1);if(Math.sin(t*.26)>.0)bearFishing();}}
function capturedScene(){const e=t-failStart;const sky=c.createLinearGradient(0,0,0,650);sky.addColorStop(0,'#f6dcae');sky.addColorStop(1,'#d3a06c');c.fillStyle=sky;c.fillRect(0,0,1000,650);c.fillStyle='#95643d';c.fillRect(0,485,1000,165);c.fillStyle='#f2dfb3';c.fillRect(95,80,810,390);c.fillStyle='#a56a45';c.fillRect(160,315,680,185);c.fillStyle='#f8e9c6';c.fillRect(173,312,654,30);for(let k=0;k<4;k++)oval(270+k*150,338,42,12,'#e6f0e7');oval(500,315,125,34,'#e6e1cf');oval(500,291,95,48,'#b66a37');oval(425,306,36,19,'#d28b49');oval(575,306,36,19,'#d28b49');for(let k=0;k<8;k++)oval(420+k*22,319+Math.sin(k)*6,9,5,k%2?'#dca742':'#66924b');farmer(135,425,1.55,'#4a6d8b',0,true);farmer(865,425,1.55,'#9b6949',1.7,true);c.font='bold 43px system-ui';c.textAlign='center';c.fillStyle='#6b3d27';c.fillText('Thanksgiving Dinner!',500,85);}
function catchScene(){const e=t-failStart;scenery();bankChasers();if(e<1.7){for(const p of particles){if(!blocked){p.x+=p.vx*.016;p.y+=p.vy*.016;p.vy+=7;p.life-=.018;}if(p.life>0)oval(p.x,p.y,6,7,'#c4f4e8');}turkey(500,570+Math.sin(t*5)*5,.8,true,t*6);}else{const u=Math.min(1,(e-1.7)/2.1);farmer(820-210*u,490,1.25,'#9b6949',1,true,true);farmer(165+155*u,500,1.15,'#4a6d8b',0,true);turkey(500+u*50,565-u*110,.85,true,t*5);}}
function frame(ms){
 const dt=last?Math.min(.04,(ms-last)/1000):0;last=ms;if(!blocked)t+=dt;
 // During every jump the river moves toward the viewer, taking both rocks with it.
 let q=0,shift=0;
 if(state==='flight'&&flight){q=Math.min(1,(t-flight.start)/flight.duration);shift=ease(q)*STEP;if(!blocked)travel+=STEP*dt/flight.duration;}
 else if(state==='play'&&!blocked)travel+=dt*8;
 if(state==='caught'){voiceTick();if(t-failStart<4.2)catchScene();else capturedScene();if(t-failStart>7.5)$('overlay').hidden=false;requestAnimationFrame(frame);return;}
 if(state==='win'){voiceTick();tractorAudioTick();finaleScene();requestAnimationFrame(frame);return;}
 scenery();creekWildlife();bankChasers();
 // The support remains under the feet while standing, even on a drifting log.
 if(state==='flight'&&flight){drawPlatform(current,LAND_Y+shift);drawPlatform(flight.target,FAR_Y+shift);}
 else{drawPlatform(current,LAND_Y);for(const p of platforms)drawPlatform(p);}
 if(state==='intro'){
  opening+=blocked?0:dt;voiceTick();turkey(supportedX(),LAND_Y-39,1,false,t*9);
  c.font='bold 25px system-ui';c.fillStyle='#fff8df';c.textAlign='center';
  c.fillText(opening<1.5?'The turkey escapes the hollow oak...':'The farmers are coming! Hop across!',500,105);
  if(opening>3.3){state='play';play('gobble');}
 }else if(state==='play'){
  turkey(supportedX(),LAND_Y-39,1,false,t*10);
 }else if(state==='flight'&&flight){
  const e=ease(q),x=lerp(flight.fromX,flight.toX,e),baseY=lerp(LAND_Y,flight.miss?flight.toY:LAND_Y,e);
  const lift=Math.sin(q*Math.PI)*125;
  turkey(x,baseY-39-lift,1-.1*Math.sin(q*Math.PI),false,t*15);
  if(q>=1){
   if(flight.miss){state='splash';splashAt=t;play('splash');for(let i=0;i<36;i++)particles.push({x:flight.toX,y:flight.toY,vx:(rnd(i+8)-.5)*300,vy:-rnd(i+37)*230-40,life:1});}
   else{current={...flight.target,x:flight.toX-drift(flight.target),y:LAND_Y};hop++;play('land');if(hop>=hopGoal)finish(true);else{next();state='play';}}
   flight=null;
  }
 }else if(state==='splash'){
  for(const p of particles){if(blocked)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=480*dt;p.life-=dt*1.5;oval(p.x,p.y,5,7,'#c4f4e8');}
  particles=particles.filter(p=>p.life>0);if(t-splashAt>1.25){state='caught';failStart=t;stop();play('fail');$('heading').textContent='The farmers caught up!';$('description').textContent='One missed jump ends the round. Try again!';$('start').textContent='Try Again';$('overlay').hidden=true;}
 }
 requestAnimationFrame(frame);
}requestAnimationFrame(frame);

fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(s=>{const n=Number(s.turkeyTrotLevel3Count);if(Number.isInteger(n)&&n>=3&&n<=20)hopGoal=n;next();}).catch(()=>{});
})();
