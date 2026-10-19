/* Local farm recordings. Raking follows its job; the engine runs while the driver is seated; no timers survive pauses. */
(()=>{'use strict';
const definitions={steps:{files:['farmfootsteps.mp3'],volume:.16,loop:true},plant:{files:['seedsprinkle.mp3'],volume:.4},soil:{files:['rakesoil.mp3'],volume:.28,loop:true},water:{files:['wateringcan.mp3'],volume:.32,loop:true},engine:{files:['tractorengine.mp3?v=timing-1'],volume:.12,loop:true},carrot:{files:['carrotpop.mp3'],volume:.48},corn:{files:['cornsnap.mp3'],volume:.45},collect:{files:['wagonload.mp3'],volume:.4},visitor:{files:['farmvisitor.mp3','farmvisiotor.mp3'],volume:.32},bell:{files:['farmbell.mp3'],volume:.38},bug:{files:['bugpop.mp3'],volume:.35},win:{files:['harvestcheer.mp3'],volume:.38},ambience:{files:['farmambience.mp3'],volume:.035,loop:true}};
let enabled=true,active=false;const clips={};
function quiet(){return window.speechSynthesis?.speaking ? .45 : 1;}
for(const [key,d] of Object.entries(definitions)){const clip=new Audio('../../sounds/'+d.files[0]);clip.preload='auto';clip.loop=!!d.loop;clip.volume=d.volume;let alternate=0;clip.addEventListener('error',()=>{if(alternate+1>=d.files.length)return;clip.src='../../sounds/'+d.files[++alternate];clip.load();if(enabled&&active&&clips[key].requested){const play=clip.play();play?.catch(()=>{});}});clips[key]={clip,definition:d,requested:false,retry:0};}
function halt(entry){entry.requested=false;entry.retry=0;try{entry.clip.pause();entry.clip.currentTime=0;}catch{}}
function stopAll(){for(const e of Object.values(clips))halt(e);}
function setEnabled(value){enabled=!!value;if(!enabled)stopAll();}
function play(key){const e=clips[key];if(!e)return false;if(key==='soil'||key==='water')return true;if(!enabled||!active)return true;e.requested=true;try{e.clip.pause();e.clip.currentTime=0;e.clip.volume=e.definition.volume*quiet();const pending=e.clip.play();pending?.catch(()=>{});}catch{}return true;}
function loop(key,run,now){const e=clips[key];e.clip.volume=e.definition.volume*quiet();if(!enabled||!active||!run){if(e.requested||!e.clip.paused)halt(e);return;}e.requested=true;if(e.clip.paused&&now>=e.retry){e.retry=now+.5;try{const pending=e.clip.play();pending?.catch(()=>{});}catch{}}}
function update(actor,options){const {enabled:on,active:running,time=0}=options;for(const e of Object.values(clips))e.clip.volume=e.definition.volume*quiet();setEnabled(on);active=!!running;if(!active||!enabled){stopAll();return;}
 loop('ambience',true,time);const seated=actor.mode==='drive'||actor.mode==='park'||actor.mode==='climb'&&actor.phase>=.78;loop('engine',seated,time);loop('steps',actor.walking&&(actor.mode==='foot'||actor.mode==='approach'),time);
 const raking=actor.mode==='foot'&&!actor.walking&&actor.job?.kind==='cover'&&actor.job.elapsed>0;loop('soil',!!raking,time);
 const watering=actor.mode==='foot'&&!actor.walking&&actor.job?.kind==='water'&&actor.job.elapsed>0;loop('water',!!watering,time);}
function reset(){stopAll();active=false;for(const e of Object.values(clips))e.retry=0;}
window.HarvestSounds={play,update,stopAll,setEnabled,reset};
})();
