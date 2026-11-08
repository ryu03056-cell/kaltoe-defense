// 칼퇴 디펜스 — v20: 🗓️ 주간 도전 · 🎫 시즌 패스 · 🏆 협동 랭킹
// - 주간 도전: 매주 바뀌는 테마 + 변수 2개 + 주간 보스(보호막·호출·돌진·순간 이동). 이번 주 첫 클리어 🪙 황금 상자 + 💎30
// - 시즌 패스: 매달 새 시즌 · 판마다 시즌 경험치 · 30단계. 무료 줄 + 칼퇴 패스(월정액) 줄. 로비 🎫 버튼이 시즌 화면을 엶
// - 협동 랭킹: 협동 연속 출근 기록을 Firebase rank/{주}/{uid} 에 올림 (이번 주 · 웨이브 순). 닉네임은 기기에 저장
// 기존 파일은 고치지 않음: KTLobby.onGameEnd · KTThemes.onSpawn 을 감싸고, 로비 버튼은 MutationObserver 로 붙임
// 반드시 boxes17.js 다음 (상자 지급), 게임 스크립트 다음에서 불러옴
(function(){
'use strict';
const TH=window.KTThemes,L=window.KTLobby;if(!TH||!L||window.KTWeekly)return;
const M=()=>window.KTMeta,BX=()=>window.KTBox,IT=()=>window.KTItems,PG=()=>window.KTProg,UP=()=>window.KTUp;
const KEY='kt_v20';
const weekOf=d=>{d=d||new Date();const j=new Date(d.getFullYear(),0,1);return d.getFullYear()+'w'+Math.floor(((d-j)/864e5+j.getDay())/7);};   // boxes17 과 같은 계산
const seasonOf=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
function fresh(){return {wk:{week:'',cleared:false,best:0,tries:0},ss:{id:'',xp:0,free:{},prem:{}},nick:'',rk:{week:'',w:0}};}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v){const f=fresh();return {wk:Object.assign(f.wk,v.wk),ss:Object.assign(f.ss,v.ss),nick:typeof v.nick==='string'?v.nick.slice(0,12):'',rk:Object.assign(f.rk,v.rk)};}}catch(e){}return fresh();}
let P=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}updBtns();}
addEventListener('storage',e=>{if(e.key===KEY){P=load();updBtns();}});
function roll(){const w=weekOf();if(P.wk.week!==w)P.wk={week:w,cleared:false,best:0,tries:0};const s=seasonOf();if(P.ss.id!==s)P.ss={id:s,xp:0,free:{},prem:{}};}
roll();
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function toast(t){const d=document.createElement('div');d.className='kt-font';d.textContent=t;d.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:99999;background:#1b1f29;color:#ffe08a;border:1px solid #ffb020;border-radius:12px;padding:10px 16px;font-size:15px;box-shadow:0 6px 24px #0008;pointer-events:none';document.body.appendChild(d);setTimeout(()=>d.remove(),1800);}
function modal(html){const w=document.createElement('div');w.className='kt-modal kt-font';w.innerHTML=`<div class="kt-sheet" style="text-align:center">${html}</div>`;document.body.appendChild(w);w.addEventListener('click',e=>{if(e.target===w)w.remove();});try{KTSound.play('select');}catch(e){}return w;}

// ================= 주간 도전 =================
const MODS=['rush','clients','poor','limit','regen','armor','split'];
const CLASH=[['clients','split']];   // split 은 clients 와 함께일 때만 의미가 커서 같이 나오면 너무 어려움 → 하나만
function weekly(){
  const w=weekOf(),h=hash('kt'+w);
  const ths=Object.keys(TH.THEMES).filter(k=>TH.THEMES[k].boss&&k!=='weekend');
  const th=ths[h%ths.length];
  const pool=MODS.slice(),mods=[];let x=h>>>8;
  while(mods.length<2&&pool.length){const m=pool.splice(x%pool.length,1)[0];x=Math.floor(x/7)+13;if(CLASH.some(c=>c.includes(m)&&c.some(o=>o!==m&&mods.includes(o))))continue;mods.push(m);}
  return {id:'W',name:'주간 도전 · '+TH.THEMES[th].name,weekly:true,week:w,theme:th,ch:0,idx:10,waves:20,bossEvery:10,bosses:[0,1],bossHp:[20,26],hp:2.3+(h%3)*0.1,
    mods,mix:{call:0.08},skills:{0:'meeting'},first:{bonus:0},clear:0};
}
const ST=window.KTStages;
function startWeekly(){
  roll();const s=weekly();TH.STAGE_THEME.W=s.theme;P.wk.tries++;save();
  document.querySelectorAll('.kt-modal').forEach(m=>m.remove());
  try{window.KTSound&&KTSound.init();KTSound.play('wave');}catch(e){}
  const b=M()&&M().takeBoosts?M().takeBoosts():{};L.hide();
  window.KT.start({gold:b.gold?60:0,coffee:b.coffee?1:0,career:!!b.career,stage:s,up:UP()?UP().effects():undefined,deck:PG()?PG().deck():undefined});
  const S=window.KT.S;if(S&&S.banner)S.banner.sub=`🗓️ 이번 주 도전 · ${S.banner.sub||''}`;
}
// 주간 보스: 마지막 보스에 주간 패턴
const oSpawn=TH.onSpawn;
TH.onSpawn=function(e){oSpawn.call(this,e);try{const S=window.KT&&window.KT.S;if(e.boss&&S&&S.stage&&S.stage.weekly&&e.tb){e.pat19='weekly';e.name='주간 보스 · '+e.name;}}catch(x){}};
function weeklyScreen(){
  roll();const s=weekly(),th=TH.THEMES[s.theme],MD=ST?ST.MODS:{};
  const left=(()=>{const d=new Date(),j=new Date(d.getFullYear(),0,1),day=(d-j)/864e5+j.getDay(),rest=7-(day%7);return rest>=1?Math.ceil(rest)+'일':Math.ceil(rest*24)+'시간';})();
  const w=modal(`<h2 style="margin:0 0 4px">🗓️ 주간 도전</h2><p class="kt-muted" style="margin:0 0 8px;font-size:12px">매주 바뀌어요 · 남은 시간 ${left}</p>
    <div style="border:2px solid ${th.acc};border-radius:14px;padding:12px;background:${th.acc}14;text-align:left">
      <div style="font-size:18px;font-weight:800">${th.icon} ${esc(th.name)}</div>
      <div style="font-size:12.5px;color:#cfd4de;margin:4px 0">20웨이브 · 업무 체력 ${Math.round(s.hp*100)}% · 추천 직원 ${th.jobs.map(j=>(window.KTJobs?KTJobs.ALL_ICONS[j]+' '+KTJobs.ALL_NAMES[j]:j)).join(' · ')||'없음'}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0">${s.mods.map(m=>MD[m]?`<span style="font-size:11.5px;border:1px solid #ff8787;color:#ffc9c9;border-radius:8px;padding:2px 6px">${MD[m].icon} ${MD[m].name} — ${MD[m].desc}</span>`:'').join('')}</div>
      <div style="font-size:12.5px;color:#ffe08a">👔 최종: <b>주간 보스 · ${esc(th.boss.name)}</b><br><span style="color:#cfd4de">결재 보류(보호막) · 긴급 업무 호출 · 돌진 · 순간 이동</span></div></div>
    <div style="margin:10px 0;font-size:13px">${P.wk.cleared?'✅ 이번 주 클리어 완료 — 다음 주에 새 도전이 열려요':'첫 클리어 보상: 🪙 황금 상자 + 💎 30'}<br><span class="kt-muted" style="font-size:12px">이번 주 도전 ${P.wk.tries}회 · 최고 ${P.wk.best}웨이브</span></div>
    <div style="display:flex;gap:8px"><button class="kt-btn" id="wk-go" style="flex:2;padding:12px;font-size:16px;border-color:#ffb020;color:#ffcf6a">▶ 도전하기</button><button class="kt-btn" id="wk-x" style="flex:1;padding:12px">닫기</button></div>`);
  w.querySelector('#wk-x').onclick=()=>w.remove();
  w.querySelector('#wk-go').onclick=()=>{w.remove();startWeekly();};
}

// ================= 시즌 패스 =================
const XP_TIER=150,TIERS=30;
const tierOf=xp=>Math.min(TIERS,Math.floor(xp/XP_TIER));
function freeRw(t){if(t===TIERS)return {box:'gold',stock:50};if(t%10===0)return {box:'safe'};if(t%5===0)return {box:'parcel'};return t%2?{money:80+t*10}:{box:'env'};}
function premRw(t){if(t===TIERS)return {box:'gold',n:2,item:1};if(t%10===0)return {box:'gold'};if(t%5===0)return {box:'safe',stock:10};return t%3===0?{item:1}:{stock:5};}
function rwTxt(r){const BB=BX()?BX().BOX:[],b=r.box?BB.find(x=>x.id===r.box):null;return [b?`${b.e} ${b.name}${r.n>1?' ×'+r.n:''}`:'',r.money?`💵 ${r.money}`:'',r.stock?`💎 ${r.stock}`:'',r.item?'🎒 비품':''].filter(Boolean).join(' + ');}
function grant(r,why){
  if(r.box&&BX())BX().give(r.box,r.n||1,why);
  if((r.money||r.stock)&&M())M().add(r.money||0,r.stock||0);
  let it=null;if(r.item&&IT()&&IT().grant)it=IT().grant({bonus:1});
  return it;
}
function seasonXp(r){return Math.round(20+(r.wave||0)*2+(r.won?40:0)+(r.coopStage?r.coopStage*20:0)+((r.stage==='W'&&r.won)?60:0));}
function claim(kind,t){
  roll();const tier=tierOf(P.ss.xp),prem=kind==='prem';
  if(t>tier||P.ss[kind][t])return false;if(prem&&!(PG()&&PG().passActive()))return false;
  P.ss[kind][t]=1;save();grant(prem?premRw(t):freeRw(t),`시즌 ${t}단계`);return true;
}
function claimAll(){let n=0;const tier=tierOf(P.ss.xp),pa=PG()&&PG().passActive();for(let t=1;t<=tier;t++){if(!P.ss.free[t]&&claim('free',t))n++;if(pa&&!P.ss.prem[t]&&claim('prem',t))n++;}return n;}
function readyCount(){const tier=tierOf(P.ss.xp),pa=PG()&&PG().passActive();let n=0;for(let t=1;t<=tier;t++){if(!P.ss.free[t])n++;if(pa&&!P.ss.prem[t])n++;}return n;}
function seasonScreen(){
  roll();const tier=tierOf(P.ss.xp),into=P.ss.xp-tier*XP_TIER,pa=!!(PG()&&PG().passActive());
  const d=new Date(),end=new Date(d.getFullYear(),d.getMonth()+1,1),left=Math.ceil((end-d)/864e5);
  const rows=[];for(let t=1;t<=TIERS;t++){const got=t<=tier;
    const cell=(kind,r)=>{const done=P.ss[kind][t],lock=kind==='prem'&&!pa;
      return `<button class="kt-btn ss-c" data-k="${kind}" data-t="${t}" ${got&&!done&&!lock?'':'disabled'} style="flex:1;padding:6px 4px;font-size:11.5px;min-height:40px;${done?'opacity:.45':''}${got&&!done&&!lock?';border-color:#ffb020;color:#ffcf6a;background:rgba(255,176,32,.12)':''}">${done?'✅ ':lock?'🔒 ':''}${rwTxt(r)}</button>`;};
    rows.push(`<div style="display:flex;gap:6px;align-items:center;margin:4px 0"><div style="width:30px;font-weight:800;color:${got?'#ffcf6a':'#667'}">${t}</div>${cell('free',freeRw(t))}${cell('prem',premRw(t))}</div>`);}
  const rc=readyCount();
  const w=modal(`<h2 style="margin:0 0 2px">🎫 시즌 패스</h2><p class="kt-muted" style="margin:0 0 8px;font-size:12px">${P.ss.id} 시즌 · ${left}일 남음 · 판을 할 때마다 시즌 경험치</p>
    <div style="text-align:left;font-size:13px">시즌 단계 <b style="color:#ffcf6a;font-size:18px">${tier}</b> / ${TIERS} ${tier<TIERS?`<span class="kt-muted">· 다음 단계까지 ${XP_TIER-into} XP</span>`:''}</div>
    <div style="height:8px;background:#262b36;border-radius:6px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:${tier>=TIERS?100:into/XP_TIER*100}%;background:linear-gradient(90deg,#ffb020,#ff6b9d)"></div></div>
    <div style="display:flex;gap:6px;font-size:12px;font-weight:800;margin-bottom:2px"><div style="width:30px"></div><div style="flex:1">무료</div><div style="flex:1;color:#e3c8ff">🎫 칼퇴 패스${pa?' · 이용 중':''}</div></div>
    <div id="ss-list" style="max-height:46vh;overflow:auto;padding-right:2px">${rows.join('')}</div>
    <div style="display:flex;gap:8px;margin-top:10px"><button class="kt-btn" id="ss-all" ${rc?'':'disabled'} style="flex:1;padding:10px;${rc?'border-color:#ffb020;color:#ffcf6a':''}">모두 받기${rc?' ('+rc+')':''}</button>
      <button class="kt-btn" id="ss-pass" style="flex:1;padding:10px;border-color:#b875ff;color:#e3c8ff">🎫 월정액 칼퇴 패스</button></div>
    <p class="kt-muted" style="font-size:11px;margin:6px 0 0">경험치: 판마다 20 + 웨이브×2 · 칼퇴 성공 +40 · 협동 단계×20 · 주간 도전 클리어 +60</p>
    <button class="kt-btn" id="ss-x" style="width:100%;padding:10px;margin-top:8px">닫기</button>`);
  const list=w.querySelector('#ss-list');const first=Math.max(0,tier-2);setTimeout(()=>{const r=list.children[first];if(r)list.scrollTop=r.offsetTop-list.offsetTop;},0);
  w.querySelector('#ss-x').onclick=()=>w.remove();
  w.querySelector('#ss-pass').onclick=()=>{w.remove();L.passScreen(()=>seasonScreen());};
  w.querySelector('#ss-all').onclick=()=>{const n=claimAll();if(n){try{KTSound.play('coin');}catch(e){}toast(`보상 ${n}개 받음! 상자는 🎁 보상함에서`);}w.remove();seasonScreen();};
  w.querySelectorAll('.ss-c').forEach(b=>b.onclick=()=>{if(claim(b.dataset.k,+b.dataset.t)){try{KTSound.play('coin');}catch(e){}toast('받았어요! 상자는 🎁 보상함에서');}const st=list.scrollTop;w.remove();const n=seasonScreen();n.querySelector('#ss-list').scrollTop=st;});
  return w;
}

// ================= 협동 랭킹 (Firebase) =================
let fb=null,fbErr='';
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('load '+src));document.head.appendChild(s);});}
async function fbInit(){
  if(fb)return fb;const cfg=window.KT_FIREBASE;if(!cfg||!cfg.databaseURL){fbErr='서버 설정이 없어요';return null;}
  try{
    if(!window.firebase||!firebase.database){const b='https://www.gstatic.com/firebasejs/10.12.2/';
      if(!window.firebase)await loadScript(b+'firebase-app-compat.js');
      if(!firebase.auth)await loadScript(b+'firebase-auth-compat.js');
      if(!firebase.database)await loadScript(b+'firebase-database-compat.js');}
    const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
    const auth=firebase.auth(app);if(!auth.currentUser)await auth.signInAnonymously();
    fb={uid:auth.currentUser.uid,db:firebase.database(app)};return fb;
  }catch(e){fbErr='서버에 연결하지 못했어요';console.warn('[rank]',e);return null;}
}
function nick(){if(!P.nick){P.nick='사원'+String(1000+Math.floor(Math.random()*9000));save();}return P.nick;}
async function submitCoop(stage,wave){
  roll();const w=weekOf();if(P.rk.week!==w)P.rk={week:w,w:0};
  if(!(wave>P.rk.w))return;P.rk.w=wave;save();
  const f=await fbInit();if(!f)return;
  try{await f.db.ref('rank/'+w+'/'+f.uid).set({n:nick(),s:stage,w:wave,at:firebase.database.ServerValue.TIMESTAMP});}catch(e){console.warn('[rank] 올리기 실패',e&&e.message);}
}
async function rankScreen(){
  const w=modal(`<h2 style="margin:0 0 4px">🏆 협동 랭킹</h2><p class="kt-muted" style="margin:0 0 8px;font-size:12px">이번 주 협동 연속 출근 · 버틴 웨이브 순 · 매주 초기화</p>
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><span style="font-size:13px">내 이름</span><input id="rk-n" maxlength="12" value="${esc(nick())}" style="flex:1;padding:7px 10px;border-radius:10px;border:1px solid #3a4150;background:#151922;color:#fff;font:inherit;font-size:14px"><button class="kt-btn" id="rk-save" style="padding:7px 12px">저장</button></div>
    <div id="rk-list" style="min-height:120px;max-height:50vh;overflow:auto;text-align:left;font-size:13.5px"><p class="kt-muted" style="text-align:center">불러오는 중…</p></div>
    <button class="kt-btn" id="rk-x" style="width:100%;padding:10px;margin-top:10px">닫기</button>`);
  w.querySelector('#rk-x').onclick=()=>w.remove();
  w.querySelector('#rk-save').onclick=async()=>{const v=w.querySelector('#rk-n').value.replace(/[<>]/g,'').trim().slice(0,12);if(!v)return;P.nick=v;save();toast('이름 저장!');
    const f=await fbInit();if(f&&P.rk.week===weekOf()&&P.rk.w>0){try{await f.db.ref('rank/'+P.rk.week+'/'+f.uid+'/n').set(v);}catch(e){}}w.remove();rankScreen();};
  const box=w.querySelector('#rk-list');
  const f=await fbInit();if(!f){box.innerHTML=`<p class="kt-muted" style="text-align:center">${fbErr||'랭킹을 쓸 수 없어요'}</p>`;return;}
  try{
    const snap=await f.db.ref('rank/'+weekOf()).orderByChild('w').limitToLast(50).once('value');
    const arr=[];snap.forEach(c=>{const v=c.val()||{};arr.push({uid:c.key,n:String(v.n||'?'),s:+v.s||0,w:+v.w||0});});arr.sort((a,b)=>b.w-a.w);
    box.innerHTML=arr.length?arr.map((r,i)=>`<div style="display:flex;gap:8px;padding:7px 8px;margin:3px 0;border-radius:10px;${r.uid===f.uid?'background:rgba(255,176,32,.14);border:1px solid #ffb020':'background:#151922;border:1px solid #262b36'}">
        <b style="width:28px;color:${['#ffd43b','#ced4da','#e8a87c'][i]||'#889'}">${i<3?['🥇','🥈','🥉'][i]:i+1}</b><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.n)}</span><span style="color:#ffcf6a">${r.s}단계</span><span class="kt-muted" style="width:62px;text-align:right">${r.w}웨이브</span></div>`).join('')
      :'<p class="kt-muted" style="text-align:center">아직 이번 주 기록이 없어요 — 🤝 협동 출근으로 첫 기록을!</p>';
  }catch(e){box.innerHTML='<p class="kt-muted" style="text-align:center">랭킹을 불러오지 못했어요</p>';console.warn('[rank]',e);}
}

