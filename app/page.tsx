import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Etiqueta } from '@/components/ui';

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
      <p className="text-sm font-black tracking-[0.25em] text-white">
        ALFARONETA
      </p>

      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="mb-6">
          <Etiqueta>◆ LA PRETEMPORADA · GARRA GUARANÍ</Etiqueta>
        </div>
        <h1 className="text-5xl leading-[0.95] font-black tracking-tight">
          El Mundial
          <br />
          termina.
          <br />
          <span className="text-rojo">La garra queda.</span>
        </h1>
        <p className="mt-5 text-lg text-tenue">
          60 días para volver a tu mejor versión. Tocás, entrenás, ganás el día.
          Un partido a la vez.
        </p>
      </div>

      <div className="pb-safe sticky bottom-0 bg-gradient-to-t from-fondo from-60% via-fondo to-transparent pt-6">
        <Link
          href="/onboarding"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-rojo text-base font-bold text-white shadow-[0_8px_30px_-8px_rgba(237,28,36,0.6)] transition active:scale-[0.98]"
        >
          Empezar mi reto <span aria-hidden>→</span>
        </Link>
        <p className="mt-4 text-center text-sm text-tenue">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-bold text-white underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
