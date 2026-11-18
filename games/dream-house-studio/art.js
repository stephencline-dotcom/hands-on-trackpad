(function(root){'use strict';function create(c){
const ink='#384f62',wall=['#f9c878','#ef8c95','#a7cfe4','#bdafe8','#91cbaa','#fff0c4','#df9976','#e7edf0','#698fbd','#ba7257','#77936a','#d7a843'];
function path(points,fill,stroke=ink,width=3){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
function box(x,y,w,h,fill,r=6,stroke=ink,lw=3){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function ellipse(x,y,rx,ry,fill,stroke=null,lw=3){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();}}
function line(x,y,X,Y,color=ink,width=3){c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.lineWidth=width;c.strokeStyle=color;c.lineCap='round';c.stroke();}
function text(s,x,y,size=18,color=ink){c.fillStyle=color;c.font=`bold ${size}px sans-serif`;c.textAlign='center';c.fillText(s,x,y);}
function star(x,y,r,color='#ffe48b',n=5){path(Array.from({length:n*2},(_,i)=>{const a=-Math.PI/2+i*Math.PI/n,R=i%2?r*.45:r;return [x+Math.cos(a)*R,y+Math.sin(a)*R];}),color,null);}
function flower(x,y,r=12,color='#f087a5'){for(let i=0;i<6;i++){const a=i*Math.PI/3;ellipse(x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7,r*.55,r*.55,color);}ellipse(x,y,r*.4,r*.4,'#ffe484');}
function cloud(x,y,s=1,color='#ffffff'){c.save();c.translate(x,y);c.scale(s,s);ellipse(0,8,48,15,color);ellipse(-18,0,22,20,color);ellipse(14,-6,28,26,color);ellipse(38,6,22,17,color);c.restore();}
function roof(v,x=500,y=275,w=460,h=110){c.save();c.translate(x,y);c.scale(w/460,h/110);const colors=['#d96765','#4e97b5','#61718c','#dbaf50','#536577','#a7b4c0','#e896b3','#6dafaa'];
if(v===4){box(-238,-25,476,30,colors[v],3);line(-220,-40,220,-40,'#dee4dd',5);}else if(v===5){box(-235,-42,470,57,colors[v],2);for(let x=-235;x<235;x+=47)box(x,-69,27,32,colors[v],2);}
else if(v===7){c.beginPath();c.ellipse(0,0,235,108,0,Math.PI,2*Math.PI);c.closePath();c.fillStyle=colors[v];c.fill();c.strokeStyle=ink;c.lineWidth=4;c.stroke();for(let x=-150;x<=150;x+=75)line(x,0,x*.4,-80,'#4b8d8c',2);box(-240,-5,480,15,'#e7c26d',3);}
else{path([[-245,12],[-190,-52],[0,-112],[190,-52],[245,12]],colors[v],ink,4);c.save();c.beginPath();c.moveTo(-235,8);c.lineTo(0,-107);c.lineTo(235,8);c.clip();if(v===6){for(let x=-270;x<270;x+=48)path([[x,-120],[x+25,-120],[x+75,15],[x+50,15]],'#fff1ce',null);}else{for(let y=-90;y<15;y+=19){line(-230,y,230,y,v===3?'#b78a35':'#ffffff44',2);for(let x=-220;x<230;x+=42)line(x+(y%38?21:0),y,x+(y%38?21:0),y+14,'#00000015',2);}}c.restore();}c.restore();}
function house(d){const color=wall[d.paint];ellipse(505,492,254,24,'#41695b30');box(285,278,430,205,color,7,ink,4);box(278,470,444,18,'#d9cab4',3);c.save();c.beginPath();c.rect(288,281,424,186);c.clip();
if(d.house===1||d.house===5){for(let y=285;y<475;y+=24){line(288,y,712,y,'#935e553e',2);for(let x=288+(y%48?0:33);x<715;x+=66)line(x,y,x,y+24,'#935e553e',2);}}
if(d.house===2){for(let y=290;y<470;y+=25)box(285,y,430,22,color,8,'#8b6337',2);line(325,282,325,470,'#88613d',15);line(675,282,675,470,'#88613d',15);}
if(d.house===0||d.house===6){for(let y=294;y<470;y+=22)line(289,y,711,y,'#ffffff66',2);}
c.restore();
if(d.house===3){box(635,240,100,241,'#f3ede0',3);box(648,258,74,14,'#9dcdd2',2);line(655,245,655,470,'#ffffff',3);}
if(d.house===4){box(260,330,65,150,color,3);box(675,330,65,150,color,3);box(270,342,45,12,'#fff8e2',2);box(685,342,45,12,'#fff8e2',2);for(const x of [310,670]){box(x,285,18,190,'#fff6df',2);box(x-4,290,26,12,'#e6d7bc',2);}}
if(d.house===6){box(294,482,22,30,'#ac8a6d',2);box(686,482,22,30,'#ac8a6d',2);}
if(d.house===7&&d.roof===0){ellipse(500,285,248,99,'#dc6d72',ink,4);c.save();c.beginPath();c.ellipse(500,285,245,96,0,0,Math.PI*2);c.clip();for(const [x,y,r]of [[330,260,22],[420,225,23],[530,210,20],[630,245,27],[720,280,22],[470,285,28],[580,295,23]])ellipse(x,y,r,r*.65,'#fff1d2');c.restore();box(275,303,450,18,'#f5d7af',8);}
else roof(d.roof);if(d.house===0)path([[460,282],[500,237],[540,282]],'#fff3d9',ink,3);
}
function windowPiece(v,color,lit){const glass=lit?'#ffec98':'#9fd8e6';
if(v===1||v===4){if(v===1){ellipse(0,0,38,38,color,ink);ellipse(0,0,29,29,glass,ink,2);line(-27,0,27,0);line(0,-27,0,27);}else{c.beginPath();c.moveTo(0,38);c.bezierCurveTo(-75,-10,-22,-61,0,-26);c.bezierCurveTo(22,-61,75,-10,0,38);c.fillStyle=glass;c.fill();c.strokeStyle=ink;c.lineWidth=6;c.stroke();}return;}
box(-36,-39,72,78,'#fff5df',v===2||v===6?[32,32,4,4]:5);box(-27,-30,54,60,glass,v===2||v===6?[24,24,2,2]:2);line(0,-27,0,30,'#fff5df',5);line(-27,0,27,0,'#fff5df',5);line(-20,-22,-8,-30,'#ffffff99',4);
if(v===3){path([[-42,-35],[-28,-40],[-28,38],[-42,31]],'#c4e4e6');path([[42,-35],[28,-40],[28,38],[42,31]],'#c4e4e6');}
if(v===5){box(-42,25,84,19,color,4);for(let i=-30;i<=30;i+=15)flower(i,21,10,['#ec7898','#ffe081','#c39bdd'][Math.abs(i/15)%3]);}
if(v===6){for(let i=0;i<3;i++)for(let j=0;j<2;j++)path([[-24+i*17,-23+j*27],[-15+i*17,-33+j*27],[-6+i*17,-23+j*27],[-15+i*17,-13+j*27]],['#e99ac4','#f8d768','#a5baea'][i],null);}
if(v===7){box(-44,-37,13,74,color,2);box(31,-37,13,74,color,2);for(let y=-28;y<38;y+=12){line(-42,y,-33,y,ink,1);line(33,y,42,y,ink,1);}}
}
function door(v,color){if(v===4){ellipse(0,3,42,53,'#c5b28d',ink,3);ellipse(0,3,34,45,color,ink,3);ellipse(21,9,4,4,'#ffe081');return;}
box(-38,-58,76,118,'#ffefd2',v===1||v===3?[38,38,3,3]:4);box(-30,-50,60,110,v===1?'#b47b53':v===3?'#697d91':color,v===1||v===3?[29,29,2,2]:2);
if(v===7){box(-42,-15,84,75,'#9baec0',3);for(let y=0;y<55;y+=14)line(-39,y,39,y,'#d8e2e5',3);}else if(v===3){for(let x=-20;x<25;x+=13)line(x,-33,x,57,'#c5d4d9',4);}else{box(-20,-36,40,34,v===6?'#f6add7':'#a4d8e2',5);if(v===2||v===5){line(0,-48,0,59,'#fff2da',4);line(-24,10,24,10,'#fff2da',4);}else box(-20,13,40,31,'#ffffff33',3,null);ellipse(20,6,4,4,'#f6d06b',ink,1);}
if(v===6)for(let y=-44;y<56;y+=22){ellipse(-34,y,5,6,'#f68c9d');ellipse(34,y,5,6,'#f68c9d');}}
function tree(v,color,t){if(v<4){const wood='#a97c56';box(-10,-10,20,110,wood,6);line(0,24,-30,-8,wood,8);line(0,7,28,-20,wood,8);if(v===1){for(let y=-65;y<=10;y+=36)path([[-60,y+45],[0,y-45],[60,y+45]],['#4f9a83','#5cac8b','#6ab98d'][Math.floor((y+65)/36)],ink,2);}else if(v===3){line(0,95,10,-60,wood,18);for(let i=0;i<6;i++){const a=i*Math.PI/3;path([[10,-65],[10+Math.cos(a)*67,-65+Math.sin(a)*28],[10+Math.cos(a+.35)*39,-61+Math.sin(a+.35)*18]],'#54a881',ink,2);}ellipse(15,-50,9,11,'#bc8b55');}else{for(const [x,y,rx,ry]of [[-35,-28,40,40],[28,-38,45,43],[0,-70,43,40],[0,-18,52,38]])ellipse(x,y,rx,ry,v===2?'#efa2c1':'#79b67d',ink,2);for(let i=0;i<9;i++){const x=Math.sin(i*4)*55,y=-40+Math.cos(i*3)*37;if(v===0)ellipse(x,y,7,8,'#e9837b');else flower(x,y,7,'#ffd8e1');}}}
if(v===4){ellipse(0,22,74,17,'#729e70');for(let i=-58;i<=58;i+=19){line(i,20,i,-3,'#58875e',4);flower(i,-5,13,wall[(i+60)%12|0]);}}
if(v===5){for(let i=-30;i<=30;i+=30){line(i,64,i,-30+(i?15:0),'#609b69',5);ellipse(i-10,20,16,8,'#7fb77a');flower(i,-35+(i?15:0),25,'#f3c557');ellipse(i,-35+(i?15:0),10,10,'#775c43');}}
if(v===6){ellipse(0,30,62,36,'#78af78',ink,3);ellipse(-23,6,32,28,'#88be85');ellipse(25,4,33,27,'#88be85');}
if(v===7){for(let x=-36;x<=36;x+=24)line(x,-70,x,78,'#b89973',4);for(let y=-50;y<80;y+=28)line(-49,y,49,y,'#b89973',4);for(let i=0;i<12;i++)flower(Math.sin(i*3)*45,Math.cos(i*4)*68,12,'#ee93b2');}}
function piece(p,t=0,lit=false){const v=p.variant,color=wall[p.color||0];c.save();c.translate(p.x||0,p.y||0);c.rotate(p.angle||0);c.scale(p.scale||1,p.scale||1);
if(p.kind==='window')windowPiece(v,color,lit);if(p.kind==='door')door(v,color);if(p.kind==='garden')tree(v,color,t);
if(p.kind==='build'){
if(v===0){box(-24,-45,48,95,'#c58473',2);for(let y=-35;y<45;y+=19){line(-23,y,23,y,'#e6b5a1',2);line(y%38?0:-12,y,y%38?0:-12,y+18,'#e6b5a1',2);}box(-29,-52,58,17,'#e4c9b3',3);for(let i=0;i<3;i++){c.globalAlpha=.2-i*.04;ellipse(Math.sin(t+i)*8,-65-i*15-(t*12%15),10+i*3,9+i*3,'#fff');}c.globalAlpha=1;}
if(v===1||v===2){box(-40,-72,80,v===1?180:170,color,4);if(v===2){for(let x=-47;x<40;x+=28)box(x,-92,19,28,'#c2c9d2',2);}else{path([[-50,-75],[0,-116],[50,-75]],'#708aa5');ellipse(0,-31,29,29,'#fff7da',ink);for(let a=0;a<12;a++){const r=a*Math.PI/6;line(Math.sin(r)*23,-31+Math.cos(r)*23,Math.sin(r)*25,-31+Math.cos(r)*25,ink,2);}line(0,-31,0,-48);line(0,-31,15,-25);}
box(-12,30,24,39,'#9bcbdc',[12,12,2,2]);if(v===2){path([[-51,-89],[0,-138],[51,-89]],'#af89bd');line(0,-138,0,-157,ink,3);path([[0,-158],[35,-149],[0,-140]],'#eea0b2');}}
if(v===3){box(-65,-12,130,48,'#e7dbc4',4);for(let x=-55;x<=55;x+=22)line(x,-11,x,29,'#8a9fac',4);line(-69,-17,69,-17,ink,5);box(-75,30,150,12,color,3);}
if(v===4){box(-102,45,204,13,'#e5d0ad',3);for(const x of [-87,87])box(x,-35,12,80,'#fff5da',2);path([[-110,-38],[0,-65],[110,-38]],color);}
if(v===5){box(-80,-60,160,151,color,4);path([[-90,-57],[0,-97],[90,-57]],'#7197ab');box(-57,-23,40,45,'#a3d9e6',3);box(17,-23,40,45,'#a3d9e6',3);}
if(v===6)for(let i=0;i<3;i++)box(-46-i*10,-24+i*17,92+i*20,17,'#c5c4bc',3);
if(v===7){line(-25,63,-25,-61,'#687c89',5);path([[-22,-60],[40,-49+Math.sin(t*3)*5],[-22,-25]],color);star(0,-43,8,'#fff5d1');}}
if(p.kind==='yard'){
if(v===0){for(let x=-90;x<=90;x+=30){path([[x-8,42],[x-8,-22],[x,-35],[x+8,-22],[x+8,42]],'#fff5de',ink,2);}box(-100,-8,200,10,color,2);box(-100,22,200,10,color,2);}
if(v===1){for(let i=0;i<5;i++)ellipse(Math.sin(i*1.5)*20,-32+i*18,25+i*5,8,'#d4cabb',ink,2);}
if(v===2){ellipse(0,3,80,36,'#b7c29f',ink,3);ellipse(0,0,67,26,'#7ec5d2');ellipse(10,-4,22,7,'#c3e8e7');ellipse(-33,8,13,5,'#79ae87');flower(-34,4,7,'#f5accc');}
if(v===3){ellipse(0,42,57,22,'#c5d6d7',ink,3);box(-7,-29,14,65,'#bdcfd2',4);ellipse(0,-22,37,11,'#c5d6d7',ink,3);for(let i=0;i<5;i++){const x=(i-2)*20;line(0,-40,x,-4,'#9cdeed',3);ellipse(x,-7+Math.sin(t*5+i)*5,3,6,'#b8eef0');}ellipse(0,38,43,13,'#8ed8df');}
if(v===4){line(-5,46,-5,-22,'#aa8767',9);box(-34,-38,68,40,color,[24,24,3,3]);box(-27,-30,54,25,'#cde2e2',3);line(14,-30,14,-56,'#e66e70',3);box(14,-57,20,12,'#e66e70',1);}
if(v===5){for(const x of [-58,58])line(x,8,x,40,ink,7);for(let y=-25;y<20;y+=14)box(-74,y,148,10,'#c9956c',2);line(-64,-27,-64,19);line(64,-27,64,19);}
if(v===6){line(0,-5,0,73,'#af8861',8);box(-29,-43,58,55,color,3);path([[-36,-43],[0,-74],[36,-43]],'#d58a89');ellipse(0,-17,10,10,ink);line(-10,3,10,3,'#cdaa79',4);}
if(v===7){line(-82,77,-60,-74,'#b38a66',9);line(82,77,60,-74,'#b38a66',9);line(-68,-72,68,-72,'#b38a66',9);const swing=Math.sin(t*2)*6;line(-24,-68,-24+swing,38,'#7a8b8a',3);line(24,-68,24+swing,38,'#7a8b8a',3);box(-36+swing,37,72,12,color,3);}}
if(p.kind==='fun'){
if(v===0||v===1){ellipse(0,15,30,22,v===0?'#dcb88b':'#aeb7c6',ink,2);ellipse(15,-10,23,23,v===0?'#e9c99e':'#bdc5d0',ink,2);if(v===0){ellipse(-4,-15,10,22,'#a37c5d');ellipse(34,-15,9,21,'#a37c5d');}else{path([[-2,-23],[-3,-43],[13,-29]],'#bdc5d0');path([[23,-30],[36,-43],[37,-20]],'#bdc5d0');}ellipse(9,-12,2.8,3,ink);ellipse(24,-12,2.8,3,ink);ellipse(17,-3,4,3,'#865f65');line(-23,21,-37,Math.sin(t*4)*8,'#b38c68',7);for(const x of [-18,5])box(x,24,10,13,'#b38c68',3);}
if(v===2||v===3){for(const x of [-48,48]){ellipse(x,29,20,20,'#46586a');ellipse(x,29,11,11,'#d8e8e9');}if(v===2){path([[-48,29],[-18,-12],[14,29],[-48,29],[37,-14],[48,29]],null,color,5);line(-26,-14,-6,-14,ink,5);line(37,-14,30,-30,ink,4);line(30,-30,45,-30,ink,4);}else{box(-74,-6,148,35,color,12);path([[-48,-6],[-27,-40],[26,-40],[49,-6]],color);path([[-35,-10],[-20,-32],[20,-32],[35,-10]],'#b0e0e8');line(0,-32,0,-10,'#fff9db',4);ellipse(64,5,7,5,'#ffe797');}}
if(v===4){ellipse(0,26,26,22,'#7e9fb2',ink,2);ellipse(0,-5,19,20,'#ebc3a6',ink,2);path([[-23,-15],[0,-53],[23,-15]],color);ellipse(0,9,17,17,'#fff8e5');ellipse(0,-3,6,6,'#e7ad91');}
if(v===5){ellipse(-4,23,49,30,'#b4bfba',ink,3);path([[-38,4],[-55,-30],[-16,-3]],'#8faaa5');ellipse(29,-12,26,29,'#b4bfba',ink,3);path([[17,-36],[13,-61],[28,-37]],'#d9d2a8');ellipse(38,-14,4,4,ink);path([[-46,27],[-65,0],[-60,38],[-36,40]],'#91aaa5');}
if(v===6){for(let i=0;i<3;i++){const x=-35+i*35,y=Math.sin(t*2+i)*10;ellipse(x-8,y,12,17,wall[i+1]);ellipse(x+8,y,12,17,wall[i+1]);line(x,y-8,x,y+11,ink,3);}}
if(v===7){for(const x of [-44,44])line(x,5,x,43,'#b58d68',7);box(-67,-40,134,51,color,7);text('WELCOME',0,-8,17);}}
if(p.kind==='extras'){
if(v===0){c.beginPath();c.moveTo(-110,-20);c.quadraticCurveTo(0,45,110,-20);c.strokeStyle=ink;c.lineWidth=2;c.stroke();for(let i=0;i<10;i++){const x=-100+i*22,y=15-(x*x/340);ellipse(x,y,6,9,lit?'#fff3b0':wall[i%12],null);}}
if(v===1){box(-74,-30,148,43,color,3);for(let x=-70;x<70;x+=28)box(x,-29,14,41,'#fff5dc',2,null);for(let x=-70;x<70;x+=28)ellipse(x+7,16,14,8,color,ink,2);}
if(v===2){path([[-70,27],[-50,-30],[70,-30],[50,27]],'#4c799a');for(let x=-40;x<60;x+=23)line(x,-26,x-18,23,'#a0d7e2',2);for(let y=-12;y<=12;y+=16)line(-56,y,60,y,'#a0d7e2',2);}
if(v===3){path([[-42,95],[-24,-48],[24,-48],[42,95]],color);path([[-35,-48],[0,-88],[35,-48]],'#b27b8d');c.save();c.translate(0,-37);c.rotate(t*.5);for(let i=0;i<4;i++){c.rotate(Math.PI/2);box(0,-6,64,13,'#f2dcaf',2);}c.restore();ellipse(0,-37,7,7,'#a77e5a',ink,2);}
if(v===4){box(-34,0,68,46,'#b98b62',[3,3,19,19]);for(let i=-23;i<=23;i+=15)flower(i,-6,17,wall[(i+24)%12|0]);c.beginPath();c.arc(0,4,27,Math.PI,0);c.strokeStyle='#8d6c4f';c.lineWidth=4;c.stroke();}
if(v===5){line(0,0,-36,63,ink,5);line(0,0,36,63,ink,5);line(0,0,0,63,ink,5);c.save();c.rotate(-.4);box(-42,-31,90,28,color,3);box(35,-37,18,40,'#cad5d8',3);ellipse(47,-17,4,15,'#88bfcf');c.restore();}
if(v===6){box(-58,-19,116,38,color,10);text('hello',0,7,22);}
if(v===7){const rainbow=['#ef9a9d','#f2bb7e','#f3d989','#a0c99f','#9acbde','#b8a7d8'];for(let i=0;i<6;i++){c.beginPath();c.arc(0,62,110-i*9,Math.PI,0);c.strokeStyle=rainbow[i];c.lineWidth=10;c.stroke();}cloud(-100,61,.38);cloud(100,61,.38);}}
c.restore();}
function scene(v,t){const skies=[['#93d6eb','#e4f5ee'],['#87d5eb','#d4f6ee'],['#a6d5e7','#edf1d8'],['#e9b899','#ffe9b5'],['#b6d8e9','#eff8f9'],['#263454','#5a668b'],['#a893c7','#f9cfad'],['#d8b8e2','#ffeddd']];const g=c.createLinearGradient(0,0,0,600);g.addColorStop(0,skies[v][0]);g.addColorStop(1,skies[v][1]);c.fillStyle=g;c.fillRect(0,0,1000,600);
if(v===5){ellipse(835,90,35,35,'#ffedb2');ellipse(847,78,32,32,skies[v][0]);for(let i=0;i<45;i++)star((i*173+37)%1000,(i*61)%270,1.5+(i%3), '#fff5d3');}else{ellipse(837,91,35,35,v===6?'#ffe6b1':'#fff0b5');for(let i=0;i<3;i++)cloud((150+i*365+t*(i+2))%1200-70,80+(i%2)*55,.7+i*.15,'#ffffffb0');}
if(v===2)for(let i=0;i<5;i++)path([[i*250-70,390],[i*250+100,165+(i%2)*40],[i*250+280,390]],'#a0babb',null);
if(v===1){c.fillStyle='#71b7ca';c.fillRect(0,330,1000,180);for(let i=0;i<12;i++)line((i*91+t*8)%1000,355+i%3*24,(i*91+t*8)%1000+36,355+i%3*24,'#ccebee',2);}
for(let i=0;i<2;i++){c.beginPath();c.moveTo(0,385+i*42);c.bezierCurveTo(230,275+i*75,500,460-i*28,1000,330+i*85);c.lineTo(1000,600);c.lineTo(0,600);c.fillStyle=v===4?['#eef4ee','#f9faf0'][i]:v===3?['#b1b076','#c3ba7a'][i]:v===5?['#668478','#7b9782'][i]:['#a0ca8c','#b6d99b'][i];c.fill();}
if(v===7){for(let i=0;i<7;i++){line(i*165+25,385,i*165+25,310,'#f4e9da',7);ellipse(i*165+25,302,25,25,wall[i],ink,2);}}
if(v!==4)for(let i=0;i<38;i++){const x=i*137%1000,y=490+i*37%110;line(x,y,x-3,y-7,'#739c6c',1.5);if(i%4===0)flower(x,y-6,3,'#fff3ce');}
for(let i=0;i<2;i++){const x=(t*13+90+i*580)%1200-100,y=145+i*32;line(x-8,y,x,y-5,'#566f81',2);line(x,y-5,x+8,y,'#566f81',2);}}
function draw(d,t=0,selected=null,show=false,b={left:0,top:0,right:1000,bottom:600}){c.save();c.translate(b.left,b.top);c.scale((b.right-b.left)/1000,(b.bottom-b.top)/600);scene(d.scene,t);c.restore();c.save();c.translate(500,485);c.scale(1.45,1.4);c.translate(-500,-485);house(d);c.restore();for(const p of d.parts)piece(p,t,show||d.scene===5);if(selected&&!show){const p=d.parts.find(p=>p.id===selected);if(p){const [w,h]=root.HouseModel.size(p);c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.scale(p.scale,p.scale);c.setLineDash([6,5]);c.lineWidth=2/p.scale;c.strokeStyle='#fffef8';c.strokeRect(-w/2-5,-h/2-5,w+10,h+10);c.setLineDash([3,8]);c.strokeStyle='#4a788d';c.strokeRect(-w/2-5,-h/2-5,w+10,h+10);c.restore();}}
if(show){for(let i=0;i<20;i++)star((i*163+70)%1000,100+(i*83)%450,4+Math.sin(t*2+i)*2,wall[i%12]);}}
function thumb(kind,v){c.clearRect(0,0,c.canvas.width,c.canvas.height);c.save();c.translate(c.canvas.width/2,c.canvas.height/2);if(kind==='house'){c.scale(.24,.24);c.translate(-500,-355);house({house:v,roof:v===5?5:v===3?4:0,paint:v%wall.length});}else if(kind==='roof'){c.scale(.24,.3);roof(v,0,20);}else if(kind==='scene'){c.translate(-c.canvas.width/2,-c.canvas.height/2);c.scale(c.canvas.width/1000,c.canvas.height/600);scene(v,0);}else{const [w,h]=root.HouseModel.size({kind,variant:v});const s=Math.min((c.canvas.width-20)/w,(c.canvas.height-12)/h);c.scale(s,s);piece({kind,variant:v,x:0,y:0,color:v,scale:1,angle:0});}c.restore();}
return {draw,piece,thumb};}
root.HouseArt={create};})(typeof window==='undefined'?globalThis:window);
