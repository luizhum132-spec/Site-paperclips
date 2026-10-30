/* ===== PRINCÍPIOS: explore os detalhes ===== */
'use strict';
const PR=[
 ['Essencial','Fazer apenas o que realmente importa.'],
 ['Insubstituível','Criar algo cujo valor não se encontra facilmente em outro lugar.'],
 ['Atemporal','Permanecer relevante apesar das mudanças.'],
 ['Intencional','Fazer cada escolha por uma razão.'],
 ['Excepcional','Superar o padrão comum de qualidade.'],
 ['Refinado','Aperfeiçoar os detalhes.'],
 ['Funcional','Fazer com que tudo tenha uma razão de existir.']
];
const xp=(()=>{
  const S=Streaks($('#pcanvas'));S.set(SCFG.overview);
  $('#xpList').innerHTML=PR.map((p,k)=>`<button class="xp" aria-expanded="false" data-k="${k}"><span class="hd"><span class="ic"></span>${p[0]}</span><span class="bd"><p>${p[1]}</p></span></button>`).join('');
  const items=$$('.xp');let open=-1;
  function toggle(k){
    open=open===k?-1:k;
    items.forEach((b,j)=>{b.classList.toggle('open',j===open);b.setAttribute('aria-expanded',j===open)});
    $('#xpClose').hidden=open<0;S.set(SCFG[open<0?'overview':PR[open][0]]);
    const w=$('#xpWord');w.classList.remove('show');setTimeout(()=>{w.textContent=open<0?'':PR[open][0];if(open>=0)w.classList.add('show')},open<0?0:180);
  }
  items.forEach((b,k)=>b.onclick=()=>toggle(k));
  $('#xpClose').onclick=()=>{if(open>=0)toggle(open)};
  return{resize:S.resize,frame:S.frame};
})();
