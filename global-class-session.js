'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROW='hands-on-trackpad-global-class-session-v1';
const LEGACY='legacy';
function createGlobalClassSession({supabase=null,dataDir}){
 const file=path.join(dataDir,'global-class-session.json');let queue=Promise.resolve();
 const serial=fn=>{const next=queue.then(fn,fn);queue=next.catch(()=>{});return next;};
 const fresh=()=>({revision:crypto.randomUUID(),sessionId:crypto.randomUUID()});
 const valid=v=>v&&typeof v.revision==='string'&&/^[a-zA-Z0-9_-]{16,100}$/.test(v.sessionId);
 const legacy=()=>({revision:'legacy',sessionId:LEGACY});
 function local(){if(!fs.existsSync(file))return legacy();const v=JSON.parse(fs.readFileSync(file,'utf8'));if(!valid(v))throw Error('Invalid class session');return v;}
 async function remote(){const {data,error}=await supabase.from('app_settings').select('settings').eq('id',ROW).maybeSingle();if(error)throw error;if(!data)return legacy();if(!valid(data.settings))throw Error('Invalid class session');return data.settings;}
 async function change(){if(!supabase){const next=fresh();fs.mkdirSync(dataDir,{recursive:true});const tmp=file+'.'+crypto.randomUUID()+'.tmp';try{fs.writeFileSync(tmp,JSON.stringify(next));fs.renameSync(tmp,file);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}return next;}
  for(let i=0;i<20;i++){
   const old=await remote(),next=fresh();
   if(old.sessionId===LEGACY){const {error}=await supabase.from('app_settings').insert({id:ROW,settings:next,updated_at:new Date().toISOString()});if(error){if(error.code==='23505')continue;throw error;}return next;}
   const {data,error}=await supabase.from('app_settings').update({settings:next,updated_at:new Date().toISOString()}).eq('id',ROW).eq('settings->>revision',old.revision).select('settings');if(error)throw error;if(Array.isArray(data)&&data.length)return next;
  }
  throw Error('Class session busy');
 }
 return {read:()=>serial(()=>supabase?remote():local()),start:()=>serial(change)};
}
module.exports={createGlobalClassSession};
