import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useElevenLabsVoiceSafe } from '@/contexts/ElevenLabsVoiceContext';
import { ELEVENLABS_VOICES, VOICE_CATEGORIES, getVoicesForCategory, VoicePersona } from '@/config/voices';
import {
  Volume2, Play, Pause, Square, Loader2, Sparkles, Crown, Star,
  Heart, Filter, Search, Check, Mic, AudioWaveform, ChevronRight,
  BookOpen, Briefcase, Gamepad2, Globe, Zap, Users, Tv,
  Music, X, ArrowRight
} from 'lucide-react';

interface VoiceShowcaseProps {
  mode?: 'full' | 'compact' | 'grid' | 'carousel';
  category?: keyof typeof VOICE_CATEGORIES;
  maxVoices?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  onVoiceSelect?: (voiceId: string) => void;
  title?: string;
  subtitle?: string;
}

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
  academy: <BookOpen className="w-4 h-4" />,
  podcast: <Mic className="w-4 h-4" />,
  gaming: <Gamepad2 className="w-4 h-4" />,
  storytelling: <Music className="w-4 h-4" />,
};

const VoiceShowcase: React.FC<VoiceShowcaseProps> = ({
  mode = 'full',
  category,
  maxVoices,
  showFilters = true,
  showSearch = true,
  onVoiceSelect,
  title = "Premium AI Voices",
  subtitle = "25+ Ultra-Realistic ElevenLabs Voices",
}) => {
  const voiceContext = useElevenLabsVoiceSafe();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [hoveredVoice, setHoveredVoice] = useState<string | null>(null);

  const {
    selectedVoice,
    setSelectedVoice,
    speak,
    narrationState,
    stop,
  } = voiceContext || {};

  const { isLoading, isPlaying } = narrationState || {};

  // Get voices based on category or all
  const baseVoices = category
    ? getVoicesForCategory(category)
    : ELEVENLABS_VOICES;

  // Filter voices
  const filteredVoices = baseVoices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.persona.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.bestFor.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || voice.category === selectedCategory;
    const matchesGender = genderFilter === 'all' || voice.gender === genderFilter;
    return matchesSearch && matchesCategory && matchesGender;
  }).slice(0, maxVoices || undefined);

  // Available categories
  const categories = Array.from(new Set(ELEVENLABS_VOICES.map(v => v.category).filter(Boolean)));

  // Preview voice
  const previewVoice = useCallback((voice: VoicePersona) => {
    if (!speak) return;
    setPreviewingVoice(voice.id);
    speak(voice.sampleLine, voice.id);
  }, [speak]);

  // Stop preview
  const stopPreview = useCallback(() => {
    if (!stop) return;
    setPreviewingVoice(null);
    stop();
  }, [stop]);

  // Select voice
  const handleSelectVoice = useCallback((voiceId: string) => {
    if (setSelectedVoice) {
      setSelectedVoice(voiceId);
    }
    if (onVoiceSelect) {
      onVoiceSelect(voiceId);
    }
  }, [setSelectedVoice, onVoiceSelect]);

  // Render voice card
  const renderVoiceCard = (voice: VoicePersona, index: number) => {
    const isSelected = selectedVoice === voice.id;
    const isPreviewing = previewingVoice === voice.id && isPlaying;
    const isHovered = hoveredVoice === voice.id;

    return (
      <div
        key={voice.id}
        className={`relative group transition-all duration-300 ${
          mode === 'compact' ? 'flex items-center gap-3 p-3' : ''
        }`}
        onMouseEnter={() => setHoveredVoice(voice.id)}
        onMouseLeave={() => setHoveredVoice(null)}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {mode === 'grid' || mode === 'full' || mode === 'carousel' ? (
          <div
            className={`relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${
              isSelected
                ? 'ring-2 ring-purple-500 shadow-xl scale-[1.02]'
                : 'hover:shadow-xl hover:scale-[1.01]'
            }`}
            onClick={() => handleSelectVoice(voice.id)}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${voice.color} opacity-10 transition-opacity ${isHovered ? 'opacity-20' : ''}`} />

            {/* Animated border glow on hover */}
            {isHovered && (
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${voice.color} opacity-30 blur-xl animate-pulse`} />
            )}

            <div className="relative bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-purple-500 text-white p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}

              {/* Voice avatar */}
              <div className="flex items-start gap-4">
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${voice.color} flex items-center justify-center text-3xl shadow-lg transform transition-transform ${isHovered ? 'scale-110' : ''}`}>
                  {voice.emoji}
                  {voice.premium && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <Crown className="w-3 h-3 text-yellow-900" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">{voice.name}</h3>
                    <Badge variant="outline" className="text-xs capitalize">{voice.gender}</Badge>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{voice.persona}</p>
                  <p className="text-xs text-gray-500 mt-1">{voice.tagline}</p>
                </div>
              </div>

              {/* Best for tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {voice.bestFor.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Sample line preview */}
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
                "{voice.sampleLine}"
              </p>

              {/* Action buttons */}
              <div className="mt-4 flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    isPreviewing ? stopPreview() : previewVoice(voice);
                  }}
                  disabled={isLoading && previewingVoice !== voice.id}
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${isPreviewing ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500' : ''}`}
                >
                  {isPreviewing ? (
                    <>
                      <div className="flex items-center gap-0.5 mr-2">
                        {[1,2,3].map((i) => (
                          <div key={i} className="w-0.5 bg-purple-500 rounded-full animate-sound-wave" style={{ height: '12px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      Stop
                    </>
                  ) : previewingVoice === voice.id && isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </>
                  )}
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectVoice(voice.id);
                  }}
                  size="sm"
                  className={`flex-1 ${
                    isSelected
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Select
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Compact mode
          <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
              isSelected
                ? 'bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => handleSelectVoice(voice.id)}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${voice.color} flex items-center justify-center text-2xl shadow`}>
              {voice.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 dark:text-white">{voice.name}</span>
                {isSelected && <Check className="w-4 h-4 text-green-500" />}
              </div>
              <p className="text-xs text-gray-500 truncate">{voice.tagline}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                isPreviewing ? stopPreview() : previewVoice(voice);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {isPreviewing ? (
                <Square className="w-4 h-4 text-purple-500" />
              ) : (
                <Play className="w-4 h-4 text-purple-500" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="relative">
            <AudioWaveform className="w-8 h-8 text-purple-500" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            PREMIUM
          </Badge>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>

      {/* Filters */}
      {(showFilters || showSearch) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="space-y-4">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search voices by name, persona, or use case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Filters Row */}
            {showFilters && (
              <div className="flex flex-wrap gap-4">
                {/* Gender Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Gender:</span>
                  <div className="flex gap-1">
                    {(['all', 'female', 'male'] as const).map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setGenderFilter(gender)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          genderFilter === gender
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {gender === 'all' ? 'All' : gender === 'female' ? 'Female' : 'Male'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Category:</span>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                      }`}
                    >
                      All
                    </button>
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat!)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                        }`}
                      >
                        {categoryIcons[cat!]}
                        <span className="capitalize">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Grid */}
      <div className={`${
        mode === 'grid' || mode === 'full'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : mode === 'carousel'
          ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory'
          : 'space-y-2'
      }`}>
        {filteredVoices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No voices found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredVoices.map((voice, index) => (
            <div key={voice.id} className={mode === 'carousel' ? 'snap-start flex-shrink-0 w-80' : ''}>
              {renderVoiceCard(voice, index)}
            </div>
          ))
        )}
      </div>

      {/* Voice count */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Showing {filteredVoices.length} of {ELEVENLABS_VOICES.length} premium voices
        </p>
      </div>
    </div>
  );
};

export default VoiceShowcase;
