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
  const rid = Math.random().toString(36).slice(2, 8); // id corto para agrupar los logs de este intento
  const log = (...args: unknown[]) => console.log(`[registro:${rid}]`, ...args);

  const errorValidacion = validar(datos);
  if (errorValidacion) {
    log('validación falló:', errorValidacion);
    return { ok: false, error: errorValidacion };
  }

  const codigo = normalizarCodigo(datos.codigo ?? '');
  if (!codigo) {
    log('formato de código inválido, entrada:', JSON.stringify(datos.codigo));
    return { ok: false, error: 'El código no tiene el formato correcto (ALF-XXXX-XXXX).' };
  }

  log('arranca, código normalizado:', codigo, 'correo:', datos.correo);

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

  if (errorCodigo) {
    log('error consultando codes:', errorCodigo.message, errorCodigo.code);
    return { ok: false, error: 'No pudimos validar el código. Probá de nuevo.' };
  }
  if (!fila) {
    log('código no encontrado en la tabla codes:', codigo);
    return { ok: false, error: 'Ese código no existe. Revisá tu voucher e intentá de nuevo.' };
  }
  log('código encontrado, id:', fila.id, 'usado:', fila.usado);
  if (fila.usado) {
    log('rechazado: ya estaba usado en el paso 1');
    return { ok: false, error: 'Ese código ya fue usado para activar otra cuenta.' };
  }

  // 2. Crear el usuario (el código es la validación de compra, así que el correo
  //    se da por confirmado; la recuperación de contraseña igual va por correo).
  const { data: creado, error: errorUsuario } = await admin.auth.admin.createUser({
    email: correo,
    password: datos.password,
    email_confirm: true,
    user_metadata: { nombre_apellido: datos.nombre.trim() },
  });

  if (errorUsuario || !creado?.user) {
    log('error creando usuario en Auth:', errorUsuario?.message, errorUsuario?.status);
    const msg = errorUsuario?.message ?? '';
    if (/already|registered|exists/i.test(msg)) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo. Iniciá sesión.' };
    }
    return { ok: false, error: 'No pudimos crear tu cuenta. Probá de nuevo en un rato.' };
  }
  const userId = creado.user.id;
  log('usuario creado en Auth, id:', userId);

  const limpiarUsuario = async () => {
    log('deshaciendo: borrando usuario', userId);
    await admin.auth.admin.deleteUser(userId).catch((e) => log('fallo al borrar usuario:', e));
  };
  const borrarPerfil = async () => {
    log('deshaciendo: borrando perfil', userId);
    const { error } = await admin.from('profiles').delete().eq('id', userId);
    if (error) log('fallo al borrar perfil:', error.message);
  };

  // 3. Crear el perfil ANTES de tocar el código.
  //    Ojo: codes.profile_id tiene una FK a profiles.id, así que el perfil
  //    tiene que existir antes de poder vincular el código. Al revés, la base
  //    rechaza el update del código (violación de FK) y parece "código usado".
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
    log('error creando perfil:', errorPerfil.message, errorPerfil.code, errorPerfil.details);
    await limpiarUsuario();
    return { ok: false, error: 'No pudimos crear tu perfil. Probá de nuevo.' };
  }
  log('perfil creado ok');

  // 4. Reserva ATÓMICA + vínculo del código: solo pasa si sigue sin usarse.
  //    El perfil ya existe, así que setear profile_id no viola la FK.
  //    Si dos personas cargan el mismo código a la vez, una sola gana el update.
  const { data: reservado, error: errorReserva } = await admin
    .from('codes')
    .update({ usado: true, profile_id: userId })
    .eq('id', fila.id)
    .eq('usado', false)
    .select('id');

  if (errorReserva || !reservado || reservado.length === 0) {
    log(
      'reserva del código falló: error=',
      errorReserva?.message,
      'filas afectadas=',
      reservado?.length ?? 'null',
    );
    await borrarPerfil();
    await limpiarUsuario();
    return { ok: false, error: 'Ese código ya fue usado para activar otra cuenta.' };
  }
  log('código reservado y vinculado ok');

  const liberarCodigo = async () => {
    log('deshaciendo: liberando código', fila.id);
    const { error } = await admin
      .from('codes')
      .update({ usado: false, profile_id: null })
      .eq('id', fila.id);
    if (error) log('fallo al liberar código:', error.message);
  };

  // 5. Carrera inicial del reto.
  const { error: errorRun } = await admin.from('challenge_runs').insert({
    profile_id: userId,
    fecha_inicio: hoy,
    activo: true,
  });

  if (errorRun) {
    log('error creando challenge_run:', errorRun.message, errorRun.code);
    await liberarCodigo();
    await borrarPerfil();
    await limpiarUsuario();
    return { ok: false, error: 'No pudimos arrancar tu reto. Probá de nuevo.' };
  }
  log('challenge_run creado ok, registro completo');

  // 5. Iniciar sesión en este dispositivo (cookies persistentes).
  const supabase = await createClient();
  const { error: errorLogin } = await supabase.auth.signInWithPassword({
    email: correo,
    password: datos.password,
  });
  if (errorLogin) log('login post-registro falló (no bloqueante):', errorLogin.message);

  return { ok: true, sesionIniciada: !errorLogin };
}
