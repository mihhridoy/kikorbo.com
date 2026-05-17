'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, InboxIcon, Video, Package, Calendar, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/expert/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/expert/requests', label: 'রিকোয়েস্ট', icon: InboxIcon },
  { href: '/expert/sessions', label: 'সেশন', icon: Video },
  { href: '/expert/packages', label: 'প্যাকেজ', icon: Package },
  { href: '/expert/schedule', label: 'সময়সূচি', icon: Calendar },
  { href: '/expert/earnings', label: 'আয়', icon: DollarSign },
  { href: '/expert/profile', label: 'প্রোফাইল', icon: User },
];

export function ExpertSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-gray-100 bg-white min-h-screen py-6">
      <div className="px-4 mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">বিশেষজ্ঞ প্যানেল</span>
      </div>
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
