import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateAgoraToken } from '@/lib/agora/token';
import { sendPaymentConfirmedEmail } from '@/lib/email/resend';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { bookingId } = await req.json();

  // Use service role for webhook/internal calls
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, experts!inner(user_id, profiles(email, full_name)), profiles(email, full_name)')
    .eq('id', bookingId)
    .eq('status', 'paid')
    .single();

  if (!booking) return NextResponse.json({ error: 'Booking not found or not paid' }, { status: 404 });

  // Check if room already exists
  const { data: existingRoom } = await supabase
    .from('consultation_rooms')
    .select('id')
    .eq('booking_id', bookingId)
    .single();

  if (existingRoom) return NextResponse.json({ roomId: existingRoom.id });

  const channelName = `room_${bookingId.replace(/-/g, '')}`;
  const userUid = Math.floor(Math.random() * 1000000);
  const expertUid = Math.floor(Math.random() * 1000000) + 1000000;

  let userToken = '';
  let expertToken = '';

  // Only generate real tokens in production with valid credentials
  if (process.env.AGORA_APP_CERTIFICATE && process.env.AGORA_APP_CERTIFICATE !== 'placeholder_agora_certificate') {
    userToken = generateAgoraToken(channelName, userUid, 'publisher');
    expertToken = generateAgoraToken(channelName, expertUid, 'publisher');
  }

  const { data: room, error } = await supabase
    .from('consultation_rooms')
    .insert({
      booking_id: bookingId,
      agora_channel: channelName,
      agora_token_user: userToken,
      agora_token_expert: expertToken,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('bookings').update({ consultation_room_id: room.id }).eq('id', bookingId);

  // Notify both parties
  const expertUserId = (booking as any).experts?.user_id;
  await Promise.all([
    supabase.from('notifications').insert({
      user_id: booking.user_id,
      title: 'সেশন কক্ষ প্রস্তুত',
      body: 'আপনার পেমেন্ট সফল। সেশন শুরুর সময়ে রুমে যোগ দিন।',
      type: 'room_ready',
      related_id: room.id,
    }),
    supabase.from('notifications').insert({
      user_id: expertUserId,
      title: 'সেশন নিশ্চিত হয়েছে',
      body: 'ব্যবহারকারী পেমেন্ট করেছেন। সেশন শুরুর সময়ে রুমে যোগ দিন।',
      type: 'room_ready',
      related_id: room.id,
    }),
  ]);

  return NextResponse.json({ roomId: room.id });
}
