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
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ExpertSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
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
      setError(err.message || t('auth.expert.error.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.expert.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('auth.expert.subtitle')}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-primary-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">{t('auth.expert.step1.heading')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('auth.expert.fullName')}</Label>
                <Input className="mt-1" placeholder={t('auth.expert.namePlaceholder')} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
              </div>
              <div>
                <Label>{t('auth.expert.phone')}</Label>
                <Input className="mt-1" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{t('auth.expert.email')}</Label>
              <Input className="mt-1" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div>
              <Label>{t('auth.expert.password')}</Label>
              <Input className="mt-1" type="password" placeholder={t('auth.expert.passwordPlaceholder')} value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={!form.fullName || !form.email || !form.password}>
              {t('auth.expert.next')}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">{t('auth.expert.step2.heading')}</h2>
            <div>
              <Label>{t('auth.expert.category')}</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('auth.expert.categoryPlaceholder')} />
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
              <Label>{t('auth.expert.tagline')}</Label>
              <Input className="mt-1" placeholder={t('auth.expert.taglinePlaceholder')} value={form.tagline} onChange={(e) => update('tagline', e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label>{t('auth.expert.bio')}</Label>
              <Textarea className="mt-1" placeholder={t('auth.expert.bioPlaceholder')} rows={5} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>{t('auth.expert.back')}</Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={!form.category || !form.tagline}>{t('auth.expert.next')}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">{t('auth.expert.step3.heading')}</h2>
            <div>
              <Label>{t('auth.expert.skills')}</Label>
              <Input className="mt-1" placeholder={t('auth.expert.skillsPlaceholder')} value={form.skills} onChange={(e) => update('skills', e.target.value)} />
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 space-y-2">
              <p className="font-semibold">{t('auth.expert.info.title')}</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>{t('auth.expert.info.item1')}</li>
                <li>{t('auth.expert.info.item2')}</li>
                <li>{t('auth.expert.info.item3')}</li>
                <li>{t('auth.expert.info.item4')}</li>
              </ul>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>{t('auth.expert.back')}</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? t('auth.expert.submitting') : t('auth.expert.submit')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
