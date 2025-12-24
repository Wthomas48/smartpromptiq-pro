// routes/elevenlabs.cjs - ElevenLabs Voice API Routes (CommonJS)
const { Router } = require('express');
const router = Router();

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const MAX_CHARS_PER_REQUEST = 5000;

// Premium ElevenLabs voices with natural personas - 25+ voices!
const ELEVENLABS_VOICES = {
  // Female Voices
  'rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', style: 'warm', description: 'Warm American female - perfect for narration & storytelling' },
  'domi': { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', style: 'confident', description: 'Strong, confident female - great for business & marketing' },
  'bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', style: 'soft', description: 'Soft & expressive - ideal for meditation & wellness' },
  'elli': { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', style: 'young', description: 'Young & playful female - perfect for education & tutorials' },
  'charlotte': { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', style: 'british', description: 'British accent - sophisticated & professional' },
  'matilda': { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', style: 'friendly', description: 'Warm & friendly - great for customer service' },
  'emily': { id: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily', gender: 'female', style: 'news', description: 'Clear news anchor style - perfect for announcements' },

  // Male Voices
  'adam': { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', style: 'deep', description: 'Deep & authoritative - perfect for documentaries & corporate' },
  'antoni': { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', style: 'friendly', description: 'Friendly & natural male - versatile for all content' },
  'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', style: 'young', description: 'Young American male - great for tech & modern content' },
  'arnold': { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', style: 'powerful', description: 'Powerful & crisp - excellent for announcements' },
  'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', style: 'warm', description: 'Warm & engaging - ideal for podcasts & storytelling' },
  'callum': { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', style: 'british', description: 'British accent male - sophisticated narrator' },
  'clyde': { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', gender: 'male', style: 'serious', description: 'Deep & serious - great for dramatic content' },
  'brian': { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'male', style: 'podcast', description: 'Smooth conversational voice - perfect for podcasts' },
};

// Voice settings presets
const VOICE_PRESETS = {
  natural: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
  clear: { stability: 0.7, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
  expressive: { stability: 0.3, similarity_boost: 0.85, style: 0.5, use_speaker_boost: true },
  dramatic: { stability: 0.4, similarity_boost: 0.9, style: 0.8, use_speaker_boost: true },
  calm: { stability: 0.8, similarity_boost: 0.7, style: 0.0, use_speaker_boost: false },
};

// Voice categories for different use cases
const VOICE_CATEGORIES = {
  academy: ['rachel', 'elli', 'sam', 'matilda'],
  marketing: ['domi', 'emily', 'josh', 'adam'],
  meditation: ['bella', 'rachel', 'sam'],
  storytelling: ['sam', 'clyde', 'matilda', 'charlotte'],
  business: ['adam', 'charlotte', 'emily'],
  podcast: ['brian', 'sam', 'antoni', 'rachel'],
};

// Initialize routes
module.exports = function(prisma, dbAvailable) {

  /**
   * GET /api/elevenlabs/status
   * Check ElevenLabs API status
   */
  router.get('/status', async (req, res) => {
    try {
      if (!ELEVENLABS_API_KEY) {
        return res.json({
          configured: false,
          connected: false,
          error: 'ElevenLabs API key not configured',
        });
      }

      // Test API connection
      const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      });

      if (!response.ok) {
        return res.json({
          configured: true,
          connected: false,
          error: 'Could not verify API connection',
        });
      }

      const data = await response.json();

      res.json({
        configured: true,
        connected: true,
        tier: data.tier,
        usage: {
          charactersUsed: data.character_count,
          charactersLimit: data.character_limit,
          remainingPercent: Math.round((1 - data.character_count / data.character_limit) * 100),
        },
        voicesAvailable: Object.keys(ELEVENLABS_VOICES).length,
      });
    } catch (error) {
      res.json({
        configured: !!ELEVENLABS_API_KEY,
        connected: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/elevenlabs/voices
   * Get all available ElevenLabs voices
   */
  router.get('/voices', (req, res) => {
    const voices = Object.entries(ELEVENLABS_VOICES).map(([key, voice]) => ({
      key,
      ...voice,
    }));

    res.json({
      voices,
      categories: VOICE_CATEGORIES,
      presets: Object.keys(VOICE_PRESETS),
      total: voices.length,
    });
  });

  /**
   * GET /api/elevenlabs/voices/:category
   * Get voices recommended for a specific category
   */
  router.get('/voices/:category', (req, res) => {
    const { category } = req.params;
    const voiceKeys = VOICE_CATEGORIES[category] || VOICE_CATEGORIES.academy;

    const voices = voiceKeys.map(key => ({
      key,
      ...ELEVENLABS_VOICES[key],
    }));

    res.json({
      category,
      voices,
      total: voices.length,
    });
  });

  /**
   * GET /api/elevenlabs/presets
   * Get voice setting presets
   */
  router.get('/presets', (req, res) => {
    const presets = Object.entries(VOICE_PRESETS).map(([name, settings]) => ({
      name,
      ...settings,
      description: {
        natural: 'Balanced & versatile - great for most content',
        clear: 'High clarity - ideal for educational content',
        expressive: 'More emotion & variation - great for storytelling',
        dramatic: 'Maximum expression - perfect for dramatic narration',
        calm: 'Stable & soothing - ideal for meditation & relaxation',
      }[name],
    }));

    res.json({ presets });
  });

  /**
   * POST /api/elevenlabs/generate
   * Generate premium AI voice using ElevenLabs
   */
  router.post('/generate', async (req, res) => {
    try {
      const {
        text,
        voiceId,
        voiceName = 'rachel',
        model = 'eleven_multilingual_v2',
        preset = 'natural',
        settings,
      } = req.body;

      // Validate input
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: 'Text is required' });
      }

      if (text.length > MAX_CHARS_PER_REQUEST) {
        return res.status(400).json({
          message: `Text too long. Maximum ${MAX_CHARS_PER_REQUEST} characters allowed.`
        });
      }

      if (!ELEVENLABS_API_KEY) {
        // Demo mode - return a placeholder response with browser speech fallback
        console.log('⚠️ ElevenLabs: Demo mode - no API key, using browser speech synthesis');
        return res.json({
          success: true,
          audioUrl: null,
          format: 'mp3',
          duration: Math.ceil(text.split(/\s+/).length / 150 * 60),
          voice: voiceName,
          model,
          text: text, // Include text for browser speech synthesis
          message: 'ElevenLabs API key not configured. Using browser speech synthesis.',
          demo: true,
          useBrowserSpeech: true,
        });
      }

      // Get voice ID
      const voice = ELEVENLABS_VOICES[voiceName];
      const finalVoiceId = voiceId || voice?.id || ELEVENLABS_VOICES.rachel.id;

      // Get voice settings from preset or custom
      const voiceSettings = settings || VOICE_PRESETS[preset] || VOICE_PRESETS.natural;

      console.log(`🎙️ ElevenLabs: Generating voice with ${voiceName} (${finalVoiceId})`);
      console.log(`🎙️ Text length: ${text.length}, Model: ${model}, Preset: ${preset}`);

      // Call ElevenLabs API
      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${finalVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarity_boost,
            style: voiceSettings.style || 0,
            use_speaker_boost: voiceSettings.use_speaker_boost ?? true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ElevenLabs API error:', errorData);
        throw new Error(errorData.detail?.message || `ElevenLabs API error: ${response.status}`);
      }

      // Get audio buffer
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const base64Audio = audioBuffer.toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      const wordCount = text.trim().split(/\s+/).length;
      const estimatedDuration = Math.ceil(wordCount / 150 * 60);

      console.log(`🎙️ ElevenLabs: Voice generated successfully!`);

      res.json({
        success: true,
        audioUrl,
        format: 'mp3',
        duration: estimatedDuration,
        voice: voiceName,
        voiceId: finalVoiceId,
        model,
        charCount: text.length,
        provider: 'elevenlabs',
      });

    } catch (error) {
      console.error('ElevenLabs generation error:', error);
      res.status(500).json({
        message: 'Failed to generate ElevenLabs voice',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  /**
   * POST /api/elevenlabs/page/narrate
   * Narrate any page content
   */
  router.post('/page/narrate', async (req, res) => {
    try {
      const {
        content,
        pageTitle,
        pageType = 'general',
        voiceName,
        summarize = false
      } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      // Select optimal voice based on page type
      const pageVoiceMap = {
        academy: 'rachel',
        dashboard: 'emily',
        pricing: 'domi',
        documentation: 'charlotte',
        marketing: 'josh',
        meditation: 'bella',
        general: 'antoni',
      };

      const selectedVoice = voiceName || pageVoiceMap[pageType] || 'rachel';
      const voice = ELEVENLABS_VOICES[selectedVoice];

      if (!voice) {
        return res.status(400).json({ message: 'Invalid voice name' });
      }

      let textToSpeak = content;

      // Optionally summarize long content
      if (summarize && content.length > 3000) {
        textToSpeak = content.slice(0, 3000) + '... [Content continues]';
      }

      if (!ELEVENLABS_API_KEY) {
        return res.json({
          success: true,
          audioUrl: null,
          format: 'mp3',
          voice: selectedVoice,
          pageTitle,
          content: textToSpeak, // Include content for browser speech synthesis
          message: 'ElevenLabs API key not configured. Using browser speech synthesis.',
          demo: true,
          useBrowserSpeech: true,
        });
      }

      console.log(`📄 Page Narration: ${pageTitle || 'Unknown'} with ${selectedVoice}`);

      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: textToSpeak.slice(0, MAX_CHARS_PER_REQUEST),
          model_id: 'eleven_multilingual_v2',
          voice_settings: VOICE_PRESETS.natural,
        }),
      });

      if (!response.ok) {
        throw new Error(`Page narration failed: ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const base64Audio = audioBuffer.toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      res.json({
        success: true,
        audioUrl,
        format: 'mp3',
        voice: selectedVoice,
        voiceDescription: voice.description,
        pageTitle,
        charCount: textToSpeak.length,
        provider: 'elevenlabs',
      });

    } catch (error) {
      console.error('Page narration error:', error);
      res.status(500).json({ message: 'Failed to narrate page' });
    }
  });

  /**
   * GET /api/elevenlabs/usage
   * Get ElevenLabs API usage stats
   */
  router.get('/usage', async (req, res) => {
    try {
      if (!ELEVENLABS_API_KEY) {
        return res.json({
          success: false,
          message: 'ElevenLabs API key not configured',
          demo: true,
        });
      }

      const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage');
      }

      const data = await response.json();

      res.json({
        success: true,
        usage: {
          charactersUsed: data.character_count,
          charactersLimit: data.character_limit,
          remainingCharacters: data.character_limit - data.character_count,
          percentUsed: Math.round((data.character_count / data.character_limit) * 100),
          tier: data.tier,
          resetDate: data.next_character_count_reset_unix
            ? new Date(data.next_character_count_reset_unix * 1000).toISOString()
            : null,
        },
      });

    } catch (error) {
      console.error('Usage fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch usage stats' });
    }
  });

  return router;
};
