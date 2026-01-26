"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Optional auth middleware - populates req.user if token exists, but doesn't require it
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next(); // No token, continue without user
        }
        // Let the authenticate middleware handle the token
        return (0, auth_1.authenticate)(req, res, next);
    }
    catch (error) {
        // Token invalid, continue without user
        next();
    }
};
// Generate a unique referral code
function generateReferralCode(firstName) {
    const prefix = firstName
        ? firstName.toUpperCase().slice(0, 4).replace(/[^A-Z]/g, '')
        : 'REF';
    const suffix = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}${suffix}`;
}
// ============================================
// GET /api/referral/my-code - Get or create user's referral code
// ============================================
router.get('/my-code', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // Check if user already has a referral code
        let referralCode = await prisma.referralCode.findUnique({
            where: { userId },
        });
        // If not, create one
        if (!referralCode) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true },
            });
            // Generate unique code
            let code = generateReferralCode(user?.firstName || undefined);
            let attempts = 0;
            while (attempts < 10) {
                const existing = await prisma.referralCode.findUnique({ where: { code } });
                if (!existing)
                    break;
                code = generateReferralCode(user?.firstName || undefined);
                attempts++;
            }
            referralCode = await prisma.referralCode.create({
                data: {
                    userId,
                    code,
                    referrerRewardTokens: 50,
                    refereeRewardTokens: 25,
                },
            });
        }
        // Build the referral link
        const baseUrl = process.env.FRONTEND_URL || 'https://smartpromptiq.com';
        const referralLink = `${baseUrl}/signup?ref=${referralCode.code}`;
        res.json({
            success: true,
            data: {
                code: referralCode.code,
                link: referralLink,
                referrerRewardTokens: referralCode.referrerRewardTokens,
                refereeRewardTokens: referralCode.refereeRewardTokens,
                totalReferrals: referralCode.totalReferrals,
                successfulReferrals: referralCode.successfulReferrals,
                totalEarnings: referralCode.totalEarnings,
                isActive: referralCode.isActive,
            },
        });
    }
    catch (error) {
        console.error('Error getting referral code:', error);
        res.status(500).json({ error: 'Failed to get referral code' });
    }
});
// ============================================
// GET /api/referral/stats - Get detailed referral statistics
// ============================================
router.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const referralCode = await prisma.referralCode.findUnique({
            where: { userId },
            include: {
                referrals: {
                    orderBy: { signedUpAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!referralCode) {
            return res.json({
                success: true,
                data: {
                    hasReferralCode: false,
                    totalReferrals: 0,
                    successfulReferrals: 0,
                    pendingReferrals: 0,
                    totalEarnings: 0,
                    recentReferrals: [],
                },
            });
        }
        // Get counts by status
        const pendingCount = await prisma.referral.count({
            where: {
                referrerId: userId,
                status: { in: ['pending', 'signed_up'] },
            },
        });
        // Get recent rewards
        const recentRewards = await prisma.referralReward.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        // Get milestone progress
        const milestones = [
            { count: 1, bonus: 25, name: 'First Referral' },
            { count: 5, bonus: 50, name: '5 Referrals' },
            { count: 10, bonus: 100, name: '10 Referrals' },
            { count: 25, bonus: 250, name: '25 Referrals' },
            { count: 50, bonus: 500, name: '50 Referrals' },
            { count: 100, bonus: 1000, name: 'Century Club' },
        ];
        const nextMilestone = milestones.find(m => m.count > referralCode.successfulReferrals);
        const currentMilestone = milestones.filter(m => m.count <= referralCode.successfulReferrals).pop();
        res.json({
            success: true,
            data: {
                hasReferralCode: true,
                code: referralCode.code,
                totalReferrals: referralCode.totalReferrals,
                successfulReferrals: referralCode.successfulReferrals,
                pendingReferrals: pendingCount,
                totalEarnings: referralCode.totalEarnings,
                recentReferrals: referralCode.referrals.map(r => ({
                    id: r.id,
                    status: r.status,
                    tokensAwarded: r.referrerTokensAwarded,
                    signedUpAt: r.signedUpAt,
                    convertedAt: r.convertedAt,
                })),
                recentRewards,
                milestones: {
                    current: currentMilestone,
                    next: nextMilestone,
                    progress: nextMilestone
                        ? (referralCode.successfulReferrals / nextMilestone.count) * 100
                        : 100,
                },
            },
        });
    }
    catch (error) {
        console.error('Error getting referral stats:', error);
        res.status(500).json({ error: 'Failed to get referral stats' });
    }
});
// ============================================
// GET /api/referral/leaderboard - Get top referrers
// ============================================
router.get('/leaderboard', async (req, res) => {
    try {
        // Try to get leaderboard, but return empty array if table doesn't exist
        let topReferrers = [];
        try {
            topReferrers = await prisma.referralCode.findMany({
                where: {
                    successfulReferrals: { gt: 0 },
                    isActive: true,
                },
                orderBy: { successfulReferrals: 'desc' },
                take: 10,
                select: {
                    successfulReferrals: true,
                    totalEarnings: true,
                    userId: true,
                },
            });
        }
        catch (dbError) {
            // If table doesn't exist or query fails, return empty leaderboard
            console.log('Leaderboard query failed (table may not exist):', dbError.message);
            return res.json({
                success: true,
                data: [],
                message: 'Leaderboard not available yet',
            });
        }
        // If no referrers found, return empty array
        if (!topReferrers || topReferrers.length === 0) {
            return res.json({
                success: true,
                data: [],
            });
        }
        // Get user names (anonymized)
        const leaderboard = await Promise.all(topReferrers.map(async (r, index) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: r.userId },
                    select: { firstName: true },
                });
                return {
                    rank: index + 1,
                    name: user?.firstName ? `${user.firstName.charAt(0)}***` : 'Anonymous',
                    referrals: r.successfulReferrals,
                    earnings: r.totalEarnings,
                };
            }
            catch {
                return {
                    rank: index + 1,
                    name: 'Anonymous',
                    referrals: r.successfulReferrals,
                    earnings: r.totalEarnings,
                };
            }
        }));
        res.json({
            success: true,
            data: leaderboard,
        });
    }
    catch (error) {
        console.error('Error getting leaderboard:', error);
        // Return empty leaderboard instead of 500 error
        res.json({
            success: true,
            data: [],
            message: 'Leaderboard temporarily unavailable',
        });
    }
});
// ============================================
// POST /api/referral/validate - Validate a referral code (used during signup)
// ============================================
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Referral code is required' });
        }
        const referralCode = await prisma.referralCode.findUnique({
            where: { code: code.toUpperCase() },
            select: {
                id: true,
                code: true,
                refereeRewardTokens: true,
                isActive: true,
                userId: true,
            },
        });
        if (!referralCode) {
            return res.json({
                success: false,
                valid: false,
                message: 'Invalid referral code',
            });
        }
        if (!referralCode.isActive) {
            return res.json({
                success: false,
                valid: false,
                message: 'This referral code is no longer active',
            });
        }
        // Get referrer name for display
        const referrer = await prisma.user.findUnique({
            where: { id: referralCode.userId },
            select: { firstName: true },
        });
        res.json({
            success: true,
            valid: true,
            data: {
                code: referralCode.code,
                bonusTokens: referralCode.refereeRewardTokens,
                referrerName: referrer?.firstName || 'A friend',
                message: `You'll receive ${referralCode.refereeRewardTokens} bonus tokens when you sign up!`,
            },
        });
    }
    catch (error) {
        console.error('Error validating referral code:', error);
        res.status(500).json({ error: 'Failed to validate referral code' });
    }
});
// ============================================
// POST /api/referral/track-signup - Track when a referred user signs up
// ============================================
router.post('/track-signup', async (req, res) => {
    try {
        const { referralCode, newUserId, source, utmCampaign, utmMedium, utmSource } = req.body;
        if (!referralCode || !newUserId) {
            return res.status(400).json({ error: 'Referral code and new user ID are required' });
        }
        // Find the referral code
        const refCode = await prisma.referralCode.findUnique({
            where: { code: referralCode.toUpperCase() },
        });
        if (!refCode || !refCode.isActive) {
            return res.status(400).json({ error: 'Invalid or inactive referral code' });
        }
        // Make sure user isn't referring themselves
        if (refCode.userId === newUserId) {
            return res.status(400).json({ error: 'Cannot use your own referral code' });
        }
        // Check if this referral already exists
        const existingReferral = await prisma.referral.findUnique({
            where: {
                referrerId_refereeId: {
                    referrerId: refCode.userId,
                    refereeId: newUserId,
                },
            },
        });
        if (existingReferral) {
            return res.json({
                success: true,
                message: 'Referral already tracked',
                referralId: existingReferral.id,
            });
        }
        // Create the referral record
        const referral = await prisma.referral.create({
            data: {
                referralCodeId: refCode.id,
                referrerId: refCode.userId,
                refereeId: newUserId,
                status: 'signed_up',
                referralSource: source || 'signup',
                utmCampaign,
                utmMedium,
                utmSource,
            },
        });
        // Update referral code stats
        await prisma.referralCode.update({
            where: { id: refCode.id },
            data: {
                totalReferrals: { increment: 1 },
            },
        });
        // Award tokens to the new user (referee)
        await prisma.user.update({
            where: { id: newUserId },
            data: {
                tokenBalance: { increment: refCode.refereeRewardTokens },
            },
        });
        // Update referral with referee reward
        await prisma.referral.update({
            where: { id: referral.id },
            data: {
                refereeRewarded: true,
                refereeRewardDate: new Date(),
                refereeTokensAwarded: refCode.refereeRewardTokens,
            },
        });
        // Create reward record for referee
        await prisma.referralReward.create({
            data: {
                userId: newUserId,
                type: 'referee_welcome',
                tokens: refCode.refereeRewardTokens,
                description: 'Welcome bonus for signing up with a referral code',
                referralId: referral.id,
            },
        });
        // Create token transaction for referee
        const user = await prisma.user.findUnique({
            where: { id: newUserId },
            select: { tokenBalance: true },
        });
        await prisma.tokenTransaction.create({
            data: {
                userId: newUserId,
                type: 'bonus',
                tokens: refCode.refereeRewardTokens,
                balanceBefore: (user?.tokenBalance || 0) - refCode.refereeRewardTokens,
                balanceAfter: user?.tokenBalance || 0,
                description: 'Referral welcome bonus',
            },
        });
        res.json({
            success: true,
            message: 'Referral tracked successfully',
            referralId: referral.id,
            bonusTokens: refCode.refereeRewardTokens,
        });
    }
    catch (error) {
        console.error('Error tracking referral signup:', error);
        res.status(500).json({ error: 'Failed to track referral' });
    }
});
// ============================================
// POST /api/referral/track-conversion - Track when a referred user converts (makes purchase)
// ============================================
router.post('/track-conversion', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        // Find any pending referral for this user
        const referral = await prisma.referral.findFirst({
            where: {
                refereeId: userId,
                status: 'signed_up',
                referrerRewarded: false,
            },
            include: {
                referralCode: true,
            },
        });
        if (!referral) {
            return res.json({
                success: true,
                message: 'No pending referral found for this user',
            });
        }
        // Award tokens to the referrer
        await prisma.user.update({
            where: { id: referral.referrerId },
            data: {
                tokenBalance: { increment: referral.referralCode.referrerRewardTokens },
            },
        });
        // Update referral status
        await prisma.referral.update({
            where: { id: referral.id },
            data: {
                status: 'converted',
                referrerRewarded: true,
                referrerRewardDate: new Date(),
                referrerTokensAwarded: referral.referralCode.referrerRewardTokens,
                convertedAt: new Date(),
            },
        });
        // Update referral code stats
        await prisma.referralCode.update({
            where: { id: referral.referralCodeId },
            data: {
                successfulReferrals: { increment: 1 },
                totalEarnings: { increment: referral.referralCode.referrerRewardTokens },
            },
        });
        // Create reward record for referrer
        await prisma.referralReward.create({
            data: {
                userId: referral.referrerId,
                type: 'referrer_conversion',
                tokens: referral.referralCode.referrerRewardTokens,
                description: 'Reward for successful referral conversion',
                referralId: referral.id,
            },
        });
        // Create token transaction for referrer
        const referrer = await prisma.user.findUnique({
            where: { id: referral.referrerId },
            select: { tokenBalance: true },
        });
        await prisma.tokenTransaction.create({
            data: {
                userId: referral.referrerId,
                type: 'bonus',
                tokens: referral.referralCode.referrerRewardTokens,
                balanceBefore: (referrer?.tokenBalance || 0) - referral.referralCode.referrerRewardTokens,
                balanceAfter: referrer?.tokenBalance || 0,
                description: 'Referral reward - friend made a purchase',
            },
        });
        // Check for milestone bonuses
        const referralCode = await prisma.referralCode.findUnique({
            where: { id: referral.referralCodeId },
        });
        if (referralCode) {
            const milestones = [
                { count: 1, bonus: 25, name: 'first_referral' },
                { count: 5, bonus: 50, name: '5_referrals' },
                { count: 10, bonus: 100, name: '10_referrals' },
                { count: 25, bonus: 250, name: '25_referrals' },
                { count: 50, bonus: 500, name: '50_referrals' },
                { count: 100, bonus: 1000, name: '100_referrals' },
            ];
            const milestone = milestones.find(m => m.count === referralCode.successfulReferrals);
            if (milestone) {
                // Check if milestone was already awarded
                const existingMilestone = await prisma.referralReward.findFirst({
                    where: {
                        userId: referral.referrerId,
                        milestoneType: milestone.name,
                    },
                });
                if (!existingMilestone) {
                    // Award milestone bonus
                    await prisma.user.update({
                        where: { id: referral.referrerId },
                        data: {
                            tokenBalance: { increment: milestone.bonus },
                        },
                    });
                    await prisma.referralReward.create({
                        data: {
                            userId: referral.referrerId,
                            type: 'milestone_bonus',
                            tokens: milestone.bonus,
                            description: `Milestone bonus: ${milestone.name.replace('_', ' ')}`,
                            milestoneType: milestone.name,
                        },
                    });
                }
            }
        }
        res.json({
            success: true,
            message: 'Conversion tracked and rewards distributed',
            referrerId: referral.referrerId,
            tokensAwarded: referral.referralCode.referrerRewardTokens,
        });
    }
    catch (error) {
        console.error('Error tracking conversion:', error);
        res.status(500).json({ error: 'Failed to track conversion' });
    }
});
// ============================================
// GET /api/referral/history - Get referral history for user
// ============================================
router.get('/history', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [referrals, total] = await Promise.all([
            prisma.referral.findMany({
                where: { referrerId: userId },
                orderBy: { signedUpAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.referral.count({
                where: { referrerId: userId },
            }),
        ]);
        res.json({
            success: true,
            data: {
                referrals: referrals.map(r => ({
                    id: r.id,
                    status: r.status,
                    referrerTokensAwarded: r.referrerTokensAwarded,
                    refereeTokensAwarded: r.refereeTokensAwarded,
                    signedUpAt: r.signedUpAt,
                    convertedAt: r.convertedAt,
                    source: r.referralSource,
                })),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        console.error('Error getting referral history:', error);
        res.status(500).json({ error: 'Failed to get referral history' });
    }
});
// ============================================
// POST /api/referral/customize-code - Customize referral code (premium feature)
// ============================================
router.post('/customize-code', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { newCode } = req.body;
        if (!newCode) {
            return res.status(400).json({ error: 'New code is required' });
        }
        // Validate code format (alphanumeric, 4-12 chars)
        const codeRegex = /^[A-Z0-9]{4,12}$/;
        const normalizedCode = newCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!codeRegex.test(normalizedCode)) {
            return res.status(400).json({
                error: 'Code must be 4-12 alphanumeric characters'
            });
        }
        // Check if code is already taken
        const existing = await prisma.referralCode.findUnique({
            where: { code: normalizedCode },
        });
        if (existing && existing.userId !== userId) {
            return res.status(400).json({ error: 'This code is already taken' });
        }
        // Update the code
        const updated = await prisma.referralCode.update({
            where: { userId },
            data: { code: normalizedCode },
        });
        const baseUrl = process.env.FRONTEND_URL || 'https://smartpromptiq.com';
        res.json({
            success: true,
            data: {
                code: updated.code,
                link: `${baseUrl}/signup?ref=${updated.code}`,
            },
        });
    }
    catch (error) {
        console.error('Error customizing code:', error);
        res.status(500).json({ error: 'Failed to customize referral code' });
    }
});
exports.default = router;
