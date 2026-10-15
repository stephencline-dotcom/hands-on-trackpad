/* Escape geometry: both pigs follow the path through the gate, one at a time. */
(function(root){'use strict';
const gate={centerX:963,planeY:451,openingLeft:918,openingRight:1009};
const clamp=x=>Math.max(0,Math.min(1,x));
const opening=elapsed=>clamp(elapsed/.55);
function bezier(a,b,c,d,t){const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;}
function position(chapter,brother,elapsed){
 const two=chapter==='sticks',startX=two?(brother?842:770):794,startY=two&&brother?491:493;
 const delay=two&&!brother?1.2:0,local=Math.max(0,elapsed-.55-delay);let x=startX,footY=startY;
 if(local<=1.1){const t=clamp(local/1.1);x=bezier(startX,startX+50,963,963,t);footY=bezier(startY,500,516,494,t);}
 else if(local<=2.5){const t=(local-1.1)/1.4;x=bezier(963,963,963,974,t);footY=bezier(494,470,422,404,t);}
 else{const t=clamp((local-2.5)/1.2);x=bezier(974,1020,1080,1148,t);footY=bezier(404,395,394,392,t);}
 const scale=footY<gate.planeY?1-(gate.planeY-footY)*.0012:1;
 return {x,footY,scale,brother,farSide:footY<=gate.planeY,walking:local>0&&local<3.7,y:footY-57*scale*(brother?1.06:1)};
}
function actors(chapter,elapsed){return chapter==='sticks'?[position(chapter,false,elapsed),position(chapter,true,elapsed)]:[position(chapter,false,elapsed)];}
const duration=chapter=>.55+3.7+(chapter==='sticks'?1.2:0);
const api={gate,opening,position,actors,duration};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PigsEscapeRoute=api;
})(typeof window!=='undefined'?window:globalThis);
