"use client";

import { useState, useEffect } from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { ChannelHeader } from "./channel-header";
import { useChat } from "@/hooks/use-chat";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChannelMessage } from '@/types';

interface ChatInterfaceProps {
  channelId: string;
}

export function ChatInterface({ channelId }: ChatInterfaceProps) {
  const { messages, loading, sendMessage } = useChat(channelId);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    console.log('ChatInterface messages:', messages);
  }, [messages]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    
    try {
      await sendMessage(content, files || attachments);
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  console.log('Rendering messages:', messages);

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChannelHeader channelId={channelId} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.isArray(messages) && messages.length > 0 ? (
          <MessageList messages={messages} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation! (Messages count: {Array.isArray(messages) ? messages.length : 0})
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <MessageInput 
          onSend={handleSendMessage}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          placeholder="Type a message..."
          channelId={channelId}
        />
      </div>
    </div>
  );
}