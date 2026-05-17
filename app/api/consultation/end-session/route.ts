import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendReviewRequestEmail } from '@/lib/email/resend';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { roomId } = await req.json();

  const { data: room } = await supabase
    .from('consultation_rooms')
    .select('*, bookings!inner(*, experts!inner(user_id))')
    .eq('id', roomId)
    .single();

  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const booking = (room as any).bookings;
  const expertUserId = booking.experts?.user_id;

  // Only expert or system can end session
  if (session.user.id !== expertUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (room.status === 'ended') return NextResponse.json({ message: 'Already ended' });

  const endedAt = new Date().toISOString();
  const startedAt = room.started_at ? new Date(room.started_at) : new Date();
  const actualDuration = Math.floor((new Date(endedAt).getTime() - startedAt.getTime()) / 60000);

  await supabase.from('consultation_rooms').update({
    status: 'ended',
    ended_at: endedAt,
    actual_duration_minutes: actualDuration,
  }).eq('id', roomId);

  await supabase.from('bookings').update({ status: 'completed' }).eq('id', booking.id);

  // Credit expert wallet (pending balance — released after 3 days)
  const { data: wallet } = await supabase
    .from('expert_wallets')
    .select('*')
    .eq('expert_id', booking.expert_id)
    .single();

  if (wallet) {
    await supabase.from('expert_wallets').update({
      pending_balance: wallet.pending_balance + booking.expert_earnings,
      total_earned: wallet.total_earned + booking.expert_earnings,
    }).eq('expert_id', booking.expert_id);
  } else {
    await supabase.from('expert_wallets').insert({
      expert_id: booking.expert_id,
      pending_balance: booking.expert_earnings,
      total_earned: booking.expert_earnings,
    });
  }

  // Notify user to review
  await supabase.from('notifications').insert({
    user_id: booking.user_id,
    title: 'সেশন সম্পন্ন হয়েছে',
    body: 'বিশেষজ্ঞকে রেটিং দিন এবং রিভিউ লিখুন।',
    type: 'session_completed',
    related_id: booking.id,
  });

  try {
    const { data: userProfile } = await supabase.from('profiles').select('email, full_name').eq('id', booking.user_id).single();
    const { data: expertProfile } = await supabase.from('profiles').select('full_name').eq('id', expertUserId).single();
    if (userProfile?.email && expertProfile?.full_name) {
      await sendReviewRequestEmail(userProfile.email, expertProfile.full_name);
    }
  } catch {}

  return NextResponse.json({ success: true });
}
