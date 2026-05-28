'use client';

import Link from 'next/link';
import { PLATFORM, CATEGORIES } from '@/lib/constants/platform';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-white">{PLATFORM.name}</span>
                <span className="text-[10px] text-gray-400 -mt-0.5">{PLATFORM.nameBn}</span>
              </div>
            </div>
            <p className="text-sm">{t('footer.tagline')}</p>
            <p className="text-sm mt-1">{t('footer.subtagline')}</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="rounded-md border border-gray-700 px-2 py-1 text-xs">bKash</span>
              <span className="rounded-md border border-gray-700 px-2 py-1 text-xs">SSLCommerz</span>
              <span className="rounded-md border border-gray-700 px-2 py-1 text-xs">SSL Secured</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t('footer.categories')}</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="text-sm hover:text-white transition-colors">
                    {lang === 'bn' ? cat.labelBn : cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t('footer.platform')}</h4>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className="text-sm hover:text-white transition-colors">{t('nav.howItWorks')}</Link></li>
              <li><Link href="/become-an-expert" className="text-sm hover:text-white transition-colors">{t('nav.becomeExpert')}</Link></li>
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">{t('footer.about')}</Link></li>
              <li><Link href="/experts" className="text-sm hover:text-white transition-colors">{t('footer.allExperts')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm hover:text-white transition-colors">{t('nav.login')}</Link></li>
              <li><Link href="/signup" className="text-sm hover:text-white transition-colors">{t('footer.register')}</Link></li>
              <li><a href="mailto:support@poramorshoo.com" className="text-sm hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs">© 2024 {PLATFORM.name}. {t('footer.rights')}</p>
          <p className="text-xs">{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}
