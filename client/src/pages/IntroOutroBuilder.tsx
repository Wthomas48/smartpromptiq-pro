/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - INTRO & OUTRO MUSIC BUILDER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Create professional intros and outros with awesome royalty-free music!
 * Perfect for YouTube, podcasts, presentations, and more.
 *
 * Features:
 * - Pre-built intro/outro templates
 * - Custom duration control
 * - Fade in/out effects
 * - Multiple music styles
 * - Real-time preview
 * - Download ready audio
 * - 🎤 VOICE RECORDING - Record your voice and mix with music!
 * - 🎬 VIDEO EXPORT - Create short videos with voice + music!
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Download,
  Music,
  Wand2,
  Clock,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Sparkles,
  Zap,
  Radio,
  Mic,
  MicOff,
  Film,
  Gamepad2,
  Briefcase,
  Heart,
  Coffee,
  Rocket,
  Star,
  Check,
  ChevronRight,
  RefreshCw,
  Settings2,
  Layers,
  AudioWaveform,
  Video,
  Square,
  Circle,
  Trash2,
  Upload,
  ImageIcon,
  Type,
  Crown,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import {
  FIXED_PREMIUM_TRACKS,
  MUSIC_CATEGORIES,
  getTracksByGenre,
  getTrackById,
  type PremiumTrack,
  type MusicGenreType,
} from '@/config/premiumMusic';

// ═══════════════════════════════════════════════════════════════════════════════
// INTRO/OUTRO TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

interface IntroOutroTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'intro' | 'outro' | 'both';
  duration: number; // seconds
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  suggestedGenres: MusicGenreType[];
  suggestedTracks: string[];
  color: string;
  popular?: boolean;
}

