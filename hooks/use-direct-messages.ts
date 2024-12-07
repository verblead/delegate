"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export interface Conversation {
  user_id: string;
  username: string;
  avatar_url: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export function useDirectMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: messages } = await supabase
        .from("direct_messages")
        .select(`
          *,
          sender:profiles!direct_messages_sender_id_fkey(
            id,
            username,
            avatar_url
          ),
          recipient:profiles!direct_messages_recipient_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const conversationsMap = new Map<string, Conversation>();

      messages?.forEach(message => {
        const otherUser = message.sender_id === user.id ? message.recipient : message.sender;
        const existing = conversationsMap.get(otherUser.id);
        
        if (!existing || new Date(message.created_at) > new Date(existing.last_message_at)) {
          conversationsMap.set(otherUser.id, {
            user_id: otherUser.id,
            username: otherUser.username,
            avatar_url: otherUser.avatar_url || `https://avatar.vercel.sh/${otherUser.id}`,
            last_message: message.content,
            last_message_at: message.created_at,
            unread_count: message.sender_id !== user.id && !message.read ? 1 : 0
          });
        } else if (message.sender_id !== user.id && !message.read) {
          existing.unread_count++;
        }
      });

      setConversations(Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel("direct_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `or(sender_id.eq.${user?.id},recipient_id.eq.${user?.id})`
        },
        fetchConversations
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  return { conversations, loading, refreshConversations: fetchConversations };
}