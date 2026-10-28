// 칼퇴 디펜스 — 성장 체감 이펙트 모듈 v9
// 직급이 오를수록 공격이 눈에 띄게 화려해짐
//   인턴: 작은 탄 / 대리: 꼬리 궤적 / 과장: 피격 불꽃 + 데미지 숫자 / 부장: 충격파 + 강타 / 대표: 광선 + 필살기 + 화면 흔들림
// 게임은 fx 객체를 S.fx에 넣고(life 감소는 게임이 처리), 그릴 때 KTFX.draw(ctx,f,a)를 호출
(function(){
'use strict';
const rnd=Math.random;
const FONT='"Jua","Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${Math.max(0,Math.min(1,a))})`;}
let shakeT=0,shakeMag=0,shakeOn=true;try{shakeOn=localStorage.getItem('kt_shake')!=='0';}catch(e){}
function shake(mag,dur){if(!shakeOn)return;if(mag>=shakeMag*(shakeT>0?1:0)){shakeMag=mag;shakeT=dur||0.25;}}
function tick(dt){if(shakeT>0){shakeT-=dt;if(shakeT<=0){shakeT=0;shakeMag=0;}}}
function offset(){if(shakeT<=0)return [0,0];const m=shakeMag*Math.min(1,shakeT*6);return [(rnd()*2-1)*m,(rnd()*2-1)*m];}
function parts(n,v0,v1,up){const ps=[];for(let k=0;k<n;k++){const a=rnd()*Math.PI*2,v=v0+rnd()*(v1-v0);ps.push([Math.cos(a)*v,Math.sin(a)*v-(up||0),1.5+rnd()*2.5]);}return ps;}
// ---------------- 생성 ----------------
// o: {job,g,x1,y1,x2,y2,col,crit,strong}
function attack(push,o){
  const g=o.g;
  if(g>=4){
    push({k:'beam',x1:o.x1,y1:o.y1,x2:o.x2,y2:o.y2,col:o.col,w:o.strong?14:9,life:0.22});
    push({k:'muzzle',x:o.x1,y:o.y1,col:o.col,r:16,life:0.18});
  }else if(g>=1){
    push({k:'trail',x1:o.x1,y1:o.y1,x2:o.x2,y2:o.y2,col:o.col,g,life:0.2});
    if(g>=3)push({k:'muzzle',x:o.x1,y:o.y1,col:o.col,r:11,life:0.14});
  }
  impact(push,o);
}
function impact(push,o){
  const g=o.g,d=g>=4?0.02:0.13;
  if(g>=2)push({k:'spark',x:o.x2,y:o.y2,col:o.col,ps:parts(4+g*2,50,90+g*25,20),delay:d,life:d+0.38,add:g>=3});
  if(g>=3||o.strong||o.crit)push({k:'shock',x:o.x2,y:o.y2,col:o.crit?'#ffd43b':o.col,r0:6,r1:(g>=4?46:30)+(o.strong?16:0),w:g>=4?4:3,delay:d,life:d+0.3});
  if(o.strong&&g>=4)shake(2.2,0.15);
}
function num(push,x,y,v,g,crit){
  const txt=v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(1)+'K':String(Math.round(v));
  push({k:'num',x:x+(rnd()*16-8),y:y-14,txt:crit?txt+'!':txt,g,crit,life:crit?0.9:0.6});
}
function pillar(push,x,y,col,big){
  push({k:'pillar',x,y,col,w:big?70:46,life:big?1.1:0.8});
  push({k:'spark',x,y,col,ps:parts(big?28:16,60,170,60),life:0.7,add:true});
  push({k:'shock',x,y,col,r0:10,r1:big?120:80,w:4,life:0.5});
  if(big){push({k:'flash',col,life:0.35});shake(5,0.35);}
}
// 대표 필살기 연출
const ULT={
  0:{name:'긴급 수술!',col:'#7fe0ff'},
  1:{name:'최종 판결!',col:'#ffe066'},
  2:{name:'재건축!',col:'#ffa94d'},
  3:{name:'세무조사!',col:'#69db7c'},
  4:{name:'긴급 배포!',col:'#b197fc'},
};
function ult(push,job,ux,uy,pts){
  const U=ULT[job];
  push({k:'ulttext',x:ux,y:uy-40,txt:U.name,col:U.col,life:1.1});
  push({k:'flash',col:U.col,life:0.3});
  push({k:'muzzle',x:ux,y:uy,col:U.col,r:34,life:0.35});
  shake(job===1||job===2?6:4,0.35);
  if(job===0){for(const p of pts){push({k:'cross',x:p[0],y:p[1],life:0.7});push({k:'shock',x:p[0],y:p[1],col:U.col,r0:4,r1:34,w:3,life:0.35});}}
  else if(job===1){const p=pts[0];if(p){push({k:'gavel',x:p[0],y:p[1],life:0.7});push({k:'shock',x:p[0],y:p[1],col:'#ffe066',r0:10,r1:130,w:6,delay:0.28,life:0.75});push({k:'spark',x:p[0],y:p[1],col:'#ffe066',ps:parts(26,80,220,40),delay:0.28,life:0.9,add:true});}}
  else if(job===2){pts.forEach((p,i)=>{const dl=0.12*i;push({k:'meteor',x:p[0],y:p[1],delay:dl,life:dl+0.4});push({k:'shock',x:p[0],y:p[1],col:'#ffa94d',r0:8,r1:90,w:5,delay:dl+0.3,life:dl+0.75});push({k:'spark',x:p[0],y:p[1],col:'#ffcf6b',ps:parts(16,70,180,40),delay:dl+0.3,life:dl+0.85,add:true});});}
  else if(job===3){for(const p of pts)push({k:'coins',x:p[0],y:p[1],ps:Array.from({length:5},()=>[rnd()*30-15,-60-rnd()*60]),life:0.7});}
  else if(job===4){push({k:'chain',pts:[[ux,uy]].concat(pts),seed:rnd()*99,life:0.45});for(const p of pts)push({k:'spark',x:p[0],y:p[1],col:'#d0bfff',ps:parts(6,40,120,10),life:0.4,add:true});}
}
// ---------------- 그리기 ----------------
function draw(c,f,a){
  const tt0=f.max-f.life,tt=tt0-(f.delay||0);if(tt<0)return true;
  const dur=f.max-(f.delay||0),p=Math.min(1,tt/dur),q=1-p;
  switch(f.k){
  case 'trail':{const h=Math.min(1,p*1.6),t0=Math.max(0,h-0.45);
    const x0=f.x1+(f.x2-f.x1)*t0,y0=f.y1+(f.y2-f.y1)*t0,x1=f.x1+(f.x2-f.x1)*h,y1=f.y1+(f.y2-f.y1)*h-Math.sin(Math.PI*h)*14;
    c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
    c.strokeStyle=rgba(f.col,0.55*q);c.lineWidth=2+f.g*1.6;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
    if(f.g>=3){c.strokeStyle=`rgba(255,255,255,${0.7*q})`;c.lineWidth=1.4;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();}
    c.restore();return true;}
  case 'beam':{const e=Math.min(1,p*4);const x2=f.x1+(f.x2-f.x1)*e,y2=f.y1+(f.y2-f.y1)*e;
    c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
    c.strokeStyle=rgba(f.col,0.32*q);c.lineWidth=f.w*1.8;c.beginPath();c.moveTo(f.x1,f.y1);c.lineTo(x2,y2);c.stroke();
    c.strokeStyle=rgba(f.col,0.8*q);c.lineWidth=f.w*0.7;c.stroke();
    c.strokeStyle=`rgba(255,255,255,${0.95*q})`;c.lineWidth=Math.max(1.5,f.w*0.25);c.stroke();
    const gr=c.createRadialGradient(x2,y2,0,x2,y2,f.w*2.2);gr.addColorStop(0,`rgba(255,255,255,${0.9*q})`);gr.addColorStop(1,rgba(f.col,0));c.fillStyle=gr;c.beginPath();c.arc(x2,y2,f.w*2.2,0,Math.PI*2);c.fill();
    c.restore();return true;}
  case 'muzzle':{c.save();c.globalCompositeOperation='lighter';const r=f.r*(0.6+p*0.8);
    const gr=c.createRadialGradient(f.x,f.y,0,f.x,f.y,r);gr.addColorStop(0,`rgba(255,255,255,${0.7*q})`);gr.addColorStop(0.4,rgba(f.col,0.5*q));gr.addColorStop(1,rgba(f.col,0));
    c.fillStyle=gr;c.beginPath();c.arc(f.x,f.y,r,0,Math.PI*2);c.fill();c.restore();return true;}
  case 'spark':{c.save();if(f.add)c.globalCompositeOperation='lighter';c.fillStyle=rgba(f.col,q);
    for(const s of f.ps){const x=f.x+s[0]*tt,y=f.y+s[1]*tt+140*tt*tt,z=s[2]*(0.5+q*0.7);c.fillRect(x-z/2,y-z/2,z,z);}
    c.restore();return true;}
  case 'shock':{const r=f.r0+(f.r1-f.r0)*(1-Math.pow(q,2.2));c.save();
    c.strokeStyle=rgba(f.col,0.85*q);c.lineWidth=f.w*q+0.5;c.beginPath();c.arc(f.x,f.y,r,0,Math.PI*2);c.stroke();
    c.fillStyle=rgba(f.col,0.12*q);c.fill();c.restore();return true;}
  case 'num':{const s=p<0.15?0.6+p/0.15*0.6:1.2-Math.min(0.2,(p-0.15));const size=(f.crit?18:11+Math.min(4,f.g)*1.6)*s;
    c.save();c.globalAlpha=Math.min(1,q*2.2);c.font=`${size}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';
    const y=f.y-p*(f.crit?34:24);c.lineWidth=3;c.strokeStyle='rgba(0,0,0,0.75)';c.strokeText(f.txt,f.x,y);
    c.fillStyle=f.crit?'#ffd43b':['#e9ecf2','#9fd0ff','#d7b4ff','#ffc27a','#ff8fbf'][Math.min(4,f.g)];c.fillText(f.txt,f.x,y);c.restore();return true;}
  case 'flash':{c.save();c.globalCompositeOperation='lighter';c.fillStyle=rgba(f.col,0.22*q);c.fillRect(-20,-20,600,740);c.restore();return true;}
  case 'ulttext':{const s=p<0.12?0.4+p/0.12*0.9:1.3-Math.min(0.3,(p-0.12)*0.6);
    c.save();c.globalAlpha=Math.min(1,q*3);c.translate(Math.max(80,Math.min(460,f.x)),Math.max(40,f.y-p*16));c.scale(s,s);
    c.font=`26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=6;c.strokeStyle='rgba(20,10,30,0.9)';c.strokeText(f.txt,0,0);
    const gr=c.createLinearGradient(0,-14,0,14);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,f.col);c.fillStyle=gr;c.fillText(f.txt,0,0);c.restore();return true;}
  case 'pillar':{c.save();c.globalCompositeOperation='lighter';const w=f.w*(p<0.2?p/0.2:1)*(0.6+0.4*q);
    const gr=c.createLinearGradient(f.x-w/2,0,f.x+w/2,0);gr.addColorStop(0,rgba(f.col,0));gr.addColorStop(0.5,rgba(f.col,0.55*q));gr.addColorStop(1,rgba(f.col,0));
    c.fillStyle=gr;c.fillRect(f.x-w/2,f.y-260,w,300);c.fillStyle=`rgba(255,255,255,${0.5*q})`;c.fillRect(f.x-w*0.08,f.y-260,w*0.16,300);c.restore();return true;}
  case 'cross':{c.save();c.globalAlpha=q;c.fillStyle='#ffffff';const y=f.y-p*30,s=6+p*4;c.fillRect(f.x-s,y-s*0.35,s*2,s*0.7);c.fillRect(f.x-s*0.35,y-s,s*0.7,s*2);
    c.fillStyle='#ff6b6b';const s2=s*0.75;c.fillRect(f.x-s2,y-s2*0.3,s2*2,s2*0.6);c.fillRect(f.x-s2*0.3,y-s2,s2*0.6,s2*2);c.restore();return true;}
  case 'gavel':{const fall=Math.min(1,p/0.4),y=f.y-120*(1-fall*fall),ang=-0.9*(1-fall);
    c.save();c.globalAlpha=Math.min(1,q*3);c.translate(f.x+10,y-18);c.rotate(ang);c.scale(1.6,1.6);
    c.fillStyle='#8a5a2b';c.fillRect(-2,-2,4,30);c.fillStyle='#f4c542';c.fillRect(-14,-12,28,14);c.fillStyle='#b8860b';c.fillRect(-14,-6,28,2);c.fillRect(-16,-12,3,14);c.fillRect(13,-12,3,14);c.restore();return true;}
  case 'meteor':{const fall=Math.min(1,p/0.75),x=f.x-110*(1-fall),y=f.y-170*(1-fall);if(fall>=1)return true;
    c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,170,80,0.55)';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(x-40,y-60);c.lineTo(x,y);c.stroke();c.restore();
    c.save();c.translate(x,y);c.rotate(tt*14);c.fillStyle='#3b7dd8';c.fillRect(-12,-5,24,10);c.fillStyle='#d0e4ff';c.fillRect(-2,-5,4,10);c.restore();return true;}
  case 'coins':{c.save();c.globalAlpha=Math.min(1,q*2.5);for(const s of f.ps){const fall=Math.min(1,p*1.8),x=f.x+s[0],y=f.y+s[1]*(1-fall)-6;
    c.fillStyle='#f4c542';c.beginPath();c.ellipse(x,y,5,5*Math.abs(Math.cos(tt*12+s[0])),0,0,Math.PI*2);c.fill();c.strokeStyle='#b8860b';c.lineWidth=1;c.stroke();}c.restore();return true;}
  case 'chain':{c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';
    let sd=f.seed+Math.floor(tt*30);const r=()=>{sd=(sd*9301+49297)%233280;return sd/233280-0.5;};
    for(const pass of [[8,'rgba(177,151,252,'+(0.35*q)+')'],[2.4,'rgba(255,255,255,'+(0.95*q)+')']]){c.strokeStyle=pass[1];c.lineWidth=pass[0];c.beginPath();
      f.pts.forEach((pt,i)=>{if(i===0){c.moveTo(pt[0],pt[1]);return;}const pr=f.pts[i-1];for(let k=1;k<=4;k++){const t=k/4;c.lineTo(pr[0]+(pt[0]-pr[0])*t+(k<4?r()*18:0),pr[1]+(pt[1]-pr[1])*t+(k<4?r()*18:0));}});c.stroke();}
    c.restore();return true;}
  }
  return false;
}
// 직원 발밑 오라 (상태 없이 시간으로 계산) — 캐릭터 그리기 전에 호출
function aura(c,x,y,g,col,t,lv){
  if(g>=2){c.save();c.globalCompositeOperation='lighter';
    const n=g>=4?6:g>=3?4:2;
    for(let k=0;k<n;k++){const ph=(t*0.7+k/n+x*0.013)%1;const ax=x+Math.sin(k*2.4+t*1.3)*(10+g*2),ay=y+16-ph*(26+g*6);
      c.fillStyle=rgba(g>=4?'#ffd65a':col,(1-ph)*(g>=4?0.9:0.6));const s=g>=4?2.6:2;c.fillRect(ax-s/2,ay-s/2,s,s);}
    if(g>=4){c.strokeStyle=`rgba(255,214,90,${0.35+0.2*Math.sin(t*4)})`;c.lineWidth=1.5;c.beginPath();c.ellipse(x,y+19,17+Math.sin(t*3)*1.5,4.5,0,0,Math.PI*2);c.stroke();}
    c.restore();}
  if(lv>=5){c.save();c.fillStyle=lv>=10?'#ff8fbf':'#ffd43b';c.font=`9px ${FONT}`;c.textAlign='center';c.fillText(lv>=10?'★★':'★',x+15,y-22);c.restore();}
}
window.KTFX={attack,impact,num,pillar,ult,ULT,draw,aura,shake,tick,offset,setShake:b=>{shakeOn=!!b;}};
})();
