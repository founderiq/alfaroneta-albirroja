// Carga de datos compartida por las pantallas de la app diaria (lado servidor).

import { createClient } from '@/lib/supabase/server';
import { hoyISO } from '@/lib/fecha';
import {
  calcularMetricas,
  idFraseDelDia,
  type DailyLog,
  type Metricas,
} from '@/lib/reto';

export type Perfil = {
  id: string;
  nombre_apellido: string;
  correo: string;
  sexo: string | null;
  edad: number | null;
  objetivo: string | null;
  nivel: string | null;
  frecuencia_entrenamiento: number;
  fecha_inicio_reto: string;
  habitos_apoyo: string[];
  created_at: string;
};

export type Contexto = {
  perfil: Perfil;
  fechaInicio: string;
  hoy: string;
  logs: DailyLog[];
  metricas: Metricas;
};

/** Perfil + carrera activa + registros + métricas del usuario logueado. */
export async function cargarContexto(): Promise<Contexto | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const hoy = hoyISO();

  const [{ data: perfil }, { data: run }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('challenge_runs')
      .select('id, fecha_inicio')
      .eq('profile_id', user.id)
      .eq('activo', true)
      .maybeSingle(),
  ]);

  if (!perfil) return null;

  const fechaInicio: string = run?.fecha_inicio ?? perfil.fecha_inicio_reto;

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('fecha, es_descanso, capitan_cumplido, apoyos_cumplidos, gano_dia')
    .eq('profile_id', user.id)
    .gte('fecha', fechaInicio)
    .lte('fecha', hoy);

  const logsLimpios: DailyLog[] = (logs ?? []).map((l) => ({
    fecha: l.fecha,
    es_descanso: l.es_descanso,
    capitan_cumplido: l.capitan_cumplido,
    apoyos_cumplidos: (l.apoyos_cumplidos ?? {}) as DailyLog['apoyos_cumplidos'],
    gano_dia: l.gano_dia,
  }));

  return {
    perfil: perfil as Perfil,
    fechaInicio,
    hoy,
    logs: logsLimpios,
    metricas: calcularMetricas(logsLimpios, fechaInicio, hoy),
  };
}

const FRASE_FALLBACK = 'Hoy ganá el partido. Solo eso. Solo hoy.';

/** Frase motivacional del día (misma para todo el mundo en un día dado). */
export async function fraseDelDia(hoy: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('phrases')
    .select('texto')
    .eq('id', idFraseDelDia(hoy))
    .maybeSingle();
  return data?.texto ?? FRASE_FALLBACK;
}
