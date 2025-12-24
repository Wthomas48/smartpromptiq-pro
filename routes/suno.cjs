// routes/suno.cjs - Suno AI Music Builder API Routes
const { Router } = require('express');
const router = Router();

// Helper to decode JWT and get user ID
function getUserIdFromAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    // Decode Supabase JWT (base64 decode the payload)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.sub || payload.user_id || payload.id || null;
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
}

// Initialize routes with prisma instance
module.exports = function(prisma, dbAvailable) {

  // ═══════════════════════════════════════════════════════════════════════════════
  // GET /api/suno/songs - Get user's Suno songs
  // ═══════════════════════════════════════════════════════════════════════════════
  router.get('/songs', async (req, res) => {
    try {
      const userId = getUserIdFromAuth(req);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!dbAvailable || !prisma.sunoSong) {
        // Return demo data if DB not available
        return res.json({
          songs: [],
          message: 'Database not available - songs stored locally'
        });
      }

      const songs = await prisma.sunoSong.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      res.json({ songs });
    } catch (error) {
      console.error('Error fetching Suno songs:', error);
      res.status(500).json({ error: 'Failed to fetch songs' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // POST /api/suno/songs - Create a new Suno song
  // ═══════════════════════════════════════════════════════════════════════════════
  router.post('/songs', async (req, res) => {
    try {
      const userId = getUserIdFromAuth(req);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        title,
        prompt,
        lyrics,
        genre,
        mood,
        tempo,
        vocals,
        contentType,
        audioUrl
      } = req.body;

      if (!title || !prompt || !genre || !mood || !tempo || !vocals) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!dbAvailable || !prisma.sunoSong) {
        // Return mock response if DB not available
        return res.json({
          song: {
            id: 'demo-' + Date.now(),
            userId,
            title,
            prompt,
            lyrics,
            genre,
            mood,
            tempo,
            vocals,
            contentType,
            audioUrl,
            status: audioUrl ? 'uploaded' : 'prompt_ready',
            createdAt: new Date().toISOString()
          },
          message: 'Song saved locally (database not available)'
        });
      }

      const song = await prisma.sunoSong.create({
        data: {
          userId,
          title,
          prompt,
          lyrics,
          genre,
          mood,
          tempo,
          vocals,
          contentType,
          audioUrl,
          status: audioUrl ? 'uploaded' : 'prompt_ready'
        }
      });

      res.json({ song });
    } catch (error) {
      console.error('Error creating Suno song:', error);
      res.status(500).json({ error: 'Failed to create song' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PATCH /api/suno/songs/:id - Update a Suno song
  // ═══════════════════════════════════════════════════════════════════════════════
  router.patch('/songs/:id', async (req, res) => {
    try {
      const userId = getUserIdFromAuth(req);
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!dbAvailable || !prisma.sunoSong) {
        return res.json({
          song: { id, ...req.body, updatedAt: new Date().toISOString() },
          message: 'Update simulated (database not available)'
        });
      }

      // Verify ownership
      const existing = await prisma.sunoSong.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return res.status(404).json({ error: 'Song not found' });
      }

      const song = await prisma.sunoSong.update({
        where: { id },
        data: req.body
      });

      res.json({ song });
    } catch (error) {
      console.error('Error updating Suno song:', error);
      res.status(500).json({ error: 'Failed to update song' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DELETE /api/suno/songs/:id - Delete a Suno song
  // ═══════════════════════════════════════════════════════════════════════════════
  router.delete('/songs/:id', async (req, res) => {
    try {
      const userId = getUserIdFromAuth(req);
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!dbAvailable || !prisma.sunoSong) {
        return res.json({ success: true, message: 'Delete simulated (database not available)' });
      }

      // Verify ownership
      const existing = await prisma.sunoSong.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return res.status(404).json({ error: 'Song not found' });
      }

      await prisma.sunoSong.delete({ where: { id } });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting Suno song:', error);
      res.status(500).json({ error: 'Failed to delete song' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // POST /api/suno/songs/:id/favorite - Toggle favorite status
  // ═══════════════════════════════════════════════════════════════════════════════
  router.post('/songs/:id/favorite', async (req, res) => {
    try {
      const userId = getUserIdFromAuth(req);
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!dbAvailable || !prisma.sunoSong) {
        return res.json({ isFavorite: true, message: 'Favorite toggled (database not available)' });
      }

      const existing = await prisma.sunoSong.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return res.status(404).json({ error: 'Song not found' });
      }

      const song = await prisma.sunoSong.update({
        where: { id },
        data: { isFavorite: !existing.isFavorite }
      });

      res.json({ isFavorite: song.isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // POST /api/suno/songs/:id/play - Increment play count
  // ═══════════════════════════════════════════════════════════════════════════════
  router.post('/songs/:id/play', async (req, res) => {
    try {
      const { id } = req.params;

      if (!dbAvailable || !prisma.sunoSong) {
        return res.json({ playCount: 1 });
      }

      const song = await prisma.sunoSong.update({
        where: { id },
        data: { playCount: { increment: 1 } }
      });

      res.json({ playCount: song.playCount });
    } catch (error) {
      console.error('Error incrementing play count:', error);
      res.status(500).json({ error: 'Failed to update play count' });
    }
  });

  return router;
};
