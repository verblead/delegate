"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { useAuth } from './use-auth';
import { usePoints } from './use-points';
import { useAchievements } from './use-achievements';
import { useStreaks } from './use-streaks';

export function useGamification() {
  const { user } = useAuth();
  const { points, totalPoints } = usePoints();
  const { achievements, userAchievements } = useAchievements();
  const { streak } = useStreaks();

  useEffect(() => {
    if (!user) return;

    // Listen for point changes to trigger achievement checks
    const pointsChannel = supabase
      .channel(`points:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'points',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // Trigger achievement check on the server
          await supabase.rpc('check_achievements', { user_id: user.id });
        }
      )
      .subscribe();

    return () => {
      pointsChannel.unsubscribe();
    };
  }, [user]);

  const awardPoints = async (amount: number, reason: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('points')
      .insert([
        {
          user_id: user.id,
          amount,
          reason,
        },
      ]);

    if (error) {
      console.error('Error awarding points:', error);
    }
  };

  return {
    points,
    totalPoints,
    achievements,
    userAchievements,
    streak,
    awardPoints,
  };
}