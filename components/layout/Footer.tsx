import Link from 'next/link';
import { PLATFORM, CATEGORIES } from '@/lib/constants/platform';

export function Footer() {
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
            <p className="text-sm">{PLATFORM.tagline}</p>
            <p className="text-sm mt-1">Bangladesh&apos;s trusted expert consultation platform.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="rounded-md border border-gray-700 px-2 py-1 text-xs">bKash</span>
              <span className="rounded-md border border-gray-700 px-2 py-1 text-xs">SSLCommerz</span>
              <span className="rounded-md border border-gray-700 px-2 py-1 text-xs">SSL Secured</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">বিভাগসমূহ</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="text-sm hover:text-white transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">প্ল্যাটফর্ম</h4>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className="text-sm hover:text-white transition-colors">কীভাবে কাজ করে</Link></li>
              <li><Link href="/become-an-expert" className="text-sm hover:text-white transition-colors">বিশেষজ্ঞ হোন</Link></li>
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/experts" className="text-sm hover:text-white transition-colors">সকল বিশেষজ্ঞ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">সাপোর্ট</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm hover:text-white transition-colors">লগইন</Link></li>
              <li><Link href="/signup" className="text-sm hover:text-white transition-colors">রেজিস্ট্রেশন</Link></li>
              <li><a href="mailto:support@poramorshoo.com" className="text-sm hover:text-white transition-colors">যোগাযোগ করুন</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs">© 2024 {PLATFORM.name}. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-xs">Made with ❤️ for Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
