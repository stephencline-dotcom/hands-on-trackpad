/* Later lessons: familiar actions, new physical reasons. */
(function(root){
'use strict';
const P=root.TortoisePuzzles, custom=new Set(['balance','repairChute','drawbridge','route']);
const titles=['Catch it, then use it','Balance the seesaw bridge','Repair the stone chute','Open the river gate','Support the drawbridge','Choose your final crossing'];
const goals=['Stop the boulder. Can its loose rock help open the gate?','Which rock will bring the tilted bridge level?','There is a hole in the chute. How can the stone reach the switch?','A gate blocks the river. How can we clear it before our raft sails?','What will hold the drawbridge when you lower it?','Build a bridge or ride a raft. You choose the way to the finish!'];
for(let l=12;l<18;l++)P.bank[l]=Array.from({length:6},(_,v)=>{
 const base=P.bank[l][v], mk=(kind,x,width=280,extra={})=>({kind,x,width,side:1,later:true,layoutVariant:v,boardNear:true,logFirst:'far',weightsNeeded:1,inputs:[],outputs:[],unlock:null,...extra});
 let stations,links=[];
 if(l===12)stations=[mk('boulder',230+v*5,235,{reuseSource:true}),mk('gate',630,235,{reuseRock:true,reuseFrom:420+v*5,unlock:0})];
 if(l===13)stations=[mk('balance',385+v*6,320,{bigLeft:v%2===0,requiredMass:v%3+1})];
 if(l===14)stations=[mk('repairChute',370+v*7,320,{pieceWidth:48+v*3})];
 if(l===15){stations=[mk('raft',315+v*5,300,{inputs:[1]}),mk('gate',555+v*5,200,{outputs:[0],riverGate:true})];links=[[1,0]];}
 if(l===16)stations=[mk('drawbridge',380+v*6,330,{supportNear:v%2===0})];
 if(l===17)stations=[mk('route',360+v*5,350,{boatAbove:v%2===0})];
 return {...base,id:`remix-${l+1}-${v+1}`,title:titles[l-12],goalText:goals[l-12],support:'solve',stations,links};
});
const originalCreate=P.create,originalAction=P.action,originalStep=P.step,originalHint=P.hint,originalSurface=P.surfaceY;
P.create=function(p){const st=originalCreate(p);for(const s of st.stations){s.stage=0;s.stageClock=0;s.smallPlaced=false;s.bigPlaced=false;s.choice='';s.supportProgress=0;s.chuteProgress=0;}return st;};
function fail(st,text){st.status='failed';st.attempts++;st.message=text;return false;}
function start(s){s.prepared=true;s.phase='moving';s.progress=0;}
P.action=function(st,i,part){const s=st.stations[i];if(!s||!custom.has(s.kind))return originalAction(st,i,part);if(st.status!=='playing'||s.prepared||s.ready)return false;
 let accepted=false;
 if(s.kind==='balance'){
  if(part==='small'&&!s.smallPlaced){s.smallPlaced=true;s.stage=1;if((s.bigPlaced?2:0)+1>=s.requiredMass)start(s);st.message='The little rock tips it a little. Can you add enough weight?';accepted=true;}
  if(part==='large'&&!s.bigPlaced){s.bigPlaced=true;if(2+(s.smallPlaced?1:0)>=s.requiredMass)start(s);else st.message='The bridge still needs a little more weight. Try the small rock too.';accepted=true;}
 }
 if(s.kind==='repairChute'){
  if(part==='wrongPatch')return fail(st,'That piece does not fit the hole. Match the length of the missing wood.');
  if(part==='patch'&&s.stage===0){s.stage=1;accepted=true;}
  else if(part==='crank'&&s.stage===1){s.stage=2;s.stageClock=0;accepted=true;}
  else if(part==='release'){if(s.stage<3)return fail(st,'The stone fell through the broken chute. Fit the missing wood, lower the chute, then release the stone.');start(s);accepted=true;}
 }
 if(s.kind==='drawbridge'){
  if(part==='wrongSupport')return fail(st,'That support is under the hinge. The loose end needs a support underneath it.');
  if(part==='support'&&s.stage===0){s.stage=1;s.stageClock=0;accepted=true;}
  else if(part==='crank'){if(s.stage<2){s.collapse=true;return fail(st,'The bridge has no support underneath. Swing the support into place before lowering the bridge.');}start(s);accepted=true;}
 }
 if(s.kind==='route'){
  if(part==='chooseBridge'&&!s.choice){s.choice='bridge';accepted=true;}
  else if(part==='chooseRaft'&&!s.choice){s.choice='raft';accepted=true;}
  else if(part==='plank'&&s.choice==='bridge'){start(s);accepted=true;}
  else if(part==='sail'&&s.choice==='raft'){if(st.x<s.x-.01){s.earlySail=true;return fail(st,'The empty raft floated away. Wait until Tortoise is aboard before untying the rope.');}start(s);accepted=true;}
 }
 if(accepted){st.moves++;if(s.prepared)st.message='Watch the path open!';}return accepted;
};
P.step=function(st,dt){dt=Math.max(0,Math.min(dt,.05));
 if(st.status==='failed'){for(const s of st.stations)if(s.collapse||s.earlySail)s.progress=Math.min(1,s.progress+dt/1.2);originalStep(st,dt);return;}
 if(st.status!=='playing')return;
 for(const s of st.stations){
  if(s.kind==='repairChute'&&s.stage===2){s.stageClock+=dt;s.chuteProgress=Math.min(1,s.stageClock/.85);if(s.chuteProgress===1)s.stage=3;}
  if(s.kind==='drawbridge'&&s.stage===1){s.stageClock+=dt;s.supportProgress=Math.min(1,s.stageClock/.9);if(s.supportProgress===1)s.stage=2;}
 }
 // Custom movements take longer than the generic mechanism's 1.05 seconds.
 for(const s of st.stations)if(custom.has(s.kind)&&s.phase==='moving')s.progress-=dt/1.05-dt/(s.kind==='route'&&s.choice==='raft'?3.4:s.kind==='repairChute'?2.8:1.8);
 const route=st.stations.find(s=>s.kind==='route'&&s.choice==='raft'),before=st.x;
 originalStep(st,dt);
 if(route&&!route.ready){if(!route.prepared)st.x=Math.max(before,Math.min(route.x,before+dt*145));else st.x=route.x+210*(route.progress*route.progress*(3-2*route.progress));}
};
P.hint=function(st){
 const river=st.stations.findIndex(s=>s.riverGate&&!s.prepared);if(river>=0)return {index:river,part:'weight',text:'Lift the gate out of the river first. Drag the rock onto its yellow pad.'};
 const customIndex=st.stations.findIndex(s=>custom.has(s.kind)&&!s.ready);
 if(customIndex<0)return originalHint(st);
 const s=st.stations[customIndex];if(s.prepared)return null;
 let part,text;
 if(s.kind==='balance'){part=s.requiredMass===1||s.bigPlaced?'small':'large';text=s.bigPlaced?'Add the small rock too. The bridge needs a little more weight.':s.smallPlaced?'The small rock did not lower it enough. Try the big rock on the same pan.':'Put enough weight on the raised end to make the bridge level.';}
 if(s.kind==='repairChute'){if(s.stage===2)return null;part=s.stage===0?'patch':s.stage===1?'crank':'release';text=s.stage===0?'Drag the matching piece of wood into the hole in the chute.':s.stage===1?'Turn the blue crank to point the repaired chute at the switch.':'Now release the stone. Watch it cross your repair and press the gate switch.';}
 if(s.kind==='drawbridge'){if(s.stage===1)return null;part=s.stage===0?'support':'crank';text=s.stage===0?'Swing the striped support under the far end of the drawbridge.':'The support is ready. Turn the crank to lower the bridge onto it.';}
 if(s.kind==='route'){part=!s.choice?'chooseBridge':s.choice==='bridge'?'plank':'sail';text=!s.choice?'Choose your crossing: build a bridge or take the raft. Both can work.':s.choice==='bridge'?'Drag the long plank across the river.':st.x<s.x-.01?'Wait for Tortoise to step aboard the raft.':'Tortoise is aboard! Untie the rope and float across.';if(s.choice==='raft'&&st.x<s.x-.01)return null;}
 return {index:customIndex,part,text};
};
P.surfaceY=function(st,x=st.x){const s=st.stations.find(s=>s.kind==='route'&&s.choice==='raft');if(s&&(s.prepared||st.x>=s.x)&&!s.ready&&x>=st.x-45&&x<=st.x+55)return 391;return originalSurface(st,x);};
function point(s,part){if(s.reuseRock&&part==='weight')return {x:s.reuseFrom,y:380,to:{x:s.x+s.width*.62,y:370}};const x=s.x;const map={small:{x:x+(s.bigLeft?260:200),y:380,to:{x:x-40,y:300}},large:{x:x+(s.bigLeft?200:260),y:377,to:{x:x-40,y:300}},patch:{x:x+250,y:380,to:{x:x+25+[35,72,115][s.layoutVariant%3]+s.pieceWidth/2,y:253}},crank:{x:x-60,y:300},release:{x:x+25,y:220},support:{x:x+(s.supportNear?0:200),y:373},chooseBridge:{x:x-80,y:s.boatAbove?312:245},chooseRaft:{x:x-80,y:s.boatAbove?245:312},plank:{x:x+100,y:275,to:{x:x+100,y:398}},sail:{x:x-65,y:346}};return custom.has(s.kind)?map[part]||{x,y:320}:null;}
function render(s,i,button,rock,plank,gate){if(!custom.has(s.kind))return '';
 const x=s.x,a=s.ready?1:s.progress;let art='';
 const click=(part,shape,label)=>button(s,i,part,shape,label);
 const drag=(part,shape,label,tx,ty,tw=64,th=48)=>`<rect class="drop-target" data-drop="${i}:${part}" x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="8"/>`+button(s,i,part,shape,label,'draggable');
 const water=(left,right)=>`<path d="M${left},399V520H${right}V399" fill="#319fc5" stroke="#287b96" stroke-width="4"/><path class="water-shimmer" d="M${left+12},435h${right-left-24}M${left+20},478h${right-left-40}" stroke="#bdf4ff" stroke-width="5" fill="none"/>`;
 const crank=(part,label)=>click(part,`<g transform="translate(${x-60},300)"><circle r="28" fill="#54c4da" stroke="#355c70" stroke-width="4"/><g transform="rotate(${a*240+s.chuteProgress*85})"><path d="M-19,0h38M0,-19v38" stroke="#e1faff" stroke-width="4"/><path d="M0,0l17,-17" stroke="#795635" stroke-width="7"/><circle cx="17" cy="-17" r="8" fill="#ffd564" stroke="#855d35" stroke-width="3"/></g></g>`,label);
 if(s.kind==='balance'){
  const mass=(s.smallPlaced?1:0)+(s.bigPlaced?2:0),tilt=35*(1-(s.prepared?a:Math.min(.7,mass/s.requiredMass*.65))),angle=tilt*Math.PI/180,panY=398-100*Math.sin(angle),panX=x+60-100*Math.cos(angle);
  art+=water(x+12,x+162)+`<path d="M${x+42},425l18,-42 18,42Z" fill="#9c754e" stroke="#634a33" stroke-width="4"/><g transform="translate(${x+60},398) rotate(${tilt})">${plank(-100,0,205)}</g><circle cx="${x+60}" cy="398" r="9" fill="#ffe095" stroke="#75502e" stroke-width="3"/><path d="M${panX},${panY-40}v40" stroke="#dfc596" stroke-width="5"/><ellipse cx="${panX}" cy="${panY-40}" rx="35" ry="12" fill="${s.bigPlaced?'#a1d96e':'#ffd366'}" stroke="#805b36" stroke-width="4"/>`;
  const shapes=(rx,ry,size)=>`<g transform="translate(${rx},${ry}) scale(${size})">${rock(0,0)}</g>`;
  if(s.smallPlaced)art+=shapes(panX,panY-52,.6);else if(!s.prepared)art+=drag('small',shapes(x+(s.bigLeft?260:200),380,.6),'Try the small rock on the balance pan',panX-38,panY-78,76,55);
  if(s.bigPlaced)art+=shapes(panX,panY-60,1.2);else if(!s.prepared)art+=drag('large',shapes(x+(s.bigLeft?200:260),377,1.2),'Put the large rock on the balance pan',panX-38,panY-78,76,55);
  art+=`<text x="${x+60}" y="471" text-anchor="middle" class="station-label">BALANCE BRIDGE</text><g>${Array.from({length:s.requiredMass},(_,n)=>`<circle cx="${x+40+n*18}" cy="445" r="6" fill="${mass>n?'#b5e88a':'#fff0bd'}" stroke="#775a36" stroke-width="2"/>`).join('')}</g>`;
 }
 if(s.kind==='repairChute'){
  const angle=s.chuteProgress*28,woodWidth=s.pieceWidth,holeStart=[35,72,115][s.layoutVariant%3],woodEnd=holeStart+woodWidth;
  art+=gate(x-10,Math.max(0,(a-.65)/.35))+`<path d="M${x+25},240V185" stroke="#dfc596" stroke-width="5"/><g transform="translate(${x+25},240) rotate(${angle})">${plank(0,0,holeStart)}${plank(woodEnd,0,190-woodEnd)}`;
  if(s.stage>0)art+=plank(holeStart,0,woodWidth);else art+=`<rect class="drop-target" x="${holeStart}" y="-5" width="${woodWidth}" height="35" rx="5"/>`;
  art+='</g>';
  if(s.stage===0)art+=drag('wrongPatch',plank(x+305-(woodWidth+25)/2,420,woodWidth+25),'Try this extra wood piece',x+25+holeStart,235,woodWidth,35);
  if(s.stage===0)art+=`<rect class="drop-target" data-drop="${i}:patch" x="${x+25+holeStart}" y="235" width="${woodWidth}" height="35" rx="5"/>`;
  if(s.stage===0)art+=button(s,i,'patch',plank(x+250-woodWidth/2,380,woodWidth),'Fit the wood into the missing chute section','draggable');
  art+=`<path d="M${x+193},343V190H${x+22}v${315-110*Math.max(0,(a-.65)/.35)}" stroke="#dfc596" stroke-width="4" fill="none"/><ellipse cx="${x+193}" cy="340" rx="28" ry="13" fill="${a>.65?'#99d968':'#ffd159'}" stroke="#856137" stroke-width="4"/>`;
  art+=crank('crank','Lower the repaired chute');
  if(!s.prepared)art+=click('release',rock(x+25,215)+`<rect x="${x+1}" y="226" width="48" height="12" rx="4" fill="#ffcc56"/>`,'Release the stone after repairing and lowering the chute');
  else {const roll=Math.min(1,a/.65);art+=rock(x+25+168*roll,225+89.2*roll+10.8*Math.max(0,(roll-.85)/.15));}
  art+=`<text x="${x+100}" y="471" class="station-label" text-anchor="middle">REPAIR THE CHUTE</text>`;
 }
 if(s.kind==='drawbridge'){
  const far=x+200,pivot=s.supportNear?far:x,catcher=s.supportNear?x:far,supportAngle=(s.supportNear?85:-85)*(1-s.supportProgress),bridgeAngle=s.collapse?(s.supportNear?-50:50)*a:(s.supportNear?75:-75)*(1-a);
  art+=water(x+12,far)+`<g transform="translate(${catcher},432) rotate(${supportAngle})"><path d="M-14,0v-34h28v34" fill="#c09955" stroke="#745231" stroke-width="4"/><path d="M-11,-10l22,-12M-11,-22l17,-9" stroke="#fff0a7" stroke-width="5"/></g><g transform="translate(${pivot},398) rotate(${bridgeAngle})">${plank(s.supportNear?-215:0,0,215)}</g><circle cx="${pivot}" cy="398" r="11" fill="#d7ad67" stroke="#715435" stroke-width="4"/><path d="M${x-60},300V210H${x+45}L${pivot+(s.supportNear?-215:215)*Math.cos(bridgeAngle*Math.PI/180)},${398+(s.supportNear?-215:215)*Math.sin(bridgeAngle*Math.PI/180)}" fill="none" stroke="#dfc69a" stroke-width="4"/>`;
  if(s.stage===0)art+=click('wrongSupport',`<circle cx="${pivot}" cy="373" r="25" fill="#f8c976" stroke="#825b36" stroke-width="4"/><path d="M${pivot-13},380q8,-23 24,-10" stroke="#856337" stroke-width="5" fill="none"/>`,'Try the support beneath the hinge');
  if(s.stage===0)art+=click('support',`<circle cx="${catcher}" cy="373" r="28" fill="#ffd563" stroke="#825b36" stroke-width="4"/><path d="M${catcher-16},382q10,-27 29,-12l-9,-2 1,-10" fill="none" stroke="#856337" stroke-width="5"/>`,'Swing the support under the drawbridge');
  art+=crank('crank','Lower the bridge onto its support')+`<text x="${x+100}" y="471" class="station-label" text-anchor="middle">SUPPORT THE DRAWBRIDGE</text>`;
 }
 if(s.kind==='route'){
  art+=water(x-50,x+270)+plank(x-100,398,55)+plank(x+265,398,55);
  if(!s.choice){for(const [part,y,label]of [['chooseBridge',s.boatAbove?312:245,'BUILD A BRIDGE'],['chooseRaft',s.boatAbove?245:312,'RIDE THE RAFT']])art+=click(part,`<rect x="${x-155}" y="${y-24}" width="155" height="47" rx="12" fill="${part==='chooseBridge'?'#edc181':'#90d9e4'}" stroke="#725b3f" stroke-width="4"/><text x="${x-78}" y="${y+5}" text-anchor="middle" fill="#355344" font-size="13" font-weight="800">${label}</text>`,label);}
  if(s.choice==='bridge'){
   if(s.prepared)art+=plank(x-55,398,330);
   else art+=drag('plank',plank(x-55,275,330),'Build the bridge across the river',x-55,379,330,40);
  }
  if(s.choice==='raft'||!s.choice){const t=s.earlySail?a:a*a*(3-2*a),cx=x+210*t;
   art+=`<g transform="translate(${cx},398)">${plank(-45,0,100)}<path d="M-30,5v27M30,5v27" stroke="#dfc596" stroke-width="5"/><path d="M-37,28h85" stroke="#815b38" stroke-width="9"/></g>`;
   if(s.choice==='raft'&&!s.prepared&&!s.earlySail)art+=click('sail',`<path d="M${x-80},330v64" stroke="#815b38" stroke-width="9"/><path d="M${x-80},345C${x-109},316 ${x-108},372 ${x-65},346C${x-35},318 ${x-34},370 ${x-65},346L${x-35},398" fill="none" stroke="#705234" stroke-width="10"/><path d="M${x-80},345C${x-109},316 ${x-108},372 ${x-65},346C${x-35},318 ${x-34},370 ${x-65},346L${x-35},398" fill="none" stroke="#e3bf7c" stroke-width="6" stroke-dasharray="3 2"/>`,'Untie the raft after Tortoise is aboard');
  }
  art+=`<text x="${x+110}" y="491" class="station-label" text-anchor="middle">TWO WAYS TO THE FINISH</text>`;
 }
 return `<g data-machine="${i}">${art}</g>`;
}
root.TortoiseLateChallenges={render,point,isCustom:s=>custom.has(s.kind)};
})(window);