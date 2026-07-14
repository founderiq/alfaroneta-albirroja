'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AvisoError, BotonPrimario, CampoTexto, PieSticky } from '@/components/ui';

export default function LoginForm() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setError(null);
    setCargando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: correo.trim().toLowerCase(),
        password,
      });
      if (error) {
        setError('Correo o contraseña incorrectos. Probá de nuevo.');
        return;
      }
      router.replace('/app');
      router.refresh();
    } catch {
      setError('No pudimos conectar. Revisá tu internet y probá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8">
      <Link
        href="/"
        aria-label="Volver"
        className="grid size-9 place-items-center rounded-full bg-white text-lg shadow-sm"
      >
        ←
      </Link>

      <h1 className="mt-6 text-3xl font-black">Iniciar sesión</h1>
      <p className="mt-2 text-neutral-600">
        Entrá con tu correo y contraseña. La sesión queda guardada en este
        dispositivo: la próxima vez que toques la pulsera entrás directo.
      </p>

      <form
        className="mt-8 flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          void entrar();
        }}
      >
        <div className="space-y-4">
          <CampoTexto
            label="Correo"
            type="email"
            inputMode="email"
            value={correo}
            onChange={setCorreo}
            placeholder="tu@correo.com"
            autoComplete="email"
          />
          <CampoTexto
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Tu contraseña"
            autoComplete="current-password"
          />
          <p className="text-sm">
            <Link href="/recuperar" className="font-semibold text-neutral-600 underline">
              Olvidé mi contraseña
            </Link>
          </p>
        </div>

        <PieSticky>
          <div className="space-y-3">
            <AvisoError>{error}</AvisoError>
            <BotonPrimario
              type="submit"
              cargando={cargando}
              disabled={!correo.trim() || !password}
            >
              Entrar
            </BotonPrimario>
            <p className="text-center text-sm text-neutral-600">
              ¿Todavía no activaste tu pulsera?{' '}
              <Link href="/onboarding" className="font-bold text-neutral-900 underline">
                Crear cuenta
              </Link>
            </p>
          </div>
        </PieSticky>
      </form>
    </main>
  );
}
