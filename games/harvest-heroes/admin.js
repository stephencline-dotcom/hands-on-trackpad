/* Uses the existing shared settings save request; no separate persistence path. */
(()=>{'use strict';
const keys=['harvestHeroesGameActive','harvestHeroesVoiceInstructions','harvestHeroesRequireClickAndDrag','harvestHeroesLevelCount'],controls=keys.map(id=>document.getElementById(id));let ready=false;
for(const control of controls){control.disabled=true;control.addEventListener('change',()=>{document.querySelector('.admin-task-card')?.setAttribute('data-dirty','true');document.getElementById('soundEnabledToggle')?.dispatchEvent(new Event('change',{bubbles:true}));});}
window.HarvestHeroesSettings={snapshot(){if(!ready)throw Error('Harvest Heroes settings have not loaded. Refresh before saving.');return Object.fromEntries(keys.map((key,i)=>[key,i===3?Number(controls[i].value):controls[i].checked]));}};
fetch('/api/settings',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Settings unavailable');return r.json();}).then(s=>{controls.forEach((control,i)=>{if(i===3)control.value=String([1,2,3].includes(Number(s[keys[i]]))?Number(s[keys[i]]):3);else control.checked=i===2?s[keys[i]]===true:s[keys[i]]!==false;control.disabled=false;});ready=true;}).catch(()=>{const p=document.createElement('p');p.textContent='Harvest Heroes settings could not load. Refresh before saving.';document.getElementById('harvestHeroesSettings').append(p);});
})();
