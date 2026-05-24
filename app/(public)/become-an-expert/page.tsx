import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, DollarSign, Clock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants/platform';

export const metadata: Metadata = { title: 'বিশেষজ্ঞ হোন' };

const BENEFITS = [
  { icon: DollarSign, title: 'নিজের দরে কাজ করুন', desc: 'আপনি নিজেই প্যাকেজের মূল্য নির্ধারণ করুন। ন্যূনতম ৳৩০০।' },
  { icon: Clock, title: 'নিজের সময়সূচি', desc: 'আপনার সুবিধামতো সময়ে সেশন নিন। কোনো বাধ্যবাধকতা নেই।' },
  { icon: Shield, title: 'নিরাপদ পেমেন্ট', desc: 'সেশন শেষে সরাসরি আপনার ওয়ালেটে অর্থ জমা হয়।' },
  { icon: CheckCircle, title: 'বিশ্বস্ত প্ল্যাটফর্ম', desc: 'বাংলাদেশের সেরা পরামর্শ প্ল্যাটফর্মে আপনার পরিচিতি গড়ুন।' },
];

export default function BecomeAnExpertPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-secondary to-green-700 text-white py-20 text-center px-4">
        <h1 className="text-4xl font-bold">আপনার জ্ঞান দিয়ে আয় করুন</h1>
        <p className="mt-4 text-green-100 text-lg max-w-2xl mx-auto">আপনার অভিজ্ঞতা ও দক্ষতা দিয়ে হাজারো মানুষকে সাহায্য করুন এবং প্রতি সেশনে আয় করুন।</p>
        <Button size="lg" className="mt-8 bg-white text-green-700 hover:bg-green-50 font-bold" asChild>
          <Link href="/signup/expert">এখনই আবেদন করুন <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
        <p className="mt-3 text-green-200 text-sm">বিনামূল্যে • ১-৩ দিনে অনুমোদন</p>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">কেন Poramorshoo-তে যোগ দেবেন?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">কোন বিষয়ে বিশেষজ্ঞ হতে পারবেন?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} className="rounded-xl bg-white border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-500">{cat.subcategories.slice(0, 2).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">প্রস্তুত?</h2>
        <p className="text-gray-500 mb-6">মাত্র ৫ মিনিটে আবেদন করুন এবং আপনার বিশেষজ্ঞ যাত্রা শুরু করুন।</p>
        <Button size="lg" className="bg-secondary hover:bg-green-700" asChild>
          <Link href="/signup/expert">বিশেষজ্ঞ হিসেবে যোগ দিন</Link>
        </Button>
      </section>
    </div>
  );
}
