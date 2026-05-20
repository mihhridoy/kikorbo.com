import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const noConfig = { data: null, error: { message: 'Supabase not configured' } };
    return {
      from: () => ({ select: () => ({ eq: () => ({ single: async () => noConfig }) }) }),
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
        signUp: async () => noConfig,
        signInWithPassword: async () => noConfig,
        signInWithOAuth: async () => noConfig,
        resetPasswordForEmail: async () => noConfig,
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {},
    } as any;
  }
  return createClientComponentClient();
}
