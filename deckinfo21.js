// 칼퇴 디펜스 — v21: 직원 편성 화면 스킬 설명
// - 카드를 누르면(선택/해제와 함께) 아래 설명 칸에 그 직업의 스킬이 나옴
// - 카드 오른쪽 위 ⓘ: 선택은 그대로 두고 설명만 보기 · 잠긴 직업도 눌러서 미리 보기
// - 카드 아래 글씨를 직업마다 짧은 역할 표시로 바꿈
// lobby10.js 의 편성 화면을 건드리지 않고, 화면이 그려질 때마다 덧붙이기만 함
(function(){
'use strict';
if(window.KTDeckInfo)return;
// 기본 직업(0~4) 최고 직급 능력 — index.html MYTH 와 같은 내용
const MYTH0=['한 번에 4명 동시 진료(공격)','35% 확률 1.1초 기절','초대형 범위 공격','공격 시 35% 확률 골드 대량 획득','범위 강력 둔화'];
const BASE0=[
  {dmg:9,cd:0.45,range:140,desc:'빠른 연타'},
  {dmg:16,cd:1.0,range:205,desc:'15% 확률 기절 "이의 있음!"'},
  {dmg:13,cd:1.2,range:180,desc:'범위 공격'},
  {dmg:10,cd:0.8,range:170,desc:'공격 시 12% 확률 골드 획득'},
  {dmg:8,cd:0.8,range:250,desc:'둔화 "로딩 중..."'},
];
const ULT0=['긴급 수술!','최종 판결!','재건축!','세무조사!','긴급 배포!'];
const GR0=['인턴','대리','과장','부장','대표'];
// 직업별 역할 표시와 쓰는 법
const ROLE=[
  {tag:'⚡ 빠른 연타',tip:'사거리가 짧아요 → 길 바로 옆 칸에 두세요'},
  {tag:'💫 기절',tip:'적을 멈춰 세워 보스 시간을 벌어요'},
  {tag:'💥 범위 공격',tip:'적이 몰리는 모퉁이 칸에 두면 좋아요'},
  {tag:'💰 골드 획득',tip:'일찍 뽑을수록 골드가 많이 쌓여요'},
  {tag:'🐢 원거리 둔화',tip:'사거리가 가장 길어 어느 칸에서든 닿아요'},
  {tag:'🔗 피해 증폭',tip:'수갑 찬 적은 다른 직원 공격에 더 아파요'},
  {tag:'🌊 범위 + 밀기',tip:'적을 뒤로 밀어 시간을 벌어요'},
  {tag:'📈 아군 지원',tip:'혼자는 약해요 → 강한 직원 바로 옆 칸에'},
  {tag:'🎯 강한 한 방',tip:'공격력이 가장 높아 보스 잡기 담당'},
  {tag:'📰 2명 동시',tip:'한꺼번에 몰려오는 적 정리 + 피해 증폭'},
  {tag:'🔥 범위 + 둔화',tip:'모퉁이에 두면 범위와 둔화를 같이 노려요'},
  {tag:'📦 초고속 + 밀기',tip:'아주 빨라서 작은 적을 밀어내며 막아요'},
];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function info(j){
  const J=window.KTJobs,PF=window.KTProfiles&&KTProfiles[j];
  const nj=j>=5&&J&&J.NEW_JOBS?J.NEW_JOBS[j-5]:null;
  const kj=window.KT&&KT.JOBS&&KT.JOBS[j];
  const b=nj||kj||BASE0[j]||{};
  const name=(J&&J.ALL_NAMES&&J.ALL_NAMES[j])||(kj&&kj.name)||'';
  const icon=(J&&J.ALL_ICONS&&J.ALL_ICONS[j])||(kj&&kj.icon)||'';
  const ranks=(nj&&nj.ranks)||(PF&&PF.titles)||GR0;
  const myth=j<5?MYTH0[j]:(J&&J.NEW_MYTH&&J.NEW_MYTH[j-5]?J.NEW_MYTH[j-5].desc:'');
  const ua=b.ultAs!=null?b.ultAs:j;
  let ult=window.KTFX&&KTFX.ULT&&KTFX.ULT[ua]?KTFX.ULT[ua].name:(ULT0[ua]||'');
  if(b.ultAs!=null&&J&&J.NEW_MYTH&&J.NEW_MYTH[j-5]&&J.NEW_MYTH[j-5].shout)ult=J.NEW_MYTH[j-5].shout;   // 다른 직업 효과를 빌려 쓰는 직업은 자기 구호로
  return {j,name,icon,dmg:b.dmg||0,cd:b.cd||1,range:b.range||0,desc:b.desc||'',myth,ult,ranks,pf:PF,role:ROLE[j]||null};
}
function rangeName(r){return r>=210?'원거리':r>=170?'중거리':'근거리';}
function bar(label,v,max,txt){const p=Math.max(8,Math.min(100,Math.round(v/max*100)));
  return `<div class="dki-st"><span>${label}</span><i><em style="width:${p}%"></em></i><b>${txt}</b></div>`;}
function panelHtml(j,on,locked,lv){
  const I=info(j);
  const rk=(I.ranks||GR0).map(r=>String(r).replace(/^★\d\s*/,''));
  return `<div class="dki-head"><b>${esc(I.icon)} ${esc(I.name)}</b>${I.role?`<span class="dki-tag">${esc(I.role.tag)}</span>`:''}
      <span class="dki-st8 ${locked?'lk':on?'on':''}">${locked?'🔒 Lv.'+lv+' 해금':on?'✔ 편성됨':'미편성'}</span></div>
    ${I.pf?`<div class="dki-who">${esc(I.pf.name)} · ${esc(I.pf.mbti||'')}</div>`:''}
    <div class="dki-sts">
      ${bar('공격력',I.dmg,24,I.dmg)}
      ${bar('공격 속도',1/I.cd,1/0.45,I.cd.toFixed(2)+'초')}
      ${bar('사거리',I.range-100,150,rangeName(I.range))}
    </div>
    <div class="dki-sk"><em>기본</em><span>${esc(I.desc)}</span></div>
    <div class="dki-sk"><em>★4 ${esc(rk[3]||'')}</em><span>5번 공격마다 강타</span></div>
    <div class="dki-sk my"><em>★5 ${esc(rk[4]||'')}</em><span>${esc(I.myth)}${I.ult?` · 필살기 <b>${esc(I.ult.replace('!',''))}</b> (6초마다)`:''}</span></div>
    ${I.role?`<div class="dki-tip">💡 ${esc(I.role.tip)}</div>`:''}
    <div class="dki-rk">${rk.map(esc).join(' → ')}</div>`;
}
const CSS=`.dki-panel{background:var(--k-panel2,#232331);border:2px solid var(--k-line,#3a3a4c);border-radius:14px;padding:10px 12px;margin:0 0 8px;font-size:12px;line-height:1.45}
.dki-panel.empty{color:var(--k-muted,#9aa);text-align:center;padding:12px}
.dki-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.dki-head b{font-size:15px}
.dki-tag{background:#3a2e12;color:#ffd277;border-radius:8px;padding:1px 7px;font-size:11px;font-weight:700}
.dki-st8{margin-left:auto;font-size:11px;color:var(--k-muted,#9aa)}.dki-st8.on{color:#40d987;font-weight:700}.dki-st8.lk{color:#ff8a8a}
.dki-who{color:var(--k-muted,#9aa);font-size:11px;margin:1px 0 6px}
.dki-sts{display:grid;gap:3px;margin:4px 0 8px}
.dki-st{display:grid;grid-template-columns:58px 1fr 52px;align-items:center;gap:6px;font-size:11px}
.dki-st span{color:var(--k-muted,#9aa)}.dki-st b{text-align:right;font-weight:700}
.dki-st i{display:block;height:7px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden}
.dki-st em{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#ffb020,#ff7a45)}
.dki-sk{display:grid;grid-template-columns:76px 1fr;gap:6px;padding:3px 0;border-top:1px dashed rgba(255,255,255,.08)}
.dki-sk em{font-style:normal;color:var(--k-muted,#9aa);font-size:11px}.dki-sk.my em{color:#ff8fbf;font-weight:700}
.dki-tip{margin-top:6px;background:rgba(64,217,135,.1);border-radius:8px;padding:5px 8px;color:#bff5d6}
.dki-rk{margin-top:6px;color:var(--k-muted,#9aa);font-size:10px}
.dk-card .dki-i{position:absolute;right:4px;top:30px;width:20px;height:20px;border-radius:50%;border:1px solid var(--k-line,#3a3a4c);background:rgba(0,0,0,.35);color:#fff;font-size:11px;font-weight:800;line-height:18px;text-align:center;cursor:pointer}
.dk-card.lock{cursor:pointer}.dk-card.dki-cur{box-shadow:0 0 0 2px #74c0fc inset}`;
function css(){if(document.getElementById('dki-css'))return;const s=document.createElement('style');s.id='dki-css';s.textContent=CSS;document.head.appendChild(s);}
// ---------------- 편성 화면에 붙이기 ----------------
function attach(sheet){
  if(sheet._dki)return;sheet._dki=true;css();
  const body=sheet.querySelector('.dk-body');if(!body)return;
  let cur=null;
  // 누른 카드 기억 (편성 화면이 다시 그려지기 전에 먼저 잡음)
  sheet.addEventListener('click',e=>{
    const c=e.target.closest&&e.target.closest('.dk-card');if(!c||!body.contains(c))return;
    const j=+c.dataset.j;
    if(e.target.closest('.dki-i')||c.classList.contains('lock')){
      e.stopPropagation();e.preventDefault();cur=j;decorate();
      try{if(window.KTSound)KTSound.play('select');}catch(_){}
      return;
    }
    cur=j;   // 선택/해제는 원래대로 진행 → 다시 그려지면 decorate
  },true);
  function decorate(){
    const grid=body.querySelector('.dk-grid');if(!grid)return;
    const cards=[...grid.querySelectorAll('.dk-card')];
    const PG=window.KTProg;
    cards.forEach(c=>{
      const j=+c.dataset.j,lock=c.classList.contains('lock');
      if(lock)c.removeAttribute('disabled');   // 잠긴 카드도 눌러서 설명 보기
      const r=ROLE[j],sm=c.querySelector('small');
      if(sm&&r&&!sm.dataset.dki){sm.dataset.dki=1;sm.textContent=lock?sm.textContent.trim()+' · '+r.tag.replace(/^\S+\s/,''):r.tag;}
      if(!c.querySelector('.dki-i')){const b=document.createElement('span');b.className='dki-i';b.textContent='i';b.title='스킬 설명';c.appendChild(b);}
      c.classList.toggle('dki-cur',j===cur);
    });
    let p=body.querySelector('.dki-panel');
    if(!p){p=document.createElement('div');p.className='dki-panel';grid.insertAdjacentElement('afterend',p);}
    if(cur==null){p.className='dki-panel empty';p.innerHTML='카드를 누르면 스킬 설명이 여기에 나와요 · <b>i</b> 는 설명만 보기';return;}
    const card=cards.find(c=>+c.dataset.j===cur);
    const lock=card?card.classList.contains('lock'):false,on=card?card.classList.contains('on'):false;
    p.className='dki-panel';
    p.innerHTML=panelHtml(cur,on,lock,PG&&PG.unlockLv?PG.unlockLv(cur):'?');
    try{const r=p.getBoundingClientRect(),vh=window.innerHeight||0;if(vh&&(r.bottom>vh||r.top<0))p.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(_){}
  }
  new MutationObserver(()=>{if(!body.querySelector('.dki-panel'))decorate();}).observe(body,{childList:true});
  decorate();
}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){
  if(n.nodeType!==1)continue;const s=n.querySelector&&n.querySelector('.dk-sheet');if(s)attach(s);
}}).observe(document.body,{childList:true});
window.KTDeckInfo={info,panelHtml,ROLE};
})();
