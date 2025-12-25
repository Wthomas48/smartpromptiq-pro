/**
 * SMARTPROMPTIQ - SUNO AI MUSIC BUILDER
 *
 * Prompt-to-Suno Workflow:
 * 1. Generate Suno-optimized song prompts (genre, mood, tempo, style, lyrics)
 * 2. Copy prompt with "Create Song in Suno" button
 * 3. User creates song in Suno.com
 * 4. Upload finished audio back to SmartPromptIQ
 * 5. Mix with intro/outro, voice, and export as video
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Music, Wand2, Copy, Check, ExternalLink, Upload, Download, Play, Pause,
  Sparkles, Zap, Heart, Volume2, VolumeX, Clock, RefreshCw, ChevronRight,
  ArrowRight, Mic, Radio, Headphones, AudioWaveform, Crown, Lock, Star,
  FileAudio, Music2, Layers, Video, Settings, Rocket, Brain, Loader2,
  CheckCircle2, Circle, Square, Trash2, PlusCircle, Share2, Save
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// SUNO MUSIC GENRES & STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const SUNO_GENRES = [
  { id: 'pop', name: 'Pop', emoji: '🎵', color: 'from-pink-500 to-rose-500', description: 'Catchy melodies, modern production' },
  { id: 'rock', name: 'Rock', emoji: '🎸', color: 'from-red-500 to-orange-500', description: 'Guitar-driven, energetic sound' },
  { id: 'hip-hop', name: 'Hip Hop', emoji: '🎤', color: 'from-purple-500 to-violet-500', description: 'Beats, rhythm, and flow' },
  { id: 'electronic', name: 'Electronic', emoji: '🎧', color: 'from-cyan-500 to-blue-500', description: 'Synths, drops, and EDM vibes' },
  { id: 'r&b', name: 'R&B / Soul', emoji: '💜', color: 'from-indigo-500 to-purple-500', description: 'Smooth vocals, groovy beats' },
  { id: 'country', name: 'Country', emoji: '🤠', color: 'from-amber-500 to-yellow-500', description: 'Acoustic, storytelling, twang' },
  { id: 'jazz', name: 'Jazz', emoji: '🎷', color: 'from-amber-600 to-orange-600', description: 'Improvisation, smooth tones' },
  { id: 'classical', name: 'Classical', emoji: '🎻', color: 'from-slate-500 to-gray-600', description: 'Orchestral, timeless elegance' },
  { id: 'folk', name: 'Folk / Acoustic', emoji: '🪕', color: 'from-green-500 to-emerald-500', description: 'Organic, storytelling vibes' },
  { id: 'reggae', name: 'Reggae', emoji: '🌴', color: 'from-green-400 to-yellow-500', description: 'Island rhythms, positive vibes' },
  { id: 'metal', name: 'Metal', emoji: '🤘', color: 'from-gray-700 to-black', description: 'Heavy, powerful, intense' },
  { id: 'indie', name: 'Indie', emoji: '🌙', color: 'from-teal-500 to-cyan-500', description: 'Alternative, artistic, unique' },
  { id: 'lo-fi', name: 'Lo-Fi', emoji: '📻', color: 'from-purple-400 to-pink-400', description: 'Chill beats, study vibes' },
  { id: 'cinematic', name: 'Cinematic', emoji: '🎬', color: 'from-orange-500 to-red-500', description: 'Epic, emotional, soundtrack-worthy' },
  { id: 'ambient', name: 'Ambient', emoji: '🌌', color: 'from-blue-400 to-indigo-500', description: 'Atmospheric, dreamy soundscapes' },
  { id: 'funk', name: 'Funk', emoji: '🕺', color: 'from-orange-400 to-pink-500', description: 'Groovy, bass-heavy, danceable' },
];

const SUNO_MOODS = [
  { id: 'happy', name: 'Happy & Uplifting', emoji: '😊', description: 'Joyful, positive energy' },
  { id: 'sad', name: 'Sad & Melancholic', emoji: '😢', description: 'Emotional, introspective' },
  { id: 'energetic', name: 'Energetic & Hype', emoji: '⚡', description: 'High energy, exciting' },
  { id: 'calm', name: 'Calm & Relaxing', emoji: '😌', description: 'Peaceful, soothing' },
  { id: 'romantic', name: 'Romantic & Sensual', emoji: '💕', description: 'Love songs, intimate' },
  { id: 'angry', name: 'Angry & Intense', emoji: '😤', description: 'Powerful, aggressive' },
  { id: 'mysterious', name: 'Mysterious & Dark', emoji: '🌑', description: 'Enigmatic, suspenseful' },
  { id: 'nostalgic', name: 'Nostalgic & Dreamy', emoji: '✨', description: 'Reminiscent, emotional' },
  { id: 'epic', name: 'Epic & Triumphant', emoji: '🏆', description: 'Victorious, grand' },
  { id: 'playful', name: 'Playful & Fun', emoji: '🎉', description: 'Lighthearted, whimsical' },
  { id: 'motivational', name: 'Motivational', emoji: '💪', description: 'Inspiring, empowering' },
  { id: 'chill', name: 'Chill & Laid-back', emoji: '🌊', description: 'Easy-going, mellow' },
];

const SUNO_TEMPOS = [
  { id: 'very-slow', name: 'Very Slow', bpm: '40-60', description: 'Ballad, ambient' },
  { id: 'slow', name: 'Slow', bpm: '60-80', description: 'Relaxed, emotional' },
  { id: 'moderate', name: 'Moderate', bpm: '80-100', description: 'Walking pace, chill' },
  { id: 'medium', name: 'Medium', bpm: '100-120', description: 'Standard pop tempo' },
  { id: 'upbeat', name: 'Upbeat', bpm: '120-140', description: 'Energetic, danceable' },
  { id: 'fast', name: 'Fast', bpm: '140-160', description: 'High energy, exciting' },
  { id: 'very-fast', name: 'Very Fast', bpm: '160+', description: 'Intense, driving' },
];

const SUNO_VOCALS = [
  { id: 'male', name: 'Male Vocals', emoji: '👨', description: 'Deep, rich male voice' },
  { id: 'female', name: 'Female Vocals', emoji: '👩', description: 'Smooth, expressive female voice' },
  { id: 'duet', name: 'Duet', emoji: '👫', description: 'Male and female together' },
  { id: 'choir', name: 'Choir / Group', emoji: '👥', description: 'Multiple voices, harmonies' },
  { id: 'instrumental', name: 'Instrumental', emoji: '🎹', description: 'No vocals, music only' },
  { id: 'rap', name: 'Rap / Spoken Word', emoji: '🎤', description: 'Rhythmic vocal delivery' },
];

const SONG_STRUCTURES = [
  { id: 'verse-chorus', name: 'Verse-Chorus', description: 'Standard pop structure' },
  { id: 'verse-chorus-bridge', name: 'Verse-Chorus-Bridge', description: 'With a bridge section' },
  { id: 'aaba', name: 'AABA', description: 'Classic song form' },
  { id: 'through-composed', name: 'Through-Composed', description: 'Continuous, no repeats' },
  { id: 'intro-verse-chorus', name: 'Intro-Verse-Chorus-Outro', description: 'Full structure with intro/outro' },
];

const CONTENT_TYPES = [
  { id: 'youtube-intro', name: 'YouTube Intro', duration: '10-15 sec', icon: <Play className="w-4 h-4" /> },
  { id: 'podcast-intro', name: 'Podcast Intro', duration: '15-30 sec', icon: <Mic className="w-4 h-4" /> },
  { id: 'brand-jingle', name: 'Brand Jingle', duration: '30 sec', icon: <Star className="w-4 h-4" /> },
  { id: 'full-song', name: 'Full Song', duration: '2-4 min', icon: <Music className="w-4 h-4" /> },
  { id: 'background-music', name: 'Background Music', duration: '1-3 min', icon: <Radio className="w-4 h-4" /> },
  { id: 'video-soundtrack', name: 'Video Soundtrack', duration: '1-5 min', icon: <Video className="w-4 h-4" /> },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT TEMPLATES FOR DIFFERENT USE CASES
// ═══════════════════════════════════════════════════════════════════════════════

const PROMPT_TEMPLATES = [
  {
    id: 'energetic-intro',
    name: 'Energetic YouTube Intro',
    genre: 'electronic',
    mood: 'energetic',
    tempo: 'upbeat',
    vocals: 'instrumental',
    description: 'High-energy intro perfect for YouTube videos',
    promptBase: 'Create an energetic, modern electronic track with punchy synths, driving beats, and an epic build-up. Perfect for a YouTube intro.',
  },
  {
    id: 'chill-podcast',
    name: 'Chill Podcast Background',
    genre: 'lo-fi',
    mood: 'calm',
    tempo: 'slow',
    vocals: 'instrumental',
    description: 'Relaxing lo-fi beats for podcast intros',
    promptBase: 'Create a chill, lo-fi hip hop track with warm vinyl crackle, mellow piano, and relaxed drums. Perfect for podcasts.',
  },
  {
    id: 'corporate-presentation',
    name: 'Corporate Presentation',
    genre: 'cinematic',
    mood: 'motivational',
    tempo: 'medium',
    vocals: 'instrumental',
    description: 'Professional music for business presentations',
    promptBase: 'Create an inspiring corporate track with uplifting strings, modern production, and a sense of progress and innovation.',
  },
  {
    id: 'brand-jingle',
    name: 'Catchy Brand Jingle',
    genre: 'pop',
    mood: 'happy',
    tempo: 'upbeat',
    vocals: 'female',
    description: 'Memorable jingle for brand recognition',
    promptBase: 'Create a catchy, memorable pop jingle with a singable hook. Bright, friendly, and perfect for advertising.',
  },
  {
    id: 'epic-trailer',
    name: 'Epic Trailer Music',
    genre: 'cinematic',
    mood: 'epic',
    tempo: 'medium',
    vocals: 'choir',
    description: 'Powerful music for trailers and promos',
    promptBase: 'Create an epic cinematic track with powerful orchestral hits, rising tension, and a triumphant climax. Trailer-worthy.',
  },
  {
    id: 'gaming-stream',
    name: 'Gaming Stream BGM',
    genre: 'electronic',
    mood: 'energetic',
    tempo: 'fast',
    vocals: 'instrumental',
    description: 'Upbeat electronic for gaming content',
    promptBase: 'Create an energetic gaming track with futuristic synths, pulsing bass, and dynamic drops. Perfect for streaming.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SunoMusicBuilder() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State for prompt generation
  const [selectedGenre, setSelectedGenre] = useState<string>('pop');
  const [selectedMood, setSelectedMood] = useState<string>('happy');
  const [selectedTempo, setSelectedTempo] = useState<string>('medium');
  const [selectedVocals, setSelectedVocals] = useState<string>('female');
  const [selectedStructure, setSelectedStructure] = useState<string>('verse-chorus');
  const [contentType, setContentType] = useState<string>('full-song');
  const [customLyrics, setCustomLyrics] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [songTitle, setSongTitle] = useState<string>('');
  const [songTheme, setSongTheme] = useState<string>('');
  const [includeLyrics, setIncludeLyrics] = useState<boolean>(true);

  // Generated prompt state
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedLyrics, setGeneratedLyrics] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);

  // Uploaded audio state
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Saved songs state
  const [savedSongs, setSavedSongs] = useState<Array<{
    id: string;
    title: string;
    prompt: string;
    audioUrl?: string;
    createdAt: Date;
    genre: string;
    mood: string;
  }>>([]);

  // Active tab
  const [activeTab, setActiveTab] = useState<string>('generate');

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOAD SAVED SONGS FROM BACKEND
  // ═══════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const loadSongs = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('sb-access-token');
        const response = await fetch('/api/suno/songs', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.songs && Array.isArray(data.songs)) {
            setSavedSongs(data.songs.map((s: any) => ({
              ...s,
              createdAt: new Date(s.createdAt),
            })));
          }
        }
      } catch (error) {
        console.warn('Failed to load songs from server:', error);
      }
    };

    loadSongs();
  }, [isAuthenticated, user]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // PROMPT GENERATION
  // ═══════════════════════════════════════════════════════════════════════════════

  const generateSunoPrompt = useCallback(() => {
    setIsGenerating(true);

    // Get selected values
    const genre = SUNO_GENRES.find(g => g.id === selectedGenre);
    const mood = SUNO_MOODS.find(m => m.id === selectedMood);
    const tempo = SUNO_TEMPOS.find(t => t.id === selectedTempo);
    const vocals = SUNO_VOCALS.find(v => v.id === selectedVocals);
    const content = CONTENT_TYPES.find(c => c.id === contentType);

    // Build the Suno-optimized prompt
    let prompt = `[Style: ${genre?.name || 'Pop'}]`;
    prompt += ` [Mood: ${mood?.name || 'Happy'}]`;
    prompt += ` [Tempo: ${tempo?.name || 'Medium'} (${tempo?.bpm || '100-120'} BPM)]`;

    if (vocals?.id !== 'instrumental') {
      prompt += ` [Vocals: ${vocals?.name || 'Female'}]`;
    } else {
      prompt += ` [Instrumental]`;
    }

    prompt += `\n\n`;

    // Add main description
    if (songTheme) {
      prompt += `Theme: ${songTheme}\n`;
    }

    prompt += `Create a ${mood?.description?.toLowerCase() || 'uplifting'} ${genre?.name?.toLowerCase() || 'pop'} track`;

    if (content) {
      prompt += ` perfect for ${content.name.toLowerCase()}`;
      if (content.duration) {
        prompt += ` (${content.duration})`;
      }
    }

    prompt += `. `;

    // Add genre-specific elements
    const genreElements: Record<string, string> = {
      'pop': 'catchy hooks, modern production, and memorable melodies',
      'rock': 'powerful guitar riffs, driving drums, and raw energy',
      'hip-hop': 'heavy 808s, crisp snares, and head-nodding rhythm',
      'electronic': 'pulsing synths, dynamic drops, and futuristic sounds',
      'r&b': 'smooth grooves, soulful harmonies, and warm bass',
      'country': 'acoustic guitars, storytelling lyrics, and authentic twang',
      'jazz': 'sophisticated harmonies, swinging rhythm, and improvisational feel',
      'classical': 'orchestral arrangement, dynamic expression, and timeless elegance',
      'folk': 'acoustic instruments, heartfelt lyrics, and organic sound',
      'reggae': 'offbeat rhythm, warm bass, and positive island vibes',
      'metal': 'heavy riffs, thundering drums, and intense power',
      'indie': 'unique textures, artistic production, and alternative sound',
      'lo-fi': 'warm vinyl crackle, mellow piano, and relaxed beats',
      'cinematic': 'epic orchestral swells, emotional dynamics, and soundtrack quality',
      'ambient': 'atmospheric textures, dreamy pads, and immersive soundscape',
      'funk': 'groovy basslines, rhythmic guitars, and danceable energy',
    };

    prompt += `Features ${genreElements[selectedGenre] || 'polished production and engaging sound'}. `;

    // Add custom instructions
    if (customInstructions) {
      prompt += `\n\nAdditional notes: ${customInstructions}`;
    }

    // Generate lyrics if requested
    let lyrics = '';
    if (includeLyrics && vocals?.id !== 'instrumental') {
      lyrics = generateLyrics(songTheme || 'life and dreams', mood?.name || 'happy', genre?.name || 'pop');
    }

    setTimeout(() => {
      setGeneratedPrompt(prompt);
      setGeneratedLyrics(lyrics);
      setIsGenerating(false);

      toast({
        title: "Prompt Generated!",
        description: "Your Suno-optimized prompt is ready. Click 'Create in Suno' to continue.",
      });
    }, 800);
  }, [selectedGenre, selectedMood, selectedTempo, selectedVocals, contentType, songTheme, customInstructions, includeLyrics, toast]);

  const generateLyrics = (theme: string, mood: string, genre: string): string => {
    // This would ideally call an AI API, but for now we'll generate a template
    const lyricsTemplate = `[Verse 1]
${theme ? `Thinking about ${theme.toLowerCase()}` : 'In the morning light I rise'}
Every moment ${mood.toLowerCase() === 'sad' ? 'fading' : 'shining'} bright
${genre.toLowerCase().includes('rock') ? 'The guitars scream out loud' : 'The melody takes flight'}
${mood.toLowerCase() === 'energetic' ? 'Energy rushing through the night' : 'Dancing in the spotlight'}

[Chorus]
This is ${songTitle || 'our moment'}
${mood.toLowerCase() === 'happy' ? 'Feel the joy inside' : 'Feel the emotions rise'}
${theme ? `${(theme || '').charAt(0).toUpperCase() + (theme || '').slice(1)} on my mind` : 'Taking it one step at a time'}
Let the music be our guide

[Verse 2]
${(mood || 'upbeat').toLowerCase() === 'calm' ? 'Softly' : 'Loudly'} we move along
Every beat, a ${(mood || 'upbeat').toLowerCase() === 'romantic' ? 'love' : 'power'} song
${(genre || 'pop').toLowerCase().includes('hip-hop') ? 'Spitting rhymes all night long' : 'Harmonies so strong'}
This is where we belong

[Chorus]
This is ${songTitle || 'our moment'}
${(mood || 'upbeat').toLowerCase() === 'happy' ? 'Feel the joy inside' : 'Feel the emotions rise'}
${theme ? `${(theme || '').charAt(0).toUpperCase() + (theme || '').slice(1)} on my mind` : 'Taking it one step at a time'}
Let the music be our guide

[Bridge]
${(mood || 'upbeat').toLowerCase() === 'epic' ? 'Rising up, we touch the sky' : 'In the silence, we find peace'}
${(mood || 'upbeat').toLowerCase() === 'mysterious' ? 'Shadows dance, the night is deep' : 'Every heart begins to beat'}
${(genre || 'pop').toLowerCase().includes('electronic') ? 'Synths ignite, we come alive' : 'Together we\'re complete'}

[Outro]
${songTitle || 'This is it'}... let it flow
${(mood || 'upbeat').toLowerCase() === 'motivational' ? 'Never stop, never slow' : 'Let the music grow'}
${theme ? (theme || '').charAt(0).toUpperCase() + (theme || '').slice(1) : 'Dreams'}... forever glow`;

    return lyricsTemplate;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // CLIPBOARD & SUNO REDIRECT
  // ═══════════════════════════════════════════════════════════════════════════════

  const copyPromptToClipboard = useCallback(async () => {
    const fullPrompt = generatedLyrics
      ? `${generatedPrompt}\n\n[LYRICS]\n${generatedLyrics}`
      : generatedPrompt;

    try {
      await navigator.clipboard.writeText(fullPrompt);
      setPromptCopied(true);
      toast({
        title: "Copied to Clipboard!",
        description: "Prompt is ready to paste into Suno.",
      });
      setTimeout(() => setPromptCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please select and copy the prompt manually.",
        variant: "destructive",
      });
    }
  }, [generatedPrompt, generatedLyrics, toast]);

  const openSunoWithPrompt = useCallback(async () => {
    // Copy to clipboard first
    await copyPromptToClipboard();

    // Open Suno in a new tab
    window.open('https://suno.com/create', '_blank');

    toast({
      title: "Opening Suno...",
      description: "Paste your prompt in Suno to create your song!",
    });
  }, [copyPromptToClipboard, toast]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // AUDIO UPLOAD & PLAYBACK
  // ═══════════════════════════════════════════════════════════════════════════════

  const handleAudioUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Create URL for playback
    const url = URL.createObjectURL(file);
    setUploadedAudio(file);
    setUploadedAudioUrl(url);

    toast({
      title: "Audio Uploaded!",
      description: `${file.name} is ready for mixing.`,
    });
  }, [toast]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setAudioProgress(progress);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current) return;
    const time = (value[0] / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setAudioProgress(value[0]);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // TEMPLATE APPLICATION
  // ═══════════════════════════════════════════════════════════════════════════════

  const applyTemplate = useCallback((template: typeof PROMPT_TEMPLATES[0]) => {
    setSelectedGenre(template.genre);
    setSelectedMood(template.mood);
    setSelectedTempo(template.tempo);
    setSelectedVocals(template.vocals);
    setSongTheme(template.description);

    toast({
      title: "Template Applied!",
      description: `${template.name} settings loaded.`,
    });
  }, [toast]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // SAVE SONG
  // ═══════════════════════════════════════════════════════════════════════════════

  const saveSong = useCallback(async () => {
    if (!generatedPrompt) {
      toast({
        title: "No Prompt",
        description: "Generate a prompt first before saving.",
        variant: "destructive",
      });
      return;
    }

    const newSong = {
      id: Date.now().toString(),
      title: songTitle || 'Untitled Song',
      prompt: generatedPrompt,
      lyrics: generatedLyrics || undefined,
      audioUrl: uploadedAudioUrl,
      createdAt: new Date(),
      genre: selectedGenre,
      mood: selectedMood,
      tempo: selectedTempo,
      vocals: selectedVocals,
      contentType: contentType,
    };

    // Save locally first
    setSavedSongs(prev => [newSong, ...prev]);

    // Try to save to backend if authenticated
    if (isAuthenticated && user) {
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('sb-access-token');
        const response = await fetch('/api/suno/songs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(newSong),
        });

        if (response.ok) {
          const data = await response.json();
          // Update the song with the server-generated ID
          if (data.song?.id) {
            setSavedSongs(prev => prev.map(s => s.id === newSong.id ? { ...s, id: data.song.id } : s));
          }
        }
      } catch (error) {
        console.warn('Failed to save to server, song saved locally:', error);
      }
    }

    toast({
      title: "Song Saved!",
      description: "Your song has been saved to your library.",
    });
  }, [generatedPrompt, generatedLyrics, songTitle, uploadedAudioUrl, selectedGenre, selectedMood, selectedTempo, selectedVocals, contentType, isAuthenticated, user, toast]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // NAVIGATION TO MIXER
  // ═══════════════════════════════════════════════════════════════════════════════

  const goToMixer = useCallback(() => {
    if (!uploadedAudioUrl) {
      toast({
        title: "No Audio",
        description: "Upload your Suno song first to continue to the mixer.",
        variant: "destructive",
      });
      return;
    }

    // Store audio URL in sessionStorage for the mixer
    sessionStorage.setItem('sunoAudioUrl', uploadedAudioUrl);
    sessionStorage.setItem('sunoSongTitle', songTitle || 'Suno Song');

    // Navigate to intro-outro builder
    setLocation('/intro-outro-builder');
  }, [uploadedAudioUrl, songTitle, setLocation, toast]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Music2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Suno AI Music Builder
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Generate Suno-optimized prompts, create your song in Suno, then bring it back here for professional mixing and video export.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { step: 1, title: 'Generate Prompt', icon: <Wand2 className="w-5 h-5" />, active: activeTab === 'generate' },
              { step: 2, title: 'Create in Suno', icon: <ExternalLink className="w-5 h-5" />, active: false },
              { step: 3, title: 'Upload Song', icon: <Upload className="w-5 h-5" />, active: activeTab === 'upload' },
              { step: 4, title: 'Mix & Export', icon: <Layers className="w-5 h-5" />, active: activeTab === 'mixer' },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  item.active
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-800/50 text-gray-400'
                }`}>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </span>
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </div>
                {index < 3 && (
                  <ChevronRight className="w-5 h-5 text-gray-600 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-lg mx-auto bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="generate" className="data-[state=active]:bg-purple-500">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-purple-500">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-purple-500">
              <Music className="w-4 h-4 mr-2" />
              Library
            </TabsTrigger>
          </TabsList>

          {/* GENERATE TAB */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Settings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Templates */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-purple-400" />
                      Quick Templates
                    </CardTitle>
                    <CardDescription>Start with a pre-configured style</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PROMPT_TEMPLATES.map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="h-auto py-3 flex flex-col items-start text-left border-gray-600 hover:border-purple-500 hover:bg-purple-500/10"
                          onClick={() => applyTemplate(template)}
                        >
                          <span className="font-medium text-white">{template.name}</span>
                          <span className="text-xs text-gray-400 mt-1">{template.description}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Song Details */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-pink-400" />
                      Song Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Song Title (Optional)</Label>
                        <Input
                          placeholder="My Awesome Song"
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          className="bg-gray-900/50 border-gray-600 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Theme / Topic</Label>
                        <Input
                          placeholder="Love, adventure, motivation..."
                          value={songTheme}
                          onChange={(e) => setSongTheme(e.target.value)}
                          className="bg-gray-900/50 border-gray-600 text-white mt-1"
                        />
                      </div>
                    </div>

                    {/* Content Type */}
                    <div>
                      <Label className="text-gray-300">Content Type</Label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                        {CONTENT_TYPES.map((type) => (
                          <Button
                            key={type.id}
                            variant={contentType === type.id ? "default" : "outline"}
                            className={`h-auto py-2 flex flex-col items-center gap-1 ${
                              contentType === type.id
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-gray-600 hover:border-purple-500'
                            }`}
                            onClick={() => setContentType(type.id)}
                          >
                            {type.icon}
                            <span className="text-xs">{type.name}</span>
                            <span className="text-xs text-gray-400">{type.duration}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Genre Selection */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Radio className="w-5 h-5 text-cyan-400" />
                      Genre
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {SUNO_GENRES.map((genre) => (
                        <Button
                          key={genre.id}
                          variant={selectedGenre === genre.id ? "default" : "outline"}
                          className={`h-auto py-2 flex flex-col items-center gap-1 ${
                            selectedGenre === genre.id
                              ? `bg-gradient-to-br ${genre.color}`
                              : 'border-gray-600 hover:border-purple-500'
                          }`}
                          onClick={() => setSelectedGenre(genre.id)}
                        >
                          <span className="text-lg">{genre.emoji}</span>
                          <span className="text-xs">{genre.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Mood Selection */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-400" />
                      Mood
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {SUNO_MOODS.map((mood) => (
                        <Button
                          key={mood.id}
                          variant={selectedMood === mood.id ? "default" : "outline"}
                          className={`h-auto py-2 flex flex-col items-center gap-1 ${
                            selectedMood === mood.id
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-600 hover:border-purple-500'
                          }`}
                          onClick={() => setSelectedMood(mood.id)}
                        >
                          <span className="text-lg">{mood.emoji}</span>
                          <span className="text-xs">{mood.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tempo & Vocals */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        Tempo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {SUNO_TEMPOS.map((tempo) => (
                          <Button
                            key={tempo.id}
                            variant={selectedTempo === tempo.id ? "default" : "outline"}
                            className={`h-auto py-2 flex flex-col items-start ${
                              selectedTempo === tempo.id
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-gray-600 hover:border-purple-500'
                            }`}
                            onClick={() => setSelectedTempo(tempo.id)}
                          >
                            <span className="text-sm font-medium">{tempo.name}</span>
                            <span className="text-xs text-gray-400">{tempo.bpm} BPM</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Mic className="w-5 h-5 text-green-400" />
                        Vocals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {SUNO_VOCALS.map((vocal) => (
                          <Button
                            key={vocal.id}
                            variant={selectedVocals === vocal.id ? "default" : "outline"}
                            className={`h-auto py-2 flex items-center gap-2 ${
                              selectedVocals === vocal.id
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-gray-600 hover:border-purple-500'
                            }`}
                            onClick={() => setSelectedVocals(vocal.id)}
                          >
                            <span className="text-lg">{vocal.emoji}</span>
                            <span className="text-sm">{vocal.name}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Custom Instructions */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-400" />
                      Custom Instructions (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add any specific requirements, instruments, or style notes..."
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white min-h-[80px]"
                    />
                    <div className="flex items-center gap-2 mt-4">
                      <Switch
                        checked={includeLyrics}
                        onCheckedChange={setIncludeLyrics}
                        disabled={selectedVocals === 'instrumental'}
                      />
                      <Label className="text-gray-300">Include AI-generated lyrics</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Generated Prompt */}
              <div className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700 sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Generated Prompt
                    </CardTitle>
                    <CardDescription>Copy this to Suno</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Generate Button */}
                    <Button
                      onClick={generateSunoPrompt}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Prompt
                        </>
                      )}
                    </Button>

                    {/* Prompt Display */}
                    {generatedPrompt && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                          <h4 className="text-sm font-medium text-purple-400 mb-2">Style Prompt:</h4>
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                            {generatedPrompt}
                          </pre>
                        </div>

                        {generatedLyrics && (
                          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                            <h4 className="text-sm font-medium text-pink-400 mb-2">Suggested Lyrics:</h4>
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                              {generatedLyrics}
                            </pre>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Button
                            onClick={copyPromptToClipboard}
                            variant="outline"
                            className="w-full border-gray-600 hover:border-purple-500"
                          >
                            {promptCopied ? (
                              <>
                                <Check className="w-4 h-4 mr-2 text-green-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Prompt
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={openSunoWithPrompt}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Create Song in Suno
                          </Button>

                          <Button
                            onClick={saveSong}
                            variant="outline"
                            className="w-full border-gray-600 hover:border-purple-500"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save to Library
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {!generatedPrompt && (
                      <div className="text-center py-8 text-gray-500">
                        <Music2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Configure your song settings and click "Generate Prompt"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* UPLOAD TAB */}
          <TabsContent value="upload" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-white flex items-center justify-center gap-2">
                    <Upload className="w-6 h-6 text-green-400" />
                    Upload Your Suno Song
                  </CardTitle>
                  <CardDescription>
                    After creating your song in Suno, download it and upload here for mixing and video export.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                    {uploadedAudio ? (
                      <div className="space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                        <p className="text-white font-medium">{uploadedAudio.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(uploadedAudio.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedAudio(null);
                            setUploadedAudioUrl('');
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <FileAudio className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-white font-medium">Click to upload audio</p>
                        <p className="text-gray-400 text-sm mt-1">MP3, WAV, M4A supported</p>
                      </>
                    )}
                  </div>

                  {/* Audio Player */}
                  {uploadedAudioUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-900/50 rounded-xl p-6 border border-gray-600"
                    >
                      <audio
                        ref={audioRef}
                        src={uploadedAudioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                      />

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={togglePlayback}
                          size="icon"
                          className="bg-purple-500 hover:bg-purple-600 rounded-full w-12 h-12"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                          )}
                        </Button>

                        <div className="flex-1">
                          <Slider
                            value={[audioProgress]}
                            max={100}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{formatTime((audioProgress / 100) * audioDuration)}</span>
                            <span>{formatTime(audioDuration)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Next Steps */}
                  {uploadedAudioUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <Button
                        onClick={goToMixer}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Layers className="w-4 h-4 mr-2" />
                        Continue to Mixer
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-center text-gray-400 text-sm">
                        Add intros, outros, voiceovers, and create video exports
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="bg-gray-800/50 border-gray-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Download your Suno song in the highest quality available
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Generate multiple versions in Suno and pick the best one
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Use our mixer to add professional intros and outros
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Export as video with visualizations for social media
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LIBRARY TAB */}
          <TabsContent value="library" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    Your Song Library
                  </CardTitle>
                  <CardDescription>
                    Saved prompts and uploaded songs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedSongs.length > 0 ? (
                    <div className="space-y-3">
                      {savedSongs.map((song) => (
                        <div
                          key={song.id}
                          className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 flex items-center gap-4"
                        >
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Music2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{song.title}</h4>
                            <p className="text-gray-400 text-sm">
                              {SUNO_GENRES.find(g => g.id === song.genre)?.name} • {SUNO_MOODS.find(m => m.id === song.mood)?.name}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {song.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600"
                              onClick={() => {
                                setGeneratedPrompt(song.prompt);
                                setActiveTab('generate');
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {song.audioUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600"
                                onClick={() => {
                                  setUploadedAudioUrl(song.audioUrl!);
                                  setActiveTab('upload');
                                }}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Music2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No songs yet</p>
                      <p className="text-sm mt-1">Generate prompts and save them to your library</p>
                      <Button
                        onClick={() => setActiveTab('generate')}
                        className="mt-4 bg-purple-500 hover:bg-purple-600"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Your First Song
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    step: 1,
                    title: 'Generate Prompt',
                    description: 'Configure genre, mood, tempo, and more. We create a Suno-optimized prompt for you.',
                    icon: <Wand2 className="w-6 h-6" />,
                    color: 'from-purple-500 to-indigo-500',
                  },
                  {
                    step: 2,
                    title: 'Create in Suno',
                    description: 'Click "Create in Suno" to copy your prompt and open Suno.com. Paste and generate!',
                    icon: <ExternalLink className="w-6 h-6" />,
                    color: 'from-orange-500 to-red-500',
                  },
                  {
                    step: 3,
                    title: 'Upload Song',
                    description: 'Download your finished song from Suno and upload it back here.',
                    icon: <Upload className="w-6 h-6" />,
                    color: 'from-green-500 to-emerald-500',
                  },
                  {
                    step: 4,
                    title: 'Mix & Export',
                    description: 'Add intros, outros, voiceovers. Export as audio or create a video!',
                    icon: <Video className="w-6 h-6" />,
                    color: 'from-pink-500 to-rose-500',
                  },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}>
                      {item.icon}
                    </div>
                    <h4 className="text-white font-bold mb-2">
                      Step {item.step}: {item.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
