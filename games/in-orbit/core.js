/* In Orbit mechanics. Physics and moon positions share one simulation clock. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.InOrbitCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const W=1000,H=700,TAU=Math.PI*2,SHIP_R=7,SPEED=520;
function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function planet(seed,n,previous){const rng=random((seed+Math.imul(n+1,2654435761))>>>0),r=n===0?49:32+rng()*24;const x=n===0?500:Math.max(295,Math.min(705,previous.x+(rng()-.5)*300));const y=n===0?0:previous.y-(300+rng()*55);const count=n<4?0:n<8?(n%3===0?0:1):n<15?(n%4===0?2:1):1+n%3;return{id:n,x,y,r,theme:n%6,spin:(n%5===3?-1:1),decoration:rng(),moons:Array.from({length:count},(_,i)=>({r:8+rng()*4,orbit:r+47+i*28,angle:rng()*TAU,speed:(.58+rng()*.5+Math.min(n,35)*.009)*(i%2?-1:1)}))};}
function moonPosition(p,m,t){const a=m.angle+m.speed*t;return{x:p.x+Math.cos(a)*m.orbit,y:p.y+Math.sin(a)*m.orbit};}
function create(seed=1){const a=planet(seed,0),b=planet(seed,1,a);return{seed:seed>>>0,time:0,score:0,phase:'orbit',angle:-Math.PI/2-1,planets:[a,b],current:0,rocket:{x:0,y:0,vx:0,vy:0},flightTime:0,reason:'',cameraY:a.y-H*.65};}
function current(s){return s.planets.find(p=>p.id===s.current);}
function target(s){return s.planets.find(p=>p.id===s.current+1);}
function shipPosition(s){if(s.phase!=='orbit')return{x:s.rocket.x,y:s.rocket.y};const p=current(s),d=p.r+19;return{x:p.x+Math.cos(s.angle)*d,y:p.y+Math.sin(s.angle)*d};}
function launch(s){if(s.phase!=='orbit')return false;const p=shipPosition(s);s.rocket={x:p.x,y:p.y,vx:Math.cos(s.angle)*SPEED,vy:Math.sin(s.angle)*SPEED};s.phase='flight';s.flightTime=0;return true;}
function segmentCircle(x0,y0,x1,y1,cx,cy,r){const dx=x1-x0,dy=y1-y0,fx=x0-cx,fy=y0-cy,c=fx*fx+fy*fy-r*r;if(c<=0)return 0;const a=dx*dx+dy*dy;if(a<1e-12)return null;const b=2*(fx*dx+fy*dy),disc=b*b-4*a*c;if(disc<0)return null;const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null;}
function land(s,p,x,y){s.score++;s.current=p.id;s.angle=Math.atan2(y-p.y,x-p.x);s.phase='orbit';s.flightTime=0;s.planets=s.planets.filter(v=>v.id>=p.id-1);s.planets.push(planet(s.seed,p.id+1,p));}
function step(s,dt){const events=[];dt=Math.max(0,Math.min(.1,Number(dt)||0));if(s.phase==='lost')return events;const sub=Math.max(1,Math.ceil(dt/(1/120))),d=dt/sub;for(let k=0;k<sub;k++){
const t0=s.time;s.time+=d;
if(s.phase==='orbit'){const p=current(s);s.angle+=p.spin*(1.35+Math.min(s.score,40)*.027)*d;const q=shipPosition(s);s.rocket.x=q.x;s.rocket.y=q.y;}
else if(s.phase==='flight'){const q=s.rocket,x0=q.x,y0=q.y,x1=x0+q.vx*d,y1=y0+q.vy*d;let first=null;
for(const p of s.planets){for(const m of p.moons){const a=moonPosition(p,m,t0),b=moonPosition(p,m,s.time),hit=segmentCircle(x0-a.x,y0-a.y,x1-b.x,y1-b.y,0,0,m.r+SHIP_R);if(hit!==null&&(!first||hit<first.t))first={t:hit,kind:'moon'};}
const hit=segmentCircle(x0,y0,x1,y1,p.x,p.y,p.r+SHIP_R);if(hit!==null&&(!first||hit<first.t))first={t:hit,kind:p.id===s.current+1?'land':'planet',planet:p};}
if(first){q.x=x0+(x1-x0)*first.t;q.y=y0+(y1-y0)*first.t;if(first.kind==='land'){land(s,first.planet,q.x,q.y);events.push({type:'land',score:s.score,x:q.x,y:q.y});}else{s.phase='lost';s.reason=first.kind==='moon'?'moon':'planet';events.push({type:'lost',reason:s.reason,x:q.x,y:q.y});break;}}
else{q.x=x1;q.y=y1;s.flightTime+=d;if(s.flightTime>2.5||Math.abs(q.x-W/2)>W*.75||Math.abs(q.y-current(s).y)>1050){s.phase='lost';s.reason='miss';events.push({type:'lost',reason:'miss',x:q.x,y:q.y});break;}}}
const desired=current(s).y-H*.65;s.cameraY+=(desired-s.cameraY)*(1-Math.exp(-5*d));
}return events;}
function skip(s){const p=target(s);if(!p)return false;land(s,p,p.x,p.y+p.r);s.cameraY=p.y-H*.65;return true;}
return Object.freeze({W,H,TAU,SHIP_R,SPEED,random,planet,moonPosition,create,current,target,shipPosition,segmentCircle,launch,step,skip});
});
