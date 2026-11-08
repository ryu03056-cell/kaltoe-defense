// 칼퇴 디펜스 — 보상 상자 · 일일/주간 미션 · 업적 배지 v17
// 상자 4종: 서류봉투(일반) · 택배상자(희귀) · 금고(영웅) · 황금 결재함(전설) — 로비 "📦 보상함"에서 열기
//   열면: 💵(+💎) + 비품(items16) — 좋은 상자일수록 좋은 등급이 잘 나옴
//   얻는 곳: 판을 이기면 서류봉투(2장 택배·3장 금고) · 협동 3단계↑ 택배 · 5단계↑ 금고 · 일일 미션 · 주간 미션 · 업적
// 일일 미션 3개(매일 바뀜, 하나 끝낼 때마다 서류봉투, 셋 다 끝내면 택배상자) · 주간: 일일 미션 10개 → 금고
// 업적 배지 15개: 한 번씩, 달성하면 상자
// 저장: localStorage 'kt_box17' · 그림: ui/box_{id}.png · ui/badge_{id}.png (없으면 이모지)
(function(){
'use strict';
const KT=window.KT;if(!KT)return;
const M=()=>window.KTMeta,IT=()=>window.KTItems;
const BOX=[
  {id:'env',name:'서류봉투',e:'✉️',c:'#a3abb9',money:[50,120],stock:0,item:0.35,bonus:0},
  {id:'parcel',name:'택배상자',e:'📦',c:'#4aa3ff',money:[100,250],stock:1,item:1,bonus:14},
  {id:'safe',name:'금고',e:'🗄️',c:'#b875ff',money:[250,500],stock:4,item:1,bonus:28},
  {id:'gold',name:'황금 결재함',e:'🏆',c:'#ff9a2e',money:[500,800],stock:10,item:2,bonus:42},
];
const BB=Object.fromEntries(BOX.map(b=>[b.id,b]));
// 미션: 판 결과(r)로 진행도를 셈
const MISSIONS=[
  {id:'kills',name:'업무 처리',goal:300,txt:n=>`업무 ${n}건 처리`,add:r=>r.kills||0},
  {id:'summons',name:'채용',goal:40,txt:n=>`직원 ${n}번 채용`,add:r=>r.summons||0},
  {id:'win',name:'칼퇴',goal:1,txt:()=>'판 1번 이기기',add:r=>r.won?1:0},
  {id:'wave15',name:'버티기',goal:1,txt:()=>'한 판에 15웨이브 도달',add:r=>(r.wave||0)>=15?1:0},
  {id:'myth',name:'대표 취임',goal:1,txt:()=>'대표(★5) 1명 만들기',add:r=>(r.myths||0)>0?1:0},
  {id:'aug',name:'결재',goal:3,txt:n=>`결재 서류(증강) ${n}장 고르기`,add:()=>window.KTAug?KTAug.picked().length:0},
  {id:'coop',name:'협동',goal:1,txt:()=>'협동 출근 1판',add:r=>r.coopStage?1:0},
  {id:'games',name:'출근',goal:3,txt:n=>`${n}판 출근하기`,add:()=>1},
];
const MB=Object.fromEntries(MISSIONS.map(m=>[m.id,m]));
const BADGES=[
  ['first_win','🎉','첫 칼퇴','처음으로 판을 이기기',s=>s.wins>=1,'env'],
  ['wins10','🏢','개근상','판 10번 이기기',s=>s.wins>=10,'parcel'],
  ['wins50','🏛️','사내 전설','판 50번 이기기',s=>s.wins>=50,'gold'],
  ['kills1k','📄','서류 천 장','업무 1,000건 처리 (누적)',s=>s.kills>=1000,'env'],
  ['kills10k','📚','서류 만 장','업무 10,000건 처리 (누적)',s=>s.kills>=10000,'safe'],
  ['myth1','👑','첫 대표','대표(★5) 처음 만들기',s=>s.myths>=1,'parcel'],
  ['myth20','💼','대표 제조기','대표 20명 만들기 (누적)',s=>s.myths>=20,'safe'],
  ['wave30','⏳','30웨이브','한 판에 30웨이브 도달',s=>s.bestWave>=30,'parcel'],
  ['coop3','🤝','손발이 척척','협동 3단계 도달',s=>s.coopBest>=3,'parcel'],
  ['coop6','🔥','환상의 콤비','협동 6단계 도달',s=>s.coopBest>=6,'gold'],
  ['items10','🎒','비품 수집가','비품 10종 모으기',()=>itemCount()>=10,'parcel'],
  ['items30','🗃️','비품 마스터','비품 30종 모두 모으기',()=>itemCount()>=30,'gold'],
  ['daily10','📅','성실 사원','일일 미션 10개 끝내기 (누적)',s=>s.daily>=10,'parcel'],
  ['boxes20','🎁','상자 마니아','상자 20개 열기',s=>s.opened>=20,'safe'],
  ['legend','🌈','전설의 비품','전설 비품 얻기',()=>{const I=IT();return !!(I&&I.ITEMS.some(i=>i.t===3&&I.state().own[i.id]));},'safe'],
].map(([id,e,name,desc,ok,box])=>({id,e,name,desc,ok,box}));
function itemCount(){const I=IT();return I?Object.keys(I.state().own).length:0;}

const KEY='kt_box17';
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const weekOf=()=>{const d=new Date(),j=new Date(d.getFullYear(),0,1);return d.getFullYear()+'w'+Math.floor(((d-j)/864e5+j.getDay())/7);};
function fresh(){return {boxes:{env:0,parcel:0,safe:0,gold:0},day:'',daily:[],dailyAll:false,week:'',weekDone:0,weekClaimed:false,badges:{},st:{wins:0,kills:0,myths:0,bestWave:0,coopBest:0,daily:0,opened:0}};}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&v.boxes){const f=fresh();return Object.assign(f,v,{boxes:Object.assign(f.boxes,v.boxes),st:Object.assign(f.st,v.st||{})});}}catch(e){}return fresh();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}updBtn();}
let P=load();
addEventListener('storage',e=>{if(e.key===KEY){P=load();updBtn();}});
function seedDaily(){
  const d=today();if(P.day===d)return;
  P.day=d;P.dailyAll=false;
  const pool=MISSIONS.slice();const pick=[];
  for(let k=0;k<3;k++){const i=(Math.random()*pool.length)|0;pick.push(pool.splice(i,1)[0]);}
  P.daily=pick.map(m=>({id:m.id,n:0,done:false}));
  const w=weekOf();if(P.week!==w){P.week=w;P.weekDone=0;P.weekClaimed=false;}
  save();
}
function give(box,n,why){P.boxes[box]=(P.boxes[box]||0)+(n||1);save();return {box,why};}

