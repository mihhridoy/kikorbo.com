'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, MessageSquare, Phone, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { calculateCommission } from '@/lib/utils/commission';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const SESSION_ICONS = { chat: MessageSquare, voice: Phone, video: Video };

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const supabase = createClient();
  const justBooked = searchParams.get('success') === '1';

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  async function fetchBooking() {
    const { data } = await supabase
      .from('bookings')
      .select('*, experts(*, profiles(full_name, avatar_url, username)), packages(title, description, duration_minutes), consultation_rooms(id, status)')
      .eq('id', params.id)
      .single();
    setBooking(data);
    setLoading(false);
  }

  const handlePayment = async (gateway: 'sslcommerz' | 'bkash') => {
    setPaymentLoading(gateway);
    const res = await fetch(`/api/payments/${gateway}/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: params.id }),
    });
    const data = await res.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      setPaymentLoading(null);
    }
  };

  if (loading) return <div className="p-6"><Skeleton className="h-96 rounded-xl" /></div>;
  if (!booking) return <div className="p-6 text-gray-500">{t('user.bookingDetail.notFound')}</div>;

  const SessionIcon = SESSION_ICONS[booking.session_type as keyof typeof SESSION_ICONS] || Video;
  const expertProfile = booking.experts?.profiles;
  const expertUsername = expertProfile?.username || booking.expert_id;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/bookings" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> {t('user.bookingDetail.allBookings')}
      </Link>

      {justBooked && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">{t('user.bookingDetail.requestSent')}</p>
            <p className="text-sm text-green-600">{t('user.bookingDetail.expertWillRespond')}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={expertProfile?.avatar_url} />
                <AvatarFallback className="text-lg">{expertProfile?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{expertProfile?.full_name}</h1>
                <p className="text-gray-500 text-sm">{booking.experts?.category}</p>
                <Link href={`/experts/${expertUsername}`} className="text-xs text-primary-600 hover:underline mt-0.5 block">{t('user.bookingDetail.viewProfile')}</Link>
              </div>
            </div>
            <Badge className="text-sm px-3 py-1">{t(`user.status.${booking.status}`)}</Badge>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">{t('user.bookingDetail.package')}</p>
              <p className="font-semibold text-gray-900 mt-0.5">{booking.packages?.title}</p>
              <p className="text-xs text-gray-500">{booking.packages?.duration_minutes} {t('user.bookingDetail.minutes')}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">{t('user.bookingDetail.sessionType')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <SessionIcon className="h-4 w-4 text-primary-600" />
                <p className="font-semibold text-gray-900 capitalize">{booking.session_type}</p>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">{t('user.bookingDetail.dateTime')}</p>
              <p className="font-semibold text-gray-900 mt-0.5 text-sm">
                {new Date(booking.scheduled_at).toLocaleString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">{t('user.bookingDetail.price')}</p>
              <p className="font-bold text-gray-900 text-lg mt-0.5">{formatBDT(booking.price_bdt)}</p>
            </div>
          </div>

          {booking.notes && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs text-gray-400 mb-1">{t('user.bookingDetail.yourNote')}</p>
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          {booking.status === 'confirmed' && (
            <>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">{t('user.bookingDetail.confirmedNote')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  disabled={paymentLoading !== null}
                  onClick={() => handlePayment('bkash')}
                >
                  {paymentLoading === 'bkash' ? t('user.bookingDetail.redirecting') : t('user.bookingDetail.payBkash')}
                </Button>
                <Button
                  variant="outline"
                  disabled={paymentLoading !== null}
                  onClick={() => handlePayment('sslcommerz')}
                >
                  {paymentLoading === 'sslcommerz' ? t('user.bookingDetail.redirecting') : t('user.bookingDetail.payCard')}
                </Button>
              </div>
            </>
          )}

          {['paid', 'in_progress'].includes(booking.status) && booking.consultation_rooms?.id && (
            <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
              <Link href={`/consultation/${booking.consultation_rooms.id}`}>{t('user.bookingDetail.joinSessionRoom')}</Link>
            </Button>
          )}

          {booking.status === 'pending' && (
            <div className="text-center text-sm text-gray-500">
              {t('user.bookingDetail.waitingExpert')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
