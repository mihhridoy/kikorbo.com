'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES, PLATFORM } from '@/lib/constants/platform';

export default function ExpertProfilePage() {
  const { profile } = useAuth();
  const [expert, setExpert] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    category: '',
    subcategory: '',
    tagline: '',
    bio: '',
    languages: 'Bengali, English',
  });

  useEffect(() => {
    if (!profile?.id) return;
    fetchData();
  }, [profile?.id]);

  async function fetchData() {
    const { data: expertData } = await supabase.from('experts').select('*').eq('user_id', profile!.id).single();
    if (expertData) {
      setExpert(expertData);
      setForm({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        category: expertData.category || '',
        subcategory: expertData.subcategory || '',
        tagline: expertData.tagline || '',
        bio: expertData.bio || '',
        languages: (expertData.languages || []).join(', '),
      });
    }
    const { data: skillsData } = await supabase.from('expert_skills').select('skill').eq('expert_id', expertData?.id);
    setSkills((skillsData || []).map((s: any) => s.skill));
  }

  const addSkill = () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim()) || skills.length >= PLATFORM.maxSkillsPerExpert) return;
    setSkills((prev) => [...prev, newSkill.trim()]);
    setNewSkill('');
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSave = async () => {
    if (!expert || !profile) return;
    setSaving(true);

    await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
    }).eq('id', profile.id);

    await supabase.from('experts').update({
      category: form.category,
      subcategory: form.subcategory || null,
      tagline: form.tagline,
      bio: form.bio,
      languages: form.languages.split(',').map((l) => l.trim()).filter(Boolean),
    }).eq('id', expert.id);

    await supabase.from('expert_skills').delete().eq('expert_id', expert.id);
    if (skills.length > 0) {
      await supabase.from('expert_skills').insert(skills.map((skill) => ({ expert_id: expert.id, skill })));
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">প্রোফাইল সম্পাদনা</h1>
        {saved && <span className="text-sm text-green-600 font-medium">✓ সংরক্ষিত হয়েছে</span>}
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-2xl">{form.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{form.full_name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <Badge className="mt-1" variant={expert?.verification_status === 'approved' ? 'verified' : 'warning'}>
              {expert?.verification_status === 'approved' ? '✓ যাচাইকৃত' : expert?.verification_status === 'pending' ? 'যাচাই অপেক্ষমাণ' : 'অনুমোদিত নয়'}
            </Badge>
          </div>
        </div>

        {/* Personal Info */}
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">ব্যক্তিগত তথ্য</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>পূর্ণ নাম</Label>
              <Input className="mt-1" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <Label>ফোন</Label>
              <Input className="mt-1" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Expert Info */}
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">বিশেষজ্ঞ তথ্য</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>বিভাগ</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.label}>{cat.icon} {cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ভাষাসমূহ</Label>
              <Input className="mt-1" value={form.languages} onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))} placeholder="Bengali, English" />
            </div>
          </div>
          <div>
            <Label>ট্যাগলাইন (সর্বোচ্চ ১০০ অক্ষর)</Label>
            <Input className="mt-1" value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} maxLength={100} />
          </div>
          <div>
            <Label>বিস্তারিত পরিচয়</Label>
            <Textarea className="mt-1" rows={5} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">দক্ষতা ({skills.length}/{PLATFORM.maxSkillsPerExpert})</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="pr-1.5">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1.5 text-gray-400 hover:text-gray-700"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
          {skills.length < PLATFORM.maxSkillsPerExpert && (
            <div className="flex gap-2">
              <Input placeholder="নতুন দক্ষতা যোগ করুন" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
              <Button variant="outline" onClick={addSkill}>যোগ করুন</Button>
            </div>
          )}
        </div>

        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
        </Button>
      </div>
    </div>
  );
}
