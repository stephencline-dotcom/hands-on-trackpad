(()=>{'use strict';
const canvas=document.querySelector('#farm, #game');
const eyes=document.getElementById('show')||document.getElementById('eyes');
if(!canvas||!eyes)return;
const board=canvas.parentElement;
const layer=document.createElement('div');layer.className='johnny-eyes-layer';layer.setAttribute('aria-hidden','true');
const cursor=document.createElement('div');cursor.className='johnny-eyes-pointer';cursor.textContent='☝';
const halo=document.createElement('div');halo.className='johnny-eyes-halo';
const words=document.createElement('div');words.className='johnny-eyes-words';
layer.append(halo,cursor,words);board.appendChild(layer);
const style=document.createElement('style');style.textContent=`
.johnny-eyes-layer{position:absolute;inset:0;pointer-events:none;z-index:12;overflow:hidden;display:none}
.johnny-eyes-pointer{position:absolute;font:normal 52px system-ui;transform:translate(-20%,-8%);filter:drop-shadow(0 3px 2px #253c4c);transition:left .7s ease-in-out,top .7s ease-in-out;z-index:2}
.johnny-eyes-halo{position:absolute;width:76px;height:76px;border:7px dashed #ffdb32;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 5px #ffffffbb,0 0 22px #ffe17d;animation:johnnyEyesPulse .9s ease-in-out infinite alternate}
.johnny-eyes-words{position:absolute;left:50%;top:5%;transform:translateX(-50%);padding:8px 17px;background:#fff9d9;color:#244935;border:3px solid #e6b840;border-radius:18px;font:bold clamp(14px,2vw,24px) system-ui;text-align:center;max-width:90%;box-shadow:0 5px 0 #3c694c}
@keyframes johnnyEyesPulse{to{transform:translate(-50%,-50%) scale(1.2);opacity:.65}}
@keyframes johnnyEyesButton{50%{transform:scale(1.13);box-shadow:0 0 0 8px #ffe76b77}}
.johnny-eyes-attention{animation:johnnyEyesButton 1.35s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.johnny-eyes-halo,.johnny-eyes-attention{animation:none}.johnny-eyes-pointer{transition:none}}
`;document.head.appendChild(style);
let timer=0,step=0,sequence=[],active=false,lastSignature='',idleSince=performance.now(),lastPointer=performance.now();
const coords=p=>{const r=canvas.getBoundingClientRect(),b=board.getBoundingClientRect(),s=Math.min(r.width/canvas.width,r.height/canvas.height);return{x:r.left-b.left+(r.width-canvas.width*s)/2+p.x*s,y:r.top-b.top+(r.height-canvas.height*s)/2+p.y*s}};
function position(p){const q=coords(p);cursor.style.left=halo.style.left=q.x+'px';cursor.style.top=halo.style.top=q.y+'px'}
function stop(){clearTimeout(timer);active=false;layer.style.display='none';document.body.classList.remove('johnny-eyes-demonstrating');idleSince=performance.now()}
function play(){if(!window.johnnyEyesNext||active)return;const data=window.johnnyEyesNext();if(!data||!data.points?.length)return;
 sequence=data.points;step=0;active=true;layer.style.display='block';words.textContent=data.label||'Watch where to move!';eyes.classList.remove('johnny-eyes-attention');document.body.classList.add('johnny-eyes-demonstrating');
 const tick=()=>{if(!active)return;position(sequence[Math.min(step,sequence.length-1)]);if(step>=sequence.length){timer=setTimeout(stop,700);return}step++;timer=setTimeout(tick,900)};tick();}
window.johnnyEyesIsShowing=()=>active;
eyes.addEventListener('click',()=>{stop();play()},true);
canvas.addEventListener('pointerdown',()=>{if(!active){idleSince=performance.now();eyes.classList.remove('johnny-eyes-attention')}},true);
canvas.addEventListener('pointermove',()=>{lastPointer=performance.now()}, {passive:true});
setInterval(()=>{if(document.hidden||active||!window.johnnyEyesNext)return;const data=window.johnnyEyesNext();if(!data){eyes.classList.remove('johnny-eyes-attention');return}const signature=data.signature||data.label;if(signature!==lastSignature){lastSignature=signature;idleSince=performance.now();eyes.classList.remove('johnny-eyes-attention')}else if(performance.now()-idleSince>15000&&performance.now()-lastPointer>4000){eyes.classList.add('johnny-eyes-attention')}},1100);
window.addEventListener('pagehide',stop);
})();
