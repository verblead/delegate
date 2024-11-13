"use client";

import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users');

    const trackPresence = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      await channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const onlineProfiles = Object.values(newState)
            .flat()
            .map((presence: any) => presence.profile)
            .filter(Boolean);
          setOnlineUsers(onlineProfiles);
          setLoading(false);
        })
        .subscribe(async (status) => {
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
    };

    trackPresence();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  return { onlineUsers, loading };
}