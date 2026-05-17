import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ExpertProfileClient } from './ExpertProfileClient';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) {
    // Try by expert ID
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
