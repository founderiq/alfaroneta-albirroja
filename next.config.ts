import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // HOY: la app corre en la raíz del dominio genérico de Vercel.
  //
  // PARA MOVER A alfaroneta.com/pretemporada: descomentá la línea de basePath.
  // Todos los links/rutas del código son relativos (next/link y redirects
  // internos respetan basePath automáticamente), así que no hay que tocar
  // nada más acá. Ver README → "Cómo mover al dominio final".
  //
  // basePath: '/pretemporada',
};

export default nextConfig;