// ---- 판 끝: 미션 진행 · 상자 · 업적 ----
function onEnd(r){
  seedDaily();const got=[];
  // 상자
  if(r.won){const ch=r.stage?parseInt(String(r.stage),10)||1:1;got.push(give(ch>=3?'safe':ch>=2?'parcel':'env',1,'칼퇴 성공'));}
  if(r.coopStage>=5)got.push(give('safe',1,`협동 ${r.coopStage}단계`));else if(r.coopStage>=3)got.push(give('parcel',1,`협동 ${r.coopStage}단계`));
  // 누적 기록
  const s=P.st;if(r.won)s.wins++;s.kills+=r.kills||0;s.myths+=r.myths||0;s.bestWave=Math.max(s.bestWave,r.wave||0);if(r.coopStage)s.coopBest=Math.max(s.coopBest,r.coopStage);
  // 일일 미션
  for(const d of P.daily){if(d.done)continue;const m=MB[d.id];if(!m)continue;d.n=Math.min(m.goal,d.n+m.add(r));
    if(d.n>=m.goal){d.done=true;s.daily++;P.weekDone++;got.push(give('env',1,'일일 미션: '+m.txt(m.goal)));}}
  if(!P.dailyAll&&P.daily.length&&P.daily.every(d=>d.done)){P.dailyAll=true;got.push(give('parcel',1,'오늘 미션 모두 완료'));}
  if(!P.weekClaimed&&P.weekDone>=10){P.weekClaimed=true;got.push(give('safe',1,'주간 미션 (일일 10개)'));}
  // 업적
  for(const b of BADGES){if(P.badges[b.id])continue;let ok=false;try{ok=b.ok(s);}catch(e){}if(ok){P.badges[b.id]=Date.now();got.push(give(b.box,1,`업적 ${b.e} ${b.name}`));}}
  save();return got;
}
const L=window.KTLobby;
if(L&&L.onGameEnd){const oe=L.onGameEnd;
  L.onGameEnd=function(r){const out=oe.apply(this,arguments);
    try{if(r){const got=onEnd(r);if(got.length)setTimeout(()=>showGot(got),500);}}catch(e){console.error(e);}
    return out;};}
