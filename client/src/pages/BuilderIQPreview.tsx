/**
 * BuilderIQ App Preview Playground
 *
 * An interactive preview of the user's app before deployment!
 * Shows a live mockup with working features to get users EXCITED!
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import {
  Play, Pause, Volume2, VolumeX, Smartphone, Monitor, Tablet,
  Sparkles, Rocket, ChevronRight, Check, X, Bell, User, Search,
  Home, Settings, BarChart3, MessageSquare, Plus, Star, Heart,
  ShoppingCart, CreditCard, Lock, Mail, Eye, EyeOff, Menu,
  Moon, Sun, Zap, ArrowRight, Download, Share2, ExternalLink,
  Code, Globe, Terminal, Layers, Cloud, Github
} from 'lucide-react';

interface PreviewData {
  appName: string;
  appDescription: string;
  appType: string;
  designStyle: string;
  colorScheme: string;
  features: string[];
  authentication: string;
  payments: string;
  aiFeatures: string[];
  audioSelection?: {
    backgroundMusic?: { name: string; audioUrl: string };
    voiceNarration?: { voiceName: string };
    autoPlay: boolean;
    musicVolume: number;
  };
}

const BuilderIQPreview: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeScreen, setActiveScreen] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Deployment platforms configuration
  const deploymentPlatforms = [
    {
      id: 'base44',
      name: 'Base44',
      description: 'Instant no-code deployment with AI features',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Recommended',
      features: ['No code required', 'AI-powered', 'Instant deploy'],
    },
    {
      id: 'bolt',
      name: 'Bolt.new',
      description: 'Lightning fast full-stack deployment',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      badge: 'Fast',
      features: ['Full-stack', 'Real-time preview', 'Git integration'],
    },
    {
      id: 'lovable',
      name: 'Lovable',
      description: 'Beautiful apps with AI assistance',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      badge: 'Popular',
      features: ['AI-assisted', 'Beautiful UI', 'Easy sharing'],
    },
    {
      id: 'replit',
      name: 'Replit',
      description: 'Collaborative coding and deployment',
      icon: Terminal,
      color: 'from-orange-500 to-red-500',
      badge: '',
      features: ['Collaborative', 'IDE included', 'Many languages'],
    },
    {
      id: 'claude',
      name: 'Claude AI',
      description: 'AI-powered code generation and refinement',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-500',
      badge: 'AI',
      features: ['Code generation', 'Refinement', 'Documentation'],
    },
    {
      id: 'github',
      name: 'GitHub Export',
      description: 'Export to GitHub repository',
      icon: Github,
      color: 'from-gray-600 to-gray-800',
      badge: '',
      features: ['Version control', 'Collaboration', 'CI/CD ready'],
    },
  ];

  // Load preview data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('builderiq_responses');
    const audioStored = localStorage.getItem('builderiq_audio');

    if (stored) {
      const responses = JSON.parse(stored);
      // Get audio from separate storage or from responses
      const audioData = audioStored ? JSON.parse(audioStored) : responses.audio_selection;

      setPreviewData({
        appName: responses.app_name || 'SmartApp',
        appDescription: responses.main_purpose || 'Your amazing new application',
        appType: responses.app_type || 'web',
        designStyle: responses.design_style || 'professional',
        colorScheme: responses.color_scheme || 'purple_black_blue',
        features: responses.key_features || [],
        authentication: responses.authentication || 'basic',
        payments: responses.payments || 'none',
        aiFeatures: responses.ai_features || [],
        audioSelection: audioData,
      });
    }
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (previewData?.audioSelection?.backgroundMusic && previewData.audioSelection.autoPlay) {
      playBackgroundMusic();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [previewData]);

  const playBackgroundMusic = () => {
    if (previewData?.audioSelection?.backgroundMusic) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(previewData.audioSelection.backgroundMusic.audioUrl);
      audio.volume = previewData.audioSelection.musicVolume || 0.3;
      audio.loop = true;
      audioRef.current = audio;
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      playBackgroundMusic();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Demo login handler
  const handleDemoLogin = () => {
    if (demoEmail && demoPassword) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      toast({
        title: 'Welcome! 🎉',
        description: `Logged in as ${demoEmail}`,
      });
    }
  };

  // Get device frame dimensions
  const getDeviceStyle = () => {
    switch (deviceView) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '600px' };
      default:
        return { width: '100%', height: '600px' };
    }
  };

  // Get color scheme classes
  const getColorScheme = () => {
    switch (previewData?.colorScheme) {
      case 'purple_black_blue':
        return {
          primary: 'bg-gradient-to-r from-purple-600 to-blue-600',
          secondary: 'bg-purple-500',
          accent: 'text-purple-400',
          bg: isDarkMode ? 'bg-slate-900' : 'bg-gray-50',
          card: isDarkMode ? 'bg-slate-800' : 'bg-white',
          text: isDarkMode ? 'text-white' : 'text-gray-900',
          muted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        };
      case 'light':
        return {
          primary: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          secondary: 'bg-blue-500',
          accent: 'text-blue-500',
          bg: 'bg-gray-50',
          card: 'bg-white',
          text: 'text-gray-900',
          muted: 'text-gray-600',
        };
      case 'dark':
        return {
          primary: 'bg-gradient-to-r from-gray-700 to-gray-900',
          secondary: 'bg-gray-700',
          accent: 'text-gray-300',
          bg: 'bg-gray-900',
          card: 'bg-gray-800',
          text: 'text-white',
          muted: 'text-gray-400',
        };
      default:
        return {
          primary: 'bg-gradient-to-r from-purple-600 to-pink-600',
          secondary: 'bg-purple-500',
          accent: 'text-purple-400',
          bg: isDarkMode ? 'bg-slate-900' : 'bg-gray-50',
          card: isDarkMode ? 'bg-slate-800' : 'bg-white',
          text: isDarkMode ? 'text-white' : 'text-gray-900',
          muted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        };
    }
  };

  const colors = getColorScheme();

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400 mb-4">Loading your app preview...</p>
          <Button onClick={() => navigate('/builderiq')} className="bg-purple-500 hover:bg-purple-600">
            Create Your App
          </Button>
        </div>
      </div>
    );
  }

  // Render the mock app screens
  const renderAppScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <div className="p-4 space-y-4">
            {/* Welcome Section */}
            <div className={`${colors.card} rounded-xl p-4 border border-white/10`}>
              <h2 className={`text-lg font-bold ${colors.text} mb-1`}>
                {isLoggedIn ? `Welcome back! 👋` : `Welcome to ${previewData.appName}`}
              </h2>
              <p className={`text-sm ${colors.muted}`}>
                {previewData.appDescription}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              {previewData.features.slice(0, 4).map((feature, i) => (
                <button
                  key={feature}
                  onClick={() => toast({ title: `${feature} clicked!`, description: 'This feature works in the live app' })}
                  className={`${colors.card} rounded-xl p-4 border border-white/10 text-left hover:border-purple-500/50 transition-all`}
                >
                  <div className={`w-8 h-8 ${colors.primary} rounded-lg flex items-center justify-center mb-2`}>
                    {i === 0 && <BarChart3 className="w-4 h-4 text-white" />}
                    {i === 1 && <MessageSquare className="w-4 h-4 text-white" />}
                    {i === 2 && <Settings className="w-4 h-4 text-white" />}
                    {i === 3 && <Star className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-sm font-medium ${colors.text} capitalize`}>
                    {feature.replace(/_/g, ' ')}
                  </span>
                </button>
              ))}
            </div>

            {/* AI Features Demo */}
            {previewData.aiFeatures.length > 0 && (
              <div className={`${colors.card} rounded-xl p-4 border border-purple-500/30`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className={`font-semibold ${colors.text}`}>AI-Powered Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewData.aiFeatures.map(feature => (
                    <Badge key={feature} className="bg-purple-500/20 text-purple-300 border-purple-500/30 capitalize">
                      {feature.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Users', value: '1,234', icon: User },
                { label: 'Active', value: '89%', icon: Zap },
                { label: 'Rating', value: '4.9', icon: Star },
              ].map(stat => (
                <div key={stat.label} className={`${colors.card} rounded-xl p-3 text-center border border-white/10`}>
                  <stat.icon className={`w-4 h-4 ${colors.accent} mx-auto mb-1`} />
                  <p className={`text-lg font-bold ${colors.text}`}>{stat.value}</p>
                  <p className={`text-xs ${colors.muted}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-bold ${colors.text}`}>Dashboard</h2>
              <Badge className="bg-green-500/20 text-green-400">Live</Badge>
            </div>

            {/* Chart Mockup */}
            <div className={`${colors.card} rounded-xl p-4 border border-white/10`}>
              <p className={`text-sm ${colors.muted} mb-3`}>Performance Overview</p>
              <div className="flex items-end gap-1 h-24">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 ${colors.primary} rounded-t transition-all hover:opacity-80`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-xs ${colors.muted}`}>Jan</span>
                <span className={`text-xs ${colors.muted}`}>Dec</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${colors.card} rounded-xl p-4 border border-white/10`}>
              <p className={`text-sm ${colors.muted} mb-3`}>Recent Activity</p>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className={`w-8 h-8 ${colors.primary} rounded-full flex items-center justify-center`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${colors.text}`}>User action #{i}</p>
                    <p className={`text-xs ${colors.muted}`}>{i} min ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4 space-y-4">
            {/* Profile Header */}
            <div className={`${colors.card} rounded-xl p-6 border border-white/10 text-center`}>
              <div className={`w-20 h-20 ${colors.primary} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className={`text-xl font-bold ${colors.text}`}>
                {isLoggedIn ? demoEmail.split('@')[0] : 'Guest User'}
              </h2>
              <p className={`text-sm ${colors.muted}`}>
                {isLoggedIn ? 'Premium Member' : 'Not logged in'}
              </p>
              {!isLoggedIn && (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className={`mt-3 ${colors.secondary} text-white`}
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Settings */}
            <div className={`${colors.card} rounded-xl border border-white/10 overflow-hidden`}>
              {['Notifications', 'Privacy', 'Security', 'Help'].map((item, i) => (
                <button
                  key={item}
                  onClick={() => toast({ title: item, description: 'Settings opened' })}
                  className={`w-full flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all`}
                >
                  <span className={colors.text}>{item}</span>
                  <ChevronRight className={`w-4 h-4 ${colors.muted}`} />
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <BackButton />

          <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
            <div>
              <Badge className="mb-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30">
                <Play className="w-3 h-3 mr-1" /> Live Preview
              </Badge>
              <h1 className="text-3xl font-bold text-white mb-2">
                {previewData.appName} Preview
              </h1>
              <p className="text-gray-400">
                Interact with your app before deployment! Try the features below.
              </p>
            </div>

            <div className="flex gap-2">
              {/* Audio Controls */}
              {previewData.audioSelection?.backgroundMusic && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    className="border-slate-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMute}
                    className="border-slate-700"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              )}

              {/* Device Switcher */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                {[
                  { id: 'desktop', icon: Monitor },
                  { id: 'tablet', icon: Tablet },
                  { id: 'mobile', icon: Smartphone },
                ].map(device => (
                  <button
                    key={device.id}
                    onClick={() => setDeviceView(device.id as any)}
                    className={`p-2 rounded-md transition-all ${
                      deviceView === device.id
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <device.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="border-slate-700"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex justify-center mb-8">
          <div
            className={`${
              deviceView === 'mobile' ? 'rounded-[2.5rem] p-3 bg-slate-800 border-4 border-slate-700' :
              deviceView === 'tablet' ? 'rounded-2xl p-2 bg-slate-800 border-4 border-slate-700' :
              'rounded-xl border border-slate-700'
            } transition-all duration-500 overflow-hidden`}
            style={getDeviceStyle()}
          >
            {/* Device Notch (Mobile) */}
            {deviceView === 'mobile' && (
              <div className="flex justify-center mb-2">
                <div className="w-20 h-5 bg-slate-900 rounded-full" />
              </div>
            )}

            {/* App Frame */}
            <div className={`${colors.bg} h-full rounded-lg overflow-hidden flex flex-col`}>
              {/* App Header/Navbar */}
              <div className={`${colors.card} px-4 py-3 flex items-center justify-between border-b border-white/10`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${colors.primary} rounded-lg flex items-center justify-center`}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className={`font-bold ${colors.text}`}>{previewData.appName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <button
                    onClick={() => toast({ title: 'Search', description: 'Search functionality' })}
                    className={`p-2 rounded-lg hover:bg-white/10 ${colors.muted}`}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {/* Notifications */}
                  <button
                    onClick={() => {
                      setNotifications(0);
                      toast({ title: 'Notifications cleared!' });
                    }}
                    className={`p-2 rounded-lg hover:bg-white/10 relative ${colors.muted}`}
                  >
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </button>
                  {/* Profile */}
                  <button
                    onClick={() => setActiveScreen('profile')}
                    className={`w-8 h-8 ${colors.primary} rounded-full flex items-center justify-center`}
                  >
                    <User className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* App Content */}
              <div className="flex-1 overflow-y-auto">
                {renderAppScreen()}
              </div>

              {/* Bottom Navigation */}
              <div className={`${colors.card} px-4 py-2 flex justify-around border-t border-white/10`}>
                {[
                  { id: 'home', icon: Home, label: 'Home' },
                  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                  { id: 'add', icon: Plus, label: 'Add' },
                  { id: 'profile', icon: User, label: 'Profile' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'add') {
                        toast({ title: 'Create New', description: 'This opens the creation flow' });
                      } else {
                        setActiveScreen(tab.id);
                      }
                    }}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      activeScreen === tab.id
                        ? `${colors.accent}`
                        : colors.muted
                    }`}
                  >
                    {tab.id === 'add' ? (
                      <div className={`w-10 h-10 ${colors.primary} rounded-full flex items-center justify-center -mt-4`}>
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <tab.icon className="w-5 h-5" />
                    )}
                    <span className="text-[10px] mt-1">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Interactive Demo</h3>
                  <p className="text-xs text-gray-400">Click buttons to see actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Multi-Device</h3>
                  <p className="text-xs text-gray-400">See on desktop, tablet, mobile</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Audio Preview</h3>
                  <p className="text-xs text-gray-400">Hear your app's music & voice</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/builderiq/blueprint')}
            className="border-slate-700 text-gray-300"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            View Full Blueprint
          </Button>
          <Button
            onClick={() => setShowDeployModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Deploy Now
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigator.share?.({
                title: previewData.appName,
                text: `Check out my new app: ${previewData.appName}`,
                url: window.location.href,
              }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: 'Link copied!', description: 'Share your preview with others' });
              });
            }}
            className="border-slate-700 text-gray-300"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Preview
          </Button>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
            <div className={`${colors.card} rounded-2xl p-6 w-full max-w-md mx-4 border border-white/10`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${colors.text}`}>Sign In Demo</h2>
                <button onClick={() => setShowLoginModal(false)} className={colors.muted}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`text-sm ${colors.muted} block mb-1`}>Email</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.muted}`} />
                    <Input
                      type="email"
                      placeholder="demo@example.com"
                      value={demoEmail}
                      onChange={e => setDemoEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <label className={`text-sm ${colors.muted} block mb-1`}>Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.muted}`} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={demoPassword}
                      onChange={e => setDemoPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/5 border-white/10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.muted}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={handleDemoLogin} className={`w-full ${colors.primary}`}>
                  Sign In
                </Button>
                <p className={`text-xs text-center ${colors.muted}`}>
                  This is a demo login. Enter any email/password to test.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deployment Platform Selector Modal */}
        {showDeployModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeployModal(false)}>
            <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-purple-400" />
                    Deploy Your App
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Choose your preferred deployment platform for "{previewData.appName}"
                  </p>
                </div>
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Platform Grid */}
              <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deploymentPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatform === platform.id;

                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`relative p-5 rounded-xl border-2 transition-all text-left group ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      {/* Badge */}
                      {platform.badge && (
                        <Badge className={`absolute -top-2 -right-2 bg-gradient-to-r ${platform.color} text-white text-xs`}>
                          {platform.badge}
                        </Badge>
                      )}

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${platform.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Platform name and description */}
                      <h3 className="text-lg font-semibold text-white mb-1">{platform.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{platform.description}</p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-slate-700/50 rounded-md text-gray-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 flex flex-wrap gap-3 justify-between items-center">
                <p className="text-sm text-gray-400">
                  {selectedPlatform
                    ? `Ready to deploy to ${deploymentPlatforms.find(p => p.id === selectedPlatform)?.name}`
                    : 'Select a platform to continue'}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeployModal(false)}
                    className="border-slate-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedPlatform) {
                        const platform = deploymentPlatforms.find(p => p.id === selectedPlatform);
                        toast({
                          title: `Deploying to ${platform?.name}! 🚀`,
                          description: 'Preparing your app for deployment...',
                        });
                        setShowDeployModal(false);

                        // Store deployment choice and navigate
                        localStorage.setItem('builderiq_deploy_platform', selectedPlatform);
                        navigate('/deployment-hub');
                      } else {
                        toast({
                          title: 'Select a platform',
                          description: 'Please choose a deployment platform first',
                          variant: 'destructive',
                        });
                      }
                    }}
                    disabled={!selectedPlatform}
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 ${!selectedPlatform ? 'opacity-50' : ''}`}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy to {selectedPlatform ? deploymentPlatforms.find(p => p.id === selectedPlatform)?.name : 'Platform'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderIQPreview;
