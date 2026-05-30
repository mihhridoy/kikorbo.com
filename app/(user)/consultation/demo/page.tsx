'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { DEMO_EXPERT_REPLIES } from '@/lib/i18n/dicts/booking';

interface ChatMessage {
  id: string;
  sender: 'me' | 'expert' | 'system';
  content: string;
  time: string;
}

function DemoConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();

  const expertName = searchParams.get('expert') || t('booking.demo.defaultExpert');
  const sessionType = (searchParams.get('sessionType') || 'video') as 'video' | 'voice' | 'chat';
  const duration = parseInt(searchParams.get('duration') || '30', 10);
  const packageTitle = searchParams.get('package') || t('booking.demo.defaultPackage');

  function now() {
    return new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', sender: 'system', content: t('booking.demo.sessionStarted'), time: now() },
  ]);
  const [message, setMessage] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [streamError, setStreamError] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start local camera/mic
  useEffect(() => {
    if (sessionType === 'chat') return;

    const constraints = sessionType === 'video'
      ? { video: true, audio: true }
      : { video: false, audio: true };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        streamRef.current = stream;
        if (localVideoRef.current && sessionType === 'video') {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        setStreamError(t('booking.demo.streamError'));
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [sessionType]);

  // Timer countdown
  useEffect(() => {
    if (sessionEnded) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleEndSession();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionEnded]);

  // Toggle mic track
  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = micOn; });
  }, [micOn]);

  // Toggle video track
  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = camOn; });
  }, [camOn]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEndSession = useCallback(() => {
    setSessionEnded(true);
    setShowEndModal(true);
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleSendMessage = () => {
    if (!message.trim() || sessionEnded) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'me', content: message.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');

    // Simulate expert reply after 1.5–3s
    const delay = 1500 + Math.random() * 1500;
    replyTimeoutRef.current = setTimeout(() => {
      const replies = DEMO_EXPERT_REPLIES[lang];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'expert', content: reply, time: now() }]);
    }, delay);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = timeLeft <= 300; // last 5 min

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Chat Panel */}
      <div className={cn('flex flex-col w-full md:w-80 bg-white border-r border-gray-200', showChat ? 'flex' : 'hidden md:flex')}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
            {expertName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{expertName}</p>
            <p className="text-xs text-gray-400">{sessionEnded ? t('booking.demo.sessionEnded') : t('booking.demo.sessionActive')}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{msg.content}</span>
                </div>
              );
            }
            const isMe = msg.sender === 'me';
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

        <div className="border-t border-gray-100 p-3 flex gap-2">
          <Input
            placeholder={sessionEnded ? t('booking.demo.inputEnded') : t('booking.demo.inputPlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={sessionEnded}
            className="text-sm"
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!message.trim() || sessionEnded}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800">
          <div className="text-white text-sm font-medium">{packageTitle} · {sessionType.toUpperCase()}</div>
          <div className={cn('text-2xl font-bold font-mono', isWarning ? 'text-red-400 animate-pulse' : 'text-white')}>
            {formatted}
            {isWarning && <span className="ml-2 text-xs font-normal">{t('booking.demo.warningEnding')}</span>}
          </div>
          <button onClick={() => setShowChat(!showChat)} className="text-gray-400 hover:text-white md:hidden">
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>

        {/* Video area */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
          {sessionEnded ? (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold">{t('booking.demo.sessionCompleted')}</h2>
              <p className="text-gray-400 text-sm mt-1">{t('booking.demo.thanks')}</p>
            </div>
          ) : sessionType === 'chat' ? (
            <div className="text-center text-gray-400">
              <MessageSquare className="h-16 w-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('booking.demo.chatRunningLeft')}</p>
            </div>
          ) : sessionType === 'video' ? (
            <div className="w-full h-full relative">
              {/* Remote video placeholder (expert) */}
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3 text-4xl font-bold">
                    {expertName.charAt(0)}
                  </div>
                  <p className="text-sm text-gray-400">{expertName}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('booking.demo.demoConnected')}</p>
                </div>
              </div>
              {/* Local video (self) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden bg-gray-700 border-2 border-gray-600">
                {camOn ? (
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              {streamError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-lg max-w-xs text-center">
                  {streamError}
                </div>
              )}
            </div>
          ) : (
            // Voice call
            <div className="text-center text-white">
              <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 text-4xl font-bold animate-pulse">
                {expertName.charAt(0)}
              </div>
              <p className="text-lg font-medium">{expertName}</p>
              <p className="text-sm text-gray-400 mt-1">{t('booking.demo.voiceRunning')}</p>
              {streamError && <p className="text-xs text-red-400 mt-2">{streamError}</p>}
            </div>
          )}
        </div>

        {/* Controls */}
        {!sessionEnded && (
          <div className="flex items-center justify-center gap-4 py-5 bg-gray-800">
            <button
              onClick={() => setMicOn(!micOn)}
              className={cn('p-3 rounded-full', micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white')}
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            {sessionType === 'video' && (
              <button
                onClick={() => setCamOn(!camOn)}
                className={cn('p-3 rounded-full', camOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white')}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => setShowEndModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full text-sm font-medium"
            >
              <Phone className="h-4 w-4 rotate-[135deg]" />
              {t('booking.demo.endSession')}
            </button>
          </div>
        )}
      </div>

      {/* End/Review Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            {!sessionEnded ? (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{t('booking.demo.endSessionConfirm')}</h2>
                <p className="text-gray-500 text-sm mb-4">{t('booking.demo.endSessionConfirmDesc')}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEndModal(false)}>{t('booking.demo.cancel')}</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleEndSession}>{t('booking.demo.yesEnd')}</Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t('booking.demo.howWasSession')}</h2>
                <div className="flex gap-2 justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="text-3xl">
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-600"
                  rows={3}
                  placeholder={t('booking.demo.reviewPlaceholder')}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <Button
                  className="w-full mt-3"
                  onClick={() => router.push('/dashboard')}
                  disabled={rating === 0}
                >
                  {t('booking.demo.submitReview')}
                </Button>
                <Button variant="outline" className="w-full mt-2" onClick={() => router.push('/dashboard')}>
                  {t('booking.demo.skip')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DemoLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center text-white">
        <div className="h-10 w-10 rounded-xl bg-primary-600 animate-pulse mx-auto mb-3" />
        <p className="text-gray-400">{t('booking.demo.loading')}</p>
      </div>
    </div>
  );
}

export default function DemoConsultationPage() {
  return (
    <Suspense fallback={<DemoLoadingFallback />}>
      <DemoConsultationContent />
    </Suspense>
  );
}
