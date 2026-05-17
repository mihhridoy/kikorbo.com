import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) } ) }),
      auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), signOut: async () => {}, signInWithPassword: async () => ({ data: null, error: { message: 'No Supabase config' } }), signInWithOAuth: async () => {} },
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {},
    } as any;
  }
  return createClientComponentClient();
}
