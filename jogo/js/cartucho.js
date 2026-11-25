/* Cartucho de tinta mágica em pixel art 16 bits (desenhado pixel a pixel e ampliado) */
(function () {
  'use strict';
  const DT = window.DT = window.DT || {};
  const W = 22, H = 40;
  const telas = {};
  const C = {
    preto: '#0b0710', ouro: '#e0a826', ouroClaro: '#fac775', ouroEscuro: '#8a5a12',
    roxo: '#8a3fe0', roxoClaro: '#c79bff', roxoEscuro: '#4b1d8a', branco: '#f3ead3',
    vidro: '#cfe6ff', vidroEscuro: '#7f9fc4', verde: '#3f6b3a', verdeClaro: '#6fa05a', laranja: '#e07a1f',
    cinza: '#8c8a84', cinzaEscuro: '#3a3936', cinzaClaro: '#c9c7c0'
  };
  const r = (x, cor, px, py, w, h) => { x.fillStyle = cor; x.fillRect(px, py, w || 1, h || 1); };
  function tela(k) { if (!telas[k]) { const c = document.createElement('canvas'); c.width = W; c.height = H; telas[k] = c; } return telas[k]; }

  // A: cartucho dourado com janela de tinta roxa e emblema do pato
  function dourado(x, t) {
    // tampa
    r(x, C.preto, 4, 0, 14, 8); r(x, C.ouro, 5, 1, 12, 6); r(x, C.ouroClaro, 5, 1, 12, 1); r(x, C.ouroEscuro, 5, 6, 12, 1);
    for (let k = 6; k < 16; k += 2) r(x, C.ouroEscuro, k, 2, 1, 4);
    // corpo
    r(x, C.preto, 3, 8, 16, 24); r(x, C.ouro, 4, 9, 14, 22); r(x, C.ouroClaro, 4, 9, 1, 22); r(x, C.ouroEscuro, 17, 9, 1, 22);
    // janela de tinta
    r(x, C.preto, 6, 11, 10, 12); r(x, C.roxoEscuro, 7, 12, 8, 10);
    const nivel = 4 + Math.round(Math.sin(t * 2) * 1);
    r(x, C.roxo, 7, 12 + nivel, 8, 10 - nivel); r(x, C.roxoClaro, 7, 12 + nivel, 8, 1);
    for (let k = 0; k < 3; k++) { const by = 21 - ((t * 8 + k * 4) % 9); if (by > 12 + nivel) r(x, C.roxoClaro, 8 + k * 2, Math.floor(by), 1, 1); }
    r(x, C.branco, 8, 13, 1, 3);
    // emblema do pato
    r(x, C.preto, 7, 24, 8, 6); r(x, C.branco, 8, 25, 6, 4); r(x, C.verde, 10, 25, 3, 3); r(x, C.verdeClaro, 11, 25, 1, 1); r(x, C.laranja, 8, 27, 2, 1);
    // ponteira
    r(x, C.preto, 6, 32, 10, 4); r(x, C.cinza, 7, 32, 8, 3); r(x, C.cinzaClaro, 7, 32, 8, 1);
    r(x, C.preto, 9, 36, 4, 3); r(x, C.cinzaEscuro, 10, 36, 2, 2); r(x, C.preto, 10, 39, 2, 1);
  }

  // B: cartucho de agulha transparente (estilo real de tatuagem) cheio de tinta roxa
  function transparente(x, t) {
    // pegador
    r(x, C.preto, 5, 0, 12, 10); r(x, C.ouro, 6, 1, 10, 8); r(x, C.ouroClaro, 6, 1, 10, 1);
    for (let k = 2; k < 9; k += 2) r(x, C.ouroEscuro, 6, k, 10, 1);
    // corpo de vidro
    r(x, C.preto, 4, 10, 14, 22); r(x, C.vidro, 5, 11, 12, 20); r(x, C.vidroEscuro, 15, 11, 2, 20); r(x, '#ffffff', 6, 12, 1, 14);
    const nivel = 3 + Math.round(Math.sin(t * 2) * 1);
    r(x, C.roxo, 6, 11 + nivel, 9, 20 - nivel); r(x, C.roxoEscuro, 13, 11 + nivel, 2, 20 - nivel); r(x, C.roxoClaro, 6, 11 + nivel, 9, 1);
    for (let k = 0; k < 4; k++) { const by = 29 - ((t * 7 + k * 5) % 15); if (by > 12 + nivel) r(x, C.roxoClaro, 7 + k * 2, Math.floor(by), 1, 1); }
    // anel e ponteira
    r(x, C.preto, 4, 32, 14, 3); r(x, C.ouro, 5, 32, 12, 2);
    r(x, C.preto, 7, 35, 8, 3); r(x, C.cinza, 8, 35, 6, 2);
    r(x, C.preto, 10, 38, 2, 2);
  }

  const ESTILOS = { dourado, transparente };
  DT.CARTUCHO_ESTILOS = Object.keys(ESTILOS);

  // Desenha o cartucho com a base em (cx, base), PX = tamanho do pixel na tela
  DT.desenharCartucho16 = function (ctx, cx, base, estilo, t, PX) {
    PX = PX || 3;
    const c = tela(estilo), x = c.getContext('2d');
    x.clearRect(0, 0, W, H);
    ESTILOS[estilo](x, t);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // brilho mágico pulsando
    ctx.fillStyle = 'rgba(199,155,255,' + (0.22 + Math.sin(t * 5) * 0.1) + ')';
    ctx.beginPath(); ctx.arc(cx, base - H * PX / 2, W * PX * 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(c, cx - W * PX / 2, base - H * PX, W * PX, H * PX);
    // brilhinhos
    for (let k = 0; k < 4; k++) {
      const a = t * 2 + k * Math.PI / 2, rx = cx + Math.cos(a) * W * PX * 0.9, ry = base - H * PX / 2 + Math.sin(a) * H * PX * 0.45;
      ctx.fillStyle = k % 2 ? '#fac775' : '#ffffff'; ctx.fillRect(Math.round(rx), Math.round(ry), PX, PX);
    }
    ctx.restore();
  };
})();
