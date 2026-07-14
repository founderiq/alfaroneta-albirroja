import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cargarContexto, fraseDelDia } from '@/lib/datos';
import { formatoLargo } from '@/lib/fecha';
import { HABITOS_APOYO } from '@/lib/habitos';
import { FECHAS_CAMPEONATO } from '@/lib/reto';
import DiaChecklist from '@/components/DiaChecklist';

export const dynamic = 'force-dynamic';

// PANTALLA PRINCIPAL — "El partido de hoy"
export default async function PartidoDeHoy() {
  const ctx = await cargarContexto();
  if (!ctx) redirect('/');

  const { perfil, hoy, logs, metricas } = ctx;
  const frase = await fraseDelDia(hoy);
  const logHoy = logs.find((l) => l.fecha === hoy) ?? null;
  const apoyosElegidos = HABITOS_APOYO.filter((h) =>
    perfil.habitos_apoyo.includes(h.slug),
  );
  const nombreDePila = perfil.nombre_apellido.split(' ')[0];

  return (
    <main className="flex flex-1 flex-col">
      {/* Frase del día */}
      <blockquote className="rounded-3xl bg-neutral-900 p-6 text-white">
        <p className="text-xs font-bold tracking-widest text-neutral-400">
          FRASE DEL DÍA
        </p>
        <p className="mt-2 text-xl leading-snug font-bold">“{frase}”</p>
      </blockquote>

      {/* Día · fecha · racha · tarjeta */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!metricas.retoCompleto ? (
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold">
            Día {metricas.diaHoy} · Fecha {metricas.fechaCampeonato} de{' '}
            {FECHAS_CAMPEONATO}
            {metricas.esLaFinal ? ' · ¡LA FINAL!' : ''}
          </span>
        ) : (
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold">
            Campeonato completado 🏆
          </span>
        )}
        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold">
          🔥 Racha: {metricas.racha}
        </span>
        {metricas.tarjeta ? (
          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              metricas.tarjeta === 'roja'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {metricas.tarjeta === 'roja' ? '🟥 Tarjeta roja' : '🟨 Tarjeta amarilla'}
          </span>
        ) : null}
      </div>

      {metricas.tarjeta ? (
        <p className="mt-3 text-sm text-neutral-600">
          {metricas.tarjeta === 'roja'
            ? 'Dos días sin ganar. No pasa nada: nada se borra. Hoy volvés a la cancha.'
            : 'Ayer no se ganó. Hoy se juega igual: la racha se recupera ganando.'}
        </p>
      ) : null}

      <p className="mt-6 text-sm text-neutral-500">
        {formatoLargo(hoy)} · Dale, {nombreDePila}.
      </p>

      {!metricas.retoCompleto ? (
        <div className="mt-3">
          <DiaChecklist
            fecha={hoy}
            inicial={logHoy}
            apoyos={apoyosElegidos}
            modo="hoy"
          />
        </div>
      ) : (
        <div className="mt-3 rounded-3xl bg-white p-6">
          <p className="text-2xl">🏆</p>
          <h2 className="mt-2 text-2xl font-black">
            Terminaste tu Pretemporada, {nombreDePila}.
          </h2>
          <p className="mt-2 text-neutral-600">
            60 días. {metricas.ganados} partidos ganados. El que llega al día 60
            ya no es el mismo que empezó. Si querés jugar otro campeonato,
            reiniciá tu reto desde el menú.
          </p>
        </div>
      )}

      {/* Accesos: rutinas y tarjeta */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/app/rutinas"
          className="rounded-3xl bg-white p-5 transition active:scale-[0.98]"
        >
          <span className="text-2xl">🏋️</span>
          <span className="mt-2 block font-bold">Rutinas</span>
          <span className="block text-sm text-neutral-500">Gym y casa</span>
        </Link>
        <Link
          href="/app/tarjeta"
          className="rounded-3xl bg-white p-5 transition active:scale-[0.98]"
        >
          <span className="text-2xl">🃏</span>
          <span className="mt-2 block font-bold">Mi Tarjeta</span>
          <span className="block text-sm text-neutral-500">
            {metricas.ganados} partidos ganados
          </span>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        ¿Te olvidaste de marcar ayer?{' '}
        <Link href="/app/repesca" className="font-bold underline">
          Repesca del día anterior
        </Link>
      </p>
    </main>
  );
}
