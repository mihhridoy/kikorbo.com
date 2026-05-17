import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const paymentId = url.searchParams.get('paymentId');
  const bookingId = url.searchParams.get('bookingId');
  const status = url.searchParams.get('status');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!paymentId || !bookingId) {
    return NextResponse.redirect(new URL('/dashboard', appUrl));
  }

  const supabase = createRouteHandlerClient({ cookies });

  if (status === 'success') {
    await supabase.from('payments').update({
      status: 'success',
      paid_at: new Date().toISOString(),
      gateway_transaction_id: url.searchParams.get('bank_tran_id') || 'DEMO',
      gateway_ref: url.searchParams.get('val_id') || 'DEMO',
    }).eq('id', paymentId);

    await supabase.from('bookings').update({ status: 'paid', payment_id: paymentId }).eq('id', bookingId);

    // Create consultation room
    const roomRes = await fetch(`${appUrl}/api/consultation/create-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });

    return NextResponse.redirect(new URL(`/bookings/${bookingId}?paid=1`, appUrl));
  }

  await supabase.from('payments').update({ status: 'failed' }).eq('id', paymentId);
  return NextResponse.redirect(new URL(`/bookings/${bookingId}?payment=failed`, appUrl));
}

export async function POST(req: NextRequest) {
  // IPN notification from SSLCommerz
  const formData = await req.formData();
  const status = formData.get('status');
  const tran_id = formData.get('tran_id') as string;

  if (status === 'VALID' || status === 'VALIDATED') {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.from('payments').update({ status: 'success', paid_at: new Date().toISOString() }).eq('id', tran_id);
  }

  return NextResponse.json({ status: 'OK' });
}
