import Link from 'next/link';
import RutinasTabs from './RutinasTabs';

// RUTINAS — contenido estático (sección 7 del documento de contexto).
export default function RutinasPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/app"
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-superficie px-4 py-2 text-sm font-bold text-white"
      >
        ← El partido de hoy
      </Link>

      <h1 className="text-3xl font-black">Rutinas</h1>
      <p className="mt-2 text-tenue">
        4 rutinas full body para gym y 4 para casa. Elegí dónde entrenás y andá
        rotando entre las variantes para no cansarte de lo mismo. Dejá al menos
        un día de descanso entre sesiones cuando se pueda.
      </p>

      <div className="mt-6">
        <RutinasTabs />
      </div>
    </main>
  );
}
