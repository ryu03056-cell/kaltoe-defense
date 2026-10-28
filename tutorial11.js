// 칼퇴 디펜스 — 첫 출근 튜토리얼 v11
// 1-1을 처음 시작할 때 게임을 멈추고 단계별로 안내 (채용 → 사거리 → 3명 모으기 → 합성 → 배치 → 인맥 찬스 → 보스)
// 저장: localStorage 'kt_tut_v1' · 설정 화면에 "튜토리얼 다시 보기" 추가 · KTTutorial.start() 로 직접 실행 가능
(function(){
'use strict';
const KEY='kt_tut_v1';
const done=()=>{try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}};
const setDone=v=>{try{if(v)localStorage.setItem(KEY,'1');else localStorage.removeItem(KEY);}catch(e){}};
// ---------- 스타일 ----------
const css=`
.tt-spot{position:fixed;z-index:210;border-radius:12px;box-shadow:0 0 0 9999px rgba(5,6,10,.62);pointer-events:none;transition:all .25s ease;outline:2px solid #ffb020;outline-offset:2px;animation:ttpulse 1.4s ease-in-out infinite}
.tt-spot.none{outline:none;animation:none;width:0!important;height:0!important;left:50%!important;top:40%!important}
@keyframes ttpulse{50%{outline-color:rgba(255,176,32,.35)}}
.tt-card{position:fixed;z-index:211;left:50%;transform:translateX(-50%);width:min(92vw,400px);background:#1a1d24;border:1px solid #5a4410;border-radius:16px;padding:14px 16px;color:#eef1f6;box-shadow:0 10px 30px rgba(0,0,0,.5);font-family:"Jua","Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif;animation:ktpop .18s ease-out}
.tt-card .tt-step{font-size:12px;color:#ffb020;margin-bottom:4px}
.tt-card b{display:block;font-size:17px;margin-bottom:6px}
.tt-card p{font-size:14px;line-height:1.55;color:#cfd4de;margin:0}
.tt-card .tt-row{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;align-items:center}
.tt-card .tt-skip{margin-right:auto;background:none;border:none;color:#8b93a5;font:inherit;font-size:12px;cursor:pointer;text-decoration:underline}
.tt-card .tt-next{font:inherit;font-weight:800;color:#2a1600;background:linear-gradient(180deg,#ffc23d,#ff9a1a);border:1px solid #b86a00;border-bottom-width:4px;border-radius:12px;padding:8px 16px;cursor:pointer}
.tt-card .tt-wait{font-size:12px;color:#ffd27a}
.tt-hand{position:fixed;z-index:212;font-size:30px;pointer-events:none;animation:tthand 1s ease-in-out infinite}
@keyframes tthand{50%{transform:translate(6px,8px)}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
// ---------- 화면 좌표 ----------
const W=540,H=680,GX=78,GY=78,CW=124,CH=83,GAP=6,COLS=3;
function cvRect(){const c=document.getElementById('cv');return c?c.getBoundingClientRect():null;}
function toScreen(x,y,w,h){const r=cvRect();if(!r)return null;const s=r.width/W;return {left:r.left+x*s,top:r.top+y*s,width:w*s,height:h*s};}
function cellBox(i){const c=i%COLS,r=(i/COLS)|0;return toScreen(GX+c*(CW+GAP),GY+r*(CH+GAP),CW,CH);}
function elBox(sel){const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};}
// ---------- 단계 ----------
const K=()=>window.KT,S=()=>window.KT&&KT.S;
const STEPS=[
  {t:'칼퇴 디펜스에 오신 걸 환영해요!',d:'업무가 복도를 따라 몰려와요. 처리하지 못한 업무가 100건 쌓이면 야근 확정입니다.',box:()=>elBox('#hud .st:nth-child(3)'),next:true},
  {t:'직원을 채용하세요',d:'아래 [채용] 버튼을 눌러 보세요. 골드를 내고 직원 1명이 입사합니다.',box:()=>elBox('#bSummon'),hand:true,
   enter(){S().force=[[0,0],[0,0],[0,0]];},until:()=>S().summons>=1},
  {t:'직원은 알아서 일해요',d:'직원은 사거리 안에 들어온 업무를 자동으로 처리합니다. 직원이 있는 칸을 눌러 사거리를 확인해 보세요.',box:()=>cellBox(0),hand:true,until:()=>S().sel===0,next:true},
  {t:'같은 직원 3명을 모으세요',d:'[채용]을 2번 더 눌러 같은 직원을 모아 보세요. 같은 칸에 3명까지 들어갑니다.',box:()=>elBox('#bSummon'),hand:true,until:()=>{const c=S().cells[0];return c&&c.count>=3;}},
  {t:'합성하면 승진!',d:'같은 직원 3명이 모이면 [합성]으로 한 단계 위 직급 1명이 됩니다. 칸을 고른 뒤 [합성]을 누르세요.',box:()=>elBox('#bMerge'),hand:true,
   enter(){S().sel=0;},tick(){const s=S();if(s.sel<0){const i=s.cells.findIndex(c=>c&&c.count>=3);if(i>=0)s.sel=i;}},until:()=>S().cells.some(c=>c&&c.grade>=1)},
  {t:'이직과 승진',d:'인턴·대리끼리 합성하면 직업이 바뀌는 "이직", 과장부터는 직업이 그대로인 "승진"이에요. 같은 직업 부장 3명이면 최고 직급 "대표"가 취임합니다!',box:()=>{const s=S();const i=s.cells.findIndex(c=>c&&c.grade>=1);return i>=0?cellBox(i):null;},next:true},
  {t:'자리 배치가 중요해요',d:'직원을 끌어서 다른 칸으로 옮길 수 있어요. 가운데 칸은 복도에 안 닿을 수 있으니, 사거리가 짧은 직원은 가장자리에 두세요.',box:()=>toScreen(GX,GY,COLS*CW+2*GAP,6*CH+5*GAP),next:true},
  {t:'인맥 찬스 ☕',d:'커피를 쓰면 대리·과장·부장을 확률로 영입할 수 있어요. 커피는 5웨이브마다, 그리고 상사를 퇴근시키면 받아요.',box:()=>elBox('#bLuck'),next:true},
  {t:'상사가 나타나면 시간 싸움!',d:'5웨이브마다 상사 보스가 등장해요. 제한 시간 안에 퇴근시키지 못하면 야근입니다. 이제 출근해 볼까요?',box:()=>null,next:'출근 시작!'},
];
let idx=-1,spot,card,hand,timer=0,running=false;
function ensure(){
  if(!spot){spot=document.createElement('div');spot.className='tt-spot';document.body.appendChild(spot);}
  if(!card){card=document.createElement('div');card.className='tt-card';document.body.appendChild(card);}
  if(!hand){hand=document.createElement('div');hand.className='tt-hand';hand.textContent='👆';document.body.appendChild(hand);}
}
function place(){
  const s=STEPS[idx];if(!s)return;const b=s.box&&s.box();
  if(b){spot.classList.remove('none');Object.assign(spot.style,{left:(b.left-4)+'px',top:(b.top-4)+'px',width:(b.width+8)+'px',height:(b.height+8)+'px'});}
  else spot.classList.add('none');
  const vh=window.innerHeight,ch=card.offsetHeight||150;
  let top;if(!b)top=vh*0.3;else if(b.top+b.height+ch+24<vh)top=b.top+b.height+14;else top=Math.max(10,b.top-ch-14);
  card.style.top=top+'px';
  hand.style.display=b&&s.hand?'block':'none';
  if(b&&s.hand){hand.style.left=(b.left+b.width*0.6)+'px';hand.style.top=(b.top+b.height*0.45)+'px';}
}
function render(){
  const s=STEPS[idx];
  const btn=s.next?`<button class="tt-next">${typeof s.next==='string'?s.next:'다음'}</button>`:`<span class="tt-wait">해 보세요 ↑</span>`;
  card.innerHTML=`<div class="tt-step">튜토리얼 ${idx+1} / ${STEPS.length}</div><b>${s.t}</b><p>${s.d}</p><div class="tt-row"><button class="tt-skip">건너뛰기</button>${btn}</div>`;
  card.querySelector('.tt-skip').onclick=()=>finish(true);
  const nb=card.querySelector('.tt-next');if(nb)nb.onclick=()=>go(idx+1);
  place();
}
function go(i){
  if(!running)return;
  if(i>=STEPS.length){finish(false);return;}
  idx=i;const s=STEPS[idx];if(s.enter)try{s.enter();}catch(e){}
  try{window.KTSound&&KTSound.play('select');}catch(e){}
  render();
}
function loop(){
  if(!running)return;
  const k=K(),s=STEPS[idx];
  if(!k||!k.S||k.S.state!=='play'){finish(false,true);return;}
  if(!k.S.paused)k.setPaused(true);
  if(s){if(s.tick)try{s.tick();}catch(e){}
    if(s.until&&!s.next){let ok=false;try{ok=s.until();}catch(e){}if(ok){go(idx+1);return;}}
    if(s.until&&s.next){let ok=false;try{ok=s.until();}catch(e){}if(ok&&!s._auto){s._auto=1;setTimeout(()=>{if(STEPS[idx]===s)go(idx+1);},350);}}}
  place();
}
function finish(skipped,silent){
  running=false;clearInterval(timer);timer=0;setDone(true);
  [spot,card,hand].forEach(e=>e&&e.remove());spot=card=hand=null;STEPS.forEach(s=>delete s._auto);
  const s=S();if(s){s.force=null;if(!silent&&s.state==='play')K().setPaused(false);}
  if(!silent&&!skipped){try{window.KTSound&&KTSound.play('wave');}catch(e){}}
}
function start(){
  if(running||!K())return;running=true;ensure();K().setPaused(true);if(S())S().banner=null;go(0);timer=setInterval(loop,150);
  window.addEventListener('resize',place);
}
// 1-1을 처음 시작할 때 자동 실행
function hook(){
  const k=K();if(!k||k._tut)return;k._tut=true;const orig=k.start;
  k.start=function(o){const r=orig.apply(this,arguments);if(o&&o.stage&&o.stage.id==='1-1'&&!done())setTimeout(start,250);return r;};
}
hook();
// 설정 화면에 "튜토리얼 다시 보기"
new MutationObserver(()=>{
  const rs=document.getElementById('st-reset');if(!rs||document.getElementById('st-tut'))return;
  const row=document.createElement('div');row.className='kt-toggle';
  row.innerHTML=`<span>튜토리얼</span><button class="kt-btn" id="st-tut">${done()?'다시 보기':'켜짐'}</button>`;
  rs.closest('.kt-toggle').before(row);
  row.querySelector('#st-tut').onclick=e=>{setDone(false);e.target.textContent='다음 1-1에서 나와요';};
}).observe(document.body,{childList:true,subtree:true});
window.KTTutorial={start,reset:()=>setDone(false),done};
})();
