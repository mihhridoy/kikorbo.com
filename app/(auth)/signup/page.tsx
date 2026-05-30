'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError(t('auth.signup.error.passwordLength')); return; }
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data?.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, email, role: 'user' });
        if (data.session) {
          router.push('/dashboard');
          return;
        }
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || t('auth.common.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.signup.success.title')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t('auth.signup.success.desc')}</p>
          <Button onClick={() => router.push('/login')} className="w-full">{t('auth.signup.success.login')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.signup.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('auth.signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('auth.common.fullName')}</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="name" type="text" placeholder={t('auth.common.namePlaceholder')} className="pl-9" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label htmlFor="email">{t('auth.common.email')}</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="email" type="email" placeholder="your@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label htmlFor="password">{t('auth.common.password')}</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.signup.passwordPlaceholder')} className="pl-9 pr-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.signup.submitting') : t('auth.signup.submit')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('auth.signup.haveAccount')}{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">{t('auth.signup.login')}</Link>
        </p>
        <p className="mt-3 text-center text-sm text-gray-400">
          {t('auth.signup.wantExpert')}{' '}
          <Link href="/signup/expert" className="text-secondary font-medium hover:underline">{t('auth.signup.applyHere')}</Link>
        </p>
      </div>
    </div>
  );
}
