/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - VIDEO BUILDER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Create professional short videos with AI voice, music, and stunning visuals!
 * Perfect for TikTok, Instagram Reels, YouTube Shorts, and marketing content.
 *
 * Features:
 * - Pre-built video templates for social media
 * - ElevenLabs voice integration
 * - Premium music library integration
 * - Scene-based timeline editor
 * - Real-time preview
 * - Multiple export formats and aspect ratios
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Play,
  Pause,
  Download,
  Music,
  Mic,
  Image,
  Type,
  Layers,
  Settings2,
  Wand2,
  Clock,
  RefreshCw,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Film,
  Smartphone,
  Monitor,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Volume2,
  VolumeX,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Palette,
  LayoutTemplate,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  MUSIC_CATEGORIES,
  getTracksByGenre,
  type PremiumTrack,
  type MusicGenreType,
} from '@/config/premiumMusic';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'social' | 'tutorial' | 'intro' | 'promo' | 'story';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  duration: number;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

interface VideoScene {
  id: string;
  title: string;
  subtitle?: string;
  duration: number;
  backgroundImage?: string;
  backgroundColor: string;
  textColor: string;
  textStyle: string;
  effect: string;
}

interface RenderStatus {
  id: string;
  status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed';
  url?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const VIDEO_TEMPLATES: VideoTemplate[] = [
  // Social Media - Vertical
  {
    id: 'tiktok-promo',
    name: 'TikTok Promo',
    description: 'Eye-catching vertical video for TikTok',
    category: 'social',
    aspectRatio: '9:16',
    duration: 15,
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-pink-500 to-violet-500',
    popular: true,
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    description: 'Engaging Reel for Instagram',
    category: 'social',
    aspectRatio: '9:16',
    duration: 30,
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    popular: true,
  },
  {
    id: 'youtube-short',
    name: 'YouTube Short',
    description: 'Vertical short for YouTube',
    category: 'social',
    aspectRatio: '9:16',
    duration: 60,
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-red-500 to-orange-500',
  },
  // Marketing - Horizontal
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Professional product demo video',
    category: 'marketing',
    aspectRatio: '16:9',
    duration: 30,
    icon: <Monitor className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    popular: true,
  },
  {
    id: 'brand-intro',
    name: 'Brand Introduction',
    description: 'Introduce your brand with style',
    category: 'marketing',
    aspectRatio: '16:9',
    duration: 45,
    icon: <Monitor className="w-5 h-5" />,
    color: 'from-indigo-500 to-purple-500',
  },
  // Tutorial
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial video',
    category: 'tutorial',
    aspectRatio: '16:9',
    duration: 120,
    icon: <Film className="w-5 h-5" />,
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 'quick-tip',
    name: 'Quick Tip',
    description: 'Short educational tip video',
    category: 'tutorial',
    aspectRatio: '16:9',
    duration: 30,
    icon: <Zap className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-500',
  },
  // Intro/Outro
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    description: 'Professional channel intro',
    category: 'intro',
    aspectRatio: '16:9',
    duration: 5,
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-red-500 to-pink-500',
    popular: true,
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Intro',
    description: 'Intro for video podcasts',
    category: 'intro',
    aspectRatio: '16:9',
    duration: 8,
    icon: <Mic className="w-5 h-5" />,
    color: 'from-violet-500 to-purple-500',
  },
  // Square
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    description: 'Square video for Instagram feed',
    category: 'social',
    aspectRatio: '1:1',
    duration: 30,
    icon: <Square className="w-5 h-5" />,
    color: 'from-rose-500 to-pink-500',
  },
];

const ASPECT_RATIOS = [
  { id: '16:9', name: 'Landscape', icon: <RectangleHorizontal className="w-4 h-4" />, description: 'YouTube, Vimeo' },
  { id: '9:16', name: 'Portrait', icon: <RectangleVertical className="w-4 h-4" />, description: 'TikTok, Reels, Shorts' },
  { id: '1:1', name: 'Square', icon: <Square className="w-4 h-4" />, description: 'Instagram Feed' },
  { id: '4:5', name: 'Portrait 4:5', icon: <RectangleVertical className="w-4 h-4" />, description: 'Instagram Portrait' },
];

