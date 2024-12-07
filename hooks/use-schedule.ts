"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type: "meeting" | "task" | "volunteer" | "other";
  location?: string;
  attendees: string[];
  created_by: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("schedule_events")
          .select("*")
          .order("start_time", { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to fetch events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    const channel = supabase
      .channel("schedule-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_events"
        },
        fetchEvents
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, toast]);

  const createEvent = async (event: Omit<ScheduleEvent, "id">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("schedule_events")
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const updateEventStatus = async (eventId: string, status: ScheduleEvent["status"]) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("schedule_events")
        .update({ status })
        .eq("id", eventId)
        .eq("created_by", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating event status:", error);
      return false;
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateEventStatus
  };
}