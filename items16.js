// 칼퇴 디펜스 — 비품(장비 아이템) v16
// 직업마다 비품 1칸 + 공용 서랍 1칸. 판을 이기면 비품 1개(지면 25% 확률), 상자(v17)에서도 나옴
//   등급: 일반 · 희귀 · 영웅 · 전설 — 같은 비품을 또 얻으면 강화(최대 5강, 1강마다 효과 +20%)
//   효과: 그 직업 공격력 % · 치명타 % · 시작 골드 · 시작 커피 · 처치 골드 %
//   저장: localStorage 'kt_items' {own:{id:레벨}, eq:{직업번호:id}, desk:id}
// 그림: ui/item_{id}.png (64×64, PixelLab) — 없으면 이모지
// 연결: 로비 "🎒 비품함" 버튼 · 판 시작(KT.start)에 효과 적용 · 판 끝(KTLobby.onGameEnd)에 획득
(function(){
'use strict';
const KT=window.KT;if(!KT)return;
const TIER=[{n:'일반',c:'#a3abb9'},{n:'희귀',c:'#4aa3ff'},{n:'영웅',c:'#b875ff'},{n:'전설',c:'#ff9a2e'}];
const D=(t)=>[0.10,0.20,0.35,0.50][t];   // 등급별 공격력
// 직업 0의사 1변호사 2건축가 3회계사 4개발자 5경찰 6소방관 7공무원 8군인
const ITEMS=[
  ['stetho',0,0,'🩺','청진기'],['scalpel',0,1,'🔪','반짝이는 메스'],['bag_doc',0,2,'💼','금빛 왕진가방',{crit:0.05}],
  ['lawbook',1,0,'📕','두꺼운 법전'],['gavel',1,1,'🔨','의사봉'],['scale',1,2,'⚖️','황금 저울',{crit:0.05}],
  ['tape',2,0,'📏','줄자'],['helmet',2,1,'⛑️','안전모'],['blueprint',2,2,'📜','황금 설계도',{crit:0.05}],
  ['calc',3,0,'🧮','계산기'],['pen',3,1,'🖋️','만년필'],['vault',3,2,'🔑','금고 열쇠',{gold:0.10}],
  ['keyboard',4,0,'⌨️','기계식 키보드'],['energy',4,1,'🥤','에너지 드링크'],['laptop',4,2,'💻','황금 노트북',{crit:0.05}],
  ['radio',5,0,'📻','무전기'],['cuffs',5,1,'⛓️','은빛 수갑'],['badge',5,2,'🛡️','황금 경찰 배지',{crit:0.05}],
  ['extin',6,0,'🧯','소화기'],['hose',6,1,'🚒','소방 호스'],['axe',6,2,'🪓','황금 도끼',{crit:0.05}],
  ['stamp',7,0,'📮','결재 도장'],['binder',7,1,'🗂️','민원 서류철'],['seal',7,2,'🏛️','황금 관인',{crit:0.05}],
  ['tags',8,0,'🪪','군번줄'],['boots',8,1,'🥾','전투화'],['medal',8,2,'🎖️','황금 훈장',{crit:0.05}],
  // 공용 서랍 (직업 없음)
  ['idcard',-1,0,'🪪','사원증',{startGold:30}],['tumbler',-1,1,'🥤','텀블러',{startCoffee:1}],['luckypen',-1,3,'✒️','행운의 볼펜',{crit:0.06,gold:0.10}],
].map(([id,job,t,e,name,ex])=>({id,job,t,e,name,ex:ex||{},dmg:job>=0?D(t):0}));
const BY=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const KEY='kt_items',MAXLV=5;
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&v.own)return {own:v.own,eq:v.eq||{},desk:v.desk||null};}catch(e){}return {own:{},eq:{},desk:null};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}}
let P=load();
addEventListener('storage',e=>{if(e.key===KEY)P=load();});
const lvMul=lv=>1+0.2*((lv||1)-1);
function effOf(it,lv){const m=lvMul(lv),x=it.ex;return {dmg:it.dmg*m,crit:(x.crit||0)*m,gold:(x.gold||0)*m,startGold:Math.round((x.startGold||0)*m),startCoffee:x.startCoffee?Math.floor(x.startCoffee*m):0};}
function descOf(it,lv){const e=effOf(it,lv),o=[];
  if(e.dmg)o.push(`${KT.JOBS[it.job]?KT.JOBS[it.job].name:''} 공격력 +${Math.round(e.dmg*100)}%`);
  if(e.crit)o.push(`치명타 +${Math.round(e.crit*100)}%`);if(e.gold)o.push(`처치 골드 +${Math.round(e.gold*100)}%`);
  if(e.startGold)o.push(`시작 골드 +${e.startGold}`);if(e.startCoffee)o.push(`시작 커피 +${e.startCoffee}`);return o.join(' · ');}

