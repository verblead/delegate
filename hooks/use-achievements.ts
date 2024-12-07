"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_url: string;
  points: number;
  requirement_type: "course_completion" | "lesson_streak" | "points_earned" | "volunteer_tasks";
  requirement_value: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        // Fetch all achievements
        const { data: achievementsData, error: achievementsError } = await supabase
          .from("achievements")
          .select("*")
          .order("points");

        if (achievementsError) throw achievementsError;

        // Fetch user's unlocked achievements
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from("user_achievements")
          .select(`
            *,
            achievement:achievements(*)
          `)
          .eq("user_id", user.id);

        if (userAchievementsError) throw userAchievementsError;

        setAchievements(achievementsData || []);
        setUserAchievements(userAchievementsData || []);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        toast({
          title: "Error",
          description: "Failed to load achievements",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();

    // Subscribe to achievement updates
    const channel = supabase
      .channel("achievements")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_achievements",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Show achievement unlocked notification
            const achievement = achievements.find(
              (a) => a.id === payload.new.achievement_id
            );
            if (achievement) {
              toast({
                title: "Achievement Unlocked! 🎉",
                description: `${achievement.title} - ${achievement.description}`,
              });
            }
            fetchAchievements();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, toast, achievements]);

  const checkAchievements = async () => {
    if (!user) return;

    try {
      await supabase.rpc("check_achievements", {
        p_user_id: user.id,
      });
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  return {
    achievements,
    userAchievements,
    loading,
    checkAchievements,
  };
}