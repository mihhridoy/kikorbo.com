'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { cn } from '@/lib/utils/cn';

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
      title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors',
        className
      )}
    >
      <Globe className="h-3.5 w-3.5" />
      <span className={cn(lang === 'bn' ? 'text-primary-600' : 'text-gray-400')}>বাং</span>
      <span className="text-gray-300">/</span>
      <span className={cn(lang === 'en' ? 'text-primary-600' : 'text-gray-400')}>EN</span>
    </button>
  );
}
