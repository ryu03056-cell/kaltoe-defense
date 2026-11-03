// 칼퇴 디펜스 — 게임 시작 인트로 v14 (약 15초, 게임 그림으로 그리는 짧은 장면 6개)
// ① 출근길 지하철 ② 업무 347건 ③ 김부장 등장 ④ 칼퇴 동맹 ⑤ 6시 정각까지 막아라 ⑥ 로고
// - 처음 실행할 때 한 번 자동 재생 (localStorage 'kt_intro_v1') · 설정 → "인트로 다시 보기"
// - 화면을 누르면 다음 장면 · 오른쪽 위 [건너뛰기] · 마지막 장면에서 누르면 로비로
// 기존 파일은 고치지 않음. 그림은 assets13.js(KTAssets), 소리는 sound.js(KTSound) 재사용
(function(){
'use strict';
const KEY='kt_intro_v1',W=540,H=680,FONT='"Jua","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
const SC=[2.6,2.6,2.6,2.6,2.8,99];   // 장면 길이(초), 마지막은 누를 때까지
let root=null,cv=null,ctx=null,raf=0,t0=0,scene=0,sceneT=0,last=0,cues={},done=null;
const A=()=>window.KTAssets,img=n=>A()&&A().get(n);
const snd=(n,a)=>{try{window.KTSound&&KTSound.play(n,a);}catch(e){}};
const ease=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);
const back=x=>{x=Math.max(0,Math.min(1,x));const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
function seen(){try{return localStorage.getItem(KEY)==='1';}catch(e){return true;}}
function setSeen(){try{localStorage.setItem(KEY,'1');}catch(e){}}

// ---------------- 그리기 도구 ----------------
function spr(name,x,y,size,o){   // 발밑(x,y) 기준으로 정사각 그림
  const im=img(name);if(!im)return;o=o||{};const s=size,fw=im.width/Math.max(1,Math.round(im.width/im.height));
  ctx.save();ctx.translate(x,y);if(o.rot)ctx.rotate(o.rot);ctx.scale((o.flip?-1:1)*(o.sx||1),o.sy||1);ctx.globalAlpha=o.a==null?1:o.a;
  ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,0,fw,im.height,-s/2,-s,s,s);
  if(o.flash>0){ctx.globalAlpha=o.flash;ctx.globalCompositeOperation='lighter';ctx.drawImage(im,0,0,fw,im.height,-s/2,-s,s,s);}
  ctx.restore();
}
function txt(s,x,y,size,col,o){
  o=o||{};ctx.save();ctx.globalAlpha=o.a==null?1:o.a;ctx.font=`${size}px ${FONT}`;ctx.textAlign=o.align||'center';ctx.textBaseline='middle';
  ctx.lineJoin='round';ctx.lineWidth=o.lw||Math.max(4,size*0.2);ctx.strokeStyle=o.stroke||'rgba(10,8,14,0.9)';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();
}
function bubble(s,x,y,size,p){   // 말풍선 (글자가 한 자씩 나옴)
  const n=Math.max(0,Math.min(s.length,Math.floor(p*s.length*1.6)));const shown=s.slice(0,n);if(!n)return;
  ctx.save();ctx.font=`${size}px ${FONT}`;const w=ctx.measureText(s).width+28,h=size+20;
  ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect?ctx.roundRect(x-w/2,y-h/2,w,h,14):ctx.rect(x-w/2,y-h/2,w,h);ctx.fill();
  ctx.beginPath();ctx.moveTo(x-8,y+h/2-1);ctx.lineTo(x+4,y+h/2+12);ctx.lineTo(x+10,y+h/2-1);ctx.fill();
  ctx.fillStyle='#16181d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(shown,x,y+1);ctx.restore();
}
function shake(m){if(m>0)ctx.translate((Math.random()-0.5)*m,(Math.random()-0.5)*m);}
function cue(id,f){if(!cues[id]){cues[id]=1;f();}}
function rays(x,y,t,col,n,len){ctx.save();ctx.translate(x,y);ctx.rotate(t*0.35);ctx.fillStyle=col;for(let k=0;k<n;k++){ctx.rotate(Math.PI*2/n);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-22,-len);ctx.lineTo(22,-len);ctx.closePath();ctx.fill();}ctx.restore();}

