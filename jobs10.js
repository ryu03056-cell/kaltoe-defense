// 칼퇴 디펜스 — 신규 직업 v10: 경찰 · 소방관 · 공무원 · 군인 (계급이 있는 직업)
// - 직업 정의(능력치·특수 스킬)·계급명·대표(최고 계급) 능력·프로필
// - 캐릭터: 코드로 그린 임시 픽셀 스프라이트(64×64) — 나중에 PixelLab 그림으로 교체 가능 (pixel/{police|fire|civil|soldier}[_1|_4].png 있으면 우선 사용)
// - 투사체·필살기 이펙트
// 기존 KTChars / KTFX / KTProfiles 를 감싸서 확장 (기존 파일 수정 없음)
(function(){
'use strict';
const rnd=Math.random;
// ---------------- 직업 정의 (게임 JOBS 배열 5번부터 추가) ----------------
const NEW_JOBS=[
  {key:'police', name:'경찰',  icon:'👮',dmg:11,cd:0.9, range:175,col:'#5c8dff',desc:'20% 확률 수갑: 받는 피해 +20%',mark:{p:0.2,v:0.2,t:2.5},
   ranks:['순경','경사','경위','총경','치안총감']},
  {key:'fire',   name:'소방관',icon:'🧑‍🚒',dmg:12,cd:1.1, range:165,col:'#ff6b6b',desc:'물대포 범위 공격 + 뒤로 밀어냄',splash:50,knock:16,
   ranks:['소방사','소방교','소방위','소방정','소방총감']},
  {key:'civil',  name:'공무원',icon:'🏛️',dmg:7, cd:1.0, range:190,col:'#20c997',desc:'옆 칸 직원 공격 속도 +12% (직급마다 +3%)',buff:0.12,
   ranks:['9급 주무관','7급 주사보','5급 사무관','3급 국장','장관']},
  {key:'soldier',name:'군인',  icon:'🪖',dmg:24,cd:1.6, range:215,col:'#a9e34b',desc:'강한 단일 공격 · 4발마다 포격(범위)',arty:{every:4,r:60,m:1.5},
   ranks:['이등병','병장','대위','대령','★5 원수']},
];
const NEW_MYTH=[
  {mark:{p:1,v:0.4,t:4},stun:{p:0.2,t:0.8},shout:'전원 검거!',desc:'모든 공격에 수갑(+40% 피해) · 20% 기절'},
  {splash:85,knock:34,shout:'대형 화재 진압!',desc:'초대형 물대포 · 강하게 밀어냄'},
  {buff:0.25,buffAll:0.15,shout:'예산 집행!',desc:'옆 칸 공속 +25% · 전 직원 공격력 +15%'},
  {splash:70,arty:{every:3,r:90,m:2},shout:'공습 개시!',desc:'모든 공격이 포격 · 3발마다 대형 포격'},
];
const ULT_NEW={5:{name:'일제 검문!',col:'#5c8dff'},6:{name:'대형 물대포!',col:'#4dabf7'},7:{name:'긴급 예산!',col:'#20c997'},8:{name:'공습 개시!',col:'#a9e34b'}};
// ---------------- 프로필 ----------------
const PROFILES=[
  {name:'최검거',gender:'남',mbti:'ESTJ',like:'순찰차 커피, 깔끔한 조서',dislike:'"좀 봐주세요~"',
   bio:'파출소 막내 순경에서 시작해 치안총감까지. 지금도 습관처럼 "신분증 좀 보여주시겠어요?"가 먼저 나온다.',
   titles:NEW_JOBS[0].ranks,
   quotes:[['신고 접수했습니다!','순찰 다녀오겠습니다'],['조서 쓰는 중이에요','현장 출동!'],['수사 들어갑니다','증거 확보했습니다'],['특별수사본부 꾸리죠','전원 비상!'],['치안은 제가 책임집니다','오늘은 정시 퇴근!']],
   skill:'수갑: 받는 피해 증가 · 최고 계급: 모든 공격 수갑 + 기절'},
  {name:'한진화',gender:'여',mbti:'ISTP',like:'라면 한 그릇, 출동 사이렌',dislike:'"119죠? 고양이가 안 내려와요"',
   bio:'신입 소방사 시절 첫 출동에서 헬멧을 거꾸로 썼던 그녀. 이제는 물대포 하나로 업무 폭탄을 진압한다.',
   titles:NEW_JOBS[1].ranks,
   quotes:[['출동 준비 완료!','호스 어디 있죠?'],['진화 중입니다!','물 더 주세요!'],['현장 지휘 들어갑니다','안전이 먼저예요'],['전 대원 투입!','불길 잡았습니다'],['대한민국 화재는 제가 끕니다','오늘 출동 끝!']],
   skill:'물대포 범위 공격 + 밀어내기 · 최고 계급: 초대형 물대포'},
  {name:'정규정',gender:'남',mbti:'ISTJ',like:'민원 처리 완료 도장, 6시 정각',dislike:'"그냥 해주시면 안 돼요?"',
   bio:'"규정상 안 됩니다"로 시작해 장관까지 오른 원칙주의자. 옆자리 동료 업무 속도를 이상하게 올려준다.',
   titles:NEW_JOBS[2].ranks,
   quotes:[['규정상 안 됩니다','서류 미비입니다'],['공문 보내드릴게요','협조 부탁드립니다'],['결재 올렸습니다','예산 확인해볼게요'],['국정감사 준비하세요','정책 검토 중입니다'],['예산 집행합니다','6시 정각 퇴근입니다']],
   skill:'옆 칸 공격 속도 증가 · 최고 계급: 전 직원 공격력 증가'},
  {name:'강충성',gender:'남',mbti:'ESFJ',like:'뽀글이, 전역 날짜 세기',dislike:'"군대 얘기 또 해요?"',
   bio:'자대 배치 첫날 경례를 반대 손으로 했던 이등병이 별 다섯 개를 달았다. 아직도 아침 6시면 눈이 떠진다.',
   titles:NEW_JOBS[3].ranks,
   quotes:[['이병 강충성!','네 알겠습니다!'],['전역까지 100일…','후임 들어와라'],['중대 전진!','작전 개시합니다'],['포병 지원 요청!','연대 집합!'],['공습 개시하라','전군, 칼퇴한다!']],
   skill:'강한 단일 공격 · 4발마다 포격 · 최고 계급: 전 공격 포격'},
];
// ---------------- 절차적 픽셀 스프라이트 ----------------
const SK='#f6c9a3',SKD='#e2a882',INK='#1d1b26',OUT='#1b1a24';
function S(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function ell(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function box(c,x,y,w,h,col,r){c.fillStyle=col;if(r){rr(c,x,y,w,h,r);c.fill();}else c.fillRect(x,y,w,h);}
function star(c,x,y,r,col){c.fillStyle=col;c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();c.fill();}
// 몸통 공통: 다리·신발·팔
function legs(c,pant,shoe){box(c,25,47,6,9,pant);box(c,33,47,6,9,pant);box(c,24,55,8,4,shoe,1.5);box(c,32,55,8,4,shoe,1.5);}
function torso(c,col,dark){box(c,21,34,22,15,col,4);box(c,21,44,22,5,dark,2);}
function arms(c,col,hand){box(c,17,35,5,11,col,2);box(c,42,35,5,11,col,2);ell(c,19.5,46.5,2.6,2.4,hand||SK);ell(c,44.5,46.5,2.6,2.4,hand||SK);}
function head(c,hair,style){
  ell(c,32,22,12.5,11.5,SK);ell(c,32,26,11,7,SK);
  box(c,19,21,3,5,SKD,1);box(c,42,21,3,5,SKD,1); // 귀
  if(style!=='none'){c.fillStyle=hair;c.beginPath();c.ellipse(32,17,13,8.5,0,Math.PI,0);c.fill();box(c,19.5,15,4,7,hair,1);box(c,40.5,15,4,7,hair,1);
    if(style==='bang'){c.beginPath();c.moveTo(22,16);c.lineTo(30,16);c.lineTo(25,21);c.closePath();c.fill();}
    if(style==='part'){c.beginPath();c.moveTo(33,12);c.lineTo(44,15);c.lineTo(44,20);c.lineTo(36,16);c.closePath();c.fill();}
    if(style==='long'){box(c,19,16,4,16,hair,2);box(c,41,16,4,16,hair,2);}
    if(style==='white'){}}
}
function face(c,o){
  o=o||{};
  box(c,26,22,3,4,INK);box(c,35,22,3,4,INK);box(c,26,22,1,1,'#fff');box(c,35,22,1,1,'#fff');
  if(o.brow){box(c,25,19,5,1.4,o.brow);box(c,34,19,5,1.4,o.brow);}
  ell(c,24.5,27.5,2,1.2,'rgba(255,120,120,0.55)');ell(c,39.5,27.5,2,1.2,'rgba(255,120,120,0.55)');
  if(o.grin){box(c,29,28,6,2,'#8a2f2f');box(c,30,28,4,1,'#fff');}
  else if(o.serious){box(c,29.5,29,5,1.2,'#8a4a3a');}
  else{box(c,30,28.5,4,1.4,'#8a4a3a');box(c,29,28,1,1,'#8a4a3a');box(c,34,28,1,1,'#8a4a3a');}
  if(o.glasses){c.strokeStyle=o.glasses;c.lineWidth=1.2;c.strokeRect(24.5,21,6,5);c.strokeRect(33.5,21,6,5);box(c,30.5,23,3,1,o.glasses);}
  if(o.mus){box(c,28,26.5,8,1.6,o.mus);}
}
function pixelate(cv){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height,im=c.getImageData(0,0,W,H),d=im.data;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<110)d[i+3]=0;else{d[i+3]=255;}}
  const o=new Uint8ClampedArray(d);const op=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4;if(d[k+3]===0&&(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1))){o[k]=27;o[k+1]=26;o[k+2]=36;o[k+3]=255;}}
  im.data.set(o);c.putImageData(im,0,0);return cv;
}
// 계급장
function chev(c,x,y,n,col){for(let i=0;i<n;i++)box(c,x,y+i*2,6,1.2,col);}
function diam(c,x,y,col){c.fillStyle=col;c.beginPath();c.moveTo(x,y-2.2);c.lineTo(x+2,y);c.lineTo(x,y+2.2);c.lineTo(x-2,y);c.closePath();c.fill();}
function flower(c,x,y,col){ell(c,x,y,2,2,col);ell(c,x,y,0.8,0.8,'#fff3bf');}
const DRAW={
  police(c,g){
    const navy='#26355e',nav2='#1b2646',lb='#b8cbe8';
    legs(c,'#1e2440','#15151c');torso(c,lb,'#91a7cc');arms(c,lb);
    box(c,30,34,4,11,navy);box(c,21,46,22,3,'#2a2a2a');box(c,30.5,46,3,3,'#d4a72c'); // 넥타이·벨트
    box(c,23,37,4,4,g>=3?'#f4c542':'#c9d1dd',1); // 흉장
    head(c,'#22201e','part');face(c,{brow:'#22201e',serious:g>=2,grin:g>=4});
    // 정모
    box(c,18,9,28,8,g>=4?'#1b2646':navy,4);box(c,17,15,30,3,'#111',1.5);box(c,19,13.5,26,2,g>=3?'#f4c542':'#cfd6e0');
    ell(c,32,12,3,3,g>=2?'#f4c542':'#d0d8e4');
    const n=[1,3,1,4,0][g];for(let i=0;i<n;i++)(g>=2?flower:diam)(c,24+i*3,39+(g>=2?2:0),g>=2?'#f4c542':'#c0c8d4');
    if(g>=4){star(c,24,39,2.5,'#f4c542');star(c,29,39,2.5,'#f4c542');box(c,21,34,4,4,'#f4c542',1);box(c,39,34,4,4,'#f4c542',1);}
    // 무전기/경광봉
    box(c,43,40,3,9,g>=3?'#ffd43b':'#e03131',1);
  },
  fire(c,g){
    const coat=['#3b3f4a','#3b3f4a','#4a3b2c','#4a3b2c','#3a2c1c'][g],stripe=g>=4?'#f4c542':'#ffe066';
    legs(c,coat,'#15151c');box(c,25,51,14,1.5,stripe);
    torso(c,coat,'#2d3038');arms(c,coat,'#3d3d3d');box(c,21,40,22,2,stripe);box(c,17,42,5,1.6,stripe);box(c,42,42,5,1.6,stripe);
    box(c,30.5,34,3,13,'#222');
    head(c,'#5a3825','long');face(c,{brow:'#5a3825',grin:g>=3});
    const hc=['#e03131','#e03131','#ffd43b','#f8f9fa','#f8f9fa'][g];
    ell(c,32,13,14,8,hc);box(c,16,15,32,3,hc,1.5);box(c,17,17,30,1.5,'rgba(0,0,0,0.25)');
    box(c,28,6,8,6,g>=4?'#f4c542':'#c92a2a',1.5);if(g>=1)box(c,18,12.5,28,1.4,stripe);
    if(g>=2)star(c,32,9,2.2,g>=4?'#fff':'#f4c542');
    if(g>=4){box(c,21,34,22,2,'#f4c542');star(c,27,37,2,'#f4c542');star(c,37,37,2,'#f4c542');}
    // 소화기
    box(c,43,38,5,10,'#e03131',2);box(c,44,36,3,2,'#333');box(c,46,35,4,1.4,'#333');
  },
  civil(c,g){
    const top=['#c3a07a','#8a8f98','#5d6470','#2f343c','#1a1c20'][g];
    legs(c,g>=2?'#2b2f36':'#4a4f58','#2a1f18');torso(c,'#f8f9fa','#dee2e6');
    if(g===0){box(c,21,34,7,15,top,3);box(c,36,34,7,15,top,3);}
    else{box(c,21,34,8,15,top,3);box(c,35,34,8,15,top,3);}
    arms(c,g===0?top:top);
    box(c,30.5,35,3,9,['#4c6ef5','#495057','#c92a2a','#862e9c','#c92a2a'][g]);
    if(g<=1){box(c,27,34,1,8,'#1971c2');box(c,36,34,1,8,'#1971c2');box(c,34,41,5,6,'#fff',1);box(c,35,42,3,1.5,'#1971c2');}
    if(g>=3)box(c,23,38,3,3,'#f4c542',1.5);
    head(c,g>=4?'#9aa0a6':'#2a2723',g>=3?'part':'bang');face(c,{brow:'#2a2723',glasses:g>=2?'#333':null,serious:g===1||g===3,grin:g>=4});
    if(g>=4){box(c,21,36,22,2.5,'#c92a2a');star(c,32,37,2,'#f4c542');}
    // 도장/결재판
    if(g>=2){box(c,43,37,5,8,'#8b5a2b',1);box(c,44,38,3,6,'#f8f9fa');}else{box(c,43,40,4,4,'#c92a2a',1);box(c,44,37,2,3,'#8b5a2b');}
  },
  soldier(c,g){
    const camo='#5b6b3a',cd='#46532c',cl='#7a8a4f';
    legs(c,camo,'#15151c');ell(c,27,50,2,1.4,cd);ell(c,36,52,2,1.4,cl);
    torso(c,camo,cd);arms(c,camo);ell(c,25,38,2.5,2,cd);ell(c,38,41,2.5,1.8,cl);ell(c,32,45,2,1.5,cd);
    box(c,30.5,34,3,3,'#3c4626');
    head(c,'#22201e',g>=2?'part':'none');face(c,{brow:'#22201e',serious:g===2||g===3,grin:g===0||g>=4,mus:g>=4?'#d0d0d0':null});
    if(g<=1){ell(c,32,14,14,8,camo);box(c,17,15,30,3,cd,1.5);ell(c,26,11,2.5,1.6,cd);ell(c,37,13,2.5,1.6,cl);
      if(g===0)box(c,29,8,6,1.6,'#212529');else chev(c,29,7,4,'#212529');}
    else if(g<=3){box(c,18,9,28,8,g===3?'#46532c':'#5b6b3a',4);box(c,17,15,30,3,'#111',1.5);
      if(g===2){diam(c,27,12,'#dee2e6');diam(c,32,12,'#dee2e6');diam(c,37,12,'#dee2e6');}else{flower(c,27,12,'#f4c542');flower(c,32,12,'#f4c542');flower(c,37,12,'#f4c542');}}
    else{box(c,17,8,30,9,'#2b3020',4);box(c,16,15,32,3,'#111',1.5);box(c,18,13.5,28,2,'#f4c542');
      for(let i=0;i<5;i++)star(c,22.5+i*4.75,10.5,1.9,'#f4c542');
      box(c,21,34,22,3,'#f4c542');for(let i=0;i<3;i++){box(c,23+i*3,39,2,3,['#e03131','#1971c2','#2f9e44'][i]);}
      box(c,13,34,6,18,'#a61e4d',2);box(c,45,34,6,18,'#a61e4d',2);}
    if(g===1)chev(c,22,37,4,'#212529');
    // 무전기 / 지휘봉
    if(g>=3){box(c,43,36,2,12,'#8b5a2b');box(c,42.5,35,3,2,'#f4c542');}else{box(c,43,39,4,8,'#343a40',1);box(c,44,36,1,3,'#343a40');}
  },
};
const sprCache={};
function sprite(k,g){
  const key=k+g;if(sprCache[key])return sprCache[key];
  const cv=S(64,64),c=cv.getContext('2d');c.translate(0,2);DRAW[k](c,g);
  return sprCache[key]=pixelate(cv);
}
// PixelLab 그림이 나중에 추가되면 우선 사용
const ext={};
function loadExt(name){if(ext[name]!==undefined)return;ext[name]=null;const im=new Image();im.onload=()=>{ext[name]=im;};im.onerror=()=>{ext[name]=false;};im.src=(window.KT_ASSET_BASE||'')+'pixel/'+name+'.png';}
NEW_JOBS.forEach(j=>{loadExt(j.key);loadExt(j.key+'_1');loadExt(j.key+'_4');});
function pick(j,g){
  const k=NEW_JOBS[j-5].key,ok=n=>ext[n]?ext[n]:null;
  const im=g===4?ok(k+'_4'):g>=1&&g<=2?ok(k+'_1'):g===3?ok(k):null;
  return im||sprite(k,g);
}
// 그리기 (characters6와 같은 크기·오라 규칙)
const GC=['#a3abb9','#4aa3ff','#b875ff','#ff9a2e','#ff4d8d'];
const K=0.8,DX=-32*K,DY=23-61*K,DS=64*K;
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function glow(c,r,rgb,a){const g=c.createRadialGradient(0,-2,3,0,-2,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,-2,r);c.fill();}
function back(c,j,g,t){
  if(g===2)glow(c,24,'184,117,255',0.22);
  if(g===3)glow(c,28,'255,170,60',0.36);
  if(g>=4){c.save();c.translate(0,-2);c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.24)';for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-36,4,-36]);c.fill();}c.restore();glow(c,32,'255,214,90',0.46);}
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23.4,12,3,0,0,Math.PI*2);c.fill();
  if(g===0){c.strokeStyle=NEW_JOBS[j-5].col;c.lineWidth=2;c.beginPath();c.ellipse(0,23.4,11,2.8,0,0,Math.PI*2);c.stroke();}
}
function front(c,j,g,t){
  if(g>=1&&g<=3){c.fillStyle=GC[g];circ(c,-11,20,2.6);c.fill();c.strokeStyle='rgba(255,255,255,0.8)';c.lineWidth=0.8;c.stroke();}
  if(g===2){c.fillStyle=GC[2];circ(c,-5.5,20.5,2);c.fill();}
  if(g>=4){c.fillStyle='#f4c542';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?3.4*0.45:3.4;c.lineTo(-11+Math.cos(a)*q,19+Math.sin(a)*q);}c.closePath();c.fill();}
}
function blit(c,im,bob){const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;c.drawImage(im,DX,DY+bob,DS,DS);c.imageSmoothingEnabled=sm;}
const prevChars=window.KTChars;
const Chars=Object.assign({},prevChars,{
  draw(c,j,g,x,y,s,t,col){
    if(j<5)return prevChars.draw(c,j,g,x,y,s,t,col);
    const im=pick(j,g);c.save();c.translate(x,y);const k=s*(1+g*0.035)*(g===0?0.92:1);c.scale(k,k);
    back(c,j,g,t);blit(c,im,Math.round(Math.sin(t*3+x*0.07)*(g>=1?1:0.6)));front(c,j,g,t);c.restore();
  },
  portrait(c,j,g,cx,cy,h,t){
    if(j<5)return prevChars.portrait(c,j,g,cx,cy,h,t);
    const im=pick(j,g),s=h/62;c.save();c.translate(cx,cy);c.scale(s,s);back(c,j,g,t||0);blit(c,im,0);front(c,j,g,t||0);c.restore();
  },
});
window.KTChars=Chars;
// ---------------- 투사체 ----------------
function proj(c,job,p,myth,ang){
  if(job===5){c.rotate(p*8);c.strokeStyle=myth?'#f4c542':'#ced4da';c.lineWidth=1.6;circ(c,-2.5,0,2.6);c.stroke();circ(c,2.5,0,2.6);c.stroke();}
  else if(job===6){c.rotate(ang);c.fillStyle='#4dabf7';c.beginPath();c.ellipse(0,0,5,3,0,0,Math.PI*2);c.fill();c.fillStyle='#d0ebff';c.fillRect(1,-1.5,2,1.5);c.fillStyle='rgba(77,171,247,0.5)';c.fillRect(-9,-1,5,2);}
  else if(job===7){c.rotate(p*5);c.fillStyle=myth?'#f4c542':'#f8f9fa';c.fillRect(-4,-5,8,10);c.fillStyle='#c92a2a';c.fillRect(-2.5,-1.5,5,5);c.fillStyle='#fff';c.fillRect(-1,0,2,2);}
  else{c.rotate(ang);c.fillStyle='#495057';c.beginPath();c.ellipse(0,0,4.5,2.6,0,0,Math.PI*2);c.fill();c.fillStyle='#868e96';c.fillRect(-6,-2.4,2,4.8);c.fillStyle='#ffd43b';c.fillRect(2.5,-0.8,1.5,1.6);}
}
// ---------------- 필살기 이펙트 확장 ----------------
function hookFX(){
  const F=window.KTFX;if(!F||F._v10)return;F._v10=true;
  Object.assign(F.ULT,ULT_NEW);
  const prevUlt=F.ult,prevDraw=F.draw;
  F.ult=function(push,job,ux,uy,pts){
    if(job<5)return prevUlt(push,job,ux,uy,pts);
    const U=ULT_NEW[job];
    push({k:'ulttext',x:ux,y:uy-40,txt:U.name,col:U.col,life:1.1});push({k:'flash',col:U.col,life:0.3});push({k:'muzzle',x:ux,y:uy,col:U.col,r:34,life:0.35});
    F.shake(job===8?7:4,0.35);
    if(job===5){push({k:'siren',x:ux,y:uy,life:0.9});for(const p of pts){push({k:'shock',x:p[0],y:p[1],col:rnd()<0.5?'#ff6b6b':'#5c8dff',r0:4,r1:30,w:3,life:0.4});}}
    else if(job===6){for(const p of pts)push({k:'water',x1:ux,y1:uy,x2:p[0],y2:p[1],life:0.55});}
    else if(job===7){pts.forEach((p,i)=>push({k:'stamp',x:p[0],y:p[1],delay:0.06*i,life:0.06*i+0.6}));}
    else{pts.forEach((p,i)=>{const dl=0.1*i;push({k:'bomb',x:p[0],y:p[1],delay:dl,life:dl+0.35});push({k:'shock',x:p[0],y:p[1],col:'#ffa94d',r0:8,r1:80,w:5,delay:dl+0.3,life:dl+0.75});
      push({k:'spark',x:p[0],y:p[1],col:'#ffd43b',ps:Array.from({length:14},()=>{const a=rnd()*6.28,v=70+rnd()*120;return [Math.cos(a)*v,Math.sin(a)*v-40,2+rnd()*2];}),delay:dl+0.3,life:dl+0.85,add:true});});}
  };
  F.draw=function(c,f,a){
    if(prevDraw(c,f,a))return true;
    const tt=f.max-f.life-(f.delay||0);if(tt<0)return true;const dur=f.max-(f.delay||0),p=Math.min(1,tt/dur),q=1-p;
    if(f.k==='siren'){c.save();c.globalCompositeOperation='lighter';const on=Math.floor(tt*10)%2;const gr=c.createRadialGradient(f.x,f.y,0,f.x,f.y,160);
      gr.addColorStop(0,on?`rgba(255,80,80,${0.45*q})`:`rgba(80,120,255,${0.45*q})`);gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.beginPath();c.arc(f.x,f.y,160,0,6.3);c.fill();c.restore();return true;}
    if(f.k==='water'){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';const e=Math.min(1,p*3);const x2=f.x1+(f.x2-f.x1)*e,y2=f.y1+(f.y2-f.y1)*e;
      c.strokeStyle=`rgba(77,171,247,${0.5*q})`;c.lineWidth=10;c.beginPath();c.moveTo(f.x1,f.y1);c.quadraticCurveTo((f.x1+x2)/2,Math.min(f.y1,y2)-30,x2,y2);c.stroke();
      c.strokeStyle=`rgba(230,245,255,${0.85*q})`;c.lineWidth=3;c.stroke();
      for(let k=0;k<6;k++){const r=8+k*5*p;c.fillStyle=`rgba(165,216,255,${0.6*q})`;c.fillRect(f.x2+Math.cos(k*1.1)*r-1.5,f.y2+Math.sin(k*1.1)*r-1.5,3,3);}c.restore();return true;}
    if(f.k==='stamp'){const s=p<0.2?2-p/0.2:1;c.save();c.globalAlpha=Math.min(1,q*2.5);c.translate(f.x,f.y-10);c.rotate(-0.2);c.scale(s,s);
      c.strokeStyle='#e03131';c.lineWidth=2.5;c.strokeRect(-15,-9,30,18);c.fillStyle='#e03131';c.font='bold 11px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('승인',0,1);c.restore();return true;}
    if(f.k==='bomb'){const fall=Math.min(1,p/0.85);if(fall>=1)return true;const y=f.y-180*(1-fall);c.save();c.translate(f.x,y);
      c.fillStyle='#495057';c.beginPath();c.ellipse(0,0,4,7,0,0,6.3);c.fill();c.fillStyle='#868e96';c.fillRect(-4,-9,8,2.5);c.restore();return true;}
    return false;
  };
}
// ---------------- 게임 연결 ----------------
window.KTJobs={
  NEW_JOBS,NEW_MYTH,PROFILES,proj,sprite,
  ALL_NAMES:['의사','변호사','건축가','회계사','개발자'].concat(NEW_JOBS.map(j=>j.name)),
  ALL_ICONS:['🩺','⚖️','📐','🧮','💻'].concat(NEW_JOBS.map(j=>j.icon)),
  extendJobs(JOBS,MYTH){if(JOBS.length>5)return;NEW_JOBS.forEach(j=>JOBS.push(Object.assign({},j)));NEW_MYTH.forEach(m=>MYTH.push(m));},
};
if(window.KTProfiles&&window.KTProfiles.length===5)PROFILES.forEach(p=>window.KTProfiles.push(p));
hookFX();
})();
