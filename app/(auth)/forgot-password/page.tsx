'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    });
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ইমেইল পাঠানো হয়েছে</h2>
          <p className="text-gray-500 text-sm mb-6">পাসওয়ার্ড রিসেটের লিংক আপনার ইমেইলে পাঠানো হয়েছে।</p>
          <Button variant="outline" asChild className="w-full"><Link href="/login">লগইনে ফিরে যান</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">পাসওয়ার্ড রিসেট</h1>
          <p className="mt-1 text-gray-500 text-sm">আপনার ইমেইলে রিসেট লিংক পাঠানো হবে</p>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label>ইমেইল</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="email" placeholder="your@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/login" className="text-primary-600 hover:underline">← লগইনে ফিরে যান</Link>
        </p>
      </div>
    </div>
  );
}
