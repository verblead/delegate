"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  event_type: "meeting" | "task" | "volunteer" | "other";
  attendees: string[];
  created_by: string;
  color?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  reminder_time?: string;
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Error fetching events",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: Omit<CalendarEvent, "id" | "created_by">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          ...event,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setEvents([...events, data]);
      return data;
    } catch (error) {
      toast({
        title: "Error creating event",
        description: "Please try again later",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setEvents(events.map(event => event.id === id ? data : event));
      return data;
    } catch (error) {
      toast({
        title: "Error updating event",
        description: "Please try again later",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setEvents(events.filter(event => event.id !== id));
      return true;
    } catch (error) {
      toast({
        title: "Error deleting event",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refresh: fetchEvents,
  };
}
