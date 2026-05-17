'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatBDT } from '@/lib/utils/currency';
import { sendPayoutProcessedEmail } from '@/lib/email/resend';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'processing' | 'paid' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => { fetchPayouts(); }, [filter]);

  async function fetchPayouts() {
    setLoading(true);
    const { data } = await supabase
      .from('payout_requests')
      .select('*, experts(*, profiles(full_name, email))')
      .eq('status', filter)
      .order('requested_at', { ascending: false });
    setPayouts(data || []);
    setLoading(false);
  }

  async function handleAction(payoutId: string, action: 'paid' | 'rejected', expertEmail: string, amount: number) {
    await supabase.from('payout_requests').update({
      status: action,
      admin_note: notes[payoutId] || null,
      processed_at: new Date().toISOString(),
    }).eq('id', payoutId);

    if (action === 'paid') {
      try { await sendPayoutProcessedEmail(expertEmail, amount); } catch {}
    }

    await fetchPayouts();
  }

  const STATUS_VARIANTS: Record<string, any> = {
    pending: 'warning', processing: 'verified', paid: 'success', rejected: 'destructive'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">পেআউট অনুরোধ</h1>
        <div className="flex gap-2">
          {(['pending', 'processing', 'paid', 'rejected'] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
              {{pending: 'অপেক্ষমাণ', processing: 'প্রক্রিয়াধীন', paid: 'পরিশোধিত', rejected: 'প্রত্যাখ্যাত'}[f]}
            </Button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">লোড হচ্ছে...</div> : (
        <div className="space-y-4">
          {payouts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">কোনো রেকর্ড নেই</div>
          ) : (
            payouts.map((payout) => (
              <div key={payout.id} className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{payout.experts?.profiles?.full_name}</h3>
                      <Badge variant={STATUS_VARIANTS[payout.status]}>
                        {payout.status}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatBDT(payout.amount_bdt)}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {payout.method === 'bkash' ? 'bKash' : 'Bank'}: {payout.account_name} — {payout.account_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      অনুরোধ: {new Date(payout.requested_at).toLocaleDateString('bn-BD')} • {payout.experts?.profiles?.email}
                    </p>
                    {payout.admin_note && <p className="text-xs text-gray-500 mt-1">নোট: {payout.admin_note}</p>}
                  </div>

                  {filter === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="অ্যাডমিন নোট (ঐচ্ছিক)"
                        className="h-8 rounded-lg border border-gray-200 px-2 text-xs focus:outline-none"
                        value={notes[payout.id] || ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [payout.id]: e.target.value }))}
                      />
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs"
                        onClick={() => handleAction(payout.id, 'paid', payout.experts?.profiles?.email, payout.amount_bdt)}>
                        ✓ পরিশোধ করুন
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 text-xs"
                        onClick={() => handleAction(payout.id, 'rejected', payout.experts?.profiles?.email, payout.amount_bdt)}>
                        ✗ প্রত্যাখ্যান
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
