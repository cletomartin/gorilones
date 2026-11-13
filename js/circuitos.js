'use strict';
// =====================================================================
//  CIRCUITOS
//  - distancia: km totales. La partida dura unos 14 s por km.
//  - tramos: qué paisaje se ve en cada parte. Escenarios disponibles:
//      ciudad, barrio, cementerio, universidad, estacion, gofit,
//      parque, viaverde, campo, poblachuela
//  - hitos: los sitios por los que se pasa, dibujados en grande.
//    Tipos: parque, viaverde, barrio, cementerio, universidad, estacion, gofit,
//           cortijo, poblachuela. «texto» es lo que pone el cartel.
//  - eventos: sucesos por kilómetro. Acciones posibles:
//      'duro-on' / 'duro-off' (tramo que cansa el doble), 'perro', 'sprint'
//    (el formato de dialogo es el mismo que en conversaciones.js;
//     una opción con requiere: 'id' solo sale si esa persona ha venido;
//     un evento con requiere: 'id' no ocurre si esa persona no ha venido)
//  - oscuros: tramos sin ninguna luz (no se ven ni los charcos). Ahí se puede
//    encender la frontal... y a Emiliano y a César no les hace ninguna gracia.
//  Para que un diálogo salga delante de un sitio, ponlo ~0,03 km después
//  del hito.
//  Distancias y orden de los tramos: PROVISIONALES, hay que ajustarlos.
// =====================================================================

