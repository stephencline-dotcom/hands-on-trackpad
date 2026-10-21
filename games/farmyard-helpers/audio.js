/* Eight local recordings. Job loops stop with the animation; calls are spaced out. */
(()=>{'use strict';
const defs={cow:{file:'cowmoo.mp3',volume:.28},sheep:{file:'sheepbaa.mp3',volume:.26},chicken:{file:'chickencluck.mp3',volume:.24},pig:{file:'pigoink.mp3',volume:.26},feed:{file:'farmfeed.mp3',volume:.24,loop:true},mud:{file:'mudsplash.mp3',volume:.25,loop:true},animals:{file:'animalsteps.mp3',volume:.12,loop:true},yawn:{file:'farmyawn.mp3',volume:.22}};
const clips={},voices=['cow','sheep','chicken','pig','yawn'];let active=false,enabled=true,now=0,nextCall=6,lastSteps=null,lastState=null;const lastAnimal=new Map();
const duck=()=>window.speechSynthesis?.speaking ? .4 : 1;
for(const [key,d] of Object.entries(defs)){const clip=new Audio('../../sounds/'+d.file);clip.preload='auto';clip.loop=!!d.loop;clip.volume=d.volume;const e={clip,definition:d,requested:false,retry:0,failed:false};clips[key]=e;clip.addEventListener('error',()=>{e.failed=true;halt(e);});}
function halt(e){e.requested=false;e.retry=0;try{e.clip.pause();e.clip.currentTime=0;}catch{}}
function stopAll(){active=false;lastSteps=null;for(const e of Object.values(clips))halt(e);}
function play(key){const e=clips[key];if(!e||e.definition.loop||e.failed)return false;if(!enabled||!active)return true;for(const voice of voices)halt(clips[voice]);e.requested=true;nextCall=now+8;lastAnimal.set(key,now);try{e.clip.volume=e.definition.volume*duck();e.clip.currentTime=0;const p=e.clip.play();p?.catch(()=>{});}catch{}return true;}
function loop(key,on){const e=clips[key];e.clip.volume=e.definition.volume*duck();if(!enabled||!active||!on||e.failed){if(e.requested||!e.clip.paused)halt(e);return;}e.requested=true;if(e.clip.paused&&now>=e.retry){e.retry=now+.6;try{e.clip.play()?.catch(()=>{});}catch{}}}
function update(s,options){now=options.time||0;enabled=!!options.enabled;const running=!!options.active;
if(s!==lastState){stopAll();lastState=s;lastAnimal.clear();nextCall=now+6;}
if(!enabled||!running){stopAll();return;}if(!active){active=true;nextCall=Math.max(nextCall,now+3);}
for(const e of Object.values(clips))e.clip.volume=e.definition.volume*duck();
const steps=s.animals.reduce((n,a)=>n+(a.step||0),0)+s.babies.reduce((n,b)=>n+(b.step||0),0),moving=lastSteps!==null&&steps>lastSteps+.001;lastSteps=steps;
loop('animals',moving||s.job?.phase==='enter');loop('feed',s.job?.type==='feed'&&s.job.phase==='work');loop('mud',s.job?.type==='mud'&&s.job.phase==='work');
// One occasional call at a time; speech and demonstrations get room to be heard.
if(s.complete||s.queue.length||options.demonstrating||window.speechSynthesis?.speaking||now<nextCall||voices.some(key=>!clips[key].clip.paused))return;
const candidates=s.animals.filter(a=>!a.pending&&!a.sheltered&&window.FarmyardModel.need(s,a));candidates.sort((a,b)=>(lastAnimal.get(a.kind)??-Infinity)-(lastAnimal.get(b.kind)??-Infinity));
for(const a of candidates){const need=window.FarmyardModel.need(s,a),key=s.level===4&&need==='shelter'?'yawn':a.kind;if(now-(lastAnimal.get(key)??-Infinity)<20)continue;if(play(key))return;}
nextCall=now+3;
}
window.FarmyardSounds={play,update,stopAll};
})();
