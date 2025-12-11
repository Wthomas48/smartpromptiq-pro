"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const database_1 = __importDefault(require("../config/database"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(`🔐 Auth check for ${req.method} ${req.path}:`);
        console.log(`   Authorization header:`, authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');
        if (!authHeader?.startsWith('Bearer ')) {
            console.log(`❌ No Bearer token found - returning 401`);
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        const token = authHeader.substring(7);
        // Handle demo tokens for development/demo environment
        if (token.startsWith('demo-token-')) {
            req.user = {
                id: 'demo-user-123',
                email: 'demo@example.com',
                role: 'user'
            };
            return next();
        }
        // Handle admin tokens
        if (token.startsWith('admin-token-')) {
            req.user = {
                id: 'admin-user-123',
                email: 'admin@smartpromptiq.com',
                role: 'ADMIN'
            };
            return next();
        }
        // Handle real JWT tokens
        const decoded = (0, jwt_1.verifyToken)(token);
        // Verify user still exists
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.authorize = authorize;
