/* ===== Utilitários compartilhados ===== */
'use strict';
document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;$('#toasts').appendChild(t);setTimeout(()=>{t.style.transition='opacity .3s';t.style.opacity=0;setTimeout(()=>t.remove(),320)},2400)}
const io3=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,eo=t=>1-Math.pow(1-t,3),cl=t=>clamp(t,0,1),lerp=(a,b,t)=>a+(b-a)*t;
