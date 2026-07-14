'use client';

// Acá cae el link del correo de recuperación. El cliente de Supabase procesa
// el código de la URL automáticamente y deja una sesión temporal para poder
// setear la contraseña nueva.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AvisoError, BotonPrimario, CampoTexto, PieSticky } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [listo, setListo] = useState(false); // ¿hay sesión de recuperación?
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // Si el link trae ?code=, lo canjeamos por una sesión.
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const preparar = async () => {
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      }
      const { data } = await supabase.auth.getSession();
      setListo(!!data.session);
    };
    void preparar();
  }, []);

  const guardar = async () => {
    setError(null);
    if (password.length < 8) {
      setError('La contraseña tiene que tener al menos 8 caracteres.');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setCargando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError('No pudimos guardar la contraseña. Pedí un link nuevo.');
        return;
      }
      router.replace('/app');
      router.refresh();
    } catch {
      setError('No pudimos conectar. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8">
      <h1 className="mt-6 text-3xl font-black">Nueva contraseña</h1>

      {!listo ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-superficie p-6">
          <p className="text-tenue">
            Este link no es válido o ya venció.{' '}
            <Link href="/recuperar" className="font-bold text-white underline">
              Pedí uno nuevo acá.
            </Link>
          </p>
        </div>
      ) : (
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}
        >
          <p className="mt-2 text-tenue">Elegí tu contraseña nueva.</p>
          <div className="mt-8 space-y-4">
            <CampoTexto
              label="Contraseña nueva"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
            <CampoTexto
              label="Repetir contraseña"
              type="password"
              value={password2}
              onChange={setPassword2}
              placeholder="La misma de arriba"
              autoComplete="new-password"
            />
          </div>
          <PieSticky>
            <div className="space-y-3">
              <AvisoError>{error}</AvisoError>
              <BotonPrimario type="submit" cargando={cargando}>
                Guardar y entrar
              </BotonPrimario>
            </div>
          </PieSticky>
        </form>
      )}
    </main>
  );
}
