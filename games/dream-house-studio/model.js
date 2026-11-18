(function(root){'use strict';
const catalog={
 house:['Storybook cottage','Brick townhouse','Timber cabin','Modern villa','Grand mansion','Castle keep','Seaside house','Mushroom cottage'],
 roof:['Cherry shingles','Ocean blue tiles','Slate gables','Golden thatch','Modern flat roof','Castle battlements','Candy stripes','Copper dome'],
 window:['Crossbar window','Round window','Arched window','Bay window','Heart window','Flower-box window','Stained glass','Shutters'],
 door:['Welcome door','Arched oak door','Double doors','Castle gate','Round fairy door','Modern glass door','Candy door','Garage door'],
 build:['Chimney','Clock tower','Castle turret','Balcony','Front porch','Side wing','Stone stairs','Flying flag'],
 garden:['Apple tree','Pine tree','Blossom tree','Palm tree','Flower bed','Sunflowers','Round shrub','Climbing roses'],
 yard:['Picket fence','Stone path','Garden pond','Splash fountain','Mailbox','Garden bench','Birdhouse','Swing set'],
 fun:['Friendly dog','Curious cat','Bicycle','Little car','Garden gnome','Stone dragon','Butterflies','Welcome sign'],
 extras:['String lights','Striped awning','Solar panels','Windmill','Basket of flowers','Telescope','Doormat','Rainbow arch'],
 scene:['Sunny meadow','By the sea','Mountain valley','Autumn afternoon','Snowy morning','Starry night','Sunset garden','Candy kingdom']};
const colors=['#f9c878','#ef8c95','#a7cfe4','#bdafe8','#91cbaa','#fff0c4','#df9976','#e7edf0','#698fbd','#ba7257','#77936a','#d7a843'];
const dims={window:[85,92],door:[85,120],build:[115,155],garden:[130,165],yard:[140,90],fun:[100,90],extras:[140,90]};
const special={build:[[58,112],[100,230],[106,320],[140,80],[210,125],[170,190],[140,60],[95,130]],garden:[[155,205],[130,205],[170,205],[150,220],[155,65],[115,135],[130,85],[120,170]],yard:[[200,90],[150,100],[165,85],[120,135],[85,100],[155,85],[70,150],[185,165]],fun:[[100,85],[80,90],[145,100],[155,95],[70,100],[130,125],[115,85],[145,90]],extras:[[230,75],[160,90],[150,75],[120,195],[95,100],[115,135],[120,45],[240,150]]};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const num=(n,f)=>Number.isFinite(n)?n:f;
function create(){return {version:1,house:0,roof:0,scene:0,paint:0,parts:[],serial:0};}
function size(p){return special[p.kind]?.[p.variant]||dims[p.kind]||[80,80];}
function restore(raw){const d=create();if(!raw||typeof raw!=='object')return d;for(const k of ['house','roof','scene'])d[k]=clamp(Math.floor(num(raw[k],0)),0,7);d.paint=clamp(Math.floor(num(raw.paint,0)),0,colors.length-1);for(const p of (Array.isArray(raw.parts)?raw.parts:[]).slice(0,100)){if(!dims[p?.kind])continue;d.parts.push({id:++d.serial,kind:p.kind,variant:clamp(Math.floor(num(p.variant,0)),0,7),x:clamp(num(p.x,500),-2000,3000),y:clamp(num(p.y,400),-2000,2600),scale:clamp(num(p.scale,1),.4,2),angle:clamp(num(p.angle,0),-Math.PI,Math.PI),color:clamp(Math.floor(num(p.color,0)),0,colors.length-1)});}return d;}
function add(d,kind,variant){if(!dims[kind]||d.parts.length>=100)return null;variant=clamp(Math.floor(num(variant,0)),0,7);let x=500,y=400;const n=d.parts.filter(p=>p.kind===kind).length;
if(kind==='window'){x=380+(n%3)*120;y=330+Math.floor(n/3)%2*90;}if(kind==='door'){x=500;y=421;}if(kind==='build'){x=[585,330,675,500,500,730,500,670][variant];y=[218,262,275,340,422,385,480,190][variant];}if(kind==='garden'){x=n%2?800:195;y=410;}if(['yard','fun','extras'].includes(kind)){x=300+(n%4)*140;y=515;}if(kind==='extras')y=[285,335,260,400,450,450,480,290][variant];
const p={id:++d.serial,kind,variant,x,y,scale:1,angle:0,color:d.paint};d.parts.push(p);return p;}
function hit(p,x,y){const [w,h]=size(p),c=Math.cos(-p.angle),s=Math.sin(-p.angle),dx=x-p.x,dy=y-p.y;return Math.abs((dx*c-dy*s)/p.scale)<=w/2&&Math.abs((dx*s+dy*c)/p.scale)<=h/2;}
function pick(d,x,y){return [...d.parts].reverse().find(p=>hit(p,x,y))||null;}
function move(p,x,y,b={left:0,top:0,right:1000,bottom:600}){const [w,h]=size(p),co=Math.abs(Math.cos(p.angle)),si=Math.abs(Math.sin(p.angle)),padX=Math.min((b.right-b.left)/2,(w*co+h*si)*p.scale/2),padY=Math.min((b.bottom-b.top)/2,(w*si+h*co)*p.scale/2);p.x=clamp(x,b.left+padX,b.right-padX);p.y=clamp(y,b.top+padY,b.bottom-padY);}
function history(d){const stack=[];return {push(){stack.push(JSON.stringify(d));if(stack.length>50)stack.shift();},undo(){if(!stack.length)return false;const old=restore(JSON.parse(stack.pop()));Object.assign(d,old);return true;},get length(){return stack.length;}};}
const api={catalog,colors,create,restore,size,add,hit,pick,move,history,clamp};if(typeof module!=='undefined')module.exports=api;else root.HouseModel=api;
})(typeof window==='undefined'?globalThis:window);
