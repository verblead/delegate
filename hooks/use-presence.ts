"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "./use-auth";

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

export function usePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const mountedRef = useRef(false);

  // Helper function to deduplicate users by ID
  const deduplicateUsers = (users: Profile[]): Profile[] => {
    const seen = new Set();
    return users.filter(user => {
      if (seen.has(user.id)) {
        return false;
      }
      seen.add(user.id);
      return true;
    });
  };

  useEffect(() => {
    if (!user || mountedRef.current) return;
    
    mountedRef.current = true;
    setLoading(true);

    const setupPresence = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        const channel = supabase.channel('online-users', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channelRef.current = channel;

        channel
          .on('presence', { event: 'sync' }, () => {
            if (!mountedRef.current) return;
            
            const newState = channel.presenceState();
            const onlineProfiles = Object.values(newState)
              .flat()
              .map((presence: any) => presence.profile)
              .filter(Boolean);
            
            setOnlineUsers(deduplicateUsers(onlineProfiles));
            setLoading(false);
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            if (!mountedRef.current) return;
            
            setOnlineUsers(prev => {
              const newProfiles = newPresences.map((p: any) => p.profile);
              return deduplicateUsers([...prev, ...newProfiles]);
            });
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            if (!mountedRef.current) return;
            
            setOnlineUsers(prev => {
              const leftIds = leftPresences.map((p: any) => p.profile.id);
              return prev.filter(profile => !leftIds.includes(profile.id));
            });
          });

        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              profile: {
                id: user.id,
                username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
                avatar_url: profile?.avatar_url || `https://avatar.vercel.sh/${user.id}`
              }
            });
          }
        });
      } catch (error) {
        console.error('Error setting up presence:', error);
        setLoading(false);
      }
    };

    setupPresence();

    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setOnlineUsers([]);
      setLoading(false);
    };
  }, [user, supabase]);

  return { onlineUsers, loading };
}