// 칼퇴 디펜스 — 수익화(광고·결제) 레이어
// 웹: 실제 광고·결제 없이 "시뮬레이션" 화면으로 동작 (테스트용, 돈이 나가지 않음)
// 앱: window.KTMonetAdapter 를 넣으면 그대로 실제 광고/결제로 바뀜
//   예) Capacitor + @capacitor-community/admob (보상형·전면 광고), Google Play Billing / RevenueCat (인앱결제)
//   adapter = { showRewarded(placement)→Promise<boolean>, showInterstitial(placement)→Promise<void>, purchase(sku)→Promise<boolean>, restore()→Promise<string[]> }
// 원칙: 보상형 광고는 항상 "선택", 전면 광고는 빈도 제한(3판마다, 첫 2판 제외, 광고 제거 구매 시 없음), 결제는 편의·꾸미기 위주(밸런스 파괴 금지)
(function(){
'use strict';
const PRODUCTS=[
  {sku:'no_ads',name:'광고 제거',desc:'전면 광고 영구 제거 + 보상형 광고 없이 보상 받기',price:'₩3,900',icon:'🚫'},
  {sku:'starter',name:'신입 스타터팩',desc:'광고 제거 + 💎200 + 💵1,000 (1회 한정)',price:'₩5,900',icon:'🎁',once:true},
  {sku:'stock_100',name:'스톡옵션 100',desc:'💎100',price:'₩1,200',icon:'💎'},
  {sku:'stock_550',name:'스톡옵션 550',desc:'💎550 (+10%)',price:'₩5,900',icon:'💎'},
];
const REWARDS={ // 보상형 광고 지점
  revive:'이어하기 (업무 절반 정리)',double:'보상 2배',coffee:'커피 ☕ +1',daily:'출근 도장 2배',
};
function modal(html){
  const w=document.createElement('div');w.className='kt-modal';w.innerHTML=`<div class="kt-sheet">${html}</div>`;
  document.body.appendChild(w);return w;
}
const sim={
  showRewarded(placement){
    return new Promise(res=>{
      let n=3;const w=modal(`<div class="kt-ad"><div class="kt-ad-tag">광고 (웹 시뮬레이션)</div><div class="kt-ad-box">📺</div>
        <p>앱에서는 여기서 실제 보상형 광고가 재생됩니다.</p><p class="kt-muted">보상: ${REWARDS[placement]||placement}</p>
        <button class="kt-btn kt-btn-main" disabled id="kt-ad-ok">${n}</button> <button class="kt-btn" id="kt-ad-x">닫기</button></div>`);
      const ok=w.querySelector('#kt-ad-ok');
      const t=setInterval(()=>{n--;if(n>0)ok.textContent=n;else{clearInterval(t);ok.disabled=false;ok.textContent='보상 받기';}},1000);
      ok.onclick=()=>{w.remove();res(true);};
      w.querySelector('#kt-ad-x').onclick=()=>{clearInterval(t);w.remove();res(false);};
    });
  },
  showInterstitial(){
    return new Promise(res=>{
      const w=modal(`<div class="kt-ad"><div class="kt-ad-tag">전면 광고 (웹 시뮬레이션)</div><div class="kt-ad-box">🗞️</div>
        <p>앱에서는 여기서 전면 광고가 나옵니다. (3판마다 1회)</p><button class="kt-btn" id="kt-ad-x">닫기</button></div>`);
      w.querySelector('#kt-ad-x').onclick=()=>{w.remove();res();};
    });
  },
  purchase(sku){
    const p=PRODUCTS.find(x=>x.sku===sku);
    return new Promise(res=>{
      const w=modal(`<div class="kt-ad"><div class="kt-ad-tag">테스트 결제 (웹 시뮬레이션)</div><div class="kt-ad-box">${p.icon}</div>
        <h3>${p.name} · ${p.price}</h3><p class="kt-muted">실제로 결제되지 않습니다. 앱 출시 후 스토어 결제로 바뀝니다.</p>
        <button class="kt-btn kt-btn-main" id="kt-p-ok">테스트 구매</button> <button class="kt-btn" id="kt-p-x">취소</button></div>`);
      w.querySelector('#kt-p-ok').onclick=()=>{w.remove();res(true);};
      w.querySelector('#kt-p-x').onclick=()=>{w.remove();res(false);};
    });
  },
  restore(){return Promise.resolve([]);},
};
const A=()=>window.KTMonetAdapter||sim;
const M=()=>window.KTMeta;
const api={
  PRODUCTS,REWARDS,
  isApp:()=>!!window.KTMonetAdapter,
  adsRemoved:()=>!!(M()&&M().get().owned.noAds),
  // 보상형: 광고 제거 구매자는 광고 없이 바로 보상
  async rewarded(placement){
    if(api.adsRemoved())return true;
    const ok=await A().showRewarded(placement);
    if(ok&&M()){M().get().adCount++;M().save();}
    return ok;
  },
  // 전면: 결과 화면 닫을 때 호출, 빈도 제한
  async maybeInterstitial(){
    const m=M();if(!m||api.adsRemoved())return;
    const d=m.get();if(d.games<=2||d.gamesSinceAd<3)return;
    d.gamesSinceAd=0;m.save();await A().showInterstitial('between_games');
  },
  async buy(sku){
    const p=PRODUCTS.find(x=>x.sku===sku),m=M();if(!p||!m)return false;
    const d=m.get();if(p.once&&d.owned.starter)return false;
    const ok=await A().purchase(sku);if(!ok)return false;
    if(sku==='no_ads')d.owned.noAds=true;
    if(sku==='starter'){d.owned.noAds=true;d.owned.starter=true;d.stock+=200;d.bonus+=1000;}
    if(sku==='stock_100')d.stock+=100;
    if(sku==='stock_550')d.stock+=550;
    m.save();return true;
  },
};
window.KTMonet=api;
})();
