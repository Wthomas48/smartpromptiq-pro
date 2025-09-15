import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-demo';
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-demo';
  return jwt.verify(token, secret) as JWTPayload;
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-demo';
  const options: SignOptions = {
    expiresIn: '30d'
  };
  return jwt.sign({ userId }, secret, options);
};
