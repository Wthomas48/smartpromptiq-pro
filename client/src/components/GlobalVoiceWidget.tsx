import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useElevenLabsVoiceSafe } from '@/contexts/ElevenLabsVoiceContext';
import { ELEVENLABS_VOICES, VOICE_CATEGORIES } from '@/config/voices';
import {
  Volume2, VolumeX, Play, Pause, Square, Download, Settings,
  ChevronUp, ChevronDown, Mic, Sparkles, X, Loader2,
  SkipBack, SkipForward, AudioWaveform, Zap, Crown,
  Filter, Search, Heart, Star, Users, Briefcase, Gamepad2,
  BookOpen, Radio, Tv, Music, Palette, Globe
} from 'lucide-react';

interface GlobalVoiceWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  minimized?: boolean;
}

// Get voices from centralized config (NO REPETITION!)
const voiceOptions = ELEVENLABS_VOICES.map(v => ({
  key: v.id,
  name: v.name,
  emoji: v.emoji,
  style: v.tagline,
  persona: v.persona,
  gender: v.gender,
  color: v.color,
  category: v.category,
  bestFor: v.bestFor,
  sampleLine: v.sampleLine,
}));

// Category icons for filtering
const categoryIcons: Record<string, React.ReactNode> = {
  education: <BookOpen className="w-4 h-4" />,
  business: <Briefcase className="w-4 h-4" />,
  entertainment: <Gamepad2 className="w-4 h-4" />,
  wellness: <Heart className="w-4 h-4" />,
  marketing: <Zap className="w-4 h-4" />,
  tech: <Globe className="w-4 h-4" />,
  professional: <Crown className="w-4 h-4" />,
  announcements: <Tv className="w-4 h-4" />,
  general: <Users className="w-4 h-4" />,
};

