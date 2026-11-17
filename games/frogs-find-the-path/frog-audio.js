/* Pond ambience follows the game's existing state and Sound button. */
(()=>{
'use strict';
if(window.frogPathAudio)return;
const base=document.currentScript?.src||new URL('frog-audio.js',location.href).href;
const background=new Audio(new URL('audio/frogbackground.mp3',base).href);
const ribbit=new Audio(new URL('audio/ribbit.mp3',base).href);
background.loop=true;background.volume=.12;background.preload='auto';
ribbit.loop=false;ribbit.volume=.5;ribbit.preload='auto';
const active=new Set(['preview','playing','hopping']);
let wanted=false,attempted=false,elapsed=0;
function blocked(){return document.hidden||document.body.classList.contains('student-screen-frozen')||document.getElementById('studentFreezeOverlay')?.hidden===false;}
function rewind(a){try{a.currentTime=0;}catch{}}
function startBackground(){if(!wanted||blocked()||attempted||!background.paused)return;attempted=true;try{Promise.resolve(background.play()).then(()=>{if(!wanted||blocked())background.pause();}).catch(()=>{});}catch{}}
function stop(reset=false){wanted=false;attempted=false;background.pause();ribbit.pause();rewind(ribbit);if(reset){elapsed=0;rewind(background);}}
function update(mode,isBlocked,enabled,dt){
 const terminal=['ready','won','failed','blocked','loading'].includes(mode);
 const next=enabled&&!isBlocked&&!blocked()&&active.has(mode);
 if(!next){if(wanted)stop(terminal);else if(terminal){elapsed=0;rewind(background);}return;}
 wanted=true;startBackground();elapsed+=Math.max(0,Number(dt)||0);
 if(elapsed>=5){elapsed%=5;if(ribbit.paused){rewind(ribbit);try{Promise.resolve(ribbit.play()).then(()=>{if(!wanted||blocked())ribbit.pause();}).catch(()=>{});}catch{}}}
}
// A fresh user gesture also retries playback if the browser initially blocked it.
function unlock(){if(wanted&&!blocked()){attempted=false;startBackground();}}
document.addEventListener('pointerdown',unlock,{capture:true});
document.addEventListener('keydown',unlock,{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('blur',()=>stop());window.addEventListener('pagehide',()=>stop(true));
window.frogPathAudio=Object.freeze({update,stop});
})();
