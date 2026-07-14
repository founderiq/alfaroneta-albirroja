import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Menu from '@/components/Menu';

// Todo lo que cuelga de /app requiere sesión y perfil.
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: perfil } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (!perfil) redirect('/');

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-[#f4f4f2]/95 px-5 py-4 backdrop-blur">
        <Link href="/app" className="leading-none">
          <span className="block text-sm font-black tracking-[0.2em]">ALFARONETA</span>
          <span className="mt-0.5 block text-[10px] font-bold tracking-[0.3em] text-verde">
            LA PRETEMPORADA
          </span>
        </Link>
        <Menu />
      </header>
      <div className="flex flex-1 flex-col px-5 pb-8">{children}</div>
    </div>
  );
}
