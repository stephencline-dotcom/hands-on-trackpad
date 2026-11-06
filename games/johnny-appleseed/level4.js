"use strict";
const cv=document.getElementById('game'),g=cv.getContext('2d'),W=1200,H=675,$=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(x,y,a,b)=>Math.hypot(x-a,y-b);
let mode='intro',running=false,clock=0,last=0,score=0,catchGoal=10,highGoal=6,misses=0,falling=[],effects=[],spawnIn=1,jonnyX=200,targetX=200,jonnyY=535,ladderX=180,ladderTarget=180,ladderPlaced=false,ladderHeld=false,climbing=0,picking=false,highApples=[],squirrel={tree:1,until:0},soundOn=true,audio=null,helpUntil=0,round=0,weatherSeed=Math.random()*100;
const trees=[{x:230,y:390},{x:605,y:387},{x:995,y:390}];
let harvestAction=null, squirrelAttack=null, lostApple=null, lastTargetTree=-1, squirrelCooldown=0, squirrelVisits=0, squirrelLimit=3, squirrelInterval=8, squirrelWait=0;
let chaseTargetDifficulty='normal';
const CHASE_TARGET_END={off:68,gentle:52,normal:38,hard:26};
function chaseTargetSize(completed){const end=CHASE_TARGET_END[chaseTargetDifficulty]??38;return 68+(end-68)*Math.min(11,Math.max(0,completed))/11}
function setChaseTargetDifficulty(value){chaseTargetDifficulty=Object.prototype.hasOwnProperty.call(CHASE_TARGET_END,value)?value:'normal'}
let chase=null;const chaseDirect=new URLSearchParams(location.search).get('test')==='raccoon';

