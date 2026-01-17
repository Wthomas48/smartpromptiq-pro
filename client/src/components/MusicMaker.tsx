import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import {
  Music, Play, Pause, Square, Download, Sparkles, Loader2,
  Volume2, Clock, Zap, RefreshCw, Wand2, Radio, Headphones,
  Heart, Rocket, Star, Crown, Lock, ChevronRight, Check,
  Shuffle, SkipBack, SkipForward, Repeat, Share2, Copy,
  Layers, Mic2, Piano, Drum, Guitar, AudioWaveform,
  ListMusic, Plus, Trash2, Save, FolderOpen, Settings2,
  TrendingUp, Award, Flame, Target, Music2, Music3, Music4
} from 'lucide-react';

// ==========================================
// WEB AUDIO API - REAL SOUND GENERATOR
// ==========================================

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Sound effect synthesizer
const playSoundEffect = (type: string, category: string) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create gain node for volume control
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);

  switch (category) {
    case 'notification':
      playNotificationSound(ctx, gainNode, type, now);
      break;
    case 'ui':
      playUISound(ctx, gainNode, type, now);
      break;
    case 'transitions':
      playTransitionSound(ctx, gainNode, type, now);
      break;
    case 'achievements':
      playAchievementSound(ctx, gainNode, type, now);
      break;
    case 'ambient':
      playAmbientSound(ctx, gainNode, type, now);
      break;
    case 'scifi':
      playSciFiSound(ctx, gainNode, type, now);
      break;
    case 'retro':
      playRetroSound(ctx, gainNode, type, now);
      break;
    default:
      playNotificationSound(ctx, gainNode, 'Ding', now);
  }
};

