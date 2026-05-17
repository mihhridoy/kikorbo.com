'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import Link from 'next/link';

export default function MessagesPage() {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.id) return;
    fetchRooms();
  }, [profile?.id]);

  async function fetchRooms() {
    const { data } = await supabase
      .from('consultation_rooms')
      .select(`
        *,
        bookings!inner(
          *,
          experts!inner(*, profiles(full_name, avatar_url)),
          profiles!bookings_user_id_fkey(full_name, avatar_url)
        ),
        messages(content, sent_at, is_read, sender_id)
      `)
      .or(`bookings.user_id.eq.${profile!.id},bookings.experts.user_id.eq.${profile!.id}`)
      .order('id', { ascending: false })
      .limit(20);

    setRooms(data || []);
    setLoading(false);
  }

  const isExpert = profile?.role === 'expert';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">বার্তা</h1>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="কোনো বার্তা নেই"
          description="পরামর্শ সেশন শুরু হলে এখানে চ্যাট দেখা যাবে।"
        />
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const booking = room.bookings;
            const otherParty = isExpert ? booking?.profiles : booking?.experts?.profiles;
            const lastMessage = room.messages?.[room.messages.length - 1];
            const unreadCount = (room.messages || []).filter((m: any) => !m.is_read && m.sender_id !== profile?.id).length;

            return (
              <Link key={room.id} href={`/consultation/${room.id}`}
                className="flex items-center gap-4 rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={otherParty?.avatar_url} />
                  <AvatarFallback>{otherParty?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">{otherParty?.full_name}</p>
                    {lastMessage && (
                      <p className="text-xs text-gray-400">{new Date(lastMessage.sent_at).toLocaleDateString('bn-BD')}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{lastMessage?.content || 'কোনো বার্তা নেই'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={room.status === 'active' ? 'online' : room.status === 'ended' ? 'secondary' : 'warning'} className="text-xs">
                      {room.status === 'active' ? 'চলমান' : room.status === 'ended' ? 'শেষ' : 'অপেক্ষমাণ'}
                    </Badge>
                    {unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
