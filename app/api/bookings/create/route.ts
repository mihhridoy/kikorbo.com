import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { calculateCommission } from '@/lib/utils/commission';
import { sendBookingRequestEmail } from '@/lib/email/resend';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { expertId, packageId, sessionType, scheduledAt, notes, priceBDT, durationMinutes } = body;

  if (!expertId || !packageId || !sessionType || !scheduledAt || !priceBDT || !durationMinutes) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = createServiceClient();

  // Validate expert is approved
  const { data: expert } = await db
    .from('experts')
    .select('verification_status, user_id')
    .eq('id', expertId)
    .single();

  if (!expert || expert.verification_status !== 'approved') {
    return NextResponse.json({ error: 'Expert not available' }, { status: 400 });
  }

  // Validate package is active and belongs to expert
  const { data: pkg } = await db
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .eq('expert_id', expertId)
    .eq('is_active', true)
    .single();

  if (!pkg) {
    return NextResponse.json({ error: 'Package not found or inactive' }, { status: 400 });
  }

  // Calculate commission server-side (never trust client)
  const { platformFee, expertEarnings } = calculateCommission(pkg.price_bdt);

  const { data: booking, error } = await db
    .from('bookings')
    .insert({
      user_id: session.user.id,
      expert_id: expertId,
      package_id: packageId,
      scheduled_at: scheduledAt,
      duration_minutes: pkg.duration_minutes,
      price_bdt: pkg.price_bdt,
      platform_fee: platformFee,
      expert_earnings: expertEarnings,
      session_type: sessionType,
      status: 'pending',
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send notification to expert
  await db.from('notifications').insert({
    user_id: expert.user_id,
    title: 'নতুন বুকিং রিকোয়েস্ট',
    body: `একটি নতুন বুকিং রিকোয়েস্ট পেয়েছেন। ২ ঘণ্টার মধ্যে সাড়া দিন।`,
    type: 'booking_request',
    related_id: booking.id,
  });

  // Send email (non-blocking)
  try {
    const { data: expertProfile } = await db.from('profiles').select('email, full_name').eq('id', expert.user_id).single();
    const { data: userProfile } = await db.from('profiles').select('full_name').eq('id', session.user.id).single();
    if (expertProfile?.email && userProfile?.full_name) {
      await sendBookingRequestEmail(expertProfile.email, userProfile.full_name, scheduledAt);
    }
  } catch {}

  return NextResponse.json({ bookingId: booking.id, message: 'Booking request sent to expert' });
}
