/*
 * DUCK TATTOO – INK ADVENTURE
 * Motor de som gerado por código (Web Audio API), estilo chiptune 16 bits.
 * Nenhum arquivo de áudio é necessário.
 *
 * Uso:
 *   DuckSom.sfx.pulo();
 *   DuckSom.tocarMusica('fase1');
 *   DuckSom.setFuria(true);          // acelera a música do chefe
 *   DuckSom.pararMusica();
 *
 * Navegadores só liberam áudio depois de um clique/toque do jogador:
 * chame DuckSom.init() no primeiro clique (ex.: no "PRESS START").
 */
(function (global) {
  'use strict';

  let ctx = null, master, sfxBus, musicBus, noiseBuf = null;

  function init() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.35; musicBus.connect(master);
      Object.keys(EFEITOS).forEach(k => decodificar(EFEITOS[k])); // efeitos em arquivo já baixados
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ---------- Blocos básicos ---------- */

  function ruidoBuffer() {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  function envelope(g, t0, vol, ataque, dur) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(dur, ataque + 0.01));
  }

  // Tom com oscilador. o = { f, f2, dur, onda, vol, ataque, atraso, em, vib:[taxa,prof], filtro:[tipo,freq,q], bus }
  function tom(o) {
    const t0 = (o.em != null ? o.em : ctx.currentTime) + (o.atraso || 0);
    const osc = ctx.createOscillator();
    osc.type = o.onda || 'square';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(o.f2, 1), t0 + o.dur);
    if (o.vib) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = o.vib[0]; lg.gain.value = o.vib[1];
      lfo.connect(lg); lg.connect(osc.frequency);
      lfo.start(t0); lfo.stop(t0 + o.dur + 0.05);
    }
    const g = ctx.createGain();
    envelope(g, t0, o.vol != null ? o.vol : 0.25, o.ataque || 0.005, o.dur);
    osc.connect(g);
    let saida = g;
    if (o.filtro) {
      const f = ctx.createBiquadFilter();
      f.type = o.filtro[0]; f.frequency.value = o.filtro[1]; f.Q.value = o.filtro[2] || 1;
      g.connect(f); saida = f;
    }
    saida.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + o.dur + 0.05);
  }

  // Ruído filtrado. o = { dur, tipo, f, f2, q, vol, ataque, atraso, em, bus }
  function ruido(o) {
    const t0 = (o.em != null ? o.em : ctx.currentTime) + (o.atraso || 0);
    const src = ctx.createBufferSource();
    src.buffer = ruidoBuffer(); src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.tipo || 'lowpass';
    f.frequency.setValueAtTime(o.f || 2000, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    envelope(g, t0, o.vol != null ? o.vol : 0.3, o.ataque || 0.003, o.dur);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
    src.start(t0, Math.random() * 0.5); src.stop(t0 + o.dur + 0.05);
  }

  const SEMI = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  function nf(nota) {
    const m = /^([A-G]#?)(\d)$/.exec(nota);
    return 440 * Math.pow(2, (SEMI[m[1]] + (Number(m[2]) - 4) * 12) / 12);
  }

  // Toca uma sequência [[nota, duração], ...]. nota null = pausa.
  function melodia(lista, opts) {
    let t = (opts && opts.atraso) || 0;
    lista.forEach(([n, d]) => {
      if (n) tom(Object.assign({ onda: 'square', vol: 0.14 }, opts, { f: nf(n), dur: d * 0.95, atraso: t }));
      t += d;
    });
    return t;
  }

  function arpejo(notasLista, passo, opts) {
    return melodia(notasLista.map(n => [n, passo]), opts);
  }

  function quack(o) {
    o = o || {};
    const p = o.tom || 1, dur = o.dur || 0.16, v = o.vol != null ? o.vol : 1, a = o.atraso || 0;
    tom({ onda: 'sawtooth', f: 520 * p, f2: (o.sobe ? 700 : 330) * p, dur, vol: 0.3 * v,
          filtro: ['bandpass', 1100 * p, 3], atraso: a, ataque: 0.01 });
    tom({ onda: 'square', f: 260 * p, f2: (o.sobe ? 330 : 170) * p, dur, vol: 0.08 * v,
          filtro: ['lowpass', 900], atraso: a });
  }

  function latido(atraso, vol) {
    tom({ onda: 'square', f: 720, f2: 300, dur: 0.09, vol: 0.32 * vol, filtro: ['bandpass', 950, 2], atraso });
    ruido({ tipo: 'bandpass', f: 1300, q: 1.5, dur: 0.07, vol: 0.22 * vol, atraso });
  }

  /* ---------- Efeitos sonoros ---------- */

  const sfx = {
    // Heróis – comuns
    pulo() { tom({ f: 280, f2: 720, dur: 0.14, vol: 0.16 }); },
    pouso() { ruido({ f: 500, f2: 80, dur: 0.08, vol: 0.3 }); },
    passo() { ruido({ f: 320, dur: 0.04, vol: 0.12 }); },
    troca() {
      ruido({ tipo: 'bandpass', f: 400, f2: 4000, q: 2, dur: 0.25, vol: 0.3 });
      tom({ onda: 'sine', f: 600, f2: 1200, dur: 0.2, vol: 0.1 });
    },
    comemorar() { arpejo(['C5', 'E5', 'G5', 'C6'], 0.08, { vol: 0.14 }); },

    // Emerson – tinta preta (nanquim)
    emersonAtaque() {
      tom({ onda: 'sawtooth', f: 120, dur: 0.22, vib: [45, 25], vol: 0.22, filtro: ['lowpass', 1200] });
      ruido({ f: 900, f2: 120, dur: 0.2, vol: 0.35, atraso: 0.12 });
    },
    emersonEspecial() {
      tom({ onda: 'sawtooth', f: 90, f2: 140, dur: 0.9, vib: [55, 30], vol: 0.25, filtro: ['lowpass', 1500] });
      tom({ f: 45, dur: 0.9, vol: 0.1 });
      ruido({ f: 1200, f2: 100, dur: 0.5, vol: 0.4, atraso: 0.5 });
    },
    emersonDano() {
      tom({ f: 260, f2: 110, dur: 0.22, vol: 0.2 });
      ruido({ f: 800, dur: 0.08, vol: 0.2 });
    },

    // Yasmin – tinta azul
    yasminAtaque() {
      tom({ f: 1400, f2: 350, dur: 0.1, vol: 0.14 });
      ruido({ tipo: 'highpass', f: 3000, dur: 0.12, vol: 0.15, atraso: 0.06 });
    },
    yasminEspecial() {
      ruido({ tipo: 'bandpass', f: 1800, q: 1.5, dur: 0.8, vol: 0.3, ataque: 0.05 });
      tom({ onda: 'triangle', f: 700, f2: 1100, dur: 0.8, vib: [12, 40], vol: 0.12 });
    },
    yasminDano() { tom({ f: 520, f2: 260, dur: 0.2, vol: 0.18 }); },

    // Gina – latidos
    ginaLatido() { latido(0, 1); },
    ginaSuperLatido() {
      latido(0, 1.2); latido(0.18, 0.55); latido(0.36, 0.25);
      tom({ onda: 'sine', f: 180, f2: 1400, dur: 0.5, vol: 0.2, atraso: 0.05 });
    },
    ginaDano() {
      tom({ onda: 'triangle', f: 900, f2: 1500, dur: 0.12, vol: 0.22 });
      tom({ onda: 'triangle', f: 1400, f2: 700, dur: 0.25, vib: [18, 60], vol: 0.2, atraso: 0.12 });
    },

    // Inimigos
    maquininha() { tom({ onda: 'sawtooth', f: 330, dur: 0.35, vib: [70, 40], vol: 0.2, filtro: ['bandpass', 1500, 2] }); },
    frascoPavio() { ruido({ tipo: 'highpass', f: 5000, dur: 0.7, vol: 0.12 }); },
    frascoBum() {
      ruido({ f: 2500, f2: 60, dur: 0.7, vol: 0.6 });
      tom({ onda: 'sine', f: 140, f2: 35, dur: 0.5, vol: 0.5 });
      ruido({ tipo: 'bandpass', f: 900, dur: 0.25, vol: 0.2, atraso: 0.1 });
    },
    cadeiraAsas() {
      for (let i = 0; i < 3; i++) ruido({ tipo: 'bandpass', f: 500, dur: 0.08, vol: 0.25, atraso: i * 0.14 });
      tom({ onda: 'sawtooth', f: 140, f2: 170, dur: 0.3, vib: [8, 6], vol: 0.08, filtro: ['lowpass', 700], atraso: 0.45 });
    },
    caveiraRacha() {
      for (let i = 0; i < 6; i++) ruido({ tipo: 'highpass', f: 2500, dur: 0.03, vol: 0.25, atraso: i * 0.04 + Math.random() * 0.02 });
      [880, 740, 880, 740, 880].forEach((f, i) => tom({ f, dur: 0.07, vol: 0.1, atraso: 0.3 + i * 0.09 }));
    },
    luvaPloc() {
      tom({ onda: 'sine', f: 700, f2: 140, dur: 0.1, vol: 0.3 });
      ruido({ f: 600, dur: 0.05, vol: 0.1 });
    },
    rosaEspinhos() {
      for (let i = 0; i < 3; i++) {
        tom({ onda: 'sine', f: 2200, f2: 700, dur: 0.09, vol: 0.12, atraso: i * 0.08 });
        ruido({ tipo: 'highpass', f: 4000, dur: 0.06, vol: 0.06, atraso: i * 0.08 });
      }
    },
    apagado() {
      tom({ onda: 'sine', f: 900, f2: 90, dur: 0.4, vol: 0.25 });
      for (let i = 0; i < 3; i++) tom({ onda: 'sine', f: 400 + Math.random() * 400, f2: 1200, dur: 0.05, vol: 0.08, atraso: 0.2 + i * 0.07 });
    },

    // Chefe – Máquina Gigante
    chefeParede() {
      ruido({ f: 3000, f2: 80, dur: 1.2, vol: 0.6 });
      for (let i = 0; i < 7; i++) ruido({ tipo: 'bandpass', f: 300 + Math.random() * 1200, dur: 0.08, vol: 0.3, atraso: Math.random() * 0.9 });
      tom({ onda: 'sine', f: 70, f2: 30, dur: 1, vol: 0.4 });
    },
    chefeRugido() {
      tom({ onda: 'sawtooth', f: 95, f2: 60, dur: 1.0, vib: [25, 15], vol: 0.3, filtro: ['lowpass', 900] });
      ruido({ f: 700, dur: 0.9, vol: 0.2, ataque: 0.05 });
      tom({ f: 48, dur: 1, vol: 0.12 });
    },
    avisoTiro() {
      tom({ f: 200, f2: 1600, dur: 0.6, vol: 0.12 });
      tom({ onda: 'sine', f: 400, f2: 3200, dur: 0.6, vol: 0.06 });
    },
    avisoBomba() { for (let i = 0; i < 3; i++) tom({ f: 1050, dur: 0.08, vol: 0.14, atraso: i * 0.18 }); },
    avisoChuva() { for (let i = 0; i < 6; i++) tom({ onda: 'triangle', f: 2400 - i * 250, dur: 0.1, vol: 0.1, atraso: i * 0.07 }); },
    avisoGiro() {
      ruido({ tipo: 'highpass', f: 2500, dur: 0.6, vol: 0.2, ataque: 0.05 });
      tom({ onda: 'sawtooth', f: 60, dur: 0.6, vib: [30, 10], vol: 0.12, filtro: ['lowpass', 400] });
    },
    chefeFuria() {
      for (let i = 0; i < 3; i++) {
        tom({ onda: 'sine', f: 650, f2: 950, dur: 0.25, vol: 0.15, atraso: i * 0.5 });
        tom({ onda: 'sine', f: 950, f2: 650, dur: 0.25, vol: 0.15, atraso: i * 0.5 + 0.25 });
      }
      tom({ onda: 'sawtooth', f: 50, f2: 220, dur: 1.6, vol: 0.15, filtro: ['lowpass', 1200] });
    },
    chefeDerrota() {
      for (let i = 0; i < 8; i++) {
        const f = 200 + Math.random() * 600;
        tom({ f, f2: f * 0.5, dur: 0.08, vol: 0.15, atraso: i * 0.15 });
        ruido({ tipo: 'bandpass', f: 2000, dur: 0.05, vol: 0.2, atraso: i * 0.15 });
      }
      tom({ onda: 'sine', f: 300, dur: 0.5, vib: [14, 120], vol: 0.12, atraso: 1.2 });
      tom({ onda: 'sawtooth', f: 160, f2: 30, dur: 1.6, vib: [40, 20], vol: 0.2, filtro: ['lowpass', 1000], atraso: 1.4 });
    },

    // Pato guia
    quack() { quack(); },
    quackBravo() { quack({ tom: 0.85 }); quack({ tom: 0.8, atraso: 0.2 }); },
    quackSurpreso() { quack({ tom: 1.35, sobe: true }); },
    quackEnvergonhado() { quack({ tom: 0.9, dur: 0.35, vol: 0.7 }); },

    // Itens e interface
    moeda() {
      tom({ f: 988, dur: 0.07, vol: 0.12 });
      tom({ f: 1319, dur: 0.25, vol: 0.12, atraso: 0.07 });
      quack({ tom: 2, dur: 0.06, vol: 0.35, atraso: 0.12 });
    },
    carta() {
      arpejo(['C6', 'E6', 'G6', 'B6', 'D7'], 0.05, { onda: 'sine', vol: 0.1 });
      tom({ onda: 'triangle', f: 2093, dur: 0.6, vib: [9, 30], vol: 0.05, atraso: 0.25 });
    },
    checkpoint() {
      ['C4', 'E4', 'G4', 'C5'].forEach(n => tom({ onda: 'triangle', f: nf(n), dur: 1, vol: 0.12, ataque: 0.05 }));
    },
    bau() {
      tom({ onda: 'sawtooth', f: 120, f2: 200, dur: 0.35, vib: [10, 8], vol: 0.12, filtro: ['lowpass', 800] });
      arpejo(['G5', 'B5', 'D6', 'G6'], 0.07, { vol: 0.1, atraso: 0.35 });
    },
    clique() { tom({ f: 1500, dur: 0.03, vol: 0.08 }); },
    cupom() {
      const fim = melodia([['C5', 0.12], ['C5', 0.12], ['C5', 0.12], ['G5', 0.36], [null, 0.06], ['E5', 0.12], ['G5', 0.12], ['C6', 0.6]], { vol: 0.13 });
      melodia([['C3', 0.36], ['G3', 0.42], ['C4', fim - 0.78]], { onda: 'triangle', vol: 0.2 });
    },

    // Minijogo – Cliente Impaciente
    tatuando() { tom({ onda: 'sawtooth', f: 140, dur: 0.12, vib: [50, 20], vol: 0.12, filtro: ['lowpass', 1400] }); },
    ai() {
      ruido({ tipo: 'bandpass', f: 1500, dur: 0.1, vol: 0.2 });
      tom({ f: 900, f2: 300, dur: 0.25, vol: 0.16 });
    },
    tictac() {
      tom({ f: 2000, dur: 0.02, vol: 0.08 });
      tom({ f: 1500, dur: 0.02, vol: 0.08, atraso: 0.25 });
    },
    perfeito() { arpejo(['E5', 'G5', 'C6', 'E6', 'G6'], 0.06, { vol: 0.12 }); },

    // Vinhetas
    vitoria() {
      const fim = melodia([['C5', 0.1], ['E5', 0.1], ['G5', 0.1], ['C6', 0.3], ['G5', 0.1], ['C6', 0.7]], { vol: 0.14 });
      melodia([['C3', 0.3], ['G3', 0.3], ['C4', fim - 0.6]], { onda: 'triangle', vol: 0.22 });
    },
    gameOver() {
      melodia([['G4', 0.3], ['F#4', 0.3], ['F4', 0.3]], { onda: 'triangle', vol: 0.2 });
      tom({ onda: 'triangle', f: nf('E4'), dur: 1.0, vib: [6, 8], vol: 0.2, atraso: 0.9 });
      quack({ tom: 0.7, dur: 0.3, atraso: 2.0 });
    },

    // Efeitos que só existem em arquivo (sem arquivo, usam um som de código parecido)
    coracao() { sfx.checkpoint(); },
    powerup() { sfx.carta(); },
    patinho() { sfx.cupom(); },
    deslizar() { sfx.pouso(); },
    explosao() { sfx.frascoBum(); },
    aviso() { sfx.avisoTiro(); },
    chefeEntrada() { sfx.chefeRugido(); },
    tigreRugido() { sfx.chefeRugido(); },
    dragaoSopro() { ruido({ f: 1500, f2: 300, dur: 0.5, vol: 0.3, ataque: 0.05 }); },
    demonioRisada() { sfx.chefeRugido(); }
  };

  /* ---------- Músicas (loop) ---------- */
  // Cada passo = colcheia. "-" segura a nota anterior, "." é pausa, "|" só separa compassos.
  function padrao(s) { return s.trim().split(/\s+/).filter(x => x !== '|'); }

  const MUSICAS = {
    titulo: {
      bpm: 150, ondaLider: 'square',
      lider: padrao('A4 - A4 C5 - A4 D5 - | A4 - A4 C5 - D5 E5 - | G5 - E5 - D5 - C5 - | D5 - C5 - A4 - - -'),
      baixo: padrao('A2 A2 A3 A2 A2 A2 A3 A2 | F2 F2 F3 F2 F2 F2 F3 F2 | G2 G2 G3 G2 G2 G2 G3 G2 | A2 A2 A3 A2 E2 E2 E3 E2'),
      bateria: padrao('k h s h k k s h')
    },
    fase1: {
      bpm: 150, ondaLider: 'square',
      lider: padrao('A4 - C5 - E5 - D5 C5 | B4 - G4 - B4 - C5 D5 | E5 - - - A5 - G5 E5 | D5 - C5 - B4 - G#4 -'),
      baixo: padrao('A2 . A3 . A2 . A3 . | G2 . G3 . G2 . G3 . | F2 . F3 . F2 . F3 . | E2 . E3 . E2 . E3 .'),
      bateria: padrao('k . h . s . h h')
    },
    fase2: { // Cemitério das Caveiras: assombrada, em ré menor
      bpm: 132, ondaLider: 'square',
      lider: padrao('D5 - F5 - A5 - G5 F5 | E5 - C5 - E5 - G5 - | F5 - D5 - A4 - D5 - | C#5 - E5 - A5 - - -'),
      baixo: padrao('D2 . A2 . D3 . A2 . | C2 . G2 . C3 . G2 . | A#1 . F2 . A#2 . F2 . | A1 . E2 . A2 . E2 .'),
      bateria: padrao('k . h . s . h .')
    },
    fase3: { // Cidade Neon: synthwave em mi menor
      bpm: 140, ondaLider: 'sawtooth',
      lider: padrao('E5 - G5 - B5 - A5 G5 | F#5 - D5 - F#5 - A5 - | G5 - E5 - B4 - E5 - | D#5 - F#5 - B5 - - -'),
      baixo: padrao('E2 E3 E2 E3 E2 E3 E2 E3 | D2 D3 D2 D3 D2 D3 D2 D3 | C2 C3 C2 C3 C2 C3 C2 C3 | B1 B2 B1 B2 B1 B2 B1 B2'),
      bateria: padrao('k h s h k k s h')
    },
    fase4: { // Floresta da Tinta: escala pentatônica, clima oriental
      bpm: 120, ondaLider: 'triangle',
      lider: padrao('A4 - C5 - D5 - E5 G5 | E5 - D5 - C5 - A4 - | G4 - A4 - C5 - D5 E5 | D5 - C5 - A4 - - -'),
      baixo: padrao('A2 . E3 . A2 . E3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . D3 . | A2 . E3 . A2 . E3 .'),
      bateria: padrao('k . h . s . h h')
    },
    fase5: { // Reino da Tinta: épica, em dó menor
      bpm: 146, ondaLider: 'square',
      lider: padrao('C5 - D#5 - G5 - G#5 G5 | F5 - D#5 - D5 - C5 - | G#4 - C5 - D#5 - F5 G5 | G5 - F5 - D5 - B4 -'),
      baixo: padrao('C2 C3 C2 C3 C2 C3 C2 C3 | G#1 G#2 G#1 G#2 G#1 G#2 G#1 G#2 | F1 F2 F1 F2 F1 F2 F1 F2 | G1 G2 G1 G2 G1 G2 G1 G2'),
      bateria: padrao('k h s h k k s h')
    },
    minijogo: {
      bpm: 180, ondaLider: 'square',
      lider: padrao('C5 E5 G5 E5 C5 E5 G5 . | D5 F5 A5 F5 D5 F5 A5 . | E5 G5 C6 G5 E5 G5 C6 . | B4 D5 G5 F5 E5 D5 C5 .'),
      baixo: padrao('C3 . G2 . C3 . G2 . | D3 . A2 . D3 . A2 . | C3 . G2 . C3 . G2 . | G2 . B2 . D3 . G2 .'),
      bateria: padrao('k h s h k h s h')
    },
    chefe: {
      bpm: 170, ondaLider: 'sawtooth',
      lider: padrao('E4 E4 G4 E4 A4 E4 G4 F#4 | E4 E4 G4 E4 B4 A4 G4 F#4 | C5 - B4 - A4 - G4 - | F#4 - G4 - A4 - B4 -'),
      baixo: padrao('E2 E2 E3 E2 E2 E2 E3 E2 | E2 E2 E3 E2 E2 E2 E3 E2 | C2 C2 C3 C2 C2 C2 C3 C2 | D2 D2 D3 D2 D2 D2 D3 D2'),
      bateria: padrao('k h s h k k s h')
    }
  };

  let mus = null;
  // Músicas em arquivo (MP3/OGG) substituem a versão gerada por código
  const ARQUIVOS = {};
  let audioEl = null, volMusica = 0.35, mudo = false;
  const volArquivo = () => Math.min(1, volMusica * 1.8);

  function duracaoNota(arr, i) {
    let n = 1;
    while (n < arr.length && arr[(i + n) % arr.length] === '-') n++;
    return n;
  }

  function bateria(tipo, t) {
    if (tipo === 'k') tom({ em: t, onda: 'sine', f: 150, f2: 40, dur: 0.12, vol: 0.5, bus: musicBus });
    else if (tipo === 's') ruido({ em: t, tipo: 'bandpass', f: 1800, q: 0.8, dur: 0.1, vol: 0.35, bus: musicBus });
    else if (tipo === 'h') ruido({ em: t, tipo: 'highpass', f: 7000, dur: 0.03, vol: 0.12, bus: musicBus });
  }

  function agendar() {
    if (!mus || mus.arquivo) return;
    const m = mus.m;
    const passoDur = 60 / (m.bpm * mus.mult) / 2;
    if (mus.prox < ctx.currentTime - 0.2) mus.prox = ctx.currentTime + 0.05; // aba voltou do segundo plano
    while (mus.prox < ctx.currentTime + 0.15) {
      const i = mus.passo % m.lider.length, t = mus.prox;
      const L = m.lider[i];
      if (L !== '-' && L !== '.') {
        tom({ em: t, f: nf(L), dur: passoDur * duracaoNota(m.lider, i) * 0.9, onda: m.ondaLider,
              vol: m.ondaLider === 'sawtooth' ? 0.1 : 0.12, ataque: 0.01, bus: musicBus,
              filtro: m.ondaLider === 'sawtooth' ? ['lowpass', 2500] : null });
      }
      const B = m.baixo[i];
      if (B !== '-' && B !== '.') {
        tom({ em: t, f: nf(B), dur: passoDur * duracaoNota(m.baixo, i) * 0.85, onda: 'triangle', vol: 0.3, ataque: 0.005, bus: musicBus });
      }
      bateria(m.bateria[i % m.bateria.length], t);
      mus.prox += passoDur;
      mus.passo++;
    }
  }

  function tocarMusica(nome) {
    init();
    pararMusica();
    // 'chefe3' sem arquivo nem versão própria usa a música genérica 'chefe'
    if (!ARQUIVOS[nome] && !MUSICAS[nome]) nome = nome.replace(/\d+$/, '');
    if (ARQUIVOS[nome]) {
      audioEl = new Audio(ARQUIVOS[nome]);
      audioEl.loop = true; audioEl.volume = volArquivo(); audioEl.muted = mudo;
      audioEl.play().catch(() => { /* navegador ainda não liberou o som */ });
      mus = { nome, arquivo: true, mult: 1 };
      return;
    }
    const m = MUSICAS[nome];
    if (!m) return;
    mus = { nome, m, passo: 0, prox: ctx.currentTime + 0.06, mult: 1 };
    mus.timer = setInterval(agendar, 25);
    agendar();
  }

  function pararMusica() {
    if (audioEl) { audioEl.pause(); audioEl = null; }
    if (mus) { clearInterval(mus.timer); mus = null; }
  }

  /* ---------- API pública ---------- */

  // Efeitos em arquivo: decodificados uma vez em AudioBuffer (toca sem atraso, inclusive no celular).
  // Sem arquivo (ou ainda carregando) toca a versão de código.
  const EFEITOS = {}; // nome -> { url, vol, buf, bruto, carregando, ultimo }
  function garantirCtx() {
    if (!ctx) { init(); }
    return ctx;
  }
  function decodificar(e) {
    if (e.buf || e.carregando || !e.bruto) return;
    e.carregando = true;
    const copia = e.bruto.slice(0);
    const fim = b => { e.buf = b; e.carregando = false; };
    try {
      const p = garantirCtx().decodeAudioData(copia, fim, () => { e.carregando = false; e.bruto = null; });
      if (p && p.catch) p.catch(() => { e.carregando = false; e.bruto = null; });
    } catch (_) { e.carregando = false; }
  }
  function carregarEfeito(e) {
    fetch(e.url).then(r => r.arrayBuffer()).then(b => { e.bruto = b; if (ctx) decodificar(e); })
      .catch(() => { /* fica com o som de código */ });
  }
  function tocarArquivo(e) {
    const agora = ctx.currentTime;
    if (e.continuo) {
      // som de máquina: um só, em loop, que dura enquanto continuar sendo chamado
      e.ate = agora + 0.3;
      if (e.fonte) return;
      const src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = e.buf; src.loop = true; g.gain.value = e.vol;
      src.connect(g); g.connect(sfxBus); src.start();
      e.fonte = src;
      const vigiar = () => {
        if (ctx.currentTime < e.ate) { setTimeout(vigiar, 80); return; }
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
        src.stop(ctx.currentTime + 0.2); e.fonte = null;
      };
      setTimeout(vigiar, 80);
      return;
    }
    if (e.ultimo != null && agora - e.ultimo < 0.04) return; // evita o mesmo som empilhado no mesmo quadro
    e.ultimo = agora;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = e.buf; g.gain.value = e.vol;
    src.connect(g); g.connect(sfxBus); src.start();
  }

  const sfxPublico = {};
  Object.keys(sfx).forEach(nome => {
    sfxPublico[nome] = function () {
      init();
      const e = EFEITOS[nome];
      if (e) { decodificar(e); if (e.buf) { tocarArquivo(e); return; } }
      sfx[nome]();
    };
  });

  global.DuckSom = {
    init,
    sfx: sfxPublico,
    musicas: Object.keys(MUSICAS),
    tocarMusica,
    pararMusica,
    musicaAtual() { return mus ? mus.nome : null; },
    // Usa um arquivo de áudio para a música "nome" (caminho relativo à página)
    registrarArquivo(nome, url) { ARQUIVOS[nome] = url; },
    // Usa um arquivo de áudio para o efeito "nome" (vol = volume relativo, 1 = original)
    registrarEfeito(nome, url, vol, continuo) {
      if (!sfx[nome]) return;
      const e = EFEITOS[nome] = { url, vol: vol != null ? vol : 1, continuo: !!continuo };
      carregarEfeito(e);
    },
    // quantos efeitos em arquivo já estão prontos (para conferir)
    efeitosProntos() { const k = Object.keys(EFEITOS); return { prontos: k.filter(n => EFEITOS[n].buf).length, total: k.length }; },
    setVelocidadeMusica(mult) { if (mus && !mus.arquivo) mus.mult = mult; },
    // na fúria do chefão a música acelera (a de arquivo, um pouco)
    setFuria(ligada) {
      if (mus && !mus.arquivo) mus.mult = ligada ? 1.25 : 1;
      if (audioEl) { try { audioEl.playbackRate = ligada ? 1.1 : 1; } catch (_) { /* navegador sem suporte */ } }
    },
    setVolumeMusica(v) { init(); volMusica = v; musicBus.gain.value = v; if (audioEl) audioEl.volume = volArquivo(); },
    setVolumeEfeitos(v) { init(); sfxBus.gain.value = v; },
    setMudo(m) { init(); mudo = m; master.gain.value = m ? 0 : 0.8; if (audioEl) audioEl.muted = m; }
  };
})(window);
