/* Shared validation for teacher controls, game state and server persistence. */
(function(root){'use strict';
const defaults=[{animals:1,gatherers:1,animalInterval:8,gathererInterval:12},{animals:2,gatherers:1,animalInterval:7,gathererInterval:10},{animals:3,gatherers:1,animalInterval:6,gathererInterval:9}];
function number(value,fallback,min,max){if(value===null||typeof value==='boolean'||typeof value==='object'||typeof value==='undefined'||String(value).trim()==='')return fallback;const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):fallback;}
function normalize(value){return defaults.map((d,i)=>{const row=Array.isArray(value)&&value[i]&&typeof value[i]==='object'?value[i]:{};return {animals:number(row.animals,d.animals,0,12),gatherers:number(row.gatherers,d.gatherers,0,12),animalInterval:number(row.animalInterval,d.animalInterval,3,60),gathererInterval:number(row.gathererInterval,d.gathererInterval,3,60)};});}
function normalizeCamp(value){return number(value,40,0,100);}
const api={normalize,normalizeCamp};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.RiverVisitorSettings=api;
})(typeof window==='undefined'?null:window);
