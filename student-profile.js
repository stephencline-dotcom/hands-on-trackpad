/* Saved student name shared with the site's result system. */
(() => {
 'use strict';
 if(window.trackpadStudentProfile||/\/(?:admin(?:-settings)?|teacher)\.html$/i.test(location.pathname))return;
 const KEY='moving-sound-student-name-v1';let enabled=false,teacher=null,prompt=null,button=null,memoryName='';
 function clean(value){return String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,40);}
 function getName(){try{return clean(localStorage.getItem(KEY))||memoryName;}catch{return memoryName;}}
 function getStudentId(){const name=getName().normalize('NFKC').toLowerCase(),key='trackpad-student-id-v1:'+name;try{let id=localStorage.getItem(key);if(!id){id=window.crypto?.randomUUID?.()||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+'_'+Math.random().toString(36).slice(2);localStorage.setItem(key,id);}return id;}catch{return '';}}
 function frozen(){return document.body.classList.contains('student-screen-frozen')||document.getElementById('studentFreezeOverlay')?.hidden===false;}
 function announce(type){window.dispatchEvent(new CustomEvent(type,{detail:{name:getName()}}));}
 const style=document.createElement('style');style.textContent=`
 .trackpad-name-button[hidden]{display:none!important}.trackpad-name-button{height:36px;max-width:145px;padding:0 10px;border:1px solid #6287a4;border-radius:10px;background:#142d43;color:#e7f8ff;font:700 12px system-ui;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 #trackpadNameOverlay[hidden]{display:none!important}#trackpadNameOverlay{position:fixed;inset:0;display:grid;place-items:center;padding:18px;background:#071929bd;z-index:8000;font-family:system-ui}
 .trackpad-name-card{box-sizing:border-box;width:min(100%,420px);padding:27px;border:2px solid white;border-radius:24px;background:#f1fbff;color:#20455e;text-align:center;box-shadow:0 16px 55px #0005}
 .trackpad-name-card h2{font-size:28px;line-height:1.1;margin:0 0 14px}.trackpad-name-card p{font-size:13px;line-height:1.5}.trackpad-name-card label{display:block;text-align:left;font-size:14px;font-weight:750;margin:14px 0 7px}
 .trackpad-name-card input{box-sizing:border-box;width:100%;padding:12px;border:2px solid #80b4cf;border-radius:12px;background:white;color:#163e5a;font:500 19px system-ui}.trackpad-name-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:17px}.trackpad-name-actions button{border:2px solid #a9cfdf;border-radius:12px;padding:11px 17px;background:white;color:#24546b;font:750 14px system-ui;cursor:pointer}.trackpad-name-actions button[type=submit]{background:#ffe084;border-color:#f2c562;color:#493b1c}.trackpad-name-card small{display:block;margin-top:16px;color:#5b7c91;font-size:11px}
 `;document.head.append(style);
 function close(){if(prompt)prompt.hidden=true;announce('trackpadStudentNamePromptClose');button?.focus({preventScroll:true});}
 function edit(){if(!enabled||teacher!==false||frozen())return;if(!prompt){
  prompt=document.createElement('div');prompt.id='trackpadNameOverlay';prompt.hidden=true;prompt.innerHTML='<form class="trackpad-name-card" role="dialog" aria-modal="true" aria-labelledby="trackpadNameTitle"><h2 id="trackpadNameTitle">What is your name?</h2><p>Type your name, then start playing!</p><label for="trackpadStudentName">Your name</label><input id="trackpadStudentName" type="text" maxlength="40" required autocomplete="off" spellcheck="false"><div class="trackpad-name-actions"><button type="submit">Start playing</button></div><p id="trackpadNameMessage" role="status"></p><small>Saved in this browser for your next visit. Use the Name button to change it.</small></form>';document.body.append(prompt);
  prompt.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const name=clean(prompt.querySelector('input').value);if(!name){prompt.querySelector('#trackpadNameMessage').textContent='Type your name to start playing.';prompt.querySelector('input').focus();return;}memoryName=name;try{localStorage.setItem(KEY,name);}catch{}close();syncButton();announce('trackpadStudentNameChanged');});
  prompt.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();if(getName())close();else prompt.querySelector('input').focus();}else if(event.key==='Tab'){const items=[...prompt.querySelectorAll('input,button')],index=items.indexOf(document.activeElement);if(event.shiftKey&&index<=0){event.preventDefault();items.at(-1).focus();}else if(!event.shiftKey&&index===items.length-1){event.preventDefault();items[0].focus();}}});
 }
 announce('trackpadStudentNamePromptOpen');prompt.querySelector('input').value=getName();prompt.querySelector('#trackpadNameMessage').textContent='';prompt.hidden=false;prompt.querySelector('input').focus();}
 function syncButton(){
  if(!button){const host=document.querySelector('.game-header-controls,.home-hero-top');if(host&&!document.getElementById('studentNameInput')){button=document.createElement('button');button.type='button';button.className='trackpad-name-button';button.textContent='Name';button.setAttribute('aria-label','Enter or change your saved name');button.onclick=edit;host.append(button);}}
  if(button){button.hidden=!enabled||teacher!==false;button.textContent=getName()?`Name: ${getName()}`:'Name';button.title=getName()?'Change your saved name':'Enter your name';}
 }
 function configure(settings){enabled=settings?.studentNameEntryEnabled===true;syncButton();if(!enabled){if(prompt&&!prompt.hidden)close();return;}if(teacher===false&&!getName()&&(!prompt||prompt.hidden)&&!document.getElementById('studentNameInput'))edit();}
 async function refresh(){try{const [s,t]=await Promise.allSettled([fetch('/api/settings',{cache:'no-store',credentials:'same-origin'}),fetch('/api/teacher-session',{cache:'no-store',credentials:'same-origin'})]);if(t.status==='fulfilled'){teacher=t.value.ok&&(await t.value.json()).authenticated===true;}else{teacher=null;}if(s.status==='fulfilled'&&s.value.ok)configure(await s.value.json());else syncButton();}catch{teacher=null;syncButton();}}
 window.trackpadStudentProfile=Object.freeze({getName,getStudentId,edit,configure,refresh});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 window.addEventListener('storage',event=>{if(event.key===KEY)syncButton();});
 refresh();
})();
