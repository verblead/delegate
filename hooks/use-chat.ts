"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";
import { ChannelMessage, BaseMessage } from '@/lib/types';

export function useChat(channelId: string) {
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fetchMessages = async () => {
    if (!channelId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            username,
            avatar_url
          ),
          attachments:message_attachments(
            id,
            file_name,
            file_type,
            file_size,
            url
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      if (data) {
        console.log('Fetched messages:', data);
        const transformedMessages: BaseMessage[] = data.map(message => ({
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          sender: {
            id: message.sender.id,
            username: message.sender.username,
            avatar_url: message.sender.avatar_url
          },
          attachments: message.attachments
        }));
        setMessages(transformedMessages);
      }
    } catch (error: any) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        }, 
        fetchMessages
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelId, user, supabase]);

  return {
    messages,
    loading,
    sendMessage: async (content: string, attachments?: File[]) => {
      if (!user || !content.trim()) return;
      
      try {
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert({
            content,
            channel_id: channelId,
            sender_id: user.id,
          })
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(
              id,
              username,
              avatar_url
            )
          `)
          .single();

        if (messageError) throw messageError;

        // Handle attachments if present
        if (attachments?.length && message) {
          // ... attachment handling code ...
        }
      } catch (error: any) {
        console.error('Error sending message:', error);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };
}