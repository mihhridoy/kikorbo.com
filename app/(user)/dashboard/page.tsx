'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  confirmed: 'verified',
  paid: 'success',
  in_progress: 'verified',
  completed: 'success',
  cancelled: 'destructive',
  disputed: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'অপেক্ষমাণ',
  confirmed: 'নিশ্চিত',
  paid: 'পেমেন্ট হয়েছে',
  in_progress: 'চলমান',
  completed: 'সম্পন্ন',
  cancelled: 'বাতিল',
  disputed: 'বিতর্কিত',
};

export default function UserDashboardPage() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.id) return;
    fetchBookings();
  }, [profile?.id]);

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        experts(*, profiles(full_name, avatar_url)),
        packages(title, duration_minutes)
      `)
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(10);

    setBookings(data || []);
    setLoading(false);
  }

  const upcomingBookings = bookings.filter((b) => ['confirmed', 'paid', 'in_progress'].includes(b.status));
  const liveBooking = bookings.find((b) => b.status === 'in_progress' && b.consultation_room_id);

  const getTimeDisplay = (scheduledAt: string) => {
    const d = new Date(scheduledAt);
    return d.toLocaleString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          স্বাগতম, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">আজকের অবস্থা দেখুন</p>
      </div>

      {/* Live Session Banner */}
      {liveBooking && (
        <div className="mb-6 rounded-xl bg-green-600 text-white p-4 flex items-center justify-between">
          <div>
            <p className="font-bold">● সেশন চলমান আছে!</p>
            <p className="text-sm text-green-100">{(liveBooking as any).experts?.profiles?.full_name}-এর সাথে</p>
          </div>
          <Button className="bg-white text-green-700 hover:bg-green-50" asChild>
            <Link href={`/consultation/${liveBooking.consultation_room_id}`}>রুমে যোগ দিন</Link>
          </Button>
        </div>
      )}

      {/* Quick Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="বিশেষজ্ঞ খুঁজুন..." className="pl-9 bg-white" />
      </div>

      {/* Upcoming Bookings */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">আসন্ন সেশন</h2>
          <Link href="/bookings" className="text-primary-600 text-sm hover:underline">সব দেখুন →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-100 p-8 text-center shadow-sm">
            <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">কোনো আসন্ন সেশন নেই</p>
            <Button className="mt-3" asChild>
              <Link href="/experts">বিশেষজ্ঞ বুক করুন</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                  {(booking as any).experts?.profiles?.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{(booking as any).experts?.profiles?.full_name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeDisplay(booking.scheduled_at)}</span>
                    <span>•</span>
                    <span>{(booking as any).packages?.duration_minutes} মিনিট</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={STATUS_COLORS[booking.status] as any}>{STATUS_LABELS[booking.status]}</Badge>
                  {booking.status === 'confirmed' && (
                    <Button size="sm" asChild>
                      <Link href={`/bookings/${booking.id}`}>পেমেন্ট করুন</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'বিশেষজ্ঞ খুঁজুন', href: '/experts', icon: Search },
          { label: 'সব বুকিং', href: '/bookings', icon: Calendar },
          { label: 'বার্তা', href: '/messages', icon: ArrowRight },
          { label: 'ওয়ালেট', href: '/wallet', icon: ArrowRight },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl bg-white border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow hover:border-primary-200"
          >
            <Icon className="mx-auto h-5 w-5 text-primary-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
