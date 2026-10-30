/* ===== DESTAQUES: galeria com progresso e pausa ===== */
'use strict';
const gal=(()=>{
  const track=$('#track'),cards=$$('#track .card'),pp=$('#galPP'),DUR=[7,7,7,6,8];
  const icPause='<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="3.5" height="12" rx="1"/><rect x="9.5" y="2" width="3.5" height="12" rx="1"/></svg>';
  const icPlay='<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11a.8.8 0 0 0 1.2.7l9-5.5a.8.8 0 0 0 0-1.4l-9-5.5A.8.8 0 0 0 4 2.5z"/></svg>';
  $('#dots').innerHTML=cards.map((c,k)=>`<button class="dot" aria-label="Destaque ${k+1}: ${c.getAttribute('aria-label')}"><i></i></button>`).join('');
  const dots=$$('#dots .dot');let i=0,playing=!reduce,prog=0,auto=0;
  function setPP(){pp.innerHTML=playing?icPause:icPlay;pp.setAttribute('aria-label',playing?'Pausar destaques':'Reproduzir destaques')}
  function padL(){return parseFloat(getComputedStyle(track).paddingLeft)||0}
  function activate(k,scroll){
    i=k;prog=0;cards.forEach((c,j)=>c.classList.toggle('act',j===k));
    dots.forEach((d,j)=>{d.classList.toggle('on',j===k);d.querySelector('i').style.width='0'});
    if(scroll){auto=performance.now();track.scrollTo({left:cards[k].offsetLeft-padL(),behavior:reduce?'auto':'smooth'})}
    const eng=cards[k].querySelector('canvas[data-eng]');if(eng)engines.get(eng).reset();
    if(k===4)typeInto($('#galAI'),'Atendemos sim, das 9h às 13h. Quer que eu reserve um horário?',1100);
  }
  dots.forEach((d,k)=>d.onclick=()=>activate(k,true));
  pp.onclick=()=>{playing=!playing;setPP()};
  let st=null;track.addEventListener('scroll',()=>{clearTimeout(st);st=setTimeout(()=>{if(performance.now()-auto<900)return;const x=track.scrollLeft;let b=0,bd=1e9;cards.forEach((c,k)=>{const d=Math.abs(c.offsetLeft-padL()-x);if(d<bd){bd=d;b=k}});if(b!==i)activate(b,false)},120)},{passive:true});
  function tick(dt){if(!vis.gal||!playing)return;prog+=dt/DUR[i];dots[i].querySelector('i').style.width=Math.min(100,prog*100)+'%';if(prog>=1)activate((i+1)%cards.length,true)}
  function active(){return cards[i]}
  setPP();activate(0,false);
  return{tick,active};
})();
let typeTimers=new Map();
function typeInto(el,txt,delay){clearTimeout(typeTimers.get(el.id));clearInterval(typeTimers.get(el.id+'i'));el.textContent='';if(reduce){el.textContent=txt;return}
  typeTimers.set(el.id,setTimeout(()=>{let n=0;const iv=setInterval(()=>{el.textContent=txt.slice(0,++n);if(n>=txt.length)clearInterval(iv)},26);typeTimers.set(el.id+'i',iv)},delay||0))}
