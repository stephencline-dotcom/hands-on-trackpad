/* Johnny's Apple Orchard: event-linked sound effects, independent of gameplay. */
(()=>{'use strict';
const names=new Set(['pickup','digging','seedsprinkle','wateringcan','birdflap','snatch','success','strawrustle','carrotpop','rakesoil','woodpickup','correctflower','harvestcheer','beebuzz','bugpop','roar','littlehurt','running','basketpickup','ladderclimb','cornsnap','squirrel','leaveshake','applecrunch','raccoon','running-feet','newlanding','cartoonstumble','walksand','woodclicks','pumpkinhit']);
const active=new Set(),last=new Map();let enabled=()=>true;let lastBlocked=false;
// Maximum playback for action sounds; a long recording must never outlast the action.
const actionCaps={digging:1100,seedsprinkle:1100,wateringcan:1250,rakesoil:1300,strawrustle:900,carrotpop:750,beebuzz:1200,roar:1100,ladderclimb:1350,leaveshake:1250,'running-feet':1100,running:1000,walksand:900,woodpickup:850,woodclicks:700,cartoonstumble:1100};
const timers=new Map();
function stopName(name){for(const a of [...active])if(a.johnnyName===name){a.pause();try{a.currentTime=0}catch{}active.delete(a);const timer=timers.get(a);if(timer)clearTimeout(timer);timers.delete(a);}}

const blocked=()=>document.hidden||document.body.classList.contains('student-screen-frozen')||document.body.classList.contains('freeze-screen-active')||document.querySelector('[data-freeze-overlay]:not([hidden])')!==null;
function stop(){for(const a of [...active]){a.pause();try{a.currentTime=0}catch{}}active.clear();for(const t of timers.values())clearTimeout(t);timers.clear();}
function play(name,{volume=.3,cooldown=180,rate=1,maxMs}={}){
 if(!names.has(name)||!enabled()||blocked())return;
 const time=performance.now();if(time-(last.get(name)||-10000)<cooldown)return;last.set(name,time);
 try{stopName(name);const a=new Audio('../../sounds/'+name+'.mp3');a.johnnyName=name;a.volume=Math.max(0,Math.min(.65,volume));a.playbackRate=rate;active.add(a);
 const cleanup=()=>{active.delete(a);const timer=timers.get(a);if(timer)clearTimeout(timer);timers.delete(a)};
 a.onended=a.onerror=cleanup;
 const limit=maxMs??actionCaps[name];if(Number.isFinite(limit)&&limit>0)timers.set(a,setTimeout(()=>{if(active.has(a)){a.pause();try{a.currentTime=0}catch{}cleanup()}},limit));
 a.play().catch(cleanup);}catch{}
}
function setEnabled(fn){enabled=fn;if(!fn())stop();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('blur',stop);window.addEventListener('pagehide',stop);
new MutationObserver(()=>{const b=blocked();if(b&&!lastBlocked)stop();lastBlocked=b;}).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:false});
window.JohnnySounds={play,stop,stopName,setEnabled};
})();
