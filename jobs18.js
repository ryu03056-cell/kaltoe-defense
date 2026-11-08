// 칼퇴 디펜스 — 새 직업 v18: 기자 · 요리사 · 택배기사 (게임 직업 9·10·11번)
// jobs10.js 의 신규 직업 목록(NEW_JOBS)에 이어 붙임 → 게임이 시작할 때 jobs10 이 함께 추가함
//   그래서 히든 직업 시작 번호가 9 → 12 로 밀림 (recipes12 FIRST 가 이 목록 길이로 계산)
// 그림: pixel/{reporter|chef|courier}_{0~4}.png (PixelLab) — 없으면 임시 그림(동그라미 + 아이콘)
// 반드시 jobs10.js 다음, lobby10·recipes12 앞에서 불러옴
(function(){
'use strict';
const J=window.KTJobs;if(!J||J._v18)return;J._v18=true;
const ADD=[
  {key:'reporter',name:'기자',icon:'📰',dmg:9,cd:0.8,range:210,col:'#ffd43b',projAs:7,ultAs:5,
   desc:'한 번에 2명 공격 · 20% 확률 특종(받는 피해 +15%)',multi:2,mark:{p:0.2,v:0.15,t:2.5},
   ranks:['수습기자','기자','차장 기자','부장 기자','언론사 사장']},
  {key:'chef',name:'요리사',icon:'🧑‍🍳',dmg:10,cd:1.0,range:170,col:'#ff922b',projAs:6,ultAs:6,
   desc:'뜨거운 범위 공격 · 매운맛 둔화',splash:55,slow:{v:0.3,t:1.2},
   ranks:['견습 요리사','요리사','수셰프','총괄 셰프','미쉐린 셰프']},
  {key:'courier',name:'택배기사',icon:'📦',dmg:6,cd:0.45,range:200,col:'#74c0fc',projAs:3,ultAs:8,
   desc:'아주 빠른 공격 · 상자로 밀어냄',knock:12,
   ranks:['택배 알바','택배기사','배송 팀장','물류 소장','택배 회장']},
];
const MYTH=[
  {multi:4,mark:{p:0.5,v:0.3,t:3},shout:'단독 특종!',desc:'한 번에 4명 공격 · 50% 특종(+30% 피해)'},
  {splash:85,slow:{v:0.5,t:2},shout:'오늘의 특선!',desc:'초대형 범위 공격 · 강한 둔화'},
  {knock:28,multi:2,shout:'총알 배송!',desc:'아주 빠른 2연속 공격 · 강하게 밀어냄'},
];
const PROF=[
  {name:'한특종',gender:'여',mbti:'ENTP',like:'마감 5분 전, 단독 기사',dislike:'"오프 더 레코드인데요…"',
   bio:'수습 시절 취재 수첩만 7권을 채운 그녀. 업무 폭탄의 약점을 기사 한 줄로 까발린다.',titles:ADD[0].ranks,
   quotes:[['취재 나갑니다!','팩트 체크 중'],['단독입니다','제보 감사합니다'],['데스크 넘겼어요','속보 들어갑니다'],['1면 바꿉시다','편집국 비상!'],['진실은 결국 나옵니다','특종입니다!']],
   skill:'2명 동시 공격 · 특종(받는 피해 증가) · 최고 직급: 4명 동시'},
  {name:'백불맛',gender:'남',mbti:'ESFP',like:'불 맛, 주방의 소음',dislike:'"싱거워요"',
   bio:'견습 시절 양파만 3년 썰었다. 지금은 프라이팬 한 번에 업무를 볶아 버린다.',titles:ADD[1].ranks,
   quotes:[['양파 썰게요!','불 올립니다'],['간 맞췄습니다','주문 들어왔어요'],['오늘 메뉴 짭니다','라인 정리!'],['코스 나갑니다','주방 장악!'],['별 3개 받았습니다','오늘의 특선!']],
   skill:'범위 공격 + 둔화 · 최고 직급: 초대형 범위 + 강한 둔화'},
  {name:'신속배',gender:'남',mbti:'ISTP',like:'엘리베이터 바로 오는 날',dislike:'"부재중이라 문 앞에 두세요"',
   bio:'하루 300개 배송 기록 보유자. 업무를 상자에 담아 저 멀리 밀어 버린다.',titles:ADD[2].ranks,
   quotes:[['배송 출발!','문 앞에 둘게요'],['오늘 300개요','빠른 배송!'],['동선 다시 짭니다','물량 폭탄이네'],['허브 터미널 가동!','전국 당일 배송'],['총알 배송합니다','택배는 사랑입니다']],
   skill:'아주 빠른 공격 + 밀어내기 · 최고 직급: 2연속 공격'},
];
const start=J.NEW_JOBS.length;   // 4 (경찰~군인) → 이 뒤에 붙임
ADD.forEach((a,i)=>{J.NEW_JOBS.push(a);J.NEW_MYTH.push(MYTH[i]);J.ALL_NAMES.push(a.name);J.ALL_ICONS.push(a.icon);J.PROFILES.push(PROF[i]);});
if(window.KTProfiles&&window.KTProfiles.length===5+start)PROF.forEach(p=>window.KTProfiles.push(p));
const FIRST_NEW=5+start;          // 게임 직업 번호 9
// 그림 파일이 아직 없을 때 임시 그림 (assets13 이 그림 파일을 먼저 씀)
const GC=['#a3abb9','#4aa3ff','#b875ff','#ff9a2e','#ff4d8d'];
function temp(c,j,g,t,big){
  const a=ADD[j-FIRST_NEW];
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23,12,3,0,0,Math.PI*2);c.fill();
  c.fillStyle=a.col;c.beginPath();c.ellipse(0,6,12,16,0,0,Math.PI*2);c.fill();
  c.strokeStyle=GC[g];c.lineWidth=2;c.stroke();
  c.font='18px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(a.icon,0,4);
}
const P=window.KTChars;
if(P){window.KTChars=Object.assign({},P,{
  draw(c,j,g,x,y,s,t,col){if(j<FIRST_NEW||j>=FIRST_NEW+ADD.length)return P.draw(c,j,g,x,y,s,t,col);
    c.save();c.translate(x,y);c.scale(s,s);temp(c,j,g,t);c.restore();},
  portrait(c,j,g,cx,cy,h,t){if(j<FIRST_NEW||j>=FIRST_NEW+ADD.length)return P.portrait?P.portrait(c,j,g,cx,cy,h,t):undefined;
    const s=h/62;c.save();c.translate(cx,cy-9*s);c.scale(s,s);temp(c,j,g,t||0,true);c.restore();},
});}
window.KTJobs18={ADD,FIRST_NEW};
})();
