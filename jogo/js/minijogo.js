/* Minijogo: Cliente Impaciente — 3 desenhos por cliente e "mão firme" */
(function () {
  'use strict';
  const DT = window.DT;
  const FALAS = [
    ['Tudo certo aí?', 'Vai demorar?', 'Tô com pressa!', 'AI!', 'Ficou top!'],
    ['Vai doer?', 'Tô suando...', 'Para, para!', 'AAAI!', 'Nem doeu!'],
    ['Filmando tudo!', 'Faz de novo pro vídeo', 'Meus seguidores...', 'AI! Corta!', 'Vai viralizar!'],
    ['Sou durão.', 'Tá demorando...', 'Snif...', 'BUÁÁÁ!', 'Que linda!']
  ];
  const DESENHOS = ['coracao', 'estrela', 'ancora'];
  const NOMES = { coracao: 'CORAÇÃO', estrela: 'ESTRELA', ancora: 'ÂNCORA' };
  const PACIENCIA_POR_SEG = 6;     // os 3 desenhos dividem a mesma paciência (~16s no total)
  const VEL_MAX = 650;             // px/s: acima disso a mão não está firme
  const TOLERANCIA = 30;           // distância para avançar no traço

  /* ---------- Formas: lista de traços, cada traço é uma lista de pontos ---------- */
  function bezier(p0, p1, p2, p3, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      pts.push({ x: u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        y: u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1] });
    }
    return pts;
  }
  const reta = (a, b) => [{ x: a[0], y: a[1] }, { x: b[0], y: b[1] }];
  function arco(cx, cy, r, a0, a1, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); }
    return pts;
  }
  function forma(nome) {
    if (nome === 'coracao') {
      const cx = 400, cy = 392, s = 2.0;
      const a = bezier([cx, cy + 22 * s], [cx - 40 * s, cy - 4 * s], [cx - 22 * s, cy - 30 * s], [cx, cy - 12 * s], 80);
      const b = bezier([cx, cy - 12 * s], [cx + 22 * s, cy - 30 * s], [cx + 40 * s, cy - 4 * s], [cx, cy + 22 * s], 80);
      return [a.concat(b.slice(1))];
    }
    if (nome === 'estrela') {
      const cx = 405, cy = 382, r = 68, v = [];
      for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; v.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr }); }
      return [v];
    }
    // âncora: 4 traços (argola, haste, travessa e o arco de baixo)
    const cx = 405, cy = 385;
    return [
      arco(cx, cy - 58, 11, -Math.PI / 2, Math.PI * 1.5, 24),
      reta([cx, cy - 47], [cx, cy + 46]),
      reta([cx - 26, cy - 26], [cx + 26, cy - 26]),
      arco(cx, cy + 6, 42, Math.PI, 0, 30) // da ponta esquerda até a direita, passando por baixo
    ];
  }
  // reamostra cada traço em pontos igualmente espaçados; o 1º ponto de cada traço novo é marcado
  function preparar(tracos, passo) {
    const out = [];
    tracos.forEach((tr, k) => {
      let resto = 0;
      out.push({ x: tr[0].x, y: tr[0].y, novo: k > 0 });
      for (let i = 1; i < tr.length; i++) {
        let a = tr[i - 1]; const b = tr[i];
        let d = Math.hypot(b.x - a.x, b.y - a.y);
        while (resto + d >= passo) {
          const t = (passo - resto) / d;
          a = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
          out.push({ x: a.x, y: a.y }); d = Math.hypot(b.x - a.x, b.y - a.y); resto = 0;
        }
        resto += d;
      }
      const ult = tr[tr.length - 1]; out.push({ x: ult.x, y: ult.y });
    });
    return out;
  }

  // usado também pelo Desafio do Decalque (Fase 2)
  DT.FORMAS_TATTOO = { forma, preparar };

  const Minijogo = DT.Minijogo = {
    nome: 'minijogo',
    iniciar() {
      const c = this;
      c.cliente = Math.floor(Math.random() * 4);
      c.desenho = 0;
      this.carregarDesenho();
      c.paciencia = 100; c.desvioSoma = 0; c.desvioN = 0;
      c.dor = 0; c.aiCool = 0; c.somT = 0; c.t = 0; c.fim = null; c.fimT = 0; c.instrucao = true;
      c.vel = 0; c.rapidoT = 0; c.trocaT = 0; c.ult = null;
      DT.controlesAtivos = false;
      DT.particulas = []; DT.textos = [];
      if (window.DuckSom) DuckSom.tocarMusica('minijogo');
    },
    // as formas são desenhadas em volta de (403, 386): leva para o meio da pele do antebraço (tela_braco_v2)
    carregarDesenho() {
      const tr = forma(DESENHOS[this.desenho]).map(t => t.map(p => ({ x: 430 + (p.x - 403) * 0.95, y: 276 + (p.y - 386) * 0.95 })));
      this.pts = preparar(tr, 6); this.idx = 0;
    },

    atualizar(dt) {
      const c = this, P = DT.ponteiro;
      c.t += dt;
      DT.atualizarEfeitos(dt);
      if (c.fim) {
        c.fimT -= dt;
        if (c.fimT <= 0 || (c.fimT < 2.4 && DT.ent.avancarP)) this.sair();
        return;
      }
      if (DT.ent.pausaP) c.paciencia = 0;
      if (P.down) c.instrucao = false;
      if (!c.instrucao && c.trocaT <= 0) {
        c.paciencia -= PACIENCIA_POR_SEG * dt;
        if (window.DuckSom) DuckSom.setVelocidadeMusica(1 + (100 - c.paciencia) / 160);
      }
      c.dor = Math.max(0, c.dor - dt); c.aiCool = Math.max(0, c.aiCool - dt); c.somT -= dt;
      if (c.trocaT > 0) { c.trocaT -= dt; c.ult = null; return; }

      // velocidade da mão (média suave)
      if (P.down && c.ult) {
        const v = Math.hypot(P.x - c.ult.x, P.y - c.ult.y) / Math.max(dt, 0.001);
        c.vel += (v - c.vel) * Math.min(1, dt * 10);
      } else c.vel *= 0.85;
      c.ult = P.down ? { x: P.x, y: P.y } : null;

      if (P.down && c.idx < c.pts.length) {
        const alvo = c.pts[c.idx];
        const viajando = alvo.novo && Math.hypot(P.x - alvo.x, P.y - alvo.y) > TOLERANCIA; // indo para o próximo traço
        if (!viajando) {
          let menor = 1e9;
          for (let i = Math.max(0, c.idx - 4); i < Math.min(c.pts.length, c.idx + 8); i++) {
            const d = Math.hypot(P.x - c.pts[i].x, P.y - c.pts[i].y); if (d < menor) menor = d;
          }
          c.desvioSoma += Math.min(menor, 60); c.desvioN++;
          const rapido = c.vel > VEL_MAX;
          // mão firme: rápido demais a agulha não pega a tinta (não avança) e machuca o cliente
          if (!rapido) while (c.idx < c.pts.length && Math.hypot(P.x - c.pts[c.idx].x, P.y - c.pts[c.idx].y) < TOLERANCIA) c.idx++;
          if (c.somT <= 0) { DT.som('tatuando'); c.somT = 0.13; }
          if (menor > 48) this.ai(P, 9);
          if (rapido) { c.rapidoT += dt; if (c.rapidoT > 0.15) { this.ai(P, 10, 'DEVAGAR!'); c.rapidoT = 0; } }
          else c.rapidoT = Math.max(0, c.rapidoT - dt);
        }
      }

      if (c.idx >= c.pts.length - 1) {
        DT.som('perfeito');
        DT.respingo(c.pts[c.pts.length - 1].x, c.pts[c.pts.length - 1].y, '#9fe1cb', 14, 200);
        if (c.desenho < DESENHOS.length - 1) {
          c.desenho++; this.carregarDesenho(); c.trocaT = 1.0; c.paciencia = Math.min(100, c.paciencia + 6);
        } else this.terminar(true);
      } else if (c.paciencia <= 0) this.terminar(false);
    },
    ai(P, perda, texto) {
      const c = this;
      if (c.aiCool > 0) return;
      c.aiCool = 0.9; c.dor = 0.7; c.paciencia -= perda; DT.som('ai'); DT.tremer(5, 0.2);
      DT.textoFlutuante(P.x, P.y - 30, texto || 'AI!', '#e24b4a', 14);
    },
    terminar(ok) {
      const c = this;
      if (ok) {
        const media = c.desvioSoma / Math.max(1, c.desvioN);
        const precisao = Math.round(DT.clamp(100 - media * 2.4, 0, 100));
        const perfeito = precisao >= 75 && c.paciencia > 25;
        c.fim = { ok: true, perfeito, precisao }; c.fimT = 3.4;
        DT.jogo.moedas += perfeito ? 40 : 15; DT.jogo.pontos += perfeito ? 1500 : 500;
      } else {
        c.fim = { ok: false, feitos: c.desenho }; c.fimT = 3;
        DT.som('quackBravo');
      }
      if (window.DuckSom) DuckSom.pararMusica();
    },
    sair() {
      DT.cenaAtual = DT.Nivel; DT.Nivel.voltarDoMinijogo();
      DT.particulas = []; DT.textos = [];
    },

    desenharIcone(ctx, nome, x, y, cor) {
      ctx.save(); ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.lineWidth = 3;
      if (nome === 'coracao') { DT.coracao(ctx, x - 7, y - 6, 2, cor !== '#4a3866'); }
      else if (nome === 'estrela') {
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 10; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
        ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(x, y - 8, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 9); ctx.moveTo(x - 5, y - 2); ctx.lineTo(x + 5, y - 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y + 2, 7, 0.2, Math.PI - 0.2); ctx.stroke();
      }
      ctx.restore();
    },

    desenhar(ctx) {
      const c = this, P = DT.ponteiro;
      ctx.save(); ctx.translate(DT.tremorX, DT.tremorY);
      ctx.drawImage(DT.IM.braco, 0, 0, DT.L, DT.A);
      const caminho = (ate) => {
        ctx.beginPath();
        for (let i = 0; i < Math.min(ate, c.pts.length); i++) { const p = c.pts[i]; (i === 0 || p.novo) ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (c.trocaT <= 0) {
        ctx.setLineDash([7, 8]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(50,30,80,0.9)';
        caminho(c.pts.length); ctx.stroke(); ctx.setLineDash([]);
        if (c.idx > 1) { ctx.lineWidth = 7; ctx.strokeStyle = '#141018'; caminho(c.idx); ctx.stroke(); }
        if (!c.fim && c.idx < c.pts.length) {
          const p = c.pts[c.idx], r = 10 + Math.sin(c.t * 8) * 3;
          ctx.strokeStyle = '#e0a826'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        }
      }
      if (P.down && !c.fim) { ctx.fillStyle = c.vel > VEL_MAX ? '#e24b4a' : '#ffeb3b'; ctx.beginPath(); ctx.arc(P.x, P.y, 6, 0, Math.PI * 2); ctx.fill(); }
      DT.desenharEfeitos(ctx);
      ctx.restore();

      // cliente
      const exp = c.fim ? (c.fim.ok ? 4 : 2) : c.dor > 0 ? 3 : c.paciencia > 65 ? 0 : c.paciencia > 35 ? 1 : 2;
      DT.caixa(ctx, 16, 70, 200, 210, 'rgba(18,12,30,0.92)', c.dor > 0 ? '#e24b4a' : '#ff5fb0');
      DT.desenharAltura(ctx, 'clientes', c.cliente * 5 + exp, 116, 262, 178, false);
      DT.caixa(ctx, 16, 286, 200, 34, 'rgba(241,239,232,0.95)', '#000');
      DT.texto(ctx, FALAS[c.cliente][exp], 116, 298, 8, '#1a1426', 'center', false);
      // paciência
      DT.caixa(ctx, 240, 14, 500, 44, 'rgba(10,6,18,0.88)', '#e0a826');
      DT.texto(ctx, 'PACIÊNCIA', 256, 29, 10, '#fac775');
      DT.caixa(ctx, 390, 22, 336, 26, '#2a1f3d', '#000');
      const pv = DT.clamp(c.paciencia / 100, 0, 1);
      ctx.fillStyle = pv > 0.5 ? '#9fe1cb' : pv > 0.25 ? '#ef9f27' : '#e24b4a'; ctx.fillRect(393, 25, 330 * pv, 20);
      // desenhos 1/3
      DT.caixa(ctx, 760, 14, 184, 44, 'rgba(10,6,18,0.88)', '#e0a826');
      DT.texto(ctx, 'DESENHO ' + Math.min(c.desenho + 1, 3) + '/3', 852, 20, 8, '#f4c0d1', 'center', false);
      DESENHOS.forEach((d, i) => this.desenharIcone(ctx, d, 812 + i * 40, 42, i < c.desenho ? '#9fe1cb' : i === c.desenho ? '#fac775' : '#4a3866'));
      // mão firme
      DT.caixa(ctx, 760, 66, 184, 74, 'rgba(10,6,18,0.88)', '#4a3866');
      DT.texto(ctx, 'MÃO FIRME', 852, 76, 8, '#9fe1cb', 'center', false);
      DT.caixa(ctx, 776, 94, 152, 18, '#2a1f3d', '#000');
      const nv = DT.clamp(c.vel / (VEL_MAX * 1.4), 0, 1), rapido = c.vel > VEL_MAX;
      ctx.fillStyle = rapido ? '#e24b4a' : '#9fe1cb'; ctx.fillRect(779, 97, 146 * nv, 12);
      ctx.fillStyle = '#fac775'; ctx.fillRect(779 + 146 / 1.4, 94, 2, 18);
      DT.texto(ctx, rapido ? 'DEVAGAR!' : 'OK', 852, 120, 8, rapido ? '#e24b4a' : '#9fe1cb', 'center', false);
      DT.texto(ctx, 'CLIENTE IMPACIENTE', 480, 506, 14, '#ff5fb0', 'center');

      if (c.trocaT > 0 && !c.fim) {
        DT.caixa(ctx, 290, 200, 380, 70, 'rgba(18,12,30,0.94)', '#9fe1cb');
        DT.texto(ctx, 'PRÓXIMO: ' + NOMES[DESENHOS[c.desenho]], 480, 226, 12, '#9fe1cb', 'center', false);
      }
      if (c.instrucao && !c.fim) {
        DT.caixa(ctx, 230, 130, 520, 92, 'rgba(18,12,30,0.94)', '#e0a826');
        DT.texto(ctx, 'ARRASTE SOBRE O TRACEJADO', 490, 146, 11, '#f1efe8', 'center', false);
        DT.texto(ctx, 'COMEÇANDO PELO CÍRCULO DOURADO', 490, 170, 9, '#fac775', 'center', false);
        DT.texto(ctx, 'SÃO 3 DESENHOS. VÁ COM CALMA: MÃO FIRME!', 490, 194, 8, '#9fe1cb', 'center', false);
      }
      if (c.fim) {
        ctx.fillStyle = 'rgba(16,8,28,0.6)'; ctx.fillRect(0, 0, DT.L, DT.A);
        if (c.fim.ok) {
          DT.texto(ctx, c.fim.perfeito ? 'PERFEITO!' : 'BOM TRABALHO!', 480, 190, 30, c.fim.perfeito ? '#9fe1cb' : '#fac775', 'center');
          DT.texto(ctx, 'PRECISÃO ' + c.fim.precisao + '%', 480, 250, 14, '#f1efe8', 'center');
          DT.texto(ctx, '+' + (c.fim.perfeito ? 40 : 15) + ' MOEDAS', 480, 285, 14, '#fac775', 'center');
        } else {
          DT.texto(ctx, 'O CLIENTE FOI EMBORA!', 480, 200, 22, '#e24b4a', 'center');
          DT.texto(ctx, 'Desenhos feitos: ' + c.fim.feitos + '/3', 480, 250, 12, '#f1efe8', 'center');
          DT.texto(ctx, 'Quack. Fica pra próxima.', 480, 280, 11, '#b9acd0', 'center');
        }
      }
    }
  };
})();
