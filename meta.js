// 칼퇴 디펜스 — 메타 진행(저장 데이터) 모듈
// 판과 판 사이에 남는 것: 보너스(💵 일반 재화), 스톡옵션(💎 유료 재화), 기록, 출근 도장(일일 보상), 부스터, 설정
// 저장: localStorage (웹). 앱으로 감쌀 때는 KTMeta.storage 를 교체하면 됨(예: Capacitor Preferences).
(function(){
'use strict';
const KEY='kt_save_v1';
const storage={
  load(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}},
  save(d){try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}}
};
const DEF=()=>({ver:1,bonus:0,stock:0,best:0,wins:0,games:0,kills:0,myths:{},
  daily:{last:'',streak:0},boost:{gold:0,coffee:0,career:0},
  owned:{noAds:false,starter:false},adCount:0,gamesSinceAd:0,created:Date.now()});
const num=(v,d)=>{v=+v;return Number.isFinite(v)&&v>=0?v:(d||0);};const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
// 저장 값이 깨져 있어도 게임이 멈추지 않게 형식을 바로잡음
function clean(raw){
  const d=Object.assign(DEF(),obj(raw));
  ['bonus','stock','best','wins','games','kills','adCount','gamesSinceAd'].forEach(k=>{d[k]=Math.floor(num(d[k]));});
  const my={};Object.entries(obj(d.myths)).forEach(([k,v])=>{if(/^\d{1,2}$/.test(k))my[k]=Math.floor(num(v));});d.myths=my;
  const dl=obj(d.daily);d.daily={last:typeof dl.last==='string'?dl.last:'',streak:Math.floor(num(dl.streak))};
  const b=obj(d.boost);d.boost={gold:b.gold?1:0,coffee:b.coffee?1:0,career:b.career?1:0};
  const o=obj(d.owned);d.owned={noAds:!!o.noAds,starter:!!o.starter};
  return d;
}
let D=clean(storage.load());
const subs=[];
function save(){api.storage.save(D);subs.forEach(f=>{try{f(D);}catch(e){}});}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const yesterday=()=>{const d=new Date(Date.now()-864e5);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
// 출근 도장 7일 보상 (7일째는 스톡옵션)
const DAILY=[{bonus:100},{bonus:150},{bonus:200},{bonus:250},{bonus:300},{bonus:400},{stock:20}];
// 부스터 (보너스로 구매, 다음 판 1회 적용)
const BOOSTS=[
  {id:'gold',name:'출근 수당',desc:'시작 골드 +60',icon:'💰',price:150},
  {id:'coffee',name:'모닝 커피',desc:'시작 커피 ☕ +1',icon:'☕',price:120},
  {id:'career',name:'경력직 우대',desc:'첫 채용 대리 이상 보장',icon:'📋',price:250},
];
// 직급(커리어) 칭호: 최고 기록 기준
function careerTitle(){
  if(D.wins>=5)return {t:'대표',c:'#ff4d8d'};if(D.wins>=1)return {t:'부장',c:'#ff9a2e'};
  if(D.best>=20)return {t:'과장',c:'#b875ff'};if(D.best>=10)return {t:'대리',c:'#4aa3ff'};
  if(D.best>=5)return {t:'사원',c:'#cfd4de'};return {t:'인턴',c:'#a3abb9'};
}
const api={
  storage,DAILY,BOOSTS,
  get:()=>D,
  on(f){subs.push(f);},
  save,
  add(bonus,stock){D.bonus=Math.max(0,D.bonus+(bonus||0));D.stock=Math.max(0,D.stock+(stock||0));save();},
  spend(cur,n){if((D[cur]||0)<n)return false;D[cur]-=n;save();return true;},
  dailyState(){
    const t=today(),claimed=D.daily.last===t;
    let streak=D.daily.streak;if(!claimed&&D.daily.last!==yesterday())streak=0;
    const idx=(((claimed?Math.max(1,D.daily.streak)-1:streak)%7)+7)%7;
    return {claimed,idx,streak:claimed?D.daily.streak:streak,reward:DAILY[idx]};
  },
  claimDaily(mult){
    const s=api.dailyState();if(s.claimed)return null;
    const r=s.reward,m=mult||1;
    D.daily.streak=s.streak+1;D.daily.last=today();
    D.bonus+=(r.bonus||0)*m;D.stock+=(r.stock||0)*m;save();
    return {bonus:(r.bonus||0)*m,stock:(r.stock||0)*m,day:s.idx+1};
  },
  buyBoost(id){const b=BOOSTS.find(x=>x.id===id);if(!b||D.boost[id])return false;if(!api.spend('bonus',b.price))return false;D.boost[id]=1;save();return true;},
  takeBoosts(){const b=Object.assign({},D.boost);D.boost={gold:0,coffee:0,career:0};save();return b;},
  // 한 판 결과 → 보상 계산 및 기록
  reward(r){return Math.round(r.wave*8+r.kills/10+(r.won?200:0)+r.myths*30);},
  recordGame(r){
    D.games++;D.kills+=r.kills;if(r.wave>D.best)D.best=r.wave;if(r.won)D.wins++;
    (r.mythJobs||[]).forEach(j=>{D.myths[j]=(D.myths[j]||0)+1;});
    D.gamesSinceAd++;save();
  },
  careerTitle,
  reset(){const owned=D.owned;D=DEF();D.owned=owned;save();},   // 구매 항목(광고 제거·스타터 팩)은 유지
};
window.KTMeta=api;
// 다른 탭에서 저장하면 이 탭의 데이터도 새로 읽음 (두 탭이 서로 덮어쓰지 않게)
window.addEventListener('storage',e=>{if(e.key===KEY){D=clean(storage.load());subs.forEach(f=>{try{f(D);}catch(_){}});}});
})();
