'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestVideoPage() {
  const [channel, setChannel] = useState('test-room');
  const [joined, setJoined] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const micTrackRef = useRef<any>(null);
  const camTrackRef = useRef<any>(null);

  const join = useCallback(async () => {
    setError('');
    setStatus('Fetching token...');
    try {
      const res = await fetch(`/api/test-agora-token?channel=${encodeURIComponent(channel)}`);
      const { token, appId, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);

      setStatus('Loading Agora SDK...');
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      AgoraRTC.setLogLevel(4);

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (remoteUser: any, mediaType: any) => {
        await client.subscribe(remoteUser, mediaType);
        setRemoteJoined(true);
        if (mediaType === 'video' && remoteRef.current) {
          remoteUser.videoTrack?.play(remoteRef.current);
        }
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
        }
      });

      client.on('user-left', () => {
        if (client.remoteUsers.length === 0) setRemoteJoined(false);
      });

      setStatus('Joining channel...');
      await client.join(appId, channel, token, 0);

      setStatus('Starting camera & mic...');
      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      micTrackRef.current = mic;

      const cam = await AgoraRTC.createCameraVideoTrack();
      camTrackRef.current = cam;

      if (localRef.current) cam.play(localRef.current);
      await client.publish([mic, cam]);

      setJoined(true);
      setStatus('');
    } catch (err: any) {
      setError(err.message || 'Failed to join');
      setStatus('');
    }
  }, [channel]);

  const leave = useCallback(async () => {
    micTrackRef.current?.close();
    camTrackRef.current?.close();
    micTrackRef.current = null;
    camTrackRef.current = null;
    await clientRef.current?.leave().catch(() => {});
    clientRef.current = null;
    setJoined(false);
    setRemoteJoined(false);
    setMicOn(true);
    setCamOn(true);
  }, []);

  const toggleMic = useCallback(() => {
    const next = !micOn;
    setMicOn(next);
    micTrackRef.current?.setEnabled(next);
  }, [micOn]);

  const toggleCam = useCallback(() => {
    const next = !camOn;
    setCamOn(next);
    camTrackRef.current?.setEnabled(next);
  }, [camOn]);

  useEffect(() => () => { leave(); }, [leave]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-2">Video Call Test</h1>
      <p className="text-gray-400 text-sm mb-6">
        Two people on the same channel name will be connected live
      </p>

      {!joined ? (
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Channel name</label>
            <Input
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="e.g. test-room"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Share this name with the other person — both must use the same channel
            </p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {status && <p className="text-blue-400 text-sm">{status}</p>}
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={join} disabled={!channel}>
            Join Call
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-4">
          {/* Videos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
              <div ref={localRef} className="w-full h-full" />
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                You (local)
              </span>
            </div>
            <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <div ref={remoteRef} className="w-full h-full" />
              {!remoteJoined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Waiting for other person to join...</p>
                </div>
              )}
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                Remote
              </span>
            </div>
          </div>

          {/* Channel info */}
          <div className="text-center text-sm text-gray-400">
            Channel: <span className="font-mono text-white">{channel}</span>
            {remoteJoined && <span className="ml-3 text-green-400">● Connected</span>}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMic}
              className={`rounded-full w-12 h-12 ${!micOn ? 'bg-red-600 border-red-600 hover:bg-red-700' : 'border-gray-600'}`}
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCam}
              className={`rounded-full w-12 h-12 ${!camOn ? 'bg-red-600 border-red-600 hover:bg-red-700' : 'border-gray-600'}`}
            >
              {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button
              onClick={leave}
              className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
              size="icon"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
