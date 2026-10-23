(()=>{'use strict';
const canvas=document.getElementById('world'),c=canvas.getContext('2d'),msg=document.getElementById('message'),score=document.getElementById('score'),welcome=document.getElementById('welcome');
const W=1200,H=690;let tractor,hay,delivered,phase='intro',target=null,last=0,active=true,sound=true,audio=null,helpAt=0;
function announce(t){msg.textContent=t;if(sound&&window.speechSynthesis&&phase==='playing'){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.92;u.pitch=1.12;speechSynthesis.speak(u)}}
function reset(){tractor={x:180,y:470,angle:-.4,speed:0,load:0,wagonAngle:-.4,wheelSpin:0,steer:0,dust:[]};hay=[{x:610,y:180},{x:825,y:255},{x:960,y:490}];delivered=0;target=null;score.textContent='0 / 3';phase='intro';welcome.hidden=false;document.getElementById('welcomeTitle').textContent='Hay Bale Hustle!';document.getElementById('welcomeText').textContent='Guide the tractor to each hay bale. Watch the wagon load, then drive inside the big animal barn to unload!';document.getElementById('start').textContent='Start driving!';announce('Drive to the golden hay bales!')}
function blocked(){return document.hidden||!document.hasFocus()||!!document.querySelector('[id*="freeze"][style*="display: block"],.freeze-screen-overlay:not([hidden])')}
function ellipse(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function poly(points,fill,stroke='#0000',width=1){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=fill;c.fill();if(stroke!=='#0000'){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function path(){c.lineCap='round';c.lineJoin='round';c.strokeStyle='#a37c4d';c.lineWidth=120;c.beginPath();c.moveTo(95,520);c.bezierCurveTo(340,500,380,260,610,285);c.bezierCurveTo(860,300,900,490,1170,450);c.stroke();c.strokeStyle='#e7c18a';c.lineWidth=109;c.stroke();c.strokeStyle='#f7dca5';c.lineWidth=92;c.stroke();c.strokeStyle='#e5bd82';c.lineWidth=3;c.setLineDash([5,26]);c.stroke();c.setLineDash([])}
function tree(x,y,r=38){ellipse(x+9,y+22,r*.8,r*.32,'#577d38');box(x-7,y-6,14,44,'#926139');for(const [dx,dy,sz,col] of [[-20,-22,.76,'#3b8b43'],[18,-29,.9,'#438f42'],[0,-45,1,'#59a84d'],[-11,-54,.6,'#6bb756']])ellipse(x+dx,y+dy,r*sz,r*sz*.86,col)}
function fence(x,y,w){for(let i=0;i<=w;i+=38){box(x+i,y-17,8,47,'#a56b32');poly([[x+i-2,y-17],[x+i+4,y-28],[x+i+12,y-17]],'#d59c51')}box(x,y-7,w+8,8,'#d8a15a');box(x,y+14,w+8,8,'#d8a15a')}
const BARN_DROP={x:250,y:250};
function barn(t){
 // Open-roof drive-through shelter, large enough for tractor and trailer.
 ellipse(231,293,205,105,'#608c43');
 box(49,88,366,335,'#75482f');box(66,104,333,303,'#d9b47c');
 for(let y=123;y<397;y+=30)box(77,y,310,2,'#bd925e');
 // Side bays and open center driving lane, entrance at the bottom.
 box(49,88,64,335,'#b94330');box(350,88,65,335,'#b94330');
 for(let y=105;y<409;y+=28){box(61,y,39,4,'#e66a48');box(363,y,38,4,'#e66a48')}
 box(49,82,366,37,'#793c2d');box(55,87,354,20,'#c85035');
 box(107,118,244,36,'#93643d');
 c.font='bold 22px Trebuchet MS';c.fillStyle='#fff1c4';c.textAlign='center';c.fillText('ANIMAL BARN',232,143);c.textAlign='left';
 // Hay stalls to the sides, leaving a wide vehicle passage.
 for(let y of [190,275]){bale(133,y,.64);bale(340,y,.64)}
 box(183,183,132,118,'#b88e58');box(191,191,116,102,'#e7c78b');
 c.strokeStyle='#f8e8b5';c.lineWidth=5;c.setLineDash([10,12]);c.strokeRect(203,204,92,76);c.setLineDash([]);
 c.font='bold 17px Trebuchet MS';c.fillStyle='#624425';c.textAlign='center';c.fillText('UNLOAD HAY',249,239);c.textAlign='left';
 // Open barn doors, posts and threshold at the entrance.
 box(111,391,65,36,'#9b4830');box(327,391,72,36,'#9b4830');
 box(178,400,148,8,'#f3dca2');
 if(tractor.load){c.strokeStyle='#ffea73';c.lineWidth=6;c.beginPath();c.arc(BARN_DROP.x,BARN_DROP.y,62+Math.sin(t/280)*4,0,Math.PI*2);c.stroke()}
}

function bale(x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);ellipse(5,23,35,12,'#5b713c77');poly([[-30,-14],[18,-14],[34,-5],[-14,-5]],'#ffe18a');poly([[-14,-5],[34,-5],[34,25],[-14,25]],'#c28a2f');poly([[-30,-14],[-14,-5],[-14,25],[-30,15]],'#dda83f');c.strokeStyle='#9d702e';c.lineWidth=3;for(let q of [0,20]){c.beginPath();c.moveTo(q-16,-9);c.lineTo(q,0);c.lineTo(q,23);c.stroke()}c.restore()}
function cow(x,y){ellipse(x+2,y+30,58,16,'#5c8a47');ellipse(x,y,53,29,'#f7f5e8');ellipse(x-17,y-6,16,15,'#383e43');ellipse(x+17,y+10,14,13,'#383e43');ellipse(x+42,y-12,25,23,'#f8f6ed');ellipse(x+60,y-4,18,12,'#eaa5a7');ellipse(x+49,y-22,7,7,'#333');ellipse(x+64,y-22,7,7,'#333');for(let dx of [-30,24])box(x+dx,y+20,12,28,'#e7e6dd')}
function scenery(t){box(0,0,W,H,'#9ccc67');for(let i=0;i<300;i++){let x=(i*191+53)%W,y=(i*137+31)%H;ellipse(x,y,2+i%3,1+i%2,i%3?'#80ba55':'#c2df81')}poly([[940,0],[1200,0],[1200,150],[1070,185],[990,120]],'#77b65a');for(let i=0;i<9;i++){let x=950+i*30;poly([[x,25],[x+12,20],[x+17,95],[x+5,101]],i%2?'#e5b94e':'#79ad45')};path();fence(700,73,200);fence(990,196,155);fence(720,192,195);cow(835,145);tree(365,110,48);tree(1080,85,51);tree(1085,615,57);tree(440,585,42);tree(75,638,45);tree(660,580,37);barn(t);for(let i=0;i<40;i++){const x=(i*227+91)%W,y=(i*169+83)%H;if((x-600)**2+(y-345)**2>18000){ellipse(x,y,4,4,'#fff9da');ellipse(x+5,y+3,3,3,'#ffdc66')}}}
function vehicle(t){
 const speed=tractor.speed, moving=speed>8;
 const hitchX=tractor.x-Math.cos(tractor.angle)*49,hitchY=tractor.y-Math.sin(tractor.angle)*49;
 const wagonX=hitchX-Math.cos(tractor.wagonAngle)*58,wagonY=hitchY-Math.sin(tractor.wagonAngle)*58;
 // articulated hitch and separate wagon rotate independently
 c.strokeStyle='#4b4e47';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(hitchX,hitchY);c.lineTo(wagonX+Math.cos(tractor.wagonAngle)*35,wagonY+Math.sin(tractor.wagonAngle)*35);c.stroke();
 c.save();c.translate(wagonX,wagonY);c.rotate(tractor.wagonAngle);
 ellipse(5,8,59,37,'#426a2d66');
 for(const x of [-33,29])for(const y of [-36,36]){ellipse(x,y,15,12,'#222c2b');ellipse(x,y,6,6,'#d2a451')}
 poly([[-49,-30],[45,-30],[45,30],[-49,30]],'#985825','#58371e',5);
 poly([[-41,-23],[37,-23],[37,23],[-41,23]],'#c88a43','#e8b467',3);
 for(let x=-35;x<38;x+=16)box(x,-21,3,42,'#a56c31');
 if(tractor.load){bale(-19,-8,.66);bale(19,-8,.66)}
 c.restore();
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
 ellipse(-22,2,16,16,'#eec28d');ellipse(-25,-1,14,9,'#b97b37');
 c.strokeStyle='#354044';c.lineWidth=4;c.beginPath();c.arc(-1,0,11,0,Math.PI*2);c.stroke();
 c.strokeStyle='#ffffff99';c.lineWidth=3;c.beginPath();c.moveTo(-36,-17);c.lineTo(-29,-17);c.stroke();
 // exhaust stack and gentle puff
 ellipse(22,-12,6,6,'#303638');ellipse(22,-12,3,3,'#9fa6a1');
 if(moving){ellipse(-51,0,3+Math.sin(t/90)*1.5,3,'#fff6cfaa')}
 c.restore();
 for(const p of tractor.dust){ellipse(p.x,p.y,p.r,p.r*.7,'#d5bb7a66')}
}
function draw(t){c.clearRect(0,0,W,H);scenery(t);for(const h of hay)bale(h.x,h.y,1.1);if(phase==='playing'){const dest=tractor.load?BARN_DROP:hay[0];if(dest){c.save();c.setLineDash([12,17]);c.strokeStyle='#fff8c8';c.lineWidth=5;c.beginPath();c.moveTo(tractor.x,tractor.y);c.lineTo(dest.x,dest.y);c.stroke();c.restore();ellipse(dest.x,dest.y+35,42+4*Math.sin(t/260),11,'#ffe77c77')}}vehicle(t)}
function wagonYForDelivery(){return tractor.y-Math.sin(tractor.angle)*49-Math.sin(tractor.wagonAngle)*58}
function update(dt){if(phase!=='playing'||!active||blocked())return;const dest=target;if(dest){const dx=dest.x-tractor.x,dy=dest.y-tractor.y,d=Math.hypot(dx,dy);if(d>10){const want=Math.atan2(dy,dx);let delta=Math.atan2(Math.sin(want-tractor.angle),Math.cos(want-tractor.angle));tractor.steer=Math.max(-.8,Math.min(.8,delta));tractor.angle+=Math.max(-dt*2.2,Math.min(dt*2.2,delta));tractor.speed=Math.min(160,tractor.speed+dt*115);tractor.x+=Math.cos(tractor.angle)*tractor.speed*dt;tractor.y+=Math.sin(tractor.angle)*tractor.speed*dt;tractor.x=Math.max(80,Math.min(W-80,tractor.x));tractor.y=Math.max(95,Math.min(H-65,tractor.y));
 tractor.wagonAngle+=Math.atan2(Math.sin(tractor.angle-tractor.wagonAngle),Math.cos(tractor.angle-tractor.wagonAngle))*Math.min(1,dt*2.0);
 tractor.wheelSpin+=tractor.speed*dt/17;
 if(Math.random()<dt*13)tractor.dust.push({x:tractor.x-Math.cos(tractor.angle)*64+(Math.random()-.5)*18,y:tractor.y-Math.sin(tractor.angle)*64+(Math.random()-.5)*18,r:4,life:.7});
 }else {tractor.speed=Math.max(0,tractor.speed-dt*240);tractor.steer*=.85;}
 tractor.dust=tractor.dust.filter(p=>(p.life-=dt)>0);for(const p of tractor.dust)p.r+=dt*17;
 }if(!tractor.load){const idx=hay.findIndex(h=>Math.hypot(h.x-tractor.x,h.y-tractor.y)<72);if(idx>=0){hay.splice(idx,1);tractor.load=1;announce('Hay loaded! Drive through the barn doors to the glowing unloading spot!');target={...BARN_DROP}}}else if(Math.hypot(tractor.x-BARN_DROP.x,tractor.y-BARN_DROP.y)<54 && tractor.y<305 && wagonYForDelivery()<395){tractor.load=0;delivered++;score.textContent=delivered+' / 3';if(delivered===3){phase='complete';welcome.hidden=false;document.getElementById('welcomeTitle').textContent='Wonderful farm helper!';document.getElementById('welcomeText').textContent='All three hay bales reached the animals. You learned how tractors haul farm supplies!';document.getElementById('start').textContent='Play again!';target=null}else{announce('Hay delivered inside the barn! Find the next bale!');target=hay[0]}}}
function frame(t){const dt=Math.min(.035,(t-last)/1000||0);last=t;update(dt);draw(t);requestAnimationFrame(frame)}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
canvas.addEventListener('pointermove',e=>{if(phase==='playing'&&e.buttons===0&&!blocked())target=point(e)});canvas.addEventListener('pointerdown',e=>{if(phase==='playing'&&!blocked())target=point(e)});
document.getElementById('start').addEventListener('click',()=>{if(phase==='complete')reset();phase='playing';welcome.hidden=true;target=hay[0];announce('Drive toward the glowing hay bale!')});document.getElementById('reset').addEventListener('click',reset);document.getElementById('hint').addEventListener('click',()=>{if(phase==='playing'){target=tractor.load?BARN_DROP:hay[0];announce(tractor.load?'Take the hay to the animal barn!':'Follow the dotted line to a hay bale!')}});document.getElementById('sound').addEventListener('click',e=>{sound=!sound;e.currentTarget.textContent=sound?'🔊 Sound':'🔇 Sound';if(!sound&&speechSynthesis)speechSynthesis.cancel()});window.addEventListener('blur',()=>{active=false;if(window.speechSynthesis)speechSynthesis.cancel()});window.addEventListener('focus',()=>active=true);document.addEventListener('visibilitychange',()=>{if(document.hidden&&window.speechSynthesis)speechSynthesis.cancel()});reset();requestAnimationFrame(frame);
})();
