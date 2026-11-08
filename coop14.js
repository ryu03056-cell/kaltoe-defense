// 칼퇴 디펜스 — 2인 협동 (한 판을 둘이 같이) v14.7
// 방식: 방장 폰에서만 게임이 돌아가고, 동료 폰은 방장 화면을 받아서 그리기만 함
//   · 방장 → 동료 : 6~10번/초 화면 상태(업무 위치·체력, 직원 칸, 골드, 웨이브, 배너) + 그 사이에 생긴 효과·소리
//   · 동료 → 방장 : 조작(채용·합성·퇴사·발령·인맥·자리 이동·히든 조합)만 보냄 → 방장 폰이 대신 실행
//   · 골드·채용 횟수·커피는 각자 (v14.10~11) — 방장 S.gold/S.summons/S.coffee, 동료 S.gold2/S.summons2/S.coffee2
//     커피: 5웨이브마다·보스 처치 커피는 둘 다 받음
//     처치·회계사 골드는 그 직원 주인에게, 웨이브 보너스는 둘 다 받음
//   · 방장이 나가면 판이 끝나고, 동료가 나가면 방장은 혼자 계속
// 통신
//   · Firebase 설정(coopcfg.js 의 window.KT_FIREBASE)이 있으면 Firebase 실시간 DB로 (폰끼리)
//   · 없으면 같은 브라우저의 탭끼리(BroadcastChannel) — PC에서 탭 두 개로 시험할 때
// 협동 맵(v14.8): 직원 칸 3×3 두 덩어리(위=방장 · 아래=동료) + 가운데 복도가 있는 8자 길
//   길: 위 → 오른쪽 위 → 가운데(←) → 왼쪽 아래 → 아래 → 오른쪽 아래 → 가운데(←) → 왼쪽 위 (가운데 복도를 두 번 지남)
//   내가 채용·합성·인맥으로 뽑은 직원은 내 덩어리에 들어가고, 내 칸 직원만 합성·퇴사·발령·이동 가능 (골드·커피는 같이 씀)
// 협동 연속 출근(v14.12): 협동 판은 스테이지 하나로 끝나지 않고 끝없이 이어짐
//   10웨이브 = 1단계 (10·20·30…웨이브마다 그 테마의 보스) · 단계를 깨면 테마가 바뀌고 각자 💰+50
//   지면 "몇 단계까지 버텼는지"로 보상 (meta.js reward: 단계마다 +150) · 최고 기록은 localStorage 'kt_coop_best'
// 연결: 로비에 "🤝 협동 출근" 버튼. 주소에 ?room=1234 가 있으면 참가 창이 바로 열림
// index.html 수정: 조작 함수 6곳 첫 줄에 KTCoop.guestAct(…) 확인 1줄씩, fx() 에 KTCoop.onFx 1줄 (나머지는 이 파일)
(function(){
'use strict';
const KT=window.KT;if(!KT)return;
// ---------------- 협동 맵 ----------------
const ML=34,MT=34,MR=506,MB=646,MM=340;
const SEG=[[ML,MT,MR,MT],[MR,MT,MR,MM],[MR,MM,ML,MM],[ML,MM,ML,MB],[ML,MB,MR,MB],[MR,MB,MR,MM],[MR,MM,ML,MM],[ML,MM,ML,MT]].map(([x1,y1,x2,y2])=>({x1,y1,x2,y2,len:Math.hypot(x2-x1,y2-y1),dir:Math.atan2(y2-y1,x2-x1)}));
const MPER=SEG.reduce((a,g)=>a+g.len,0);
function segAt(s){s=((s%MPER)+MPER)%MPER;for(const g of SEG){if(s<=g.len)return [g,s];s-=g.len;}return [SEG[0],0];}
const CCW=124,CGAP=6,CGX=78,CCH=76,CY0=[67,373];
const START=SEG[0].len+SEG[1].len;   // v14.13 업무는 가운데 복도 오른쪽 끝에서 나옴
const MAP={id:'coop',perim:MPER,
  posAt(s){s+=START;const [g,d]=segAt(s),k=g.len?d/g.len:0;return [g.x1+(g.x2-g.x1)*k,g.y1+(g.y2-g.y1)*k];},
  dirAt(s){return segAt(s+START)[0].dir;},
  cellRect(i){const c=i%3,r=(i/3)|0,top=r<3;return {x:CGX+c*(CCW+CGAP),y:CY0[top?0:1]+(top?r:r-3)*(CCH+CGAP),w:CCW,h:CCH};}};
let mapOn=false,actor='host',testMap=false;
// v20.4: 협동 맵의 보스는 가운데 복도만 왕복 — 8자 길을 그대로 돌면 위 고리(방장 쪽)·아래 고리(동료 쪽)를 번갈아 지나가서
//        한 번에 한 사람 직원만 때릴 수 있었음. 가운데 복도는 두 덩어리 모두 닿는 유일한 곳
const MID=MR-ML;
function bossPos(s){const u=((s%(2*MID))+2*MID)%(2*MID);return [u<MID?MR-u:ML+(u-MID),MM];}
function epos(e){return mapOn&&e.boss?bossPos(e.s):KT.posAt(e.s);}
function useMap(on){mapOn=!!on;if(KT.setMap)KT.setMap(on?MAP:null);}
const owns=(who,i)=>who==='guest'?i>=9:i<9;
// 내 칸 덩어리 (index.html findSlot 이 물어봄): 방장 0~8 · 동료 9~17
function slotRange(){if(!mapOn)return null;if(testMap&&!role)return null;return actor==='guest'?[9,18]:[0,9];}
// 지금 이 화면 주인의 칸 (rules14 가 씀): 동료 폰이면 아래, 방장이 동료 조작을 실행 중이면 아래, 아니면 위
function myRange(){if(!mapOn||(testMap&&!role))return null;return (role==='guest'||actor==='guest')?[9,18]:[0,9];}
const $=s=>document.querySelector(s);
const now=()=>performance.now();
const LOCAL_ONLY_SND=new Set(['select','pick','error']);   // 방장 손에서만 나는 소리는 안 보냄
const TIMERS=['hitT','healT','effT','stunT','slowT','markT','dashT','smT','dT'];

let role=null;          // 'host' | 'guest' | null
let T=null;             // 통신
let code='';
let inGame=false;       // 협동 판 진행 중
let peerIn=false;       // (방장) 동료 들어옴
let lastPeer=0;         // 상대에게서 마지막으로 받은 시각
let hbTimer=0,snapTimer=0,watchTimer=0;
let ui=null;            // 대기실 창
let onPeerChange=null;

// ---------------- 통신: 같은 브라우저 탭끼리 ----------------
function localTransport(){
  const bc=new BroadcastChannel('kt-coop'),me=Math.random().toString(36).slice(2);
  let cb=null,room='';
  bc.onmessage=e=>{const m=e.data;if(!m||m.room!==room||m.from===me)return;if(cb)cb(JSON.parse(m.msg));};
  return {kind:'local',
    async create(c){room=c;return true;},
    async join(c){room=c;return true;},
    send(msg){try{bc.postMessage({room,from:me,msg:JSON.stringify(msg)});}catch(e){}},
    on(f){cb=f;},
    close(){try{bc.close();}catch(e){}}};
}
// ---------------- 통신: Firebase 실시간 DB ----------------
// rooms/{코드}: host(방장 uid) · guest(동료 uid) · at(만든 시각) · snap(최신 화면, 문자열) · h2g/g2h(메시지 줄, 문자열)
const FB_VER='10.12.2';
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});}
async function fbTransport(){
  const cfg=window.KT_FIREBASE;
  if(!window.firebase||!firebase.database){
    const b='https://www.gstatic.com/firebasejs/'+FB_VER+'/';
    await loadScript(b+'firebase-app-compat.js');await loadScript(b+'firebase-auth-compat.js');await loadScript(b+'firebase-database-compat.js');
  }
  const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
  const auth=firebase.auth(app);if(!auth.currentUser)await auth.signInAnonymously();
  const uid=auth.currentUser.uid,db=firebase.database(app);
  let room=null,my=null,cb=null;const offs=[];
  const listen=path=>{const q=room.child(path);const f=q.on('child_added',s=>{const v=s.val();s.ref.remove();if(cb&&typeof v==='string')cb(JSON.parse(v));});offs.push(()=>q.off('child_added',f));};
  return {kind:'firebase',
    async create(c){
      room=db.ref('rooms/'+c);
      const r=await room.transaction(cur=>cur?undefined:{host:uid,at:firebase.database.ServerValue.TIMESTAMP});
      if(!r.committed)return false;
      my='host';room.onDisconnect().remove();listen('g2h');return true;
    },
    async join(c){
      room=db.ref('rooms/'+c);
      const h=await room.child('host').get();if(!h.exists())return 'none';
      const r=await room.child('guest').transaction(cur=>cur&&cur!==uid?undefined:uid);
      if(!r.committed)return 'full';
      my='guest';room.child('guest').onDisconnect().remove();listen('h2g');
      const sq=room.child('snap');const f=sq.on('value',s=>{const v=s.val();if(cb&&typeof v==='string')cb(JSON.parse(v));});offs.push(()=>sq.off('value',f));
      return true;
    },
    send(msg){if(!room)return;const s=JSON.stringify(msg);
      if(msg.t==='snap'&&my==='host')room.child('snap').set(s).catch(()=>{});
      else room.child(my==='host'?'h2g':'g2h').push(s).catch(()=>{});},
    on(f){cb=f;},
    close(){offs.splice(0).forEach(f=>{try{f();}catch(e){}});
      if(room){try{if(my==='host')room.remove();else{room.child('guest').remove();room.child('guest').onDisconnect().cancel();}}catch(e){}}
      room=null;}};
}
const online=()=>!!(window.KT_FIREBASE&&window.KT_FIREBASE.databaseURL&&/^https?:$/.test(location.protocol));
async function makeTransport(){return online()?await fbTransport():localTransport();}

