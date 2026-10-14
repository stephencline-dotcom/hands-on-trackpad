/* Connected, authored woodland machines; shuffle layouts, never scatter parts. */
(function(root){
  'use strict';
  const titles=['Build a bridge','Lower a ramp','Open a gate','Ride a lift','Aim the stone','Make a log bridge','Float across the river','Stop the rolling boulder','Repair the broken bridge','Creek and gate','Ramp and lift','Log and stone','River and boulder','Lift the heavy gate','Make a chain reaction','The river trail','The safe crossing','The mountain trail'];
  const lessons=[['bridge'],['ramp'],['gate'],['lift'],['stone'],['log'],['raft'],['boulder'],['stones'],['bridge','gate'],['ramp','lift'],['log','stone'],['raft','boulder'],['gate','bridge'],['stone','log'],['boulder','raft'],['boulder','stones'],['gate','stone','bridge']];
  const bank=lessons.map((lesson,l)=>Array.from({length:6},(_,v)=>{
    const row=[...lesson];
    if(l===13)row[1]=v%2?'ramp':'bridge';
    if(l===14)row[1]=v%2?'lift':'log';
    if(l===15)row[0]=v%2?'stone':'boulder';
    if(l===16)row[0]=v%2?'gate':'boulder';
    if(l===17)row[2]=['bridge','raft','stones'][v%3];
    const links=[13,14,15,16].includes(l)?[[0,1]]:l===17?[[0,2],[1,2]]:[];
    const width=row.length===1?260:row.length===2?235:185;
    const first=row.length===1?370+v*12:row.length===2?220+v*5:195+v*4;
    const spacing=row.length===2?390:245;
    return {id:`river-${l+1}-${v+1}`,level:l+1,version:v+1,title:titles[l],support:l<9?'teach':l<13?'practice':'solve',links,
      stations:row.map((kind,j)=>({kind,routeChallenge:l===14&&kind==='stone',correctRoute:v%2?1:2,chuteOffset:l===14&&kind==='stone'?180:130,later:l>=9,layoutVariant:v,boardNear:l>=9&&v%2===1,logFirst:l>=9&&kind==='log'&&(v+j)%2?'near':'far',weightChoice:l===13&&v>=2,weightsNeeded:l===13&&kind==='gate'?(v>=2?2:v%2?3:2):1,x:first+spacing*j,width,side:(v+j)%2?-1:1,inputs:links.filter(a=>a[1]===j).map(a=>a[0]),outputs:links.filter(a=>a[0]===j).map(a=>a[1]),unlock:null}))};
  }));
  function create(p){const last=p.stations.at(-1);return {puzzle:p,x:55,goal:Math.min(935,last.x+last.width*.62+150),time:0,pending:[],status:'playing',message:'Follow the ropes. Prepare the machine before releasing its weight.',moves:0,attempts:0,stations:p.stations.map(s=>({...s,ready:false,prepared:false,weightsPlaced:[],partialGate:0,signals:[],phase:'waiting',progress:0,aligned:false,routeIndex:0,stoneMisfire:false,bellSwing:0,turnProgress:0,turning:false,first:false,firstProgress:0,logFailed:false,logWrong:'',logFall:0,boardShort:false,boardLong:false,hazardClock:0,hazardActive:s.kind==='boulder',hazardDuration:p.support==='practice'?9:8,hazardMissed:false,hazardFall:0,catchX:0,catchY:0,rockX:0,rockY:0}))};}
  function arm(s){s.prepared=true;s.phase=s.inputs.length?'armed':'moving';}
  function action(state,i,part){
    if(state.status!=='playing')return false;
    const s=state.stations[i];if(!s||s.ready||s.prepared||s.phase==='moving')return false;
    if(s.unlock!==null&&!state.stations[s.unlock].ready){state.message='The first machine must release this latch. Finish it first.';return false;}
    const triggering=(s.kind==='stone'&&part==='release')||(s.kind==='gate'&&/^weight/.test(part));
    if(triggering&&s.outputs.some(n=>!['raft','lift'].includes(state.stations[n].kind)&&!state.stations[n].prepared)){state.attempts++;const h=hint(state);state.status='failed';state.message=h?h.text:'Prepare the connected machine first.';return false;}
    const retry=(text,failed=true)=>{state.attempts++;state.message=text;if(failed)state.status='failed';return false;};let ok=true;
    switch(s.kind){
      case 'bridge':if(part==='plank')arm(s);else ok=false;break;
      case 'ramp':if(part==='good')arm(s);else if(part==='bad')return retry('That end needs to stay attached. Try the support under the high end.');else ok=false;break;
      case 'stone':if(part==='turn'){if(s.turning)return false;if(s.routeChallenge){s.routeIndex=(s.routeIndex+1)%3;s.aligned=s.routeIndex===s.correctRoute;}else s.aligned=!s.aligned;s.turning=true;}else if(part==='release'){if(s.turning){state.message='Watch the crank finish lowering the wooden chute.';return false;}if(!s.aligned&&!s.routeChallenge||s.routeChallenge&&s.routeIndex===0)return retry('The chute is pointing away from the pad. Turn it first, then try again.');s.phase='moving';s.prepared=true;s.rockX=chutePose(s).start;s.rockY=210;}else ok=false;break;
      case 'gate':if(/^weight[0-9]*$/.test(part)){const expected=weightParts(s);if(!expected.includes(part)||s.weightsPlaced.includes(part))return false;s.weightsPlaced.push(part);if(gateMass(s)>=s.weightsNeeded)arm(s);else state.message='The gate is still too low. Add another rock to lift it higher.';}else ok=false;break;
      case 'lift':if(part==='weight'){if(state.x<s.x-.01)return retry('The weight was dropped before Tortoise was aboard. Wait for him to step onto the lift first.');if(!s.inputs.every(n=>s.signals.includes(n)))return retry('Wait for the connected rope to release the lift’s latch.',false);s.prepared=true;s.phase='moving';}else ok=false;break;
      case 'raft':if(part==='sail'){if(state.x<s.x-.01){s.prepared=true;s.phase='adrift';return retry('The raft was released before Tortoise was aboard. Wait for him, then click its rope.');}if(!s.inputs.every(n=>s.signals.includes(n)))return retry('Wait for the connected rope to release the raft’s latch.',false);s.prepared=true;s.phase='moving';}else ok=false;break;
      case 'boulder':if(part==='stopper'){const pose=boulderPose(s);s.catchX=pose.x;s.catchY=pose.y;arm(s);}else if(part==='push')return retry('The moving boulder needs a stopper. Drag the wooden block onto the slope before it reaches the trail.');else ok=false;break;
      case 'stones':if(part==='wrongBoard')return retry('That board does not fit this gap. Use the short board for the small gap and the long board for the big gap.');else if(part==='boardShort'||part==='boardLong'){if(s[part])return false;s[part]=true;if(s.boardShort&&s.boardLong)arm(s);}else ok=false;break;
      case 'log':if(part==='near'||part==='far'){if(!s.first){if(part!==s.logFirst){s.logFailed=true;s.logWrong=part;return retry('That end fell into the creek. Release the rope above the catcher first.');}s.first=true;}else{if(part===s.logFirst)return false;if(s.firstProgress<1){state.message='Wait for that end to land on its catcher.';return false;}arm(s);}}else ok=false;break;
    }
    if(ok){state.moves++;if(s.phase==='armed')state.message='This part is ready. Now activate the switch connected to its rope.';else if(s.phase==='moving')state.message='Watch what the weight makes happen!';}
    return ok;
  }
  function step(state,dt){
    dt=Math.max(0,Math.min(dt,.05));
    if(state.status==='failed'){for(const s of state.stations){if(s.hazardMissed)s.hazardFall=Math.min(1,s.hazardFall+dt/.7);if(s.logFailed)s.logFall=Math.min(1,s.logFall+dt/.85);if(s.stoneMisfire)s.bellSwing+=dt;if(s.kind==='raft'&&s.phase==='adrift')s.progress=Math.min(1,s.progress+dt/3.4);}return;}
    if(state.status!=='playing')return;state.time+=dt;
    const delivered=state.pending.filter(e=>e.at<=state.time);state.pending=state.pending.filter(e=>e.at>state.time);for(const e of delivered)state.stations[e.target].signals.push(e.source);
    for(let i=0;i<state.stations.length;i++){
      const s=state.stations[i];
      if(s.kind==='boulder'&&!s.prepared){s.hazardActive=true;s.hazardClock+=dt;if(s.hazardClock>=s.hazardDuration){s.hazardClock=s.hazardDuration;s.hazardMissed=true;state.status='failed';state.message='The boulder reached the trail. Put the wooden stopper on the slope sooner.';return;}}
      if(s.kind==='gate'&&s.weightsNeeded>1&&s.weightsPlaced.length&&!s.prepared)s.partialGate=Math.min(.45,s.partialGate+dt/.8);
      if(s.kind==='log'&&s.first&&s.firstProgress<1)s.firstProgress=Math.min(1,s.firstProgress+dt/.8);
      if(s.turning){const target=turnFraction(s),difference=target-s.turnProgress;if(Math.abs(difference)<=dt/.7+.00001){s.turnProgress=target;s.turning=false;}else s.turnProgress+=Math.sign(difference)*dt/.7;}
      if(s.phase==='armed'&&s.inputs.every(n=>s.signals.includes(n))&&(!['lift','raft'].includes(s.kind)||state.x>=s.x-1))s.phase='moving';
      if(s.phase!=='moving')continue;
      s.progress=Math.min(1,s.progress+dt/(s.kind==='stone'?2.85:s.kind==='raft'?3.4:s.kind==='lift'?1.3:1.05));
      if(s.kind==='stone'){
        const t=Math.min(1,s.progress*2.85/1.8),start=chutePose(s).start,target=stoneTarget(s,s.routeChallenge?s.routeIndex:2),end=target.x;
        const roll=Math.max(0,Math.min(1,(t-.12)/.76)),fall=Math.max(0,(t-.88)/.12);
        const chuteEnd=s.routeChallenge?target.chuteY:s.aligned?327:263;
        s.rockX=start+(end-start)*roll+(s.aligned?0:50*s.side*fall);
        s.rockY=t<.12?210+8*(t/.12):218+(chuteEnd-240)*roll+(s.aligned?13:134)*fall;
        if(t===1&&!s.aligned){s.stoneMisfire=true;state.status='failed';state.attempts++;state.message='That switch rang the bell and woke Hare. Follow the rope to the gate’s switch instead.';return;}
      }
      if(s.progress===1){
        s.ready=true;s.phase='ready';
        for(const n of s.outputs){const target=state.stations[n];if(s.kind!=='boulder'&&!['raft','lift'].includes(target.kind)&&!target.prepared){state.attempts++;state.message='Prepare the connected machine first.';continue;}state.pending.push({source:i,target:n,at:state.time+.75});}
        if(s.outputs.length)state.message='The switch pulled its rope. Your machine is working!';
      }
    }
    const ferry=state.stations.find(s=>s.kind==='raft'&&s.prepared&&state.x>=s.x-1&&state.x<raftGeometry(s).end);
    if(ferry)state.x=raftGeometry(ferry).center;
    else{
      const blocked=state.stations.find(s=>!s.ready&&!(s.kind==='boulder'&&s.prepared)&&state.x<=s.x+1);
      if(blocked?.kind==='boulder'){
        // Tortoise advances toward the danger for the entire countdown, rather than parking beside it.
        const limit=blocked.x-95,remaining=Math.max(0,blocked.hazardDuration-blocked.hazardClock);
        state.x+=Math.max(0,limit-state.x)*Math.min(1,dt/Math.max(dt,remaining+dt));
      }else{
        const waitingX=blocked?(['lift','raft'].includes(blocked.kind)?blocked.x:blocked.x-150):state.goal;
        state.x=Math.max(state.x,Math.min(waitingX,state.x+dt*145));
      }
    }
    if(state.x>=state.goal){state.status='won';state.message='Your whole machine worked. Slow and steady wins the race!';}
  }
  function surfaceY(state,x=state.x){
    for(const s of state.stations){
      if(s.kind==='raft'){const boat=raftGeometry(s);if(x>=boat.center-45&&x<=boat.center+55)return boat.deck-7;}
      if(s.kind!=='lift')continue;
      if(x>=s.x-35&&x<=s.x+55)return 391-90*s.progress;
      const end=s.x+s.width*.62+72;
      if(s.ready&&x>s.x+55&&x<end)return 301+90*(x-s.x-55)/(end-s.x-55);
    }
    return 391;
  }
  function surfacePose(state){
    let radians=0;
    for(let i=0;i<6;i++){
      const cosine=Math.cos(radians),rear=surfaceY(state,state.x-22*cosine)+7,front=surfaceY(state,state.x+18*cosine)+7;
      radians=Math.atan2(front-rear,40*cosine);
    }
    const rear=surfaceY(state,state.x-22*Math.cos(radians))+7;
    return {y:rear+22*Math.sin(radians)-7,angle:radians*180/Math.PI};
  }
  function hint(state){
    const urgent=state.stations.findIndex(s=>s.kind==='boulder'&&!s.prepared);if(urgent>=0)return{index:urgent,part:'stopper',text:'Stop the rolling boulder first. Drag the wooden stopper onto the slope.'};
    if(state.stations.some(s=>s.kind==='log'&&s.first&&s.firstProgress<1)){state.message='Watch the supported end land on the catcher.';return null;}
    if(state.stations.some(s=>s.turning)){state.message='Watch the crank lower the wooden chute.';return null;}
    let i=state.stations.findIndex(s=>!['raft','lift'].includes(s.kind)&&s.inputs.length&&!s.prepared&&(s.unlock===null||state.stations[s.unlock].ready));
    if(i<0)i=state.stations.findIndex(s=>!s.ready&&s.phase==='waiting'&&(s.unlock===null||state.stations[s.unlock].ready));
    if(i<0){state.message='Watch your machine work. Tortoise will climb onto the lift.';return null;}
    const s=state.stations[i];const tips={bridge:['plank','First, drag the plank into the hanging bridge holder.'],ramp:['good','Click the support under the HIGH end of the ramp.'],stone:s.aligned?['release','Now click the yellow stopper beneath the stone.']:['turn',s.routeChallenge?'Turn the crank toward the switch connected to the gate. Avoid the bell’s switch.':'Click the blue crank to lower the wooden chute toward the round switch.'],gate:[weightParts(s).find(part=>!s.weightsPlaced.includes(part)),s.weightsPlaced.length?'The gate is still too low. Add another rock to lift it fully.':'Drag a rock onto the round yellow pad.'],lift:['weight',state.x<s.x-.01?'Wait for Tortoise to climb aboard.':'Drag the stone into the lift basket.'],raft:['sail',state.x<s.x-.01?'Wait for Tortoise to climb aboard.':'Click the knotted rope to release the raft.'],boulder:['stopper','Drag the wooden stopper onto the slope before the boulder reaches the trail.'],stones:!s.boardShort?['boardShort','Drag the short board into the small gap.']:['boardLong','Drag the long board into the big gap.'],log:s.first?[s.logFirst==='far'?'near':'far','That end is supported. Release the other rope to complete the bridge.']:[s.logFirst,'Release the rope above the catcher so that end lands safely.']};return {index:i,part:tips[s.kind][0],text:tips[s.kind][1]};
  }
  function bridgeGaps(s){
    const w=s.width*.62,ratio=s.later?[.28,.22,.33][s.layoutVariant%3]:.28,short=w*ratio,long=w*(.78-ratio),left=s.x+12;
    return s.side===1?{boardShort:{x:left,width:short},boardLong:{x:left+short+20,width:long}}:{boardLong:{x:left,width:long},boardShort:{x:left+long+20,width:short}};
  }
  function raftGeometry(s){
    const left=s.x-50,right=Math.min(925,s.x+s.width*.62+125),end=right-60;
    const t=s.progress,ease=t*t*(3-2*t),center=s.x+(end-s.x)*ease;
    const bob=Math.sin(t*Math.PI*4)*Math.sin(t*Math.PI)*2;
    return{left,right,end,center,deck:398+bob};
  }
  function boardPile(s){return {x:s.boardNear?s.x-70:s.x+s.width*.62+66,y:s.boardNear?403:379};}
  function gateOpening(s){return s.ready?1:s.partialGate+(1-s.partialGate)*s.progress;}
  function weightParts(s){return s.weightsNeeded===1?['weight']:Array.from({length:s.weightsNeeded+(s.weightChoice?1:0)},(_,n)=>'weight'+(n+1));}
  function gateMass(s){return s.weightsPlaced.reduce((sum,part)=>sum+weightMass(s,part),0);}
  function weightMass(s,part){return s.weightChoice&&part==='weight'+(s.side===1?1:s.weightsNeeded+1)?s.weightsNeeded:1;}
  function logPose(s){
    const length=s.width*.62+25,right=s.x+s.width*.62+28;
    if(s.logFirst==='near'){
      const anchor=s.x+3,catchX=right-Math.sqrt(length*length-121*121);
      let nearY=277+121*s.firstProgress,farY=277+121*s.progress;
      if(s.logFailed){nearY=277;farY=277+length*.86*s.logFall;}
      const dy=farY-nearY,span=Math.sqrt(Math.max(0,length*length-dy*dy));
      const nearX=s.first?catchX:anchor;
      const x=s.first&&s.firstProgress<1?right-span:nearX;
      return{x,y:nearY,right:x+span,farY,length,angle:Math.atan2(dy,span)*180/Math.PI,catchX};
    }
    let nearY=277+121*s.progress,farY=277+121*s.firstProgress;
    if(s.logFailed){farY=277;nearY=277+length*.86*s.logFall;}
    const dy=farY-nearY,span=Math.sqrt(Math.max(0,length*length-dy*dy));
    return{x:right-span,y:nearY,right,farY,length,angle:Math.atan2(dy,span)*180/Math.PI,catchX:right};
  }
  function boulderPose(s){
    const f=Math.min(1,s.hazardClock/s.hazardDuration),w=s.width*.62;
    let x=s.x+w+85+(147-w-85)*f,y=210+53*f;
    if(s.prepared){x=s.catchX+(s.x+147-s.catchX)*s.progress;y=s.catchY+(263-s.catchY)*s.progress;}
    if(s.hazardMissed){x=s.x+147-127*s.hazardFall;y=263+98*s.hazardFall;}
    return {x,y,angle:-220*(f+s.progress+s.hazardFall),fraction:f};
  }
  function turnFraction(s){return s.routeChallenge?s.routeIndex===0?0:s.routeIndex===1?Math.asin(37/Math.hypot(84,87))/Math.atan2(87,84):1:s.aligned?1:0;}
  function stoneTarget(s,route=s.routeChallenge?s.correctRoute:2){
    const length=Math.hypot(84,87),angle=route===0?0:route===1?Math.asin(37/length):Math.atan2(87,84),start=s.x+(s.chuteOffset||130)-42*s.side;
    return{x:start+length*Math.cos(angle)*s.side,chuteY:240+length*Math.sin(angle),y:253+length*Math.sin(angle)};
  }
  function chutePose(s){
    const length=Math.hypot(84,87),angle=Math.atan2(87,84)*s.turnProgress;
    const start=s.x+(s.chuteOffset||130)-42*s.side;
    return {start,length,angle:angle*180/Math.PI*s.side,endX:start+length*Math.cos(angle)*s.side,endY:240+length*Math.sin(angle)};
  }
  function finalePose(t){
    const tortoiseX=Math.min(890,480+90*t);
    const hareX=t<.65?170:t<1.15?170+(t-.65)/.5*50:Math.min(850,220+(t-1.15)*180);
    const hareY=t<.65?295:t<1.15?295+(t-.65)/.5*65-Math.sin((t-.65)/.5*Math.PI)*45:360-Math.abs(Math.sin((t-1.15)*18))*15;
    return{tortoiseX,hareX,hareY,crossed:tortoiseX>=790,done:t>=5.7};
  }
  const api={bank,create,action,step,hint,surfaceY,surfacePose,bridgeGaps,chutePose,boulderPose,logPose,gateOpening,gateMass,weightMass,weightParts,finalePose,boardPile,raftGeometry,stoneTarget,turnFraction};if(typeof module!=='undefined')module.exports=api;else root.TortoisePuzzles=api;
})(typeof window!=='undefined'?window:globalThis);