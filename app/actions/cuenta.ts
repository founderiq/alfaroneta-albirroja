'use server';

// Acciones de cuenta: reiniciar el reto, editar hábitos de apoyo, cerrar sesión.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hoyISO } from '@/lib/fecha';
import { calcularGanoDia, type ApoyosCumplidos } from '@/lib/reto';
import { esSlugDeApoyoValido, MAX_APOYOS } from '@/lib/habitos';

export type ResultadoSimple = { ok: true } | { ok: false; error: string };

/**
 * Reinicio voluntario: cierra la carrera activa (el historial se conserva en
 * challenge_runs y sus daily_logs) y abre una nueva desde hoy. El registro de
 * hoy se borra para arrancar el día 1 en blanco. Solo el usuario reinicia;
 * el sistema NUNCA reinicia solo.
 */
export async function reiniciarReto(): Promise<ResultadoSimple> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tu sesión venció. Volvé a iniciar sesión.' };

  const hoy = hoyISO();

  const { error: errorCerrar } = await supabase
    .from('challenge_runs')
    .update({ activo: false, fecha_fin: hoy })
    .eq('profile_id', user.id)
    .eq('activo', true);

  if (errorCerrar) return { ok: false, error: 'No pudimos reiniciar. Probá de nuevo.' };

  await supabase.from('daily_logs').delete().eq('profile_id', user.id).eq('fecha', hoy);

  const [{ error: errorRun }, { error: errorPerfil }] = await Promise.all([
    supabase
      .from('challenge_runs')
      .insert({ profile_id: user.id, fecha_inicio: hoy, activo: true }),
    supabase.from('profiles').update({ fecha_inicio_reto: hoy }).eq('id', user.id),
  ]);

  if (errorRun || errorPerfil) {
    return { ok: false, error: 'No pudimos reiniciar. Probá de nuevo.' };
  }

  revalidatePath('/app');
  return { ok: true };
}

/** Editar los hábitos de apoyo (opcional, desde Mi perfil). Recalcula el día de hoy. */
export async function actualizarApoyos(slugs: string[]): Promise<ResultadoSimple> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tu sesión venció. Volvé a iniciar sesión.' };

  if (
    !Array.isArray(slugs) ||
    slugs.length < 1 ||
    slugs.length > MAX_APOYOS ||
    new Set(slugs).size !== slugs.length ||
    !slugs.every(esSlugDeApoyoValido)
  ) {
    return { ok: false, error: 'Elegí entre 1 y 3 hábitos válidos.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ habitos_apoyo: slugs })
    .eq('id', user.id);

  if (error) return { ok: false, error: 'No pudimos guardar los cambios.' };

  // Si hoy ya tiene registro, el resultado del día se recalcula con los nuevos apoyos.
  const hoy = hoyISO();
  const { data: logHoy } = await supabase
    .from('daily_logs')
    .select('id, es_descanso, capitan_cumplido, apoyos_cumplidos')
    .eq('profile_id', user.id)
    .eq('fecha', hoy)
    .maybeSingle();

  if (logHoy) {
    const gano = calcularGanoDia(
      {
        es_descanso: logHoy.es_descanso,
        capitan_cumplido: logHoy.capitan_cumplido,
        apoyos_cumplidos: (logHoy.apoyos_cumplidos ?? {}) as ApoyosCumplidos,
      },
      slugs,
    );
    await supabase.from('daily_logs').update({ gano_dia: gano }).eq('id', logHoy.id);
  }

  revalidatePath('/app');
  revalidatePath('/app/perfil');
  return { ok: true };
}

/** Cerrar sesión y volver a la bienvenida. */
export async function cerrarSesion(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
