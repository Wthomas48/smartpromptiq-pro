import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Music, Mic, Volume2, Play, Sparkles, Wand2,
  Music2, Sliders, Radio, Headphones, FileAudio,
  Check, Plus, Zap, Star, Crown, Rocket, Copy,
  Code, Package, Download, ChevronRight, Settings,
  Layers, Brain, Bot, MessageSquare, Phone
} from 'lucide-react';

// ==========================================
// VOICE & MUSIC FEATURES FOR APPS
// ==========================================

export const voiceMusicFeatures = [
  {
    id: 'text-to-speech',
    name: 'Text-to-Speech',
    icon: Volume2,
    color: 'from-cyan-500 to-blue-500',
    description: 'Convert any text to natural AI voice',
    category: 'voice',
    tier: 'free',
    useCases: ['Read content aloud', 'Accessibility', 'Narration', 'Announcements'],
    codeSnippet: `// Add to your app
import { useVoice } from '@smartpromptiq/voice';

const { speak, stop, isPlaying } = useVoice();

// Generate speech
await speak({
  text: "Welcome to my app!",
  voice: "nova", // alloy, echo, fable, onyx, nova, shimmer
  speed: 1.0
});`,
    integration: 'simple',
    tokensPerUse: 10,
  },
  {
    id: 'voice-recording',
    name: 'Voice Recording',
    icon: Mic,
    color: 'from-red-500 to-orange-500',
    description: 'Record user voice input in your app',
    category: 'voice',
    tier: 'free',
    useCases: ['Voice notes', 'Audio messages', 'Voice commands', 'Testimonials'],
    codeSnippet: `// Add voice recording
import { useVoiceRecorder } from '@smartpromptiq/voice';

const {
  startRecording,
  stopRecording,
  audioBlob,
  duration
} = useVoiceRecorder();

// Start recording
await startRecording();
// ... user speaks ...
const audio = await stopRecording();`,
    integration: 'simple',
    tokensPerUse: 0,
  },
  {
    id: 'voice-to-text',
    name: 'Speech-to-Text',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
    description: 'Transcribe voice to text automatically',
    category: 'voice',
    tier: 'starter',
    useCases: ['Voice search', 'Dictation', 'Meeting notes', 'Captions'],
    codeSnippet: `// Transcribe speech
import { useTranscription } from '@smartpromptiq/voice';

const { transcribe, transcript, isListening } = useTranscription();

// Start listening
await transcribe.start();
// transcript updates in real-time
console.log(transcript); // "Hello world"`,
    integration: 'simple',
    tokensPerUse: 15,
  },
  {
    id: 'ai-voice-assistant',
    name: 'AI Voice Assistant',
    icon: Bot,
    color: 'from-purple-500 to-pink-500',
    description: 'Add a conversational AI voice assistant',
    category: 'voice',
    tier: 'pro',
    useCases: ['Customer support', 'FAQ bot', 'Virtual assistant', 'Interactive guide'],
    codeSnippet: `// AI Voice Assistant
import { useVoiceAssistant } from '@smartpromptiq/voice';

const {
  startConversation,
  sendMessage,
  messages,
  isSpeaking
} = useVoiceAssistant({
  persona: "friendly-helper",
  context: "You help users with our fitness app"
});

// User speaks, AI responds with voice
await sendMessage("How do I track my workout?");`,
    integration: 'moderate',
    tokensPerUse: 50,
  },
  {
    id: 'background-music',
    name: 'Background Music',
    icon: Music,
    color: 'from-violet-500 to-purple-500',
    description: 'Add royalty-free background music',
    category: 'music',
    tier: 'free',
    useCases: ['App ambiance', 'Game music', 'Meditation', 'Workout tracks'],
    codeSnippet: `// Add background music
import { useMusicPlayer } from '@smartpromptiq/music';

const {
  play, pause, setVolume,
  currentTrack, isPlaying
} = useMusicPlayer();

// Play a track from library
await play({
  genre: "calm", // upbeat, corporate, cinematic, etc.
  trackId: "ocean-breeze"
});`,
    integration: 'simple',
    tokensPerUse: 0,
  },
  {
    id: 'ai-music-generation',
    name: 'AI Music Generation',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
    description: 'Generate custom music with AI',
    category: 'music',
    tier: 'pro',
    useCases: ['Custom soundtracks', 'Jingles', 'Personalized music', 'Dynamic audio'],
    codeSnippet: `// Generate AI music
import { useAIMusic } from '@smartpromptiq/music';

const { generate, generatedTrack, isGenerating } = useAIMusic();

// Create custom music
const track = await generate({
  prompt: "Upbeat electronic track for fitness app",
  genre: "electronic",
  duration: 60,
  mood: "energetic"
});`,
    integration: 'moderate',
    tokensPerUse: 75,
  },
  {
    id: 'song-creator',
    name: 'Song Creator',
    icon: Music2,
    color: 'from-rose-500 to-red-500',
    description: 'Let users create songs with lyrics & vocals',
    category: 'music',
    tier: 'enterprise',
    useCases: ['Music apps', 'Social features', 'User content', 'Entertainment'],
    codeSnippet: `// Song creation for users
import { useSongCreator } from '@smartpromptiq/music';

const { createSong, song, progress } = useSongCreator();

// Create a song from lyrics
const mySong = await createSong({
  lyrics: "[Verse 1]\\nHello world...",
  style: "pop",
  mood: "happy",
  vocalStyle: "female"
});`,
    integration: 'complex',
    tokensPerUse: 100,
  },
  {
    id: 'audio-mixer',
    name: 'Audio Mixer',
    icon: Sliders,
    color: 'from-orange-500 to-amber-500',
    description: 'Mix voice with music, adjust levels',
    category: 'music',
    tier: 'pro',
    useCases: ['Podcasts', 'Videos', 'Presentations', 'Audio content'],
    codeSnippet: `// Audio mixing
import { useAudioMixer } from '@smartpromptiq/music';

const {
  addTrack, removeTrack,
  setVolume, mix, exportAudio
} = useAudioMixer();

// Add voice and music
addTrack({ type: 'voice', audioUrl: voiceUrl });
addTrack({ type: 'music', audioUrl: musicUrl, volume: 0.3 });

// Export mixed audio
const mixedAudio = await exportAudio({ format: 'mp3' });`,
    integration: 'moderate',
    tokensPerUse: 25,
  },
  {
    id: 'voice-cloning',
    name: 'Voice Cloning',
    icon: Copy,
    color: 'from-indigo-500 to-blue-500',
    description: 'Clone voices for personalized TTS',
    category: 'voice',
    tier: 'enterprise',
    useCases: ['Brand voice', 'Personalization', 'Audiobooks', 'Gaming'],
    codeSnippet: `// Voice cloning (Enterprise)
import { useVoiceClone } from '@smartpromptiq/voice';

const { cloneVoice, speak } = useVoiceClone();

// Clone from sample audio
const customVoice = await cloneVoice({
  sampleAudio: audioFile,
  voiceName: "brand-voice"
});

// Use cloned voice
await speak("Welcome!", { voice: customVoice.id });`,
    integration: 'complex',
    tokensPerUse: 200,
  },
  {
    id: 'phone-integration',
    name: 'Phone/Call Integration',
    icon: Phone,
    color: 'from-green-500 to-teal-500',
    description: 'Voice features for phone calls',
    category: 'voice',
    tier: 'enterprise',
    useCases: ['IVR systems', 'Call centers', 'Voice bots', 'Automated calls'],
    codeSnippet: `// Phone integration
import { usePhoneVoice } from '@smartpromptiq/voice';

const { makeCall, onIncoming, speak } = usePhoneVoice();

// Handle incoming call
onIncoming(async (call) => {
  await speak("Thanks for calling! How can I help?");
  const response = await call.listen();
  // Process with AI...
});`,
    integration: 'complex',
    tokensPerUse: 100,
  },
];