// ---------------- 공통 ----------------
function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),1600);}
function send(m){if(T)T.send(m);}
function onMsg(m){lastPeer=now();
  if(role==='host')hostMsg(m);else if(role==='guest')guestMsg(m);}
function stopTimers(){clearInterval(hbTimer);clearInterval(snapTimer);clearInterval(watchTimer);hbTimer=snapTimer=watchTimer=0;}
function leave(silent){
  if(!role)return;
  if(!silent)send({t:'bye'});
  stopTimers();const t=T;T=null;setTimeout(()=>{try{t&&t.close();}catch(e){}},300);
  const was=role;role=null;inGame=false;peerIn=false;code='';actor='host';badge();
  return was;
}

// ---------------- 방장 ----------------
const eid=new WeakMap(),sent=new WeakMap(),seenTx=new WeakSet();let nextId=1,seq=0,evq=[],lastBn=null,lastUs=null,inFX=0;
const r2=v=>Math.round(v*100)/100;
function encEnemy(e,full){
  let id=eid.get(e),isNew=false;if(!id){id=nextId++;eid.set(e,id);isNew=true;}
  const last=(!full&&!isNew&&sent.get(e))||{},o={i:id};
  for(const k in e){
    if(k==='x'||k==='y'||k==='say'||k==='quotes'||k[0]==='_')continue;
    let v=e[k];const ty=typeof v;
    if(ty==='number')v=r2(v);
    else if(Array.isArray(v)){if(v.length>12||v.some(x=>typeof x==='object'&&x))continue;v=JSON.stringify(v);if(last[k]!==v){o[k]='\u0001'+v;last[k]=v;}continue;}
    else if(ty!=='string'&&ty!=='boolean')continue;
    if(last[k]!==v){o[k]=v;last[k]=v;}
  }
  const sy=e.say?e.say.txt:'';if(last.say!==sy){o.say=sy;last.say=sy;}
  sent.set(e,last);return o;
}
function encCell(c){if(!c)return 0;return [c.job,c.grade,c.count,r2(c.stunT||0),(c.at||[]).map(v=>v==null?-9:r2(v)),(c.ad||[]).map(v=>v==null?0:r2(v))];}
function snapshot(full){
  const S=KT.S;if(!S)return;seq++;
  const m={t:'snap',n:seq,ht:r2(S.t),sp:KT.getSpeed?KT.getSpeed():1,pz:(S.paused||KT.paused)?1:0,
    s:{wave:S.wave,waveTimer:r2(S.waveTimer),gold:S.gold,coffee:S.coffee,summons:S.summons,gold2:S.gold2||0,summons2:S.summons2||0,coffee2:S.coffee2||0,kills:S.kills,dmgMul:S.dmgMul,crit:S.crit||0,state:S.state,myths:S.myths,crunch:!!S.crunch,peak:S.peak||0},
    b:S.boss?(eid.get(S.boss)||0):0,full:full?1:0,th:eTheme,ek:endless?eStage:0,cf:[KT.CFG.maxEnemies,KT.CFG.summonStep,KT.CFG.bossTime],
    e:S.enemies.filter(e=>e.hp>0).map(e=>encEnemy(e,full)),c:S.cells.map(encCell)};
  if(S.boss&&!m.b)m.b=eid.get(S.boss)||0;
  const bn=S.banner?JSON.stringify({txt:S.banner.txt,sub:S.banner.sub,t:r2(S.banner.t),p:S.banner.p||null}):'';
  const bnKey=S.banner?S.banner.txt+'|'+S.banner.sub:'';if(full||bnKey!==lastBn){m.bn=bn;lastBn=bnKey;}
  const us=S.usay?JSON.stringify({i:S.usay.i,txt:S.usay.txt,t:r2(S.usay.t)}):'';const usKey=S.usay?S.usay.i+S.usay.txt:'';if(full||usKey!==lastUs){m.us=us;lastUs=usKey;}
  const tx=[];for(const t of S.texts)if(!seenTx.has(t)){seenTx.add(t);tx.push([r2(t.x),r2(t.y),t.txt,t.col,r2(t.life)]);}if(tx.length)m.tx=tx;
  if(evq.length){m.ev=evq;evq=[];}
  send(m);badgeText();
}
// 효과 기록: KTFX 함수는 인자만, 나머지 fx() 는 객체 그대로
function cleanFx(o){const r={};for(const k in o){const v=o[k];if(typeof v==='number')r[k]=r2(v);else if(typeof v==='string'||typeof v==='boolean')r[k]=v;else if(Array.isArray(v))r[k]=JSON.parse(JSON.stringify(v,(kk,x)=>typeof x==='number'?r2(x):x));}return r;}
function rec(ev){if(role==='host'&&inGame&&peerIn&&evq.length<400)evq.push(ev);}
function onFx(o){if(!inFX&&role==='host'&&inGame&&peerIn)rec(['F',cleanFx(o)]);}
function wrapFX(){
  const F=window.KTFX;if(!F||F._coop)return;F._coop=true;
  const w=(name,pack)=>{const orig=F[name];if(typeof orig!=='function')return;F[name]=function(push){const a=arguments;if(role==='host'&&inGame&&peerIn)rec(['X',name,pack(a)]);inFX++;try{return orig.apply(this,a);}finally{inFX--;}};};
  w('attack',a=>cleanFx(a[1]));
  w('pillar',a=>[r2(a[1]),r2(a[2]),a[3],!!a[4]]);
  w('ult',a=>[a[1],r2(a[2]),r2(a[3]),JSON.parse(JSON.stringify(a[4]||[],(k,x)=>typeof x==='number'?r2(x):x))]);
  w('num',a=>[r2(a[1]),r2(a[2]),r2(a[3]),a[4],!!a[5]]);
  const sh=F.shake;if(typeof sh==='function')F.shake=function(m,d){if(role==='host'&&inGame&&peerIn)rec(['K',m,d]);return sh.apply(this,arguments);};
}
function wrapSound(){
  const SND=window.KTSound;if(!SND||SND._coop)return;SND._coop=true;
  const p=SND.play,sm=SND.setMode;let hitT=0;
  SND.play=function(n,a){if(role==='host'&&inGame&&peerIn&&!LOCAL_ONLY_SND.has(n)){if(n!=='hit'||now()-hitT>90){if(n==='hit')hitT=now();rec(['S',n,a==null?null:a]);}}return p.apply(this,arguments);};
  SND.setMode=function(md){if(role==='host'&&inGame&&peerIn)rec(['M',md]);return sm.apply(this,arguments);};
}
let execOn=false,swapped=false;
function swapWallet(){const S=KT.S;[S.gold,S.gold2]=[S.gold2,S.gold];[S.summons,S.summons2]=[S.summons2,S.summons];[S.coffee,S.coffee2]=[S.coffee2,S.coffee];swapped=!swapped;}
// index.html 이 커피를 줄 때 (방장 몫은 게임이 이미 더함) → 동료 몫도
function onCoffee(n){if(!(mapOn&&role==='host'&&inGame))return;const S=KT.S;if(swapped)S.coffee2=(S.coffee2||0)+n;else S.coffee2=(S.coffee2||0)+n;}
function credit(who,v){const S=KT.S;if((who==='guest')!==swapped)S.gold2=(S.gold2||0)+v;else S.gold+=v;}
// index.html addGold 가 물어봄: 처리했으면 true
function onGold(v){
  if(!(mapOn&&role==='host'&&inGame))return false;
  const S=KT.S;
  if(actor==='guest'){credit('guest',v);return true;}
  if(S.ci!=null&&S.ci>=0){credit(owns('guest',S.ci)?'guest':'host',v);return true;}
  credit('host',v);credit('guest',v);return true;   // 웨이브 보너스 등: 둘 다
}
function execCmd(m){
  const S=KT.S;if(!S||S.state!=='play'||!inGame)return;
  const sel=S.sel,a=m.a||[];let ok=false;execOn=true;actor='guest';if(mapOn)swapWallet();
  const deck0=S.deck;if(guestDeck)S.deck=guestDeck;   // v20.3: 동료 채용·인맥 찬스는 동료 편성에서 뽑음
  try{
    if(m.n==='summon')ok=KT.summon();
    else if(m.n==='merge')ok=KT.merge(a[0]);
    else if(m.n==='sell')ok=KT.sell(a[0]);
    else if(m.n==='transfer')ok=KT.transfer(a[0],a[1]);
    else if(m.n==='gamble')ok=KT.gamble(a[0]);
    else if(m.n==='move'){if(S.cells[a[0]]&&a[1]>=0&&a[1]<S.cells.length&&a[0]!==a[1]){KT.moveCell(a[0],a[1]);ok=true;}}
    else if(m.n==='items'&&window.KTItems)ok=KTItems.applyRemote(a[0]);   // v16 동료 비품
    else if(m.n==='aug'&&window.KTAug)ok=KTAug.applyRemote(a[0],a[1]);   // v15 증강: 동료가 고른 카드
    else if(m.n==='combo'&&window.KTRecipes){const R=KTRecipes,h=(R.HIDDEN||[]).find(x=>x.key===a[0]),ca=S.cells[a[1]],cb=S.cells[a[2]];
      if(h&&ca&&cb&&a[1]!==a[2]&&ca.grade===2&&cb.grade===2&&ca.job===h.a&&cb.job===h.b)ok=R.combine({h,ia:a[1],ib:a[2]});}
  }catch(e){console.error(e);}finally{if(swapped)swapWallet();S.deck=deck0;execOn=false;actor='host';}
  S.sel=(sel>=0&&S.cells[sel])?sel:-1;
  const t=$('#toast');const msg=t&&t.classList.contains('on')?t.textContent:'';
  if(msg){send({t:'toast',m:msg});t.textContent='🤝 '+msg;}
  snapshot(false);
}
function hostMsg(m){
  if(m.t==='hello'){peerIn=true;guestDeck=okDeck(m.deck);guestUp=m.up&&Array.isArray(m.up.dmg)?m.up:null;send({t:'welcome',stage:stageLabel()});if(onPeerChange)onPeerChange();
    if(inGame){send({t:'start',o:startOpts});snapshot(true);}}
  else if(m.t==='cmd')execCmd(m);
  else if(m.t==='kf'){if(inGame)snapshot(true);}
  else if(m.t==='bye'){const was=peerIn;peerIn=false;if(onPeerChange)onPeerChange();if(was&&inGame){toast('동료가 나갔어요 — 혼자 계속');leave(true);}}
}
let startOpts=null;
// v20.3: 직원 편성·연봉 협상을 각자 것으로 — 예전에는 동료도 방장 편성(기본 의사~개발자)에서만 뽑혀 경찰·소방관 등이 안 나왔음
let guestDeck=null,guestUp=null;
const okDeck=d=>Array.isArray(d)&&d.length===5&&d.every(j=>Number.isInteger(j)&&j>=0&&KT.JOBS&&j<KT.JOBS.length&&!KT.JOBS[j].hidden)?d.slice():null;
const myDeck=()=>{try{return window.KTProg?okDeck(KTProg.deck()):null;}catch(e){return null;}};
const myUp=()=>{try{const e=window.KTUp&&KTUp.effects();return e?{dmg:e.dmg,lv:e.lv}:null;}catch(e){return null;}};
function mergeUp(S){   // 직업별 공격력 강화: 둘 중 높은 쪽 (편성이 다르면 각자 직업이 각자 강화를 받음)
  if(!guestUp||!S.dmgMul)return;
  guestUp.dmg.forEach((v,j)=>{v=+v;if(!(v>=1&&v<10))return;if(!(S.dmgMul[j]>=v))S.dmgMul[j]=v;const l=+(guestUp.lv||[])[j];if(S.ulv&&l>=0&&!(S.ulv[j]>=l))S.ulv[j]=l;});
  if(window.KTRecipes&&KTRecipes.extendMul)KTRecipes.extendMul(S);
}
function stageLabel(){return '협동 연속 출근';}
function hostStart(){
  // 로비의 "출근하기"와 똑같이 시작 (부스터·연봉·편성 적용) → 시작 옵션을 동료에게 보냄
  if(!peerIn)return;
  const L=window.KTLobby;document.querySelectorAll('.kt-modal').forEach(w=>w.remove());
  wantStart=true;
  if(L&&L.startGame)L.startGame();else KT.start({});
}
let wantStart=false;
// ---------------- 협동 연속 출근 ----------------
const ENDLESS_THEMES=['subway','office','server','site','center','tax','court','hospital','night','fire','camp','disaster','emergency','roof','school','mall'];
let endless=false,eTimer=0,eStage=1,eTheme='';
function makeEndless(){return {id:'협동',name:'연속 출근',coop:true,waves:10,bossEvery:10,bosses:[0],bossHp:[20],hp:1.0,mods:[],mix:{},idx:-1};}
const stageOf=w=>Math.floor((Math.max(1,w)-1)/10)+1;
const themeFor=k=>ENDLESS_THEMES[(k-1)%ENDLESS_THEMES.length];
function setTheme(id){const TH=window.KTThemes;if(TH&&TH.THEMES&&TH.THEMES[id]){TH.cur=id;eTheme=id;}}
function themeName(id){const TH=window.KTThemes,t=TH&&TH.THEMES&&TH.THEMES[id];return t?(t.icon||'')+' '+t.name:'';}
function hudLabel(k){const hl=document.querySelector('#hud .st .l');if(hl&&hl.textContent!==`협동 ${k}단계`)hl.textContent=`협동 ${k}단계`;}
function bestGet(){try{return JSON.parse(localStorage.getItem('kt_coop_best')||'null')||{stage:0,wave:0};}catch(e){return {stage:0,wave:0};}}
function bestSave(stage,wave){const b=bestGet();if(wave>b.wave){try{localStorage.setItem('kt_coop_best',JSON.stringify({stage,wave}));}catch(e){}return true;}return false;}
// v20.3: 30웨이브부터 업무 체력 증가를 1웨이브당 +17.75% → +9% 로 (그대로 두면 50웨이브 근처에서 벽: 봇 시험 평균 52 → 73)
const LATE_FROM=30,LATE_G=1.09;let hpF=1;
function lateHp(){const S=KT.S;if(!S)return;const nf=Math.pow(LATE_G/KT.CFG.hpGrowth,Math.max(0,S.wave+1-LATE_FROM));if(Math.abs(nf-hpF)>1e-12){S.hpMul*=nf/hpF;hpF=nf;}}   // 다음 웨이브 체력에 미리 반영 (증강 '업무 분담' 같은 배율은 그대로 유지)
function endlessBegin(){endless=true;eStage=1;KT.CFG.waves=1e9;hpF=1;   // 마지막 웨이브가 없음 (보스를 잡아도 끝나지 않음)
  setTheme(themeFor(1));hudLabel(1);clearInterval(eTimer);eTimer=setInterval(endlessTick,200);}
