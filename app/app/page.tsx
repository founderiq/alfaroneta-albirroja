import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cargarContexto, fraseDelDia } from '@/lib/datos';
import { formatoLargo } from '@/lib/fecha';
import { HABITOS_APOYO } from '@/lib/habitos';
import { DIAS_RETO } from '@/lib/reto';
import DiaChecklist from '@/components/DiaChecklist';
import { ReglasGate } from '@/components/ReglasReto';

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
  const partidoHoy = Math.min(metricas.diaHoy, DIAS_RETO);

  return (
    <main className="flex flex-1 flex-col">
      {/* Reglas: se muestran sí o sí la primera vez en este dispositivo */}
      <ReglasGate />

      {/* Frase del día */}
      <blockquote className="rounded-3xl border border-white/10 bg-superficie p-6">
        <p className="text-xs font-bold tracking-widest text-rojo">
          FRASE DEL DÍA
        </p>
        <p className="mt-2 text-xl leading-snug font-bold text-white">“{frase}”</p>
      </blockquote>

      {/* Partido · racha · tarjeta */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!metricas.retoCompleto ? (
          <span className="rounded-full border border-white/10 bg-superficie px-4 py-2 text-sm font-bold text-white">
            Partido {partidoHoy} de {DIAS_RETO}
            {metricas.esLaFinal ? ' · ¡LA FINAL!' : ''}
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-superficie px-4 py-2 text-sm font-bold text-white">
            Campeonato completado 🏆
          </span>
        )}
        <span className="rounded-full border border-white/10 bg-superficie px-4 py-2 text-sm font-bold text-white">
          🔥 Racha: {metricas.racha}
        </span>
        {metricas.tarjeta ? (
          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              metricas.tarjeta === 'roja'
                ? 'bg-rojo/20 text-red-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}
          >
            {metricas.tarjeta === 'roja' ? '🟥 Tarjeta roja' : '🟨 Tarjeta amarilla'}
          </span>
        ) : null}
      </div>

      {metricas.tarjeta ? (
        <p className="mt-3 text-sm text-tenue">
          {metricas.tarjeta === 'roja'
            ? 'Dos días sin ganar. No pasa nada: nada se borra. Hoy volvés a la cancha.'
            : 'Ayer no se ganó. Hoy se juega igual: la racha se recupera ganando.'}
        </p>
      ) : null}

      <p className="mt-6 text-sm text-tenue">
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
        <div className="mt-3 rounded-3xl border border-white/10 bg-superficie p-6">
          <p className="text-2xl">🏆</p>
          <h2 className="mt-2 text-2xl font-black">
            Terminaste tu Pretemporada, {nombreDePila}.
          </h2>
          <p className="mt-2 text-tenue">
            60 partidos. {metricas.ganados} ganados. El que llega al Partido 60
            ya no es el mismo que empezó. Si querés jugar otro campeonato,
            reiniciá tu reto desde el menú.
          </p>
        </div>
      )}

      {/* Accesos: rutinas y tarjeta */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/app/rutinas"
          className="rounded-3xl border border-white/10 bg-superficie p-5 transition active:scale-[0.98]"
        >
          <span className="text-2xl">🏋️</span>
          <span className="mt-2 block font-bold text-white">Rutinas</span>
          <span className="block text-sm text-tenue">Gym y casa</span>
        </Link>
        <Link
          href="/app/tarjeta"
          className="rounded-3xl border border-white/10 bg-superficie p-5 transition active:scale-[0.98]"
        >
          <span className="text-2xl">🃏</span>
          <span className="mt-2 block font-bold text-white">Mi Tarjeta</span>
          <span className="block text-sm text-tenue">
            {metricas.ganados} partidos ganados
          </span>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500">
        ¿Te olvidaste de marcar ayer?{' '}
        <Link href="/app/repesca" className="font-bold text-tenue underline">
          Corregir día anterior
        </Link>
      </p>
    </main>
  );
}
