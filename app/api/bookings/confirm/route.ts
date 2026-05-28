import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendBookingConfirmedEmail } from '@/lib/email/resend';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookingId, action } = await req.json();
  if (!bookingId || !['accept', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const db = createServiceClient();

  // Verify the caller is the expert for this booking
  const { data: booking } = await db
    .from('bookings')
    .select('*, experts!inner(user_id)')
    .eq('id', bookingId)
    .single();

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const expertUserId = (booking as any).experts?.user_id;
  if (expertUserId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (booking.status !== 'pending') {
    return NextResponse.json({ error: 'Booking is not in pending state' }, { status: 400 });
  }

  const newStatus = action === 'accept' ? 'confirmed' : 'cancelled';

  const { error } = await db
    .from('bookings')
    .update({ status: newStatus, cancelled_by: action === 'reject' ? 'expert' : null })
    .eq('id', bookingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (action === 'accept') {
    await db.from('notifications').insert({
      user_id: booking.user_id,
      title: 'বুকিং নিশ্চিত হয়েছে',
      body: 'বিশেষজ্ঞ আপনার বুকিং গ্রহণ করেছেন। এখন পেমেন্ট করুন।',
      type: 'booking_confirmed',
      related_id: bookingId,
    });

    try {
      const { data: userProfile } = await db.from('profiles').select('email, full_name').eq('id', booking.user_id).single();
      const { data: expertProfile } = await db.from('profiles').select('full_name').eq('id', session.user.id).single();
      if (userProfile?.email && expertProfile?.full_name) {
        await sendBookingConfirmedEmail(userProfile.email, expertProfile.full_name, booking.scheduled_at);
      }
    } catch {}
  }

  return NextResponse.json({ success: true, status: newStatus });
}
