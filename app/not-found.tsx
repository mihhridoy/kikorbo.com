import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-800">পেজটি পাওয়া যায়নি</h2>
      <p className="mt-2 text-gray-500">আপনি যে পেজটি খুঁজছেন সেটি বিদ্যমান নেই।</p>
      <Button asChild className="mt-6">
        <Link href="/">হোমপেজে ফিরে যান</Link>
      </Button>
    </div>
  );
}
