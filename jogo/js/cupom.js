/* Cupom de desconto: cadastro do jogador (nome + WhatsApp) e a tela do prêmio no fim do jogo.
   Zerou o jogo = 10%. Zerou com todas as fases perfeitas (álbum 6/6 + todas as moedas da fase) = 25%.
   O cupom vale 30 dias, um por pessoa. O botão e o QR Code abrem o WhatsApp do estúdio com a mensagem pronta. */
(function () {
  'use strict';
  const DT = window.DT;
  DT.ZAP_ESTUDIO = '5514991978326'; // WhatsApp do Duck Tattoo: (14) 99197-8326
  const VALIDADE_DIAS = 30;
  const CHAVE = 'duckTattooJogador';

  // ---------- dados do jogador (ficam só no aparelho dele) ----------
  DT.jogador = { nome: '', fone: '' };
  try { const s = JSON.parse(localStorage.getItem(CHAVE) || 'null'); if (s) DT.jogador = s; } catch (_) { /* sem armazenamento: segue sem */ }
  const soDigitos = s => String(s || '').replace(/\D/g, '');
  function mascaraFone(v) {
    const d = soDigitos(v).slice(0, 11);
    if (d.length > 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    if (d.length > 2) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return d;
  }

  // campos de texto de verdade (abrem o teclado do celular), posicionados por cima do canvas
  let campos = null;
  function criarCampos() {
    if (campos) return campos;
    const estilo = 'position:fixed;z-index:3;box-sizing:border-box;font-family:"Press Start 2P",monospace;text-align:center;' +
      'color:#1a1426;background:#f3ead3;border:4px solid #e0a826;outline:none;border-radius:0;padding:0 6px;';
    const nome = document.createElement('input');
    nome.maxLength = 14; nome.autocomplete = 'off'; nome.placeholder = 'SEU NOME'; nome.setAttribute('autocapitalize', 'characters');
    nome.style.cssText = estilo + 'text-transform:uppercase;';
    const fone = document.createElement('input');
    fone.maxLength = 15; fone.autocomplete = 'off'; fone.inputMode = 'tel'; fone.type = 'tel'; fone.placeholder = '(14) 99999-9999';
    fone.style.cssText = estilo;
    fone.addEventListener('input', () => { fone.value = mascaraFone(fone.value); });
    [nome, fone].forEach(i => { i.addEventListener('input', () => { DT.Cadastro.erro = ''; }); document.body.appendChild(i); });
    campos = { nome, fone };
    return campos;
  }
  // posições em coordenadas do jogo (960x540)
  const CAMPO = { nome: { x: 330, y: 150, w: 440, h: 50 }, fone: { x: 330, y: 240, w: 440, h: 50 } };
  const BOTAO_OK = { x: 750, y: 404, w: 180, h: 56 };
  function posicionarCampos() {
    if (!campos) return;
    const r = DT.canvas.getBoundingClientRect(), sx = r.width / DT.L, sy = r.height / DT.A;
    for (const k of ['nome', 'fone']) {
      const c = CAMPO[k], el = campos[k];
      el.style.left = (r.left + c.x * sx) + 'px'; el.style.top = (r.top + c.y * sy) + 'px';
      el.style.width = (c.w * sx) + 'px'; el.style.height = (c.h * sy) + 'px';
      el.style.fontSize = Math.max(10, Math.round(18 * sy)) + 'px'; el.style.borderWidth = Math.max(2, Math.round(4 * sy)) + 'px';
    }
  }
  function mostrarCampos(sim) { if (campos) { campos.nome.style.display = campos.fone.style.display = sim ? 'block' : 'none'; if (!sim) { campos.nome.blur(); campos.fone.blur(); } } }

  /* ---------- Cadastro: "Quem está jogando?" ---------- */
  DT.Cadastro = {
    nome: 'cadastro',
    iniciar() {
      this.t = 0; this.erro = ''; DT.controlesAtivos = false;
      const c = criarCampos();
      c.nome.value = DT.jogador.nome || ''; c.fone.value = mascaraFone(DT.jogador.fone || '');
      mostrarCampos(true); posicionarCampos();
    },
    atualizar(dt) {
      this.t += dt;
      const E = DT.ent, P = DT.ponteiro;
      if (E.pausaP) { mostrarCampos(false); DT.som('clique'); DT.irPara('titulo'); return; }
      const tocouOk = E.cliqueP && P.x > BOTAO_OK.x && P.x < BOTAO_OK.x + BOTAO_OK.w && P.y > BOTAO_OK.y && P.y < BOTAO_OK.y + BOTAO_OK.h;
      if (this.t > 0.3 && (tocouOk || E.okP)) this.confirmar();
    },
    confirmar() {
      const nome = campos.nome.value.trim().toUpperCase().replace(/\s+/g, ' '), fone = soDigitos(campos.fone.value);
      if (nome.length < 2) { this.erro = 'Escreve o seu nome, pelo menos.'; DT.som('clique'); campos.nome.focus(); return; }
      if (fone.length < 10 || fone.length > 11) { this.erro = 'WhatsApp com DDD: (14) 99999-9999'; DT.som('clique'); campos.fone.focus(); return; }
      DT.jogador = { nome, fone };
      try { localStorage.setItem(CHAVE, JSON.stringify(DT.jogador)); } catch (_) { /* sem armazenamento */ }
      mostrarCampos(false); DT.som('checkpoint');
      DT.irPara('historia');
    },
    desenhar(ctx) {
      const T = DT.texto;
      const I = DT.IM.fundo, fw = I.naturalWidth * DT.A / I.naturalHeight, par = (this.t * 20) % fw;
      ctx.drawImage(I, -par, 0, fw, DT.A); ctx.drawImage(I, fw - par, 0, fw, DT.A);
      ctx.fillStyle = 'rgba(16,8,28,0.78)'; ctx.fillRect(0, 0, DT.L, DT.A);
      T(ctx, 'QUEM ESTÁ JOGANDO?', 480, 40, 22, '#e0a826', 'center');
      T(ctx, 'Seus dados aparecem no cupom de desconto', 480, 82, 9, '#f1efe8', 'center', false);
      T(ctx, 'NOME', 310, 168, 10, '#fac775', 'right', false);
      T(ctx, 'WHATSAPP', 310, 258, 10, '#fac775', 'right', false);
      if (this.erro) T(ctx, this.erro, 480, 316, 9, '#ff9a9a', 'center');
      T(ctx, 'Seu telefone fica só neste aparelho. Ele só é enviado se', 480, 340, 7, '#b9acd0', 'center', false);
      T(ctx, 'você tocar em "Enviar no WhatsApp" quando ganhar o cupom.', 480, 354, 7, '#b9acd0', 'center', false);
      const r = DT.spr('retratos', 2); ctx.drawImage(r, 40, 384, r.width * 110 / r.height, 110);
      DT.caixa(ctx, 160, 400, 560, 76, 'rgba(18,12,30,0.95)', '#e0a826');
      T(ctx, 'DUCKZINHO', 176, 412, 8, '#ff5fb0', 'left', false);
      T(ctx, 'Nome e telefone. Escreve direito,', 176, 432, 9, '#f1efe8', 'left', false);
      T(ctx, 'que eu não corrijo.', 176, 450, 9, '#f1efe8', 'left', false);
      const b = BOTAO_OK, pulso = Math.floor(this.t * 2) % 2 === 0;
      DT.caixa(ctx, b.x, b.y, b.w, b.h, pulso ? '#3f6b3a' : '#2a1f3d', '#9fe1cb');
      T(ctx, 'CONFIRMAR', b.x + b.w / 2, b.y + 22, 10, '#9fe1cb', 'center', false);
      T(ctx, (DT.usandoToque ? '' : 'ESC ') + '<< VOLTAR', 20, 516, 8, '#b9acd0', 'left', false);
      posicionarCampos(); // acompanha giro de tela e teclado do celular
    }
  };

  /* ---------- Prêmio (fim do jogo) ---------- */
  const dataBR = d => d.toLocaleDateString('pt-BR');
  function codigo(pct, nome, fone, data) { // código de conferência: muda com o prêmio, o nome, o telefone e a data
    let h = 2166136261;
    for (const ch of 'DUCK' + pct + nome + fone + data + 'INK') { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return 'DT' + pct + '-' + h.toString(36).toUpperCase().padStart(7, '0').slice(-6);
  }
  DT.conferirCupom = codigo; // para conferir no estúdio, se precisar
  function desenharQR(ctx, texto, x, y, tam) {
    if (!window.qrcode) return;
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const q = qrcode(0, 'L'); q.addData(texto); q.make();
    const n = q.getModuleCount(), m = 3, cel = Math.max(1, Math.floor(tam / (n + m * 2))), lado = cel * (n + m * 2);
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, lado, lado); ctx.fillStyle = '#000';
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) ctx.fillRect(x + (k + m) * cel, y + (r + m) * cel, cel, cel);
  }
  const BOTAO_ZAP = { x: 300, y: 474, w: 360, h: 48 };

  DT.Premio = {
    nome: 'premio',
    iniciar() {
      const J = DT.jogo, R = J.resultado || {};
      this.t = 0; DT.controlesAtivos = false;
      const fases = Object.keys(DT.FASES).map(Number);
      this.faltou = [];
      fases.forEach(f => {
        const r = R[f];
        if (!r) { this.faltou.push('Fase ' + f); return; }
        if (r.perfeita) return;
        const p = []; if (r.cartas < 6) p.push('álbum ' + r.cartas + '/6'); if (r.moedas < r.total) p.push('moedas ' + r.moedas + '/' + r.total);
        this.faltou.push('Fase ' + f + ' (' + p.join(', ') + ')');
      });
      this.pct = this.faltou.length === 0 ? 25 : 10;
      const nome = DT.jogador.nome || 'JOGADOR', foneD = soDigitos(DT.jogador.fone), fone = mascaraFone(foneD) || '-';
      const fim = new Date(), val = new Date(fim.getTime() + VALIDADE_DIAS * 86400000);
      this.dados = { nome, fone, fim: dataBR(fim), validade: dataBR(val), cod: codigo(this.pct, nome, foneD, dataBR(fim)) };
      const D = this.dados;
      this.mensagem = 'Olá, Duck Tattoo! Aqui é ' + D.nome + ' (' + D.fone + ').\n' +
        'Zerei o jogo Duck Tattoo – Ink Adventure em ' + D.fim + ' e ganhei ' + this.pct + '% de desconto na minha sessão!\n' +
        'Código: ' + D.cod + '\nVálido até ' + D.validade + ' · Um por pessoa.\nQuero agendar minha tattoo!';
      this.link = 'https://wa.me/' + DT.ZAP_ESTUDIO + '?text=' + encodeURIComponent(this.mensagem);
      // o QR Code é desenhado uma vez só (é pesado para refazer a cada quadro)
      this.qr = document.createElement('canvas'); this.qr.width = this.qr.height = 210;
      desenharQR(this.qr.getContext('2d'), this.link, 0, 0, 210);
      if (window.DuckSom && DuckSom.musicaAtual() !== 'final') DuckSom.pararMusica(); // a música do final continua
      setTimeout(() => DT.som(this.pct === 25 ? 'cupom' : 'vitoria'), 400);
    },
    atualizar(dt) {
      this.t += dt;
      const E = DT.ent, P = DT.ponteiro, b = BOTAO_ZAP;
      const tocouZap = E.cliqueP && P.x > b.x && P.x < b.x + b.w && P.y > b.y && P.y < b.y + b.h;
      if (this.t > 1 && (tocouZap || E.okP)) { DT.som('clique'); window.open(this.link, '_blank'); return; }
      if (this.t > 1 && (E.pausaP || (E.cliqueP && P.y < 60))) { DT.som('clique'); DT.irPara('titulo'); }
    },
    desenhar(ctx) {
      const T = DT.texto, D = this.dados, t = this.t, vinte5 = this.pct === 25;
      const I = DT.IM.fundo, fw = I.naturalWidth * DT.A / I.naturalHeight, par = (t * 20) % fw;
      ctx.drawImage(I, -par, 0, fw, DT.A); ctx.drawImage(I, fw - par, 0, fw, DT.A);
      ctx.fillStyle = 'rgba(16,8,28,0.84)'; ctx.fillRect(0, 0, DT.L, DT.A);
      T(ctx, (vinte5 ? 'PARABÉNS, ' : 'VOCÊ ZEROU, ') + D.nome + '!', 480, 14, D.nome.length > 9 ? 16 : 20, '#e0a826', 'center');
      if (vinte5) T(ctx, 'Todas as fases perfeitas!', 480, 50, 9, '#9fe1cb', 'center', false);
      else T(ctx, 'Faltou para os 25%: ' + this.faltou.join(' · '), 480, 50, this.faltou.join().length > 50 ? 6 : 8, '#ff9a9a', 'center', false);
      // cupom de papel
      ctx.save(); ctx.translate(480, 262);
      DT.caixa(ctx, -410, -180, 820, 360, '#f3ead3', '#e0a826');
      ctx.setLineDash([10, 7]); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(-398, -168, 796, 336); ctx.setLineDash([]);
      DT.desenharLogoSelo(ctx, -318, -82, 56);
      T(ctx, 'CUPOM DE DESCONTO', -220, -150, 10, '#3b6d11', 'left', false);
      T(ctx, this.pct + '% OFF', -220, -124, 34, vinte5 ? '#e24b4a' : '#185fa5', 'left', false);
      T(ctx, 'NA SUA SESSÃO', -220, -76, 9, '#3c3489', 'left', false);
      [['NOME', D.nome], ['TELEFONE', D.fone], ['TERMINOU EM', D.fim], ['VÁLIDO ATÉ', D.validade + ' (' + VALIDADE_DIAS + ' DIAS)'], ['CÓDIGO', D.cod]]
        .forEach(([k, v], i) => { T(ctx, k + ':', -380, i * 24, 8, '#5f5e5a', 'left', false); T(ctx, v, -235, i * 24, 9, '#1a1426', 'left', false); });
      T(ctx, 'UM CUPOM POR PESSOA', -380, 128, 8, '#a32d2d', 'left', false);
      ctx.drawImage(this.qr, 170, -150);
      T(ctx, 'APONTE A CÂMERA', 275, 70, 7, '#3c3489', 'center', false);
      T(ctx, 'abre o WhatsApp do estúdio', 275, 84, 6, '#3c3489', 'center', false);
      ctx.restore();
      // botão do WhatsApp
      const p = 1 + Math.sin(t * 4) * 0.02;
      ctx.save(); ctx.translate(480, BOTAO_ZAP.y + 24); ctx.scale(p, p);
      DT.caixa(ctx, -180, -24, 360, 48, '#25d366', '#0b5c2b');
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-145, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#25d366'; ctx.beginPath(); ctx.arc(-145, 0, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-156, 12); ctx.lineTo(-150, 6); ctx.lineTo(-146, 10); ctx.fill();
      T(ctx, 'ENVIAR NO WHATSAPP', 12, -8, 11, '#ffffff', 'center');
      ctx.restore();
      T(ctx, vinte5 ? 'ou tire um print desta tela e mostre na sua sessão' : 'Faça todas as fases perfeitas e ganhe 25%!', 480, 528, 7, vinte5 ? '#b9acd0' : '#fac775', 'center', false);
      if (t > 1) T(ctx, (DT.usandoToque ? 'TOQUE AQUI' : 'ESC') + ' PARA O TÍTULO', 940, 4, 7, '#b9acd0', 'right', false);
    }
  };
})();
