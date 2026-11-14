/* Hoop Hopper: original endless one-click platform timing game. */
(function(root){
 'use strict';
 const TAU=Math.PI*2,BALL=16,G=1100,HEIGHT=48,WIDTH=480;
 function rng(s){let n=s.seed;n^=n<<13;n^=n>>>17;n^=n<<5;s.seed=n>>>0;return s.seed/4294967296;}
 function point(s,i){return s.stations[i-s.base];}
 function makeStation(s,index){const previous=s.stations.at(-1),phase=['easy','medium','hard','medium','easy','hard','medium'];
  const kind=index<3?'easy':index<8?'medium':phase[index%phase.length];
  const speed=index<3?1.35+index*.1:(1.6+Math.min(.85,index*.017))*(kind==='easy'?.88:kind==='hard'?1.05:1);
  const gap=index<3?1.04-index*.035:kind==='easy'?1.08:kind==='medium'?1.0:Math.max(.86,1.02-index*.002);
  let shape='circle',windows=2,double=false,outerShape='circle';
  if(index===3){windows=3;}
  else if(index===4){shape='square';}
  else if(index===5){windows=4;}
  else if(index===6){shape='square';windows=3;}
  else if(index>=8){
   const pattern=Math.floor(rng(s)*6);
   shape=pattern===1||pattern===3?'square':'circle';
   windows=pattern===2?4:pattern===3?3:2;
   double=index>=10&&kind==='hard';
   if(kind==='easy'){shape='circle';windows=2;double=false;}
   if(double){shape=pattern%2?'square':'circle';windows=index>=18&&pattern===2?3:pattern%3===0?1:2;outerShape='circle';}
  }
  // Both platform centers line up with the one-click flight path. Smaller
  // incoming gaps remain fair without automatic sideways steering.
  const x=240,distance=242+rng(s)*22,direction=index%3===1?-1:1;
  return {index,x,y:previous?previous.y+distance:0,kind,speed,gap:Math.min(gap,windows===4?.86:windows===3?.96:gap),direction,double,shape,outerShape,windows,outerWindows:double&&index>=18&&index%2===0?3:2,pulse:index>8&&index%4===0,twin:windows===2,activeAt:index===0?0:null,baseAngle:index===0?Math.PI/2:-Math.PI/2};
 }
 function extend(s){while(s.base+s.stations.length<s.current+5)s.stations.push(makeStation(s,s.base+s.stations.length));const count=Math.max(0,s.current-s.base-2);if(count){s.stations.splice(0,count);s.base+=count;}}
 function create(seed){const s={seed:(seed===undefined?(Math.random()*4294967295)>>>0:seed>>>0)||1,base:0,current:0,stations:[],time:0,score:0,jumps:0,attempts:0,misses:0,player:{x:240,y:BALL},flight:null,outcome:'playing',events:[]};extend(s);return s;}
 function rings(station,time){const active=station.activeAt!==null,age=active?Math.max(0,time-station.activeAt):0;
  const rotation=station.speed*age+(station.pulse?.10*(1-Math.cos(age*2.1)):0),orientation=station.direction*rotation;
  const gap=active?station.gap:Math.max(station.gap,1.12);
  const result=[{x:station.x,y:station.y+BALL,r:station.double?80:94,width:12,gap,angle:station.baseAngle+orientation,orientation,shape:station.shape,windows:station.windows}];
  if(station.double)result.push({x:station.x,y:station.y+BALL,r:116,width:11,gap:active?station.gap+.05:Math.max(station.gap,1.12),angle:station.baseAngle-orientation,orientation:-orientation,shape:station.outerShape,windows:station.outerWindows||2});
  return result;
 }
 const contourCache=new Map();
 function normalize(a){return ((a%TAU)+TAU)%TAU;}
 function squarePoint(a,r,c){const x=Math.abs(Math.cos(a)),y=Math.abs(Math.sin(a)),k=r-c;let length;
  if(y*r/x<=k)length=r/x;
  else if(x*r/y<=k)length=r/y;
  else length=k*(x+y)+Math.sqrt(Math.max(0,c*c-k*k*(x-y)*(x-y)));
  return {x:Math.cos(a)*length,y:Math.sin(a)*length};
 }
 function squareContour(ring){
  const gap=Math.min(ring.gap,TAU/ring.windows-.35),localAngle=normalize(ring.angle-ring.orientation),key=[ring.r,gap.toFixed(4),ring.windows,localAngle.toFixed(4)].join(':');
  if(contourCache.has(key))return contourCache.get(key);
  const out=[],r=ring.r,c=r*.3,k=r-c,cut=Math.atan2(k,r),turn=TAU/4,period=TAU/ring.windows;
  for(let window=0;window<ring.windows;window++){
   const start=normalize(localAngle+window*period+gap/2),end=start+period-gap,ranges=end>TAU?[[start,TAU],[0,end-TAU]]:[[start,end]];
   for(let q=0;q<4;q++){
    const base=q*turn,pieces=[[base,base+cut,'line'],[base+cut,base+turn-cut,'arc'],[base+turn-cut,base+turn,'line']];
    for(const [lo,hi,type]of pieces)for(const [rangeLo,rangeHi]of ranges){
     const a=Math.max(lo,rangeLo),b=Math.min(hi,rangeHi);if(b-a<1e-7)continue;
     const first=squarePoint(a,r,c),last=squarePoint(b,r,c);
     if(type==='line')out.push({type:'line',ax:first.x,ay:first.y,bx:last.x,by:last.y,width:ring.width});
     else{const cx=k*(Math.cos(base)-Math.sin(base)),cy=k*(Math.sin(base)+Math.cos(base)),from=Math.atan2(first.y-cy,first.x-cx),to=Math.atan2(last.y-cy,last.x-cx);out.push({type:'arc',x:cx,y:cy,r:c,start:from,span:normalize(to-from),width:ring.width});}
    }
   }
  }
  if(contourCache.size>=128)contourCache.delete(contourCache.keys().next().value);contourCache.set(key,out);return out;
 }
 function arcs(ring){
  if(ring.shape!=='square'){const out=[],period=TAU/ring.windows;for(let i=0;i<ring.windows;i++)out.push({type:'arc',x:ring.x,y:ring.y,r:ring.r,width:ring.width,start:ring.angle+i*period+ring.gap/2,span:period-ring.gap});return out;}
  const cos=Math.cos(ring.orientation),sin=Math.sin(ring.orientation),rotate=(x,y)=>({x:ring.x+x*cos-y*sin,y:ring.y+x*sin+y*cos});
  return squareContour(ring).map(piece=>{
   if(piece.type==='line'){const a=rotate(piece.ax,piece.ay),b=rotate(piece.bx,piece.by);return {type:'line',ax:a.x,ay:a.y,bx:b.x,by:b.y,width:piece.width};}
   const center=rotate(piece.x,piece.y);return {...piece,x:center.x,y:center.y,start:piece.start+ring.orientation};
  });
 }
 function collides(player,arc){
  if(arc.type==='line'){const dx=arc.bx-arc.ax,dy=arc.by-arc.ay,t=Math.max(0,Math.min(1,((player.x-arc.ax)*dx+(player.y-arc.ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(player.x-arc.ax-t*dx,player.y-arc.ay-t*dy)<=BALL+arc.width/2;}
  const dx=player.x-arc.x,dy=player.y-arc.y,distance=Math.hypot(dx,dy),relative=normalize(Math.atan2(dy,dx)-arc.start);
  if(relative<=arc.span)return Math.abs(distance-arc.r)<=BALL+arc.width/2;
  const end=arc.start+arc.span;
  return Math.min(Math.hypot(dx-Math.cos(arc.start)*arc.r,dy-Math.sin(arc.start)*arc.r),Math.hypot(dx-Math.cos(end)*arc.r,dy-Math.sin(end)*arc.r))<=BALL+arc.width/2;
 }
 function jump(s){if(s.outcome!=='playing'||s.flight)return false;const a=point(s,s.current),b=point(s,s.current+1),height=b.y-a.y,v=Math.sqrt(2*G*(height+HEIGHT)),duration=(v+Math.sqrt(v*v-2*G*height))/G;
  s.flight={elapsed:0,duration,v,x0:a.x,x1:b.x,y0:a.y+BALL};s.attempts++;return true;}
 function step(s,dt){s.events=[];if(s.outcome!=='playing')return s.events;let remaining=Math.max(0,Math.min(.1,dt));while(remaining>1e-7&&s.outcome==='playing'){
  const delta=Math.min(remaining,1/240);remaining-=delta;s.time+=delta;if(!s.flight)continue;
  const f=s.flight;f.elapsed=Math.min(f.duration,f.elapsed+delta);const u=f.elapsed/f.duration,ease=u*u*(3-2*u);s.player.x=f.x0+(f.x1-f.x0)*ease;s.player.y=f.y0+f.v*f.elapsed-G*f.elapsed*f.elapsed/2;
  const current=point(s,s.current),next=point(s,s.current+1);
  if([current,next].some(station=>rings(station,s.time).some(ring=>arcs(ring).some(arc=>collides(s.player,arc))))){s.outcome='lost';s.misses++;s.events.push({type:'miss',x:s.player.x,y:s.player.y});break;}
  if(f.elapsed>=f.duration-1e-7){s.current++;s.jumps++;s.score+=20;s.player={x:next.x,y:next.y+BALL};next.activeAt=s.time;s.flight=null;extend(s);s.events.push({type:'land',x:s.player.x,y:s.player.y});}
 }return s.events;}
 function safeJump(s){if(s.outcome!=='playing'||s.flight)return false;const copy={...s,player:{...s.player},stations:s.stations.map(station=>({...station})),events:[]};jump(copy);for(let i=0;i<420&&copy.outcome==='playing'&&copy.flight;i++)step(copy,1/240);return copy.outcome==='playing'&&copy.current>s.current;}
 function continueRun(s){if(s.outcome!=='lost'||s.score<75)return false;s.score-=75;s.outcome='playing';s.flight=null;const station=point(s,s.current);station.activeAt=s.time;s.player={x:station.x,y:station.y+BALL};s.events=[];return true;}
 const api={TAU,BALL,G,HEIGHT,WIDTH,create,point,rings,arcs,collides,jump,step,safeJump,continueRun};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HoopHopperModel=api;
})(typeof window!=='undefined'?window:globalThis);
