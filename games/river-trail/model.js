/* River Trail Adventure: original fictional journeys inspired by CKLA K Domain 6,
   Lesson 6. Coordinates are river distance, not a map of a real place. */
(function(root){'use strict';
const W=1200,H=720,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const LEVELS=[
 {name:'First Paddle',season:'spring',length:3600,goals:{},stops:[],rocks:2,logs:0,fork:false},
 {name:'Berry Bend',season:'summer',length:2200,goals:{berry:2},stops:[['berry']],rocks:3,logs:1,fork:false},
 {name:'Winding River',season:'summer',length:2700,goals:{berry:2,wood:2},stops:[['berry'],['wood']],rocks:5,logs:2,fork:false},
 {name:'Autumn Journey',season:'autumn',length:3100,goals:{berry:2,nut:2,wood:2},stops:[['berry','nut'],['wood']],rocks:6,logs:3,fork:true},
 {name:'Find Your Way Home',season:'autumn',length:3600,goals:{berry:3,nut:3,wood:2},stops:[['berry','wood'],['nut','berry']],rocks:8,logs:4,fork:true}
];
function banks(s,y){const mid=600+Math.sin(y*.0027+s.seed)*60+Math.sin(y*.006)*18;return {left:mid-285,right:mid+285,mid};}
function collected(s,key){return s.cargo.filter(c=>c===key).length+(s.floating?.kind===key?1:0)+(s.carried?.kind===key?1:0);}
function remaining(s,key){return Math.max(0,(s.config.goals[key]||0)-collected(s,key));}
function camera(s){return clamp(s.boat.y-245,0,Math.max(0,s.config.length-H+100));}
function screen(s,p){return {x:p.x,y:H-(p.y-camera(s))};}
function world(s,p){return {x:p.x,y:camera(s)+H-p.y};}
function create(level=1,rng=Math.random){level=clamp(Math.floor(Number(level)||1),1,5);const config=LEVELS[level-1];const seed=rng()*6.28;
 const s={level,config,seed,time:0,mode:'river',boat:{x:600,y:150,angle:Math.PI/2,moving:false,speed:0},cargo:[],floating:null,stops:[],obstacles:[],job:null,person:{x:590,y:570,angle:0,walking:false},shore:null,cooldown:0,bump:0,complete:false,gatePassed:!config.fork,bumps:0,homeWait:0};
 const leftFirst=rng()>.5;config.stops.forEach((kinds,i)=>{const y=550+i*(config.length-1100)/Math.max(1,config.stops.length-1);const side=(i%2===0)===leftFirst?'left':'right',b=banks(s,y);s.stops.push({id:i,y,x:side==='left'?b.left+55:b.right-55,side,kinds,items:[]});});
 const needed={...config.goals};for(const stop of s.stops){for(const kind of stop.kinds){const later=s.stops.slice(stop.id+1).some(p=>p.kinds.includes(kind));const n=later?1:(needed[kind]||0);for(let i=0;i<n;i++){stop.items.push({id:stop.id+'-'+kind+'-'+i,kind,x:270+(stop.items.length%4)*215+(rng()-.5)*40,y:235+(stop.items.length%2)*110+Math.floor(stop.items.length/4)*110+(rng()-.5)*38,taken:false});needed[kind]--;}}}
 s.carried=null;s.basketCarried=false;
 s.forkY=config.length-650;s.correctSide=rng()>.5?'left':'right';s.landmark=rng()>.5?'tree':'boulder';
 const safeY=y=>y>320&&y<config.length-340&&s.stops.every(p=>Math.abs(p.y-y)>150)&&(!config.fork||Math.abs(y-s.forkY)>200);
 for(let i=0;i<config.rocks;i++){let y=level===1?config.length*(.72+i*.12):350+(i+.5)*(config.length-700)/config.rocks;if(!safeY(y))continue;const b=banks(s,y);s.obstacles.push({id:'r'+i,type:'rock',x:b.mid+(level===1?(i===0?-95:100):(rng()-.5)*310),y,r:36+rng()*12});}
 for(let i=0;i<config.logs;i++){let y=740+i*(config.length-1100)/Math.max(1,config.logs);if(!safeY(y))y+=180;if(!safeY(y))continue;const b=banks(s,y);s.obstacles.push({id:'l'+i,type:'log',x:b.mid,y,base:b.mid,phase:rng()*6.28,r:44});}
 return s;}
function next(s){if(s.floating)return {type:'recover',...s.floating};const stop=s.stops.find(p=>p.items.some(i=>!i.taken));if(s.mode==='shore'){if(s.carried)return {type:'deposit',x:590,y:570,kind:s.carried.kind};if(s.basketCarried)return {type:'board',x:835,y:620};const item=s.shore.items.find(i=>!i.taken);return item?{type:'gather',...item}:{type:'basket',x:590,y:570};}if(stop)return {type:'dock',...stop};if(!s.gatePassed)return {type:'fork',x:banks(s,s.forkY).mid+(s.correctSide==='left'?-165:165),y:s.forkY};return {type:'home',x:banks(s,s.config.length-180).mid,y:s.config.length-180};}
function ready(s){return !s.floating&&Object.entries(s.config.goals).every(([k,n])=>s.cargo.filter(c=>c===k).length>=n);}
function dock(s,id){const stop=s.stops.find(p=>p.id===id);if(s.mode!=='river'||!stop||dist(s.boat,stop)>175)return {ok:false,why:'near'};s.mode='shore';s.shore=stop;s.boat.moving=false;s.boat.speed=0;s.person={x:590,y:510,angle:0,walking:false};s.job=null;s.basketCarried=false;return {ok:true};}
function board(s){if(s.mode!=='shore'||s.job||s.carried||!s.basketCarried||dist(s.person,{x:835,y:620})>135)return false;s.mode='river';s.shore=null;s.person.walking=false;s.basketCarried=false;return true;}
function deposit(s){if(s.mode!=='shore'||s.job||!s.carried||dist(s.person,{x:590,y:570})>115)return false;s.cargo.push(s.carried.kind);s.carried=null;return true;}
function pickBasket(s){if(s.mode!=='shore'||s.job||s.carried||s.basketCarried||dist(s.person,{x:590,y:570})>125)return false;s.basketCarried=true;return true;}
function gather(s,id){if(s.mode!=='shore'||s.job||s.carried||s.basketCarried)return false;const item=s.shore.items.find(i=>i.id===id&&!i.taken);if(!item||!remaining(s,item.kind))return false;s.job={item,phase:'approach',time:0};return true;}
function recover(s){if(s.mode!=='river'||!s.floating||dist(s.boat,s.floating)>155)return false;s.cargo.push(s.floating.kind);s.floating=null;return true;}
function moveTo(p,q,speed,dt){const d=dist(p,q);if(d<2){p.x=q.x;p.y=q.y;return true;}const n=Math.min(d,speed*dt);p.x+=(q.x-p.x)/d*n;p.y+=(q.y-p.y)/d*n;p.angle=Math.atan2(q.y-p.y,q.x-p.x);return n===d;}
function tick(s,dt,input={}){dt=clamp(Number(dt)||0,0,.05);if(s.complete)return [];s.time+=dt;s.cooldown=Math.max(0,s.cooldown-dt);s.bump=Math.max(0,s.bump-dt);const events=[];
 if(s.mode==='shore'){s.person.walking=false;const j=s.job;if(j){if(j.phase==='approach'){s.person.walking=true;if(moveTo(s.person,{x:j.item.x,y:j.item.y+45},245,dt)){j.phase='pick';j.time=0;}}else if(j.phase==='pick'){j.time+=dt;if(j.time>.55){j.item.taken=true;s.carried={id:j.item.id,kind:j.item.kind};s.job=null;events.push({type:'pick',kind:j.item.kind});}}}else if(input.steer&&input.target){const target={x:clamp(input.target.x,180,1020),y:clamp(input.target.y,180,650)};s.person.walking=dist(s.person,target)>8;moveTo(s.person,target,230,dt);}return events;}
 const b=s.boat;b.moving=false;b.speed=0;const old={x:b.x,y:b.y};for(const o of s.obstacles)if(o.type==='log')o.x=o.base+Math.sin(s.time*.45+o.phase)*130;
 if(input.steer&&input.target){const q=input.target,ds=dist(b,q);if(ds>14){const rate=200+(s.level-1)*8;b.moving=true;b.speed=rate;moveTo(b,q,rate,dt);b.y+=dt*9;}}
 let bounds=banks(s,b.y);b.x=clamp(b.x,bounds.left+40,bounds.right-40);b.y=clamp(b.y,80,s.config.length-125);
 if(s.config.fork){const mid=banks(s,s.forkY).mid;if(Math.abs(b.y-s.forkY)<145&&Math.abs(b.x-mid)<72){b.x=mid+(b.x<mid?-100:100);if(s.cooldown===0){events.push({type:'island'});s.cooldown=.7;}}if(old.y<s.forkY+60&&b.y>=s.forkY+60&&!s.gatePassed){if((b.x<mid?'left':'right')===s.correctSide){s.gatePassed=true;events.push({type:'route'});}else{b.y=s.forkY-175;b.x=mid+(s.correctSide==='left'?-145:145);events.push({type:'wrong-route'});s.cooldown=1;s.bump=.7;}}}
 for(const o of s.obstacles){const dx=b.x-o.x,dy=b.y-o.y;const hit=o.type==='log'?Math.hypot(dx/1.5,dy):Math.hypot(dx,dy);if(hit<o.r+24){const d=Math.hypot(dx,dy)||1;b.x=o.x+dx/d*(o.r+48);b.y=o.y+dy/d*(o.r+48);b.x=clamp(b.x,bounds.left+40,bounds.right-40);if(!s.cooldown){s.bumps++;s.cooldown=2;s.bump=.8;events.push({type:'bump'});if(!s.floating&&s.cargo.length){s.floating={kind:s.cargo.pop(),x:b.x+65,y:b.y-45};}}}}
 if(s.floating){const f=s.floating,bb=banks(s,f.y);f.x=clamp(f.x,bb.left+55,bb.right-55);/* Tether recovery to the canoe: a basket can never drift out of reach. */if(dist(f,b)>190){const d=dist(f,b);f.x=b.x+(f.x-b.x)*185/d;f.y=b.y+(f.y-b.y)*185/d;}}
 if(b.y>=s.config.length-225){if(ready(s)&&s.gatePassed){s.complete=true;b.moving=false;b.speed=0;events.push({type:'complete'});}else if(s.homeWait<=0){s.homeWait=4;events.push({type:'missing'});}}s.homeWait=Math.max(0,s.homeWait-dt);return events;
}
const api={W,H,LEVELS,create,tick,banks,camera,screen,world,next,ready,dock,board,deposit,pickBasket,gather,recover,remaining,collected,dist};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.RiverModel=api;
})(typeof window==='undefined'?null:window);
