'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { PLATFORM } from '@/lib/constants/platform';

export default function ExpertEarningsPage() {
  const { profile } = useAuth();
  const [expert, setExpert] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    method: 'bkash' as 'bkash' | 'bank',
    account_number: '',
    account_name: '',
  });

  useEffect(() => {
    if (!profile?.id) return;
    fetchData();
  }, [profile?.id]);

  async function fetchData() {
    const { data: expertData } = await supabase.from('experts').select('*').eq('user_id', profile!.id).single();
    if (!expertData) { setLoading(false); return; }
    setExpert(expertData);

    const [walletRes, txRes, payoutRes] = await Promise.all([
      supabase.from('expert_wallets').select('*').eq('expert_id', expertData.id).single(),
      supabase.from('bookings').select('*, profiles(full_name)').eq('expert_id', expertData.id).eq('status', 'completed').order('updated_at', { ascending: false }).limit(20),
      supabase.from('payout_requests').select('*').eq('expert_id', expertData.id).order('requested_at', { ascending: false }),
    ]);

    setWallet(walletRes.data);
    setTransactions(txRes.data || []);
    setPayoutRequests(payoutRes.data || []);
    setLoading(false);
  }

  const handlePayout = async () => {
    const amount = parseFloat(payoutForm.amount);
    if (!amount || amount > (wallet?.available_balance || 0)) return;

    setSubmitting(true);
    await supabase.from('payout_requests').insert({
      expert_id: expert.id,
      amount_bdt: amount,
      method: payoutForm.method,
      account_number: payoutForm.account_number,
      account_name: payoutForm.account_name,
    });

    await supabase.from('expert_wallets').update({
      available_balance: (wallet.available_balance || 0) - amount,
    }).eq('expert_id', expert.id);

    await fetchData();
    setShowPayoutForm(false);
    setSubmitting(false);
  };

  const STATUS_MAP: Record<string, { label: string; variant: any }> = {
    pending: { label: 'অপেক্ষমাণ', variant: 'warning' },
    processing: { label: 'প্রক্রিয়াধীন', variant: 'verified' },
    paid: { label: 'পরিশোধিত', variant: 'success' },
    rejected: { label: 'প্রত্যাখ্যাত', variant: 'destructive' },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">আয় ও পেআউট</h1>

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'উপলব্ধ ব্যালেন্স', value: formatBDT(wallet?.available_balance || 0), color: 'text-green-600 bg-green-50', highlight: true },
          { label: 'মুলতবি ব্যালেন্স', value: formatBDT(wallet?.pending_balance || 0), color: 'text-yellow-600 bg-yellow-50', tooltip: `${PLATFORM.sessionHoldDays} দিন হোল্ড` },
          { label: 'মোট আয়', value: formatBDT(wallet?.total_earned || 0), color: 'text-gray-700 bg-gray-50' },
          { label: 'মোট উত্তোলন', value: formatBDT(wallet?.total_withdrawn || 0), color: 'text-gray-500 bg-gray-50' },
        ].map(({ label, value, color, highlight, tooltip }) => (
          <Card key={label} className={highlight ? 'border-green-200' : ''}>
            <CardContent className="p-4 text-center">
              <p className={`text-xl font-bold ${color.split(' ')[0]}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
              {tooltip && <p className="text-xs text-gray-400">({tooltip})</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payout Request */}
      {!showPayoutForm ? (
        <Button onClick={() => setShowPayoutForm(true)} disabled={!wallet?.available_balance} className="mb-6">
          <DollarSign className="h-4 w-4 mr-2" /> পেআউট অনুরোধ করুন
        </Button>
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">পেআউট অনুরোধ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>পরিমাণ (সর্বোচ্চ {formatBDT(wallet?.available_balance || 0)})</Label>
              <Input className="mt-1" type="number" placeholder="পরিমাণ লিখুন" max={wallet?.available_balance} value={payoutForm.amount} onChange={(e) => setPayoutForm((p) => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              <Label>পেআউট পদ্ধতি</Label>
              <div className="flex gap-2 mt-1">
                {(['bkash', 'bank'] as const).map((m) => (
                  <button key={m} onClick={() => setPayoutForm((p) => ({ ...p, method: m }))}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium ${payoutForm.method === m ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200'}`}>
                    {m === 'bkash' ? 'bKash' : 'ব্যাংক ট্রান্সফার'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{payoutForm.method === 'bkash' ? 'bKash নম্বর' : 'অ্যাকাউন্ট নম্বর'}</Label>
              <Input className="mt-1" placeholder={payoutForm.method === 'bkash' ? '01XXXXXXXXX' : 'Account number'} value={payoutForm.account_number} onChange={(e) => setPayoutForm((p) => ({ ...p, account_number: e.target.value }))} />
            </div>
            <div>
              <Label>অ্যাকাউন্টধারীর নাম</Label>
              <Input className="mt-1" placeholder="আপনার নাম" value={payoutForm.account_name} onChange={(e) => setPayoutForm((p) => ({ ...p, account_name: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowPayoutForm(false)}>বাতিল</Button>
            <Button className="flex-1" disabled={!payoutForm.amount || !payoutForm.account_number || !payoutForm.account_name || submitting} onClick={handlePayout}>
              {submitting ? 'জমা দেওয়া হচ্ছে...' : 'জমা দিন'}
            </Button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">লেনদেনের ইতিহাস</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['তারিখ', 'ব্যবহারকারী', 'মোট মূল্য', 'প্ল্যাটফর্ম ফি', 'আপনার আয়', 'স্ট্যাটাস'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">কোনো লেনদেন নেই</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{new Date(tx.updated_at).toLocaleDateString('bn-BD')}</td>
                    <td className="px-4 py-3 text-gray-900">{tx.profiles?.full_name}</td>
                    <td className="px-4 py-3 font-medium">{formatBDT(tx.price_bdt)}</td>
                    <td className="px-4 py-3 text-red-500">-{formatBDT(tx.platform_fee)}</td>
                    <td className="px-4 py-3 font-bold text-green-600">+{formatBDT(tx.expert_earnings)}</td>
                    <td className="px-4 py-3"><Badge variant="success">সম্পন্ন</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Requests */}
      {payoutRequests.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">পেআউট অনুরোধসমূহ</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {payoutRequests.map((req) => (
              <div key={req.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{formatBDT(req.amount_bdt)}</p>
                  <p className="text-xs text-gray-500">{req.method === 'bkash' ? 'bKash' : 'Bank'}: {req.account_number} • {new Date(req.requested_at).toLocaleDateString('bn-BD')}</p>
                  {req.admin_note && <p className="text-xs text-gray-400 mt-0.5">{req.admin_note}</p>}
                </div>
                <Badge variant={STATUS_MAP[req.status]?.variant}>{STATUS_MAP[req.status]?.label}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
