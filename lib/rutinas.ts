// Rutinas de entrenamiento (sección 7 del documento de contexto, ampliado).
// Contenido estático. 4 rutinas full body de gym + 4 de casa, para que el
// usuario rote y no se canse de lo mismo. Todo en rango de 8-10 reps salvo
// que se indique (gym); circuito 40/20 en casa.

export type Ejercicio = {
  nombre: string;
  detalle: string; // series/reps o tiempo
  grupo?: string;
};

export type Rutina = {
  slug: string;
  lugar: 'gym' | 'casa';
  titulo: string;
  subtitulo: string;
  estructura: string;
  ejercicios: Ejercicio[];
  progresion: string;
};

const PROG_GYM =
  'Trabajá siempre en el rango de 8 a 10 repeticiones. Cuando logres 10 reps limpias en las 3 series de un ejercicio, subí un poco el peso la próxima sesión y volvé a arrancar cerca de 8. Así siempre progresás sin complicarte.';

const PROG_CASA =
  'Cuando el circuito te resulte fácil, sumá una vuelta más (de 3 a 4, de 4 a 5) o acortá el descanso de 20 a 15 segundos. Para las flexiones, andá pasando de la variante fácil a la difícil a medida que ganás fuerza.';

export const RUTINAS_GYM: Rutina[] = [
  {
    slug: 'gym-a',
    lugar: 'gym',
    titulo: 'Full Body A',
    subtitulo: 'La base · 3 series de 8-10 reps',
    estructura:
      '1 ejercicio por grupo grande, 3 series de 8-10 reps. Descanso 60-90 seg entre series.',
    ejercicios: [
      { nombre: 'Sentadilla con barra o mancuernas', detalle: '3×8-10', grupo: 'piernas/glúteos' },
      { nombre: 'Press de banca o press con mancuernas', detalle: '3×8-10', grupo: 'pecho' },
      { nombre: 'Remo con barra o mancuerna', detalle: '3×8-10', grupo: 'espalda' },
      { nombre: 'Press militar de hombros', detalle: '3×8-10', grupo: 'hombros' },
      { nombre: 'Peso muerto rumano', detalle: '3×8-10', grupo: 'femoral/glúteo' },
      { nombre: 'Curl de bíceps', detalle: '3×10', grupo: 'bíceps' },
      { nombre: 'Extensión de tríceps en polea o fondos', detalle: '3×10', grupo: 'tríceps' },
      { nombre: 'Plancha abdominal', detalle: '3× máximo aguante', grupo: 'core' },
    ],
    progresion: PROG_GYM,
  },
  {
    slug: 'gym-b',
    lugar: 'gym',
    titulo: 'Full Body B',
    subtitulo: 'Variante máquinas · 3 series de 8-10 reps',
    estructura:
      'Misma lógica que la A pero con otros ejercicios, para variar el estímulo. 3 series de 8-10 reps, descanso 60-90 seg.',
    ejercicios: [
      { nombre: 'Prensa de piernas', detalle: '3×8-10', grupo: 'piernas/glúteos' },
      { nombre: 'Press inclinado con mancuernas', detalle: '3×8-10', grupo: 'pecho alto' },
      { nombre: 'Jalón al pecho en polea', detalle: '3×8-10', grupo: 'espalda' },
      { nombre: 'Elevaciones laterales', detalle: '3×12', grupo: 'hombros' },
      { nombre: 'Hip thrust (empuje de cadera)', detalle: '3×8-10', grupo: 'glúteos' },
      { nombre: 'Curl martillo', detalle: '3×10', grupo: 'bíceps/antebrazo' },
      { nombre: 'Press francés o extensión sobre la cabeza', detalle: '3×10', grupo: 'tríceps' },
      { nombre: 'Plancha lateral', detalle: '3× máximo por lado', grupo: 'core' },
    ],
    progresion: PROG_GYM,
  },
  {
    slug: 'gym-c',
    lugar: 'gym',
    titulo: 'Full Body C',
    subtitulo: 'Foco unilateral · 3 series de 8-10 reps',
    estructura:
      'Suma trabajo a una pierna/brazo para equilibrar los dos lados. 3 series de 8-10 reps (por lado donde aplique), descanso 60-90 seg.',
    ejercicios: [
      { nombre: 'Zancadas con mancuernas', detalle: '3×10 por pierna', grupo: 'piernas/glúteos' },
      { nombre: 'Aperturas o pec deck', detalle: '3×10-12', grupo: 'pecho' },
      { nombre: 'Remo sentado en polea', detalle: '3×8-10', grupo: 'espalda' },
      { nombre: 'Face pull', detalle: '3×12', grupo: 'hombro posterior' },
      { nombre: 'Peso muerto convencional (carga moderada)', detalle: '3×8', grupo: 'cadena posterior' },
      { nombre: 'Curl predicador', detalle: '3×10', grupo: 'bíceps' },
      { nombre: 'Fondos entre bancos', detalle: '3× máximo', grupo: 'tríceps' },
      { nombre: 'Elevación de piernas colgado o en banco', detalle: '3×12', grupo: 'core' },
    ],
    progresion: PROG_GYM,
  },
  {
    slug: 'gym-d',
    lugar: 'gym',
    titulo: 'Full Body D',
    subtitulo: 'Fuerza básica · 3 series de 8-10 reps',
    estructura:
      'Ejercicios grandes con barra para ganar fuerza general. 3 series de 8-10 reps, descanso 90 seg.',
    ejercicios: [
      { nombre: 'Sentadilla goblet o frontal', detalle: '3×8-10', grupo: 'piernas' },
      { nombre: 'Press de banca con barra', detalle: '3×8-10', grupo: 'pecho' },
      { nombre: 'Dominadas asistidas o jalón', detalle: '3×8-10', grupo: 'espalda' },
      { nombre: 'Press Arnold', detalle: '3×10', grupo: 'hombros' },
      { nombre: 'Hip thrust a una pierna', detalle: '3×10 por lado', grupo: 'glúteos' },
      { nombre: 'Curl con barra', detalle: '3×10', grupo: 'bíceps' },
      { nombre: 'Patada de tríceps en polea', detalle: '3×12', grupo: 'tríceps' },
      { nombre: 'Plancha con toque de hombros', detalle: '3×20 toques', grupo: 'core' },
    ],
    progresion: PROG_GYM,
  },
];

