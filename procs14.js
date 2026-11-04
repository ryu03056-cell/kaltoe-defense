// 칼퇴 디펜스 — 직급별 발동 확률 v14.5
// 예전: 변호사 기절·회계사 골드·경찰 수갑 확률이 ★1~★4 모두 같았음 (수습 회계사도 시니어도 12%)
// 지금: 직급이 오를수록 확률이 올라감. ★5(대표)는 원래 대표 능력 그대로
//            ★1    ★2    ★3    ★4    ★5(대표)
//   변호사 기절  4%    7%   11%   15%   35%
//   회계사 골드  3%    6%    9%   13%   35%   (골드 양은 예전처럼 ★1 +1 · ★2 +2 · ★3 +3 · ★4 +4)
//   경찰 수갑    5%   10%   15%   20%  100%   (받는 피해 증가는 예전처럼 직급마다 +3%)
// 히든 직업(★4부터 시작)은 그대로
// 연결: index.html 게임 스크립트 바로 뒤에서 불러옴. 게임의 직급별 능력표 KT.EFF 에서 ★1~★4 칸만 복사본으로 바꿈
//       (index.html 은 테스트 핸들에 EFF 한 단어만 추가)
(function(){
'use strict';
const KT=window.KT;if(!KT||!KT.EFF||!KT.JOBS)return;
const EFF=KT.EFF,JOBS=KT.JOBS;
const P={
  1:{k:'stun',p:[0.04,0.07,0.11,0.15],desc:(p,g,J)=>`${p}% 확률 기절 "이의 있음!"`},
  3:{k:'gold',p:[0.03,0.06,0.09,0.13],desc:(p,g,J)=>`공격 시 ${p}% 확률 골드 +${J.gold.v+g}`},
  5:{k:'mark',p:[0.05,0.10,0.15,0.20],desc:(p,g,J)=>`${p}% 확률 수갑: 받는 피해 +${Math.round((J.mark.v+g*0.03)*100)}%`},
};
for(const ji in P){
  const R=P[ji],base=JOBS[ji];
  if(!base||!base[R.k]||!EFF[ji])continue;
  for(let g=0;g<4;g++){
    const e=Object.assign({},EFF[ji][g]);
    e[R.k]=Object.assign({},e[R.k],{p:R.p[g]});
    e.desc=R.desc(Math.round(R.p[g]*100),g,e);
    EFF[ji][g]=e;
  }
  // 직원 편성 등 직급 없이 보여 주는 설명: 확률 범위로
  const lo=Math.round(R.p[0]*100),hi=Math.round(R.p[3]*100);
  const rng=R.desc(`${lo}~${hi}`,0,base).replace(/골드 \+\d+$/,'골드').replace(/\+\d+%$/,'증가');
  base.desc=rng+' (직급마다 오름)';
  const NJ=window.KTJobs&&KTJobs.NEW_JOBS&&KTJobs.NEW_JOBS.find(n=>n.name===base.name);if(NJ)NJ.desc=base.desc;
}
window.KTProcs={table:P};
})();