function endlessStop(){endless=false;clearInterval(eTimer);eTimer=0;}
let guestEndless=false;
// 위쪽 웨이브 칸: "지금 웨이브 / 이번 단계 보스 웨이브" (게임이 1e9 를 쓰려 하면 같은 프레임에 덮어씀)
function hudFix(){
  const S=KT.S;
  if(S&&(endless||(guestEndless&&role==='guest'&&inGame))){const el=document.getElementById('hWave');const t=`${S.wave}/${stageOf(S.wave)*10}`;if(el&&el.textContent!==t)el.textContent=t;}
  requestAnimationFrame(hudFix);
}
requestAnimationFrame(hudFix);
function endlessTick(){
  const S=KT.S;if(!endless||!S)return;if(S.state!=='play'){return;}
  lateHp();
  const k=stageOf(S.wave);
  if(k>eStage){
    const prev=eStage;eStage=k;
    S.stage.bosses.push((k-1)%3);S.stage.bossHp.push(20);   // 이번 단계 마지막 보스 = 새 테마 보스
    const STs=window.KTStages&&KTStages.STAGES;S.stage.mix=STs&&STs.length?(STs[(k-1)%STs.length].mix||{}):{};
    setTheme(themeFor(k));
    S.gold+=50;if(S.gold2!=null)S.gold2+=50;
    S.banner={txt:`🎉 협동 ${prev}단계 클리어!`,sub:`다음 ${k}단계 · ${themeName(eTheme)} · 각자 💰+50`,t:3};
    try{KTSound.play('luckWin');}catch(e){}
  }
  hudLabel(k);
}
function endResult(r){
  if(!r)return r;const k=r.coopStage||stageOf(r.wave);
  const best=bestSave(k,r.wave);
  return Object.assign({},r,{coopStage:k,canRevive:false,title:`🤝 협동 ${k}단계까지 버텼어요`,sub:`웨이브 ${r.wave}${best?' · 🏆 최고 기록!':''}`});
}
function wrapStart(){
  const orig=KT.start;
  KT.start=function(o){
    // 협동 판에서는 튜토리얼을 띄우지 않음 (방장이 멈추면 둘 다 멈춤)
    useMap(testMap||(role==='host'&&wantStart)||(role==='guest'&&inGame));
    let tut=null;if(role){try{tut=localStorage.getItem('kt_tut_v1');localStorage.setItem('kt_tut_v1','1');}catch(e){}}
    const hostCoop=role==='host'&&wantStart;
    if(hostCoop)o=Object.assign({},o||{},{stage:makeEndless()});
    let r;try{r=orig.call(this,o);}finally{if(role){try{if(tut==null)localStorage.removeItem('kt_tut_v1');else localStorage.setItem('kt_tut_v1',tut);}catch(e){}}}
    if(role==='host'&&wantStart){wantStart=false;o=o||{};
      {const S=KT.S,mods=S.mods||[];S.gold2=KT.CFG.startGold-(mods.includes('poor')?30:0);S.summons2=0;S.coffee2=KT.CFG.startCoffee;
       mergeUp(S);}
      endlessBegin();
      startOpts={endless:1,stage:null,up:o.up||null,deck:KT.S.deck||o.deck||null,gold:o.gold||0,coffee:o.coffee||0,career:!!o.career};
      inGame=true;send({t:'start',o:startOpts});snapshot(true);
      clearInterval(snapTimer);let k=0;snapTimer=setInterval(()=>{if(!inGame)return;snapshot(++k%15===0);},T&&T.kind==='firebase'?160:100);
      badge();
    }
    return r;
  };
  const ab=KT.abandon;
  KT.abandon=function(){
    endlessStop();
    if(role==='host'&&inGame){send({t:'end',r:null});leave(true);}
    else if(role==='guest'&&inGame){leave(false);}
    return ab.apply(this,arguments);
  };
  const L=window.KTLobby;
  if(L&&L.onGameEnd){const oe=L.onGameEnd;
    L.onGameEnd=function(r){
      if(endless){r=endResult(Object.assign({},r,{coopStage:eStage}));endlessStop();}
      if(role==='host'&&inGame){r=Object.assign({},r,{canRevive:false});snapshot(false);send({t:'end',r});leave(true);}
      return oe.call(this,r);
    };}
}