const CIRCUITOS = [
  {
    id: 'urbano',
    nombre: 'Urbano',
    descripcion: 'Vuelta a Ciudad Real: El Cerrillo, el cementerio, la UCLM, la estación del AVE, el Go Fit y a La Hormiga.',
    distancia: 9,
    stop: true,
    oscuros: [],
    salida: 'Quedada en la ciudad. Las farolas todavía encendidas.',
    tramos: [
      { hasta: 1.5, escenario: 'ciudad', nombre: 'Ciudad Real' },
      { hasta: 3.2, escenario: 'barrio', nombre: 'El Cerrillo' },
      { hasta: 4.6, escenario: 'cementerio', nombre: 'Cementerio' },
      { hasta: 5.8, escenario: 'universidad', nombre: 'UCLM' },
      { hasta: 6.8, escenario: 'estacion', nombre: 'Estación del AVE' },
      { hasta: 7.8, escenario: 'gofit', nombre: 'Go Fit' },
      { hasta: 99, escenario: 'ciudad', nombre: 'Hacia La Hormiga' },
    ],
    hitos: [
      { km: 1.9, tipo: 'barrio', texto: 'EL CERRILLO' },
      { km: 3.6, tipo: 'cementerio', texto: 'CEMENTERIO' },
      { km: 5.0, tipo: 'universidad', texto: 'UCLM' },
      { km: 6.2, tipo: 'estacion', texto: 'ESTACIÓN' },
      { km: 7.2, tipo: 'gofit', texto: 'GO FIT' },
    ],
    semaforos: [1.0],
    eventos: [
      {
        km: 1.0,
        dialogo: {
          lineas: [
            ['narrador', 'Semáforo en rojo. Nadie cruza: los Gorilones dan ejemplo.'],
            ['mario', 'David, aprovecha y cuéntanos lo del Gobierno, que tenemos tiempo.'],
            ['david', 'No.'],
            ['cleto', 'Esto me estropea la media.'],
          ],
        },
      },
      {
        km: 1.93,
        dialogo: {
          lineas: [
            ['narrador', 'Entráis en El Cerrillo. Casas bajas, chapas y ropa tendida. Alguna ventana ya encendida.'],
            ['eduardo', '¡Buenos días! (Aquí siempre hay alguien que madruga más que nosotros.)'],
          ],
        },
      },
      {
        km: 2.6, accion: 'perro',
        dialogo: {
          lineas: [['narrador', 'Un perro sale de un portal y se pone a correr con el grupo.']],
          opciones: [
            { texto: 'Le das una caricia sin parar.', amistad: { mario: 1, javi: 1 }, energia: -3,
              respuesta: [['mario', 'Mira, otro gorilón. Este sí que sabe correr.']] },
            { texto: 'Le echas una carrera.', amistad: { pedro: 2 }, energia: -10,
              respuesta: [['pedro', '¡Eso! ¡Gánale!'], ['narrador', 'El perro te gana. Con claridad.']] },
            { texto: 'Te escondes detrás de David.', requiere: 'david', amistad: { david: 1, cesar: 1 }, energia: -2,
              respuesta: [['david', '...'], ['cesar', 'Yo también me escondo, que hay sitio.']] },
          ],
        },
      },
      {
        km: 3.63,
        dialogo: {
          lineas: [
            ['narrador', 'Pasáis por la puerta del cementerio. Silencio total, solo se oyen las zapatillas.'],
            ['eduardo', 'Aquí a estas horas no se oye ni un alma.'],
            ['javi', 'Eduardo, por favor.'],
          ],
        },
      },
      {
        km: 4.3,
        dialogo: {
          lineas: [
            ['narrador', 'Alguien saca el balonmano y empiezan las batallitas.'],
            ['cesar', '¿Os acordáis de aquel partido que remontamos en el último minuto?'],
            ['agustito', '¡Si yo metí siete goles!'],
            ['emiliano', 'Tres. Metiste tres.'],
            ['antonio', 'Pues yo me acuerdo de que el árbitro estaba comprado.'],
            ['eduardo', 'Ya están. Mario, Javi y yo nos vamos a hablar de otra cosa.'],
            ['javi', 'Yo no jugué, pero os habría hecho correr el doble.'],
          ],
        },
      },
      {
        km: 5.03,
        dialogo: {
          lineas: [
            ['narrador', 'El campus de la UCLM está vacío. Ni un estudiante despierto.'],
            ['pedro', 'Los universitarios se acuestan a la hora que nosotros nos levantamos.'],
          ],
        },
      },
      {
        km: 6.23,
        dialogo: {
          lineas: [
            ['narrador', 'Pasáis por la estación del AVE. Arriba, el primer tren de la mañana sale hacia Madrid.'],
            ['pedro', 'Algún día le echo una carrera al AVE.'],
            ['cesar', 'Yo me subo. Y que me esperen en La Hormiga.'],
          ],
        },
      },
      {
        km: 7.23,
        dialogo: {
          lineas: [
            ['narrador', 'Por la cristalera del Go Fit se ve a gente corriendo en cinta.'],
            ['emiliano', 'Ellos corren mirando una pared. Nosotros, viendo amanecer.'],
          ],
        },
      },
      { km: 8.0, aviso: ['javi', '¿Lo oléis? Huele a churros. Ya estamos cerca.'] },
      {
        km: 8.3, accion: 'sprint',
        dialogo: {
          lineas: [
            ['javi', '¡Último tramo! ¡Ya sabéis la norma: el último paga los churros!'],
            ['pedro', '¡Nos vemos en la puerta!'],
            ['toty', '¡Vamos todos, que aquí no se queda nadie!'],
            ['narrador', 'Mantén ▶ para apretar. Si te quedas sin energía, te vas atrás.'],
          ],
        },
      },
    ],
  },

  {
    id: 'poblachuela',
    nombre: 'La Poblachuela',
    descripcion: 'Del Parque de Gasset a la Vía Verde, vuelta por el campo y las casas de La Poblachuela, y regreso.',
    distancia: 12,
    stop: false,
    oscuros: [{ desde: 1.6, hasta: 3.3 }, { desde: 3.8, hasta: 4.4 }],
    salida: 'Quedada en la puerta del Parque de Gasset. Todavía no se ven ni los patos.',
    tramos: [
      { hasta: 1.2, escenario: 'parque', nombre: 'Parque de Gasset' },
      { hasta: 4.0, escenario: 'viaverde', nombre: 'Vía Verde' },
      { hasta: 6.8, escenario: 'campo', nombre: 'Por el campo' },
      { hasta: 8.4, escenario: 'poblachuela', nombre: 'La Poblachuela' },
      { hasta: 10.8, escenario: 'viaverde', nombre: 'Vía Verde (vuelta)' },
      { hasta: 99, escenario: 'ciudad', nombre: 'Hacia La Hormiga' },
    ],
    hitos: [
      { km: 0, tipo: 'parque', texto: 'PARQUE DE GASSET' },
      { km: 1.3, tipo: 'viaverde', texto: 'VÍA VERDE' },
      { km: 5.0, tipo: 'cortijo', texto: '' },
      { km: 6.9, tipo: 'poblachuela', texto: 'La Poblachuela' },
      { km: 8.5, tipo: 'viaverde', texto: 'VÍA VERDE' },
    ],
    semaforos: [],
    eventos: [
      {
        km: 1.33,
        dialogo: {
          lineas: [
            ['narrador', 'Entráis en la Vía Verde. Sin coches ni semáforos: solo camino.'],
            ['eduardo', '¡Aquí se habla tranquilo: ni coches, ni semáforos, ni padres de alumnos!'],
            ['cleto', 'Y el GPS no pierde la señal. Todo ventajas.'],
          ],
        },
      },
      {
        km: 1.62,
        dialogo: {
          lineas: [
            ['narrador', 'Se acaban las farolas. No se ve nada de nada: ni el camino, ni los charcos.'],
            ['narrador', 'Llevas una frontal en el bolsillo. Pulsa LUZ (tecla L) para encenderla.'],
          ],
        },
      },
      {
        km: 2.4, requiere: 'cleto',
        dialogo: {
          lineas: [
            ['narrador', 'Sin farolas, el cielo está lleno de estrellas.'],
            ['eduardo', 'Cleto, Cleto... ¿qué estrella es esa?'],
            ['cleto', 'Esa es Venus. Bueno, en realidad es un planeta.'],
            ['mario', '¡El astrónomo! ¿Y aquella de allí?'],
            ['cleto', 'Eso es la luz de un avión, Mario.'],
            ['narrador', 'Risas generales. Cleto sigue a su ritmo, mirando el reloj.'],
          ],
        },
      },
      { km: 3.8, aviso: ['narrador', 'Otra vez a oscuras. No se ve ni el camino.'] },
      {
        km: 4.5,
        dialogo: {
          lineas: [
            ['narrador', 'Un rebaño de ovejas cruza el camino. Toca esperar.'],
            ['cesar', 'Por fin una pausa. Gracias, ovejas.'],
            ['david', '...'],
          ],
        },
      },
      {
        km: 5.03,
        dialogo: {
          lineas: [
            ['narrador', 'Pasáis junto a una casa de labor. Un gallo canta, tarde como siempre.'],
            ['mario', 'Ese gallo se levanta después que nosotros. Vergüenza le tenía que dar.'],
          ],
        },
      },
      {
        km: 5.5, accion: 'duro-on',
        dialogo: {
          lineas: [
            ['narrador', 'El camino está lleno de barro. Aquí la energía se va el doble de rápido.'],
            ['mario', 'Pisad por el centro, que es donde menos se hunde.'],
            ['emiliano', '¿Os quejáis del barro? Sois unas mariconas.'],
          ],
        },
      },
      { km: 6.4, accion: 'duro-off', aviso: ['cesar', '¡Salimos del barro! ¡SIGO VIVO!'] },
      {
        km: 6.93,
        dialogo: {
          lineas: [
            ['narrador', 'Llegáis a La Poblachuela. Chalets, setos y algún aspersor regando.'],
            ['toty', 'Cuidado con los aspersores, que no avisan.'],
          ],
        },
      },
      {
        km: 7.5, accion: 'perro',
        dialogo: {
          lineas: [['narrador', 'Detrás de la valla de un chalet, un perro ladra y os sigue de un lado a otro.']],
          opciones: [
            { texto: 'Le saludas al pasar.', amistad: { mario: 1, javi: 1 }, energia: -2,
              respuesta: [['javi', 'Este perro ya nos conoce. Todos los viernes sale a protestar.']] },
            { texto: 'Le echas una carrera a lo largo de la valla.', amistad: { pedro: 2 }, energia: -10,
              respuesta: [['pedro', '¡Eso! ¡Gánale!'], ['narrador', 'El perro te gana. Y sin salir de su jardín.']] },
            { texto: 'Te pones al otro lado de David.', requiere: 'david', amistad: { david: 1, cesar: 1 }, energia: -2,
              respuesta: [['david', '...'], ['cesar', 'Buena idea. Yo también.']] },
          ],
        },
      },
      {
        km: 8.53,
        dialogo: {
          lineas: [
            ['narrador', 'Vuelta por la Vía Verde. Ya ha salido el sol.'],
            ['antonio', 'Mira qué luz. Por esto merece la pena madrugar.'],
          ],
        },
      },
      { km: 11.0, aviso: ['javi', '¿Lo oléis? Huele a churros. Ya estamos cerca.'] },
      {
        km: 11.3, accion: 'sprint',
        dialogo: {
          lineas: [
            ['javi', '¡Último tramo! ¡Ya sabéis la norma: el último paga los churros!'],
            ['pedro', '¡Nos vemos en la puerta!'],
            ['toty', '¡Vamos todos, que aquí no se queda nadie!'],
            ['narrador', 'Mantén ▶ para apretar. Si te quedas sin energía, te vas atrás.'],
          ],
        },
      },
    ],
  },
];