const TEXT_STYLES = [
  { id: 'future', name: 'Modern', sample: 'MODERN' },
  { id: 'blockbuster', name: 'Bold', sample: 'BOLD' },
  { id: 'minimal', name: 'Minimal', sample: 'minimal' },
  { id: 'skinny', name: 'Elegant', sample: 'elegant' },
  { id: 'chunk', name: 'Playful', sample: 'PLAYFUL' },
  { id: 'marker', name: 'Cinematic', sample: 'CINEMATIC' },
];

const COLOR_PRESETS = [
  { id: 'dark', name: 'Dark', background: '#0a0a0a', text: '#ffffff', accent: '#6366f1' },
  { id: 'light', name: 'Light', background: '#ffffff', text: '#1a1a2e', accent: '#3b82f6' },
  { id: 'vibrant', name: 'Vibrant', background: '#1a1a2e', text: '#ffffff', accent: '#ec4899' },
  { id: 'corporate', name: 'Corporate', background: '#16213e', text: '#ffffff', accent: '#0ea5e9' },
  { id: 'warm', name: 'Warm', background: '#2d132c', text: '#ffffff', accent: '#f59e0b' },
  { id: 'cool', name: 'Cool', background: '#0d1b2a', text: '#ffffff', accent: '#06b6d4' },
];