// ---------------- 동료 ----------------
const emap=new Map();let snapHt=0,snapAt=0,rate=1,lastSeq=0,kfAt=0;
function guestStart(o){
  const S0=KT.S;document.querySelectorAll('.kt-modal').forEach(w=>w.remove());
  const L=window.KTLobby;if(L&&L.hide)L.hide();
  const ST=window.KTStages;const st=o.endless?makeEndless():(o.stage&&ST&&ST.get?ST.get(o.stage):null);
  inGame=true;emap.clear();lastSeq=0;
  KT.start({stage:st,up:o.up||null,deck:myDeck()||o.deck||null,gold:o.gold||0,coffee:o.coffee||0,career:o.career});   // v20.3: 내 화면 발령 목록은 내 편성
  guestEndless=!!o.endless;if(o.endless){eStage=1;setTheme(themeFor(1));hudLabel(1);KT.CFG.waves=1e9;}
  badge();
  const sp=$('#bSpeed');if(sp)sp.disabled=true;
}
function decodeVal(v){return typeof v==='string'&&v[0]==='\u0001'?JSON.parse(v.slice(1)):v;}
function applySnap(m){
  const S=KT.S;if(!S||!inGame)return;
  if(m.n&&m.n<=lastSeq&&!m.full)return;lastSeq=m.n||lastSeq;
  const dHt=m.ht-snapHt;snapHt=m.ht;snapAt=now();rate=m.pz?0:(m.sp||1);
  S.t=m.ht;
  for(const k in m.s)S[k]=m.s[k];
if(m.cf){KT.CFG.maxEnemies=m.cf[0];KT.CFG.summonStep=m.cf[1];KT.CFG.bossTime=m.cf[2];}   // v15 증강으로 바뀐 값
  if(m.th&&m.th!==eTheme)setTheme(m.th);if(m.ek){eStage=m.ek;hudLabel(m.ek);}
  if('gold2' in m.s){partnerGold=m.s.gold;partnerCoffee=m.s.coffee;S.gold=m.s.gold2;S.summons=m.s.summons2;S.coffee=m.s.coffee2||0;badgeText();}
  S.paused=!!m.pz;
  // 업무(적)
  const keep=new Set();
  const H=window.KTHit,hp0=H&&H.hitFx?new Map():null;if(hp0)for(const [id,e] of emap)hp0.set(id,e.hp);   // v20: 동료 화면 타격감
  for(const d of m.e){
    keep.add(d.i);let e=emap.get(d.i);
    if(!e){e={say:null,stunT:0,slowT:0,hitT:0,_v:0};emap.set(d.i,e);if(!('type' in d)&&now()-kfAt>1000){kfAt=now();send({t:'kf'});}}
    for(const k in d){if(k==='i')continue;
      if(k==='say'){const tx=d.say;e.say=tx?{txt:tx,t:e.say&&e.say.txt===tx?e.say.t:2.4}:null;continue;}
      if(k==='s'){if(e._ht!=null&&m.ht>e._ht){const v=(d.s-e._s)/(m.ht-e._ht);e._v=v>=0&&v<400?v:0;}e._s=d.s;e._ht=m.ht;e.s=d.s;continue;}
      e[k]=decodeVal(d[k]);}
    const p=epos(e);e.x=p[0];e.y=p[1];
  }
  if(hp0){for(const [id,e] of emap){const h=hp0.get(id);if(h==null)continue;
      if(!keep.has(id)){if(h>0)try{H.deathFx(e);}catch(x){}}   // 업무가 사라짐 = 처치 (방장은 체력 0 인 업무만 빼고 보냄)
      else if(e.hp<h-0.01)try{H.hitFx(e,h-e.hp,{job:-1});}catch(x){}}}
  if(m.full||true){for(const id of emap.keys())if(!keep.has(id))emap.delete(id);}
  S.enemies=[...emap.values()];
  S.boss=m.b?emap.get(m.b)||null:null;
  // 직원 칸
  for(let i=0;i<m.c.length;i++){const d=m.c[i];
    if(!d){S.cells[i]=null;continue;}
    const old=S.cells[i];const c=(old&&old.job===d[0]&&old.grade===d[1])?old:{job:d[0],grade:d[1]};
    c.count=d[2];c.stunT=d[3];c.at=d[4].map(v=>v===-9?null:v);c.ad=d[5];c.cd=new Array(d[2]).fill(0);S.cells[i]=c;}
  if(S.sel>=0&&!S.cells[S.sel])S.sel=-1;
  if('bn' in m){S.banner=m.bn?JSON.parse(m.bn):null;}
  if('us' in m){S.usay=m.us?JSON.parse(m.us):null;}
  if(m.tx)for(const t of m.tx)if(S.texts.length<60)S.texts.push({x:t[0],y:t[1],txt:t[2],col:t[3],life:t[4],max:0.9});
  if(m.ev)replay(m.ev);
}
function pushFx(o){const S=KT.S;if(S.fx.length<400){o.max=o.life;S.fx.push(o);}}
function replay(ev){
  const F=window.KTFX,SND=window.KTSound;
  for(const x of ev){try{
    if(x[0]==='F')pushFx(x[1]);
    else if(x[0]==='X'&&F){const n=x[1],a=x[2];
      if(n==='attack')F.attack(pushFx,a);else if(n==='pillar')F.pillar(pushFx,a[0],a[1],a[2],a[3]);
      else if(n==='ult')F.ult(pushFx,a[0],a[1],a[2],a[3]);else if(n==='num')F.num(pushFx,a[0],a[1],a[2],a[3],a[4]);}
    else if(x[0]==='K'&&F&&F.shake)F.shake(x[1],x[2]);
    else if(x[0]==='S'&&SND)SND.play(x[1],x[2]==null?undefined:x[2]);
    else if(x[0]==='M'&&SND)SND.setMode(x[1]);
  }catch(e){}}
}
function guestMsg(m){
  if(m.t==='welcome'){peerIn=true;if(ui)ui.waitHost(m.stage);}
  else if(m.t==='start')guestStart(m.o);
  else if(m.t==='snap')applySnap(m);
  else if(m.t==='toast')toast(m.m);
  else if(m.t==='end'){
    const r=m.r;const wasIn=inGame;leave(true);
    if(!wasIn)return;
    const S=KT.S;
    if(r&&r.coopStage)bestSave(r.coopStage,r.wave);
    if(r){S.state=r.won?'win':'over';try{KTSound.setMode('normal');KTSound.play(r.won?'win':'lose');}catch(e){}
      const L=window.KTLobby;if(L&&L.onGameEnd)L.onGameEnd(r);}
    else{toast('방장이 나갔어요');KT.abandon();const L=window.KTLobby;if(L&&L.show)L.show();}
    const sp=$('#bSpeed');if(sp)sp.disabled=false;
  }
  else if(m.t==='bye'){if(inGame){toast('방장 연결이 끊겼어요');leave(true);KT.abandon();const L=window.KTLobby;if(L&&L.show)L.show();const sp=$('#bSpeed');if(sp)sp.disabled=false;}else if(ui){ui.msg('방이 닫혔어요');leave(true);}}
}
// 동료 화면: 받은 상태 사이를 부드럽게 이어 줌
let lastF=now();
function guestLoop(){
  const t=now(),dt=Math.min(0.05,(t-lastF)/1000);lastF=t;
  if(role==='guest'&&inGame&&KT.S){
    const S=KT.S,g=dt*rate;
    if(g>0){
      S.t+=g;S.waveTimer-=g;
      for(const e of S.enemies){
        for(const k of TIMERS)if(e[k]>0)e[k]=Math.max(0,e[k]-g);
        if(!(e.stunT>0)&&e._v)e.s+=e._v*g;
        const p=epos(e);e.x=p[0];e.y=p[1];
        if(e.say){e.say.t-=g;if(e.say.t<=0)e.say=null;}
      }
      for(const f of S.fx)f.life-=g;S.fx=S.fx.filter(f=>f.life>0);
      for(const x of S.texts){x.life-=g;x.y-=22*g;}S.texts=S.texts.filter(x=>x.life>0);
      if(S.banner){S.banner.t-=g;if(S.banner.t<=0)S.banner=null;}
      if(S.usay){S.usay.t-=g;if(S.usay.t<=0)S.usay=null;}
      if(window.KTFX&&KTFX.tick)KTFX.tick(g);
    }
  }
  requestAnimationFrame(guestLoop);
}
requestAnimationFrame(guestLoop);
// 동료가 누른 조작 → 방장에게 (index.html 조작 함수 첫 줄에서 호출)
const IDX={merge:[0],sell:[0],transfer:[0],move:[0,1],combo:[1,2]};
function guestAct(n,a){
  a=Array.from(a||[]);
  if(!role||!inGame)return false;
  const me=role==='guest'?'guest':actor;
  if(mapOn&&IDX[n]&&IDX[n].some(k=>typeof a[k]==='number'&&!owns(me,a[k]))){
    const msg=me==='host'?'동료 자리예요 — 내 칸(위)만 조작할 수 있어요':'방장 자리예요 — 내 칸(아래)만 조작할 수 있어요';
    if(role==='host'&&actor==='host'){const t=$('#toast');if(t){t.textContent=msg;t.classList.add('on');clearTimeout(guestAct._t);guestAct._t=setTimeout(()=>t.classList.remove('on'),1600);}}
    else if(role==='host'){const t=$('#toast');if(t){t.textContent=msg;t.classList.add('on');}}
    else toast(msg);
    try{KTSound.play('error');}catch(e){}
    return true;
  }
  if(role!=='guest')return false;
  send({t:'cmd',n,a});
  try{if(n==='summon'||n==='merge')KTSound.play('select');}catch(e){}
  return true;
}
// 동료: 방장 판을 멈추게 하지 않도록 KT.paused 는 항상 참 (게임 계산을 안 함)
(function(){let pv=!!KT.paused;
  Object.defineProperty(KT,'paused',{configurable:true,enumerable:true,get(){return (role==='guest'&&inGame)||pv;},set(v){pv=v;}});})();

