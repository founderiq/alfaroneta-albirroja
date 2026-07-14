import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con service role: SOLO del lado servidor.
 * Se usa para el registro (validar/casar códigos y crear la cuenta de forma atómica).
 * La tabla `codes` no tiene policies de RLS, así que solo este cliente puede tocarla.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.',
    );
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
