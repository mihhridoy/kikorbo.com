'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Bell, User, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { PLATFORM } from '@/lib/constants/platform';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isExpert = profile?.role === 'expert';
  const isAdmin = profile?.role === 'admin';

  const dashboardHref = isAdmin ? '/admin/dashboard' : isExpert ? '/expert/dashboard' : '/dashboard';

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">EL</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{PLATFORM.name}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/experts" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              বিশেষজ্ঞ খুঁজুন
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              কীভাবে কাজ করে
            </Link>
            <Link href="/become-an-expert" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              বিশেষজ্ঞ হোন
            </Link>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/messages" className="relative p-2 text-gray-500 hover:text-gray-900">
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-100 bg-white shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                      </div>
                      <Link href={dashboardHref} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <button onClick={() => { signOut(); setProfileOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  লগইন
                </Button>
                <Button size="sm" onClick={() => router.push('/signup')}>
                  শুরু করুন
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-3 px-4 space-y-1">
          <Link href="/experts" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>বিশেষজ্ঞ খুঁজুন</Link>
          <Link href="/how-it-works" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>কীভাবে কাজ করে</Link>
          <Link href="/become-an-expert" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>বিশেষজ্ঞ হোন</Link>
          {user ? (
            <>
              <Link href={dashboardHref} className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="block py-2 text-sm font-medium text-red-600">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { router.push('/login'); setMobileOpen(false); }}>লগইন</Button>
              <Button size="sm" className="flex-1" onClick={() => { router.push('/signup'); setMobileOpen(false); }}>শুরু করুন</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
