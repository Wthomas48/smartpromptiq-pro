import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useElevenLabsVoiceSafe } from '@/contexts/ElevenLabsVoiceContext';
import { ELEVENLABS_VOICES, OPENAI_VOICES, getVoicesForCategory } from '@/config/voices';
import {
  Mic, Play, Pause, Square, Download, Sparkles,
  Volume2, Loader2, RefreshCw, Clock, ChevronDown, ChevronUp, Settings,
  AudioWaveform, Zap, Star
} from 'lucide-react';

// Get academy-optimized voices from centralized config (NO REPETITION)
const elevenLabsVoicePersonas = getVoicesForCategory('academy').map(v => ({
  id: v.id,
  name: v.name,
  persona: v.persona,
  emoji: v.emoji,
  vibe: v.tagline,
  color: v.color,
  style: v.style,
  premium: v.premium,
}));

// Fallback OpenAI voices from centralized config
const openAIVoicePersonas = OPENAI_VOICES.slice(0, 4).map(v => ({
  id: v.id,
  name: v.name,
  persona: v.persona,
  emoji: v.emoji,
  vibe: v.tagline,
  color: v.color,
  style: v.style,
  premium: v.premium,
}));

interface LessonVoiceNarratorProps {
  lessonId?: string;
  lessonTitle?: string;
  lessonContent: string;
  courseTitle?: string;
  defaultVoice?: string;
  onNarrationGenerated?: (audioUrl: string) => void;
  onProgress?: (progress: number) => void;
  compact?: boolean;
  preferElevenLabs?: boolean;
}

