(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),TAU=Math.PI*2,N=30,KEY='balloon-maze-progress-v1',C=360;
const frozen=()=>document.body.classList.contains('student-screen-frozen')||$('studentFreezeOverlay')?.hidden===false;
let progress={times:Array(N).fill(null)};try{const p=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(p?.times))progress.times=Array.from({length:N},(_,i)=>Number.isFinite(p.times[i])&&p.times[i]>0?p.times[i]:null)}catch{}
let level=0,mode='levels',preview=false,angle=0,ball,balloons=[],vertices=[],barriers=[],paint=[],sparks=[],elapsed=0,last=0,drag=null,sound=true,globalSound=true,audio=null,primary=null,secondary=null,demoTime=0,previousFrozen=false;
const palettes=['#f8d84d','#ff5c75','#e84aa9','#8ce259','#60d7e6','#a18cff','#ff9e54'];
const completed=()=>progress.times.filter(x=>x!==null).length;
const unlocked=()=>Math.min(N,Math.max(0,...progress.times.map((v,i)=>v!==null?i+1:0))+1);
function randGen(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function tone(f=500){if(!sound||!globalSound||frozen()||document.hidden)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type='triangle';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.65,t+.11);g.gain.setValueAtTime(.065,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.15);}catch{}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch{}}
const BALLOON_LEVEL_DESIGNS=[{"name":"Open Playground","shape":[[-281.77,-174.59],[281.77,-174.59],[281.77,174.59],[-281.77,174.59]],"walls":[]},{"name":"One Shelf","shape":[[-221.0,-243.1],[221.0,-243.1],[221.0,243.1],[-221.0,243.1]],"walls":[[-160,0,105,0]]},{"name":"Side Door","shape":[[-259.68,-215.47],[259.68,-215.47],[259.68,215.47],[-259.68,215.47]],"walls":[[-70,-160,-70,105]]},{"name":"Four-Way Cross","shape":[[-259.68,-221.0],[259.68,-221.0],[259.68,221.0],[-259.68,221.0]],"walls":[[-175,-55,-35,-55],[35,-55,175,-55],[0,-155,0,-90],[0,-20,0,140]]},{"name":"Opposite Gates","shape":[[-254.15,-221.0],[254.15,-221.0],[254.15,221.0],[-254.15,221.0]],"walls":[[-180,-85,90,-85],[-90,85,180,85]]},{"name":"Switchback","shape":[[-248.62,-237.57],[248.62,-237.57],[248.62,237.57],[-248.62,237.57]],"walls":[[-105,-155,-105,45],[-105,45,85,45],[85,-45,85,160]]},{"name":"Angled Canyon","shape":[[-270.73,-149.18],[-149.18,-237.57],[149.18,-237.57],[270.73,-149.18],[270.73,149.18],[149.18,237.57],[-149.18,237.57],[-270.73,149.18]],"walls":[[-165,-105,-30,35],[30,-35,165,105]]},{"name":"Three Chambers","shape":[[-259.68,-226.53],[259.68,-226.53],[259.68,226.53],[-259.68,226.53]],"walls":[[-175,-100,65,-100],[-65,75,175,75],[-20,-100,-20,-155]]},{"name":"Pinwheel","shape":[[-243.1,-237.57],[243.1,-237.57],[243.1,237.57],[-243.1,237.57]],"walls":[[0,-165,0,-45],[45,0,165,0],[0,45,0,165],[-165,0,-45,0]]},{"name":"Winding Stair","shape":[[-259.68,-215.47],[259.68,-215.47],[259.68,215.47],[-259.68,215.47]],"walls":[[-170,-110,65,-110],[-65,-10,170,-10],[-170,90,65,90]]},{"name":"Hook Corridor","shape":[[59.05,-291.32],[295.31,-33.86],[123.46,270.39],[-219.01,200.98],[-258.81,-146.19]],"walls":[[-145,-140,-145,85],[-145,85,60,85],[60,-85,60,145],[-29.76,126.84,-74.8,145.5],[-74.8,145.5,-97.7,90.1]]},{"name":"Twin Towers","shape":[[89.15,-288.2],[294.15,-66.9],[205.01,221.3],[-89.15,288.2],[-294.15,66.9],[-205.01,-221.3]],"walls":[[-165,-95,-45,-95],[45,-95,165,-95],[-45,-95,-45,100],[45,-95,45,100],[62.1,41.3,83.1,90.0],[83.1,90.0,132.3,70.3]]},{"name":"Diamond Crossing","shape":[[0.0,-292.82],[228.94,-182.57],[285.49,65.16],[127.05,263.83],[-127.05,263.83],[-285.49,65.16],[-228.94,-182.57]],"walls":[[-150,-135,15,15],[15,15,155,-135],[-150,135,15,-15],[15,-15,155,135],[12.5,39.4,54.1,56.7],[54.1,56.7,38.0,95.5]]},{"name":"Four Corners","shape":[[29.68,-295.76],[230.12,-188.15],[295.76,29.68],[188.15,230.12],[-29.68,295.76],[-230.12,188.15],[-295.76,-29.68],[-188.15,-230.12]],"walls":[[-175,0,-65,0],[65,0,175,0],[0,-170,0,-55],[0,55,0,170],[86.9,29.0,146.9,99.0],[52.2,41.3,80.8,129.0]]},{"name":"Bent Passage","shape":[[59.94,-295.65],[235.95,-187.96],[301.57,7.68],[226.07,199.73],[44.8,298.32],[-157.44,257.32],[-286.01,95.93],[-280.76,-110.36],[-144.14,-265.0]],"walls":[[-170,-125,100,-125],[100,-125,100,-45],[-100,45,170,45],[-100,45,-100,135],[-109.9,-109.2,-83.1,-44.6],[-169.1,-84.7,-142.3,-20.1]]},{"name":"Split Hall","shape":[[86.53,-279.74],[234.44,-175.45],[292.79,-4.14],[239.31,168.74],[94.42,277.19],[-86.53,279.74],[-234.44,175.45],[-292.79,4.14],[-239.31,-168.74],[-94.42,-277.19]],"walls":[[-175,-100,-35,-100],[-35,-100,-35,45],[35,-45,35,100],[35,100,175,100],[135.1,-45.2,84.8,-28.2],[80.9,-18.9,104.5,28.7],[153.9,-91.9,106.2,-115.5],[97.0,-111.6,80.0,-61.3]]},{"name":"Five Shelves","shape":[[0.0,-297.25],[257.42,-148.62],[257.42,148.62],[0.0,297.25],[-257.42,148.62],[-257.42,-148.62]],"walls":[[-175,-145,125,-145],[-125,-55,175,-55],[-175,55,125,55],[-125,145,175,145]]},{"name":"Turnaround","shape":[[30.11,-300.16],[294.77,-64.11],[152.06,260.54],[-200.79,225.13],[-276.16,-121.4]],"walls":[[-145.0,-147.1,-145,55],[-145,55,35,55],[35,-55,145,-55],[145,-55,145,155],[95.2,55.1,37.9,78.8],[37.9,78.8,61.7,136.1],[103.84,-14.93,75.3,-43.4],[75.3,-43.4,31.5,0.4]]},{"name":"Chevron Canyon","shape":[[58.18,-286.99],[244.07,-161.79],[286.99,58.18],[161.79,244.07],[-58.18,286.99],[-244.07,161.79],[-286.99,-58.18],[-161.79,-244.07]],"walls":[[-160,-135,-30,-20],[-30,-20,105,-135],[-105,135,30,20],[30,20,160,135],[-50.0,51.0,-135.4,53.9],[95.51,36.0,115.7,80.5],[40.1,-58.3,43.0,27.1]]},{"name":"Long Snake","shape":[[87.84,-283.97],[276.78,-108.38],[257.3,148.83],[44.07,293.96],[-202.35,217.73],[-296.39,-22.45],[-167.25,-245.73]],"walls":[[-175,-115,80,-115],[80,-115,80,-85],[-80,-35,175,-35],[-80,-35,-80,55],[-175,55,80,55],[164.5,-139.6,73.0,-101.7],[99.8,-166.4,122,-125],[-58.8,-68.3,-137.8,-68.3],[-108.3,-97.8,-108.3,-18.8]]},{"name":"Stepped Rooms","shape":[[0.0,-301.67],[177.32,-244.05],[286.9,-93.22],[286.9,93.22],[177.32,244.05],[0.0,301.67],[-177.32,244.05],[-286.9,93.22],[-286.9,-93.22],[-177.32,-244.05]],"walls":[[-145,-160,-145,-40],[-145,-40,-35,-40],[35,-160,35,30],[35,30,145,30],[-145,115,45,115],[-85.5,-15.6,-113.8,12.6],[-142.1,-1.5,-170.4,26.8],[94.4,-57.2,131.4,-41.9],[129.1,-10.3,166.1,5.0]]},{"name":"Alternating Gates","shape":[[29.24,-291.37],[209.67,-204.4],[292.01,-21.8],[237.71,171.0],[72.18,283.79],[-127.12,263.8],[-266.95,120.37],[-281.86,-79.38],[-164.89,-241.98]],"walls":[[-175,-125,100,-125],[-100,-45,175,-45],[-175,45,100,45],[-100,125,175,125],[0,-45,0,45],[-33.57,89.76,-78.8,60.9],[-78.8,60.9,-92.0,120.4],[138.0,-94.0,77.9,-104.6],[77.9,-104.6,88.5,-44.5]]},{"name":"Double V","shape":[[59.05,-291.32],[295.31,-33.86],[123.46,270.39],[-219.01,200.98],[-258.81,-146.19]],"walls":[[-145,-145,0,-30],[0,-30,127.6,-131.2],[-145,145,-31.9,55.3],[0,30,145,145],[0,-30,0,30],[125.1,-10.7,92.3,40.8],[92.3,40.8,151.9,54.0],[28.1,75.7,-32.0,65.1],[-32.0,65.1,-21.4,125.2]]},{"name":"U-Turn","shape":[[89.15,-288.2],[280.9,-109.98],[261.13,151.04],[44.72,298.33],[-205.36,220.97],[-300.8,-22.79],[-169.74,-249.39]],"walls":[[-175,-145,-45,-145],[-45,-145,-45,-25],[45,-25,175,-25],[-175,65,-45,65],[-45,65,-45,150],[18.7,2.6,-11.8,15.2],[-33.9,24.4,-64.4,37.0],[-171.1,-91.7,-140.6,-79.1],[-118.4,-69.9,-87.9,-57.3]]},{"name":"Long Loop","shape":[[0.0,-292.82],[207.05,-207.05],[292.82,0.0],[207.05,207.05],[0.0,292.82],[-207.05,207.05],[-292.82,0.0],[-207.05,-207.05]],"walls":[[-160,-135,120,-135],[120,-135,120,-55],[-120,-55,70,-55],[70,-55,70,45],[-170,45,-46.5,45.0],[20,45,20,135],[7.7,35.5,-31.2,-3.4],[-31.2,-3.4,-70.1,35.5],[-82.9,77.9,-133.7,99.0],[-133.7,99.0,-112.7,149.8]]},{"name":"Branching Rooms","shape":[[29.68,-295.76],[270.97,-122.18],[241.3,173.58],[-29.68,295.76],[-270.97,122.18],[-241.3,-173.58]],"walls":[[-170,-135,-40,-135],[-40.0,-96.5,-40,-25],[40,-135,40,-25],[40,-25,170,-25],[-170,65,-40,65],[40,65,170,65],[122.3,82.8,97.3,122.8],[97.3,122.8,62.3,162.8],[-41.7,7.0,-1.7,32.0],[-1.7,32.0,38.3,67.0],[-85.6,-126.8,-75.0,-80.8],[-75.0,-80.8,-71.4,-27.8]]},{"name":"Five Gate Run","shape":[[59.94,-295.65],[235.95,-187.96],[301.57,7.68],[226.07,199.73],[44.8,298.32],[-157.44,257.32],[-286.01,95.93],[-280.76,-110.36],[-144.14,-265.0]],"walls":[[-175,-150,100,-150],[-100,-85,175,-85],[-175,-20,100,-20],[-3.75,45.0,175,45],[-175,110,100,110],[172.2,-43.3,126.5,-62.3],[126.5,-62.3,107.5,-16.6],[-58.6,65.3,-23.6,100.3],[-23.6,100.3,11.4,65.3],[-66.9,16.9,-122.0,1.3],[-107.9,43.8,-163.0,28.2]]},{"name":"Twisting Hall","shape":[[86.53,-279.74],[234.44,-175.45],[292.79,-4.14],[239.31,168.74],[94.42,277.19],[-86.53,279.74],[-234.44,175.45],[-292.79,4.14],[-239.31,-168.74],[-94.42,-277.19]],"walls":[[-145,-155,-145,45],[-145,45,-40,45],[-40,-65,60,-65],[60,-65,60,130],[60,130,165,130],[131.5,-78.9,131.5,-8.5],[131.5,-38.9,76.5,-38.9],[-57.7,-49.2,-27.1,24.7],[-42.4,-12.2,-93.2,8.8],[159.3,17.5,102.8,74.1],[131.0,45.8,92.2,6.9]]},{"name":"Split Junctions","shape":[[0.0,-297.25],[232.39,-185.33],[289.8,66.15],[128.96,267.81],[-128.96,267.81],[-289.8,66.15],[-232.39,-185.33]],"walls":[[-175,-125,-65,-125],[-65,-125,-65,-25],[25,-155,25,-25],[25,-25,165,-25],[-165,65,-25,65],[-25,65,-25,155],[65,65,165,65],[16.1,-71.1,-33.9,-43.1],[6.1,-23.1,-43.9,4.9],[98.2,24.4,43.1,8.8],[57.2,51.2,2.1,35.7],[111.2,131.8,66.2,96.3],[63.1,140.9,18.0,105.4]]},{"name":"Grand Finale","shape":[[30.11,-300.16],[233.54,-190.94],[300.16,30.11],[190.94,233.54],[-30.11,300.16],[-233.54,190.94],[-300.16,-30.11],[-190.94,-233.54]],"walls":[[-175,-145,90,-145],[90,-145,90,-65],[-90,-65,175,-65],[-175,15,90,15],[90,15,108.9,60],[-90,95,175,95],[-90,95,-90,155],[10.0,4.8,-4.0,75.6],[-4,75.6,-45,64],[-34.2,152.6,5.8,92.6],[5.8,92.6,45.8,152.6],[33.5,-62.0,54.4,-13.3],[54.4,-13.3,130,-25]]}];
function levelScale(i){return 1+Math.min(.22,Math.floor(i/5)*.042);}
function shape(i){const scale=levelScale(i);return BALLOON_LEVEL_DESIGNS[i].shape.map(([x,y])=>({x:x*scale,y:y*scale}));}
function polygonEdges(){const area=vertices.reduce((sum,a,i)=>{const b=vertices[(i+1)%vertices.length];return sum+a.x*b.y-b.x*a.y;},0);const sign=area>=0?1:-1;return vertices.map((a,i)=>({a,b:vertices[(i+1)%vertices.length],boundary:true,sign}));}
function innerEdges(){return barriers.map(v=>({a:{x:v.x1,y:v.y1},b:{x:v.x2,y:v.y2},boundary:false}));}
function inside(x,y,r=0){for(const e of polygonEdges()){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,len=Math.hypot(dx,dy),nx=-dy/len*e.sign,ny=dx/len*e.sign;if((x-e.a.x)*nx+(y-e.a.y)*ny<r+4)return false;}return true;}
function distSegment(x,y,e){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,len2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-e.a.x)*dx+(y-e.a.y)*dy)/len2)),px=e.a.x+t*dx,py=e.a.y+t*dy;return Math.hypot(x-px,y-py);}
function buildBarriers(i){const scale=levelScale(i);return BALLOON_LEVEL_DESIGNS[i].walls.map(([x1,y1,x2,y2])=>({x1:x1*scale,y1:y1*scale,x2:x2*scale,y2:y2*scale}));}
function spawn(i){const rnd=randGen(9017+i*19231),count=Math.min(100,20+Math.floor(i*2.6)+Math.floor(i/5)*2),out=[];let tries=0;const edges=innerEdges();while(out.length<count&&tries++<24000){const r=11+Math.floor(rnd()*3)*3,x=(rnd()-.5)*570*levelScale(i),y=(rnd()-.5)*(i<4?350:565)*levelScale(i);if(!inside(x,y,r+4)||edges.some(e=>distSegment(x,y,e)<r+12)||Math.hypot(x-205,y+112)<45||out.some(b=>Math.hypot(x-b.x,y-b.y)<r+b.r+2))continue;out.push({x,y,vx:0,vy:0,r,color:palettes[Math.floor(i/4)%palettes.length],hit:false});}return out;}
function makeBall(){ball={x:0,y:0,vx:0,vy:0,r:12};const starts=[{x:205,y:-112},{x:185,y:-80},{x:0,y:0},{x:-185,y:-95}];for(const p of starts){if(inside(p.x,p.y,ball.r+6)&&innerEdges().every(e=>distSegment(p.x,p.y,e)>ball.r+12)){ball.x=p.x;ball.y=p.y;break;}}}
window.balloonMazeLayoutInfo=(i)=>({vertices:shape(i),barriers:buildBarriers(i)});
function setup(i,teacher=false){level=i;preview=teacher;angle=0;elapsed=0;demoTime=0;vertices=shape(i);barriers=buildBarriers(i);balloons=spawn(i);makeBall();paint=[];sparks=[];drag=null;mode='ready';$('levelPanel').hidden=true;$('heading').textContent=`Level ${i+1}`;$('message').textContent=teacher?'Teacher preview: no scores or progress will be saved.':`Rotate the box! The white ball pops the ${balloons.length} rolling paint balloons.`;dialog('Start level',()=>{mode='playing';$('overlay').hidden=true;},'Show me',()=>{mode='demo';demoTime=0;$('overlay').hidden=true;});hud();}
function dialog(label,fn,label2,fn2){primary=fn;secondary=fn2;$('primary').textContent=label;$('secondary').textContent=label2||'';$('secondary').hidden=!label2;$('overlay').hidden=false;}
function levels(){mode='levels';drag=null;$('overlay').hidden=true;$('levelPanel').hidden=false;const grid=$('grid');grid.replaceChildren();for(let i=0;i<N;i++){const b=document.createElement('button');b.textContent=`${i+1}${progress.times[i]!==null?' ✓':''}`;b.disabled=i>=unlocked();b.onclick=()=>setup(i);grid.append(b);}$('levelLabel').textContent=`${completed()} / 30 complete`;}
function fmt(t){return `${Math.floor(t/60)}:${(t%60).toFixed(1).padStart(4,'0')}`;}
function hud(){$('levelLabel').textContent=`Level ${level+1} / 30`;$('timeLabel').textContent=fmt(elapsed);const n=balloons.filter(b=>!b.hit).length;$('balloonLabel').textContent=`${n} balloon${n===1?'':'s'} left`;}
function finish(){mode='won';drag=null;tone(1000);if(!preview){const ms=Math.max(1,Math.round(elapsed*1000));if(progress.times[level]===null||ms<progress.times[level])progress.times[level]=ms;save();window.balloonMazeLeaderboard?.record(level+1,ms);try{window.gameResultsStore?.saveResult({gameName:'Balloon Maze',studentName:localStorage.getItem('moving-sound-student-name-v1')||'Student',levelCompleted:level+1,playedAtMs:Date.now()}).catch(()=>{});}catch{}}$('heading').textContent='🎉 All Balloons Popped!';$('message').textContent=`Time: ${fmt(elapsed)}${preview?' — teacher preview, not saved.':''}`;dialog(level===29?'Levels':'Next level',()=>level===29?levels():setup(level+1,preview),'Play again',()=>setup(level,preview));}
// The world is simulated in unrotated container coordinates. Gravity is rotated into it.
// Every body, including balloons, receives identical gravity, wall and body collisions.
function resolveWalls(body,edges){
  for(let pass=0;pass<3;pass++){
    for(const e of edges){
      const dx=e.b.x-e.a.x;
      const dy=e.b.y-e.a.y;
      const len=Math.hypot(dx,dy);
      if(len<0.00001)continue;

      if(e.boundary){
        let nx=-dy/len;
        let ny=dx/len;

        const mx=(e.a.x+e.b.x)/2;
        const my=(e.a.y+e.b.y)/2;

        if((-mx)*nx+(-my)*ny<0){
          nx=-nx;
          ny=-ny;
        }

        const distance=(body.x-e.a.x)*nx+
                       (body.y-e.a.y)*ny;
        const minimum=body.r+5;

        if(distance<minimum){
          body.x+=nx*(minimum-distance);
          body.y+=ny*(minimum-distance);

          const velocity=body.vx*nx+body.vy*ny;

          if(velocity<0){
            body.vx-=1.18*velocity*nx;
            body.vy-=1.18*velocity*ny;
          }
        }
      }else{
        const lengthSquared=dx*dx+dy*dy;
        const t=Math.max(0,Math.min(1,
          ((body.x-e.a.x)*dx+(body.y-e.a.y)*dy)/
          lengthSquared
        ));

        const px=e.a.x+t*dx;
        const py=e.a.y+t*dy;
        const ox=body.x-px;
        const oy=body.y-py;
        const distance=Math.hypot(ox,oy);
        const minimum=body.r+7;

        if(distance<minimum){
          const nx=distance>0.0001?ox/distance:-dy/len;
          const ny=distance>0.0001?oy/distance:dx/len;

          body.x+=nx*(minimum-distance);
          body.y+=ny*(minimum-distance);

          const velocity=body.vx*nx+body.vy*ny;

          if(velocity<0){
            body.vx-=1.15*velocity*nx;
            body.vy-=1.15*velocity*ny;
          }
        }
      }
    }
  }
}
function pair(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d>=min)return false;const nx=d>.00001?dx/d:1,ny=d>.00001?dy/d:0,overlap=min-d,ma=a===ball?1:1.7,mb=b===ball?1:1.7,share=ma+mb;a.x-=nx*overlap*mb/share;b.x+=nx*overlap*ma/share;a.y-=ny*overlap*mb/share;b.y+=ny*overlap*ma/share;const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv<0){const impulse=-(1+.35)*rv/(1/ma+1/mb);a.vx-=impulse*nx/ma;a.vy-=impulse*ny/ma;b.vx+=impulse*nx/mb;b.vy+=impulse*ny/mb;}return true;}
function splat(b){paint.push({x:b.x,y:b.y,r:b.r*1.5,color:b.color,seed:(b.x*23+b.y*7+level*19)|0});if(paint.length>160)paint.shift();for(let k=0;k<12;k++){const a=k*TAU/12,sp=35+Math.random()*130;sparks.push({x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.4,color:b.color});}tone(350+Math.random()*380);}
function physics(dt){const steps=Math.max(1,Math.ceil(dt/.007)),h=dt/steps,edges=[...polygonEdges(),...innerEdges()],gx=Math.sin(angle)*510,gy=Math.cos(angle)*510;for(let s=0;s<steps;s++){const bodies=[ball,...balloons.filter(b=>!b.hit)];for(const b of bodies){b.vx=(b.vx+gx*h)*Math.exp(-.9*h);b.vy=(b.vy+gy*h)*Math.exp(-.9*h);const speed=Math.hypot(b.vx,b.vy);if(speed>470){b.vx*=470/speed;b.vy*=470/speed;}b.x+=b.vx*h;b.y+=b.vy*h;resolveWalls(b,edges);}for(let pass=0;pass<2;pass++){for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const a=bodies[i],b=bodies[j];if(b.hit)continue;if(Math.abs(a.x-b.x)>a.r+b.r||Math.abs(a.y-b.y)>a.r+b.r)continue;if(a===ball&&Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r){b.hit=true;splat(b);continue;}pair(a,b);}for(const b of bodies)if(!b.hit)resolveWalls(b,edges);}for(const b of bodies){if(!Number.isFinite(b.x+b.y+b.vx+b.vy)){if(b===ball)makeBall();else{b.hit=true;}}}}}
function draw(){ctx.clearRect(0,0,720,720);const back=ctx.createRadialGradient(C,C,0,C,C,350);back.addColorStop(0,['#a4e8ff','#c8fba7','#b6fff3','#ffc6c6'][level%4]);back.addColorStop(1,['#388ac8','#6ac4a1','#49c6c6','#e98787'][level%4]);ctx.fillStyle=back;ctx.beginPath();ctx.arc(C,C,340,0,TAU);ctx.fill();ctx.save();ctx.translate(C,C);const farthest=Math.max(1,...vertices.map(v=>Math.hypot(v.x,v.y)));const fit=Math.min(1,315/(farthest+20));ctx.scale(fit,fit);ctx.rotate(angle);ctx.beginPath();vertices.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();const floor=ctx.createLinearGradient(-240,-240,240,240);floor.addColorStop(0,'#7884b8');floor.addColorStop(.52,'#596692');floor.addColorStop(1,'#3d4b79');ctx.fillStyle=floor;ctx.fill();ctx.save();ctx.clip();const floorLight=ctx.createRadialGradient(-95,-125,15,30,30,460);floorLight.addColorStop(0,'#ffffff20');floorLight.addColorStop(1,'#07143422');ctx.fillStyle=floorLight;ctx.fillRect(-430,-430,860,860);ctx.strokeStyle='#e2ecff0a';ctx.lineWidth=1;for(let t=-400;t<400;t+=24){ctx.beginPath();ctx.moveTo(-420,t);ctx.lineTo(420,t);ctx.stroke();}for(const p of paint){const rnd=randGen(p.seed);ctx.fillStyle=p.color;ctx.globalAlpha=.68;ctx.beginPath();ctx.arc(p.x,p.y,p.r*.65,0,TAU);ctx.fill();for(let k=0;k<12;k++){const a=rnd()*TAU,r=p.r*(.35+rnd()*1.1);ctx.beginPath();ctx.arc(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,2+rnd()*6,0,TAU);ctx.fill();}}ctx.globalAlpha=1;
ctx.restore();

// Rebuild the container outline after drawing paint.
// Canvas save/restore does not restore the current path.
ctx.beginPath();
vertices.forEach((p,i)=>{
  if(i===0)ctx.moveTo(p.x,p.y);
  else ctx.lineTo(p.x,p.y);
});
ctx.closePath();
ctx.lineJoin='round';ctx.lineCap='round';ctx.shadowColor='#081733';ctx.shadowBlur=16;ctx.shadowOffsetY=8;ctx.lineWidth=24;ctx.strokeStyle='#202c50';ctx.stroke();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.lineWidth=9;ctx.strokeStyle='#53659b';ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle='#e5efff';ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#ffffff55';ctx.stroke();ctx.lineCap='butt';ctx.save();
ctx.beginPath();
vertices.forEach((p,i)=>{
  if(i===0)ctx.moveTo(p.x,p.y);
  else ctx.lineTo(p.x,p.y);
});
ctx.closePath();
ctx.clip();
for(const w of barriers){ctx.beginPath();ctx.moveTo(w.x1,w.y1);ctx.lineTo(w.x2,w.y2);ctx.shadowColor='#101c3e';ctx.shadowBlur=6;ctx.shadowOffsetY=5;ctx.strokeStyle='#273354';ctx.lineWidth=18;ctx.stroke();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='#5368a2';ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle='#a6bde7';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#f0f7ff';ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();
for(const b of balloons){if(b.hit)continue;const g=ctx.createRadialGradient(b.x-b.r*.4,b.y-b.r*.5,1,b.x,b.y,b.r*1.2);g.addColorStop(0,'#fff7');g.addColorStop(.35,b.color);g.addColorStop(1,b.color);ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.fillStyle='#fff9';ctx.beginPath();ctx.arc(b.x-b.r*.32,b.y-b.r*.35,Math.max(2,b.r*.18),0,TAU);ctx.fill();}for(const p of sparks){ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,TAU);ctx.fill();}ctx.globalAlpha=1;ctx.save();
ctx.shadowColor='transparent';
ctx.shadowBlur=0;
ctx.shadowOffsetX=0;
ctx.shadowOffsetY=0;
ctx.globalAlpha=1;
ctx.fillStyle='#ffffff';
ctx.beginPath();
ctx.arc(ball.x,ball.y,ball.r,0,TAU);
ctx.fill();
ctx.restore();ctx.restore();}
function pause(){if(mode!=='playing')return;mode='paused';drag=null;$('heading').textContent='Paused';$('message').textContent='Your timer is stopped.';dialog('Keep playing',()=>{mode='playing';$('overlay').hidden=true;},'Levels',levels);}
function frame(now){const dt=Math.min(.035,(now-last)/1000||0);last=now;const isFrozen=frozen();if(isFrozen&&!previousFrozen&&mode==='playing')pause();previousFrozen=isFrozen;if(!document.hidden&&!isFrozen){if(mode==='playing'||mode==='demo'){if(mode==='demo'){demoTime+=dt;angle+=dt*.9;if(demoTime>6){setup(level,preview);}}else elapsed+=dt;if(mode==='playing'||mode==='demo'){physics(dt);if(mode==='playing'&&balloons.every(b=>b.hit))finish();hud();}}for(const p of sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}sparks=sparks.filter(p=>p.life>0);}if(vertices.length)draw();requestAnimationFrame(frame);}
function pos(e){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width,r.height)/720;return{x:(e.clientX-(r.left+r.width/2))/scale,y:(e.clientY-(r.top+r.height/2))/scale};}
canvas.style.touchAction='none';canvas.addEventListener('pointerdown',e=>{if(mode!=='playing'||frozen())return;const p=pos(e);if(Math.hypot(p.x,p.y)<60)return;drag={id:e.pointerId,a:Math.atan2(p.y,p.x)};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||mode!=='playing'||frozen())return;const p=pos(e),a=Math.atan2(p.y,p.x),delta=Math.atan2(Math.sin(a-drag.a),Math.cos(a-drag.a));angle+=Math.max(-.23,Math.min(.23,delta));drag.a=a;});for(const t of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(t,()=>drag=null);
$('primary').onclick=()=>{if(!frozen())primary?.();};$('secondary').onclick=()=>{if(!frozen())secondary?.();};$('levels').onclick=levels;$('pause').onclick=pause;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'🔊':'🔇';};window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('trackpadStudentNamePromptOpen',pause);window.trackpadTeacherSkipAdapter={advance(){if(level>=29)return false;setup(level+1,true);return true;}};
async function settings(){try{const r=await fetch('/api/settings',{cache:'no-store'});if(!r.ok)return;const s=await r.json();globalSound=s.soundEnabled!==false;if(s.balloonMazeGameActive===false)location.replace('../../index.html');}catch{}}
settings();const poll=setInterval(settings,10000);window.addEventListener('pagehide',()=>{clearInterval(poll);audio?.close();},{once:true});levels();requestAnimationFrame(frame);
})();
