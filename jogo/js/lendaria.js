/* Minijogo da Fase Final: Tatuagem Lendária
   No altar, tatue o símbolo do Duck Tattoo (a cabeça do patinho) para selar a tinta. Mão firme: rápido demais não conta. */
(function () {
  'use strict';
  const DT = window.DT;
  const TEMPO = 22, TOLERANCIA = 26, VEL_MAX = 650;
  const CX = 455, CY = 280, R = 36; // no meio da pele do antebraço (minijogo_lendaria)

  function simbolo() {
    const cabeca = [];
    for (let i = 0; i <= 60; i++) { const a = Math.PI * 0.15 + i / 60 * Math.PI * 1.7; cabeca.push({ x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R }); }
    cabeca.push({ x: CX + 66, y: CY + 4 }, { x: CX + 35, y: CY + 15 }); // bico
    const olho = [];
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI * 2; olho.push({ x: CX + 9 + Math.cos(a) * 5, y: CY - 13 + Math.sin(a) * 5 }); }
    return DT.FORMAS_TATTOO.preparar([cabeca, olho], 5);
  }

  DT.Lendaria = {
    nome: 'lendaria',
    iniciar() {
      const c = this;
      c.pts = simbolo(); c.idx = 0; c.tempo = TEMPO; c.t = 0; c.fim = null; c.fimT = 0; c.instrucao = true;
      c.desvioSoma = 0; c.desvioN = 0; c.vel = 0; c.ult = null; c.rapidoT = 0;
      DT.controlesAtivos = false; DT.particulas = []; DT.textos = [];
      if (window.DuckSom) DuckSom.tocarMusica('minijogo');
    },
    atualizar(dt) {
      const c = this, P = DT.ponteiro;
      c.t += dt; DT.atualizarEfeitos(dt);
      if (c.fim) { c.fimT -= dt; if (c.fimT <= 0 || (c.fimT < 2.4 && DT.ent.avancarP)) this.sair(); return; }
      if (DT.ent.pausaP) { this.terminar(); return; }
      if (P.down) c.instrucao = false;
      if (c.instrucao) return;
      c.tempo -= dt;
      // velocidade do traço (mão firme)
      if (P.down && c.ult) c.vel = c.vel * 0.7 + (Math.hypot(P.x - c.ult.x, P.y - c.ult.y) / Math.max(dt, 0.001)) * 0.3; else c.vel *= 0.8;
      c.ult = P.down ? { x: P.x, y: P.y } : null;
      c.rapidoT = Math.max(0, c.rapidoT - dt);
      if (P.down && c.idx < c.pts.length) {
        if (c.vel > VEL_MAX) { if (c.rapidoT <= 0) { c.rapidoT = 1; DT.som('ai'); DT.textoFlutuante(P.x, P.y - 40, 'DEVAGAR!', '#e24b4a', 10); } }
        else {
          const alvo = c.pts[c.idx], viajando = alvo.novo && Math.hypot(P.x - alvo.x, P.y - alvo.y) > TOLERANCIA;
          if (!viajando) {
            let menor = 1e9;
            for (let i = Math.max(0, c.idx - 4); i < Math.min(c.pts.length, c.idx + 8); i++) { const d = Math.hypot(P.x - c.pts[i].x, P.y - c.pts[i].y); if (d < menor) menor = d; }
            c.desvioSoma += Math.min(menor, 60); c.desvioN++;
            while (c.idx < c.pts.length && Math.hypot(P.x - c.pts[c.idx].x, P.y - c.pts[c.idx].y) < TOLERANCIA) c.idx++;
            if (Math.floor(c.t * 8) !== Math.floor((c.t - dt) * 8)) DT.som('tatuando');
          }
        }
      }
      if (c.idx >= c.pts.length - 1) { DT.som('perfeito'); DT.respingo(CX, CY, '#fac775', 30, 300); this.terminar(); }
      else if (c.tempo <= 0) { DT.som('ai'); this.terminar(); }
    },
    terminar() {
      const c = this, media = c.desvioSoma / Math.max(1, c.desvioN);
      const precisao = Math.round(DT.clamp(100 - media * 2.4, 0, 100)), completo = c.idx >= c.pts.length - 1;
      const perfeito = completo && precisao >= 75, moedas = perfeito ? 50 : completo ? 25 : Math.floor(c.idx / c.pts.length * 20);
      c.fim = { completo, perfeito, precisao, moedas }; c.fimT = 3.4;
      DT.jogo.moedas += moedas; DT.jogo.pontos += perfeito ? 2000 : completo ? 1000 : 200;
      if (window.DuckSom) DuckSom.pararMusica();
    },
    sair() { DT.cenaAtual = DT.Nivel; DT.Nivel.voltarDoMinijogo(); DT.particulas = []; DT.textos = []; },
    desenhar(ctx) {
      const c = this, P = DT.ponteiro;
      ctx.save(); ctx.translate(DT.tremorX, DT.tremorY);
      ctx.drawImage(DT.IM.lendaria, 0, 0, DT.L, DT.A);
      const caminho = ate => { ctx.beginPath(); for (let i = 0; i < Math.min(ate, c.pts.length); i++) { const p = c.pts[i]; (i === 0 || p.novo) ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); } };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.setLineDash([7, 8]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(50,30,80,0.9)'; caminho(c.pts.length); ctx.stroke(); ctx.setLineDash([]);
      if (c.idx > 1) { ctx.lineWidth = 6; ctx.strokeStyle = '#141018'; caminho(c.idx); ctx.stroke(); }
      if (!c.fim && c.idx < c.pts.length) { const p = c.pts[c.idx], r = 9 + Math.sin(c.t * 8) * 3; ctx.strokeStyle = '#e0a826'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke(); }
      if (P.down && !c.fim) { ctx.fillStyle = c.vel > VEL_MAX ? '#e24b4a' : '#ffeb3b'; ctx.beginPath(); ctx.arc(P.x, P.y, 6, 0, Math.PI * 2); ctx.fill(); }
      DT.desenharEfeitos(ctx);
      ctx.restore();
      // selo (progresso) e tempo
      DT.caixa(ctx, 200, 12, 560, 44, 'rgba(10,6,18,0.9)', '#e0a826');
      DT.texto(ctx, 'SELO', 216, 27, 10, '#fac775');
      DT.caixa(ctx, 290, 20, 280, 26, '#2a1f3d', '#000'); ctx.fillStyle = '#c79bff'; ctx.fillRect(293, 23, 274 * c.idx / c.pts.length, 20);
      DT.texto(ctx, 'TEMPO', 590, 27, 8, '#b9acd0');
      DT.caixa(ctx, 650, 22, 100, 22, '#2a1f3d', '#000'); const tv = DT.clamp(c.tempo / TEMPO, 0, 1); ctx.fillStyle = tv > 0.3 ? '#9fe1cb' : '#e24b4a'; ctx.fillRect(653, 25, 94 * tv, 16);
      DT.texto(ctx, 'TATUAGEM LENDÁRIA', 480, 510, 14, '#ff5fb0', 'center');
      if (c.instrucao && !c.fim) {
        DT.caixa(ctx, 220, 380, 520, 92, 'rgba(18,12,30,0.94)', '#e0a826');
        DT.texto(ctx, 'TATUE O SÍMBOLO DO DUCK TATTOO', 480, 396, 10, '#f1efe8', 'center', false);
        DT.texto(ctx, 'Siga o tracejado devagar, pelo círculo dourado', 480, 420, 8, '#fac775', 'center', false);
        DT.texto(ctx, (DT.usandoToque ? 'TOQUE' : 'CLIQUE') + ' NO CÍRCULO PARA COMEÇAR', 480, 446, 8, '#9fe1cb', 'center', false);
      }
      if (c.fim) {
        ctx.fillStyle = 'rgba(16,8,28,0.62)'; ctx.fillRect(0, 0, DT.L, DT.A);
        const F = c.fim;
        DT.texto(ctx, F.perfeito ? 'TINTA SELADA!' : F.completo ? 'SELO FEITO!' : 'O SELO FALHOU...', 480, 180, 24, F.perfeito ? '#9fe1cb' : F.completo ? '#fac775' : '#e24b4a', 'center');
        DT.texto(ctx, 'PRECISÃO ' + F.precisao + '%', 480, 240, 12, '#f1efe8', 'center');
        DT.texto(ctx, '+' + F.moedas + ' MOEDAS', 480, 276, 14, '#fac775', 'center');
      }
    }
  };
})();
