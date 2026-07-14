'use client';

// Onboarding — pantallas 1 a 10 del documento de contexto.
// Una pregunta por pantalla, barra de progreso arriba, botón negro abajo.
// Los datos se juntan acá y recién en el último paso (código) se crea la cuenta.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registrarCuenta } from '@/app/actions/registro';
import {
  CAPITAN,
  FRECUENCIAS,
  HABITOS_APOYO,
  MAX_APOYOS,
  NIVELES,
  OBJETIVOS,
  labelDeApoyo,
} from '@/lib/habitos';
import {
  AvisoError,
  BarraProgreso,
  BotonPrimario,
  CampoTexto,
  CheckCirculo,
  PieSticky,
  TarjetaSeleccion,
} from '@/components/ui';

const TOTAL_PASOS = 9; // pasos con barra de progreso (1 a 9); el 10 es "listo"

type Datos = {
  objetivo: string | null;
  nivel: string | null;
  frecuencia: number | null;
  apoyos: string[];
  nombre: string;
  correo: string;
  password: string;
  password2: string;
  sexo: 'hombre' | 'mujer' | null;
  edad: string;
  disclaimer: boolean;
  codigo: string;
};

const DATOS_INICIALES: Datos = {
  objetivo: null,
  nivel: null,
  frecuencia: null,
  apoyos: [],
  nombre: '',
  correo: '',
  password: '',
  password2: '',
  sexo: null,
  edad: '',
  disclaimer: false,
  codigo: '',
};

const STORAGE_KEY = 'alfaroneta-onboarding';

