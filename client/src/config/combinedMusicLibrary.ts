/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ COMBINED MUSIC LIBRARY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Combines Premium tracks (SoundHelix) with Local tracks (446 royalty-free files)
 * Total: 500+ tracks across 12 genres
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  FIXED_PREMIUM_TRACKS,
  PremiumTrack,
  MusicGenreType,
  MUSIC_CATEGORIES,
  getTracksByGenre,
  searchTracks,
  getFeaturedTracks,
  getTrendingTracks,
  getNewReleases,
} from './premiumMusic';

import {
  LOCAL_TRACKS,
  LocalTrack,
  LOCAL_LIBRARY_STATS,
  getLocalTracksByGenre,
  searchLocalTracks,
  getShortTracks,
  getLongTracks,
} from './localMusicLibrary';

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED TRACK TYPE
// ═══════════════════════════════════════════════════════════════════════════════

export type CombinedTrack = PremiumTrack | (LocalTrack & {
  artist: string;
  bpm: number;
  plays: number;
  likes: number;
  waveformColor?: string;
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED LIBRARY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Convert local track to combined format
const localToCombined = (track: LocalTrack): CombinedTrack => ({
  ...track,
  artist: 'Royalty Free Collection',
  bpm: 120,
  plays: Math.floor(Math.random() * 30000) + 5000,
  likes: Math.floor(Math.random() * 3000) + 500,
  waveformColor: getGenreColor(track.genre),
});

// Get color for genre
const getGenreColor = (genre: MusicGenreType): string => {
  const colors: Record<MusicGenreType, string> = {
    upbeat: '#f97316',
    calm: '#06b6d4',
    corporate: '#64748b',
    cinematic: '#7c3aed',
    electronic: '#06b6d4',
    lofi: '#f59e0b',
    hiphop: '#ef4444',
    jazz: '#eab308',
    acoustic: '#22c55e',
    inspirational: '#ec4899',
    ambient: '#14b8a6',
    podcast: '#8b5cf6',
  };
  return colors[genre] || '#6366f1';
};

// Get ALL tracks (premium + local)
export const getAllTracks = (): CombinedTrack[] => {
  const localAsTrack = LOCAL_TRACKS.map(localToCombined);
  return [...FIXED_PREMIUM_TRACKS, ...localAsTrack];
};

// Get all local tracks as combined format
export const getAllLocalTracks = (): CombinedTrack[] => {
  return LOCAL_TRACKS.map(localToCombined);
};

// Get all premium tracks
export const getAllPremiumTracks = (): PremiumTrack[] => {
  return FIXED_PREMIUM_TRACKS;
};

// Search ALL tracks (premium + local)
export const searchAllTracks = (query: string): CombinedTrack[] => {
  const premiumResults = searchTracks(query);
  const localResults = searchLocalTracks(query).map(localToCombined);
  return [...premiumResults, ...localResults];
};

// Get ALL tracks by genre
export const getAllTracksByGenre = (genre: MusicGenreType): CombinedTrack[] => {
  const premium = getTracksByGenre(genre);
  const local = getLocalTracksByGenre(genre).map(localToCombined);
  return [...premium, ...local];
};

// Get short tracks (for intros/outros) - under 60 seconds
export const getShortIntroTracks = (): CombinedTrack[] => {
  return getShortTracks(60).map(localToCombined);
};

// Get medium tracks (1-3 minutes) - good for backgrounds
export const getMediumTracks = (): CombinedTrack[] => {
  return LOCAL_TRACKS
    .filter(t => t.duration >= 60 && t.duration < 180)
    .map(localToCombined);
};

// Get long tracks (3+ minutes) - for longer content
export const getLongBackgroundTracks = (): CombinedTrack[] => {
  return getLongTracks(180).map(localToCombined);
};

// Get random track from all libraries
export const getRandomTrack = (genre?: MusicGenreType): CombinedTrack => {
  const tracks = genre ? getAllTracksByGenre(genre) : getAllTracks();
  return tracks[Math.floor(Math.random() * tracks.length)];
};

// Get track by ID from any library
export const getTrackById = (id: string): CombinedTrack | undefined => {
  // Check premium first
  const premium = FIXED_PREMIUM_TRACKS.find(t => t.id === id);
  if (premium) return premium;

  // Check local
  const local = LOCAL_TRACKS.find(t => t.id === id);
  if (local) return localToCombined(local);

  return undefined;
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED LIBRARY STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export const COMBINED_STATS = {
  // Track counts
  totalTracks: FIXED_PREMIUM_TRACKS.length + LOCAL_TRACKS.length,
  premiumTracks: FIXED_PREMIUM_TRACKS.length,
  localTracks: LOCAL_TRACKS.length,

  // Genre count
  totalGenres: MUSIC_CATEGORIES.length,

  // Duration breakdown
  shortTracks: LOCAL_LIBRARY_STATS.shortTracks,
  mediumTracks: LOCAL_LIBRARY_STATS.mediumTracks,
  longTracks: LOCAL_LIBRARY_STATS.longTracks,

  // Premium stats
  featuredTracks: getFeaturedTracks().length,
  trendingTracks: getTrendingTracks().length,
  newReleases: getNewReleases().length,

  // Genre breakdown (combined)
  genreCounts: MUSIC_CATEGORIES.reduce((acc, cat) => {
    const premiumCount = FIXED_PREMIUM_TRACKS.filter(t => t.genre === cat.id).length;
    const localCount = LOCAL_TRACKS.filter(t => t.genre === cat.id).length;
    acc[cat.id] = premiumCount + localCount;
    return acc;
  }, {} as Record<string, number>),
};

// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS FOR CONVENIENCE
// ═══════════════════════════════════════════════════════════════════════════════

// Re-export types
export type { PremiumTrack, LocalTrack, MusicGenreType };

// Re-export values
export {
  // Categories
  MUSIC_CATEGORIES,

  // Premium library functions
  getFeaturedTracks,
  getTrendingTracks,
  getNewReleases,

  // Raw data
  FIXED_PREMIUM_TRACKS,
  LOCAL_TRACKS,
};

export default getAllTracks;
