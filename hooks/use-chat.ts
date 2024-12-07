"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "./use-supabase";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";
import { ChannelMessage, BaseMessage } from '@/lib/types';

interface MessageData {
  id: string;
  content: string;
  channel_id: string;
  sender_id: string;
  created_at: string;
  has_attachments: boolean;
}

export function useChat(channelId: string) {
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user } = useAuth();
  const seenMessages = useRef<Set<string>>(new Set());
  
  const fetchMessages = async () => {
    if (!channelId || !user) {
      console.log('Missing channelId or user:', { channelId, userId: user?.id });
      return;
    }

    try {
      console.log('Fetching messages for channel:', channelId);
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id (
            username,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      console.log('Found messages:', messages?.length);

      // Transform messages with sender info and attachments
      const transformedMessages = messages?.map(message => ({
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        sender: {
          id: message.sender_id,
          username: message.sender?.username || 'Unknown User',
          avatar_url: message.sender?.avatar_url
        },
        attachments: message.message_attachments || []
      })) || [];
      
      console.log('Setting transformed messages:', transformedMessages);
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: "Error fetching messages",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!channelId || !user) {
      console.log('Missing channelId or user:', { channelId, userId: user?.id });
      return;
    }

    console.log('Setting up real-time subscription for channel:', channelId);
    
    // Clear seen messages when channel changes
    seenMessages.current.clear();
    fetchMessages();

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',  // Only listen for INSERT events
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        console.log('Received real-time message:', payload);
        
        const newMessage = payload.new as any;
        
        // Check if we've already seen this message
        if (seenMessages.current.has(newMessage.id)) {
          console.log('Message already seen, skipping:', newMessage.id);
          return;
        }
        seenMessages.current.add(newMessage.id);

        // Fetch the sender's profile
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', newMessage.sender_id)
          .single();

        // Fetch message attachments
        const { data: attachments } = await supabase
          .from('message_attachments')
          .select('*')
          .eq('message_id', newMessage.id);

        const transformedMessage = {
          id: newMessage.id,
          content: newMessage.content,
          created_at: newMessage.created_at,
          sender: sender || {
            id: newMessage.sender_id,
            username: 'Unknown User',
            avatar_url: null
          },
          attachments: attachments || []
        };

        console.log('Adding new message to state:', transformedMessage);
        setMessages(prevMessages => [...prevMessages, transformedMessage]);
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription for channel:', channelId);
      supabase.removeChannel(channel);
    };
  }, [channelId, user, supabase]);

  return {
    messages,
    loading,
    sendMessage: async (content: string, attachments?: File[]) => {
      console.log('Starting sendMessage with:', { content, attachmentCount: attachments?.length });
      
      if (!channelId || !user) {
        console.error('Missing channelId or user:', { channelId, userId: user?.id });
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive"
        });
        return;
      }

      if (!content.trim() && (!attachments || attachments.length === 0)) {
        console.error('Message must have content or attachments');
        return;
      }

      try {
        let message: MessageData | null = null;
        
        // Only create a message record if there's actual content
        if (content.trim()) {
          console.log('Creating message with content:', content.trim());
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .insert({  
              content: content.trim(),
              channel_id: channelId,
              sender_id: user.id,
              has_attachments: false
            })
            .select(`
              id,
              content,
              channel_id,
              sender_id,
              created_at,
              has_attachments
            `)
            .single();

          if (messageError) {
            console.error('Error creating message:', messageError);
            if (messageError.code === '42501') {
              console.error('Permission denied. Check RLS policies.');
            } else if (messageError.code === '23503') {
              console.error('Foreign key violation. Check channel_id and sender_id.');
            }
            throw messageError;
          }
          
          if (!messageData) {
            throw new Error('No message data returned from insert');
          }
          
          message = messageData;
          console.log('Message created successfully:', message);

          // Add the message to local state with sender info
          const transformedMessage: BaseMessage = {
            id: message.id,
            content: message.content,
            created_at: message.created_at,
            sender: {
              id: user.id,
              username: user.email?.split('@')[0] || 'Unknown User',
              avatar_url: user.user_metadata?.avatar_url || null
            },
            attachments: []
          };
          
          // Add to seen messages to prevent duplicate from real-time subscription
          seenMessages.current.add(message.id);
          setMessages(prevMessages => [...prevMessages, transformedMessage]);
        }

        // Handle attachments if any
        if (attachments?.length) {
          console.log(`Processing ${attachments.length} attachments...`);
          
          // If no message exists yet or this is an attachment-only message, create one
          if (!message) {
            const { data: messageData, error: messageError } = await supabase
              .from('messages')
              .insert({  
                content: '',
                channel_id: channelId,
                sender_id: user.id,
                has_attachments: true
              })
              .select(`
                id,
                content,
                channel_id,
                sender_id,
                created_at,
                has_attachments
              `)
              .single();

            if (messageError) {
              throw messageError;
            }

            if (!messageData) {
              throw new Error('No message data returned');
            }

            message = messageData;

            // Add the message to local state with sender info
            const transformedMessage: BaseMessage = {
              id: messageData.id,
              content: messageData.content,
              created_at: messageData.created_at,
              sender: {
                id: user.id,
                username: user.email?.split('@')[0] || 'Unknown User',
                avatar_url: user.user_metadata?.avatar_url || null
              },
              attachments: []
            };
            
            seenMessages.current.add(messageData.id);
            setMessages(prevMessages => [...prevMessages, transformedMessage]);
          }

          // Now we can safely process attachments since we know message exists
          const messageId = message.id;
          if (!messageId) {
            throw new Error('No valid message ID for attachment upload');
          }

          for (const file of attachments) {
            try {
              // Ensure message exists before processing attachments
              if (!message?.id) {
                throw new Error('No valid message ID for attachment upload');
              }

              const filePath = `${user.id}/${message.id}/${file.name}`;
              console.log('Uploading file to storage:', filePath);
              const { error: uploadError } = await supabase.storage
                .from('message_attachments')
                .upload(filePath, file);

              if (uploadError) {
                console.error('Error uploading file:', uploadError);
                throw uploadError;
              }

              const { data: urlData } = supabase.storage
                .from('message_attachments')
                .getPublicUrl(filePath);

              if (!urlData || !urlData.publicUrl) {
                throw new Error('Failed to generate public URL for file');
              }

              console.log('Creating attachment record for:', {
                message_id: message.id,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                url: urlData.publicUrl
              });

              const { error: attachmentError } = await supabase
                .from('message_attachments')
                .insert({
                  message_id: message.id,
                  file_name: file.name,
                  file_type: file.type,
                  file_size: file.size,
                  url: urlData.publicUrl
                });

              if (attachmentError) {
                console.error('Error creating attachment record:', attachmentError);
                throw attachmentError;
              }

              console.log('Successfully created attachment record');

              // Update local message state with the new attachment
              const newAttachment = {
                id: message.id, // Using message.id as a temporary ID since we don't have the attachment ID
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                url: urlData.publicUrl
              };

              setMessages(prevMessages => 
                prevMessages.map(msg => 
                  msg.id === message?.id
                    ? { ...msg, attachments: [...(msg.attachments || []), newAttachment] }
                    : msg
                )
              );
            } catch (error) {
              console.error(`Error processing attachment ${file.name}:`, error);
              toast({
                title: "Error",
                description: `Failed to upload attachment: ${file.name}`,
                variant: "destructive"
              });
            }
          }

          // Update has_attachments flag after all attachments are processed
          if (message?.id && !message.has_attachments) {
            const { error: updateError } = await supabase
              .from('messages')
              .update({ has_attachments: true })
              .eq('id', message.id);

            if (updateError) {
              console.error('Error updating message has_attachments flag:', updateError);
            }
          }
        }

        return message;
      } catch (error: any) {
        console.error('Error in sendMessage:', error);
        if (error.code) {
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', error.details);
        }
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          variant: "destructive"
        });
        throw error;
      }
    }
  };
}