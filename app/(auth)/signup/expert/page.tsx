'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES } from '@/lib/constants/platform';

export default function ExpertSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    category: '',
    tagline: '',
    bio: '',
    skills: '',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        role: 'expert',
      });

      const { data: expertData, error: expertError } = await supabase.from('experts').insert({
        user_id: authData.user.id,
        category: form.category,
        tagline: form.tagline,
        bio: form.bio,
        verification_status: 'pending',
      }).select().single();

      if (expertError) throw expertError;

      const skillsList = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsList.length > 0 && expertData) {
        await supabase.from('expert_skills').insert(
          skillsList.map((skill: string) => ({ expert_id: expertData.id, skill }))
        );
      }

      router.push('/expert/dashboard?welcome=1');
    } catch (err: any) {
      setError(err.message || 'নিবন্ধন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">বিশেষজ্ঞ হিসেবে যোগ দিন</h1>
          <p className="mt-1 text-gray-500 text-sm">আপনার দক্ষতা শেয়ার করুন এবং আয় করুন</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-primary-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">ব্যক্তিগত তথ্য</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>পূর্ণ নাম</Label>
                <Input className="mt-1" placeholder="আপনার নাম" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
              </div>
              <div>
                <Label>ফোন নম্বর</Label>
                <Input className="mt-1" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>ইমেইল</Label>
              <Input className="mt-1" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div>
              <Label>পাসওয়ার্ড</Label>
              <Input className="mt-1" type="password" placeholder="কমপক্ষে ৮ অক্ষর" value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={!form.fullName || !form.email || !form.password}>
              পরবর্তী
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">বিশেষজ্ঞ প্রোফাইল</h2>
            <div>
              <Label>বিভাগ</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="বিভাগ বেছে নিন" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.label}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ট্যাগলাইন (এক লাইনে আপনার পরিচয়)</Label>
              <Input className="mt-1" placeholder="যেমন: Fiverr-এ ৫ বছরের অভিজ্ঞ ফ্রিল্যান্সার" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label>বিস্তারিত পরিচয়</Label>
              <Textarea className="mt-1" placeholder="আপনার অভিজ্ঞতা ও দক্ষতা সম্পর্কে লিখুন..." rows={5} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>পেছনে</Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={!form.category || !form.tagline}>পরবর্তী</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">দক্ষতা ও শর্তাবলী</h2>
            <div>
              <Label>দক্ষতা (কমা দিয়ে আলাদা করুন)</Label>
              <Input className="mt-1" placeholder="যেমন: Fiverr, Upwork, Client Communication, Proposal Writing" value={form.skills} onChange={(e) => update('skills', e.target.value)} />
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 space-y-2">
              <p className="font-semibold">গুরুত্বপূর্ণ তথ্য:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>আবেদন জমার পর আমাদের টিম ১-৩ কার্যদিবসে যাচাই করবে।</li>
                <li>NID ও সার্টিফিকেট আপলোড করতে হবে (Dashboard থেকে)।</li>
                <li>অনুমোদন না হওয়া পর্যন্ত প্রোফাইল পাবলিক থাকবে না।</li>
                <li>প্ল্যাটফর্ম ১৮% কমিশন কেটে আপনাকে বাকি অর্থ দেবে।</li>
              </ul>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>পেছনে</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? 'জমা দেওয়া হচ্ছে...' : 'আবেদন জমা দিন'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
