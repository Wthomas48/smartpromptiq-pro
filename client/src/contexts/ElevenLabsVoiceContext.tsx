import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  ELEVENLABS_VOICES,
  VOICE_PRESETS,
  VOICE_CATEGORIES,
  ELEVENLABS_VOICE_IDS,
  type VoicePersona
} from '@/config/voices';

// ElevenLabs voice types
export interface ElevenLabsVoice {
  key: string;
  id: string;
  name: string;
  gender: string;
  style: string;
  description: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface VoicePreset {
  name: string;
  description: string;
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

// Voice narration state
export interface NarrationState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  currentText: string;
  currentVoice: string;
  audioUrl: string | null;
  error: string | null;
}

// Voice context type
export interface ElevenLabsVoiceContextType {
  // State
  voices: ElevenLabsVoice[];
  presets: VoicePreset[];
  selectedVoice: string;
  selectedPreset: string;
  narrationState: NarrationState;
  isVoiceEnabled: boolean;
  autoNarrate: boolean;

  // Settings
  setSelectedVoice: (voice: string) => void;
  setSelectedPreset: (preset: string) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setAutoNarrate: (auto: boolean) => void;

  // Actions
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  speakPage: (pageTitle: string, content: string) => Promise<void>;
  speakLesson: (lessonTitle: string, content: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  downloadAudio: (filename?: string) => void;

  // Utils
  getVoiceForCategory: (category: string) => ElevenLabsVoice | undefined;
  estimateDuration: (text: string) => number;
  loadVoices: () => Promise<void>;
}

export interface SpeakOptions {
  voice?: string;
  preset?: string;
  category?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const defaultNarrationState: NarrationState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  currentText: '',
  currentVoice: '',
  audioUrl: null,
  error: null,
};

const ElevenLabsVoiceContext = createContext<ElevenLabsVoiceContextType | undefined>(undefined);

export function useElevenLabsVoice() {
  const context = useContext(ElevenLabsVoiceContext);
  if (!context) {
    throw new Error('useElevenLabsVoice must be used within ElevenLabsVoiceProvider');
  }
  return context;
}

// Safe hook that doesn't throw
export function useElevenLabsVoiceSafe() {
  return useContext(ElevenLabsVoiceContext);
}

interface ElevenLabsVoiceProviderProps {
  children: React.ReactNode;
}

export function ElevenLabsVoiceProvider({ children }: ElevenLabsVoiceProviderProps) {
  // State
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [presets, setPresets] = useState<VoicePreset[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [selectedPreset, setSelectedPreset] = useState('natural');
  const [narrationState, setNarrationState] = useState<NarrationState>(defaultNarrationState);
  const [isVoiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem('elevenLabsVoiceEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [autoNarrate, setAutoNarrate] = useState(() => {
    const saved = localStorage.getItem('elevenLabsAutoNarrate');
    return saved ? JSON.parse(saved) : false;
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isBrowserSpeakingRef = useRef<boolean>(false);

  // Browser Speech Synthesis Helper - FREE accessibility fallback
  const speakWithBrowser = useCallback((text: string, onEnd?: () => void): boolean => {
    if (!('speechSynthesis' in window)) {
      console.warn('Browser speech synthesis not supported');
      return false;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    isBrowserSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good voice
    const availableVoices = window.speechSynthesis.getVoices();
    const preferredVoice = availableVoices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha'))
    ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setNarrationState(prev => ({ ...prev, isPlaying: true, isPaused: false, isLoading: false }));
    };

    utterance.onend = () => {
      isBrowserSpeakingRef.current = false;
      setNarrationState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        progress: 100,
      }));
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.error('Browser speech error:', e);
      isBrowserSpeakingRef.current = false;
      setNarrationState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Browser speech synthesis error',
      }));
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    console.log('Using browser speech synthesis for accessibility');
    return true;
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('elevenLabsVoiceEnabled', JSON.stringify(isVoiceEnabled));
  }, [isVoiceEnabled]);

  useEffect(() => {
    localStorage.setItem('elevenLabsAutoNarrate', JSON.stringify(autoNarrate));
  }, [autoNarrate]);

