import express, { Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { getTokenCost } from '../config/costs';
import { deductTokens } from '../middleware/costTracking';
import { supabase, IMAGE_OUTPUT_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from '../lib/supabase';
import OpenAI from 'openai';

const router = express.Router();

// ============================================
// OPENAI CLIENT
// ============================================

const openaiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
  openai = new OpenAI({ apiKey: openaiKey });
  console.log('🎨 Image Routes: OpenAI DALL-E ready');
} else {
  console.warn('⚠️ Image Routes: OpenAI not configured - image generation unavailable');
}

// ============================================
// TYPES
// ============================================

type ImageSize = '1024x1024' | '1792x1024' | '1024x1792';
type ImageQuality = 'standard' | 'hd';
type ImageStyle = 'vivid' | 'natural';

const VALID_SIZES: ImageSize[] = ['1024x1024', '1792x1024', '1024x1792'];
const VALID_QUALITIES: ImageQuality[] = ['standard', 'hd'];
const VALID_STYLES: ImageStyle[] = ['vivid', 'natural'];

// Image signed URLs expire in 1 hour (longer than audio since images are browsed)
const IMAGE_URL_EXPIRY = 3600;

// ============================================
// POST /api/images/generate
// ============================================

router.post('/generate', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  if (!openai) {
    return res.status(503).json({ success: false, error: 'Image generation is not configured' });
  }

  try {
    const {
      prompt,
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
    } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    if (prompt.length > 4000) {
      return res.status(400).json({ success: false, error: 'Prompt must be under 4000 characters' });
    }

    // Validate options
    if (!VALID_SIZES.includes(size)) {
      return res.status(400).json({ success: false, error: `Invalid size. Must be one of: ${VALID_SIZES.join(', ')}` });
    }

    if (!VALID_QUALITIES.includes(quality)) {
      return res.status(400).json({ success: false, error: `Invalid quality. Must be: standard or hd` });
    }

    if (!VALID_STYLES.includes(style)) {
      return res.status(400).json({ success: false, error: `Invalid style. Must be: vivid or natural` });
    }

    // Calculate token cost
    const tokenFeature = quality === 'hd' ? 'dalle-3-hd' : 'dalle-3';
    const tokenCost = getTokenCost('image', tokenFeature);

    // Check user token balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    if (!user || user.tokenBalance < tokenCost) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient tokens',
        required: tokenCost,
        balance: user?.tokenBalance || 0,
      });
    }

    // Call DALL-E 3 API
    console.log(`🎨 Generating image for user ${userId}: "${prompt.substring(0, 80)}..." [${size}, ${quality}, ${style}]`);
    const startTime = Date.now();

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt.trim(),
      n: 1,
      size: size as any,
      quality: quality as any,
      style: style as any,
      response_format: 'b64_json',
    });

    const imageData = response.data[0];
    if (!imageData?.b64_json) {
      return res.status(500).json({ success: false, error: 'Image generation failed - no data returned' });
    }

    const revisedPrompt = imageData.revised_prompt || prompt;
    const responseTime = Date.now() - startTime;
    console.log(`✅ Image generated in ${responseTime}ms`);

    // Calculate actual API cost based on size and quality
    let apiCost = quality === 'hd' ? 0.08 : 0.04;
    if (size !== '1024x1024') {
      apiCost = quality === 'hd' ? 0.12 : 0.08; // Non-square costs more
    }

    // Upload to Supabase Storage
    const imageBuffer = Buffer.from(imageData.b64_json, 'base64');
    const fileName = `${userId}-${Date.now()}.png`;
    let imageUrl: string;
    let filePath: string | null = null;
    let isSignedUrl = false;

    if (supabase) {
      const date = new Date().toISOString().split('T')[0];
      const storagePath = `${date}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(IMAGE_OUTPUT_BUCKET)
        .upload(storagePath, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '86400', // Cache for 24 hours
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Supabase image upload failed:', uploadError.message);
        // Fallback to base64 data URL
        imageUrl = `data:image/png;base64,${imageData.b64_json}`;
      } else {
        // Generate signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(IMAGE_OUTPUT_BUCKET)
          .createSignedUrl(storagePath, IMAGE_URL_EXPIRY);

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error('❌ Signed URL generation failed:', signedUrlError?.message);
          imageUrl = `data:image/png;base64,${imageData.b64_json}`;
        } else {
          imageUrl = signedUrlData.signedUrl;
          filePath = storagePath;
          isSignedUrl = true;
          console.log(`📤 Image uploaded to Supabase: ${storagePath}`);
        }
      }
    } else {
      // No Supabase configured - return base64
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    }

    // Find or create a default project for storing the generation
    let imageProject = await prisma.project.findFirst({
      where: { userId, category: 'image' },
      select: { id: true },
    });
    if (!imageProject) {
      imageProject = await prisma.project.create({
        data: { userId, title: 'Image Generations', category: 'image' },
      });
    }

    // Save to Generation model
    const generation = await prisma.generation.create({
      data: {
        userId,
        projectId: imageProject.id,
        prompt: prompt.trim(),
        response: filePath || imageUrl.substring(0, 500), // Store path or truncated URL
        model: 'dall-e-3',
        category: 'image',
        tokenCount: tokenCost,
        cost: apiCost,
        metadata: JSON.stringify({
          size,
          quality,
          style,
          storagePath: filePath,
          bucket: IMAGE_OUTPUT_BUCKET,
          revisedPrompt,
          responseTime,
        }),
      },
    });

    // Deduct tokens
    await deductTokens(userId, tokenCost);

    // Log usage
    await prisma.usageLog.create({
      data: {
        userId,
        action: 'image:generate',
        tokensUsed: tokenCost,
        cost: apiCost,
        provider: 'openai',
        model: `dall-e-3-${quality}`,
        responseTime,
        metadata: JSON.stringify({ size, quality, style, generationId: generation.id }),
      },
    });

    console.log(`💰 Image cost: ${tokenCost} tokens, $${apiCost.toFixed(4)} API cost`);

    res.json({
      success: true,
      imageUrl,
      isSignedUrl,
      expiresIn: isSignedUrl ? IMAGE_URL_EXPIRY : null,
      filePath,
      revisedPrompt,
      model: 'dall-e-3',
      size,
      quality,
      style,
      tokensUsed: tokenCost,
      apiCost,
      generationId: generation.id,
    });
  } catch (error: any) {
    console.error('❌ Image generation error:', error);

    // Handle OpenAI-specific errors
    if (error?.status === 400 && error?.error?.code === 'content_policy_violation') {
      return res.status(400).json({
        success: false,
        error: 'Your prompt was rejected by the content safety filter. Please modify your prompt and try again.',
      });
    }

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit reached. Please wait a moment and try again.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Image generation failed. Please try again.',
    });
  }
});

// ============================================
// GET /api/images/history
// ============================================

router.get('/history', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      prisma.generation.findMany({
        where: { userId, category: 'image' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          prompt: true,
          response: true,
          model: true,
          tokenCount: true,
          cost: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.generation.count({
        where: { userId, category: 'image' },
      }),
    ]);

    // Regenerate signed URLs for images stored in Supabase
    const imagesWithUrls = await Promise.all(
      images.map(async (img) => {
        let imageUrl = img.response;
        let metadata: any = {};

        try {
          metadata = img.metadata ? JSON.parse(img.metadata) : {};
        } catch {
          metadata = {};
        }

        // If stored in Supabase, regenerate signed URL
        if (metadata.storagePath && supabase) {
          try {
            const { data, error } = await supabase.storage
              .from(metadata.bucket || IMAGE_OUTPUT_BUCKET)
              .createSignedUrl(metadata.storagePath, IMAGE_URL_EXPIRY);

            if (data?.signedUrl && !error) {
              imageUrl = data.signedUrl;
            }
          } catch {
            // Keep existing URL as fallback
          }
        }

        return {
          id: img.id,
          prompt: img.prompt,
          imageUrl,
          model: img.model,
          size: metadata.size || '1024x1024',
          quality: metadata.quality || 'standard',
          style: metadata.style || 'vivid',
          revisedPrompt: metadata.revisedPrompt,
          tokensUsed: img.tokenCount,
          createdAt: img.createdAt,
        };
      })
    );

    res.json({
      success: true,
      images: imagesWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Image history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch image history' });
  }
});

// ============================================
// GET /api/images/refresh-url/:id
// ============================================

router.get('/refresh-url/:id', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const generation = await prisma.generation.findFirst({
      where: { id: req.params.id, userId, category: 'image' },
      select: { metadata: true },
    });

    if (!generation) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    const metadata = generation.metadata ? JSON.parse(generation.metadata) : {};

    if (!metadata.storagePath || !supabase) {
      return res.status(400).json({ success: false, error: 'Image URL cannot be refreshed' });
    }

    const { data, error } = await supabase.storage
      .from(metadata.bucket || IMAGE_OUTPUT_BUCKET)
      .createSignedUrl(metadata.storagePath, IMAGE_URL_EXPIRY);

    if (error || !data?.signedUrl) {
      return res.status(500).json({ success: false, error: 'Failed to refresh URL' });
    }

    res.json({
      success: true,
      imageUrl: data.signedUrl,
      expiresIn: IMAGE_URL_EXPIRY,
    });
  } catch (error) {
    console.error('❌ URL refresh error:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh URL' });
  }
});

// ============================================
// DELETE /api/images/:id
// ============================================

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const generation = await prisma.generation.findFirst({
      where: { id: req.params.id, userId, category: 'image' },
      select: { id: true, metadata: true },
    });

    if (!generation) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Delete from Supabase Storage if stored there
    const metadata = generation.metadata ? JSON.parse(generation.metadata) : {};
    if (metadata.storagePath && supabase) {
      try {
        await supabase.storage
          .from(metadata.bucket || IMAGE_OUTPUT_BUCKET)
          .remove([metadata.storagePath]);
      } catch (storageError) {
        console.error('⚠️ Failed to delete from storage:', storageError);
        // Continue with DB deletion even if storage delete fails
      }
    }

    // Delete from database
    await prisma.generation.delete({
      where: { id: generation.id },
    });

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('❌ Image delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete image' });
  }
});

// ============================================
// VISION / IMAGE ANALYSIS ENDPOINTS
// ============================================

import { analyzeImage, isVisionConfigured, getVisionProviders } from '../services/visionService';

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// GET /api/images/vision/status
router.get('/vision/status', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        configured: isVisionConfigured(),
        providers: getVisionProviders(),
      },
    });
  } catch (error) {
    console.error('Vision status error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/images/analyze
router.post('/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { imageData, mimeType, prompt, provider, fileName } = req.body;

    // Validate inputs
    if (!imageData || !mimeType || !prompt) {
      return res.status(400).json({ success: false, error: 'imageData, mimeType, and prompt are required' });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported image type: ${mimeType}. Supported: JPEG, PNG, GIF, WebP`,
      });
    }

    if (typeof prompt !== 'string' || prompt.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Prompt must be at least 2 characters' });
    }

    // Check image size
    const imageBuffer = Buffer.from(imageData, 'base64');
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return res.status(400).json({ success: false, error: 'Image exceeds 20 MB limit' });
    }

    // Deduct tokens
    const tokenCost = getTokenCost('vision' as any, 'analyze-standard');
    const deducted = await deductTokens(userId, tokenCost);
    if (!deducted) {
      return res.status(402).json({ success: false, error: 'Insufficient tokens' });
    }

    // Analyze image
    const result = await analyzeImage(imageData, mimeType, prompt.trim(), { provider });

    // Find or create a default project for storing the generation
    let defaultProject = await prisma.project.findFirst({
      where: { userId, category: 'image-vision' },
      select: { id: true },
    });
    if (!defaultProject) {
      defaultProject = await prisma.project.create({
        data: { userId, title: 'Vision Analyses', category: 'image-vision' },
      });
    }

    // Store analysis in database
    const generation = await prisma.generation.create({
      data: {
        userId,
        projectId: defaultProject.id,
        prompt: prompt.trim(),
        response: result.analysis,
        model: result.model,
        category: 'image-vision',
        tokenCount: result.usage.total_tokens,
        metadata: JSON.stringify({
          provider: result.provider,
          model: result.model,
          mimeType,
          fileName: fileName || 'uploaded-image',
          imageSize: imageBuffer.length,
          usage: result.usage,
        }),
      },
    });

    res.json({
      success: true,
      data: {
        id: generation.id,
        analysis: result.analysis,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        tokensUsed: tokenCost,
      },
    });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    res.status(500).json({ success: false, error: error.message || 'Image analysis failed' });
  }
});

// GET /api/images/analyses
router.get('/analyses', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const [analyses, total] = await Promise.all([
      prisma.generation.findMany({
        where: { userId, category: 'image-vision' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          prompt: true,
          response: true,
          model: true,
          tokenCount: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.generation.count({
        where: { userId, category: 'image-vision' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        analyses: analyses.map((a) => ({
          ...a,
          metadata: a.metadata ? JSON.parse(a.metadata) : null,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List analyses error:', error);
    res.status(500).json({ success: false, error: 'Failed to list analyses' });
  }
});

// DELETE /api/images/analyses/:id
router.delete('/analyses/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const analysis = await prisma.generation.findFirst({
      where: { id: req.params.id, userId, category: 'image-vision' },
    });

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    await prisma.generation.delete({ where: { id: analysis.id } });

    res.json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete analysis' });
  }
});

export default router;
