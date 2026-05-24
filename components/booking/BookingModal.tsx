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
import type { Package } from '@/lib/supabase/types';

interface BookingModalProps {
  expertId: string;
  expertName: string;
  selectedPackage: Package;
  onClose: () => void;
}

type Step = 'session_type' | 'schedule' | 'notes' | 'review';

const SESSION_TYPES = [
  { value: 'video', label: 'ভিডিও কল', icon: Video, desc: 'ফেস-টু-ফেস ভিডিও পরামর্শ' },
  { value: 'voice', label: 'ভয়েস কল', icon: Phone, desc: 'অডিও কলে পরামর্শ' },
  { value: 'chat', label: 'চ্যাট', icon: MessageSquare, desc: 'টেক্সট চ্যাটে পরামর্শ' },
];

export function BookingModal({ expertId, expertName, selectedPackage, onClose }: BookingModalProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

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
      setError('তারিখ ও সময় বেছে নিন');
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
      if (!res.ok) throw new Error(data.error || 'বুকিং তৈরি করা যায়নি');

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
            <p className="text-sm font-medium text-gray-700">সেশনের ধরন বেছে নিন</p>
            {availableSessionTypes.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                onClick={() => setSessionType(value as 'chat' | 'voice' | 'video')}
                className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  sessionType === value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-5 w-5 ${sessionType === value ? 'text-primary-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </button>
            ))}
            <Button className="w-full mt-2" onClick={() => setStep('schedule')}>
              পরবর্তী
            </Button>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 'schedule' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">তারিখ বেছে নিন</label>
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
                <label className="text-sm font-medium text-gray-700 block mb-2">সময় বেছে নিন</label>
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
              <Button variant="outline" className="flex-1" onClick={() => setStep('session_type')}>পেছনে</Button>
              <Button className="flex-1" onClick={() => setStep('notes')} disabled={!selectedDate || !selectedTime}>
                পরবর্তী
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Notes */}
        {step === 'notes' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">ব্যক্তিগত যোগাযোগের তথ্য (ফোন নম্বর, সোশ্যাল মিডিয়া) শেয়ার করবেন না।</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">বিশেষজ্ঞকে কী জানাতে চান? (ঐচ্ছিক)</label>
              <Textarea
                placeholder="আপনার সমস্যা বা প্রশ্ন সংক্ষেপে লিখুন। পেমেন্টের পর বিশেষজ্ঞ এটি দেখতে পাবেন।"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/500</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('schedule')}>পেছনে</Button>
              <Button className="flex-1" onClick={() => setStep('review')}>পরবর্তী</Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Pay */}
        {step === 'review' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">বিশেষজ্ঞ</span>
                <span className="font-medium">{expertName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">প্যাকেজ</span>
                <span className="font-medium">{selectedPackage.title} ({selectedPackage.duration_minutes} মিনিট)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">সেশনের ধরন</span>
                <Badge variant="secondary">{sessionType}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">তারিখ ও সময়</span>
                <span className="font-medium">{selectedDate} {selectedTime}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>মোট পরিমাণ</span>
                <span>{formatBDT(selectedPackage.price_bdt)}</span>
              </div>
              <p className="text-xs text-gray-400">প্ল্যাটফর্ম কমিশন অন্তর্ভুক্ত — কোনো লুকানো চার্জ নেই</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={loading}>
                {loading ? 'প্রক্রিয়াকরণ...' : `রিকোয়েস্ট পাঠান — ${formatBDT(selectedPackage.price_bdt)}`}
              </Button>
              <p className="text-xs text-center text-gray-400">বিশেষজ্ঞ গ্রহণ করার পর পেমেন্ট করতে হবে</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStep('notes')}>পেছনে</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
