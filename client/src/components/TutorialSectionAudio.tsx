import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialSectionAudioProps {
  title: string;
  content: string;
  variant?: 'default' | 'compact' | 'inline' | 'hero';
  autoPlay?: boolean;
}

const TutorialSectionAudio: React.FC<TutorialSectionAudioProps> = ({
  title,
  content,
  variant = 'default',
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSupported, setIsSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support and load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Load voices - they may not be available immediately
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Fallback - assume voices are available after a short delay
    const timeout = setTimeout(() => setVoicesLoaded(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (autoPlay && isSupported && voicesLoaded && content) {
      handlePlay();
    }
  }, [autoPlay, content, voicesLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const cleanTextForSpeech = (text: string): string => {
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    const textarea = document.createElement('textarea');
    textarea.innerHTML = cleaned;
    cleaned = textarea.value;
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/[#*_`~]/g, '');
    return cleaned;
  };

  const handlePlay = () => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    const cleanedText = cleanTextForSpeech(content);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utteranceRef.current = utterance;

    utterance.rate = playbackRate;
    utterance.pitch = 1;
    utterance.volume = isMuted ? 0 : 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Microsoft') ||
      voice.name.includes('Natural') ||
      voice.lang.startsWith('en')
    ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Track progress using boundary events
    let charIndex = 0;
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        charIndex = e.charIndex;
        const progressPercent = (charIndex / cleanedText.length) * 100;
        setProgress(Math.min(progressPercent, 100));
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('Speech error:', e.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!isSupported || !isPlaying) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    setProgress(0);
    setIsPlaying(false);
    setIsPaused(false);
    setTimeout(() => handlePlay(), 100);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1 : 0;
    }
  };

  if (!isSupported) {
    return null;
  }

  // Hero variant - designed for dark backgrounds
  if (variant === 'hero') {
    return (
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={!voicesLoaded}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          isPlaying
            ? 'bg-white text-purple-600'
            : 'bg-white/20 hover:bg-white/30 text-white'
        } ${!voicesLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isPlaying ? 'Pause audio' : 'Listen to introduction'}
      >
        {!voicesLoaded ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {!voicesLoaded ? 'Loading...' : isPlaying ? 'Pause' : 'Listen'}
        </span>
        {isPlaying && (
          <div className="w-12 h-1 bg-purple-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>
    );
  }

  // Compact inline variant - just a play button
  if (variant === 'inline') {
    return (
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={!voicesLoaded}
        className={`inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 transition ${
          !voicesLoaded ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={isPlaying ? 'Pause audio' : 'Listen to section'}
      >
        {!voicesLoaded ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        <span className="sr-only">{isPlaying ? 'Pause' : 'Listen'}</span>
      </button>
    );
  }

  // Compact variant - small button with progress
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-purple-200 shadow-sm">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={!voicesLoaded}
          className={`text-purple-600 hover:text-purple-800 transition ${
            !voicesLoaded ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={isPlaying ? 'Pause' : 'Listen to section'}
        >
          {!voicesLoaded ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        {(isPlaying || isPaused) && (
          <>
            <div className="w-16 h-1.5 bg-purple-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={handleStop}
              className="text-gray-500 hover:text-gray-700 transition"
              title="Stop"
            >
              <Square className="w-3 h-3" />
            </button>
          </>
        )}
        {!isPlaying && !isPaused && voicesLoaded && (
          <span className="text-xs text-purple-600 font-medium">Listen</span>
        )}
      </div>
    );
  }

  // Default full variant
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500">Audio narration</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[0.75, 1, 1.25, 1.5].map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackRate(speed)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                playbackRate === speed
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-purple-100'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {!voicesLoaded ? (
          <Button size="sm" disabled className="bg-purple-400 text-white">
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Loading...
          </Button>
        ) : !isPlaying && !isPaused ? (
          <Button
            size="sm"
            onClick={handlePlay}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Play className="w-4 h-4 mr-1" />
            Play
          </Button>
        ) : null}

        {isPlaying && (
          <Button
            size="sm"
            onClick={handlePause}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Pause className="w-4 h-4 mr-1" />
            Pause
          </Button>
        )}

        {isPaused && (
          <Button
            size="sm"
            onClick={handlePlay}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Play className="w-4 h-4 mr-1" />
            Resume
          </Button>
        )}

        {(isPlaying || isPaused) && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStop}
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRestart}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}

        {voicesLoaded && (
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            className={isMuted ? 'text-red-500' : ''}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TutorialSectionAudio;
