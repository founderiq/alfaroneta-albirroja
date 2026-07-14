import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cargarContexto } from '@/lib/datos';
import { formatoLargo } from '@/lib/fecha';
import { DIAS_RETO } from '@/lib/reto';
import { cerrarSesion } from '@/app/actions/cuenta';
import EditarApoyos from './EditarApoyos';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const ctx = await cargarContexto();
  if (!ctx) redirect('/');

  const { perfil, fechaInicio, metricas } = ctx;

  // Dato de la garantía: cumplimiento del capitán contra la meta de frecuencia.
  // Meta = frecuencia semanal proyectada a los 60 días.
  const metaCapitan = Math.round((perfil.frecuencia_entrenamiento * DIAS_RETO) / 7);
  const pctCapitan =
    metaCapitan > 0 ? Math.round((metricas.capitanCumplidos / metaCapitan) * 100) : 0;

  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/app"
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm"
      >
        ← El partido de hoy
      </Link>

      <h1 className="text-3xl font-black">Mi perfil</h1>

      <div className="mt-6 rounded-3xl bg-white p-5">
        <p className="text-xs font-bold tracking-widest text-neutral-400">JUGADOR/A</p>
        <p className="mt-1 text-xl font-black">{perfil.nombre_apellido}</p>
        <p className="text-sm text-neutral-500">{perfil.correo}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-neutral-400">Objetivo</dt>
            <dd className="font-semibold">{perfil.objetivo ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Punto de partida</dt>
            <dd className="font-semibold">{perfil.nivel ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Frecuencia</dt>
            <dd className="font-semibold">
              {perfil.frecuencia_entrenamiento} días/semana
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">Reto actual desde</dt>
            <dd className="font-semibold">{formatoLargo(fechaInicio)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 rounded-3xl bg-white p-5">
        <p className="text-xs font-bold tracking-widest text-neutral-400">
          HÁBITO CAPITÁN · DATO PARA LA GARANTÍA
        </p>
        <p className="mt-2 text-3xl font-black">
          {metricas.capitanCumplidos}
          <span className="text-base font-bold text-neutral-400">
            {' '}
            / {metaCapitan} entrenamientos meta
          </span>
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Cumplimiento del capitán: <strong>{pctCapitan}%</strong> de tu meta de{' '}
          {perfil.frecuencia_entrenamiento} días por semana en {DIAS_RETO} días.
          Este es el dato que se mira para la garantía del reto (80%+ al
          completar los 60 días).
        </p>
      </div>

      <div className="mt-4">
        <EditarApoyos actuales={perfil.habitos_apoyo} />
      </div>

      <form action={cerrarSesion} className="mt-6">
        <button
          type="submit"
          className="w-full rounded-2xl bg-white px-4 py-3.5 font-semibold text-neutral-500 shadow-sm"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
