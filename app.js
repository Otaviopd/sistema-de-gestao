// ===== Estado e preços =====
let clientes = [];
let pets = [];
let hospedagens = [];
let creches = [];
let nextClienteId = 1, nextPetId = 1, nextHospedagemId = 1, nextCrecheId = 1;

let precos = {
  hospedagem: { pequeno:80, medio:100, grande:120, gigante:150 },
  creche: { meio:50, integral:80 },
  planosCreche: { semanalDias:5, mensalDias:22 },
  extras: { banho:30, consulta:80, transporte:20, adaptacao:15, treinamento:25 }
};

// ===== Persistência local =====
const LS_KEY='clubepet-v2';
function saveState(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify({clientes,pets,hospedagens,creches,precos,nextClienteId,nextPetId,nextHospedagemId,nextCrecheId})); }catch(e){ console.error(e); }
}
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY); if(!raw) return;
    const s = JSON.parse(raw);
    clientes=s.clientes||[]; pets=s.pets||[]; hospedagens=s.hospedagens||[]; creches=s.creches||[];
    precos=s.precos||precos; nextClienteId=s.nextClienteId||1; nextPetId=s.nextPetId||1; nextHospedagemId=s.nextHospedagemId||1; nextCrecheId=s.nextCrecheId||1;
  }catch(e){ console.error(e); }
}

// ===== Abas =====
function showTab(btn){
  const tabName = btn.dataset.tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b===btn));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id===tabName));
  if(tabName==='pets'){ atualizarSelectClientes(); }
  else if(tabName==='hospedagem'){ atualizarSelectPets('hospedagemPet'); calcularPrecoHospedagem(); }
  else if(tabName==='creche'){ atualizarSelectPets('crechePet'); calcularPrecoCreche(); }
  else if(tabName==='relatorios'){ atualizarResumo(); }
}

// ===== Clientes =====
function adicionarCliente(){
  const nome = document.getElementById('clienteNome').value.trim();
  const email = document.getElementById('clienteEmail').value.trim();
  const telefone = document.getElementById('clienteTelefone').value.trim();
  const cpf = document.getElementById('clienteCpf').value.trim();
  const endereco = document.getElementById('clienteEndereco').value.trim();
  const emergencia = document.getElementById('clienteEmergencia').value.trim();
  if(!nome || !telefone){ alert('Nome e telefone são obrigatórios!'); return; }
  const cliente = { id:nextClienteId++, nome, email, telefone, cpf, endereco, emergencia, dataCadastro:new Date().toLocaleDateString('pt-BR') };
  clientes.push(cliente);
  atualizarTabelaClientes(); limparFormularioCliente(); alert('Cliente cadastrado com sucesso!'); saveState();
}
function limparFormularioCliente(){ ['clienteNome','clienteEmail','clienteTelefone','clienteCpf','clienteEndereco','clienteEmergencia'].forEach(id=>document.getElementById(id).value=''); }
function atualizarTabelaClientes(){
  const tbody = document.getElementById('tabelaClientes'); tbody.innerHTML='';
  clientes.forEach(c=>{
    const r = tbody.insertRow();
    r.innerHTML = `<td>${c.id}</td><td>${c.nome}</td><td>${c.email}</td><td>${c.telefone}</td><td>${c.cpf}</td><td>${c.endereco}</td><td>${c.emergencia}</td><td>${c.dataCadastro}</td>
      <td><button class="btn btn-danger" onclick="excluirCliente(${c.id})">🗑️</button></td>`;
  });
}
function excluirCliente(id){ if(!confirm('Excluir este cliente?')) return; clientes = clientes.filter(c=>c.id!==id); atualizarTabelaClientes(); atualizarSelectClientes(); saveState(); }
function atualizarSelectClientes(){
  const select = document.getElementById('petCliente'); if(!select) return;
  select.innerHTML = '<option value="">Selecione o cliente</option>';
  clientes.forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=c.nome; select.appendChild(o); });
}

// ===== Pets =====
function adicionarPet(){
  const clienteId = document.getElementById('petCliente').value;
  const nome = document.getElementById('petNome').value.trim();
  const especie = document.getElementById('petEspecie').value;
  const raca = document.getElementById('petRaca').value.trim();
  const tamanho = document.getElementById('petTamanho').value;
  const peso = document.getElementById('petPeso').value;
  const idade = document.getElementById('petIdade').value.trim();
  const temperamento = document.getElementById('petTemperamento').value;
  const castrado = document.getElementById('petCastrado').value;
  const medicamentos = document.getElementById('petMedicamentos').value.trim();
  const cartao = document.getElementById('petCartaoVacinaNumero').value.trim();
  const observacoes = document.getElementById('petObservacoes').value.trim();

  if(!clienteId || !nome || !especie || !raca || !tamanho || !temperamento){ alert('Campos obrigatórios: Cliente, Nome, Espécie, Raça, Tamanho e Temperamento.'); return; }
  if(!cartao){ alert('Informe o Nº do Cartão de Vacinas do pet.'); return; }

  const cliente = clientes.find(c=>c.id==clienteId);
  const pet = { id: nextPetId++, clienteId: parseInt(clienteId), clienteNome: cliente?cliente.nome:'—',
    nome, especie, raca, tamanho, peso: peso?parseFloat(peso):null, idade, temperamento, castrado, medicamentos,
    cartaoVacinaNumero: cartao, observacoes, dataCadastro: new Date().toLocaleDateString('pt-BR') };
  pets.push(pet);
  atualizarTabelaPets(); limparFormularioPet(); alert('Pet cadastrado com sucesso!'); saveState();
}
function limparFormularioPet(){ ['petCliente','petNome','petEspecie','petRaca','petTamanho','petPeso','petIdade','petTemperamento','petCastrado','petMedicamentos','petCartaoVacinaNumero','petObservacoes'].forEach(id=>{ const el=document.getElementById(id); if(!el) return; if(el.tagName==='SELECT') el.value=''; else el.value=''; }); document.getElementById('petCastrado').value='Sim'; }
function atualizarTabelaPets(){
  const tbody = document.getElementById('tabelaPets'); tbody.innerHTML='';
  pets.forEach(p=>{
    const r = tbody.insertRow();
    r.innerHTML = `
      <td>${p.id}</td><td>${p.clienteNome}</td><td>${p.nome}</td><td>${p.especie}</td><td>${p.raca}</td>
      <td>${p.tamanho}</td><td>${p.peso ? p.peso+'kg' : '-'}</td><td>${p.temperamento}</td>
      <td>${p.cartaoVacinaNumero ? '✅' : '❌'}</td>
      <td>${p.medicamentos ? '✅' : '—'}</td>
      <td><button class="btn btn-danger" onclick="excluirPet(${p.id})">🗑️</button></td>`;
  });
}
function excluirPet(id){ if(!confirm('Excluir este pet?')) return; pets = pets.filter(p=>p.id!==id); atualizarTabelaPets(); atualizarSelectPets('hospedagemPet'); atualizarSelectPets('crechePet'); saveState(); }
function atualizarSelectPets(selectId){
  const select = document.getElementById(selectId); if(!select) return;
  select.innerHTML = '<option value="">Selecione o pet</option>';
  pets.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=`${p.nome} (${p.clienteNome})`; select.appendChild(o); });
}

