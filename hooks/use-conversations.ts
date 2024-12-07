import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export interface Conversation {
  user_id: string;
  username: string;
  avatar_url: string | null;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export function useConversations() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        // Get all unique users we've had conversations with
        const { data: messageData, error: messageError } = await supabase
          .from('direct_messages_with_profiles')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (messageError) throw messageError;

        // Process the messages to get unique conversations
        const conversationMap = new Map<string, Conversation>();
        
        messageData?.forEach(message => {
          const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
          const otherUsername = message.sender_id === user.id ? message.recipient_username : message.sender_username;
          const otherAvatarUrl = message.sender_id === user.id ? message.recipient_avatar_url : message.sender_avatar_url;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              user_id: otherUserId,
              username: otherUsername,
              avatar_url: otherAvatarUrl,
              last_message: message.content,
              last_message_at: message.created_at,
              unread_count: 0 // You can implement unread count logic here
            });
          }
        });

        setConversations(Array.from(conversationMap.values()));
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages
    const subscription = supabase
      .channel('direct_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        () => {
          // Refresh conversations when there are changes
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase]);

  const addConversation = async (userId: string) => {
    if (!user) return;

    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Add to conversations if not already present
      setConversations(prev => {
        if (prev.some(conv => conv.user_id === userId)) {
          return prev;
        }

        return [{
          user_id: userId,
          username: profileData.username,
          avatar_url: profileData.avatar_url,
          last_message_at: new Date().toISOString()
        }, ...prev];
      });

    } catch (error) {
      console.error('Error adding conversation:', error);
    }
  };

  return {
    conversations,
    loading,
    addConversation
  };
}
