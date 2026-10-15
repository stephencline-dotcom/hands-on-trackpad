/* Medium/Long extensions. All movement uses the existing paused game clock. */
(function(root){
'use strict';
const P=root.TortoisePuzzles,L=root.TortoiseLateChallenges,smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const setLength=P.setJourneyLength;
P.setJourneyLength=function(value){const length=setLength(value);if(length==='short')return length;
 P.bank=P.bank.map(row=>row.map(p=>{p=JSON.parse(JSON.stringify(p));const v=p.version-1,stop=p.sourceStop;
 if(stop===10&&length==='medium'||stop===12&&length==='long'){
  const original=p.stations[0];p.title='The runaway supply cart';p.goalText='Hold the cart still, load the right rock, then send it to the gate.';p.support=length==='long'?'solve':'practice';p.links=[];
  p.stations=[{...original,kind:'cart',x:240,width:400,inputs:[],outputs:[],unlock:null,cartStart:240+v*12,cartEnd:645,cartMass:v%3===0?1:2,rockLeft:v%2===0}];
 }
 if(stop===16){p.title='Mend the river raft';p.goalText='Open the river gate, repair the leak, then help Tortoise sail.';for(const s of p.stations)if(s.kind==='raft'){s.leaky=true;s.plugX=850+(v%3)*20;s.plugY=270;s.leakSide=v%2?1:-1;}}
 if(stop===18){p.title='The finish-line challenge';p.goalText='Make a safe crossing, then lift the heavy finish gate.';p.support='solve';p.stations[0].finalChallenge=true;p.stations.push({kind:'gate',x:790,width:160,side:1,later:true,layoutVariant:v,weightsNeeded:2,weightChoice:true,inputs:[],outputs:[],unlock:0,deliveryX:750,deliveryY:215});}
 // Later counterweights are collected from a supply ledge across the scene.
 if(stop>=3&&stop!==18)for(const s of p.stations)if(s.kind==='gate'&&!s.reuseRock){s.deliveryX=140+v*18;s.deliveryY=265+(v%2)*35;}
 for(const machine of p.stations)if(machine.kind==='balance')machine.requiredMass=2;
 return p;}));return length;
};
const create=P.create,action=P.action,step=P.step,hint=P.hint;
P.create=function(p){const st=create(p);if(st.stations.some(s=>s.kind==='cart'||s.leaky||s.finalChallenge))st.goal=935;for(const s of st.stations){s.braked=false;s.loaded=false;s.patchProgress=0;s.plugged=false;s.cartClock=0;s.failureProgress=0;s.cartGate=0;s.balanceTilt=35;s.finalSupported=false;s.finalBoard=false;s.finalPatched=false;}return st;};
function fail(st,s,message){st.status='failed';st.attempts++;st.message=message;s.cartEscaped=s.kind==='cart';s.leakFailed=!!s.leaky;return false;}
P.action=function(st,i,part){const s=st.stations[i];if(!s||st.status!=='playing')return false;
 if(s.finalChallenge&&s.kind==='route'){
  if(s.prepared||s.ready)return false;
  if(part==='finalSupport'&&s.choice==='bridge'&&!s.finalSupported){s.finalSupported=true;st.moves++;st.message='The brace is in place. Find a board that reaches both banks.';return true;}
  if(part==='wrongPlank')return fail(st,s,'That board is too short to reach both banks. Try the longer board.');
  if(part==='plank'&&s.choice==='bridge'){if(!s.finalSupported){st.message='The loose end needs a brace first.';return false;}if(s.finalBoard)return false;s.finalBoard=true;st.moves++;st.message='The board reaches across. Use the crank to lower it.';return true;}
  if(part==='finalLower'&&s.choice==='bridge'){if(!s.finalSupported||!s.finalBoard)return fail(st,s,'The crossing is not ready. Brace the loose end and fit the long board first.');return action(st,i,'plank');}
  if(part==='finalPlug'&&s.choice==='raft'&&!s.finalPatched){s.finalPatched=true;st.moves++;st.message='The leak is repaired. Let Tortoise step aboard, then untie the rope.';return true;}
  if(part==='sail'&&s.choice==='raft'&&!s.finalPatched)return fail(st,s,'The raft is leaking. Fit its wooden plug before sailing.');
 }
 if(s.kind==='balance'&&part==='removeSmall'&&s.smallPlaced&&!s.bigPlaced){s.smallPlaced=false;st.moves++;st.message='Now try the big rock by itself.';return true;}
 if(s.kind==='balance'&&['small','large'].includes(part)){
  const key=part==='small'?'smallPlaced':'bigPlaced';if(s[key])return false;s[key]=true;st.moves++;const mass=(s.smallPlaced?1:0)+(s.bigPlaced?2:0);
  if(mass>2){s.balanceOverloaded=true;s.ready=false;return fail(st,s,'Both rocks are too heavy! The bridge tipped too far. Use only the big rock.');}
  if(mass===2){s.prepared=true;s.phase='moving';s.progress=0;st.message='The big rock balances the bridge. Watch it settle level.';}else st.message='The small rock is too light. Click it on the pan to take it off, then try the big rock.';return true;
 }
 if(s.leaky&&part==='plug'&&!s.plugged&&!s.prepared){s.plugged=true;s.patchProgress=0;st.moves++;st.message='The plug fits! Watch the water stop before untying the rope.';return true;}
 if(s.leaky&&part==='sail'&&(!s.plugged||s.patchProgress<1))return fail(st,s,'The raft is still leaking. Fit the wooden plug and let it settle before sailing.');
 if(s.kind!=='cart')return action(st,i,part);
 if(s.ready||s.prepared)return false;
 if(part==='brake'&&!s.braked&&!s.loaded){s.braked=true;st.message='The wheel is held. Which rock is heavy enough for the gate?';}
 else if((part==='small'||part==='large')&&!s.loaded){
  if(!s.braked)return fail(st,s,'The cart rolled away! Put the wooden stopper against its wheel before loading the rock.');
  if((part==='small'?1:2)<s.cartMass)return fail(st,s,'That rock is too light for this gate. Look at the weight marks beside the gate.');
  s.loaded=true;s.cargo=part;st.message='The rock is aboard. Lift the wooden stopper to send the cart down the track.';
 }else if(part==='release'&&s.braked){if(!s.loaded){st.message='Load a rock before releasing the cart.';return false;}s.prepared=true;s.phase='moving';s.progress=0;s.braked=false;st.message='Follow the cart! The rock will press the gate pad.';}
 else return false;
 st.moves++;return true;
};
P.step=function(st,dt){dt=Math.max(0,Math.min(dt,.05));
 for(const s of st.stations)if(s.kind==='balance'&&(st.status==='playing'||s.balanceOverloaded)){const target=s.balanceOverloaded?-30:s.bigPlaced?0:s.smallPlaced?17.5:35;s.balanceTilt+=(target-s.balanceTilt)*(1-Math.exp(-dt*3));if(Math.abs(s.balanceTilt-target)<.05)s.balanceTilt=target;if(st.status==='playing'&&s.phase==='moving')s.progress-=dt/1.8-dt/2.5;}
 if(st.status==='playing')for(const s of st.stations){if(s.leaky&&s.plugged)s.patchProgress=Math.min(1,s.patchProgress+dt/.8);if(s.kind==='cart'&&s.phase==='moving')s.progress-=dt/1.05-dt/4.8;}
 else if(st.status==='failed')for(const s of st.stations)if(s.cartEscaped||s.leakFailed)s.failureProgress=Math.min(1,s.failureProgress+dt/1.5);
 step(st,dt);
};
P.hint=function(st){const f=st.stations.findIndex(s=>s.finalChallenge&&!s.ready);if(f>=0){const s=st.stations[f];if(s.prepared)return null;return{index:f,part:!s.choice?'chooseBridge':s.choice==='bridge'?!s.finalSupported?'finalSupport':!s.finalBoard?'plank':'finalLower':!s.finalPatched?'finalPlug':'sail',text:!s.choice?'Choose the bridge or the raft. Then prepare your crossing.':s.choice==='bridge'?!s.finalSupported?'Move the brace under the far end of the bridge.':!s.finalBoard?'Move the board that reaches both banks into the bridge frame.':'Turn the crank to lower your supported bridge.':!s.finalPatched?'Fit the round wooden plug into the raft’s hole.':'Wait for Tortoise to board, then click the rope knot.'};}
 const b=st.stations.findIndex(s=>s.kind==='balance'&&!s.ready);if(b>=0){const s=st.stations[b];if(s.prepared)return null;return{index:b,part:s.smallPlaced?'removeSmall':'large',text:s.smallPlaced?'Click the small rock on the pan to take it off.':'Move only the big rock onto the pan.'};}
 const c=st.stations.findIndex(s=>s.kind==='cart'&&!s.ready);if(c>=0){const s=st.stations[c];if(s.prepared)return null;return{index:c,part:!s.braked?'brake':!s.loaded?(s.cartMass===1?'small':'large'):'release',text:!s.braked?'Move the wooden block to the cart wheel.':!s.loaded?(s.cartMass===1?'Move a rock into the cart.':'Move the big rock into the cart.'):'Click the block by the wheel to send the cart.'};}
 const river=st.stations.findIndex(s=>s.riverGate&&!s.prepared);if(river>=0)return hint(st);
 const leak=st.stations.findIndex(s=>s.leaky&&!s.plugged);if(leak>=0)return{index:leak,part:'plug',text:'Move the wooden plug into the leaking hole.'};return hint(st);
};
const oldPoint=L.point,oldCustom=L.isCustom,oldRender=L.render;
L.isCustom=s=>s.kind==='cart'||s.leaky||oldCustom(s);
L.point=function(s,part){if(s.finalChallenge){const map={chooseBridge:{x:235,y:245},chooseRaft:{x:235,y:313},finalSupport:{x:670,y:295,to:{x:s.x+255,y:424}},plank:{x:s.x+110,y:267,to:{x:s.x+110,y:340}},finalLower:{x:s.x-100,y:285},finalPlug:{x:680,y:298,to:{x:s.x+18,y:415}},sail:{x:s.x-65,y:346}};return map[part]||null;}
 if(s.kind==='balance'){const angle=s.balanceTilt*Math.PI/180,px=s.x+60-100*Math.cos(angle),py=398-100*Math.sin(angle);if(part==='removeSmall')return{x:px,y:py-56};if(['small','large'].includes(part))return{x:s.x+(part==='small'?(s.bigLeft?260:200):(s.bigLeft?200:260)),y:part==='small'?380:377,to:{x:px,y:py-50}};}
 if(s.deliveryX&&/^weight/.test(part))return{x:s.deliveryX+(part==='weight'?0:(Number(part.slice(6))-1)*58),y:s.deliveryY,to:{x:s.x+s.width*.62,y:370}};
 if(s.finalChallenge&&s.kind==='route'){
  if(s.prepared||s.ready)return false;
  if(part==='finalSupport'&&s.choice==='bridge'&&!s.finalSupported){s.finalSupported=true;st.moves++;st.message='The brace is in place. Find a board that reaches both banks.';return true;}
  if(part==='wrongPlank')return fail(st,s,'That board is too short to reach both banks. Try the longer board.');
  if(part==='plank'&&s.choice==='bridge'){if(!s.finalSupported){st.message='The loose end needs a brace first.';return false;}if(s.finalBoard)return false;s.finalBoard=true;st.moves++;st.message='The board reaches across. Use the crank to lower it.';return true;}
  if(part==='finalLower'&&s.choice==='bridge'){if(!s.finalSupported||!s.finalBoard)return fail(st,s,'The crossing is not ready. Brace the loose end and fit the long board first.');return action(st,i,'plank');}
  if(part==='finalPlug'&&s.choice==='raft'&&!s.finalPatched){s.finalPatched=true;st.moves++;st.message='The leak is repaired. Let Tortoise step aboard, then untie the rope.';return true;}
  if(part==='sail'&&s.choice==='raft'&&!s.finalPatched)return fail(st,s,'The raft is leaking. Fit its wooden plug before sailing.');
 }
 if(s.kind==='balance'&&part==='removeSmall'&&s.smallPlaced&&!s.bigPlaced){s.smallPlaced=false;st.moves++;st.message='Now try the big rock by itself.';return true;}
 if(s.kind==='balance'&&['small','large'].includes(part)){
  const key=part==='small'?'smallPlaced':'bigPlaced';if(s[key])return false;s[key]=true;st.moves++;const mass=(s.smallPlaced?1:0)+(s.bigPlaced?2:0);
  if(mass>2){s.balanceOverloaded=true;s.ready=false;return fail(st,s,'Both rocks are too heavy! The bridge tipped too far. Use only the big rock.');}
  if(mass===2){s.prepared=true;s.phase='moving';s.progress=0;st.message='The big rock balances the bridge. Watch it settle level.';}else st.message='The small rock is too light. Click it on the pan to take it off, then try the big rock.';return true;
 }
 if(s.leaky&&part==='plug')return{x:s.plugX,y:s.plugY,to:{x:s.x+s.leakSide*18,y:415}};
 if(s.kind==='cart'){const rockX=s.rockLeft?70:80;return{brake:{x:430,y:255,to:{x:s.cartStart+5,y:280}},small:{x:rockX,y:250,to:{x:s.cartStart,y:216}},large:{x:rockX+68,y:250,to:{x:s.cartStart,y:216}},release:{x:s.cartStart+5,y:280}}[part]||null;}return oldPoint(s,part);};
L.render=function(s,i,button,rock,plank,gate){if(s.finalChallenge)return finalArt(s,i,button,plank);if(s.kind==='drawbridge'){const clearButton=(station,index,part,shape,label,extra)=>{if(part==='wrongSupport')return '';if(part==='support'){const cx=s.supportNear?s.x:s.x+200;shape=`<path d="M${cx},432v-57l-15,-12" stroke="#86613d" stroke-width="7" fill="none"/><circle cx="${cx-15}" cy="363" r="12" fill="#ffd465" stroke="#805b36" stroke-width="3"/>`;}return button(station,index,part,shape,label,extra);};return oldRender(s,i,clearButton,rock,plank,gate).replace(/,399V520H([^V]+)V399/g,',388V520H$1V388');}
 if(s.kind==='balance')return balanceArt(s,i,button,rock,plank);if(s.kind!=='cart'){const art=oldRender(s,i,button,rock,plank,gate);return s.kind==='route'?art.replace(/,399V520H([^V]+)V399/g,',388V520H$1V388'):art;}
 const {t,roll,cx,cy,gateOpen,endRock,rockX,rockY,padY}=cartGeometry(s);
 const stop=(x,y)=>`<path d="M${x-22},${y+14}h42l-5,-27h-12Z" fill="#d7a052" stroke="#805831" stroke-width="4"/><path d="M${x-10},${y+7}h20" stroke="#ffe4a3" stroke-width="3"/>`;
 const drag=(part,shape,label,tx,ty,w=72,h=62)=>`<rect opacity="${part==='large'?0:1}" pointer-events="none" class="drop-target" data-drop="${i}:${part}" x="${tx}" y="${ty}" width="${w}" height="${h}" rx="10"/>`+button(s,i,part,shape,label,'draggable');
 // A separate trestle carries the cart behind the ground-level walking path.
 const trackStart=s.cartStart-65,trackEnd=s.cartEnd+60,trackY=tx=>296+16*(tx-s.cartStart)/(s.cartEnd-s.cartStart);
 let a='';
 for(let n=0;n<6;n++){const tx=trackStart+25+n*(trackEnd-trackStart-50)/5,ty=trackY(tx);a+=`<path d="M${tx-9},${ty+7}l-6,83M${tx+9},${ty+7}l6,83M${tx-13},${ty+65}l25,-39" fill="none" stroke="#9a7853" stroke-width="6"/><path d="M${tx-16},${ty+90}h32" stroke="#baa078" stroke-width="7"/>`;}
 a+=`<path d="M${trackStart},${trackY(trackStart)+6}L${trackEnd},${trackY(trackEnd)+6}" stroke="#795737" stroke-width="10"/><path d="M${trackStart},${trackY(trackStart)}L${trackEnd},${trackY(trackEnd)}" stroke="#e2c58c" stroke-width="5"/>`;
 for(let n=0;n<14;n++){const tx=trackStart+12+n*(trackEnd-trackStart-24)/13;a+=`<path d="M${tx},${trackY(tx)-3}l-2,13" stroke="#886543" stroke-width="5"/>`;}
 a+=gate(770,gateOpen)+`<path d="M745,${padY}V205H800V${315-110*gateOpen}" fill="none" stroke="#dfc596" stroke-width="5"/><circle cx="745" cy="205" r="9" fill="#c29454" stroke="#765130" stroke-width="3"/><ellipse cx="745" cy="${padY}" rx="34" ry="12" fill="${gateOpen>.9?'#a3d976':'#ffd15d'}" stroke="#805b36" stroke-width="4"/>`;
 a+=`<g transform="translate(${cx},${cy})"><ellipse cy="41" rx="62" ry="7" fill="#594831" opacity=".18"/>${[-35,35].map(wx=>`<g transform="translate(${wx},27) rotate(${(cx-s.cartStart)*2})"><circle r="18" fill="#ad7946" stroke="#5f4931" stroke-width="5"/><path d="M-13,0h26M0,-13v26M-9,-9l18,18M-9,9l18,-18" stroke="#efd49c" stroke-width="3"/><circle r="5" fill="#65472c"/></g>`).join('')}${plank(-57,0,114)}<path d="M-52,-25v25M52,-25v25" stroke="#835b36" stroke-width="7"/><path d="M-52,-18h104" stroke="#d6a867" stroke-width="13"/></g>`;
 if(s.loaded)a+=`<g transform="translate(${rockX},${rockY}) rotate(${endRock*300}) scale(${s.cargo==='large'?1.2:.8})">${rock(0,0)}</g>`;
 const rx=s.rockLeft?70:80;
 a+=plank(Math.min(rx,rx+68)-40,276,148)+`<path d="M${rx-30},299v35M${rx+90},299v35" stroke="#997047" stroke-width="6"/>`;
 if(!s.loaded&&!s.prepared&&s.braked){for(const [part,px,scale]of [['small',rx,.8],['large',rx+68,1.2]])a+=drag(part,`<g transform="translate(${px},250) scale(${scale})">${rock(0,0)}</g>`,'Load the '+part+' rock into the cart',s.cartStart-47,192,94,63);}
 else if(!s.loaded&&!s.prepared)a+=`<g opacity=".55" pointer-events="none"><g transform="translate(${rx},250) scale(.8)">${rock(0,0)}</g><g transform="translate(${rx+68},250) scale(1.2)">${rock(0,0)}</g></g>`;
 if(!s.prepared){if(!s.braked)a+=drag('brake',stop(430,255),'Move the wooden stopper against the cart wheel',s.cartStart-20,258,52,44);else a+=s.loaded?button(s,i,'release',stop(s.cartStart+5,280),'Lift the stopper to send the loaded cart'):stop(s.cartStart+5,280);}
 a+=`<rect x="773" y="239" width="69" height="43" rx="10" fill="#fff8d6" stroke="#a1783e" stroke-width="3"/>`;
 a+=Array.from({length:s.cartMass},(_,n)=>`<circle cx="${790+n*19}" cy="265" r="7" fill="#ffdd7a" stroke="#84643c" stroke-width="2"/>`).join('');
 if(!s.prepared){const step=!s.braked?1:!s.loaded?2:3,px=!s.braked?430:!s.loaded?s.cartStart:s.cartStart+80,py=!s.braked?214:!s.loaded?176:280;a+=`<g pointer-events="none"><circle cx="${px}" cy="${py}" r="15" fill="#fff4b5" stroke="#846136" stroke-width="3"/><text x="${px}" y="${py+5}" text-anchor="middle" font-size="18" font-weight="800" fill="#365e43">${step}</text></g>`;}
 a+=`<text x="510" y="469" class="station-label" text-anchor="middle">THE SUPPLY CART</text>`;
 return `<g data-machine="${i}">${a}</g>`;
};



function cartGeometry(s){
 const t=s.progress,roll=s.cartEscaped?smooth(s.failureProgress):smooth(t/.62),cx=s.cartStart+(s.cartEnd-s.cartStart)*roll,cy=250+16*roll,gateOpen=smooth((t-.79)/.21),endRock=smooth((t-.62)/.17),padY=270+40*gateOpen;
 // The load tips off the cart, lands on the hanging pan, then lowers it.
 const rockX=cx+endRock*(745-s.cartEnd),rockY=endRock<1?cy-34+(252-(266-34))*endRock-Math.sin(endRock*Math.PI)*28:padY-18;
 return{t,roll,cx,cy,gateOpen,endRock,rockX,rockY,padY,railY:cy+46,wheelBottom:cy+45};
}
P.cartGeometry=cartGeometry;

function finalArt(s,i,button,plank){
 const x=s.x,t=s.progress,e=smooth(t),cx=x+210*e,deck=398+Math.sin(t*Math.PI*4)*Math.sin(t*Math.PI)*2;
 const click=(part,shape,label)=>button(s,i,part,shape,label);
 const drag=(part,shape,label,tx,ty,w,h)=>`<rect opacity="${part==='wrongPlank'?0:1}" pointer-events="none" class="drop-target" data-drop="${i}:${part}" x="${tx}" y="${ty}" width="${w}" height="${h}" rx="8"/>`+button(s,i,part,shape,label,'draggable');
 const brace=(bx,by)=>`<path d="M${bx-16},${by+18}v-38h32v38Z" fill="#c99a50" stroke="#80572f" stroke-width="4"/><path d="M${bx-12},${by+10}l24,-20M${bx-12},${by-3}l16,-13" stroke="#fff0a1" stroke-width="5"/>`;
 const cork=(px,py)=>`<ellipse cx="${px}" cy="${py}" rx="18" ry="12" fill="#efc16c" stroke="#815530" stroke-width="4"/><path d="M${px-9},${py-3}q9,-5 18,0M${px-7},${py+4}h14" stroke="#ad783c" stroke-width="2"/>`;
 let a=`<path d="M${x-50},388l-6,35 6,40 -7,57H${x+270}V388Z" fill="#268fbd" stroke="#286b83" stroke-width="4"/><path d="M${x-31},445h264M${x-25},480h255" stroke="#afeef6" stroke-width="4"/>`+plank(x-100,398,55)+plank(x+265,398,55);
 if(!s.choice){for(const [part,y]of [['chooseBridge',245],['chooseRaft',313]]){const icon=part==='chooseBridge'?`<path d="M185,${y+9}l16,-25 16,25M265,${y+9}l16,-25 16,25" stroke="#8b653a" stroke-width="7" fill="none"/>${plank(185,y-12,110)}`:`${plank(197,y-10,90)}<path d="M208,${y-11}v24M268,${y-11}v24" stroke="#6e5332" stroke-width="4"/><path d="M192,${y+24}q18,-8 36,0t36,0t30,0" stroke="#3198b9" stroke-width="4" fill="none"/>`;a+=click(part,`<rect x="168" y="${y-32}" width="145" height="66" rx="13" fill="${part==='chooseBridge'?'#f0d49b':'#a5dfeb'}" stroke="#805c38" stroke-width="4"/>${icon}`,part==='chooseBridge'?'Choose the bridge':'Choose the raft');}}
 if(s.choice==='bridge'){
  a+=plank(635,320,70)+`<path d="M645,342v56M695,342v56M${x-100},315v83" stroke="#92673d" stroke-width="6"/><path d="M${x-100},285V180H${x-55}V${335+63*e}" fill="none" stroke="#dfc596" stroke-width="4"/>`;
  if(s.finalSupported)a+=brace(x+255,424);else a+=drag('finalSupport',brace(670,295),'Place the bridge brace',x+236,402,40,43);
  if(!s.finalBoard){a+=drag('plank',plank(x-55,255,330),'Fit the long board across the gap',x-55,325,330,40);a+=drag('wrongPlank',plank(x+15,195,220),'Try the shorter board',x-55,325,330,40);}
  else a+=plank(x-55,335+63*e,330);
  if(!s.prepared)a+=click('finalLower',`<g transform="translate(${x-100},285)"><circle r="26" fill="#54c4da" stroke="#355c70" stroke-width="4"/><path d="M-17,0h34M0,-17v34" stroke="#dbf9ff" stroke-width="4"/><path d="M0,0l17,-17" stroke="#795635" stroke-width="7"/><circle cx="17" cy="-17" r="8" fill="#ffd564"/></g>`,'Lower the prepared bridge');
 }
 if(s.choice==='raft'||!s.choice){a+=`<g transform="translate(${cx},${deck})">${plank(-45,0,100)}<path d="M-30,3v25M30,3v25" stroke="#dfc596" stroke-width="5"/></g>`;
  if(s.choice==='raft'&&!s.finalPatched){a+=plank(645,310,70)+`<path d="M655,332v66M705,332v66" stroke="#92673d" stroke-width="6"/>`;a+=`<ellipse cx="${x+18}" cy="415" rx="15" ry="9" fill="#283d39" stroke="#dfb36f" stroke-width="3"/><path d="M${x+18},422q25,10 28,30" stroke="#c5f7ff" stroke-width="4" fill="none"/>`;a+=drag('finalPlug',cork(680,298),'Repair the raft leak',x-7,393,50,42);}else if(s.finalPatched)a+=cork(cx+18,415);
  if(s.choice==='raft'&&!s.prepared)a+=click('sail',`<path d="M${x-80},330v64" stroke="#815b38" stroke-width="8"/><path d="M${x-65},346C${x-100},315 ${x-107},373 ${x-65},346C${x-35},318 ${x-30},377 ${x-65},346L${x-35},398" stroke="#ddba7b" stroke-width="8" fill="none"/>`,'Untie the raft once Tortoise is aboard');
 }
 a+=`<text x="${x+110}" y="492" text-anchor="middle" class="station-label">CROSS TO THE FINISH GATE</text>`;
 return `<g data-machine="${i}">${a}</g>`;
}

function balanceArt(s,i,button,rock,plank){
 const x=s.x,angle=s.balanceTilt*Math.PI/180,px=x+60-100*Math.cos(angle),py=398-100*Math.sin(angle);
 const stone=(rx,ry,scale)=>`<g transform="translate(${rx},${ry}) scale(${scale})">${rock(0,0)}</g>`;
 let art=`<path d="M${x-40},388l-7,32 9,34 -8,34 6,32H${x+169}l-7,-34 8,-32 -7,-34 2,-32Z" fill="#268fbd" stroke="#28667e" stroke-width="4"/><path d="M${x-47},393l-6,38 9,33 -7,38M${x+169},393l7,38 -9,33 7,38" fill="none" stroke="#d1b17b" stroke-width="10"/><path d="M${x-21},457h53M${x+93},479h54M${x-18},501h63" stroke="#b4eff6" stroke-width="4" fill="none"/><path d="M${x+44},414v106h32V414" fill="#9b8e76" stroke="#635e50" stroke-width="4"/><path d="M${x+46},445h28M${x+46},480h28" stroke="#c8baa0" stroke-width="3"/><path d="M${x+42},425l18,-42 18,42Z" fill="#9c754e" stroke="#634a33" stroke-width="4"/><g transform="translate(${x+60},398) rotate(${s.balanceTilt})">${plank(-100,0,205)}</g><circle cx="${x+60}" cy="398" r="9" fill="#ffe095" stroke="#75502e" stroke-width="3"/><path d="M${px},${py-40}v40" stroke="#dfc596" stroke-width="5"/><ellipse cx="${px}" cy="${py-40}" rx="35" ry="12" fill="${s.balanceOverloaded?'#ef9a70':s.bigPlaced?'#a1d96e':'#ffd366'}" stroke="#805b36" stroke-width="4"/>`;
 if(s.smallPlaced){const shape=stone(px,py-56,.6);art+=!s.bigPlaced?button(s,i,'removeSmall',shape,'Take the small rock off the pan'):shape;}
 if(s.bigPlaced)art+=stone(px+(s.smallPlaced?12:0),py-66,1.2);
 if(!s.balanceOverloaded){for(const [part,placed,rx,scale]of [['small',s.smallPlaced,x+(s.bigLeft?260:200),.6],['large',s.bigPlaced,x+(s.bigLeft?200:260),1.2]])if(!placed){art+=`<rect class="drop-target" pointer-events="none" data-drop="${i}:${part}" x="${px-38}" y="${py-78}" width="76" height="55" rx="10"/>`+button(s,i,part,stone(rx,380,scale),'Place the '+part+' rock on the pan','draggable');}}
 art+=`<text x="${x+60}" y="489" text-anchor="middle" class="station-label">BALANCE THE BRIDGE</text>`;
 return `<g data-machine="${i}">${art}</g>`;
}

root.TortoiseRouteChallenges={raftArt(s,i,button,plank){if(!s.leaky)return '';const b=P.raftGeometry(s),hx=b.center+s.leakSide*18,hy=b.deck+17,patch=smooth(s.patchProgress),flow=1-patch;let a='';
 const cork=(x,y,scale=1)=>`<g transform="translate(${x},${y}) scale(${scale})"><path d="M-12,-1l3,16q9,7 18,0l3,-16" fill="#b87d3d" stroke="#79512f" stroke-width="3"/><ellipse cy="-1" rx="17" ry="10" fill="#f3c574" stroke="#79512f" stroke-width="3"/><path d="M-9,-4q8,-4 17,0M-7,1q7,4 14,0" stroke="#b88746" stroke-width="2" fill="none"/></g>`;
 if(!s.plugged){a+=plank(s.plugX-38,s.plugY+23,76)+`<path d="M${s.plugX-27},${s.plugY+45}V394M${s.plugX+27},${s.plugY+45}V394" stroke="#92673d" stroke-width="6"/>`;
  a+=`<ellipse cx="${hx}" cy="${hy}" rx="15" ry="10" fill="#273b38" stroke="#e1b16a" stroke-width="4"/>`;
  if(s.signals.length){a+=`<ellipse pointer-events="none" class="drop-target" data-drop="${i}:plug" cx="${hx}" cy="${hy}" rx="23" ry="20"/>`+button(s,i,'plug',cork(s.plugX,s.plugY,1.4),'Fit the round wooden plug into the leaking hole','draggable');}
  else a+=`<g opacity=".65" pointer-events="none">${cork(s.plugX,s.plugY,1.4)}</g>`;
 }else a+=cork(hx,hy-12*(1-patch));
 if(flow>.001){a+=`<path d="M${hx},${hy+3}q${18*s.leakSide},8 ${24*s.leakSide},29" fill="none" stroke="#b7f3ff" stroke-width="${4*flow}" opacity="${flow}"/>`;for(let n=0;n<5;n++){const f=(s.progress*3+(s.animationTime||0)*1.7+n/5)%1;a+=`<ellipse cx="${hx+s.leakSide*(18+f*15)}" cy="${hy+18+f*37}" rx="${3*(1-f)+1}" ry="4" fill="#d7faff" opacity="${flow*(1-f)}"/>`;}}
 return a;
}};
const clockStep=P.step;P.step=function(st,dt){if(st.status==='playing')for(const s of st.stations)if(s.leaky)s.animationTime=(s.animationTime||0)+Math.max(0,Math.min(.05,dt));clockStep(st,dt);};

// Present one clear action on the two new lessons; demonstrations remain on demand.
const A=root.TortoiseAdventure?.Adventure?.prototype;
if(A){const cueFor=A.cueFor,update=A.update,buildDemo=A.buildDemo;
 A.buildDemo=function(cue){return buildDemo.call(this,['brake','plug'].includes(cue.part)?{...cue,part:cue.part==='brake'?'stopper':'plank'}:cue);};
 A.cueFor=function(st){const cue=cueFor.call(this,st);if(!cue)return cue;const s=st.stations[cue.index];
  if(s?.riverGate&&!cue.watch){cue.title='1. Open the river gate';cue.text='Move the rock onto the yellow pan.';}
  if(cue.watch&&st.stations.some(s=>s.riverGate&&s.phase==='moving'))return{key:'river-gate-rising',title:'Watch the gate rise',text:'The rock pulls the gate up.',watch:true};
  if(s?.kind==='balance'&&!cue.watch){cue.title=cue.part==='removeSmall'?'Take the little rock off':'Balance the bridge';cue.text=cue.part==='removeSmall'?'Click the little rock on the pan.':'Can one rock make the bridge level?';}
  if(s?.kind==='cart'&&!cue.watch){cue.title=cue.part==='brake'?'1. Hold the cart':cue.part==='release'?'3. Send the cart':'2. Load a rock';}
  if(st.stations.some(s=>s.leaky&&s.plugged&&s.patchProgress<1))return{key:'plug-settling',title:'Watch the plug settle',text:'The water is stopping. Wait a moment.',watch:true};
  if(s?.leaky&&!cue.watch){if(cue.part==='plug')cue.title='2. Fix the leak';else if(cue.part==='sail'&&st.x<s.x-.01)return{key:'raft-boarding',title:'Let Tortoise climb aboard',text:'Wait until Tortoise is on the raft.',watch:true};else if(cue.part==='sail'){cue.title='3. Sail across';cue.text='Click the rope knot to sail.';}}
  return cue;
 };
 A.update=function(st,level,dt,read=false,force=false){if(st.status==='playing'&&st.stations.some(s=>s.kind==='cart'||s.leaky)){const cue=this.cueFor(st);if(cue&&!cue.watch){if(cue.key!==this.key){this.key=cue.key;this.demoStart=this.clock;this.demoForced=false;this.idleSince=this.clock;this.assistance=2;this.demonstrating=false;this.demo.innerHTML='';force=true;}else this.assistance=Math.max(2,this.assistance);}}
  return update.call(this,st,level,dt,read,force);
 };
}
})(window);