// ===== Hospedagem =====
function calcularPrecoHospedagem(){
  const petId = document.getElementById('hospedagemPet').value;
  const checkin = document.getElementById('hospedagemCheckin').value;
  const checkout = document.getElementById('hospedagemCheckout').value;
  if(!petId || !checkin || !checkout){ document.getElementById('precoHospedagem').textContent='💰 Valor Total: R$ 0,00'; return; }
  const pet = pets.find(p=>p.id==petId); if(!pet) return;
  const d1 = new Date(checkin), d2 = new Date(checkout);
  let dias = Math.ceil((d2-d1)/(1000*60*60*24)); if(isNaN(dias) || dias<1) dias = 1;

  let base=0;
  switch((pet.tamanho||'').toLowerCase()){
    case 'pequeno': base=precos.hospedagem.pequeno; break;
    case 'médio': case 'medio': base=precos.hospedagem.medio; break;
    case 'grande': base=precos.hospedagem.grande; break;
    case 'gigante': base=precos.hospedagem.gigante; break;
  }
  let total = base * dias;
  if(document.getElementById('servicoBanho').checked) total += precos.extras.banho;
  if(document.getElementById('servicoConsultaVet').checked) total += precos.extras.consulta;
  if(document.getElementById('servicoTransporte').checked) total += precos.extras.transporte;

  document.getElementById('precoHospedagem').textContent = `💰 Valor Total: R$ ${total.toFixed(2).replace('.',',')} (${dias} dia(s))`;
  return { dias, total, base };
}
function validarPrereqHosp(){ return ['prereqVacina','prereqPulga','prereqCaminha','prereqComida'].every(id=>document.getElementById(id).checked); }
function adicionarHospedagem(){
  const petId = document.getElementById('hospedagemPet').value;
  const checkin = document.getElementById('hospedagemCheckin').value;
  const checkout = document.getElementById('hospedagemCheckout').value;
  if(!petId || !checkin || !checkout){ alert('Preencha Pet, Check-in e Check-out.'); return; }
  const pet = pets.find(p=>p.id==petId); const cliente = pet?clientes.find(c=>c.id==pet.clienteId):null;
  if(!pet || !cliente){ alert('Cliente/Pet não encontrados.'); return; }
  if(!validarPrereqHosp()){ alert('Marque todos os pré-requisitos (cartão, antipulgas, caminha e comida).'); return; }
  const calc = calcularPrecoHospedagem(); if(!calc){ alert('Revise os campos para calcular o valor.'); return; }
  const servicos = []; if(document.getElementById('servicoBanho').checked) servicos.push('Banho');
  if(document.getElementById('servicoConsultaVet').checked) servicos.push('Consulta Veterinária');
  if(document.getElementById('servicoTransporte').checked) servicos.push('Transporte');
  const h = { id: nextHospedagemId++, petId: parseInt(petId), petNome: pet.nome, clienteNome: cliente.nome,
    checkin, checkout, dias: calc.dias, servicos: servicos.join(', '), total: calc.total, status:'Ativo', dataCriacao: new Date().toLocaleDateString('pt-BR') };
  hospedagens.push(h);
  atualizarTabelaHospedagem(); limparFormularioHospedagem();
  alert(`Hospedagem confirmada! Total: R$ ${h.total.toFixed(2).replace('.',',')}`); saveState();
}
function limparFormularioHospedagem(){
  ['hospedagemPet','hospedagemCheckin','hospedagemCheckout'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  ['servicoBanho','servicoConsultaVet','servicoTransporte','prereqVacina','prereqPulga','prereqCaminha','prereqComida'].forEach(id=>{ const el=document.getElementById(id); if(el) el.checked=false; });
  document.getElementById('precoHospedagem').textContent='💰 Valor Total: R$ 0,00';
}
function atualizarTabelaHospedagem(){
  const tbody = document.getElementById('tabelaHospedagem'); tbody.innerHTML='';
  hospedagens.forEach(h=>{
    const r = tbody.insertRow();
    r.innerHTML = `
      <td>${h.id}</td><td>${h.petNome}</td><td>${h.clienteNome}</td>
      <td>${new Date(h.checkin).toLocaleDateString('pt-BR')}</td>
      <td>${new Date(h.checkout).toLocaleDateString('pt-BR')}</td>
      <td>${h.dias}</td><td>${h.servicos || '-'}</td>
      <td>R$ ${h.total.toFixed(2).replace('.',',')}</td>
      <td><span class="status-badge status-${h.status.toLowerCase()}">${h.status}</span></td>
      <td>
        <button class="btn btn-neutral" onclick="gerarOrcamentoHospedagemExistente(${h.id})">🧾</button>
        <button class="btn btn-success" onclick="checkout(${h.id})">🏁</button>
        <button class="btn btn-danger" onclick="excluirHospedagem(${h.id})">🗑️</button>
      </td>`;
  });
}
function checkout(id){ const h=hospedagens.find(x=>x.id===id); if(h){ h.status='Checkout'; atualizarTabelaHospedagem(); alert('Check-out realizado!'); saveState(); } }
function excluirHospedagem(id){ if(!confirm('Excluir esta hospedagem?')) return; hospedagens=hospedagens.filter(h=>h.id!==id); atualizarTabelaHospedagem(); saveState(); }

// ===== Creche =====
function calcularPrecoCreche(){
  const petId = document.getElementById('crechePet').value;
  const periodo = document.getElementById('crechePeriodo').value;
  const plano = document.getElementById('crechePlano').value;
  if(!petId || !periodo){ document.getElementById('precoCreche').textContent='💰 Valor Total: R$ 0,00'; return; }

  let base = (periodo==='Meio período') ? precos.creche.meio : precos.creche.integral;
  let multiplicador = 1; if(plano==='semanal') multiplicador=precos.planosCreche.semanalDias; if(plano==='mensal') multiplicador=precos.planosCreche.mensalDias;

  let total = base * multiplicador;
  if(document.getElementById('atividadeAdaptacao').checked) total += precos.extras.adaptacao * multiplicador;
  if(document.getElementById('atividadeTreinamento').checked) total += precos.extras.treinamento * multiplicador;

  document.getElementById('precoCreche').textContent = `💰 Valor Total: R$ ${total.toFixed(2).replace('.',',')}${multiplicador>1?` (${multiplicador} dia(s))`:''}`;
  return { total, multiplicador, base, periodo, plano };
}
function validarPrereqCreche(){ return ['prereqVacinaC','prereqPulgaC','prereqCaminhaC','prereqComidaC'].every(id=>document.getElementById(id).checked); }
function adicionarCreche(){
  const petId = document.getElementById('crechePet').value;
  const data = document.getElementById('crecheData').value;
  const periodo = document.getElementById('crechePeriodo').value;
  const plano = document.getElementById('crechePlano').value;
  const entrada = document.getElementById('crecheEntrada').value;
  const saida = document.getElementById('crecheSaida').value;

  if(!petId || !data || !periodo){ alert('Pet, data e período são obrigatórios!'); return; }
  if(!validarPrereqCreche()){ alert('Marque todos os pré-requisitos (cartão, antipulgas, caminha e comida).'); return; }

  const pet = pets.find(p=>p.id==petId); const cliente = pet?clientes.find(c=>c.id==pet.clienteId):null;
  if(!pet || !cliente){ alert('Cliente/Pet não encontrados.'); return; }

  const calc = calcularPrecoCreche(); if(!calc){ alert('Revise os campos para calcular o valor.'); return; }

  const atividades = []; if(document.getElementById('atividadeAdaptacao').checked) atividades.push('Adaptação');
  if(document.getElementById('atividadeTreinamento').checked) atividades.push('Treinamento');

  const c = { id: nextCrecheId++, petId: parseInt(petId), petNome: pet.nome, clienteNome: cliente.nome,
    data, periodo, plano, entrada, saida, atividades: atividades.join(', '), total: calc.total, status:'Agendado', dataCriacao: new Date().toLocaleDateString('pt-BR') };
  creches.push(c);
  atualizarTabelaCreche(); limparFormularioCreche();
  alert(`Creche agendada! Total: R$ ${c.total.toFixed(2).replace('.',',')}`); saveState();
}
function limparFormularioCreche(){
  ['crechePet','crecheData','crechePeriodo','crechePlano','crecheEntrada','crecheSaida'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value = (id==='crechePlano'?'avulso':''); });
  ['atividadeAdaptacao','atividadeTreinamento','prereqVacinaC','prereqPulgaC','prereqCaminhaC','prereqComidaC'].forEach(id=>{ const el=document.getElementById(id); if(el) el.checked=false; });
  document.getElementById('precoCreche').textContent='💰 Valor Total: R$ 0,00';
}
function atualizarTabelaCreche(){
  const tbody=document.getElementById('tabelaCreche'); tbody.innerHTML='';
  creches.forEach(c=>{
    const r=tbody.insertRow();
    r.innerHTML = `
      <td>${c.id}</td><td>${c.petNome}</td><td>${c.clienteNome}</td>
      <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
      <td>${c.periodo}</td><td>${c.plano}</td>
      <td>${c.entrada || '-'}</td><td>${c.saida || '-'}</td>
      <td>${c.atividades || '-'}</td>
      <td>R$ ${c.total.toFixed(2).replace('.',',')}</td>
      <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td>
      <td>
        <button class="btn btn-neutral" onclick="gerarOrcamentoCrecheExistente(${c.id})">🧾</button>
        <button class="btn btn-success" onclick="finalizarCreche(${c.id})">✅</button>
        <button class="btn btn-danger" onclick="excluirCreche(${c.id})">🗑️</button>
      </td>`;
  });
}
function finalizarCreche(id){ const c=creches.find(x=>x.id===id); if(c){ c.status='Finalizado'; atualizarTabelaCreche(); alert('Sessão de creche finalizada!'); saveState(); } }
function excluirCreche(id){ if(!confirm('Excluir esta sessão de creche?')) return; creches=creches.filter(c=>c.id!==id); atualizarTabelaCreche(); saveState(); }