// App Templates that use Voice/Music features
export const voiceMusicAppTemplates = [
  {
    id: 'meditation-app',
    name: 'Meditation & Wellness App',
    icon: '🧘',
    description: 'Guided meditations with calming music and voice narration',
    features: ['text-to-speech', 'background-music', 'voice-recording'],
    color: 'from-teal-500 to-cyan-500',
    category: 'wellness',
  },
  {
    id: 'podcast-studio',
    name: 'Podcast Studio',
    icon: '🎙️',
    description: 'Record, edit, and publish podcasts with background music',
    features: ['voice-recording', 'audio-mixer', 'background-music', 'voice-to-text'],
    color: 'from-purple-500 to-pink-500',
    category: 'media',
  },
  {
    id: 'language-learning',
    name: 'Language Learning App',
    icon: '🌍',
    description: 'Learn languages with voice exercises and pronunciation',
    features: ['text-to-speech', 'voice-recording', 'voice-to-text'],
    color: 'from-blue-500 to-indigo-500',
    category: 'education',
  },
  {
    id: 'audiobook-player',
    name: 'Audiobook Creator',
    icon: '📚',
    description: 'Turn any text into audiobooks with AI narration',
    features: ['text-to-speech', 'background-music', 'voice-cloning'],
    color: 'from-amber-500 to-orange-500',
    category: 'entertainment',
  },
  {
    id: 'music-creator',
    name: 'Music Creator App',
    icon: '🎵',
    description: 'Let users create their own songs with AI',
    features: ['song-creator', 'ai-music-generation', 'audio-mixer'],
    color: 'from-rose-500 to-pink-500',
    category: 'entertainment',
  },
  {
    id: 'voice-assistant-app',
    name: 'Voice Assistant App',
    icon: '🤖',
    description: 'Build your own Alexa/Siri-like assistant',
    features: ['ai-voice-assistant', 'voice-to-text', 'text-to-speech'],
    color: 'from-violet-500 to-purple-500',
    category: 'productivity',
  },
  {
    id: 'karaoke-app',
    name: 'Karaoke & Singing App',
    icon: '🎤',
    description: 'Sing along with music, record performances',
    features: ['voice-recording', 'background-music', 'audio-mixer', 'song-creator'],
    color: 'from-pink-500 to-red-500',
    category: 'entertainment',
  },
  {
    id: 'fitness-coach',
    name: 'AI Fitness Coach',
    icon: '💪',
    description: 'Voice-guided workouts with motivating music',
    features: ['text-to-speech', 'background-music', 'ai-voice-assistant'],
    color: 'from-green-500 to-emerald-500',
    category: 'fitness',
  },
  {
    id: 'kids-storytelling',
    name: 'Kids Story App',
    icon: '📖',
    description: 'Interactive stories with voices and sound effects',
    features: ['text-to-speech', 'background-music', 'ai-music-generation'],
    color: 'from-yellow-500 to-orange-500',
    category: 'kids',
  },
  {
    id: 'customer-support',
    name: 'AI Support Bot',
    icon: '💬',
    description: 'Voice-enabled customer support for your business',
    features: ['ai-voice-assistant', 'voice-to-text', 'phone-integration'],
    color: 'from-blue-500 to-cyan-500',
    category: 'business',
  },
];

