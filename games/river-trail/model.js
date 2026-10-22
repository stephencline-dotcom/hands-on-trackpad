/* River Trail Adventure: original fictional journeys inspired by CKLA K Domain 6,
   Lesson 6. Coordinates are river distance, not a map of a real place. */
(function(root){'use strict';
const VisitorSettings=root?root.RiverVisitorSettings:require('./visitor-settings.js');
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
function create(level=1,rng=Math.random,options={}){level=clamp(Math.floor(Number(level)||1),1,5);const config={...LEVELS[level-1]};const seed=rng()*6.28;
 const s={level,config,seed,time:0,mode:'river',boat:{x:600,y:150,angle:Math.PI/2,moving:false,speed:0},cargo:[],floating:null,stops:[],obstacles:[],job:null,person:{x:590,y:570,angle:0,walking:false},shore:null,cooldown:0,bump:0,complete:false,gatePassed:!config.fork,bumps:0,homeWait:0};
 const leftFirst=rng()>.5;config.stops.forEach((kinds,i)=>{const y=550+i*(config.length-1100)/Math.max(1,config.stops.length-1);const side=(i%2===0)===leftFirst?'left':'right',b=banks(s,y);s.stops.push({id:i,y,x:side==='left'?b.left+55:b.right-55,side,kinds,items:[]});});
 const needed={...config.goals};for(const stop of s.stops){for(const kind of stop.kinds){const later=s.stops.slice(stop.id+1).some(p=>p.kinds.includes(kind));const n=later?1:(needed[kind]||0);for(let i=0;i<n;i++){stop.items.push({id:stop.id+'-'+kind+'-'+i,kind,x:270+(stop.items.length%4)*215+(rng()-.5)*40,y:235+(stop.items.length%2)*110+Math.floor(stop.items.length/4)*110+(rng()-.5)*38,taken:false});needed[kind]--;}}}
 s.carried=null;s.basketCarried=false;s.visitors=[];s.visitorCount=0;s.visitorFoodCount=0;s.visitorWoodCount=0;s.visitorUsed={berry:0,nut:0,wood:0};
 s.visitorSettings=VisitorSettings.normalize(options.visitorLevels)[Math.max(0,level-3)];s.campChance=VisitorSettings.normalizeCamp(options.campChance);s.random=rng;
 s.visitorLimit=level>=3?s.visitorSettings.animals+s.visitorSettings.gatherers:0;
 s.animalClock=s.visitorSettings.animalInterval;s.gathererClock=s.visitorSettings.gathererInterval;s.nextVisitorId=0;s.refillCount=0;s.routeWrong=false;
 s.forkY=config.length-650;s.correctSide=rng()>.5?'left':'right';s.landmark=rng()>.5?'tree':'boulder';
 const safeY=y=>y>320&&y<config.length-340&&s.stops.every(p=>Math.abs(p.y-y)>150)&&(!config.fork||Math.abs(y-s.forkY)>200);
 for(let i=0;i<config.rocks;i++){let y=level===1?config.length*(.72+i*.12):350+(i+.5)*(config.length-700)/config.rocks;if(!safeY(y))continue;const b=banks(s,y);s.obstacles.push({id:'r'+i,type:'rock',x:b.mid+(level===1?(i===0?-95:100):(rng()-.5)*310),y,r:36+rng()*12});}
 for(let i=0;i<config.logs;i++){let y=740+i*(config.length-1100)/Math.max(1,config.logs);if(!safeY(y))y+=180;if(!safeY(y))continue;const b=banks(s,y);s.obstacles.push({id:'l'+i,type:'log',x:b.mid,y,base:b.mid,phase:rng()*6.28,r:44});}
 return s;}
function next(s){if(s.floating)return {type:'recover',...s.floating};const stop=s.stops.find(p=>p.items.some(i=>!i.taken));if(s.mode==='shore'){if(s.carried)return {type:'deposit',x:590,y:570,kind:s.carried.kind};if(s.basketCarried)return {type:'board',x:835,y:620};const item=s.shore.items.find(i=>!i.taken);return item?{type:'gather',...item}:{type:'basket',x:590,y:570};}if(stop)return {type:'dock',...stop};if(!s.gatePassed)return {type:'fork',x:banks(s,s.forkY).mid+(s.correctSide==='left'?-165:165),y:s.routeWrong?s.forkY-210:s.forkY};return {type:'home',x:banks(s,s.config.length-180).mid,y:s.config.length-180};}
function ready(s){return !s.floating&&Object.entries(s.config.goals).every(([k,n])=>s.cargo.filter(c=>c===k).length>=n);}
function dock(s,id){const stop=s.stops.find(p=>p.id===id);if(s.mode!=='river'||!stop||dist(s.boat,stop)>175)return {ok:false,why:'near'};s.mode='shore';s.shore=stop;s.boat.moving=false;s.boat.speed=0;s.person={x:590,y:510,angle:0,walking:false};s.job=null;s.basketCarried=false;s.visitors=[];
 if(!stop.camp){const enabled=s.level>=3&&s.campChance>0&&s.random()*100<s.campChance;stop.camp={enabled,wood:0,people:[{x:1005,y:165,busy:false},{x:1120,y:245,busy:false},{x:1070,y:85,busy:false}]};}
 for(const person of stop.camp.people)person.busy=false;
 s.animalClock=Math.max(2,s.animalClock);s.gathererClock=Math.max(2,s.gathererClock);return {ok:true};}
function board(s){if(s.mode!=='shore'||s.job||s.carried||!s.basketCarried||dist(s.person,{x:835,y:620})>135)return false;if(s.shore?.camp)for(const person of s.shore.camp.people)person.busy=false;s.mode='river';s.shore=null;s.person.walking=false;s.basketCarried=false;s.visitors=[];return true;}
function deposit(s){if(s.mode!=='shore'||s.job||!s.carried||dist(s.person,{x:590,y:570})>115)return false;s.cargo.push(s.carried.kind);s.carried=null;return true;}
function pickBasket(s){if(s.mode!=='shore'||s.job||s.carried||s.basketCarried||dist(s.person,{x:590,y:570})>125)return false;s.basketCarried=true;return true;}
function gather(s,id){if(s.mode!=='shore'||s.job||s.carried||s.basketCarried)return false;const item=s.shore.items.find(i=>i.id===id&&!i.taken);if(!item||!remaining(s,item.kind))return false;s.job={item,phase:'approach',time:0};return true;}
function recover(s){if(s.mode!=='river'||!s.floating||dist(s.boat,s.floating)>155)return false;s.cargo.push(s.floating.kind);s.floating=null;return true;}
/* Missing units get their own downstream landing. Moving the village never moves an existing fork. */
function addReplacement(s,kind){
 const outstanding=s.stops.reduce((n,p)=>n+p.items.filter(i=>!i.taken&&i.kind===kind).length,0);
 const deficit=(s.config.goals[kind]||0)-collected(s,kind)-outstanding;
 if(deficit<=0)return null;
 let y=Math.max(s.boat.y+620,(s.shore?.y||0)+620,...s.stops.map(p=>p.y+360));
 if(s.config.fork&&Math.abs(y-s.forkY)<300)y=s.forkY+330;
 const id=s.stops.length,b=banks(s,y),side=s.refillCount++%2?'left':'right';
 const stop={id,y,x:side==='left'?b.left+55:b.right-55,side,kinds:[kind],replacement:true,items:[]};
 for(let n=0;n<deficit;n++)stop.items.push({id:id+'-extra-'+kind+'-'+n,kind,x:360+(n%3)*210,y:260+(n%2)*90,taken:false});
 s.stops.push(stop);s.config.length=Math.max(s.config.length,y+800);return stop;
}
function visitorTarget(s,kind,self=null){
 const other=s.visitors.filter(v=>v!==self&&(v.phase==='approach'||v.phase==='rise'));
 const item=s.shore?.items.find(i=>!i.taken&&i.id!==s.job?.item.id&&i.kind===kind&&!other.some(v=>v.target?.source==='ground'&&v.target.id===i.id));
 if(item)return {source:'ground',kind:item.kind,id:item.id,x:item.x,y:item.y};
 // A basket being carried stays protected. One visitor can reserve each loose basket unit.
 const reserved=other.filter(v=>v.target?.source==='basket'&&v.target.kind===kind).length;
 if(!s.basketCarried&&s.cargo.filter(k=>k===kind).length>reserved)return {source:'basket',kind,x:590,y:555};
 return null;
}
function shoo(s,id){const v=id===undefined?s.visitors.find(v=>v.phase==='approach'||v.phase==='rise'):s.visitors.find(v=>v.id===id);if(!v||!['approach','rise'].includes(v.phase))return false;v.phase=v.campSeat===null?'shoo':'return';return true;}
function visitorKind(v){return v.kind==='gatherer'?'wood':v.kind==='squirrel'?'nut':'berry';}
function visitorStep(s,v,dt,events){
 v.time+=dt;
 if(v.phase==='rise'){v.riseTime+=dt;if(v.riseTime>=1)v.phase='approach';return;}
 if(v.phase==='return'){
  const seat=s.shore.camp.people[v.campSeat];
  if(moveTo(v,seat,120,dt)){seat.busy=false;if(v.carry)s.shore.camp.wood++;v.done=true;}
  return;
 }
 if(v.phase!=='approach'){moveTo(v,{x:v.exitX,y:120},170,dt);if(v.y<140||v.x<-30||v.x>1230)v.done=true;return;}
 const target=visitorTarget(s,visitorKind(v),v);
 if(!target){v.phase=v.campSeat===null?'shoo':'return';return;}
 v.target=target;
 if(moveTo(v,{x:target.x,y:target.y+25},v.kind==='gatherer'?80:95,dt)){
  let stolen=false;
  if(target.source==='basket'&&!s.basketCarried){const index=s.cargo.indexOf(target.kind);if(index>=0){s.cargo.splice(index,1);stolen=true;}}
  else if(target.source==='ground'){const item=s.shore.items.find(i=>i.id===target.id&&!i.taken&&i.id!==s.job?.item.id);if(item){item.taken=true;item.stolen=true;stolen=true;}}
  if(stolen){v.carry=target.kind;const stop=addReplacement(s,target.kind);events.push({type:'stolen',kind:target.kind,visitor:v.kind,source:target.source,stopId:stop?.id});}
  v.phase=v.campSeat===null?'escape':'return';
 }
}
function spawnVisitor(s,kind,target,events){
 const id=s.nextVisitorId++,left=id%2===0,camp=kind==='gatherer'&&s.shore.camp?.enabled?s.shore.camp:null;
 const seatIndex=camp?camp.people.findIndex(p=>!p.busy):-1,seat=seatIndex>=0?camp.people[seatIndex]:null;
 if(seat)seat.busy=true;
 s.visitors.push({id,kind,x:seat?seat.x:left?100:1100,y:seat?seat.y:165,exitX:left?-90:1290,phase:seat?'rise':'approach',campSeat:seat?seatIndex:null,riseTime:0,target,carry:null,time:0,done:false});
 s.visitorCount++;s.visitorUsed[target.kind]++;if(kind==='gatherer')s.visitorWoodCount++;else s.visitorFoodCount++;
 events.push({type:'visitor',kind,fromCamp:!!seat});
}
function visit(s,dt,events){
 if(s.mode!=='shore'||!s.visitorLimit)return;
 for(const v of s.visitors)visitorStep(s,v,dt,events);
 s.visitors=s.visitors.filter(v=>!v.done);
 const cfg=s.visitorSettings;
 s.animalClock=Math.max(0,s.animalClock-dt);s.gathererClock=Math.max(0,s.gathererClock-dt);
 const animalQuota=s.level>=4?Math.ceil(cfg.animals/2):0;
 if(s.animalClock===0&&s.visitorFoodCount<cfg.animals&&s.visitors.filter(v=>v.kind!=='gatherer').length<2){
  const keys=s.level>=4?['nut','berry']:['berry'];let target=null;
  for(const kind of keys){const allowed=kind==='nut'?animalQuota:cfg.animals-animalQuota;if(s.visitorUsed[kind]<allowed){target=visitorTarget(s,kind);if(target)break;}}
  if(target){spawnVisitor(s,target.kind==='nut'?'squirrel':'raccoon',target,events);s.animalClock=cfg.animalInterval;}
 }
 if(s.gathererClock===0&&s.visitorWoodCount<cfg.gatherers&&s.visitors.filter(v=>v.kind==='gatherer').length<2){
  const target=visitorTarget(s,'wood');if(target){spawnVisitor(s,'gatherer',target,events);s.gathererClock=cfg.gathererInterval;}
 }
}

function slideIsland(s,old,events){
 if(!s.config.fork)return;
 const b=s.boat,mid=banks(s,s.forkY).mid,dx=b.x-mid,dy=b.y-s.forkY;
 const q=Math.hypot(dx/112,dy/210);
 if(q<1){
  // Project the small attempted step onto the island edge; never switch banks or teleport upstream.
  const ox=old.x-mid,oy=old.y-s.forkY,n=q>.0001?q:Math.hypot(ox/112,oy/210)||1;
  b.x=mid+(q>.0001?dx:ox)/n*1.001;b.y=s.forkY+(q>.0001?dy:oy)/n*1.001;
  if(!s.cooldown){events.push({type:'island'});s.cooldown=3;}
 }
 if(s.routeWrong&&b.y<s.forkY-220)s.routeWrong=false;
 if(!s.gatePassed&&old.y<=s.forkY&&b.y>s.forkY){
  if((b.x<mid?'left':'right')===s.correctSide){s.gatePassed=true;s.routeWrong=false;events.push({type:'route'});}
  else if(!s.routeWrong){s.routeWrong=true;events.push({type:'wrong-route'});}
 }
}
function moveTo(p,q,speed,dt){const d=dist(p,q);if(d<2){p.x=q.x;p.y=q.y;return true;}const n=Math.min(d,speed*dt);p.x+=(q.x-p.x)/d*n;p.y+=(q.y-p.y)/d*n;p.angle=Math.atan2(q.y-p.y,q.x-p.x);return n===d;}
function tick(s,dt,input={}){dt=clamp(Number(dt)||0,0,.05);if(s.complete)return [];s.time+=dt;s.cooldown=Math.max(0,s.cooldown-dt);s.bump=Math.max(0,s.bump-dt);const events=[];
 if(s.mode==='shore'){s.person.walking=false;const j=s.job;if(j){if(j.phase==='approach'){s.person.walking=true;if(moveTo(s.person,{x:j.item.x,y:j.item.y+45},245,dt)){j.phase='pick';j.time=0;}}else if(j.phase==='pick'){j.time+=dt;if(j.time>.55){j.item.taken=true;s.carried={id:j.item.id,kind:j.item.kind};s.job=null;events.push({type:'pick',kind:j.item.kind});}}}else if(input.steer&&input.target){const target={x:clamp(input.target.x,180,1020),y:clamp(input.target.y,180,650)};s.person.walking=dist(s.person,target)>8;moveTo(s.person,target,230,dt);}visit(s,dt,events);return events;}
 const b=s.boat;b.moving=false;b.speed=0;const old={x:b.x,y:b.y};for(const o of s.obstacles)if(o.type==='log')o.x=o.base+Math.sin(s.time*.45+o.phase)*130;
 if(input.steer&&input.target){const q=input.target,ds=dist(b,q);if(ds>14){const rate=200+(s.level-1)*8;b.moving=true;b.speed=rate;moveTo(b,q,rate,dt);b.y+=dt*9;}}
 let bounds=banks(s,b.y);b.x=clamp(b.x,bounds.left+40,bounds.right-40);b.y=clamp(b.y,80,s.config.length-125);
 slideIsland(s,old,events);
 for(const o of s.obstacles){const dx=b.x-o.x,dy=b.y-o.y;const hit=o.type==='log'?Math.hypot(dx/1.5,dy):Math.hypot(dx,dy);if(hit<o.r+24){const safe=o.r+24.5,scale=safe/Math.max(.01,hit);if(hit>.01){b.x=o.x+dx*scale;b.y=o.y+dy*scale;}else{b.x=old.x;b.y=old.y;}b.x=clamp(b.x,bounds.left+40,bounds.right-40);if(!s.cooldown){s.bumps++;s.cooldown=2;s.bump=.8;events.push({type:'bump'});if(!s.floating&&s.cargo.length){s.floating={kind:s.cargo.pop(),x:b.x+65,y:b.y-45};}}}}
 if(s.floating){const f=s.floating,bb=banks(s,f.y);f.x=clamp(f.x,bb.left+55,bb.right-55);/* Tether recovery to the canoe: a basket can never drift out of reach. */if(dist(f,b)>190){const d=dist(f,b);f.x=b.x+(f.x-b.x)*185/d;f.y=b.y+(f.y-b.y)*185/d;}}
 if(b.y>=s.config.length-225){if(ready(s)&&s.gatePassed){s.complete=true;b.moving=false;b.speed=0;events.push({type:'complete'});}else if(s.homeWait<=0){s.homeWait=4;events.push({type:'missing'});}}s.homeWait=Math.max(0,s.homeWait-dt);return events;
}
const api={W,H,LEVELS,create,tick,banks,camera,screen,world,next,ready,dock,board,deposit,pickBasket,gather,recover,shoo,addReplacement,remaining,collected,dist};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.RiverModel=api;
})(typeof window==='undefined'?null:window);
