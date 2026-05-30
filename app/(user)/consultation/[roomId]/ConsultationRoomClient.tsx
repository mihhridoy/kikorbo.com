'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Send, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSessionTimer } from '@/hooks/useTimer';
import { useChat } from '@/hooks/useChat';
import { useAgora } from '@/hooks/useAgora';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface ConsultationRoomClientProps {
  roomId: string;
}

export function ConsultationRoomClient({ roomId }: ConsultationRoomClientProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const [room, setRoom] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [isExpert, setIsExpert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useChat(roomId);
  const timer = useSessionTimer(room?.started_at || null, booking?.duration_minutes || 30);

  const sessionType = (booking?.session_type as 'chat' | 'voice' | 'video') || 'video';
  const agora = useAgora({
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
    channel: room?.agora_channel,
    token: isExpert ? room?.agora_token_expert : room?.agora_token_user,
    sessionType,
    active: room?.status === 'active',
  });

  useEffect(() => {
    if (!user) return;
    fetchRoomData();
  }, [user, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (timer.isExpired && room?.status === 'active') {
      handleEndSession();
    }
  }, [timer.isExpired]);

  async function fetchRoomData() {
    const { data: roomData } = await supabase
      .from('consultation_rooms')
      .select('*, bookings!inner(*, experts!inner(user_id, profiles(full_name, avatar_url)), profiles!bookings_user_id_fkey(full_name, avatar_url))')
      .eq('id', roomId)
      .single();

    if (!roomData) { setAccessDenied(true); setLoading(false); return; }

    const bookingData = (roomData as any).bookings;
    const expertUserId = bookingData?.experts?.user_id;
    const isCurrentUserExpert = user!.id === expertUserId;
    const isCurrentUserBooking = user!.id === bookingData?.user_id;

    if (!isCurrentUserExpert && !isCurrentUserBooking) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    setRoom(roomData);
    setBooking(bookingData);
    setIsExpert(isCurrentUserExpert);
    setLoading(false);
  }

  const handleStartSession = async () => {
    await supabase
      .from('consultation_rooms')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', roomId);

    await supabase.from('bookings').update({ status: 'in_progress' }).eq('id', booking.id);

    await sendMessage(user!.id, t('booking.room.sessionStarted'), 'system');
    await fetchRoomData();
  };

  const handleEndSession = async () => {
    await fetch('/api/consultation/end-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    });
    await fetchRoomData();
    setShowEndModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    await sendMessage(user.id, message.trim());
    setMessage('');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    await fetch('/api/reviews/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, rating, comment: reviewComment }),
    });
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-10 w-10 rounded-xl bg-primary-600 animate-pulse mx-auto mb-3" />
          <p className="text-gray-500">{t('booking.room.loading')}</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">{t('booking.room.accessDenied')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('booking.room.accessDeniedDesc')}</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard')}>{t('booking.room.goDashboard')}</Button>
        </div>
      </div>
    );
  }

  const otherParty = isExpert ? booking?.profiles : booking?.experts?.profiles;
  const isSessionActive = room?.status === 'active';
  const isSessionEnded = room?.status === 'ended';

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Left: Chat Panel */}
      <div className={cn('flex flex-col w-full md:w-80 bg-white border-r border-gray-200', showChat ? 'flex' : 'hidden md:flex')}>
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherParty?.avatar_url} />
            <AvatarFallback className="text-sm">{otherParty?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-gray-900">{otherParty?.full_name}</p>
            <p className="text-xs text-gray-400">
              {isSessionActive ? t('booking.room.sessionActive') : isSessionEnded ? t('booking.room.sessionEnded') : t('booking.room.waiting')}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            const isSystem = msg.message_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{msg.content}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                  isMe ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
                )}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-100 p-3 flex gap-2">
          <Input
            placeholder={isSessionEnded ? t('booking.room.inputEnded') : t('booking.room.inputPlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSessionEnded}
            className="text-sm"
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!message.trim() || isSessionEnded}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right: Video Panel */}
      <div className="flex-1 flex flex-col">
        {/* Timer & Status Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-gray-700 text-white">
              <Users className="h-3 w-3 mr-1" />
              {booking?.session_type?.toUpperCase()}
            </Badge>
          </div>

          {isSessionActive && (
            <div className={cn(
              'text-2xl font-bold font-mono',
              timer.isWarning ? 'text-red-400 animate-pulse' : 'text-white'
            )}>
              {timer.formatted}
              {timer.isWarning && <span className="ml-2 text-xs font-normal">{t('booking.room.warningEnding')}</span>}
            </div>
          )}

          <button
            onClick={() => setShowChat(!showChat)}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
          {!isSessionActive && !isSessionEnded ? (
            <div className="text-center text-white">
              <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 text-3xl">
                {otherParty?.full_name?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold mb-2">
                {isExpert ? t('booking.room.waitingForUser') : t('booking.room.waitingForExpert')}
              </h2>
              <p className="text-gray-400 text-sm mb-6">{t('booking.room.readyToStart')}</p>
              {isExpert && (
                <Button size="lg" onClick={handleStartSession} className="bg-green-600 hover:bg-green-700">
                  {t('booking.room.startSession')}
                </Button>
              )}
            </div>
          ) : isSessionEnded ? (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold">{t('booking.room.sessionCompleted')}</h2>
              <p className="text-gray-400 text-sm mt-1">{t('booking.room.thanks')}</p>
            </div>
          ) : sessionType === 'chat' ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageSquare className="h-16 w-16 mx-auto mb-3 opacity-40" />
                <p className="text-sm">{t('booking.room.chatRunningLeft')}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              {/* Remote (other party) — fills the area */}
              <div ref={agora.remoteVideoRef} className="absolute inset-0 bg-black" />
              {!agora.remoteJoined && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-gray-400">
                  <div>
                    <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 text-3xl text-white">
                      {otherParty?.full_name?.charAt(0)}
                    </div>
                    <p className="text-sm">{otherParty?.full_name}{t('booking.room.waitingConnect')}</p>
                  </div>
                </div>
              )}

              {/* Local (self) — picture-in-picture, video sessions only */}
              {agora.hasVideo && (
                <div className="absolute bottom-4 right-4 w-32 h-44 md:w-40 md:h-56 rounded-xl overflow-hidden border-2 border-white/20 bg-gray-800 shadow-lg">
                  <div ref={agora.localVideoRef} className="w-full h-full" />
                  {!agora.camOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-xs">
                      {t('booking.room.cameraOff')}
                    </div>
                  )}
                </div>
              )}

              {sessionType === 'voice' && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-gray-300 pointer-events-none">
                  <div>
                    <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('booking.room.audioRunning')}</p>
                  </div>
                </div>
              )}

              {agora.error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-xs px-3 py-1.5 rounded-full">
                  {agora.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        {!isSessionEnded && (
          <div className="flex items-center justify-center gap-4 py-5 bg-gray-800">
            {sessionType !== 'chat' && (
              <button
                onClick={agora.toggleMic}
                className={cn('p-3 rounded-full', agora.micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white')}
              >
                {agora.micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
            )}
            {sessionType === 'video' && (
              <button
                onClick={agora.toggleCam}
                className={cn('p-3 rounded-full', agora.camOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white')}
              >
                {agora.camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            )}
            {isExpert && isSessionActive && (
              <button
                onClick={() => setShowEndModal(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full text-sm font-medium"
              >
                <Phone className="h-4 w-4 rotate-[135deg]" />
                {t('booking.room.endSession')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            {isSessionEnded && !isExpert ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t('booking.room.howWasSession')}</h2>
                <div className="flex gap-2 justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="text-3xl">
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-600"
                  rows={3}
                  placeholder={t('booking.room.reviewPlaceholder')}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <Button className="w-full mt-3" onClick={handleSubmitReview} disabled={rating === 0}>
                  {t('booking.room.submitReview')}
                </Button>
              </>
            ) : isExpert ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{t('booking.room.endSessionConfirm')}</h2>
                <p className="text-gray-500 text-sm mb-4">{t('booking.room.endSessionConfirmDesc')}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEndModal(false)}>{t('booking.room.cancel')}</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleEndSession}>{t('booking.room.yesEnd')}</Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{t('booking.room.sessionCompleted')}</h2>
                <p className="text-gray-500 text-sm mb-4">{t('booking.room.completedRateExpert')}</p>
                <Button className="w-full" onClick={() => router.push('/dashboard')}>{t('booking.room.goDashboard')}</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
