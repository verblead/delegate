import { Server } from 'socket.io';
import { createServer } from 'http';
import { parse } from 'url';
import { supabase } from '@/lib/supabase/config';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-channel', (channelId: string) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('leave-channel', (channelId: string) => {
    socket.leave(`channel:${channelId}`);
  });

  socket.on('typing', ({ channelId, userId }) => {
    socket.to(`channel:${channelId}`).emit('user-typing', { userId });
  });

  socket.on('stop-typing', ({ channelId, userId }) => {
    socket.to(`channel:${channelId}`).emit('user-stop-typing', { userId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});