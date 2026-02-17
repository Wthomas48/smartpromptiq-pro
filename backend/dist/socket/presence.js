"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamPresence = getTeamPresence;
exports.registerPresenceHandlers = registerPresenceHandlers;
exports.cleanStalePresence = cleanStalePresence;
const database_1 = __importDefault(require("../config/database"));
// In-memory presence store: teamId → userId → PresenceInfo
const teamPresence = new Map();
// Track which teams each socket has joined
const socketTeams = new Map();
const HEARTBEAT_TIMEOUT = 60000; // 60s — mark stale after this
/**
 * Get all online members for a team
 */
function getTeamPresence(teamId) {
    const members = teamPresence.get(teamId);
    if (!members)
        return [];
    return Array.from(members.values());
}
/**
 * Register presence event handlers on a socket
 */
function registerPresenceHandlers(io, socket) {
    const user = socket.data.user;
    socket.on('join-team', async ({ teamId }) => {
        if (!teamId)
            return;
        // Validate team membership
        const membership = await database_1.default.teamMember.findFirst({
            where: { teamId, userId: user.id },
        });
        if (!membership) {
            socket.emit('error', { message: 'Not a team member' });
            return;
        }
        // Join the Socket.io room
        socket.join(`team:${teamId}`);
        // Track this socket's teams
        if (!socketTeams.has(socket.id)) {
            socketTeams.set(socket.id, new Set());
        }
        socketTeams.get(socket.id).add(teamId);
        // Add to presence map
        if (!teamPresence.has(teamId)) {
            teamPresence.set(teamId, new Map());
        }
        const presenceInfo = {
            socketId: socket.id,
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`.trim() || user.email,
            email: user.email,
            status: 'online',
            lastSeen: Date.now(),
        };
        teamPresence.get(teamId).set(user.id, presenceInfo);
        // Broadcast to team that this member came online
        socket.to(`team:${teamId}`).emit('member-online', {
            teamId,
            userId: user.id,
            userName: presenceInfo.name,
        });
        // Send current presence state to the joining user
        socket.emit('presence-update', {
            teamId,
            members: getTeamPresence(teamId),
        });
    });
    socket.on('leave-team', ({ teamId }) => {
        if (!teamId)
            return;
        removeFromTeam(io, socket, teamId, user);
    });
    socket.on('update-status', ({ status, currentPage }) => {
        const teams = socketTeams.get(socket.id);
        if (!teams)
            return;
        for (const teamId of teams) {
            const members = teamPresence.get(teamId);
            if (!members)
                continue;
            const existing = members.get(user.id);
            if (existing) {
                existing.status = status;
                existing.currentPage = currentPage;
                existing.lastSeen = Date.now();
            }
            // Broadcast updated presence
            io.to(`team:${teamId}`).emit('presence-update', {
                teamId,
                members: getTeamPresence(teamId),
            });
        }
    });
    socket.on('heartbeat', () => {
        const teams = socketTeams.get(socket.id);
        if (!teams)
            return;
        for (const teamId of teams) {
            const members = teamPresence.get(teamId);
            if (!members)
                continue;
            const existing = members.get(user.id);
            if (existing) {
                existing.lastSeen = Date.now();
            }
        }
    });
    // Clean up on disconnect
    socket.on('disconnect', () => {
        const teams = socketTeams.get(socket.id);
        if (!teams)
            return;
        for (const teamId of teams) {
            removeFromTeam(io, socket, teamId, user);
        }
        socketTeams.delete(socket.id);
    });
}
function removeFromTeam(io, socket, teamId, user) {
    socket.leave(`team:${teamId}`);
    const teams = socketTeams.get(socket.id);
    if (teams)
        teams.delete(teamId);
    const members = teamPresence.get(teamId);
    if (members) {
        members.delete(user.id);
        if (members.size === 0) {
            teamPresence.delete(teamId);
        }
    }
    // Broadcast offline
    io.to(`team:${teamId}`).emit('member-offline', {
        teamId,
        userId: user.id,
    });
}
/**
 * Periodic stale connection cleanup (called from index.ts)
 */
function cleanStalePresence(io) {
    const now = Date.now();
    for (const [teamId, members] of teamPresence) {
        for (const [userId, info] of members) {
            if (now - info.lastSeen > HEARTBEAT_TIMEOUT) {
                members.delete(userId);
                io.to(`team:${teamId}`).emit('member-offline', { teamId, userId });
            }
        }
        if (members.size === 0) {
            teamPresence.delete(teamId);
        }
    }
}
