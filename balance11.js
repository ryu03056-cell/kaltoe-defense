// 칼퇴 디펜스 — 난이도 보강 v11 (stages.js 값은 그대로 두고 여기서 덮어씀)
// 1-1·1-2는 튜토리얼 구간이라 그대로, 나머지는 업무 체력 상향
(function(){
'use strict';
if(!window.KTStages)return;
const MUL={1:1.3,2:1.25,3:1.3};
const KEEP=['1-1','1-2'];
KTStages.STAGES.forEach(s=>{if(!KEEP.includes(s.id))s.hp=Math.round(s.hp*(MUL[s.ch]||1)*100)/100;s.crunch=!KEEP.includes(s.id);});
KTStages.BALANCE='v11';
})();