const GlobalVoiceWidget: React.FC<GlobalVoiceWidgetProps> = ({
  position = 'bottom-right',
  minimized: initialMinimized = true,
}) => {
  const voiceContext = useElevenLabsVoiceSafe();
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [favoriteVoices, setFavoriteVoices] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteVoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHovered, setIsHovered] = useState(false);
  const audioWaveRef = useRef<HTMLDivElement>(null);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteVoices', JSON.stringify(favoriteVoices));
  }, [favoriteVoices]);

  // If context not available, show simplified widget
  if (!voiceContext) {
    return (
      <div className={`fixed ${getPositionClasses(position)} z-50`}>
        <div className="relative group">
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <div className="relative">
              <AudioWaveform className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            </div>
            <span className="text-sm font-medium">Voice loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const {
    narrationState,
    selectedVoice,
    setSelectedVoice,
    isVoiceEnabled,
    setVoiceEnabled,
    speak,
    speakPage,
    pause,
    resume,
    stop,
    downloadAudio,
    autoNarrate,
    setAutoNarrate,
  } = voiceContext;

  const { isPlaying, isPaused, isLoading, progress, audioUrl, error } = narrationState;

  // Filter voices based on search, category, and gender
  const filteredVoices = voiceOptions.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.persona.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.bestFor.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || voice.category === selectedCategory;
    const matchesGender = genderFilter === 'all' || voice.gender === genderFilter;
    return matchesSearch && matchesCategory && matchesGender;
  });

  // Toggle favorite
  const toggleFavorite = (voiceId: string) => {
    setFavoriteVoices(prev =>
      prev.includes(voiceId)
        ? prev.filter(id => id !== voiceId)
        : [...prev, voiceId]
    );
  };

  // Extract readable text from current page
  const extractPageContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('#root');
    if (!mainContent) return '';

    const walker = document.createTreeWalker(
      mainContent,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'svg', 'path'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.textContent?.trim()) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      }
    );

    const textParts: string[] = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text && text.length > 2) {
        textParts.push(text);
      }
    }

    return textParts.join('. ').slice(0, 5000);
  }, []);

  // Handle read page button
  const handleReadPage = useCallback(() => {
    const content = extractPageContent();
    if (content) {
      const pageTitle = document.title || 'Current Page';
      speakPage(pageTitle, content);
    }
  }, [extractPageContent, speakPage]);

  // Preview voice with sample line
  const previewVoice = useCallback((voice: typeof voiceOptions[0]) => {
    speak(voice.sampleLine, voice.key);
  }, [speak]);

  // Get selected voice info
  const currentVoice = voiceOptions.find(v => v.key === selectedVoice) || voiceOptions[0];

  // Position classes
  function getPositionClasses(pos: string) {
    switch (pos) {
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-right': return 'top-20 right-4';
      case 'top-left': return 'top-20 left-4';
      default: return 'bottom-4 right-4';
    }
  }

  // Unique categories from voices
  const categories = Array.from(new Set(voiceOptions.map(v => v.category).filter(Boolean)));

  // Minimized state - premium floating pill
  if (isMinimized) {
    return (
      <div
        className={`fixed ${getPositionClasses(position)} z-50`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated glow background */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isPlaying
            ? 'bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 blur-xl opacity-70 animate-pulse scale-110'
            : isHovered
            ? 'bg-gradient-to-r from-purple-600 to-cyan-500 blur-lg opacity-50 scale-105'
            : 'opacity-0'
        }`} />

        <button
          onClick={() => setIsMinimized(false)}
          className={`relative group flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${
            isPlaying
              ? 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 animate-gradient-x'
              : isLoading
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 hover:from-purple-600 hover:via-fuchsia-500 hover:to-cyan-500'
          } text-white border border-white/20 backdrop-blur-sm`}
        >
          {isLoading ? (
            <>
              <div className="relative">
                <Loader2 className="w-6 h-6 animate-spin" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
              </div>
              <span className="text-sm font-medium">Generating...</span>
            </>
          ) : isPlaying ? (
            <>
              {/* Animated audio wave */}
              <div className="flex items-center gap-0.5" ref={audioWaveRef}>
                {[1,2,3,4,5].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-sound-wave"
                    style={{
                      height: `${8 + Math.random() * 12}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{currentVoice.name}</span>
                <div className="flex items-center gap-1">
                  <div className="w-20 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-white to-cyan-300 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/70">{Math.round(progress)}%</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">ElevenLabs Voice</span>
                <span className="text-xs text-white/70">25+ Premium Voices</span>
              </div>
            </>
          )}
        </button>
      </div>
    );
  }

  // Expanded widget - Premium full experience
  return (
    <div className={`fixed ${getPositionClasses(position)} z-50`}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-96 backdrop-blur-xl">
        {/* Premium Header */}
        <div className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-20" />

          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <AudioWaveform className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                    <Crown className="w-3 h-3 text-yellow-900" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    ElevenLabs Voice
                    <Badge className="bg-white/20 text-white text-xs border-0">PRO</Badge>
                  </h4>
                  <p className="text-sm text-white/80">25+ Ultra-Realistic AI Voices</p>
                </div>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Voice Enable Toggle - Premium Style */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isVoiceEnabled ? 'bg-purple-500' : 'bg-gray-300'}`}>
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Voice Enabled</span>
                <p className="text-xs text-gray-500">Premium ElevenLabs quality</p>
              </div>
            </div>
            <button
              onClick={() => setVoiceEnabled(!isVoiceEnabled)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                isVoiceEnabled
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${
                  isVoiceEnabled ? 'left-7' : 'left-0.5'
                }`}
              >
                {isVoiceEnabled && <Sparkles className="w-3 h-3 text-purple-500" />}
              </div>
            </button>
          </div>

          {/* Current Voice Display */}
          <div
            onClick={() => setShowVoiceSelect(!showVoiceSelect)}
            className="cursor-pointer group"
          >
            <div className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
              showVoiceSelect
                ? 'ring-2 ring-purple-500 shadow-lg'
                : 'hover:shadow-lg'
            }`}>
              {/* Voice card gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentVoice.color} opacity-10`} />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentVoice.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {currentVoice.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 dark:text-white text-lg">{currentVoice.name}</span>
                      {favoriteVoices.includes(currentVoice.key) && (
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentVoice.persona}</p>
                    <div className="flex gap-1 mt-1">
                      {currentVoice.bestFor.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs px-2 py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); previewVoice(currentVoice); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Preview voice"
                  >
                    <Play className="w-4 h-4 text-purple-500" />
                  </button>
                  {showVoiceSelect ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Selection Panel */}
          {showVoiceSelect && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* Search and Filters */}
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search voices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                {/* Gender Filter */}
                <div className="flex gap-2">
                  {(['all', 'female', 'male'] as const).map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setGenderFilter(gender)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        genderFilter === gender
                          ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {gender === 'all' ? 'All Voices' : gender === 'female' ? 'Female' : 'Male'}
                    </button>
                  ))}
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat!)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {categoryIcons[cat!]}
                      <span className="capitalize">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Grid */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-100">
                {filteredVoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No voices found</p>
                  </div>
                ) : (
                  filteredVoices.map((voice) => (
                    <div
                      key={voice.key}
                      className={`relative group rounded-xl transition-all duration-200 ${
                        selectedVoice === voice.key
                          ? 'ring-2 ring-purple-500 shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${voice.color} opacity-5 rounded-xl`} />

                      <div className="relative p-3 flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedVoice(voice.key);
                            setShowVoiceSelect(false);
                          }}
                          className="flex-1 flex items-center gap-3"
                        >
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${voice.color} flex items-center justify-center text-xl shadow-md`}>
                            {voice.emoji}
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 dark:text-white">{voice.name}</span>
                              {selectedVoice === voice.key && (
                                <Badge className="bg-purple-500 text-white text-xs">Active</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{voice.style}</p>
                          </div>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(voice.key); }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${
                              favoriteVoices.includes(voice.key)
                                ? 'text-red-500 fill-red-500'
                                : 'text-gray-400'
                            }`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); previewVoice(voice); }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Play className="w-4 h-4 text-purple-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                {filteredVoices.length} of {voiceOptions.length} voices shown
              </div>
            </div>
          )}

          {/* Playback Controls */}
          {(isPlaying || isPaused || audioUrl) && (
            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-2xl p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Playing: {currentVoice.name}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 transition-all rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stop}
                  className="text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Square className="w-5 h-5" />
                </Button>

                <Button
                  onClick={isPlaying ? pause : resume}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 hover:opacity-90 shadow-xl shadow-purple-500/30"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadAudio()}
                  className="text-gray-600 dark:text-gray-400 hover:text-green-500 hover:bg-green-50"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl">
              <div className="relative">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Generating voice...</p>
                <p className="text-xs text-gray-500">Using {currentVoice.name}'s neural voice</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <X className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Generation failed</p>
                <p className="text-xs opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* Read Page Button */}
          <Button
            onClick={handleReadPage}
            disabled={isLoading || !isVoiceEnabled}
            className="w-full h-12 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 hover:opacity-90 text-white rounded-xl shadow-lg shadow-purple-500/30 font-medium"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Read This Page Aloud
          </Button>

          {/* Auto-narrate Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${autoNarrate ? 'bg-cyan-500' : 'bg-gray-300'}`}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">Auto-narrate</span>
                <p className="text-xs text-gray-500">Speak content automatically</p>
              </div>
            </div>
            <button
              onClick={() => setAutoNarrate(!autoNarrate)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                autoNarrate ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${
                  autoNarrate ? 'left-7' : 'left-0.5'
                }`}
              >
                {autoNarrate && <Zap className="w-3 h-3 text-cyan-500" />}
              </div>
            </button>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <Crown className="w-3.5 h-3.5" />
              <span className="font-medium">Premium</span>
            </div>
            <span className="text-gray-400">|</span>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by ElevenLabs AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalVoiceWidget;
