"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from './use-supabase';
import { useAuth } from './use-auth';

interface UserPresence {
  id: string;
  username: string;
  avatar_url: string;
  status: string;
  updated_at: string;
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            status: 'online',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating presence:', error);
        }
      } catch (error) {
        console.error('Error in updatePresence:', error);
      }
    };

    const fetchOnlineUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, status, updated_at')
          .not('id', 'eq', user.id)
          .eq('status', 'online')
          .gte(
            'updated_at',
            new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes threshold
          );

        if (error) {
          console.error('Error fetching online users:', error);
          return;
        }

        if (data) {
          setOnlineUsers(data);
        }
      } catch (error) {
        console.error('Error in fetchOnlineUsers:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial presence update
    updatePresence();
    fetchOnlineUsers();

    // Set up realtime subscription
    const channel = supabase.channel('presence-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'status=eq.online'
        },
        () => fetchOnlineUsers()
      )
      .subscribe();

    // Keep presence alive
    const presenceInterval = setInterval(() => {
      updatePresence();
      fetchOnlineUsers();
    }, 30000);

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence();
        fetchOnlineUsers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      channel.unsubscribe();
      clearInterval(presenceInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Set offline when leaving
      supabase
        .from('profiles')
        .update({ 
          status: 'offline',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    };
  }, [supabase, user]);

  return { onlineUsers, loading };
}