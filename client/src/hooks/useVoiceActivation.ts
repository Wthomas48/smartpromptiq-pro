// Chrome-optimized Voice Recognition Hook - v2.0
// Fixes: Chrome continuous mode, restart handling, permission flow
import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceCommand {
  command: string;
  action: () => void;
  aliases?: string[];
  response?: string; // What BuilderIQ says back
}

interface UseVoiceActivationOptions {
  wakeWord?: string;
  language?: string;
  continuous?: boolean;
  autoRestart?: boolean;
  onTranscript?: (transcript: string) => void;
  onCommand?: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  onWakeWordDetected?: () => void;
  commands?: VoiceCommand[];
  speakResponses?: boolean;
  voicePersonality?: 'professional' | 'friendly' | 'enthusiastic';
}

// Detect browser
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const isChrome = /Chrome/.test(ua) && !/Edge|Edg/.test(ua);
  const isEdge = /Edge|Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  return { isChrome, isEdge, isFirefox, isSafari };
};

interface VoiceActivationState {
  isListening: boolean;
  isSupported: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isWakeWordDetected: boolean;
  confidence: number;
  lastCommand: string | null;
  audioLevel: number;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt';
}

// Personality-based responses
const personalityResponses = {
  professional: {
    greeting: "BuilderIQ activated. How may I assist you?",
    listening: "I'm listening. Please describe your requirements.",
    understood: "Understood. Processing your request.",
    help: "You can say: Create an app, Show templates, Start questionnaire, or describe your app idea.",
    error: "I didn't catch that. Could you please repeat?",
    goodbye: "BuilderIQ deactivated. Have a productive day.",
  },
  friendly: {
    greeting: "Hey there! BuilderIQ here. What are we building today?",
    listening: "I'm all ears! Tell me about your app idea.",
    understood: "Got it! Let me work on that for you.",
    help: "Try saying things like: I want to create a healthcare app, or Show me e-commerce templates!",
    error: "Hmm, I missed that. Mind saying it again?",
    goodbye: "Catch you later! Happy building!",
  },
  enthusiastic: {
    greeting: "Yes! BuilderIQ is ready to go! Let's build something amazing!",
    listening: "I'm super excited to hear your idea! Go ahead!",
    understood: "Awesome! That sounds incredible! Let me get that started!",
    help: "You can say awesome things like: Create a fitness app, or Help me build a marketplace! Let's do this!",
    error: "Oops! The audio got a bit fuzzy. One more time?",
    goodbye: "That was fun! Can't wait to build more with you!",
  },
};

