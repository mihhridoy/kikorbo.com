import Link from 'next/link';
import { PLATFORM } from '@/lib/constants/platform';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-4 px-6 border-b border-gray-100 bg-white">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-bold text-white">EL</span>
          </div>
          <span className="text-xl font-bold text-gray-900">{PLATFORM.name}</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