// ---- 획득 ----
// 등급 확률: 기본 일반 60 · 희귀 28 · 영웅 10 · 전설 2 (bonus 가 클수록 좋은 등급 쪽으로)
function rollTier(bonus){const r=Math.random()*100-(bonus||0);return r<2?3:r<12?2:r<40?1:0;}
function grant(opt){
  opt=opt||{};const t=opt.tier!=null?opt.tier:rollTier(opt.bonus);
  let pool=ITEMS.filter(i=>i.t===t);if(!pool.length)pool=ITEMS.filter(i=>i.t<=t);
  // v20.5: 75% 는 지금 편성한 직업 비품(또는 공용)에서 — 레벨 1 인데 아직 못 쓰는 경찰 비품만 나오던 문제
  try{const dk=(window.KTProg&&KTProg.deck&&KTProg.deck())||[];const pref=pool.filter(i=>i.job<0||dk.includes(i.job));if(!opt.id&&pref.length&&Math.random()<0.75)pool=pref;}catch(e){}
  const it=opt.id?BY[opt.id]:pool[(Math.random()*pool.length)|0];
  const had=P.own[it.id]||0,lv=Math.min(MAXLV,had+1);P.own[it.id]=lv;
  // 비어 있는 칸이면 자동 장착
  if(it.job>=0&&!P.eq[it.job])P.eq[it.job]=it.id;if(it.job<0&&!P.desk)P.desk=it.id;
  save();return {item:it,lv,up:had>0,maxed:had>=MAXLV};
}
// ---- 판 시작: 장착 효과 ----
function equipped(){return [...Object.entries(P.eq).map(([j,id])=>BY[id]&&BY[id].job===+j&&P.own[id]?[id,P.own[id]]:null),P.desk&&P.own[P.desk]?[P.desk,P.own[P.desk]]:null].filter(Boolean);}
function applyList(list){
  const S=KT.S;if(!S||!S.dmgMul)return;
  const m=S.dmgMul.slice();let crit=0,gold=0,sg=0,sc=0;
  const use=list.map(([id,lv])=>BY[id]?[BY[id],lv]:null).filter(Boolean);
  for(const [it,lv] of use){const e=effOf(it,lv);if(it.job>=0&&m[it.job]!=null)m[it.job]=Math.round(m[it.job]*(1+e.dmg)*100)/100;crit+=e.crit;gold+=e.gold;sg+=e.startGold;sc+=e.startCoffee;}
  S.dmgMul=m;S.crit=(S.crit||0)+crit;S.goldMul=(S.goldMul||1)*(1+gold);S.gold+=sg;S.coffee+=sc;
  return use.length;
}
function applyToRun(){
  const list=equipped();
  // 협동 동료: 내 비품은 방장 폰에서 적용 (공격력은 팀 전체, 시작 골드·커피는 내 지갑)
  const C=window.KTCoop;if(C&&C.role&&C.role()==='guest'&&C.inGame&&C.inGame()){if(list.length)C.guestAct('items',[list]);return;}
  applyList(list);
}
const st0=KT.start;
KT.start=function(){const r=st0.apply(this,arguments);try{applyToRun();}catch(e){console.error(e);}return r;};

// ---- 그림 ----
const IMG={};
(function(){const L=window.KT_ASSET_LIST&&KT_ASSET_LIST.ui,v=(L&&L.v)||{},files=new Set((L&&L.files)||[]);
  ITEMS.forEach(i=>{const n='item_'+i.id;if(L&&!files.has(n))return;const im=new Image();im.onload=()=>{IMG[i.id]=im.src;};im.src='ui/'+n+'.png'+(v[n]?'?v='+v[n]:'');});})();
