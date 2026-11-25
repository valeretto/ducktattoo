/* Minijogo da Fase 3: Corrida do Piercing
   Corrida automática no metrô: pule o que está no chão, deslize (▼) por baixo do que está pendurado e pegue as joias. */
(function () {
  'use strict';
  const DT = window.DT;
  const CH = 492;          // chão da pista
  const HX = 200;          // posição fixa do herói na tela
  const FIM = 9200;        // distância até o arco de chegada
  const BAIXOS = [{ i: 0, alt: 56, w: 40 }, { i: 1, alt: 26, w: 100, poca: true }, { i: 2, alt: 48, w: 74 }, { i: 3, alt: 58, w: 70 }];
  // obstáculos altos estão presos numa viga só na folha: recortes à mão (coordenadas na imagem de 2000px)
  const ALTOS = [[60, 270, 380, 270], [480, 270, 540, 290], [1010, 270, 480, 260], [1520, 270, 460, 260]];
  const LARG_ALTO = 190, FOLGA = 74; // a ponta de baixo fica a 74px do chão: só passa deslizando
  const JOIAS = [[5, 6], [7, 8], [9, 10]];

  function montarPista() {
    const obs = [], joias = [];
    let x = 1000, ultimo = '';
    while (x < FIM - 500) {
      const tipo = ultimo === 'alto' ? 'baixo' : Math.random() < 0.5 ? 'baixo' : 'alto';
      ultimo = tipo;
      if (tipo === 'baixo') {
        const b = BAIXOS[Math.floor(Math.random() * BAIXOS.length)];
        obs.push({ tipo, x, ...b });
        // joias em arco por cima: premia o pulo
        for (let k = -1; k <= 1; k++) joias.push({ x: x + k * 44, y: CH - 150 + Math.abs(k) * 26, j: Math.floor(Math.random() * 3) });
      } else {
        obs.push({ tipo, x, i: Math.floor(Math.random() * ALTOS.length) });
        // joias rente ao chão por baixo: premia o deslize
        for (let k = 0; k < 3; k++) joias.push({ x: x + 40 + k * 55, y: CH - 22, j: Math.floor(Math.random() * 3) });
      }
      const vao = DT.aleat(430, 560);
      if (Math.random() < 0.35) joias.push({ x: x + vao / 2, y: CH - 60, j: 0 });
      if (Math.random() < 0.12) obs.push({ tipo: 'seta', x: x + vao / 2 + 60, y: CH - 70 });
      x += vao;
    }
    return { obs, joias };
  }

  DT.Corrida = {
    nome: 'corrida',
    iniciar() {
      const c = this, P = montarPista();
      c.obs = P.obs; c.joias = P.joias; c.total = P.joias.length;
      c.dist = 0; c.vel = 330; c.t = 0; c.pegas = 0; c.tropecos = 0; c.fim = null; c.fimT = 0; c.instrucao = true;
      const k = DT.jogo.ativo, H = DT.HEROIS[k];
      c.j = { y: CH, vy: 0, noChao: true, desl: 0, inv: 0, animT: 0, esc: H.alvo / DT.caixaFrame(k, H.anims.parado[0][0]).h };
      DT.controlesAtivos = true; DT.particulas = []; DT.textos = []; DT.projeteis = []; DT.projInimigos = [];
      if (window.DuckSom) DuckSom.tocarMusica('corrida');
    },

    caixaJog() {
      const H = DT.HEROIS[DT.jogo.ativo], j = this.j, h = j.ag ? H.h * 0.5 : H.h;
      return { x: HX - H.w / 2, y: j.y - h, w: H.w, h };
    },

    atualizar(dt) {
      const c = this, E = DT.ent, j = c.j, H = DT.HEROIS[DT.jogo.ativo];
      c.t += dt; DT.atualizarEfeitos(dt);
      if (c.fim) { c.fimT -= dt; if (c.fimT <= 0 || (c.fimT < 2.4 && DT.ent.avancarP)) this.sair(); return; }
      // qualquer toque começa (no celular, tocar no lado esquerdo vira joystick e não conta como "clique")
      if (c.instrucao) { if (E.avancarP || E.puloP || E.baixoP || (c.t > 0.4 && DT.ponteiro.down)) { c.instrucao = false; DT.som('clique'); } return; }

      // velocidade sobe aos poucos; tropeço freia
      c.vel = Math.min(440, c.vel + 6 * dt);
      c.dist += c.vel * dt;
      j.animT += dt * c.vel / 330; j.inv = Math.max(0, j.inv - dt); j.desl = Math.max(0, j.desl - dt);

      // pulo (segurar pula mais alto) e deslize
      if (E.puloP && j.noChao) { j.vy = -H.pulo; j.noChao = false; j.desl = 0; DT.som('pulo'); }
      if (!E.pulo && j.vy < -200) j.vy *= 0.55;
      if (E.baixoP) { if (j.noChao) { j.desl = 0.6; DT.som('pouso'); } else j.vy = Math.max(j.vy, 900); }
      j.vy += DT.GRAVIDADE * dt; j.y += j.vy * dt;
      if (j.y >= CH) { if (!j.noChao) DT.som('pouso'); j.y = CH; j.vy = 0; j.noChao = true; }
      j.ag = j.noChao && (E.baixo || j.desl > 0);
      if (j.ag && Math.random() < 0.5) DT.particulas.push({ x: HX - 24, y: CH - 6, vx: -DT.aleat(80, 180), vy: -DT.aleat(30, 110), vida: 0.3, cor: '#cbbf9e', tam: DT.aleat(3, 6) });

      const cj = this.caixaJog(), sx = x => x - c.dist + HX;
      // obstáculos
      c.obs.forEach(o => {
        if (o.feito) return;
        const x = sx(o.x);
        if (x < -300 || x > 1200) return;
        let caixa;
        if (o.tipo === 'baixo') caixa = o.poca ? { x: x - o.w / 2 + 14, y: CH - 12, w: o.w - 28, h: 12 } : { x: x - o.w / 2 + 6, y: CH - o.alt * 0.85, w: o.w - 12, h: o.alt * 0.85 };
        else if (o.tipo === 'alto') caixa = { x: x + 20, y: 0, w: LARG_ALTO - 40, h: CH - FOLGA };
        else caixa = { x: x - 24, y: o.y - 24, w: 48, h: 48 };
        if (!DT.sobrepoe(cj, caixa)) return;
        if (o.tipo === 'seta') { // seta dourada: vale 3 joias
          o.feito = true; c.pegas += 3; DT.som('carta'); DT.textoFlutuante(HX, j.y - 120, '+3 JOIAS!', '#fac775', 10);
          DT.respingo(x, o.y, '#fac775', 12, 200); return;
        }
        if (j.inv > 0) return;
        o.feito = true; c.tropecos++; j.inv = 1.2; c.vel = Math.max(220, c.vel * 0.6);
        DT.som('ai'); DT.tremer(6, 0.25); DT.respingo(HX, j.y - 50, '#e24b4a', 8, 180);
        DT.textoFlutuante(HX, j.y - 130, o.tipo === 'alto' ? 'DESLIZE! (▼)' : 'PULE!', '#ff9a9a', 10);
      });
      // joias
      c.joias.forEach(p => {
        if (p.pega) return;
        const x = sx(p.x);
        if (x < -40 || x > 1000) return;
        if (DT.sobrepoe(cj, { x: x - 16, y: p.y - 16, w: 32, h: 32 })) { p.pega = true; c.pegas++; DT.som('moeda'); DT.respingo(x, p.y, '#fac775', 5, 120); }
      });
      if (c.dist >= FIM) this.terminar();
    },

    terminar() {
      const c = this;
      const perc = c.pegas / Math.max(1, c.total);
      const perfeito = c.tropecos === 0 && perc >= 0.7;
      const moedas = perfeito ? 40 : Math.min(30, Math.floor(c.pegas / 2));
      c.fim = { perfeito, moedas, pegas: c.pegas, total: c.total, tropecos: c.tropecos }; c.fimT = 3.4;
      DT.jogo.moedas += moedas; DT.jogo.pontos += perfeito ? 1500 : c.pegas * 30;
      DT.som(perfeito ? 'perfeito' : c.pegas ? 'moeda' : 'quackBravo');
      if (window.DuckSom) DuckSom.pararMusica();
    },
    sair() { DT.cenaAtual = DT.Nivel; DT.Nivel.voltarDoMinijogo(); DT.particulas = []; DT.textos = []; },

    desenhar(ctx) {
      const c = this, j = c.j, k = DT.jogo.ativo, H = DT.HEROIS[k], sx = x => x - c.dist + HX;
      // pista do metrô (o piso faz parte da imagem)
      const P = DT.IM.pista, pw = P.naturalWidth * DT.A / P.naturalHeight, ox = c.dist % pw;
      ctx.drawImage(P, -ox, 0, pw, DT.A); ctx.drawImage(P, pw - ox - 1, 0, pw, DT.A);
      ctx.fillStyle = 'rgba(10,8,26,0.15)'; ctx.fillRect(0, 0, DT.L, DT.A);
      ctx.save(); ctx.translate(DT.tremorX, DT.tremorY);
      // linhas de velocidade
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      for (let i = 0; i < 7; i++) { const y = 140 + i * 44, x = DT.L - ((c.dist * 2.4 + i * 170) % 1200); ctx.fillRect(x, y, 90, 2); }
      // chegada
      const xf = sx(FIM + 40);
      if (xf < DT.L + 300) {
        const a = DT.spr('corrida', 11), b = DT.spr('corrida', 12), h = 230, aw = a.width * h / a.height, bw = b.width * h / b.height;
        ctx.drawImage(a, xf - aw, CH + 4 - h, aw, h); ctx.drawImage(b, xf - 10, CH + 4 - h, bw, h);
        DT.texto(ctx, 'CHEGADA', xf, CH - h - 22, 12, '#ff5fb0', 'center');
      }
      // obstáculos
      const I = DT.F.corrida, esc = I.naturalWidth / 2000;
      c.obs.forEach(o => {
        const x = sx(o.x);
        if (x < -260 || x > DT.L + 60 || (o.feito && o.tipo === 'seta')) return;
        const alpha = o.feito ? 0.5 : 1;
        if (o.tipo === 'baixo') DT.desenharAltura(ctx, 'corrida', o.i, x, CH + 4, o.alt, false, { alpha });
        else if (o.tipo === 'seta') DT.desenharAltura(ctx, 'corrida', 13, x, o.y + 22 + Math.sin(c.t * 6) * 4, 44, false);
        else {
          const [rx, ry, rw, rh] = ALTOS[o.i], alt = LARG_ALTO * rh / rw, y = CH - FOLGA - alt;
          [0.2, 0.8].forEach(f => { // correntes até o teto
            ctx.fillStyle = '#0a0810'; ctx.fillRect(x + LARG_ALTO * f - 1, 0, 8, y + 8);
            ctx.fillStyle = '#8a8f9c'; for (let cy = 0; cy < y + 6; cy += 10) ctx.fillRect(x + LARG_ALTO * f + 1, cy, 4, 6);
          });
          ctx.globalAlpha = alpha; ctx.drawImage(I, rx * esc, ry * esc, rw * esc, rh * esc, x, y, LARG_ALTO, alt); ctx.globalAlpha = 1;
        }
      });
      // joias
      c.joias.forEach(p => {
        if (p.pega) return;
        const x = sx(p.x);
        if (x < -40 || x > DT.L + 40) return;
        DT.desenharAltura(ctx, 'corrida', JOIAS[p.j][Math.floor(c.t * 4 + p.x) % 2], x, p.y + 16 + Math.sin(c.t * 5 + p.x) * 3, 32, false);
      });
      // herói
      if (!(j.inv > 0 && Math.floor(j.inv * 12) % 2 === 0)) {
        if (j.ag) {
          const A = H.ag, e = A.esc * H.alvo / DT.caixaFrame(A.folha, A.ref).h;
          DT.desenhar(ctx, A.folha, A.deslize[Math.floor(j.animT * 10) % 2], HX, j.y + 2, e, false);
        } else {
          const f = !j.noChao ? (j.vy < 0 ? H.anims.pulo[0][0] : H.anims.queda[0][0]) : H.anims.andar[0][Math.floor(j.animT * 12) % H.anims.andar[0].length];
          DT.desenhar(ctx, k, f, HX, j.y + 2, j.esc, false);
        }
      }
      DT.desenharEfeitos(ctx);
      ctx.restore();

      // placar
      DT.caixa(ctx, 16, 16, 250, 50, 'rgba(10,6,18,0.88)', '#e0a826');
      DT.desenharAltura(ctx, 'corrida', 5, 46, 56, 30, false);
      DT.texto(ctx, 'JOIAS ' + c.pegas, 70, 26, 10, '#fac775', 'left', false);
      DT.texto(ctx, 'TROPEÇOS ' + c.tropecos, 70, 44, 8, c.tropecos ? '#ff9a9a' : '#9fe1cb', 'left', false);
      DT.caixa(ctx, 300, 22, 400, 30, 'rgba(10,6,18,0.88)', '#e0a826');
      ctx.fillStyle = '#ff5fb0'; ctx.fillRect(306, 28, 388 * DT.clamp(c.dist / FIM, 0, 1), 18);
      DT.texto(ctx, 'CORRIDA DO PIERCING', 944, 30, 10, '#ff5fb0', 'right');

      if (c.instrucao) {
        DT.caixa(ctx, 200, 110, 560, 150, 'rgba(18,12,30,0.94)', '#e0a826');
        DT.texto(ctx, 'LEVE O PIERCING ATÉ O ESTÚDIO!', 480, 128, 12, '#f1efe8', 'center', false);
        DT.texto(ctx, DT.usandoToque ? 'PULO: pula o que está no chão' : 'ESPAÇO: pula o que está no chão', 480, 164, 9, '#fac775', 'center', false);
        DT.texto(ctx, (DT.usandoToque ? 'Joystick para baixo' : '▼ / S') + ': desliza por baixo do pendurado', 480, 186, 9, '#9fe1cb', 'center', false);
        DT.texto(ctx, 'Pegue as joias pelo caminho', 480, 208, 9, '#f1efe8', 'center', false);
        if (Math.floor(c.t * 2) % 2 === 0) DT.texto(ctx, (DT.usandoToque ? 'TOQUE' : 'APERTE ESPAÇO') + ' PARA COMEÇAR', 480, 236, 9, '#ff5fb0', 'center', false);
      }
      if (c.fim) {
        ctx.fillStyle = 'rgba(16,8,28,0.62)'; ctx.fillRect(0, 0, DT.L, DT.A);
        const F = c.fim;
        DT.texto(ctx, F.perfeito ? 'ENTREGA PERFEITA!' : 'CHEGOU!', 480, 180, 24, F.perfeito ? '#9fe1cb' : '#fac775', 'center');
        DT.texto(ctx, 'JOIAS: ' + F.pegas + '   TROPEÇOS: ' + F.tropecos, 480, 240, 12, '#f1efe8', 'center');
        DT.texto(ctx, '+' + F.moedas + ' MOEDAS', 480, 276, 14, '#fac775', 'center');
      }
    }
  };
})();
