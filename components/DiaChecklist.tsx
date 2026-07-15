'use client';

// Checklist de un día (hoy o corrección de ayer): capitán + apoyos + descanso.
// Actualización optimista; las reglas de verdad se validan en el servidor.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { declararDescanso, marcarApoyo, marcarCapitan } from '@/app/actions/dia';
import { CAPITAN, type HabitoApoyo } from '@/lib/habitos';
import {
  apoyosNecesarios,
  calcularGanoDia,
  contarApoyosCumplidos,
  type ApoyosCumplidos,
} from '@/lib/reto';
import { CheckCirculo } from '@/components/ui';
import Confeti from '@/components/Confeti';

type EstadoLog = {
  es_descanso: boolean;
  capitan_cumplido: boolean;
  apoyos_cumplidos: ApoyosCumplidos;
};

// Frases de celebración (rotan al azar). {n} = nombre del jugador.
const FRASES_GANADO = [
  '¡Bien {n}! A seguir por este camino.',
  'Excelente día, {n}. Vamos por más mañana.',
  '¡Vamos {n}! Así se logra la mejor versión.',
  'Partido ganado, {n}. La garra no afloja.',
  'Eso, {n}. Un día menos para tu mejor versión.',
  '¡Grande {n}! Hoy te ganaste el respeto propio.',
  'Así se juega, {n}. Mañana hay revancha para más.',
  '{n}, otro ladrillo puesto. Se construye ganando.',
  '¡Tremendo, {n}! La constancia ya es tuya.',
  'Cerraste el día, {n}. Eso no te lo saca nadie.',
];

