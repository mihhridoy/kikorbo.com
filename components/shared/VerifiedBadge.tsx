import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VerifiedBadge({ size = 'md', className }: VerifiedBadgeProps) {
  const sizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
  return (
    <BadgeCheck className={cn(sizes[size], 'text-blue-600 fill-blue-100', className)} />
  );
}
