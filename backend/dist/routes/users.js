"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Get user profile
router.get('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            include: {
                projects: { take: 5, orderBy: { updatedAt: 'desc' } },
                generations: { take: 10, orderBy: { createdAt: 'desc' } },
                _count: {
                    select: {
                        projects: true,
                        generations: true,
                        templates: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Update user profile
router.put('/profile', auth_1.authenticate, [
    (0, express_validator_1.body)('firstName').optional().trim().escape(),
    (0, express_validator_1.body)('lastName').optional().trim().escape(),
    (0, express_validator_1.body)('avatar').optional().isURL()
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
        const { firstName, lastName, avatar } = req.body;
        const user = await database_1.default.user.update({
            where: { id: req.user.id },
            data: {
                firstName,
                lastName,
                avatar
            }
        });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get user usage stats
router.get('/usage', auth_1.authenticate, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                generationsUsed: true,
                generationsLimit: true,
                plan: true
            }
        });
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const monthlyUsage = await database_1.default.generation.count({
            where: {
                userId: req.user.id,
                createdAt: { gte: thisMonth }
            }
        });
        res.json({
            success: true,
            data: {
                user,
                monthlyUsage,
                usagePercentage: (user.generationsUsed / user.generationsLimit) * 100
            }
        });
    }
    catch (error) {
        console.error('Get usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
