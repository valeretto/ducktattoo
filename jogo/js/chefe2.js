/* Chefão da Fase 2: Caveirão Marinheiro (usa a base de chefe.js) */
(function () {
  'use strict';
  const DT = window.DT;
  const CHAO = 470;

  // quadros da folha 'chefe2' (ver ferramentas/mapa-sprites.html?f=fase2/chefe_caveirao_marinheiro.webp)
  const A = {
    parado: [[4, 6, 7, 9], 4], // só os quadros com tapa-olho (igual à caminhada)
    andar: [[0, 1, 2, 3, 4, 5], 9, null, 'andar2'],
    ganchoCarga: [[10], 1], gancho: [[11, 12, 13], 12],
    ancoraCarga: [[14, 15], 4], ancoraLanca: [[16], 1, 'e'],
    golpeCarga: [[17, 18], 4], golpe: [[19], 1],
    chamar: [[21, 22, 23], 3, null, null, true],
    furia: [[25, 26, 27, 28], 8], invencivel: [[26, 27, 28], 8], furiaParado: [[26, 27, 28], 6],
    dano: [[29, 30], 10], tonto: [[31, 32], 4],
    derrota: [[33, 34, 35, 36, 37], 2, null, null, true]
  };
  const FX = { osso: 38, ancora: 39, onda: 40, bala: 41, respingo: 42, fumaca: 43 };

  const Chefe2 = DT.Chefe2 = Object.assign(Object.create(DT.Chefe), {
    nome: 'chefe2',
    cfg: { folha: 'chefe2', arena: 'arena2', vida: 110, nome: 'CAVEIRÃO MARINHEIRO', A, refFrame: 4, altura: 200,
      grito: 'AHOY! ESSE CARTUCHO É MEU!', animFuriaParado: 'furiaParado', derrotaAnimada: true },

    iniciar() {
      DT.Chefe.iniciar.call(this);
      this.inimigos = []; this.canhaoT = 3; this.canhaoAviso = null;
    },

    atualizar(dt) {
      DT.Chefe.atualizar.call(this, dt);
      if (this.boss.estado === 'derrota') { this.inimigos.forEach(e => { if (!e.morrendo) e.morrendo = 0.5; }); }
      DT.atualizarInimigos(this, dt);
      DT.colisoesProjeteis(this);
      this.atualizarCanhoes(dt);
    },

    // Na fúria, os canhões do navio atiram balas rente ao chão (pule!)
    atualizarCanhoes(dt) {
      const c = this, b = c.boss;
      if (b.fase !== 2 || b.estado === 'derrota' || b.sumiu) { c.canhaoAviso = null; return; }
      if (c.canhaoAviso) {
        c.canhaoAviso.t -= dt;
        if (c.canhaoAviso.t <= 0) {
          const lado = c.canhaoAviso.lado, x = lado < 0 ? 30 : DT.L - 30;
          DT.projInimigos.push({ tipo: 'bala', x, y: CHAO - 34, vx: -lado * 430, vy: 0, r: 16, vida: 3, dano: 1, atravessa: true });
          DT.som('frascoBum'); DT.tremer(5, 0.2); DT.respingo(x, CHAO - 40, '#888780', 10, 200);
          c.canhaoAviso = null;
        }
        return;
      }
      c.canhaoT -= dt;
      if (c.canhaoT <= 0) { c.canhaoAviso = { lado: Math.random() < 0.5 ? -1 : 1, t: 0.7 }; c.canhaoT = DT.aleat(3.2, 4.5); DT.som('avisoBomba'); }
    },

    atualizarBoss(dt) {
      const c = this, b = c.boss, j = c.jog;
      b.animT += dt; b.t -= dt; b.flash = Math.max(0, b.flash - dt);
      const dx = j.x - b.x, rapido = b.fase === 2 ? 1.3 : 1;

      switch (b.estado) {
        case 'entrada':
          b.vy += 1600 * dt; b.y = Math.min(CHAO, b.y + b.vy * dt);
          if (b.y >= CHAO && !b.pousou) {
            b.pousou = true; DT.tremer(14, 0.5); DT.som('chefeEntrada');
            DT.respingo(b.x, CHAO - 10, '#8a3fe0', 30, 400);
            b.anim = 'golpe'; b.t = 2.2;
            DT.textoFlutuante(DT.L / 2, 150, c.cfg.grito, '#ff5fb0', 16);
          }
          if (b.pousou && b.t <= 0) { j.controlavel = true; if (window.DuckSom) DuckSom.tocarMusica('chefe2'); this.mudar('parado', 1.0); }
          return;
        case 'parado':
          b.dir = Math.sign(dx) || b.dir;
          if (b.t <= 0) this.escolherAtaque();
          break;
        case 'andar': // aproxima antes do golpe
          b.dir = Math.sign(dx) || b.dir;
          b.x += b.dir * 150 * rapido * dt;
          if (Math.abs(dx) < 260 || b.t <= 0) { this.mudar('golpeCarga', 0.6 / rapido); DT.som('avisoGiro'); }
          break;
        case 'ganchoCarga':
          if (Math.random() < 0.4) DT.particulas.push({ x: b.x + DT.aleat(-50, 50), y: b.y - 120, vx: DT.aleat(-40, 40), vy: -160, vida: 0.4, cor: '#c79bff', tam: 6 });
          if (b.t <= 0) { b.dir = Math.sign(dx) || b.dir; this.mudar('gancho', 1.4); DT.som('maquininha'); }
          break;
        case 'gancho':
          b.x += b.dir * 430 * rapido * dt;
          if (Math.floor(b.animT * 5) !== Math.floor((b.animT - dt) * 5)) DT.som('maquininha');
          if (b.x < 90 || b.x > DT.L - 90 || b.t <= 0) { b.x = DT.clamp(b.x, 90, DT.L - 90); DT.tremer(8, 0.3); this.mudar('tonto', 1.2); }
          break;
        case 'ancoraCarga':
          if (b.t <= 0) { c.marcas.filter(m => m.tipo === 'bomba').forEach(m => this.lancarAncora(m.x)); this.mudar('ancoraLanca', 0.6); }
          break;
        case 'golpeCarga':
          if (b.t <= 0) {
            this.mudar('golpe', 0.5); DT.som('frascoBum'); DT.tremer(10, 0.35);
            DT.respingo(b.x + b.dir * 60, CHAO - 10, '#8a3fe0', 20, 300);
            const dirs = b.fase === 2 ? [-1, 1] : [b.dir];
            dirs.forEach(d => DT.projInimigos.push({ tipo: 'onda', x: b.x + d * 70, y: CHAO - 24, vx: d * 360, vy: 0, r: 24, vida: 3, dano: 1, atravessa: true }));
          }
          break;
        case 'chamar':
          if (!b.chamou && b.t < 0.6) {
            b.chamou = true; DT.som('chefeRugido');
            const vivos = c.inimigos.filter(e => !e.morrendo).length;
            for (let k = 0; k < Math.min(2, 3 - vivos); k++) {
              const x = DT.clamp(j.x + (k ? 1 : -1) * DT.aleat(160, 260), 80, DT.L - 80);
              const z = DT.criarInimigo('zumbi', x, CHAO);
              z.levantando = 0.8; z.dir = Math.sign(j.x - x) || 1; c.inimigos.push(z);
              DT.respingo(x, CHAO - 10, '#8a3fe0', 14, 220);
            }
          }
          if (b.t <= 0) this.mudar('parado', 0.6);
          break;
        case 'ancoraLanca': case 'golpe': case 'tonto':
          if (b.t <= 0) this.mudar('parado', (b.estado === 'tonto' ? 0.4 : 0.8) / rapido);
          break;
        case 'furia':
          if (b.t <= 0) this.mudar('parado', 0.6);
          break;
        case 'derrota':
          if (Math.random() < 0.25) DT.respingo(b.x + DT.aleat(-60, 60), b.y - DT.aleat(20, 140), Math.random() < 0.5 ? '#8a3fe0' : '#f3ead3', 3, 200);
          if (b.t <= 0 && !c.cartucho) {
            c.cartucho = { x: b.x, y: b.y - 120, vy: -300 };
            DT.respingo(b.x, b.y - 80, '#fac775', 30, 380);
            b.sumiu = true;
          }
          return;
      }
      this.furiaEContato();
    },

    escolherAtaque() {
      const c = this, b = c.boss, j = c.jog;
      const opcoes = b.fase === 1 ? ['gancho', 'ancora', 'golpe'] : ['gancho', 'ancora', 'golpe', 'chamar'];
      const lista = opcoes.filter(o => o !== b.ultimo);
      const at = lista[Math.floor(Math.random() * lista.length)];
      b.ultimo = at;
      const r = b.fase === 2 ? 0.8 : 1;
      if (at === 'gancho') { this.mudar('ganchoCarga', 0.6 * r); DT.som('avisoGiro'); }
      else if (at === 'ancora') {
        const alvos = [DT.clamp(j.x, 60, DT.L - 60)];
        if (b.fase === 2) alvos.push(DT.clamp(j.x + (Math.random() < 0.5 ? -1 : 1) * DT.aleat(160, 260), 60, DT.L - 60));
        alvos.forEach(x => c.marcas.push({ tipo: 'bomba', x, t: 2.4 }));
        this.mudar('ancoraCarga', 0.9 * r); DT.som('avisoBomba');
      } else if (at === 'golpe') this.mudar('andar', 1.6);
      else if (at === 'chamar') { b.chamou = false; this.mudar('chamar', 1.3); }
    },

    lancarAncora(alvoX) {
      const b = this.boss, ox = b.x + b.dir * 60, oy = b.y - 140, T = 0.75, g = 1300;
      const vx = (alvoX - ox) / T, vy = ((CHAO - 20 - oy) - 0.5 * g * T * T) / T;
      DT.projInimigos.push({ tipo: 'ancoraP', x: ox, y: oy, vx, vy, gravidade: g, r: 26, vida: 3, dano: 0, atravessa: false,
        aoBater: p => {
          DT.som('frascoBum'); DT.tremer(9, 0.3);
          DT.respingo(p.x, CHAO - 20, '#8a3fe0', 22, 360);
          const j = this.jog;
          if (Math.abs(j.x - p.x) < 85 && j.y > CHAO - 110) DT.ferirJogador(j, 1, p.x);
          this.marcas = this.marcas.filter(m => !(m.tipo === 'bomba' && Math.abs(m.x - p.x) < 5));
        } });
      DT.som('rosaEspinhos');
    },

    caixaBoss() {
      const b = this.boss;
      const h = b.estado === 'gancho' ? 95 : 180; // girando ele se abaixa: dá para pular por cima
      return { x: b.x - 55, y: b.y - h, w: 110, h };
    },

    desenharExtras(ctx) {
      const c = this;
      DT.desenharInimigos(ctx, c);
      if (c.canhaoAviso) { // canhão prestes a atirar
        const x = c.canhaoAviso.lado < 0 ? 60 : DT.L - 60, p = 0.5 + Math.sin(c.t * 30) * 0.4;
        ctx.fillStyle = 'rgba(255,154,154,' + p + ')'; ctx.beginPath(); ctx.arc(x, CHAO - 40, 26, 0, Math.PI * 2); ctx.fill();
        DT.texto(ctx, '!', x, CHAO - 110, 18, '#e24b4a', 'center');
      }
      const b = c.boss;
      if (b.estado === 'golpeCarga' || b.estado === 'ganchoCarga') DT.texto(ctx, '!', b.x, b.y - 230, 20, '#e24b4a', 'center');
    }
  });
})();
