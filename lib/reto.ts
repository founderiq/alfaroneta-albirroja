// Reglas del reto (sección 5 del documento de contexto).
//
// - Ganar el día: capitán cumplido (entrenó O declaró descanso) + al menos 2 de 3 apoyos.
//   Si el usuario eligió menos de 2 apoyos, se le exigen todos los que eligió.
// - Silencio = día no ganado (nunca se asume descanso).
// - Racha: días ganados consecutivos; perder un día la vuelve a 0.
// - Partidos ganados y fecha del campeonato NUNCA se borran por perder.
// - Tarjetas: amarilla al perder 1 día, roja al perder 2 seguidos. Solo señal visual.
// - 60 días = fechas 1 a 8 de 7 días + fecha 9 (días 57 a 60, incluye la final).

import { diffDias, sumarDias } from './fecha';

export const DIAS_RETO = 60;
export const FECHAS_CAMPEONATO = 9;

export type ApoyosCumplidos = Record<string, boolean>;

export type DailyLog = {
  fecha: string; // YYYY-MM-DD
  es_descanso: boolean;
  capitan_cumplido: boolean;
  apoyos_cumplidos: ApoyosCumplidos;
  gano_dia: boolean;
};

export type NivelTarjeta = 'bronce' | 'plata' | 'oro';
export type TarjetaDisciplina = 'amarilla' | 'roja' | null;

/** Día del reto para una fecha dada (el día de inicio es el día 1). */
export function diaDelReto(fechaInicio: string, fecha: string): number {
  return diffDias(fechaInicio, fecha) + 1;
}

/** Fecha del campeonato (1-9) para un día del reto. */
export function fechaDelCampeonato(dia: number): number {
  return Math.min(Math.ceil(Math.max(dia, 1) / 7), FECHAS_CAMPEONATO);
}

/** Cuántos apoyos hacen falta para ganar el día según cuántos eligió. */
export function apoyosNecesarios(cantidadElegida: number): number {
  return Math.min(2, Math.max(cantidadElegida, 0));
}

export function contarApoyosCumplidos(
  apoyos: ApoyosCumplidos | null | undefined,
  elegidos: string[],
): number {
  if (!apoyos) return 0;
  return elegidos.filter((slug) => apoyos[slug] === true).length;
}

/** Regla central: ¿se gana el día con este registro? */
export function calcularGanoDia(
  log: Pick<DailyLog, 'es_descanso' | 'capitan_cumplido' | 'apoyos_cumplidos'>,
  apoyosElegidos: string[],
): boolean {
  const capitanOk = log.capitan_cumplido || log.es_descanso;
  const cumplidos = contarApoyosCumplidos(log.apoyos_cumplidos, apoyosElegidos);
  return capitanOk && cumplidos >= apoyosNecesarios(apoyosElegidos.length);
}

export function nivelPorGanados(ganados: number): NivelTarjeta {
  if (ganados >= 40) return 'oro';
  if (ganados >= 20) return 'plata';
  return 'bronce';
}

export type Metricas = {
  diaHoy: number; // día del reto que corresponde a hoy (puede pasar de 60)
  fechaCampeonato: number; // 1-9
  esLaFinal: boolean; // hoy es el día 60
  retoCompleto: boolean; // ya pasaron los 60 días
  ganados: number;
  jugados: number; // días cerrados + hoy si ya lo ganó
  efectividad: number | null; // % ganados/jugados, null si todavía no jugó ninguno
  racha: number;
  tarjeta: TarjetaDisciplina;
  nivel: NivelTarjeta;
  hoyGanado: boolean;
  capitanCumplidos: number; // días con actividad física hecha (para la garantía)
};

/**
 * Calcula todas las métricas de la carrera activa.
 * `logs` deben ser los registros de la carrera activa (fecha >= fechaInicio).
 */
export function calcularMetricas(
  logs: DailyLog[],
  fechaInicio: string,
  hoy: string,
): Metricas {
  const porFecha = new Map(logs.map((l) => [l.fecha, l]));
  const logDeDia = (dia: number) => porFecha.get(sumarDias(fechaInicio, dia - 1));
  const gano = (dia: number) => logDeDia(dia)?.gano_dia === true;

  const diaHoy = Math.max(diaDelReto(fechaInicio, hoy), 1);
  const retoCompleto = diaHoy > DIAS_RETO;
  const diasCerrados = Math.min(diaHoy - 1, DIAS_RETO);
  const hoyGanado = !retoCompleto && gano(diaHoy);

  let ganados = 0;
  let capitanCumplidos = 0;
  for (let d = 1; d <= Math.min(diaHoy, DIAS_RETO); d++) {
    const esHoy = d === diaHoy;
    const log = logDeDia(d);
    if (log?.gano_dia && (!esHoy || hoyGanado)) ganados++;
    if (log?.capitan_cumplido) capitanCumplidos++;
  }

  const jugados = diasCerrados + (hoyGanado ? 1 : 0);
  const efectividad = jugados > 0 ? Math.round((ganados / jugados) * 100) : null;

  // Racha: victorias consecutivas terminando en el último día decidido
  // (hoy si ya lo ganó; si no, ayer). Un día sin registro corta la racha.
  let racha = 0;
  let d = hoyGanado ? diaHoy : diasCerrados;
  while (d >= 1 && gano(d)) {
    racha++;
    d--;
  }

  // Tarjetas: miran los últimos días CERRADOS (hoy todavía está en juego).
  const perdio = (dia: number) => dia >= 1 && dia <= diasCerrados && !gano(dia);
  let tarjeta: TarjetaDisciplina = null;
  if (perdio(diaHoy - 1)) {
    tarjeta = perdio(diaHoy - 2) ? 'roja' : 'amarilla';
  }

  return {
    diaHoy,
    fechaCampeonato: fechaDelCampeonato(Math.min(diaHoy, DIAS_RETO)),
    esLaFinal: diaHoy === DIAS_RETO,
    retoCompleto,
    ganados,
    jugados,
    efectividad,
    racha,
    tarjeta,
    nivel: nivelPorGanados(ganados),
    hoyGanado,
    capitanCumplidos,
  };
}

/** Índice de la frase del día: misma frase para todo el mundo en un día dado. */
export function idFraseDelDia(hoy: string, totalFrases = 200): number {
  const dias = diffDias('2026-01-01', hoy);
  // módulo siempre positivo, ids de la tabla phrases van de 1 a 200
  return ((dias % totalFrases) + totalFrases) % totalFrases + 1;
}
