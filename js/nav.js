/* ===== Nav: seção ativa e tema claro/escuro conforme o fundo ===== */
'use strict';
const lnav=$('#lnav'),navLinks=$$('#nlinks a');
const darkSecs=$$('.dark,.sage');
function navTheme(){const y=52+2;let dark=false;darkSecs.forEach(s=>{const r=s.getBoundingClientRect();if(r.top<=y&&r.bottom>y)dark=true});lnav.classList.toggle('on-dark',dark);
  let act=null;navLinks.forEach(a=>{const s=$(a.getAttribute('href'));const r=s.getBoundingClientRect();if(r.top<innerHeight*.45&&r.bottom>innerHeight*.45)act=a});navLinks.forEach(a=>a.classList.toggle('on',a===act))}
addEventListener('scroll',()=>requestAnimationFrame(navTheme),{passive:true});
