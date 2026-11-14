/* Endless world geometry. Retain only nearby road, so long runs stay inexpensive. */
(function(root){
  'use strict';
  const levels=[
    {name:'Cloud Garden',sky:['#5fbfcf','#d6f6e5'],top:'#91e6c2',side:'#328b92',edge:'#e9ffb4',accent:'#fff199'},
    {name:'Coral Coast',sky:['#ed9f98','#ffe9b2'],top:'#9ce9e5',side:'#338da6',edge:'#e7ffff',accent:'#fff0a6'},
    {name:'Twilight Peaks',sky:['#6c65a7','#edb7b2'],top:'#bfb5f5',side:'#655395',edge:'#f3d4ff',accent:'#fff09f'},
    {name:'Starlight Summit',sky:['#111e50','#6573a8'],top:'#83c9ed',side:'#385c92',edge:'#bcf8ff',accent:'#ffea8b'}
  ];
  const patterns=[
    {name:'Quick steps',lengths:[145,160,140,155,150,145]},
    {name:'Big sweeps',lengths:[330,290,360,315]},
    {name:'Short zig, long zag',lengths:[145,360,155,310,140,380]},
    {name:'Long zig, short zag',lengths:[350,150,320,140,380,160]},
    {name:'Staircase',lengths:[175,185,195,180,170,190]},
    {name:'Surprise mix',lengths:[300,145,220,360,160,260]},
    {name:'Breathe and dash',lengths:[375,325,155,140,165,145]},
    {name:'Rolling rhythm',lengths:[180,270,180,270,170,290]},
    {name:'Tight turns',lengths:[135,145,165,150,135,170]},
    {name:'Winding way',lengths:[215,330,145,265,185,355]}
    ,{name:'Switchback sprint',lengths:[120,310,115,365,130,275]},
    {name:'Double quick',lengths:[120,125,335,120,130,380]},
    {name:'Broken rhythm',lengths:[290,125,165,340,115,215]},
    {name:'Needle run',lengths:[115,140,125,150,120,135]},
    {name:'Giant steps',lengths:[390,155,410,125,355,180]},
    {name:'Offbeat staircase',lengths:[145,225,115,280,135,190]}
  ];
  // Each scenery favors its own rhythms, while retaining every pattern.
  const flavors=[
    {favorites:[0,4,7,15],length:.96,width:1,speed:1},
    {favorites:[1,2,3,14],length:1.10,width:1.02,speed:1.08},
    {favorites:[8,10,11,13],length:.89,width:.94,speed:.98},
    {favorites:[5,6,9,12],length:1,width:.91,speed:1.04}
  ];
  function speedAt(index,flavor){return (285+Math.min(215,index*2.4))*flavors[flavor].speed;}
  function reminders(s,demo=false){return demo||s.correct<4;}
  function random(s){let n=s.seed;n^=n<<13;n^=n>>>17;n^=n<<5;s.seed=n>>>0;return s.seed/4294967296;}
  function point(s,index){return s.path[index-s.base];}
  function widthAt(index){return 104-Math.min(40,index*.5);}
  function allowedPatterns(index){
    if(index<14)return [1,4,7];
    if(index<28)return [0,1,2,3,4,5,6,7,9,14,15];
    return patterns.map((_,i)=>i);
  }
  function minimumLeg(index){
    if(index<6)return 275;
    if(index<14)return 240-(index-6)*5;
    if(index<28)return 200-(index-14)*5;
    return 130-Math.min(35,(index-28)*.6);
  }
  // Recovery sections return throughout a run, even at a high score.
  const wavePlans=[['easy','medium','hard','medium'],['medium','hard','easy','medium'],['hard','medium','easy','medium']];
  function sectionPatterns(index,section){
    const allowed=allowedPatterns(index);
    const preferred=section==='easy'?[1,4,7]:section==='medium'?[2,3,5,6,7,9,14,15]:[0,8,10,11,12,13,15];
    const eligible=preferred.filter(i=>allowed.includes(i));
    return eligible.length?eligible:allowed;
  }
  function extend(s){while(s.base+s.path.length<s.segment+12){const index=s.base+s.path.length-1,last=s.path.at(-1);let length;
      if(index<6){length=300+(random(s)-.5)*40;last.pattern='Warm-up';s.section='easy';}
      else{if(s.patternOffset>=s.pattern.lengths.length){if(index<14){s.section=index<10?'easy':'medium';}
          else{if(s.waveOffset>=s.wavePlan.length){s.wavePlan=wavePlans[Math.floor(random(s)*wavePlans.length)];s.waveOffset=0;}s.section=s.wavePlan[s.waveOffset++];}
          const allowed=sectionPatterns(index,s.section),favorite=flavors[s.index].favorites.filter(i=>allowed.includes(i));
          const pool=favorite.length&&random(s)<.6?favorite:allowed;
          let selected=pool[Math.floor(random(s)*pool.length)];
          if(selected===s.patternIndex)selected=allowed[(allowed.indexOf(selected)+1)%allowed.length];
          s.patternIndex=selected;s.pattern=patterns[selected];s.patternOffset=0;}
        length=s.pattern.lengths[s.patternOffset++]+(random(s)-.5)*70;last.pattern=s.pattern.name;}
      // Early runs mix wide and medium turns. Later ones add tight bursts, with
      // occasional long straights to recover. Every generated leg stays fixed.
      const flavor=flavors[s.index];
      // Alternate narrow technical sequences with wider recovery sections.
      // Width is generated with the road; it never shrinks under the ball.
      const technical=['Tight turns','Needle run','Double quick'].includes(last.pattern);
      const recovery=['Big sweeps','Giant steps','Breathe and dash'].includes(last.pattern);
      const difficulty=Math.min(1,Math.max(0,(index-6)/30));
      last.width=Math.max(58,widthAt(index)*(1+(flavor.width-1)*difficulty)+(technical?-7*difficulty:recovery?9:0));
      // Longer, wider recovery legs remain available when the base road is hard.
      const recoveryFloor=s.section==='easy'?Math.max(92,104-Math.min(12,index*.1)):s.section==='medium'?Math.max(78,98-Math.min(20,index*.16)):58;
      last.width=Math.max(last.width,recoveryFloor);
      const sectionMinimum=s.section==='easy'?280:s.section==='medium'?190:0;
      length=Math.max(minimumLeg(index),sectionMinimum,last.width*1.15,length*(index<6?1:flavor.length));
      last.effort=s.section;
      s.path.push({x:last.x+(index%2===0?length:0),y:last.y+(index%2===1?length:0),width:widthAt(index+1),pattern:last.pattern});
    }
    const remove=Math.max(0,s.segment-s.base-4);if(remove){s.path.splice(0,remove);s.base+=remove;}
  }
  function create(index=0,seed){const state={index,level:{...levels[index],width:104,speed:speedAt(0,index)},path:[{x:0,y:0,width:106,pattern:'Warm-up'}],base:0,segment:0,x:0,y:0,axis:0,correct:0,misses:0,gems:0,fall:0,ended:false,seed:(seed===undefined?(Math.random()*4294967295)>>>0:seed>>>0)||1,pattern:patterns[0],patternIndex:0,patternOffset:patterns[0].lengths.length,section:'easy',wavePlan:wavePlans[0],waveOffset:0};extend(state);return state;}
  function distance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
  function remaining(s){const next=point(s,s.segment+1);return s.segment%2===0?next.x-s.x:next.y-s.y;}
  function canTurn(s){const next=point(s,s.segment+1);return !s.ended&&s.axis===s.segment%2&&Math.hypot(s.x-next.x,s.y-next.y)<=s.level.width*.57;}
  function turn(s){if(s.ended)return false;if(canTurn(s)){const next=point(s,s.segment+1);s.x=next.x;s.y=next.y;s.segment++;s.axis=s.segment%2;s.correct++;s.gems++;extend(s);s.level.width=point(s,s.segment).width;return true;}s.axis=1-s.axis;s.misses++;return false;}
  function step(s,dt){if(s.ended)return 'ended';s.level.speed=speedAt(s.segment,s.index);s.x+=s.axis===0?s.level.speed*dt:0;s.y+=s.axis===1?s.level.speed*dt:0;
    if(distance(s,point(s,s.segment),point(s,s.segment+1))>s.level.width*.5-9){s.misses++;s.ended=true;return 'fall';}return 'roll';}
  const api={levels,patterns,flavors,speedAt,reminders,allowedPatterns,minimumLeg,sectionPatterns,point,widthAt,create,distance,remaining,canTurn,turn,step,extend};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ZigZagModel=api;
})(typeof window!=='undefined'?window:globalThis);
