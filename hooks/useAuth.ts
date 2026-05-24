'use client';

import { useEffect } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

const DEMO_LABELS: Record<string, string> = {
  user: 'Demo User',
  expert: 'Demo Expert',
  admin: 'Demo Admin',
};

function getDemoCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^|;\s*)demo_role=([^;]+)/);
  return match ? match[2] : null;
}

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, reset } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const demoRole = getDemoCookie();
    if (demoRole) {
      // Re-hydrate demo session from cookie on every mount — skip Supabase listener
      setUser({
        id: `demo-${demoRole}`,
        email: `${demoRole}@demo.poramorshoo.com`,
        app_metadata: {},
        user_metadata: { full_name: DEMO_LABELS[demoRole] ?? 'Demo User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any);
      setProfile({
        id: `demo-${demoRole}`,
        full_name: DEMO_LABELS[demoRole] ?? 'Demo User',
        username: `demo_${demoRole}`,
        email: `${demoRole}@demo.poramorshoo.com`,
        phone: null,
        avatar_url: null,
        role: demoRole as any,
        is_banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        reset();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    document.cookie = 'demo_role=; path=/; max-age=0';
    await supabase.auth.signOut();
    reset();
  };

  return { user, profile, loading, signOut };
}
