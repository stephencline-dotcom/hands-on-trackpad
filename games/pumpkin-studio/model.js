/* Original pumpkin studio design rules, undo and bounded editing. */
(function(root){'use strict';
const groups={pumpkin:6,eyes:8,nose:6,mouth:8,glasses:6,hat:6,sticker:7,scene:3};
const colors=['#ee8829','#e5cf98','#88a169','#e6a2aa','#9c85b7','#efb54b'];
const names={pumpkin:['Harvest orange','Moonlight cream','Sage green','Rose pink','Plum purple','Golden yellow'],eyes:['Triangle eyes','Round eyes','Happy eyes','Star eyes','Sleepy eyes','Silly eyes','Heart eyes','Square eyes'],nose:['Triangle nose','Round nose','Tiny nose','Heart nose','Diamond nose','Button nose'],mouth:['Big smile','Toothy grin','Surprised mouth','Silly zigzag','Little smile','Spooky grin','Happy teeth','Wiggly smile'],glasses:['Round glasses','Square glasses','Star glasses','Heart glasses','Sun glasses','Half moon glasses'],hat:['Witch hat','Party hat','Autumn crown','Cozy cap','Top hat','Sunflower crown'],sticker:['Leaf','Star','Little bat','Flower','Bow','Sparkles','Cheek dots'],scene:['Pumpkin patch','Cozy porch','Moonlit garden']};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function blank(){return {color:0,shape:0,scene:0,glow:false,parts:[],serial:0};}
function copy(d){return JSON.parse(JSON.stringify(d));}
function restore(raw){const d=blank();if(!raw||typeof raw!=='object')return d;for(const [k,max]of [['color',5],['shape',3],['scene',2]])if(Number.isInteger(raw[k]))d[k]=clamp(raw[k],0,max);d.glow=raw.glow===true;
if(Array.isArray(raw.parts))for(const p of raw.parts.slice(0,24)){if(!p||!['eyes','nose','mouth','glasses','hat','sticker'].includes(p.kind)||!Number.isInteger(p.style)||p.style<0||p.style>=groups[p.kind])continue;const id=++d.serial;d.parts.push({id,kind:p.kind,style:p.style,x:Number.isFinite(p.x)?clamp(p.x,85,915):500,y:Number.isFinite(p.y)?clamp(p.y,75,525):335,scale:Number.isFinite(p.scale)?clamp(p.scale,.55,1.5):1,angle:Number.isFinite(p.angle)?clamp(p.angle,-Math.PI,Math.PI):0});}return d;}
function add(d,kind,style){if(!['eyes','nose','mouth','glasses','hat','sticker'].includes(kind)||!Number.isInteger(style)||style<0||style>=groups[kind])return null;if(kind!=='sticker')d.parts=d.parts.filter(p=>p.kind!==kind);if(d.parts.length>=24)return null;const count=d.parts.filter(p=>p.kind==='sticker').length;const p={id:++d.serial,kind,style,x:kind==='sticker'?690+(count%2)*37:500,y:({eyes:300,nose:360,mouth:415,glasses:300,hat:170})[kind]??(370+(count%3)*52),scale:1,angle:0};if(kind==='sticker'&&style===4){p.x=500;p.y=479;}if(kind==='sticker'&&style===6){p.x=500;p.y=357;}d.parts.push(p);return p;}
function dims(p){return p.kind==='eyes'?[210,70]:p.kind==='mouth'?[180,90]:p.kind==='glasses'?[240,86]:p.kind==='hat'?[230,145]:p.kind==='nose'?[65,65]:[85,85];}
function hit(p,x,y){const a=-p.angle,dx=x-p.x,dy=y-p.y,xx=dx*Math.cos(a)-dy*Math.sin(a),yy=dx*Math.sin(a)+dy*Math.cos(a),[w,h]=dims(p);return Math.abs(xx)<w*p.scale/2+9&&Math.abs(yy)<h*p.scale/2+9;}
function pick(d,x,y){return d.parts.slice().reverse().find(p=>hit(p,x,y))||null;}
function move(p,x,y){p.x=clamp(x,85,915);p.y=clamp(y,75,525);}
function history(d){let past=[],future=[];return {save(before=d){past.push(copy(before));if(past.length>40)past.shift();future=[];},undo(){if(!past.length)return false;future.push(copy(d));const p=past.pop();Object.keys(d).forEach(k=>delete d[k]);Object.assign(d,p);return true;},canUndo:()=>past.length>0};}
const api={groups,colors,names,clamp,blank,copy,restore,add,dims,hit,pick,move,history};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PumpkinModel=api;
})(typeof window!=='undefined'?window:globalThis);
