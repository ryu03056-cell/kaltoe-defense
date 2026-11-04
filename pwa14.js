// 칼퇴 디펜스 — 앱으로 설치(PWA) v14.4
// · 오프라인 저장(sw.js) 등록 — 웹 주소(https·localhost)로 열었을 때만 (파일로 바로 열면 건너뜀)
// · 로비 아래에 "📲 앱으로 설치" 버튼 — 설치할 수 있을 때만 보이고, 이미 앱으로 실행 중이면 숨김
//     안드로이드·PC 크롬/엣지 : 브라우저 설치 창을 바로 띄움
//     아이폰·아이패드(사파리)  : 설치 창이 없어서 "공유 → 홈 화면에 추가" 안내를 보여 줌
// · 설정 화면에 "앱으로 설치" 항목 (같은 동작)
// 기존 파일은 건드리지 않음 — 로비·설정 화면이 그려지면 그 아래에 버튼만 끼워 넣음
(function(){
'use strict';
const ua=navigator.userAgent||'';
const isIOS=/iphone|ipad|ipod/i.test(ua)||(/macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
const inApp=()=>{try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;}catch(e){return false;}};
const web=/^https?:$/.test(location.protocol);
let deferred=null,installed=false;

if(web&&'serviceWorker' in navigator){
  addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;sync();});
addEventListener('appinstalled',()=>{installed=true;deferred=null;sync();toast('설치 완료! 홈 화면에서 실행하세요');});

const can=()=>web&&!installed&&!inApp()&&(!!deferred||isIOS);
function toast(t){const f=document.createElement('div');f.className='kt-float kt-font';f.textContent=t;document.body.appendChild(f);setTimeout(()=>f.remove(),1600);}

function guide(){
  const w=document.createElement('div');w.className='kt-modal kt-font';
  const how=isIOS
    ?`<ol style="text-align:left;line-height:1.9;margin:8px 0 14px 20px;font-size:15px">
        <li><b>사파리</b>로 이 페이지를 열어 주세요 (카톡·인스타 안 브라우저에선 안 돼요)</li>
        <li>아래쪽(아이패드는 위쪽) <b>공유 버튼 <span style="font-size:18px">⬆︎</span></b> 누르기</li>
        <li><b>홈 화면에 추가</b> → <b>추가</b></li></ol>`
    :`<ol style="text-align:left;line-height:1.9;margin:8px 0 14px 20px;font-size:15px">
        <li>브라우저 오른쪽 위 <b>메뉴(⋮)</b> 누르기</li>
        <li><b>앱 설치</b> 또는 <b>홈 화면에 추가</b> 누르기</li></ol>
       <p class="kt-muted" style="font-size:12px">메뉴에 없으면 크롬이나 삼성 인터넷으로 열어 주세요</p>`;
  w.innerHTML=`<div class="kt-sheet" style="text-align:center"><h2>📲 앱으로 설치</h2>
    <p style="font-size:14px;color:#cfd4de">홈 화면에 아이콘이 생기고, 주소창 없이 꽉 찬 화면으로 실행돼요.<br>한 번 실행한 뒤에는 인터넷 없이도 할 수 있어요.</p>
    ${how}<button class="kt-btn" style="padding:8px 26px">확인</button></div>`;
  w.addEventListener('click',e=>{if(e.target===w||e.target.tagName==='BUTTON')w.remove();});
  document.body.appendChild(w);
}
async function install(){
  try{window.KTSound&&KTSound.play('select');}catch(e){}
  if(deferred){const d=deferred;deferred=null;try{d.prompt();const r=await d.userChoice;if(r&&r.outcome==='accepted')installed=true;}catch(e){guide();}sync();return;}
  guide();
}

// 로비 버튼
function lobbyBtn(){
  const foot=document.getElementById('lb-foot');if(!foot)return;
  let b=document.getElementById('kt-install');
  if(!b){b=document.createElement('button');b.id='kt-install';b.className='kt-btn kt-font';b.type='button';
    b.style.cssText='display:block;margin:2px auto 6px;padding:7px 18px;font-size:14px;border-color:#ffb020;color:#ffcf6a;background:rgba(255,176,32,.08)';
    b.textContent='📲 앱으로 설치';b.onclick=install;foot.before(b);}
  b.hidden=!can();
}
// 설정 화면 항목
function settingsRow(){
  const rs=document.getElementById('st-reset');if(!rs||document.getElementById('st-install'))return;
  const row=document.createElement('div');row.className='kt-toggle';
  const label=inApp()||installed?'설치됨':(web?'설치':'웹 주소에서만');
  row.innerHTML=`<span>앱으로 설치</span><button class="kt-btn" id="st-install">${label}</button>`;
  const tr=rs.closest('.kt-toggle');if(!tr)return;tr.before(row);
  const b=row.querySelector('#st-install');
  if(label!=='설치')b.disabled=true;else b.onclick=()=>{const m=rs.closest('.kt-modal');if(m)m.remove();install();};
}
function sync(){try{lobbyBtn();settingsRow();}catch(e){}}

let q=0;
new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;sync();});}).observe(document.body,{childList:true});
sync();

window.KTPwa={install,guide,canInstall:can,inApp,isIOS};
})();
