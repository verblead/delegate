"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  avatar_url: string | null;
  members: { count: number }[];
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchChannels = async () => {
      try {
        console.log('Fetching channels for user:', user.id);
        
        // First, fetch channels
        const { data: channelsData, error: channelsError } = await supabase
          .from('channels')
          .select('*')
          .order('created_at', { ascending: true });

        if (channelsError) {
          console.error('Error fetching channels:', channelsError);
          throw channelsError;
        }

        if (!channelsData) {
          console.log('No channels found');
          setChannels([]);
          setLoading(false);
          return;
        }

        // Then, fetch member counts for each channel
        const channelsWithCounts = await Promise.all(
          channelsData.map(async (channel) => {
            const { count, error: countError } = await supabase
              .from('channel_members')
              .select('*', { count: 'exact', head: true })
              .eq('channel_id', channel.id);

            if (countError) {
              console.error('Error fetching member count for channel', channel.id, countError);
              return { ...channel, members: [{ count: 0 }] };
            }

            return { ...channel, members: [{ count: count || 0 }] };
          })
        );

        console.log('Fetched channels with counts:', channelsWithCounts);
        setChannels(channelsWithCounts);
      } catch (error) {
        console.error('Error in fetchChannels:', error);
        toast({
          title: "Error",
          description: "Failed to fetch channels. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('channels-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'channels' },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchChannels();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, toast]);

  const createChannel = async (name: string, description?: string) => {
    if (!user) throw new Error("Must be logged in to create a channel");

    try {
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert({
          name,
          description,
          created_by: user.id,
          is_private: false
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      return channel;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  };

  return {
    channels,
    loading,
    createChannel
  };
}