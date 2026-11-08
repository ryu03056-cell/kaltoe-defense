// 칼퇴 디펜스 — 증강(결재 서류 3택1) v15
// 5·15·25…웨이브(10웨이브마다)가 시작되면 카드 3장 중 1장을 고름 → 그 판 동안만 효과
//   등급: 일반(회색 55%) · 희귀(파랑 35%) · 영웅(보라 10%) · 한 번만 고를 수 있는 카드는 다시 안 나옴
//   혼자: 고르는 동안 게임 멈춤 · 협동: 멈추지 않고 15초 안에 고름(시간 지나면 자동) — 둘이 각자 고름
//     팀(team)   효과는 방장 폰에서 판 전체에 적용 (예: 전 직원 공격력)
//     지갑(wallet) 효과는 고른 사람 골드·커피·칸에 적용 (방장 폰이 지갑을 바꿔 끼워 실행)
//     개인(local) 효과는 고른 사람 폰에서만 (예: 판 끝 보상)
// 그림: ui/aug_{id}.png (64×64, PixelLab) — 없으면 이모지
// 연결: index.html 에서 coop14 다음에 불러옴. 협동 동료 선택은 coop14 execCmd 의 'aug' 로 전달
(function(){
'use strict';
const KT=window.KT;if(!KT)return;
const TIER=[{n:'일반',c:'#a3abb9',w:55},{n:'희귀',c:'#4aa3ff',w:35},{n:'영웅',c:'#b875ff',w:10}];
const R2=v=>Math.round(v*100)/100;
function jobName(j){const J=KT.JOBS[j];return J?J.name:'직원';}
function wallet(){return KT.S;}   // 방장 폰이 동료 몫을 실행할 땐 coop14 가 S.gold/S.coffee/S.summons 를 동료 것으로 바꿔 끼워 둠
function freeUnit(g){   // 내 칸(협동이면 내 덩어리)에 무료 직원
  const S=KT.S,d=S.deck&&S.deck.length?S.deck:[0,1,2,3,4],j=d[(Math.random()*d.length)|0];
  const i=KT.findSlot(j,g);if(i<0)return false;
  const c=S.cells[i];if(c){c.count++;c.cd.push(Math.random()*0.3);}else S.cells[i]={job:j,grade:g,count:1,cd:[Math.random()*0.3]};
  return true;
}
const AUGS=[
  // ---- 일반 ----
  {id:'bonus',t:0,e:'💰',name:'성과급',desc:'즉시 골드 +150',scope:'wallet',apply(){wallet().gold+=150;}},
  {id:'coffee',t:0,e:'☕',name:'커피머신 설치',desc:'즉시 커피 +2',scope:'wallet',apply(){wallet().coffee+=2;}},
  {id:'hunter',t:0,e:'🕴️',name:'헤드헌터',desc:'채용 비용이 3번 전으로 내려감',scope:'wallet',apply(){const S=wallet();S.summons=Math.max(0,S.summons-3);}},
  {id:'trip',t:0,e:'🧳',name:'출장 지원 인력',desc:'무료로 직원 2명 채용 (칸이 있을 때)',scope:'wallet',apply(){const S=wallet(),s0=S.summons;let n=0;for(let k=0;k<2;k++){const g0=S.gold;S.gold+=KT.summonCost();if(KT.summon())n++;else S.gold=g0;S.summons=s0;}return n;}},
  {id:'bus',t:0,e:'🚌',name:'정시 퇴근 버스',desc:'업무 이동 속도 -10%',scope:'team',apply(){const S=KT.S;S.spdMul*=0.9;S.enemies.forEach(e=>e.spd*=0.9);}},
  {id:'ot',t:0,e:'🌙',name:'야근수당',desc:'업무 처치 골드 +30%',scope:'team',apply(){KT.S.goldMul*=1.3;}},
  {id:'dept',t:0,e:'📁',name:'부서 지원',desc:j=>`${jobName(j)} 공격력 +40%`,scope:'team',roll(){const d=KT.S.deck||[0,1,2,3,4];return d[(Math.random()*d.length)|0];},apply(j){const m=KT.S.dmgMul.slice();m[j]=R2((m[j]||1)*1.4);KT.S.dmgMul=m;}},
  {id:'sub',t:0,e:'🫘',name:'커피 정기구독',desc:'5웨이브마다 커피 +1 더',scope:'wallet',apply(arg,who){const S=KT.S;if(who==='guest')S.augSub2=(S.augSub2||0)+1;else S.augSub=(S.augSub||0)+1;}},
  // ---- 희귀 ----
  {id:'dinner',t:1,e:'🍻',name:'팀 회식',desc:'전 직원 공격력 +15%',scope:'team',apply(){const S=KT.S;S.dmgMul=S.dmgMul.map(v=>R2(v*1.15));}},
  {id:'crit',t:1,e:'⚡',name:'급행 결재',desc:'치명타 확률 +8%',scope:'team',apply(){KT.S.crit=(KT.S.crit||0)+0.08;}},
  {id:'limit',t:1,e:'📦',name:'칼퇴 의지',desc:'쌓인 업무 한도 +15건',scope:'team',apply(){KT.CFG.maxEnemies+=15;}},
  {id:'auto',t:1,e:'🤖',name:'업무 자동화',desc:'채용 비용 오르는 폭 -30%',scope:'team',apply(){KT.CFG.summonStep=Math.max(1,Math.round(KT.CFG.summonStep*0.7));}},
  {id:'wbonus',t:1,e:'📅',name:'대리 출근',desc:'웨이브 보너스 골드 +50%',scope:'team',apply(){const C=KT.CFG,f=C.waveBonus;C.waveBonus=w=>Math.round(f(w)*1.5);}},
  {id:'promo',t:1,e:'🎖️',name:'승진 심사',desc:'★1 직원 칸 하나가 ★2로 (직업 유지)',scope:'wallet',apply(){const S=KT.S,R=(window.KTRules&&KTRules.myRange())||[0,S.cells.length];const ids=[];for(let i=R[0];i<R[1];i++){const c=S.cells[i];if(c&&c.grade===0)ids.push(i);}if(!ids.length)return false;const i=ids[(Math.random()*ids.length)|0];S.cells[i].grade=1;return true;}},
  {id:'split',t:1,e:'✂️',name:'업무 분담',desc:'앞으로 나오는 업무 체력 -10%',scope:'team',apply(){KT.S.hpMul*=0.9;}},
  {id:'bosst',t:1,e:'⏰',name:'마감 연장',desc:'보스 제한 시간 +15초',scope:'team',apply(){KT.CFG.bossTime+=15;if(KT.S.boss)KT.S.waveTimer+=15;}},
  // ---- 영웅 ----
  {id:'restruct',t:2,e:'🧹',name:'구조조정',once:1,desc:'쌓인 업무가 한도 85%에 닿으면 1번, 업무 40%를 즉시 처리',scope:'team',apply(){KT.S.augRestruct=1;}},
  {id:'raise',t:2,e:'📈',name:'연봉 인상',desc:'이번 판 보상 💵 +30%',scope:'local',apply(){raise+=0.3;}},
  {id:'ace',t:2,e:'🌟',name:'에이스 영입',desc:'무료로 ★3 직원 1명 (칸이 있을 때)',scope:'wallet',apply(){return freeUnit(2);}},
  {id:'ceo',t:2,e:'👔',name:'대표의 신임',desc:'전 직원 공격력 +30%, 대신 업무가 5% 빨라짐',scope:'team',apply(){const S=KT.S;S.dmgMul=S.dmgMul.map(v=>R2(v*1.3));S.spdMul*=1.05;S.enemies.forEach(e=>e.spd*=1.05);}},
];
const BY=Object.fromEntries(AUGS.map(a=>[a.id,a]));
let raise=0,picked=[],offerOpen=null,lastWave=0,lastSubWave=0;

// ---- 그림 (ui/aug_{id}.png) ----
const IMG={};
(function(){const L=window.KT_ASSET_LIST&&KT_ASSET_LIST.ui,v=(L&&L.v)||{},files=new Set((L&&L.files)||[]);
  AUGS.forEach(a=>{const n='aug_'+a.id;if(L&&!files.has(n))return;const im=new Image();im.onload=()=>{IMG[a.id]=im.src;};im.src='ui/'+n+'.png'+(v[n]?'?v='+v[n]:'');});})();
const icon=a=>IMG[a.id]?`<img src="${IMG[a.id]}" alt="" style="width:56px;height:56px;image-rendering:pixelated">`:`<span style="font-size:40px;line-height:56px">${a.e}</span>`;
const descOf=(a,arg)=>typeof a.desc==='function'?a.desc(arg):a.desc;

// ---- 카드 고르기 ----
function draw3(){
  const pool=AUGS.filter(a=>!(a.once&&picked.includes(a.id)));const out=[];
  for(let k=0;k<3&&pool.length;k++){
    let r=Math.random()*100,t=r<TIER[2].w?2:r<TIER[2].w+TIER[1].w?1:0;
    let cand=pool.filter(a=>a.t===t&&!out.some(o=>o.a.id===a.id));if(!cand.length)cand=pool.filter(a=>!out.some(o=>o.a.id===a.id));if(!cand.length)break;
    const a=cand[(Math.random()*cand.length)|0];out.push({a,arg:a.roll?a.roll():null});
  }
  return out;
}
const coopRole=()=>window.KTCoop&&KTCoop.role?KTCoop.role():null;
const coopIn=()=>!!(window.KTCoop&&KTCoop.inGame&&KTCoop.inGame());
function offer(){
  const S=KT.S;if(!S||S.state!=='play'||offerOpen)return;
  const cards=draw3();if(!cards.length)return;
  const coop=coopIn(),wasPaused=!!S.paused,pauseIt=!coop&&!wasPaused;   // v20.5: 이미 멈춰 있었으면(휴식 창) 카드를 골라도 계속 멈춰 둠
  if(!coop)S.paused=true;
  try{KTSound.play('luckWin');}catch(e){}
  const w=document.createElement('div');w.className='kt-modal kt-font';w.id='kt-aug';
  w.innerHTML=`<div class="kt-sheet" style="text-align:center">
    <h2 style="margin:0 0 4px">📋 결재 서류 도착</h2>
    <p class="kt-muted" style="margin:0 0 10px;font-size:13px">하나를 골라 이번 판 동안 적용해요${coop?` · <b id="kt-aug-t">15</b>초 안에 (협동이라 게임은 계속 돌아가요)`:''}</p>
    <div style="display:flex;gap:8px">${cards.map((o,i)=>{const T=TIER[o.a.t];return `<button data-i="${i}" class="kt-aug-c" style="flex:1;min-width:0;background:linear-gradient(180deg,${T.c}22,#161a22);border:2px solid ${T.c};border-radius:14px;padding:10px 6px;color:#e8ecf3;cursor:pointer;font:inherit">
      <div style="font-size:11px;color:${T.c};font-weight:800">${T.n}</div>${icon(o.a)}
      <div style="font-weight:800;font-size:14px;margin:4px 0 4px">${o.a.name}</div>
      <div style="font-size:11.5px;line-height:1.4;color:#cfd4de">${descOf(o.a,o.arg)}</div></button>`;}).join('')}</div>
    ${picked.length?`<p class="kt-muted" style="font-size:11px;margin:10px 0 0">이번 판에 고른 것: ${picked.map(id=>BY[id]?BY[id].e+BY[id].name:id).join(' · ')}</p>`:''}</div>`;
  document.body.appendChild(w);offerOpen={w,cards,tm:0};
  let left=15;const tm=offerOpen.tm=coop?setInterval(()=>{left--;const el=w.querySelector('#kt-aug-t');if(el)el.textContent=left;if(left<=0)choose((Math.random()*cards.length)|0);},1000):0;
  function choose(i){clearInterval(tm);if(!offerOpen||offerOpen.w!==w)return;const o=cards[i];w.remove();offerOpen=null;if(pauseIt&&KT.S)KT.S.paused=false;pick(o.a.id,o.arg);}
  w.querySelectorAll('.kt-aug-c').forEach(b=>b.onclick=()=>choose(+b.dataset.i));
}
// 고른 카드 적용 (혼자·방장은 바로, 동료는 개인 효과만 바로 · 나머지는 방장에게)
function pick(id,arg){
  const a=BY[id];if(!a)return;picked.push(id);
  const S=KT.S;
  if(coopRole()==='guest'&&coopIn()&&a.scope!=='local'){KTCoop.guestAct('aug',[id,arg]);}
  else{const r=a.apply(arg,'host');if(r===false)toast(`${a.name}: 적용할 칸이 없어요`);}
  if(S){S.banner={txt:`${a.e} ${a.name}`,sub:descOf(a,arg),t:1.8};}
  try{KTSound.play('summon',2);}catch(e){}
}
// 방장 폰에서 동료 카드 실행 (coop14 execCmd → 지갑은 이미 동료 것으로 바뀐 상태)
function applyRemote(id,arg){const a=BY[id];if(!a||a.scope==='local')return false;const r=a.apply(arg,'guest');return r!==false;}
function toast(m){const t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),1600);}