// ===== Orçamentos (PDF via Print) =====
function abrirPdfHtml(titulo, corpoHtml) {
  const w = window.open('', '_blank');
  if (!w) { alert('Permita pop-ups para gerar o PDF.'); return; }
  const html =
    '<!DOCTYPE html><html lang="pt-BR"><head>' +
    '<meta charset="utf-8"><title>' + titulo + '</title>' +
    '<style>' +
    '@page{size:A4;margin:16mm}' +
    'body{font-family:Arial,sans-serif;color:#222}' +
    'h1{font-size:20px;margin:0 0 4px}' +
    '.muted{color:#666;font-size:12px}' +
    '.box{border:1px solid #ddd;border-radius:8px;padding:12px;margin:8px 0}' +
    '.row{display:flex;gap:12px}.col{flex:1}' +
    'table{width:100%;border-collapse:collapse;margin-top:8px}' +
    'th,td{border:1px solid #ddd;padding:8px;text-align:left}' +
    'th{background:#f6f6f6}' +
    '.total{font-size:18px;font-weight:700;text-align:right;margin-top:8px}' +
    '.small{font-size:12px;color:#444;line-height:1.4}' +
    '</style>' +
    '</head><body>' + corpoHtml + '</body></html>';
  w.document.open(); w.document.write(html); w.document.close();
  w.onload = () => { try { w.print(); } catch(e){} };
}

