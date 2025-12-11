/**
 * SmartPromptIQ Unified Voice Service
 *
 * A centralized voice service that provides consistent, high-quality
 * text-to-speech across all features (BuilderIQ, Academy, etc.)
 *
 * Features:
 * - Best voice selection (Google > Microsoft > Apple > Default)
 * - Multiple voice personalities (professional, friendly, enthusiastic, teacher)
 * - Caching and preloading
 * - Queue management for multiple speech requests
 * - SSML-like markup support
 */

export type VoicePersonality = 'professional' | 'friendly' | 'enthusiastic' | 'teacher' | 'calm';

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
}

interface QueuedSpeech {
  text: string;
  settings: VoiceSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Voice personality configurations
const personalitySettings: Record<VoicePersonality, VoiceSettings> = {
  professional: { rate: 1.0, pitch: 1.0, volume: 1.0 },
  friendly: { rate: 1.05, pitch: 1.1, volume: 1.0 },
  enthusiastic: { rate: 1.1, pitch: 1.15, volume: 1.0 },
  teacher: { rate: 0.95, pitch: 1.0, volume: 1.0 },  // Slower for learning
  calm: { rate: 0.9, pitch: 0.95, volume: 0.9 },
};

// Personality-specific phrases
export const voicePhrases = {
  professional: {
    greeting: "Hello. How may I assist you today?",
    understood: "Understood. Processing your request.",
    complete: "Task completed successfully.",
    error: "I apologize, there was an error. Please try again.",
    thinking: "Analyzing your request...",
    nextStep: "Let's proceed to the next step.",
  },
  friendly: {
    greeting: "Hey there! What can I help you with?",
    understood: "Got it! Let me work on that.",
    complete: "All done! That looks great!",
    error: "Oops! Something went wrong. Let's try that again.",
    thinking: "Hmm, let me think about that...",
    nextStep: "Awesome! On to the next one!",
  },
  enthusiastic: {
    greeting: "Yes! I'm so excited to help you today!",
    understood: "Absolutely! That's a fantastic idea!",
    complete: "Boom! Nailed it! That turned out amazing!",
    error: "Oh no! We hit a small bump, but we'll figure it out!",
    thinking: "Ooh, this is exciting! Let me dive into this!",
    nextStep: "Let's keep this momentum going!",
  },
  teacher: {
    greeting: "Welcome to your lesson. Let's learn together.",
    understood: "Good question. Let me explain.",
    complete: "Excellent work! You've completed this section.",
    error: "That's okay, mistakes help us learn. Let's review.",
    thinking: "This is an important concept. Let me elaborate.",
    nextStep: "Now let's move on to the next topic.",
  },
  calm: {
    greeting: "Hello. Take your time, I'm here to help.",
    understood: "I understand. Let's work through this together.",
    complete: "Well done. You've completed this successfully.",
    error: "No worries. Let's try a different approach.",
    thinking: "Let me consider this carefully.",
    nextStep: "When you're ready, we can continue.",
  },
};

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private currentPersonality: VoicePersonality = 'friendly';
  private isInitialized = false;
  private speechQueue: QueuedSpeech[] = [];
  private isSpeaking = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.init();
    }
  }

  private init() {
    if (!this.synth) return;

    // Load voices
    this.loadVoices();

    // Listen for voice changes (some browsers load async)
    this.synth.onvoiceschanged = () => {
      this.loadVoices();
    };

    // Handle page visibility changes (speech pauses when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.synth?.speaking) {
        this.synth.pause();
      } else if (!document.hidden && this.synth?.paused) {
        this.synth.resume();
      }
    });
  }

  private loadVoices() {
    if (!this.synth) return;

    this.voices = this.synth.getVoices();

    if (this.voices.length > 0) {
      this.selectBestVoice();
      this.isInitialized = true;
      this.emit('voicesLoaded', { count: this.voices.length, selected: this.preferredVoice?.name });
      console.log(`🎙️ Voice Service: Loaded ${this.voices.length} voices, selected: ${this.preferredVoice?.name}`);
    }
  }

  private selectBestVoice() {
    // Priority order for voice selection (best quality first)
    const voicePreferences = [
      // Google voices - best quality
      (v: SpeechSynthesisVoice) => v.name.includes('Google US English') && v.lang === 'en-US',
      (v: SpeechSynthesisVoice) => v.name.includes('Google UK English Female'),
      (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en-US'),
      (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),

      // Microsoft voices - also good
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft Zira') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft Jenny') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft Aria') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.startsWith('en-US'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.startsWith('en'),

      // Apple voices (macOS/iOS)
      (v: SpeechSynthesisVoice) => v.name.includes('Samantha') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Karen') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Moira') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Tessa') && v.lang.startsWith('en'),

      // Natural/Enhanced voices
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('natural') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('enhanced') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('premium') && v.lang.startsWith('en'),

      // Fallbacks
      (v: SpeechSynthesisVoice) => v.lang === 'en-US' && !v.localService,
      (v: SpeechSynthesisVoice) => v.lang === 'en-US',
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    ];

    for (const preference of voicePreferences) {
      const voice = this.voices.find(preference);
      if (voice) {
        this.preferredVoice = voice;
        return;
      }
    }

    // Ultimate fallback
    if (this.voices.length > 0) {
      this.preferredVoice = this.voices[0];
    }
  }

  // Event emitter methods
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  // Set personality
  setPersonality(personality: VoicePersonality) {
    this.currentPersonality = personality;
    this.emit('personalityChanged', personality);
  }

  getPersonality(): VoicePersonality {
    return this.currentPersonality;
  }

  // Get phrases for current personality
  getPhrases() {
    return voicePhrases[this.currentPersonality];
  }

  // Check if speech is supported
  isSupported(): boolean {
    return !!this.synth;
  }

  // Check if ready
  isReady(): boolean {
    return this.isInitialized && !!this.preferredVoice;
  }

  // Force initialize on user interaction (required by some browsers)
  forceInit(): void {
    if (!this.synth) return;

    // Try to load voices
    this.loadVoices();

    // Speak empty utterance to unlock audio (required by some browsers)
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    this.synth.speak(utterance);
    this.synth.cancel();

    console.log('🎙️ Voice service force initialized');
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // Get current voice name
  getCurrentVoiceName(): string {
    return this.preferredVoice?.name || 'Default';
  }

  // Main speak function
  speak(
    text: string,
    options?: {
      personality?: VoicePersonality;
      rate?: number;
      pitch?: number;
      volume?: number;
      priority?: boolean; // If true, clears queue and speaks immediately
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: any) => void;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        console.warn('Speech synthesis not available');
        reject(new Error('Speech synthesis not available'));
        return;
      }

      const personality = options?.personality || this.currentPersonality;
      const baseSettings = personalitySettings[personality];

      const settings: VoiceSettings = {
        rate: options?.rate ?? baseSettings.rate,
        pitch: options?.pitch ?? baseSettings.pitch,
        volume: options?.volume ?? baseSettings.volume,
      };

      const queuedSpeech: QueuedSpeech = {
        text,
        settings,
        onStart: options?.onStart,
        onEnd: () => {
          options?.onEnd?.();
          resolve();
        },
        onError: (error) => {
          options?.onError?.(error);
          reject(error);
        },
      };

      if (options?.priority) {
        // Clear queue and speak immediately
        this.stop();
        this.speechQueue = [queuedSpeech];
      } else {
        this.speechQueue.push(queuedSpeech);
      }

      this.processQueue();
    });
  }

  private processQueue() {
    if (this.isSpeaking || this.speechQueue.length === 0 || !this.synth) {
      return;
    }

    const speech = this.speechQueue.shift()!;
    this.isSpeaking = true;

    // Cancel any ongoing speech first (Windows fix)
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(speech.text);
    utterance.rate = speech.settings.rate;
    utterance.pitch = speech.settings.pitch;
    utterance.volume = speech.settings.volume;
    utterance.lang = 'en-US';

    // Re-check voices if not loaded yet
    if (!this.preferredVoice || this.voices.length === 0) {
      this.loadVoices();
    }

    // Set voice if available
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
      console.log('🎙️ Using voice:', this.preferredVoice.name);
    } else {
      // Try to get any available voice
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        utterance.voice = englishVoice;
        console.log('🎙️ Fallback voice:', englishVoice.name);
      }
    }

    utterance.onstart = () => {
      console.log('🔊 Speaking:', speech.text.substring(0, 50) + '...');
      this.emit('speechStart', { text: speech.text });
      speech.onStart?.();
    };

    utterance.onend = () => {
      console.log('🔊 Speech ended');
      this.isSpeaking = false;
      this.emit('speechEnd', { text: speech.text });
      speech.onEnd?.();

      // Process next in queue
      setTimeout(() => this.processQueue(), 100);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      this.isSpeaking = false;
      this.emit('speechError', { error: event, text: speech.text });
      speech.onError?.(event);

      // Try next in queue
      setTimeout(() => this.processQueue(), 100);
    };

    // Resume if paused (Windows/Chrome fix)
    if (this.synth.paused) {
      this.synth.resume();
    }

    // Small delay to ensure voices are ready (Windows fix)
    setTimeout(() => {
      if (this.synth) {
        this.synth.speak(utterance);
      }
    }, 50);
  }

  // Quick speak methods with personality
  async speakGreeting(personality?: VoicePersonality) {
    const p = personality || this.currentPersonality;
    return this.speak(voicePhrases[p].greeting, { personality: p });
  }

  async speakUnderstood(personality?: VoicePersonality) {
    const p = personality || this.currentPersonality;
    return this.speak(voicePhrases[p].understood, { personality: p });
  }

  async speakComplete(personality?: VoicePersonality) {
    const p = personality || this.currentPersonality;
    return this.speak(voicePhrases[p].complete, { personality: p });
  }

  async speakError(personality?: VoicePersonality) {
    const p = personality || this.currentPersonality;
    return this.speak(voicePhrases[p].error, { personality: p });
  }

  async speakNextStep(personality?: VoicePersonality) {
    const p = personality || this.currentPersonality;
    return this.speak(voicePhrases[p].nextStep, { personality: p });
  }

  // Stop all speech
  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.speechQueue = [];
      this.emit('speechStop', {});
    }
  }

  // Pause speech
  pause() {
    this.synth?.pause();
    this.emit('speechPause', {});
  }

  // Resume speech
  resume() {
    this.synth?.resume();
    this.emit('speechResume', {});
  }

  // Check if currently speaking
  isSpeakingNow(): boolean {
    return this.isSpeaking || (this.synth?.speaking ?? false);
  }

  // Get queue length
  getQueueLength(): number {
    return this.speechQueue.length;
  }
}

