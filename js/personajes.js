'use strict';
// =====================================================================
//  LOS GORILONES
//  Aspecto sacado de la foto (1-8). Los que no salen en ella (9-12) tienen
//  un aspecto provisional hasta que alguien los describa.
//  Las personalidades (descripcion, pedido, conversaciones) siguen siendo
//  PROVISIONALES: hay que cambiarlas por las reales.
//
//  Campos de "aspecto":
//    piel, pelo ('corto' | 'rapado' | 'calvo'), colorPelo,
//    barba (color o null), gafas (true/false), altura (-1 a 3 píxeles; -1 = el más bajito),
//    pantalon (color), rayas (true = rayas blancas en el pantalón),
//    mallas (true = pantalón largo), zapatillas (color),
//    chaqueta (true = mangas largas naranja/celeste; false = camiseta),
//    gorro, braga, guantes (colores; para los frioleros).
//
//  Han jugado al balonmano todos menos Mario, Eduardo y Javi.
//
//  posicion: dónde suele ir en el grupo (x en pantalla: 90 detrás, 260 delante)
//  carril:   profundidad en la acera (0 al fondo, 14 delante)
//  sprint:   0-1, lo fuerte que acaba en el sprint final
// =====================================================================

const NARANJA = '#f0862a';
const CELESTE = '#56b4e9';

const JUGADOR = {
  id: 'tu',
  nombre: 'Tú',
  aspecto: {
    piel: '#e9b896', pelo: 'corto', colorPelo: '#5a3a24', barba: null,
    gafas: false, altura: 1, pantalon: '#1c1c22', mallas: false,
    zapatillas: '#e8e8e8', chaqueta: true,
  },
};

