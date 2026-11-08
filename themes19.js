// 칼퇴 디펜스 — 새 테마 v19: 🏫 학교 · 🛍️ 쇼핑몰 · 📢 주말 특근 (4장)
// - 테마 업무 8종 (학교 4 · 쇼핑몰 4, 정예 2) · 테마 보스 3종 (각자 다른 기술 패턴)
// - 4장 "주말 특근" 스테이지 4-1 ~ 4-3 (3-5 클리어하면 열림) · 시범 챕터는 5번으로 밀림
// - 그림: mob/{id}.png · mob/boss_{school|mall|weekend}.png (없으면 이모지 그림)
// 반드시 themes13.js 다음, 게임 스크립트 앞에서 불러옴 (게임이 extendTypes 를 부르기 전에 업무를 추가해야 함)
(function(){
'use strict';
const TH=window.KTThemes,ST=window.KTStages;if(!TH||!ST||TH._v19)return;TH._v19=true;
const FONT='"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
const EMOJI='"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
// 직업 번호: 7 공무원 · 9 기자 · 10 요리사 · 11 택배기사
const NEW={
  school:{name:'방과 후 학교',icon:'🏫',jobs:[7,9],acc:'#94d82d',pal:{bg:'#0f1410',floor:'#1a2219',path:'#3b3a2c',cell:'rgba(25,34,24,0.86)',cellLine:'#3a4a30',label:'#c0eb75'},
          mobs:['homework','chalk','bell'],elite:'pta',boss:{name:'기말고사',icon:'📝',quotes:['시험 범위는 전부','OMR 마킹 5분 전','서술형 10문제','재시험 있습니다'],pattern:'exam'}},
  mall:  {name:'주말 쇼핑몰',icon:'🛍️',jobs:[10,11],acc:'#f783ac',pal:{bg:'#140d12',floor:'#21171e',path:'#3a2a35',cell:'rgba(33,23,30,0.86)',cellLine:'#5a2f48',label:'#fcc2d7'},
          mobs:['cart','coupon','bag'],elite:'vip',boss:{name:'블랙 프라이데이 대혼잡',icon:'🛒',quotes:['선착순 100명!','오픈런 시작','1+1 마지막 수량','계산대 30분 대기'],pattern:'sale'}},
  weekend:{name:'주말 특근 총력전',icon:'📢',jobs:[7,9,10,11],acc:'#ffa94d',pal:{bg:'#120f0c',floor:'#1d1915',path:'#3a3128',cell:'rgba(30,25,21,0.86)',cellLine:'#4f3a26',label:'#ffc078'},
          mobs:['homework','chalk','bell','cart','coupon','bag'],elite:['pta','vip'],boss:{name:'주말 출근 명령',icon:'📢',quotes:['토요일 9시 집합','일요일도 나와요','월요일 보고 전까지','다들 시간 되죠?'],pattern:'weekend'}},
};
const MOBS={
  homework:{th:'school',name:'숙제 더미',icon:'📚',hp:1.5,spd:0.85,size:22,q:['내일까지 제출','A4 10장','검사합니다']},
  chalk:   {th:'school',name:'분필 가루',icon:'🖍️',hp:0.5,spd:1.65,size:19,q:['끼익—','콜록','칠판 지워']},
  bell:    {th:'school',name:'수업 종',icon:'🔔',hp:0.75,spd:1.35,size:20,q:['딩동댕동','쉬는 시간 끝','5교시 시작']},
  pta:     {th:'school',elite:1,face:1,name:'학부모 회장',icon:'👩‍💼',hp:4,spd:0.75,size:28,abil:'shield',desc:'보호막이 있음',q:['선생님 잠깐만요','단톡방에 올릴게요']},
  cart:    {th:'mall',name:'폭주 카트',icon:'🛒',hp:1.4,spd:1.0,size:22,q:['비켜요~','바퀴가 안 멈춰','덜컹덜컹']},
  coupon:  {th:'mall',name:'만료 쿠폰',icon:'🎟️',hp:0.45,spd:1.95,size:19,q:['오늘까지!','중복 할인 안 돼요','적립하실래요?']},
  bag:     {th:'mall',name:'쇼핑백 산',icon:'🛍️',hp:1.2,spd:1.0,size:21,q:['하나만 더','포장해 주세요','영수증 주세요']},
  vip:     {th:'mall',elite:1,face:1,name:'VIP 고객',icon:'💎',hp:3.2,spd:0.85,size:27,abil:'revive',desc:'처리해도 한 번 다시 살아남',q:['점장 불러요','VIP 라운지 어디죠?']},
};
const REVIVE_TXT={vip:'VIP 재방문!'};
for(const k in NEW){NEW[k].id=k;TH.THEMES[k]=NEW[k];}
for(const k in MOBS){MOBS[k].id=k;MOBS[k].tag=NEW[MOBS[k].th].jobs.slice();TH.MOBS[k]=MOBS[k];}

// ---------------- 4장 스테이지 ----------------
const CH=ST.CHAPTERS,STG=ST.STAGES;
const NEW_ST=[
  {id:'4-1',name:'방과 후 특근',waves:30,bossEvery:10,bosses:[0,1,0],bossHp:[20,20,22],hp:2.2,mods:['armor'],mix:{call:0.06},first:{bonus:1600}},
  {id:'4-2',name:'주말 세일',waves:30,bossEvery:10,bosses:[1,0,1],bossHp:[20,20,22],hp:2.6,mods:['rush'],mix:{call:0.12},skills:{0:'meeting'},first:{bonus:1800}},
  {id:'4-3',name:'주말 출근 명령',boss:true,waves:30,bossEvery:10,bosses:[0,2,1],bossHp:[20,22,24],hp:2.7,mods:['clients','limit'],mix:{meeting:0.06,revision:0.06},skills:{0:'meeting',2:'summon'},first:{bonus:2400,stock:60}},
];
const THEME_OF={'4-1':'school','4-2':'mall','4-3':'weekend'};
if(!ST.get('4-1')){
  const ti=CH.findIndex(c=>c.trial),pos=ti>=0?ti:CH.length;          // 시범 챕터 앞에 끼움
  CH.splice(pos,0,{id:pos+1,name:'주말 특근',icon:'📢',color:'#ffa94d',desc:'칼퇴는 했는데… 주말에 학교 행사와 쇼핑몰 세일 지원을 나가게 됐다'});
  CH.forEach((c,i)=>{c.id=i+1;});
  const chId=pos+1;
  const tIdx=STG.findIndex(s=>s.trial),at=tIdx>=0?tIdx:STG.length;
  NEW_ST.forEach(s=>{s.ch=chId;});
  STG.splice(at,0,...NEW_ST);
  STG.forEach((s,i)=>{s.idx=i;if(s.clear==null)s.clear=Math.round((s.first.bonus||0)*0.25);if(s.trial)s.ch=CH.findIndex(c=>c.trial)+1;});
  // 4-1 은 바로 앞 스테이지(시범 아님)를 깨면 열림
  const ou=ST.unlocked;
  ST.unlocked=id=>{const s=ST.get(id);if(s&&s.id==='4-1'){const p=STG.filter(x=>!x.trial&&x.idx<s.idx).pop();return !p||ST.stars(p.id)>0;}return ou(id);};
}
Object.assign(TH.STAGE_THEME,THEME_OF);

// ---------------- 보스 기술 패턴 ----------------
// exam: 쪽지 시험(보호막) + 숙제 호출 · sale: 오픈런 돌진 + 쿠폰 뿌리기 · weekend: 보호막 → 호출 → 순간 이동(조금 앞으로)
const PAT={
  exam:   [{k:'shield',cd:8},{k:'summon',cd:9,mob:'homework',n:2}],
  sale:   [{k:'dash',cd:6},{k:'summon',cd:10,mob:'coupon',n:3}],
  weekend:[{k:'shield',cd:9},{k:'summon',cd:8,mob:['bell','cart'],n:2},{k:'blink',cd:12}],
  weekly: [{k:'shield',cd:10},{k:'summon',cd:9,mob:'urgent',n:3},{k:'dash',cd:7},{k:'blink',cd:14}],   // v20 주간 도전 보스 (테마 상관없이)
};
const TXT={shield:['쪽지 시험!','#74c0fc'],dash:['오픈런!','#ff8787'],summon:['추가 업무!','#ffd43b'],blink:['순간 이동!','#e599f7']};
const TXTW={shield:['결재 보류!','#74c0fc'],dash:['돌진!','#ff8787'],summon:['긴급 업무!','#ffd43b'],blink:['순간 이동!','#e599f7']};
const K=()=>window.KT;
function spawnAt(type,e,hpMul,back){
  const k=K();if(!k||!k.spawnEnemy)return;
  k.spawnEnemy({type,hp:e.maxHp*hpMul});
  const S=k.S,n=S.enemies[S.enemies.length-1];n.s=Math.max(0,e.s-back);const p=k.posAt(n.s);n.x=p[0];n.y=p[1];
}
function bossTick(S,dt){
  const b=S.boss;if(!b||!b.boss||b.hp<=0)return;
  const pn=b.pat19||(b.tb&&NEW[b.tb]?NEW[b.tb].boss.pattern:null),pat=PAT[pn];if(!pat)return;const k=K();
  if(!b.p19){b.p19=pat.map((p,i)=>3+i*2.5);}
  if(b.dash19>0){b.dash19-=dt;if(!(b.stunT>0))b.s+=b.spd*2.4*dt;}
  pat.forEach((p,i)=>{
    b.p19[i]-=dt;if(b.p19[i]>0)return;b.p19[i]=p.cd;
    if(p.k==='shield'){b.sh=Math.max(b.sh||0,b.maxHp*(b.pat19?0.12:b.tb==='weekend'?0.15:0.12));}
    else if(p.k==='dash'){b.dash19=1.1;}
    else if(p.k==='summon'){const room=k?k.CFG.maxEnemies*0.8-S.enemies.length:0;const n=Math.min(p.n,Math.floor(room));if(n<=0)return;
      for(let j=0;j<n;j++){const m=Array.isArray(p.mob)?p.mob[j%p.mob.length]:p.mob;spawnAt(k.ETYPES['th_'+m]?'th_'+m:m,b,0.06,10+j*14);}}
    else if(p.k==='blink'){b.s+=45;if(k){const q=k.posAt(b.s);if(k.burst)k.burst(b.x,b.y,'#e599f7',12);b.x=q[0];b.y=q[1];}}
    const T=(pn==='weekly'?TXTW:TXT)[p.k];if(k&&k.text)k.text(b.x,b.y-b.size-14,T[0],T[1]);
    b.say={txt:T[0],t:1.6};
  });
}
const oTick=TH.tick;
TH.tick=function(S,dt){oTick.call(this,S,dt);try{if(S.boss&&(S.boss.pat19||S.boss.tb&&NEW[S.boss.tb]))bossTick(S,dt);}catch(e){}};
const oDeath=TH.onDeath;
TH.onDeath=function(e){const key=e.type&&e.type.startsWith('th_')?e.type.slice(3):null;
  if(key&&REVIVE_TXT[key]&&e.abil==='revive'&&!e.rev){e.rev=1;e.hp=e.maxHp*0.5;const k=K();if(k){k.text(e.x,e.y-e.size-12,REVIVE_TXT[key],'#fcc2d7');k.burst(e.x,e.y,'#fcc2d7',10);}return true;}
  return oDeath.call(this,e);};
// 보스 설명: 새 테마 보스 기술 표시
const DESC={exam:'8초마다 보호막(쪽지 시험) · 숙제 더미 호출',sale:'6초마다 돌진(오픈런) · 만료 쿠폰 뿌리기',weekend:'보호막 → 업무 호출 → 순간 이동을 번갈아 씀'};
const od=ST.describe;
ST.describe=function(s){const D=od(s),th=NEW[THEME_OF[s.id]];if(!th)return D;
  D.bosses=D.bosses.map(b=>b.theme?Object.assign({},b,{skill:{name:'테마 보스 패턴',desc:DESC[th.boss.pattern]}}):b);return D;};

// ---------------- 배경 소품 ----------------
const W=540,H=680;let layer=null,layerId='';
function along(fn,step){for(let x=70;x<=470;x+=step){fn(x,67,0);fn(x,615,2);}for(let y=90;y<=600;y+=step){fn(67,y,3);fn(473,y,1);}}
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const DECO={
  school(c){
    c.save();c.beginPath();c.rect(12,12,516,656);c.rect(56,56,428,568);c.clip('evenodd');   // 복도: 나무 마루
    for(let y=12;y<668;y+=10)R(c,0,y,W,1,'rgba(0,0,0,0.28)');
    for(let i=0;i<90;i++)R(c,(i*137)%W,12+((i*71)%65)*10,1,10,'rgba(0,0,0,0.25)');c.restore();
    along((x,y,s)=>{if(s===0||s===2){R(c,x-10,y-5,20,10,'#5c4033');R(c,x-9,y-4,18,3,'#8d6e63');}else{R(c,x-4,y-9,8,18,'#3d5a80');R(c,x-3,y-8,6,1,'#98c1d9');R(c,x+1,y-1,1,2,'#e0fbfc');}},58);
    R(c,200,1,140,10,'#1e3a2b');c.strokeStyle='#8d6e63';c.lineWidth=1;c.strokeRect(200,1,140,10);   // 칠판
  },
  mall(c){
    c.save();c.beginPath();c.rect(12,12,516,656);c.rect(56,56,428,568);c.clip('evenodd');   // 복도: 반짝이는 타일
    for(let x=12;x<528;x+=24)for(let y=12;y<668;y+=24)R(c,x,y,23,23,((x+y)/24)%2?'rgba(255,255,255,0.035)':'rgba(0,0,0,0.12)');c.restore();
    const cols=['#f783ac','#74c0fc','#ffd43b','#69db7c'];
    along((x,y,s)=>{const col=cols[((x+y)/10|0)%4];R(c,x-11,y-5,22,10,'#2b2030');R(c,x-11,y-5,22,3,col);R(c,x-8,y,4,4,'#fff3');R(c,x+3,y,4,4,'#fff3');},66);
  },
  weekend(c){DECO.school(c);c.globalAlpha=0.5;along((x,y)=>{R(c,x-6,y-6,12,12,'#ffa94d');R(c,x-4,y-4,8,8,'#2b2015');},132);c.globalAlpha=1;},
};
function deco(id){
  if(layer&&layerId===id)return layer;
  const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;const c=cv.getContext('2d');c.scale(2,2);DECO[id](c);
  layer=cv;layerId=id;return cv;
}
function lights(c,id,t){
  if(id==='mall'||id==='weekend'){const a=(Math.sin(t*3)+1)/2;
    c.fillStyle=`rgba(247,131,172,${0.05*a})`;c.fillRect(0,0,W,H);
    if(id==='mall'){c.font=`bold 9px ${FONT}`;c.textAlign='center';c.textBaseline='middle';
      for(let i=0;i<3;i++){const on=Math.sin(t*5+i*2)>-0.3;if(!on)continue;const x=150+i*120;c.fillStyle='#1a0a12';c.fillRect(x-22,2,44,9);c.fillStyle=['#ff6b9d','#ffd43b','#74c0fc'][i];c.fillText(['SALE','1+1','70%'][i],x,7);}}}
  if(id==='school'||id==='weekend'){const p=(t%30)/30;if(p<0.04){c.fillStyle=`rgba(255,244,200,${0.08*(1-p/0.04)})`;c.fillRect(0,0,W,H);}}   // 수업 종 울릴 때 번쩍
}
const coopMap=()=>{const C=window.KTCoop;if(!C||!C.mapOn)return false;return typeof C.mapOn==='function'?!!C.mapOn():!!C.mapOn;};
const oBg=TH.bg;
TH.bg=function(c,G){
  const r=oBg.call(this,c,G);const cur=TH.cur;
  if(r&&cur&&NEW[cur.id]){try{c.drawImage(deco(cur.id),0,0,W,H);lights(c,cur.id,performance.now()/1000);
    c.fillStyle=cur.pal.label;c.font=`bold 11px ${FONT}`;c.textAlign='left';c.textBaseline='middle';
    if(!coopMap()){c.fillText('입구 ▶',G.P.l+16,G.P.t);c.globalAlpha=0.55;c.textAlign='right';c.fillText(`${cur.icon} ${cur.name}`,G.P.r-10,G.P.b);c.globalAlpha=1;}}catch(e){}}
  return r;
};
// 학교: 분필 가루 날림 · 쇼핑몰: 반짝이
const oOv=TH.overlay;
TH.overlay=function(c){oOv.call(this,c);const cur=TH.cur;if(!cur||!NEW[cur.id])return;const t=performance.now()/1000;
  if(cur.id==='school'){for(let i=0;i<16;i++){const x=((t*(10+i%4*5)+i*83)%(W+20))-10,y=(i*47+Math.sin(t+i)*8)%H;c.fillStyle='rgba(255,255,255,0.10)';c.fillRect(x,y,2,2);}}
  else if(cur.id==='mall'){for(let i=0;i<12;i++){const a=Math.max(0,Math.sin(t*2.2+i*1.9));if(a<0.6)continue;c.fillStyle=`rgba(255,255,255,${(a-0.6)*1.2})`;const x=(i*131)%W,y=(i*197)%H;c.fillRect(x-1,y-3,2,6);c.fillRect(x-3,y-1,6,2);}}};

window.KTThemes19={NEW,MOBS,NEW_ST,PAT,THEME_OF,bossTick};
})();
