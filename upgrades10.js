// 칼퇴 디펜스 — 영구 성장(연봉 협상 · 복지) 모듈 v10 (upgrades.js + 신규 4직업)
// 💵 보너스로 구매, 판이 끝나도 유지. 저장: localStorage 'kt_up_v1'
// 게임에는 KTUp.effects() 결과를 KT.start({up}) 로 넘김
(function(){
'use strict';
const KEY='kt_up_v1';
const JOBS=[{n:'의사',i:'🩺'},{n:'변호사',i:'⚖️'},{n:'건축가',i:'📐'},{n:'회계사',i:'🧮'},{n:'개발자',i:'💻'},{n:'경찰',i:'👮'},{n:'소방관',i:'🧑‍🚒'},{n:'공무원',i:'🏛️'},{n:'군인',i:'🪖'}];
const JOB_MAX=15, JOB_STEP=0.1;            // 레벨당 공격력 +10%
const jobCost=lv=>Math.round(100*Math.pow(1.38,lv));
const GEN=[
  {id:'gold',  icon:'💰',name:'출장비 지원',max:5,step:15,unit:'시작 골드 +',cost:lv=>Math.round(150*Math.pow(1.7,lv))},
  {id:'coffee',icon:'☕',name:'탕비실 커피머신',max:2,step:1,unit:'시작 커피 +',cost:lv=>[400,1200][lv]},
  {id:'limit', icon:'🗄️',name:'서류함 증설',max:4,step:5,unit:'업무 한도 +',cost:lv=>Math.round(250*Math.pow(1.8,lv))},
  {id:'crit',  icon:'🎯',name:'성과급 제도',max:5,step:3,unit:'치명타 확률 +',suffix:'%',cost:lv=>Math.round(300*Math.pow(1.6,lv))},
];
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}};
const DEF=()=>({job:[0,0,0,0,0,0,0,0,0],gen:{gold:0,coffee:0,limit:0,crit:0}});
let U=Object.assign(DEF(),load()||{});while(U.job.length<JOBS.length)U.job.push(0);U.gen=Object.assign(DEF().gen,U.gen);
const subs=[];
function save(){try{localStorage.setItem(KEY,JSON.stringify(U));}catch(e){}subs.forEach(f=>{try{f(U);}catch(e){}});}
const M=()=>window.KTMeta;
function buyJob(j){const lv=U.job[j];if(lv>=JOB_MAX)return false;if(!M().spend('bonus',jobCost(lv)))return false;U.job[j]++;save();return true;}
function buyGen(id){const g=GEN.find(x=>x.id===id),lv=U.gen[id];if(!g||lv>=g.max)return false;if(!M().spend('bonus',g.cost(lv)))return false;U.gen[id]++;save();return true;}
function effects(){
  return {dmg:U.job.map(l=>1+l*JOB_STEP),lv:U.job.slice(),gold:U.gen.gold*15,coffee:U.gen.coffee,limit:U.gen.limit*5,crit:U.gen.crit*0.03};
}
function power(){return U.job.reduce((a,b)=>a+b,0)+Object.values(U.gen).reduce((a,b)=>a+b,0);}
window.KTUp={JOBS,GEN,JOB_MAX,JOB_STEP,jobCost,get:()=>U,buyJob,buyGen,effects,power,on:f=>subs.push(f),reset(){U=DEF();save();}};
})();
