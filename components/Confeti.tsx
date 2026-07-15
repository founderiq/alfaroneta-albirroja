'use client';

// Confeti liviano y autocontenido (sin librerías): una ráfaga de piezas que
// caen una vez. Colores de la marca + tricolor.

import { useMemo } from 'react';

const COLORES = ['#ed1c24', '#ffffff', '#1f3a93', '#22c55e', '#f5c518'];

export default function Confeti({ cantidad = 70 }: { cantidad?: number }) {
  const piezas = useMemo(
    () =>
      Array.from({ length: cantidad }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.4,
        color: COLORES[i % COLORES.length],
        escala: 0.7 + Math.random() * 0.8,
      })),
    [cantidad],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>
      {piezas.map((p) => (
        <span
          key={p.id}
          className="confeti-pieza"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `scale(${p.escala})`,
          }}
        />
      ))}
    </div>
  );
}
