/* Complete races, with prerequisites taught inside each selected route. */
(function(root){
'use strict';
const P=root.TortoisePuzzles,fullBank=P.bank;
const routes={short:[0,2,6,9,15,17],medium:[0,1,2,3,4,5,6,7,8,9,15,17],long:Array.from({length:18},(_,i)=>i)};
P.normalizeJourneyLength=value=>Object.hasOwn(routes,value)?value:'medium';
P.setJourneyLength=function(value){const length=P.normalizeJourneyLength(value);P.journeyLength=length;P.bank=routes[length].map((source,index)=>fullBank[source].map(p=>({...p,level:index+1,sourceStop:source+1,support:length==='long'?p.support:length==='short'?index<3?'teach':index<5?'practice':'solve':index<9?'teach':index<10?'practice':'solve'})));return length;};
P.journeyProgressKey=()=>`tortoiseJourneyStop-v3-${P.journeyLength||'medium'}`;
P.journeyRoutes=routes;
})(window);