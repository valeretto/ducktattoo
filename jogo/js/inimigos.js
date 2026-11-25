/* Inimigos comuns (Fase 1: estúdio · Fase 2: cemitério) */
(function () {
  'use strict';
  const DT = window.DT;

  // folha: folha de sprites ('inimigos' = Fase 1, 'ini2' = Fase 2)
  // carta: tipo que entra no álbum ao ser apagado (null = não dá carta)
  DT.TIPOS = {
    maquininha: { nome: 'MAQUININHA RAIVOSA', vida: 2, w: 46, h: 60, alt: 72, carta: 'maquininha', icone: 0, morte: 5, dano: 1 },
    frasco: { nome: 'FRASCO BOMBA', vida: 1, w: 34, h: 46, alt: 54, carta: 'frasco', icone: 6, morte: 11, dano: 0 },
    cadeira: { nome: 'CADEIRA VOADORA', vida: 3, w: 56, h: 48, alt: 66, carta: 'cadeira', icone: 12, morte: 17, dano: 1 },
    quadro: { nome: 'CAVEIRA FLASH', vida: 3, w: 80, h: 64, alt: 74, carta: 'caveira', icone: 19, morte: 24, dano: 0 },
    caveira: { nome: 'CAVEIRA', vida: 1, w: 40, h: 34, alt: 50, carta: null, icone: 22, morte: 23, dano: 1 },
    luva: { nome: 'LUVA PEGAJOSA', vida: 2, w: 44, h: 44, alt: 58, carta: 'luva', icone: 25, morte: 30, dano: 1 },
    rosa: { nome: 'ROSA ESPINHOSA', vida: 3, w: 36, h: 58, alt: 66, carta: 'rosa', icone: 31, morte: 36, dano: 1 },
    // Fase 2
    marujo: { folha: 'ini2', nome: 'CAVEIRA MARUJO', vida: 2, w: 40, h: 80, alt: 92, carta: 'marujo', icone: 0, morte: 5, dano: 1 },
    zumbi: { folha: 'ini2', nome: 'ZUMBI TATUADO', vida: 2, w: 40, h: 82, alt: 94, carta: 'zumbi', icone: 6, morte: 11, dano: 1 },
    fantasma: { folha: 'ini2', nome: 'FANTASMA FLASH', vida: 2, w: 50, h: 60, alt: 80, carta: 'fantasma', icone: 12, morte: 17, dano: 1 },
    ancora: { folha: 'ini2', nome: 'ÂNCORA SALTITANTE', vida: 3, w: 56, h: 62, alt: 80, carta: 'ancora', icone: 21, morte: 26, dano: 1 },
    andorinha: { folha: 'ini2', nome: 'ANDORINHA', vida: 1, w: 52, h: 30, alt: 46, carta: 'andorinha', icone: 28, morte: 33, dano: 1 },
    lapide: { folha: 'ini2', nome: 'LÁPIDE MORDEDORA', vida: 3, w: 52, h: 66, alt: 80, carta: 'lapide', icone: 34, morte: 39, dano: 1 },
    // Fase 3
    letreiro: { folha: 'ini3', nome: 'LETREIRO RAIVOSO', vida: 2, w: 70, h: 40, alt: 52, carta: 'letreiro', icone: 0, morte: 5, dano: 1 },
    gato: { folha: 'ini3', nome: 'GATO NEON', vida: 2, w: 56, h: 42, alt: 56, carta: 'gato', icone: 9, morte: 14, dano: 1 },
    dados: { folha: 'ini3', nome: 'DADOS DA SORTE', vida: 2, w: 62, h: 44, alt: 52, carta: 'dados', icone: 16, morte: 21, dano: 1 },
    love: { folha: 'ini3', nome: 'CORAÇÃO LOVE', vida: 2, w: 60, h: 42, alt: 60, carta: 'love', icone: 23, morte: 28, dano: 1 },
    carpa: { folha: 'ini3', nome: 'CARPA NEON', vida: 2, w: 72, h: 34, alt: 54, carta: 'carpa', icone: 31, morte: 36, dano: 1 },
    spray: { folha: 'ini3', nome: 'LATA DE SPRAY', vida: 2, w: 40, h: 64, alt: 72, carta: 'spray', icone: 37, morte: 42, dano: 1 },
    // Fase 4
    cogumelo: { folha: 'ini4', nome: 'COGUMELO SALTADOR', vida: 2, w: 46, h: 54, alt: 64, carta: 'cogumelo', icone: 0, morte: 5, dano: 1 },
    borboleta: { folha: 'ini4', nome: 'BORBOLETA AQUARELA', vida: 1, w: 56, h: 46, alt: 66, carta: 'borboleta', icone: 7, morte: 12, dano: 1 },
    serpente: { folha: 'ini4', nome: 'SERPENTE FLORAL', vida: 2, w: 80, h: 36, alt: 54, carta: 'serpente', icone: 13, morte: 18, dano: 1 },
    coruja: { folha: 'ini4', nome: 'CORUJA OLD SCHOOL', vida: 2, w: 54, h: 50, alt: 70, carta: 'coruja', icone: 19, morte: 24, dano: 1 },
    planta: { folha: 'ini4', nome: 'PLANTA CARNÍVORA', vida: 3, w: 50, h: 70, alt: 78, carta: 'planta', icone: 25, morte: 30, dano: 1 },
    filhote: { folha: 'ini4', nome: 'FILHOTE DE DRAGÃO', vida: 3, w: 60, h: 52, alt: 66, carta: 'filhote', icone: 31, morte: 36, dano: 1 },
    // Fase Final
    gosma: { folha: 'ini5', nome: 'GOSMA DE TINTA', vida: 2, w: 50, h: 44, alt: 56, carta: 'gosma', icone: 0, morte: 5, dano: 1 },
    maotinta: { folha: 'ini5', nome: 'MÃO DE TINTA', vida: 3, w: 50, h: 76, alt: 86, carta: 'maotinta', icone: 7, morte: 10, dano: 1 },
    morcego: { folha: 'ini5', nome: 'CAVEIRA-MORCEGO', vida: 2, w: 64, h: 40, alt: 60, carta: 'morcego', icone: 12, morte: 17, dano: 1 },
    artista: { folha: 'ini5', nome: 'ARTISTA DAS SOMBRAS', vida: 3, w: 44, h: 82, alt: 92, carta: 'artista', icone: 18, morte: 23, dano: 1 },
    aranha: { folha: 'ini5', nome: 'ARANHA DE AGULHA', vida: 2, w: 64, h: 44, alt: 62, carta: 'aranha', icone: 24, morte: 29, dano: 1 },
    frascomau: { folha: 'ini5', nome: 'FRASCO BRAVO', vida: 2, w: 40, h: 62, alt: 72, carta: 'frascomau', icone: 30, morte: 35, dano: 1 }
  };
  DT.CARTAS = ['maquininha', 'frasco', 'cadeira', 'caveira', 'luva', 'rosa'];
  DT.NOME_CARTA = { maquininha: 'MAQUININHA RAIVOSA', frasco: 'FRASCO BOMBA', cadeira: 'CADEIRA VOADORA', caveira: 'CAVEIRA FLASH', luva: 'LUVA PEGAJOSA', rosa: 'ROSA ESPINHOSA',
    marujo: 'CAVEIRA MARUJO', zumbi: 'ZUMBI TATUADO', fantasma: 'FANTASMA FLASH', ancora: 'ÂNCORA SALTITANTE', andorinha: 'ANDORINHA OLD SCHOOL', lapide: 'LÁPIDE MORDEDORA',
    letreiro: 'LETREIRO RAIVOSO', gato: 'GATO NEON', dados: 'DADOS DA SORTE', love: 'CORAÇÃO LOVE', carpa: 'CARPA NEON', spray: 'LATA DE SPRAY',
    cogumelo: 'COGUMELO SALTADOR', borboleta: 'BORBOLETA AQUARELA', serpente: 'SERPENTE FLORAL', coruja: 'CORUJA OLD SCHOOL', planta: 'PLANTA CARNÍVORA', filhote: 'FILHOTE DE DRAGÃO',
    gosma: 'GOSMA DE TINTA', maotinta: 'MÃO DE TINTA', morcego: 'CAVEIRA-MORCEGO', artista: 'ARTISTA DAS SOMBRAS', aranha: 'ARANHA DE AGULHA', frascomau: 'FRASCO BRAVO' };
  // ícone de cada carta: [folha, quadro]
  DT.ICONE_CARTA = { maquininha: ['inimigos', 0], frasco: ['inimigos', 6], cadeira: ['inimigos', 12], caveira: ['inimigos', 22], luva: ['inimigos', 25], rosa: ['inimigos', 31],
    marujo: ['ini2', 0], zumbi: ['ini2', 6], fantasma: ['ini2', 12], ancora: ['ini2', 21], andorinha: ['ini2', 28], lapide: ['ini2', 34],
    letreiro: ['ini3', 0], gato: ['ini3', 9], dados: ['ini3', 16], love: ['ini3', 23], carpa: ['ini3', 31], spray: ['ini3', 37],
    cogumelo: ['ini4', 0], borboleta: ['ini4', 7], serpente: ['ini4', 13], coruja: ['ini4', 19], planta: ['ini4', 25], filhote: ['ini4', 31],
    gosma: ['ini5', 0], maotinta: ['ini5', 7], morcego: ['ini5', 12], artista: ['ini5', 18], aranha: ['ini5', 24], frascomau: ['ini5', 30] };
  const sempreAtivo = ['caveira']; // persegue o jogador mesmo longe

  DT.criarInimigo = function (tipo, x, y) {
    const T = DT.TIPOS[tipo];
    return { tipo, x, y, x0: x, y0: y, w: T.w, h: T.h, vida: T.vida, dir: -1, t: DT.aleat(0, 1), cool: 0,
      estado: '', vx: 0, vy: 0, animT: DT.aleat(0, 2), flash: 0, morrendo: 0, noChao: false };
  };

  function distJog(e, j) { return { dx: j.x - e.x, dy: (j.y - j.h / 2) - (e.y - e.h / 2) }; }

  DT.atualizarInimigos = function (cena, dt) {
    const j = cena.jog, sol = cena.solidos;
    cena.inimigos.forEach(e => {
      e.animT += dt; e.flash = Math.max(0, e.flash - dt);
      if (e.morrendo > 0) { e.morrendo -= dt; if (e.morrendo <= 0) e.remover = true; return; }
      if (Math.abs(e.x - j.x) > 1100 && !sempreAtivo.includes(e.tipo)) return; // longe da tela: dorme
      const { dx, dy } = distJog(e, j);
      e.t -= dt; e.cool -= dt;
      switch (e.tipo) {
        case 'maquininha': {
          if (e.estado === 'dash') {
            e.vx = e.dir * 290;
            if (e.t <= 0) { e.estado = ''; e.cool = 1.6; }
          } else {
            e.vx = e.dir * 55;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || (e.noChao && !temChao)) e.dir *= -1;
            if (Math.abs(dx) < 270 && Math.abs(dy) < 70 && e.cool <= 0) {
              e.dir = Math.sign(dx) || 1; e.estado = 'dash'; e.t = 0.55; DT.som('maquininha');
            }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
        case 'frasco': {
          if (!e.estado && Math.hypot(dx, dy) < 170) { e.estado = 'pavio'; e.t = 1.2; DT.som('frascoPavio'); }
          if (e.estado === 'pavio' && e.t <= 0) {
            DT.som('frascoBum'); DT.tremer(8, 0.3);
            DT.respingo(e.x, e.y - 20, '#8a3fe0', 24, 360);
            if (Math.hypot(dx, dy) < 115) DT.ferirJogador(j, 1, e.x);
            e.explodiu = true; e.morrendo = 0.35; e.estado = 'bum';
          }
          break;
        }
        case 'cadeira': {
          if (e.estado === 'mergulho') {
            const ax = e.alvoX - e.x, ay = e.alvoY - e.y, d = Math.hypot(ax, ay) || 1;
            e.x += ax / d * 330 * dt; e.y += ay / d * 330 * dt;
            if (d < 10 || e.t <= 0) { e.estado = 'voltar'; }
          } else if (e.estado === 'voltar') {
            const ax = e.x0 - e.x, ay = e.y0 - e.y, d = Math.hypot(ax, ay) || 1;
            e.x += ax / d * 180 * dt; e.y += ay / d * 180 * dt;
            if (d < 8) { e.estado = ''; e.cool = 2.2; }
          } else {
            e.x0 += e.dir * 60 * dt;
            if (Math.abs(e.x0 - e.base) > 150) e.dir = Math.sign(e.base - e.x0);
            e.x = e.x0; e.y = e.y0 + Math.sin(e.animT * 2.2) * 22;
            if (Math.abs(dx) < 220 && dy > 40 && e.cool <= 0) {
              e.estado = 'mergulho'; e.alvoX = j.x; e.alvoY = j.y - 10; e.t = 1.1; DT.som('cadeiraAsas');
            }
          }
          if (e.estado) e.dir = Math.sign(dx) || e.dir;
          break;
        }
        case 'quadro': {
          const vivas = cena.inimigos.filter(c => c.tipo === 'caveira' && c.pai === e && !c.morrendo).length;
          if (Math.abs(dx) < 540 && vivas < 2 && e.t <= 0) {
            const c = DT.criarInimigo('caveira', e.x, e.y - 30);
            c.pai = e; cena.inimigos.push(c); e.t = 3.6; e.abrindo = 0.4;
            DT.som('caveiraRacha');
          }
          e.abrindo = Math.max(0, (e.abrindo || 0) - dt);
          break;
        }
        case 'caveira': {
          const d = Math.hypot(dx, dy) || 1;
          e.x += dx / d * 85 * dt; e.y += (dy / d * 85 + Math.sin(e.animT * 5) * 30) * dt;
          e.dir = Math.sign(dx) || e.dir;
          break;
        }
        case 'luva': {
          const noAr = !e.noChao;
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          if (e.noChao) {
            if (noAr && e.pulou) {
              e.vx = 0; e.pulou = false; DT.som('luvaPloc');
              cena.pocas.push({ x: e.x - 40, w: 80, y: e.y, vida: 4.5 });
            }
            e.vx = 0;
            if (e.t <= 0 && Math.abs(dx) < 430) {
              e.dir = Math.sign(dx) || 1; e.vy = -480; e.vx = e.dir * 175; e.pulou = true; e.t = 1.5;
            }
          }
          break;
        }
        case 'rosa': {
          e.dir = Math.sign(dx) || e.dir;
          if (e.estado === 'atirar' && e.t <= 0) e.estado = '';
          if (!e.estado && e.cool <= 0 && Math.abs(dx) < 470) {
            e.estado = 'atirar'; e.t = 0.35; e.cool = 2.4;
            const base = Math.atan2(dy, dx);
            [-0.25, 0, 0.25].forEach(a => DT.projInimigos.push({ tipo: 'espinho', x: e.x, y: e.y - 40,
              vx: Math.cos(base + a) * 270, vy: Math.sin(base + a) * 270, r: 8, vida: 2.2, dano: 1 }));
            DT.som('rosaEspinhos');
          }
          break;
        }

        /* ----- Fase 2 ----- */
        case 'marujo': { // anda e arremessa ossos em arco
          if (e.estado === 'arremesso') {
            e.vx = 0;
            if (e.t <= 0) {
              const T = 0.9, vx = DT.clamp(dx / T, -330, 330);
              DT.projInimigos.push({ tipo: 'osso', x: e.x + e.dir * 20, y: e.y - 70, vx, vy: -430, gravidade: 900, r: 10, vida: 3, dano: 1 });
              DT.som('rosaEspinhos'); e.estado = ''; e.cool = 2.4;
            }
          } else {
            e.vx = e.dir * 60;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || (e.noChao && !temChao)) e.dir *= -1;
            if (Math.abs(dx) < 430 && Math.abs(dy) < 140 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.estado = 'arremesso'; e.t = 0.4; }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
        case 'zumbi': { // lento; caído levanta de novo se não for apagado
          if (e.caido) {
            e.vx = 0;
            if (e.t <= 0) { e.caido = false; e.levantando = 0.7; e.vida = DT.TIPOS.zumbi.vida; DT.som('luvaPloc'); DT.textoFlutuante(e.x, e.y - 110, 'LEVANTOU!', '#9fe1cb', 9); }
          } else if (e.levantando > 0) { e.levantando -= dt; e.vx = 0; }
          else {
            if (Math.abs(dx) < 620) e.dir = Math.sign(dx) || e.dir;
            e.vx = e.dir * 38;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.noChao && !temChao) e.vx = 0;
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
        case 'fantasma': { // some e reaparece perto do jogador; só apanha quando visível
          e.ciclo = (e.ciclo == null ? DT.aleat(0, 2) : e.ciclo) - dt;
          e.susto = Math.max(0, (e.susto || 0) - dt);
          if (e.ciclo <= 0) {
            if (e.intangivel) {
              e.intangivel = false; e.ciclo = 2.8; e.susto = 0.45;
              const lado = Math.random() < 0.5 ? -1 : 1;
              e.x = j.x + lado * 150; e.y = Math.min(DT.CHAO - 40, j.y - 70);
              DT.som('caveiraRacha');
            } else { e.intangivel = true; e.ciclo = 1.6; }
          }
          if (!e.intangivel) {
            const d = Math.hypot(dx, dy) || 1;
            e.x += dx / d * 45 * dt; e.y += (dy / d * 45 + Math.sin(e.animT * 3) * 25) * dt;
          }
          e.dir = Math.sign(dx) || e.dir;
          break;
        }
        case 'ancora': { // pula de lápide em lápide e esmaga
          const noAr = !e.noChao;
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          e.esmagou = Math.max(0, (e.esmagou || 0) - dt);
          if (e.noChao) {
            if (noAr && e.pulou) { e.pulou = false; e.esmagou = 0.3; DT.som('frascoBum'); DT.tremer(4, 0.15); DT.respingo(e.x, e.y, '#8a3fe0', 8, 200); }
            e.vx = 0;
            if (e.estado === 'agachar') { if (e.t <= 0) { e.estado = ''; e.vy = -640; e.vx = e.dir * 175; e.pulou = true; e.t = 1.7; } }
            else if (e.t <= 0 && Math.abs(dx) < 470) { e.dir = Math.sign(dx) || 1; e.estado = 'agachar'; e.t = 0.3; }
          }
          break;
        }
        case 'andorinha': { // voa em bando e dá rasante
          if (e.estado === 'mergulho') {
            const ax = e.alvoX - e.x, ay = e.alvoY - e.y, d = Math.hypot(ax, ay) || 1;
            e.x += ax / d * 380 * dt; e.y += ay / d * 380 * dt; e.dir = Math.sign(ax) || e.dir;
            if (d < 12 || e.t <= 0) e.estado = 'voltar';
          } else if (e.estado === 'voltar') {
            const ay = e.y0 - e.y; e.y += Math.sign(ay) * 220 * dt; e.x += e.dir * 120 * dt;
            if (Math.abs(ay) < 6) { e.estado = ''; e.cool = 2.5; }
          } else {
            e.x += e.dir * 120 * dt;
            if (Math.abs(e.x - e.base) > 280) e.dir = Math.sign(e.base - e.x);
            e.y = e.y0 + Math.sin(e.animT * 3) * 18;
            if (Math.abs(dx) < 170 && dy > 40 && e.cool <= 0) { e.estado = 'mergulho'; e.alvoX = j.x; e.alvoY = j.y - 20; e.t = 1.1; DT.som('cadeiraAsas'); }
          }
          break;
        }
        case 'lapide': { // disfarçada; morde quem passa perto
          if (!e.estado && e.cool <= 0 && Math.abs(dx) < 100 && Math.abs(dy) < 70) { e.estado = 'acordar'; e.t = 0.25; e.dir = Math.sign(dx) || 1; }
          else if (e.estado === 'acordar' && e.t <= 0) { e.estado = 'morder'; e.t = 0.9; DT.som('caveiraRacha'); }
          else if (e.estado === 'morder' && e.t <= 0) { e.estado = ''; e.cool = 1.4; }
          break;
        }

        /* ----- Fase 3 ----- */
        case 'letreiro': { // flutua; apaga (aviso) e solta 3 faíscas na altura do peito: agache!
          if (!e.estado) {
            e.x0 += e.dir * 50 * dt;
            if (Math.abs(e.x0 - e.base) > 120) e.dir = Math.sign(e.base - e.x0);
            if (Math.abs(dx) < 520 && e.cool <= 0) { e.estado = 'apagar'; e.t = 0.7; DT.som('avisoTiro'); }
          } else if (e.estado === 'apagar' && e.t <= 0) {
            e.estado = 'faisca'; e.t = 0.4; e.cool = 2.6;
            const d = Math.sign(dx) || 1, alvoY = j.y - 76; // passa por cima de quem está agachado
            // desce até a altura do peito e segue reto (agachado passa por baixo)
            [-1, 0, 1].forEach(k => DT.projInimigos.push({ tipo: 'faisca', x: e.x - d * k * 26, y: e.y - 18, vx: d * 300,
              vy: Math.sign(alvoY - (e.y - 18)) * 260, alvoY, vida: 2.6, r: 10, dano: 1, atravessa: true,
              aoAtualizar: p => { if ((p.vy > 0 && p.y >= p.alvoY) || (p.vy < 0 && p.y <= p.alvoY)) { p.y = p.alvoY; p.vy = 0; } } }));
            DT.som('rosaEspinhos');
          } else if (e.estado === 'faisca' && e.t <= 0) e.estado = '';
          e.x = e.x0; e.y = e.y0 + Math.sin(e.animT * 2) * 10;
          if (e.estado) e.dir = Math.sign(dx) || e.dir;
          break;
        }
        case 'gato': { // corre de um lado a outro e dá o bote quando chega perto
          const noAr = !e.noChao;
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          if (e.noChao) {
            if (noAr && e.pulou) { e.pulou = false; e.cool = 1.2; }
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || !temChao) e.dir *= -1;
            e.vx = e.dir * 150;
            if (Math.abs(dx) < 240 && Math.abs(dy) < 90 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.vy = -520; e.vx = e.dir * 300; e.pulou = true; DT.som('cadeiraAsas'); }
          }
          break;
        }
        case 'dados': { // rolam até o jogador, param brilhando e explodem
          if (e.estado === 'brilho') {
            e.vx = 0;
            if (e.t <= 0) {
              DT.som('frascoBum'); DT.tremer(8, 0.3);
              DT.respingo(e.x, e.y - 20, '#8a3fe0', 24, 360);
              if (Math.hypot(dx, dy) < 115) DT.ferirJogador(j, 1, e.x);
              e.explodiu = true; e.morrendo = 0.4; e.estado = 'bum';
            }
          } else {
            if (Math.abs(dx) < 600) e.dir = Math.sign(dx) || e.dir;
            e.vx = Math.abs(dx) < 600 ? e.dir * 110 : 0;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.noChao && !temChao) e.vx = 0;
            if (Math.hypot(dx, dy) < 120) { e.estado = 'brilho'; e.t = 0.9; DT.som('frascoPavio'); }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
        case 'love': { // coração com asas: voa e dá investida reta na altura do peito (agache!)
          if (e.estado === 'carga') {
            e.x += e.dir * 360 * dt;
            if (e.t <= 0) { e.estado = 'voltar'; }
          } else if (e.estado === 'mirar') {
            e.y += (e.alvoY - e.y) * Math.min(1, dt * 6);
            if (e.t <= 0) { e.estado = 'carga'; e.t = 1.1; DT.som('cadeiraAsas'); }
          } else if (e.estado === 'voltar') {
            const ay = e.y0 - e.y; e.y += Math.sign(ay) * 150 * dt;
            if (Math.abs(ay) < 5) { e.estado = ''; e.cool = 2.4; e.base = e.x; }
          } else {
            e.x += e.dir * 70 * dt;
            if (Math.abs(e.x - e.base) > 140) e.dir = Math.sign(e.base - e.x);
            e.y = e.y0 + Math.sin(e.animT * 3) * 14;
            if (Math.abs(dx) < 360 && Math.abs(dx) > 90 && e.cool <= 0) {
              e.dir = Math.sign(dx) || 1; e.estado = 'mirar'; e.t = 0.6; e.alvoY = j.y - 66;
            }
          }
          break;
        }
        case 'carpa': { // nada no ar em ondas e morde de repente
          if (e.estado === 'morder') {
            e.x += e.dir * 300 * dt;
            if (e.t <= 0) { e.estado = ''; e.cool = 2; e.x0 = e.x; } // continua nadando de onde parou
          } else {
            e.x0 += e.dir * 55 * dt;
            if (Math.abs(e.x0 - e.base) > 200) e.dir = Math.sign(e.base - e.x0);
            e.x = e.x0; e.y = e.y0 + Math.sin(e.animT * 2.4) * 30;
            if (Math.abs(dx) < 200 && Math.abs(dy) < 90 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.estado = 'morder'; e.t = 0.45; DT.som('caveiraRacha'); }
          }
          break;
        }
        case 'spray': { // anda; chacoalha (aviso) e solta uma nuvem roxa que fica no ar
          if (e.estado === 'chacoalhar') {
            e.vx = 0;
            if (e.t <= 0) {
              e.estado = 'spray'; e.t = 0.5; e.cool = 2.8;
              DT.projInimigos.push({ tipo: 'nuvem', x: e.x + e.dir * 40, y: e.y - 46, vx: e.dir * 150, vy: 0, r: 30, vida: 1.6, vidaMax: 1.6, dano: 1, atravessa: true, persiste: true });
              DT.som('luvaPloc');
            }
          } else if (e.estado === 'spray') { e.vx = 0; if (e.t <= 0) e.estado = ''; }
          else {
            e.vx = e.dir * 50;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || (e.noChao && !temChao)) e.dir *= -1;
            if (Math.abs(dx) < 280 && Math.abs(dy) < 100 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.estado = 'chacoalhar'; e.t = 0.6; DT.som('frascoPavio'); }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }

        /* ----- Fase 4 ----- */
        case 'gosma': // Fase Final: mesmo pulo do cogumelo
        case 'cogumelo': { // agacha e pula na direção do jogador
          const noAr = !e.noChao;
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          e.pousou = Math.max(0, (e.pousou || 0) - dt);
          if (e.noChao) {
            if (noAr && e.pulou) { e.pulou = false; e.pousou = 0.25; DT.som('luvaPloc'); }
            e.vx = 0;
            if (e.estado === 'agachar') { if (e.t <= 0) { e.estado = ''; e.vy = -560; e.vx = e.dir * 160; e.pulou = true; e.t = 1.3; } }
            else if (e.t <= 0 && Math.abs(dx) < 450) { e.dir = Math.sign(dx) || 1; e.estado = 'agachar'; e.t = 0.35; }
          }
          break;
        }
        case 'borboleta': { // voa de um lado a outro e solta pólen em cima do jogador
          e.x0 += e.dir * 70 * dt;
          if (Math.abs(e.x0 - e.base) > 160) e.dir = Math.sign(e.base - e.x0);
          e.x = e.x0; e.y = e.y0 + Math.sin(e.animT * 2.2) * 16;
          if (e.estado === 'polen' && e.t <= 0) e.estado = '';
          if (!e.estado && e.cool <= 0 && Math.abs(dx) < 90 && dy > 30) {
            e.estado = 'polen'; e.t = 0.4; e.cool = 1.8;
            DT.projInimigos.push({ tipo: 'polen', x: e.x, y: e.y - 10, vx: 0, vy: 170, r: 14, vida: 3, dano: 1 });
            DT.som('cadeiraAsas');
          }
          break;
        }
        case 'serpente': { // rasteja; enrola (aviso) e dá o bote rente ao chão: pule!
          if (e.estado === 'enrolar') { e.vx = 0; if (e.t <= 0) { e.estado = 'bote'; e.t = 0.35; DT.som('caveiraRacha'); } }
          else if (e.estado === 'bote') { e.vx = e.dir * 330; if (e.t <= 0) { e.estado = ''; e.cool = 1.6; } }
          else {
            e.vx = e.dir * 45;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || (e.noChao && !temChao)) e.dir *= -1;
            if (Math.abs(dx) < 230 && Math.abs(dy) < 60 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.estado = 'enrolar'; e.t = 0.55; }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
        case 'coruja': { // fica no galho e mergulha quando o jogador passa embaixo
          if (e.estado === 'mergulho') {
            const ax = e.alvoX - e.x, ay = e.alvoY - e.y, d = Math.hypot(ax, ay) || 1;
            e.x += ax / d * 360 * dt; e.y += ay / d * 360 * dt;
            if (d < 10 || e.t <= 0) e.estado = 'voltar';
          } else if (e.estado === 'voltar') {
            const ax = e.x0 - e.x, ay = e.y0 - e.y, d = Math.hypot(ax, ay) || 1;
            e.x += ax / d * 200 * dt; e.y += ay / d * 200 * dt;
            if (d < 8) { e.x = e.x0; e.y = e.y0; e.estado = ''; e.cool = 2.2; }
          } else if (Math.abs(dx) < 230 && dy > 60 && e.cool <= 0) {
            e.estado = 'mergulho'; e.alvoX = j.x; e.alvoY = j.y - 20; e.t = 1.2; DT.som('cadeiraAsas');
          }
          e.dir = Math.sign(dx) || e.dir;
          break;
        }
        case 'maotinta': // Fase Final: poça que vira mão e agarra
        case 'planta': { // disfarçada de rosa; morde quem chega perto
          if (!e.estado && e.cool <= 0 && Math.abs(dx) < 110 && Math.abs(dy) < 80) { e.estado = 'acordar'; e.t = 0.3; e.dir = Math.sign(dx) || 1; }
          else if (e.estado === 'acordar' && e.t <= 0) { e.estado = 'morder'; e.t = 0.9; DT.som('caveiraRacha'); }
          else if (e.estado === 'morder' && e.t <= 0) { e.estado = ''; e.cool = 1.4; }
          break;
        }
        /* ----- Fase Final ----- */
        case 'morcego': { // voa de um lado a outro e cospe tinta mirando no jogador
          e.x0 += e.dir * 80 * dt;
          if (Math.abs(e.x0 - e.base) > 180) e.dir = Math.sign(e.base - e.x0);
          e.x = e.x0; e.y = e.y0 + Math.sin(e.animT * 3) * 16;
          if (e.estado === 'cuspir' && e.t <= 0) e.estado = '';
          if (!e.estado && e.cool <= 0 && Math.abs(dx) < 400) {
            e.estado = 'cuspir'; e.t = 0.4; e.cool = 2.6;
            const d = Math.hypot(dx, dy) || 1;
            DT.projInimigos.push({ tipo: 'bolaTinta', x: e.x, y: e.y, vx: dx / d * 250, vy: dy / d * 250, r: 11, vida: 3, dano: 1 });
            DT.som('rosaEspinhos');
          }
          break;
        }
        case 'artista': { // anda; prepara (aviso) e avança com a máquina-espada
          if (e.estado === 'preparar') { e.vx = 0; if (e.t <= 0) { e.estado = 'golpe'; e.t = 0.45; DT.som('maquininha'); } }
          else if (e.estado === 'golpe') { e.vx = e.dir * 380; if (e.t <= 0 || e.bateuParede) { e.estado = ''; e.cool = 1.8; } }
          else {
            e.vx = e.dir * 55;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || (e.noChao && !temChao)) e.dir *= -1;
            if (Math.abs(dx) < 240 && Math.abs(dy) < 80 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.estado = 'preparar'; e.t = 0.5; DT.som('avisoGiro'); }
          }
          if (e.estado === 'golpe') {
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            if (!sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h)) { e.vx = 0; e.estado = ''; e.cool = 1.8; }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
        case 'aranha': { // pendurada no fio; desce rápido quando o jogador passa embaixo
          if (e.estado === 'descer') { e.y = Math.min(e.alvoY, e.y + 520 * dt); if (e.y >= e.alvoY && e.t <= 0) e.estado = 'subir'; }
          else if (e.estado === 'subir') { e.y = Math.max(e.y0, e.y - 160 * dt); if (e.y <= e.y0) { e.estado = ''; e.cool = 1.5; } }
          else { e.y = e.y0 + Math.sin(e.animT * 2) * 6; if (Math.abs(dx) < 90 && dy > 60 && e.cool <= 0) { e.estado = 'descer'; e.t = 0.8; e.alvoY = Math.min(DT.CHAO - 10, j.y - 20); DT.som('cadeiraAsas'); } }
          break;
        }
        case 'frascomau': { // anda; chacoalha (aviso) e arremessa tinta em arco
          if (e.estado === 'chacoalhar') {
            e.vx = 0;
            if (e.t <= 0) {
              e.estado = 'jogar'; e.t = 0.4; e.cool = 2.6;
              const T2 = 0.9, vx = DT.clamp(dx / T2, -320, 320);
              DT.projInimigos.push({ tipo: 'bolaTinta', x: e.x + e.dir * 16, y: e.y - 60, vx, vy: -420, gravidade: 900, r: 11, vida: 3, dano: 1 });
              DT.som('luvaPloc');
            }
          } else if (e.estado === 'jogar') { e.vx = 0; if (e.t <= 0) e.estado = ''; }
          else {
            e.vx = e.dir * 50;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || (e.noChao && !temChao)) e.dir *= -1;
            if (Math.abs(dx) < 420 && Math.abs(dy) < 140 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.estado = 'chacoalhar'; e.t = 0.5; DT.som('frascoPavio'); }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
        case 'filhote': { // anda; inspira (aviso) e cospe uma bola de tinta baixa: pule!
          if (e.estado === 'inspirar') {
            e.vx = 0;
            if (e.t <= 0) {
              e.estado = 'cuspir'; e.t = 0.4; e.cool = 2.6;
              DT.projInimigos.push({ tipo: 'bolaTinta', x: e.x + e.dir * 36, y: e.y - 30, vx: e.dir * 280, vy: 0, r: 13, vida: 2.6, dano: 1 });
              DT.som('rosaEspinhos');
            }
          } else if (e.estado === 'cuspir') { e.vx = 0; if (e.t <= 0) e.estado = ''; }
          else {
            e.vx = e.dir * 55;
            const frente = { x: e.x + e.dir * (e.w / 2 + 4), y: e.y + 4 };
            const temChao = sol.some(s => !s.caiu && frente.x > s.x && frente.x < s.x + s.w && frente.y > s.y && frente.y < s.y + s.h);
            if (e.bateuParede || (e.noChao && !temChao)) e.dir *= -1;
            if (Math.abs(dx) < 420 && Math.abs(dy) < 90 && e.cool <= 0) { e.dir = Math.sign(dx) || 1; e.estado = 'inspirar'; e.t = 0.6; DT.som('frascoPavio'); }
          }
          e.vy = Math.min(e.vy + DT.GRAVIDADE * dt, 1000);
          DT.mover(e, sol, dt);
          break;
        }
      }
      // contato com o jogador
      const T = DT.TIPOS[e.tipo];
      const semContato = e.caido || e.intangivel || ((e.tipo === 'lapide' || e.tipo === 'planta' || e.tipo === 'maotinta') && e.estado !== 'morder');
      if (!semContato && DT.sobrepoe(DT.caixaDe(e), DT.caixaDe(j))) {
        if (DT.poderAtivo('invencivel')) { if (!e.intangivel) { if (e.tipo === 'zumbi') e.caido = true; apagar(cena, e); } } // invencível apaga quem encostar
        else if (T.dano) DT.ferirJogador(j, T.dano, e.x);
      }
    });
    cena.inimigos = cena.inimigos.filter(e => !e.remover);
  };

  // Projéteis do jogador acertando inimigos
  DT.colisoesProjeteis = function (cena) {
    DT.projeteis.forEach(p => {
      if (p.vida <= 0) return;
      const cp = DT.caixaProjetil(p);
      for (const e of cena.inimigos) {
        if (e.morrendo > 0 || e.intangivel || p.atingidos.includes(e)) continue;
        if (!DT.sobrepoe(cp, DT.caixaDe(e))) continue;
        ferirInimigo(cena, e, p.dano, p);
        if (p.perfura) p.atingidos.push(e); else { p.vida = 0; break; }
      }
    });
  };

  function ferirInimigo(cena, e, dano, p) {
    e.vida -= dano; e.flash = 0.12;
    const cor = p.tipo === 'azul' ? '#2f8fd8' : p.tipo === 'latido' ? '#58c4ff' : '#1b1b1b';
    DT.respingo(e.x, e.y - e.h / 2, cor, 6, 180);
    if (e.tipo === 'frasco' && e.vida <= 0) { // estoura sem ferir ninguém
      DT.som('frascoBum'); DT.respingo(e.x, e.y - 20, '#8a3fe0', 18, 300);
    }
    if (e.tipo === 'zumbi' && e.vida <= 0 && !e.caido) { // cai, mas levanta se não for apagado
      e.caido = true; e.vida = 1; e.t = 3.2; DT.som('luvaPloc');
      DT.textoFlutuante(e.x, e.y - 100, 'TERMINE O SERVIÇO!', '#fac775', 9);
      return;
    }
    if (e.vida <= 0) apagar(cena, e);
  }

  function apagar(cena, e) {
    const T = DT.TIPOS[e.tipo];
    e.morrendo = 0.7; e.estado = 'morte';
    DT.som('apagado');
    DT.respingo(e.x, e.y - e.h / 2, '#8a3fe0', 14, 240);
    DT.jogo.pontos += 100; DT.jogo.tinta = Math.min(1, DT.jogo.tinta + 0.12);
    DT.textoFlutuante(e.x, e.y - e.h - 10, '+100', '#fac775', 10);
    if (e.tipo === 'quadro') cena.inimigos.forEach(c => { if (c.pai === e && !c.morrendo) { c.morrendo = 0.5; DT.respingo(c.x, c.y, '#f1efe8', 6); } });
    if (T.carta && !DT.jogo.cartas.includes(T.carta)) {
      DT.jogo.cartas.push(T.carta);
      DT.som('carta');
      const daFase = DT.faseAtual().cartas.filter(k => DT.jogo.cartas.includes(k)).length;
      DT.mostrarBanner('NOVA CARTA: ' + DT.NOME_CARTA[T.carta], DT.ICONE_CARTA[T.carta], daFase + '/6 NO ÁLBUM');
    }
  }

  DT.atualizarProjInimigos = function (cena, dt) {
    const j = cena.jog;
    DT.projInimigos.forEach(p => {
      if (p.gravidade) p.vy += p.gravidade * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt;
      if (p.aoAtualizar) p.aoAtualizar(p, dt);
      if (p.vida > 0 && p.dano && DT.sobrepoe(DT.caixaProjetil(p), DT.caixaDe(j))) {
        DT.ferirJogador(j, p.dano, p.x);
        if (!p.persiste) p.vida = 0;
      }
      if (!p.atravessa && cena.solidos.some(s => s.tipo === 'solido' && !s.caiu && p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + s.h)) {
        if (p.aoBater) p.aoBater(p); p.vida = 0;
      }
    });
    DT.projInimigos = DT.projInimigos.filter(p => p.vida > 0);
  };

  DT.desenharInimigos = function (ctx, cena) {
    cena.inimigos.forEach(e => {
      const T = DT.TIPOS[e.tipo];
      let f = T.icone, alpha = 1, virar = e.dir < 0;
      const a = e.animT;
      switch (e.tipo) {
        case 'maquininha': f = e.estado === 'dash' ? [3, 4][Math.floor(a * 8) % 2] : [0, 1, 2][Math.floor(a * 6) % 3]; break;
        case 'frasco': f = e.estado === 'pavio' ? [7, 8][Math.floor(a * 10) % 2] : e.estado === 'bum' ? 9 : 6; virar = false; break;
        case 'cadeira': f = e.estado === 'mergulho' ? 15 : [12, 13, 14][Math.floor(a * 8) % 3]; break;
        case 'quadro': f = e.abrindo > 0 ? 21 : e.vida < 3 ? 20 : 19; virar = false; break;
        case 'caveira': f = [22, 23][Math.floor(a * 6) % 2]; break;
        case 'luva': f = !e.noChao ? 26 : 25; break;
        case 'rosa': f = e.estado === 'atirar' ? 34 : [31, 32, 33][Math.floor(a * 3) % 3]; break;
        // Fase 2
        case 'marujo': f = e.estado === 'arremesso' ? 3 : [0, 1, 2, 1][Math.floor(a * 5) % 4]; break;
        case 'zumbi': f = e.caido ? 10 : e.levantando > 0 ? 9 : [6, 7, 8, 7][Math.floor(a * 4) % 4]; break;
        case 'fantasma':
          if (e.intangivel) { f = 14; alpha = 0.28; } else f = e.susto > 0 ? 15 : [12, 13][Math.floor(a * 3) % 2];
          break;
        case 'ancora': f = !e.noChao ? 23 : e.estado === 'agachar' ? 22 : e.esmagou > 0 ? 24 : 21; break;
        case 'andorinha': f = e.estado === 'mergulho' ? 31 : [28, 29, 30][Math.floor(a * 8) % 3]; break;
        case 'lapide': f = e.estado === 'morder' ? [36, 37][Math.floor(a * 8) % 2] : e.estado === 'acordar' ? 35 : 34; break;
        // Fase 3
        case 'letreiro': f = e.estado === 'apagar' ? (Math.floor(a * 12) % 2 ? 2 : 0) : e.estado === 'faisca' ? 3 : [0, 1][Math.floor(a * 4) % 2]; break;
        case 'gato': f = !e.noChao ? 12 : [10, 11][Math.floor(a * 9) % 2]; break;
        case 'dados': f = e.estado === 'brilho' || e.estado === 'bum' ? 19 : Math.abs(e.vx) > 1 ? [16, 17, 18][Math.floor(a * 10) % 3] : 16; virar = false; break;
        case 'love': f = e.estado === 'carga' ? 26 : [23, 24, 25][Math.floor(a * 8) % 3]; break;
        case 'carpa': f = e.estado === 'morder' ? 34 : [31, 32, 33, 32][Math.floor(a * 5) % 4]; break;
        case 'spray': f = e.estado === 'chacoalhar' ? 39 : e.estado === 'spray' ? 40 : Math.abs(e.vx) > 1 ? [37, 38][Math.floor(a * 6) % 2] : 37; break;
        // Fase 4
        case 'cogumelo': f = !e.noChao ? 2 : e.estado === 'agachar' ? 1 : e.pousou > 0 ? 3 : 0; break;
        case 'borboleta': f = e.estado === 'polen' ? 10 : [7, 8, 9][Math.floor(a * 8) % 3]; break;
        case 'serpente': f = e.estado === 'enrolar' ? 15 : e.estado === 'bote' ? 16 : [13, 14][Math.floor(a * 3) % 2]; break;
        case 'coruja': f = e.estado === 'mergulho' ? (Math.hypot(e.alvoX - e.x, e.alvoY - e.y) < 60 ? 22 : 21) : e.estado === 'voltar' ? 20 : 19; break;
        case 'planta': f = e.estado === 'morder' ? [27, 28][Math.floor(a * 8) % 2] : e.estado === 'acordar' ? 26 : 25; break;
        // Fase Final
        case 'gosma': f = !e.noChao ? 1 : e.estado === 'agachar' ? 3 : e.pousou > 0 ? 4 : 0; virar = false; break;
        case 'maotinta': f = e.estado === 'morder' ? [7, 8][Math.floor(a * 8) % 2] : e.estado === 'acordar' ? 6 : 11; break;
        case 'morcego': f = e.estado === 'cuspir' ? 15 : [12, 13, 14][Math.floor(a * 8) % 3]; break;
        case 'artista': f = e.estado === 'preparar' ? 20 : e.estado === 'golpe' ? 21 : Math.abs(e.vx) > 1 ? [18, 19][Math.floor(a * 5) % 2] : 18; break;
        case 'aranha': f = e.estado ? 26 : 26; virar = false; break;
        case 'frascomau': f = e.estado === 'chacoalhar' ? 32 : e.estado === 'jogar' ? 33 : Math.abs(e.vx) > 1 ? [30, 31][Math.floor(a * 5) % 2] : 30; break;
        case 'filhote': f = e.estado === 'inspirar' ? 33 : e.estado === 'cuspir' ? 34 : Math.abs(e.vx) > 1 ? [31, 32][Math.floor(a * 5) % 2] : 31; break;
      }
      if (e.morrendo > 0) {
        if ((e.tipo === 'frasco' || e.tipo === 'dados') && e.explodiu) f = e.tipo === 'dados' ? 21 : 9;
        else if (e.tipo === 'caveira') { f = 22; alpha = e.morrendo / 0.5; }
        else f = T.morte;
        alpha = Math.min(alpha, Math.min(1, e.morrendo / 0.45));
      }
      if (e.tipo === 'aranha' && !e.morrendo) { ctx.strokeStyle = '#c79bff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(e.x, e.y0 - 260); ctx.lineTo(e.x, e.y - e.h); ctx.stroke(); }
      // folha desenhada virada para a direita; inimigos olham para o jogador
      DT.desenharAltura(ctx, T.folha || 'inimigos', f, e.x, e.y + 2, T.alt, virar, { alpha, filtro: e.flash > 0 ? 'brightness(2.6)' : null });
      if ((e.tipo === 'frasco' && e.estado === 'pavio') || (e.tipo === 'dados' && e.estado === 'brilho')) {
        ctx.strokeStyle = '#e24b4a'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.arc(e.x, e.y - 20, 115, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
    });
  };
})();
