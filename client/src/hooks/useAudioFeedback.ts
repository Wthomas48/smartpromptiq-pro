import { useCallback, useRef, useEffect } from 'react';

// Audio feedback types
type AudioFeedbackType =
  | 'success'
  | 'error'
  | 'complete'
  | 'click'
  | 'progress'
  | 'achievement';

interface UseAudioFeedbackReturn {
  playSound: (type: AudioFeedbackType) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}

/**
 * Custom hook for audio feedback using Web Audio API
 * Generates sounds procedurally without requiring audio files
 */
export const useAudioFeedback = (): UseAudioFeedbackReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(false);

  // Initialize AudioContext
  useEffect(() => {
    if (!audioContextRef.current && 'AudioContext' in window) {
      try {
        audioContextRef.current = new AudioContext();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Generate success sound (cheerful ascending notes)
   */
  const playSuccessSound = useCallback(() => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create oscillator for melody
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Success melody: C5 -> E5 -> G5
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

    osc.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  }, []);

  /**
   * Generate error sound (descending warning tone)
   */
  const playErrorSound = useCallback(() => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Error sound: descending tone
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    osc.type = 'square';
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }, []);

  /**
   * Generate completion sound (triumphant fanfare)
   */
  const playCompleteSound = useCallback(() => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create multiple oscillators for rich sound
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      osc.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, now + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.5);

      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.5);
    });
  }, []);

  /**
   * Generate click sound (subtle UI feedback)
   */
  const playClickSound = useCallback(() => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, now);
    osc.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }, []);

  /**
   * Generate progress sound (gentle notification)
   */
  const playProgressSound = useCallback(() => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(700, now + 0.1);
    osc.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }, []);

  /**
   * Generate achievement sound (exciting reward)
   */
  const playAchievementSound = useCallback(() => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Play a rising arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      osc.type = 'sine';

      gainNode.gain.setValueAtTime(0.25, now + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.3);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  }, []);

  /**
   * Play sound based on type
   */
  const playSound = useCallback((type: AudioFeedbackType) => {
    // Resume AudioContext if it's suspended (browser autoplay policy)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    switch (type) {
      case 'success':
        playSuccessSound();
        break;
      case 'error':
        playErrorSound();
        break;
      case 'complete':
        playCompleteSound();
        break;
      case 'click':
        playClickSound();
        break;
      case 'progress':
        playProgressSound();
        break;
      case 'achievement':
        playAchievementSound();
        break;
      default:
        console.warn(`Unknown audio feedback type: ${type}`);
    }
  }, [playSuccessSound, playErrorSound, playCompleteSound, playClickSound, playProgressSound, playAchievementSound]);

  /**
   * Set muted state
   */
  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    // Store preference in localStorage
    try {
      localStorage.setItem('audioFeedbackMuted', JSON.stringify(muted));
    } catch (error) {
      console.warn('Could not save audio preference:', error);
    }
  }, []);

  // Load muted preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('audioFeedbackMuted');
      if (stored !== null) {
        isMutedRef.current = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load audio preference:', error);
    }
  }, []);

  return {
    playSound,
    setMuted,
    isMuted: isMutedRef.current
  };
};

export default useAudioFeedback;
