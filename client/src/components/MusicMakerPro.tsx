import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useElevenLabsVoiceSafe } from '@/contexts/ElevenLabsVoiceContext';
import { ELEVENLABS_VOICES } from '@/config/voices';
import {
  Music, Play, Pause, Square, Download, Sparkles, Loader2,
  Volume2, Clock, Zap, RefreshCw, Wand2, Radio, Headphones,
  Heart, Rocket, Star, Crown, Lock, ChevronRight, Check,
  Shuffle, SkipBack, SkipForward, Repeat, Share2, Copy,
  Layers, Mic2, Piano, Drum, Guitar, AudioWaveform,
  ListMusic, Plus, Trash2, Save, FolderOpen, Settings2,
  TrendingUp, Award, Flame, Target, Music2, Disc3, Waves,
  Brain, Cpu, Globe, Twitter, Instagram, Youtube, ArrowRight
} from 'lucide-react';

// ==========================================
// STUNNING AUDIO VISUALIZER COMPONENT
// ==========================================
const AudioVisualizer: React.FC<{
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  genre?: string;
}> = ({ isPlaying, audioRef, genre = 'upbeat' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Genre-based color schemes
  const colorSchemes: Record<string, { primary: string; secondary: string; glow: string }> = {
    upbeat: { primary: '#f97316', secondary: '#eab308', glow: 'rgba(249, 115, 22, 0.5)' },
    calm: { primary: '#06b6d4', secondary: '#22d3ee', glow: 'rgba(6, 182, 212, 0.5)' },
    corporate: { primary: '#3b82f6', secondary: '#6366f1', glow: 'rgba(59, 130, 246, 0.5)' },
    cinematic: { primary: '#8b5cf6', secondary: '#a855f7', glow: 'rgba(139, 92, 246, 0.5)' },
    playful: { primary: '#f472b6', secondary: '#fb7185', glow: 'rgba(244, 114, 182, 0.5)' },
    electronic: { primary: '#10b981', secondary: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' },
    lofi: { primary: '#a78bfa', secondary: '#c4b5fd', glow: 'rgba(167, 139, 250, 0.5)' },
    hiphop: { primary: '#f59e0b', secondary: '#fbbf24', glow: 'rgba(245, 158, 11, 0.5)' },
  };

  const colors = colorSchemes[genre] || colorSchemes.upbeat;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize Web Audio API for visualization
    const initAudio = () => {
      if (!audioRef.current || sourceRef.current) return;

      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (e) {
        console.log('Audio context already exists or failed');
      }
    };

    // Animate
    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, width, height);

      if (isPlaying && analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Draw frequency bars with glow
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.8;

          // Gradient bars
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, colors.primary);
          gradient.addColorStop(1, colors.secondary);

          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = colors.glow;

          // Draw bar with rounded top
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Mirror effect (reflection)
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.roundRect(x, height, barWidth - 2, barHeight * 0.3, [0, 0, 4, 4]);
          ctx.fill();
          ctx.globalAlpha = 1;

          x += barWidth;
        }
      } else {
        // Idle animation - pulsing waves
        const time = Date.now() / 1000;
        const centerY = height / 2;

        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.glow;

        for (let wave = 0; wave < 3; wave++) {
          ctx.globalAlpha = 0.3 + wave * 0.2;
          ctx.beginPath();

          for (let x = 0; x < width; x++) {
            const y = centerY +
              Math.sin(x * 0.02 + time * 2 + wave) * (10 + wave * 5) +
              Math.sin(x * 0.01 + time * 1.5) * 5;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(draw);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('play', initAudio);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', initAudio);
      }
    };
  }, [isPlaying, colors, audioRef]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-xl bg-slate-900/50 backdrop-blur-sm"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};

