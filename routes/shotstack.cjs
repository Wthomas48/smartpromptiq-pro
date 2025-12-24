// routes/shotstack.cjs - Shotstack Video API Routes (CommonJS)
const { Router } = require('express');
const router = Router();

// Shotstack API Configuration
const SHOTSTACK_SANDBOX_KEY = process.env.SHOTSTACK_SANDBOX_KEY || '';
const SHOTSTACK_PRODUCTION_KEY = process.env.SHOTSTACK_PRODUCTION_KEY || '';
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || 'stage';
const SHOTSTACK_API_KEY = SHOTSTACK_ENV === 'v1' ? SHOTSTACK_PRODUCTION_KEY : SHOTSTACK_SANDBOX_KEY;
const SHOTSTACK_BASE_URL = `https://api.shotstack.io/edit/${SHOTSTACK_ENV}`;

// Video templates
const VIDEO_TEMPLATES = [
  { id: 'tiktok-promo', name: 'TikTok Promo', category: 'social', aspectRatio: '9:16', duration: 15 },
  { id: 'instagram-reel', name: 'Instagram Reel', category: 'social', aspectRatio: '9:16', duration: 30 },
  { id: 'youtube-short', name: 'YouTube Short', category: 'social', aspectRatio: '9:16', duration: 60 },
  { id: 'product-showcase', name: 'Product Showcase', category: 'marketing', aspectRatio: '16:9', duration: 30 },
  { id: 'brand-intro', name: 'Brand Introduction', category: 'marketing', aspectRatio: '16:9', duration: 45 },
  { id: 'youtube-intro', name: 'YouTube Intro', category: 'intro', aspectRatio: '16:9', duration: 5 },
  { id: 'podcast-intro', name: 'Podcast Video Intro', category: 'intro', aspectRatio: '16:9', duration: 8 },
  { id: 'instagram-post', name: 'Instagram Post Video', category: 'social', aspectRatio: '1:1', duration: 30 },
];

// Text style presets
const TEXT_STYLES = {
  minimal: 'minimal',
  bold: 'blockbuster',
  modern: 'future',
  elegant: 'skinny',
  playful: 'chunk',
  news: 'subtitle',
};

// Color presets
const COLOR_PRESETS = {
  dark: { background: '#0a0a0a', text: '#ffffff', accent: '#6366f1' },
  light: { background: '#ffffff', text: '#1a1a2e', accent: '#3b82f6' },
  vibrant: { background: '#1a1a2e', text: '#ffffff', accent: '#ec4899' },
  corporate: { background: '#16213e', text: '#ffffff', accent: '#0ea5e9' },
};

// Helper to map resolution
function mapResolution(resolution) {
  const mapping = {
    'sd': 'sd', '480': 'sd', '720': 'sd',
    'hd': 'hd', '1080': 'hd', 'full-hd': 'hd',
    '4k': '4k', '2160': '4k', 'uhd': '4k',
  };
  return mapping[resolution?.toLowerCase()] || 'hd';
}

// Helper to get aspect ratio size
function getAspectRatioSize(aspectRatio) {
  const sizes = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:5': { width: 1080, height: 1350 },
  };
  return sizes[aspectRatio] || sizes['16:9'];
}

