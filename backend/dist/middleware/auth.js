"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const database_1 = __importDefault(require("../config/database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Valid user roles - whitelist for security
 * Any role not in this list will be rejected or defaulted to USER
 */
const VALID_ROLES = ['USER', 'ADMIN', 'MODERATOR'];
/**
 * Environment check helpers — read at call time so dotenv has loaded.
 * Previously these were cached at module scope (before dotenv ran),
 * causing NODE_ENV to be undefined and all checks to fail.
 */
const getIsDevelopment = () => process.env.NODE_ENV === 'development';
const getIsProduction = () => process.env.NODE_ENV === 'production';
const getAllowUnverifiedJWT = () => process.env.ALLOW_UNVERIFIED_JWT === 'true' && !getIsProduction();
/**
 * Validate and normalize a role string against the whitelist
 * Returns 'USER' for any invalid or unexpected role values
 */
const validateRole = (role) => {
    if (!role)
        return 'USER';
    const normalizedRole = role.toUpperCase().trim();
    if (VALID_ROLES.includes(normalizedRole)) {
        return normalizedRole;
    }
    console.warn(`⚠️ Invalid role "${role}" rejected, defaulting to USER`);
    return 'USER';
};
/**
 * Verify a Supabase JWT token
 * Supabase JWTs use the JWT secret from your Supabase project
 *
 * SECURITY: This function REQUIRES SUPABASE_JWT_SECRET to be configured.
 * Without proper configuration, Supabase authentication will fail.
 */
