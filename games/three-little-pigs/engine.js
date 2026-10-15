/* Three Little Pigs: straw and sticks. Pure construction and story rules. */
(function(root){
'use strict';
const slots=[
 {id:'wall-left',kind:'wall',x:493,y:354,w:78,h:168},
 {id:'wall-middle',kind:'wall',x:574,y:354,w:78,h:168},
 {id:'wall-right',kind:'wall',x:655,y:354,w:78,h:168},
 {id:'roof-left',kind:'roof',x:500,y:226,w:148,h:110},
 {id:'roof-right',kind:'roof',x:648,y:226,w:148,h:110},
 {id:'door',kind:'door',x:574,y:395,w:66,h:116}
];
const stickSlots=[
 {id:'post-left',kind:'post',x:449,y:354,w:24,h:176},
 {id:'post-middle',kind:'post',x:574,y:354,w:24,h:176},
 {id:'post-right',kind:'post',x:699,y:354,w:24,h:176},
 {id:'beam',kind:'beam',x:574,y:271,w:282,h:24},
 {id:'panel-left',kind:'panel',x:510,y:361,w:97,h:152},
 {id:'panel-right',kind:'panel',x:638,y:361,w:97,h:152},
 {id:'roof-left',kind:'roof',x:500,y:222,w:148,h:110},
 {id:'roof-right',kind:'roof',x:648,y:222,w:148,h:110},
 {id:'door',kind:'door',x:574,y:395,w:66,h:116}
];
const brickSlots=[
 {id:'base-left',kind:'base',x:477,y:431,w:94,h:42},
 {id:'base-middle',kind:'base',x:574,y:431,w:94,h:42},
 {id:'base-right',kind:'base',x:671,y:431,w:94,h:42},
 {id:'brick-left',kind:'brick',x:477,y:342,w:94,h:134},
 {id:'brick-middle',kind:'brick',x:574,y:342,w:94,h:134},
 {id:'brick-right',kind:'brick',x:671,y:342,w:94,h:134},
 {id:'chimney',kind:'chimney',x:690,y:213,w:44,h:102},
 {id:'roof-left',kind:'roof',x:500,y:222,w:148,h:110},
 {id:'roof-right',kind:'roof',x:648,y:222,w:148,h:110},
 {id:'door',kind:'door',x:574,y:395,w:66,h:116}
];
const bases=['base-left','base-middle','base-right'],brickWalls=['brick-left','brick-middle','brick-right'];
const frame=['post-left','post-middle','post-right','beam'];
const levels=[
 {title:'A wall of straw',intro:'Slide a straw bundle into a wall space.',need:['wall-left','wall-middle','wall-right'],built:[],guided:true,chapter:'straw',finish:'wall'},
 {title:'A roof for Pig',intro:'Add the roof and door. Then invite Pig inside.',need:['roof-left','roof-right','door'],built:['wall-left','wall-middle','wall-right'],guided:true,chapter:'straw',finish:'shelter'},
 {title:'Build it yourself!',intro:'Build a whole straw house. Get Pig safely inside.',need:slots.map(s=>s.id),built:[],guided:false,chapter:'straw',finish:'wolf'},
 {title:'Big Brother’s workshop',intro:'Two little pigs need a house! Stand up three posts, then rest the long beam across them.',need:frame,built:[],guided:true,chapter:'sticks',finish:'frame'},
 {title:'A home for two',intro:'Add the stick walls, then the roof and door. Bring both brothers inside.',need:['panel-left','panel-right','roof-left','roof-right','door'],built:frame,guided:true,chapter:'sticks',finish:'shelter'},
 {title:'Can sticks stop the wolf?',intro:'Build the whole stick house yourself. Posts first, then the beam, walls, roof and door.',need:stickSlots.map(s=>s.id),built:[],guided:false,chapter:'sticks',finish:'wolf'},
 {title:'Big Brother builds with bricks',intro:'Three brothers need a strong home. Fit the three brick foundations along the ground.',need:bases,built:[],guided:true,chapter:'bricks',finish:'foundation'},
 {title:'A home for three',intro:'Build the brick walls on their foundations. Then add the roof, door and chimney.',need:brickSlots.filter(s=>!bases.includes(s.id)).map(s=>s.id),built:bases,guided:true,chapter:'bricks',finish:'shelter'},
 {title:'The wolf’s last big puff',intro:'Build the whole brick house yourself. Keep all three brothers safe, and watch what the wolf tries next!',need:brickSlots.map(s=>s.id),built:[],guided:false,chapter:'bricks',finish:'wolf'}
];
function create(level=0,variant=0){const definition=levels[level];if(!definition)throw Error('Unknown level');return {level,variant,placed:[...definition.built],phase:'build',pigInside:false,gateOpen:false};}
function getSlots(s){return levels[s.level].chapter==='bricks'?brickSlots:levels[s.level].chapter==='sticks'?stickSlots:slots;}
function all(s,ids){return ids.every(id=>s.placed.includes(id));}
function allowed(s,kind){if(levels[s.level].chapter==='bricks'){if(kind==='base')return true;if(kind==='brick')return all(s,bases);if(kind==='chimney')return all(s,brickWalls)&&all(s,['roof-left','roof-right']);return all(s,brickWalls);} if(levels[s.level].chapter==='straw')return kind==='wall'||all(s,['wall-left','wall-middle','wall-right']);if(kind==='post')return true;if(kind==='beam')return all(s,frame.slice(0,3));if(kind==='panel')return all(s,frame);return all(s,frame)&&all(s,['panel-left','panel-right']);}
function supportHint(s,kind){if(levels[s.level].chapter==='bricks')return kind==='brick'?'Lay all three foundations on the ground first.':kind==='chimney'?'Finish both roof halves before fitting the chimney.':'Finish all three brick walls first. They hold up the roof and door.';if(levels[s.level].chapter==='straw')return 'Build all three wall sections first. They hold up the roof and door.';if(kind==='beam')return 'The long beam needs all three posts to hold it up.';if(kind==='panel')return 'Stand all three posts and fit the long beam before adding the walls.';return 'Finish both stick walls first. They hold up the roof and door.';}
function place(s,id){const slot=getSlots(s).find(p=>p.id===id);if(s.phase!=='build'||!slot||s.placed.includes(id)||!levels[s.level].need.includes(id))return {ok:false,reason:'Choose an empty building space.'};if(!allowed(s,slot.kind))return {ok:false,reason:supportHint(s,slot.kind)};s.placed.push(id);return {ok:true,complete:complete(s)};}
function complete(s){return levels[s.level].need.every(id=>s.placed.includes(id));}
function nextSlot(s){return getSlots(s).find(p=>levels[s.level].need.includes(p.id)&&!s.placed.includes(p.id)&&allowed(s,p.kind));}
function invite(s){if(s.phase!=='build'||!complete(s))return false;s.phase=['wall','frame','foundation'].includes(levels[s.level].finish)?'success':'boarding';return true;}
function board(s){if(s.phase!=='boarding')return false;s.pigInside=true;s.phase=levels[s.level].finish==='shelter'?'success':'ready';return true;}
function blow(s){if(s.phase!=='ready'||!s.pigInside)return false;s.phase='wolf';return true;}
function collapse(s){if(s.phase!=='wolf'||levels[s.level].chapter==='bricks')return false;s.phase='escape';s.pigInside=false;return true;}
function openGate(s){if(s.phase!=='escape')return false;s.gateOpen=true;s.phase='running';return true;}
function withstand(s){if(s.phase!=='wolf'||levels[s.level].chapter!=='bricks')return false;s.phase='chimney';return true;}
function closeChimney(s){if(s.phase!=='chimney')return false;s.lidClosed=true;s.phase='safe';return true;}
const api={slots,stickSlots,brickSlots,withstand,closeChimney,levels,create,getSlots,allowed,place,complete,nextSlot,invite,board,blow,collapse,openGate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PigsEngine=api;
})(typeof window!=='undefined'?window:globalThis);
