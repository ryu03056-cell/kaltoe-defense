// 칼퇴 디펜스 — 캐릭터 모듈 v4 (Kenney Modular Character Pack 기반 아틀라스)
// 원화: Kenney (www.kenney.nl) "Modular Character Pack" — CC0 (퍼블릭 도메인). 직업 소품은 직접 추가.
// kenney_chars.png: 5행(직업) × 5열(직급), 칸 240×350
// 사용법은 이전 모듈과 같음: KTChars.draw(ctx, job, grade, x, y, scale, time) / KTChars.portrait(ctx, job, grade, cx, cy, height, time)
// 이미지가 로드되기 전에는 직전에 로드된 KTChars(예: characters3.js)로 그림
(function(){
'use strict';
const prev=window.KTChars;
const CW=240,CH=350,K=50/258,DX=-120*K,DY=23-279*K,DW=CW*K,DH=CH*K;
const img=new Image();let ok=false;
const ready=new Promise(res=>{img.onload=()=>{ok=true;res(true);};img.onerror=()=>res(false);});
img.src=(window.KT_ASSET_BASE||'')+'kenney_chars.png';
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
function glow(c,r,rgb,a,y){const g=c.createRadialGradient(0,y,3,0,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,y,r);c.fill();}
function back(c,g,t){
  if(g===3)glow(c,28,'255,170,60',0.34,-2);
  if(g>=4){c.save();c.translate(0,-2);c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.24)';for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-36,4,-36]);c.fill();}c.restore();glow(c,32,'255,214,90',0.46,-2);}
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23.4,13,3.2,0,0,Math.PI*2);c.fill();
}
function front(c,g,t){
  if(g>=4){const sp=(t*2)%1;c.globalAlpha=1-sp;c.fillStyle='#fff6c2';star(c,14,-22-sp*4,2.3);c.fill();c.globalAlpha=1;}
}
function blit(c,j,g,bob){c.drawImage(img,g*CW,j*CH,CW,CH,DX,DY+bob,DW,DH);}
function draw(c,j,g,x,y,s,t,col){
  if(!ok){if(prev)return prev.draw(c,j,g,x,y,s,t,col);return;}
  c.save();c.translate(x,y);const k=s*(1+g*0.035);c.scale(k,k);
  back(c,g,t);blit(c,j,g,Math.sin(t*3+x*0.07)*(g>=1?1:0.6));front(c,g,t);
  c.restore();
}
function portrait(c,j,g,cx,cy,h,t){
  if(!ok){if(prev&&prev.portrait)return prev.portrait(c,j,g,cx,cy,h,t);return;}
  const s=h/62;c.save();c.translate(cx,cy);c.scale(s,s);back(c,g,t||0);blit(c,j,g,0);front(c,g,t||0);c.restore();
}
window.KTChars={draw,portrait,ready,version:4,GRADECOL:['#a3abb9','#4aa3ff','#b875ff','#ff9a2e','#ff4d8d'],JOBCOL:['#7fe0ff','#ffe066','#ffa94d','#69db7c','#b197fc'],credit:'캐릭터 원화: Kenney (kenney.nl, CC0)'};
})();
