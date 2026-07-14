'use client';

import { useState } from 'react';
import { RUTINAS, type Rutina } from '@/lib/rutinas';

export default function RutinasTabs() {
  const [activa, setActiva] = useState<Rutina['slug']>('gym');
  const rutina = RUTINAS.find((r) => r.slug === activa)!;

  return (
    <div>
      {/* Selector gym / casa */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-neutral-200/60 p-1.5">
        {RUTINAS.map((r) => (
          <button
            key={r.slug}
            type="button"
            onClick={() => setActiva(r.slug)}
            className={`h-11 rounded-xl text-sm font-bold transition ${
              activa === r.slug ? 'bg-white shadow-sm' : 'text-neutral-500'
            }`}
          >
            {r.slug === 'gym' ? '🏋️ Gym' : '🏠 Casa'}
          </button>
        ))}
      </div>

      <h2 className="mt-6 text-xl font-black">{rutina.titulo}</h2>
      <p className="mt-1 text-sm font-semibold text-neutral-500">{rutina.subtitulo}</p>

      <div className="mt-4 rounded-3xl bg-white p-5">
        <p className="text-xs font-bold tracking-widest text-neutral-400">ESTRUCTURA</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{rutina.estructura}</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {rutina.ejercicios.map((e, i) => (
          <div key={e.nombre} className="flex items-center gap-4 rounded-3xl bg-white p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-900 text-sm font-black text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-snug">{e.nombre}</p>
              {e.grupo ? (
                <p className="text-xs text-neutral-500">{e.grupo}</p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-full bg-verde-suave px-3 py-1.5 text-xs font-black text-green-800">
              {e.detalle}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl bg-neutral-900 p-5 text-white">
        <p className="text-xs font-bold tracking-widest text-neutral-400">
          CÓMO PROGRESAR
        </p>
        <p className="mt-2 text-sm leading-relaxed">{rutina.progresion}</p>
      </div>

      <div className="mt-4 rounded-3xl bg-white p-5">
        <p className="text-xs font-bold tracking-widest text-neutral-400">
          RECOMENDACIONES GENERALES
        </p>
        <ul className="mt-2 space-y-2">
          {rutina.recomendaciones.map((r) => (
            <li key={r} className="flex gap-2 text-sm leading-relaxed text-neutral-700">
              <span className="text-verde">✔</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
