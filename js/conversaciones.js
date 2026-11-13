'use strict';
// =====================================================================
//  CONVERSACIONES Y SUCESOS (PROVISIONALES)
//
//  Formato de una conversación:
//    {
//      lineas: ['texto que dice el personaje', ['otro_id', 'texto de otro'], ...],
//      opciones: [
//        { texto: 'lo que respondes', amistad: 2, energia: -5,
//          respuesta: ['lo que te contesta'] },
//      ],
//    }
//  - Una línea que es solo texto la dice el personaje con el que hablas.
//  - amistad puede ser un número (para ese personaje) o un objeto
//    { eduardo: 1, cesar: -1, todos: 1 }.
//  - energia: lo que te cuesta hablar (negativo = te cansa).
//  - acelera: 'id' hace que esa persona se ponga a tirar del grupo un rato.
//  - requiere: 'id' en una conversación hace que solo salga si esa persona ha venido;
//    en una línea, como tercer elemento: ['agustito', 'Que no, David.', 'david'].
// =====================================================================

const CONVERSACIONES = {
  // Eduardo: simpático y bromista, siempre tiene una buena respuesta.
  // Director y profesor del colegio del Quijote (donde también trabaja Emiliano).
  eduardo: [
    {
      lineas: [
        '¡Hombre, el nuevo! Yo soy Eduardo. De lunes a viernes, director de colegio.',
        'Los viernes a las seis, director de nada. Aquí no mando ni en el ritmo... bueno, en los chistes sí.',
      ],
      opciones: [
        { texto: '¿Director? Entonces me porto bien.', amistad: 1, energia: -4,
          respuesta: ['Tranquilo, aquí no pongo partes. Salvo al que llega tarde, que ese paga los churros.'] },
        { texto: 'Pues cuéntame uno.', amistad: 2, energia: -5,
          respuesta: [
            '¿Sabes por qué los gorilones corremos a las seis de la mañana?',
            'Porque a esas horas no nos ve nadie con estas pintas.',
          ] },
        { texto: '(Te ríes sin aire)', amistad: 1, energia: -2,
          respuesta: ['Eso, eso. Reírse corriendo cuenta como abdominales.'] },
      ],
    },
    {
      lineas: [
        'Emiliano trabaja conmigo en el cole del Quijote. Es el de Educación Física.',
        'A los niños les exige como si fueran a las Olimpiadas... y luego él para a mitad de carrera.',
      ],
      opciones: [
        { texto: 'Será que conoce bien el terreno.', amistad: 2, energia: -4,
          respuesta: ['Todos los matorrales de Ciudad Real, uno por uno. Él lo llama trabajo de campo.'] },
        { texto: '¿Y tú, como director, no le pones falta?', amistad: 2, energia: -5,
          respuesta: ['Lo intenté. Me trajo un justificante firmado por él mismo.'] },
        { texto: 'Pobre hombre, déjale.', amistad: 0, energia: -3,
          respuesta: ['¿Pobre? Si es el que más corre de todos. Hacia los matorrales, pero corre.'] },
      ],
    },
    {
      lineas: [
        'Al llegar a La Hormiga, foto. Yo salgo delante, que para eso hago el selfie.',
        'Lo de salir guapo a estas horas ya es más difícil, pero se intenta.',
      ],
      opciones: [
        { texto: 'Tú sales siempre bien.', amistad: 2, energia: -4,
          respuesta: ['Es el solo doble. Con el primer sorbo ya me cambia la cara.'] },
        { texto: 'Yo salgo fatal en las fotos.', amistad: 1, energia: -4,
          respuesta: ['Ponte a mi lado, que con esta sonrisa nadie se fija en los demás.'] },
        { texto: '¿Y los churros?', amistad: 1, energia: -3,
          respuesta: ['Yo, un solo doble y ya. Los churros los miro, que también alimenta.'] },
      ],
    },
  ],

  // César: gemelo de Emiliano, profesor de Educación Física y ex entrenador de
  // balonmano. Tampoco soporta que se encienda una luz.
  cesar: [
    {
      lineas: [
        'Oye, nuevo, ¿a que no me distingues de mi hermano?',
        'Emiliano y yo somos gemelos. Llevamos toda la vida confundiendo a la gente.',
      ],
      opciones: [
        { texto: 'Fácil: tú eres el que no para a mitad de carrera.', amistad: 3, energia: -5,
          respuesta: ['¡Ja! Esa es buena. Se la digo en la parada técnica, que tendrá tiempo de pensarla.'] },
        { texto: 'Yo pensaba que eras Emiliano.', amistad: 1, energia: -3,
          respuesta: ['Lo sé. Hasta los alumnos dudan. Y somos los dos de Educación Física, imagínate.'] },
      ],
    },
    {
      lineas: [
        'Emiliano y yo hemos entrenado balonmano muchos años.',
        'Ahora el que está metido es Javi, de preparador físico en el Caserío. Si le preguntas, no le paras.',
      ],
      opciones: [
        { texto: 'Yo de balonmano no sé nada.', amistad: 1, energia: -3,
          respuesta: ['Pues aquí vas a aprender. Los viernes se analiza más balonmano que ritmos.'] },
        { texto: '¿Y quién era mejor entrenador, tú o Emiliano?', amistad: 2, energia: -5,
          respuesta: ['Yo. Pero no se lo digas, que luego se pone a hacer series para demostrarlo.'] },
      ],
    },
    {
      lineas: [
        'Te aviso de una cosa: aquí no se enciende la frontal. Ni se te ocurra.',
        'Los ojos se acostumbran a la oscuridad. Lo digo como profesor de Educación Física.',
      ],
      opciones: [
        { texto: 'Pues yo no veo ni los charcos.', amistad: 1, energia: -4,
          respuesta: ['Eso es que no miras bien. Si te caes, te ayudo a levantarte. Pero sin luz.'] },
        { texto: 'Entendido, nada de luces.', amistad: 2, energia: -3,
          respuesta: ['Así me gusta. Tú vas a durar en este grupo.'] },
      ],
    },
  ],

  // Mario: ingeniero de sistemas empotrados. Simpático y bromista, corre hablando
  // y le encanta picar a David.
  mario: [
    {
      lineas: [
        'Yo trabajo en sistemas empotrados: firmware, microcontroladores...',
        'Cosas que nadie ve, pero que si fallan se entera todo el mundo. Como yo en este grupo.',
      ],
      opciones: [
        { texto: '¿Empotrados? ¿Como los armarios?', amistad: 2, energia: -4,
          respuesta: ['Exacto. Pero los míos piensan. Más que alguno de este grupo, ¿eh, David?', ['david', '...']] },
        { texto: 'Suena complicado.', amistad: 1, energia: -3,
          respuesta: ['Lo complicado es explicarle a David qué es una interrupción. Y mira que se las hago.'] },
        { texto: 'Si se me cuelga el reloj, ¿me lo arreglas?', amistad: 2, energia: -5,
          respuesta: ['Apágalo y vuelve a encenderlo. Funciona igual con los relojes que con las personas.'] },
      ],
    },
    {
      lineas: [
        'Tú observa, que te enseño cómo funciona David.',
        '¡David! ¿Te has enterado? Dicen que Sánchez se apunta a correr con nosotros el viernes que viene.',
        ['david', '...'],
        ['narrador', 'David se pone negro y, sin decir nada, acelera.'],
        '¿Ves? No falla nunca. Mejor que cualquier entrenador.',
      ],
      opciones: [
        { texto: 'Eres malo.', amistad: 2, energia: -4, acelera: 'david',
          respuesta: ['Malo no: ingeniero. Busco el botón que lo activa, y David lo tiene a la vista.'] },
        { texto: 'Déjale tranquilo, hombre.', amistad: { mario: 1, david: 2 }, energia: -3, acelera: 'david',
          respuesta: [['david', 'Gracias, nuevo. Eres el primero que me defiende en años.']] },
      ],
    },
    {
      lineas: ['Yo corro hablando. Si me callo, es que me pasa algo.', 'O que David me ha ganado una discusión, que viene a ser lo mismo.'],
      opciones: [
        { texto: '¿Y no te quedas nunca sin aire?', amistad: 1, energia: -4,
          respuesta: ['Nunca. Como un buen sistema empotrado: bajo consumo y siempre encendido.'] },
        { texto: '¡Pues cuéntame algo!', amistad: 2, energia: -6,
          respuesta: [
            '¿Te he explicado lo que es un watchdog? Es un perro que vigila que el programa no se cuelgue.',
            ['eduardo', 'Ya está otra vez con los perros informáticos.'],
          ] },
      ],
    },
  ],

  // Cleto: ingeniero informático. Entrena con entrenador y no se salta el plan;
  // se toma en serio los ritmos y va con David a la cabeza. Le piden constelaciones
  // para reírse de él, y también se ríen de sus mallas verdes.
  cleto: [
    {
      lineas: [
        'Hoy me toca rodaje suave a 5:30. Lo pone el plan.',
        'Mi entrenador me lo ha mandado así y yo no me lo salto.',
      ],
      opciones: [
        { texto: '¿Y si hoy vamos un poco más rápido?', amistad: 0, energia: -4,
          respuesta: ['Ni hablar. Si el plan dice 5:30, es 5:30. Ni un segundo menos.', ['david', 'Y yo con él, que si no se me escapa.']] },
        { texto: '¿Tienes entrenador? ¡Qué profesional!', amistad: 2, energia: -4,
          respuesta: ['Es la única forma de mejorar. Eso, y en La Hormiga un descafeinado con leche, que no altera nada.'] },
        { texto: '¿No te aburres de ir siempre mirando el reloj?', amistad: 1, energia: -3,
          respuesta: ['Para eso voy delante con David. Él habla de política y yo miro el reloj. Equipo perfecto.'] },
      ],
    },
    {
      lineas: [
        'Mira arriba un momento. Eso es Orión: el cinturón son esas tres estrellas en fila.',
        ['pedro', '¡Ya está el astrónomo!'],
      ],
      opciones: [
        { texto: 'Qué bonito. ¿Y esa tan brillante?', amistad: 3, energia: -5,
          respuesta: ['Sirio. La estrella más brillante del cielo.', ['eduardo', '¿Y esa otra de ahí? ¿Es Sirio o la farola de la gasolinera?']] },
        { texto: 'Yo solo veo puntitos.', amistad: 0, energia: -3,
          respuesta: ['Tú te lo pierdes. Bueno, os lo perdéis todos, que solo me preguntáis para reíros.'] },
      ],
    },
    {
      lineas: [
        'Sí, ya lo sé. Las mallas verdes.',
        'Todos los viernes alguien dice algo. Pero son cómodas y se me ve desde lejos.',
      ],
      opciones: [
        { texto: 'A mí me gustan.', amistad: 3, energia: -3,
          respuesta: ['Gracias. Eres el primero en tres años.'] },
        { texto: 'Pareces una rana.', amistad: 1, energia: -3,
          respuesta: ['Eso dice Eduardo. Y Mario. Y Pedro. Y los gemelos. Bueno, todos.'] },
      ],
    },
  ],

  // Se pone negro en cuanto sale la política.
  david: [
    {
      lineas: ['...', 'Buenos días. Soy David. Abogado.', 'Y sí: en la churrería todo el mundo me pide consejo gratis.'],
      opciones: [
        { texto: 'Si me caigo en un bache, ¿puedo denunciar al Ayuntamiento?', amistad: 2, energia: -5,
          respuesta: ['Poder, puedes. Pero te sale más caro el abogado que los churros.', 'Y el abogado soy yo.'] },
        { texto: 'Encantado, David.', amistad: 1, energia: -3,
          respuesta: ['Igualmente. Aquí se meten mucho conmigo. No les hagas caso.', '...Bueno, un poco sí.'] },
      ],
    },
    {
      lineas: ['Anoche vi el telediario y todavía no se me ha pasado.'],
      opciones: [
        { texto: 'Mejor no hablemos de política.', amistad: 1, energia: -2,
          respuesta: ['Haces bien. Si empiezo, a las siete seguimos aquí.'] },
        { texto: '¿Qué ha hecho ahora Sánchez?', amistad: { david: 2, eduardo: 1 }, energia: -10, acelera: 'david',
          respuesta: [
            'No me tires de la lengua, que no me tires de la lengua...',
            ['narrador', 'David se pone negro. Sin darse cuenta acelera y el grupo tiene que apretar para seguirle.'],
            ['eduardo', '¡Ya está! ¿Quién ha dicho «Sánchez»?'],
            ['pedro', 'Yo no he sido. Que me llamo Pedro, pero no tengo nada que ver.'],
          ] },
      ],
    },
    {
      lineas: ['Oye, si algún día necesitas algo, me lo dices. Lo que sea.'],
      opciones: [
        { texto: 'Eres más majo de lo que pareces.', amistad: 2, energia: -3,
          respuesta: ['No se lo digas a estos, que tengo una reputación de serio que mantener.'] },
        { texto: '¿Por qué se meten tanto contigo?', amistad: 2, energia: -4,
          respuesta: ['Porque saben que no me enfado.', 'Salvo con la política. Ahí sí.'] },
      ],
    },
  ],

  // Pedro: habla mucho (de su trabajo, no), muy aficionado al balonmano.
  // Pica a David con la política a base de preguntas.
  pedro: [
    {
      lineas: [
        'Oye, nuevo, te propongo un juego.',
        'Tú le preguntas a David por la amnistía, y yo cuento cuánto tarda en acelerar.',
      ],
      opciones: [
        { texto: 'Vale, voy.', amistad: { pedro: 2, david: -1 }, energia: -6, acelera: 'david',
          respuesta: [['david', '¿La amnistía? ¿Me preguntas por la amnistía a las seis de la mañana?'], ['narrador', 'David acelera.'], 'Cuatro segundos. Récord del mes.'] },
        { texto: 'Paso, que David me cae bien.', amistad: { pedro: 0, david: 1 }, energia: -3,
          respuesta: ['Aburrido. Pero bueno, ya se lo pregunto yo.'] },
      ],
    },
    {
      lineas: [
        '¿Viste el partido del Caserío? Javi tiene a los chavales como aviones.',
        '¿Tú de balonmano sabes algo?',
      ],
      opciones: [
        { texto: 'Lo justo.', amistad: 1, energia: -3,
          respuesta: ['Pues pégate a Javi, a los gemelos y a mí. En tres viernes sabes más que el seleccionador.'] },
        { texto: 'Yo soy más de fútbol.', amistad: 0, energia: -3,
          respuesta: ['¿Fútbol? Eso aquí no se dice muy alto, que te oye César.', ['cesar', '¿Qué ha dicho?']] },
        { texto: '¡Me encanta el balonmano!', amistad: 3, energia: -5,
          respuesta: ['¡Por fin alguien normal! Este finde te vienes al partido.'] },
      ],
    },
    {
      lineas: [
        'David... ¿qué te parece lo último de Sánchez? Pregunto por curiosidad, ¿eh?',
        ['david', 'Pedro, no empieces.'],
        'No, si yo solo pregunto. Por saber cuánto tardas en reaccionar.',
        ['narrador', 'David reacciona. Bastante rápido.'],
      ],
      opciones: [
        { texto: '¡Échale más leña!', amistad: { pedro: 2, david: -1 }, energia: -6, acelera: 'david',
          respuesta: ['Tú sí que sabes. Vas a encajar muy bien aquí.', ['david', 'Sois todos iguales.']] },
        { texto: '¿Siempre le hacéis lo mismo?', amistad: 1, energia: -3, acelera: 'david',
          respuesta: ['Todos los viernes. Y todos los viernes funciona. Es ciencia.'] },
      ],
    },
  ],

  // Javi: el organizador. Preparador físico del Caserío (balonmano).
  javi: [
    {
      lineas: [
        '¡Hombre, el nuevo! ¿Has leído el grupo? Puse el mensaje a las 5:45.',
        'Aquí la norma es sencilla: a las seis en punto se sale, se corre juntos y se acaba en La Hormiga.',
      ],
      opciones: [
        { texto: '¿Y quién paga los churros?', amistad: 1, energia: -5,
          respuesta: ['El último en llegar. Norma sagrada, y aquí no se libra nadie.'] },
        { texto: 'A las 5:45 yo estaba soñando.', amistad: 0, energia: -4,
          respuesta: ['Todos decimos eso el primer día. Al tercer viernes te despiertas sin despertador.'] },
        { texto: '(Asientes sin aire)', amistad: 1, energia: -1,
          respuesta: ['Bien, bien. Respira, que esto es largo.'] },
      ],
    },
    {
      lineas: [
        'Este fin de semana juega el Caserío. Vente, que yo estoy en el banquillo de preparador físico.',
        'Si los ves correr como motos al final del partido, eso es cosa mía.',
      ],
      opciones: [
        { texto: '¡Me apunto!', amistad: 2, energia: -4,
          respuesta: ['Así me gusta. Y si quieres te enseño la sesión de pretemporada. Bueno, mejor no, que lloran.'] },
        { texto: '¿Y a nosotros no nos preparas?', amistad: 2, energia: -5,
          respuesta: ['Ya lo hago. ¿Por qué te crees que el recorrido tiene tantos bordillos?'] },
        { texto: 'Yo de balonmano no entiendo.', amistad: 0, energia: -3,
          respuesta: ['Tranquilo: con César y Emiliano al lado, en un mes eres seleccionador.'] },
      ],
    },
  ],

  // ---- 3 y 9-12: conversaciones neutras, PROVISIONALES ----
  emiliano: [
    {
      lineas: ['¿Qué pasa, nuevo? ¿Ya vas cansado?'],
      opciones: [
        { texto: 'Un poco, la verdad.', amistad: 1, energia: -3,
          respuesta: ['Sois unas mariconas. Todos. Venga, que esto es un trote.'] },
        { texto: 'Qué va, voy sobrado.', amistad: 2, energia: -5,
          respuesta: ['Eso me gusta. Ya hablaremos en el sprint.'] },
        { texto: '¿Paramos un poco?', amistad: 0, energia: -2,
          respuesta: ['¿Parar? Sois unas mariconas.', ['eduardo', 'Dice el que para todos los viernes a mitad de carrera.']] },
      ],
    },
    {
      lineas: ['¿Primer viernes? Lo peor es el despertador. Lo demás va solo.'],
      opciones: [
        { texto: 'Pues el despertador casi me mata.', amistad: 1, energia: -4,
          respuesta: ['Ya verás: en un mes te despiertas a las 5:50 hasta los domingos.'] },
        { texto: '¿Y cómo lo haces para ir siempre sonriendo?', amistad: 2, energia: -5,
          respuesta: ['Porque sé dónde acaba esto. Churros, amigo. Churros.'] },
      ],
    },
  ],
  // Toty: hermano pequeño de David. Ha corrido muchísimo (carreras larguísimas),
  // bromista, profesor de secundaria. Lleva un club de corredores en el gimnasio
  // de Javi y siempre anima a todo el mundo.
  toty: [
    {
      lineas: [
        'Esto para mí es un calentamiento, ¿eh?',
        'He hecho carreras de esas que duran un día entero. Y alguna, más.',
      ],
      opciones: [
        { texto: '¿Un día entero corriendo? ¡Estás loco!', amistad: 2, energia: -4,
          respuesta: ['Eso dice mi hermano. Bueno, eso y cosas peores.', ['david', 'Lo digo con cariño. Pero está loco.']] },
        { texto: '¿Y no te aburres tantas horas?', amistad: 1, energia: -4,
          respuesta: ['Qué va. A partir de la hora doce ya ni piensas. Es como un claustro de profesores.'] },
        { texto: '¡Yo quiero hacer una!', amistad: 3, energia: -5,
          respuesta: ['¡Eso! Te apunto al club y en dos años te veo en la línea de salida. Y yo contigo.'] },
      ],
    },
    {
      lineas: [
        'Tengo un club de corredores en el gimnasio de Javi. Gente que empieza desde cero.',
        'Vente cuando quieras. Allí no se queda nadie atrás.',
      ],
      opciones: [
        { texto: '¿Y aguantan los que empiezan?', amistad: 1, energia: -3,
          respuesta: ['Todos. El secreto es animar. Mucho. Hasta que te odien un poquito.'] },
        { texto: 'Me apunto.', amistad: { toty: 3, javi: 1 }, energia: -3,
          respuesta: ['¡Así me gusta! ¡Javi, tenemos uno nuevo!', ['javi', 'Apuntado. Primera cuota: un solo doble para Toty.']] },
      ],
    },
    {
      lineas: ['David es mi hermano mayor. Más serio que un juez... y eso que es abogado.'],
      opciones: [
        { texto: '¿Siempre ha sido así?', amistad: 2, energia: -4,
          respuesta: ['Desde pequeño. Yo me pasaba el día intentando hacerle reír. Y sigo.', ['david', '...Casi.']] },
        { texto: '¿Tú también le picas con la política?', amistad: 1, energia: -3,
          respuesta: ['Yo no, que es mi hermano. Para eso ya tiene a Pedro y a Mario.'] },
      ],
    },
  ],

  // Antonio: pelirrojo, le encantan las locuras y los debates absurdos.
  // Pica a David con la política y al resto con sus ideas de derechas.
  antonio: [
    {
      lineas: ['Pregunta seria: si un gorila de verdad corriera con nosotros, ¿a qué ritmo iría?'],
      opciones: [
        { texto: 'A 3:00 el kilómetro, mínimo.', amistad: 2, energia: -5,
          respuesta: [
            'Mínimo. Y luego pararía en La Hormiga igual. Los gorilas son muy de churros, está demostrado.',
            ['cleto', 'No está demostrado.'],
            'Está demostrado por mí.',
          ] },
        { texto: 'Eso no tiene ningún sentido.', amistad: 0, energia: -3,
          respuesta: ['Las mejores conversaciones no tienen sentido. Pregúntale a Eduardo.', ['eduardo', 'A mí no me metáis.']] },
        { texto: '¿Y si fueran doce gorilas?', amistad: 3, energia: -6,
          respuesta: ['¡Por fin alguien que me sigue! Abrimos debate en La Hormiga.'] },
      ],
    },
    {
      lineas: [
        'Otro debate. Un churro mojado en chocolate, ¿sigue siendo un churro?',
        '¿O ya es otra cosa?',
      ],
      opciones: [
        { texto: 'Sigue siendo un churro.', amistad: 1, energia: -4,
          respuesta: ['Eso es lo que quieren que pienses.'] },
        { texto: 'Ya es otra cosa.', amistad: 2, energia: -4,
          respuesta: ['Exacto. Es un churro con experiencia.'] },
        { texto: 'Son las seis de la mañana, Antonio.', amistad: 1, energia: -2,
          respuesta: ['La mejor hora para la filosofía. Nadie te interrumpe.', ['quique', 'Yo lo intento, pero no me deja.']] },
      ],
    },
    {
      lineas: [
        'Atención, que voy a decir una cosa y que nadie se enfade.',
        '¿Y si Sánchez acierta en algo? Una cosa. Solo una.',
        ['narrador', 'Silencio absoluto. Solo se oyen las zapatillas.'],
        ['mario', 'Antonio, que nos conocemos.'],
      ],
      opciones: [
        { texto: '¡Polémica!', amistad: { antonio: 2, david: -1 }, energia: -5, acelera: 'david',
          respuesta: ['Es que si no, esto es muy aburrido. ¡Aquí pensáis todos igual! Sois mayoría absoluta.'] },
        { texto: 'Mejor cambiamos de tema.', amistad: { antonio: 0, david: 1 }, energia: -2,
          respuesta: [['david', 'Gracias.'], 'Vale, vale. ¿Volvemos a lo de los gorilas?'] },
      ],
    },
  ],

  // Quique: hermano de Antonio. Seguros. Más callado, pero muy simpático.
  quique: [
    {
      lineas: ['...', 'Perdona, que por la mañana soy de pocas palabras. Antonio habla por los dos.'],
      opciones: [
        { texto: 'Ya me he dado cuenta.', amistad: 2, energia: -3,
          respuesta: ['Desde pequeños: él habla y yo asiento.', ['antonio', '¡Y así nos va de bien!']] },
        { texto: '¿A qué te dedicas?', amistad: 1, energia: -3,
          respuesta: ['A los seguros. Así que si te comes un bordillo, aquí me tienes.'] },
      ],
    },
    {
      lineas: ['¿Vas bien? Si vas mal, dilo, que aquí no se deja a nadie atrás.'],
      opciones: [
        { texto: 'Voy bien, gracias.', amistad: 1, energia: -3,
          respuesta: ['Así me gusta. Pero dosifica, que esto es largo.'] },
        { texto: 'Voy fatal.', amistad: 2, energia: -2,
          respuesta: ['Pues bajamos un poco el ritmo tú y yo. Sin prisa.'] },
      ],
    },
  ],

  // Agustito: el más bajito, con muchísimas carreras hechas. Asesor, simpático y
  // bromista. Ex jugador de balonmano. David siempre le dice que le buscan novia.
  agustito: [
    {
      lineas: [
        'Seré el más bajito, pero carreras he hecho más que nadie.',
        ['toty', 'Más que yo, no.'],
        'Bueno, igual que Toty. Casi.',
      ],
      opciones: [
        { texto: '¿Cuál ha sido la más dura?', amistad: 2, energia: -5,
          respuesta: ['Todas. La más dura siempre es la siguiente.'] },
        { texto: 'Para ser bajito, corres un montón.', amistad: 1, energia: -3,
          respuesta: ['Menos superficie, menos rozamiento. Es física. Pregúntale a Mario.', ['mario', 'No funciona así.']] },
      ],
    },
    {
      lineas: [
        'Aquí casi todos hemos jugado al balonmano. Todos menos Mario, Eduardo y Javi.',
        'Yo, bajito y rápido: el terror de las defensas.',
      ],
      opciones: [
        { texto: '¿Javi no jugó? ¡Si es preparador del Caserío!', amistad: 2, energia: -4,
          respuesta: ['Ni un partido. Pero nos hace correr como si los hubiera jugado todos.', ['javi', 'Y lo sigo haciendo.']] },
        { texto: '¿Y Cleto también jugaba?', amistad: 1, energia: -3,
          respuesta: ['Claro. Con las mallas verdes no lo parece, pero sí.'] },
      ],
    },
    {
      requiere: 'david',
      lineas: [
        ['david', 'Agustito, que el sábado te presentamos a una amiga.'],
        'Que no, David. Que no me dejo.',
        ['david', 'Este viernes no te escapas.'],
      ],
      opciones: [
        { texto: '¿Y por qué no te dejas?', amistad: 2, energia: -4,
          respuesta: ['Porque estoy muy bien así. Y porque si me la busca David, la conozco en un juzgado.'] },
        { texto: 'David, déjale en paz.', amistad: { agustito: 2, david: 0 }, energia: -3,
          respuesta: [['david', 'Si es por su bien.'], 'Por mi bien, que se calle.'] },
      ],
    },
  ],

};

