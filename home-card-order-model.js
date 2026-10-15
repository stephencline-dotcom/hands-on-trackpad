/* Stable IDs keep saved order independent of titles, thumbnails and new games. */
(function(root){'use strict';
function normalize(value){if(!Array.isArray(value))return [];const seen=new Set(),out=[];for(const id of value.slice(0,256)){if(typeof id==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,95}$/.test(id)&&!seen.has(id)){seen.add(id);out.push(id);}}return out;}
function arrange(defaults,saved){const known=normalize(defaults),set=new Set(known),order=normalize(saved).filter(id=>set.has(id)),used=new Set(order);return order.concat(known.filter(id=>!used.has(id)));}
function move(ids,id,delta){const out=[...ids],from=out.indexOf(id);if(from<0)return out;const to=Math.max(0,Math.min(out.length-1,from+delta));out.splice(from,1);out.splice(to,0,id);return out;}
function drop(ids,id,target){const out=[...ids],from=out.indexOf(id),to=out.indexOf(target);if(from<0||to<0||from===to)return out;out.splice(from,1);out.splice(to,0,id);return out;}
function same(a,b){return JSON.stringify(normalize(a))===JSON.stringify(normalize(b));}
const api={normalize,arrange,move,drop,same};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HomeCardOrderModel=api;
})(typeof window!=='undefined'?window:globalThis);
