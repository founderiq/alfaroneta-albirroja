# Alfaroneta · La Pretemporada (app de contenido NFC)

App web que ven los usuarios al tocar la pulsera NFC de Alfaroneta: onboarding con
código único de activación + app diaria de hábitos ("El partido de hoy"), reto de
60 días presentado como un campeonato de 9 fechas.

> El sitio de venta (`alfaroneta.com`, hecho en Lovable) es un proyecto aparte y
> **no se toca**. Este repo es solo la experiencia post-tap.

**Stack:** Next.js (App Router) + React + TypeScript · Tailwind CSS · Supabase
(Auth + Postgres) · Vercel.

---

## Estructura

```
app/
  page.tsx                 → Pantalla 0: bienvenida (la URL que abren las pulseras)
  onboarding/              → Pantallas 1-10 (perfil, cuenta, disclaimer, código, listo)
  login/ recuperar/ reset-password/  → acceso de respaldo por correo + contraseña
  app/                     → app diaria (requiere sesión)
    page.tsx               → "El partido de hoy" (frase, checks, estado)
    repesca/               → editar SOLO el día anterior (ventana de 24 h)
    tarjeta/               → Tarjeta de Jugador (bronce/plata/oro)
    rutinas/               → rutinas full body gym y casa (estáticas)
    perfil/                → datos, dato de garantía, editar apoyos, logout
  actions/                 → Server Actions (registro, checks del día, cuenta)
lib/                       → reglas del reto, fechas (hora de Paraguay), Supabase
components/                → UI compartida (checklist, menú, tarjeta, primitivas)
supabase/
  migrations/0001_init.sql → tablas + RLS
  seed/phrases.sql         → las 200 frases (ANEXO A)
  seed/codes.sql           → los 450 códigos únicos
  codes.csv                → la misma lista, para imprimir los vouchers
scripts/generate-codes.mjs → generador reproducible de códigos
proxy.ts                   → refresco de sesión Supabase en cada request
```

---

## Setup paso a paso

### 1. Crear el proyecto Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com) (región `sa-east-1`
   es la más cercana a Paraguay).
2. En **SQL Editor**, correr en este orden:
   1. `supabase/migrations/0001_init.sql` (tablas + Row Level Security)
   2. `supabase/seed/phrases.sql` (las 200 frases)
   3. `supabase/seed/codes.sql` (los 450 códigos)
3. En **Authentication → Providers**, dejar habilitado **Email**. No hace falta
   confirmación de correo: el registro confirma el correo automáticamente porque
   el código físico del voucher ya valida la compra. La recuperación de
   contraseña sí llega por correo.
4. En **Authentication → URL Configuration**:
   - **Site URL**: la URL del deploy (ej. `https://tu-proyecto.vercel.app`)
   - **Redirect URLs**: agregar `https://tu-proyecto.vercel.app/**` (y
     `http://localhost:3000/**` para desarrollo). Esto es lo que permite que el
     link de "olvidé mi contraseña" vuelva a la app.

> Sesiones largas: por defecto Supabase mantiene la sesión viva indefinidamente
> vía refresh tokens (la app la refresca en cada visita con `proxy.ts`), que es
> exactamente lo que queremos: tap → directo al partido de hoy. No configurar
> "time-box" ni "inactivity timeout" en Auth → Sessions.

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

