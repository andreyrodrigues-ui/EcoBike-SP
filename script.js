// ===== EcoBike SP · script.js =====

// ---------- 1) Rolagem suave garantida ----------

function rolarSuavePara(elementoDestino, duracao = 650) {
  const alturaHeader = document.querySelector('header')?.offsetHeight || 80;
  const posicaoInicial = window.scrollY;
  const posicaoDestino = elementoDestino.getBoundingClientRect().top + window.scrollY - alturaHeader - 16;
  const distancia = posicaoDestino - posicaoInicial;
  let inicio = null;

  function animar(tempoAtual) {
    if (!inicio) inicio = tempoAtual;
    const tempoDecorrido = tempoAtual - inicio;
    const progresso = Math.min(tempoDecorrido / duracao, 1);

    const ease = progresso < 0.5
      ? 4 * progresso * progresso * progresso
      : 1 - Math.pow(-2 * progresso + 2, 3) / 2;

    window.scrollTo(0, posicaoInicial + distancia * ease);

    if (tempoDecorrido < duracao) {
      requestAnimationFrame(animar);
    }
  }

  requestAnimationFrame(animar);
}

// ---------- 2) Funções de regra de negócio ----------

function calcularValor(horas, tipo) {
  const precos = {
    urbana: 12,
    eletrica: 20,
    cargo: 25
  };

  let valor = horas * (precos[tipo] || 0);

  if (horas > 5) {
    valor *= 0.9; // 10% de desconto acima de 5 horas
  }

  return valor;
}

function formatarMoeda(valor) {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}

// ---------- 3) Seleção de elementos do DOM ----------

const inputHoras = document.querySelector('#horas');
const selectTipo = document.querySelector('#tipo');
const btnCalcular = document.querySelector('#calcular');
const resultado = document.querySelector('#resultado');
const detalhesSimulacao = document.querySelector('#detalhes-simulacao');

const inputNome = document.querySelector('#nome');
const btnAdicionar = document.querySelector('#adicionar');
const lista = document.querySelector('#lista');
const total = document.querySelector('#total');

const btnTema = document.querySelector('#btnTema');
const estacaoAtualLabel = document.querySelector('#estacao-atual-label');

let estacaoSelecionada = 'Av. Paulista · Metrô Trianon';

// ---------- 4) Funções que manipulam o DOM ----------

function mostrarResultado() {
  const horas = Number(inputHoras.value);
  const tipo = selectTipo.value;

  if (isNaN(horas) || horas <= 0) {
    resultado.textContent = 'Informe um número de horas válido';
    if (detalhesSimulacao) detalhesSimulacao.textContent = '';
    return;
  }

  const valorTotal = calcularValor(horas, tipo);
  const valorFormatado = formatarMoeda(valorTotal);

  resultado.textContent = horas > 5
    ? `${valorFormatado} (10% OFF aplicado!)`
    : valorFormatado;

  if (detalhesSimulacao) {
    const co2Evitado = (horas * 2.4).toFixed(1).replace('.', ',');
    detalhesSimulacao.textContent = `🌱 Economia estimada de ${co2Evitado} kg de CO₂ comparado a um carro`;
  }
}

function atualizarContador() {
  const quantidade = lista.querySelectorAll('li').length;
  total.textContent = quantidade;
}

function criarItemReservaDOM(nome, estacao) {
  const li = document.createElement('li');

  const infoWrapper = document.createElement('div');
  infoWrapper.className = 'reserva-info';

  const avatar = document.createElement('span');
  avatar.className = 'avatar-ciclista';
  avatar.textContent = nome.charAt(0).toUpperCase();

  const textoWrapper = document.createElement('div');
  textoWrapper.className = 'reserva-meta';

  const nomeStrong = document.createElement('strong');
  nomeStrong.textContent = nome;

  const estacaoSmall = document.createElement('small');
  estacaoSmall.textContent = `📍 ${estacao}`;

  textoWrapper.appendChild(nomeStrong);
  textoWrapper.appendChild(estacaoSmall);

  infoWrapper.appendChild(avatar);
  infoWrapper.appendChild(textoWrapper);

  const btnRemover = document.createElement('button');
  btnRemover.type = 'button';
  btnRemover.textContent = 'Remover';
  btnRemover.className = 'btn-remover';
  btnRemover.addEventListener('click', () => {
    li.remove();
    atualizarContador();
    salvarReservasLocal();
  });

  li.appendChild(infoWrapper);
  li.appendChild(btnRemover);
  lista.appendChild(li);
}

function adicionarReserva() {
  const nome = inputNome.value.trim();
  if (nome === '') return;

  criarItemReservaDOM(nome, estacaoSelecionada);

  inputNome.value = '';
  inputNome.focus();
  atualizarContador();
  salvarReservasLocal();
}

function alternarTema() {
  document.body.classList.toggle('dark');
  const modoEscuroAtivo = document.body.classList.contains('dark');
  btnTema.textContent = modoEscuroAtivo ? '☀️ Modo claro' : '🌙 Modo escuro';
}

// ---------- 5) Persistência e interações extras ----------

function salvarReservasLocal() {
  const itens = Array.from(lista.querySelectorAll('li')).map((li) => ({
    nome: li.querySelector('strong')?.textContent || '',
    estacao: li.querySelector('small')?.textContent.replace('📍 ', '') || estacaoSelecionada
  }));
  localStorage.setItem('ecobike_reservas', JSON.stringify(itens));
}

function carregarReservasLocal() {
  const salvas = JSON.parse(localStorage.getItem('ecobike_reservas') || '[]');
  salvas.forEach((item) => criarItemReservaDOM(item.nome, item.estacao));
  atualizarContador();
}

// Rolagem suave nos links do menu e botões âncora
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const destino = document.querySelector(id);
    if (destino) {
      event.preventDefault();
      rolarSuavePara(destino);
    }
  });
});

// Selecionar plano direto dos cards e deslizar até o simulador
document.querySelectorAll('.btn-selecionar').forEach((botao) => {
  botao.addEventListener('click', () => {
    selectTipo.value = botao.dataset.tipo;
    mostrarResultado();
    const destino = document.querySelector('#simulador');
    if (destino) rolarSuavePara(destino);
  });
});

// Atalhos rápidos de horas no simulador
document.querySelectorAll('.chip-hora').forEach((chip) => {
  chip.addEventListener('click', () => {
    inputHoras.value = chip.dataset.h;
    mostrarResultado();
  });
});

// Seleção de estações
document.querySelectorAll('.estacao-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.estacao-card').forEach((c) => c.classList.remove('ativa'));
    card.classList.add('ativa');
    estacaoSelecionada = card.dataset.estacao;
    if (estacaoAtualLabel) estacaoAtualLabel.textContent = estacaoSelecionada;
  });
});

// ---------- 6) Eventos principais ----------

btnCalcular.addEventListener('click', mostrarResultado);
inputHoras.addEventListener('input', mostrarResultado);
selectTipo.addEventListener('change', mostrarResultado);

btnAdicionar.addEventListener('click', adicionarReserva);
inputNome.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    adicionarReserva();
  }
});

btnTema.addEventListener('click', alternarTema);

// Inicialização
carregarReservasLocal();
mostrarResultado();