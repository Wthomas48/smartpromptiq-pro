import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useElevenLabsVoiceSafe } from '@/contexts/ElevenLabsVoiceContext';
import { useVoiceDownloadGate, useElevenLabsGate, useStoryModeGate } from '@/hooks/useFeatureGate';
import { ELEVENLABS_VOICES, OPENAI_VOICES } from '@/config/voices';
import VoiceAppTemplates from '@/components/VoiceAppTemplates';
import StoryModeVoice from '@/components/StoryModeVoice';
import MusicMakerPro from '@/components/MusicMakerPro';
import VoiceMusicMixer from '@/components/VoiceMusicMixer';
import VoiceToSong from '@/components/VoiceToSong';
import PremiumMusicLibrary from '@/components/PremiumMusicLibrary';
import { useAudioStoreSafe } from '@/contexts/AudioStoreContext';
import {
  Mic, MicOff, Volume2, VolumeX, Play, Pause, Square,
  Download, Share2, Save, Sparkles, Wand2, Copy, Check,
  FileAudio, Music, Radio, Podcast, Video, Presentation,
  BookOpen, GraduationCap, ShoppingCart, Heart, TrendingUp,
  Building2, Gamepad2, Plane, UtensilsCrossed, Scale,
  MessageSquare, Megaphone, Users, Briefcase, Brain,
  Zap, Clock, Settings, RefreshCw, ChevronRight, Star,
  Crown, Lock, Gift, ArrowRight, Loader2, AudioWaveform,
  Headphones, FileText, Layers, Rocket,
  Bot, Send, Phone, Sliders, Music2
} from 'lucide-react';

