/* Shared path rules; no browser or storage side effects. */
(function(root){
'use strict';
const LEVELS=45;
function random(seed){let n=seed>>>0;return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function adjacent(a,b,n){return Math.abs(a%n-b%n)+Math.abs(Math.floor(a/n)-Math.floor(b/n))===1;}
function makeLevel(level,seed){
 if(!Number.isInteger(level)||level<1||level>LEVELS)throw Error('Invalid level');
 const n=4+Math.floor((level-1)/9),rng=random(hash(seed+':'+level)),start=(n-1)*n+Math.floor(rng()*n),goal=Math.floor(rng()*n);
 const target=Math.min(n*2+3,n+2+Math.floor(level/4));
 let best=null,visits=0;const path=[start],seen=new Set(path);
 function dfs(at){
  if(++visits>16000||path.length>target+2)return false;
  if(at===goal){if(path.length>=target){best=[...path];return true;}if(!best||path.length>best.length)best=[...path];return false;}
  const neighbors=[at-n,at+n,at-1,at+1].filter(v=>v>=0&&v<n*n&&adjacent(at,v,n)&&!seen.has(v)).map(v=>({v,k:rng()})).sort((a,b)=>a.k-b.k);
  for(const {v} of neighbors){
   // An induced path has no adjacent shortcuts or ambiguous forks.
   if(path.some(p=>p!==at&&adjacent(p,v,n)))continue;
   seen.add(v);path.push(v);if(dfs(v))return true;path.pop();seen.delete(v);
  }return false;
 }
 dfs(start);
 if(!best){best=[start];let at=start;while(at>=n){at-=n;best.push(at);}while(at!==goal){at+=Math.sign(goal-at);best.push(at);}}
 return {level,n,path:best,start,goal,previewSeconds:6};
}
function emptyProgress(){return {unlocked:1,completed:[],counts:Array(LEVELS).fill(0),best:Array(LEVELS).fill(null),scoreSession:null};}
function normalizeProgress(v){const p=emptyProgress();if(!v||typeof v!=='object')return p;p.completed=[...new Set((Array.isArray(v.completed)?v.completed:[]).filter(x=>Number.isInteger(x)&&x>=1&&x<=LEVELS))];p.unlocked=Math.min(LEVELS,Math.max(1,...p.completed.map(x=>x+1)));for(let i=0;i<LEVELS;i++){if(Number.isInteger(v.counts?.[i])&&v.counts[i]>=0&&v.counts[i]<=100000)p.counts[i]=v.counts[i];if(Number.isInteger(v.best?.[i])&&v.best[i]>0&&v.best[i]<=100000)p.best[i]=v.best[i];}if(typeof v.scoreSession==='string')p.scoreSession=v.scoreSession;return p;}
const api={LEVELS,hash,random,adjacent,makeLevel,emptyProgress,normalizeProgress};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FrogPathCore=Object.freeze(api);
})(typeof window!=='undefined'?window:globalThis);
