/* Runaway Hay Wagon: self-contained Level 2 scene. Does not affect Level 1. */
window.RunawayWagon = (() => {
  const S={mode:'intro',distance:0,lane:0.55,desired:0.55,speed:0,boost:0,slow:0,wagon:380,road:0,clock:0,clicks:0,near:0,particles:[],obstacles:[],pickups:[],caught:false,scroll:0,crash:0,finish:0,farmer:0,hookStage:0,hookProgress:0,storySkip:false,world:0,visualX:255,roadPhase:0,chickenFlee:{},hitCooldown:0};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const ellipse=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
  const line=(c,pts,color,w)=>{c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke()};
  function reset(){Object.assign(S,{mode:'intro',distance:0,lane:.55,desired:.55,speed:0,boost:0,slow:0,wagon:410,clock:0,clicks:0,near:0,particles:[],caught:false,scroll:0,crash:0,finish:0,farmer:0,hookStage:0,hookProgress:0,storySkip:false,world:0,visualX:255,roadPhase:0,chickenFlee:{},hitCooldown:0});S.obstacles=Array.from({length:12},(_,i)=>({x:700+i*330+rnd(-80,80),lane:rnd(.19,.81),kind:i%3===0?'chicken':i%3===1?'log':'mud',hit:false}));S.pickups=Array.from({length:11},(_,i)=>({x:510+i*370+rnd(-75,75),lane:rnd(.2,.8),taken:false}));}
  function start(){S.mode='story';S.clock=0;S.speed=0;}
  function move(p){if(S.mode==='chase'||S.mode==='hook')S.desired=clamp((p.y-375)/200,.08,.92);}
  function click(p){
    if(S.mode==='hook'&&S.hookStage===2&&Math.hypot(p.x-660,p.y-(405+S.lane*160))<56){S.mode='saved';S.finish=0;S.hookStage=3;return true;}
    if(S.mode==='story'){S.clock=20;S.storySkip=true;return true;}
    return S.mode!=='chase';
  }
  function update(dt){S.clock+=dt;S.crash=Math.max(0,S.crash-dt*2);S.hitCooldown=Math.max(0,S.hitCooldown-dt);S.boost=Math.max(0,S.boost-dt);S.slow=Math.max(0,S.slow-dt);if(S.mode==='story'&&S.clock>19.5){S.mode='chase';S.clock=0;}
    if(S.mode==='saved'){S.finish+=dt;return;}
    if(S.mode==='hook'){
      S.lane+=(S.desired-S.lane)*Math.min(1,dt*2.5);
      if(S.hookStage===0){S.hookProgress+=dt*.38;if(S.hookProgress>=1){S.hookStage=1;S.hookProgress=0;}}
      else if(S.hookStage===1){S.hookProgress+=dt*.28;if(S.hookProgress>=1){S.hookStage=2;S.hookProgress=0;}}
      return;
    }
    if(S.mode!=='chase')return;
    S.lane+=(S.desired-S.lane)*Math.min(1,dt*3.8);
    const base=S.boost>0?173:S.slow>0?76:150;S.speed+=(base-S.speed)*Math.min(1,dt*1.6);S.distance+=S.speed*dt;S.scroll=Math.max(0,S.distance-255);
    const playerX=S.distance, playerLane=S.lane;S.visualX=playerX-S.scroll;
    for(const o of S.obstacles){if(o.kind==='chicken'){if(!o.flee&&o.x-playerX<180&&o.x-playerX>-40)o.flee=0.001;if(o.flee)o.flee=Math.min(2,o.flee+dt);continue;}if(!o.hit&&S.hitCooldown===0&&Math.abs(o.x-playerX)<39&&Math.abs(o.lane-playerLane)<.115){o.hit=true;S.slow=o.kind==='mud'?2.8:1.6;S.crash=.45;S.hitCooldown=.8;for(let i=0;i<16;i++)S.particles.push({x:250,y:405+(S.lane-.5)*170,vx:rnd(-90,80),vy:rnd(-140,20),life:rnd(.3,.9),r:rnd(3,8)});}}
    for(const b of S.pickups){if(!b.taken&&Math.abs(b.x-playerX)<30&&Math.abs(b.lane-playerLane)<.105){b.taken=true;S.boost=2.4;}}
    S.particles=S.particles.filter(p=>(p.life-=dt)>0);for(const p of S.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt;}
    if(S.distance>3250){S.mode='hook';S.speed=0;S.clock=0;S.hookStage=0;S.hookProgress=0;}
  }
  function cloud(c,x,y,s){ellipse(c,x,y,38*s,14*s,'#ffffffc9');ellipse(c,x-20*s,y-8*s,23*s,17*s,'#ffffffdd');ellipse(c,x+13*s,y-12*s,28*s,19*s,'#ffffffea')}
  function tree(c,x,y,s){ellipse(c,x+6,y+22*s,35*s,10*s,'#5b853a88');c.fillStyle='#936038';c.fillRect(x-6*s,y-16*s,12*s,46*s);for(const [dx,dy,r,col] of [[-18,-18,25,'#3c934e'],[19,-21,28,'#4a9f51'],[0,-39,30,'#62b65d'],[-8,-48,14,'#7ac76c']])ellipse(c,x+dx*s,y+dy*s,r*s,r*s,col)}
  function barn(c,x,y){c.fillStyle='#c4583b';c.fillRect(x,y-65,125,100);c.fillStyle='#7b3529';c.beginPath();c.moveTo(x-12,y-65);c.lineTo(x+62,y-119);c.lineTo(x+137,y-65);c.closePath();c.fill();c.fillStyle='#f2d9a7';c.fillRect(x+44,y-15,37,50);line(c,[[x+62,y-15],[x+62,y+35]],'#ad6942',3);}
  function chicken(c,x,y,t){ellipse(c,x,y+9,14,7,'#9b7e5070');ellipse(c,x,y,13,12,'#fff2d1');ellipse(c,x+8,y-9,8,8,'#fff8e6');ellipse(c,x+13,y-8,2,2,'#332a24');ellipse(c,x+17,y-5,6,3,'#e6a23b');ellipse(c,x+6,y-19,4,6,'#d65340');line(c,[[x-5,y+10],[x-6,y+17+Math.sin(t*10)*3]],'#d69c39',2);}
  function tractor(c,x,y,t,boost=false){c.save();c.translate(x,y+Math.sin(t*14)*2);if(S.crash)c.rotate(Math.sin(t*30)*S.crash*.12);
    ellipse(c,5,26,94,15,'#4c663b77');c.fillStyle='#b9492f';c.beginPath();c.roundRect(-59,-30,130,50,13);c.fill();c.fillStyle='#ed6c41';c.beginPath();c.roundRect(4,-32,76,36,10);c.fill();c.fillStyle='#9dd6e3';c.beginPath();c.roundRect(-40,-54,52,46,8);c.fill();c.strokeStyle='#7e4b30';c.lineWidth=5;c.stroke();c.fillStyle='#d9f1f0';c.fillRect(-31,-45,33,26);
    ellipse(c,-25,-8,11,10,'#e8ad74');c.fillStyle='#487ca5';c.fillRect(-34,0,18,14);c.fillStyle='#aa793e';c.fillRect(-38,-19,27,6);
    for(const [wx,r] of [[-32,27],[49,20]]){ellipse(c,wx,19,r,r,'#252c2d');ellipse(c,wx,19,r*.58,r*.58,'#66757a');for(let k=0;k<6;k++){let a=k*Math.PI/3+t*S.speed/16;ellipse(c,wx+Math.cos(a)*r*.42,19+Math.sin(a)*r*.42,3,3,'#d5d8cc')}}
    c.fillStyle='#343c3d';c.fillRect(53,-47,8,27);for(let i=0;i<3;i++)ellipse(c,62+i*12+Math.sin(t*2+i)*4,-59-i*13,8+i*3,6+i*2,'#e8e5da88');
    c.fillStyle='#555b55';c.fillRect(-69,3,13,8);c.fillStyle='#c9d2ca';ellipse(c,-72,7,5,5,'#c9d2ca');
    if(boost){for(let k=0;k<4;k++)line(c,[[-105-k*20,-4+k*8],[-140-k*24,-4+k*8]],'#ffe16e',4)}c.restore()}
  function wagon(c,x,y,t){c.save();c.translate(x,y+Math.sin(t*10)*5);ellipse(c,0,29,92,15,'#5b4a3077');c.fillStyle='#97602f';c.beginPath();c.roundRect(-68,-23,135,53,8);c.fill();for(let k=0;k<5;k++){c.fillStyle=k%2?'#d9a65b':'#e6bd6c';c.beginPath();c.roundRect(-59+k*23,-40-Math.sin(k*2)*8,27,29,5);c.fill();line(c,[[-56+k*23,-21],[-36+k*23,-40]],'#c88e44',2)}for(const wx of [-47,49]){ellipse(c,wx,30,19,19,'#383d3b');ellipse(c,wx,30,10,10,'#b3b6a3');ellipse(c,wx+Math.cos(t*8)*5,30+Math.sin(t*8)*5,3,3,'#6a6d63')}line(c,[[-69,4],[-105,12]],'#7e5531',7);c.restore()}
  function arrow(c,x,y,t){c.save();c.translate(x,y+Math.sin(t*5)*7);c.strokeStyle='#ffe26b';c.lineWidth=8;c.setLineDash([13,10]);c.beginPath();c.ellipse(0,0,54,42,0,0,Math.PI*2);c.stroke();c.setLineDash([]);c.fillStyle='#fff5d0';c.beginPath();c.moveTo(-10,-13);c.lineTo(15,0);c.lineTo(-10,13);c.closePath();c.fill();c.restore()}
  function draw(c,W,H,t){const sc=S.scroll;const grd=c.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#87cae7');grd.addColorStop(.65,'#d8eff0');grd.addColorStop(1,'#f4dfab');c.fillStyle=grd;c.fillRect(0,0,W,H);ellipse(c,1020,95,48,48,'#ffdf74');for(let i=0;i<10;i++)cloud(c,((i*255-sc*.12)%1700+1700)%1700-150,80+i%3*45,1+i%3*.2);
    c.fillStyle='#86b96c';c.beginPath();c.moveTo(0,300);for(let x=0;x<=W;x+=15)c.lineTo(x,300+Math.sin((x+sc*.24)/130)*45);c.lineTo(W,H);c.lineTo(0,H);c.fill();c.fillStyle='#72ad59';c.beginPath();c.moveTo(0,360);for(let x=0;x<=W;x+=15)c.lineTo(x,365+Math.sin((x+sc*.52)/85)*34);c.lineTo(W,H);c.lineTo(0,H);c.fill();
    c.fillStyle='#a2cb75';c.fillRect(0,380,W,H-380);for(let i=0;i<18;i++){let x=((i*190-sc*.8)%3500+3500)%3500-150;tree(c,x,390+i%3*21,.65+i%3*.17);if(i%5===0)barn(c,x+70,355)}
    c.fillStyle='#a47c4c';c.beginPath();c.moveTo(0,340);for(let x=0;x<=W;x+=12)c.lineTo(x,350+Math.sin((x+sc)/180)*28);c.lineTo(W,610);for(let x=W;x>=0;x-=12)c.lineTo(x,600+Math.sin((x+sc)/180)*28);c.closePath();c.fill();c.fillStyle='#e5bd80';c.beginPath();c.moveTo(0,365);for(let x=0;x<=W;x+=12)c.lineTo(x,375+Math.sin((x+sc)/180)*28);c.lineTo(W,585);for(let x=W;x>=0;x-=12)c.lineTo(x,575+Math.sin((x+sc)/180)*28);c.closePath();c.fill();
    for(let i=0;i<40;i++){const x=((i*115-sc)%4800+4800)%4800-100;ellipse(c,x,365+Math.sin((x+sc)/180)*28,5,3,'#f5d9a3');ellipse(c,x,580+Math.sin((x+sc)/180)*28,5,3,'#f5d9a3')}
    for(const o of S.obstacles){if(o.hit)continue;const x=o.x-sc,y=405+o.lane*160-(o.kind==='chicken'&&o.flee?Math.min(1,o.flee)*95:0);if(x<-100||x>W+100)continue;if(o.kind==='log'){c.save();c.translate(x,y);c.rotate(-.25);c.fillStyle='#80502d';c.beginPath();c.roundRect(-34,-13,68,26,10);c.fill();for(let k=0;k<4;k++)line(c,[[-22+k*15,-10],[-19+k*15,10]],'#b78046',2);c.restore()}else if(o.kind==='mud'){ellipse(c,x,y,54,21,'#735338');ellipse(c,x+18,y-4,23,8,'#a1784d');ellipse(c,x-18,y+5,18,6,'#a1784d')}else {chicken(c,x,y,t+(o.flee||0)*12);if(o.flee){for(let j=0;j<3;j++)ellipse(c,x-12-j*12,y+15+j*3,5,3,'#fff0c4aa')}}}
    for(const b of S.pickups){if(b.taken)continue;const x=b.x-sc,y=405+b.lane*160;if(x<-60||x>W+60)continue;ellipse(c,x,y,24+Math.sin(t*7)*3,24+Math.sin(t*7)*3,'#ffe78c88');c.fillStyle='#ffdd54';c.beginPath();c.moveTo(x+5,y-24);c.lineTo(x-10,y+2);c.lineTo(x+1,y+2);c.lineTo(x-6,y+25);c.lineTo(x+17,y-6);c.lineTo(x+5,y-6);c.closePath();c.fill()}
    if(S.mode==='story'){
      const q=S.clock;
      // The opening is one continuous farm cartoon: transport, trouble, chase.
      const barnX=1050-q*72;
      barn(c,barnX,330);
      c.fillStyle='#fff0b4';c.beginPath();c.roundRect(barnX+30,340,65,38,9);c.fill();
      c.fillStyle='#86552f';c.font='bold 24px Trebuchet MS';c.fillText('HAY',barnX+40,368);
      const tx=310+Math.min(q,9)*12;
      const wx=q<8?tx-198:q<11?tx-198+(q-8)*38:tx-84+(q-11)*72;
      wagon(c,wx,467+Math.sin(q*6)*4,t);
      tractor(c,tx,467,t);
      if(q>7.8&&q<13){
        const burst=Math.max(0,1-Math.abs(q-9)/1.3);
        for(let i=0;i<12;i++){let a=i*Math.PI/6+q;ellipse(c,tx-105+Math.cos(a)*(18+burst*44),468+Math.sin(a)*(14+burst*40),3+burst*4,3+burst*4,'#f8d47b');}
        if(q<10.5){c.fillStyle='#fff7d5';c.font='bold 42px Trebuchet MS';c.textAlign='center';c.fillText('CLANK!',620,220);c.textAlign='left';}
        // Loose hitch pin bouncing away.
        c.save();c.translate(tx-105+(q-8)*20,450-(q-8)*13+(q-8)*(q-8)*7);c.rotate(q*7);c.fillStyle='#aeb8b8';c.fillRect(-10,-4,20,8);c.restore();
      }
      if(q>11){for(let i=0;i<7;i++)ellipse(c,wx-40-i*18,480+Math.sin(q*7+i)*9,5+i%3*3,3+i%3,'#d6b16fbb');}
      chicken(c,690+Math.sin(q*3)*25,540,q);
      c.fillStyle='#fff4d9e8';c.beginPath();c.roundRect(24,20,470,62,16);c.fill();
      c.fillStyle='#62432d';c.font='bold 23px Trebuchet MS';c.fillText(q<8?'Taking hay to the barn':q<12?'Oh no! The hitch came loose!':'Catch the runaway hay wagon!',43,58);
      c.fillStyle='#fff5d4';c.beginPath();c.roundRect(W-158,24,135,48,14);c.fill();c.fillStyle='#694c31';c.font='bold 21px Trebuchet MS';c.fillText('Skip  >>',W-142,55);
    }
    else if(S.mode==='chase'){wagon(c,Math.min(1030,820+Math.sin(t*.6)*26),440+Math.sin(t*3)*5,t);tractor(c,S.visualX,405+S.lane*160,t,S.boost>0);if(S.distance<400)arrow(c,450,405+S.lane*160,t)}
    else if(S.mode==='hook'){
      const hy=400+(S.lane-.5)*170;
      const a=S.hookProgress;
      if(S.hookStage===0){wagon(c,560,hy,t);tractor(c,360+a*490,hy,t);arrow(c,845,hy-65,t);}
      else if(S.hookStage===1){wagon(c,560,hy,t);tractor(c,850-a*85,hy,t);arrow(c,660,hy,t);}
      else {wagon(c,560,hy,t);tractor(c,765,hy,t);line(c,[[667,hy+7],[660,hy+7]],'#d5d9d2',6);arrow(c,660,hy,t);}
      c.fillStyle='#fff7d9e9';c.beginPath();c.roundRect(215,104,770,75,18);c.fill();
      c.fillStyle='#68472b';c.font='bold 25px Trebuchet MS';c.textAlign='center';
      c.fillText(S.hookStage===0?'Pass the wagon first!':S.hookStage===1?'Ease back to the wagon tow bar!':'Click the rear hitch to connect!',600,151);c.textAlign='left';
    }
    else if(S.mode==='saved'){
      const f=Math.min(1,S.finish/4);
      barn(c,850,385);wagon(c,610+f*100,455,t);tractor(c,430+f*100,455,t);
      if(S.finish>2){for(let k=0;k<18;k++){const x=200+k*53,y=190+Math.sin(t*3+k)*38;ellipse(c,x,y,5,5,['#ffde6d','#ff9b78','#fff3bf'][k%3])}}
      c.fillStyle='#fff8df';c.font='bold 36px Trebuchet MS';c.textAlign='center';c.fillText(S.finish<2?'Hay safely back to the barn!':'WAGON RESCUED! FARM ANIMALS FED!',600,170);c.textAlign='left';
    }
    for(const p of S.particles)ellipse(c,p.x,p.y,p.r,p.r*.65,'#b78958');
    if(S.mode==='chase'){c.fillStyle='#fff4d8e8';c.beginPath();c.roundRect(24,22,340,57,18);c.fill();c.fillStyle='#74512e';c.font='bold 21px Trebuchet MS';c.fillText('CATCH THE WAGON!',45,57);c.fillStyle='#d7a46e';c.beginPath();c.roundRect(400,34,450,20,10);c.fill();c.fillStyle='#64b65b';c.beginPath();c.roundRect(400,34,450*clamp(S.distance/3250,0,1),20,10);c.fill();c.font='bold 20px Trebuchet MS';c.fillStyle='#fff8e5';c.fillText(S.boost>0?'SPEED BOOST!':'STEER AROUND OBSTACLES',880,55)}
  }
  return {reset,start,move,click,update,draw,S};
})();
