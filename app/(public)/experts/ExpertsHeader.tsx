'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function ExpertsHeader() {
  const { t } = useLanguage();
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">{t('experts.pageTitle')}</h1>
      <p className="mt-1 text-gray-500">{t('experts.pageSubtitle')}</p>
    </div>
  );
}
