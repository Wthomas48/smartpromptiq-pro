/**
 * SmartAudioSelector - Intelligent Audio Feature Selection for BuilderIQ
 *
 * This component provides smart music and voice selection based on app type.
 * SmartPromptiq AI automatically recommends the best audio for each app!
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FIXED_PREMIUM_TRACKS as PREMIUM_TRACKS,
  MUSIC_CATEGORIES,
  getTracksByGenre,
  type PremiumTrack
} from '../config/premiumMusic';
import { ELEVENLABS_VOICES, OPENAI_VOICES, ELEVENLABS_VOICE_IDS, VOICE_CATEGORIES, type VoicePersona } from '../config/voices';

// App type to voice category mapping (matches VOICE_CATEGORIES in voices.ts)
const APP_TYPE_TO_VOICE_CATEGORY: Record<string, keyof typeof VOICE_CATEGORIES> = {
  'business': 'business',
  'saas': 'tech',
  'startup': 'tech',
  'ecommerce': 'marketing',
  'marketplace': 'marketing',
  'education': 'education',
  'course': 'academy',
  'tutorial': 'education',
  'health': 'wellness',
  'fitness': 'entertainment',
  'meditation': 'meditation',
  'wellness': 'wellness',
  'entertainment': 'entertainment',
  'gaming': 'gaming',
  'podcast': 'podcast',
  'video': 'entertainment',
  'social': 'general',
  'community': 'general',
  'finance': 'business',
  'legal': 'corporate',
  'travel': 'entertainment',
  'food': 'general',
  'lifestyle': 'general',
  'default': 'general',
};

// App type to audio recommendations mapping
const APP_AUDIO_RECOMMENDATIONS: Record<string, {
  genres: string[];
  moods: string[];
  voiceCategory: keyof typeof VOICE_CATEGORIES;
  description: string;
}> = {
  // Business & Professional Apps
  'business': {
    genres: ['corporate', 'inspirational'],
    moods: ['professional', 'confident', 'motivational'],
    voiceCategory: 'business',
    description: 'Professional background music with confident voice narration'
  },
  'saas': {
    genres: ['corporate', 'electronic'],
    moods: ['innovative', 'modern', 'professional'],
    voiceCategory: 'tech',
    description: 'Modern tech vibes with clear, friendly voice guidance'
  },
  'startup': {
    genres: ['upbeat', 'inspirational', 'electronic'],
    moods: ['energetic', 'uplifting', 'innovative'],
    voiceCategory: 'tech',
    description: 'Energetic music that inspires action and innovation'
  },

  // E-commerce & Shopping
  'ecommerce': {
    genres: ['upbeat', 'lofi'],
    moods: ['happy', 'relaxed', 'positive'],
    voiceCategory: 'marketing',
    description: 'Pleasant shopping experience with warm, inviting voice'
  },
  'marketplace': {
    genres: ['upbeat', 'corporate'],
    moods: ['energetic', 'professional'],
    voiceCategory: 'marketing',
    description: 'Dynamic marketplace feel with professional guidance'
  },

  // Education & Learning
  'education': {
    genres: ['calm', 'lofi', 'acoustic'],
    moods: ['peaceful', 'focused', 'serene'],
    voiceCategory: 'education',
    description: 'Calm focus music with clear, patient voice instruction'
  },
  'course': {
    genres: ['lofi', 'ambient', 'calm'],
    moods: ['focused', 'peaceful', 'cozy'],
    voiceCategory: 'academy',
    description: 'Study-friendly background with knowledgeable narration'
  },
  'tutorial': {
    genres: ['lofi', 'electronic'],
    moods: ['focused', 'modern'],
    voiceCategory: 'education',
    description: 'Focus-enhancing music with clear step-by-step guidance'
  },

  // Health & Wellness
  'health': {
    genres: ['calm', 'ambient'],
    moods: ['peaceful', 'healing', 'serene'],
    voiceCategory: 'wellness',
    description: 'Soothing sounds with calming, reassuring voice'
  },
  'fitness': {
    genres: ['upbeat', 'electronic', 'hiphop'],
    moods: ['energetic', 'driving', 'intense'],
    voiceCategory: 'entertainment',
    description: 'High-energy beats with motivational coaching voice'
  },
  'meditation': {
    genres: ['ambient', 'calm'],
    moods: ['peaceful', 'healing', 'zen'],
    voiceCategory: 'meditation',
    description: 'Peaceful ambient sounds with gentle, soothing guidance'
  },
  'wellness': {
    genres: ['calm', 'acoustic', 'ambient'],
    moods: ['peaceful', 'healing', 'nature'],
    voiceCategory: 'wellness',
    description: 'Nature-inspired sounds with warm, empathetic voice'
  },

  // Entertainment & Media
  'entertainment': {
    genres: ['upbeat', 'electronic', 'cinematic'],
    moods: ['energetic', 'fun', 'exciting'],
    voiceCategory: 'entertainment',
    description: 'Exciting entertainment vibes with dynamic narration'
  },
  'gaming': {
    genres: ['electronic', 'cinematic', 'hiphop'],
    moods: ['intense', 'epic', 'futuristic'],
    voiceCategory: 'gaming',
    description: 'Epic gaming soundtrack with dramatic voice effects'
  },
  'podcast': {
    genres: ['lofi', 'jazz', 'podcast'],
    moods: ['cozy', 'smooth', 'relaxed'],
    voiceCategory: 'podcast',
    description: 'Cozy podcast vibes with warm, conversational tone'
  },
  'video': {
    genres: ['cinematic', 'upbeat', 'inspirational'],
    moods: ['epic', 'emotional', 'dramatic'],
    voiceCategory: 'documentary',
    description: 'Cinematic music with professional narration'
  },

  // Social & Community
  'social': {
    genres: ['upbeat', 'electronic', 'lofi'],
    moods: ['fun', 'trendy', 'energetic'],
    voiceCategory: 'general',
    description: 'Trendy vibes with casual, friendly voice'
  },
  'community': {
    genres: ['acoustic', 'inspirational'],
    moods: ['warm', 'uplifting', 'positive'],
    voiceCategory: 'general',
    description: 'Warm community feel with inclusive, friendly voice'
  },

  // Finance & Legal
  'finance': {
    genres: ['corporate', 'calm'],
    moods: ['professional', 'trustworthy', 'confident'],
    voiceCategory: 'business',
    description: 'Trustworthy professional music with confident voice'
  },
  'legal': {
    genres: ['corporate', 'calm'],
    moods: ['professional', 'serious', 'trustworthy'],
    voiceCategory: 'corporate',
    description: 'Serious professional tone with clear, authoritative voice'
  },

  // Travel & Lifestyle
  'travel': {
    genres: ['upbeat', 'acoustic', 'inspirational'],
    moods: ['adventurous', 'happy', 'summer'],
    voiceCategory: 'entertainment',
    description: 'Adventure-inspiring music with enthusiastic narration'
  },
  'food': {
    genres: ['jazz', 'acoustic', 'lofi'],
    moods: ['cozy', 'warm', 'relaxed'],
    voiceCategory: 'general',
    description: 'Cozy cafe vibes with warm, inviting voice'
  },
  'lifestyle': {
    genres: ['lofi', 'acoustic', 'upbeat'],
    moods: ['positive', 'relaxed', 'happy'],
    voiceCategory: 'general',
    description: 'Positive lifestyle vibes with relatable voice'
  },

  // Default
  'default': {
    genres: ['corporate', 'upbeat'],
    moods: ['professional', 'positive'],
    voiceCategory: 'general',
    description: 'Versatile background with professional voice'
  }
};

interface AudioSelection {
  backgroundMusic: PremiumTrack | null;
  voiceNarration: {
    provider: 'elevenlabs' | 'openai';
    voiceId: string;          // Internal key like 'rachel', 'adam'
    voiceName: string;        // Display name like 'Rachel', 'Adam'
    elevenLabsId?: string;    // Actual ElevenLabs voice ID for API calls
    persona?: string;         // Voice persona description
    style?: string;           // Voice style
  } | null;
  autoPlay: boolean;
  musicVolume: number;
  voiceVolume: number;
  fadeInDuration: number;
  duckingEnabled: boolean; // Lower music when voice plays
}

interface SmartAudioSelectorProps {
  appType: string;
  appName?: string;
  onSelectionChange: (selection: AudioSelection) => void;
  showPreview?: boolean;
  compact?: boolean;
}

export const SmartAudioSelector: React.FC<SmartAudioSelectorProps> = ({
  appType,
  appName = 'Your App',
  onSelectionChange,
  showPreview = true,
  compact = false
}) => {
  const [selection, setSelection] = useState<AudioSelection>({
    backgroundMusic: null,
    voiceNarration: null,
    autoPlay: false,
    musicVolume: 0.3,
    voiceVolume: 0.8,
    fadeInDuration: 2,
    duckingEnabled: true
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    music: PremiumTrack[];
    voices: typeof ELEVENLABS_VOICES;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get recommendations based on app type
  const getRecommendations = () => {
    const config = APP_AUDIO_RECOMMENDATIONS[appType.toLowerCase()] || APP_AUDIO_RECOMMENDATIONS['default'];

    // Get recommended music tracks
    const recommendedTracks: PremiumTrack[] = [];
    config.genres.forEach(genre => {
      const genreTracks = getTracksByGenre(genre);
      recommendedTracks.push(...genreTracks.slice(0, 3));
    });

    // Get recommended voices using VOICE_CATEGORIES mapping
    const voiceCategory = config.voiceCategory || 'general';
    const voiceIdsForCategory = VOICE_CATEGORIES[voiceCategory] || VOICE_CATEGORIES.general;

    // Get ElevenLabs voices that match the category
    const recommendedVoices = voiceIdsForCategory
      .map(voiceId => ELEVENLABS_VOICES.find(v => v.id === voiceId))
      .filter((v): v is VoicePersona => v !== undefined);

    return {
      music: recommendedTracks.slice(0, 6),
      voices: recommendedVoices.length > 0 ? recommendedVoices : ELEVENLABS_VOICES.slice(0, 6),
      config
    };
  };

  // Auto-select best options on load
  useEffect(() => {
    const { music, voices, config } = getRecommendations();
    setAiRecommendation({ music, voices });

    // Auto-select first recommended options
    if (music.length > 0 && !selection.backgroundMusic) {
      const selectedVoice = voices.length > 0 ? voices[0] : null;
      const elevenLabsId = selectedVoice ? ELEVENLABS_VOICE_IDS[selectedVoice.id as keyof typeof ELEVENLABS_VOICE_IDS] : undefined;

      const newSelection = {
        ...selection,
        backgroundMusic: music[0],
        voiceNarration: selectedVoice ? {
          provider: 'elevenlabs' as const,
          voiceId: selectedVoice.id,
          voiceName: selectedVoice.name,
          elevenLabsId: elevenLabsId,
          persona: selectedVoice.persona,
          style: selectedVoice.style
        } : null
      };
      setSelection(newSelection);
      onSelectionChange(newSelection);
    }
  }, [appType]);

  const handleMusicSelect = (track: PremiumTrack) => {
    const newSelection = { ...selection, backgroundMusic: track };
    setSelection(newSelection);
    onSelectionChange(newSelection);
    setShowMusicPicker(false);
  };

  const handleVoiceSelect = (voice: VoicePersona, provider: 'elevenlabs' | 'openai') => {
    // Get the actual ElevenLabs voice ID for API calls
    const elevenLabsId = provider === 'elevenlabs'
      ? ELEVENLABS_VOICE_IDS[voice.id as keyof typeof ELEVENLABS_VOICE_IDS]
      : undefined;

    const newSelection = {
      ...selection,
      voiceNarration: {
        provider,
        voiceId: voice.id,
        voiceName: voice.name,
        elevenLabsId: elevenLabsId,
        persona: voice.persona,
        style: voice.style
      }
    };
    setSelection(newSelection);
    onSelectionChange(newSelection);
    setShowVoicePicker(false);
  };

  const previewMusic = () => {
    if (!selection.backgroundMusic) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(selection.backgroundMusic.audioUrl);
    audio.volume = selection.musicVolume;
    audioRef.current = audio;

    audio.play().then(() => {
      setIsPlaying(true);
    });

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const config = APP_AUDIO_RECOMMENDATIONS[appType.toLowerCase()] || APP_AUDIO_RECOMMENDATIONS['default'];

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-lg">🎵</span>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Smart Audio</h4>
              <p className="text-xs text-gray-400">
                {selection.backgroundMusic ? selection.backgroundMusic.name : 'No music selected'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMusicPicker(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎧</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Smart Audio Selection</h3>
            <p className="text-sm text-gray-400">AI-powered audio for "{appName}"</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI Powered
          </span>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 rounded-xl border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-1">SmartPromptiq AI Recommendation</h4>
            <p className="text-xs text-gray-400">{config.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.genres.slice(0, 3).map(genre => (
                <span key={genre} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full capitalize">
                  {genre}
                </span>
              ))}
              {config.voiceStyles.slice(0, 2).map(style => (
                <span key={style} className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full capitalize">
                  {style} voice
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Music Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <span>🎵</span> Background Music
          </h4>
          <button
            onClick={() => setShowMusicPicker(!showMusicPicker)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showMusicPicker ? 'Hide Options' : 'Browse All'}
          </button>
        </div>

        {/* Selected Music */}
        {selection.backgroundMusic ? (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={isPlaying ? stopPreview : previewMusic}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                    : 'bg-gradient-to-r from-cyan-500 to-violet-500'
                }`}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <h5 className="font-semibold text-white">{selection.backgroundMusic.name}</h5>
                <p className="text-xs text-gray-400">
                  {selection.backgroundMusic.genre} • {selection.backgroundMusic.bpm} BPM • {Math.floor(selection.backgroundMusic.duration / 60)}:{(selection.backgroundMusic.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Selected
              </span>
            </div>

            {/* Volume Control */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-gray-400">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selection.musicVolume}
                onChange={(e) => {
                  const newSelection = { ...selection, musicVolume: parseFloat(e.target.value) };
                  setSelection(newSelection);
                  onSelectionChange(newSelection);
                  if (audioRef.current) {
                    audioRef.current.volume = newSelection.musicVolume;
                  }
                }}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-xs text-white w-8">{Math.round(selection.musicVolume * 100)}%</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white/5 rounded-xl border border-dashed border-white/20 text-center">
            <span className="text-3xl mb-2 block">🎵</span>
            <p className="text-gray-400 text-sm">No music selected</p>
            <button
              onClick={() => setShowMusicPicker(true)}
              className="mt-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
            >
              Choose Music
            </button>
          </div>
        )}

        {/* Music Picker */}
        {showMusicPicker && aiRecommendation && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {aiRecommendation.music.map((track) => (
              <button
                key={track.id}
                onClick={() => handleMusicSelect(track)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selection.backgroundMusic?.id === track.id
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 bg-gradient-to-r from-violet-500 to-pink-500 rounded flex items-center justify-center text-xs">
                    🎵
                  </span>
                  <span className="font-medium text-white text-sm truncate">{track.name}</span>
                </div>
                <p className="text-xs text-gray-400 capitalize">{track.genre} • {track.mood}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Voice Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <span>🎙️</span> Voice Narration
          </h4>
          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            {showVoicePicker ? 'Hide Options' : 'Browse All'}
          </button>
        </div>

        {/* Selected Voice */}
        {selection.voiceNarration ? (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎙️</span>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-white">{selection.voiceNarration.voiceName}</h5>
                <p className="text-xs text-gray-400">
                  {selection.voiceNarration.provider === 'elevenlabs' ? 'ElevenLabs Premium' : 'OpenAI'} Voice
                </p>
              </div>
              <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                Selected
              </span>
            </div>

            {/* Voice Volume Control */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-gray-400">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selection.voiceVolume}
                onChange={(e) => {
                  const newSelection = { ...selection, voiceVolume: parseFloat(e.target.value) };
                  setSelection(newSelection);
                  onSelectionChange(newSelection);
                }}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-xs text-white w-8">{Math.round(selection.voiceVolume * 100)}%</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white/5 rounded-xl border border-dashed border-white/20 text-center">
            <span className="text-3xl mb-2 block">🎙️</span>
            <p className="text-gray-400 text-sm">No voice selected</p>
            <button
              onClick={() => setShowVoicePicker(true)}
              className="mt-2 px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm hover:bg-violet-500/30 transition-colors"
            >
              Choose Voice
            </button>
          </div>
        )}

        {/* Voice Picker */}
        {showVoicePicker && aiRecommendation && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {aiRecommendation.voices.slice(0, 6).map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceSelect(voice, 'elevenlabs')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selection.voiceNarration?.voiceId === voice.id
                    ? 'bg-violet-500/20 border-violet-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{voice.emoji}</span>
                  <span className="font-medium text-white text-sm">{voice.name}</span>
                </div>
                <p className="text-xs text-gray-400">{voice.tagline}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audio Settings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <span>⚙️</span> Audio Settings
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Auto Play Toggle */}
          <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
            <div>
              <span className="text-white text-sm font-medium">Auto-Play Music</span>
              <p className="text-xs text-gray-400">Start music when app loads</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${selection.autoPlay ? 'bg-cyan-500' : 'bg-gray-600'}`}>
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${selection.autoPlay ? 'translate-x-6' : ''}`}
                onClick={() => {
                  const newSelection = { ...selection, autoPlay: !selection.autoPlay };
                  setSelection(newSelection);
                  onSelectionChange(newSelection);
                }}
              />
            </div>
          </label>

          {/* Auto Ducking Toggle */}
          <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
            <div>
              <span className="text-white text-sm font-medium">Smart Ducking</span>
              <p className="text-xs text-gray-400">Lower music during voice</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${selection.duckingEnabled ? 'bg-violet-500' : 'bg-gray-600'}`}>
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${selection.duckingEnabled ? 'translate-x-6' : ''}`}
                onClick={() => {
                  const newSelection = { ...selection, duckingEnabled: !selection.duckingEnabled };
                  setSelection(newSelection);
                  onSelectionChange(newSelection);
                }}
              />
            </div>
          </label>
        </div>

        {/* Fade Duration */}
        <div className="p-3 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">Music Fade-In Duration</span>
            <span className="text-cyan-400 text-sm">{selection.fadeInDuration}s</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={selection.fadeInDuration}
            onChange={(e) => {
              const newSelection = { ...selection, fadeInDuration: parseFloat(e.target.value) };
              setSelection(newSelection);
              onSelectionChange(newSelection);
            }}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✅</span>
          <span className="font-semibold text-white">Audio Configuration Complete</span>
        </div>
        <p className="text-xs text-gray-400">
          Your app will have {selection.backgroundMusic ? `"${selection.backgroundMusic.name}"` : 'no'} background music
          {selection.voiceNarration ? ` with ${selection.voiceNarration.voiceName} voice narration` : ''}.
          {selection.autoPlay ? ' Music will auto-play on load.' : ''}
          {selection.duckingEnabled ? ' Smart ducking enabled.' : ''}
        </p>
      </div>
    </div>
  );
};

export default SmartAudioSelector;