export default function DiaChecklist({
  fecha,
  inicial,
  apoyos,
  modo,
  nombre = 'crack',
}: {
  fecha: string;
  inicial: EstadoLog | null;
  apoyos: HabitoApoyo[]; // solo los elegidos por el usuario
  modo: 'hoy' | 'repesca';
  nombre?: string;
}) {
  const router = useRouter();
  const [log, setLog] = useState<EstadoLog>(
    inicial ?? { es_descanso: false, capitan_cumplido: false, apoyos_cumplidos: {} },
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmarDescanso, setConfirmarDescanso] = useState(false);
  const [celebracion, setCelebracion] = useState<null | 'ganado' | 'falta'>(null);
  const [frase, setFrase] = useState('');
  const [, startTransition] = useTransition();

  const slugs = apoyos.map((a) => a.slug);
  const gano = calcularGanoDia(log, slugs);
  const cumplidos = contarApoyosCumplidos(log.apoyos_cumplidos, slugs);
  const necesarios = apoyosNecesarios(slugs.length);

  const aplicar = (
    optimista: EstadoLog,
    accion: () => Promise<{ ok: boolean } & ({ ok: true } | { ok: false; error: string })>,
  ) => {
    const anterior = log;
    setError(null);
    setLog(optimista);
    startTransition(async () => {
      try {
        const r = await accion();
        if (!r.ok) {
          setLog(anterior);
          setError((r as { error: string }).error);
          return;
        }
        router.refresh();
      } catch {
        setLog(anterior);
        setError('No pudimos guardar. Revisá tu conexión y probá de nuevo.');
      }
    });
  };

  const toggleCapitan = () => {
    if (log.es_descanso) return; // el descanso ya cumple el capitán
    const valor = !log.capitan_cumplido;
    aplicar({ ...log, capitan_cumplido: valor }, () => marcarCapitan(fecha, valor));
  };

  const toggleApoyo = (slug: string) => {
    const valor = !log.apoyos_cumplidos[slug];
    aplicar(
      { ...log, apoyos_cumplidos: { ...log.apoyos_cumplidos, [slug]: valor } },
      () => marcarApoyo(fecha, slug, valor),
    );
  };

  const setDescanso = (valor: boolean) => {
    aplicar({ ...log, es_descanso: valor }, () => declararDescanso(fecha, valor));
  };

  const clickDescanso = () => {
    if (log.es_descanso) {
      setDescanso(false); // deshacer es directo
    } else {
      setConfirmarDescanso(true); // activar pide confirmación
    }
  };

  const clickDiaCulminado = () => {
    if (gano) {
      const plantilla = FRASES_GANADO[Math.floor(Math.random() * FRASES_GANADO.length)];
      setFrase(plantilla.replaceAll('{n}', nombre));
      setCelebracion('ganado');
    } else {
      setCelebracion('falta');
    }
  };

  return (
    <div>
      {/* Estado del día */}
      <div
        className={`rounded-3xl border p-5 ${
          gano ? 'border-verde bg-verde/15' : 'border-white/10 bg-superficie'
        }`}
      >
        <p className="text-xs font-bold tracking-widest text-tenue">
          {modo === 'hoy' ? 'ESTADO DEL DÍA' : 'ESTADO DE AYER'}
        </p>
        <p className="mt-1 text-xl font-black text-white">
          {gano
            ? '🏆 ¡Partido ganado!'
            : modo === 'hoy'
              ? '⚽ En juego'
              : '⚽ Todavía podés ganarlo'}
        </p>
        <p className="mt-1 text-sm text-tenue">
          {gano
            ? log.es_descanso
              ? 'Descanso bien jugado también suma.'
              : 'Así se juega. Mañana hay otro partido.'
            : `Para ganar: capitán (o descanso) + ${necesarios} de tus ${slugs.length} hábitos · Llevás ${cumplidos}.`}
        </p>
      </div>

      {error ? (
        <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </p>
      ) : null}

      {/* Hábito capitán */}
      <p className="mt-6 mb-2 text-xs font-bold tracking-widest text-tenue">
        HÁBITO CAPITÁN
      </p>
      <button
        type="button"
        onClick={toggleCapitan}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-5 text-left transition active:scale-[0.99] ${
          log.capitan_cumplido || log.es_descanso
            ? 'border-verde bg-verde/10'
            : 'border-white/10 bg-superficie'
        }`}
      >
        <span>
          <span className="block font-bold text-white">
            <span className="mr-2">🏃</span>
            {CAPITAN.label}
          </span>
          <span className="mt-1 block text-sm text-tenue">
            {log.es_descanso
              ? 'Cumplido: hoy declaraste descanso.'
              : 'Gym, correr, caminar, deportes, bici: como quieras.'}
          </span>
        </span>
        <CheckCirculo activo={log.capitan_cumplido || log.es_descanso} />
      </button>

      {/* Día de descanso — botón */}
      <button
        type="button"
        onClick={clickDescanso}
        className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 text-sm font-bold transition active:scale-[0.98] ${
          log.es_descanso
            ? 'border-white bg-white text-neutral-900'
            : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        <span aria-hidden>😴</span>
        {log.es_descanso
          ? 'Día de descanso · tocá para deshacer'
          : modo === 'hoy'
            ? 'Marcar día de descanso'
            : '¿Ayer fue descanso? Marcalo'}
      </button>

      {/* Hábitos de apoyo */}
      <p className="mt-6 mb-2 text-xs font-bold tracking-widest text-tenue">
        HÁBITOS DE APOYO · {cumplidos}/{slugs.length}
      </p>
      <div className="space-y-3">
        {apoyos.map((a) => {
          const activo = log.apoyos_cumplidos[a.slug] === true;
          return (
            <button
              key={a.slug}
              type="button"
              onClick={() => toggleApoyo(a.slug)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-5 text-left transition active:scale-[0.99] ${
                activo ? 'border-verde bg-verde/10' : 'border-white/10 bg-superficie'
              }`}
            >
              <span className="font-semibold text-white">
                <span className="mr-2">{a.emoji}</span>
                {a.label}
              </span>
              <CheckCirculo activo={activo} />
            </button>
          );
        })}
      </div>

      {/* Botón Día culminado (solo para hoy) */}
      {modo === 'hoy' ? (
        <button
          type="button"
          onClick={clickDiaCulminado}
          className={`mt-6 h-14 w-full rounded-full text-base font-bold transition active:scale-[0.98] ${
            gano
              ? 'bg-verde text-white shadow-[0_8px_30px_-8px_rgba(34,197,94,0.6)]'
              : 'bg-rojo text-white shadow-[0_8px_30px_-8px_rgba(237,28,36,0.6)]'
          }`}
        >
          🏁 Día culminado
        </button>
      ) : null}

      {/* Confirmación de día de descanso (#6) */}
      {confirmarDescanso ? (
        <Overlay onClose={() => setConfirmarDescanso(false)}>
          <p className="text-lg font-black text-white">¿Marcar hoy como día de descanso?</p>
          <p className="mt-2 text-sm text-tenue">
            En un día de descanso no hace falta el capitán, pero igual necesitás
            cumplir 2 de tus 3 hábitos para ganar el día.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmarDescanso(false)}
              className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 font-bold text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmarDescanso(false);
                setDescanso(true);
              }}
              className="h-12 flex-1 rounded-full bg-rojo font-bold text-white"
            >
              Sí, descanso
            </button>
          </div>
        </Overlay>
      ) : null}

      {/* Celebración: día ganado con confeti (#9) */}
      {celebracion === 'ganado' ? (
        <>
          <Confeti />
          <Overlay onClose={() => setCelebracion(null)}>
            <div className="text-center">
              <p className="text-5xl">🏆</p>
              <p className="mt-3 text-2xl font-black text-white">¡Partido ganado!</p>
              <p className="mt-2 text-lg font-semibold text-verde">{frase}</p>
              <button
                type="button"
                onClick={() => setCelebracion(null)}
                className="mt-6 h-13 w-full rounded-full bg-verde py-3 font-bold text-white"
              >
                ¡Dale!
              </button>
            </div>
          </Overlay>
        </>
      ) : null}

      {/* Todavía no alcanza para ganar el día */}
      {celebracion === 'falta' ? (
        <Overlay onClose={() => setCelebracion(null)}>
          <p className="text-lg font-black text-white">Todavía no cerraste el día</p>
          <p className="mt-2 text-sm text-tenue">
            Para ganar el partido de hoy necesitás el capitán (o declarar
            descanso) más {necesarios} de tus {slugs.length} hábitos. Llevás{' '}
            {cumplidos}. ¡Dale que estás cerca!
          </p>
          <button
            type="button"
            onClick={() => setCelebracion(null)}
            className="mt-5 h-12 w-full rounded-full bg-rojo font-bold text-white"
          >
            Sigo
          </button>
        </Overlay>
      ) : null}
    </div>
  );
}

/** Overlay centrado reutilizable para los pop-ups. */
function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <div className="animar-pop relative w-full max-w-sm rounded-3xl border border-white/10 bg-superficie p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
