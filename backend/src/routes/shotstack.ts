/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - SHOTSTACK VIDEO API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Professional video creation API powered by Shotstack
 *
 * Features:
 * - Create short videos with voice, music, and visuals
 * - Social media presets (TikTok, Reels, YouTube Shorts)
 * - Template-based video generation
 * - Text overlays and animations
 * - Integration with ElevenLabs voices and premium music
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { API_COSTS, COST_CONTROL_FLAGS } from '../config/costs';

const router = Router();
const prisma = new PrismaClient();

// Shotstack API Configuration
// Sandbox: For testing (free with watermark)
// Production: For live renders (paid, no watermark)
// NOTE: The edit API uses /edit/stage or /edit/v1 paths
const SHOTSTACK_SANDBOX_KEY = process.env.SHOTSTACK_SANDBOX_KEY || 'vmRmkK7VYkH6udqCxZ8g3COgCRdFwGN3UzcCYYm0';
const SHOTSTACK_PRODUCTION_KEY = process.env.SHOTSTACK_PRODUCTION_KEY || '';
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || 'stage'; // 'stage' for sandbox, 'v1' for production
const SHOTSTACK_API_KEY = SHOTSTACK_ENV === 'v1' ? SHOTSTACK_PRODUCTION_KEY : SHOTSTACK_SANDBOX_KEY;
// The Edit API uses /edit/{env} path structure
const SHOTSTACK_BASE_URL = `https://api.shotstack.io/edit/${SHOTSTACK_ENV}`;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface VideoAsset {
  type: 'video' | 'image' | 'audio' | 'html' | 'title' | 'luma';
  src?: string;
  text?: string;
  style?: string;
  color?: string;
  background?: string;
  position?: 'center' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left' | 'topLeft';
  offset?: { x: number; y: number };
  trim?: number;
  volume?: number;
  crop?: { top: number; bottom: number; left: number; right: number };
}

interface VideoClip {
  asset: VideoAsset;
  start: number;
  length: number;
  fit?: 'cover' | 'contain' | 'crop' | 'none';
  scale?: number;
  position?: 'center' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left' | 'topLeft';
  offset?: { x: number; y: number };
  transition?: {
    in?: 'fade' | 'reveal' | 'wipeLeft' | 'wipeRight' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoom';
    out?: 'fade' | 'reveal' | 'wipeLeft' | 'wipeRight' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoom';
  };
  effect?: 'zoomIn' | 'zoomOut' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown';
  filter?: 'boost' | 'contrast' | 'darken' | 'greyscale' | 'lighten' | 'muted' | 'negative' | 'sepia';
  opacity?: number;
}

interface VideoTrack {
  clips: VideoClip[];
}

interface VideoTimeline {
  soundtrack?: {
    src: string;
    effect?: 'fadeIn' | 'fadeOut' | 'fadeInFadeOut';
    volume?: number;
  };
  background?: string;
  tracks: VideoTrack[];
}

interface VideoOutput {
  format: 'mp4' | 'gif' | 'webm';
  resolution: 'sd' | 'hd' | '4k';  // Shotstack only supports sd, hd, 4k (not '1080')
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5' | '4:3';
  fps?: number;
  quality?: 'low' | 'medium' | 'high';
  // Note: Don't use 'size' with 'resolution' - they conflict
}

