import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  const userProtected = ['/dashboard', '/bookings', '/consultation', '/wallet', '/messages', '/settings'];
  const isUserProtected = userProtected.some((p) => path.startsWith(p));
  if (isUserProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (path.startsWith('/expert/')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (profile?.role !== 'expert' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (path.startsWith('/admin/')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/expert/:path*',
    '/admin/:path*',
    '/bookings/:path*',
    '/consultation/:path*',
    '/wallet/:path*',
    '/messages/:path*',
    '/settings/:path*',
  ],
};