function icon(it,sz){sz=sz||40;return IMG[it.id]?`<img src="${IMG[it.id]}" alt="" style="width:${sz}px;height:${sz}px;image-rendering:pixelated;vertical-align:middle">`:`<span style="font-size:${Math.round(sz*0.75)}px;line-height:${sz}px;display:inline-block;width:${sz}px;text-align:center">${it.e}</span>`;}

// ---- 판 끝: 획득 ----
const L=window.KTLobby,RUN=new WeakMap();
if(L&&L.onGameEnd){const oe=L.onGameEnd;
  L.onGameEnd=function(r){
    const out=oe.apply(this,arguments);
    // v20.5: 이어하기로 한 판에 두 번 불려도 비품은 한 판에 하나 (진 뒤 이어해서 이기면 그때 확정 지급)
    const S=window.KT&&KT.S,st=S?(RUN.get(S)||{}):{};if(S)RUN.set(S,st);
    try{if(r&&!st.got&&!(st.rolled&&!r.won)&&(r.won||Math.random()<0.25||(r.coopStage&&r.coopStage>=2))){st.got=1;
      const bonus=(r.coopStage?Math.min(20,(r.coopStage-1)*4):0)+(r.won?4:0);
      const g=grant({bonus});setTimeout(()=>showGain(g),350);}}catch(e){console.error(e);}
    st.rolled=1;
    return out;};}
function showGain(g){
  const sheet=(()=>{const t=document.querySelector('.kt-modal .kt-result-title');return t?t.closest('.kt-sheet'):null;})();if(!sheet)return;
  const T=TIER[g.item.t],d=document.createElement('div');
  d.style.cssText=`margin:10px 0 0;padding:10px;border-radius:12px;border:2px solid ${T.c};background:${T.c}18;display:flex;gap:10px;align-items:center;text-align:left`;
  d.innerHTML=`${icon(g.item,48)}<div><div style="font-size:11px;color:${T.c};font-weight:800">🎁 비품 획득 · ${T.n}</div><b>${g.item.name}</b>${g.up?` <span style="color:#ffcf6a">${g.maxed?'(최대 강화)':g.lv+'강으로 강화!'}</span>`:''}<div style="font-size:12px;color:#cfd4de">${descOf(g.item,g.lv)}</div></div>`;
  sheet.appendChild(d);try{KTSound.play(g.item.t>=2?'myth':'luckWin');}catch(e){}
}

