/* Minijogo da Fase 2: Desafio do Decalque
   O modelo aparece na mesa de luz e vai apagando com o tempo. Copie o desenho antes que ele suma. */
(function () {
  'use strict';
  const DT = window.DT;
  const MODELOS = ['ancora', 'coracao', 'estrela'];
  const NOMES = { ancora: 'ÂNCORA', coracao: 'CORAÇÃO', estrela: 'ESTRELA' };
  const TEMPO = 11;          // segundos por desenho (a ampulheta)
  const APAGA_EM = 6;        // em quanto tempo o modelo some quase todo
  const TOLERANCIA = 30;
  const CENTRO = { x: 472, y: 306 }; // centro da folha na mesa de luz

  // as formas do outro minijogo são desenhadas em volta de (400, 390): leva para o centro da folha
  function modelo(nome) {
    const { forma, preparar } = DT.FORMAS_TATTOO;
    const dx = CENTRO.x - 403, dy = CENTRO.y - 388;
    const tracos = forma(nome).map(tr => tr.map(p => ({ x: p.x + dx, y: p.y + dy })));
    return preparar(tracos, 6);
  }

  DT.Decalque = {
    nome: 'decalque',
    iniciar() {
      const c = this;
      c.ordem = MODELOS.slice().sort(() => Math.random() - 0.5).slice(0, 2); // 2 decalques sorteados
      c.n = 0; c.t = 0; c.fim = null; c.fimT = 0; c.instrucao = true;
      c.desvioSoma = 0; c.desvioN = 0; c.completos = 0;
      this.carregar();
      DT.controlesAtivos = false; DT.particulas = []; DT.textos = [];
      if (window.DuckSom) DuckSom.tocarMusica('minijogo');
    },
    carregar() { this.pts = modelo(this.ordem[this.n]); this.idx = 0; this.tempo = TEMPO; this.trocaT = this.n ? 1 : 0; },

    atualizar(dt) {
      const c = this, P = DT.ponteiro;
      c.t += dt; DT.atualizarEfeitos(dt);
      if (c.fim) { c.fimT -= dt; if (c.fimT <= 0 || (c.fimT < 2.4 && DT.ent.avancarP)) this.sair(); return; }
      if (DT.ent.pausaP) { this.terminar(); return; }
      if (P.down) c.instrucao = false;
      if (c.trocaT > 0) { c.trocaT -= dt; return; }
      if (c.instrucao) return;
      c.tempo -= dt;
      if (window.DuckSom) DuckSom.setVelocidadeMusica(1 + (1 - c.tempo / TEMPO) * 0.4);

      if (P.down && c.idx < c.pts.length) {
        const alvo = c.pts[c.idx];
        const viajando = alvo.novo && Math.hypot(P.x - alvo.x, P.y - alvo.y) > TOLERANCIA;
        if (!viajando) {
          let menor = 1e9;
          for (let i = Math.max(0, c.idx - 4); i < Math.min(c.pts.length, c.idx + 8); i++) {
            const d = Math.hypot(P.x - c.pts[i].x, P.y - c.pts[i].y); if (d < menor) menor = d;
          }
          c.desvioSoma += Math.min(menor, 60); c.desvioN++;
          while (c.idx < c.pts.length && Math.hypot(P.x - c.pts[c.idx].x, P.y - c.pts[c.idx].y) < TOLERANCIA) c.idx++;
          if (Math.floor(c.t * 8) !== Math.floor((c.t - dt) * 8)) DT.som('tatuando');
        }
      }
      if (c.idx >= c.pts.length - 1) {
        c.completos++; DT.som('perfeito');
        DT.respingo(c.pts[c.pts.length - 1].x, c.pts[c.pts.length - 1].y, '#9fe1cb', 14, 200);
        if (c.n < c.ordem.length - 1) { c.n++; this.carregar(); } else this.terminar();
      } else if (c.tempo <= 0) {
        DT.som('ai'); DT.textoFlutuante(CENTRO.x, CENTRO.y - 140, 'O TEMPO ACABOU!', '#e24b4a', 12);
        if (c.n < c.ordem.length - 1) { c.n++; this.carregar(); } else this.terminar();
      }
    },
    terminar() {
      const c = this;
      const media = c.desvioSoma / Math.max(1, c.desvioN);
      const precisao = Math.round(DT.clamp(100 - media * 2.4, 0, 100));
      const perfeito = c.completos === c.ordem.length && precisao >= 75;
      const moedas = perfeito ? 40 : c.completos * 10;
      c.fim = { completos: c.completos, total: c.ordem.length, precisao, perfeito, moedas }; c.fimT = 3.4;
      DT.jogo.moedas += moedas; DT.jogo.pontos += perfeito ? 1500 : c.completos * 400;
      DT.som(perfeito ? 'perfeito' : c.completos ? 'moeda' : 'quackBravo');
      if (window.DuckSom) DuckSom.pararMusica();
    },
    sair() { DT.cenaAtual = DT.Nivel; DT.Nivel.voltarDoMinijogo(); DT.particulas = []; DT.textos = []; },

    desenhar(ctx) {
      const c = this, P = DT.ponteiro;
      ctx.save(); ctx.translate(DT.tremorX, DT.tremorY);
      ctx.drawImage(DT.IM.decalque, 0, 0, DT.L, DT.A);
      const caminho = ate => {
        ctx.beginPath();
        for (let i = 0; i < Math.min(ate, c.pts.length); i++) { const p = c.pts[i]; (i === 0 || p.novo) ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (c.trocaT <= 0 && !c.fim) {
        // modelo em carbono roxo, apagando com o tempo
        const usado = TEMPO - c.tempo, alfa = c.instrucao ? 0.95 : Math.max(0.06, 0.95 - usado / APAGA_EM);
        ctx.strokeStyle = 'rgba(60,25,110,' + alfa + ')'; ctx.lineWidth = 5; caminho(c.pts.length); ctx.stroke();
        if (c.idx > 1) { ctx.strokeStyle = '#141018'; ctx.lineWidth = 6; caminho(c.idx); ctx.stroke(); }
        if (c.idx < c.pts.length) {
          const p = c.pts[c.idx], r = 9 + Math.sin(c.t * 8) * 3;
          ctx.strokeStyle = '#e0a826'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        }
      }
      if (P.down && !c.fim) { ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(P.x, P.y, 6, 0, Math.PI * 2); ctx.fill(); }
      DT.desenharEfeitos(ctx);
      ctx.restore();

      DT.texto(ctx, 'DESAFIO DO DECALQUE', 480, 14, 14, '#ff5fb0', 'center');
      // ampulheta / tempo
      DT.caixa(ctx, 120, 470, 260, 50, 'rgba(10,6,18,0.9)', '#e0a826');
      DT.texto(ctx, 'TEMPO', 136, 488, 8, '#c79bff', 'left', false);
      DT.caixa(ctx, 200, 480, 166, 24, '#2a1f3d', '#000');
      const tv = DT.clamp(c.tempo / TEMPO, 0, 1);
      ctx.fillStyle = tv > 0.35 ? '#a98bff' : '#e24b4a'; ctx.fillRect(203, 483, 160 * tv, 18);
      // qual desenho
      DT.caixa(ctx, 590, 470, 260, 50, 'rgba(10,6,18,0.9)', '#e0a826');
      DT.texto(ctx, 'DECALQUE ' + Math.min(c.n + 1, c.ordem.length) + '/' + c.ordem.length + ': ' + NOMES[c.ordem[c.n]], 720, 488, 8, '#fac775', 'center', false);

      if (c.trocaT > 0 && !c.fim) {
        DT.caixa(ctx, 300, 230, 360, 60, 'rgba(18,12,30,0.94)', '#9fe1cb');
        DT.texto(ctx, 'PRÓXIMO: ' + NOMES[c.ordem[c.n]], 480, 252, 12, '#9fe1cb', 'center', false);
      }
      if (c.instrucao && !c.fim) {
        DT.caixa(ctx, 220, 56, 520, 88, 'rgba(18,12,30,0.94)', '#e0a826');
        DT.texto(ctx, 'O MODELO VAI SUMIR DA MESA DE LUZ!', 480, 72, 10, '#f1efe8', 'center', false);
        DT.texto(ctx, 'MEMORIZE E COPIE PELO CÍRCULO DOURADO', 480, 96, 9, '#fac775', 'center', false);
        DT.texto(ctx, 'TOQUE OU CLIQUE PARA COMEÇAR', 480, 120, 8, '#9fe1cb', 'center', false);
      }
      if (c.fim) {
        ctx.fillStyle = 'rgba(16,8,28,0.62)'; ctx.fillRect(0, 0, DT.L, DT.A);
        const F = c.fim;
        DT.texto(ctx, F.perfeito ? 'DECALQUE PERFEITO!' : F.completos ? 'BOM TRABALHO!' : 'O MODELO SUMIU...', 480, 180, 24,
          F.perfeito ? '#9fe1cb' : F.completos ? '#fac775' : '#e24b4a', 'center');
        DT.texto(ctx, 'DESENHOS: ' + F.completos + '/' + F.total + '   PRECISÃO ' + F.precisao + '%', 480, 240, 12, '#f1efe8', 'center');
        DT.texto(ctx, '+' + F.moedas + ' MOEDAS', 480, 276, 14, '#fac775', 'center');
      }
    }
  };
})();