export function useVoiceActivation(options: UseVoiceActivationOptions = {}) {
  const {
    wakeWord = 'hey builder',
    language = 'en-US',
    continuous = true,
    autoRestart = true,
    onTranscript,
    onCommand,
    onListeningChange,
    onWakeWordDetected,
    commands = [],
    speakResponses = true,
    voicePersonality = 'friendly',
  } = options;

  const [state, setState] = useState<VoiceActivationState>({
    isListening: false,
    isSupported: false,
    isSpeaking: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isWakeWordDetected: false,
    confidence: 0,
    lastCommand: null,
    audioLevel: 0,
    permissionStatus: 'unknown',
  });

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wakeWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voicesLoadedRef = useRef(false);
  const isWakeWordDetectedRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isVoiceModeActiveRef = useRef(false); // Track if voice mode is active for auto-restart

  // NEW: Anti-repeat and smart recognition refs
  const lastProcessedTranscriptRef = useRef<string>('');
  const lastCommandTimeRef = useRef<number>(0);
  const processedCommandsRef = useRef<Set<string>>(new Set());
  const commandCooldownMs = 3000; // 3 second cooldown between same commands
  const transcriptDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTranscriptsRef = useRef<string[]>([]); // Track all transcripts in session
  const greetingSpokenRef = useRef<boolean>(false); // Track if greeting was already spoken
  const lastSpeakTimeRef = useRef<number>(0); // Track when we last spoke to avoid interrupting

  const responses = personalityResponses[voicePersonality];

  // Check browser support and microphone permission
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition && !!window.speechSynthesis;

    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      synthRef.current = window.speechSynthesis;

      // Preload voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          voicesLoadedRef.current = true;
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Check microphone permission status (non-blocking)
      checkMicrophonePermission();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Check microphone permission without triggering a prompt
  const checkMicrophonePermission = async () => {
    try {
      // Use the Permissions API if available (doesn't trigger prompt)
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setState(prev => ({ ...prev, permissionStatus: result.state as 'granted' | 'denied' | 'prompt' }));

        // Listen for permission changes
        result.onchange = () => {
          setState(prev => ({ ...prev, permissionStatus: result.state as 'granted' | 'denied' | 'prompt' }));
        };
      }
    } catch (error) {
      // Permissions API not supported or microphone not available
      // This is fine - we'll check when user tries to use the feature
      console.log('Permissions API not available, will check on first use');
    }
  };

  // Audio level analyzer for visual feedback
  const startAudioAnalyzer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateLevel = () => {
        if (analyserRef.current && state.isListening) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setState(prev => ({ ...prev, audioLevel: average / 255 }));
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.log('Audio analyzer not available:', error);
    }
  }, [state.isListening]);

  // Initialize speech recognition - FIXED to avoid stale closure issues
  // Chrome-specific: Use webkitSpeechRecognition and handle its quirks
  const initRecognition = useCallback(() => {
    const browserInfo = getBrowserInfo();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported in this browser' }));
      return null;
    }

    // Chrome requires HTTPS except for localhost
    if (browserInfo.isChrome && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('🎤 Chrome requires HTTPS for speech recognition');
      setState(prev => ({
        ...prev,
        error: 'Voice recognition requires a secure connection (HTTPS). Please access via HTTPS or localhost.'
      }));
      return null;
    }

    // If we already have a recognition instance, clean it up first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    console.log('🎤 Creating new SpeechRecognition instance (Browser:', browserInfo.isChrome ? 'Chrome' : browserInfo.isFirefox ? 'Firefox' : 'Other', ')');
    const recognition = new SpeechRecognition();

    // Chrome works better with continuous = false and manual restart
    // Firefox and others work fine with continuous = true
    recognition.continuous = !browserInfo.isChrome; // Chrome: restart manually, Others: continuous
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Recognition onstart fired');
      setState(prev => ({ ...prev, isListening: true, error: null }));
      onListeningChange?.(true);
    };

    recognition.onaudiostart = () => {
      console.log('🎤 Audio capture started - microphone is active');
    };

    recognition.onsoundstart = () => {
      console.log('🎤 Sound detected');
    };

    recognition.onspeechstart = () => {
      console.log('🎤 Speech started - user is speaking');
    };

    recognition.onspeechend = () => {
      console.log('🎤 Speech ended - user stopped speaking');
    };

    recognition.onaudioend = () => {
      console.log('🎤 Audio capture ended');
    };

    recognition.onend = () => {
      const browserInfo = getBrowserInfo();
      console.log('🎤 Recognition onend fired, isVoiceModeActive:', isVoiceModeActiveRef.current, 'Browser:', browserInfo.isChrome ? 'Chrome' : 'Other');

      // Auto restart if voice mode is still active
      if (isVoiceModeActiveRef.current) {
        console.log('🎤 Voice mode active - auto-restarting recognition...');
        // Keep listening state true since we're restarting

        // Chrome needs a longer delay before restarting
        const restartDelay = browserInfo.isChrome ? 300 : 100;

        setTimeout(() => {
          try {
            // For Chrome, create a fresh recognition instance to avoid issues
            if (browserInfo.isChrome) {
              console.log('🎤 Chrome: Creating fresh recognition instance for restart');
              recognitionRef.current = initRecognition();
              if (recognitionRef.current) {
                recognitionRef.current.start();
                console.log('🎤 Chrome: Fresh recognition started');
              }
            } else {
              recognition.start();
              console.log('🎤 Recognition restarted successfully');
            }
          } catch (e: any) {
            console.log('🎤 Could not restart:', e.message);
            // Only update state to not listening if restart failed
            setState(prev => ({ ...prev, isListening: false, audioLevel: 0 }));
            onListeningChange?.(false);
          }
        }, restartDelay);
      } else {
        setState(prev => ({ ...prev, isListening: false, audioLevel: 0 }));
        onListeningChange?.(false);
      }
    };

    recognition.onerror = (event) => {
      const browserInfo = getBrowserInfo();
      console.log('🎤 Recognition error:', event.error, 'Browser:', browserInfo.isChrome ? 'Chrome' : 'Other');

      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech detected. Try speaking louder or closer to the microphone.',
        'audio-capture': 'No microphone found. Please connect a microphone.',
        'not-allowed': 'Microphone access denied. Please allow microphone access in your browser.',
        'network': 'Network error occurred. Please check your connection.',
        'aborted': 'Speech recognition was aborted.',
        'service-not-allowed': 'Speech service not allowed. Try again later.',
      };

      const errorMessage = errorMessages[event.error] || `Error: ${event.error}`;

      // For no-speech errors, just log and keep state as listening (will auto-restart via onend)
      if (event.error === 'no-speech') {
        console.log('🎤 No speech detected - waiting for speech...');
        // For Chrome, we need to manually restart since continuous mode is off
        if (browserInfo.isChrome && isVoiceModeActiveRef.current) {
          console.log('🎤 Chrome: Restarting after no-speech');
          setTimeout(() => {
            try {
              recognitionRef.current = initRecognition();
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            } catch (e) {
              console.log('🎤 Could not restart after no-speech:', e);
            }
          }, 200);
        }
        return;
      }

      // For aborted errors, don't show error message
      if (event.error === 'aborted') {
        console.log('🎤 Recognition aborted');
        return;
      }

      // Chrome sometimes fires 'network' errors spuriously - just restart
      if (event.error === 'network' && browserInfo.isChrome && isVoiceModeActiveRef.current) {
        console.log('🎤 Chrome network error - attempting restart');
        setTimeout(() => {
          try {
            recognitionRef.current = initRecognition();
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {
            console.log('🎤 Could not restart after network error:', e);
          }
        }, 500);
        return;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }));
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      // Only process new results from resultIndex
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        maxConfidence = Math.max(maxConfidence, result[0].confidence);

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update interim transcript for UI feedback
      setState(prev => ({
        ...prev,
        confidence: maxConfidence,
        interimTranscript,
      }));

      // Only process final transcripts
      if (!finalTranscript) return;

      // SMART DEDUPLICATION: Check if this is a repeat
      const normalizedTranscript = finalTranscript.toLowerCase().trim();
      const lastProcessed = lastProcessedTranscriptRef.current.toLowerCase().trim();

      // Calculate similarity - if too similar to last transcript, skip
      const isSimilar = (a: string, b: string): boolean => {
        if (!a || !b) return false;
        // Check if one contains the other or they're very similar
        if (a.includes(b) || b.includes(a)) return true;
        // Check word overlap
        const wordsA = a.split(/\s+/);
        const wordsB = b.split(/\s+/);
        const overlap = wordsA.filter(w => wordsB.includes(w)).length;
        const similarity = overlap / Math.max(wordsA.length, wordsB.length);
        return similarity > 0.7; // 70% word overlap = too similar
      };

      if (isSimilar(normalizedTranscript, lastProcessed)) {
        console.log('🎤 Skipping duplicate/similar transcript:', normalizedTranscript);
        return;
      }

      // Check if already processed in this session
      if (sessionTranscriptsRef.current.includes(normalizedTranscript)) {
        console.log('🎤 Skipping already processed transcript:', normalizedTranscript);
        return;
      }

      // Store this transcript
      lastProcessedTranscriptRef.current = normalizedTranscript;
      sessionTranscriptsRef.current.push(normalizedTranscript);

      // Keep session transcripts limited to last 20
      if (sessionTranscriptsRef.current.length > 20) {
        sessionTranscriptsRef.current = sessionTranscriptsRef.current.slice(-20);
      }

      console.log('🎤 Processing new transcript:', finalTranscript);

      // Check for wake word
      const lowerTranscript = normalizedTranscript;

      if (lowerTranscript.includes(wakeWord.toLowerCase()) && !isWakeWordDetectedRef.current) {
        console.log('🎤 Wake word detected!');
        isWakeWordDetectedRef.current = true;
        setState(prev => ({ ...prev, isWakeWordDetected: true }));
        onWakeWordDetected?.();

        if (speakResponses) {
          speak(responses.greeting);
        }

        // Reset wake word after 45 seconds of inactivity
        if (wakeWordTimeoutRef.current) {
          clearTimeout(wakeWordTimeoutRef.current);
        }
        wakeWordTimeoutRef.current = setTimeout(() => {
          isWakeWordDetectedRef.current = false;
          setState(prev => ({ ...prev, isWakeWordDetected: false }));
          if (speakResponses) {
            speak(responses.goodbye);
          }
        }, 45000);
      }

      // Process commands if wake word detected or directly activated
      if (isWakeWordDetectedRef.current || !wakeWord) {
        const processedTranscript = lowerTranscript.replace(wakeWord.toLowerCase(), '').trim();

        // Skip if too short or just noise
        if (processedTranscript.length < 2) return;

        // Reset timeout on activity
        if (wakeWordTimeoutRef.current) {
          clearTimeout(wakeWordTimeoutRef.current);
          wakeWordTimeoutRef.current = setTimeout(() => {
            isWakeWordDetectedRef.current = false;
            setState(prev => ({ ...prev, isWakeWordDetected: false }));
          }, 45000);
        }

        // DEBOUNCE: Wait a moment before processing to catch complete phrases
        if (transcriptDebounceRef.current) {
          clearTimeout(transcriptDebounceRef.current);
        }

        transcriptDebounceRef.current = setTimeout(() => {
          processCommands(processedTranscript, finalTranscript);
          onTranscript?.(finalTranscript);

          setState(prev => ({
            ...prev,
            transcript: finalTranscript, // Replace instead of append to avoid repetition
            interimTranscript: '', // Clear interim
          }));
        }, 300); // 300ms debounce
      }
    };

    return recognition;
  }, [language, wakeWord, onTranscript, onListeningChange, onWakeWordDetected, speakResponses, responses, autoRestart]);

  // Process voice commands with smart matching and cooldown
  const processCommands = useCallback((transcript: string, original: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    const now = Date.now();

    // Skip if transcript is too short
    if (lowerTranscript.length < 3) {
      console.log('🎤 Skipping too-short transcript');
      return;
    }

    // Skip processing if we're currently speaking or just finished speaking
    // This prevents BuilderIQ from hearing herself and responding
    if (now - lastSpeakTimeRef.current < 3000) {
      console.log('🎤 Skipping - BuilderIQ is/was speaking');
      return;
    }

    // Helper to check command cooldown
    const isCommandOnCooldown = (command: string): boolean => {
      const key = command.toLowerCase();
      if (processedCommandsRef.current.has(key)) {
        if (now - lastCommandTimeRef.current < commandCooldownMs) {
          console.log(`🎤 Command "${command}" on cooldown, skipping`);
          return true;
        }
      }
      return false;
    };

    // Helper to mark command as processed
    const markCommandProcessed = (command: string) => {
      processedCommandsRef.current.add(command.toLowerCase());
      lastCommandTimeRef.current = now;

      // Clear old commands after 10 seconds
      setTimeout(() => {
        processedCommandsRef.current.delete(command.toLowerCase());
      }, 10000);
    };

    // Built-in command patterns
    const builtInCommands = [
      // Create/Build commands
      {
        patterns: ['create', 'build', 'make', 'start building', 'i want to build', 'let\'s create', 'help me build'],
        action: 'create',
        response: responses.understood + " Let's build your app!",
      },
      // Template commands
      {
        patterns: ['template', 'templates', 'show me templates', 'browse templates', 'library'],
        action: 'templates',
        response: "Opening the template library for you.",
      },
      // Help commands
      {
        patterns: ['help', 'what can you do', 'commands', 'options', 'how do i'],
        action: 'help',
        response: responses.help,
      },
      // Questionnaire commands
      {
        patterns: ['questionnaire', 'start questionnaire', 'questions', 'answer questions'],
        action: 'questionnaire',
        response: "Starting the smart questionnaire. Let's discover your perfect app!",
      },
      // Stop commands
      {
        patterns: ['stop', 'stop listening', 'cancel', 'never mind', 'goodbye'],
        action: 'stop',
        response: responses.goodbye,
      },
      // Navigation commands
      {
        patterns: ['next', 'continue', 'go ahead', 'proceed'],
        action: 'next',
        response: "Moving to the next step.",
      },
      {
        patterns: ['back', 'go back', 'previous'],
        action: 'back',
        response: "Going back.",
      },
      // Selection commands
      {
        patterns: ['select first', 'option one', 'first option', 'number one'],
        action: 'select_1',
        response: "Selected first option.",
      },
      {
        patterns: ['select second', 'option two', 'second option', 'number two'],
        action: 'select_2',
        response: "Selected second option.",
      },
      {
        patterns: ['select third', 'option three', 'third option', 'number three'],
        action: 'select_3',
        response: "Selected third option.",
      },
    ];

    // Check registered custom commands first
    for (const cmd of commands) {
      const commandPatterns = [cmd.command.toLowerCase(), ...(cmd.aliases || []).map(a => a.toLowerCase())];

      for (const pattern of commandPatterns) {
        if (lowerTranscript.includes(pattern)) {
          // Check cooldown before executing
          if (isCommandOnCooldown(cmd.command)) return;

          markCommandProcessed(cmd.command);
          cmd.action();
          onCommand?.(cmd.command);
          setState(prev => ({ ...prev, lastCommand: cmd.command }));

          if (speakResponses && cmd.response) {
            speak(cmd.response);
          }
          return;
        }
      }
    }

    // Check built-in commands
    for (const cmd of builtInCommands) {
      for (const pattern of cmd.patterns) {
        if (lowerTranscript.includes(pattern)) {
          // Check cooldown before executing
          if (isCommandOnCooldown(cmd.action)) return;

          markCommandProcessed(cmd.action);
          onCommand?.(cmd.action);
          setState(prev => ({ ...prev, lastCommand: cmd.action }));

          if (speakResponses) {
            speak(cmd.response);
          }

          if (cmd.action === 'stop') {
            stopListening();
          }
          return;
        }
      }
    }

    // Industry detection for smart routing
    const industries = [
      { keywords: ['healthcare', 'medical', 'health', 'hospital', 'clinic', 'doctor', 'patient'], industry: 'healthcare' },
      { keywords: ['finance', 'banking', 'money', 'trading', 'investment', 'budget'], industry: 'finance' },
      { keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'marketplace', 'selling', 'products'], industry: 'ecommerce' },
      { keywords: ['education', 'learning', 'course', 'school', 'student', 'teaching', 'lms'], industry: 'education' },
      { keywords: ['fitness', 'workout', 'gym', 'exercise', 'health', 'training'], industry: 'fitness' },
      { keywords: ['restaurant', 'food', 'dining', 'menu', 'ordering', 'delivery'], industry: 'restaurant' },
      { keywords: ['real estate', 'property', 'housing', 'rental', 'apartment'], industry: 'realestate' },
      { keywords: ['travel', 'booking', 'hotel', 'flight', 'vacation', 'trip'], industry: 'travel' },
    ];

    for (const ind of industries) {
      for (const keyword of ind.keywords) {
        if (lowerTranscript.includes(keyword)) {
          const industryCommand = `industry:${ind.industry}`;
          // Check cooldown
          if (isCommandOnCooldown(industryCommand)) return;

          markCommandProcessed(industryCommand);
          onCommand?.(industryCommand);
          setState(prev => ({ ...prev, lastCommand: industryCommand }));

          if (speakResponses) {
            speak(`Great choice! ${ind.industry} is a fantastic industry. Let me guide you through creating your app.`);
          }
          return;
        }
      }
    }

    // If no command matched but we have substantial input, treat as story/description
    // Only respond if it looks like actual content (has multiple words, not just noise)
    const words = lowerTranscript.split(/\s+/).filter(w => w.length > 2);
    if (words.length >= 4 && lowerTranscript.length > 25) {
      // Only say "analyzing" once per 10 seconds to avoid rambling
      if (!isCommandOnCooldown('story')) {
        markCommandProcessed('story');
        onCommand?.('story');
        // DON'T speak - just acknowledge silently to avoid rambling
        // User will see the transcript in the UI
        console.log('🎤 Received story input, waiting for more...');
      }
    }
  }, [commands, onCommand, speakResponses, responses]);

  // Enhanced text-to-speech with natural voice selection
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!synthRef.current) {
      console.log('Speech synthesis not available');
      return;
    }

    // Don't speak if we just spoke recently (prevent rapid fire)
    const now = Date.now();
    if (now - lastSpeakTimeRef.current < 2000) {
      console.log('🔊 Skipping speech - too soon after last speech');
      return;
    }
    lastSpeakTimeRef.current = now;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    console.log('🔊 Speaking:', text);
    setState(prev => ({ ...prev, isSpeaking: true }));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.1; // Slightly higher pitch for enthusiasm
    utterance.volume = options?.volume ?? 1.0;
    utterance.lang = language;

    // Get voices - wait for them to load if needed
    let voices = synthRef.current.getVoices();

    // If no voices loaded yet, try to load them
    if (voices.length === 0) {
      console.log('No voices available yet, waiting...');
      // Force voices to load
      speechSynthesis.getVoices();
      voices = synthRef.current.getVoices();
    }

    console.log('Available voices:', voices.length);

    // Priority order for voice selection - prefer expressive voices
    const voicePreferences = [
      // Google voices are usually best quality
      (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en-US'),
      (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
      // Microsoft voices are also good
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.name.includes('Zira') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.startsWith('en-US'),
      // Natural/Enhanced voices
      (v: SpeechSynthesisVoice) => v.name.includes('Natural') && v.lang.startsWith('en'),
      (v: SpeechSynthesisVoice) => v.name.includes('Enhanced') && v.lang.startsWith('en'),
      // Female voices often sound more natural for assistants
      (v: SpeechSynthesisVoice) => (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira')) && v.lang.startsWith('en'),
      // Any English US voice
      (v: SpeechSynthesisVoice) => v.lang === 'en-US',
      // Any English voice
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    ];

    let selectedVoice = null;
    for (const preference of voicePreferences) {
      selectedVoice = voices.find(preference);
      if (selectedVoice) {
        console.log('Selected voice:', selectedVoice.name);
        break;
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (voices.length > 0) {
      // Fallback to first available voice
      utterance.voice = voices[0];
      console.log('Using fallback voice:', voices[0].name);
    }

    utterance.onstart = () => {
      console.log('🎙️ Speech started');
    };

    utterance.onend = () => {
      console.log('🎙️ Speech ended');
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    // Ensure speech synthesis is ready
    if (synthRef.current.paused) {
      synthRef.current.resume();
    }

    synthRef.current.speak(utterance);
  }, [language]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  // Start listening with permission check
  const startListening = useCallback(async () => {
    const browserInfo = getBrowserInfo();
    console.log('🎤 startListening called - Browser:', browserInfo.isChrome ? 'Chrome' : 'Other');

    // Mark voice mode as active for auto-restart
    isVoiceModeActiveRef.current = true;
    isWakeWordDetectedRef.current = true;

    // First, request microphone permission and keep the stream active
    try {
      // Stop any previous stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;
      console.log('🎤 Microphone permission granted, stream active');
      setState(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
    } catch (error: any) {
      // Handle permission denied gracefully - no console.error to avoid scary messages
      console.log('🎤 Microphone access not available:', error?.name || 'Unknown error');
      isVoiceModeActiveRef.current = false;

      let errorMessage = '';
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        if (browserInfo.isChrome) {
          errorMessage = 'Microphone blocked in Chrome. Click the camera/mic icon in the address bar (or lock icon), select "Allow" for Microphone, then refresh the page.';
        } else {
          errorMessage = 'Microphone access denied. Click the lock icon in your browser\'s address bar to allow access.';
        }
      } else if (error?.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else {
        errorMessage = 'Microphone not available. Please check your browser settings.';
      }

      setState(prev => ({
        ...prev,
        permissionStatus: error?.name === 'NotAllowedError' ? 'denied' : 'unknown',
        error: errorMessage,
      }));
      return;
    }

    // Always create a fresh recognition instance to avoid stale state issues
    recognitionRef.current = initRecognition();

    if (recognitionRef.current) {
      // Chrome needs a slightly longer delay after getUserMedia
      const startDelay = browserInfo.isChrome ? 250 : 150;

      setTimeout(() => {
        try {
          recognitionRef.current?.start();
          console.log('🎤 Speech recognition started successfully');
        } catch (e: any) {
          if (e.message?.includes('already started')) {
            console.log('🎤 Recognition already running');
          } else {
            console.error('🎤 Failed to start recognition:', e);
            // For Chrome, try one more time with a fresh instance
            if (browserInfo.isChrome) {
              console.log('🎤 Chrome: Retrying with fresh instance');
              setTimeout(() => {
                try {
                  recognitionRef.current = initRecognition();
                  recognitionRef.current?.start();
                  console.log('🎤 Chrome: Retry successful');
                } catch (retryError) {
                  console.error('🎤 Chrome: Retry also failed', retryError);
                  isVoiceModeActiveRef.current = false;
                  setState(prev => ({
                    ...prev,
                    error: 'Failed to start speech recognition in Chrome. Try refreshing the page.',
                  }));
                }
              }, 300);
            } else {
              isVoiceModeActiveRef.current = false;
              setState(prev => ({
                ...prev,
                error: 'Failed to start speech recognition. Please try again.',
              }));
            }
          }
        }
      }, startDelay);
    } else {
      isVoiceModeActiveRef.current = false;
      setState(prev => ({
        ...prev,
        error: 'Speech recognition not available in this browser.',
      }));
    }
  }, [initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('🎤 stopListening called');

    // IMPORTANT: Set this BEFORE stopping recognition to prevent auto-restart
    isVoiceModeActiveRef.current = false;
    isWakeWordDetectedRef.current = false;

    // Clear debounce timeout
    if (transcriptDebounceRef.current) {
      clearTimeout(transcriptDebounceRef.current);
      transcriptDebounceRef.current = null;
    }

    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore
    }

    // Stop the media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Clear session data to avoid stale repeats on next activation
    lastProcessedTranscriptRef.current = '';
    sessionTranscriptsRef.current = [];
    processedCommandsRef.current.clear();
    greetingSpokenRef.current = false; // Reset so greeting plays on next activation

    setState(prev => ({
      ...prev,
      isWakeWordDetected: false,
      audioLevel: 0,
      isListening: false,
      interimTranscript: '',
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      lastCommand: null,
    }));
  }, []);

  // Activate wake word detection directly (skip wake word requirement)
  const activateDirectly = useCallback(async () => {
    console.log('🎤 activateDirectly called');

    // Prevent double activation
    if (greetingSpokenRef.current) {
      console.log('🎤 Already activated, skipping greeting');
      return;
    }

    // Set the ref AND state
    isWakeWordDetectedRef.current = true;
    greetingSpokenRef.current = true;
    setState(prev => ({ ...prev, isWakeWordDetected: true }));

    // Speak greeting ONCE (requires user gesture to work)
    if (speakResponses) {
      lastSpeakTimeRef.current = Date.now(); // Mark that we're speaking
      speak(responses.greeting);
    }

    // Start listening after greeting finishes (longer delay)
    setTimeout(async () => {
      console.log('🎤 Starting listening after greeting...');
      await startListening();
    }, 2500); // Wait 2.5 seconds for greeting to finish

    // Set timeout for auto-deactivation
    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
    }
    wakeWordTimeoutRef.current = setTimeout(() => {
      console.log('🎤 Auto-deactivating after timeout');
      isWakeWordDetectedRef.current = false;
      greetingSpokenRef.current = false; // Reset for next activation
      setState(prev => ({ ...prev, isWakeWordDetected: false }));
      if (speakResponses) {
        speak(responses.goodbye);
      }
    }, 60000); // 60 seconds timeout
  }, [startListening, speak, speakResponses, responses]);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed to request permission
      stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, error: null, permissionStatus: 'granted' }));
      return true;
    } catch (error: any) {
      const errorMessage = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError'
        ? 'Microphone access denied. Click the lock icon in your browser\'s address bar to allow access.'
        : error?.name === 'NotFoundError'
        ? 'No microphone found. Please connect a microphone.'
        : 'Microphone not available.';

      setState(prev => ({
        ...prev,
        permissionStatus: error?.name === 'NotAllowedError' ? 'denied' : 'unknown',
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  // Open browser settings help for microphone
  const openMicrophoneSettings = useCallback(() => {
    // Show helpful instructions based on browser
    const isChrome = navigator.userAgent.includes('Chrome');
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');

    let instructions = 'To enable microphone:\n';
    if (isChrome) {
      instructions += '1. Click the lock/info icon in the address bar\n2. Find "Microphone" and set to "Allow"\n3. Refresh the page';
    } else if (isFirefox) {
      instructions += '1. Click the shield icon in the address bar\n2. Click on permissions\n3. Allow microphone access';
    } else if (isSafari) {
      instructions += '1. Go to Safari > Settings > Websites\n2. Find Microphone\n3. Allow for this website';
    } else {
      instructions += '1. Check your browser settings\n2. Allow microphone access for this site\n3. Refresh the page';
    }

    setState(prev => ({ ...prev, error: instructions }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      console.log('🎤 Cleaning up voice activation hook');
      try {
        recognitionRef.current?.stop();
      } catch (e) {}

      synthRef.current?.cancel();

      // Clean up media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
      if (transcriptDebounceRef.current) {
        clearTimeout(transcriptDebounceRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Clear all session data
      lastProcessedTranscriptRef.current = '';
      sessionTranscriptsRef.current = [];
      processedCommandsRef.current.clear();
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    speak,
    stopSpeaking,
    activateDirectly,
    requestPermission,
    openMicrophoneSettings,
    checkMicrophonePermission,
    // Expose the voice mode active ref for external coordination
    isVoiceModeActive: isVoiceModeActiveRef.current,
    setPersonality: (personality: 'professional' | 'friendly' | 'enthusiastic') => {
      // This would need to be handled differently if we want to change personality
    },
  };
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInterface;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default useVoiceActivation;
