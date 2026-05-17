import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export function generateAgoraToken(
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber'
): string {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
  const expirationTime = 3600; // 1 hour

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
    Math.floor(Date.now() / 1000) + expirationTime
  );
}