// ---------------- 연결 감시 ----------------
function startWatch(){
  clearInterval(hbTimer);clearInterval(watchTimer);lastPeer=now();
  hbTimer=setInterval(()=>{if(role)send({t:'hb'});},2000);
  watchTimer=setInterval(()=>{
    if(!role)return;const gap=(now()-lastPeer)/1000;
    if(role==='guest'&&inGame){
      setBadgeWarn(gap>4);
      if(gap>20){toast('방장 연결이 끊겼어요');leave(true);KT.abandon();const L=window.KTLobby;if(L&&L.show)L.show();const sp=$('#bSpeed');if(sp)sp.disabled=false;}
    }else if(role==='host'&&peerIn&&gap>15){peerIn=false;if(onPeerChange)onPeerChange();if(inGame){toast('동료 연결이 끊겼어요 — 혼자 계속');leave(true);}}
  },1000);
}

// ---------------- 게임 화면 표시 ----------------
let bEl=null;
function badge(){
  if(!bEl){bEl=document.createElement('div');bEl.id='kt-coop-badge';document.body.appendChild(bEl);
    const st=document.createElement('style');st.textContent=`
#kt-coop-badge{position:fixed;left:50%;bottom:calc(6px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;font:700 11px "Jua","Malgun Gothic",sans-serif;color:#d8f5e3;background:rgba(20,60,40,.85);border:1px solid #2f9e66;border-radius:999px;padding:2px 10px;pointer-events:none}
#kt-coop-badge.warn{background:rgba(90,30,20,.9);border-color:#ff6b6b;color:#ffd0c8}
#kt-coop-badge[hidden]{display:none}
.kc-code{font:800 44px "Jua","Malgun Gothic",sans-serif;letter-spacing:10px;color:#ffcf6a;text-align:center;margin:6px 0}
.kc-in{width:100%;font:800 30px "Jua",sans-serif;letter-spacing:10px;text-align:center;padding:8px;border-radius:12px;border:1px solid #3a4150;background:#12151b;color:#fff}
.kc-st{text-align:center;color:#cfd4de;font-size:14px;margin:8px 0;min-height:20px}
.kc-row{display:flex;gap:8px;margin-top:10px}.kc-row .kt-btn{flex:1;padding:10px}
.kc-go{background:#ffb020!important;color:#1a1200!important;border-color:#ffb020!important;font-weight:800}
.kc-note{font-size:11.5px;color:#8b93a5;text-align:center;margin-top:8px;line-height:1.5}
#kt-coop-btn{display:block;width:100%;margin:6px 0 2px;padding:10px;font-size:16px;border-color:#2f9e66;color:#b7f0cd;background:rgba(47,158,102,.12)}`;
    document.head.appendChild(st);}
  bEl.hidden=!(role&&inGame);badgeText();
}
let partnerGold=null,partnerCoffee=null;
function badgeText(){if(!bEl||bEl.classList.contains('warn'))return;
  const pg=role==='host'?(KT.S&&KT.S.gold2):partnerGold,pc=role==='host'?(KT.S&&KT.S.coffee2):partnerCoffee;
  bEl.textContent=(role==='host'?'🤝 협동 · 방장':'🤝 협동 · 동료')+(mapOn&&pg!=null?` · ${role==='host'?'동료':'방장'} 💰${pg} ☕${pc==null?0:pc}`:'');}