// Frases cortas cuando ya has agotado las conversaciones con alguien.
const FRASES_SUELTAS = {
  eduardo: ['David, sonríe, que esto no es un juicio.', 'Cleto, con esas mallas no hace falta frontal.', 'A este ritmo llegamos para el recreo.', 'Esto con un solo doble se arregla.', 'Si me río, no cuenta como pájara.', '¡Luego foto, que salgo yo!'],
  cesar: ['¿Has visto a mi hermano? Ah, no, que soy yo.', 'Ni se te ocurra encender la luz.', 'Esto en balonmano es un contraataque.', 'Venga, que ya queda menos.'],
  mario: ['¡David! ¿Te has enterado de lo último?', 'Esto lo arreglo yo con un reinicio.', 'Yo hablo, tú respira.', '¡Que alguien le dé conversación a David!'],
  cleto: ['5:30. Lo que dice el plan.', 'Hoy toca rodaje, no me liéis.', 'Eso de ahí es Orión.', 'Sí, son verdes. Ya lo sé.'],
  david: ['...', 'Bien.', 'Agustito, que te hemos encontrado novia.', 'Con lo que está cayendo, y nosotros corriendo.', 'No me hagas hablar, que no me hagas hablar.', '¿Legal? Depende.'],
  pedro: ['Qué frío hace, ¿no?', 'No me quito el gorro ni en agosto.', 'David, ¿y qué opinas de...? No, nada, nada.', '¿Viste al Caserío?', 'Yo solo pregunto, ¿eh?'],
  javi: ['¡Grupo compacto!', 'Este finde, todos a ver al Caserío.', '¿Quién falta? Luego lo apunto en el grupo.'],
  emiliano: ['Sois unas mariconas.', '¡Vamos, que ya queda menos!', 'Sin luz se corre mejor.'],
  toty: ['¡Vamos, que tú puedes!', '¡Venga, que esto es un paseo!', 'Esto para mí es calentar.', '¡Ánimo, nuevo, que vas genial!'],
  antonio: ['Pregunta seria: ¿los gorilas sudan?', 'Abro debate.', 'Pensáis todos igual, qué aburrido.', 'Tengo una teoría...'],
  quique: ['Tú a tu ritmo.', 'Respira, respira.', '¿Tienes seguro de tobillo?', 'Antonio, déjalo ya.'],
  agustito: ['¡Vamos, que esto está hecho!', 'Que no me dejo, David.', 'Bajito pero matón.', 'Este recorrido me lo sé de memoria.'],
};

