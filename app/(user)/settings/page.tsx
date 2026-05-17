'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone || '' });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone }).eq('id', profile.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">সেটিংস</h1>
        {saved && <span className="text-sm text-green-600">✓ সংরক্ষিত</span>}
      </div>

      <div className="space-y-6">
        <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-gray-900">{profile?.full_name}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{profile?.role}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>পূর্ণ নাম</Label>
              <Input className="mt-1" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <Label>ফোন নম্বর</Label>
              <Input className="mt-1" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Label>ইমেইল</Label>
              <Input className="mt-1 bg-gray-50" value={profile?.email || ''} disabled />
              <p className="text-xs text-gray-400 mt-1">ইমেইল পরিবর্তন করা যাবে না</p>
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</Button>
          </form>
        </div>

        <div className="rounded-xl bg-white border border-red-100 p-6 shadow-sm">
          <h2 className="font-bold text-red-600 mb-2">অ্যাকাউন্ট মুছুন</h2>
          <p className="text-sm text-gray-500 mb-4">আপনার সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে।</p>
          <Button variant="destructive" size="sm">অ্যাকাউন্ট মুছুন</Button>
        </div>
      </div>
    </div>
  );
}
