// 칼퇴 디펜스 — 칸 표시 v14
// 네모 상자로 딱딱 나뉜 칸 대신, 직원이 서 있는 자리만 바닥에 은은하게 표시
//   soft(기본) : 빈 칸은 바닥 자리 표시만 연하게, 직원 칸은 발밑 그림자·단계 색 고리
//   none       : 빈 칸은 아무것도 안 그림 (끌어서 옮길 때만 칸 위치가 보임)
//   box        : 예전처럼 네모 상자
// 설정 화면에 "칸 표시" 항목 추가 · 저장 localStorage 'kt_cells'
// 게임 연결: index.html 그리드 그리기에서 KTCells.draw(...) 가 true 를 돌려주면 예전 상자를 그리지 않음
(function(){
'use strict';
const KEY='kt_cells',MODES=['soft','none','box'],LABEL={soft:'연하게',none:'없음',box:'상자'};
let mode='soft';
try{const v=localStorage.getItem(KEY);if(MODES.includes(v))mode=v;}catch(e){}
function setMode(m){if(!MODES.includes(m))return;mode=m;try{localStorage.setItem(KEY,m);}catch(e){}}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function ell(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);}

// r: 칸 사각형 · c: 칸의 직원(없으면 null) · o: {pulse, sel, dragging, MAXG, GRADES}
function draw(ctx,r,c,i,o){
  if(mode==='box')return false;
  const cx=r.x+r.w/2,fy=r.y+r.h*0.66;   // 발밑 높이
  ctx.save();
  // 끌어서 옮기는 중에는 모든 칸 위치를 점선으로 살짝 보여 줌
  if(o.dragging){rr(ctx,r.x+3,r.y+3,r.w-6,r.h-6,12);ctx.strokeStyle='rgba(255,255,255,0.13)';ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.stroke();ctx.setLineDash([]);}
  if(!c){
    if(mode==='soft'){ell(ctx,cx,fy,r.w*0.3,r.h*0.11);ctx.fillStyle='rgba(255,255,255,0.035)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.lineWidth=1;ctx.stroke();}
  }else{
    const gc=o.GRADES[c.grade].color;
    // 발밑 그림자 (단계 색이 은은하게 번짐)
    const g=ctx.createRadialGradient(cx,fy,2,cx,fy,r.w*0.42);g.addColorStop(0,hexA(gc,mode==='soft'?0.2:0.14));g.addColorStop(1,hexA(gc,0));
    ctx.fillStyle=g;ell(ctx,cx,fy,r.w*0.44,r.h*0.24);ctx.fill();
    if(mode==='soft'){ell(ctx,cx,fy,r.w*0.36,r.h*0.13);ctx.strokeStyle=hexA(gc,0.35);ctx.lineWidth=1.2;ctx.stroke();}
    // 합성 가능: 깜빡이는 발밑 고리
    if(c.count===3&&c.grade<o.MAXG){
      const mc=c.grade===o.MAXG-1?'#ff4d8d':'#ffb020';
      ell(ctx,cx,fy,r.w*0.4,r.h*0.16);ctx.strokeStyle=hexA(mc,0.35+0.55*o.pulse);ctx.lineWidth=2.5;ctx.stroke();
      ctx.fillStyle=mc;ctx.font='bold 10px "Jua","Malgun Gothic",sans-serif';ctx.textAlign='right';ctx.textBaseline='top';ctx.fillText(c.grade===o.MAXG-1?'대표 취임 가능!':'합성 가능',r.x+r.w-6,r.y+5);
    }
  }
  // 고른 칸: 둥근 테두리 (조작 대상이라 잘 보이게)
  if(o.sel){rr(ctx,r.x+1,r.y+1,r.w-2,r.h-2,14);ctx.strokeStyle='rgba(255,255,255,0.75)';ctx.lineWidth=1.6;ctx.stroke();
    ell(ctx,cx,fy,r.w*0.38,r.h*0.14);ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.2;ctx.stroke();}
  ctx.restore();
  return true;
}

// 설정 화면에 "칸 표시" 추가
new MutationObserver(()=>{
  const rs=document.getElementById('st-reset');if(!rs||document.getElementById('st-cells'))return;
  const row=document.createElement('div');row.className='kt-toggle';
  row.innerHTML=`<span>칸 표시</span><button class="kt-btn" id="st-cells">${LABEL[mode]}</button>`;
  rs.closest('.kt-toggle').before(row);
  row.querySelector('#st-cells').onclick=e=>{setMode(MODES[(MODES.indexOf(mode)+1)%MODES.length]);e.target.textContent=LABEL[mode];};
}).observe(document.body,{childList:true});

window.KTCells={draw,setMode,mode:()=>mode,MODES};
})();
