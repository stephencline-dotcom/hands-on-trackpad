/* Harvest Heroes: deterministic rules; rendering and input never change these directly. */
(function(root){'use strict';
const WIDTH=1280,HEIGHT=760,GROW_SECONDS=3.2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function create(level=1,random=Math.random){
 level=clamp(Math.round(level)||1,1,3);const types=level===1?['carrot']:level===2?['corn','corn']:random()<.5?['carrot','corn']:['corn','carrot'];
 const shift=Math.round(random()*24-12),rows=types.map((crop,i)=>({id:i,crop,y:level===1?460:395+i*166,x:210+shift,width:580,furrows:Array(16).fill(level===1),plowed:level===1}));
 const count=level===3?4:3;if(level===3)rows.forEach(r=>r.width=620);
 const plots=rows.flatMap(row=>Array.from({length:count},(_,i)=>({id:row.id*count+i,row:row.id,crop:row.crop,x:row.x+(count===4?80+i*155:110+i*180),y:row.y,state:row.plowed?'hole':'rough',growth:0,pop:0,growTime:level===1?GROW_SECONDS:level===2?4.5+random()*2.5:5.5+random()*2.5,dry:false,pest:false,pestAge:0,pestExit:null,dryTriggered:false,pestTriggered:false,dryAt:0,pestAt:0})));
 // A finite set of care problems: no repeating attacks and no crop losses.
 const shuffled=[...plots];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 if(level>=2)shuffled.slice(0,level===2?2:3).forEach(p=>p.dryAt=.4+random()*.16);
 if(level===3)shuffled.slice(2,5).forEach(p=>p.pestAt=.28+random()*.23);
 return {level,rows,plots,collected:[],elapsed:0,complete:false};
}
function plow(s,rowId,from,to){const row=s.rows[rowId];if(!row||row.plowed)return false;const left=Math.max(row.x,Math.min(from,to)),right=Math.min(row.x+row.width,Math.max(from,to));if(right<left)return false;let changed=false;
 row.furrows.forEach((done,i)=>{const x=row.x+(i+.5)*row.width/16;if(!done&&x>=left-15&&x<=right+15){row.furrows[i]=true;changed=true;}});
 if(row.furrows.every(Boolean)){row.plowed=true;s.plots.filter(p=>p.row===rowId).forEach(p=>p.state='hole');}return changed;
}
function act(s,id,tool){const p=s.plots.find(p=>p.id===id);if(!p)return {ok:false,why:'field'};
 if(p.state==='hole'&&(tool==='carrot'||tool==='corn')){if(tool!==p.crop)return {ok:false,why:'crop'};p.state='seeded';return {ok:true,effect:'seed'};}
 if(p.state==='seeded'&&tool==='cover'){p.state='covered';return {ok:true,effect:'soil'};}
 if(p.pest&&tool==='hand'){p.pestExit={...pestPosition(p),age:0};p.pest=false;return {ok:true,effect:'pest'};}
 if(p.dry&&tool==='water'){p.dry=false;return {ok:true,effect:'water'};}
 if(p.state==='covered'&&tool==='water'){p.state='growing';p.growth=0;return {ok:true,effect:'water'};}
 return {ok:false,why:p.state};
}
function tick(s,dt){dt=clamp(dt,0,.05);s.elapsed+=dt;const ripe=[];s.plots.forEach(p=>{p.pop=Math.max(0,p.pop-dt);if(p.pest)p.pestAge+=dt;if(p.pestExit){p.pestExit.age+=dt;if(p.pestExit.age>=.75)p.pestExit=null;}if(p.state==='growing'){if(p.dry||p.pest||p.visitor)return;p.growth=clamp(p.growth+dt/p.growTime,0,1);
 if(p.pestAt&&!p.pestTriggered&&p.growth>=p.pestAt){p.pest=true;p.pestAge=0;p.pestTriggered=true;ripe.push(p);}
 if(p.dryAt&&!p.dryTriggered&&p.growth>=p.dryAt){p.dry=true;p.dryTriggered=true;ripe.push(p);}
 if(!p.dry&&!p.pest&&p.growth>=1){p.state='ripe';p.pop=.6;ripe.push(p);}}});return ripe;}
function lift(s,id,dx,dy){const p=s.plots.find(p=>p.id===id);if(!p||p.state!=='ripe'||p.visitor)return false;if(p.crop==='carrot'?dy>-32:Math.abs(dx)<32)return false;p.state='lifted';return true;}
function restore(s,id){const p=s.plots.find(p=>p.id===id);if(p?.state==='lifted')p.state='ripe';}
function collect(s,id){const p=s.plots.find(p=>p.id===id);if(!p||p.state!=='lifted')return false;p.state='harvested';s.collected.push(p.crop);s.complete=s.collected.length===s.plots.length;return true;}
function next(s){const visitor=s.plots.find(p=>p.visitor);if(visitor)return {plot:visitor,tool:'bell',state:'visitor'};const pest=s.plots.find(p=>p.pest),dry=s.plots.find(p=>p.dry);if(pest)return {plot:pest,tool:'hand',state:'pest'};if(dry)return {plot:dry,tool:'water',state:'dry'};for(const state of ['rough','hole','seeded','covered','ripe','growing']){const p=s.plots.find(p=>p.state===state);if(p)return {plot:p,tool:state==='rough'?'tractor':state==='hole'?p.crop:state==='seeded'?'cover':state==='covered'?'water':'hand',state};}return null;}
function at(s,x,y){return s.plots.filter(p=>p.state!=='rough'&&p.state!=='harvested'&&p.state!=='lifted').find(p=>Math.abs(x-p.x)<76&&y>p.y-(p.crop==='corn'&&p.state==='ripe'?135:80)&&y<p.y+49)||null;}
function pestPosition(p){const age=p.pestAge||0;if(age<.65){const k=clamp(age/.65,0,1);return {x:p.x-26,y:p.y+24-32*k,angle:-1.2,emerge:k};}
 const k=clamp((age-.65)/1.9,0,1),height=p.crop==='corn'?(.2+p.growth*.8)*130*.62:(.18+p.growth*.92)*55*.75;
 return {x:p.x-26+Math.sin(k*Math.PI)*14+6*k+(k===1?Math.sin(age*2)*2:0),y:(p.y-8)*(1-k)+(p.y-height)*k,angle:-1.2*(1-k)-.12*k,emerge:1};}
function pestAt(s,x,y){return s.plots.find(p=>{const b=pestPosition(p);return p.pest&&Math.hypot(x-b.x,y-b.y)<32;})||null;}
function inWagon(x,y){return x>910&&x<1240&&y>350&&y<655;}
const api={WIDTH,HEIGHT,GROW_SECONDS,clamp,create,plow,act,tick,lift,restore,collect,next,at,pestPosition,pestAt,inWagon};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HarvestModel=api;
})(typeof window!=='undefined'?window:globalThis);
