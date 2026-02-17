import { Socket } from 'socket.io';
import { verifyToken, JWTPayload } from '../utils/jwt';
import prisma from '../config/database';
import jwt from 'jsonwebtoken';

// ============================================
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// Reuses the same dual-auth strategy as REST middleware (auth.ts)
// ============================================

export interface SocketUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Socket.io authentication middleware
 * Extracts JWT from socket.handshake.auth.token
 * Strategy 1: Backend JWT via verifyToken()
 * Strategy 2: Supabase JWT via jwt.verify()
 */
export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== 'string') {
    return next(new Error('Authentication required'));
  }

  // Strategy 1: Backend JWT
  try {
    const decoded = verifyToken(token) as JWTPayload;
    if (decoded?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });
      if (user) {
        socket.data.user = user as SocketUser;
        return next();
      }
    }
  } catch (err: any) {
    // Fall through to Strategy 2
    if (isDevelopment) console.log('🔌 Socket auth Strategy 1 (Backend JWT) failed:', err.message);
  }

  // Strategy 2: Supabase JWT
  try {
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    const secret = supabaseJwtSecret || (isDevelopment ? process.env.JWT_SECRET : null);

    if (!secret) {
      console.warn('🔌 Socket auth: No SUPABASE_JWT_SECRET configured');
    } else {
      const decoded = jwt.verify(token, secret) as any;
      if (decoded?.sub && decoded?.email) {
        // Look up user by email first
        let user = await prisma.user.findUnique({
          where: { email: decoded.email },
          select: { id: true, email: true, firstName: true, lastName: true, role: true },
        });
        // Try by Supabase sub ID
        if (!user) {
          user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
          });
        }
        // Auto-create user if not found (same as REST auth findOrCreateSupabaseUser)
        if (!user) {
          try {
            const created = await prisma.user.create({
              data: {
                id: decoded.sub,
                email: decoded.email,
                password: '',
                firstName: decoded.email.split('@')[0],
                lastName: '',
                role: 'USER',
                plan: 'free',
                tokenBalance: 100,
                subscriptionStatus: 'active',
              },
            });
            user = { id: created.id, email: created.email, firstName: created.firstName, lastName: created.lastName, role: created.role };
            console.log(`🔌 Socket auth: Auto-created user ${decoded.email}`);
          } catch (createErr: any) {
            if (createErr.code === 'P2002') {
              user = await prisma.user.findUnique({
                where: { email: decoded.email },
                select: { id: true, email: true, firstName: true, lastName: true, role: true },
              });
            }
          }
        }
        if (user) {
          socket.data.user = user as SocketUser;
          return next();
        }
        console.warn(`🔌 Socket auth: JWT valid for ${decoded.email} but could not resolve user`);
      }
    }
  } catch (err: any) {
    console.warn('🔌 Socket auth Strategy 2 (Supabase JWT) failed:', err.message);
  }

  next(new Error('Invalid or expired token'));
};
