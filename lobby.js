// 칼퇴 디펜스 — 로비 · 결과 · 일시정지 · 상점 · 기록 · 설정 화면
// 게임 쪽에서 쓰는 것: KTLobby.show() / KTLobby.onGameEnd(result) / KTLobby.pause()
// 게임에 요구하는 것: window.KT.start(opts) / KT.revive() / KT.setPaused(b) / KT.S
(function(){
'use strict';
const $=s=>document.querySelector(s);
const M=()=>window.KTMeta,N=()=>window.KTMonet;
const fmt=n=>Math.round(n).toLocaleString();
const JOBS=['의사','변호사','건축가','회계사','개발자'];
let root,heroCv,heroRaf=0;
function el(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
function snd(n,a){try{window.KTSound&&KTSound.play(n,a);}catch(e){}}
function float(txt){const f=el(`<div class="kt-float kt-font">${txt}</div>`);document.body.appendChild(f);setTimeout(()=>f.remove(),1300);}
function modal(html,cls){
  const w=el(`<div class="kt-modal kt-font"><div class="kt-sheet ${cls||''}">${html}</div></div>`);
  w.addEventListener('click',e=>{if(e.target===w&&!w.dataset.lock)w.remove();});
  document.body.appendChild(w);return w;
}
// ---------------- 로비 ----------------
function build(){
  root=el(`<div id="lobby" class="kt-font" hidden><div class="lb">
    <div class="lb-top">
      <div class="lb-career"><span class="lb-badge" id="lb-badge">인턴</span><span class="lb-sub" id="lb-sub"></span></div>
      <div class="lb-cur">💵 <span id="lb-bonus">0</span></div><div class="lb-cur">💎 <span id="lb-stock">0</span></div>
    </div>
    <div class="lb-hero"><canvas id="lb-hero" width="1040" height="650"></canvas>
      <div class="lb-logo"><h1>칼퇴 디펜스</h1><p>진상 클라이언트와 상사를 막고, 오늘은 꼭 칼퇴한다</p></div></div>
    <div id="lb-daily"></div>
    <button class="kt-btn kt-btn-main lb-start" id="lb-start">▶ 출근하기</button>
    <div class="lb-boosts" id="lb-boosts"></div>
    <div class="lb-grid">
      <button class="kt-btn" id="lb-dex"><em>👥</em>도감</button>
      <button class="kt-btn" id="lb-rec"><em>🏆</em>기록</button>
      <button class="kt-btn" id="lb-shop"><em>🛒</em>상점</button>
      <button class="kt-btn" id="lb-set"><em>⚙️</em>설정</button>
    </div>
    <div class="lb-foot" id="lb-foot"></div>
  </div></div>`);
  document.body.appendChild(root);
  heroCv=$('#lb-hero');
  $('#lb-start').onclick=startGame;
  $('#lb-dex').onclick=()=>window.open('dex3.html','_blank');
  $('#lb-rec').onclick=records;
  $('#lb-shop').onclick=()=>shop('boost');
  $('#lb-set').onclick=settings;
  $('#lb-foot').innerHTML=`v8 · ${window.KTChars&&KTChars.credit?KTChars.credit+' · ':''}캐릭터 원화 일부 Kenney (CC0)<br>${N()&&N().isApp()?'':'웹 버전: 광고·결제는 테스트 화면으로만 동작합니다'}`;
  M().on(refresh);
}
function refresh(){
  if(!root)return;const d=M().get(),c=M().careerTitle();
  const b=$('#lb-badge');b.textContent=c.t;b.style.color=c.c;
  $('#lb-sub').textContent=`최고 ${d.best}웨이브 · 칼퇴 ${d.wins}회 · 출근 ${d.games}회`;
  $('#lb-bonus').textContent=fmt(d.bonus);$('#lb-stock').textContent=fmt(d.stock);
  // 출근 도장
  const s=M().dailyState(),box=$('#lb-daily');
  const rw=s.reward.stock?`💎${s.reward.stock}`:`💵${s.reward.bonus}`;
  box.innerHTML=`<div class="lb-daily"><div class="d-ic">${s.claimed?'✅':'📅'}</div><div class="d-t"><b>출근 도장 ${s.claimed?s.streak+'일 연속 완료':(s.streak+1)+'일째'}</b>
    <span>${s.claimed?'내일 또 출근하세요':'오늘 보상 '+rw}</span><div class="lb-days">${[0,1,2,3,4,5,6].map(i=>`<i class="${i<(s.claimed?s.idx+1:s.idx)?'on':''}"></i>`).join('')}</div></div>
    ${s.claimed?'':`<button class="kt-btn kt-btn-main" id="d-get">받기</button><button class="kt-btn kt-btn-ad" id="d-ad">📺 2배</button>`}</div>`;
  if(!s.claimed){
    $('#d-get').onclick=()=>{const r=M().claimDaily(1);if(r){snd('coin');float(r.stock?`💎+${r.stock}`:`💵+${r.bonus}`);}};
    $('#d-ad').onclick=async()=>{if(await N().rewarded('daily')){const r=M().claimDaily(2);if(r){snd('luckWin');float(r.stock?`💎+${r.stock}`:`💵+${r.bonus}`);}}};
  }
  const bz=M().BOOSTS.filter(x=>d.boost[x.id]);
  $('#lb-boosts').innerHTML=bz.length?bz.map(x=>`<span>${x.icon} ${x.name} 적용 예정</span>`).join(''):'<span style="background:none;border:none;color:#6b7385">🛒 상점에서 부스터를 사면 다음 출근에 적용돼요</span>';
}
function heroLoop(now){
  if(root.hidden){heroRaf=0;return;}
  const c=heroCv.getContext('2d'),W=heroCv.width,H=heroCv.height,t=now/1000;
  c.clearRect(0,0,W,H);
  // 사무실 바닥·창문
  c.fillStyle='#232a38';c.fillRect(0,H*0.62,W,H*0.38);
  c.fillStyle='rgba(255,255,255,0.04)';for(let x=0;x<W;x+=80)c.fillRect(x,H*0.62,2,H*0.38);
  for(let i=0;i<4;i++){const x=70+i*250;c.fillStyle='#1a2030';c.fillRect(x,150,170,170);c.fillStyle='#ffcf6b';
    for(let k=0;k<6;k++){const on=Math.sin(t*0.7+i*3+k*1.7)>-0.3;c.globalAlpha=on?0.55:0.12;c.fillRect(x+15+(k%3)*52,165+Math.floor(k/3)*75,38,58);}c.globalAlpha=1;}
  // 시계 (18:00 칼퇴!)
  const cx=W-90,cy=230;c.fillStyle='#e9ecf2';c.beginPath();c.arc(cx,cy,42,0,Math.PI*2);c.fill();c.strokeStyle='#2b2b33';c.lineWidth=5;c.stroke();
  const mm=(t*12)%60;c.save();c.translate(cx,cy);c.lineCap='round';c.lineWidth=6;c.rotate(Math.PI*2*(17/12+mm/720));c.beginPath();c.moveTo(0,0);c.lineTo(0,-22);c.stroke();c.restore();
  c.save();c.translate(cx,cy);c.lineWidth=4;c.rotate(Math.PI*2*mm/60);c.beginPath();c.moveTo(0,0);c.lineTo(0,-32);c.strokeStyle='#e03131';c.stroke();c.restore();
  // 캐릭터 5명 (부장) + 가운데 대표
  if(window.KTChars){
    const xs=[0.14,0.31,0.5,0.69,0.86];
    xs.forEach((fx,j)=>{const big=j===2;KTChars.portrait(c,j,big?4:3,W*fx,H*0.74+Math.sin(t*2+j)*4,big?250:205,t);});
  }
  heroRaf=requestAnimationFrame(heroLoop);
}
function show(){
  if(!root)build();
  refresh();root.hidden=false;
  const app=document.getElementById('app');if(app)app.style.visibility='hidden';
  if(!heroRaf)heroRaf=requestAnimationFrame(heroLoop);
  try{window.KTSound&&KTSound.setMode('normal');}catch(e){}
}
function hide(){root.hidden=true;const app=document.getElementById('app');if(app)app.style.visibility='visible';}
function startGame(){
  snd('wave');try{window.KTSound&&KTSound.init();}catch(e){}
  const boosts=M().takeBoosts();hide();
  window.KT.start({gold:boosts.gold?60:0,coffee:boosts.coffee?1:0,career:!!boosts.career});
  refresh();
}
// ---------------- 결과 ----------------
function onGameEnd(r){
  // r: {won, title, sub, wave, kills, summons, myths, mythJobs, canRevive}
  const base=M().reward(r);let mult=1,done=false;
  const w=modal(`<div class="kt-result-title" style="color:${r.won?'#40d987':'#ff6b6b'}">${r.won?'🎉 칼퇴 성공!':'😵 야근 확정…'}</div>
    <p class="kt-muted" style="text-align:center">${r.won?'회장님까지 퇴근시켰습니다':(r.title||'')+(r.sub?' — '+r.sub:'')}</p>
    <div class="kt-stats"><div><b>${r.wave}</b><span>도달 웨이브</span></div><div><b>${fmt(r.kills)}</b><span>처리한 업무</span></div>
      <div><b>${r.summons}</b><span>채용</span></div><div><b>${r.myths}</b><span>대표 취임</span></div></div>
    <div class="kt-reward" id="rs-rw">💵 +${fmt(base)}</div>
    ${r.canRevive?`<div class="kt-row"><button class="kt-btn kt-btn-pink" id="rs-rev">📺 이어하기 (1회)</button><button class="kt-btn" id="rs-revs">💎10 이어하기</button></div>`:''}<div class="kt-row"><button class="kt-btn kt-btn-ad" id="rs-dbl">📺 보상 2배</button></div>
    <div class="kt-row"><button class="kt-btn kt-btn-main" id="rs-again">다시 출근</button><button class="kt-btn" id="rs-lobby">로비로</button></div>`);
  w.dataset.lock=1;
  const finish=async(next)=>{
    if(!done){done=true;M().recordGame(r);M().add(base*mult,0);}
    w.remove();await N().maybeInterstitial();
    if(next==='again')startGame();else show();
  };
  const rev=w.querySelector('#rs-rev');
  if(rev)rev.onclick=async()=>{if(await N().rewarded('revive')){w.remove();window.KT.revive();snd('bossdown');}};
  const revs=w.querySelector('#rs-revs');
  if(revs)revs.onclick=()=>{if(M().spend('stock',10)){w.remove();window.KT.revive();snd('bossdown');}else{snd('error');float('💎 스톡옵션이 부족해요 · 상점에서 구매');}};
  w.querySelector('#rs-dbl').onclick=async(e)=>{if(mult>1)return;if(await N().rewarded('double')){mult=2;e.target.disabled=true;e.target.textContent='✔ 2배 적용';w.querySelector('#rs-rw').textContent=`💵 +${fmt(base*2)}`;snd('coin');}};
  w.querySelector('#rs-again').onclick=()=>finish('again');
  w.querySelector('#rs-lobby').onclick=()=>finish('lobby');
}
// ---------------- 일시정지 ----------------
function pause(){
  if(!window.KT||KT.S.state!=='play')return;
  KT.setPaused(true);
  const muted=window.KTSound&&KTSound.isMuted();
  const w=modal(`<h2>⏸ 잠깐 휴식</h2><p class="kt-muted">웨이브 ${KT.S.wave} · 쌓인 업무 ${KT.S.enemies.length}건</p>
    <div class="kt-row"><button class="kt-btn kt-btn-main" id="p-go">계속하기</button></div>
    <div class="kt-row"><button class="kt-btn" id="p-snd">${muted?'🔇 소리 켜기':'🔊 소리 끄기'}</button><button class="kt-btn" id="p-re">다시 출근</button><button class="kt-btn" id="p-lobby">로비로</button></div>`);
  w.dataset.lock=1;
  w.querySelector('#p-go').onclick=()=>{w.remove();KT.setPaused(false);};
  w.querySelector('#p-snd').onclick=e=>{const m=KTSound.toggleMute();e.target.textContent=m?'🔇 소리 켜기':'🔊 소리 끄기';const mb=document.getElementById('bMute');if(mb)mb.textContent=m?'🔇':'🔊';};
  w.querySelector('#p-re').onclick=()=>{w.remove();KT.abandon();startGame();};
  w.querySelector('#p-lobby').onclick=()=>{w.remove();KT.abandon();show();};
}
// ---------------- 상점 ----------------
function shop(tab){
  const d=M().get();
  const boosts=M().BOOSTS.map(b=>`<div class="kt-item"><div class="i-ic">${b.icon}</div><div class="i-t"><b>${b.name}</b><span>${b.desc} · 다음 판 1회</span></div>
    <button class="kt-btn ${d.boost[b.id]?'':'kt-btn-main'}" data-boost="${b.id}" ${d.boost[b.id]?'disabled':''}>${d.boost[b.id]?'적용 예정':'💵 '+b.price}</button></div>`).join('');
  const prem=N().PRODUCTS.map(p=>{const owned=(p.sku==='no_ads'&&d.owned.noAds)||(p.sku==='starter'&&d.owned.starter);
    return `<div class="kt-item"><div class="i-ic">${p.icon}</div><div class="i-t"><b>${p.name}</b><span>${p.desc}</span></div>
    <button class="kt-btn ${owned?'':'kt-btn-pink'}" data-sku="${p.sku}" ${owned?'disabled':''}>${owned?'보유 중':p.price}</button></div>`;}).join('');
  const w=modal(`<h2>🛒 상점</h2><div class="kt-tabs"><button class="kt-btn ${tab==='boost'?'on':''}" data-tab="boost">출근 부스터</button><button class="kt-btn ${tab==='prem'?'on':''}" data-tab="prem">프리미엄</button></div>
    <div>${tab==='boost'?boosts+`<p class="kt-muted">보유 💵 ${fmt(d.bonus)} · 보너스는 판이 끝날 때마다 쌓여요</p>`:prem+`<p class="kt-muted">${N().isApp()?'':'웹 버전에서는 테스트 결제 화면만 뜨고 실제 결제는 되지 않습니다.'}</p>`}</div>
    <div class="kt-row"><button class="kt-btn" id="s-x">닫기</button></div>`);
  w.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{w.remove();shop(b.dataset.tab);});
  w.querySelectorAll('[data-boost]').forEach(b=>b.onclick=()=>{if(M().buyBoost(b.dataset.boost)){snd('coin');w.remove();shop('boost');}else{snd('error');float('💵 보너스가 부족해요');}});
  w.querySelectorAll('[data-sku]').forEach(b=>b.onclick=async()=>{if(await N().buy(b.dataset.sku)){snd('luckWin');w.remove();shop('prem');float('구매 완료!');}});
  w.querySelector('#s-x').onclick=()=>w.remove();
}
// ---------------- 기록 ----------------
function records(){
  const d=M().get(),c=M().careerTitle();
  const mj=JOBS.map((n,j)=>`<span style="opacity:${d.myths[j]?1:.35}">${d.myths[j]?'🏆':'🔒'} ${n} 대표${d.myths[j]?' ×'+d.myths[j]:''}</span>`).join(' · ');
  const w=modal(`<h2>🏆 기록</h2><p>현재 직급 <b style="color:${c.c}">${c.t}</b></p>
    <div class="kt-stats"><div><b>${d.best}</b><span>최고 웨이브</span></div><div><b>${d.wins}</b><span>칼퇴 성공</span></div>
      <div><b>${d.games}</b><span>출근 횟수</span></div><div><b>${fmt(d.kills)}</b><span>누적 처리 업무</span></div></div>
    <h3>대표 취임 도감</h3><p class="kt-muted" style="line-height:1.8">${mj}</p>
    <p class="kt-muted" style="margin-top:8px">직급 기준: 사원 5웨이브 · 대리 10 · 과장 20 · 부장 칼퇴 1회 · 대표 칼퇴 5회</p>
    <div class="kt-row"><button class="kt-btn" id="r-x">닫기</button></div>`);
  w.querySelector('#r-x').onclick=()=>w.remove();
}
// ---------------- 설정 ----------------
function settings(){
  const muted=window.KTSound&&KTSound.isMuted();
  const w=modal(`<h2>⚙️ 설정</h2>
    <div class="kt-toggle"><span>소리</span><button class="kt-btn" id="st-snd">${muted?'🔇 꺼짐':'🔊 켜짐'}</button></div>
    <div class="kt-toggle"><span>진동</span><button class="kt-btn" id="st-vib">${localStorage.getItem('kt_vib')==='0'?'꺼짐':'켜짐'}</button></div>
    <div class="kt-toggle"><span>저장 데이터 초기화</span><button class="kt-btn" id="st-reset">초기화</button></div>
    <p class="kt-muted" style="margin-top:10px;line-height:1.6">칼퇴 디펜스 v8 · 진행 데이터는 이 기기 브라우저에만 저장됩니다.<br>캐릭터: PixelLab 생성 / Kenney (CC0)</p>
    <div class="kt-row"><button class="kt-btn" id="st-x">닫기</button></div>`);
  w.querySelector('#st-snd').onclick=e=>{try{KTSound.init();}catch(_){}const m=KTSound.toggleMute();e.target.textContent=m?'🔇 꺼짐':'🔊 켜짐';};
  w.querySelector('#st-vib').onclick=e=>{let v='1';try{v=localStorage.getItem('kt_vib')==='0'?'1':'0';localStorage.setItem('kt_vib',v);}catch(_){}e.target.textContent=v==='0'?'꺼짐':'켜짐';};
  w.querySelector('#st-reset').onclick=e=>{if(e.target.dataset.c){M().reset();w.remove();refresh();float('초기화 완료');}else{e.target.dataset.c=1;e.target.textContent='한 번 더 누르면 초기화';}};
  w.querySelector('#st-x').onclick=()=>w.remove();
}
window.KTLobby={show,hide,onGameEnd,pause,shop,refresh};
})();