// ---- 비품함 화면 ----
function openBag(){
  const w=document.createElement('div');w.className='kt-modal kt-font';
  const jobs=KT.JOBS.slice(0,9);
  const owned=id=>P.own[id]||0;
  const slot=(label,it,key)=>`<button class="kt-btn kb-slot" data-k="${key}" style="display:flex;gap:8px;align-items:center;width:100%;text-align:left;padding:6px 8px;margin:4px 0;border-color:${it?TIER[it.t].c:'#3a4150'}">
      <span style="width:62px;flex:none;font-size:12px;color:#aab">${label}</span>${it?icon(it,36):'<span style="width:36px;text-align:center;opacity:.4">—</span>'}
      <span style="flex:1;min-width:0;font-size:12.5px">${it?`<b>${it.name}</b> ${owned(it.id)>1?'<span style="color:#ffcf6a">+'+(owned(it.id)-1)+'</span>':''}<br><span style="color:#cfd4de;font-size:11.5px">${descOf(it,owned(it.id))}</span>`:'<span style="opacity:.6">비어 있음</span>'}</span></button>`;
  const total=Object.keys(P.own).length;
  w.innerHTML=`<div class="kt-sheet"><h2 style="margin:0 0 2px">🎒 비품함</h2>
    <p class="kt-muted" style="margin:0 0 8px;font-size:12px">모은 비품 ${total}/${ITEMS.length} · 판을 이기면 1개(지면 가끔) · 같은 비품은 강화(최대 5강)</p>
    ${jobs.map((J,j)=>slot(J.icon+' '+J.name,P.eq[j]?BY[P.eq[j]]:null,'j'+j)).join('')}
    ${slot('🗄️ 공용 서랍',P.desk?BY[P.desk]:null,'desk')}
    <div class="kc-row" style="display:flex;margin-top:10px"><button class="kt-btn" id="kb-x" style="flex:1;padding:10px">닫기</button></div></div>`;
  document.body.appendChild(w);
  w.addEventListener('click',e=>{if(e.target===w)w.remove();});
  w.querySelector('#kb-x').onclick=()=>w.remove();
  w.querySelectorAll('.kb-slot').forEach(b=>b.onclick=()=>{const k=b.dataset.k;w.remove();pickFor(k);});
  try{KTSound.play('select');}catch(e){}
}
function pickFor(k){
  const job=k==='desk'?-1:+k.slice(1);
  const list=ITEMS.filter(i=>i.job===job&&P.own[i.id]);
  const w=document.createElement('div');w.className='kt-modal kt-font';
  const cur=job<0?P.desk:P.eq[job];
  w.innerHTML=`<div class="kt-sheet"><h2 style="margin:0 0 8px">${job<0?'🗄️ 공용 서랍':KT.JOBS[job].icon+' '+KT.JOBS[job].name+' 비품'}</h2>
    ${ITEMS.filter(i=>i.job===job).map(it=>{const lv=P.own[it.id]||0,T=TIER[it.t];return `<button class="kt-btn kb-it" data-id="${it.id}" ${lv?'':'disabled'} style="display:flex;gap:8px;align-items:center;width:100%;text-align:left;padding:6px 8px;margin:4px 0;border-color:${lv?T.c:'#2a2f3a'};${it.id===cur?'background:'+T.c+'22':''}${lv?'':';opacity:.45'}">
      ${lv?icon(it,40):'<span style="width:40px;text-align:center;font-size:22px">❔</span>'}
      <span style="flex:1;font-size:12.5px"><span style="color:${T.c};font-size:11px;font-weight:800">${T.n}</span> <b>${lv?it.name:'아직 못 얻음'}</b> ${lv>1?'<span style="color:#ffcf6a">+'+(lv-1)+'</span>':''}${it.id===cur?' <span style="color:#7dffb0">장착 중</span>':''}<br><span style="color:#cfd4de;font-size:11.5px">${lv?descOf(it,lv):descOf(it,1)}</span></span></button>`;}).join('')}
    ${list.length?'':'<p class="kt-muted" style="font-size:12px">아직 이 칸에 맞는 비품이 없어요. 판을 이기면 얻을 수 있어요.</p>'}
    <div style="display:flex;gap:8px;margin-top:10px">${cur?'<button class="kt-btn" id="kb-off" style="flex:1;padding:10px">빼기</button>':''}<button class="kt-btn" id="kb-back" style="flex:1;padding:10px">뒤로</button></div></div>`;
  document.body.appendChild(w);
  const back=()=>{w.remove();openBag();};
  w.addEventListener('click',e=>{if(e.target===w)back();});
  w.querySelector('#kb-back').onclick=back;
  const off=w.querySelector('#kb-off');if(off)off.onclick=()=>{if(job<0)P.desk=null;else delete P.eq[job];save();back();};
  w.querySelectorAll('.kb-it').forEach(b=>b.onclick=()=>{const id=b.dataset.id;if(!P.own[id])return;if(job<0)P.desk=id;else P.eq[job]=id;save();try{KTSound.play('pick');}catch(e){}back();});
}
// 로비 버튼 (협동 버튼 아래)
function lobbyBtn(){
  const a=document.getElementById('kt-coop-btn')||document.getElementById('lb-boosts');if(!a||document.getElementById('kt-bag-btn'))return;
  const b=document.createElement('button');b.id='kt-bag-btn';b.className='kt-btn kt-font';b.type='button';
  b.style.cssText='display:block;width:100%;margin:4px 0 2px;padding:9px;font-size:15px;border-color:#b875ff;color:#e3c8ff;background:rgba(184,117,255,.10)';
  b.textContent='🎒 비품함';b.onclick=openBag;
  if(a.id==='kt-coop-btn')a.after(b);else a.before(b);
}
let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;lobbyBtn();});}).observe(document.body,{childList:true});
lobbyBtn();
window.KTItems={applyRemote:list=>applyList(Array.isArray(list)?list.slice(0,12):[])>0,ITEMS,TIER,grant,open:openBag,state:()=>P,icon,descOf,effOf};
})();
