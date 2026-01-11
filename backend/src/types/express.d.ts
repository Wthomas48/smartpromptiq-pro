// Express Request type augmentation
// Adds user property to Express Request from JWT authentication middleware

declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role?: string;
      subscriptionTier?: string;
      firstName?: string;
      lastName?: string;
    };
  }
}
