/* Shared classroom Home controls. Admin identity always comes from the server. */
(() => {
  'use strict';
  if(window.studentHomeButtonPolicy)return;
  // Settings/dashboard navigation remains available even on their login screen.
  if(/\/(?:admin(?:-settings)?|teacher)\.html$/i.test(location.pathname))return;
  const KEY='studentHomeButtonEnabled',MARK='data-student-home-control';
  const controls=new Set();
  let enabled=true,teacher=false,pending=true,busy=false,stopped=false;
  try{enabled=localStorage.getItem(KEY)!=='false';}catch{}
  const style=document.createElement('style');
  style.id='studentHomeButtonPolicyStyle';
  style.textContent=`html.student-home-buttons-hidden [${MARK}]{display:none!important;visibility:hidden!important;pointer-events:none!important}`;
  document.head.append(style);
  function homeControl(el){
    if(!(el instanceof Element)||!el.matches('a,button,[role="button"],input[type="button"],input[type="submit"]'))return false;
    if(el.matches('a[href]')){
      try{const url=new URL(el.getAttribute('href'),location.href);if(url.origin===location.origin&&(url.pathname==='/'||url.pathname==='/index.html'))return true;}catch{}
    }
    if(/^backToMenu/i.test(el.id)||el.matches('.level-result-home,[data-home-button]'))return true;
    const labels=[el.getAttribute('aria-label'),el.getAttribute('title'),el.value,el.textContent];
    return labels.some(value=>{
      const text=String(value||'').replace(/[^a-z\s]/gi,' ').replace(/\s+/g,' ').trim();
      return /^(?:(?:back|return|go)(?: to)? )?(?:the )?(?:home(?: ?page| screen)?|main menu|back to menu)$/i.test(text);
    });
  }
  function mark(el){if(homeControl(el)){if(!el.hasAttribute(MARK))el.setAttribute(MARK,'');controls.add(el);}else if(controls.has(el)){el.removeAttribute(MARK);controls.delete(el);}}
  function scan(root){
    if(root instanceof Element){mark(root);const owner=root.closest('a,button,[role="button"]');if(owner)mark(owner);}
    for(const el of root.querySelectorAll?.('a,button,[role="button"],input[type="button"],input[type="submit"]')||[])mark(el);
  }
  function apply(){
    // During the first settings/session check, keep Home controls out of the
    // tab order and pointer flow. A verified admin then gets them back.
    document.documentElement.classList.toggle('student-home-buttons-hidden',pending||(!enabled&&!teacher));
    for(const el of controls)if(!el.isConnected)controls.delete(el);
  }
  function block(event){
    if(!(pending||(!enabled&&!teacher)))return;
    const el=event.target instanceof Element?event.target.closest('a,button,[role="button"],input'):null;
    if(el&&homeControl(el)){event.preventDefault();event.stopImmediatePropagation();}
  }
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList'){for(const node of record.addedNodes)if(node instanceof Element)scan(node);if(record.target instanceof Element)scan(record.target);}
      else if(record.target instanceof Element)scan(record.target);
      else if(record.target.parentElement)scan(record.target.parentElement);
    }
  });
  scan(document);apply();
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['href','aria-label','title','id','role','value']});
  for(const event of ['click','auxclick','keydown'])document.addEventListener(event,e=>{
    if(event!=='keydown'||e.key==='Enter'||e.key===' ')block(e);
  },true);
  async function refresh(){
    if(busy||stopped||document.hidden)return;
    busy=true;
    try{
      const [settingsResult,sessionResult]=await Promise.allSettled([
        fetch('/api/settings',{credentials:'same-origin',cache:'no-store'}),
        fetch('/api/teacher-session',{credentials:'same-origin',cache:'no-store'})
      ]);
      if(settingsResult.status==='fulfilled'&&settingsResult.value.ok){
        const settings=await settingsResult.value.json();enabled=settings[KEY]!==false;
        try{localStorage.setItem(KEY,String(enabled));}catch{}
      }
      teacher=false;
      if(sessionResult.status==='fulfilled'&&sessionResult.value.ok){
        const session=await sessionResult.value.json();teacher=session.authenticated===true;
      }
    }catch{teacher=false;}
    finally{pending=false;busy=false;apply();}
  }
  const interval=setInterval(refresh,3000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  window.addEventListener('pageshow',refresh);
  window.addEventListener('pagehide',event=>{if(!event.persisted){stopped=true;clearInterval(interval);observer.disconnect();}},{once:true});
  window.studentHomeButtonPolicy=Object.freeze({refresh});
  refresh();
})();
