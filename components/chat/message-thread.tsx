"use client";

import { useState } from "react";
import { Message } from "@/lib/supabase/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "./message-item";
import { MessageInput } from "./message-input";
import { X } from "lucide-react";

interface MessageThreadProps {
  parentMessage: Message;
  replies: Message[];
  onClose: () => void;
  onReply: (content: string, attachments?: File[]) => void;
}

export function MessageThread({
  parentMessage,
  replies,
  onClose,
  onReply,
}: MessageThreadProps) {
  return (
    <div className="flex flex-col border-l w-96">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Thread</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <MessageItem message={parentMessage} isParent />
          <div className="ml-6 mt-4 space-y-4">
            {replies.map((reply) => (
              <MessageItem key={reply.id} message={reply} />
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <MessageInput onSend={onReply} placeholder="Reply to thread..." />
      </div>
    </div>
  );
}