// 칼퇴 디펜스 — 배경 테마 · 테마 업무(몬스터) · 직업 상성 v13
// - 스테이지마다 테마 배경 (복도 바닥 · 칸 · 소품 · 조명 · 날씨). bg/ 폴더에 그림이 있으면 그 그림을 씀
// - 테마 업무: 일반 업무(📄·⚡)의 60%를 테마 업무로 바꿈 · 6웨이브부터 정예 · 스테이지 마지막 보스는 테마 보스
// - 상성: 테마 업무·테마 보스에는 담당 직업 표시(발밑 고리 색). 담당 직업이 때리면 피해 +25% "효과 굿!"
//         히든 직업은 두 재료 직업의 상성을 모두 가짐 · 불리한 상성은 없음
// - 챕터·스테이지 이름을 테마에 맞게 바꿈 · 🧪 시범 스테이지 T-1 불타는 도시 (항상 열림, 소방관 임시 편성)
// 게임 연결: 게임 패치(v13)가 KTThemes.extendTypes / pickType / boss / onSpawn / preHit / onDeath / tick / bg / drawEnemy / overlay 를 부름
(function(){
'use strict';
const ST=window.KTStages;if(!ST)return;
const BONUS=1.25,RATE=0.6,ELITE_P=0.05,ELITE_FROM=6;
const EMOJI='"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
const FONT='"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
const rnd=Math.random,pick=a=>a[(rnd()*a.length)|0];
// 직업 번호: 0 의사 1 변호사 2 건축가 3 회계사 4 개발자 5 경찰 6 소방관 7 공무원 8 군인

// ---------------- 테마 ----------------
const THEMES={
  subway:  {name:'출근길 지하철',icon:'🚇',jobs:[],acc:'#f2c94c',pal:{bg:'#101318',floor:'#161a21',path:'#343944',cell:'rgba(26,30,38,0.86)',cellLine:'#2c3340',label:'#f2c94c'},
            mobs:['alarm','backpack'],elite:'rush'},
  office:  {name:'사무실',icon:'🏢',jobs:[],acc:'#8ec5ff',pal:{bg:'#14171d',floor:'#1a1e25',path:'#2a303b',cell:'rgba(27,31,39,0.88)',cellLine:'#2a303c',label:'#6f7a90'},
            mobs:[],elite:'bomb'},
  server:  {name:'판교 서버실',icon:'🖥️',jobs:[4],acc:'#4dabf7',pal:{bg:'#0b0e14',floor:'#10141c',path:'#262c37',cell:'rgba(17,22,31,0.86)',cellLine:'#22324a',label:'#4dabf7'},
            mobs:['bug','alert'],elite:'leak',boss:{name:'새벽 3시 서버 다운',icon:'🖥️',quotes:['502 Bad Gateway','롤백은 없다','지금 다 들어오세요','에러 로그 10만 줄']}},
  site:    {name:'공사 현장',icon:'🏗️',jobs:[2],acc:'#ffa94d',pal:{bg:'#17140f',floor:'#22201c',path:'#4a3c2b',cell:'rgba(36,33,28,0.86)',cellLine:'#4a4032',label:'#ffd43b'},
            mobs:['change','loud'],elite:'truck',boss:{name:'부실시공 크레인',icon:'🏗️',quotes:['공기 단축합시다','도면은 나중에','안전모? 덥잖아','설계 또 바꿨어요']}},
  center:  {name:'주민센터',icon:'🏛️',jobs:[7],acc:'#20c997',pal:{bg:'#14171a',floor:'#1f2326',path:'#3a3f3c',cell:'rgba(30,35,37,0.86)',cellLine:'#34413d',label:'#63e6be'},
            mobs:['ticket','missing'],elite:'angry',boss:{name:'민원 대폭주',icon:'📣',quotes:['담당자 나와!','세금 내는데!','점심시간이 왜 있어요?','국민신문고 올립니다']}},
  tax:     {name:'세무서 · 결산 시즌',icon:'🧾',jobs:[3],acc:'#69db7c',pal:{bg:'#120f0c',floor:'#1b1714',path:'#3b2f25',cell:'rgba(31,26,22,0.86)',cellLine:'#463729',label:'#ffd8a8'},
            mobs:['receipt','ledger'],elite:'audit',boss:{name:'연말정산 마감일',icon:'📆',quotes:['영수증 다 챙겼죠?','공제 서류 미비','오늘 자정 마감','환급이 아니라 추징']}},
  court:   {name:'법원',icon:'⚖️',jobs:[1],acc:'#ffe066',pal:{bg:'#120f0f',floor:'#1c1615',path:'#3c3a44',cell:'rgba(30,25,24,0.86)',cellLine:'#4a3a2e',label:'#ffe066'},
            mobs:['suit','evidence'],elite:'appeal',boss:{name:'끝없는 소송',icon:'⚖️',quotes:['항소합니다','상고합니다','기일 연기 신청','증거 추가 제출']}},
  hospital:{name:'대학병원 응급실',icon:'🏥',jobs:[0],acc:'#7fe0ff',pal:{bg:'#0f1514',floor:'#16201e',path:'#2c3d38',cell:'rgba(22,32,30,0.86)',cellLine:'#2e4a44',label:'#96f2d7'},
            mobs:['virus','snot'],elite:'code',boss:{name:'대유행 바이러스',icon:'🦠',quotes:['콜록콜록','손 씻으셨어요?','변이 시작','병상이 없어요']}},
  night:   {name:'야간 번화가',icon:'🌃',jobs:[5],acc:'#5c8dff',pal:{bg:'#0b0a12',floor:'#15141d',path:'#26272e',cell:'rgba(21,20,30,0.84)',cellLine:'#302a45',label:'#ff8fd1'},
            mobs:['thief','bottle'],elite:'bike',boss:{name:'밤의 괴도',icon:'🎩',quotes:['잡을 수 있으면 잡아 봐','예고장 보냈지?','오늘 밤의 보물은…','후후후']}},
  fire:    {name:'불타는 도시',icon:'🔥',jobs:[6],acc:'#ff6b2c',pal:{bg:'#140b08',floor:'#1c110d',path:'#2e211c',cell:'rgba(30,18,14,0.82)',cellLine:'#5a2a18',label:'#ffb37a'},
            mobs:['ember','smoke'],elite:'golem',boss:{name:'화염 거인',icon:'🌋',quotes:['모두 태워 주마','물? 그게 통할까','더 뜨겁게!','도시가 내 것이다']}},
  camp:    {name:'훈련소 연병장',icon:'🪖',jobs:[8],acc:'#a9e34b',pal:{bg:'#13140e',floor:'#23261a',path:'#4b4230',cell:'rgba(34,37,25,0.86)',cellLine:'#454a2e',label:'#d8f5a2'},
            mobs:['dummy','whistle'],elite:'march',boss:{name:'유격 조교',icon:'🪖',quotes:['올빼미 앞으로!','PT 체조 8번','목소리가 작다','다시!']}},
  disaster:{name:'재난 현장',icon:'🚑',jobs:[6,0],acc:'#ff8787',pal:{bg:'#140c0b',floor:'#1d1412',path:'#30231f',cell:'rgba(30,20,18,0.84)',cellLine:'#5a3028',label:'#ffa8a8'},
            mobs:['ember','smoke','virus','snot'],elite:['golem','code'],boss:{name:'복합 재난',icon:'🌪️',quotes:['불도 나고 병도 돈다','구급차가 부족해','2차 붕괴 주의','지원 요청!']}},
  emergency:{name:'비상 대책 회의',icon:'🚨',jobs:[7,8],acc:'#ff6b6b',pal:{bg:'#0d0f15',floor:'#141821',path:'#262b36',cell:'rgba(20,24,33,0.86)',cellLine:'#442a33',label:'#ff8787'},
            mobs:['ticket','missing','dummy','whistle'],elite:['angry','march'],boss:{name:'비상사태 경보',icon:'🚨',quotes:['전 부처 비상 대기','보고서 10분 안에','브리핑 다시','상황 격상!']}},
  roof:    {name:'대기업 본사 옥상',icon:'🏙️',jobs:[],acc:'#ffd43b',pal:{bg:'#070912',floor:'#10131c',path:'#2d3038',cell:'rgba(18,21,31,0.84)',cellLine:'#3a3550',label:'#ffd43b'},
            mobs:'all',elite:'all'},
};
Object.keys(THEMES).forEach(k=>THEMES[k].id=k);

// ---------------- 테마 업무 (몬스터) ----------------
// hp·spd는 기본 업무(📄=1) 대비 배율. abil: grow 점점 커짐 · haste 주변 가속 · shield 보호막 · revive 한 번 부활 · dash 돌진 · summon 부하 호출 · split 죽으면 분열
const MOBS={
  alarm:   {th:'subway',name:'지각 알람',icon:'⏰',hp:0.6,spd:1.6,size:19,q:['8시 59분!','지각이다!','삐삐삐삐']},
  backpack:{th:'subway',name:'끼어드는 백팩',icon:'🎒',hp:1.4,spd:0.85,size:22,q:['잠시만요~','안쪽으로 들어가세요','쿵']},
  rush:    {th:'subway',elite:1,name:'출근 러시',icon:'🚃',hp:5,spd:0.7,size:30,abil:'summon',desc:'지각 알람을 계속 불러옴',q:['문 닫습니다','다음 열차 3분 후']},
  bomb:    {th:'office',elite:1,name:'결재 폭탄',icon:'📑',hp:4.5,spd:0.7,size:28,abil:'split',desc:'처리하면 서류 3장으로 분열',q:['결재 부탁드려요','첨부 12건']},
  bug:     {th:'server',name:'버그',icon:'🐛',hp:0.8,spd:1.3,size:20,q:['재현이 안 돼요','내 PC에선 되는데','널 포인터']},
  alert:   {th:'server',name:'장애 알림',icon:'🚨',hp:0.45,spd:2.0,size:19,q:['P1 장애!','슬랙 알림 99+','온콜 호출']},
  leak:    {th:'server',elite:1,name:'메모리 누수 슬라임',icon:'🫧',hp:3.5,spd:0.6,size:26,abil:'grow',desc:'시간이 지날수록 커지고 단단해짐',q:['메모리 98%','GC가 안 돌아요']},
  change:  {th:'site',name:'설계 변경',icon:'📜',hp:1.2,spd:0.9,size:21,q:['여기 벽 빼 주세요','창문 하나만 더','층고 높여 주세요']},
  loud:    {th:'site',name:'민원 확성기',icon:'📢',hp:0.7,spd:1.35,size:20,q:['시끄러워요!','먼지 날려요!','일요일엔 쉬세요']},
  truck:   {th:'site',elite:1,name:'공기 지연 덤프트럭',icon:'🚛',hp:7,spd:0.45,size:31,desc:'아주 단단함',q:['자재가 안 왔어요','장마 시작']},
  ticket:  {th:'center',name:'대기 번호표',icon:'🎫',hp:0.8,spd:1.2,size:19,q:['087번 고객님','번호표 뽑으세요','제 차례 언제예요?']},
  missing: {th:'center',name:'서류 미비',icon:'📋',hp:1.3,spd:0.9,size:21,q:['인감 안 가져오셨어요?','등본 다시 떼 오세요','서명 빠졌어요']},
  angry:   {th:'center',elite:1,face:1,name:'악성 민원',icon:'😤',hp:4,spd:0.8,size:28,abil:'haste',desc:'주변 업무가 빨라짐',q:['책임자 불러!','내가 누군지 알아?']},
  receipt: {th:'tax',name:'영수증 폭풍',icon:'🧾',hp:0.5,spd:1.5,size:19,q:['간이영수증이에요','법카 내역 어디?','부가세 별도']},
  ledger:  {th:'tax',name:'누락 장부',icon:'📒',hp:1.6,spd:0.8,size:22,q:['차변 대변 안 맞아요','3원이 비어요','증빙 없음']},
  audit:   {th:'tax',elite:1,name:'세무조사',icon:'🔍',hp:3.5,spd:0.7,size:27,abil:'shield',desc:'보호막이 있음',q:['장부 제출하세요','5년치 다 봅니다']},
  suit:    {th:'court',name:'소장',icon:'📜',hp:1.0,spd:1.0,size:21,q:['피고는 답변하라','소장 접수','내용증명 보냄']},
  evidence:{th:'court',name:'증거 상자',icon:'📦',hp:1.8,spd:0.75,size:23,q:['증거 3천 쪽','목록 정리 부탁','원본 대조']},
  appeal:  {th:'court',elite:1,name:'항소',icon:'🔁',hp:3,spd:0.8,size:27,abil:'revive',desc:'처리해도 한 번 다시 살아남',q:['불복합니다','2심 갑시다']},
  virus:   {th:'hospital',name:'바이러스',icon:'🦠',hp:0.7,spd:1.3,size:20,q:['에취','열 39도','잠복기예요']},
  snot:    {th:'hospital',face:1,name:'콧물 슬라임',icon:'🤧',hp:1.4,spd:0.85,size:22,regen:0.03,q:['훌쩍','휴지 주세요','코 막혀요']},
  code:    {th:'hospital',elite:1,name:'응급 호출',icon:'🚑',hp:3,spd:1.4,size:27,abil:'dash',desc:'가끔 빠르게 돌진',q:['코드 블루!','CPR 준비']},
  thief:   {th:'night',name:'소매치기 그림자',icon:'👤',hp:0.7,spd:1.6,size:20,q:['슬쩍','지갑 어디 있지','후다닥']},
  bottle:  {th:'night',name:'굴러오는 술병',icon:'🍶',hp:1.1,spd:1.0,size:21,q:['한 잔 더!','2차 가자','딸꾹']},
  bike:    {th:'night',elite:1,name:'폭주 오토바이',icon:'🏍️',hp:3.5,spd:1.1,size:28,abil:'dash',desc:'가끔 빠르게 돌진',q:['부릉부릉','신호 무시']},
  ember:   {th:'fire',name:'불씨',icon:'🔥',hp:0.8,spd:1.25,size:20,q:['화르륵','뜨거워!','타닥타닥']},
  smoke:   {th:'fire',face:1,name:'연기 유령',icon:'👻',hp:1.2,spd:0.9,size:22,q:['콜록','앞이 안 보여','스르륵']},
  golem:   {th:'fire',elite:1,name:'불꽃 골렘',icon:'🪨',hp:5,spd:0.6,size:30,abil:'summon',desc:'불씨를 계속 낳음',q:['쿵… 쿵…','더 태워라']},
  dummy:   {th:'camp',name:'허수아비',icon:'🎯',hp:1.5,spd:0.8,size:22,q:['찔러!','각개전투','돌격 앞으로']},
  whistle: {th:'camp',name:'얼차려 호루라기',icon:'📣',hp:0.6,spd:1.5,size:19,q:['삐익!','집합!','5분 전!']},
  march:   {th:'camp',elite:1,name:'행군 50km',icon:'🥾',hp:7,spd:0.5,size:30,desc:'아주 단단함',q:['아직 40km 남았다','군장 검사']},
};
const ALL_N=Object.keys(MOBS).filter(k=>!MOBS[k].elite),ALL_E=Object.keys(MOBS).filter(k=>MOBS[k].elite);
for(const k in MOBS){MOBS[k].id=k;MOBS[k].tag=THEMES[MOBS[k].th].jobs.slice();}
const listOf=(v,all)=>v==='all'?all:Array.isArray(v)?v:v?[v]:[];

// ---------------- 스테이지 ↔ 테마 ----------------
const STAGE_THEME={'1-1':'subway','1-2':'office','1-3':'server','1-4':'site','1-5':'office',
  '2-1':'center','2-2':'tax','2-3':'court','2-4':'hospital','2-5':'night',
  '3-1':'fire','3-2':'camp','3-3':'disaster','3-4':'emergency','3-5':'roof','T-1':'fire'};
const RENAME={'1-3':'서버가 터졌다','1-4':'현장 지원','2-1':'민원 창구','2-2':'결산 시즌','2-3':'소송 마감','2-4':'응급실 지원','2-5':'번화가의 밤',
  '3-1':'불타는 도시','3-2':'훈련소 입소','3-3':'재난 현장','3-4':'비상 대책 회의'};
STAGE_THEME&&ST.STAGES.forEach(s=>{if(RENAME[s.id])s.name=RENAME[s.id];});
const CH=ST.CHAPTERS;
if(CH[0])Object.assign(CH[0],{name:'출근 첫 주',icon:'🚇',desc:'첫 직장. 지옥철을 뚫고 사무실, 서버실, 공사 현장까지'});
if(CH[1])Object.assign(CH[1],{name:'도시 한복판',icon:'🌆',desc:'회사가 커지면서 도시 곳곳의 일을 맡게 됐다'});
if(CH[2])Object.assign(CH[2],{name:'재난의 날',icon:'🔥',desc:'도시가 불타도, 회장님은 오늘도 회식을 한다'});
// 🧪 시범 스테이지 (진행도와 무관하게 항상 열림)
const TRIAL={id:'T-1',ch:CH.length+1,name:'불타는 도시 (시범)',trial:true,trialJob:6,waves:15,bossEvery:5,bosses:[0,1,0],bossHp:[10,14,16],hp:1.6,mods:[],mix:{},crunch:true,first:{bonus:200}};
if(!ST.get('T-1')){
  CH.push({id:CH.length+1,name:'시범 테마',icon:'🧪',color:'#ff6b2c',desc:'새 배경·테마 업무·직업 상성을 먼저 시험해 보는 스테이지 (진행도와 무관)',trial:true});
  TRIAL.idx=ST.STAGES.length;TRIAL.clear=Math.round(TRIAL.first.bonus*0.25);ST.STAGES.push(TRIAL);
  const ou=ST.unlocked;ST.unlocked=id=>id==='T-1'?true:ou(id);
  const on=ST.next;ST.next=()=>{const s=on();return s&&s.trial&&ST.STAGES.some(x=>!x.trial&&!(ST.stars(x.id)>0))?ST.STAGES.find(x=>!x.trial&&!(ST.stars(x.id)>0)):s;};
}
const themeOf=id=>THEMES[STAGE_THEME[id]]||null;
// 스테이지 설명: 마지막 보스를 테마 보스로
const od=ST.describe;
ST.describe=function(s){
  const D=od(s),th=themeOf(s.id);if(!th||!th.boss)return D;
  const seen=new Set(),out=[];
  s.bosses.forEach((b,i)=>{const last=i===s.bosses.length-1,name=last?th.boss.name:ST.BOSS_NAME[b];if(seen.has(name))return;seen.add(name);
    out.push({name,skill:s.skills&&s.skills[b]?ST.SKILLS[s.skills[b]]:null,theme:last});});
  D.bosses=out;return D;
};

// ---------------- 현재 테마 ----------------
let cur=null,lastEff=-9;
const KTg=()=>window.KT;
const jobCol=j=>{const J=KTg()&&KTg().JOBS;return J&&J[j]?J[j].col:'#ffffff';};
const jobName=j=>window.KTJobs?KTJobs.ALL_NAMES[j]:['의사','변호사','건축가','회계사','개발자'][j];
const jobIcon=j=>window.KTJobs?KTJobs.ALL_ICONS[j]:['🩺','⚖️','📐','🧮','💻'][j];
// 히든 직업은 두 재료 직업의 상성
function jobsOf(j){const R=window.KTRecipes;if(R&&j>=R.FIRST&&R.HIDDEN[j-R.FIRST]){const h=R.HIDDEN[j-R.FIRST];return [h.a,h.b];}return [j];}
const josa=(w,a,b)=>{const c=w.charCodeAt(w.length-1)-0xac00;return w+(c>=0&&c<11172&&c%28?a:b);};
const matches=(j,tag)=>!!tag&&tag.length>0&&jobsOf(j).some(x=>tag.includes(x));

function extendTypes(ETYPES,QUOTES){
  for(const k in MOBS){const m=MOBS[k];
    ETYPES['th_'+k]={icon:m.icon,hp:m.hp,spd:m.spd,gold:m.elite?6:1,size:m.size,regen:m.regen||0,tag:m.tag,abil:m.abil||null,elite:!!m.elite,mob:k};
    QUOTES['th_'+k]=m.q;}
}
function pickType(S,w,type){
  if(!cur)return type;
  if(S.thW!==w){S.thW=w;S.thE=0;}
  const st=S.stage;
  const el=listOf(cur.elite,ALL_E);
  if(el.length&&w>=ELITE_FROM&&st&&st.idx>=2&&S.thE<1+Math.floor(w/10)&&rnd()<ELITE_P){S.thE++;return 'th_'+pick(el);}
  if(type!=='task'&&type!=='urgent')return type;
  const ms=listOf(cur.mobs,ALL_N);
  if(ms.length&&rnd()<RATE)return 'th_'+pick(ms);
  return type;
}
function boss(S,bn){
  if(!cur||!cur.boss||!S.stage||bn!==S.stage.bosses.length-1)return null;
  return {name:cur.boss.name,icon:cur.boss.icon,quotes:cur.boss.quotes,tag:cur.jobs.slice(),tb:cur.id};
}
function onSpawn(e){e.size0=e.size;if(e.abil==='shield'){e.sh=e.maxHp*0.5;e.sh0=e.sh;}}
function preHit(e,d,o){
  const K=KTg(),S=K&&K.S;
  if(o&&o.job!=null&&matches(o.job,e.tag)){d*=BONUS;e.effT=0.3;
    if(S&&S.t-lastEff>0.7){lastEff=S.t;K.text(e.x,e.y-e.size-12,'효과 굿!','#ff922b');}}
  if(e.sh>0){const a=Math.min(e.sh,d);e.sh-=a;d-=a;
    if(e.sh<=0&&K){K.text(e.x,e.y-e.size-12,'보호막 파괴!','#74c0fc');}
    if(d<=0)e.hitT=0.12;}
  return d;
}
function spawnNear(type,e,hpMul,back){
  const K=KTg();if(!K||!K.spawnEnemy)return;
  K.spawnEnemy({type,hp:e.maxHp*hpMul});
  const S=K.S,n=S.enemies[S.enemies.length-1];n.s=Math.max(0,e.s-(back||8));const pp=K.posAt(n.s);n.x=pp[0];n.y=pp[1];
}
function onDeath(e){
  const K=KTg();
  if(e.abil==='revive'&&!e.rev){e.rev=1;e.hp=e.maxHp*0.5;if(K){K.text(e.x,e.y-e.size-12,'항소합니다!','#ffe066');K.burst(e.x,e.y,'#ffe066',10);}return true;}
  if(e.abil==='split'){const S=K&&K.S,room=S?K.CFG.maxEnemies-S.enemies.length:3;for(let k=0;k<Math.min(3,room);k++)spawnNear('task',e,0.18,4+k*12);}   // 처치했는데 업무 한도를 넘겨 지는 일이 없게
  return false;
}
function tick(S,dt){
  if(!cur)return;let add=null;
  for(const e of S.enemies){
    if(e.effT>0)e.effT-=dt;
    if(e.hp<=0||!e.abil)continue;
    if(e.abil==='grow'){if((e.gm||1)<2.2){const k=1+0.07*dt;e.gm=(e.gm||1)*k;e.maxHp*=k;e.hp*=k;e.size=Math.min(e.size0*1.5,e.size*(1+0.025*dt));}}
    else if(e.abil==='haste'){for(const o of S.enemies){if(o===e||o.boss||o.hp<=0)continue;if((o.x-e.x)**2+(o.y-e.y)**2<75*75)o.hasteT=0.2;}}   // 가속은 표시만, 실제 가속은 아래에서 한 번만
    else if(e.abil==='dash'){e.dT=(e.dT==null?2:e.dT)-dt;if(e.dT<=0){e.dashT=0.7;e.dT=3.2;}if(e.dashT>0){e.dashT-=dt;if(e.stunT<=0)e.s+=e.spd*2.2*dt;}}
    else if(e.abil==='summon'){e.smT=(e.smT==null?3:e.smT)-dt;if(e.smT<=0){e.smT=4.5;const K=KTg();if((e.kids||0)<4&&K&&S.enemies.length<K.CFG.maxEnemies*0.8){e.kids=(e.kids||0)+1;(add||(add=[])).push(e);}}}   // 부하는 최대 4마리, 업무가 많이 쌓였으면 쉼
  }
  for(const o of S.enemies)if(o.hasteT>0){if(o.stunT<=0&&o.hp>0)o.s+=o.spd*0.35*dt*(o.slowT>0?1-(o.slowV||0):1);o.hasteT-=dt;}   // 여러 마리여도 한 번만 · 둔화 반영
  if(add)for(const e of add){const m=MOBS[e.type.slice(3)],ns=listOf(THEMES[m?m.th:cur.id].mobs,ALL_N);if(ns.length)spawnNear('th_'+ns[0],e,0.12,10);}
}

// ---------------- 배경 ----------------
const W=540,H=680;
const bgCache={};
function ringClip(c){c.beginPath();c.rect(12,12,516,656);c.rect(56,56,428,568);c.clip('evenodd');}
function seeded(seed){let s=seed;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};}
function staticLayer(th){
  if(bgCache[th.id])return bgCache[th.id];
  for(const k in bgCache)delete bgCache[k];   // 지금 테마 배경만 기억 (테마 하나당 약 6MB)
  const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;const c=cv.getContext('2d');c.scale(2,2);
  const p=th.pal,r=seeded(7+th.id.length*31);
  c.fillStyle=p.bg;c.fillRect(0,0,W,H);
  c.fillStyle=p.floor;c.fillRect(56,56,428,568);
  FLOOR[th.id]&&FLOOR[th.id](c,r,th);
  // 복도
  c.save();ringClip(c);c.fillStyle=p.path;c.fillRect(0,0,W,H);PATH[th.id]&&PATH[th.id](c,r,th);c.restore();
  // 복도 가장자리
  c.strokeStyle='rgba(0,0,0,0.45)';c.lineWidth=2;c.strokeRect(12,12,516,656);c.strokeRect(56,56,428,568);
  EDGE[th.id]&&EDGE[th.id](c,r,th);
  PROPS[th.id]&&PROPS[th.id](c,r,th);
  // 가장자리 그늘
  const g=c.createRadialGradient(W/2,H/2,200,W/2,H/2,460);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.45)');c.fillStyle=g;c.fillRect(0,0,W,H);
  return bgCache[th.id]=cv;
}
// 작은 그리기 도구
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
function dashLine(c,col,w,dash,x1,y1,x2,y2){c.strokeStyle=col;c.lineWidth=w;c.setLineDash(dash);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.setLineDash([]);}
function ringRect(c,inset,col,w,dash){c.strokeStyle=col;c.lineWidth=w;if(dash)c.setLineDash(dash);c.strokeRect(12+inset,12+inset,516-inset*2,656-inset*2);c.setLineDash([]);}
function grid(c,x,y,w,h,s,col){c.strokeStyle=col;c.lineWidth=1;c.beginPath();for(let i=x;i<=x+w;i+=s){c.moveTo(i,y);c.lineTo(i,y+h);}for(let j=y;j<=y+h;j+=s){c.moveTo(x,j);c.lineTo(x+w,j);}c.stroke();}
function noise(c,r,n,col,x,y,w,h,sz){c.fillStyle=col;for(let i=0;i<n;i++)c.fillRect(x+r()*w,y+r()*h,sz||1.5,sz||1.5);}
function cracks(c,r,n,col,lw){c.strokeStyle=col;c.lineWidth=lw||1.2;for(let i=0;i<n;i++){let x=r()*W,y=r()*H;c.beginPath();c.moveTo(x,y);for(let k=0;k<5;k++){x+=(r()-0.5)*30;y+=(r()-0.5)*30;c.lineTo(x,y);}c.stroke();}}
// 안쪽 여백(복도와 칸 사이) 둘레를 따라 일정 간격으로 소품을 찍음
function along(c,step,fn){for(let x=70;x<=470;x+=step){fn(x,67,0);fn(x,615,2);}for(let y=90;y<=600;y+=step){fn(67,y,3);fn(473,y,1);}}
const FLOOR={
  subway(c,r){grid(c,56,56,428,568,28,'rgba(255,255,255,0.035)');},
  office(c,r){for(let y=56;y<624;y+=6)R(c,56,y,428,1,'rgba(255,255,255,0.018)');},
  server(c,r){grid(c,56,56,428,568,24,'rgba(77,171,247,0.06)');},
  site(c,r){noise(c,r,900,'rgba(255,255,255,0.03)',56,56,428,568);c.save();c.beginPath();c.rect(56,56,428,568);c.clip();cracks(c,r,18,'rgba(0,0,0,0.35)');c.restore();},
  center(c,r){grid(c,56,56,428,568,32,'rgba(255,255,255,0.04)');},
  tax(c,r){for(let y=56;y<624;y+=14)R(c,56,y,428,1,'rgba(255,220,180,0.03)');},
  court(c,r){for(let x=56;x<484;x+=18)R(c,x,56,1,568,'rgba(255,200,150,0.04)');},
  hospital(c,r){grid(c,56,56,428,568,30,'rgba(150,242,215,0.05)');},
  night(c,r){grid(c,56,56,428,568,36,'rgba(255,255,255,0.03)');},
  fire(c,r){noise(c,r,700,'rgba(0,0,0,0.3)',56,56,428,568,2);c.save();c.beginPath();c.rect(56,56,428,568);c.clip();cracks(c,r,7,'rgba(255,90,30,0.12)',1.2);c.restore();},
  camp(c,r){noise(c,r,1200,'rgba(169,227,75,0.06)',56,56,428,568,2);},
  disaster(c,r){FLOOR.fire(c,r);},
  emergency(c,r){grid(c,56,56,428,568,26,'rgba(255,107,107,0.05)');},
  roof(c,r){noise(c,r,160,'rgba(255,255,255,0.5)',56,56,428,568,1);},
};
const PATH={
  subway(c,r){grid(c,0,0,W,H,22,'rgba(0,0,0,0.25)');},
  office(c,r){for(let i=0;i<W+H;i+=8){c.strokeStyle='rgba(255,255,255,0.025)';c.beginPath();c.moveTo(i,0);c.lineTo(i-H,H);c.stroke();}},
  server(c,r){grid(c,12,12,516,656,22,'rgba(0,0,0,0.45)');for(let x=12;x<528;x+=22)for(let y=12;y<668;y+=22){R(c,x+4,y+4,2,2,'rgba(255,255,255,0.08)');R(c,x+16,y+16,2,2,'rgba(255,255,255,0.08)');}},
  site(c,r){noise(c,r,2200,'rgba(0,0,0,0.25)',0,0,W,H,2);noise(c,r,700,'rgba(255,220,160,0.08)',0,0,W,H,2);
    ringRect(c,14,'rgba(0,0,0,0.25)',5,[3,4]);ringRect(c,30,'rgba(0,0,0,0.25)',5,[3,4]);},
  center(c,r){grid(c,12,12,516,656,22,'rgba(0,0,0,0.18)');},
  tax(c,r){for(let i=12;i<668;i+=9)R(c,0,i,W,1,'rgba(0,0,0,0.35)');for(let i=0;i<120;i++){R(c,r()*W,r()*H,1,9,'rgba(0,0,0,0.3)');}},
  court(c,r){cracks(c,r,40,'rgba(255,255,255,0.08)',0.8);ringRect(c,22,'#6b1d27',16);ringRect(c,15,'rgba(244,197,66,0.5)',1);ringRect(c,29,'rgba(244,197,66,0.5)',1);},
  hospital(c,r){grid(c,12,12,516,656,22,'rgba(0,0,0,0.15)');ringRect(c,17,'#2f9e44',2);ringRect(c,22,'#fab005',2);ringRect(c,27,'#1c7ed6',2);},
  night(c,r){noise(c,r,1600,'rgba(255,255,255,0.05)',0,0,W,H,1.5);ringRect(c,22,'rgba(255,255,255,0.35)',2,[14,12]);
    // 모서리 횡단보도
    c.fillStyle='rgba(255,255,255,0.32)';for(const [x,y] of [[12,12],[484,12],[12,624],[484,624]])for(let k=0;k<5;k++)c.fillRect(x+4+k*8,y+4,4,36);},
  fire(c,r){noise(c,r,1600,'rgba(0,0,0,0.35)',0,0,W,H,2);cracks(c,r,55,'rgba(255,120,40,0.55)',1.6);cracks(c,r,30,'rgba(255,200,80,0.35)',0.8);},
  camp(c,r){noise(c,r,2000,'rgba(0,0,0,0.22)',0,0,W,H,2);
    for(let i=0;i<70;i++){const x=12+r()*516,y=12+r()*656;c.fillStyle='rgba(0,0,0,0.3)';c.beginPath();c.ellipse(x,y,2.2,3.6,0,0,Math.PI*2);c.fill();}},
  disaster(c,r){PATH.fire(c,r);},
  emergency(c,r){grid(c,12,12,516,656,22,'rgba(0,0,0,0.3)');},
  roof(c,r){noise(c,r,1600,'rgba(0,0,0,0.25)',0,0,W,H,2);ringRect(c,22,'rgba(255,212,59,0.45)',2,[6,10]);},
};
const EDGE={
  subway(c){ringRect(c,40,'#f2c94c',4);c.fillStyle='rgba(0,0,0,0.35)';for(let x=56;x<484;x+=6)c.fillRect(x,52,2,2);ringRect(c,1,'#2a63c8',3);},
  site(c){c.save();c.beginPath();c.rect(52,52,436,576);c.rect(56,56,428,568);c.clip('evenodd');for(let i=-700;i<700;i+=10){c.fillStyle=(i/10)%2?'#ffd43b':'#1a1a1a';c.beginPath();c.moveTo(i,0);c.lineTo(i+5,0);c.lineTo(i+5+H,H);c.lineTo(i+H,H);c.closePath();c.fill();}c.restore();},
  center(c){c.fillStyle='#adb5bd';for(let x=70;x<=470;x+=50){c.fillRect(x-1.5,50,3,10);}c.strokeStyle='#e03131';c.lineWidth=1.5;c.beginPath();c.moveTo(70,52);c.lineTo(470,52);c.stroke();},
  hospital(c){ringRect(c,40,'rgba(150,242,215,0.35)',2);},
  emergency(c){ringRect(c,40,'#c92a2a',2);},
  fire(c){ringRect(c,40,'rgba(255,107,44,0.4)',2);},
};
const PROPS={
  subway(c){along(c,64,(x,y,s)=>{if(s===0||s===2){R(c,x-12,y-5,24,10,'#1f3b73');R(c,x-10,y-3,20,6,'#e9ecef');R(c,x-8,y-2,6,4,'#ff6b6b');}else{R(c,x-3,y-10,6,20,'#495057');R(c,x-2,y-8,4,4,'#74c0fc');}});},
  office(c){along(c,90,(x,y)=>{c.fillStyle='#2b8a3e';c.beginPath();c.arc(x,y-2,5,0,Math.PI*2);c.fill();R(c,x-3,y+2,6,5,'#8a5a2b');});},
  server(c){along(c,24,(x,y,s)=>{R(c,x-6,y-7,12,14,'#1c222c');R(c,x-5,y-6,10,1,'#2f3a4a');R(c,x-5,y-2,10,1,'#2f3a4a');R(c,x-5,y+2,10,1,'#2f3a4a');});},
  site(c){along(c,70,(x,y)=>{c.fillStyle='#ff922b';c.beginPath();c.moveTo(x,y-8);c.lineTo(x+5,y+5);c.lineTo(x-5,y+5);c.closePath();c.fill();R(c,x-3,y-2,6,2,'#fff');R(c,x-6,y+5,12,2,'#343a40');});},
  center(c){along(c,80,(x,y)=>{R(c,x-8,y-4,16,8,'#495057');R(c,x-6,y-2,12,4,'#212529');});},
  tax(c){along(c,46,(x,y)=>{for(let k=0;k<4;k++)R(c,x-7+k%2,y+4-k*3,14,3,k%2?'#f1f3f5':'#dee2e6');});},
  court(c){for(const [x,y] of [[56,56],[484,56],[56,624],[484,624]]){R(c,x-8,y-8,16,16,'#d9d4c7');R(c,x-6,y-6,12,12,'#f1ece0');}},
  hospital(c){along(c,72,(x,y,s)=>{R(c,x-9,y-5,18,10,'#e7f5ff');R(c,x-9,y-5,5,10,'#a5d8ff');R(c,x+5,y-1,3,2,'#ff6b6b');});},
  night(c){along(c,84,(x,y)=>{R(c,x-1,y-9,2,16,'#495057');});},
  fire(c,r){along(c,58,(x,y)=>{R(c,x-7,y-3,14,6,'#2b1d18');R(c,x-5,y-1,4,3,'#3a2a22');});},
  camp(c){along(c,76,(x,y)=>{c.strokeStyle='#1a1a1a';c.lineWidth=3;c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.stroke();});
    c.strokeStyle='#868e96';c.lineWidth=1;for(let x=14;x<526;x+=8){c.beginPath();c.moveTo(x,6);c.lineTo(x+4,10);c.lineTo(x+8,6);c.stroke();}},
  disaster(c,r){PROPS.fire(c,r);},
  emergency(c){along(c,96,(x,y,s)=>{R(c,x-11,y-6,22,12,'#1c2a44');R(c,x-9,y-4,18,8,'#1971c2');});},
  roof(c){c.strokeStyle='rgba(255,212,59,0.6)';c.lineWidth=2;c.beginPath();c.arc(506,646,30,Math.PI,Math.PI*1.5);c.stroke();
    c.fillStyle='rgba(255,212,59,0.6)';c.font=`bold 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('H',490,630);},
};
// 움직이는 조명 (배경 위, 직원 아래)
function lights(c,th,t){
  const id=th.id;
  if(id==='server'){for(let i=0;i<60;i++){const on=Math.sin(t*3+i*2.7)>0.2;if(!on)continue;const p=i/60;let x,y;
      if(p<0.25){x=70+p*4*400;y=64;}else if(p<0.5){x=473;y=90+(p-0.25)*4*500;}else if(p<0.75){x=470-(p-0.5)*4*400;y=612;}else{x=67;y=600-(p-0.75)*4*500;}
      c.fillStyle=i%3?'#51cf66':'#4dabf7';c.fillRect(x-1,y-1,2,2);}}
  else if(id==='night'||id==='disaster'){const a=(Math.sin(t*5)+1)/2;
    c.fillStyle=id==='night'?`rgba(92,141,255,${0.10*a})`:`rgba(255,255,255,${0.06*a})`;c.fillRect(0,0,W/2,H);
    c.fillStyle=`rgba(255,77,77,${0.10*(1-a)})`;c.fillRect(W/2,0,W/2,H);
    if(id==='night'){for(let i=0;i<6;i++){const fl=Math.sin(t*(7+i)+i)>-0.6;if(!fl)continue;const x=80+i*76,y=i%2?44:636;c.fillStyle=i%2?'rgba(255,79,216,0.8)':'rgba(32,201,255,0.8)';c.fillRect(x,y-2,26,4);}}}
  else if(id==='fire'){const f=0.75+0.25*Math.sin(t*9)*Math.sin(t*5.3);
    const g=c.createLinearGradient(0,H,0,H*0.35);g.addColorStop(0,`rgba(255,90,20,${0.22*f})`);g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
    for(let i=0;i<5;i++){const x=(i*131+40)%W,y=(i%2?60:620),rr=30+10*Math.sin(t*6+i);const gg=c.createRadialGradient(x,y,2,x,y,rr);gg.addColorStop(0,`rgba(255,160,60,${0.35*f})`);gg.addColorStop(1,'rgba(255,80,20,0)');c.fillStyle=gg;c.fillRect(x-rr,y-rr,rr*2,rr*2);}}
  else if(id==='hospital'){const a=Math.max(0,Math.sin(t*4));for(const [x,y] of [[34,34],[506,34],[34,646],[506,646]]){const g=c.createRadialGradient(x,y,1,x,y,40);g.addColorStop(0,`rgba(255,60,60,${0.35*a})`);g.addColorStop(1,'rgba(255,60,60,0)');c.fillStyle=g;c.fillRect(x-40,y-40,80,80);}}
  else if(id==='emergency'){const a=(Math.sin(t*3)+1)/2;c.fillStyle=`rgba(255,40,40,${0.07*a})`;c.fillRect(0,0,W,H);}
  else if(id==='center'){c.fillStyle='#1a0505';c.fillRect(250,2,40,9);c.fillStyle='#ff4d4d';c.font=`bold 8px monospace`;c.textAlign='center';c.textBaseline='middle';c.fillText(String(87+Math.floor(t/4)%900).padStart(3,'0'),270,7);}
  else if(id==='subway'){const p=(t%9)/9;if(p<0.25){const x=-200+p*4*(W+400);c.fillStyle='rgba(116,192,252,0.18)';c.fillRect(x,0,200,10);}}
  else if(id==='roof'){for(let i=0;i<30;i++){const a=0.3+0.7*Math.abs(Math.sin(t*1.3+i*1.7));c.fillStyle=`rgba(255,255,255,${a*0.5})`;c.fillRect((i*97)%W,(i*53)%60,1.5,1.5);}
    if(Math.sin(t*4)>0.6){c.fillStyle='#ff4d4d';c.fillRect(526,4,4,4);}}
  else if(id==='office'){const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(255,214,140,0.06)');g.addColorStop(0.5,'rgba(255,214,140,0)');c.fillStyle=g;c.fillRect(0,0,W,H);}
}
function bg(c,G){
  if(!cur)return false;const th=cur,t=performance.now()/1000;
  c.drawImage(staticLayer(th),-12,-12,W+24,H+24);   // 흔들림 여유
  c.drawImage(staticLayer(th),0,0,W,H);
  // 그림 파일(있으면)
  const A=window.KTAssets,fl=A&&A.get('bg/'+th.id+'_floor');
  if(fl){c.save();ringClip(c);const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;c.fillStyle=c.createPattern(fl,'repeat');c.fillRect(0,0,W,H);c.imageSmoothingEnabled=sm;c.restore();}
  if(A)for(let k=1;k<=3;k++){const im=A.get('bg/'+th.id+'_prop'+k);if(im){const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;for(const [x,y] of PROP_SPOTS[k-1])c.drawImage(im,x-16,y-16,32,32);c.imageSmoothingEnabled=sm;}}
  lights(c,th,t);
  c.fillStyle=th.pal.label;c.font=`bold 11px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText('입구 ▶',G.P.l+16,G.P.t);
  c.globalAlpha=0.55;c.textAlign='right';c.fillText(`${th.icon} ${th.name}`,G.P.r-10,G.P.b);c.globalAlpha=1;
  return true;
}
const PROP_SPOTS=[[[34,34],[506,646]],[[506,34],[34,646]],[[34,340],[506,340]]];
function cellDeco(c,r){
  const A=window.KTAssets,im=cur&&A&&A.get('bg/'+cur.id+'_cell');if(!im)return;
  c.save();c.clip();const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;c.globalAlpha=0.9;c.drawImage(im,r.x,r.y,r.w,r.h);c.imageSmoothingEnabled=sm;c.restore();
}
// 날씨 (직원·업무 위, 이펙트 아래)
function overlay(c){
  if(!cur)return;const id=cur.id,t=performance.now()/1000;
  if(id==='fire'||id==='disaster'){
    for(let i=0;i<34;i++){const sp=40+(i*37)%50,x=(i*83+Math.sin(t*1.5+i)*14+W)%W,y=H-((t*sp+i*97)%(H+40));const a=0.5+0.5*Math.sin(t*8+i);
      c.fillStyle=`rgba(255,${150+(i*13)%90},60,${0.55*a})`;c.fillRect(x,y,2,2);}
    for(let i=0;i<5;i++){const x=((t*12+i*130)%(W+160))-80,y=120+i*110;const g=c.createRadialGradient(x,y,4,x,y,70);g.addColorStop(0,'rgba(40,30,30,0.16)');g.addColorStop(1,'rgba(40,30,30,0)');c.fillStyle=g;c.fillRect(x-70,y-70,140,140);}}
  else if(id==='site'||id==='camp'){for(let i=0;i<22;i++){const x=((t*(18+i%5*6)+i*71)%(W+20))-10,y=(i*61+Math.sin(t+i)*10)%H;c.fillStyle='rgba(230,210,160,0.12)';c.fillRect(x,y,3,3);}}
  else if(id==='server'){c.fillStyle='rgba(77,171,247,0.03)';c.fillRect(0,0,W,H);}
}

// ---------------- 테마 업무 그리기 ----------------
function hexA(hex,a){if(hex[0]!=='#')return hex;const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;}
function drawEnemy(c,e,t){
  const key=e.type&&e.type.startsWith('th_')?e.type.slice(3):null;
  if(!(e.boss&&e.tb)&&!key)return false;
  const m=key?MOBS[key]:null,th=e.boss?THEMES[e.tb]:THEMES[m.th];
  const sz=e.size,ph=(e.ph||0)+t*9;
  // 발밑: 담당 직업 색 고리
  c.save();c.translate(e.x,e.y);
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,sz*0.5,sz*0.55,sz*0.18,0,0,Math.PI*2);c.fill();
  if(e.tag&&e.tag.length){const pulse=e.effT>0?1:0.55+0.25*Math.sin(t*4+e.ph);
    e.tag.forEach((j,k)=>{c.strokeStyle=hexA(jobCol(j),pulse);c.lineWidth=e.effT>0?2.6:1.8;c.beginPath();c.ellipse(0,sz*0.5,sz*(0.62+k*0.14),sz*(0.21+k*0.05),0,0,Math.PI*2);c.stroke();});}
  if(e.boss){
    c.save();c.rotate(t*0.7);c.fillStyle=hexA(th.acc,0.16);for(let k=0;k<8;k++){c.rotate(Math.PI/4);c.beginPath();c.moveTo(0,0);c.lineTo(-5,-sz*1.25);c.lineTo(5,-sz*1.25);c.closePath();c.fill();}c.restore();
    const g=c.createRadialGradient(0,-2,4,0,-2,sz*1.05);g.addColorStop(0,hexA(th.acc,0.45));g.addColorStop(1,hexA(th.acc,0));c.fillStyle=g;c.beginPath();c.arc(0,-2,sz*1.05,0,Math.PI*2);c.fill();
  }else if(m.elite){
    const g=c.createRadialGradient(0,-2,3,0,-2,sz*0.95);g.addColorStop(0,'rgba(255,80,80,0.42)');g.addColorStop(1,'rgba(255,80,80,0)');c.fillStyle=g;c.beginPath();c.arc(0,-2,sz*0.95,0,Math.PI*2);c.fill();
    c.strokeStyle='rgba(255,212,59,0.75)';c.lineWidth=1.4;c.setLineDash([4,4]);c.lineDashOffset=-t*20;c.beginPath();c.arc(0,-2,sz*0.72,0,Math.PI*2);c.stroke();c.setLineDash([]);
  }
  c.restore();
  // 그림 파일이 있으면 그림으로
  const A=window.KTAssets,id=e.boss?'boss_'+e.tb:key;
  if(A&&A.mob(c,id,e.x,e.y,sz,t,e.ph)){
    if(e.hitT>0){c.save();c.globalAlpha=Math.min(0.45,e.hitT*4);c.fillStyle='#fff';c.beginPath();c.arc(e.x,e.y-sz*0.1,sz*0.55,0,Math.PI*2);c.fill();c.restore();}   // 맞을 때 하얗게 번쩍
  }else{
    c.save();c.translate(e.x,e.y);let s=1;if(e.hitT>0)s*=1+e.hitT*0.8;
    if(e.dashT>0)c.translate(Math.sin(t*40)*1.2,0);
    const bob=-Math.abs(Math.sin(ph*0.5))*2;
    // 다리
    if(!e.boss){c.strokeStyle='#2a2a2a';c.lineWidth=2;c.lineCap='round';const a=Math.sin(ph)*3.5*sz/22;
      c.beginPath();c.moveTo(-sz*0.18,sz*0.25);c.lineTo(-sz*0.18-a,sz*0.48);c.moveTo(sz*0.18,sz*0.25);c.lineTo(sz*0.18+a,sz*0.48);c.stroke();}
    c.translate(0,bob);c.scale(s,s);
    // 몸판 (테마 색)
    c.fillStyle=hexA(th.acc,e.boss?0.32:0.26);c.beginPath();c.ellipse(0,-1,sz*0.5,sz*0.46,0,0,Math.PI*2);c.fill();
    c.font=`${Math.round(sz*(e.boss?0.95:0.88))}px ${EMOJI}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';
    c.fillText(e.boss?e.icon:m.icon,0,-1);
    // 화난 눈썹 (사물형 업무에 표정)
    if(e.boss||!m.face){c.strokeStyle='#1b1b1b';c.lineWidth=1.6;c.beginPath();c.moveTo(-sz*0.32,-sz*0.4);c.lineTo(-sz*0.1,-sz*0.3);c.moveTo(sz*0.32,-sz*0.4);c.lineTo(sz*0.1,-sz*0.3);c.stroke();}
    if(e.hitT>0){c.globalAlpha=Math.min(0.45,e.hitT*4);c.fillStyle='#fff';c.beginPath();c.arc(0,-1,sz*0.55,0,Math.PI*2);c.fill();c.globalAlpha=1;}
    c.restore();
  }
  // 보호막 · 정예 표시
  c.save();c.translate(e.x,e.y);
  if(e.sh>0){c.strokeStyle=`rgba(116,192,252,${0.5+0.3*Math.sin(t*6)})`;c.lineWidth=2;c.beginPath();c.arc(0,-2,sz*0.68,0,Math.PI*2);c.stroke();
    c.fillStyle='rgba(116,192,252,0.12)';c.fill();}
  if(e.hasteT>0&&!e.boss){c.fillStyle='rgba(255,146,43,0.9)';c.font=`bold 9px ${FONT}`;c.textAlign='center';c.fillText('»',-sz*0.7,0);}
  if(m&&m.elite){c.font=`${Math.round(sz*0.42)}px ${EMOJI}`;c.textAlign='center';c.textBaseline='middle';c.fillText('⭐',sz*0.5,-sz*0.62);}
  if(e.effT>0){c.globalAlpha=Math.min(1,e.effT*4);c.strokeStyle='#ff922b';c.lineWidth=2;c.beginPath();c.arc(0,-2,sz*(0.6+(0.3-e.effT)),0,Math.PI*2);c.stroke();c.globalAlpha=1;}
  c.restore();
  return true;
}

// ---------------- 게임 시작 연결 ----------------
function hookStart(){
  const K=KTg();if(!K||K._th13)return;K._th13=true;const orig=K.start;
  K.start=function(o){
    o=o||{};const st=o.stage||null;cur=st?themeOf(st.id):null;lastEff=-9;
    if(st&&st.trial&&st.trialJob!=null){const d=(o.deck&&o.deck.length===5?o.deck:[0,1,2,3,4]).slice();if(!d.includes(st.trialJob))d[4]=st.trialJob;o=Object.assign({},o,{deck:d});}
    const r=orig.call(this,o);
    const S=K.S;if(cur&&S&&S.banner){const js=cur.jobs.map(j=>jobIcon(j)+' '+jobName(j)).join(' · ');
      S.banner.sub=`${cur.icon} ${cur.name}${js?' · 추천 '+js:''}${st.trial?' (임시 편성)':''}`;}
    return r;
  };
}

// ---------------- 로비: 스테이지 정보 · 지도 ----------------
const css=`.th-box{border:1px solid var(--tc);border-radius:14px;padding:10px 12px;margin:4px 0 10px;background:linear-gradient(135deg,color-mix(in srgb,var(--tc) 18%,transparent),transparent 70%)}
.th-box>b{font-size:15px;display:block;margin-bottom:3px}
.th-box .th-rec{font-size:13px;color:#ffd8a8;margin-bottom:6px}
.th-box .th-mobs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.th-box .th-mobs span{font-size:11px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:2px 6px;color:#cfd4de}
.th-box .th-mobs span.e{border-color:#ff8787;color:#ffc9c9}.th-box .th-mobs span.b{border-color:#ffd43b;color:#ffe8a3}
.th-deck{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px}
.th-deck.ok{color:#8ce99a}.th-deck.no{color:#ffa8a8}
.th-deck .kt-btn{padding:5px 10px;font-size:12px}
.sm-ch.th-trial{border-style:dashed}`;
const stEl=document.createElement('style');stEl.textContent=css;document.head.appendChild(stEl);
function infoHtml(s){
  const th=themeOf(s.id);if(!th)return '';
  const PG=window.KTProg,deck=PG?PG.deck():[0,1,2,3,4];
  const rec=th.jobs.map(j=>`${jobIcon(j)} <b>${jobName(j)}</b>`).join(' · ');
  const ns=listOf(th.mobs,[]).map(k=>MOBS[k]),es=listOf(th.elite,[]).map(k=>MOBS[k]);
  const mobs=th.mobs==='all'?'<span>모든 테마 업무가 섞여 나와요 — 직업마다 상대하기 좋은 업무가 있어요</span>':
    ns.map(m=>`<span>${m.icon} ${m.name}</span>`).join('')+(s.idx>=2?es.map(m=>`<span class="e">${m.icon} ${m.name} · 정예${m.desc?' — '+m.desc:''}</span>`).join(''):'')+(th.boss?`<span class="b">${th.boss.icon} ${th.boss.name} · 최종 보스</span>`:'');
  let dk='';
  if(th.jobs.length){
    if(s.trial)dk=`<div class="th-deck ok">🧪 시범 스테이지: ${jobIcon(s.trialJob)} ${josa(jobName(s.trialJob),'이','가')} 임시로 편성돼요</div>`;
    else{const inDeck=th.jobs.filter(j=>deck.includes(j)),locked=th.jobs.filter(j=>PG&&!PG.unlocked(j));
      dk=inDeck.length?`<div class="th-deck ok">✅ 편성에 ${inDeck.map(jobName).join('·')} 있음</div>`:
        `<div class="th-deck no"><span>⚠️ 추천 직원이 편성에 없어요${locked.length?` (${locked.map(j=>jobName(j)+' Lv.'+PG.unlockLv(j)).join(', ')} 해금)`:''}</span>${locked.length===th.jobs.length?'':'<button class="kt-btn" data-th-deck>직원 편성</button>'}</div>`;}
  }
  return `<div class="th-box" style="--tc:${th.acc}"><b>${th.icon} ${th.name}</b>
    <div class="th-rec">${rec?`추천 직원 ${rec} — 테마 업무에 피해 <b>+25%</b>`:'추천 직원 없음 — 누구를 데려가도 괜찮아요'}</div>
    <div class="th-mobs">${mobs}</div>${dk}</div>`;
}
function onDom(){
  const ft=document.getElementById('lb-foot');if(ft&&/^v1[0-2]\b/.test(ft.innerHTML))ft.innerHTML=ft.innerHTML.replace(/^v1[0-2]/,'v13');
  // 스테이지 정보
  document.querySelectorAll('.si-top:not([data-th])').forEach(top=>{
    top.dataset.th='1';const h=top.querySelector('h2');if(!h)return;const id=h.textContent.trim().split(' ')[0];const s=ST.get(id);if(!s)return;
    const html=infoHtml(s);if(!html)return;
    const stats=top.parentNode.querySelector('.kt-stats');const box=document.createElement('div');box.innerHTML=html;
    (stats||top).after(box.firstChild);
    if(s.trial)top.parentNode.querySelectorAll('p.kt-muted').forEach(p=>{if(p.textContent.includes('권장 강화'))p.remove();});
    const b=top.parentNode.querySelector('[data-th-deck]');
    if(b)b.onclick=()=>{const m=top.closest('.kt-modal');if(m)m.remove();if(window.KTLobby&&KTLobby.deckScreen)KTLobby.deckScreen();};
  });
  // 지도: 시범 챕터를 맨 위로
  document.querySelectorAll('.sm-sheet:not([data-th])').forEach(sh=>{
    sh.dataset.th='1';const node=sh.querySelector('[data-s="T-1"]');if(!node)return;const chd=node.closest('.sm-ch');const h2=sh.querySelector('h2');
    if(chd&&h2){chd.classList.add('th-trial');const lb=chd.querySelector('.sm-h b');if(lb)lb.textContent='시범 테마 · 불타는 도시';node.querySelector('b').textContent='🔥';h2.after(chd);}
  });
}
let domQ=0;new MutationObserver(()=>{if(domQ)return;domQ=requestAnimationFrame(()=>{domQ=0;onDom();});}).observe(document.documentElement,{childList:true,subtree:true});   // 한 프레임에 한 번만

window.KTThemes={THEMES,MOBS,STAGE_THEME,BONUS,RATE,
  get cur(){return cur;},set cur(v){cur=typeof v==='string'?THEMES[v]||null:v;},
  themeOf,matches,jobsOf,extendTypes,pickType,boss,onSpawn,preHit,onDeath,tick,bg,cellDeco,overlay,drawEnemy,hookStart,infoHtml};
})();
