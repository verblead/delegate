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
        const { data, error } = await supabase
          .from('channel_members_with_profiles')
          .select('*')
          .eq('channel_id', channelId);

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching channel members:', error);
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

    const membersSubscription = supabase
      .channel(`channel-members-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_members',
          filter: `channel_id=eq.${channelId}`
        },
        fetchMembers
      )
      .subscribe();

    return () => {
      membersSubscription.unsubscribe();
    };
  }, [user, channelId, supabase, toast]);

  const addMember = async (userId: string, role: 'admin' | 'member' = 'member') => {
    if (!user || !channelId) return null;

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
          role
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error adding channel member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeMember = async (userId: string) => {
    if (!user || !channelId) return false;

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .match({ channel_id: channelId, user_id: userId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      return true;
    } catch (error) {
      console.error('Error removing channel member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateMemberRole = async (userId: string, newRole: 'admin' | 'member') => {
    if (!user || !channelId) return false;

    try {
      const { error } = await supabase
        .from('channel_members')
        .update({ role: newRole })
        .match({ channel_id: channelId, user_id: userId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member role updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    members,
    loading,
    addMember,
    removeMember,
    updateMemberRole
  };
}