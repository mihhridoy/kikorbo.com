'use client';

import { Search, Shield, Video, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function HowItWorksClient() {
  const { t } = useLanguage();

  const STEPS_USER = [
    { icon: Search, title: t('how.user.step1.title'), desc: t('how.user.step1.desc') },
    { icon: Shield, title: t('how.user.step2.title'), desc: t('how.user.step2.desc') },
    { icon: Video, title: t('how.user.step3.title'), desc: t('how.user.step3.desc') },
    { icon: Star, title: t('how.user.step4.title'), desc: t('how.user.step4.desc') },
  ];

  const STEPS_EXPERT = [
    { title: t('how.expert.step1.title'), desc: t('how.expert.step1.desc') },
    { title: t('how.expert.step2.title'), desc: t('how.expert.step2.desc') },
    { title: t('how.expert.step3.title'), desc: t('how.expert.step3.desc') },
    { title: t('how.expert.step4.title'), desc: t('how.expert.step4.desc') },
  ];

  const faqs = [
    { q: t('how.faq.q1'), a: t('how.faq.a1') },
    { q: t('how.faq.q2'), a: t('how.faq.a2') },
    { q: t('how.faq.q3'), a: t('how.faq.a3') },
    { q: t('how.faq.q4'), a: t('how.faq.a4') },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-primary-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold">{t('how.hero.title')}</h1>
        <p className="mt-3 text-blue-100 max-w-xl mx-auto">{t('how.hero.subtitle')}</p>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{t('how.user.heading')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS_USER.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                <Icon className="h-7 w-7 text-primary-600" />
              </div>
              <div className="text-xs font-semibold text-gray-400 mb-1">{t('how.step')} {i + 1}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="lg" asChild><Link href="/experts">{t('how.user.cta')}</Link></Button>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{t('how.expert.heading')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS_EXPERT.map(({ title, desc }, i) => (
              <div key={title} className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-sm mb-3">{i + 1}</div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" variant="secondary" asChild><Link href="/signup/expert">{t('how.expert.cta')}</Link></Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('how.faq.heading')}</h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-sm text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
