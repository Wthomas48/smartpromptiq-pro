// ==========================================
// PREMIUM MUSIC LIBRARY - 25+ MIND-BLOWING TRACKS
// ==========================================
// Professional, royalty-free music for app backgrounds,
// intros, content creation, and more!

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  genre: MusicGenre;
  mood: MusicMood[];
  bpm: number;
  duration: number; // seconds
  description: string;
  tags: string[];
  premium: boolean;
  featured?: boolean;
  trending?: boolean;
  plays?: number;
  likes?: number;
  // Actual audio URL for playback
  audioUrl?: string;
  // Audio synthesis parameters for Web Audio API (fallback)
  synthesis: {
    key: string;
    scale: 'major' | 'minor' | 'pentatonic' | 'dorian' | 'mixolydian';
    baseFreq: number;
    progression: number[];
    rhythm: 'steady' | 'syncopated' | 'driving' | 'laid-back' | 'epic';
    instruments: ('piano' | 'synth' | 'strings' | 'bass' | 'drums' | 'pad' | 'lead' | 'guitar' | 'bells')[];
    intensity: number; // 0-100
  };
}

// ==========================================
// ROYALTY-FREE AUDIO URLS
// Using Pixabay's actual working audio CDN links
// ==========================================

// Helper to get audio URL with fallback to Web Audio synthesis
export const getAudioUrl = (trackId: string): string | undefined => {
  return AUDIO_URLS[trackId];
};

// Actual working Pixabay audio URLs (royalty-free, no attribution required)
export const AUDIO_URLS: Record<string, string> = {
  // Upbeat & Energetic - Real Pixabay tracks
  'rise-and-shine': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Upbeat fun
  'victory-lap': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d484.mp3', // Inspiring cinematic
  'unstoppable-force': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c8.mp3', // Powerful beat

  // Calm & Relaxing
  'ocean-breeze': 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_19816e4e4b.mp3', // Relaxing ambient
  'forest-dawn': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8a433d6d19.mp3', // Nature peaceful
  'zen-garden': 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3', // Meditation calm

  // Corporate & Professional
  'innovation-drive': 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3', // Corporate tech
  'success-story': 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3', // Business uplifting
  'future-vision': 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508a06.mp3', // Modern innovation

  // Cinematic & Epic
  'epic-journey': 'https://cdn.pixabay.com/download/audio/2022/01/13/audio_0f39af8d14.mp3', // Epic adventure
  'dramatic-rise': 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3', // Cinematic build
  'heroes-anthem': 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_67bcb18a67.mp3', // Heroic theme

  // Electronic & Modern
  'digital-dreams': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_4e6626e31e.mp3', // Synthwave retro
  'cyber-wave': 'https://cdn.pixabay.com/download/audio/2022/10/09/audio_942e51e89a.mp3', // Electronic pulse
  'neon-nights': 'https://cdn.pixabay.com/download/audio/2022/08/25/audio_eaf28a0dba.mp3', // EDM dance

  // Lo-Fi & Chill
  'study-session': 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112235f.mp3', // Lofi study beats
  'late-night-coding': 'https://cdn.pixabay.com/download/audio/2022/04/14/audio_6e37d85c5a.mp3', // Chill coding
  'coffee-shop-vibes': 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_ea70be080d.mp3', // Jazz cafe

  // Inspirational
  'new-beginnings': 'https://cdn.pixabay.com/download/audio/2022/02/15/audio_942ba6e6e1.mp3', // Motivational start
  'dream-big': 'https://cdn.pixabay.com/download/audio/2022/08/31/audio_419263eb82.mp3', // Uplifting dreams
  'limitless': 'https://cdn.pixabay.com/download/audio/2022/09/06/audio_dc39bde808.mp3', // Powerful motivation

  // Tropical & Summer
  'island-paradise': 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_b9b0f36ac7.mp3', // Summer tropical
  'sunset-cruise': 'https://cdn.pixabay.com/download/audio/2022/07/05/audio_2f4b5c9e2a.mp3', // Chill sunset

  // Hip-Hop & Urban
  'urban-vibes': 'https://cdn.pixabay.com/download/audio/2022/04/23/audio_26c06ef8e3.mp3', // Urban beat
  'street-anthem': 'https://cdn.pixabay.com/download/audio/2022/06/17/audio_c8d62c85c7.mp3', // Hip-hop anthem
};

