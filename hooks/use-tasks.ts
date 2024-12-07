"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface Task {
  id: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  channel_id: string;
  created_at: string;
  created_by: string;
  assigned_to: string;
  message_id: string;
}

export function useTasks(filter: "all" | "pending" | "in_progress" | "completed" = "all") {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        let query = supabase
          .from("tasks")
          .select('*')
          .eq("assigned_to", user.id);

        if (filter !== "all") {
          query = query.eq("status", filter);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        setTasks(data || []);
      } catch (error: any) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Set up realtime subscription
    const channel = supabase
      .channel("tasks-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `assigned_to=eq.${user.id}`
        },
        fetchTasks
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, filter, supabase, toast]);

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId)
        .eq("assigned_to", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Task ${status === "completed" ? "completed" : "updated"} successfully`
      });

      return true;
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    tasks,
    loading,
    updateTaskStatus
  };
}