// 칼퇴 디펜스 — 캐릭터 그리기 모듈
// KTChars.draw(ctx, job, grade, x, y, scale, time, jobColor)
// job: 0 의사, 1 변호사, 2 건축가, 3 회계사, 4 개발자
// grade: 0 인턴, 1 대리, 2 과장, 3 부장, 4 대표
// 디자인 원칙: 인턴은 모두 같은 회색 셔츠 + 사원증(줄 색만 직업색),
//              대리부터 직업 복장, 과장부터 대표 소품, 부장은 금 명찰·오라, 대표는 금빛 후광.
(function(){
'use strict';
const SKIN='#f3cfa8', GOLD='#f4c542', INK='#2a2a2a';
const HAIR=['#3b2b22','#3b2b22','#3b2b22','#5a524c','#8e8a86']; // 직급이 오를수록 머리가 희끗희끗
const BODY=[
  ['#cfd4dc','#f5f7fb','#f5f7fb','#f5f7fb','#ffffff'], // 의사: 흰 가운
  ['#cfd4dc','#2f3f70','#29386a','#22305c','#151a30'], // 변호사: 정장
  ['#cfd4dc','#3a3a40','#323238','#2a2a2f','#1a1a1d'], // 건축가: 검은 터틀넥
  ['#cfd4dc','#6b8f71','#5f8a6a','#4f7a5c','#2d4a38'], // 회계사: 가디건 → 정장
  ['#cfd4dc','#5b62b0','#4e55a0','#40468a','#17171d'], // 개발자: 후드티
];
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,pts){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}c.closePath();}
function glow(c,r,rgb,a){const g=c.createRadialGradient(0,0,3,0,0,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,0,r);c.fill();}

