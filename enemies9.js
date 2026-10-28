// 칼퇴 디펜스 — 새 적 그리기 v9 (기존 KTEnemies.draw를 감싸서 새 타입만 추가)
// meeting 📅 회의 소집(느리고 단단함) · call 📞 부재중 전화(아주 빠름) · revision ✏️ 수정 요청(체력 회복)
(function(){
'use strict';
const prev=window.KTEnemies;
const INK='#2a2a2a';
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function legs(c,ph,y,col){c.strokeStyle=col||INK;c.lineWidth=2;c.lineCap='round';const a=Math.sin(ph)*3.5;
  c.beginPath();c.moveTo(-4,y);c.lineTo(-4-a,y+6);c.moveTo(4,y);c.lineTo(4+a,y+6);c.stroke();}
function eyes(c,y,angry){c.fillStyle=INK;c.beginPath();c.arc(-3.6,y,1.4,0,Math.PI*2);c.arc(3.6,y,1.4,0,Math.PI*2);c.fill();
  if(angry){c.strokeStyle=INK;c.lineWidth=1.3;c.beginPath();c.moveTo(-6,y-3.4);c.lineTo(-1.8,y-1.8);c.moveTo(6,y-3.4);c.lineTo(1.8,y-1.8);c.stroke();}}
function meeting(c,ph,t){
  c.translate(0,-Math.abs(Math.sin(ph*0.6))*1.2);
  legs(c,ph*0.6,10);
  c.fillStyle='#ffffff';rr(c,-12,-12,24,23,3);c.fill();c.strokeStyle='#c9ced8';c.lineWidth=1;c.stroke();
  c.fillStyle='#e03131';rr(c,-12,-12,24,8,3);c.fill();c.fillRect(-12,-7,24,3);
  c.fillStyle='#868e96';c.fillRect(-7,-15,2.4,6);c.fillRect(4.6,-15,2.4,6);
  c.fillStyle='#fff';c.font='bold 5px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('MEETING',0,-8);
  c.fillStyle='#dee2e6';for(let i=0;i<4;i++)for(let k=0;k<2;k++)c.fillRect(-9+i*5,4+k*3.4,3.6,2.4);
  c.fillStyle='#e03131';c.fillRect(1+0*5,4,3.6,2.4);
  eyes(c,-0.5,true);
  c.strokeStyle='#7a3b2e';c.lineWidth=1.1;c.beginPath();c.arc(0,4,2.6,Math.PI*1.15,Math.PI*1.85);c.stroke();
}
function call(c,ph,t){
  const sh=Math.sin(t*60)*1.2;c.translate(sh,Math.sin(ph*0.8)*2);
  c.strokeStyle='rgba(255,120,120,0.9)';c.lineWidth=1.6;c.lineCap='round';
  for(let k=1;k<=2;k++){const r=8+k*4,o=(t*3)%1;c.globalAlpha=1-o*0.6;c.beginPath();c.arc(0,0,r+o*2,-0.6,0.6);c.stroke();c.beginPath();c.arc(0,0,r+o*2,Math.PI-0.6,Math.PI+0.6);c.stroke();}
  c.globalAlpha=1;
  c.save();c.rotate(-0.5);
  c.fillStyle='#ff4d4d';rr(c,-11,-4,22,8,4);c.fill();
  c.fillStyle='#c92a2a';rr(c,-13,-6,7,11,3);c.fill();rr(c,6,-6,7,11,3);c.fill();
  c.restore();
  c.fillStyle='#fff';c.font='bold 9px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('!',0,-11);
}
function revision(c,ph,t,heal){
  c.translate(0,-Math.abs(Math.sin(ph))*1.5);
  legs(c,ph,11);
  c.fillStyle='#fffdf5';c.beginPath();c.moveTo(-10,-13);c.lineTo(5,-13);c.lineTo(10,-8);c.lineTo(10,12);c.lineTo(-10,12);c.closePath();c.fill();
  c.strokeStyle='#d0c8b0';c.lineWidth=1;c.stroke();
  c.fillStyle='#e9e2cc';c.beginPath();c.moveTo(5,-13);c.lineTo(10,-8);c.lineTo(5,-8);c.closePath();c.fill();
  c.strokeStyle='#e03131';c.lineWidth=1.6;c.beginPath();c.moveTo(-7,3);c.lineTo(-2,8);c.moveTo(-2,3);c.lineTo(-7,8);c.stroke();
  c.beginPath();c.moveTo(1,5);c.quadraticCurveTo(4,2,7,6);c.stroke();
  eyes(c,-5,true);
  // 빨간 펜
  c.save();c.translate(11,-2);c.rotate(0.5+Math.sin(t*6)*0.25);c.fillStyle='#e03131';c.fillRect(-1.6,-10,3.2,14);c.fillStyle='#ffd8a8';c.beginPath();c.moveTo(-1.6,4);c.lineTo(1.6,4);c.lineTo(0,8);c.closePath();c.fill();c.restore();
  if(heal>0){c.globalAlpha=Math.min(1,heal*3);c.fillStyle='#40d987';c.font='bold 9px sans-serif';c.textAlign='center';c.fillText('+',-12,-14-(1-heal)*6);c.globalAlpha=1;}
}
function draw(c,type,x,y,size,t,o){
  if(type!=='meeting'&&type!=='call'&&type!=='revision')return prev.draw(c,type,x,y,size,t,o);
  o=o||{};const ph=(o.ph||0)+t*9;
  c.save();c.translate(x,y);let s=size/24;if(o.hit>0)s*=1+o.hit*0.8;c.scale(s,s);
  if(type==='meeting')meeting(c,ph,t);else if(type==='call')call(c,ph,t);else revision(c,ph,t,o.heal||0);
  if(o.hit>0){c.globalAlpha=Math.min(0.4,o.hit*4);c.fillStyle='#fff';c.beginPath();c.arc(0,-1,15,0,Math.PI*2);c.fill();c.globalAlpha=1;}
  c.restore();
}
window.KTEnemies=Object.assign({},prev,{draw});
})();