export default function OnboardingFlow() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState<Datos>(DATOS_INICIALES);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sesionIniciada, setSesionIniciada] = useState(true);

  // Si recarga a mitad de camino, no pierde lo que ya eligió (menos contraseñas).
  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(STORAGE_KEY);
      if (guardado) setDatos((d) => ({ ...d, ...JSON.parse(guardado) }));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const { password: _p, password2: _p2, ...resto } = datos;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(resto));
    } catch {}
  }, [datos]);

  const set = <K extends keyof Datos>(campo: K, valor: Datos[K]) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const avanzar = () => {
    setError(null);
    setPaso((p) => p + 1);
    window.scrollTo({ top: 0 });
  };

  const volver = () => {
    setError(null);
    setPaso((p) => Math.max(1, p - 1));
  };

  const toggleApoyo = (slug: string) => {
    setError(null);
    setDatos((d) => {
      if (d.apoyos.includes(slug)) {
        return { ...d, apoyos: d.apoyos.filter((s) => s !== slug) };
      }
      if (d.apoyos.length >= MAX_APOYOS) {
        setError('Máximo 3 hábitos. Si querés cambiar uno, destildalo primero.');
        return d;
      }
      return { ...d, apoyos: [...d.apoyos, slug] };
    });
  };

  const validarCuenta = (): string | null => {
    if (datos.nombre.trim().length < 3) return 'Poné tu nombre y apellido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim()))
      return 'Ese correo no parece válido. Revisalo.';
    if (datos.password.length < 8)
      return 'La contraseña tiene que tener al menos 8 caracteres.';
    if (datos.password !== datos.password2) return 'Las contraseñas no coinciden.';
    return null;
  };

  const validarSexoEdad = (): string | null => {
    if (!datos.sexo) return 'Elegí una opción.';
    const edad = Number(datos.edad);
    if (!Number.isInteger(edad) || edad < 12 || edad > 100)
      return 'Poné una edad válida.';
    return null;
  };

  const enviarRegistro = async () => {
    setError(null);
    const codigoLimpio = datos.codigo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^ALF[A-Z0-9]{8}$/.test(codigoLimpio)) {
      setError('El código tiene el formato ALF-XXXX-XXXX. Revisá tu voucher.');
      return;
    }
    setEnviando(true);
    try {
      const resultado = await registrarCuenta({
        objetivo: datos.objetivo ?? '',
        nivel: datos.nivel ?? '',
        frecuencia: datos.frecuencia ?? 0,
        apoyos: datos.apoyos,
        nombre: datos.nombre,
        correo: datos.correo,
        password: datos.password,
        sexo: datos.sexo as 'hombre' | 'mujer',
        edad: Number(datos.edad),
        disclaimer: datos.disclaimer,
        codigo: datos.codigo,
      });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setSesionIniciada(resultado.sesionIniciada);
      sessionStorage.removeItem(STORAGE_KEY);
      setPaso(10);
      window.scrollTo({ top: 0 });
    } catch {
      setError('Algo salió mal. Revisá tu conexión y probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      {paso <= TOTAL_PASOS ? (
        <header className="sticky top-0 z-10 -mx-5 bg-[#f4f4f2]/95 px-5 pt-5 pb-3 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            {paso > 1 ? (
              <button
                type="button"
                onClick={volver}
                aria-label="Volver"
                className="grid size-9 place-items-center rounded-full bg-white text-lg shadow-sm"
              >
                ←
              </button>
            ) : (
              <Link
                href="/"
                aria-label="Volver al inicio"
                className="grid size-9 place-items-center rounded-full bg-white text-lg shadow-sm"
              >
                ←
              </Link>
            )}
            <span className="text-xs font-bold tracking-widest text-neutral-400">
              PASO {paso} DE {TOTAL_PASOS}
            </span>
          </div>
          <BarraProgreso paso={paso} total={TOTAL_PASOS} />
        </header>
      ) : null}

      {/* ---------- Paso 1 · Meta principal ---------- */}
      {paso === 1 && (
        <Paso
          titulo="¿Qué querés lograr en estos 60 días?"
          botones={
            <BotonPrimario onClick={avanzar} disabled={!datos.objetivo}>
              Continuar
            </BotonPrimario>
          }
        >
          <div className="space-y-3">
            {OBJETIVOS.map((o) => (
              <TarjetaSeleccion
                key={o}
                seleccionada={datos.objetivo === o}
                onClick={() => set('objetivo', o)}
              >
                {o}
              </TarjetaSeleccion>
            ))}
          </div>
        </Paso>
      )}

      {/* ---------- Paso 2 · Nivel actual ---------- */}
      {paso === 2 && (
        <Paso
          titulo="¿Cómo venís entrenando últimamente?"
          botones={
            <BotonPrimario onClick={avanzar} disabled={!datos.nivel}>
              Continuar
            </BotonPrimario>
          }
        >
          <div className="space-y-3">
            {NIVELES.map((n) => (
              <TarjetaSeleccion
                key={n}
                seleccionada={datos.nivel === n}
                onClick={() => set('nivel', n)}
              >
                {n}
              </TarjetaSeleccion>
            ))}
          </div>
        </Paso>
      )}

      {/* ---------- Paso 3 · Hábito capitán (informativo) ---------- */}
      {paso === 3 && (
        <Paso
          titulo="Tu hábito capitán: moverte 45 minutos"
          botones={<BotonPrimario onClick={avanzar}>Lo acepto</BotonPrimario>}
        >
          <div className="rounded-3xl bg-white p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-verde-suave text-2xl">
              🏃
            </div>
            <p className="text-base leading-relaxed text-neutral-700">
              Es el innegociable. Vos elegís cómo: gym, correr, caminar, fútbol,
              bici, lo que te haga bien. Lo importante no es el cómo, es moverte
              todos los días que te toque.
            </p>
          </div>
        </Paso>
      )}

      {/* ---------- Paso 4 · Frecuencia ---------- */}
      {paso === 4 && (
        <Paso
          titulo="¿Cuántos días por semana vas a entrenar?"
          subtitulo="Es tu meta de referencia. Los días de descanso los marcás vos en el momento."
          botones={
            <BotonPrimario onClick={avanzar} disabled={!datos.frecuencia}>
              Continuar
            </BotonPrimario>
          }
        >
          <div className="space-y-3">
            {FRECUENCIAS.map((f) => (
              <TarjetaSeleccion
                key={f}
                seleccionada={datos.frecuencia === f}
                onClick={() => set('frecuencia', f)}
              >
                {f} días por semana
              </TarjetaSeleccion>
            ))}
          </div>
        </Paso>
      )}

      {/* ---------- Paso 5 · Hábitos de apoyo ---------- */}
      {paso === 5 && (
        <Paso
          titulo="Elegí hasta 3 hábitos que querés instalar"
          subtitulo={`Elegidos: ${datos.apoyos.length} de ${MAX_APOYOS}`}
          botones={
            <>
              <AvisoError>{error}</AvisoError>
              <BotonPrimario onClick={avanzar} disabled={datos.apoyos.length < 1}>
                Continuar
              </BotonPrimario>
            </>
          }
        >
          <div className="space-y-3">
            {HABITOS_APOYO.map((h) => (
              <TarjetaSeleccion
                key={h.slug}
                seleccionada={datos.apoyos.includes(h.slug)}
                onClick={() => toggleApoyo(h.slug)}
              >
                <span className="mr-2">{h.emoji}</span>
                {h.label}
              </TarjetaSeleccion>
            ))}
          </div>
        </Paso>
      )}

      {/* ---------- Paso 6 · Datos de cuenta ---------- */}
      {paso === 6 && (
        <Paso
          titulo="Creá tu cuenta"
          subtitulo="Con esto entrás desde cualquier dispositivo."
          botones={
            <>
              <AvisoError>{error}</AvisoError>
              <BotonPrimario
                onClick={() => {
                  const e = validarCuenta();
                  if (e) setError(e);
                  else avanzar();
                }}
              >
                Continuar
              </BotonPrimario>
            </>
          }
        >
          <div className="space-y-4">
            <CampoTexto
              label="Nombre y apellido"
              value={datos.nombre}
              onChange={(v) => set('nombre', v)}
              placeholder="Juan Pérez"
              autoComplete="name"
            />
            <CampoTexto
              label="Correo"
              type="email"
              inputMode="email"
              value={datos.correo}
              onChange={(v) => set('correo', v)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
            <CampoTexto
              label="Contraseña"
              type="password"
              value={datos.password}
              onChange={(v) => set('password', v)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
            <CampoTexto
              label="Repetir contraseña"
              type="password"
              value={datos.password2}
              onChange={(v) => set('password2', v)}
              placeholder="La misma de arriba"
              autoComplete="new-password"
            />
          </div>
        </Paso>
      )}

      {/* ---------- Paso 7 · Sexo y edad ---------- */}
      {paso === 7 && (
        <Paso
          titulo="Contanos un poco más de vos"
          subtitulo="Lo usamos para las estadísticas y recomendaciones generales."
          botones={
            <>
              <AvisoError>{error}</AvisoError>
              <BotonPrimario
                onClick={() => {
                  const e = validarSexoEdad();
                  if (e) setError(e);
                  else avanzar();
                }}
              >
                Continuar
              </BotonPrimario>
            </>
          }
        >
          <div className="space-y-3">
            <TarjetaSeleccion
              seleccionada={datos.sexo === 'hombre'}
              onClick={() => set('sexo', 'hombre')}
            >
              Hombre
            </TarjetaSeleccion>
            <TarjetaSeleccion
              seleccionada={datos.sexo === 'mujer'}
              onClick={() => set('sexo', 'mujer')}
            >
              Mujer
            </TarjetaSeleccion>
            <div className="pt-2">
              <CampoTexto
                label="Edad"
                inputMode="numeric"
                value={datos.edad}
                onChange={(v) => set('edad', v.replace(/\D/g, '').slice(0, 3))}
                placeholder="Ej: 28"
              />
            </div>
          </div>
        </Paso>
      )}

      {/* ---------- Paso 8 · Disclaimer de salud ---------- */}
      {paso === 8 && (
        <Paso
          titulo="Antes de arrancar, esto es importante"
          botones={
            <BotonPrimario onClick={avanzar} disabled={!datos.disclaimer}>
              Continuar
            </BotonPrimario>
          }
        >
          <div className="rounded-3xl bg-white p-6">
            <p className="text-base leading-relaxed text-neutral-700">
              Entiendo que la actividad física es mi responsabilidad. Si tengo una
              lesión, condición médica o cualquier duda, voy a consultar con un
              profesional antes de empezar. Alfaroneta no reemplaza consejo médico.
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('disclaimer', !datos.disclaimer)}
            className={`mt-4 flex w-full items-center gap-3 rounded-3xl border-2 bg-white p-5 text-left font-semibold transition ${
              datos.disclaimer ? 'border-verde' : 'border-transparent'
            }`}
          >
            <CheckCirculo activo={datos.disclaimer} />
            Entiendo y acepto
          </button>
        </Paso>
      )}

      {/* ---------- Paso 9 · Código único ---------- */}
      {paso === 9 && (
        <Paso
          titulo="Activá tu pulsera"
          subtitulo="Ingresá el código único que vino en tu voucher. Se usa una sola vez."
          botones={
            <>
              <AvisoError>{error}</AvisoError>
              <BotonPrimario
                onClick={enviarRegistro}
                cargando={enviando}
                disabled={datos.codigo.trim().length < 8}
              >
                Activar y crear mi cuenta
              </BotonPrimario>
            </>
          }
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Código de activación
            </span>
            <input
              type="text"
              value={datos.codigo}
              onChange={(e) => set('codigo', e.target.value.toUpperCase())}
              placeholder="ALF-XXXX-XXXX"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="h-14 w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 text-center font-mono text-lg tracking-widest outline-none transition placeholder:text-neutral-300 focus:border-neutral-900"
            />
          </label>
          <p className="mt-3 text-sm text-neutral-500">
            El código casa tu pulsera con tu cuenta. Después de este paso no se
            pide nunca más.
          </p>
        </Paso>
      )}

      {/* ---------- Paso 10 · Listo ---------- */}
      {paso === 10 && (
        <div className="flex min-h-dvh flex-col pt-10">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mb-6 grid size-16 place-items-center rounded-full bg-verde text-3xl text-white">
              ✓
            </div>
            <h1 className="text-4xl leading-tight font-black">
              ¡Estás dentro! Arranca tu Pretemporada.
            </h1>
            <p className="mt-3 text-lg text-neutral-600">
              Este es tu plan de juego:
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-3xl bg-white p-5">
                <p className="text-xs font-bold tracking-widest text-neutral-400">
                  HÁBITO CAPITÁN
                </p>
                <p className="mt-1 font-semibold">{CAPITAN.label}</p>
              </div>
              <div className="rounded-3xl bg-white p-5">
                <p className="text-xs font-bold tracking-widest text-neutral-400">
                  HÁBITOS DE APOYO
                </p>
                <ul className="mt-1 space-y-1">
                  {datos.apoyos.map((slug) => (
                    <li key={slug} className="font-semibold">
                      {labelDeApoyo(slug)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white p-5">
                <p className="text-xs font-bold tracking-widest text-neutral-400">
                  FRECUENCIA
                </p>
                <p className="mt-1 font-semibold">
                  {datos.frecuencia} días de entrenamiento por semana
                </p>
              </div>
            </div>
          </div>

          <PieSticky>
            <BotonPrimario
              onClick={() => router.replace(sesionIniciada ? '/app' : '/login')}
            >
              Ver mi partido de hoy
            </BotonPrimario>
          </PieSticky>
        </div>
      )}
    </main>
  );
}

function Paso({
  titulo,
  subtitulo,
  children,
  botones,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  botones: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col pt-6">
      <h1 className="text-3xl leading-tight font-black">{titulo}</h1>
      {subtitulo ? <p className="mt-2 text-neutral-600">{subtitulo}</p> : null}
      <div className="mt-6 flex-1">{children}</div>
      <PieSticky>
        <div className="space-y-3">{botones}</div>
      </PieSticky>
    </div>
  );
}
