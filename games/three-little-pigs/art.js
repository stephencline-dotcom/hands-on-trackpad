/* Original vector storybook artwork, drawn at the game's logical resolution. */
(()=>{'use strict';
function create(c){
const oval=(x,y,rx,ry,fill,stroke)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2.5;c.stroke();}};
function path(points,fill,stroke,width=3){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(fill){c.closePath();c.fillStyle=fill;c.fill();}if(stroke){c.lineJoin='round';c.lineCap='round';c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}}
function text(t,x,y,size=20,color='#435133'){c.font=`800 ${size}px system-ui`;c.fillStyle=color;c.textAlign='center';c.fillText(t,x,y);}
function round(x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
function tree(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);oval(0,0,55,10,'#39563620');path([[-9,0],[-6,-110],[9,-110],[12,0]],'#95724a','#735438');path([[0,-62],[-29,-96],[0,-77],[31,-105]],null,'#95724a',9);oval(-30,-120,45,43,'#53865b');oval(31,-125,46,48,'#619865');oval(0,-158,47,47,'#71a56a');oval(-16,-173,27,23,'#8cb876');oval(42,-139,20,23,'#8cb876');c.restore();}
function cloud(x,y,s){c.save();c.translate(x,y);c.scale(s,s);oval(0,0,43,15,'#fffef3cc');oval(-20,-11,24,21,'#fffef3cc');oval(11,-18,31,25,'#fffef3cc');oval(39,-3,23,14,'#fffef3cc');c.restore();}
function scene(t,variant,chapter='straw'){if(chapter==='sticks'){stickScene(t,variant);escapeRoad(true);return;}const sky=c.createLinearGradient(0,0,0,400);sky.addColorStop(0,'#a6d8de');sky.addColorStop(1,'#edf0cc');c.fillStyle=sky;c.fillRect(0,0,1100,650);oval(899,87,44,44,'#fff1a1');oval(899,87,57,57,'#fff1a128');cloud(170+Math.sin(t*.035)*15,79,1.2);cloud(550+Math.sin(t*.025)*20,112,.9);cloud(1007,156,.8);
path([[0,286],[110,227],[225,241],[369,198],[520,241],[694,214],[811,251],[984,210],[1100,244],[1100,420],[0,420]],'#a8c98b');path([[0,332],[168,284],[307,319],[443,271],[593,307],[755,280],[949,311],[1100,278],[1100,650],[0,650]],'#7fa968');path([[0,372],[180,347],[366,375],[592,355],[789,373],[1100,337],[1100,650],[0,650]],'#a8bd76');path([[0,437],[197,411],[421,459],[663,433],[886,426],[1100,406],[1100,650],[0,650]],'#bdcc8a');
path([[308,650],[365,540],[405,481],[574,461],[804,471],[820,520],[616,496],[467,514],[423,570],[401,650]],'#dfc592');path([[374,616],[410,553],[459,506],[611,480],[790,492]],null,'#f0d8a8',6);
tree(28,389,1.15);tree(104,359,.8);tree(1062,365,1.15);tree(963,330,.65);tree(286,320,.55);
for(let i=0;i<42;i++){const x=(i*103+variant*31)%1100,y=385+(i*47)%250;if(x>365&&x<800&&y<480)continue;path([[x,y],[x-3,y-9],[x+1,y-2],[x+7,y-13]],null,'#799b59',1.5);if(i%3===0){oval(x+7,y-14,3,3,i%2?'#fff3bc':'#f4c9aa');oval(x+7,y-14,1.5,1.5,'#d5a946');}}
// A separate, readable supply mat, with no characters over its pieces.
round(31,494,330,139,18,'#ede0b6','#bba071');path([[44,509],[348,509]],null,'#fff7d1',3);text('STRAW SUPPLIES',196,485,16,'#5c663c');
// Foundation shows that the building has a real footprint.
oval(595,458,188,27,'#4b653c22');path([[430,443],[745,443],[776,464],[447,475],[421,462]],'#ab986e','#8b805c');path([[437,452],[749,452]],null,'#e4d1a0',4);
text('BUILDING SITE',598,151,15,'#577755');
// Path continues visibly through the escape gate toward Brother Pig.
text('TO BROTHER PIG',947,318,13,'#536a40');path([[929,336],[985,336],[985,328],[1004,341],[985,355],[985,347],[929,347]],'#f8e1a2','#9b824e',2);escapeRoad(false);
}

function stickScene(t,variant){
const sky=c.createLinearGradient(0,0,0,400);sky.addColorStop(0,'#cadbd0');sky.addColorStop(1,'#f6e8b9');c.fillStyle=sky;c.fillRect(0,0,1100,650);
oval(817,108,40,40,'#fff0b2');cloud(530,70,.9);cloud(955,157,.65);
path([[0,281],[193,226],[340,272],[508,212],[671,266],[815,214],[1100,268],[1100,650],[0,650]],'#97b29a');
for(let i=0;i<12;i++){const xx=i*101-10,yy=122+(i%4)*24;path([[xx-7,357],[xx-4,yy],[xx+5,yy],[xx+10,357]],'#78947c');
if(i%3===1){path([[xx,yy-95],[xx-56,yy+22],[xx-27,yy+13],[xx-67,yy+85],[xx+65,yy+85],[xx+29,yy+12],[xx+57,yy+23]],'#77987a');path([[xx,yy-64],[xx-38,yy+17],[xx+5,yy+7]],'#88a586');}
else {oval(xx-23,yy+4,43,59,i%2?'#7f9e78':'#8aa67b');oval(xx+26,yy-3,47,63,i%2?'#86a17a':'#91aa7d');oval(xx,yy-41,44,52,i%2?'#8aa67e':'#9ab384');oval(xx-15,yy-63,26,23,'#adc28e55');path([[xx,yy+107],[xx-24,yy+52],[xx,yy+74],[xx+29,yy+32]],null,'#78947c',6);}
}
path([[0,382],[246,339],[446,365],[705,344],[1100,377],[1100,650],[0,650]],'#a0b17a');
path([[0,467],[229,403],[411,431],[619,423],[859,433],[1100,410],[1100,650],[0,650]],'#c6c28b');
// Boardwalk and wood chips replace the open meadow path.
path([[439,650],[467,529],[513,477],[802,465],[830,508],[800,508],[539,519],[512,559],[492,650]],'#d9b788');
for(let i=0;i<6;i++){const x=495+i*53,y=488;path([[x,y-16],[x-7,y+25]],null,'#bc9465',2);}
// Tall birches frame this workshop; their canopy is high above the controls.
for(const [x,w]of [[10,36],[1060,43]]){path([[x,0],[x+w,0],[x+w+9,445],[x-5,445]],'#e5dfc4','#a3a28b',2);for(let i=0;i<10;i++)path([[x+(i%2)*11,30+i*39],[x+w-6,35+i*39]],null,'#8a9180',4);}
oval(60,25,150,75,'#62856c');oval(1046,19,160,91,'#719373');tree(220,350,.62);
// A sawhorse with prepared sticks: a workshop, not a second building target.
path([[84,454],[105,390],[126,454],[166,454],[187,390],[207,454]],null,'#8d704e',10);round(85,388,121,12,4,'#bb9666','#836849');
for(let k=0;k<6;k++){const yy=375-k*7;path([[65+k*3,yy],[221-k*3,yy-6]],null,k%2?'#bb9260':'#9e794f',6);}
for(let i=0;i<24;i++){const xx=(i*83+variant*23)%1100,yy=466+(i*43)%175;if(xx<445&&yy>490)continue;path([[xx,yy],[xx+6,yy-3],[xx+12,yy+1]],null,'#a98e5e',2);}
round(22,494,410,139,18,'#e9d8b3','#aa8961');path([[36,507],[418,507]],null,'#fff0c9',3);text('STICK WORKSHOP',227,485,16,'#685c3c');
oval(580,459,197,25,'#45553822');path([[423,443],[743,443],[776,464],[440,475],[418,462]],'#aa956d','#807251');path([[435,452],[748,452]],null,'#e0c99a',4);
for(const x of [449,574,699])oval(x,442,20,8,'#796c4c','#caba8e');
text('BIG BROTHER’S HOUSE',575,140,16,'#536b4f');text('TO THE BRICK HOUSE',948,317,13,'#5e6948');path([[929,337],[985,337],[985,329],[1004,342],[985,356],[985,348],[929,348]],'#f5d99c','#97794c',2);
}
function stickPiece(kind,x,y,w,h,alpha=1,side='roof-left'){
c.save();c.translate(x,y);c.globalAlpha*=alpha;
function branch(x1,y1,x2,y2,width=7){path([[x1,y1],[x2,y2]],null,'#795536',width+3);path([[x1,y1],[x2,y2]],null,'#b18a59',width);path([[x1-1,y1],[x2-1,y2]],null,'#d2ad78',Math.max(1,width*.23));}
if(kind==='post'){branch(0,-h/2,0,h/2,w*.72);for(let i=0;i<4;i++){const yy=-h*.32+i*h*.2;path([[-w*.3,yy],[w*.2,yy+5]],null,'#7d5737',2);}oval(w*.1,-h*.2,w*.18,w*.28,'#957048','#735237');}
if(kind==='beam'){round(-w/2,-h/2,w,h,4,'#b18b5c','#795536');for(let i=0;i<3;i++)path([[-w/2+6,-h*.3+i*h*.3],[w/2-6,-h*.25+i*h*.3]],null,'#d2ae7a',1.5);for(const xx of [-w*.42,0,w*.42])oval(xx,0,3,3,'#5e6454','#d1c5a4');}
if(kind==='panel'){round(-w/2,-h/2,w,h,4,'#b59767','#81623d');for(let i=0;i<9;i++){const xx=-w*.45+i*w*.112;branch(xx,-h*.47,xx+(i%2?2:-2),h*.47,Math.max(3,w*.07));}branch(-w*.45,-h*.3,w*.45,-h*.3,5);branch(-w*.45,h*.3,w*.45,h*.3,5);branch(-w*.41,h*.38,w*.41,-h*.38,5);}
if(kind==='roof'){c.save();if(side==='roof-right')c.scale(-1,1);path([[-w/2,h/2],[w/2,-h/2],[w/2,h/2]],'#a17a4c','#6f5033',4);for(let i=0;i<8;i++){const xx=-w/2+i*w/8,top=h/2-i*h/8;branch(xx,top,xx,h/2,Math.max(3,w*.054));}branch(-w/2,h/2,w/2,-h/2,6);branch(-w/2,h/2,w/2,h/2,6);c.restore();}
if(kind==='door'){round(-w/2,-h/2,w,h,5,'#ae8050','#715034');for(let i=1;i<5;i++)path([[-w/2+i*w/5,-h/2+4],[-w/2+i*w/5,h/2-4]],null,'#d0a16c',3);branch(-w*.38,-h*.3,w*.38,h*.3,5);branch(-w*.38,h*.3,w*.38,-h*.3,5);oval(w*.27,0,4,4,'#e2c778','#6f5535');}
c.restore();}
function piece(kind,x,y,w,h,alpha=1,side='roof-left',material='straw'){if(material==='sticks'){stickPiece(kind,x,y,w,h,alpha,side);return;}c.save();c.globalAlpha*=alpha;c.translate(x,y);
if(kind==='wall'){round(-w/2,-h/2,w,h,9,'#dbb352','#a77b32');for(let i=0;i<26;i++){let xx=-w/2+4+(i*17)%(w-8);path([[xx,-h/2+7+(i%4)*4],[xx-4,h/2-5]],null,i%3?'#f7d785':'#b68c39',1.8);}for(const yy of [-h*.26,h*.26]){path([[-w/2-2,yy],[w/2+2,yy+3]],null,'#9b7139',5);path([[-w/2-2,yy-1],[w/2+2,yy+1]],null,'#e1bd72',1.5);}oval(w/2-5,h*.26,5,4,'#946737');}
if(kind==='roof'){c.save();if(side==='roof-right')c.scale(-1,1);path([[-w/2,h/2],[w/2,-h/2],[w/2,h/2]],'#d3a34b','#976b30',4);for(let row=0;row<5;row++){const yy=-h/2+row*h/5,left=w/2-row*w/5;for(let k=0;k<=row*2;k++){const xx=left+(w/2-left)*k/Math.max(1,row*2);path([[xx,yy+3],[xx-3,yy+h/5+5]],null,k%2?'#f7d27d':'#e8bd62',4);}}path([[-w/2-3,h/2],[w/2+3,h/2]],null,'#a47c3c',4);c.restore();}
if(kind==='door'){round(-w/2,-h/2,w,h,6,'#aa7041','#714d31');for(let i=1;i<5;i++)path([[-w/2+i*w/5,-h/2+4],[-w/2+i*w/5,h/2-4]],null,'#c79153',3);path([[-w/2+4,-h/2+13],[w/2-4,-h/2+13],[-w/2+4,h/2-13],[w/2-4,h/2-13]],null,'#e3b16c',5);oval(w*.28,5,4,4,'#f8d87d','#684f2d');}c.restore();}
function ghost(slot,t,strong=false){c.save();c.globalAlpha=strong?.68:.3;c.setLineDash([9,7]);c.strokeStyle=strong?'#fff9d7':'#725f32';c.fillStyle=strong?'#ffec9f35':'#f9e4a41a';c.lineWidth=strong?5:2;c.beginPath();if(slot.kind==='roof'){const flip=slot.id==='roof-right'?-1:1;c.moveTo(slot.x-flip*slot.w/2,slot.y+slot.h/2);c.lineTo(slot.x+flip*slot.w/2,slot.y-slot.h/2);c.lineTo(slot.x+flip*slot.w/2,slot.y+slot.h/2);c.closePath();}else c.roundRect(slot.x-slot.w/2,slot.y-slot.h/2,slot.w,slot.h,7);c.fill();c.stroke();c.restore();if(strong){oval(slot.x,slot.y,16+Math.sin(t*4)*2,16+Math.sin(t*4)*2,'#fff7cd');text('+',slot.x,slot.y+7,25,'#9d7d37');}}
function pig(x,y,t,walking=false,inside=false,happy=false,brother=false){c.save();c.translate(x,y);if(brother)c.scale(1.06,1.06);if(inside)c.scale(.7,.7);const bob=walking?Math.sin(t*11)*3:Math.sin(t*2)*1.2;c.translate(0,-bob);oval(0,57,34,7,'#48603728');for(let i=0;i<2;i++){let xx=i?15:-15,step=walking?Math.sin(t*11+i*Math.PI)*10:0;path([[xx,26],[xx+step,51]],null,'#eab1a0',13);oval(xx+step,53,9,5,'#755541');}oval(0,12,31,35,'#f6c2aa','#b77864');path([[-27,5],[-21,35],[24,35],[28,5],[15,-4],[-14,-4]],brother?'#be8150':'#6d9b9b',brother?'#895834':'#4f797b',2);path([[-18,-7],[-16,17],[16,17],[18,-7]],null,brother?'#d8ad72':'#98bfba',6);oval(-15,15,3,3,'#ead78f');oval(15,15,3,3,'#ead78f');const wave=happy?Math.sin(t*7)*12:0;path([[-26,6],[-39,20]],null,'#edb5a3',11);path([[26,6],[39,17-wave]],null,'#edb5a3',11);
// Curly tail and tall ears make the silhouette unmistakably a pig.
c.beginPath();c.strokeStyle='#be8273';c.lineWidth=3;c.arc(-35,20,8,-1,4.8);c.stroke();oval(0,-29,32,30,'#f6c4b1','#b77864');path([[-24,-47],[-29,-73],[-8,-54]],'#f2b8a5','#b77864',2);path([[10,-55],[27,-73],[25,-44]],'#f2b8a5','#b77864',2);path([[-22,-54],[-25,-65],[-15,-55]],'#db948b');path([[16,-55],[23,-66],[22,-53]],'#db948b');oval(-12,-33,4,5,'#fff9ea');oval(12,-33,4,5,'#fff9ea');oval(-11,-33,2.4,3.7,'#394238');oval(13,-33,2.4,3.7,'#394238');oval(1,-19,19,12,'#eaa295','#b77864');oval(-5,-20,2.5,3.4,'#aa6b60');oval(7,-20,2.5,3.4,'#aa6b60');path([[-6,-3],[0,0],[7,-3]],null,'#a16558',2);oval(-23,-20,5,3,'#eea99b');oval(24,-20,5,3,'#eea99b');path([[-30,-51],[29,-51],[18,-59],[-18,-59]],brother?'#80a56c':'#edc365',brother?'#4c7953':'#a2803f',2);round(-18,-69,36,14,5,brother?'#80a56c':'#edc365',brother?'#4c7953':'#a2803f');c.restore();}
function wolf(x,y,t,puff=0){c.save();c.translate(x,y);oval(0,57,43,9,'#314f352b');path([[-21,15],[-68,0],[-84,-27],[-81,6],[-54,31],[-22,32]],'#7b898b','#455b60');path([[-84,-27],[-81,6],[-72,16],[-72,-10]],'#b7c0b5');for(let i=0;i<2;i++){const xx=i?19:-15;path([[xx,20],[xx+Math.sin(t*7+i*3)*4,53]],null,'#5c7276',12);oval(xx+6,55,12,6,'#3e565d');}oval(0,2,32,36,'#778c8d','#455b60');oval(7,8,19,28,'#c8cebd');path([[15,-28],[6,-66],[20,-84],[33,-63],[49,-77],[53,-45],[86,-26],[59,-6],[34,-5]],'#7a8e90','#455b60');path([[13,-66],[20,-75],[26,-61]],'#c2b1a0');path([[39,-60],[47,-69],[48,-54]],'#c2b1a0');path([[29,-27],[53,-41],[86,-26],[59,-6],[34,-5]],'#d4d6c1');oval(82,-27,7,6,'#324b52');oval(38,-49,6,7,'#fff4d4');oval(41,-48,2.5,4,'#304650');path([[30,-58],[42,-58]],null,'#3e555b',3);if(puff>0){oval(43,-24,16+puff*10,13+puff*6,'#aab9b0','#647f81');oval(79,-24,5,4,'#4b6568');}else path([[55,-14],[70,-19]],null,'#455b60',2);path([[-20,-8],[-40,-22]],null,'#71878a',11);path([[24,0],[43,-4]],null,'#71878a',11);c.restore();}
function escapeRoad(wood){
// The approach turns up through the opening, then continues beyond the fence.
c.save();c.beginPath();c.moveTo(760,495);c.bezierCurveTo(848,512,963,520,963,477);c.lineTo(963,435);c.bezierCurveTo(963,411,1025,400,1100,397);c.lineCap='round';c.lineJoin='round';c.strokeStyle=wood?'#bc986a':'#c6ac79';c.lineWidth=65;c.stroke();c.strokeStyle=wood?'#dfbd8e':'#e8cea0';c.lineWidth=59;c.stroke();
if(wood){for(const [x,y,vertical]of [[823,504,true],[870,507,true],[916,506,true],[963,484,false],[963,461,false],[963,438,false],[993,407,true],[1040,400,true],[1085,398,true]])path(vertical?[[x-2,y-25],[x+2,y+25]]:[[x-28,y],[x+28,y]],null,'#bd9769',2);}c.restore();
}
function gate(open,t,highlight,amount=open?1:0){
// Narrow fence rails make the opening an actual passage, rather than a floating gate.
for(const [a,b]of [[850,887],[1022,1100]]){for(const yy of [403,436])path([[a,yy],[b,yy]],null,'#af8b57',7);}
for(const x of [887,1009]){round(x,368,13,103,4,'#b48b58','#7d6844');oval(x+6,368,10,5,'#d2b27a');}
c.save();c.translate(901,390);const angle=amount*Math.PI*.48;c.transform(Math.cos(angle),-Math.sin(angle)*.58,0,1,0,0);
for(let i=0;i<5;i++)round(i*22,-10,13,76,3,'#d3ad70','#8d744c');path([[0,2],[101,2],[0,57],[101,57]],null,'#927347',7);oval(98,26,7,7,'#f4d467','#91703c');c.restore();
if(highlight&&!open){text('OPEN',952,376,15,'#4b623b');const a=8+Math.sin(t*4)*4;path([[952,348-a],[952,361],[945,354],[952,361],[959,354]],null,'#fff8c7',4);}
}
function pointer(x,y){oval(x,y,18,18,'#fff7dbaa','#a38242');path([[x-5,y-10],[x-5,y+9],[x,y+4],[x+5,y+12],[x+10,y+9],[x+5,y+1],[x+12,y]],'#fffdf1','#657c69',2);}
return {oval,path,text,round,scene,piece,ghost,pig,wolf,gate,pointer};}
window.PigsArt={create};})();
