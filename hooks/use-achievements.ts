"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from './use-supabase';
import { useAuth } from './use-auth';
import { Achievement, UserAchievement } from '@/lib/types/achievements';

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*');

        if (achievementsError) throw achievementsError;
        setAchievements(achievementsData || []);

        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievement:achievements(*)
          `)
          .eq('user_id', user.id);

        if (userAchievementsError) throw userAchievementsError;
        setUserAchievements(userAchievementsData || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user, supabase]);

  return {
    achievements,
    userAchievements,
    loading
  };
}