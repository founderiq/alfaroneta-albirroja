'use client';

// Checklist de un día (hoy o repesca): capitán + apoyos + descanso.
// Actualización optimista; las reglas de verdad se validan en el servidor.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { declararDescanso, marcarApoyo, marcarCapitan } from '@/app/actions/dia';
import { CAPITAN, type HabitoApoyo } from '@/lib/habitos';
import {
  apoyosNecesarios,
  calcularGanoDia,
  contarApoyosCumplidos,
  type ApoyosCumplidos,
} from '@/lib/reto';
import { CheckCirculo } from '@/components/ui';

type EstadoLog = {
  es_descanso: boolean;
  capitan_cumplido: boolean;
  apoyos_cumplidos: ApoyosCumplidos;
};

export default function DiaChecklist({
  fecha,
  inicial,
  apoyos,
  modo,
}: {
  fecha: string;
  inicial: EstadoLog | null;
  apoyos: HabitoApoyo[]; // solo los elegidos por el usuario
  modo: 'hoy' | 'repesca';
}) {
  const router = useRouter();
  const [log, setLog] = useState<EstadoLog>(
    inicial ?? { es_descanso: false, capitan_cumplido: false, apoyos_cumplidos: {} },
  );
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const slugs = apoyos.map((a) => a.slug);
  const gano = calcularGanoDia(log, slugs);
  const cumplidos = contarApoyosCumplidos(log.apoyos_cumplidos, slugs);
  const necesarios = apoyosNecesarios(slugs.length);

  const aplicar = (
    optimista: EstadoLog,
    accion: () => Promise<{ ok: boolean } & ({ ok: true } | { ok: false; error: string })>,
  ) => {
    const anterior = log;
    setError(null);
    setLog(optimista);
    startTransition(async () => {
      try {
        const r = await accion();
        if (!r.ok) {
          setLog(anterior);
          setError((r as { error: string }).error);
          return;
        }
        router.refresh();
      } catch {
        setLog(anterior);
        setError('No pudimos guardar. Revisá tu conexión y probá de nuevo.');
      }
    });
  };

  const toggleCapitan = () => {
    if (log.es_descanso) return; // el descanso ya cumple el capitán
    const valor = !log.capitan_cumplido;
    aplicar({ ...log, capitan_cumplido: valor }, () => marcarCapitan(fecha, valor));
  };

  const toggleApoyo = (slug: string) => {
    const valor = !log.apoyos_cumplidos[slug];
    aplicar(
      { ...log, apoyos_cumplidos: { ...log.apoyos_cumplidos, [slug]: valor } },
      () => marcarApoyo(fecha, slug, valor),
    );
  };

  const toggleDescanso = () => {
    const valor = !log.es_descanso;
    aplicar({ ...log, es_descanso: valor }, () => declararDescanso(fecha, valor));
  };

  return (
    <div>
      {/* Estado del día */}
      <div
        className={`rounded-3xl p-5 ${
          gano ? 'bg-verde text-white' : 'bg-white'
        }`}
      >
        <p className="text-xs font-bold tracking-widest opacity-70">
          {modo === 'hoy' ? 'ESTADO DEL DÍA' : 'ESTADO DE AYER'}
        </p>
        <p className="mt-1 text-xl font-black">
          {gano
            ? '🏆 ¡Partido ganado!'
            : modo === 'hoy'
              ? '⚽ En juego'
              : '⚽ Todavía podés ganarlo'}
        </p>
        {!gano ? (
          <p className="mt-1 text-sm text-neutral-500">
            Para ganar: capitán (o descanso) + {necesarios} de tus{' '}
            {slugs.length} apoyos · Llevás {cumplidos}.
          </p>
        ) : (
          <p className="mt-1 text-sm text-white/80">
            {log.es_descanso
              ? 'Descanso bien jugado también suma.'
              : 'Así se juega. Mañana hay otro partido.'}
          </p>
        )}
      </div>

      {error ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {/* Hábito capitán */}
      <p className="mt-6 mb-2 text-xs font-bold tracking-widest text-neutral-400">
        HÁBITO CAPITÁN
      </p>
      <button
        type="button"
        onClick={toggleCapitan}
        className={`flex w-full items-center justify-between gap-3 rounded-3xl border-2 bg-white p-5 text-left transition active:scale-[0.99] ${
          log.capitan_cumplido || log.es_descanso
            ? 'border-verde'
            : 'border-transparent'
        }`}
      >
        <span>
          <span className="block font-bold">
            <span className="mr-2">🏃</span>
            {CAPITAN.label}
          </span>
          <span className="mt-1 block text-sm text-neutral-500">
            {log.es_descanso
              ? 'Cumplido: hoy declaraste descanso.'
              : 'Gym, correr, caminar, fútbol, bici: como quieras.'}
          </span>
        </span>
        <CheckCirculo activo={log.capitan_cumplido || log.es_descanso} />
      </button>

      {/* Descanso */}
      <button
        type="button"
        onClick={toggleDescanso}
        className={`mt-3 flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-left text-sm font-semibold transition ${
          log.es_descanso
            ? 'bg-neutral-900 text-white'
            : 'bg-white text-neutral-600'
        }`}
      >
        {log.es_descanso
          ? modo === 'hoy'
            ? '😴 Día de descanso declarado · tocá para deshacer'
            : '😴 Descanso declarado · tocá para deshacer'
          : modo === 'hoy'
            ? '¿Hoy te toca descansar? Declaralo acá'
            : '¿Ayer fue descanso? Declaralo acá'}
      </button>

      {/* Hábitos de apoyo */}
      <p className="mt-6 mb-2 text-xs font-bold tracking-widest text-neutral-400">
        HÁBITOS DE APOYO · {cumplidos}/{slugs.length}
      </p>
      <div className="space-y-3">
        {apoyos.map((a) => {
          const activo = log.apoyos_cumplidos[a.slug] === true;
          return (
            <button
              key={a.slug}
              type="button"
              onClick={() => toggleApoyo(a.slug)}
              className={`flex w-full items-center justify-between gap-3 rounded-3xl border-2 bg-white p-5 text-left transition active:scale-[0.99] ${
                activo ? 'border-verde' : 'border-transparent'
              }`}
            >
              <span className="font-semibold">
                <span className="mr-2">{a.emoji}</span>
                {a.label}
              </span>
              <CheckCirculo activo={activo} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
