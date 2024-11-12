"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  points: number;
  status: "open" | "in_progress" | "completed";
  created_at: string;
  created_by: string;
  volunteer_id: string | null;
  due_date: string | null;
  creator: {
    username: string;
    avatar_url: string;
  } | null;
  volunteer: {
    username: string;
    avatar_url: string;
  } | null;
}

export function useVolunteerTasks() {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        // Fetch tasks with profile information
        const { data: tasks, error: tasksError } = await supabase
          .from("volunteer_tasks")
          .select(`
            *,
            creator:created_by(username, avatar_url),
            volunteer:volunteer_id(username, avatar_url)
          `)
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profileError) {
          setIsAdmin(profile?.role === "admin");
        }

        setTasks(tasks || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel("volunteer-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "volunteer_tasks" },
        fetchTasks
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  const volunteerForTask = async (taskId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("volunteer_tasks")
        .update({
          volunteer_id: user.id,
          status: "in_progress"
        })
        .eq("id", taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error volunteering for task:", error);
      return false;
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return false;

    try {
      const { error: taskError } = await supabase
        .from("volunteer_tasks")
        .update({ status: "completed" })
        .eq("id", taskId)
        .eq("volunteer_id", user.id);

      if (taskError) throw taskError;

      // Award points to the volunteer
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const { error: pointsError } = await supabase
          .from("points")
          .insert({
            user_id: user.id,
            amount: task.points,
            reason: `Completed volunteer task: ${task.title}`
          });

        if (pointsError) throw pointsError;
      }

      return true;
    } catch (error) {
      console.error("Error completing task:", error);
      return false;
    }
  };

  return {
    tasks,
    loading,
    isAdmin,
    volunteerForTask,
    completeTask
  };
}