(()=>{'use strict';
function create(c){const M=window.TurkeyModel,PI=Math.PI,T=2*PI;
function ellipse(x,y,rx,ry,fill,stroke=null,lw=3){c.beginPath();c.ellipse(x,y,rx,ry,0,0,T);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function poly(pts,fill,stroke=null,lw=3){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function line(pts,col='#754c36',w=5){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();}
function star(x,y,r,col){let a=[];for(let i=0;i<10;i++){let th=-PI/2+i*PI/5,rr=i%2?r*.43:r;a.push([x+Math.cos(th)*rr,y+Math.sin(th)*rr]);}poly(a,col,'#886142',2);}
function heart(x,y,scale,col){c.save();c.translate(x,y);c.scale(scale,scale);c.beginPath();c.moveTo(0,22);c.bezierCurveTo(-45,-5,-22,-32,0,-10);c.bezierCurveTo(22,-32,45,-5,0,22);c.fillStyle=col;c.fill();c.restore();}
function tree(x,y,colors){line([[x,y],[x,y-140]],'#79573a',26);for(let i=0;i<6;i++){let a=i*T/6;ellipse(x+Math.cos(a)*54,y-175+Math.sin(a)*42,66,57,colors[i%colors.length],null);}}
function sky(top,bottom){const g=c.createLinearGradient(0,0,0,600);g.addColorStop(0,top);g.addColorStop(1,bottom);c.fillStyle=g;c.fillRect(0,0,1000,600);ellipse(860,93,48,48,'#fff1ad');}
function grass(){poly([[0,425],[210,380],[480,430],[720,383],[1000,420],[1000,600],[0,600]],'#a5bf83');poly([[0,505],[290,474],[570,507],[1000,475],[1000,600],[0,600]],'#b3a977');}
function barn(){// Entire roof, walls, and doors remain inside the scene.
poly([[675,315],[835,192],[967,315],[967,475],[675,475]],'#b86650','#804d43',5);poly([[654,318],[830,173],[987,318],[960,318],[830,213],[683,337]],'#754d49','#633e3d',4);
poly([[777,475],[777,350],[865,350],[865,475]],'#8c493d','#6b3b34',4);line([[821,350],[821,475]],'#e5ae80',4);for(let x of [712,909]){c.fillStyle='#f6d7a3';c.fillRect(x,340,37,40);c.strokeStyle='#83574b';c.lineWidth=4;c.strokeRect(x,340,37,40);}}
function scene(d,t){const n=d.scene||0;sky(['#bce4df','#bed7e9','#d8c3e0','#a6d6c6','#e7c6a4','#b8d7d0'][n],['#f9dfb0','#f7e0bc','#f9ddbf','#f5e2b2','#ffecd0','#f6e5b8'][n]);grass();
if(n===0){for(let x of [85,900]){tree(x,420,['#d69b54','#c77a47','#e6b357']);for(let j=0;j<5;j++)ellipse(x-60+j*27,260+(j%2)*20,9,10,'#dc6445');}line([[0,465],[1000,465]],'#8f7952',8);}
if(n===1){tree(105,440,['#cb9754','#dba64f','#bd7948']);barn();poly([[60,480],[170,480],[185,515],[65,515]],'#d88e48');for(let x=180;x<620;x+=85){line([[x,435],[x,503]],'#a17a4e',9);line([[x-35,460],[x+35,460]],'#c79b62',7);}}
if(n===2){tree(90,430,['#df9b52','#c37b54','#e3b966']);tree(910,430,['#b78051','#d7a34e']);poly([[250,470],[750,470],[715,500],[280,500]],'#9e674d');for(let x=290;x<720;x+=78){ellipse(x,452,20,23,'#e79b3d');line([[x,434],[x+7,422]],'#598a51',4);}for(let i=0;i<9;i++){let x=140+i*92;star(x,125+(i%2)*20,9,['#edb24c','#d77c54','#e2d46c'][i%3]);}}
if(n===3){for(let x of [85,220,810,940])tree(x,445,['#b67c42','#d49c4b','#c36542','#e5b55a']);ellipse(510,487,160,31,'#b98e61');for(let x of [180,720]){ellipse(x,494,42,24,'#8e7552');ellipse(x+20,487,16,10,'#9e8a69');}for(let i=0;i<10;i++){let x=70+i*95;ellipse(x,548+(i%3)*8,9,5,'#d18a4d',null);}}
if(n===4){ // Festive Thanksgiving room, no food-related character imagery.
c.fillStyle='#efd1a6';c.fillRect(0,0,1000,600);c.fillStyle='#d7ac7c';c.fillRect(0,445,1000,155);poly([[150,415],[850,415],[900,480],[110,480]],'#b27b55','#815337',5);for(let x of [200,800])line([[x,472],[x,565]],'#825438',17);for(let x=230;x<=770;x+=90){ellipse(x,414,26,13,'#f8e7c4','#b88c5d');ellipse(x,408,11,12,x%3?'#d67e45':'#a6a35c');}for(let x of [90,910]){poly([[x-55,440],[x,320],[x+55,440]],'#d29c58');ellipse(x,345,30,30,'#dd8f4d');}line([[0,115],[1000,115]],'#ba7b54',8);for(let i=0;i<9;i++){let x=100+i*100;poly([[x,118],[x+20,150],[x+39,118]],['#c65d44','#dba64a','#a6a26b'][i%3]);}}
if(n===5){ // Broadly inspired by northeastern woodland agriculture; no stereotyped costumes or tipis.
for(let x of [90,920])tree(x,445,['#bd8249','#d1a358','#ad7648']);poly([[650,455],[660,325],[735,260],[827,325],[837,455]],'#ad8a66','#775b45',5);for(let x=668;x<835;x+=18)line([[x,326+Math.abs(744-x)*.4],[x,455]],'#8c7356',3);for(let x=145;x<610;x+=65){line([[x,490],[x,383]],'#62924b',8);for(let y=405;y<470;y+=25){ellipse(x-12,y,14,7,'#79a55b');ellipse(x+12,y-8,13,7,'#84ae61');}ellipse(x,386,12,20,'#e4bf6d');}for(let x=150;x<610;x+=110)ellipse(x,510,25,14,'#b88754');}
// Subtle living scenery. All motion is decorative and never changes hitboxes.
if(t>0){c.save();
if(n===0||n===3||n===5){for(let i=0;i<17;i++){let x=(i*173+Math.sin(t*.8+i)*38+1000)%1000,y=(i*91+t*(14+i%4*5))%570; c.save();c.translate(x,y);c.rotate(t+i);ellipse(0,0,9,4,['#d88648','#e8bd57','#b86b43'][i%3]);c.restore();}}
if(n===1||n===2){for(let i=0;i<4;i++){let x=(i*280+t*(8+i*2))%1150-70;ellipse(x,105+i*38,50,13,'#ffffff65');ellipse(x+25,97+i*38,37,16,'#ffffff65');}}
if(n===4){for(let i=0;i<6;i++){let x=190+i*126;ellipse(x,190+Math.sin(t*3+i)*7,3,7,'#ffdf78');}}
if(n===5){for(let i=0;i<12;i++){let x=(i*131+Math.sin(t+i)*12)%1000,y=350+i%4*49;ellipse(x,y,3,5,'#e3c66b');}}
c.restore();}

}
function turkey(d,x=500,y=360,scale=1,t=0,motion=0,gobbling=false){
c.save();c.translate(x,y);c.scale(scale,scale);
const cols=['#9a603c','#c18b51','#f4d2a2','#b9788d','#8b719c','#b87343'],body=cols[d.color]||cols[0];
const feathers=['#c8583b','#e99c36','#edcb58','#a7b86e','#77a5a0','#ba7b9e','#dd7c43','#e5b65a','#a47e56'];
const walk=motion>0,step=Math.sin(t*12),bob=walk?Math.abs(step)*5:0;
ellipse(0,173,200,18,'#3c402c30');
// Tail feathers each have their own hinge and sway.
for(let i=0;i<9;i++){const angle=-PI*.45+i*PI*.9/8,sp=[1,1.1,1.22,.79][d.shape||0];c.save();c.translate(Math.sin(angle)*190*sp,-45-Math.cos(angle)*155*sp+bob*.25);c.rotate(angle*.7+Math.sin(t*3+i*.55)*(motion*.06));ellipse(0,0,38,122*sp,feathers[(i+d.color)%9],'#885c42',4);ellipse(0,-46,25,36,'#ffe0a070');line([[0,-72],[0,63]],'#f9e4a0',3);c.restore();}
// Legs alternate during the fashion-show walk; feet stay attached.
for(let j of [-1,1]){const stride=walk?step*j*19:0;line([[j*49,157],[j*49+stride,199],[j*29+stride,216]],'#dc943e',10);line([[j*49+stride,199],[j*68+stride,216]],'#dc943e',8);}
c.save();c.translate(0,-bob);
// Wings pivot from the shoulder, with a real flap rather than a whole-body rotation.
for(const j of [-1,1]){c.save();c.translate(j*94,8);c.rotate(j*(.07+Math.sin(t*10+j)*(motion*.28)));ellipse(j*8,47,55,91,body,'#80513b',3);for(let k=0;k<3;k++)ellipse(j*(25+k*8),89+k*7,13,24,'#f2d0a02b');c.restore();}
ellipse(0,70,137,153,body);ellipse(-50,42,53,76,'#ffffff17');
ellipse(0,-67,95,104,body);ellipse(0,-80,72,77,'#fff3d61c');
// No default eyes, beak, mouth or wattle. Children build the entire face.
c.restore();c.restore();}


// A matched pair of wearable shoes, anchored over the two actual turkey feet.
// The pair remains a single selectable object for the existing pointer controls.
function footwear(style,t=0,motion=0){
  const stride=motion>0?Math.sin(t*12)*19:0;
  for(const side of [-1,1]){
    c.save();c.translate(side*49+stride*side,0);
    c.scale(side,1); // Each toe points outward, away from the turkey's center.
    // Ground shadow and distinct left/right sole.
    ellipse(13,15,36,7,'#5c49334d');
    if(style==='moccasin'){
      c.beginPath();c.moveTo(-20,-11);c.bezierCurveTo(-22,-23,-9,-27,3,-22);
      c.bezierCurveTo(11,-20,14,-13,17,-8);c.bezierCurveTo(35,-9,49,-3,49,7);
      c.bezierCurveTo(49,15,29,17,10,17);c.lineTo(-17,16);
      c.bezierCurveTo(-25,10,-25,-3,-20,-11);c.closePath();
      c.fillStyle='#a97446';c.fill();c.strokeStyle='#62462e';c.lineWidth=3;c.stroke();
      c.beginPath();c.moveTo(-16,-9);c.quadraticCurveTo(0,-16,13,-5);c.strokeStyle='#e7c89a';c.lineWidth=4;c.stroke();
      c.beginPath();c.moveTo(13,-5);c.quadraticCurveTo(33,-8,42,5);c.strokeStyle='#e4c496';c.lineWidth=2.5;c.setLineDash([4,4]);c.stroke();c.setLineDash([]);
      line([[-16,14],[37,14]],'#6e4b32',3);
    }else{
      const cowboy=style==='cowboy';
      const body=cowboy?'#aa693f':'#efb839',dark=cowboy?'#6e422c':'#a96c31';
      // Short boot shaft with rounded cuff, fitted to each ankle.
      c.beginPath();c.moveTo(-18,-39);c.lineTo(17,-39);c.lineTo(15,-7);
      c.quadraticCurveTo(20,-5,25,-4);c.lineTo(35,0);c.lineTo(46,9);
      c.quadraticCurveTo(48,17,32,18);c.lineTo(-15,18);
      c.quadraticCurveTo(-23,14,-22,5);c.closePath();
      c.fillStyle=body;c.fill();c.strokeStyle=dark;c.lineWidth=3.5;c.stroke();
      c.beginPath();c.ellipse(-1,-38,18,6,0,0,Math.PI*2);c.fillStyle=cowboy?'#c28b5b':'#ffe17a';c.fill();c.strokeStyle=dark;c.lineWidth=2;c.stroke();
      if(cowboy){line([[-5,-27],[2,-15],[11,-27]],'#e8bb7b',3);line([[0,-12],[11,-2],[21,-10]],'#e8bb7b',2.5);}
      else {ellipse(3,-21,6,6,'#fff2b1');line([[-11,-7],[15,-7]],'#f9d676',3);}
      line([[-19,17],[37,17]],cowboy?'#51372c':'#755237',5);
      if(cowboy)poly([[-19,18],[-11,18],[-12,23],[-20,23]],'#69452f');
    }
    c.restore();
  }
}

function part(p,t=0,gobbling=false,motion=0){c.save();
// Keep each saved position unchanged; add only a temporary walking offset.
// Body accessories follow the torso bob, while footwear follows the feet.
const walking=motion>0;
const footwearPart=(p.kind==='costume'&&p.style===5)||(p.kind==='fun'&&p.style===4)||(p.kind==='sticker'&&p.style===5);
const torsoBob=walking&&!footwearPart?Math.abs(Math.sin(t*12))*5:0;
c.translate(p.x,p.y-torsoBob);c.rotate(p.angle||0);c.scale(p.scale||1,p.scale||1);const k=p.kind,s=p.style;
if(k==='eyes'){const blink=Math.sin(t*1.7)>.985;c.save();if(blink)c.scale(1,.13);for(let x of [-57,57]){if(s===2||s===4){c.beginPath();c.arc(x,7,24,PI,T);c.strokeStyle='#4a3029';c.lineWidth=8;c.stroke();if(s===4)line([[x-26,-11],[x+24,-11]],'#765441',6);}else if(s===3){star(x,0,29,'#f5d761');}else if(s===6){heart(x,0,1.3,'#e88a9a');}else{ellipse(x,0,s===0?30:24,30,'#fff9e8','#815e4a');let dx=s===5?(x<0?16:-16):s===7?12:s===1?-7:0;ellipse(x+dx,5,13,19,'#352e2d');ellipse(x+dx+5,-3,4,6,'#fff');}}}
else if(k==='beak'){
  c.save();const open=gobbling?Math.abs(Math.sin(t*17))*12:0;
  if(s===0){poly([[-34,-13],[0,22+open],[34,-13]],'#f2b84c','#946039');}
  else if(s===1){ellipse(0,0,46,23+open*.3,'#e89b38','#946039');line([[-30,5],[30,5+open]],'#9a603c',4);}
  else if(s===2){poly([[-17,-9],[0,16+open],[17,-9]],'#f5c867','#946039');}
  else if(s===3){ellipse(0,0,35,32+open*.3,'#e6a13f','#946039');ellipse(0,8,17,7+open*.3,'#a96836');}
  else if(s===4){ellipse(0,9,31,18+open*.5,'#783d32','#633c2e');poly([[-34,-12],[0,4],[34,-12]],'#f4ba4e','#946039');}
  else if(s===5){poly([[-30,-14],[26,-10],[7,24+open],[-15,12]],'#e6a24b','#946039');}
  else if(s===6){poly([[-24,-14],[18,-12],[44,10],[8,23+open],[-22,6]],'#f2bd54','#946039');}
  else {poly([[-35,-13],[0,20+open],[35,-13]],'#f1b44b','#946039');
    c.beginPath();c.moveTo(17,3);c.bezierCurveTo(30,12,31,32,17,41);c.bezierCurveTo(3,46,8,26,13,16);c.closePath();c.fillStyle='#d95755';c.fill();c.strokeStyle='#9c4544';c.lineWidth=2;c.stroke();}
  c.restore();}
else if(k==='legacy-mouth-disabled'){c.save();if(gobbling)c.scale(1,1+.2*Math.abs(Math.sin(t*19)));c.strokeStyle='#673d35';c.lineWidth=8;c.lineCap='round';if(s===0||s===7){c.beginPath();c.arc(0,-14,s===7?55:34,0,PI);c.stroke();}else if(s===1||s===3){ellipse(0,3,44,29,'#783e3b','#673d35');if(s===3)poly([[-32,-1],[32,-1],[27,13],[-27,13]],'#fff7e5');}else if(s===2||s===6){ellipse(0,3,s===6?12:22,s===6?13:26,'#703d39');}else if(s===4){c.beginPath();c.arc(0,-16,40,0,PI);c.stroke();ellipse(7,25,15,22,'#e67f85');}else{c.beginPath();c.moveTo(-39,5);c.quadraticCurveTo(10,30,40,-10);c.stroke();}}
else if(k==='glasses'){for(let x of [-57,57]){if(s===2)star(x,0,43,'#f6da75');else if(s===3)heart(x,0,2,'#eea3b2');else if(s===1){c.fillStyle='#e5f2ed80';c.fillRect(x-38,-33,76,66);c.strokeStyle='#775f65';c.lineWidth=7;c.strokeRect(x-38,-33,76,66);}else ellipse(x,0,s===4?43:38,s===4?28:37,s===4?'#273744':'#edf8ee66',s===5?['#e76a73','#e5a54d'][x>0?1:0]:s===0?'#53788a':'#6f5a6d',7);}line([[-17,-5],[17,-5]],'#765b52',6);}
else if(k==='hat'){ellipse(0,30,115,18,'#594b4b');if(s===1)poly([[-50,18],[0,-115],[55,18]],'#d37c8b','#765347');else if(s===2||s===5){for(let i=0;i<6;i++){const a=i*T/6;ellipse(Math.cos(a)*65,-24+Math.sin(a)*24,28,22,s===2?'#c99b4f':'#e7a0af');}ellipse(0,-34,45,17,'#86a064');}else{poly([[-68,24],[-62,s===3?-34:-72],[58,s===3?-34:-72],[67,24]],['#4c5262','#a76c83','#ba9849','#6d998e','#4c5262','#b97e59'][s]);line([[-60,7],[60,7]],'#e7c57c',11);}}
else if(k==='costume'){
  // Distinct educational dress-up objects; no ceremonial costumes.
  if(s===0){ellipse(0,32,87,13,'#34343b','#c7a878',4);poly([[-57,28],[-52,-64],[52,-64],[57,28]],'#353743','#292b35',4);line([[-53,4],[53,4]],'#f0e0b2',12);c.fillStyle='#f4d66f';c.fillRect(-14,-8,28,24);c.fillStyle='#383943';c.fillRect(-7,-2,14,12);}
  if(s===1){poly([[-79,35],[-72,-35],[-39,-76],[39,-76],[72,-35],[79,35]],'#f7f2e6','#a6a0a0',4);ellipse(0,32,90,19,'#fdf8ed','#b6aba1');for(let x=-48;x<=48;x+=24)line([[x,25],[x+5,34]],'#d8cfc1',2);}
  if(s===2){poly([[-73,-62],[-18,-72],[0,-31],[18,-72],[73,-62],[78,72],[0,90],[-78,72]],'#454d5d','#2e3441',5);poly([[-30,-70],[0,-25],[30,-70],[25,17],[0,35],[-25,17]],'#f8f1de');line([[0,30],[0,82]],'#e6ca98',5);for(let y=44;y<80;y+=17)ellipse(9,y,4,4,'#e9c887');}
  if(s===3){poly([[-70,-72],[70,-72],[90,65],[0,92],[-90,65]],'#6e93a5','#4d6d7a',5);poly([[-36,-64],[36,-64],[57,70],[0,85],[-57,70]],'#fff2d9','#d3c6aa',4);line([[-55,-44],[55,-44]],'#f6e3c8',9);}
  if(s===4){poly([[-82,-25],[-82,25],[82,25],[82,-25]],'#bb8652','#81593d',4);for(let x=-68;x<=68;x+=17){line([[x,-22],[x+9,23]],'#e7c79a',5);}for(let x=-66;x<=66;x+=33)poly([[x,-10],[x+13,0],[x,10],[x-13,0]],'#5f806e');}
  if(s===5){footwear('moccasin',t,motion);}
  if(s===6){poly([[-78,-24],[78,-24],[65,52],[-65,52]],'#c29b68','#765b40',5);for(let y=-15;y<52;y+=15)line([[-68,y],[68,y]],'#e5c99a',3);for(let x=-55;x<60;x+=18)line([[x,-20],[x,47]],'#e5c99a',3);c.beginPath();c.arc(0,-22,42,PI,2*PI);c.strokeStyle='#87694b';c.lineWidth=9;c.stroke();}
  if(s===7){poly([[-68,-49],[68,-49],[78,55],[0,78],[-78,55]],'#c2a578','#795f47',5);for(let y=-30;y<65;y+=18)line([[-60,y],[60,y]],'#ead3a8',4);line([[-66,-49],[-66,-91],[66,-91],[66,-49]],'#8d704d',9);}
}
else if(k==='fun'){
  if(s===0){c.beginPath();c.arc(-14,0,69,-PI*.55,PI*.55);c.strokeStyle='#9b663c';c.lineWidth=12;c.stroke();line([[-14,-59],[-14,59]],'#ead8b1',3);line([[0,3],[86,3]],'#b88d50',7);poly([[88,3],[62,-12],[62,18]],'#d7b28b');for(let x of [16,28])line([[x,-5],[x+9,3],[x,11]],'#e4b963',3);}
  if(s===1){poly([[-52,-62],[0,-81],[52,-62],[85,76],[0,47],[-85,76]],'#e94d57','#8c3544',5);star(0,-22,24,'#f6d56b');}
  if(s===2){ellipse(0,32,95,19,'#9b6a3d','#6c4932',4);poly([[-62,26],[-50,-62],[45,-62],[61,26]],'#b77d46','#704b34',5);line([[-53,9],[52,9]],'#e7c180',10);}
  if(s===3){poly([[-65,-68],[65,-68],[75,75],[-75,75]],'#4c8eaa','#315a75',5);poly([[-45,-48],[45,-48],[47,4],[-47,4]],'#f0bb67','#ae773f',4);line([[-58,-58],[-58,-92],[58,-92],[58,-58]],'#e7b75d',10);ellipse(0,34,29,23,'#e8b467');}
  if(s===4){footwear('rain',t,motion);}
  if(s===5){line([[-69,-44],[0,2],[69,-44]],'#5983a8',20);poly([[-28,2],[29,2],[19,81],[-12,81]],'#6a9dc0','#446784',4);for(let y=15;y<80;y+=20)line([[-10,y],[20,y]],'#f8e1a1',5);}
  if(s===6){poly([[0,0],[-72,-39],[-72,39],[0,10],[72,39],[72,-39]],'#df667c','#8e3f55',4);ellipse(0,2,19,22,'#f2b7bc','#8e3f55');}
  if(s===7){line([[-67,-49],[0,38],[67,-49]],'#83a76c',8);for(let x=-48;x<=48;x+=24){ellipse(x,5+20*Math.cos(x/50),13,13,['#f4c65e','#e88e9d','#b3a5d7'][Math.abs(x/24)%3]);}heart(0,39,.85,'#e98f99');}
  if(s===8){line([[0,-68],[0,-20]],'#8d96b2',11);ellipse(0,20,45,48,'#e8c45c','#9b793d',5);star(0,18,27,'#fff0a0');}
}
else if(k==='sticker'){if(s===0)poly([[-8,0],[-49,-29],[-49,29],[-8,7],[8,7],[49,29],[49,-29],[8,0]],'#d2738e','#85465c');else if(s===1){line([[-48,-17],[0,14],[48,-17]],'#b57b9a',18);for(let x of [-43,0,43])line([[x,2],[x+12,24]],'#d8a6ba',7);}else if(s===2){line([[0,-42],[0,22]],'#b7a45b',8);ellipse(0,12,31,35,'#efc960','#997b40');star(0,12,15,'#fff2aa');}else if(s===3){for(let i=0;i<7;i++){let a=i*T/7;ellipse(Math.cos(a)*50,Math.sin(a)*19,18,18,'#e8a5b6');}line([[-72,5],[72,5]],'#7f9a62',7);}else if(s===4){poly([[-48,-22],[0,-50],[48,-22],[80,112],[0,65],[-80,112]],'#c85657','#924446');}else if(s===5){footwear('cowboy',t,motion);}else if(s===6){line([[-40,-25],[0,20],[40,-25]],'#a98c54',8);heart(0,22,1,'#e17b8c');}else if(s===7){poly([[0,-38],[15,-10],[35,0],[12,13],[0,36],[-15,12],[-35,0],[-15,-10]],'#ce854c');}else{for(let x of [-29,29])ellipse(x,0,21,12,'#e9a09c');}}
if(k==='eyes'||k==='beak'||k==='legacy-mouth-disabled')c.restore();c.restore();}
function draw(d,t=0,selected=null,carry=false,fashion=false,motion=0,gobbling=false,reaction=null){
if(fashion){const g=c.createLinearGradient(0,0,0,600);g.addColorStop(0,'#42345d');g.addColorStop(1,'#b9748c');c.fillStyle=g;c.fillRect(0,0,1000,600);poly([[240,600],[380,290],[620,290],[760,600]],'#eec5a5','#f9e2ba',6);for(let i=0;i<5;i++){let x=100+i*200;c.fillStyle='#fff6b8';c.globalAlpha=.17+.09*Math.sin(t*2+i);c.beginPath();c.moveTo(x,0);c.lineTo(x-100+Math.sin(t+i)*60,540);c.lineTo(x+100+Math.sin(t+i)*60,540);c.fill();c.globalAlpha=1;}for(let i=0;i<30;i++){c.fillStyle=['#f8d17d','#fff2bb','#f09caf'][i%3];c.fillRect((i*173+t*25)%1000,(i*97+t*(30+i%5*9))%600,7,10);}poly([[0,0],[155,0],[125,480],[0,510]],'#9b385d');poly([[845,0],[1000,0],[1000,510],[875,480]],'#9b385d');}
else scene(d,t);c.save();
if(reaction&&!fashion){
  const u=Math.max(0,Math.min(1,reaction.progress)),envelope=Math.sin(Math.PI*u),type=reaction.type;
  let dx=0,dy=0,angle=0,sx=1,sy=1;
  if(type==='blink'){dy=-3*envelope;angle=.035*Math.sin(u*10)*envelope;}
  else if(type==='cool'){angle=.095*envelope;dx=9*envelope;}
  else if(type==='hat'){dy=-12*Math.abs(Math.sin(u*Math.PI*2))*envelope;angle=.055*Math.sin(u*11)*envelope;}
  else if(type==='gobble'){dy=-5*Math.sin(u*17)*envelope;sx=1+.025*Math.sin(u*22)*envelope;}
  else if(type==='showoff'){angle=.09*Math.sin(u*11)*envelope;sx=1+.035*envelope;}
  else if(type==='dance'){dx=16*Math.sin(u*15)*envelope;dy=-8*Math.abs(Math.sin(u*17))*envelope;angle=.09*Math.sin(u*13)*envelope;}
  else if(type==='feathers'){sx=1+.055*envelope;sy=1-.02*envelope;angle=.04*Math.sin(u*14)*envelope;}
  else {dy=-9*Math.sin(Math.PI*u)*envelope;sy=1-.035*envelope;}
  c.translate(500+dx,355+dy);c.rotate(angle);c.scale(sx,sy);c.translate(-500,-355);
}
// Runway: all decorations and the turkey share exactly one character transform.
// Suppress separate limb/decoration translations here: those made shoes, hats,
// and handheld objects visibly drift away from the student's original design.
const runwayMotion=fashion?0:motion;
if(fashion){
  const step=Math.sin(t*8.5),sway=Math.sin(t*2.4);
  const bounce=-Math.abs(step)*8;
  const scale=1+.025*Math.sin(t*5);
  c.translate(500+Math.sin(t*.85)*80,355+bounce);
  c.rotate(sway*.055);
  c.scale(scale,scale);
  c.translate(-500,-355);
}
const behind=p=>p.kind==='fun'&&p.style===1||p.kind==='sticker'&&p.style===4;
for(const p of d.parts||[])if(behind(p))part(p,t,gobbling,runwayMotion);
turkey(d,500,360,1,t,runwayMotion,gobbling);
for(const p of d.parts||[])if(!behind(p))part(p,t,gobbling,runwayMotion);c.restore();if(selected){const p=d.parts.find(x=>x.id===selected);if(p){const [w,h]=M.dims(p);c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.setLineDash([8,6]);c.strokeStyle=carry?'#fff5ba':'#476e8a';c.lineWidth=3;c.strokeRect(-w*p.scale/2-8,-h*p.scale/2-8,w*p.scale+16,h*p.scale+16);c.restore();}}if(fashion){c.font='bold 36px system-ui';c.fillStyle='#805139';c.textAlign='center';c.fillText('TURKEY FASHION SHOW!',500,70);}}
return {draw,turkey,part};}
window.TurkeyArt={create};})();
