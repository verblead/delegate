"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/config';
import { useAuth } from './use-auth';
import { Reaction } from '@/lib/supabase/schema';

export function useReactions(messageId: number) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchReactions = async () => {
    if (!messageId) return;

    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('message_id', messageId);

    if (!error && data) {
      const groupedReactions = data.reduce((acc: Record<string, string[]>, reaction: Reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction.user_id);
        return acc;
      }, {});
      setReactions(groupedReactions);
    }
  };

  const toggleReaction = async (emoji: string) => {
    if (!user || !messageId) return;

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('reactions')
        .select()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        await supabase
          .from('reactions')
          .delete()
          .eq('id', existing.id);

        setReactions(prev => {
          const updated = { ...prev };
          updated[emoji] = updated[emoji].filter(id => id !== user.id);
          if (updated[emoji].length === 0) {
            delete updated[emoji];
          }
          return updated;
        });
      } else {
        await supabase
          .from('reactions')
          .insert([
            {
              message_id: messageId,
              user_id: user.id,
              emoji
            }
          ]);

        setReactions(prev => ({
          ...prev,
          [emoji]: [...(prev[emoji] || []), user.id]
        }));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    reactions,
    toggleReaction,
    loading,
    fetchReactions
  };
}