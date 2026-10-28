// 칼퇴 디펜스 — 내 레벨 · 직업 해금 · 직원 편성 · 칼퇴 패스(월정액) v10
// 저장: localStorage 'kt_prog_v1' (기존 저장과 분리)
(function(){
'use strict';
const KEY='kt_prog_v1';
// ---- 설정 ----
const CONF={
  freeMaxSpeed:2,        // 무료 최대 배속 (1로 바꾸면 2배속부터 패스 전용)
  passSpeed:3,           // 패스·체험 시 최대 배속
  trialMin:30,           // 광고 체험 시간(분)
  passDays:30,
  passPrice:'₩4,900 / 월',
  passDaily:10,          // 패스 매일 💎
  passBonus:0.2,         // 판 보상 +20%
  maxLv:50,
};
// 직업 해금 레벨 (0~4 기본 5직업, 5 경찰 · 6 소방관 · 7 공무원 · 8 군인)
const UNLOCK={5:3,6:5,7:8,8:12};
const xpNeed=lv=>100+lv*60;
function lvReward(lv){return {bonus:80*lv,stock:lv%5===0?20:0};}
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}};
const DEF=()=>({lv:1,xp:0,totalXp:0,deck:[0,1,2,3,4],pass:{until:0,daily:''},trial:{until:0},seen:{}});
let P=Object.assign(DEF(),load()||{});P.pass=Object.assign(DEF().pass,P.pass);P.trial=Object.assign(DEF().trial,P.trial);P.seen=P.seen||{};
const subs=[];
function save(){try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}subs.forEach(f=>{try{f(P);}catch(e){}});}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const M=()=>window.KTMeta,N=()=>window.KTMonet;
// 칼퇴 패스를 결제 상품 목록에 추가 (앱에서는 구독 상품으로 등록)
if(window.KTMonet){
  if(!KTMonet.PRODUCTS.find(p=>p.sku==='pass_month'))KTMonet.PRODUCTS.unshift({sku:'pass_month',name:'칼퇴 패스 (30일)',desc:`3배속 · 매일 💎${CONF.passDaily} · 판 보상 +${CONF.passBonus*100}%`,price:CONF.passPrice,icon:'🎫',sub:true});
  KTMonet.REWARDS.speed=`3배속 ${CONF.trialMin}분 체험`;
}
const api={
  CONF,UNLOCK,xpNeed,
  get:()=>P,on:f=>subs.push(f),
  level:()=>P.lv,
  unlocked:j=>j<5||P.lv>=(UNLOCK[j]||1),
  unlockLv:j=>UNLOCK[j]||1,
  deck:()=>P.deck.filter(j=>api.unlocked(j)).slice(0,5).concat([0,1,2,3,4,5,6,7,8].filter(j=>api.unlocked(j)&&!P.deck.includes(j))).slice(0,5),
  setDeck(d){if(!Array.isArray(d)||d.length!==5||new Set(d).size!==5||!d.every(api.unlocked))return false;P.deck=d.slice();save();return true;},
  // 경험치: 웨이브×5 + 칼퇴 100 + 별×20
  xpOf(r,stars){return Math.round(r.wave*5+(r.won?100:0)+(stars||0)*20);},
  addXp(x){
    const before=P.lv,ups=[];P.xp+=x;P.totalXp+=x;
    while(P.lv<CONF.maxLv&&P.xp>=xpNeed(P.lv)){P.xp-=xpNeed(P.lv);P.lv++;const rw=lvReward(P.lv);ups.push(Object.assign({lv:P.lv,unlock:Object.keys(UNLOCK).filter(j=>UNLOCK[j]===P.lv).map(Number)},rw));if(M())M().add(rw.bonus,rw.stock);}
    save();return {from:before,to:P.lv,ups};
  },
  // 배속
  passActive:()=>P.pass.until>Date.now(),
  trialActive:()=>P.trial.until>Date.now(),
  passLeftDays:()=>Math.max(0,Math.ceil((P.pass.until-Date.now())/864e5)),
  trialLeftMin:()=>Math.max(0,Math.ceil((P.trial.until-Date.now())/6e4)),
  maxSpeed:()=>api.passActive()||api.trialActive()?CONF.passSpeed:CONF.freeMaxSpeed,
  async startTrial(){if(!N())return false;const ok=await N().rewarded('speed');if(!ok)return false;P.trial.until=Date.now()+CONF.trialMin*6e4;save();return true;},
  async buyPass(){if(!N())return false;const ok=await N().buy('pass_month');if(!ok)return false;P.pass.until=Math.max(Date.now(),P.pass.until)+CONF.passDays*864e5;save();return true;},
  passDailyReady:()=>api.passActive()&&P.pass.daily!==today(),
  claimPassDaily(){if(!api.passDailyReady())return 0;P.pass.daily=today();if(M())M().add(0,CONF.passDaily);save();return CONF.passDaily;},
  rewardMul:()=>api.passActive()?1+CONF.passBonus:1,
  markSeen(k){P.seen[k]=1;save();},seen:k=>!!P.seen[k],
  reset(){P=DEF();save();},
};
window.KTProg=api;
})();
