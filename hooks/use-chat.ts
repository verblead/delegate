"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { Message } from "@/lib/types";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";

export function useChat(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!channelId || !user) return;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data) setMessages(data);
      } catch (error: any) {
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelId, supabase, toast, user]);

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!user) return;
    
    try {
      let uploadedFiles = [];
      
      if (attachments?.length) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${channelId}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
          
          uploadedFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            path: filePath
          });
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          channel_id: channelId,
          sender_id: user.id,
          attachments: uploadedFiles
        });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
}