const ELEVENLABS_VOICES = [
  { id: 'rachel', name: 'Rachel', gender: 'female', style: 'Warm & Natural' },
  { id: 'adam', name: 'Adam', gender: 'male', style: 'Deep & Authoritative' },
  { id: 'josh', name: 'Josh', gender: 'male', style: 'Young & Energetic' },
  { id: 'bella', name: 'Bella', gender: 'female', style: 'Soft & Expressive' },
  { id: 'emily', name: 'Emily', gender: 'female', style: 'Clear & News-like' },
  { id: 'sam', name: 'Sam', gender: 'male', style: 'Warm & Engaging' },
  { id: 'brian', name: 'Brian', gender: 'male', style: 'Smooth Podcast' },
  { id: 'charlotte', name: 'Charlotte', gender: 'female', style: 'British & Professional' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function VideoBuilder() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Tab state
  const [activeTab, setActiveTab] = useState<'templates' | 'scenes' | 'voice' | 'music' | 'style' | 'export'>('templates');

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);

  // Video settings
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('16:9');
  const [duration, setDuration] = useState(15);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textStyle, setTextStyle] = useState('future');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  // Scenes
  const [scenes, setScenes] = useState<VideoScene[]>([]);

  // Voice
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // Music
  const [selectedGenre, setSelectedGenre] = useState<MusicGenreType | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<PremiumTrack | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [voiceVolume, setVoiceVolume] = useState(1.0);

  // Export
  const [format, setFormat] = useState<'mp4' | 'gif' | 'webm'>('mp4');
  const [resolution, setResolution] = useState<'hd' | '1080' | '4k'>('1080');
  const [isRendering, setIsRendering] = useState(false);
  const [renderStatus, setRenderStatus] = useState<RenderStatus | null>(null);

  // Preview
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get tracks for selected genre
  const genreTracks = selectedGenre ? getTracksByGenre(selectedGenre) : [];

  // Select template
  const handleSelectTemplate = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setAspectRatio(template.aspectRatio);
    setDuration(template.duration);

    toast({
      title: `Template: ${template.name}`,
      description: `${template.aspectRatio} • ${template.duration}s duration`,
    });

    setActiveTab('scenes');
  };

  // Add scene
  const addScene = () => {
    const newScene: VideoScene = {
      id: `scene-${Date.now()}`,
      title: `Scene ${scenes.length + 1}`,
      duration: 5,
      backgroundColor,
      textColor,
      textStyle,
      effect: 'zoomIn',
    };
    setScenes([...scenes, newScene]);
  };

  // Update scene
  const updateScene = (id: string, updates: Partial<VideoScene>) => {
    setScenes(scenes.map(scene =>
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  };

  // Remove scene
  const removeScene = (id: string) => {
    setScenes(scenes.filter(scene => scene.id !== id));
  };

  // Generate voice
  const generateVoice = async () => {
    if (!script.trim()) {
      toast({
        title: 'Script Required',
        description: 'Please enter a script for voice generation',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingVoice(true);

    try {
      const response = await fetch('/api/elevenlabs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voiceName: selectedVoice,
          model: 'eleven_multilingual_v2',
        }),
      });

      if (!response.ok) {
        throw new Error('Voice generation failed');
      }

      const data = await response.json();
      setVoiceUrl(data.audioUrl);

      toast({
        title: 'Voice Generated!',
        description: `Generated with ${selectedVoice} voice`,
      });

      setActiveTab('music');
    } catch (error) {
      console.error('Voice generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate voice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Select music track
  const handleSelectTrack = (track: PremiumTrack) => {
    setSelectedTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
    }
  };

  // Upload background image
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

  // Apply color preset
  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setBackgroundColor(preset.background);
    setTextColor(preset.text);
  };

  // Render video
  const renderVideo = async () => {
    if (!title && scenes.length === 0) {
      toast({
        title: 'Content Required',
        description: 'Please add a title or scenes before rendering',
        variant: 'destructive',
      });
      return;
    }

    setIsRendering(true);
    setRenderStatus({ id: '', status: 'queued' });

    try {
      let response;

      if (scenes.length > 0) {
        // Render with scenes
        response = await fetch('/api/shotstack/scenes-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenes: scenes.map(scene => ({
              title: scene.title,
              subtitle: scene.subtitle,
              duration: scene.duration,
              backgroundImage: scene.backgroundImage,
              backgroundColor: scene.backgroundColor,
              textColor: scene.textColor,
              textStyle: scene.textStyle,
              effect: scene.effect,
            })),
            musicUrl: selectedTrack?.audioUrl,
            musicVolume,
            voiceUrl,
            voiceVolume,
            aspectRatio,
            format,
            resolution,
          }),
        });
      } else {
        // Quick video with title
        response = await fetch('/api/shotstack/quick-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            subtitle,
            backgroundImage,
            backgroundColor,
            textColor,
            textStyle,
            musicUrl: selectedTrack?.audioUrl,
            musicVolume,
            voiceUrl,
            voiceVolume,
            duration,
            aspectRatio,
            format,
            resolution,
          }),
        });
      }

      if (!response.ok) {
        throw new Error('Video render failed');
      }

      const data = await response.json();
      setRenderStatus({ id: data.renderId, status: 'rendering' });

      // Poll for status
      pollRenderStatus(data.renderId);

      toast({
        title: 'Rendering Started!',
        description: 'Your video is being created. This may take a moment.',
      });
    } catch (error) {
      console.error('Render error:', error);
      setRenderStatus({ id: '', status: 'failed', error: 'Render failed' });
      toast({
        title: 'Render Failed',
        description: 'Could not start video rendering. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRendering(false);
    }
  };

  // Poll render status
  const pollRenderStatus = async (renderId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/shotstack/render/${renderId}`);
        const data = await response.json();

        setRenderStatus({
          id: renderId,
          status: data.status,
          url: data.url,
          error: data.error,
        });

        if (data.status === 'done') {
          toast({
            title: 'Video Ready!',
            description: 'Your video has been rendered successfully.',
          });
          return;
        }

        if (data.status === 'failed') {
          toast({
            title: 'Render Failed',
            description: data.error || 'An error occurred during rendering.',
            variant: 'destructive',
          });
          return;
        }

        attempts++;
        if (attempts < maxAttempts && ['queued', 'fetching', 'rendering', 'saving'].includes(data.status)) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    };

    poll();
  };

  // Copy video URL
  const copyVideoUrl = () => {
    if (renderStatus?.url) {
      navigator.clipboard.writeText(renderStatus.url);
      toast({
        title: 'URL Copied!',
        description: 'Video URL copied to clipboard',
      });
    }
  };

  // Calculate total duration from scenes
  const totalDuration = scenes.length > 0
    ? scenes.reduce((total, scene) => total + scene.duration, 0)
    : duration;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Hidden Audio */}
      <audio ref={audioRef} preload="metadata" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Video Builder
              </h1>
              <p className="text-gray-400">Create stunning short videos with AI voice & music</p>
            </div>
            {selectedTemplate && (
              <Badge className="ml-auto bg-violet-500/20 text-violet-300 border-violet-500/30">
                {selectedTemplate.name} • {selectedTemplate.aspectRatio}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="bg-white/5 border border-white/10 flex-wrap">
                <TabsTrigger value="templates" className="data-[state=active]:bg-violet-500">
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="scenes" className="data-[state=active]:bg-violet-500">
                  <Layers className="w-4 h-4 mr-2" />
                  Scenes
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-green-500">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="music" className="data-[state=active]:bg-blue-500">
                  <Music className="w-4 h-4 mr-2" />
                  Music
                </TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-pink-500">
                  <Palette className="w-4 h-4 mr-2" />
                  Style
                </TabsTrigger>
                <TabsTrigger value="export" className="data-[state=active]:bg-amber-500">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6 mt-6">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'social', 'marketing', 'tutorial', 'intro'].map((cat) => (
                    <Button
                      key={cat}
                      variant="outline"
                      size="sm"
                      className="capitalize"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {VIDEO_TEMPLATES.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all border-2 ${
                          selectedTemplate?.id === template.id
                            ? 'border-violet-500 bg-violet-500/10'
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
                                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  {template.aspectRatio === '9:16' ? (
                                    <RectangleVertical className="w-3 h-3" />
                                  ) : template.aspectRatio === '1:1' ? (
                                    <Square className="w-3 h-3" />
                                  ) : (
                                    <RectangleHorizontal className="w-3 h-3" />
                                  )}
                                  {template.aspectRatio}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {template.duration}s
                                </span>
                              </div>
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <Check className="w-5 h-5 text-violet-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Scenes Tab */}
              <TabsContent value="scenes" className="space-y-6 mt-6">
                {/* Quick Video Option */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      Quick Video
                    </CardTitle>
                    <CardDescription>
                      Create a simple video with title and subtitle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Main Title
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your main title"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Subtitle (Optional)
                      </label>
                      <Input
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Enter a subtitle"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Duration: {duration}s
                      </label>
                      <Slider
                        value={[duration]}
                        onValueChange={([v]) => setDuration(v)}
                        min={5}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Scenes Editor */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-violet-400" />
                      Scene Timeline
                    </CardTitle>
                    <CardDescription>
                      Add multiple scenes for a more complex video
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scenes.map((scene, index) => (
                      <motion.div
                        key={scene.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="bg-violet-500/20 text-violet-300">
                            {index + 1}
                          </Badge>
                          <Input
                            value={scene.title}
                            onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                            className="flex-1 bg-white/5 border-white/10 text-white"
                            placeholder="Scene title"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeScene(scene.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400">Subtitle</label>
                            <Input
                              value={scene.subtitle || ''}
                              onChange={(e) => updateScene(scene.id, { subtitle: e.target.value })}
                              className="mt-1 bg-white/5 border-white/10 text-white text-sm"
                              placeholder="Optional subtitle"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Duration: {scene.duration}s</label>
                            <Slider
                              value={[scene.duration]}
                              onValueChange={([v]) => updateScene(scene.id, { duration: v })}
                              min={2}
                              max={30}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <Button
                      onClick={addScene}
                      variant="outline"
                      className="w-full border-dashed border-white/20 text-gray-400 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Scene
                    </Button>

                    {scenes.length > 0 && (
                      <div className="flex justify-between text-sm text-gray-400 pt-2 border-t border-white/10">
                        <span>{scenes.length} scenes</span>
                        <span>Total: {formatTime(totalDuration)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-green-400" />
                      AI Voice Narration
                    </CardTitle>
                    <CardDescription>
                      Generate professional voice-over with ElevenLabs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Voice Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Select Voice
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {ELEVENLABS_VOICES.map((voice) => (
                          <Button
                            key={voice.id}
                            variant={selectedVoice === voice.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedVoice(voice.id)}
                            className={selectedVoice === voice.id ? 'bg-green-500' : ''}
                          >
                            {voice.name}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {ELEVENLABS_VOICES.find(v => v.id === selectedVoice)?.style}
                      </p>
                    </div>

                    {/* Script Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Voice Script
                      </label>
                      <Textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Enter the text you want to convert to voice..."
                        className="min-h-[150px] bg-white/5 border-white/10 text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {script.length} characters
                      </p>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateVoice}
                      disabled={isGeneratingVoice || !script.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {isGeneratingVoice ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Voice...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Voice
                        </>
                      )}
                    </Button>

                    {/* Voice Preview */}
                    {voiceUrl && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className="text-green-300">Voice generated successfully!</span>
                          <audio src={voiceUrl} controls className="ml-auto h-8" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Music Tab */}
              <TabsContent value="music" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-blue-400" />
                      Background Music
                    </CardTitle>
                    <CardDescription>
                      Choose from 500+ royalty-free tracks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Genre Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Select Genre
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MUSIC_CATEGORIES.map((category) => (
                          <Button
                            key={category.id}
                            variant={selectedGenre === category.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedGenre(category.id)}
                            className={selectedGenre === category.id ? 'bg-blue-500' : ''}
                          >
                            <span className="mr-1">{category.icon}</span>
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Track List */}
                    {selectedGenre && (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {genreTracks.slice(0, 20).map((track) => (
                          <motion.div
                            key={track.id}
                            whileHover={{ x: 4 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all ${
                                selectedTrack?.id === track.id
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : 'border-white/10 bg-white/5 hover:bg-white/10'
                              }`}
                              onClick={() => handleSelectTrack(track)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: (track.waveformColor || '#6366f1') + '30' }}
                                  >
                                    <Music className="w-5 h-5" style={{ color: track.waveformColor || '#6366f1' }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white truncate">{track.name}</h4>
                                    <p className="text-sm text-gray-400">{track.mood}</p>
                                  </div>
                                  {selectedTrack?.id === track.id && (
                                    <Check className="w-5 h-5 text-blue-400" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Volume Controls */}
                    {selectedTrack && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div>
                          <label className="text-sm text-gray-300 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Music Volume: {Math.round(musicVolume * 100)}%
                          </label>
                          <Slider
                            value={[musicVolume * 100]}
                            onValueChange={([v]) => setMusicVolume(v / 100)}
                            min={0}
                            max={100}
                            className="mt-2"
                          />
                        </div>
                        {voiceUrl && (
                          <div>
                            <label className="text-sm text-gray-300 flex items-center gap-2">
                              <Mic className="w-4 h-4" />
                              Voice Volume: {Math.round(voiceVolume * 100)}%
                            </label>
                            <Slider
                              value={[voiceVolume * 100]}
                              onValueChange={([v]) => setVoiceVolume(v / 100)}
                              min={0}
                              max={100}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Style Tab */}
              <TabsContent value="style" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-pink-400" />
                      Visual Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Aspect Ratio */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Aspect Ratio
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {ASPECT_RATIOS.map((ratio) => (
                          <Button
                            key={ratio.id}
                            variant={aspectRatio === ratio.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAspectRatio(ratio.id as any)}
                            className={`flex-col h-auto py-3 ${aspectRatio === ratio.id ? 'bg-pink-500' : ''}`}
                          >
                            {ratio.icon}
                            <span className="mt-1">{ratio.name}</span>
                            <span className="text-xs opacity-70">{ratio.description}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Color Presets */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Color Theme
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => applyColorPreset(preset)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              backgroundColor === preset.background
                                ? 'border-white'
                                : 'border-transparent hover:border-white/30'
                            }`}
                            style={{ backgroundColor: preset.background }}
                          >
                            <div
                              className="w-full h-4 rounded text-xs font-bold flex items-center justify-center"
                              style={{ color: preset.text }}
                            >
                              {preset.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1 bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Text Style */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Text Style
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {TEXT_STYLES.map((style) => (
                          <Button
                            key={style.id}
                            variant={textStyle === style.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTextStyle(style.id)}
                            className={textStyle === style.id ? 'bg-pink-500' : ''}
                          >
                            {style.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Background Image */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Background Image (Optional)
                      </label>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('bg-upload')?.click()}
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
                        id="bg-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {backgroundImage && (
                        <div className="mt-3 relative w-40 h-24 rounded-lg overflow-hidden">
                          <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Download className="w-5 h-5 text-amber-400" />
                      Export Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Format */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Video Format
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'mp4', name: 'MP4', description: 'Best compatibility' },
                          { id: 'webm', name: 'WebM', description: 'Web optimized' },
                          { id: 'gif', name: 'GIF', description: 'Animated image' },
                        ].map((f) => (
                          <Button
                            key={f.id}
                            variant={format === f.id ? 'default' : 'outline'}
                            onClick={() => setFormat(f.id as any)}
                            className={`flex-col h-auto py-3 ${format === f.id ? 'bg-amber-500' : ''}`}
                          >
                            <span className="font-bold">{f.name}</span>
                            <span className="text-xs opacity-70">{f.description}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Resolution */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Resolution
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'hd', name: 'HD', description: '720p' },
                          { id: '1080', name: 'Full HD', description: '1080p' },
                          { id: '4k', name: '4K', description: '2160p' },
                        ].map((r) => (
                          <Button
                            key={r.id}
                            variant={resolution === r.id ? 'default' : 'outline'}
                            onClick={() => setResolution(r.id as any)}
                            className={`flex-col h-auto py-3 ${resolution === r.id ? 'bg-amber-500' : ''}`}
                          >
                            <span className="font-bold">{r.name}</span>
                            <span className="text-xs opacity-70">{r.description}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Render Button */}
                    <Button
                      onClick={renderVideo}
                      disabled={isRendering || (!title && scenes.length === 0)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg py-6"
                    >
                      {isRendering ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Rendering Video...
                        </>
                      ) : (
                        <>
                          <Video className="w-5 h-5 mr-2" />
                          Render Video
                        </>
                      )}
                    </Button>

                    {/* Render Status */}
                    {renderStatus && (
                      <div className={`p-4 rounded-lg border ${
                        renderStatus.status === 'done'
                          ? 'bg-green-500/10 border-green-500/20'
                          : renderStatus.status === 'failed'
                            ? 'bg-red-500/10 border-red-500/20'
                            : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        <div className="flex items-center gap-3">
                          {renderStatus.status === 'done' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : renderStatus.status === 'failed' ? (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-white capitalize">
                              {renderStatus.status === 'done' ? 'Video Ready!' :
                               renderStatus.status === 'failed' ? 'Render Failed' :
                               `Status: ${renderStatus.status}`}
                            </p>
                            {renderStatus.error && (
                              <p className="text-sm text-red-400">{renderStatus.error}</p>
                            )}
                          </div>
                        </div>

                        {renderStatus.status === 'done' && renderStatus.url && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              asChild
                              className="flex-1 bg-green-500 hover:bg-green-600"
                            >
                              <a href={renderStatus.url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download Video
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={copyVideoUrl}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              asChild
                            >
                              <a href={renderStatus.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card className="border-white/10 bg-white/5 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-violet-400" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                <div
                  className={`relative rounded-xl overflow-hidden ${
                    aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[400px] mx-auto w-[225px]' :
                    aspectRatio === '1:1' ? 'aspect-square' :
                    aspectRatio === '4:5' ? 'aspect-[4/5]' :
                    'aspect-video'
                  }`}
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
                      <Video className="w-16 h-16 text-gray-600" />
                    </div>
                  )}

                  {/* Title Overlay */}
                  {(title || (scenes.length > 0 && scenes[0].title)) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <h2
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: textColor }}
                      >
                        {title || scenes[0]?.title}
                      </h2>
                      {(subtitle || scenes[0]?.subtitle) && (
                        <p
                          className="text-lg mt-2 opacity-80"
                          style={{ color: textColor }}
                        >
                          {subtitle || scenes[0]?.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Audio Waveform */}
                  {(selectedTrack || voiceUrl) && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-center gap-0.5 h-6">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full bg-white/60"
                            animate={{
                              height: isPreviewPlaying ? [4, Math.random() * 16 + 4, 4] : 4,
                            }}
                            transition={{
                              duration: 0.4,
                              repeat: isPreviewPlaying ? Infinity : 0,
                              delay: i * 0.02,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Aspect Ratio:</span>
                    <span className="text-white">{aspectRatio}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Duration:</span>
                    <span className="text-white">{formatTime(totalDuration)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Scenes:</span>
                    <span className="text-white">{scenes.length || 1}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Voice:</span>
                    <span className="text-white">{voiceUrl ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Music:</span>
                    <span className="text-white">{selectedTrack?.name || 'None'}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('voice')}
                    className={voiceUrl ? 'border-green-500/50 text-green-300' : ''}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {voiceUrl ? 'Voice Added' : 'Add Voice'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('music')}
                    className={selectedTrack ? 'border-blue-500/50 text-blue-300' : ''}
                  >
                    <Music className="w-4 h-4 mr-2" />
                    {selectedTrack ? 'Music Added' : 'Add Music'}
                  </Button>
                </div>

                {/* Render Button */}
                <Button
                  onClick={renderVideo}
                  disabled={isRendering || (!title && scenes.length === 0)}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rendering...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Create Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    Use 9:16 for TikTok & Reels
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    Keep intros under 5 seconds
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    Lower music volume when using voice
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    Add multiple scenes for storytelling
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