export type MusicGenre =
  | 'upbeat'
  | 'calm'
  | 'corporate'
  | 'cinematic'
  | 'electronic'
  | 'lofi'
  | 'epic'
  | 'inspirational'
  | 'ambient'
  | 'pop'
  | 'rock'
  | 'jazz'
  | 'classical'
  | 'hiphop'
  | 'tropical'
  | 'acoustic'
  | 'orchestral'
  | 'edm';

export type MusicMood =
  | 'happy'
  | 'energetic'
  | 'peaceful'
  | 'dramatic'
  | 'mysterious'
  | 'romantic'
  | 'powerful'
  | 'playful'
  | 'melancholic'
  | 'uplifting'
  | 'intense'
  | 'dreamy'
  | 'confident'
  | 'adventurous'
  | 'nostalgic';

// ==========================================
// GENRE DEFINITIONS WITH ICONS & COLORS
// ==========================================

export const MUSIC_GENRES = [
  {
    id: 'upbeat',
    name: 'Upbeat & Energetic',
    icon: '⚡',
    color: 'from-orange-500 to-red-500',
    description: 'High energy tracks for exciting content'
  },
  {
    id: 'calm',
    name: 'Calm & Relaxing',
    icon: '🌊',
    color: 'from-teal-400 to-cyan-500',
    description: 'Peaceful music for wellness & meditation'
  },
  {
    id: 'corporate',
    name: 'Corporate & Professional',
    icon: '💼',
    color: 'from-blue-500 to-indigo-500',
    description: 'Business presentations & demos'
  },
  {
    id: 'cinematic',
    name: 'Cinematic & Epic',
    icon: '🎬',
    color: 'from-purple-500 to-pink-500',
    description: 'Movie trailer style dramatic music'
  },
  {
    id: 'electronic',
    name: 'Electronic & Modern',
    icon: '🎧',
    color: 'from-violet-500 to-purple-600',
    description: 'Tech-focused electronic beats'
  },
  {
    id: 'lofi',
    name: 'Lo-Fi & Chill',
    icon: '☕',
    color: 'from-amber-500 to-orange-500',
    description: 'Relaxed beats for focus & study'
  },
  {
    id: 'epic',
    name: 'Epic & Powerful',
    icon: '🔥',
    color: 'from-red-500 to-orange-600',
    description: 'Grand orchestral & powerful themes'
  },
  {
    id: 'inspirational',
    name: 'Inspirational',
    icon: '✨',
    color: 'from-yellow-400 to-amber-500',
    description: 'Motivational & uplifting music'
  },
  {
    id: 'ambient',
    name: 'Ambient & Atmospheric',
    icon: '🌌',
    color: 'from-indigo-500 to-blue-600',
    description: 'Ethereal soundscapes & textures'
  },
  {
    id: 'pop',
    name: 'Pop & Catchy',
    icon: '🎤',
    color: 'from-pink-500 to-rose-500',
    description: 'Modern pop style instrumentals'
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop & Urban',
    icon: '🎹',
    color: 'from-slate-600 to-slate-800',
    description: 'Modern hip-hop beats & rhythms'
  },
  {
    id: 'tropical',
    name: 'Tropical & Summer',
    icon: '🌴',
    color: 'from-green-400 to-teal-500',
    description: 'Beach vibes & tropical house'
  },
  {
    id: 'acoustic',
    name: 'Acoustic & Organic',
    icon: '🎸',
    color: 'from-amber-600 to-yellow-600',
    description: 'Natural acoustic instruments'
  },
  {
    id: 'orchestral',
    name: 'Orchestral & Classical',
    icon: '🎻',
    color: 'from-rose-500 to-red-600',
    description: 'Full orchestra arrangements'
  },
  {
    id: 'edm',
    name: 'EDM & Dance',
    icon: '🪩',
    color: 'from-fuchsia-500 to-purple-600',
    description: 'Festival-ready dance music'
  },
];

// ==========================================
// 25+ PREMIUM MUSIC TRACKS
// ==========================================

