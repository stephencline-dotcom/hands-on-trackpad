/* Decoded background audio with a short overlap at the loop boundary. */
(function(root){'use strict';
function seamlessBuffer(ctx,input){const fade=Math.min(Math.round(input.sampleRate*.18),Math.floor(input.length/10));if(fade<2)return input;const out=ctx.createBuffer(input.numberOfChannels,input.length-fade,input.sampleRate);for(let c=0;c<input.numberOfChannels;c++){const src=input.getChannelData(c),dest=out.getChannelData(c);for(let i=0;i<fade;i++){const t=i/(fade-1);dest[i]=src[input.length-fade+i]*(1-t)+src[i]*t;}dest.set(src.subarray(fade,input.length-fade),fade);}return out;}
class Background{
 constructor(path){this.path=path;this.ctx=null;this.buffer=null;this.source=null;this.gain=null;this.loading=null;this.wanted=false;this.paused=true;this.offset=0;this.at=0;}
 prepare(){if(this.loading)return this.loading;try{const AudioContext=root.AudioContext||root.webkitAudioContext;if(!AudioContext||!this.path)return Promise.resolve();this.ctx ||= new AudioContext();this.gain ||= this.ctx.createGain();this.gain.gain.value=.22;this.gain.connect(this.ctx.destination);this.ctx.resume()?.catch(()=>{});this.loading=fetch(this.path).then(r=>{if(!r.ok)throw Error('Background audio unavailable');return r.arrayBuffer();}).then(bytes=>this.ctx.decodeAudioData(bytes)).then(decoded=>{this.buffer=seamlessBuffer(this.ctx,decoded);this.play();}).catch(()=>{this.loading=null;});return this.loading;}catch{return Promise.resolve();}}
 play(){if(!this.wanted||this.paused||!this.buffer||this.source)return;const source=this.ctx.createBufferSource();source.buffer=this.buffer;source.loop=true;source.connect(this.gain);this.at=this.ctx.currentTime;this.source=source;source.start(0,this.offset%this.buffer.duration);}
 start(){this.wanted=true;this.paused=false;this.ctx?.resume()?.catch(()=>{});if(this.buffer)this.play();else this.prepare();}
 pause(){this.paused=true;if(this.source){this.offset=(this.offset+this.ctx.currentTime-this.at)%this.buffer.duration;try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}this.ctx?.suspend()?.catch(()=>{});}
 resume(){if(!this.wanted)return;this.paused=false;this.ctx?.resume()?.catch(()=>{});if(this.buffer)this.play();else this.prepare();}
 stop(){this.wanted=false;this.pause();this.offset=0;}
}
root.SheepRoundupBackground={create:path=>new Background(path),seamlessBuffer};
})(window);
