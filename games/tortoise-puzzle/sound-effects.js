/* Scene sounds share the game's sound switch, independently of narration. */
(function(root){
'use strict';
class SceneSounds{
 constructor(enabled){this.enabled=enabled;this.clips={};this.previous=[];this.suspended=new Set();this.cheered=false;this.hareLaughed=false;const volumes={crowdcheer:.35,raftsplash:.45,rockthud:.5,rope:.4,woodclicks:.45,rollingrock:.25,bunnylaugh:.45};
  for(const [name,url]of Object.entries(root.TortoiseSoundFiles||{})){const clip=new root.Audio(url);clip.preload='auto';clip.volume=volumes[name]||.4;clip.loop=name==='rollingrock';this.clips[name]=clip;}
 }
 play(name){const clip=this.clips[name];if(!clip||!this.enabled())return;try{clip.currentTime=0;clip.play()?.catch(()=>{});}catch{}}
 stop(name){const clip=this.clips[name];if(!clip)return;clip.pause();try{clip.currentTime=0;}catch{}this.suspended.delete(name);}
 pause(){for(const [name,clip]of Object.entries(this.clips))if(!clip.paused){this.suspended.add(name);clip.pause();}}
 resume(){if(!this.enabled())return;for(const name of this.suspended){this.clips[name]?.play()?.catch(()=>{});}this.suspended.clear();}
 stopAll(){for(const name of Object.keys(this.clips))this.stop(name);this.suspended.clear();}
 reset(state){this.stopAll();this.cheered=false;this.hareLaughed=false;this.previous=(state?.stations||[]).map(s=>this.snapshot(s));}
 snapshot(s){return{phase:s.phase,ready:s.ready,progress:s.progress||0,firstProgress:s.firstProgress||0,hazardFall:s.hazardFall||0,logFall:s.logFall||0};}
 action(s,part,failed=false){if(failed&&part==='release'){this.play('rockthud');return;}if(failed&&part==='sail')this.play('raftsplash');if(['near','far','sail'].includes(part))this.play('rope');else if(/^weight/.test(part)||['small','large'].includes(part))this.play('rockthud');else if(['turn','crank','good','support','plank','patch','boardShort','boardLong','stopper','release','wrongPatch','wrongBoard','wrongSupport','brake','plug'].includes(part))this.play('woodclicks');}
 update(state){this.resume();if(state.status==='failed'&&!this.hareLaughed){this.hareLaughed=true;this.play('bunnylaugh');}let rolling=false;
  for(const [i,s]of state.stations.entries()){const old=this.previous[i]||this.snapshot(s),now=this.snapshot(s),stone=['stone','repairChute'].includes(s.kind),impact=s.kind==='stone'?1.8/2.85:.65;
   if(state.status==='playing'&&(s.kind==='boulder'&&!s.ready||stone&&s.phase==='moving'&&s.progress<impact||s.kind==='cart'&&s.phase==='moving'&&s.progress<.79))rolling=true;
   if(now.phase==='moving'&&old.phase!=='moving'){if(s.kind==='raft'||s.kind==='route'&&s.choice==='raft')this.play('raftsplash');else if(['gate','lift','bridge','log','drawbridge'].includes(s.kind))this.play('rope');}
   if(stone&&old.progress<impact&&now.progress>=impact)this.play('rockthud');
   if(s.kind==='log'&&old.firstProgress<1&&now.firstProgress===1)this.play('woodclicks');
   if(!old.ready&&now.ready){if(s.kind==='boulder')this.play('rockthud');else if(s.kind==='raft'||s.kind==='route'&&s.choice==='raft')this.play('raftsplash');else if(!stone)this.play('woodclicks');}
   if(old.hazardFall<.9&&now.hazardFall>=.9)this.play('rockthud');
   if(old.logFall<.8&&now.logFall>=.8)this.play('raftsplash');
   this.previous[i]=now;
  }
  const clip=this.clips.rollingrock;if(clip){if(rolling&&this.enabled()){if(clip.paused)clip.play()?.catch(()=>{});}else this.stop('rollingrock');}
 }
 finale(crossed){if(crossed&&!this.cheered){this.cheered=true;this.play('crowdcheer');}}
}
root.TortoiseSceneSounds=SceneSounds;
})(window);