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
// Get user's teams
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const teams = await database_1.default.team.findMany({
            where: {
                members: {
                    some: { userId: req.user.id }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, firstName: true, lastName: true }
                        }
                    }
                },
                _count: {
                    select: { members: true, projects: true }
                }
            }
        });
        res.json({
            success: true,
            data: { teams }
        });
    }
    catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Create team
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('name').notEmpty().trim().escape(),
    (0, express_validator_1.body)('description').optional().trim().escape()
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
        const { name, description } = req.body;
        const team = await database_1.default.team.create({
            data: {
                name,
                description,
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'OWNER'
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, firstName: true, lastName: true }
                        }
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Team created successfully',
            data: { team }
        });
    }
    catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Add team member
router.post('/:teamId/members', auth_1.authenticate, [
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
        const { teamId } = req.params;
        // Check if user has permission to add members
        const membership = await database_1.default.teamMember.findFirst({
            where: {
                teamId,
                userId: req.user.id,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        // Find user to add
        const userToAdd = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if already a member
        const existingMember = await database_1.default.teamMember.findFirst({
            where: {
                teamId,
                userId: userToAdd.id
            }
        });
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a team member'
            });
        }
        // Add member
        const newMember = await database_1.default.teamMember.create({
            data: {
                teamId,
                userId: userToAdd.id,
                role: 'MEMBER'
            },
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Member added successfully',
            data: { member: newMember }
        });
    }
    catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
