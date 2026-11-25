/* Chefão da Fase 1: Máquina Gigante de Tatuagem (base reaproveitada pelos outros chefões) */
(function () {
  'use strict';
  const DT = window.DT;
  const CHAO = 470;

  DT.CHEFE_FX = { tiro: 36, bomba: 69, gota: 79, explosao: 74, respingo: 67, coluna: 81 };
  // animações: nome -> [quadros, fps, ancora('e'), folha (opcional), sem repetir (opcional)]
  const A = {
    parado: [[3, 4, 5, 6, 7], 6], andar: [[8, 9, 10, 11, 12, 13, 14, 15], 10],
    tiroCarga: [[30, 31], 8, 'e'], tiro: [[32, 33], 8, 'e'],
    combo: [[38], 1, 'e'], comboGolpe: [[39, 40], 10, 'e'],
    bomba: [[42, 43], 6, 'e'], arremesso: [[44], 1, 'e'],
    chuva: [[47, 48], 6], giroCarga: [[51], 1], giro: [[52, 53], 14],
    furia: [[54, 55], 8], invencivel: [[58, 59], 8], dano: [[60, 61], 10], tonto: [[63, 64], 4]
  };

  const Chefe = DT.Chefe = {
    nome: 'chefe',
    cfg: { folha: 'chefe', arena: 'arena', vida: 90, nome: 'MÁQUINA GIGANTE', A, refFrame: 3, altura: 190,
      grito: 'TATUAGEM É PRA SEMPRE!', animFuriaParado: 'furia' },
    iniciar() {
      const c = this;
      c.solidos = [
        { tipo: 'solido', x: -100, y: CHAO, w: DT.L + 200, h: 200 },
        { tipo: 'solido', x: -60, y: -400, w: 60, h: 1000 },
        { tipo: 'solido', x: DT.L, y: -400, w: 60, h: 1000 },
        { tipo: 'plat', x: 50, y: 380, w: 210, h: 16 },
        { tipo: 'plat', x: 700, y: 380, w: 210, h: 16 },
        { tipo: 'plat', x: 385, y: 295, w: 190, h: 16 } // no meio, mais alta: rota de fuga
      ];
      c.inimigos = []; c.pocas = [];
      DT.projeteis = []; DT.projInimigos = []; DT.particulas = []; DT.textos = [];
      c.jog = DT.criarJogador(160, CHAO);
      c.jog.dir = 1; c.jog.controlavel = false;
      c.marcas = []; c.t = 0; c.vitoria = false; c.cartucho = null;
      c.coracoes = []; c.coracaoT = Math.min(14, c.cfg.coracaoIntervalo || 14); // primeiro coração aos 14s, depois a cada ~20s
      c.itensPoder = []; c.poderT = 24;  // power-up sorteado: primeiro aos 24s, depois a cada ~22s
      DT.jogo.poder = null;
      const K = c.cfg;
      const b = c.boss = { x: 720, y: -300, vy: 0, w: 120, h: 170, vida: K.vida, dir: -1, fase: 1,
        estado: 'entrada', t: 0, animT: 0, flash: 0, ultimo: '', anim: 'parado' };
      b.escala = K.altura / DT.caixaFrame(K.folha, K.refFrame).h;
      b.ref = DT.caixaFrame(K.folha, K.refFrame).w;
      DT.controlesAtivos = true;
      if (window.DuckSom) { DuckSom.pararMusica(); DT.som('chefeParede'); }
      DT.tremer(10, 1.2);
    },

    atualizar(dt) {
      const c = this, j = c.jog, b = c.boss;
      c.t += dt; DT.jogo.tempo += dt;
      DT.jogo.tinta = Math.min(1, DT.jogo.tinta + 0.04 * dt);
      DT.atualizarJogador(j, dt, c.solidos);
      j.x = DT.clamp(j.x, 20, DT.L - 20);
      this.atualizarBoss(dt);
      DT.atualizarProjeteis(dt, c.solidos);
      this.colisoesBoss();
      DT.atualizarProjInimigos(c, dt);
      DT.atualizarEfeitos(dt);
      c.marcas.forEach(m => { m.t -= dt; }); c.marcas = c.marcas.filter(m => m.t > 0);
      this.atualizarCoracoes(dt);
      if (c.cartucho) {
        const k = c.cartucho;
        k.vy += 900 * dt; k.y = Math.min(CHAO - 4, k.y + k.vy * dt);
        if (!c.vitoria && DT.sobrepoe(DT.caixaDe(j), { x: k.x - 20, y: k.y - 50, w: 40, h: 50 })) {
          c.vitoria = true; j.controlavel = false; j.vx = 0; DT.jogo.comemorando = true;
          DT.som('vitoria');
          setTimeout(() => DT.dialogo([{ t: 'Bom trabalho. Não se acostuma.', r: 3 }], () => DT.irPara('vitoria')), 1800);
        }
      }
    },

    mudar(estado, t, anim) { const b = this.boss; b.estado = estado; b.t = t; b.anim = anim || estado; b.animT = 0; },

    // Corações que descem flutuando numa plataforma de tempos em tempos
    atualizarCoracoes(dt) {
      const c = this, b = c.boss, j = c.jog;
      if (b.estado !== 'entrada' && b.estado !== 'derrota' && !b.sumiu) {
        c.coracaoT -= dt;
        if (c.coracaoT <= 0 && c.coracoes.length === 0) {
          const plats = c.solidos.filter(s => s.tipo === 'plat');
          const s = plats[Math.floor(Math.random() * plats.length)];
          const x = s.x + s.w / 2 + DT.aleat(-50, 50);
          c.coracoes.push({ x, x0: x, y: -30, alvoY: s.y - 24, vida: 8, t: 0 });
          c.coracaoT = c.cfg.coracaoIntervalo || 20;
          DT.som('carta');
        }
      }
      c.coracoes.forEach(h => {
        h.t += dt;
        if (h.y < h.alvoY) { h.y = Math.min(h.alvoY, h.y + 90 * dt); h.x = h.x0 + Math.sin(h.t * 3) * 14; }
        else h.vida -= dt;
        if (!h.pego && DT.sobrepoe(DT.caixaDe(j), { x: h.x - 18, y: h.y - 18, w: 36, h: 36 })) { h.pego = true; DT.pegarCoracao(h.x, h.y); }
      });
      c.coracoes = c.coracoes.filter(h => !h.pego && h.vida > 0);
      // power-ups: descem flutuando numa plataforma, igual ao coração
      if (b.estado !== 'entrada' && b.estado !== 'derrota' && !b.sumiu) {
        c.poderT -= dt;
        if (c.poderT <= 0 && c.itensPoder.length === 0 && !DT.jogo.poder) {
          const plats = c.solidos.filter(s => s.tipo === 'plat');
          const s = plats[Math.floor(Math.random() * plats.length)], x = s.x + s.w / 2 + DT.aleat(-40, 40);
          c.itensPoder.push({ tipo: DT.TIPOS_PODER[Math.floor(Math.random() * DT.TIPOS_PODER.length)], x, x0: x, y: -40, alvoY: s.y - 30, vida: 9, t: 0 });
          c.poderT = 22; DT.som('carta');
        }
      }
      c.itensPoder.forEach(p => {
        p.t += dt;
        if (p.y < p.alvoY) { p.y = Math.min(p.alvoY, p.y + 90 * dt); p.x = p.x0 + Math.sin(p.t * 3) * 14; }
        else p.vida -= dt;
        if (!p.pego && DT.sobrepoe(DT.caixaDe(j), { x: p.x - 22, y: p.y - 26, w: 44, h: 52 })) { p.pego = true; DT.pegarPoder(p.tipo, p.x, p.y); }
      });
      c.itensPoder = c.itensPoder.filter(p => !p.pego && p.vida > 0);
    },

    renascer() {
      const j = this.jog, b = this.boss;
      // volta do lado oposto ao chefe, para não nascer encostado nele
      const esquerda = !b || b.x > DT.L / 2;
      j.x = esquerda ? 160 : DT.L - 160; j.y = CHAO; j.dir = esquerda ? 1 : -1;
      DT.projInimigos = [];
      DT.textoFlutuante(j.x, j.y - 130, 'VIDAS: ' + DT.jogo.vidas, '#fac775', 12);
    },

    atualizarBoss(dt) {
      const c = this, b = c.boss, j = c.jog;
      b.animT += dt; b.t -= dt; b.flash = Math.max(0, b.flash - dt);
      const dx = j.x - b.x;
      const rapido = b.fase === 2 ? 1.3 : 1;

      switch (b.estado) {
        case 'entrada':
          b.vy += 1600 * dt; b.y = Math.min(CHAO, b.y + b.vy * dt);
          if (b.y >= CHAO && !b.pousou) {
            b.pousou = true; DT.tremer(14, 0.5); DT.som('chefeEntrada');
            DT.respingo(b.x, CHAO - 10, '#8a3fe0', 30, 400);
            b.anim = 'furia'; b.t = 2.2;
            DT.textoFlutuante(DT.L / 2, 150, c.cfg.grito, '#ff5fb0', 18);
          }
          if (b.pousou && b.t <= 0) {
            j.controlavel = true; if (window.DuckSom) DuckSom.tocarMusica('chefe1');
            this.mudar('parado', 1.0);
          }
          return;
        case 'parado':
          b.dir = Math.sign(dx) || b.dir;
          if (b.t <= 0) this.escolherAtaque();
          break;
        case 'tiroCarga':
          if (b.t <= 0) {
            const ox = b.x + b.dir * 80, oy = b.y - 112;
            const ang = Math.atan2((j.y - j.h / 2) - oy, j.x - ox);
            const angs = b.fase === 2 ? [ang - 0.2, ang, ang + 0.2] : [ang];
            angs.forEach(a => DT.projInimigos.push({ tipo: 'roxo', x: ox, y: oy, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, r: 16, vida: 3, dano: 1, atravessa: true }));
            DT.som('emersonAtaque');
            this.mudar('tiro', 0.45);
          }
          break;
        case 'bomba':
          if (b.t <= 0) {
            c.marcas.filter(m => m.tipo === 'bomba').forEach(m => this.lancarBomba(m.x));
            this.mudar('arremesso', 0.5);
          }
          break;
        case 'andar':
          b.dir = Math.sign(dx) || b.dir;
          b.x += b.dir * 170 * rapido * dt;
          if (Math.abs(dx) < 190 || b.t <= 0) { this.mudar('combo', 0.4); DT.som('clique'); }
          break;
        case 'combo':
          if (b.t <= 0) { this.mudar('comboGolpe', 0.3); b.acertou = false; DT.som('chefeRugido'); }
          break;
        case 'comboGolpe': {
          const area = { x: b.dir > 0 ? b.x : b.x - 210, y: CHAO - 170, w: 210, h: 170 };
          if (!b.acertou && DT.sobrepoe(area, DT.caixaDe(j))) { b.acertou = true; DT.ferirJogador(j, 1, b.x); }
          if (b.t <= 0) this.mudar('parado', 0.9 / rapido);
          break;
        }
        case 'chuva':
          if (b.t <= 0) {
            c.marcas.filter(m => m.tipo === 'chuva').forEach((m, i) => {
              DT.projInimigos.push({ tipo: 'gota', x: m.x, y: -40 - i * 30, vx: 0, vy: 650, r: 16, vida: 2, dano: 1,
                aoBater: p => { DT.respingo(p.x, CHAO - 6, '#8a3fe0', 8, 200); } });
            });
            c.marcas = c.marcas.filter(m => m.tipo !== 'chuva');
            this.mudar('tonto', 1.3, 'tonto');
          }
          break;
        case 'giroCarga':
          if (Math.random() < 0.5) DT.particulas.push({ x: b.x + DT.aleat(-50, 50), y: b.y - 150, vx: DT.aleat(-30, 30), vy: -200, vida: 0.5, cor: '#f1efe8', tam: 6 });
          if (b.t <= 0) { b.dir = Math.sign(dx) || b.dir; this.mudar('giro', 3, 'giro'); DT.som('maquininha'); }
          break;
        case 'giro':
          b.x += b.dir * 560 * dt;
          if (Math.floor(b.animT * 6) !== Math.floor((b.animT - dt) * 6)) DT.som('maquininha');
          if (b.x < 90 || b.x > DT.L - 90 || b.t <= 0) { b.x = DT.clamp(b.x, 90, DT.L - 90); DT.tremer(8, 0.3); this.mudar('tonto', 1.4, 'tonto'); }
          break;
        case 'arremesso': case 'tiro': case 'tonto':
          if (b.t <= 0) this.mudar('parado', (b.estado === 'tonto' ? 0.4 : 0.8) / rapido);
          break;
        case 'furia':
          if (b.t <= 0) { this.mudar('parado', 0.6); }
          break;
        case 'derrota':
          if (Math.random() < 0.3) DT.respingo(b.x + DT.aleat(-60, 60), b.y - DT.aleat(20, 160), Math.random() < 0.5 ? '#8a3fe0' : '#888780', 3, 220);
          if (b.t <= 0 && !c.cartucho) {
            c.cartucho = { x: b.x, y: b.y - 120, vy: -300 };
            DT.respingo(b.x, b.y - 80, '#fac775', 30, 380);
            b.sumiu = true;
          }
          return;
      }
      this.furiaEContato();
    },

    // Fúria aos 50% e dano por encostar no corpo (comum a todos os chefões)
    furiaEContato() {
      const c = this, b = c.boss, j = c.jog;
      if (b.fase === 1 && b.vida <= c.cfg.vida / 2 && b.estado !== 'derrota') {
        b.fase = 2; c.marcas = [];
        this.mudar('furia', 2.2, 'invencivel');
        DT.som('chefeFuria'); DT.tremer(10, 0.8);
        if (window.DuckSom) DuckSom.setFuria(true);
        DT.textoFlutuante(DT.L / 2, 140, 'FÚRIA!', '#ff5fb0', 26);
        if (this.aoEntrarFuria) this.aoEntrarFuria();
      }
      if (b.estado !== 'derrota' && b.estado !== 'entrada' && DT.sobrepoe(this.caixaBoss(), DT.caixaDe(j))) DT.ferirJogador(j, 1, b.x);
    },

    escolherAtaque() {
      const c = this, b = c.boss, j = c.jog;
      const opcoes = b.fase === 1 ? ['tiro', 'bomba', 'combo'] : ['tiro', 'bomba', 'combo', 'chuva', 'giro'];
      const lista = opcoes.filter(o => o !== b.ultimo);
      const at = lista[Math.floor(Math.random() * lista.length)];
      b.ultimo = at;
      const rapido = b.fase === 2 ? 0.8 : 1;
      if (at === 'tiro') { this.mudar('tiroCarga', 0.65 * rapido); DT.som('avisoTiro'); }
      else if (at === 'bomba') {
        const alvos = [DT.clamp(j.x, 60, DT.L - 60)];
        if (b.fase === 2) alvos.push(DT.clamp(j.x + (Math.random() < 0.5 ? -1 : 1) * DT.aleat(160, 260), 60, DT.L - 60));
        alvos.forEach(x => c.marcas.push({ tipo: 'bomba', x, t: 2.2 }));
        this.mudar('bomba', 0.9 * rapido); DT.som('avisoBomba');
      } else if (at === 'combo') this.mudar('andar', 2.2);
      else if (at === 'chuva') {
        const raias = [...Array(9).keys()].sort(() => Math.random() - 0.5).slice(0, 6);
        raias.forEach(r => c.marcas.push({ tipo: 'chuva', x: 55 + r * 106, t: 1.6 }));
        this.mudar('chuva', 1.0); DT.som('avisoChuva');
      } else if (at === 'giro') { this.mudar('giroCarga', 0.8); DT.som('avisoGiro'); }
    },

    lancarBomba(alvoX) {
      const b = this.boss, ox = b.x + b.dir * 60, oy = b.y - 150, T = 0.7, g = 1300;
      const vx = (alvoX - ox) / T, vy = ((CHAO - 14 - oy) - 0.5 * g * T * T) / T;
      DT.projInimigos.push({ tipo: 'bomba', x: ox, y: oy, vx, vy, gravidade: g, r: 16, vida: 3, dano: 0, atravessa: false,
        aoBater: p => {
          DT.som('frascoBum'); DT.tremer(8, 0.3);
          DT.respingo(p.x, CHAO - 20, '#8a3fe0', 26, 380);
          this.explosoes = this.explosoes || [];
          this.explosoes.push({ x: p.x, t: 0.4 });
          const j = this.jog;
          if (Math.abs(j.x - p.x) < 95 && j.y > CHAO - 110) DT.ferirJogador(j, 1, p.x);
          this.marcas = this.marcas.filter(m => !(m.tipo === 'bomba' && Math.abs(m.x - p.x) < 5));
        } });
    },

    caixaBoss() {
      const b = this.boss;
      const h = b.estado === 'giro' || b.estado === 'giroCarga' ? 90 : b.h;
      return { x: b.x - b.w / 2, y: b.y - h, w: b.w, h };
    },

    colisoesBoss() {
      const b = this.boss;
      if (b.estado === 'entrada' || b.estado === 'derrota') return;
      const cb = this.caixaBoss();
      DT.projeteis.forEach(p => {
        if (p.vida <= 0 || p.atingidos.includes(b)) return;
        if (!DT.sobrepoe(DT.caixaProjetil(p), cb)) return;
        if (p.perfura) p.atingidos.push(b); else p.vida = 0;
        if (b.estado === 'furia') { DT.respingo(p.x, p.y, '#f1efe8', 4, 120); DT.som('clique'); return; }
        b.vida = Math.max(0, b.vida - p.dano); b.flash = 0.1;
        DT.jogo.pontos += 20 * p.dano;
        DT.respingo(p.x, p.y, p.tipo === 'azul' ? '#2f8fd8' : p.tipo === 'latido' ? '#58c4ff' : '#1b1b1b', 6, 180);
        if (b.vida <= 0) {
          this.mudar('derrota', 2.6, this.cfg.derrotaAnimada && this.cfg.A.derrota ? 'derrota' : 'dano');
          DT.projInimigos = []; this.marcas = [];
          DT.som('chefeDerrota'); DT.tremer(12, 1.5);
          if (window.DuckSom) DuckSom.pararMusica();
          DT.jogo.pontos += 5000;
          DT.jogo.chefeDerrotado = true;
        }
      });
    },

    desenhar(ctx) {
      const c = this, b = c.boss, K = c.cfg;
      ctx.drawImage(DT.IM[K.arena], 0, 0, DT.L, DT.A);
      ctx.fillStyle = 'rgba(16,8,28,0.3)'; ctx.fillRect(0, 0, DT.L, DT.A);
      ctx.save();
      ctx.translate(DT.tremorX, DT.tremorY);
      // plataformas
      c.solidos.filter(s => s.tipo === 'plat').forEach(s => {
        if (this.desenharPlataforma) { this.desenharPlataforma(ctx, s); return; }
        const a = DT.spr('tiles', 6), m = DT.spr('tiles', 7), z = DT.spr('tiles', 8), h = 30;
        const aw = a.width * h / a.height, zw = z.width * h / z.height;
        ctx.drawImage(a, s.x, s.y - 4, aw, h); ctx.drawImage(m, s.x + aw - 1, s.y - 4, s.w - aw - zw + 2, h); ctx.drawImage(z, s.x + s.w - zw, s.y - 4, zw, h);
      });
      // marcas de aviso no chão
      c.marcas.forEach(m => {
        const pulso = 0.45 + Math.sin(c.t * 14) * 0.2;
        ctx.save(); ctx.globalAlpha = pulso;
        ctx.fillStyle = m.tipo === 'bomba' ? '#e24b4a' : '#3c1470';
        ctx.beginPath(); ctx.ellipse(m.x, CHAO - 4, m.tipo === 'bomba' ? 92 : 40, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = m.tipo === 'bomba' ? '#ff9a9a' : '#c79bff'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.stroke();
        ctx.restore();
      });
      // explosões
      (c.explosoes || []).forEach(e => { e.t -= 1 / 60; DT.desenharAltura(ctx, 'chefe', DT.CHEFE_FX.explosao, e.x, CHAO, 150, false, { alpha: Math.max(0, e.t / 0.4) }); });
      c.explosoes = (c.explosoes || []).filter(e => e.t > 0);
      if (this.desenharExtras) this.desenharExtras(ctx);
      // chefe
      if (!b.sumiu) {
        const AN = K.A;
        let [frames, fps, ancora, folha, semRepetir] = AN[b.anim] || AN.parado;
        if (b.anim === 'parado' && b.fase === 2 && K.animFuriaParado) [frames, fps, ancora, folha] = AN[K.animFuriaParado];
        const n = Math.floor(b.animT * fps);
        const f = frames[semRepetir ? Math.min(n, frames.length - 1) : n % frames.length];
        folha = folha || K.folha;
        let ox = 0;
        if (b.estado === 'giroCarga' || (b.estado === 'derrota' && !K.derrotaAnimada)) ox = DT.aleat(-4, 4);
        if (b.estado === 'tiroCarga') {
          ctx.fillStyle = 'rgba(199,155,255,' + (0.4 + Math.sin(c.t * 30) * 0.3) + ')';
          ctx.beginPath(); ctx.arc(b.x + b.dir * 80, b.y - 112, 18 + Math.sin(c.t * 30) * 5, 0, Math.PI * 2); ctx.fill();
        }
        // folhas com escala diferente (ex.: caminhada separada) usam a própria referência de altura
        const esc = folha === K.folha ? b.escala : K.altura / DT.caixaFrame(folha, frames[0]).h;
        DT.desenhar(ctx, folha, f, b.x + ox, b.y + 4, esc, b.dir < 0,
          { ref: ancora === 'e' ? (folha === K.folha ? b.ref : DT.caixaFrame(folha, frames[0]).w) : 0, filtro: b.flash > 0 ? 'brightness(2.4)' : null,
            alpha: b.estado === 'derrota' && !K.derrotaAnimada ? Math.max(0.2, b.t / 2.6) : 1 });
        if (b.estado === 'tonto') for (let i = 0; i < 3; i++) {
          const a = c.t * 4 + i * 2.1;
          DT.texto(ctx, '*', b.x + Math.cos(a) * 50, b.y - 200 + Math.sin(a) * 10, 16, '#fac775', 'center');
        }
      }
      c.coracoes.forEach(h => {
        if (h.vida < 2 && Math.floor(h.vida * 8) % 2 === 0) return; // pisca antes de sumir
        ctx.fillStyle = 'rgba(226,75,74,' + (0.3 + Math.sin(c.t * 5) * 0.1) + ')';
        ctx.beginPath(); ctx.arc(h.x, h.y, 24, 0, Math.PI * 2); ctx.fill();
        DT.coracao(ctx, h.x - 14, h.y - 12, 4, true);
      });
      c.itensPoder.forEach(p => { if (!(p.vida < 2 && Math.floor(p.vida * 8) % 2 === 0)) DT.desenharItemPoder(ctx, p.tipo, p.x, p.y, c.t); });
      if (c.cartucho) desenharCartucho(ctx, c.cartucho.x, c.cartucho.y, c.t);
      DT.desenharJogador(ctx, c.jog);
      DT.desenharProjeteis(ctx);
      DT.projeteisInimigosDesenhar(ctx);
      DT.desenharEfeitos(ctx);
      ctx.restore();
      DT.desenharHUD(ctx);
      // barra de vida do chefe
      if (!b.sumiu) {
        DT.caixa(ctx, 180, 490, 600, 38, 'rgba(10,6,18,0.88)', '#e0a826');
        DT.texto(ctx, K.nome, 196, 504, K.nome.length > 16 ? 7 : 9, '#ff5fb0');
        DT.caixa(ctx, 400, 497, 366, 24, '#2a1f3d', '#000');
        const v = b.vida / K.vida;
        ctx.fillStyle = b.fase === 2 ? '#d43fa0' : '#7f3fd6'; ctx.fillRect(403, 500, 360 * v, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(403, 500, 360 * v, 4);
      }
    }
  };

  // Cartucho de tinta mágica em 16 bits (opção B: transparente), ver cartucho.js
  DT.CHAO_CHEFE = CHAO;
  function desenharCartucho(ctx, x, y, t) {
    DT.desenharCartucho16(ctx, x, y - 4 + Math.sin(t * 4) * 4, 'transparente', t, 3);
    DT.texto(ctx, 'CARTUCHO!', x, y - 160, 10, '#fac775', 'center');
  }
})();