// ==========================================
// FEATURE SELECTOR COMPONENT
// ==========================================

interface VoiceMusicFeatureSelectorProps {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  maxFeatures?: number;
  showCode?: boolean;
}

export const VoiceMusicFeatureSelector: React.FC<VoiceMusicFeatureSelectorProps> = ({
  selectedFeatures,
  onFeaturesChange,
  maxFeatures = 10,
  showCode = true,
}) => {
  const { toast } = useToast();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      onFeaturesChange(selectedFeatures.filter(f => f !== featureId));
    } else {
      if (selectedFeatures.length >= maxFeatures) {
        toast({
          title: 'Max features reached',
          description: `You can add up to ${maxFeatures} features`,
          variant: 'destructive',
        });
        return;
      }
      onFeaturesChange([...selectedFeatures, featureId]);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-green-500/20 text-green-300 border-green-500/30',
      starter: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      pro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      enterprise: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
    return colors[tier] || colors.free;
  };

  return (
    <div className="space-y-6">
      {/* Voice Features */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Mic className="w-5 h-5 text-cyan-400" />
          Voice Features
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {voiceMusicFeatures
            .filter(f => f.category === 'voice')
            .map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeatures.includes(feature.id);
              const isExpanded = expandedFeature === feature.id;

              return (
                <Card
                  key={feature.id}
                  className={`bg-slate-800/50 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <CardContent className="p-4">
                    <div
                      className="flex items-start gap-3"
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{feature.name}</span>
                          <Badge className={`text-[10px] ${getTierBadge(feature.tier)}`}>
                            {feature.tier}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Zap className="w-3 h-3" />
                          <span>{feature.tokensPerUse} tokens/use</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>

                    {/* Expandable Code Section */}
                    {showCode && isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedFeature(isExpanded ? null : feature.id);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 p-0 h-auto"
                        >
                          <Code className="w-3 h-3 mr-1" />
                          {isExpanded ? 'Hide Code' : 'Show Code'}
                        </Button>
                        {isExpanded && (
                          <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-xs text-gray-300 overflow-x-auto">
                            {feature.codeSnippet}
                          </pre>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Music Features */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-400" />
          Music Features
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {voiceMusicFeatures
            .filter(f => f.category === 'music')
            .map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeatures.includes(feature.id);
              const isExpanded = expandedFeature === feature.id;

              return (
                <Card
                  key={feature.id}
                  className={`bg-slate-800/50 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 ring-1 ring-purple-500/50'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <CardContent className="p-4">
                    <div
                      className="flex items-start gap-3"
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{feature.name}</span>
                          <Badge className={`text-[10px] ${getTierBadge(feature.tier)}`}>
                            {feature.tier}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Zap className="w-3 h-3" />
                          <span>{feature.tokensPerUse} tokens/use</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>

                    {showCode && isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedFeature(isExpanded ? null : feature.id);
                          }}
                          className="text-purple-400 hover:text-purple-300 p-0 h-auto"
                        >
                          <Code className="w-3 h-3 mr-1" />
                          {isExpanded ? 'Hide Code' : 'Show Code'}
                        </Button>
                        {isExpanded && (
                          <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-xs text-gray-300 overflow-x-auto">
                            {feature.codeSnippet}
                          </pre>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedFeatures.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                {selectedFeatures.length} feature{selectedFeatures.length > 1 ? 's' : ''} selected
              </span>
              <p className="text-gray-400 text-sm">
                Est. {selectedFeatures.reduce((sum, id) => {
                  const f = voiceMusicFeatures.find(f => f.id === id);
                  return sum + (f?.tokensPerUse || 0);
                }, 0)} tokens per interaction
              </p>
            </div>
            <Badge className="bg-green-500/20 text-green-300">
              Ready to add
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// APP TEMPLATES WITH VOICE/MUSIC
// ==========================================

interface VoiceMusicAppTemplatesProps {
  onSelectTemplate: (template: typeof voiceMusicAppTemplates[0]) => void;
}

export const VoiceMusicAppTemplates: React.FC<VoiceMusicAppTemplatesProps> = ({
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Voice & Music App Templates</h2>
        <p className="text-gray-400">Start with a template that includes voice and music features</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {voiceMusicAppTemplates.map((template) => (
          <Card
            key={template.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group"
            onClick={() => onSelectTemplate(template)}
          >
            <CardContent className="p-5">
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                {template.name}
              </h3>
              <p className="text-gray-400 text-sm mt-1 mb-3">{template.description}</p>

              {/* Features included */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.features.slice(0, 3).map((featureId) => {
                  const feature = voiceMusicFeatures.find(f => f.id === featureId);
                  return feature ? (
                    <Badge key={featureId} className="bg-slate-700 text-gray-300 text-[10px]">
                      {feature.name}
                    </Badge>
                  ) : null;
                })}
                {template.features.length > 3 && (
                  <Badge className="bg-slate-700 text-gray-300 text-[10px]">
                    +{template.features.length - 3} more
                  </Badge>
                )}
              </div>

              <Button
                className={`w-full bg-gradient-to-r ${template.color} hover:opacity-90`}
                size="sm"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// QUICK ADD COMPONENT (for BuilderIQ)
// ==========================================

interface QuickAddVoiceMusicProps {
  onAdd: (features: string[]) => void;
}

export const QuickAddVoiceMusic: React.FC<QuickAddVoiceMusicProps> = ({ onAdd }) => {
  const quickPacks = [
    {
      id: 'basic-voice',
      name: 'Basic Voice Pack',
      icon: Mic,
      features: ['text-to-speech', 'voice-recording'],
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'music-player',
      name: 'Music Player Pack',
      icon: Music,
      features: ['background-music'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'voice-assistant',
      name: 'AI Assistant Pack',
      icon: Bot,
      features: ['ai-voice-assistant', 'voice-to-text', 'text-to-speech'],
      color: 'from-violet-500 to-purple-500',
    },
    {
      id: 'full-audio',
      name: 'Full Audio Suite',
      icon: Headphones,
      features: ['text-to-speech', 'voice-recording', 'background-music', 'audio-mixer', 'ai-music-generation'],
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-400">Quick Add Voice & Music</h4>
      <div className="grid grid-cols-2 gap-2">
        {quickPacks.map((pack) => {
          const Icon = pack.icon;
          return (
            <Button
              key={pack.id}
              variant="outline"
              onClick={() => onAdd(pack.features)}
              className="h-auto p-3 flex flex-col items-start gap-1 border-slate-700 hover:border-purple-500/50"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pack.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{pack.name}</span>
              <span className="text-gray-500 text-[10px]">{pack.features.length} features</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default VoiceMusicFeatureSelector;
