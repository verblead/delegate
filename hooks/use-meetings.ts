"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface Meeting {
  id: string;
  title: string;
  description: string;
  host_id: string;
  room_code: string;
  status: "waiting" | "in_progress" | "ended";
  type: "audio" | "video" | "screen_share";
  is_private: boolean;
  max_participants: number;
  current_participants: number;
  started_at: string;
  host: {
    username: string;
    avatar_url: string;
  };
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchMeetings = async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select(`
          *,
          host:profiles!meetings_host_id_fkey(username, avatar_url)
        `)
        .or(`status.eq.waiting,status.eq.in_progress`)
        .order("started_at", { ascending: false });

      if (!error && data) {
        setMeetings(data);
      }
      setLoading(false);
    };

    fetchMeetings();

    const channel = supabase
      .channel("meetings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        fetchMeetings
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  const createMeeting = async (meeting: Partial<Meeting>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("meetings")
        .insert({
          ...meeting,
          host_id: user.id,
          status: "waiting",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating meeting:", error);
      return null;
    }
  };

  const joinMeeting = async (meetingId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("meeting_participants")
        .insert({
          meeting_id: meetingId,
          user_id: user.id,
        });

      if (error) throw error;

      // Update participant count
      await supabase.rpc("increment_meeting_participants", {
        p_meeting_id: meetingId,
      });

      return true;
    } catch (error) {
      console.error("Error joining meeting:", error);
      return false;
    }
  };

  const leaveMeeting = async (meetingId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("meeting_participants")
        .delete()
        .match({
          meeting_id: meetingId,
          user_id: user.id,
        });

      if (error) throw error;

      // Update participant count
      await supabase.rpc("decrement_meeting_participants", {
        p_meeting_id: meetingId,
      });

      return true;
    } catch (error) {
      console.error("Error leaving meeting:", error);
      return false;
    }
  };

  const endMeeting = async (meetingId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("meetings")
        .update({ status: "ended" })
        .eq("id", meetingId)
        .eq("host_id", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error ending meeting:", error);
      return false;
    }
  };

  return {
    meetings,
    loading,
    createMeeting,
    joinMeeting,
    leaveMeeting,
    endMeeting,
  };
}