// Lo que te dicen cuando te comes un obstáculo (charco, bache, bordillo o piedra).
const FRASES_OBSTACULO = {
  bache: [
    '¡Ese bache! ¿No lo has visto?',
    'Cuidado con el tobillo, que el lunes se trabaja.',
    'Este bache lleva ahí desde que empezamos a correr.',
  ],
  bordillo: [
    '¡El bordillo! ¡Levanta los pies!',
    'Casi te dejas los dientes en el bordillo.',
    '¡Bordillo! Esto en la Vía Verde no pasa.',
  ],
  piedra: [
    '¡Esa piedra! Mira dónde pisas.',
    'Uy, uy... ¿estás bien?',
    'Las piedras de este camino son de toda la vida.',
  ],
};

// Lo que te dicen cuando pisas un charco.
const FRASES_CHARCO = [
  '¡Al charco de cabeza!',
  '¡Salta, hombre, salta!',
  'Ya tienes los pies frescos.',
  'Esa zapatilla ya no se seca hasta el lunes.',
];

// Escena de la quedada, antes de salir.
const QUEDADA = {
  lineas: [
    ['narrador', 'Viernes, 5:58 de la mañana. Todavía es de noche.'],
    ['javi', '¡Buenos días, gorilones! ¿Estamos todos?'],
    ['cesar', 'Estoy. Y Emiliano también... ¿o era yo?'],
    ['cleto', 'Esperad, que coja el GPS... 4 satélites... 7... Ya.'],
    ['javi', 'La Hormiga abre a las siete. Que no se nos haga tarde.'],
    ['javi', 'Hoy tenemos un nuevo. ¡Bienvenido a los Gorilones!'],
    ['eduardo', 'Tranquilo, que aquí el único examen es el de los churros. Y ese lo aprueba todo el mundo.'],
    ['pedro', '¡Venga, vamos, que me quedo frío!'],
    ['toty', 'Pedro, que vas vestido para subir al Everest.'],
    ['pedro', 'Y aun así tengo frío.'],
    ['agustito', '¡Cuántos somos hoy! No cabemos en La Hormiga.'],
    ['david', 'Agustito, que hoy viene una amiga a desayunar.'],
    ['agustito', 'Que no, David.', 'david'],
    ['narrador', 'Con ◀ ▶ te colocas en el grupo (ir hacia delante cansa). Con ▲ saltas charcos, baches y bordillos. Acércate a alguien y pulsa HABLAR (espacio).', null, 'teclado'],
    ['narrador', 'Toca delante o detrás de ti para moverte por el grupo (ir hacia delante cansa). Desliza el dedo hacia arriba para saltar charcos, baches y bordillos. Para hablar, toca al compañero que tiene el bocadillo «...».', null, 'tactil'],
  ],
};