function gerarOrcamentoHospedagem(){
  const petId = document.getElementById('hospedagemPet').value;
  const checkin = document.getElementById('hospedagemCheckin').value;
  const checkout = document.getElementById('hospedagemCheckout').value;
  if(!petId || !checkin || !checkout){ alert('Preencha Pet, Check-in e Check-out.'); return; }
  const pet = pets.find(p=>p.id==petId), cliente = pet?clientes.find(c=>c.id==pet.clienteId):null;
  const calc = calcularPrecoHospedagem(); if(!calc){ alert('Revise os campos para calcular.'); return; }
  const servs = [
    document.getElementById('servicoBanho').checked ? 'Banho' : null,
    document.getElementById('servicoConsultaVet').checked ? 'Consulta Veterinária' : null,
    document.getElementById('servicoTransporte').checked ? 'Transporte' : null
  ].filter(Boolean).join(', ') || '—';
  const hoje = new Date().toLocaleString('pt-BR');
  const corpo = `
    <h1>Orçamento – Hospedagem (Clube Pet)</h1>
    <div class="muted">Gerado em ${hoje}</div>
    <div class="box">
      <div class="row">
        <div class="col"><strong>Cliente:</strong> ${cliente?cliente.nome:'—'}</div>
        <div class="col"><strong>Telefone:</strong> ${cliente?cliente.telefone:'—'}</div>
      </div>
      <div class="row">
        <div class="col"><strong>Pet:</strong> ${pet?pet.nome:'—'}</div>
        <div class="col"><strong>Tamanho:</strong> ${pet?pet.tamanho:'—'}</div>
      </div>
    </div>
    <div class="box">
      <table>
        <tr><th>Check-in</th><td>${new Date(checkin).toLocaleDateString('pt-BR')}</td></tr>
        <tr><th>Check-out</th><td>${new Date(checkout).toLocaleDateString('pt-BR')}</td></tr>
        <tr><th>Dias</th><td>${calc.dias}</td></tr>
        <tr><th>Serviços extras</th><td>${servs}</td></tr>
      </table>
      <div class="total">Total estimado: R$ ${calc.total.toFixed(2).replace('.',',')}</div>
    </div>
    <p class="small"><strong>Pré-requisitos:</strong> cartão de vacinas válido, coleira/antipulgas, caminha e comida.</p>`;
  abrirPdfHtml('Orçamento Hospedagem', corpo);
}

function gerarOrcamentoHospedagemExistente(id){
  const h = hospedagens.find(x=>x.id===id); if(!h){ alert('Reserva não encontrada.'); return; }
  const pet = pets.find(p=>p.id===h.petId); const cliente = pet?clientes.find(c=>c.id===pet.clienteId):null;
  const hoje = new Date().toLocaleString('pt-BR');
  const corpo = `
    <h1>Orçamento – Hospedagem (Clube Pet)</h1>
    <div class="muted">Gerado em ${hoje}</div>
    <div class="box">
      <div class="row">
        <div class="col"><strong>Cliente:</strong> ${cliente?cliente.nome:'—'}</div>
        <div class="col"><strong>Telefone:</strong> ${cliente?cliente.telefone:'—'}</div>
      </div>
      <div class="row">
        <div class="col"><strong>Pet:</strong> ${h.petNome}</div>
        <div class="col"><strong>Dias:</strong> ${h.dias}</div>
      </div>
    </div>
    <div class="box">
      <table>
        <tr><th>Check-in</th><td>${new Date(h.checkin).toLocaleDateString('pt-BR')}</td></tr>
        <tr><th>Check-out</th><td>${new Date(h.checkout).toLocaleDateString('pt-BR')}</td></tr>
        <tr><th>Serviços extras</th><td>${h.servicos || '—'}</td></tr>
      </table>
      <div class="total">Total estimado: R$ ${h.total.toFixed(2).replace('.',',')}</div>
    </div>
    <p class="small"><strong>Pré-requisitos:</strong> cartão de vacinas válido, coleira/antipulgas, caminha e comida.</p>`;
  abrirPdfHtml('Orçamento Hospedagem', corpo);
}

function gerarOrcamentoCreche(){
  const petId = document.getElementById('crechePet').value;
  const data = document.getElementById('crecheData').value;
  const periodo = document.getElementById('crechePeriodo').value;
  const plano = document.getElementById('crechePlano').value;
  if(!petId || !data || !periodo){ alert('Pet, data e período são obrigatórios!'); return; }
  const pet = pets.find(p=>p.id==petId); const cliente = pet?clientes.find(c=>c.id==pet.clienteId):null;
  const calc = calcularPrecoCreche(); if(!calc){ alert('Revise os campos para calcular.'); return; }
  const atv = [
    document.getElementById('atividadeAdaptacao').checked ? 'Adaptação' : null,
    document.getElementById('atividadeTreinamento').checked ? 'Treinamento' : null
  ].filter(Boolean).join(', ') || '—';
  const hoje = new Date().toLocaleString('pt-BR');
  const corpo = `
    <h1>Orçamento – Creche (Clube Pet)</h1>
    <div class="muted">Gerado em ${hoje}</div>
    <div class="box">
      <div class="row">
        <div class="col"><strong>Cliente:</strong> ${cliente?cliente.nome:'—'}</div>
        <div class="col"><strong>Telefone:</strong> ${cliente?cliente.telefone:'—'}</div>
      </div>
      <div class="row">
        <div class="col"><strong>Pet:</strong> ${pet?pet.nome:'—'}</div>
        <div class="col"><strong>Plano:</strong> ${calc.plano}</div>
      </div>
    </div>
    <div class="box">
      <table>
        <tr><th>Data inicial</th><td>${new Date(data).toLocaleDateString('pt-BR')}</td></tr>
        <tr><th>Período</th><td>${periodo}</td></tr>
        <tr><th>Dias (estimado)</th><td>${calc.multiplicador}</td></tr>
        <tr><th>Atividades</th><td>${atv}</td></tr>
      </table>
      <div class="total">Total estimado: R$ ${calc.total.toFixed(2).replace('.',',')}</div>
    </div>
    <p class="small"><strong>Pré-requisitos:</strong> cartão de vacinas válido, coleira/antipulgas, caminha e comida.</p>`;
  abrirPdfHtml('Orçamento Creche', corpo);
}

