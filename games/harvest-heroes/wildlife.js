/* Finite, friendly corn visitors. No crop loss, countdown, or real-time timers. */
(function(root){'use strict';
function create(level,random=Math.random){return {level,plans:level===1?[]:level===2?['rabbit','deer']:['rabbit','deer','rabbit'],visitors:[],cooldown:1.8,serial:0,random};}
function clearCrop(v,s){const p=s.plots.find(p=>p.id===v.plotId);if(p?.visitor===v.id)p.visitor=null;}
function shoo(w,v,s){if(!v||v.state==='leaving'||v.state==='gone')return false;clearCrop(v,s);v.state='leaving';v.waiting=false;return true;}
function hit(w,x,y){return w.visitors.slice().reverse().find(v=>{if(v.state==='leaving'||v.state==='gone'||v.waiting)return false;return Math.hypot(x-v.x,y-(v.y-(v.kind==='deer'?155:103)))<26||(Math.abs(x-v.x)<(v.kind==='deer'?67:48)&&Math.abs(y-(v.y-(v.kind==='deer'?51:22)))<(v.kind==='deer'?68:45));})||null;}
function tick(w,s,dt){dt=Math.min(.05,Math.max(0,dt));const events=[];const eligible=s.plots.filter(p=>p.crop==='corn'&&(p.state==='growing'||p.state==='ripe')&&!w.visitors.some(v=>v.plotId===p.id&&v.state!=='leaving'&&v.state!=='gone'));
 if(s.complete){w.plans=[];w.visitors.forEach(v=>shoo(w,v,s));}
 if(eligible.length&&w.plans.length&&!s.complete){w.cooldown-=dt;const active=w.visitors.filter(v=>v.state==='entering'||v.state==='nibbling').length;if(w.cooldown<=0&&active<(w.level===3?2:1)){const p=eligible[Math.floor(w.random()*eligible.length)],kind=w.plans.shift(),side=w.serial%2===0?-1:1,id='visitor-'+(++w.serial),face=-side;
 const v={id,kind,plotId:p.id,x:side<0?-95:1380,y:p.y+27,goalX:p.x-face*(kind==='deer'?53:29),side,face,state:'entering',step:0,waiting:false};w.visitors.push(v);w.cooldown=4.2+Math.max(0,w.random())*1.8;events.push(v);}}
 for(const v of w.visitors){if(v.state==='gone')continue;const p=s.plots.find(p=>p.id===v.plotId);if(!p||p.state==='harvested'||p.state==='lifted')shoo(w,v,s);if(v.waiting)continue;
  if(v.state==='entering'){const dx=v.goalX-v.x,move=Math.min(Math.abs(dx),(v.kind==='deer'?340:390)*dt);v.x+=Math.sign(dx)*move;v.step+=move/16;if(Math.abs(dx)<=Math.max(2,move)){v.x=v.goalX;v.state='nibbling';if(p)p.visitor=v.id;}}
  else if(v.state==='leaving'){const target=v.side<0?-170:1460,dx=target-v.x,move=Math.min(Math.abs(dx),(v.kind==='deer'?480:530)*dt);v.face=Math.sign(dx)||v.face;v.x+=Math.sign(dx)*move;v.step+=move/14;if(Math.abs(dx)<=Math.max(2,move))v.state='gone';}
  else v.step+=dt*2;
 }
 w.visitors=w.visitors.filter(v=>v.state!=='gone');return events;
}
const api={create,tick,hit,shoo};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HarvestWildlife=api;
})(typeof window!=='undefined'?window:globalThis);
