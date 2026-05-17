import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookingId, rating, comment } = await req.json();

  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid review data' }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('expert_id, status, user_id')
    .eq('id', bookingId)
    .eq('user_id', session.user.id)
    .single();

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.status !== 'completed') return NextResponse.json({ error: 'Booking not completed' }, { status: 400 });

  const { error: reviewError } = await supabase.from('reviews').upsert({
    booking_id: bookingId,
    reviewer_id: session.user.id,
    expert_id: booking.expert_id,
    rating,
    comment: comment || null,
  });

  if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 });

  // Update expert avg_rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('expert_id', booking.expert_id)
    .eq('is_hidden', false);

  if (reviews) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase.from('experts').update({
      avg_rating: Math.round(avg * 100) / 100,
      total_reviews: reviews.length,
    }).eq('id', booking.expert_id);
  }

  return NextResponse.json({ success: true });
}
