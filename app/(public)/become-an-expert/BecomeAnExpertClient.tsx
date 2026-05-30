'use client';

import Link from 'next/link';
import { CheckCircle, DollarSign, Clock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants/platform';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const BENEFITS = [
  { icon: DollarSign, titleKey: 'become.benefit1.title', descKey: 'become.benefit1.desc' },
  { icon: Clock, titleKey: 'become.benefit2.title', descKey: 'become.benefit2.desc' },
  { icon: Shield, titleKey: 'become.benefit3.title', descKey: 'become.benefit3.desc' },
  { icon: CheckCircle, titleKey: 'become.benefit4.title', descKey: 'become.benefit4.desc' },
];

export function BecomeAnExpertClient() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-secondary to-green-700 text-white py-20 text-center px-4">
        <h1 className="text-4xl font-bold">{t('become.hero.title')}</h1>
        <p className="mt-4 text-green-100 text-lg max-w-2xl mx-auto">{t('become.hero.subtitle')}</p>
        <Button size="lg" className="mt-8 bg-white text-green-700 hover:bg-green-50 font-bold" asChild>
          <Link href="/signup/expert">{t('become.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
        <p className="mt-3 text-green-200 text-sm">{t('become.hero.note')}</p>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{t('become.benefits.heading')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-gray-500">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('become.categories.heading')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} className="rounded-xl bg-white border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{lang === 'bn' ? cat.labelBn : cat.label}</p>
                  <p className="text-xs text-gray-500">{cat.subcategories.slice(0, 2).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('become.ready.heading')}</h2>
        <p className="text-gray-500 mb-6">{t('become.ready.subtitle')}</p>
        <Button size="lg" className="bg-secondary hover:bg-green-700" asChild>
          <Link href="/signup/expert">{t('become.ready.cta')}</Link>
        </Button>
      </section>
    </div>
  );
}
