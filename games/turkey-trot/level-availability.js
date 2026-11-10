(()=>{'use strict';
const levels=['index.html','woodland.html','creek-hop.html','finale.html'];
const keys=[1,2,3,4].map(n=>'turkeyTrotLevel'+n+'Enabled');
const current=levels.indexOf(location.pathname.split('/').pop());
fetch('/api/settings',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(s=>{
 const enabled=keys.map(k=>s[k]!==false);
 if(!enabled.some(Boolean))enabled[0]=true;
 if(current>=0&&!enabled[current]){
  const target=enabled.findIndex(Boolean);
  location.replace(levels[target]);return;
 }
 const next=enabled.findIndex((v,i)=>v&&i>current);
 const nextFile=next<0?null:levels[next];
 for(const id of ['woodlandNext','creekNext','finaleNext']){
  const a=document.getElementById(id);if(a&&nextFile){a.href=nextFile;}
  else if(a&&!nextFile){a.hidden=true;}
 }
 // Existing level-specific completion logic controls visibility of next links.
 window.turkeyTrotNextLevel=nextFile;
}).catch(()=>{});
})();
