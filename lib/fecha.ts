// Helpers de fecha. Todo el sistema "vive" en hora de Paraguay:
// el día del reto cambia a medianoche de Asunción, sin importar dónde corra el servidor.

const TZ = 'America/Asuncion';

/** Fecha de hoy (YYYY-MM-DD) en hora de Paraguay. */
export function hoyISO(ahora: Date = new Date()): string {
  return ahora.toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Suma (o resta) días a una fecha ISO. */
export function sumarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Ayer (YYYY-MM-DD) en hora de Paraguay. */
export function ayerISO(ahora: Date = new Date()): string {
  return sumarDias(hoyISO(ahora), -1);
}

/** Días entre dos fechas ISO (b - a). */
export function diffDias(aISO: string, bISO: string): number {
  const [ay, am, ad] = aISO.split('-').map(Number);
  const [by, bm, bd] = bISO.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** "lunes 14 de julio" — para mostrar en pantalla. */
export function formatoLargo(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-PY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}
