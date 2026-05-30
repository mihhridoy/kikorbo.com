'use client';

import Link from 'next/link';
import { MessageSquare, Video, Phone, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { StarRating } from '@/components/shared/StarRating';
import { formatBDT } from '@/lib/utils/currency';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface ExpertCardProps {
  expert: {
    id: string;
    username?: string | null;
    full_name: string;
    avatar_url?: string | null;
    tagline?: string | null;
    category: string;
    avg_rating: number;
    total_reviews: number;
    total_sessions: number;
    is_online: boolean;
    verification_status: string;
    min_price?: number;
  };
}

const SESSION_ICONS = {
  chat: MessageSquare,
  voice: Phone,
  video: Video,
};

export function ExpertCard({ expert }: ExpertCardProps) {
  const { t } = useLanguage();
  const profileHref = `/experts/${expert.username || expert.id}`;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-14 w-14">
            <AvatarImage src={expert.avatar_url || ''} alt={expert.full_name} />
            <AvatarFallback className="text-base">{expert.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          {expert.is_online && (
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{expert.full_name}</h3>
            {expert.verification_status === 'approved' && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{expert.category}</p>
        </div>
        {expert.is_online && (
          <Badge variant="online" className="text-xs shrink-0">{t('experts.online')}</Badge>
        )}
      </div>

      {expert.tagline && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-1">{expert.tagline}</p>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <StarRating rating={expert.avg_rating} size="sm" showValue />
        <span>({expert.total_reviews} {t('experts.reviewsLabel')})</span>
        <span>•</span>
        <span>{expert.total_sessions} {t('experts.sessionsLabel')}</span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{t('experts.startsFrom')}</p>
          <p className="text-base font-bold text-gray-900">{formatBDT(expert.min_price || 300)}<span className="text-xs font-normal text-gray-400">{t('experts.perTwentyMin')}</span></p>
        </div>
        <Button size="sm" asChild>
          <Link href={profileHref}>{t('experts.viewProfile')}</Link>
        </Button>
      </div>
    </div>
  );
}
