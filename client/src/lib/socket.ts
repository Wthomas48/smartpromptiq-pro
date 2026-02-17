import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@/config/api';

// ============================================
// SOCKET.IO CLIENT SINGLETON
// ============================================

let socket: Socket | null = null;

/**
 * Connect to the Socket.io server with auth token
 */
export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  // Disconnect any existing stale socket
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  const baseUrl = getApiBaseUrl();

  socket = io(baseUrl || window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
    autoConnect: true,
  });

  // Only log first connect/disconnect, suppress reconnection noise
  let hasLoggedError = false;

  socket.on('connect', () => {
    hasLoggedError = false;
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('connect_error', (error) => {
    if (!hasLoggedError) {
      console.warn('🔌 Socket connection error:', error.message);
      hasLoggedError = true;
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect the socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get the current socket instance (may be null if not connected)
 */
export function getSocket(): Socket | null {
  return socket;
}
