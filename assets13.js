// 칼퇴 디펜스 — 그림 파일 로더 · 여러 프레임 동작 재생 v13
// 그림 파일이 있으면 그 그림을 쓰고, 없으면 지금처럼 코드로 그린 그림을 그대로 씀 (기존 모듈은 건드리지 않음)
// 어떤 파일이 있는지는 목록 파일로 알려줌: pixel/manifest.json · mob/manifest.json · bg/manifest.json
//   예) ["fire_0","fire_0_throw","fire_4"]  (확장자 .png 생략)  — tools/make_manifest.py 로 자동 생성
// 캐릭터  pixel/{key}_{단계0~4}.png          정지 그림 (64×64 정면)
//         pixel/{key}_{단계}_throw.png       던지기 동작: 정사각 프레임을 가로로 이어붙인 시트 (프레임 수 = 가로/세로)
//         pixel/{key}_{단계}_idle.png        대기 동작 시트 (초당 8프레임 반복)
//   key: doctor lawyer architect accountant developer police fire civil soldier medlaw planner fintech swat emt
// 몬스터  mob/{몬스터id}.png · mob/{몬스터id}_walk.png (걷기 시트)
// 배경    bg/{테마id}_floor.png (복도 바닥 타일) · bg/{테마id}_cell.png (칸 바닥) · bg/{테마id}_prop1~3.png (소품)
(function(){
'use strict';
const BASE=window.KT_ASSET_BASE||'';
const img={};
let listed=0;
function loadList(dir){
  if(location.protocol==='file:')return Promise.resolve();   // 파일로 바로 열면 목록을 못 읽음 → 코드 그림 사용
  return fetch(BASE+dir+'/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():[]).catch(()=>[]).then(list=>{
    (Array.isArray(list)?list:[]).forEach(n=>{listed++;const im=new Image();im.onload=()=>{img[dir+'/'+n]=im;};im.src=BASE+dir+'/'+n+'.png';});
  });
}
const ready=Promise.all(['pixel','mob','bg'].map(loadList));
const get=p=>img[p]||null;
const nFrames=im=>Math.max(1,Math.round(im.width/im.height));
function frame(c,im,i,x,y,w,h){const n=nFrames(im),fw=im.width/n;const sm=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;
  c.drawImage(im,(((i%n)+n)%n)*fw,0,fw,im.height,x,y,w,h);c.imageSmoothingEnabled=sm;}

// ---------------- 캐릭터 ----------------
const KEYS=['doctor','lawyer','architect','accountant','developer','police','fire','civil','soldier','medlaw','planner','fintech','swat','emt'];
const Anim={a:0};   // 게임이 직원을 그리기 직전에 공격 동작 진행도(1→0)를 넣어 줌
// characters6.js 와 같은 크기·오라 규칙
const GC=['#a3abb9','#4aa3ff','#b875ff','#ff9a2e','#ff4d8d'];
const K=0.8,DX=-32*K,DY=23-61*K,DS=64*K;
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
function glow(c,r,rgb,a){const g=c.createRadialGradient(0,-2,3,0,-2,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;circ(c,0,-2,r);c.fill();}
function back(c,g,t,col){
  if(g===2)glow(c,24,'184,117,255',0.22);
  if(g===3)glow(c,28,'255,170,60',0.36);
  if(g>=4){c.save();c.translate(0,-2);c.rotate(t*0.6);c.fillStyle='rgba(255,214,90,0.24)';for(let k=0;k<10;k++){c.rotate(Math.PI/5);poly(c,[0,0,-4,-36,4,-36]);c.fill();}c.restore();glow(c,32,'255,214,90',0.46);}
  c.fillStyle='rgba(0,0,0,0.35)';c.beginPath();c.ellipse(0,23.4,12,3,0,0,Math.PI*2);c.fill();
  if(g===0&&col){c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.ellipse(0,23.4,11,2.8,0,0,Math.PI*2);c.stroke();}
}
function front(c,g,t){
  if(g>=1&&g<=3){c.fillStyle=GC[g];circ(c,-11,20,2.6);c.fill();c.strokeStyle='rgba(255,255,255,0.8)';c.lineWidth=0.8;c.stroke();}
  if(g===2){c.fillStyle=GC[2];circ(c,-5.5,20.5,2);c.fill();}
  if(g>=4){c.fillStyle='#f4c542';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?3.4*0.45:3.4;c.lineTo(-11+Math.cos(a)*q,19+Math.sin(a)*q);}c.closePath();c.fill();}
}
// 이 직원에게 쓸 그림 고르기 → [이미지, 프레임 번호] 또는 null
function choose(j,g,t,a){
  const k=KEYS[j];if(!k)return null;const p='pixel/'+k+'_'+g;
  const th=get(p+'_throw'),id=get(p+'_idle'),st=get(p);
  if(a>0&&th){const n=nFrames(th);return [th,Math.min(n-1,Math.floor((1-a)*n))];}
  if(id)return [id,Math.floor(t*8)];
  if(st)return [st,0];
  if(th)return [th,0];
  return null;
}
function hook(){
  const prev=window.KTChars;if(!prev||prev._v13)return;
  window.KTChars=Object.assign({},prev,{_v13:true,
    draw(c,j,g,x,y,s,t,col){
      const ch=choose(j,g,t,Anim.a);if(!ch)return prev.draw(c,j,g,x,y,s,t,col);
      c.save();c.translate(x,y);const k=s*(1+g*0.035)*(g===0?0.92:1);c.scale(k,k);
      back(c,g,t,col);frame(c,ch[0],ch[1],DX,DY+Math.round(Math.sin(t*3+x*0.07)*(g>=1?1:0.6)),DS,DS);front(c,g,t);c.restore();
    },
    portrait(c,j,g,cx,cy,h,t){
      const ch=choose(j,g,0,0);if(!ch)return prev.portrait?prev.portrait(c,j,g,cx,cy,h,t):undefined;
      const s=h/62;c.save();c.translate(cx,cy);c.scale(s,s);back(c,g,t||0);frame(c,ch[0],0,DX,DY,DS,DS);front(c,g,t||0);c.restore();
    },
  });
}
// 캐릭터 모듈들이 모두 로드된 뒤 감쌈 (recipes12가 마지막으로 감싸므로 그 다음)
hook();

// ---------------- 몬스터 ----------------
// 그림이 있으면 그리고 true, 없으면 false (코드 그림 사용)
function mob(c,id,x,y,size,t,ph){
  const w=get('mob/'+id+'_walk'),st=get('mob/'+id);const im=w||st;if(!im)return false;
  const s=size*1.9;frame(c,im,w?Math.floor(t*8+(ph||0)):0,x-s/2,y+size*0.62-s,s,s);return true;
}
window.KTAnim=Anim;
window.KTAssets={ready,get,frame,nFrames,mob,KEYS,count:()=>Object.keys(img).length,listed:()=>listed};
})();
