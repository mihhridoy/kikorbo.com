import { formatBDT } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';

interface PriceDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  prefix?: string;
}

export function PriceDisplay({ amount, size = 'md', className, prefix }: PriceDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  return (
    <span className={cn('font-bold text-gray-900', sizes[size], className)}>
      {prefix && <span className="text-gray-500 font-normal text-sm mr-1">{prefix}</span>}
      {formatBDT(amount)}
    </span>
  );
}