function gerarOrcamentoCrecheExistente(id){
  const c = creches.find(x=>x.id===id); if(!c){ alert('Registro não encontrado.'); return; }
  const pet = pets.find(p=>p.id===c.petId); const cliente = pet?clientes.find(z=>z.id===pet.clienteId):null;
  const hoje = new Date().toLocaleString('pt-BR');
  const corpo = `
    <h1>Orçamento – Creche (Clube Pet)</h1>
    <div class="muted">Gerado em ${hoje}</div>
    <div class="box">
      <div class="row">
        <div class="col"><strong>Cliente:</strong> ${cliente?cliente.nome:'—'}</div>
        <div class="col"><strong>Telefone:</strong> ${cliente?cliente.telefone:'—'}</div>
      </div>
      <div class="row">
        <div class="col"><strong>Pet:</strong> ${c.petNome}</div>
        <div class="col"><strong>Plano:</strong> ${c.plano}</div>
      </div>
    </div>
    <div class="box">
      <table>
        <tr><th>Data</th><td>${new Date(c.data).toLocaleDateString('pt-BR')}</td></tr>
        <tr><th>Período</th><td>${c.periodo}</td></tr>
        <tr><th>Atividades</th><td>${c.atividades || '—'}</td></tr>
      </table>
      <div class="total">Total estimado: R$ ${c.total.toFixed(2).replace('.',',')}</div>
    </div>
    <p class="small"><strong>Pré-requisitos:</strong> cartão de vacinas válido, coleira/antipulgas, caminha e comida.</p>`;
  abrirPdfHtml('Orçamento Creche', corpo);
}

// ===== Relatórios & Excel (tela) =====
function atualizarResumo(){
  document.getElementById('totalClientes').textContent = clientes.length;
  document.getElementById('totalPets').textContent = pets.length;
  document.getElementById('hospedagensAtivas').textContent = hospedagens.filter(h=>h.status==='Ativo').length;
  const hoje=new Date(), inicioMes=new Date(hoje.getFullYear(),hoje.getMonth(),1);
  const faturamentoMensal = [
    ...hospedagens.filter(h=>new Date(h.dataCriacao.split('/').reverse().join('-'))>=inicioMes),
    ...creches.filter(c=>new Date(c.dataCriacao.split('/').reverse().join('-'))>=inicioMes)
  ].reduce((s,i)=>s+i.total,0);
  document.getElementById('faturamentoMensal').textContent=`R$ ${faturamentoMensal.toFixed(2).replace('.',',')}`;
}

function gerarRelatorio(){
  const periodo = document.getElementById('relatorioPeriodo').value;
  let dataInicio, dataFim; const hoje = new Date();
  switch(periodo){
    case 'hoje': dataInicio=new Date(hoje.getFullYear(),hoje.getMonth(),hoje.getDate()); dataFim=new Date(hoje.getFullYear(),hoje.getMonth(),hoje.getDate(),23,59,59,999); break;
    case 'semana': dataInicio=new Date(hoje.getTime()-7*24*60*60*1000); dataFim=hoje; break;
    case 'mes': dataInicio=new Date(hoje.getFullYear(),hoje.getMonth(),1); dataFim=hoje; break;
    case 'personalizado': dataInicio=new Date(document.getElementById('relatorioInicio').value); dataFim=new Date(document.getElementById('relatorioFim').value); break;
  }
  const hs=hospedagens.filter(h=>{const d=new Date(h.dataCriacao.split('/').reverse().join('-')); return d>=dataInicio && d<=dataFim;});
  const cs=creches.filter(c=>{const d=new Date(c.dataCriacao.split('/').reverse().join('-')); return d>=dataInicio && d<=dataFim;});
  const tbody=document.getElementById('tabelaRelatorio'); tbody.innerHTML='';
  const linhas=[ {servico:'Hospedagens', quantidade:hs.length, receita:hs.reduce((s,x)=>s+x.total,0)}, {servico:'Creche', quantidade:cs.length, receita:cs.reduce((s,x)=>s+x.total,0)} ];
  linhas.forEach(l=>{ const r=tbody.insertRow(); r.innerHTML=`<td>${l.servico}</td><td>${l.quantidade}</td><td>R$ ${l.receita.toFixed(2).replace('.',',')}</td>`; });
  const total=linhas.reduce((s,l)=>s+l.receita,0);
  const tr=tbody.insertRow(); tr.style.backgroundColor='#e3f2fd'; tr.innerHTML=`<td><strong>TOTAL</strong></td><td><strong>${linhas.reduce((s,l)=>s+l.quantidade,0)}</strong></td><td><strong>R$ ${total.toFixed(2).replace('.',',')}</strong></td>`;
  document.getElementById('relatorioResultado').style.display='block';
}

