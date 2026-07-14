import Link from 'next/link';
import RutinasTabs from './RutinasTabs';

// RUTINAS — contenido estático (sección 7 del documento de contexto).
export default function RutinasPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/app"
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm"
      >
        ← El partido de hoy
      </Link>

      <h1 className="text-3xl font-black">Rutinas</h1>
      <p className="mt-2 text-neutral-600">
        Dos rutinas full body: elegí según dónde te toque entrenar hoy. Sirven
        para 3, 4 o 5 días por semana repitiendo la misma estructura, dejando al
        menos un día de descanso entre sesiones cuando se pueda.
      </p>

      <div className="mt-6">
        <RutinasTabs />
      </div>
    </main>
  );
}
