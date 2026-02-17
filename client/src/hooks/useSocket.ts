import { useState, useEffect, createContext, useContext } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

// ============================================
// SOCKET CONNECTION HOOK + CONTEXT
// ============================================

interface SocketContextValue {
  isConnected: boolean;
  connectionError: string | null;
}

export const SocketContext = createContext<SocketContextValue>({
  isConnected: false,
  connectionError: null,
});

export function useSocketContext() {
  return useContext(SocketContext);
}

/**
 * Hook that manages the socket lifecycle.
 * Only connects when isAuthenticated=true and token is available.
 * Call this once at the App level inside SocketProvider.
 */
export function useSocketConnection(isAuthenticated: boolean, token: string | null): SocketContextValue {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Only connect when fully authenticated with a valid token
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    const socket = connectSocket(token);

    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (err: Error) => {
      setConnectionError(err.message);
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      disconnectSocket();
    };
  }, [isAuthenticated, token]);

  return { isConnected, connectionError };
}

/**
 * Simple hook to check if socket is connected (use anywhere)
 */
export function useSocket() {
  const context = useSocketContext();
  const socket = getSocket();
  return { ...context, socket };
}
