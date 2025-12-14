import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mic, MicOff, Volume2, Play, Pause, Square,
  Bot, Send, Sparkles, Loader2, MessageSquare, User,
  Rocket, CheckCircle2, ChevronRight, ArrowRight, Brain,
  Lightbulb, Target, Users, Phone, RefreshCw
} from 'lucide-react';

// AI Voice Assistant Personas
const assistantPersonas = [
  {
    id: 'sage',
    name: 'Sage',
    role: 'App Architect',
    description: 'Strategic thinker who helps design your app structure',
    voice: 'fable',
    avatar: '🧙',
    color: 'from-purple-500 to-indigo-500',
    greeting: "Hello! I'm Sage, your App Architect. Tell me about the app you want to build, and I'll help you design it step by step. What problem are you trying to solve?",
  },
  {
    id: 'nova',
    name: 'Nova',
    role: 'Innovation Guide',
    description: 'Creative partner who sparks innovative ideas',
    voice: 'nova',
    avatar: '✨',
    color: 'from-pink-500 to-rose-500',
    greeting: "Hey there! I'm Nova, your Innovation Guide. I love helping people bring creative ideas to life. What's the vision for your app? Paint me a picture!",
  },
  {
    id: 'max',
    name: 'Max',
    role: 'Tech Mentor',
    description: 'Practical advisor focused on implementation',
    voice: 'onyx',
    avatar: '🚀',
    color: 'from-cyan-500 to-blue-500',
    greeting: "What's up! I'm Max, your Tech Mentor. I'll help you turn your app idea into reality with practical, actionable steps. What are we building today?",
  },
];

// Conversation stages for guided app building
const conversationStages = [
  { id: 'idea', name: 'App Idea', icon: Lightbulb, questions: ['What problem does your app solve?', 'Who is your target user?'] },
  { id: 'features', name: 'Core Features', icon: Target, questions: ['What are the main features?', 'What makes it unique?'] },
  { id: 'users', name: 'User Experience', icon: Users, questions: ['How will users interact with it?', 'What\'s the main user flow?'] },
  { id: 'tech', name: 'Technical Needs', icon: Brain, questions: ['What platforms will it run on?', 'Any specific integrations?'] },
  { id: 'summary', name: 'Blueprint Ready', icon: CheckCircle2, questions: ['Review your app blueprint', 'Generate voice pitch?'] },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  audioUrl?: string;
}

interface ExtendedMessage extends Message {
  persona?: typeof assistantPersonas[0];
}

interface StoryModeVoiceProps {
  onBlueprintComplete?: (blueprint: any) => void;
}

