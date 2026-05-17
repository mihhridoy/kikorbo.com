import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({ rating, maxStars = 5, size = 'md', showValue = false, className }: StarRatingProps) {
  const sizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
      {showValue && (
        <span className={cn('ml-1 font-semibold text-gray-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
