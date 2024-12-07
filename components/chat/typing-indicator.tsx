"use client";

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/use-supabase';

interface TypingIndicatorProps {
  recipientId: string;
}

export function TypingIndicator({ recipientId }: TypingIndicatorProps) {
  const [isTyping, setIsTyping] = useState(false);
  const { supabase } = useSupabase();

  useEffect(() => {
    const channel = supabase.channel(`typing:${recipientId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [recipientId, supabase]);

  if (!isTyping) return null;

  return (
    <div className="text-sm text-muted-foreground animate-pulse">
      Someone is typing...
    </div>
  );
}