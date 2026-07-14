'use server';

// Registro completo: valida los datos del onboarding, crea la cuenta y casa el
// código único con la cuenta de forma atómica (1 código = 1 cuenta para siempre).
// Si el código no existe o ya fue usado, NO se crea ninguna cuenta.

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { hoyISO } from '@/lib/fecha';
import { esSlugDeApoyoValido, MAX_APOYOS } from '@/lib/habitos';

export type DatosRegistro = {
  objetivo: string;
  nivel: string;
  frecuencia: number;
  apoyos: string[];
  nombre: string;
  correo: string;
  password: string;
  sexo: 'hombre' | 'mujer';
  edad: number;
  disclaimer: boolean;
  codigo: string;
};

export type ResultadoRegistro =
  | { ok: true; sesionIniciada: boolean }
  | { ok: false; error: string };

/** Normaliza "alf x7k2 9qmn" / "ALFX7K29QMN" → "ALF-X7K2-9QMN". */
function normalizarCodigo(entrada: string): string | null {
  const limpio = entrada.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^ALF[A-Z0-9]{8}$/.test(limpio)) return null;
  return `ALF-${limpio.slice(3, 7)}-${limpio.slice(7, 11)}`;
}

function validar(d: DatosRegistro): string | null {
  if (!d.nombre || d.nombre.trim().length < 3) return 'Poné tu nombre y apellido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim()))
    return 'Ese correo no parece válido.';
  if (!d.password || d.password.length < 8)
    return 'La contraseña tiene que tener al menos 8 caracteres.';
  if (!Number.isInteger(d.frecuencia) || d.frecuencia < 3 || d.frecuencia > 7)
    return 'Elegí cuántos días por semana vas a entrenar (3 a 7).';
  if (!Array.isArray(d.apoyos) || d.apoyos.length < 1 || d.apoyos.length > MAX_APOYOS)
    return 'Elegí entre 1 y 3 hábitos de apoyo.';
  if (new Set(d.apoyos).size !== d.apoyos.length || !d.apoyos.every(esSlugDeApoyoValido))
    return 'Hay un hábito de apoyo inválido. Volvé a elegirlos.';
  if (d.sexo !== 'hombre' && d.sexo !== 'mujer') return 'Elegí una opción de sexo.';
  if (!Number.isInteger(d.edad) || d.edad < 12 || d.edad > 100)
    return 'Poné una edad válida.';
  if (!d.disclaimer) return 'Tenés que aceptar el aviso de salud para continuar.';
  return null;
}

export async function registrarCuenta(datos: DatosRegistro): Promise<ResultadoRegistro> {
  const errorValidacion = validar(datos);
  if (errorValidacion) return { ok: false, error: errorValidacion };

  const codigo = normalizarCodigo(datos.codigo ?? '');
  if (!codigo) {
    return { ok: false, error: 'El código no tiene el formato correcto (ALF-XXXX-XXXX).' };
  }

  const admin = createAdminClient();
  const correo = datos.correo.trim().toLowerCase();
  const hoy = hoyISO();

  // 1. ¿El código existe y está libre? (chequeo previo para dar un error claro;
  //    la reserva real es atómica más abajo)
  const { data: fila, error: errorCodigo } = await admin
    .from('codes')
    .select('id, usado')
    .eq('codigo', codigo)
    .maybeSingle();

  if (errorCodigo) return { ok: false, error: 'No pudimos validar el código. Probá de nuevo.' };
  if (!fila) return { ok: false, error: 'Ese código no existe. Revisá tu voucher e intentá de nuevo.' };
  if (fila.usado) return { ok: false, error: 'Ese código ya fue usado para activar otra cuenta.' };

  // 2. Crear el usuario (el código es la validación de compra, así que el correo
  //    se da por confirmado; la recuperación de contraseña igual va por correo).
  const { data: creado, error: errorUsuario } = await admin.auth.admin.createUser({
    email: correo,
    password: datos.password,
    email_confirm: true,
    user_metadata: { nombre_apellido: datos.nombre.trim() },
  });

  if (errorUsuario || !creado?.user) {
    const msg = errorUsuario?.message ?? '';
    if (/already|registered|exists/i.test(msg)) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo. Iniciá sesión.' };
    }
    return { ok: false, error: 'No pudimos crear tu cuenta. Probá de nuevo en un rato.' };
  }
  const userId = creado.user.id;

  const limpiarUsuario = async () => {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
  };

  // 3. Reserva ATÓMICA del código: solo pasa si sigue sin usarse.
  //    Si dos personas cargan el mismo código a la vez, una sola gana.
  const { data: reservado, error: errorReserva } = await admin
    .from('codes')
    .update({ usado: true, profile_id: userId })
    .eq('id', fila.id)
    .eq('usado', false)
    .select('id');

  if (errorReserva || !reservado || reservado.length === 0) {
    await limpiarUsuario();
    return { ok: false, error: 'Ese código ya fue usado para activar otra cuenta.' };
  }

  const liberarCodigo = async () => {
    // supabase-js no lanza: los errores vienen en el resultado, acá se ignoran
    await admin.from('codes').update({ usado: false, profile_id: null }).eq('id', fila.id);
  };

  // 4. Perfil + carrera inicial.
  const { error: errorPerfil } = await admin.from('profiles').insert({
    id: userId,
    nombre_apellido: datos.nombre.trim(),
    correo,
    sexo: datos.sexo,
    edad: datos.edad,
    objetivo: datos.objetivo,
    nivel: datos.nivel,
    frecuencia_entrenamiento: datos.frecuencia,
    fecha_inicio_reto: hoy,
    habitos_apoyo: datos.apoyos,
    codigo_id: fila.id,
  });

  if (errorPerfil) {
    await liberarCodigo();
    await limpiarUsuario();
    return { ok: false, error: 'No pudimos crear tu perfil. Probá de nuevo.' };
  }

  const { error: errorRun } = await admin.from('challenge_runs').insert({
    profile_id: userId,
    fecha_inicio: hoy,
    activo: true,
  });

  if (errorRun) {
    await admin.from('profiles').delete().eq('id', userId);
    await liberarCodigo();
    await limpiarUsuario();
    return { ok: false, error: 'No pudimos arrancar tu reto. Probá de nuevo.' };
  }

  // 5. Iniciar sesión en este dispositivo (cookies persistentes).
  const supabase = await createClient();
  const { error: errorLogin } = await supabase.auth.signInWithPassword({
    email: correo,
    password: datos.password,
  });

  return { ok: true, sesionIniciada: !errorLogin };
}
