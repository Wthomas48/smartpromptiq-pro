import { User } from '@prisma/client';
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}
export declare const generateToken: (user: User) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const generateRefreshToken: (userId: string) => string;
//# sourceMappingURL=jwt.d.ts.map