function draw(c,j,g,x,y,s,t,col){
  const myth=g>=4;
  c.save();
  c.translate(x,y);
  const sc=s*(1+g*0.04);c.scale(sc,sc);
  // 후광/오라
  if(g===3)glow(c,26,'255,170,60',0.33);
  if(myth){
    c.save();c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.26)';
    for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-34,4,-34]);c.fill();}
    c.restore();glow(c,30,'255,214,90',0.45);
  }
  // 그림자
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,21,13,3.5,0,0,Math.PI*2);c.fill();
  c.translate(0,Math.sin(t*3+x*0.07)*(g>=1?1.1:0.6));
  const body=BODY[j][g];
  // 뒤쪽 레이어: 개발자 후드
  if(j===4&&g>=1){c.fillStyle=body;circ(c,0,-7,12.8);c.fill();c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=1;c.stroke();}
  // 몸통
  c.fillStyle=body;rr(c,-12,1,24,20,7);c.fill();
  c.strokeStyle='rgba(0,0,0,0.28)';c.lineWidth=1;c.stroke();

  if(g>=1){
    if(j===0){ // 의사: 안쪽 스크럽 + 라펠 + 주머니
      c.fillStyle=myth?'#3d8bd6':'#5aa9e6';c.fillRect(-4,1.5,8,19);
      c.strokeStyle=myth?GOLD:'#b9c1ce';c.lineWidth=1.2;
      c.beginPath();c.moveTo(-4,1.5);c.lineTo(-1,10);c.moveTo(4,1.5);c.lineTo(1,10);c.stroke();
      c.strokeRect(5.5,11,4,4);
      if(g>=2){c.fillStyle='#e05a5a';c.fillRect(6.6,9.6,0.9,2.6);c.fillStyle='#4a7be0';c.fillRect(8,9.6,0.9,2.6);} // 펜
    }else if(j===1){ // 변호사: 셔츠 V + 넥타이 + 배지
      c.fillStyle='#ffffff';poly(c,[-4.5,1.5,4.5,1.5,0,11]);c.fill();
      c.fillStyle=myth?GOLD:g>=3?'#d4a017':'#c0392b';poly(c,[0,3,2,5,0,14,-2,5]);c.fill();
      c.strokeStyle='rgba(0,0,0,0.35)';c.lineWidth=1;c.beginPath();c.moveTo(-4.5,1.5);c.lineTo(-2,12);c.moveTo(4.5,1.5);c.lineTo(2,12);c.stroke();
      if(g>=2){c.fillStyle=GOLD;circ(c,-7.5,5.5,1.7);c.fill();}
    }else if(j===2){ // 건축가: 터틀넥 목 + 핀
      c.fillStyle='rgba(255,255,255,0.08)';rr(c,-6,0,12,4.5,2);c.fill();
      c.strokeStyle='rgba(255,255,255,0.12)';c.lineWidth=0.8;c.beginPath();c.moveTo(-6,2.2);c.lineTo(6,2.2);c.stroke();
      if(myth){c.fillStyle=GOLD;poly(c,[-8,6,-5.5,6,-6.75,8.5]);c.fill();}
    }else if(j===3){ // 회계사: 대리·과장은 가디건(카라+단추), 부장 이상 정장+녹색 넥타이
      if(g>=3){
        c.fillStyle='#ffffff';poly(c,[-4.5,1.5,4.5,1.5,0,11]);c.fill();
        c.fillStyle=myth?GOLD:'#2f6b45';poly(c,[0,3,2,5,0,14,-2,5]);c.fill();
      }else{
        c.fillStyle='#ffffff';poly(c,[-5,1.5,0,6,-1,1.5]);c.fill();poly(c,[5,1.5,0,6,1,1.5]);c.fill();
        c.fillStyle='rgba(0,0,0,0.35)';for(let k=0;k<3;k++){circ(c,0,9+k*3.6,0.9);c.fill();}
      }
    }else if(j===4){ // 개발자: 앞주머니 + 끈 + 로고
      c.fillStyle='rgba(0,0,0,0.2)';rr(c,-7,12.5,14,6,2);c.fill();
      c.strokeStyle=myth?GOLD:'#e8e8f0';c.lineWidth=1;c.beginPath();c.moveTo(-3,2);c.lineTo(-3,9);c.moveTo(3,2);c.lineTo(3,9);c.stroke();
      if(g>=2){c.fillStyle=myth?GOLD:'#b197fc';c.font='bold 5px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('</>',0,15.6);}
    }
  }
  // 부장 금 명찰
  if(g===3){c.fillStyle=GOLD;c.fillRect(-10.5,6,5,3);}
  // 머리
  c.fillStyle=SKIN;circ(c,0,-9,10);c.fill();c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=1;c.stroke();
  c.fillStyle=HAIR[g];c.beginPath();c.arc(0,-10,10.6,Math.PI,0);c.closePath();c.fill();
  c.fillRect(-10.6,-10.5,3,5);c.fillRect(7.6,-10.5,3,5);
  // 얼굴
  c.fillStyle=INK;circ(c,-3.6,-6.8,1.3);c.fill();circ(c,3.6,-6.8,1.3);c.fill();
  c.strokeStyle='#8a5a44';c.lineWidth=1;c.beginPath();
  if(g===0){c.arc(0,-2.6,1.4,0,Math.PI*2);} // 인턴: 긴장한 입
  else c.arc(0,-4.2,2.6,0.15*Math.PI,0.85*Math.PI);
  c.stroke();
  if(g===0){c.fillStyle='rgba(255,120,120,0.35)';circ(c,-6.3,-4.2,1.7);c.fill();circ(c,6.3,-4.2,1.7);c.fill();}
  // 얼굴 소품
  if(j===2&&g>=1){ // 건축가: 동그란 안경
    c.strokeStyle=myth?GOLD:'#111';c.lineWidth=1;circ(c,-3.6,-6.8,2.8);c.stroke();circ(c,3.6,-6.8,2.8);c.stroke();
    c.beginPath();c.moveTo(-0.8,-6.8);c.lineTo(0.8,-6.8);c.stroke();
  }
  if(j===3&&g>=2){ // 회계사: 사각 안경
    c.strokeStyle=myth?GOLD:'#333';c.lineWidth=1;c.strokeRect(-6.6,-8.6,5.8,3.6);c.strokeRect(0.8,-8.6,5.8,3.6);
    c.beginPath();c.moveTo(-0.8,-6.8);c.lineTo(0.8,-6.8);c.stroke();
  }
  if(j===4&&myth){ // 개발자 대표: 선글라스
    c.fillStyle='#0d0d0d';rr(c,-7,-8.8,6,3.8,1.2);c.fill();rr(c,1,-8.8,6,3.8,1.2);c.fill();
    c.strokeStyle='#0d0d0d';c.lineWidth=1;c.beginPath();c.moveTo(-1,-7.2);c.lineTo(1,-7.2);c.stroke();
  }
  // 머리 소품
  if(j===2&&g>=2){ // 건축가: 안전모 (과장 노랑 → 부장 흰색 → 대표 흰색+금줄)
    c.fillStyle=g===2?'#f5c518':'#f4f4f4';c.beginPath();c.arc(0,-11,11.6,Math.PI,0);c.closePath();c.fill();
    c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=1;c.stroke();
    c.fillStyle=g===2?'#d9ab0b':'#d8d8d8';rr(c,-13.5,-12.2,27,3,1.5);c.fill();
    if(myth){c.fillStyle=GOLD;c.fillRect(-1.5,-22.4,3,10.4);}
  }
  if(j===0&&g>=3){ // 의사: 이마경
    c.strokeStyle='#444';c.lineWidth=1.4;c.beginPath();c.arc(0,-10,10.8,1.1*Math.PI,1.9*Math.PI);c.stroke();
    c.fillStyle='#dfe7f0';circ(c,0,-18.6,3.4);c.fill();c.strokeStyle=myth?GOLD:'#8a94a6';c.lineWidth=1.2;c.stroke();
    c.fillStyle='#ffffff';circ(c,-1,-19.6,1);c.fill();
  }
  if(j===4&&g>=2){ // 개발자: 헤드폰
    c.strokeStyle='#202026';c.lineWidth=2.6;c.beginPath();c.arc(0,-10,12,Math.PI*1.05,Math.PI*1.95);c.stroke();
    c.fillStyle=myth?GOLD:'#2b2b33';rr(c,-14.5,-12.5,4.5,8,2);c.fill();rr(c,10,-12.5,4.5,8,2);c.fill();
    if(g>=3){c.strokeStyle='#202026';c.lineWidth=1.2;c.beginPath();c.moveTo(-12,-5);c.quadraticCurveTo(-11,-1,-5,-2.5);c.stroke();c.fillStyle=col||'#b197fc';circ(c,-5,-2.5,1.2);c.fill();}
  }
  // 손 소품
  if(j===0&&g>=2){ // 청진기
    c.strokeStyle=myth?GOLD:'#7d8799';c.lineWidth=1.6;c.beginPath();c.moveTo(-5,1.5);c.quadraticCurveTo(-7.5,12,0,13);c.quadraticCurveTo(7.5,12,5,1.5);c.stroke();
    c.fillStyle=myth?GOLD:'#aab3c2';circ(c,0,14,2.2);c.fill();
  }
  if(j===1&&g>=2){ // 서류가방
    c.fillStyle=myth?'#1c1c1c':'#7a4b2a';rr(c,9,11,10,8,1.5);c.fill();
    c.strokeStyle=myth?GOLD:'#5a3418';c.lineWidth=1.2;c.beginPath();c.arc(14,11,2.4,Math.PI,0);c.stroke();
    if(myth){c.fillStyle=GOLD;c.fillRect(13,13.5,2,2);}
  }
  if(j===1&&g>=3){ // 의사봉
    c.save();c.translate(-14,12);c.rotate(-0.55);
    c.fillStyle='#8b5a2b';c.fillRect(-1,-1,2,10);
    c.fillStyle=myth?GOLD:'#6b3f1e';rr(c,-5,-4.5,10,4.8,1.2);c.fill();
    c.restore();
  }
  if(j===2&&g>=2){ // 도면 롤
    c.save();c.translate(13.5,9);c.rotate(0.35);
    c.fillStyle='#3b7dd8';rr(c,-2.8,-9,5.6,18,2.5);c.fill();
    c.strokeStyle='rgba(255,255,255,0.75)';c.lineWidth=0.7;c.beginPath();c.moveTo(-1,-6);c.lineTo(-1,6);c.moveTo(1.2,-4);c.lineTo(1.2,4);c.stroke();
    if(myth){c.fillStyle=GOLD;c.fillRect(-2.8,-9,5.6,2);c.fillRect(-2.8,7,5.6,2);}
    c.restore();
  }
  if(j===3&&g>=2){ // 계산기
    c.fillStyle='#d9dde3';rr(c,-5,11,10,9,1.5);c.fill();
    c.fillStyle='#7fd18b';c.fillRect(-3.8,12.2,7.6,2.6);
    c.fillStyle='#6b7280';for(let r=0;r<2;r++)for(let k=0;k<3;k++){c.fillRect(-3.6+k*2.8,16+r*2,1.6,1.2);}
  }
  if(j===3&&g>=3){ // 돈주머니
    c.fillStyle=myth?GOLD:'#c8a24a';circ(c,-15,15.5,5);c.fill();
    c.fillRect(-16.5,9.5,3,2.5);
    c.fillStyle='#5a4510';c.font='bold 6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('₩',-15,16);
  }
  if(j===4&&g>=3){ // 커피
    c.fillStyle='#f2f2f2';rr(c,10,10,7,8,1.5);c.fill();
    c.strokeStyle='#f2f2f2';c.lineWidth=1.2;c.beginPath();c.arc(17.5,14,2,-Math.PI/2,Math.PI/2);c.stroke();
    c.fillStyle='#6b4423';c.fillRect(11,11,5,1.5);
    c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=0.8;c.beginPath();c.moveTo(12,8.5);c.quadraticCurveTo(11,6.5,12.5,5);c.moveTo(15,8.5);c.quadraticCurveTo(14,6.5,15.5,5);c.stroke();
  }
  // 인턴: 사원증 (줄 색 = 직업색)
  if(g===0){
    c.strokeStyle=col||'#999';c.lineWidth=1.3;c.beginPath();c.moveTo(-4.5,1.5);c.lineTo(0,9);c.lineTo(4.5,1.5);c.stroke();
    c.fillStyle='#ffffff';rr(c,-3.6,9,7.2,8,1);c.fill();
    c.fillStyle=col||'#999';c.fillRect(-3.6,9,7.2,2.3);
    c.fillStyle='#c5cad3';c.fillRect(-2.4,12.6,4.8,1);c.fillRect(-2.4,14.4,3.4,1);
  }
  // 대표: 금 별 배지
  if(myth){c.fillStyle=GOLD;star(c,-7.5,7,3.2);c.fill();c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=0.6;c.stroke();}
  c.restore();
}
window.KTChars={draw};
})();
