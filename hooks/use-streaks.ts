"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from './use-auth';

interface LearningStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity: string;
}

export function useStreaks() {
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      const { data, error } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setStreak(data);
      }
      setLoading(false);
    };

    fetchStreak();

    const streakSubscription = supabase
      .channel(`learning_streaks:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_streaks',
          filter: `user_id=eq.${user.id}`
        },
        fetchStreak
      )
      .subscribe();

    return () => {
      streakSubscription.unsubscribe();
    };
  }, [user]);

  return {
    streak,
    loading
  };
}