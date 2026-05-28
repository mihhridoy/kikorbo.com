import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
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

  const db = createServiceClient();

  if (status === 'success') {
    await db.from('payments').update({
      status: 'success',
      paid_at: new Date().toISOString(),
      gateway_transaction_id: url.searchParams.get('bank_tran_id') || 'DEMO',
      gateway_ref: url.searchParams.get('val_id') || 'DEMO',
    }).eq('id', paymentId);

    await db.from('bookings').update({ status: 'paid', payment_id: paymentId }).eq('id', bookingId);

    // Create consultation room (internal call — no auth needed)
    await fetch(`${appUrl}/api/consultation/create-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });

    return NextResponse.redirect(new URL(`/bookings/${bookingId}?paid=1`, appUrl));
  }

  await db.from('payments').update({ status: 'failed' }).eq('id', paymentId);
  return NextResponse.redirect(new URL(`/bookings/${bookingId}?payment=failed`, appUrl));
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const status = formData.get('status');
  const tran_id = formData.get('tran_id') as string;

  if (status === 'VALID' || status === 'VALIDATED') {
    const db = createServiceClient();
    await db.from('payments').update({ status: 'success', paid_at: new Date().toISOString() }).eq('id', tran_id);
  }

  return NextResponse.json({ status: 'OK' });
}