// ---------------- 장면 ----------------
const S=[
// ① 출근길 지하철
function(t){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a2233');g.addColorStop(1,'#0c1018');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // 창밖으로 지나가는 불빛
  for(let i=0;i<9;i++){const x=((i*97-t*520)%(W+160)+W+160)%(W+160)-80;ctx.fillStyle=`rgba(255,214,120,${0.35+0.25*Math.sin(i)})`;ctx.fillRect(x,170,60,10);}
  ctx.fillStyle='#2a3446';ctx.fillRect(0,250,W,260);ctx.fillStyle='#f2c94c';ctx.fillRect(0,250,W,6);
  for(let i=0;i<3;i++){ctx.fillStyle='#3d4a63';ctx.fillRect(30+i*175,280,140,80);}
  ctx.save();shake(t>0.4?3:0);
  const sway=Math.sin(t*9)*6;
  spr('mob/backpack',120+sway,470,190);spr('mob/backpack',420+sway,470,190,{flip:1});
  spr('pixel/developer_0',270+sway*0.6,470+Math.abs(Math.sin(t*12))*-3,170,{sy:1-Math.abs(Math.sin(t*9))*0.04});
  ctx.restore();
  const ap=ease(t/0.35);spr('mob/alarm',430,150+(1-ap)*-120+Math.sin(t*30)*3,120,{rot:Math.sin(t*40)*0.12});
  if(t>0.45){cue('a1',()=>snd('error'));bubble('8시 59분!',330,70,28,(t-0.45)/0.6);}
  txt('AM 8:59 · 출근길',W/2,610,26,'#ffd27a',{a:ease(t/0.5)});
},
// ② 업무 347건
function(t){
  ctx.fillStyle='#14171d';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.03)';for(let y=0;y<H;y+=40)ctx.fillRect(0,y,W,1);
  ctx.fillStyle='#5c4a3a';ctx.fillRect(60,470,420,36);ctx.fillStyle='#463729';ctx.fillRect(80,506,24,120);ctx.fillRect(436,506,24,120);
  const drops=[[170,470,0.1],[370,470,0.35],[270,345,0.6]];
  drops.forEach(([x,y,d],k)=>{const p=(t-d)/0.35;if(p<0)return;const yy=y-(1-Math.min(1,back(p)))*420;if(p>=1)cue('d'+k,()=>snd('drop'));spr('mob/task',x,yy,150,{sy:p>1&&p<1.25?0.85:1});});
  if(t>0.9){const p=ease((t-0.9)/0.4);spr('mob/urgent',W+60-p*170,120+Math.sin(t*6)*8,110,{rot:-0.25});cue('u',()=>snd('summon',0));}
  if(t>1.1){spr('mob/call',90,190+Math.sin(t*50)*2,110);cue('c',()=>snd('pick'));}
  if(t>1.2){const n=Math.min(347,Math.floor((t-1.2)/0.9*347));txt(`오늘 할 일: ${n}건`,W/2,600,36,'#ff6b6b');}
},
// ③ 김부장 등장
function(t){
  const g=ctx.createRadialGradient(W/2,H*0.45,20,W/2,H*0.45,460);g.addColorStop(0,'#5a2020');g.addColorStop(1,'#120c0c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  rays(W/2,330,t,'rgba(255,90,90,0.08)',12,520);
  const p=back(t/0.45);cue('b',()=>snd('boss'));
  ctx.save();shake(t<0.6?10*(1-t/0.6):0);spr('mob/boss_kim',W/2,560,200+260*p);ctx.restore();
  if(t>0.6)bubble('이거 오늘까지 되지?',W/2,80,30,(t-0.6)/0.9);
},
// ④ 칼퇴 동맹
function(t){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#232a38');g.addColorStop(1,'#11141b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const L=[['pixel/doctor_0',95,420],['pixel/lawyer_0',185,470],['pixel/architect_0',355,470],['pixel/accountant_0',445,420],['pixel/developer_0',270,350]];
  L.forEach(([n,x,y],k)=>{const d=0.15+k*0.28,p=(t-d)/0.3;if(p<0)return;const yy=y-(1-Math.min(1,ease(p)))*520;
    if(p>=1){cue('l'+k,()=>snd('pick'));const q=Math.min(1,(p-1)*3);ctx.fillStyle=`rgba(200,200,210,${0.35*(1-q)})`;ctx.beginPath();ctx.ellipse(x,y,40+q*30,8,0,0,Math.PI*2);ctx.fill();}
    spr(n,x,yy,160,{sy:p>1&&p<1.2?0.9:1});});
  if(t>1.6)txt('"혼자는 못 끝낸다"',W/2,600,34,'#ffb020',{a:ease((t-1.6)/0.4)});
},
// ⑤ 6시 정각까지 막아라
function(t){
  ctx.fillStyle='#0f121a';ctx.fillRect(0,0,W,H);
  const blink=Math.floor(t*4)%2;ctx.save();ctx.font=`bold 54px monospace`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle=blink?'#ff6b6b':'#c92a2a';ctx.fillText('17:59',20,16);ctx.restore();
  const M=[['mob/task',90,190],['mob/client',200,160],['mob/meeting',320,180],['mob/urgent',440,150],['mob/call',150,280],['mob/revision',390,270]];
  const U=[['pixel/doctor_4',110],['pixel/fire_4',270],['pixel/developer_4',430]];
  if(t<0.35){ctx.fillStyle=`rgba(255,240,180,${0.6*(1-t/0.35)})`;ctx.fillRect(0,0,W,H);cue('m',()=>snd('myth'));}
  U.forEach(([n,x])=>{rays(x,620,t,'rgba(255,214,90,0.12)',10,90);spr(n,x,630,150);});
  let killed=0;
  M.forEach(([n,x,y],k)=>{const hit=0.5+k*0.3,p=t-hit;
    if(p<0){spr(n,x,y+Math.sin(t*6+k)*4,100);return;}
    if(p<0.12){const ux=U[k%3][1];ctx.strokeStyle='rgba(255,255,255,0.85)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(ux,520);ctx.lineTo(x,y-50);ctx.stroke();spr(n,x,y,100,{flash:1-p/0.12,sx:1.15,sy:0.85});cue('h'+k,()=>snd('hit'));return;}
    killed++;cue('k'+k,()=>snd('kill'));
    const q=Math.min(1,(p-0.12)/0.35);ctx.strokeStyle=`rgba(255,212,59,${1-q})`;ctx.lineWidth=4*(1-q)+1;ctx.beginPath();ctx.arc(x,y-50,30+q*50,0,Math.PI*2);ctx.stroke();
    if(q<1)txt(String(2400+k*137)+'!',x,y-90-q*40,26,'#ffd43b',{a:1-q});});
  if(killed>=2)txt(`${killed*7} COMBO`,W/2,410,34,killed>=5?'#ff4d8d':'#ffe066',{a:1});
  txt('6시 정각까지 막아라!',W/2,470,30,'#ffffff',{a:ease(t/0.4)});
},
// ⑥ 로고
function(t){
  const g=ctx.createRadialGradient(W/2,-40,40,W/2,-40,700);g.addColorStop(0,'#3a3016');g.addColorStop(1,'#0f1115');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  rays(W/2,190,t,'rgba(255,214,90,0.10)',14,560);
  cue('w',()=>snd('win'));
  const p=back(t/0.5);ctx.save();ctx.translate(W/2,170);ctx.scale(p,p);txt('칼퇴 디펜스',0,0,74,'#ffb020',{lw:12,stroke:'#5a3500'});ctx.restore();
  txt('진상 클라이언트와 상사를 막고, 오늘은 꼭 칼퇴한다',W/2,250,19,'#eef1f6',{a:ease((t-0.4)/0.4),lw:4});
  [['pixel/lawyer_4',130,520],['pixel/architect_4',270,500],['pixel/accountant_4',410,520]].forEach(([n,x,y],k)=>{const q=ease((t-0.5-k*0.12)/0.3);spr(n,x,y+(1-q)*60,180,{a:q});});
  if(t>1.2)txt('▶ 터치해서 출근하기',W/2,600,26,'#ffd27a',{a:0.55+0.45*Math.sin(t*5)});
  txt('18:00 퇴근!',W/2,292,24,'#40d987',{a:ease((t-0.8)/0.4)});
},
];

// ---------------- 재생 ----------------
function fit(){
  const vw=window.innerWidth,vh=window.innerHeight,s=Math.min(vw/W,vh/H),dpr=Math.min(2,window.devicePixelRatio||1);
  cv.style.width=W*s+'px';cv.style.height=H*s+'px';cv.width=Math.round(W*s*dpr);cv.height=Math.round(H*s*dpr);ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
}
function frame(now){
  if(!root)return;const dt=Math.min(0.05,(now-last)/1000);last=now;sceneT+=dt;
  if(sceneT>=SC[scene]&&scene<S.length-1){scene++;sceneT=0;}
  ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);ctx.save();
  try{S[scene](sceneT);}catch(e){console.error(e);}
  ctx.restore();
  // 장면 진행 점
  for(let i=0;i<S.length;i++){ctx.fillStyle=i===scene?'#ffd27a':'rgba(255,255,255,0.25)';ctx.beginPath();ctx.arc(W/2-50+i*20,H-18,i===scene?5:4,0,Math.PI*2);ctx.fill();}
  raf=requestAnimationFrame(frame);
}
function close(){
  if(!root)return;cancelAnimationFrame(raf);root.remove();root=null;setSeen();window.removeEventListener('resize',fit);
  if(done){const f=done;done=null;f();}
}
function play(onDone){
  if(root)return;done=onDone||null;
  root=document.createElement('div');root.id='kt-intro';
  root.style.cssText='position:fixed;inset:0;z-index:200;background:#07080b;display:flex;align-items:center;justify-content:center;touch-action:manipulation;user-select:none';
  root.innerHTML=`<canvas></canvas><button id="kt-intro-skip" style="position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);right:12px;font:15px ${FONT};color:#fff;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:7px 14px;cursor:pointer">건너뛰기 ▶▶</button>`;
  document.body.appendChild(root);cv=root.querySelector('canvas');ctx=cv.getContext('2d');fit();window.addEventListener('resize',fit);
  root.querySelector('#kt-intro-skip').onclick=e=>{e.stopPropagation();close();};
  root.addEventListener('pointerdown',()=>{try{window.KTSound&&KTSound.init();}catch(e){}
    if(scene===S.length-1){if(sceneT>0.8)close();}else{scene++;sceneT=0;}});
  scene=0;sceneT=0;cues={};last=performance.now();
  const go=()=>{if(root){last=performance.now();raf=requestAnimationFrame(frame);}};
  (A()&&A().ready?Promise.race([A().ready,new Promise(r=>setTimeout(r,2500))]):Promise.resolve()).then(go);   // 그림이 준비되면 시작 (최대 2.5초 대기)
}
// 처음 실행할 때 자동 재생
if(!seen())setTimeout(()=>play(),50);
// 설정 → 인트로 다시 보기
new MutationObserver(()=>{
  const rs=document.getElementById('st-reset');if(!rs||document.getElementById('st-intro'))return;
  const row=document.createElement('div');row.className='kt-toggle';
  row.innerHTML=`<span>인트로</span><button class="kt-btn" id="st-intro">다시 보기</button>`;
  rs.closest('.kt-toggle').before(row);
  row.querySelector('#st-intro').onclick=()=>{const m=rs.closest('.kt-modal');if(m)m.remove();play();};
}).observe(document.body,{childList:true});
window.KTIntro={play,close,reset(){try{localStorage.removeItem(KEY);}catch(e){}}};
})();
