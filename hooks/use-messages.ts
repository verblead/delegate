"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  sender: {
    username: string;
    avatar_url: string;
  };
}

export function useMessages(recipientId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!user || !recipientId) return;

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:sender_id(username, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data);
        
        // Mark messages as read
        const unreadMessages = data.filter(m => 
          m.recipient_id === user.id && !m.read
        );

        if (unreadMessages.length > 0) {
          await supabase
            .from('direct_messages')
            .update({ read: true })
            .in('id', unreadMessages.map(m => m.id));
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`messages:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${user?.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user?.id}))`
        },
        fetchMessages
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, recipientId, supabase]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          content,
          sender_id: user.id,
          recipient_id: recipientId,
          read: false
        })
        .select(`
          *,
          sender:sender_id(username, avatar_url)
        `)
        .single();

      if (error) throw error;

      if (data) {
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  return { messages, loading, sendMessage };
}