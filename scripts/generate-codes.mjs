#!/usr/bin/env node
// Genera los 450 códigos únicos de las pulseras (formato ALF-XXXX-XXXX).
//
// Reproducible: usa un PRNG con semilla fija, así el mismo seed genera siempre
// la misma lista. Cambiá la semilla con CODES_SEED si necesitás otra tanda.
//
// Salidas:
//   - supabase/seed/codes.sql  → para cargar en Supabase
//   - supabase/codes.csv       → lista para imprimir los vouchers
//
// Uso:  node scripts/generate-codes.mjs
//       CODES_SEED=123 CODES_COUNT=450 node scripts/generate-codes.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CANTIDAD = Number(process.env.CODES_COUNT ?? 450);
const SEED = Number(process.env.CODES_SEED ?? 20260714);

// Sin 0/O, 1/I/L para que nadie se confunda al tipear el voucher.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);
const codigos = new Set();
while (codigos.size < CANTIDAD) {
  let cuerpo = '';
  for (let i = 0; i < 8; i++) {
    cuerpo += ALFABETO[Math.floor(rand() * ALFABETO.length)];
  }
  codigos.add(`ALF-${cuerpo.slice(0, 4)}-${cuerpo.slice(4)}`);
}
const lista = [...codigos];

const sql = [
  '-- Seed de códigos únicos de pulseras (generado por scripts/generate-codes.mjs)',
  `-- Semilla: ${SEED} · Cantidad: ${CANTIDAD}`,
  'insert into public.codes (codigo) values',
  lista.map((c, i) => `  ('${c}')${i === lista.length - 1 ? '' : ','}`).join('\n'),
  'on conflict (codigo) do nothing;',
  '',
].join('\n');

const csv = ['codigo', ...lista].join('\n') + '\n';

mkdirSync(join(ROOT, 'supabase', 'seed'), { recursive: true });
writeFileSync(join(ROOT, 'supabase', 'seed', 'codes.sql'), sql);
writeFileSync(join(ROOT, 'supabase', 'codes.csv'), csv);

console.log(`Generados ${lista.length} códigos (semilla ${SEED}).`);
console.log('  → supabase/seed/codes.sql');
console.log('  → supabase/codes.csv (lista para imprimir vouchers)');
