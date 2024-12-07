"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/config";
import { Message } from "@/lib/supabase/schema";
import { useAuth } from "./use-auth";

interface SearchParams {
  query: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  hasAttachments?: boolean;
  hasTasks?: boolean;
}

export function useMessageSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Message[]>([]);
  const { user } = useAuth();

  const searchMessages = useCallback(
    async (channelId: number, params: SearchParams) => {
      if (!user) return;

      setLoading(true);
      try {
        let query = supabase
          .from("messages")
          .select(
            `
            *,
            attachments (*),
            task (*)
          `
          )
          .eq("channel_id", channelId)
          .order("created_at", { ascending: false });

        if (params.query) {
          query = query.ilike("content", `%${params.query}%`);
        }

        if (params.dateRange) {
          query = query
            .gte("created_at", params.dateRange.from.toISOString())
            .lte("created_at", params.dateRange.to.toISOString());
        }

        if (params.hasAttachments) {
          query = query.not("attachments", "is", null);
        }

        if (params.hasTasks) {
          query = query.not("task", "is", null);
        }

        const { data, error } = await query;

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error("Error searching messages:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    searchMessages,
    results,
    loading,
  };
}