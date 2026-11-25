/* Interface: HUD, diálogos, banner, controles de toque e telas */
(function () {
  'use strict';
  const DT = window.DT;
  DT.CUPOM = 'DUCKINK10';

  /* ---------- HUD ---------- */
  DT.desenharHUD = function (ctx) {
    const J = DT.jogo, k = J.ativo;
    ctx.fillStyle = 'rgba(10,6,18,0.8)'; ctx.fillRect(0, 0, DT.L, 58);
    ctx.fillStyle = '#e0a826'; ctx.fillRect(0, 58, DT.L, 2);
    // vidas (cabeças do pato) e energia (corações): da equipe toda
    DT.texto(ctx, 'VIDAS', 12, 6, 7, '#b9acd0', 'left', false);
    const nVidas = Math.max(DT.VIDAS_INICIAIS, J.vidas);
    for (let i = 0; i < nVidas; i++) DT.cabecaVida(ctx, 10 + i * 30, 18, i < J.vidas);
    const xe = 22 + nVidas * 30;
    DT.texto(ctx, 'ENERGIA', xe, 6, 7, '#b9acd0', 'left', false);
    for (let i = 0; i < DT.ENERGIA_MAX; i++) DT.coracao(ctx, xe + i * 32, 24, 4, i < J.energia);
    const xt = xe + 110;
    DT.texto(ctx, 'TINTA', xt, 12, 8, '#cecbf6');
    DT.caixa(ctx, xt, 26, 104, 16, '#2a1f3d', '#000');
    ctx.fillStyle = J.tinta >= 0.5 ? '#a98bff' : '#5c4a8a'; ctx.fillRect(xt + 3, 29, 98 * J.tinta, 10);
    ctx.fillStyle = '#000'; ctx.fillRect(xt + 52, 26, 2, 16);
    DT.desenharAltura(ctx, 'tiles', 23, xt + 134, 44, 30, false);
    DT.texto(ctx, 'x' + J.moedas, xt + 152, 22, 13, '#fac775');
    DT.texto(ctx, 'CARTAS', 538, 12, 8, '#f4c0d1');
    DT.texto(ctx, DT.faseAtual().cartas.filter(k => J.cartas.includes(k)).length + '/6', 538, 26, 14, '#f4c0d1');
    DT.ORDEM_HEROIS.forEach((h, i) => {
      const x = 630 + i * 52, ativo = h === k;
      DT.caixa(ctx, x, 6, 46, 46, ativo ? '#3f6b3a' : '#2a1f3d', ativo ? '#e0a826' : '#4a3866');
      ctx.save(); ctx.beginPath(); ctx.rect(x + 3, 9, 40, 40); ctx.clip();
      const f = DT.HEROIS[h].anims.parado[0][0];
      DT.desenharAltura(ctx, h, f, x + 23, h === 'gina' ? 50 : 76, h === 'gina' ? 36 : 66, false);
      ctx.restore();
    });
    DT.texto(ctx, 'SCORE', 806, 12, 8, '#b9acd0');
    DT.texto(ctx, String(J.pontos).padStart(6, '0'), 806, 26, 14, '#f1efe8');
    // tempo do power-up ativo
    if (J.poder && J.poder.t > 0) {
      const P = DT.PODERES[J.poder.tipo];
      DT.caixa(ctx, 330, 66, 300, 34, 'rgba(10,6,18,0.9)', P.cor);
      DT.desenharAltura(ctx, 'pw', P.frames[0], 352, 96, 26, false);
      DT.texto(ctx, P.nome, 372, 74, 8, P.cor, 'left', false);
      DT.caixa(ctx, 372, 86, 246, 10, '#2a1f3d', '#000');
      ctx.fillStyle = P.cor; ctx.fillRect(374, 88, 242 * DT.clamp(J.poder.t / DT.PODER_SEG, 0, 1), 6);
    }
    if (DT.banner) desenharBanner(ctx);
  };
  DT.cabecaVida = function (ctx, x, y, cheia) {
    const r = DT.spr('retratos', 0), h = 30;
    ctx.save(); ctx.globalAlpha = cheia ? 1 : 0.22; ctx.imageSmoothingEnabled = true;
    ctx.drawImage(r, x, y, r.width * h / r.height, h);
    ctx.restore();
  };

  /* ---------- Banner (nova carta, baú) ---------- */
  DT.mostrarBanner = function (titulo, icone, sub) { DT.banner = { titulo, icone, sub, t: 2.8 }; };
  function desenharBanner(ctx) {
    const b = DT.banner;
    b.t -= 1 / 60;
    if (b.t <= 0) { DT.banner = null; return; }
    const y = 72 + (b.t > 2.5 ? (b.t - 2.5) * -200 : 0);
    ctx.globalAlpha = Math.min(1, b.t * 3);
    DT.caixa(ctx, 230, y, 500, 60, 'rgba(18,12,30,0.94)', '#e0a826');
    if (b.icone != null) DT.desenharAltura(ctx, b.icone[0], b.icone[1], 270, y + 54, 46, false);
    DT.texto(ctx, b.titulo, b.icone != null ? 304 : 480, y + 14, 10, '#fac775', b.icone != null ? 'left' : 'center', false);
    DT.texto(ctx, b.sub, b.icone != null ? 304 : 480, y + 36, 8, '#f4c0d1', b.icone != null ? 'left' : 'center', false);
    ctx.globalAlpha = 1;
  }

  /* ---------- Diálogo com o Duckzinho (o pato guia) ---------- */
  DT.dialogo = function (linhas, aoFim) {
    DT.dlg = { linhas, i: 0, chars: 0, aoFim };
    falar(linhas[0].r);
  };
  function falar(r) { DT.som(['quack', 'quack', 'quackBravo', 'quackEnvergonhado'][r] || 'quack'); }
  DT.atualizarDialogo = function (dt) {
    const d = DT.dlg, l = d.linhas[d.i];
    d.chars = Math.min(l.t.length, d.chars + dt * 45);
    if (DT.ent.avancarP || DT.ent.puloP) {
      if (d.chars < l.t.length) d.chars = l.t.length;
      else if (d.i < d.linhas.length - 1) { d.i++; d.chars = 0; falar(d.linhas[d.i].r); }
      else { DT.dlg = null; DT.som('clique'); if (d.aoFim) d.aoFim(); }
    }
  };
  DT.desenharDialogo = function (ctx) {
    const d = DT.dlg, l = d.linhas[d.i];
    const y = 72;
    DT.caixa(ctx, 100, y, 760, 116, 'rgba(18,12,30,0.95)', '#e0a826');
    const r = DT.spr('retratos', l.r || 0), rh = 96;
    ctx.drawImage(r, 112, y + 10, r.width * rh / r.height, rh);
    DT.texto(ctx, 'DUCKZINHO', 248, y + 16, 10, '#e0a826', 'left', false);
    const vis = l.t.slice(0, Math.floor(d.chars));
    DT.quebrarTexto(vis, 40).forEach((linha, i) => DT.texto(ctx, linha, 248, y + 40 + i * 20, 11, '#f1efe8', 'left', false));
    if (d.chars >= l.t.length && Math.floor(performance.now() / 400) % 2) DT.texto(ctx, '▼', 836, y + 94, 10, '#e0a826', 'center', false);
  };

  /* ---------- Controles de toque ---------- */
  DT.desenharToque = function (ctx) {
    if (!DT.usandoToque || !DT.controlesAtivos) return;
    // joystick flutuante: aparece onde o polegar tocou; parado, fica só uma dica apagada no canto
    const J = DT.joy, R = DT.JOY.raio;
    const ox = J ? J.ox : 120, oy = J ? J.oy : 430;
    let nx = ox, ny = oy;
    if (J) { const dx = J.x - J.ox, dy = J.y - J.oy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, R / d); nx = ox + dx * k; ny = oy + dy * k; }
    ctx.save();
    ctx.globalAlpha = J ? 0.75 : 0.3;
    ctx.fillStyle = '#1a1426'; ctx.strokeStyle = '#9fe1cb'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(ox, oy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9fe1cb';
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([a, b]) => { // setinhas na borda
      const tx = ox + a * (R - 8), ty = oy + b * (R - 8), bx = ox + a * (R - 20), by = oy + b * (R - 20);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx - b * 7, by + a * 7); ctx.lineTo(bx + b * 7, by - a * 7); ctx.fill();
    });
    ctx.globalAlpha = J ? 0.95 : 0.4;
    ctx.beginPath(); ctx.arc(nx, ny, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0b2a22'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    DT.BOTOES.forEach(b => {
      const apertado = DT.botaoTocado(b.id);
      ctx.save();
      ctx.globalAlpha = apertado ? 0.9 : 0.55;
      ctx.fillStyle = apertado ? '#3a2a52' : '#1a1426';
      ctx.strokeStyle = b.cor || '#f1efe8'; ctx.lineWidth = 3;
      if (b.tipo === 'ret') { ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeRect(b.x, b.y, b.w, b.h); }
      else { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      ctx.globalAlpha = 1;
      const cx = b.tipo === 'ret' ? b.x + b.w / 2 : b.x, cy = b.tipo === 'ret' ? b.y + b.h / 2 : b.y;
      const tam = b.rot.length > 3 ? 8 : 12;
      DT.texto(ctx, b.rot, cx, cy - tam / 2, tam, b.cor || '#f1efe8', 'center', false);
      ctx.restore();
    });
  };

  /* ---------- Logo no selo (centralizada pelo desenho, não pela imagem) ---------- */
  let caixaLogo = null;
  function medirLogo() {
    const L = DT.IM.logo, c = document.createElement('canvas');
    c.width = L.naturalWidth; c.height = L.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(L, 0, 0);
    let d;
    try { d = x.getImageData(0, 0, c.width, c.height).data; } catch (_) { return { x: 0, y: 0, w: c.width, h: c.height }; }
    const conteudo = (px, py) => { const i = (py * c.width + px) * 4; return d[i + 3] > 60 && !(d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235); };
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let py = 0; py < c.height; py += 2) for (let px = 0; px < c.width; px += 2) {
      if (conteudo(px, py)) { if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
    }
    // centro do texto "DUCK" (faixa de cima): é ele que o olho usa como eixo da logo
    let tx0 = c.width, tx1 = 0;
    const fimTexto = y0 + (y1 - y0) * 0.18;
    for (let py = y0; py < fimTexto; py += 2) for (let px = x0; px <= x1; px += 2) {
      if (conteudo(px, py)) { if (px < tx0) tx0 = px; if (px > tx1) tx1 = px; }
    }
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, cxTexto: tx1 > tx0 ? (tx0 + tx1) / 2 : (x0 + x1) / 2 };
  }
  DT.desenharLogoSelo = function (ctx, cx, cy, raio) {
    if (!caixaLogo) caixaLogo = medirLogo();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, raio + 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f3ead3'; ctx.beginPath(); ctx.arc(cx, cy, raio, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e0a826'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, raio - 8, 0, Math.PI * 2); ctx.stroke();
    const b = caixaLogo, cabe = (raio - 16) * 2;
    const s = Math.min(cabe / b.w, cabe / b.h) * 0.94;
    const w = b.w * s, h = b.h * s;
    const esq = cx - (b.cxTexto - b.x) * s; // alinha o texto ao centro do selo
    ctx.save(); ctx.imageSmoothingEnabled = true;
    ctx.beginPath(); ctx.arc(cx, cy, raio - 10, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(DT.IM.logo, b.x, b.y, b.w, b.h, esq, cy - h / 2, w, h);
    ctx.restore();
  };

  /* ---------- Abertura (libera o som do navegador) ---------- */
  DT.Abertura = {
    nome: 'abertura',
    iniciar() { this.t = 0; DT.controlesAtivos = false; },
    atualizar(dt) {
      this.t += dt;
      if (DT.ent.avancarP || DT.ent.puloP) {
        if (window.DuckSom) DuckSom.init();
        if (DT.usandoToque) DT.pedirTelaCheia();
        DT.irPara('titulo');
      }
    },
    desenhar(ctx) {
      ctx.fillStyle = '#120d1c'; ctx.fillRect(0, 0, DT.L, DT.A);
      DT.desenharLogoSelo(ctx, 480, 220, 130);
      if (Math.floor(this.t * 2) % 2 === 0) {
        DT.texto(ctx, DT.usandoToque ? 'TOQUE PARA LIGAR' : 'APERTE ENTER OU CLIQUE', 480, 400, 14, '#ff5fb0', 'center');
      }
      DT.texto(ctx, '♪ COM SOM', 480, 436, 9, '#b9acd0', 'center', false);
    }
  };

  /* ---------- Tela de título ---------- */
  function fundoEstudio(ctx, t, escuro) {
    const fw = DT.IM.fundo.naturalWidth * DT.A / DT.IM.fundo.naturalHeight, par = (t * 20) % fw;
    ctx.drawImage(DT.IM.fundo, -par, 0, fw, DT.A); ctx.drawImage(DT.IM.fundo, fw - par, 0, fw, DT.A);
    ctx.fillStyle = 'rgba(16,8,28,' + escuro + ')'; ctx.fillRect(0, 0, DT.L, DT.A);
  }
  function chaoMadeira(ctx) {
    const piso = DT.spr('tiles', 1), ph = 72, pw = piso.width * ph / piso.height;
    for (let x = 0; x < DT.L; x += pw - 1) ctx.drawImage(piso, x, 466, pw, ph);
  }
  const dentroRet = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

  /* ---------- Tela de título: JOGAR / COMO JOGAR ---------- */
  const BOTOES_TITULO = [
    { id: 'jogar', rot: 'JOGAR', x: 340, y: 322, w: 280, h: 50 },
    { id: 'como', rot: 'COMO JOGAR', x: 340, y: 384, w: 280, h: 50 }
  ];
  DT.Titulo = {
    nome: 'titulo',
    iniciar() { this.t = 0; this.sel = this.sel || 0; DT.controlesAtivos = false; },
    atualizar(dt) {
      this.t += dt;
      const E = DT.ent, P = DT.ponteiro;
      if (E.cimaP || E.baixoP) { this.sel = 1 - this.sel; DT.som('clique'); }
      BOTOES_TITULO.forEach((b, i) => { if (dentroRet(b, P.x, P.y)) this.sel = i; });
      let escolher = E.okP;
      if (E.cliqueP) {
        const i = BOTOES_TITULO.findIndex(b => dentroRet(b, P.x, P.y));
        if (i >= 0) { this.sel = i; escolher = true; }
      }
      if (escolher && this.t > 0.2) {
        if (window.DuckSom) DuckSom.init();
        DT.som('clique');
        if (this.sel === 0 && DT.FASE_TESTE) DT.novoJogo(); // arquivo de teste: vai direto para a fase
        else DT.irPara(this.sel === 0 ? 'cadastro' : 'comoJogar');
      }
    },
    desenhar(ctx) {
      const t = this.t;
      fundoEstudio(ctx, t, 0.62);
      DT.desenharLogoSelo(ctx, 480, 140, 120);
      DT.texto(ctx, 'INK ADVENTURE', 480, 274, 28, '#e0a826', 'center');
      if (DT.FASE_TESTE) DT.texto(ctx, 'TESTE · FASE ' + (DT.FASE_TESTE === 5 ? 'FINAL' : DT.FASE_TESTE), 480, 300, 10, '#9fe1cb', 'center');
      BOTOES_TITULO.forEach((b, i) => {
        const sel = i === this.sel;
        DT.caixa(ctx, b.x, b.y, b.w, b.h, sel ? '#3f6b3a' : 'rgba(18,12,30,0.92)', sel ? '#e0a826' : '#4a3866');
        DT.texto(ctx, (sel ? '> ' : '') + b.rot, b.x + b.w / 2, b.y + b.h / 2 - 8, 16, sel ? '#fac775' : '#f1efe8', 'center');
      });
      chaoMadeira(ctx);
      DT.desenharAltura(ctx, 'emerson', 0, 150, 472, 110, false);
      DT.desenharAltura(ctx, 'yasmin', [0, 1][Math.floor(t * 2) % 2], 232, 472, 114, false);
      DT.desenharAltura(ctx, 'gina', [0, 1, 2, 3, 4, 5, 6][Math.floor(t * 6) % 7], 760, 472, 70, true);
      DT.desenharAltura(ctx, 'pato', [0, 1, 2, 3][Math.floor(t * 3) % 4], 840, 472, 96, true);
      DT.texto(ctx, DT.usandoToque ? 'TOQUE NUM BOTÃO' : 'SETAS ESCOLHEM   ENTER CONFIRMA', 480, 500, 9, '#b9acd0', 'center', false);
      DT.texto(ctx, 'DEMO · FASES 1 E 2', 16, 522, 7, '#b9acd0', 'left', false);
    }
  };

  /* ---------- Como Jogar ---------- */
  DT.ComoJogar = {
    nome: 'comoJogar',
    iniciar() { this.t = 0; DT.controlesAtivos = false; },
    atualizar(dt) {
      this.t += dt;
      if (this.t > 0.3 && (DT.ent.avancarP || DT.ent.pausaP || DT.ent.puloP)) { DT.som('clique'); DT.irPara('titulo'); }
    },
    desenhar(ctx) {
      const T = DT.texto, C = DT.caixa, c = ctx;
      fundoEstudio(c, this.t, 0.86);
      T(c, 'COMO JOGAR', 480, 18, 22, '#e0a826', 'center');
      C(c, 30, 64, 440, 300, 'rgba(18,12,30,0.95)', '#4a3866'); T(c, 'TECLADO (PC)', 250, 78, 11, '#ff5fb0', 'center', false);
      const tecla = (x, y, w, rot) => { C(c, x, y, w, 34, '#2a1f3d', '#f1efe8'); T(c, rot, x + w / 2, y + 12, 9, '#f1efe8', 'center', false); };
      const linhas = [[['<', '>'], 'ANDAR'], [['ESPAÇO'], 'PULAR'], [['▼'], 'AGACHAR / DESLIZAR'], [['X'], 'ATACAR'], [['C'], 'ESPECIAL'], [['Q'], 'TROCAR HERÓI'], [['P'], 'PAUSA']];
      linhas.forEach(([ts, txt], i) => {
        let x = 56; const y = 100 + i * 37;
        ts.forEach(t => { const w = t.length > 2 ? 96 : 40; tecla(x, y, w, t); x += w + 8; });
        T(c, txt, 250, y + 12, 10, '#fac775', 'left', false);
      });
      C(c, 490, 64, 440, 300, 'rgba(18,12,30,0.95)', '#4a3866'); T(c, 'CELULAR', 710, 78, 11, '#ff5fb0', 'center', false);
      const circ = (x, y, r, rot, cor) => {
        c.fillStyle = '#1a1426'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
        c.strokeStyle = cor; c.lineWidth = 3; c.stroke(); T(c, rot, x, y - 5, rot.length > 3 ? 7 : 10, cor, 'center', false);
      };
      // joystick flutuante
      c.fillStyle = '#1a1426'; c.strokeStyle = '#9fe1cb'; c.lineWidth = 3;
      c.beginPath(); c.arc(580, 200, 44, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#9fe1cb'; c.beginPath(); c.arc(592 + Math.sin(this.t * 2) * 14, 206, 20, 0, Math.PI * 2); c.fill();
      T(c, 'JOYSTICK', 580, 112, 8, '#fac775', 'center', false);
      T(c, 'toque na metade', 580, 128, 7, '#f1efe8', 'center', false);
      T(c, 'esquerda e arraste', 580, 140, 7, '#f1efe8', 'center', false);
      T(c, '< > andar · ▼ agachar', 580, 256, 7, '#9fe1cb', 'center', false);
      circ(860, 290, 34, 'PULO', '#9fe1cb'); circ(780, 304, 28, 'ATK', '#ff5fb0'); circ(800, 226, 24, 'ESP', '#c79bff');
      circ(880, 200, 22, 'TROCA', '#e0a826'); circ(900, 120, 16, 'II', '#f1efe8');
      T(c, 'Gire o celular e jogue deitado', 710, 340, 8, '#b9acd0', 'center', false);
      C(c, 30, 378, 900, 128, 'rgba(18,12,30,0.95)', '#4a3866'); T(c, 'A EQUIPE · 3 VIDAS COMPARTILHADAS', 480, 390, 10, '#ff5fb0', 'center', false);
      [['emerson', 'EMERSON', 'Tiro de nanquim forte', 'mas mais lento'], ['yasmin', 'YASMIN', 'Tiro azul rápido,', 'especial em leque'],
        ['gina', 'GINA', 'Latido de perto, pula alto', 'e passa por vãos baixos']].forEach(([k, n, a, b], i) => {
        const x = 60 + i * 300;
        DT.desenharAltura(c, k, DT.HEROIS[k].anims.parado[0][0], x + 30, 498, k === 'gina' ? 50 : 86, false);
        T(c, n, x + 76, 424, 10, '#e0a826', 'left', false); T(c, a, x + 76, 448, 7, '#f1efe8', 'left', false); T(c, b, x + 76, 464, 7, '#f1efe8', 'left', false);
      });
      if (Math.floor(this.t * 2) % 2 === 0) T(c, (DT.usandoToque ? 'TOQUE' : 'ENTER') + ' PARA VOLTAR', 480, 518, 9, '#ff5fb0', 'center', false);
    }
  };

  /* ---------- História em quadrinhos (ao apertar JOGAR): um quadrinho por tela, com balões ---------- */
  // balão: [x, y, largura, nome, fala, ponta x, ponta y, estilo]
  const QUADRINHOS = [
    { img: 'hq1', bal: [[410, 24, 300, 'YASMIN', 'Último cliente foi. Bora pra casa?', 600, 150]] },
    { img: 'hq2', bal: [[40, 24, 290, 'EMERSON', 'Relaxa. É só tinta.', 255, 175]] },
    { img: 'hq3', bal: [[560, 24, 150, 'GINA', 'AU!', 690, 150]], tremer: true },
    { img: 'hq4', bal: [[30, 24, 440, 'DUCKZINHO', 'Dez anos parado como enfeite nesse balcão... e a primeira coisa que eu vejo é ISSO?', 560, 160, 'pato']] },
    { img: 'hq5', bal: [[470, 410, 330, 'DUCKZINHO', 'Cinco cartuchos. Cinco lugares. Cinco problemas. Ótimo.', 820, 390, 'pato']] },
    { img: 'hq6', bal: [[690, 300, 250, '???', 'Hehehe... tragam todos pra mim.', 650, 450, 'vilao'],
      [250, 24, 400, 'DUCKZINHO', 'Vocês fizeram a bagunça, vocês limpam. Eu supervisiono. Quack.', 600, 175, 'pato']] }
  ];
  const ESTILO_BALAO = { pato: ['#e6f1fb', '#185fa5', '#1a1426'], vilao: ['#2a0f45', '#ff5fb0', '#f4c0d1'] };
  const LETRAS_POR_SEG = 38;
  function desenharBalao(c, b, mostrar) {
    const [x, y, w, nome, fala, px, py, estilo] = b;
    const [fundo, corNome, corTxt] = ESTILO_BALAO[estilo] || ['#f1efe8', '#8a3fe0', '#1a1426'];
    const linhas = DT.quebrarTexto(fala, Math.floor((w - 24) / 10)), h = 34 + linhas.length * 16;
    const meio = x + w * 0.5, base = py > y + h ? y + h : y;
    c.fillStyle = '#000'; c.beginPath(); c.moveTo(meio - 14, base); c.lineTo(px, py); c.lineTo(meio + 14, base); c.fill();
    c.fillStyle = fundo; c.fillRect(x, y, w, h);
    c.beginPath(); c.moveTo(meio - 10, base); c.lineTo(px, py - Math.sign(py - base) * 4); c.lineTo(meio + 10, base); c.fill();
    c.strokeStyle = '#000'; c.lineWidth = 4; c.strokeRect(x, y, w, h);
    DT.texto(c, nome, x + 12, y + 10, 8, corNome, 'left', false);
    let resta = mostrar;
    linhas.forEach((l, i) => { if (resta <= 0) return; DT.texto(c, l.slice(0, resta), x + 12, y + 26 + i * 16, 9, corTxt, 'left', false); resta -= l.length + 1; });
  }
  const letrasDoQuadrinho = q => q.bal.reduce((s, b) => s + b[4].length + 4, 0);

  DT.Historia = {
    nome: 'historia',
    lista: QUADRINHOS,
    aoFim() { DT.novoJogo(); },
    iniciar() { this.t = 0; this.n = 0; this.tq = 0; DT.controlesAtivos = false; },
    atualizar(dt) {
      this.t += dt; this.tq += dt;
      const E = DT.ent, P = DT.ponteiro, tocouPular = E.cliqueP && P.x < 220 && P.y > 480;
      if (E.pausaP || tocouPular) { DT.som('clique'); this.aoFim(); return; }
      if (this.tq > 0.3 && (E.avancarP || E.puloP)) {
        const q = this.lista[this.n];
        if ((this.tq - 0.5) * LETRAS_POR_SEG < letrasDoQuadrinho(q)) { this.tq = 99; return; } // 1º toque: completa o texto
        if (this.n < this.lista.length - 1) { this.n++; this.tq = 0; DT.som('carta'); }
        else { DT.som('clique'); this.aoFim(); }
      }
    },
    desenhar(ctx) {
      const QUADRINHOS = this.lista, c = ctx, q = QUADRINHOS[this.n], t = Math.min(this.tq, 60);
      c.fillStyle = '#07040c'; c.fillRect(0, 0, DT.L, DT.A);
      // a imagem entra devagar com um zoom leve (efeito de câmera); no splash a tela treme
      const z = 1 + Math.min(t, 8) * 0.004, tr = q.tremer && t < 0.7 ? DT.aleat(-7, 7) : 0, W = DT.L * z, H = DT.A * z;
      c.save(); c.globalAlpha = Math.min(1, t / 0.4); c.imageSmoothingEnabled = true;
      c.drawImage(DT.IM[q.img], (DT.L - W) / 2 + tr, (DT.A - H) * 0.85 + tr, W, H);
      c.restore();
      let letras = Math.max(0, (t - 0.5) * LETRAS_POR_SEG);
      q.bal.forEach(b => { if (letras <= 0) return; desenharBalao(c, b, Math.floor(letras)); letras -= b[4].length + 4; });
      DT.texto(c, '<< ' + (DT.usandoToque ? '' : 'ESC ') + 'PULAR', 16, 522, 8, '#f1efe8', 'left');
      DT.texto(c, (this.n + 1) + '/' + QUADRINHOS.length, 480, 522, 8, '#fac775', 'center');
      const fim = this.n >= QUADRINHOS.length - 1;
      if (Math.floor(this.t * 2) % 2 === 0) DT.texto(c, (DT.usandoToque ? 'TOQUE' : 'ENTER') + (fim ? ': COMEÇAR!' : ' PARA CONTINUAR ▶'), 944, 522, 8, '#ff5fb0', 'right');
    }
  };

  /* ---------- Final do jogo (3 quadrinhos depois do Demônio, antes do prêmio) ---------- */
  DT.Final = Object.assign(Object.create(DT.Historia), {
    nome: 'final',
    lista: [
      { img: 'fim1', bal: [[560, 24, 370, 'DUCKZINHO', 'Hunf. Até que não foi tão ruim. Quack.', 615, 385, 'pato']], tremer: true },
      { img: 'fim2', bal: [[330, 20, 330, 'YASMIN', 'Cinco cartuchos de volta. Estúdio salvo!', 566, 160]] },
      { img: 'fim3', bal: [[40, 20, 330, 'EMERSON', 'Próximo cliente, por favor!', 440, 150], [760, 120, 170, '???', 'Hehe...', 705, 190, 'vilao']] }
    ],
    aoFim() { DT.irPara('premio'); }
  });

  /* ---------- Vitória ---------- */
  const ARENA_DO_CHEFE = { chefe: 'arena', chefe2: 'arena2', chefe3: 'arena3', chefe4: 'arena4', chefe5: 'arena5' };
  DT.Vitoria = {
    nome: 'vitoria',
    iniciar() {
      const J = DT.jogo;
      this.t = 0; DT.controlesAtivos = false;
      this.cartas = DT.faseAtual().cartas;
      this.nCartas = this.cartas.filter(k => J.cartas.includes(k)).length;
      const m = J.moedasFase || { pegas: 0, total: 0 };
      this.moedas = m;
      // fase perfeita = álbum 6/6 + todas as moedas espalhadas pela fase (vale para os 25%)
      this.perfeita = this.nCartas === this.cartas.length && m.total > 0 && m.pegas >= m.total;
      J.resultado = J.resultado || {};
      J.resultado[J.fase] = { cartas: this.nCartas, moedas: m.pegas, total: m.total, perfeita: this.perfeita };
      this.proxima = DT.FASES[J.fase + 1] && !DT.FASE_TESTE ? J.fase + 1 : null;
      if (this.perfeita) setTimeout(() => DT.som('cupom'), 600);
    },
    atualizar(dt) {
      this.t += dt;
      if (this.t > 2 && (DT.ent.avancarP)) {
        if (this.proxima) DT.comecarFase(this.proxima, false);
        else DT.irPara(DT.FASE_TESTE ? 'titulo' : 'final');
      }
    },
    desenhar(ctx) {
      const J = DT.jogo, t = this.t;
      ctx.drawImage(DT.IM[ARENA_DO_CHEFE[DT.FASES[J.fase].chefe]] || DT.IM.arena, 0, 0, DT.L, DT.A);
      ctx.fillStyle = 'rgba(16,8,28,0.82)'; ctx.fillRect(0, 0, DT.L, DT.A);
      DT.texto(ctx, 'CARTUCHO RECUPERADO!', 480, 22, 22, '#e0a826', 'center');
      DT.texto(ctx, 'FASE ' + J.fase + ' COMPLETA · ' + DT.FASES[J.fase].nome, 480, 56, 10, '#9fe1cb', 'center');
      const min = Math.floor(J.tempo / 60), seg = String(Math.floor(J.tempo % 60)).padStart(2, '0');
      [['PONTOS', String(J.pontos)], ['MOEDAS', String(J.moedas)], ['TEMPO', min + ':' + seg]].forEach(([n, v], i) => {
        DT.texto(ctx, n, 220 + i * 260, 82, 9, '#b9acd0', 'center');
        DT.texto(ctx, v, 220 + i * 260, 98, 16, '#f1efe8', 'center');
      });
      DT.texto(ctx, 'ÁLBUM DE CARTAS ' + this.nCartas + '/6', 480, 128, 11, '#ff5fb0', 'center');
      this.cartas.forEach((k, i) => {
        const x = 165 + i * 126, tem = J.cartas.includes(k);
        DT.caixa(ctx, x - 52, 146, 104, 118, tem ? '#2a1f3d' : '#140e1e', tem ? '#e0a826' : '#3a2a52');
        const [folha, ic] = DT.ICONE_CARTA[k];
        DT.desenharAltura(ctx, folha, ic, x, 228, 66, false, { alpha: tem ? 1 : 0.15, filtro: tem ? null : 'grayscale(1)' });
        const nome = DT.NOME_CARTA[k].split(' ');
        nome.forEach((p, n) => DT.texto(ctx, tem ? p : '???', x, 234 + n * 12, 7, tem ? '#fac775' : '#4a3866', 'center', false));
      });
      // fase perfeita? (rumo aos 25%)
      const okA = this.nCartas === this.cartas.length, okM = this.moedas.total > 0 && this.moedas.pegas >= this.moedas.total;
      DT.caixa(ctx, 200, 276, 560, 132, 'rgba(18,12,30,0.95)', this.perfeita ? '#9fe1cb' : '#4a3866');
      DT.texto(ctx, this.perfeita ? 'FASE PERFEITA!' : 'FASE PERFEITA?', 480, 288, 11, this.perfeita ? '#9fe1cb' : '#ff5fb0', 'center', false);
      DT.texto(ctx, 'ÁLBUM ' + this.nCartas + '/6', 300, 310, 9, okA ? '#9fe1cb' : '#ff9a9a', 'center', false);
      DT.texto(ctx, 'MOEDAS DA FASE ' + this.moedas.pegas + '/' + this.moedas.total, 600, 310, 9, okM ? '#9fe1cb' : '#ff9a9a', 'center', false);
      DT.texto(ctx, 'RUMO AOS 25% DE DESCONTO', 480, 334, 8, '#fac775', 'center', false);
      const fases = Object.keys(DT.FASES).map(Number), larg = 64, ini = 480 - (fases.length * (larg + 14) - 14) / 2;
      fases.forEach((f, i) => {
        const x = ini + i * (larg + 14), r = (J.resultado || {})[f], ok = r && r.perfeita;
        DT.caixa(ctx, x, 350, larg, 30, ok ? '#3b6d11' : '#2a1f3d', ok ? '#9fe1cb' : r ? '#a32d2d' : '#4a3866');
        DT.texto(ctx, ok ? 'OK' : 'F' + f, x + larg / 2, 360, 8, ok ? '#eaf3de' : r ? '#ff9a9a' : '#888780', 'center', false);
      });
      DT.texto(ctx, '(terminar o jogo já garante 10%)', 480, 392, 7, '#b9acd0', 'center', false);
      const achou = (J.patinhos || {})[J.fase];
      DT.desenharAltura(ctx, 'pw', 12, 760, 470, 34, false, { alpha: achou ? 1 : 0.3, filtro: achou ? null : 'grayscale(1)' });
      DT.texto(ctx, 'PATINHO SECRETO', 784, 442, 7, '#fac775', 'left', false);
      DT.texto(ctx, achou ? 'ENCONTRADO!' : '???', 784, 456, 8, achou ? '#9fe1cb' : '#4a3866', 'left', false);
      const r = DT.spr('retratos', 3); ctx.drawImage(r, 40, 420, r.width * 90 / r.height, 90);
      DT.texto(ctx, this.perfeita ? 'Perfeita. Não se acostuma.' : 'Bom trabalho. Não se acostuma.', 150, 456, 10, '#f1efe8', 'left', false);
      const acao = this.proxima ? 'PARA A FASE ' + (this.proxima === 5 ? 'FINAL' : this.proxima) : DT.FASE_TESTE ? 'PARA O TÍTULO (FIM DO TESTE)' : 'PARA O FINAL';
      if (t > 2 && Math.floor(t * 2) % 2 === 0) DT.texto(ctx, (DT.usandoToque ? 'TOQUE ' : 'ENTER ') + acao, 480, 510, 10, '#ff5fb0', 'center');
    }
  };

  /* ---------- Pausa e Game Over ---------- */
  DT.desenharPausa = function (ctx) {
    ctx.fillStyle = 'rgba(16,8,28,0.78)'; ctx.fillRect(0, 0, DT.L, DT.A);
    DT.texto(ctx, 'PAUSA', 480, 120, 30, '#e0a826', 'center');
    const linhas = DT.usandoToque
      ? ['JOYSTICK (lado esquerdo)  andar', 'PULO  pular', 'JOYSTICK PARA BAIXO  agachar (correndo: desliza)', 'ATK  atacar', 'ESP  especial (meia barra de tinta)', 'TROCA  trocar de herói']
      : ['SETAS / A D  andar', 'ESPAÇO / W  pular', '▼ / S  agachar (correndo: desliza)', 'X / J  atacar', 'C / K  especial (meia barra de tinta)', 'Q / L  trocar de herói', 'P / ESC  pausa'];
    linhas.forEach((l, i) => DT.texto(ctx, l, 480, 180 + i * 24, 10, '#f1efe8', 'center', false));
    DT.texto(ctx, 'Agache para desviar dos tiros altos!', 480, 362, 9, '#9fe1cb', 'center', false);
    DT.texto(ctx, (DT.usandoToque ? 'TOQUE' : 'P') + ' PARA CONTINUAR', 480, 420, 12, '#ff5fb0', 'center');
  };
  DT.desenharGameOver = function (ctx) {
    ctx.fillStyle = 'rgba(16,8,28,0.88)'; ctx.fillRect(0, 0, DT.L, DT.A);
    DT.texto(ctx, 'GAME OVER', 480, 120, 36, '#e24b4a', 'center');
    for (let i = 0; i < DT.VIDAS_INICIAIS; i++) DT.cabecaVida(ctx, 432 + i * 34, 190, false);
    const r = DT.spr('retratos', 2); ctx.drawImage(r, 300, 260, r.width * 100 / r.height, 100);
    DT.texto(ctx, 'Acabaram as vidas. Quack.', 440, 290, 11, '#f1efe8', 'left', false);
    DT.texto(ctx, 'De volta ao começo da fase!', 440, 316, 10, '#fac775', 'left', false);
    if (DT.gameOverT > 1 && Math.floor(performance.now() / 500) % 2) DT.texto(ctx, (DT.usandoToque ? 'TOQUE' : 'ENTER') + ' PARA RECOMEÇAR', 480, 420, 12, '#ff5fb0', 'center');
  };
})();
