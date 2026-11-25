/* DUCK TATTOO – INK ADVENTURE · base: recursos, desenho e entrada */
(function () {
  'use strict';
  const DT = window.DT = window.DT || {};
  DT.L = 960; DT.A = 540;

  /* ---------- Recursos ---------- */
  const BASE = '../arte/';
  DT.FOLHAS = {
    emerson: 'herois/emerson_sprites.webp',
    yasmin: 'herois/yasmin_sprites.webp',
    gina: 'herois/gina_sprites_v5_osso.webp',
    ag_emerson: 'herois/agachar/emerson_agachar.webp',
    ag_yasmin: 'herois/agachar/yasmin_agachar.webp',
    ag_gina: 'herois/agachar/gina_agachar.webp',
    inimigos: 'inimigos/inimigos_fase1_APROVADO.webp',
    chefe: 'chefes/maquina_gigante_APROVADO.webp',
    tiles: 'cenario/tileset_fase1.webp',
    pato: 'pato/pato_guia_sprites.webp',
    retratos: 'pato/pato_guia_retratos.webp',
    clientes: 'minijogo/clientes.webp',
    // Fase 2
    ini2: 'fase2/inimigos_fase2.webp',
    tiles2: 'fase2/tileset_fase2.webp',
    chefe2: 'fase2/chefe_caveirao_marinheiro.webp',
    andar2: 'fase2/chefe_caveirao_andar_APROVADO.webp',
    // Fase 3
    ini3: 'fase3/inimigos_fase3.webp',
    tiles3: 'fase3/tileset_fase3.webp',
    chao3: 'fase3/chao_fase3.webp',
    chefe3: 'fase3/chefe_tigre_neon.webp',
    corrida: 'fase3/corrida_obstaculos.webp',
    // Fase 4
    ini4: 'fase4/inimigos_fase4.webp',
    tiles4: 'fase4/tileset_fase4.webp',
    chao4: 'fase4/chao_fase4.webp',
    chefe4: 'fase4/chefe_dragao_tinta.webp',
    chuva: 'fase4/minijogo_chuva_itens.webp',
    pw: 'powerups/powerups.webp', // power-ups e patinho dourado secreto
    // Fase Final
    ini5: 'fase5/inimigos_fase5.webp',
    tiles5: 'fase5/tileset_fase5.webp',
    chao5: 'fase5/chao_fase5.webp',
    chefe5: 'fase5/chefe_demonio.webp'
  };
  DT.IMAGENS = {
    fundo: 'cenario/fundo_fase1.jpg', arena: 'cenario/arena_chefe_fase1.jpg',
    braco: 'minijogo/tela_braco_v2.webp', logo: 'logo/logo_oficial.webp',
    fundo2: 'fase2/fundo_fase2.webp', arena2: 'fase2/arena_chefe_fase2.webp', decalque: 'fase2/minijogo_decalque.webp',
    fundo3: 'fase3/fundo_fase3.webp', arena3: 'fase3/arena_chefe_fase3.webp', pista: 'fase3/corrida_pista_metro.webp',
    fundo4: 'fase4/fundo_fase4.webp', arena4: 'fase4/arena_chefe_fase4.webp', oficina: 'fase4/minijogo_chuva_fundo.webp',
    // história de abertura (6 quadrinhos em tela cheia)
    hq1: 'historia/q1_sexta_noite.webp', hq2: 'historia/q2_encomenda.webp', hq3: 'historia/q3_splash.webp',
    hq4: 'historia/q4_pato_acorda.webp', hq5: 'historia/q5_fuga.webp', hq6: 'historia/q6_final.webp',
    fundo5: 'fase5/fundo_fase5.webp', arena5: 'fase5/arena_chefe_fase5.webp', lendaria: 'fase5/minijogo_lendaria.webp',
    fim1: 'historia/final1_vitoria.webp', fim2: 'historia/final2_comemoracao.webp', fim3: 'historia/final3_clientes.webp'
  };
  DT.F = {}; DT.CX = {}; DT.IM = {};
  const cache = {};

  // Usa as imagens embutidas (js/imagens.js) quando existem: assim o jogo abre até com dois cliques (file://).
  const fonte = f => (window.DT_IMAGENS && window.DT_IMAGENS[f]) || (BASE + f);
  // arquivo de teste de uma fase (gerado com -Fase N): só traz as imagens dessa fase
  DT.FASE_TESTE = window.DT_FASE_TESTE || 0;
  const existe = ([, f]) => !DT.FASE_TESTE || !window.DT_IMAGENS || !!window.DT_IMAGENS[f];
  DT.carregarTudo = async function (progresso) {
    const imgs = Object.entries(DT.IMAGENS).filter(existe), folhas = Object.entries(DT.FOLHAS).filter(existe);
    const total = imgs.length + folhas.length;
    let n = 0;
    for (const [k, f] of imgs) { DT.IM[k] = await Sprites.carregar(fonte(f)); progresso(++n / total); }
    for (const [k, f] of folhas) {
      DT.F[k] = await Sprites.carregar(fonte(f));
      DT.CX[k] = Sprites.componentes(DT.F[k], { juntar: 3 });
      progresso(++n / total);
      await new Promise(r => setTimeout(r, 0));
    }
  };

  DT.spr = function (folha, i, filtro) {
    const k = folha + ':' + i + ':' + (filtro || '');
    let c = cache[k];
    if (!c) {
      const caixa = DT.CX[folha] && DT.CX[folha][i];
      if (!caixa) {
        console.warn('Sprite inexistente:', folha, i);
        c = document.createElement('canvas'); c.width = c.height = 1;
      } else {
        c = Sprites.recortar(DT.F[folha], caixa, { tirarBranco: folha === 'tiles' });
        if (filtro) {
          const f = document.createElement('canvas');
          f.width = c.width; f.height = c.height;
          const x = f.getContext('2d'); x.filter = filtro; x.drawImage(c, 0, 0);
          c = f;
        }
      }
      cache[k] = c;
    }
    return c;
  };
  DT.caixaFrame = (folha, i) => DT.CX[folha][i] || { w: 1, h: 1 };

  // Desenha com o centro do corpo em x e os pés em "pe". o.ref = largura do corpo (ancora à esquerda do corpo).
  DT.desenhar = function (ctx, folha, i, x, pe, escala, virar, o) {
    o = o || {};
    const s = DT.spr(folha, i, o.filtro);
    const w = s.width * escala, h = s.height * escala;
    const dx = o.ref ? -o.ref * escala / 2 : -w / 2;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.translate(Math.round(x), Math.round(pe));
    if (virar) ctx.scale(-1, 1);
    ctx.drawImage(s, dx, -h, w, h);
    ctx.restore();
    return w;
  };
  // Desenha pela altura desejada
  DT.desenharAltura = function (ctx, folha, i, x, pe, altura, virar, o) {
    const s = DT.spr(folha, i, o && o.filtro);
    return DT.desenhar(ctx, folha, i, x, pe, altura / s.height, virar, o);
  };

  /* ---------- Utilidades de desenho ---------- */
  DT.FONTE = '"Press Start 2P", monospace';
  DT.texto = function (ctx, t, x, y, tam, cor, alinhar, sombra) {
    ctx.font = tam + 'px ' + DT.FONTE;
    ctx.textAlign = alinhar || 'left'; ctx.textBaseline = 'top';
    if (sombra !== false) { ctx.fillStyle = '#000'; ctx.fillText(t, x + 2, y + 2); }
    ctx.fillStyle = cor; ctx.fillText(t, x, y);
  };
  DT.caixa = function (ctx, x, y, w, h, fundo, borda) {
    ctx.fillStyle = fundo; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = borda; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  };
  const MAPA_CORACAO = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  DT.coracao = function (ctx, x, y, s, cheio) {
    MAPA_CORACAO.forEach((l, r) => [...l].forEach((c, k) => {
      if (c === '1') { ctx.fillStyle = '#000'; ctx.fillRect(x + k * s, y + r * s, s + 1, s + 1); }
    }));
    MAPA_CORACAO.forEach((l, r) => [...l].forEach((c, k) => {
      if (c === '1') {
        ctx.fillStyle = cheio ? (r === 1 && k === 1 ? '#ff9a9a' : '#e24b4a') : '#3a2a3a';
        ctx.fillRect(x + k * s + 1, y + r * s + 1, s - 1, s - 1);
      }
    }));
  };
  DT.quebrarTexto = function (t, max) {
    const palavras = t.split(' '), linhas = [];
    let atual = '';
    palavras.forEach(p => {
      if ((atual + ' ' + p).trim().length > max) { linhas.push(atual.trim()); atual = p; }
      else atual += ' ' + p;
    });
    if (atual.trim()) linhas.push(atual.trim());
    return linhas;
  };

  /* ---------- Utilidades gerais ---------- */
  DT.sobrepoe = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  DT.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  DT.aleat = (a, b) => a + Math.random() * (b - a);
  DT.som = function (nome) { if (window.DuckSom && DuckSom.sfx[nome]) DuckSom.sfx[nome](); };

  // Partículas e textos flutuantes (compartilhados pelas cenas)
  DT.particulas = [];
  DT.textos = [];
  DT.respingo = function (x, y, cor, n, forca) {
    for (let i = 0; i < (n || 10); i++) {
      const a = Math.random() * Math.PI * 2, v = DT.aleat(60, forca || 260);
      DT.particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, vida: DT.aleat(0.35, 0.8), cor, tam: DT.aleat(3, 7) });
    }
  };
  DT.textoFlutuante = function (x, y, t, cor, tam) { DT.textos.push({ x, y, t, cor: cor || '#fac775', vida: 1.1, tam: tam || 12 }); };
  DT.atualizarEfeitos = function (dt) {
    DT.particulas.forEach(p => { p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt; });
    DT.particulas = DT.particulas.filter(p => p.vida > 0);
    DT.textos.forEach(t => { t.y -= 40 * dt; t.vida -= dt; });
    DT.textos = DT.textos.filter(t => t.vida > 0);
  };
  DT.desenharEfeitos = function (ctx) {
    DT.particulas.forEach(p => {
      ctx.globalAlpha = Math.min(1, p.vida * 2);
      ctx.fillStyle = '#000'; ctx.fillRect(p.x - 1, p.y - 1, p.tam + 2, p.tam + 2);
      ctx.fillStyle = p.cor; ctx.fillRect(p.x, p.y, p.tam, p.tam);
    });
    ctx.globalAlpha = 1;
    DT.textos.forEach(t => {
      ctx.globalAlpha = Math.min(1, t.vida * 2);
      DT.texto(ctx, t.t, t.x, t.y, t.tam, t.cor, 'center');
    });
    ctx.globalAlpha = 1;
  };

  /* ---------- Entrada: teclado e toque ---------- */
  const teclas = {};
  const apertadas = new Set(); // guarda toques rápidos (aperta e solta antes do próximo quadro)
  const BLOQUEAR = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
  const digitando = e => e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
  addEventListener('keydown', e => {
    if (digitando(e)) { if (e.code === 'Enter' || e.code === 'NumpadEnter') { teclas.Enter = true; apertadas.add('Enter'); } return; } // campos de texto: deixa digitar espaço e setas
    if (BLOQUEAR.includes(e.code)) e.preventDefault(); teclas[e.code] = true; apertadas.add(e.code);
  });
  addEventListener('keyup', e => { teclas[e.code] = false; if (e.code === 'NumpadEnter') teclas.Enter = false; });
  addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; });

  const ponteiros = new Map();
  DT.ponteiro = { x: 0, y: 0, down: false };
  DT.usandoToque = false;
  DT.controlesAtivos = false;
  // Andar e agachar no celular: joystick flutuante, que nasce onde o polegar tocar na metade esquerda da tela
  DT.JOY = { raio: 56, zona: 0.5, morta: 16 };
  DT.joy = null; // { id, ox, oy, x, y }
  DT.BOTOES = [
    { id: 'pulo', tipo: 'circ', x: 872, y: 456, r: 52, rot: 'PULO', cor: '#9fe1cb' },
    { id: 'atk', tipo: 'circ', x: 758, y: 480, r: 40, rot: 'ATK', cor: '#ff5fb0' },
    { id: 'esp', tipo: 'circ', x: 786, y: 378, r: 34, rot: 'ESP', cor: '#c79bff' },
    { id: 'troca', tipo: 'circ', x: 894, y: 334, r: 30, rot: 'TROCA', cor: '#e0a826' },
    { id: 'pausa', tipo: 'circ', x: 928, y: 94, r: 22, rot: 'II', cor: '#f1efe8' }
  ];
  function dentro(b, x, y) {
    if (b.tipo === 'ret') return x >= b.x - 10 && x <= b.x + b.w + 10 && y >= b.y - 14 && y <= b.y + b.h + 14;
    const dx = x - b.x, dy = y - b.y;
    return dx * dx + dy * dy <= (b.r + 14) * (b.r + 14);
  }
  function coords(e) {
    const r = DT.canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * DT.L / r.width, y: (e.clientY - r.top) * DT.A / r.height };
  }
  // Celular: tela cheia (esconde a barra do navegador) e deitado. Pedido em TODO toque enquanto não estiver em
  // tela cheia, para voltar sozinho depois do teclado ou do WhatsApp. O navegador só aceita dentro do toque.
  // (No iPhone o Safari não permite tela cheia para sites: lá o jogo só se ajusta ao espaço visível.)
  DT.pedirTelaCheia = function () {
    const el = document.documentElement, pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!pedir || document.fullscreenElement || document.webkitFullscreenElement) return;
    try {
      const p = pedir.call(el, { navigationUI: 'hide' });
      if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (_) { /* sem suporte */ } }).catch(() => {});
    } catch (_) { /* sem suporte */ }
  };
  addEventListener('touchend', e => {
    const alvo = e.target && e.target.tagName;
    if (alvo !== 'INPUT' && alvo !== 'TEXTAREA') DT.pedirTelaCheia(); // não atrapalha quem está digitando
  }, { passive: true });

  DT.iniciarEntrada = function (canvas) {
    canvas.addEventListener('pointerdown', e => {
      const p = coords(e);
      if (e.pointerType === 'touch') DT.usandoToque = true;
      ponteiros.set(e.pointerId, { x: p.x, y: p.y, tipo: e.pointerType });
      DT.ponteiro.x = p.x; DT.ponteiro.y = p.y; DT.ponteiro.down = true;
      // toque na metade esquerda (fora dos botões) cria o joystick ali mesmo
      if (e.pointerType === 'touch' && DT.controlesAtivos && !DT.joy && p.x < DT.L * DT.JOY.zona && !DT.BOTOES.some(b => dentro(b, p.x, p.y)))
        DT.joy = { id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y };
      else DT.cliqueNovo = true;
      if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignora */ } }
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', e => {
      const p = coords(e);
      if (ponteiros.has(e.pointerId)) ponteiros.set(e.pointerId, { x: p.x, y: p.y, tipo: e.pointerType });
      DT.ponteiro.x = p.x; DT.ponteiro.y = p.y;
      const J = DT.joy;
      if (J && J.id === e.pointerId) {
        J.x = p.x; J.y = p.y;
        // se o polegar passar do limite, a base acompanha (não perde o controle)
        const dx = J.x - J.ox, dy = J.y - J.oy, d = Math.hypot(dx, dy), R = DT.JOY.raio * 1.4;
        if (d > R) { J.ox = J.x - dx * R / d; J.oy = J.y - dy * R / d; }
      }
    });
    const fim = e => {
      ponteiros.delete(e.pointerId); if (ponteiros.size === 0) DT.ponteiro.down = false;
      if (DT.joy && DT.joy.id === e.pointerId) DT.joy = null;
    };
    canvas.addEventListener('pointerup', fim);
    canvas.addEventListener('pointercancel', fim);
  };

  const anterior = {};
  DT.ent = {};
  DT.lerEntrada = function () {
    const t = {};
    if (DT.usandoToque && DT.controlesAtivos) {
      for (const p of ponteiros.values()) {
        if (p.tipo !== 'touch') continue;
        if (DT.joy && ponteiros.get(DT.joy.id) === p) continue; // o dedo do joystick não aperta botões
        for (const b of DT.BOTOES) if (dentro(b, p.x, p.y)) t[b.id] = true;
      }
      const J = DT.joy;
      if (J) {
        const dx = J.x - J.ox, dy = J.y - J.oy, m = DT.JOY.morta;
        t.esq = dx < -m; t.dir = dx > m;
        t.baixo = dy > m * 1.8 && dy > Math.abs(dx) * 0.7; // puxar para baixo agacha (e desliza correndo)
      }
    } else if (!DT.controlesAtivos) DT.joy = null;
    const k = Object.assign({}, teclas);
    apertadas.forEach(c => { k[c] = true; });
    apertadas.clear();
    const atual = {
      cima: k.ArrowUp || k.KeyW, baixo: k.ArrowDown || k.KeyS || t.baixo,
      esq: k.ArrowLeft || k.KeyA || t.esq,
      dir: k.ArrowRight || k.KeyD || t.dir,
      pulo: k.Space || k.ArrowUp || k.KeyW || k.KeyZ || t.pulo,
      atk: k.KeyX || k.KeyJ || t.atk,
      esp: k.KeyC || k.KeyK || t.esp,
      troca: k.KeyQ || k.KeyL || t.troca,
      pausa: k.KeyP || k.Escape || t.pausa,
      ok: k.Enter || k.Space || k.KeyX || k.KeyJ
    };
    for (const n in atual) {
      DT.ent[n] = !!atual[n];
      DT.ent[n + 'P'] = !!atual[n] && !anterior[n];
      anterior[n] = !!atual[n];
    }
    // Toque fora dos botões conta como "ok" (avançar diálogos e telas)
    DT.ent.cliqueP = !!DT.cliqueNovo;
    if (DT.cliqueNovo && DT.controlesAtivos && DT.usandoToque) {
      const emBotao = DT.BOTOES.some(b => dentro(b, DT.ponteiro.x, DT.ponteiro.y));
      if (emBotao) DT.ent.cliqueP = false;
    }
    DT.cliqueNovo = false;
    DT.ent.avancarP = DT.ent.okP || DT.ent.cliqueP;
  };
  DT.botaoTocado = function (id) {
    const b = DT.BOTOES.find(x => x.id === id);
    for (const p of ponteiros.values()) if (dentro(b, p.x, p.y)) return true;
    return false;
  };
})();