// Lo que gritan si alguien enciende una luz (solo ellos dos se enfadan).
const GRITOS_LUZ = {
  cesar: ['¡Apaga eso, que se ve de sobra!', '¡Nos vas a dejar ciegos!', '¡Esa luz! ¡Que no hace falta!', '¿Tú ves algo raro? ¡Pues apaga!'],
  emiliano: ['¿Pero quién ha encendido la luz?', '¡Apágala, hombre, que hay luna!', 'Se ve perfectamente. ¡Apaga!', 'Sois unas mariconas. ¡Apaga eso!'],
};
const GRACIAS_LUZ = {
  cesar: '¿Ves? Se ve de sobra.',
  emiliano: 'Mucho mejor. Así se disfruta del camino.',
};

// La parada técnica de Emiliano: siempre entre el primer y el segundo tercio.
// {sitio} se cambia por «unos matorrales» o «un contenedor» según el paisaje.
const PARADA_TECNICA = {
  inicio: {
    lineas: [
      ['emiliano', '¡Parad, parad! Esperadme un momento, que tengo que hacer una parada técnica.'],
      ['cesar', '¿Otra vez? ¡Si es todos los viernes!'],
      ['narrador', 'Emiliano sale disparado hacia {sitio}. El grupo se para a esperarle.'],
      ['eduardo', 'Tranquilos, que en el cole a esto lo llamamos recreo.'],
      ['narrador', 'Mientras esperáis, hablar no cansa. Muévete por el grupo y habla con quien quieras.'],
    ],
  },
  vuelta: {
    lineas: [
      ['emiliano', '¡Ya está! Qué a gusto. ¿Seguimos?'],
      ['javi', 'Tú te lavas las manos antes de tocar los churros, ¿eh?'],
    ],
  },
  sinEmiliano: 'Hoy no hay parada técnica: Emiliano no ha venido.',
};

