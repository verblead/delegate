"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface TaskMessage {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export function useTaskMessages(taskId: string) {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!taskId || !user) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("task_messages")
          .select(`
            *,
            sender:profiles!task_messages_sender_id_fkey(
              id,
              username,
              avatar_url
            )
          `)
          .eq("task_id", taskId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching task messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`task-messages:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_messages",
          filter: `task_id=eq.${taskId}`,
        },
        fetchMessages
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId, user, supabase, toast]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase.from("task_messages").insert({
        task_id: taskId,
        content: content.trim(),
        sender_id: user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return { messages, loading, sendMessage };
}