function boxIcon(b,sz){sz=sz||40;return IMG['box_'+b.id]?`<img src="${IMG['box_'+b.id]}" alt="" style="width:${sz}px;height:${sz}px;image-rendering:pixelated;vertical-align:middle">`:`<span style="font-size:${Math.round(sz*0.75)}px;line-height:${sz}px;display:inline-block;width:${sz}px;text-align:center">${b.e}</span>`;}
function badgeIcon(b,sz){sz=sz||36;return IMG['badge_'+b.id]?`<img src="${IMG['badge_'+b.id]}" alt="" style="width:${sz}px;height:${sz}px;image-rendering:pixelated;vertical-align:middle">`:`<span style="font-size:${Math.round(sz*0.7)}px">${b.e}</span>`;}
function showGot(got){
  const sheet=document.querySelector('.kt-modal .kt-sheet');if(!sheet)return;
  const d=document.createElement('div');d.style.cssText='margin:8px 0 0;padding:8px 10px;border-radius:12px;border:1px solid #3a4150;background:#151922;text-align:left;font-size:12.5px';
  d.innerHTML=`<b>📦 보상 상자 ${got.length}개 받음</b> <span class="kt-muted">(로비 📦 보상함에서 열기)</span><br>`+got.map(g=>`${boxIcon(BB[g.box],22)} ${BB[g.box].name} — <span style="color:#aab">${g.why}</span>`).join('<br>');
  sheet.appendChild(d);
}

