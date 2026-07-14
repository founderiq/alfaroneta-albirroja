// Carta de jugador estilo FIFA, sobria y alineada al look Alfaroneta.
// Server component: no necesita interactividad.

import type { NivelTarjeta } from '@/lib/reto';

const ESTILOS: Record<
  NivelTarjeta,
  { fondo: string; borde: string; etiqueta: string; medalla: string }
> = {
  bronce: {
    fondo: 'from-[#3e2c22] via-[#5a4232] to-[#2b1e17]',
    borde: 'border-[#a9765a]',
    etiqueta: 'BRONCE',
    medalla: '🥉',
  },
  plata: {
    fondo: 'from-[#5c6470] via-[#8a93a0] to-[#3f4650]',
    borde: 'border-[#c8d0da]',
    etiqueta: 'PLATA',
    medalla: '🥈',
  },
  oro: {
    fondo: 'from-[#7a5c14] via-[#b8912f] to-[#5c440e]',
    borde: 'border-[#e6c76a]',
    etiqueta: 'ORO',
    medalla: '🥇',
  },
};

export default function PlayerCard({
  nombre,
  nivel,
  ganados,
  jugados,
  efectividad,
  racha,
  partido,
  totalPartidos,
}: {
  nombre: string;
  nivel: NivelTarjeta;
  ganados: number;
  jugados: number;
  efectividad: number | null;
  racha: number;
  partido: number;
  totalPartidos: number;
}) {
  const estilo = ESTILOS[nivel];

  return (
    <div
      className={`mx-auto w-full max-w-sm rounded-[2rem] border-2 ${estilo.borde} bg-gradient-to-br ${estilo.fondo} p-6 text-white shadow-xl`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-white/60">
            LA PRETEMPORADA
          </p>
          <p className="mt-1 text-[10px] font-bold tracking-[0.3em] text-white/40">
            ALFARONETA
          </p>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black tracking-widest">
          {estilo.medalla} {estilo.etiqueta}
        </span>
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="text-5xl font-black leading-none">{ganados}</p>
          <p className="mt-1 text-xs font-bold tracking-widest text-white/60">
            PARTIDOS GANADOS
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black leading-none">
            {efectividad === null ? '—' : `${efectividad}%`}
          </p>
          <p className="mt-1 text-xs font-bold tracking-widest text-white/60">
            EFECTIVIDAD
          </p>
        </div>
      </div>

      <p className="mt-6 truncate text-2xl font-black uppercase tracking-wide">
        {nombre}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/20 pt-4 text-center">
        <div>
          <p className="text-xl font-black">🔥 {racha}</p>
          <p className="mt-0.5 text-[10px] font-bold tracking-widest text-white/60">
            RACHA INVICTA
          </p>
        </div>
        <div>
          <p className="text-xl font-black">
            {partido}
            <span className="text-sm font-bold text-white/60">/{totalPartidos}</span>
          </p>
          <p className="mt-0.5 text-[10px] font-bold tracking-widest text-white/60">
            PARTIDO
          </p>
        </div>
        <div>
          <p className="text-xl font-black">
            {ganados}
            <span className="text-sm font-bold text-white/60">/{jugados}</span>
          </p>
          <p className="mt-0.5 text-[10px] font-bold tracking-widest text-white/60">
            GANADOS/JUGADOS
          </p>
        </div>
      </div>
    </div>
  );
}
