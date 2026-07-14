'use client';

// Edición opcional de los hábitos de apoyo (máx 3). Los días ya jugados no
// cambian; el día de hoy se recalcula con los nuevos apoyos.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { actualizarApoyos } from '@/app/actions/cuenta';
import { HABITOS_APOYO, MAX_APOYOS } from '@/lib/habitos';
import { CheckCirculo } from '@/components/ui';

export default function EditarApoyos({ actuales }: { actuales: string[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [seleccion, setSeleccion] = useState<string[]>(actuales);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const toggle = (slug: string) => {
    setAviso(null);
    setSeleccion((s) => {
      if (s.includes(slug)) return s.filter((x) => x !== slug);
      if (s.length >= MAX_APOYOS) {
        setAviso('Máximo 3 hábitos. Destildá uno para cambiar.');
        return s;
      }
      return [...s, slug];
    });
  };

  const guardar = () => {
    startTransition(async () => {
      const r = await actualizarApoyos(seleccion);
      if (!r.ok) {
        setAviso(r.error);
        return;
      }
      setEditando(false);
      router.refresh();
    });
  };

  return (
    <div className="rounded-3xl bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-widest text-neutral-400">
          MIS HÁBITOS DE APOYO
        </p>
        {!editando ? (
          <button
            type="button"
            onClick={() => {
              setSeleccion(actuales);
              setEditando(true);
            }}
            className="text-sm font-bold underline"
          >
            Editar
          </button>
        ) : null}
      </div>

      {!editando ? (
        <ul className="mt-2 space-y-1.5">
          {actuales.map((slug) => {
            const h = HABITOS_APOYO.find((x) => x.slug === slug);
            return (
              <li key={slug} className="font-semibold">
                <span className="mr-2">{h?.emoji}</span>
                {h?.label ?? slug}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3">
          <p className="mb-3 text-sm text-neutral-600">
            Elegí hasta {MAX_APOYOS}. Lo ya jugado no cambia; hoy se recalcula
            con los nuevos.
          </p>
          <div className="space-y-2">
            {HABITOS_APOYO.map((h) => (
              <button
                key={h.slug}
                type="button"
                onClick={() => toggle(h.slug)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-neutral-50 p-4 text-left text-sm font-semibold transition ${
                  seleccion.includes(h.slug)
                    ? 'border-verde'
                    : 'border-transparent'
                }`}
              >
                <span>
                  <span className="mr-2">{h.emoji}</span>
                  {h.label}
                </span>
                <CheckCirculo activo={seleccion.includes(h.slug)} />
              </button>
            ))}
          </div>
          {aviso ? (
            <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {aviso}
            </p>
          ) : null}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="h-12 flex-1 rounded-2xl bg-neutral-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={pendiente || seleccion.length < 1}
              className="h-12 flex-1 rounded-2xl bg-neutral-900 font-bold text-white disabled:opacity-50"
            >
              {pendiente ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