// Toty anima cuando te quedas sin fuerzas (te devuelve algo de energía).
const ANIMOS_TOTY = [
  '¡Venga, que tú puedes! ¡Un poquito más!',
  '¡Vamos, nuevo, que no se queda nadie atrás!',
  '¡Eso es! ¡Respira y para adelante!',
  '¡Ánimo, que lo difícil ya está hecho!',
];

// Sobremesa en La Hormiga: al final salen dos o tres escenas al azar, solo de
// los que han venido. Azúcar, mojar el churro... y David, que no prueba uno.
const SOBREMESA = [
  [['pedro', 'David, ¿de verdad no vas a mojar ni un churro?'], ['david', 'Nunca.']],
  [['eduardo', 'Mario ya está echando azúcar al churro. Y al café. Y a la mesa.'], ['mario', 'Es que si no, no sabe a nada.']],
  [['antonio', 'Abro debate: ¿se puede mojar un churro en manzanilla?'], ['eduardo', 'No.'], ['cesar', 'No.'], ['antonio', 'Pues yo lo voy a intentar.']],
  [['toty', 'Moja, moja, que un churro sin mojar es como correr sin zapatillas.']],
  [['david', 'Agustito, a ver cuándo mojas tú.'], ['agustito', 'Que no me dejo, David.']],
  [['javi', 'Cuidado con el azúcar, que el lunes hay entrenamiento.'], ['emiliano', 'Sois unas mariconas. Échale más.']],
  [['mario', 'El secreto está en mojar rápido, que si no se deshace.'], ['cleto', 'Tres segundos. Lo tengo medido.']],
  [['quique', '¿Me pasas el azúcar?'], ['antonio', 'Primero dime si un churro mojado sigue siendo un churro.'], ['quique', 'Antonio, el azúcar.']],
  [['agustito', 'Más azúcar, que hoy nos lo hemos ganado.'], ['david', 'Yo con mi solo estoy bien.'], ['eduardo', 'David, sonríe, que hoy no hay juicio.']],
  [['eduardo', 'Pedro, que ya estamos dentro. Te puedes quitar el gorro.'], ['pedro', 'Cuando me caliente el café con leche.']],
  [['pedro', '¿No hace frío aquí dentro?'], ['emiliano', 'Sois unas mariconas.']],
  // la IA
  [['mario', 'Cleto, tú que eres informático: ¿la IA nos va a quitar el trabajo?'], ['cleto', 'A ti no, Mario. A los que hacen planes de entrenamiento, igual sí.'], ['cesar', 'A los de Educación Física, seguro que no.']],
  [['eduardo', 'He leído que una IA ya escribe chistes.'], ['pedro', 'Cuidado, Eduardo, que te quita el puesto.'], ['eduardo', 'Imposible. La IA no se ríe de sus propios chistes. Yo sí.']],
  [['antonio', 'Pregunta seria: si una IA hiciera un videojuego de nosotros, ¿quién saldría más guapo?'], ['eduardo', 'Yo, que salgo en el selfie.'], ['cleto', 'Pues ya existe. Lo estáis jugando.']],
  // la política
  [['pedro', 'David, ¿has visto lo último de Sánchez?'], ['david', 'Lo hace todo mal. Todo. No acierta ni una.'], ['antonio', 'Alguna acertará, hombre.'], ['david', 'Nómbrame una.'], ['antonio', '...Dame un minuto.']],
  [['mario', 'David, ¿y lo de Venezuela?'], ['david', 'Así vamos a acabar. Como Venezuela.'], ['toty', 'Ya está mi hermano con Venezuela. Pásame el azúcar, anda.']],
  [['antonio', 'Pues yo creo que la izquierda, en el fondo...'], ['narrador', 'Todas las cabezas de la mesa se giran a la vez.'], ['antonio', '...Nada, nada. Que qué buenos están hoy los churros.']],
  [['javi', 'Hoy queda prohibido hablar de política en la mesa.'], ['david', 'Entonces me voy.'], ['eduardo', 'Siéntate, David, que no te has acabado el solo.']],
];

// Excusas de los que fallan un viernes (se reparten al azar).
const EXCUSAS = [
  'se ha dormido',
  'dice que llueve; no llueve',
  'tiene el gemelo cargado',
  'está de viaje',
  'tiene turno temprano',
  'cena de empresa ayer',
  'no ha contestado al grupo',
  'está de boda este finde',
  'dice que hoy hace frío',
  'se le ha roto el despertador',
  'tiene médico',
];
