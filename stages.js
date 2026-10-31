// 칼퇴 디펜스 — 스테이지(회사 생활 챕터) 모듈 v9
// 진행 저장: localStorage 'kt_stage_v1' (기존 저장 데이터와 분리)
// 게임은 KT.start({stage}) 로 받은 값으로 웨이브 수·체력·속도·변수(mods)·보스 기술을 적용
(function(){
'use strict';
const KEY='kt_stage_v1';
// 변수(모디파이어) 설명 — 스테이지 상세 화면에 칩으로 표시
const MODS={
  rush:   {icon:'🏃',name:'야근 모드',desc:'업무 이동 속도 +25%'},
  clients:{icon:'😡',name:'갑질 데이',desc:'진상 클라이언트 2배'},
  poor:   {icon:'✂️',name:'예산 삭감',desc:'시작 골드 -30'},
  limit:  {icon:'⏰',name:'마감 주간',desc:'업무 한도 100 → 70'},
  regen:  {icon:'🔁',name:'무한 수정',desc:'모든 업무가 초당 2% 회복'},
  split:  {icon:'🧬',name:'일이 일을 낳음',desc:'진상 클라이언트가 처리되면 긴급 메일 2개 발생'},
  armor:  {icon:'📑',name:'결재 서류',desc:'업무 체력 +30% · 골드 +30%'},
};
// 새 적 (enemies9.js에서 그림)
const ENEMY_INFO={
  meeting: {icon:'📅',name:'회의 소집',desc:'느리지만 매우 단단함'},
  call:    {icon:'📞',name:'부재중 전화',desc:'아주 빠름'},
  revision:{icon:'✏️',name:'수정 요청',desc:'체력이 계속 회복됨'},
};
// 보스 기술
const SKILLS={
  meeting:{name:'회의 소집',desc:'직원 2칸을 2.5초간 회의에 붙잡아 둠'},
  heal:   {name:'수정 요청',desc:'6초마다 체력 8% 회복'},
  summon: {name:'회식 2차',desc:'5초마다 긴급 업무 3개 호출'},
};
const BOSS_NAME=['김부장','갑 클라이언트','회장님'];
// bosses: 보스 웨이브 순서대로 보스 번호, bossSkill: 보스 번호별 기술(스테이지에 따라 켜짐)
const CHAPTERS=[
  {id:1,name:'동네 스타트업',icon:'🏠',color:'#40d987',desc:'첫 직장. 아직은 할 만하다'},
  {id:2,name:'중견기업',icon:'🏢',color:'#4aa3ff',desc:'결재 라인과 수정 요청의 늪'},
  {id:3,name:'대기업 본사',icon:'🏙️',color:'#ff9a2e',desc:'회장님이 지켜보고 있다'},
];
const STAGES=[
  {id:'1-1',ch:1,name:'첫 출근',waves:10,bossEvery:5,bosses:[0,0],bossHp:[10,14],hp:0.8,mods:[],mix:{},first:{bonus:150}},
  {id:'1-2',ch:1,name:'야근의 시작',waves:10,bossEvery:5,bosses:[0,0],bossHp:[10,14],hp:1.0,mods:['rush'],mix:{call:0.08},first:{bonus:200}},
  {id:'1-3',ch:1,name:'진상 고객 주간',waves:15,bossEvery:5,bosses:[0,1,1],bossHp:[10,14,16],hp:1.3,mods:['clients'],mix:{},first:{bonus:250}},
  {id:'1-4',ch:1,name:'예산 삭감',waves:15,bossEvery:5,bosses:[0,1,0],bossHp:[10,14,16],hp:1.6,mods:['poor'],mix:{revision:0.06},first:{bonus:300}},
  {id:'1-5',ch:1,name:'김부장의 회의 지옥',boss:true,waves:15,bossEvery:5,bosses:[0,0,0],bossHp:[11,15,20],hp:2.6,mods:[],mix:{meeting:0.08},skills:{0:'meeting'},first:{bonus:400,stock:20}},
  {id:'2-1',ch:2,name:'결재 라인',waves:20,bossEvery:10,bosses:[0,1],bossHp:[20,20],hp:2.0,mods:['armor'],mix:{meeting:0.1},first:{bonus:400}},
  {id:'2-2',ch:2,name:'수정 또 수정',waves:20,bossEvery:10,bosses:[1,1],bossHp:[20,20],hp:1.6,mods:[],mix:{revision:0.15},skills:{1:'heal'},first:{bonus:450}},
  {id:'2-3',ch:2,name:'마감 주간',waves:20,bossEvery:10,bosses:[0,1],bossHp:[20,20],hp:1.9,mods:['limit'],mix:{call:0.12},first:{bonus:500}},
  {id:'2-4',ch:2,name:'전화 폭탄',waves:20,bossEvery:10,bosses:[1,0],bossHp:[20,20],hp:1.9,mods:['rush'],mix:{call:0.22},skills:{0:'meeting'},first:{bonus:550}},
  {id:'2-5',ch:2,name:'갑 클라이언트의 역습',boss:true,waves:20,bossEvery:10,bosses:[1,1],bossHp:[20,24],hp:1.8,mods:['split','clients'],mix:{revision:0.08},skills:{1:'heal'},first:{bonus:800,stock:30}},
  {id:'3-1',ch:3,name:'본사 발령',waves:30,bossEvery:10,bosses:[0,1,2],bossHp:[20,20,18],hp:1.9,mods:[],mix:{meeting:0.05,call:0.05},first:{bonus:700}},
  {id:'3-2',ch:3,name:'구조조정',waves:30,bossEvery:10,bosses:[0,1,2],bossHp:[20,20,18],hp:2.1,mods:['poor','limit'],mix:{call:0.08},skills:{0:'meeting'},first:{bonus:800}},
  {id:'3-3',ch:3,name:'감사 시즌',waves:30,bossEvery:10,bosses:[0,1,2],bossHp:[20,20,18],hp:1.5,mods:['regen','armor'],mix:{meeting:0.1,revision:0.08},skills:{1:'heal'},first:{bonus:900}},
  {id:'3-4',ch:3,name:'블랙 프라이데이',waves:30,bossEvery:10,bosses:[1,0,2],bossHp:[20,20,18],hp:2.4,mods:['rush','split'],mix:{call:0.15},skills:{2:'summon'},first:{bonus:1000}},
  {id:'3-5',ch:3,name:'회장님의 회식',boss:true,waves:30,bossEvery:10,bosses:[0,1,2],bossHp:[20,22,22],hp:2.4,mods:['clients'],mix:{meeting:0.08,call:0.08,revision:0.06},skills:{0:'meeting',1:'heal',2:'summon'},first:{bonus:1500,stock:50}},
];
STAGES.forEach((s,i)=>{s.idx=i;s.clear=Math.round((s.first.bonus||0)*0.25);});
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}};
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
function clean(raw){const p=Object.assign({stars:{},plays:{},last:'1-1'},obj(raw));p.stars=obj(p.stars);p.plays=obj(p.plays);Object.keys(p.stars).forEach(k=>{const v=+p.stars[k];p.stars[k]=Number.isFinite(v)?Math.max(0,Math.min(3,Math.floor(v))):0;});if(typeof p.last!=='string')p.last='1-1';return p;}
let P=clean(load());
const subs=[];
function save(){try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}subs.forEach(f=>{try{f(P);}catch(e){}});}
const get=id=>STAGES.find(s=>s.id===id);
function unlocked(id){const s=get(id);if(!s)return false;if(s.idx===0)return true;return (P.stars[STAGES[s.idx-1].id]||0)>0;}
function next(){for(const s of STAGES)if(!(P.stars[s.id]>0))return s;return STAGES[STAGES.length-1];}
function totalStars(){return Object.values(P.stars).reduce((a,b)=>a+b,0);}
// 별: ★ 클리어 · ★★ 이어하기 없이 · ★★★ 이어하기 없이 + 업무가 한도의 절반을 넘지 않음
function starsOf(r){if(!r.won)return 0;let n=1;if(!r.revived){n++;if(r.peak<=r.maxEnemies*0.5)n++;}return n;}
function complete(id,r){
  const s=get(id);if(!s)return null;
  const prev=P.stars[id]||0,st=starsOf(r);
  P.plays[id]=(P.plays[id]||0)+1;
  const out={stars:st,prev,first:false,bonus:0,stock:0};
  if(st>0){
    if(prev===0){out.first=true;out.bonus+=s.first.bonus||0;out.stock+=s.first.stock||0;}
    else out.bonus+=s.clear;
    if(st===3&&prev<3)out.stock+=5; // 첫 ★★★ 보너스
    if(st>prev)P.stars[id]=st;
  }
  P.last=id;save();return out;
}
function describe(s){
  const mods=s.mods.map(m=>MODS[m]);
  const ens=Object.keys(s.mix||{}).map(k=>ENEMY_INFO[k]);
  const bosses=[...new Set(s.bosses)].map(b=>({name:BOSS_NAME[b],skill:s.skills&&s.skills[b]?SKILLS[s.skills[b]]:null}));
  return {mods,ens,bosses};
}
window.KTStages={STAGES,CHAPTERS,MODS,ENEMY_INFO,SKILLS,BOSS_NAME,get,unlocked,next,complete,starsOf,describe,totalStars,
  stars:id=>P.stars[id]||0,progress:()=>P,on:f=>subs.push(f),reset(){P={stars:{},plays:{},last:'1-1'};save();},
  // 테스트용
  _unlockAll(){STAGES.forEach(s=>{if(!P.stars[s.id])P.stars[s.id]=1;});save();}};
window.addEventListener('storage',e=>{if(e.key===KEY){P=clean(load());subs.forEach(f=>{try{f(P);}catch(_){}});}});
})();
