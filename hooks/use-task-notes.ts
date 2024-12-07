"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface TaskNote {
  id: string;
  content: string;
  created_at: string;
  created_by: {
    username: string;
    avatar_url: string;
  };
}

export function useTaskNotes(taskId: string) {
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!taskId || !user) return;

    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from("task_notes")
          .select(`
            *,
            created_by:profiles!task_notes_created_by_fkey(
              username,
              avatar_url
            )
          `)
          .eq("task_id", taskId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error("Error fetching task notes:", error);
        toast({
          title: "Error",
          description: "Failed to load task notes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();

    const channel = supabase
      .channel(`task-notes:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_notes",
          filter: `task_id=eq.${taskId}`,
        },
        fetchNotes
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId, user, supabase, toast]);

  const addNote = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase.from("task_notes").insert({
        task_id: taskId,
        content: content.trim(),
        created_by: user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  return { notes, loading, addNote };
}