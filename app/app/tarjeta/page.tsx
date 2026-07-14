import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cargarContexto } from '@/lib/datos';
import { FECHAS_CAMPEONATO } from '@/lib/reto';
import PlayerCard from '@/components/PlayerCard';

export const dynamic = 'force-dynamic';

// MI TARJETA DE JUGADOR — solo métricas en positivo, estilo carta de fútbol.
export default async function TarjetaPage() {
  const ctx = await cargarContexto();
  if (!ctx) redirect('/');

  const { perfil, metricas } = ctx;

  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/app"
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm"
      >
        ← El partido de hoy
      </Link>

      <h1 className="text-3xl font-black">Mi Tarjeta de Jugador</h1>
      <p className="mt-2 text-neutral-600">
        Tu carrera en esta Pretemporada. Acá solo se cuentan las victorias.
      </p>

      <div className="mt-6">
        <PlayerCard
          nombre={perfil.nombre_apellido}
          nivel={metricas.nivel}
          ganados={metricas.ganados}
          jugados={metricas.jugados}
          efectividad={metricas.efectividad}
          racha={metricas.racha}
          fecha={metricas.fechaCampeonato}
          totalFechas={FECHAS_CAMPEONATO}
        />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-5 text-sm text-neutral-600">
        <p className="font-bold text-neutral-900">Niveles de tarjeta</p>
        <p className="mt-2">
          🥉 Bronce: 0-19 partidos ganados · 🥈 Plata: 20-39 · 🥇 Oro: 40+
        </p>
        <p className="mt-2">
          Los partidos ganados nunca se borran. La racha se puede recuperar
          siempre: se gana de a un día.
        </p>
      </div>
    </main>
  );
}