const PERSONAJES = [
  // 1 · abajo delante, el del selfie
  {
    id: 'eduardo',
    nombre: 'Eduardo',
    descripcion: 'Simpático y bromista: siempre tiene una buena respuesta. Director y profesor del colegio del Quijote. Sale en el selfie.',
    pedido: 'un solo doble',
    posicion: 200, carril: 12, sprint: 0.6,
    aspecto: {
      piel: '#e3aa86', pelo: 'rapado', colorPelo: '#9a9a9a', barba: '#a8a8a8',
      gafas: false, altura: 1, pantalon: '#22252c', mallas: false,
      zapatillas: '#d9d9d9', chaqueta: true,
    },
  },
  // 2 · a la izquierda, de pie delante
  {
    id: 'cesar',
    nombre: 'César',
    descripcion: 'Gemelo de Emiliano. Profesor de Educación Física y ex entrenador de balonmano. No soporta que se encienda una luz.',
    pedido: 'un solo doble',
    posicion: 120, carril: 14, sprint: 0.5,
    // gemelo de Emiliano: misma cara, pelo y altura; cambia la ropa
    aspecto: {
      piel: '#e3aa86', pelo: 'corto', colorPelo: '#6b4a30', barba: null,
      gafas: false, altura: 2, pantalon: '#2a2a33', mallas: false,
      zapatillas: '#ff7a3d', chaqueta: true,
    },
  },
  // 3 · arriba a la izquierda, detrás
  {
    id: 'emiliano',
    nombre: 'Emiliano',
    descripcion: 'Gemelo de César. Profesor de Educación Física en el colegio del Quijote y ex entrenador de balonmano. Se enfada si alguien enciende una luz y para siempre a mitad de carrera.',
    pedido: 'un solo doble',
    posicion: 225, carril: 5, sprint: 0.7,
    aspecto: {
      piel: '#e3aa86', pelo: 'corto', colorPelo: '#6b4a30', barba: null,
      gafas: false, altura: 2, pantalon: '#1e2028', mallas: false,
      zapatillas: '#6a7078', chaqueta: true,
    },
  },
  // 4 · arriba, segundo por la izquierda
  {
    id: 'javi',
    nombre: 'Javi',
    descripcion: 'El organizador: manda el mensaje al grupo a las 5:45 y pasa lista. Preparador físico del Caserío y dueño de un gimnasio.',
    pedido: 'café con leche',
    posicion: 160, carril: 6, sprint: 0.4,
    aspecto: {
      piel: '#e6ad88', pelo: 'corto', colorPelo: '#1e1a18', barba: '#2a2420',
      gafas: false, altura: 1, pantalon: '#2a2d36', mallas: false,
      zapatillas: '#4fa3e0', chaqueta: false,
    },
  },
  // 5 · arriba en el centro
  {
    id: 'mario',
    nombre: 'Mario',
    descripcion: 'Ingeniero de sistemas empotrados. Simpático y bromista, corre hablando y le encanta picar a David.',
    pedido: 'un solo doble',
    posicion: 145, carril: 3, sprint: 0.45,
    aspecto: {
      piel: '#e6b08c', pelo: 'corto', colorPelo: '#c9c9c9', barba: '#d2d2d2',
      gafas: false, altura: 1, pantalon: '#6a6d74', mallas: false,
      zapatillas: '#7d3cb5', chaqueta: true,
    },
  },
  // 6 · en el centro, delante
  {
    id: 'cleto',
    nombre: 'Cleto',
    descripcion: 'Ingeniero informático. Entrena con entrenador y no se salta el plan; serio con los ritmos, va con David a la cabeza. Las constelaciones y las mallas verdes.',
    pedido: 'un descafeinado con leche',
    posicion: 248, carril: 3, sprint: 0.75,
    aspecto: {
      piel: '#eab793', pelo: 'corto', colorPelo: '#2b2018', barba: '#2b2018',
      gafas: true, altura: 0, pantalon: '#2f9a4a', mallas: true,
      zapatillas: '#e8e23a', chaqueta: false,
    },
  },
  // 7 · a la derecha, el alto
  {
    id: 'david',
    nombre: 'David',
    descripcion: 'Abogado. Muy serio y muy buena persona; el grupo se mete mucho con él. Se pone negro hablando de política.',
    pedido: 'un solo (churros, nunca)',
    posicion: 260, carril: 1, sprint: 0.8,
    aspecto: {
      piel: '#e3a985', pelo: 'calvo', colorPelo: '#7a5a40', barba: '#8a6a4a',
      gafas: false, altura: 3, pantalon: '#141a2e', rayas: true, mallas: false,
      zapatillas: '#9aa0a6', chaqueta: true,
    },
  },
  // 8 · a la derecha del todo
  {
    id: 'pedro',
    nombre: 'Pedro',
    descripcion: 'Habla mucho (de su trabajo, no). Muy aficionado al balonmano. Pica a David con la política a base de preguntas. Siempre tiene frío y va muy abrigado.',
    pedido: 'café con leche',
    posicion: 245, carril: 11, sprint: 0.7,
    aspecto: {
      piel: '#f0c2a0', pelo: 'corto', colorPelo: '#6a4428', barba: null,
      gafas: false, altura: 2, pantalon: '#16161a', mallas: true,
      zapatillas: '#34343c', chaqueta: true,
      gorro: '#2b3f6b', braga: '#3a3a44', guantes: '#22232a',
    },
  },
  // 9-12 · no salen en la foto: aspecto PROVISIONAL
  {
    id: 'toty',
    nombre: 'Toty',
    descripcion: 'Hermano pequeño de David. Ha corrido muchísimo, incluidas carreras larguísimas. Bromista, profesor de secundaria. Lleva un club de corredores en el gimnasio de Javi y siempre anima a la gente.',
    pedido: 'un solo doble',
    posicion: 115, carril: 10, sprint: 0.85,
    // moreno, sin gafas ni barba
    aspecto: {
      piel: '#e3a985', pelo: 'corto', colorPelo: '#1e1a18', barba: null,
      gafas: false, altura: 2, pantalon: '#3a3d46', mallas: false,
      zapatillas: '#f2f2f2', chaqueta: true,
    },
  },
  {
    id: 'antonio',
    nombre: 'Antonio',
    descripcion: 'Pelirrojo. Le encantan las locuras: temas rarísimos y debates absurdos. Pica a David con la política y al resto con sus ideas de derechas. Hermano de Quique.',
    pedido: 'una manzanilla',
    posicion: 212, carril: 0, sprint: 0.55,
    aspecto: {
      piel: '#f2c7a6', pelo: 'corto', colorPelo: '#c0562a', barba: '#b8502a',
      gafas: false, altura: 2, pantalon: '#1c1c22', mallas: false,
      zapatillas: '#e04848', chaqueta: false,
    },
  },
  {
    id: 'quique',
    nombre: 'Quique',
    descripcion: 'Hermano de Antonio. Se dedica a los seguros. Más callado, pero muy simpático.',
    pedido: 'café con leche',
    posicion: 105, carril: 4, sprint: 0.3,
    // aire de hermano de Antonio (confirmado)
    aspecto: {
      piel: '#f2c7a6', pelo: 'corto', colorPelo: '#8a4a2a', barba: null,
      gafas: false, altura: 1, pantalon: '#22252c', mallas: false,
      zapatillas: '#2fb37a', chaqueta: true,
    },
  },
  {
    id: 'agustito',
    nombre: 'Agustito',
    descripcion: 'El más bajito del grupo, con muchísimas carreras a la espalda. Asesor, simpático y bromista. David siempre le dice que le están buscando novia, pero él no se deja.',
    pedido: 'un colacao',
    posicion: 132, carril: 13, sprint: 0.65,
    // el más bajito; resto del aspecto PROVISIONAL
    aspecto: {
      piel: '#e3aa86', pelo: 'corto', colorPelo: '#4a3020', barba: '#4a3020',
      gafas: false, altura: -1, pantalon: '#2a2a33', mallas: false,
      zapatillas: '#ffb000', chaqueta: true,
    },
  },
];
