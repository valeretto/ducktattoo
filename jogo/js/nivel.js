/* Fases jogáveis (plataforma). Cada fase tem um mapa e um "visual" próprios em DT.FASES. */
(function () {
  'use strict';
  const DT = window.DT;
  const CHAO = 470;
  DT.CHAO = CHAO;

  /* =====================================================================
     FASE 1: O Estúdio Encantado
     ===================================================================== */
  const MAPA1 = {
    largura: 9700,
    poderes: [[3000, 430, 'rapido'], [5650, 430, 'forte'], [8900, 430, 'invencivel']],
    patinho: [6805, 175], // em cima da prateleira mais alta
    chaos: [[0, 1400], [1520, 4560], [4780, 6250], [6400, 8000], [8330, 9700]],
    prateleiras: [[480, 360, 190], [1640, 362, 190], [1960, 340, 190], [2290, 335, 200], [3440, 385, 140],
      [4180, 360, 170], [5080, 350, 190], [5480, 360, 190],
      [6500, 380, 160], [6720, 300, 170], [6960, 380, 160], [7440, 385, 140], [8480, 340, 190], [9000, 360, 180]],
    caem: [[4600, 400, 150], [8040, 400, 120], [8195, 400, 120]],
    blocos: [[3600, 300, 170, 110], [7600, 300, 170, 110]], // estantes: só a Gina passa por baixo (vão de 60px)
    espinhos: [[2330, 72], [5170, 80], [8520, 90], [8820, 80]],
    pocas: [[4980, 100], [7250, 110]],
    moedas: [[300, 430], [340, 430], [380, 430], [540, 320], [580, 320], [620, 320], [900, 430], [940, 430],
      [1460, 360], [1700, 320], [1740, 320], [2010, 300], [2050, 300], [2340, 295], [2380, 295], [2420, 295],
      [2800, 430], [2840, 430], [3100, 430], [3480, 345], [3660, 260], [3700, 260], [4230, 320], [4270, 320],
      [4640, 340], [4680, 340], [5130, 310], [5170, 310], [5530, 320], [5570, 320], [5900, 430], [5940, 430],
      [6320, 380], [6540, 340], [6580, 340], [6760, 260], [6800, 260], [6840, 260], [7000, 340], [7040, 340],
      [7650, 440], [7690, 440], [7730, 440], [7660, 260], [7710, 260], [8080, 360], [8235, 360],
      [8530, 300], [8570, 300], [8610, 300], [9040, 320], [9080, 320], [9200, 430], [9240, 430]],
    baus: [3685],
    coracoes: [[1250, 420], [2700, 420], [4265, 315], [5580, 320], [6805, 255], [7960, 420], [8575, 295], [9300, 420]],
    checkpoints: [2560, 3880, 6150, 8420],
    minijogo: 4020,
    porta: 9420,
    inimigos: [
      ['maquininha', 760], ['maquininha', 1120], ['cadeira', 1760, 280], ['frasco', 1880], ['frasco', 2055, 340],
      ['cadeira', 2230, 250], ['quadro', 2960, 430], ['maquininha', 3200], ['quadro', 3380, 420],
      ['luva', 4380], ['rosa', 4900], ['luva', 5300], ['rosa', 5420], ['cadeira', 5700, 270], ['maquininha', 5800],
      ['frasco', 6800, 300], ['quadro', 6650, 430], ['cadeira', 7050, 260], ['maquininha', 7300], ['luva', 7900],
      ['cadeira', 8350, 260], ['rosa', 8700], ['frasco', 9050, 360], ['maquininha', 9150], ['luva', 9250], ['quadro', 9100, 430]
    ]
  };

  const VIS1 = {
    fundo: 'fundo', escurecer: 0.4,
    piso(ctx, a, b, vis) {
      const piso = DT.spr('tiles', 1), ph = 72, pw = piso.width * ph / piso.height;
      ctx.save(); ctx.beginPath(); ctx.rect(a, CHAO - 4, b - a, 200); ctx.clip();
      for (let x = a; x < b; x += pw - 1) if (vis(x, pw)) ctx.drawImage(piso, x, CHAO - 4, pw, ph);
      ctx.fillStyle = '#2a1608'; ctx.fillRect(a, CHAO + ph - 6, b - a, 100);
      ctx.restore();
    },
    inicio(ctx, t) {
      DT.desenharAltura(ctx, 'tiles', 10, 110, CHAO, 66, false);
      DT.desenharAltura(ctx, 'pato', [0, 1, 2, 3][Math.floor(t * 3) % 4], 106, CHAO - 56, 84, false);
    },
    bloco(ctx, x, y, w, h) {
      ctx.drawImage(DT.spr('tiles', 4), x, y, w, h);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
      DT.desenharAltura(ctx, 'tiles', 12, x + w / 2, y, 56, false);
    },
    plataforma(ctx, x, y, w, rachada) {
      const h = 30;
      if (rachada) { ctx.drawImage(DT.spr('tiles', 9), x, y - 4, w, h + 6); return; }
      const a = DT.spr('tiles', 6), m = DT.spr('tiles', 7), b = DT.spr('tiles', 8);
      const aw = a.width * h / a.height, bw = b.width * h / b.height, mw = m.width * h / m.height;
      ctx.drawImage(a, x, y - 4, aw, h);
      let px = x + aw - 1;
      while (px < x + w - bw) { const lw = Math.min(mw, x + w - bw - px + 1); ctx.drawImage(m, 0, 0, m.width * lw / mw, m.height, px, y - 4, lw, h); px += lw - 1; }
      ctx.drawImage(b, x + w - bw, y - 4, bw, h);
    },
    espinhos(ctx, x, w) {
      const esp = DT.spr('tiles', 15), h = 34, ew = esp.width * h / esp.height;
      for (let px = x; px < x + w - 2; px += ew - 2) ctx.drawImage(esp, px, CHAO - h + 2, Math.min(ew, x + w - px), h);
    },
    checkpoint(ctx, p, t) {
      DT.desenharAltura(ctx, 'tiles', 21, p.x, CHAO + 2, 54, false);
      if (!p.aceso) return;
      for (let i = 0; i < 3; i++) {
        const fx = p.x + (i - 1) * 8, fy = CHAO - 54, alt = 18 + Math.sin(t * 12 + i * 2) * 6;
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(fx - 7, fy); ctx.lineTo(fx, fy - alt - 3); ctx.lineTo(fx + 7, fy); ctx.fill();
        ctx.fillStyle = i === 1 ? '#fff3b0' : '#e0a826'; ctx.beginPath(); ctx.moveTo(fx - 5, fy); ctx.lineTo(fx, fy - alt); ctx.lineTo(fx + 5, fy); ctx.fill();
      }
    },
    bau(ctx, b) { DT.desenharAltura(ctx, 'tiles', b.aberto ? 19 : 18, b.x, CHAO + 2, 40, false); },
    poca: t => DT.spr('tiles', Math.floor(t * 3) % 2 ? 16 : 20),
    moeda: t => ['tiles', [23, 24, 25, 24][Math.floor(t * 8) % 4]],
    estacao(ctx, x) { DT.desenharMaca(ctx, x, CHAO + 2, 96); },
    porta: 'ferro'
  };

  /* =====================================================================
     FASE 2: Cemitério das Caveiras
     ===================================================================== */
  const MAPA2 = {
    largura: 9700,
    poderes: [[2500, 430, 'rapido'], [6450, 430, 'forte'], [7300, 430, 'invencivel']],
    patinho: [5115, 446], // dentro do mausoléu: só a Gina passa
    chaos: [[0, 1500], [1630, 3300], [3420, 5200], [5330, 7000], [7150, 8600], [8720, 9700]],
    prateleiras: [[420, 360, 180], [900, 340, 180], [1540, 370, 120], [2100, 330, 180], [2600, 360, 160], [3050, 330, 180],
      [3800, 360, 180], [4300, 330, 160], [4780, 385, 120], [5600, 350, 180], [6100, 330, 180], [6500, 360, 160],
      [7500, 340, 180], [8000, 300, 180], [8300, 360, 160], [9000, 350, 180]],
    caem: [[3320, 400, 110], [7020, 400, 110], [8615, 400, 100]],
    blocos: [[4950, 300, 170, 110]], // mausoléu baixo: só a Gina passa por baixo
    espinhos: [[1100, 80], [2850, 90], [4450, 80], [6700, 90], [8200, 80]],
    pocas: [[2300, 100], [5800, 110], [7700, 100]],
    moedas: [[300, 430], [340, 430], [380, 430], [470, 320], [510, 320], [550, 320], [950, 300], [990, 300], [1030, 300],
      [1560, 330], [1600, 330], [1900, 430], [1940, 430], [2150, 290], [2190, 290], [2230, 290], [2650, 320], [2690, 320],
      [3100, 260], [3140, 260], [3180, 260], [3370, 360], [3850, 320], [3890, 320], [4350, 280], [4390, 280],
      [5000, 440], [5040, 440], [5080, 440], [5000, 260], [5060, 260], [5650, 310], [5690, 310], [6150, 260], [6190, 260],
      [6230, 260], [7070, 360], [7550, 300], [7590, 300], [8050, 260], [8090, 260], [8660, 360], [9050, 310], [9090, 310],
      [9200, 430], [9240, 430]],
    baus: [5035],
    coracoes: [[1300, 420], [2650, 315], [4040, 420], [5650, 305], [6850, 420], [8050, 255], [9200, 380]],
    checkpoints: [2450, 4200, 6300, 8000],
    minijogo: 3650,
    porta: 9420,
    inimigos: [
      ['marujo', 700], ['lapide', 1000], ['andorinha', 1250, 190], ['zumbi', 1850], ['fantasma', 2200, 330],
      ['ancora', 2750], ['marujo', 3050], ['lapide', 3550], ['zumbi', 3950], ['andorinha', 4300, 170],
      ['fantasma', 4650, 300], ['ancora', 5500], ['marujo', 5900], ['zumbi', 6250], ['lapide', 6600],
      ['andorinha', 6900, 180], ['fantasma', 7350, 320], ['ancora', 7800], ['zumbi', 8150], ['marujo', 8450],
      ['lapide', 8900], ['fantasma', 9100, 300], ['zumbi', 9250]
    ]
  };

  const VIS2 = {
    fundo: 'fundo2', escurecer: 0.32,
    piso(ctx, a, b, vis, buracoAntes, buracoDepois) {
      const s = DT.spr('tiles2', 5), h = 80, w = s.width * h / s.height;
      ctx.save(); ctx.beginPath(); ctx.rect(a - 12, CHAO - 30, b - a + 24, 230); ctx.clip();
      for (let x = a; x < b; x += w - 1) if (vis(x, w)) ctx.drawImage(s, x, CHAO - 14, w, h);
      ctx.fillStyle = '#1a1010'; ctx.fillRect(a, CHAO + h - 18, b - a, 100);
      const ponta = i => { const p = DT.spr('tiles2', i); return [p, p.width * h / p.height]; };
      if (buracoAntes) { const [p, pw] = ponta(4); ctx.drawImage(p, a, CHAO - 14, pw, h); }
      if (buracoDepois) { const [p, pw] = ponta(6); ctx.drawImage(p, b - pw, CHAO - 14, pw, h); }
      ctx.restore();
    },
    inicio(ctx, t) {
      DT.desenharAltura(ctx, 'tiles2', 29, 70, CHAO + 4, 52, false);
      DT.desenharAltura(ctx, 'pato', [0, 1, 2, 3][Math.floor(t * 3) % 4], 130, CHAO + 2, 84, false);
    },
    bloco(ctx, x, y, w, h) {
      const s = DT.spr('tiles2', 2);
      ctx.drawImage(s, x, y, w, h);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
      DT.desenharAltura(ctx, 'tiles2', 29, x + w / 2, y + 4, 44, false);
    },
    plataforma(ctx, x, y, w, rachada) {
      const h = 64, topo = y - h * 0.6; // a laje da lápide fica a ~60% da altura da peça
      if (rachada) { const s = DT.spr('tiles2', 12); ctx.drawImage(s, x, topo, w, s.height * w / s.width); return; }
      const a = DT.spr('tiles2', 9), m = DT.spr('tiles2', 10), z = DT.spr('tiles2', 11);
      const W = s => s.width * h / s.height, aw = W(a), zw = W(z), mw = W(m);
      ctx.drawImage(a, x, topo, aw, h);
      let px = x + aw - 2;
      while (px < x + w - zw) { const lw = Math.min(mw, x + w - zw - px + 2); ctx.drawImage(m, 0, 0, m.width * lw / mw, m.height, px, topo, lw, h); px += lw - 2; }
      ctx.drawImage(z, x + w - zw, topo, zw, h);
    },
    espinhos(ctx, x, w) {
      const s = DT.spr('tiles2', 17), h = 42, ew = s.width * h / s.height;
      for (let px = x; px < x + w - 2; px += ew - 2) ctx.drawImage(s, 0, 0, s.width * Math.min(1, (x + w - px) / ew), s.height, px, CHAO - h + 4, Math.min(ew, x + w - px), h);
    },
    checkpoint(ctx, p, t) {
      if (p.aceso) {
        ctx.fillStyle = 'rgba(250,199,117,' + (0.18 + Math.sin(t * 6) * 0.06) + ')';
        ctx.beginPath(); ctx.arc(p.x + 6, CHAO - 66, 32, 0, Math.PI * 2); ctx.fill();
      }
      DT.desenharAltura(ctx, 'tiles2', p.aceso ? 24 : 23, p.x, CHAO + 2, 104, false);
    },
    bau(ctx, b) { DT.desenharAltura(ctx, 'tiles2', b.aberto ? 21 : 20, b.x, CHAO + 2, 44, false); },
    poca: t => DT.spr('tiles2', Math.floor(t * 3) % 2 ? 18 : 22),
    moeda: t => ['tiles2', [25, 26, 27, 26][Math.floor(t * 8) % 4]],
    estacao(ctx, x) { DT.desenharAltura(ctx, 'tiles2', 13, x, CHAO + 2, 54, false); },
    porta: 'portal',
    frente(ctx, cam, t) { // névoa roxa andando pelo chão
      for (let i = 0; i < 8; i++) {
        const x = ((i * 190 + t * 22) % 1300) - 170;
        ctx.fillStyle = 'rgba(170,140,220,0.12)';
        ctx.beginPath(); ctx.ellipse(x, CHAO - 10 + Math.sin(t + i) * 6, 160, 24, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  };

  /* =====================================================================
     FASE 3: Cidade Neon
     ===================================================================== */
  const MAPA3 = {
    largura: 9900,
    poderes: [[2000, 430, 'rapido'], [6000, 430, 'forte'], [7400, 430, 'invencivel']],
    patinho: [3090, 180], // acima da sacada mais alta
    chaos: [[0, 1450], [1580, 3250], [3380, 5150], [5300, 6950], [7100, 8550], [8700, 9900]],
    prateleiras: [[430, 350, 190], [880, 330, 180], [1480, 370, 130], [2080, 330, 190], [2560, 350, 170], [3000, 330, 180],
      [3780, 350, 190], [4280, 330, 170], [4760, 380, 130], [5580, 345, 190], [6080, 330, 180], [6480, 355, 170],
      [7460, 335, 190], [7960, 300, 180], [8260, 360, 170], [9000, 345, 190]],
    caem: [[3270, 400, 100], [6970, 400, 110], [8580, 400, 100]],
    blocos: [[4920, 300, 170, 110]], // ar-condicionado gigante: só a Gina passa por baixo
    espinhos: [[1100, 80], [2830, 90], [4430, 80], [6680, 90], [8180, 80]],
    pocas: [[2280, 100], [5780, 110], [7680, 100]],
    moedas: [[300, 430], [340, 430], [380, 430], [480, 310], [520, 310], [560, 310], [930, 290], [970, 290], [1010, 290],
      [1510, 330], [1550, 330], [1880, 430], [1920, 430], [2130, 290], [2170, 290], [2210, 290], [2610, 310], [2650, 310],
      [3050, 260], [3090, 260], [3130, 260], [3320, 360], [3830, 310], [3870, 310], [4330, 280], [4370, 280],
      [4970, 440], [5010, 440], [5050, 440], [4970, 260], [5030, 260], [5630, 305], [5670, 305], [6130, 260], [6170, 260],
      [6210, 260], [7020, 360], [7510, 295], [7550, 295], [8010, 260], [8050, 260], [8630, 360], [9050, 305], [9090, 305],
      [9300, 430], [9340, 430]],
    baus: [5005],
    coracoes: [[1300, 420], [2620, 305], [4010, 420], [5640, 300], [6830, 420], [8020, 255], [9300, 380]],
    checkpoints: [2440, 4180, 6280, 7980],
    minijogo: 3620,
    porta: 9620,
    decor: [[150, 'cone'], [1250, 'lixo'], [2400, 'hidrante'], [3500, 'cone'], [4600, 'lixo'], [5450, 'hidrante'],
      [6350, 'cone'], [7250, 'lixo'], [8400, 'hidrante'], [9450, 'cone']],
    inimigos: [
      ['gato', 700], ['letreiro', 1000, 270], ['dados', 1300], ['spray', 1900], ['love', 2250, 330],
      ['carpa', 2700, 300], ['gato', 3050], ['letreiro', 3500, 260], ['dados', 3950], ['love', 4350, 320],
      ['spray', 4700], ['carpa', 5500, 290], ['gato', 5900], ['dados', 6250], ['letreiro', 6600, 270],
      ['love', 6900, 330], ['spray', 7350], ['carpa', 7800, 300], ['gato', 8150], ['dados', 8450],
      ['letreiro', 8900, 260], ['spray', 9150], ['love', 9350, 320]
    ]
  };

  // Sacada de escada de incêndio: y = piso onde se pisa (o corrimão fica acima)
  DT.desenharSacada = function (ctx, x, y, w) {
    const H = 64, a = DT.spr('tiles3', 13), m = DT.spr('tiles3', 18), z = DT.spr('tiles3', 14);
    const k = H / a.height, aw = a.width * k, zw = z.width * k, topo = y - H * 0.395;
    ctx.drawImage(m, x + aw * 0.6, y, w - aw * 0.6 - zw * 0.6, m.height * k);
    ctx.drawImage(a, x, topo, aw, H); ctx.drawImage(z, x + w - zw, topo, zw, H);
  };

  const VIS3 = {
    fundo: 'fundo3', escurecer: 0.26, semEspelho: true, // tem letreiros "TATTOO": espelhado ficaria de trás para frente
    piso(ctx, a, b, vis, buracoAntes, buracoDepois) {
      const H = 118, s = DT.spr('chao3', 1), w = s.width * H / s.height, topo = CHAO - 26;
      ctx.save(); ctx.beginPath(); ctx.rect(a, CHAO - 40, b - a, 240); ctx.clip();
      for (let x = a; x < b; x += w - 1) if (vis(x, w)) ctx.drawImage(s, x, topo, w, H);
      ctx.fillStyle = '#24160f'; ctx.fillRect(a, topo + H - 4, b - a, 100);
      const ponta = i => { const p = DT.spr('chao3', i); return [p, p.width * H / p.height]; };
      if (buracoAntes) { const [p, pw] = ponta(0); ctx.drawImage(p, a, topo, pw, H); }
      if (buracoDepois) { const [p, pw] = ponta(2); ctx.drawImage(p, b - pw, topo, pw, H); }
      ctx.restore();
    },
    inicio(ctx, t) {
      DT.desenharAltura(ctx, 'tiles3', 34, 70, CHAO + 4, 48, false);
      DT.desenharAltura(ctx, 'pato', [0, 1, 2, 3][Math.floor(t * 3) % 4], 130, CHAO + 2, 84, false);
    },
    bloco(ctx, x, y, w, h) { // ar-condicionado gigante pendurado
      const s = DT.spr('tiles3', 16);
      ctx.drawImage(s, x - 6, y - 6, w + 12, h + 12);
    },
    plataforma(ctx, x, y, w, rachada) {
      if (rachada) { const s = DT.spr('tiles3', 15), ww = w + 20; ctx.drawImage(s, x - 10, y - 30, ww, s.height * ww / s.width); return; }
      DT.desenharSacada(ctx, x, y, w);
    },
    espinhos(ctx, x, w, t) {
      const s = DT.spr('tiles3', Math.floor((t || 0) * 6 + x) % 2 ? 19 : 20), h = 34, ew = s.width * h / s.height;
      for (let px = x; px < x + w - 2; px += ew - 4) ctx.drawImage(s, 0, 0, s.width * Math.min(1, (x + w - px) / ew), s.height, px, CHAO - h + 2, Math.min(ew, x + w - px), h);
    },
    checkpoint(ctx, p, t) {
      if (p.aceso) {
        const g = ctx.createRadialGradient(p.x + 12, CHAO - 118, 0, p.x + 12, CHAO - 118, 70);
        g.addColorStop(0, 'rgba(250,199,117,' + (0.4 + Math.sin(t * 6) * 0.08) + ')'); g.addColorStop(1, 'rgba(250,199,117,0)');
        ctx.fillStyle = g; ctx.fillRect(p.x - 60, CHAO - 190, 140, 140);
      }
      DT.desenharAltura(ctx, 'tiles3', p.aceso ? 27 : 26, p.x, CHAO + 2, 140, false);
    },
    bau(ctx, b) { DT.desenharAltura(ctx, 'tiles3', b.aberto ? 24 : 23, b.x, CHAO + 2, 44, false); },
    poca: t => DT.spr('tiles3', [25, 21, 22, 21][Math.floor(t * 4) % 4]),
    moeda: t => ['tiles3', [28, 29, 30, 31][Math.floor(t * 8) % 4]],
    estacao(ctx, x) { // entrada do metrô (arco de neon da corrida)
      const s = DT.spr('corrida', 11), z = DT.spr('corrida', 12), h = 120, sw = s.width * h / s.height, zw = z.width * h / z.height;
      ctx.drawImage(s, x - sw + 6, CHAO + 2 - h, sw, h); ctx.drawImage(z, x - 6, CHAO + 2 - h, zw, h);
      DT.texto(ctx, 'METRÔ', x, CHAO - h - 18, 9, '#ff5fb0', 'center');
    },
    decor: { cone: [32, 40], lixo: [33, 48], hidrante: [34, 46] }, folha: 'tiles3',
    porta: 'ferro'
  };

  /* =====================================================================
     FASE 4: Floresta da Tinta
     ===================================================================== */
  const MAPA4 = {
    largura: 9900,
    poderes: [[2000, 430, 'rapido'], [5700, 430, 'forte'], [7400, 430, 'invencivel']],
    patinho: [9150, 100], // lá no alto do último cogumelo-trampolim
    // os vãos de 300px (3000 e 6600) só se atravessam pelo cipó de tinta
    chaos: [[0, 1500], [1630, 3000], [3300, 4900], [5040, 6600], [6900, 8400], [8540, 9900]],
    prateleiras: [[420, 350, 190], [880, 320, 180], [1990, 330, 190], [2560, 190, 170], [3480, 350, 180], [3820, 300, 170],
      [4560, 340, 170], [5120, 380, 130], [5560, 320, 180], [6050, 300, 170], [7150, 340, 190], [7760, 180, 170], [8150, 320, 170], [9300, 340, 180]],
    caem: [[1515, 400, 100], [4925, 400, 100], [8425, 400, 100]],
    blocos: [[5300, 300, 170, 110]], // pedra grande: só a Gina passa por baixo
    espinhos: [[1100, 80], [2750, 90], [4650, 80], [6300, 90], [8050, 80]],
    pocas: [[2250, 100], [5900, 110], [7450, 100]],
    trampolins: [650, 2450, 4350, 5800, 7650, 9150],
    cipos: [[3000, 300], [6600, 300]],
    moedas: [[300, 430], [340, 430], [380, 430], [470, 310], [510, 310], [550, 310], [650, 200], [650, 150], [650, 100],
      [930, 280], [970, 280], [1010, 280], [1550, 330], [1580, 330], [2040, 290], [2080, 290], [2120, 290],
      [2450, 200], [2450, 150], [2600, 150], [2640, 150], [2680, 150], [3150, 420], [3190, 420], [3530, 310], [3570, 310],
      [3870, 260], [3910, 260], [4350, 200], [4350, 150], [4610, 300], [4650, 300], [5350, 440], [5390, 440], [5430, 440],
      [5800, 200], [5800, 150], [6100, 260], [6140, 260], [6750, 420], [6790, 420], [7200, 300], [7240, 300],
      [7800, 140], [7840, 140], [7880, 140], [8200, 280], [8240, 280], [9150, 200], [9150, 150], [9350, 300], [9390, 300]],
    baus: [5385],
    coracoes: [[1300, 420], [2645, 140], [4100, 420], [5610, 280], [6950, 420], [7845, 95], [9200, 380]],
    checkpoints: [2200, 4150, 6200, 8000],
    minijogo: 3950,
    porta: 9620,
    decor: [[160, 'rosas'], [1250, 'cogumelos'], [2300, 'pedra'], [3400, 'rosas'], [4800, 'cogumelos'], [5550, 'pedra'],
      [6450, 'rosas'], [7300, 'cogumelos'], [8650, 'pedra'], [9500, 'rosas']],
    inimigos: [
      ['cogumelo', 820], ['borboleta', 1050, 250], ['serpente', 1400], ['planta', 1850], ['coruja', 2150, 250],
      ['filhote', 2650], ['cogumelo', 3550], ['planta', 3720], ['borboleta', 4250, 240], ['serpente', 4500],
      ['coruja', 4750, 240], ['filhote', 5650], ['cogumelo', 6000], ['planta', 6450], ['borboleta', 7050, 250],
      ['serpente', 7350], ['coruja', 7950, 240], ['filhote', 8250], ['cogumelo', 8800], ['planta', 9050],
      ['serpente', 9400], ['borboleta', 9450, 240]
    ]
  };

  const VIS4 = {
    fundo: 'fundo4', escurecer: 0.2,
    piso(ctx, a, b, vis, buracoAntes, buracoDepois) {
      const H = 120, s = DT.spr('chao4', 1), w = s.width * H / s.height, topo = CHAO - 26;
      ctx.save(); ctx.beginPath(); ctx.rect(a - 14, CHAO - 60, b - a + 28, 260); ctx.clip();
      for (let x = a; x < b; x += w - 1) if (vis(x, w)) ctx.drawImage(s, x, topo, Math.min(w, b - x + 1), H);
      ctx.fillStyle = '#2a170c'; ctx.fillRect(a, topo + H - 4, b - a, 100);
      const ponta = i => { const p = DT.spr('chao4', i); return [p, p.width * H / p.height]; };
      if (buracoAntes) { const [p, pw] = ponta(0); ctx.drawImage(p, a - 10, topo, pw, H); }
      if (buracoDepois) { const [p, pw] = ponta(2); ctx.drawImage(p, b - pw + 10, topo, pw, H); }
      ctx.restore();
    },
    inicio(ctx, t) {
      DT.desenharAltura(ctx, 'tiles4', 26, 60, CHAO + 4, 50, false);
      DT.desenharAltura(ctx, 'pato', [0, 1, 2, 3][Math.floor(t * 3) % 4], 130, CHAO + 2, 84, false);
    },
    bloco(ctx, x, y, w, h) { ctx.drawImage(DT.spr('tiles4', 28), x - 10, y - 14, w + 20, h + 20); },
    plataforma(ctx, x, y, w, rachada) {
      if (rachada) { const s = DT.spr('tiles4', 7), ww = w + 16; ctx.drawImage(s, x - 8, y - 16, ww, s.height * ww / s.width); return; }
      const h = 40, a = DT.spr('tiles4', 4), m = DT.spr('tiles4', 5), z = DT.spr('tiles4', 6);
      const aw = a.width * h / a.height, zw = z.width * h / z.height;
      ctx.drawImage(m, x + aw - 8, y - 10, w - aw - zw + 16, h); ctx.drawImage(a, x, y - 14, aw, h + 4); ctx.drawImage(z, x + w - zw, y - 14, zw, h + 4);
    },
    espinhos(ctx, x, w) {
      const s = DT.spr('tiles4', 12), h = 38, ew = s.width * h / s.height;
      for (let px = x; px < x + w - 2; px += ew - 4) ctx.drawImage(s, 0, 0, s.width * Math.min(1, (x + w - px) / ew), s.height, px, CHAO - h + 4, Math.min(ew, x + w - px), h);
    },
    checkpoint(ctx, p, t) {
      if (p.aceso) {
        const g = ctx.createRadialGradient(p.x, CHAO - 60, 0, p.x, CHAO - 60, 70);
        g.addColorStop(0, 'rgba(250,199,117,' + (0.4 + Math.sin(t * 6) * 0.08) + ')'); g.addColorStop(1, 'rgba(250,199,117,0)');
        ctx.fillStyle = g; ctx.fillRect(p.x - 70, CHAO - 130, 140, 140);
      }
      DT.desenharAltura(ctx, 'tiles4', p.aceso ? 20 : 19, p.x, CHAO + 4, 96, false);
    },
    bau(ctx, b) { DT.desenharAltura(ctx, 'tiles4', b.aberto ? 18 : 17, b.x, CHAO + 4, 52, false); },
    poca: t => DT.spr('tiles4', [21, 15, 16, 15][Math.floor(t * 4) % 4]),
    moeda: t => ['tiles4', [22, 23, 24, 25][Math.floor(t * 8) % 4]],
    estacao(ctx, x) { // oficina na árvore: o frasco de tinta marca a entrada
      DT.desenharAltura(ctx, 'tiles4', 26, x - 40, CHAO + 4, 46, false);
      DT.desenharAltura(ctx, 'chuva', 12, x + 10, CHAO + 4, 76, false);
    },
    trampolim(ctx, s) {
      const amassado = s.amassa > 0;
      DT.desenharAltura(ctx, 'tiles4', amassado ? 9 : 8, s.x + s.w / 2, CHAO + 4, amassado ? 62 : 84, false);
    },
    cipo(ctx, cp, t, perto) {
      if (cp.estado === 2) { const s = DT.spr('tiles4', 11), w = cp.w + 50, h = s.height * w / s.width; ctx.drawImage(s, cp.x - 25, CHAO - h * 0.42, w, h); return; }
      if (cp.estado === 1) { DT.desenharAltura(ctx, 'tiles4', 10, cp.x + 40, CHAO + 6, 70 + (0.7 - cp.t) * 60, false); return; }
      DT.desenharAltura(ctx, 'tiles4', 14, cp.x + 22, CHAO + 4, 58, false);
      if (perto) {
        const y = CHAO - 110 + Math.sin(t * 4) * 4;
        DT.texto(ctx, 'ATIRE NO BROTO!', cp.x + 22, y, 8, '#9fe1cb', 'center');
      }
    },
    decor: { cogumelos: [26, 48], rosas: [27, 52], pedra: [28, 50] },
    folha: 'tiles4',
    porta: 'portal',
    frente(ctx, cam, t) { // vaga-lumes
      for (let i = 0; i < 14; i++) {
        const x = ((i * 137 + t * 18 - cam * 0.2) % 1100 + 1100) % 1100 - 70, y = 120 + (i * 53) % 300 + Math.sin(t * 1.5 + i) * 16;
        ctx.globalAlpha = 0.4 + Math.sin(t * 3 + i * 2) * 0.35; ctx.fillStyle = '#fff3a0'; ctx.fillRect(x, y, 4, 4);
      }
      ctx.globalAlpha = 1;
    }
  };

  DT.desenharTronco = (ctx, x, y, w) => VIS4.plataforma(ctx, x, y, w, false);

  /* =====================================================================
     FASE FINAL: O Reino da Tinta  (unir forças: cada herói abre um caminho)
     ===================================================================== */
  const MAPA5 = {
    largura: 9900,
    poderes: [[2300, 430, 'rapido'], [5200, 430, 'forte'], [7400, 430, 'invencivel']],
    patinho: [5905, 135], // em cima da plataforma mais alta, depois do 2º cristal
    // os vãos de 300px (3000 e 6600) só se atravessam acendendo o cristal azul (tiro da Yasmin)
    chaos: [[0, 1500], [1630, 3000], [3300, 4900], [5040, 6600], [6900, 8400], [8540, 9900]],
    // alturas medidas com a física dos heróis: do chão, o Emerson (pulo mais baixo) alcança até y = 330
    prateleiras: [[420, 350, 190], [880, 335, 180], [2000, 335, 190], [2500, 340, 170], [3480, 350, 180], [3820, 300, 170],
      [5560, 335, 180], [5830, 270, 150], [7150, 340, 190], [7700, 335, 170], [9300, 340, 180]],
    caem: [[1515, 400, 100], [4925, 400, 100], [8425, 400, 100]],
    blocos: [],
    portas: [1850, 5300],          // porta de nanquim: só o tiro do Emerson quebra
    tuneis: [[4300, 200], [7950, 200]], // passagem baixa: só a Gina passa
    cipos: [[3000, 300], [6600, 300]], cipoTiro: 'azul', // cristais
    espinhos: [[1100, 80], [2750, 90], [4650, 80], [6300, 90], [8250, 80]],
    pocas: [[2250, 100], [5900, 110], [7450, 100]],
    moedas: [[300, 430], [340, 430], [380, 430], [470, 310], [510, 310], [550, 310], [930, 280], [970, 280], [1010, 280],
      [1550, 330], [1580, 330], [2040, 290], [2080, 290], [2120, 290], [2550, 300], [2590, 300], [3150, 420], [3190, 420],
      [3530, 310], [3570, 310], [3870, 260], [3910, 260], [4350, 440], [4400, 440], [4450, 440], [5610, 280], [5650, 280],
      [6750, 420], [6790, 420], [7200, 300], [7240, 300], [7750, 280], [7790, 280], [8000, 440], [8050, 440], [8100, 440],
      [9350, 300], [9390, 300]],
    baus: [8150],
    coracoes: [[1300, 420], [2590, 250], [4100, 420], [5610, 240], [6950, 420], [7790, 240], [9200, 380]],
    checkpoints: [2200, 4150, 6200, 8600],
    minijogo: 3950,
    porta: 9620,
    decor: [[160, 'frasco'], [1250, 'agulha'], [2420, 'chama'], [3420, 'frasco'], [4820, 'chama'], [5480, 'agulha'],
      [6480, 'frasco'], [7300, 'chama'], [8700, 'agulha'], [9500, 'frasco']],
    inimigos: [
      ['gosma', 800], ['morcego', 1100, 250], ['maotinta', 1400], ['artista', 2150], ['aranha', 2600, 200],
      ['frascomau', 2850], ['gosma', 3550], ['maotinta', 3720], ['morcego', 4100, 240], ['artista', 4700],
      ['aranha', 5100, 200], ['frascomau', 5800], ['gosma', 6200], ['maotinta', 6450], ['morcego', 7050, 250],
      ['artista', 7500], ['aranha', 7650, 200], ['frascomau', 8800], ['gosma', 9000], ['maotinta', 9150],
      ['artista', 9400], ['morcego', 9450, 240]
    ]
  };

  function pecasPapel(ctx, x, y, w) { // plataforma de papel flutuante (tileset da Fase Final)
    const h = 52, a = DT.spr('tiles5', 0), m = DT.spr('tiles5', 1), z = DT.spr('tiles5', 2);
    const aw = a.width * h / a.height, zw = z.width * h / z.height;
    ctx.drawImage(m, x + aw - 8, y - 12, w - aw - zw + 16, h); ctx.drawImage(a, x, y - 12, aw, h); ctx.drawImage(z, x + w - zw, y - 12, zw, h);
  }
  DT.desenharPapel = pecasPapel;
  // plaquinha "use este herói"
  function avisoHeroi(ctx, x, y, heroi, txt, cor) {
    DT.caixa(ctx, x - 84, y, 168, 34, 'rgba(10,6,18,0.9)', cor);
    DT.desenharAltura(ctx, heroi, DT.HEROIS[heroi].anims.parado[0][0], x - 62, y + 32, heroi === 'gina' ? 22 : 30, false);
    DT.texto(ctx, txt, x - 40, y + 13, 7, cor, 'left', false);
  }
  const VIS5 = {
    fundo: 'fundo5', escurecer: 0.18,
    piso(ctx, a, b, vis, buracoAntes, buracoDepois) {
      const H = 120, s = DT.spr('chao5', 1), w = s.width * H / s.height, topo = CHAO - 22;
      ctx.save(); ctx.beginPath(); ctx.rect(a - 14, CHAO - 60, b - a + 28, 260); ctx.clip();
      for (let x = a; x < b; x += w - 1) if (vis(x, w)) ctx.drawImage(s, x, topo, Math.min(w, b - x + 1), H);
      ctx.fillStyle = '#15101f'; ctx.fillRect(a, topo + H - 4, b - a, 100);
      const ponta = i => { const p = DT.spr('chao5', i); return [p, p.width * H / p.height]; };
      if (buracoAntes) { const [p, pw] = ponta(0); ctx.drawImage(p, a - 10, topo, pw, H); }
      if (buracoDepois) { const [p, pw] = ponta(2); ctx.drawImage(p, b - pw + 10, topo, pw, H); }
      ctx.restore();
    },
    inicio(ctx, t) {
      DT.desenharAltura(ctx, 'tiles5', 23, 60, CHAO + 4, 50, false);
      DT.desenharAltura(ctx, 'pato', [0, 1, 2, 3][Math.floor(t * 3) % 4], 130, CHAO + 2, 84, false);
    },
    bloco(ctx, x, y, w, h) { ctx.drawImage(DT.spr('tiles5', 4), x, y, w, h); },
    plataforma(ctx, x, y, w, rachada) {
      if (rachada) { const s = DT.spr('tiles5', 3), ww = w + 20; ctx.drawImage(s, x - 10, y - 14, ww, s.height * ww / s.width); return; }
      pecasPapel(ctx, x, y, w);
    },
    espinhos(ctx, x, w) {
      const s = DT.spr('tiles5', 11), h = 40, ew = s.width * h / s.height;
      for (let px = x; px < x + w - 2; px += ew - 4) ctx.drawImage(s, 0, 0, s.width * Math.min(1, (x + w - px) / ew), s.height, px, CHAO - h + 4, Math.min(ew, x + w - px), h);
    },
    checkpoint(ctx, p, t) {
      if (p.aceso) {
        const g = ctx.createRadialGradient(p.x, CHAO - 60, 0, p.x, CHAO - 60, 70);
        g.addColorStop(0, 'rgba(250,199,117,' + (0.4 + Math.sin(t * 6) * 0.08) + ')'); g.addColorStop(1, 'rgba(250,199,117,0)');
        ctx.fillStyle = g; ctx.fillRect(p.x - 70, CHAO - 130, 140, 140);
      }
      DT.desenharAltura(ctx, 'tiles5', p.aceso ? 16 : 15, p.x, CHAO + 4, 90, false);
    },
    bau(ctx, b) { DT.desenharAltura(ctx, 'tiles5', b.aberto ? 14 : 13, b.x, CHAO + 4, 56, false); },
    poca: t => DT.spr('tiles5', [17, 12, 18, 12][Math.floor(t * 4) % 4]),
    moeda: t => ['tiles5', [19, 20, 21, 22][Math.floor(t * 8) % 4]],
    estacao(ctx, x, t) { // altar da Tatuagem Lendária
      DT.desenharAltura(ctx, 'tiles5', 16, x, CHAO + 4, 90, false);
    },
    cipo(ctx, cp, t, perto) { // cristal azul: aceso, vira uma ponte de papel
      DT.desenharAltura(ctx, 'tiles5', cp.estado ? 7 : 6, cp.x - 40, CHAO + 4, 86, false);
      if (cp.estado === 2) pecasPapel(ctx, cp.x - 10, CHAO, cp.w + 20);
      else if (cp.estado === 1) { ctx.fillStyle = 'rgba(88,166,255,0.35)'; ctx.beginPath(); ctx.arc(cp.x - 40, CHAO - 50, 80, 0, Math.PI * 2); ctx.fill(); }
      else if (perto) avisoHeroi(ctx, cp.x - 40, CHAO - 190, 'yasmin', 'ACENDA O CRISTAL', '#58a6ff');
    },
    portaNanquim(ctx, p, t, perto) {
      const s = DT.spr('tiles5', p.hp < p.hpMax ? 5 : 4), h = 160, w = s.width * h / s.height;
      ctx.save(); if (p.quebrada) ctx.globalAlpha = Math.max(0, p.some);
      ctx.drawImage(s, p.x + 35 - w / 2 + (p.tremer > 0 ? DT.aleat(-3, 3) : 0), CHAO + 4 - h, w, h); ctx.restore();
      if (perto && !p.quebrada) avisoHeroi(ctx, p.x + 35, CHAO - 210, 'emerson', 'TIRO DO EMERSON', '#ff6a4a');
    },
    tunel(ctx, tn, t, perto) {
      const a = DT.spr('tiles5', 8), b = DT.spr('tiles5', 9), h = 150, aw = a.width * h / a.height, bw = b.width * h / b.height;
      // coluna de nanquim (o bloco de preenchimento do chão, empilhado até o alto da tela)
      const f = DT.spr('chao5', 3), lado = 100;
      for (let y = CHAO + 6 - h; y > -lado; y -= lado - 2) for (let x = tn.x; x < tn.x + tn.w; x += lado - 2) ctx.drawImage(f, 0, 0, f.width * Math.min(1, (tn.x + tn.w - x) / lado), f.height, x, y - lado, Math.min(lado, tn.x + tn.w - x), lado);
      ctx.fillStyle = '#000'; ctx.fillRect(tn.x - 3, -200, 3, CHAO + 6 - h + 200); ctx.fillRect(tn.x + tn.w, -200, 3, CHAO + 6 - h + 200);
      ctx.fillStyle = '#0d0816'; ctx.fillRect(tn.x + aw - 14, CHAO + 6 - h, tn.w - aw - bw + 28, h - 66);
      ctx.drawImage(a, tn.x - 10, CHAO + 6 - h, aw, h); ctx.drawImage(b, tn.x + tn.w - bw + 10, CHAO + 6 - h, bw, h);
      if (perto) avisoHeroi(ctx, tn.x + tn.w / 2, CHAO - 250, 'gina', 'SÓ A GINA PASSA', '#9fe1cb');
    },
    decor: { frasco: [23, 46], agulha: [24, 50], chama: [25, 40] }, folha: 'tiles5',
    porta: 'portal'
  };

  DT.FASES = {
    1: {
      nome: 'O ESTÚDIO ENCANTADO', mapa: MAPA1, vis: VIS1, musica: 'fase1', chefe: 'chefe', minijogo: 'minijogo',
      cartas: ['maquininha', 'frasco', 'cadeira', 'caveira', 'luva', 'rosa'],
      falaMinijogo: [
        { t: 'Um cliente apareceu! Ele está com pressa...', r: 1 },
        { t: 'Passe o dedo (ou o mouse) sobre o tracejado para tatuar. Não deixa ele esperando!', r: 2 }],
      falaPorta: [
        { t: 'A Máquina Gigante está logo ali. Ela pegou o cartucho de tinta mágica.', r: 1 },
        { t: 'E não toque no meu letreiro.', r: 2 }],
      falaInicio: null
    },
    2: {
      nome: 'CEMITÉRIO DAS CAVEIRAS', mapa: MAPA2, vis: VIS2, musica: 'fase2', chefe: 'chefe2', minijogo: 'decalque',
      cartas: ['marujo', 'zumbi', 'fantasma', 'ancora', 'andorinha', 'lapide'],
      falaMinijogo: [
        { t: 'Um decalque mal-assombrado! O desenho vai sumindo da mesa de luz...', r: 1 },
        { t: 'Copie antes que ele desapareça. Rápido, mas com mão firme.', r: 2 }],
      falaPorta: [
        { t: 'Esse portal leva ao navio do Caveirão Marinheiro. O segundo cartucho está com ele.', r: 1 },
        { t: 'Cuidado com o gancho. E com o bafo de cachimbo.', r: 2 }],
      falaInicio: [
        { t: 'Bem-vindos ao Cemitério das Caveiras. Lindo, né? Só que não.', r: 1 },
        { t: 'Zumbi que cai levanta de novo: termine o serviço. E fantasma só apanha quando aparece.', r: 2 },
        { t: 'O próximo cartucho está no navio do porto. Andem. Quack.', r: 0 }]
    },
    3: {
      nome: 'CIDADE NEON', mapa: MAPA3, vis: VIS3, musica: 'fase3', chefe: 'chefe3', minijogo: 'corrida',
      cartas: ['letreiro', 'gato', 'dados', 'love', 'carpa', 'spray'],
      falaMinijogo: [
        { t: 'Um cliente quer um piercing urgente... e o estúdio fica do outro lado do metrô!', r: 1 },
        { t: 'Corra! PULE o que está no chão e DESLIZE (▼) por baixo do que está pendurado. Pegue as joias!', r: 2 }],
      falaPorta: [
        { t: 'O Tigre Neon está lá em cima, no terraço. O terceiro cartucho está com ele.', r: 1 },
        { t: 'Quando ele ficar furioso, a cidade apaga. Fiquem de olho no chão. Quack.', r: 2 }],
      falaInicio: [
        { t: 'Cidade Neon. Muita luz, muito barulho e tinta mágica escorrendo dos letreiros.', r: 1 },
        { t: 'Novidade: segure ▼ para AGACHAR. Correndo, vocês DESLIZAM. Faíscas e mordidas passam por cima.', r: 2 },
        { t: 'O próximo cartucho está com o Tigre Neon. Andem. Quack.', r: 0 }]
    },
    4: {
      nome: 'FLORESTA DA TINTA', mapa: MAPA4, vis: VIS4, musica: 'fase4', chefe: 'chefe4', minijogo: 'chuva',
      cartas: ['cogumelo', 'borboleta', 'serpente', 'coruja', 'planta', 'filhote'],
      falaMinijogo: [
        { t: 'A oficina da árvore precisa de tinta nova. E está chovendo cor lá dentro!', r: 1 },
        { t: 'Pegue só as gotas da cor pedida com o copinho. Gota roxa de cara feia estraga tudo.', r: 2 }],
      falaPorta: [
        { t: 'Lá em cima da montanha mora o Dragão de Tinta. O quarto cartucho está na garra dele.', r: 1 },
        { t: 'Ele voa. Usem os troncos para alcançar. E não fiquem embaixo quando ele mergulhar. Quack.', r: 2 }],
      falaInicio: [
        { t: 'Floresta da Tinta. Tudo aqui parece ter saído de uma tatuagem floral.', r: 1 },
        { t: 'Pisem nos cogumelos para pular alto. E vãos grandes? Atirem no broto que o cipó vira ponte.', r: 2 },
        { t: 'O Dragão de Tinta está com o próximo cartucho. Andem. Quack.', r: 0 }]
    },
    5: {
      nome: 'O REINO DA TINTA', mapa: MAPA5, vis: VIS5, musica: 'fase5', chefe: 'chefe5', minijogo: 'lendaria',
      cartas: ['gosma', 'maotinta', 'morcego', 'artista', 'aranha', 'frascomau'],
      falaMinijogo: [
        { t: 'O altar da Tatuagem Lendária. Tatue o símbolo do Duck Tattoo e a tinta fica selada.', r: 1 },
        { t: 'É o meu rosto. Então capricha. Mão firme.', r: 2 }],
      falaPorta: [
        { t: 'O trono do Demônio do Nanquim. Foi ele que mandou aquela caixa.', r: 1 },
        { t: 'Quando ele pegar os cartuchos, peguem de volta nos pedestais. Agora vai. Quack.', r: 2 }],
      falaInicio: [
        { t: 'O Reino da Tinta. Onde tudo começou. Que lugar mais... roxo.', r: 1 },
        { t: 'Aqui vocês precisam se ajudar: porta de nanquim é com o Emerson, cristal azul com a Yasmin, túnel baixo com a Gina.', r: 2 },
        { t: 'Usem o TROCA na hora certa. Último cartucho. Andem. Quack.', r: 0 }]
    }
  };
  DT.faseAtual = () => DT.FASES[(DT.jogo && DT.jogo.fase) || 1];

  /* =====================================================================
     Cena da fase
     ===================================================================== */
  DT.Nivel = {
    nome: 'nivel',
    iniciar(reiniciar) {
      const c = this, F = DT.faseAtual(), M = F.mapa;
      c.F = F; c.M = M; c.vis = F.vis;
      c.solidos = [];
      M.chaos.forEach(([a, b]) => c.solidos.push({ tipo: 'solido', chao: true, x: a, y: CHAO, w: b - a, h: 200 }));
      M.prateleiras.forEach(([x, y, w]) => c.solidos.push({ tipo: 'plat', x, y, w, h: 16 }));
      M.caem.forEach(([x, y, w]) => c.solidos.push({ tipo: 'plat', cai: true, x, y, y0: y, w, h: 16, t: 0, vy: 0, caiu: false }));
      M.blocos.forEach(([x, y, w, h]) => c.solidos.push({ tipo: 'solido', bloco: true, x, y, w, h }));
      // Fase 4: cogumelos-trampolim (só pisando por cima) e cipós que viram ponte quando levam um tiro
      (M.trampolins || []).forEach(x => c.solidos.push({ tipo: 'plat', trampolim: true, x: x - 38, y: CHAO - 58, w: 76, h: 16, amassa: 0 }));
      c.cipos = (M.cipos || []).map(([x, w]) => ({ x, w, estado: 0, t: 0 }));
      // Fase Final: portas de nanquim (só o tiro do Emerson quebra) e túneis baixos (só a Gina passa)
      c.portasN = (M.portas || []).map(x => { const s = { tipo: 'solido', x, y: CHAO - 160, w: 70, h: 160, hp: 6, hpMax: 6, quebrada: false, some: 1, tremer: 0 }; c.solidos.push(s); return s; });
      c.tuneis = (M.tuneis || []).map(([x, w]) => { const s = { tipo: 'solido', x, y: -400, w, h: CHAO - 58 + 400 }; c.solidos.push(s); return s; });
      c.largura = M.largura;
      if (!reiniciar) {
        c.moedas = M.moedas.map(([x, y]) => ({ x, y, pega: false }));
        c.baus = M.baus.map(x => ({ x, aberto: false }));
        c.checkpoints = M.checkpoints.map(x => ({ x, aceso: false }));
        DT.jogo.checkpoint = { x: 200, y: CHAO };
      }
      c.pocas = M.pocas.map(([x, w]) => ({ x, w, y: CHAO, vida: null }));
      c.coracoes = M.coracoes.map(([x, y]) => ({ x, y, pego: false }));
      c.poderes = (M.poderes || []).map(([x, y, tipo]) => ({ x, y, tipo, pego: false }));
      c.patinho = M.patinho ? { x: M.patinho[0], y: M.patinho[1] } : null;
      c.inimigos = [];
      M.inimigos.forEach(([t, x, y]) => {
        if (t === 'andorinha') { // vêm em bando de 3
          for (let k = 0; k < 3; k++) { const e = DT.criarInimigo(t, x + k * 60, y + k * 24); e.base = x + k * 60; c.inimigos.push(e); }
          return;
        }
        const e = DT.criarInimigo(t, x, y != null ? y : CHAO);
        if (['cadeira', 'fantasma', 'letreiro', 'love', 'carpa', 'borboleta', 'morcego'].includes(t)) e.base = x;
        c.inimigos.push(e);
      });
      DT.projeteis = []; DT.projInimigos = []; DT.particulas = []; DT.textos = [];
      c.jog = DT.criarJogador(DT.jogo.checkpoint.x, DT.jogo.checkpoint.y);
      c.salvo = { x: c.jog.x, y: c.jog.y };
      c.cam = DT.clamp(c.jog.x - 380, 0, c.largura - DT.L);
      c.t = 0; c.saindo = false;
      DT.controlesAtivos = true;
      if (window.DuckSom) DuckSom.tocarMusica(F.musica);
    },
    renascer() {
      const j = this.jog;
      j.x = DT.jogo.checkpoint.x; j.y = DT.jogo.checkpoint.y;
      this.salvo = { x: j.x, y: j.y };
      this.cam = DT.clamp(j.x - 380, 0, this.largura - DT.L);
      DT.projInimigos = [];
      DT.textoFlutuante(j.x, j.y - 130, 'VIDAS: ' + DT.jogo.vidas, '#fac775', 12);
    },
    voltarDoMinijogo() {
      DT.controlesAtivos = true;
      if (window.DuckSom) DuckSom.tocarMusica(this.F.musica);
    },

    atualizar(dt) {
      const c = this, j = c.jog, M = c.M, F = c.F;
      c.t += dt;
      DT.jogo.tempo += dt;
      DT.jogo.tinta = Math.min(1, DT.jogo.tinta + 0.03 * dt);

      // plataformas que caem
      c.solidos.forEach(s => {
        if (!s.cai) return;
        if (s.caiu) { s.vy += 1400 * dt; s.y += s.vy * dt; s.t += dt; if (s.t > 3.5) { s.caiu = false; s.y = s.y0; s.vy = 0; s.t = 0; s.tremendo = 0; } }
        else if (s.tremendo > 0) { s.tremendo -= dt; if (s.tremendo <= 0) { s.caiu = true; s.t = 0; DT.som('pouso'); } }
      });

      // poças deixam lento
      c.pocas.forEach(p => { if (p.vida != null) p.vida -= dt; });
      c.pocas = c.pocas.filter(p => p.vida == null || p.vida > 0);
      if (j.noChao && c.pocas.some(p => j.x > p.x && j.x < p.x + p.w && Math.abs(j.y - p.y) < 6)) j.lento = 0.25;

      DT.atualizarJogador(j, dt, c.solidos);
      if (j.noChao && j.chaoObj && j.chaoObj.cai && !j.chaoObj.tremendo && !j.chaoObj.caiu) { j.chaoObj.tremendo = 0.45; DT.som('cadeiraAsas'); }
      if (j.noChao && j.chaoObj && j.chaoObj.chao) c.salvo = { x: j.x, y: j.y };
      // cogumelo-trampolim: pisou, voou
      c.solidos.forEach(s => { if (s.trampolim) s.amassa = Math.max(0, s.amassa - dt); });
      if (j.noChao && j.chaoObj && j.chaoObj.trampolim) {
        j.chaoObj.amassa = 0.18; j.vy = -1080; j.noChao = false; j.coyote = 0; j.y -= 2;
        DT.som('pulo'); DT.respingo(j.x, j.y, '#f6a8ff', 6, 160);
      }
      // cipó: um tiro no broto faz ele crescer até virar ponte
      c.cipos.forEach(cp => {
        if (cp.estado === 0) {
          const alvo = { x: cp.x - 10, y: CHAO - 80, w: 70, h: 80 };
          DT.projeteis.forEach(p => {
            if (p.vida > 0 && cp.estado === 0 && DT.sobrepoe(DT.caixaProjetil(p), alvo)) {
              if (M.cipoTiro && p.tipo !== M.cipoTiro) { p.vida = 0; if (!c.avisoT) { c.avisoT = 1; DT.textoFlutuante(cp.x, CHAO - 130, 'SÓ A YASMIN ACENDE!', '#58a6ff', 9); DT.som('clique'); } return; }
              p.vida = 0; cp.estado = 1; cp.t = 0.7; DT.som('carta'); DT.respingo(cp.x + 20, CHAO - 30, '#8a3fe0', 12, 200);
            }
          });
        } else if (cp.estado === 1) {
          cp.t -= dt;
          if (cp.t <= 0) {
            cp.estado = 2; DT.som('checkpoint');
            c.solidos.push({ tipo: 'plat', cipo: true, x: cp.x - 10, y: CHAO, w: cp.w + 20, h: 16 });
            DT.textoFlutuante(cp.x + cp.w / 2, CHAO - 90, 'VIROU PONTE!', '#9fe1cb', 10);
          }
        }
      });
      j.x = DT.clamp(j.x, 20, c.largura - 20);

      // caiu no buraco
      if (j.y > 700 && !(DT.jogo.renascendo > 0)) {
        j.inv = 0; DT.ferirJogador(j, 1, j.x);
        if (DT.jogo.acabou) return;
        j.x = c.salvo.x - j.dir * 40; j.y = c.salvo.y; j.vx = 0; j.vy = 0;
        if (!(DT.jogo.renascendo > 0)) DT.textoFlutuante(j.x, j.y - 120, 'CUIDADO COM O BURACO!', '#ff9a9a', 9);
      }

      // espinhos
      const cj = DT.caixaDe(j);
      M.espinhos.forEach(([x, w]) => {
        if (DT.sobrepoe(cj, { x: x + 6, y: CHAO - 26, w: w - 12, h: 26 })) { if (j.inv <= 0) { DT.ferirJogador(j, 1, x + w / 2); j.vy = -520; } }
      });

      // portas de nanquim: só o tiro do Emerson (nanquim) quebra
      c.avisoT = Math.max(0, (c.avisoT || 0) - dt);
      c.portasN.forEach(pt => {
        pt.tremer = Math.max(0, pt.tremer - dt);
        if (pt.quebrada) { pt.some -= dt * 1.5; return; }
        DT.projeteis.forEach(p => {
          if (p.vida <= 0 || !DT.sobrepoe(DT.caixaProjetil(p), pt)) return;
          p.vida = 0;
          if (p.tipo !== 'nanquim') { if (!c.avisoT) { c.avisoT = 1; DT.textoFlutuante(pt.x + 35, CHAO - 180, 'SÓ O EMERSON QUEBRA!', '#ff6a4a', 9); DT.som('clique'); } return; }
          pt.hp -= p.dano; pt.tremer = 0.2; DT.respingo(p.x, p.y, '#1b1b1b', 8, 200); DT.som('caveiraRacha');
          if (pt.hp <= 0) { pt.quebrada = true; pt.caiu = true; DT.som('frascoBum'); DT.tremer(8, 0.3); DT.respingo(pt.x + 35, CHAO - 80, '#8a3fe0', 24, 320); }
        });
      });
      DT.atualizarInimigos(c, dt);
      DT.atualizarProjeteis(dt, c.solidos);
      DT.colisoesProjeteis(c);
      DT.atualizarProjInimigos(c, dt);
      DT.atualizarEfeitos(dt);

      // moedas
      c.moedas.forEach(m => {
        if (!m.pega && DT.sobrepoe(cj, { x: m.x - 14, y: m.y - 14, w: 28, h: 28 })) {
          m.pega = true; DT.jogo.moedas++; DT.jogo.pontos += 10; DT.som('moeda');
          DT.respingo(m.x, m.y, '#fac775', 5, 120);
        }
      });
      // corações de energia
      c.coracoes.forEach(h => {
        if (h.pego || !DT.sobrepoe(cj, { x: h.x - 16, y: h.y - 16, w: 32, h: 32 })) return;
        h.pego = true;
        DT.pegarCoracao(h.x, h.y);
      });
      // power-ups
      c.poderes.forEach(p => {
        if (!p.pego && DT.sobrepoe(cj, { x: p.x - 22, y: p.y - 26, w: 44, h: 52 })) { p.pego = true; DT.pegarPoder(p.tipo, p.x, p.y); }
      });
      // patinho dourado secreto: +1 vida (uma vez por fase)
      const pat = c.patinho, achados = DT.jogo.patinhos || {};
      if (pat && !achados[DT.jogo.fase] && DT.sobrepoe(cj, { x: pat.x - 22, y: pat.y - 22, w: 44, h: 44 })) { j.vx = 0; DT.pegarPatinho(pat.x, pat.y); }
      // baú (só a Gina alcança)
      c.baus.forEach(b => {
        if (!b.aberto && DT.sobrepoe(cj, { x: b.x - 22, y: CHAO - 40, w: 44, h: 40 })) {
          b.aberto = true; DT.som('bau');
          DT.jogo.moedas += 10; DT.jogo.pontos += 500;
          DT.jogo.energia = DT.ENERGIA_MAX; DT.jogo.vidas = Math.min(DT.VIDAS_MAX, DT.jogo.vidas + 1);
          DT.jogo.tinta = 1;
          DT.mostrarBanner('BAÚ SECRETO!', null, '+1 VIDA · +10 MOEDAS · ENERGIA CHEIA');
        }
      });
      // checkpoints
      c.checkpoints.forEach(p => {
        if (!p.aceso && Math.abs(j.x - p.x) < 30 && j.noChao) {
          p.aceso = true; DT.jogo.checkpoint = { x: p.x, y: CHAO };
          DT.som('checkpoint'); DT.textoFlutuante(p.x, CHAO - 120, 'CHECKPOINT!', '#e0a826', 10);
          DT.respingo(p.x, CHAO - 50, '#fac775', 16, 220);
        }
      });
      // minijogo
      if (!DT.jogo.minijogoFeito && Math.abs(j.x - M.minijogo) < 40 && j.noChao) {
        DT.jogo.minijogoFeito = true; j.vx = 0;
        DT.dialogo(F.falaMinijogo, () => DT.irPara(F.minijogo));
      }
      // porta do chefe
      if (j.x > M.porta + 60 && !c.saindo) {
        c.saindo = true; j.vx = 0;
        // guarda quantas moedas da fase foram pegas (conta para a "fase perfeita" e os 25%)
        DT.jogo.moedasFase = { pegas: c.moedas.filter(m => m.pega).length, total: c.moedas.length };
        DT.dialogo(F.falaPorta, () => DT.irPara(F.chefe));
      }

      const alvo = DT.clamp(j.x - 380 + j.dir * 40, 0, c.largura - DT.L);
      c.cam += (alvo - c.cam) * Math.min(1, dt * 6);
    },

    desenhar(ctx) {
      const c = this, cam = Math.round(c.cam), V = c.vis, I = DT.IM[V.fundo];
      // fundo com paralaxe (espelhado para emendar)
      const fh = DT.A, fw = I.naturalWidth * fh / I.naturalHeight, par = cam * 0.45;
      const ini = Math.floor(par / fw);
      for (let i = ini; i <= ini + 1; i++) {
        const x = i * fw - par;
        ctx.save();
        if (i % 2 !== 0 && !V.semEspelho) { ctx.translate(x + fw, 0); ctx.scale(-1, 1); ctx.drawImage(I, 0, 0, fw, fh); }
        else ctx.drawImage(I, x, 0, fw, fh);
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(16,8,28,' + V.escurecer + ')'; ctx.fillRect(0, 0, DT.L, DT.A);

      ctx.save();
      ctx.translate(-cam + DT.tremorX, DT.tremorY);
      this.desenharCenario(ctx, cam);
      c.pocas.forEach(p => {
        const s = V.poca(c.t), h = 20;
        ctx.globalAlpha = p.vida != null ? Math.min(1, p.vida) : 1;
        ctx.drawImage(s, p.x, p.y - h + 4, p.w, h); ctx.globalAlpha = 1;
      });
      DT.desenharInimigos(ctx, c);
      DT.desenharJogador(ctx, c.jog);
      DT.desenharProjeteis(ctx);
      DT.projeteisInimigosDesenhar(ctx);
      DT.desenharEfeitos(ctx);
      if (V.frente) { ctx.save(); ctx.translate(cam, 0); V.frente(ctx, cam, c.t); ctx.restore(); }
      ctx.restore();
      DT.desenharHUD(ctx);
    },

    desenharCenario(ctx, cam) {
      const c = this, t = c.t, M = c.M, V = c.vis;
      const vis = (x, w) => x + w > cam - 50 && x < cam + DT.L + 50;
      // buracos (só o vão escuro)
      for (let i = 0; i < M.chaos.length - 1; i++) {
        const a = M.chaos[i][1], b = M.chaos[i + 1][0];
        ctx.fillStyle = '#07040c'; ctx.fillRect(a, CHAO + 10, b - a, 80);
      }
      // chão (com pontas quando dá para um buraco)
      M.chaos.forEach(([a, b], i) => { if (vis(a, b - a)) V.piso(ctx, a, b, vis, i > 0, i < M.chaos.length - 1); });
      V.inicio(ctx, t);
      if (M.decor && V.decor) M.decor.forEach(([x, k]) => { if (vis(x - 40, 80)) { const [i, h] = V.decor[k]; DT.desenharAltura(ctx, V.folha || 'tiles3', i, x, CHAO + 4, h, false); } });
      c.solidos.forEach(s => { if (s.trampolim && vis(s.x, s.w)) V.trampolim(ctx, s); });
      (c.cipos || []).forEach(cp => { if (vis(cp.x - 80, cp.w + 120)) V.cipo(ctx, cp, t, Math.abs(c.jog.x - cp.x) < 520); });
      (c.portasN || []).forEach(p => { if (vis(p.x - 60, 190) && p.some > 0) V.portaNanquim(ctx, p, t, Math.abs(c.jog.x - p.x) < 480); });
      (c.tuneis || []).forEach(tn => { if (vis(tn.x - 40, tn.w + 80)) V.tunel(ctx, tn, t, Math.abs(c.jog.x - tn.x) < 480 && DT.jogo.ativo !== 'gina'); });
      M.blocos.forEach(([x, y, w, h]) => V.bloco(ctx, x, y, w, h));
      c.solidos.filter(s => s.tipo === 'plat').forEach(s => {
        if (!vis(s.x, s.w) || s.trampolim || s.cipo) return; // trampolim e cipó têm desenho próprio
        if (s.cai && s.caiu && s.y > 700) return;
        const tr = s.tremendo > 0 ? DT.aleat(-2, 2) : 0;
        V.plataforma(ctx, s.x + tr, s.y, s.w, s.cai);
      });
      M.espinhos.forEach(([x, w]) => { if (vis(x, w)) V.espinhos(ctx, x, w, t); });
      c.checkpoints.forEach(p => { if (vis(p.x - 40, 80)) V.checkpoint(ctx, p, t); });
      c.baus.forEach(b => V.bau(ctx, b));
      // minijogo
      V.estacao(ctx, M.minijogo);
      if (!DT.jogo.minijogoFeito) {
        const y = CHAO - 120 + Math.sin(t * 4) * 5;
        DT.caixa(ctx, M.minijogo - 18, y, 36, 40, '#f1efe8', '#000');
        DT.texto(ctx, '!', M.minijogo, y + 10, 20, '#e24b4a', 'center', false);
      }
      // porta do chefe (16 bits)
      if (vis(M.porta, 260)) DT.desenharPorta(ctx, M.porta + 100, CHAO, V.porta, t);
      // corações de energia
      c.coracoes.forEach(h => {
        if (h.pego || !vis(h.x, 40)) return;
        const y = h.y + Math.sin(t * 3 + h.x) * 4;
        ctx.fillStyle = 'rgba(226,75,74,' + (0.25 + Math.sin(t * 5) * 0.1) + ')';
        ctx.beginPath(); ctx.arc(h.x, y, 22, 0, Math.PI * 2); ctx.fill();
        DT.coracao(ctx, h.x - 14, y - 12, 4, true);
      });
      // power-ups e patinho secreto
      c.poderes.forEach(p => { if (!p.pego && vis(p.x - 30, 60)) DT.desenharItemPoder(ctx, p.tipo, p.x, p.y, t + p.x); });
      const pat = c.patinho;
      if (pat && !(DT.jogo.patinhos || {})[DT.jogo.fase] && vis(pat.x - 30, 60)) {
        ctx.fillStyle = 'rgba(250,199,117,' + (0.22 + Math.sin(t * 6) * 0.1) + ')'; ctx.beginPath(); ctx.arc(pat.x, pat.y, 30, 0, Math.PI * 2); ctx.fill();
        DT.desenharAltura(ctx, 'pw', 12 + Math.floor(t * 6) % 4, pat.x, pat.y + 22 + Math.sin(t * 3) * 3, 44, false);
      }
      // moedas
      const [folha, fr] = V.moeda(t);
      c.moedas.forEach(m => { if (!m.pega && vis(m.x, 30)) DT.desenharAltura(ctx, folha, fr, m.x, m.y + 13, 28, false); });
    }
  };

  // A maca vem dividida em duas peças na folha: junta as duas na posição original
  DT.desenharMaca = function (ctx, cx, base, alt) {
    const a = DT.CX.tiles[12], b = DT.CX.tiles[13];
    const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x + a.w, b.x + b.w);
    const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y + a.h, b.y + b.h);
    const s = alt / (y1 - y0), larg = (x1 - x0) * s;
    [[12, a], [13, b]].forEach(([i, cx_]) => {
      const sp = DT.spr('tiles', i);
      ctx.drawImage(sp, cx - larg / 2 + (cx_.x - x0 - 2) * s, base - alt + (cx_.y - y0 - 2) * s, sp.width * s, sp.height * s);
    });
  };

  DT.projeteisInimigosDesenhar = function (ctx) {
    const salvo = DT.projeteis;
    DT.projeteis = DT.projInimigos;
    DT.desenharProjeteis(ctx);
    DT.projeteis = salvo;
  };
})();
