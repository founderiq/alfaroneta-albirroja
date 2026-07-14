import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Pretemporada · Alfaroneta',
  description:
    '60 días para volver a tu mejor versión. Un partido a la vez. El Mundial termina, la garra guaraní continúa.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f4f4f2',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
