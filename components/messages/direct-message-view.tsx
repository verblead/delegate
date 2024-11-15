"use client";

import { useMessages } from "@/hooks/use-messages";
import { useSupabase } from "@/hooks/use-supabase";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/use-auth";
import { DirectMessageInput } from "../chat/direct-message-input";
import { MessageAttachments } from "../chat/message-attachments";

interface DirectMessageViewProps {
  userId: string;
  onMessageSent?: () => void;
}

interface Recipient {
  username: string;
  avatar_url: string;
}

export function DirectMessageView({ userId, onMessageSent }: DirectMessageViewProps) {
  const { messages, loading, sendMessage } = useMessages(userId);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const { supabase } = useSupabase();
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecipient = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .single();

      if (data) {
        setRecipient(data);
      }
    };

    fetchRecipient();
  }, [userId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    
    try {
      await sendMessage(content, files || attachments);
      setAttachments([]);
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {recipient && (
        <div className="h-14 border-b px-4 flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={recipient.avatar_url} />
            <AvatarFallback>
              {recipient.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold">@{recipient.username}</span>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender_id === currentUser?.id ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.avatar_url} />
                <AvatarFallback>
                  {message.sender.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${
                  message.sender_id === currentUser?.id ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender_id === currentUser?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
                {message.attachments && message.attachments.length > 0 && (
                  <MessageAttachments attachments={message.attachments} />
                )}
                <span className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <DirectMessageInput 
          recipientId={userId}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}