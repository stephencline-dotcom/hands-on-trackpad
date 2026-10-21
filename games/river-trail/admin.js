/* Uses the existing shared settings save request; no separate persistence path. */
(()=>{'use strict';
const keys=['riverTrailGameActive','riverTrailVoiceInstructions','riverTrailRequireClickAndDrag','riverTrailLevelCount'],controls=keys.map(id=>document.getElementById(id));let ready=false;
for(const control of controls){control.disabled=true;control.addEventListener('change',()=>{document.querySelector('.admin-task-card')?.setAttribute('data-dirty','true');document.getElementById('soundEnabledToggle')?.dispatchEvent(new Event('change',{bubbles:true}));});}
window.RiverTrailSettings={snapshot(){if(!ready)throw Error('River Trail Adventure settings have not loaded. Refresh before saving.');return Object.fromEntries(keys.map((key,i)=>[key,i===3?Number(controls[i].value):controls[i].checked]));}};
fetch('/api/settings',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Settings unavailable');return r.json();}).then(s=>{controls.forEach((control,i)=>{if(i===3)control.value=String([1,2,3,4,5].includes(Number(s[keys[i]]))?Number(s[keys[i]]):5);else control.checked=(i===1||i===2)?s[keys[i]]===true:s[keys[i]]!==false;control.disabled=false;});ready=true;}).catch(()=>{const p=document.createElement('p');p.textContent='River Trail Adventure settings could not load. Refresh before saving.';document.getElementById('riverTrailSettings').append(p);});
})();
