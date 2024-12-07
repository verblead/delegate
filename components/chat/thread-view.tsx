"use client";

import { useState } from 'react';
import { Message } from '@/lib/supabase/schema';
import { useMessageThread } from '@/hooks/use-message-thread';
import { MessageItem } from './message-item';
import { MessageInput } from './message-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ThreadViewProps {
  parentMessage: Message;
  onClose: () => void;
}

export function ThreadView({ parentMessage, onClose }: ThreadViewProps) {
  const { replies, loading, addReply } = useMessageThread(parentMessage.id);
  const [replyContent, setReplyContent] = useState('');

  const handleSendReply = async (content: string, attachments?: File[]) => {
    await addReply(content, attachments);
    setReplyContent('');
  };

  return (
    <div className="flex flex-col h-full border-l w-96">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Thread</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <MessageItem message={parentMessage} isThread />
          
          <div className="ml-6 mt-4 space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : (
              replies.map((reply) => (
                <MessageItem
                  key={reply.id}
                  message={reply}
                  isReply
                />
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <MessageInput
          onSend={handleSendReply}
          placeholder="Reply to thread..."
          value={replyContent}
          onChange={setReplyContent}
        />
      </div>
    </div>
  );
}