'use client';

// Explicación del sistema (reglas del reto). Se muestra:
//  - sí o sí la primera vez que el usuario entra a la app (ReglasGate)
//  - cuando quiera, desde el menú (ReglasModal)

import { useEffect, useState } from 'react';

const VISTO_KEY = 'alfaroneta-reglas-vistas-v1';

const REGLAS: { emoji: string; titulo: string; texto: string }[] = [
  {
    emoji: '🏆',
    titulo: 'Un campeonato de 60 partidos',
    texto:
      'La Pretemporada dura 60 días y cada día es un partido. Arrancás en el Partido 1 y vas escalando hasta el 60. Un partido a la vez, sin apuro.',
  },
  {
    emoji: '🏃',
    titulo: 'Tu hábito capitán',
    texto:
      'Moverte 45 minutos. Es el innegociable. Vos elegís cómo: gym, correr, caminar, fútbol, bici, lo que te haga bien. Lo importante no es el cómo, es aparecer.',
  },
  {
    emoji: '✅',
    titulo: 'Tus hábitos de apoyo',
    texto:
      'Elegiste hasta 3 hábitos para instalar (agua, dormir, leer, etc.). Cada día marcás los que cumpliste.',
  },
  {
    emoji: '⚽',
    titulo: 'Cómo se gana el día',
    texto:
      'Ganás el partido cuando cumplís el capitán (entrenaste o declaraste descanso) MÁS al menos 2 de tus 3 apoyos. Así de simple: capitán + 2 apoyos.',
  },
  {
    emoji: '🤫',
    titulo: 'Si no marcás nada, no cuenta',
    texto:
      'El silencio no se toma como descanso: un día sin marcar es un día no ganado. La honestidad es tuya.',
  },
  {
    emoji: '😴',
    titulo: 'Día de descanso',
    texto:
      'Lo declarás vos, a la mañana o desde el menú. El descanso cumple el capitán automáticamente, pero igual necesitás 2 apoyos para ganar el día.',
  },
  {
    emoji: '🔥',
    titulo: 'Racha invicta',
    texto:
      'Son tus días ganados seguidos. Si perdés un día, la racha vuelve a 0. Pero tus partidos ganados NO se borran nunca: eso ya te lo ganaste.',
  },
  {
    emoji: '🟨',
    titulo: 'Tarjetas amarilla y roja',
    texto:
      'Amarilla si perdés un día, roja si perdés dos seguidos. Son solo una señal para despabilarte: no te castigan ni te reinician nada. Hoy se juega igual.',
  },
  {
    emoji: '↩️',
    titulo: 'Corregir día anterior',
    texto:
      '¿Te olvidaste de marcar anoche? Podés completar el día de ayer hasta que termine el día de hoy. Después, ese partido queda cerrado.',
  },
  {
    emoji: '🔄',
    titulo: 'Reiniciar cuando quieras',
    texto:
      'Ante una lesión, un viaje o un imprevisto, podés reiniciar a Partido 0 las veces que quieras. El sistema nunca reinicia solo: la decisión es tuya y tu historial se conserva.',
  },
  {
    emoji: '🃏',
    titulo: 'Tu Tarjeta de Jugador',
    texto:
      'Muestra tus partidos ganados, tu efectividad, tu racha y tu nivel: Bronce, Plata u Oro. Todo en positivo, siempre para adelante.',
  },
];

/** Contenido de las reglas (scrolleable). */
export function ReglasContenido() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-rojo/30 bg-rojo/10 p-5">
        <p className="text-sm leading-relaxed text-neutral-200">
          Esto es lo que tenés que saber para jugar tu Pretemporada. Leelo una
          vez y ya está: después lo tenés siempre en el menú.
        </p>
      </div>
      {REGLAS.map((r) => (
        <div
          key={r.titulo}
          className="flex gap-3 rounded-2xl border border-white/10 bg-superficie p-4"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {r.emoji}
          </span>
          <div>
            <p className="font-bold text-white">{r.titulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-tenue">{r.texto}</p>
          </div>
        </div>
      ))}
      <p className="px-2 pt-2 text-center text-lg font-black text-rojo">
        Hoy ganá el partido. Solo eso. Solo hoy.
      </p>
    </div>
  );
}

/** Overlay a pantalla completa con las reglas. */
export function ReglasModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-fondo">
      <header className="sticky top-0 flex items-center justify-between border-b border-white/5 bg-fondo/90 px-5 py-4 backdrop-blur">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-rojo">
            LA PRETEMPORADA
          </p>
          <h2 className="text-lg font-black">Cómo se juega</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="grid size-9 place-items-center rounded-full border border-white/10 bg-superficie text-lg text-white"
        >
          ✕
        </button>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-5 py-5">
        <ReglasContenido />
      </div>

      <div className="pb-safe mx-auto w-full max-w-md bg-gradient-to-t from-fondo from-60% via-fondo to-transparent px-5 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="h-14 w-full rounded-full bg-rojo text-base font-bold text-white shadow-[0_8px_30px_-8px_rgba(237,28,36,0.6)] transition active:scale-[0.98]"
        >
          Entendido, a jugar
        </button>
      </div>
    </div>
  );
}

/**
 * Muestra las reglas automáticamente la PRIMERA vez que el usuario entra
 * a la app en este dispositivo. Después queda disponible desde el menú.
 */
export function ReglasGate() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(VISTO_KEY)) setAbierto(true);
    } catch {}
  }, []);

  const cerrar = () => {
    try {
      localStorage.setItem(VISTO_KEY, '1');
    } catch {}
    setAbierto(false);
  };

  if (!abierto) return null;
  return <ReglasModal onClose={cerrar} />;
}