export const PREMIUM_MUSIC_TRACKS: MusicTrack[] = [
  // ========== UPBEAT & ENERGETIC ==========
  {
    id: 'rise-and-shine',
    name: 'Rise & Shine',
    artist: 'SmartPromptiq Studio',
    genre: 'upbeat',
    mood: ['happy', 'energetic', 'uplifting'],
    bpm: 128,
    duration: 180,
    description: 'Start your day with unstoppable energy! Perfect for morning motivation.',
    tags: ['morning', 'motivation', 'energy', 'workout'],
    premium: false,
    featured: true,
    trending: true,
    plays: 15420,
    likes: 3850,
    synthesis: {
      key: 'C',
      scale: 'major',
      baseFreq: 261.63,
      progression: [1, 5, 6, 4], // C-G-Am-F
      rhythm: 'driving',
      instruments: ['synth', 'bass', 'drums', 'lead'],
      intensity: 85
    }
  },
  {
    id: 'victory-lap',
    name: 'Victory Lap',
    artist: 'SmartPromptiq Studio',
    genre: 'upbeat',
    mood: ['powerful', 'confident', 'energetic'],
    bpm: 140,
    duration: 150,
    description: 'Champion\'s anthem for achievement celebration!',
    tags: ['victory', 'sports', 'achievement', 'winning'],
    premium: false,
    plays: 12300,
    likes: 2980,
    synthesis: {
      key: 'E',
      scale: 'major',
      baseFreq: 329.63,
      progression: [1, 4, 5, 5],
      rhythm: 'driving',
      instruments: ['synth', 'drums', 'bass', 'lead'],
      intensity: 95
    }
  },
  {
    id: 'unstoppable-force',
    name: 'Unstoppable Force',
    artist: 'SmartPromptiq Studio',
    genre: 'upbeat',
    mood: ['intense', 'powerful', 'energetic'],
    bpm: 150,
    duration: 120,
    description: 'Pure adrenaline rush for action-packed content!',
    tags: ['action', 'sports', 'intense', 'power'],
    premium: true,
    plays: 8900,
    likes: 2100,
    synthesis: {
      key: 'A',
      scale: 'minor',
      baseFreq: 220,
      progression: [1, 7, 6, 5],
      rhythm: 'driving',
      instruments: ['synth', 'drums', 'bass', 'lead', 'strings'],
      intensity: 100
    }
  },

  // ========== CALM & RELAXING ==========
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    artist: 'SmartPromptiq Studio',
    genre: 'calm',
    mood: ['peaceful', 'dreamy', 'romantic'],
    bpm: 72,
    duration: 240,
    description: 'Gentle waves of tranquility for meditation & relaxation.',
    tags: ['meditation', 'spa', 'relaxation', 'sleep'],
    premium: false,
    featured: true,
    plays: 18500,
    likes: 4200,
    synthesis: {
      key: 'F',
      scale: 'major',
      baseFreq: 174.61,
      progression: [1, 6, 4, 5],
      rhythm: 'laid-back',
      instruments: ['piano', 'pad', 'strings'],
      intensity: 25
    }
  },
  {
    id: 'forest-dawn',
    name: 'Forest Dawn',
    artist: 'SmartPromptiq Studio',
    genre: 'calm',
    mood: ['peaceful', 'nostalgic', 'dreamy'],
    bpm: 65,
    duration: 300,
    description: 'Wake up in a magical forest with morning sunlight.',
    tags: ['nature', 'morning', 'peaceful', 'ambient'],
    premium: false,
    plays: 14200,
    likes: 3600,
    synthesis: {
      key: 'G',
      scale: 'major',
      baseFreq: 196,
      progression: [1, 4, 6, 5],
      rhythm: 'laid-back',
      instruments: ['piano', 'bells', 'pad', 'strings'],
      intensity: 20
    }
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    artist: 'SmartPromptiq Studio',
    genre: 'ambient',
    mood: ['peaceful', 'mysterious', 'dreamy'],
    bpm: 60,
    duration: 360,
    description: 'Japanese-inspired ambient for deep focus.',
    tags: ['zen', 'focus', 'meditation', 'japanese'],
    premium: true,
    plays: 9800,
    likes: 2400,
    synthesis: {
      key: 'D',
      scale: 'pentatonic',
      baseFreq: 293.66,
      progression: [1, 4, 5, 1],
      rhythm: 'laid-back',
      instruments: ['bells', 'pad', 'piano'],
      intensity: 15
    }
  },

  // ========== CORPORATE & PROFESSIONAL ==========
  {
    id: 'innovation-drive',
    name: 'Innovation Drive',
    artist: 'SmartPromptiq Studio',
    genre: 'corporate',
    mood: ['confident', 'uplifting', 'energetic'],
    bpm: 110,
    duration: 180,
    description: 'Modern tech company vibes for presentations.',
    tags: ['tech', 'business', 'presentation', 'startup'],
    premium: false,
    featured: true,
    trending: true,
    plays: 22100,
    likes: 5100,
    synthesis: {
      key: 'C',
      scale: 'major',
      baseFreq: 261.63,
      progression: [1, 5, 6, 4],
      rhythm: 'steady',
      instruments: ['piano', 'synth', 'bass', 'drums'],
      intensity: 60
    }
  },
  {
    id: 'success-story',
    name: 'Success Story',
    artist: 'SmartPromptiq Studio',
    genre: 'corporate',
    mood: ['uplifting', 'confident', 'happy'],
    bpm: 100,
    duration: 150,
    description: 'Inspiring corporate narrative music.',
    tags: ['corporate', 'success', 'business', 'motivation'],
    premium: false,
    plays: 16800,
    likes: 3900,
    synthesis: {
      key: 'G',
      scale: 'major',
      baseFreq: 196,
      progression: [1, 4, 5, 1],
      rhythm: 'steady',
      instruments: ['piano', 'strings', 'synth', 'bass'],
      intensity: 55
    }
  },
  {
    id: 'future-vision',
    name: 'Future Vision',
    artist: 'SmartPromptiq Studio',
    genre: 'corporate',
    mood: ['confident', 'adventurous', 'uplifting'],
    bpm: 115,
    duration: 180,
    description: 'Forward-thinking tech innovation soundtrack.',
    tags: ['tech', 'innovation', 'future', 'AI'],
    premium: true,
    plays: 11200,
    likes: 2700,
    synthesis: {
      key: 'A',
      scale: 'major',
      baseFreq: 220,
      progression: [1, 5, 4, 6],
      rhythm: 'driving',
      instruments: ['synth', 'piano', 'bass', 'drums', 'pad'],
      intensity: 70
    }
  },

  // ========== CINEMATIC & EPIC ==========
  {
    id: 'epic-journey',
    name: 'Epic Journey',
    artist: 'SmartPromptiq Studio',
    genre: 'cinematic',
    mood: ['dramatic', 'adventurous', 'powerful'],
    bpm: 85,
    duration: 240,
    description: 'Grand adventure theme for trailers & intros.',
    tags: ['trailer', 'adventure', 'epic', 'movie'],
    premium: false,
    featured: true,
    plays: 19800,
    likes: 4800,
    synthesis: {
      key: 'D',
      scale: 'minor',
      baseFreq: 146.83,
      progression: [1, 6, 3, 7],
      rhythm: 'epic',
      instruments: ['strings', 'drums', 'bass', 'synth', 'piano'],
      intensity: 90
    }
  },
  {
    id: 'dramatic-rise',
    name: 'Dramatic Rise',
    artist: 'SmartPromptiq Studio',
    genre: 'cinematic',
    mood: ['dramatic', 'intense', 'powerful'],
    bpm: 90,
    duration: 180,
    description: 'Building tension with explosive release!',
    tags: ['tension', 'drama', 'climax', 'trailer'],
    premium: true,
    plays: 13500,
    likes: 3200,
    synthesis: {
      key: 'E',
      scale: 'minor',
      baseFreq: 164.81,
      progression: [1, 4, 7, 6],
      rhythm: 'epic',
      instruments: ['strings', 'drums', 'synth', 'bass', 'pad'],
      intensity: 95
    }
  },
  {
    id: 'heroes-anthem',
    name: 'Heroes Anthem',
    artist: 'SmartPromptiq Studio',
    genre: 'epic',
    mood: ['powerful', 'uplifting', 'dramatic'],
    bpm: 80,
    duration: 210,
    description: 'Triumphant hero theme for epic moments.',
    tags: ['hero', 'triumph', 'victory', 'cinematic'],
    premium: true,
    plays: 10200,
    likes: 2500,
    synthesis: {
      key: 'C',
      scale: 'major',
      baseFreq: 130.81,
      progression: [1, 5, 6, 4],
      rhythm: 'epic',
      instruments: ['strings', 'drums', 'bass', 'synth', 'bells'],
      intensity: 88
    }
  },

  // ========== ELECTRONIC & MODERN ==========
  {
    id: 'digital-dreams',
    name: 'Digital Dreams',
    artist: 'SmartPromptiq Studio',
    genre: 'electronic',
    mood: ['dreamy', 'energetic', 'mysterious'],
    bpm: 128,
    duration: 180,
    description: 'Futuristic synthwave for tech content.',
    tags: ['synthwave', 'retro', 'tech', 'future'],
    premium: false,
    trending: true,
    plays: 17600,
    likes: 4100,
    synthesis: {
      key: 'A',
      scale: 'minor',
      baseFreq: 220,
      progression: [1, 6, 4, 5],
      rhythm: 'syncopated',
      instruments: ['synth', 'bass', 'drums', 'lead', 'pad'],
      intensity: 75
    }
  },
  {
    id: 'cyber-wave',
    name: 'Cyber Wave',
    artist: 'SmartPromptiq Studio',
    genre: 'electronic',
    mood: ['intense', 'energetic', 'mysterious'],
    bpm: 140,
    duration: 150,
    description: 'Cyberpunk aesthetic for gaming content.',
    tags: ['cyberpunk', 'gaming', 'neon', 'retro'],
    premium: true,
    plays: 11800,
    likes: 2900,
    synthesis: {
      key: 'F#',
      scale: 'minor',
      baseFreq: 185,
      progression: [1, 7, 6, 4],
      rhythm: 'driving',
      instruments: ['synth', 'bass', 'drums', 'lead'],
      intensity: 85
    }
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    artist: 'SmartPromptiq Studio',
    genre: 'edm',
    mood: ['energetic', 'playful', 'intense'],
    bpm: 138,
    duration: 180,
    description: 'Festival-ready EDM banger!',
    tags: ['edm', 'festival', 'dance', 'club'],
    premium: true,
    plays: 14100,
    likes: 3400,
    synthesis: {
      key: 'G',
      scale: 'minor',
      baseFreq: 196,
      progression: [1, 6, 4, 7],
      rhythm: 'driving',
      instruments: ['synth', 'bass', 'drums', 'lead', 'pad'],
      intensity: 95
    }
  },

  // ========== LO-FI & CHILL ==========
  {
    id: 'study-session',
    name: 'Study Session',
    artist: 'SmartPromptiq Studio',
    genre: 'lofi',
    mood: ['peaceful', 'nostalgic', 'dreamy'],
    bpm: 85,
    duration: 300,
    description: 'Chill lo-fi beats for focus & productivity.',
    tags: ['study', 'focus', 'chill', 'homework'],
    premium: false,
    featured: true,
    plays: 28500,
    likes: 6800,
    synthesis: {
      key: 'D',
      scale: 'dorian',
      baseFreq: 146.83,
      progression: [2, 5, 1, 6],
      rhythm: 'laid-back',
      instruments: ['piano', 'bass', 'drums'],
      intensity: 35
    }
  },
  {
    id: 'late-night-coding',
    name: 'Late Night Coding',
    artist: 'SmartPromptiq Studio',
    genre: 'lofi',
    mood: ['peaceful', 'mysterious', 'dreamy'],
    bpm: 80,
    duration: 360,
    description: 'Perfect companion for late night work sessions.',
    tags: ['coding', 'work', 'night', 'focus'],
    premium: false,
    plays: 21300,
    likes: 5200,
    synthesis: {
      key: 'E',
      scale: 'minor',
      baseFreq: 164.81,
      progression: [6, 4, 1, 5],
      rhythm: 'laid-back',
      instruments: ['piano', 'synth', 'bass', 'drums'],
      intensity: 30
    }
  },
  {
    id: 'coffee-shop-vibes',
    name: 'Coffee Shop Vibes',
    artist: 'SmartPromptiq Studio',
    genre: 'lofi',
    mood: ['happy', 'peaceful', 'nostalgic'],
    bpm: 90,
    duration: 240,
    description: 'Warm coffee shop atmosphere with jazzy lo-fi.',
    tags: ['coffee', 'jazz', 'chill', 'cafe'],
    premium: true,
    plays: 16700,
    likes: 4000,
    synthesis: {
      key: 'F',
      scale: 'mixolydian',
      baseFreq: 174.61,
      progression: [1, 4, 7, 4],
      rhythm: 'syncopated',
      instruments: ['piano', 'bass', 'drums', 'guitar'],
      intensity: 40
    }
  },

  // ========== INSPIRATIONAL ==========
  {
    id: 'new-beginnings',
    name: 'New Beginnings',
    artist: 'SmartPromptiq Studio',
    genre: 'inspirational',
    mood: ['uplifting', 'happy', 'confident'],
    bpm: 105,
    duration: 180,
    description: 'Fresh start energy for motivational content.',
    tags: ['motivation', 'fresh', 'new', 'positive'],
    premium: false,
    plays: 19200,
    likes: 4500,
    synthesis: {
      key: 'G',
      scale: 'major',
      baseFreq: 196,
      progression: [1, 5, 6, 4],
      rhythm: 'steady',
      instruments: ['piano', 'strings', 'synth', 'drums'],
      intensity: 65
    }
  },
  {
    id: 'dream-big',
    name: 'Dream Big',
    artist: 'SmartPromptiq Studio',
    genre: 'inspirational',
    mood: ['uplifting', 'adventurous', 'powerful'],
    bpm: 115,
    duration: 210,
    description: 'Chase your dreams with this uplifting anthem.',
    tags: ['dreams', 'goals', 'motivation', 'success'],
    premium: true,
    plays: 13900,
    likes: 3300,
    synthesis: {
      key: 'C',
      scale: 'major',
      baseFreq: 261.63,
      progression: [1, 4, 6, 5],
      rhythm: 'driving',
      instruments: ['piano', 'strings', 'synth', 'drums', 'bass'],
      intensity: 75
    }
  },
  {
    id: 'limitless',
    name: 'Limitless',
    artist: 'SmartPromptiq Studio',
    genre: 'inspirational',
    mood: ['powerful', 'confident', 'uplifting'],
    bpm: 120,
    duration: 180,
    description: 'Break through barriers with limitless energy.',
    tags: ['breakthrough', 'power', 'motivation', 'energy'],
    premium: true,
    plays: 11500,
    likes: 2800,
    synthesis: {
      key: 'A',
      scale: 'major',
      baseFreq: 220,
      progression: [1, 5, 4, 4],
      rhythm: 'driving',
      instruments: ['synth', 'strings', 'drums', 'bass', 'piano'],
      intensity: 85
    }
  },

  // ========== TROPICAL & SUMMER ==========
  {
    id: 'island-paradise',
    name: 'Island Paradise',
    artist: 'SmartPromptiq Studio',
    genre: 'tropical',
    mood: ['happy', 'playful', 'romantic'],
    bpm: 110,
    duration: 180,
    description: 'Tropical house vibes for summer content.',
    tags: ['summer', 'beach', 'vacation', 'tropical'],
    premium: false,
    plays: 15600,
    likes: 3700,
    synthesis: {
      key: 'F',
      scale: 'major',
      baseFreq: 174.61,
      progression: [1, 5, 6, 4],
      rhythm: 'syncopated',
      instruments: ['synth', 'bass', 'drums', 'bells', 'guitar'],
      intensity: 70
    }
  },
  {
    id: 'sunset-cruise',
    name: 'Sunset Cruise',
    artist: 'SmartPromptiq Studio',
    genre: 'tropical',
    mood: ['romantic', 'peaceful', 'happy'],
    bpm: 100,
    duration: 210,
    description: 'Golden hour vibes sailing into the sunset.',
    tags: ['sunset', 'cruise', 'romantic', 'summer'],
    premium: true,
    plays: 10800,
    likes: 2600,
    synthesis: {
      key: 'G',
      scale: 'major',
      baseFreq: 196,
      progression: [1, 4, 5, 4],
      rhythm: 'laid-back',
      instruments: ['guitar', 'synth', 'bass', 'drums', 'pad'],
      intensity: 55
    }
  },

  // ========== HIP-HOP & URBAN ==========
  {
    id: 'urban-vibes',
    name: 'Urban Vibes',
    artist: 'SmartPromptiq Studio',
    genre: 'hiphop',
    mood: ['confident', 'energetic', 'playful'],
    bpm: 95,
    duration: 180,
    description: 'Modern hip-hop beat for urban content.',
    tags: ['hiphop', 'urban', 'beat', 'rap'],
    premium: false,
    plays: 14800,
    likes: 3500,
    synthesis: {
      key: 'D',
      scale: 'minor',
      baseFreq: 146.83,
      progression: [1, 4, 6, 5],
      rhythm: 'syncopated',
      instruments: ['synth', 'bass', 'drums', 'piano'],
      intensity: 65
    }
  },
  {
    id: 'street-anthem',
    name: 'Street Anthem',
    artist: 'SmartPromptiq Studio',
    genre: 'hiphop',
    mood: ['powerful', 'confident', 'intense'],
    bpm: 90,
    duration: 180,
    description: 'Hard-hitting hip-hop for bold statements.',
    tags: ['anthem', 'street', 'bold', 'powerful'],
    premium: true,
    plays: 12100,
    likes: 2900,
    synthesis: {
      key: 'G',
      scale: 'minor',
      baseFreq: 196,
      progression: [1, 7, 6, 4],
      rhythm: 'syncopated',
      instruments: ['bass', 'drums', 'synth', 'piano'],
      intensity: 80
    }
  },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get tracks by genre
 */
