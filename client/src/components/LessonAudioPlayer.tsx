import React, { useState, useRef, useEffect } from 'react';

interface LessonAudioPlayerProps {
  content: string;
  lessonTitle: string;
}

const LessonAudioPlayer: React.FC<LessonAudioPlayerProps> = ({ content, lessonTitle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSupported, setIsSupported] = useState(true);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [textChunks, setTextChunks] = useState<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `audio-progress-${lessonTitle}`;

  // Check if Web Speech API is supported
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      console.warn('Text-to-Speech not supported in this browser');
    }
  }, []);

  // Clean text content for speech (remove HTML tags and special characters)
  const cleanTextForSpeech = (htmlContent: string): string => {
    // Remove HTML tags
    let text = htmlContent.replace(/<[^>]*>/g, ' ');
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Remove markdown symbols
    text = text.replace(/[#*_`~]/g, '');
    return text;
  };

  // Split text into manageable chunks (by sentences)
  const splitIntoChunks = (text: string): string[] => {
    // Split by sentence endings (. ! ?) but keep the punctuation
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    // Group sentences into chunks of ~200-300 words for better control
    const chunks: string[] = [];
    let currentChunk = '';

    sentences.forEach(sentence => {
      const trimmedSentence = sentence.trim();
      if ((currentChunk + ' ' + trimmedSentence).split(' ').length > 250 && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      }
    });

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  };

  // Initialize text chunks and load saved progress
  useEffect(() => {
    const cleanText = cleanTextForSpeech(content);
    const chunks = splitIntoChunks(cleanText);
    setTextChunks(chunks);

    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      try {
        const { chunkIndex, timestamp } = JSON.parse(savedProgress);
        // Only restore if saved within last 24 hours
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < oneDay) {
          setCurrentChunkIndex(chunkIndex);
          const progressPercent = (chunkIndex / chunks.length) * 100;
          setProgress(progressPercent);
        }
      } catch (e) {
        console.error('Error loading audio progress:', e);
      }
    }
  }, [content, storageKey]);

  // Save progress to localStorage
  const saveProgress = (chunkIndex: number) => {
    localStorage.setItem(storageKey, JSON.stringify({
      chunkIndex,
      timestamp: Date.now()
    }));
  };

  const speakChunk = (chunkIndex: number) => {
    if (chunkIndex >= textChunks.length) {
      // All chunks completed
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentChunkIndex(0);
      saveProgress(0);
      return;
    }

    const chunk = textChunks[chunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.rate = playbackRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Select a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Microsoft') ||
      voice.name.includes('Natural')
    ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      const nextChunkIndex = chunkIndex + 1;
      setCurrentChunkIndex(nextChunkIndex);

      // Update progress
      const progressPercent = (nextChunkIndex / textChunks.length) * 100;
      setProgress(progressPercent);

      // Save progress
      saveProgress(nextChunkIndex);

      // Speak next chunk
      if (nextChunkIndex < textChunks.length) {
        speakChunk(nextChunkIndex);
      } else {
        // All done
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        setCurrentChunkIndex(0);
        saveProgress(0);
      }
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      // 'interrupted' is expected when speech is cancelled
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('LessonAudioPlayer speech error:', e.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
      saveProgress(chunkIndex);
    };

    // Start speaking this chunk
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!isSupported || textChunks.length === 0) return;

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    // If we were paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Start from current chunk index
    speakChunk(currentChunkIndex);
  };

  const handlePause = () => {
    if (!isSupported || !isPlaying) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    // Save current progress when pausing
    saveProgress(currentChunkIndex);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    // Save current progress when stopping (so user can resume later)
    saveProgress(currentChunkIndex);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (isPlaying) {
      // Restart current chunk with new speed
      window.speechSynthesis.cancel();
      setTimeout(() => speakChunk(currentChunkIndex), 100);
    }
  };

  // Add a restart from beginning function
  const handleRestart = () => {
    window.speechSynthesis.cancel();
    setCurrentChunkIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setIsPaused(false);
    saveProgress(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      // Save progress when leaving the page
      if (currentChunkIndex > 0 && currentChunkIndex < textChunks.length) {
        saveProgress(currentChunkIndex);
      }
    };
  }, [currentChunkIndex, textChunks.length]);

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-yellow-800">
          <i className="fas fa-exclamation-triangle"></i>
          <span className="font-medium">Audio playback is not supported in your browser</span>
        </div>
        <p className="text-sm text-yellow-700 mt-2">
          Try using Chrome, Edge, or Safari for text-to-speech functionality.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
            <i className="fas fa-headphones text-white text-lg"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Listen to this Lesson</h3>
            <p className="text-sm text-gray-600">Text-to-Speech Audio</p>
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Speed:</span>
          <div className="flex gap-1">
            {[0.75, 1, 1.25, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  playbackRate === speed
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {progress.toFixed(0)}% complete
            {currentChunkIndex > 0 && !isPlaying && !isPaused && (
              <span className="ml-2 text-green-600 font-semibold">
                <i className="fas fa-bookmark mr-1"></i>
                Position saved
              </span>
            )}
          </span>
          <span className="text-xs text-gray-500">
            {isPlaying && <i className="fas fa-volume-up mr-1 text-purple-600"></i>}
            {isPaused && <i className="fas fa-pause mr-1 text-orange-600"></i>}
            {!isPlaying && !isPaused && <i className="fas fa-volume-mute mr-1 text-gray-400"></i>}
            <span className="ml-2">Chunk {currentChunkIndex + 1}/{textChunks.length}</span>
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {!isPlaying && !isPaused && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm"
            >
              <i className="fas fa-play"></i>
              <span>{currentChunkIndex > 0 ? 'Resume' : 'Play Lesson'}</span>
            </button>
          )}

          {isPlaying && (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-sm"
            >
              <i className="fas fa-pause"></i>
              <span>Pause</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium shadow-sm"
            >
              <i className="fas fa-play"></i>
              <span>Resume</span>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium shadow-sm"
            >
              <i className="fas fa-stop"></i>
              <span>Stop</span>
            </button>
          )}

          {currentChunkIndex > 0 && !isPlaying && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-sm"
              title="Start from beginning"
            >
              <i className="fas fa-redo"></i>
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <i className="fas fa-info-circle text-purple-600 mt-0.5"></i>
          <p>
            The text-to-speech feature converts the lesson content into audio. You can control playback speed and pause/resume at any time.
            <strong className="text-purple-700"> Your progress is automatically saved</strong> - when you return, you'll resume from where you left off!
            This is great for learning on the go or for accessibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LessonAudioPlayer;