// Voice categories with use cases
const voiceCategories = [
  {
    id: 'marketing',
    name: 'Marketing & Ads',
    icon: Megaphone,
    color: 'from-orange-500 to-red-500',
    description: 'Persuasive voiceovers for ads, promos, and brand content',
    useCases: ['Video Ads', 'Radio Spots', 'Social Media', 'Brand Videos', 'Explainers'],
    recommendedVoices: ['energetic', 'friendly', 'professional'],
  },
  {
    id: 'education',
    name: 'Education & Training',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    description: 'Clear narration for courses, tutorials, and learning content',
    useCases: ['Course Narration', 'Tutorials', 'E-Learning', 'How-To Videos', 'Explainers'],
    recommendedVoices: ['teacher', 'calm', 'professional'],
  },
  {
    id: 'business',
    name: 'Business & Corporate',
    icon: Briefcase,
    color: 'from-slate-500 to-gray-600',
    description: 'Professional voiceovers for presentations and corporate content',
    useCases: ['Presentations', 'Pitch Decks', 'Training', 'IVR Systems', 'Reports'],
    recommendedVoices: ['professional', 'authoritative', 'calm'],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Products',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-500',
    description: 'Engaging product descriptions and promotional content',
    useCases: ['Product Demos', 'Unboxing', 'Reviews', 'Promos', 'Tutorials'],
    recommendedVoices: ['enthusiastic', 'friendly', 'trustworthy'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellness',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    description: 'Calming voices for medical and wellness content',
    useCases: ['Patient Info', 'Meditation', 'Wellness Apps', 'Medical Training', 'Therapy'],
    recommendedVoices: ['calm', 'reassuring', 'empathetic'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Media',
    icon: Gamepad2,
    color: 'from-purple-500 to-violet-500',
    description: 'Dynamic voices for podcasts, games, and storytelling',
    useCases: ['Podcasts', 'Audiobooks', 'Games', 'Animation', 'Trailers'],
    recommendedVoices: ['dynamic', 'dramatic', 'character'],
  },
  {
    id: 'apps',
    name: 'App & Software',
    icon: Rocket,
    color: 'from-indigo-500 to-blue-500',
    description: 'Voice content for app demos, pitches, and walkthroughs',
    useCases: ['App Pitches', 'Feature Tours', 'Onboarding', 'Help Content', 'Updates'],
    recommendedVoices: ['professional', 'friendly', 'enthusiastic'],
  },
  {
    id: 'personal',
    name: 'Personal & Creative',
    icon: Users,
    color: 'from-amber-500 to-yellow-500',
    description: 'Voices for personal projects, affirmations, and creative work',
    useCases: ['Affirmations', 'Journals', 'Stories', 'Greetings', 'Messages'],
    recommendedVoices: ['warm', 'inspiring', 'soothing'],
  },
];

// ElevenLabs Premium AI Voice Personas - from centralized config (NO REPETITION!)
const elevenLabsVoicePersonas = ELEVENLABS_VOICES.map(v => ({
  id: v.id,
  name: v.name,
  persona: v.persona,
  tagline: v.tagline,
  description: v.description,
  vibe: v.vibe,
  gender: v.gender,
  style: v.style,
  color: v.color,
  emoji: v.emoji,
  bestFor: v.bestFor,
  sampleLine: v.sampleLine,
  premium: v.premium,
}));

// OpenAI Fallback Voice Personas - from centralized config
const aiVoicePersonas = OPENAI_VOICES.map(v => ({
  id: v.id,
  name: v.name,
  persona: v.persona,
  tagline: v.tagline,
  description: v.description,
  vibe: v.vibe,
  gender: v.gender,
  style: v.style,
  color: v.color,
  emoji: v.emoji,
  bestFor: v.bestFor,
  sampleLine: v.sampleLine,
  premium: v.premium,
}));

// Additional Creative Voice Styles
const creativeVoiceStyles = [
  { id: 'motivational', name: 'Motivational Coach', emoji: '💪', description: 'Tony Robbins energy', color: 'from-yellow-500 to-orange-500' },
  { id: 'news-anchor', name: 'News Anchor', emoji: '📺', description: 'Authoritative broadcast style', color: 'from-blue-600 to-blue-800' },
  { id: 'tech-reviewer', name: 'Tech Reviewer', emoji: '📱', description: 'MKBHD smooth delivery', color: 'from-gray-700 to-black' },
  { id: 'quirky-fun', name: 'Quirky & Fun', emoji: '🎉', description: 'Playful and memorable', color: 'from-pink-400 to-purple-500' },
  { id: 'documentary', name: 'Documentary', emoji: '🎥', description: 'National Geographic vibes', color: 'from-amber-600 to-yellow-700' },
  { id: 'asmr-whisper', name: 'ASMR Whisper', emoji: '🌙', description: 'Soft, intimate, relaxing', color: 'from-indigo-400 to-purple-600' },
];

// Legacy voice mapping for API compatibility
const aiVoices = aiVoicePersonas.map(v => ({
  id: v.id,
  name: v.name,
  description: v.description,
  gender: v.gender,
  style: v.style,
}));

// Voice style presets
const voiceStyles = [
  { id: 'professional', name: 'Professional', rate: 1.0, pitch: 1.0, icon: Briefcase },
  { id: 'friendly', name: 'Friendly', rate: 1.05, pitch: 1.1, icon: Users },
  { id: 'energetic', name: 'Energetic', rate: 1.15, pitch: 1.15, icon: Zap },
  { id: 'calm', name: 'Calm', rate: 0.9, pitch: 0.95, icon: Heart },
  { id: 'teacher', name: 'Teacher', rate: 0.95, pitch: 1.0, icon: GraduationCap },
  { id: 'dramatic', name: 'Dramatic', rate: 0.85, pitch: 1.1, icon: Gamepad2 },
];

// Script templates
const scriptTemplates = [
  {
    id: 'app-pitch',
    name: '60-Second App Pitch',
    category: 'apps',
    template: `Introducing [App Name] - the revolutionary app that [main benefit].

[Problem statement - what frustration does it solve?]

With [App Name], you can:
- [Feature 1 and benefit]
- [Feature 2 and benefit]
- [Feature 3 and benefit]

Built for [target audience], [App Name] makes [key action] effortless.

Ready to transform [area]? Download [App Name] today and experience the difference.`,
  },
  {
    id: 'product-demo',
    name: 'Product Demo Script',
    category: 'ecommerce',
    template: `Meet the [Product Name] - designed to [main purpose].

Here's what makes it special:

First, [feature 1] - which means [benefit].
Second, [feature 2] - so you can [benefit].
And finally, [feature 3] - giving you [benefit].

Whether you're [use case 1] or [use case 2], the [Product Name] delivers.

Order now and see why thousands are making the switch.`,
  },
  {
    id: 'course-intro',
    name: 'Course Introduction',
    category: 'education',
    template: `Welcome to [Course Name].

In this course, you'll learn [main topic] from the ground up.

By the end, you'll be able to:
- [Learning outcome 1]
- [Learning outcome 2]
- [Learning outcome 3]

No prior experience needed - just bring your curiosity and let's get started.

I'm [Instructor Name], and I'll be your guide on this journey. Let's begin!`,
  },
  {
    id: 'ad-script',
    name: 'Video Ad (30 sec)',
    category: 'marketing',
    template: `Tired of [pain point]?

[Brand Name] is here to change that.

Our [product/service] helps you [main benefit] - fast.

Join [number] happy customers who've already made the switch.

[Brand Name]. [Tagline].

Visit [website] today. Limited time offer!`,
  },
  {
    id: 'meditation',
    name: 'Guided Meditation',
    category: 'healthcare',
    template: `Find a comfortable position and gently close your eyes.

Take a deep breath in... and slowly release.

Let your shoulders drop. Release any tension you're holding.

With each breath, feel yourself becoming more relaxed.

Breathe in calm... breathe out stress.

You are safe. You are present. You are at peace.

Continue breathing slowly as we journey inward together...`,
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Intro',
    category: 'entertainment',
    template: `Welcome to [Podcast Name] - the show where we [podcast premise].

I'm your host, [Name], and today we're diving into [topic].

[Hook or interesting fact about today's episode]

Whether you're [listener context], you're going to love this one.

Let's jump right in!`,
  },
];

const VoiceBuilder: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // ElevenLabs context
  const voiceContext = useElevenLabsVoiceSafe();

  // Audio Store for cross-builder transfer
  const audioStore = useAudioStoreSafe();

  // State
  const [activeTab, setActiveTab] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [useElevenLabs, setUseElevenLabs] = useState(true); // Premium by default
  const [selectedVoice, setSelectedVoice] = useState('rachel'); // ElevenLabs default
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [script, setScript] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });

  // Playback state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);

  // Feature gates
  const downloadGate = useVoiceDownloadGate();
  const elevenLabsGate = useElevenLabsGate();
  const storyModeGate = useStoryModeGate();

  // For backwards compatibility
  const isPaidUser = downloadGate.canAccess;

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewSynthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis for preview
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      previewSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Calculate estimated duration and tokens
  const charCount = script.length;
  const wordCount = script.trim().split(/\s+/).filter(w => w).length;
  const estimatedDuration = Math.ceil(wordCount / 150 * 60); // ~150 words per minute
  const estimatedTokens = Math.ceil(charCount / 100) * 10; // 10 tokens per 100 chars

  // Preview using browser TTS
  const handlePreview = useCallback(() => {
    if (!previewSynthRef.current || !script.trim()) {
      toast({ title: 'No Script', description: 'Please enter some text to preview', variant: 'destructive' });
      return;
    }

    // Stop any current speech
    previewSynthRef.current.cancel();

    if (isPreviewing) {
      setIsPreviewing(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(script.slice(0, 500)); // Preview first 500 chars
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Find a good voice
    const voices = previewSynthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                         voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsPreviewing(true);
    utterance.onend = () => setIsPreviewing(false);
    utterance.onerror = () => setIsPreviewing(false);

    previewSynthRef.current.speak(utterance);
  }, [script, voiceSettings, isPreviewing, toast]);

  // Stop preview
  const stopPreview = useCallback(() => {
    previewSynthRef.current?.cancel();
    setIsPreviewing(false);
  }, []);

  // Browser Web Speech API fallback for voice generation
  const generateBrowserVoice = useCallback(async (text: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve(null);
        return;
      }

      // Create MediaRecorder to capture audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      // For browsers that don't support audio capture, just use speechSynthesis for playback
      // and create a data URL from a simple audio oscillator as placeholder
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 5000));
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      // Find a good voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en') && !v.localService) ||
                           voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;

      // Store reference to stop later
      const synth = window.speechSynthesis;

      utterance.onend = () => {
        // Create a simple audio blob for playback tracking
        // (actual audio plays through speechSynthesis)
        const sampleRate = 44100;
        const duration = text.length / 15; // rough estimate
        const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        resolve('browser-tts-active');
      };

      utterance.onerror = () => {
        resolve(null);
      };

      synth.speak(utterance);
    });
  }, [voiceSettings]);

  // Generate AI voice (ElevenLabs or OpenAI)
  const handleGenerate = useCallback(async () => {
    if (!script.trim()) {
      toast({ title: 'No Script', description: 'Please enter text to generate voice', variant: 'destructive' });
      return;
    }

    if (!isAuthenticated) {
      toast({ title: 'Sign In Required', description: 'Please sign in to generate AI voice' });
      navigate('/signin?redirect=/voice-builder');
      return;
    }

    setIsGenerating(true);

    try {
      // Use ElevenLabs or OpenAI based on toggle
      const endpoint = useElevenLabs ? '/api/elevenlabs/generate' : '/api/voice/generate';

      const body = useElevenLabs
        ? {
            text: script.slice(0, 5000),
            voiceName: selectedVoice,
            preset: 'natural',
            category: selectedCategory,
          }
        : {
            text: script,
            voice: selectedVoice,
            style: selectedStyle,
            settings: voiceSettings,
            category: selectedCategory,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate voice');
      }

      const data = await response.json();
      setGeneratedAudioUrl(data.audioUrl);

      // Save to AudioStore for cross-builder transfer
      if (audioStore && data.audioUrl) {
        audioStore.importFromVoiceBuilder(
          data.audioUrl,
          `Voice - ${selectedVoice} - ${new Date().toLocaleTimeString()}`,
          {
            voiceName: selectedVoice,
            script: script.slice(0, 200),
            category: selectedCategory || undefined,
            style: selectedStyle,
            duration: estimatedDuration,
          }
        );
      }

      toast({
        title: useElevenLabs ? 'ElevenLabs Voice Ready!' : 'Voice Generated!',
        description: `${data.tokensUsed || estimatedTokens} tokens used. Duration: ~${estimatedDuration}s`,
      });
    } catch (error: any) {
      console.error('Voice generation error:', error);

      // Auto-fallback to OpenAI if ElevenLabs fails
      if (useElevenLabs) {
        toast({
          title: 'Trying OpenAI backup...',
          description: 'ElevenLabs unavailable, trying OpenAI.',
        });

        // Try OpenAI as first fallback
        try {
          const response = await fetch('/api/voice/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              text: script,
              voice: 'nova',
              style: selectedStyle,
              settings: voiceSettings,
              category: selectedCategory,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setGeneratedAudioUrl(data.audioUrl);
            setUseElevenLabs(false);
            setSelectedVoice('nova');
            toast({
              title: 'Voice Generated (OpenAI)!',
              description: 'Using OpenAI backup voice.',
            });
            return;
          }
        } catch {
          // OpenAI also failed, try browser fallback
        }

        // Final fallback: Browser Web Speech API
        toast({
          title: 'Using Browser Voice',
          description: 'API unavailable. Using browser text-to-speech (free preview).',
        });

        // Use browser TTS directly
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(script.slice(0, 5000));
          utterance.rate = voiceSettings.rate;
          utterance.pitch = voiceSettings.pitch;
          utterance.volume = voiceSettings.volume;

          const voices = window.speechSynthesis.getVoices();
          const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                               voices.find(v => v.lang.startsWith('en') && !v.localService) ||
                               voices.find(v => v.lang.startsWith('en'));
          if (englishVoice) utterance.voice = englishVoice;

          window.speechSynthesis.speak(utterance);
          setGeneratedAudioUrl('browser-tts://active');
          setIsPlaying(true);

          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);

          toast({
            title: 'Playing Browser Voice',
            description: 'Note: Browser TTS cannot be downloaded. Upgrade for premium voices.',
          });
        } else {
          toast({
            title: 'Voice Unavailable',
            description: 'Your browser does not support text-to-speech.',
            variant: 'destructive',
          });
        }
      } else {
        // OpenAI was already being used and failed
        toast({
          title: 'Using Browser Voice',
          description: 'API unavailable. Using browser text-to-speech.',
        });

        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(script.slice(0, 5000));
          utterance.rate = voiceSettings.rate;
          utterance.pitch = voiceSettings.pitch;
          utterance.volume = voiceSettings.volume;

          const voices = window.speechSynthesis.getVoices();
          const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                               voices.find(v => v.lang.startsWith('en'));
          if (englishVoice) utterance.voice = englishVoice;

          window.speechSynthesis.speak(utterance);
          setGeneratedAudioUrl('browser-tts://active');
          setIsPlaying(true);

          utterance.onend = () => setIsPlaying(false);
        } else {
          toast({
            title: 'Generation Failed',
            description: error.message || 'Failed to generate voice. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [script, selectedVoice, selectedStyle, voiceSettings, selectedCategory, isAuthenticated, navigate, toast, estimatedTokens, estimatedDuration, useElevenLabs, generateBrowserVoice]);

  // Apply template
  const applyTemplate = useCallback((template: typeof scriptTemplates[0]) => {
    setScript(template.template);
    setSelectedCategory(template.category);
    toast({ title: 'Template Applied', description: `"${template.name}" loaded. Customize the placeholders!` });
  }, [toast]);

  // Handle download - only for paying customers
  const handleDownload = useCallback(() => {
    if (!generatedAudioUrl) {
      toast({
        title: 'No Audio',
        description: 'Please generate voice audio first',
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
      navigate('/signin?redirect=/voice-builder');
      return;
    }

    // Check if user has download access
    if (!downloadGate.canAccess) {
      downloadGate.showUpgrade();
      return;
    }

    // Proceed with download for paying customers
    try {
      const link = document.createElement('a');
      link.href = generatedAudioUrl;
      link.download = `smartpromptiq-voice-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download Started',
        description: 'Your voice audio is being downloaded',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to download audio. Please try again.',
        variant: 'destructive',
      });
    }
  }, [generatedAudioUrl, isAuthenticated, downloadGate, navigate, toast]);

  // Apply style preset
  const applyStylePreset = useCallback((styleId: string) => {
    const style = voiceStyles.find(s => s.id === styleId);
    if (style) {
      setSelectedStyle(styleId);
      setVoiceSettings(prev => ({
        ...prev,
        rate: style.rate,
        pitch: style.pitch,
      }));
    }
  }, []);

  // AI enhance script
  const enhanceScript = useCallback(async () => {
    if (!script.trim()) {
      toast({ title: 'No Script', description: 'Enter some text first', variant: 'destructive' });
      return;
    }

    toast({ title: 'Enhancing...', description: 'AI is improving your script' });

    try {
      const response = await fetch('/api/voice/enhance-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          script,
          category: selectedCategory,
          style: selectedStyle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScript(data.enhancedScript);
        toast({ title: 'Script Enhanced!', description: 'Your script has been improved for voice delivery' });
      }
    } catch (error) {
      toast({ title: 'Enhancement Failed', description: 'Could not enhance script', variant: 'destructive' });
    }
  }, [script, selectedCategory, selectedStyle, toast]);

  // Copy script
  const copyScript = useCallback(() => {
    navigator.clipboard.writeText(script);
    toast({ title: 'Copied!', description: 'Script copied to clipboard' });
  }, [script, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30">
              <Volume2 className="w-3 h-3 mr-1" /> Part of SmartPromptIQ™ Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-white">SmartPromptIQ™</span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {' '}Voice Builder
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Transform your text into professional AI voiceovers. Create narrations for app pitches,
              courses, marketing content, and more - all integrated with SmartPromptIQ.
            </p>

            {/* Voice Feature Tiles - Modular Access */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-8 max-w-6xl mx-auto">
              {/* Script to Audio */}
              <button
                onClick={() => setActiveTab('create')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-2">
                  <Mic className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-white text-sm font-medium">Script to Audio</div>
                <div className="text-gray-500 text-[10px]">Generate voiceovers</div>
              </button>

              {/* Story Mode Voice */}
              <button
                onClick={() => setActiveTab('story-mode')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                  activeTab === 'story-mode'
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg shadow-pink-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-pink-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-2">
                  <Bot className="w-5 h-5 text-pink-400" />
                </div>
                <div className="text-white text-sm font-medium">Story Mode</div>
                <div className="text-gray-500 text-[10px]">Voice conversations</div>
              </button>

              {/* Music Maker */}
              <button
                onClick={() => setActiveTab('music')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                  activeTab === 'music'
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-violet-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-2">
                  <Music className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-white text-sm font-medium">Music Maker</div>
                <div className="text-gray-500 text-[10px]">Background tracks</div>
              </button>

              {/* Song Mode - HOT NEW FEATURE! */}
              <button
                onClick={() => setActiveTab('song-mode')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 relative ${
                  activeTab === 'song-mode'
                    ? 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-rose-500/50'
                }`}
              >
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-[8px] font-bold text-black px-1.5 py-0.5 rounded-full animate-pulse">HOT</div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-2">
                  <Music2 className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-white text-sm font-medium">Song Mode</div>
                <div className="text-gray-500 text-[10px]">Voice to Song!</div>
              </button>

              {/* Voice Templates */}
              <button
                onClick={() => setActiveTab('templates')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                  activeTab === 'templates'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-amber-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-white text-sm font-medium">Voice Scripts</div>
                <div className="text-gray-500 text-[10px]">Pre-made templates</div>
              </button>

              {/* Voice App Builder */}
              <button
                onClick={() => setActiveTab('app-templates')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                  activeTab === 'app-templates'
                    ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-red-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-2">
                  <Rocket className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-white text-sm font-medium">Voice Apps</div>
                <div className="text-gray-500 text-[10px]">Build voice-first apps</div>
              </button>

              {/* Categories */}
              <button
                onClick={() => setActiveTab('categories')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                  activeTab === 'categories'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-white text-sm font-medium">Categories</div>
                <div className="text-gray-500 text-[10px]">Voice by industry</div>
              </button>

              {/* Voice + Music Mixer - NEW! */}
              <button
                onClick={() => setActiveTab('mixer')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 relative ${
                  activeTab === 'mixer'
                    ? 'bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-orange-500/50'
                }`}
              >
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-[8px] font-bold text-black px-1.5 py-0.5 rounded-full">NEW</div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-2">
                  <Sliders className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-white text-sm font-medium">Mixer</div>
                <div className="text-gray-500 text-[10px]">Voice + Music</div>
              </button>

              {/* My Voice Library */}
              <button
                onClick={() => setActiveTab('library')}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                  activeTab === 'library'
                    ? 'bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <FileAudio className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-white text-sm font-medium">My Library</div>
                <div className="text-gray-500 text-[10px]">Saved voices</div>
              </button>
            </div>

            {/* Quick Stats Row - PREMIUM ENHANCED! */}
            <div className="flex flex-wrap justify-center gap-4 text-gray-400 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold text-lg animate-pulse">25+</span>
                <span>ElevenLabs Voices</span>
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-purple-400 font-bold text-lg">6</span>
                <span>OpenAI Voices</span>
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-violet-400 font-bold text-lg animate-pulse">60+</span>
                <span>Premium Tracks</span>
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-pink-400 font-bold text-lg">16</span>
                <span>Genres</span>
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">Ultra HD</span>
                <span>Quality</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-5 md:grid-cols-10 bg-slate-800/50 rounded-xl p-1 mb-8">
            <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg text-xs">
              <Mic className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="story-mode" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg text-xs">
              <Bot className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="premium-music" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg text-xs relative">
              <Headphones className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </TabsTrigger>
            <TabsTrigger value="music" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white rounded-lg text-xs">
              <Music className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="song-mode" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg text-xs relative">
              <Music2 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="mixer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg text-xs">
              <Sliders className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg text-xs">
              <FileText className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="app-templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg text-xs">
              <Rocket className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-lg text-xs">
              <Layers className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg text-xs">
              <FileAudio className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* CREATE TAB */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Panel - Voice Settings */}
              <div className="space-y-6">
                {/* Voice Personas Selection - THE STAR OF THE SHOW! */}
                <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <span className="text-2xl">🎭</span>
                      Choose Your Voice
                      {useElevenLabs && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          ElevenLabs
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-cyan-300">
                      {useElevenLabs ? 'Ultra-realistic premium voices' : 'Celebrity-inspired AI voices'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {/* Provider Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-200">ElevenLabs Premium</span>
                      </div>
                      <button
                        onClick={() => {
                          setUseElevenLabs(!useElevenLabs);
                          setSelectedVoice(useElevenLabs ? 'nova' : 'rachel');
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          useElevenLabs ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            useElevenLabs ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Voice Personas */}
                    {(useElevenLabs ? elevenLabsVoicePersonas : aiVoicePersonas).map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`w-full p-3 rounded-xl text-left transition-all transform hover:scale-[1.02] ${
                          selectedVoice === voice.id
                            ? `bg-gradient-to-r ${voice.color} text-white shadow-lg`
                            : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{voice.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${selectedVoice === voice.id ? 'text-white' : 'text-white'}`}>
                                {voice.name}
                              </span>
                              <Badge className={`text-[10px] ${selectedVoice === voice.id ? 'bg-white/20 text-white' : 'bg-slate-600 text-gray-300'}`}>
                                {voice.persona}
                              </Badge>
                            </div>
                            <div className={`text-xs mt-0.5 ${selectedVoice === voice.id ? 'text-white/80' : 'text-gray-400'}`}>
                              {voice.tagline}
                            </div>
                            <div className={`text-[10px] mt-1 italic ${selectedVoice === voice.id ? 'text-white/60' : 'text-gray-500'}`}>
                              {voice.vibe}
                            </div>
                            {selectedVoice === voice.id && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {voice.bestFor.map((tag, i) => (
                                  <span key={i} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedVoice === voice.id && (
                          <div className="mt-3 p-2 bg-black/20 rounded-lg">
                            <div className="text-[10px] text-white/60 mb-1">SAMPLE LINE:</div>
                            <div className="text-xs text-white/90 italic">"{voice.sampleLine}"</div>
                          </div>
                        )}
                      </button>
                    ))}

                    {/* More Voices Coming Soon */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 text-center">
                      <div className="text-sm text-purple-300 font-medium">✨ More Voices Coming Soon!</div>
                      <div className="text-xs text-gray-400 mt-1">Custom voice cloning, accents, languages</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Style Presets */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Voice Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {voiceStyles.map((style) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={style.id}
                            onClick={() => applyStylePreset(style.id)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              selectedStyle === style.id
                                ? 'bg-purple-500/30 border border-purple-500/50'
                                : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                            <div className="text-sm text-white">{style.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Fine-tune Settings */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-pink-400" />
                      Fine-Tune
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Speed</span>
                        <span className="text-white">{voiceSettings.rate.toFixed(2)}x</span>
                      </div>
                      <Slider
                        value={[voiceSettings.rate]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, rate: value }))}
                        min={0.5}
                        max={1.5}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Pitch</span>
                        <span className="text-white">{voiceSettings.pitch.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[voiceSettings.pitch]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, pitch: value }))}
                        min={0.5}
                        max={1.5}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Volume</span>
                        <span className="text-white">{Math.round(voiceSettings.volume * 100)}%</span>
                      </div>
                      <Slider
                        value={[voiceSettings.volume]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, volume: value }))}
                        min={0.1}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center Panel - Script Editor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Category Quick Select */}
                <div className="flex flex-wrap gap-2">
                  {voiceCategories.slice(0, 6).map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          selectedCategory === cat.id
                            ? `bg-gradient-to-r ${cat.color} text-white`
                            : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Script Editor */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">Your Script</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={copyScript} className="text-gray-400 hover:text-white">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={enhanceScript} className="text-purple-400 hover:text-purple-300">
                          <Sparkles className="w-4 h-4 mr-1" />
                          AI Enhance
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder="Enter your script here...

Example: 'Welcome to SmartPromptIQ - the all-in-one platform for AI-powered content creation. Today, we'll show you how to build your first app blueprint in under 60 seconds...'"
                      className="min-h-[300px] bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500 resize-none"
                    />

                    {/* Stats bar */}
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <div className="flex gap-4 text-gray-400">
                        <span>{charCount} characters</span>
                        <span>{wordCount} words</span>
                        <span>~{estimatedDuration}s duration</span>
                      </div>
                      <div className="text-cyan-400 font-medium">
                        {estimatedTokens} tokens
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview & Generate Controls */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-4">
                    {/* Waveform placeholder */}
                    <div className="h-16 bg-slate-900/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {isPreviewing || isPlaying ? (
                        <div className="flex items-center gap-1">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full animate-pulse"
                              style={{
                                height: `${Math.random() * 40 + 10}px`,
                                animationDelay: `${i * 50}ms`,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <AudioWaveform className="w-5 h-5" />
                          <span>Audio waveform will appear here</span>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handlePreview}
                          disabled={!script.trim()}
                          className="border-slate-600 text-gray-300 hover:bg-slate-700"
                        >
                          {isPreviewing ? (
                            <>
                              <Square className="w-4 h-4 mr-2" />
                              Stop Preview
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Preview (Browser)
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-slate-600 text-gray-300 hover:bg-slate-700"
                          onClick={() => setScript('')}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Clear
                        </Button>

                        <Button
                          onClick={handleGenerate}
                          disabled={!script.trim() || isGenerating}
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 px-6"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Voice ({estimatedTokens} tokens)
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Generated audio player */}
                    {generatedAudioUrl && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              onClick={() => {
                                if (generatedAudioUrl.startsWith('browser-tts://')) {
                                  // Stop browser TTS
                                  if (isPlaying) {
                                    window.speechSynthesis?.cancel();
                                    setIsPlaying(false);
                                  } else {
                                    // Re-play browser TTS
                                    const utterance = new SpeechSynthesisUtterance(script.slice(0, 5000));
                                    utterance.rate = voiceSettings.rate;
                                    utterance.pitch = voiceSettings.pitch;
                                    utterance.volume = voiceSettings.volume;
                                    const voices = window.speechSynthesis.getVoices();
                                    const englishVoice = voices.find(v => v.lang.startsWith('en'));
                                    if (englishVoice) utterance.voice = englishVoice;
                                    utterance.onend = () => setIsPlaying(false);
                                    window.speechSynthesis.speak(utterance);
                                    setIsPlaying(true);
                                  }
                                } else if (audioRef.current) {
                                  if (isPlaying) {
                                    audioRef.current.pause();
                                  } else {
                                    audioRef.current.play();
                                  }
                                  setIsPlaying(!isPlaying);
                                }
                              }}
                              className="bg-cyan-500 hover:bg-cyan-600"
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <div>
                              <div className="text-white font-medium">
                                {generatedAudioUrl.startsWith('browser-tts://') ? 'Browser Voice (Preview)' : 'Generated Audio'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {generatedAudioUrl.startsWith('browser-tts://')
                                  ? 'Using free browser TTS - upgrade for premium AI voices'
                                  : `~${estimatedDuration} seconds`}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {generatedAudioUrl.startsWith('browser-tts://') ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/pricing')}
                                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                              >
                                <Crown className="w-4 h-4 mr-1" />
                                Upgrade for HD Voices
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleDownload}
                                  className={`${
                                    isPaidUser
                                      ? 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'
                                      : 'border-amber-500/50 text-amber-300 hover:bg-amber-500/20'
                                  }`}
                                >
                                  {isPaidUser ? (
                                    <>
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-4 h-4 mr-1" />
                                      Download
                                      <Crown className="w-3 h-3 ml-1 text-amber-400" />
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-pink-500/50 text-pink-300 hover:bg-pink-500/20"
                                  onClick={() => {
                                    toast({
                                      title: 'Voice Saved to Video Builder!',
                                      description: 'Go to Video Builder to use this voice in your video.',
                                    });
                                    navigate('/video-builder');
                                  }}
                                >
                                  <Video className="w-4 h-4 mr-1" />
                                  Use in Video
                                </Button>
                                <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                                  <Share2 className="w-4 h-4 mr-1" />
                                  Share
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {!generatedAudioUrl.startsWith('browser-tts://') && (
                          <audio ref={audioRef} src={generatedAudioUrl} className="hidden" />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Voice Script Templates</h2>
              <p className="text-gray-400">Pre-written scripts optimized for voice delivery. Just customize and generate!</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scriptTemplates.map((template) => {
                const category = voiceCategories.find(c => c.id === template.category);
                const Icon = category?.icon || FileText;

                return (
                  <Card key={template.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <Badge className="bg-slate-700 text-gray-300">{category?.name}</Badge>
                      </div>
                      <CardTitle className="text-white group-hover:text-cyan-300 transition-colors">
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {template.template.slice(0, 150)}...
                      </p>
                      <Button
                        onClick={() => {
                          applyTemplate(template);
                          setActiveTab('create');
                        }}
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* STORY MODE VOICE TAB */}
          <TabsContent value="story-mode" className="space-y-6">
            <StoryModeVoice />
          </TabsContent>

          {/* PREMIUM MUSIC LIBRARY TAB - FREE ROYALTY-FREE TRACKS! */}
          <TabsContent value="premium-music" className="space-y-6">
            <PremiumMusicLibrary
              onSelectTrack={(track) => {
                toast({
                  title: 'Track Selected!',
                  description: `"${track.name}" by ${track.artist} ready to use.`,
                });
              }}
            />
          </TabsContent>

          {/* MUSIC MAKER TAB */}
          <TabsContent value="music" className="space-y-6">
            <MusicMakerPro
              onMusicSelected={(track) => {
                toast({
                  title: 'Music Selected!',
                  description: `"${track.name}" ready to use in your project.`,
                });
              }}
            />
          </TabsContent>

          {/* VOICE + MUSIC MIXER TAB */}
          <TabsContent value="mixer" className="space-y-6">
            <VoiceMusicMixer />
          </TabsContent>

          {/* SONG MODE TAB - Voice to Song! */}
          <TabsContent value="song-mode" className="space-y-6">
            <VoiceToSong />
          </TabsContent>

          {/* VOICE APP TEMPLATES TAB */}
          <TabsContent value="app-templates" className="space-y-6">
            <VoiceAppTemplates
              onSelectTemplate={(template) => {
                toast({
                  title: `${template.name} Selected!`,
                  description: 'Redirecting to BuilderIQ to build your voice app...',
                });
              }}
            />
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Voice Categories</h2>
              <p className="text-gray-400">Choose a category to get optimized voice settings and templates</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {voiceCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <Card
                    key={category.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveTab('create');
                      toast({ title: category.name, description: `Voice settings optimized for ${category.name.toLowerCase()}` });
                    }}
                  >
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-white">{category.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {category.useCases.slice(0, 3).map((useCase, i) => (
                          <Badge key={i} className="bg-slate-700/50 text-gray-300 text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* MY VOICES TAB */}
          <TabsContent value="library" className="space-y-6">
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                <FileAudio className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No voice projects yet</h3>
              <p className="text-gray-400 mb-6">Generate your first AI voiceover to see it here</p>
              <Button
                onClick={() => setActiveTab('create')}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              >
                <Mic className="w-4 h-4 mr-2" />
                Create Your First Voice
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Integration Section */}
      <div className="bg-slate-800/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <Zap className="w-3 h-3 mr-1" /> Platform Integration
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Voice Builder Works Everywhere in SmartPromptIQ
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Generate voice content directly from your app blueprints, courses, and prompts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 text-center p-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">App Builder Integration</h3>
              <p className="text-gray-400 text-sm mb-4">
                Generate a 60-second pitch narration directly from your app blueprint
              </p>
              <Button variant="outline" className="border-purple-500/50 text-purple-300" onClick={() => navigate('/builderiq')}>
                Try App Builder
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-center p-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Academy Integration</h3>
              <p className="text-gray-400 text-sm mb-4">
                Create professional narrations for your course lessons and tutorials
              </p>
              <Button variant="outline" className="border-blue-500/50 text-blue-300" onClick={() => navigate('/academy')}>
                View Academy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-center p-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Prompt Generator</h3>
              <p className="text-gray-400 text-sm mb-4">
                Convert your generated marketing copy into professional voiceovers
              </p>
              <Button variant="outline" className="border-green-500/50 text-green-300" onClick={() => navigate('/categories')}>
                Generate Prompts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Give Your Content a Voice?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Start creating professional AI voiceovers today. Free preview available.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setActiveTab('create')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 px-8"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 px-8"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Modals from Feature Gates */}
      <downloadGate.UpgradeModal />
      <elevenLabsGate.UpgradeModal />
      <storyModeGate.UpgradeModal />
    </div>
  );
};

export default VoiceBuilder;
