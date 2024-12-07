"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { startOfDay, endOfDay } from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  due_date: string;
  type: "task" | "volunteer";
  status: string;
  points?: number;
}

export function useCalendarEvents(
  date?: Date,
  filter: "all" | "tasks" | "volunteer" = "all"
) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !date) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const start = startOfDay(date).toISOString();
        const end = endOfDay(date).toISOString();

        // Fetch tasks
        let tasksPromise = Promise.resolve({ data: [] });
        if (filter === "all" || filter === "tasks") {
          tasksPromise = supabase
            .from("tasks")
            .select("id, title, description, status, due_date")
            .eq("assigned_to", user.id)
            .gte("due_date", start)
            .lte("due_date", end);
        }

        // Fetch volunteer tasks
        let volunteerPromise = Promise.resolve({ data: [] });
        if (filter === "all" || filter === "volunteer") {
          volunteerPromise = supabase
            .from("volunteer_tasks")
            .select("id, title, description, status, due_date, points")
            .or(`volunteer_id.eq.${user.id},status.eq.open`)
            .gte("due_date", start)
            .lte("due_date", end);
        }

        const [tasksResult, volunteerResult] = await Promise.all([
          tasksPromise,
          volunteerPromise,
        ]);

        const tasks = (tasksResult.data || []).map((task) => ({
          ...task,
          type: "task" as const,
        }));

        const volunteerTasks = (volunteerResult.data || []).map((task) => ({
          ...task,
          type: "volunteer" as const,
        }));

        setEvents([...tasks, ...volunteerTasks]);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, date, filter, supabase]);

  return { events, loading };
}