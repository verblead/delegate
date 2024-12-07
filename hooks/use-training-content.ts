"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface ContentProgress {
  id: string;
  progress: number;
  completed: boolean;
  last_position?: number;
  completed_at?: string;
}

interface TrainingContent {
  id: string;
  type: "video" | "document" | "slides";
  title: string;
  description?: string;
  content_url: string;
  duration?: number;
  sequence: number;
  progress?: ContentProgress;
}

export function useTrainingContent(lessonId: string) {
  const [content, setContent] = useState<TrainingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!lessonId || !user) return;

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from("training_content")
          .select(`
            *,
            progress:user_content_progress!inner(
              id,
              progress,
              completed,
              last_position,
              completed_at
            )
          `)
          .eq("lesson_id", lessonId)
          .order("sequence");

        if (error) throw error;
        setContent(data || []);
      } catch (error) {
        console.error("Error fetching training content:", error);
        toast({
          title: "Error",
          description: "Failed to load training content",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const channel = supabase
      .channel(`training-content:${lessonId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "training_content",
          filter: `lesson_id=eq.${lessonId}`,
        },
        fetchContent
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [lessonId, user, supabase, toast]);

  const updateProgress = async (
    contentId: string,
    progress: number,
    lastPosition?: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("user_content_progress").upsert({
        user_id: user.id,
        content_id: contentId,
        progress,
        last_position: lastPosition,
        completed: progress >= 100,
        completed_at: progress >= 100 ? new Date().toISOString() : null,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  return { content, loading, updateProgress };
}