window.JohnnySounds?.setEnabled(()=>soundOn&&running);
function note(freq=550,dur=.12){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),v=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.72,audio.currentTime+dur);v.gain.setValueAtTime(.055,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.connect(v).connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch{}}
function puff(x,y,col,n=12){for(let i=0;i<n;i++)effects.push({x,y,vx:rnd(-110,110),vy:rnd(-140,-15),life:rnd(.4,.9),c:col,r:rnd(2,6)})}
function oval(x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
function line(points,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(...points[0]);points.slice(1).forEach(p=>g.lineTo(...p));g.stroke()}
function apple(x,y,s=1,col='#d94136'){g.save();g.translate(x,y);g.scale(s,s);oval(-7,0,11,14,col);oval(7,0,11,14,col);oval(0,5,15,11,col);oval(-7,-5,4,6,'#ffffff40');line([[0,-10],[2,-20]],'#684426',3);oval(9,-18,9,4,'#6f9c3b');g.restore()}
function tree(t,i){g.save();g.translate(t.x,t.y);line([[0,165],[0,-65]],'#86542d',33);line([[0,-20],[-65,-108]],'#86542d',15);line([[0,-42],[73,-113]],'#86542d',15);for(let j=0;j<7;j++){let a=j*2.4,rx=Math.cos(a)*75,ry=-125+Math.sin(a)*56;oval(rx,ry,80,65,j%2?'#5da94c':'#75bb53');oval(rx-15,ry-18,34,21,'#a0ce6b55')}for(let j=0;j<9;j++){let a=j*2.4;apple(Math.cos(a)*90,-128+Math.sin(a)*63,.75,j%3===0?'#e3b63d':'#c94231')}g.restore()}
function ground(){let sky=g.createLinearGradient(0,0,0,600);sky.addColorStop(0,'#77cbe9');sky.addColorStop(1,'#f6e5a3');g.fillStyle=sky;g.fillRect(0,0,W,H);for(let i=0;i<6;i++){let x=(i*251+weatherSeed*23)%1350-75,y=80+(i%3)*40;oval(x+Math.sin(clock*.2+i)*12,y,75,23,'#ffffffb8');oval(x+32,y-16,40,25,'#ffffffb8')}oval(1020,100,65,65,'#ffe08b');g.fillStyle='#88ba76';g.beginPath();g.moveTo(0,490);g.quadraticCurveTo(300,375,610,490);g.quadraticCurveTo(910,355,1200,470);g.lineTo(1200,H);g.lineTo(0,H);g.fill();g.fillStyle='#6daa55';g.fillRect(0,520,W,155);for(let i=0;i<70;i++){let x=i*19,y=535+(i%5)*24;line([[x,y],[x-3,y-8]],'#4d8f45',2)}g.fillStyle='#b58d58';g.beginPath();g.ellipse(600,628,730,65,0,0,7);g.fill();trees.forEach(tree);for(let i=0;i<18;i++){let x=(i*89+32)%W,y=570+i%4*19;oval(x,y,3,5,i%2?'#f7d46c':'#fff0ae')}}
function johnny(x,y,carry=true,climb=0){g.save();g.translate(x,y);const stride=Math.sin(clock*13)*(Math.abs(targetX-jonnyX)>7?11:1),bob=Math.abs(stride)*.18;g.translate(0,-bob);oval(0,21,29,8,'#345f3450');line([[-12,-3],[-12-stride,22]],'#654c32',11);line([[12,-3],[12+stride,22]],'#654c32',11);oval(-13-stride,22,12,6,'#5c3e2a');oval(12+stride,22,12,6,'#5c3e2a');oval(0,-39,26,35,'#eac58d');g.fillStyle='#318ac1';g.fillRect(-24,-40,48,37);line([[-19,-61],[-19,-20]],'#2872a0',9);line([[19,-61],[19,-20]],'#2872a0',9);line([[-21,-54],[-35,-25-climb*8]],'#e7b67e',10);line([[21,-54],[35,-23-climb*8]],'#e7b67e',10);oval(0,-87,27,29,'#efc58f');oval(0,-117,42,8,'#b48440');g.fillStyle='#ae7b3b';g.fillRect(-27,-131,54,15);oval(-10,-89,3,4,'#342e27');oval(10,-89,3,4,'#342e27');line([[-7,-76],[7,-76]],'#9c5e45',2);if(carry){g.save();g.translate(37,-15);g.rotate(Math.sin(clock*8)*.03);g.fillStyle='#9c6339';g.beginPath();g.moveTo(-40,0);g.lineTo(37,0);g.lineTo(28,31);g.lineTo(-29,31);g.closePath();g.fill();for(let k=0;k<5;k++)line([[-25+k*12,3],[-21+k*10,28]],'#d9aa6c',2);line([[-30,2],[-23,-13],[22,-13],[31,2]],'#794e2d',5);g.restore()}g.restore()}
function ladder(x,y){g.save();g.translate(x,y);g.rotate(-.12);line([[-26,0],[-13,-215]],'#ac713e',11);line([[26,0],[13,-215]],'#ac713e',11);for(let i=0;i<7;i++){let yy=-22-i*27;line([[-24+i*1.4,yy],[24-i*1.4,yy]],'#d7a261',8)}g.restore()}
function squirrelDraw(t,phase=0){
  const x=t.x+55+Math.sin(phase*2)*13,y=t.y-190+Math.sin(phase*10)*3;
  g.save();g.translate(x,y);
  // The large curved tail is drawn behind the body so the animal reads as a squirrel.
  g.strokeStyle='#87421f';g.lineWidth=23;g.lineCap='round';g.beginPath();g.moveTo(17,7);g.bezierCurveTo(64,30,76,-43,42,-48);g.bezierCurveTo(24,-53,25,-29,43,-22);g.stroke();
  g.strokeStyle='#d38a45';g.lineWidth=15;g.beginPath();g.moveTo(17,7);g.bezierCurveTo(64,30,76,-43,42,-48);g.stroke();
  oval(2,8,24,24,'#a95b2b');oval(-5,10,13,17,'#f3d29a');
  line([[-10,19],[-21,30]],'#8b4825',7);line([[13,20],[23,30]],'#8b4825',7);
  oval(-14,-18,20,18,'#ba6c34');oval(-26,-34,8,12,'#9d4d26');oval(-7,-36,8,12,'#9d4d26');
  oval(-26,-34,4,7,'#e8ad83');oval(-7,-36,4,7,'#e8ad83');
  oval(-20,-21,4,5,'#272522');oval(-32,-12,6,4,'#f1c59a');oval(-35,-14,3,3,'#493129');
  line([[-12,-3],[-29,5+Math.sin(phase*22)*4]],'#a95b2b',6);
  g.restore();
}
function newHighApple(previous=-1){
  const options=[0,1,2].filter(i=>i!==previous);
  const treeIndex=options[Math.floor(Math.random()*options.length)],tr=trees[treeIndex];
  return {x:tr.x+rnd(-45,45),y:tr.y-rnd(185,220),done:false,tree:treeIndex};
}
function nextHighApple(stolen=false){window.JohnnySounds?.stopName('ladderclimb');window.JohnnySounds?.stopName('leaveshake');
  const previous=highApples[score]?.tree ?? lastTargetTree;
  lastTargetTree=previous;
  if(stolen){highApples[score]=newHighApple(previous)}
  else {score++;if(score<highGoal)highApples[score]=newHighApple(previous)}
  ladderPlaced=false;ladderHeld=false;climbing=0;picking=false;harvestAction=null;
  squirrelAttack=null;squirrelWait=0; // Keep the scheduled squirrel time across tree changes.
  if(score>=highGoal){startRaccoon();return}
  status();
}
function overlay(title,body,button){$('heading').textContent=title;$('copy').textContent=body;$('start').textContent=button;$('overlay').hidden=false;running=false}
function go(){ $('overlay').hidden=true;running=true;if(mode==='ladder'&&squirrelVisits===0)squirrelCooldown=clock+squirrelInterval;note(650,.15)}
function status(){if(mode==='catch'){$('phaseLabel').textContent='🍎 Apple Catch';$('message').textContent='Move Johnny to catch the falling apples!';$('progress').textContent=`${score} / ${catchGoal}`}else if(mode==='ladder'){$('phaseLabel').textContent='🪜 Reach High Apples';$('message').textContent=ladderPlaced?'Click the glowing apple while Johnny climbs!':'Touch the ladder, then move it to the glowing tree and click!';$('progress').textContent=`${score} / ${highGoal}`}else if(mode==='chase'){$('phaseLabel').textContent='🦝 Raccoon Chase';$('message').textContent=chase?.stage===4?'Find the raccoon by watching the bushes!':'Click the glowing circle before Johnny reaches each obstacle!';$('progress').textContent=chase?.stage===4?'Find the striped tail!':`${chase?.completed||0} / ${chase?.total||12} obstacles`}else{$('phaseLabel').textContent='🍎 Harvest Day';$('message').textContent='Help Johnny bring in the apples!';$('progress').textContent=''}}
window.johnnyEyesNext=()=>{if(!running)return null;
 if(mode==='catch'){const a=falling.filter(f=>f.kind==='apple'&&!f.caught&&f.y<490).sort((a,b)=>b.y-a.y)[0];if(!a)return {signature:'catch-wait',label:'Watch for a falling apple!',points:[{x:jonnyX+37,y:515}]};return {signature:'catch-'+Math.round(a.x/40),label:'Move Johnny and his basket under the apple!',points:[{x:jonnyX+37,y:515},{x:a.x,y:515}]}}
 if(mode==='ladder'){const a=highApples[score];if(!a)return null;const tr=trees[a.tree];if(squirrelAttack)return {signature:'squirrel-'+score,label:'Watch the squirrel shake the branch!',points:[{x:tr.x,y:tr.y-155}]};
 if(!ladderHeld&&!ladderPlaced)return {signature:'ladder-touch-'+score,label:'Touch the ladder to pick it up!',points:[{x:jonnyX,y:520},{x:ladderX,y:440}]};
 if(ladderHeld&&!ladderPlaced)return {signature:'ladder-move-'+score,label:'Move the ladder to the glowing tree, then click!',points:[{x:ladderX,y:440},{x:tr.x,y:540}]};
 return {signature:'apple-'+score,label:climbing<.85?'Watch Johnny climb!':'Click the glowing apple!',points:[{x:ladderX+20,y:535-climbing*185},{x:a.x,y:a.y}]}}
 if(mode==='chase'&&chase&&!chase.failed){if(chase.stage===4){const centers=[235,475,725,965];return {signature:'hide-'+chase.hideMoves,label:'Look for the striped tail!',points:[{x:600,y:500},{x:centers[chase.hideSpot]+65,y:430}]}}
 if(chase.stage<4&&chase.obstacle){const o=chase.obstacle,z=chaseTarget(o);return {signature:'obstacle-'+chase.completed,label:'Click the glowing circle before Johnny arrives!',points:[{x:345,y:480},{x:z.x,y:z.y}]}}}
 return null;};
function reset(){window.JohnnySounds?.stop();chase=null;mode='intro';running=false;score=0;misses=0;clock=0;round++;falling=[];effects=[];spawnIn=.7;jonnyX=210;targetX=210;ladderX=130;ladderTarget=130;ladderPlaced=false;ladderHeld=false;climbing=0;picking=false;highApples=[];squirrel.until=0;harvestAction=null;squirrelAttack=null;lostApple=null;lastTargetTree=-1;squirrelCooldown=0;squirrelVisits=0;squirrelWait=0;readSquirrelSettings();weatherSeed=Math.random()*100;status();overlay('🍎 The Great Apple Harvest!','Catch the falling apples, then help Johnny reach the apples high in the trees!','Start Harvest!')}
function startCatch(){mode='catch';score=0;falling=[];spawnIn=.55;status();go()}
function readSquirrelSettings(){
  const count=Number(localStorage.getItem('johnnyHarvestSquirrelCount'));
  const interval=Number(localStorage.getItem('johnnyHarvestSquirrelInterval'));
  squirrelLimit=[0,1,2,3,5].includes(count)?count:3;
  squirrelInterval=[5,8,12].includes(interval)?interval:8;
  setChaseTargetDifficulty(localStorage.getItem('johnnyRaccoonTargetDifficulty'));
}
fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
  if(!data)return;
  for(const [key,allowed] of [['johnnyHarvestSquirrelCount',[0,1,2,3,5]],['johnnyHarvestSquirrelInterval',[5,8,12]]]){
    if(allowed.includes(Number(data[key])))localStorage.setItem(key,String(data[key]));
  }
  if(["off","gentle","normal","hard"].includes(data.johnnyRaccoonTargetDifficulty))localStorage.setItem("johnnyRaccoonTargetDifficulty",data.johnnyRaccoonTargetDifficulty);
  readSquirrelSettings();
}).catch(()=>{});
function startLadder(){window.JohnnySounds?.stop();mode='ladder';score=0;ladderPlaced=false;ladderHeld=false;ladderX=130;ladderTarget=130;climbing=0;highApples=[newHighApple()];lastTargetTree=-1;harvestAction=null;squirrelAttack=null;lostApple=null;squirrelVisits=0;readSquirrelSettings();squirrelWait=0;squirrelCooldown=clock+squirrelInterval;status();overlay('🪜 Reach the High Apples!','Touch the ladder, move it under the glowing tree, and click to place it. Then click the glowing apple!','Let’s Pick!')}
function spawn(){const treeIndex=Math.floor(rnd(0,3)),tr=trees[treeIndex],kind=Math.random()<.19?'leaf':Math.random()<.09?'acorn':'apple';falling.push({x:clamp(tr.x+rnd(-100,100),45,1155),y:tr.y-rnd(190,260),vy:rnd(140,205)+Math.min(score*6,55),vx:rnd(-15,15),kind,spin:rnd(-2,2),angle:0});spawnIn=rnd(.7,1.35);if(score>=4&&Math.random()<.24)spawnIn=.28}
function update(dt){clock+=dt;for(const e of effects){e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt}effects=effects.filter(e=>e.life>0);if(!running)return;if(mode==='chase'){updateChase(dt);return}jonnyX+=clamp(targetX-jonnyX,-350*dt,350*dt);if(mode==='catch'){spawnIn-=dt;if(spawnIn<=0)spawn();for(const a of falling){a.y+=a.vy*dt;a.x+=a.vx*dt;a.angle+=a.spin*dt;if(a.kind==='apple'&&a.y>495&&a.y<558&&Math.abs(a.x-(jonnyX+37))<55){a.caught=true;score++;window.JohnnySounds?.play('basketpickup',{volume:.29,cooldown:170});puff(a.x,a.y,'#ffdb66',16);note(500+score*35,.13);status()}else if(a.y>615){a.caught=true;if(a.kind==='apple'){misses++;puff(a.x,608,'#d4ae65',6)}}}falling=falling.filter(a=>!a.caught);if(score>=catchGoal){running=false;falling=[];startLadder()}}else if(mode==='ladder'){if(ladderHeld&&!ladderPlaced){ladderX+=clamp(ladderTarget-ladderX,-450*dt,450*dt)}if(ladderPlaced){climbing=Math.min(1,climbing+dt*.75)}if(harvestAction){harvestAction.time+=dt;if(harvestAction.time>=1.35){const a=highApples[score];if(a){window.JohnnySounds?.play('cornsnap',{volume:.34});puff(a.x,a.y,'#ffe76c',20);note(760,.19)}nextHighApple(false)}}
  else if(squirrelAttack){squirrelAttack.time+=dt;const a=highApples[score];if(a&&squirrelAttack.time>=1.65){lostApple={x:a.x,y:a.y,vy:0,age:0};window.JohnnySounds?.play('leaveshake',{volume:.3});puff(a.x,a.y,'#c7e978',12);note(250,.25);squirrelAttack=null;nextHighApple(true)}}
  else if(clock>=squirrelCooldown&&squirrelVisits<squirrelLimit&&highApples[score]){
    // An opportunity is counted when the squirrel visibly enters, not when it wins.
    squirrelAttack={tree:highApples[score].tree,time:0};window.JohnnySounds?.play('squirrel',{volume:.27});window.JohnnySounds?.play('leaveshake',{volume:.25});
    squirrelVisits++;
    squirrelCooldown=clock+squirrelInterval;
    note(350,.12);
  }
  if(lostApple){lostApple.age+=dt;lostApple.vy+=550*dt;lostApple.y+=lostApple.vy*dt;if(lostApple.y>545){lostApple.y=545;lostApple.vy=0}if(lostApple.age>2.2)lostApple=null}}}
