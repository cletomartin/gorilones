'use strict';
// Efectos de sonido retro generados con Web Audio: no hace falta ningún archivo.
// Los navegadores no dejan sonar nada hasta que el usuario toca o pulsa algo,
// así que el audio se arranca con la primera interacción (Sonido.iniciar()).

const Sonido = (() => {
  let ctx = null;
  let salida = null;
  let silencio = false;
  let ruidoBuffer = null;

  try { silencio = localStorage.getItem('gorilones-silencio') === '1'; } catch (e) { /* sin almacenamiento */ }

  function iniciar() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      salida = ctx.createGain();
      salida.gain.value = 0.35;
      salida.connect(ctx.destination);
      // dos segundos de ruido blanco para chapoteos, golpes y ladridos
      ruidoBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const datos = ruidoBuffer.getChannelData(0);
      for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tono(freq, dur, { tipo = 'square', vol = 0.3, desliz = null, retraso = 0 } = {}) {
    if (!ctx || silencio) return;
    const t = ctx.currentTime + retraso;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    if (desliz) o.frequency.exponentialRampToValueAtTime(desliz, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(salida);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function ruido(dur, { vol = 0.3, filtro = 1200, tipoFiltro = 'lowpass', retraso = 0 } = {}) {
    if (!ctx || silencio) return;
    const t = ctx.currentTime + retraso;
    const s = ctx.createBufferSource();
    s.buffer = ruidoBuffer;
    const f = ctx.createBiquadFilter();
    f.type = tipoFiltro;
    f.frequency.value = filtro;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(salida);
    s.start(t, Math.random());
    s.stop(t + dur + 0.02);
  }

  const arpegio = (notas, dur, opc = {}) =>
    notas.forEach((f, i) => tono(f, dur, { ...opc, retraso: (opc.retraso || 0) + i * dur * 0.7 }));

  const EFECTOS = {
    despertador() {
      for (let i = 0; i < 6; i++) {
        tono(1760, 0.07, { vol: 0.16, retraso: i * 0.17 });
        tono(1760, 0.07, { vol: 0.16, retraso: i * 0.17 + 0.08 });
      }
    },
    menu: () => tono(440, 0.06, { vol: 0.12 }),
    salto: () => tono(300, 0.15, { desliz: 720, vol: 0.18 }),
    charco() {
      ruido(0.25, { filtro: 1800, vol: 0.35 });
      tono(520, 0.12, { tipo: 'sine', desliz: 200, vol: 0.12 });
    },
    tropiezo() {
      ruido(0.12, { filtro: 380, vol: 0.55 });
      tono(130, 0.22, { tipo: 'triangle', desliz: 60, vol: 0.4 });
    },
    letra: () => tono(500 + Math.random() * 90, 0.03, { vol: 0.05 }),
    opciones: () => tono(660, 0.06, { vol: 0.12 }),
    elegir() {
      tono(660, 0.07, { vol: 0.13 });
      tono(990, 0.09, { vol: 0.13, retraso: 0.07 });
    },
    amistad: () => arpegio([784, 1047], 0.1, { tipo: 'triangle', vol: 0.2 }),
    amistadMenos: () => arpegio([392, 294], 0.13, { tipo: 'triangle', vol: 0.2 }),
    aviso: () => tono(880, 0.05, { tipo: 'sine', vol: 0.07 }),
    tramo: () => arpegio([587, 880], 0.08, { tipo: 'triangle', vol: 0.12 }),
    luz: () => tono(1300, 0.04, { vol: 0.12 }),
    grito: () => tono(240, 0.2, { tipo: 'sawtooth', desliz: 170, vol: 0.09 }),
    pajara: () => tono(440, 0.7, { tipo: 'triangle', desliz: 110, vol: 0.25 }),
    animo: () => arpegio([523, 659, 784, 1047], 0.1, { vol: 0.11 }),
    ladrido() {
      for (const r of [0, 0.2]) {
        ruido(0.08, { filtro: 900, tipoFiltro: 'bandpass', vol: 0.5, retraso: r });
        tono(400, 0.08, { tipo: 'sawtooth', desliz: 240, vol: 0.14, retraso: r });
      }
    },
    silbato() {
      tono(2100, 0.12, { tipo: 'sine', vol: 0.18 });
      tono(2100, 0.4, { tipo: 'sine', vol: 0.18, retraso: 0.17 });
    },
    llegada: () => arpegio([523, 659, 784, 659, 784, 1047, 1047], 0.15, { vol: 0.16 }),
  };

  return {
    iniciar,
    toca(nombre) { if (EFECTOS[nombre]) EFECTOS[nombre](); },
    get silencio() { return silencio; },
    alternar() {
      silencio = !silencio;
      try { localStorage.setItem('gorilones-silencio', silencio ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
      return silencio;
    },
  };
})();
