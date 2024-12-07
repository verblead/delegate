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
        // Fetch tasks
        const { data: tasks, error: tasksError } = await supabase
          .from("volunteer_tasks")
          .select('*')
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;

        // Check if user is admin
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        setIsAdmin(roles?.role === "admin");
        setTasks(tasks || []);
      } catch (error) {
        console.error("Error fetching volunteer tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [supabase, user]);

  const volunteerForTask = async (taskId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("volunteer_tasks")
        .update({
          volunteer_id: user.id,
          status: "in_progress"
        })
        .eq("id", taskId)
        .eq("status", "open");

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
      const { error } = await supabase
        .from("volunteer_tasks")
        .update({
          status: "completed"
        })
        .eq("id", taskId)
        .eq("volunteer_id", user.id)
        .eq("status", "in_progress");

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error completing task:", error);
      return false;
    }
  };

  return { tasks, loading, isAdmin, volunteerForTask, completeTask };
}