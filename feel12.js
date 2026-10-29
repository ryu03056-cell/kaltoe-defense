// 칼퇴 디펜스 — 평타 손맛 v12
// - 인턴·대리도 맞는 순간 번쩍임·파편 (기존 fx9는 과장부터)
// - 직업별 타격음 (기존 효과음과 별도, 음소거 설정 따름)
// - 직급별 투사체: 의사 알약 → 대표 메스 / 건축가 도면 → 과장부터 삼각자 / 회계사 영수증 → 과장 금화 → 대표 돈다발 / 변호사 부장부터 의사봉
// 게임은 drawProj 안에서 KTFeel.proj()를 먼저 부르고, true면 기본 그림을 건너뜀
(function(){
'use strict';
const rnd=Math.random;
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const base=j=>{const H=window.KTRecipes&&KTRecipes.baseOf(j);return H!=null?H:j;};
// ---------------- 투사체 ----------------
function proj(c,job,g,p,ang){
  const j=base(job);
  if(j===0&&g>=4){ // 메스
    c.rotate(ang);c.fillStyle='#dee2e6';c.beginPath();c.moveTo(1,-2.2);c.lineTo(8,0);c.lineTo(1,1.2);c.closePath();c.fill();
    c.fillStyle='#ffffff';c.fillRect(1,-2.2,5,0.8);c.fillStyle='#4dabf7';rr(c,-7,-1.6,8,3.2,1.4);c.fill();return true;}
  if(j===1&&g>=3){ // 의사봉
    c.rotate(p*10);c.fillStyle='#8a5a2b';c.fillRect(-0.9,-1,1.8,7);c.fillStyle=g>=4?'#f4c542':'#a0522d';rr(c,-4.5,-4,9,4,1.2);c.fill();c.fillStyle='rgba(255,255,255,0.5)';c.fillRect(-4,-3.6,8,0.8);return true;}
  if(j===2&&g>=2){ // 삼각자
    c.rotate(p*11);c.fillStyle=g>=4?'#f4c542':'#ffd43b';c.beginPath();c.moveTo(-5,4);c.lineTo(5,4);c.lineTo(-5,-6);c.closePath();c.fill();
    c.fillStyle='rgba(30,30,30,0.85)';c.beginPath();c.moveTo(-3,2.4);c.lineTo(0.6,2.4);c.lineTo(-3,-1.8);c.closePath();c.fill();
    c.fillStyle='#868e96';for(let k=0;k<4;k++)c.fillRect(-4.6+k*2.4,3.2,0.6,0.8);return true;}
  if(j===3){
    if(g<=1){ // 영수증
      c.rotate(p*7);c.fillStyle='#ffffff';c.beginPath();c.moveTo(-3,-5);c.lineTo(3,-5);c.lineTo(3,4);
      for(let k=0;k<4;k++)c.lineTo(3-k*1.5-0.75,k%2?4:5.2);c.lineTo(-3,4);c.closePath();c.fill();
      c.fillStyle='#adb5bd';c.fillRect(-2,-3.5,4,0.7);c.fillRect(-2,-2,3,0.7);c.fillRect(-2,-0.5,4,0.7);c.fillStyle='#40c057';c.fillRect(-2,1.5,4,0.9);return true;}
    if(g>=4){ // 돈다발
      c.rotate(Math.sin(p*9)*0.5);for(let k=0;k<3;k++){c.fillStyle=k%2?'#69db7c':'#40c057';rr(c,-6,-3.6+k*1.6-1.6,12,4.4,1);c.fill();}
      c.fillStyle='#f4c542';c.fillRect(-1.4,-5,2.8,6.8);c.fillStyle='#fff3bf';c.font='bold 4px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('₩',4,0.4);return true;}
    return false;}
  return false;
}
// ---------------- 저직급 타격 이펙트 ----------------
function parts(n,v0,v1,up){const ps=[];for(let k=0;k<n;k++){const a=rnd()*Math.PI*2,v=v0+rnd()*(v1-v0);ps.push([Math.cos(a)*v,Math.sin(a)*v-(up||0),1.4+rnd()*1.8]);}return ps;}
// ---------------- 직업별 타격음 ----------------
let ac=null,gain=null,lastT=0;
function audio(){
  if(ac)return ac;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{ac=new AC();gain=ac.createGain();gain.gain.value=0.5;gain.connect(ac.destination);}catch(e){ac=null;}return ac;
}
function tone(f,d,type,vol,slide,at){const t0=ac.currentTime+(at||0),o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f*slide),t0+d);g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
  o.connect(g);g.connect(gain);o.start(t0);o.stop(t0+d+0.02);}
let nb=null;
function noise(d,filt,fr,vol){if(!nb){nb=ac.createBuffer(1,ac.sampleRate*0.3,ac.sampleRate);const a=nb.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=rnd()*2-1;}
  const t0=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=nb;f.type=filt;f.frequency.value=fr;
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+d);s.connect(f);f.connect(g);g.connect(gain);s.start(t0);s.stop(t0+d+0.02);}
const SND=[
  ()=>tone(1250,0.035,'sine',0.05,1.25),                       // 의사: 톡
  ()=>noise(0.045,'highpass',3500,0.05),                       // 변호사: 서류 휙
  ()=>tone(320,0.06,'triangle',0.07,0.6),                      // 건축가: 툭
  ()=>{tone(2100,0.04,'sine',0.035);tone(2800,0.05,'sine',0.03,1,0.03);}, // 회계사: 딸깍
  ()=>tone(900,0.03,'square',0.025,1.4),                       // 개발자: 삑
  ()=>tone(2300,0.05,'sine',0.03,1.12),                        // 경찰: 호루라기
  ()=>noise(0.08,'lowpass',1600,0.06),                         // 소방관: 쏴아
  ()=>{noise(0.04,'lowpass',500,0.08);tone(160,0.06,'sine',0.06,0.7);}, // 공무원: 쾅(도장)
  ()=>{noise(0.05,'lowpass',900,0.08);tone(130,0.08,'sine',0.07,0.5);}, // 군인: 펑
];
function sound(job,g){
  try{if(!window.KTSound||KTSound.isMuted())return;if(!audio())return;if(ac.state==='suspended')ac.resume();
    const now=performance.now();if(now-lastT<55)return;lastT=now;const f=SND[base(job)];if(f)f();}catch(e){}
}
// ---------------- fx9 연결 ----------------
function hook(){
  const F=window.KTFX;if(!F||F._v12)return;F._v12=true;
  const pa=F.attack;
  F.attack=function(push,o){
    pa(push,o);
    if(o.g<2){
      const d=0.13;
      push({k:'spark',x:o.x2,y:o.y2,col:o.g===1?o.col:'#ffffff',ps:parts(o.g===1?5:4,40,95,15),delay:d,life:d+0.32,add:true});
      push({k:'shock',x:o.x2,y:o.y2,col:o.g===1?o.col:'#e9ecf2',r0:3,r1:o.g===1?18:13,w:2,delay:d,life:d+0.24});
      push({k:'muzzle',x:o.x1,y:o.y1,col:o.col,r:7,life:0.12});
    }
    sound(o.job,o.g);
  };
}
hook();
window.KTFeel={proj,sound};
})();
