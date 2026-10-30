/* ===== HOLDING: título que acende e números que contam ===== */
'use strict';
function countUp(el){const to=+el.dataset.count,t0=performance.now(),d=reduce?1:1200;(function f(now){const k=cl((now-t0)/d);el.textContent=Math.round(to*eo(k));if(k<1)requestAnimationFrame(f)})(t0)}
$$('.stat').forEach((s,k)=>{s.id='stat'+k;onReach[s.id]=()=>setTimeout(()=>countUp(s.querySelector('b')),reduce?0:900+k*700)});
