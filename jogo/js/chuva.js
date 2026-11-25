/* Minijogo da Fase 4: Chuva de Cores
   Na oficina da casa na árvore, mova o copinho e pegue só as gotas da cor pedida. Gota roxa estraga a mistura. */
(function () {
  'use strict';
  const DT = window.DT;
  const CORES = [
    { nome: 'VERMELHO', cor: '#e24b4a' }, { nome: 'AZUL', cor: '#58a6ff' }, { nome: 'AMARELO', cor: '#fac775' },
    { nome: 'VERDE', cor: '#5dcf5a' }, { nome: 'PRETO', cor: '#b4b2a9' }
  ];
  const META = 5;           // gotas certas para encher o copinho
  const TEMPO = 45;         // segundos para os 3 pedidos
  const Y_COPO = 478;       // base do copinho no balcão

  DT.Chuva = {
    nome: 'chuva',
    iniciar() {
      const c = this;
      c.pedidos = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, 3);
      c.n = 0; c.prog = 0; c.erros = 0; c.completos = 0;
      c.gotas = []; c.spawnT = 0.4; c.t = 0; c.tempo = TEMPO;
      c.copo = { x: 480, tonto: 0, tremor: 0 };
      c.fim = null; c.fimT = 0; c.instrucao = true; c.trocaT = 0;
      DT.controlesAtivos = false; DT.particulas = []; DT.textos = [];
      if (window.DuckSom) DuckSom.tocarMusica('minijogo');
    },

    atualizar(dt) {
      const c = this, E = DT.ent, P = DT.ponteiro, k = c.copo;
      c.t += dt; DT.atualizarEfeitos(dt);
      if (c.fim) { c.fimT -= dt; if (c.fimT <= 0 || (c.fimT < 2.4 && E.avancarP)) this.sair(); return; }
      if (c.instrucao) { if (E.avancarP || E.esqP || E.dirP) { c.instrucao = false; DT.som('clique'); } return; }
      c.tempo -= dt;
      c.trocaT = Math.max(0, c.trocaT - dt);
      k.tonto = Math.max(0, k.tonto - dt);

      // copinho: setas/A-D ou arrastar o dedo/mouse
      if (k.tonto <= 0) {
        const mx = (E.dir ? 1 : 0) - (E.esq ? 1 : 0);
        if (mx) k.x += mx * 560 * dt;
        else if (P.down) k.x += (P.x - k.x) * Math.min(1, dt * 14);
      }
      k.x = DT.clamp(k.x, 70, DT.L - 70);

      // gotas
      c.spawnT -= dt;
      if (c.spawnT <= 0) {
        c.spawnT = Math.max(0.28, 0.55 - c.t * 0.004);
        const alvo = c.pedidos[c.n], r = Math.random();
        const tipo = r < 0.36 ? alvo : r < 0.56 ? 'roxa' : [0, 1, 2, 3, 4].filter(i => i !== alvo)[Math.floor(Math.random() * 4)];
        c.gotas.push({ tipo, x: DT.aleat(70, DT.L - 70), y: -40, vy: 190 + Math.min(160, c.t * 4) + DT.aleat(0, 60) });
      }
      c.gotas.forEach(g => {
        g.y += g.vy * dt;
        if (g.pega) return;
        if (Math.abs(g.x - k.x) < 42 && g.y > Y_COPO - 62 && g.y < Y_COPO - 20) {
          g.pega = true;
          if (g.tipo === 'roxa') {
            k.tonto = 0.7; c.erros++; c.prog = Math.max(0, c.prog - 1);
            DT.som('ai'); DT.tremer(6, 0.25); DT.respingo(k.x, Y_COPO - 50, '#8a3fe0', 16, 240);
            DT.textoFlutuante(k.x, Y_COPO - 110, 'ECA! TINTA DO MAL!', '#c79bff', 10);
          } else if (g.tipo === c.pedidos[c.n]) {
            c.prog++; DT.som('moeda'); DT.respingo(k.x, Y_COPO - 50, CORES[g.tipo].cor, 8, 160);
            if (c.prog >= META) {
              c.completos++; DT.som('perfeito'); DT.respingo(k.x, Y_COPO - 60, '#fac775', 20, 260);
              if (c.n < c.pedidos.length - 1) { c.n++; c.prog = 0; c.trocaT = 1.4; c.gotas.forEach(o => { o.pega = true; }); }
              else { this.terminar(); return; }
            }
          } else {
            c.erros++; c.prog = Math.max(0, c.prog - 1); DT.som('clique');
            DT.textoFlutuante(k.x, Y_COPO - 110, 'COR ERRADA!', '#ff9a9a', 10);
          }
        } else if (g.y > Y_COPO + 10 && g.tipo === 'roxa' && !g.splash) { g.splash = true; DT.respingo(g.x, Y_COPO, '#8a3fe0', 5, 120); }
      });
      c.gotas = c.gotas.filter(g => !g.pega && g.y < DT.A + 40);
      if (c.tempo <= 0) { DT.som('ai'); this.terminar(); }
    },

    terminar() {
      const c = this;
      const perfeito = c.completos === c.pedidos.length && c.erros <= 2;
      const moedas = perfeito ? 40 : c.completos * 10;
      c.fim = { perfeito, moedas, completos: c.completos, total: c.pedidos.length, erros: c.erros }; c.fimT = 3.4;
      DT.jogo.moedas += moedas; DT.jogo.pontos += perfeito ? 1500 : c.completos * 400;
      DT.som(perfeito ? 'perfeito' : c.completos ? 'moeda' : 'quackBravo');
      if (window.DuckSom) DuckSom.pararMusica();
    },
    sair() { DT.cenaAtual = DT.Nivel; DT.Nivel.voltarDoMinijogo(); DT.particulas = []; DT.textos = []; },

    desenhar(ctx) {
      const c = this, k = c.copo, alvo = CORES[c.pedidos[Math.min(c.n, c.pedidos.length - 1)]];
      ctx.save(); ctx.translate(DT.tremorX, DT.tremorY);
      ctx.drawImage(DT.IM.oficina, 0, 0, DT.L, DT.A);
      ctx.fillStyle = 'rgba(10,8,26,0.22)'; ctx.fillRect(0, 0, DT.L, DT.A);
      // gotas
      c.gotas.forEach(g => {
        const f = g.tipo === 'roxa' ? [5, 6][Math.floor(c.t * 5 + g.x) % 2] : g.tipo;
        DT.desenharAltura(ctx, 'chuva', f, g.x, g.y + 20, g.tipo === 'roxa' ? 50 : 40, false);
      });
      // copinho (enche conforme o progresso)
      const f = c.prog >= META - 1 ? 10 : c.prog >= 2 ? 9 : 8, tr = k.tonto > 0 ? DT.aleat(-4, 4) : 0;
      DT.desenharAltura(ctx, 'chuva', f, k.x + tr, Y_COPO, 70, false, { alpha: k.tonto > 0 ? 0.7 : 1 });
      if (k.tonto > 0) DT.desenharAltura(ctx, 'chuva', 7, k.x, Y_COPO - 40, 40, false);
      if (c.trocaT > 0.8) DT.desenharAltura(ctx, 'chuva', 11, k.x + 30, Y_COPO - 70, 40, false);
      DT.desenharEfeitos(ctx);
      ctx.restore();

      // pedido e progresso
      DT.caixa(ctx, 16, 16, 320, 70, 'rgba(10,6,18,0.9)', '#e0a826');
      DT.texto(ctx, 'PEGUE SÓ:', 30, 28, 9, '#f1efe8', 'left', false);
      DT.desenharAltura(ctx, 'chuva', c.pedidos[Math.min(c.n, c.pedidos.length - 1)], 46, 80, 40, false);
      DT.texto(ctx, alvo.nome, 72, 48, 12, alvo.cor, 'left');
      DT.texto(ctx, 'COPINHO ' + Math.min(c.n + 1, 3) + '/3', 230, 28, 7, '#fac775', 'center', false);
      for (let i = 0; i < META; i++) { ctx.fillStyle = i < c.prog ? alvo.cor : '#2a1f3d'; ctx.fillRect(196 + i * 14, 48, 10, 22); }
      DT.caixa(ctx, 650, 16, 294, 50, 'rgba(10,6,18,0.9)', '#e0a826');
      DT.texto(ctx, 'TEMPO', 664, 34, 8, '#c79bff', 'left', false);
      DT.caixa(ctx, 730, 28, 200, 24, '#2a1f3d', '#000');
      const tv = DT.clamp(c.tempo / TEMPO, 0, 1);
      ctx.fillStyle = tv > 0.3 ? '#a98bff' : '#e24b4a'; ctx.fillRect(733, 31, 194 * tv, 18);
      DT.texto(ctx, 'CHUVA DE CORES', 480, 96, 14, '#ff5fb0', 'center');

      if (c.trocaT > 0 && !c.fim) {
        DT.caixa(ctx, 300, 220, 360, 60, 'rgba(18,12,30,0.94)', '#9fe1cb');
        DT.texto(ctx, 'AGORA: ' + alvo.nome, 480, 242, 12, alvo.cor, 'center', false);
      }
      if (c.instrucao) {
        DT.caixa(ctx, 190, 150, 580, 150, 'rgba(18,12,30,0.94)', '#e0a826');
        DT.texto(ctx, 'ENCHA 3 COPINHOS DE TINTA!', 480, 168, 12, '#f1efe8', 'center', false);
        DT.texto(ctx, DT.usandoToque ? 'Arraste o dedo para mover o copinho' : 'Setas (ou o mouse) movem o copinho', 480, 202, 9, '#fac775', 'center', false);
        DT.texto(ctx, 'Pegue só a cor pedida · fuja da gota roxa', 480, 224, 9, '#9fe1cb', 'center', false);
        if (Math.floor(c.t * 2) % 2 === 0) DT.texto(ctx, (DT.usandoToque ? 'TOQUE' : 'ENTER') + ' PARA COMEÇAR', 480, 262, 9, '#ff5fb0', 'center', false);
      }
      if (c.fim) {
        ctx.fillStyle = 'rgba(16,8,28,0.62)'; ctx.fillRect(0, 0, DT.L, DT.A);
        const F = c.fim;
        DT.texto(ctx, F.perfeito ? 'MISTURA PERFEITA!' : F.completos ? 'BOM TRABALHO!' : 'A TINTA ACABOU...', 480, 180, 24,
          F.perfeito ? '#9fe1cb' : F.completos ? '#fac775' : '#e24b4a', 'center');
        DT.texto(ctx, 'COPINHOS: ' + F.completos + '/' + F.total + '   ERROS: ' + F.erros, 480, 240, 12, '#f1efe8', 'center');
        DT.texto(ctx, '+' + F.moedas + ' MOEDAS', 480, 276, 14, '#fac775', 'center');
      }
    }
  };
})();
