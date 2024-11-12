"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { ActivityStreak } from '@/lib/supabase/schema';
import { useAuth } from './use-auth';

export function useStreaks() {
  const [streak, setStreak] = useState<ActivityStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      const { data, error } = await supabase
        .from('activity_streaks')
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
      .channel(`streaks:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_streaks',
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