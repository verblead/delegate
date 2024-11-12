"use client";

import { useState } from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { ChannelHeader } from "./channel-header";
import { useChat } from "@/hooks/use-chat";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ChatInterfaceProps {
  channelId: string;
}

export function ChatInterface({ channelId }: ChatInterfaceProps) {
  const { messages, loading, sendMessage } = useChat(channelId);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, attachments);
    setAttachments([]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900">
      <ChannelHeader channelId={channelId} />
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>
      <div className="p-4 border-t border-zinc-800">
        <MessageInput 
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}