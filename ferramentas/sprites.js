/*
 * Ferramenta de recorte de sprites (roda no navegador).
 * Localiza cada desenho numa folha de sprites e recorta com fundo transparente.
 */
(function (global) {
  'use strict';

  function carregar(url) {
    return new Promise((ok, erro) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => erro(new Error('Não carregou: ' + url));
      img.src = url;
    });
  }

  function pixels(img) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    return x.getImageData(0, 0, c.width, c.height);
  }

  // É "conteúdo"? Transparente ou quase branco conta como fundo.
  function ehConteudo(d, i) {
    if (d[i + 3] < 140) return false;
    return !(d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235);
  }

  // Encontra os desenhos da folha. Retorna caixas {x,y,w,h} em ordem de leitura.
  function componentes(img, opt) {
    opt = Object.assign({ escala: 3, juntar: 10, minArea: 400 }, opt);
    const dados = pixels(img), d = dados.data, W = dados.width, H = dados.height;
    const s = opt.escala, w = Math.ceil(W / s), h = Math.ceil(H / s);
    const m = new Uint8Array(w * h);
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
      if (ehConteudo(d, (y * W + x) * 4)) m[(y / s | 0) * w + (x / s | 0)] = 1;
    }
    const vis = new Uint8Array(w * h), caixas = [], fila = new Int32Array(w * h);
    for (let p = 0; p < w * h; p++) {
      if (!m[p] || vis[p]) continue;
      let ini = 0, fim = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
      fila[fim++] = p; vis[p] = 1;
      while (ini < fim) {
        const q = fila[ini++], qx = q % w, qy = (q / w) | 0; n++;
        if (qx < x0) x0 = qx; if (qx > x1) x1 = qx; if (qy < y0) y0 = qy; if (qy > y1) y1 = qy;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = qx + dx, ny = qy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const r = ny * w + nx;
          if (m[r] && !vis[r]) { vis[r] = 1; fila[fim++] = r; }
        }
      }
      caixas.push({ x: x0 * s, y: y0 * s, w: (x1 - x0 + 1) * s, h: (y1 - y0 + 1) * s, n: n * s * s });
    }
    // Junta pedaços próximos (faíscas, respingos) ao desenho principal.
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (let i = 0; i < caixas.length && !mudou; i++) for (let j = i + 1; j < caixas.length; j++) {
        const a = caixas[i], b = caixas[j], g = opt.juntar;
        if (a.x - g < b.x + b.w && b.x - g < a.x + a.w && a.y - g < b.y + b.h && b.y - g < a.y + a.h) {
          const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
          caixas[i] = { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y, n: a.n + b.n };
          caixas.splice(j, 1); mudou = true; break;
        }
      }
    }
    const boas = caixas.filter(c => c.n >= opt.minArea);
    // Ordem de leitura: agrupa por linha (centro vertical) e depois da esquerda para a direita.
    boas.sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2));
    const linhas = [];
    boas.forEach(c => {
      const cy = c.y + c.h / 2, l = linhas.find(L => Math.abs(L.cy - cy) < c.h * 0.4);
      if (l) l.itens.push(c); else linhas.push({ cy, itens: [c] });
    });
    const ordem = [];
    linhas.forEach(l => l.itens.sort((a, b) => a.x - b.x).forEach(c => ordem.push(c)));
    return ordem;
  }

  // Recorta uma caixa como canvas com fundo transparente (remove branco só a partir das bordas).
  function recortar(img, cx, opt) {
    opt = Object.assign({ margem: 2, tirarBranco: true }, opt);
    const x0 = Math.max(0, cx.x - opt.margem), y0 = Math.max(0, cx.y - opt.margem);
    const w = Math.min(img.naturalWidth - x0, cx.w + opt.margem * 2), h = Math.min(img.naturalHeight - y0, cx.h + opt.margem * 2);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, x0, y0, w, h, 0, 0, w, h);
    if (opt.tirarBranco) {
      const dados = x.getImageData(0, 0, w, h), d = dados.data;
      const claro = i => d[i + 3] < 40 || (d[i] > 225 && d[i + 1] > 225 && d[i + 2] > 225);
      const vis = new Uint8Array(w * h), fila = [];
      for (let i = 0; i < w; i++) { fila.push(i, (h - 1) * w + i); }
      for (let j = 0; j < h; j++) { fila.push(j * w, j * w + w - 1); }
      while (fila.length) {
        const p = fila.pop();
        if (vis[p]) continue; vis[p] = 1;
        if (!claro(p * 4)) continue;
        d[p * 4 + 3] = 0;
        const px = p % w, py = (p / w) | 0;
        if (px > 0) fila.push(p - 1); if (px < w - 1) fila.push(p + 1);
        if (py > 0) fila.push(p - w); if (py < h - 1) fila.push(p + w);
      }
      x.putImageData(dados, 0, 0);
    }
    return c;
  }

  global.Sprites = { carregar, componentes, recortar };
})(window);
