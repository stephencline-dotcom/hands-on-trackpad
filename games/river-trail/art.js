/* Code-drawn scenery and characters. No external image dependencies. */
(function(){'use strict';
const M=window.RiverModel,TAU=Math.PI*2;
function create(c){
const ellipse=(x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();};
const line=(points,color,width=3)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();};
function path(points,fill,stroke){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
function ring(x,y,r,t,color='#ffe683'){c.save();c.globalAlpha=.7+Math.sin(t*4)*.2;c.strokeStyle=color;c.lineWidth=5;c.beginPath();c.ellipse(x,y,r+Math.sin(t*4)*3,r*.6,0,0,TAU);c.stroke();c.restore();}
function icon(kind,x,y,size=1){c.save();c.translate(x,y);c.scale(size,size);
 if(kind==='berry'){line([[-5,12],[-1,-23],[20,-33]],'#4e7b39',4);ellipse(11,-24,15,6,'#709f42');for(const [xx,yy] of [[-15,-8],[2,-10],[18,-3],[-9,9],[9,13]]){ellipse(xx,yy,11,11,'#7b3c78');ellipse(xx-3,yy-4,3,3,'#c897b4');}}
 else if(kind==='wood'){for(const [xx,yy,a] of [[-5,9,.15],[0,-5,-.17]]){c.save();c.translate(xx,yy);c.rotate(a);c.fillStyle='#926846';c.fillRect(-25,-8,49,16);ellipse(-25,0,6,8,'#b58756');ellipse(24,0,6,8,'#edc790');line([[-16,-2],[15,-2]],'#b78b5d',2);c.restore();}line([[0,-18],[-2,21]],'#e4c77f',4);}
 else if(kind==='nut'){for(const [xx,yy,a] of [[-12,7,-.4],[13,-1,.3]]){c.save();c.translate(xx,yy);c.rotate(a);ellipse(0,3,13,17,'#ad753d');ellipse(-3,1,6,12,'#d7a657');ellipse(0,-9,16,7,'#745239');line([[2,-12],[6,-20]],'#705039',3);c.restore();}}
 else if(kind==='basket'){path([[-33,-16],[33,-16],[26,22],[-26,22]],'#c78d48','#805b34');for(let y=-8;y<22;y+=8)line([[-28,y],[28,y]],'#e4b66c',2);for(let x=-20;x<30;x+=10)line([[x,-13],[x*.8,19]],'#9e703a',2);c.beginPath();c.ellipse(0,-14,29,23,0,Math.PI,TAU);c.strokeStyle='#9e703a';c.lineWidth=5;c.stroke();}
 else if(kind==='paddle'){c.save();c.rotate(.6);line([[0,-30],[0,20]],'#ffe6af',7);ellipse(0,27,12,23,'#efd099');line([[0,14],[0,39]],'#c29357',2);c.restore();}
 else if(kind==='home'){wigwam(0,12,.5);}
 else if(kind==='tree'){tree(0,32,.52,false);}
 else if(kind==='boulder'){rock(0,8,30);}
 else if(kind==='boat'){c.scale(.43,.43);canoe(0,0,0,0,[],false);}
 else if(kind==='feet'){ellipse(-10,2,6,14,'#785a3d');ellipse(10,-9,6,14,'#785a3d');}
 else if(kind==='check'){line([[-17,0],[-4,13],[22,-18]],'#fffce0',8);}
 c.restore();}
function person(x,y,scale,t,walking=false,carry=null,shirt='#c48b57'){c.save();c.translate(x,y);c.scale(scale,scale);ellipse(0,0,18,6,'#314e4230');const step=walking?Math.sin(t*12)*7:0;line([[-7,-16],[-9+step,-2]],'#754d36',8);line([[7,-16],[9-step,-2]],'#754d36',8);path([[-14,-49],[14,-49],[19,-13],[-18,-13]],shirt,'#8f623f');line([[-13,-43],[-22,-24]],'#b77a50',8);line([[13,-43],[22,-24]],'#b77a50',8);ellipse(0,-64,16,18,'#b97e57');ellipse(0,-74,16,10,'#322e2a');ellipse(-13,-66,4,13,'#322e2a');ellipse(13,-66,4,13,'#322e2a');ellipse(-5,-63,1.7,2,'#292c29');ellipse(5,-63,1.7,2,'#292c29');c.beginPath();c.arc(0,-59,5,.2,Math.PI-.2);c.strokeStyle='#6e4935';c.lineWidth=1.7;c.stroke();if(carry)icon(carry,0,-35,.65);c.restore();}
function canoe(x,y,angle,t,cargo=[],moving=false,occupied=true){c.save();c.translate(x,y);c.rotate(-angle);ellipse(-2,12,65,27,'#194c5d35');if(moving){line([[-72,-23],[-92,-36]],'#c2eeea',3);line([[-72,23],[-92,36]],'#c2eeea',3);}c.beginPath();c.moveTo(72,0);c.bezierCurveTo(28,-33,-45,-33,-72,0);c.bezierCurveTo(-45,33,28,33,72,0);c.fillStyle='#9d633e';c.fill();c.strokeStyle='#653f2e';c.lineWidth=4;c.stroke();c.beginPath();c.moveTo(58,0);c.bezierCurveTo(16,-21,-33,-21,-57,0);c.bezierCurveTo(-33,21,16,21,58,0);c.fillStyle='#5b4435';c.fill();line([[-21,-20],[-21,20]],'#cf9d67',6);line([[30,-17],[30,17]],'#cf9d67',5);
 for(let i=0;i<Math.min(cargo.length,8);i++)icon(cargo[i],-36+(i%3)*18,-10+Math.floor(i/3)*10,.29);
 if(occupied){
 // Seated paddler seen from above: legs, tunic, shoulders, head, face and rowing arms.
 line([[-17,-7],[-2,-7]],'#9b6846',7);line([[-17,7],[-2,7]],'#9b6846',7);
 ellipse(6,0,17,13,'#c58b57');line([[1,-12],[15,-17],[27,-27]],'#bb8158',6);line([[1,12],[19,14],[25,-8]],'#bb8158',6);
 ellipse(24,0,12,11,'#b97e57');ellipse(19,0,9,11,'#302b27');ellipse(28,-4,1.5,1.4,'#342b25');ellipse(28,4,1.5,1.4,'#342b25');path([[33,-2],[37,0],[33,2]],'#c28b64');
 const stroke=moving?Math.sin(t*8)*.5:.2;c.save();c.translate(20,-9);c.rotate(stroke);line([[-3,-5],[-5,-32]],'#eac38b',4);ellipse(-5,-39,7,14,'#eac38b');c.restore();
 }else{line([[9,-22],[-2,29]],'#d4b17e',4);ellipse(-5,36,6,12,'#d4b17e');}c.restore();}
function rock(x,y,r){ellipse(x,y+10,r*1.1,r*.58,'#18556333');path([[x-r,y+7],[x-r*.75,y-r*.5],[x-r*.13,y-r*.75],[x+r*.65,y-r*.46],[x+r,y+9],[x+r*.3,y+r*.4],[x-r*.65,y+r*.3]],'#9aa8a1','#748880');path([[x-r*.7,y-r*.3],[x-r*.1,y-r*.65],[x+r*.5,y-r*.34],[x+r*.3,y]],'#c0c8b8');}
function tree(x,y,k,autumn=false){c.save();c.translate(x,y);c.scale(k,k);ellipse(0,6,48,13,'#31553d22');line([[0,0],[0,-86]],'#805b3e',17);line([[0,-45],[-24,-70]],'#805b3e',9);const colors=autumn?['#d39447','#e7b85d','#b8793f']:['#497b50','#6b9859','#89ab60'];ellipse(-27,-87,36,33,colors[0]);ellipse(28,-90,38,35,colors[1]);ellipse(0,-120,39,39,colors[2]);ellipse(-8,-111,31,28,colors[1]);c.restore();}
function wigwam(x,y,k=1){c.save();c.translate(x,y);c.scale(k,k);ellipse(0,0,75,20,'#3e57332c');c.beginPath();c.moveTo(-68,0);c.bezierCurveTo(-66,-112,64,-112,68,0);c.closePath();c.fillStyle='#b18c5e';c.fill();c.strokeStyle='#7d6546';c.lineWidth=3;c.stroke();for(let i=-2;i<=2;i++)line([[i*24,0],[i*17,-66]],'#d8b681',3);for(const y of [-15,-33,-51]){c.beginPath();c.ellipse(0,y,Math.sqrt(Math.max(0,1-(y/90)**2))*65,12,0,0,Math.PI);c.strokeStyle='#806645';c.lineWidth=2;c.stroke();}path([[-17,0],[-16,-39],[14,-41],[19,0]],'#3c3a2a');c.restore();}
function bubble(kind,x,y,t){ellipse(x,y,35+Math.sin(t*3)*2,35,'#fff7dc');c.strokeStyle='#d4b769';c.lineWidth=3;c.beginPath();c.arc(x,y,35,0,TAU);c.stroke();icon(kind,x,y,.83);}
function arrow(x,y,t){c.save();c.translate(x,y+Math.sin(t*4)*7);path([[-15,-25],[15,-25],[15,-9],[29,-9],[0,17],[-29,-9],[-15,-9]],'#fff3a0','#b99545');c.restore();}
function woodlandVisitor(s,t,v){if(!v)return;
 if(v.phase==='approach'||v.phase==='rise'){ring(v.x,v.y-12,62,t,'#ffda75');bubble(v.target.kind,v.x,v.y-110,t);}
 if(v.kind==='gatherer'){if(v.phase==='rise'){c.save();c.translate(v.x,v.y);c.scale(1,.65+.35*Math.min(1,v.riseTime));person(0,0,1.08,t,false,null,'#759582');c.restore();}else person(v.x,v.y,1.08,t,true,v.carry,'#759582');return;}
 c.save();c.translate(v.x,v.y+Math.sin(t*13)*3);const facing=(v.phase==='approach'?v.target.x:v.exitX)<v.x?-1:1;c.scale(facing,1);
 const gray=v.kind==='raccoon',fur=gray?'#8d938a':'#b67d48';ellipse(0,0,43,12,'#43534233');
 c.save();c.translate(-28,-22);c.rotate(-.4+Math.sin(t*9)*.1);ellipse(-5,-13,14,33,fur);if(gray)for(let yy=-34;yy<14;yy+=12)line([[-17,yy],[7,yy]],'#4d5551',7);c.restore();
 const step=Math.sin(t*14)*7;line([[-19,-13],[-25+step,0]],fur,9);line([[13,-13],[19-step,0]],fur,9);ellipse(0,-25,33,22,fur);ellipse(29,-39,21,20,fur);ellipse(17,-58,7,9,fur);ellipse(37,-57,7,9,fur);ellipse(39,-36,12,10,gray?'#e0dfc9':'#e3b784');
 if(gray){ellipse(30,-43,16,6,'#444b47');}ellipse(36,-44,3,3,'#202f2b');ellipse(49,-35,4,3,'#303b33');if(v.carry)icon(v.carry,22,-14,.65);c.restore();
}
function campfire(s,t){const camp=s.shore.camp;if(!camp?.enabled)return;
 const x=1070,y=185;ellipse(x,y,75+Math.sin(t*3)*5,45,'#f8c26335');icon('wood',x,y,1.05);
 c.save();c.translate(x,y-5);const flicker=Math.sin(t*9)*3;c.beginPath();c.moveTo(-19,2);c.bezierCurveTo(-37,-23,-5,-31,-6+flicker,-65);c.bezierCurveTo(12,-50,8,-31,19,-41);c.bezierCurveTo(39,-13,27,7,-19,2);c.fillStyle='#e8833d';c.fill();c.beginPath();c.moveTo(-10,1);c.bezierCurveTo(-21,-13,3,-21,4,-42+flicker);c.bezierCurveTo(27,-9,17,5,-10,1);c.fillStyle='#ffe38a';c.fill();for(let i=0;i<3;i++){const p=(t*.55+i*.32)%1;ellipse(Math.sin(t*2+i)*12,-28-p*60,2,3,'#f7d176');}c.restore();
 camp.people.forEach((seat,i)=>{if(seat.busy)return;c.save();c.translate(seat.x,seat.y);ellipse(0,2,24,8,'#54634822');line([[-20,-2],[0,-9],[20,-2]],'#79543c',9);path([[-15,-33],[15,-33],[20,-9],[-20,-9]],i%2?'#8b9a75':'#759582','#667257');line([[-12,-28],[-19,-10]],'#b77a50',7);line([[12,-28],[19,-10]],'#b77a50',7);ellipse(0,-46,15,17,'#b97e57');ellipse(0,-57,15,9,'#322e2a');ellipse(-12,-48,4,10,'#322e2a');ellipse(12,-48,4,10,'#322e2a');ellipse(-5,-46,1.5,2,'#292c29');ellipse(5,-46,1.5,2,'#292c29');c.restore();});
 for(let i=0;i<Math.min(camp.wood,5);i++)icon('wood',1030+i*12,215,.5);
}
function shore(s,ui,t){const autumn=s.config.season==='autumn';const g=c.createLinearGradient(0,0,0,720);g.addColorStop(0,autumn?'#cfb979':'#adc283');g.addColorStop(1,'#e5ce91');c.fillStyle=g;c.fillRect(0,0,1200,720);
 c.beginPath();c.moveTo(440,720);c.bezierCurveTo(480,550,330,350,180,180);c.lineTo(310,180);c.bezierCurveTo(550,310,590,530,690,720);c.fillStyle='#ecdcb0';c.fill();
 for(let i=0;i<18;i++){const x=(i*227+60)%1200,y=(i*113)%570;if(x<140||x>1080||y<150)tree(x,y,1.1+(i%3)*.15,autumn);}
 for(let i=0;i<50;i++){const x=(i*173+37)%1200,y=(i*83+40)%590;if(autumn){c.save();c.translate(x,y);c.rotate(i);ellipse(0,0,8,4,i%2?'#c98c43':'#e9bc64');c.restore();}else{line([[x,y],[x+3,y-9]],'#91a46b',2);}}
 c.fillStyle='#77c0c4';c.beginPath();c.moveTo(0,660);c.bezierCurveTo(300,610,730,625,1200,665);c.lineTo(1200,720);c.lineTo(0,720);c.fill();for(let i=0;i<8;i++)line([[i*173+Math.sin(t+i)*10,685],[i*173+75,685]],'#b3e1d5',2);
 campfire(s,t);
 for(const it of s.shore.items){if(it.taken)continue;const hovered=ui.pointer.inside&&Math.hypot(ui.pointer.x-it.x,ui.pointer.y-it.y)<65;ellipse(it.x,it.y+30,49,13,'#536b3a22');if(it.kind==='berry'){for(let j=0;j<4;j++)ellipse(it.x-25+j*17,it.y+4-Math.sin(j)*15,30,27,j%2?'#70914b':'#547941');icon('berry',it.x,it.y-12,1.25);}else if(it.kind==='wood'){icon('wood',it.x,it.y,1.6);}else{ellipse(it.x,it.y+4,44,18,'#b8a068');icon('nut',it.x,it.y,1.5);}if(hovered||ui.hint&&ui.hint.type==='gather'&&ui.hint.id===it.id)ring(it.x,it.y,62,t);if(s.level===2&&!s.carried&&!s.basketCarried||ui.hint?.id===it.id)arrow(it.x,it.y-65,t);}
 const target={x:590,y:570};if(!s.basketCarried){ring(target.x,target.y+10,58,t,s.carried?'#ffe66d':'#f6e5b8');icon('basket',590,560,1.3);for(let i=0;i<s.cargo.length;i++)icon(s.cargo[i],575+(i%3)*16,550-Math.floor(i/3)*10,.32);}
 person(s.person.x,s.person.y,1.14,t,s.person.walking,s.carried?.kind||null);if(s.basketCarried){icon('basket',s.person.x+6,s.person.y-23,.9);for(let i=0;i<s.cargo.length;i++)icon(s.cargo[i],s.person.x-5+(i%3)*11,s.person.y-34-Math.floor(i/3)*8,.23);}
 canoe(835,663,0,t,[],false,false);bubble(s.basketCarried?'boat':'basket',835,585,t);
 const carryTarget=s.carried?target:s.basketCarried?{x:835,y:620}:!s.shore.items.some(i=>!i.taken)&&!s.job?target:null;
 if(carryTarget){arrow(carryTarget.x,carryTarget.y-80,t);const from={x:s.person.x,y:s.person.y-15},dx=carryTarget.x-from.x,dy=carryTarget.y-from.y;if(Math.hypot(dx,dy)>100){for(let i=1;i<=3;i++){const f=(i/4+t*.13)%1;c.save();c.translate(from.x+dx*f,from.y+dy*f);c.rotate(Math.atan2(dy,dx)-Math.PI/2);c.scale(.4,.4);arrow(0,0,t);c.restore();}}}

 if(ui.dragItem){icon(ui.dragItem.kind,ui.pointer.x,ui.pointer.y,1.15);ring(590,575,75,t);}
 if(ui.hint?.type==='board')arrow(835,522,t);for(const visitor of s.visitors)woodlandVisitor(s,t,visitor);
}
function river(s,ui,t){const autumn=s.config.season==='autumn',cam=M.camera(s);c.fillStyle=autumn?'#c4b477':'#9ebb7c';c.fillRect(0,0,1200,720);const left=[],right=[];for(let sy=-40;sy<=760;sy+=20){const b=M.banks(s,cam+720-sy);left.push([b.left,sy]);right.push([b.right,sy]);}path([...left,...right.reverse()],'#e1ca8e');const l2=left.map(([x,y])=>[x+17,y]),r2=[...right].reverse().map(([x,y])=>[x-17,y]);const water=c.createLinearGradient(220,0,1000,720);water.addColorStop(0,'#4f9fa9');water.addColorStop(.5,'#6cb7bc');water.addColorStop(1,'#388b9e');path([...l2,...r2.reverse()],water);
 line(left,'#698e5f',6);line(right,'#698e5f',6);
 for(let i=0;i<75;i++){const wy=Math.floor(cam/80)*80+(i%15)*80,xx=(i*197+s.seed*70)%1200,p=M.screen(s,{x:xx,y:wy}),b=M.banks(s,wy);if(xx>b.left+25&&xx<b.right-25){const wave=Math.sin(t*2+i)*9;line([[xx+wave,p.y],[xx+26+wave,p.y-3],[xx+49+wave,p.y]],i%3?'#b0ded433':'#d6eee266',2);if(i%13===0){ellipse(xx+Math.sin(t+i)*15,p.y,9,3,'#24667555');}}}
 for(let i=Math.floor(cam/130)-2;i<(cam+850)/130;i++){const y=i*130+37,sy=M.screen(s,{x:0,y}).y,b=M.banks(s,y);tree(b.left-75-(i%2)*37,sy,1.15+(i%3)*.1,autumn);tree(b.right+80+(i%3)*20,sy+32,1.1+(i%2)*.35,autumn);for(const side of [-1,1]){const x=side<0?b.left-27:b.right+27;line([[x,sy+45],[x-9,sy+22],[x+1,sy+37],[x+8,sy+14]],'#738d55',3);}}
 for(const stop of s.stops){const p=M.screen(s,stop);if(p.y<-100||p.y>820)continue;const sign=stop.side==='left'?-1:1;ellipse(p.x+sign*70,p.y,88,63,'#e9d6a0');line([[p.x-sign*25,p.y+33],[p.x+sign*70,p.y+33]],'#b99261',12);line([[p.x-sign*25,p.y-33],[p.x+sign*70,p.y-33]],'#b99261',12);for(let yy=-27;yy<=27;yy+=13)line([[p.x-sign*25,p.y+yy],[p.x+sign*40,p.y+yy]],'#e0bc81',11);const done=stop.items.every(i=>i.taken);bubble(done?'check':'feet',p.x+sign*40,p.y-63,t);if(done){ellipse(p.x+sign*40,p.y-63,34,34,'#64966d');icon('check',p.x+sign*40,p.y-63,.8);}else{stop.kinds.forEach((k,i)=>icon(k,p.x+sign*(97+i*38),p.y-15,.9));if(s.level===2||stop.replacement||ui.hint?.type==='dock'&&ui.hint.id===stop.id)arrow(p.x,p.y-109,t);}if(M.dist(s.boat,stop)<175)ring(p.x,p.y,75,t);}
 if(s.config.fork){const mid=M.banks(s,s.forkY).mid,p=M.screen(s,{x:mid,y:s.forkY});if(p.y>-230&&p.y<1000){ellipse(mid,p.y,80,145,'#d5c88b');ellipse(mid,p.y,65,125,'#91a269');tree(mid,p.y-10,.8,autumn);for(const side of ['left','right']){const x=mid+(side==='left'?-255:255);ellipse(x,p.y-5,43,35,'#dbc88c');if((side===s.correctSide?s.landmark:s.landmark==='tree'?'boulder':'tree')==='tree')tree(x,p.y-15,.85,false);else rock(x,p.y-28,35);}const showRoute=ui.hint?.type==='fork';if(showRoute)arrow(mid+(s.correctSide==='left'?-155:155),p.y-95,t);}}
 for(const o of s.obstacles){const p=M.screen(s,o);if(p.y<-70||p.y>790)continue;if(o.type==='rock')rock(p.x,p.y,o.r);else{c.save();c.translate(p.x,p.y);c.rotate(Math.sin(t*.45+o.phase)*.16);ellipse(0,11,72,17,'#24637233');c.fillStyle='#916c49';c.fillRect(-66,-12,132,24);ellipse(-66,0,8,12,'#b59160');ellipse(66,0,8,12,'#e4bd80');line([[-50,-4],[49,-4]],'#b1905e',3);line([[8,-10],[0,-24],[12,-35]],'#916c49',8);c.restore();}}
 const home=M.screen(s,{x:M.banks(s,s.config.length-180).mid,y:s.config.length-180});if(home.y>-200&&home.y<900){ellipse(home.x,home.y,255,95,'#d4c28b');c.fillStyle=autumn?'#a4ab74':'#a9be7c';c.fillRect(home.x-240,home.y-300,480,270);wigwam(home.x-90,home.y-90,.9);wigwam(home.x+95,home.y-110,.7);person(home.x+25,home.y-80,.82,t);person(home.x+60,home.y-55,.54,t);bubble('home',home.x,home.y-30,t);if(!s.complete)ring(home.x,home.y+30,130,t);}
 if(s.floating){const p=M.screen(s,s.floating);ring(p.x,p.y,43,t,'#ffe78f');icon('basket',p.x,p.y+Math.sin(t*3)*3,.85);icon(s.floating.kind,p.x,p.y-15,.7);arrow(p.x,p.y-62,t);}
 const b=M.screen(s,s.boat);canoe(b.x+(s.bump?Math.sin(t*32)*4:0),b.y,s.boat.angle,t,s.cargo,s.boat.moving);if(ui.hint&&['home','fork','recover'].includes(ui.hint.type)){const p=M.screen(s,ui.hint);arrow(Math.max(90,Math.min(1110,p.x)),Math.max(80,Math.min(630,p.y-60)),t);}if(s.level===1&&s.boat.y<320){bubble('paddle',b.x+105,b.y-40,t);arrow(b.x,b.y-130,t);}
 /* A few passing birds and a turtle reward looking around. */
 const bx=(t*24+180)%1400-100,by=70+Math.sin(t*.23)*25;line([[bx-15,by+5],[bx-7,by],[bx,by+4],[bx+7,by],[bx+15,by+5]],'#f5ecd6',3);const turtleY=M.screen(s,{x:0,y:900}).y;if(turtleY>-20&&turtleY<740){const b=M.banks(s,900),x=b.right-15;ellipse(x,turtleY,16,11,'#6f8350');ellipse(x-18,turtleY,6,5,'#9caa64');line([[x-7,turtleY-10],[x-12,turtleY-16]],'#9caa64',4);line([[x+7,turtleY+10],[x+12,turtleY+16]],'#9caa64',4);}
}
function draw(s,ui,t){c.clearRect(0,0,1200,720);if(s.mode==='shore')shore(s,ui,t);else river(s,ui,t);if(s.complete){c.fillStyle='#fff5bd24';c.fillRect(0,0,1200,720);for(let i=0;i<22;i++){const x=(i*137+t*20)%1200,y=(i*73+t*30)%720;ellipse(x,y,4,7,i%2?'#f1cd68':'#f6eee0');}}
 if(ui.demo){const d=ui.demo,a=(Math.sin(t*2)+1)/2,x=d.from.x+(d.to.x-d.from.x)*a,y=d.from.y+(d.to.y-d.from.y)*a;line([[x,y],[x+16,y+25],[x+20,y+13],[x+33,y+11],[x,y]],'#455c50',5);path([[x,y],[x+16,y+25],[x+20,y+13],[x+33,y+11]],'#fff9e5');}
}
return {draw,icon,person,canoe,tree,wigwam};}
window.RiverArt={create};
})();
