/* ===== PAINEL DO DONO ===== */
'use strict';
const STS={novo:['Novo','st-novo'],conversa:['Em conversa','st-conversa'],fechado:['Fechado','st-fechado']};
let pf='all',pq='',psel=null;
function openOv(el){el.hidden=false;document.body.style.overflow='hidden';requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')))}
function closeOv(el){el.classList.remove('show');setTimeout(()=>{el.hidden=true;if($('#login').hidden&&$('#panel').hidden)document.body.style.overflow=''},500)}
function openLogin(){openOv($('#login'));setTimeout(()=>$('#lGo').focus(),300)}
$('#openLogin').onclick=openLogin;$('#lBack').onclick=()=>closeOv($('#login'));
const arrow='<svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 7h10M8 3l4 4-4 4"/></svg>';
$('#lForm').onsubmit=e=>{e.preventDefault();const g=$('#lGo');g.innerHTML='<span class="spin" style="border-color:rgba(244,241,234,.3);border-top-color:#F4F1EA"></span>';
  setTimeout(()=>{g.innerHTML=arrow;$('#login').hidden=true;$('#login').classList.remove('show');openOv($('#panel'));renderPanel();const f=contacts.find(c=>unseen.has(c.id));if(f)setTimeout(()=>toast('Nova mensagem de '+f.name),600)},800)};
$('#pExit').onclick=()=>{closeDr();closeOv($('#panel'))};
function relT(ts){const m=(Date.now()-ts)/6e4;if(m<1)return'agora';if(m<60)return`há ${Math.floor(m)} min`;const h=m/60;if(h<24)return`há ${Math.floor(h)} h`;const d=Math.floor(h/24);return d===1?'ontem':`há ${d} dias`}
function renderPanel(){
  const tot=contacts.length,wk=contacts.filter(c=>Date.now()-c.at<7*864e5).length,cnt=k=>contacts.filter(c=>c.topic===k).length;
  const cols={games:'#292A29',tecnologia:'#66705F',investimento:'#C8BDA8',outro:'#A7A9AC'};
  $('#kpis').innerHTML=`<div class="kpi"><small>Contatos</small><b>${tot}</b><em>${contacts.filter(c=>!c.ex).length} enviados por você</em></div>
    <div class="kpi"><small>Últimos 7 dias</small><b>${wk}</b><em>${contacts.filter(c=>c.status==='novo').length} aguardando resposta</em></div>
    <div class="kpi"><small>Tecnologia</small><b>${cnt('tecnologia')}</b><em>${Math.round(cnt('tecnologia')/(tot||1)*100)}% do total</em></div>
    <div class="kpi"><small>Games</small><b>${cnt('games')}</b><div class="segbar">${Object.keys(cols).map(k=>`<i style="width:${cnt(k)/(tot||1)*100}%;background:${cols[k]}" title="${TOPICS[k]}: ${cnt(k)}"></i>`).join('')}</div></div>`;
  const rows=contacts.filter(c=>(pf==='all'||c.topic===pf)&&(!pq||(c.name+' '+c.company+' '+c.email).toLowerCase().includes(pq.toLowerCase())));
  $('#pSub').textContent=`${rows.length} de ${tot} contatos${pf!=='all'?' em '+TOPICS[pf]:''}.`;
  $('#pList').innerHTML=rows.length?rows.map(c=>`<button class="li ${unseen.has(c.id)?'fresh':''} ${psel===c.id?'sel':''}" data-id="${c.id}"><div><b>${esc(c.name)}${unseen.has(c.id)?'<span class="new">nova</span>':''}</b><small>${esc(c.company||c.email)}</small></div><span class="ttag">${TOPICS[c.topic]}</span><span class="msg">${esc(c.msg)}</span><span class="pill ${STS[c.status][1]}">${STS[c.status][0]}</span><span class="when">${relT(c.at)}</span></button>`).join(''):`<div class="empty">Nenhum contato com esse filtro. Escolha “Todos” ou limpe a busca.</div>`;
  $$('#pList .li').forEach(b=>b.onclick=()=>openDr(b.dataset.id));
}
$$('#pFilter button').forEach(b=>b.onclick=()=>{pf=b.dataset.f;$$('#pFilter button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderPanel()});
$('#pq').oninput=e=>{pq=e.target.value.trim();renderPanel()};
const dr=$('#drawer');
function openDr(id){const c=contacts.find(x=>x.id===id);if(!c)return;psel=id;if(unseen.has(id)){unseen.delete(id);saveP()}
  $('#drBody').innerHTML=`<h3>${esc(c.name)}</h3><p class="meta">${esc(c.email)}${c.ex?' / dado de exemplo':''}</p>
   <div class="quote">${esc(c.msg)}</div>
   <div class="dr-grid"><div><small>Segmento</small><b>${TOPICS[c.topic]}</b></div><div><small>Empresa</small><b>${esc(c.company||'Não informada')}</b></div><div><small>Recebido</small><b>${new Date(c.at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</b></div><div><small>Status</small><b>${STS[c.status][0]}</b></div></div>
   <div class="dr-sec"><h5>Mudar status</h5><div class="segc" id="drSt">${Object.entries(STS).map(([k,v])=>`<button data-s="${k}" aria-pressed="${c.status===k}">${v[0]}</button>`).join('')}</div></div>
   <div class="dr-act"><button class="btn btn-dark btn-sm" id="drCopy">Copiar e-mail</button><button class="btn btn-line btn-sm" id="drDel">Remover</button></div><div id="drConf"></div>`;
  $$('#drSt button').forEach(b=>b.onclick=()=>{c.status=b.dataset.s;saveP();toast('Status: '+STS[c.status][0]);openDr(id)});
  $('#drCopy').onclick=()=>{try{navigator.clipboard.writeText(c.email).then(()=>toast('E-mail copiado'),()=>toast(c.email))}catch(e){toast(c.email)}};
  $('#drDel').onclick=()=>{$('#drConf').innerHTML=`<div class="confirm">Remover a mensagem de ${esc(c.name)}? Isso não pode ser desfeito.<div class="r"><button class="btn btn-warn btn-sm" id="dY">Remover</button><button class="btn btn-line btn-sm" id="dN">Manter</button></div></div>`;$('#dN').onclick=()=>{$('#drConf').innerHTML=''};$('#dY').onclick=()=>{contacts=contacts.filter(x=>x.id!==id);saveP();closeDr();renderPanel();toast('Contato removido')}};
  dr.classList.add('open');dr.setAttribute('aria-hidden','false');renderPanel()}
function closeDr(){psel=null;dr.classList.remove('open');dr.setAttribute('aria-hidden','true');$$('#pList .li.sel').forEach(x=>x.classList.remove('sel'))}
$('#drClose').onclick=closeDr;
addEventListener('keydown',e=>{if(e.key==='Escape'){if(dr.classList.contains('open'))closeDr();else if(!$('#login').hidden)closeOv($('#login'))}});
