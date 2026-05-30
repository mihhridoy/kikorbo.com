'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-800">{t('misc.notfound.title')}</h2>
      <p className="mt-2 text-gray-500">{t('misc.notfound.desc')}</p>
      <Button asChild className="mt-6">
        <Link href="/">{t('misc.notfound.cta')}</Link>
      </Button>
    </div>
  );
}
