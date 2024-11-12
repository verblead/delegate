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
      // First get all conversations
      const { data: savedConversations } = await supabase
        .from("conversations")
        .select(`
          *,
          participant:profiles!conversations_participant_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq("user_id", user.id);

      // Then get all messages to find the latest message for each conversation
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

      // First add all saved conversations
      savedConversations?.forEach(conv => {
        conversationsMap.set(conv.participant_id, {
          user_id: conv.participant_id,
          username: conv.participant.username,
          avatar_url: conv.participant.avatar_url || `https://avatar.vercel.sh/${conv.participant_id}`,
          last_message: "",
          last_message_at: conv.created_at,
          unread_count: 0
        });
      });

      // Then update with message data
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id.eq.${user?.id}`
        },
        fetchConversations
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  const addConversation = async (userId: string) => {
    if (!user) return;

    try {
      // First check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .eq("participant_id", userId)
        .single();

      if (!existing) {
        // Get user data
        const { data: userData, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", userId)
          .single();

        if (error) throw error;

        // Add to conversations table
        await supabase
          .from("conversations")
          .insert([
            {
              user_id: user.id,
              participant_id: userId
            }
          ]);

        // Also add the reverse conversation for the other user
        await supabase
          .from("conversations")
          .insert([
            {
              user_id: userId,
              participant_id: user.id
            }
          ]);

        if (userData) {
          const newConversation: Conversation = {
            user_id: userId,
            username: userData.username,
            avatar_url: userData.avatar_url || `https://avatar.vercel.sh/${userId}`,
            last_message: "",
            last_message_at: new Date().toISOString(),
            unread_count: 0
          };

          setConversations(prev => {
            if (!prev.find(c => c.user_id === userId)) {
              return [newConversation, ...prev];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Error adding conversation:", error);
      toast({
        title: "Error",
        description: "Failed to add conversation",
        variant: "destructive"
      });
    }
  };

  return { conversations, loading, addConversation, refreshConversations: fetchConversations };
}