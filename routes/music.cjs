// routes/music.cjs - Music Generation API Routes (CommonJS)
const { Router } = require('express');
const router = Router();

// Genre presets with style descriptions
const GENRE_PRESETS = {
  upbeat: { style: 'upbeat, energetic, motivational', bpm: '120-140', mood: 'happy' },
  calm: { style: 'calm, relaxing, peaceful, ambient', bpm: '60-80', mood: 'serene' },
  corporate: { style: 'corporate, professional, business', bpm: '100-120', mood: 'confident' },
  cinematic: { style: 'cinematic, epic, dramatic', bpm: '80-120', mood: 'epic' },
  playful: { style: 'playful, fun, cheerful', bpm: '110-130', mood: 'joyful' },
  electronic: { style: 'electronic, EDM, synth', bpm: '125-150', mood: 'futuristic' },
  hiphop: { style: 'hip-hop, trap, urban', bpm: '70-90', mood: 'confident' },
  rock: { style: 'rock, guitar-driven', bpm: '100-140', mood: 'intense' },
  jazz: { style: 'jazz, smooth, sophisticated', bpm: '80-120', mood: 'classy' },
  lofi: { style: 'lo-fi, chill hop, study', bpm: '70-90', mood: 'nostalgic' },
  rnb: { style: 'R&B, soul, smooth', bpm: '70-100', mood: 'romantic' },
  country: { style: 'country, americana, folk', bpm: '90-120', mood: 'nostalgic' },
  reggae: { style: 'reggae, caribbean', bpm: '60-90', mood: 'relaxed' },
  classical: { style: 'classical, orchestral', bpm: '60-120', mood: 'elegant' },
  ambient: { style: 'ambient, atmospheric', bpm: '50-80', mood: 'meditative' },
  funk: { style: 'funk, groove, disco', bpm: '100-130', mood: 'groovy' },
  synthwave: { style: 'synthwave, 80s, neon', bpm: '100-130', mood: 'nostalgic' },
  podcast: { style: 'podcast intro, radio', bpm: '90-110', mood: 'professional' },
  pop: { style: 'pop, catchy, mainstream', bpm: '100-130', mood: 'happy' },
};

// Token costs
const MUSIC_TOKEN_COSTS = {
  song_with_vocals: 100,
  instrumental: 75,
  jingle: 50,
};

