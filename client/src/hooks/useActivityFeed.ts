import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';
import { getSocket } from '@/lib/socket';
import { useSocketContext } from './useSocket';

// ============================================
// REAL-TIME ACTIVITY FEED HOOK
// REST initial load + Socket.io live updates
// ============================================

export interface TeamActivityItem {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function useActivityFeed(teamId: string | null | undefined) {
  const { isConnected } = useSocketContext();
  const [liveActivities, setLiveActivities] = useState<TeamActivityItem[]>([]);

  // REST initial fetch
  const { data, isLoading } = useQuery<{ activities: TeamActivityItem[]; total: number }>({
    queryKey: ['team-activity', teamId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/teams/${teamId}/activity?limit=30`);
      const json = await res.json();
      return json.data;
    },
    enabled: !!teamId,
  });

  // Socket.io live updates
  useEffect(() => {
    if (!teamId || !isConnected) return;

    const socket = getSocket();
    if (!socket) return;

    const onNewActivity = ({ teamId: tid, activity }: { teamId: string; activity: TeamActivityItem }) => {
      if (tid === teamId) {
        setLiveActivities(prev => [activity, ...prev].slice(0, 50));
      }
    };

    socket.on('new-activity', onNewActivity);

    return () => {
      socket.off('new-activity', onNewActivity);
    };
  }, [teamId, isConnected]);

  // Merge: live activities first, then REST-fetched
  const restActivities = data?.activities || [];
  const allActivities = [...liveActivities, ...restActivities].reduce((acc, item) => {
    if (!acc.some((a: TeamActivityItem) => a.id === item.id)) acc.push(item);
    return acc;
  }, [] as TeamActivityItem[]);

  return {
    activities: allActivities,
    isLoading,
    total: data?.total || 0,
  };
}

/**
 * Hook to get team shared prompts
 */
export function useTeamPrompts(teamId: string | null | undefined) {
  return useQuery<{ prompts: any[] }>({
    queryKey: ['team-prompts', teamId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/teams/${teamId}/prompts`);
      const json = await res.json();
      return json.data;
    },
    enabled: !!teamId,
  });
}
