'use client';

import { MessageSquare, Phone, Video, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBDT } from '@/lib/utils/currency';
import { calculateCommission } from '@/lib/utils/commission';
import { cn } from '@/lib/utils/cn';
import type { Package } from '@/lib/supabase/types';

const SESSION_ICONS = {
  chat: { icon: MessageSquare, label: 'চ্যাট' },
  voice: { icon: Phone, label: 'ভয়েস' },
  video: { icon: Video, label: 'ভিডিও' },
};

const DURATION_LABELS: Record<number, { label: string; color: string }> = {
  20: { label: 'Basic', color: 'bg-blue-50 border-blue-200' },
  30: { label: 'Standard', color: 'bg-green-50 border-green-200' },
  40: { label: 'Premium', color: 'bg-purple-50 border-purple-200' },
};

interface PackageCardProps {
  pkg: Package;
  onBook?: () => void;
  showEarnings?: boolean;
  selected?: boolean;
}

export function PackageCard({ pkg, onBook, showEarnings = false, selected = false }: PackageCardProps) {
  const durationInfo = DURATION_LABELS[pkg.duration_minutes] || { label: 'Custom', color: 'bg-gray-50 border-gray-200' };
  const { expertEarnings } = calculateCommission(pkg.price_bdt);

  return (
    <div className={cn(
      'rounded-xl border-2 p-5 transition-all',
      durationInfo.color,
      selected ? 'ring-2 ring-primary-600' : ''
    )}>
      <div className="flex justify-between items-start">
        <div>
          <Badge variant="secondary" className="text-xs mb-2">{durationInfo.label}</Badge>
          <h3 className="font-bold text-gray-900">{pkg.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{formatBDT(pkg.price_bdt)}</p>
          {showEarnings && (
            <p className="text-xs text-green-600">আপনি পাবেন: {formatBDT(expertEarnings)}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-gray-500">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-sm">{pkg.duration_minutes} মিনিট</span>
      </div>

      {pkg.description && (
        <p className="mt-2 text-sm text-gray-600">{pkg.description}</p>
      )}

      <div className="flex gap-2 mt-3">
        {pkg.session_type.map((type) => {
          const info = SESSION_ICONS[type as keyof typeof SESSION_ICONS];
          if (!info) return null;
          const Icon = info.icon;
          return (
            <div key={type} className="flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-xs text-gray-600">
              <Icon className="h-3 w-3" />
              {info.label}
            </div>
          );
        })}
      </div>

      {onBook && (
        <Button className="w-full mt-4" onClick={onBook}>
          এখন বুক করুন
        </Button>
      )}
    </div>
  );
}
