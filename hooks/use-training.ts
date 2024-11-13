"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "./use-auth";

interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed_lessons: number;
  last_accessed: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  total_lessons: number;
  categories: string[];
}

interface Activity {
  id: string;
  user_id: string;
  course: { title: string };
  lesson: { title: string };
  activity_type: "started" | "completed" | "resumed";
  created_at: string;
}

interface LearningStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity: string;
}

export function useTraining() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const [
          { data: coursesData },
          { data: progressData },
          { data: activitiesData },
          { data: streakData }
        ] = await Promise.all([
          supabase.from('training_courses').select('*'),
          supabase.from('user_course_progress').select('*').eq('user_id', user.id),
          supabase
            .from('user_course_activity')
            .select('*, course:training_courses(*), lesson:training_lessons(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('learning_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single()
        ]);

        setCourses(coursesData || []);
        setUserProgress(
          (progressData || []).reduce((acc, progress) => ({
            ...acc,
            [progress.course_id]: progress
          }), {})
        );
        setRecentActivities(activitiesData || []);
        setStreak(streakData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const progressSubscription = supabase
      .channel('user_progress_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    const activitySubscription = supabase
      .channel('activity_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_course_activity',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    // Add streak subscription
    const streakSubscription = supabase
      .channel('streak_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_streaks',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      progressSubscription.unsubscribe();
      activitySubscription.unsubscribe();
      streakSubscription.unsubscribe();
    };
  }, [user]);

  return {
    courses,
    userProgress,
    recentActivities,
    streak,
    loading
  };
}