// Initialize routes with prisma instance
module.exports = function(prisma, dbAvailable) {

  /**
   * POST /api/music/generate
   * Generate AI music from prompt
   */
  router.post('/generate', async (req, res) => {
    try {
      const {
        prompt,
        genre = 'upbeat',
        duration = 60,
        withVocals = false,
        customLyrics,
        mood,
        style,
        vocalStyle,
        purpose = 'full_track',
      } = req.body;

      // Validate input
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a descriptive prompt (at least 3 characters)',
        });
      }

      const genrePreset = GENRE_PRESETS[genre] || GENRE_PRESETS.upbeat;

      // Calculate token cost
      const tokenCost = withVocals
        ? MUSIC_TOKEN_COSTS.song_with_vocals
        : purpose === 'intro_jingle'
        ? MUSIC_TOKEN_COSTS.jingle
        : MUSIC_TOKEN_COSTS.instrumental;

      console.log(`🎵 Music Generation: "${prompt.slice(0, 50)}..." | Genre: ${genre} | Duration: ${duration}s`);

      // Demo mode - return simulated response
      // In production, this would call Suno API or similar
      const trackId = `track-${Date.now()}`;
      const title = generateTrackTitle(prompt, genre);

      res.json({
        success: true,
        trackId,
        audioUrl: `generate-client-side:${genre}`, // Client will generate procedural audio
        duration,
        title,
        genre,
        mood: mood || genrePreset.mood,
        tokensUsed: tokenCost,
        status: 'completed',
        message: 'Music generation configured - client-side audio synthesis enabled',
        clientSideGeneration: true,
        settings: {
          genre,
          style: genrePreset.style,
          bpm: genrePreset.bpm,
          mood: mood || genrePreset.mood,
          withVocals,
          vocalStyle,
        },
      });

    } catch (error) {
      console.error('Music generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Music generation failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  /**
   * POST /api/music
   * Primary music generation endpoint (Phase 2)
   */
  router.post('/', async (req, res) => {
    try {
      const {
        prompt,
        genre = 'upbeat',
        mood,
        tempo = 'medium',
        duration = 30,
        instrumental = true,
        lyrics,
      } = req.body;

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Prompt must be at least 3 characters',
        });
      }

      const genrePreset = GENRE_PRESETS[genre] || GENRE_PRESETS.upbeat;
      const tokenCost = !instrumental
        ? MUSIC_TOKEN_COSTS.song_with_vocals
        : duration <= 30
        ? MUSIC_TOKEN_COSTS.jingle
        : MUSIC_TOKEN_COSTS.instrumental;

      console.log(`🎵 Phase 2 Music: genre=${genre}, duration=${duration}s, instrumental=${instrumental}`);

      const trackId = `music-${Date.now()}`;
      const title = generateTrackTitle(prompt, genre);

      res.json({
        success: true,
        audioUrl: `generate-client-side:${genre}`,
        trackId,
        title,
        duration,
        genre,
        provider: 'client-procedural',
        tokensUsed: tokenCost,
        isDemo: true,
        clientSideGeneration: true,
      });

    } catch (error) {
      console.error('Music generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Music generation failed',
      });
    }
  });

  /**
   * GET /api/music/genres
   * Get available genres
   */
  router.get('/genres', (req, res) => {
    const genres = Object.entries(GENRE_PRESETS).map(([id, preset]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
      style: preset.style,
      bpm: preset.bpm,
      mood: preset.mood,
    }));

    res.json({ genres });
  });

  /**
   * GET /api/music/samples
   * Get sample tracks
   */
  router.get('/samples', (req, res) => {
    const samples = [
      { id: 'sample-upbeat', name: 'Rise & Shine', genre: 'upbeat', duration: 30, generateClientSide: true },
      { id: 'sample-calm', name: 'Peaceful Moments', genre: 'calm', duration: 60, generateClientSide: true },
      { id: 'sample-corporate', name: 'Business Forward', genre: 'corporate', duration: 45, generateClientSide: true },
      { id: 'sample-cinematic', name: 'Epic Journey', genre: 'cinematic', duration: 90, generateClientSide: true },
      { id: 'sample-electronic', name: 'Digital Dreams', genre: 'electronic', duration: 60, generateClientSide: true },
      { id: 'sample-lofi', name: 'Study Session', genre: 'lofi', duration: 120, generateClientSide: true },
      { id: 'sample-hiphop', name: 'Street Beats', genre: 'hiphop', duration: 60, generateClientSide: true },
      { id: 'sample-jazz', name: 'Smooth Night', genre: 'jazz', duration: 90, generateClientSide: true },
      { id: 'sample-rock', name: 'Power Chords', genre: 'rock', duration: 60, generateClientSide: true },
      { id: 'sample-synthwave', name: 'Neon Dreams', genre: 'synthwave', duration: 75, generateClientSide: true },
    ];

    res.json({ samples, clientSideGeneration: true });
  });

  /**
   * GET /api/music/library
   * Get full music library
   */
  router.get('/library', (req, res) => {
    const library = {
      clientSideGeneration: true,
      categories: [
        {
          id: 'popular',
          name: 'Popular & Trending',
          icon: '🔥',
          tracks: [
            { id: 'pop-1', name: 'Rise & Shine', genre: 'upbeat', duration: 30, generateClientSide: true },
            { id: 'pop-2', name: 'Victory Lap', genre: 'upbeat', duration: 60, generateClientSide: true },
          ],
        },
        {
          id: 'relaxing',
          name: 'Relaxing & Calm',
          icon: '🌊',
          tracks: [
            { id: 'relax-1', name: 'Ocean Breeze', genre: 'calm', duration: 120, generateClientSide: true },
            { id: 'relax-2', name: 'Forest Dawn', genre: 'ambient', duration: 90, generateClientSide: true },
          ],
        },
        {
          id: 'business',
          name: 'Business & Corporate',
          icon: '💼',
          tracks: [
            { id: 'corp-1', name: 'Innovation Drive', genre: 'corporate', duration: 60, generateClientSide: true },
            { id: 'corp-2', name: 'Tech Forward', genre: 'corporate', duration: 45, generateClientSide: true },
          ],
        },
        {
          id: 'cinematic',
          name: 'Cinematic & Epic',
          icon: '🎬',
          tracks: [
            { id: 'cine-1', name: 'Epic Journey', genre: 'cinematic', duration: 90, generateClientSide: true },
            { id: 'cine-2', name: 'Dramatic Rise', genre: 'cinematic', duration: 60, generateClientSide: true },
          ],
        },
      ],
      totalTracks: 20,
      genres: Object.keys(GENRE_PRESETS),
    };

    res.json(library);
  });

  /**
   * GET /api/music/status/:trackId
   * Check generation status
   */
  router.get('/status/:trackId', (req, res) => {
    const { trackId } = req.params;

    res.json({
      trackId,
      status: 'completed',
      audioUrl: `generate-client-side:upbeat`,
      isDemo: true,
    });
  });

  /**
   * POST /api/music/mix
   * Mix voice and music tracks
   */
  router.post('/mix', (req, res) => {
    const { tracks, masterVolume = 0.8, autoDuck = true, duckAmount = 0.3 } = req.body;

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one track is required' });
    }

    const voiceTracks = tracks.filter(t => t.type === 'voice');
    const musicTracks = tracks.filter(t => t.type === 'music');
    const totalDuration = Math.max(...tracks.map(t => (t.startTime || 0) + t.duration));

    res.json({
      success: true,
      message: 'Mix configuration validated',
      mixConfig: {
        voiceTrackCount: voiceTracks.length,
        musicTrackCount: musicTracks.length,
        totalDuration,
        masterVolume,
        autoDuck,
        duckAmount,
        estimatedTokenCost: Math.ceil(totalDuration / 30) * 25,
      },
      clientSideMix: true,
    });
  });

  return router;
};

// Helper functions
function generateTrackTitle(prompt, genre) {
  const words = prompt.split(' ').filter(w => w.length > 3).slice(0, 3);
  const baseTitle = words.length > 0 ? words.join(' ') : genre;
  return baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1).substring(0, 30);
}
