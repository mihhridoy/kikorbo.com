'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const DEMO_ACCOUNTS = [
  {
    labelKey: 'auth.login.demo.user',
    sublabel: 'Demo User',
    email: 'user@demo.poramorshoo.com',
    password: 'demo1234',
    role: 'user' as const,
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    dot: 'bg-blue-500',
    redirect: '/dashboard',
  },
  {
    labelKey: 'auth.login.demo.expert',
    sublabel: 'Demo Expert',
    email: 'expert@demo.poramorshoo.com',
    password: 'demo1234',
    role: 'expert' as const,
    color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    dot: 'bg-green-500',
    redirect: '/expert/dashboard',
  },
  {
    labelKey: 'auth.login.demo.admin',
    sublabel: 'Demo Admin',
    email: 'admin@demo.poramorshoo.com',
    password: 'demo1234',
    role: 'admin' as const,
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    dot: 'bg-purple-500',
    redirect: '/admin/dashboard',
  },
];

const DEMO_EMAILS = new Set(DEMO_ACCOUNTS.map((a) => a.email));

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
  const { setUser, setProfile, setLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const loginAsDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    // Set a cookie so middleware allows access to protected routes
    document.cookie = `demo_role=${acc.role}; path=/; max-age=3600`;
    setLoading(false);
    setUser({
      id: `demo-${acc.role}`,
      email: acc.email,
      app_metadata: {},
      user_metadata: { full_name: acc.sublabel },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any);
    setProfile({
      id: `demo-${acc.role}`,
      full_name: acc.sublabel,
      username: `demo_${acc.role}`,
      email: acc.email,
      phone: null,
      avatar_url: null,
      role: acc.role,
      is_banned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    router.push(acc.redirect);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError('');

    // Demo shortcut — bypass Supabase for demo accounts
    if (DEMO_EMAILS.has(email)) {
      const acc = DEMO_ACCOUNTS.find((a) => a.email === email)!;
      if (password === acc.password) {
        loginAsDemo(acc);
        return;
      }
      setError(t('auth.login.error.demoPassword'));
      setLocalLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(t('auth.login.error.invalidCredentials'));
        return;
      }

      if (data.session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        const role = profile?.role;
        if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'expert') router.push('/expert/dashboard');
        else router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || t('auth.common.error.generic'));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
    });
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Demo Login Panel */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">{t('auth.login.demo.title')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.sublabel}
              type="button"
              onClick={() => loginAsDemo(acc)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors ${acc.color}`}
            >
              <span className={`h-2 w-2 rounded-full ${acc.dot}`} />
              <span className="text-xs font-bold leading-tight">{t(acc.labelKey)}</span>
              <span className="text-[10px] opacity-70">{acc.sublabel}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-amber-600 text-center">
          {t('auth.login.demo.hint')}
        </p>
      </div>

      {/* Login Form */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.login.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('auth.common.email')}</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">{t('auth.common.password')}</Label>
              <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">{t('auth.login.forgot')}</Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.login.passwordPlaceholder')}
                className="pl-9 pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">{t('auth.login.or')}</span></div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          {t('auth.login.google')}
        </Button>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('auth.login.noAccount')}{' '}
          <Link href="/signup" className="text-primary-600 font-medium hover:underline">{t('auth.login.register')}</Link>
        </p>
      </div>
    </div>
  );
}
