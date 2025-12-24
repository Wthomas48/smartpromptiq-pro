import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
    const decoded = verifyToken(token) as JWTPayload;

    // Verify user still exists
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

/**
 * Optional authentication for billing routes
 * Allows guest checkout but enriches request with user data if authenticated
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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

    // Try to decode JWT token
    try {
      const decoded = verifyToken(token) as JWTPayload;

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role
        };
        console.log(`✅ Authenticated user: ${user.email}`);
      } else {
        console.log(`⚠️ User not found in DB - allowing guest access`);
        req.user = undefined;
      }
    } catch (jwtError) {
      console.log(`⚠️ JWT decode failed - allowing guest access:`, jwtError);
      req.user = undefined;
    }

    next();
  } catch (error) {
    console.error(`❌ Optional auth error:`, error);
    // On error, allow guest access
    req.user = undefined;
    next();
  }
};
