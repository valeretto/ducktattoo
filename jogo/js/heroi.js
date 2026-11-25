/* Heróis: física, ataques, especiais e troca */
(function () {
  'use strict';
  const DT = window.DT;
  const G = 1800;
  DT.GRAVIDADE = G;
  DT.FILTRO_AZUL = 'hue-rotate(-60deg) saturate(1.8) brightness(1.6)';

  // anims: nome -> [frames, fps, ancora('e' = corpo à esquerda do quadro)]
  DT.HEROIS = {
    emerson: {
      nome: 'EMERSON', vidaMax: 4, w: 40, h: 90, vel: 230, pulo: 730, cd: 0.42, alvo: 100, ref: 4, som: 'emerson',
      anims: { parado: [[4], 1], andar: [[26, 27, 28, 29], 10], pulo: [[38], 1], queda: [[39], 1],
        ataque: [[47], 1, 'e'], especial: [[50], 1, 'e'], dano: [[54], 1], comemorar: [[56, 57, 58, 59, 60, 61, 62], 8] },
      // folha de agachar/deslizar (arte/herois/agachar); ref = quadro em pé usado para acertar a escala
      ag: { folha: 'ag_emerson', inicio: 0, agachado: 1, deslize: [2, 3], levantar: 4, ref: 4, altura: 0.68, esc: 0.8 }
    },
    yasmin: {
      nome: 'YASMIN', vidaMax: 4, w: 36, h: 90, vel: 270, pulo: 750, cd: 0.2, alvo: 104, ref: 0, som: 'yasmin',
      anims: { parado: [[0, 1], 2], andar: [[2, 3, 4, 5], 10], pulo: [[9, 10], 6], queda: [[11], 1],
        ataque: [[17], 1, 'e'], especial: [[18], 1, 'e'], dano: [[22], 1], comemorar: [[29, 30], 4] },
      ag: { folha: 'ag_yasmin', inicio: 0, agachado: 1, deslize: [2, 3], levantar: 4, ref: 4, altura: 0.68, esc: 0.8 }
    },
    gina: {
      nome: 'GINA', vidaMax: 3, w: 54, h: 44, vel: 320, pulo: 790, cd: 0.34, alvo: 60, ref: 0, som: 'gina',
      anims: { parado: [[0, 1, 2, 3, 4, 5, 6], 6], andar: [[7, 8, 9, 10, 11, 12, 13], 14], pulo: [[15, 16], 6], queda: [[17], 1],
        ataque: [[22, 24, 25], 12, 'e'], especial: [[24], 1, 'e'], dano: [[28], 1], comemorar: [[37, 38], 3] },
      ag: { folha: 'ag_gina', inicio: 0, agachado: 4, deslize: [1, 2], levantar: 3, ref: 0, altura: 0.64, esc: 0.95 }
    }
  };
  DT.ORDEM_HEROIS = ['emerson', 'yasmin', 'gina'];

  /* ---------- Física compartilhada ---------- */
  DT.caixaDe = e => ({ x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h });

  DT.mover = function (e, solidos, dt) {
    e.x += e.vx * dt;
    let r = DT.caixaDe(e);
    e.bateuParede = false;
    for (const s of solidos) {
      if (s.tipo !== 'solido' || s.caiu || !DT.sobrepoe(r, s)) continue;
      if (e.x < s.x + s.w / 2) e.x = s.x - e.w / 2 - 0.01; else e.x = s.x + s.w + e.w / 2 + 0.01;
      r = DT.caixaDe(e); e.bateuParede = true;
    }
    const yAnt = e.y;
    e.y += e.vy * dt;
    e.noChao = false; e.chaoObj = null;
    r = DT.caixaDe(e);
    for (const s of solidos) {
      if (s.caiu || !DT.sobrepoe(r, s)) continue;
      if (s.tipo === 'solido') {
        if (e.vy >= 0 && yAnt <= s.y + 1) { e.y = s.y; e.vy = 0; e.noChao = true; e.chaoObj = s; }
        else if (e.vy < 0) { e.y = s.y + s.h + e.h; e.vy = 0; }
      } else if (e.vy >= 0 && yAnt <= s.y + 1) {
        e.y = s.y; e.vy = 0; e.noChao = true; e.chaoObj = s;
      }
      r = DT.caixaDe(e);
    }
  };
  DT.livre = function (caixa, solidos) {
    return !solidos.some(s => s.tipo === 'solido' && !s.caiu && DT.sobrepoe(caixa, s));
  };

  /* ---------- Estado da equipe: vidas e energia são compartilhadas ---------- */
  DT.VIDAS_INICIAIS = 3; DT.VIDAS_MAX = 5; DT.ENERGIA_MAX = 3;

  DT.criarJogador = function (x, y) {
    const j = { x, y, vx: 0, vy: 0, dir: 1, w: 40, h: 90, noChao: false, coyote: 0, buffer: 0, cd: 0,
      inv: 0, estado: '', estadoT: 0, animT: 0, lento: 0, controlavel: true };
    DT.aplicarHeroi(j, DT.jogo.ativo);
    return j;
  };
  DT.aplicarHeroi = function (j, k) {
    const H = DT.HEROIS[k];
    j.heroi = k; j.w = H.w; j.h = H.h;
    j.escala = H.alvo / DT.caixaFrame(k, H.anims.parado[0][0]).h;
    j.refLarg = DT.caixaFrame(k, H.ref).w;
  };

  DT.trocarHeroi = function (j, solidos, forcado) {
    const ordem = DT.ORDEM_HEROIS, ini = ordem.indexOf(DT.jogo.ativo);
    for (let n = 1; n <= ordem.length; n++) {
      const k = ordem[(ini + n) % ordem.length];
      if (k === DT.jogo.ativo) continue;
      const H = DT.HEROIS[k];
      const caixa = { x: j.x - H.w / 2, y: j.y - H.h, w: H.w, h: H.h };
      if (!DT.livre(caixa, solidos)) {
        if (!forcado) { DT.textoFlutuante(j.x, j.y - 110, 'SEM ESPAÇO!', '#ff9a9a', 10); DT.som('clique'); }
        return false;
      }
      DT.jogo.ativo = k; DT.aplicarHeroi(j, k);
      DT.som('troca');
      DT.respingo(j.x, j.y - j.h / 2, '#e0a826', 12, 200);
      DT.textoFlutuante(j.x, j.y - j.h - 30, H.nome, '#e0a826', 10);
      return true;
    }
    if (!forcado) DT.som('clique');
    return false;
  };

  // Cada golpe tira energia; sem energia, a equipe perde uma vida e volta no checkpoint
  /* ---------- Power-ups (8 s cada): invencível, tiro forte, velocidade ---------- */
  DT.PODER_SEG = 8;
  DT.PODERES = {
    invencivel: { frames: [0, 1, 2, 3], aura: 16, cor: '#fac775', nome: 'INVENCÍVEL' },
    forte: { frames: [4, 5, 6, 7], aura: 17, cor: '#ff6a4a', nome: 'TIRO FORTE' },
    rapido: { frames: [8, 9, 10, 11], aura: 18, cor: '#9fe1cb', nome: 'VELOCIDADE' }
  };
  DT.TIPOS_PODER = Object.keys(DT.PODERES);
  DT.poderAtivo = tipo => !!(DT.jogo && DT.jogo.poder && DT.jogo.poder.tipo === tipo && DT.jogo.poder.t > 0);
  DT.pegarPoder = function (tipo, x, y) {
    DT.jogo.poder = { tipo, t: DT.PODER_SEG };
    DT.som('powerup'); DT.respingo(x, y, DT.PODERES[tipo].cor, 16, 240);
    DT.textoFlutuante(x, y - 40, DT.PODERES[tipo].nome + '!', DT.PODERES[tipo].cor, 11);
  };
  // desenho do item (flutuando, com brilho)
  DT.desenharItemPoder = function (ctx, tipo, x, y, t) {
    ctx.fillStyle = 'rgba(255,240,180,' + (0.18 + Math.sin(t * 5) * 0.08) + ')';
    ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill();
    DT.desenharAltura(ctx, 'pw', DT.PODERES[tipo].frames[Math.floor(t * 8) % 4], x, y + 24 + Math.sin(t * 3) * 4, 52, false);
  };
  // patinho dourado secreto (+1 vida)
  DT.pegarPatinho = function (x, y) {
    const J = DT.jogo;
    J.patinhos = J.patinhos || {}; J.patinhos[J.fase] = true;
    if (J.vidas < DT.VIDAS_MAX) { J.vidas++; DT.textoFlutuante(x, y - 40, '+1 VIDA!', '#ff9a9a', 14); }
    else { J.pontos += 1000; DT.textoFlutuante(x, y - 40, '+1000', '#fac775', 14); }
    DT.som('patinho'); DT.respingo(x, y, '#fac775', 24, 280);
    DT.dialogo([{ t: 'Isso é um... eu de borracha? Que ofensa. Toma uma vida e some daqui. Quack.', r: 1 }]);
  };

  DT.ferirJogador = function (j, dano, origemX) {
    if (j.inv > 0 || DT.jogo.acabou || DT.jogo.renascendo > 0 || DT.poderAtivo('invencivel')) return;
    const k = DT.jogo.ativo;
    DT.jogo.energia = Math.max(0, DT.jogo.energia - dano);
    DT.som(k + 'Dano');
    DT.tremer(6, 0.2);
    j.inv = 1.3; j.estado = 'dano'; j.estadoT = 0.3;
    j.vx = (j.x < origemX ? -1 : 1) * 240; j.vy = -320;
    DT.respingo(j.x, j.y - j.h / 2, '#e24b4a', 8);
    if (DT.jogo.energia <= 0) DT.perderVida(j);
  };
  // Coração de energia (fase e chefão)
  DT.pegarCoracao = function (x, y) {
    if (DT.jogo.energia < DT.ENERGIA_MAX) { DT.jogo.energia++; DT.textoFlutuante(x, y - 30, '+1 ENERGIA', '#ff9a9a', 10); }
    else { DT.jogo.pontos += 200; DT.textoFlutuante(x, y - 30, '+200', '#fac775', 10); }
    DT.som('coracao'); DT.respingo(x, y, '#e24b4a', 12, 200);
  };
  DT.perderVida = function (j) {
    DT.jogo.vidas--; DT.jogo.poder = null;
    if (DT.jogo.vidas <= 0) { DT.jogo.vidas = 0; DT.gameOver(); return; }
    DT.jogo.renascendo = 1.3;
    j.controlavel = false; j.estado = 'dano'; j.estadoT = 1.3;
    DT.som('quackBravo'); DT.tremer(8, 0.4);
    DT.textoFlutuante(j.x, j.y - j.h - 30, '-1 VIDA', '#ff9a9a', 16);
  };

  /* ---------- Atualização do jogador ---------- */
  DT.atualizarJogador = function (j, dt, solidos) {
    const E = DT.ent, H = DT.HEROIS[DT.jogo.ativo];
    if (DT.jogo.renascendo > 0) {
      // caído por um instante; depois volta no checkpoint com a energia cheia
      DT.jogo.renascendo -= dt; j.animT += dt;
      j.vx *= 0.9; j.vy = Math.min(j.vy + G * dt, 1100);
      DT.mover(j, solidos, dt);
      if (DT.jogo.renascendo <= 0) {
        DT.jogo.renascendo = 0; DT.jogo.energia = DT.ENERGIA_MAX;
        j.controlavel = true; j.estado = ''; j.estadoT = 0; j.inv = 2; j.vx = 0; j.vy = 0;
        j.agachado = false; j.deslize = 0; j.h = H.h;
        if (DT.cenaAtual.renascer) DT.cenaAtual.renascer();
        DT.som('checkpoint');
      }
      return;
    }
    j.inv = Math.max(0, j.inv - dt); j.cd = Math.max(0, j.cd - dt);
    j.estadoT = Math.max(0, j.estadoT - dt); if (j.estadoT === 0) j.estado = '';
    j.lento = Math.max(0, j.lento - dt);
    j.animT += dt;
    const PJ = DT.jogo.poder;
    if (PJ) { PJ.t -= dt; if (PJ.t <= 0) { DT.jogo.poder = null; DT.som('clique'); } }
    const rapido = DT.poderAtivo('rapido');

    const vel = H.vel * (j.lento > 0 ? 0.5 : 1) * (rapido ? 1.5 : 1);
    if (j.estado !== 'dano' && j.controlavel) {
      const mx = (E.dir ? 1 : 0) - (E.esq ? 1 : 0);
      j.vx = mx * vel;
      if (mx) j.dir = mx;
    } else if (j.estado !== 'dano') j.vx = 0;

    atualizarAgachar(j, dt, solidos, H, vel);

    j.coyote = j.noChao ? 0.1 : Math.max(0, j.coyote - dt);
    j.buffer = (E.puloP && j.controlavel) ? 0.13 : Math.max(0, j.buffer - dt);
    if (j.buffer > 0 && j.coyote > 0) {
      j.vy = -H.pulo * (j.lento > 0 ? 0.8 : 1) * (rapido ? 1.1 : 1); j.buffer = 0; j.coyote = 0; DT.som('pulo');
    }
    if (!E.pulo && j.vy < -200) j.vy *= 0.55;

    j.vy = Math.min(j.vy + G * dt, 1100);
    const estavaNoAr = !j.noChao;
    DT.mover(j, solidos, dt);
    if (j.noChao && estavaNoAr && j.vy === 0) DT.som('pouso');

    if (!j.controlavel) return;
    if (E.trocaP) DT.trocarHeroi(j, solidos, false);
    if (E.atkP && j.cd === 0 && j.estado !== 'dano') atacar(j, H, false);
    if (E.espP && j.estado !== 'dano') {
      if (DT.jogo.tinta >= 0.5) { DT.jogo.tinta -= 0.5; atacar(j, H, true); }
      else { DT.textoFlutuante(j.x, j.y - j.h - 20, 'SEM TINTA!', '#c79bff', 9); DT.som('clique'); }
    }
  };

  /* ---------- Agachar (segurar baixo) e deslizar (baixo enquanto corre) ---------- */
  const DESLIZE = 0.5;
  function cabeEmPe(j, H, solidos) {
    return DT.livre({ x: j.x - j.w / 2, y: j.y - H.h, w: j.w, h: H.h }, solidos);
  }
  function atualizarAgachar(j, dt, solidos, H, vel) {
    const E = DT.ent;
    j.levantar = Math.max(0, (j.levantar || 0) - dt);
    j.agT = (j.agT || 0) + dt;
    const pode = j.controlavel && j.estado !== 'dano' && !DT.jogo.comemorando;
    const quer = pode && E.baixo && j.noChao;

    if (!j.agachado && quer) {
      j.agachado = true; j.agT = 0;
      if (Math.abs(j.vx) > 1) { j.deslize = DESLIZE; DT.som('deslizar'); } // correndo: desliza
    }
    if (j.agachado) {
      const ficar = (quer || (j.deslize > 0 && pode)) && !E.puloP; // um toque no baixo já faz o deslize inteiro
      if (!ficar || !j.noChao) {
        if (cabeEmPe(j, H, solidos)) { j.agachado = false; j.deslize = 0; if (j.noChao) j.levantar = 0.12; }
        else if (E.puloP) j.buffer = 0; // teto baixo: não dá para levantar nem pular
      }
    }
    if (j.agachado) {
      if (j.deslize > 0) {
        j.deslize = Math.max(0, j.deslize - dt);
        j.vx = j.dir * vel * 1.7 * Math.max(0.3, j.deslize / DESLIZE);
        if (Math.random() < 0.5) DT.particulas.push({ x: j.x - j.dir * 20, y: j.y - 6, vx: -j.dir * DT.aleat(40, 120), vy: -DT.aleat(40, 120), vida: 0.3, cor: '#cbbf9e', tam: DT.aleat(3, 6) });
      } else if (pode) {
        // agachado não anda; só se estiver preso embaixo de algo baixo, rasteja devagar
        j.vx = cabeEmPe(j, H, solidos) ? 0 : j.vx * 0.4;
      }
    }
    j.h = j.agachado ? Math.round(H.h * H.ag.altura) : H.h;
  }

  function atacar(j, H, especial) {
    const k = DT.jogo.ativo, d = j.dir;
    const mx = j.x + d * (j.w / 2 + 12), my = j.y - (k === 'gina' ? (j.agachado ? 16 : 26) : j.h * 0.58);
    j.estado = especial ? 'especial' : 'ataque'; j.estadoT = especial ? 0.4 : 0.22; j.animT = 0;
    j.cd = H.cd;
    const P = DT.projeteis;
    if (k === 'emerson') {
      if (especial) { P.push(proj('nanquim', mx, my, d * 470, 0, 30, 5, 1.2, true)); DT.som('emersonEspecial'); DT.tremer(5, 0.25); }
      else { P.push(proj('nanquim', mx, my, d * 540, 0, 12, 2, 0.8, false)); DT.som('emersonAtaque'); }
    } else if (k === 'yasmin') {
      if (especial) {
        [-0.32, -0.16, 0, 0.16, 0.32].forEach(a => P.push(proj('azul', mx, my, d * 620 * Math.cos(a), 620 * Math.sin(a), 13, 2, 0.8, false)));
        DT.som('yasminEspecial');
      } else { P.push(proj('azul', mx, my, d * 660, 0, 10, 1, 0.75, false)); DT.som('yasminAtaque'); }
    } else {
      if (especial) { P.push(proj('latido', mx, my - 10, d * 380, 0, 60, 3, 0.7, true)); DT.som('ginaSuperLatido'); DT.tremer(4, 0.2); }
      else { P.push(proj('latido', mx, my, d * 430, 0, 26, 1, 0.38, true)); DT.som('ginaLatido'); }
    }
  }
  function proj(tipo, x, y, vx, vy, r, dano, vida, perfura) {
    if (DT.poderAtivo('forte')) { r *= 1.6; dano *= 2; } // tiro forte: maior e com o dobro de dano
    return { tipo, x, y, vx, vy, r, dano, vida, vidaMax: vida, perfura, atingidos: [], dono: 'jogador' };
  }

  DT.atualizarProjeteis = function (dt, solidos) {
    DT.projeteis.forEach(p => {
      if (p.gravidade) p.vy += p.gravidade * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt;
      if (p.tipo === 'latido') p.r += 60 * dt;
      if (!p.atravessa && solidos.some(s => s.tipo === 'solido' && !s.caiu && p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + s.h)) {
        p.vida = 0;
        if (p.tipo === 'nanquim') DT.respingo(p.x, p.y, '#1b1b1b', 6, 160);
        if (p.tipo === 'azul') DT.respingo(p.x, p.y, '#2f8fd8', 6, 160);
      }
    });
    DT.projeteis = DT.projeteis.filter(p => p.vida > 0);
  };
  DT.caixaProjetil = p => ({ x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 });

  DT.desenharProjeteis = function (ctx) {
    DT.projeteis.forEach(p => {
      ctx.save();
      if (p.tipo === 'nanquim') {
        ctx.fillStyle = '#e0a826';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0c0c0c';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x - Math.sign(p.vx) * p.r * 1.3, p.y + 2, p.r * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(p.x - p.r * 0.4, p.y - p.r * 0.5, Math.max(2, p.r * 0.3), Math.max(2, p.r * 0.3));
      } else if (p.tipo === 'azul') {
        const s = DT.spr('yasmin', 19, DT.FILTRO_AZUL), h = p.r * 2.4, w = s.width * h / s.height;
        ctx.translate(p.x, p.y); if (p.vx < 0) ctx.scale(-1, 1);
        ctx.drawImage(s, -w / 2, -h / 2, w, h);
      } else if (p.tipo === 'latido') {
        const a = Math.max(0, p.vida / p.vidaMax), d = Math.sign(p.vx);
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const r = p.r * (1 - i * 0.25);
          ctx.globalAlpha = a * (1 - i * 0.25);
          ctx.strokeStyle = '#0b2a4a'; ctx.lineWidth = 8;
          ctx.beginPath(); ctx.arc(p.x - d * i * 14 - d * r, p.y, r, d > 0 ? -0.9 : Math.PI - 0.9, d > 0 ? 0.9 : Math.PI + 0.9); ctx.stroke();
          ctx.strokeStyle = '#58c4ff'; ctx.lineWidth = 4; ctx.stroke();
        }
      } else if (p.tipo === 'roxo') {
        DT.desenharAltura(ctx, 'chefe', DT.CHEFE_FX.tiro, p.x, p.y + p.r, p.r * 2.4, p.vx < 0);
      } else if (p.tipo === 'espinho') {
        const ang = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y); ctx.rotate(ang);
        ctx.fillStyle = '#000'; ctx.fillRect(-12, -3, 22, 6);
        ctx.fillStyle = '#3b6d11'; ctx.fillRect(-11, -2, 16, 4);
        ctx.fillStyle = '#c79bff'; ctx.beginPath(); ctx.moveTo(5, -4); ctx.lineTo(13, 0); ctx.lineTo(5, 4); ctx.fill();
      } else if (p.tipo === 'bomba') {
        DT.desenharAltura(ctx, 'chefe', DT.CHEFE_FX.bomba, p.x, p.y + p.r, p.r * 2.2, false);
      } else if (p.tipo === 'gota') {
        DT.desenharAltura(ctx, 'chefe', DT.CHEFE_FX.gota, p.x, p.y + p.r, p.r * 3, false);
      } else if (p.tipo === 'osso') { // Fase 2: osso girando
        ctx.translate(p.x, p.y); ctx.rotate(p.x * 0.05);
        DT.desenharAltura(ctx, 'chefe2', 38, 0, p.r, p.r * 2, false);
      } else if (p.tipo === 'onda') { // onda de tinta correndo pelo chão
        DT.desenharAltura(ctx, 'chefe2', 40, p.x, p.y + p.r, p.r * 2.2, p.vx < 0);
      } else if (p.tipo === 'ancoraP') { // âncora arremessada
        ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);
        DT.desenharAltura(ctx, 'chefe2', 39, 0, p.r * 1.4, p.r * 1.6, false);
      } else if (p.tipo === 'bala') { // bala de canhão
        DT.desenharAltura(ctx, 'chefe2', 41, p.x, p.y + p.r, p.r * 2.4, p.vx < 0);
      } else if (p.tipo === 'faisca') { // Fase 3: faísca de neon
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#c79bff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.translate(p.x, p.y); ctx.rotate(p.x * 0.08);
        DT.desenharAltura(ctx, 'chefe3', 46, 0, p.r * 1.3, p.r * 2.6, false);
      } else if (p.tipo === 'nuvem') { // nuvem de spray roxa
        const a = Math.min(1, p.vida / p.vidaMax * 1.6);
        for (let i = 0; i < 5; i++) {
          const ox = Math.cos(i * 1.3 + p.vida * 3) * p.r * 0.55, oy = Math.sin(i * 2.1 + p.vida * 2) * p.r * 0.4;
          ctx.globalAlpha = 0.55 * a; ctx.fillStyle = i % 2 ? '#b07cf0' : '#8a3fe0';
          ctx.beginPath(); ctx.arc(p.x + ox, p.y + oy, p.r * (0.55 + (i % 3) * 0.12), 0, Math.PI * 2); ctx.fill();
        }
      } else if (p.tipo === 'polen') { // Fase 4: pólen brilhante caindo
        for (let i = 0; i < 6; i++) {
          const a = i * 1.05 + p.vida * 4, rr = p.r * 0.6;
          ctx.fillStyle = i % 2 ? '#ffd6fa' : '#f6a8ff'; ctx.fillRect(p.x + Math.cos(a) * rr - 3, p.y + Math.sin(a) * rr - 3, 6, 6);
        }
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffd6fa'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (p.tipo === 'bolaTinta' || p.tipo === 'fogoDragao') { // bola de tinta roxa (filhote e dragão)
        ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
        DT.desenharAltura(ctx, 'chefe4', 44, -p.r * 0.8, p.r * 1.1, p.r * 2.2, false);
      } else if (p.tipo === 'fogoDemonio') { // Fase Final: bola de fogo roxo do Demônio
        ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
        DT.desenharAltura(ctx, 'chefe5', 39, -p.r * 0.8, p.r * 1.1, p.r * 2.2, false);
      } else if (p.tipo === 'gotaNanquim') { // Dragão: gota de nanquim da fúria
        DT.desenharAltura(ctx, 'chefe4', 47, p.x, p.y + p.r * 1.2, p.r * 3, false);
      } else if (p.tipo === 'arco') { // Tigre: arco roxo da garrada
        DT.desenharAltura(ctx, 'chefe3', 43, p.x, p.y + p.r * 1.3, p.r * 2.6, p.vx < 0);
      } else if (p.tipo === 'rugido') { // Tigre: onda do rugido correndo pelo chão
        ctx.globalAlpha = Math.min(1, p.vida * 2);
        DT.desenharAltura(ctx, 'chefe3', 44, p.x, p.y + p.r, p.r * 2.2, p.vx < 0);
      }
      ctx.restore();
    });
  };

  /* ---------- Desenho do jogador ---------- */
  DT.desenharJogador = function (ctx, j) {
    if (j.inv > 0 && Math.floor(j.inv * 12) % 2 === 0 && j.estado !== 'dano') return;
    const H = DT.HEROIS[DT.jogo.ativo];
    // aura do power-up (pisca nos 2 últimos segundos, avisando que vai acabar)
    const PJ = DT.jogo.poder;
    if (PJ && !(PJ.t < 2 && Math.floor(PJ.t * 8) % 2)) {
      const P = DT.PODERES[PJ.tipo], meio = j.y - j.h / 2;
      if (PJ.tipo === 'rapido') DT.desenharAltura(ctx, 'pw', 18, j.x - j.dir * 50, meio + 20, 40, j.dir < 0, { alpha: 0.85 });
      else {
        ctx.save(); ctx.translate(j.x, meio); ctx.rotate(j.animT * 3);
        DT.desenharAltura(ctx, 'pw', P.aura, 0, j.h * 0.75, j.h * 1.5, false, { alpha: 0.75 });
        ctx.restore();
      }
    }
    if (!DT.jogo.comemorando && j.estado !== 'dano' && (j.agachado || j.levantar > 0)) {
      const A = H.ag, esc = A.esc * H.alvo / DT.caixaFrame(A.folha, A.ref).h;
      const f = !j.agachado ? A.levantar : j.deslize > 0 ? A.deslize[Math.floor(j.animT * 10) % 2] : j.agT < 0.08 ? A.inicio : A.agachado;
      DT.desenhar(ctx, A.folha, f, j.x, j.y + 2, esc, j.dir < 0);
      return;
    }
    let nome = 'parado';
    if (DT.jogo.comemorando) nome = 'comemorar';
    else if (j.estado) nome = j.estado;
    else if (!j.noChao) nome = j.vy < 0 ? 'pulo' : 'queda';
    else if (Math.abs(j.vx) > 1) nome = 'andar';
    const [frames, fps, ancora] = H.anims[nome];
    const f = frames[Math.floor(j.animT * fps) % frames.length];
    DT.desenhar(ctx, DT.jogo.ativo, f, j.x, j.y + 2, j.escala, j.dir < 0, { ref: ancora === 'e' ? j.refLarg : 0 });
    if (j.lento > 0) {
      ctx.fillStyle = 'rgba(127,63,214,0.7)';
      for (let i = 0; i < 3; i++) ctx.fillRect(j.x - 14 + i * 12, j.y - 6 - ((j.animT * 30 + i * 7) % 14), 5, 5);
    }
  };
})();