// Initialize routes
module.exports = function(prisma, dbAvailable) {

  /**
   * GET /api/shotstack/status
   * Check Shotstack API status
   */
  router.get('/status', async (req, res) => {
    try {
      if (!SHOTSTACK_API_KEY) {
        return res.json({
          configured: false,
          connected: false,
          error: 'Shotstack API key not configured',
        });
      }

      res.json({
        configured: true,
        connected: true,
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
    } catch (error) {
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
  router.get('/templates', (req, res) => {
    const category = req.query.category;
    const aspectRatio = req.query.aspectRatio;

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
   * GET /api/shotstack/presets
   * Get style presets for video creation
   */
  router.get('/presets', (req, res) => {
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
      resolutions: ['sd', 'hd', '4k'],
    });
  });

  /**
   * POST /api/shotstack/render
   * Render a video using Shotstack API
   */
  router.post('/render', async (req, res) => {
    try {
      if (!SHOTSTACK_API_KEY) {
        return res.status(500).json({ message: 'Shotstack API not configured' });
      }

      const { timeline, output, callback } = req.body;

      if (!timeline || !output) {
        return res.status(400).json({ message: 'Timeline and output are required' });
      }

      console.log('🎬 Shotstack: Starting video render...');

      const response = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
        method: 'POST',
        headers: {
          'x-api-key': SHOTSTACK_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeline, output, callback }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Shotstack render error:', error);
        throw new Error(error.message || `Shotstack API error: ${response.status}`);
      }

      const result = await response.json();

      console.log(`🎬 Shotstack: Render started - ID: ${result.response?.id}`);

      res.json({
        success: true,
        renderId: result.response?.id,
        message: result.response?.message || 'Render started',
        status: 'queued',
      });

    } catch (error) {
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
  router.get('/render/:id', async (req, res) => {
    try {
      if (!SHOTSTACK_API_KEY) {
        return res.status(500).json({ message: 'Shotstack API not configured' });
      }

      const { id } = req.params;

      const response = await fetch(`${SHOTSTACK_BASE_URL}/render/${id}`, {
        headers: { 'x-api-key': SHOTSTACK_API_KEY },
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

    } catch (error) {
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
  router.post('/quick-video', async (req, res) => {
    try {
      if (!SHOTSTACK_API_KEY) {
        return res.status(500).json({ message: 'Shotstack API not configured' });
      }

      const {
        title,
        subtitle,
        backgroundColor = '#1a1a2e',
        voiceUrl,
        musicUrl,
        musicVolume = 0.3,
        voiceVolume = 1.0,
        duration = 15,
        aspectRatio = '16:9',
        format = 'mp4',
        resolution = '1080',
        textStyle = 'future',
        backgroundImage,
      } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      console.log(`🎬 Quick Video: "${title}" (${aspectRatio}, ${duration}s)`);

      // Build clips array
      const clips = [];

      // Background image
      if (backgroundImage) {
        clips.push({
          asset: { type: 'image', src: backgroundImage },
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
        transition: { in: 'fade', out: 'fade' },
      });

      // Subtitle
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
          transition: { in: 'fade', out: 'fade' },
        });
      }

      // Build timeline
      const timeline = {
        background: backgroundColor,
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
            asset: { type: 'audio', src: voiceUrl, volume: voiceVolume },
            start: 0.5,
            length: duration - 1,
          }],
        });
      }

      // Output configuration
      const output = {
        format,
        resolution: mapResolution(resolution),
        aspectRatio,
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
        body: JSON.stringify({ timeline, output }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Shotstack API error: ${response.status}`);
      }

      const result = await response.json();

      console.log(`🎬 Quick Video: Render started - ID: ${result.response?.id}`);

      res.json({
        success: true,
        renderId: result.response?.id,
        message: 'Video render started',
        status: 'queued',
        estimatedDuration: duration,
      });

    } catch (error) {
      console.error('Quick video error:', error);
      res.status(500).json({
        message: 'Failed to create video',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  /**
   * POST /api/shotstack/scenes-video
   * Create video from multiple scenes
   */
  router.post('/scenes-video', async (req, res) => {
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

      console.log(`🎬 Scenes Video: ${scenes.length} scenes (${aspectRatio})`);

      // Build clips from scenes
      const clips = [];
      let currentTime = 0;

      scenes.forEach((scene, index) => {
        const sceneDuration = scene.duration || 5;

        // Background image
        if (scene.backgroundImage) {
          clips.push({
            asset: { type: 'image', src: scene.backgroundImage },
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

        // Title text
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
            transition: { in: 'fade', out: 'fade' },
          });
        }

        // Subtitle
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
            transition: { in: 'fade', out: 'fade' },
          });
        }

        currentTime += sceneDuration;
      });

      const totalDuration = currentTime;

      const timeline = {
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
            asset: { type: 'audio', src: voiceUrl, volume: voiceVolume },
            start: 0.3,
            length: totalDuration - 0.6,
          }],
        });
      }

      const output = {
        format,
        resolution: mapResolution(resolution),
        aspectRatio,
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
        body: JSON.stringify({ timeline, output }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Shotstack API error: ${response.status}`);
      }

      const result = await response.json();

      console.log(`🎬 Scenes Video: Render started - ID: ${result.response?.id}`);

      res.json({
        success: true,
        renderId: result.response?.id,
        message: 'Video render started',
        status: 'queued',
        sceneCount: scenes.length,
        totalDuration,
      });

    } catch (error) {
      console.error('Scenes video error:', error);
      res.status(500).json({
        message: 'Failed to create video from scenes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  /**
   * POST /api/shotstack/intro-outro
   * Create an intro or outro video
   */
  router.post('/intro-outro', async (req, res) => {
    try {
      if (!SHOTSTACK_API_KEY) {
        return res.status(500).json({ message: 'Shotstack API not configured' });
      }

      const {
        type = 'intro',
        title,
        subtitle,
        channelName,
        tagline,
        backgroundImage,
        backgroundColor = '#1a1a2e',
        textStyle = 'future',
        logoUrl,
        musicUrl,
        musicVolume = 0.6,
        voiceUrl,
        voiceVolume = 1.0,
        duration = 5,
        fadeIn = 0.5,
        fadeOut = 1.0,
        aspectRatio = '16:9',
        format = 'mp4',
        resolution = '1080',
        effect = 'zoomIn',
        transition = 'fade',
      } = req.body;

      console.log(`🎬 Intro/Outro: Creating ${type} video (${duration}s, ${aspectRatio})`);

      // Build clips array
      const clips = [];

      // Background
      if (backgroundImage) {
        clips.push({
          asset: { type: 'image', src: backgroundImage },
          start: 0,
          length: duration,
          fit: 'cover',
          effect: effect,
          transition: { in: transition, out: 'fade' },
        });
      }

      // Logo
      if (logoUrl) {
        clips.push({
          asset: { type: 'image', src: logoUrl },
          start: fadeIn,
          length: duration - fadeIn - fadeOut,
          fit: 'contain',
          scale: 0.3,
          position: title ? 'top' : 'center',
          transition: { in: 'fade', out: 'fade' },
        });
      }

      // Main title
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
          transition: { in: 'slideUp', out: 'fade' },
        });
      }

      // Subtitle/Channel name
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
          transition: { in: 'fade', out: 'fade' },
        });
      }

      // Tagline for outros
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
          transition: { in: 'slideUp', out: 'fade' },
        });
      }

      // Build timeline
      const timeline = {
        background: backgroundColor,
        tracks: [{ clips }],
      };

      // Add music
      if (musicUrl) {
        timeline.soundtrack = {
          src: musicUrl,
          effect: type === 'intro' ? 'fadeIn' : type === 'outro' ? 'fadeOut' : 'fadeInFadeOut',
          volume: musicVolume,
        };
      }

      // Add voice
      if (voiceUrl) {
        timeline.tracks.push({
          clips: [{
            asset: { type: 'audio', src: voiceUrl, volume: voiceVolume },
            start: fadeIn,
            length: duration - fadeIn - fadeOut,
          }],
        });
      }

      const output = {
        format,
        resolution: mapResolution(resolution),
        aspectRatio,
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
        body: JSON.stringify({ timeline, output }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Shotstack API error: ${response.status}`);
      }

      const result = await response.json();

      console.log(`🎬 Intro/Outro: Render started - ID: ${result.response?.id}`);

      res.json({
        success: true,
        renderId: result.response?.id,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} video render started`,
        status: 'queued',
        type,
        duration,
        aspectRatio,
      });

    } catch (error) {
      console.error('Intro/outro video error:', error);
      res.status(500).json({
        message: 'Failed to create intro/outro video',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  return router;
};