function setBadgeWarn(w){if(bEl){bEl.classList.toggle('warn',w);if(w)bEl.textContent='🤝 연결 확인 중…';else badgeText();}}

// ---------------- 대기실 ----------------
function sheet(html){
  const w=document.createElement('div');w.className='kt-modal kt-font';w.innerHTML=`<div class="kt-sheet">${html}</div>`;
  document.body.appendChild(w);return w;
}
function openCoop(pref){
  badge();
  if(role&&!inGame){leave(false);}
  const kind=online()?'<div class="kc-note">🌐 온라인 협동 · 폰끼리 연결돼요</div>':'<div class="kc-note">⚠️ 옛 버전이에요 — 페이지를 새로고침(또는 앱을 껐다 켜기) 해 주세요. 지금은 같은 기기 탭끼리만 연결돼요</div>';
  const w=sheet(`<h2>🤝 협동 출근</h2>
    <p style="color:#cfd4de;font-size:14px;line-height:1.6">친구와 <b>한 판을 같이</b> 막아요. 직원 칸(위=방장·아래=동료)·골드·커피는 각자, 쌓인 업무 한도와 보스는 함께예요.<br>게임은 방장 폰에서 돌아가요.</p>
    <p style="color:#ffcf6a;font-size:13px;text-align:center;margin:4px 0">끝없이 이어지는 연속 출근 · 10웨이브마다 1단계 · 몇 단계까지 버티는지로 보상<br>${(b=>b.wave?`🏆 내 최고 기록: ${b.stage}단계 (웨이브 ${b.wave})`:'')(bestGet())}</p>
    <div class="kc-row"><button class="kt-btn kc-go" id="kc-make">방 만들기</button><button class="kt-btn" id="kc-join">번호로 참가</button></div>
    ${kind}<div class="kc-row"><button class="kt-btn" id="kc-x">닫기</button></div>`);
  w.addEventListener('click',e=>{if(e.target===w){w.remove();}});
  w.querySelector('#kc-x').onclick=()=>w.remove();
  w.querySelector('#kc-make').onclick=()=>{w.remove();makeRoom();};
  w.querySelector('#kc-join').onclick=()=>{w.remove();joinRoom(pref);};
  if(pref){w.remove();joinRoom(pref);}
}
async function makeRoom(){
  const w=sheet(`<h2>🤝 방 만들기</h2><div class="kc-st" id="kc-s">방을 만드는 중…</div>
    <div class="kc-code" id="kc-c">····</div>
    <div class="kc-note" id="kc-n">친구에게 이 번호를 알려 주세요 — 친구는 로비에서 🤝 협동 출근 → 번호로 참가<br>${online()?'🌐 온라인 방':'⚠️ 옛 버전(시험 모드) — 새로고침 후 다시 만들어 주세요'}</div>
    <div class="kc-row"><button class="kt-btn" id="kc-share">번호 보내기</button><button class="kt-btn kc-go" id="kc-start" disabled>동료 기다리는 중</button></div>
    <div class="kc-row"><button class="kt-btn" id="kc-x">방 닫기</button></div>`);
  w.dataset.lock=1;
  const S=w.querySelector('#kc-s'),btn=w.querySelector('#kc-start');
  w.querySelector('#kc-x').onclick=()=>{leave(false);w.remove();ui=null;};
  try{T=await makeTransport();}catch(e){S.textContent='연결 실패 — 인터넷을 확인해 주세요';return;}
  role='host';T.on(onMsg);
  let ok=false;for(let k=0;k<8&&!ok;k++){code=String(1000+Math.floor(Math.random()*9000));ok=await T.create(code);}
  if(!ok){S.textContent='방을 만들지 못했어요. 다시 시도해 주세요';leave(true);return;}
  w.querySelector('#kc-c').textContent=code;S.textContent='동료를 기다리는 중…';startWatch();
  const url=location.origin+location.pathname+'?room='+code;
  w.querySelector('#kc-share').onclick=async()=>{const txt=`칼퇴 디펜스 같이 하자! 협동 방 번호 ${code}`;
    try{if(navigator.share){await navigator.share({title:'칼퇴 디펜스 협동',text:txt,url});return;}}catch(e){return;}
    try{await navigator.clipboard.writeText(txt+'\n'+url);toast('복사했어요 — 카톡에 붙여 넣으세요');}catch(e){toast('번호: '+code);}};
  const st=stageLabel();
  onPeerChange=()=>{if(!document.body.contains(w))return;
    if(peerIn){S.textContent='✅ 동료 입장!';btn.disabled=false;btn.textContent='▶ 같이 출근하기'+(st?' · '+st:'');}
    else{S.textContent='동료를 기다리는 중…';btn.disabled=true;btn.textContent='동료 기다리는 중';}};
  btn.onclick=()=>{if(!peerIn)return;onPeerChange=null;w.remove();ui=null;hostStart();};
  ui={msg:t=>{S.textContent=t;}};
}
async function joinRoom(pref){
  const w=sheet(`<h2>🤝 번호로 참가</h2>
    <input class="kc-in" id="kc-i" inputmode="numeric" maxlength="4" placeholder="0000" value="${pref||''}">
    <div class="kc-st" id="kc-s"></div>
    <div class="kc-row"><button class="kt-btn" id="kc-x">닫기</button><button class="kt-btn kc-go" id="kc-ok">참가</button></div>`);
  w.dataset.lock=1;
  const I=w.querySelector('#kc-i'),S=w.querySelector('#kc-s'),ok=w.querySelector('#kc-ok');
  w.querySelector('#kc-x').onclick=()=>{leave(false);w.remove();ui=null;};
  ok.onclick=async()=>{
    const c=(I.value||'').replace(/\D/g,'');if(c.length!==4){S.textContent='4자리 번호를 넣어 주세요';return;}
    ok.disabled=true;S.textContent='연결 중…';
    try{if(!T)T=await makeTransport();}catch(e){S.textContent='연결 실패 — 인터넷을 확인해 주세요';ok.disabled=false;return;}
    role='guest';T.on(onMsg);code=c;
    const r=await T.join(c);
    if(r!==true){S.textContent=r==='full'?'이미 다른 동료가 들어간 방이에요':'그 번호의 방이 없어요 — 방장 화면에 🌐 온라인 방이라고 떠 있는지 확인하고, 아니면 방장이 새로고침 후 다시 만들어 주세요';leave(true);ok.disabled=false;return;}
    peerIn=false;send({t:'hello',deck:myDeck(),up:myUp()});startWatch();
    setTimeout(()=>{if(role==='guest'&&!peerIn&&document.body.contains(w)){S.textContent='방장이 응답하지 않아요 — 방장 화면이 켜져 있는지, 번호가 맞는지 확인해 주세요';leave(true);ok.disabled=false;}},T.kind==='firebase'?8000:2500);
  };
  ui={waitHost:st=>{if(!document.body.contains(w))return;S.textContent=`✅ 입장 완료! 방장이 시작하면 바로 시작돼요${st?' · '+st:''}`;ok.hidden=true;I.disabled=true;},msg:t=>{S.textContent=t;}};
  if(pref)setTimeout(()=>ok.click(),200);else setTimeout(()=>I.focus(),100);
}

