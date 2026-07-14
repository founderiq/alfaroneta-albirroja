import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cargarContexto } from '@/lib/datos';
import { ayerISO, formatoLargo } from '@/lib/fecha';
import { HABITOS_APOYO } from '@/lib/habitos';
import DiaChecklist from '@/components/DiaChecklist';

export const dynamic = 'force-dynamic';

// REPESCA — editar SOLO el día inmediato anterior, mientras dure el día de hoy.
// Días más viejos quedan cerrados: eso protege la honestidad de la racha.
export default async function RepescaPage() {
  const ctx = await cargarContexto();
  if (!ctx) redirect('/');

  const { perfil, fechaInicio, logs } = ctx;
  const ayer = ayerISO();
  const hayAyer = ayer >= fechaInicio;
  const logAyer = logs.find((l) => l.fecha === ayer) ?? null;
  const apoyosElegidos = HABITOS_APOYO.filter((h) =>
    perfil.habitos_apoyo.includes(h.slug),
  );

  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/app"
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm"
      >
        ← El partido de hoy
      </Link>

      <h1 className="text-3xl font-black">Repesca</h1>
      <p className="mt-2 text-neutral-600">
        {hayAyer ? (
          <>
            ¿Anoche te olvidaste de marcar? Podés completar lo de{' '}
            <strong>{formatoLargo(ayer)}</strong> hasta que termine el día de
            hoy. Después, ese partido queda cerrado.
          </>
        ) : (
          'Tu reto arrancó hoy, así que todavía no hay día anterior para repescar. Andá a ganar el partido de hoy.'
        )}
      </p>

      {hayAyer ? (
        <div className="mt-6">
          <DiaChecklist
            fecha={ayer}
            inicial={logAyer}
            apoyos={apoyosElegidos}
            modo="repesca"
          />
        </div>
      ) : null}

      <p className="mt-8 text-center text-xs text-neutral-400">
        Solo se puede repescar el día inmediato anterior. Los partidos más
        viejos quedan como se jugaron.
      </p>
    </main>
  );
}
