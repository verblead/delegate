"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Achievement, UserAchievement } from '@/lib/supabase/schema';
import { useAuth } from './use-auth';

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      // Fetch all achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      // Fetch user's unlocked achievements
      const { data: userAchievementsData } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements (*)
        `)
        .eq('user_id', user.id);

      if (achievementsData) setAchievements(achievementsData);
      if (userAchievementsData) setUserAchievements(userAchievementsData);
      setLoading(false);
    };

    fetchAchievements();

    const achievementsSubscription = supabase
      .channel(`user_achievements:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        fetchAchievements
      )
      .subscribe();

    return () => {
      achievementsSubscription.unsubscribe();
    };
  }, [user]);

  const isAchievementUnlocked = (achievementId: number) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  return {
    achievements,
    userAchievements,
    isAchievementUnlocked,
    loading
  };
}