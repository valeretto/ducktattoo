/* Chefão da Fase 4: Dragão de Tinta (usa a base de chefe.js). Ele voa: fica em alturas diferentes pela arena. */
(function () {
  'use strict';
  const DT = window.DT;
  const CHAO = 470;
  const BAIXO = CHAO - 14, ALTO = CHAO - 80; // (o alto ficou mais baixo: dá para acertar do chão pulando) // alturas em que ele paira (pé do desenho)

  // quadros da folha 'chefe4' (ver ferramentas/mapa-sprites.html?f=fase4/chefe_dragao_tinta.webp)
  const A = {
    parado: [[0, 1, 2, 3, 4, 5], 6], voar: [[6, 7, 8, 9], 10],
    mordCarga: [[11, 12], 4], mordida: [[13, 14], 10], mordFim: [[15], 1],
    inspirar: [[17, 18], 3, null, null, true], sopro: [[19, 20], 8], soproFim: [[21], 1],
    rabadaCarga: [[22], 1], rabada: [[23, 24, 25], 8, null, null, true],
    subir: [[26, 27], 6], mergulhar: [[28, 29], 8], impacto: [[30], 1],
    furia: [[31, 32, 33, 34], 8], invencivel: [[31, 32, 33, 34], 8], furiaParado: [[31, 32, 33, 34], 6],
    dano: [[35, 36], 10], tonto: [[36, 37], 3],
    derrota: [[39, 40, 41, 42, 43], 2, null, null, true]
  };

  const Chefe4 = DT.Chefe4 = Object.assign(Object.create(DT.Chefe), {
    nome: 'chefe4',
    cfg: { folha: 'chefe4', arena: 'arena4', vida: 110, coracaoIntervalo: 15, nome: 'DRAGÃO DE TINTA', A, refFrame: 0, altura: 170,
      grito: 'ESSE CARTUCHO AGORA É MEU TESOURO!', animFuriaParado: 'furiaParado', derrotaAnimada: true },

    iniciar() {
      DT.Chefe.iniciar.call(this);
      const b = this.boss;
      b.x = 1100; b.y = 120; b.alvoX = 700; b.alvoY = BAIXO; b.anim = 'voar';
      this.chuva = false; this.chuvaT = 2;
      if (window.DuckSom) DuckSom.pararMusica();
    },

    atualizar(dt) {
      DT.Chefe.atualizar.call(this, dt);
      this.atualizarChuva(dt);
    },

    aoEntrarFuria() { this.chuva = true; this.chuvaT = 1.5; DT.textoFlutuante(DT.L / 2, 180, 'CHUVA DE NANQUIM!', '#c79bff', 16); },

    // Na fúria: marcas roxas no chão e, logo depois, gotas de nanquim caindo nelas
    atualizarChuva(dt) {
      const c = this, b = c.boss, j = c.jog;
      if (!c.chuva || b.estado === 'derrota' || b.sumiu) return;
      c.chuvaT -= dt;
      if (c.chuvaT <= 0) {
        c.chuvaT = DT.aleat(3.8, 4.4); // mais fácil: 2 gotas a cada ~4 s
        const xs = [DT.clamp(j.x + DT.aleat(-20, 20), 40, DT.L - 40)];
        while (xs.length < 2) { const x = DT.aleat(60, DT.L - 60); if (xs.every(o => Math.abs(o - x) > 120)) xs.push(x); }
        xs.forEach((x, i) => {
          c.marcas.push({ tipo: 'chuva', x, t: 1.75 + i * 0.15 });
          DT.projInimigos.push({ tipo: 'gotaNanquim', x, y: -40, vx: 0, vy: 0, r: 14, vida: 4, dano: 1, espera: 0.85 + i * 0.15,
            aoAtualizar: (p, d) => { if (p.espera > 0) { p.espera -= d; p.vy = 0; } else p.vy = Math.min(800, p.vy + 1600 * d); },
            aoBater: p => DT.respingo(p.x, CHAO - 6, '#3b1a5c', 10, 200) });
        });
        DT.som('avisoChuva');
      }
    },

    // voa suavemente até o ponto (alvoX, alvoY)
    voarAte(dt, vel) {
      const b = this.boss, ax = b.alvoX - b.x, ay = b.alvoY - b.y, d = Math.hypot(ax, ay);
      if (d < 4) return true;
      const p = Math.min(1, vel * dt / d); b.x += ax * p; b.y += ay * p;
      return false;
    },

    atualizarBoss(dt) {
      const c = this, b = c.boss, j = c.jog;
      b.animT += dt; b.t -= dt; b.flash = Math.max(0, b.flash - dt);
      const dx = j.x - b.x, rapido = b.fase === 2 ? 1.25 : 1;
      const bob = Math.sin(c.t * 2.2) * 6; // flutua

      switch (b.estado) {
        case 'entrada':
          if (!b.pousou) {
            b.dir = -1;
            if (this.voarAte(dt, 420)) { b.pousou = true; b.anim = 'mordCarga'; b.animT = 0; b.t = 2.2; DT.tremer(10, 0.6); DT.som('chefeEntrada');
              DT.textoFlutuante(DT.L / 2, 150, c.cfg.grito, '#ff5fb0', 13); }
          } else if (b.t <= 0) { j.controlavel = true; if (window.DuckSom) DuckSom.tocarMusica('chefe4'); this.mudar('parado', 1.2); }
          return;

        case 'parado':
          b.dir = Math.sign(dx) || b.dir;
          this.voarAte(dt, 160); b.y += bob * dt * 4;
          if (b.t <= 0) this.escolherAtaque();
          break;

        case 'inspirar': // aviso do sopro
          if (b.t <= 0) { this.mudar('sopro', 1.1 / rapido); b.soproT = 0; b.mira = { x: j.x, y: j.y - 30 }; DT.som('dragaoSopro'); }
          break;
        case 'sopro': {
          b.soproT -= dt;
          if (b.soproT <= 0) {
            b.soproT = 0.22; // mais fácil: ~5 bolas, mais lentas
            const ox = b.x + b.dir * 120, oy = b.y - 110;
            const ang = Math.atan2(b.mira.y - oy, b.mira.x - ox) + DT.aleat(-0.12, 0.12);
            DT.projInimigos.push({ tipo: 'fogoDragao', x: ox, y: oy, vx: Math.cos(ang) * 330, vy: Math.sin(ang) * 330, r: 16, vida: 2.5, dano: 1,
              aoBater: p => DT.respingo(p.x, p.y, '#8a3fe0', 6, 160) });
          }
          if (b.t <= 0) this.mudar('soproFim', 0.4);
          break;
        }
        case 'soproFim': case 'mordFim': case 'impacto': case 'rabada':
          if (b.estado === 'rabada' && !b.acertou) {
            const area = { x: b.x - 170, y: CHAO - 70, w: 340, h: 70 }; // rabada varre o chão: pule!
            if (b.animT > 0.15 && DT.sobrepoe(area, DT.caixaDe(j))) { b.acertou = true; DT.ferirJogador(j, 1, b.x); }
          }
          if (b.t <= 0) this.mudar(b.estado === 'impacto' ? 'tonto' : 'parado', b.estado === 'impacto' ? 2 : 1.1 / rapido);
          break;

        case 'mordCarga':
          b.dir = Math.sign(dx) || b.dir;
          if (b.t <= 0) { this.mudar('mordida', 0.8); b.alvoX = DT.clamp(j.x, 80, DT.L - 80); b.alvoY = DT.clamp(j.y + 30, ALTO, CHAO); DT.som('maquininha'); }
          break;
        case 'mordida':
          if (this.voarAte(dt, 640 * rapido) || b.t <= 0) { this.mudar('mordFim', 0.35); this.novoPouso(); }
          break;

        case 'descer': // desce até o chão perto do herói para a rabada
          b.anim = 'voar';
          if (this.voarAte(dt, 380) || b.t <= 0) { b.dir = Math.sign(dx) || b.dir; this.mudar('rabadaCarga', 0.5 / rapido); DT.som('avisoGiro'); }
          break;
        case 'rabadaCarga':
          if (b.t <= 0) { this.mudar('rabada', 0.55); b.acertou = false; DT.som('maquininha'); DT.tremer(6, 0.2); }
          break;

        case 'subir': // sai pelo alto e cai em cima da marca
          b.alvoX = b.x; b.alvoY = -260;
          if (this.voarAte(dt, 700)) {
            const m = c.marcas.find(k => k.tipo === 'bomba');
            b.x = m ? m.x : DT.clamp(j.x, 120, DT.L - 120); b.y = -260;
            this.mudar('mergulhar', 3); b.vy = 400;
          }
          break;
        case 'mergulhar':
          b.vy += 2600 * dt; b.y = Math.min(CHAO, b.y + b.vy * dt);
          if (b.y >= CHAO) {
            DT.som('frascoBum'); DT.tremer(14, 0.5); DT.respingo(b.x, CHAO - 10, '#8a3fe0', 26, 380);
            if (Math.abs(j.x - b.x) < 130 && j.y > CHAO - 130) DT.ferirJogador(j, 1, b.x);
            c.marcas = c.marcas.filter(m => m.tipo !== 'bomba');
            this.mudar('impacto', 0.4);
          }
          break;
        case 'tonto': // caído no chão: hora de bater
          if (b.t <= 0) { this.novoPouso(); this.mudar('parado', 0.9); }
          break;
        case 'furia':
          if (b.t <= 0) this.mudar('parado', 0.6);
          break;
        case 'derrota':
          b.y = Math.min(CHAO, b.y + 260 * dt); // cai no chão enquanto vira tinta
          if (b.animT > 1 && Math.random() < 0.25) DT.respingo(b.x + DT.aleat(-80, 80), CHAO - DT.aleat(10, 60), Math.random() < 0.5 ? '#1b1b1b' : '#8a3fe0', 3, 200);
          if (b.t <= 0 && !c.cartucho) {
            c.cartucho = { x: b.x, y: b.y - 120, vy: -300 };
            DT.respingo(b.x, b.y - 80, '#fac775', 30, 380);
            b.sumiu = true; c.chuva = false; c.marcas = [];
          }
          return;
      }
      this.furiaEContato();
    },

    // escolhe outro ponto para pairar: alterna entre baixo (dá para acertar do chão) e alto (subir nos troncos)
    novoPouso() {
      const b = this.boss, j = this.jog;
      b.pousos = (b.pousos || 0) + 1;
      b.alvoY = b.pousos % 3 === 0 ? ALTO : BAIXO; // fica baixo 2 de cada 3 vezes
      b.alvoX = j.x < DT.L / 2 ? DT.aleat(600, 820) : DT.aleat(140, 360);
    },

    escolherAtaque() {
      const c = this, b = c.boss, j = c.jog;
      const lista = ['sopro', 'mordida', 'rabada', 'mergulho'].filter(o => o !== b.ultimo);
      const at = lista[Math.floor(Math.random() * lista.length)];
      b.ultimo = at;
      const r = b.fase === 2 ? 0.8 : 1;
      if (at === 'sopro') { this.mudar('inspirar', 0.8 * r); DT.som('avisoTiro'); }
      else if (at === 'mordida') { this.mudar('mordCarga', 0.6 * r); DT.som('avisoGiro'); }
      else if (at === 'rabada') {
        const lado = j.x < DT.L / 2 ? 1 : -1;
        b.alvoX = DT.clamp(j.x + lado * 170, 120, DT.L - 120); b.alvoY = CHAO;
        this.mudar('descer', 1.6);
      } else {
        c.marcas.push({ tipo: 'bomba', x: DT.clamp(j.x, 100, DT.L - 100), t: 4 });
        this.mudar('subir', 3); DT.som('avisoBomba');
      }
      if (at !== 'rabada' && at !== 'mergulho') this.novoPouso();
    },

    caixaBoss() {
      const b = this.boss;
      return { x: b.x - 80, y: b.y - 135, w: 160, h: 125 };
    },

    desenharPlataforma(ctx, s) { DT.desenharTronco(ctx, s.x, s.y, s.w); },

    desenharExtras(ctx) {
      const c = this, b = c.boss;
      if (c.chuva) { ctx.fillStyle = 'rgba(30,6,50,0.35)'; ctx.fillRect(0, 0, DT.L, DT.A); }
      if (!b.sumiu && b.y < CHAO - 20 && b.estado !== 'subir' && b.estado !== 'mergulhar') { // sombra no chão mostra a posição
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(b.x, CHAO - 2, 90, 10, 0, 0, Math.PI * 2); ctx.fill();
      }
      if (['inspirar', 'mordCarga', 'rabadaCarga'].includes(b.estado)) DT.texto(ctx, '!', b.x, b.y - 210, 20, '#e24b4a', 'center');
    }
  });
})();