// CSV simples (BOM + separador ;)
function exportarExcel(){
  const dados = { clientes, pets, hospedagens, creches, precos };
  const csv = gerarCSVExcel(dados);
  baixarCSV(csv, 'clubepet-dados.csv');
}
function gerarCSVExcel(d){
  const sep=';'; const esc=s=>`"${String(s||'').replace(/"/g,'""')}"`;
  let csv = 'CLIENTES\n';
  csv += ['ID','Nome','Email','Telefone','CPF','Endereço','Emergência','Data Cadastro'].join(sep)+'\n';
  d.clientes.forEach(c=>{ csv += [c.id,esc(c.nome),esc(c.email),esc(c.telefone),esc(c.cpf),esc(c.endereco),esc(c.emergencia),esc(c.dataCadastro)].join(sep)+'\n'; });
  csv += '\nPETS\n'; csv += ['ID','Cliente','Nome','Espécie','Raça','Tamanho','Peso','Temperamento','CartãoVac','Medicamentos'].join(sep)+'\n';
  d.pets.forEach(p=>{ csv += [p.id,esc(p.clienteNome),esc(p.nome),esc(p.especie),esc(p.raca),esc(p.tamanho),(p.peso||''),esc(p.temperamento),esc(p.cartaoVacinaNumero||''),esc(p.medicamentos||'')].join(sep)+'\n'; });
  csv += '\nHOSPEDAGENS\n'; csv += ['ID','Pet','Cliente','Check-in','Check-out','Dias','Serviços','Total','Status'].join(sep)+'\n';
  d.hospedagens.forEach(h=>{ csv += [h.id,esc(h.petNome),esc(h.clienteNome),esc(h.checkin),esc(h.checkout),h.dias,esc(h.servicos||''),h.total,esc(h.status)].join(sep)+'\n'; });
  csv += '\nCRECHE\n'; csv += ['ID','Pet','Cliente','Data','Período','Plano','Entrada','Saída','Atividades','Total','Status'].join(sep)+'\n';
  d.creches.forEach(c=>{ csv += [c.id,esc(c.petNome),esc(c.clienteNome),esc(c.data),esc(c.periodo),esc(c.plano),esc(c.entrada||''),esc(c.saida||''),esc(c.atividades||''),c.total,esc(c.status)].join(sep)+'\n'; });
  return '\uFEFF' + csv;
}
function baixarCSV(content, filename){
  const a=document.createElement('a');
  a.setAttribute('href','data:text/csv;charset=utf-8,'+encodeURIComponent(content));
  a.setAttribute('download',filename);
  a.style.display='none'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function exportarRelatorio(){
  const hoje = new Date();
  const totalH = hospedagens.reduce((s,h)=>s+h.total,0);
  const totalC = creches.reduce((s,c)=>s+c.total,0);
  const rel = `RELATÓRIO GERAL - ${hoje.toLocaleDateString('pt-BR')}

RESUMO:
- Clientes: ${clientes.length}
- Pets: ${pets.length}
- Hospedagens ativas: ${hospedagens.filter(h=>h.status==='Ativo').length}
- Receita Hospedagens: R$ ${totalH.toFixed(2).replace('.',',')}
- Receita Creche: R$ ${totalC.toFixed(2).replace('.',',')}
- RECEITA TOTAL: R$ ${(totalH+totalC).toFixed(2).replace('.',',')}

HOSPEDAGENS:
${hospedagens.map(h=>`- ${h.petNome} (${h.clienteNome}): ${h.checkin} a ${h.checkout} - R$ ${h.total.toFixed(2).replace('.',',')}`).join('\n')}

CRECHE:
${creches.map(c=>`- ${c.petNome} (${c.clienteNome}): ${c.data} - ${c.periodo} (${c.plano}) - R$ ${c.total.toFixed(2).replace('.',',')}`).join('\n')}
`;
  const a=document.createElement('a');
  a.setAttribute('href','data:text/plain;charset=utf-8,'+encodeURIComponent(rel));
  a.setAttribute('download','relatorio-clubepet.txt');
  a.style.display='none'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

/* =========================
   >>> XLSX PERSONALIZADO (SEM IMAGEM) — DASHBOARD FC <<<
   - Cores, cabeçalhos, bordas e larguras
   - Abas: Clientes, Pets, Hospedagens, Creche e FC (Fluxo de Caixa)
   - Telefones/CPF como texto; datas BR; moeda R$
========================= */

// Paleta
const XL = {
  banner: 'FF5B3A1A',         // marrom
  bannerText: 'FFFFFFFF',
  header: 'FF1F2937',         // cinza escuro
  headerText: 'FFFFFFFF',
  line: 'FFCBD5E1',
  zebra: 'FFF8FAFC',
  green: 'FF16A34A',
  red: 'FFDC2626',
  blue: 'FF2563EB',
  section: 'FFE5E7EB',
  white: 'FFFFFFFF',
  grayText: 'FF334155'
};

function _setHeader(ws){
  const r = ws.getRow(1);
  r.font = { bold:true, color:{argb:XL.headerText} };
  r.alignment = { vertical:'middle', horizontal:'center' };
  r.height = 22;
  r.fill = { type:'pattern', pattern:'solid', fgColor:{argb:XL.header} };
  r.eachCell(c=>{
    c.border = { top:{style:'thin',color:{argb:XL.line}}, left:{style:'thin',color:{argb:XL.line}},
                 bottom:{style:'thin',color:{argb:XL.line}}, right:{style:'thin',color:{argb:XL.line}} };
  });
}
function _freezeFilter(ws){ ws.views=[{state:'frozen',ySplit:1}]; ws.autoFilter={from:{row:1,column:1},to:{row:1,column:ws.columnCount}}; }
function _zebra(ws){ for(let r=2; r<=ws.lastRow.number; r++){ if(r%2===0){ ws.getRow(r).eachCell(c=>{ c.fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.zebra}}; }); } } }
function _textCol(ws, key){ const col=ws.getColumn(key); for(let r=2;r<=ws.lastRow.number;r++){ ws.getRow(r).getCell(col.number).numFmt='@'; } }
function _parseBR(s){ if(!s) return null; if(/^\d{2}\/\d{2}\/\d{4}$/.test(s)){ const [d,m,y]=s.split('/').map(n=>+n); return new Date(y,m-1,d); } const d=new Date(s); return isNaN(d)?null:d; }
function _receitaMeses(){
  const arr=new Array(12).fill(0);
  hospedagens.forEach(h=>{ const d=_parseBR(h.dataCriacao); if(d) arr[d.getMonth()]+=Number(h.total)||0; });
  creches.forEach(c=>{ const d=_parseBR(c.dataCriacao); if(d) arr[d.getMonth()]+=Number(c.total)||0; });
  return arr;
}

