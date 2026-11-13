(() => {
  "use strict";
  const pages=["index.html","level2.html","level3.html","level4.html"];
  const current=pages.indexOf(location.pathname.split("/").pop()||"index.html");
  if(current<0||current>=pages.length-1)return;
  window.trackpadTeacherSkipAdapter={advance(){
    if(current>=pages.length-1)return false;
    location.assign(pages[current+1]);
    return true;
  }};
})();
