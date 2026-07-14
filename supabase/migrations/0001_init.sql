-- ============================================================
-- ALFARONETA · LA PRETEMPORADA — Esquema inicial
-- Correr en el SQL Editor de Supabase (o con `supabase db push`).
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- codes: los 450 códigos únicos de las pulseras.
-- 1 código = 1 cuenta para siempre. Sin policies de RLS:
-- solo el service role (lado servidor) puede leer/escribir.
-- ------------------------------------------------------------
create table public.codes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  usado boolean not null default false,
  profile_id uuid,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- profiles: datos del jugador (1:1 con auth.users).
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_apellido text not null,
  correo text not null,
  sexo text check (sexo in ('hombre', 'mujer')),
  edad integer check (edad between 12 and 100),
  objetivo text,
  nivel text,
  frecuencia_entrenamiento integer not null check (frecuencia_entrenamiento between 3 and 7),
  fecha_inicio_reto date not null,
  capitan text not null default 'Actividad física 45 min',
  habitos_apoyo text[] not null default '{}'::text[]
    check (coalesce(array_length(habitos_apoyo, 1), 0) <= 3),
  codigo_id uuid references public.codes (id),
  created_at timestamptz not null default now()
);

alter table public.codes
  add constraint codes_profile_id_fkey
  foreign key (profile_id) references public.profiles (id) on delete set null;

-- ------------------------------------------------------------
-- challenge_runs: carreras del reto. Al reiniciar se cierra la
-- activa y se abre otra; el historial nunca se borra.
-- ------------------------------------------------------------
create table public.challenge_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  fecha_inicio date not null,
  fecha_fin date,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index challenge_runs_profile_idx on public.challenge_runs (profile_id);
-- una sola carrera activa por usuario
create unique index challenge_runs_una_activa
  on public.challenge_runs (profile_id) where activo;

-- ------------------------------------------------------------
-- daily_logs: un registro por usuario por día.
-- apoyos_cumplidos: jsonb { "slug-del-habito": true/false }.
-- ------------------------------------------------------------
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  run_id uuid references public.challenge_runs (id) on delete set null,
  fecha date not null,
  es_descanso boolean not null default false,
  capitan_cumplido boolean not null default false,
  apoyos_cumplidos jsonb not null default '{}'::jsonb,
  gano_dia boolean not null default false,
  dia_reto integer,
  created_at timestamptz not null default now(),
  unique (profile_id, fecha)
);

create index daily_logs_profile_fecha_idx on public.daily_logs (profile_id, fecha desc);
create index daily_logs_run_idx on public.daily_logs (run_id);

-- ------------------------------------------------------------
-- phrases: las 200 frases motivacionales (seed aparte).
-- ------------------------------------------------------------
create table public.phrases (
  id integer primary key,
  texto text not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.codes enable row level security;
-- codes: SIN policies a propósito → invisible e intocable para clientes.

alter table public.profiles enable row level security;

create policy "perfil propio: leer"
  on public.profiles for select
  using (auth.uid() = id);

create policy "perfil propio: actualizar"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

alter table public.challenge_runs enable row level security;

create policy "carreras propias: leer"
  on public.challenge_runs for select
  using (auth.uid() = profile_id);

create policy "carreras propias: crear"
  on public.challenge_runs for insert
  with check (auth.uid() = profile_id);

create policy "carreras propias: actualizar"
  on public.challenge_runs for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

alter table public.daily_logs enable row level security;

create policy "registros propios: todo"
  on public.daily_logs for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

alter table public.phrases enable row level security;

create policy "frases: leer autenticado"
  on public.phrases for select
  to authenticated
  using (true);
