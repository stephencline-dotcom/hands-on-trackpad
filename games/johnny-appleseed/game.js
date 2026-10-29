(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('farm'),ctx=canvas.getContext('2d'),tools=$('tools');
const W=1280,H=760,spots=[{x:355,y:500},{x:690,y:535},{x:1000,y:480}];
let stage=[0,0,0],selected='shovel',started=false,complete=false,now=0,last=0,helpAt=0,helpUntil=0,particles=[],sound=true,paused=false,dragMode=false,voice=false,guide=null;
let active=0,showHelp=false,fx=145,fy=510,walk=0,blink=0,cloud=0;
const supplySites=[{x:295,y:343,name:'shovel'},{x:110,y:455,name:'seeds'},{x:1160,y:405,name:'soil'},{x:1165,y:565,name:'water'}];
let carrying=null,walkTarget=null,walkAction=null,working=false,workTime=0,workSpot=-1,taskTool=null;
let cursorTarget=null,dragHeld=false,walkingNow=false,guidePulse=0;
let soilLoads=0,soilCart={x:1030,y:375},soilCartActive=false,actionKind='',cartWheelAngle=0,cartFacing=1;
let loadingStartedAt=0,showDemoUntil=0;
let birdsEnabled=true,birdDelay=7,birds=[],birdNextAt=0,birdWarningAt=0,birdEscapes=0,birdVisits=0,shooUntil=0;
const phase=()=>Math.min(4,...stage);
const phaseDone=()=>stage.every(v=>v===phase());
const nextPlot=()=>spots.findIndex((p,i)=>stage[i]===phase());
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function startWalk(x,y,fn){cursorTarget=null;walkTarget={x,y};walkAction=fn;working=false;guidePulse=now+1.5}
const labels=['Shovel','Seeds','Soil','Water'];
const messages=['Dig all three holes.','Plant seeds in all three holes.','Fill the wheelbarrow, then cover every seed.','Water all three spots.'];
function pickMessage(){return phase()===4?'Wonderful! Three little apple trees are growing!':messages[phase()]}
function guideMessage(){if(birds.some(b=>b.mode==='peck'))return 'Quick! Move Johnny close to the blackbird to shoo it away!';if(working)return 'Johnny is working! Watch what happens.';if(walkTarget)return 'Johnny is on his way!';if(carrying){if(carrying==='soil'&&!soilLoads)return 'Fill the wheelbarrow with soil!';return `Click an unfinished planting spot! (${stage.filter(v=>v>phase()).length} done)`}return `Click the glowing ${labels[phase()]} in the orchard!`}
function guideHint(){const k=phase();if(k===4)return;const p=supplySites[k];$('message').textContent=carrying?guideMessage():`Click the glowing ${labels[k]}! Then visit each planting spot.`;helpUntil=now+4;guide?.play?.('click');if(p&&!carrying)for(let j=0;j<16;j++)particles.push({x:p.x+(Math.random()-.5)*40,y:p.y+(Math.random()-.5)*30,r:4,color:'#ffe57e',life:1})}
function say(t){if(!voice||!sound||!started||!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.92;u.volume=.7;window.speechSynthesis.speak(u)}
function chirp(f=600,d=.1){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;const a=window._johnnyAudio||(window._johnnyAudio=new A());if(a.state==='suspended')a.resume();const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(f,a.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.35,a.currentTime+d);g.gain.setValueAtTime(.035,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function oval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function line(points,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()}
function tree(x,y,s=1,apples=false){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(0,18,72,20,'#487c3e66');rounded(-15,-92,30,105,10,'#8a5939');for(let [dx,dy,r,c] of [[-54,-105,56,'#448c49'],[40,-115,59,'#4e9b51'],[-5,-155,66,'#5db65d'],[7,-123,56,'#65bb61']])circle(dx,dy,r,c);if(apples)for(let [dx,dy] of [[-55,-115],[35,-148],[-5,-175],[55,-103],[-28,-82],[5,-115]]){circle(dx,dy,12,'#d94035');circle(dx+3,dy-4,3,'#fff2bf');line([[dx,dy-10],[dx+3,dy-18]],'#72512b',3)}ctx.restore()}
function johnny(x,y,t){
 const shooing=now<shooUntil;
 const digging=working&&taskTool==='shovel'&&actionKind==='plant';
 const loading=working&&actionKind==='load';
 const pushing=soilCartActive;
 const stride=walkingNow?Math.sin(t*15)*10:0;
 const digMotion=(digging||loading)?Math.sin(t*13):0;
 ctx.save();
 ctx.translate(x,y+(walkingNow?Math.sin(t*15)*2:Math.sin(t*2)*2));
 oval(0,29,31,10,'#4d714266');
 line([[-11,7],[-14+stride,30]],'#6a4836',9);
 line([[11,7],[14-stride,30]],'#6a4836',9);
 rounded(-22,-37,44,48,13,'#4477a0');
 rounded(-11,-28,22,37,5,'#e1bc62');
 // Exactly one pair of arms, selected by Johnny's current activity.
 if(shooing){
  const wave=Math.sin(now*24)*11;
  line([[-22,-25],[-35,-57+wave],[-43,-72+wave]],'#edbd8f',10);
  line([[22,-25],[35,-57-wave],[43,-72-wave]],'#edbd8f',10);
 }else if(digging||loading){
  // Both hands stay on one shovel shaft through the digging stroke.
  const hx=20+digMotion*6,hy=-10+digMotion*7;
  line([[-22,-25],[hx-6,hy-7]],'#edbd8f',10);
  line([[22,-25],[hx+2,hy+3]],'#edbd8f',10);
  line([[hx+1,hy-20],[hx+11,25+digMotion*11]],'#865735',7);
  ctx.save();ctx.translate(hx+12,30+digMotion*11);ctx.rotate(-.18+digMotion*.16);
  oval(0,0,14,8,'#a1afb6');ctx.restore();
  if(digMotion>.65){for(let i=0;i<3;i++)circle(hx+18+i*7,27-i*4,3,'#aa794d')}
 }else if(pushing){
  // Handles end near Johnny's leading hand; both arms reach forward.
  const d=cartFacing;
  line([[-22,-25],[d*15,-16]],'#edbd8f',9);
  line([[22,-25],[d*17,-7]],'#edbd8f',9);
 }else{
  line([[-22,-25],[-34,-6+stride*.3]],'#edbd8f',10);
  line([[22,-25],[32,-7-stride*.3]],'#edbd8f',10);
 }
 circle(0,-55,24,'#f3c596');
 oval(0,-81,35,8,'#8b939a');rounded(-20,-110,40,32,5,'#9ba3aa');
 if(Math.sin(t*1.4)>-.98){circle(-8,-57,3,'#3b433b');circle(9,-57,3,'#3b433b')}
 else{line([[-11,-57],[-5,-57]],'#3b433b',2);line([[6,-57],[12,-57]],'#3b433b',2)}
 line([[-6,-46],[5,-45]],'#a9614e',2);
 if(carrying&&!pushing&&!digging&&!loading){
  circle(38,-14,13,'#ffdf8a');ctx.font='24px sans-serif';
  ctx.fillText(({shovel:'🪏',seeds:'🌰',soil:'🟫',water:'💧'})[carrying],25,-12);
 }
 ctx.restore();
}
function draw(){let t=now;ctx.clearRect(0,0,W,H);const sky=ctx.createLinearGradient(0,0,0,390);sky.addColorStop(0,'#b7e8f4');sky.addColorStop(1,'#e6f7dc');ctx.fillStyle=sky;ctx.fillRect(0,0,W,385);circle(1120,104,49,'#ffe58e');for(let i=0;i<5;i++){let x=(i*330+70+Math.sin(t*.09+i)*22)%1400;oval(x,105+i%3*55,62,19,'#ffffffcc');oval(x-25,96+i%3*55,33,22,'#ffffffcc')}ctx.fillStyle='#8fb990';ctx.beginPath();ctx.moveTo(0,355);ctx.quadraticCurveTo(220,170,450,343);ctx.quadraticCurveTo(730,170,1000,328);ctx.quadraticCurveTo(1140,210,1280,292);ctx.lineTo(1280,760);ctx.lineTo(0,760);ctx.fill();ctx.fillStyle='#9dcb7b';ctx.fillRect(0,365,W,395);ctx.fillStyle='#b2d78b';ctx.beginPath();ctx.moveTo(0,545);ctx.quadraticCurveTo(330,430,650,540);ctx.quadraticCurveTo(980,430,1280,525);ctx.lineTo(1280,760);ctx.lineTo(0,760);ctx.fill();
// winding orchard walkway
line([[0,684],[180,665],[350,635],[565,652],[820,610],[1100,630],[1280,670]],'#c39c63',78);line([[0,684],[180,665],[350,635],[565,652],[820,610],[1100,630],[1280,670]],'#f3dfb3',65);
// far fence
for(let x=0;x<1280;x+=55){rounded(x,349,8,46,2,'#f7e7bd')}rounded(0,363,1280,8,3,'#f5e6b8');rounded(0,382,1280,7,3,'#f5e6b8');
// little shed
rounded(45,284,182,134,8,'#d77750');ctx.fillStyle='#8f4a3a';ctx.beginPath();ctx.moveTo(29,298);ctx.lineTo(135,225);ctx.lineTo(242,298);ctx.fill();rounded(111,334,53,84,9,'#7e513a');rounded(68,318,25,29,3,'#f8e7ad');rounded(180,318,25,29,3,'#f8e7ad');
// trees and orchard details
for(let [x,y,s] of [[288,330,.68],[580,360,.55],[945,350,.66],[1190,408,.75]])tree(x,y,s,true);
for(let i=0;i<110;i++){let x=(i*149+33)%1280,y=400+(i*73)%340;if(spots.some(p=>Math.hypot(x-p.x,y-p.y)<90))continue;circle(x,y,2.5,i%3?'#f7e9b5':'#ffffff');if(i%4===0){circle(x-3,y,3,'#e899a6');circle(x+3,y,3,'#e899a6')}}
// Orchard supplies live in the scene, not in a bottom toolbar.
const propGlow=(x,y)=>{ctx.save();ctx.strokeStyle='#ffe27b';ctx.lineWidth=5;ctx.setLineDash([11,8]);ctx.beginPath();ctx.ellipse(x,y,46+Math.sin(t*3)*3,35+Math.sin(t*3)*2,0,0,Math.PI*2);ctx.stroke();ctx.restore()};
function drawSupply(s){const x=s.x,y=s.y;ctx.save();oval(x,y+19,49,13,'#365d3850');if(s.name==='shovel'){line([[x-24,y+18],[x+17,y-45]],'#865336',11);ctx.fillStyle='#9aa8b0';ctx.beginPath();ctx.moveTo(x-36,y+20);ctx.lineTo(x-10,y+34);ctx.lineTo(x+2,y+8);ctx.closePath();ctx.fill();line([[x+8,y-45],[x+28,y-52],[x+32,y-37]],'#875d38',7)}else if(s.name==='seeds'){rounded(x-37,y-25,74,58,15,'#b68a4c');rounded(x-31,y-20,62,11,5,'#ead1a0');for(let j=0;j<8;j++)oval(x-22+j*6,y-18-(j%3)*3,4,6,'#875b35');ctx.font='bold 14px sans-serif';ctx.fillStyle='#fff3d1';ctx.fillText('SEEDS',x-26,y+17)}else if(s.name==='soil'){oval(x,y+13,68,21,'#70432c');for(let j=0;j<5;j++)oval(x-43+j*21,y-5-(j%2)*10,25,15,j%2?'#94603a':'#82502f');for(let j=0;j<12;j++)circle(x-52+j*9,y+7+(j%3)*3,3,'#c18b55')}else{rounded(x-27,y-16,54,46,8,'#3d9fcb');ctx.strokeStyle='#2d7d9c';ctx.lineWidth=9;ctx.beginPath();ctx.arc(x+29,y-5,20,-1.3,1.4);ctx.stroke();ctx.fillStyle='#62c2e7';ctx.beginPath();ctx.moveTo(x-27,y-10);ctx.lineTo(x-50,y-30);ctx.lineTo(x-40,y-38);ctx.lineTo(x-13,y-18);ctx.fill();for(let j=0;j<4;j++)circle(x-52-j*7,y-28+j*5,3,'#81d4fa')}
ctx.restore()}
let needed=phase()<4?labels[phase()].toLowerCase():null;
for(const s of supplySites){if(s.name!==carrying || s.name==='soil')drawSupply(s);if(!carrying&&!walkTarget&&!working&&s.name===needed)propGlow(s.x,s.y)}
// butterflies and a small moving leaf layer
for(let i=0;i<4;i++){let bx=200+i*260+Math.sin(t*.8+i)*55,by=410+i%2*115+Math.cos(t*1.3+i)*17;oval(bx-6,by,9,5,'#f8a5c7');oval(bx+6,by,9,5,'#e68ac0');circle(bx,by,3,'#614d47')}
// planting plots
spots.forEach((p,i)=>{const st=stage[i];oval(p.x,p.y+13,100,36,'#69945555');oval(p.x,p.y,91,40,st===0?'#b8a16e':'#97693f');oval(p.x,p.y-3,75,28,st===0?'#cba976':'#70472f');if(st===1){oval(p.x,p.y,46,19,'#503322');circle(p.x,p.y+2,7,'#3c271d')}if(st===2){oval(p.x,p.y,46,20,'#5a3824');oval(p.x,p.y+1,12,5,'#b58a4c')}if(st>=4){let growth=1;line([[p.x,p.y+2],[p.x,p.y-72*growth]],'#4a8d40',9);oval(p.x-17,p.y-42*growth,26*growth,12*growth,'#4ca853');oval(p.x+19,p.y-59*growth,28*growth,13*growth,'#5fb45d');if(st===4){circle(p.x,p.y-78,14,'#78bf61');for(let j=0;j<7;j++)circle(p.x+Math.cos(j*6.28/7)*27,p.y-85+Math.sin(j*6.28/7)*21,7,'#68b862')}}if(st===phase()&&st<4){ctx.strokeStyle='#ffe16c';ctx.lineWidth=5;ctx.setLineDash([10,8]);ctx.beginPath();ctx.ellipse(p.x,p.y,100+Math.sin(t*3+i)*4,50+Math.sin(t*3+i)*3,0,0,6.283);ctx.stroke();ctx.setLineDash([])}else{circle(p.x+65,p.y-45,17,'#fbe7a4');ctx.fillStyle='#4c874c';ctx.font='bold 22px sans-serif';ctx.fillText('✓',p.x+55,p.y-37)}});
// A blackbird can only take an uncovered seed; a covered seed is safe.
for(const bird of birds){
 const p=spots[bird.spot];let bx=bird.x,by=bird.y;
 ctx.save();ctx.translate(bx,by);const flap=Math.sin(now*17)*10;
 oval(0,17,26,7,'#38553855');
 if(bird.mode==='flee'){ctx.rotate(-.12);by-=5}
 oval(-13,-9+flap*.35,18,9,'#283139');oval(12,-9-flap*.35,18,9,'#263039');
 oval(0,-5,18,14,'#171d25');circle(12,-17,11,'#1c242c');circle(16,-19,3,'#f5e7c3');circle(17,-19,1.3,'#161b20');
 ctx.fillStyle='#e8ae38';ctx.beginPath();ctx.moveTo(21,-15);ctx.lineTo(35,-12);ctx.lineTo(21,-9);ctx.fill();
 if(bird.mode==='flee'&&bird.stole){oval(29,-7,6,3,'#c6a071')}
 ctx.restore();
 if(bird.mode==='peck'){
  ctx.strokeStyle='#ffe36a';ctx.lineWidth=4;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(bx,by,37+Math.sin(now*5)*4,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 }
}
// The parked wheelbarrow is beside (not under) the soil pile.
// The moving wheelbarrow is drawn after Johnny so its handles meet his hands.
function drawWheelbarrow(x,y,active){
 const tipping=active&&working&&taskTool==='soil'&&actionKind==='plant';
 const tipProgress=tipping?Math.max(0,Math.min(1,(workTime-now)/1.5)):1;
 const tip=tipping?Math.sin(tipProgress*Math.PI)*0.72:0;
 const dir=active?cartFacing:1;
 ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
 oval(4,31,83,12,'#496a3950');
 // Wheel and sturdy support legs, independent of the tilting tray.
 circle(45,24,21,'#283e43');circle(45,24,15,'#455b5c');circle(45,24,7,'#c8c9bb');
 if(active){ctx.save();ctx.translate(45,24);ctx.rotate(cartWheelAngle);for(let i=0;i<6;i++){let a=i*Math.PI/3;line([[0,0],[Math.cos(a)*14,Math.sin(a)*14]],'#b8c4bd',2)}ctx.restore()}
 line([[-39,11],[-48,37]],'#79502e',6);line([[-38,12],[45,24]],'#76502d',6);
 // Two long handles point toward Johnny, who stands behind the barrow.
 line([[-31,-6],[-77,-12]],'#83502c',7);line([[-32,2],[-76,7]],'#a46a3a',6);
 rounded(-84,-16,17,8,4,'#d0a06b');rounded(-84,3,17,8,4,'#d0a06b');
 // A true sideways profile with a deep tapered tray, tipped at the seed hole.
 ctx.save();ctx.translate(8,-4);ctx.rotate(tip);
 ctx.fillStyle='#9b582e';ctx.strokeStyle='#774222';ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(-45,-35);ctx.lineTo(54,-35);ctx.lineTo(42,8);ctx.lineTo(-32,8);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#d59250';ctx.beginPath();ctx.moveTo(-39,-30);ctx.lineTo(48,-30);ctx.lineTo(36,3);ctx.lineTo(-27,3);ctx.closePath();ctx.fill();
 line([[-43,-35],[54,-35]],'#f0c18a',5);
 for(let i=0;i<4;i++)line([[-20+i*19,-27],[-15+i*16,2]],'#ac6d3d',2);
 const visibleLoads=(!active&&working&&actionKind==='load')?Math.min(3,Math.max(0,(now-loadingStartedAt)/1.05)):soilLoads;
 if(visibleLoads>0){
  ctx.fillStyle='#70452d';ctx.beginPath();ctx.moveTo(-34,-28);ctx.quadraticCurveTo(2,-47-visibleLoads*2,44,-28);ctx.lineTo(35,-12);ctx.lineTo(-26,-12);ctx.closePath();ctx.fill();
  for(let i=0;i<Math.floor(visibleLoads*6);i++)circle(-27+(i*13)%64,-25-(i%3)*3,3,i%2?'#a77548':'#885632');
 }
 ctx.restore();
 if(!active&&working&&actionKind==='load'){
  // Three visible shovel trips: soil travels from the pile into the tray.
  const elapsed=now-loadingStartedAt;
  for(let scoop=0;scoop<3;scoop++){
   const u=(elapsed-scoop*1.05)/1.05;
   if(u>=0.22&&u<0.95){
    const f=(u-.22)/.73;
    const sx=(supplySites[2].x-x-25)* (1-f) + 2*f;
    const sy=(supplySites[2].y-y-2)*(1-f) + (-43)*f-20*Math.sin(Math.PI*f);
    for(let j=0;j<6;j++)circle(sx+(j%3-1)*5,sy+Math.floor(j/3)*5,3.3,j%2?"#8c5936":"#ad7947");
   }
  }
 }
 if(tipping){
  const amount=Math.sin(tipProgress*Math.PI);
  const p=spots[workSpot];
  if(p)for(let i=0;i<14;i++){
   const f=((i/14+now*1.4)%1);
   const startX=x+dir*62,startY=y-28;
   // Particle path ends at the exact center of the planting hole.
   const sx=startX+(p.x-startX)*f,sy=startY+(p.y-startY)*f*f;
   ctx.save();ctx.scale(dir,1);ctx.restore();
   // Already inside the cart's local coordinate system.
   circle((sx-x)*dir,(sy-y)+Math.sin(i*13)*2,2+amount*3,i%2?'#a16d43':'#82512f');
  }

 }
 ctx.restore();
}
// bees and butterflies
for(let i=0;i<3;i++){let x=290+i*360+Math.sin(t*(.8+i*.15)+i)*38,y=285+Math.cos(t*1.5+i)*25;oval(x,y,11,7,'#edc84e');oval(x-5,y-8,9,5,'#fff8e9cc');oval(x+5,y-8,9,5,'#fff8e9cc')}
// Johnny walks near selected planting spot
walkingNow=false;
if(walkTarget){const dx=walkTarget.x-fx,dy=walkTarget.y-fy,d=Math.hypot(dx,dy),step=Math.min(d,5.3);if(d>1){fx+=dx/d*step;fy+=dy/d*step;walkingNow=true}if(d<=6){fx=walkTarget.x;fy=walkTarget.y;const cb=walkAction;walkTarget=null;walkAction=null;cb?.()}}
else if(cursorTarget&&started&&!complete&&!working){const dx=cursorTarget.x-fx,dy=cursorTarget.y-fy,d=Math.hypot(dx,dy);if(d>22){const step=Math.min(d-22,3.8);fx+=dx/d*step;fy+=dy/d*step;walkingNow=true}}
if(soilCartActive&&walkingNow){
 cartWheelAngle+=0.16;
 // Only change facing on meaningful horizontal movement.
 if(walkTarget&&actionKind!=='soil-delivery'&&Math.abs(walkTarget.x-fx)>25)cartFacing=walkTarget.x>=fx?1:-1;
 else if(!walkTarget&&cursorTarget&&Math.abs(cursorTarget.x-fx)>30)cartFacing=cursorTarget.x>=fx?1:-1;
}
if(soilCartActive){
 const dir=cartFacing;
 const cartX=fx+dir*91,cartY=fy+7;
 drawWheelbarrow(cartX,cartY,true);
 }else drawWheelbarrow(soilCart.x,soilCart.y,false);
// Draw Johnny last so his face, hands and hat are never obscured by the parked cart.
johnny(fx,fy,t);
// The Eyes button demonstrates the soil-to-wheelbarrow route without changing progress.
if(showDemoUntil>now&&phase()===2){
 const elapsed=4.8-(showDemoUntil-now);
 const f=(elapsed%1.6)/1.6;
 const from=supplySites[2],to={x:soilCart.x+8,y:soilCart.y-38};
 const px=from.x+(to.x-from.x)*f,py=from.y-18+(to.y- (from.y-18))*f-15*Math.sin(Math.PI*f);
 ctx.save();ctx.strokeStyle="#ffe478";ctx.lineWidth=5;ctx.setLineDash([9,7]);ctx.beginPath();ctx.moveTo(from.x,from.y-18);ctx.quadraticCurveTo((from.x+to.x)/2,from.y-105,to.x,to.y);ctx.stroke();ctx.setLineDash([]);circle(px,py,13,"#fff1a2");ctx.font="bold 24px sans-serif";ctx.fillStyle="#425d37";ctx.fillText("➜",px-10,py+8);ctx.restore();
}
// Action indicator follows Johnny's actual feet; never points at an unrelated tree.
if(started&&!complete&&walkTarget){ctx.save();ctx.strokeStyle='#ffe27b';ctx.lineWidth=4;ctx.setLineDash([7,7]);ctx.beginPath();ctx.ellipse(fx,fy+26,37,13,0,0,Math.PI*2);ctx.stroke();ctx.restore()}

for(let p of particles){circle(p.x,p.y,p.r,p.color)}
}
function updateTools(){tools.innerHTML='';}
function refresh(){
 active=Math.max(0,nextPlot());
 $('message').textContent=complete?'Wonderful! Your orchard is growing!':guideMessage();
 $('count').textContent=`${stage.filter(v=>v===4).length} / 3`;
 if(!complete&&stage.every(v=>v===4)){
  complete=true;
  setTimeout(()=>{if(!started)return;$('overlay').hidden=false;$('overlayTitle').textContent='Wonderful, gardener!';$('overlayCopy').textContent='You dug three holes, planted three seeds, brought soil in the wheelbarrow, and watered your orchard!';$('start').textContent='Go to Level 2';$('overlayKicker').textContent='PLANTING DAY COMPLETE';},950);
 }
}
function interact(x,y){
 if(!started||paused||complete||walkTarget||working)return;
 const k=phase();if(k>=4)return;
 const needed=labels[k].toLowerCase();
 if(!carrying){
  const s=supplySites.find(p=>Math.hypot(x-p.x,y-p.y)<92);
  if(!s||s.name!==needed){guideHint();chirp(245,.09);return}
  startWalk(s.name==='soil'?s.x-67:s.x-20,s.name==='soil'?s.y+28:s.y+16,()=>{
   carrying=s.name;
   chirp(540,.13);
   for(let j=0;j<12;j++)particles.push({x:s.x+(Math.random()-.5)*42,y:s.y+(Math.random()-.5)*28,r:3,color:'#ffe27b',life:1});
   if(s.name==='soil'){
    // Johnny loads three scoops before pushing the wheelbarrow.
    working=true;loadingStartedAt=now;workTime=now+3.15;actionKind='load';soilCartActive=false;soilLoads=0;
    $('message').textContent='Johnny is shoveling soil into the wheelbarrow!';
   }else $('message').textContent=`Johnny has the ${labels[k]}! Visit all three glowing spots.`;
   guide?.play?.('click');
  });
  $('message').textContent=`Johnny is walking to the ${labels[k]}!`;
  return;
 }
 const i=spots.findIndex(p=>Math.hypot(x-p.x,y-p.y)<128);
 if(i<0||stage[i]!==k){$('message').textContent='Choose a glowing unfinished spot!';chirp(245,.08);return}
 const used=carrying;
 // Approach from the side Johnny is already on. The tray always tips toward the seed.
 if(used==='soil'){cartFacing=fx<=spots[i].x?1:-1;actionKind='soil-delivery';}
 const soilStandX=spots[i].x-cartFacing*153;
 startWalk(used==='soil'?soilStandX:spots[i].x-32,used==='soil'?spots[i].y+24:spots[i].y-20,()=>{
  working=true;workTime=now+(used==='soil'?1.5:1.1);workSpot=i;taskTool=used;actionKind='plant';
  if(used==='soil')soilCartActive=true;
  $('message').textContent=used==='shovel'?'Johnny is digging the hole!':used==='soil'?'Johnny is tipping the wheelbarrow to cover the seed!':`Johnny is using the ${used}!`;
 });
 $('message').textContent='Johnny is walking to the planting spot!';
}
function finishWork(){
 if(!working||now<workTime)return;
 working=false;
 if(actionKind==='load'){
  soilLoads=3;actionKind='';
  // Loading is complete: Johnny walks to the cart handles before pushing.
  startWalk(soilCart.x-91,soilCart.y+17,()=>{
   soilCartActive=true;
   $('message').textContent='The wheelbarrow is full! Push it to each glowing hole.';
  });
  $('message').textContent='Johnny is putting down the shovel and walking to the wheelbarrow!';
  return;
 }
 const i=workSpot;workSpot=-1;if(i<0)return;
 const oldPhase=phase();stage[i]++;
 if(taskTool==='soil')soilLoads=Math.max(0,soilLoads-1);
 if(taskTool==='seeds'&&birdsEnabled&&birdNextAt<=now)birdNextAt=now+1.5;
 chirp(540+stage[i]*90,.16);
 for(let j=0;j<20;j++){let a=j*2.4;particles.push({x:spots[i].x+Math.cos(a)*Math.random()*42,y:spots[i].y+Math.sin(a)*Math.random()*28,r:2+Math.random()*4,color:j%2?'#ffe78a':'#f9f7e2',life:1})}
 if(phase()!==oldPhase){
  carrying=null;soilCartActive=false;soilLoads=0;
  $('message').textContent=phase()===4?'Wonderful! The orchard is growing!':`Great job! Now ${messages[phase()]}`;
  for(let j=0;j<30;j++)particles.push({x:spots[1].x+(Math.random()-.5)*250,y:spots[1].y+(Math.random()-.5)*90,r:3,color:'#ffe47c',life:1});
 }else{
  $('message').textContent=`Great! ${stage.filter(v=>v>oldPhase).length} of 3 finished. Keep using the ${labels[oldPhase]}!`;
 }
 refresh();say(pickMessage());helpAt=now;actionKind='';
}
// The canvas uses object-fit: contain. Pointer coordinates must account for
// the blank letterbox bands, otherwise visible tools miss their hit targets.
function updateBlackbird(dt){
 if(!started||complete||!birdsEnabled){birds=[];return}
 // A maximum of three visits during Planting Day; never more than two birds at once.
 const eligible=spots.map((p,i)=>stage[i]===2&&!birds.some(b=>b.spot===i)?i:-1).filter(i=>i>=0);
 if(birdVisits<3&&birds.length<2&&eligible.length&&now>=birdNextAt){
  const i=eligible[Math.floor(Math.random()*eligible.length)];
  birds.push({spot:i,x:spots[i].x+130,y:spots[i].y-135,mode:'approach',arrivedAt:0,stole:false});
  birdVisits++;
  birdNextAt=now+Math.max(5,birdDelay*.7);
 }
 for(const b of birds){
  const p=spots[b.spot];
  if(b.mode==='approach'){
   if(stage[b.spot]!==2){b.mode='flee';continue}
   const dx=p.x-b.x,dy=p.y-28-b.y,d=Math.hypot(dx,dy);
   if(d<8){b.mode='peck';b.arrivedAt=now;$('message').textContent='A blackbird is after the seed! Move Johnny close to shoo it away!'}
   else{b.x+=dx/d*Math.min(d,dt*155);b.y+=dy/d*Math.min(d,dt*155)}
  }else if(b.mode==='peck'){
   if(Math.hypot(fx-b.x,fy-b.y)<110){
    b.mode='flee';b.stole=false;shooUntil=now+1.2;chirp(850,.15);
    $('message').textContent='Shoo! Johnny saved the seed!';
   }else if(stage[b.spot]!==2){b.mode='flee';b.stole=false}
   else if(now-b.arrivedAt>=birdDelay){
    stage[b.spot]=1;b.mode='flee';b.stole=true;birdEscapes++;
    carrying=null;cursorTarget=null;
    soilCartActive=false;soilLoads=0;workSpot=-1;actionKind='';
    $('message').textContent='The blackbird flew away with a seed! Visit the seed sack and replant that hole.';helpAt=now;
    chirp(235,.2);
   }
  }else if(b.mode==='flee'){
   b.x+=dt*175;b.y-=dt*180;
  }
 }
 birds=birds.filter(b=>b.mode!=='flee'||(b.y>=145&&b.x<=W+60));
}

function pointer(e){
 const r=canvas.getBoundingClientRect();
 const scale=Math.min(r.width/W,r.height/H);
 const visibleWidth=W*scale,visibleHeight=H*scale;
 const left=r.left+(r.width-visibleWidth)/2;
 const top=r.top+(r.height-visibleHeight)/2;
 return {x:(e.clientX-left)/scale,y:(e.clientY-top)/scale};
}
canvas.addEventListener('pointermove',e=>{if(!started||paused||complete)return;if(dragMode&&!dragHeld)return;const p=pointer(e);cursorTarget={x:clamp(p.x,55,W-55),y:clamp(p.y,345,H-45)}});
canvas.addEventListener('pointerleave',()=>{cursorTarget=null});
canvas.addEventListener('click',e=>{if(dragMode)return;const p=pointer(e);interact(p.x,p.y)});
canvas.addEventListener('pointerdown',e=>{if(!dragMode)return;dragHeld=true;canvas.setPointerCapture(e.pointerId);const p=pointer(e);cursorTarget={x:clamp(p.x,55,W-55),y:clamp(p.y,345,H-45)}});
canvas.addEventListener('pointerup',e=>{if(!dragMode)return;dragHeld=false;cursorTarget=null;const p=pointer(e);interact(p.x,p.y)});
canvas.addEventListener('pointercancel',()=>{dragHeld=false;cursorTarget=null});
function help(){guideHint();if(phase()===2&&!carrying){showDemoUntil=now+4.8;$('message').textContent='Watch: Johnny scoops soil from the pile into the wheelbarrow.';}say($('message').textContent)}
$('show').disabled=false;$('show').addEventListener('click',help);$('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'🔊':'🔇';$('sound').setAttribute('aria-pressed',String(sound));if(!sound)window.speechSynthesis?.cancel()});$('retry').addEventListener('click',()=>reset());$('start').disabled=false;$('start').textContent='Let’s plant!';$('start').addEventListener('click',()=>{if(complete){window.location.href='level2.html';return;}reset();started=true;$('overlay').hidden=true;chirp(550)});$('replay').hidden=true;
function reset(){birds=[];birdNextAt=0;birdEscapes=0;birdVisits=0;shooUntil=0;stage=[0,0,0];soilLoads=0;loadingStartedAt=0;showDemoUntil=0;soilCartActive=false;cartWheelAngle=0;cartFacing=1;actionKind='';selected='shovel';complete=false;particles=[];started=false;fx=145;fy=510;carrying=null;walkTarget=null;walkAction=null;cursorTarget=null;dragHeld=false;working=false;workSpot=-1;$('overlayKicker').textContent='WELCOME TO JOHNNY’S ORCHARD';$('overlayTitle').innerHTML='Little seeds.<br>Big trees.';$('overlayCopy').textContent='Help Johnny plant three apple trees!';$('start').textContent='Let’s plant!';refresh();updateTools()}
try{guide=window.trackpadGuide?.create?.({scene:$('handScene'),leftHand:$('leftHand'),rightHand:$('rightHand'),pressIndicator:$('press'),pointerSpace:'viewport',togglePressIndicator:true,toggleScenePressedClass:true})}catch(e){}
fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(s=>{voice=s.johnnyAppleseedVoiceInstructions===true;dragMode=s.johnnyAppleseedRequireClickAndDrag===true;birdsEnabled=s.johnnyAppleseedBlackbirdsEnabled!==false;birdDelay=[5,7,12].includes(Number(s.johnnyAppleseedBirdDelay))?Number(s.johnnyAppleseedBirdDelay):7}).catch(()=>{});
window.addEventListener('blur',()=>{paused=true;cursorTarget=null;dragHeld=false;window.speechSynthesis?.cancel()});window.addEventListener('focus',()=>{paused=false});document.addEventListener('visibilitychange',()=>{paused=document.hidden;if(paused)window.speechSynthesis?.cancel()});
function frame(ms){let dt=Math.min(.05,(ms-last)/1000||.016);last=ms;if(!paused&&!document.hidden){now+=dt;finishWork();updateBlackbird(dt);particles.forEach(p=>{p.y-=dt*30;p.life-=dt*2});particles=particles.filter(p=>p.life>0);draw();if(started&&!complete&&!walkTarget&&!working&&now-helpAt>15){$('show').classList.add('needs-help');}else $('show').classList.remove('needs-help')}requestAnimationFrame(frame)}reset();requestAnimationFrame(frame);
})();
