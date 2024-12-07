"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity: string;
}

export function useStreaks() {
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      try {
        const { data, error } = await supabase
          .from("learning_streaks")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setStreak(data);
      } catch (error) {
        console.error("Error fetching streak:", error);
        toast({
          title: "Error",
          description: "Failed to load learning streak",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();

    const channel = supabase
      .channel("streaks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "learning_streaks",
          filter: `user_id=eq.${user.id}`,
        },
        fetchStreak
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, toast]);

  return {
    streak,
    loading,
  };
}