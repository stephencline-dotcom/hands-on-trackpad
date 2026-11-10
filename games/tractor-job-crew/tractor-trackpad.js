(()=>{
const scene=document.getElementById('handScene');
const guide=window.trackpadGuide?.create?.({scene,leftHand:document.getElementById('leftHand'),rightHand:document.getElementById('rightHand'),pressIndicator:document.getElementById('press'),pointerSpace:'viewport',togglePressIndicator:true,toggleScenePressedClass:true});
const replay=document.getElementById('coachReplay');
function replayDemo(){if(guide?.reset)guide.reset();scene?.classList.remove('is-pressed');const hand=document.getElementById('rightHand');if(hand){hand.style.animation='none';void hand.offsetWidth;hand.style.animation='';}}
replay?.addEventListener('click',replayDemo);
document.getElementById('hint')?.addEventListener('click',replayDemo);
fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(s=>{if(s)window.trackpadGuideSetting?.apply?.(s.trackpadGuideEnabled!==false)}).catch(()=>{});
})();
