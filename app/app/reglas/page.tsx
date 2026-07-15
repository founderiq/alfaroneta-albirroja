import Link from 'next/link';
import { ReglasContenido } from '@/components/ReglasReto';

// CÓMO FUNCIONA EL RETO — página dedicada (accesible desde el menú).
export default function ReglasPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Link
        href="/app"
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-superficie px-4 py-2 text-sm font-bold text-white"
      >
        ← El partido de hoy
      </Link>

      <p className="text-[10px] font-bold tracking-[0.3em] text-rojo">
        LA PRETEMPORADA
      </p>
      <h1 className="text-3xl font-black">Cómo se juega</h1>
      <p className="mt-2 mb-5 text-tenue">
        Todo lo que tenés que saber para jugar tu Pretemporada.
      </p>

      <ReglasContenido />
    </main>
  );
}
