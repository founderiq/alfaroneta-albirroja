import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingFlow from './OnboardingFlow';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: perfil } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (perfil) redirect('/app');
  }

  return <OnboardingFlow />;
}
