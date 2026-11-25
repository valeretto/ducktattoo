/* Chefão final: Demônio do Nanquim (usa a base de chefe.js)
   Parte 1: vira sombra, some na poça e faz mãos de tinta saírem do chão.
   Parte 2 (66%): sopro de fogo roxo, garrada e chama inimigos.
   Parte 3 (fúria, 50%): absorve os cartuchos. Só o poder dos cartuchos fere: pegue os cartuchos que flutuam nas plataformas. */
(function () {
  'use strict';
  const DT = window.DT;
  const CHAO = 470;

  // quadros da folha 'chefe5' (ver ferramentas/mapa-sprites.html?f=fase5/chefe_demonio.webp)
  const A = {
    parado: [[0, 1, 2, 3, 4, 5], 6], andar: [[0, 1, 2, 3, 4, 5], 9],
    afundar: [[6, 7, 8, 9], 6, null, null, true], poca: [[9], 1], subir: [[9, 8, 7, 6], 6, null, null, true],
    maos: [[10, 11, 12, 13], 4, null, null, true],
    inspirar: [[14, 15], 3, null, null, true], sopro: [[16, 17], 6, 'e'], soproFim: [[18], 1],
    garraCarga: [[19], 1], garra: [[20, 21, 22], 10, null, null, true],
    chamar: [[10, 11], 4, null, null, true],
    furia: [[23, 24, 25, 26, 27], 6, null, null, true], invencivel: [[25, 26, 27], 8], furiaParado: [[26, 27], 5],
    dano: [[28, 29], 10], tonto: [[30, 31], 3],
    derrota: [[32, 33, 34, 35, 37], 2, null, null, true]
  };
  const PLATS = [[50, 370, 210], [700, 370, 210], [385, 285, 190]];
  const PEDESTAIS = [[338, 158], [404, 202], [482, 158], [560, 202], [626, 158]]; // na arte da arena

  DT.Chefe5 = Object.assign(Object.create(DT.Chefe), {
    nome: 'chefe5',
    cfg: { folha: 'chefe5', arena: 'arena5', vida: 160, nome: 'DEMÔNIO DO NANQUIM', A, refFrame: 0, altura: 210,
      grito: 'HEHEHE... OBRIGADO POR TRAZEREM OS CARTUCHOS!', animFuriaParado: 'furiaParado', derrotaAnimada: true },

    iniciar() {
      DT.Chefe.iniciar.call(this);
      this.inimigos = []; this.maos = []; this.parte = 1; this.cartuchosF = []; this.avisoT = 0;
    },

    atualizar(dt) {
      DT.Chefe.atualizar.call(this, dt);
      const c = this, b = c.boss, j = c.jog;
      if (b.estado === 'derrota') c.inimigos.forEach(e => { if (!e.morrendo) e.morrendo = 0.5; });
      DT.atualizarInimigos(c, dt);
      DT.colisoesProjeteis(c);
      c.avisoT = Math.max(0, c.avisoT - dt);
      // parte 2 aos 66%
      if (c.parte === 1 && b.vida <= c.cfg.vida * 0.66 && b.estado !== 'derrota') { c.parte = 2; DT.som('demonioRisada'); DT.textoFlutuante(DT.L / 2, 150, 'AGORA É SÉRIO!', '#ff5fb0', 16); DT.som('chefeRugido'); }
      // mãos de tinta: marca roxa, depois a mão sobe e machuca
      c.maos.forEach(m => {
        m.t -= dt;
        if (m.t <= 0 && !m.subiu) { m.subiu = true; m.vida = 0.6; DT.som('caveiraRacha'); DT.respingo(m.x, CHAO - 10, '#3b1a5c', 10, 220); }
        if (m.subiu) { m.vida -= dt; if (m.vida > 0 && Math.abs(j.x - m.x) < 40 && j.y > CHAO - 120) DT.ferirJogador(j, 1, m.x); }
      });
      c.maos = c.maos.filter(m => !m.subiu || m.vida > 0);
      // fúria: cartuchos flutuando nas plataformas dão o poder que fere o Demônio
      if (b.fase === 2 && b.estado !== 'derrota' && !b.sumiu) {
        PLATS.forEach((p, i) => {
          let k = c.cartuchosF[i];
          if (!k) k = c.cartuchosF[i] = { x: p[0] + p[2] / 2, y: p[1] - 56, volta: 0, ativo: true };
          if (!k.ativo) { k.volta -= dt; if (k.volta <= 0) k.ativo = true; return; }
          if (DT.sobrepoe(DT.caixaDe(j), { x: k.x - 20, y: k.y - 30, w: 40, h: 60 })) {
            k.ativo = false; k.volta = 7;
            DT.pegarPoder('forte', k.x, k.y); DT.textoFlutuante(k.x, k.y - 70, 'PODER DOS CARTUCHOS!', '#fac775', 10);
          }
        });
      }
    },

    aoEntrarFuria() {
      DT.textoFlutuante(DT.L / 2, 180, 'ELE PEGOU OS CARTUCHOS!', '#ff5fb0', 13);
      setTimeout(() => DT.textoFlutuante(DT.L / 2, 210, 'PEGUE OS CARTUCHOS DAS PLATAFORMAS!', '#fac775', 10), 1500);
    },

    // na fúria, só o tiro com o poder dos cartuchos (tiro forte) fere o Demônio
    colisoesBoss() {
      const c = this, b = c.boss;
      if (b.fase === 2 && b.estado !== 'derrota' && !DT.poderAtivo('forte')) {
        const cb = this.caixaBoss();
        DT.projeteis.forEach(p => {
          if (p.vida <= 0 || !DT.sobrepoe(DT.caixaProjetil(p), cb)) return;
          p.vida = 0; DT.respingo(p.x, p.y, '#f1efe8', 4, 120);
          if (!c.avisoT) { c.avisoT = 2; DT.som('clique'); DT.textoFlutuante(b.x, b.y - 240, 'PEGUE UM CARTUCHO!', '#fac775', 10); }
        });
        return;
      }
      if (b.estado === 'afundar' || b.estado === 'poca' || b.estado === 'subir') { // como sombra ele não apanha
        const cb = this.caixaBoss();
        DT.projeteis.forEach(p => { if (p.vida > 0 && DT.sobrepoe(DT.caixaProjetil(p), cb)) { p.vida = 0; DT.respingo(p.x, p.y, '#3b1a5c', 4, 120); } });
        return;
      }
      DT.Chefe.colisoesBoss.call(this);
    },

    atualizarBoss(dt) {
      const c = this, b = c.boss, j = c.jog;
      b.animT += dt; b.t -= dt; b.flash = Math.max(0, b.flash - dt);
      const dx = j.x - b.x, rapido = b.fase === 2 ? 1.25 : c.parte === 2 ? 1.1 : 1;
      switch (b.estado) {
        case 'entrada':
          b.vy += 1600 * dt; b.y = Math.min(CHAO, b.y + b.vy * dt);
          if (b.y >= CHAO && !b.pousou) {
            b.pousou = true; DT.tremer(14, 0.6); DT.som('chefeEntrada'); DT.som('demonioRisada');
            DT.respingo(b.x, CHAO - 10, '#8a3fe0', 30, 400);
            b.anim = 'maos'; b.animT = 0; b.t = 2.6;
            DT.textoFlutuante(DT.L / 2, 150, c.cfg.grito, '#ff5fb0', 11);
          }
          if (b.pousou && b.t <= 0) { j.controlavel = true; if (window.DuckSom) DuckSom.tocarMusica('chefe5'); this.mudar('parado', 1.0); }
          return;
        case 'parado':
          b.dir = Math.sign(dx) || b.dir;
          if (b.t <= 0) this.escolherAtaque();
          break;
        case 'afundar': if (b.t <= 0) { this.mudar('poca', 1.2); b.alvoX = j.x < DT.L / 2 ? DT.aleat(620, 820) : DT.aleat(140, 340); } break;
        case 'poca': { // desliza como uma poça até o outro lado
          const ax = b.alvoX - b.x; b.x += Math.sign(ax) * Math.min(Math.abs(ax), 360 * dt);
          if (b.t <= 0) { this.mudar('subir', 0.6); DT.som('chefeRugido'); }
          return; // sem contato enquanto é poça
        }
        case 'subir': if (b.t <= 0) this.mudar('parado', 0.6 / rapido); return;
        case 'maos':
          if (b.t <= 0) this.mudar('parado', 0.8 / rapido);
          break;
        case 'inspirar':
          if (b.t <= 0) { this.mudar('sopro', 1.0); b.soproT = 0; DT.som('dragaoSopro'); }
          break;
        case 'sopro':
          b.soproT -= dt;
          if (b.soproT <= 0) {
            b.soproT = 0.16;
            const ox = b.x + b.dir * 90, oy = b.y - 150, ang = Math.atan2((j.y - 40) - oy, j.x - ox) + DT.aleat(-0.1, 0.1);
            DT.projInimigos.push({ tipo: 'fogoDemonio', x: ox, y: oy, vx: Math.cos(ang) * 400, vy: Math.sin(ang) * 400, r: 16, vida: 2.5, dano: 1, atravessa: true });
          }
          if (b.t <= 0) this.mudar('soproFim', 0.5);
          break;
        case 'andar':
          b.dir = Math.sign(dx) || b.dir; b.x += b.dir * 160 * rapido * dt;
          if (Math.abs(dx) < 250 || b.t <= 0) { this.mudar('garraCarga', 0.5 / rapido); DT.som('avisoGiro'); }
          break;
        case 'garraCarga':
          if (b.t <= 0) {
            this.mudar('garra', 0.5); DT.som('maquininha');
            DT.projInimigos.push({ tipo: 'arco', x: b.x + b.dir * 110, y: CHAO - 94, vx: b.dir * 500 * rapido, vy: 0, r: 26, vida: 2, dano: 1, atravessa: true });
          }
          break;
        case 'chamar':
          if (!b.chamou && b.t < 0.5) {
            b.chamou = true; DT.som('demonioRisada');
            const vivos = c.inimigos.filter(e => !e.morrendo).length;
            for (let k = 0; k < Math.min(2, 3 - vivos); k++) {
              const tipo = Math.random() < 0.5 ? 'gosma' : 'morcego', x = DT.clamp(j.x + (k ? 1 : -1) * DT.aleat(180, 280), 80, DT.L - 80);
              const e = DT.criarInimigo(tipo, x, tipo === 'morcego' ? 220 : CHAO); e.base = x; e.dir = Math.sign(j.x - x) || 1; c.inimigos.push(e);
              DT.respingo(x, tipo === 'morcego' ? 220 : CHAO - 10, '#8a3fe0', 14, 220);
            }
          }
          if (b.t <= 0) this.mudar('parado', 0.6);
          break;
        case 'soproFim': case 'garra': case 'tonto':
          if (b.t <= 0) this.mudar('parado', (b.estado === 'tonto' ? 0.4 : 0.8) / rapido);
          break;
        case 'furia':
          if (b.t <= 0) this.mudar('parado', 0.6);
          break;
        case 'derrota':
          if (b.animT > 1 && Math.random() < 0.35) DT.respingo(b.x + DT.aleat(-90, 90), b.y - DT.aleat(20, 180), ['#e24b4a', '#58a6ff', '#fac775', '#ff5fb0', '#8a3fe0'][Math.floor(Math.random() * 5)], 3, 260);
          if (b.t <= 0 && !c.cartucho) {
            c.cartucho = { x: b.x, y: b.y - 120, vy: -300 };
            DT.respingo(b.x, b.y - 80, '#fac775', 30, 380);
            b.sumiu = true; c.maos = [];
          }
          return;
      }
      this.furiaEContato();
    },

    escolherAtaque() {
      const c = this, b = c.boss, j = c.jog;
      const opcoes = c.parte === 1 && b.fase === 1 ? ['sombra', 'maos', 'garra'] : ['sombra', 'maos', 'sopro', 'garra', 'chamar'];
      const lista = opcoes.filter(o => o !== b.ultimo);
      const at = lista[Math.floor(Math.random() * lista.length)];
      b.ultimo = at;
      const r = b.fase === 2 ? 0.8 : 1;
      if (at === 'sombra') { this.mudar('afundar', 0.7); DT.som('luvaPloc'); }
      else if (at === 'maos') {
        const n = b.fase === 2 ? 4 : c.parte === 2 ? 3 : 2, xs = [DT.clamp(j.x, 40, DT.L - 40)];
        while (xs.length < n) { const x = DT.aleat(60, DT.L - 60); if (xs.every(o => Math.abs(o - x) > 110)) xs.push(x); }
        xs.forEach((x, i) => c.maos.push({ x, t: 1.1 + i * 0.15 }));
        this.mudar('maos', 1.2 * r); DT.som('avisoChuva');
      } else if (at === 'sopro') { this.mudar('inspirar', 0.8 * r); DT.som('avisoTiro'); }
      else if (at === 'garra') this.mudar('andar', 1.6);
      else { b.chamou = false; this.mudar('chamar', 1.2); }
    },

    caixaBoss() {
      const b = this.boss;
      if (b.estado === 'poca' || b.estado === 'afundar' || b.estado === 'subir') return { x: b.x - 70, y: b.y - 40, w: 140, h: 40 };
      return { x: b.x - 70, y: b.y - 170, w: 140, h: 170 };
    },

    desenharPlataforma(ctx, s) { DT.desenharPapel(ctx, s.x, s.y, s.w); },

    desenharExtras(ctx) {
      const c = this, b = c.boss;
      // fúria: pedestais da arena acendem
      if (b.fase === 2 && !b.sumiu) PEDESTAIS.forEach(([x, y], i) => {
        ctx.fillStyle = 'rgba(255,95,176,' + (0.25 + Math.sin(c.t * 5 + i) * 0.12) + ')'; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
      });
      // mãos de tinta: marca e depois a mão
      c.maos.forEach(m => {
        if (!m.subiu) {
          ctx.save(); ctx.globalAlpha = 0.45 + Math.sin(c.t * 14) * 0.2; ctx.fillStyle = '#8a3fe0';
          ctx.beginPath(); ctx.ellipse(m.x, CHAO - 4, 46, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        } else DT.desenharAltura(ctx, 'chefe5', 38, m.x, CHAO + 6, 70 + Math.min(1, (0.6 - m.vida) * 6) * 60, false);
      });
      // cartuchos da fúria
      c.cartuchosF.forEach(k => {
        if (!k || !k.ativo || b.fase !== 2 || b.sumiu) return;
        ctx.fillStyle = 'rgba(250,199,117,' + (0.3 + Math.sin(c.t * 6) * 0.12) + ')'; ctx.beginPath(); ctx.arc(k.x, k.y, 28, 0, Math.PI * 2); ctx.fill();
        DT.desenharCartucho16(ctx, k.x, k.y + 26 + Math.sin(c.t * 3) * 4, 'transparente', c.t, 1.1);
      });
      DT.desenharInimigos(ctx, c);
      if (['inspirar', 'garraCarga', 'afundar'].includes(b.estado)) DT.texto(ctx, '!', b.x, b.y - 240, 20, '#e24b4a', 'center');
    }
  });
})();
