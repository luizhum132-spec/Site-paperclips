/* ===== GAMES ===== */
'use strict';
const GAMES={
  bigodes:{d:'A Capitã Bigode contra hordas de ratos que não param. Você escolhe para onde ela vai, e ela ataca sozinha.',s:[['Android e iOS','plataformas'],['Gratuito','para jogar'],['Ondas sem fim','modo principal']]},
  ficcity:{d:'O principal projeto do estúdio. Uma cidade inteira para construir e cuidar, no seu ritmo.',s:[['Android e iOS','plataformas'],['Em produção','status'],['Cidade aberta','modo principal']]}
};
let gSel='bigodes';
function gInfo(){const g=GAMES[gSel];$('#gInfo').innerHTML=`<div class="gi"><p>${g.d}</p><div class="g-specs">${g.s.map(x=>`<div><b>${x[0]}</b><small>${x[1]}</small></div>`).join('')}</div></div>`;
  $$('#gSwitch button').forEach(b=>b.classList.toggle('on',b.dataset.g===gSel));const on=$(`#gSwitch [data-g="${gSel}"]`),ind=$('#gSwitch .ind');ind.style.left=on.offsetLeft+'px';ind.style.width=on.offsetWidth+'px';
  $('#cBig').classList.toggle('off',gSel!=='bigodes');$('#cFic').classList.toggle('off',gSel!=='ficcity');engines.get(gSel==='bigodes'?$('#cBig'):$('#cFic')).reset()}
$$('#gSwitch button').forEach(b=>b.onclick=()=>{gSel=b.dataset.g;gInfo()});
const phone=$('#phone'),gsec=$('#games');
gsec.addEventListener('pointermove',e=>{if(reduce||!phone.classList.contains('in'))return;const r=phone.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;phone.style.transform=`rotateX(${clamp((e.clientY-cy)/r.height,-1,1)*-9}deg) rotateY(${clamp((e.clientX-cx)/r.width,-1.5,1.5)*11}deg)`});
gsec.addEventListener('pointerleave',()=>{phone.style.transform=''});
