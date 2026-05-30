import { NextResponse } from 'next/server';
import { generateAgoraToken } from '@/lib/agora/token';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel');

  if (!channel) return NextResponse.json({ error: 'channel required' }, { status: 400 });

  if (!process.env.AGORA_APP_CERTIFICATE) {
    return NextResponse.json({ error: 'Agora not configured' }, { status: 500 });
  }

  const token = generateAgoraToken(channel, 0, 'publisher');
  return NextResponse.json({ token, appId: process.env.NEXT_PUBLIC_AGORA_APP_ID });
}
