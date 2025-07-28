import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { users } from '../db.js';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Generate a unique ID for the user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with your schema
    const [newUser] = await db.insert(users).values({
      id: userId,
      email,
      firstName,
      lastName,
      subscriptionTier: 'free',
      tokenBalance: 10, // Free tier gets 10 tokens
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Create token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        subscriptionTier: newUser.subscriptionTier,
        tokenBalance: newUser.tokenBalance
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For Replit Auth integration, check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionTier: user.subscriptionTier,
        tokenBalance: user.tokenBalance,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscriptionTier: user.subscriptionTier,
      tokenBalance: user.tokenBalance,
      profileImageUrl: user.profileImageUrl,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionStatus: user.subscriptionStatus
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update token balance after usage
router.post('/use-tokens', authMiddleware, async (req, res) => {
  try {
    const { tokensUsed, promptId, operation } = req.body;
    const userId = req.user.userId;

    // Get current user
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough tokens
    if (user.tokenBalance < tokensUsed) {
      return res.status(403).json({ error: 'Insufficient tokens' });
    }

    // Update user's token balance
    await db.update(users)
      .set({ 
        tokenBalance: user.tokenBalance - tokensUsed,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Record token usage
    await db.insert(tokenUsage).values({
      userId,
      promptId,
      tokensUsed,
      operation,
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      remainingTokens: user.tokenBalance - tokensUsed 
    });
  } catch (error) {
    console.error('Token usage error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
