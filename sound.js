// 칼퇴 디펜스 — 사운드 모듈 (파일 없이 WebAudio로 합성)
// KTSound.init()        첫 터치/클릭 때 호출 (브라우저 자동재생 정책)
// KTSound.play(name, arg)  효과음
// KTSound.setMode('normal'|'boss')  배경음악 분위기
// KTSound.toggleMute() / isMuted()
(function(){
'use strict';
let ac=null,master=null,sfx=null,mus=null,noiseBuf=null,timer=null;
let muted=false,mode='normal',step=0,nextT=0;
try{muted=localStorage.getItem('kt_mute')==='1';}catch(e){}
const last={};
const N=n=>440*Math.pow(2,(n-69)/12);

function init(){
  if(ac){if(ac.state!=='running'&&!document.hidden)ac.resume().catch(()=>{});return;}   // iOS는 전화·앱 전환 뒤 'interrupted' 상태가 됨
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{ac=new AC();}catch(e){ac=null;return;}
  master=ac.createGain();master.gain.value=muted?0:0.9;master.connect(ac.destination);
  sfx=ac.createGain();sfx.gain.value=0.55;sfx.connect(master);
  mus=ac.createGain();mus.gain.value=0.22;mus.connect(master);
  noiseBuf=ac.createBuffer(1,ac.sampleRate*0.5,ac.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  nextT=ac.currentTime+0.15;timer=setInterval(sched,50);
}
function tone(freq,dur,o){
  o=o||{};if(!ac)return;
  const t0=o.when!=null?o.when:ac.currentTime+(o.at||0);
  const osc=ac.createOscillator(),g=ac.createGain();
  osc.type=o.type||'square';osc.frequency.setValueAtTime(freq,t0);
  if(o.slide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq*o.slide),t0+dur);
  const v=o.vol==null?0.3:o.vol;
  g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+(o.attack||0.006));
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  osc.connect(g);g.connect(o.dest||sfx);osc.start(t0);osc.stop(t0+dur+0.03);
}
function noise(dur,o){
  o=o||{};if(!ac)return;
  const t0=o.when!=null?o.when:ac.currentTime+(o.at||0);
  const src=ac.createBufferSource();src.buffer=noiseBuf;
  const f=ac.createBiquadFilter();f.type=o.lp?'lowpass':'highpass';f.frequency.value=o.lp||o.hp||1500;
  const g=ac.createGain();g.gain.setValueAtTime(o.vol||0.15,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  src.connect(f);f.connect(g);g.connect(o.dest||sfx);src.start(t0);src.stop(t0+dur+0.02);
}
const arp=(notes,gap,o)=>notes.forEach((n,i)=>tone(N(n),o.dur||0.12,Object.assign({},o,{at:(o.at||0)+i*gap})));

const SFX={
  select:()=>tone(N(84),0.035,{type:'sine',vol:0.1}),
  summon:g=>{g=g||0;tone(N(72+g*3),0.07,{vol:0.14});tone(N(79+g*3),0.1,{vol:0.13,at:0.06});if(g>=2)arp([84,88,91],0.05,{type:'triangle',vol:0.18,at:0.13,dur:0.18});},
  merge:()=>arp([72,76,79,84],0.055,{vol:0.13,dur:0.13}),
  myth:()=>{arp([67,72,76,79],0.09,{type:'square',vol:0.14,dur:0.16});[72,76,79,84].forEach(n=>tone(N(n),0.9,{type:'triangle',vol:0.16,at:0.38,attack:0.02}));noise(0.5,{vol:0.08,hp:5000,at:0.38});},
  hit:()=>tone(N(86+Math.random()*5),0.03,{type:'triangle',vol:0.045}),
  kill:()=>{noise(0.05,{vol:0.07,hp:2500});tone(N(76),0.06,{type:'sine',vol:0.06,slide:1.6});},
  coin:()=>{tone(N(88),0.05,{vol:0.07});tone(N(95),0.11,{vol:0.07,at:0.05});},
  stun:()=>tone(260,0.2,{type:'sine',vol:0.14,slide:2.4}),
  sell:()=>{noise(0.04,{vol:0.08,hp:3000});tone(N(84),0.06,{vol:0.1,at:0.02});tone(N(91),0.12,{vol:0.1,at:0.08});},
  pick:()=>tone(N(74),0.04,{type:'triangle',vol:0.14}),
  drop:()=>{tone(N(67),0.05,{type:'triangle',vol:0.16});noise(0.03,{vol:0.05,lp:900});},
  transfer:()=>arp([69,74,81],0.06,{type:'triangle',vol:0.15,dur:0.12}),
  luckWin:()=>arp([76,79,84,88],0.06,{type:'square',vol:0.12,dur:0.14}),
  luckFail:()=>{tone(N(62),0.18,{type:'sine',vol:0.16,slide:0.9});tone(N(57),0.32,{type:'sine',vol:0.16,at:0.18,slide:0.85});},
  error:()=>tone(150,0.14,{type:'sawtooth',vol:0.1}),
  wave:()=>{tone(N(81),0.18,{type:'sine',vol:0.16});tone(N(76),0.3,{type:'sine',vol:0.16,at:0.16});}, // 엘리베이터 딩동
  boss:()=>{tone(N(45),0.55,{type:'sawtooth',vol:0.17});tone(N(44),0.9,{type:'sawtooth',vol:0.17,at:0.5});noise(0.6,{vol:0.06,lp:400});},
  bossdown:()=>{arp([72,76,79],0.08,{type:'square',vol:0.13,dur:0.12});tone(N(84),0.6,{type:'triangle',vol:0.18,at:0.26});},
  lose:()=>arp([67,63,60,55],0.22,{type:'triangle',vol:0.2,dur:0.3}),
  win:()=>{arp([72,76,79,84,79,84],0.11,{type:'square',vol:0.13,dur:0.14});[72,76,79,84].forEach(n=>tone(N(n),1.2,{type:'triangle',vol:0.15,at:0.7}));},
};
const GAP={hit:0.06,kill:0.05,coin:0.15,stun:0.35,select:0.05};
function play(name,arg){
  if(!ac||muted||!SFX[name])return;
  const now=ac.currentTime,g=GAP[name];
  if(g&&last[name]!=null&&now-last[name]<g)return;
  last[name]=now;
  try{SFX[name](arg);}catch(e){}
}

// 배경음악: 일반 = 느긋한 사무실 로파이, 보스 = 빠르고 긴장감 있는 단조
const SONG={
  normal:{bpm:100,ch:[[48,64,67,71],[45,60,64,67],[41,57,60,64],[43,59,62,65]],mel:[76,74,72,74,79,76,74,72]},
  boss:{bpm:142,ch:[[45,60,64,69],[41,57,60,65],[43,59,62,67],[40,56,59,64]],mel:[69,72,76,72,71,68,64,68]},
};
function sched(){
  if(!ac)return;
  const P=SONG[mode],sp=60/P.bpm/4;
  if(nextT<ac.currentTime-0.5)nextT=ac.currentTime+0.05;
  while(nextT<ac.currentTime+0.25){stepAt(step,nextT,P,sp);nextT+=sp;step=(step+1)%64;}
}
function stepAt(s,t,P,sp){
  if(muted)return;
  const bar=(s>>4)&3,b=s&15,ch=P.ch[bar],boss=mode==='boss';
  if(b===0||b===8||(boss&&(b===4||b===12)))tone(N(ch[0]),sp*3.2,{type:'triangle',vol:0.5,when:t,dest:mus});
  if(b===10||b===14)tone(N(ch[0]+7),sp*1.6,{type:'triangle',vol:0.35,when:t,dest:mus});
  if(b===4||b===12)ch.slice(1).forEach(n=>tone(N(n),sp*2.4,{type:'sine',vol:0.12,when:t,dest:mus,attack:0.01}));
  if(boss&&b%2===1)tone(N(ch[1]+12),sp*0.8,{type:'square',vol:0.03,when:t,dest:mus});
  if((s&31)>=16&&b%4===2){const m=P.mel[((s>>2)+bar)%P.mel.length];tone(N(m),sp*1.8,{type:'triangle',vol:0.08,when:t,dest:mus});}
  if(b%2===0)noise(0.025,{vol:b%4===0?0.05:0.025,hp:7000,when:t,dest:mus});
  if(b===4||b===12)noise(0.08,{vol:0.05,hp:1800,when:t,dest:mus});
}
function setMode(m){if(SONG[m])mode=m;}
function toggleMute(){
  muted=!muted;try{localStorage.setItem('kt_mute',muted?'1':'0');}catch(e){}
  if(master)master.gain.setTargetAtTime(muted?0:0.9,ac.currentTime,0.02);
  return muted;
}
window.KTSound={init,play,setMode,toggleMute,isMuted:()=>muted};
// 화면이 가려지면 소리를 멈추고(배경 탭에서 음악이 끊겨 재생되는 문제), 다시 보이면 이어서 재생
document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden){ac.suspend().catch(()=>{});}else{ac.resume().then(()=>{nextT=Math.max(nextT,ac.currentTime+0.05);}).catch(()=>{});}});
document.addEventListener('pointerdown',()=>{if(ac&&ac.state!=='running')init();},{capture:true});
})();