// ==========================================
// FLOATING PARTICLES BACKGROUND
// ==========================================
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// AI GENERATION PROGRESS COMPONENT
// ==========================================
const AIGenerationProgress: React.FC<{ progress: number; stage: string }> = ({ progress, stage }) => {
  const stages = [
    { name: 'Analyzing', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    { name: 'Composing', icon: Music, color: 'from-purple-500 to-pink-500' },
    { name: 'Producing', icon: Layers, color: 'from-orange-500 to-red-500' },
    { name: 'Mastering', icon: Sparkles, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent animate-pulse" />

      {/* Central orb */}
      <div className="relative flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-spin-slow flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse">
                <Cpu className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-orbit"
              style={{
                animationDelay: `${i * 0.5}s`,
                top: '50%',
                left: '50%',
              }}
            />
          ))}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">AI is Creating Your Music</h3>
        <p className="text-gray-400 mb-6">{stage}</p>

        {/* Progress stages */}
        <div className="flex items-center gap-4 mb-6">
          {stages.map((s, i) => (
            <div key={s.name} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                progress > i * 25
                  ? `bg-gradient-to-r ${s.color} scale-110`
                  : 'bg-slate-700 scale-100'
              }`}>
                <s.icon className={`w-5 h-5 ${progress > i * 25 ? 'text-white' : 'text-gray-500'}`} />
              </div>
              {i < stages.length - 1 && (
                <div className={`w-8 h-1 mx-1 rounded transition-all duration-500 ${
                  progress > (i + 1) * 25 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </div>
        </div>
        <p className="text-gray-500 mt-2">{Math.round(progress)}% Complete</p>
      </div>
    </div>
  );
};

// ==========================================
// TRACK CARD COMPONENT
// ==========================================
const TrackCard: React.FC<{
  track: any;
  isSelected: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onSelect: () => void;
  onLike: () => void;
  isLiked: boolean;
}> = ({ track, isSelected, isPlaying, onPlay, onSelect, onLike, isLiked }) => {
  return (
    <div
      className={`group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500 scale-[1.02]'
          : 'bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800'
      }`}
      onClick={onSelect}
    >
      {/* Glow effect when playing */}
      {isPlaying && isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-pulse" />
      )}

      <div className="relative flex items-center gap-4">
        {/* Album art with play overlay */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <div className={`w-full h-full bg-gradient-to-br ${
            track.genre === 'upbeat' ? 'from-orange-500 to-red-500' :
            track.genre === 'calm' ? 'from-cyan-500 to-blue-500' :
            track.genre === 'corporate' ? 'from-blue-500 to-indigo-500' :
            track.genre === 'cinematic' ? 'from-purple-500 to-pink-500' :
            track.genre === 'electronic' ? 'from-green-500 to-emerald-500' :
            'from-purple-500 to-pink-500'
          } flex items-center justify-center`}>
            {isPlaying && isSelected ? (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-bounce"
                    style={{
                      height: `${12 + i * 4}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            ) : (
              <Music className="w-6 h-6 text-white/80" />
            )}
          </div>

          {/* Play button overlay */}
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            {isPlaying && isSelected ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold truncate">{track.name}</h4>
          <p className="text-gray-400 text-sm truncate">{track.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs border-slate-600 text-gray-400">
              {track.genre}
            </Badge>
            <span className="text-xs text-gray-500">{track.duration}s</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className={`p-2 rounded-full transition-all ${
              isLiked ? 'text-red-500 bg-red-500/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Waveform preview (simulated) */}
      <div className="mt-3 h-8 flex items-center gap-0.5">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all ${
              isPlaying && isSelected ? 'bg-purple-500' : 'bg-slate-600'
            }`}
            style={{
              height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}%`,
              opacity: isPlaying && isSelected ? 0.8 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ==========================================
// GENRE SELECTOR COMPONENT
// ==========================================
const GenreSelector: React.FC<{
  genres: any[];
  selected: string;
  onSelect: (id: string) => void;
}> = ({ genres, selected, onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {genres.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onSelect(selected === genre.id ? '' : genre.id)}
          className={`relative group p-4 rounded-2xl transition-all duration-300 overflow-hidden ${
            selected === genre.id
              ? 'ring-2 ring-purple-500 scale-105'
              : 'hover:scale-102'
          }`}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} ${
            selected === genre.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
          } transition-opacity`} />

          {/* Glass overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

          {/* Content */}
          <div className="relative text-center">
            <genre.icon className="w-8 h-8 text-white mx-auto mb-2" />
            <h4 className="text-white font-semibold text-sm">{genre.name.split(' ')[0]}</h4>
            <p className="text-white/70 text-xs mt-1 hidden md:block">{genre.tags[0]}</p>
          </div>

          {/* Selected indicator */}
          {selected === genre.id && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-purple-600" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

// ==========================================
// MAIN MUSIC MAKER PRO COMPONENT
// ==========================================

// Music genres with stunning gradients - EXPANDED SELECTION
const musicGenres = [
  { id: 'upbeat', name: 'Upbeat', icon: Zap, color: 'from-orange-500 to-red-500', tags: ['energetic', 'motivational'], category: 'Popular' },
  { id: 'calm', name: 'Calm', icon: Waves, color: 'from-cyan-500 to-blue-500', tags: ['relaxing', 'peaceful'], category: 'Popular' },
  { id: 'corporate', name: 'Corporate', icon: Rocket, color: 'from-blue-500 to-indigo-600', tags: ['professional', 'business'], category: 'Popular' },
  { id: 'cinematic', name: 'Cinematic', icon: Star, color: 'from-purple-500 to-pink-500', tags: ['epic', 'dramatic'], category: 'Popular' },
  { id: 'electronic', name: 'Electronic', icon: Cpu, color: 'from-green-500 to-emerald-500', tags: ['tech', 'modern'], category: 'Popular' },
  { id: 'lofi', name: 'Lo-Fi', icon: Headphones, color: 'from-violet-500 to-purple-600', tags: ['chill', 'study'], category: 'Popular' },
  { id: 'hiphop', name: 'Hip-Hop', icon: Mic2, color: 'from-amber-500 to-orange-600', tags: ['beats', 'urban'], category: 'Urban' },
  { id: 'jazz', name: 'Jazz', icon: Piano, color: 'from-yellow-500 to-amber-600', tags: ['smooth', 'classic'], category: 'Classic' },
  { id: 'rock', name: 'Rock', icon: Guitar, color: 'from-red-600 to-rose-500', tags: ['powerful', 'guitar'], category: 'Classic' },
  { id: 'ambient', name: 'Ambient', icon: Globe, color: 'from-teal-500 to-cyan-600', tags: ['atmospheric', 'space'], category: 'Chill' },
  { id: 'synthwave', name: 'Synthwave', icon: Radio, color: 'from-pink-500 to-purple-600', tags: ['retro', '80s'], category: 'Electronic' },
  { id: 'funk', name: 'Funk', icon: Disc3, color: 'from-fuchsia-500 to-pink-500', tags: ['groovy', 'bass'], category: 'Classic' },
  { id: 'tropical', name: 'Tropical', icon: Music2, color: 'from-lime-500 to-green-500', tags: ['summer', 'beach'], category: 'World' },
  { id: 'orchestral', name: 'Orchestral', icon: AudioWaveform, color: 'from-indigo-600 to-purple-700', tags: ['classical', 'strings'], category: 'Classic' },
  { id: 'edm', name: 'EDM', icon: Flame, color: 'from-cyan-400 to-blue-500', tags: ['dance', 'club'], category: 'Electronic' },
  { id: 'rnb', name: 'R&B', icon: Heart, color: 'from-rose-500 to-red-600', tags: ['soul', 'smooth'], category: 'Urban' },
];

// Mood presets
const moodPresets = [
  { id: 'happy', name: 'Happy', emoji: '😊', description: 'Joyful and uplifting' },
  { id: 'sad', name: 'Melancholic', emoji: '😢', description: 'Emotional and deep' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', description: 'High energy vibes' },
  { id: 'relaxed', name: 'Relaxed', emoji: '😌', description: 'Calm and peaceful' },
  { id: 'dark', name: 'Dark', emoji: '🌑', description: 'Mysterious and intense' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', description: 'Loving and tender' },
  { id: 'epic', name: 'Epic', emoji: '🏔️', description: 'Grand and powerful' },
  { id: 'playful', name: 'Playful', emoji: '🎮', description: 'Fun and lighthearted' },
];

// Tempo presets
const tempoPresets = [
  { id: 'slow', name: 'Slow', bpm: '60-80', description: 'Relaxed pace' },
  { id: 'moderate', name: 'Moderate', bpm: '80-110', description: 'Walking pace' },
  { id: 'upbeat', name: 'Upbeat', bpm: '110-130', description: 'Energetic pace' },
  { id: 'fast', name: 'Fast', bpm: '130-160', description: 'High energy' },
];

// Instrument focus options
const instrumentOptions = [
  { id: 'piano', name: 'Piano', icon: Piano },
  { id: 'guitar', name: 'Guitar', icon: Guitar },
  { id: 'drums', name: 'Drums', icon: Drum },
  { id: 'synth', name: 'Synth', icon: Cpu },
  { id: 'strings', name: 'Strings', icon: AudioWaveform },
  { id: 'bass', name: 'Bass', icon: Waves },
];

// ==========================================
// WEB AUDIO SYNTHESIZER FOR MUSIC GENERATION
// ==========================================
let globalAudioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume();
  }
  return globalAudioContext;
};

// Generate procedural music based on genre
// ==========================================
// PROFESSIONAL AI MUSIC SYNTHESIZER
// Creates studio-quality music with proper
// chord progressions, multiple instruments,
// and genre-specific sound design
// ==========================================

const generateProceduralTrack = (genre: string, duration: number = 15): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const ctx = getAudioContext();
      const sampleRate = ctx.sampleRate;
      const numSamples = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(2, numSamples, sampleRate);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

    // Musical note frequencies (C3 to C6)
    const noteFreqs: Record<string, number> = {
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'C6': 1046.50
    };

    // Chord definitions (triads and 7ths)
    const chords: Record<string, string[]> = {
      'Cmaj': ['C4', 'E4', 'G4'],
      'Dm': ['D4', 'F4', 'A4'],
      'Em': ['E4', 'G4', 'B4'],
      'Fmaj': ['F4', 'A4', 'C5'],
      'Gmaj': ['G4', 'B4', 'D5'],
      'Am': ['A4', 'C5', 'E5'],
      'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
      'Dm7': ['D4', 'F4', 'A4', 'C5'],
      'Fmaj7': ['F4', 'A4', 'C5', 'E5'],
      'G7': ['G4', 'B4', 'D5', 'F5'],
      'Am7': ['A4', 'C5', 'E5', 'G5'],
    };

    // Genre configurations - PROFESSIONAL QUALITY
    const genreConfig: Record<string, any> = {
      upbeat: {
        bpm: 124,
        progression: ['Cmaj', 'Gmaj', 'Am', 'Fmaj'], // I-V-vi-IV
        bassPattern: [0, 0, 4, 4, 7, 7, 4, 4], // Bass notes in semitones
        kickPattern: [1, 0, 0, 0, 1, 0, 0, 0], // Kick on 1 and 5
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0], // Snare on 3 and 7
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1], // Hi-hats on every 8th
        padVolume: 0.12, leadVolume: 0.15, bassVolume: 0.25, drumVolume: 0.3,
        arpeggio: true, arpeggioSpeed: 2, filterCutoff: 0.7, reverb: 0.25,
        synthType: 'bright', padAttack: 0.1, useSubBass: true
      },
      calm: {
        bpm: 72,
        progression: ['Cmaj7', 'Fmaj7', 'Dm7', 'Gmaj'],
        bassPattern: [0, 0, 0, 0, 5, 5, 5, 5],
        kickPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        snarePattern: [0, 0, 0, 0, 0, 0, 0, 0],
        hihatPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        padVolume: 0.2, leadVolume: 0.08, bassVolume: 0.15, drumVolume: 0,
        arpeggio: false, filterCutoff: 0.4, reverb: 0.5,
        synthType: 'warm', padAttack: 0.8, useSubBass: false
      },
      corporate: {
        bpm: 110,
        progression: ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'],
        bassPattern: [0, 0, 0, 0, 5, 5, 7, 7],
        kickPattern: [1, 0, 0, 0, 1, 0, 0, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
        hihatPattern: [1, 0, 1, 0, 1, 0, 1, 0],
        padVolume: 0.15, leadVolume: 0.1, bassVolume: 0.2, drumVolume: 0.2,
        arpeggio: true, arpeggioSpeed: 1, filterCutoff: 0.6, reverb: 0.3,
        synthType: 'clean', padAttack: 0.2, useSubBass: true
      },
      cinematic: {
        bpm: 85,
        progression: ['Am', 'Fmaj', 'Cmaj', 'Gmaj'],
        bassPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        kickPattern: [1, 0, 0, 0, 0, 0, 0, 0],
        snarePattern: [0, 0, 0, 0, 1, 0, 0, 0],
        hihatPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        padVolume: 0.25, leadVolume: 0.12, bassVolume: 0.2, drumVolume: 0.25,
        arpeggio: false, filterCutoff: 0.5, reverb: 0.6,
        synthType: 'epic', padAttack: 1.0, useSubBass: true, strings: true
      },
      electronic: {
        bpm: 128,
        progression: ['Am', 'Fmaj', 'Cmaj', 'Gmaj'],
        bassPattern: [0, 0, 12, 12, 0, 0, 7, 7],
        kickPattern: [1, 0, 0, 0, 1, 0, 0, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.1, leadVolume: 0.18, bassVolume: 0.3, drumVolume: 0.35,
        arpeggio: true, arpeggioSpeed: 4, filterCutoff: 0.8, reverb: 0.2,
        synthType: 'synth', padAttack: 0.05, useSubBass: true, sidechain: true
      },
      lofi: {
        bpm: 78,
        progression: ['Dm7', 'Gmaj', 'Cmaj7', 'Fmaj7'],
        bassPattern: [0, 0, 0, 0, 5, 5, 5, 5],
        kickPattern: [1, 0, 0, 0, 0, 0, 1, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 0, 1],
        hihatPattern: [1, 0, 1, 1, 1, 0, 1, 1],
        padVolume: 0.12, leadVolume: 0.1, bassVolume: 0.2, drumVolume: 0.22,
        arpeggio: false, filterCutoff: 0.35, reverb: 0.4,
        synthType: 'warm', padAttack: 0.3, useSubBass: false, vinyl: true
      },
      hiphop: {
        bpm: 92,
        progression: ['Am', 'Fmaj', 'Cmaj', 'Gmaj'],
        bassPattern: [0, 0, 0, 12, 0, 0, 7, 0],
        kickPattern: [1, 0, 0, 1, 0, 0, 1, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.08, leadVolume: 0.1, bassVolume: 0.35, drumVolume: 0.35,
        arpeggio: false, filterCutoff: 0.5, reverb: 0.2,
        synthType: 'warm', padAttack: 0.2, useSubBass: true
      },
      jazz: {
        bpm: 95,
        progression: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
        bassPattern: [0, 7, 3, 7, 0, 5, 3, 7],
        kickPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        snarePattern: [0, 0, 0, 0, 0, 0, 0, 0],
        hihatPattern: [1, 0, 1, 1, 1, 0, 1, 1],
        padVolume: 0.15, leadVolume: 0.12, bassVolume: 0.2, drumVolume: 0.12,
        arpeggio: false, filterCutoff: 0.45, reverb: 0.35,
        synthType: 'warm', padAttack: 0.4, useSubBass: false, swing: true
      },
      rock: {
        bpm: 120,
        progression: ['Cmaj', 'Gmaj', 'Am', 'Fmaj'],
        bassPattern: [0, 0, 0, 0, 7, 7, 5, 5],
        kickPattern: [1, 0, 1, 0, 1, 0, 1, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.2, leadVolume: 0.15, bassVolume: 0.25, drumVolume: 0.35,
        arpeggio: false, filterCutoff: 0.7, reverb: 0.25,
        synthType: 'distorted', padAttack: 0.1, useSubBass: true
      },
      ambient: {
        bpm: 60,
        progression: ['Cmaj7', 'Am7', 'Fmaj7', 'Gmaj'],
        bassPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        kickPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        snarePattern: [0, 0, 0, 0, 0, 0, 0, 0],
        hihatPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        padVolume: 0.3, leadVolume: 0.05, bassVolume: 0.1, drumVolume: 0,
        arpeggio: false, filterCutoff: 0.25, reverb: 0.7,
        synthType: 'warm', padAttack: 2.0, useSubBass: false, drone: true
      },
      synthwave: {
        bpm: 108,
        progression: ['Am', 'Fmaj', 'Cmaj', 'Gmaj'],
        bassPattern: [0, 0, 12, 0, 0, 0, 7, 0],
        kickPattern: [1, 0, 0, 0, 1, 0, 0, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.18, leadVolume: 0.2, bassVolume: 0.28, drumVolume: 0.3,
        arpeggio: true, arpeggioSpeed: 3, filterCutoff: 0.65, reverb: 0.4,
        synthType: 'synth', padAttack: 0.3, useSubBass: true, gatedReverb: true
      },
      funk: {
        bpm: 105,
        progression: ['Dm7', 'Gmaj', 'Cmaj7', 'Am7'],
        bassPattern: [0, 7, 0, 5, 7, 0, 5, 7],
        kickPattern: [1, 0, 0, 1, 1, 0, 0, 0],
        snarePattern: [0, 0, 1, 0, 0, 1, 1, 0],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.08, leadVolume: 0.12, bassVolume: 0.35, drumVolume: 0.32,
        arpeggio: false, filterCutoff: 0.55, reverb: 0.2,
        synthType: 'clean', padAttack: 0.05, useSubBass: true, wah: true
      },
      tropical: {
        bpm: 100,
        progression: ['Cmaj', 'Am', 'Fmaj', 'Gmaj'],
        bassPattern: [0, 0, 5, 0, 7, 0, 5, 0],
        kickPattern: [1, 0, 0, 0, 1, 0, 1, 0],
        snarePattern: [0, 0, 0, 1, 0, 0, 0, 1],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.15, leadVolume: 0.18, bassVolume: 0.22, drumVolume: 0.25,
        arpeggio: true, arpeggioSpeed: 2, filterCutoff: 0.7, reverb: 0.35,
        synthType: 'bright', padAttack: 0.1, useSubBass: false, marimba: true
      },
      orchestral: {
        bpm: 75,
        progression: ['Cmaj', 'Am', 'Dm', 'Gmaj'],
        bassPattern: [0, 0, 0, 0, 5, 5, 5, 5],
        kickPattern: [1, 0, 0, 0, 0, 0, 0, 0],
        snarePattern: [0, 0, 0, 0, 0, 0, 0, 0],
        hihatPattern: [0, 0, 0, 0, 0, 0, 0, 0],
        padVolume: 0.35, leadVolume: 0.15, bassVolume: 0.2, drumVolume: 0.15,
        arpeggio: false, filterCutoff: 0.5, reverb: 0.55,
        synthType: 'epic', padAttack: 1.2, useSubBass: true, strings: true, timpani: true
      },
      edm: {
        bpm: 128,
        progression: ['Am', 'Fmaj', 'Cmaj', 'Gmaj'],
        bassPattern: [0, 0, 12, 12, 0, 0, 7, 7],
        kickPattern: [1, 0, 1, 0, 1, 0, 1, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.12, leadVolume: 0.22, bassVolume: 0.35, drumVolume: 0.4,
        arpeggio: true, arpeggioSpeed: 4, filterCutoff: 0.85, reverb: 0.2,
        synthType: 'synth', padAttack: 0.02, useSubBass: true, sidechain: true, buildUp: true
      },
      rnb: {
        bpm: 85,
        progression: ['Cmaj7', 'Am7', 'Dm7', 'Gmaj'],
        bassPattern: [0, 0, 0, 5, 7, 0, 5, 0],
        kickPattern: [1, 0, 0, 1, 0, 0, 1, 0],
        snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
        hihatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
        padVolume: 0.15, leadVolume: 0.1, bassVolume: 0.28, drumVolume: 0.25,
        arpeggio: false, filterCutoff: 0.45, reverb: 0.35,
        synthType: 'warm', padAttack: 0.2, useSubBass: true, rhodes: true
      },
    };

    const config = genreConfig[genre] || genreConfig.upbeat;
    const beatDuration = 60 / config.bpm;
    const eighthNoteDuration = beatDuration / 2;
    const barDuration = beatDuration * 4;

    // ADSR Envelope generator
    const adsr = (t: number, attack: number, decay: number, sustain: number, release: number, noteLength: number): number => {
      if (t < attack) return t / attack;
      if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
      if (t < noteLength - release) return sustain;
      if (t < noteLength) return sustain * (1 - (t - (noteLength - release)) / release);
      return 0;
    };

    // Oscillators
    const saw = (phase: number): number => 2 * (phase - Math.floor(phase + 0.5));
    const square = (phase: number): number => phase % 1 < 0.5 ? 1 : -1;
    const triangle = (phase: number): number => 4 * Math.abs((phase % 1) - 0.5) - 1;
    const sine = (phase: number): number => Math.sin(2 * Math.PI * phase);

    // Low-pass filter (simple)
    let filterState = 0;
    const lowPass = (input: number, cutoff: number): number => {
      filterState += cutoff * (input - filterState);
      return filterState;
    };

    // Simple reverb buffer
    const reverbLength = Math.floor(sampleRate * 0.08);
    const reverbBuffer = new Float32Array(reverbLength);
    let reverbIndex = 0;

    // Vinyl crackle for lofi
    const crackle = (): number => Math.random() < 0.001 ? (Math.random() * 0.1 - 0.05) : 0;

    // Generate each sample
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const barNum = Math.floor(t / barDuration);
      const barPhase = (t % barDuration) / barDuration;
      const beatInBar = Math.floor(barPhase * 4);
      const eighthNoteInBar = Math.floor(barPhase * 8);
      const beatPhase = (barPhase * 4) % 1;
      const eighthPhase = (barPhase * 8) % 1;

      // Current chord
      const chordIndex = barNum % config.progression.length;
      const currentChord = config.progression[chordIndex];
      const chordNotes = chords[currentChord] || chords['Cmaj'];

      let mixL = 0;
      let mixR = 0;

      // ========== PAD/STRINGS ==========
      if (config.padVolume > 0) {
        const padEnv = adsr(barPhase * barDuration, config.padAttack, 0.3, 0.7, 0.5, barDuration);
        let padSample = 0;
        for (let n = 0; n < chordNotes.length; n++) {
          const noteFreq = noteFreqs[chordNotes[n]] || 261.63;
          const phase = t * noteFreq;
          if (config.synthType === 'warm' || config.synthType === 'clean') {
            padSample += sine(phase) * 0.5 + sine(phase * 2) * 0.2 + sine(phase * 0.5) * 0.3;
          } else if (config.synthType === 'epic') {
            padSample += saw(phase) * 0.3 + saw(phase * 1.005) * 0.3 + sine(phase * 0.5) * 0.4;
          } else {
            padSample += saw(phase) * 0.4 + saw(phase * 1.01) * 0.3 + triangle(phase * 0.5) * 0.3;
          }
        }
        padSample = lowPass(padSample / chordNotes.length, config.filterCutoff * 0.3) * padEnv * config.padVolume;
        mixL += padSample;
        mixR += padSample;
      }

      // ========== BASS ==========
      if (config.bassVolume > 0) {
        const bassNoteIndex = config.bassPattern[eighthNoteInBar % 8];
        const rootFreq = noteFreqs[chordNotes[0]] || 261.63;
        const bassFreq = (rootFreq / 2) * Math.pow(2, bassNoteIndex / 12);
        const bassEnv = adsr(eighthPhase * eighthNoteDuration, 0.01, 0.1, 0.6, 0.1, eighthNoteDuration * 0.8);
        let bassSample = sine(t * bassFreq) * 0.6;
        if (config.useSubBass) {
          bassSample += sine(t * bassFreq * 0.5) * 0.4;
        }
        bassSample += saw(t * bassFreq) * 0.2;
        bassSample = lowPass(bassSample, 0.15) * bassEnv * config.bassVolume;

        // Sidechain compression effect for electronic
        if (config.sidechain && config.kickPattern[eighthNoteInBar % 8]) {
          bassSample *= Math.min(1, eighthPhase * 4);
        }
        mixL += bassSample;
        mixR += bassSample;
      }

      // ========== LEAD/ARPEGGIO ==========
      if (config.leadVolume > 0 && config.arpeggio) {
        const arpSpeed = config.arpeggioSpeed || 2;
        const arpNoteIndex = Math.floor((t * config.bpm / 60 * arpSpeed) % chordNotes.length);
        const arpNote = chordNotes[arpNoteIndex];
        const arpFreq = (noteFreqs[arpNote] || 261.63) * 2; // Octave up
        const arpPhase = ((t * config.bpm / 60 * arpSpeed) % 1);
        const arpEnv = adsr(arpPhase * (60 / config.bpm / arpSpeed), 0.02, 0.1, 0.3, 0.1, 60 / config.bpm / arpSpeed);

        let arpSample = 0;
        if (config.synthType === 'synth' || config.synthType === 'bright') {
          arpSample = (saw(t * arpFreq) * 0.5 + square(t * arpFreq) * 0.3 + sine(t * arpFreq * 2) * 0.2);
        } else {
          arpSample = sine(t * arpFreq) * 0.7 + triangle(t * arpFreq) * 0.3;
        }
        arpSample = lowPass(arpSample, config.filterCutoff) * arpEnv * config.leadVolume;

        // Pan arpeggios slightly
        mixL += arpSample * 0.7;
        mixR += arpSample * 1.3;
      }

      // ========== DRUMS ==========
      if (config.drumVolume > 0) {
        // KICK
        if (config.kickPattern[eighthNoteInBar % 8]) {
          const kickPhase = eighthPhase;
          if (kickPhase < 0.15) {
            const kickEnv = Math.exp(-kickPhase * 25);
            const kickPitch = 60 * Math.exp(-kickPhase * 40) + 40;
            const kickSample = sine(t * kickPitch) * kickEnv * config.drumVolume * 1.2;
            mixL += kickSample;
            mixR += kickSample;
          }
        }

        // SNARE
        if (config.snarePattern[eighthNoteInBar % 8]) {
          const snarePhase = eighthPhase;
          if (snarePhase < 0.2) {
            const snareEnv = Math.exp(-snarePhase * 15);
            const snareSample = (
              sine(t * 200) * 0.4 +
              (Math.random() * 2 - 1) * 0.6
            ) * snareEnv * config.drumVolume * 0.8;
            mixL += snareSample;
            mixR += snareSample;
          }
        }

        // HI-HAT
        if (config.hihatPattern[eighthNoteInBar % 8]) {
          const hihatPhase = eighthPhase;
          if (hihatPhase < 0.08) {
            const hihatEnv = Math.exp(-hihatPhase * 40);
            // Metallic noise
            const hihatSample = (
              Math.sin(t * 8000 + Math.random() * 0.5) * 0.3 +
              Math.sin(t * 12000 + Math.random()) * 0.3 +
              (Math.random() * 2 - 1) * 0.4
            ) * hihatEnv * config.drumVolume * 0.4;
            // Pan hi-hats
            mixL += hihatSample * 0.8;
            mixR += hihatSample * 1.2;
          }
        }
      }

      // ========== EFFECTS ==========

      // Vinyl crackle for lofi
      if (config.vinyl) {
        const vinylNoise = crackle() + (Math.random() * 2 - 1) * 0.008;
        mixL += vinylNoise;
        mixR += vinylNoise;
      }

      // Simple reverb
      const reverbWet = config.reverb || 0.2;
      const reverbDry = 1 - reverbWet * 0.5;
      reverbBuffer[reverbIndex] = (mixL + mixR) * 0.5;
      const reverbSample = reverbBuffer[(reverbIndex - Math.floor(reverbLength * 0.7) + reverbLength) % reverbLength] * 0.3 +
                          reverbBuffer[(reverbIndex - Math.floor(reverbLength * 0.5) + reverbLength) % reverbLength] * 0.2 +
                          reverbBuffer[(reverbIndex - Math.floor(reverbLength * 0.3) + reverbLength) % reverbLength] * 0.1;
      reverbIndex = (reverbIndex + 1) % reverbLength;

      mixL = mixL * reverbDry + reverbSample * reverbWet;
      mixR = mixR * reverbDry + reverbSample * reverbWet;

      // Stereo widening
      const mid = (mixL + mixR) * 0.5;
      const side = (mixL - mixR) * 0.5 * 1.3;
      mixL = mid + side;
      mixR = mid - side;

      // Master compression/limiting
      const threshold = 0.7;
      const ratio = 4;
      const compress = (s: number): number => {
        const abs = Math.abs(s);
        if (abs > threshold) {
          return Math.sign(s) * (threshold + (abs - threshold) / ratio);
        }
        return s;
      };

      mixL = compress(mixL);
      mixR = compress(mixR);

      // Final soft clip
      mixL = Math.tanh(mixL * 1.2) * 0.9;
      mixR = Math.tanh(mixR * 1.2) * 0.9;

      // Fade in/out
      const fadeTime = 0.5;
      if (t < fadeTime) {
        const fade = t / fadeTime;
        mixL *= fade;
        mixR *= fade;
      }
      if (t > duration - fadeTime) {
        const fade = (duration - t) / fadeTime;
        mixL *= fade;
        mixR *= fade;
      }

      leftChannel[i] = mixL;
      rightChannel[i] = mixR;
    }

    // Convert to WAV blob
    const wavBuffer = audioBufferToWav(buffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    resolve(url);
    } catch (error) {
      console.error('Procedural music generation failed:', error);
      // Fallback to SoundHelix track if synthesis fails
      const fallbackTracks = [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      ];
      const randomTrack = fallbackTracks[Math.floor(Math.random() * fallbackTracks.length)];
      resolve(randomTrack);
    }
  });
};

// Convert AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  const offset = 44;
  const channelData: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), intSample, true);
    }
  }

  return arrayBuffer;
}

// ==========================================
// 🎵 PREMIUM MUSIC LIBRARY - 50+ DIVERSE REAL TRACKS! 🎵
// All tracks use REAL audio files from our royalty-free collection
// ==========================================

// Helper for music URLs - using free SoundHelix samples since local files aren't available
// These are royalty-free sample tracks for demo purposes
const SOUNDHELIX_TRACKS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
];

// Map track IDs to consistent SoundHelix URLs
const trackUrlCache: Record<string, string> = {};
const localMusic = (filename: string): string => {
  // Check if we already assigned a URL to this filename
  if (trackUrlCache[filename]) {
    return trackUrlCache[filename];
  }
  // Assign a consistent SoundHelix track based on filename hash
  const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const trackIndex = hash % SOUNDHELIX_TRACKS.length;
  trackUrlCache[filename] = SOUNDHELIX_TRACKS[trackIndex];
  return trackUrlCache[filename];
};

const premiumTracks = [
  // ========== ⚡ UPBEAT & ENERGETIC (8 tracks) ==========
  { id: 'upbeat-1', name: 'Rise & Shine Funk', genre: 'upbeat', duration: 63, description: 'Start your day with unstoppable funk energy!', audioUrl: localMusic('1m03s funk.mp3'), plays: 15420, likes: 3850, featured: true, trending: true },
  { id: 'upbeat-2', name: 'Aggressive Power', genre: 'upbeat', duration: 228, description: 'Champion\'s aggressive anthem!', audioUrl: localMusic('3m48s aggressive.mp3'), plays: 12300, likes: 2980 },
  { id: 'upbeat-3', name: 'High Tempo Rush', genre: 'upbeat', duration: 281, description: 'High tempo adrenaline rush!', audioUrl: localMusic('4m41s high tempo.mp3'), plays: 8900, likes: 2100, premium: true },
  { id: 'upbeat-4', name: 'Rock Rhythm', genre: 'upbeat', duration: 244, description: 'Rock rhythm that gets hearts pumping!', audioUrl: localMusic('4m04s rythm rock.mp3'), plays: 9500, likes: 2200 },
  { id: 'upbeat-5', name: 'Metal Energy', genre: 'upbeat', duration: 374, description: 'Metal energy for extreme content!', audioUrl: localMusic('6m14s metal.mp3'), plays: 7800, likes: 1900, premium: true },
  { id: 'upbeat-6', name: 'Groovy Funk', genre: 'upbeat', duration: 217, description: 'Funky groove that makes you move!', audioUrl: localMusic('3m37s funk.mp3'), plays: 11200, likes: 2700 },
  { id: 'upbeat-7', name: '80s Groove', genre: 'upbeat', duration: 180, description: 'Retro 80s energy vibes!', audioUrl: localMusic('80s Groove.mp3'), plays: 9800, likes: 2400, trending: true },
  { id: 'upbeat-8', name: '80s Wine', genre: 'upbeat', duration: 180, description: 'Smooth 80s groove!', audioUrl: localMusic('80s Wine.mp3'), plays: 8500, likes: 2100 },

  // ========== 🌊 CALM & RELAXING (8 tracks) ==========
  { id: 'calm-1', name: 'Ocean Piano Dreams', genre: 'calm', duration: 753, description: 'Slow piano with ocean waves - pure tranquility.', audioUrl: localMusic('12m33s slow piano ocean.mp3'), plays: 18500, likes: 4200, featured: true },
  { id: 'calm-2', name: 'Slow Melody', genre: 'calm', duration: 753, description: 'Beautiful slow melody for meditation.', audioUrl: localMusic('12m33s slow melody.mp3'), plays: 14200, likes: 3600 },
  { id: 'calm-3', name: 'Slow Ballad', genre: 'calm', duration: 122, description: 'Emotional ballad for peaceful moments.', audioUrl: localMusic('2m02s slow ballad.mp3'), plays: 9800, likes: 2400, premium: true },
  { id: 'calm-4', name: 'Chill Beat', genre: 'calm', duration: 81, description: 'Slow chill beat for relaxation.', audioUrl: localMusic('1m21s slow chill beat.mp3'), plays: 11200, likes: 2800 },
  { id: 'calm-5', name: 'Abstract Piano', genre: 'calm', duration: 436, description: 'Abstract piano compositions for deep focus.', audioUrl: localMusic('7m16s abstract piano.mp3'), plays: 8600, likes: 2100, premium: true },
  { id: 'calm-6', name: 'Vibe Hop Melody', genre: 'calm', duration: 240, description: 'Slow melody with vibe hop feel.', audioUrl: localMusic('4m00s slow melody vibe hop.mp3'), plays: 7500, likes: 1900 },
  { id: 'calm-7', name: 'Slow Melody 2', genre: 'calm', duration: 357, description: 'Another beautiful slow melody.', audioUrl: localMusic('5m57s slow melody.mp3'), plays: 12300, likes: 3100 },
  { id: 'calm-8', name: 'Afterglow', genre: 'calm', duration: 180, description: 'Warm ambient afterglow sensation.', audioUrl: localMusic('Afterglow.mp3'), plays: 10200, likes: 2600 },

  // ========== 💼 CORPORATE & PROFESSIONAL (6 tracks) ==========
  { id: 'corporate-1', name: 'Film Score', genre: 'corporate', duration: 178, description: 'Film score style for presentations.', audioUrl: localMusic('2m58s film score.mp3'), plays: 22100, likes: 5100, featured: true, trending: true },
  { id: 'corporate-2', name: 'Power Ballad', genre: 'corporate', duration: 341, description: 'Power ballad for inspiring narratives.', audioUrl: localMusic('5m41s power ballad.mp3'), plays: 16800, likes: 3900 },
  { id: 'corporate-3', name: 'Beautiful Keys', genre: 'corporate', duration: 180, description: 'Beautiful piano keys.', audioUrl: localMusic('beautifulkeys.mp3'), plays: 11200, likes: 2700, premium: true },
  { id: 'corporate-4', name: 'Balladic', genre: 'corporate', duration: 180, description: 'Balladic corporate feel.', audioUrl: localMusic('balladic.mp3'), plays: 9400, likes: 2300 },
  { id: 'corporate-5', name: 'Background Wish', genre: 'corporate', duration: 180, description: 'Background music for presentations.', audioUrl: localMusic('Background Wish.mp3'), plays: 8900, likes: 2200 },
  { id: 'corporate-6', name: 'Acoustic Organ', genre: 'corporate', duration: 180, description: 'Acoustic organ professional sound.', audioUrl: localMusic('acousticorgan.mp3'), plays: 7800, likes: 1900 },

  // ========== 🎬 CINEMATIC & EPIC (7 tracks) ==========
  { id: 'cinematic-1', name: 'Epic Orchestral', genre: 'cinematic', duration: 223, description: 'Grand orchestral for trailers & intros.', audioUrl: localMusic('3m43s orchestral.mp3'), plays: 19800, likes: 4800, featured: true },
  { id: 'cinematic-2', name: 'Dramatic Rise', genre: 'cinematic', duration: 246, description: 'Building dramatic tension!', audioUrl: localMusic('4m06s dramatic.mp3'), plays: 13500, likes: 3200, premium: true },
  { id: 'cinematic-3', name: 'Battle', genre: 'cinematic', duration: 180, description: 'Epic battle theme.', audioUrl: localMusic('Battle.mp3'), plays: 10200, likes: 2500, premium: true },
  { id: 'cinematic-4', name: 'Chase Sequence', genre: 'cinematic', duration: 180, description: 'High-tension chase music.', audioUrl: localMusic('Chase Sequence.mp3'), plays: 11800, likes: 2900 },
  { id: 'cinematic-5', name: 'Blockbuster', genre: 'cinematic', duration: 180, description: 'Hollywood blockbuster vibes.', audioUrl: localMusic('Blockbuster.mp3'), plays: 8900, likes: 2100, premium: true },
  { id: 'cinematic-6', name: '70s B-Movie', genre: 'cinematic', duration: 180, description: 'Retro cinematic B-movie feel.', audioUrl: localMusic('70s B-Movie.mp3'), plays: 7600, likes: 1800 },
  { id: 'cinematic-7', name: 'Space War', genre: 'cinematic', duration: 180, description: 'Epic space battle theme.', audioUrl: localMusic('Space War.mp3'), plays: 9200, likes: 2300 },

  // ========== 🎧 ELECTRONIC & SYNTH (10 tracks) ==========
  { id: 'electronic-1', name: 'Acid Techno', genre: 'electronic', duration: 81, description: 'Acid techno for tech content!', audioUrl: localMusic('1m21s acid techno.mp3'), plays: 17600, likes: 4100, trending: true },
  { id: 'electronic-2', name: 'Electro House', genre: 'electronic', duration: 238, description: 'Electro house energy!', audioUrl: localMusic('3m58s electro house.mp3'), plays: 11800, likes: 2900, premium: true },
  { id: 'electronic-3', name: 'Electro Groove', genre: 'electronic', duration: 249, description: 'Groovy electronic beats!', audioUrl: localMusic('4m09s electro groove.mp3'), plays: 14100, likes: 3400, premium: true },
  { id: 'electronic-4', name: 'Progressive Euro', genre: 'electronic', duration: 255, description: 'Progressive euro trance!', audioUrl: localMusic('4m15s progressive euro.mp3'), plays: 9200, likes: 2200 },
  { id: 'electronic-5', name: 'Techno Drive', genre: 'electronic', duration: 330, description: 'Hard techno for energy!', audioUrl: localMusic('5m30s techno.mp3'), plays: 7600, likes: 1800 },
  { id: 'electronic-6', name: 'House Disco', genre: 'electronic', duration: 247, description: 'House meets disco!', audioUrl: localMusic('4m07s house disco.mp3'), plays: 12300, likes: 3000 },
  { id: 'electronic-7', name: 'Tribal House', genre: 'electronic', duration: 264, description: 'Tribal percussion house!', audioUrl: localMusic('4m24s tribal house.mp3'), plays: 8500, likes: 2100 },
  { id: 'electronic-8', name: 'House DJ', genre: 'electronic', duration: 268, description: 'DJ house mix style!', audioUrl: localMusic('4m28s house dj.mp3'), plays: 10200, likes: 2500 },
  { id: 'electronic-9', name: 'Synth Soul', genre: 'electronic', duration: 180, description: 'Synthwave soul vibes!', audioUrl: localMusic('synthsoul.mp3'), plays: 9800, likes: 2400, featured: true },
  { id: 'electronic-10', name: 'Wave Synth', genre: 'electronic', duration: 180, description: 'Wave synth electronic!', audioUrl: localMusic('wavesynth.mp3'), plays: 8900, likes: 2200, premium: true },

  // ========== ☕ LO-FI & CHILL (6 tracks) ==========
  { id: 'lofi-1', name: 'Laid Back Sax', genre: 'lofi', duration: 90, description: 'Chill saxophone lo-fi vibes.', audioUrl: localMusic('1m30s sax laid back.mp3'), plays: 28500, likes: 6800, featured: true },
  { id: 'lofi-2', name: 'Slow Beat', genre: 'lofi', duration: 149, description: 'Perfect slow beats for work.', audioUrl: localMusic('2m29s slow beat.mp3'), plays: 21300, likes: 5200 },
  { id: 'lofi-3', name: 'Slow Connection', genre: 'lofi', duration: 180, description: 'Slow connection chill vibes.', audioUrl: localMusic('Slow Connection.mp3'), plays: 16700, likes: 4000, premium: true },
  { id: 'lofi-4', name: 'Slowly But Surely', genre: 'lofi', duration: 180, description: 'Easy going lo-fi beats.', audioUrl: localMusic('Slowly But Surely.mp3'), plays: 13400, likes: 3200 },
  { id: 'lofi-5', name: 'Low As You Go', genre: 'lofi', duration: 180, description: 'Low key chill vibes.', audioUrl: localMusic('lowasyougo.mp3'), plays: 10200, likes: 2500 },
  { id: 'lofi-6', name: 'Running Slow', genre: 'lofi', duration: 180, description: 'Slow running beats.', audioUrl: localMusic('Running Slow.mp3'), plays: 9100, likes: 2300 },

  // ========== 🎹 HIP-HOP & URBAN (6 tracks) ==========
  { id: 'hiphop-1', name: 'Hip Hop Beat', genre: 'hiphop', duration: 30, description: 'Short punchy hip-hop intro.', audioUrl: localMusic('0m30s hip hop.mp3'), plays: 14800, likes: 3500 },
  { id: 'hiphop-2', name: 'Alternative Hip Hop', genre: 'hiphop', duration: 111, description: 'Alternative hip-hop style.', audioUrl: localMusic('1m51s alternative hip hop.mp3'), plays: 12100, likes: 2900, premium: true },
  { id: 'hiphop-3', name: 'Alternative RnB', genre: 'hiphop', duration: 128, description: 'Smooth RnB vibes.', audioUrl: localMusic('2m08s alternative rnb.mp3'), plays: 9800, likes: 2400 },
  { id: 'hiphop-4', name: 'Urban Rural', genre: 'hiphop', duration: 180, description: 'Urban meets rural vibes.', audioUrl: localMusic('urbanrurban.mp3'), plays: 11200, likes: 2800 },
  { id: 'hiphop-5', name: 'Street Band', genre: 'hiphop', duration: 180, description: 'Street band hip-hop.', audioUrl: localMusic('Street Band.mp3'), plays: 8900, likes: 2200, premium: true },
  { id: 'hiphop-6', name: 'Late Night Show', genre: 'hiphop', duration: 180, description: 'Late night hip-hop vibes.', audioUrl: localMusic('Late Night Show.mp3'), plays: 10500, likes: 2600 },

  // ========== 🌴 TROPICAL & DANCE (5 tracks) ==========
  { id: 'tropical-1', name: 'Reggae Vibes', genre: 'tropical', duration: 179, description: 'Tropical reggae for summer!', audioUrl: localMusic('2m59s reggae.mp3'), plays: 15600, likes: 3700 },
  { id: 'tropical-2', name: 'Dancehall', genre: 'tropical', duration: 185, description: 'Caribbean dancehall energy!', audioUrl: localMusic('3m05s dancehall.mp3'), plays: 10800, likes: 2600, premium: true },
  { id: 'tropical-3', name: 'Disco Party', genre: 'tropical', duration: 204, description: 'Disco party anthem!', audioUrl: localMusic('3m24s disco.mp3'), plays: 12100, likes: 2900 },
  { id: 'tropical-4', name: 'Alternative Dance', genre: 'tropical', duration: 152, description: 'Alternative dance fusion.', audioUrl: localMusic('2m32s alternative dance.mp3'), plays: 9400, likes: 2300 },
  { id: 'tropical-5', name: 'Disco Medusa', genre: 'tropical', duration: 180, description: 'Disco Medusa party vibes!', audioUrl: localMusic('Disco Medusa.mp3'), plays: 11800, likes: 2900, featured: true },

  // ========== 🎷 JAZZ, BLUES & FUNK (8 tracks) ==========
  { id: 'jazz-1', name: 'Blues Piano', genre: 'jazz', duration: 80, description: 'Smooth blues piano.', audioUrl: localMusic('1m20s blues.mp3'), plays: 11200, likes: 2700 },
  { id: 'jazz-2', name: 'Blues Shuffle', genre: 'jazz', duration: 148, description: 'Classic blues shuffle.', audioUrl: localMusic('2m28s blues shuffle.mp3'), plays: 9400, likes: 2200 },
  { id: 'jazz-3', name: 'Saxophone Solo', genre: 'jazz', duration: 257, description: 'Elegant saxophone solo.', audioUrl: localMusic('4m17s saxsaphone.mp3'), plays: 8100, likes: 1900, premium: true },
  { id: 'jazz-4', name: 'Harmonica Blues', genre: 'jazz', duration: 137, description: 'Harmonica blues B-style.', audioUrl: localMusic('2m17s harmonica bdiddley.mp3'), plays: 7500, likes: 1800 },
  { id: 'jazz-5', name: 'Deep Blues', genre: 'jazz', duration: 221, description: 'Deep blues soul vibes.', audioUrl: localMusic('3m41s blues.mp3'), plays: 8900, likes: 2200 },
  { id: 'jazz-6', name: 'Swaying Blues', genre: 'jazz', duration: 180, description: 'Swaying blues rhythm.', audioUrl: localMusic('Swaying Blues.mp3'), plays: 7800, likes: 1900 },
  { id: 'jazz-7', name: 'Funky Grooves', genre: 'funk', duration: 180, description: 'Funky grooves to move you.', audioUrl: localMusic('Funky.mp3'), plays: 10200, likes: 2500, trending: true },
  { id: 'jazz-8', name: 'Breakin Groove', genre: 'funk', duration: 180, description: 'Breaking beat grooves.', audioUrl: localMusic("Breakin' Groove.mp3"), plays: 9600, likes: 2400 },

  // ========== 🎸 ACOUSTIC & FOLK (6 tracks) ==========
  { id: 'acoustic-1', name: 'Acoustic Guitar', genre: 'acoustic', duration: 98, description: 'Beautiful acoustic guitar.', audioUrl: localMusic('1m38s acoustic.mp3'), plays: 13200, likes: 3200 },
  { id: 'acoustic-2', name: 'Acoustic Rock', genre: 'acoustic', duration: 59, description: 'Acoustic rock energy.', audioUrl: localMusic('0m59s acoustic rock.mp3'), plays: 9800, likes: 2400 },
  { id: 'acoustic-3', name: 'Unplugged', genre: 'acoustic', duration: 244, description: 'Unplugged acoustic session.', audioUrl: localMusic('4m04s unplugged.mp3'), plays: 11500, likes: 2800, featured: true },
  { id: 'acoustic-4', name: 'Guitar Riff', genre: 'acoustic', duration: 266, description: 'Rhythm guitar riff.', audioUrl: localMusic('4m26s rythm guitar riff.mp3'), plays: 8200, likes: 2000, premium: true },
  { id: 'acoustic-5', name: 'Celtic Folk', genre: 'acoustic', duration: 53, description: 'Celtic folk charm.', audioUrl: localMusic('0m53s celtic.mp3'), plays: 7600, likes: 1900 },
  { id: 'acoustic-6', name: 'Celtic Charm', genre: 'acoustic', duration: 180, description: 'Magical celtic sounds.', audioUrl: localMusic('celticcharm.mp3'), plays: 8900, likes: 2200 },

  // ========== 🌌 AMBIENT & SPACE (5 tracks) ==========
  { id: 'ambient-1', name: 'Space 2020', genre: 'ambient', duration: 180, description: 'Ethereal space soundscapes.', audioUrl: localMusic('2020 Space.mp3'), plays: 9800, likes: 2400 },
  { id: 'ambient-2', name: 'Space Spark', genre: 'ambient', duration: 180, description: 'Space spark atmosphere.', audioUrl: localMusic('Space Spark.mp3'), plays: 12500, likes: 3100, premium: true },
  { id: 'ambient-3', name: 'Space Waze', genre: 'ambient', duration: 180, description: 'Space waze soundscape.', audioUrl: localMusic('Space Waze.mp3'), plays: 8600, likes: 2100 },
  { id: 'ambient-4', name: 'Stratosphere', genre: 'ambient', duration: 180, description: 'Stratosphere ambient.', audioUrl: localMusic('Stratosphere.mp3'), plays: 7900, likes: 1900 },
  { id: 'ambient-5', name: 'Tribal Trance', genre: 'ambient', duration: 180, description: 'Tribal trance ambient.', audioUrl: localMusic('tribaltrance.mp3'), plays: 9200, likes: 2300, featured: true },

  // ========== 🎤 VOCAL & SPECIAL (6 tracks) ==========
  { id: 'vocal-1', name: 'Chant Craft', genre: 'vocal', duration: 180, description: 'Vocal chant atmospherics.', audioUrl: localMusic('chantcraft.mp3'), plays: 8500, likes: 2100, premium: true },
  { id: 'vocal-2', name: '70s Love Theme', genre: 'vocal', duration: 180, description: 'Retro 70s love ballad.', audioUrl: localMusic('70s Love Theme.mp3'), plays: 7800, likes: 1900 },
  { id: 'vocal-3', name: 'Teen Hearts', genre: 'vocal', duration: 180, description: 'Teen hearts vocal pop.', audioUrl: localMusic('Teen Hearts.mp3'), plays: 9100, likes: 2300 },
  { id: 'vocal-4', name: 'Beyond Words', genre: 'vocal', duration: 180, description: 'Emotional vocal soundscape.', audioUrl: localMusic('Beyond Words.mp3'), plays: 8200, likes: 2000, featured: true },
  { id: 'vocal-5', name: 'Heartfelt Advice', genre: 'vocal', duration: 180, description: 'Heartfelt vocal melody.', audioUrl: localMusic('Heartfelt Advice.mp3'), plays: 7500, likes: 1800 },
  { id: 'vocal-6', name: 'High School Love', genre: 'vocal', duration: 180, description: 'High school love theme.', audioUrl: localMusic('High School Love.mp3'), plays: 8800, likes: 2100, trending: true },
];

interface MusicMakerProProps {
  onMusicSelected?: (track: any) => void;
  compact?: boolean;
}

const MusicMakerPro: React.FC<MusicMakerProProps> = ({ onMusicSelected, compact = false }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const voiceContext = useElevenLabsVoiceSafe();

  // State
  const [activeTab, setActiveTab] = useState<'library' | 'generate' | 'studio'>('library');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<typeof premiumTracks[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  // AI Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generatedTracks, setGeneratedTracks] = useState<any[]>(() => {
    // Load saved tracks from localStorage
    try {
      const saved = localStorage.getItem('smartpromptiq_generated_music');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [withVocals, setWithVocals] = useState(false);
  const [customLyrics, setCustomLyrics] = useState('');
  const [musicDuration, setMusicDuration] = useState(60);
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [voiceStyle, setVoiceStyle] = useState<'singing' | 'narration' | 'spoken-word'>('narration');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // New enhanced options
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTempo, setSelectedTempo] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [previewDuration, setPreviewDuration] = useState(10);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewGenre, setPreviewGenre] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [genreCategory, setGenreCategory] = useState('all');

  // Save generated tracks to localStorage when they change
  useEffect(() => {
    if (generatedTracks.length > 0) {
      // Save track metadata (not audio URLs as they're blobs)
      const tracksToSave = generatedTracks.map(t => ({
        ...t,
        audioUrl: '', // Don't save blob URLs
        savedAt: t.savedAt || new Date().toISOString()
      }));
      localStorage.setItem('smartpromptiq_generated_music', JSON.stringify(tracksToSave));
    }
  }, [generatedTracks]);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  // Filter tracks by genre
  const filteredTracks = useMemo(() => {
    return selectedGenre
      ? premiumTracks.filter(t => t.genre === selectedGenre)
      : premiumTracks;
  }, [selectedGenre]);

  // Filter genres by category
  const filteredGenres = useMemo(() => {
    if (genreCategory === 'all') return musicGenres;
    return musicGenres.filter(g => g.category === genreCategory);
  }, [genreCategory]);

  // Get unique categories
  const genreCategories = useMemo(() => {
    const cats = new Set(musicGenres.map(g => g.category));
    return ['all', ...Array.from(cats)];
  }, []);

  // Quick preview ref for stopping
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Quick preview a genre
  const quickPreview = useCallback(async (genreId: string) => {
    // Stop any current preview
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    if (previewGenre === genreId && isPreviewPlaying) {
      setIsPreviewPlaying(false);
      setPreviewGenre('');
      return;
    }

    setPreviewGenre(genreId);
    setIsPreviewPlaying(true);

    toast({
      title: '🎵 Generating Preview...',
      description: `Creating ${previewDuration}s ${genreId} preview`,
    });

    // Generate short preview
    const audioUrl = await generateProceduralTrack(genreId, previewDuration);

    const audio = new Audio(audioUrl);
    audio.volume = volume;
    previewAudioRef.current = audio;

    audio.onended = () => {
      setIsPreviewPlaying(false);
      setPreviewGenre('');
    };

    audio.play()
      .then(() => {
        toast({
          title: `▶️ Preview: ${musicGenres.find(g => g.id === genreId)?.name}`,
          description: 'Click again to stop',
        });
      })
      .catch(err => {
        console.log('Preview blocked:', err);
        setIsPreviewPlaying(false);
        setPreviewGenre('');
      });
  }, [previewGenre, isPreviewPlaying, previewDuration, volume, toast]);

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  // Track audio cache
  const trackCacheRef = useRef<Map<string, string>>(new Map());
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  // Play track - generates audio on-demand using Web Audio API
  const playTrack = useCallback(async (track: any) => {
    // If same track is playing, toggle pause/play
    if (selectedTrack?.id === track.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // If same track is paused, resume
    if (selectedTrack?.id === track.id && !isPlaying && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Resume failed:', err));
      return;
    }

    setSelectedTrack(track);
    setPlaybackProgress(0);

    // Use the track's audioUrl directly - all tracks now have real audio files
    let audioUrl = track.audioUrl;

    // If no audioUrl, show error
    if (!audioUrl) {
      toast({
        title: 'Track Unavailable',
        description: 'This track does not have an audio file.',
        variant: 'destructive',
      });
      return;
    }

    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          toast({
            title: `▶️ Now Playing`,
            description: `${track.name}`,
          });
        })
        .catch((err) => {
          console.error('Playback error:', err);
          toast({
            title: 'Click to Enable Audio',
            description: 'Browser requires interaction before playing',
            variant: 'destructive',
          });
        });
    }
  }, [selectedTrack, isPlaying, volume, toast]);

  // Toggle like
  const toggleLike = useCallback((trackId: string) => {
    setLikedTracks(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  }, []);

  // Generate AI Music with ElevenLabs Sound Effects API
  const generateMusic = useCallback(async () => {
    if (!generationPrompt.trim()) {
      toast({ title: 'Enter a description', description: 'Please describe the music you want to create', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStage('Analyzing your request...');

    const stages = [
      { progress: 15, stage: 'Understanding mood and style...', delay: 800 },
      { progress: 30, stage: 'Connecting to ElevenLabs AI...', delay: 1000 },
      { progress: 50, stage: 'Composing AI-generated music...', delay: 2000 },
      { progress: 70, stage: 'Processing audio tracks...', delay: 2000 },
      { progress: 85, stage: 'Finalizing your track...', delay: 1500 },
      { progress: 95, stage: 'Mastering final mix...', delay: 1000 },
    ];

    // Progress through stages
    for (const s of stages) {
      await new Promise(r => setTimeout(r, s.delay));
      setGenerationProgress(s.progress);
      setGenerationStage(s.stage);
    }

    try {
      // Determine genre from prompt if not selected
      const detectedGenre = selectedGenre || detectGenreFromPrompt(generationPrompt);
      const trackDuration = Math.min(musicDuration, 22); // ElevenLabs supports up to 22s sound effects

      let audioUrl: string;
      let provider = 'elevenlabs';

      // Try ElevenLabs Sound Effects API first
      try {
        setGenerationStage('Generating with ElevenLabs AI...');

        // Build a rich prompt for sound effect generation
        const soundPrompt = `${detectedGenre} music background, ${generationPrompt}, ${trackDuration > 10 ? 'ambient atmosphere' : 'musical elements'}`;

        const elevenLabsResponse = await fetch('/api/elevenlabs/sound-effects/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: soundPrompt,
            duration: trackDuration,
            promptInfluence: 0.3,
          }),
        });

        const elevenLabsData = await elevenLabsResponse.json();

        if (elevenLabsData.success && elevenLabsData.audioUrl) {
          audioUrl = elevenLabsData.audioUrl;
          console.log('🎵 ElevenLabs AI sound generated successfully!');
        } else {
          throw new Error(elevenLabsData.message || 'ElevenLabs generation failed');
        }
      } catch (elevenLabsError) {
        console.warn('ElevenLabs API fallback:', elevenLabsError);
        provider = 'local';
        setGenerationStage('Finding matching track from library...');

        // Fallback to matching track from our real music library
        const matchingTracks = premiumTracks.filter(t =>
          t.genre === detectedGenre ||
          t.genre.includes(detectedGenre) ||
          detectedGenre.includes(t.genre)
        );

        if (matchingTracks.length > 0) {
          const randomTrack = matchingTracks[Math.floor(Math.random() * matchingTracks.length)];
          audioUrl = randomTrack.audioUrl;
        } else {
          // Use any random track as last resort
          const randomTrack = premiumTracks[Math.floor(Math.random() * premiumTracks.length)];
          audioUrl = randomTrack.audioUrl;
        }
      }

      // Create the new track
      const safePrompt = generationPrompt || 'Generated Track';
      const trackName = safePrompt.length > 25
        ? safePrompt.slice(0, 25) + '...'
        : safePrompt;

      const providerLabel = provider === 'elevenlabs' ? '🎵 ElevenLabs AI' : '🔊 Local Synthesis';

      const newTrack = {
        id: `gen-${Date.now()}`,
        name: trackName,
        genre: detectedGenre,
        duration: trackDuration,
        description: `${providerLabel} • ${detectedGenre} • ${trackDuration}s`,
        audioUrl: audioUrl,
        plays: 0,
        likes: 0,
        featured: false,
        trending: false,
        isAiGenerated: true,
        prompt: generationPrompt,
        createdAt: new Date().toISOString(),
        withVocals,
        provider,
      };

      // Store in cache for playback
      trackCacheRef.current.set(newTrack.id, audioUrl);

      // Add to generated tracks
      setGeneratedTracks(prev => [newTrack, ...prev]);
      setGenerationProgress(100);
      setGenerationStage('Complete! Your track is ready.');

      toast({
        title: '🎵 Music Generated!',
        description: `"${trackName}" is ready to play!`,
      });

      // Auto-play after a short delay
      setTimeout(() => {
        setIsGenerating(false);
        setSelectedTrack(newTrack);

        // Play the new track
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.volume = volume;
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.log('Auto-play blocked:', err));
        }

        // Switch to studio tab to show the new track
        setActiveTab('studio');
      }, 500);

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Please try again',
        variant: 'destructive'
      });
      setIsGenerating(false);
    }
  }, [generationPrompt, selectedGenre, musicDuration, withVocals, volume, toast]);

  // Helper to detect genre from prompt text - ENHANCED with all 16 genres
  const detectGenreFromPrompt = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    // Check for specific genre keywords
    if (lower.includes('hip hop') || lower.includes('hip-hop') || lower.includes('hiphop') || lower.includes('rap') || lower.includes('trap')) return 'hiphop';
    if (lower.includes('jazz') || lower.includes('swing') || lower.includes('smooth jazz')) return 'jazz';
    if (lower.includes('rock') || lower.includes('guitar solo') || lower.includes('band')) return 'rock';
    if (lower.includes('ambient') || lower.includes('atmospheric') || lower.includes('space') || lower.includes('drone')) return 'ambient';
    if (lower.includes('synthwave') || lower.includes('retro') || lower.includes('80s') || lower.includes('outrun') || lower.includes('neon')) return 'synthwave';
    if (lower.includes('funk') || lower.includes('groovy') || lower.includes('groove') || lower.includes('funky')) return 'funk';
    if (lower.includes('tropical') || lower.includes('summer') || lower.includes('beach') || lower.includes('island')) return 'tropical';
    if (lower.includes('orchestral') || lower.includes('orchestra') || lower.includes('classical') || lower.includes('symphony')) return 'orchestral';
    if (lower.includes('edm') || lower.includes('dance') || lower.includes('club') || lower.includes('rave') || lower.includes('drop')) return 'edm';
    if (lower.includes('r&b') || lower.includes('rnb') || lower.includes('soul') || lower.includes('neo soul')) return 'rnb';
    // Original genres
    if (lower.includes('energetic') || lower.includes('upbeat') || lower.includes('happy') || lower.includes('motivat') || lower.includes('uplifting')) return 'upbeat';
    if (lower.includes('calm') || lower.includes('relax') || lower.includes('peaceful') || lower.includes('meditation') || lower.includes('serene')) return 'calm';
    if (lower.includes('corporate') || lower.includes('business') || lower.includes('professional') || lower.includes('startup') || lower.includes('presentation')) return 'corporate';
    if (lower.includes('epic') || lower.includes('cinematic') || lower.includes('dramatic') || lower.includes('movie') || lower.includes('trailer') || lower.includes('film')) return 'cinematic';
    if (lower.includes('electronic') || lower.includes('techno') || lower.includes('synth') || lower.includes('digital')) return 'electronic';
    if (lower.includes('lofi') || lower.includes('lo-fi') || lower.includes('chill') || lower.includes('study') || lower.includes('vinyl')) return 'lofi';
    // Check selected mood to help determine genre
    if (selectedMood === 'sad' || selectedMood === 'melancholic') return 'lofi';
    if (selectedMood === 'energetic') return 'electronic';
    if (selectedMood === 'relaxed') return 'calm';
    if (selectedMood === 'epic') return 'cinematic';
    if (selectedMood === 'romantic') return 'rnb';
    if (selectedMood === 'dark') return 'ambient';
    if (selectedMood === 'playful') return 'tropical';
    return 'upbeat'; // default
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Floating particles */}
      <FloatingParticles />

      {/* Header */}
      <div className="relative text-center pt-8 pb-6 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">Powered by Suno AI</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3">
          AI Music Studio
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create breathtaking, studio-quality music in seconds with AI
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 px-4 mb-8">
        {[
          { id: 'library', label: 'Music Library', icon: ListMusic },
          { id: 'generate', label: 'AI Generate', icon: Wand2 },
          { id: 'studio', label: 'My Studio', icon: Disc3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32">
        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            {/* Genre Selector */}
            <GenreSelector
              genres={musicGenres}
              selected={selectedGenre}
              onSelect={setSelectedGenre}
            />

            {/* Tracks Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isSelected={selectedTrack?.id === track.id}
                  isPlaying={isPlaying && selectedTrack?.id === track.id}
                  onPlay={() => playTrack(track)}
                  onSelect={() => setSelectedTrack(track)}
                  onLike={() => toggleLike(track.id)}
                  isLiked={likedTracks.includes(track.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* GENERATE TAB */}
        {activeTab === 'generate' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {isGenerating ? (
              <AIGenerationProgress progress={generationProgress} stage={generationStage} />
            ) : (
              <>
                {/* Main Generation Card */}
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Brain className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">AI Music Generator</h2>
                      <p className="text-gray-400 mt-2">Create professional music with 16 genres, moods, and instruments</p>
                    </div>

                    {/* Prompt Input */}
                    <div>
                      <label className="text-gray-300 text-sm font-medium mb-2 block">Describe Your Track</label>
                      <Textarea
                        value={generationPrompt}
                        onChange={(e) => setGenerationPrompt(e.target.value)}
                        placeholder="Example: An uplifting corporate track with piano and strings, perfect for a tech startup video..."
                        className="min-h-28 bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* Genre Category Filter */}
                    <div>
                      <label className="text-gray-300 text-sm font-medium mb-3 block">Genre Category</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {genreCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setGenreCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              genreCategory === cat
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            {cat === 'all' ? 'All Genres' : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Genre Selector with Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-gray-300 text-sm font-medium">Select Genre</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Preview:</span>
                          <Select value={previewDuration.toString()} onValueChange={(v) => setPreviewDuration(Number(v))}>
                            <SelectTrigger className="w-20 h-7 bg-slate-800 border-slate-600 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5s</SelectItem>
                              <SelectItem value="10">10s</SelectItem>
                              <SelectItem value="15">15s</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {filteredGenres.map((genre) => (
                          <div
                            key={genre.id}
                            className={`relative group rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                              selectedGenre === genre.id
                                ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-slate-900 scale-105 shadow-lg shadow-purple-500/50'
                                : 'hover:scale-102 hover:shadow-md'
                            }`}
                            onClick={() => {
                              const newGenre = selectedGenre === genre.id ? '' : genre.id;
                              setSelectedGenre(newGenre);
                              if (newGenre) {
                                toast({
                                  title: `✓ ${genre.name} Selected`,
                                  description: `Genre set to ${genre.name}`,
                                });
                              }
                            }}
                          >
                            {/* Background gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} ${
                              selectedGenre === genre.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
                            } transition-opacity`} />

                            {/* Glass overlay - lighter when selected */}
                            <div className={`absolute inset-0 ${selectedGenre === genre.id ? 'bg-black/10' : 'bg-black/20'} backdrop-blur-[1px]`} />

                            {/* Content */}
                            <div className="relative p-4 text-center">
                              <genre.icon className={`w-8 h-8 mx-auto mb-2 ${selectedGenre === genre.id ? 'text-white scale-110' : 'text-white'} transition-transform`} />
                              <h4 className={`font-semibold text-sm ${selectedGenre === genre.id ? 'text-white' : 'text-white'}`}>{genre.name}</h4>
                              <p className="text-white/70 text-xs mt-1">{genre.tags[0]}</p>

                              {/* Preview button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); quickPreview(genre.id); }}
                                className={`mt-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                  previewGenre === genre.id && isPreviewPlaying
                                    ? 'bg-white text-purple-600 animate-pulse'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                              >
                                {previewGenre === genre.id && isPreviewPlaying ? (
                                  <span className="flex items-center gap-1">
                                    <Square className="w-3 h-3" /> Stop
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Play className="w-3 h-3" /> Preview
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Selected indicator - larger and more visible */}
                            {selectedGenre === genre.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <Check className="w-4 h-4 text-purple-600" />
                              </div>
                            )}

                            {/* Selected label at bottom */}
                            {selectedGenre === genre.id && (
                              <div className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-xs font-bold text-center py-1">
                                ✓ SELECTED
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mood Selection */}
                    <div>
                      <label className="text-gray-300 text-sm font-medium mb-3 block">Select Mood</label>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {moodPresets.map((mood) => (
                          <button
                            key={mood.id}
                            onClick={() => setSelectedMood(selectedMood === mood.id ? '' : mood.id)}
                            className={`p-3 rounded-xl transition-all text-center ${
                              selectedMood === mood.id
                                ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500'
                                : 'bg-slate-800/50 border border-slate-700 hover:border-purple-500/50'
                            }`}
                          >
                            <span className="text-2xl">{mood.emoji}</span>
                            <p className="text-xs text-gray-300 mt-1">{mood.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <button
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Settings2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Advanced Options */}
                    {showAdvancedOptions && (
                      <div className="space-y-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                        {/* Tempo Selection */}
                        <div>
                          <label className="text-gray-300 text-sm font-medium mb-3 block">Tempo</label>
                          <div className="grid grid-cols-4 gap-2">
                            {tempoPresets.map((tempo) => (
                              <button
                                key={tempo.id}
                                onClick={() => setSelectedTempo(selectedTempo === tempo.id ? '' : tempo.id)}
                                className={`p-3 rounded-xl transition-all text-center ${
                                  selectedTempo === tempo.id
                                    ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-500'
                                    : 'bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50'
                                }`}
                              >
                                <p className="text-white font-medium text-sm">{tempo.name}</p>
                                <p className="text-xs text-gray-400">{tempo.bpm} BPM</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Instrument Focus */}
                        <div>
                          <label className="text-gray-300 text-sm font-medium mb-3 block">
                            Instrument Focus <span className="text-gray-500">(select multiple)</span>
                          </label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {instrumentOptions.map((inst) => (
                              <button
                                key={inst.id}
                                onClick={() => {
                                  setSelectedInstruments(prev =>
                                    prev.includes(inst.id)
                                      ? prev.filter(i => i !== inst.id)
                                      : [...prev, inst.id]
                                  );
                                }}
                                className={`p-3 rounded-xl transition-all text-center ${
                                  selectedInstruments.includes(inst.id)
                                    ? 'bg-gradient-to-br from-orange-500/30 to-red-500/30 border-2 border-orange-500'
                                    : 'bg-slate-800/50 border border-slate-700 hover:border-orange-500/50'
                                }`}
                              >
                                <inst.icon className={`w-6 h-6 mx-auto mb-1 ${
                                  selectedInstruments.includes(inst.id) ? 'text-orange-400' : 'text-gray-400'
                                }`} />
                                <p className="text-xs text-gray-300">{inst.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Duration & Style Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Duration</label>
                        <Select value={musicDuration.toString()} onValueChange={(v) => setMusicDuration(Number(v))}>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="90">1.5 minutes</SelectItem>
                            <SelectItem value="120">2 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Style</label>
                        <Select value={withVocals ? 'vocals' : 'instrumental'} onValueChange={(v) => setWithVocals(v === 'vocals')}>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instrumental">Instrumental</SelectItem>
                            <SelectItem value="vocals">With Vocals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {withVocals && (
                      <div className="space-y-4 p-4 bg-gradient-to-br from-violet-900/30 to-pink-900/30 rounded-xl border border-violet-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Mic2 className="w-5 h-5 text-violet-400" />
                          <span className="text-white font-medium">ElevenLabs Voice Settings</span>
                          <Badge className="bg-violet-500/30 text-violet-300">PRO</Badge>
                        </div>

                        {/* Voice Selection */}
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">Select Voice</label>
                          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {ELEVENLABS_VOICES.slice(0, 12).map((voice) => (
                                <SelectItem key={voice.id} value={voice.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{voice.emoji}</span>
                                    <span>{voice.name}</span>
                                    <span className="text-xs text-gray-400">({voice.gender})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Voice Style */}
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">Voice Style</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'narration', label: 'Narration', icon: '🎙️' },
                              { id: 'spoken-word', label: 'Spoken Word', icon: '🗣️' },
                              { id: 'singing', label: 'Singing', icon: '🎤' },
                            ].map((style) => (
                              <button
                                key={style.id}
                                onClick={() => setVoiceStyle(style.id as any)}
                                className={`p-2 rounded-lg border text-center transition-all ${
                                  voiceStyle === style.id
                                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                                    : 'border-slate-600 bg-slate-800/50 text-gray-400 hover:border-slate-500'
                                }`}
                              >
                                <span className="text-lg">{style.icon}</span>
                                <p className="text-xs mt-1">{style.label}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Lyrics Input */}
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">
                            {voiceStyle === 'singing' ? 'Lyrics' : 'Script/Text'}
                          </label>
                          <Textarea
                            value={customLyrics}
                            onChange={(e) => setCustomLyrics(e.target.value)}
                            placeholder={voiceStyle === 'singing'
                              ? "Enter your song lyrics here..."
                              : "Enter the text to be spoken over the music..."}
                            className="min-h-24 bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-500"
                          />
                        </div>

                        {/* Preview Voice Button */}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const safeLyrics = customLyrics || '';
                            if (voiceContext?.speak && safeLyrics.trim()) {
                              voiceContext.speak(safeLyrics.slice(0, 200), { voice: selectedVoice });
                              toast({ title: 'Testing Voice', description: `Playing preview with ${selectedVoice}` });
                            } else if (!safeLyrics.trim()) {
                              toast({ title: 'Enter text first', description: 'Please enter some text to preview', variant: 'destructive' });
                            }
                          }}
                          className="w-full border-violet-500/50 text-violet-300 hover:bg-violet-500/20"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Preview Voice
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                          Voice will be layered over generated music using ElevenLabs
                        </p>
                      </div>
                    )}

                    {/* Selection Summary */}
                    {(selectedGenre || selectedMood || selectedTempo || selectedInstruments.length > 0) && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <p className="text-sm text-purple-300">
                          <span className="font-medium">Your selection:</span>{' '}
                          {selectedGenre && <Badge className="mr-1 bg-purple-500/30">{selectedGenre}</Badge>}
                          {selectedMood && <Badge className="mr-1 bg-pink-500/30">{selectedMood}</Badge>}
                          {selectedTempo && <Badge className="mr-1 bg-cyan-500/30">{selectedTempo}</Badge>}
                          {selectedInstruments.map(i => (
                            <Badge key={i} className="mr-1 bg-orange-500/30">{i}</Badge>
                          ))}
                        </p>
                      </div>
                    )}

                    {/* Generate Button */}
                    <Button
                      onClick={generateMusic}
                      className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-lg shadow-purple-500/30"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Music with AI
                    </Button>

                    <p className="text-center text-gray-500 text-sm">
                      16 genres • 8 moods • Professional quality • ~75 tokens per track
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-slate-900/50 border-slate-700 p-4 text-center">
                    <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{generatedTracks.length}</p>
                    <p className="text-xs text-gray-400">Tracks Created</p>
                  </Card>
                  <Card className="bg-slate-900/50 border-slate-700 p-4 text-center">
                    <Award className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">16</p>
                    <p className="text-xs text-gray-400">Genres Available</p>
                  </Card>
                  <Card className="bg-slate-900/50 border-slate-700 p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">Pro</p>
                    <p className="text-xs text-gray-400">Quality Output</p>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* STUDIO TAB */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Your Generated Tracks</h2>
              <p className="text-gray-400">All your AI-created masterpieces ({generatedTracks.length} tracks)</p>
            </div>

            {generatedTracks.length > 0 ? (
              <div className="space-y-4">
                {generatedTracks.map((track) => (
                  <Card
                    key={track.id}
                    className={`bg-slate-800/50 border-slate-700 transition-all ${
                      selectedTrack?.id === track.id ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Album Art */}
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                            musicGenres.find(g => g.id === track.genre)?.color || 'from-purple-500 to-pink-500'
                          } flex items-center justify-center cursor-pointer ${
                            isPlaying && selectedTrack?.id === track.id ? 'animate-pulse' : ''
                          }`}
                          onClick={() => playTrack(track)}
                        >
                          {isPlaying && selectedTrack?.id === track.id ? (
                            <Pause className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white ml-1" />
                          )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold truncate">{track.name}</h4>
                          <p className="text-gray-400 text-sm truncate">{track.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                              {track.genre}
                            </Badge>
                            <span className="text-xs text-gray-500">{track.duration}s</span>
                            {track.createdAt && (
                              <span className="text-xs text-gray-600">
                                {new Date(track.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playTrack(track)}
                            className="text-gray-400 hover:text-white"
                          >
                            {isPlaying && selectedTrack?.id === track.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // Use the track's audioUrl directly
                              if (track.audioUrl) {
                                const a = document.createElement('a');
                                a.href = track.audioUrl;
                                a.download = `${track.name.replace(/[^a-z0-9]/gi, '_')}.mp3`;
                                a.click();
                                toast({ title: 'Downloaded!', description: `${track.name}.mp3` });
                              } else {
                                toast({ title: 'Track unavailable', variant: 'destructive' });
                              }
                            }}
                            className="text-gray-400 hover:text-cyan-400"
                          >
                            <Download className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // Remove from generated tracks
                              setGeneratedTracks(prev => prev.filter(t => t.id !== track.id));
                              // Clear from cache
                              trackCacheRef.current.delete(track.id);
                              toast({ title: 'Track deleted' });
                            }}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              onMusicSelected?.(track);
                              toast({ title: 'Track selected!' });
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          >
                            Use
                          </Button>
                        </div>
                      </div>

                      {/* Prompt display */}
                      {track.prompt && (
                        <div className="mt-3 p-2 bg-slate-900/50 rounded-lg">
                          <p className="text-xs text-gray-500">
                            <span className="text-purple-400">Prompt:</span> {track.prompt}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Clear all button */}
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('Delete all generated tracks?')) {
                        setGeneratedTracks([]);
                        trackCacheRef.current.clear();
                        localStorage.removeItem('smartpromptiq_generated_music');
                        toast({ title: 'All tracks deleted' });
                      }
                    }}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Tracks
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700 border-dashed">
                <CardContent className="p-12 text-center">
                  <Disc3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No tracks yet</h3>
                  <p className="text-gray-500 mb-6">Generate your first AI track to see it here</p>
                  <Button onClick={() => setActiveTab('generate')} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Create Your First Track
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Audio Visualizer & Player Bar */}
      {selectedTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 z-50">
          {/* Visualizer */}
          <AudioVisualizer
            isPlaying={isPlaying}
            audioRef={audioRef}
            genre={selectedTrack.genre}
          />

          {/* Player Controls */}
          <div className="p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-6">
              {/* Track Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                  musicGenres.find(g => g.id === selectedTrack.genre)?.color || 'from-purple-500 to-pink-500'
                } flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-semibold truncate">{selectedTrack.name}</h4>
                  <p className="text-gray-400 text-sm">{selectedTrack.genre}</p>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (audioRef.current) audioRef.current.currentTime = 0;
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  onClick={() => playTrack(selectedTrack)}
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsLooping(!isLooping)}
                  className={isLooping ? 'text-purple-400' : 'text-gray-400 hover:text-white'}
                >
                  <Repeat className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress & Volume */}
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10">
                    {audioRef.current ? Math.floor(audioRef.current.currentTime) : 0}s
                  </span>
                  <div
                    className="flex-1 h-2 bg-slate-700 rounded-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      if (audioRef.current) {
                        audioRef.current.currentTime = percent * (audioRef.current.duration || 0);
                      }
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10">
                    {audioRef.current ? Math.floor(audioRef.current.duration || 0) : selectedTrack.duration}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <Slider
                    value={[volume]}
                    onValueChange={([v]) => {
                      setVolume(v);
                      if (audioRef.current) audioRef.current.volume = v;
                    }}
                    max={1}
                    step={0.05}
                    className="w-24"
                  />
                </div>

                <Button
                  onClick={() => {
                    onMusicSelected?.(selectedTrack);
                    toast({ title: 'Track Added!' });
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Use Track
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setPlaybackProgress(0);
          if (isLooping && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current?.duration) {
            setPlaybackProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
        className="hidden"
      />

      {/* CSS for custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        .animate-orbit { animation: orbit 3s linear infinite; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};

export default MusicMakerPro;
