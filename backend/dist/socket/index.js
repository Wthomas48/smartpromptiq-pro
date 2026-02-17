"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const auth_1 = require("./auth");
const presence_1 = require("./presence");
const collaboration_1 = require("./collaboration");
const activity_1 = require("./activity");
// ============================================
// SOCKET.IO SERVER INITIALIZATION
// ============================================
let io = null;
/**
 * Initialize Socket.io server and attach to HTTP server
 */
function initializeSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                // Allow requests with no origin (mobile apps, curl, etc.)
                if (!origin || origin === 'null') {
                    return callback(null, true);
                }
                // Allow localhost in development
                if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                    return callback(null, true);
                }
                // Allow Railway and known production domains
                const allowedPatterns = ['.railway.app', '.vercel.app', '.netlify.app', 'smartpromptiq.com', 'smartpromptiq.net'];
                if (allowedPatterns.some(pattern => origin.includes(pattern))) {
                    return callback(null, true);
                }
                // Allow FRONTEND_URL
                if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
                    return callback(null, true);
                }
                console.warn(`🚫 Socket.io CORS blocked: ${origin}`);
                callback(new Error('CORS not allowed'));
            },
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 20000,
    });
    // Authentication middleware
    io.use(auth_1.socketAuthMiddleware);
    // Connection handler
    io.on('connection', (socket) => {
        const user = socket.data.user;
        console.log(`🔌 Socket connected: ${user?.email} (${socket.id})`);
        // Register all event handlers
        (0, presence_1.registerPresenceHandlers)(io, socket);
        (0, collaboration_1.registerCollaborationHandlers)(io, socket);
        (0, activity_1.registerActivityHandlers)(io, socket);
        socket.on('disconnect', (reason) => {
            console.log(`🔌 Socket disconnected: ${user?.email} (${reason})`);
        });
        socket.on('error', (error) => {
            console.error(`🔌 Socket error for ${user?.email}:`, error);
        });
    });
    // Periodic stale presence cleanup (every 30s)
    setInterval(() => {
        if (io)
            (0, presence_1.cleanStalePresence)(io);
    }, 30000);
    console.log('🔌 Socket.io server initialized');
    return io;
}
/**
 * Get the Socket.io server instance
 */
function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket() first.');
    }
    return io;
}
