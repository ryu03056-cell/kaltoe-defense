// 칼퇴 디펜스 — 새 히든 조합 v18 (recipes12 의 HIDDEN 목록에 이어 붙임)
//   푸드 유튜버 = 기자 과장 + 요리사 과장 · 물류센터장 = 택배기사 과장 + 회계사 과장
// 그림: pixel/{foodtuber|logistics}_{3|4}.png — 없으면 base 직업 그림 + 히든 표시
// 반드시 recipes12.js 다음, 게임 스크립트 앞에서 불러옴
(function(){
'use strict';
const R=window.KTRecipes,J18=window.KTJobs18;if(!R||!J18||R._v18)return;R._v18=true;
const RP=J18.FIRST_NEW,CH=J18.FIRST_NEW+1,CO=J18.FIRST_NEW+2;   // 기자 9 · 요리사 10 · 택배기사 11
R.HIDDEN.push(
  {key:'foodtuber',name:'푸드 유튜버',icon:'📹',a:RP,b:CH,base:6,mark:'📰',dmg:10,cd:0.75,range:200,col:'#ffa94d',multi:3,slow:{v:0.35,t:1.5},
   desc:'한 번에 3명 공격 · 둔화',ranks:['','','','푸드 유튜버','구독자 천만 유튜버'],
   myth:{multi:5,slow:{v:0.55,t:2},shout:'구독 좋아요 알림!',desc:'한 번에 5명 공격 · 강한 둔화'},
   pf:{name:'한특종 × 백불맛',quotes:[['오늘의 먹방 시작!','맛 평가 들어갑니다'],['라이브 동접 100만!','구독 좋아요 알림!']]}},
  {key:'logistics',name:'물류센터장',icon:'🏭',a:CO,b:3,base:8,mark:'🧮',dmg:16,cd:0.6,range:215,col:'#91a7ff',knock:20,gold:{p:0.25,v:2},
   desc:'빠른 공격 · 밀어냄 · 25% 확률 골드',ranks:['','','','물류센터장','물류 그룹 회장'],
   myth:{knock:36,splash:60,gold:{p:0.35,v:3},shout:'전국 당일 배송!',desc:'범위 공격 · 강하게 밀어냄 · 35% 골드'},
   pf:{name:'신속배 × 정산미',quotes:[['출고 완료!','재고 맞췄습니다'],['허브 자동화 끝!','당일 배송 100%']]}},
);
})();
