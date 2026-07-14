'use client';

import { type ReactNode } from 'react';

/** Botón primario negro full-width (estilo Alfaroneta). */
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
      className="h-14 w-full rounded-2xl bg-neutral-900 text-base font-bold text-white transition
        active:scale-[0.98] disabled:bg-neutral-300 disabled:text-neutral-500"
    >
      {cargando ? 'Un momento…' : children}
    </button>
  );
}

/** Contenedor sticky de abajo para el botón primario. */
export function PieSticky({ children }: { children: ReactNode }) {
  return (
    <div className="pb-safe sticky bottom-0 -mx-5 mt-auto bg-gradient-to-t from-[#f4f4f2] via-[#f4f4f2] to-transparent px-5 pt-4 pb-5">
      {children}
    </div>
  );
}

/** Barra de progreso fina de arriba (onboarding). */
export function BarraProgreso({ paso, total }: { paso: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (paso / total) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
      <div
        className="h-full rounded-full bg-neutral-900 transition-all duration-300"
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
      className={`flex w-full items-center justify-between gap-3 rounded-3xl border-2 bg-white p-5 text-left transition active:scale-[0.99] ${
        seleccionada ? 'border-verde' : 'border-transparent'
      }`}
    >
      <span>
        <span className="block text-base font-semibold">{children}</span>
        {descripcion ? (
          <span className="mt-1 block text-sm text-neutral-500">{descripcion}</span>
        ) : null}
      </span>
      <CheckCirculo activo={seleccionada} />
    </button>
  );
}

/** Círculo de check verde. */
export function CheckCirculo({ activo }: { activo: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition ${
        activo
          ? 'border-verde bg-verde text-white'
          : 'border-neutral-300 bg-white text-transparent'
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
      <span className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={`h-13 w-full rounded-2xl border-2 bg-white px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 ${
          error ? 'border-red-400' : 'border-neutral-200'
        }`}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

/** Aviso de error genérico. */
export function AvisoError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {children}
    </p>
  );
}
