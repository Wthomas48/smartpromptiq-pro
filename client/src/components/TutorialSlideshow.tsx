import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  X, ChevronLeft, ChevronRight, RotateCcw, Maximize2,
  CheckCircle, Circle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Slide {
  title: string;
  content: string;
  narration: string;
  image?: string;
  tips?: string[];
  icon?: React.ReactNode;
}

export interface TutorialSlideshowProps {
  title: string;
  description: string;
  slides: Slide[];
  level: string;
  duration: string;
  onClose?: () => void;
}

const TutorialSlideshow: React.FC<TutorialSlideshowProps> = ({
  title,
  description,
  slides,
  level,
  duration,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setVoicesLoaded(true);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    setTimeout(() => setVoicesLoaded(true), 500);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Narrate current slide when playing
  useEffect(() => {
    if (isPlaying && voicesLoaded && !isMuted) {
      narrateSlide(currentSlide);
    }
  }, [currentSlide, isPlaying, voicesLoaded]);

  const narrateSlide = (slideIndex: number) => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();

    const slide = slides[slideIndex];
    if (!slide) return;

    const utterance = new SpeechSynthesisUtterance(slide.narration);
    utteranceRef.current = utterance;

    utterance.rate = playbackRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Microsoft') ||
      voice.name.includes('Natural') ||
      voice.lang.startsWith('en')
    ) || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsNarrating(true);

    utterance.onend = () => {
      setIsNarrating(false);
      if (autoAdvance && isPlaying && slideIndex < slides.length - 1) {
        setTimeout(() => setCurrentSlide(slideIndex + 1), 500);
      } else if (slideIndex === slides.length - 1) {
        setIsPlaying(false);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('Speech error:', e.error);
      }
      setIsNarrating(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (!isNarrating) {
      narrateSlide(currentSlide);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    setIsNarrating(false);
  };

  const handleNext = () => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    setCurrentSlide(0);
    if (isPlaying) {
      setTimeout(() => narrateSlide(0), 100);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToSlide = (index: number) => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  return (
    <div
      ref={containerRef}
      className={`bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-2xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <p className="text-white/60 text-sm">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">{level}</Badge>
          <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">{duration}</Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Slide Content */}
      <div className="relative min-h-[400px] p-8">
        {/* Slide Number */}
        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white/80 text-sm font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        {/* Narrating Indicator */}
        {isNarrating && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-sm">Narrating...</span>
          </div>
        )}

        {/* Main Slide Content */}
        <div className="max-w-3xl mx-auto mt-8">
          {/* Slide Icon */}
          {slide.icon && (
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              {slide.icon}
            </div>
          )}

          {/* Slide Title */}
          <h3 className="text-3xl font-bold text-white text-center mb-4">
            {slide.title}
          </h3>

          {/* Slide Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <p className="text-white/90 text-lg leading-relaxed text-center">
              {slide.content}
            </p>
          </div>

          {/* Tips */}
          {slide.tips && slide.tips.length > 0 && (
            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/20">
              <p className="text-yellow-300 font-semibold mb-2 text-sm">Pro Tips:</p>
              <ul className="space-y-2">
                {slide.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-yellow-100/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition ${
            currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition ${
            currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 py-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-8 h-2 bg-purple-400 rounded-full'
                : index < currentSlide
                ? 'w-2 h-2 bg-green-400 rounded-full'
                : 'w-2 h-2 bg-white/30 rounded-full hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="bg-black/40 backdrop-blur-sm px-6 py-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRestart}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            {!voicesLoaded ? (
              <Button
                size="lg"
                disabled
                className="bg-purple-500/50 text-white rounded-full w-14 h-14"
              >
                <Loader2 className="w-6 h-6 animate-spin" />
              </Button>
            ) : isPlaying ? (
              <Button
                size="lg"
                onClick={handlePause}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-14 h-14"
              >
                <Pause className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handlePlay}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-14 h-14"
              >
                <Play className="w-6 h-6 ml-1" />
              </Button>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
              className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className={`hover:bg-white/10 ${isMuted ? 'text-red-400' : 'text-white/70 hover:text-white'}`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            {/* Speed Control */}
            <div className="flex items-center gap-1 ml-2">
              {[0.75, 1, 1.25, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    playbackRate === speed
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-advance toggle */}
        <div className="flex justify-center mt-3">
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
            />
            Auto-advance slides after narration
          </label>
        </div>
      </div>
    </div>
  );
};

export default TutorialSlideshow;