// ---- 상자 열기 ----
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function openBox(id){
  const b=BB[id];if(!b||!(P.boxes[id]>0))return null;
  P.boxes[id]--;P.st.opened++;
  const money=rint(b.money[0],b.money[1]),stock=b.stock;const items=[];
  let n=b.item>=1?b.item:(Math.random()<b.item?1:0);
  for(let k=0;k<n;k++){const g=IT()&&IT().grant({bonus:b.bonus});if(g)items.push(g);}
  if(M())M().add(money,stock);
  save();return {box:b,money,stock,items};
}
function openAnim(id,done){
  const b=BB[id],w=document.createElement('div');w.className='kt-modal kt-font';
  w.innerHTML=`<div class="kt-sheet" style="text-align:center;min-height:220px"><style>@keyframes ktshake{0%,100%{transform:rotate(0)}20%{transform:rotate(-12deg) scale(1.05)}40%{transform:rotate(10deg)}60%{transform:rotate(-8deg) scale(1.1)}80%{transform:rotate(6deg)}}@keyframes ktpopin{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}</style>
    <div id="bx-a" style="display:inline-block;animation:ktshake .9s ease-in-out 1;margin-top:20px">${boxIcon(b,96)}</div><div style="margin-top:10px;color:${b.c};font-weight:800">${b.name} 여는 중…</div></div>`;
  document.body.appendChild(w);try{KTSound.play('drop');}catch(e){}
  setTimeout(()=>{const r=openBox(id);if(!r){w.remove();return;}
    const I=IT(),TT=I?I.TIER:[];
    w.querySelector('.kt-sheet').innerHTML=`<h2 style="margin:0 0 6px;color:${b.c}">${b.name} 열기!</h2>
      <div style="font-size:22px;font-weight:800;animation:ktpopin .3s ease-out">💵 +${r.money}${r.stock?` · 💎 +${r.stock}`:''}</div>
      ${r.items.map((g,i)=>{const T=TT[g.item.t]||{c:'#aaa',n:''};return `<div style="margin:8px 0;padding:8px;border-radius:12px;border:2px solid ${T.c};background:${T.c}18;display:flex;gap:10px;align-items:center;text-align:left;animation:ktpopin .35s ${0.15+i*0.15}s ease-out both">${I.icon(g.item,48)}<div><div style="font-size:11px;color:${T.c};font-weight:800">${T.n} 비품</div><b>${g.item.name}</b>${g.up?` <span style="color:#ffcf6a">${g.maxed?'(최대 강화)':g.lv+'강!'}</span>`:' <span style="color:#7dffb0">NEW</span>'}<div style="font-size:12px;color:#cfd4de">${I.descOf(g.item,g.lv)}</div></div></div>`;}).join('')}
      <div style="display:flex;gap:8px;margin-top:10px">${P.boxes[id]>0?`<button class="kt-btn" id="bx-again" style="flex:1;padding:10px">하나 더 (${P.boxes[id]})</button>`:''}<button class="kt-btn" id="bx-ok" style="flex:1;padding:10px">확인</button></div>`;
    try{KTSound.play(r.items.some(g=>g.item.t>=2)?'myth':'luckWin');}catch(e){}
    w.querySelector('#bx-ok').onclick=()=>{w.remove();done&&done();};
    const ag=w.querySelector('#bx-again');if(ag)ag.onclick=()=>{w.remove();openAnim(id,done);};
  },950);
}

// ---- 보상함 화면 (상자 · 미션 · 업적) ----
function openHub(tab){
  seedDaily();tab=tab||'box';
  const w=document.createElement('div');w.className='kt-modal kt-font';
  const tabs=[['box','📦 상자'],['mission','📋 미션'],['badge','🏅 업적']];
  const body={
    box:()=>BOX.map(b=>`<div style="display:flex;gap:10px;align-items:center;padding:8px;margin:6px 0;border:2px solid ${b.c}55;border-radius:12px;background:${b.c}10">${boxIcon(b,44)}
        <div style="flex:1;text-align:left"><b style="color:${b.c}">${b.name}</b> <span style="color:#ffcf6a">×${P.boxes[b.id]||0}</span><br><span style="font-size:11.5px;color:#cfd4de">💵 ${b.money[0]}~${b.money[1]}${b.stock?' · 💎 '+b.stock:''} · 비품 ${b.item>=1?b.item+'개':'가끔'}</span></div>
        <button class="kt-btn bx-open" data-id="${b.id}" ${P.boxes[b.id]>0?'':'disabled'} style="padding:8px 14px">열기</button></div>`).join(''),
    mission:()=>`<p class="kt-muted" style="font-size:12px;margin:0 0 6px">오늘의 미션 (하나마다 ✉️ 서류봉투 · 셋 다 하면 📦 택배상자)</p>`+
      P.daily.map(d=>{const m=MB[d.id];if(!m)return '';const pct=Math.round(d.n/m.goal*100);return `<div style="padding:8px;margin:6px 0;border:1px solid #3a4150;border-radius:12px;text-align:left;${d.done?'opacity:.6':''}"><b>${d.done?'✅ ':''}${m.txt(m.goal)}</b> <span style="float:right;color:#ffcf6a">${d.n}/${m.goal}</span><div style="height:6px;background:#222833;border-radius:4px;margin-top:6px"><div style="width:${pct}%;height:100%;background:#ffb020;border-radius:4px"></div></div></div>`;}).join('')+
      `<div style="padding:8px;margin:10px 0 0;border:1px dashed #b875ff;border-radius:12px;text-align:left"><b>📅 주간 미션: 일일 미션 10개 끝내기</b> <span style="float:right;color:#e3c8ff">${Math.min(10,P.weekDone)}/10</span><br><span style="font-size:11.5px;color:#cfd4de">보상: 🗄️ 금고${P.weekClaimed?' (받음)':''}</span></div>`,
    badge:()=>`<p class="kt-muted" style="font-size:12px;margin:0 0 6px">${Object.keys(P.badges).length}/${BADGES.length} 달성 · 달성하면 상자</p><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">`+
      BADGES.map(b=>{const ok=!!P.badges[b.id];return `<div style="padding:6px;border:1px solid ${ok?'#ffcf6a':'#2a2f3a'};border-radius:10px;${ok?'':'filter:grayscale(1);opacity:.5'}">${badgeIcon(b,36)}<div style="font-size:11.5px;font-weight:800">${b.name}</div><div style="font-size:10px;color:#aab">${b.desc}</div></div>`;}).join('')+'</div>',
  };
  w.innerHTML=`<div class="kt-sheet" style="text-align:center"><h2 style="margin:0 0 8px">🎁 보상함</h2>
    <div style="display:flex;gap:6px;margin-bottom:8px">${tabs.map(([k,n])=>`<button class="kt-btn bx-tab" data-k="${k}" style="flex:1;padding:8px;${k===tab?'border-color:#ffb020;color:#ffcf6a':''}">${n}</button>`).join('')}</div>
    <div id="bx-body">${body[tab]()}</div>
    <button class="kt-btn" id="bx-x" style="width:100%;padding:10px;margin-top:10px">닫기</button></div>`;
  document.body.appendChild(w);
  w.addEventListener('click',e=>{if(e.target===w)w.remove();});
  w.querySelector('#bx-x').onclick=()=>w.remove();
  w.querySelectorAll('.bx-tab').forEach(b=>b.onclick=()=>{w.remove();openHub(b.dataset.k);});
  w.querySelectorAll('.bx-open').forEach(b=>b.onclick=()=>{w.remove();openAnim(b.dataset.id,()=>openHub('box'));});
  try{KTSound.play('select');}catch(e){}
}

