'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROW='hands-on-trackpad-balloon-maze-times-v1';
const invalid=()=>Object.assign(new Error('Invalid Balloon Maze result'),{status:400});
const cleanName=v=>typeof v==='string'?v.replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').trim().slice(0,40):'';
function validate(v){
 if(!v||typeof v!=='object'||typeof v.studentId!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(v.studentId)||typeof v.runId!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(v.runId)||!Number.isInteger(v.level)||v.level<1||v.level>30||!Number.isInteger(v.timeMs)||v.timeMs<100||v.timeMs>3600000)throw invalid();
 const name=cleanName(v.name);if(!name||typeof v.sessionId!=='string'||v.sessionId.length>100)throw invalid();
 return {studentId:v.studentId,runId:v.runId,level:v.level,timeMs:v.timeMs,name,sessionId:v.sessionId};
}
function fresh(){return {revision:crypto.randomUUID(),sessionId:crypto.randomUUID(),students:{}};}
function normalize(raw){if(!raw||typeof raw.revision!=='string'||!raw.students||typeof raw.students!=='object'||Array.isArray(raw.students))throw Error('Score document invalid');return {...raw,sessionId:typeof raw.sessionId==='string'?raw.sessionId:'legacy-'+raw.revision};}
function apply(doc,r){
 if(r.sessionId!==doc.sessionId)throw Object.assign(new Error('Class session changed'),{status:409});
 if(r.rename){const prev=doc.students[r.studentId];if(!prev||prev.name===r.name)return doc;return {...doc,revision:crypto.randomUUID(),students:{...doc.students,[r.studentId]:{...prev,name:r.name}}};}
 const prev=doc.students[r.studentId]||{name:r.name,times:Array(30).fill(null)};
 const times=Array.from({length:30},(_,i)=>{const n=prev.times?.[i];return Number.isInteger(n)&&n>=100&&n<=3600000?n:null;});
 const old=times[r.level-1];if(old===null||r.timeMs<old)times[r.level-1]=r.timeMs;
 if(old===times[r.level-1]&&prev.name===r.name)return doc;
 return {...doc,revision:crypto.randomUUID(),students:{...doc.students,[r.studentId]:{name:r.name,times}}};
}
function leaderboard(doc){return Object.entries(doc.students).map(([id,v])=>{const times=Array.isArray(v.times)?v.times:[];const good=times.filter(x=>Number.isInteger(x)&&x>=100&&x<=3600000);return {id,name:cleanName(v.name)||'Student',levels:good.length,totalMs:good.reduce((a,b)=>a+b,0)};}).filter(v=>v.levels>0).sort((a,b)=>b.levels-a.levels||a.totalMs-b.totalMs||a.name.localeCompare(b.name)||a.id.localeCompare(b.id)).slice(0,3).map(({name,levels,totalMs})=>({name,levels,totalMs}));}
function createBalloonMazeScoreStore({supabase=null,dataDir,classSession="legacy"}){
 if(classSession!=="legacy"&&!/^[A-Za-z0-9_-]{16,100}$/.test(classSession))throw Error("Invalid class session");
 const rowId=classSession==="legacy"?ROW:ROW+"-class-"+classSession;
 const file=path.join(dataDir,classSession==='legacy'?'balloon-maze-times.json':'balloon-maze-times-class-'+classSession+'.json');let queue=Promise.resolve();
 const serial=fn=>{const next=queue.then(fn,fn);queue=next.catch(()=>{});return next;};
 function readLocal(){if(fs.existsSync(file))return normalize(JSON.parse(fs.readFileSync(file,'utf8')));const doc=fresh();writeLocal(doc);return doc;}
 function writeLocal(doc){fs.mkdirSync(dataDir,{recursive:true});const temp=file+'.'+crypto.randomUUID()+'.tmp';try{fs.writeFileSync(temp,JSON.stringify(doc));fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
 async function readRemote(){const {data,error}=await supabase.from('app_settings').select('settings').eq('id',rowId).maybeSingle();if(error)throw error;return data?normalize(data.settings):null;}
 async function remote(record){for(let i=0;i<16;i++){
  let doc=await readRemote();if(!doc){const initial=fresh();const {error}=await supabase.from('app_settings').insert({id:rowId,settings:initial,updated_at:new Date().toISOString()});if(error){if(error.code==='23505')continue;throw error;}doc=initial;}
  if(!record)return doc;const next=apply(doc,record);if(next===doc)return doc;
  const {data,error}=await supabase.from('app_settings').update({settings:next,updated_at:new Date().toISOString()}).eq('id',rowId).eq('settings->>revision',doc.revision).select('settings');if(error)throw error;if(Array.isArray(data)&&data.length)return normalize(data[0].settings);
 }throw Error('Score storage busy');}
 async function reset(){return serial(async()=>{
  if(supabase){
   for(let i=0;i<16;i++){
    const doc=await readRemote();
    if(!doc){const initial=fresh();const {error}=await supabase.from('app_settings').insert({id:rowId,settings:initial,updated_at:new Date().toISOString()});if(error){if(error.code==='23505')continue;throw error;}return initial;}
    const next=fresh();
    const {data,error}=await supabase.from('app_settings').update({settings:next,updated_at:new Date().toISOString()}).eq('id',rowId).eq('settings->>revision',doc.revision).select('settings');
    if(error)throw error;
    if(Array.isArray(data)&&data.length)return normalize(data[0].settings);
   }
   throw Error('Score reset busy');
  }
  const old=readLocal();
  if(fs.existsSync(file))fs.copyFileSync(file,file+'.before-reset-'+Date.now()+'.bak');
  const next=fresh();writeLocal(next);return next;
 });}
 return {reset,read(){return serial(async()=>supabase?remote(null):readLocal());},submit(value){const r=value&&value.rename===true&&typeof value.studentId==='string'&&/^[a-zA-Z0-9_-]{16,100}$/.test(value.studentId)&&cleanName(value.name)?{rename:true,studentId:value.studentId,name:cleanName(value.name),sessionId:value.sessionId}:validate(value);return serial(async()=>{if(supabase)return remote(r);const old=readLocal(),next=apply(old,r);if(next!==old)writeLocal(next);return next;});},leaderboard};
}
module.exports={createBalloonMazeScoreStore,validate,apply,leaderboard};
