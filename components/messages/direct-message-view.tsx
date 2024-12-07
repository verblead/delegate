"use client";

import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectMessageInput } from "./direct-message-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DirectMessageViewProps {
  recipientId: string;
}

export function DirectMessageView({ recipientId }: DirectMessageViewProps) {
  const { messages, loading: messagesLoading, sendMessage } = useMessages(recipientId);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [recipientProfile, setRecipientProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecipientProfile = async () => {
      if (!recipientId) return;

      try {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', recipientId)
          .single();

        if (error) throw error;
        setRecipientProfile(data);
      } catch (error) {
        console.error('Error fetching recipient profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchRecipientProfile();
  }, [recipientId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loadingProfile || messagesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!recipientProfile) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center sticky top-0 bg-background z-10">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage
            src={recipientProfile.avatar_url || `https://avatar.vercel.sh/${recipientProfile.id}`}
            alt={recipientProfile.username}
          />
          <AvatarFallback>
            {recipientProfile.username?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">@{recipientProfile.username}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2 max-w-[80%]",
                message.sender_id === recipientProfile.id
                  ? "mr-auto"
                  : "ml-auto flex-row-reverse"
              )}
            >
              <Avatar className="h-8 w-8 mt-0.5">
                <AvatarImage
                  src={
                    message.sender_avatar_url ||
                    `https://avatar.vercel.sh/${message.sender_id}`
                  }
                  alt={message.sender_username}
                />
                <AvatarFallback>
                  {message.sender_username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  message.sender_id === recipientProfile.id
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {message.content}
                <span className="text-xs text-muted-foreground ml-2">
                  {format(new Date(message.created_at), 'p')}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 sticky bottom-0 bg-background">
        <DirectMessageInput recipientId={recipientId} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}