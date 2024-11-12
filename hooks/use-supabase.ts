"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import type { Database } from "@/lib/database.types";

export function useSupabase() {
  const [supabase] = useState(() => createClientComponentClient<Database>());

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // Handle sign out (e.g., clear local state)
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { supabase };
}