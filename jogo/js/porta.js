/* Porta do chefão em pixel art 16 bits (desenhada pixel a pixel e ampliada) */
(function () {
  'use strict';
  const DT = window.DT = window.DT || {};
  const PX = 4; // cada "pixel" da arte vira 4x4 na tela
  const W = 44, H = 58;
  const telas = {};

  const C = {
    preto: '#0b0710', ouro: '#e0a826', ouroClaro: '#fac775', ouroEscuro: '#8a5a12',
    madeira: '#6b3f1e', madeiraClara: '#8f5a2e', madeiraEscura: '#4a2712',
    roxo: '#8a3fe0', roxoClaro: '#c79bff', roxoEscuro: '#4b1d8a',
    verde: '#3f6b3a', verdeClaro: '#6fa05a', laranja: '#e07a1f', creme: '#f3ead3',
    ferro: '#5f5e5a', ferroClaro: '#8c8a84', ferroEscuro: '#3a3936', amarelo: '#f2c230',
    tijolo: '#4a3866', tijoloClaro: '#6a5390', tijoloEscuro: '#2e2244', rosa: '#ff5fb0'
  };

  function tela(estilo) {
    if (!telas[estilo]) { const c = document.createElement('canvas'); c.width = W; c.height = H; telas[estilo] = c; }
    return telas[estilo];
  }
  function r(x, cor, px, py, w, h) { x.fillStyle = cor; x.fillRect(px, py, w || 1, h || 1); }

  // ---------- A: porta de madeira do estúdio ----------
  function madeira(x, t) {
    // batente dourado
    r(x, C.preto, 2, 6, 40, 52);
    r(x, C.ouro, 3, 7, 38, 51);
    r(x, C.ouroClaro, 3, 7, 38, 1); r(x, C.ouroClaro, 3, 7, 1, 51);
    r(x, C.ouroEscuro, 40, 8, 1, 50);
    r(x, C.preto, 6, 10, 32, 48);
    // duas folhas de madeira
    [[7, 15], [22, 15]].forEach(([px, w]) => {
      r(x, C.madeira, px, 11, w, 47);
      for (let k = px + 3; k < px + w; k += 4) r(x, C.madeiraEscura, k, 11, 1, 47);
      r(x, C.madeiraClara, px, 11, 1, 47); r(x, C.madeiraClara, px, 11, w, 1);
      // almofadas
      r(x, C.madeiraEscura, px + 2, 15, w - 4, 1); r(x, C.madeiraEscura, px + 2, 28, w - 4, 1);
      r(x, C.madeiraEscura, px + 2, 33, w - 4, 1); r(x, C.madeiraEscura, px + 2, 50, w - 4, 1);
      // ferragens
      r(x, C.preto, px, 18, w, 2); r(x, C.preto, px, 44, w, 2);
      r(x, C.ferroClaro, px + 1, 18, 1, 1); r(x, C.ferroClaro, px + w - 2, 18, 1, 1);
      r(x, C.ferroClaro, px + 1, 44, 1, 1); r(x, C.ferroClaro, px + w - 2, 44, 1, 1);
    });
    // fresta central com brilho roxo
    const brilho = 0.6 + Math.sin(t * 6) * 0.4;
    r(x, C.preto, 21, 11, 1, 47);
    x.globalAlpha = brilho; r(x, C.roxoClaro, 21, 14, 1, 42); x.globalAlpha = 1;
    // maçanetas
    r(x, C.ouroClaro, 18, 34, 2, 2); r(x, C.ouroEscuro, 19, 35, 1, 1);
    r(x, C.ouroClaro, 24, 34, 2, 2); r(x, C.ouroEscuro, 25, 35, 1, 1);
    // emblema do pato (bem pequeno) no topo
    r(x, C.preto, 17, 0, 10, 8);
    r(x, C.creme, 18, 1, 8, 6);
    r(x, C.verde, 20, 2, 4, 4); r(x, C.verdeClaro, 21, 2, 2, 1);
    r(x, C.laranja, 18, 4, 2, 1); r(x, C.creme, 22, 3, 1, 1); r(x, C.preto, 22, 3, 1, 1);
    r(x, C.ouro, 17, 0, 10, 1); r(x, C.ouro, 17, 7, 10, 1);
    // tinta roxa vazando por baixo
    tintaVazando(x, t, 8, 30);
  }

  // ---------- B: porta de ferro do depósito ----------
  function ferro(x, t) {
    r(x, C.preto, 2, 4, 40, 54);
    r(x, C.ferroEscuro, 3, 5, 38, 53);
    r(x, C.preto, 6, 8, 32, 50);
    r(x, C.ferro, 7, 9, 30, 49);
    r(x, C.ferroClaro, 7, 9, 30, 1); r(x, C.ferroClaro, 7, 9, 1, 49);
    // chapas e rebites
    [20, 34].forEach(py => r(x, C.ferroEscuro, 7, py, 30, 1));
    for (let py = 11; py < 56; py += 5) { r(x, C.ferroClaro, 9, py, 1, 1); r(x, C.ferroClaro, 34, py, 1, 1); }
    // janelinha com brilho roxo
    const b = 0.55 + Math.sin(t * 5) * 0.35;
    r(x, C.preto, 15, 12, 14, 8);
    x.globalAlpha = b; r(x, C.roxo, 16, 13, 12, 6); r(x, C.roxoClaro, 17, 14, 4, 2); x.globalAlpha = 1;
    r(x, C.preto, 22, 13, 1, 6);
    // faixas de perigo
    for (let k = 0; k < 30; k += 4) { r(x, C.amarelo, 7 + k, 50, 2, 5); r(x, C.preto, 9 + k, 50, 2, 5); }
    // corrente com cadeado arrebentado
    for (let k = 0; k < 12; k++) r(x, k % 2 ? C.ferroClaro : C.ferroEscuro, 10 + k * 2, 27 + (k % 2), 2, 1);
    r(x, C.ouro, 21, 29, 4, 4); r(x, C.ouroEscuro, 22, 30, 2, 2); r(x, C.ouroClaro, 21, 29, 4, 1);
    // placa PERIGO
    r(x, C.preto, 12, 38, 20, 8); r(x, C.amarelo, 13, 39, 18, 6);
    r(x, C.preto, 15, 41, 2, 2); r(x, C.preto, 18, 41, 2, 2); r(x, C.preto, 21, 41, 2, 2); r(x, C.preto, 24, 41, 2, 2); r(x, C.preto, 27, 41, 2, 2);
    tintaVazando(x, t, 8, 30);
  }

  // ---------- C: portal de tinta ----------
  function portal(x, t) {
    // arco de tijolos
    for (let py = 6; py < 58; py++) {
      const dentroArco = py > 18 ? 9 : 9 + Math.round(Math.sqrt(Math.max(0, 144 - (18 - py) * (18 - py) * 1.2)) - 12) * -1;
      r(x, C.preto, 2, py, 6, 1); r(x, C.preto, 36, py, 6, 1);
      r(x, (Math.floor(py / 3) % 2) ? C.tijolo : C.tijoloClaro, 3, py, 4, 1);
      r(x, (Math.floor(py / 3) % 2) ? C.tijoloClaro : C.tijolo, 37, py, 4, 1);
      if (dentroArco) { /* forma do arco abaixo */ }
    }
    // topo arredondado
    for (let k = 0; k < 40; k++) {
      const a = Math.PI * k / 39, px = Math.round(22 - Math.cos(a) * 18), py = Math.round(19 - Math.sin(a) * 15);
      r(x, C.preto, px - 1, py - 1, 3, 3);
      r(x, k % 3 ? C.tijolo : C.tijoloClaro, px, py, 2, 2);
    }
    // interior: redemoinho de tinta
    r(x, C.roxoEscuro, 8, 19, 28, 39);
    for (let py = 6; py < 20; py++) {
      const meia = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((19 - py) / 14, 2))) * 14);
      r(x, C.roxoEscuro, 22 - meia, py, meia * 2, 1);
    }
    for (let k = 0; k < 90; k++) {
      const a = k * 0.35 + t * 3, raio = k * 0.17;
      const px = Math.round(22 + Math.cos(a) * raio), py = Math.round(32 + Math.sin(a) * raio * 1.4);
      if (py > 6 && py < 57) r(x, k % 3 ? C.roxo : C.roxoClaro, px, py, 1, 1);
    }
    r(x, '#ffffff', 22, 32, 1, 1);
    tintaVazando(x, t, 6, 32);
  }

  function tintaVazando(x, t, ini, larg) {
    r(x, C.roxoEscuro, ini - 2, 56, larg + 4, 2);
    r(x, C.roxo, ini, 55, larg, 2);
    for (let k = 0; k < 4; k++) {
      const px = ini + 3 + k * Math.floor(larg / 4), d = (t * 6 + k * 3) % 6;
      r(x, C.roxoClaro, px, 55, 2, 1);
      if (d < 3) r(x, C.roxo, px - 3 + (k % 2) * 8, 57, 2, 1);
    }
  }

  const ESTILOS = { madeira, ferro, portal };
  DT.PORTA_ESTILOS = Object.keys(ESTILOS);

  // Desenha a porta com a base em (cx, chao)
  DT.desenharPorta = function (ctx, cx, chao, estilo, t) {
    const c = tela(estilo), x = c.getContext('2d');
    x.clearRect(0, 0, W, H);
    ESTILOS[estilo](x, t);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // brilho no chão
    ctx.fillStyle = 'rgba(138,63,224,' + (0.25 + Math.sin(t * 4) * 0.1) + ')';
    ctx.beginPath(); ctx.ellipse(cx, chao, W * PX * 0.6, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(c, cx - W * PX / 2, chao - H * PX + 6, W * PX, H * PX);
    // letreiro neon acima
    const pisca = Math.sin(t * 9) > -0.85;
    ctx.font = '14px ' + (DT.FONTE || 'monospace'); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const ly = chao - H * PX - 26;
    if (pisca) { ctx.shadowColor = C.rosa; ctx.shadowBlur = 12; }
    ctx.fillStyle = '#000'; ctx.fillText('CHEFE', cx + 2, ly + 2);
    ctx.fillStyle = pisca ? C.rosa : '#7a2e55'; ctx.fillText('CHEFE', cx, ly);
    ctx.restore();
  };
  DT.PORTA_LARG = W * PX;
})();
