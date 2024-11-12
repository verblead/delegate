"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  is_private: boolean;
  created_at: string;
  created_by: string;
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("channels")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;
        setChannels(data || []);
      } catch (error) {
        console.error("Error fetching channels:", error);
        toast({
          title: "Error",
          description: "Failed to fetch channels",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();

    const channelsSubscription = supabase
      .channel("channels")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channels",
        },
        fetchChannels
      )
      .subscribe();

    return () => {
      channelsSubscription.unsubscribe();
    };
  }, [user, supabase, toast]);

  const createChannel = async (name: string, description?: string, isPrivate: boolean = false) => {
    if (!user) return null;

    try {
      const { data: channel, error } = await supabase
        .from("channels")
        .insert({
          name,
          description,
          is_private: isPrivate,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Channel created successfully",
      });

      return channel;
    } catch (error: any) {
      console.error("Error creating channel:", error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    channels,
    loading,
    createChannel
  };
}