export const getTracksByGenre = (genre: MusicGenre): MusicTrack[] => {
  return PREMIUM_MUSIC_TRACKS.filter(track => track.genre === genre);
};

/**
 * Get tracks by mood
 */
export const getTracksByMood = (mood: MusicMood): MusicTrack[] => {
  return PREMIUM_MUSIC_TRACKS.filter(track => track.mood.includes(mood));
};

/**
 * Get featured tracks
 */
export const getFeaturedTracks = (): MusicTrack[] => {
  return PREMIUM_MUSIC_TRACKS.filter(track => track.featured);
};

/**
 * Get trending tracks
 */
export const getTrendingTracks = (): MusicTrack[] => {
  return PREMIUM_MUSIC_TRACKS.filter(track => track.trending);
};

/**
 * Get free tracks only
 */
export const getFreeTracks = (): MusicTrack[] => {
  return PREMIUM_MUSIC_TRACKS.filter(track => !track.premium);
};

/**
 * Search tracks by name or tags
 */
export const searchTracks = (query: string): MusicTrack[] => {
  const lowerQuery = query.toLowerCase();
  return PREMIUM_MUSIC_TRACKS.filter(track =>
    track.name.toLowerCase().includes(lowerQuery) ||
    track.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    track.description.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get tracks sorted by popularity
 */
export const getPopularTracks = (limit: number = 10): MusicTrack[] => {
  return [...PREMIUM_MUSIC_TRACKS]
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, limit);
};

/**
 * Get recommended tracks based on a track
 */
export const getRecommendedTracks = (trackId: string, limit: number = 5): MusicTrack[] => {
  const track = PREMIUM_MUSIC_TRACKS.find(t => t.id === trackId);
  if (!track) return [];

  return PREMIUM_MUSIC_TRACKS
    .filter(t => t.id !== trackId && (t.genre === track.genre || t.mood.some(m => track.mood.includes(m))))
    .slice(0, limit);
};

// ==========================================
// MUSIC CATEGORIES FOR DIFFERENT USE CASES
// ==========================================

export const MUSIC_USE_CASES = {
  appBackground: ['study-session', 'late-night-coding', 'ocean-breeze', 'forest-dawn', 'zen-garden'],
  introJingle: ['rise-and-shine', 'victory-lap', 'innovation-drive', 'new-beginnings'],
  presentation: ['innovation-drive', 'success-story', 'future-vision', 'corporate-1'],
  trailer: ['epic-journey', 'dramatic-rise', 'heroes-anthem', 'cyber-wave'],
  meditation: ['ocean-breeze', 'forest-dawn', 'zen-garden'],
  workout: ['unstoppable-force', 'victory-lap', 'neon-nights', 'rise-and-shine'],
  gaming: ['digital-dreams', 'cyber-wave', 'neon-nights', 'street-anthem'],
  podcast: ['coffee-shop-vibes', 'study-session', 'late-night-coding'],
  vlog: ['island-paradise', 'sunset-cruise', 'new-beginnings', 'happy-days'],
  tutorial: ['innovation-drive', 'study-session', 'late-night-coding'],
};

export default PREMIUM_MUSIC_TRACKS;
