// 칼퇴 디펜스 — 타격감 v14 (다른 디펜스·액션 게임에서 가져온 손맛)
//  1. 피격 번쩍임: 몬스터 그림 모양 그대로 하얗게 번쩍 (예전: 동그란 흰 원)
//  2. 피격 찌그러짐·떨림: 맞는 순간 몸이 납작해졌다 튀어 오름
//  3. 피해 숫자: 굵은 외곽선 숫자가 튀어 올랐다 사라짐 · 짧은 시간 연타는 한 숫자로 합산 · 치명타는 크게
//  4. 타격 불꽃: 맞은 자리에 직업 색 별빛
//  5. 체력바: 맞은 몬스터 위에 잠깐 표시, 깎인 부분이 흰색으로 뒤따라 줄어듦
//  6. 처치: 펑 터지는 고리·연기 조각 + 동전이 골드 쪽으로 날아감
//  7. 연속 처치 콤보: 1.5초 안에 이어 잡으면 "12 COMBO"
//  8. 히트 스톱: 정예·보스를 잡거나 보스에게 치명타를 넣는 순간 아주 잠깐 멈춤 + 화면 흔들림
// 게임 연결: 기존 파일은 고치지 않고 KTThemes.preHit/onDeath/drawEnemy/overlay, KTEnemies.draw, KTAssets.mob, KTFX.num 을 감쌈
// 설정 → "타격감": 강하게(기본) / 끄기(예전) · 저장 localStorage 'kt_feel'
(function(){
'use strict';
const T=window.KTThemes,A=window.KTAssets,FX=window.KTFX;if(!T||!A)return;
const KEY='kt_feel';let on=true;
try{on=localStorage.getItem(KEY)!=='0';}catch(e){}
const K=()=>window.KT,S=()=>window.KT&&window.KT.S;
const FONT='"Jua","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
const JOBCOL=['#7fe0ff','#ffe066','#ffa94d','#69db7c','#b197fc','#5c8dff','#ff6b6b','#20c997','#a9e34b','#ffd8a8','#ffc078','#d0bfff','#74c0fc','#ffa8a8'];
const rnd=Math.random;
let nums=[],parts=[],rings=[],coins=[],bars=new Map(),combo={n:0,t:0,show:0,best:0},stop=0,stopOwn=false,last=performance.now();

// ---------------- 그림 하얀 실루엣 (한 번 만들어 재사용) ----------------
const white=new WeakMap();
function whiteOf(im){let w=white.get(im);if(w)return w;w=document.createElement('canvas');w.width=im.width;w.height=im.height;
  const c=w.getContext('2d');c.drawImage(im,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#fff';c.fillRect(0,0,w.width,w.height);white.set(im,w);return w;}
function flashSprite(c,id,x,y,size,t,ph,h){
  const wim=A.get('mob/'+id+'_walk'),st=A.get('mob/'+id),im=wim||st;if(!im||h<=0)return;
  const wc=whiteOf(im),n=Math.max(1,Math.round(im.width/im.height)),fw=im.width/n,i=wim?(((Math.floor(t*8+(ph||0))%n)+n)%n):0;
  const s=size*1.9,sm=c.imageSmoothingEnabled;c.save();c.imageSmoothingEnabled=false;c.globalAlpha=Math.min(0.9,h/0.12*0.9);
  c.drawImage(wc,i*fw,0,fw,im.height,x-s/2,y+size*0.62-s,s,s);c.imageSmoothingEnabled=sm;c.restore();
}
// 맞는 순간 납작해졌다 튀어 오르는 모양 (발밑 기준)
function squash(c,x,y,size,h,t){
  const k=Math.max(0,Math.min(1,h/0.12)),fy=y+size*0.62;
  c.translate(x+Math.sin(t*95)*2.2*k,fy);c.scale(1+0.18*k,1-0.16*k);c.translate(-x,-fy);
}

// ---------------- 감싸기 ----------------
// 테마 몬스터 그리기
const dE=T.drawEnemy;
T.drawEnemy=function(c,e,t){
  if(!on)return dE.apply(this,arguments);
  const h=e.hitT||0;let r;
  c.save();if(h>0)squash(c,e.x,e.y,e.size,h,t);
  e.hitT=0;try{r=dE.call(this,c,e,t);}finally{e.hitT=h;}   // 예전 동그란 번쩍임은 끄고
  if(r&&h>0){const id=e.boss?'boss_'+e.tb:(e.mob||String(e.type).replace(/^th_/,''));flashSprite(c,id,e.x,e.y,e.drawSz||e.size,t,e.ph,h);}
  c.restore();return r;
};
// 테마가 그리는 크기를 알아 두기 (번쩍임을 그림과 같은 자리에)
const am=A.mob;
A.mob=function(c,id,x,y,size,t,ph){const ok=am.apply(this,arguments);if(ok&&curE)curE.drawSz=size;return ok;};
let curE=null;
const dE2=T.drawEnemy;T.drawEnemy=function(c,e,t){curE=e;try{return dE2.apply(this,arguments);}finally{curE=null;}};
// 사무실 업무·사무실 보스 그리기
const OFFICE_BOSS=['boss_kim','boss_client','boss_chairman'];
function hookOffice(){
  const E=window.KTEnemies;if(!E||E._v14)return;const pd=E.draw;
  window.KTEnemies=Object.assign({},E,{_v14:true,draw(c,type,x,y,size,t,o){
    if(!on)return pd.apply(this,arguments);
    const h=(o&&o.hit)||0;c.save();if(h>0)squash(c,x,y,size,h,t);
    const r=pd.call(this,c,type,x,y,size,t,Object.assign({},o,{hit:0}));
    if(h>0){const id=type==='boss'?OFFICE_BOSS[Math.max(0,Math.min(2,(o&&o.boss)|0))]:type;flashSprite(c,id,x,y,size,t,o&&o.ph,h);}
    c.restore();return r;}});
}
hookOffice();
// 예전 피해 숫자는 끄고 새 숫자로
if(FX&&FX.num){const pn=FX.num;FX.num=function(push,x,y,v,g,crit){if(!on)return pn.apply(this,arguments);if(crit&&g>=4&&FX.shake)FX.shake(3,0.2);};}

// 맞을 때마다
const ph=T.preHit;
T.preHit=function(e,d,o){
  const r=ph.apply(this,arguments);
  if(!on||!(r>0)||!o)return r;
  const now=performance.now(),crit=!!o.crit,col=JOBCOL[o.job]||'#ffffff';
  // 피해 숫자: 같은 몬스터에게 0.18초 안에 또 맞으면 합산
  let n=nums.find(q=>q.e===e&&now-q.born<180&&q.crit===crit);
  if(n){n.v+=r;n.pop=1;n.born=now;}
  else{
    // 범위 공격처럼 같은 순간 가까운 곳에 여러 숫자가 생기면 하나로 묶어 "2400×3"
    const m=nums.find(q=>now-q.born<60&&q.crit===crit&&(q.x-e.x)**2+(q.y-e.y+e.size*0.7)**2<34*34);
    if(m){m.cnt=(m.cnt||1)+1;m.v=Math.max(m.v,r);m.pop=1;}
    else if(nums.length<40)nums.push({e,x:e.x+(rnd()-0.5)*14,y:e.y-e.size*0.7,v:r,crit,col,born:now,life:crit?0.8:0.6,age:0,pop:1,vx:(rnd()-0.5)*30,cnt:1});
  }
  // 타격 불꽃
  if((!e._sp||now-e._sp>70)&&rings.length<120){e._sp=now;rings.push({x:e.x+(rnd()-0.5)*8,y:e.y-e.size*0.2+(rnd()-0.5)*8,r0:3,r1:crit?20:13,col:crit?'#ffd43b':col,age:0,life:0.14,star:1});
    if(parts.length<320)for(let k=0;k<(crit?6:3);k++){const a=rnd()*Math.PI*2,v=60+rnd()*90;parts.push({x:e.x,y:e.y-e.size*0.2,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,age:0,life:0.22+rnd()*0.12,col:crit?'#ffe066':'#ffffff',sz:crit?2.6:2});}}
  // 체력바 (보스는 화면 위에 따로 있음)
  if(!e.boss){const b=bars.get(e)||{trail:Math.max(0,(e.hp)/e.maxHp)};b.t=now;bars.set(e,b);}
  // 보스 치명타: 아주 짧은 멈춤
  if(crit&&e.boss)hitStop(30);
  return r;
};
// 처치될 때
const od=T.onDeath;
T.onDeath=function(e){
  const r=od.apply(this,arguments);
  if(!on||r)return r;
  const elite=!!(e.elite||(T.MOBS&&e.type&&T.MOBS[String(e.type).replace(/^th_/,'')]&&T.MOBS[String(e.type).replace(/^th_/,'')].elite));
  const big=e.boss||elite,col=big?'#ffd43b':'#ffffff';
  if(rings.length<120)rings.push({x:e.x,y:e.y-e.size*0.2,r0:e.size*0.3,r1:e.size*(big?2.4:1.3),col,age:0,life:big?0.4:0.24,w:big?4:2.5});
  if(parts.length<320)for(let k=0;k<(big?18:9);k++){const a=rnd()*Math.PI*2,v=50+rnd()*(big?220:120);
    parts.push({x:e.x,y:e.y-e.size*0.2,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,age:0,life:0.35+rnd()*0.25,col:k%3?'rgba(220,224,232,0.9)':'#ffd27a',sz:2+rnd()*2.5,g:240});}
  if(coins.length<30)coins.push({x:e.x,y:e.y-e.size*0.3,age:0,life:0.55,n:big?3:1});
  bars.delete(e);
  // 콤보
  const now=performance.now();combo.n=now-combo.t<1500?combo.n+1:1;combo.t=now;if(combo.n>=5)combo.show=now;
  if(combo.n>=10&&combo.n%10===0){try{KTSound.play('pick');}catch(_){}}
  if(big){hitStop(e.boss?90:55);if(FX&&FX.shake)FX.shake(e.boss?6:3.5,e.boss?0.35:0.2);}
  return r;
};

// ---------------- 히트 스톱 ----------------
function hitStop(ms){
  const k=K();if(!k||k.paused&&!stopOwn)return;   // 다른 이유로 멈춰 있으면 건드리지 않음
  stop=Math.max(stop,performance.now()+ms);if(!stopOwn){stopOwn=true;k.paused=true;}
  setTimeout(()=>releaseStop(performance.now()),ms+10);   // 화면을 안 그리는 동안(로비 전환)에도 반드시 풀림
}
function releaseStop(now){if(stopOwn&&now>=stop){stopOwn=false;const k=K();if(k)k.paused=false;}}

// ---------------- 그리기 (테마 날씨 다음, 이펙트 아래) ----------------
function goldPos(){
  const g=document.getElementById('hGold'),cv=document.getElementById('cv');if(!g||!cv)return [470,-20];
  const a=g.getBoundingClientRect(),b=cv.getBoundingClientRect();if(!b.width)return [470,-20];
  return [(a.left+a.width/2-b.left)*540/b.width,(a.top+a.height/2-b.top)*680/b.height];
}
function outlineText(c,txt,x,y,fill,size){
  c.font=`${size}px ${FONT}`;c.lineJoin='round';c.lineWidth=Math.max(3,size*0.22);c.strokeStyle='rgba(16,12,20,0.92)';c.strokeText(txt,x,y);c.fillStyle=fill;c.fillText(txt,x,y);
}
const fmt=v=>v>=10000?(v/1000).toFixed(v>=100000?0:1)+'k':String(Math.round(v));
const po=T.overlay;
T.overlay=function(c){
  po.apply(this,arguments);
  const now=performance.now(),s=S();let dt=Math.min(0.05,(now-last)/1000);last=now;
  releaseStop(now);
  if(!on||!s)return;
  if(s.state!=='play'){nums.length=parts.length=rings.length=coins.length=0;bars.clear();return;}
  if(s.paused||(K().paused&&!stopOwn))dt=0;
  const tsec=now/1000;
  c.save();
  // 타격 불꽃·처치 고리
  for(let i=rings.length-1;i>=0;i--){const q=rings[i];q.age+=dt;const p=q.age/q.life;if(p>=1){rings.splice(i,1);continue;}
    const rr=q.r0+(q.r1-q.r0)*(1-(1-p)*(1-p));c.globalAlpha=1-p;
    if(q.star){c.fillStyle=q.col;c.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4+0.3,l=k%2?rr*0.35:rr;c.lineTo(q.x+Math.cos(a)*l,q.y+Math.sin(a)*l);}c.closePath();c.fill();}
    else{c.strokeStyle=q.col;c.lineWidth=(q.w||2)*(1-p)+0.5;c.beginPath();c.arc(q.x,q.y,rr,0,Math.PI*2);c.stroke();}}
  // 조각
  for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.age+=dt;if(q.age>=q.life){parts.splice(i,1);continue;}
    q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=1-3*dt;c.globalAlpha=1-q.age/q.life;c.fillStyle=q.col;const z=q.sz*(1-q.age/q.life*0.5);c.fillRect(q.x-z/2,q.y-z/2,z,z);}
  // 체력바
  c.globalAlpha=1;
  for(const [e,b] of bars){const age=(now-b.t)/1000;if(e.hp<=0||age>1.3||!s.enemies.includes(e)){bars.delete(e);continue;}
    const ratio=Math.max(0,e.hp/e.maxHp);b.trail+=(ratio-b.trail)*Math.min(1,dt*6);if(b.trail<ratio)b.trail=ratio;
    const w=Math.max(22,e.size*1.3),x=e.x-w/2,y=e.y-e.size*1.25,a=age>1?1-(age-1)/0.3:1;c.globalAlpha=a;
    c.fillStyle='rgba(10,10,14,0.8)';c.fillRect(x-1,y-1,w+2,5);c.fillStyle='#fff';c.fillRect(x,y,w*b.trail,3);
    c.fillStyle=ratio>0.5?'#51cf66':ratio>0.25?'#fcc419':'#ff6b6b';c.fillRect(x,y,w*ratio,3);}
  // 동전
  const [gx,gy]=goldPos();
  for(let i=coins.length-1;i>=0;i--){const q=coins[i];q.age+=dt;const p=q.age/q.life;if(p>=1){coins.splice(i,1);continue;}
    const e2=p*p,x=q.x+(gx-q.x)*e2,y=q.y+(gy-q.y)*e2-Math.sin(p*Math.PI)*40;c.globalAlpha=p<0.85?1:(1-p)/0.15;
    c.fillStyle='#ffd43b';c.strokeStyle='#b8860b';c.lineWidth=1;for(let k=0;k<q.n;k++){c.beginPath();c.arc(x+k*5-(q.n-1)*2.5,y-k*2,3.4,0,Math.PI*2);c.fill();c.stroke();}}
  // 피해 숫자
  c.textAlign='center';c.textBaseline='middle';
  for(let i=nums.length-1;i>=0;i--){const q=nums[i];q.age+=dt;if(q.age>=q.life){nums.splice(i,1);continue;}
    q.pop=Math.max(0,q.pop-dt*7);q.x+=q.vx*dt;q.y-=(q.crit?46:38)*dt*(1-q.age/q.life);
    const p=q.age/q.life,sc=1+q.pop*(q.crit?0.55:0.3),size=(q.crit?15:12)*sc;
    c.globalAlpha=p<0.7?1:1-(p-0.7)/0.3;
    outlineText(c,fmt(q.v)+(q.crit?'!':'')+(q.cnt>1?'×'+q.cnt:''),q.x,q.y,q.crit?'#ffd43b':'#ffffff',Math.round(size));}
  // 콤보
  if(combo.n>=5&&now-combo.t<1500){const k=Math.min(1,(now-combo.show)/120),wob=1+(1-k)*0.4;c.globalAlpha=Math.min(1,(1500-(now-combo.t))/300);
    c.save();c.translate(270,66);c.scale(wob,wob);outlineText(c,combo.n+' COMBO',0,0,combo.n>=30?'#ff4d8d':combo.n>=15?'#ffa94d':'#ffe066',combo.n>=30?22:18);c.restore();}
  c.restore();
};

// ---------------- 설정 ----------------
new MutationObserver(()=>{
  const rs=document.getElementById('st-reset');if(!rs||document.getElementById('st-feel'))return;
  const row=document.createElement('div');row.className='kt-toggle';
  row.innerHTML=`<span>타격감</span><button class="kt-btn" id="st-feel">${on?'강하게':'끄기(예전)'}</button>`;
  rs.closest('.kt-toggle').before(row);
  row.querySelector('#st-feel').onclick=e=>{on=!on;try{localStorage.setItem(KEY,on?'1':'0');}catch(_){}e.target.textContent=on?'강하게':'끄기(예전)';};
}).observe(document.body,{childList:true});

window.KTHit={on:()=>on,set:b=>{on=!!b;},hitStop};   // (KTFeel 은 feel12.js 가 씀)
})();
