/* ===== TECNOLOGIA: o site se aproxima e se monta sozinho ===== */
'use strict';
const MODS=[['agenda','Agendamento online'],['painel','Painel do dono'],['ia','Assistente com IA']];
let modOn={agenda:false,painel:false,ia:false},buildT=[];
$('#mods').innerHTML=MODS.map(m=>`<button class="mod" role="switch" data-mod="${m[0]}" aria-checked="false"><span class="tk"><svg><use href="#chk"/></svg></span>${m[1]}</button>`).join('');
function renderMods(){
  $$('.mod').forEach(b=>b.setAttribute('aria-checked',!!modOn[b.dataset.mod]));
  $$('.blk[data-m]').forEach(b=>b.classList.toggle('gone',!modOn[b.dataset.m]));
  $$('.tbars i').forEach((i,k)=>{i.style.transitionDelay=(k*70)+'ms';i.style.height=modOn.painel?i.dataset.h+'%':'0'});
  const n=Object.values(modOn).filter(Boolean).length;$('#modNote').textContent=n?`Este site tem ${n} ${n===1?'módulo':'módulos'} além da página principal. Toque para ligar ou desligar.`:'Toque nos módulos para montar o site.';
}
$$('.mod').forEach(b=>b.onclick=()=>{buildT.forEach(clearTimeout);const k=b.dataset.mod;modOn[k]=!modOn[k];renderMods();if(k==='ia'&&modOn.ia)typeInto($('#aiBub'),'Atendemos sim, das 9h às 13h. Quer que eu reserve um horário?',300)});
function build(){
  buildT.forEach(clearTimeout);modOn={agenda:false,painel:false,ia:false};renderMods();
  const z=$('#zoom');z.classList.remove('in');void z.offsetWidth;z.classList.add('in');
  const seq=[['agenda',1900],['painel',2700],['ia',3500]];
  buildT=seq.map(([k,t])=>setTimeout(()=>{modOn[k]=true;renderMods();if(k==='ia')typeInto($('#aiBub'),'Atendemos sim, das 9h às 13h. Quer que eu reserve um horário?',400)},reduce?0:t));
  buildT.push(setTimeout(()=>{$('#zReplay').hidden=false},reduce?0:4600));
}
onReach.zoom=build;$('#zReplay').onclick=()=>{$('#zReplay').hidden=true;build()};
renderMods();
