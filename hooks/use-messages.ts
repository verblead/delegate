import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  updated_at: string;
  sender_username: string;
  sender_avatar_url: string | null;
  recipient_username: string;
  recipient_avatar_url: string | null;
}

export function useMessages(recipientId?: string) {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !recipientId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: messagesError } = await supabase
          .from('direct_messages_with_profiles')
          .select('*')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (messagesError) {
          throw messagesError;
        }

        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`direct_messages:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id}))`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the complete message with profiles
            supabase
              .from('direct_messages_with_profiles')
              .select('*')
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setMessages((prev) => [...prev, data]);
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, recipientId, supabase]);

  const sendMessage = async (content: string) => {
    if (!user || !recipientId || !content.trim()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert([
          {
            content: content.trim(),
            sender_id: user.id,
            recipient_id: recipientId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}