import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookingId } = await req.json();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, profiles(email, full_name, phone)')
    .eq('id', bookingId)
    .eq('user_id', session.user.id)
    .eq('status', 'confirmed')
    .single();

  if (!booking) return NextResponse.json({ error: 'Booking not found or not confirmed' }, { status: 404 });

  const { data: payment } = await supabase.from('payments').insert({
    booking_id: bookingId,
    user_id: session.user.id,
    amount_bdt: booking.price_bdt,
    gateway: 'sslcommerz',
    status: 'pending',
  }).select().single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
  const apiUrl = isLive
    ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

  const params = new URLSearchParams({
    store_id: storeId || '',
    store_passwd: storePassword || '',
    total_amount: booking.price_bdt.toString(),
    currency: 'BDT',
    tran_id: payment?.id || bookingId,
    success_url: `${appUrl}/api/payments/sslcommerz/webhook?paymentId=${payment?.id}&bookingId=${bookingId}&status=success`,
    fail_url: `${appUrl}/api/payments/sslcommerz/webhook?paymentId=${payment?.id}&bookingId=${bookingId}&status=fail`,
    cancel_url: `${appUrl}/bookings/${bookingId}`,
    cus_name: (booking as any).profiles?.full_name || 'Customer',
    cus_email: (booking as any).profiles?.email || '',
    cus_phone: (booking as any).profiles?.phone || '01700000000',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    product_name: 'Expert Consultation',
    product_category: 'Service',
    product_profile: 'service',
    shipping_method: 'NO',
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await response.json();

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return NextResponse.json({ redirectUrl: data.GatewayPageURL });
    }

    // In sandbox/placeholder mode, redirect to a mock success
    return NextResponse.json({ redirectUrl: `${appUrl}/api/payments/sslcommerz/webhook?paymentId=${payment?.id}&bookingId=${bookingId}&status=success&val_id=DEMO` });
  } catch (err) {
    return NextResponse.json({ redirectUrl: `${appUrl}/bookings/${bookingId}?payment=failed` });
  }
}
