import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ExpertProfileClient } from './ExpertProfileClient';
import { DEMO_EXPERT_MAP, DEMO_EXPERT_ID_MAP } from '@/lib/constants/demoExperts';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Check demo data first
  const demo = DEMO_EXPERT_MAP[params.username] || DEMO_EXPERT_ID_MAP[params.username];
  if (demo) {
    return {
      title: `${demo.full_name} — ${demo.category}`,
      description: demo.tagline,
    };
  }

  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, experts(tagline, category)')
    .eq('username', params.username)
    .single();

  if (!profile) return { title: 'বিশেষজ্ঞ পাওয়া যায়নি' };
  const expert = (profile as any).experts?.[0];
  return {
    title: `${profile.full_name} — ${expert?.category || 'বিশেষজ্ঞ'}`,
    description: expert?.tagline || `${profile.full_name}-এর বিশেষজ্ঞ প্রোফাইল`,
  };
}

export default async function ExpertProfilePage({ params }: Props) {
  // Serve demo profiles without hitting Supabase
  const demo = DEMO_EXPERT_MAP[params.username] || DEMO_EXPERT_ID_MAP[params.username];
  if (demo) {
    return <ExpertProfileClient expertId={demo.id} demoData={demo} />;
  }

  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) {
    const { data: expertById } = await supabase
      .from('experts')
      .select('*, profiles(*)')
      .eq('id', params.username)
      .single();

    if (!expertById) notFound();
    return <ExpertProfileClient expertId={expertById.id} />;
  }

  const { data: expert } = await supabase
    .from('experts')
    .select('*')
    .eq('user_id', profile.id)
    .single();

  if (!expert || expert.verification_status !== 'approved') notFound();

  return <ExpertProfileClient expertId={expert.id} />;
}
