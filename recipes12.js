// 칼퇴 디펜스 — 히든 조합 v12
// 서로 다른 직업의 과장 2명을 정해진 조합으로 모으면 채용으로는 안 나오는 "히든 직업"(부장급)이 탄생
// 히든 직업 3명을 합성하면 히든 대표급(최고 단계). 채용·발령에는 나오지 않음.
// 게임 JOBS 9번부터 추가 · 발견 기록 localStorage 'kt_recipe_v1' · 도감 버튼에 "히든 조합" 화면 연결
(function(){
'use strict';
const KEY='kt_recipe_v1';
const FIRST=9; // JOBS 인덱스 시작 (0~4 사무직, 5~8 계급 직업)
// a, b = 재료 직업(과장), base = 그림·투사체·필살기를 빌려올 직업, mark = 함께 표시할 재료 아이콘
const HIDDEN=[
  {key:'medlaw', name:'의료소송 변호사',icon:'⚕️',a:0,b:1,base:1,mark:'🩺',dmg:7, cd:0.6,range:195,col:'#ffd8a8',multi:2,stun:{p:0.2,t:0.8},
   desc:'한 번에 2명 공격 · 20% 기절',ranks:['','','','의료소송 전문 변호사','의료소송 로펌 대표'],
   myth:{multi:4,stun:{p:0.35,t:1.1},shout:'의료 과실 인정!',desc:'한 번에 4명 공격 · 35% 기절'},
   pf:{name:'이소송 × 나진료',quotes:[['진료 기록 다 봤습니다','과실 입증 완료'],['합의는 없습니다','증거는 차트에 있어요']]}},
  {key:'planner',name:'도시계획가',icon:'🏙️',a:2,b:7,base:2,mark:'🏛️',dmg:12,cd:1.2,range:205,col:'#ffc078',splash:80,buff:0.15,
   desc:'초대형 범위 공격 · 옆 칸 공격 속도 +15%',ranks:['','','','도시계획가','도시계획 위원장'],
   myth:{splash:120,buff:0.25,shout:'신도시 개발!',desc:'초거대 범위 공격 · 옆 칸 공격 속도 +25%'},
   pf:{name:'도면석 × 정규정',quotes:[['용도 변경 승인!','도로부터 깝시다'],['신도시 착공합니다','그린벨트 해제!']]}},
  {key:'fintech',name:'핀테크 CTO',icon:'💳',a:4,b:3,base:4,mark:'🧮',dmg:9, cd:0.7,range:260,col:'#d0bfff',slow:{v:0.4,t:1.5},gold:{p:0.25,v:2},
   desc:'원거리 둔화 · 25% 확률 골드',ranks:['','','','핀테크 CTO','핀테크 창업주'],
   myth:{splash:70,slow:{v:0.55,t:2},gold:{p:0.35,v:3},shout:'상장 대박!',desc:'범위 둔화 · 35% 확률 골드 대량'},
   pf:{name:'배포중 × 정산미',quotes:[['결제 모듈 배포 완료','수수료 0원!'],['상장 첫날 상한가','투자 유치 완료']]}},
  {key:'swat',   name:'특공대',icon:'🎯',a:5,b:8,base:8,mark:'👮',dmg:20,cd:1.2,range:225,col:'#74c0fc',mark2:true,markEff:{p:0.35,v:0.25,t:3},arty:{every:3,r:70,m:1.6},
   desc:'35% 수갑 · 3발마다 포격',ranks:['','','','특공대장','특수작전 사령관'],
   myth:{markEff:{p:1,v:0.4,t:4},splash:70,arty:{every:2,r:90,m:2},shout:'작전 개시!',desc:'모든 공격 수갑 · 2발마다 대형 포격'},
   pf:{name:'최검거 × 강충성',quotes:[['진입 준비 완료','타깃 확보!'],['작전 개시!','전원 제압']]}},
  {key:'emt',    name:'응급구조사',icon:'🚑',a:6,b:0,base:6,mark:'🩺',dmg:11,cd:0.8,range:185,col:'#ffa8a8',splash:55,knock:20,
   desc:'빠른 범위 공격 · 뒤로 밀어냄',ranks:['','','','응급구조사','응급의료센터장'],
   myth:{splash:90,knock:38,shout:'골든타임 사수!',desc:'초대형 범위 공격 · 강하게 밀어냄'},
   pf:{name:'한진화 × 나진료',quotes:[['골든타임 4분!','들것 준비!'],['헬기 출동!','전원 살린다']]}},
];
const NAMES=()=>window.KTJobs?KTJobs.ALL_NAMES:['의사','변호사','건축가','회계사','개발자','경찰','소방관','공무원','군인'];
const ICONS=()=>window.KTJobs?KTJobs.ALL_ICONS:['🩺','⚖️','📐','🧮','💻','👮','🧑‍🚒','🏛️','🪖'];
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{found:{}};}catch(e){return {found:{}};}};
let R=load();R.found=R.found||{};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(R));}catch(e){}};
const idxOf=key=>FIRST+HIDDEN.findIndex(h=>h.key===key);
// ---------------- 게임 데이터 확장 ----------------
function extendJobs(JOBS,MYTH){
  if(JOBS.length>FIRST)return;
  while(JOBS.length<FIRST)JOBS.push(JOBS[JOBS.length-1]); // 안전장치 (신규 직업이 없을 때)
  HIDDEN.forEach(h=>{
    const j={name:h.name,icon:h.icon,dmg:h.dmg,cd:h.cd,range:h.range,col:h.col,desc:h.desc,ranks:h.ranks,hidden:true,projAs:h.base,ultAs:h.base};
    ['multi','stun','splash','buff','slow','gold','knock','arty'].forEach(k=>{if(h[k]!=null)j[k]=h[k];});
    if(h.markEff)j.mark=h.markEff;
    JOBS.push(j);
    const m=Object.assign({},h.myth);if(m.markEff){m.mark=m.markEff;delete m.markEff;}MYTH.push(m);
  });
  const PF=window.KTProfiles;
  if(PF&&PF.length<=FIRST){while(PF.length<FIRST)PF.push(null);HIDDEN.forEach(h=>PF.push({name:h.pf.name,titles:h.ranks,quotes:[[],[],[],h.pf.quotes[0],h.pf.quotes[1]],skill:h.desc}));}
}
// 히든 직업 공격력 강화 = 두 재료 직업 연봉 레벨의 평균
function extendMul(S){
  if(!S||!S.dmgMul)return;
  HIDDEN.forEach((h,i)=>{const j=FIRST+i;S.dmgMul[j]=((S.dmgMul[h.a]||1)+(S.dmgMul[h.b]||1))/2;if(S.ulv)S.ulv[j]=Math.round(((S.ulv[h.a]||0)+(S.ulv[h.b]||0))/2);});
}
const baseOf=j=>j>=FIRST&&HIDDEN[j-FIRST]?HIDDEN[j-FIRST].base:null;
// ---------------- 그림 (재료 직업 그림 + 무지개 오라 + 재료 아이콘) ----------------
function hookChars(){
  const P=window.KTChars;if(!P||P._v12)return;
  const deco=(c,h,t,s,big)=>{
    c.save();c.globalCompositeOperation='lighter';
    for(let k=0;k<3;k++){const hue=(t*90+k*120)%360;c.strokeStyle=`hsla(${hue},90%,65%,0.55)`;c.lineWidth=1.6;c.beginPath();c.ellipse(0,23,14+k*1.5+Math.sin(t*3+k)*1.2,4+k*0.6,0,0,Math.PI*2);c.stroke();}
    c.restore();
    c.font=`${big?13:11}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';
    c.fillText(h.mark,15,-20+Math.sin(t*2.5)*1.5);
    c.fillStyle='#ff4dff';c.beginPath();c.moveTo(-15,-22);c.lineTo(-11,-26);c.lineTo(-7,-22);c.lineTo(-11,-16);c.closePath();c.fill();
    c.fillStyle='#fff';c.font='bold 6px sans-serif';c.fillText('H',-11,-21.5);
  };
  window.KTChars=Object.assign({},P,{_v12:true,
    draw(c,j,g,x,y,s,t,col){
      const h=j>=FIRST?HIDDEN[j-FIRST]:null;if(!h)return P.draw(c,j,g,x,y,s,t,col);
      P.draw(c,h.base,g,x,y,s,t,h.col);c.save();c.translate(x,y);const k=s*(1+g*0.035);c.scale(k,k);deco(c,h,t,s,false);c.restore();
    },
    portrait(c,j,g,cx,cy,hh,t){
      const h=j>=FIRST?HIDDEN[j-FIRST]:null;if(!h)return P.portrait(c,j,g,cx,cy,hh,t);
      P.portrait(c,h.base,g,cx,cy,hh,t);c.save();c.translate(cx,cy);const s=hh/62;c.scale(s,s);deco(c,h,t||0,s,true);c.restore();
    },
  });
}
// ---------------- 게임 중 조합 ----------------
const GX=78,GY=78,CW=124,CH=83,GAP=6,COLS=3,NC=18;
const center=i=>{const c=i%COLS,r=(i/COLS)|0;return [GX+c*(CW+GAP)+CW/2,GY+r*(CH+GAP)+CH/2];};
function available(){
  const K=window.KT;if(!K||!K.S||K.S.state!=='play')return [];
  const S=K.S,out=[];
  for(const h of HIDDEN){
    const ia=S.cells.findIndex(c=>c&&c.job===h.a&&c.grade===2),ib=S.cells.findIndex(c=>c&&c.job===h.b&&c.grade===2);
    if(ia>=0&&ib>=0)out.push({h,ia,ib});
  }
  return out;
}
function take(S,i){const c=S.cells[i];c.count--;c.cd.pop();if(c.at)c.at=null;if(c.count<=0)S.cells[i]=null;}
function combine(opt){
  const K=window.KT,S=K.S,h=opt.h,j=idxOf(h.key),first=!R.found[h.key];
  take(S,opt.ia);take(S,opt.ib);
  let i=K.findSlot(j,3);if(i<0)return false;
  const c=S.cells[i];if(c){c.count++;c.cd.push(0);}else S.cells[i]={job:j,grade:3,count:1,cd:[0]};
  const push=o=>{o.max=o.life;S.fx.push(o);};
  const [x,y]=center(i);if(window.KTFX)KTFX.pillar(push,x,y,'#ff4dff',true);
  S.banner={txt:first?'🔮 히든 직업 발견!':`🔮 ${h.ranks[3]} 합류!`,sub:`${h.ranks[3]} — ${h.desc}`,t:3,p:{j,g:3}};
  S.sel=i;R.found[h.key]=(R.found[h.key]||0)+1;save();
  try{KTSound.play('myth');}catch(e){}
  try{if(navigator.vibrate&&localStorage.getItem('kt_vib')!=='0')navigator.vibrate([40,40,80]);}catch(e){}
  return true;
}
// 표시: 재료 칸 위에 🔮 배지 + 재료 칸을 고르면 [🔮 조합] 버튼
let badges=[],cbtn=null,announced='';
function ensureUI(){
  if(cbtn)return true;const sb=document.getElementById('selBtns');if(!sb)return false;
  const st=document.createElement('style');st.textContent=`
.rc-badge{position:fixed;z-index:15;pointer-events:none;font-family:"Jua","Malgun Gothic",sans-serif;font-size:9.5px;font-weight:800;color:#fff;border-radius:999px;padding:1px 6px;
  background:linear-gradient(90deg,#ff4dff,#7950f2);box-shadow:0 0 10px rgba(255,77,255,.7);animation:rcpulse 1s ease-in-out infinite;white-space:nowrap}
#bCombo{background:linear-gradient(90deg,#ff4dff,#7950f2)!important;color:#fff!important;border-color:#5f3dc4!important;font-weight:800}
#bCombo[hidden]{display:none}
@keyframes rcpulse{50%{transform:scale(1.1)}}
.rc-book .rc-item{display:flex;gap:10px;align-items:center;background:var(--k-panel2,#232833);border:1px solid var(--k-line,#2f3542);border-radius:12px;padding:8px 10px;margin-bottom:8px}
.rc-book .rc-item.lock{opacity:.6}
.rc-book canvas{width:56px;height:56px;border-radius:10px;background:#11141a;image-rendering:pixelated;flex:0 0 auto}
.rc-book .rc-t{flex:1;min-width:0}.rc-book .rc-t b{display:block;font-size:14px}.rc-book .rc-t span{font-size:12px;color:var(--k-muted,#8b93a5);display:block;line-height:1.45}
.rc-book .rc-f{font-size:13px;color:#e5dbff;margin-top:2px}`;
  document.head.appendChild(st);
  cbtn=document.createElement('button');cbtn.id='bCombo';cbtn.hidden=true;cbtn.textContent='🔮 조합';sb.prepend(cbtn);
  cbtn.onclick=()=>{const o=forSel();if(o){combine(o);refresh();}};
  return true;
}
function forSel(){const S=window.KT&&KT.S;if(!S)return null;return available().find(o=>o.ia===S.sel||o.ib===S.sel)||null;}
function badge(i,txt,n){
  let b=badges[n];if(!b){b=document.createElement('div');b.className='rc-badge';document.body.appendChild(b);badges[n]=b;}
  const cv=document.getElementById('cv'),r=cv.getBoundingClientRect(),s=r.width/540,c=i%COLS,row=(i/COLS)|0;
  b.style.left=(r.left+(GX+c*(CW+GAP)+4)*s)+'px';b.style.top=(r.top+(GY+row*(CH+GAP)+4)*s)+'px';if(b.textContent!==txt)b.textContent=txt;b.style.display='block';
}
function refresh(){
  if(!ensureUI())return;
  const av=available(),app=document.getElementById('app'),vis=app&&app.style.visibility!=='hidden';
  let n=0;
  if(vis){const seen=new Set();for(const o of av){for(const i of [o.ia,o.ib]){if(seen.has(i))continue;seen.add(i);badge(i,'🔮 조합',n++);}}}
  for(let k=n;k<badges.length;k++)if(badges[k])badges[k].style.display='none';
  const o=vis?forSel():null;
  if(o){const known=R.found[o.h.key];cbtn.hidden=false;cbtn.textContent=known?`🔮 ${o.h.name}`:'🔮 히든 조합';}else cbtn.hidden=true;
  const key=av.map(o=>o.h.key).join(',');
  if(vis&&key&&key!==announced){const fresh=av.find(o=>!announced.split(',').includes(o.h.key));announced=key;
    if(fresh&&window.KT&&KT.S){KT.S.usay=null;const t=document.getElementById('toast');if(t){t.textContent='🔮 히든 조합 가능! 🔮 표시된 칸을 눌러 보세요';t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200);}}}
  if(!key)announced='';
}
setInterval(refresh,200);
// ---------------- 조합 도감 ----------------
function book(){
  ensureUI();
  const N=NAMES(),I=ICONS(),cnt=HIDDEN.filter(h=>R.found[h.key]).length;
  const rows=HIDDEN.map((h,i)=>{const k=!!R.found[h.key],j=FIRST+i;
    return `<div class="rc-item ${k?'':'lock'}"><canvas width="112" height="112" data-j="${j}" data-k="${k?1:0}"></canvas><div class="rc-t">
      <b>${k?`${h.icon} ${h.ranks[3]}`:'❓ ???'}</b>
      <div class="rc-f">과장 ${I[h.a]} ${N[h.a]} + 과장 ${k?`${I[h.b]} ${N[h.b]}`:'❓'}</div>
      <span>${k?`${h.desc}<br>최고 단계: ${h.ranks[4]} — ${h.myth.desc}`:'아직 발견하지 못했어요. 과장끼리 모아 보세요!'}</span></div></div>`;}).join('');
  const w=document.createElement('div');w.className='kt-modal kt-font';
  w.innerHTML=`<div class="kt-sheet rc-book"><h2>🔮 히든 조합 도감</h2><p class="kt-muted">서로 다른 직업의 <b>과장 2명</b>이 같이 있으면 조합 버튼이 떠요. 히든 직업은 채용으로는 나오지 않습니다. · 발견 <b style="color:#e5dbff">${cnt} / ${HIDDEN.length}</b></p>
    ${rows}<div class="kt-row"><button class="kt-btn" id="rc-jobs">📖 직업 정보</button><button class="kt-btn" id="rc-x">닫기</button></div></div>`;
  w.addEventListener('click',e=>{if(e.target===w)w.remove();});
  document.body.appendChild(w);
  w.querySelectorAll('canvas[data-j]').forEach(cv=>{const c=cv.getContext('2d'),j=+cv.dataset.j;if(cv.dataset.k==='1'&&window.KTChars)KTChars.portrait(c,j,3,56,102,120,1);else{c.fillStyle='#2b3040';c.font='bold 54px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('?',56,58);}});
  w.querySelector('#rc-x').onclick=()=>w.remove();
  w.querySelector('#rc-jobs').onclick=()=>{w.remove();if(window.KTLobby&&KTLobby.jobInfo)KTLobby.jobInfo();};
}
// 로비 도감 버튼 → 히든 조합 도감
function hookLobby(){
  const L=window.KTLobby;if(!L||L._v12)return;L._v12=true;
  const os=L.show;L.show=function(){const r=os.apply(this,arguments);const b=document.getElementById('lb-dex');if(b&&!b.dataset.v12){b.dataset.v12=1;b.onclick=book;b.innerHTML='<em>🔮</em>조합 도감';}const ft=document.getElementById('lb-foot');if(ft&&ft.innerHTML.indexOf('v10 ·')===0)ft.innerHTML=ft.innerHTML.replace('v10 ·','v12 ·');return r;};
}
hookChars();hookLobby();
window.KTRecipes={HIDDEN,FIRST,extendJobs,extendMul,baseOf,available,combine,book,found:()=>R.found,reset(){R={found:{}};save();}};
})();
