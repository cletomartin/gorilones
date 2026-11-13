'use strict';
// Pixel art generado con código: no hace falta ningún archivo de imagen.
// Lienzo base de 320×180; el navegador lo escala sin suavizar.

const Dibujo = (() => {
  const W = 320;
  const H = 180;
  const SUELO = 126;     // borde superior de la acera

  function r(c, col, x, y, w, h) {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function hash(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function hexARgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function mezclar(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    const A = hexARgb(a);
    const B = hexARgb(b);
    const m = A.map((v, i) => Math.round(v + (B[i] - v) * t));
    return `rgb(${m[0]},${m[1]},${m[2]})`;
  }

  function oscurecer(h, f) {
    const [rr, g, b] = hexARgb(h);
    return `rgb(${Math.round(rr * f)},${Math.round(g * f)},${Math.round(b * f)})`;
  }

  // ---------------------------------------------------------------- corredor
  // x: centro; y: suelo (pies). Devuelve la fila superior de la cabeza.
  function corredor(c, ap, x, y, t, o = {}) {
    x = Math.round(x);
    const z = o.z || 0;
    const quieto = !!o.quieto;
    const fy = Math.round(y - z);

    // sombra
    c.fillStyle = 'rgba(0,0,0,0.28)';
    c.fillRect(x - 4, Math.round(y) - 1, 9, 2);

    const fr = quieto ? 0 : Math.floor(t * (o.cadencia || 10) + (o.fase || 0) * 4) % 4;
    // andando: zancada corta y sin rebote
    const amplitud = o.andar ? 1.4 : 2.5;
    const sw = quieto ? 0 : Math.round(amplitud * Math.sin(fr * Math.PI / 2));
    const bote = quieto || o.andar ? 0 : (fr % 2 === 1 ? -1 : 0);
    const lev = o.andar ? 1 : 2;
    const levA = !quieto && fr === 3 ? lev : 0;   // pierna delantera
    const levB = !quieto && fr === 1 ? lev : 0;   // pierna trasera

    const largo = 9 + (ap.altura || 0);
    const cadera = fy - largo + bote;
    const piel = ap.piel;
    const pielOsc = oscurecer(piel, 0.82);
    const colPierna = ap.mallas ? ap.pantalon : piel;
    const colPiernaOsc = ap.mallas ? oscurecer(ap.pantalon, 0.7) : pielOsc;

    function pierna(dx, col, lev) {
      const mitad = cadera + Math.floor(largo / 2);
      r(c, col, x - 1 + Math.round(dx / 2), cadera, 2, mitad - cadera);
      r(c, col, x - 1 + dx, mitad, 2, Math.max(1, fy - 2 - mitad - lev));
      r(c, '#f2f2f2', x - 1 + dx, fy - 3 - lev, 2, 1);
      r(c, ap.zapatillas, x - 1 + dx, fy - 2 - lev, 3, 2);
    }

    const torso = cadera - 12;

    function brazo(bx, manga, oscuro) {
      const m = oscuro ? oscurecer(manga, 0.75) : manga;
      const p = oscuro ? pielOsc : piel;
      const mano = ap.guantes ? (oscuro ? oscurecer(ap.guantes, 0.75) : ap.guantes) : p;
      if (ap.chaqueta) {
        r(c, m, bx, torso + 1, 2, 4);
        r(c, m, bx + 1, torso + 4, 2, 2);
        r(c, mano, bx + 2, torso + 5, 1, 2);
      } else {
        r(c, oscuro ? '#cfccc2' : '#f4f2ea', bx, torso + 1, 2, 2);
        r(c, m, bx, torso + 3, 2, 1);
        r(c, p, bx + 1, torso + 4, 2, 2);
        r(c, p, bx + 2, torso + 5, 1, 2);
      }
    }

    const aw = quieto ? 0 : -sw;
    // brazo trasero (celeste)
    brazo(x - 1 - aw, CELESTE, true);
    // piernas
    pierna(-sw, colPiernaOsc, levB);
    pierna(sw, colPierna, levA);
    // pantalón
    r(c, ap.pantalon, x - 3, cadera - 3, 7, 4);
    if (ap.rayas) r(c, '#f2f2f2', x + 1, cadera - 3, 1, 4);
    // torso: camiseta blanca con el gorila
    r(c, '#f4f2ea', x - 4, torso, 8, 9);
    r(c, '#d6d2c6', x - 4, torso, 1, 9);
    r(c, '#6e7486', x - 3, torso + 1, 6, 1);          // «GORILONES»
    r(c, '#1f2b45', x - 2, torso + 3, 4, 4);          // gorila
    r(c, '#4a7fc0', x - 1, torso + 4, 2, 1);
    r(c, '#1f2b45', x - 3, torso + 4, 1, 2);
    // brazo delantero (naranja)
    brazo(x - 1 + aw, NARANJA, false);

    // cabeza (mira a la derecha)
    const cab = torso - 7;
    r(c, piel, x - 1, torso - 1, 3, 1);               // cuello
    r(c, piel, x - 3, cab, 6, 6);
    r(c, piel, x + 3, cab + 2, 1, 2);                 // nariz
    if (ap.pelo === 'corto') {
      r(c, ap.colorPelo, x - 3, cab - 1, 6, 2);
      r(c, ap.colorPelo, x - 3, cab + 1, 2, 2);
    } else if (ap.pelo === 'rapado') {
      r(c, ap.colorPelo, x - 3, cab, 6, 1);
      r(c, ap.colorPelo, x - 3, cab + 1, 1, 2);
    } else {
      r(c, 'rgba(255,255,255,0.45)', x - 1, cab, 2, 1); // brillo de calva
      r(c, ap.colorPelo, x - 3, cab + 2, 1, 2);
    }
    r(c, pielOsc, x - 1, cab + 2, 1, 2);              // oreja
    r(c, '#1a1a1a', x + 1, cab + 2, 1, 1);            // ojo
    if (ap.gafas) {
      r(c, '#151515', x, cab + 2, 4, 1);
      r(c, '#bfe3f0', x + 1, cab + 2, 1, 1);
      r(c, '#151515', x - 1, cab + 2, 1, 1);
    }
    if (ap.barba) {
      r(c, ap.barba, x - 2, cab + 4, 5, 2);
      r(c, ap.barba, x - 1, cab + 6, 4, 1);
      r(c, ap.barba, x - 2, cab + 3, 1, 1);
      r(c, oscurecer('#c97b6b', 0.9), x + 2, cab + 4, 1, 1); // boca
    } else {
      r(c, '#b8655a', x + 2, cab + 4, 1, 1);
    }
    // abrigo: gorro, braga al cuello
    if (ap.gorro) {
      r(c, ap.gorro, x - 4, cab - 2, 7, 3);
      r(c, oscurecer(ap.gorro, 0.75), x - 4, cab + 1, 7, 1);
      r(c, '#f2f2f2', x - 1, cab - 3, 2, 1);
    }
    if (ap.braga) r(c, ap.braga, x - 2, torso - 1, 5, 2);
    return cab;
  }

  // Cara y hombros para el cuadro de diálogo.
  const auxLienzo = document.createElement('canvas');
  auxLienzo.width = 24;
  auxLienzo.height = 44;
  const aux = auxLienzo.getContext('2d');

  function retrato(c, ap) {
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#26304a';
    c.fillRect(0, 0, 32, 32);
    aux.clearRect(0, 0, 24, 44);
    const cab = corredor(aux, ap, 12, 42, 0, { quieto: true });
    c.drawImage(auxLienzo, 4, cab - 3, 16, 16, 0, 0, 32, 32);
  }

  // ------------------------------------------------------------------ fondo
  const CIELO = [
    [0.0, '#0a0f2c', '#1c2450'],
    [0.45, '#22336a', '#6a4f86'],
    [0.75, '#4f7fc0', '#f5a35c'],
    [1.0, '#8cc4ef', '#ffe2a8'],
  ];

  function colorCielo(p, idx) {
    for (let i = 0; i < CIELO.length - 1; i++) {
      const a = CIELO[i];
      const b = CIELO[i + 1];
      if (p <= b[0]) return mezclar(a[idx], b[idx], (p - a[0]) / (b[0] - a[0]));
    }
    return CIELO[CIELO.length - 1][idx];
  }

  function circulo(c, col, cx, cy, rad) {
    for (let dy = -rad; dy <= rad; dy++) {
      const w = Math.round(Math.sqrt(rad * rad - dy * dy));
      r(c, col, cx - w, cy + dy, w * 2 + 1, 1);
    }
  }

  const TIERRA = new Set(['viaverde', 'campo']);
  const ABIERTO = new Set(['parque', 'viaverde', 'campo']);

  // escDe(xMundo) devuelve el escenario de ese punto del recorrido.
  function fondo(c, p, scroll, escDe) {
    // cielo
    const g = c.createLinearGradient(0, 0, 0, SUELO);
    g.addColorStop(0, colorCielo(p, 1));
    g.addColorStop(1, colorCielo(p, 2));
    c.fillStyle = g;
    c.fillRect(0, 0, W, SUELO);

    // estrellas
    const alfa = Math.max(0, 1 - p * 1.8);
    if (alfa > 0) {
      c.fillStyle = `rgba(255,255,230,${alfa})`;
      for (let i = 0; i < 45; i++) {
        c.fillRect(Math.floor(hash(i) * W), Math.floor(hash(i + 99) * 80), 1, 1);
      }
    }

    // sol
    if (p > 0.5) {
      const sy = 128 - ((p - 0.5) / 0.5) * 75;
      circulo(c, 'rgba(255,214,110,0.25)', 250, sy, 13);
      circulo(c, '#ffd66e', 250, sy, 9);
    }

    // capa lejana (parallax 0.25). Cada hueco de 42 px tiene un punto fijo
    // del recorrido, así que lo lejano se ve venir antes de llegar.
    const off1 = scroll * 0.25;
    const i0 = Math.floor(off1 / 42) - 1;
    for (let i = i0; i < i0 + 10; i++) lejano(c, escDe(i * 168), i, i * 42 - off1, p);

    // capa cercana (parallax 0.6)
    const off2 = scroll * 0.6;
    const j0 = Math.floor(off2 / 64) - 1;
    for (let j = j0; j < j0 + 7; j++) cercano(c, escDe((j * 64) / 0.6), j, j * 64 - off2, p);

    // suelo, por columnas de 16 px
    const o = scroll % 16;
    for (let x = -o; x < W; x += 16) suelo(c, escDe(scroll + x + 8), x, Math.round((scroll + x) / 16), p);
  }

  function ventanas(c, bx, top, w, h, sem, p, colOff) {
    for (let wy = top + 4; wy < top + h - 6; wy += 7) {
      for (let wx = bx + 3; wx < bx + w - 4; wx += 6) {
        const k = Math.floor(wx - bx) * 13 + Math.floor(wy) * 7 + sem * 101;
        r(c, hash(k) > 0.45 + p * 0.7 ? '#ffd96b' : colOff, wx, wy, 3, 4);
      }
    }
  }

  function horizonte(c, i, bx, p, esc) {
    const colCerro = mezclar('#161c30', '#9c9a7a', p);
    for (let k = 0; k < 42; k += 3) {
      const wx = i * 42 + k;
      const hh = 7 + Math.round(5 * Math.sin(wx * 0.03) + 3 * Math.sin(wx * 0.011));
      r(c, colCerro, bx + k, SUELO - 14 - hh, 3, hh);
    }
    const colCampo = esc === 'parque' ? mezclar('#12241a', '#5f8f45', p) : mezclar('#1c2016', '#b9a46a', p);
    r(c, colCampo, bx, SUELO - 14, 42, 14);
    if (esc === 'campo') {
      // viñas en hileras
      const v = mezclar('#1a2a14', '#5d7a32', p);
      for (let y = SUELO - 12; y < SUELO; y += 4) {
        for (let x = (y / 4) % 2 ? 1 : 3; x < 42; x += 5) r(c, v, bx + x, y, 2, 1);
      }
    } else if (esc === 'parque') {
      const a = mezclar('#0e1d14', '#2f6a35', p);
      for (let k = 0; k < 3; k++) {
        if (hash(i * 3 + k) < 0.35) continue;
        const x = bx + 4 + k * 13;
        circulo(c, a, x, SUELO - 18, 6);
      }
    } else if (hash(i + 400) < 0.3) {
      // algún olivo suelto a lo lejos
      r(c, mezclar('#141a12', '#6c7a4e', p), bx + 18, SUELO - 19, 7, 4);
    }
  }

  function lejano(c, esc, i, bx, p) {
    if (ABIERTO.has(esc)) return horizonte(c, i, bx, p, esc);

    if (esc === 'barrio') {
      if (hash(i + 13) < 0.5) {
        // chabola de chapa
        const w = 26 + Math.floor(hash(i) * 10);
        const h = 13 + Math.floor(hash(i + 50) * 6);
        const top = SUELO - h;
        const cols = ['#8a4a2a', '#7a8088', '#4f6f8f', '#9a6a3a'];
        for (let k = 0; k < w; k += 6) r(c, mezclar('#1e2028', cols[(i + k / 6) % 4], p), bx + k, top, Math.min(6, w - k), h);
        r(c, mezclar('#2a2c34', '#9a9c98', p), bx - 2, top - 2, w + 4, 2);
        if (hash(i * 3) > 0.35 + p * 0.6) r(c, '#ffcf5a', bx + 5, top + 4, 4, 3);
      } else {
        // casa de ladrillo sin enlucir con varillas
        const w = 30 + Math.floor(hash(i) * 8);
        const h = 20 + Math.floor(hash(i + 50) * 10);
        const top = SUELO - h;
        r(c, mezclar('#2e2224', '#a8583a', p), bx, top, w, h);
        for (let y = top + 3; y < SUELO; y += 3) r(c, mezclar('#241a1c', '#8a4630', p), bx, y, w, 1);
        for (let k = 3; k < w; k += 9) r(c, mezclar('#2a1a14', '#6b3a22', p), bx + k, top - 4, 1, 4);
        ventanas(c, bx, top, w, h, i, p, mezclar('#1d2236', '#8a96a8', p));
      }
      return;
    }

    if (esc === 'poblachuela') {
      const w = 30;
      const h = 15;
      const top = SUELO - h;
      const tejado = mezclar('#341c18', '#b4583c', p);
      for (let k = 0; k < 7; k++) r(c, tejado, bx - 1 + k * 2, top - 1 - k, w + 2 - k * 4, 1);
      r(c, mezclar('#2a2a38', '#efe4c8', p), bx, top, w, h);
      r(c, hash(i * 7) > 0.4 + p * 0.6 ? '#ffd96b' : mezclar('#1d2236', '#7f9ab0', p), bx + 5, top + 4, 5, 5);
      r(c, mezclar('#1b1b22', '#7a5434', p), bx + 18, top + 5, 5, 10);
      r(c, mezclar('#0f1d12', '#4c7a3a', p), bx - 3, SUELO - 5, w + 8, 5);
      return;
    }

    if (esc === 'cementerio') {
      const cip = mezclar('#0b1810', '#2c5236', p);
      for (const dx of [7, 27]) {
        if (hash(i * 5 + dx) < 0.25) continue;
        const h = 26 + Math.floor(hash(i + dx) * 10);
        r(c, cip, bx + dx, SUELO - h, 5, h);
        r(c, cip, bx + dx + 1, SUELO - h - 3, 3, 3);
        r(c, cip, bx + dx + 2, SUELO - h - 5, 1, 2);
      }
      const tapia = mezclar('#30344a', '#e6e1d3', p);
      if (i % 5 === 0) {
        // capilla
        r(c, tapia, bx + 14, SUELO - 30, 14, 30);
        r(c, mezclar('#4a2a22', '#a4573e', p), bx + 13, SUELO - 32, 16, 2);
        r(c, mezclar('#40434f', '#7a7466', p), bx + 20, SUELO - 40, 2, 8);
        r(c, mezclar('#40434f', '#7a7466', p), bx + 18, SUELO - 37, 6, 2);
      }
      r(c, tapia, bx, SUELO - 14, 42, 14);
      r(c, mezclar('#22252f', '#bdb6a6', p), bx, SUELO - 15, 42, 1);
      return;
    }

    if (esc === 'universidad') {
      const w = 40;
      const h = 34 + Math.floor(hash(i + 70) * 14);
      const top = SUELO - h;
      r(c, mezclar('#2a2c3c', '#c9a98a', p), bx, top, w, h);
      for (let y = top + 4; y < SUELO - 6; y += 7) {
        r(c, mezclar('#1d2a44', '#7fb3d9', p), bx + 2, y, w - 4, 3);
        if (hash(i * 11 + y) > 0.5 + p * 0.6) r(c, '#ffd96b', bx + 2 + Math.floor(hash(y + i) * 28), y, 8, 3);
      }
      return;
    }

    if (esc === 'estacion') {
      // naves bajas y la vía elevada con catenaria
      if (hash(i + 31) < 0.6) {
        const h = 16 + Math.floor(hash(i) * 10);
        r(c, mezclar('#22252f', '#a9a49a', p), bx + 2, SUELO - h, 36, h);
        r(c, mezclar('#2a2c34', '#8a8d94', p), bx + 1, SUELO - h - 2, 38, 2);
      }
      r(c, mezclar('#2a2a30', '#8f8a80', p), bx, SUELO - 42, 42, 4);
      r(c, mezclar('#3a3c44', '#7a7c80', p), bx + 18, SUELO - 38, 3, 38);
      r(c, '#55585f', bx + 19, SUELO - 58, 1, 16);
      r(c, '#55585f', bx, SUELO - 55, 42, 1);
      return;
    }

    if (esc === 'gofit') {
      const top = SUELO - 30;
      r(c, mezclar('#2d3142', '#eef1f4', p), bx, top, 42, 30);
      r(c, '#1fa3d6', bx, top + 4, 42, 3);
      r(c, mezclar('#1d2a44', '#86c3e6', p), bx + 2, top + 11, 38, 14);
      if (p < 0.8) r(c, 'rgba(255,230,140,0.35)', bx + 2, top + 11, 38, 14);
      return;
    }

    // ciudad
    const w = 30 + Math.floor(hash(i) * 12);
    const h = 38 + Math.floor(hash(i + 50) * 55);
    const top = SUELO - h;
    r(c, mezclar('#141a33', '#7b7f96', p), bx, top, w, h);
    ventanas(c, bx, top, w, h, i, p, mezclar('#1d2442', '#9ea3b8', p));
  }

  function arbol(c, bx, p) {
    const verde = mezclar('#12291b', '#3f7a3a', p);
    const claro = mezclar('#1b3a26', '#5c9a4c', p);
    r(c, mezclar('#2d2018', '#5b3d2a', p), bx + 5, 96, 3, 30);
    r(c, verde, bx, 80, 13, 16);
    r(c, verde, bx + 2, 75, 9, 5);
    r(c, claro, bx + 3, 78, 4, 3);
    r(c, claro, bx + 8, 84, 3, 2);
  }

  function farola(c, bx, p) {
    const on = p < 0.75;
    if (on) {
      circulo(c, 'rgba(255,196,90,0.16)', bx + 11, 90, 9);
      circulo(c, 'rgba(255,210,110,0.28)', bx + 11, 90, 5);
    }
    r(c, '#2a2d36', bx + 6, 88, 2, SUELO - 88);
    r(c, '#2a2d36', bx + 6, 88, 7, 1);
    r(c, on ? '#ffe08a' : '#77797f', bx + 10, 89, 3, 2);
  }

  function cipres(c, bx, p) {
    const v = mezclar('#0b1810', '#2c5236', p);
    r(c, v, bx + 3, SUELO - 40, 7, 40);
    r(c, v, bx + 4, SUELO - 46, 5, 6);
    r(c, v, bx + 5, SUELO - 50, 3, 4);
    r(c, mezclar('#13261a', '#3d6c48', p), bx + 5, SUELO - 38, 2, 30);
  }

  function olivo(c, bx, p) {
    r(c, mezclar('#2a2219', '#5b4632', p), bx + 6, SUELO - 12, 3, 12);
    r(c, mezclar('#2a2219', '#5b4632', p), bx + 4, SUELO - 14, 2, 3);
    const hoja = mezclar('#1a2418', '#7d8b5a', p);
    r(c, hoja, bx, SUELO - 22, 16, 8);
    r(c, hoja, bx + 2, SUELO - 25, 11, 3);
    r(c, mezclar('#243022', '#9aa676', p), bx + 3, SUELO - 21, 4, 2);
  }

  function pino(c, bx, p) {
    r(c, mezclar('#2d2018', '#5b3d2a', p), bx + 6, SUELO - 30, 2, 30);
    const v = mezclar('#0f2216', '#2f5e36', p);
    r(c, v, bx, SUELO - 40, 14, 6);
    r(c, v, bx + 2, SUELO - 44, 10, 4);
  }

  function valla(c, bx, p) {
    const m = mezclar('#2a2016', '#8a6a44', p);
    r(c, m, bx, SUELO - 9, 64, 1);
    r(c, m, bx, SUELO - 5, 64, 1);
    for (let k = 0; k < 64; k += 16) r(c, m, bx + k, SUELO - 11, 2, 11);
  }

  function banco(c, bx, p) {
    const m = mezclar('#2a2016', '#8a5a34', p);
    r(c, m, bx + 2, SUELO - 7, 14, 2);
    r(c, m, bx + 2, SUELO - 10, 14, 1);
    r(c, '#33363d', bx + 3, SUELO - 5, 1, 5);
    r(c, '#33363d', bx + 14, SUELO - 5, 1, 5);
  }

  function cercano(c, esc, j, bx, p) {
    const h = hash(j + 7);
    switch (esc) {
      case 'cementerio':
        if (h < 0.6) cipres(c, bx, p); else if (h < 0.85) farola(c, bx, p);
        break;
      case 'parque':
        if (h < 0.65) arbol(c, bx, p); else if (h < 0.85) banco(c, bx, p); else farola(c, bx, p);
        break;
      case 'viaverde':
        valla(c, bx, p);
        if (h < 0.3) pino(c, bx + 20, p);
        break;
      case 'campo':
        if (h < 0.55) olivo(c, bx, p);
        break;
      case 'poblachuela':
        if (h < 0.4) farola(c, bx, p); else if (h < 0.7) arbol(c, bx, p);
        break;
      default:
        if (h < 0.45) arbol(c, bx, p); else if (h < 0.8) farola(c, bx, p);
    }
  }

  function suelo(c, esc, x, col, p) {
    if (TIERRA.has(esc) || esc === 'parque') {
      const camino = esc === 'parque' ? mezclar('#3d3626', '#d9c38c', p) : mezclar('#3a3328', '#c2a878', p);
      r(c, camino, x, SUELO, 16, 28);
      const piedra = mezclar('#2c271e', '#9c8660', p);
      if (hash(col) < 0.6) r(c, piedra, x + Math.floor(hash(col + 1) * 14), SUELO + 3 + Math.floor(hash(col + 2) * 22), 2, 1);
      if (hash(col + 9) < 0.4) r(c, piedra, x + Math.floor(hash(col + 3) * 14), SUELO + 3 + Math.floor(hash(col + 4) * 22), 1, 1);
      r(c, mezclar('#16220f', '#6f8a3e', p), x, SUELO + 28, 16, H - SUELO - 28);
      r(c, mezclar('#1d2c14', '#86a24c', p), x, SUELO + 28, 16, 2);
      if (hash(col + 5) < 0.5) r(c, mezclar('#1d2c14', '#86a24c', p), x + 5, SUELO + 34, 1, 3);
      return;
    }
    // acera y calzada
    r(c, mezclar('#353843', '#aaa59b', p), x, SUELO, 16, 28);
    const junta = mezclar('#2b2d36', '#928d84', p);
    r(c, junta, x, SUELO, 1, 28);
    r(c, junta, x, SUELO + 9, 16, 1);
    r(c, junta, x, SUELO + 18, 16, 1);
    r(c, mezclar('#5a5d68', '#d6d1c4', p), x, SUELO + 28, 16, 2);
    r(c, mezclar('#1b1d25', '#4b4d56', p), x, SUELO + 30, 16, H - SUELO - 30);
    if (col % 2 === 0) r(c, mezclar('#8a8a70', '#f2f0e0', p), x + 2, 168, 12, 1);
  }

  function cartel(c, x, texto) {
    const escribir = textoPixel;
    const w = medirTexto(texto) + 8;
    const x0 = Math.round(x - w / 2);
    r(c, '#5b4632', x0 + 3, 92, 2, SUELO - 92);
    r(c, '#5b4632', x0 + w - 5, 92, 2, SUELO - 92);
    r(c, '#f1f1f1', x0, 81, w, 12);
    r(c, '#2c6e49', x0 + 1, 82, w - 2, 10);
    escribir(c, texto, x0 + w / 2, 83, '#ffffff');
  }

  // ------------------------------------------------------------ elementos
  function charco(c, x, p, barro) {
    const agua = barro ? mezclar('#2a2016', '#7a5a36', p) : mezclar('#24486e', '#4e86b8', p);
    const brillo = barro ? mezclar('#3a2e20', '#a68456', p) : mezclar('#5d84a8', '#cfe6f7', p);
    r(c, agua, x - 7, 140, 14, 3);
    r(c, agua, x - 5, 139, 10, 5);
    r(c, brillo, x - 3, 140, 3, 1);
  }

  // Obstáculos: bache (agujero en el suelo), bordillo (escalón que cruza
  // la acera) y piedra (en los caminos de tierra).
  function obstaculo(c, tipo, x, p, tierra) {
    x = Math.round(x);
    if (tipo === 'charco') return charco(c, x, p, tierra);
    if (tipo === 'bache') {
      const fondo = tierra ? mezclar('#1e1810', '#5a4630', p) : mezclar('#15161c', '#3a3a40', p);
      const borde = tierra ? mezclar('#3a3020', '#8a7048', p) : mezclar('#2a2c34', '#7a776e', p);
      r(c, borde, x - 7, 139, 14, 6);
      r(c, fondo, x - 6, 140, 12, 4);
      r(c, fondo, x - 4, 139, 7, 1);
      r(c, mezclar('#0c0c10', '#24242a', p), x - 4, 141, 8, 2);
      if (!tierra) {
        r(c, borde, x + 7, 138, 3, 1);
        r(c, borde, x - 9, 144, 3, 1);
      }
      return;
    }
    if (tipo === 'bordillo') {
      // escalón que cruza toda la acera (como al bajar a un paso de peatones)
      const cara = mezclar('#5a5d68', '#d6d1c4', p);
      const sombra = mezclar('#24262e', '#8a857a', p);
      for (let y = SUELO; y < SUELO + 28; y++) {
        const dx = Math.round((y - SUELO) * 0.25);
        r(c, mezclar('#6a6d78', '#ece8dc', p), x - 3 - dx, y, 1, 1);
        r(c, cara, x - 2 - dx, y, 4, 1);
        r(c, sombra, x + 2 - dx, y, 2, 1);
      }
      r(c, cara, x - 9, SUELO + 28, 9, 2);
      return;
    }
    if (tipo === 'piedra') {
      const pi = mezclar('#3a3a40', '#9a978c', p);
      r(c, pi, x - 4, 139, 8, 5);
      r(c, pi, x - 3, 137, 6, 2);
      r(c, mezclar('#4a4a50', '#c9c6ba', p), x - 2, 137, 3, 1);
      r(c, mezclar('#24242a', '#6a675e', p), x - 4, 143, 8, 1);
    }
  }

  // Donde se esconde Emiliano en la parada técnica.
  function matorral(c, x, p) {
    x = Math.round(x);
    const v = mezclar('#12241a', '#4f7a38', p);
    const v2 = mezclar('#1a3022', '#6a9a48', p);
    circulo(c, v, x - 8, SUELO - 7, 8);
    circulo(c, v, x + 7, SUELO - 8, 9);
    circulo(c, v, x, SUELO - 13, 9);
    r(c, v2, x - 4, SUELO - 18, 4, 2);
    r(c, v2, x + 6, SUELO - 14, 3, 2);
    r(c, v, x - 16, SUELO - 2, 33, 2);
  }

  function contenedor(c, x, p) {
    x = Math.round(x);
    const verde = mezclar('#14301f', '#2e7d4f', p);
    r(c, verde, x - 12, SUELO - 20, 24, 18);
    r(c, mezclar('#0e2216', '#226040', p), x - 13, SUELO - 22, 26, 3);
    r(c, mezclar('#0e2216', '#226040', p), x - 12, SUELO - 13, 24, 1);
    circulo(c, '#1a1a1e', x - 8, SUELO - 1, 2);
    circulo(c, '#1a1a1e', x + 8, SUELO - 1, 2);
  }

  function perro(c, x, y, t) {
    x = Math.round(x);
    const f = Math.floor(t * 14) % 2;
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.fillRect(x - 5, y - 1, 11, 2);
    r(c, '#8a5a2b', x - 4, y - 7, 9, 4);
    r(c, '#8a5a2b', x + 4, y - 10, 4, 4);
    r(c, '#5e3b1a', x + 4, y - 11, 2, 2);
    r(c, '#111', x + 6, y - 9, 1, 1);
    r(c, '#111', x + 8, y - 8, 1, 1);
    r(c, '#8a5a2b', x - 6, y - 9 + f, 2, 1);
    r(c, '#6f461f', x - 4 + f, y - 3, 1, 3);
    r(c, '#6f461f', x - 1 - f, y - 3, 1, 3);
    r(c, '#6f461f', x + 2 + f, y - 3, 1, 3);
    r(c, '#6f461f', x + 4 - f, y - 3, 1, 3);
  }

  function stop(c, x) {
    r(c, '#6b6e75', x, 98, 1, SUELO - 98);
    r(c, '#c62828', x - 3, 88, 7, 9);
    r(c, '#c62828', x - 4, 90, 9, 5);
    r(c, '#ffffff', x - 2, 92, 5, 1);
  }

  function semaforo(c, x, rojo) {
    r(c, '#2e3038', x, 94, 2, SUELO - 94);
    r(c, '#1e1f24', x - 2, 80, 6, 14);
    r(c, rojo ? '#ff3b3b' : '#4a1515', x - 1, 82, 4, 3);
    r(c, '#4a3a10', x - 1, 86, 4, 3);
    r(c, rojo ? '#123d1a' : '#3dff6e', x - 1, 90, 4, 3);
  }

  function senalCuesta(c, x) {
    r(c, '#6b6e75', x, 100, 1, SUELO - 100);
    r(c, '#d32f2f', x - 6, 90, 13, 11);
    r(c, '#ffffff', x - 5, 91, 11, 9);
    for (let i = 0; i < 8; i++) r(c, '#111', x - 4 + i, 98 - (i >> 1), 1, 1 + (i >> 1));
  }

  function hormiga(c, x, y) {
    // la mascota del cartel
    r(c, '#2a1a10', x, y + 2, 3, 3);
    r(c, '#2a1a10', x + 3, y + 3, 2, 2);
    r(c, '#2a1a10', x + 5, y + 2, 3, 3);
    r(c, '#2a1a10', x + 7, y, 1, 2);
    r(c, '#2a1a10', x + 1, y + 5, 1, 2);
    r(c, '#2a1a10', x + 4, y + 5, 1, 2);
    r(c, '#2a1a10', x + 6, y + 5, 1, 2);
  }

  function fachada(c, x0) {
    x0 = Math.round(x0);
    const top = 38;
    const w = 130;
    r(c, '#a85a32', x0, top, w, SUELO - top);
    for (let y = top + 3; y < SUELO; y += 5) {
      const d = ((y - top) / 5) % 2 ? 0 : 5;
      r(c, '#8f4a28', x0, y, w, 1);
      for (let x = x0 + d; x < x0 + w; x += 10) r(c, '#8f4a28', x, y - 4, 1, 4);
    }
    // cartel
    r(c, '#e9c46a', x0 + 6, top + 6, w - 12, 20);
    r(c, '#1e5a3a', x0 + 7, top + 7, w - 14, 18);
    texto(c, 'LA HORMIGA', x0 + w / 2, top + 9, '#ffd166', 2, '#0d2e1c');
    hormiga(c, x0 + w / 2 - 4, top - 1);
    // toldo
    const ty = top + 36;
    for (let x = 0; x < w; x += 6) {
      r(c, (x / 6) % 2 ? '#f3ead2' : '#2e7d4f', x0 + x, ty, 6, 8);
      r(c, (x / 6) % 2 ? '#f3ead2' : '#2e7d4f', x0 + x + 1, ty + 8, 4, 2);
    }
    // escaparate y puerta
    r(c, '#5a3a22', x0 + 8, ty + 14, 66, 36);
    r(c, '#ffe6a8', x0 + 10, ty + 16, 62, 32);
    for (let i = 0; i < 5; i++) {
      r(c, '#d08b2c', x0 + 16 + i * 11, ty + 38, 8, 2);
      r(c, '#d08b2c', x0 + 18 + i * 11, ty + 35, 6, 2);
    }
    r(c, '#5a3a22', x0 + 86, ty + 12, 28, SUELO - ty - 12);
    r(c, '#ffe6a8', x0 + 89, ty + 15, 22, 18);
    r(c, '#e9c46a', x0 + 107, ty + 38, 2, 2);
  }

  // ------------------------------------------------------------ fuente
  // Fuente pixel art 5×7 propia, para que los letreros se lean nítidos.
  const GLIFOS = {
    A: [' ### ', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
    B: ['#### ', '#   #', '#   #', '#### ', '#   #', '#   #', '#### '],
    C: [' ### ', '#   #', '#    ', '#    ', '#    ', '#   #', ' ### '],
    D: ['#### ', '#   #', '#   #', '#   #', '#   #', '#   #', '#### '],
    E: ['#####', '#    ', '#    ', '#### ', '#    ', '#    ', '#####'],
    F: ['#####', '#    ', '#    ', '#### ', '#    ', '#    ', '#    '],
    G: [' ### ', '#   #', '#    ', '# ###', '#   #', '#   #', ' ####'],
    H: ['#   #', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
    I: ['###', ' # ', ' # ', ' # ', ' # ', ' # ', '###'],
    J: ['  ###', '   # ', '   # ', '   # ', '   # ', '#  # ', ' ##  '],
    K: ['#   #', '#  # ', '# #  ', '##   ', '# #  ', '#  # ', '#   #'],
    L: ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
    M: ['#   #', '## ##', '# # #', '# # #', '#   #', '#   #', '#   #'],
    N: ['#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'],
    O: [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    P: ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
    Q: [' ### ', '#   #', '#   #', '#   #', '# # #', '#  # ', ' ## #'],
    R: ['#### ', '#   #', '#   #', '#### ', '# #  ', '#  # ', '#   #'],
    S: [' ####', '#    ', '#    ', ' ### ', '    #', '    #', '#### '],
    T: ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
    U: ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    V: ['#   #', '#   #', '#   #', '#   #', '#   #', ' # # ', '  #  '],
    W: ['#   #', '#   #', '#   #', '# # #', '# # #', '# # #', ' # # '],
    X: ['#   #', '#   #', ' # # ', '  #  ', ' # # ', '#   #', '#   #'],
    Y: ['#   #', '#   #', ' # # ', '  #  ', '  #  ', '  #  ', '  #  '],
    Z: ['#####', '    #', '   # ', '  #  ', ' #   ', '#    ', '#####'],
    0: [' ### ', '#   #', '#  ##', '# # #', '##  #', '#   #', ' ### '],
    1: [' # ', '## ', ' # ', ' # ', ' # ', ' # ', '###'],
    2: [' ### ', '#   #', '    #', '   # ', '  #  ', ' #   ', '#####'],
    3: ['#####', '   # ', '  #  ', '   # ', '    #', '#   #', ' ### '],
    4: ['   # ', '  ## ', ' # # ', '#  # ', '#####', '   # ', '   # '],
    5: ['#####', '#    ', '#### ', '    #', '    #', '#   #', ' ### '],
    6: ['  ## ', ' #   ', '#    ', '#### ', '#   #', '#   #', ' ### '],
    7: ['#####', '    #', '   # ', '  #  ', ' #   ', ' #   ', ' #   '],
    8: [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
    9: [' ### ', '#   #', '#   #', ' ####', '    #', '   # ', ' ##  '],
    '.': [' ', ' ', ' ', ' ', ' ', ' ', '#'],
    '-': ['   ', '   ', '   ', '###', '   ', '   ', '   '],
    '!': ['#', '#', '#', '#', '#', ' ', '#'],
    '¡': ['#', ' ', '#', '#', '#', '#', '#'],
    ' ': ['  ', '  ', '  ', '  ', '  ', '  ', '  '],
  };
  // letras con tilde: letra base + marca dos filas por encima
  const TILDES = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ñ: 'N' };

  function glifo(ch) {
    const base = TILDES[ch] || ch;
    return GLIFOS[base] || GLIFOS[' '];
  }

  function medirTexto(txt, esc = 1) {
    const t = txt.toUpperCase();
    let w = 0;
    for (const ch of t) w += glifo(ch)[0].length * esc + 1;
    return Math.max(0, w - 1);
  }

  // cx: centro horizontal; top: fila superior de las letras (las tildes
  // quedan 2·esc píxeles por encima).
  function texto(c, txt, cx, top, col, esc = 1, sombra = null) {
    return textoPixel(c, txt, cx, top, col, esc, sombra);
  }

  function textoPixel(c, txt, cx, top, col, esc = 1, sombra = null) {
    const t = txt.toUpperCase();
    let x = Math.round(cx - medirTexto(t, esc) / 2);
    top = Math.round(top);
    for (const ch of t) {
      const g = glifo(ch);
      const w = g[0].length;
      const pinta = (color, dx, dy) => {
        c.fillStyle = color;
        for (let fy = 0; fy < 7; fy++) {
          for (let fx = 0; fx < w; fx++) {
            if (g[fy][fx] === '#') c.fillRect(x + fx * esc + dx, top + fy * esc + dy, esc, esc);
          }
        }
        if (TILDES[ch]) {
          const mid = x + Math.floor((w * esc) / 2) + dx;
          if (ch === 'Ñ') c.fillRect(x + dx, top - 2 * esc + dy, w * esc, esc);
          else c.fillRect(mid, top - 2 * esc + dy, Math.max(2, esc * 2), esc);
        }
      };
      if (sombra) pinta(sombra, esc, esc);
      pinta(col, 0, 0);
      x += w * esc + 1;
    }
  }

  // ------------------------------------------------------------ hitos
  // Los sitios por los que se pasa, dibujados en grande. x es el centro.
  // Tren de alta velocidad con silueta de AVE «pato»: morro largo y bajo.
  // tx: cola del tren; base: altura de los raíles.
  function ave(c, tx, base, p) {
    const L = 120;            // largo del coche sin el morro
    const M = 30;             // largo del morro
    const alto = 12;
    const top = base - alto - 1;
    const blanco = mezclar('#8a8e9a', '#f4f6f8', p);
    const gris = mezclar('#5a5e68', '#c3c7cc', p);
    const morado = '#6a2c91';
    const cristal = '#1c2433';
    // carrocería
    r(c, blanco, tx, top, L, alto);
    r(c, gris, tx, top, L, 1);
    // morro de pato: el techo baja suave y la punta queda casi a ras de vía
    for (let k = 0; k < M; k++) {
      const f = k / M;
      const y = top + Math.round(Math.pow(f, 0.7) * (alto - 3));
      r(c, blanco, tx + L + k, y, 1, base - 1 - y);
      if (k >= 3 && k <= 13) r(c, cristal, tx + L + k, y, 1, 2);   // parabrisas
    }
    // franja morada a lo largo, siguiendo el morro
    r(c, morado, tx, base - 5, L, 2);
    for (let k = 0; k < M - 2; k++) r(c, morado, tx + L + k, base - 5 + Math.floor(k / 12), 1, 1);
    // ventanillas
    for (let k = 6; k < L - 6; k += 6) r(c, p < 0.75 ? '#ffe9a0' : cristal, tx + k, top + 3, 4, 3);
    // puertas
    for (const d of [10, L - 16]) r(c, gris, tx + d, top + 2, 1, alto - 4);
    // pantógrafo
    const px = tx + 24;
    r(c, '#3a3c44', px, top - 1, 6, 1);
    r(c, '#3a3c44', px + 1, top - 3, 1, 2);
    r(c, '#3a3c44', px + 2, top - 5, 1, 2);
    r(c, '#3a3c44', px + 3, top - 7, 1, 2);
    r(c, '#3a3c44', px + 1, top - 8, 6, 1);
    // bogies y faro
    for (const d of [8, 40, 80, L + 6]) r(c, '#1e1e24', tx + d, base - 1, 10, 1);
    r(c, '#fff6c0', tx + L + M - 2, base - 3, 2, 1);
  }

  const HITOS = {
    parque(c, x, txt, p, t) {
      const piedra = mezclar('#3a3a44', '#d8cdb4', p);
      const hierro = mezclar('#101014', '#2a2a30', p);
      // árboles detrás
      for (const dx of [-78, -58, 52, 72]) {
        r(c, mezclar('#2d2018', '#5b3d2a', p), x + dx + 4, SUELO - 26, 3, 26);
        circulo(c, mezclar('#12291b', '#3f7a3a', p), x + dx + 5, SUELO - 34, 10);
      }
      // fuente
      r(c, piedra, x - 14, SUELO - 8, 28, 8);
      r(c, mezclar('#24486e', '#4e86b8', p), x - 12, SUELO - 7, 24, 2);
      r(c, piedra, x - 2, SUELO - 16, 4, 8);
      const chorro = mezclar('#5d84a8', '#bfe6ff', p);
      r(c, chorro, x - 1, SUELO - 26, 2, 10);
      for (let k = 0; k < 6; k++) {
        const f = (t * 1.5 + k / 6) % 1;
        const lado = k % 2 ? 1 : -1;
        r(c, chorro, x + lado * f * 9, SUELO - 26 + f * f * 18, 1, 1);
      }
      // verja
      for (let k = -84; k < 84; k += 4) {
        if (k > -34 && k < 32) continue;
        r(c, hierro, x + k, SUELO - 12, 1, 12);
      }
      r(c, hierro, x - 84, SUELO - 12, 50, 1);
      r(c, hierro, x + 32, SUELO - 12, 52, 1);
      // pilares y arco
      r(c, piedra, x - 34, SUELO - 46, 10, 46);
      r(c, piedra, x + 24, SUELO - 46, 10, 46);
      r(c, mezclar('#2c2c34', '#b9ad94', p), x - 36, SUELO - 49, 14, 3);
      r(c, mezclar('#2c2c34', '#b9ad94', p), x + 22, SUELO - 49, 14, 3);
      for (let dx = -24; dx <= 24; dx++) {
        const y = SUELO - 50 - Math.round(9 * Math.cos((dx / 24) * Math.PI / 2));
        r(c, hierro, x + dx, y, 1, 2);
      }
      const w = medirTexto(txt) + 10;
      r(c, '#efe4c8', x - w / 2, SUELO - 76, w, 13);
      r(c, '#2c4a33', x - w / 2 + 1, SUELO - 75, w - 2, 11);
      texto(c, txt, x, SUELO - 73, '#ffffff', 1, '#14281b');
    },

    viaverde(c, x, txt, p) {
      const madera = mezclar('#2a2016', '#7a5634', p);
      // hito kilométrico
      r(c, '#e8e8e8', x - 64, SUELO - 14, 6, 14);
      r(c, '#c62828', x - 64, SUELO - 16, 6, 3);
      // panel informativo con tejadillo
      r(c, madera, x - 30, SUELO - 42, 3, 42);
      r(c, madera, x + 27, SUELO - 42, 3, 42);
      r(c, madera, x - 35, SUELO - 48, 70, 3);
      r(c, madera, x - 32, SUELO - 45, 64, 2);
      r(c, '#f1f1f1', x - 28, SUELO - 42, 56, 26);
      r(c, '#2c6e49', x - 27, SUELO - 41, 54, 24);
      texto(c, txt, x, SUELO - 38, '#ffffff', 1, '#173d28');
      // bici y caminante
      circulo(c, '#ffffff', x - 12, SUELO - 24, 2);
      circulo(c, '#ffffff', x - 4, SUELO - 24, 2);
      r(c, '#2c6e49', x - 12, SUELO - 24, 1, 1);
      r(c, '#2c6e49', x - 4, SUELO - 24, 1, 1);
      r(c, '#ffffff', x - 10, SUELO - 27, 5, 1);
      r(c, '#ffffff', x + 8, SUELO - 30, 2, 2);
      r(c, '#ffffff', x + 8, SUELO - 28, 2, 4);
      r(c, '#ffffff', x + 7, SUELO - 24, 1, 2);
      r(c, '#ffffff', x + 10, SUELO - 24, 1, 2);
      // señal de tren antigua (la vía verde fue vía de tren)
      r(c, '#55585f', x + 56, SUELO - 52, 2, 52);
      for (let k = 0; k < 14; k += 2) r(c, k % 4 ? '#ffffff' : '#c62828', x + 52 + k, SUELO - 50, 2, 3);
      r(c, '#222', x + 55, SUELO - 56, 4, 4);
      r(c, p < 0.7 ? '#ff5a3b' : '#5a1a10', x + 56, SUELO - 55, 2, 2);
    },

    barrio(c, x, txt, p) {
      // el cerrillo: un montículo de tierra sobre el que está el barrio
      const B = SUELO - 14;
      const tierra = mezclar('#2a2418', '#9c8458', p);
      const hierba = mezclar('#1a2414', '#7a8a44', p);
      for (let dx = -124; dx <= 124; dx++) {
        const h = Math.round(14 * Math.min(1, (124 - Math.abs(dx)) / 30));
        if (h > 0) r(c, tierra, x + dx, SUELO - h, 1, h);
        if (h > 0 && hash(dx + 500) < 0.25) r(c, hierba, x + dx, SUELO - h - 1, 1, 2);
      }
      const ladrillo = mezclar('#2e2224', '#a8583a', p);
      const junta = mezclar('#241a1c', '#8a4630', p);
      const uralita = mezclar('#2a2c34', '#9a9c98', p);
      const uralitaOsc = mezclar('#202228', '#7c7e7a', p);
      const ventanaOff = mezclar('#1d2236', '#5f7488', p);

      // casa de ladrillo visto sin enlucir, con varillas asomando
      const x1 = x - 92;
      const t1 = B - 32;
      r(c, ladrillo, x1, t1, 48, 32);
      for (let y = t1 + 3; y < B; y += 3) {
        r(c, junta, x1, y, 48, 1);
        for (let k = ((y - t1) / 3) % 2 ? 0 : 3; k < 48; k += 6) r(c, junta, x1 + k, y - 2, 1, 2);
      }
      r(c, mezclar('#3a3c44', '#c9c4b8', p), x1, t1, 48, 2);
      for (const k of [4, 17, 30, 43]) r(c, mezclar('#2a1a14', '#6b3a22', p), x1 + k, t1 - 6, 1, 6);
      r(c, mezclar('#1b1b22', '#4a3a30', p), x1 + 6, B - 17, 9, 17);
      const luz1 = hash(41) > 0.35 + p * 0.6;
      r(c, luz1 ? '#ffd96b' : ventanaOff, x1 + 24, t1 + 9, 9, 8);
      for (let b = 1; b < 9; b += 2) r(c, '#1e1e24', x1 + 24 + b, t1 + 9, 1, 8);
      // bombona de butano
      r(c, '#e8732a', x1 + 38, B - 7, 5, 7);
      r(c, '#b5531a', x1 + 39, B - 8, 3, 1);
      // parabólica
      circulo(c, mezclar('#3a3c44', '#d8d8d4', p), x1 + 40, t1 - 5, 3);
      r(c, '#55585f', x1 + 40, t1 - 3, 1, 3);

      // chabola de chapas de colores
      const x2 = x - 38;
      const t2 = B - 24;
      const chapas = ['#8a4a2a', '#7a8088', '#4f6f8f', '#9a6a3a', '#6a7a5a'];
      for (let k = 0; k < 44; k += 8) {
        const col = mezclar('#1e2028', chapas[(k / 8) % chapas.length], p);
        r(c, col, x2 + k, t2 + ((k / 8) % 2), 8, 24 - ((k / 8) % 2));
        for (let o = 1; o < 8; o += 2) r(c, 'rgba(0,0,0,0.18)', x2 + k + o, t2 + 1, 1, 23);
      }
      // tejado de uralita con piedras encima
      for (let k = -3; k < 50; k++) r(c, k % 3 ? uralita : uralitaOsc, x2 + k, t2 - 3 + Math.floor(k / 18), 1, 3);
      r(c, mezclar('#2a2a2e', '#8c8a84', p), x2 + 8, t2 - 5, 4, 2);
      r(c, mezclar('#2a2a2e', '#8c8a84', p), x2 + 30, t2 - 4, 5, 2);
      // cortina por puerta y ventanuco
      r(c, mezclar('#2a1830', '#b0405a', p), x2 + 18, B - 15, 9, 15);
      r(c, mezclar('#3a2040', '#d06070', p), x2 + 20, B - 15, 1, 15);
      const luz2 = hash(77) > 0.3 + p * 0.6;
      r(c, luz2 ? '#ffcf5a' : ventanaOff, x2 + 33, t2 + 6, 6, 5);

      // tendedero con ropa
      const x3 = x + 24;
      r(c, '#5b4632', x3, B - 30, 2, 30);
      r(c, '#5b4632', x3 + 46, B - 30, 2, 30);
      r(c, mezclar('#3a3c44', '#d8d8d4', p), x3 + 2, B - 29, 44, 1);
      const ropa = [['#c62828', 6, 9], ['#1e3fa0', 5, 11], ['#f2f2f2', 7, 7], ['#2e8b57', 5, 10], ['#f0b429', 6, 8]];
      let rx = x3 + 4;
      for (const [col, w, h] of ropa) {
        r(c, mezclar('#202230', col, p), rx, B - 28, w, h);
        rx += w + 2;
      }
      // palets apilados y una rueda
      const palet = mezclar('#2a2016', '#a07a4a', p);
      for (let k = 0; k < 3; k++) {
        r(c, palet, x3 + 52, B - 3 - k * 4, 18, 1);
        r(c, palet, x3 + 52, B - 5 - k * 4, 18, 1);
        for (const d of [0, 8, 16]) r(c, palet, x3 + 52 + d, B - 5 - k * 4, 2, 3);
      }
      circulo(c, '#1a1a1e', x3 + 80, B - 4, 4);
      circulo(c, mezclar('#2a2c34', '#55585f', p), x3 + 80, B - 4, 1);

      // placa de calle en un poste, por encima de las cabezas
      const w = medirTexto(txt) + 8;
      r(c, '#55585f', x - 1, SUELO - 46, 2, 46);
      r(c, '#1d4fa0', x - w / 2, SUELO - 58, w, 13);
      r(c, '#ffffff', x - w / 2 + 1, SUELO - 57, w - 2, 11);
      texto(c, txt, x, SUELO - 55, '#1d4fa0');
    },

    cementerio(c, x, txt, p) {
      const cip = mezclar('#0b1810', '#2c5236', p);
      for (const dx of [-62, -44, 38, 56, 70]) {
        const h = 40 + ((dx * 7) % 12);
        r(c, cip, x + dx, SUELO - h, 7, h);
        r(c, cip, x + dx + 1, SUELO - h - 5, 5, 5);
        r(c, cip, x + dx + 3, SUELO - h - 8, 1, 3);
      }
      const tapia = mezclar('#30344a', '#e6e1d3', p);
      const sombra = mezclar('#22252f', '#bdb6a6', p);
      r(c, tapia, x - 80, SUELO - 20, 160, 20);
      r(c, sombra, x - 80, SUELO - 21, 160, 2);
      // puerta
      r(c, tapia, x - 26, SUELO - 56, 10, 56);
      r(c, tapia, x + 16, SUELO - 56, 10, 56);
      const w = Math.max(56, medirTexto(txt) + 10);
      r(c, sombra, x - w / 2, SUELO - 68, w, 12);
      r(c, tapia, x - w / 2 + 1, SUELO - 67, w - 2, 10);
      texto(c, txt, x, SUELO - 66, mezclar('#0c0c10', '#33302a', p));
      r(c, sombra, x - 1, SUELO - 78, 2, 12);
      r(c, sombra, x - 4, SUELO - 74, 8, 2);
      // reja
      r(c, '#1c1c20', x - 16, SUELO - 50, 32, 50);
      for (let k = -15; k < 16; k += 3) r(c, '#3a3c44', x + k, SUELO - 48, 1, 48);
      r(c, '#3a3c44', x - 16, SUELO - 36, 32, 1);
    },

    universidad(c, x, txt, p) {
      const top = SUELO - 68;
      r(c, mezclar('#2a2c3c', '#d9cfc0', p), x - 80, top, 160, 68);
      for (let y = top + 14; y < SUELO - 30; y += 9) {
        r(c, mezclar('#1d2a44', '#7fb3d9', p), x - 76, y, 152, 5);
        for (let k = 0; k < 6; k++) {
          if (hash(y * 3 + k) > 0.45 + p * 0.6) r(c, '#ffd96b', x - 74 + k * 25, y, 10, 5);
        }
      }
      // letrero
      const w = medirTexto(txt) + 14;
      r(c, '#7a1c2c', x - w / 2, top + 2, w, 11);
      texto(c, txt, x, top + 4, '#ffffff', 1, '#3e0d16');
      // entrada
      r(c, mezclar('#1b1f2c', '#5b5f6c', p), x - 22, SUELO - 30, 44, 2);
      r(c, p < 0.8 ? '#ffe6a8' : mezclar('#1d2a44', '#86c3e6', p), x - 16, SUELO - 27, 32, 24);
      r(c, mezclar('#2a2c3c', '#b9b0a2', p), x, SUELO - 27, 1, 24);
      r(c, mezclar('#3a3c48', '#e9e3d6', p), x - 26, SUELO - 3, 52, 3);
      // banderas
      const banderas = [['#c62828', '#ffd54f'], ['#1e3fa0', '#ffd54f'], ['#ffffff', '#c62828']];
      banderas.forEach(([a, b], k) => {
        const fx = x + 48 + k * 9;
        r(c, '#77797f', fx, SUELO - 44, 1, 44);
        r(c, a, fx + 1, SUELO - 44, 7, 5);
        r(c, b, fx + 1, SUELO - 42, 7, 1);
      });
    },

    estacion(c, x, txt, p, t) {
      // vía elevada con catenaria y un tren pasando
      const grava = mezclar('#2a2a30', '#8f8a80', p);
      r(c, grava, x - 120, SUELO - 66, 240, 5);
      r(c, mezclar('#3a3c44', '#b5b0a6', p), x - 120, SUELO - 62, 240, 1);
      for (let k = -120; k <= 120; k += 40) r(c, mezclar('#3a3c44', '#7a7c80', p), x + k, SUELO - 61, 3, 61);
      c.save();
      c.beginPath();
      c.rect(x - 120, 0, 240, H);
      c.clip();
      const tx = x - 300 + ((t * 110) % 600);
      ave(c, tx, SUELO - 66, p);
      c.restore();
      for (let k = -120; k <= 120; k += 40) r(c, '#55585f', x + k + 1, SUELO - 90, 1, 24);
      r(c, '#55585f', x - 120, SUELO - 86, 240, 1);

      // edificio acristalado
      const vidrio = p < 0.8 ? mezclar('#3a4a5a', '#ffe6a8', 0.75) : mezclar('#1d2a44', '#9cc8e6', p);
      r(c, mezclar('#2d3142', '#e9ecef', p), x - 94, SUELO - 38, 188, 38);
      r(c, vidrio, x - 90, SUELO - 34, 180, 30);
      for (let k = -90; k <= 90; k += 15) r(c, mezclar('#2d3142', '#d0d4d8', p), x + k, SUELO - 34, 1, 30);
      r(c, mezclar('#2d3142', '#d0d4d8', p), x - 90, SUELO - 20, 180, 1);
      // marquesina
      r(c, mezclar('#3a3c48', '#c9ccd0', p), x - 104, SUELO - 44, 208, 4);
      r(c, mezclar('#24262e', '#9a9ea4', p), x - 104, SUELO - 40, 208, 1);
      // letrero
      const w = medirTexto(txt) + 14;
      r(c, '#1c2a4a', x - w / 2, SUELO - 58, w, 13);
      texto(c, txt, x, SUELO - 55, '#ffffff', 1, '#0a1226');
      // reloj
      circulo(c, '#f4f4f0', x + 78, SUELO - 52, 5);
      r(c, '#222', x + 78, SUELO - 56, 1, 4);
      r(c, '#222', x + 78, SUELO - 52, 3, 1);
      r(c, '#55585f', x + 78, SUELO - 47, 1, 3);
      // taxi en la puerta
      const tx2 = x - 70;
      r(c, '#f4f4f0', tx2, SUELO - 7, 22, 5);
      r(c, '#f4f4f0', tx2 + 5, SUELO - 11, 12, 4);
      r(c, mezclar('#1d2a44', '#9cc8e6', p), tx2 + 7, SUELO - 10, 8, 2);
      r(c, '#3dff6e', tx2 + 10, SUELO - 12, 2, 1);
      circulo(c, '#1a1a1e', tx2 + 5, SUELO - 2, 2);
      circulo(c, '#1a1a1e', tx2 + 17, SUELO - 2, 2);
      r(c, '#ffe9a0', tx2 + 21, SUELO - 6, 1, 1);
    },

    gofit(c, x, txt, p, t) {
      const top = SUELO - 54;
      r(c, mezclar('#2d3142', '#eef1f4', p), x - 72, top, 144, 54);
      r(c, '#1fa3d6', x - 72, top, 144, 3);
      texto(c, txt, x, top + 9, '#1fa3d6', 2, mezclar('#1d2232', '#b9c6d0', p));
      r(c, mezclar('#1d2a44', '#9cd3ef', p), x - 66, SUELO - 26, 132, 24);
      if (p < 0.85) r(c, 'rgba(255,230,140,0.35)', x - 66, SUELO - 26, 132, 24);
      // gente en las cintas
      for (let k = 0; k < 5; k++) {
        const px = x - 52 + k * 26;
        const f = Math.floor(t * 9 + k) % 2;
        r(c, '#3c4048', px - 5, SUELO - 6, 12, 2);
        r(c, '#3c4048', px + 6, SUELO - 14, 1, 8);
        r(c, '#2c3e50', px, SUELO - 19 + f, 2, 2);
        r(c, '#2c3e50', px, SUELO - 17 + f, 2, 5);
        r(c, '#2c3e50', px - 1 + f, SUELO - 12 + f, 1, 4);
        r(c, '#2c3e50', px + 2 - f, SUELO - 12 + f, 1, 4);
      }
      for (let k = -66; k <= 66; k += 22) r(c, mezclar('#2d3142', '#d6dbe0', p), x + k, SUELO - 26, 1, 24);
    },

    cortijo(c, x, txt, p) {
      const top = SUELO - 30;
      r(c, mezclar('#2a2a38', '#f4efe2', p), x - 66, top, 80, 30);
      r(c, mezclar('#3a1f1a', '#b5523a', p), x - 69, top - 5, 86, 5);
      r(c, mezclar('#1b1b22', '#5a3a22', p), x - 40, SUELO - 20, 18, 20);
      r(c, hash(3) > 0.4 + p * 0.6 ? '#ffd96b' : mezclar('#1d2236', '#5f7488', p), x - 10, top + 8, 7, 7);
      r(c, mezclar('#2a2a38', '#d9d2c2', p), x - 66, top + 26, 80, 4);
      // pacas de paja
      const paja = mezclar('#3a3220', '#d9b44a', p);
      const pajaOsc = mezclar('#2c2618', '#b8932f', p);
      for (let fila = 0; fila < 3; fila++) {
        for (let k = 0; k < 3 - fila; k++) {
          const px = x + 26 + k * 14 + fila * 7;
          const py = SUELO - 8 - fila * 8;
          r(c, paja, px, py, 13, 8);
          r(c, pajaOsc, px, py + 3, 13, 1);
        }
      }
    },

    poblachuela(c, x, txt, p) {
      // chalet detrás
      const top = SUELO - 26;
      const tejado = mezclar('#341c18', '#b4583c', p);
      for (let k = 0; k < 10; k++) r(c, tejado, x + 18 + k * 2, top - 1 - k, 52 - k * 4, 1);
      r(c, mezclar('#2a2a38', '#efe4c8', p), x + 20, top, 48, 26);
      r(c, hash(9) > 0.4 + p * 0.6 ? '#ffd96b' : mezclar('#1d2236', '#7f9ab0', p), x + 28, top + 7, 8, 8);
      r(c, mezclar('#1b1b22', '#7a5434', p), x + 48, top + 10, 8, 16);
      r(c, mezclar('#0f1d12', '#4c7a3a', p), x + 12, SUELO - 8, 66, 8);
      // cartel de entrada de población
      const w = medirTexto(txt) + 14;
      r(c, '#8a8d94', x - w / 2 + 6, SUELO - 44, 2, 44);
      r(c, '#8a8d94', x + w / 2 - 8, SUELO - 44, 2, 44);
      r(c, '#c62828', x - w / 2, SUELO - 59, w, 17);
      r(c, '#ffffff', x - w / 2 + 2, SUELO - 57, w - 4, 13);
      texto(c, txt, x, SUELO - 54, '#111111');
    },
  };

  function hito(c, tipo, x, txt, p, t) {
    if (HITOS[tipo]) HITOS[tipo](c, Math.round(x), txt, p, t || 0);
  }

  // Oscuridad total; con la frontal se abre un haz delante del jugador.
  const sombraLienzo = document.createElement('canvas');
  sombraLienzo.width = W;
  sombraLienzo.height = H;
  const sombra = sombraLienzo.getContext('2d');

  function oscuridad(c, intensidad, luz) {
    sombra.globalCompositeOperation = 'source-over';
    sombra.clearRect(0, 0, W, H);
    sombra.fillStyle = `rgba(2,3,10,${0.93 * intensidad})`;
    sombra.fillRect(0, 0, W, H);
    if (luz) {
      sombra.globalCompositeOperation = 'destination-out';
      const g = sombra.createRadialGradient(luz.x + 40, luz.y + 10, 4, luz.x + 40, luz.y + 10, 75);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sombra.fillStyle = g;
      sombra.fillRect(0, 0, W, H);
    }
    c.drawImage(sombraLienzo, 0, 0);
    if (luz) {
      r(c, '#fffbe0', luz.x + 2, luz.y - 1, 2, 1);
    }
  }

  // indicadores encima de las cabezas
  function bocadillo(c, x, y) {
    x = Math.round(x);
    y = Math.round(y);
    r(c, '#ffffff', x - 4, y - 6, 9, 5);
    r(c, '#ffffff', x - 1, y - 1, 2, 1);
    r(c, '#333', x - 2, y - 4, 1, 1);
    r(c, '#333', x, y - 4, 1, 1);
    r(c, '#333', x + 2, y - 4, 1, 1);
  }

  function flecha(c, x, y) {
    x = Math.round(x);
    y = Math.round(y);
    r(c, '#ffd166', x - 2, y - 4, 5, 1);
    r(c, '#ffd166', x - 1, y - 3, 3, 1);
    r(c, '#ffd166', x, y - 2, 1, 1);
  }

  function gota(c, x, y) {
    r(c, '#9fd3ff', Math.round(x), Math.round(y), 1, 2);
  }

  function estrellitas(c, x, y, t) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + (i * Math.PI * 2) / 3;
      r(c, '#ffe066', x + Math.cos(a) * 5, y + Math.sin(a) * 2, 1, 1);
    }
  }

  function moneda(c, x, y) {
    circulo(c, '#e0a92a', Math.round(x), Math.round(y), 3);
    r(c, '#fff1b0', Math.round(x) - 1, Math.round(y) - 1, 1, 2);
  }

  return {
    W, H, SUELO, corredor, retrato, fondo, charco, obstaculo, matorral, contenedor, perro, stop, semaforo,
    senalCuesta, cartel, hito, oscuridad, fachada, texto, medirTexto, bocadillo, flecha, gota, estrellitas, moneda,
  };
})();
