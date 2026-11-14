'use strict';
/* A separate app_settings row stores each student's best score for this game.
   Compare-and-swap revisions preserve simultaneous submissions across servers. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROW_ID='hands-on-trackpad-hoop-hopper-scores-v1';
const studentKey=v=>v.name?'name:'+v.name.normalize('NFKC').toLowerCase():'device:'+(v.studentId||v.runId);
function cleanName(value){return typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,40):'';}
function validRun(value){return typeof value==='string'&&/^[A-Za-z0-9_-]{16,100}$/.test(value);}
function entry(value){if(!value||!validRun(value.runId)||!Number.isInteger(value.score)||value.score<1||value.score>5000000)throw Object.assign(new Error('Invalid score'),{status:400});return {runId:value.runId,score:value.score,name:cleanName(value.name),studentId:validRun(value.studentId)?value.studentId:'',at:Date.now()};}
function fresh(){return {revision:crypto.randomUUID(),students:[],top:[],recent:[]};}
function rank(students){return students.slice().sort((a,b)=>b.score-a.score||a.at-b.at||studentKey(a).localeCompare(studentKey(b)));}
function normalized(raw){
 if(!raw||typeof raw.revision!=='string'||!Array.isArray(raw.top))throw new Error('Score data is unavailable');
 const unique=new Map();
 for(const value of (Array.isArray(raw.students)?raw.students:raw.top)){const record={...entry(value),at:Number(value.at)||0},key=studentKey(record),old=unique.get(key);if(!old||record.score>old.score||(record.score===old.score&&record.at<old.at))unique.set(key,record);}
 const students=rank([...unique.values()]);return {revision:raw.revision,students,top:students.slice(0,3),recent:[]};
}
function merge(doc,record){
 const key=studentKey(record),previous=doc.students.find(v=>studentKey(v)===key);
 if(previous&&previous.score>=record.score)return doc;
 const students=rank([...doc.students.filter(v=>studentKey(v)!==key),record]);
 return {revision:crypto.randomUUID(),students,top:students.slice(0,3),recent:[]};
}
function createHoopScoreStore({supabase=null,dataDir,gameKey="hoop-hopper"}){
 if(!/^[a-z0-9-]{1,70}$/.test(gameKey))throw new Error('Invalid game');
 const rowId=gameKey==='hoop-hopper'?ROW_ID:'hands-on-trackpad-scores-'+gameKey+'-v1';
 const file=path.join(dataDir,gameKey==='hoop-hopper'?'hoop-hopper-scores.json':'game-scores-'+gameKey+'.json');let queue=Promise.resolve();
 const serial=fn=>{const next=queue.then(fn,fn);queue=next.catch(()=>{});return next;};
 async function readRemote(){const {data,error}=await supabase.from('app_settings').select('settings').eq('id',rowId).maybeSingle();if(error)throw error;return data?normalized(data.settings):null;}
 async function remote(record){for(let attempt=0;attempt<16;attempt++){
  let doc=await readRemote();
  if(!doc){const initial=fresh();const {error}=await supabase.from('app_settings').insert({id:rowId,settings:initial,updated_at:new Date().toISOString()});if(error){if(error.code==='23505')continue;throw error;}doc=initial;}
  if(!record)return doc;
  const next=merge(doc,record);if(next===doc)return doc;
  const {data,error}=await supabase.from('app_settings').update({settings:next,updated_at:new Date().toISOString()}).eq('id',rowId).eq('settings->>revision',doc.revision).select('settings');
  if(error)throw error;if(Array.isArray(data)&&data.length)return normalized(data[0].settings);
 }throw new Error('Score storage is busy. Retry shortly.');}
 function readLocal(){if(!fs.existsSync(file))return fresh();return normalized(JSON.parse(fs.readFileSync(file,'utf8')));}
 function writeLocal(doc){fs.mkdirSync(dataDir,{recursive:true});const temporary=path.join(dataDir,'game-scores-'+gameKey+'-'+crypto.randomUUID()+'.tmp');try{fs.writeFileSync(temporary,JSON.stringify(doc));fs.renameSync(temporary,file);}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}}
 return {read(){return serial(async()=>supabase?remote(null):readLocal());},submit(value){const record=entry(value);return serial(async()=>{if(supabase)return remote(record);const old=readLocal(),next=merge(old,record);if(next!==old)writeLocal(next);return next;});}};
}
module.exports={createHoopScoreStore,cleanName,ROW_ID};