// Notification sounds
const playNotificationSound = (ctx: AudioContext, gainNode: GainNode, type: string, now: number) => {
  const osc = ctx.createOscillator();
  osc.connect(gainNode);
  gainNode.gain.setValueAtTime(0.3, now);

  switch (type) {
    case 'Ding':
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'Chime':
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case 'Pop':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    case 'Whoosh':
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      noise.start(now);
      noise.stop(now + 0.3);
      return;
    case 'Success':
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      osc.frequency.setValueAtTime(1047, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    default:
      osc.frequency.setValueAtTime(800, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
  }
};

// UI sounds
const playUISound = (ctx: AudioContext, gainNode: GainNode, type: string, now: number) => {
  const osc = ctx.createOscillator();
  osc.connect(gainNode);
  gainNode.gain.setValueAtTime(0.2, now);

  switch (type) {
    case 'Click':
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      break;
    case 'Tap':
      osc.frequency.setValueAtTime(600, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
      break;
    case 'Toggle':
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      break;
    case 'Error':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(150, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      break;
    default:
      osc.frequency.setValueAtTime(800, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  }
  osc.start(now);
  osc.stop(now + 0.2);
};

// Transition sounds
const playTransitionSound = (ctx: AudioContext, gainNode: GainNode, type: string, now: number) => {
  const osc = ctx.createOscillator();
  osc.connect(gainNode);
  gainNode.gain.setValueAtTime(0.25, now);

  switch (type) {
    case 'Swoosh':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      break;
    case 'Slide':
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      break;
    case 'Zoom':
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      break;
    default:
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  }
  osc.start(now);
  osc.stop(now + 0.3);
};

// Achievement sounds
const playAchievementSound = (ctx: AudioContext, gainNode: GainNode, type: string, now: number) => {
  gainNode.gain.setValueAtTime(0.3, now);

  const playNote = (freq: number, time: number, duration: number) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.connect(noteGain);
    noteGain.connect(gainNode);
    osc.frequency.setValueAtTime(freq, time);
    noteGain.gain.setValueAtTime(0.3, time);
    noteGain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    osc.start(time);
    osc.stop(time + duration);
  };

  switch (type) {
    case 'Fanfare':
      playNote(523, now, 0.15);
      playNote(659, now + 0.15, 0.15);
      playNote(784, now + 0.3, 0.15);
      playNote(1047, now + 0.45, 0.3);
      break;
    case 'Level Up':
      playNote(440, now, 0.1);
      playNote(554, now + 0.1, 0.1);
      playNote(659, now + 0.2, 0.1);
      playNote(880, now + 0.3, 0.2);
      break;
    case 'Coins':
      playNote(1200, now, 0.05);
      playNote(1400, now + 0.07, 0.05);
      playNote(1600, now + 0.14, 0.1);
      break;
    case 'Victory':
      playNote(392, now, 0.2);
      playNote(523, now + 0.2, 0.2);
      playNote(659, now + 0.4, 0.2);
      playNote(784, now + 0.6, 0.4);
      break;
    default:
      playNote(880, now, 0.1);
      playNote(1100, now + 0.1, 0.2);
  }
};

// Ambient sounds (simplified)
const playAmbientSound = (ctx: AudioContext, gainNode: GainNode, type: string, now: number) => {
  gainNode.gain.setValueAtTime(0.15, now);

  if (type === 'Rain' || type === 'Wind' || type === 'Ocean') {
    // White/pink noise for ambient
    const bufferSize = ctx.sampleRate * 1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'Wind' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(type === 'Rain' ? 3000 : 500, now);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
    noise.start(now);
    noise.stop(now + 1);
  } else {
    // Simple tone for others
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.connect(gainNode);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  }
};

// Sci-Fi sounds
const playSciFiSound = (ctx: AudioContext, gainNode: GainNode, type: string, now: number) => {
  const osc = ctx.createOscillator();
  osc.connect(gainNode);
  gainNode.gain.setValueAtTime(0.25, now);

  switch (type) {
    case 'Laser':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      break;
    case 'Warp':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      break;
    case 'Beep':
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.setValueAtTime(0, now + 0.1);
      gainNode.gain.setValueAtTime(0.2, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      break;
    case 'Power Up':
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      break;
    default:
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  }
  osc.start(now);
  osc.stop(now + 0.6);
};

// Retro gaming sounds
const playRetroSound = (ctx: AudioContext, gainNode: GainNode, type: string, now: number) => {
  const osc = ctx.createOscillator();
  osc.type = 'square'; // Classic 8-bit sound
  osc.connect(gainNode);
  gainNode.gain.setValueAtTime(0.2, now);

  switch (type) {
    case '8-bit Jump':
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      break;
    case 'Coin':
      osc.frequency.setValueAtTime(988, now);
      osc.frequency.setValueAtTime(1319, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      break;
    case 'Power-up':
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(300, now + 0.05);
      osc.frequency.setValueAtTime(400, now + 0.1);
      osc.frequency.setValueAtTime(600, now + 0.15);
      osc.frequency.setValueAtTime(800, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      break;
    case 'Game Over':
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(300, now + 0.2);
      osc.frequency.setValueAtTime(200, now + 0.4);
      osc.frequency.setValueAtTime(100, now + 0.6);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      break;
    case '1-Up':
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(392, now + 0.08);
      osc.frequency.setValueAtTime(523, now + 0.16);
      osc.frequency.setValueAtTime(392, now + 0.24);
      osc.frequency.setValueAtTime(523, now + 0.32);
      osc.frequency.setValueAtTime(698, now + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      break;
    default:
      osc.frequency.setValueAtTime(440, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  }
  osc.start(now);
  osc.stop(now + 1);
};

// ==========================================
// 🎵 ENHANCED MUSIC TRACK SYNTHESIZER 🎵
// Generates procedural music with rich harmonics!
// ==========================================
const playMusicTrack = (genre: string, bpm: number = 120) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.35, now);

  const beatDuration = 60 / bpm;

  // Play a note with harmonics for richer sound
  const playNote = (freq: number, time: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.type = type;
    osc.connect(noteGain);
    noteGain.connect(masterGain);
    osc.frequency.setValueAtTime(freq, time);
    noteGain.gain.setValueAtTime(volume, time);
    noteGain.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.9);
    osc.start(time);
    osc.stop(time + duration);
  };

  // Play bass note
  const playBass = (freq: number, time: number, duration: number) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(noteGain);
    noteGain.connect(masterGain);
    osc.frequency.setValueAtTime(freq / 2, time); // Octave down
    noteGain.gain.setValueAtTime(0.25, time);
    noteGain.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.7);
    osc.start(time);
    osc.stop(time + duration);
  };

  // Play kick drum
  const playKick = (time: number) => {
    const osc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    osc.connect(kickGain);
    kickGain.connect(masterGain);
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
    kickGain.gain.setValueAtTime(0.4, time);
    kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.start(time);
    osc.stop(time + 0.15);
  };

  // Play hi-hat
  const playHiHat = (time: number, open: boolean = false) => {
    const bufferSize = ctx.sampleRate * (open ? 0.15 : 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);
    const hatGain = ctx.createGain();
    noise.connect(filter);
    filter.connect(hatGain);
    hatGain.connect(masterGain);
    hatGain.gain.setValueAtTime(0.15, time);
    hatGain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.15 : 0.05));
    noise.start(time);
    noise.stop(time + (open ? 0.15 : 0.05));
  };

  // Genre-specific melodies with RICHER arrangements
  const melodies: Record<string, { notes: number[], bass: number[], type: OscillatorType, intensity: number }> = {
    upbeat: { notes: [523, 659, 784, 880, 784, 659, 523, 659, 784, 880, 1047, 880, 784, 659, 523, 659], bass: [131, 131, 165, 165, 175, 175, 196, 196], type: 'sawtooth', intensity: 85 },
    calm: { notes: [262, 330, 392, 330, 262, 220, 262, 330, 294, 349, 392, 349, 330, 294, 262, 330], bass: [65, 65, 73, 73, 82, 82, 87, 87], type: 'sine', intensity: 25 },
    corporate: { notes: [440, 523, 659, 523, 440, 392, 440, 523, 587, 659, 784, 659, 587, 523, 440, 523], bass: [110, 110, 131, 131, 147, 147, 165, 165], type: 'triangle', intensity: 55 },
    cinematic: { notes: [220, 294, 349, 440, 523, 440, 349, 294, 262, 349, 440, 523, 659, 523, 440, 349], bass: [55, 55, 73, 73, 87, 87, 110, 110], type: 'sine', intensity: 90 },
    electronic: { notes: [330, 440, 554, 659, 554, 440, 330, 440, 392, 523, 659, 784, 659, 523, 392, 523], bass: [82, 82, 110, 110, 98, 98, 131, 131], type: 'sawtooth', intensity: 80 },
    lofi: { notes: [294, 349, 440, 392, 349, 294, 330, 392, 349, 440, 392, 349, 330, 294, 262, 294], bass: [73, 73, 87, 87, 82, 82, 73, 73], type: 'triangle', intensity: 35 },
    epic: { notes: [146, 196, 220, 262, 294, 349, 392, 440, 523, 587, 659, 784, 880, 784, 659, 523], bass: [36, 36, 49, 49, 55, 55, 73, 73], type: 'sawtooth', intensity: 95 },
    inspirational: { notes: [392, 440, 523, 587, 659, 587, 523, 440, 523, 587, 659, 784, 880, 784, 659, 587], bass: [98, 98, 110, 110, 131, 131, 147, 147], type: 'triangle', intensity: 70 },
    tropical: { notes: [349, 440, 523, 587, 523, 440, 349, 392, 440, 523, 587, 659, 587, 523, 440, 392], bass: [87, 87, 110, 110, 98, 98, 87, 87], type: 'sine', intensity: 65 },
    hiphop: { notes: [294, 330, 392, 440, 392, 330, 294, 330, 349, 392, 440, 523, 440, 392, 349, 330], bass: [73, 73, 98, 98, 82, 82, 73, 73], type: 'square', intensity: 70 },
  };

  const { notes, bass, type, intensity } = melodies[genre] || melodies.upbeat;

  // Play full arrangement
  notes.forEach((freq, i) => {
    const time = now + i * beatDuration;

    // Main melody
    playNote(freq, time, beatDuration * 0.8, type, 0.18);

    // Harmony (3rd above)
    if (intensity > 50) {
      playNote(freq * 1.25, time, beatDuration * 0.7, 'sine', 0.08);
    }

    // Bass line
    if (i < bass.length) {
      playBass(bass[i % bass.length], time, beatDuration * 1.5);
    }

    // Drums for energetic genres
    if (intensity > 40) {
      if (i % 4 === 0) playKick(time);
      if (i % 2 === 1) playHiHat(time);
      if (i % 4 === 2) playHiHat(time, true);
    }
  });

  // Fade out master
  masterGain.gain.exponentialRampToValueAtTime(0.01, now + notes.length * beatDuration + 0.5);

  return notes.length * beatDuration; // Return duration
};

// ==========================================
// END AUDIO FUNCTIONS
// ==========================================

// Music genres/moods - EXPANDED PREMIUM COLLECTION!
const musicGenres = [
  { id: 'upbeat', name: 'Upbeat & Energetic', icon: Zap, color: 'from-orange-500 to-red-500', description: 'High energy tracks for exciting content', tags: ['energetic', 'motivational', 'action'] },
  { id: 'calm', name: 'Calm & Relaxing', icon: Heart, color: 'from-teal-400 to-cyan-500', description: 'Peaceful music for wellness & meditation', tags: ['relaxing', 'peaceful', 'ambient'] },
  { id: 'corporate', name: 'Corporate & Professional', icon: Rocket, color: 'from-blue-500 to-indigo-500', description: 'Business presentations & demos', tags: ['professional', 'corporate', 'business'] },
  { id: 'cinematic', name: 'Cinematic & Epic', icon: Star, color: 'from-purple-500 to-pink-500', description: 'Movie trailer style dramatic music', tags: ['epic', 'dramatic', 'cinematic'] },
  { id: 'electronic', name: 'Electronic & Modern', icon: Radio, color: 'from-violet-500 to-purple-600', description: 'Tech-focused electronic beats', tags: ['electronic', 'tech', 'modern'] },
  { id: 'lofi', name: 'Lo-Fi & Chill', icon: Headphones, color: 'from-amber-500 to-orange-500', description: 'Relaxed beats for focus & study', tags: ['chill', 'study', 'focus'] },
  { id: 'inspirational', name: 'Inspirational', icon: Sparkles, color: 'from-yellow-400 to-amber-500', description: 'Motivational & uplifting music', tags: ['motivation', 'uplifting', 'positive'] },
  { id: 'epic', name: 'Epic & Powerful', icon: Flame, color: 'from-red-500 to-orange-600', description: 'Grand orchestral & powerful themes', tags: ['epic', 'powerful', 'orchestral'] },
  { id: 'tropical', name: 'Tropical & Summer', icon: Music, color: 'from-green-400 to-teal-500', description: 'Beach vibes & tropical house', tags: ['summer', 'beach', 'vacation'] },
  { id: 'hiphop', name: 'Hip-Hop & Urban', icon: Target, color: 'from-slate-600 to-slate-800', description: 'Modern hip-hop beats & rhythms', tags: ['urban', 'beat', 'rap'] },
];

// ==========================================
// 🎵 PREMIUM MUSIC LIBRARY - 25+ MIND-BLOWING TRACKS! 🎵
// ==========================================
const premadeTracks = [
  // ========== ⚡ UPBEAT & ENERGETIC (5 tracks) ==========
  { id: 'rise-and-shine', name: 'Rise & Shine', genre: 'upbeat', duration: 180, description: 'Start your day with unstoppable energy!', premium: false, audioUrl: '', plays: 15420, likes: 3850, featured: true, trending: true },
  { id: 'victory-lap', name: 'Victory Lap', genre: 'upbeat', duration: 150, description: 'Champion\'s anthem for achievement celebration!', premium: false, audioUrl: '', plays: 12300, likes: 2980 },
  { id: 'unstoppable-force', name: 'Unstoppable Force', genre: 'upbeat', duration: 120, description: 'Pure adrenaline rush for action-packed content!', premium: true, audioUrl: '', plays: 8900, likes: 2100 },
  { id: 'power-surge', name: 'Power Surge', genre: 'upbeat', duration: 90, description: 'Electric energy that gets hearts pumping!', premium: false, audioUrl: '', plays: 9500, likes: 2200 },
  { id: 'maximum-velocity', name: 'Maximum Velocity', genre: 'upbeat', duration: 120, description: 'Full throttle energy for extreme content!', premium: true, audioUrl: '', plays: 7800, likes: 1900 },

  // ========== 🌊 CALM & RELAXING (5 tracks) ==========
  { id: 'ocean-breeze', name: 'Ocean Breeze', genre: 'calm', duration: 240, description: 'Gentle waves of tranquility for meditation.', premium: false, audioUrl: '', plays: 18500, likes: 4200, featured: true },
  { id: 'forest-dawn', name: 'Forest Dawn', genre: 'calm', duration: 300, description: 'Wake up in a magical forest with morning sunlight.', premium: false, audioUrl: '', plays: 14200, likes: 3600 },
  { id: 'zen-garden', name: 'Zen Garden', genre: 'calm', duration: 360, description: 'Japanese-inspired ambient for deep focus.', premium: true, audioUrl: '', plays: 9800, likes: 2400 },
  { id: 'starlit-dreams', name: 'Starlit Dreams', genre: 'calm', duration: 280, description: 'Drift through the cosmos on a bed of clouds.', premium: false, audioUrl: '', plays: 11200, likes: 2800 },
  { id: 'crystal-waters', name: 'Crystal Waters', genre: 'calm', duration: 320, description: 'Pure serenity flowing through mountain streams.', premium: true, audioUrl: '', plays: 8600, likes: 2100 },

  // ========== 💼 CORPORATE & PROFESSIONAL (4 tracks) ==========
  { id: 'innovation-drive', name: 'Innovation Drive', genre: 'corporate', duration: 180, description: 'Modern tech company vibes for presentations.', premium: false, audioUrl: '', plays: 22100, likes: 5100, featured: true, trending: true },
  { id: 'success-story', name: 'Success Story', genre: 'corporate', duration: 150, description: 'Inspiring corporate narrative music.', premium: false, audioUrl: '', plays: 16800, likes: 3900 },
  { id: 'future-vision', name: 'Future Vision', genre: 'corporate', duration: 180, description: 'Forward-thinking tech innovation soundtrack.', premium: true, audioUrl: '', plays: 11200, likes: 2700 },
  { id: 'boardroom-excellence', name: 'Boardroom Excellence', genre: 'corporate', duration: 150, description: 'Executive-level professionalism & confidence.', premium: false, audioUrl: '', plays: 9400, likes: 2300 },

  // ========== 🎬 CINEMATIC & EPIC (4 tracks) ==========
  { id: 'epic-journey', name: 'Epic Journey', genre: 'cinematic', duration: 240, description: 'Grand adventure theme for trailers & intros.', premium: false, audioUrl: '', plays: 19800, likes: 4800, featured: true },
  { id: 'dramatic-rise', name: 'Dramatic Rise', genre: 'cinematic', duration: 180, description: 'Building tension with explosive release!', premium: true, audioUrl: '', plays: 13500, likes: 3200 },
  { id: 'heroes-anthem', name: 'Heroes Anthem', genre: 'epic', duration: 210, description: 'Triumphant hero theme for epic moments.', premium: true, audioUrl: '', plays: 10200, likes: 2500 },
  { id: 'dawn-of-legends', name: 'Dawn of Legends', genre: 'cinematic', duration: 200, description: 'The beginning of an unforgettable story.', premium: false, audioUrl: '', plays: 11800, likes: 2900 },

  // ========== 🎧 ELECTRONIC & MODERN (4 tracks) ==========
  { id: 'digital-dreams', name: 'Digital Dreams', genre: 'electronic', duration: 180, description: 'Futuristic synthwave for tech content.', premium: false, audioUrl: '', plays: 17600, likes: 4100, trending: true },
  { id: 'cyber-wave', name: 'Cyber Wave', genre: 'electronic', duration: 150, description: 'Cyberpunk aesthetic for gaming content.', premium: true, audioUrl: '', plays: 11800, likes: 2900 },
  { id: 'neon-nights', name: 'Neon Nights', genre: 'electronic', duration: 180, description: 'Festival-ready EDM banger!', premium: true, audioUrl: '', plays: 14100, likes: 3400 },
  { id: 'binary-sunset', name: 'Binary Sunset', genre: 'electronic', duration: 160, description: 'Retro-futuristic synthwave odyssey.', premium: false, audioUrl: '', plays: 9200, likes: 2200 },

  // ========== ☕ LO-FI & CHILL (4 tracks) ==========
  { id: 'study-session', name: 'Study Session', genre: 'lofi', duration: 300, description: 'Chill lo-fi beats for focus & productivity.', premium: false, audioUrl: '', plays: 28500, likes: 6800, featured: true },
  { id: 'late-night-coding', name: 'Late Night Coding', genre: 'lofi', duration: 360, description: 'Perfect companion for late night work sessions.', premium: false, audioUrl: '', plays: 21300, likes: 5200 },
  { id: 'coffee-shop-vibes', name: 'Coffee Shop Vibes', genre: 'lofi', duration: 240, description: 'Warm coffee shop atmosphere with jazzy lo-fi.', premium: true, audioUrl: '', plays: 16700, likes: 4000 },
  { id: 'rainy-afternoon', name: 'Rainy Afternoon', genre: 'lofi', duration: 280, description: 'Cozy lo-fi for a rainy day at home.', premium: false, audioUrl: '', plays: 13400, likes: 3200 },

  // ========== ✨ INSPIRATIONAL (3 tracks) ==========
  { id: 'new-beginnings', name: 'New Beginnings', genre: 'inspirational', duration: 180, description: 'Fresh start energy for motivational content.', premium: false, audioUrl: '', plays: 19200, likes: 4500 },
  { id: 'dream-big', name: 'Dream Big', genre: 'inspirational', duration: 210, description: 'Chase your dreams with this uplifting anthem.', premium: true, audioUrl: '', plays: 13900, likes: 3300 },
  { id: 'limitless', name: 'Limitless', genre: 'inspirational', duration: 180, description: 'Break through barriers with limitless energy.', premium: true, audioUrl: '', plays: 11500, likes: 2800 },

  // ========== 🌴 TROPICAL & SUMMER (3 tracks) ==========
  { id: 'island-paradise', name: 'Island Paradise', genre: 'tropical', duration: 180, description: 'Tropical house vibes for summer content.', premium: false, audioUrl: '', plays: 15600, likes: 3700 },
  { id: 'sunset-cruise', name: 'Sunset Cruise', genre: 'tropical', duration: 210, description: 'Golden hour vibes sailing into the sunset.', premium: true, audioUrl: '', plays: 10800, likes: 2600 },
  { id: 'beach-party', name: 'Beach Party', genre: 'tropical', duration: 180, description: 'Summer party anthem with tropical beats!', premium: false, audioUrl: '', plays: 12100, likes: 2900 },

  // ========== 🎹 HIP-HOP & URBAN (3 tracks) ==========
  { id: 'urban-vibes', name: 'Urban Vibes', genre: 'hiphop', duration: 180, description: 'Modern hip-hop beat for urban content.', premium: false, audioUrl: '', plays: 14800, likes: 3500 },
  { id: 'street-anthem', name: 'Street Anthem', genre: 'hiphop', duration: 180, description: 'Hard-hitting hip-hop for bold statements.', premium: true, audioUrl: '', plays: 12100, likes: 2900 },
  { id: 'night-rider', name: 'Night Rider', genre: 'hiphop', duration: 150, description: 'Slick midnight cruising beat.', premium: false, audioUrl: '', plays: 9800, likes: 2400 },
];

// Sound effects categories - expanded
const soundEffects = [
  { id: 'notification', name: 'Notifications', icon: '🔔', sounds: ['Ding', 'Chime', 'Pop', 'Whoosh', 'Success', 'Alert', 'Ping', 'Bell'] },
  { id: 'ui', name: 'UI Sounds', icon: '📱', sounds: ['Click', 'Tap', 'Swipe', 'Toggle', 'Error', 'Hover', 'Select', 'Deselect'] },
  { id: 'transitions', name: 'Transitions', icon: '🎬', sounds: ['Swoosh', 'Fade', 'Reveal', 'Slide', 'Zoom', 'Wipe', 'Flip', 'Morph'] },
  { id: 'achievements', name: 'Achievements', icon: '🏆', sounds: ['Fanfare', 'Level Up', 'Unlock', 'Coins', 'Stars', 'Victory', 'Bonus', 'Jackpot'] },
  { id: 'ambient', name: 'Ambient', icon: '🌿', sounds: ['Rain', 'Wind', 'Fire', 'Water', 'Birds', 'Ocean', 'Thunder', 'Forest'] },
  { id: 'voice', name: 'Voice Cues', icon: '🎤', sounds: ['Welcome', 'Goodbye', 'Error', 'Success', 'Loading', 'Ready', 'Complete', 'Start'] },
  { id: 'scifi', name: 'Sci-Fi', icon: '🚀', sounds: ['Laser', 'Warp', 'Scan', 'Beep', 'Power Up', 'Shield', 'Portal', 'Glitch'] },
  { id: 'retro', name: 'Retro Gaming', icon: '👾', sounds: ['8-bit Jump', 'Coin', 'Power-up', 'Game Over', '1-Up', 'Hit', 'Warp Pipe', 'Boss'] },
];

// Trending/Popular tracks - UPDATED WITH REAL PREMIUM TRACKS!
const trendingTracks = [
  { id: 'study-session', name: 'Study Session', plays: 28500, likes: 6800, badge: '🔥 HOT', color: 'from-amber-500 to-orange-500' },
  { id: 'innovation-drive', name: 'Innovation Drive', plays: 22100, likes: 5100, badge: '📈 TRENDING', color: 'from-blue-500 to-indigo-500' },
  { id: 'epic-journey', name: 'Epic Journey', plays: 19800, likes: 4800, badge: '⭐ TOP RATED', color: 'from-purple-500 to-pink-500' },
  { id: 'digital-dreams', name: 'Digital Dreams', plays: 17600, likes: 4100, badge: '🎧 FEATURED', color: 'from-violet-500 to-purple-600' },
  { id: 'rise-and-shine', name: 'Rise & Shine', plays: 15420, likes: 3850, badge: '💪 POPULAR', color: 'from-orange-500 to-red-500' },
];

// Instrument layers for beat maker
const instrumentLayers = [
  { id: 'drums', name: 'Drums', icon: Drum, color: 'from-red-500 to-orange-500', patterns: ['Basic', 'Funky', 'Electronic', 'Hip-Hop', 'Rock'] },
  { id: 'bass', name: 'Bass', icon: Guitar, color: 'from-purple-500 to-indigo-500', patterns: ['Simple', 'Walking', 'Slap', 'Sub', 'Synth'] },
  { id: 'piano', name: 'Keys', icon: Piano, color: 'from-blue-500 to-cyan-500', patterns: ['Chords', 'Arpeggios', 'Pads', 'Lead', 'Stabs'] },
  { id: 'melody', name: 'Melody', icon: Music, color: 'from-teal-500 to-green-500', patterns: ['Simple', 'Complex', 'Uplifting', 'Melancholic', 'Energetic'] },
];

// Quick mood presets
const moodPresets = [
  { id: 'happy', name: 'Happy & Bright', emoji: '😊', bpm: 120, key: 'C Major', energy: 80 },
  { id: 'chill', name: 'Chill & Relaxed', emoji: '😌', bpm: 85, key: 'F Major', energy: 40 },
  { id: 'epic', name: 'Epic & Powerful', emoji: '🔥', bpm: 140, key: 'D Minor', energy: 95 },
  { id: 'mysterious', name: 'Mysterious', emoji: '🌙', bpm: 90, key: 'E Minor', energy: 50 },
  { id: 'romantic', name: 'Romantic', emoji: '💕', bpm: 70, key: 'G Major', energy: 35 },
  { id: 'action', name: 'Action Packed', emoji: '⚡', bpm: 160, key: 'A Minor', energy: 100 },
];

interface MusicMakerProps {
  // For integration with other components
  onMusicSelected?: (track: any) => void;
  compact?: boolean;
  defaultGenre?: string;
  context?: 'app' | 'voice' | 'lesson' | 'standalone';
}

const MusicMaker: React.FC<MusicMakerProps> = ({
  onMusicSelected,
  compact = false,
  defaultGenre,
  context = 'standalone',
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<'browse' | 'generate' | 'beatmaker' | 'effects' | 'mixer'>('browse');
  const [selectedGenre, setSelectedGenre] = useState(defaultGenre || '');
  const [selectedTrack, setSelectedTrack] = useState<typeof premadeTracks[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [bpm, setBpm] = useState(120);
  const [activeLayers, setActiveLayers] = useState<string[]>(['drums', 'bass']);
  const [layerVolumes, setLayerVolumes] = useState<Record<string, number>>({ drums: 80, bass: 70, piano: 60, melody: 75 });
  const [myPlaylist, setMyPlaylist] = useState<string[]>([]);
  const [showWaveform, setShowWaveform] = useState(true);
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  // NEW: AI Music Generation State
  const [generatedTracks, setGeneratedTracks] = useState<Array<{
    id: string;
    name: string;
    audioUrl: string;
    genre: string;
    duration: number;
    isAiGenerated: boolean;
  }>>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [withVocals, setWithVocals] = useState(false);
  const [customLyrics, setCustomLyrics] = useState('');
  const [musicDuration, setMusicDuration] = useState(60);
  const [musicPurpose, setMusicPurpose] = useState<'app_background' | 'intro_jingle' | 'full_track'>('full_track');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sampleTracks, setSampleTracks] = useState<any[]>([]);

  // Audio ref for playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Load sample tracks on mount
  useEffect(() => {
    const loadSamples = async () => {
      try {
        const response = await fetch('/api/music/samples');
        if (response.ok) {
          const data = await response.json();
          setSampleTracks(data.samples || []);
        }
      } catch (error) {
        console.log('Could not load sample tracks');
      }
    };
    loadSamples();
  }, []);

  // Filter tracks by genre
  const filteredTracks = selectedGenre
    ? premadeTracks.filter(t => t.genre === selectedGenre)
    : premadeTracks;

  // Simulated waveform animation
  useEffect(() => {
    if (isPlaying && selectedTrack) {
      progressInterval.current = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            if (isLooping) return 0;
            setIsPlaying(false);
            return 0;
          }
          return prev + (100 / (selectedTrack.duration * 10));
        });
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, selectedTrack, isLooping]);

  // Toggle like
  const toggleLike = useCallback((trackId: string) => {
    setLikedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
    toast({ title: likedTracks.includes(trackId) ? 'Removed from favorites' : 'Added to favorites!' });
  }, [likedTracks, toast]);

  // Add to playlist
  const addToPlaylist = useCallback((trackId: string) => {
    if (!myPlaylist.includes(trackId)) {
      setMyPlaylist(prev => [...prev, trackId]);
      toast({ title: 'Added to playlist!', description: 'Track added to your playlist.' });
    }
  }, [myPlaylist, toast]);

  // Toggle layer
  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  }, []);

  // Play/pause track - REAL AUDIO PLAYBACK!
  const togglePlay = useCallback((track: typeof premadeTracks[0]) => {
    if (selectedTrack?.id === track.id && isPlaying) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Play new track with REAL audio
      setSelectedTrack(track);
      setPlaybackProgress(0);

      // Use the track's audioUrl for real music playback
      if (track.audioUrl && audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setCurrentAudioUrl(track.audioUrl);
            toast({
              title: `Now Playing: ${track.name}`,
              description: `${track.duration}s • ${track.genre} • Real Audio`,
            });
          })
          .catch((err) => {
            console.error('Audio playback failed:', err);
            toast({
              title: 'Playback Error',
              description: 'Could not play audio. Click again to retry.',
              variant: 'destructive',
            });
          });
      } else {
        // Fallback to synthesizer if no audioUrl
        playMusicTrack(track.genre, 120);
        setIsPlaying(true);
        toast({
          title: `Now Playing: ${track.name}`,
          description: `${track.duration}s • ${track.genre}`,
        });
      }
    }
  }, [selectedTrack, isPlaying, volume, toast]);

  // Select track for use
  const selectTrack = useCallback((track: typeof premadeTracks[0]) => {
    if (track.premium && !(user as any)?.isPremium && !(user as any)?.tier?.includes('pro')) {
      toast({
        title: 'Premium Track',
        description: 'Upgrade to access premium music tracks.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedTrack(track);
    onMusicSelected?.(track);
    toast({
      title: 'Track Selected!',
      description: `"${track.name}" ready to use.`,
    });
  }, [user, onMusicSelected, toast]);

  // Generate custom music - REAL AI MUSIC GENERATION!
  const generateMusic = useCallback(async () => {
    if (!generationPrompt.trim()) {
      toast({
        title: 'Describe Your Music',
        description: 'Enter a description of the music you want to create.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress while generating
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt: generationPrompt,
          genre: selectedGenre || 'upbeat',
          duration: musicDuration,
          withVocals,
          customLyrics: withVocals ? customLyrics : undefined,
          purpose: musicPurpose,
          mood: selectedMood,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Generation failed');
      }

      setGenerationProgress(100);

      // Add to generated tracks
      if (data.audioUrl) {
        const newTrack = {
          id: data.trackId || `gen-${Date.now()}`,
          name: data.title || (generationPrompt || 'Generated Track').substring(0, 30),
          audioUrl: data.audioUrl,
          genre: selectedGenre || 'upbeat',
          duration: data.duration || musicDuration,
          isAiGenerated: true,
        };

        setGeneratedTracks(prev => [newTrack, ...prev]);
        setCurrentAudioUrl(data.audioUrl);

        // Auto-play the generated track
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }

        toast({
          title: '🎵 Music Generated!',
          description: `"${newTrack.name}" is ready! ${data.tokensUsed || 0} tokens used.`,
        });
      }

    } catch (error: any) {
      console.error('Music generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate music. Please try again.',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [generationPrompt, selectedGenre, musicDuration, withVocals, customLyrics, musicPurpose, selectedMood, toast]);

  // Play audio from URL
  const playAudioUrl = useCallback((url: string) => {
    if (audioRef.current) {
      if (currentAudioUrl === url && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
        setCurrentAudioUrl(url);
        setIsPlaying(true);
      }
    }
  }, [currentAudioUrl, isPlaying]);

  // Compact mode for inline use
  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm">Add Background Music</h4>
              <p className="text-gray-400 text-xs">Select from library or generate custom</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/voice-builder?tab=music')}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Music className="w-4 h-4 mr-1" />
              Browse
            </Button>
          </div>

          {selectedTrack && (
            <div className="mt-3 p-2 bg-slate-800/50 rounded-lg flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => togglePlay(selectedTrack)}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1">
                <div className="text-white text-sm">{selectedTrack.name}</div>
                <div className="text-gray-500 text-xs">{selectedTrack.duration}s</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
          <Music className="w-3 h-3 mr-1" /> Quick Audio Library
        </Badge>
        <h2 className="text-3xl font-bold text-white mb-4">
          Quick Audio & <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Sound Effects</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Instant background music, jingles, and sound effects for your apps and content.
          Browse our library or generate custom tracks - no API needed.
        </p>
      </div>

      {/* Trending Section */}
      <div className="flex justify-center gap-3 flex-wrap mb-4">
        {trendingTracks.map((track) => (
          <div
            key={track.id}
            className={`px-4 py-2 rounded-full bg-gradient-to-r ${track.color} flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform`}
          >
            <Badge className="bg-black/30 text-white text-[10px]">{track.badge}</Badge>
            <span className="text-white text-sm font-medium">{track.name}</span>
            <span className="text-white/70 text-xs flex items-center gap-1">
              <Play className="w-3 h-3" /> {(track.plays / 1000).toFixed(1)}k
            </span>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button
          variant={activeTab === 'browse' ? 'default' : 'outline'}
          onClick={() => setActiveTab('browse')}
          className={activeTab === 'browse' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'border-slate-600 text-gray-300'}
        >
          <Headphones className="w-4 h-4 mr-2" />
          Browse
        </Button>
        <Button
          variant={activeTab === 'generate' ? 'default' : 'outline'}
          onClick={() => setActiveTab('generate')}
          className={activeTab === 'generate' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'border-slate-600 text-gray-300'}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          AI Generate
        </Button>
        <Button
          variant={activeTab === 'beatmaker' ? 'default' : 'outline'}
          onClick={() => setActiveTab('beatmaker')}
          className={activeTab === 'beatmaker' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'border-slate-600 text-gray-300'}
        >
          <Drum className="w-4 h-4 mr-2" />
          Beat Maker
        </Button>
        <Button
          variant={activeTab === 'mixer' ? 'default' : 'outline'}
          onClick={() => setActiveTab('mixer')}
          className={activeTab === 'mixer' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'border-slate-600 text-gray-300'}
        >
          <Layers className="w-4 h-4 mr-2" />
          Mixer
        </Button>
        <Button
          variant={activeTab === 'effects' ? 'default' : 'outline'}
          onClick={() => setActiveTab('effects')}
          className={activeTab === 'effects' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'border-slate-600 text-gray-300'}
        >
          <Zap className="w-4 h-4 mr-2" />
          Effects
        </Button>
      </div>

      {/* Browse Library Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Genre Filter */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedGenre('')}
              className={`p-3 rounded-xl text-center transition-all ${
                !selectedGenre
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg'
                  : 'bg-slate-800/50 border border-slate-700 hover:border-purple-500/50'
              }`}
            >
              <Music className="w-5 h-5 mx-auto mb-1 text-white" />
              <div className="text-white text-sm font-medium">All</div>
            </button>
            {musicGenres.map((genre) => {
              const Icon = genre.icon;
              return (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedGenre === genre.id
                      ? `bg-gradient-to-br ${genre.color} shadow-lg`
                      : 'bg-slate-800/50 border border-slate-700 hover:border-purple-500/50'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1 text-white" />
                  <div className="text-white text-xs font-medium">{genre.name.split(' ')[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Track List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTracks.map((track) => {
              const genre = musicGenres.find(g => g.id === track.genre);
              const isSelected = selectedTrack?.id === track.id;

              return (
                <Card
                  key={track.id}
                  className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => togglePlay(track)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected && isPlaying
                            ? 'bg-purple-500 animate-pulse'
                            : `bg-gradient-to-br ${genre?.color || 'from-gray-500 to-gray-600'}`
                        }`}
                      >
                        {isSelected && isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium truncate">{track.name}</h4>
                          {track.premium && (
                            <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">{track.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{track.duration}s</span>
                          <span>•</span>
                          <span className="capitalize">{track.genre}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleLike(track.id)}
                        className={`p-2 ${likedTracks.includes(track.id) ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        <Heart className={`w-4 h-4 ${likedTracks.includes(track.id) ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addToPlaylist(track.id)}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePlay(track)}
                        className="flex-1 border-slate-600 text-gray-300"
                      >
                        {isSelected && isPlaying ? 'Pause' : 'Preview'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => selectTrack(track)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                        disabled={track.premium && !(user as any)?.isPremium && !(user as any)?.tier?.includes('pro')}
                      >
                        {track.premium && !(user as any)?.isPremium && !(user as any)?.tier?.includes('pro') ? (
                          <><Lock className="w-3 h-3 mr-1" /> Premium</>
                        ) : (
                          <><Check className="w-3 h-3 mr-1" /> Select</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Generate Tab - PROFESSIONAL AI MUSIC STUDIO */}
      {activeTab === 'generate' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-purple-300 text-sm font-medium">Powered by Suno AI</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              AI Music <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Studio</span>
            </h2>
            <p className="text-gray-400">Create studio-quality, royalty-free music with AI in seconds</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Generation Form */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  Describe Your Music
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  placeholder="Describe your perfect track...

Example prompts:
• 'Upbeat corporate video music with piano and light drums'
• 'Epic cinematic trailer music with orchestral swells'
• 'Chill lo-fi beats for a study session'
• 'Energetic EDM drop for app intro'"
                  className="min-h-[140px] bg-slate-900/50 border-slate-600 text-white resize-none"
                />

                {/* Genre Selection */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Genre / Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {musicGenres.map((genre) => {
                      const Icon = genre.icon;
                      return (
                        <button
                          key={genre.id}
                          onClick={() => setSelectedGenre(genre.id)}
                          className={`p-2 rounded-lg text-center transition-all ${
                            selectedGenre === genre.id
                              ? `bg-gradient-to-r ${genre.color} shadow-lg`
                              : 'bg-slate-900/50 border border-slate-700 hover:border-purple-500/50'
                          }`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1 text-white" />
                          <div className="text-white text-xs">{genre.name.split(' ')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration & Purpose */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Duration</label>
                    <Select value={musicDuration.toString()} onValueChange={(v) => setMusicDuration(parseInt(v))}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15s - Jingle</SelectItem>
                        <SelectItem value="30">30s - Short</SelectItem>
                        <SelectItem value="60">60s - Standard</SelectItem>
                        <SelectItem value="120">2min - Extended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Purpose</label>
                    <Select value={musicPurpose} onValueChange={(v: any) => setMusicPurpose(v)}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app_background">App Background</SelectItem>
                        <SelectItem value="intro_jingle">Intro Jingle</SelectItem>
                        <SelectItem value="full_track">Full Track</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Vocals Toggle */}
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mic2 className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white text-sm font-medium">Add AI Vocals</div>
                        <div className="text-gray-500 text-xs">Generate music with singing</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setWithVocals(!withVocals)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        withVocals ? 'bg-purple-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                        withVocals ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {withVocals && (
                    <div className="mt-3">
                      <Textarea
                        value={customLyrics}
                        onChange={(e) => setCustomLyrics(e.target.value)}
                        placeholder="Enter custom lyrics (optional)..."
                        className="min-h-[60px] bg-slate-800 border-slate-600 text-white text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Generation Progress */}
                {isGenerating && (
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center animate-pulse">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Generating your music...</div>
                        <div className="text-purple-300 text-sm">AI is composing your track</div>
                      </div>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                    <div className="text-center text-xs text-gray-400 mt-2">{Math.round(generationProgress)}% complete</div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={generateMusic}
                  disabled={isGenerating || !generationPrompt.trim()}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Music...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Music
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~30 seconds
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 75-100 tokens
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Generated Tracks & Samples */}
            <div className="space-y-4">
              {/* Generated Tracks */}
              {generatedTracks.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-400" />
                      Your Generated Tracks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedTracks.slice(0, 5).map((track) => (
                      <div
                        key={track.id}
                        className="p-3 bg-slate-900/50 rounded-lg flex items-center gap-3 hover:bg-slate-900 transition-all"
                      >
                        <Button
                          size="sm"
                          onClick={() => playAudioUrl(track.audioUrl)}
                          className={`h-10 w-10 rounded-full ${
                            currentAudioUrl === track.audioUrl && isPlaying
                              ? 'bg-pink-500'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                        >
                          {currentAudioUrl === track.audioUrl && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{track.name}</div>
                          <div className="text-gray-500 text-xs">{track.duration}s • AI Generated</div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-gray-400">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Sample Tracks */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-cyan-400" />
                    Sample Library
                  </CardTitle>
                  <CardDescription>High-quality royalty-free samples</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sampleTracks.length > 0 ? (
                    sampleTracks.map((track) => (
                      <div
                        key={track.id}
                        className="p-3 bg-slate-900/50 rounded-lg flex items-center gap-3 hover:bg-slate-900 transition-all cursor-pointer"
                        onClick={() => playAudioUrl(track.audioUrl)}
                      >
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${
                          musicGenres.find(g => g.id === track.genre)?.color || 'from-purple-500 to-pink-500'
                        } flex items-center justify-center`}>
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{track.name}</div>
                          <div className="text-gray-500 text-xs capitalize">{track.genre} • {track.duration}s</div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 text-xs">Free</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Loading sample library...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Token Info */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Token Usage</div>
                      <div className="text-gray-400 text-sm">
                        Instrumental: 75 tokens | With Vocals: 100 tokens
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Hidden audio element for REAL music playback */}
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
              if (audioRef.current && audioRef.current.duration) {
                const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                setPlaybackProgress(progress);
              }
            }}
            onLoadStart={() => console.log('Loading audio...')}
            onCanPlay={() => console.log('Audio ready to play!')}
            onError={(e) => {
              console.error('Audio error:', e);
              toast({
                title: 'Audio Error',
                description: 'Failed to load audio file.',
                variant: 'destructive',
              });
            }}
            className="hidden"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Beat Maker Tab */}
      {activeTab === 'beatmaker' && (
        <div className="space-y-6">
          {/* Mood Presets */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-4">Quick Mood Presets</h3>
            <div className="flex justify-center gap-3 flex-wrap">
              {moodPresets.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => {
                    setSelectedMood(mood.id);
                    setBpm(mood.bpm);
                    toast({ title: `${mood.emoji} ${mood.name}`, description: `BPM: ${mood.bpm} | Key: ${mood.key}` });
                  }}
                  className={`px-4 py-3 rounded-xl transition-all hover:scale-105 ${
                    selectedMood === mood.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg'
                      : 'bg-slate-800/50 border border-slate-700 hover:border-orange-500/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-white text-sm font-medium">{mood.name}</div>
                  <div className="text-gray-400 text-xs">{mood.bpm} BPM</div>
                </button>
              ))}
            </div>
          </div>

          {/* BPM Control */}
          <Card className="bg-slate-800/50 border-slate-700 max-w-xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Drum className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Tempo Control</h4>
                    <p className="text-gray-400 text-sm">Adjust the beats per minute</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">{bpm}</div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBpm(Math.max(60, bpm - 10))}
                  className="border-slate-600 text-gray-300"
                >
                  -10
                </Button>
                <Slider
                  value={[bpm]}
                  onValueChange={([v]) => setBpm(v)}
                  min={60}
                  max={180}
                  step={1}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBpm(Math.min(180, bpm + 10))}
                  className="border-slate-600 text-gray-300"
                >
                  +10
                </Button>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>60 (Slow)</span>
                <span>120 (Medium)</span>
                <span>180 (Fast)</span>
              </div>
            </CardContent>
          </Card>

          {/* Instrument Layers */}
          <div>
            <h3 className="text-white font-semibold text-center mb-4">Instrument Layers</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {instrumentLayers.map((layer) => {
                const Icon = layer.icon;
                const isActive = activeLayers.includes(layer.id);
                return (
                  <Card
                    key={layer.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isActive
                        ? `bg-gradient-to-br ${layer.color} border-transparent shadow-lg`
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20' : `bg-gradient-to-br ${layer.color}`
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{layer.name}</h4>
                          <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                            {isActive ? 'Active' : 'Click to add'}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-white/70 mb-1">
                            <span>Volume</span>
                            <span>{layerVolumes[layer.id]}%</span>
                          </div>
                          <Slider
                            value={[layerVolumes[layer.id]]}
                            onValueChange={([v]) => setLayerVolumes(prev => ({ ...prev, [layer.id]: v }))}
                            max={100}
                            step={5}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Generate Beat Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => {
                // Play beat based on selected mood and BPM
                const mood = selectedMood || 'upbeat';
                playMusicTrack(mood, bpm);
                toast({
                  title: 'Beat Generated!',
                  description: `${activeLayers.length} layers at ${bpm} BPM - Playing now!`,
                });
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 px-8"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Beat
            </Button>
          </div>
        </div>
      )}

      {/* Mixer Tab */}
      {activeTab === 'mixer' && (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Audio Mixer
              </CardTitle>
              <CardDescription>
                Mix multiple tracks together, adjust volumes, and create the perfect blend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Volume */}
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-6 h-6 text-cyan-400" />
                    <span className="text-white font-semibold">Master Volume</span>
                  </div>
                  <span className="text-cyan-400 font-mono text-lg">{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  max={1}
                  step={0.01}
                />
              </div>

              {/* Track Channels */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Track Channels</h4>
                {myPlaylist.length > 0 ? (
                  myPlaylist.map((trackId, index) => {
                    const track = premadeTracks.find(t => t.id === trackId);
                    if (!track) return null;
                    return (
                      <div key={trackId} className="p-4 bg-slate-900/50 rounded-lg flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{track.name}</div>
                          <div className="text-gray-400 text-sm">{track.genre}</div>
                        </div>
                        <Slider
                          value={[75]}
                          max={100}
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMyPlaylist(prev => prev.filter(id => id !== trackId))}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-slate-700 rounded-xl">
                    <ListMusic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No tracks added yet</p>
                    <p className="text-gray-500 text-sm">Browse the library and add tracks to your mixer</p>
                  </div>
                )}
              </div>

              {/* Mixer Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="border-slate-600 text-gray-300 flex-col h-20">
                  <Shuffle className="w-5 h-5 mb-1" />
                  <span className="text-xs">Shuffle</span>
                </Button>
                <Button variant="outline" className="border-slate-600 text-gray-300 flex-col h-20">
                  <Repeat className="w-5 h-5 mb-1" />
                  <span className="text-xs">Loop All</span>
                </Button>
                <Button variant="outline" className="border-slate-600 text-gray-300 flex-col h-20">
                  <Save className="w-5 h-5 mb-1" />
                  <span className="text-xs">Save Mix</span>
                </Button>
                <Button variant="outline" className="border-slate-600 text-gray-300 flex-col h-20">
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs">Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visual Waveform (simulated) */}
          <Card className="bg-slate-800/50 border-slate-700 max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Waveform Preview</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowWaveform(!showWaveform)}
                  className="text-gray-400"
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </div>
              {showWaveform && (
                <div className="h-24 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="flex items-center gap-1 h-full py-4">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full transition-all ${
                          isPlaying ? 'animate-pulse' : ''
                        }`}
                        style={{
                          height: `${20 + Math.random() * 60}%`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sound Effects Tab */}
      {activeTab === 'effects' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {soundEffects.map((category) => (
              <Card key={category.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.sounds.map((sound, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Play actual sound using Web Audio API
                          playSoundEffect(sound, category.id);
                          toast({
                            title: `${category.icon} Playing: ${sound}`,
                            description: 'Sound effect preview',
                          });
                        }}
                        className="border-slate-600 text-gray-300 hover:bg-purple-500/20 hover:border-purple-500/50 text-xs"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {sound}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sound Effect Packs */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-4">Sound Effect Packs</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              <Card className="bg-slate-800/50 border-slate-700 w-64 hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🎮</div>
                  <h4 className="text-white font-medium">Gaming Pack</h4>
                  <p className="text-gray-400 text-sm">50+ game sounds</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-300">Free</Badge>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 w-64 hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <h4 className="text-white font-medium">Mobile App Pack</h4>
                  <p className="text-gray-400 text-sm">100+ UI sounds</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-300">Free</Badge>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 w-64 hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🎬</div>
                  <h4 className="text-white font-medium">Cinematic Pack</h4>
                  <p className="text-gray-400 text-sm">75+ dramatic sounds</p>
                  <Badge className="mt-2 bg-purple-500/20 text-purple-300">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 w-64 hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <h4 className="text-white font-medium">Sci-Fi Pack</h4>
                  <p className="text-gray-400 text-sm">60+ futuristic sounds</p>
                  <Badge className="mt-2 bg-purple-500/20 text-purple-300">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL AUDIO ELEMENT - Always present for real music playback */}
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
          if (audioRef.current && audioRef.current.duration) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setPlaybackProgress(progress);
          }
        }}
        onLoadStart={() => console.log('Loading audio...')}
        onCanPlay={() => console.log('Audio ready to play!')}
        onError={(e) => console.error('Audio error:', e)}
        className="hidden"
      />

      {/* Selected Track Player - Enhanced */}
      {selectedTrack && (
        <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-slate-900/95 border-purple-500/50 backdrop-blur-lg z-50 shadow-2xl shadow-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Album Art Placeholder */}
              <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${
                musicGenres.find(g => g.id === selectedTrack.genre)?.color || 'from-purple-500 to-pink-500'
              } flex items-center justify-center flex-shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
                <Music className="w-8 h-8 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Track Info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold truncate">{selectedTrack.name}</h4>
                    <p className="text-gray-400 text-sm truncate">{selectedTrack.description}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleLike(selectedTrack.id)}
                      className={likedTracks.includes(selectedTrack.id) ? 'text-red-500' : 'text-gray-400'}
                    >
                      <Heart className={`w-4 h-4 ${likedTracks.includes(selectedTrack.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addToPlaylist(selectedTrack.id)}
                      className="text-gray-400"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar - CLICKABLE FOR SEEKING */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-8">
                    {audioRef.current ? Math.floor(audioRef.current.currentTime) : Math.floor((playbackProgress / 100) * selectedTrack.duration)}s
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = ((e.clientX - rect.left) / rect.width) * 100;
                      setPlaybackProgress(percent);
                      // Seek audio to this position
                      if (audioRef.current && audioRef.current.duration) {
                        audioRef.current.currentTime = (percent / 100) * audioRef.current.duration;
                      }
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">
                    {audioRef.current && audioRef.current.duration ? Math.floor(audioRef.current.duration) : selectedTrack.duration}s
                  </span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={isShuffle ? 'text-purple-400' : 'text-gray-400'}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPlaybackProgress(0)}
                  className="text-gray-400"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => togglePlay(selectedTrack)}
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPlaybackProgress(100)}
                  className="text-gray-400"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsLooping(!isLooping)}
                  className={isLooping ? 'text-purple-400' : 'text-gray-400'}
                >
                  <Repeat className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume & Actions */}
              <div className="flex items-center gap-3 flex-shrink-0 border-l border-slate-700 pl-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <Slider
                    value={[volume]}
                    onValueChange={([v]) => {
                      setVolume(v);
                      // Update audio volume in real-time
                      if (audioRef.current) {
                        audioRef.current.volume = v;
                      }
                    }}
                    max={1}
                    step={0.05}
                    className="w-20"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-gray-300">
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onMusicSelected?.(selectedTrack);
                    toast({ title: 'Music Added!', description: `"${selectedTrack.name}" added to your project.` });
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Use Track
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MusicMaker;
