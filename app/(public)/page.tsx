'use client';

import Link from 'next/link';
import { Search, Star, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/constants/platform';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const TRUST_STATS = [
  { key: 'home.stat.experts', value: '৫০০+', valueEn: '500+' },
  { key: 'home.stat.sessions', value: '১০,০০০+', valueEn: '10,000+' },
  { key: 'home.stat.rating', value: '৪.৮★', valueEn: '4.8★' },
];

const HOW_IT_WORKS = [
  { step: '১', stepEn: '1', titleKey: 'home.how.1.title', descKey: 'home.how.1.desc', icon: Search, color: 'bg-blue-100 text-blue-600' },
  { step: '২', stepEn: '2', titleKey: 'home.how.2.title', descKey: 'home.how.2.desc', icon: Shield, color: 'bg-green-100 text-green-600' },
  { step: '৩', stepEn: '3', titleKey: 'home.how.3.title', descKey: 'home.how.3.desc', icon: Zap, color: 'bg-purple-100 text-purple-600' },
];

const FEATURES = [
  { icon: CheckCircle, titleKey: 'home.why.1.title', descKey: 'home.why.1.desc' },
  { icon: Shield, titleKey: 'home.why.2.title', descKey: 'home.why.2.desc' },
  { icon: Star, titleKey: 'home.why.3.title', descKey: 'home.why.3.desc' },
];

const TESTIMONIALS = [
  { nameKey: 'home.testi.1.name', roleKey: 'home.testi.1.role', contentKey: 'home.testi.1.content', rating: 5 },
  { nameKey: 'home.testi.2.name', roleKey: 'home.testi.2.role', contentKey: 'home.testi.2.content', rating: 5 },
  { nameKey: 'home.testi.3.name', roleKey: 'home.testi.3.role', contentKey: 'home.testi.3.content', rating: 5 },
];

export default function HomePage() {
  const { t, lang } = useLanguage();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {t('home.badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('home.heroTitle1')}
              <br />
              <span className="text-yellow-400">{t('home.heroTitle2')}</span>
              {t('home.heroTitle3') ? ` ${t('home.heroTitle3')}` : ''}
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              {t('home.heroSubtitle')}
            </p>

            {/* Trust Stats */}
            <div className="mt-8 flex justify-center gap-8">
              {TRUST_STATS.map(({ key, value, valueEn }) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{lang === 'bn' ? value : valueEn}</p>
                  <p className="text-sm text-blue-200">{t(key)}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-blue-50 font-semibold" asChild>
                <Link href="/experts">
                  {t('home.ctaFindExperts')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/become-an-expert">{t('home.ctaBecomeExpert')}</Link>
              </Button>
            </div>

            {/* Quick Search */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="flex rounded-xl bg-white shadow-lg overflow-hidden">
                <div className="flex items-center pl-4">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  className="flex-1 px-3 py-3.5 text-gray-700 text-sm outline-none"
                />
                <Link href="/experts" className="bg-primary-600 px-5 py-3.5 text-sm font-medium text-white hover:bg-primary-700 whitespace-nowrap">
                  {t('home.searchBtn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.how.title')}</h2>
            <p className="mt-2 text-gray-500">{t('home.how.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, stepEn, titleKey, descKey, icon: Icon, color }) => (
              <div key={titleKey} className="relative text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${color} mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="absolute top-6 left-[calc(50%+2rem)] hidden md:block w-[calc(100%-4rem)] h-0.5 bg-gray-200" />
                <span className="inline-block text-xs font-bold text-gray-400 mb-2">{t('home.how.step')} {lang === 'bn' ? step : stepEn}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-gray-500">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('home.cat.title')}</h2>
              <p className="mt-1 text-gray-500">{t('home.cat.subtitle')}</p>
            </div>
            <Link href="/experts" className="text-primary-600 text-sm font-medium hover:underline">
              {t('home.cat.viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/experts?category=${cat.slug}`}
                className="group rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {lang === 'bn' ? cat.labelBn : cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Poramorshoo */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.why.title')}</h2>
            <p className="mt-2 text-gray-500">{t('home.why.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-gray-500">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.testi.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ nameKey, roleKey, contentKey, rating }) => (
              <div key={nameKey} className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
                <div className="flex mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4">&ldquo;{t(contentKey)}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t(nameKey)}</p>
                  <p className="text-xs text-gray-500">{t(roleKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become Expert CTA */}
      <section className="py-20 bg-gradient-to-r from-secondary to-green-600 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">{t('home.becomeCta.title')}</h2>
          <p className="mt-4 text-lg text-green-100">
            {t('home.becomeCta.subtitle')}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-semibold" asChild>
              <Link href="/become-an-expert">
                {t('home.becomeCta.btn')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-green-100">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span className="text-sm">{t('home.becomeCta.point1')}</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span className="text-sm">{t('home.becomeCta.point2')}</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span className="text-sm">{t('home.becomeCta.point3')}</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
