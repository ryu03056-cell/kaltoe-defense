// 칼퇴 디펜스 — 직급별 발동 능력 v14.6
// 원칙: 한 단계 위 직원 1명이 아래 단계 3명(합성 재료)보다 특수 능력도 약하지 않게
//       (확률 × 효과량 × 공격 속도 기준, 한 단계마다 약 3배)
//            ★1          ★2          ★3          ★4          ★5(대표)
//   변호사 기절  4%·0.4초    8%·0.6초   15%·0.9초   35%·1.1초   35%·1.1초 + 필살기 범위 기절(2초)
//   회계사 골드  3%·+1      6%·+2     10%·+4     15%·+9     35%·+12 + 필살기 +8  (대표도 ★4 세 명보다 많게: 예전 +6 → +12)
//   경찰 수갑    5%         12%        25%        45%        100% (받는 피해 증가는 예전처럼 직급마다 +3%)
//   · 수갑은 걸려 있는 동안 효과가 겹치지 않아서 확률만 올림
//   · 회계사 ★4 한 명이 버는 골드는 예전 ★3 세 명과 비슷하게 맞춤 (경제가 갑자기 넘치지 않게)
// v14.5 → v14.6: 확률만 올리던 것을 효과량까지 함께 올림 (★1 3명 > ★2 1명이던 문제)
// 히든 직업(★4부터 시작)은 그대로
// 연결: index.html 게임 스크립트 바로 뒤에서 불러옴. 게임의 직급별 능력표 KT.EFF 에서 ★1~★4 칸만 복사본으로 바꿈
//       (index.html 은 테스트 핸들에 EFF 한 단어만 추가)
(function(){
'use strict';
const KT=window.KT;if(!KT||!KT.EFF||!KT.JOBS)return;
const EFF=KT.EFF,JOBS=KT.JOBS;
const pc=p=>Math.round(p*100);
// 게임 코드는 골드를 (gold.v + 직급번호)만큼 줌 → 원하는 골드에서 직급번호를 빼서 넣음
const GOLD=[1,2,4,9];
const P={
  1:{k:'stun',g:[{p:0.04,t:0.4},{p:0.08,t:0.6},{p:0.15,t:0.9},{p:0.35,t:1.1}],
     desc:(e,g)=>`${pc(e.stun.p)}% 확률 ${e.stun.t}초 기절 "이의 있음!"`,range:'4~35% 확률 기절 "이의 있음!" (직급마다 확률·시간 오름)'},
  3:{k:'gold',g:GOLD.map((v,g)=>({p:[0.03,0.06,0.10,0.15][g],v:v-g})),
     desc:(e,g)=>`공격 시 ${pc(e.gold.p)}% 확률 골드 +${e.gold.v+g}`,range:'공격 시 3~15% 확률 골드 +1~9 (직급마다 오름)'},
  5:{k:'mark',g:[{p:0.05},{p:0.12},{p:0.25},{p:0.45}],
     desc:(e,g)=>`${pc(e.mark.p)}% 확률 수갑: 받는 피해 +${Math.round((e.mark.v+g*0.03)*100)}%`,range:'5~45% 확률 수갑: 받는 피해 증가 (직급마다 오름)'},
};
// 회계사 대표(★5): 골드 +6 → +12
if(EFF[3]&&EFF[3][4]&&EFF[3][4].gold){EFF[3][4]=Object.assign({},EFF[3][4],{gold:Object.assign({},EFF[3][4].gold,{v:8})});EFF[3][4].desc='공격 시 35% 확률 골드 +12 대량 획득';}
for(const ji in P){
  const R=P[ji],base=JOBS[ji];
  if(!base||!base[R.k]||!EFF[ji])continue;
  for(let g=0;g<4;g++){
    const e=Object.assign({},EFF[ji][g]);
    e[R.k]=Object.assign({},base[R.k],R.g[g]);
    e.desc=R.desc(e,g);
    EFF[ji][g]=e;
  }
  // 직원 편성 등 직급 없이 보여 주는 설명
  base.desc=R.range;
  const NJ=window.KTJobs&&KTJobs.NEW_JOBS&&KTJobs.NEW_JOBS.find(n=>n.name===base.name);if(NJ)NJ.desc=base.desc;
}
window.KTProcs={table:P};
})();