export const RUTINAS_CASA: Rutina[] = [
  {
    slug: 'casa-a',
    lugar: 'casa',
    titulo: 'Circuito A',
    subtitulo: 'La base · peso corporal',
    estructura:
      'Circuito/HIT. 3 a 4 vueltas, 40 seg de trabajo / 20 de descanso por ejercicio. Solo peso corporal (o mancuernas si tenés).',
    ejercicios: [
      { nombre: 'Sentadillas', detalle: '40 seg / 15-20 reps' },
      { nombre: 'Flexiones de brazos', detalle: '40 seg / máximo', grupo: 'normales, de rodillas o inclinadas' },
      { nombre: 'Estocadas alternadas', detalle: '40 seg / 10 por pierna' },
      { nombre: 'Fondos de tríceps en silla', detalle: '40 seg / máximo' },
      { nombre: 'Puente de glúteos', detalle: '40 seg / 15-20 reps' },
      { nombre: 'Mountain climbers', detalle: '40 seg' },
      { nombre: 'Burpees', detalle: '40 seg' },
      { nombre: 'Skipping (rodillas al pecho)', detalle: '40 seg' },
      { nombre: 'Plancha abdominal', detalle: '40 seg' },
    ],
    progresion: PROG_CASA,
  },
  {
    slug: 'casa-b',
    lugar: 'casa',
    titulo: 'Circuito B',
    subtitulo: 'Más piernas y core · peso corporal',
    estructura:
      'Circuito/HIT. 3 a 4 vueltas, 40 seg de trabajo / 20 de descanso. Otra selección para variar.',
    ejercicios: [
      { nombre: 'Sentadilla sumo (piernas abiertas)', detalle: '40 seg / 15-20 reps' },
      { nombre: 'Flexiones diamante', detalle: '40 seg / máximo', grupo: 'tríceps/pecho' },
      { nombre: 'Zancada caminando', detalle: '40 seg / 10 por pierna' },
      { nombre: 'Elevación de cadera a una pierna', detalle: '40 seg / alternando' },
      { nombre: 'Escaladores cruzados', detalle: '40 seg', grupo: 'core' },
      { nombre: 'Jumping jacks (saltos de tijera)', detalle: '40 seg' },
      { nombre: 'Rodillas altas en el lugar', detalle: '40 seg' },
      { nombre: 'Plancha lateral', detalle: '40 seg por lado' },
    ],
    progresion: PROG_CASA,
  },
  {
    slug: 'casa-c',
    lugar: 'casa',
    titulo: 'Circuito C',
    subtitulo: 'Fuerza y control · peso corporal',
    estructura:
      'Circuito con tempo más lento y control. 3 a 4 vueltas, 40 seg de trabajo / 20 de descanso.',
    ejercicios: [
      { nombre: 'Sentadilla búlgara (pie atrás en silla)', detalle: '40 seg / por pierna' },
      { nombre: 'Flexiones inclinadas (manos elevadas)', detalle: '40 seg / máximo' },
      { nombre: 'Desplante lateral', detalle: '40 seg / alternando' },
      { nombre: 'Fondos en silla', detalle: '40 seg / máximo', grupo: 'tríceps' },
      { nombre: 'Puente de glúteos con pausa', detalle: '40 seg' },
      { nombre: 'Bear crawl (marcha del oso)', detalle: '40 seg', grupo: 'core/hombros' },
      { nombre: 'Burpees sin salto', detalle: '40 seg' },
      { nombre: 'Hollow hold (barquito)', detalle: '40 seg', grupo: 'core' },
    ],
    progresion: PROG_CASA,
  },
  {
    slug: 'casa-d',
    lugar: 'casa',
    titulo: 'Circuito D',
    subtitulo: 'Cardio y potencia · peso corporal',
    estructura:
      'Circuito más explosivo para subir pulsaciones. 3 a 4 vueltas, 40 seg de trabajo / 20 de descanso. Cuidá la técnica en los saltos.',
    ejercicios: [
      { nombre: 'Sentadilla con salto', detalle: '40 seg' },
      { nombre: 'Flexiones pike (para hombros)', detalle: '40 seg / máximo' },
      { nombre: 'Zancada con salto alternada', detalle: '40 seg' },
      { nombre: 'Fondos en silla con pies elevados', detalle: '40 seg', grupo: 'tríceps' },
      { nombre: 'Peso muerto a una pierna (con mochila si tenés)', detalle: '40 seg / por lado' },
      { nombre: 'Plancha escaladora', detalle: '40 seg', grupo: 'core' },
      { nombre: 'Sprint en el lugar', detalle: '40 seg' },
      { nombre: 'Plancha abdominal', detalle: '40 seg' },
    ],
    progresion: PROG_CASA,
  },
];

export const RECOMENDACIONES_GYM = [
  'Comé alrededor de 1,6 a 2 g de proteína por kilo de peso corporal por día para acompañar el entrenamiento.',
  'Dormí 7 a 8 horas: el músculo se construye descansando, no solo entrenando.',
  'Tomá suficiente agua durante todo el día.',
  'Priorizá comida real por sobre suplementos. La base es el plato, no el polvo.',
  'No busques entrenar más días, buscá entrenar mejor los días que vas.',
];

export const RECOMENDACIONES_CASA = [
  'Con peso corporal también se progresa: más reps, más vueltas, menos descanso.',
  'Cuidá la técnica antes que la velocidad.',
  'Un espacio de 2×2 metros y ganas alcanzan. No hay excusa de "no tengo gym".',
  'Igual que en el gym: proteína, agua, sueño y constancia.',
];