const verifySupabaseToken = (token) => {
    try {
        // SECURITY: Require dedicated SUPABASE_JWT_SECRET in production
        const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
        // Fallback to JWT_SECRET only in development
        const secret = supabaseJwtSecret || (getIsDevelopment() ? process.env.JWT_SECRET : null);
        if (!secret) {
            if (getIsProduction()) {
                console.error('❌ CRITICAL: SUPABASE_JWT_SECRET not configured in production!');
            }
            else {
                console.log('   ⚠️ No SUPABASE_JWT_SECRET configured');
            }
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Supabase JWTs have 'sub' (user ID) and 'email' in the payload
        if (decoded && decoded.sub && decoded.email) {
            // Validate email format (basic check)
            if (!decoded.email.includes('@')) {
                console.warn(`⚠️ Invalid email format in JWT: ${decoded.email}`);
                return null;
            }
            console.log(`   ✅ Supabase JWT verified for: ${decoded.email}`);
            return {
                sub: decoded.sub,
                email: decoded.email,
                // SECURITY: Validate role against whitelist
                role: validateRole(decoded.role || decoded.user_metadata?.role)
            };
        }
        return null;
    }
    catch (error) {
        // Log verification failures in development for debugging
        if (getIsDevelopment() && error.message) {
            console.log(`   ℹ️ Supabase JWT verification failed: ${error.message}`);
        }
        return null;
    }
};
/**
 * Find or create a user from Supabase auth
 * This syncs Supabase users to our local database
 *
 * SECURITY: Role is validated before database insertion
 */
const findOrCreateSupabaseUser = async (supabaseUser) => {
    // Validate inputs
    if (!supabaseUser.sub || !supabaseUser.email) {
        console.error('❌ Invalid Supabase user data: missing sub or email');
        return null;
    }
    // First try to find by email (most reliable)
    let user = await database_1.default.user.findUnique({
        where: { email: supabaseUser.email }
    });
    if (user) {
        console.log(`   ✅ Found existing user: ${user.email} (id: ${user.id})`);
        return user;
    }
    // Create a new user record for this Supabase user
    console.log(`   📝 Creating new user record for Supabase user: ${supabaseUser.email}`);
    try {
        // SECURITY: Validate role before database insertion
        const validatedRole = validateRole(supabaseUser.role);
        user = await database_1.default.user.create({
            data: {
                id: supabaseUser.sub, // Use Supabase user ID
                email: supabaseUser.email,
                password: '', // Empty password for Supabase-auth users (auth via Supabase only)
                firstName: supabaseUser.email.split('@')[0], // Default from email
                lastName: '',
                role: validatedRole,
                plan: 'free',
                tokenBalance: 100, // Welcome tokens
                subscriptionStatus: 'active',
            }
        });
        console.log(`   ✅ Created user: ${user.email} (id: ${user.id}, role: ${validatedRole})`);
        return user;
    }
    catch (createError) {
        // Handle race condition - user might have been created by another request
        if (createError.code === 'P2002') {
            console.log(`   ℹ️ User already exists (race condition), fetching...`);
            user = await database_1.default.user.findUnique({
                where: { email: supabaseUser.email }
            });
            return user;
        }
        console.error(`❌ Failed to create user: ${createError.message}`);
        throw createError;
    }
};
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
        // ═══════════════════════════════════════════════════════════════════════════
        // SECURITY: Demo/Admin tokens ONLY in development mode
        // These are completely disabled in production for security
        // ═══════════════════════════════════════════════════════════════════════════
        if (getIsDevelopment()) {
            // Handle demo tokens for development/demo environment ONLY
            if (token.startsWith('demo-token-')) {
                console.log('⚠️ DEVELOPMENT MODE: Using demo token authentication');
                req.user = {
                    id: 'demo-user-123',
                    email: 'demo@example.com',
                    role: 'USER'
                };
                return next();
            }
            // Handle admin tokens for development ONLY
            if (token.startsWith('admin-token-')) {
                console.log('⚠️ DEVELOPMENT MODE: Using admin token authentication');
                req.user = {
                    id: 'admin-user-123',
                    email: 'admin@smartpromptiq.com',
                    role: 'ADMIN'
                };
                return next();
            }
        }
        else if (token.startsWith('demo-token-') || token.startsWith('admin-token-')) {
            // SECURITY: Reject demo/admin tokens in production
            console.error('❌ SECURITY: Demo/admin tokens rejected in production');
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 1: Try to verify as backend JWT first
        // ═══════════════════════════════════════════════════════════════════════════
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            console.log(`   ✅ Backend JWT verified for userId: ${decoded.userId}`);
            // Verify user still exists
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId }
            });
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: validateRole(user.role)
                };
                return next();
            }
            console.log(`   ⚠️ Backend JWT valid but user not found, trying Supabase...`);
        }
        catch (backendJwtError) {
            console.log(`   ℹ️ Not a backend JWT, trying Supabase verification...`);
        }
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 2: Try to verify as Supabase JWT (RECOMMENDED)
        // ═══════════════════════════════════════════════════════════════════════════
        const supabasePayload = verifySupabaseToken(token);
        if (supabasePayload) {
            // Find or create user in our database
            const user = await findOrCreateSupabaseUser(supabasePayload);
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: validateRole(user.role)
                };
                return next();
            }
        }
        // ═══════════════════════════════════════════════════════════════════════════
        // STRATEGY 3: Unverified JWT decode (DEVELOPMENT ONLY - SECURITY RISK)
        // This is DISABLED in production. Configure SUPABASE_JWT_SECRET properly.
        // ═══════════════════════════════════════════════════════════════════════════
        if (getAllowUnverifiedJWT()) {
            try {
                const decoded = jsonwebtoken_1.default.decode(token);
                if (decoded && decoded.sub && decoded.email) {
                    console.warn(`⚠️ SECURITY WARNING: Using unverified JWT decode for: ${decoded.email}`);
                    console.warn(`⚠️ This is DISABLED in production. Set SUPABASE_JWT_SECRET!`);
                    // Find or create user based on the decoded token
                    const user = await findOrCreateSupabaseUser({
                        sub: decoded.sub,
                        email: decoded.email,
                        role: decoded.role || decoded.user_metadata?.role
                    });
                    if (user) {
                        req.user = {
                            id: user.id,
                            email: user.email,
                            role: validateRole(user.role)
                        };
                        return next();
                    }
                }
            }
            catch (decodeError) {
                console.log(`   ❌ JWT decode also failed`);
            }
        }
        // All strategies failed
        console.log(`❌ All authentication strategies failed`);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    catch (error) {
        console.error(`❌ Authentication error:`, error.message);
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
/**
 * Optional authentication for billing routes
 * Allows guest checkout but enriches request with user data if authenticated
 *
 * SECURITY: Same protections as authenticate(), but allows guest access
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(`🔐 Optional auth check for ${req.method} ${req.path}:`);
        // No auth header - allow guest access
        if (!authHeader?.startsWith('Bearer ')) {
            console.log(`⚠️ No Bearer token - allowing guest access`);
            req.user = undefined; // Guest user
            return next();
        }
        const token = authHeader.substring(7);
        console.log(`   Token:`, token.substring(0, 30) + '...');
        // ═══════════════════════════════════════════════════════════════════════════
        // SECURITY: Demo/Admin tokens ONLY in development mode
        // ═══════════════════════════════════════════════════════════════════════════
        if (getIsDevelopment()) {
            if (token.startsWith('demo-token-')) {
                console.log('⚠️ DEVELOPMENT MODE: Using demo token authentication');
                req.user = {
                    id: 'demo-user-123',
                    email: 'demo@example.com',
                    role: 'USER'
                };
                return next();
            }
            if (token.startsWith('admin-token-')) {
                console.log('⚠️ DEVELOPMENT MODE: Using admin token authentication');
                req.user = {
                    id: 'admin-user-123',
                    email: 'admin@smartpromptiq.com',
                    role: 'ADMIN'
                };
                return next();
            }
        }
        else if (token.startsWith('demo-token-') || token.startsWith('admin-token-')) {
            // SECURITY: Reject demo/admin tokens in production - allow guest instead
            console.warn('⚠️ SECURITY: Demo/admin tokens rejected in production, allowing guest');
            req.user = undefined;
            return next();
        }
        // STRATEGY 1: Try backend JWT first
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            // Verify user still exists
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId }
            });
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: validateRole(user.role)
                };
                console.log(`✅ Authenticated user (backend JWT): ${user.email}`);
                return next();
            }
            console.log(`⚠️ Backend JWT valid but user not found, trying Supabase...`);
        }
        catch (backendJwtError) {
            // Not a backend JWT, try Supabase
        }
        // STRATEGY 2: Try Supabase JWT
        const supabasePayload = verifySupabaseToken(token);
        if (supabasePayload) {
            const user = await findOrCreateSupabaseUser(supabasePayload);
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: validateRole(user.role)
                };
                console.log(`✅ Authenticated user (Supabase JWT): ${user.email}`);
                return next();
            }
        }
        // STRATEGY 3: Unverified decode (DEVELOPMENT ONLY)
        if (getAllowUnverifiedJWT()) {
            try {
                const decoded = jsonwebtoken_1.default.decode(token);
                if (decoded && decoded.sub && decoded.email) {
                    console.warn(`⚠️ SECURITY WARNING: Using unverified JWT decode for optional auth: ${decoded.email}`);
                    const user = await findOrCreateSupabaseUser({
                        sub: decoded.sub,
                        email: decoded.email,
                        role: decoded.role || decoded.user_metadata?.role
                    });
                    if (user) {
                        req.user = {
                            id: user.id,
                            email: user.email,
                            role: validateRole(user.role)
                        };
                        return next();
                    }
                }
            }
            catch (decodeError) {
                // Fall through to guest access
            }
        }
        // All strategies failed - allow guest access
        console.log(`⚠️ No valid token - allowing guest access`);
        req.user = undefined;
        next();
    }
    catch (error) {
        console.error(`❌ Optional auth error:`, error);
        // On error, allow guest access
        req.user = undefined;
        next();
    }
};
exports.optionalAuth = optionalAuth;
