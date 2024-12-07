import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export const createServerClient = () => {
  const cookieStore = cookies();
  
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore,
    options: {
      db: {
        schema: 'public'
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  });
};