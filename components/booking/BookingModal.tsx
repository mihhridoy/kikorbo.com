'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, MessageSquare, Phone, Video, Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatBDT } from '@/lib/utils/currency';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateCommission } from '@/lib/utils/commission';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { Package } from '@/lib/supabase/types';

interface BookingModalProps {
  expertId: string;
  expertName: string;
  selectedPackage: Package;
  onClose: () => void;
}

type Step = 'session_type' | 'schedule' | 'notes' | 'review';

export function BookingModal({ expertId, expertName, selectedPackage, onClose }: BookingModalProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const SESSION_TYPES = [
    { value: 'video', labelKey: 'booking.sessionType.video.label', icon: Video, descKey: 'booking.sessionType.video.desc' },
    { value: 'voice', labelKey: 'booking.sessionType.voice.label', icon: Phone, descKey: 'booking.sessionType.voice.desc' },
    { value: 'chat', labelKey: 'booking.sessionType.chat.label', icon: MessageSquare, descKey: 'booking.sessionType.chat.desc' },
  ];

  const [step, setStep] = useState<Step>('session_type');
  const [sessionType, setSessionType] = useState<'chat' | 'voice' | 'video'>('video');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { platformFee, expertEarnings } = calculateCommission(selectedPackage.price_bdt);

  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00'];

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setError(t('booking.error.pickDateTime'));
      return;
    }

    // Demo users skip real booking API and go straight to demo consultation room
    if (user.id?.startsWith('demo-')) {
      onClose();
      router.push(
        `/consultation/demo?expert=${encodeURIComponent(expertName)}&sessionType=${sessionType}&duration=${selectedPackage.duration_minutes}&package=${encodeURIComponent(selectedPackage.title)}`
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId,
          packageId: selectedPackage.id,
          sessionType,
          scheduledAt,
          notes,
          priceBDT: selectedPackage.price_bdt,
          durationMinutes: selectedPackage.duration_minutes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('booking.error.createFailed'));

      router.push(`/bookings/${data.bookingId}?success=1`);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableSessionTypes = SESSION_TYPES.filter((s) => selectedPackage.session_type.includes(s.value));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expertName} — {selectedPackage.title}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex gap-2 mb-4">
          {(['session_type', 'schedule', 'notes', 'review'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                step === s ? 'bg-primary-600' :
                (['session_type', 'schedule', 'notes', 'review'] as Step[]).indexOf(step) > i ? 'bg-primary-200' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Session Type */}
        {step === 'session_type' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">{t('booking.step.chooseSessionType')}</p>
            {availableSessionTypes.map(({ value, labelKey, icon: Icon, descKey }) => (
              <button
                key={value}
                onClick={() => setSessionType(value as 'chat' | 'voice' | 'video')}
                className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  sessionType === value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-5 w-5 ${sessionType === value ? 'text-primary-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">{t(labelKey)}</p>
                  <p className="text-xs text-gray-500">{t(descKey)}</p>
                </div>
              </button>
            ))}
            <Button className="w-full mt-2" onClick={() => setStep('schedule')}>
              {t('booking.next')}
            </Button>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 'schedule' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">{t('booking.chooseDate')}</label>
              <input
                type="date"
                min={getMinDate()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">{t('booking.chooseTime')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-lg border py-2 text-sm font-medium transition-all ${
                        selectedTime === time ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('session_type')}>{t('booking.back')}</Button>
              <Button className="flex-1" onClick={() => setStep('notes')} disabled={!selectedDate || !selectedTime}>
                {t('booking.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Notes */}
        {step === 'notes' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{t('booking.notes.warning')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">{t('booking.notes.label')}</label>
              <Textarea
                placeholder={t('booking.notes.placeholder')}
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/500</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('schedule')}>{t('booking.back')}</Button>
              <Button className="flex-1" onClick={() => setStep('review')}>{t('booking.next')}</Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Pay */}
        {step === 'review' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('booking.review.expert')}</span>
                <span className="font-medium">{expertName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('booking.review.package')}</span>
                <span className="font-medium">{selectedPackage.title} ({selectedPackage.duration_minutes} {t('booking.review.minutes')})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('booking.review.sessionType')}</span>
                <Badge variant="secondary">{sessionType}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('booking.review.dateTime')}</span>
                <span className="font-medium">{selectedDate} {selectedTime}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>{t('booking.review.total')}</span>
                <span>{formatBDT(selectedPackage.price_bdt)}</span>
              </div>
              <p className="text-xs text-gray-400">{t('booking.review.commissionIncluded')}</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={loading}>
                {loading ? t('booking.review.processing') : `${t('booking.review.sendRequest')} — ${formatBDT(selectedPackage.price_bdt)}`}
              </Button>
              <p className="text-xs text-center text-gray-400">{t('booking.review.payAfterAccept')}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStep('notes')}>{t('booking.back')}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
