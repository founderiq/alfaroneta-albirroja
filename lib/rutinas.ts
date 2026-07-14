// Rutinas de entrenamiento (sección 7 del documento de contexto).
// Contenido estático, precargado tal cual el documento.

export type Ejercicio = {
  nombre: string;
  detalle: string; // series/reps o tiempo
  grupo?: string;
};

export type Rutina = {
  slug: 'gym' | 'casa';
  titulo: string;
  subtitulo: string;
  estructura: string;
  ejercicios: Ejercicio[];
  progresion: string;
  recomendaciones: string[];
};

export const RUTINA_GYM: Rutina = {
  slug: 'gym',
  titulo: 'Rutina Gym',
  subtitulo: 'Full body · 3 series de 8-10 reps',
  estructura:
    '1 ejercicio por grupo grande, 3 series de 8-10 reps cada uno. Descansá 60-90 segundos entre series.',
  ejercicios: [
    { nombre: 'Sentadilla con barra o mancuernas', detalle: '3×8-10', grupo: 'piernas/glúteos' },
    { nombre: 'Press de banca o press con mancuernas', detalle: '3×8-10', grupo: 'pecho' },
    { nombre: 'Remo con barra o mancuerna', detalle: '3×8-10', grupo: 'espalda' },
    { nombre: 'Press militar de hombros (barra o mancuernas)', detalle: '3×8-10', grupo: 'hombros' },
    { nombre: 'Peso muerto rumano con mancuernas o barra', detalle: '3×8-10', grupo: 'femoral/glúteo' },
    { nombre: 'Curl de bíceps', detalle: '3×10', grupo: 'bíceps' },
    { nombre: 'Extensión de tríceps en polea o fondos', detalle: '3×10', grupo: 'tríceps' },
    { nombre: 'Plancha abdominal', detalle: '3× máximo aguante', grupo: 'core' },
  ],
  progresion:
    'Trabajá siempre en el rango de 8 a 10 repeticiones. Cuando logres hacer 10 reps limpias en las 3 series de un ejercicio, subí un poco el peso la próxima sesión y volvé a arrancar cerca de 8. Así siempre estás progresando sin complicarte.',
  recomendaciones: [
    'Comé alrededor de 1,6 a 2 g de proteína por kilo de peso corporal por día para acompañar el entrenamiento.',
    'Dormí 7 a 8 horas: el músculo se construye descansando, no solo entrenando.',
    'Tomá suficiente agua durante todo el día.',
    'Priorizá comida real por sobre suplementos. La base es el plato, no el polvo.',
    'No busques entrenar más días, buscá entrenar mejor los días que vas.',
  ],
};

export const RUTINA_CASA: Rutina = {
  slug: 'casa',
  titulo: 'Rutina Casa',
  subtitulo: 'Full body · peso corporal / mínimo equipo',
  estructura:
    'Estilo circuito/HIT. 3 a 4 vueltas al circuito, 40 segundos de trabajo / 20 de descanso por ejercicio, o por reps donde aplique. Solo peso corporal (o mancuernas si las tenés).',
  ejercicios: [
    { nombre: 'Sentadillas (peso corporal)', detalle: '40 seg / 15-20 reps' },
    { nombre: 'Flexiones de brazos', detalle: '40 seg / máximo', grupo: 'variante según nivel: normales, de rodillas o inclinadas' },
    { nombre: 'Estocadas alternadas', detalle: '40 seg / 10 por pierna' },
    { nombre: 'Fondos de tríceps en silla', detalle: '40 seg / máximo' },
    { nombre: 'Puente de glúteos', detalle: '40 seg / 15-20 reps' },
    { nombre: 'Mountain climbers', detalle: '40 seg' },
    { nombre: 'Burpees', detalle: '40 seg' },
    { nombre: 'Skipping (rodillas al pecho en el lugar)', detalle: '40 seg' },
    { nombre: 'Plancha abdominal', detalle: '40 seg' },
    { nombre: 'Press militar de hombros', detalle: '40 seg / 10-12 reps', grupo: 'opcional, con mancuernas' },
  ],
  progresion:
    'Cuando el circuito te resulte fácil, sumá una vuelta más (de 3 a 4, de 4 a 5) o acortá el descanso de 20 a 15 segundos. Para flexiones, andá pasando de la variante fácil a la difícil a medida que ganás fuerza.',
  recomendaciones: [
    'Con peso corporal también se progresa: más reps, más vueltas, menos descanso.',
    'Cuidá la técnica antes que la velocidad.',
    'Un espacio de 2×2 metros y ganas alcanzan. No hay excusa de "no tengo gym".',
    'Igual que en el gym: proteína, agua, sueño y constancia.',
  ],
};

export const RUTINAS: Rutina[] = [RUTINA_GYM, RUTINA_CASA];
