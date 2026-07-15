import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cargarContexto } from '@/lib/datos';
import { formatoLargo } from '@/lib/fecha';
import { cerrarSesion } from '@/app/actions/cuenta';
import EditarApoyos from './EditarApoyos';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const ctx = await cargarContexto();
  if (!ctx) redirect('/');

  const { perfil, fechaInicio } = ctx;

  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/app"
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-superficie px-4 py-2 text-sm font-bold text-white"
      >
        ← El partido de hoy
      </Link>

      <h1 className="text-3xl font-black">Mi perfil</h1>

      <div className="mt-6 rounded-2xl border border-white/10 bg-superficie p-5">
        <p className="text-xs font-bold tracking-widest text-rojo">JUGADOR/A</p>
        <p className="mt-1 text-xl font-black text-white">{perfil.nombre_apellido}</p>
        <p className="text-sm text-tenue">{perfil.correo}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-tenue">Objetivo</dt>
            <dd className="font-semibold text-white">{perfil.objetivo ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-tenue">Punto de partida</dt>
            <dd className="font-semibold text-white">{perfil.nivel ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-tenue">Frecuencia</dt>
            <dd className="font-semibold text-white">
              {perfil.frecuencia_entrenamiento} días/semana
            </dd>
          </div>
          <div>
            <dt className="text-tenue">Reto actual desde</dt>
            <dd className="font-semibold text-white">{formatoLargo(fechaInicio)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4">
        <EditarApoyos actuales={perfil.habitos_apoyo} />
      </div>

      <Link
        href="/recuperar"
        className="mt-4 block w-full rounded-full border border-white/10 bg-superficie px-4 py-3.5 text-center font-semibold text-white"
      >
        Olvidé mi contraseña
      </Link>

      <form action={cerrarSesion} className="mt-3">
        <button
          type="submit"
          className="w-full rounded-full border border-white/10 bg-superficie px-4 py-3.5 font-semibold text-tenue"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
