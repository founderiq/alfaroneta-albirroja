'use client';

import { type ReactNode } from 'react';

/** Botón primario rojo tipo píldora (estilo Alfaroneta web). */
export function BotonPrimario({
  children,
  onClick,
  type = 'button',
  disabled = false,
  cargando = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  cargando?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || cargando}
      className="h-14 w-full rounded-full bg-rojo text-base font-bold text-white shadow-[0_8px_30px_-8px_rgba(237,28,36,0.6)] transition
        active:scale-[0.98] hover:bg-rojo-oscuro disabled:bg-superficie2 disabled:text-neutral-500 disabled:shadow-none"
    >
      {cargando ? 'Un momento…' : children}
    </button>
  );
}

/** Botón secundario oscuro con borde (píldora). */
export function BotonSecundario({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="h-14 w-full rounded-full border border-white/15 bg-white/5 text-base font-bold text-white transition active:scale-[0.98] hover:bg-white/10 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Contenedor sticky de abajo para el botón primario. */
export function PieSticky({ children }: { children: ReactNode }) {
  return (
    <div className="pb-safe sticky bottom-0 -mx-5 mt-auto bg-gradient-to-t from-fondo from-60% via-fondo to-transparent px-5 pt-6">
      {children}
    </div>
  );
}

/** Barra de progreso fina de arriba (onboarding). */
export function BarraProgreso({ paso, total }: { paso: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (paso / total) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-rojo transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Tarjeta seleccionable (single o multi select) del onboarding. */
export function TarjetaSeleccion({
  seleccionada,
  onClick,
  children,
  descripcion,
}: {
  seleccionada: boolean;
  onClick: () => void;
  children: ReactNode;
  descripcion?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={seleccionada}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-5 text-left transition active:scale-[0.99] ${
        seleccionada
          ? 'border-rojo bg-rojo/10'
          : 'border-white/10 bg-superficie hover:border-white/20'
      }`}
    >
      <span>
        <span className="block text-base font-semibold text-white">{children}</span>
        {descripcion ? (
          <span className="mt-1 block text-sm text-tenue">{descripcion}</span>
        ) : null}
      </span>
      <CheckCirculo activo={seleccionada} tono="rojo" />
    </button>
  );
}

/** Círculo de check. tono: verde = cumplido/éxito, rojo = seleccionado. */
export function CheckCirculo({
  activo,
  tono = 'verde',
}: {
  activo: boolean;
  tono?: 'verde' | 'rojo';
}) {
  const activoClase =
    tono === 'rojo' ? 'border-rojo bg-rojo text-white' : 'border-verde bg-verde text-white';
  return (
    <span
      aria-hidden
      className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition ${
        activo ? activoClase : 'border-white/25 bg-transparent text-transparent'
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

export function CampoTexto({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'numeric';
  error?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-neutral-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={`h-13 w-full rounded-2xl border-2 bg-superficie2 px-4 text-base text-white outline-none transition placeholder:text-neutral-500 focus:border-rojo ${
          error ? 'border-red-500' : 'border-white/10'
        }`}
      />
      {error ? <span className="mt-1 block text-sm text-red-400">{error}</span> : null}
    </label>
  );
}

/** Aviso de error genérico. */
export function AvisoError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
      {children}
    </p>
  );
}

/** Píldora/etiqueta chica estilo web (borde rojo, texto en mayúsculas). */
export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rojo/40 bg-rojo/10 px-3 py-1 text-xs font-bold tracking-widest text-rojo">
      {children}
    </span>
  );
}