// ================= 판 끝 =================
const oe=L.onGameEnd;
L.onGameEnd=function(r){
  try{const C=window.KTCoop;if(r&&!r.coopStage&&C&&C.endless&&C.endless())r=Object.assign({},r,{coopStage:C.stage()});}catch(e){}   // 방장 쪽: 협동 단계가 안쪽 감싸기에서야 붙어서 바깥 모듈(상자 등)이 못 보던 문제
  const out=oe.apply(this,[r].concat([].slice.call(arguments,1)));
  try{
    if(r){roll();const notes=[];
      const xp=seasonXp(r),t0=tierOf(P.ss.xp);P.ss.xp+=xp;const t1=tierOf(P.ss.xp);
      notes.push(`🎫 시즌 경험치 +${xp}${t1>t0?` · <b style="color:#ffcf6a">시즌 ${t1}단계!</b>`:''}`);
      if(r.stage==='W'){P.wk.best=Math.max(P.wk.best,r.wave||0);
        if(r.won&&!P.wk.cleared){P.wk.cleared=true;if(BX())BX().give('gold',1,'주간 도전 클리어');if(M())M().add(0,30);notes.push('🗓️ 주간 도전 첫 클리어! 🪙 황금 상자 + 💎 30');}}
      save();
      if(r.coopStage&&r.wave)submitCoop(r.coopStage,r.wave);
      setTimeout(()=>{const sh=document.querySelector('.kt-modal .kt-sheet');if(!sh)return;const d=document.createElement('div');d.style.cssText='margin:8px 0 0;padding:8px 10px;border-radius:12px;border:1px solid #4a3a66;background:#18141f;text-align:left;font-size:12.5px';d.innerHTML=notes.join('<br>');sh.appendChild(d);},650);
    }
  }catch(e){console.error(e);}
  return out;
};

