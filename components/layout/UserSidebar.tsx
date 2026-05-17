'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, MessageSquare, Wallet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/bookings', label: 'বুকিংসমূহ', icon: Calendar },
  { href: '/messages', label: 'বার্তা', icon: MessageSquare },
  { href: '/wallet', label: 'ওয়ালেট', icon: Wallet },
  { href: '/settings', label: 'সেটিংস', icon: Settings },
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-gray-100 bg-white min-h-screen py-6">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
