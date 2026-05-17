'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { sendExpertVerifiedEmail, sendExpertRejectedEmail } from '@/lib/email/resend';

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => { fetchExperts(); }, [filter]);

  async function fetchExperts() {
    setLoading(true);
    const { data } = await supabase
      .from('experts')
      .select('*, profiles(full_name, email, avatar_url, phone), expert_documents(type, file_url), expert_skills(skill)')
      .eq('verification_status', filter)
      .order('created_at', { ascending: false });
    setExperts(data || []);
    setLoading(false);
  }

  async function handleAction(expertId: string, action: 'approved' | 'rejected', userId: string, email: string) {
    setActionLoading(expertId);
    const reason = rejectionReason[expertId];

    await supabase.from('experts').update({
      verification_status: action,
      rejection_reason: action === 'rejected' ? (reason || 'ডকুমেন্ট অসম্পূর্ণ') : null,
    }).eq('id', expertId);

    if (action === 'approved') {
      await supabase.from('profiles').update({ role: 'expert' }).eq('id', userId);
      await supabase.from('expert_wallets').upsert({ expert_id: expertId });
      await sendExpertVerifiedEmail(email);
    } else {
      await sendExpertRejectedEmail(email, reason || 'ডকুমেন্ট অসম্পূর্ণ');
    }

    await fetchExperts();
    setActionLoading(null);
  }

  const STATUS_MAP = {
    pending: { label: 'অপেক্ষমাণ', color: 'warning' },
    approved: { label: 'অনুমোদিত', color: 'success' },
    rejected: { label: 'প্রত্যাখ্যাত', color: 'destructive' },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">বিশেষজ্ঞ যাচাই</h1>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
              {f === 'pending' ? 'অপেক্ষমাণ' : f === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">লোড হচ্ছে...</div>
      ) : experts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">কোনো বিশেষজ্ঞ পাওয়া যায়নি</div>
      ) : (
        <div className="space-y-4">
          {experts.map((expert) => (
            <div key={expert.id} className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={expert.profiles?.avatar_url} />
                  <AvatarFallback>{expert.profiles?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{expert.profiles?.full_name}</h3>
                    <Badge variant={STATUS_MAP[expert.verification_status as keyof typeof STATUS_MAP]?.color as any}>
                      {STATUS_MAP[expert.verification_status as keyof typeof STATUS_MAP]?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{expert.profiles?.email} • {expert.profiles?.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">{expert.category} {expert.subcategory && `• ${expert.subcategory}`}</p>
                  {expert.tagline && <p className="text-sm text-gray-500 mt-1 italic">"{expert.tagline}"</p>}
                  {expert.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{expert.bio}</p>}

                  {(expert.expert_skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {expert.expert_skills.map((s: any) => (
                        <Badge key={s.skill} variant="secondary" className="text-xs">{s.skill}</Badge>
                      ))}
                    </div>
                  )}

                  {(expert.expert_documents || []).length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-500">ডকুমেন্টসমূহ:</p>
                      <div className="flex flex-wrap gap-2">
                        {expert.expert_documents.map((doc: any) => (
                          <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1 text-xs text-primary-600 hover:underline border border-primary-200 rounded-md px-2 py-1">
                            <Eye className="h-3 w-3" />
                            {doc.type === 'nid_front' ? 'NID (সামনে)' : doc.type === 'nid_back' ? 'NID (পেছনে)' : doc.type === 'certificate' ? 'সার্টিফিকেট' : 'পোর্টফোলিও'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {filter === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={actionLoading === expert.id}
                      onClick={() => handleAction(expert.id, 'approved', expert.user_id, expert.profiles?.email)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> অনুমোদন
                    </Button>
                    <div>
                      <input
                        type="text"
                        placeholder="প্রত্যাখ্যানের কারণ..."
                        className="mb-1 h-7 w-full rounded border border-gray-200 px-2 text-xs focus:outline-none"
                        value={rejectionReason[expert.id] || ''}
                        onChange={(e) => setRejectionReason((prev) => ({ ...prev, [expert.id]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        disabled={actionLoading === expert.id}
                        onClick={() => handleAction(expert.id, 'rejected', expert.user_id, expert.profiles?.email)}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> প্রত্যাখ্যান
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
