"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import type { Course, Module, Lesson, UserProgress } from "@/lib/types/training";

export function useTraining() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false });

        if (coursesError) throw coursesError;

        const { data: progress, error: progressError } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        setCourses(courses || []);
        setUserProgress(
          (progress || []).reduce((acc, curr) => ({
            ...acc,
            [curr.lesson_id]: curr,
          }), {})
        );
      } catch (error: any) {
        console.error("Error fetching training data:", error);
        toast({
          title: "Error",
          description: "Failed to load training courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    const channel = supabase
      .channel("training-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "courses",
        },
        fetchCourses
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${user.id}`,
        },
        fetchCourses
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, toast]);

  const getCourseModules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Error",
        description: "Failed to load course modules",
        variant: "destructive",
      });
      return [];
    }
  };

  const getLessonsByModule = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index");

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Error",
        description: "Failed to load module lessons",
        variant: "destructive",
      });
      return [];
    }
  };

  const updateProgress = async (lessonId: string, progress: number) => {
    if (!user) return;

    try {
      const status = progress >= 100 ? "completed" : "in_progress";
      const completedAt = progress >= 100 ? new Date().toISOString() : null;

      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status,
          progress_percent: progress,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setUserProgress((prev) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          status,
          progress_percent: progress,
          completed_at: completedAt,
        },
      }));
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  return {
    courses,
    userProgress,
    loading,
    getCourseModules,
    getLessonsByModule,
    updateProgress,
  };
}