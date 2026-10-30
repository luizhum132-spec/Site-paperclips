/* ===== CONTATO ===== */
'use strict';
const TOPICS={games:'Games',tecnologia:'Tecnologia',investimento:'Investimento',outro:'Outro'};
let cf_={topic:'tecnologia',name:'',email:'',company:'',msg:''};
function seed(){
  const now=Date.now(),h=36e5;
  const L=[['Renata Okada','Okada Arquitetura','tecnologia','Queremos um site novo com agendamento de visitas ao escritório.','conversa',3],
  ['Marcos Vieira','Vieira Odontologia','tecnologia','Precisamos de um assistente que responda pacientes fora do horário.','novo',9],
  ['Paula Andrade','','games','Sou criadora de conteúdo e gostaria de testar Bigodes antes do lançamento.','novo',20],
  ['Henrique Sales','Sales Capital','investimento','Gostaríamos de entender a estrutura da holding e os próximos segmentos.','conversa',30],
  ['Clara Bastos','Bastos Imóveis','tecnologia','Site premium para lançamentos de imóveis, com painel de leads.','fechado',52],
  ['Diego Moreira','Estúdio Pixel Sul','games','Proposta de parceria para arte de personagens.','novo',70],
  ['Fernanda Lopes','Lopes Advocacia','tecnologia','Quero um site sóbrio, rápido e que transmita confiança.','conversa',96],
  ['Igor Tavares','','outro','Vocês têm vagas para estágio em desenvolvimento?','novo',130],
  ['Beatriz Ramos','Ramos Café','tecnologia','Cardápio online e reservas para o café.','fechado',170],
  ['Tiago Nunes','Nunes Ventures','investimento','Interesse em conversar sobre o segmento de jogos.','novo',220],
  ['Larissa Prado','Prado Fitness','tecnologia','Agendamento de aulas experimentais pelo site.','conversa',260],
  ['Otávio Reis','','games','Encontrei um bug na demo, posso mandar o vídeo?','fechado',300]];
  return L.map((l,i)=>({id:'ex'+i,name:l[0],company:l[1],topic:l[2],msg:l[3],status:l[4],at:now-l[5]*h,email:l[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(' ','.')+'@exemplo.com',ex:true}));
}
let contacts=store.get('pch_contacts')||seed();let unseen=new Set(store.get('pch_unseen')||[]);
function saveP(){store.set('pch_contacts',contacts);store.set('pch_unseen',[...unseen])}
function renderForm(){
  $('#formBox').innerHTML=`<form id="cForm" novalidate>
    <p style="font-size:.9rem;opacity:.85;margin-bottom:10px">Sobre o que você quer falar?</p>
    <div class="chips">${Object.entries(TOPICS).map(([k,v])=>`<button type="button" class="chip" data-t="${k}" aria-pressed="${cf_.topic===k}">${v}</button>`).join('')}</div>
    <div class="two"><div class="field" id="fN"><label for="cName">Nome</label><input id="cName" autocomplete="name" value="${esc(cf_.name)}" placeholder="Seu nome"><span class="err"></span></div>
    <div class="field"><label for="cCo">Empresa (opcional)</label><input id="cCo" autocomplete="organization" value="${esc(cf_.company)}" placeholder="Onde você trabalha"><span class="err"></span></div></div>
    <div class="field" id="fE"><label for="cEmail">E-mail</label><input id="cEmail" type="email" autocomplete="email" value="${esc(cf_.email)}" placeholder="voce@empresa.com"><span class="err"></span></div>
    <div class="field" id="fM"><label for="cMsg">Mensagem</label><textarea id="cMsg" placeholder="Em poucas linhas, o que você precisa">${esc(cf_.msg)}</textarea><span class="err"></span></div>
    <button class="btn btn-light" type="submit" id="cSend" style="width:100%">Enviar mensagem</button></form>`;
  $$('#formBox .chip').forEach(b=>b.onclick=()=>{cf_.topic=b.dataset.t;$$('#formBox .chip').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  [['cName','name','fN'],['cCo','company'],['cEmail','email','fE'],['cMsg','msg','fM']].forEach(([id,k,f])=>{$('#'+id).oninput=e=>{cf_[k]=e.target.value;if(f){$('#'+f+' .err').textContent=''}}});
  $('#cForm').onsubmit=e=>{e.preventDefault();let ok=true;
    if(cf_.name.trim().length<2){ok=false;$('#fN .err').textContent='Escreva seu nome.'}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cf_.email.trim())){ok=false;$('#fE .err').textContent='Confira o e-mail. Ex.: voce@empresa.com'}
    if(cf_.msg.trim().length<5){ok=false;$('#fM .err').textContent='Conte em poucas palavras o que você precisa.'}
    if(!ok)return;const b=$('#cSend');b.disabled=true;b.innerHTML='<span class="spin"></span> Enviando';
    setTimeout(()=>{const c={id:'u'+Date.now(),name:cf_.name.trim(),email:cf_.email.trim(),company:cf_.company.trim(),topic:cf_.topic,msg:cf_.msg.trim(),status:'novo',at:Date.now(),ex:false};contacts.unshift(c);unseen.add(c.id);saveP();
      $('#formBox').innerHTML=`<div class="ok-view"><svg viewBox="0 0 86 34"><path class="draw" d="M58 3H17a14 14 0 0 0 0 28h52a12 12 0 0 0 0-24H25a7 7 0 0 0 0 14h36" fill="none" stroke="#F4F1EA" stroke-width="2.6" stroke-linecap="round"/></svg><h3>Mensagem recebida.</h3><p>Obrigado, ${esc(c.name.split(' ')[0])}. Respondemos em ${esc(c.email)}.</p><div style="display:grid;gap:10px;margin-top:24px"><button class="btn btn-light" id="seeIt">Ver no painel do dono</button><button class="btn btn-line" id="again">Enviar outra mensagem</button></div></div>`;
      $('#seeIt').onclick=openLogin;$('#again').onclick=()=>{cf_={topic:'tecnologia',name:'',email:'',company:'',msg:''};renderForm()}},800)};
}
renderForm();
