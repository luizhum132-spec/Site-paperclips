/* ===== Motores dos jogos (usados no cartão e no celular) ===== */
'use strict';
function Bigodes(canvas,label){
  const g=canvas.getContext('2d');let W=1,H=1,dpr=1,s=1,B;
  function reset(){B={rats:[],shots:[],fx:[],t:0,acc:0,cd:0,kills:0,cat:{x:W/2,y:H*.58,tx:W/2,ty:H*.58}}}
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width)return;W=r.width;H=r.height;dpr=Math.min(2,devicePixelRatio||1);canvas.width=W*dpr;canvas.height=H*dpr;s=clamp(Math.min(W,H)/360,1,2.2);reset()}
  function step(dt){
    if(!B)return;const R=Math.max(W,H)*.75;B.t+=dt;B.acc+=dt*(2.2+Math.min(3,B.t*.05))*(W*H/(300*634))**.5;
    while(B.acc>1){B.acc--;const a=Math.random()*Math.PI*2;B.rats.push({x:W/2+Math.cos(a)*R,y:H/2+Math.sin(a)*R,sp:(40+Math.random()*30)*s,ph:Math.random()*6})}
    const c=B.cat;if(Math.random()<.01||Math.hypot(c.tx-c.x,c.ty-c.y)<4){c.tx=W*.2+Math.random()*W*.6;c.ty=H*.35+Math.random()*H*.45}
    const d=Math.hypot(c.tx-c.x,c.ty-c.y)||1;c.x+=(c.tx-c.x)/d*Math.min(d,70*s*dt);c.y+=(c.ty-c.y)/d*Math.min(d,70*s*dt);
    B.cd-=dt;if(B.cd<=0&&B.rats.length){let t=null,bd=1e9;B.rats.forEach(r=>{const dd=Math.hypot(r.x-c.x,r.y-c.y);if(dd<bd){bd=dd;t=r}});if(bd<170*s){B.cd=.3;const a=Math.atan2(t.y-c.y,t.x-c.x);B.shots.push({x:c.x,y:c.y,vx:Math.cos(a)*400*s,vy:Math.sin(a)*400*s,l:.6})}}
    B.shots.forEach(sh=>{sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;sh.l-=dt;for(const r of B.rats){if(!r.dead&&Math.hypot(r.x-sh.x,r.y-sh.y)<12*s){r.dead=true;sh.l=0;B.kills++;for(let i=0;i<6;i++)B.fx.push({x:r.x,y:r.y,vx:(Math.random()-.5)*160*s,vy:(Math.random()-.5)*160*s,t:.4});break}}});
    B.shots=B.shots.filter(x=>x.l>0);
    B.rats.forEach(r=>{const dx=c.x-r.x,dy=c.y-r.y,dd=Math.hypot(dx,dy)||1;r.x+=dx/dd*r.sp*dt;r.y+=dy/dd*r.sp*dt;r.a=Math.atan2(dy,dx);r.ph+=dt*12;if(dd<14*s)r.dead=true});
    B.rats=B.rats.filter(r=>!r.dead);B.fx.forEach(f=>{f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt});B.fx=B.fx.filter(f=>f.t>0);
  }
  function draw(){
    if(!B)return;g.setTransform(dpr,0,0,dpr,0,0);
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1d1940');gr.addColorStop(1,'#0d0c1c');g.fillStyle=gr;g.fillRect(0,0,W,H);
    const ty=34*s;g.strokeStyle='rgba(244,238,226,.05)';g.lineWidth=2;for(let y=0;y<H;y+=ty){g.beginPath();for(let x=(Math.round(y/ty)%2)*ty*.75;x<W+ty*1.5;x+=ty*1.5){g.moveTo(x,y+ty);g.quadraticCurveTo(x+ty*.75,y+ty*.47,x+ty*1.5,y+ty)}g.stroke()}
    B.rats.forEach(r=>{g.save();g.translate(r.x,r.y);g.rotate(r.a||0);g.scale(s,s);g.strokeStyle='#4A3F55';g.lineWidth=2;g.beginPath();g.moveTo(-10,0);g.quadraticCurveTo(-18,Math.sin(r.ph)*6,-24,0);g.stroke();g.fillStyle='#5B4E62';g.beginPath();g.ellipse(0,0,11,7,0,0,7);g.fill();g.beginPath();g.ellipse(9,0,6,4.5,0,0,7);g.fill();g.fillStyle='#FF4A3A';g.beginPath();g.arc(11,-2,1.4,0,7);g.arc(11,2,1.4,0,7);g.fill();g.restore()});
    B.shots.forEach(sh=>{g.fillStyle='#F07FA0';g.beginPath();g.arc(sh.x,sh.y,4*s,0,7);g.fill()});
    B.fx.forEach(f=>{g.globalAlpha=clamp(f.t/.4,0,1);g.fillStyle='#FFB43A';g.beginPath();g.arc(f.x,f.y,2.5*s,0,7);g.fill();g.globalAlpha=1});
    const c=B.cat;g.save();g.translate(c.x,c.y);g.scale(1.3*s,1.3*s);g.fillStyle='#C4466F';g.beginPath();g.ellipse(0,6,14,9,0,0,7);g.fill();g.fillStyle='#F2A95B';g.beginPath();g.moveTo(-12,-4);g.lineTo(-14,-19);g.lineTo(-4,-11);g.moveTo(12,-4);g.lineTo(14,-19);g.lineTo(4,-11);g.fill();g.beginPath();g.arc(0,0,13,0,7);g.fill();g.fillStyle='#15122B';g.beginPath();g.moveTo(-14,-8);g.quadraticCurveTo(0,-28,14,-8);g.quadraticCurveTo(0,-13,-14,-8);g.fill();g.beginPath();g.ellipse(-5,-1,2,3,0,0,7);g.ellipse(5,-1,2,3,0,0,7);g.fill();g.strokeStyle='#F4EEE2';g.lineWidth=1.6;g.beginPath();g.moveTo(0,5);g.quadraticCurveTo(-7,9,-11,4);g.moveTo(0,5);g.quadraticCurveTo(7,9,11,4);g.stroke();g.restore();
    if(label){g.fillStyle='rgba(12,10,28,.6)';g.beginPath();if(g.roundRect)g.roundRect(18,58,120,30,15);else g.rect(18,58,120,30);g.fill();g.fillStyle='#F4EEE2';g.font='600 13px Geist, -apple-system, sans-serif';g.textAlign='left';g.fillText('Ratos  '+B.kills,32,78);
      g.fillStyle='rgba(244,238,226,.92)';g.font='700 26px Geist, -apple-system, sans-serif';g.textAlign='center';g.fillText('Bigodes',W/2,H-70);g.font='400 12px Geist, -apple-system, sans-serif';g.fillStyle='rgba(244,238,226,.6)';g.fillText('Toque para mover a Capitã',W/2,H-48);g.textAlign='left'}
  }
  return{resize,step,draw,reset};
}
function FicCity(canvas,label){
  const g=canvas.getContext('2d');let W=1,H=1,dpr=1,F=null;
  function reset(){const cells=[];for(let i=0;i<5;i++)for(let j=0;j<5;j++)cells.push({i,j,h:.2+Math.random()*.9,t:-(i+j)*.25-Math.random()*.4,c:['#C8BDA8','#A7A9AC','#77736D','#66705F','#F4F1EA'][Math.floor(Math.random()*5)]});F={cells,t:0}}
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width)return;W=r.width;H=r.height;dpr=Math.min(2,devicePixelRatio||1);canvas.width=W*dpr;canvas.height=H*dpr;reset()}
  function step(dt){if(!F)return;F.t+=dt;if(F.t>9)reset()}
  function draw(){
    if(!F)return;g.setTransform(dpr,0,0,dpr,0,0);
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#EEE9DE');gr.addColorStop(1,'#CFC6B4');g.fillStyle=gr;g.fillRect(0,0,W,H);
    const tw=Math.min(W,H*.9)/11,th=tw*.58,ox=W/2,oy=label?H*.42:H*.4,hs=tw*3.6;
    [...F.cells].sort((a,b)=>(a.i+a.j)-(b.i+b.j)).forEach(c=>{
      const x=ox+(c.i-c.j)*tw,y=oy+(c.i+c.j)*th;
      g.fillStyle='rgba(41,42,41,.08)';g.beginPath();g.moveTo(x,y);g.lineTo(x+tw,y+th);g.lineTo(x,y+2*th);g.lineTo(x-tw,y+th);g.closePath();g.fill();
      const k=cl((F.t+c.t)/1.1),h=c.h*hs*(1-Math.pow(1-k,3));if(h<1)return;
      const w=tw*.82,hh=th*.82,cx=x,cy=y+th;
      g.fillStyle=c.c;g.beginPath();g.moveTo(cx-w,cy);g.lineTo(cx,cy+hh);g.lineTo(cx,cy+hh-h);g.lineTo(cx-w,cy-h);g.closePath();g.fill();
      g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(cx,cy+hh);g.lineTo(cx+w,cy);g.lineTo(cx+w,cy-h);g.lineTo(cx,cy+hh-h);g.closePath();g.fill();
      g.fillStyle=c.c;g.beginPath();g.moveTo(cx-w,cy-h);g.lineTo(cx,cy-hh-h);g.lineTo(cx+w,cy-h);g.lineTo(cx,cy+hh-h);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.35)';g.fill();
      g.fillStyle='rgba(41,42,41,.25)';const ws=tw*.42;for(let wy=cy-h+ws;wy<cy-4;wy+=ws){g.fillRect(cx-w*.7,wy+3,tw*.11,tw*.19);g.fillRect(cx-w*.35,wy+5,tw*.11,tw*.19)}
    });
    if(label){g.fillStyle='#292A29';g.font='700 26px Geist, -apple-system, sans-serif';g.textAlign='center';g.fillText('FicCity',W/2,H-70);g.font='400 12px Geist, -apple-system, sans-serif';g.fillStyle='#77736D';g.fillText('Em produção',W/2,H-48);g.textAlign='left'}
  }
  return{resize,step,draw,reset};
}
const engines=new Map();
$$('canvas[data-eng]').forEach(c=>engines.set(c,(c.dataset.eng==='bigodes'?Bigodes:FicCity)(c,!!c.dataset.label)));
function sizeEngines(){engines.forEach(e=>e.resize())}
