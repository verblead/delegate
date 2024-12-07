"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Send, Mic, Camera, Share2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  user_id: string;
  meeting_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface MeetingChatProps {
  meetingId: string;
}

export function MeetingChat({ meetingId }: MeetingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("meeting_messages")
        .select(`
          *,
          profiles:profiles(username, avatar_url)
        `)
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`meeting-chat-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meeting_messages",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            supabase
              .from("meeting_messages")
              .select(`
                *,
                profiles:profiles(username, avatar_url)
              `)
              .eq("id", payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setMessages((prev) => [...prev, data]);
                  scrollToBottom();
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, meetingId, supabase]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      await supabase.from("meeting_messages").insert({
        content: newMessage,
        meeting_id: meetingId,
        user_id: user.id,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Meeting Chat</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.user_id === user?.id ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.profiles.avatar_url} />
                <AvatarFallback>
                  {message.profiles.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${
                  message.user_id === user?.id ? "items-end" : ""
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.user_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Mic className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Camera className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-muted/50"
            />
            <Button type="submit" size="icon" variant="secondary" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}