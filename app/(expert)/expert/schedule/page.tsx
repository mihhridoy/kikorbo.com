'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

type SlotGrid = Record<number, Record<string, string | null>>; // dayOfWeek -> time -> slotId or null

export default function ExpertSchedulePage() {
  const { profile } = useAuth();
  const { t, lang } = useLanguage();
  const [expert, setExpert] = useState<any>(null);
  const [slots, setSlots] = useState<SlotGrid>({});
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const supabase = createClient();

  const DAYS = [
    t('expert.schedule.day.sun'),
    t('expert.schedule.day.mon'),
    t('expert.schedule.day.tue'),
    t('expert.schedule.day.wed'),
    t('expert.schedule.day.thu'),
    t('expert.schedule.day.fri'),
    t('expert.schedule.day.sat'),
  ];

  useEffect(() => {
    if (!profile?.id) return;
    fetchData();
  }, [profile?.id]);

  async function fetchData() {
    const { data: expertData } = await supabase.from('experts').select('*').eq('user_id', profile!.id).single();
    if (!expertData) return;
    setExpert(expertData);
    setIsOnline(expertData.is_online);

    const { data: availSlots } = await supabase.from('availability_slots').select('*').eq('expert_id', expertData.id).eq('is_active', true);

    const grid: SlotGrid = {};
    for (let d = 0; d <= 6; d++) grid[d] = {};

    (availSlots || []).forEach((slot: any) => {
      if (!grid[slot.day_of_week]) grid[slot.day_of_week] = {};
      grid[slot.day_of_week][slot.start_time] = slot.id;
    });
    setSlots(grid);
  }

  const toggleSlot = (day: number, time: string) => {
    setSlots((prev) => {
      const daySlots = { ...prev[day] };
      if (daySlots[time]) {
        daySlots[time] = null;
      } else {
        daySlots[time] = 'new';
      }
      return { ...prev, [day]: daySlots };
    });
  };

  const isActive = (day: number, time: string) => !!slots[day]?.[time];

  const handleSave = async () => {
    if (!expert) return;
    setSaving(true);

    await supabase.from('availability_slots').delete().eq('expert_id', expert.id);

    const newSlots: any[] = [];
    for (let d = 0; d <= 6; d++) {
      const daySlots = slots[d] || {};
      Object.entries(daySlots).forEach(([time, val]) => {
        if (val) {
          newSlots.push({
            expert_id: expert.id,
            day_of_week: d,
            start_time: time,
            end_time: `${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
            is_active: true,
          });
        }
      });
    }

    if (newSlots.length > 0) await supabase.from('availability_slots').insert(newSlots);
    await supabase.from('experts').update({ is_online: isOnline }).eq('id', expert.id);

    setSavedMsg(t('expert.schedule.savedMsg'));
    setTimeout(() => setSavedMsg(''), 3000);
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('expert.schedule.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('expert.schedule.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setIsOnline(!isOnline)}
              className={`relative h-6 w-11 rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isOnline ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {isOnline ? t('expert.schedule.online') : t('expert.schedule.offline')}
            </span>
          </label>
        </div>
      </div>

      {savedMsg && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{savedMsg}</div>
      )}

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-3 text-xs text-gray-400 font-normal text-left w-16">{t('expert.schedule.time')}</th>
              {DAYS.map((d) => (
                <th key={d} className="p-3 text-xs font-semibold text-gray-600 text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="border-b border-gray-50">
                <td className="px-3 py-2 text-xs text-gray-400">{time}</td>
                {DAYS.map((_, day) => (
                  <td key={day} className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => toggleSlot(day, time)}
                      className={`h-8 w-full rounded-md text-xs font-medium transition-all ${
                        isActive(day, time)
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-100 text-gray-300 hover:bg-gray-200 hover:text-gray-600'
                      }`}
                    >
                      {isActive(day, time) ? '✓' : ''}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">{t('expert.schedule.hint')}</p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t('expert.schedule.saving') : t('expert.schedule.save')}
        </Button>
      </div>
    </div>
  );
}
