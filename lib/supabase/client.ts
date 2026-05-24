import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const emptyResult = { data: [], error: null };
    const nullResult = { data: null, error: null };
    // Chainable stub — every builder method returns itself so the full query chain never throws
    const queryBuilder: any = {
      select: () => queryBuilder,
      eq: () => queryBuilder,
      neq: () => queryBuilder,
      gte: () => queryBuilder,
      lte: () => queryBuilder,
      order: () => queryBuilder,
      limit: async () => emptyResult,
      single: async () => nullResult,
      insert: async () => nullResult,
      update: async () => nullResult,
      delete: async () => nullResult,
      then: (resolve: any) => Promise.resolve(emptyResult).then(resolve),
    };
    return {
      from: () => queryBuilder,
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
        signUp: async () => nullResult,
        signInWithPassword: async () => nullResult,
        signInWithOAuth: async () => nullResult,
        resetPasswordForEmail: async () => nullResult,
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {},
    } as any;
  }
  return createClientComponentClient();
}