interface VideoRenderRequest {
  timeline: VideoTimeline;
  output: VideoOutput;
  callback?: string;
}

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'social' | 'tutorial' | 'intro' | 'promo' | 'story';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  duration: number;
  thumbnail?: string;
  timeline: Partial<VideoTimeline>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const VIDEO_TEMPLATES: VideoTemplate[] = [
  // Social Media - Vertical (9:16)
  {
    id: 'tiktok-promo',
    name: 'TikTok Promo',
    description: 'Eye-catching vertical video for TikTok',
    category: 'social',
    aspectRatio: '9:16',
    duration: 15,
    timeline: {
      background: '#000000',
    },
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    description: 'Engaging Reel for Instagram',
    category: 'social',
    aspectRatio: '9:16',
    duration: 30,
    timeline: {
      background: '#1a1a2e',
    },
  },
  {
    id: 'youtube-short',
    name: 'YouTube Short',
    description: 'Vertical short for YouTube Shorts',
    category: 'social',
    aspectRatio: '9:16',
    duration: 60,
    timeline: {
      background: '#0f0f23',
    },
  },
  // Marketing - Horizontal (16:9)
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Professional product demo video',
    category: 'marketing',
    aspectRatio: '16:9',
    duration: 30,
    timeline: {
      background: '#1a1a2e',
    },
  },
  {
    id: 'brand-intro',
    name: 'Brand Introduction',
    description: 'Introduce your brand with style',
    category: 'marketing',
    aspectRatio: '16:9',
    duration: 45,
    timeline: {
      background: '#16213e',
    },
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial',
    description: 'Share customer success stories',
    category: 'marketing',
    aspectRatio: '16:9',
    duration: 60,
    timeline: {
      background: '#0d1b2a',
    },
  },
  // Tutorial Videos
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial video',
    category: 'tutorial',
    aspectRatio: '16:9',
    duration: 120,
    timeline: {
      background: '#1a0a2e',
    },
  },
  {
    id: 'quick-tip',
    name: 'Quick Tip',
    description: 'Short educational tip video',
    category: 'tutorial',
    aspectRatio: '16:9',
    duration: 30,
    timeline: {
      background: '#2d132c',
    },
  },
  // Intro/Outro
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    description: 'Professional YouTube channel intro',
    category: 'intro',
    aspectRatio: '16:9',
    duration: 5,
    timeline: {
      background: '#0a0a0a',
    },
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Video Intro',
    description: 'Intro for video podcasts',
    category: 'intro',
    aspectRatio: '16:9',
    duration: 8,
    timeline: {
      background: '#1a1a2e',
    },
  },
  // Square (1:1)
  {
    id: 'instagram-post',
    name: 'Instagram Post Video',
    description: 'Square video for Instagram feed',
    category: 'social',
    aspectRatio: '1:1',
    duration: 30,
    timeline: {
      background: '#262626',
    },
  },
  // Story format (9:16)
  {
    id: 'story-announcement',
    name: 'Story Announcement',
    description: 'Announcement for IG/FB Stories',
    category: 'story',
    aspectRatio: '9:16',
    duration: 15,
    timeline: {
      background: '#000000',
    },
  },
];

// Text style presets
const TEXT_STYLES = {
  minimal: 'minimal',
  bold: 'blockbuster',
  modern: 'future',
  elegant: 'skinny',
  playful: 'chunk',
  news: 'subtitle',
  cinematic: 'marker',
};

