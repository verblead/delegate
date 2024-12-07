"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import type { Database } from "@/lib/database.types";

export function useSupabase() {
  const [supabase] = useState(() => createClientComponentClient<Database>());
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, session });
      
      if (event === 'SIGNED_OUT') {
        // Handle sign out
        console.log('User signed out');
      } else if (event === 'SIGNED_IN') {
        // Handle sign in
        console.log('User signed in:', session?.user);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { supabase };
}