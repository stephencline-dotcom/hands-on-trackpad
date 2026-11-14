/* Original timing game. All obstacle geometry is shared by drawing and collision. */
(function(root){
 'use strict';
 const TAU=Math.PI*2,C={x:240,y:205},LAUNCH={x:240,y:620},SHOT_RADIUS=6,SPEED=560;
 const ring=(r,count,speed,span=.85,phase=0)=>({type:'arc',r,count,speed,span,phase,width:14});
 const dots=(r,count,speed,phase=0)=>({type:'dots',r,count,speed,phase,size:14});
 const spokes=(r,count,speed,phase=0)=>({type:'spokes',r,count,speed,phase,width:13,length:54});
 const gate=(y,speed,phase=0,length=80)=>({type:'gate',y,speed,phase,length,width:14,travel:145});
 const levels=[
  {name:'First Spark',items:[dots(104,1,.65,.7)]},
  {name:'Two Satellites',items:[dots(110,2,.72,.3)]},
  {name:'Open Circle',items:[ring(95,1,.72,1.6,.2)]},
  {name:'Little Windmill',items:[spokes(112,2,.7,.5)]},
  {name:'Around We Go',items:[ring(101,2,.76,.82,.8)]},
  {name:'Sliding Window',items:[gate(400,.9,.4,74)]},
  {name:'Triple Spark',items:[dots(108,3,.78,.2)]},
  {name:'Inner Orbit',items:[ring(81,1,-.75,1.1,.3),dots(140,1,.65,.7)]},
  {name:'Three Blades',items:[spokes(108,3,.82,.5)]},
  {name:'A Little Breather',items:[ring(110,1,.92,1.8,.8)]},
  {name:'Counter Spin',items:[ring(82,2,.8,.7,0),ring(137,1,-.64,1.1,.6)]},
  {name:'Passing Gate',items:[dots(98,2,.78,.2),gate(415,.82,1.2,68)]},
  {name:'Four Satellites',items:[dots(116,4,.82,.5)]},
  {name:'Offset Wheels',items:[spokes(92,2,-.8,.6),dots(151,2,.6,1)]},
  {name:'Golden Pause',items:[ring(95,2,.85,.9,1.2)]},
  {name:'Double Windows',items:[gate(393,.8,.1,74),gate(475,1.1,1.5,68)]},
  {name:'Ribbon Dance',items:[ring(83,3,.82,.6,.3),ring(142,1,-.7,1.25,1)]},
  {name:'Spinning Doors',items:[spokes(108,4,.75,.4)]},
  {name:'Orbit and Slide',items:[dots(100,3,-.8,.6),gate(421,.97,1,70)]},
  {name:'Clear Skies',items:[dots(93,2,1.08,.1),ring(148,1,-.78,1.15,.8)]},
  {name:'Twin Wheels',items:[ring(80,2,.95,.8,.2),ring(145,2,-.7,.65,1.1)]},
  {name:'Fast Petals',items:[spokes(108,3,1.12,1),dots(158,1,-.7,.5)]},
  {name:'Staggered Windows',items:[gate(389,1.15,.6,80),gate(478,.85,2,76)]},
  {name:'Crystal Orbit',items:[dots(83,3,.88,.2),ring(145,2,-.72,.75,1)]},
  {name:'Find Your Rhythm',items:[ring(105,3,.91,.68,.4)]},
  {name:'Moving Maze',items:[ring(83,2,1.05,.8,1),gate(420,1.05,.3,74)]},
  {name:'Three Rings',items:[ring(74,1,-1,1.15,.6),dots(119,2,.8,.5),ring(165,1,-.62,1.2,1.1)]},
  {name:'Final Windmill',items:[spokes(104,4,1.03,.2),gate(427,.9,1.3,66)]},
  {name:'Golden Galaxy',items:[ring(80,3,.94,.62,1),dots(145,3,-.72,.7)]},
  {name:'The Golden Finale',items:[ring(79,2,1.02,.75,.8),ring(143,2,-.75,.7,.3),gate(450,.9,1.8,62)]}
 ];
 // Opening levels are 70% faster; the increase reaches 150% by level 30.
 // Drawing and collision both use this same scaled motion clock.
 function obstacleSpeed(level){return 1.7+.8*Math.max(0,Math.min(29,level))/29;}
 function clampGoal(value){return Math.max(5,Math.min(50,Math.round(Number(value)||50)));}
 function create(level=0,goal=50){return {level,goal:clampGoal(goal),time:0,hits:0,misses:0,lives:3,shots:[],attempts:0,lastShot:-Infinity,outcome:'playing',events:[]};}
 function geometry(level,time){const motionTime=time*obstacleSpeed(level),out=[];for(const item of levels[level].items){
  if(item.type==='gate'){const x=C.x+Math.sin(motionTime*item.speed+item.phase)*item.travel;out.push({type:'segment',ax:x-item.length/2,ay:item.y,bx:x+item.length/2,by:item.y,width:item.width});continue;}
  for(let i=0;i<item.count;i++){const angle=item.phase+motionTime*item.speed+i*TAU/item.count;
   if(item.type==='arc')out.push({type:'arc',x:C.x,y:C.y,r:item.r,start:angle,span:item.span,width:item.width});
   else if(item.type==='dots')out.push({type:'circle',x:C.x+Math.cos(angle)*item.r,y:C.y+Math.sin(angle)*item.r,r:item.size});
   else{const a=item.r-item.length/2,b=item.r+item.length/2;out.push({type:'segment',ax:C.x+Math.cos(angle)*a,ay:C.y+Math.sin(angle)*a,bx:C.x+Math.cos(angle)*b,by:C.y+Math.sin(angle)*b,width:item.width});}
  }
 }return out;}
 function segmentDistance(x,y,a,b,c,d){const dx=c-a,dy=d-b,t=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a-dx*t,y-b-dy*t);}
 function collides(x,y,shape,r=SHOT_RADIUS){
  if(shape.type==='circle')return Math.hypot(x-shape.x,y-shape.y)<=r+shape.r;
  if(shape.type==='segment')return segmentDistance(x,y,shape.ax,shape.ay,shape.bx,shape.by)<=r+shape.width/2;
  const dx=x-shape.x,dy=y-shape.y,relative=((Math.atan2(dy,dx)-shape.start)%TAU+TAU)%TAU;
  if(relative<=shape.span)return Math.abs(Math.hypot(dx,dy)-shape.r)<=r+shape.width/2;
  const end=shape.start+shape.span;
  return Math.min(Math.hypot(x-shape.x-Math.cos(shape.start)*shape.r,y-shape.y-Math.sin(shape.start)*shape.r),Math.hypot(x-shape.x-Math.cos(end)*shape.r,y-shape.y-Math.sin(end)*shape.r))<=r+shape.width/2;
 }
 function fire(s){if(s.outcome!=='playing'||s.time-s.lastShot<.14)return false;s.shots.push({x:LAUNCH.x,y:LAUNCH.y-20});s.lastShot=s.time;s.attempts++;return true;}
 function step(s,dt){s.events=[];if(s.outcome!=='playing')return s.events;let remaining=Math.max(0,Math.min(dt,.1));while(remaining>1e-7&&s.outcome==='playing'){
  const delta=Math.min(remaining,1/240);remaining-=delta;s.time+=delta;const obstacles=geometry(s.level,s.time),keep=[];
  for(const shot of s.shots){shot.y-=SPEED*delta;
   if(obstacles.some(shape=>collides(shot.x,shot.y,shape))){s.lives--;s.misses++;s.events.push({type:'miss',x:shot.x,y:shot.y});if(s.lives===0){s.outcome='lost';break;}}
   else if(Math.hypot(shot.x-C.x,shot.y-C.y)<=35+SHOT_RADIUS){s.hits++;s.events.push({type:'hit',x:shot.x,y:shot.y});if(s.hits>=s.goal){s.outcome='won';break;}}
   else if(shot.y>0)keep.push(shot);
  }s.shots=s.outcome==='playing'?keep:[];
 }return s.events;}
 function parseProgress(raw){let obj;try{obj=typeof raw==='string'?JSON.parse(raw):raw;}catch{}const stars=Array.from({length:30},(_,i)=>Math.max(0,Math.min(3,Math.floor(Number(obj?.stars?.[i])||0))));let unlocked=1;while(unlocked<30&&stars[unlocked-1]>0)unlocked++;return {stars,unlocked};}
 function complete(progress,index,lives){const next=parseProgress(progress);if(index+1>next.unlocked)return next;next.stars[index]=Math.max(next.stars[index],Math.max(1,Math.min(3,lives)));return parseProgress(next);}
 const api={levels,C,LAUNCH,SHOT_RADIUS,SPEED,obstacleSpeed,clampGoal,create,geometry,collides,segmentDistance,fire,step,parseProgress,complete};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GoldenDotModel=api;
})(typeof window!=='undefined'?window:globalThis);
