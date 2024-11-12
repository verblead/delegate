"use client";

import { Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useEffect, useState } from "react";

interface MessageListProps {
  messages: Message[];
}

interface UserProfile {
  username: string;
  avatar_url: string;
  email: string;
}

export function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = [...new Set(messages.map(m => m.sender_id))];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .in('id', userIds);

      if (!error && data) {
        const profiles = data.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile
        }), {});
        setUserProfiles(profiles);
      }
    };

    if (messages.length > 0) {
      fetchProfiles();
    }
  }, [messages, supabase]);

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id === user?.id;
        const profile = userProfiles[message.sender_id];
        const displayName = profile?.username || profile?.email?.split('@')[0] || 'Unknown User';
        
        return (
          <div 
            key={message.id} 
            className={cn(
              "flex items-start gap-3",
              isCurrentUser && "flex-row-reverse"
            )}
          >
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex flex-col",
              isCurrentUser && "items-end"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className={cn(
                "rounded-2xl px-4 py-2 max-w-[80%] break-words",
                isCurrentUser 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}