// ================= 로비 버튼 =================
function updBtns(){
  const s=document.getElementById('kt-ss-badge');if(s){const n=readyCount();s.textContent=n?String(n):'';s.style.display=n?'':'none';}
  const wb=document.getElementById('kt-wk-btn');if(wb)wb.innerHTML=`🗓️ 주간 도전${P.wk.cleared&&P.wk.week===weekOf()?' ✅':' <span style="background:#ff4d4d;color:#fff;border-radius:999px;padding:0 6px;font-size:11px;margin-left:3px">NEW</span>'}`;
}
function lobbyBtns(){
  const pb=document.getElementById('lb-passbtn');
  if(pb&&!pb.dataset.v20){pb.dataset.v20='1';
    pb.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();seasonScreen();},true);
    const em=pb.querySelector('em');pb.innerHTML='';if(em)pb.appendChild(em);pb.appendChild(document.createTextNode('시즌 패스'));
    const bd=document.createElement('span');bd.id='kt-ss-badge';bd.style.cssText='position:absolute;top:4px;right:6px;background:#ff4d4d;color:#fff;border-radius:999px;padding:0 6px;font-size:11px;line-height:16px';pb.style.position='relative';pb.appendChild(bd);}
  const bx=document.getElementById('kt-box-btn');
  if(bx&&!document.getElementById('kt-wk-btn')){
    const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;margin:4px 0 2px';bx.parentNode.after(row);
    const mk=(id,html,col,fn)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='kt-btn kt-font';b.innerHTML=html;b.style.cssText=`flex:1;padding:9px;font-size:15px;border-color:${col};color:${col};background:${col}1a`;b.onclick=fn;row.appendChild(b);return b;};
    mk('kt-wk-btn','🗓️ 주간 도전','#74c0fc',weeklyScreen);mk('kt-rk-btn','🏆 협동 랭킹','#ffd43b',rankScreen);
  }
  updBtns();
}
let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;lobbyBtns();});}).observe(document.body,{childList:true});
lobbyBtns();
window.KTWeekly={weekly,startWeekly,weeklyScreen,seasonScreen,rankScreen,claim,claimAll,submitCoop,state:()=>P,tierOf,freeRw,premRw,seasonXp,_fb:fbInit};
})();