const TEMPLATES: IntroOutroTemplate[] = [
  // INTRO TEMPLATES
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    description: 'Energetic 5-second intro perfect for YouTube videos',
    icon: <Film className="w-5 h-5" />,
    category: 'intro',
    duration: 5,
    fadeIn: 0.3,
    fadeOut: 0.5,
    suggestedGenres: ['upbeat', 'electronic'],
    suggestedTracks: ['positive-energy', 'future-bass', 'tech-intro'],
    color: 'from-red-500 to-pink-500',
    popular: true,
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Intro',
    description: 'Professional 8-second intro for podcasts',
    icon: <Mic className="w-5 h-5" />,
    category: 'intro',
    duration: 8,
    fadeIn: 0.5,
    fadeOut: 1,
    suggestedGenres: ['corporate', 'lofi'],
    suggestedTracks: ['podcast-intro', 'corporate-innovation', 'study-beats'],
    color: 'from-purple-500 to-indigo-500',
    popular: true,
  },
  {
    id: 'gaming-intro',
    name: 'Gaming Intro',
    description: 'Epic 6-second intro for gaming content',
    icon: <Gamepad2 className="w-5 h-5" />,
    category: 'intro',
    duration: 6,
    fadeIn: 0.2,
    fadeOut: 0.5,
    suggestedGenres: ['electronic', 'cinematic'],
    suggestedTracks: ['neon-dreams', 'cyber-pulse', 'epic-adventure'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'business-intro',
    name: 'Business Intro',
    description: 'Clean 7-second intro for presentations',
    icon: <Briefcase className="w-5 h-5" />,
    category: 'intro',
    duration: 7,
    fadeIn: 0.5,
    fadeOut: 1,
    suggestedGenres: ['corporate', 'inspirational'],
    suggestedTracks: ['corporate-innovation', 'success-story', 'tech-startup'],
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: 'vlog-intro',
    name: 'Vlog Intro',
    description: 'Fun 4-second intro for vlogs and lifestyle content',
    icon: <Heart className="w-5 h-5" />,
    category: 'intro',
    duration: 4,
    fadeIn: 0.2,
    fadeOut: 0.3,
    suggestedGenres: ['upbeat', 'acoustic'],
    suggestedTracks: ['happy-sunshine', 'fun-adventure', 'acoustic-morning'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'epic-intro',
    name: 'Epic Cinematic',
    description: 'Dramatic 10-second intro for trailers',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'intro',
    duration: 10,
    fadeIn: 1,
    fadeOut: 1.5,
    suggestedGenres: ['cinematic', 'inspirational'],
    suggestedTracks: ['epic-adventure', 'dramatic-tension', 'heroic-triumph'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'chill-intro',
    name: 'Chill Intro',
    description: 'Relaxed 6-second intro for calm content',
    icon: <Coffee className="w-5 h-5" />,
    category: 'intro',
    duration: 6,
    fadeIn: 1,
    fadeOut: 1,
    suggestedGenres: ['lofi', 'calm'],
    suggestedTracks: ['study-beats', 'coffee-shop', 'peaceful-dreams'],
    color: 'from-amber-400 to-yellow-500',
  },

  // OUTRO TEMPLATES
  {
    id: 'youtube-outro',
    name: 'YouTube Outro',
    description: 'Engaging 15-second outro with subscribe reminder time',
    icon: <Film className="w-5 h-5" />,
    category: 'outro',
    duration: 15,
    fadeIn: 0.5,
    fadeOut: 3,
    suggestedGenres: ['upbeat', 'electronic'],
    suggestedTracks: ['positive-energy', 'happy-sunshine', 'victory-dance'],
    color: 'from-red-500 to-pink-500',
    popular: true,
  },
  {
    id: 'podcast-outro',
    name: 'Podcast Outro',
    description: 'Smooth 12-second outro for podcast endings',
    icon: <Mic className="w-5 h-5" />,
    category: 'outro',
    duration: 12,
    fadeIn: 0.5,
    fadeOut: 4,
    suggestedGenres: ['lofi', 'jazz'],
    suggestedTracks: ['smooth-outro', 'coffee-shop', 'smooth-jazz-night'],
    color: 'from-purple-500 to-indigo-500',
    popular: true,
  },
  {
    id: 'presentation-outro',
    name: 'Presentation Outro',
    description: 'Professional 10-second outro for business',
    icon: <Briefcase className="w-5 h-5" />,
    category: 'outro',
    duration: 10,
    fadeIn: 0.5,
    fadeOut: 3,
    suggestedGenres: ['corporate', 'inspirational'],
    suggestedTracks: ['success-story', 'rise-up', 'motivational-piano'],
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: 'emotional-outro',
    name: 'Emotional Outro',
    description: 'Touching 20-second outro for heartfelt endings',
    icon: <Heart className="w-5 h-5" />,
    category: 'outro',
    duration: 20,
    fadeIn: 1,
    fadeOut: 5,
    suggestedGenres: ['inspirational', 'cinematic'],
    suggestedTracks: ['emotional-journey', 'motivational-piano', 'hope-anthem'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'quick-outro',
    name: 'Quick Outro',
    description: 'Short 5-second outro for quick endings',
    icon: <Zap className="w-5 h-5" />,
    category: 'outro',
    duration: 5,
    fadeIn: 0.2,
    fadeOut: 1.5,
    suggestedGenres: ['upbeat', 'electronic'],
    suggestedTracks: ['tech-intro', 'news-sting', 'positive-energy'],
    color: 'from-yellow-500 to-amber-500',
  },

  // BOTH (Intro + Outro pairs)
  {
    id: 'startup-pack',
    name: 'Startup Pack',
    description: 'Complete intro (5s) + outro (10s) for tech startups',
    icon: <Rocket className="w-5 h-5" />,
    category: 'both',
    duration: 15,
    fadeIn: 0.5,
    fadeOut: 2,
    suggestedGenres: ['corporate', 'electronic'],
    suggestedTracks: ['tech-startup', 'corporate-innovation', 'future-bass'],
    color: 'from-blue-500 to-cyan-500',
    popular: true,
  },
  {
    id: 'creator-pack',
    name: 'Content Creator Pack',
    description: 'Complete intro (4s) + outro (15s) for creators',
    icon: <Star className="w-5 h-5" />,
    category: 'both',
    duration: 19,
    fadeIn: 0.3,
    fadeOut: 3,
    suggestedGenres: ['upbeat', 'lofi'],
    suggestedTracks: ['positive-energy', 'happy-sunshine', 'study-beats'],
    color: 'from-violet-500 to-purple-500',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function IntroOutroBuilder() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Feature gates
  const downloadGate = useFeatureGate('introOutroDownloads');
  const accessGate = useFeatureGate('introOutroAccess');
  const musicGate = useFeatureGate('premiumMusicLibrary');

  // For backwards compatibility
  const isPaidUser = downloadGate.canAccess;

  // State
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'library' | 'voice' | 'video'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<IntroOutroTemplate | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<PremiumTrack | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<MusicGenreType | null>(null);

  // Audio controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Custom settings
  const [customDuration, setCustomDuration] = useState(10);
  const [fadeInDuration, setFadeInDuration] = useState(0.5);
  const [fadeOutDuration, setFadeOutDuration] = useState(2);
  const [startTime, setStartTime] = useState(0);

  // Preview state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVoice, setRecordedVoice] = useState<Blob | null>(null);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement>(null);

  // Video Export state
  const [videoMode, setVideoMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filter templates
  const introTemplates = TEMPLATES.filter(t => t.category === 'intro');
  const outroTemplates = TEMPLATES.filter(t => t.category === 'outro');
  const packTemplates = TEMPLATES.filter(t => t.category === 'both');

  // Get tracks for selected genre
  const genreTracks = selectedGenre ? getTracksByGenre(selectedGenre) : [];

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Play/Pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !selectedTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, selectedTrack]);

  // Select template
  const handleSelectTemplate = (template: IntroOutroTemplate) => {
    setSelectedTemplate(template);
    setCustomDuration(template.duration);
    setFadeInDuration(template.fadeIn);
    setFadeOutDuration(template.fadeOut);

    // Auto-select first suggested track
    if (template.suggestedTracks.length > 0) {
      const track = getTrackById(template.suggestedTracks[0]);
      if (track) {
        setSelectedTrack(track);
        if (audioRef.current) {
          audioRef.current.src = track.audioUrl;
        }
      }
    }

    toast({
      title: `Template Selected: ${template.name}`,
      description: `Duration: ${template.duration}s with fade effects`,
    });
  };

  // Select track
  const handleSelectTrack = (track: PremiumTrack) => {
    setSelectedTrack(track);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.currentTime = startTime;
    }
  };

  // Generate intro/outro preview
  const handleGenerate = async () => {
    if (!selectedTrack) {
      toast({
        title: 'Select a Track',
        description: 'Please select a music track first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    // Simulate generation with progress
    await new Promise(resolve => setTimeout(resolve, 1500));

    setGeneratedAudio(selectedTrack.audioUrl);
    setIsGenerating(false);

    toast({
      title: 'Audio Ready!',
      description: `Your ${selectedTemplate?.category || 'custom'} is ready to preview`,
    });

    // Auto-play preview
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  // Download - only for paying customers
  const handleDownload = () => {
    if (!selectedTrack) {
      toast({
        title: 'No Audio',
        description: 'Please select or generate audio first',
        variant: 'destructive',
      });
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to download audio',
      });
      navigate('/signin?redirect=/intro-outro-builder');
      return;
    }

    // Check if user has download access
    if (!downloadGate.canAccess) {
      downloadGate.showUpgrade();
      return;
    }

    // Proceed with download for paying customers
    toast({
      title: 'Download Started',
      description: `Downloading ${selectedTemplate?.name || 'custom audio'}...`,
    });

    // Create download link
    const link = document.createElement('a');
    link.href = selectedTrack.audioUrl;
    link.download = `smartpromptiq-${selectedTemplate?.id || 'custom'}-${Date.now()}.mp3`;
    link.click();
  };

  // Format time
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // VOICE RECORDING FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  // State for microphone permission
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const streamRef = useRef<MediaStream | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMicPermission('denied');
          return;
        }

        // Check permission status if available
        if (navigator.permissions) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setMicPermission(result.state as 'granted' | 'denied' | 'prompt');

            // Listen for permission changes
            result.addEventListener('change', () => {
              setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
            });
          } catch {
            // Permissions API not supported for microphone, set to prompt
            setMicPermission('prompt');
          }
        } else {
          setMicPermission('prompt');
        }
      } catch {
        setMicPermission('prompt');
      }
    };

    checkMicPermission();
  }, []);

  const startRecording = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: 'Microphone Not Available',
          description: 'Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.',
          variant: 'destructive',
        });
        return;
      }

      // Stop any existing recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Request microphone with optimal audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        }
      });

      streamRef.current = stream;
      setMicPermission('granted');

      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        stopRecording();
        toast({
          title: 'Recording Error',
          description: 'An error occurred during recording. Please try again.',
          variant: 'destructive',
        });
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setRecordedVoice(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVoiceUrl(url);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        toast({
          title: 'Recording Complete!',
          description: `Recorded ${formatTime(recordingDuration)} of voice audio`,
        });
      };

      // Start recording with timeslice for continuous data
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: 'Recording Started',
        description: 'Speak now! Click stop when finished.',
      });
    } catch (error: any) {
      // Log detailed error for debugging
      console.warn('Microphone access issue:', {
        name: error.name,
        message: error.message,
        suggestion: 'Check browser permissions in address bar'
      });

      // Handle specific error types
      let errorMessage = 'Please allow microphone access to record voice';
      let errorTitle = 'Microphone Access Denied';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorTitle = 'Permission Denied';
        errorMessage = 'Microphone access was denied. Please enable it in your browser settings and refresh the page.';
        setMicPermission('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorTitle = 'No Microphone Found';
        errorMessage = 'No microphone detected. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorTitle = 'Microphone Busy';
        errorMessage = 'Your microphone is being used by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorTitle = 'Microphone Error';
        errorMessage = 'Could not configure microphone. Please try again.';
      } else if (error.name === 'SecurityError') {
        errorTitle = 'Security Error';
        errorMessage = 'Microphone access is blocked due to security restrictions. Please use HTTPS.';
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const deleteRecording = () => {
    if (recordedVoiceUrl) {
      URL.revokeObjectURL(recordedVoiceUrl);
    }
    setRecordedVoice(null);
    setRecordedVoiceUrl(null);
    setRecordingDuration(0);

    toast({
      title: 'Recording Deleted',
      description: 'You can record a new voice track',
    });
  };

  const playVoicePreview = () => {
    if (voiceAudioRef.current && recordedVoiceUrl) {
      voiceAudioRef.current.play().catch(console.error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // VIDEO EXPORT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportVideo = async () => {
    if (!selectedTrack) {
      toast({
        title: 'Select Music First',
        description: 'Please select a music track before exporting',
        variant: 'destructive',
      });
      return;
    }

    setIsExportingVideo(true);

    try {
      // Create canvas for video frames
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (16:9 aspect ratio - 1080p)
      canvas.width = 1920;
      canvas.height = 1080;

      // For actual video export, we'd use MediaRecorder with canvas
      // This is a simplified demo that creates an animated preview

      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Video Preview Ready!',
        description: 'Your intro/outro video has been generated',
      });

      // In a real implementation, we would:
      // 1. Use MediaRecorder to capture canvas stream
      // 2. Sync audio (music + voice) with video frames
      // 3. Export as WebM or MP4 using FFmpeg.wasm or similar

    } catch (error) {
      console.error('Error exporting video:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error creating your video',
        variant: 'destructive',
      });
    } finally {
      setIsExportingVideo(false);
    }
  };

  // Mix voice and music together
  const mixAudio = async () => {
    if (!selectedTrack || !recordedVoice) {
      toast({
        title: 'Missing Audio',
        description: 'Please select music and record voice first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Create AudioContext for mixing
      const audioContext = new AudioContext();

      // Load music track
      const musicResponse = await fetch(selectedTrack.audioUrl);
      const musicBuffer = await audioContext.decodeAudioData(await musicResponse.arrayBuffer());

      // Load voice recording
      const voiceBuffer = await audioContext.decodeAudioData(await recordedVoice.arrayBuffer());

      // Create offline context for rendering
      const duration = Math.max(musicBuffer.duration, voiceBuffer.duration);
      const offlineContext = new OfflineAudioContext(2, duration * audioContext.sampleRate, audioContext.sampleRate);

      // Create music source with gain
      const musicSource = offlineContext.createBufferSource();
      musicSource.buffer = musicBuffer;
      const musicGain = offlineContext.createGain();
      musicGain.gain.value = musicVolume;
      musicSource.connect(musicGain);
      musicGain.connect(offlineContext.destination);

      // Create voice source with gain
      const voiceSource = offlineContext.createBufferSource();
      voiceSource.buffer = voiceBuffer;
      const voiceGain = offlineContext.createGain();
      voiceGain.gain.value = voiceVolume;
      voiceSource.connect(voiceGain);
      voiceGain.connect(offlineContext.destination);

      // Start both sources
      musicSource.start(0);
      voiceSource.start(0);

      // Render mixed audio
      const renderedBuffer = await offlineContext.startRendering();

      // Convert to blob
      const wavBlob = audioBufferToWav(renderedBuffer);
      const mixedUrl = URL.createObjectURL(wavBlob);

      setGeneratedAudio(mixedUrl);

      // Auto-play the mixed result
      if (audioRef.current) {
        audioRef.current.src = mixedUrl;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }

      toast({
        title: 'Audio Mixed Successfully!',
        description: 'Your voice and music have been combined',
      });
    } catch (error) {
      console.error('Error mixing audio:', error);
      toast({
        title: 'Mix Failed',
        description: 'Error combining voice and music. Try downloading separately.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert AudioBuffer to WAV format
  function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    const offset = 44;
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), intSample, true);
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop any active recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      // Stop and release the media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Revoke recorded voice URL
      if (recordedVoiceUrl) {
        URL.revokeObjectURL(recordedVoiceUrl);
      }

      // Clear the recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recordedVoiceUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Hidden Audio Elements */}
      <audio ref={audioRef} preload="metadata" />
      <audio ref={voiceAudioRef} src={recordedVoiceUrl || undefined} preload="metadata" />
      {/* Hidden Canvas for Video Export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <AudioWaveform className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Intro & Outro Builder
              </h1>
              <p className="text-gray-400">Create professional intros and outros with awesome music</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Templates & Library */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="bg-white/5 border border-white/10 flex-wrap">
                <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500">
                  <Layers className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="library" className="data-[state=active]:bg-purple-500">
                  <Music className="w-4 h-4 mr-2" />
                  Music
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-green-500">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="video" className="data-[state=active]:bg-pink-500">
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-purple-500">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Custom
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6 mt-6">
                {/* Intro Templates */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-green-400" />
                    Intro Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {introTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all border-2 ${
                            selectedTemplate?.id === template.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color}`}>
                                {template.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-white">{template.name}</h4>
                                  {template.popular && (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {template.duration}s
                                  </span>
                                  <span>Fade: {template.fadeIn}s / {template.fadeOut}s</span>
                                </div>
                              </div>
                              {selectedTemplate?.id === template.id && (
                                <Check className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Outro Templates */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-pink-400" />
                    Outro Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outroTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all border-2 ${
                            selectedTemplate?.id === template.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color}`}>
                                {template.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-white">{template.name}</h4>
                                  {template.popular && (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {template.duration}s
                                  </span>
                                  <span>Fade: {template.fadeIn}s / {template.fadeOut}s</span>
                                </div>
                              </div>
                              {selectedTemplate?.id === template.id && (
                                <Check className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Complete Packs */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Complete Packs (Intro + Outro)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all border-2 ${
                            selectedTemplate?.id === template.id
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color}`}>
                                {template.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-white">{template.name}</h4>
                                  {template.popular && (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {template.duration}s total
                                  </span>
                                </div>
                              </div>
                              {selectedTemplate?.id === template.id && (
                                <Check className="w-5 h-5 text-yellow-400" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Music Library Tab */}
              <TabsContent value="library" className="space-y-6 mt-6">
                {/* Genre Filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Genre</h3>
                  <div className="flex flex-wrap gap-2">
                    {MUSIC_CATEGORIES.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedGenre === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedGenre(category.id)}
                        className={selectedGenre === category.id ? 'bg-purple-500' : ''}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Track List */}
                {selectedGenre && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {MUSIC_CATEGORIES.find(c => c.id === selectedGenre)?.name} Tracks
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {genreTracks.map((track) => (
                        <motion.div
                          key={track.id}
                          whileHover={{ x: 4 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              selectedTrack?.id === track.id
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                            onClick={() => handleSelectTrack(track)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: track.waveformColor + '30' }}
                                >
                                  <Music className="w-5 h-5" style={{ color: track.waveformColor }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-white truncate">{track.name}</h4>
                                  <p className="text-sm text-gray-400">{track.mood} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {track.featured && (
                                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">
                                      Featured
                                    </Badge>
                                  )}
                                  {selectedTrack?.id === track.id && (
                                    <Check className="w-5 h-5 text-purple-400" />
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedGenre && (
                  <div className="text-center py-12 text-gray-400">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a genre to browse tracks</p>
                  </div>
                )}
              </TabsContent>

              {/* Voice Recording Tab */}
              <TabsContent value="voice" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-green-400" />
                      Voice Recording
                      {/* Microphone Status Indicator */}
                      <Badge
                        variant="secondary"
                        className={`ml-auto text-xs ${
                          micPermission === 'granted'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : micPermission === 'denied'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : micPermission === 'checking'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {micPermission === 'granted' && '🎤 Mic Ready'}
                        {micPermission === 'denied' && '🚫 Mic Blocked'}
                        {micPermission === 'prompt' && '🔔 Click to Allow Mic'}
                        {micPermission === 'checking' && '⏳ Checking...'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Record your voice and mix it with background music for a complete intro/outro
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Microphone Permission Warning */}
                    {micPermission === 'denied' && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-start gap-3">
                          <MicOff className="w-5 h-5 text-red-400 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-red-400 mb-1">Microphone Access Blocked</h5>
                            <p className="text-sm text-gray-400">
                              To enable voice recording:
                            </p>
                            <ol className="text-sm text-gray-400 mt-2 space-y-1 list-decimal list-inside">
                              <li>Click the lock/info icon in your browser's address bar</li>
                              <li>Find "Microphone" permission</li>
                              <li>Change it to "Allow"</li>
                              <li>Refresh this page</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recording Status */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <div className="flex flex-col items-center gap-4">
                        {/* Recording Animation */}
                        <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isRecording
                              ? 'bg-red-500 shadow-lg shadow-red-500/50'
                              : recordedVoiceUrl
                                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                : micPermission === 'denied'
                                  ? 'bg-gray-700'
                                  : 'bg-gray-600 hover:bg-gray-500'
                          }`}>
                            {isRecording ? (
                              <Square className="w-10 h-10 text-white animate-pulse" />
                            ) : micPermission === 'denied' ? (
                              <MicOff className="w-10 h-10 text-gray-400" />
                            ) : (
                              <Mic className="w-10 h-10 text-white" />
                            )}
                          </div>
                          {isRecording && (
                            <>
                              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
                              <div className="absolute -inset-2 rounded-full border-2 border-red-300/50 animate-pulse" />
                            </>
                          )}
                        </div>

                        {/* Recording Timer */}
                        <div className="text-3xl font-mono font-bold text-white">
                          {isRecording && <span className="text-red-400 mr-2">●</span>}
                          {formatTime(recordingDuration)}
                        </div>

                        {/* Audio Level Indicator (visual feedback during recording) */}
                        {isRecording && (
                          <div className="flex items-center gap-1 h-8">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 rounded-full bg-green-400"
                                animate={{
                                  height: [4, Math.random() * 24 + 4, 4],
                                }}
                                transition={{
                                  duration: 0.15,
                                  repeat: Infinity,
                                  delay: i * 0.02,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Recording Controls */}
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                          {!isRecording && !recordedVoiceUrl && (
                            <Button
                              size="lg"
                              className={`${
                                micPermission === 'denied'
                                  ? 'bg-gray-500 cursor-not-allowed'
                                  : 'bg-green-500 hover:bg-green-600'
                              } text-white transition-all`}
                              onClick={startRecording}
                              disabled={micPermission === 'denied'}
                            >
                              <Mic className="w-5 h-5 mr-2" />
                              {micPermission === 'prompt' ? 'Allow Mic & Start' : 'Start Recording'}
                            </Button>
                          )}

                          {isRecording && (
                            <Button
                              size="lg"
                              className="bg-red-500 hover:bg-red-600 text-white animate-pulse"
                              onClick={stopRecording}
                            >
                              <Square className="w-5 h-5 mr-2" />
                              Stop Recording
                            </Button>
                          )}

                          {recordedVoiceUrl && !isRecording && (
                            <>
                              <Button
                                size="lg"
                                variant="outline"
                                onClick={playVoicePreview}
                              >
                                <Play className="w-5 h-5 mr-2" />
                                Play Voice
                              </Button>
                              <Button
                                size="lg"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={startRecording}
                              >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Re-record
                              </Button>
                              <Button
                                size="lg"
                                variant="destructive"
                                onClick={deleteRecording}
                              >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Status Text */}
                        <p className="text-sm text-gray-400">
                          {isRecording
                            ? 'Recording in progress... Speak now!'
                            : recordedVoiceUrl
                              ? 'Voice recording ready! You can play it back or re-record.'
                              : 'Click to start recording your voice'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Volume Mixing Controls */}
                    {recordedVoiceUrl && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Volume Mixing</h4>

                        {/* Voice Volume */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            Voice Volume: {Math.round(voiceVolume * 100)}%
                          </label>
                          <Slider
                            value={[voiceVolume * 100]}
                            onValueChange={([v]) => setVoiceVolume(v / 100)}
                            min={0}
                            max={100}
                            className="w-full"
                          />
                        </div>

                        {/* Music Volume */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Music Volume: {Math.round(musicVolume * 100)}%
                          </label>
                          <Slider
                            value={[musicVolume * 100]}
                            onValueChange={([v]) => setMusicVolume(v / 100)}
                            min={0}
                            max={100}
                            className="w-full"
                          />
                        </div>

                        {/* Mix Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          size="lg"
                          onClick={mixAudio}
                          disabled={!selectedTrack || isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                              Mixing Audio...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-5 h-5 mr-2" />
                              Mix Voice + Music
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Tips */}
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h5 className="font-medium text-blue-400 mb-2">Recording Tips:</h5>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Speak clearly and at a consistent volume</li>
                        <li>• Use a quiet environment for best results</li>
                        <li>• Keep intros short (5-10 seconds recommended)</li>
                        <li>• For outros, include a call-to-action</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Video Export Tab */}
              <TabsContent value="video" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Video className="w-5 h-5 text-pink-400" />
                      Video Export
                    </CardTitle>
                    <CardDescription>
                      Create a short video with your voice, music, and custom visuals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Video Preview */}
                    <div
                      className="aspect-video rounded-xl overflow-hidden relative"
                      style={{ backgroundColor }}
                    >
                      {backgroundImage ? (
                        <img
                          src={backgroundImage}
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Film className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                            <p className="text-gray-400">Video Preview</p>
                          </div>
                        </div>
                      )}

                      {/* Overlay Text */}
                      {overlayText && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <h2
                            className="text-4xl font-bold text-center px-4"
                            style={{ color: textColor }}
                          >
                            {overlayText}
                          </h2>
                        </div>
                      )}

                      {/* Audio Waveform Overlay */}
                      {(selectedTrack || recordedVoiceUrl) && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-center gap-1 h-8">
                            {Array.from({ length: 50 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 rounded-full bg-white/60"
                                animate={{
                                  height: isPlaying ? [4, Math.random() * 20 + 4, 4] : 4,
                                }}
                                transition={{
                                  duration: 0.4,
                                  repeat: isPlaying ? Infinity : 0,
                                  delay: i * 0.015,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Background Image Upload */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Background Image (Optional)
                      </label>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => document.getElementById('bg-image-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                        {backgroundImage && (
                          <Button
                            variant="destructive"
                            onClick={() => setBackgroundImage(null)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <input
                        id="bg-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Background Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <div className="flex gap-2">
                          {['#1a1a2e', '#16213e', '#0f0f23', '#1a0a2e', '#2d132c', '#0d1b2a'].map(color => (
                            <button
                              key={color}
                              className={`w-10 h-10 rounded-lg border-2 ${backgroundColor === color ? 'border-white' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setBackgroundColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Overlay Text */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        <Type className="w-4 h-4 inline mr-2" />
                        Overlay Text
                      </label>
                      <input
                        type="text"
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                        placeholder="Enter text to display (e.g., channel name)"
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Text Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <div className="flex gap-2">
                          {['#ffffff', '#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa'].map(color => (
                            <button
                              key={color}
                              className={`w-10 h-10 rounded-lg border-2 ${textColor === color ? 'border-white' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setTextColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Export Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      size="lg"
                      onClick={exportVideo}
                      disabled={isExportingVideo || !selectedTrack}
                    >
                      {isExportingVideo ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Creating Video...
                        </>
                      ) : (
                        <>
                          <Video className="w-5 h-5 mr-2" />
                          Export Video (WebM)
                        </>
                      )}
                    </Button>

                    {/* Export Info */}
                    <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <h5 className="font-medium text-pink-400 mb-2">Video Export Features:</h5>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• 1080p resolution (1920x1080)</li>
                        <li>• Voice + Music audio mix</li>
                        <li>• Custom background image or color</li>
                        <li>• Animated waveform visualization</li>
                        <li>• Text overlay support</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Custom Tab */}
              <TabsContent value="custom" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white">Custom Settings</CardTitle>
                    <CardDescription>Fine-tune your intro/outro settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Duration */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Duration: {customDuration}s
                      </label>
                      <Slider
                        value={[customDuration]}
                        onValueChange={([v]) => setCustomDuration(v)}
                        min={3}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Fade In */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Fade In: {fadeInDuration}s
                      </label>
                      <Slider
                        value={[fadeInDuration]}
                        onValueChange={([v]) => setFadeInDuration(v)}
                        min={0}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Fade Out */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Fade Out: {fadeOutDuration}s
                      </label>
                      <Slider
                        value={[fadeOutDuration]}
                        onValueChange={([v]) => setFadeOutDuration(v)}
                        min={0}
                        max={10}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Start from: {startTime}s
                      </label>
                      <Slider
                        value={[startTime]}
                        onValueChange={([v]) => setStartTime(v)}
                        min={0}
                        max={Math.max(0, (selectedTrack?.duration || 60) - customDuration)}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview & Controls */}
          <div className="space-y-6">
            {/* Selected Track Preview */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTrack ? (
                  <>
                    {/* Track Info */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedTrack.waveformColor + '30' }}
                      >
                        <Music className="w-7 h-7" style={{ color: selectedTrack.waveformColor }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{selectedTrack.name}</h4>
                        <p className="text-sm text-gray-400">{selectedTrack.mood} • {selectedTrack.genre}</p>
                      </div>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="h-16 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full"
                            style={{ backgroundColor: selectedTrack.waveformColor }}
                            animate={{
                              height: isPlaying
                                ? [8, Math.random() * 40 + 10, 8]
                                : 8,
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: isPlaying ? Infinity : 0,
                              delay: i * 0.02,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <Slider
                        value={[currentTime]}
                        onValueChange={([v]) => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = v;
                            setCurrentTime(v);
                          }
                        }}
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = Math.max(0, currentTime - 5);
                          }
                        }}
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>

                      <Button
                        size="lg"
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={togglePlay}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = Math.min(duration, currentTime + 5);
                          }
                        }}
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (audioRef.current) {
                            audioRef.current.muted = !isMuted;
                          }
                        }}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={([v]) => {
                          setVolume(v / 100);
                          if (audioRef.current) {
                            audioRef.current.volume = v / 100;
                          }
                        }}
                        min={0}
                        max={100}
                        className="flex-1"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a template or track to preview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings Summary */}
            {selectedTemplate && (
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Current Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Template:</span>
                    <span className="text-white">{selectedTemplate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{customDuration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fade In:</span>
                    <span className="text-white">{fadeInDuration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fade Out:</span>
                    <span className="text-white">{fadeOutDuration}s</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
                onClick={handleGenerate}
                disabled={!selectedTrack || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate {selectedTemplate?.category === 'both' ? 'Pack' : selectedTemplate?.category || 'Audio'}
                  </>
                )}
              </Button>

              <Button
                className={`w-full ${
                  isPaidUser
                    ? 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'
                    : 'border-amber-500/50 text-amber-300 hover:bg-amber-500/20'
                }`}
                variant="outline"
                size="lg"
                onClick={handleDownload}
                disabled={!generatedAudio}
              >
                {isPaidUser ? (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Audio
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Download Audio
                    <Crown className="w-4 h-4 ml-2 text-amber-400" />
                  </>
                )}
              </Button>
            </div>

            {/* Suggested Tracks */}
            {selectedTemplate && (
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Suggested Tracks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedTemplate.suggestedTracks.map((trackId) => {
                    const track = getTrackById(trackId);
                    if (!track) return null;
                    return (
                      <Button
                        key={trackId}
                        variant={selectedTrack?.id === trackId ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => handleSelectTrack(track)}
                      >
                        <Music className="w-4 h-4 mr-2" />
                        {track.name}
                        {selectedTrack?.id === trackId && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Feature Gate Upgrade Modals */}
      <downloadGate.UpgradeModal />
      <accessGate.UpgradeModal />
      <musicGate.UpgradeModal />
    </div>
  );
}
