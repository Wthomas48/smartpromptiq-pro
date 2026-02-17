import { Server, Socket } from 'socket.io';
import prisma from '../config/database';
import { SocketUser } from './auth';

// ============================================
// TEAM ACTIVITY FEED
// Persists + broadcasts real-time team actions
// ============================================

/**
 * Register activity feed event handlers
 */
export function registerActivityHandlers(io: Server, socket: Socket) {
  const user = socket.data.user as SocketUser;

  socket.on('team-action', async ({ teamId, action, targetType, targetId, targetName }: {
    teamId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    targetName?: string;
  }) => {
    if (!teamId || !action) return;

    // Validate team membership
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });
    if (!membership) return;

    try {
      // Persist to database
      const activity = await prisma.teamActivity.create({
        data: {
          teamId,
          userId: user.id,
          action,
          targetType: targetType || null,
          targetId: targetId || null,
          targetName: targetName || null,
        },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });

      // Broadcast to all team members (including sender)
      io.to(`team:${teamId}`).emit('new-activity', {
        teamId,
        activity: {
          id: activity.id,
          action: activity.action,
          targetType: activity.targetType,
          targetId: activity.targetId,
          targetName: activity.targetName,
          createdAt: activity.createdAt.toISOString(),
          user: {
            id: activity.user.id,
            name: `${activity.user.firstName} ${activity.user.lastName}`.trim() || activity.user.email,
            email: activity.user.email,
          },
        },
      });
    } catch (error) {
      console.error('Activity creation error:', error);
    }
  });
}

/**
 * Emit a team activity from server-side code (e.g., from REST routes)
 * Call this from routes when an action occurs outside of socket events
 */
export async function emitTeamActivity(
  io: Server,
  teamId: string,
  userId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  targetName?: string
) {
  try {
    const activity = await prisma.teamActivity.create({
      data: {
        teamId,
        userId,
        action,
        targetType: targetType || null,
        targetId: targetId || null,
        targetName: targetName || null,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    io.to(`team:${teamId}`).emit('new-activity', {
      teamId,
      activity: {
        id: activity.id,
        action: activity.action,
        targetType: activity.targetType,
        targetId: activity.targetId,
        targetName: activity.targetName,
        createdAt: activity.createdAt.toISOString(),
        user: {
          id: activity.user.id,
          name: `${activity.user.firstName} ${activity.user.lastName}`.trim() || activity.user.email,
          email: activity.user.email,
        },
      },
    });
  } catch (error) {
    console.error('Emit team activity error:', error);
  }
}
