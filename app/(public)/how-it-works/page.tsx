import type { Metadata } from 'next';
import { Search, Shield, Video, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = { title: 'কীভাবে কাজ করে' };

const STEPS_USER = [
  { icon: Search, title: 'বিশেষজ্ঞ খুঁজুন', desc: 'ক্যাটাগরি, রেটিং ও মূল্য দিয়ে ফিল্টার করে আপনার উপযুক্ত বিশেষজ্ঞ খুঁজুন।' },
  { icon: Shield, title: 'বুক করুন ও পেমেন্ট করুন', desc: 'প্যাকেজ বেছে নিন, সময় নির্ধারণ করুন এবং bKash বা SSLCommerz দিয়ে নিরাপদে পেমেন্ট করুন।' },
  { icon: Video, title: 'পরামর্শ নিন', desc: 'নির্ধারিত সময়ে ভিডিও, ভয়েস বা চ্যাটের মাধ্যমে বিশেষজ্ঞের সাথে পরামর্শ করুন।' },
  { icon: Star, title: 'রিভিউ দিন', desc: 'সেশন শেষে বিশেষজ্ঞকে রেটিং দিন এবং অন্যদের সঠিক সিদ্ধান্ত নিতে সাহায্য করুন।' },
];

const STEPS_EXPERT = [
  { title: 'প্রোফাইল তৈরি করুন', desc: 'আপনার দক্ষতা, অভিজ্ঞতা ও প্যাকেজ সেট করুন।' },
  { title: 'যাচাইকরণ সম্পন্ন করুন', desc: 'NID ও সার্টিফিকেট জমা দিন। আমাদের টিম ১-৩ দিনে যাচাই করবে।' },
  { title: 'বুকিং গ্রহণ করুন', desc: 'ব্যবহারকারীদের বুকিং অনুরোধ গ্রহণ বা প্রত্যাখ্যান করুন।' },
  { title: 'আয় করুন', desc: 'সেশন সম্পন্ন হলে ১৮% কমিশন বাদে বাকি অর্থ আপনার ওয়ালেটে জমা হবে।' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold">কীভাবে কাজ করে?</h1>
        <p className="mt-3 text-blue-100 max-w-xl mx-auto">মাত্র কয়েকটি ধাপে বিশ্বস্ত বিশেষজ্ঞের সাথে পরামর্শ করুন</p>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">ব্যবহারকারীর জন্য</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS_USER.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                <Icon className="h-7 w-7 text-primary-600" />
              </div>
              <div className="text-xs font-semibold text-gray-400 mb-1">ধাপ {i + 1}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="lg" asChild><Link href="/experts">এখনই শুরু করুন</Link></Button>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">বিশেষজ্ঞের জন্য</h2>
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
            <Button size="lg" variant="secondary" asChild><Link href="/signup/expert">বিশেষজ্ঞ হিসেবে আবেদন করুন</Link></Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">সাধারণ প্রশ্নাবলী</h2>
        <div className="space-y-4">
          {[
            { q: 'পেমেন্ট কি নিরাপদ?', a: 'হ্যাঁ। bKash ও SSLCommerz ব্যবহার করে সম্পূর্ণ নিরাপদ পেমেন্ট নিশ্চিত করা হয়। পরামর্শ না হলে অর্থ ফেরত দেওয়া হয়।' },
            { q: 'বিশেষজ্ঞরা কি যাচাইকৃত?', a: 'হ্যাঁ। প্রতিটি বিশেষজ্ঞ NID ও সনদপত্র জমা দিয়ে আমাদের টিমের যাচাইয়ের পর প্রোফাইল সক্রিয় হয়।' },
            { q: 'কমিশন কত?', a: 'প্ল্যাটফর্ম ১৮% কমিশন রাখে। বিশেষজ্ঞ ৮২% পান। ব্যবহারকারীর জন্য কোনো অতিরিক্ত চার্জ নেই।' },
            { q: 'সেশন কি রেকর্ড হয়?', a: 'না। সেশন রেকর্ড করা হয় না। আপনার গোপনীয়তা রক্ষা আমাদের অগ্রাধিকার।' },
          ].map(({ q, a }) => (
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