// Color presets for quick styling
const COLOR_PRESETS = {
  dark: { background: '#0a0a0a', text: '#ffffff', accent: '#6366f1' },
  light: { background: '#ffffff', text: '#1a1a2e', accent: '#3b82f6' },
  vibrant: { background: '#1a1a2e', text: '#ffffff', accent: '#ec4899' },
  corporate: { background: '#16213e', text: '#ffffff', accent: '#0ea5e9' },
  warm: { background: '#2d132c', text: '#ffffff', accent: '#f59e0b' },
  cool: { background: '#0d1b2a', text: '#ffffff', accent: '#06b6d4' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function logVideoCost(userId: string | null, action: string, cost: number, details: any) {
  try {
    await prisma.usageLog.create({
      data: {
        userId: userId || 'anonymous',
        action: `shotstack:${action}`,
        tokensUsed: 0,
        cost,
        provider: 'shotstack',
        model: 'video',
        responseTime: 0,
        metadata: JSON.stringify(details),
      } as any,
    });

    if (COST_CONTROL_FLAGS.logAllAPICosts) {
      console.log(`🎬 Shotstack Cost: $${cost.toFixed(4)} | Action: ${action}`);
    }
  } catch (error) {
    console.error('Failed to log Shotstack cost:', error);
  }
}

function getAspectRatioSize(aspectRatio: string): { width: number; height: number } {
  const sizes: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:5': { width: 1080, height: 1350 },
    '4:3': { width: 1440, height: 1080 },
  };
  return sizes[aspectRatio] || sizes['16:9'];
}

/**
 * Map user-provided resolution to Shotstack API resolution values
 * Shotstack only supports: 'sd', 'hd', '4k'
 */
function mapResolution(resolution: string): 'sd' | 'hd' | '4k' {
  const mapping: Record<string, 'sd' | 'hd' | '4k'> = {
    'sd': 'sd',
    '480': 'sd',
    '720': 'sd',
    'hd': 'hd',
    '1080': 'hd',
    'full-hd': 'hd',
    'fullhd': 'hd',
    '4k': '4k',
    '2160': '4k',
    'uhd': '4k',
  };
  return mapping[resolution.toLowerCase()] || 'hd';
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/shotstack/status
 * Check Shotstack API status and configuration
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.json({
        configured: false,
        connected: false,
        error: 'Shotstack API key not configured',
      });
    }

    // Test API connection using the probe endpoint
    // The Edit API doesn't have a simple GET endpoint, so we check with a minimal probe
    const response = await fetch(`https://api.shotstack.io/edit/stage/probe`, {
      method: 'GET',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
      },
    });

    // Even if probe returns 404, if we get a response it means API key is valid
    const connected = response.status !== 403 && response.status !== 401;

    res.json({
      configured: true,
      connected,
      environment: SHOTSTACK_ENV,
      baseUrl: SHOTSTACK_BASE_URL,
      templatesAvailable: VIDEO_TEMPLATES.length,
      features: {
        videoRendering: true,
        templates: true,
        voiceIntegration: true,
        musicLibrary: true,
      },
    });

  } catch (error: any) {
    res.json({
      configured: !!SHOTSTACK_API_KEY,
      connected: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/shotstack/templates
 * Get available video templates
 */
router.get('/templates', (_req: Request, res: Response) => {
  const category = (_req.query.category as string) || null;
  const aspectRatio = (_req.query.aspectRatio as string) || null;

  let templates = VIDEO_TEMPLATES;

  if (category) {
    templates = templates.filter(t => t.category === category);
  }

  if (aspectRatio) {
    templates = templates.filter(t => t.aspectRatio === aspectRatio);
  }

  res.json({
    templates,
    categories: ['marketing', 'social', 'tutorial', 'intro', 'promo', 'story'],
    aspectRatios: ['16:9', '9:16', '1:1', '4:5'],
    textStyles: TEXT_STYLES,
    colorPresets: COLOR_PRESETS,
    total: templates.length,
  });
});

/**
 * GET /api/shotstack/templates/:id
 * Get a specific template by ID
 */
router.get('/templates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const template = VIDEO_TEMPLATES.find(t => t.id === id);

  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  res.json({
    template,
    textStyles: TEXT_STYLES,
    colorPresets: COLOR_PRESETS,
  });
});

/**
 * POST /api/shotstack/render
 * Render a video using Shotstack API
 */
router.post('/render', async (req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ message: 'Shotstack API not configured' });
    }

    const {
      timeline,
      output,
      callback,
    } = req.body as VideoRenderRequest;

    if (!timeline || !output) {
      return res.status(400).json({ message: 'Timeline and output are required' });
    }

    const userId = (req as any).userId;

    console.log('🎬 Shotstack: Starting video render...');

    const response = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeline,
        output,
        callback,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Shotstack render error:', error);
      throw new Error(error.message || `Shotstack API error: ${response.status}`);
    }

    const result = await response.json();

    // Log cost (estimated based on duration and resolution)
    const duration = timeline.tracks?.reduce((total, track) => {
      const trackEnd = track.clips?.reduce((max, clip) => Math.max(max, clip.start + clip.length), 0) || 0;
      return Math.max(total, trackEnd);
    }, 0) || 30;

    const cost = duration * 0.05; // ~$0.05 per second (rough estimate)
    await logVideoCost(userId, 'render', cost, { duration, resolution: output.resolution });

    console.log(`🎬 Shotstack: Render started - ID: ${result.response?.id}`);

    res.json({
      success: true,
      renderId: result.response?.id,
      message: result.response?.message || 'Render started',
      status: 'queued',
    });

  } catch (error: any) {
    console.error('Shotstack render error:', error);
    res.status(500).json({
      message: 'Failed to start video render',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/shotstack/render/:id
 * Check render status
 */
router.get('/render/:id', async (req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ message: 'Shotstack API not configured' });
    }

    const { id } = req.params;

    const response = await fetch(`${SHOTSTACK_BASE_URL}/render/${id}`, {
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check render status: ${response.status}`);
    }

    const result = await response.json();
    const renderResponse = result.response;

    res.json({
      success: true,
      id: renderResponse.id,
      status: renderResponse.status,
      url: renderResponse.url,
      poster: renderResponse.poster,
      thumbnail: renderResponse.thumbnail,
      created: renderResponse.created,
      updated: renderResponse.updated,
      error: renderResponse.error,
    });

  } catch (error: any) {
    console.error('Render status check error:', error);
    res.status(500).json({
      message: 'Failed to check render status',
      error: error.message,
    });
  }
});

/**
 * POST /api/shotstack/quick-video
 * Create a quick video from simple parameters
 */
router.post('/quick-video', async (req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ message: 'Shotstack API not configured' });
    }

    const {
      title,
      subtitle,
      templateId,
      backgroundImage,
      backgroundColor = '#1a1a2e',
      textColor = '#ffffff',
      accentColor = '#6366f1',
      voiceUrl,
      musicUrl,
      musicVolume = 0.3,
      voiceVolume = 1.0,
      duration = 15,
      aspectRatio = '16:9',
      format = 'mp4',
      resolution = '1080',
      textStyle = 'future',
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const userId = (req as any).userId;
    const size = getAspectRatioSize(aspectRatio);

    console.log(`🎬 Quick Video: "${title}" (${aspectRatio}, ${duration}s)`);

    // Build timeline
    const clips: VideoClip[] = [];

    // Background image or color
    if (backgroundImage) {
      clips.push({
        asset: {
          type: 'image',
          src: backgroundImage,
        },
        start: 0,
        length: duration,
        fit: 'cover',
        effect: 'zoomIn',
      });
    }

    // Title text
    clips.push({
      asset: {
        type: 'title',
        text: title,
        style: textStyle,
        size: 'medium',
      },
      start: 0.5,
      length: duration - 1,
      position: 'center',
      transition: {
        in: 'fade',
        out: 'fade',
      },
    });

    // Subtitle if provided
    if (subtitle) {
      clips.push({
        asset: {
          type: 'title',
          text: subtitle,
          style: 'subtitle',
          size: 'small',
        },
        start: 1.5,
        length: duration - 2,
        position: 'bottom',
        transition: {
          in: 'fade',
          out: 'fade',
        },
      });
    }

    // Build timeline structure
    const timeline: VideoTimeline = {
      background: backgroundColor,
      tracks: [
        { clips }, // Main content track
      ],
    };

    // Add soundtrack (music)
    if (musicUrl) {
      timeline.soundtrack = {
        src: musicUrl,
        effect: 'fadeInFadeOut',
        volume: musicVolume,
      };
    }

    // Add voice track
    if (voiceUrl) {
      timeline.tracks.push({
        clips: [{
          asset: {
            type: 'audio',
            src: voiceUrl,
            volume: voiceVolume,
          },
          start: 0.5,
          length: duration - 1,
        }],
      });
    }

    // Output configuration - use mapResolution to convert '1080' to 'hd'
    const output: VideoOutput = {
      format: format as 'mp4' | 'gif' | 'webm',
      resolution: mapResolution(resolution),
      aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1' | '4:5',
      fps: 30,
      quality: 'high',
    };

    // Submit render
    const response = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeline,
        output,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Quick video render error:', error);
      throw new Error(error.message || `Shotstack API error: ${response.status}`);
    }

    const result = await response.json();

    // Log cost
    const cost = duration * 0.05;
    await logVideoCost(userId, 'quick-video', cost, {
      duration,
      aspectRatio,
      resolution,
      hasVoice: !!voiceUrl,
      hasMusic: !!musicUrl,
    });

    console.log(`🎬 Quick Video: Render started - ID: ${result.response?.id}`);

    res.json({
      success: true,
      renderId: result.response?.id,
      message: 'Video render started',
      status: 'queued',
      estimatedDuration: duration,
      timeline,
      output,
    });

  } catch (error: any) {
    console.error('Quick video error:', error);
    res.status(500).json({
      message: 'Failed to create video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/shotstack/template-video
 * Create video from a template
 */
router.post('/template-video', async (req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ message: 'Shotstack API not configured' });
    }

    const {
      templateId,
      customizations,
      voiceUrl,
      musicUrl,
      musicVolume = 0.3,
    } = req.body;

    const template = VIDEO_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const userId = (req as any).userId;
    const size = getAspectRatioSize(template.aspectRatio);

    console.log(`🎬 Template Video: ${template.name} (${template.aspectRatio})`);

    // Build timeline from template
    const clips: VideoClip[] = [];

    // Title from customizations
    if (customizations?.title) {
      clips.push({
        asset: {
          type: 'title',
          text: customizations.title,
          style: customizations.textStyle || 'future',
          size: 'medium',
        },
        start: 0.5,
        length: template.duration - 1,
        position: 'center',
        transition: {
          in: 'fade',
          out: 'fade',
        },
      });
    }

    // Background image
    if (customizations?.backgroundImage) {
      clips.unshift({
        asset: {
          type: 'image',
          src: customizations.backgroundImage,
        },
        start: 0,
        length: template.duration,
        fit: 'cover',
        effect: 'zoomIn',
      });
    }

    const timeline: VideoTimeline = {
      background: customizations?.backgroundColor || template.timeline?.background || '#1a1a2e',
      tracks: [{ clips }],
    };

    // Add soundtrack
    if (musicUrl) {
      timeline.soundtrack = {
        src: musicUrl,
        effect: 'fadeInFadeOut',
        volume: musicVolume,
      };
    }

    // Add voice
    if (voiceUrl) {
      timeline.tracks.push({
        clips: [{
          asset: {
            type: 'audio',
            src: voiceUrl,
            volume: 1.0,
          },
          start: 0.5,
          length: template.duration - 1,
        }],
      });
    }

    const output: VideoOutput = {
      format: 'mp4',
      resolution: 'hd',  // Use 'hd' for 1080p quality
      aspectRatio: template.aspectRatio as any,
      fps: 30,
      quality: 'high',
    };

    // Submit render
    const response = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeline,
        output,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Shotstack API error: ${response.status}`);
    }

    const result = await response.json();

    // Log cost
    const cost = template.duration * 0.05;
    await logVideoCost(userId, 'template-video', cost, {
      templateId,
      duration: template.duration,
      aspectRatio: template.aspectRatio,
    });

    console.log(`🎬 Template Video: Render started - ID: ${result.response?.id}`);

    res.json({
      success: true,
      renderId: result.response?.id,
      message: 'Video render started',
      status: 'queued',
      template: {
        id: template.id,
        name: template.name,
        duration: template.duration,
        aspectRatio: template.aspectRatio,
      },
    });

  } catch (error: any) {
    console.error('Template video error:', error);
    res.status(500).json({
      message: 'Failed to create video from template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/shotstack/scenes-video
 * Create video from multiple scenes
 */
router.post('/scenes-video', async (req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ message: 'Shotstack API not configured' });
    }

    const {
      scenes,
      musicUrl,
      musicVolume = 0.3,
      voiceUrl,
      voiceVolume = 1.0,
      aspectRatio = '16:9',
      format = 'mp4',
      resolution = '1080',
      transitionType = 'fade',
    } = req.body;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ message: 'At least one scene is required' });
    }

    const userId = (req as any).userId;
    const size = getAspectRatioSize(aspectRatio);

    console.log(`🎬 Scenes Video: ${scenes.length} scenes (${aspectRatio})`);

    // Build clips from scenes
    const clips: VideoClip[] = [];
    let currentTime = 0;

    scenes.forEach((scene: any, index: number) => {
      const sceneDuration = scene.duration || 5;

      // Background image for scene
      if (scene.backgroundImage) {
        clips.push({
          asset: {
            type: 'image',
            src: scene.backgroundImage,
          },
          start: currentTime,
          length: sceneDuration,
          fit: 'cover',
          effect: scene.effect || 'zoomIn',
          transition: {
            in: index === 0 ? 'fade' : transitionType,
            out: index === scenes.length - 1 ? 'fade' : transitionType,
          },
        });
      }

      // Title text for scene
      if (scene.title) {
        clips.push({
          asset: {
            type: 'title',
            text: scene.title,
            style: scene.textStyle || 'future',
            size: 'medium',
          },
          start: currentTime + 0.3,
          length: sceneDuration - 0.6,
          position: scene.titlePosition || 'center',
          transition: {
            in: 'fade',
            out: 'fade',
          },
        });
      }

      // Subtitle for scene
      if (scene.subtitle) {
        clips.push({
          asset: {
            type: 'title',
            text: scene.subtitle,
            style: 'subtitle',
            size: 'small',
          },
          start: currentTime + 0.6,
          length: sceneDuration - 1,
          position: 'bottom',
          transition: {
            in: 'fade',
            out: 'fade',
          },
        });
      }

      currentTime += sceneDuration;
    });

    const totalDuration = currentTime;

    const timeline: VideoTimeline = {
      background: scenes[0]?.backgroundColor || '#1a1a2e',
      tracks: [{ clips }],
    };

    // Add soundtrack
    if (musicUrl) {
      timeline.soundtrack = {
        src: musicUrl,
        effect: 'fadeInFadeOut',
        volume: musicVolume,
      };
    }

    // Add voice track
    if (voiceUrl) {
      timeline.tracks.push({
        clips: [{
          asset: {
            type: 'audio',
            src: voiceUrl,
            volume: voiceVolume,
          },
          start: 0.3,
          length: totalDuration - 0.6,
        }],
      });
    }

    const output: VideoOutput = {
      format: format as 'mp4' | 'gif' | 'webm',
      resolution: mapResolution(resolution),
      aspectRatio: aspectRatio as any,
      fps: 30,
      quality: 'high',
    };

    // Submit render
    const response = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeline,
        output,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Shotstack API error: ${response.status}`);
    }

    const result = await response.json();

    // Log cost
    const cost = totalDuration * 0.05;
    await logVideoCost(userId, 'scenes-video', cost, {
      sceneCount: scenes.length,
      totalDuration,
      aspectRatio,
    });

    console.log(`🎬 Scenes Video: Render started - ID: ${result.response?.id}`);

    res.json({
      success: true,
      renderId: result.response?.id,
      message: 'Video render started',
      status: 'queued',
      sceneCount: scenes.length,
      totalDuration,
      timeline,
      output,
    });

  } catch (error: any) {
    console.error('Scenes video error:', error);
    res.status(500).json({
      message: 'Failed to create video from scenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/shotstack/presets
 * Get style presets for video creation
 */
router.get('/presets', (_req: Request, res: Response) => {
  res.json({
    textStyles: TEXT_STYLES,
    colorPresets: COLOR_PRESETS,
    transitions: ['fade', 'reveal', 'wipeLeft', 'wipeRight', 'slideLeft', 'slideRight', 'slideUp', 'slideDown', 'zoom'],
    effects: ['zoomIn', 'zoomOut', 'slideLeft', 'slideRight', 'slideUp', 'slideDown'],
    filters: ['boost', 'contrast', 'darken', 'greyscale', 'lighten', 'muted', 'negative', 'sepia'],
    aspectRatios: {
      '16:9': { name: 'Landscape (YouTube)', size: { width: 1920, height: 1080 } },
      '9:16': { name: 'Portrait (TikTok/Reels)', size: { width: 1080, height: 1920 } },
      '1:1': { name: 'Square (Instagram)', size: { width: 1080, height: 1080 } },
      '4:5': { name: 'Portrait 4:5 (Instagram)', size: { width: 1080, height: 1350 } },
    },
    formats: ['mp4', 'gif', 'webm'],
    resolutions: ['sd', 'hd', '4k'],  // Note: 'hd' = 1080p
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTRO/OUTRO VIDEO ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/shotstack/intro-outro
 * Create an intro or outro video with music, voice, and text
 *
 * Perfect for YouTube intros, podcast intros, channel outros, etc.
 */
router.post('/intro-outro', async (req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ message: 'Shotstack API not configured' });
    }

    const {
      // Video type
      type = 'intro', // 'intro' | 'outro' | 'both'

      // Content
      title,
      subtitle,
      channelName,
      tagline,

      // Styling
      backgroundImage,
      backgroundColor = '#1a1a2e',
      textColor = '#ffffff',
      accentColor = '#6366f1',
      textStyle = 'future',
      logoUrl,

      // Audio
      musicUrl,
      musicVolume = 0.6,
      voiceUrl,
      voiceVolume = 1.0,

      // Timing
      duration = 5,
      fadeIn = 0.5,
      fadeOut = 1.0,

      // Output
      aspectRatio = '16:9',
      format = 'mp4',
      resolution = '1080',

      // Effects
      effect = 'zoomIn',
      transition = 'fade',
    } = req.body;

    const userId = (req as any).userId;
    const size = getAspectRatioSize(aspectRatio);

    console.log(`🎬 Intro/Outro: Creating ${type} video (${duration}s, ${aspectRatio})`);

    // Build clips array
    const clips: VideoClip[] = [];

    // Background layer
    if (backgroundImage) {
      clips.push({
        asset: {
          type: 'image',
          src: backgroundImage,
        },
        start: 0,
        length: duration,
        fit: 'cover',
        effect: effect,
        transition: {
          in: transition,
          out: 'fade',
        },
      });
    }

    // Logo (if provided) - positioned top-center or center
    if (logoUrl) {
      clips.push({
        asset: {
          type: 'image',
          src: logoUrl,
        },
        start: fadeIn,
        length: duration - fadeIn - fadeOut,
        fit: 'contain',
        scale: 0.3,
        position: title ? 'top' : 'center',
        transition: {
          in: 'fade',
          out: 'fade',
        },
      });
    }

    // Main title - animated entrance
    // NOTE: Shotstack title asset only supports: type, text, style, size
    // Position is set at clip level, not asset level
    if (title) {
      clips.push({
        asset: {
          type: 'title',
          text: title,
          style: textStyle,
          size: 'medium',
        },
        start: fadeIn,
        length: duration - fadeIn - fadeOut,
        position: 'center',
        transition: {
          in: 'slideUp',
          out: 'fade',
        },
      });
    }

    // Channel name or subtitle
    if (subtitle || channelName) {
      clips.push({
        asset: {
          type: 'title',
          text: subtitle || channelName,
          style: 'subtitle',
          size: 'small',
        },
        start: fadeIn + 0.3,
        length: duration - fadeIn - fadeOut - 0.3,
        position: 'bottom',
        transition: {
          in: 'fade',
          out: 'fade',
        },
      });
    }

    // Tagline (for outros - e.g., "Subscribe for more!")
    if (tagline && type === 'outro') {
      clips.push({
        asset: {
          type: 'title',
          text: tagline,
          style: 'chunk',
          size: 'small',
        },
        start: duration * 0.4,
        length: duration * 0.5,
        position: 'bottom',
        transition: {
          in: 'slideUp',
          out: 'fade',
        },
      });
    }

    // Build timeline
    const timeline: VideoTimeline = {
      background: backgroundColor,
      tracks: [{ clips }],
    };

    // Add music soundtrack with fade effects
    if (musicUrl) {
      timeline.soundtrack = {
        src: musicUrl,
        effect: type === 'intro' ? 'fadeIn' : type === 'outro' ? 'fadeOut' : 'fadeInFadeOut',
        volume: musicVolume,
      };
    }

    // Add voice track
    if (voiceUrl) {
      timeline.tracks.push({
        clips: [{
          asset: {
            type: 'audio',
            src: voiceUrl,
            volume: voiceVolume,
          },
          start: fadeIn,
          length: duration - fadeIn - fadeOut,
        }],
      });
    }

    // Output configuration - use mapResolution to convert '1080' to 'hd'
    const output: VideoOutput = {
      format: format as 'mp4' | 'gif' | 'webm',
      resolution: mapResolution(resolution),
      aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1' | '4:5',
      fps: 30,
      quality: 'high',
    };

    // Submit to Shotstack
    const response = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeline,
        output,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Shotstack intro/outro error:', error);
      throw new Error(error.message || `Shotstack API error: ${response.status}`);
    }

    const result = await response.json();

    // Log cost
    const cost = duration * 0.05;
    await logVideoCost(userId, `intro-outro-${type}`, cost, {
      type,
      duration,
      aspectRatio,
      hasVoice: !!voiceUrl,
      hasMusic: !!musicUrl,
      hasLogo: !!logoUrl,
    });

    console.log(`🎬 Intro/Outro: Render started - ID: ${result.response?.id}`);

    res.json({
      success: true,
      renderId: result.response?.id,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} video render started`,
      status: 'queued',
      type,
      duration,
      aspectRatio,
      estimatedCost: `$${cost.toFixed(2)}`,
    });

  } catch (error: any) {
    console.error('Intro/outro video error:', error);
    res.status(500).json({
      message: 'Failed to create intro/outro video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/shotstack/intro-outro-pack
 * Create a matching intro AND outro pair
 */
router.post('/intro-outro-pack', async (req: Request, res: Response) => {
  try {
    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ message: 'Shotstack API not configured' });
    }

    const {
      // Content
      title,
      channelName,
      introTagline,
      outroTagline = 'Thanks for watching! Subscribe for more.',

      // Styling (shared)
      backgroundImage,
      backgroundColor = '#1a1a2e',
      textColor = '#ffffff',
      accentColor = '#6366f1',
      textStyle = 'future',
      logoUrl,

      // Audio
      musicUrl,
      musicVolume = 0.6,
      introVoiceUrl,
      outroVoiceUrl,
      voiceVolume = 1.0,

      // Timing
      introDuration = 5,
      outroDuration = 10,

      // Output
      aspectRatio = '16:9',
      format = 'mp4',
      resolution = '1080',
    } = req.body;

    const userId = (req as any).userId;
    const size = getAspectRatioSize(aspectRatio);

    console.log(`🎬 Intro/Outro Pack: Creating intro (${introDuration}s) + outro (${outroDuration}s)`);

    const renderPromises = [];

    // === CREATE INTRO ===
    const introClips: VideoClip[] = [];

    if (backgroundImage) {
      introClips.push({
        asset: { type: 'image', src: backgroundImage },
        start: 0,
        length: introDuration,
        fit: 'cover',
        effect: 'zoomIn',
      });
    }

    if (logoUrl) {
      introClips.push({
        asset: { type: 'image', src: logoUrl },
        start: 0.3,
        length: introDuration - 0.6,
        fit: 'contain',
        scale: 0.25,
        position: 'top',
        transition: { in: 'fade', out: 'fade' },
      });
    }

    if (title) {
      introClips.push({
        asset: {
          type: 'title',
          text: title,
          style: textStyle,
          size: 'medium',
        },
        start: 0.5,
        length: introDuration - 1,
        position: 'center',
        transition: { in: 'slideUp', out: 'fade' },
      });
    }

    if (channelName) {
      introClips.push({
        asset: {
          type: 'title',
          text: channelName,
          style: 'subtitle',
          size: 'small',
        },
        start: 0.8,
        length: introDuration - 1.3,
        position: 'bottom',
        transition: { in: 'fade', out: 'fade' },
      });
    }

    const introTimeline: VideoTimeline = {
      background: backgroundColor,
      tracks: [{ clips: introClips }],
    };

    if (musicUrl) {
      introTimeline.soundtrack = {
        src: musicUrl,
        effect: 'fadeIn',
        volume: musicVolume,
      };
    }

    if (introVoiceUrl) {
      introTimeline.tracks.push({
        clips: [{
          asset: { type: 'audio', src: introVoiceUrl, volume: voiceVolume },
          start: 0.5,
          length: introDuration - 1,
        }],
      });
    }

    const introOutput: VideoOutput = {
      format: format as any,
      resolution: mapResolution(resolution),
      aspectRatio: aspectRatio as any,
      fps: 30,
      quality: 'high',
    };

    // Submit intro render
    renderPromises.push(
      fetch(`${SHOTSTACK_BASE_URL}/render`, {
        method: 'POST',
        headers: {
          'x-api-key': SHOTSTACK_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeline: introTimeline, output: introOutput }),
      }).then(r => r.json())
    );

    // === CREATE OUTRO ===
    const outroClips: VideoClip[] = [];

    if (backgroundImage) {
      outroClips.push({
        asset: { type: 'image', src: backgroundImage },
        start: 0,
        length: outroDuration,
        fit: 'cover',
        effect: 'zoomOut',
      });
    }

    if (logoUrl) {
      outroClips.push({
        asset: { type: 'image', src: logoUrl },
        start: 0.5,
        length: outroDuration - 1,
        fit: 'contain',
        scale: 0.3,
        position: 'center',
        transition: { in: 'zoom', out: 'fade' },
      });
    }

    if (outroTagline) {
      outroClips.push({
        asset: {
          type: 'title',
          text: outroTagline,
          style: 'chunk',
          size: 'small',
        },
        start: outroDuration * 0.3,
        length: outroDuration * 0.6,
        position: 'bottom',
        transition: { in: 'slideUp', out: 'fade' },
      });
    }

    if (channelName) {
      outroClips.push({
        asset: {
          type: 'title',
          text: channelName,
          style: textStyle,
          size: 'medium',
        },
        start: 0.5,
        length: outroDuration - 1.5,
        position: 'top',
        transition: { in: 'fade', out: 'fade' },
      });
    }

    const outroTimeline: VideoTimeline = {
      background: backgroundColor,
      tracks: [{ clips: outroClips }],
    };

    if (musicUrl) {
      outroTimeline.soundtrack = {
        src: musicUrl,
        effect: 'fadeOut',
        volume: musicVolume,
      };
    }

    if (outroVoiceUrl) {
      outroTimeline.tracks.push({
        clips: [{
          asset: { type: 'audio', src: outroVoiceUrl, volume: voiceVolume },
          start: 0.5,
          length: outroDuration - 2,
        }],
      });
    }

    const outroOutput: VideoOutput = {
      format: format as any,
      resolution: mapResolution(resolution),
      aspectRatio: aspectRatio as any,
      fps: 30,
      quality: 'high',
    };

    // Submit outro render
    renderPromises.push(
      fetch(`${SHOTSTACK_BASE_URL}/render`, {
        method: 'POST',
        headers: {
          'x-api-key': SHOTSTACK_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeline: outroTimeline, output: outroOutput }),
      }).then(r => r.json())
    );

    // Wait for both renders to start
    const [introResult, outroResult] = await Promise.all(renderPromises);

    // Log costs
    const totalDuration = introDuration + outroDuration;
    const cost = totalDuration * 0.05;
    await logVideoCost(userId, 'intro-outro-pack', cost, {
      introDuration,
      outroDuration,
      aspectRatio,
    });

    console.log(`🎬 Intro/Outro Pack: Both renders started`);

    res.json({
      success: true,
      intro: {
        renderId: introResult.response?.id,
        duration: introDuration,
        status: 'queued',
      },
      outro: {
        renderId: outroResult.response?.id,
        duration: outroDuration,
        status: 'queued',
      },
      message: 'Intro and outro renders started',
      totalDuration,
      estimatedCost: `$${cost.toFixed(2)}`,
    });

  } catch (error: any) {
    console.error('Intro/outro pack error:', error);
    res.status(500).json({
      message: 'Failed to create intro/outro pack',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
