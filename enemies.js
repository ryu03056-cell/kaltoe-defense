// 칼퇴 디펜스 — 적·보스 그리기 모듈
// KTEnemies.draw(ctx, type, x, y, size, t, opt)
// type: 'task' 업무 서류, 'urgent' 긴급 메일, 'client' 진상 클라이언트, 'boss'(opt.boss = 0 김부장 / 1 갑 클라이언트 / 2 회장님)
// opt: {ph: 걷기 위상, hit: 피격 남은 시간, dir: 진행 방향(라디안), talking: 말하는 중}
(function(){
'use strict';
const INK='#2a2a2a', GOLD='#f4c542';
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function line(c,x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}

function face(c,o){
  if(o.sun){c.fillStyle='#0d0d0d';rr(c,-7.2,-8.8,6.2,3.8,1.2);c.fill();rr(c,1,-8.8,6.2,3.8,1.2);c.fill();c.strokeStyle='#0d0d0d';c.lineWidth=1;line(c,-1,-7.2,1,-7.2);}
  else{c.fillStyle=INK;circ(c,-3.6,-6.6,1.3);c.fill();circ(c,3.6,-6.6,1.3);c.fill();}
  if(o.glasses){c.strokeStyle='#333';c.lineWidth=1;c.strokeRect(-6.8,-8.6,6,3.8);c.strokeRect(0.8,-8.6,6,3.8);line(c,-0.8,-6.8,0.8,-6.8);}
  c.strokeStyle=o.browCol||INK;c.lineWidth=o.thickBrow?2:1.3;
  line(c,-6.4,-10.4,-2,-8.8);line(c,6.4,-10.4,2,-8.8);
  c.lineWidth=1.1;c.strokeStyle='#7a3b2e';
  if(o.mouth==='shout'){c.fillStyle='#6b1f1f';c.beginPath();c.ellipse(0,-2.6,2.8,2.2,0,0,Math.PI*2);c.fill();}
  else if(o.mouth==='smirk'){c.beginPath();c.moveTo(-2.6,-3);c.quadraticCurveTo(1,-2,3,-4.2);c.stroke();}
  else{c.beginPath();c.arc(0,-1.4,2.6,1.15*Math.PI,1.85*Math.PI);c.stroke();}
}
function head(c,o){
  c.fillStyle=o.skin||'#f3cfa8';circ(c,0,-9,10);c.fill();c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=1;c.stroke();
  const hc=o.hair||'#3b2b22';c.fillStyle=hc;
  if(o.hairStyle==='bald'){
    c.fillRect(-10.6,-12,2.8,6);c.fillRect(7.8,-12,2.8,6);
    c.fillStyle='rgba(255,255,255,0.45)';c.beginPath();c.ellipse(-3,-16,3,1.4,-0.4,0,Math.PI*2);c.fill();
  }else{
    c.beginPath();c.arc(0,-10,10.6,Math.PI,0);c.closePath();c.fill();
    c.fillRect(-10.6,-10.5,3,5);c.fillRect(7.6,-10.5,3,5);
    if(o.hairStyle==='slick'){c.strokeStyle='rgba(255,255,255,0.35)';c.lineWidth=1;c.beginPath();c.moveTo(-3,-20);c.quadraticCurveTo(0,-15,6,-15);c.stroke();}
  }
  face(c,o);
}
function body(c,o){
  const w=o.w||12;
  c.fillStyle=o.body;rr(c,-w,1,w*2,20,7);c.fill();c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=1;c.stroke();
  if(o.shirtV){c.fillStyle=o.shirt||'#ffffff';poly(c,[-4.5,1.5,4.5,1.5,0,11]);c.fill();}
  if(o.tie){c.save();if(o.looseTie){c.translate(1.5,0);c.rotate(0.18);}c.fillStyle=o.tie;poly(c,[0,3,2,5,0,14,-2,5]);c.fill();c.restore();}
}
function legs(c,ph,w){
  const a=Math.sin(ph)*3;
  c.strokeStyle='#2b2b30';c.lineWidth=3;c.lineCap='round';
  line(c,-(w||5),19,-(w||5)+a,24);line(c,(w||5),19,(w||5)-a,24);
  c.lineCap='butt';
}
function shadow(c,w){c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23,w||12,3.2,0,0,Math.PI*2);c.fill();}

function drawTask(c,ph){ // 걸어다니는 서류 뭉치
  shadow(c,10);
  const a=Math.sin(ph)*2.5;
  c.strokeStyle='#2b2b30';c.lineWidth=2.4;c.lineCap='round';line(c,-4,12,-4+a,18);line(c,4,12,4-a,18);c.lineCap='butt';
  c.fillStyle='#d9dde5';rr(c,-9,-13,19,25,2);c.fill(); // 뒷장
  c.fillStyle='#ffffff';poly(c,[-11,-15,5,-15,10,-10,10,12,-11,12]);c.fill();
  c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=1;c.stroke();
  c.fillStyle='#dfe3ea';poly(c,[5,-15,5,-10,10,-10]);c.fill();
  c.fillStyle='#c5cad3';for(let k=0;k<4;k++)c.fillRect(-8,2+k*2.4,13-(k%2)*4,1.1);
  c.fillStyle=INK;circ(c,-4,-6,1.4);c.fill();circ(c,3,-6,1.4);c.fill();
  c.strokeStyle=INK;c.lineWidth=1.2;line(c,-6.5,-9.5,-2.5,-8);line(c,5.5,-9.5,1.5,-8);
  c.save();c.translate(3,8.5);c.rotate(-0.25);c.strokeStyle='#e03131';c.lineWidth=1.2;c.strokeRect(-6,-3,12,6);
  c.fillStyle='#e03131';c.font='bold 4.6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('긴급',0,0.3);c.restore();
}
function drawUrgent(c,ph,dir){ // 날아오는 긴급 메일
  c.save();c.rotate(dir||0);
  c.strokeStyle='rgba(255,210,80,0.55)';c.lineWidth=1.5;
  for(let k=0;k<3;k++){const yy=-5+k*5,len=8+((ph*3+k*2)%6);line(c,-14-len,yy,-14,yy);}
  c.restore();
  const bob=Math.sin(ph*1.6)*2;c.translate(0,bob);
  shadow(c,9);
  c.fillStyle='#ff6b6b';rr(c,-12,-8,24,16,2.5);c.fill();c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=1;c.stroke();
  c.strokeStyle='#ffd8d8';c.lineWidth=1.2;c.beginPath();c.moveTo(-12,-8);c.lineTo(0,1.5);c.lineTo(12,-8);c.stroke();
  c.fillStyle='#ffd43b';circ(c,9,-9,5);c.fill();
  c.fillStyle='#7a2b00';c.font='bold 8px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('!',9,-8.6);
  c.fillStyle=INK;circ(c,-4,3,1.2);c.fill();circ(c,2,3,1.2);c.fill();
  c.strokeStyle=INK;c.lineWidth=1.1;line(c,-6,0.6,-2.6,1.8);line(c,4,0.6,0.6,1.8);
}
function drawClient(c,ph,t,talking){ // 전화기 든 진상 클라이언트
  shadow(c,12);legs(c,ph,5);
  body(c,{body:'#7b5bd6',w:12});
  c.fillStyle='rgba(255,255,255,0.18)';rr(c,-5,1.5,10,4,2);c.fill(); // 카라
  head(c,{skin:'#f2b49b',hair:'#4a2d1f',mouth:talking?'shout':'angry'});
  c.fillStyle='#1d1d22';rr(c,9,-14,4,9,1.2);c.fill(); // 전화기
  c.fillStyle='#f2b49b';circ(c,11,-4,2.4);c.fill();
  c.fillStyle='rgba(255,255,255,0.55)';
  for(let k=0;k<2;k++){const p=(t*1.4+k*0.5)%1;circ(c,-5+k*10,-21-p*8,2+p*2.5);c.globalAlpha=1-p;c.fill();c.globalAlpha=1;}
}
function drawBoss(c,i,ph,t,talking){
  if(i===0){ // 김부장: 대머리·안경·콧수염·배·커피
    shadow(c,15);legs(c,ph,6);
    body(c,{body:'#f2f2f2',w:15,tie:'#c92a2a',looseTie:true});
    c.strokeStyle='#5c4a3a';c.lineWidth=2;line(c,-15,15,15,15);c.fillStyle=GOLD;c.fillRect(-2,13.8,4,2.5);
    head(c,{hairStyle:'bald',hair:'#3b2b22',glasses:true,mouth:talking?'shout':'angry'});
    c.fillStyle='#3b2b22';rr(c,-4,-4.8,8,2,1);c.fill();
    c.fillStyle='#f2f2f2';rr(c,13,8,8,9,1.5);c.fill();c.strokeStyle='#999';c.lineWidth=0.8;c.stroke();
    c.fillStyle='#6b4423';c.fillRect(14,9,6,1.6);
    c.fillStyle='#c92a2a';c.font='bold 4px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('부장',17,13.4);
  }else if(i===1){ // 갑 클라이언트: 선글라스·금목걸이·돈다발
    shadow(c,14);legs(c,ph,6);
    body(c,{body:'#c9a66b',w:14,shirtV:true,shirt:'#1d1d22'});
    c.fillStyle=GOLD;for(let k=-4;k<=4;k++){circ(c,k*1.3,3+Math.abs(k)*-0.5+5-Math.abs(k)*0.6,1.1);c.fill();}
    circ(c,0,9,2);c.fill();
    head(c,{hair:'#1a1a1a',hairStyle:'slick',sun:true,mouth:'smirk'});
    c.save();c.translate(-15,9);
    for(let k=0;k<4;k++){c.save();c.rotate(-0.5+k*0.25);c.fillStyle=k%2?'#69b26c':'#57a05a';c.fillRect(-1.6,-9,3.2,9);c.restore();}
    c.restore();
  }else{ // 회장님: 백발·흰 눈썹·수염·골프채
    shadow(c,14);legs(c,ph,6);
    c.save();c.translate(14,4);c.rotate(0.35+Math.sin(t*2)*0.15);c.strokeStyle='#adb5bd';c.lineWidth=1.6;line(c,0,0,0,20);c.fillStyle='#495057';rr(c,-1,19,6,3,1);c.fill();c.restore();
    body(c,{body:'#16161c',w:14,shirtV:true,tie:'#c92a2a'});
    c.fillStyle=GOLD;circ(c,-8,6,2);c.fill();
    head(c,{hair:'#e9ecef',browCol:'#e9ecef',thickBrow:true,mouth:talking?'shout':'angry'});
    c.fillStyle='#e9ecef';c.beginPath();c.moveTo(-6,-4);c.quadraticCurveTo(0,6,6,-4);c.quadraticCurveTo(0,-1,-6,-4);c.fill();
  }
}

function draw(c,type,x,y,size,t,o){
  o=o||{};
  const ph=(o.ph||0)+t*9;
  c.save();c.translate(x,y);
  let s=type==='boss'?size/27:type==='task'?size/24:type==='urgent'?size/24:size/27;
  const boss=type==='boss';
  if(o.hit>0)s*=1+o.hit*(boss?0.25:0.9);
  c.scale(s,s);
  if(type==='boss'){
    const p=0.5+0.5*Math.sin(t*4);
    const g=c.createRadialGradient(0,0,4,0,0,30);g.addColorStop(0,`rgba(255,70,70,${0.18+0.17*p})`);g.addColorStop(1,'rgba(255,70,70,0)');
    c.fillStyle=g;circ(c,0,0,30);c.fill();
    c.translate(0,-Math.abs(Math.sin(ph*0.5))*1.5);
    drawBoss(c,o.boss||0,ph*0.6,t,o.talking);
  }else if(type==='task'){c.translate(0,-Math.abs(Math.sin(ph))*1.6);drawTask(c,ph);}
  else if(type==='urgent'){drawUrgent(c,ph,o.dir);}
  else{c.translate(0,-Math.abs(Math.sin(ph))*1.4);drawClient(c,ph,t,o.talking);}
  if(o.hit>0){c.globalAlpha=Math.min(boss?0.16:0.4,o.hit*4);c.fillStyle='#ffffff';circ(c,0,-2,16);c.fill();c.globalAlpha=1;}
  c.restore();
}
window.KTEnemies={draw};
})();
