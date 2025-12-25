import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useElevenLabsVoiceSafe } from '@/contexts/ElevenLabsVoiceContext';
import { ELEVENLABS_VOICES, OPENAI_VOICES } from '@/config/voices';
import {
  Volume2, VolumeX, Play, Pause, Square, Download, RefreshCw,
  Settings, ChevronDown, ChevronUp, Sparkles, Loader2, Globe,
  Mic, Zap, AudioWaveform, Star
} from 'lucide-react';

// Get voices from centralized config (NO REPETITION)
const elevenLabsVoices = ELEVENLABS_VOICES.slice(0, 8).map(v => ({
  id: v.id,
  name: v.name,
  emoji: v.emoji,
  style: v.tagline,
  color: v.color,
  category: v.category,
}));

// OpenAI fallback voices from centralized config
const openAIVoices = OPENAI_VOICES.map(v => ({
  id: v.id,
  name: v.name,
  emoji: v.emoji,
  style: v.tagline,
  color: v.color,
}));

interface PromptVoiceReaderProps {
  content: string;
  title?: string;
  category?: string;
  onVoiceGenerated?: (audioUrl: string) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  variant?: 'full' | 'compact' | 'inline' | 'floating';
  showDownload?: boolean;
  showVoiceSelect?: boolean;
  autoPlay?: boolean;
  preferElevenLabs?: boolean;
  className?: string;
}

