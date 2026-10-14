(() => {
  'use strict';
  const P=window.TortoisePuzzles, $=id=>document.getElementById(id);
  const svg=$('tortoiseArena'), world=$('mechanisms'), controls=$('puzzleControls'), turtle=$('tortoise'), banner=$('puzzleMessage');
  let state,level=0,last=0,resultShown=false,drag=null,started=false,sound=true,resumeStop=0,voiceInstructions=true,teacherVoice=true;
  let audio;
  const adventure=new window.TortoiseAdventure.Adventure(svg,{
    speak:speakDirection,autoSpeak:()=>started&&sound&&voiceInstructions&&!frozen(),dragging:()=>Boolean(drag),
    instruction:text=>{banner.textContent=text;},reward:()=>{tone(660);tone(830,.09);tone(990,.18);}
  });
  const frozen=()=>document.body.classList.contains('student-screen-frozen');
  const sceneSounds=new window.TortoiseSceneSounds(()=>started&&sound&&!frozen()&&!document.hidden);
  const handGuide=window.trackpadGuide?.create?.({
    scene:$('tortoiseTrackpadScene'),leftHand:$('tortoiseTrackpadLeftHand'),rightHand:$('tortoiseTrackpadRightHand'),
    pressIndicator:$('tortoiseTrackpadPressIndicator'),pointerSpace:'viewport',togglePressIndicator:true,toggleScenePressedClass:true
  });
  document.addEventListener('pointermove',event=>{if(!frozen())handGuide?.updateFromPointerEvent(event);});
  document.addEventListener('pointerdown',event=>{if(frozen())return;handGuide?.updateFromPointerEvent(event);handGuide?.setPressed(true);});
  const releaseGuide=()=>handGuide?.setPressed(false);
  document.addEventListener('pointerup',releaseGuide);
  document.addEventListener('pointercancel',releaseGuide);
  window.addEventListener('blur',releaseGuide);

  function tone(freq=540,delay=0){
    if(!sound||frozen())return;
    try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=freq;const at=audio.currentTime+delay;g.gain.setValueAtTime(.045,at);g.gain.exponentialRampToValueAtTime(.001,at+.16);o.start(at);o.stop(at+.17);}catch{}
  }
  function choose(n){
    const key=`tortoisePuzzleBag-${P.journeyLength}-${n}`;let remaining=[];
    try{remaining=JSON.parse(localStorage.getItem(key)||'[]');}catch{}
    remaining=Array.isArray(remaining)?remaining.filter(id=>P.bank[n].some(p=>p.id===id)):[];
    if(!remaining.length){
      remaining=P.bank[n].map(p=>p.id);
      for(let i=remaining.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]];}
      try{const prev=localStorage.getItem(key+'-last');if(remaining.at(-1)===prev)[remaining[0],remaining[remaining.length-1]]=[remaining.at(-1),remaining[0]];}catch{}
    }
    const id=remaining.pop();try{localStorage.setItem(key,JSON.stringify(remaining));localStorage.setItem(key+'-last',id);}catch{}
    return P.bank[n].find(p=>p.id===id);
  }
  function load(n,puzzle){
    $('finaleScene').innerHTML='';$('finishFlag').setAttribute('visibility','visible');
    level=n;state=P.create(puzzle||choose(n));sceneSounds.reset(state);banner.dataset.lastMessage=state.message;resultShown=false;drag=null;results?.hide();$('startOverlay').hidden=true;started=true;
    $('tortoiseLevel').textContent=`${n+1} / ${P.bank.length}`;$('puzzleName').textContent=state.puzzle.title;
    banner.textContent=n<9?'Let’s learn one new way to help Tortoise!':'Look at the trail. What will help Tortoise cross?';
    try{localStorage.setItem(P.journeyProgressKey(),String(n));}catch{}
    adventure.reset(state,level);render();
  }
  const nextEnabled=()=>level+1<P.bank.length?level+1:-1;
  const results=window.LevelResultController?new window.LevelResultController({
    host:$('resultHost'),pauseGame:()=>{},onNextLevel:()=>load(nextEnabled()),onRetry:()=>load(level,state.puzzle),onPlayAgain:()=>load(0),onHome:()=>location.href='../../index.html',canPlaySound:()=>sound&&!frozen()
  }):null;
  function button(s,i,part,shape,label,extra=''){
    return `<g class="puzzle-action ${extra}" data-i="${i}" data-part="${part}" role="button" tabindex="0" aria-label="${label}"><title>${label}</title>${shape}</g>`;
  }
  const rock=(x,y)=>`<path d="M${x-22},${y+13} L${x-25},${y-7} L${x-9},${y-25} L${x+14},${y-21} L${x+27},${y-3} L${x+20},${y+15} Z" fill="#7f96a6" stroke="#334e60" stroke-width="4"/><path d="M${x-12},${y-15} l15,-2" stroke="#cbdde5" stroke-width="5" stroke-linecap="round"/>`;
  const plank=(x,y,w=100)=>`<g><rect x="${x}" y="${y+5}" width="${w}" height="22" rx="7" fill="#8b522e"/><rect x="${x}" y="${y}" width="${w}" height="22" rx="7" fill="#e4b15f" stroke="#82512f" stroke-width="4"/><path d="M${x+10},${y+7}h${w-20}M${x+15},${y+15}h${w-30}" stroke="#ffe19b" stroke-width="3"/><circle cx="${x+10}" cy="${y+13}" r="2" fill="#776a56"/><circle cx="${x+w-10}" cy="${y+13}" r="2" fill="#776a56"/></g>`;
  const switchArt=(x,y,on)=>`<g><ellipse cx="${x}" cy="${y+5}" rx="30" ry="14" fill="#935d32"/><ellipse cx="${x}" cy="${y}" rx="29" ry="13" fill="${on?'#88dc70':'#ffcd4d'}" stroke="#6c5831" stroke-width="4"/><path d="M${x-9},${y-4}l9,8 9,-8" stroke="${on?'#3b8745':'#bb812d'}" stroke-width="3" fill="none"/><path d="M${x-17},${y-7}q9,-5 18,-4" stroke="#fff2b1" stroke-width="3" fill="none"/></g>`;
  const gateArt=(x,a)=>`<g><path d="M${x-6},398h79v7h-79Z" fill="#c9a16b"/><path d="M${x-6},398h79" stroke="#f2d394" stroke-width="3"/><path d="M${x-6},395V287h79v108" fill="none" stroke="#986339" stroke-width="9"/><g transform="translate(0 ${-110*a})"><rect x="${x+2}" y="315" width="58" height="78" rx="5" fill="#df9160" stroke="#885335" stroke-width="4"/><path d="M${x+5},335h52M${x+5},357h52M${x+5},379h52" stroke="#f5bd83" stroke-width="7"/><path d="M${x+6},318l50,70" stroke="#9a5735" stroke-width="7"/><circle cx="${x+32}" cy="350" r="15" fill="${a>.95?'#d4f0a8':'#ffe7a4'}" stroke="#c87c40" stroke-width="3"/><path d="${a>.95?`M${x+23},350l6,7 14,-15`:`M${x+25},343l14,14M${x+39},343l-14,14`}" fill="none" stroke="${a>.95?'#428545':'#cc6548'}" stroke-width="4"/></g></g>`;
  function doorwayFront(){
    return state.stations.filter(s=>s.kind==='gate'||s.kind==='stone'||s.kind==='repairChute').map(s=>{
      const x=s.kind==='gate'?s.x+2:s.kind==='repairChute'?s.x-10:s.x-20;
      // The rear frame sits behind Tortoise; this near jamb occludes him as he passes through.
      return `<g data-doorway-front="true"><path d="M${x+67},287l12,-6v116l-12,8Z" fill="#80532e" stroke="#674328" stroke-width="2"/><path d="M${x+67},287h8v115h-8Z" fill="#ba854d"/><path d="M${x-6},287l8,-6h77l-12,6Z" fill="#dfb57b" stroke="#80532e" stroke-width="2"/><path d="M${x-6},287h81v9H${x-6}Z" fill="#b58148"/><path d="M${x+64},402h18v5h-18Z" fill="#674328"/></g>`;
    }).join('');
  }
  const logArt=(x,y,w)=>`<g><rect x="${x}" y="${y+3}" width="${w}" height="25" rx="10" fill="#a46a38" stroke="#674527" stroke-width="3"/><path d="M${x+12},${y+8}h${w-24}M${x+18},${y+18}h${w-32}" stroke="#d29a57" stroke-width="4"/><ellipse cx="${x+4}" cy="${y+15}" rx="8" ry="13" fill="#efc77d" stroke="#795330" stroke-width="3"/><ellipse cx="${x+4}" cy="${y+15}" rx="4" ry="8" fill="none" stroke="#c4914c" stroke-width="2"/><path d="M${x+40},${y+13}q12,-5 17,0q-5,7 -17,0" fill="none" stroke="#795330" stroke-width="2"/></g>`;
  function trailArt(){
    let art='';let start=0;
    for(const s of state.stations){
      if(['bridge','log','ramp','lift','raft','stones'].includes(s.kind)){
        const boat=s.kind==='raft'?P.raftGeometry(s):null;
        const left=boat?boat.left-50:s.kind==='lift'?s.x-35:s.x+12,right=boat?boat.right+55:s.x+s.width*.62+(s.kind==='lift'?72:15);
        art+=`<path d="M${start},397H${left}" stroke="#e4bd7c" stroke-width="17"/>`;start=right;
      }
    }
    art+=`<path d="M${start},397H1000" stroke="#e4bd7c" stroke-width="17"/>`;
    return art;
  }
  function connections(){
    let art=state.puzzle.links.map(([from,to],n)=>{
      const a=state.stations[from],b=state.stations[to];
      const ax=a.kind==='stone'?P.stoneTarget(a).x:a.kind==='boulder'?a.x+85:a.x+a.width*.62;
      const ay=a.kind==='stone'?P.stoneTarget(a).y:a.kind==='boulder'?384:386,bx=b.kind==='raft'?b.x-84:b.x+b.width*.31,by=b.kind==='raft'?330:195;
      const top=180-n*12,color=window.TortoiseAdventure.colors[n%4];
      return `<path d="M${ax},${ay}V${top+15} Q${ax},${top} ${ax+15},${top} H${bx-15} Q${bx},${top} ${bx},${top+15}V${by}" fill="none" stroke="#62492f" stroke-width="8"/><path class="signal-rope ${a.ready?'rope-active':''}" data-signal-from="${from}" data-signal-to="${to}" d="M${ax},${ay}V${top+15} Q${ax},${top} ${ax+15},${top} H${bx-15} Q${bx},${top} ${bx},${top+15}V${by}" fill="none" stroke="${color}" stroke-width="5"/><circle cx="${ax}" cy="${top+9}" r="10" fill="#c29454" stroke="#634629" stroke-width="3"/>`;
    }).join('');
    for(const s of state.stations){
      if(s.unlock===null)continue;const prev=state.stations[s.unlock],ax=prev.x+prev.width*.31;
      art+=`<path d="M${ax},310V165H${s.x}V170" fill="none" stroke="#62492f" stroke-width="7"/><path d="M${ax},310V165H${s.x}V170" fill="none" stroke="${prev.ready?'#88e191':'#f0d6a3'}" stroke-width="3"/>`;
    }
    return art;
  }
  function station(s,i){
    const special=window.TortoiseLateChallenges.render(s,i,button,rock,plank,gateArt);if(special)return special;
    const x=s.x,w=s.width*.62,a=s.ready?1:s.progress;let art='';
    if(['bridge','log'].includes(s.kind))art+=`<path d="M${x+12},399Q${x+6},435 ${x+14},468L${x+8},520H${x+w+22}L${x+w+14},465Q${x+w+22},428 ${x+w+12},399Z" fill="#48bce1" stroke="#357e9d" stroke-width="4"/><path class="water-shimmer" d="M${x+24},422h${w-25}M${x+19},456h${w-20}M${x+27},491h${w-28}" stroke="#c7f5ff" stroke-width="4" fill="none"/><path d="M${x+11},398h${w+2}" stroke="#a0d968" stroke-width="7"/>`;
    if(s.kind==='bridge'){
      if(!s.ready)art+=`<path d="M${x+3},334v21h10M${x+w+28},334v21h-10" stroke="#b79a64" stroke-width="5" fill="none"/>`;
      if(!s.prepared)art+=`<path d="M${x+12},392V286M${x+w-3},392V286" stroke="#87603f" stroke-width="9"/><path d="M${x+2},288h${w+12}" stroke="#62432d" stroke-width="9"/>`;
      if(s.ready||s.phase==='moving'||s.prepared)art+=plank(x+3,335+63*a,w+25);
      else{art+=`<rect class="drop-target" data-drop="${i}:plank" x="${x+2}" y="325" width="${w+28}" height="42" rx="7"/>`;art+=button(s,i,'plank',plank(x+3,265,w+25),'Drag plank across the creek','draggable');}
    }
    if(s.kind==='ramp'){
      const tip=352+46*a;
      art+=`<path d="M${x+14},399L${x+24},450H${x+w+5}L${x+w+16},399Z" fill="#70533d" stroke="#4e4030" stroke-width="3"/><path d="M${x+23},439l13,-17 16,16 19,-22 19,22 11,-15 16,16" fill="#a29176" stroke="#796b53" stroke-width="3"/>`;
      art+=`<path d="M${x+3},398L${x+w+25},${tip}v23L${x+3},421Z" fill="#b57b3d" stroke="#714b2b" stroke-width="4"/><path d="M${x+9},402L${x+w+18},${tip+5}" stroke="#f4ce86" stroke-width="5"/>`;
      if(!s.ready&&s.phase==='waiting'){
        art+=button(s,i,'good',`<path d="M${x+w},359v34" stroke="#ffce52" stroke-width="16"/><circle cx="${x+w}" cy="375" r="26" fill="transparent"/>`,'Remove the high ramp support');
        art+=button(s,i,'bad',`<circle cx="${x+8}" cy="398" r="24" fill="transparent"/><circle cx="${x+8}" cy="398" r="11" fill="#ffce52" stroke="#8b642f" stroke-width="3"/>`,'Remove the low ramp support');
      }
    }
    if(s.kind==='stone'){
      const pivot=x+(s.chuteOffset||130),start=pivot-42*s.side,target=P.stoneTarget(s),end=target.x,chute=P.chutePose(s);
      const crank=()=>`<g><path d="M${start},240v46" stroke="#5a6863" stroke-width="8"/><path d="M${start-2},246v33" stroke="#adb7a4" stroke-width="3"/><circle cx="${start}" cy="286" r="29" fill="#9b7946" stroke="#5e5337" stroke-width="4"/><g transform="translate(${start},286) rotate(${s.side*90*s.turnProgress})"><circle r="24" fill="#57c4d9" stroke="#264e66" stroke-width="3"/><path d="M-18,0h36M0,-18v36" stroke="#b6edf2" stroke-width="4"/><path d="M0,0L${s.side*16},-16" stroke="#725233" stroke-width="7" stroke-linecap="round"/><circle r="6" fill="#e3ba6f" stroke="#725233" stroke-width="2"/><circle cx="${s.side*16}" cy="-16" r="8" fill="#ffd259" stroke="#976b32" stroke-width="3"/></g></g>`;
      art+=`<path d="M${start-15},370V238h30v132" fill="#a37950" stroke="#654021" stroke-width="4"/><path d="M${start-19},238h38" stroke="#68482c" stroke-width="9"/>`;
      art+=`<g data-chute="true" transform="translate(${start},240) rotate(${chute.angle})"><path d="M0,0H${s.side*chute.length}" stroke="#835432" stroke-width="14"/><path d="M0,-3H${s.side*chute.length}" stroke="#dcb078" stroke-width="4"/></g><circle cx="${start}" cy="240" r="9" fill="#d2a25f" stroke="#78532d" stroke-width="3"/>`+gateArt(x-20,Math.max(0,(a-1.8/2.85)/(1-1.8/2.85)));
      const opening=Math.max(0,(a-1.8/2.85)/(1-1.8/2.85));
      art+=`<path d="M${end},${target.y}V190H${x+12}V${315-110*opening}" fill="none" stroke="#dfc69a" stroke-width="4"/><circle cx="${x+12}" cy="190" r="9" fill="#c29454" stroke="#634629" stroke-width="3"/>`;
      art+=`<path d="M${end},${target.y+9}v21" stroke="#80613e" stroke-width="12"/>`+switchArt(end,target.y,s.aligned&&a>=1.8/2.85);
      if(s.routeChallenge){
        const wrong=P.stoneTarget(s,s.correctRoute===1?2:1),bellX=wrong.x+s.side*42,angle=s.stoneMisfire?Math.sin(s.bellSwing*24)*18:0;
        art+=`<path d="M${wrong.x},${wrong.y}V220H${bellX}" fill="none" stroke="${s.stoneMisfire?'#e8a260':'#dcb991'}" stroke-width="4"/><path d="M${wrong.x},${wrong.y+9}v20" stroke="#80613e" stroke-width="8"/>`+switchArt(wrong.x,wrong.y,s.stoneMisfire);
        art+=`<g transform="rotate(${angle} ${bellX} 220)"><path d="M${bellX},220v9" stroke="#735238" stroke-width="4"/><path d="M${bellX-16},254q4,-12 4,-17q12,-16 24,0q0,5 4,17Z" fill="#e8b64c" stroke="#916b32" stroke-width="3"/><circle cx="${bellX}" cy="259" r="5" fill="#795438"/><path d="M${bellX-19},255h38" stroke="#916b32" stroke-width="3"/></g>`;
      }
      if(!s.ready&&s.phase==='waiting'){
        art+=button(s,i,'turn',crank(),'Turn the blue crank to lower the wooden chute');
        art+=button(s,i,'release',rock(start,210)+`<rect x="${start-23}" y="226" width="46" height="13" rx="4" fill="#ffce52"/>`,'Release stone');
      }else art+=crank()+`<g transform="rotate(${Math.min(1,s.progress*2.85/1.8)*160} ${s.rockX} ${s.rockY})">${rock(s.rockX,s.rockY)}</g>`;
    }
    if(s.kind==='gate'){
      const opening=P.gateOpening(s);
      art+=`<path d="M${x+w},386V258H${x+34}V${315-110*opening}" fill="none" stroke="#dfc69a" stroke-width="4"/><circle cx="${x+34}" cy="258" r="9" fill="#c29454" stroke="#634629" stroke-width="3"/>`+gateArt(x+2,opening);
      if(s.weightsNeeded>1)art+=`<g transform="translate(0 ${-110*opening})"><path d="M${x+8},332h50M${x+8},371h50" stroke="#66746c" stroke-width="9"/><circle cx="${x+13}" cy="332" r="2.5" fill="#e0d5aa"/><circle cx="${x+53}" cy="332" r="2.5" fill="#e0d5aa"/><circle cx="${x+13}" cy="371" r="2.5" fill="#e0d5aa"/><circle cx="${x+53}" cy="371" r="2.5" fill="#e0d5aa"/></g>`;
      art+=switchArt(x+w,386,s.prepared);
      const parts=P.weightParts(s);
      for(const [n,part]of parts.entries()){
        const size=P.weightMass(s,part)>1?1.4:1,looseX=s.reuseRock?s.reuseFrom:x+w+55+n*58;const stoneAt=(rx,ry)=>`<g transform="translate(${rx},${ry}) scale(${size})">${rock(0,0)}</g>`;
        if(s.weightsPlaced.includes(part))art+=stoneAt(x+w+(s.weightsNeeded>1?(n%2?12:-12):0),370-Math.floor(n/2)*32);
        else if(!s.prepared&&(!s.reuseRock||state.stations[0].ready)){art+=`<rect class="drop-target" data-drop="${i}:${part}" x="${x+w-31}" y="340" width="62" height="56" rx="12"/>`;art+=button(s,i,part,stoneAt(looseX,s.reuseRock?380:370),'Drag this rock onto the counterweight pad','draggable');}else if(!s.reuseRock||state.stations[0].ready)art+=stoneAt(looseX,s.reuseRock?380:370);
      }
      if(s.weightsNeeded>1)art+=`<g>${Array.from({length:s.weightsNeeded},(_,n)=>`<circle cx="${x+12+n*18}" cy="275" r="6" fill="${P.gateMass(s)>n?'#92d572':'#fff0ba'}" stroke="#775633" stroke-width="2"/>`).join('')}</g>`;
    }
    if(s.kind==='lift'){
      const deck=398-90*a,bucket=292+90*a,end=x+w+72;
      art+=`<path d="M${x-45},398V205H${x+w}" fill="none" stroke="#7c593c" stroke-width="11"/><path d="M${x-39},388V212H${x+w-10}" fill="none" stroke="#d6a568" stroke-width="3"/><circle cx="${x+w}" cy="207" r="17" fill="#d4a56b" stroke="#654021" stroke-width="4"/>`;
      art+=`<path d="M${x-27},211V${deck}M${x+43},211V${deck}M${x+w},224V${bucket}" stroke="#dfc69a" stroke-width="4"/>`;
      art+=`<path d="M${x+55},308L${end},398v22L${x+55},330Z" fill="#b57b3d" stroke="#704a2b" stroke-width="4"/><path d="M${x+57},312L${end-3},402" stroke="#f1c47c" stroke-width="4"/><path d="M${x+62},334v64M${end-10},414v15" stroke="#87623d" stroke-width="7"/>`;
      art+=`<path d="M${x+w-25},399v35h50v-35" fill="#655039" stroke="#8c714d" stroke-width="3"/>`;
      art+=plank(x-35,deck,90)+`<path d="M${x+w-25},${bucket}h50l-6,34h-38z" fill="#c5884f" stroke="#654021" stroke-width="4"/><path d="M${x+w-18},${bucket+10}h36M${x+w-14},${bucket+22}h28" stroke="#e2b975" stroke-width="3"/>`;
      if(!s.ready&&s.phase==='waiting'){
        art+=`<rect class="drop-target" data-drop="${i}:weight" x="${x+w-30}" y="280" width="60" height="56" rx="12"/>`;
        art+=button(s,i,'weight',rock(x+w+55,370),'Drag stone into lift basket','draggable');
      }else art+=rock(x+w,bucket+14);
    }
    if(s.kind==='log'){
      const pose=P.logPose(s),landed=s.firstProgress===1,catchX=pose.catchX;
      art+=`<path d="M${x-10},393V192h${w+40}v201" fill="none" stroke="#87603f" stroke-width="9"/><path d="M${x+13},192v23M${x+w+9},192v23" stroke="#dec495" stroke-width="5"/>`;
      art+=`<path d="M${catchX-18},399v51h32v-51" fill="#9a754a" stroke="#664d31" stroke-width="4"/><path d="M${catchX-21},398h38v13h-38Z" fill="${landed?'#a2d373':'#e4c17c'}" stroke="#73532e" stroke-width="3"/><path d="M${catchX+15},385v13" stroke="#73532e" stroke-width="5"/>`;
      if(s.logFirst==='near')art+=plank(x-14,398,catchX-x+14);
      art+=`<g transform="translate(${pose.x},${pose.y}) rotate(${pose.angle})">${logArt(0,0,pose.length)}</g>`;
      if(!s.ready&&s.phase==='waiting'){
        if((!s.first||s.logFirst!=='near')&&s.logWrong!=='near')art+=button(s,i,'near',`<path d="M${x+13},215L${pose.x+10},${pose.y}" stroke="#ffce52" stroke-width="8"/><circle cx="${x+13}" cy="240" r="26" fill="transparent"/>`,'Release near rope');
        else art+=`<path d="M${x+13},215v20" stroke="#dfc69a" stroke-width="4"/>`;
        if((!s.first||s.logFirst!=='far')&&s.logWrong!=='far')art+=button(s,i,'far',`<path d="M${x+w+9},215L${pose.right-15},${pose.farY}" stroke="#ffce52" stroke-width="8"/><circle cx="${x+w+9}" cy="240" r="26" fill="transparent"/>`,'Release far rope');
        else art+=`<path d="M${x+w+9},215v20" stroke="#dfc69a" stroke-width="4"/>`;
      }
      if(landed&&!s.ready)art+=`<path d="M${catchX-8},430l7,7 14,-15" fill="none" stroke="#436f42" stroke-width="4"/>`;
      if(s.logFailed&&s.logFall>.65)art+=`<path d="M${pose.x-22},427q12,-12 25,0q12,12 25,0M${pose.x-8},441q12,-10 25,0" fill="none" stroke="#d5f8ff" stroke-width="5"/>`;
    }
    if(['raft','stones'].includes(s.kind)){
      const river=s.kind==='raft'?P.raftGeometry(s):{left:x+12,right:x+w+15},rw=river.right-river.left;
      art+=`<path d="M${river.left},387Q${river.left-9},443 ${river.left+4},490L${river.left-2},520H${river.right+11}L${river.right},488Q${river.right+15},442 ${river.right},387Z" fill="#268fbd" stroke="#296a83" stroke-width="4"/><path class="water-shimmer" d="M${river.left+12},431h${rw-24}M${river.left+20},464h${rw-42}M${river.left+15},496h${rw-32}" fill="none" stroke="#a3ecf5" stroke-width="5"/><path d="M${river.left+20},449l9,-5 -3,9M${river.right-20},483l9,-5 -3,9" fill="none" stroke="#d6f9ff" stroke-width="3"/>`;
    }
    if(s.kind==='raft'){
      const boat=P.raftGeometry(s),cx=boat.center,deck=boat.deck;
      art+=plank(boat.left-50,398,55)+plank(boat.right-5,398,60)+`<path d="M${boat.left-40},421v30M${boat.left-3},421v30M${boat.right+5},421v30M${boat.right+45},421v30" stroke="#8d613b" stroke-width="7"/>`;
      art+=`<g transform="translate(${cx},${deck})">${[-1,0,1].map((n)=>logArt(-45,n*6+3,100)).join('')}<path d="M-25,-2v40M25,-2v40" stroke="#f4d89c" stroke-width="4"/><path d="M-33,-4v-48l25,-2" fill="none" stroke="#875b36" stroke-width="5"/><path d="M-29,-51h24l-7,15h-17Z" fill="#ffcd5e" stroke="#ae7936" stroke-width="2"/></g>`;
      art+=`<path d="M${x-84},326v68" stroke="#875b36" stroke-width="9"/><path d="M${x-87},330v58" stroke="#c99a61" stroke-width="3"/>`;
      if(s.phase==='waiting'){
        const rope=`M${x-84},350Q${x-69},327 ${x-55},348Q${x-44},364 ${x-33},398`;
        const knot=`M${x-69},344C${x-95},317 ${x-96},359 ${x-69},344C${x-44},316 ${x-43},360 ${x-69},344M${x-72},346l-10,25M${x-65},346l11,24`;
        art+=button(s,i,'sail',`<path d="${rope}" fill="none" stroke="#65482d" stroke-width="11" stroke-linecap="round"/><path d="${rope}" fill="none" stroke="#cfa769" stroke-width="7" stroke-linecap="round"/><path d="${rope}" fill="none" stroke="#f5dcaa" stroke-width="4" stroke-dasharray="2 5"/><path d="${knot}" fill="none" stroke="#65482d" stroke-width="9" stroke-linecap="round"/><path d="${knot}" fill="none" stroke="#d8b37a" stroke-width="6" stroke-linecap="round"/><path d="${knot}" fill="none" stroke="#fff0c9" stroke-width="3" stroke-dasharray="2 5"/><path d="M${x-75},339l12,10M${x-75},348l12,-10" stroke="#9c7545" stroke-width="5" stroke-linecap="round"/><path d="${rope}" fill="none" stroke="transparent" stroke-width="28"/>`,'Click the rope knot after Tortoise climbs aboard','rope-action');
      }else art+=`<path d="M${x-84},350q-5,12 4,28" fill="none" stroke="#f7ce64" stroke-width="5"/>`;
      if(s.ready)art+=`<path d="M${cx-60},425q-12,-18 -24,-3M${cx-78},445q-14,-10 -24,1" fill="none" stroke="#d3faff" stroke-width="4"/>`;
    }
    if(s.kind==='boulder'){
      const pose=P.boulderPose(s),f=pose.fraction;
      art+=`<path d="M${x+20},398L${x+147},300L${x+w+85},247L${x+w+106},247V375H${x+105}Z" fill="#ad916c" stroke="#7d694e" stroke-width="4"/><path d="M${x+20},398L${x+147},300L${x+w+85},247" fill="none" stroke="#e4cba5" stroke-width="7"/><path d="M${x+169},322l16,13 25,-8M${x+151},346l17,12 29,-10" fill="none" stroke="#816d52" stroke-width="3"/>`;
      if(s.logFirst==='near')art+=plank(x-14,398,catchX-x+14);
      art+=`<g transform="translate(${pose.x},${pose.y}) rotate(${pose.angle})"><circle r="37" fill="#899b9d" stroke="#3e5a62" stroke-width="4"/><path d="M-25,-16l17,-13 26,7M-21,17l12,8 25,-8" stroke="#c6d6d7" stroke-width="5" fill="none"/><path d="M-3,-33l-6,20 14,8 -9,24" fill="none" stroke="#526d75" stroke-width="3"/></g>`;
      if(s.reuseSource&&s.prepared&&!state.stations[1].weightsPlaced.length&&!s.ready){const t=s.progress;art+=rock(pose.x+(state.stations[1].reuseFrom-pose.x)*t,pose.y+(380-pose.y)*t-Math.sin(t*Math.PI)*35);}
      const stopper=(wx,wy)=>`<path d="M${wx},${wy-25}v50h-35Z" fill="#e0aa58" stroke="#80552e" stroke-width="4"/><path d="M${wx-8},${wy+13}h-16" stroke="#ffe19b" stroke-width="4"/>`;
      if(s.phase==='waiting'){
        art+=`<rect class="drop-target" data-drop="${i}:stopper" x="${x+71}" y="243" width="46" height="61" rx="6"/><ellipse cx="${x+w+57}" cy="411" rx="25" ry="6" fill="#6b5135" opacity=".25"/>`;
        art+=button(s,i,'stopper',stopper(x+w+75,382),'Drag the wooden stopper onto the slope before the boulder reaches the trail','draggable');
        art+=button(s,i,'push',`<circle cx="${pose.x}" cy="${pose.y}" r="34" fill="transparent"/>`,'Try pushing the moving boulder');
      }else art+=stopper(x+110,275);
      if(!s.ready)art+=`<text x="${x-15}" y="185" fill="#6b5234" font-size="12" font-weight="800">STOP THE ROCK</text><rect x="${x-15}" y="195" width="115" height="10" rx="5" fill="#6f785b"/><rect x="${x-15}" y="195" width="${115*(1-f)}" height="10" rx="5" fill="${f>.65?'#ef9860':'#ffda66'}"/>`;
      art+=`<path d="M${x-29},360l16,-28 16,28Z" fill="${s.ready?'#a6d975':'#ffcc60'}" stroke="#8f713c" stroke-width="3"/><text x="${x-13}" y="355" text-anchor="middle" fill="#675135" font-size="18" font-weight="800">${s.ready?'✓':'!'}</text>`;
    }
    if(s.kind==='stones'){
      const pile=P.boardPile(s),gaps=P.bridgeGaps(s),ordered=Object.values(gaps).sort((a,b)=>a.x-b.x);
      art+=plank(x-18,398,30)+plank(ordered[0].x+ordered[0].width,398,20)+plank(ordered[1].x+ordered[1].width,398,x+w+30-ordered[1].x-ordered[1].width);
      art+=`<path d="M${ordered[0].x+ordered[0].width+10},417v49" stroke="#805c3b" stroke-width="10"/>`;
      if(!s.boardShort||!s.boardLong)art+=`<ellipse cx="${pile.x}" cy="${pile.y+51}" rx="${gaps.boardLong.width*.6+8}" ry="7" fill="#71573b" opacity=".23"/>`;
      for(const [n,part]of ['boardShort','boardLong'].entries()){
        const gap=gaps[part],length=gap.width+8;
        if(s[part])art+=plank(gap.x-4,s.inputs.length?335+63*a:398,length);
        else{art+=`<rect class="drop-target" data-drop="${i}:${part}" x="${gap.x-4}" y="377" width="${length}" height="39" rx="5"/>`;art+=button(s,i,part,plank(pile.x-length/2,pile.y+(n===0&&!s.boardLong?0:22),length),n?'Drag the long board into the big gap':'Drag the short board into the small gap','draggable');}
      }
    }
    if(s.inputs.length&&s.kind!=='raft'){
      let end=s.kind==='raft'?352:s.kind==='stones'?360:s.kind==='lift'?207:s.kind==='bridge'?335+63*a:s.kind==='log'?277+121*a:352+46*a;
      if(['bridge','log','ramp','raft','stones'].includes(s.kind)&&a>.82)end=end+(235-end)*((a-.82)/.18);
      art+=`<path d="M${x+w/2},195V${end}" stroke="${s.ready?'#89d680':'#e8cc90'}" stroke-width="5"/><circle cx="${x+w/2}" cy="195" r="15" fill="${s.ready?'#78c76b':s.prepared?'#ffc957':'#b4c4ab'}" stroke="#446345" stroke-width="3"/>`;
    }
    if(s.inputs.length>1)art+=`<g>${s.inputs.map((from,n)=>`<circle cx="${s.kind==='raft'?x-94+n*20:x+w/2-10+n*20}" cy="${s.kind==='raft'?315:195}" r="8" fill="${s.signals.includes(from)?'#8ddd79':'#fff7d7'}" stroke="#557448" stroke-width="2"/>`).join('')}</g>`;
    if(s.unlock!==null&&!state.stations[s.unlock].ready)art+=`<rect x="${x-30}" y="168" width="58" height="28" rx="8" fill="#385c4c"/><text x="${x-1}" y="187" text-anchor="middle" fill="white" font-size="11">LATCHED</text>`;
    art+=`<text x="${x+w/2}" y="477" class="station-label" text-anchor="middle">${{bridge:'BRIDGE',ramp:'RAMP',stone:'STONE',gate:s.weightsNeeded>1?'HEAVY GATE':'GATE',lift:'LIFT',log:'LOG',raft:'RAFT',boulder:'BOULDER',stones:'BROKEN BRIDGE'}[s.kind]||''}</text>`;
    return `<g data-machine="${i}">${art}</g>`;
  }
  function speakDirection(text){
    if(!voiceInstructions||!sound||frozen()||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
    window.speechSynthesis.cancel();const voice=new window.SpeechSynthesisUtterance(text);voice.lang='en-US';voice.rate=.88;window.speechSynthesis.speak(voice);
  }
  function showDirection(readAloud=false){
    if(!state||state.status!=='playing')return;
    adventure.update(state,level,0,readAloud,true);
  }
  function placeTortoise(){
    if(!state)return;const pose=P.surfacePose(state);
    turtle.setAttribute('transform',`translate(${state.x},${pose.y-adventure.bounce()}) rotate(${pose.angle},0,7)`);
    turtle.classList.toggle('walking',state.status==='playing'&&!state.stations.some(s=>s.kind!=='boulder'&&!s.ready&&state.x>=(['lift','raft'].includes(s.kind)||s.kind==='route'&&s.choice==='raft'?s.x:s.x-150)-.1));
    $('raceProgress').setAttribute('width',String(40+(level+(state.x/state.goal))/P.bank.length*850));
  }
  function render(){
    if(!state)return;
    const focus=document.activeElement?.dataset;const focusKey=focus?.part?`${focus.i}:${focus.part}`:null;
    world.innerHTML=connections()+state.stations.map(station).join('');
    controls.innerHTML='';for(const node of [...world.querySelectorAll('[data-part],[data-drop]')])controls.appendChild(node);
    if(drag){const fresh=controls.querySelector(`[data-i="${drag.i}"][data-part="${drag.part}"]`);fresh?.replaceWith(drag.node);}
    $('trailDetails').innerHTML=trailArt();
    $('doorwayFront').innerHTML=doorwayFront();
    $('finishFlag').setAttribute('transform',`translate(${state.goal+12},307)`);
    if(focusKey){const el=[...svg.querySelectorAll('[data-part]')].find(e=>`${e.dataset.i}:${e.dataset.part}`===focusKey);el?.focus({preventScroll:true});}
    placeTortoise();
    $('tortoiseMoves').textContent=`${state.stations.filter(s=>s.ready).length} / ${state.stations.length}`;
    adventure.update(state,level,0,false,true);
  }

  function act(i,part){if(!started||frozen())return;const accepted=P.action(state,i,part);banner.textContent=state.message;banner.dataset.lastMessage=state.message;if(accepted||state.status==='failed')sceneSounds.action(state.stations[i],part,state.status==='failed');sceneSounds.update(state);adventure.noteAction(state,!accepted);render();}
  function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
  svg.addEventListener('pointerdown',e=>{
    if(frozen()||state?.status!=='playing')return;
    const node=e.target.closest('[data-part]');if(!node)return;
    if(node.classList.contains('draggable')){drag={node,i:Number(node.dataset.i),part:node.dataset.part,start:point(e),pointer:e.pointerId};svg.setPointerCapture(e.pointerId);e.preventDefault();}
    else act(Number(node.dataset.i),node.dataset.part);
  });
  svg.addEventListener('pointermove',e=>{if(!drag)return;if(frozen()){drag=null;render();return;}const p=point(e);drag.node.setAttribute('transform',`translate(${p.x-drag.start.x},${p.y-drag.start.y})`);});
  svg.addEventListener('pointerup',e=>{
    if(!drag)return;const d=drag;drag=null;
    if(!frozen()){
      const p=point(e),target=svg.querySelector(`[data-drop="${d.i}:${d.part}"]`),b=target?.getBBox();
      if(state.stations[d.i].kind==='lift'&&state.x<state.stations[d.i].x-.01){act(d.i,d.part);}
      else if(state.stations[d.i].kind==='stones'){
        const slots=[...svg.querySelectorAll(`[data-drop^="${d.i}:"]`)].map(el=>({part:el.dataset.drop.split(':')[1],box:el.getBBox()})).filter(({box})=>p.x>=box.x-16&&p.x<=box.x+box.width+16&&p.y>=box.y-20&&p.y<=box.y+box.height+20).sort((a,b)=>Math.abs(p.x-a.box.x-a.box.width/2)-Math.abs(p.x-b.box.x-b.box.width/2));
        if(slots.length)act(d.i,slots[0].part===d.part?d.part:'wrongBoard');
        else{state.message='Try placing the board inside a gap.';adventure.noteAction(state,true);}
      }else if(b&&p.x>=b.x-20&&p.x<=b.x+b.width+20&&p.y>=b.y-20&&p.y<=b.y+b.height+20)act(d.i,d.part);else{state.message='Almost! Try placing it inside the matching outline.';adventure.noteAction(state,true);}
    }
    render();
  });
  svg.addEventListener('pointercancel',()=>{drag=null;render();});
  svg.addEventListener('lostpointercapture',()=>{if(drag){drag=null;render();}});
  svg.addEventListener('keydown',e=>{const n=e.target.closest('[data-part]');if(n&&(e.key==='Enter'||e.key===' ')){e.preventDefault();act(Number(n.dataset.i),n.dataset.part);}});
  $('retryPuzzle').onclick=()=>{if(!frozen()&&state)load(level,state.puzzle);};
  $('restartJourney').onclick=()=>{if(!frozen())load(0);};
  $('newPuzzle').onclick=()=>{if(!frozen())load(level);};
  $('demoPuzzle').onclick=()=>{if(!frozen()&&state)adventure.showMe();};
  $('hintPuzzle').onclick=()=>{if(!frozen()&&state)showDirection(true);};
  $('tortoiseVoice').onchange=()=>{const box=$('tortoiseVoice');if(frozen()||!teacherVoice){box.checked=voiceInstructions;return;}voiceInstructions=box.checked;try{localStorage.setItem('tortoiseVoiceInstructions-v1',String(voiceInstructions));}catch{}if(!voiceInstructions)window.speechSynthesis?.cancel();else if(started&&state?.status==='playing')showDirection(true);};
  $('tortoiseSound').onclick=()=>{if(frozen())return;sound=!sound;const b=$('tortoiseSound');b.textContent=sound?'🔊':'🔇';b.setAttribute('aria-pressed',String(sound));b.setAttribute('aria-label',sound?'Sound on':'Sound off');b.title=sound?'Sound on':'Sound off';if(!sound){sceneSounds.stopAll();audio?.suspend();window.speechSynthesis?.cancel();}else tone();};
  $('startPuzzle').onclick=()=>{if(!frozen())load(resumeStop);};
  function fitArena(){
    const layout=document.querySelector('.tortoise-play-layout'),guide=document.querySelector('.game-guide'),scene=$('tortoiseTrackpadScene');
    if(!layout||!guide)return;
    const viewportHeight=window.visualViewport?.height||window.innerHeight;
    document.querySelector('.tortoise-shell').style.setProperty('--screen-height',viewportHeight+'px');
    const visible=!guide.hidden&&getComputedStyle(guide).display!=='none'&&getComputedStyle(scene).display!=='none'&&guide.getClientRects().length>0;
    layout.classList.toggle('guide-off',!visible);
    // Use the viewport's bottom, rather than an oversized child, as the height limit.
    const available=Math.max(0,viewportHeight-layout.getBoundingClientRect().top-12);
    layout.style.setProperty('height',available+'px','important');
    const box=document.querySelector('.game-stage-wrap').getBoundingClientRect();
    const heightLimit=Math.min(available,box.height),width=Math.max(0,Math.min(box.width,(heightLimit-8)*1000/520+8)),height=Math.max(0,(width-8)*520/1000+8);
    const stage=document.querySelector('.tortoise-stage');
    stage.style.setProperty('width',width+'px','important');stage.style.setProperty('height',height+'px','important');
    stage.style.setProperty('--arena-width',width+'px');stage.style.setProperty('--arena-height',height+'px');
  }
  let fitQueued=false;function queueFit(){if(fitQueued)return;fitQueued=true;requestAnimationFrame(()=>{fitQueued=false;fitArena();});}
  window.addEventListener('resize',queueFit);
  window.visualViewport?.addEventListener('resize',queueFit);
  if(window.ResizeObserver){const observer=new ResizeObserver(queueFit);observer.observe(document.querySelector('.tortoise-play-layout'));observer.observe(document.querySelector('.game-guide'));}
  const layoutObserver=new MutationObserver(queueFit);layoutObserver.observe(document.body,{attributes:true,attributeFilter:['class','style']});
  for(const el of [document.querySelector('.game-guide'),$('tortoiseTrackpadScene')])layoutObserver.observe(el,{attributes:true,attributeFilter:['class','style','hidden']});
  queueFit();
  async function init(){
    try{voiceInstructions=localStorage.getItem('tortoiseVoiceInstructions-v1')!=='false';}catch{}$('tortoiseVoice').checked=voiceInstructions;
    P.setJourneyLength('medium');
    try{const r=await fetch('/api/settings',{cache:'no-store'});if(r.ok){const s=await r.json();P.setJourneyLength(s.tortoisePuzzleAdventureLength);if(s.tortoisePuzzleGameActive===false){location.replace('../../index.html');return;}sound=s.soundEnabled!==false;teacherVoice=s.tortoisePuzzleVoiceInstructions!==false;voiceInstructions=teacherVoice&&voiceInstructions;$('tortoiseVoice').checked=voiceInstructions;$('tortoiseVoice').disabled=!teacherVoice;$('tortoiseVoice').title=teacherVoice?'Voice instructions':'Voice instructions are off in teacher settings';}}catch{}
    try{
      let raw=localStorage.getItem(P.journeyProgressKey());
      if(raw===null&&P.journeyLength==='long'){
        raw=localStorage.getItem('tortoiseJourneyStop-v2');
        if(raw===null){const old=Number(localStorage.getItem('tortoiseJourneyStop-v1'));raw=String(Number.isInteger(old)&&old>=0&&old<12?Math.min(old,6):0);}
      }
      const saved=Number(raw);if(Number.isInteger(saved)&&saved>=0&&saved<P.bank.length)resumeStop=saved;
    }catch{}
    $('startCopy').textContent=`Hare has stopped for a nap. ${P.bank.length} stops lead to the finish line! Learn each action, then help Tortoise win. Help and Show me are always here.`;
    $('startPuzzle').textContent=resumeStop?`Continue at stop ${resumeStop+1}`:'Let’s play!';
    if(resumeStop)$('startCopy').textContent='Your mountain adventure is waiting! Pick up where you stopped. Help and Show me are always here.';
    $('tortoiseSound').textContent=sound?'🔊':'🔇';$('tortoiseSound').setAttribute('aria-pressed',String(sound));$('tortoiseSound').setAttribute('aria-label',sound?'Sound on':'Sound off');$('tortoiseSound').title=sound?'Sound on':'Sound off';
    $('tortoiseLevel').textContent=`${resumeStop+1} / ${P.bank.length}`;$('puzzleName').textContent=P.bank[resumeStop][0].title;
    level=resumeStop;state=P.create(P.bank[resumeStop][0]);adventure.reset(state,resumeStop);render();$('startPuzzle').disabled=false;
  }
  function frame(t){
    const dt=last?Math.min((t-last)/1000,.05):0;last=t;
    if(started&&!frozen()&&!document.hidden){
      const before=JSON.stringify(state.stations);P.step(state,dt);sceneSounds.update(state);
      if(state.status==='failed'&&drag){const pointer=drag.pointer;drag=null;if(svg.hasPointerCapture?.(pointer))svg.releasePointerCapture(pointer);render();}
      if(before!==JSON.stringify(state.stations))render();
      adventure.update(state,level,dt);placeTortoise();
      if(state.message!==banner.dataset.lastMessage){banner.textContent=state.message;banner.dataset.lastMessage=state.message;if(state.status==='playing')adventure.update(state,level,0);}
      const finaleDone=state.status==='won'&&nextEnabled()<0&&!resultShown?adventure.animateFinale(dt,state):false;
      sceneSounds.finale(adventure.finaleCrossed);
      const failureDone=state.status==='failed'&&!resultShown?adventure.animateFailure(dt):false;
      if(state.status!=='playing'&&!resultShown&&(state.status!=='failed'||failureDone)&&(state.status!=='won'||nextEnabled()>=0||finaleDone)){
        resultShown=true;if(state.status==='won'){try{localStorage.setItem(P.journeyProgressKey(),String(nextEnabled()<0?0:nextEnabled()));}catch{}}if(state.status!=='won'||nextEnabled()>=0)window.speechSynthesis?.cancel();banner.textContent=state.message;tone(state.status==='won'?880:240);
        if(results){
          if(state.status==='failed')results.showFailure({title:'Hare woke up!',message:state.message+' Let’s try this puzzle again.'});
          else if(nextEnabled()<0)results.showFinal({title:'Tortoise crossed first!',message:'Your clever ideas helped Tortoise win. Slow and steady wins the race!' });
          else results.showSuccess({title:`Stop ${level+1} complete!`,primaryLabel:'Next stop',message:'You helped Tortoise cross! Ready for the next stop?' });
        }
      }
    }
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){sceneSounds.pause();releaseGuide();audio?.suspend();window.speechSynthesis?.cancel();}});
  window.addEventListener('pagehide',()=>{sceneSounds.stopAll();audio?.close();window.speechSynthesis?.cancel();results?.destroy();});
  new MutationObserver(()=>{if(frozen()){sceneSounds.pause();releaseGuide();window.speechSynthesis?.cancel();}}).observe(document.body,{attributes:true,attributeFilter:['class']});
  init();requestAnimationFrame(frame);
})();