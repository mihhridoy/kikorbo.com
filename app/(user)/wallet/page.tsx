'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

const STATUS_MAP: Record<string, { label: string; variant: any }> = {
  pending: { label: 'অপেক্ষমাণ', variant: 'warning' },
  success: { label: 'সফল', variant: 'success' },
  failed: { label: 'ব্যর্থ', variant: 'destructive' },
  refunded: { label: 'ফেরত', variant: 'secondary' },
};

export default function WalletPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.id) return;
    fetchPayments();
  }, [profile?.id]);

  async function fetchPayments() {
    const { data } = await supabase
      .from('payments')
      .select('*, bookings(*, experts(*, profiles(full_name)))')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  }

  const totalSpent = payments.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount_bdt, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">পেমেন্ট ইতিহাস</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400">মোট ব্যয়</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatBDT(totalSpent)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400">মোট পরামর্শ</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{payments.filter((p) => p.status === 'success').length}টি</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="কোনো পেমেন্ট নেই" description="এখনো কোনো পেমেন্ট করেননি।" />
      ) : (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['তারিখ', 'বিশেষজ্ঞ', 'মূল্য', 'পেমেন্ট পদ্ধতি', 'স্ট্যাটাস'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('bn-BD')}</td>
                  <td className="px-4 py-3 text-gray-900">{p.bookings?.experts?.profiles?.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 font-semibold">{formatBDT(p.amount_bdt)}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.gateway}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_MAP[p.status]?.variant}>{STATUS_MAP[p.status]?.label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
