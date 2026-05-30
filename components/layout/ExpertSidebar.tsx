'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, InboxIcon, Video, Package, Calendar, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const navItems = [
  { href: '/expert/dashboard', labelKey: 'expert.sidebar.dashboard', icon: LayoutDashboard },
  { href: '/expert/requests', labelKey: 'expert.sidebar.requests', icon: InboxIcon },
  { href: '/expert/sessions', labelKey: 'expert.sidebar.sessions', icon: Video },
  { href: '/expert/packages', labelKey: 'expert.sidebar.packages', icon: Package },
  { href: '/expert/schedule', labelKey: 'expert.sidebar.schedule', icon: Calendar },
  { href: '/expert/earnings', labelKey: 'expert.sidebar.earnings', icon: DollarSign },
  { href: '/expert/profile', labelKey: 'expert.sidebar.profile', icon: User },
];

export function ExpertSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-gray-100 bg-white min-h-screen py-6">
      <div className="px-4 mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('expert.sidebar.panel')}</span>
      </div>
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
