/**
 * useAudioGeneration Hook
 *
 * React hook for generating AI speech/music with Supabase storage
 *
 * Features:
 * - Generate speech via OpenAI TTS or ElevenLabs
 * - Automatic cloud storage with signed streaming URLs
 * - URL refresh for expired links
 * - Progress tracking
 * - Error handling
 */

import { useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/api';

// Types
export type TTSProvider = 'elevenlabs' | 'openai';

export interface AudioGenerationOptions {
  text: string;
  provider?: TTSProvider;
  voice?: string;
  model?: string;
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
  };
  storeInCloud?: boolean;
  category?: string;
}

export interface AudioGenerationResult {
  success: boolean;
  audioUrl: string;
  isStreamingUrl: boolean;
  fileId?: string;
  filePath?: string;
  expiresIn?: number;
  format: string;
  duration: number;
  provider: TTSProvider;
  voice: string;
  tokensUsed: number;
  charCount: number;
  error?: string;
}

export interface AudioState {
  isGenerating: boolean;
  isPlaying: boolean;
  currentAudio: AudioGenerationResult | null;
  error: string | null;
  progress: number;
}

interface VoicesResponse {
  success: boolean;
  providers: {
    openai: {
      voices: string[];
      model: string;
      description: string;
    };
    elevenlabs: {
      voices: string[];
      models: string[];
      description: string;
    };
  };
}

/**
 * Hook for AI audio generation with Supabase storage
 */
export function useAudioGeneration() {
  const [state, setState] = useState<AudioState>({
    isGenerating: false,
    isPlaying: false,
    currentAudio: null,
    error: null,
    progress: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generate AI speech
   */
  const generateSpeech = useCallback(async (
    options: AudioGenerationOptions
  ): Promise<AudioGenerationResult | null> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: 10,
    }));

    try {
      // Get auth token if available
      const token = localStorage.getItem('auth_token');

      setState(prev => ({ ...prev, progress: 30 }));

      const response = await fetch(`${API_BASE_URL}/api/audio/generate-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          text: options.text,
          provider: options.provider || 'openai',
          voice: options.voice,
          model: options.model,
          settings: options.settings,
          storeInCloud: options.storeInCloud !== false, // Default true
          category: options.category || 'voice',
        }),
        signal: abortControllerRef.current.signal,
      });

      setState(prev => ({ ...prev, progress: 70 }));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: AudioGenerationResult = await response.json();

      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentAudio: result,
        progress: 100,
      }));

      return result;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Audio generation cancelled');
        return null;
      }

      const errorMessage = error.message || 'Audio generation failed';
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
        progress: 0,
      }));

      console.error('Audio generation error:', error);
      return null;
    }
  }, []);

  /**
   * Refresh expired signed URL
   */
  const refreshUrl = useCallback(async (
    filePath: string,
    expiresIn: number = 86400
  ): Promise<string | null> => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/api/audio/refresh-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ filePath, expiresIn }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh URL');
      }

      const data = await response.json();

      if (data.success && data.signedUrl) {
        // Update current audio if it matches
        if (state.currentAudio?.filePath === filePath) {
          setState(prev => ({
            ...prev,
            currentAudio: prev.currentAudio ? {
              ...prev.currentAudio,
              audioUrl: data.signedUrl,
              expiresIn: data.expiresIn,
            } : null,
          }));
        }
        return data.signedUrl;
      }

      return null;
    } catch (error) {
      console.error('Failed to refresh URL:', error);
      return null;
    }
  }, [state.currentAudio?.filePath]);

  /**
   * Play the current audio
   */
  const play = useCallback(async (audioUrl?: string) => {
    const url = audioUrl || state.currentAudio?.audioUrl;
    if (!url) {
      console.warn('No audio URL to play');
      return;
    }

    try {
      // Create audio element if needed
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => {
          setState(prev => ({ ...prev, isPlaying: false }));
        };
        audioRef.current.onerror = (e) => {
          console.error('Audio playback error:', e);
          setState(prev => ({
            ...prev,
            isPlaying: false,
            error: 'Audio playback failed',
          }));
        };
      }

      // Stop current playback
      if (audioRef.current.src) {
        audioRef.current.pause();
      }

      audioRef.current.src = url;
      await audioRef.current.play();

      setState(prev => ({ ...prev, isPlaying: true, error: null }));

    } catch (error: any) {
      console.error('Playback error:', error);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        error: 'Failed to play audio',
      }));
    }
  }, [state.currentAudio?.audioUrl]);

  /**
   * Pause audio playback
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  /**
   * Stop and reset audio
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  /**
   * Cancel ongoing generation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({
      ...prev,
      isGenerating: false,
      progress: 0,
    }));
  }, []);

  /**
   * Get available voices
   */
  const getVoices = useCallback(async (): Promise<VoicesResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/voices`);
      if (!response.ok) throw new Error('Failed to fetch voices');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return null;
    }
  }, []);

  /**
   * Download the current audio file
   */
  const download = useCallback((filename?: string) => {
    const url = state.currentAudio?.audioUrl;
    if (!url) {
      console.warn('No audio to download');
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `audio_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.currentAudio?.audioUrl]);

  /**
   * Clear state and cleanup
   */
  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isGenerating: false,
      isPlaying: false,
      currentAudio: null,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    // State
    ...state,

    // Actions
    generateSpeech,
    refreshUrl,
    play,
    pause,
    stop,
    cancel,
    download,
    reset,
    getVoices,

    // Audio element ref (for advanced control)
    audioRef,
  };
}

export default useAudioGeneration;
