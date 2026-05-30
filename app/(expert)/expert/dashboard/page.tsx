'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, DollarSign, Video, Users, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ExpertDashboardPage() {
  const { profile } = useAuth();
  const { t, lang } = useLanguage();
  const [expert, setExpert] = useState<any>(null);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [stats, setStats] = useState({ totalSessions: 0, thisMonthEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.id) return;
    fetchDashboardData();
  }, [profile?.id]);

  async function fetchDashboardData() {
    const { data: expertData } = await supabase.from('experts').select('*').eq('user_id', profile!.id).single();
    if (!expertData) { setLoading(false); return; }
    setExpert(expertData);

    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [pendingRes, todayRes, walletRes, monthEarningsRes] = await Promise.all([
      supabase.from('bookings').select('*, profiles(full_name, avatar_url), packages(title, duration_minutes)').eq('expert_id', expertData.id).eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*, profiles(full_name), packages(title, duration_minutes), consultation_rooms(id)').eq('expert_id', expertData.id).in('status', ['confirmed', 'paid', 'in_progress']).gte('scheduled_at', today).lt('scheduled_at', today + 'T23:59:59'),
      supabase.from('expert_wallets').select('*').eq('expert_id', expertData.id).single(),
      supabase.from('bookings').select('expert_earnings').eq('expert_id', expertData.id).eq('status', 'completed').gte('created_at', monthStart),
    ]);

    setPendingBookings(pendingRes.data || []);
    setTodayBookings(todayRes.data || []);
    setWallet(walletRes.data);
    const monthEarnings = (monthEarningsRes.data || []).reduce((sum: number, b: any) => sum + (b.expert_earnings || 0), 0);
    setStats({ totalSessions: expertData.total_sessions, thisMonthEarnings: monthEarnings });
    setLoading(false);
  }

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    setActionLoading(bookingId);
    const res = await fetch('/api/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, action }),
    });
    if (res.ok) await fetchDashboardData();
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const canEnterRoom = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffMin = (scheduled.getTime() - now.getTime()) / 60000;
    return diffMin <= 15;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('expert.dashboard.title')}</h1>
          {expert?.verification_status === 'pending' && (
            <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-700">
              {t('expert.dashboard.verificationPending')}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/expert/profile">{t('expert.dashboard.editProfile')}</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('expert.dashboard.stat.pendingRequests'), value: pendingBookings.length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: t('expert.dashboard.stat.todaySessions'), value: todayBookings.length, icon: Video, color: 'text-blue-600 bg-blue-50' },
          { label: t('expert.dashboard.stat.thisMonthEarnings'), value: formatBDT(stats.thisMonthEarnings), icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: t('expert.dashboard.stat.totalSessions'), value: stats.totalSessions, icon: Users, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${color}`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              {t('expert.dashboard.pendingRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBookings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">{t('expert.dashboard.noPendingRequests')}</p>
            ) : (
              pendingBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{booking.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.packages?.title} • {booking.packages?.duration_minutes} {t('expert.dashboard.minutes')} • {formatBDT(booking.price_bdt)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(booking.scheduled_at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        disabled={actionLoading === booking.id}
                        onClick={() => handleBookingAction(booking.id, 'reject')}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> {t('expert.dashboard.no')}
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        disabled={actionLoading === booking.id}
                        onClick={() => handleBookingAction(booking.id, 'accept')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" /> {t('expert.dashboard.yes')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-600" />
              {t('expert.dashboard.todaySessions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayBookings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">{t('expert.dashboard.noTodaySessions')}</p>
            ) : (
              todayBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-gray-100 p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{booking.profiles?.full_name}</p>
                    <p className="text-xs text-gray-500">{new Date(booking.scheduled_at).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {booking.consultation_rooms?.id && canEnterRoom(booking.scheduled_at) ? (
                    <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                      <Link href={`/consultation/${booking.consultation_rooms.id}`}>{t('expert.dashboard.joinRoom')}</Link>
                    </Button>
                  ) : (
                    <Badge variant="secondary">{t('expert.dashboard.wait')}</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Wallet Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              {t('expert.dashboard.earningsSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t('expert.dashboard.wallet.available'), value: formatBDT(wallet?.available_balance || 0), color: 'text-green-600' },
                { label: t('expert.dashboard.wallet.pending'), value: formatBDT(wallet?.pending_balance || 0), color: 'text-yellow-600' },
                { label: t('expert.dashboard.wallet.totalEarned'), value: formatBDT(wallet?.total_earned || 0), color: 'text-gray-900' },
                { label: t('expert.dashboard.wallet.totalWithdrawn'), value: formatBDT(wallet?.total_withdrawn || 0), color: 'text-gray-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center rounded-xl bg-gray-50 p-4">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button asChild className="flex-1">
                <Link href="/expert/earnings">{t('expert.dashboard.payout')}</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/expert/earnings">{t('expert.dashboard.viewTransactions')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
