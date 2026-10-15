(()=>{'use strict';
const R=window.PigsEscapeRoute,E=window.PigsEngine,$=id=>document.getElementById(id),canvas=$('arena'),c=canvas.getContext('2d'),art=window.PigsArt.create(c);
let state=E.create(),supplies=[],carry=null,focus=0,clock=0,phaseTime=0,last=0,helpUntil=0,demo=null,particles=[],pigX=348,pigY=411,wolfX=-120,variant=0,ready=false,active=true,paused=false,pointer={x:0,y:0},pointerDown=false,keyboard=false,hoverLock=false;
let teacherVoice=true,voice=true,sound=true,drag=false,audio=null,nodes=new Set(),resume=0;
const KEY='threeLittlePigsStorySession-v2';try{resume=Math.min(E.levels.length-1,Math.max(0,Number(sessionStorage.getItem(KEY)??sessionStorage.getItem('threeLittlePigsChapter1Session-v1'))||0));}catch{}
if(new URLSearchParams(window.location.search).get('chapter')==='sticks'&&resume<3)resume=3;
const definition=()=>E.levels[state.level],sticks=()=>definition().chapter==='sticks',frameLesson=()=>definition().finish==='frame';
function sizes(kind,small=false){if(small)return kind==='post'?[15,60]:kind==='beam'?[64,12]:kind==='panel'?[51,59]:kind==='roof'?[65,43]:kind==='wall'?[54,62]:[32,49];return kind==='post'?[21,116]:kind==='beam'?[180,21]:kind==='panel'?[78,108]:kind==='roof'?[120,66]:kind==='wall'?[66,110]:[52,90];}
function drawPigPair(x,y,walking=false,happy=false){art.pig(x,y,clock,walking,false,happy);if(sticks())art.pig(x+72,y-2,clock,walking,false,happy,true);}

function drawEscapingPigs(farSide){
if(!['escape','running'].includes(state.phase))return;
for(const actor of R.actors(definition().chapter,state.phase==='running'?phaseTime:0)){
if(actor.farSide!==farSide)continue;
c.save();c.translate(actor.x,actor.y);c.scale(actor.scale,actor.scale);art.pig(0,0,clock,actor.walking,false,state.phase==='running',actor.brother);c.restore();
}
}
const hand=window.trackpadGuide?.create?.({scene:$('handScene'),leftHand:$('leftHand'),rightHand:$('rightHand'),pressIndicator:$('press'),pointerSpace:'viewport',togglePressIndicator:true,toggleScenePressedClass:true});
const blocked=()=>paused||document.hidden||document.body.classList.contains('student-screen-frozen');
function say(t){if(!voice||!teacherVoice||blocked()||!active)return;window.speechSynthesis?.cancel();if(typeof SpeechSynthesisUtterance==='undefined')return;const u=new SpeechSynthesisUtterance(t);u.rate=.86;window.speechSynthesis?.speak(u);}
function message(t,speak=true){$('message').textContent=t;if(speak)say(t);}
function stopAudio(){window.speechSynthesis?.cancel();for(const n of nodes){try{n.stop();}catch{}}nodes.clear();audio?.suspend().catch(()=>{});}
function fx(kind){if(!sound||blocked())return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const seq=kind==='win'?[523,659,784,1047]:kind==='place'?[420,620]:kind==='oops'?[220,180]:kind==='gate'?[260,340]:[150];seq.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=kind==='oops'?'triangle':'sine';o.frequency.value=f;g.gain.setValueAtTime(.001,audio.currentTime+i*.11);g.gain.exponentialRampToValueAtTime(.07,audio.currentTime+i*.11+.025);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+i*.11+.22);o.connect(g);g.connect(audio.destination);o.start(audio.currentTime+i*.11);o.stop(audio.currentTime+i*.11+.24);nodes.add(o);o.onended=()=>nodes.delete(o);});}catch{}}
function windSound(){if(!sound||blocked())return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const buffer=audio.createBuffer(1,audio.sampleRate*2.2,audio.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*.7;const n=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();n.buffer=buffer;f.type='lowpass';f.frequency.value=650;g.gain.setValueAtTime(.001,audio.currentTime);g.gain.linearRampToValueAtTime(.2,audio.currentTime+.4);g.gain.linearRampToValueAtTime(.001,audio.currentTime+2.2);n.connect(f);f.connect(g);g.connect(audio.destination);n.start();nodes.add(n);n.onended=()=>nodes.delete(n);}catch{}}
function pauseSync(){const next=document.hidden||document.body.classList.contains('student-screen-frozen');if(next){stopAudio();returnPiece();pointerDown=false;hand?.setPressed(false);demo=null;$('demoBadge').hidden=true;}document.body.classList.toggle('pigs-action-paused',next);paused=next;last=0;}
new MutationObserver(pauseSync).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',pauseSync);window.addEventListener('pagehide',()=>{document.body.classList.toggle('pigs-action-paused',true);paused=true;stopAudio();returnPiece();});window.addEventListener('pageshow',pauseSync);window.addEventListener('blur',()=>{returnPiece();pointerDown=false;hand?.setPressed(false);});
function mode(phase){state.phase=phase;phaseTime=0;updateUI();}
function updateUI(){
const complete=E.complete(state),p=state.phase,d=definition();
$('level').textContent=`Level ${state.level+1} of ${E.levels.length}`;$('levelTitle').textContent=d.title;$('chapter').textContent=sticks()?'CHAPTER 2 · STICKS':'CHAPTER 1 · STRAW';
$('progress').textContent=p==='build'?`${state.placed.length-d.built.length} / ${d.need.length} pieces placed · ${sticks()?'Posts → beam → walls → roof → pigs':'Walls → roof → door → Pig'}`:p==='escape'?(sticks()?'The stick house fell. Help both brothers reach the brick house.':'The straw house fell. Pig can still get safely away.'):'Take your time. Help is always here.';
const actionable=ready&&active&&((p==='build'&&complete)||p==='ready'||p==='escape');
const label=p==='escape'?'Open the gate!':p==='ready'?'Here comes the wolf!':frameLesson()?'Frame finished!':d.finish==='wall'?'Wall finished!':sticks()?'Pigs, come inside!':'Pig, come inside!';
$('action').disabled=!actionable;$('action').hidden=!actionable;$('action').setAttribute('aria-label',label);$('actionLabel').textContent=label;
const picture=p==='escape'?'gate':p==='ready'?'wolf':frameLesson()?'frame':d.finish==='wall'?'wall':sticks()?'two-home':'home';
$('actionPicture').setAttribute('href','action-icons.svg?v=2#'+picture);$('demo').disabled=!ready||p!=='build'||complete;
}
function makeSupplies(){
let order=definition().need.map(id=>E.getSlots(state).find(s=>s.id===id));
// Stable layouts for Retry. New build cycles through six supply arrangements.
const style=variant%6;if(style%2)order=order.slice().reverse();if(style>1){const turn=Math.floor(style/2)%order.length;order=order.slice(turn).concat(order.slice(0,turn));}
const columns=sticks()?5:3,spacing=sticks()?78:103,start=sticks()?71:91;
supplies=order.map((slot,i)=>{const dims=sticks()?sizes(slot.kind,true):slot.kind==='roof'?[80,43]:slot.kind==='wall'?[54,62]:[35,49];return {id:slot.id,kind:slot.kind,x:start+(i%columns)*spacing,y:538+Math.floor(i/columns)*65,w:dims[0],h:dims[1],used:false};});
}
function load(level,newBuild=false){stopAudio();if(newBuild)variant++;state=E.create(level,variant);makeSupplies();carry=null;demo=null;particles=[];clock=0;phaseTime=0;last=0;pigX=sticks()?310:348;pigY=411;wolfX=-120;helpUntil=definition().guided?8:0;hoverLock=true;$('demoBadge').hidden=true;$('overlay').hidden=true;try{sessionStorage.setItem(KEY,String(level));}catch{}updateUI();message(E.levels[level].intro+(drag?' Hold the button to carry a piece.':' Slide onto a piece to pick it up.'));}
function show(title,copy,label){$('title').textContent=title;$('copy').textContent=copy;$('start').textContent=label;$('overlay').hidden=false;$('start').disabled=!ready||!active;}
function win(){
mode('success');fx('win');
const endings=[
 ['A splendid straw wall!','Your straw bundles made a wall. Next, add a roof and a door.','Next level'],
 ['Home, sweet straw home!','You finished the roof and door, and Pig is safely inside. Next, build a whole house yourself.','Next level'],
 ['Big Brother, let me in!','The straw house blew down, but Pig escaped! His brother has a workshop full of sticks. Let’s build together.','Meet Big Brother!'],
 ['A sturdy-looking frame!','Three posts hold up the long beam. Next, the brothers need walls, a roof, and a door.','Finish their house'],
 ['Room for two!','Both brothers are safely inside. Now use what you learned to build the whole stick house yourself.','Build it yourself!'],
 ['To the brick house!','The wolf blew down the stick house, but both brothers escaped safely. Their next brother is building with bricks. That chapter comes next!','Play the story again']
 ];
const [title,copy,label]=endings[state.level];message(title);show(title,copy,label);
}
function hint(speak=true){
helpUntil=clock+12;const p=state.phase;let t;
if(p==='escape')t=sticks()?'Open the gate to help both brothers reach the brick house.':'Click the latch on the gate to open Pig’s path to his brother.';
else if(p==='ready')t=(sticks()?'Both pigs are inside. ':'Pig is inside. ')+'Press the glowing wolf button when you want him to come.';
else if(p==='build'){
const target=E.nextSlot(state);
if(target){const hints={post:'Stand a tall post in an empty post space. All three posts will hold the beam.',beam:'Lay the long beam across the tops of all three posts.',panel:'Fit a stick wall between the wooden posts.',wall:'Move a straw wall bundle from the supply mat into an empty wall space.',roof:'The walls are ready. Fit each roof half onto the matching side.',door:'Move the wooden door into the doorway.'};t=hints[target.kind];}
else t=frameLesson()?'Your frame is finished. Press the glowing frame button.':definition().finish==='wall'?'Your wall is finished. Press the glowing wall button.':'The house is finished. Press the glowing pigs and house button.';
}else t='Watch what happens. There is time to get safely away.';message(t,speak);
}
function returnPiece(){if(carry)carry=null;hoverLock=true;}
function spark(x,y){for(let i=0;i<12;i++)particles.push({x,y,vx:(Math.random()-.5)*95,vy:-30-Math.random()*90,life:.65,max:.65,color:i%2?'#fff3b0':'#dcb74f'});}
function targetAt(x,y,kind){return E.getSlots(state).find(s=>s.kind===kind&&(kind!=='roof'||!carry||s.id===carry.piece.id)&&!state.placed.includes(s.id)&&Math.abs(x-s.x)<Math.max(s.w*.58+12,34)&&Math.abs(y-s.y)<Math.max(s.h*.58+15,28));}
function drop(x,y,release=false){if(!carry)return;const piece=carry.piece,target=targetAt(x,y,piece.kind);if(target){const result=E.place(state,target.id);if(result.ok){piece.used=true;carry=null;hoverLock=true;spark(target.x,target.y);fx('place');updateUI();if(E.complete(state)){message(frameLesson()?'Your frame is finished! Press the glowing frame button.':definition().finish==='wall'?'Your wall is finished! Press the glowing wall button.':'The house is finished! Press the glowing pigs and house button.');}else if(sticks()&&target.kind==='beam'){message('The frame is ready! Now fit the stick walls.');}else if(sticks()&&target.kind==='panel'&&E.allowed(state,'roof')){message('Both walls are ready! Add the roof and door.');}else if(!sticks()&&state.placed.filter(id=>id.startsWith('wall')).length===3&&target.kind==='wall'){message('The walls can hold the roof now! Add a roof and a door.');}else message('A good fit!',false);return;}if(release||!carry.warned){carry.warned=true;message(result.reason);fx('oops');}if(release)returnPiece();}else if(release){returnPiece();message('Try the matching space on the house. Your piece is back on the mat.');}}
function point(e){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/1100,r.height/650),ox=(r.width-1100*scale)/2,oy=(r.height-650*scale)/2;return {x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale};}
function hitSupply(p){return supplies.find(s=>!s.used&&Math.abs(s.x-p.x)<Math.max(s.w/2+10,28)&&Math.abs(s.y-p.y)<Math.max(s.h/2+10,28));}
function pick(piece,p){carry={piece,x:p.x,y:p.y,warned:false};keyboard=false;fx('pick');}
function takeOver(){if(demo){demo=null;$('demoBadge').hidden=true;}}
canvas.addEventListener('pointermove',e=>{if(blocked()||!ready||!active||!$('overlay').hidden)return;hand?.updateFromPointerEvent(e);pointer=point(e);takeOver();keyboard=false;if(state.phase!=='build')return;if(carry){carry.x=pointer.x;carry.y=pointer.y;if(!drag)drop(pointer.x,pointer.y);return;}const hit=hitSupply(pointer);if(!hit)hoverLock=false;if(!drag&&!hoverLock&&hit)pick(hit,pointer);});
canvas.addEventListener('pointerdown',e=>{if(blocked()||!ready||!active||!$('overlay').hidden)return;pointerDown=true;canvas.focus();pointer=point(e);takeOver();hand?.updateFromPointerEvent(e);hand?.setPressed(true);try{canvas.setPointerCapture(e.pointerId);}catch{}if(state.phase==='escape'&&pointer.x>870&&pointer.x<1030&&pointer.y>350&&pointer.y<480){escape();return;}if(state.phase==='build'&&!carry){const hit=hitSupply(pointer);if(hit)pick(hit,pointer);}else if(state.phase==='build'&&carry&&!drag)drop(pointer.x,pointer.y,true);});
canvas.addEventListener('pointerup',e=>{if(blocked())return;pointerDown=false;hand?.setPressed(false);if(drag&&carry){const p=point(e);carry.x=p.x;carry.y=p.y;drop(p.x,p.y,true);}try{canvas.releasePointerCapture(e.pointerId);}catch{}});canvas.addEventListener('pointercancel',()=>{returnPiece();pointerDown=false;hand?.setPressed(false);});canvas.addEventListener('pointerleave',()=>{if(!pointerDown)returnPiece();});canvas.addEventListener('lostpointercapture',()=>{if(pointerDown){pointerDown=false;returnPiece();hand?.setPressed(false);}});
canvas.addEventListener('keydown',e=>{if(blocked()||!ready||!active||!$('overlay').hidden)return;if(['Tab','Enter',' ','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){if(e.key==='Tab')return;e.preventDefault();takeOver();keyboard=true;if(e.key==='Escape'){returnPiece();return;}if(e.key==='Enter'||e.key===' '){if(state.phase==='escape'){escape();return;}if(state.phase==='build'){if(carry)drop(carry.x,carry.y,true);else {const list=supplies.filter(s=>!s.used);if(list.length){focus%=list.length;pick(list[focus],list[focus]);keyboard=true;}}}return;}if(!carry&&e.key.startsWith('Arrow')){const list=supplies.filter(s=>!s.used);if(list.length)focus=(focus+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+list.length)%list.length;}if(carry){const step=e.shiftKey?4:15;carry.x+=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;carry.y+=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;carry.x=Math.max(20,Math.min(1080,carry.x));carry.y=Math.max(20,Math.min(630,carry.y));}}});
function escape(){if(E.openGate(state)){phaseTime=0;fx('gate');updateUI();message(sticks()?'The gate is open! Both brothers can run to the brick house!':'The path is open! Run to your brother, little Pig!');}}
function action(){if(blocked()||!ready||!active)return;takeOver();returnPiece();if(state.phase==='escape'){escape();return;}if(state.phase==='ready'){if(E.blow(state)){phaseTime=0;updateUI();fx('gate');message(sticks()?'The door is closing. Both pigs are inside. Watch their windows.':'The door is closing. Pig is safe inside. Look for him in the window.');}return;}if(E.invite(state)){phaseTime=0;updateUI();if(state.phase==='success')win();else message(sticks()?'Come inside, little brothers!':'Come inside, little Pig!');}}
$('action').onclick=action;$('start').onclick=()=>{if(blocked()||!ready||!active)return;if(state.phase==='success')load(state.level===E.levels.length-1?0:state.level+1);else load(resume);};$('retry').onclick=()=>{if(!blocked()&&ready&&active)load(state.level);};$('new').onclick=()=>{if(!blocked()&&ready&&active)load(state.level,true);};$('restart').onclick=()=>{if(!blocked()&&ready&&active)load(0,true);};$('help').onclick=()=>{if(!blocked()&&ready&&active)hint();};$('demo').onclick=()=>{if(blocked()||!ready||state.phase!=='build'||!active)return;returnPiece();const target=E.nextSlot(state),piece=supplies.find(s=>!s.used&&s.kind===target?.kind&&(s.kind!=='roof'||s.id===target.id));if(!target||!piece){hint();return;}demo={piece,target,start:clock};helpUntil=clock+8;$('demoBadge').hidden=false;message('Watch one piece move to its space. Then it is your turn.');};$('voice').onchange=()=>{voice=teacherVoice&&$('voice').checked;if(!voice)window.speechSynthesis?.cancel();};$('sound').onclick=()=>{if(blocked())return;sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Turn sound effects off':'Turn sound effects on');if(!sound){for(const n of nodes){try{n.stop();}catch{}}nodes.clear();}};
function update(dt){
clock+=dt;phaseTime+=dt;
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
if(demo&&clock-demo.start>4.2){demo=null;$('demoBadge').hidden=true;message('Your turn! Move a piece to its space.');}
if(state.phase==='boarding'){
const duration=sticks()?2.75:2,a=Math.min(1,phaseTime/2),start=sticks()?310:348;pigX=start+(574-start)*a;pigY=411+(419-411)*a;
if(phaseTime>=duration){E.board(state);phaseTime=0;updateUI();if(state.phase==='success')win();else message(sticks()?'Both pigs are safely inside. Press the glowing wolf button when you are ready.':'Pig is safely inside. Press the glowing wolf button when you are ready.');}
}
if(state.phase==='wolf'){
wolfX=-95+Math.min(1,phaseTime/2.5)*330;
const breaths=sticks()?[4,6.7,9.4]:[4];
for(let i=0;i<breaths.length;i++)if(phaseTime>=breaths[i]&&phaseTime-dt<breaths[i]){message(sticks()?['One big puff… the sticks wobble!','A second puff… hold on, little pigs!','One enormous puff!'][i]:'I’ll huff, and I’ll puff…',false);windSound();}
if(phaseTime>=(sticks()?12.1:6.7)){E.collapse(state);phaseTime=0;updateUI();message(sticks()?'The stick house blew down! Open the gate to help both brothers reach the brick house.':'Straw cannot hold back that big puff! Open the gate so Pig can reach his brother.');}
}
if(state.phase==='escape'){pigX=sticks()?770:794;pigY=436;}
if(state.phase==='running'&&phaseTime>=R.duration(definition().chapter))win();
}
function draw(){c.clearRect(0,0,1100,650);art.scene(clock,variant,definition().chapter);const p=state.phase,ruined=['escape','running'].includes(p)||(p==='success'&&definition().finish==='wolf'),breath=(sticks()?[4,6.7,9.4]:[4]).find(t=>phaseTime>=t&&phaseTime<t+1.65),wind=p==='wolf'&&breath!==undefined,collapse=p==='wolf'?Math.max(0,Math.min(1,(phaseTime-(sticks()?10.5:5.1))/1.6)):ruined?1:0;
drawEscapingPigs(true);
art.gate(state.gateOpen,clock,p==='escape',state.gateOpen?(p==='running'?R.opening(phaseTime):1):0);
// Place the waiting pig away from supplies and all building targets.
if(!state.pigInside&&!['running','escape','boarding'].includes(p)&&!(p==='success'&&definition().finish==='wolf'))drawPigPair(pigX,pigY,false,p==='success');
if(definition().finish==='wolf'&&(p==='wolf'||ruined)){const puff=wind?Math.max(0,Math.sin((phaseTime-breath)*Math.PI)):p==='wolf'&&phaseTime>2.5?Math.min(1,phaseTime-2.5):0;art.wolf(wolfX,412,clock,puff);if(p==='wolf'&&phaseTime>2.5){art.round(113,239,245,54,15,'#fff9e6','#b5b984');art.text(wind?(sticks()?`${(sticks()?[4,6.7,9.4]:[4]).indexOf(breath)+1} · PUFFFF!`:'PUFFFF!'):'Huff… puff…',235,274,25,'#596b60');}}
for(const slot of E.getSlots(state)){if(!state.placed.includes(slot.id)){if(!ruined&&p==='build'&&(E.levels[state.level].need.includes(slot.id)))art.ghost(slot,clock,(E.levels[state.level].guided||helpUntil>clock)&&E.nextSlot(state)?.id===slot.id);continue;}let x=slot.x,y=slot.y,rot=0;if(collapse>0){x+=collapse*(slot.kind==='roof'?0:-30);y+=collapse*(468-slot.y);rot=collapse*(slot.id.endsWith('left')?-1.25:1.15);}else if(wind)x+=Math.sin(clock*30)*Math.min(5,(phaseTime-4)*2);c.save();c.translate(x,y);c.rotate(rot);if(slot.kind==='door'&&['boarding','ready','wolf'].includes(p)&&!ruined&&collapse===0){art.round(-slot.w/2-3,-slot.h/2-3,slot.w+6,slot.h+6,7,'#6c5734');const closing=p==='wolf'?Math.min(1,phaseTime/.65):0;c.translate(24*(1-closing),0);c.scale(.22+.78*closing,1);}art.piece(slot.kind,0,0,slot.w,slot.h,1,slot.id,definition().chapter);c.restore();}
// Each brother gets a window. A pig disappears from the path only after entering the door.
function windowAt(x,brother,occupied){art.round(x-32,310,64,71,9,'#9c763d','#775b33');art.round(x-26,316,52,59,5,'#d7e6cf');c.save();c.beginPath();c.roundRect(x-26,316,52,59,5);c.clip();if(occupied){c.save();c.translate(x,340);art.pig(0,19,clock,false,true,true,brother);c.restore();}else art.path([[x-20,320],[x-7,320],[x-20,338]],'#fffdf077');c.restore();art.path([[x-33,380],[x+33,380]],null,'#e4bf72',7);}
if(!ruined&&collapse===0){
if(sticks()){
if(state.placed.includes('panel-left'))windowAt(510,false,state.pigInside||(p==='boarding'&&phaseTime>=2));
if(state.placed.includes('panel-right'))windowAt(638,true,state.pigInside||(p==='boarding'&&phaseTime>=2.6));
}else if(state.placed.includes('wall-right'))windowAt(655,false,state.pigInside);
}
if(p==='boarding'){
if(!sticks()||phaseTime<2)art.pig(pigX,pigY,clock,true);
if(sticks()&&phaseTime<2.6){const a=Math.min(1,Math.max(0,(phaseTime-.6)/2));art.pig(382+(574-382)*a,409+(419-409)*a,clock,a>0,false,false,true);}
}
drawEscapingPigs(false);
for(const piece of supplies){if(piece.used)continue;if(carry?.piece===piece){c.save();c.setLineDash([4,4]);c.strokeStyle='#a18b59';c.strokeRect(piece.x-piece.w/2,piece.y-piece.h/2,piece.w,piece.h);c.restore();continue;}art.piece(piece.kind,piece.x,piece.y,piece.w,piece.h,1,piece.id,definition().chapter);}
if(carry){const t=targetAt(carry.x,carry.y,carry.piece.kind);if(t)art.ghost(t,clock,true);art.oval(carry.x+8,carry.y+38,45,9,'#46502a22');const dims=sizes(carry.piece.kind);art.piece(carry.piece.kind,carry.x,carry.y,...dims,1,carry.piece.id,definition().chapter);}
if(demo){const a=Math.min(1,(clock-demo.start)/2.8),ease=a*a*(3-2*a),x=demo.piece.x+(demo.target.x-demo.piece.x)*ease,y=demo.piece.y+(demo.target.y-demo.piece.y)*ease-Math.sin(a*Math.PI)*50;c.save();c.globalAlpha=.75;art.piece(demo.piece.kind,x,y,demo.piece.w+(demo.target.w-demo.piece.w)*ease,demo.piece.h+(demo.target.h-demo.piece.h)*ease,1,demo.piece.id,definition().chapter);c.restore();art.pointer(x+20,y+20);}
if(keyboard&&!carry&&state.phase==='build'){const list=supplies.filter(s=>!s.used),piece=list[focus%Math.max(1,list.length)];if(piece){c.save();c.strokeStyle='#246daa';c.lineWidth=4;c.strokeRect(piece.x-piece.w/2-7,piece.y-piece.h/2-7,piece.w+14,piece.h+14);c.restore();}}
if(wind){c.save();c.globalAlpha=.5;for(let i=0;i<12;i++){const x=295+((clock*260+i*77)%480),y=310+(i*31)%140;art.path([[x,y],[x+55,y-7],[x+90,y-2]],null,'#fff8db',2);}c.restore();}
for(const part of particles){c.globalAlpha=part.life/part.max;art.oval(part.x,part.y,3,3,part.color);}c.globalAlpha=1;
if(p==='build'&&(E.levels[state.level].guided||helpUntil>clock)&&!carry&&!demo){const target=E.nextSlot(state),piece=supplies.find(s=>!s.used&&s.kind===target?.kind&&(s.kind!=='roof'||s.id===target.id));if(piece){const dy=Math.sin(clock*4)*4;art.path([[piece.x,492+dy],[piece.x,506+dy],[piece.x-6,500+dy],[piece.x,506+dy],[piece.x+6,500+dy]],null,'#fffbe0',4);}}
}
function frame(ms){const dt=last?Math.min(.04,(ms-last)/1000):0;last=ms;if(!blocked()&&ready&&active&&$('overlay').hidden)update(dt);draw();requestAnimationFrame(frame);}makeSupplies();requestAnimationFrame(frame);
fetch('/api/settings',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Settings unavailable');return r.json();}).then(settings=>{active=settings.threeLittlePigsGameActive!==false;teacherVoice=settings.threeLittlePigsVoiceInstructions!==false;voice=teacherVoice;drag=settings.threeLittlePigsRequireClickAndDrag===true;sound=settings.soundEnabled!==false;$('voice').checked=voice;$('voice').disabled=!teacherVoice;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Turn sound effects off':'Turn sound effects on');$('inputHint').textContent=drag?'Hold the button to carry a piece. Release in its space.':'Slide onto a piece. Move it to the house.';document.body.classList.toggle('guide-hidden',settings.trackpadGuideEnabled===false);ready=true;$('start').disabled=!active;if(active&&resume){state=E.create(resume,variant);makeSupplies();pigX=sticks()?310:348;}if(!active){show('This story is resting','Ask your teacher which game to play.','Game unavailable');return;}if(resume)show('Pig saved your place!',`Continue at Level ${resume+1}, or use Start over for a fresh chapter.`,`Continue Level ${resume+1}`);else $('start').textContent='Let’s build!';updateUI();}).catch(()=>show('Teacher settings did not load','Check that the server is running, then refresh this page.','Refresh to try again'));
})();
