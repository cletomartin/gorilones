'use strict';
// Lógica del juego: elegir circuito → quedada → carrera → La Hormiga.

(() => {
  const { W } = Dibujo;
  const PX_KM = 1400;        // píxeles de desplazamiento por km
  const SEG_KM = 14;         // segundos de juego por km
  const MIN_KM = 6;          // minutos de reloj por km (para la hora del HUD)
  const Y_BASE = 134;        // pies del corredor en el carril 0
  const MIN_PRESENTES = 6;   // como mínimo salen 6
  const PROB_FALTA = 0.2;    // probabilidad de que cada uno falle un viernes

  const $ = (s) => document.querySelector(s);
  const lienzo = $('#lienzo');
  const ctx = lienzo.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const ctxRetrato = $('#retrato').getContext('2d');

  const PJ = Object.fromEntries(PERSONAJES.map((p) => [p.id, p]));

  const nombre = (id) => (id === 'tu' ? 'Tú' : PJ[id] ? PJ[id].nombre : '');
  const aspecto = (id) => (PJ[id] ? PJ[id].aspecto : JUGADOR.aspecto);
  const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
  const barajar = (l) => {
    const a = [...l];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const enumerar = (l) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} y ${l[l.length - 1]}`);

  let J;
  const teclas = { izq: false, der: false };
  // control con el dedo: el jugador va hacia donde está el dedo
  const TACTIL = window.matchMedia('(pointer: coarse)').matches;
  const dedo = { activo: false, id: null, x: 0, y0: 0, saltado: false };
  function direccion() {
    const jx = J.jugador.x;
    return {
      der: teclas.der || (dedo.activo && dedo.x > jx + 4),
      izq: teclas.izq || (dedo.activo && dedo.x < jx - 4),
    };
  }

  function nuevoEstado(circ) {
    return {
      estado: 'titulo', circ, t: 0, km: 0, scroll: 0, energia: 100, pajara: false,
      jugador: { id: 'tu', x: 150, carril: 7, z: 0, vz: 0, fase: 0.3 },
      npcs: [], ausentes: [], amistad: {}, conv: {},
      charlas: 0, charcosPisados: 0, tropiezos: 0, hechos: new Set(), tramo: -1,
      duro: false, sprint: false, charcos: [], sigCharco: 0.5 * PX_KM,
      perro: null, dialogo: null, orden: null,
      luz: false, gritoT: 0, gritos: 0, introT: 0, menu: false, dormido: false,
      paradaKm: 99, paradaHecha: false, parada: null, animoT: 0,
    };
  }

  // ¿Quién sale hoy? Cada uno puede fallar, pero salen al menos MIN_PRESENTES.
  function pasarLista() {
    const orden = barajar(PERSONAJES);
    const presentes = [];
    const ausentes = [];
    for (const p of orden) {
      const faltan = PERSONAJES.length - presentes.length - ausentes.length;
      const puedeFaltar = presentes.length + faltan - 1 >= MIN_PRESENTES;
      if (puedeFaltar && Math.random() < PROB_FALTA) ausentes.push(p);
      else presentes.push(p);
    }
    const excusas = barajar(EXCUSAS);
    J.ausentes = ausentes.map((p, i) => ({ id: p.id, excusa: excusas[i % excusas.length] }));
    J.npcs = presentes.map((p) => ({
      id: p.id, p, x: p.posicion, carril: p.carril, z: 0, vz: 0,
      ruido: Math.random() * 6, fase: Math.random(),
    }));
    for (const p of presentes) { J.amistad[p.id] = 0; J.conv[p.id] = 0; }
  }

  const presente = (id) => id === 'narrador' || id === 'tu' || id in J.amistad;

  // Quita de un diálogo lo que dicen los que no han venido.
  function filtrar(seq, quien) {
    // una línea [quien, texto, requiere] solo sale si «requiere» ha venido
    // un cuarto elemento 'tactil' o 'teclado' limita la línea a ese tipo de pantalla
    const lineas = seq.lineas.map((l) => normal(l, quien))
      .filter(([q, , req, solo]) => presente(q) && (!req || presente(req)) && (!solo || solo === (TACTIL ? 'tactil' : 'teclado')));
    let opciones = (seq.opciones || [])
      .filter((op) => [].concat(op.requiere || []).every(presente))
      .map((op) => ({
        ...op,
        respuesta: (op.respuesta || []).map((l) => normal(l, quien)).filter(([q]) => presente(q)),
      }));
    if (!opciones.length) opciones = null;
    return { lineas, opciones };
  }

  // ------------------------------------------------------------- circuito
  function tramoEn(km) {
    const t = J.circ.tramos;
    for (let i = 0; i < t.length; i++) if (km < t[i].hasta) return i;
    return t.length - 1;
  }
  const escenarioEn = (wx) => (J.circ ? J.circ.tramos[tramoEn(wx / PX_KM)].escenario : 'ciudad');
  const esTierra = (wx) => ['viaverde', 'campo', 'parque'].includes(escenarioEn(wx));
  const distancia = () => (J.circ ? J.circ.distancia : 6);

  function elementos() {
    if (!J.circ) return [{ tipo: 'stop', wx: 285 }];
    return [
      ...(J.circ.stop ? [{ tipo: 'stop', wx: 285 }] : []),
      ...J.circ.semaforos.map((km) => ({ tipo: 'semaforo', km, wx: km * PX_KM + 250 })),
      ...J.circ.hitos.map((h) => ({ tipo: 'hito', hito: h, wx: h.km * PX_KM + 200 })),
      { tipo: 'hormiga', wx: J.circ.distancia * PX_KM + 150 },
    ];
  }

  // 0 = luz normal, 1 = oscuridad total (con fundido de 0,1 km en los bordes)
  function oscuridadEn(km) {
    if (!J.circ || !J.circ.oscuros) return 0;
    let o = 0;
    for (const z of J.circ.oscuros) {
      const v = Math.min((km - z.desde + 0.1) / 0.1, (z.hasta + 0.1 - km) / 0.1, 1);
      o = Math.max(o, v);
    }
    return limitar(o, 0, 1);
  }

  // ------------------------------------------------------------- avisos
  function aviso(texto, quien, sonido = 'aviso') {
    if (sonido) Sonido.toca(sonido);
    const d = document.createElement('div');
    d.className = 'aviso';
    if (quien && quien !== 'narrador') {
      const b = document.createElement('b');
      b.textContent = nombre(quien) + ': ';
      d.appendChild(b);
    }
    d.appendChild(document.createTextNode(texto));
    $('#avisos').appendChild(d);
    setTimeout(() => d.remove(), 2800);
  }

  // ------------------------------------------------------------ diálogo
  function normal(l, q) { return typeof l === 'string' ? [q, l] : l; }

  function abrirDialogo(seq, quien, alFinal) {
    const f = filtrar(seq, quien);
    if (!f.lineas.length && !f.opciones) { if (alFinal) alFinal(); return; }
    J.dialogo = {
      lineas: f.lineas, opciones: f.opciones,
      quien, alFinal, fase: 'lineas', texto: '', vis: 0, mostrado: -1,
    };
    $('#dialogo').hidden = false;
    siguienteLinea();
  }

  function siguienteLinea() {
    const d = J.dialogo;
    if (!d.lineas.length) {
      if (d.opciones && d.fase === 'lineas') return mostrarOpciones();
      return cerrarDialogo();
    }
    const [q, t] = d.lineas.shift();
    d.texto = t;
    d.vis = 0;
    d.mostrado = -1;
    $('#dlg-nombre').textContent = nombre(q);
    $('#dialogo').classList.toggle('narrador', q === 'narrador');
    $('#dlg-opciones').innerHTML = '';
    if (q !== 'narrador') Dibujo.retrato(ctxRetrato, aspecto(q));
    ajustarDialogo();
  }

  // Si el mensaje (con sus respuestas) no cabe en la caja, baja la letra poco a
  // poco hasta que entre entero. Se mide con el texto completo, no con lo que
  // lleva escrito la máquina de escribir.
  function ajustarDialogo() {
    const d = J.dialogo;
    if (!d) return;
    const caja = $('#dialogo');
    const texto = $('#dlg-texto');
    const escrito = texto.textContent;
    texto.textContent = d.texto;
    caja.style.fontSize = '';
    let tam = parseFloat(getComputedStyle(caja).fontSize);
    while (caja.scrollHeight > caja.clientHeight + 1 && tam > 11) {
      tam -= 0.5;
      caja.style.fontSize = `${tam}px`;
    }
    texto.textContent = escrito;
  }

  function mostrarOpciones() {
    const d = J.dialogo;
    d.fase = 'opciones';
    d.vis = d.texto.length;
    const cont = $('#dlg-opciones');
    cont.innerHTML = '';
    Sonido.toca('opciones');
    d.opciones.forEach((op, i) => {
      const b = document.createElement('button');
      b.textContent = `${i + 1}. ${op.texto}`;
      b.addEventListener('click', (e) => { e.stopPropagation(); elegir(i); });
      cont.appendChild(b);
    });
    ajustarDialogo();
  }

  function elegir(i) {
    const d = J.dialogo;
    if (!d || d.fase !== 'opciones' || !d.opciones[i]) return;
    const op = d.opciones[i];
    Sonido.toca('elegir');
    aplicar(op, d.quien);
    d.fase = 'respuesta';
    d.lineas = op.respuesta;
    siguienteLinea();
  }

  function avanzar() {
    const d = J.dialogo;
    if (!d || d.fase === 'opciones') return;
    if (d.vis < d.texto.length) { d.vis = d.texto.length; return; }
    siguienteLinea();
  }

  function cerrarDialogo() {
    const f = J.dialogo.alFinal;
    J.dialogo = null;
    $('#dialogo').hidden = true;
    if (f) f();
  }

  function sumarAmistad(id, n) {
    if (!n) return;
    const ids = id === 'todos' ? Object.keys(J.amistad) : [id];
    for (const k of ids) {
      if (!(k in J.amistad)) continue;
      J.amistad[k] += n;
      aviso(n > 0 ? `♥ +${n}` : `♥ ${n}`, k, n > 0 ? 'amistad' : 'amistadMenos');
    }
  }

  function aplicar(op, quien) {
    if (typeof op.amistad === 'number') sumarAmistad(quien, op.amistad);
    else if (op.amistad) for (const [k, n] of Object.entries(op.amistad)) sumarAmistad(k, n);
    if (op.energia) J.energia = limitar(J.energia + op.energia, 0, 100);
    if (op.acelera) {
      const n = J.npcs.find((m) => m.id === op.acelera);
      if (n) n.acelerado = 10;
    }
  }

  // ------------------------------------------------------------ acciones
  // Portada: suena el despertador, van llegando los gorilones, cae el logo
  // y «Pulsa para empezar». Al pulsar se eligen circuitos.
  const FASES_INTRO = [['fase-calle', 1.8], ['fase-logo', 3.6], ['fase-pulsa', 4.6]];
  const FIN_INTRO = 4.6;

  function mostrarTitulo(conIntro = true) {
    J = nuevoEstado(null);
    J.introT = conIntro ? 0 : 99;
    J.dormido = conIntro;   // la portada espera a que toquen para «despertar»
    const orden = barajar(PERSONAJES);
    J.npcs = orden.map((p, i) => ({
      id: p.id, p, x: conIntro ? -20 : p.posicion, carril: p.carril, z: 0, vz: 0,
      fase: Math.random(), salida: 1.4 + i * 0.13, mov: false,
    }));
    J.jugador.x = conIntro ? -20 : J.jugador.x;
    J.jugador.salida = 3.3;
    const t = $('#pantalla-titulo');
    t.className = 'panel';
    $('#seleccion').hidden = true;
    $('#pantalla-final').hidden = true;
    $('#dialogo').hidden = true;
    $('#avisos').innerHTML = '';
    t.hidden = false;
    if (!conIntro) abrirMenu();
  }

  function animarTitulo(dt) {
    const t = $('#pantalla-titulo');
    t.classList.toggle('dormido', J.dormido);
    if (J.dormido) return;
    J.introT += dt;
    for (const [cls, desde] of FASES_INTRO) t.classList.toggle(cls, J.introT >= desde);
    for (const c of [...J.npcs, J.jugador]) {
      const obj = c === J.jugador ? 150 : c.p.posicion;
      if (J.introT < c.salida || c.x >= obj) { c.mov = false; continue; }
      c.x = Math.min(obj, c.x + 120 * dt);
      c.mov = c.x < obj;
    }
  }

  function saltarIntro() {
    J.introT = Math.max(J.introT, FIN_INTRO);
    for (const n of J.npcs) n.x = n.p.posicion;
    J.jugador.x = 150;
  }

  function abrirMenu() {
    saltarIntro();
    J.menu = true;
    $('#pantalla-titulo').classList.add('fase-menu');
    $('#seleccion').hidden = false;
  }

  function pulsarTitulo() {
    if (J.dormido) {
      J.dormido = false;
      Sonido.toca('despertador');
      return;
    }
    if (J.menu) return;
    if (J.introT < FIN_INTRO) saltarIntro();
    else abrirMenu();
  }

  function empezar(circ) {
    J = nuevoEstado(circ);
    pasarLista();
    $('#pantalla-titulo').hidden = true;
    $('#pantalla-final').hidden = true;
    $('#avisos').innerHTML = '';
    J.estado = 'quedada';
    // Emiliano para siempre entre el primer y el segundo tercio
    J.paradaKm = circ.distancia * (1 / 3 + Math.random() / 3);

    const [primera, ...resto] = QUEDADA.lineas;
    const lista = [primera, ['narrador', circ.salida]];
    if (J.ausentes.length) {
      const motivos = J.ausentes.map((a) => `${nombre(a.id)} (${a.excusa})`);
      lista.push(['narrador', `Hoy faltan ${J.ausentes.length}: ${enumerar(motivos)}.`]);
    } else {
      lista.push(['narrador', 'Hoy no falta nadie. ¡Pleno de gorilones!']);
    }
    lista.push(...resto);
    abrirDialogo({ lineas: lista }, 'narrador', () => {
      J.estado = 'carrera';
      aviso('¡A correr!');
    });
  }

  function cercano() {
    let mejor = null;
    let dmin = 12;
    for (const n of J.npcs) {
      if (n.oculto || n.fuera) continue;
      const d = Math.abs(n.x - J.jugador.x);
      if (d < dmin) { dmin = d; mejor = n; }
    }
    return mejor;
  }

  function hablar() {
    const n = cercano();
    if (!n) { aviso('Acércate a alguien para hablar.'); return; }
    if (J.pajara) { aviso('Vas sin aire. Ahora no puedes ni hablar.'); return; }
    const lista = CONVERSACIONES[n.id] || [];
    // salta las conversaciones que necesitan a alguien que hoy no ha venido
    while (J.conv[n.id] < lista.length && lista[J.conv[n.id]].requiere && !presente(lista[J.conv[n.id]].requiere)) J.conv[n.id]++;
    const i = J.conv[n.id];
    if (i < lista.length) {
      J.conv[n.id]++;
      J.charlas++;
      if (J.estado !== 'parada') J.energia = limitar(J.energia - 3, 0, 100);
      abrirDialogo(lista[i], n.id);
    } else {
      aviso(azar(FRASES_SUELTAS[n.id] || ['...']), n.id);
    }
  }

  function saltar() {
    if (J.estado !== 'carrera' || J.dialogo || J.jugador.z > 0) return;
    J.jugador.vz = 150;
    Sonido.toca('salto');
    J.energia = limitar(J.energia - 1, 0, 100);
  }

  function accion() {
    if (J.estado === 'titulo') return pulsarTitulo();
    if (J.dialogo) return avanzar();
    if (J.estado === 'carrera' || J.estado === 'parada') hablar();
  }

  // ------------------------------------------------- parada técnica
  function iniciarParada() {
    J.paradaHecha = true;
    if (!('emiliano' in J.amistad)) {
      aviso(PARADA_TECNICA.sinEmiliano, 'cesar' in J.amistad ? 'cesar' : null);
      return;
    }
    const campo = esTierra(J.scroll + 290);
    J.estado = 'parada';
    J.luz = false;
    J.parada = { fase: 'aviso', t: 16, x: 296, sitio: campo ? 'matorral' : 'contenedor' };
    const sitio = campo ? 'unos matorrales' : 'un contenedor';
    const inicio = {
      lineas: PARADA_TECNICA.inicio.lineas.map(([q, txt]) => [q, txt.replace('{sitio}', sitio)]),
    };
    abrirDialogo(inicio, 'narrador', () => { J.parada.fase = 'ida'; });
  }

  function esperarParada(dt) {
    const pa = J.parada;
    const emi = J.npcs.find((n) => n.id === 'emiliano');
    const jug = J.jugador;
    J.energia = limitar(J.energia + 8 * dt, 0, 100);
    J.pajara = J.pajara && J.energia < 35;
    // andar entre el grupo
    jug.mov = false;
    const dir = direccion();
    if (dir.der) { jug.x += 30 * dt; jug.mov = true; }
    if (dir.izq) { jug.x -= 30 * dt; jug.mov = true; }
    jug.x = limitar(jug.x, 24, 280);
    if (pa.fase === 'ida') {
      emi.fuera = true;
      emi.mov = true;
      emi.x += 70 * dt;
      if (emi.x >= pa.x) {
        emi.oculto = true;
        emi.mov = false;
        pa.fase = 'espera';
        aviso('Parada técnica. Aprovecha para charlar con alguien.');
      }
    } else if (pa.fase === 'espera') {
      pa.t -= dt;
      if (pa.t <= 0) { pa.fase = 'vuelta'; emi.oculto = false; }
    } else if (pa.fase === 'vuelta') {
      emi.mov = true;
      emi.x -= 60 * dt;
      if (emi.x <= emi.p.posicion) {
        emi.x = emi.p.posicion;
        emi.mov = false;
        emi.fuera = false;
        pa.fase = 'fin';
        abrirDialogo(PARADA_TECNICA.vuelta, 'emiliano', () => {
          J.estado = 'carrera';
          J.parada = null;
          aviso('¡Seguimos!');
        });
      }
    }
  }

  function quejicas() {
    return ['cesar', 'emiliano'].filter((id) => id in J.amistad);
  }

  function alternarLuz() {
    if (J.estado !== 'carrera' || J.dialogo) return;
    J.luz = !J.luz;
    if (J.luz) {
      aviso('Enciendes la frontal.', null, 'luz');
      J.gritoT = 0.7;
      J.gritos = 0;
    } else {
      aviso('Apagas la frontal.', null, 'luz');
      const q = quejicas();
      if (J.gritos > 0 && q.length) {
        const quien = azar(q);
        aviso(GRACIAS_LUZ[quien], quien);
      }
    }
  }

  function correrConLuz(dt) {
    const q = quejicas();
    if (!J.luz || !q.length) return;
    J.energia -= 7 * dt;   // con la recuperación normal, pierdes unos 4 por segundo
    J.gritoT -= dt;
    if (J.gritoT <= 0) {
      const quien = q[J.gritos % q.length];
      aviso(azar(GRITOS_LUZ[quien]), quien, 'grito');
      J.gritos++;
      J.gritoT = 1.8;
      if (J.gritos % 3 === 0) sumarAmistad(quien, -1);
    }
  }

  function dispararEvento(ev) {
    if (ev.requiere && ![].concat(ev.requiere).every(presente)) return;
    if (ev.accion === 'duro-on') J.duro = true;
    if (ev.accion === 'duro-off') J.duro = false;
    if (ev.accion === 'sprint') { J.sprint = true; Sonido.toca('silbato'); }
    if (ev.accion === 'perro') { J.perro = { x: 330, vida: 9 }; Sonido.toca('ladrido'); }
    if (ev.aviso && presente(ev.aviso[0])) aviso(ev.aviso[1], ev.aviso[0]);
    if (ev.dialogo) abrirDialogo(ev.dialogo, ev.quien || 'narrador');
  }

  // ------------------------------------------------------------ final
  function horaEn(km) {
    const min = 360 + Math.floor(km * MIN_KM);
    return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
  }

  function terminar() {
    J.estado = 'final';
    Sonido.toca('llegada');
    J.luz = false;
    teclas.izq = teclas.der = false;
    dedo.activo = false;
    const todos = [...J.npcs.map((n) => ({ id: n.id, x: n.x })), { id: 'tu', x: J.jugador.x }];
    todos.sort((a, b) => b.x - a.x);
    J.orden = todos.map((o) => o.id);
    mostrarFinal();
  }

  function mostrarFinal() {
    const paga = J.orden[J.orden.length - 1];
    const puesto = J.orden.indexOf('tu') + 1;
    const ranking = Object.entries(J.amistad).sort((a, b) => b[1] - a[1]);
    const [mejorId, mejorVal] = ranking[0];

    let titulo;
    if (J.charlas === 0) titulo = 'Corredor silencioso: no has dicho ni mu.';
    else if (J.charlas >= 10) titulo = 'Charlatán oficial: has hablado con todo el mundo.';
    else if (J.tropiezos >= 3) titulo = 'Tobillos de goma: no te has saltado ni un bache.';
    else if (J.charcosPisados >= 4) titulo = 'Pies mojados: ningún charco se te ha resistido.';
    else titulo = `Has charlado ${J.charlas} ${J.charlas === 1 ? 'vez' : 'veces'} por el camino.`;

    const el = $('#pantalla-final');
    el.innerHTML = '';
    const h = (tag, txt, cls) => {
      const e = document.createElement(tag);
      if (txt) e.textContent = txt;
      if (cls) e.className = cls;
      return e;
    };
    el.appendChild(h('h2', '¡En La Hormiga!'));
    el.appendChild(h('p', `Viernes, ${horaEn(distancia())} · ${J.circ.nombre} · ${distancia()} km`, 'sub'));
    el.appendChild(h('p', titulo));
    if (mejorVal > 0) el.appendChild(h('p', `Hoy has hecho buenas migas con ${nombre(mejorId)}.`));

    const cols = h('div', null, 'columnas');
    const c1 = h('div');
    c1.appendChild(h('h3', 'Orden de llegada'));
    const ol = h('ol');
    J.orden.forEach((id) => ol.appendChild(h('li', nombre(id), id === 'tu' ? 'yo' : '')));
    c1.appendChild(ol);
    const pagaTxt = paga === 'tu'
      ? 'Pagas tú los churros. Bienvenido de verdad a los Gorilones.'
      : `Paga los churros: ${nombre(paga)}.`;
    c1.appendChild(h('p', pagaTxt, 'paga'));
    if (paga !== 'tu') c1.appendChild(h('p', `Has llegado en el puesto ${puesto} de ${J.orden.length}.`, 'sub'));

    const c2 = h('div');
    c2.appendChild(h('h3', 'Amistad'));
    const ul = h('ul', null, 'amistad');
    ranking.forEach(([id, v]) => {
      const li = h('li');
      li.appendChild(h('span', nombre(id)));
      li.appendChild(h('span', v > 0 ? '♥'.repeat(Math.min(v, 8)) : '·', 'corazones'));
      ul.appendChild(li);
    });
    c2.appendChild(ul);
    if (J.ausentes.length) {
      c2.appendChild(h('p', `Faltaron: ${enumerar(J.ausentes.map((a) => nombre(a.id)))}.`, 'sub'));
    }

    // sobremesa: escenas en las que solo habla gente que ha venido
    const escenas = barajar(SOBREMESA.filter((e) => e.every(([q]) => presente(q)))).slice(0, 3);
    if (escenas.length) {
      const mesa = h('div', null, 'sobremesa');
      mesa.appendChild(h('h3', 'En la mesa'));
      for (const e of escenas) {
        const bloque = h('div', null, 'escena');
        for (const [q, txt] of e) {
          const linea = h('p', null, q === 'narrador' ? 'narra' : '');
          if (q !== 'narrador') linea.appendChild(h('b', `${nombre(q)}: `));
          linea.appendChild(document.createTextNode(txt));
          bloque.appendChild(linea);
        }
        mesa.appendChild(bloque);
      }
      el.appendChild(mesa);
    }

    const c3 = h('div');
    c3.appendChild(h('h3', 'Lo que pide cada uno'));
    const ul2 = h('ul', null, 'pedidos');
    J.npcs.forEach((n) => ul2.appendChild(h('li', `${n.p.nombre}: ${n.p.pedido}`)));
    c3.appendChild(ul2);

    cols.append(c1, c2, c3);
    el.appendChild(cols);
    const b = h('button', 'Otro viernes');
    b.addEventListener('click', () => mostrarTitulo(false));
    el.appendChild(b);
    el.hidden = false;
  }

  // ------------------------------------------------------------ bucle
  function correr(dt) {
    const dist = distancia();
    const velKm = 1 / SEG_KM;
    J.km += velKm * dt;
    J.scroll = J.km * PX_KM;
    const jug = J.jugador;

    // tramo
    const t = tramoEn(J.km);
    if (t !== J.tramo) {
      J.tramo = t;
      if (t > 0) aviso(`📍 ${J.circ.tramos[t].nombre}`, null, 'tramo');
    }

    // energía y posición en el grupo
    const dir = direccion();
    if (dir.der && !J.pajara && !(jug.tropiezo > 0)) {
      jug.x += 45 * dt;
      J.energia -= (J.sprint ? 11 : 9) * dt;
    } else if (dir.izq) {
      jug.x -= 45 * dt;
      J.energia += 5 * dt;
    } else {
      J.energia += 3 * dt;
    }
    if (J.duro) J.energia -= 4 * dt;
    correrConLuz(dt);
    // Toty anima al que va justo de fuerzas
    J.animoT -= dt;
    if (J.energia < 25 && J.animoT <= 0 && 'toty' in J.amistad) {
      J.animoT = 25;
      J.energia += 15;
      aviso(azar(ANIMOS_TOTY), 'toty', 'animo');
    }
    if (J.pajara) {
      jug.x -= 25 * dt;
      if (J.energia >= 35) { J.pajara = false; aviso('Recuperas el aliento.'); }
    }
    J.energia = limitar(J.energia, 0, 100);
    if (J.energia <= 0 && !J.pajara) {
      J.pajara = true;
      aviso('¡Pájara! Te quedas atrás...', null, 'pajara');
    }
    jug.x = limitar(jug.x, 24, 296);

    // compañeros
    for (const n of J.npcs) {
      let obj = n.p.posicion + 7 * Math.sin(J.t * 0.3 + n.ruido);
      if (J.duro) obj += n.p.posicion < 130 ? -35 : n.p.posicion > 230 ? 12 : -8;
      if (n.acelerado > 0) { n.acelerado -= dt; obj = 290; }
      if (J.sprint) obj = 110 + n.p.sprint * 175 + 4 * Math.sin(J.t + n.ruido);
      const vel = J.sprint ? 30 : 18;
      const d = obj - n.x;
      n.x += Math.sign(d) * Math.min(Math.abs(d), vel * dt);
    }

    // obstáculos: charcos, baches y bordillos (en tierra, piedras en vez de bordillos)
    if (J.km < dist - 0.3 && J.scroll + W + 20 > J.sigCharco) {
      const wx = J.sigCharco;
      const tierra = esTierra(wx);
      const tipo = azar(tierra ? ['charco', 'bache', 'piedra'] : ['charco', 'charco', 'bache', 'bordillo']);
      J.charcos.push({ wx, tipo, tierra, tocado: false, saltaron: new Set() });
      J.sigCharco += 150 + Math.random() * 230;
    }
    if (jug.tropiezo > 0) jug.tropiezo -= dt;
    for (const c of J.charcos) {
      const sx = c.wx - J.scroll;
      const ancho = c.tipo === 'bordillo' ? 4 : 5;
      if (!c.tocado && Math.abs(sx - jug.x) < ancho && jug.z < 2) {
        c.tocado = true;
        const testigo = J.npcs.reduce((a, b) => (Math.abs(a.x - jug.x) < Math.abs(b.x - jug.x) ? a : b));
        if (c.tipo === 'charco') {
          J.charcosPisados++;
          Sonido.toca('charco');
          J.energia = limitar(J.energia - 8, 0, 100);
          aviso(azar(FRASES_CHARCO), testigo.id);
        } else {
          J.tropiezos++;
          Sonido.toca('tropiezo');
          const fuerte = c.tipo === 'bordillo';
          J.energia = limitar(J.energia - (fuerte ? 12 : 10), 0, 100);
          jug.x -= fuerte ? 22 : 14;
          jug.tropiezo = fuerte ? 1.2 : 0.6;
          aviso(azar(FRASES_OBSTACULO[c.tipo]), testigo.id);
        }
      }
      for (const n of J.npcs) {
        if (!c.saltaron.has(n.id) && Math.abs(sx - n.x) < 9 && n.z === 0) {
          c.saltaron.add(n.id);
          n.vz = 110;
        }
      }
    }
    J.charcos = J.charcos.filter((c) => c.wx - J.scroll > -30);

    // perro
    if (J.perro) {
      const pr = J.perro;
      pr.vida -= dt;
      if (pr.vida > 0) {
        const obj = 170 + 60 * Math.sin(J.t * 0.8);
        pr.x += Math.sign(obj - pr.x) * Math.min(Math.abs(obj - pr.x), 60 * dt);
      } else {
        pr.x += 120 * dt;
        if (pr.x > W + 30) J.perro = null;
      }
    }

    if (!J.paradaHecha && J.km >= J.paradaKm) { iniciarParada(); return; }

    // sucesos
    const evs = J.circ.eventos;
    for (let i = 0; i < evs.length; i++) {
      if (!J.hechos.has(i) && J.km >= evs[i].km) {
        J.hechos.add(i);
        dispararEvento(evs[i]);
        break;
      }
    }

    if (J.km >= dist) terminar();
  }

  function fisicaSaltos(dt) {
    for (const c of [J.jugador, ...J.npcs]) {
      if (c.z > 0 || c.vz > 0) {
        c.z += c.vz * dt;
        c.vz -= 420 * dt;
        if (c.z <= 0) { c.z = 0; c.vz = 0; }
      }
    }
  }

  function actualizar(dt) {
    J.t += dt;
    const d = J.dialogo;
    if (d && d.vis < d.texto.length) d.vis = Math.min(d.texto.length, d.vis + dt * 55);
    if (d && Math.floor(d.vis) !== d.mostrado) {
      const antes = d.mostrado;
      d.mostrado = Math.floor(d.vis);
      $('#dlg-texto').textContent = d.texto.slice(0, d.mostrado);
      // pitido de máquina de escribir, una de cada tres letras
      if (antes >= 0 && Math.floor(d.mostrado / 3) !== Math.floor(antes / 3) && d.texto[d.mostrado - 1] !== ' ') Sonido.toca('letra');
    }
    if (J.estado === 'titulo') animarTitulo(dt);
    if (J.estado === 'carrera' && !J.dialogo) correr(dt);
    if (J.estado === 'parada' && !J.dialogo) esperarParada(dt);
    fisicaSaltos(dt);
    actualizarHud();
  }

  function actualizarHud() {
    // los botones sobran en la portada, en el final y mientras hay diálogo
    document.body.classList.toggle('sin-controles', !!J.dialogo || J.estado === 'titulo' || J.estado === 'final');
    const visible = ['carrera', 'quedada', 'parada'].includes(J.estado);
    $('#hud').hidden = !visible;
    if (!visible) return;
    const barra = $('#energia i');
    barra.style.width = `${J.energia}%`;
    barra.style.background = J.pajara ? '#e04848' : J.energia < 30 ? '#f0a23a' : '#5cd16a';
    $('#km').textContent = `${J.km.toFixed(1).replace('.', ',')} / ${distancia()} km`;
    $('#tramo').textContent = J.circ.tramos[tramoEn(J.km)].nombre;
    $('#btn-luz').classList.toggle('activo', J.luz);
    $('#hora').textContent = horaEn(J.km);
    $('#btn-hablar').classList.toggle('activo', ['carrera', 'parada'].includes(J.estado) && !J.dialogo && !!cercano());
  }

  function dibujar() {
    const final = J.estado === 'final';
    const p = final ? 1 : J.km / distancia();
    Dibujo.fondo(ctx, p, J.scroll, escenarioEn);


    if (final) {
      Dibujo.fachada(ctx, 95);
      const paso = (W - 32) / Math.max(1, J.orden.length - 1);
      J.orden.forEach((id, i) => {
        const x = 16 + i * paso;
        const carril = (i % 2) * 8;
        const cab = Dibujo.corredor(ctx, aspecto(id), x, Y_BASE + carril, J.t, { quieto: true });
        if (i === 0) Dibujo.flecha(ctx, x, cab - 2);
        if (i === J.orden.length - 1) Dibujo.moneda(ctx, x, cab - 6);
      });
      return;
    }

    for (const e of elementos()) {
      const sx = e.wx - J.scroll;
      if (sx < -140 || sx > W + 100) continue;
      if (e.tipo === 'stop') Dibujo.stop(ctx, sx);
      if (e.tipo === 'semaforo') Dibujo.semaforo(ctx, sx, J.km < e.km + 0.05);
      if (e.tipo === 'hito') Dibujo.hito(ctx, e.hito.tipo, sx, e.hito.texto, p, J.t);
      if (e.tipo === 'hormiga') Dibujo.fachada(ctx, sx);
    }
    const osc = oscuridadEn(J.km);
    if (!(osc > 0.5 && !J.luz)) {
      for (const c of J.charcos) Dibujo.obstaculo(ctx, c.tipo, c.wx - J.scroll, p, c.tierra);
    }
    if (J.perro) Dibujo.perro(ctx, J.perro.x, Y_BASE + 15, J.t);
    if (J.parada) {
      if (J.parada.sitio === 'matorral') Dibujo.matorral(ctx, J.parada.x + 4, p);
      else Dibujo.contenedor(ctx, J.parada.x + 4, p);
    }

    const quieto = J.estado === 'quedada' || J.estado === 'parada';
    const cadencia = J.duro ? 7 : J.sprint ? 14 : 10;
    const cerca = ['carrera', 'parada'].includes(J.estado) && !J.dialogo ? cercano() : null;
    const lista = [...J.npcs, J.jugador].sort((a, b) => a.carril - b.carril);
    for (const c of lista) {
      if (c.oculto) continue;
      const parado = J.estado === 'titulo' || J.estado === 'parada' ? !c.mov : quieto;
      const cab = Dibujo.corredor(ctx, aspecto(c.id), c.x, Y_BASE + c.carril, J.t, {
        z: c.z, quieto: parado, cadencia, fase: c.fase,
      });
      c.cab = cab - Math.round(c.z);
      const top = cab - Math.round(c.z);
      if (c === J.jugador) {
        if (J.pajara || c.tropiezo > 0) Dibujo.estrellitas(ctx, c.x, top - 3, J.t);
        else Dibujo.flecha(ctx, c.x, top - 2);
      }
      if (c === cerca) Dibujo.bocadillo(ctx, c.x + 2, top - 2);
      if (J.duro && !quieto && Math.sin(J.t * 6 + c.x) > 0.6) Dibujo.gota(ctx, c.x - 4, top + 1);
    }

    // oscuridad y frontal
    if (osc > 0) {
      const jug = J.jugador;
      Dibujo.oscuridad(ctx, osc, J.luz ? { x: jug.x, y: jug.cab + 3 } : null);
      if (J.estado === 'carrera' || J.estado === 'parada') {
        if (J.pajara) Dibujo.estrellitas(ctx, jug.x, jug.cab - 3, J.t);
        else Dibujo.flecha(ctx, jug.x, jug.cab - 2);
        if (cerca) Dibujo.bocadillo(ctx, cerca.x + 2, cerca.cab - 2);
      }
    }
  }

  let ultimo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    actualizar(dt);
    dibujar();
    requestAnimationFrame(bucle);
  }

  // ------------------------------------------------------------ menú
  const menu = $('#circuitos');
  CIRCUITOS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'circuito';
    b.textContent = c.nombre;
    b.title = `${c.nombre} (tecla ${i + 1})`;
    b.addEventListener('click', (e) => { e.stopPropagation(); Sonido.toca('menu'); empezar(c); });
    menu.appendChild(b);
  });

  // ------------------------------------------------------------ entrada
  window.addEventListener('pointerdown', () => Sonido.iniciar(), true);
  function pintarSonido() { $('#btn-sonido').textContent = Sonido.silencio ? '🔇' : '🔊'; }
  pintarSonido();
  $('#btn-sonido').addEventListener('click', (e) => { e.stopPropagation(); Sonido.alternar(); pintarSonido(); });
  $('#btn-sonido').addEventListener('pointerdown', (e) => e.stopPropagation());
  window.addEventListener('keydown', (e) => {
    Sonido.iniciar();
    const k = e.key;
    if (k === 'm' || k === 'M') { Sonido.alternar(); pintarSonido(); return; }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(k)) e.preventDefault();
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') teclas.izq = true;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') teclas.der = true;
    if (e.repeat) return;
    if (J.estado === 'titulo') {
      const n = Number(k);
      if (J.menu && n >= 1 && n <= CIRCUITOS.length) empezar(CIRCUITOS[n - 1]);
      else pulsarTitulo();
      return;
    }
    if (k === 'l' || k === 'L') return alternarLuz();
    if (k === 'ArrowUp' || k === 'w' || k === 'W') saltar();
    else if (k === ' ' || k === 'Enter' || k === 'e' || k === 'E') accion();
    else if (['1', '2', '3', '4'].includes(k)) elegir(Number(k) - 1);
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') teclas.izq = false;
    if (k === 'ArrowRight' || k === 'd' || k === 'D') teclas.der = false;
  });
  window.addEventListener('blur', () => { teclas.izq = teclas.der = false; });

  // botones táctiles: ◀ ▶ se mantienen pulsados
  for (const b of document.querySelectorAll('#controles button')) {
    const a = b.dataset.accion;
    const pulsar = (e) => {
      e.preventDefault();
      if (a === 'izq' || a === 'der') teclas[a] = true;
      else if (a === 'saltar') saltar();
      else if (a === 'hablar') accion();
      else if (a === 'luz') alternarLuz();
    };
    const soltar = () => { if (a === 'izq' || a === 'der') teclas[a] = false; };
    b.addEventListener('pointerdown', pulsar);
    b.addEventListener('pointerup', soltar);
    b.addEventListener('pointerleave', soltar);
    b.addEventListener('pointercancel', soltar);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  $('#dialogo').addEventListener('click', avanzar);

  // dedo sobre el juego: tocar delante/detrás para moverse, deslizar hacia
  // arriba para saltar, tocar al compañero del bocadillo para hablar
  const zona = $('#juego');
  function aJuego(e) {
    const r = lienzo.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * Dibujo.H };
  }
  zona.addEventListener('pointerdown', (e) => {
    if (e.target !== lienzo && e.target !== zona) return;
    if (!['carrera', 'parada'].includes(J.estado) || J.dialogo) return;
    const p = aJuego(e);
    const n = cercano();
    if (n && p.y < Dibujo.H && Math.abs(p.x - n.x) < 12 && Math.abs(p.x - J.jugador.x) > 2) {
      hablar();
      return;
    }
    dedo.activo = true;
    dedo.id = e.pointerId;
    dedo.x = p.x;
    dedo.y0 = e.clientY;
    dedo.saltado = false;
    try { zona.setPointerCapture(e.pointerId); } catch (err) { /* puntero sintético */ }
    e.preventDefault();
  });
  zona.addEventListener('pointermove', (e) => {
    if (!dedo.activo || e.pointerId !== dedo.id) return;
    dedo.x = aJuego(e).x;
    if (!dedo.saltado && dedo.y0 - e.clientY > 30) { saltar(); dedo.saltado = true; }
  });
  const soltarDedo = (e) => { if (e.pointerId === dedo.id) dedo.activo = false; };
  zona.addEventListener('pointerup', soltarDedo);
  zona.addEventListener('pointercancel', soltarDedo);
  $('#pantalla-titulo').addEventListener('click', pulsarTitulo);

  mostrarTitulo();
  requestAnimationFrame(bucle);

  // Para pruebas desde la consola del navegador.
  window.gorilones = { dedo, estado: () => J, empezar, terminar, CIRCUITOS, paso: (dt) => actualizar(dt) };
})();