  useEffect(() => {
    localStorage.setItem('elevenLabsSelectedVoice', selectedVoice);
  }, [selectedVoice]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();

    audioRef.current.onplay = () => {
      setNarrationState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    };

    audioRef.current.onpause = () => {
      setNarrationState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    };

    audioRef.current.onended = () => {
      setNarrationState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        progress: 100,
      }));
    };

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current && audioRef.current.duration) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setNarrationState(prev => ({ ...prev, progress }));
      }
    };

    audioRef.current.onerror = () => {
      setNarrationState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Audio playback error',
      }));
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load voices from local config (no API needed)
  const loadVoices = useCallback(async () => {
    try {
      // Use local config data instead of API calls
      const voicesFromConfig: ElevenLabsVoice[] = ELEVENLABS_VOICES.map(voice => ({
        key: voice.id,
        id: ELEVENLABS_VOICE_IDS[voice.id as keyof typeof ELEVENLABS_VOICE_IDS] || voice.id,
        name: voice.name,
        gender: voice.gender,
        style: voice.style,
        description: voice.description,
      }));

      setVoices(voicesFromConfig);

      // Load presets from local config
      const presetsFromConfig: VoicePreset[] = Object.entries(VOICE_PRESETS).map(([name, settings]) => ({
        name,
        description: {
          natural: 'Balanced & versatile - great for most content',
          clear: 'High clarity - ideal for educational content',
          expressive: 'More emotion & variation - great for storytelling',
          dramatic: 'Maximum expression - perfect for dramatic narration',
          calm: 'Stable & soothing - ideal for meditation & relaxation',
        }[name] || 'Voice preset',
        ...settings,
      }));

      setPresets(presetsFromConfig);

      console.log('✅ ElevenLabs voices loaded from local config:', voicesFromConfig.length, 'voices');
    } catch (error) {
      console.error('Failed to load ElevenLabs voices:', error);
    }
  }, []);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  // Estimate duration
  const estimateDuration = useCallback((text: string): number => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / 150 * 60); // ~150 words per minute
  }, []);

  // Get voice for category - uses local VOICE_CATEGORIES config
  const getVoiceForCategory = useCallback((category: string): ElevenLabsVoice | undefined => {
    // Use the VOICE_CATEGORIES from config to get the first recommended voice for this category
    const categoryLower = category.toLowerCase() as keyof typeof VOICE_CATEGORIES;
    const voiceIds = VOICE_CATEGORIES[categoryLower] || VOICE_CATEGORIES.general;
    const voiceKey = voiceIds[0] || 'rachel';

    return voices.find(v => v.key === voiceKey);
  }, [voices]);

  // Main speak function
  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    if (!isVoiceEnabled || !text.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setNarrationState(prev => ({
      ...prev,
      isLoading: true,
      isPlaying: false,
      error: null,
      currentText: text,
      currentVoice: options.voice || selectedVoice,
    }));

    try {
      const response = await fetch('/api/elevenlabs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: (text || '').slice(0, 5000),
          voiceName: options.voice || selectedVoice,
          preset: options.preset || selectedPreset,
          category: options.category,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Voice generation failed');
      }

      const data = await response.json();

      // Check if server wants us to use browser speech synthesis (accessibility fallback)
      if (data.useBrowserSpeech || data.demo) {
        console.log('Voice generation: Using browser speech synthesis for accessibility');
        const textToSpeak = data.text || text;
        speakWithBrowser(textToSpeak, options.onComplete);
        return;
      }

      setNarrationState(prev => ({
        ...prev,
        isLoading: false,
        audioUrl: data.audioUrl,
        duration: data.duration,
      }));

      if (audioRef.current && data.audioUrl) {
        audioRef.current.src = data.audioUrl;

        if (options.autoPlay !== false) {
          await audioRef.current.play();
        }
      }

      options.onComplete?.();

    } catch (error: any) {
      if (error.name === 'AbortError') return;

      // On error, fallback to browser speech synthesis
      console.log('Voice generation failed, falling back to browser speech');
      speakWithBrowser(text, options.onComplete);
    }
  }, [isVoiceEnabled, selectedVoice, selectedPreset, speakWithBrowser]);

  // Speak page content
  const speakPage = useCallback(async (pageTitle: string, content: string) => {
    if (!isVoiceEnabled || !content.trim()) return;

    setNarrationState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentText: content,
    }));

    try {
      const response = await fetch('/api/elevenlabs/page/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content,
          pageTitle,
          pageType: 'general',
          voiceName: selectedVoice,
        }),
      });

      if (!response.ok) {
        throw new Error('Page narration failed');
      }

      const data = await response.json();

      // Check if server wants us to use browser speech synthesis (accessibility fallback)
      if (data.useBrowserSpeech || data.demo) {
        console.log('Page narration: Using browser speech synthesis for accessibility');
        const textToSpeak = data.content || content;
        speakWithBrowser(textToSpeak);
        return;
      }

      setNarrationState(prev => ({
        ...prev,
        isLoading: false,
        audioUrl: data.audioUrl,
      }));

      if (audioRef.current && data.audioUrl) {
        audioRef.current.src = data.audioUrl;
        await audioRef.current.play();
      }

    } catch (error: any) {
      // On error, fallback to browser speech synthesis
      console.log('Page narration failed, falling back to browser speech');
      speakWithBrowser(content);
    }
  }, [isVoiceEnabled, selectedVoice, speakWithBrowser]);

  // Speak lesson content (optimized for Academy)
  const speakLesson = useCallback(async (lessonTitle: string, content: string) => {
    if (!isVoiceEnabled || !content.trim()) return;

    setNarrationState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentText: content,
    }));

    try {
      const response = await fetch('/api/elevenlabs/academy/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          lessonContent: content,
          lessonTitle,
          voiceName: selectedVoice,
          style: 'teacher',
        }),
      });

      if (!response.ok) {
        throw new Error('Lesson narration failed');
      }

      const data = await response.json();

      // Check if server wants us to use browser speech synthesis (accessibility fallback)
      if (data.useBrowserSpeech || data.demo) {
        console.log('Lesson narration: Using browser speech synthesis for accessibility');
        const textToSpeak = data.text || data.lessonContent || content;
        speakWithBrowser(textToSpeak);
        return;
      }

      setNarrationState(prev => ({
        ...prev,
        isLoading: false,
        audioUrl: data.audioUrl,
        duration: data.duration,
      }));

      if (audioRef.current && data.audioUrl) {
        audioRef.current.src = data.audioUrl;
        await audioRef.current.play();
      }

    } catch (error: any) {
      // On error, fallback to browser speech synthesis
      console.log('Lesson narration failed, falling back to browser speech');
      speakWithBrowser(content);
    }
  }, [isVoiceEnabled, selectedVoice, speakWithBrowser]);

  // Playback controls - support both Audio element and Browser Speech Synthesis
  const pause = useCallback(() => {
    // Pause audio element
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Pause browser speech synthesis
    if (isBrowserSpeakingRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setNarrationState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    // Resume audio element
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play();
    }
    // Resume browser speech synthesis
    if (isBrowserSpeakingRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setNarrationState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    }
  }, []);

  const stop = useCallback(() => {
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isBrowserSpeakingRef.current = false;
    }
    setNarrationState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      progress: 0,
    }));
  }, []);

  // Download audio
  const downloadAudio = useCallback((filename?: string) => {
    if (!narrationState.audioUrl) return;

    const link = document.createElement('a');
    link.href = narrationState.audioUrl;
    link.download = filename || `voice-narration-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [narrationState.audioUrl]);

  const value: ElevenLabsVoiceContextType = {
    voices,
    presets,
    selectedVoice,
    selectedPreset,
    narrationState,
    isVoiceEnabled,
    autoNarrate,
    setSelectedVoice,
    setSelectedPreset,
    setVoiceEnabled,
    setAutoNarrate,
    speak,
    speakPage,
    speakLesson,
    pause,
    resume,
    stop,
    downloadAudio,
    getVoiceForCategory,
    estimateDuration,
    loadVoices,
  };

  return (
    <ElevenLabsVoiceContext.Provider value={value}>
      {children}
    </ElevenLabsVoiceContext.Provider>
  );
}

export default ElevenLabsVoiceProvider;
