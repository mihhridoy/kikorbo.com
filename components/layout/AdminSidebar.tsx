'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, Calendar, DollarSign, AlertTriangle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/experts', label: 'Expert Verification', icon: UserCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-gray-100 bg-gray-900 min-h-screen py-6">
      <div className="px-4 mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
