/* Original Penguin Drop physics. All time advances come from the active game clock. */
(function(root){'use strict';const W=1100,H=760,OX=550,OY=610,ICE=6;
function create(seed=1){return {seed:seed>>>0||1,time:0,left:35,round:1,roundTime:0,spawnIn:.8,spawned:0,resolved:0,total:8,damage:0,hits:0,phase:'play',breakTime:0,intermission:0,cooldown:0,aim:-Math.PI/2,penguins:[],balls:[],fx:[],nextId:1};}
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function aim(s,x,y){const dx=x-OX,dy=Math.min(-35,y-OY);s.aim=Math.max(-2.95,Math.min(-.19,Math.atan2(dy,dx)));}
function fire(s){if(s.phase!=='play'||s.cooldown>0)return false;s.cooldown=.17;s.balls.push({x:OX+Math.cos(s.aim)*55,y:OY+Math.sin(s.aim)*55,vx:Math.cos(s.aim)*780,vy:Math.sin(s.aim)*780});return true;}
function spawn(s){const x=100+random(s)*900;const p={id:s.nextId++,x,y:-55,vx:(random(s)-.5)*(40+Math.min(100,s.round*8)),vy:65+Math.min(100,s.round*8)+random(s)*18,phase:random(s)*6.28,color:Math.floor(random(s)*5)};s.penguins.push(p);s.spawned++;return p;}
function hitSegment(ax,ay,bx,by,x,y,r){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(ax+t*dx-x,ay+t*dy-y)<=r;}
function nextRound(s,events=[]){s.round++;s.total=Math.min(32,6+s.round*2);s.spawned=0;s.resolved=0;s.spawnIn=.6;s.roundTime=0;s.phase='play';s.balls=[];s.intermission=0;return events;}
function step(s,dt){const events=[];if(!Number.isFinite(dt)||dt<=0)return events;dt=Math.min(.05,dt);s.cooldown=Math.max(0,s.cooldown-dt);for(const f of s.fx){f.age+=dt;if(f.kind==='splash')continue;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=620*dt;if(f.y>710){f.kind='splash';f.y=710;f.vx=0;f.vy=0;f.age=1.65;}}s.fx=s.fx.filter(f=>f.age<2.4);
if(s.phase==='broken'){s.breakTime+=dt;return events;}if(s.phase==='over')return events;
if(s.phase==='round'){s.intermission-=dt;if(s.intermission<=0){nextRound(s);events.push({type:'round',round:s.round});}return events;}
s.time+=dt;s.roundTime+=dt;s.left=Math.max(0,s.left-dt);if(s.left<=0){s.phase='over';events.push({type:'end',reason:'time'});return events;}
s.spawnIn-=dt;if(s.spawned<s.total&&s.spawnIn<=0){const group=s.round>=10?3:s.round>=3?2:1;for(let i=0;i<group&&s.spawned<s.total;i++)spawn(s);s.spawnIn=Math.max(.55,1.25-s.round*.055);}
for(const p of s.penguins){p.x+=p.vx*dt+Math.sin(s.time*1.8+p.phase)*Math.min(22,8+s.round)*dt;if(p.x<75||p.x>W-75){p.x=Math.max(75,Math.min(W-75,p.x));p.vx*=-1;}p.y+=p.vy*dt;}
for(const b of s.balls){const ax=b.x,ay=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;const p=s.penguins.find(p=>!p.done&&hitSegment(ax,ay,b.x,b.y,p.x,p.y,38));if(p){p.done=true;b.done=true;s.hits++;s.resolved++;s.fx.push({x:p.x,y:p.y,vx:p.x<OX?-180:180,vy:-125,age:0,color:p.color,kind:'penguin'});events.push({type:'hit',x:p.x,y:p.y});}}
s.balls=s.balls.filter(b=>!b.done&&b.y>-40&&b.x>-40&&b.x<W+40);
for(const p of s.penguins)if(!p.done&&p.y>=585){p.done=true;s.resolved++;s.damage++;s.fx.push({x:p.x,y:592,vx:p.x<OX?-300:300,vy:-155,age:0,color:p.color,kind:'land'});events.push({type:'crack',x:p.x,y:592});if(s.damage>=ICE){s.phase='broken';s.breakTime=0;events.push({type:'end',reason:'ice'});break;}}
s.penguins=s.penguins.filter(p=>!p.done);
if(s.phase==='play'&&s.resolved>=s.total){s.phase='round';s.intermission=2.8;s.left=Math.min(65,s.left+18);const repaired=s.damage>0;s.damage=Math.max(0,s.damage-1);s.balls=[];events.push({type:'bonus',seconds:18,repaired});}return events;}
root.PenguinDropCore=Object.freeze({W,H,OX,OY,ICE,create,aim,fire,step,spawn,nextRound,hitSegment});if(typeof module!=='undefined')module.exports=root.PenguinDropCore;
})(typeof window==='undefined'?globalThis:window);
