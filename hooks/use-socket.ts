"use client";

import { useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket';
import { useAuth } from './use-auth';

export function useSocket(channelId: string) {
  const { user } = useAuth();

  const emitTyping = useCallback(() => {
    if (user) {
      socket.emit('typing', { channelId, userId: user.id });
    }
  }, [channelId, user]);

  const emitStopTyping = useCallback(() => {
    if (user) {
      socket.emit('stop-typing', { channelId, userId: user.id });
    }
  }, [channelId, user]);

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit('join-channel', channelId);

    return () => {
      socket.emit('leave-channel', channelId);
      socket.disconnect();
    };
  }, [channelId, user]);

  return {
    emitTyping,
    emitStopTyping,
    socket,
  };
}