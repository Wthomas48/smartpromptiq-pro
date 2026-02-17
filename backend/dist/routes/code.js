"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const costs_1 = require("../config/costs");
const costTracking_1 = require("../middleware/costTracking");
const codeExecutionService_1 = require("../services/codeExecutionService");
const router = express_1.default.Router();
// ============================================
// GET /api/code/languages
// List supported languages with templates
// ============================================
router.get('/languages', auth_1.authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                languages: codeExecutionService_1.SUPPORTED_LANGUAGES,
                templates: codeExecutionService_1.CODE_TEMPLATES,
            },
        });
    }
    catch (error) {
        console.error('Languages list error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// ============================================
// GET /api/code/runtimes
// List all available Piston runtimes
// ============================================
router.get('/runtimes', auth_1.authenticate, async (req, res) => {
    try {
        const runtimes = await (0, codeExecutionService_1.getRuntimes)();
        res.json({
            success: true,
            data: { runtimes },
        });
    }
    catch (error) {
        console.error('Runtimes error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch runtimes' });
    }
});
// ============================================
// POST /api/code/execute
// Execute code in sandboxed environment
// ============================================
router.post('/execute', auth_1.authenticate, [
    (0, express_validator_1.body)('language').notEmpty().trim().withMessage('Language is required'),
    (0, express_validator_1.body)('code').notEmpty().withMessage('Code is required'),
    (0, express_validator_1.body)('stdin').optional().isString(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const userId = req.user.id;
        const { language, code, stdin } = req.body;
        // Deduct tokens
        const tokenCost = (0, costs_1.getTokenCost)('code', 'execute');
        const deducted = await (0, costTracking_1.deductTokens)(userId, tokenCost);
        if (!deducted) {
            return res.status(402).json({ success: false, error: 'Insufficient tokens' });
        }
        // Execute code
        const result = await (0, codeExecutionService_1.executeCode)(language, code, { stdin });
        return res.json({
            success: true,
            data: {
                language: result.language,
                version: result.version,
                run: {
                    stdout: result.run.stdout,
                    stderr: result.run.stderr,
                    exitCode: result.run.code,
                    signal: result.run.signal,
                    output: result.run.output,
                },
                compile: result.compile
                    ? {
                        stdout: result.compile.stdout,
                        stderr: result.compile.stderr,
                        exitCode: result.compile.code,
                        output: result.compile.output,
                    }
                    : null,
                tokensUsed: tokenCost,
            },
        });
    }
    catch (error) {
        console.error('Code execution error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Code execution failed' });
    }
});
exports.default = router;
