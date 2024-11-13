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
  attachments: Attachment[];
}

export function useMessages(recipientId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:sender_id(username, avatar_url),
          attachments:direct_message_attachments(
            id,
            file_name,
            file_type,
            file_size,
            url
          )
        `)
        .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!user || (!content.trim() && (!attachments || attachments.length === 0))) return;

    try {
      // First insert the message
      const { data: message, error: messageError } = await supabase
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

      if (messageError) throw messageError;

      // Handle attachments if any
      let uploadedAttachments = [];
      if (attachments?.length && message) {
        uploadedAttachments = await Promise.all(
          attachments.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${recipientId}/${Date.now()}.${fileExt}`;
            
            // Upload file
            const { error: uploadError } = await supabase.storage
              .from('direct-message-attachments')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('direct-message-attachments')
              .getPublicUrl(filePath);

            // Create attachment record
            const { data: attachment, error: attachmentError } = await supabase
              .from('direct_message_attachments')
              .insert({
                message_id: message.id,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                url: publicUrl
              })
              .select()
              .single();

            if (attachmentError) throw attachmentError;
            return attachment;
          })
        );
      }

      if (message) {
        const messageWithAttachments = {
          ...message,
          attachments: uploadedAttachments
        };
        
        setMessages(prev => [...prev, messageWithAttachments]);
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