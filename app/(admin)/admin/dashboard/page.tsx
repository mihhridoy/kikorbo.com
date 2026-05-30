'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { formatBDT } from '@/lib/utils/currency';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function AdminDashboardPage() {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [usersRes, pendingExpertsRes, openDisputesRes, revenueRes, pendingPayoutsRes] = await Promise.all([
      supabase.from('profiles').select('id, created_at, role'),
      supabase.from('experts').select('id').eq('verification_status', 'pending'),
      supabase.from('disputes').select('id').eq('status', 'open'),
      supabase.from('payments').select('amount_bdt').eq('status', 'success').gte('paid_at', monthAgo),
      supabase.from('payout_requests').select('amount_bdt').eq('status', 'pending'),
    ]);

    const users = usersRes.data || [];
    const revenue = (revenueRes.data || []).reduce((sum: number, p: any) => sum + p.amount_bdt, 0);
    const platformRevenue = revenue * 0.18;
    const pendingPayouts = (pendingPayoutsRes.data || []).reduce((sum: number, p: any) => sum + p.amount_bdt, 0);

    setStats({
      totalUsers: users.filter((u: any) => u.role === 'user').length,
      totalExperts: users.filter((u: any) => u.role === 'expert').length,
      pendingVerifications: pendingExpertsRes.data?.length || 0,
      openDisputes: openDisputesRes.data?.length || 0,
      monthRevenue: revenue,
      platformRevenue,
      pendingPayouts,
      newUsersThisWeek: users.filter((u: any) => new Date(u.created_at) > new Date(weekAgo)).length,
    });
    setLoading(false);
  }

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

  const statCards = [
    { label: t('admin.dashboard.totalUsers'), value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50', sub: `+${stats.newUsersThisWeek} ${t('admin.dashboard.thisWeekSuffix')}` },
    { label: t('admin.dashboard.totalExperts'), value: stats.totalExperts, icon: UserCheck, color: 'text-green-600 bg-green-50', sub: `${stats.pendingVerifications} ${t('admin.dashboard.pendingSuffix')}` },
    { label: t('admin.dashboard.monthRevenue'), value: formatBDT(stats.monthRevenue), icon: DollarSign, color: 'text-purple-600 bg-purple-50', sub: `${t('admin.dashboard.platformPrefix')} ${formatBDT(stats.platformRevenue)}` },
    { label: t('admin.dashboard.openDisputes'), value: stats.openDisputes, icon: AlertTriangle, color: 'text-red-600 bg-red-50', sub: `${formatBDT(stats.pendingPayouts)} ${t('admin.dashboard.payoutPendingSuffix')}` },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboard.title')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`rounded-xl p-2.5 w-fit ${color} mb-3`}><Icon className="h-5 w-5" /></div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.dashboard.quickActions')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: `${t('admin.dashboard.verifyExperts')} (${stats.pendingVerifications})`, href: '/admin/experts', urgent: stats.pendingVerifications > 0 },
              { label: `${t('admin.dashboard.approvePayouts')}`, href: '/admin/payouts' },
              { label: `${t('admin.dashboard.resolveDisputes')} (${stats.openDisputes})`, href: '/admin/disputes', urgent: stats.openDisputes > 0 },
              { label: t('admin.dashboard.viewAllBookings'), href: '/admin/bookings' },
            ].map(({ label, href, urgent }) => (
              <a key={href} href={href} className={`flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 ${urgent ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
                <span className={`text-sm font-medium ${urgent ? 'text-orange-700' : 'text-gray-700'}`}>{label}</span>
                <span className="text-gray-400">→</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.dashboard.platformHealth')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: t('admin.dashboard.expertVerification'), status: stats.pendingVerifications === 0 ? 'good' : 'warning', value: `${stats.pendingVerifications} ${t('admin.dashboard.pendingSuffix')}` },
              { label: t('admin.dashboard.openDisputes'), status: stats.openDisputes === 0 ? 'good' : stats.openDisputes > 5 ? 'danger' : 'warning', value: `${stats.openDisputes} ${t('admin.dashboard.openSuffix')}` },
              { label: t('admin.dashboard.payout'), status: 'warning', value: `${formatBDT(stats.pendingPayouts)} ${t('admin.dashboard.pendingSuffix')}` },
            ].map(({ label, status, value }) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{value}</span>
                  <div className={`h-2 w-2 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
