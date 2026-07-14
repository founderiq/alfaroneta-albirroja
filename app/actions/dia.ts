'use server';

// Acciones del día: marcar hábitos, declarar descanso y repesca.
// Reglas duras que se validan SIEMPRE del lado servidor:
//  - Solo se puede editar HOY o el día inmediato anterior (repesca, ventana de 24 h).
//  - No se pueden tocar días de una carrera anterior.
//  - gano_dia se recalcula acá, nunca lo manda el cliente.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ayerISO, hoyISO } from '@/lib/fecha';
import {
  calcularGanoDia,
  diaDelReto,
  type ApoyosCumplidos,
} from '@/lib/reto';
import { esSlugDeApoyoValido } from '@/lib/habitos';

export type LogActualizado = {
  fecha: string;
  es_descanso: boolean;
  capitan_cumplido: boolean;
  apoyos_cumplidos: ApoyosCumplidos;
  gano_dia: boolean;
};

export type ResultadoDia =
  | { ok: true; log: LogActualizado }
  | { ok: false; error: string };

type Cambio =
  | { tipo: 'capitan'; valor: boolean }
  | { tipo: 'apoyo'; slug: string; valor: boolean }
  | { tipo: 'descanso'; valor: boolean };

async function aplicarCambio(fecha: string, cambio: Cambio): Promise<ResultadoDia> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tu sesión venció. Volvé a iniciar sesión.' };

  const hoy = hoyISO();
  const ayer = ayerISO();
  if (fecha !== hoy && fecha !== ayer) {
    return {
      ok: false,
      error: 'Ese día ya está cerrado. Solo podés marcar hoy o el día anterior (repesca).',
    };
  }

  const [{ data: perfil }, { data: run }] = await Promise.all([
    supabase
      .from('profiles')
      .select('habitos_apoyo, fecha_inicio_reto')
      .eq('id', user.id)
      .single(),
    supabase
      .from('challenge_runs')
      .select('id, fecha_inicio')
      .eq('profile_id', user.id)
      .eq('activo', true)
      .maybeSingle(),
  ]);

  if (!perfil) return { ok: false, error: 'No encontramos tu perfil.' };

  const fechaInicio: string = run?.fecha_inicio ?? perfil.fecha_inicio_reto;
  if (fecha < fechaInicio) {
    return { ok: false, error: 'Ese día es anterior al inicio de tu reto.' };
  }

  if (cambio.tipo === 'apoyo') {
    if (!esSlugDeApoyoValido(cambio.slug) || !perfil.habitos_apoyo.includes(cambio.slug)) {
      return { ok: false, error: 'Ese hábito no está entre tus elegidos.' };
    }
  }

  const { data: existente } = await supabase
    .from('daily_logs')
    .select('es_descanso, capitan_cumplido, apoyos_cumplidos')
    .eq('profile_id', user.id)
    .eq('fecha', fecha)
    .maybeSingle();

  const log = {
    es_descanso: existente?.es_descanso ?? false,
    capitan_cumplido: existente?.capitan_cumplido ?? false,
    apoyos_cumplidos: (existente?.apoyos_cumplidos ?? {}) as ApoyosCumplidos,
  };

  if (cambio.tipo === 'capitan') log.capitan_cumplido = cambio.valor;
  if (cambio.tipo === 'descanso') log.es_descanso = cambio.valor;
  if (cambio.tipo === 'apoyo') {
    log.apoyos_cumplidos = { ...log.apoyos_cumplidos, [cambio.slug]: cambio.valor };
  }

  const gano = calcularGanoDia(log, perfil.habitos_apoyo);

  const { error } = await supabase.from('daily_logs').upsert(
    {
      profile_id: user.id,
      run_id: run?.id ?? null,
      fecha,
      ...log,
      gano_dia: gano,
      dia_reto: diaDelReto(fechaInicio, fecha),
    },
    { onConflict: 'profile_id,fecha' },
  );

  if (error) return { ok: false, error: 'No pudimos guardar. Probá de nuevo.' };

  revalidatePath('/app');
  revalidatePath('/app/repesca');

  return { ok: true, log: { fecha, ...log, gano_dia: gano } };
}

/** Check del hábito capitán (entrené / no entrené) para hoy o ayer. */
export async function marcarCapitan(fecha: string, valor: boolean): Promise<ResultadoDia> {
  return aplicarCambio(fecha, { tipo: 'capitan', valor });
}

/** Check de un hábito de apoyo para hoy o ayer. */
export async function marcarApoyo(
  fecha: string,
  slug: string,
  valor: boolean,
): Promise<ResultadoDia> {
  return aplicarCambio(fecha, { tipo: 'apoyo', slug, valor });
}

/** Declarar (o deshacer) día de descanso. Cumple el capitán automáticamente. */
export async function declararDescanso(fecha: string, valor: boolean): Promise<ResultadoDia> {
  return aplicarCambio(fecha, { tipo: 'descanso', valor });
}

/** Atajo del menú: marcar HOY como día de descanso. */
export async function declararDescansoHoy(): Promise<ResultadoDia> {
  return aplicarCambio(hoyISO(), { tipo: 'descanso', valor: true });
}