const StoryModeVoice: React.FC<StoryModeVoiceProps> = ({ onBlueprintComplete }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // State
  const [selectedPersona, setSelectedPersona] = useState(assistantPersonas[2]); // Default to Max
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentStage, setCurrentStage] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [appBlueprint, setAppBlueprint] = useState<any>({});

  // Microphone permission state
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [speechSupported, setSpeechSupported] = useState(true);

  // Team Mode - All three mentors active
  const [teamMode, setTeamMode] = useState(false);
  const [activeTeamPersonas, setActiveTeamPersonas] = useState<typeof assistantPersonas>([]);
  const [currentSpeakingPersona, setCurrentSpeakingPersona] = useState<typeof assistantPersonas[0] | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const pendingTranscriptRef = useRef<string>('');

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      // Pre-load voices
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Check microphone permission and speech recognition support on mount
  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicPermission('denied');
      return;
    }

    // Check microphone permission
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setMicPermission(result.state as 'granted' | 'denied' | 'prompt');

            // Listen for permission changes
            result.addEventListener('change', () => {
              setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
            });
          } catch {
            // Permissions API not supported for microphone
            setMicPermission('prompt');
          }
        } else {
          setMicPermission('prompt');
        }
      } catch {
        setMicPermission('prompt');
      }
    };

    checkMicPermission();
  }, []);

  // Setup speech recognition with proper handlers
  const setupRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      setSpeechSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true; // Enable interim results for better UX
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    return recognition;
  }, []);

  // Initialize recognition on mount
  useEffect(() => {
    recognitionRef.current = setupRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [setupRecognition]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start conversation
  const startConversation = useCallback(() => {
    setIsStarted(true);

    if (teamMode) {
      // Team Mode: All three personas introduce themselves
      setActiveTeamPersonas([...assistantPersonas]);
      const teamGreeting = `Welcome to Team Mode! You have three AI mentors ready to help you build your app:

🧙 **Sage** (App Architect) - I'll help design your app's structure and architecture.

✨ **Nova** (Innovation Guide) - I'll spark creative ideas and unique features.

🚀 **Max** (Tech Mentor) - I'll focus on practical implementation steps.

Together, we'll guide you through creating a complete app blueprint. What's the app idea you want to bring to life?`;

      const greeting: ExtendedMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: teamGreeting,
        timestamp: new Date(),
        persona: assistantPersonas[2], // Max speaks for the team intro
      };
      setMessages([greeting]);

      if (voiceEnabled) {
        speakMessage(teamGreeting);
      }
    } else {
      // Single persona mode
      const greeting: ExtendedMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: selectedPersona.greeting,
        timestamp: new Date(),
        persona: selectedPersona,
      };
      setMessages([greeting]);

      if (voiceEnabled) {
        speakMessage(selectedPersona.greeting);
      }
    }
  }, [selectedPersona, voiceEnabled, teamMode]);

  // Speak message
  const speakMessage = useCallback((text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try to find a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Generate AI response - supports both single and team mode
  // MOVED BEFORE startListening to avoid circular reference
  const generateResponse = useCallback(async (userMessage: string): Promise<{ content: string; persona: typeof assistantPersonas[0] }[]> => {
    const stage = conversationStages[currentStage];
    const lowerMessage = userMessage.toLowerCase();

    // Update blueprint based on stage
    const updatedBlueprint = { ...appBlueprint };

    if (currentStage === 0) {
      updatedBlueprint.problem = userMessage;
      if (lowerMessage.includes('track') || lowerMessage.includes('manage') || lowerMessage.includes('organize')) {
        updatedBlueprint.category = 'Productivity';
      } else if (lowerMessage.includes('learn') || lowerMessage.includes('teach') || lowerMessage.includes('education')) {
        updatedBlueprint.category = 'Education';
      } else if (lowerMessage.includes('health') || lowerMessage.includes('fitness') || lowerMessage.includes('wellness')) {
        updatedBlueprint.category = 'Health & Fitness';
      } else {
        updatedBlueprint.category = 'Lifestyle';
      }
    } else if (currentStage === 1) {
      updatedBlueprint.features = userMessage.split(',').map(f => f.trim());
    } else if (currentStage === 2) {
      updatedBlueprint.userFlow = userMessage;
    } else if (currentStage === 3) {
      updatedBlueprint.platforms = userMessage;
    }

    setAppBlueprint(updatedBlueprint);

    // Team mode responses - each persona gives their unique perspective
    if (teamMode) {
      const teamResponses: Record<number, { sage: string; nova: string; max: string }> = {
        0: {
          sage: `🧙 **Sage:** From an architectural perspective, this is a solid foundation. I'm already thinking about the data models and system design. Who's your primary user persona?`,
          nova: `✨ **Nova:** Ooh, I love this idea! There's so much creative potential here. What if we added a unique twist - like gamification or social features to make it stand out?`,
          max: `🚀 **Max:** Alright, let's get practical! This is totally buildable. Let's nail down the core feature - what's the ONE thing users must be able to do?`,
        },
        1: {
          sage: `🧙 **Sage:** Good features! I'd recommend organizing these into a core module and optional modules. This keeps your MVP lean but extensible.`,
          nova: `✨ **Nova:** These features are great! But let's think about the "wow factor" - what's going to make users tell their friends about your app?`,
          max: `🚀 **Max:** Solid feature list! Now let's think user flow - when someone opens your app, what's their first action? Keep it simple!`,
        },
        2: {
          sage: `🧙 **Sage:** The user flow is taking shape. I'd suggest a 3-screen onboarding max, then straight to value. Consider state management early.`,
          nova: `✨ **Nova:** Love the flow! What about micro-interactions and delightful animations? Small touches make apps feel premium.`,
          max: `🚀 **Max:** Good UX thinking! Let's talk platforms - web, iOS, Android? I'd recommend starting with one and expanding.`,
        },
        3: {
          sage: `🧙 **Sage:** Excellent! The technical architecture is clear now. I recommend a modular approach with clean separation of concerns.`,
          nova: `✨ **Nova:** The vision is complete! Your app has both utility AND personality. Users are going to love this!`,
          max: `🚀 **Max:** We've got everything we need! Your blueprint is ready. Want me to generate the full spec and a voice pitch?`,
        },
        4: {
          sage: `🧙 **Sage:** Your architecture blueprint is complete. Ready to see the full technical specification?`,
          nova: `✨ **Nova:** Your creative vision is captured! Let's bring this beautiful idea to life!`,
          max: `🚀 **Max:** Blueprint ready! Options: 1) View full spec, 2) Generate voice pitch, 3) Start building with BuilderIQ!`,
        },
      };

      const stageTeamResponses = teamResponses[currentStage] || teamResponses[4];

      // Return all three responses
      const responses = [
        { content: stageTeamResponses.sage, persona: assistantPersonas[0] },
        { content: stageTeamResponses.nova, persona: assistantPersonas[1] },
        { content: stageTeamResponses.max, persona: assistantPersonas[2] },
      ];

      if (currentStage < conversationStages.length - 1) {
        setCurrentStage(prev => prev + 1);
      }

      return responses;
    }

    // Single persona mode responses
    const responses: Record<number, string[]> = {
      0: [
        `Great problem to solve! I can see this being really useful. Who specifically are you building this for? Parents, students, professionals?`,
        `Interesting! That's a solid foundation. Let's dig deeper - what makes this problem particularly frustrating for your target users?`,
        `Love it! Now let's get specific - what's the ONE core thing your app needs to do really well?`,
      ],
      1: [
        `Those features sound solid! Now let's think about the user experience. How would someone typically use your app - daily, weekly, or when a specific event happens?`,
        `Great feature set! What would be the first thing a user sees when they open your app?`,
        `I like where this is going! What's the "aha moment" - the point where users realize the value of your app?`,
      ],
      2: [
        `Perfect! Now let's talk tech. What platforms are you thinking - iOS, Android, web, or all three?`,
        `Nice user flow! Any third-party services you'd want to integrate with? Like calendars, payment systems, or social media?`,
        `Good thinking about the user journey! What about notifications - would push notifications be important for your users?`,
      ],
      3: [
        `Excellent! I have a clear picture now. Let me summarize your app blueprint... ${selectedPersona.name === 'Sage' ? 'From an architectural standpoint, this is well-structured.' : selectedPersona.name === 'Nova' ? 'This has real creative potential!' : 'This is very implementable!'} Ready to see your complete blueprint?`,
        `All the pieces are coming together! Your app is taking shape. Shall I generate a complete blueprint with a voice pitch you can share with potential users or investors?`,
      ],
      4: [
        `Your blueprint is ready! You can now: 1) View the full app specification, 2) Generate a professional voice pitch, or 3) Start building with BuilderIQ. What would you like to do?`,
      ],
    };

    const stageResponses = responses[currentStage] || responses[4];
    const response = stageResponses[Math.floor(Math.random() * stageResponses.length)];

    if (currentStage < conversationStages.length - 1) {
      setCurrentStage(prev => prev + 1);
    }

    return [{ content: response, persona: selectedPersona }];
  }, [currentStage, appBlueprint, selectedPersona, teamMode]);

  // Send message - MOVED BEFORE startListening to avoid circular reference
  const handleSendMessage = useCallback(async (text?: string, isVoice = false) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ExtendedMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      isVoice,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Generate AI response(s)
      const aiResponses = await generateResponse(messageText);

      if (teamMode && aiResponses.length > 1) {
        // Team mode: Add each persona's response with delay for dramatic effect
        const newMessages: ExtendedMessage[] = [];

        for (let i = 0; i < aiResponses.length; i++) {
          const response = aiResponses[i];
          const assistantMessage: ExtendedMessage = {
            id: `msg-${Date.now() + i + 1}`,
            role: 'assistant',
            content: response.content,
            timestamp: new Date(),
            persona: response.persona,
          };
          newMessages.push(assistantMessage);
        }

        // Add all messages at once
        setMessages(prev => [...prev, ...newMessages]);

        // Speak combined response if voice enabled
        if (voiceEnabled) {
          const combinedText = aiResponses.map(r => r.content.replace(/[*_#]/g, '')).join(' ');
          speakMessage(combinedText);
        }
      } else {
        // Single persona mode
        const response = aiResponses[0];
        const assistantMessage: ExtendedMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          persona: response.persona,
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (voiceEnabled) {
          speakMessage(response.content);
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, generateResponse, voiceEnabled, speakMessage, toast, teamMode]);

  // Start voice input with proper event handlers
  const startListening = useCallback(() => {
    // Check if speech recognition is supported
    if (!speechSupported) {
      toast({
        title: 'Voice Not Supported',
        description: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.',
        variant: 'destructive',
      });
      return;
    }

    // Check microphone permission status
    if (micPermission === 'denied') {
      toast({
        title: 'Microphone Blocked',
        description: 'Microphone access is blocked. Please enable it in your browser settings (click the lock icon in address bar) and refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    // Re-create recognition instance for fresh start
    const recognition = setupRecognition();
    if (!recognition) {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported in this browser. Please use Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    recognitionRef.current = recognition;

    // Stop any current speech output
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    // Reset pending transcript
    pendingTranscriptRef.current = '';

    // Handle interim and final results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results in input
      if (interimTranscript) {
        setInputText(interimTranscript);
      }

      // Process final result
      if (finalTranscript) {
        pendingTranscriptRef.current = finalTranscript;
        setInputText(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Send the message if we have a transcript
      if (pendingTranscriptRef.current.trim()) {
        const transcript = pendingTranscriptRef.current.trim();
        pendingTranscriptRef.current = '';
        // Small delay to ensure state is updated
        setTimeout(() => {
          handleSendMessage(transcript, true);
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition issue:', {
        error: event.error,
        suggestion: 'Check browser permissions'
      });
      setIsListening(false);
      pendingTranscriptRef.current = '';

      // Handle specific error types
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        toast({
          title: 'Microphone Access Denied',
          description: 'Microphone access was denied. Please click the lock icon in your browser\'s address bar, allow microphone access, and refresh the page.',
          variant: 'destructive',
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: 'No Speech Detected',
          description: 'I didn\'t hear anything. Please speak clearly into your microphone and try again.',
        });
      } else if (event.error === 'audio-capture') {
        toast({
          title: 'Microphone Error',
          description: 'Could not access your microphone. Please make sure it\'s connected and not being used by another app.',
          variant: 'destructive',
        });
      } else if (event.error === 'network') {
        toast({
          title: 'Network Error',
          description: 'Speech recognition requires an internet connection. Please check your connection.',
          variant: 'destructive',
        });
      } else if (event.error === 'aborted') {
        // User aborted, no need to show error
      } else {
        toast({
          title: 'Voice Error',
          description: `Could not recognize speech: ${event.error}. Please try again.`,
          variant: 'destructive',
        });
      }
    };

    recognition.onspeechstart = () => {
      console.log('Speech detected');
    };

    recognition.onspeechend = () => {
      console.log('Speech ended');
    };

    // Request microphone permission and start
    try {
      recognition.start();
      setIsListening(true);
      setMicPermission('granted'); // Permission was granted if we got here

      toast({
        title: '🎤 Listening...',
        description: 'Speak now - I\'m listening to you!',
      });
    } catch (error: any) {
      console.warn('Failed to start recognition:', error);
      setIsListening(false);

      if (error.name === 'InvalidStateError' || error.message?.includes('already started')) {
        // Recognition already running, stop and restart
        try {
          recognition.stop();
        } catch (e) {
          // Ignore
        }
        setTimeout(() => startListening(), 300);
      } else if (error.name === 'NotAllowedError') {
        setMicPermission('denied');
        toast({
          title: 'Microphone Blocked',
          description: 'Please enable microphone access in your browser settings.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Voice Error',
          description: 'Failed to start voice recognition. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }, [toast, setupRecognition, handleSendMessage, speechSupported, micPermission]);

  // Stop voice input
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    setIsListening(false);
  }, []);

  // Reset conversation
  const resetConversation = useCallback(() => {
    setMessages([]);
    setCurrentStage(0);
    setAppBlueprint({});
    setIsStarted(false);
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Generate blueprint and navigate
  const generateBlueprint = useCallback(() => {
    // Store blueprint in session
    sessionStorage.setItem('voiceBlueprint', JSON.stringify({
      ...appBlueprint,
      conversationHistory: messages,
      generatedAt: new Date().toISOString(),
      assistantPersona: selectedPersona.name,
    }));

    onBlueprintComplete?.(appBlueprint);

    toast({
      title: 'Blueprint Generated!',
      description: 'Your app blueprint is ready. Redirecting to BuilderIQ...',
    });

    setTimeout(() => {
      navigate('/builderiq/questionnaire?fromVoice=true');
    }, 1500);
  }, [appBlueprint, messages, selectedPersona, onBlueprintComplete, toast, navigate]);

  // Pre-conversation persona selection
  if (!isStarted) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <Badge className="mb-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30">
            <Bot className="w-3 h-3 mr-1" /> Voice-Driven App Building
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4">
            Story Mode <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Voice</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Build your app through a natural voice conversation. Speak your ideas, and our AI mentors will
            guide you through creating a complete app blueprint - hands-free!
          </p>
        </div>

        {/* Team Mode Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setTeamMode(false)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                !teamMode
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Single Mentor
            </button>
            <button
              onClick={() => setTeamMode(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                teamMode
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Team Mode (All 3)
            </button>
          </div>
        </div>

        {/* Team Mode Display */}
        {teamMode ? (
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center items-center gap-1 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-bold text-lg">TEAM MODE ACTIVE</span>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <CardTitle className="text-white text-xl">All Three Mentors Will Guide You</CardTitle>
              <CardDescription className="text-gray-400">
                Get multiple perspectives on your app idea from our expert team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {assistantPersonas.map((persona, i) => (
                  <div
                    key={persona.id}
                    className={`relative p-4 rounded-xl bg-gradient-to-br ${persona.color} border-2 border-white/20 transform transition-all duration-300 hover:scale-105`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {/* Active indicator */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>

                    <div className="text-center">
                      <div className="text-4xl mb-2">{persona.avatar}</div>
                      <h4 className="text-white font-bold">{persona.name}</h4>
                      <p className="text-white/80 text-sm">{persona.role}</p>
                      <p className="text-white/60 text-xs mt-2">{persona.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Team benefits */}
              <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-400">Architecture Insights</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-400">Creative Ideas</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <Rocket className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-400">Practical Steps</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Single Persona Selection */
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {assistantPersonas.map((persona) => (
              <Card
                key={persona.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedPersona.id === persona.id
                    ? `bg-gradient-to-br ${persona.color} border-transparent shadow-lg shadow-purple-500/20`
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedPersona(persona)}
              >
                <CardHeader className="text-center">
                  <div className="text-5xl mb-3">{persona.avatar}</div>
                  <CardTitle className="text-white">{persona.name}</CardTitle>
                  <CardDescription className={selectedPersona.id === persona.id ? 'text-white/80' : 'text-gray-400'}>
                    {persona.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm text-center ${selectedPersona.id === persona.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {persona.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Voice Toggle */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={voiceEnabled
              ? 'border-cyan-500/50 text-cyan-300 bg-cyan-500/10'
              : 'border-slate-600 text-gray-400'
            }
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Voice: {voiceEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={startConversation}
            className={`px-8 py-6 text-lg ${
              teamMode
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 shadow-lg shadow-cyan-500/30'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90'
            }`}
          >
            <Mic className="w-5 h-5 mr-2" />
            {teamMode ? 'Start Team Conversation' : 'Start Voice Conversation'}
          </Button>
          <p className="text-gray-500 text-sm mt-3">
            {teamMode
              ? 'All three mentors will collaborate to build your app blueprint'
              : 'Speak naturally to build your app idea into a complete blueprint'
            }
          </p>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-white text-center mb-6">How Story Mode Voice Works</h3>
          <div className="flex justify-between items-center">
            {conversationStages.slice(0, 4).map((stage, i) => {
              const Icon = stage.icon;
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-500 text-center">{stage.name}</span>
                  </div>
                  {i < 3 && (
                    <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active conversation interface
  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar - Progress */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            {teamMode ? (
              /* Team Mode Header */
              <div>
                <div className="flex justify-center items-center gap-1 mb-3">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    <Users className="w-3 h-3 mr-1" /> Team Mode
                  </Badge>
                </div>
                <div className="flex justify-center gap-2">
                  {assistantPersonas.map((persona) => (
                    <div
                      key={persona.id}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-xl border-2 border-white/20 transition-all hover:scale-110`}
                      title={`${persona.name} - ${persona.role}`}
                    >
                      {persona.avatar}
                    </div>
                  ))}
                </div>
                <p className="text-center text-gray-400 text-xs mt-2">All mentors active</p>
              </div>
            ) : (
              /* Single Persona Header */
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedPersona.avatar}</div>
                <div>
                  <CardTitle className="text-white text-lg">{selectedPersona.name}</CardTitle>
                  <CardDescription>{selectedPersona.role}</CardDescription>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Steps */}
            <div className="space-y-3">
              {conversationStages.map((stage, i) => {
                const Icon = stage.icon;
                const isComplete = i < currentStage;
                const isCurrent = i === currentStage;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isCurrent ? 'bg-purple-500/20 border border-purple-500/30' :
                      isComplete ? 'opacity-80' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-500' :
                      isCurrent ? 'bg-purple-500' : 'bg-slate-700'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <Icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm ${isCurrent ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {stage.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Voice Controls */}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="w-full border-slate-600 text-gray-300"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Voice: {voiceEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetConversation}
                className="w-full border-slate-600 text-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generate Blueprint CTA */}
        {currentStage >= conversationStages.length - 1 && (
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Rocket className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Blueprint Ready!</h4>
              <p className="text-gray-400 text-sm mb-4">Your app idea is fully captured</p>
              <Button
                onClick={generateBlueprint}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                Generate Blueprint
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="bg-slate-800/50 border-slate-700 h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {teamMode ? (
                <>
                  <div className="flex -space-x-2">
                    {assistantPersonas.map((p) => (
                      <div key={p.id} className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-lg border-2 border-slate-800`}>
                        {p.avatar}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-white font-medium flex items-center gap-2">
                      Team Mode
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                        3 Active
                      </Badge>
                    </h3>
                    <p className="text-xs text-gray-400">
                      {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Sage, Nova & Max ready'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedPersona.color} flex items-center justify-center`}>
                    <span className="text-xl">{selectedPersona.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{selectedPersona.name}</h3>
                    <p className="text-xs text-gray-400">
                      {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to chat'}
                    </p>
                  </div>
                </>
              )}
            </div>
            {isSpeaking && (
              <Button size="sm" variant="ghost" onClick={stopSpeaking} className="text-red-400">
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const messagePersona = (message as ExtendedMessage).persona;
              const personaColor = messagePersona?.color || selectedPersona.color;

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-br-sm'
                        : teamMode && messagePersona
                          ? `bg-gradient-to-br ${personaColor} bg-opacity-20 border border-white/10 text-gray-200 rounded-bl-sm`
                          : 'bg-slate-700/50 text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${personaColor} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-sm">{messagePersona?.avatar || selectedPersona.avatar}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        {message.role === 'assistant' && teamMode && messagePersona && (
                          <p className="text-xs font-bold text-white/80 mb-1">
                            {messagePersona.name} • {messagePersona.role}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.isVoice && (
                          <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                            <Mic className="w-3 h-3" />
                            Voice message
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <User className="w-4 h-4 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-700/50 p-4 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    {teamMode ? (
                      <>
                        <div className="flex -space-x-2">
                          {assistantPersonas.map((p) => (
                            <div key={p.id} className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-xs border border-slate-700`}>
                              {p.avatar}
                            </div>
                          ))}
                        </div>
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        <span className="text-gray-400 text-sm">Team is thinking...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">{selectedPersona.avatar}</span>
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="text-gray-400 text-sm">Thinking...</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700">
            {/* Microphone Status Warning */}
            {micPermission === 'denied' && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm">
                <div className="flex items-center gap-2 text-red-400">
                  <MicOff className="w-4 h-4" />
                  <span className="font-medium">Microphone access is blocked</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Click the lock icon in your address bar → Allow microphone → Refresh page
                </p>
              </div>
            )}

            {!speechSupported && (
              <div className="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
                <div className="flex items-center gap-2 text-yellow-400">
                  <MicOff className="w-4 h-4" />
                  <span className="font-medium">Voice input not supported</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Please use Chrome, Edge, or Safari for voice recognition
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Voice Input Button */}
              <div className="relative">
                <Button
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || isSpeaking || micPermission === 'denied' || !speechSupported}
                  className={`rounded-full h-14 w-14 transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
                      : micPermission === 'denied' || !speechSupported
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/30'
                  }`}
                  title={
                    micPermission === 'denied'
                      ? 'Microphone blocked - click to see instructions'
                      : !speechSupported
                        ? 'Voice not supported in this browser'
                        : isListening
                          ? 'Click to stop listening'
                          : 'Click to start voice input'
                  }
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                {/* Mic status indicator dot */}
                {speechSupported && micPermission !== 'denied' && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                  }`} />
                )}
              </div>

              {/* Text Input */}
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
                  placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
                  className="bg-slate-900/50 border-slate-600 text-white pr-12"
                  disabled={isProcessing || isListening}
                />
                <Button
                  size="sm"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isProcessing}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
              {speechSupported && micPermission !== 'denied' ? (
                <>
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    {isListening ? 'Listening... speak now' : 'Click mic to speak'}
                  </span>
                  <span>or</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Type your message
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1 text-yellow-500">
                  <MessageSquare className="w-3 h-3" />
                  Type your message (voice unavailable)
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StoryModeVoice;
