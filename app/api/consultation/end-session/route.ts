import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendReviewRequestEmail } from '@/lib/email/resend';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { roomId } = await req.json();

  const db = createServiceClient();

  const { data: room } = await db
    .from('consultation_rooms')
    .select('*, bookings!inner(*, experts!inner(user_id))')
    .eq('id', roomId)
    .single();

  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const booking = (room as any).bookings;
  const expertUserId = booking.experts?.user_id;

  if (session.user.id !== expertUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (room.status === 'ended') return NextResponse.json({ message: 'Already ended' });

  const endedAt = new Date().toISOString();
  const startedAt = room.started_at ? new Date(room.started_at) : new Date();
  const actualDuration = Math.floor((new Date(endedAt).getTime() - startedAt.getTime()) / 60000);

  await db.from('consultation_rooms').update({
    status: 'ended',
    ended_at: endedAt,
    actual_duration_minutes: actualDuration,
  }).eq('id', roomId);

  await db.from('bookings').update({ status: 'completed' }).eq('id', booking.id);

  // Credit expert wallet
  const { data: wallet } = await db
    .from('expert_wallets')
    .select('*')
    .eq('expert_id', booking.expert_id)
    .single();

  if (wallet) {
    await db.from('expert_wallets').update({
      pending_balance: wallet.pending_balance + booking.expert_earnings,
      total_earned: wallet.total_earned + booking.expert_earnings,
    }).eq('expert_id', booking.expert_id);
  } else {
    await db.from('expert_wallets').insert({
      expert_id: booking.expert_id,
      pending_balance: booking.expert_earnings,
      total_earned: booking.expert_earnings,
    });
  }

  await db.from('notifications').insert({
    user_id: booking.user_id,
    title: 'সেশন সম্পন্ন হয়েছে',
    body: 'বিশেষজ্ঞকে রেটিং দিন এবং রিভিউ লিখুন।',
    type: 'session_completed',
    related_id: booking.id,
  });

  try {
    const { data: userProfile } = await db.from('profiles').select('email, full_name').eq('id', booking.user_id).single();
    const { data: expertProfile } = await db.from('profiles').select('full_name').eq('id', expertUserId).single();
    if (userProfile?.email && expertProfile?.full_name) {
      await sendReviewRequestEmail(userProfile.email, expertProfile.full_name);
    }
  } catch {}

  return NextResponse.json({ success: true });
}
