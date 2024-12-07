"use client";

import { useSupabase } from "@/components/providers/supabase-provider";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

export function useUser(userId: string | undefined | null) {
  const { supabase } = useSupabase();
  const [data, setData] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id, email:auth_email, user_metadata:metadata")
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        setData(userData || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch user"));
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, supabase]);

  return { data, error, loading };
}
