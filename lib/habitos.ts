// Catálogo cerrado de hábitos. El capitán es fijo; los de apoyo se eligen (hasta 3).

export const CAPITAN = {
  slug: 'capitan',
  label: 'Actividad física · 45 minutos',
  descripcion:
    'Es el innegociable. Vos elegís cómo: gym, correr, caminar, fútbol, bici, lo que te haga bien.',
} as const;

export type HabitoApoyo = {
  slug: string;
  label: string;
  emoji: string;
};

export const HABITOS_APOYO: HabitoApoyo[] = [
  { slug: 'despertar-630', label: 'Despertarme antes de las 6:30', emoji: '⏰' },
  { slug: 'agua-25l', label: 'Tomar 2,5 L de agua', emoji: '💧' },
  { slug: 'dormir-7h', label: 'Dormir 7+ horas', emoji: '😴' },
  { slug: 'leer-15min', label: 'Leer 15 minutos (no ficción)', emoji: '📖' },
  { slug: 'sin-azucar', label: 'Comer sin azúcar / ultraprocesados', emoji: '🥦' },
  { slug: 'sin-alcohol', label: 'Sin alcohol ni fumar/vapear', emoji: '🚭' },
  { slug: 'sin-porno', label: 'Nada de porno', emoji: '🧠' },
];

export const MAX_APOYOS = 3;

export function labelDeApoyo(slug: string): string {
  return HABITOS_APOYO.find((h) => h.slug === slug)?.label ?? slug;
}

export function esSlugDeApoyoValido(slug: string): boolean {
  return HABITOS_APOYO.some((h) => h.slug === slug);
}

export const OBJETIVOS = [
  'Bajar de peso',
  'Ganar masa muscular',
  'Crear el hábito de entrenar',
  'Sentirme mejor con mi cuerpo y mi cabeza',
] as const;

export const NIVELES = [
  'Cero, arranco de nuevo',
  'Algo suelto, sin constancia',
  'Entreno pero quiero más',
  'Estoy en ritmo, quiero sostenerlo',
] as const;

export const FRECUENCIAS = [3, 4, 5, 6, 7] as const;
