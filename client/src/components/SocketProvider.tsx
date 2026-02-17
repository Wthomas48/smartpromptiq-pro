import React from 'react';
import { SocketContext, useSocketConnection } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// SOCKET PROVIDER
// Manages socket lifecycle tied to auth state
// Only connects when user is authenticated
// ============================================

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const socketState = useSocketConnection(isAuthenticated, token);

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
}
