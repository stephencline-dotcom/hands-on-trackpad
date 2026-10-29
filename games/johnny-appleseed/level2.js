(()=>{'use strict';
const $=id=>document.getElementById(id), canvas=$('farm'),c=canvas.getContext('2d');
const W=1280,H=760,trees=[{x:320,y:495},{x:625,y:490},{x:955,y:480}], tools=[{x:125,y:480,type:'weeds'},{x:1125,y:500,type:'water'},{x:1120,y:390,type:'sun'}];
const names=['Pull the weeds','Water the thirsty trees','Trim the shading bushes','Orchard inspection'];
let level=0,done=[false,false,false],inspected=[false,false,false],selected=null,started=false,complete=false,paused=false,voice=false,drag=false,dragHeld=false,sound=true;
let glovesOn=false,glovePickupStarted=false;
let weeds=[],weedTimer=0,weedDelay=12,weedTosses=0,weedPhase="pull",weedPiles=[0,0,0],carryingWeeds=-1,weedThrow=null,compostLoads=0,waterRemaining=0,hoseHeld=false,hoseSpray=null,trimStrength=[2,2,3],inspectionNeeds=['weeds','water','sun'],inspectionTool=null,careFx=0,trimBurst=null;
let johnny={x:145,y:570},target={x:145,y:570},moveTo=null,task=null,taskEnds=0,now=0,last=0,showUntil=0,helpStart=0,guide=null,fx=[],demo=null;
const rnd=(n)=>Math.sin(n*73.4)*.5+.5,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function circle(x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function oval(x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill()}
function line(p,col,w){c.beginPath();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
function rect(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function text(t,x,y,size=23,col='#304e38'){c.font=`bold ${size}px system-ui`;c.fillStyle=col;c.fillText(t,x,y)}
function speak(s){if(voice&&sound&&window.speechSynthesis){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(s);u.rate=.88;speechSynthesis.speak(u)}}
function beep(){if(!sound)return;try{let a=window._jaAudio||(window._jaAudio=new (window.AudioContext||window.webkitAudioContext)());a.resume();let o=a.createOscillator(),g=a.createGain();o.frequency.value=660;g.gain.value=.025;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.12)}catch(e){}}
function message(s){$('message').textContent=s}
function createWeeds(){weeds=[];for(let i=0;i<9;i++){let tree=trees[i%3];weeds.push({x:tree.x-100+(Math.floor(i/3)-1)*52,y:tree.y+27+(i%2)*22,id:i})}weedTimer=0;weedTosses=0;weedPhase="pull";weedPiles=[0,0,0];carryingWeeds=-1;weedThrow=null;compostLoads=0}
function drawGloves(x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);for(let k=0;k<2;k++){let dx=k*27-14;oval(dx,2,12,17,'#f3c936');rect(dx-10,7,20,11,'#dca51e');for(let f=0;f<4;f++)rect(dx-10+f*6,-22,5,19,'#f3c936');oval(dx+(k?13:-13),0,6,11,'#f3c936')}c.restore()}
function drawPruners(x,y,scale=1,open=0){
 c.save();c.translate(x,y);c.scale(scale,scale);
 line([[-3,3],[-17,20]],'#835d36',7);line([[3,3],[17,20]],'#835d36',7);
 line([[0,2],[-17,-20-open]],'#d9e3e6',6);line([[0,2],[17,-20+open]],'#c1d0d7',6);
 circle(0,2,5,'#d6ad4d');c.restore();
}
function inspectionPickupPoint(type){return type==='water'?{x:1085,y:510}:type==='sun'?{x:1120,y:390}:{x:125,y:480}}
function guideTarget(){let i=done.findIndex(v=>!v);if(level===3)i=inspected.findIndex(v=>!v);return selected===null&&level!==3?tools[level]:trees[Math.max(0,i)]}
function hint(){
 if(!started||complete)return;
 let i=level===3?inspected.findIndex(v=>!v):done.findIndex(v=>!v);i=Math.max(0,i);
 const a=level===0?{x:johnny.x,y:johnny.y}:level===3?inspectionPickupPoint(inspectionNeeds[i]):tools[level];
 const b=level===0?(!glovesOn?{x:125,y:480}:weedPhase==='pull'?(weeds[0]||trees[i]):carryingWeeds>=0?{x:1155,y:606}:pilePosition(weedPiles.findIndex(n=>n>0))):trees[i];demo={a,b,start:now};showUntil=now+6;helpStart=now;
 guide?.play?.('click');message(level===0?(!glovesOn?'Follow the dots to the yellow gloves and click them!':weedPhase==='pull'?'Follow the dots to a weed and click it!':carryingWeeds>=0?'Follow the dots to compost, then click the bin!':'Follow the dots to a weed pile, then click to pick it up!'):level===3?'Follow the dots! Find what this tree needs.':'Follow the dotted trail: tool first, then the glowing tree!');speak($('message').textContent)
}
function pilePosition(i){let t=trees[Math.max(0,i)];return{x:t.x+86,y:t.y+92}}
function nearestTreeIndex(p){let best=0;for(let i=1;i<trees.length;i++)if(dist(p,trees[i])<dist(p,trees[best]))best=i;return best}
function stageText(){return level===0?(!glovesOn?'First, click the yellow gardening gloves by the shed!':weedPhase==='pull'?'Weed race! Click weeds, then Johnny tosses them into piles near the trees.':'Cleanup time! Click a weed pile, carry it to the compost bin, and click the bin.'):level===1?'Hose rescue! Click the hose beside the barrel, then click each thirsty tree to spray its roots.':level===2?'Sunshine rescue! Trim the shading bushes to free the trees.':'Orchard Doctor! Find the thirsty tree, the weedy tree, and the shaded tree. Choose the matching tool!'}
function advance(){if(level===3){complete=true;message('The orchard is healthy and growing!');setTimeout(()=>{if(!complete)return;$('overlay').hidden=false;$('overlayKicker').textContent='LEVEL 2 COMPLETE';$('overlayTitle').textContent='Wonderful, Johnny!';$('overlayCopy').textContent='Your trees have water, sunlight, and room to grow!';$('start').textContent='Play Level 2 again';},900);return}level++;done=[false,false,false];selected=null;demo=null;waterRemaining=0;hoseHeld=false;hoseSpray=null;inspectionTool=null;message(stageText());$('count').textContent=`${level} / 4`;beep();speak(stageText())}
function act(x,y){
 if(!started||paused||complete)return; if(task||moveTo){window.ClickOnceWait?.repeatedClick?.();return;}
 const p={x,y},i=trees.findIndex(t=>dist(t,p)<105);
 if(level===0){
   if(!glovesOn){if(dist(p,tools[0])<100){moveTo={x:tools[0].x+32,y:tools[0].y+25,kind:'glovePickup'};glovePickupStarted=true}else message('First, click the yellow gloves by the shed!');return}
   if(weedPhase==='cleanup'){
     if(carryingWeeds>=0){if(dist(p,{x:1155,y:606})<112){moveTo={x:1084,y:615,kind:'weedCompost'};return}message('Carry your weeds to the wooden compost bin and click it!');return}
     let pi=weedPiles.findIndex((n,j)=>n>0&&dist(p,pilePosition(j))<67);
     if(pi<0){message('Click a pile of pulled weeds beside an apple tree!');return}
     let pos=pilePosition(pi);moveTo={x:clamp(pos.x-42,65,1200),y:pos.y+28,kind:'weedGather',pileIndex:pi};return;
   }
   let wi=weeds.findIndex(w=>dist(w,p)<43);if(wi<0){message('Click an individual weed near the apple trees!');return}let w=weeds[wi];moveTo={x:clamp(w.x+(w.x<trees.reduce((a,b)=>Math.abs(a.x-w.x)<Math.abs(b.x-w.x)?a:b).x?-43:43),60,1210),y:clamp(w.y+43,400,690),kind:'weedPull',weedId:w.id};return}
 if(level===3){
   const ti=tools.findIndex(t=>dist(t,p)<94);
   if(ti>=0){if(inspected[ti]){message('That job is finished! Choose a tool for a tree that still needs help.');return}inspectionTool=tools[ti].type;let pickup=inspectionPickupPoint(inspectionTool);moveTo={x:pickup.x-28,y:pickup.y+18,kind:'inspectPickup'};return}
   if(i<0||inspected[i]){message('Find a tree that still needs help.');return}
   if(inspectionTool!==inspectionNeeds[i]){message(['Look for weeds at the roots. Choose the green weed tool!','Drooping leaves need water. Choose the blue water tool!','The dark bush blocks sunlight. Choose the clippers!'][i]);hint();return}
   moveTo={x:trees[i].x-76,y:trees[i].y+40,i,kind:'inspect'};return;
 }
 const tool=tools[level];
 if(!selected){if(dist(tool,p)>105){message('Follow the glowing circle to your tool!');return}
   moveTo={x:tool.x-34,y:tool.y+16,kind:'pickup'};return}
 if(level===1&&!hoseHeld){message('Click the hose nozzle beside the barrel first!');return;}
 if(i<0||done[i]){message('Choose a glowing tree that still needs help!');return}
 moveTo={x:trees[i].x-76,y:trees[i].y+40,i,kind:'care'};
}
function finishTask(){
 if(!task||now<taskEnds)return;let t=task;task=null;taskEnds=0;beep();
 if(t.kind==='glovePickup'){glovesOn=true;message('Johnny put on his gardening gloves! Now click a weed.');return}
 if(t.kind==='weedPull'){let ix=weeds.findIndex(w=>w.id===t.weedId);if(ix>=0){let w=weeds.splice(ix,1)[0],pi=nearestTreeIndex(w),pos=pilePosition(pi);weedTosses++;weedThrow={from:{x:johnny.x+15,y:johnny.y-30},to:pos,start:now,pileIndex:pi};for(let k=0;k<12;k++)fx.push({x:w.x+(Math.random()-.5)*32,y:w.y-15+(Math.random()-.5)*20,life:1});message(weeds.length?'Great pull! Johnny tossed it behind him. Keep clearing!':'Last weed pulled! Watch Johnny toss it into the pile.');if(!weeds.length){weedPhase='cleanup';weedTimer=0;message('Great work! Now collect the weed piles and take them to compost.')}}return}
 if(t.kind==='weedGather'){if(weedPiles[t.pileIndex]>0){carryingWeeds=t.pileIndex;weedPiles[t.pileIndex]=0;message('Johnny has the weeds! Guide him to the compost bin and click it.')}return}
 if(t.kind==='weedCompost'){if(carryingWeeds>=0){weedTosses+=0;carryingWeeds=-1;compostLoads++;for(let k=0;k<16;k++)fx.push({x:1150+(Math.random()-.5)*60,y:588+(Math.random()-.5)*45,life:1});if(weedPiles.every(n=>n===0)&&!weedThrow){message('Orchard all cleaned up!');advance()}else message('Great compost delivery! Collect the next weed pile.')}return}
 if(t.kind==='pickup'){
   selected=tools[level].type;
   if(level===1){hoseHeld=true;message('Johnny has the hose! Click a thirsty tree to spray its roots.')}else message('Great! Follow the glowing trees to help them.');return;
 }
 if(t.kind==='refill'){hoseHeld=true;message('Hose ready! Click a thirsty tree.');return}
 if(t.kind==='inspectPickup'){if(inspectionTool==='water')hoseHeld=true;message('Good choice! Now click the tree that needs that tool.');return}
 if(t.kind==='care'){
   
   if(level===2){trimStrength[t.i]=Math.max(0,trimStrength[t.i]-1);trimBurst={i:t.i,start:now};if(trimStrength[t.i]>0){message('Snip! A branch fell. Click the shaded bush again!');return}}
   if(level===1)hoseSpray=null;
   done[t.i]=true;
   for(let j=0;j<26;j++)fx.push({x:trees[t.i].x+(Math.random()-.5)*100,y:trees[t.i].y-90+(Math.random()-.5)*95,life:1});
   if(done.every(Boolean))advance();else if(level===1)message('Great watering! Spray the roots of the next thirsty tree.');else message(`${done.filter(Boolean).length} of 3 trees helped!`);return;
 }
 if(t.kind==='inspect'){
   inspected[t.i]=true;inspectionTool=null;hoseHeld=false;
   for(let j=0;j<20;j++)fx.push({x:trees[t.i].x+(Math.random()-.5)*95,y:trees[t.i].y-80,life:1});
   if(inspected.every(Boolean))advance();else message('Great diagnosis! Choose the right tool for the next tree.');
 }
}
function drawHoseCoil(x,y){
 c.save();c.strokeStyle='#2e854c';c.lineWidth=9;c.lineCap='round';
 for(let k=0;k<3;k++){c.beginPath();c.ellipse(x-15+k*11,y+8,19,11,-.3,0,Math.PI*2);c.stroke()}
 line([[x+12,y+5],[x+39,y-13]],'#2e854c',9);line([[x+38,y-14],[x+56,y-20]],'#d9ba57',12);
 c.restore();
}
function drawHeldHose(x,y){
 // Hose stays attached to the barrel, but never restricts kindergarten movement.
 c.save();c.strokeStyle='#287b45';c.lineWidth=8;c.lineCap='round';
 c.beginPath();c.moveTo(1100,516);c.bezierCurveTo(1060,590,950,640,(1100+x)/2,Math.min(665,y+75));
 c.quadraticCurveTo(x-48,y+66,x+26,y-16);c.stroke();
 line([[x+15,y-22],[x+37,y-29]],'#d9b85b',10);
 circle(x+37,y-29,6,'#a9b4a0');c.restore();
}
function drawWaterStream(sx,sy,tx,ty){
 c.save();let dx=tx-sx,dy=ty-sy;
 for(let k=0;k<26;k++){let t=(k/26+now*1.8)%1;
  let px=sx+dx*t,py=sy+dy*t-48*Math.sin(Math.PI*t);
  circle(px,py,2.5+2*t,'#73d6ff');
 }
 for(let k=0;k<8;k++){let a=k*2.4+now*4;circle(tx+Math.cos(a)*18,ty-4+Math.sin(a)*7,3,'#a6eaff')}
 oval(tx,ty+4,35,9,'#6b8f6d88');c.restore();
}
function renderTree(p,i){let growth=level===0?0:level===1?.1:level===2?.2:.4,healthy=done[i]||level===3&&inspected[i];let s=1+growth+(healthy?.12:0);c.save();c.translate(p.x,p.y);c.scale(s,s);oval(0,10,72,18,'#46784355');line([[0,0],[0,-138]],'#865b3a',20);line([[0,-91],[-38,-126]],'#865b3a',10);line([[0,-110],[36,-139]],'#865b3a',10);for(let [dx,dy,r,col] of [[-46,-135,49,'#448d47'],[36,-142,51,'#4a9c52'],[0,-172,58,'#60b965'],[-5,-128,43,'#67b95c']])circle(dx,dy,r,col);for(let k=0;k<13;k++){let a=k*2.4;circle(Math.cos(a)*42, -147+Math.sin(a)*33,3,'#b9df86')}
if(level===3&&!inspected[i]&&i===0){for(let k=0;k<5;k++){let x=-68+k*30;line([[x,7],[x-6,-20-k%2*7]],'#407a36',6);oval(x-7,-20-k%2*7,10,5,'#5ca64a')}}
if(level===1&&!healthy||level===3&&!inspected[i]&&i===1){for(let k=0;k<4;k++)oval(-25+k*16,-128+(k%2)*14,15,6,'#83a868')}
if(level===2&&!healthy||level===3&&!inspected[i]&&i===2){let remaining=level===2?trimStrength[i]:3;for(let k=0;k<remaining;k++){let bx=55+k*19,by=-45-k*22;oval(bx,by,27,34,k%2?'#49974c':'#3c7e3f');line([[bx-5,by+23],[bx+6,by-17]],'#376b38',4)}if(level===2){oval(69,-12,78,16,'#3b5c4b55');text('✂',p.x+55,p.y-90,29,'#ffe28b')}}
if(healthy){for(let k=0;k<5;k++)circle(Math.cos(k*2.5)*34,-150+Math.sin(k*2.5)*27,5,'#f4dc74')}
c.restore();if(level!==3&&!done[i]||level===3&&!inspected[i]){c.strokeStyle='#ffe477';c.lineWidth=5;c.setLineDash([8,7]);c.beginPath();c.ellipse(p.x,p.y+14,93,33,0,0,6.283);c.stroke();c.setLineDash([])}else{text('✓',p.x+55,p.y-20,32,'#ffffff')};}
function draw(){c.clearRect(0,0,W,H);let sky=c.createLinearGradient(0,0,0,420);sky.addColorStop(0,'#92d6f5');sky.addColorStop(1,'#d8f2e3');rect(0,0,W,760,'#a4d07c');rect(0,0,W,390,sky);circle(1085,96,54,'#ffdf76');for(let j=0;j<6;j++){let x=j*250+Math.sin(now*.2+j)*18;oval(x,130+j%3*36,68,19,'#ffffffcc');oval(x+23,118+j%3*36,36,22,'#ffffffcc')}
c.fillStyle='#83b789';c.beginPath();c.moveTo(0,360);c.quadraticCurveTo(230,205,470,350);c.quadraticCurveTo(780,205,1280,340);c.lineTo(1280,760);c.lineTo(0,760);c.fill();rect(0,390,1280,370,level===0?'#a3c774':level===1?'#a5c975':level===2?'#85b96c':'#a5d785');
 if(level===1){for(let j=0;j<12;j++){let xx=150+j*91;circle(xx,94+Math.sin(now*.7+j)*9,3,'#fff7bd')}}
 if(level===2){for(let j=0;j<8;j++){let xx=150+j*135;line([[xx,370],[xx+40,440]],'#f9e98a44',12)}}
 if(level===3){for(let j=0;j<14;j++){let xx=25+j*89;circle(xx,430+Math.sin(now+j)*14,5,'#f3a2cc')}}line([[0,676],[240,640],[500,655],[790,625],[1280,666]],'#d2b27d',90);line([[0,676],[240,640],[500,655],[790,625],[1280,666]],'#f2ddb0',75);
for(let x=0;x<1280;x+=48){rect(x,353,9,48,'#f3dfac')}rect(0,367,1280,8,'#f7e9bf');rect(0,390,1280,7,'#f7e9bf');
for(let j=0;j<30;j++){let x=22+j*43,y=418+(j%4)*74;circle(x,y,3,'#fff1a4');circle(x+5,y+4,3,j%2?'#ef8fb5':'#9c8ddd')}
// rain barrel, tool rack, and shed
rect(30,317,170,113,'#d57c54');c.fillStyle='#8b4a3b';c.beginPath();c.moveTo(18,323);c.lineTo(115,245);c.lineTo(215,323);c.fill();rect(80,354,58,76,'#79523c');
oval(1117,525,61,20,'#5d8b6a');rect(1085,441,75,79,'#6486a4');oval(1122,442,38,13,'#92cce7');for(let k=0;k<3;k++)line([[1087,462+k*21],[1158,462+k*21]],'#46617a',4);text('WATER',1078,548,17);
rect(1057,335,116,15,'#97643f');rect(1072,350,10,60,'#8a5a38');rect(1152,350,10,60,'#8a5a38');line([[1090,339],[1105,379]],'#a6b3b9',9);line([[1138,339],[1126,385]],'#a6b3b9',9);
// Trees whose trunk bases are behind Johnny are painted first.
for(let i=0;i<3;i++)if(trees[i].y<=johnny.y)renderTree(trees[i],i);
if(level<=3){let t=tools[Math.min(level,2)];if(level===0){/* weeds are individually drawn below */}if(level===1){drawHoseCoil(t.x-40,t.y+10)}if(level===2){drawPruners(t.x,t.y,1.15)}if(level!==0&&(!selected||level===3&& !inspected[2])){c.strokeStyle='#ffe778';c.lineWidth=5;c.setLineDash([9,6]);c.beginPath();c.arc(t.x,t.y,64+Math.sin(now*4)*3,0,6.283);c.stroke();c.setLineDash([])}}
if(level===0){if(!glovesOn){drawGloves(125,468,1.35);c.strokeStyle='#ffe778';c.lineWidth=5;c.setLineDash([8,6]);c.beginPath();c.arc(125,480,57+Math.sin(now*4)*3,0,6.283);c.stroke();c.setLineDash([])}for(let w of weeds){line([[w.x,w.y],[w.x-4,w.y-23]],'#367a37',5);oval(w.x-11,w.y-17,13,6,'#4da54b');oval(w.x+8,w.y-27,13,6,'#6ac45d');c.strokeStyle='#ffe077';c.lineWidth=2;c.beginPath();c.arc(w.x,w.y-12,25,0,6.283);c.stroke()}// Three ground piles remain at their own trees until Johnny carries them.
 for(let pi=0;pi<3;pi++){let n=weedPiles[pi],pos=pilePosition(pi);if(!n)continue;oval(pos.x,pos.y+3,25+Math.min(n,7)*3,9,'#65834b');for(let j=0;j<Math.min(n,10);j++){let xx=pos.x+(j%5-2)*12,yy=pos.y-7-Math.floor(j/5)*12;line([[xx,yy+7],[xx-5,yy-12]],'#376f35',4);oval(xx-6,yy-12,9,5,'#67b85d');line([[xx,yy+7],[xx+2,yy+12]],'#9b7b4e',2)}if(weedPhase==='cleanup'&&carryingWeeds<0){c.strokeStyle='#ffe778';c.lineWidth=3;c.setLineDash([6,5]);c.beginPath();c.arc(pos.x,pos.y,45,0,6.283);c.stroke();c.setLineDash([])}}
 // Wooden compost bin, with weeds visible only after actual deliveries.
 rect(1093,569,130,75,'#97603a');for(let j=0;j<5;j++){rect(1100+j*24,576,17,61,j%2?'#b7834b':'#ad7440');line([[1100+j*24,578],[1100+j*24,636]],'#714c31',2)}
 rect(1089,568,140,9,'#714b30');for(let j=0;j<Math.min(compostLoads*5,15);j++){let xx=1112+(j%7)*15,yy=571-Math.floor(j/7)*11;line([[xx,yy+8],[xx-4,yy-10]],'#367c38',4);oval(xx-4,yy-10,8,4,'#65a54b')}
 text('COMPOST',1095,667,18);text(weedPhase==='pull'?'Weeds left: '+weeds.length:'Piles to compost: '+(weedPiles.filter(n=>n>0).length+(carryingWeeds>=0?1:0)+(weedThrow?1:0)),34,462,21)}
if(level===3){for(let i=0;i<3;i++)if(!inspected[i]){let t=trees[i];oval(t.x,t.y-244,49,31,'#fff4c9');if(i===0){for(let j=0;j<3;j++){let xx=t.x-20+j*19;line([[xx,t.y-232],[xx-4,t.y-251]],'#347f3d',4);oval(xx-4,t.y-251,8,5,'#66b958')}}else if(i===1){for(let j=0;j<3;j++){let xx=t.x-20+j*19;oval(xx,t.y-244,7,12,'#49aee4')}}else{circle(t.x,t.y-245,14,'#ffc941');for(let j=0;j<8;j++){let a=j*Math.PI/4;line([[t.x+Math.cos(a)*19,t.y-245+Math.sin(a)*19],[t.x+Math.cos(a)*25,t.y-245+Math.sin(a)*25]],'#e7a92e',4)}}}for(let k=0;k<3;k++){
 let t=tools[k];circle(t.x,t.y,27,['#6eb84d','#62b4d8','#d4a55e'][k]);
 if(k===0)drawGloves(t.x,t.y,0.7);else if(k===1)drawHoseCoil(t.x-22,t.y+4);else drawPruners(t.x,t.y,0.8);
 if(!inspected[k]){c.strokeStyle=inspectionTool===t.type?'#ffffff':'#ffe477';c.lineWidth=4;c.setLineDash(inspectionTool===t.type?[]:[7,5]);c.beginPath();c.arc(t.x,t.y,38,0,6.283);c.stroke();c.setLineDash([]);}
 }}
// Johnny: feet are position reference; arms animate with task.
let x=johnny.x,y=johnny.y,walking=dist(johnny,target)>5||!!moveTo,step=walking?Math.sin(now*14)*9:0;
oval(x,y+28,34,9,'#476e4555');line([[x-12,y+6],[x-13+step,y+31]],'#5c4939',10);line([[x+12,y+6],[x+13-step,y+31]],'#5c4939',10);rect(x-20,y-36,40,46,'#4b80ad');rect(x-10,y-28,20,36,'#e3bd69');let action=task?.kind==='care'||task?.kind==='inspect'||task?.kind==='weedPull';let swing=action?Math.sin(now*13)*14:step*.3;line([[x-20,y-26],[x-34,y-6+swing]],'#edbd91',9);line([[x+20,y-26],[x+34,y-6-swing]],'#edbd91',9);if(glovesOn){circle(x-34,y-6+swing,7,'#f2cf3b');circle(x+34,y-6-swing,7,'#f2cf3b')}circle(x,y-55,24,'#f1c393');oval(x,y-81,36,8,'#919ba4');rect(x-20,y-108,40,28,'#9ca4ad');circle(x-8,y-57,3,'#374c48');circle(x+8,y-57,3,'#374c48');line([[x-5,y-45],[x+6,y-45]],'#a35e52',2);
if(level===2&&selected||level===3&&inspectionTool==='sun'){drawPruners(x+35,y-16,0.8,task?.kind==='inspect'?Math.sin(now*15)*8:0)}
if(level===0&&carryingWeeds>=0){for(let j=0;j<5;j++){let wx=x-18+j*8,wy=y-12-(j%2)*9;line([[wx,wy+12],[wx-4,wy-11]],'#397a37',4);oval(wx-4,wy-12,9,5,'#68b75b')}}
if(task&&task.kind==='weedPull'){let w=weeds.find(q=>q.id===task.weedId);if(w){line([[x-34,y-6],[w.x,w.y-22]],'#e9bd91',7);line([[x+34,y-6],[w.x,w.y-22]],'#e9bd91',7);if(now%0.35<0.17)line([[w.x,w.y-20],[w.x-6,w.y-37]],'#397f38',5)}}
if(hoseHeld&&(level===1||level===3&&inspectionTool==='water')){drawHeldHose(x,y);}
if(task&&(task.kind==='care'||task.kind==='inspect')){let p=trees[task.i];if(level===1||level===3&&inspectionTool==='water'){drawWaterStream(x+28,y-24,p.x,p.y-4)}if(level===2){let snip=Math.sin(now*17)*11;drawPruners(x+35,y-27,1,snip);for(let j=0;j<9;j++)circle(p.x+55+Math.sin(now*8+j)*22,p.y-65+j*10,4,'#77bd63')}}if(trimBurst&&now-trimBurst.start<1.3){let p=trees[trimBurst.i],t=(now-trimBurst.start)/1.3;for(let j=0;j<7;j++){let xx=p.x+48+j*9+Math.sin(j*2)*16*t,yy=p.y-145+j*8+150*t*t;oval(xx,yy,9,5,j%2?'#6ab65d':'#4d9b50')}}
// Foreground trees occlude Johnny naturally when he walks behind them.
for(let i=0;i<3;i++)if(trees[i].y>johnny.y)renderTree(trees[i],i);
if(weedThrow){let t=clamp((now-weedThrow.start)/.65,0,1),a=weedThrow.from,b=weedThrow.to,xx=a.x+(b.x-a.x)*t,yy=a.y+(b.y-a.y)*t-70*Math.sin(Math.PI*t);line([[xx,yy+8],[xx-5,yy-13]],'#387c38',5);oval(xx-5,yy-13,12,6,'#6dbd59')}
for(let q of fx)circle(q.x,q.y,3+q.life*3,'#ffe78c');
if(demo&&now<showUntil){
 let f=(now-demo.start)/6,from=demo.a,to=demo.b;
 let curve=t=>({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t-85*Math.sin(Math.PI*t)});
 // Moving, rounded dotted guide, not a static straight line.
 for(let k=0;k<=34;k++){
   let t=k/34,pt=curve(t);circle(pt.x,pt.y,4.5+1.5*Math.sin(now*5-k*.22),'#fff8cf');
 }
 let t=f<.24?0:f>.88?1:(f-.24)/.64,pt=curve(t);
 circle(to.x,to.y,30+5*Math.sin(now*6),'#ffe27455');
 c.strokeStyle='#ffdf54';c.lineWidth=5;c.beginPath();c.arc(to.x,to.y,34+5*Math.sin(now*6),0,Math.PI*2);c.stroke();
 circle(pt.x,pt.y,17,'#ffffff');text('➜',pt.x-12,pt.y+8,27,'#287b55');
 if(f<.24){circle(from.x,from.y,30+5*Math.sin(now*8),'#ffe27455')}
}else demo=null;
}
function pointer(e){let r=canvas.getBoundingClientRect(),scale=Math.min(r.width/W,r.height/H),left=r.left+(r.width-W*scale)/2,top=r.top+(r.height-H*scale)/2;return{x:(e.clientX-left)/scale,y:(e.clientY-top)/scale}}
canvas.addEventListener('pointermove',e=>{if(!started||paused||complete||drag&&!dragHeld)return;let p=pointer(e);target={x:clamp(p.x,60,1210),y:clamp(p.y,400,690)}});
canvas.addEventListener('click',e=>{if(!drag)act(...Object.values(pointer(e)))});
canvas.addEventListener('pointerdown',e=>{if(!drag)return;dragHeld=true;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointerup',e=>{if(!drag)return;dragHeld=false;let p=pointer(e);act(p.x,p.y)});
canvas.addEventListener('pointercancel',()=>dragHeld=false);
window.ClickOnceWait?.attach?.({enabled:true,mode:'repeated',speech:false,audioAllowed:()=>sound});
$('show').disabled=false;$('show').addEventListener('click',hint);$('retry').addEventListener('click',reset);$('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'🔊':'🔇';if(!sound)window.speechSynthesis?.cancel()});$('start').disabled=false;$('start').addEventListener('click',()=>{reset();started=true;$('overlay').hidden=true;message(stageText())});
function reset(){level=0;done=[false,false,false];inspected=[false,false,false];createWeeds();glovesOn=false;glovePickupStarted=false;trimStrength=[2,2,3];waterRemaining=0;hoseHeld=false;hoseSpray=null;inspectionTool=null;trimBurst=null;selected=null;started=false;complete=false;johnny={x:145,y:570};target={x:145,y:570};moveTo=null;task=null;fx=[];demo=null;now=0;$('overlay').hidden=false;$('overlayKicker').textContent='LEVEL 2 — GROWING THE ORCHARD';$('overlayTitle').innerHTML='Our trees<br>need care!';$('overlayCopy').textContent='Help Johnny care for three young apple trees!';$('start').textContent='Let’s help!';$('count').textContent='0 / 4';message(stageText())}
try{guide=window.trackpadGuide?.create?.({scene:$('handScene'),leftHand:$('leftHand'),rightHand:$('rightHand'),pressIndicator:$('press'),pointerSpace:'viewport',togglePressIndicator:true,toggleScenePressedClass:true})}catch(e){}
fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(s=>{voice=s.johnnyAppleseedVoiceInstructions===true;drag=s.johnnyAppleseedRequireClickAndDrag===true;weedDelay=[7,12,18].includes(Number(s.johnnyAppleseedWeedDelay))?Number(s.johnnyAppleseedWeedDelay):12;window.ClickOnceWait?.configure?.({enabled:s.clickOnceWaitEnabled!==false,mode:s.clickOnceWaitMode==='always'?'always':'repeated',speech:s.clickOnceWaitSpeech===true})}).catch(()=>{});
window.addEventListener('blur',()=>{paused=true;window.speechSynthesis?.cancel()});window.addEventListener('focus',()=>paused=false);document.addEventListener('visibilitychange',()=>{paused=document.hidden;if(paused)window.speechSynthesis?.cancel()});
function frame(ms){let dt=Math.min(.05,(ms-last)/1000||.016);last=ms;if(!paused&&!document.hidden){now+=dt;let goal=moveTo||target;if(started&&!complete){let d=dist(johnny,goal);if(d>3){let s=Math.min(d,dt*275);johnny.x+=(goal.x-johnny.x)/d*s;johnny.y+=(goal.y-johnny.y)/d*s}else if(moveTo){let m=moveTo;moveTo=null;if(m.kind==='pickup'||m.kind==='refill'||m.kind==='inspectPickup'){task={kind:m.kind};taskEnds=now+.8}else{task={kind:m.kind,i:m.i,weedId:m.weedId,pileIndex:m.pileIndex};taskEnds=now+(m.kind==='weedPull'?1.1:1.1)}}}finishTask();if(weedThrow&&now-weedThrow.start>=.65){weedPiles[weedThrow.pileIndex]++;weedThrow=null;if(weedPhase==='cleanup'&&weedPiles.every(n=>n===0)&&carryingWeeds<0)advance()}if(started&&level===0&&weedPhase==='pull'&&!complete){weedTimer+=dt;if(weedTimer>=weedDelay){weedTimer=0;if(weeds.length<14){let tree=trees[Math.floor(Math.random()*3)];weeds.push({x:clamp(tree.x+(Math.random()-.5)*180,220,1080),y:tree.y+20+Math.random()*48,id:Math.max(0,...weeds.map(w=>w.id))+1+Math.floor(now*100)});message('A new weed sprouted!')}}}if(task||moveTo){helpStart=now;window.ClickOnceWait?.start?.('Johnny is working!')}else window.ClickOnceWait?.finish?.();fx.forEach(p=>p.life-=dt*1.4);fx=fx.filter(p=>p.life>0);if(demo&&now>showUntil)demo=null;draw();if(started&&!complete&&!task&&!moveTo&&now-helpStart>15)$('show').classList.add('needs-help');else $('show').classList.remove('needs-help')}requestAnimationFrame(frame)}reset();requestAnimationFrame(frame);
})();