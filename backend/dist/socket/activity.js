"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActivityHandlers = registerActivityHandlers;
exports.emitTeamActivity = emitTeamActivity;
const database_1 = __importDefault(require("../config/database"));
// ============================================
// TEAM ACTIVITY FEED
// Persists + broadcasts real-time team actions
// ============================================
/**
 * Register activity feed event handlers
 */
function registerActivityHandlers(io, socket) {
    const user = socket.data.user;
    socket.on('team-action', async ({ teamId, action, targetType, targetId, targetName }) => {
        if (!teamId || !action)
            return;
        // Validate team membership
        const membership = await database_1.default.teamMember.findFirst({
            where: { teamId, userId: user.id },
        });
        if (!membership)
            return;
        try {
            // Persist to database
            const activity = await database_1.default.teamActivity.create({
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
        }
        catch (error) {
            console.error('Activity creation error:', error);
        }
    });
}
/**
 * Emit a team activity from server-side code (e.g., from REST routes)
 * Call this from routes when an action occurs outside of socket events
 */
async function emitTeamActivity(io, teamId, userId, action, targetType, targetId, targetName) {
    try {
        const activity = await database_1.default.teamActivity.create({
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
    }
    catch (error) {
        console.error('Emit team activity error:', error);
    }
}
