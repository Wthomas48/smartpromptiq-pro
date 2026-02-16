import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getTokenCost } from '../config/costs';
import { deductTokens } from '../middleware/costTracking';
import {
  executeCode,
  getRuntimes,
  SUPPORTED_LANGUAGES,
  CODE_TEMPLATES,
} from '../services/codeExecutionService';

const router = express.Router();

// ============================================
// GET /api/code/languages
// List supported languages with templates
// ============================================

router.get('/languages', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        languages: SUPPORTED_LANGUAGES,
        templates: CODE_TEMPLATES,
      },
    });
  } catch (error) {
    console.error('Languages list error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================
// GET /api/code/runtimes
// List all available Piston runtimes
// ============================================

router.get('/runtimes', authenticate, async (req: Request, res: Response) => {
  try {
    const runtimes = await getRuntimes();
    res.json({
      success: true,
      data: { runtimes },
    });
  } catch (error: any) {
    console.error('Runtimes error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch runtimes' });
  }
});

// ============================================
// POST /api/code/execute
// Execute code in sandboxed environment
// ============================================

router.post(
  '/execute',
  authenticate,
  [
    body('language').notEmpty().trim().withMessage('Language is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('stdin').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const userId = (req as AuthRequest).user!.id;
      const { language, code, stdin } = req.body;

      // Deduct tokens
      const tokenCost = getTokenCost('code' as any, 'execute');
      const deducted = await deductTokens(userId, tokenCost);
      if (!deducted) {
        return res.status(402).json({ success: false, error: 'Insufficient tokens' });
      }

      // Execute code
      const result = await executeCode(language, code, { stdin });

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
    } catch (error: any) {
      console.error('Code execution error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Code execution failed' });
    }
  }
);

export default router;