// ---- 매 프레임: 웨이브 감시 · 구조조정 · 정기구독 ----
function tick(){
  const S=KT.S;
  if(S&&S.state==='play'){
    if(S.wave!==lastWave){lastWave=S.wave;if(S.wave%10===5)setTimeout(offer,400);}
    const host=coopRole()!=='guest';
    if(host&&S.augRestruct&&S.enemies.length>=KT.CFG.maxEnemies*0.85){
      S.augRestruct=0;const n=Math.floor(S.enemies.length*0.4);
      const list=S.enemies.filter(e=>e.type!=='boss'&&!e.boss).sort((x,y)=>y.s-x.s).slice(0,n);
      list.forEach(e=>{e.hp=0;if(KT.burst)try{KT.burst(e.x,e.y,'#b875ff',6);}catch(_){}});S.dead=true;
      S.banner={txt:'🧹 구조조정!',sub:`쌓인 업무 ${list.length}건을 한 번에 처리했어요`,t:2};try{KTSound.play('myth');}catch(e){}
    }
    if(host&&S.wave>1&&(S.wave-1)%5===0&&lastSubWave!==S.wave){lastSubWave=S.wave;S.coffee+=(S.augSub||0);if(S.augSub2)S.coffee2=(S.coffee2||0)+S.augSub2;}
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// 새 판 시작: 기록 초기화 (CFG·S 는 게임이 새로 만듦)
const st0=KT.start;
KT.start=function(){raise=0;picked=[];lastWave=0;lastSubWave=0;if(offerOpen){clearInterval(offerOpen.tm);offerOpen.w.remove();offerOpen=null;}return st0.apply(this,arguments);};
// 판 끝 보상: 연봉 인상
const M=window.KTMeta;if(M&&M.reward){const rw=M.reward.bind(M);M.reward=function(r){const v=rw(r);return raise>0?Math.round(v*(1+raise)):v;};}

window.KTAug={AUGS,offer,pick,applyRemote,picked:()=>picked.slice()};
})();
