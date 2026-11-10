(()=>{'use strict';
const $=id=>document.getElementById(id),api=window.TurkeyStudioAPI,M=window.TurkeyModel;
if(!api)return;
const toolbar=document.createElement('div');toolbar.className='playground-tools';toolbar.innerHTML=`<button id="magic" class="picture-action magic-action" type="button" aria-label="Magic Surprise: add three silly decorations" title="Magic Surprise"><svg viewBox="0 0 90 76" aria-hidden="true"><path d="M24 58L63 19" stroke="#7c4b98" stroke-width="11" stroke-linecap="round"/><path d="M24 58L63 19" stroke="#d7a9ef" stroke-width="6" stroke-linecap="round"/><path d="M64 3l6 12 13 3-12 7-2 14-10-10-14 2 7-12-4-13 13 6z" fill="#ffd14f" stroke="#a76a26" stroke-width="2.5"/><path d="M13 9v15M5 16h16M79 48v15M71 56h16" stroke="#e9a742" stroke-width="4" stroke-linecap="round"/><circle cx="15" cy="40" r="5" fill="#ed8eaa"/><circle cx="54" cy="60" r="4" fill="#6db4ca"/></svg><span>Surprise!</span></button><button id="photo" class="picture-action photo-action" type="button" aria-label="Photo Booth: frame and save your turkey picture" title="Photo Booth"><svg viewBox="0 0 90 76" aria-hidden="true"><rect x="12" y="20" width="65" height="43" rx="8" fill="#72b4ca" stroke="#486778" stroke-width="4"/><rect x="22" y="13" width="21" height="11" rx="3" fill="#e9a24c" stroke="#99632e" stroke-width="3"/><circle cx="44" cy="42" r="18" fill="#fff3d6" stroke="#486778" stroke-width="4"/><circle cx="44" cy="42" r="11" fill="#a86c44"/><path d="M35 35l-4-10 8 5 5-12 5 12 8-5-4 10" fill="#f5b957" stroke="#8f593a" stroke-width="2"/><circle cx="40" cy="40" r="2" fill="#27221e"/><circle cx="48" cy="40" r="2" fill="#27221e"/><path d="M40 46l4 4 4-4" fill="#ffd06c"/><circle cx="66" cy="29" r="4" fill="#fff4b4"/></svg><span>Photo Booth</span></button>`;
document.querySelector('.finish-tools').insertBefore(toolbar, document.getElementById('save'));
const panel=document.createElement('section');panel.className='playground-panel';panel.hidden=true;panel.setAttribute('aria-label','Creative playground');$('stage').parentElement.append(panel);
let boothStyle=0,boothOpen=false;
function closePanel(){panel.hidden=true;panel.innerHTML='';boothOpen=false;document.body.classList.remove('booth-open');}
function showPanel(html){panel.innerHTML=html;panel.hidden=false;document.body.classList.add('booth-open');panel.querySelector('[data-close]')?.addEventListener('click',closePanel);}
panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Turkey Photo Booth');
const shade=document.createElement('div');shade.className='playground-shade';shade.addEventListener('click',closePanel);document.body.append(shade);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&boothOpen){e.preventDefault();closePanel();}});
$('magic').onclick=()=>{
  if(!api.usable())return;
  api.commitMove();
  const d=api.getDesign(),before=M.copy(d);
  const pools=[
    [{kind:'hat',styles:[0,1,2,3,4,5]},{kind:'glasses',styles:[0,1,2,3,4,5]},{kind:'sticker',styles:[0,2,6]}],
    [{kind:'eyes',styles:[0,1,2,3,4,5,6,7]},{kind:'beak',styles:[0,1,2,3,4,5,6,7]},{kind:'sticker',styles:[0,2,6]}],
    [{kind:'hat',styles:[0,1,2,3,4,5]},{kind:'costume',styles:[2,3,4]},{kind:'fun',styles:[3,5,6,7,8]}],
    [{kind:'glasses',styles:[0,1,2,3,4,5]},{kind:'sticker',styles:[0,2,6]},{kind:'fun',styles:[2,6,7,8]}]
  ];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const used=new Set(d.parts.map(p=>p.kind+':'+p.style));
  const combo=pick(pools);
  let added=0;
  for(const slot of combo){
    if(d.parts.length>=60)break;
    const available=slot.styles.filter(style=>!used.has(slot.kind+':'+style));
    const style=pick(available.length?available:slot.styles);
    const p=M.add(d,slot.kind,style);
    if(!p)continue;
    // M.add supplies item-specific design coordinates. Do not scatter them randomly.
    // Multiple copies are offset slightly by M.add so they remain independently editable.
    used.add(slot.kind+':'+style);
    added++;
  }
  if(added){
    api.history.save(before);api.save();api.react('fun',4);api.playGobble();
    $('message').textContent='Surprise! '+added+' new decorations! Undo removes them together.';
  }else $('message').textContent='Your turkey is full of decorations!';
};
const frameNames=['Thanksgiving Postcard','Runaway Turkey Poster','Turkey Star Magazine','Turkey of the Year'];
function photoCanvas(){const cv=document.createElement('canvas');cv.width=1000;cv.height=600;const g=cv.getContext('2d');window.TurkeyArt.create(g).draw(api.getDesign(),0);g.save();g.lineWidth=22;g.strokeStyle=['#bf743b','#8b5337','#a47baf','#d4a63c'][boothStyle];g.strokeRect(12,12,976,576);g.fillStyle='#fff6dc';g.strokeStyle='#845a42';g.lineWidth=3;g.beginPath();g.roundRect(205,14,590,62,18);g.fill();g.stroke();g.fillStyle='#70462f';g.font='bold 31px system-ui';g.textAlign='center';g.fillText(frameNames[boothStyle],500,55);if(boothStyle===1){g.fillStyle='#fff6dc';g.fillRect(275,526,450,45);g.fillStyle='#784a34';g.font='bold 25px system-ui';g.fillText('HAVE YOU SEEN THIS TURKEY?',500,557);}else if(boothStyle===3){g.font='50px system-ui';g.fillText('★',90,88);g.fillText('★',910,88);}g.restore();return cv;}
function download(cv){const a=document.createElement('a');a.download='my-turkey-photo-booth.png';a.href=cv.toDataURL('image/png');document.body.append(a);a.click();a.remove();}
function booth(){boothOpen=true;showPanel(`<div class="playground-panel-head"><strong>📸 Turkey Photo Booth</strong><button data-close type="button" aria-label="Close photo booth">✕</button></div><div class="booth-choices">${frameNames.map((name,i)=>`<button type="button" data-frame="${i}" aria-pressed="${boothStyle===i}">${['🍁','🔎','⭐','🏆'][i]} ${name}</button>`).join('')}</div><canvas id="boothPreview" width="1000" height="600" aria-label="Your framed turkey picture"></canvas><div class="playground-actions"><button id="boothSave" type="button">💾 Save framed picture</button><button id="boothPrint" type="button">🖨 Print</button></div>`);function refresh(){const preview=$('boothPreview');preview.getContext('2d').drawImage(photoCanvas(),0,0);panel.querySelectorAll('[data-frame]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.frame===boothStyle)));}panel.querySelectorAll('[data-frame]').forEach(b=>b.onclick=()=>{boothStyle=+b.dataset.frame;refresh();});$('boothSave').onclick=()=>{download(photoCanvas());$('message').textContent='Your framed turkey picture is ready!';};$('boothPrint').onclick=()=>{const url=photoCanvas().toDataURL('image/png');const w=window.open('','_blank');if(!w){$('message').textContent='Allow pop-ups to print, or save the picture first.';return;}w.document.write('<!doctype html><title>My Turkey</title><style>body{margin:0;text-align:center}img{max-width:100%;max-height:95vh}</style><img src="'+url+'" onload="window.print()">');w.document.close();};refresh();panel.querySelector('[data-close]')?.focus();}
$('photo').onclick=()=>{if(!api.usable())return;api.commitMove();booth();};
window.TurkeyPlayground={fashionStart(){closePanel();},fashionEnd(){},frame(){},pause(){closePanel();},mute(){}};
})();
