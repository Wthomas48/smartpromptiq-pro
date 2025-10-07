import express from 'express';
import { body, validationResult } from 'express-validator';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import emailService from '../utils/emailService';

const router = express.Router();

// Enhanced validation with detailed error messages
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty if provided'),
  body('lastName')
    .optional()
    .trim()
];

// Enhanced error handler middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
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
        field: (err as any).param,
        message: err.msg,
        value: typeof (err as any).value === 'string' ? (err as any).value.substring(0, 50) : (err as any).value,
        location: (err as any).location
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
router.post('/register', registerValidation, handleValidationErrors, async (req: express.Request, res: express.Response) => {
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
    const passwordValidation = validatePassword(password);
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
    const existingUser = await prisma.user.findUnique({
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
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
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

    const token = generateToken(user);
    const verificationToken = generateToken({ userId: user.id, type: 'email_verification' });

    // Send welcome email and verification email (non-blocking)
    setImmediate(async () => {
      try {
        await emailService.sendWelcomeEmail(user.email, user.firstName || 'User');
        console.log(`Welcome email sent to ${user.email}`);

        // Send email verification
        await emailService.sendEmail({
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
      } catch (error) {
        console.error('Failed to send emails:', error);
        // Email failure doesn't affect registration success
      }
    });

    // ✅ FIXED: Ensure role is always properly set and validated for REGISTER
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan || user.subscriptionTier || 'free',
      role: user.role || 'USER',
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      roles: Array.isArray(user.roles) ? user.roles : []
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
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
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
    const user = await prisma.user.findUnique({
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
    const isPasswordValid = await comparePassword(password, user.password);
    console.log('🔐 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateToken(user);

    // ✅ FIXED: Ensure role is always properly set and validated for LOGIN
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan || user.subscriptionTier || 'free',
      role: user.role || 'USER',
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      roles: Array.isArray(user.roles) ? user.roles : []
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'USER',
      plan: user.plan || user.subscriptionTier || 'free',
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      roles: Array.isArray(user.roles) ? user.roles : [],
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    console.log('🔍 BACKEND /ME RESPONSE:', userData);

    res.json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({
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
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.firstName || 'User',
        resetToken
      );
    } catch (error) {
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
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: passwordValidation.errors
      });
    }

    const user = await prisma.user.findFirst({
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
    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
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
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify email
router.get('/verify-email/:token', async (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
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
    await prisma.user.update({
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
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resend verification email
router.post('/resend-verification', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken
      }
    });

    // Send verification email
    try {
      await emailService.sendEmail({
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
    } catch (error) {
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
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Clear legacy user data (for migration)
router.post('/migrate', async (req: express.Request, res: express.Response) => {
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
  } catch (error) {
    console.error('Migration info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