function draw(){ground();if(mode==='intro'){johnny(220,535,true);for(let i=0;i<7;i++){let x=250+i*135,y=300+Math.sin(clock*3+i)*12;apple(x,y,.7)}}else if(mode==='catch'){for(const a of falling){g.save();g.translate(a.x,a.y);g.rotate(a.angle);if(a.kind==='apple')apple(0,0,1.08);else if(a.kind==='acorn'){oval(0,0,9,14,'#a67840');oval(0,-9,12,6,'#65452d')}else{oval(0,0,16,7,'#dcb65a')}g.restore()}johnny(jonnyX,535,true)}else if(mode==='ladder'){
 let a=highApples[score];if(a){const tr=trees[a.tree];g.save();g.strokeStyle='#ffe06d';g.lineWidth=7;g.setLineDash([11,9]);g.lineDashOffset=-clock*22;g.beginPath();g.arc(a.x,a.y,34,0,7);g.stroke();if(!ladderPlaced){g.beginPath();g.arc(tr.x,537,52,0,7);g.stroke()}g.restore();
 if(!squirrelAttack||squirrelAttack.time<1.65){const shake=squirrelAttack?Math.sin(clock*36)*Math.min(9,squirrelAttack.time*8):0;apple(a.x+shake,a.y,1.25)}
 }
 if(lostApple)apple(lostApple.x,lostApple.y,1.25);
 if(squirrelAttack){const tr=trees[squirrelAttack.tree];squirrelDraw(tr,squirrelAttack.time);if(squirrelAttack.time>.5){const a=highApples[score];if(a){line([[tr.x+55,tr.y-187],[a.x,a.y]],'#8c562f',5);for(let i=0;i<4;i++)oval(tr.x+55+Math.sin(clock*17+i)*35,tr.y-140+i*14,5,3,'#e3b65e')}}}
 ladder(ladderX,540);
 if(ladderPlaced){johnny(ladderX+20,535-climbing*185,false,climbing);if(harvestAction&&a){const t=clamp(harvestAction.time/1.05,0,1),hx=ladderX+52+(a.x-(ladderX+52))*t,hy=535-climbing*185-55+(a.y-(535-climbing*185-55))*t;line([[ladderX+42,535-climbing*185-52],[hx,hy]],'#efc18b',12);oval(hx,hy,9,9,'#efc18b');if(harvestAction.time>1.05&&harvestAction.time<1.35)apple(hx,hy,.6)}}
 else johnny(jonnyX,535,false);
 if(ladderHeld&&!ladderPlaced){g.font='bold 26px system-ui';g.fillStyle='#fff5c7';g.fillText('Move ladder to the glowing tree',330,60)}
}else if(mode==='chase'){drawChase()}else if(mode==='win'){drawRaccoonFinale();johnny(580,535,true);for(let i=0;i<12;i++)apple(400+i%6*35,510-Math.floor(i/6)*25,.85);g.font='bold 52px system-ui';g.fillStyle='#fff9d7';g.fillText('Great Harvest!',425,120)}for(const e of effects)oval(e.x,e.y,e.r,e.r,e.c);if(helpUntil>clock&&mode==='catch'){g.strokeStyle='#ffe06a';g.lineWidth=8;g.setLineDash([12,10]);g.beginPath();g.arc(jonnyX+37,515,68,0,7);g.stroke()}}
function frame(now){const dt=Math.min((now-last)/1000||0,.04);last=now;update(window.johnnyEyesIsShowing?.()?0:dt);draw();requestAnimationFrame(frame)}
function xy(e){const r=cv.getBoundingClientRect(),ratio=Math.min(r.width/W,r.height/H),ox=(r.width-W*ratio)/2,oy=(r.height-H*ratio)/2;return{x:clamp((e.clientX-r.left-ox)/ratio,0,W),y:clamp((e.clientY-r.top-oy)/ratio,0,H)}}
cv.addEventListener('pointermove',e=>{if(!running)return;const p=xy(e);if(mode==='chase'){if(chase&&chase.stage<3){chase.pointerY=p.y}return}if(mode==='catch')targetX=clamp(p.x-37,45,1120);else if(mode==='ladder'){if(ladderHeld&&!ladderPlaced){ladderTarget=clamp(p.x,70,1130);targetX=ladderTarget-30}else if(!ladderPlaced)targetX=p.x}});
cv.addEventListener('pointerdown',e=>{if(!running)return;const p=xy(e);if(mode==='chase'){chaseClick(p);return}if(mode!=='ladder')return;const a=highApples[score];if(!a||harvestAction||squirrelAttack)return;const tr=trees[a.tree];if(!ladderHeld&&!ladderPlaced){if(dist(p.x,p.y,ladderX,440)<105){ladderHeld=true;note(460);status();puff(ladderX,430,'#ffe66c',12)}return}if(ladderHeld&&!ladderPlaced){if(Math.abs(ladderX-tr.x)<105&&p.y>340){ladderPlaced=true;ladderHeld=false;ladderX=tr.x;climbing=0;note(600);status()}return}if(ladderPlaced&&climbing>.85&&dist(p.x,p.y,a.x,a.y)<54&&!picking){picking=true;harvestAction={time:0};note(620,.12);status()}});
$('start').addEventListener('click',()=>{if(mode==='win'){reset();return}if(mode==='chase'&&chase?.failed){restartRaccoon();return}if(mode==='intro'){startCatch();return}go()});$('again').addEventListener('click',reset);$('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'🔊':'🔇'});$('eyes').addEventListener('click',()=>{helpUntil=clock+4;if(mode==='ladder'){const a=highApples[score];if(a){puff(ladderPlaced?a.x:ladderHeld?trees[a.tree].x:ladderX,ladderPlaced?a.y:ladderHeld?540:435,'#ffeb6b',25)}}note(710)});

// The raccoon chase is a separate finale. Existing apple-catching and ladder logic is unchanged.
// Side-profile raccoon: four-legged gallop, pointed muzzle and striped tail.
function raccoonShape(x,y,size=1,carry=true,t=clock,pose=null){
 g.save();g.translate(x,y);g.scale(-size,size);
 if(pose){const q=pose.progress; if(pose.kind==='hay'){g.translate(0,-145*Math.sin(Math.PI*q));g.rotate(-.10*Math.sin(Math.PI*q))}else if(pose.kind==='fence'){g.translate(0,5*Math.sin(Math.PI*q))}else if(pose.kind==='tractor'){const depth=Math.sin(Math.PI*q);g.translate(0,-65*depth);g.scale(1-.22*depth,1-.22*depth)}}
 const stride=Math.sin(t*18),lift=Math.abs(stride)*3;
 g.translate(0,-lift);
 // Fluffy striped tail arcs behind the body.
 g.save();g.translate(28,-25);g.rotate(Math.sin(t*9)*.16);
 line([[0,0],[20,-12],[39,-31],[58,-28],[68,-14]],'#515254',23);
 for(let i=0;i<3;i++)line([[23+i*15,-17-i*5],[30+i*15,-11-i*5]],'#b5aa95',8);
 g.restore();
 for(let i=0;i<4;i++){const px=i<2?-24:23,phase=stride*(i%2===0?1:-1);
 line([[px,-18],[px+phase*11,5+Math.max(0,phase)*7]],'#484b4a',10);
 oval(px+phase*11,9+Math.max(0,phase)*7,11,5,'#333839')}
 oval(0,-32,47,25,'#777b79');oval(-10,-26,25,12,'#bbb9ae');
 oval(-44,-45,24,21,'#737876');
 for(let i of [-1,1]){oval(-53+i*13,-61,9,10,'#494d50');oval(-53+i*13,-61,4,5,'#c7aaa1')}
 // The mirrored muzzle faces right, with the striped tail trailing left.
 oval(-62,-37,20,11,'#d5d1c4');oval(-78,-40,6,5,'#292d2e');
 oval(-53,-48,10,8,'#353b3c');oval(-56,-49,3,3,'#f5efdb');
 if(carry)apple(-83,-30,.55);
 g.restore();
}
// Johnny's running side profile is intentionally separate from the ladder artwork.
function chaseJohnny(x,y,c){
 g.save();g.translate(x,y);
 const pose=c.pose, q=pose?pose.progress:0;
 const run=c.elapsed*16;
 const stride=Math.sin(run),bob=Math.abs(stride)*3;
 if(pose&&pose.kind==='hay'){
  // A complete forward leap: crouch, take off, tuck knees, clear, land.
  const lift=Math.sin(Math.PI*q);
  g.translate(0,-155*lift);
  g.rotate(-.12*lift);
 }else if(pose&&pose.kind==='fence'){
  // Keep Johnny's proportions intact. A separate hands-and-knees pose is drawn below.
  const lower=Math.min(1,q*7,(1-q)*7);
  g.translate(0,-2*lower);
  if(lower>.01){
   const step=Math.sin(c.elapsed*20);
   oval(0,9,48,6,'#4b6d4655');
   // Anatomically readable side-profile crawl: hips and knees behind,
   // shoulders and hands ahead. Neither limb pair crosses the torso.
   const rear=Math.sin(c.elapsed*15),front=Math.sin(c.elapsed*15+Math.PI);
   oval(0,8,53,5,'#4b6d4655');
   // Rear legs remain under the hips, feet trailing left.
   line([[-29,-18],[-39+rear*6,-2],[-53+rear*8,4]],'#59452d',11);
   line([[-17,-17],[-28-rear*6,0],[-41-rear*7,5]],'#715236',10);
   oval(-53+rear*8,6,12,5,'#49392c');oval(-41-rear*7,7,11,4,'#49392c');
   // Arms begin at the shoulders and reach forward to the right.
   line([[22,-25],[32+front*7,-8],[48+front*8,3]],'#e6b687',10);
   line([[32,-22],[43-front*6,-7],[57-front*7,3]],'#f0c398',9);
   oval(48+front*8,5,9,5,'#efc18f');oval(57-front*7,5,8,4,'#efc18f');
   // Horizontal body, forward-looking face, and firmly attached hat.
   oval(-3,-28,44,19,'#2b90bc');
   oval(37,-32,19,20,'#efc18f');oval(49,-35,3,3,'#293d3a');
   line([[46,-24],[53,-24]],'#9b6654',2);
   oval(34,-54,27,6,'#a86f34');g.fillStyle='#b17b3d';g.fillRect(13,-62,40,10);
   g.restore();return;
  }
 }else if(pose&&pose.kind==='tractor'){
  // A smooth background detour: rise into the far lane, shrink with perspective,
  // then return to the near lane after passing the tractor.
  const depth=Math.sin(Math.PI*q);
  g.translate(0,-68*depth);
  g.scale(1-.24*depth,1-.24*depth);
 }else{g.translate(0,-bob)}
 const jumping=pose&&pose.kind==='hay';
 const ducking=pose&&pose.kind==='fence';
 const leg=jumping?Math.sin(Math.PI*q)*.75:ducking?.32:stride;
 // Opposite arms and legs show running; during a jump both knees tuck up.
 line([[-10,-48],[-17-(jumping?13:0),-21-leg*11]],'#eebd8c',10);
 line([[12,-48],[20+(jumping?13:0),-26+leg*11]],'#eebd8c',10);
 line([[-7,-17],[-10+leg*15,8-(jumping?20*Math.sin(Math.PI*q):0)]],'#59452d',13);
 line([[8,-17],[10-leg*15,8-(jumping?20*Math.sin(Math.PI*q):0)]],'#59452d',13);
 oval(-10+leg*15,10-(jumping?20*Math.sin(Math.PI*q):0),12,5,'#45382c');
 oval(10-leg*15,10-(jumping?20*Math.sin(Math.PI*q):0),12,5,'#45382c');
 g.fillStyle='#2b90bc';g.fillRect(-16,-66,32,49);
 g.fillStyle='#e7b982';g.fillRect(-11,-78,22,15);
 oval(0,-100,21,23,'#efc18f');oval(15,-95,9,11,'#efc18f');
 oval(12,-105,3,3,'#293d3a');line([[15,-88],[20,-88]],'#9b6654',2);
 oval(-2,-124,30,7,'#a86f34');g.fillStyle='#b17b3d';g.fillRect(-21,-139,38,15);
 g.restore();
}
function chaseObstacle(type,x,y){g.save();g.translate(x,y);if(type==='log'){line([[-36,0],[36,0]],'#67442c',28);oval(-32,0,13,15,'#b77a4a');oval(-32,0,7,8,'#dca269')}else if(type==='mud'){oval(0,5,54,19,'#674a32');oval(-13,1,26,8,'#8c6946');oval(22,0,12,5,'#a28053')}else{oval(0,-10,26,23,'#679b49');oval(-13,-22,18,18,'#83b75b');oval(17,-25,19,17,'#73a84e')}g.restore()}
// Continuous side-scrolling reaction chase: one target per approaching obstacle.
const chaseKinds=['hay','fence','tractor'];
function nextChaseObstacle(){
 const c=chase;if(c.completed>=c.total){beginHide();return}
 const choices=chaseKinds.filter(k=>k!==c.lastKind);
 const kind=choices[Math.floor(Math.random()*choices.length)];c.lastKind=kind;
 c.stage=c.completed<4?1:c.completed<8?2:3;
 c.obstacle={kind,x:1190,clicked:false,resolved:false,passed:false,feedback:0,side:Math.random()<.5?-1:1};
 status();
}
function startRaccoon(){window.JohnnySounds?.stop();window.JohnnySounds?.play('raccoon',{volume:.3});
 readSquirrelSettings();
 mode='chase';running=false;
 chase={stage:1,completed:0,total:12,mistakes:0,maxMistakes:3,elapsed:0,
 obstacle:null,lastKind:null,failed:false,hideSpot:0,hideMoves:0,hideDeadline:12,
 hideClock:0,finaleTime:0,world:0,lead:380,stumble:0,action:null,actionTime:0,waitNext:0};
 nextChaseObstacle();status();
 overlay('🦝 The Great Apple Chase!','The orchard keeps moving! Click the ONE glowing circle before Johnny reaches each obstacle. Miss three and the raccoon escapes!','Chase the Raccoon!');
}
function restartRaccoon(){startRaccoon();go()}
function failRaccoon(){chase.failed=true;running=false;overlay('🦝 The Raccoon Escaped!','Johnny fell too far behind. Try the chase again!','Try Chase Again')}
function finishRaccoon(){
 // Let the child see the recovery before the victory overlay interrupts it.
 chase.stage=5;chase.finaleTime=0;chase.obstacle=null;
 note(760,.22);status();
}
function finishRaccoonCelebration(){window.JohnnySounds?.stop();
 mode='win';running=false;status();
 overlay('🎉 Harvest Complete!','Johnny got his apple back! The raccoon gets a fallen apple, and the harvest is safe.','Play Again');
 note(820,.25);puff(600,280,'#ffe16a',55);
}
function beginHide(){const c=chase;c.stage=4;c.hideClock=0;c.hideMoves=0;c.hideSpot=Math.floor(rnd(0,4));c.hideDeadline=13;c.obstacle=null;status();note(690,.22)}
function chaseTarget(o){
 const radius=chaseTargetSize(chase?.completed??0);
 // The circle moves WITH the approaching obstacle, rather than being a fixed answer button.
 if(o.kind==='hay')return {x:o.x,y:345,r:radius};
 if(o.kind==='fence')return {x:o.x,y:502,r:radius};
 return {x:o.x+(o.side<0?-118:118),y:363,r:radius};
}
function updateChase(dt){
 const c=chase;if(!c||c.failed)return;
 c.elapsed+=dt;c.world+=dt*245;
 c.stumble=Math.max(0,c.stumble-dt);
 if(c.actionTime>0){c.actionTime=Math.max(0,c.actionTime-dt);if(c.actionTime===0)c.action=null}
 if(c.stage===5){c.finaleTime+=dt;if(c.finaleTime>=9.2)finishRaccoonCelebration();return}
 if(c.stage===4){c.hideClock+=dt;c.hideDeadline-=dt;if(c.hideDeadline<=0){c.hideMoves++;if(c.hideMoves>=3){failRaccoon();return}c.hideSpot=Math.floor(rnd(0,4));c.hideDeadline=11;note(260,.16)}return}
 if(!c.obstacle){c.waitNext-=dt;if(c.waitNext<=0)nextChaseObstacle();return}
 const o=c.obstacle;
 // The scenery and obstacle never stop. Slightly faster in the final third.
 const speed=c.stage===1?245:c.stage===2?270:295;
 o.x-=speed*dt;
 // Resolve at the takeoff point. A successful click arms the maneuver;
 // its pose is driven by the obstacle position, never by click timing.
 if(!o.resolved&&o.x<=515){
  o.resolved=true;
  if(o.clicked){window.JohnnySounds?.play(o.kind==='jump'?'newlanding':o.kind==='duck'?'walksand':'running-feet',{volume:.28,cooldown:240});c.action=o.kind;note(690,.12);puff(355,495,'#ffe578',13);c.lead=Math.max(195,c.lead-19)}
  else{window.JohnnySounds?.play('cartoonstumble',{volume:.35});c.mistakes++;c.stumble=1.05;c.lead+=105;note(220,.2);puff(355,510,'#dba26c',18);
   if(c.mistakes>=c.maxMistakes){failRaccoon();return}}
  status();
 }
 if(o.x < -175){c.completed++;c.obstacle=null;c.waitNext=.5+Math.random()*.5;if(c.completed>=c.total)beginHide();else status()}
}
function chaseClick(p){const c=chase;if(!c||c.failed||!running)return;
 if(c.stage===5)return;
 if(c.stage===4){const centers=[235,475,725,965];const pick=centers.findIndex(x=>Math.abs(p.x-x)<100&&p.y>325&&p.y<570);if(pick<0)return;
  if(pick===c.hideSpot){finishRaccoon();return}
  c.hideMoves++;note(260,.16);puff(centers[pick],450,'#e8cb7d',12);
  if(c.hideMoves>=3){failRaccoon();return}
  c.hideSpot=Math.floor(rnd(0,4));c.hideDeadline=11;return}
 const o=c.obstacle;if(!o||o.resolved||o.clicked)return;
 // One clickable target, active until the maneuver's takeoff point.
 if(o.x>1120||o.x<515)return;
 const z=chaseTarget(o);
 if(dist(p.x,p.y,z.x,z.y)<=z.r){o.clicked=true;note(740,.1);puff(z.x,z.y,'#ffe66b',15)}
}
function chaseDrawObstacle(o){
 g.save();g.translate(o.x,0);
 // Every obstacle is anchored to the runners' ground line (y=555),
 // with a shadow, shaded surfaces and foreground outlines.
 oval(0,551,103,11,'#5d472e55');
 if(o.kind==='hay'){
  g.fillStyle='#a66e2c';g.fillRect(-70,453,148,101);
  g.fillStyle='#e9b64d';g.fillRect(-77,443,146,100);
  g.fillStyle='#f6d16c';g.fillRect(-73,447,136,20);
  for(let i=0;i<6;i++)line([[-69,473+i*12],[61,473+i*12]],i%2?'#c58a34':'#d8a044',3);
  line([[-25,446],[-25,543]],'#997032',6);line([[30,446],[30,543]],'#997032',6);
  line([[-76,443],[69,443],[69,543],[-76,543],[-76,443]],'#9d6c29',4);
 }else if(o.kind==='fence'){
  // Raised rail, with a genuinely usable opening for a full-sized crawling pose.
  for(const px of [-101,95]){g.fillStyle='#71472d';g.fillRect(px,387,19,168);g.fillStyle='#a4764b';g.fillRect(px+3,390,7,158)}
  g.fillStyle='#895832';g.fillRect(-109,420,226,29);
  g.fillStyle='#c3935d';g.fillRect(-109,419,226,11);
  line([[-108,451],[116,451]],'#6e4528',4);
 }else{
  // Solid, dimensional tractor with clear wheels and front-facing body.
  g.fillStyle='#6d4931';g.fillRect(-105,515,218,17);
  g.fillStyle='#b5332c';g.fillRect(-90,441,185,67);
  g.fillStyle='#e75a3f';g.fillRect(-91,438,163,16);
  g.fillStyle='#8e342c';g.fillRect(65,468,44,35);
  g.fillStyle='#d6a94e';g.fillRect(-36,393,89,55);
  g.fillStyle='#7fb0bd';g.fillRect(-25,401,64,37);
  line([[-41,444],[-41,392],[50,392],[50,443]],'#6b4933',7);
  g.fillStyle='#443b33';g.fillRect(-48,379,44,12);
  oval(-57,520,39,40,'#2e3438');oval(-57,520,20,21,'#b9b9b5');
  oval(77,520,48,49,'#2e3438');oval(77,520,24,25,'#b9b9b5');
  oval(-57,520,8,9,'#797e7d');oval(77,520,9,9,'#797e7d');
 }
 g.restore();
}
function drawChase(){const c=chase;if(!c)return;
 if(c.stage===5){drawAppleReturnFinale(c.finaleTime);return}
 if(c.stage===4){g.fillStyle='#b58b54';g.fillRect(0,530,W,145);g.fillStyle='#946638';g.fillRect(0,220,W,40);g.fillStyle='#c19a63';g.fillRect(90,240,1020,120);g.font='bold 34px system-ui';g.fillStyle='#fff4d0';g.fillText('Where is the raccoon hiding?',320,110);
  const spots=[235,475,725,965];spots.forEach((x,i)=>{g.save();g.translate(x,450);if(i%2===0){g.fillStyle='#a66b3c';g.fillRect(-83,-45,166,100);for(let n=-1;n<=1;n++)line([[n*45,-43],[n*45,52]],'#dfad6a',5)}else{oval(0,2,84,65,'#4e9747');oval(-35,-28,45,47,'#70b453');oval(38,-25,46,45,'#5ca44b')}
  if(i===c.hideSpot){
   const reveal=Math.min(2,c.hideMoves),wiggle=Math.sin(clock*5)*4;
   const length=[17,43,72][reveal],thick=[8,13,19][reveal];
   // Tail is attached behind the hiding object; each attempt exposes more.
   const startX=67;
   g.save();g.lineCap='round';g.strokeStyle='#54575a';g.lineWidth=thick;
   g.beginPath();g.moveTo(startX,-18);g.quadraticCurveTo(startX+length*.55,-32+wiggle,startX+length,-22+wiggle);g.stroke();
   g.strokeStyle='#c9c0ae';g.lineWidth=Math.max(4,thick*.38);
   for(let band=0;band<3;band++){const bx=startX+length*(.40+band*.22);if(bx>startX+length-3)continue;g.beginPath();g.moveTo(bx,-28+wiggle);g.lineTo(bx+4,-16+wiggle);g.stroke()}
   g.restore();
  }
  g.restore()});johnny(95,535,false);g.fillStyle='#fff5ce';g.font='bold 25px system-ui';g.fillText('Look for the striped tail! Click its hiding place.',275,175);g.fillText('Tries left: '+(3-c.hideMoves),480,210);return}
 // Parallax scenery continues to scroll even when Johnny stumbles.
 const off=c.world%310;
 for(let i=-1;i<6;i++){const x=i*310-off;oval(x+110,410,88,82,'#598e42');oval(x+145,380,60,66,'#6fa64c');line([[x+120,450],[x+120,550]],'#7c5537',17)}
 g.fillStyle='#b58d58';g.fillRect(0,555,W,120);
 for(let i=-1;i<12;i++){const x=i*145-(c.world*1.2%145);line([[x,587],[x+55,587]],'#d7b07a',5)}
 const o=c.obstacle;
 // Both characters cross the same moving obstacle in world space.
 // Raccoon goes first at x~800; Johnny follows at x~345.
 // The arc starts before the near edge and ends beyond the far edge.
 const rx=Math.min(1080,450+c.lead);
 const crossing=(actorX,halfWidth)=>o?clamp((actorX+halfWidth-o.x)/(2*halfWidth),0,1):0;
 const activeCrossing=(actorX,halfWidth)=>Boolean(o&&o.x<=actorX+halfWidth&&o.x>=actorX-halfWidth);
 const raccoonPose=activeCrossing(rx,175)?{kind:o.kind,progress:crossing(rx,175)}:null;
 const johnnyPose=o&&o.clicked&&activeCrossing(345,170)?{kind:o.kind,progress:crossing(345,170)}:null;
 let jy=540;
 if(c.stumble>0)jy+=Math.sin(clock*17)*10;
 // Tractor detours go BEHIND the tractor. Other obstacles are drawn
 // before the runners so the jump/duck silhouettes remain readable.
 if(o&&o.kind==='tractor'){
  raccoonShape(rx,538,1.02,true,clock,raccoonPose);
  chaseJohnny(345,jy,{elapsed:clock*(c.stumble>0?.45:1),pose:johnnyPose});
  chaseDrawObstacle(o);
 }else{
  if(o)chaseDrawObstacle(o);
  raccoonShape(rx,538,1.02,true,clock,raccoonPose);
  chaseJohnny(345,jy,{elapsed:clock*(c.stumble>0?.45:1),pose:johnnyPose});
 }
 if(o&&!o.resolved&&!o.clicked&&o.x<=1120&&o.x>=515){const z=chaseTarget(o);g.save();g.strokeStyle='#ffdb42';g.lineWidth=9;g.setLineDash([13,8]);g.lineDashOffset=-clock*28;g.beginPath();g.arc(z.x,z.y,z.r,0,Math.PI*2);g.stroke();g.setLineDash([]);g.fillStyle='rgba(255,222,86,.18)';g.beginPath();g.arc(z.x,z.y,z.r-9,0,Math.PI*2);g.fill();g.restore()}
 if(o&&o.clicked&&!o.resolved){const z=chaseTarget(o);g.fillStyle='#fff7b2';g.font='bold 25px system-ui';g.fillText('Great click!',z.x-65,z.y-80)}
 g.fillStyle='#fff8dd';g.font='bold 27px system-ui';g.fillText('Click the glowing circle before Johnny reaches it!',190,86);
 g.font='bold 23px system-ui';g.fillText(`Obstacles ${c.completed} / ${c.total}       Chances left ${c.maxMistakes-c.mistakes}`,305,125);
 g.fillStyle='#284c34';g.fillRect(280,157,640,15);g.fillStyle='#ffe17a';g.fillRect(280,157,640*c.completed/c.total,15);
}
// Nine-second storybook handoff: emerge, approach, kneel, offer, transfer, celebrate.
function drawAppleReturnFinale(t){
 const ease=v=>{v=clamp(v,0,1);return v*v*(3-2*v)};
 const approach=ease((t-1.1)/2.0),kneel=ease((t-3.2)/.8);
 const raccoonX=830-115*ease((t-.3)/1.4);
 const johnnyX=205+340*approach;
 // Barn, orchard and basket provide a stable scene while the story plays.
 g.fillStyle='#c79d65';g.fillRect(0,552,W,123);
 g.fillStyle='#8b5937';g.fillRect(850,300,245,250);
 g.fillStyle='#b77749';g.fillRect(870,320,207,230);
 g.fillStyle='#754b36';g.fillRect(930,425,85,125);
 g.fillStyle='#5c994b';oval(755,502,120,85,'#4b9445');
 // Raccoon carries the apple until it gives it to Johnny.
 const transfer=ease((t-5.1)/1.1);
 raccoonShape(raccoonX,539,1.1,false,t);
 if(t<5.15){apple(raccoonX+76,505,.78)}
 else if(t<6.3){apple(raccoonX+76+(johnnyX+45-raccoonX-76)*transfer,505-32*Math.sin(Math.PI*transfer),.78)}
 // Johnny approaches, kneels to receive the apple, then stands and waves.
 g.save();g.translate(johnnyX,539);
 if(t<3.3){chaseJohnny(0,0,{elapsed:t*1.2,pose:null})}
 else{
  const rise=ease((t-7.2)/.7),lower=kneel*(1-rise);
  g.translate(0,18*lower);
  g.rotate(-.15*lower);
  // Body remains full-sized; knees bend as he reaches forward.
  line([[-10,-22],[-20,8]],'#59452d',12);
  line([[8,-22],[16+15*lower,8]],'#59452d',12);
  oval(-20,10,12,5,'#45382c');oval(16+15*lower,10,12,5,'#45382c');
  g.fillStyle='#2b90bc';g.fillRect(-16,-66,32,46);
  line([[12,-55],[32+15*lower,-34]],'#eebd8c',11);
  oval(32+15*lower,-34,9,9,'#eebd8c');
  oval(0,-99,21,23,'#efc18f');oval(12,-104,3,3,'#293d3a');
  oval(-2,-123,30,7,'#a86f34');g.fillStyle='#b17b3d';g.fillRect(-21,-138,38,15);
  if(t>7.8){line([[-12,-54],[-28,-91+Math.sin(t*10)*7]],'#eebd8c',11)}
 }
 g.restore();
 if(t>=6.3){apple(johnnyX+43,504,.78)}
 // The raccoon receives a fallen apple, not the stolen one.
 if(t>=7.3){apple(raccoonX+90,543,.62)}
 g.font='bold 34px system-ui';g.fillStyle='#fff6cc';
 const message=t<2?'The raccoon peeks out...':t<4?'Johnny walks over...':t<5.2?'Can I have my apple back?':t<7.3?'The raccoon gives it back!':'The harvest is safe!';
 g.fillText(message,360,135);
 if(t>7.4){for(let i=0;i<14;i++){const px=(i*91+clock*35)%W,py=(i*73+clock*60)%420;oval(px,py,6,4,i%2?'#f6d15e':'#db8b49')}}
}
function drawRaccoonFinale(){raccoonShape(750,532,1.15,false);apple(695,515,.95);g.fillStyle='#fff4b6';g.font='bold 24px system-ui';g.fillText('The harvest is safe!',470,170)}

reset();if(chaseDirect)startRaccoon();requestAnimationFrame(frame);
