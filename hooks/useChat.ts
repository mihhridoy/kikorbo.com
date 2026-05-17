'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/lib/supabase/types';

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('sent_at', { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: { new: Message }) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId]);

  const sendMessage = async (senderId: string, content: string, messageType: 'text' | 'file' | 'system' = 'text') => {
    await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: senderId,
      content,
      message_type: messageType,
    });
  };

  return { messages, loading, sendMessage };
}
