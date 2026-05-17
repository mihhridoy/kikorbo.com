import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('role, id').eq('id', data.user.id).single();

      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email!,
          avatar_url: data.user.user_metadata?.avatar_url,
          role: 'user',
        });
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      }

      const role = profile.role;
      if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin));
      if (role === 'expert') return NextResponse.redirect(new URL('/expert/dashboard', requestUrl.origin));
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
}
