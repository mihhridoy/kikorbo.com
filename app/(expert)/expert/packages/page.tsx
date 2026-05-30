'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackageCard } from '@/components/expert/PackageCard';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatBDT } from '@/lib/utils/currency';
import { calculateCommission } from '@/lib/utils/commission';
import { PACKAGE_DURATIONS, PLATFORM } from '@/lib/constants/platform';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ExpertPackagesPage() {
  const { profile } = useAuth();
  const { t, lang } = useLanguage();
  const [expert, setExpert] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const SESSION_TYPE_OPTIONS = [
    { value: 'video', label: t('expert.packages.sessionType.video'), icon: Video },
    { value: 'voice', label: t('expert.packages.sessionType.voice'), icon: Phone },
    { value: 'chat', label: t('expert.packages.sessionType.chat'), icon: MessageSquare },
  ];

  const [form, setForm] = useState({
    title: '',
    description: '',
    duration_minutes: '30',
    price_bdt: '',
    session_type: ['video'] as string[],
    is_active: true,
  });

  useEffect(() => {
    if (!profile?.id) return;
    fetchData();
  }, [profile?.id]);

  async function fetchData() {
    const { data: expertData } = await supabase.from('experts').select('*').eq('user_id', profile!.id).single();
    if (expertData) {
      setExpert(expertData);
      const { data: pkgs } = await supabase.from('packages').select('*').eq('expert_id', expertData.id).order('duration_minutes');
      setPackages(pkgs || []);
    }
    setLoading(false);
  }

  const toggleSessionType = (type: string) => {
    setForm((prev) => ({
      ...prev,
      session_type: prev.session_type.includes(type)
        ? prev.session_type.filter((t) => t !== type)
        : [...prev.session_type, type],
    }));
  };

  const handleSave = async () => {
    if (!expert) return;
    setSaving(true);

    const payload = {
      expert_id: expert.id,
      title: form.title,
      description: form.description || null,
      duration_minutes: parseInt(form.duration_minutes) as 20 | 30 | 40,
      price_bdt: parseFloat(form.price_bdt),
      session_type: form.session_type,
      is_active: form.is_active,
    };

    if (editingId) {
      await supabase.from('packages').update(payload).eq('id', editingId);
    } else {
      await supabase.from('packages').insert(payload);
    }

    await fetchData();
    setShowForm(false);
    setEditingId(null);
    setForm({ title: '', description: '', duration_minutes: '30', price_bdt: '', session_type: ['video'], is_active: true });
    setSaving(false);
  };

  const handleEdit = (pkg: any) => {
    setForm({
      title: pkg.title,
      description: pkg.description || '',
      duration_minutes: String(pkg.duration_minutes),
      price_bdt: String(pkg.price_bdt),
      session_type: pkg.session_type,
      is_active: pkg.is_active,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('expert.packages.deleteConfirm'))) return;
    await supabase.from('packages').delete().eq('id', id);
    await fetchData();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('packages').update({ is_active: !current }).eq('id', id);
    await fetchData();
  };

  const price = parseFloat(form.price_bdt) || 0;
  const { expertEarnings } = calculateCommission(price);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('expert.packages.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('expert.packages.subtitle')}</p>
        </div>
        {packages.length < 3 && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t('expert.packages.newPackage')}
          </Button>
        )}
      </div>

      {/* Package Form */}
      {showForm && (
        <div className="rounded-xl bg-white border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">{editingId ? t('expert.packages.editPackage') : t('expert.packages.newPackage')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('expert.packages.titleLabel')}</Label>
              <Input className="mt-1" placeholder={t('expert.packages.titlePlaceholder')} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>{t('expert.packages.duration')}</Label>
              <Select value={form.duration_minutes} onValueChange={(v) => setForm((p) => ({ ...p, duration_minutes: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PACKAGE_DURATIONS.map((d) => (
                    <SelectItem key={d.minutes} value={String(d.minutes)}>
                      {d.minutes} {t('expert.packages.minutes')} — {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('expert.packages.priceLabel')} {PLATFORM.minPackagePrice}</Label>
              <Input className="mt-1" type="number" placeholder="800" min={PLATFORM.minPackagePrice} max={PLATFORM.maxPackagePrice} value={form.price_bdt} onChange={(e) => setForm((p) => ({ ...p, price_bdt: e.target.value }))} />
              {price > 0 && (
                <p className="text-xs text-green-600 mt-1">{t('expert.packages.youWillGet')} {formatBDT(expertEarnings)} {t('expert.packages.feeDeducted')}</p>
              )}
            </div>
            <div>
              <Label>{t('expert.packages.sessionTypeLabel')}</Label>
              <div className="flex gap-2 mt-1">
                {SESSION_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSessionType(value)}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                      form.session_type.includes(value) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>{t('expert.packages.descriptionLabel')}</Label>
              <Textarea className="mt-1" placeholder={t('expert.packages.descriptionPlaceholder')} rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setEditingId(null); }}>{t('expert.packages.cancel')}</Button>
            <Button className="flex-1" disabled={!form.title || !form.price_bdt || form.session_type.length === 0 || saving} onClick={handleSave}>
              {saving ? t('expert.packages.saving') : t('expert.packages.save')}
            </Button>
          </div>
        </div>
      )}

      {/* Package List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('expert.packages.loading')}</div>
      ) : packages.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-3">{t('expert.packages.noPackages')}</p>
          <Button onClick={() => setShowForm(true)}>{t('expert.packages.addFirst')}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="relative">
              <PackageCard pkg={pkg} showEarnings />
              <div className="flex gap-2 mt-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => toggleActive(pkg.id, pkg.is_active)}>
                  {pkg.is_active ? t('expert.packages.deactivate') : t('expert.packages.activate')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                  <Edit className="h-3.5 w-3.5 mr-1" /> {t('expert.packages.edit')}
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200" onClick={() => handleDelete(pkg.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