const PromptVoiceReader: React.FC<PromptVoiceReaderProps> = ({
  content,
  title,
  category,
  onVoiceGenerated,
  onPlayStateChange,
  variant = 'full',
  showDownload = true,
  showVoiceSelect = true,
  autoPlay = false,
  preferElevenLabs = true,
  className = '',
}) => {
  const { toast } = useToast();
  const voiceContext = useElevenLabsVoiceSafe();

  // State
  const [useElevenLabs, setUseElevenLabs] = useState(preferElevenLabs);
  const [selectedVoice, setSelectedVoice] = useState(preferElevenLabs ? 'domi' : 'nova');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 1.0, pitch: 1.0, volume: 1.0 });
  const [useBrowserTTS, setUseBrowserTTS] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize browser TTS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Get voices based on provider
  const voices = useElevenLabs ? elevenLabsVoices : openAIVoices;
  const selectedPersona = voices.find(v => v.id === selectedVoice) || voices[0];

  // Calculate stats
  const charCount = content.length;
  const wordCount = content.trim().split(/\s+/).filter(w => w).length;
  const estimatedDuration = Math.ceil(wordCount / 150 * 60);

  // Browser TTS - Real-time playback
  const playWithBrowserTTS = useCallback(() => {
    if (!synthRef.current || !content.trim()) return;

    synthRef.current.cancel();

    if (isPlaying) {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    const voices = synthRef.current.getVoices();
    const matchingVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      // Gracefully handle interrupted/canceled errors - these are normal
      if (e.error === 'interrupted' || e.error === 'canceled') {
        console.log('PromptVoiceReader: Speech stopped by user');
      } else {
        console.warn('PromptVoiceReader speech error:', e.error);
      }
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setUseBrowserTTS(true);
  }, [content, voiceSettings, isPlaying, onPlayStateChange]);

  // Generate AI voice (ElevenLabs or OpenAI)
  const generateAIVoice = useCallback(async () => {
    if (!content.trim()) {
      toast({ title: 'No Content', description: 'Nothing to read!', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setUseBrowserTTS(false);

    try {
      const safeContent = content || '';
      if (!safeContent.trim()) {
        console.warn('PromptVoiceReader: No content to read');
        setIsLoading(false);
        return;
      }

      const endpoint = useElevenLabs ? '/api/elevenlabs/generate' : '/api/voice/generate';

      const body = useElevenLabs
        ? {
            text: safeContent.slice(0, 5000),
            voiceName: selectedVoice,
            category: category || 'prompt',
            preset: 'natural',
          }
        : {
            text: safeContent.slice(0, 4000),
            voice: selectedVoice,
            style: selectedPersona.style.toLowerCase(),
            settings: voiceSettings,
            category: category || 'prompt',
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
      setAudioUrl(data.audioUrl);
      onVoiceGenerated?.(data.audioUrl);

      toast({
        title: useElevenLabs ? 'ElevenLabs Voice Ready!' : 'AI Voice Ready!',
        description: `${selectedPersona.name} is ready to speak. ${data.tokensUsed || 'N/A'} tokens used.`,
      });

      if (autoPlay && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        setTimeout(() => audioRef.current?.play(), 100);
      }
    } catch (error: any) {
      console.error('Voice generation error:', error);

      if (useElevenLabs) {
        toast({
          title: 'Switching to backup...',
          description: 'ElevenLabs unavailable, trying OpenAI.',
        });
        setUseElevenLabs(false);
        setSelectedVoice('nova');
      } else {
        toast({
          title: 'Generation Failed',
          description: error.message || 'Could not generate AI voice.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  }, [content, selectedVoice, selectedPersona, voiceSettings, category, useElevenLabs, onVoiceGenerated, autoPlay, toast]);

  // Play/pause generated audio
  const toggleAudioPlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
    setUseBrowserTTS(false);
    onPlayStateChange?.(!isPlaying);
  }, [isPlaying, onPlayStateChange]);

  // Stop all playback
  const stopPlayback = useCallback(() => {
    synthRef.current?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  // Download audio
  const downloadAudio = useCallback(() => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Downloaded!', description: 'Audio saved.' });
  }, [audioUrl, toast]);

  // Audio event handlers
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackProgress(100);
        onPlayStateChange?.(false);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlaybackProgress(progress);
        }
      };
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
    }
  }, [audioUrl, onPlayStateChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  // Inline variant
  if (variant === 'inline') {
    return (
      <button
        onClick={useBrowserTTS || !audioUrl ? playWithBrowserTTS : toggleAudioPlayback}
        disabled={!content.trim()}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          isPlaying
            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${className}`}
      >
        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {isPlaying ? 'Stop' : 'Listen'}
      </button>
    );
  }

  // Floating variant
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={audioUrl ? toggleAudioPlayback : generateAIVoice}
            disabled={isGenerating}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isGenerating
                ? 'bg-amber-500 animate-pulse'
                : isPlaying
                ? 'bg-red-500 animate-pulse'
                : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90'
            } text-white`}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <div className="pr-3">
            <div className="text-sm font-medium text-gray-800 dark:text-white">
              {isGenerating ? 'Generating...' : isPlaying ? 'Speaking...' : 'Read Aloud'}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              {useElevenLabs && <Zap className="w-3 h-3 text-purple-500" />}
              ~{estimatedDuration}s
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/30 ${className}`}>
        <Button
          size="sm"
          onClick={audioUrl ? toggleAudioPlayback : generateAIVoice}
          disabled={isGenerating || !content.trim()}
          className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90'}`}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate flex items-center gap-1">
            {isPlaying ? `${selectedPersona.emoji} Speaking...` : 'Read Prompt Aloud'}
            {useElevenLabs && <Zap className="w-3 h-3 text-purple-500" />}
          </div>
          <div className="text-xs text-gray-500">{wordCount} words</div>
          {audioUrl && (
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                style={{ width: `${playbackProgress}%` }}
              />
            </div>
          )}
        </div>

        {showVoiceSelect && (
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>{v.emoji} {v.name}</option>
            ))}
          </select>
        )}

        {showDownload && audioUrl && (
          <Button variant="ghost" size="sm" onClick={downloadAudio}>
            <Download className="w-4 h-4" />
          </Button>
        )}

        <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
      </div>
    );
  }

  // Full variant
  return (
    <div className={`p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/30 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <AudioWaveform className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              Voice Reader
              {useElevenLabs && (
                <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  ElevenLabs
                </Badge>
              )}
            </h4>
            <p className="text-xs text-gray-500">Hear your prompt spoken aloud</p>
          </div>
        </div>
        <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
          {wordCount} words
        </Badge>
      </div>

      {/* Provider Toggle */}
      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800/50 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
          <Star className="w-4 h-4 text-purple-500" />
          ElevenLabs Premium
        </span>
        <button
          onClick={() => {
            setUseElevenLabs(!useElevenLabs);
            setSelectedVoice(useElevenLabs ? 'nova' : 'domi');
            setAudioUrl(null);
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
      {showVoiceSelect && (
        <div className="grid grid-cols-4 gap-2">
          {voices.slice(0, 8).map((voice) => (
            <button
              key={voice.id}
              onClick={() => {
                setSelectedVoice(voice.id);
                setAudioUrl(null);
              }}
              className={`p-2 rounded-lg text-center transition-all ${
                selectedVoice === voice.id
                  ? `bg-gradient-to-r ${voice.color} text-white shadow-md`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{voice.emoji}</span>
              <div className="text-[10px] font-medium mt-1 truncate">{voice.name}</div>
            </button>
          ))}
        </div>
      )}

      {/* Settings */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <Settings className="w-4 h-4" />
        Voice Settings
        {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showSettings && (
        <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Speed</span>
              <span className="text-gray-700 dark:text-gray-300">{voiceSettings.rate.toFixed(2)}x</span>
            </div>
            <Slider
              value={[voiceSettings.rate]}
              onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, rate: value }))}
              min={0.5}
              max={1.5}
              step={0.05}
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Volume</span>
              <span className="text-gray-700 dark:text-gray-300">{Math.round(voiceSettings.volume * 100)}%</span>
            </div>
            <Slider
              value={[voiceSettings.volume]}
              onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, volume: value }))}
              min={0.1}
              max={1}
              step={0.1}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={playWithBrowserTTS}
          disabled={!content.trim()}
          className="flex-1"
        >
          {isPlaying && useBrowserTTS ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Quick Listen
            </>
          )}
        </Button>

        <Button
          onClick={generateAIVoice}
          disabled={isGenerating || !content.trim()}
          className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {useElevenLabs ? 'ElevenLabs HD' : 'AI Voice'}
            </>
          )}
        </Button>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={toggleAudioPlayback}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 h-12 w-12 rounded-full p-0"
            >
              {isPlaying && !useBrowserTTS ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={stopPlayback}>
              <Square className="w-4 h-4" />
            </Button>

            {showDownload && (
              <Button variant="ghost" size="sm" onClick={downloadAudio}>
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedPersona.emoji}</span>
              <div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{selectedPersona.name}</span>
                <span className="text-gray-500 ml-2">{selectedPersona.style}</span>
              </div>
            </div>
            {useElevenLabs && (
              <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-700 dark:text-purple-300">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      )}

      <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
    </div>
  );
};

export default PromptVoiceReader;
