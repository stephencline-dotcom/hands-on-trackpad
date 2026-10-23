(()=>{'use strict';
const files={music:['backgroundmusic',.07,true],river:['riverambience',.16,true],paddle:['paddlewater',.30,false],bump:['canoebump',.6,false],dock:['canoeland',.5,false],pick:['pickup',.5,false],load:['pickup',.5,false],water:['basketwater',.55,false],basket:['basketpickup',.5,false],squirrel:['squirrel',.35,false],raccoon:['raccoon',.35,false],gatherer:['footsteps',.3,false],wood:['woodpickup',.45,false],camp:['campfire',.14,true],stolen:['supplystolen',.5,false],landing:['newlanding',.45,false]};
const tracks={};let unlocked=false,active=false,enabled=true,mode='',lastPaddle=0,lastStep=0,lastCamp=false;const lastEffect={};
for(const [key,[name,volume,loop]] of Object.entries(files)){const el=new Audio('../../sounds/'+name+'.mp3');el.preload=loop?'auto':'none';el.loop=loop;el.volume=volume;tracks[key]=el;}
function pauseAll(){for(const el of Object.values(tracks)){el.pause();if(!el.loop)try{el.currentTime=0;}catch{}}}
function loop(key,should){const el=tracks[key];if(!el)return;if(!should){el.pause();return;}if(el.paused)el.play().catch(()=>{});}
function effect(key,cooldown=0){if(!active||!enabled||!unlocked)return;const el=tracks[key];if(!el)return;const now=performance.now();if(now-(lastEffect[key]||-1e9)<cooldown)return;lastEffect[key]=now;try{el.pause();el.currentTime=0;el.play().catch(()=>{});}catch{}}
function unlock(){unlocked=true;}
function stop(){active=false;pauseAll();}
function reset(){stop();lastPaddle=0;lastStep=0;lastCamp=false;}
function halt(key){const el=tracks[key];if(el&&!el.paused){el.pause();try{el.currentTime=0;}catch{}}}
function update(s,on,sound){enabled=!!sound;active=!!on&&enabled;if(!active){pauseAll();return;}if(!unlocked)return;loop('music',true);loop('river',true);const camp= s.mode==='shore'&&!!(s.shore?.campfire||s.shore?.camp||s.shore?.hasCampfire||s.shore?.campers?.length||s.shore?.campfirePeople?.length);loop('camp',camp);lastCamp=camp;
const now=performance.now();
// Movement sounds are gated by current activity, not their MP3 duration.
const paddling=s.mode==='river'&&!!s.boat?.moving;
const visitorsWalking=s.mode==='shore'&&Array.isArray(s.visitors)&&s.visitors.some(v=>['approach','rise','return','retreat','leave','walk'].includes(v.phase));
const helperWalking=s.mode==='shore'&&!!s.person?.walking;
if(!paddling)halt('paddle');
else if(now-lastPaddle>700){lastPaddle=now;effect('paddle',500);}
if(!visitorsWalking&&!helperWalking)halt('gatherer');
else if(now-lastStep>400){lastStep=now;effect('gatherer',350);}}
function play(kind){const mapped={bump:'bump',pick:'pick',load:'load',route:'landing',dock:'dock',basket:'basket',stolen:'stolen',visitor:'gatherer',newlanding:'landing',wood:'wood',water:'water'};const key=mapped[kind];if(key)effect(key,kind==='bump'?350:120);}
window.RiverAudio={unlock,update,play,stop,reset,effect};
})();
