// 칼퇴 디펜스 — 캐릭터 그리기 모듈 v2 (팔·다리·표정·직업별 헤어)
// KTChars.draw(ctx, job, grade, x, y, scale, time, jobColor)  ※ characters.js와 같은 사용법
// job: 0 의사, 1 변호사, 2 건축가, 3 회계사, 4 개발자 / grade: 0 인턴 ~ 4 대표
// 인턴: 모두 같은 회색 셔츠·바지·사원증(줄 색만 직업색) + 긴장한 표정
// 대리↑: 직업 복장·헤어·성별이 갈리고, 직급이 오를수록 소품과 여유가 늘어남
(function(){
'use strict';
const GOLD='#f4c542',INK='#26262b',SKIN='#f5d0ab',SHADE='rgba(0,0,0,0.28)';
const HAIR=['#2b2420','#1d1a24','#5a3b28','#3b2a20','#2e2a33'];
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function line(c,a,b,d,e){c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.stroke();}
function fillS(c,col){c.fillStyle=col;c.fill();c.strokeStyle=SHADE;c.lineWidth=0.9;c.stroke();}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
function glow(c,r,rgb,a,y){const g=c.createRadialGradient(0,y||0,3,0,y||0,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,y||0,r);c.fill();}

// ---------- 직업·직급별 스타일 ----------
function style(j,g){
  if(g===0)return {hair:'intern',hairCol:'#4a3426',top:'#d5dae2',arm:'#d5dae2',pants:'#6c7280',expr:'nervous',female:false};
  const myth=g>=4;
  const S={expr:['','smile','confident','smug','grin'][g],hairCol:HAIR[j]};
  if(j===0)Object.assign(S,{hair:'neat',top:'#ffffff',arm:'#ffffff',pants:'#7fb3e6',coat:true});
  if(j===1)Object.assign(S,{hair:g>=3?'bun':'long',top:myth?'#14182b':'#283766',arm:myth?'#14182b':'#283766',pants:myth?'#14182b':'#283766',female:true,skirt:true});
  if(j===2)Object.assign(S,{hair:'messy',top:'#2f2f35',arm:'#2f2f35',pants:'#8a7a5c',vest:g>=2,helmet:g>=2?(g===2?'#f5c518':'#f4f4f4'):null});
  if(j===3)Object.assign(S,{hair:'bob',top:g>=3?(myth?'#1f3a2b':'#2f5a42'):'#6b9a76',arm:g>=3?(myth?'#1f3a2b':'#2f5a42'):'#6b9a76',pants:'#5a5f6b',female:true,sleeves:g<3});
  if(j===4)Object.assign(S,{hair:'hood',top:myth?'#17171d':g>=3?'#3f4588':'#5b62b0',arm:myth?'#17171d':g>=3?'#3f4588':'#5b62b0',pants:'#3b5b8c',expr:g===3?'tired':S.expr});
  if(g>=3&&j===0)S.hairCol='#4a4540';
  if(myth&&j===0)S.hairCol='#8e8a86';
  return S;
}

// ---------- 부위 ----------
function legs(c,S,ph){
  const a=Math.sin(ph)*0.8;
  if(S.skirt){
    c.strokeStyle='#e9c4a0';c.lineWidth=2.4;c.lineCap='round';line(c,-3.5,17,-3.5,21+a*0.3);line(c,3.5,17,3.5,21-a*0.3);c.lineCap='butt';
    c.fillStyle=S.pants;poly(c,[-9,13,9,13,10.5,19,-10.5,19]);c.fill();
  }else{
    c.fillStyle=S.pants;rr(c,-7.5,14,6.5,7.5,2);c.fill();rr(c,1,14,6.5,7.5,2);c.fill();
  }
  c.fillStyle='#26262b';rr(c,-8.5,20.6,8,3,1.4);c.fill();rr(c,0.5,20.6,8,3,1.4);c.fill();
}
function torso(c,S,j,g){
  if(S.coat){ // 의사 가운 (아래로 퍼짐)
    poly(c,[-10.5,0,10.5,0,13,20,-13,20]);fillS(c,'#ffffff');
    c.fillStyle=g>=4?'#3d8bd6':'#5aa9e6';poly(c,[-4,0.5,4,0.5,2.6,13,-2.6,13]);c.fill();
    c.strokeStyle=g>=4?GOLD:'#c3cad6';c.lineWidth=1;line(c,-4,0.5,-1.5,9);line(c,4,0.5,1.5,9);line(c,0,13,0,20);
    if(g>=3){c.strokeStyle=g>=4?GOLD:'#5aa9e6';c.lineWidth=1.4;line(c,-13,19.5,13,19.5);}
    c.fillStyle=g>=4?GOLD:'#e7ebf2';c.fillRect(4.5,9,4,2.4);
    return;
  }
  rr(c,-10,0,20,16,6);fillS(c,S.top);
  if(g===0){ // 인턴 사원증은 따로
    c.fillStyle='rgba(255,255,255,0.5)';poly(c,[-4,0.5,4,0.5,0,4]);c.fill();return;
  }
  if(j===1){ // 변호사: 블라우스 V + 리본 + 배지
    c.fillStyle='#ffffff';poly(c,[-4.5,0.5,4.5,0.5,0,9]);c.fill();
    c.fillStyle=g>=4?GOLD:'#c92a2a';poly(c,[0,2.5,-3.4,0.8,-3.4,4.2]);c.fill();poly(c,[0,2.5,3.4,0.8,3.4,4.2]);c.fill();circ(c,0,2.5,1);c.fill();
    c.strokeStyle='rgba(0,0,0,0.35)';c.lineWidth=0.9;line(c,-4.5,0.5,-2,11);line(c,4.5,0.5,2,11);
    if(g>=2){c.fillStyle=GOLD;circ(c,-6.5,5,1.6);c.fill();}
  }
  if(j===2){ // 건축가: 터틀넥 목 + 안전조끼
    c.fillStyle='rgba(255,255,255,0.1)';rr(c,-5.5,-0.5,11,3.5,1.5);c.fill();
    if(S.vest){
      const vc=g>=4?'#ffb000':'#ff8c1a';
      c.fillStyle=vc;poly(c,[-10,1.5,-3,1.5,-2.5,16,-10,16]);c.fill();poly(c,[10,1.5,3,1.5,2.5,16,10,16]);c.fill();
      c.fillStyle=g>=4?GOLD:'#dfe6ee';c.fillRect(-10,8,7.4,1.8);c.fillRect(2.6,8,7.4,1.8);c.fillRect(-10,12,7.4,1.4);c.fillRect(2.6,12,7.4,1.4);
    }
  }
  if(j===3){ // 회계사: 가디건 카라·단추 / 부장↑ 재킷+블라우스+목걸이
    if(g>=3){
      c.fillStyle='#ffffff';poly(c,[-4.5,0.5,4.5,0.5,0,8]);c.fill();
      c.strokeStyle=g>=4?GOLD:'#d9d9d9';c.lineWidth=0.8;c.beginPath();c.arc(0,2,3.6,0.15*Math.PI,0.85*Math.PI);c.stroke();
      c.fillStyle=GOLD;circ(c,0,5.6,0.9);c.fill();
    }else{
      c.fillStyle='#ffffff';poly(c,[-5,0.5,0,5,-1,0.5]);c.fill();poly(c,[5,0.5,0,5,1,0.5]);c.fill();
      c.fillStyle='rgba(0,0,0,0.35)';for(let k=0;k<3;k++){circ(c,0,7.5+k*2.8,0.8);c.fill();}
    }
  }
  if(j===4){ // 개발자: 후드 주머니·끈·로고
    c.fillStyle='rgba(0,0,0,0.2)';rr(c,-6.5,10,13,5,2);c.fill();
    c.strokeStyle=g>=4?GOLD:'#e8e8f0';c.lineWidth=0.9;line(c,-2.6,1,-2.6,7);line(c,2.6,1,2.6,7);
    if(g>=2&&g<4){}else if(g>=4){c.fillStyle=GOLD;c.font='bold 4.5px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('</>',0,12.6);}
  }
  if(g===3&&j!==0){c.fillStyle=GOLD;c.fillRect(-8.5,5,4,2.4);}
}
function arms(c,S,front){
  c.fillStyle=S.arm;
  if(front){ // 앞으로 뭔가 들고 있는 자세
    rr(c,-13.5,2,5,8,2.5);c.fill();rr(c,8.5,2,5,8,2.5);c.fill();
    c.save();c.translate(-11,9);c.rotate(-0.9);rr(c,-2.5,0,5,6,2.5);c.fillStyle=S.arm;c.fill();c.restore();
    c.save();c.translate(11,9);c.rotate(0.9);rr(c,-2.5,0,5,6,2.5);c.fillStyle=S.arm;c.fill();c.restore();
    if(S.sleeves){c.fillStyle='#2b2b30';c.save();c.translate(-11,9);c.rotate(-0.9);rr(c,-2.5,1.5,5,4.5,2);c.fill();c.restore();c.save();c.translate(11,9);c.rotate(0.9);rr(c,-2.5,1.5,5,4.5,2);c.fill();c.restore();}
    c.fillStyle=SKIN;circ(c,-6.5,13,2.3);c.fill();circ(c,6.5,13,2.3);c.fill();
  }else{
    rr(c,-14,1.5,5,13,2.5);c.fill();rr(c,9,1.5,5,13,2.5);c.fill();
    if(S.sleeves){c.fillStyle='#2b2b30';rr(c,-14,8,5,6.5,2);c.fill();rr(c,9,8,5,6.5,2);c.fill();}
    c.strokeStyle=SHADE;c.lineWidth=0.8;rr(c,-14,1.5,5,13,2.5);c.stroke();rr(c,9,1.5,5,13,2.5);c.stroke();
    c.fillStyle=SKIN;circ(c,-11.5,15,2.3);c.fill();circ(c,11.5,15,2.3);c.fill();
  }
}
function hairBack(c,S){
  c.fillStyle=S.hairCol;
  if(S.hair==='long'){rr(c,-12.5,-14,25,25,8);c.fill();}
  if(S.hair==='bob'){rr(c,-12.8,-15,25.6,17,7);c.fill();}
  if(S.hair==='hood'){c.fillStyle=S.top;circ(c,0,-9.5,13.6);c.fill();c.strokeStyle=SHADE;c.lineWidth=0.9;c.stroke();}
}
function hairFront(c,S,g){
  const hc=S.hairCol;c.fillStyle=hc;
  const cap=(r)=>{c.beginPath();c.arc(0,-11,r||11.6,Math.PI,0);c.closePath();c.fill();};
  switch(S.hair){
    case 'intern':
      cap();poly(c,[-11,-11,-6,-11,-8,-7]);c.fill();poly(c,[-6,-11,0,-11,-3,-6.5]);c.fill();poly(c,[0,-11,6,-11,3,-7]);c.fill();poly(c,[6,-11,11,-11,9,-7.5]);c.fill();
      break;
    case 'neat':
      cap();c.beginPath();c.moveTo(-11.4,-9);c.quadraticCurveTo(-6,-17,4,-14);c.quadraticCurveTo(9,-13,11.4,-8);c.lineTo(11.4,-11);c.lineTo(-11.4,-11);c.closePath();c.fill();
      c.strokeStyle='rgba(255,255,255,0.25)';c.lineWidth=0.8;c.beginPath();c.moveTo(-4,-21);c.quadraticCurveTo(-3,-16,-1,-14);c.stroke();
      break;
    case 'long':
      cap(12);c.beginPath();c.moveTo(-12,-8);c.quadraticCurveTo(-4,-18,8,-14);c.quadraticCurveTo(11,-12,12,-6);c.lineTo(12,-11);c.lineTo(-12,-11);c.closePath();c.fill();
      break;
    case 'bun':
      cap(12);circ(c,0,-22.5,4.6);c.fill();c.fillStyle=g>=4?GOLD:'#c92a2a';c.fillRect(-4,-19.6,8,1.6);c.fillStyle=hc;
      c.beginPath();c.moveTo(-12,-8);c.quadraticCurveTo(-3,-17,9,-14);c.lineTo(12,-11);c.lineTo(-12,-11);c.closePath();c.fill();
      break;
    case 'messy':
      if(!S.helmet){cap();[[-8,-18,4],[-3,-21,4.4],[3,-21,4.2],[8,-18,4],[11,-13,3]].forEach(p=>{circ(c,p[0],p[1],p[2]);c.fill();});
        c.fillStyle='#ffd43b';c.save();c.translate(10.5,-10);c.rotate(0.5);c.fillRect(-0.8,-5,1.6,8);c.fillStyle='#ffb3b3';c.fillRect(-0.8,-6,1.6,1.4);c.restore();}
      else{c.fillRect(-11.4,-11,3,5);c.fillRect(8.4,-11,3,5);}
      break;
    case 'bob':
      c.fillRect(-12.8,-12,4.2,13);c.fillRect(8.6,-12,4.2,13);cap(12.4);rr(c,-10.5,-18.5,21,7,3);c.fill();
      break;
    case 'hood':
      c.fillStyle=hc;c.beginPath();c.moveTo(-9,-17.5);c.quadraticCurveTo(-5,-13,-2,-16.5);c.quadraticCurveTo(1,-12.8,4,-16.5);c.quadraticCurveTo(7,-13.5,9,-17.5);c.lineTo(9,-19);c.lineTo(-9,-19);c.closePath();c.fill();
      c.strokeStyle=S.top;c.lineWidth=3.4;c.beginPath();c.arc(0,-10,12.4,Math.PI*1.08,Math.PI*1.92);c.stroke();
      c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=0.9;c.beginPath();c.arc(0,-10,10.8,Math.PI*1.1,Math.PI*1.9);c.stroke();
      break;
  }
}
function face(c,S,j,g,t){
  const ex=4.1,ey=-7.6;
  const e=S.expr;
  if(e==='smug'||e==='grin'){
    c.strokeStyle=INK;c.lineWidth=1.4;c.lineCap='round';
    if(e==='grin'){c.beginPath();c.arc(-ex,ey+0.8,1.8,1.15*Math.PI,1.85*Math.PI);c.stroke();c.beginPath();c.arc(ex,ey+0.8,1.8,1.15*Math.PI,1.85*Math.PI);c.stroke();}
    else{line(c,-ex-1.8,ey,-ex+1.8,ey);line(c,ex-1.8,ey,ex+1.8,ey);c.fillStyle=INK;c.beginPath();c.ellipse(-ex,ey+0.6,1.3,0.9,0,0,Math.PI);c.fill();c.beginPath();c.ellipse(ex,ey+0.6,1.3,0.9,0,0,Math.PI);c.fill();}
    c.lineCap='butt';
  }else{
    c.fillStyle=INK;c.beginPath();c.ellipse(-ex,ey,1.55,2.05,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(ex,ey,1.55,2.05,0,0,Math.PI*2);c.fill();
    c.fillStyle='#ffffff';circ(c,-ex+0.5,ey-0.8,0.6);c.fill();circ(c,ex+0.5,ey-0.8,0.6);c.fill();
  }
  if(e==='tired'){c.strokeStyle='rgba(110,80,160,0.7)';c.lineWidth=1;c.beginPath();c.arc(-ex,ey+2.4,1.6,0.1*Math.PI,0.9*Math.PI);c.stroke();c.beginPath();c.arc(ex,ey+2.4,1.6,0.1*Math.PI,0.9*Math.PI);c.stroke();}
  // 입
  c.strokeStyle='#8a4a3a';c.lineWidth=1.1;
  if(e==='nervous'){c.beginPath();c.ellipse(0,-2.6,1.2,1.5,0,0,Math.PI*2);c.stroke();}
  else if(e==='smile'){c.beginPath();c.arc(0,-4,2.4,0.15*Math.PI,0.85*Math.PI);c.stroke();}
  else if(e==='confident'){c.fillStyle='#8a3a2e';c.beginPath();c.arc(0,-3.8,2.6,0,Math.PI);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(-1.6,-3.8,3.2,0.9);}
  else if(e==='smug'){c.beginPath();c.moveTo(-2.4,-2.8);c.quadraticCurveTo(1,-1.8,3,-4);c.stroke();}
  else if(e==='grin'){c.fillStyle='#8a3a2e';c.beginPath();c.arc(0,-4,3.4,0,Math.PI);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(-2.4,-4,4.8,1.1);}
  else if(e==='tired'){line(c,-2,-3,2,-3.4);}
  // 볼
  if(g<=1){c.fillStyle='rgba(255,120,120,0.35)';circ(c,-7,-4,1.8);c.fill();circ(c,7,-4,1.8);c.fill();}
  // 인턴 식은땀
  if(e==='nervous'){c.fillStyle='rgba(140,200,255,0.9)';const yy=-15+((t*0.8)%1)*3;c.beginPath();c.moveTo(10,yy-3);c.quadraticCurveTo(12.4,yy+1,10,yy+1.6);c.quadraticCurveTo(7.6,yy+1,10,yy-3);c.fill();}
  // 수염 (건축가 부장↑)
  if(j===2&&g>=3){c.fillStyle='rgba(90,59,40,0.35)';c.beginPath();c.arc(0,-5,7.5,0.1*Math.PI,0.9*Math.PI);c.lineTo(-5,-4);c.quadraticCurveTo(0,-1,5,-4);c.closePath();c.fill();}
}
function faceGear(c,S,j,g){
  if(j===2&&g>=1){c.strokeStyle=g>=4?GOLD:'#111';c.lineWidth=1;circ(c,-4.1,-7.6,2.9);c.stroke();circ(c,4.1,-7.6,2.9);c.stroke();line(c,-1.2,-7.6,1.2,-7.6);}
  if(j===3&&g>=2){c.strokeStyle=g>=4?GOLD:'#3a3a3a';c.lineWidth=1;rr(c,-7.2,-9.6,6,4,1);c.stroke();rr(c,1.2,-9.6,6,4,1);c.stroke();line(c,-1.2,-7.6,1.2,-7.6);}
  if(j===4&&g>=4){c.fillStyle='#0b0b0f';rr(c,-7.4,-9.8,6.4,4.2,1.4);c.fill();rr(c,1,-9.8,6.4,4.2,1.4);c.fill();c.strokeStyle='#0b0b0f';c.lineWidth=1;line(c,-1,-7.8,1,-7.8);c.fillStyle='rgba(255,255,255,0.35)';c.fillRect(-6.5,-9.2,2,1);c.fillRect(2,-9.2,2,1);}
  if(j===1&&g>=2){c.fillStyle=GOLD;circ(c,-11,-5,1);c.fill();circ(c,11,-5,1);c.fill();}
}
function headGear(c,S,j,g){
  if(S.helmet){
    c.fillStyle=S.helmet;c.beginPath();c.arc(0,-12,12.4,Math.PI,0);c.closePath();c.fill();c.strokeStyle=SHADE;c.lineWidth=0.9;c.stroke();
    c.fillStyle='rgba(0,0,0,0.12)';c.fillRect(-1.5,-24.2,3,12);
    c.fillStyle=g===2?'#d9ab0b':'#d5d5d5';rr(c,-14.5,-13.2,29,3.2,1.6);c.fill();
    if(g>=4){c.fillStyle=GOLD;c.fillRect(-1.6,-24.3,3.2,11.2);}
    else if(g===3){c.fillStyle='#3b7dd8';c.font='bold 4px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('감리',-6,-16);}
  }
  if(j===0&&g>=3){ // 이마경
    c.strokeStyle='#444';c.lineWidth=1.3;c.beginPath();c.arc(0,-11,11.8,1.1*Math.PI,1.9*Math.PI);c.stroke();
    c.fillStyle='#e3eaf2';circ(c,0,-20.5,3.6);c.fill();c.strokeStyle=g>=4?GOLD:'#8a94a6';c.lineWidth=1.2;c.stroke();
    c.fillStyle='#fff';circ(c,-1.1,-21.6,1.1);c.fill();
  }
  if(j===4&&g>=2){ // 헤드폰 (후드 위)
    c.strokeStyle='#1f1f26';c.lineWidth=2.6;c.beginPath();c.arc(0,-11,13.6,Math.PI*1.05,Math.PI*1.95);c.stroke();
    c.fillStyle=g>=4?GOLD:'#1f1f26';rr(c,-16,-13.5,5,9,2.2);c.fill();rr(c,11,-13.5,5,9,2.2);c.fill();
    c.fillStyle=g>=4?'#fff2b3':'#b197fc';circ(c,13.5,-9,1.1);c.fill();
  }
}
function heldItems(c,S,j,g,t){
  if(j===0&&g>=2){ // 청진기
    c.strokeStyle=g>=4?GOLD:'#7d8799';c.lineWidth=1.5;c.beginPath();c.moveTo(-4.5,0.8);c.quadraticCurveTo(-7,10,0,11);c.quadraticCurveTo(7,10,4.5,0.8);c.stroke();
    c.fillStyle=g>=4?GOLD:'#aab3c2';circ(c,0,12,2.1);c.fill();
  }
  if(j===0&&g>=1){c.fillStyle='#ffffff';rr(c,9.5,10,6,8,1);c.fill();c.strokeStyle='#aab3c2';c.lineWidth=0.7;c.stroke();c.fillStyle='#e03131';c.fillRect(11.3,11.2,2.4,0.8);c.fillRect(12.1,10.4,0.8,2.4);} // 차트
  if(j===1&&g>=2){ // 서류가방
    c.fillStyle=g>=4?'#1c1c1c':'#7a4b2a';rr(c,8.5,14.5,10,8,1.5);c.fill();
    c.strokeStyle=g>=4?GOLD:'#5a3418';c.lineWidth=1.2;c.beginPath();c.arc(13.5,14.5,2.4,Math.PI,0);c.stroke();
    if(g>=4){c.fillStyle=GOLD;c.fillRect(12.5,17,2,2);}
  }
  if(j===1&&g>=3){ // 의사봉
    c.save();c.translate(-12,14);c.rotate(-0.6+Math.sin(t*3)*0.1);
    c.fillStyle='#8b5a2b';c.fillRect(-1,-9,2,10);c.fillStyle=g>=4?GOLD:'#6b3f1e';rr(c,-5,-12.5,10,4.8,1.2);c.fill();c.restore();
  }
  if(j===2&&g>=2){ // 도면 롤
    c.save();c.translate(-13,8);c.rotate(-0.35);c.fillStyle='#3b7dd8';rr(c,-2.8,-9,5.6,18,2.5);c.fill();
    c.strokeStyle='rgba(255,255,255,0.75)';c.lineWidth=0.7;line(c,-1,-6,-1,6);line(c,1.2,-4,1.2,4);
    if(g>=4){c.fillStyle=GOLD;c.fillRect(-2.8,-9,5.6,2);c.fillRect(-2.8,7,5.6,2);}c.restore();
  }
  if(j===3&&g>=2){ // 계산기 (앞으로 들기)
    c.fillStyle='#d9dde3';rr(c,-5,9,10,9,1.5);c.fill();c.strokeStyle=SHADE;c.lineWidth=0.7;c.stroke();
    c.fillStyle='#7fd18b';c.fillRect(-3.8,10.2,7.6,2.6);
    c.fillStyle='#6b7280';for(let r=0;r<2;r++)for(let k=0;k<3;k++)c.fillRect(-3.6+k*2.8,14+r*2,1.6,1.2);
  }
  if(j===3&&g>=3){ // 돈주머니
    c.fillStyle=g>=4?GOLD:'#c8a24a';circ(c,-15,17,5);c.fill();c.fillRect(-16.5,11,3,2.5);
    c.fillStyle='#5a4510';c.font='bold 6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('₩',-15,17.5);
  }
  if(j===4&&g>=2&&g<5){ // 노트북 (앞으로 들기) + 화면 빛
    c.fillStyle='rgba(160,200,255,0.25)';c.beginPath();c.moveTo(-6,10);c.lineTo(6,10);c.lineTo(9,-4);c.lineTo(-9,-4);c.closePath();c.fill();
    c.fillStyle=g>=4?'#2b2b2b':'#c9ced8';rr(c,-7.5,9,15,8.5,1.2);c.fill();
    c.fillStyle=g>=4?GOLD:'#7aa7ff';rr(c,-6.3,10,12.6,6.3,0.8);c.fill();
    c.fillStyle='rgba(255,255,255,0.8)';for(let k=0;k<3;k++){const w=3+((t*4+k)%3)*1.6;c.fillRect(-5.2,11.1+k*1.7,w,0.8);}
  }
  if(j===4&&g>=3){ // 커피
    c.fillStyle='#f2f2f2';rr(c,11,13,7,8,1.5);c.fill();
    c.strokeStyle='#f2f2f2';c.lineWidth=1.2;c.beginPath();c.arc(18.5,17,2,-Math.PI/2,Math.PI/2);c.stroke();
    c.fillStyle='#6b4423';c.fillRect(12,14,5,1.5);
    c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=0.8;c.beginPath();c.moveTo(13,11.5);c.quadraticCurveTo(12,9.5,13.5,8);c.moveTo(16,11.5);c.quadraticCurveTo(15,9.5,16.5,8);c.stroke();
  }
}
function lanyard(c,col){
  c.strokeStyle=col||'#999';c.lineWidth=1.3;c.beginPath();c.moveTo(-4.5,0.5);c.lineTo(0,7.5);c.lineTo(4.5,0.5);c.stroke();
  c.fillStyle='#ffffff';rr(c,-3.6,7.5,7.2,7.5,1);c.fill();c.fillStyle=col||'#999';c.fillRect(-3.6,7.5,7.2,2.2);
  c.fillStyle='#c5cad3';c.fillRect(-2.4,10.9,4.8,0.9);c.fillRect(-2.4,12.5,3.4,0.9);
}

function draw(c,j,g,x,y,s,t,col){
  const S=style(j,g),myth=g>=4;
  const front=(j===3&&g>=2)||(j===4&&g>=2);
  c.save();c.translate(x,y);c.scale(s*(1+g*0.035),s*(1+g*0.035));
  if(g===3)glow(c,26,'255,170,60',0.32);
  if(myth){c.save();c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.24)';for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-34,4,-34]);c.fill();}c.restore();glow(c,30,'255,214,90',0.45);}
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23,12.5,3.2,0,0,Math.PI*2);c.fill();
  const ph=t*3+x*0.07;c.translate(0,Math.sin(ph)*(g>=1?1:0.6));
  hairBack(c,S);
  legs(c,S,ph);
  if(!front)arms(c,S,false);
  torso(c,S,j,g);
  if(g===0)lanyard(c,col);
  // 머리
  c.fillStyle=SKIN;circ(c,0,-10,11);c.fill();c.strokeStyle=SHADE;c.lineWidth=0.9;c.stroke();
  if(S.hair!=='hood'&&S.hair!=='long'&&S.hair!=='bob'){c.fillStyle=SKIN;circ(c,-11,-8,2.2);c.fill();circ(c,11,-8,2.2);c.fill();} // 귀 (후드·긴머리는 가림)
  face(c,S,j,g,t);
  hairFront(c,S,g);
  faceGear(c,S,j,g);
  headGear(c,S,j,g);
  if(front)arms(c,S,true);
  heldItems(c,S,j,g,t);
  if(myth){c.fillStyle=GOLD;star(c,-6.5,6,3.2);c.fill();c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=0.6;c.stroke();
    const sp=(t*2)%1;c.globalAlpha=1-sp;c.fillStyle='#fff6c2';star(c,13,-20-sp*4,2.2);c.fill();c.globalAlpha=1;}
  c.restore();
}
window.KTChars={draw,version:2};
})();
