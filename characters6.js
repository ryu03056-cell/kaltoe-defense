// 칼퇴 디펜스 — 캐릭터 모듈 v6 (PixelLab 픽셀아트, 직급별 이미지)
// 파일 규칙 (pixel/ 폴더, 64×64 정면):
//   intern.png            공용 인턴 (모든 직업) — 직업은 발밑 색 리본으로 구분
//   {job}_1.png           대리·과장 공용 (없으면 {job}.png 사용)
//   {job}.png             부장 (대표는 같은 그림 + 금빛 후광)
//   {job}_4.png           대표 전용 (있으면 우선 사용, 유료 생성분 추가용)
// job: doctor, lawyer, architect, accountant, developer
// 이미지가 없거나 로드 전이면 직전에 로드된 KTChars로 그림
(function(){
'use strict';
const prev=window.KTChars;
const NAMES=['doctor','lawyer','architect','accountant','developer'];
const JOBCOL=['#7fe0ff','#ffe066','#ffa94d','#69db7c','#b197fc'];
const GC=['#a3abb9','#4aa3ff','#b875ff','#ff9a2e','#ff4d8d'];
const K=0.8,DX=-32*K,DY=23-61*K,DS=64*K;
const base=(window.KT_ASSET_BASE||'')+'pixel/';
const cache={};
function load(name){
  if(cache[name]!==undefined)return cache[name];
  cache[name]=null;
  const p=new Promise(res=>{const im=new Image();im.onload=()=>{cache[name]=im;res(im);};im.onerror=()=>{cache[name]=false;res(false);};im.src=base+name+'.png';});
  cache['p:'+name]=p;return null;
}
const all=['intern'].concat(NAMES,NAMES.map(n=>n+'_1'),NAMES.map(n=>n+'_4'));
all.forEach(load);
const ready=Promise.all(all.map(n=>cache['p:'+n]));
function pick(j,g){
  const n=NAMES[j],ok=x=>cache[x]&&cache[x]!==false?cache[x]:null;
  if(g===0)return ok('intern')||ok(n);
  if(g<=2)return ok(n+'_1')||ok(n);
  if(g===4)return ok(n+'_4')||ok(n);
  return ok(n);
}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
function glow(c,r,rgb,a){const g=c.createRadialGradient(0,-2,3,0,-2,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,-2,r);c.fill();}
function back(c,j,g,t){
  if(g===2)glow(c,24,'184,117,255',0.22);
  if(g===3)glow(c,28,'255,170,60',0.36);
  if(g>=4){c.save();c.translate(0,-2);c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.24)';for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-36,4,-36]);c.fill();}c.restore();glow(c,32,'255,214,90',0.46);}
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23.4,12,3,0,0,Math.PI*2);c.fill();
  if(g===0){c.strokeStyle=JOBCOL[j];c.lineWidth=2;c.beginPath();c.ellipse(0,23.4,11,2.8,0,0,Math.PI*2);c.stroke();}
}
function front(c,j,g,t){
  if(g>=1&&g<=3){c.fillStyle=GC[g];circ(c,-11,20,2.6);c.fill();c.strokeStyle='rgba(255,255,255,0.8)';c.lineWidth=0.8;c.stroke();}
  if(g===2){c.fillStyle=GC[2];circ(c,-5.5,20.5,2);c.fill();}
  if(g>=4){c.fillStyle='#f4c542';star(c,-11,19,3.4);c.fill();const sp=(t*2)%1;c.globalAlpha=1-sp;c.fillStyle='#fff6c2';star(c,14,-24-sp*4,2.3);c.fill();c.globalAlpha=1;}
}
function blit(c,im,bob){const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;c.drawImage(im,DX,DY+bob,DS,DS);c.imageSmoothingEnabled=sm;}
function draw(c,j,g,x,y,s,t,col){
  const im=pick(j,g);
  if(!im){if(prev)return prev.draw(c,j,g,x,y,s,t,col);return;}
  c.save();c.translate(x,y);const k=s*(1+g*0.035)*(g===0?0.92:1);c.scale(k,k);
  back(c,j,g,t);blit(c,im,Math.round(Math.sin(t*3+x*0.07)*(g>=1?1:0.6)));front(c,j,g,t);
  c.restore();
}
function portrait(c,j,g,cx,cy,h,t){
  const im=pick(j,g);
  if(!im){if(prev&&prev.portrait)return prev.portrait(c,j,g,cx,cy,h,t);return;}
  const s=h/62;c.save();c.translate(cx,cy);c.scale(s,s);back(c,j,g,t||0);blit(c,im,0);front(c,j,g,t||0);c.restore();
}
window.KTChars={draw,portrait,ready,version:6,GRADECOL:GC,JOBCOL,credit:'직원 캐릭터: PixelLab 생성'};
})();