async function exportarPlanilhaXLSX(){
  try{
    if(typeof ExcelJS==='undefined'){ alert('ExcelJS não carregado.'); return; }
    const wb=new ExcelJS.Workbook();
    wb.created=new Date(); wb.properties={title:'Clube Pet - Planilha',creator:'Clube Pet'};

    // ==== CLIENTES ====
    const shCli=wb.addWorksheet('Clientes');
    shCli.columns=[
      {header:'ID',key:'id',width:8},{header:'Nome',key:'nome',width:28},{header:'Email',key:'email',width:28},
      {header:'Telefone',key:'telefone',width:18},{header:'CPF',key:'cpf',width:16},{header:'Endereço',key:'endereco',width:30},
      {header:'Emergência',key:'emergencia',width:24},{header:'Cadastro',key:'dataCadastro',width:14}
    ];
    clientes.forEach(c=>shCli.addRow({...c,telefone:String(c.telefone||''),cpf:String(c.cpf||'')}));
    _setHeader(shCli); _freezeFilter(shCli); _textCol(shCli,'telefone'); _textCol(shCli,'cpf'); _zebra(shCli);

    // ==== PETS ====
    const shPet=wb.addWorksheet('Pets');
    shPet.columns=[
      {header:'ID',key:'id',width:8},{header:'Cliente',key:'clienteNome',width:28},{header:'Nome',key:'nome',width:20},
      {header:'Espécie',key:'especie',width:12},{header:'Raça',key:'raca',width:18},{header:'Tamanho',key:'tamanho',width:12},
      {header:'Peso (kg)',key:'peso',width:10},{header:'Temperamento',key:'temperamento',width:16},
      {header:'Castrado',key:'castrado',width:10},{header:'Cartão Vacinas',key:'cartaoVacinaNumero',width:18},
      {header:'Medicamentos',key:'medicamentos',width:30},{header:'Observações',key:'observacoes',width:30},
      {header:'Cadastro',key:'dataCadastro',width:14}
    ];
    pets.forEach(p=>shPet.addRow({...p,peso:(p.peso==null||p.peso==='')?null:Number(p.peso)}));
    _setHeader(shPet); _freezeFilter(shPet); _zebra(shPet);

    // ==== HOSPEDAGENS ====
    const shHos=wb.addWorksheet('Hospedagens');
    shHos.columns=[
      {header:'ID',key:'id',width:8},{header:'Pet',key:'petNome',width:18},{header:'Cliente',key:'clienteNome',width:24},
      {header:'Check-in',key:'checkin',width:14},{header:'Check-out',key:'checkout',width:14},{header:'Dias',key:'dias',width:8},
      {header:'Serviços',key:'servicos',width:28},{header:'Total (R$)',key:'total',width:14},{header:'Status',key:'status',width:12},
      {header:'Criado em',key:'dataCriacao',width:14}
    ];
    hospedagens.forEach(h=>{
      const r=shHos.addRow(h);
      r.getCell('checkin').value=h.checkin?new Date(h.checkin):null;
      r.getCell('checkout').value=h.checkout?new Date(h.checkout):null;
      r.getCell('checkin').numFmt='dd/mm/yyyy'; r.getCell('checkout').numFmt='dd/mm/yyyy';
      r.getCell('total').numFmt='"R$" #,##0.00';
    });
    _setHeader(shHos); _freezeFilter(shHos); _zebra(shHos);

    // ==== CRECHE ====
    const shCre=wb.addWorksheet('Creche');
    shCre.columns=[
      {header:'ID',key:'id',width:8},{header:'Pet',key:'petNome',width:18},{header:'Cliente',key:'clienteNome',width:24},
      {header:'Data',key:'data',width:14},{header:'Período',key:'periodo',width:16},{header:'Plano',key:'plano',width:12},
      {header:'Entrada',key:'entrada',width:12},{header:'Saída',key:'saida',width:12},{header:'Atividades',key:'atividades',width:28},
      {header:'Total (R$)',key:'total',width:14},{header:'Status',key:'status',width:12},{header:'Criado em',key:'dataCriacao',width:14}
    ];
    creches.forEach(c=>{
      const r=shCre.addRow(c);
      r.getCell('data').value=c.data?new Date(c.data):null;
      r.getCell('data').numFmt='dd/mm/yyyy';
      r.getCell('total').numFmt='"R$" #,##0.00';
    });
    _setHeader(shCre); _freezeFilter(shCre); _zebra(shCre);

    // ==== FC (Fluxo de Caixa) ====
    const shFC=wb.addWorksheet('FC');
    // Banner
    shFC.mergeCells('A1:N1');
    const b=shFC.getCell('A1');
    b.value='🐾 Clube Pet — Fluxo de Caixa';
    b.font={bold:true,size:14,color:{argb:XL.bannerText}};
    b.alignment={vertical:'middle',horizontal:'left'};
    b.fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.banner}};
    shFC.getRow(1).height=28;

    // Cabeçalho meses
    const meses=['Finanças','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro','Total'];
    shFC.addRow(meses);
    const r2=shFC.getRow(2);
    r2.font={bold:true,color:{argb:XL.white}};
    r2.alignment={vertical:'middle',horizontal:'center'};
    r2.height=22;
    r2.eachCell(c=>{
      c.fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.header}};
      c.border={top:{style:'thin',color:{argb:XL.line}},left:{style:'thin',color:{argb:XL.line}},bottom:{style:'thin',color:{argb:XL.line}},right:{style:'thin',color:{argb:XL.line}}};
    });
    const widths=[18,13,13,13,13,13,13,13,13,13,13,13,13,14]; widths.forEach((w,i)=>shFC.getColumn(i+1).width=w);

    let rowNo=2;
    function section(title){
      rowNo++;
      const r=shFC.addRow([title]); shFC.mergeCells(`A${rowNo}:N${rowNo}`);
      r.font={bold:true,color:{argb:XL.grayText}};
      r.fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.section}};
      r.alignment={horizontal:'left',vertical:'middle'};
      return r;
    }
    function moneyRow(label, valuesArray){
      rowNo++;
      const row=shFC.addRow([label, ...valuesArray, null]);
      for(let c=2;c<=14;c++){
        const cell=row.getCell(c);
        cell.numFmt='"R$" #,##0.00';
        cell.border={top:{style:'thin',color:{argb:XL.line}},left:{style:'thin',color:{argb:XL.line}},bottom:{style:'thin',color:{argb:XL.line}},right:{style:'thin',color:{argb:XL.line}}};
      }
      row.getCell(14).value={formula:`SUM(B${row.number}:M${row.number})`};
      return row;
    }
    function percentRow(label){
      rowNo++;
      const row=shFC.addRow([label]);
      for(let c=2;c<=14;c++){
        const cell=row.getCell(c); cell.value=0; cell.numFmt='0%'; cell.alignment={horizontal:'center'};
        cell.border={top:{style:'thin',color:{argb:XL.line}},left:{style:'thin',color:{argb:XL.line}},bottom:{style:'thin',color:{argb:XL.line}},right:{style:'thin',color:{argb:XL.line}}};
      }
      return row;
    }

    // Planejamento
    section('Planejamento');
    const rProLab = moneyRow('Pro Labore', new Array(12).fill(0));
    const rPrevRec = moneyRow('Previsão de Receitas', new Array(12).fill(0));
    const rPrevGas = moneyRow('Previsão de Gastos', new Array(12).fill(0));
    // Resultado Previsto (fórmula)
    rowNo++;
    const rResPrev = shFC.addRow(['Resultado Previsto', ...new Array(12).fill(0), null]);
    for(let c=2;c<=13;c++){
      const a=shFC.getRow(rPrevRec.number).getCell(c).address;
      const b=shFC.getRow(rPrevGas.number).getCell(c).address;
      const p=shFC.getRow(rProLab.number).getCell(c).address;
      const cell=rResPrev.getCell(c);
      cell.value={formula:`${a}-${b}-${p}`};
      cell.numFmt='"R$" #,##0.00';
      cell.border={top:{style:'thin',color:{argb:XL.line}},left:{style:'thin',color:{argb:XL.line}},bottom:{style:'thin',color:{argb:XL.line}},right:{style:'thin',color:{argb:XL.line}}};
    }
    rResPrev.getCell(14).value={formula:`SUM(B${rResPrev.number}:M${rResPrev.number})`};
    rResPrev.getCell(14).numFmt='"R$" #,##0.00';

    // Fluxo de Caixa
    section('Fluxo de Caixa');
    const recMes=_receitaMeses();
    const rRec = moneyRow('Receitas', recMes);
    for(let c=2;c<=14;c++){
      const cell=rRec.getCell(c);
      cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.green}};
      cell.font={bold:true,color:{argb:XL.white}};
      cell.alignment={horizontal:'center'};
    }

    const rPercRec = percentRow('% Realizado de Receitas');
    for(let c=2;c<=14;c++){
      const real=shFC.getRow(rRec.number).getCell(c).address;
      const prev=shFC.getRow(rPrevRec.number).getCell(c).address;
      rPercRec.getCell(c).value={formula:`IFERROR(${real}/${prev},0)`};
    }

    const rGas = moneyRow('Gastos', new Array(12).fill(0));
    for(let c=2;c<=14;c++){
      const cell=rGas.getCell(c);
      cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.red}};
      cell.font={bold:true,color:{argb:XL.white}};
      cell.alignment={horizontal:'center'};
    }

    const rPercGas = percentRow('% Realizado de Gastos');
    for(let c=2;c<=14;c++){
      const real=shFC.getRow(rGas.number).getCell(c).address;
      const prev=shFC.getRow(rPrevGas.number).getCell(c).address;
      rPercGas.getCell(c).value={formula:`IFERROR(${real}/${prev},0)`};
    }

    rowNo++;
    const rRes = shFC.addRow(['Resultado', ...new Array(12).fill(0), null]);
    for(let c=2;c<=13;c++){
      const rec=shFC.getRow(rRec.number).getCell(c).address;
      const gas=shFC.getRow(rGas.number).getCell(c).address;
      const pl =shFC.getRow(rProLab.number).getCell(c).address;
      const cell=rRes.getCell(c);
      cell.value={formula:`${rec}-${gas}-${pl}`};
      cell.numFmt='"R$" #,##0.00';
      cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.blue}};
      cell.font={bold:true,color:{argb:XL.white}};
      cell.alignment={horizontal:'center'};
      cell.border={top:{style:'thin',color:{argb:XL.line}},left:{style:'thin',color:{argb:XL.line}},bottom:{style:'thin',color:{argb:XL.line}},right:{style:'thin',color:{argb:XL.line}}};
    }
    rRes.getCell(14).value={formula:`SUM(B${rRes.number}:M${rRes.number})`};
    rRes.getCell(14).numFmt='"R$" #,##0.00';
    rRes.getCell(14).fill={type:'pattern',pattern:'solid',fgColor:{argb:XL.blue}};
    rRes.getCell(14).font={bold:true,color:{argb:XL.white}};
    rRes.getCell(14).alignment={horizontal:'center'};

    const rPercRes = percentRow('% Realizado do Resultado');
    for(let c=2;c<=14;c++){
      const real=shFC.getRow(rRes.number).getCell(c).address;
      const prev=shFC.getRow(rResPrev.number).getCell(c).address;
      rPercRes.getCell(c).value={formula:`IFERROR(${real}/${prev},0)`};
    }

    // Congelar cabeçalho de meses
    shFC.views=[{state:'frozen',ySplit:2}];

    // ==== Download ====
    const buffer=await wb.xlsx.writeBuffer();
    const blob=new Blob([buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    if(typeof saveAs==='function'){ saveAs(blob,'ClubePet_Planilha.xlsx'); }
    else{ const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='ClubePet_Planilha.xlsx'; a.click(); URL.revokeObjectURL(url); }
  }catch(e){
    console.error(e);
    alert('Erro ao gerar a planilha XLSX. Veja o console para detalhes.');
  }
}

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  atualizarTabelaClientes(); atualizarTabelaPets(); atualizarTabelaHospedagem(); atualizarTabelaCreche(); atualizarResumo();

  // Recalcular preços automaticamente
  ['hospedagemPet','hospedagemCheckin','hospedagemCheckout','servicoBanho','servicoConsultaVet','servicoTransporte']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('change', calcularPrecoHospedagem); });

  ['crechePet','crecheData','crechePeriodo','crechePlano','atividadeAdaptacao','atividadeTreinamento']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('change', calcularPrecoCreche); });
});
