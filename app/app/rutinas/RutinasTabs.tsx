'use client';

import { useState } from 'react';
import {
  RECOMENDACIONES_CASA,
  RECOMENDACIONES_GYM,
  RUTINAS_CASA,
  RUTINAS_GYM,
  type Rutina,
} from '@/lib/rutinas';

export default function RutinasTabs() {
  const [lugar, setLugar] = useState<'gym' | 'casa'>('gym');
  const [indice, setIndice] = useState(0);

  const rutinas = lugar === 'gym' ? RUTINAS_GYM : RUTINAS_CASA;
  const recomendaciones = lugar === 'gym' ? RECOMENDACIONES_GYM : RECOMENDACIONES_CASA;
  const rutina: Rutina = rutinas[Math.min(indice, rutinas.length - 1)];

  const cambiarLugar = (l: 'gym' | 'casa') => {
    setLugar(l);
    setIndice(0);
  };

  return (
    <div>
      {/* Selector gym / casa */}
      <div className="grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-superficie p-1.5">
        {(['gym', 'casa'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => cambiarLugar(l)}
            className={`h-11 rounded-full text-sm font-bold transition ${
              lugar === l ? 'bg-rojo text-white' : 'text-tenue'
            }`}
          >
            {l === 'gym' ? '🏋️ Gym' : '🏠 Casa'}
          </button>
        ))}
      </div>

      {/* Selector de variante (4 rutinas) */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {rutinas.map((r, i) => (
          <button
            key={r.slug}
            type="button"
            onClick={() => setIndice(i)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
              i === indice
                ? 'border-rojo bg-rojo/15 text-white'
                : 'border-white/10 bg-superficie text-tenue'
            }`}
          >
            {r.titulo}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-tenue">
        Elegí una variante distinta cada vez que entrenes para no estancarte. Las
        4 son full body: sirven vayas 3, 4 o 5 días por semana.
      </p>

      <h2 className="mt-5 text-xl font-black text-white">{rutina.titulo}</h2>
      <p className="mt-1 text-sm font-semibold text-tenue">{rutina.subtitulo}</p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-superficie p-5">
        <p className="text-xs font-bold tracking-widest text-rojo">ESTRUCTURA</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">{rutina.estructura}</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {rutina.ejercicios.map((e, i) => (
          <div
            key={e.nombre}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-superficie p-4"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rojo text-sm font-black text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-snug text-white">{e.nombre}</p>
              {e.grupo ? <p className="text-xs text-tenue">{e.grupo}</p> : null}
            </div>
            <span className="shrink-0 rounded-full bg-verde/15 px-3 py-1.5 text-xs font-black text-verde">
              {e.detalle}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-superficie2 p-5">
        <p className="text-xs font-bold tracking-widest text-rojo">CÓMO PROGRESAR</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">{rutina.progresion}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-superficie p-5">
        <p className="text-xs font-bold tracking-widest text-rojo">
          RECOMENDACIONES GENERALES
        </p>
        <ul className="mt-2 space-y-2">
          {recomendaciones.map((r) => (
            <li key={r} className="flex gap-2 text-sm leading-relaxed text-neutral-300">
              <span className="text-verde">✔</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
