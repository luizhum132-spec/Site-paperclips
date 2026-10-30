/* ===== Visibilidade e "tocar ao chegar" (como data-inline-media-play-keyframe da Apple) ===== */
'use strict';
const vis={hero:true,gal:false,xp:false,games:false};
const onReach={};
const reachIO=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;el.classList.add('in');const f=onReach[el.id];if(f)f(el);reachIO.unobserve(el)}),{rootMargin:'0px 0px -30% 0px'});
function watchReach(){$$('.rv,.tr,.glow-word,.phone-in,.zoom').forEach(el=>reachIO.observe(el))}
const visIO=new IntersectionObserver(es=>es.forEach(e=>{vis[e.target.dataset.v]=e.isIntersecting;if(e.target.dataset.v==='hero'&&!e.isIntersecting)film.leave()}),{threshold:.08});
[['#inicio','hero'],['#destaques','gal'],['#principios','xp'],['#games','games']].forEach(([s,k])=>{const el=$(s);el.dataset.v=k;visIO.observe(el)});
