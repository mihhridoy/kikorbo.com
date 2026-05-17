import Link from 'next/link';
import { Search, Star, Shield, Zap, Users, TrendingUp, CheckCircle, ArrowRight, MessageSquare, Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, PLATFORM } from '@/lib/constants/platform';

const TRUST_STATS = [
  { label: 'বিশেষজ্ঞ', value: '৫০০+' },
  { label: 'সেশন', value: '১০,০০০+' },
  { label: 'গড় রেটিং', value: '৪.৮★' },
];

const HOW_IT_WORKS = [
  {
    step: '১',
    title: 'বিশেষজ্ঞ খুঁজুন ও বেছে নিন',
    desc: 'বিভাগ অনুযায়ী ফিল্টার করুন, প্রোফাইল দেখুন এবং আপনার প্রয়োজন অনুযায়ী বিশেষজ্ঞ বেছে নিন।',
    icon: Search,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    step: '২',
    title: 'বুক করুন ও নিরাপদে পেমেন্ট করুন',
    desc: 'bKash বা SSLCommerz দিয়ে নিরাপদে পেমেন্ট করুন। আপনার অর্থ সুরক্ষিত থাকবে।',
    icon: Shield,
    color: 'bg-green-100 text-green-600',
  },
  {
    step: '৩',
    title: 'পরামর্শ নিন চ্যাট/কলে',
    desc: 'নির্ধারিত সময়ে ভিডিও, ভয়েস বা চ্যাটের মাধ্যমে বিশেষজ্ঞের সাথে পরামর্শ করুন।',
    icon: Zap,
    color: 'bg-purple-100 text-purple-600',
  },
];

const FEATURES = [
  { icon: CheckCircle, title: 'যাচাইকৃত বিশেষজ্ঞ', desc: 'প্রতিটি বিশেষজ্ঞ আমাদের টিম দ্বারা NID ও সার্টিফিকেট যাচাই করা।' },
  { icon: Shield, title: 'নিরাপদ পেমেন্ট', desc: 'bKash ও SSLCommerz এর মাধ্যমে সম্পূর্ণ নিরাপদ লেনদেন।' },
  { icon: Star, title: 'সেশন সুরক্ষা', desc: 'পরামর্শ সম্পন্ন না হলে সম্পূর্ণ অর্থ ফেরত পাবেন।' },
];

const TESTIMONIALS = [
  {
    name: 'রাহেলা বেগম',
    role: 'ফ্রিল্যান্সার, ঢাকা',
    content: 'ExpertLagbe-এর মাধ্যমে Fiverr প্রোফাইল অপ্টিমাইজেশনের পরামর্শ নিয়ে আমার আয় তিনগুণ হয়েছে।',
    rating: 5,
  },
  {
    name: 'মোঃ আরিফ হোসেন',
    role: 'BCS পরীক্ষার্থী, চট্টগ্রাম',
    content: 'ভাইভা গাইডেন্স সেশনটি অত্যন্ত কার্যকর ছিল। বিশেষজ্ঞের পরামর্শে আমি অনেক আত্মবিশ্বাসী হয়েছি।',
    rating: 5,
  },
  {
    name: 'তানভীর আহমেদ',
    role: 'সফটওয়্যার ডেভেলপার, সিলেট',
    content: 'ক্যারিয়ার ট্রানজিশনের বিষয়ে দুর্দান্ত পরামর্শ পেয়েছি। প্ল্যাটফর্মটি ব্যবহার করা খুবই সহজ।',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🇧🇩 বাংলাদেশের প্রথম বিশেষজ্ঞ পরামর্শ প্ল্যাটফর্ম
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              বিশ্বস্ত বিশেষজ্ঞের সাথে
              <br />
              <span className="text-yellow-400">তাৎক্ষণিক পরামর্শ</span> করুন
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              ফ্রিল্যান্সিং, BCS, বিদেশে পড়াশোনা, সফটওয়্যার ক্যারিয়ার, ব্যবসা বা আইনি পরামর্শ —
              যেকোনো বিষয়ে যাচাইকৃত বিশেষজ্ঞের সাথে কথা বলুন।
            </p>

            {/* Trust Stats */}
            <div className="mt-8 flex justify-center gap-8">
              {TRUST_STATS.map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{value}</p>
                  <p className="text-sm text-blue-200">{label}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-blue-50 font-semibold" asChild>
                <Link href="/experts">
                  বিশেষজ্ঞ খুঁজুন <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/become-an-expert">বিশেষজ্ঞ হোন</Link>
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
                  placeholder="বিশেষজ্ঞ বা বিষয় খুঁজুন (যেমন: Fiverr, BCS, IELTS)..."
                  className="flex-1 px-3 py-3.5 text-gray-700 text-sm outline-none"
                />
                <Link href="/experts" className="bg-primary-600 px-5 py-3.5 text-sm font-medium text-white hover:bg-primary-700 whitespace-nowrap">
                  খুঁজুন
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
            <h2 className="text-3xl font-bold text-gray-900">কীভাবে কাজ করে?</h2>
            <p className="mt-2 text-gray-500">মাত্র ৩টি সহজ ধাপে পরামর্শ নিন</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="relative text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${color} mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="absolute top-6 left-[calc(50%+2rem)] hidden md:block w-[calc(100%-4rem)] h-0.5 bg-gray-200" />
                <span className="inline-block text-xs font-bold text-gray-400 mb-2">ধাপ {step}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
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
              <h2 className="text-3xl font-bold text-gray-900">বিভাগসমূহ</h2>
              <p className="mt-1 text-gray-500">আপনার প্রয়োজনীয় বিষয় বেছে নিন</p>
            </div>
            <Link href="/experts" className="text-primary-600 text-sm font-medium hover:underline">
              সবগুলো দেখুন →
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
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why ExpertLagbe */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">কেন ExpertLagbe?</h2>
            <p className="mt-2 text-gray-500">আপনার বিশ্বাস আমাদের অগ্রাধিকার</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">ব্যবহারকারীরা কী বলছেন</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, content, rating }) => (
              <div key={name} className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
                <div className="flex mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4">&ldquo;{content}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become Expert CTA */}
      <section className="py-20 bg-gradient-to-r from-secondary to-green-600 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">আপনার জ্ঞান শেয়ার করুন, আয় করুন</h2>
          <p className="mt-4 text-lg text-green-100">
            আপনার দক্ষতা ও অভিজ্ঞতা দিয়ে অন্যদের সাহায্য করুন এবং নিজের সময়সূচি অনুযায়ী আয় করুন।
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-semibold" asChild>
              <Link href="/become-an-expert">
                বিশেষজ্ঞ হিসেবে যোগ দিন <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-green-100">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span className="text-sm">নিজের দরে কাজ করুন</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span className="text-sm">দ্রুত পেমেন্ট</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span className="text-sm">সম্পূর্ণ সহায়তা</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
