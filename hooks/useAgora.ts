'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
} from 'agora-rtc-sdk-ng';

type SessionType = 'chat' | 'voice' | 'video';

interface UseAgoraParams {
  appId: string | undefined;
  channel: string | undefined;
  token: string | undefined;
  sessionType: SessionType;
  active: boolean;
}

interface UseAgoraResult {
  localVideoRef: (el: HTMLDivElement | null) => void;
  remoteVideoRef: (el: HTMLDivElement | null) => void;
  joined: boolean;
  remoteJoined: boolean;
  micOn: boolean;
  camOn: boolean;
  toggleMic: () => void;
  toggleCam: () => void;
  error: string | null;
  hasVideo: boolean;
}

export function useAgora({ appId, channel, token, sessionType, active }: UseAgoraParams): UseAgoraResult {
  const hasVideo = sessionType === 'video';
  const usesMedia = sessionType === 'video' || sessionType === 'voice';

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const camTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localElRef = useRef<HTMLDivElement | null>(null);
  const remoteElRef = useRef<HTMLDivElement | null>(null);
  const joinedOnceRef = useRef(false);

  const [joined, setJoined] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(hasVideo);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useCallback((el: HTMLDivElement | null) => {
    localElRef.current = el;
    if (el && camTrackRef.current) camTrackRef.current.play(el);
  }, []);

  const remoteVideoRef = useCallback((el: HTMLDivElement | null) => {
    remoteElRef.current = el;
  }, []);

  useEffect(() => {
    if (!active || !usesMedia) return;
    if (!appId || !channel || !token) {
      setError('Agora credentials missing');
      return;
    }
    if (joinedOnceRef.current) return;
    joinedOnceRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        AgoraRTC.setLogLevel(4); // errors only
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (remoteUser: IAgoraRTCRemoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          setRemoteJoined(true);
          if (mediaType === 'video' && remoteElRef.current) {
            remoteUser.videoTrack?.play(remoteElRef.current);
          }
          if (mediaType === 'audio') {
            remoteUser.audioTrack?.play();
          }
        });

        client.on('user-unpublished', (_u, mediaType) => {
          if (mediaType === 'video') {
            // remote video stopped but user may still be connected via audio
          }
        });

        client.on('user-left', () => {
          if (client.remoteUsers.length === 0) setRemoteJoined(false);
        });

        // uid 0 => Agora auto-assigns a unique uid
        await client.join(appId, channel, token, 0);
        if (cancelled) return;

        const tracksToPublish: (IMicrophoneAudioTrack | ICameraVideoTrack)[] = [];

        try {
          const mic = await AgoraRTC.createMicrophoneAudioTrack();
          micTrackRef.current = mic;
          tracksToPublish.push(mic);
        } catch {
          setError('মাইক্রোফোন অ্যাক্সেস পাওয়া যায়নি');
        }

        if (hasVideo) {
          try {
            const cam = await AgoraRTC.createCameraVideoTrack();
            camTrackRef.current = cam;
            tracksToPublish.push(cam);
            if (localElRef.current) cam.play(localElRef.current);
          } catch {
            setError('ক্যামেরা অ্যাক্সেস পাওয়া যায়নি');
          }
        }

        if (tracksToPublish.length > 0) {
          await client.publish(tracksToPublish);
        }
        if (!cancelled) setJoined(true);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'সংযোগ ব্যর্থ হয়েছে');
        joinedOnceRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      micTrackRef.current?.close();
      camTrackRef.current?.close();
      micTrackRef.current = null;
      camTrackRef.current = null;
      clientRef.current?.removeAllListeners();
      clientRef.current?.leave().catch(() => {});
      clientRef.current = null;
      joinedOnceRef.current = false;
      setJoined(false);
      setRemoteJoined(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, usesMedia, appId, channel, token, hasVideo]);

  const toggleMic = useCallback(() => {
    const next = !micOn;
    setMicOn(next);
    micTrackRef.current?.setEnabled(next).catch(() => {});
  }, [micOn]);

  const toggleCam = useCallback(() => {
    if (!hasVideo) return;
    const next = !camOn;
    setCamOn(next);
    camTrackRef.current?.setEnabled(next).catch(() => {});
  }, [camOn, hasVideo]);

  return {
    localVideoRef,
    remoteVideoRef,
    joined,
    remoteJoined,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    error,
    hasVideo,
  };
}
