import React, { useState, useRef, useEffect } from 'react';
import {
  FIXED_PREMIUM_TRACKS as PREMIUM_TRACKS,
  MUSIC_CATEGORIES,
  getTracksByGenre,
  getFeaturedTracks,
  getTrendingTracks,
  searchTracks,
  type PremiumTrack,
  type MusicCategory
} from '../config/premiumMusic';

interface PremiumMusicLibraryProps {
  onSelectTrack?: (track: PremiumTrack) => void;
  showFullLibrary?: boolean;
  compact?: boolean;
}

export const PremiumMusicLibrary: React.FC<PremiumMusicLibraryProps> = ({
  onSelectTrack,
  showFullLibrary = true,
  compact = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState<PremiumTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showWaveform, setShowWaveform] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const isTransitioningRef = useRef(false);

  // Get filtered tracks
  const getFilteredTracks = (): PremiumTrack[] => {
    let tracks = PREMIUM_TRACKS;

    if (searchQuery) {
      tracks = searchTracks(searchQuery);
    } else if (activeCategory === 'featured') {
      tracks = getFeaturedTracks();
    } else if (activeCategory === 'trending') {
      tracks = getTrendingTracks();
    } else if (activeCategory !== 'all') {
      tracks = getTracksByGenre(activeCategory);
    }

    return tracks;
  };

  const filteredTracks = getFilteredTracks();

  // Safe pause helper - waits for any pending play to complete
  const safePause = async () => {
    if (!audioRef.current) return;

    // If there's a pending play promise, wait for it
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // Play was aborted, which is fine
      }
      playPromiseRef.current = null;
    }

    audioRef.current.pause();
  };

  // Audio controls
  const playTrack = async (track: PremiumTrack) => {
    // Prevent rapid toggling during transitions
    if (isTransitioningRef.current) {
      console.log('Audio transition in progress, ignoring click');
      return;
    }

    isTransitioningRef.current = true;

    // Safely stop any current playback
    await safePause();

    const audio = new Audio(track.audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    // Set up event handlers before playing
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setShowWaveform(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };

    audio.onerror = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      isTransitioningRef.current = false;
    };

    try {
      playPromiseRef.current = audio.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;

      setCurrentTrack(track);
      setIsPlaying(true);
      setShowWaveform(true);

      // Progress tracking
      progressInterval.current = setInterval(() => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 100);
    } catch (err: any) {
      playPromiseRef.current = null;
      // AbortError is expected when play is interrupted
      if (err?.name !== 'AbortError') {
        console.error('Audio playback failed:', err);
      }
    }

    isTransitioningRef.current = false;
  };

  const pauseTrack = async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    await safePause();
    setIsPlaying(false);

    isTransitioningRef.current = false;
  };

  const resumeTrack = async () => {
    if (!audioRef.current || isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    try {
      playPromiseRef.current = audioRef.current.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;
      setIsPlaying(true);
    } catch (err: any) {
      playPromiseRef.current = null;
      if (err?.name !== 'AbortError') {
        console.error('Resume failed:', err);
      }
    }

    isTransitioningRef.current = false;
  };

  const stopTrack = async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    await safePause();

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setShowWaveform(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    isTransitioningRef.current = false;
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const selectTrack = (track: PremiumTrack) => {
    if (onSelectTrack) {
      onSelectTrack(track);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      // Synchronous cleanup - just pause directly since we're unmounting
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {}); // Ignore any pending errors
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlays = (plays: number): string => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`;
    return plays.toString();
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-3xl overflow-hidden ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-3xl">🎵</span>
              Premium Music Library
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {PREMIUM_TRACKS.length}+ Royalty-Free Tracks from Pixabay & Mixkit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
              100% FREE
            </span>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">
              Commercial Use OK
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by name, genre, mood, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Tracks
          </button>
          <button
            onClick={() => setActiveCategory('featured')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'featured'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>⭐</span> Featured
          </button>
          <button
            onClick={() => setActiveCategory('trending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'trending'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>🔥</span> Trending
          </button>
          {MUSIC_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{category.icon}</span> {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4">
            {/* Animated Waveform */}
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center relative overflow-hidden">
              {isPlaying && showWaveform && (
                <div className="absolute inset-0 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: `${20 + Math.random() * 30}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.5s'
                      }}
                    />
                  ))}
                </div>
              )}
              {!isPlaying && <span className="text-2xl">🎵</span>}
            </div>

            {/* Track Info */}
            <div className="flex-1">
              <h4 className="font-bold text-white">{currentTrack.name}</h4>
              <p className="text-sm text-gray-400">{currentTrack.genre} • {currentTrack.mood} • {currentTrack.bpm} BPM</p>

              {/* Progress Bar */}
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={stopTrack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </button>
              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track Grid */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
              currentTrack?.id === track.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-500/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Play Button / Waveform Preview */}
              <button
                onClick={() => currentTrack?.id === track.id && isPlaying ? pauseTrack() : playTrack(track)}
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  currentTrack?.id === track.id && isPlaying
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500'
                    : `bg-gradient-to-r ${MUSIC_CATEGORIES.find(c => c.id === track.genre)?.color || 'from-gray-500 to-gray-600'}`
                } group-hover:scale-105 group-hover:shadow-lg`}
                style={{ boxShadow: currentTrack?.id === track.id ? `0 8px 20px ${track.waveformColor}40` : undefined }}
              >
                {currentTrack?.id === track.id && isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full animate-pulse"
                        style={{
                          height: `${12 + Math.random() * 16}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white truncate">{track.name}</h4>
                  {track.featured && <span className="text-amber-400 text-xs">⭐</span>}
                  {track.trending && <span className="text-pink-400 text-xs">🔥</span>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span className="px-2 py-0.5 bg-white/10 rounded-full capitalize">{track.genre}</span>
                  <span>{track.bpm} BPM</span>
                  <span>{formatDuration(track.duration)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    {formatPlays(track.plays || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {formatPlays(track.likes || 0)}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="capitalize">{track.source}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectTrack(track);
                  }}
                  className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                  title="Use this track"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <a
                  href={track.audioUrl}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                  title="Download track"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-3">
              {track.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/5 text-gray-500 text-xs rounded-full hover:bg-white/10 hover:text-gray-300 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
          <p className="text-gray-400">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>{filteredTracks.length} tracks</span>
            <span>•</span>
            <span>{MUSIC_CATEGORIES.length} genres</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://pixabay.com/favicon.ico" alt="Pixabay" className="w-4 h-4 opacity-50" />
            <span>Powered by Pixabay & Mixkit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumMusicLibrary;