const LessonVoiceNarrator: React.FC<LessonVoiceNarratorProps> = ({
  lessonId,
  lessonTitle = 'Lesson',
  lessonContent,
  courseTitle,
  defaultVoice = 'rachel',
  onNarrationGenerated,
  onProgress,
  compact = false,
  preferElevenLabs = true,
}) => {
  const { toast } = useToast();
  const voiceContext = useElevenLabsVoiceSafe();

  // State
  const [useElevenLabs, setUseElevenLabs] = useState(preferElevenLabs);
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice);
  const [narrationScript, setNarrationScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 0.95, pitch: 1.0 });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get voice personas based on provider
  const voicePersonas = useElevenLabs ? elevenLabsVoicePersonas : openAIVoicePersonas;
  const selectedPersona = voicePersonas.find(v => v.id === selectedVoice) || voicePersonas[0];

  // Estimate content stats
  const contentLength = lessonContent.length;
  const wordCount = lessonContent.trim().split(/\s+/).length;
  const estimatedDuration = Math.ceil(wordCount / 140 * 60); // Slightly slower for learning
  const estimatedTokens = Math.ceil(contentLength / 100) * (useElevenLabs ? 8 : 10);

  // Generate narration script from lesson content
  const generateNarrationScript = useCallback(async () => {
    setIsGeneratingScript(true);

    try {
      const response = await fetch('/api/voice/generate-lesson-narration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          lessonContent,
          lessonTitle,
          courseTitle,
          style: selectedPersona.style,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate narration script');
      }

      const data = await response.json();
      setNarrationScript(data.script);

      toast({
        title: 'Narration Script Ready!',
        description: `${data.estimatedDuration}s script prepared. Ready to generate audio!`,
      });
    } catch (error) {
      console.error('Narration script error:', error);
      toast({
        title: 'Script Generation Failed',
        description: 'Could not prepare narration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingScript(false);
    }
  }, [lessonContent, lessonTitle, courseTitle, selectedPersona, toast]);

  // Generate voice narration with ElevenLabs or OpenAI
  const generateVoiceNarration = useCallback(async () => {
    const textToNarrate = narrationScript || lessonContent;

    if (!textToNarrate.trim()) {
      toast({
        title: 'No Content',
        description: 'No lesson content to narrate!',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingAudio(true);

    try {
      // Use ElevenLabs Academy endpoint for best quality
      const endpoint = useElevenLabs
        ? '/api/elevenlabs/academy/generate'
        : '/api/voice/generate';

      const body = useElevenLabs
        ? {
            lessonContent: textToNarrate.slice(0, 5000),
            lessonTitle,
            voiceName: selectedVoice,
            style: selectedPersona.style,
          }
        : {
            text: textToNarrate.slice(0, 4000),
            voice: selectedVoice,
            style: selectedPersona.style,
            settings: voiceSettings,
            category: 'education',
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
        throw new Error(error.message || 'Failed to generate narration');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      onNarrationGenerated?.(data.audioUrl);

      toast({
        title: useElevenLabs ? 'ElevenLabs Voice Ready!' : 'Lesson Narration Ready!',
        description: `${selectedPersona.name} narrated your lesson. ${data.tokensUsed || estimatedTokens} tokens used.`,
      });

      // Auto-play
      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      }

    } catch (error: any) {
      console.error('Voice narration error:', error);

      // Fallback to OpenAI if ElevenLabs fails
      if (useElevenLabs) {
        toast({
          title: 'Trying Backup Voice...',
          description: 'ElevenLabs unavailable, using backup provider.',
        });
        setUseElevenLabs(false);
        setSelectedVoice('shimmer');
      } else {
        toast({
          title: 'Narration Failed',
          description: error.message || 'Could not generate narration. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [narrationScript, lessonContent, selectedVoice, selectedPersona, voiceSettings, useElevenLabs, lessonTitle, onNarrationGenerated, toast, estimatedTokens]);

  // Play/pause audio
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Stop audio
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  }, []);

  // Download audio
  const downloadAudio = useCallback(() => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${lessonTitle.replace(/\s+/g, '-').toLowerCase()}-narration.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Downloaded!', description: 'Lesson narration saved.' });
  }, [audioUrl, lessonTitle, toast]);

  // Audio event handlers
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackProgress(100);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlaybackProgress(progress);
          onProgress?.(progress);
        }
      };
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
    }
  }, [audioUrl, onProgress]);

  // Compact mode - minimal UI
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/30">
        <Button
          size="sm"
          onClick={audioUrl ? togglePlayback : generateVoiceNarration}
          disabled={isGeneratingAudio}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90"
        >
          {isGeneratingAudio ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : audioUrl ? (
            isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
          ) : (
            <AudioWaveform className="w-4 h-4" />
          )}
        </Button>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {audioUrl ? (
              isPlaying ? `${selectedPersona.emoji} Speaking...` : 'Listen to narration'
            ) : isGeneratingAudio ? (
              'Generating...'
            ) : (
              `${useElevenLabs ? 'ElevenLabs' : 'AI'} Narration`
            )}
          </div>
          {audioUrl && (
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                style={{ width: `${playbackProgress}%` }}
              />
            </div>
          )}
        </div>
        {useElevenLabs && (
          <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-700 dark:text-purple-300 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}
        {audioUrl && (
          <Button variant="ghost" size="sm" onClick={downloadAudio}>
            <Download className="w-4 h-4" />
          </Button>
        )}
        <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
      </div>
    );
  }

  // Full mode - complete UI
  return (
    <Card className="bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border-purple-500/30">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <AudioWaveform className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                AI Lesson Narrator
                {useElevenLabs && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    ElevenLabs
                  </Badge>
                )}
              </h4>
              <p className="text-xs text-gray-500">Ultra-realistic voice narration</p>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
            ~{estimatedDuration}s
          </Badge>
        </div>

        {/* Provider Toggle */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-300">Use ElevenLabs (Premium)</span>
          <button
            onClick={() => {
              setUseElevenLabs(!useElevenLabs);
              setSelectedVoice(useElevenLabs ? 'shimmer' : 'rachel');
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              useElevenLabs ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                useElevenLabs ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Voice Selection */}
        <div>
          <button
            onClick={() => setShowVoiceSelect(!showVoiceSelect)}
            className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPersona.emoji}</span>
              <div className="text-left">
                <div className="font-medium text-gray-800 dark:text-white">{selectedPersona.name}</div>
                <div className="text-xs text-gray-500">{selectedPersona.vibe}</div>
              </div>
            </div>
            {showVoiceSelect ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showVoiceSelect && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {voicePersonas.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice.id);
                    setShowVoiceSelect(false);
                  }}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedVoice === voice.id
                      ? `bg-gradient-to-r ${voice.color} text-white shadow-md`
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{voice.emoji}</span>
                    <div>
                      <div className="text-sm font-medium">{voice.name}</div>
                      <div className="text-xs opacity-80">{voice.vibe}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Settings className="w-4 h-4" />
          Voice Settings
          {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSettings && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Speed (slower for learning)</span>
                <span className="text-gray-700 dark:text-gray-300">{voiceSettings.rate.toFixed(2)}x</span>
              </div>
              <Slider
                value={[voiceSettings.rate]}
                onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, rate: value }))}
                min={0.75}
                max={1.25}
                step={0.05}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!narrationScript && (
            <Button
              variant="outline"
              onClick={generateNarrationScript}
              disabled={isGeneratingScript}
              className="flex-1"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Prepare Script
                </>
              )}
            </Button>
          )}

          <Button
            onClick={generateVoiceNarration}
            disabled={isGeneratingAudio}
            className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90"
          >
            {isGeneratingAudio ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {selectedPersona.name} is Recording...
              </>
            ) : (
              <>
                <AudioWaveform className="w-4 h-4 mr-2" />
                Generate {useElevenLabs ? 'Premium' : 'AI'} Narration
              </>
            )}
          </Button>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Button
                onClick={togglePlayback}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 h-12 w-12 rounded-full p-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>

              <div className="flex-1">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {audioRef.current?.currentTime
                      ? `${Math.floor(audioRef.current.currentTime / 60)}:${String(Math.floor(audioRef.current.currentTime % 60)).padStart(2, '0')}`
                      : '0:00'}
                  </span>
                  <span className="text-xs text-gray-500">~{estimatedDuration}s</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={stopPlayback}>
                <Square className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={downloadAudio}>
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedPersona.emoji}</span>
                <div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{selectedPersona.name}</span>
                  <span className="text-gray-500 ml-2">{selectedPersona.vibe}</span>
                </div>
              </div>
              {useElevenLabs && (
                <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-700 dark:text-purple-300">
                  <Star className="w-3 h-3 mr-1" />
                  Premium Quality
                </Badge>
              )}
            </div>
          </div>
        )}

        <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
      </CardContent>
    </Card>
  );
};

export default LessonVoiceNarrator;