// Singleton instance
export const voiceService = new VoiceService();

// React hook for voice service
import { useState, useEffect, useCallback } from 'react';

export function useVoiceService(defaultPersonality?: VoicePersonality) {
  const [isReady, setIsReady] = useState(voiceService.isReady());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [personality, setPersonalityState] = useState<VoicePersonality>(
    defaultPersonality || voiceService.getPersonality()
  );

  useEffect(() => {
    if (defaultPersonality) {
      voiceService.setPersonality(defaultPersonality);
    }

    const unsubVoicesLoaded = voiceService.on('voicesLoaded', () => {
      setIsReady(true);
    });

    const unsubStart = voiceService.on('speechStart', () => {
      setIsSpeaking(true);
    });

    const unsubEnd = voiceService.on('speechEnd', () => {
      setIsSpeaking(false);
    });

    const unsubStop = voiceService.on('speechStop', () => {
      setIsSpeaking(false);
    });

    const unsubError = voiceService.on('speechError', () => {
      setIsSpeaking(false);
    });

    const unsubPersonality = voiceService.on('personalityChanged', (p) => {
      setPersonalityState(p);
    });

    // Check if already ready
    if (voiceService.isReady()) {
      setIsReady(true);
    }

    return () => {
      unsubVoicesLoaded();
      unsubStart();
      unsubEnd();
      unsubStop();
      unsubError();
      unsubPersonality();
    };
  }, [defaultPersonality]);

  const speak = useCallback((text: string, options?: Parameters<typeof voiceService.speak>[1]) => {
    return voiceService.speak(text, options);
  }, []);

  const stop = useCallback(() => {
    voiceService.stop();
  }, []);

  const setPersonality = useCallback((p: VoicePersonality) => {
    voiceService.setPersonality(p);
    setPersonalityState(p);
  }, []);

  // Force init on first user interaction
  const forceInit = useCallback(() => {
    voiceService.forceInit();
  }, []);

  return {
    isReady,
    isSpeaking,
    isSupported: voiceService.isSupported(),
    personality,
    voiceName: voiceService.getCurrentVoiceName(),
    phrases: voicePhrases[personality],

    // Methods
    speak,
    stop,
    forceInit,
    pause: () => voiceService.pause(),
    resume: () => voiceService.resume(),
    setPersonality,

    // Quick speak methods
    speakGreeting: () => voiceService.speakGreeting(),
    speakUnderstood: () => voiceService.speakUnderstood(),
    speakComplete: () => voiceService.speakComplete(),
    speakError: () => voiceService.speakError(),
    speakNextStep: () => voiceService.speakNextStep(),
  };
}

export default voiceService;
