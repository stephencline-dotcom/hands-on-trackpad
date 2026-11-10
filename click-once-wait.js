/* Shared Click Once & Wait helper. Games opt in by calling start/finish and repeatedClick. */
(function(){'use strict';
 let enabled=true,mode='repeated',speech=false,busy=false,clicks=0,lastNotice=0;
 let banner=null,hideTimer=null,visibleUntil=0,audioAllowed=()=>true;
 function ensure(){if(banner)return;banner=document.createElement('div');banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');banner.style.cssText='position:fixed;left:50%;top:45%;transform:translateX(-50%);z-index:99990;background:#fff7d9;color:#31513c;border:5px solid #e6b953;border-radius:22px;padding:27px 38px;font:bold 31px system-ui;box-shadow:0 8px 25px #0003;pointer-events:none;display:none;text-align:center;max-width:85vw';banner.innerHTML='👆 Click Once!<div style="font-size:22px;margin-top:9px">Now wait for Johnny!</div>';document.body.appendChild(banner)}
 function chime(){if(!audioAllowed())return;try{let C=window.AudioContext||window.webkitAudioContext;if(!C)return;let a=window._clickWaitAudio||(window._clickWaitAudio=new C());a.resume();[520,390].forEach((f,i)=>{let o=a.createOscillator(),g=a.createGain(),at=a.currentTime+i*.12;o.frequency.value=f;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.035,at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+.17);o.connect(g);g.connect(a.destination);o.start(at);o.stop(at+.18)})}catch(e){}}
 function hide(){if(hideTimer){clearTimeout(hideTimer);hideTimer=null}visibleUntil=0;if(banner)banner.style.display='none'}
 function hideWhenReady(){hideTimer=null;let remaining=visibleUntil-Date.now();if(remaining>0){hideTimer=setTimeout(hideWhenReady,remaining);return}hide()}
 function show(){
  if(!enabled||!busy)return;
  ensure();let t=Date.now();
  if(banner.style.display==='block'||t-lastNotice<2400)return;
  banner.style.display='block';banner.style.opacity='1';visibleUntil=t+3000;
  chime();
  if(hideTimer)clearTimeout(hideTimer);
  hideTimer=setTimeout(hideWhenReady,3000);
  if(speech&&t-lastNotice>3500&&'speechSynthesis'in window){try{let u=new SpeechSynthesisUtterance('Click once, then wait!');u.rate=.9;window.speechSynthesis.speak(u)}catch(e){}}
  lastNotice=t;
 }
 function finishNotice(){if(banner&&banner.style.display==='block'&&Date.now()<visibleUntil)return;hide()}
 window.ClickOnceWait={attach(o){this.configure(o||{});ensure()},configure(o){if('enabled'in o)enabled=!!o.enabled;if('mode'in o)mode=o.mode==='always'?'always':'repeated';if('speech'in o)speech=!!o.speech;if(typeof o.audioAllowed==='function')audioAllowed=o.audioAllowed;if(!enabled)hide()},start(){if(!busy){busy=true;clicks=0;if(mode==='always')show()}},repeatedClick(){if(!busy||!enabled)return;clicks++;if(clicks>=2)show()},finish(){busy=false;clicks=0;finishNotice()},reset(){busy=false;clicks=0;hide()}};
})();
