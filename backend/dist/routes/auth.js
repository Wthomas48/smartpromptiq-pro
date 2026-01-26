"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const emailService_1 = __importDefault(require("../utils/emailService"));
const router = express_1.default.Router();
// Enhanced validation with detailed error messages
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Valid email address is required')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('First name cannot be empty if provided'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
];
// Enhanced error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.error('❌ Registration validation failed:', {
            receivedBody: req.body,
            bodyKeys: Object.keys(req.body),
            errors: errors.array(),
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent'],
            origin: req.headers.origin
        });
        return res.status(400).json({
            success: false,
            message: 'Validation failed - check field requirements',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: typeof err.value === 'string' ? err.value.substring(0, 50) : err.value,
                location: err.location
            })),
            receivedFields: Object.keys(req.body),
            expectedFields: ['email', 'password', 'firstName (optional)', 'lastName (optional)'],
            debug: {
                emailProvided: !!req.body.email,
                passwordProvided: !!req.body.password,
                firstNameProvided: !!req.body.firstName,
                lastNameProvided: !!req.body.lastName
            }
        });
    }
    next();
};
// Register
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
    try {
        console.log('📥 Registration request received:', {
            body: {
                email: req.body.email,
                password: req.body.password ? '[PROVIDED]' : '[MISSING]',
                firstName: req.body.firstName || '[NOT PROVIDED]',
                lastName: req.body.lastName || '[NOT PROVIDED]'
            },
            headers: {
                contentType: req.headers['content-type'],
                origin: req.headers.origin,
                userAgent: req.headers['user-agent']?.substring(0, 100)
            },
            bodyKeys: Object.keys(req.body),
            timestamp: new Date().toISOString()
        });
        const { email, password, firstName, lastName } = req.body;
        // Validate password strength with detailed logging
        console.log('🔐 Validating password strength...');
        const passwordValidation = (0, password_1.validatePassword)(password);
        if (!passwordValidation.isValid) {
            console.error('❌ Password validation failed:', {
                email: email,
                passwordLength: password?.length || 0,
                errors: passwordValidation.errors,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors,
                requirements: {
                    minLength: 6,
                    provided: password?.length || 0
                },
                debug: {
                    passwordProvided: !!password,
                    passwordType: typeof password
                }
            });
        }
        // Check if user exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            console.warn('⚠️ Registration attempt with existing email:', {
                email: email,
                existingUserId: existingUser.id,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists',
                error: 'USER_EXISTS',
                suggestions: ['Try logging in instead', 'Use a different email address', 'Reset your password if you forgot it']
            });
        }
        // Hash password and create user
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const user = await database_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'USER',
                plan: 'FREE',
                subscriptionTier: 'FREE',
                tokenBalance: 0,
                generationsUsed: 0,
                generationsLimit: 5,
                isActive: true
            }
        });
        const token = (0, jwt_1.generateToken)(user);
        const verificationToken = (0, jwt_1.generateToken)({ userId: user.id, type: 'email_verification' });
        // Send welcome email and verification email (non-blocking)
        setImmediate(async () => {
            try {
                await emailService_1.default.sendWelcomeEmail(user.email, user.firstName || 'User');
                console.log(`Welcome email sent to ${user.email}`);
                // Send email verification
                await emailService_1.default.sendEmail({
                    to: user.email,
                    subject: 'Verify your SmartPromptIQ account',
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Verify Your Email Address</h2>
              <p>Hi ${user.firstName || 'there'},</p>
              <p>Thanks for signing up! Please verify your email address to complete your SmartPromptIQ registration.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
              </div>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>Best regards,<br>The SmartPromptIQ Team</p>
            </div>
          `
                });
                console.log(`Verification email sent to ${user.email}`);
            }
            catch (error) {
                console.error('Failed to send emails:', error);
                // Email failure doesn't affect registration success
            }
        });
        // ✅ FIXED: Ensure role is always properly set and validated for REGISTER
        // Note: permissions and roles arrays don't exist in schema - use role string instead
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: user.plan || user.subscriptionTier || 'free',
            role: user.role || 'USER',
            subscriptionTier: user.subscriptionTier || 'free',
            tokenBalance: user.tokenBalance || 0,
            permissions: [], // Empty array for compatibility
            roles: [user.role || 'USER'] // Derive from role field
        };
        console.log('🔍 BACKEND REGISTER RESPONSE:', userData);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: userData,
                token
            }
        });
    }
    catch (error) {
        console.error('❌ Register error:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error code:', error.code);
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
                error: 'USER_EXISTS'
            });
        }
        // Handle database connection errors
        if (error.code === 'P1001' || error.code === 'P1002') {
            return res.status(503).json({
                success: false,
                message: 'Database connection error. Please try again later.',
                error: 'DATABASE_ERROR'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        console.log('🔍 Login attempt:', { email, passwordLength: password?.length });
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        console.log('👤 User found:', user ? `Yes (${user.email})` : 'No');
        if (!user) {
            console.log('❌ User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Verify password
        console.log('🔐 Comparing passwords...');
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        console.log('🔐 Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            console.log('❌ Password mismatch for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Update last login
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        const token = (0, jwt_1.generateToken)(user);
        // ✅ FIXED: Ensure role is always properly set and validated for LOGIN
        // Note: permissions and roles arrays don't exist in schema - use role string instead
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: user.plan || user.subscriptionTier || 'free',
            role: user.role || 'USER',
            subscriptionTier: user.subscriptionTier || 'free',
            tokenBalance: user.tokenBalance || 0,
            permissions: [], // Empty array for compatibility
            roles: [user.role || 'USER'] // Derive from role field
        };
        console.log('🔍 BACKEND USER RESPONSE:', userData);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userData,
                token
            }
        });
    }
    catch (error) {
        console.error('❌ Login error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error code:', error.code);
        // Handle database connection errors
        if (error.code === 'P1001' || error.code === 'P1002') {
            return res.status(503).json({
                success: false,
                message: 'Database connection error. Please try again later.',
                error: 'DATABASE_ERROR'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Get current user
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                plan: true,
                createdAt: true,
                lastLogin: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // ✅ FIXED: Ensure role is always properly set and validated for /ME endpoint
        // Note: permissions and roles arrays don't exist in schema - use role string instead
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || 'USER',
            plan: user.plan || 'free',
            permissions: [], // Empty array for compatibility
            roles: [user.role || 'USER'], // Derive from role field
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };
        console.log('🔍 BACKEND /ME RESPONSE:', userData);
        res.json({
            success: true,
            data: { user: userData }
        });
    }
    catch (error) {
        console.error('❌ Get user error:', error);
        console.error('❌ Error code:', error.code);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Forgot password
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email } = req.body;
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }
        // Generate reset token (simple implementation)
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Save reset token to user record
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        // Send password reset email
        try {
            await emailService_1.default.sendPasswordResetEmail(user.email, user.firstName || 'User', resetToken);
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email'
            });
        }
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Reset password
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { token, password } = req.body;
        // Validate password strength
        const passwordValidation = (0, password_1.validatePassword)(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: passwordValidation.errors
            });
        }
        const user = await database_1.default.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        // Hash new password and update user
        const hashedPassword = await (0, password_1.hashPassword)(password);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Verify email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const user = await database_1.default.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerified: false
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }
        // Mark email as verified
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null
            }
        });
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Resend verification email
router.post('/resend-verification', auth_1.authenticate, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }
        // Generate new verification token
        const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: verificationToken
            }
        });
        // Send verification email
        try {
            await emailService_1.default.sendEmail({
                to: user.email,
                subject: 'Verify your SmartPromptIQ account',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Verify Your Email Address</h2>
            <p>Hi ${user.firstName || 'there'},</p>
            <p>Please verify your email address to complete your SmartPromptIQ registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
            </div>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The SmartPromptIQ Team</p>
          </div>
        `
            });
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email'
            });
        }
        res.json({
            success: true,
            message: 'Verification email sent'
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Clear legacy user data (for migration)
router.post('/migrate', async (req, res) => {
    try {
        // This endpoint helps users understand they need to re-register
        res.json({
            success: true,
            message: 'System upgrade complete. Please create a new account to access improved features.',
            data: {
                requiresReregistration: true,
                improvements: [
                    'Real user data display',
                    'Enhanced personalization',
                    'Improved email system',
                    'Better token management',
                    'Secure authentication'
                ]
            }
        });
    }
    catch (error) {
        console.error('Migration info error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN VERIFICATION ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * GET /api/auth/verify-admin
 * Server-side verification of admin role
 *
 * SECURITY: This endpoint verifies the user's role from the DATABASE, not from
 * JWT claims or localStorage. This is the authoritative source for admin access.
 */
router.get('/verify-admin', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                isAdmin: false,
                message: 'Not authenticated'
            });
        }
        // CRITICAL: Query the database directly for the authoritative role
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                isAdmin: false,
                message: 'User not found'
            });
        }
        // Check if user is active
        if (user.isActive === false) {
            console.warn(`⚠️ Inactive user attempted admin access: ${user.email}`);
            return res.status(403).json({
                success: false,
                isAdmin: false,
                message: 'Account is deactivated'
            });
        }
        // AUTHORITATIVE: Check database role, not JWT or localStorage
        const isAdmin = user.role === 'ADMIN';
        console.log(`🔐 Admin verification for ${user.email}: ${isAdmin ? '✅ ADMIN' : '❌ NOT ADMIN'}`);
        return res.json({
            success: true,
            isAdmin,
            role: user.role,
            email: user.email
        });
    }
    catch (error) {
        console.error('❌ Admin verification error:', error);
        return res.status(500).json({
            success: false,
            isAdmin: false,
            message: 'Verification failed'
        });
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SEED ENDPOINT (One-time setup)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * POST /api/auth/seed-admin
 * Creates or updates the admin user
 * Protected by secret key
 */
router.post('/seed-admin', async (req, res) => {
    try {
        const { secret } = req.body;
        const adminSeedSecret = process.env.ADMIN_SEED_SECRET || 'smartpromptiq-admin-seed-2024';
        // Verify seed secret
        if (secret !== adminSeedSecret) {
            console.warn('⚠️ Admin seed attempt with invalid secret');
            return res.status(403).json({
                success: false,
                message: 'Invalid seed secret'
            });
        }
        const adminEmail = 'admin@smartpromptiq.net';
        const adminPassword = 'Admin123!';
        // Check if admin exists
        const existingAdmin = await database_1.default.user.findUnique({
            where: { email: adminEmail }
        });
        const hashedPassword = await (0, password_1.hashPassword)(adminPassword);
        if (existingAdmin) {
            // Update existing admin
            await database_1.default.user.update({
                where: { email: adminEmail },
                data: {
                    role: 'ADMIN',
                    password: hashedPassword
                }
            });
            console.log('✅ Admin user updated:', adminEmail);
            return res.json({
                success: true,
                message: 'Admin user updated successfully',
                data: {
                    email: adminEmail,
                    role: 'ADMIN',
                    action: 'updated'
                }
            });
        }
        // Create new admin
        const admin = await database_1.default.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                plan: 'ENTERPRISE',
                subscriptionTier: 'ENTERPRISE',
                tokenBalance: 999999,
                generationsUsed: 0,
                generationsLimit: 999999,
                isActive: true
            }
        });
        console.log('✅ Admin user created:', adminEmail, admin.id);
        res.json({
            success: true,
            message: 'Admin user created successfully',
            data: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                action: 'created'
            }
        });
    }
    catch (error) {
        console.error('❌ Admin seed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed admin user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
