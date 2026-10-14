/* Visual coaching and feedback. Shares the game's fixed SVG coordinate system. */
(function(root){
  'use strict';
  const colors=['#ffd44f','#54d6e8','#ff9b72','#b6a0ff'];
  const leaf=(x,y,scale=1,color='#8fcd4c')=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-12,8Q-22,-13 13,-18Q23,8 -12,8" fill="${color}" stroke="#3b7c47" stroke-width="2"/><path d="M-14,13L10,-13M-3,0l-7,-3M3,-7l9,0" stroke="#397444" stroke-width="2" fill="none"/></g>`;
  const hand=`<path d="M-8,19v-13q0,-8 6,-5v-18q0,-9 7,-8q5,0 5,8v14q7,-7 11,-2q6,-3 9,2q7,0 7,8v16q-1,15 -11,18H5q-7,-4 -13,-12z" fill="#fff7db" stroke="#705330" stroke-width="3"/><path d="M5,5v10M16,6v9M26,8v9" stroke="#c4a66e" stroke-width="2"/><rect x="2" y="29" width="28" height="10" rx="4" fill="#4bbdcc" stroke="#397b88" stroke-width="2"/>`;
  const texts={
    sail:['I’m aboard! Let’s float!','Click the knotted rope to set the raft free.'],
    stopper:['I’m moving! Stop that boulder!','Put the stopper on the slope before I reach the danger.'],
    boardShort:['The bridge has two holes!','Drag the short board into the small gap.'],
    boardLong:['Repair the other hole!','Drag the long board into the big gap.'],
    plank:['A creek blocks my path!','Drag the plank into the hanging holder.'],
    weight:['Help me get through!','Drag the stone onto the round pad.'],
    good:['A rocky gap blocks the trail!','Click the support under the high end.'],
    turn:['Lower the wooden chute!','Click the blue crank to turn the wood down.'],
    release:['Ready for a chain reaction?','Click the yellow stopper under the stone.'],
    far:['Land the far end first!','Click the far rope. That end must reach its catcher.'],
    near:['The far end is supported!','Now click the near rope to complete the bridge.']
  };
  function describe(s,part){
    const custom=root.TortoiseLateChallenges?.point(s,part);if(custom)return custom;
    const w=s.width*.62;
    if(/^weight[1-3]$/.test(part))return{x:s.x+w+55+(Number(part.slice(6))-1)*58,y:370,to:{x:s.x+w,y:370}};
    const gaps=s.kind==='stones'?root.TortoisePuzzles.bridgeGaps(s):{},pile=root.TortoisePuzzles.boardPile(s);
    const map={boardShort:{x:pile.x,y:pile.y+(s.boardLong?35:13),to:{x:gaps.boardShort?.x+gaps.boardShort?.width/2,y:396}},boardLong:{x:pile.x,y:pile.y+35,to:{x:gaps.boardLong?.x+gaps.boardLong?.width/2,y:396}},sail:{x:s.x-69,y:344},stopper:{x:s.x+w+58,y:382,to:{x:s.x+94,y:274}},plank:{x:s.x+3+(w+25)/2,y:278,to:{x:s.x+2+(w+28)/2,y:346}},weight:{x:s.x+w+55,y:370,to:{x:s.x+w,y:s.kind==='lift'?308:370}},good:{x:s.x+w,y:375},turn:{x:s.x+(s.chuteOffset||130)-42*s.side,y:286},release:{x:s.x+(s.chuteOffset||130)-42*s.side,y:233},far:{x:s.x+w+9,y:240},near:{x:s.x+13,y:240}};
    return map[part]||{x:s.x,y:325};
  }
  function escape(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
  function wrap(text,n=32){let lines=[''];for(const w of text.split(' ')){const i=lines.length-1;if((lines[i]+' '+w).trim().length>n)lines.push(w);else lines[i]=(lines[i]+' '+w).trim();}return lines.slice(0,3);}
  class Adventure{
    constructor(svg,options){
      this.svg=svg;this.hare=document.getElementById('hare');this.sleepingHare=this.hare?.innerHTML||'';this.failureClock=0;this.failureStarted=false;this.finaleClock=0;this.finaleStarted=false;this.finaleCrossed=false;this.finaleAwake=false;this.options=options;this.guide=document.getElementById('storyGuide');this.demo=document.getElementById('actionGuide');this.fx=document.getElementById('feedbackLayer');this.decor=document.getElementById('worldDecor');this.clock=0;this.demoStart=0;this.key='';this.effects=[];this.seen=new Set();this.cue=null;this.demoForced=false;this.assistance=0;this.idleSince=0;this.errorUntil=0;this.errorText='';this.previous=[];this.reactionUntil=0;
    }
    reset(state,level){
      this.failureClock=0;this.failureStarted=false;this.finaleClock=0;this.finaleStarted=false;this.finaleCrossed=false;this.finaleAwake=false;if(this.hare){this.hare.innerHTML=this.sleepingHare;this.hare.setAttribute('transform','translate(665,110)');this.hare.setAttribute('aria-label','Hare is sleeping');}
      this.clock=0;this.demoStart=0;this.key='';this.assistance=0;this.idleSince=0;this.errorUntil=0;this.errorText='';this.presentationKey='';this.demonstrating=false;this.effects=[];this.seen.clear();this.previous=state.stations.map(s=>s.ready);this.demoForced=false;this.reactionUntil=0;this.paintWorld(level);this.update(state,level,0,false,true);
    }
    paintWorld(level){
      level=Math.min(3,Math.floor(level/5));
      const theme=[['#73d8f2','#fff6c9','#92cf72'],['#68c9e6','#dcf8de','#78bc80'],['#9ce0e6','#fff1cb','#bbbf62'],['#b7d9ff','#ffe8c5','#88b784']][level];
      const stops=this.svg.querySelectorAll('#sky stop');stops[0]?.setAttribute('stop-color',theme[0]);stops[1]?.setAttribute('stop-color',theme[1]);
      const tree=(x,y,scale)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-12,150L-9,38H12l9,112" fill="#a56c3c" stroke="#6d462e" stroke-width="4"/><path d="M0,140V80L-28,45M5,94l27,-32" fill="none" stroke="#6e482e" stroke-width="5"/><g stroke="#3d804c" stroke-width="3"><ellipse cx="-27" cy="39" rx="37" ry="43" fill="#6abb5c"/><ellipse cx="26" cy="35" rx="42" ry="45" fill="#88cc63"/><ellipse cx="0" cy="0" rx="42" ry="44" fill="#72c65b"/></g><path d="M-24,10q-10,9 -8,21M7,-21q18,2 24,19" fill="none" stroke="#bfe998" stroke-width="6" stroke-linecap="round"/></g>`;
      let art=tree(25,220,1.15)+tree(975,210,1.22);
      for(let i=0;i<15;i++){const x=20+i*69;art+=`<path d="M${x},401q-5,-20 -12,-25q11,7 12,15q2,-21 12,-27q-5,14 -4,32" fill="${theme[2]}" stroke="#4a8f48" stroke-width="2"/>`;}
      for(const x of [45,145,520,915,965]){art+=`<g transform="translate(${x},470)"><path d="M0,8v-29" stroke="#51994a" stroke-width="4"/><g fill="${level===2?'#ffae57':'#ff93ad'}" stroke="#ca6583" stroke-width="1"><circle cx="0" cy="-34" r="6"/><circle cx="-7" cy="-28" r="6"/><circle cx="7" cy="-28" r="6"/><circle cx="-5" cy="-20" r="6"/><circle cx="5" cy="-20" r="6"/></g><circle cy="-27" r="5" fill="#ffe676"/></g>`;}
      art+=`<g class="butterfly" transform="translate(490,102)"><g class="butterfly-wings"><path d="M0,0q-27,-28 -29,-8q-5,16 27,16" fill="#ffc84b" stroke="#b97934" stroke-width="2"/><path d="M0,0q27,-28 29,-8q5,16 -27,16" fill="#ffae61" stroke="#b97934" stroke-width="2"/></g><path d="M0,-7v19" stroke="#805a3b" stroke-width="4"/></g>`;
      if(level===2){for(const x of [76,528,939])art+=`<g transform="translate(${x},492)"><ellipse rx="21" ry="16" fill="#f6a33e" stroke="#bb7133" stroke-width="3"/><path d="M-7,-14q-5,15 0,29M6,-14q6,14 0,29" fill="none" stroke="#df8534" stroke-width="2"/><path d="M0,-14l2,-9" stroke="#517a46" stroke-width="5"/></g>`;}
      this.decor.innerHTML=art;
    }
    cueFor(state){
      if(state.status!=='playing')return null;
      const customWatch=state.stations.find(s=>s.kind==='drawbridge'&&s.stage===1||s.kind==='repairChute'&&s.stage===2||s.kind==='route'&&s.choice==='raft'&&!s.prepared&&state.x<s.x-.01);
      if(customWatch)return {key:customWatch.kind+'-watch',title:customWatch.kind==='route'?'Let me step aboard!':'Watch your machine move!',text:customWatch.kind==='route'?'Wait for Tortoise before untying the rope.':customWatch.kind==='drawbridge'?'The support is swinging under the loose end.':'The repaired chute is turning toward the switch.',watch:true};
      if(state.stations.some(s=>s.kind==='log'&&s.first&&s.firstProgress<1))return{key:'log-landing',title:'Watch that end land!',text:'The catcher holds that end so the log cannot slip.',watch:true};
      if(state.stations.some(s=>s.turning))return{key:'crank-turning',title:'Watch the crank turn!',text:'The wooden chute turns down toward the round pad.',watch:true};
      const moving=state.stations.findIndex(s=>s.phase==='moving');
      if(moving>=0||state.pending?.length){return{key:'watch',title:'Look what you made happen!',text:state.pending?.length?'The rope is carrying your pull!':moving>=0&&state.stations[moving].kind==='raft'?'We’re floating across the river!':moving>=0&&state.stations[moving].kind==='boulder'?'The stopper catches the boulder above the trail. We are safe!':moving>=0&&state.stations[moving].kind==='stones'?'Both holes are repaired. Now I can cross!':'Watch the weight move the machine.',watch:true};}
      const h=root.TortoisePuzzles.hint(state);
      if(!h)return{key:'walk',title:'Keep going, Tortoise!',text:'Your path is ready. Watch me cross!',watch:true};
      const s=state.stations[h.index];if(root.TortoiseLateChallenges?.isCustom(s))return {...h,key:`${h.index}:${h.part}:${s.stage}`,title:state.puzzle.title,text:h.text,point:describe(s,h.part)};let [title,text]=texts[h.part]||['Help me on my way!',h.text];
      if(s.kind==='stone'&&s.routeChallenge){title='Which switch opens the gate?';text=h.part==='turn'?'Turn the crank toward the gate’s switch. The other switch rings the bell.':'That chute points to the gate’s switch. Release the stone.';}
      if(s.kind==='log'){title=s.first?'One end is safely supported!':'Look for the catcher!';text=s.first?'Release the other rope to lower the rest of the log.':`Release the ${s.logFirst} rope first. Its end must land on the catcher.`;}
      if(s.kind==='gate'&&s.weightsNeeded>1){title=s.weightsPlaced.length?'The gate needs more weight!':'This is a heavy gate!';text=s.weightsPlaced.length?'Add another rock. The gate must rise above my shell.':s.weightChoice?'Choose enough weight: one large rock or several small rocks.':`Put ${s.weightsNeeded} rocks on the pad to lift the heavy gate.`;}
      if(s.kind==='raft'&&h.part==='sail'&&state.x<s.x-.01)return{key:'board-raft',title:'Let me step onto the raft!',text:'Wait until I am aboard. Clicking the rope too soon wakes Hare!',watch:true};
      if(s.kind==='lift'&&h.part==='weight'){title='Help me ride the lift!';text='Drag the stone into the basket.';if(state.x<s.x-.01){return{key:'board',title:'Let me climb aboard!',text:'Wait until I am aboard. An early rock drop wakes Hare!',watch:true};}}
      return {...h,key:`${h.index}:${h.part}:${s.aligned}:${s.first}`,title,text,point:describe(s,h.part)};
    }
    showGuide(cue){
      const icon=`<circle cx="78" cy="106" r="29" fill="#e7f8c9" stroke="#6bab50" stroke-width="3"/><path d="M56,116q-7,-32 19,-32q23,0 25,31" fill="#82bc4c" stroke="#3b7741" stroke-width="3"/><path d="M66,110l9,-19 14,17" fill="none" stroke="#3b7741" stroke-width="2"/><ellipse cx="95" cy="112" rx="14" ry="11" fill="#cbe38c" stroke="#3b7741" stroke-width="2"/><circle cx="100" cy="109" r="2.5" fill="#264b39"/><path d="M100,117q4,2 7,-1" stroke="#3b7741" fill="none" stroke-width="2"/>`;
      this.guide.innerHTML=`<path d="M48,62h366q14,0 14,14v67q0,14 -14,14H96l-25,16 6,-16H48q-14,0 -14,-14V76q0,-14 14,-14" fill="#fff9dd" stroke="#d6a85d" stroke-width="4"/>${icon}<text x="119" y="85" fill="#56834b" font-size="13" font-weight="800">${escape(cue.title)}</text>${wrap(cue.text).map((line,i)=>`<text x="119" y="109" transform="translate(0 ${i*19})" fill="#314f3c" font-size="17" font-weight="750">${escape(line)}</text>`).join('')}`;
    }
    buildDemo(cue){
      if(cue.watch||!cue.point){this.demo.innerHTML='';return;}
      const p=cue.point,to=p.to;
      const trail=to?`<path d="M${p.x},${p.y}Q${(p.x+to.x)/2+30},${(p.y+to.y)/2-30} ${to.x},${to.y}" stroke="#fff9c6" stroke-width="7" fill="none"/><path d="M${p.x},${p.y}Q${(p.x+to.x)/2+30},${(p.y+to.y)/2-30} ${to.x},${to.y}" stroke="#edaa36" stroke-width="3" stroke-dasharray="6 7" fill="none"/><circle cx="${to.x}" cy="${to.y}" r="27" fill="none" stroke="#fff8cf" stroke-width="5"/>`:'';
      const ghost=to?(cue.part==='stopper'?'<path d="M-17,-45v36h33Z" fill="#e0aa58" stroke="#80552e" stroke-width="2" opacity=".55"/>':['boardShort','boardLong'].includes(cue.part)?`<rect x="${cue.part==='boardShort'?-20:-34}" y="-35" width="${cue.part==='boardShort'?40:68}" height="16" rx="4" fill="#e9be74" stroke="#96683b" stroke-width="2" opacity=".55"/>`:cue.part==='plank'?'<rect x="-28" y="-35" width="56" height="16" rx="4" fill="#e9be74" stroke="#96683b" stroke-width="2" opacity=".55"/>':'<path d="M-18,-28l4,-16 24,-3 10,18 -12,9 -18,-1Z" fill="#a4bdc8" stroke="#537386" stroke-width="2" opacity=".55"/>'):'';
      this.demo.innerHTML=`${trail}<g id="demoHand" opacity=".9" transform="translate(${p.x} ${p.y+24})">${ghost}${hand}</g>`;
    }
    burst(x,y,color,label='Great job!'){
      this.reactionUntil=this.clock+.6;this.effects.push({type:'burst',x,y,color,label,start:this.clock});this.options.reward?.();
    }
    update(state,level,dt,read=false,force=false){
      this.clock+=dt;
      for(let i=0;i<state.stations.length;i++){
        const s=state.stations[i];if(s.ready&&!this.previous[i]){
          this.burst(s.kind==='raft'?root.TortoisePuzzles.raftGeometry(s).end:s.x+s.width*.31,310,colors[i%colors.length],{bridge:'Bridge ready!',ramp:'Ramp ready!',stone:'Switch pressed!',gate:'Gate open!',lift:'Lift ready!',log:'Log bridge ready!',raft:'Safe landing!',boulder:'Boulder stopped!',stones:'Bridge repaired!'}[s.kind]);
          for(const to of s.outputs)this.effects.push({type:'signal',from:i,to,start:this.clock,color:colors[state.puzzle.links.findIndex(a=>a[0]===i&&a[1]===to)%colors.length]});
        }
        this.previous[i]=s.ready;
      }
      const cue=this.cueFor(state);this.cue=cue;
      
      if(cue){
        const changed=cue.key!==this.key;
        if(changed){this.key=cue.key;this.demoStart=this.clock;this.demoForced=false;this.idleSince=this.clock;this.assistance=0;}
        if(read){this.errorUntil=0;this.assistance=Math.max(2,this.assistance);}
        const idle=this.clock-this.idleSince;
        const teaching=state.puzzle.support==='teach';
        if(!teaching&&!cue.watch){
          if(idle>=(state.puzzle.support==='practice'?12:30))this.assistance=Math.max(this.assistance,2);
          if(state.puzzle.support==='practice'&&idle>=22)this.assistance=Math.max(this.assistance,3);
        }
        // Goal first, then a specific step, then a demonstration. Help always reveals the step.
        const detail=teaching||this.assistance>=2||cue.watch;
        const goals={raft:'How can we float across this river?',boulder:'How can you stop the rolling boulder before it reaches us?',stones:'Which board fits each hole in the bridge?',bridge:'Can you help me cross this creek?',ramp:'Can you make a safe path across the rocky gap?',gate:'Can you add enough weight to lift this gate?',lift:'Can you help me reach the high path?',stone:'Follow the rope. Which switch opens the gate?',log:'Can you lower the log safely?'};
        const presentation=this.errorUntil>this.clock?{title:'Let’s try another way!',text:this.errorText}:detail?cue:{title:'What could you try?',text:goals[state.stations[cue.index].kind]||state.puzzle.goalText||cue.text};
        const presentationKey=presentation.title+presentation.text;
        const newPresentation=presentationKey!==this.presentationKey;
        if(newPresentation||force){this.presentationKey=presentationKey;this.showGuide(presentation);if(newPresentation&&!read&&this.options.autoSpeak?.())this.options.speak?.(presentation.text);}
        const world=this.svg;world.querySelectorAll('.guided,.guided-target,.hinted').forEach(e=>e.classList.remove('guided','guided-target','hinted'));
        if(!cue.watch&&detail){world.querySelector(`[data-i="${cue.index}"][data-part="${cue.part}"]`)?.classList.add('guided');world.querySelector(`[data-drop="${cue.index}:${cue.part}"]`)?.classList.add('guided-target');}
        const demonstrate=!cue.watch&&(teaching||this.assistance>=3||this.demoForced);
        if(changed||force||demonstrate!==this.demonstrating){this.demonstrating=demonstrate;if(demonstrate)this.buildDemo(cue);else this.demo.innerHTML='';}
        this.options.instruction?.(presentation.text);
        if(read)this.options.speak?.(cue.text);
      }else{this.guide.innerHTML='';this.demo.innerHTML='';}
      this.animateDemo();this.animateEffects();
    }
    noteAction(state,mistake=false){
      this.idleSince=this.clock;
      if(mistake){this.errorText=state.message;this.errorUntil=this.clock+4;this.assistance=Math.max(this.assistance,state.attempts>=2?3:2);}
      else{this.errorUntil=0;}
    }
    animateFailure(dt){
      this.failureClock+=dt;
      if(!this.failureStarted){
        this.failureStarted=true;
        if(this.hare){this.hare.innerHTML=`<ellipse cx="0" cy="12" rx="35" ry="22" fill="#c69471" stroke="#74513e" stroke-width="3"/><ellipse cx="31" cy="-3" rx="21" ry="19" fill="#dbb797" stroke="#74513e" stroke-width="3"/><ellipse cx="24" cy="-36" rx="6" ry="26" transform="rotate(-20 24 -36)" fill="#dbb797" stroke="#74513e" stroke-width="3"/><ellipse cx="41" cy="-36" rx="6" ry="26" fill="#dbb797" stroke="#74513e" stroke-width="3"/><circle cx="39" cy="-7" r="4" fill="#493b31"/><circle cx="40" cy="-8" r="1.5" fill="white"/><circle cx="50" cy="1" r="3" fill="#805c48"/><path d="M34,7q8,5 14,-1" fill="none" stroke="#805c48" stroke-width="2"/><circle cx="-32" cy="9" r="10" fill="#fff3df"/><path d="M-17,25l-16,10h27M16,24l18,11h-23" fill="none" stroke="#a77d5e" stroke-width="8" stroke-linecap="round"/>`;this.hare.setAttribute('aria-label','Hare wakes up and races away');}
        this.options.speak?.('Oh! Hare woke up and raced away. Let’s try again!');
      }
      const t=this.failureClock;
      let x=665,y=110;
      if(t>.4&&t<.95){const f=(t-.4)/.55;x=665+65*f;y=110+250*f-Math.sin(f*Math.PI)*45;}
      else if(t>=.95){x=730+(t-.95)*390;y=360-Math.abs(Math.sin((t-.95)*18))*18;}
      this.hare?.setAttribute('transform',`translate(${x},${y})`);
      this.showGuide({title:'Hare woke up!',text:'He raced away! We can try this puzzle again.'});
      return t>=2;
    }
    paintFinale(){
      this.effects=[];this.fx.innerHTML='';
      const scene=document.getElementById('finaleScene');
      const eyes=`<circle cx="-7" cy="-15" r="3" fill="#263d33"/><circle cx="7" cy="-15" r="3" fill="#263d33"/><path d="M-7,-5q7,8 14,0" fill="none" stroke="#4b5140" stroke-width="2"/>`;
      const friends=[
        [340,310,`<path d="M-17,-29l-9,-25M-25,-45l-9,-7M17,-29l9,-25M25,-45l9,-7" stroke="#805b3b" stroke-width="4" fill="none"/><ellipse cy="11" rx="23" ry="27" fill="#bf9062"/><path d="M-14,30v14M14,30v14" stroke="#805b3b" stroke-width="6"/><ellipse cy="-13" rx="21" ry="22" fill="#d8b687"/>${eyes}`],
        [455,312,`<path d="M21,30q58,-8 39,-35q-17,-18 -32,19" fill="#da8242" stroke="#885138" stroke-width="3"/><path d="M51,-7q20,3 13,17l-16,10" fill="#fff1d9"/><ellipse cy="14" rx="23" ry="25" fill="#df8a45"/><path d="M-22,-8l-2,-33 19,14M22,-8l2,-33 -19,14" fill="#df8a45" stroke="#885138" stroke-width="3"/><path d="M-24,-16q24,-19 48,0l-24,27Z" fill="#e49b57" stroke="#885138" stroke-width="3"/><path d="M-20,-8L0,10 20,-8L0,-2Z" fill="#fff1d9"/>${eyes}`],
        [570,305,`<ellipse cy="5" rx="29" ry="36" fill="#b9986b" stroke="#765b3e" stroke-width="3"/><path d="M-23,-22l-5,-19 23,10M23,-22l5,-19 -23,10" fill="#b9986b" stroke="#765b3e" stroke-width="3"/><circle cx="-11" cy="-12" r="14" fill="#fff0c8"/><circle cx="11" cy="-12" r="14" fill="#fff0c8"/><circle cx="-11" cy="-12" r="6" fill="#33473b"/><circle cx="11" cy="-12" r="6" fill="#33473b"/><path d="M-6,4h12L0,14Z" fill="#e7b34f"/><path d="M-23,0l-13,18M23,0l13,18" stroke="#765b3e" stroke-width="8"/>`],
        [685,310,`<path d="M-20,30q-46,-6 -47,-36q-3,-30 21,-26q24,2 8,23q-19,9 -12,23q6,13 33,10" fill="#b47745" stroke="#775037" stroke-width="3"/><ellipse cy="11" rx="21" ry="26" fill="#be8755"/><circle cx="-13" cy="-33" r="9" fill="#be8755"/><circle cx="13" cy="-33" r="9" fill="#be8755"/><ellipse cy="-14" rx="22" ry="20" fill="#dbad79"/>${eyes}`],
        [867,312,`<path d="M22,27q38,-1 40,-21" fill="none" stroke="#a59181" stroke-width="4"/><ellipse cy="14" rx="23" ry="23" fill="#aca99a"/><circle cx="-18" cy="-31" r="14" fill="#aca99a" stroke="#777a6a" stroke-width="2"/><circle cx="18" cy="-31" r="14" fill="#aca99a" stroke="#777a6a" stroke-width="2"/><circle cx="-18" cy="-31" r="8" fill="#e1c5b6"/><circle cx="18" cy="-31" r="8" fill="#e1c5b6"/><ellipse cy="-13" rx="22" ry="20" fill="#cfcdba"/>${eyes}<path d="M-10,-2h-23M10,-2h23" stroke="#777a6a" stroke-width="2"/>`],
        [945,310,`<ellipse cy="9" rx="24" ry="28" fill="#72bed4" stroke="#416d85" stroke-width="3"/><circle cy="-13" r="22" fill="#a6d9df" stroke="#416d85" stroke-width="3"/><path d="M-4,-9h14L0,1Z" fill="#efbd56"/><circle cx="-8" cy="-18" r="3" fill="#263d33"/><circle cx="8" cy="-18" r="3" fill="#263d33"/><path d="M-19,9q-20,-33 -28,-8M19,9q20,-33 28,-8" fill="none" stroke="#72bed4" stroke-width="9"/><path d="M-9,31v9M9,31v9" stroke="#a37a38" stroke-width="4"/>`]
      ];
      scene.innerHTML=`<rect width="1000" height="520" fill="#a3def0"/><circle cx="865" cy="93" r="43" fill="#ffe590"/><path d="M0,319Q190,151 400,316L650,146 860,318V405H0Z" fill="#80b87a"/><path d="M506,279L650,146 777,277L690,224 650,201 609,232Z" fill="#d0e7bf"/><path d="M70,398Q170,294 250,340L300,398Z" fill="#83b65f"/><rect y="397" width="1000" height="123" fill="#bf955d"/><path d="M0,398h1000" stroke="#efd092" stroke-width="20"/><path d="M270,249Q600,274 979,249" fill="none" stroke="#796239" stroke-width="3"/>${Array.from({length:14},(_,n)=>`<path d="M${286+n*48},251l16,0 -8,23Z" fill="${colors[n%4]}"/>`).join('')}${friends.map(([x,y,art],n)=>`<g data-cheering="${n}" transform="translate(${x},${y})">${art}</g>`).join('')}<path d="M282,341h695M300,325v42M400,325v42M510,325v42M625,325v42M745,325v42M855,325v42M971,325v42" stroke="#9b7341" stroke-width="7"/><g id="finaleHare"></g><path d="M755,398V230h117v168" fill="none" stroke="#77593c" stroke-width="8"/><rect x="737" y="218" width="152" height="40" rx="8" fill="#ffdc6d" stroke="#9e7737" stroke-width="4"/><text x="813" y="246" text-anchor="middle" font-size="24" font-weight="800" fill="#385c42">FINISH</text><rect x="782" y="384" width="16" height="53" fill="#fff8df"/>${Array.from({length:6},(_,n)=>`<rect x="${n%2?790:782}" y="${385+n*8}" width="8" height="8" fill="#355444"/>`).join('')}<g id="winnerMedal"></g>`;
      document.getElementById('finaleHare').innerHTML=this.sleepingHare;
      document.getElementById('finishFlag').setAttribute('visibility','hidden');
      for(const id of ['mechanisms','puzzleControls','doorwayFront','trailDetails'])document.getElementById(id).innerHTML='';
    }
    animateFinale(dt,state){
      if(!this.finaleStarted){this.finaleStarted=true;this.paintFinale();this.options.speak?.('Hare woke up! Keep going, Tortoise!');}
      this.finaleClock+=dt;
      const pose=root.TortoisePuzzles.finalePose(this.finaleClock),hare=document.getElementById('finaleHare');
      if(this.finaleClock>=.65&&!this.finaleAwake){this.finaleAwake=true;hare.innerHTML=`<ellipse cx="0" cy="12" rx="35" ry="22" fill="#c69471" stroke="#74513e" stroke-width="3"/><ellipse cx="31" cy="-3" rx="21" ry="19" fill="#dbb797" stroke="#74513e" stroke-width="3"/><ellipse cx="24" cy="-36" rx="6" ry="26" transform="rotate(-20 24 -36)" fill="#dbb797" stroke="#74513e" stroke-width="3"/><ellipse cx="41" cy="-36" rx="6" ry="26" fill="#dbb797" stroke="#74513e" stroke-width="3"/><circle cx="39" cy="-7" r="4" fill="#493b31"/><circle cx="40" cy="-8" r="1.5" fill="white"/><circle cx="50" cy="1" r="3" fill="#805c48"/><path d="M34,7q8,5 14,-1" fill="none" stroke="#805c48" stroke-width="2"/><circle cx="-32" cy="9" r="10" fill="#fff3df"/><path d="M-17,25l-16,10h27M16,24l18,11h-23" fill="none" stroke="#a77d5e" stroke-width="8" stroke-linecap="round"/>`;}
      hare.setAttribute('transform',`translate(${pose.hareX},${pose.hareY})`);
      const turtle=document.getElementById('tortoise');turtle.setAttribute('transform',`translate(${pose.tortoiseX},391)`);turtle.classList.toggle('walking',pose.tortoiseX<890);
      if(pose.crossed&&!this.finaleCrossed){this.finaleCrossed=true;this.burst(790,315,'#ffd44f','Tortoise wins!');this.options.speak?.('Tortoise crossed first! Slow and steady wins the race!');document.getElementById('winnerMedal').innerHTML=`<path d="M909,198l11,29 11,-29" fill="#75b9d4" stroke="#46798c" stroke-width="3"/><circle cx="920" cy="238" r="20" fill="#ffda61" stroke="#b18736" stroke-width="3"/><text x="920" y="245" text-anchor="middle" fill="#785931" font-size="22" font-weight="800">1</text>`;}
      this.showGuide({title:pose.crossed?'Tortoise crossed first!':'One last stretch!',text:pose.crossed?'Your clever ideas helped me win. Thank you!':'Hare woke up! The forest friends are cheering us on!'});
      document.getElementById('raceProgress').setAttribute('width','900');
      this.svg.querySelectorAll('[data-cheering]').forEach((node,n)=>{const x=[340,455,570,685,867,945][n],y=[310,312,305,310,312,310][n];node.setAttribute('transform',`translate(${x},${y-Math.abs(Math.sin(this.finaleClock*5+n))*5})`);});
      return pose.done;
    }
    animateDemo(){
      if(!this.cue?.point)return;
      const handNode=document.getElementById('demoHand');if(!handNode)return;
      const p=this.cue.point,to=p.to,reduce=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const t=reduce?0:((this.clock-this.demoStart)%3)/3;
      const phase=t<.15?0:t>.8?1:(t-.15)/.65,ease=phase*phase*(3-2*phase);
      const x=p.x+(to?to.x-p.x:0)*ease,y=p.y+(to?to.y-p.y:0)*ease+24+(to?0:Math.sin(t*Math.PI*2)*7);
      handNode.setAttribute('transform',`translate(${x} ${y})`);
      const hidden=this.options.dragging?.()||(!this.demoForced&&this.clock<1);
      this.demo.style.opacity=hidden?'0':'.8';
    }
    showMe(){if(!this.cue)return;this.errorUntil=0;this.demoForced=true;this.assistance=3;this.demoStart=this.clock;this.buildDemo(this.cue);if(this.cue)this.options.speak?.(this.cue.text);}
    animateEffects(){
      this.effects=this.effects.filter(e=>this.clock-e.start<(e.type==='signal'?.8:1.6));
      let art='';for(const e of this.effects){const t=this.clock-e.start;
        if(e.type==='signal'){const path=this.svg.querySelector(`[data-signal-from="${e.from}"][data-signal-to="${e.to}"]`);if(path?.getTotalLength){const p=path.getPointAtLength(path.getTotalLength()*Math.min(1,t/.75));art+=`<circle cx="${p.x}" cy="${p.y}" r="12" fill="${e.color}" opacity=".35"/><circle cx="${p.x}" cy="${p.y}" r="6" fill="#fff8d6" stroke="${e.color}" stroke-width="3"/>`;}}
        else{const opacity=Math.max(0,1-t/1.6);for(let n=0;n<7;n++){const a=n*Math.PI*2/7;art+=`<g opacity="${opacity}">${leaf(e.x+Math.cos(a)*t*65,e.y+Math.sin(a)*t*40-t*40,.55,e.color)}</g>`;}art+=`<g opacity="${opacity}" transform="translate(${e.x},${e.y-45-t*30})"><rect x="-70" y="-20" width="140" height="30" rx="15" fill="#fff7cf" stroke="#d4a146" stroke-width="2"/><text text-anchor="middle" fill="#3b6f44" font-size="13" font-weight="800">${escape(e.label)}</text></g>`;}
      }this.fx.innerHTML=art;
    }
    bounce(){const left=this.reactionUntil-this.clock;return left>0?Math.sin((.6-left)/.6*Math.PI)*10:0;}
  }
  root.TortoiseAdventure={Adventure,describe,colors,leaf};
})(window);