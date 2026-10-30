/* ===== Um único laço de animação: só desenha o que está na tela ===== */
'use strict';
let last=0;
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.1,(now-last)/1000||0);last=now;const t=now/1000;
  if(vis.hero)film.frame(dt,t);
  if(vis.gal){gal.tick(dt);const c=gal.active().querySelector('canvas[data-eng]');if(c){const e=engines.get(c);e.step(dt);e.draw()}}
  if(vis.xp)xp.frame(t);
  if(vis.games){const c=gSel==='bigodes'?$('#cBig'):$('#cFic'),e=engines.get(c);e.step(dt);e.draw()}
}
addEventListener('resize',()=>{film.resize();xp.resize();sizeEngines();gInfo()});
