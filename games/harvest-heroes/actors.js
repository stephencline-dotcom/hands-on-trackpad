/* Farmer locomotion, visible jobs, and tractor boarding. All time is active game time. */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function create(){return {x:1110,y:405,face:-1,step:0,walking:false,mode:'foot',phase:0,parkingRoute:[],wantsDrive:false,rig:{x:98,y:601,face:1,wheels:0},route:[],jobs:[],carry:null,job:null};}
function enqueue(a,job){a.jobs.push({...job,elapsed:0,committed:false,duration:job.duration||.7});}
function reserved(a,id){return a.jobs.some(j=>j.id===id);}
function cancel(a,id){a.jobs=a.jobs.filter(j=>j.id!==id);if(a.job?.id===id)a.job=null;if(a.carry?.id===id)a.carry=null;}
function requestDrive(a,enabled){a.wantsDrive=enabled;if(!enabled)a.route=[];}
function waypoint(a,p){const last=a.route.at(-1);if(!last||Math.hypot(last.x-p.x,last.y-p.y)>14){a.route.push({x:clamp(p.x,28,1252),y:clamp(p.y,350,645)});if(a.route.length>320)a.route.splice(1,1);}}
function walk(a,x,y,dt){const dx=x-a.x,dy=y-a.y,d=Math.hypot(dx,dy),move=Math.min(d,650*dt);a.walking=d>4;if(Math.abs(dx)>3)a.face=dx>0?1:-1;if(d>0){a.x+=dx/d*move;a.y+=dy/d*move;a.step+=move/13;}return d<=Math.max(4,move);}
function tick(a,dt,input,onDrive){dt=clamp(dt,0,.05);a.walking=false;
 if(a.mode==='foot'){
  if(a.wantsDrive){a.mode='approach';a.job=null;}
  else if(a.jobs.length){const job=a.jobs[0];a.job=job;if(walk(a,job.x,job.y,dt)){a.face=1;job.elapsed+=dt;if(!job.committed&&job.elapsed>=job.duration*.55){job.committed=true;job.commit?.(a);}if(job.elapsed>=job.duration){a.jobs.shift();a.job=null;}}return;}
  else{a.job=null;if(input.inside)walk(a,clamp(input.pointer.x-53,55,1220),clamp(input.pointer.y+35,365,643),dt);return;}
 }
 if(a.mode==='approach'){
  if(!a.wantsDrive){a.mode='foot';return;}
  const door={x:a.rig.x+20*a.rig.face,y:a.rig.y+28};if(walk(a,door.x,door.y,dt)){a.mode='climb';a.phase=0;}return;
 }
 if(a.mode==='climb'){
  if(!a.wantsDrive){a.mode='exit';a.phase=1-a.phase;return;}
  a.phase=Math.min(1,a.phase+dt/.6);if(a.phase>=1){a.mode='drive';a.job=null;}return;
 }
 if(a.mode==='drive'){
  if(!a.wantsDrive){a.mode='park';a.parkingRoute=[{x:900,y:a.rig.y},{x:900,y:625},{x:95,y:625}];if(Math.hypot(a.rig.x-95,a.rig.y-625)<35)a.parkingRoute=[];return;}
  const destination=a.route[0]||(!input.drag&&input.inside?input.pointer:null);if(!destination)return;
  const tx=clamp(destination.x,28,1252),ty=clamp(destination.y,350,645),dx=tx-a.rig.x,dy=ty-a.rig.y,d=Math.hypot(dx,dy),move=Math.min(d,720*dt),from={x:a.rig.x,y:a.rig.y};
  if(d>1){if(Math.abs(dx)>1.5)a.rig.face=dx>0?1:-1;a.rig.x+=dx/d*move;a.rig.y+=dy/d*move;a.rig.wheels+=move/27;onDrive?.(from,{x:a.rig.x,y:a.rig.y});}
  if(a.route.length&&d<=Math.max(3,move))a.route.shift();return;
 }
 if(a.mode==='park'){
  if(a.wantsDrive){a.mode='drive';a.parkingRoute=[];return;}
  const target=a.parkingRoute[0];if(!target){a.mode='exit';a.phase=0;return;}
  const dx=target.x-a.rig.x,dy=target.y-a.rig.y,d=Math.hypot(dx,dy),move=Math.min(d,780*dt);if(d>0){if(Math.abs(dx)>1.5)a.rig.face=dx>0?1:-1;a.rig.x+=dx/d*move;a.rig.y+=dy/d*move;a.rig.wheels+=move/27;}
  if(d<=Math.max(3,move))a.parkingRoute.shift();return;
 }
 if(a.mode==='exit'){
  a.phase=Math.min(1,a.phase+dt/.55);if(a.phase>=1){a.x=clamp(a.rig.x+40*a.rig.face,55,1220);a.y=clamp(a.rig.y+36,365,643);a.face=a.rig.face;a.mode='foot';a.phase=0;}
 }
}
const api={create,enqueue,reserved,cancel,requestDrive,waypoint,tick};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HarvestActors=api;
})(typeof window!=='undefined'?window:globalThis);
