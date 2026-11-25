/* Chefão da Fase 3: Tigre Neon (usa a base de chefe.js) */
(function () {
  'use strict';
  const DT = window.DT;
  const CHAO = 470;

  // quadros da folha 'chefe3' (ver ferramentas/mapa-sprites.html?f=fase3/chefe_tigre_neon.webp)
  const A = {
    parado: [[0, 1, 2, 3, 4, 5], 6], andar: [[6, 7, 8, 9, 10, 11], 11],
    investidaCarga: [[12], 1], investida: [[13, 14, 15], 14],
    garraCarga: [[16, 17], 5, null, null, true], garra: [[18, 19, 20], 10, null, null, true],
    rugidoCarga: [[21], 1], rugido: [[22, 23, 24], 6, null, null, true],
    agachar: [[25], 1], subir: [[26, 27], 8, null, null, true], queda: [[28], 1], pouso: [[29], 1],
    furia: [[30, 31, 32, 33], 8], invencivel: [[30, 31, 32, 33], 8], furiaParado: [[30, 31, 32, 33], 6],
    dano: [[34, 35], 10], tonto: [[36, 37], 3],
    derrota: [[38, 39, 40, 41, 42], 2, null, null, true]
  };

  const Chefe3 = DT.Chefe3 = Object.assign(Object.create(DT.Chefe), {
    nome: 'chefe3',
    cfg: { folha: 'chefe3', arena: 'arena3', vida: 130, nome: 'TIGRE NEON', A, refFrame: 0, altura: 150,
      grito: 'GRRR! ESSE CARTUCHO É MEU!', animFuriaParado: 'furiaParado', derrotaAnimada: true },

    iniciar() {
      DT.Chefe.iniciar.call(this);
      this.apagao = false; this.raioT = 2.5; this.raios = []; this.ondaExtra = null;
      this.boss.anim = 'queda';
    },

    atualizar(dt) {
      DT.Chefe.atualizar.call(this, dt);
      if (this.ondaExtra) { this.ondaExtra.t -= dt; if (this.ondaExtra.t <= 0) { this.soltarOndas(this.ondaExtra.x); this.ondaExtra = null; } }
    },

    // fúria: a cidade apaga (só visual). Os raios foram tirados: estava difícil demais.
    aoEntrarFuria() { this.apagao = true; DT.som('chefeParede'); DT.textoFlutuante(DT.L / 2, 180, 'APAGÃO!', '#c79bff', 18); },

    // Na fúria, raios caem dos letreiros: aviso roxo no chão e depois o raio
    atualizarRaios(dt) {
      const c = this, b = c.boss, j = c.jog;
      c.raios.forEach(r => { r.t -= dt; }); c.raios = c.raios.filter(r => r.t > 0);
      if (!c.apagao || b.estado === 'derrota' || b.sumiu) return;
      c.marcas.filter(m => m.tipo === 'raio' && m.t <= dt * 1.5 && !m.caiu).forEach(m => {
        m.caiu = true;
        c.raios.push({ x: m.x, t: 0.25 });
        DT.som('frascoBum'); DT.tremer(6, 0.2); DT.respingo(m.x, CHAO - 10, '#c79bff', 14, 260);
        if (Math.abs(j.x - m.x) < 46) DT.ferirJogador(j, 1, m.x);
      });
      c.raioT -= dt;
      if (c.raioT <= 0) {
        c.raioT = DT.aleat(2.6, 3.4);
        const xs = [DT.clamp(j.x + DT.aleat(-30, 30), 40, DT.L - 40), DT.clamp(DT.aleat(60, DT.L - 60), 40, DT.L - 40)];
        xs.forEach(x => c.marcas.push({ tipo: 'raio', x, t: 1.0 }));
        DT.som('avisoChuva');
      }
    },

    atualizarBoss(dt) {
      const c = this, b = c.boss, j = c.jog;
      b.animT += dt; b.t -= dt; b.flash = Math.max(0, b.flash - dt);
      const dx = j.x - b.x, rapido = b.fase === 2 ? 1.3 : 1;

      switch (b.estado) {
        case 'entrada': // pula do letreiro para o terraço
          b.vy += 1600 * dt; b.y = Math.min(CHAO, b.y + b.vy * dt);
          if (b.y >= CHAO && !b.pousou) {
            b.pousou = true; DT.tremer(14, 0.5); DT.som('chefeEntrada'); DT.som('tigreRugido');
            DT.respingo(b.x, CHAO - 10, '#8a3fe0', 30, 400);
            b.anim = 'rugido'; b.animT = 0; b.t = 2.2;
            DT.textoFlutuante(DT.L / 2, 150, c.cfg.grito, '#ff5fb0', 16);
          }
          if (b.pousou && b.t <= 0) { j.controlavel = true; if (window.DuckSom) DuckSom.tocarMusica('chefe3'); this.mudar('parado', 1.0); }
          return;
        case 'parado':
          b.dir = Math.sign(dx) || b.dir;
          if (b.t <= 0) this.escolherAtaque();
          break;

        case 'investidaCarga': // raspa a pata no chão antes de correr
          if (Math.random() < 0.5) DT.particulas.push({ x: b.x - b.dir * 60, y: CHAO - 6, vx: -b.dir * DT.aleat(60, 160), vy: -DT.aleat(60, 160), vida: 0.4, cor: '#cbbf9e', tam: 6 });
          if (b.t <= 0) { b.dir = Math.sign(dx) || b.dir; this.mudar('investida', 2); DT.som('tigreRugido'); }
          break;
        case 'investida':
          b.x += b.dir * 600 * rapido * dt;
          if (Math.random() < 0.4) DT.particulas.push({ x: b.x - b.dir * 90, y: CHAO - 6, vx: -b.dir * 120, vy: -80, vida: 0.35, cor: '#cbbf9e', tam: 5 });
          if (b.x < 120 || b.x > DT.L - 120 || b.t <= 0) { b.x = DT.clamp(b.x, 120, DT.L - 120); DT.tremer(10, 0.35); DT.som('frascoBum'); this.mudar('tonto', 1.3); }
          break;

        case 'andar': // aproxima para a garrada
          b.dir = Math.sign(dx) || b.dir;
          b.x += b.dir * 170 * rapido * dt;
          if (Math.abs(dx) < 260 || b.t <= 0) { this.mudar('garraCarga', 0.55 / rapido); DT.som('avisoGiro'); }
          break;
        case 'garraCarga':
          if (b.t <= 0) {
            this.mudar('garra', 0.5); b.acertou = false; DT.som('maquininha');
            // arco roxo na altura do peito: agache ou pule
            DT.projInimigos.push({ tipo: 'arco', x: b.x + b.dir * 110, y: CHAO - 94, vx: b.dir * 520 * rapido, vy: 0, r: 26, vida: 2, dano: 1, atravessa: true });
          }
          break;
        case 'garra': {
          const area = { x: b.dir > 0 ? b.x + 40 : b.x - 220, y: CHAO - 120, w: 180, h: 120 };
          if (!b.acertou && b.animT < 0.25 && DT.sobrepoe(area, DT.caixaDe(j))) { b.acertou = true; DT.ferirJogador(j, 1, b.x); }
          if (b.t <= 0) this.mudar('parado', 0.8 / rapido);
          break;
        }

        case 'rugidoCarga':
          if (b.t <= 0) {
            this.mudar('rugido', 0.9); DT.som('tigreRugido'); DT.tremer(8, 0.6);
            this.soltarOndas(b.x);
            if (b.fase === 2) this.ondaExtra = { x: b.x, t: 0.5 };
          }
          break;

        case 'agachar': // vai pular: a marca vermelha mostra onde cai
          if (b.t <= 0) { this.mudar('subir', 3); b.vy = -1500; DT.som('pulo'); }
          break;
        case 'subir':
          b.vy += 900 * dt; b.y += b.vy * dt;
          if (b.y < -260) { // some lá em cima e cai em cima da marca
            const m = c.marcas.find(k => k.tipo === 'bomba');
            b.x = m ? m.x : DT.clamp(j.x, 120, DT.L - 120);
            b.vy = 300; this.mudar('queda', 3);
          }
          break;
        case 'queda':
          b.vy += 2600 * dt; b.y = Math.min(CHAO, b.y + b.vy * dt);
          if (b.y >= CHAO) {
            DT.som('frascoBum'); DT.tremer(14, 0.45); DT.respingo(b.x, CHAO - 10, '#8a3fe0', 26, 380);
            if (Math.abs(j.x - b.x) < 120 && j.y > CHAO - 130) DT.ferirJogador(j, 1, b.x);
            c.marcas = c.marcas.filter(m => m.tipo !== 'bomba');
            if (b.fase === 2) this.soltarOndas(b.x);
            this.mudar('pouso', 0.35);
          }
          break;
        case 'pouso':
          if (b.t <= 0) this.mudar('tonto', 0.9);
          break;

        case 'rugido': case 'tonto':
          if (b.t <= 0) this.mudar('parado', (b.estado === 'tonto' ? 0.4 : 0.7) / rapido);
          break;
        case 'furia':
          if (b.t <= 0) this.mudar('parado', 0.6);
          break;
        case 'derrota':
          if (b.animT > 1.2 && Math.random() < 0.25) DT.respingo(b.x + DT.aleat(-80, 80), CHAO - DT.aleat(10, 60), Math.random() < 0.5 ? '#8a3fe0' : '#ff5fb0', 3, 200);
          if (b.t <= 0 && !c.cartucho) {
            c.cartucho = { x: b.x, y: b.y - 120, vy: -300 };
            DT.respingo(b.x, b.y - 80, '#fac775', 30, 380);
            b.sumiu = true; c.apagao = false; c.marcas = [];
          }
          return;
      }
      this.furiaEContato();
    },

    soltarOndas(x) {
      [-1, 1].forEach(d => DT.projInimigos.push({ tipo: 'rugido', x: x + d * 90, y: CHAO - 24, vx: d * 380, vy: 0, r: 24, vida: 2.6, dano: 1, atravessa: true }));
    },

    escolherAtaque() {
      const c = this, b = c.boss, j = c.jog;
      const lista = ['investida', 'garra', 'rugido', 'bote'].filter(o => o !== b.ultimo);
      const at = lista[Math.floor(Math.random() * lista.length)];
      b.ultimo = at;
      const r = b.fase === 2 ? 0.8 : 1;
      if (at === 'investida') { this.mudar('investidaCarga', 0.8 * r); DT.som('avisoGiro'); }
      else if (at === 'garra') this.mudar('andar', 1.6);
      else if (at === 'rugido') { this.mudar('rugidoCarga', 0.6 * r); DT.som('avisoTiro'); }
      else {
        c.marcas.push({ tipo: 'bomba', x: DT.clamp(j.x, 100, DT.L - 100), t: 4 });
        this.mudar('agachar', 0.5 * r); DT.som('avisoBomba');
      }
    },

    caixaBoss() {
      const b = this.boss;
      const baixo = b.estado === 'investida' || b.estado === 'investidaCarga';
      const w = baixo ? 200 : 170, h = baixo ? 88 : 118;
      return { x: b.x - w / 2, y: b.y - h, w, h };
    },

    desenharPlataforma(ctx, s) { DT.desenharSacada(ctx, s.x, s.y, s.w); },

    desenharExtras(ctx) {
      const c = this, b = c.boss;
      if (c.apagao) {
        // escurece tudo, deixando luz em volta do herói e do tigre
        const o = c.sombra || (c.sombra = document.createElement('canvas'));
        o.width = DT.L; o.height = DT.A;
        const x = o.getContext('2d');
        x.fillStyle = 'rgba(4,2,10,0.42)'; x.fillRect(0, 0, DT.L, DT.A); // mais claro: chão e sacadas visíveis
        x.globalCompositeOperation = 'destination-out';
        const luz = (lx, ly, r) => { const g = x.createRadialGradient(lx, ly, 0, lx, ly, r); g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(lx - r, ly - r, r * 2, r * 2); };
        luz(c.jog.x, c.jog.y - 50, 150);
        if (!b.sumiu) luz(b.x, b.y - 70, 210);
        ctx.drawImage(o, 0, 0);
        if (!b.sumiu) { // brilho roxo do tigre
          const g = ctx.createRadialGradient(b.x, b.y - 70, 0, b.x, b.y - 70, 190);
          g.addColorStop(0, 'rgba(160,80,255,0.35)'); g.addColorStop(1, 'rgba(160,80,255,0)');
          ctx.fillStyle = g; ctx.fillRect(b.x - 190, b.y - 260, 380, 380);
        }
        // as marcas no chão continuam visíveis no escuro
        c.marcas.forEach(m => {
          ctx.save(); ctx.globalAlpha = 0.5 + Math.sin(c.t * 14) * 0.25;
          ctx.fillStyle = m.tipo === 'bomba' ? '#e24b4a' : '#b070ff';
          ctx.beginPath(); ctx.ellipse(m.x, CHAO - 4, m.tipo === 'bomba' ? 92 : 44, 13, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        });
      }
      // raios caindo
      c.raios.forEach(r => {
        ctx.save(); ctx.globalAlpha = Math.min(1, r.t * 6);
        ctx.strokeStyle = '#f3e8ff'; ctx.lineWidth = 6; ctx.shadowColor = '#b070ff'; ctx.shadowBlur = 18;
        ctx.beginPath(); let px = r.x, py = 0; ctx.moveTo(px, py);
        while (py < CHAO) { py += 40; px = r.x + DT.aleat(-22, 22); ctx.lineTo(px, Math.min(py, CHAO)); }
        ctx.stroke(); ctx.restore();
      });
      if (b.estado === 'garraCarga' || b.estado === 'investidaCarga' || b.estado === 'rugidoCarga' || b.estado === 'agachar') DT.texto(ctx, '!', b.x, b.y - 200, 20, '#e24b4a', 'center');
    }
  });
})();
