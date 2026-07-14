import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Pantalla 0 — Bienvenida. Todas las pulseras apuntan acá.
// Con sesión activa se entra directo a "El partido de hoy".
export default async function Bienvenida() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: perfil } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (perfil) redirect('/app');
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-10">
      <p className="text-sm font-black tracking-[0.2em] text-neutral-400">
        ALFARONETA
      </p>

      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-neutral-900 text-3xl">
          ⚽
        </div>
        <h1 className="text-4xl leading-tight font-black">
          Bienvenido/a a tu Pretemporada
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          60 días para volver a tu mejor versión. Un partido a la vez.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <span className="h-px w-8 bg-neutral-300" aria-hidden />
          El Mundial termina, la garra guaraní continúa.
        </p>
      </div>

      <div className="pb-safe sticky bottom-0 bg-gradient-to-t from-[#f4f4f2] via-[#f4f4f2] to-transparent pt-4 pb-6">
        <Link
          href="/onboarding"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-neutral-900 text-base font-bold text-white transition active:scale-[0.98]"
        >
          Empezar
        </Link>
        <p className="mt-4 text-center text-sm text-neutral-600">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-bold text-neutral-900 underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
