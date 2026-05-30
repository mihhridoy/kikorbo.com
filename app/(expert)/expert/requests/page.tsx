'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { EmptyState } from '@/components/shared/EmptyState';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ExpertRequestsPage() {
  const { profile } = useAuth();
  const { t, lang } = useLanguage();
  const [expert, setExpert] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.id) return;
    fetchData();
  }, [profile?.id, filter]);

  async function fetchData() {
    setLoading(true);
    const { data: expertData } = await supabase.from('experts').select('*').eq('user_id', profile!.id).single();
    if (!expertData) { setLoading(false); return; }
    setExpert(expertData);

    const { data } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, avatar_url, email), packages(title, duration_minutes)')
      .eq('expert_id', expertData.id)
      .eq('status', filter)
      .order('created_at', { ascending: false });

    setBookings(data || []);
    setLoading(false);
  }

  async function handleAction(bookingId: string, action: 'accept' | 'reject') {
    setActionLoading(bookingId);
    await fetch('/api/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, action }),
    });
    await fetchData();
    setActionLoading(null);
  }

  const filterLabels: Record<'pending' | 'confirmed' | 'cancelled', string> = {
    pending: t('expert.requests.filter.pending'),
    confirmed: t('expert.requests.filter.confirmed'),
    cancelled: t('expert.requests.filter.cancelled'),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('expert.requests.title')}</h1>

      <div className="flex gap-2 mb-6">
        {(['pending', 'confirmed', 'cancelled'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
            {filterLabels[f]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('expert.requests.loading')}</div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Clock} title={t('expert.requests.emptyTitle')} description={t('expert.requests.emptyDesc')} />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={booking.profiles?.avatar_url} />
                  <AvatarFallback>{booking.profiles?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{booking.profiles?.full_name}</h3>
                  <p className="text-sm text-gray-500">{booking.profiles?.email}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span>📦 {booking.packages?.title} ({booking.packages?.duration_minutes} {t('expert.requests.minutes')})</span>
                    <span>💰 {formatBDT(booking.price_bdt)}</span>
                    <span>🕐 {new Date(booking.scheduled_at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="uppercase">📱 {booking.session_type}</span>
                  </div>
                  {booking.notes && (
                    <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">
                      <span className="font-semibold text-gray-700">{t('expert.requests.note')}</span>{booking.notes}
                    </div>
                  )}
                </div>
                {filter === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" disabled={actionLoading === booking.id} onClick={() => handleAction(booking.id, 'reject')}>
                      <XCircle className="h-4 w-4 mr-1" /> {t('expert.requests.no')}
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={actionLoading === booking.id} onClick={() => handleAction(booking.id, 'accept')}>
                      <CheckCircle className="h-4 w-4 mr-1" /> {t('expert.requests.yes')}
                    </Button>
                  </div>
                )}
                {filter !== 'pending' && (
                  <Badge variant={filter === 'confirmed' ? 'success' : 'destructive'}>
                    {filter === 'confirmed' ? t('expert.requests.confirmed') : t('expert.requests.cancelled')}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
