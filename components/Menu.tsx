'use client';

// Menú principal de la app diaria (sheet desde arriba).

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { declararDescansoHoy } from '@/app/actions/dia';
import { cerrarSesion, reiniciarReto } from '@/app/actions/cuenta';

export default function Menu() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [confirmandoReinicio, setConfirmandoReinicio] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const cerrar = () => {
    setAbierto(false);
    setConfirmandoReinicio(false);
    setAviso(null);
  };

  const marcarDescanso = () => {
    startTransition(async () => {
      const r = await declararDescansoHoy();
      if (!r.ok) {
        setAviso(r.error);
        return;
      }
      cerrar();
      router.push('/app');
      router.refresh();
    });
  };

  const reiniciar = () => {
    startTransition(async () => {
      const r = await reiniciarReto();
      if (!r.ok) {
        setAviso(r.error);
        return;
      }
      cerrar();
      router.push('/app');
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setAbierto(true)}
        className="grid size-10 place-items-center rounded-full bg-white shadow-sm"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M1 1h16M1 7h16M1 13h16" />
        </svg>
      </button>

      {abierto ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={cerrar}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 top-0 mx-auto max-w-md rounded-b-3xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-black tracking-[0.2em]">MENÚ</span>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid size-9 place-items-center rounded-full bg-neutral-100 text-lg"
              >
                ✕
              </button>
            </div>

            {aviso ? (
              <p className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {aviso}
              </p>
            ) : null}

            {!confirmandoReinicio ? (
              <nav className="space-y-1">
                <ItemBoton onClick={marcarDescanso} disabled={pendiente} emoji="😴">
                  Marcar hoy como día de descanso
                </ItemBoton>
                <ItemLink href="/app/repesca" onClick={cerrar} emoji="↩️">
                  Volver al día anterior (repesca)
                </ItemLink>
                <ItemLink href="/app/rutinas" onClick={cerrar} emoji="🏋️">
                  Rutinas
                </ItemLink>
                <ItemLink href="/app/tarjeta" onClick={cerrar} emoji="🃏">
                  Mi Tarjeta de Jugador
                </ItemLink>
                <ItemBoton
                  onClick={() => setConfirmandoReinicio(true)}
                  disabled={pendiente}
                  emoji="🔄"
                >
                  Reiniciar mi reto
                </ItemBoton>
                <ItemLink href="/app/perfil" onClick={cerrar} emoji="👤">
                  Mi perfil
                </ItemLink>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => startTransition(() => cerrarSesion())}
                    disabled={pendiente}
                    className="w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-left font-semibold text-neutral-500"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </nav>
            ) : (
              <div className="rounded-3xl bg-neutral-50 p-5">
                <p className="font-bold">¿Reiniciar tu reto desde el día 0?</p>
                <p className="mt-2 text-sm text-neutral-600">
                  Arrancás una carrera nueva desde hoy. Tu historial anterior se
                  conserva; nada se borra. Solo vos podés tomar esta decisión:
                  el sistema nunca reinicia solo.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmandoReinicio(false)}
                    className="h-12 flex-1 rounded-2xl bg-white font-bold shadow-sm"
                  >
                    No, sigo
                  </button>
                  <button
                    type="button"
                    onClick={reiniciar}
                    disabled={pendiente}
                    className="h-12 flex-1 rounded-2xl bg-neutral-900 font-bold text-white disabled:opacity-50"
                  >
                    {pendiente ? 'Un momento…' : 'Sí, reiniciar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function ItemLink({
  href,
  emoji,
  children,
  onClick,
}: {
  href: string;
  emoji: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition active:bg-neutral-100"
    >
      <span className="text-lg" aria-hidden>
        {emoji}
      </span>
      {children}
    </Link>
  );
}

function ItemBoton({
  emoji,
  children,
  onClick,
  disabled,
}: {
  emoji: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left font-semibold transition active:bg-neutral-100 disabled:opacity-50"
    >
      <span className="text-lg" aria-hidden>
        {emoji}
      </span>
      {children}
    </button>
  );
}
