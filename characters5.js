// 칼퇴 디펜스 — 캐릭터 모듈 v5 (PixelLab 픽셀아트 시범판)
// pixel/{doctor,lawyer,architect,accountant,developer}.png — PixelLab에서 생성한 64×64 정면 스프라이트(부장 디자인)
// 시범 단계라 직업당 1장(부장)만 있음 → 인턴은 흑백, 대리~대표는 컬러 + 직급별 오라로 구분
// 이미지가 없거나 로드 전이면 직전에 로드된 KTChars로 그림
(function(){
'use strict';
const prev=window.KTChars;
const NAMES=['doctor','lawyer','architect','accountant','developer'];
const K=0.8,DX=-32*K,DY=23-61*K,DS=64*K;
const imgs=NAMES.map(()=>null),gray=NAMES.map(()=>null);
const base=(window.KT_ASSET_BASE||'')+'pixel/';
const ready=Promise.all(NAMES.map((n,j)=>new Promise(res=>{
  const im=new Image();
  im.onload=()=>{imgs[j]=im;
    try{const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.drawImage(im,0,0);
      const d=x.getImageData(0,0,64,64),p=d.data;for(let i=0;i<p.length;i+=4){const v=p[i]*0.3+p[i+1]*0.59+p[i+2]*0.11;p[i]=p[i+1]=p[i+2]=v*0.9+20;}x.putImageData(d,0,0);gray[j]=c;}catch(e){gray[j]=im;}
    res(true);};
  im.onerror=()=>res(false);im.src=base+n+'.png';
})));
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
function glow(c,r,rgb,a){const g=c.createRadialGradient(0,-2,3,0,-2,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,-2,r);c.fill();}
const GC=['#a3abb9','#4aa3ff','#b875ff','#ff9a2e','#ff4d8d'];
function back(c,g,t){
  if(g===3)glow(c,28,'255,170,60',0.36);
  if(g>=4){c.save();c.translate(0,-2);c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.24)';for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-36,4,-36]);c.fill();}c.restore();glow(c,32,'255,214,90',0.46);}
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23.4,12,3,0,0,Math.PI*2);c.fill();
}
function front(c,g,t){
  if(g>=1&&g<=3){c.fillStyle=GC[g];circ(c,-11,20,2.6);c.fill();c.strokeStyle='rgba(255,255,255,0.8)';c.lineWidth=0.8;c.stroke();}
  if(g>=4){const sp=(t*2)%1;c.globalAlpha=1-sp;c.fillStyle='#fff6c2';star(c,14,-24-sp*4,2.3);c.fill();c.globalAlpha=1;}
}
function blit(c,j,g,bob){
  const im=g===0?gray[j]:imgs[j];
  const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;
  c.drawImage(im,DX,DY+bob,DS,DS);c.imageSmoothingEnabled=sm;
}
function draw(c,j,g,x,y,s,t,col){
  if(!imgs[j]){if(prev)return prev.draw(c,j,g,x,y,s,t,col);return;}
  c.save();c.translate(x,y);const k=s*(1+g*0.035)*(g===0?0.9:1);c.scale(k,k);
  back(c,g,t);blit(c,j,g,Math.round(Math.sin(t*3+x*0.07)*(g>=1?1:0.6)));front(c,g,t);
  c.restore();
}
function portrait(c,j,g,cx,cy,h,t){
  if(!imgs[j]){if(prev&&prev.portrait)return prev.portrait(c,j,g,cx,cy,h,t);return;}
  const s=h/62;c.save();c.translate(cx,cy);c.scale(s,s);back(c,g,t||0);blit(c,j,g,0);front(c,g,t||0);c.restore();
}
window.KTChars={draw,portrait,ready,version:5,GRADECOL:GC,JOBCOL:prev?prev.JOBCOL:['#7fe0ff','#ffe066','#ffa94d','#69db7c','#b197fc'],credit:'캐릭터: PixelLab으로 생성(시범)'};
})();