// 로비 버튼
function lobbyBtn(){
  const anchor=document.getElementById('lb-boosts');if(!anchor||document.getElementById('kt-coop-btn'))return;
  const b=document.createElement('button');b.id='kt-coop-btn';b.className='kt-btn kt-font';b.type='button';b.textContent='🤝 협동 출근 · 친구와 2인';
  b.onclick=()=>{try{KTSound.init();KTSound.play('select');}catch(e){}openCoop();};
  anchor.before(b);
}
let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;lobbyBtn();});}).observe(document.body,{childList:true});
lobbyBtn();

// 가운데 복도·칸 덩어리 테두리 그리기 (테마 배경 위)
function drawCoopMap(c,drewTheme){
  const th=window.KTThemes&&KTThemes.cur,pal=th&&th.pal;
  if(!drewTheme){c.fillStyle='#15181e';c.fillRect(-12,-12,564,704);c.lineJoin='round';c.strokeStyle='#222733';c.lineWidth=44;c.strokeRect(ML,MT,MR-ML,MB-MT);}
  c.save();
  c.fillStyle=pal?pal.path:'#222733';c.fillRect(56,MM-22,428,44);
  c.strokeStyle='rgba(0,0,0,0.45)';c.lineWidth=2;c.beginPath();c.moveTo(56,MM-22);c.lineTo(484,MM-22);c.moveTo(56,MM+22);c.lineTo(484,MM+22);c.stroke();
  c.strokeStyle='rgba(255,255,255,0.10)';c.lineWidth=1;c.setLineDash([10,12]);c.beginPath();c.moveTo(56,MM);c.lineTo(484,MM);c.stroke();c.setLineDash([]);
  c.fillStyle=pal&&pal.label?pal.label:'#4a5162';c.globalAlpha=0.7;c.font='bold 12px "Malgun Gothic",sans-serif';c.textAlign='center';c.textBaseline='middle';
  for(const x of [150,270,390])c.fillText('◀',x,MM);
  c.globalAlpha=1;c.fillStyle=pal?pal.path:'#222733';c.fillRect(42,24,70,20);   // 옛 '입구 ▶' 가림
  c.globalAlpha=1;c.fillStyle='#ff8a5c';c.font='bold 11px "Jua","Malgun Gothic",sans-serif';c.textAlign='right';c.textBaseline='middle';c.fillText('입구 ◀',MR-8,MM-30);
  c.globalAlpha=1;
  // 칸 덩어리: 위=방장(주황) · 아래=동료(초록), 내 덩어리는 진하게
  const me=role==='guest'?'guest':'host';
  [['host',CY0[0],'#ffb020','👑 방장 칸'],['guest',CY0[1],'#40d987','🤝 동료 칸']].forEach(([who,y0,col,lb])=>{
    const x=CGX-5,y=y0-5,w=3*CCW+2*CGAP+10,h=3*CCH+2*CGAP+10,mine=role&&who===me;
    c.strokeStyle=col;c.globalAlpha=mine?0.75:0.3;c.lineWidth=mine?2:1.2;c.setLineDash(mine?[]:[6,6]);
    c.beginPath();const r=12;c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.stroke();c.setLineDash([]);
    c.globalAlpha=mine?0.95:0.55;c.fillStyle=col;c.font='bold 10px "Jua","Malgun Gothic",sans-serif';c.textAlign='right';c.textBaseline='bottom';
    c.fillText(lb+(mine?' (나)':''),x+w-6,y-1);c.globalAlpha=1;});
  c.restore();
}
function wrapBg(){
  const TH=window.KTThemes;if(!TH||TH._coopBg)return;TH._coopBg=true;const ob=TH.bg;
  TH.bg=function(c,G){const r=ob.apply(this,arguments);if(!mapOn)return r;drawCoopMap(c,!!r);return true;};
}
function wrapBossPath(){   // 방장 쪽: 게임이 위치를 정한 뒤(KTThemes.tick 은 이동 다음, 공격 전에 불림) 보스만 가운데로
  const TH=window.KTThemes;if(!TH||!TH.tick)return;const ot=TH.tick;let hinted=null;
  TH.tick=function(S,dt){const r=ot.apply(this,arguments);
    if(mapOn&&S&&S.boss&&S.boss.hp>0){const p=bossPos(S.boss.s);S.boss.x=p[0];S.boss.y=p[1];
      if(hinted!==S.boss){hinted=S.boss;if(S.texts)S.texts.push({x:270,y:MM-40,txt:'보스는 가운데 복도만 오가요 · 강한 직원을 가운데 줄로!',col:'#ffd43b',life:3.5,max:3.5});}}
    return r;};
}
wrapFX();wrapSound();wrapStart();wrapBg();wrapBossPath();
addEventListener('pagehide',()=>{if(role)leave(false);});
// 주소로 참가: ?room=1234
try{const p=new URLSearchParams(location.search).get('room');if(p&&/^\d{4}$/.test(p))setTimeout(()=>openCoop(p),900);}catch(e){}

window.KTCoop={myRange,guestAct,onFx,onGold,onCoffee,endless:()=>endless,stage:()=>eStage,best:bestGet,slotRange,MAP,mapOn:()=>mapOn,_testMap:v=>{testMap=!!v;},role:()=>role,inGame:()=>inGame,open:openCoop,leave,_dbg:{emap,snapshot}};
})();
