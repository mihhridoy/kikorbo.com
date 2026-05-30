'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, MessageSquare, Wallet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const navItems = [
  { href: '/dashboard', labelKey: 'user.nav.dashboard', icon: LayoutDashboard },
  { href: '/bookings', labelKey: 'user.nav.bookings', icon: Calendar },
  { href: '/messages', labelKey: 'user.nav.messages', icon: MessageSquare },
  { href: '/wallet', labelKey: 'user.nav.wallet', icon: Wallet },
  { href: '/settings', labelKey: 'user.nav.settings', icon: Settings },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-gray-100 bg-white min-h-screen py-6">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ href, labelKey, icon: Icon }) => (
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
            {t(labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
