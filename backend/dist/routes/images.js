"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const costs_1 = require("../config/costs");
const costTracking_1 = require("../middleware/costTracking");
const supabase_1 = require("../lib/supabase");
const openai_1 = __importDefault(require("openai"));
const router = express_1.default.Router();
// ============================================
// OPENAI CLIENT
// ============================================
const openaiKey = process.env.OPENAI_API_KEY;
let openai = null;
if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
    openai = new openai_1.default({ apiKey: openaiKey });
    console.log('🎨 Image Routes: OpenAI DALL-E ready');
}
else {
    console.warn('⚠️ Image Routes: OpenAI not configured - image generation unavailable');
}
const VALID_SIZES = ['1024x1024', '1792x1024', '1024x1792'];
const VALID_QUALITIES = ['standard', 'hd'];
const VALID_STYLES = ['vivid', 'natural'];
// Image signed URLs expire in 1 hour (longer than audio since images are browsed)
const IMAGE_URL_EXPIRY = 3600;
// ============================================
// POST /api/images/generate
// ============================================
router.post('/generate', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!openai) {
        return res.status(503).json({ success: false, error: 'Image generation is not configured' });
    }
    try {
        const { prompt, size = '1024x1024', quality = 'standard', style = 'vivid', } = req.body;
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
        const tokenCost = (0, costs_1.getTokenCost)('image', tokenFeature);
        // Check user token balance
        const user = await database_1.prisma.user.findUnique({
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
            size: size,
            quality: quality,
            style: style,
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
        let imageUrl;
        let filePath = null;
        let isSignedUrl = false;
        if (supabase_1.supabase) {
            const date = new Date().toISOString().split('T')[0];
            const storagePath = `${date}/${fileName}`;
            const { data: uploadData, error: uploadError } = await supabase_1.supabase.storage
                .from(supabase_1.IMAGE_OUTPUT_BUCKET)
                .upload(storagePath, imageBuffer, {
                contentType: 'image/png',
                cacheControl: '86400', // Cache for 24 hours
                upsert: false,
            });
            if (uploadError) {
                console.error('❌ Supabase image upload failed:', uploadError.message);
                // Fallback to base64 data URL
                imageUrl = `data:image/png;base64,${imageData.b64_json}`;
            }
            else {
                // Generate signed URL
                const { data: signedUrlData, error: signedUrlError } = await supabase_1.supabase.storage
                    .from(supabase_1.IMAGE_OUTPUT_BUCKET)
                    .createSignedUrl(storagePath, IMAGE_URL_EXPIRY);
                if (signedUrlError || !signedUrlData?.signedUrl) {
                    console.error('❌ Signed URL generation failed:', signedUrlError?.message);
                    imageUrl = `data:image/png;base64,${imageData.b64_json}`;
                }
                else {
                    imageUrl = signedUrlData.signedUrl;
                    filePath = storagePath;
                    isSignedUrl = true;
                    console.log(`📤 Image uploaded to Supabase: ${storagePath}`);
                }
            }
        }
        else {
            // No Supabase configured - return base64
            imageUrl = `data:image/png;base64,${imageData.b64_json}`;
        }
        // Save to Generation model
        const generation = await database_1.prisma.generation.create({
            data: {
                userId,
                projectId: userId, // Use userId as default project
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
                    bucket: supabase_1.IMAGE_OUTPUT_BUCKET,
                    revisedPrompt,
                    responseTime,
                }),
            },
        });
        // Deduct tokens
        await (0, costTracking_1.deductTokens)(userId, tokenCost);
        // Log usage
        await database_1.prisma.usageLog.create({
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
    }
    catch (error) {
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
router.get('/history', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const [images, total] = await Promise.all([
            database_1.prisma.generation.findMany({
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
            database_1.prisma.generation.count({
                where: { userId, category: 'image' },
            }),
        ]);
        // Regenerate signed URLs for images stored in Supabase
        const imagesWithUrls = await Promise.all(images.map(async (img) => {
            let imageUrl = img.response;
            let metadata = {};
            try {
                metadata = img.metadata ? JSON.parse(img.metadata) : {};
            }
            catch {
                metadata = {};
            }
            // If stored in Supabase, regenerate signed URL
            if (metadata.storagePath && supabase_1.supabase) {
                try {
                    const { data, error } = await supabase_1.supabase.storage
                        .from(metadata.bucket || supabase_1.IMAGE_OUTPUT_BUCKET)
                        .createSignedUrl(metadata.storagePath, IMAGE_URL_EXPIRY);
                    if (data?.signedUrl && !error) {
                        imageUrl = data.signedUrl;
                    }
                }
                catch {
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
        }));
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
    }
    catch (error) {
        console.error('❌ Image history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch image history' });
    }
});
// ============================================
// GET /api/images/refresh-url/:id
// ============================================
router.get('/refresh-url/:id', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const generation = await database_1.prisma.generation.findFirst({
            where: { id: req.params.id, userId, category: 'image' },
            select: { metadata: true },
        });
        if (!generation) {
            return res.status(404).json({ success: false, error: 'Image not found' });
        }
        const metadata = generation.metadata ? JSON.parse(generation.metadata) : {};
        if (!metadata.storagePath || !supabase_1.supabase) {
            return res.status(400).json({ success: false, error: 'Image URL cannot be refreshed' });
        }
        const { data, error } = await supabase_1.supabase.storage
            .from(metadata.bucket || supabase_1.IMAGE_OUTPUT_BUCKET)
            .createSignedUrl(metadata.storagePath, IMAGE_URL_EXPIRY);
        if (error || !data?.signedUrl) {
            return res.status(500).json({ success: false, error: 'Failed to refresh URL' });
        }
        res.json({
            success: true,
            imageUrl: data.signedUrl,
            expiresIn: IMAGE_URL_EXPIRY,
        });
    }
    catch (error) {
        console.error('❌ URL refresh error:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh URL' });
    }
});
// ============================================
// DELETE /api/images/:id
// ============================================
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const generation = await database_1.prisma.generation.findFirst({
            where: { id: req.params.id, userId, category: 'image' },
            select: { id: true, metadata: true },
        });
        if (!generation) {
            return res.status(404).json({ success: false, error: 'Image not found' });
        }
        // Delete from Supabase Storage if stored there
        const metadata = generation.metadata ? JSON.parse(generation.metadata) : {};
        if (metadata.storagePath && supabase_1.supabase) {
            try {
                await supabase_1.supabase.storage
                    .from(metadata.bucket || supabase_1.IMAGE_OUTPUT_BUCKET)
                    .remove([metadata.storagePath]);
            }
            catch (storageError) {
                console.error('⚠️ Failed to delete from storage:', storageError);
                // Continue with DB deletion even if storage delete fails
            }
        }
        // Delete from database
        await database_1.prisma.generation.delete({
            where: { id: generation.id },
        });
        res.json({ success: true, message: 'Image deleted' });
    }
    catch (error) {
        console.error('❌ Image delete error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete image' });
    }
});
// ============================================
// VISION / IMAGE ANALYSIS ENDPOINTS
// ============================================
const visionService_1 = require("../services/visionService");
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
// GET /api/images/vision/status
router.get('/vision/status', auth_1.authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                configured: (0, visionService_1.isVisionConfigured)(),
                providers: (0, visionService_1.getVisionProviders)(),
            },
        });
    }
    catch (error) {
        console.error('Vision status error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// POST /api/images/analyze
router.post('/analyze', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
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
        const tokenCost = (0, costs_1.getTokenCost)('vision', 'analyze-standard');
        const deducted = await (0, costTracking_1.deductTokens)(userId, tokenCost);
        if (!deducted) {
            return res.status(402).json({ success: false, error: 'Insufficient tokens' });
        }
        // Analyze image
        const result = await (0, visionService_1.analyzeImage)(imageData, mimeType, prompt.trim(), { provider });
        // Store analysis in database
        const generation = await database_1.prisma.generation.create({
            data: {
                userId,
                projectId: userId, // Use userId as default project
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
    }
    catch (error) {
        console.error('Vision analysis error:', error);
        res.status(500).json({ success: false, error: error.message || 'Image analysis failed' });
    }
});
// GET /api/images/analyses
router.get('/analyses', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const [analyses, total] = await Promise.all([
            database_1.prisma.generation.findMany({
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
            database_1.prisma.generation.count({
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
    }
    catch (error) {
        console.error('List analyses error:', error);
        res.status(500).json({ success: false, error: 'Failed to list analyses' });
    }
});
// DELETE /api/images/analyses/:id
router.delete('/analyses/:id', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const analysis = await database_1.prisma.generation.findFirst({
            where: { id: req.params.id, userId, category: 'image-vision' },
        });
        if (!analysis) {
            return res.status(404).json({ success: false, error: 'Analysis not found' });
        }
        await database_1.prisma.generation.delete({ where: { id: analysis.id } });
        res.json({ success: true, message: 'Analysis deleted' });
    }
    catch (error) {
        console.error('Delete analysis error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete analysis' });
    }
});
exports.default = router;
