import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { useSocketContext } from './useSocket';

// ============================================
// PRESENCE HOOK
// Tracks online team members in real-time
// ============================================

export interface PresenceMember {
  userId: string;
  name: string;
  email: string;
  status: 'online' | 'away' | 'busy';
  currentPage?: string;
  lastSeen: number;
}

export function usePresence(teamId: string | null | undefined) {
  const { isConnected } = useSocketContext();
  const [onlineMembers, setOnlineMembers] = useState<PresenceMember[]>([]);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!teamId || !isConnected) {
      setOnlineMembers([]);
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    // Join team
    socket.emit('join-team', { teamId });

    // Listen for presence updates
    const onPresenceUpdate = ({ teamId: tid, members }: { teamId: string; members: PresenceMember[] }) => {
      if (tid === teamId) {
        setOnlineMembers(members);
      }
    };

    const onMemberOnline = ({ teamId: tid, userId, userName }: { teamId: string; userId: string; userName: string }) => {
      if (tid === teamId) {
        setOnlineMembers(prev => {
          if (prev.some(m => m.userId === userId)) return prev;
          return [...prev, { userId, name: userName, email: '', status: 'online', lastSeen: Date.now() }];
        });
      }
    };

    const onMemberOffline = ({ teamId: tid, userId }: { teamId: string; userId: string }) => {
      if (tid === teamId) {
        setOnlineMembers(prev => prev.filter(m => m.userId !== userId));
      }
    };

    socket.on('presence-update', onPresenceUpdate);
    socket.on('member-online', onMemberOnline);
    socket.on('member-offline', onMemberOffline);

    // Heartbeat every 25s
    heartbeatRef.current = setInterval(() => {
      socket.emit('heartbeat', {});
    }, 25_000);

    return () => {
      socket.emit('leave-team', { teamId });
      socket.off('presence-update', onPresenceUpdate);
      socket.off('member-online', onMemberOnline);
      socket.off('member-offline', onMemberOffline);

      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [teamId, isConnected]);

  const updateMyStatus = useCallback((status: 'online' | 'away' | 'busy', currentPage?: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('update-status', { status, currentPage });
    }
  }, []);

  return { onlineMembers, updateMyStatus };
}
