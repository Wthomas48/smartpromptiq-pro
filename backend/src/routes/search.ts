import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getTokenCost } from '../config/costs';
import { deductTokens } from '../middleware/costTracking';
import {
  isSearchConfigured,
  searchWeb,
  searchAndSynthesize,
  SearchOptions,
} from '../services/searchService';

const router = express.Router();

// ============================================
// GET /api/search/status
// Check if web search is configured
// ============================================

router.get('/status', authenticate, async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        configured: isSearchConfigured(),
      },
    });
  } catch (error) {
    console.error('Search status error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================
// POST /api/search
// Raw web search (returns results only)
// ============================================

router.post(
  '/',
  authenticate,
  [
    body('query').notEmpty().trim().isLength({ min: 2, max: 500 }).withMessage('Query must be 2-500 characters'),
    body('searchDepth').optional().isIn(['basic', 'advanced']).withMessage('searchDepth must be basic or advanced'),
    body('maxResults').optional().isInt({ min: 1, max: 10 }).withMessage('maxResults must be 1-10'),
    body('topic').optional().isIn(['general', 'news']).withMessage('topic must be general or news'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      if (!isSearchConfigured()) {
        return res.status(503).json({ success: false, message: 'Web search is not configured' });
      }

      const userId = (req as AuthRequest).user!.id;
      const { query, searchDepth = 'basic', maxResults, topic } = req.body;

      // Deduct tokens
      const costKey = searchDepth === 'advanced' ? 'search-advanced' : 'search-basic';
      const tokenCost = getTokenCost('search' as any, costKey);
      const deducted = await deductTokens(userId, tokenCost);
      if (!deducted) {
        return res.status(402).json({ success: false, message: 'Insufficient tokens' });
      }

      const options: SearchOptions = { searchDepth, maxResults, topic };
      const result = await searchWeb(query, options);

      return res.json({
        success: true,
        data: {
          ...result,
          tokensUsed: tokenCost,
        },
      });
    } catch (error: any) {
      console.error('Web search error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Web search failed' });
    }
  }
);

// ============================================
// POST /api/search/synthesize
// Search + AI synthesis with citations
// ============================================

router.post(
  '/synthesize',
  authenticate,
  [
    body('query').notEmpty().trim().isLength({ min: 2, max: 500 }).withMessage('Query must be 2-500 characters'),
    body('searchDepth').optional().isIn(['basic', 'advanced']).withMessage('searchDepth must be basic or advanced'),
    body('maxResults').optional().isInt({ min: 1, max: 10 }).withMessage('maxResults must be 1-10'),
    body('topic').optional().isIn(['general', 'news']).withMessage('topic must be general or news'),
    body('provider').optional().isIn(['openai', 'anthropic', 'gemini']).withMessage('Invalid provider'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      if (!isSearchConfigured()) {
        return res.status(503).json({ success: false, message: 'Web search is not configured' });
      }

      const userId = (req as AuthRequest).user!.id;
      const { query, searchDepth = 'basic', maxResults, topic, provider } = req.body;

      // Deduct tokens
      const costKey = searchDepth === 'advanced' ? 'synthesize-advanced' : 'synthesize-basic';
      const tokenCost = getTokenCost('search' as any, costKey);
      const deducted = await deductTokens(userId, tokenCost);
      if (!deducted) {
        return res.status(402).json({ success: false, message: 'Insufficient tokens' });
      }

      const options: SearchOptions = { searchDepth, maxResults, topic };
      const result = await searchAndSynthesize(query, options, provider);

      return res.json({
        success: true,
        data: {
          answer: result.answer,
          sources: result.sources,
          query: result.searchResult.query,
          provider: result.provider,
          model: result.model,
          usage: result.usage,
          searchDepth: result.searchResult.searchDepth,
          timeTakenMs: result.searchResult.timeTakenMs,
          tokensUsed: tokenCost,
        },
      });
    } catch (error: any) {
      console.error('Search synthesis error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Search synthesis failed' });
    }
  }
);

export default router;
