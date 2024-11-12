"use client";

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/hooks/use-auth';

interface TypingIndicatorProps {
  channelId: string;
}

export function TypingIndicator({ channelId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { socket } = useSocket(channelId);
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const handleUserTyping = ({ userId }: { userId: string }) => {
      if (userId !== user.id) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    };

    const handleUserStopTyping = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
    };
  }, [socket, user]);

  if (typingUsers.size === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground">
      {Array.from(typingUsers).length === 1
        ? 'Someone is typing...'
        : 'Multiple people are typing...'}
    </div>
  );
}