/* ===== Cortinas de luz (como a tela do MacBook): milhares de fios verticais ===== */
'use strict';
function Streaks(canvas){
  const ctx=canvas.getContext('2d');let w=1,h=1,dpr=1,lines=[],old=null,mix=1;
  const st={alpha:1,pour:1};
  function gen(c){
    const r=Math.random,out=[];
    for(let i=0;i<c.n;i++){
      let x;
      if(c.panels){const k=Math.floor(r()*c.panels),pw=(1-c.gap*(c.panels-1))/c.panels;x=k*(pw+c.gap)+r()*pw}
      else if(c.grid){x=(i+.5)/c.n}
      else x=.5+(r()-.5)*c.spread;
      const red=r()<c.red,warm=!red&&r()<c.warm;
      out.push({x:clamp(x,0,1),w:c.thin?(.35+r()*.7):(.6+r()*2.4),b:(.25+r()*.75)*c.bright,len:c.len[0]+r()*(c.len[1]-c.len[0]),top:r()*c.top,
        col:red?'255,86,64':warm?'255,186,118':`${(196+r()*44)|0},${(212+r()*34)|0},255`,ph:r()*6.283,sp:(.3+r()*1.2)*c.speed});
    }
    if(c.unique)out.push({x:.63,w:3.4,b:1.5,len:.96,top:0,col:'255,170,90',ph:0,sp:.5});
    return out;
  }
  function set(c){old=lines;lines=gen(c);mix=old.length?0:1}
  function resize(){const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(2,devicePixelRatio||1);canvas.width=w*dpr;canvas.height=h*dpr}
  function draw(ls,a,t){
    for(const l of ls){
      const pf=cl(st.pour*1.5-Math.abs(l.x-.5));const len=l.len*h*pf;if(len<2)continue;
      const sh=.62+.38*Math.sin(t*l.sp+l.ph),al=l.b*sh*a*st.alpha;if(al<.004)continue;
      const top=l.top*h,x=l.x*w,g=ctx.createLinearGradient(0,top,0,top+len);
      g.addColorStop(0,`rgba(${l.col},${al})`);g.addColorStop(.55,`rgba(${l.col},${al*.45})`);g.addColorStop(1,`rgba(${l.col},0)`);
      ctx.fillStyle=g;ctx.globalAlpha=.11;ctx.fillRect(x-l.w*3.5,top,l.w*7,len);ctx.globalAlpha=1;ctx.fillRect(x-l.w/2,top,l.w,len);
    }
  }
  function frame(t){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(st.alpha<.002)return;
    ctx.globalCompositeOperation='lighter';mix=Math.min(1,mix+.025);
    if(old&&mix<1)draw(old,1-mix,t);draw(lines,mix,t);ctx.globalCompositeOperation='source-over';
  }
  return{set,resize,frame,st};
}
const SCFG={
  hero:{n:360,spread:1.15,warm:.05,red:.018,bright:.85,len:[.3,.98],top:.06,speed:1},
  overview:{n:320,panels:3,gap:.03,warm:.04,red:.015,bright:.95,len:[.4,1],top:.04,speed:1},
  Essencial:{n:12,spread:.035,warm:0,red:0,bright:1.1,len:[.55,1],top:.1,speed:.6},
  'Insubstituível':{n:240,spread:1,warm:0,red:0,bright:.5,len:[.3,.9],top:.1,speed:.8,unique:true},
  Atemporal:{n:200,spread:1,warm:.02,red:0,bright:.7,len:[.85,1],top:0,speed:.22},
  Intencional:{n:26,grid:true,warm:0,red:0,bright:.9,len:[.72,.72],top:0,speed:.5},
  Excepcional:{n:560,spread:1,warm:.12,red:.04,bright:1.2,len:[.5,1],top:.08,speed:1.7},
  Refinado:{n:460,spread:.7,thin:true,warm:0,red:0,bright:.42,len:[.4,.95],top:.14,speed:.7},
  Funcional:{n:320,panels:4,gap:.03,warm:.03,red:.01,bright:.9,len:[.5,.9],top:0,speed:.9}
};
