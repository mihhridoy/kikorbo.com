'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

const STATUS_LABELS: Record<string, string> = {
  pending: 'অপেক্ষমাণ',
  confirmed: 'নিশ্চিত',
  paid: 'পেমেন্ট হয়েছে',
  in_progress: 'চলমান',
  completed: 'সম্পন্ন',
  cancelled: 'বাতিল',
  disputed: 'বিতর্কিত',
};

const STATUS_VARIANTS: Record<string, string> = {
  pending: 'warning',
  confirmed: 'verified',
  paid: 'success',
  in_progress: 'online',
  completed: 'success',
  cancelled: 'destructive',
  disputed: 'destructive',
};

export default function BookingsPage() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.id) return;
    fetchBookings();
  }, [profile?.id]);

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*, experts(*, profiles(full_name, avatar_url, username)), packages(title, duration_minutes), consultation_rooms(id)')
      .eq('user_id', profile!.id)
      .order('scheduled_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }

  const upcoming = bookings.filter((b) => ['pending', 'confirmed', 'paid', 'in_progress'].includes(b.status));
  const past = bookings.filter((b) => ['completed', 'cancelled', 'disputed'].includes(b.status));
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">আমার বুকিং</h1>

      <div className="flex gap-2 mb-6">
        {(['upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {tab === 'upcoming' ? `আসন্ন (${upcoming.length})` : `অতীত (${past.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="কোনো বুকিং নেই"
          description={activeTab === 'upcoming' ? 'এখনো কোনো আসন্ন সেশন বুক করেননি।' : 'আপনার কোনো পুরনো সেশন নেই।'}
          actionLabel="বিশেষজ্ঞ খুঁজুন"
          onAction={() => window.location.href = '/experts'}
        />
      ) : (
        <div className="space-y-4">
          {displayed.map((booking) => (
            <div key={booking.id} className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={booking.experts?.profiles?.avatar_url} />
                  <AvatarFallback>{booking.experts?.profiles?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{booking.experts?.profiles?.full_name}</h3>
                      <p className="text-sm text-gray-500">{booking.packages?.title} • {booking.packages?.duration_minutes} মিনিট • {booking.session_type}</p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[booking.status] as any}>{STATUS_LABELS[booking.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(booking.scheduled_at).toLocaleString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span className="font-semibold text-gray-600">{formatBDT(booking.price_bdt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 justify-end">
                {booking.status === 'confirmed' && (
                  <Button size="sm" asChild>
                    <Link href={`/bookings/${booking.id}`}>পেমেন্ট করুন</Link>
                  </Button>
                )}
                {['paid', 'in_progress'].includes(booking.status) && booking.consultation_rooms?.id && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                    <Link href={`/consultation/${booking.consultation_rooms.id}`}>রুমে যোগ দিন</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/bookings/${booking.id}`}>বিস্তারিত</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