// ---- 그림 ----
const IMG={};
(function(){const L2=window.KT_ASSET_LIST&&KT_ASSET_LIST.ui,v=(L2&&L2.v)||{},files=new Set((L2&&L2.files)||[]);
  [...BOX.map(b=>'box_'+b.id),...BADGES.map(b=>'badge_'+b.id)].forEach(n=>{if(L2&&!files.has(n))return;const im=new Image();im.onload=()=>{IMG[n]=im.src;};im.src='ui/'+n+'.png'+(v[n]?'?v='+v[n]:'');});})();

// ---- 로비 버튼 ----
function total(){return BOX.reduce((a,b)=>a+(P.boxes[b.id]||0),0);}
function updBtn(){const b=document.getElementById('kt-box-btn');if(b){const n=total();b.innerHTML=`🎁 보상함${n?` <span style="background:#ff4d4d;color:#fff;border-radius:999px;padding:0 7px;font-size:12px;margin-left:4px">${n}</span>`:''}`;}}
function lobbyBtn(){
  const a=document.getElementById('kt-bag-btn');if(!a||document.getElementById('kt-box-btn'))return;
  // 비품함과 나란히
  const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;margin:4px 0 2px';a.before(row);row.appendChild(a);a.style.margin='0';a.style.flex='1';
  const b=document.createElement('button');b.id='kt-box-btn';b.className='kt-btn kt-font';b.type='button';
  b.style.cssText='flex:1;padding:9px;font-size:15px;border-color:#ffb020;color:#ffcf6a;background:rgba(255,176,32,.10)';
  b.onclick=()=>openHub();row.appendChild(b);updBtn();
}
let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;lobbyBtn();});}).observe(document.body,{childList:true});
lobbyBtn();seedDaily();
window.KTBox={BOX,MISSIONS,BADGES,give,open:openHub,openBox,state:()=>P};
})();
