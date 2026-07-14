'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AvisoError, BotonPrimario, CampoTexto, PieSticky } from '@/components/ui';

export default function RecuperarPage() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setError(null);
    setCargando(true);
    try {
      const supabase = createClient();
      // redirectTo usa el origin actual: funciona igual en el dominio de Vercel
      // hoy y en el dominio final mañana (sin URLs hardcodeadas).
      const { error } = await supabase.auth.resetPasswordForEmail(
        correo.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/reset-password` },
      );
      if (error) {
        setError('No pudimos enviar el correo. Probá de nuevo en un rato.');
        return;
      }
      setEnviado(true);
    } catch {
      setError('No pudimos conectar. Revisá tu internet y probá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8">
      <Link
        href="/login"
        aria-label="Volver"
        className="grid size-9 place-items-center rounded-full border border-white/10 bg-superficie text-lg text-white"
      >
        ←
      </Link>

      <h1 className="mt-6 text-3xl font-black">Recuperar contraseña</h1>

      {enviado ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-superficie p-6">
          <p className="text-2xl">📬</p>
          <p className="mt-3 font-semibold">Listo, revisá tu correo.</p>
          <p className="mt-2 text-tenue">
            Te mandamos un link a <strong>{correo}</strong> para crear una
            contraseña nueva. Si no aparece, mirá en spam.
          </p>
        </div>
      ) : (
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
        >
          <p className="mt-2 text-tenue">
            Poné tu correo y te mandamos un link para crear una contraseña nueva.
          </p>
          <div className="mt-8">
            <CampoTexto
              label="Correo"
              type="email"
              inputMode="email"
              value={correo}
              onChange={setCorreo}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>
          <PieSticky>
            <div className="space-y-3">
              <AvisoError>{error}</AvisoError>
              <BotonPrimario type="submit" cargando={cargando} disabled={!correo.trim()}>
                Enviar link
              </BotonPrimario>
            </div>
          </PieSticky>
        </form>
      )}
    </main>
  );
}
