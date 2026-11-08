// 칼퇴 디펜스 — 채용 규칙 v14.13
// 칸이 다 차면 채용·인맥 찬스를 막음
//   예전: 빈칸이 없어도 채용을 계속 누르면, 실패할 땐 골드가 안 빠지고 운 좋게 같은 직원이 나올 때만 1·2명 칸에 채워짐
//         → 공짜로 계속 다시 뽑기가 됐음
//   지금: 빈칸이 하나도 없으면 아예 뽑지 않고 "칸이 다 찼어요" 안내 (합성하거나 퇴사시켜서 칸을 비워야 함)
//   협동: 내 칸 덩어리(방장 위 9칸 · 동료 아래 9칸) 기준
// 연결: index.html summon()·gamble() 첫 줄에서 KTRules.blockDraw() 확인
(function(){
'use strict';
function myRange(){
  const C=window.KTCoop;
  if(C&&C.myRange){const r=C.myRange();if(r)return r;}
  return [0,(window.KT&&KT.S&&KT.S.cells?KT.S.cells.length:18)];
}
function toast(m){const t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),1600);}
// 뽑기를 막아야 하면 true
function blockDraw(){
  const S=window.KT&&KT.S;if(!S||S.state!=='play')return false;
  const [a,b]=myRange();
  for(let i=a;i<b;i++)if(!S.cells[i])return false;
  toast('칸이 다 찼어요 — 합성하거나 퇴사시켜 칸을 비워 주세요');
  try{KTSound.play('error');}catch(e){}
  return true;
}
// v20.5: 칸이 다 차면 채용 버튼에 미리 표시 (눌러 봐야 알던 것)
const st=document.createElement('style');st.textContent='#bSummon.kt-full{position:relative;filter:saturate(.45)}#bSummon.kt-full::after{content:"칸 꽉 참 · 퇴사/합성";position:absolute;left:50%;top:-9px;transform:translateX(-50%);white-space:nowrap;font-size:10px;line-height:15px;padding:0 6px;border-radius:8px;background:#e03131;color:#fff;pointer-events:none}';document.head.appendChild(st);
function isFull(){const S=window.KT&&KT.S;if(!S||S.state!=='play'||!S.cells)return false;const [a,b]=myRange();for(let i=a;i<b;i++)if(!S.cells[i])return false;return true;}
setInterval(()=>{const b=document.getElementById('bSummon');if(b)b.classList.toggle('kt-full',isFull());},400);
window.KTRules={blockDraw,myRange,isFull};
})();
