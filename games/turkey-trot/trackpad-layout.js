/* Reuse the same trackpad guide API and assets as Turkey Design Studio. */
(()=>{'use strict';const $=id=>document.getElementById(id);let guide=null;try{guide=window.trackpadGuide?.create?.({scene:$('handScene'),leftHand:$('leftHand'),rightHand:$('rightHand'),pressIndicator:$('press'),pointerSpace:'viewport',togglePressIndicator:true,toggleScenePressedClass:true});}catch(e){console.warn('Trackpad guide unavailable',e);}
const blocked=()=>document.hidden||document.body.classList.contains('student-screen-frozen');
const clear=()=>guide?.setPressed(false);
document.addEventListener('pointermove',e=>{if(!blocked())guide?.updateFromPointerEvent(e);},{passive:true});
document.addEventListener('pointerdown',e=>{if(blocked())return;guide?.updateFromPointerEvent(e);guide?.setPressed(true);},{passive:true});
document.addEventListener('pointerup',clear,{passive:true});document.addEventListener('pointercancel',clear,{passive:true});window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(blocked())clear();});new MutationObserver(()=>{if(blocked())clear();}).observe(document.body,{attributes:true,attributeFilter:['class']});
fetch('/api/settings',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('settings unavailable');return r.json();}).then(s=>{document.body.classList.toggle('guide-hidden',s.trackpadGuideEnabled===false);}).catch(()=>{});
})();
