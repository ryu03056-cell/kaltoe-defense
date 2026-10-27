// 칼퇴 디펜스 — 캐릭터 모듈 v3 (고해상도 스프라이트 + 외곽선 + 명암)
// KTChars.draw(ctx, job, grade, x, y, scale, time, jobColor)   게임 안 (characters.js / characters2.js와 같은 사용법)
// KTChars.portrait(ctx, job, grade, cx, cy, height, time)      큰 초상화 (선택 패널·배너·도감)
// 원리: 직업×직급 25종을 4배 해상도로 한 번만 그려 캐시 → 외곽선·조명 후처리 → 매 프레임은 이미지만 그림
(function(){
'use strict';
const R=4, BOX={x:-29,y:-33,w:58,h:62};
const GOLD='#f4c542',INK='#22222a',SKIN='#f6d2ad',SKIN_D='#e8b48f';
const JOBCOL=['#7fe0ff','#ffe066','#ffa94d','#69db7c','#b197fc'];
const GRADECOL=['#a3abb9','#4aa3ff','#b875ff','#ff9a2e','#ff4d8d'];
const IRIS=['#6b4630','#2f4a8a','#5a3a22','#2f6b45','#4b3a8a'];
const HAIR=['#2b2420','#1d1a24','#5a3b28','#3b2a20','#2e2a33'];

// ---------- 도형 도우미 ----------
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function ell(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function line(c,a,b,d,e){c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.stroke();}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
function mix(hex,t,to){const n=parseInt(hex.slice(1),16),m=to==='black'?0:255;const r=(n>>16)&255,g=(n>>8)&255,b=n&255;const f=v=>Math.round(v+(m-v)*t);return `rgb(${f(r)},${f(g)},${f(b)})`;}
const lighter=(h,t)=>mix(h,t,'white'),darker=(h,t)=>mix(h,t,'black');
// 도형 안쪽에 왼쪽 위 빛 / 오른쪽 그림자
function shade(c,path,x0,x1,dark){
  c.save();path();c.clip();
  const g=c.createLinearGradient(x0,0,x1,0);
  g.addColorStop(0,'rgba(255,255,255,0.16)');g.addColorStop(0.5,'rgba(255,255,255,0)');g.addColorStop(0.62,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${dark==null?0.24:dark})`);
  c.fillStyle=g;c.fillRect(x0-4,-40,x1-x0+8,80);c.restore();
}
function fillShade(c,path,col,x0,x1,dark){path();c.fillStyle=col;c.fill();shade(c,path,x0,x1,dark);}

// ---------- 직업·직급 스타일 ----------
function style(j,g){
  if(g===0)return {hair:'intern',hairCol:'#4a3426',top:'#d5dae2',arm:'#d5dae2',pants:'#6c7280',shoe:'#2b2b33',expr:'nervous',female:false};
  const myth=g>=4,S={expr:['','smile','confident','smug','grin'][g],hairCol:HAIR[j]};
  if(j===0)Object.assign(S,{hair:'neat',top:'#ffffff',arm:'#ffffff',pants:'#7fb3e6',shoe:'#eef1f5',coat:true});
  if(j===1)Object.assign(S,{hair:g>=3?'bun':'long',top:myth?'#14182b':'#283766',arm:myth?'#14182b':'#283766',pants:myth?'#14182b':'#283766',shoe:'#111116',female:true,skirt:true});
  if(j===2)Object.assign(S,{hair:'messy',top:'#2f2f35',arm:'#2f2f35',pants:'#8a7a5c',shoe:g>=2?'#9a6a3a':'#4a3a2a',vest:g>=2,helmet:g>=2?(g===2?'#f5c518':'#f4f4f4'):null,boots:g>=2});
  if(j===3)Object.assign(S,{hair:'bob',top:g>=3?(myth?'#1f3a2b':'#2f5a42'):'#6b9a76',arm:g>=3?(myth?'#1f3a2b':'#2f5a42'):'#6b9a76',pants:'#4f5461',shoe:'#1d1d22',female:true,sleeves:g<3});
  if(j===4)Object.assign(S,{hair:'hood',top:myth?'#17171d':g>=3?'#3f4588':'#5b62b0',arm:myth?'#17171d':g>=3?'#3f4588':'#5b62b0',pants:'#3b5b8c',shoe:'#f2f2f2',sneaker:true,expr:g===3?'tired':S.expr});
  if(g>=3&&j===0)S.hairCol='#4a4540';
  if(myth&&j===0)S.hairCol='#8e8a86';
  return S;
}

// ---------- 하체 ----------
function legs(c,S){
  if(S.skirt){
    c.fillStyle=SKIN_D;rr(c,-5,15,3,6.5,1.4);c.fill();rr(c,2,15,3,6.5,1.4);c.fill();
    fillShade(c,()=>poly(c,[-9,12.5,9,12.5,11,19.5,-11,19.5]),S.pants,-11,11);
    c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=0.6;line(c,-3,13,-4,19.3);line(c,3,13,4,19.3);
  }else{
    fillShade(c,()=>rr(c,-7.6,13.5,6.6,8.2,2),S.pants,-7.6,-1,0.18);
    fillShade(c,()=>rr(c,1,13.5,6.6,8.2,2),S.pants,1,7.6,0.18);
    c.strokeStyle='rgba(0,0,0,0.2)';c.lineWidth=0.5;line(c,-4.3,15,-4.3,21);line(c,4.3,15,4.3,21);
  }
  // 신발
  const sh=S.shoe;
  if(S.boots){c.fillStyle=sh;rr(c,-9,18.8,8.6,4.8,1.8);c.fill();rr(c,0.4,18.8,8.6,4.8,1.8);c.fill();c.fillStyle='rgba(0,0,0,0.35)';c.fillRect(-9,22.4,8.6,1.2);c.fillRect(0.4,22.4,8.6,1.2);}
  else{c.fillStyle=sh;rr(c,-8.8,20.6,8.2,3.1,1.5);c.fill();rr(c,0.6,20.6,8.2,3.1,1.5);c.fill();}
  if(S.sneaker){c.fillStyle='#b197fc';c.fillRect(-7.5,21.5,5,0.8);c.fillRect(2,21.5,5,0.8);c.fillStyle='#d9d9e0';c.fillRect(-8.8,23,8.2,0.7);c.fillRect(0.6,23,8.2,0.7);}
  c.fillStyle='rgba(255,255,255,0.35)';ell(c,-6,21.3,1.4,0.5);c.fill();ell(c,3.4,21.3,1.4,0.5);c.fill();
}

// ---------- 몸통 ----------
function torso(c,S,j,g){
  const myth=g>=4;
  if(S.coat){ // 의사 가운
    const coat=()=>poly(c,[-10.6,0,10.6,0,13.2,20.5,-13.2,20.5]);
    fillShade(c,coat,'#ffffff',-13,13,0.2);
    c.fillStyle=myth?'#3d8bd6':'#5aa9e6';poly(c,[-4,0.5,4,0.5,2.6,13,-2.6,13]);c.fill(); // 스크럽
    c.fillStyle='#dfe5ee';poly(c,[-4.2,0.4,-1.3,9.5,-5.6,4]);c.fill();poly(c,[4.2,0.4,1.3,9.5,5.6,4]);c.fill(); // 라펠
    c.strokeStyle=myth?GOLD:'#c3cad6';c.lineWidth=0.8;line(c,0,13,0,20.5);
    c.fillStyle=myth?GOLD:'#c3cad6';for(let k=0;k<3;k++){circ(c,1.4,14+k*2.2,0.55);c.fill();}
    c.strokeStyle='#cfd5df';c.lineWidth=0.7;rr(c,-9.5,9,4.6,4.2,0.8);c.stroke();rr(c,5.2,14.5,5,4,0.8);c.stroke(); // 주머니
    c.fillStyle='#e03131';c.fillRect(-8.6,7.4,0.9,2.8);c.fillStyle='#3b5bdb';c.fillRect(-7.2,7.2,0.9,3);
    if(g>=3){c.strokeStyle=myth?GOLD:'#5aa9e6';c.lineWidth=1.2;line(c,-13.1,20,13.1,20);}
    return;
  }
  const body=()=>rr(c,-10,0,20,16,6);
  fillShade(c,body,S.top,-10,10);
  if(g===0){c.fillStyle='rgba(255,255,255,0.55)';poly(c,[-4,0.5,4,0.5,0,4]);c.fill();c.strokeStyle='rgba(0,0,0,0.15)';c.lineWidth=0.6;line(c,0,4,0,15.5);return;}
  if(j===1){ // 변호사 블라우스·라펠·리본·포켓치프·단추
    c.fillStyle='#ffffff';poly(c,[-4.6,0.4,4.6,0.4,0,9.5]);c.fill();
    c.fillStyle=darker(S.top,0.25);poly(c,[-4.6,0.4,-1.4,11,-6.6,5.5]);c.fill();poly(c,[4.6,0.4,1.4,11,6.6,5.5]);c.fill();
    c.fillStyle=myth?GOLD:'#c92a2a';poly(c,[0,2.6,-3.4,0.8,-3.4,4.4]);c.fill();poly(c,[0,2.6,3.4,0.8,3.4,4.4]);c.fill();circ(c,0,2.6,1);c.fill();
    c.fillStyle='#ffffff';poly(c,[-8.6,6.2,-5.4,6.2,-7,4.6]);c.fill();
    c.fillStyle=myth?GOLD:'#c9a227';circ(c,0,12.2,0.7);c.fill();circ(c,0,14.4,0.7);c.fill();
    if(g>=2){c.fillStyle=GOLD;circ(c,6.4,6,1.5);c.fill();c.fillStyle='#b8860b';circ(c,6.4,6,0.6);c.fill();} // 변호사 배지
  }
  if(j===2){ // 건축가 터틀넥 + 안전조끼
    c.fillStyle='rgba(255,255,255,0.1)';rr(c,-5.5,-0.6,11,3.8,1.5);c.fill();
    c.strokeStyle='rgba(255,255,255,0.12)';c.lineWidth=0.5;for(let k=-4;k<=4;k+=2)line(c,k,-0.4,k,3);
    if(S.vest){
      const vc=myth?'#ffb000':'#ff8c1a';
      fillShade(c,()=>poly(c,[-10,1.2,-3.2,1.2,-2.6,16,-10,16]),vc,-10,-2.6,0.15);
      fillShade(c,()=>poly(c,[10,1.2,3.2,1.2,2.6,16,10,16]),vc,2.6,10,0.2);
      c.fillStyle=myth?GOLD:'#e9eef4';c.fillRect(-10,7.6,7.5,1.8);c.fillRect(2.6,7.6,7.4,1.8);c.fillRect(-10,11.6,7.5,1.4);c.fillRect(2.6,11.6,7.4,1.4);
      c.fillStyle='rgba(0,0,0,0.18)';rr(c,4.2,13.4,4,2.4,0.6);c.fill();
      c.fillStyle='#ffffff';rr(c,-8.6,3,4,2.6,0.5);c.fill();c.fillStyle='#3b7dd8';c.fillRect(-8.6,3,4,0.9); // 출입증
    }
  }
  if(j===3){ // 회계사
    if(g>=3){
      c.fillStyle='#ffffff';poly(c,[-4.6,0.4,4.6,0.4,0,8.5]);c.fill();
      c.fillStyle=darker(S.top,0.25);poly(c,[-4.6,0.4,-1.4,10.5,-6.6,5]);c.fill();poly(c,[4.6,0.4,1.4,10.5,6.6,5]);c.fill();
      c.strokeStyle=myth?GOLD:'#d9d9d9';c.lineWidth=0.7;c.beginPath();c.arc(0,2,3.6,0.15*Math.PI,0.85*Math.PI);c.stroke();c.fillStyle=GOLD;circ(c,0,5.6,0.9);c.fill();
    }else{
      c.fillStyle='#ffffff';poly(c,[-5,0.4,0,5,-1.2,0.4]);c.fill();poly(c,[5,0.4,0,5,1.2,0.4]);c.fill();
      c.strokeStyle='rgba(0,0,0,0.22)';c.lineWidth=0.6;line(c,0,5,0,15.6);
      c.fillStyle='#f1f3f5';for(let k=0;k<3;k++){circ(c,1.3,7.5+k*2.8,0.75);c.fill();}
      c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=0.6;rr(c,-8.4,10,4.2,3.4,0.8);c.stroke();
    }
  }
  if(j===4){ // 개발자 후드티
    fillShade(c,()=>rr(c,-6.5,9.6,13,5.4,2),darker(S.top,0.18),-6.5,6.5,0.15);
    c.strokeStyle=myth?GOLD:'#ececf3';c.lineWidth=0.9;line(c,-2.6,1,-2.6,7);line(c,2.6,1,2.6,7);
    c.fillStyle=myth?GOLD:'#b5b5c0';rr(c,-3.2,6.6,1.2,1.6,0.4);c.fill();rr(c,2,6.6,1.2,1.6,0.4);c.fill();
    c.fillStyle=myth?GOLD:lighter(S.top,0.45);c.font='bold 4.2px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(myth?'CTO':'</>',0,4.4);
  }
  if(g>=1&&g<=3&&!S.coat){c.fillStyle=GRADECOL[g];circ(c,-7.2,2.8,1.4);c.fill();c.strokeStyle='rgba(255,255,255,0.7)';c.lineWidth=0.5;c.stroke();} // 직급 배지
}
function arms(c,S,front){
  const col=S.arm;
  if(front){
    fillShade(c,()=>rr(c,-13.5,1.6,5,8.4,2.5),col,-13.5,-8.5,0.15);fillShade(c,()=>rr(c,8.5,1.6,5,8.4,2.5),col,8.5,13.5,0.25);
    [[-11,9,-0.9],[11,9,0.9]].forEach(([x,y,a])=>{c.save();c.translate(x,y);c.rotate(a);rr(c,-2.5,0,5,6.2,2.5);c.fillStyle=col;c.fill();
      if(S.sleeves){c.fillStyle='#2b2b30';rr(c,-2.5,1.4,5,4.8,2);c.fill();c.strokeStyle='rgba(255,255,255,0.2)';c.lineWidth=0.4;line(c,-2.3,2.3,2.3,2.3);}
      c.restore();});
    c.fillStyle=SKIN;circ(c,-6.5,13,2.3);c.fill();circ(c,6.5,13,2.3);c.fill();
  }else{
    fillShade(c,()=>rr(c,-14,1.4,5,13.4,2.5),col,-14,-9,0.12);fillShade(c,()=>rr(c,9,1.4,5,13.4,2.5),col,9,14,0.28);
    if(S.sleeves){c.fillStyle='#2b2b30';rr(c,-14,7.8,5,6.8,2);c.fill();rr(c,9,7.8,5,6.8,2);c.fill();c.strokeStyle='rgba(255,255,255,0.2)';c.lineWidth=0.4;line(c,-13.6,8.8,-9.4,8.8);line(c,9.4,8.8,13.6,8.8);}
    else{c.strokeStyle='rgba(0,0,0,0.18)';c.lineWidth=0.6;line(c,-13.6,12.6,-9.4,12.6);line(c,9.4,12.6,13.6,12.6);} // 소매 끝
    c.fillStyle=SKIN;circ(c,-11.5,15.2,2.35);c.fill();circ(c,11.5,15.2,2.35);c.fill();
    c.fillStyle='rgba(0,0,0,0.12)';circ(c,12.2,15.8,1.4);c.fill();
  }
}

// ---------- 머리 ----------
function hairBack(c,S){
  c.fillStyle=S.hairCol;
  if(S.hair==='long'){rr(c,-12.6,-14,25.2,25,8);c.fill();c.fillStyle='rgba(0,0,0,0.2)';rr(c,-12.6,2,25.2,9,6);c.fill();}
  if(S.hair==='bob'){rr(c,-12.9,-15,25.8,17,7);c.fill();}
  if(S.hair==='hood'){fillShade(c,()=>circ(c,0,-9.5,13.8),S.top,-13.8,13.8,0.22);}
}
function hairFront(c,S,g){
  const hc=S.hairCol,hl=lighter(hc,0.35);c.fillStyle=hc;
  const cap=r=>{c.beginPath();c.arc(0,-11,r||11.7,Math.PI,0);c.closePath();c.fill();};
  const shine=(pts)=>{c.strokeStyle=hl;c.lineWidth=0.9;c.lineCap='round';c.beginPath();c.moveTo(pts[0],pts[1]);c.quadraticCurveTo(pts[2],pts[3],pts[4],pts[5]);c.stroke();c.lineCap='butt';};
  switch(S.hair){
    case 'intern':
      cap();[[-11,-11,-6,-11,-8,-6.6],[-6,-11,0,-11,-3,-6.2],[0,-11,6,-11,3,-6.8],[6,-11,11,-11,9,-7.2]].forEach(p=>{poly(c,p);c.fill();});
      shine([-6,-19,-2,-21,3,-20.5]);break;
    case 'neat':
      cap();c.beginPath();c.moveTo(-11.5,-9);c.quadraticCurveTo(-6,-17,4,-14);c.quadraticCurveTo(9,-13,11.5,-8);c.lineTo(11.5,-11);c.lineTo(-11.5,-11);c.closePath();c.fill();
      shine([-7,-18,-3,-21.4,2,-20.8]);c.strokeStyle=darker(hc,0.3);c.lineWidth=0.7;line(c,-3.5,-22,-2,-14.6);break;
    case 'long':
      cap(12.1);c.beginPath();c.moveTo(-12.1,-8);c.quadraticCurveTo(-4,-18,8,-14);c.quadraticCurveTo(11,-12,12.1,-6);c.lineTo(12.1,-11);c.lineTo(-12.1,-11);c.closePath();c.fill();
      shine([-8,-17,-2,-21.6,5,-20.6]);shine([-11,-6,-11.6,0,-10.5,6]);break;
    case 'bun':
      cap(12.1);circ(c,0,-22.6,4.7);c.fill();shine([-2.5,-25,0,-26.6,2.5,-25]);
      c.fillStyle=g>=4?GOLD:'#c92a2a';c.fillRect(-4.2,-19.7,8.4,1.6);c.fillStyle=hc;
      c.beginPath();c.moveTo(-12.1,-8);c.quadraticCurveTo(-3,-17,9,-14);c.lineTo(12.1,-11);c.lineTo(-12.1,-11);c.closePath();c.fill();
      shine([-8,-16.5,-3,-20.5,4,-20]);break;
    case 'messy':
      if(!S.helmet){cap();[[-8,-18,4],[-3,-21,4.5],[3,-21,4.3],[8,-18,4],[11,-13,3]].forEach(p=>{circ(c,p[0],p[1],p[2]);c.fill();});
        c.strokeStyle=hl;c.lineWidth=0.8;[[-4,-23],[2,-23.4],[7,-20.5]].forEach(p=>{c.beginPath();c.arc(p[0],p[1]+2,1.8,Math.PI*1.1,Math.PI*1.7);c.stroke();});
        c.save();c.translate(10.6,-10);c.rotate(0.5);c.fillStyle='#ffd43b';c.fillRect(-0.8,-5,1.6,8);c.fillStyle='#ffb3b3';c.fillRect(-0.8,-6.2,1.6,1.4);c.fillStyle='#333';poly(c,[-0.8,3,0.8,3,0,4.6]);c.fill();c.restore();}
      else{c.fillRect(-11.5,-11,3,5);c.fillRect(8.5,-11,3,5);}
      break;
    case 'bob':
      c.fillRect(-12.9,-12,4.3,13.2);c.fillRect(8.6,-12,4.3,13.2);cap(12.5);rr(c,-10.6,-18.6,21.2,7.2,3);c.fill();
      shine([-7,-19.5,-1,-22.4,5,-21.6]);c.strokeStyle='rgba(0,0,0,0.2)';c.lineWidth=0.5;for(let k=-8;k<=8;k+=4)line(c,k,-15,k,-11.6);break;
    case 'hood':
      c.beginPath();c.moveTo(-9,-17.5);c.quadraticCurveTo(-5,-13,-2,-16.5);c.quadraticCurveTo(1,-12.8,4,-16.5);c.quadraticCurveTo(7,-13.5,9,-17.5);c.lineTo(9,-19);c.lineTo(-9,-19);c.closePath();c.fill();
      c.strokeStyle=S.top;c.lineWidth=3.5;c.beginPath();c.arc(0,-10,12.4,Math.PI*1.08,Math.PI*1.92);c.stroke();
      c.strokeStyle='rgba(0,0,0,0.28)';c.lineWidth=0.9;c.beginPath();c.arc(0,-10,10.7,Math.PI*1.1,Math.PI*1.9);c.stroke();
      c.strokeStyle='rgba(255,255,255,0.18)';c.lineWidth=0.8;c.beginPath();c.arc(0,-10,13.4,Math.PI*1.15,Math.PI*1.45);c.stroke();
      break;
  }
}
function eyes(c,S,j,g){
  const ex=4.1,ey=-7.3,e=S.expr,brow=darker(S.hairCol==='#8e8a86'?'#6b6763':S.hairCol,0.1);
  const openEye=(x,small)=>{
    if(small){c.fillStyle='#ffffff';ell(c,x,ey,2,2.4);c.fill();c.fillStyle=INK;circ(c,x,ey+0.4,1.15);c.fill();c.fillStyle='#fff';circ(c,x+0.4,ey-0.2,0.45);c.fill();return;}
    c.fillStyle=INK;ell(c,x,ey,2.05,2.6);c.fill();
    c.fillStyle=IRIS[j];ell(c,x,ey+0.45,1.5,1.85);c.fill();
    c.fillStyle=INK;circ(c,x,ey+0.6,0.8);c.fill();
    c.fillStyle='#ffffff';circ(c,x+0.65,ey-0.95,0.75);c.fill();circ(c,x-0.6,ey+1.2,0.38);c.fill();
  };
  if(e==='grin'){c.strokeStyle=INK;c.lineWidth=1.4;c.lineCap='round';c.beginPath();c.arc(-ex,ey+0.9,1.9,1.15*Math.PI,1.85*Math.PI);c.stroke();c.beginPath();c.arc(ex,ey+0.9,1.9,1.15*Math.PI,1.85*Math.PI);c.stroke();c.lineCap='butt';}
  else{
    openEye(-ex,e==='nervous');openEye(ex,e==='nervous');
    if(e==='smug'||e==='tired'){ // 반쯤 감은 눈꺼풀
      c.fillStyle=SKIN;[-ex,ex].forEach(x=>{c.beginPath();c.ellipse(x,ey,2.4,3,0,Math.PI,0);c.fill();});
      c.strokeStyle=INK;c.lineWidth=1;line(c,-ex-2.2,ey+0.1,-ex+2.2,ey+0.1);line(c,ex-2.2,ey+0.1,ex+2.2,ey+0.1);
    }
  }
  if(S.female&&e!=='grin'){c.strokeStyle=INK;c.lineWidth=0.7;line(c,-ex-2,ey-1.4,-ex-3.1,ey-2.2);line(c,ex+2,ey-1.4,ex+3.1,ey-2.2);}
  if(e==='tired'){c.strokeStyle='rgba(110,80,160,0.75)';c.lineWidth=0.9;c.beginPath();c.arc(-ex,ey+2.7,1.7,0.1*Math.PI,0.9*Math.PI);c.stroke();c.beginPath();c.arc(ex,ey+2.7,1.7,0.1*Math.PI,0.9*Math.PI);c.stroke();}
  // 눈썹
  c.strokeStyle=brow;c.lineWidth=1.1;c.lineCap='round';
  const B={nervous:[[-6.4,-11.2,-2.4,-12.4],[6.4,-11.2,2.4,-12.4]],smile:[[-6,-11.6,-2.4,-12],[6,-11.6,2.4,-12]],confident:[[-6.2,-11.6,-2.2,-11.2],[6.2,-11.6,2.2,-11.2]],
    smug:[[-6.2,-11.4,-2.2,-11],[6.2,-12.6,2.2,-11.6]],grin:[[-6,-12.6,-2.4,-13],[6,-12.6,2.4,-13]],tired:[[-6.2,-10.8,-2.2,-11.4],[6.2,-10.8,2.2,-11.4]]}[e];
  if(B)B.forEach(b=>line(c,b[0],b[1],b[2],b[3]));
  c.lineCap='butt';
}
function mouth(c,S){
  const e=S.expr;c.strokeStyle='#8a4a3a';c.lineWidth=1;c.lineCap='round';
  if(e==='nervous'){c.beginPath();c.moveTo(-2,-2.6);c.quadraticCurveTo(-1,-3.6,0,-2.6);c.quadraticCurveTo(1,-1.6,2,-2.6);c.stroke();}
  else if(e==='smile'){c.beginPath();c.arc(0,-4.1,2.4,0.15*Math.PI,0.85*Math.PI);c.stroke();}
  else if(e==='confident'){c.fillStyle='#8a3a2e';c.beginPath();c.arc(0,-3.9,2.7,0,Math.PI);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(-1.7,-3.9,3.4,0.9);c.fillStyle='#e8707a';ell(c,0,-2.0,1.2,0.6);c.fill();}
  else if(e==='smug'){c.beginPath();c.moveTo(-2.4,-2.9);c.quadraticCurveTo(1,-1.8,3,-4.2);c.stroke();}
  else if(e==='grin'){c.fillStyle='#8a3a2e';c.beginPath();c.arc(0,-4.1,3.5,0,Math.PI);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(-2.5,-4.1,5,1.1);c.fillStyle='#e8707a';ell(c,0,-1.6,1.6,0.8);c.fill();}
  else if(e==='tired'){line(c,-2,-3,2,-3.4);}
  c.lineCap='butt';
}
function headBase(c,S,j,g){
  const earsVisible=!['hood','long','bob'].includes(S.hair);
  if(earsVisible){c.fillStyle=SKIN;circ(c,-11,-8,2.4);c.fill();circ(c,11,-8,2.4);c.fill();c.fillStyle=SKIN_D;circ(c,-11,-8,1.1);c.fill();circ(c,11,-8,1.1);c.fill();}
  fillShade(c,()=>circ(c,0,-10,11),SKIN,-11,11,0.14);
  c.strokeStyle='rgba(170,100,80,0.45)';c.lineWidth=0.7;c.beginPath();c.arc(0.4,-5.6,0.9,0.1*Math.PI,0.9*Math.PI);c.stroke(); // 코
  if(g<=1||S.female){c.fillStyle='rgba(255,120,120,0.32)';ell(c,-7.2,-4.2,1.9,1.2);c.fill();ell(c,7.2,-4.2,1.9,1.2);c.fill();}
  eyes(c,S,j,g);mouth(c,S);
  if(j===2&&g>=3){c.fillStyle='rgba(90,59,40,0.3)';c.beginPath();c.arc(0,-5,7.6,0.1*Math.PI,0.9*Math.PI);c.lineTo(-5,-4);c.quadraticCurveTo(0,-1,5,-4);c.closePath();c.fill();
    c.fillStyle='rgba(60,40,28,0.35)';for(let k=0;k<9;k++){circ(c,-4.5+k*1.1,-1.6+Math.sin(k)*0.6,0.25);c.fill();}}
}
function faceGear(c,S,j,g){
  if(j===2&&g>=1){c.strokeStyle=g>=4?GOLD:'#111';c.lineWidth=1;circ(c,-4.1,-7.3,3);c.stroke();circ(c,4.1,-7.3,3);c.stroke();line(c,-1.1,-7.3,1.1,-7.3);line(c,-7.1,-7.6,-10.4,-8.2);line(c,7.1,-7.6,10.4,-8.2);
    c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=0.5;c.beginPath();c.arc(-4.1,-7.3,2.3,1.1*Math.PI,1.4*Math.PI);c.stroke();c.beginPath();c.arc(4.1,-7.3,2.3,1.1*Math.PI,1.4*Math.PI);c.stroke();}
  if(j===3&&g>=2){c.strokeStyle=g>=4?GOLD:'#3a3a3a';c.lineWidth=1;rr(c,-7.3,-9.3,6.2,4.2,1);c.stroke();rr(c,1.1,-9.3,6.2,4.2,1);c.stroke();line(c,-1.1,-7.3,1.1,-7.3);
    c.strokeStyle=g>=4?GOLD:'#9aa0a6';c.lineWidth=0.4;c.beginPath();c.moveTo(-7.3,-6);c.quadraticCurveTo(-10,0,-9,4);c.stroke();}
  if(j===4&&g>=4){c.fillStyle='#0b0b0f';rr(c,-7.6,-9.6,6.6,4.4,1.4);c.fill();rr(c,1,-9.6,6.6,4.4,1.4);c.fill();c.strokeStyle='#0b0b0f';c.lineWidth=1;line(c,-1,-7.6,1,-7.6);
    c.fillStyle='rgba(255,255,255,0.4)';poly(c,[-6.8,-9,-4.6,-9,-6,-6.4]);c.fill();poly(c,[1.8,-9,4,-9,2.6,-6.4]);c.fill();}
  if(j===1&&g>=2){c.fillStyle=GOLD;circ(c,-11.4,-4.6,1);c.fill();circ(c,11.4,-4.6,1);c.fill();if(g>=3){c.fillStyle='#fff';circ(c,-11.4,-3,0.7);c.fill();circ(c,11.4,-3,0.7);c.fill();}}
}
function headGear(c,S,j,g){
  if(S.helmet){
    fillShade(c,()=>{c.beginPath();c.arc(0,-12,12.5,Math.PI,0);c.closePath();},S.helmet,-12.5,12.5,0.2);
    c.fillStyle='rgba(0,0,0,0.1)';rr(c,-1.6,-24.4,3.2,12.2,1);c.fill();
    c.fillStyle='rgba(255,255,255,0.45)';c.beginPath();c.ellipse(-5,-19.5,3,1.4,-0.5,0,Math.PI*2);c.fill();
    c.fillStyle=g===2?'#d9ab0b':'#d5d5d5';rr(c,-14.6,-13.3,29.2,3.3,1.6);c.fill();
    if(g>=4){c.fillStyle=GOLD;c.fillRect(-1.7,-24.5,3.4,11.3);}
    else if(g===3){c.fillStyle='#3b7dd8';c.font='bold 4px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('감리',-6.2,-16);}
    else{c.fillStyle='#2b8a3e';c.beginPath();c.arc(6,-17,2,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='bold 2.6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('안전',6,-16.9);}
  }
  if(j===0&&g>=3){
    c.strokeStyle='#444';c.lineWidth=1.3;c.beginPath();c.arc(0,-11,11.9,1.1*Math.PI,1.9*Math.PI);c.stroke();
    fillShade(c,()=>circ(c,0,-20.6,3.7),'#e3eaf2',-3.7,3.7,0.2);c.strokeStyle=g>=4?GOLD:'#8a94a6';c.lineWidth=1.2;circ(c,0,-20.6,3.7);c.stroke();
    c.fillStyle='#fff';circ(c,-1.2,-21.8,1.1);c.fill();circ(c,0,-20.6,0.7);c.fillStyle='#8a94a6';c.fill();
  }
  if(j===4&&g>=2){
    c.strokeStyle='#1f1f26';c.lineWidth=2.6;c.beginPath();c.arc(0,-11,13.7,Math.PI*1.05,Math.PI*1.95);c.stroke();
    c.strokeStyle='rgba(255,255,255,0.18)';c.lineWidth=0.7;c.beginPath();c.arc(0,-11,14.4,Math.PI*1.2,Math.PI*1.5);c.stroke();
    [-1,1].forEach(sx=>{fillShade(c,()=>rr(c,sx<0?-16.2:11.2,-13.6,5,9.2,2.2),g>=4?GOLD:'#1f1f26',sx<0?-16.2:11.2,sx<0?-11.2:16.2,0.25);});
    c.fillStyle=g>=4?'#fff2b3':'#b197fc';circ(c,13.7,-9,1.1);c.fill();circ(c,-13.7,-9,1.1);c.fill();
    if(g>=3){c.strokeStyle='#1f1f26';c.lineWidth=1.1;c.beginPath();c.moveTo(-13,-5);c.quadraticCurveTo(-11.5,-0.6,-5.5,-2.2);c.stroke();c.fillStyle='#b197fc';circ(c,-5.5,-2.2,1.1);c.fill();}
  }
}
function heldItems(c,S,j,g){
  const myth=g>=4;
  if(j===0&&g>=2){c.strokeStyle=myth?GOLD:'#7d8799';c.lineWidth=1.5;c.beginPath();c.moveTo(-4.4,0.8);c.quadraticCurveTo(-7,10,0,11);c.quadraticCurveTo(7,10,4.4,0.8);c.stroke();
    fillShade(c,()=>circ(c,0,12,2.2),myth?GOLD:'#aab3c2',-2.2,2.2,0.3);c.fillStyle='rgba(255,255,255,0.6)';circ(c,-0.6,11.4,0.6);c.fill();}
  if(j===0&&g>=1){fillShade(c,()=>rr(c,9.5,9.6,6.4,8.6,1),'#ffffff',9.5,15.9,0.2);c.fillStyle='#4a90d9';c.fillRect(9.5,9.6,6.4,1.8);
    c.fillStyle='#e03131';c.fillRect(11.6,12.6,2.4,0.8);c.fillRect(12.4,11.8,0.8,2.4);c.fillStyle='#ced4da';c.fillRect(10.6,15.2,4.2,0.6);c.fillRect(10.6,16.4,3,0.6);}
  if(j===1&&g>=2){fillShade(c,()=>rr(c,8.4,14.4,10.4,8.2,1.5),myth?'#1c1c1c':'#7a4b2a',8.4,18.8,0.3);
    c.strokeStyle=myth?GOLD:'#5a3418';c.lineWidth=1.2;c.beginPath();c.arc(13.6,14.4,2.4,Math.PI,0);c.stroke();
    c.fillStyle=myth?GOLD:'#c9a227';c.fillRect(12.6,16.8,2,1.8);c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=0.5;line(c,8.6,18,18.6,18);}
  if(j===1&&g>=3){c.save();c.translate(-12,14);c.rotate(-0.6);c.fillStyle='#8b5a2b';c.fillRect(-1,-9,2,10);
    fillShade(c,()=>rr(c,-5.2,-12.6,10.4,5,1.2),myth?GOLD:'#6b3f1e',-5.2,5.2,0.3);c.fillStyle='rgba(0,0,0,0.25)';c.fillRect(-3.6,-12.6,0.8,5);c.fillRect(2.8,-12.6,0.8,5);c.restore();}
  if(j===2&&g>=2){c.save();c.translate(-13,8);c.rotate(-0.35);fillShade(c,()=>rr(c,-2.9,-9.2,5.8,18.4,2.6),'#3b7dd8',-2.9,2.9,0.3);
    c.strokeStyle='rgba(255,255,255,0.75)';c.lineWidth=0.6;line(c,-1,-6,-1,6);line(c,1.2,-4,1.2,4);c.fillStyle='#d0e4ff';ell(c,0,-9,2.9,1.2);c.fill();
    if(myth){c.fillStyle=GOLD;c.fillRect(-2.9,-9.2,5.8,2);c.fillRect(-2.9,7.2,5.8,2);}c.restore();}
  if(j===3&&g>=2){fillShade(c,()=>rr(c,-5.2,8.8,10.4,9.6,1.6),'#d9dde3',-5.2,5.2,0.2);
    c.fillStyle='#7fd18b';c.fillRect(-4,10,8,2.8);c.fillStyle='#2f6b45';c.font='bold 2.4px monospace';c.textAlign='right';c.textBaseline='middle';c.fillText('1,000',3.6,11.5);
    for(let r=0;r<2;r++)for(let k=0;k<3;k++){c.fillStyle=k===2&&r===1?'#ff922b':'#6b7280';c.fillRect(-3.8+k*2.9,14+r*2.1,1.8,1.3);}}
  if(j===3&&g>=3){fillShade(c,()=>circ(c,-15,17,5.2),myth?GOLD:'#c8a24a',-20,-10,0.3);c.fillStyle=myth?GOLD:'#b38f3a';rr(c,-16.6,10.8,3.2,2.6,0.8);c.fill();
    c.strokeStyle='#8a6d2a';c.lineWidth=0.6;line(c,-17,12.6,-13,12.6);c.fillStyle='#5a4510';c.font='bold 6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('₩',-15,17.6);}
  if(j===4&&g>=2){c.fillStyle='rgba(160,200,255,0.22)';c.beginPath();c.moveTo(-6,10);c.lineTo(6,10);c.lineTo(9.5,-4);c.lineTo(-9.5,-4);c.closePath();c.fill();
    fillShade(c,()=>rr(c,-7.6,8.8,15.2,8.8,1.2),myth?'#2b2b2b':'#c9ced8',-7.6,7.6,0.25);
    c.fillStyle=myth?GOLD:'#7aa7ff';rr(c,-6.4,9.8,12.8,6.6,0.8);c.fill();
    c.fillStyle='rgba(255,255,255,0.85)';[[4.5,0],[7,1.7],[3.6,3.4]].forEach(([w,o])=>c.fillRect(-5.3,10.9+o,w,0.8));
    c.fillStyle=myth?'#2b2b2b':'#ffffff';c.font='bold 2.6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(myth?'★':'',3.8,14.5);}
  if(j===4&&g>=3){fillShade(c,()=>rr(c,11,12.8,7.2,8.4,1.5),'#f2f2f2',11,18.2,0.2);
    c.strokeStyle='#f2f2f2';c.lineWidth=1.2;c.beginPath();c.arc(18.7,17,2,-Math.PI/2,Math.PI/2);c.stroke();
    c.fillStyle='#6b4423';c.fillRect(12,13.8,5.2,1.5);c.fillStyle='#b197fc';c.fillRect(11,17,7.2,1.2);}
}
function lanyard(c,col){
  c.strokeStyle=col;c.lineWidth=1.3;c.beginPath();c.moveTo(-4.5,0.5);c.lineTo(0,7.5);c.lineTo(4.5,0.5);c.stroke();
  fillShade(c,()=>rr(c,-3.7,7.4,7.4,7.8,1),'#ffffff',-3.7,3.7,0.12);c.fillStyle=col;c.fillRect(-3.7,7.4,7.4,2.3);
  c.fillStyle='#c5cad3';rr(c,-2.8,10.6,2.6,3,0.5);c.fill();c.fillRect(0.4,11,2.6,0.8);c.fillRect(0.4,12.6,2,0.8);
}

// ---------- 스프라이트 생성 (4배 해상도 + 조명 + 외곽선) ----------
function drawRaw(c,j,g){
  const S=style(j,g),front=(j===3&&g>=2)||(j===4&&g>=2);
  hairBack(c,S);legs(c,S);
  if(!front)arms(c,S,false);
  torso(c,S,j,g);
  if(g===0)lanyard(c,JOBCOL[j]);
  headBase(c,S,j,g);hairFront(c,S,g);faceGear(c,S,j,g);headGear(c,S,j,g);
  if(front)arms(c,S,true);
  heldItems(c,S,j,g);
  if(g>=4){c.fillStyle=GOLD;star(c,-6.6,6,3.3);c.fill();c.strokeStyle='rgba(0,0,0,0.35)';c.lineWidth=0.6;c.stroke();}
}
const cache={};
function sprite(j,g){
  const k=j*10+g;if(cache[k])return cache[k];
  const W=BOX.w*R,H=BOX.h*R;
  const a=document.createElement('canvas');a.width=W;a.height=H;
  const ac=a.getContext('2d');ac.setTransform(R,0,0,R,-BOX.x*R,-BOX.y*R);drawRaw(ac,j,g);
  ac.setTransform(1,0,0,1,0,0);ac.globalCompositeOperation='source-atop';
  const lg=ac.createLinearGradient(0,0,W,H);lg.addColorStop(0,'rgba(255,250,235,0.12)');lg.addColorStop(0.55,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(20,10,40,0.14)');
  ac.fillStyle=lg;ac.fillRect(0,0,W,H);ac.globalCompositeOperation='source-over';
  const o=document.createElement('canvas');o.width=W;o.height=H;const oc=o.getContext('2d');
  const d=1.15*R,dd=d*0.72;
  [[-d,0],[d,0],[0,-d],[0,d],[-dd,-dd],[dd,-dd],[-dd,dd],[dd,dd]].forEach(([x,y])=>oc.drawImage(a,x,y));
  oc.globalCompositeOperation='source-in';oc.fillStyle=g>=4?'#3a2a00':'#15151c';oc.fillRect(0,0,W,H);
  oc.globalCompositeOperation='source-over';oc.drawImage(a,0,0);
  return cache[k]=o;
}
function glow(c,r,rgb,a){const g=c.createRadialGradient(0,0,3,0,0,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,0,r);c.fill();}
function backFx(c,g,t){
  if(g===3)glow(c,27,'255,170,60',0.34);
  if(g>=4){c.save();c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.24)';for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-35,4,-35]);c.fill();}c.restore();glow(c,31,'255,214,90',0.46);}
}
function frontFx(c,j,g,t,bob){
  if(g===0){c.fillStyle='rgba(140,200,255,0.95)';const yy=-15+((t*0.8)%1)*3+bob;c.beginPath();c.moveTo(10.4,yy-3);c.quadraticCurveTo(12.8,yy+1,10.4,yy+1.6);c.quadraticCurveTo(8,yy+1,10.4,yy-3);c.fill();}
  if(g>=4){const sp=(t*2)%1;c.globalAlpha=1-sp;c.fillStyle='#fff6c2';star(c,13,-21-sp*4,2.2);c.fill();c.globalAlpha=1;}
  if(j===4&&g===3){const p=(t*0.7)%1;c.globalAlpha=0.6*(1-p);c.fillStyle='#c5c5d0';c.font='bold 5px sans-serif';c.textAlign='center';c.fillText('z',-12,-22-p*6+bob);c.globalAlpha=1;}
}
function draw(c,j,g,x,y,s,t){
  const sp=sprite(j,g);
  c.save();c.translate(x,y);const k=s*(1+g*0.035);c.scale(k,k);
  backFx(c,g,t);
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23.2,12.6,3.2,0,0,Math.PI*2);c.fill();
  const bob=Math.sin(t*3+x*0.07)*(g>=1?1:0.6);
  c.drawImage(sp,BOX.x,BOX.y+bob,BOX.w,BOX.h);
  frontFx(c,j,g,t,bob);
  c.restore();
}
function portrait(c,j,g,cx,cy,h,t){
  const sp=sprite(j,g),s=h/BOX.h;
  c.save();c.translate(cx,cy);c.scale(s,s);
  backFx(c,g,t||0);
  c.fillStyle='rgba(0,0,0,0.3)';c.beginPath();c.ellipse(0,23.2,12.6,3.2,0,0,Math.PI*2);c.fill();
  c.drawImage(sp,BOX.x,BOX.y,BOX.w,BOX.h);
  frontFx(c,j,g,t||0,0);
  c.restore();
}
window.KTChars={draw,portrait,sprite,version:3,GRADECOL,JOBCOL};
})();
