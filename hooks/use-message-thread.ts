"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Message } from '@/lib/supabase/schema';
import { useAuth } from './use-auth';

export function useMessageThread(parentMessageId?: number) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!parentMessageId || !user) return;

    const fetchReplies = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          attachments (*),
          task (*),
          user:auth.users (email)
        `)
        .eq('parent_id', parentMessageId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setReplies(data);
      }
      setLoading(false);
    };

    fetchReplies();

    const repliesSubscription = supabase
      .channel(`message-replies:${parentMessageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `parent_id=eq.${parentMessageId}`
        },
        fetchReplies
      )
      .subscribe();

    return () => {
      repliesSubscription.unsubscribe();
    };
  }, [parentMessageId, user]);

  const addReply = async (content: string, attachments?: File[]) => {
    if (!user || !parentMessageId) return null;

    try {
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: user.id,
            parent_id: parentMessageId
          }
        ])
        .select()
        .single();

      if (messageError) throw messageError;

      if (attachments?.length && message) {
        for (const file of attachments) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(`${message.id}/${file.name}`, file);

          if (uploadError) continue;

          await supabase
            .from('attachments')
            .insert([
              {
                message_id: message.id,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                url: uploadData.path
              }
            ]);
        }
      }

      return message;
    } catch (error) {
      console.error('Error adding reply:', error);
      return null;
    }
  };

  return {
    replies,
    loading,
    addReply
  };
}