| Variable | Dónde sale | Visibilidad |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | pública (protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **secreta, solo servidor** |

La service role se usa únicamente en el registro (validar el código, casarlo con
la cuenta y crear el usuario). La tabla `codes` no tiene policies de RLS, así que
es invisible para los clientes: la lista de códigos nunca viaja al navegador.

### 3. Correr local

```bash
npm install
npm run dev   # http://localhost:3000
```

### 4. Deploy en Vercel

1. Push del repo a GitHub.
2. En Vercel: **Import Project** → elegir el repo (framework: Next.js, sin
   configuración extra).
3. Cargar las 3 variables de entorno en **Settings → Environment Variables**.
4. Deploy. Cada `git push` a la rama conectada redeploya solo.
5. Actualizar Site URL / Redirect URLs de Supabase con la URL real del deploy
   (paso 1.4).

### 5. Los 450 códigos (vouchers)

- La lista lista para imprimir está en **`supabase/codes.csv`** (formato
  `ALF-XXXX-XXXX`, alfabeto sin `0/O/1/I/L` para que nadie se confunda al
  tipear).
- Es generada por `node scripts/generate-codes.mjs`, reproducible: con la misma
  semilla (`CODES_SEED`, default `20260714`) sale siempre la misma lista. Para
  otra tanda: `CODES_SEED=999 node scripts/generate-codes.mjs` (regenera
  `codes.sql` y `codes.csv`).
- **1 código = 1 cuenta para siempre**: al registrarse se marca `usado` y se
  vincula al perfil de forma atómica (si dos personas cargan el mismo código a
  la vez, solo una gana; la otra recibe "código ya usado" y no se le crea
  cuenta).

---

## Reglas del reto implementadas (resumen)

- **Ganar el día** = capitán cumplido (entrenó **o** declaró descanso) + al menos
  **2 de 3** apoyos. Si eligió menos de 2 apoyos, se le exigen todos los que
  eligió.
- **Silencio = día no ganado.** Nunca se asume descanso.
- **Descanso** lo declara el usuario (pantalla del día o menú); cumple el capitán
  automáticamente pero igual necesita los apoyos.
- **Repesca**: solo el día inmediato anterior, editable mientras dure el día de
  hoy (hora de Paraguay). Días más viejos quedan cerrados.
- **Racha** vuelve a 0 al perder; **partidos ganados y fecha nunca se borran**.
- **Tarjetas**: amarilla (1 día perdido), roja (2 seguidos). Solo señal visual.
- **Reinicio solo voluntario** (menú, con confirmación). Cierra la carrera en
  `challenge_runs` y abre otra; el historial se conserva.
- **60 días = 9 fechas**: fechas 1-8 de 7 días, fecha 9 = días 57-60 (incluye la
  final).
- **Niveles**: Bronce 0-19 · Plata 20-39 · Oro 40+ partidos ganados.
- **Frase del día**: determinística por fecha (misma para todos), rotando las 200
  sin repetir hasta agotarlas.
- **Garantía**: el cumplimiento del capitán contra la meta de frecuencia es
  visible en **Mi perfil** (y consultable en SQL:
  `select count(*) from daily_logs where profile_id = '...' and capitan_cumplido`).
- **Zona horaria**: el "día" cambia a medianoche de `America/Asuncion`,
  independiente de dónde corra el servidor.

---

## Cómo mover al dominio final (`alfaroneta.com/pretemporada`)

El código no tiene ninguna URL absoluta hardcodeada (links relativos; los mails
de recuperación usan el origin del request), así que el cambio es solo
configuración:

**Opción A — subruta `alfaroneta.com/pretemporada` (la planificada):**

1. En `next.config.ts`, descomentar `basePath: '/pretemporada'` y redeployar.
2. El dominio raíz sigue sirviendo la web de venta (Lovable). Hay que hacer que
   `alfaroneta.com/pretemporada/*` llegue a este proyecto:
   - Si el DNS de `alfaroneta.com` se puede apuntar a Vercel: agregar el dominio
     al proyecto Vercel y hacer que la web de venta viva detrás de un rewrite, **o**
   - (más simple si Lovable retiene el dominio) configurar en el proxy/host de la
     web de venta un reverse-proxy de `/pretemporada` hacia
     `tu-proyecto.vercel.app/pretemporada`.
3. Actualizar en Supabase **Auth → URL Configuration**: Site URL y Redirect URLs
   a `https://alfaroneta.com/pretemporada` y `https://alfaroneta.com/**`.
4. Grabar `https://alfaroneta.com/pretemporada` en las pulseras.

**Opción B — subdominio (ej. `reto.alfaroneta.com`), operativamente más simple:**

1. NO tocar `basePath` (queda en raíz).
2. En Vercel → Settings → Domains, agregar `reto.alfaroneta.com`; crear el
   registro DNS `CNAME reto → cname.vercel-dns.com` donde esté el DNS de
   `alfaroneta.com`.
3. Actualizar Site URL / Redirect URLs de Supabase a
   `https://reto.alfaroneta.com`.
4. Grabar esa URL en las pulseras.

En ambos casos las sesiones existentes del dominio `.vercel.app` no migran (los
usuarios hacen login una vez en el dominio nuevo). Por eso conviene mover el
dominio **antes** de repartir pulseras.

---

## Decisiones tomadas (donde el documento dejaba margen)

- **Frase del día**: misma para todos, indexada por fecha (`días desde
  2026-01-01 mod 200`). Así no se repite al reiniciar el reto y alcanza para los
  ~180 días de vigencia.
- **"9 fechas" en 60 días**: semanas de 7 días para las fechas 1-8; la fecha 9
  son los días 57-60 y el día 60 se muestra como "La Final".
- **Apoyos elegidos < 3**: el mínimo para ganar es `min(2, cantidad elegida)`.
- **Jugados** (para efectividad): días ya cerrados + hoy solo si ya lo ganó (hoy
  "en juego" no cuenta en contra).
- **Reinicio**: el registro del mismo día del reinicio se limpia para arrancar el
  día 1 en blanco; todo lo anterior queda en el historial.
- **Compartir la Tarjeta como imagen**: nice-to-have pendiente (no bloqueante en
  v1, como marca el documento).
- **Vigencia dic-2026 / modo evergreen**: no implementado como lógica automática;
  cuando llegue el momento es un cambio chico (servir solo la frase y ocultar los
  checks).
