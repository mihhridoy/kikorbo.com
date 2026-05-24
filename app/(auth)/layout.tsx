import Link from 'next/link';
import { PLATFORM } from '@/lib/constants/platform';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-4 px-6 border-b border-gray-100 bg-white">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-gray-900">{PLATFORM.name}</span>
            <span className="text-[10px] text-gray-400 -mt-1">{PLATFORM.nameBn}</span>
          </div>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
