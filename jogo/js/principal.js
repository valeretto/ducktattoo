/* Laço principal, cenas e estado do jogo */
(function () {
  'use strict';
  const DT = window.DT;
  DT.tremorX = 0; DT.tremorY = 0;
  let tremorForca = 0, tremorT = 0;
  DT.tremer = function (forca, dur) { tremorForca = Math.max(tremorForca, forca); tremorT = Math.max(tremorT, dur); };

  const CENAS = () => ({ abertura: DT.Abertura, titulo: DT.Titulo, comoJogar: DT.ComoJogar, historia: DT.Historia,
    cadastro: DT.Cadastro, premio: DT.Premio, final: DT.Final, lendaria: DT.Lendaria, chefe5: DT.Chefe5,
    nivel: DT.Nivel, minijogo: DT.Minijogo, decalque: DT.Decalque, corrida: DT.Corrida, chuva: DT.Chuva,
    chefe: DT.Chefe, chefe2: DT.Chefe2, chefe3: DT.Chefe3, chefe4: DT.Chefe4, vitoria: DT.Vitoria });
  // fases e chefões (todos os chefões herdam de DT.Chefe) aceitam pausa e controles de toque
  // (a Corrida do Piercing usa PULO e o joystick: sem ela aqui, os controles de toque ficavam desligados no celular)
  const ehJogavel = c => c === DT.Nivel || c === DT.Chefe || DT.Chefe.isPrototypeOf(c) || c === DT.Corrida;

  DT.irPara = function (nome) {
    const cena = CENAS()[nome];
    DT.cenaAnterior = DT.cenaAtual;
    DT.cenaAtual = cena;
    DT.pausado = false;
    cena.iniciar();
    // a música do título continua tocando entre título, Como Jogar e História
    const menus = ['titulo', 'comoJogar', 'cadastro', 'historia'];
    if (menus.includes(nome) && window.DuckSom && DuckSom.musicaAtual() !== 'titulo') DuckSom.tocarMusica('titulo');
    // quadrinhos do final: música do final (continua na tela do prêmio)
    if (nome === 'final' && window.DuckSom) DuckSom.tocarMusica('final');
  };

  // Jogo novo: começa na Fase 1
  DT.novoJogo = function () {
    DT.jogo = { fase: 1, ativo: 'emerson', vidas: DT.VIDAS_INICIAIS, energia: DT.ENERGIA_MAX, renascendo: 0, tinta: 1,
      moedas: 0, pontos: 0, cartas: [], tempo: 0, checkpoint: null, minijogoFeito: false, acabou: false, comemorando: false,
      resultado: {}, moedasFase: null, poder: null, patinhos: {} };
    DT.comecarFase(DT.FASE_TESTE || 1, false); // arquivo de teste de uma fase só começa nela
  };

  // Começa uma fase do início. recomeco = depois do Game Over (volta moedas/cartas ao que eram no começo da fase)
  DT.comecarFase = function (f, recomeco) {
    const J = DT.jogo;
    J.fase = f; J.energia = DT.ENERGIA_MAX; J.renascendo = 0; J.tinta = 1; J.checkpoint = null;
    J.minijogoFeito = false; J.acabou = false; J.comemorando = false; J.poder = null;
    if (recomeco) {
      J.vidas = DT.VIDAS_INICIAIS;
      J.moedas = J.inicioFase.moedas; J.pontos = J.inicioFase.pontos; J.cartas = J.inicioFase.cartas.slice();
    } else J.inicioFase = { moedas: J.moedas, pontos: J.pontos, cartas: J.cartas.slice() };
    if (window.DuckSom) DuckSom.setFuria(false);
    DT.irPara('nivel');
    const toque = DT.usandoToque, F = DT.FASES[f];
    if (recomeco) { DT.dialogo([{ t: 'Do começo da fase de novo. E desta vez sem morrer. Quack.', r: 2 }]); return; }
    if (f === 1) {
      // Apresentação do Duckzinho no começo do jogo
      // o Duckzinho já se apresentou na história: aqui ele só explica os controles
      DT.dialogo([
        { t: 'Primeira parada: o próprio estúdio. Tem tatuagem andando por todo lado.', r: 2 },
        { t: toque ? 'Toque e arraste no lado esquerdo para andar. Os botões da direita pulam e atacam. TROCA alterna o herói.'
          : 'Setas andam, ESPAÇO pula, X ataca, C solta o especial, Q troca de herói.', r: 1 },
        { t: 'Vocês dividem 3 vidas. Zerando, ganham cupom de desconto. Fazendo tudo perfeito, um cupom MAIOR. Quack.', r: 0 }
      ]);
    } else if (F.falaInicio) DT.dialogo(F.falaInicio);
  };

  DT.gameOver = function () {
    if (DT.jogo.acabou) return;
    DT.jogo.acabou = true;
    DT.gameOverAtivo = true; DT.gameOverT = 0;
    if (window.DuckSom) { DuckSom.pararMusica(); DT.som('gameOver'); }
  };
  function continuar() {
    DT.gameOverAtivo = false;
    DT.comecarFase(DT.jogo.fase, true);
  }

  /* ---------- Laço ---------- */
  let ultimo = 0;
  function quadro(agora) {
    const dt = Math.min(0.05, (agora - ultimo) / 1000 || 0);
    ultimo = agora;
    DT.lerEntrada();
    atualizar(dt);
    desenhar();
    requestAnimationFrame(quadro);
  }

  function atualizar(dt) {
    tremorT = Math.max(0, tremorT - dt);
    if (tremorT > 0) { DT.tremorX = DT.aleat(-1, 1) * tremorForca; DT.tremorY = DT.aleat(-1, 1) * tremorForca; }
    else { DT.tremorX = DT.tremorY = 0; tremorForca = 0; }
    const cena = DT.cenaAtual;
    if (!cena) return;
    if (DT.gameOverAtivo) { DT.gameOverT += dt; if (DT.gameOverT > 1 && DT.ent.avancarP) continuar(); return; }
    if (DT.dlg) { DT.controlesAtivos = false; DT.atualizarDialogo(dt); if (!DT.dlg) DT.controlesAtivos = ehJogavel(DT.cenaAtual); return; }
    const jogavel = ehJogavel(cena);
    if (jogavel && DT.ent.pausaP) { DT.pausado = !DT.pausado; DT.som('clique'); if (window.DuckSom) DuckSom.setVolumeMusica(DT.pausado ? 0.12 : 0.35); }
    if (DT.pausado) { if (DT.ent.avancarP && !DT.ent.pausaP) { DT.pausado = false; if (window.DuckSom) DuckSom.setVolumeMusica(0.35); } return; }
    cena.atualizar(dt);
  }

  function desenhar() {
    const ctx = DT.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, DT.L, DT.A);
    if (DT.cenaAtual) DT.cenaAtual.desenhar(ctx);
    if (DT.dlg) DT.desenharDialogo(ctx);
    else if (DT.pausado) DT.desenharPausa(ctx);
    if (DT.gameOverAtivo) DT.desenharGameOver(ctx);
    else if (!DT.dlg && !DT.pausado) DT.desenharToque(ctx);
  }

  /* ---------- Sons em arquivo (sons/arquivos/*.m4a, gerados de audio/*.mp3 por ferramentas/comprimir-audio.ps1) ---------- */
  // no arquivo único eles vêm embutidos em DT_SONS (nome do arquivo -> data URL); o que faltar fica com o som de código
  DT.SONS_MUSICAS = ['fase1', 'fase2', 'fase3', 'fase4', 'fase5', 'chefe1', 'chefe2', 'chefe3', 'chefe4', 'chefe5',
    'minijogo', 'corrida', 'final'];
  // efeito do jogo -> [arquivo, volume]
  DT.SONS_EFEITOS = {
    pulo: ['pulo', 0.7], pouso: ['pouso', 0.6], troca: ['troca', 0.8], deslizar: ['agachar_deslizar', 0.8],
    emersonAtaque: ['emerson_ataque', 0.8], emersonEspecial: ['emerson_especial', 1], emersonDano: ['emerson_dano', 1],
    yasminAtaque: ['yasmin_ataque', 0.8], yasminEspecial: ['yasmin_especial', 1], yasminDano: ['yasmin_dano', 1],
    ginaLatido: ['gina_latido', 0.9], ginaSuperLatido: ['gina_super', 1], ginaDano: ['gina_dano', 1],
    apagado: ['inimigo_apagado', 0.8], frascoBum: ['explosao', 0.9], explosao: ['explosao', 1],
    chefeEntrada: ['chefe_entrada', 1], chefeRugido: ['chefe_rugido', 1], chefeFuria: ['chefe_furia', 1], chefeDerrota: ['chefe_derrota', 1],
    tigreRugido: ['tigre_rugido', 1], dragaoSopro: ['dragao_sopro', 0.8], demonioRisada: ['demonio_risada', 1],
    avisoTiro: ['aviso', 0.9], avisoBomba: ['aviso', 0.9], aviso: ['aviso', 0.9],
    quack: ['quack', 1], quackBravo: ['quack_bravo', 1], quackSurpreso: ['quack_surpreso', 1], quackEnvergonhado: ['quack_vergonha', 1],
    moeda: ['moeda', 0.7], carta: ['carta', 0.9], checkpoint: ['checkpoint', 0.9], bau: ['bau', 0.9], clique: ['clique', 0.6],
    cupom: ['cupom', 1], coracao: ['coracao', 0.9], powerup: ['powerup', 1], patinho: ['patinho', 1],
    tatuando: ['tatuando', 0.6, true], vitoria: ['vitoria', 1], gameOver: ['gameover', 1]
  };
  function registrarSons(embutidos) {
    const url = n => embutidos ? embutidos[n] : '../sons/arquivos/' + n + '.m4a';
    DT.SONS_MUSICAS.forEach(n => { if (url(n)) DuckSom.registrarArquivo(n, url(n)); });
    Object.keys(DT.SONS_EFEITOS).forEach(k => {
      const [arq, vol, continuo] = DT.SONS_EFEITOS[k];
      if (url(arq)) DuckSom.registrarEfeito(k, url(arq), vol, continuo);
    });
  }

  /* ---------- Início ---------- */
  async function iniciar() {
    const canvas = DT.canvas = document.getElementById('tela');
    DT.ctx = canvas.getContext('2d');
    DT.iniciarEntrada(canvas);
    const ctx = DT.ctx;
    const barra = p => {
      ctx.fillStyle = '#120d1c'; ctx.fillRect(0, 0, DT.L, DT.A);
      ctx.fillStyle = '#e0a826'; ctx.font = '16px ' + DT.FONTE; ctx.textAlign = 'center';
      ctx.fillText('CARREGANDO TINTA MÁGICA...', 480, 240);
      ctx.strokeStyle = '#e0a826'; ctx.lineWidth = 3; ctx.strokeRect(280, 280, 400, 26);
      ctx.fillStyle = '#8a3fe0'; ctx.fillRect(284, 284, 392 * p, 18);
    };
    try { await document.fonts.load('16px "Press Start 2P"'); } catch (_) { /* segue sem a fonte */ }
    barra(0);
    try {
      await DT.carregarTudo(barra);
    } catch (e) {
      console.error(e);
      ctx.fillStyle = '#120d1c'; ctx.fillRect(0, 0, DT.L, DT.A);
      ctx.fillStyle = '#e24b4a'; ctx.font = '14px ' + DT.FONTE; ctx.textAlign = 'center';
      ctx.fillText('NÃO CONSEGUI CARREGAR AS IMAGENS', 480, 230);
      ctx.fillStyle = '#f1efe8'; ctx.font = '10px ' + DT.FONTE;
      ctx.fillText(String(e.message || e).slice(0, 70), 480, 270);
      return;
    }
    // Músicas em arquivo (as demais continuam geradas por código)
    // no arquivo único (gerado por ferramentas/gerar-arquivo-unico.ps1) a música vem embutida em DT_MUSICAS
    const musicas = window.DT_MUSICAS || {};
    if (window.DuckSom) {
      DuckSom.registrarArquivo('titulo', musicas.titulo || '../sons/musicas/Joystick_Fever.mp3');
      registrarSons(window.DT_SONS);
    }
    DT.irPara('abertura');
    requestAnimationFrame(quadro);
  }
  if (document.readyState === 'complete') iniciar(); else window.addEventListener('load', iniciar);
})();
