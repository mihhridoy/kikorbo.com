import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ExpertListingClient } from './ExpertListingClient';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

export const metadata: Metadata = {
  title: 'বিশেষজ্ঞ খুঁজুন',
  description: 'বাংলাদেশের সেরা বিশেষজ্ঞদের সাথে পরামর্শ করুন।',
};

export default function ExpertsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">বিশেষজ্ঞ খুঁজুন</h1>
          <p className="mt-1 text-gray-500">আপনার প্রয়োজন অনুযায়ী বিশেষজ্ঞ বেছে নিন</p>
        </div>
        <Suspense fallback={<PageSkeleton />}>
          <ExpertListingClient />
        </Suspense>
      </div>
    </div>
  );
}
