"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  username: string;
  avatar_url: string;
  channel_name: string;
  status: string;
  last_seen: string;
}

export function useChannelMembers(channelId: string) {
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !channelId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        console.log('Fetching members for channel:', channelId);
        
        const { data, error } = await supabase
          .from('channel_members_with_profiles')
          .select('*')
          .eq('channel_id', channelId)
          .order('role', { ascending: false }) // owners and admins first
          .order('username', { ascending: true });

        if (error) {
          console.error('Error fetching channel members:', error);
          throw error;
        }
        
        console.log('Fetched members:', data);
        setMembers(data || []);
      } catch (error) {
        console.error('Error in fetchMembers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch channel members",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to changes in channel members
    const channel = supabase
      .channel(`channel_members:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_members',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, supabase, user, toast]);

  const addMember = async (userId: string, role: 'member' | 'admin' = 'member') => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .insert([
          {
            channel_id: channelId,
            user_id: userId,
            role,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added to channel",
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member to channel",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from channel",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member from channel",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (userId: string, newRole: 'member' | 'admin') => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .update({ role: newRole })
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member role updated",
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  return {
    members,
    loading,
    addMember,
    removeMember,
    updateMemberRole,
  };
}