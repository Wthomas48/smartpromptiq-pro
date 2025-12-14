import React, { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Mic, Play, Pause, Volume2, Download, Sparkles, Loader2,
  BookOpen, Headphones, Radio, Video, Phone, Heart, Brain,
  Music, MessageSquare, Gamepad2, Users, Star, Clock, Zap,
  ArrowRight, Check, Crown, Lock, FileAudio
} from 'lucide-react';

// Voice-First App Templates
const voiceAppTemplates = [
  {
    id: 'voice-story-maker',
    name: 'AI Voice Story Maker',
    category: 'Entertainment',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    description: 'Create interactive voice-narrated stories with AI-generated characters and scenes',
    features: ['Multiple narrator voices', 'Character voice generation', 'Background music sync', 'Episode generation'],
    useCases: ['Children\'s stories', 'Audiobooks', 'Interactive fiction', 'Bedtime stories'],
    sampleVoice: 'fable',
    sampleScript: 'Once upon a time, in a land where imagination knew no bounds, there lived a curious young explorer named Luna...',
    complexity: 'Medium',
    estimatedBuild: '2-3 weeks',
    price: 0,
    isFeatured: true,
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Intro Generator',
    category: 'Content Creation',
    icon: Radio,
    color: 'from-red-500 to-orange-500',
    description: 'Generate professional podcast intros, outros, and segment transitions',
    features: ['Dynamic intro generation', 'Multiple host voices', 'Music bed integration', 'Customizable length'],
    useCases: ['Podcast production', 'YouTube intros', 'Radio shows', 'Content creators'],
    sampleVoice: 'alloy',
    sampleScript: 'Welcome to The Innovation Hour! Where we explore the minds behind tomorrow\'s breakthroughs. I\'m your host, and today we\'re diving deep into...',
    complexity: 'Simple',
    estimatedBuild: '1 week',
    price: 0,
    isFeatured: true,
  },
  {
    id: 'audiobook-creator',
    name: 'Audiobook Creator Pro',
    category: 'Publishing',
    icon: Headphones,
    color: 'from-blue-500 to-cyan-500',
    description: 'Transform written content into professional audiobooks with chapter management',
    features: ['Chapter segmentation', 'Multiple narrator options', 'Speed control', 'Bookmark sync'],
    useCases: ['Self-publishing', 'Educational content', 'Long-form articles', 'Course materials'],
    sampleVoice: 'fable',
    sampleScript: 'Chapter One: The Beginning. The morning sun cast long shadows across the quiet village...',
    complexity: 'Complex',
    estimatedBuild: '4-6 weeks',
    price: 79,
    isPremium: true,
  },
  {
    id: 'video-narrator',
    name: 'Short-Form Video Narrator',
    category: 'Social Media',
    icon: Video,
    color: 'from-pink-500 to-rose-500',
    description: 'Generate punchy voiceovers for TikTok, Reels, and YouTube Shorts',
    features: ['Trending voice styles', 'Sync to video length', 'Hook optimization', 'Multi-language support'],
    useCases: ['TikTok creators', 'Instagram Reels', 'YouTube Shorts', 'Ad content'],
    sampleVoice: 'nova',
    sampleScript: 'You won\'t BELIEVE what happened next! This simple hack changed EVERYTHING...',
    complexity: 'Simple',
    estimatedBuild: '1 week',
    price: 0,
    isFeatured: true,
  },
  {
    id: 'call-center-ai',
    name: 'AI Call Center Script Generator',
    category: 'Business',
    icon: Phone,
    color: 'from-green-500 to-emerald-500',
    description: 'Create professional IVR scripts, hold messages, and customer service responses',
    features: ['IVR menu generation', 'On-hold messaging', 'Multi-language support', 'Compliance templates'],
    useCases: ['Customer service', 'Sales teams', 'Appointment booking', 'Support hotlines'],
    sampleVoice: 'nova',
    sampleScript: 'Thank you for calling SmartPromptIQ. Your call is important to us. For sales, press 1. For support, press 2...',
    complexity: 'Medium',
    estimatedBuild: '2-3 weeks',
    price: 99,
    isPremium: true,
  },
  {
    id: 'meditation-guide',
    name: 'Meditation Voice Guide',
    category: 'Wellness',
    icon: Heart,
    color: 'from-teal-400 to-cyan-500',
    description: 'Generate calming meditation sessions with breathing exercises and visualizations',
    features: ['Guided meditations', 'Breathing exercises', 'Sleep stories', 'Ambient sound mixing'],
    useCases: ['Wellness apps', 'Sleep improvement', 'Stress relief', 'Yoga studios'],
    sampleVoice: 'shimmer',
    sampleScript: 'Find a comfortable position... Close your eyes... Take a deep breath in... and slowly release...',
    complexity: 'Simple',
    estimatedBuild: '1-2 weeks',
    price: 0,
    isFeatured: true,
  },
  {
    id: 'affirmation-app',
    name: 'Daily Affirmation Generator',
    category: 'Personal Growth',
    icon: Brain,
    color: 'from-amber-500 to-yellow-500',
    description: 'Create personalized daily affirmations and motivational audio content',
    features: ['Personalized affirmations', 'Daily scheduling', 'Mood-based selection', 'Progress tracking'],
    useCases: ['Self-improvement apps', 'Morning routines', 'Habit building', 'Motivation'],
    sampleVoice: 'nova',
    sampleScript: 'I am capable of achieving anything I set my mind to. Today, I choose to focus on growth and positivity...',
    complexity: 'Simple',
    estimatedBuild: '1 week',
    price: 0,
  },
  {
    id: 'language-tutor',
    name: 'AI Language Tutor Voice',
    category: 'Education',
    icon: MessageSquare,
    color: 'from-indigo-500 to-purple-500',
    description: 'Generate pronunciation guides, vocabulary lessons, and conversational practice',
    features: ['Native pronunciation', 'Vocabulary drills', 'Conversation practice', 'Progress assessment'],
    useCases: ['Language learning apps', 'ESL courses', 'Travel preparation', 'Kids education'],
    sampleVoice: 'echo',
    sampleScript: 'Let\'s practice together! Repeat after me: Buenos días. Good morning. Now you try...',
    complexity: 'Medium',
    estimatedBuild: '3-4 weeks',
    price: 129,
    isPremium: true,
  },
  {
    id: 'game-narrator',
    name: 'Game Voice & Narration',
    category: 'Gaming',
    icon: Gamepad2,
    color: 'from-violet-500 to-purple-600',
    description: 'Create voice lines for game characters, tutorials, and story narration',
    features: ['Character voices', 'Tutorial narration', 'Achievement announcements', 'Story cutscenes'],
    useCases: ['Indie games', 'Mobile games', 'Interactive narratives', 'Game tutorials'],
    sampleVoice: 'onyx',
    sampleScript: 'Warrior! You have proven yourself worthy. Take this legendary sword and fulfill your destiny!',
    complexity: 'Medium',
    estimatedBuild: '2-4 weeks',
    price: 79,
    isPremium: true,
  },
  {
    id: 'music-jingle',
    name: 'Voice Jingle & Ad Creator',
    category: 'Marketing',
    icon: Music,
    color: 'from-rose-500 to-pink-600',
    description: 'Generate catchy voice jingles, ad reads, and brand audio signatures',
    features: ['Jingle scripts', 'Radio ad reads', 'Brand voice guidelines', 'Multiple versions'],
    useCases: ['Radio advertising', 'Brand identity', 'Social media ads', 'Podcast sponsorships'],
    sampleVoice: 'alloy',
    sampleScript: 'SmartPromptIQ! Where your ideas come to life! Create, build, and launch - faster than ever!',
    complexity: 'Simple',
    estimatedBuild: '1 week',
    price: 49,
    isPremium: true,
  },
  {
    id: 'customer-testimonial',
    name: 'AI Testimonial Voice',
    category: 'Marketing',
    icon: Users,
    color: 'from-sky-500 to-blue-600',
    description: 'Generate realistic customer testimonial voice content for marketing',
    features: ['Multiple personas', 'Emotion control', 'Industry-specific', 'A/B versions'],
    useCases: ['Marketing videos', 'Website content', 'Product demos', 'Case studies'],
    sampleVoice: 'echo',
    sampleScript: 'I was skeptical at first, but SmartPromptIQ completely transformed how I work. I saved 10 hours a week!',
    complexity: 'Simple',
    estimatedBuild: '1 week',
    price: 0,
  },
  {
    id: 'elearning-narrator',
    name: 'E-Learning Course Narrator',
    category: 'Education',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
    description: 'Professional narration for online courses, training modules, and tutorials',
    features: ['Slide sync', 'Quiz narration', 'Multiple languages', 'SCORM export'],
    useCases: ['Corporate training', 'Online courses', 'Compliance training', 'Onboarding'],
    sampleVoice: 'shimmer',
    sampleScript: 'Welcome to Module 3: Advanced Techniques. In this section, we\'ll cover three key concepts...',
    complexity: 'Medium',
    estimatedBuild: '2-3 weeks',
    price: 99,
    isPremium: true,
  },
];

interface VoiceAppTemplatesProps {
  onSelectTemplate?: (template: typeof voiceAppTemplates[0]) => void;
  showAsSidebar?: boolean;
  filterCategory?: string;
}

const VoiceAppTemplates: React.FC<VoiceAppTemplatesProps> = ({
  onSelectTemplate,
  showAsSidebar = false,
  filterCategory,
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<typeof voiceAppTemplates[0] | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter templates by category if specified
  const displayTemplates = filterCategory
    ? voiceAppTemplates.filter(t => t.category.toLowerCase() === filterCategory.toLowerCase())
    : voiceAppTemplates;

  // Group by category
  const categories = Array.from(new Set(displayTemplates.map(t => t.category)));

  // Preview voice sample
  const previewVoice = useCallback(async (template: typeof voiceAppTemplates[0]) => {
    if (!window.speechSynthesis) {
      toast({ title: 'Not Supported', description: 'Voice preview not available in this browser', variant: 'destructive' });
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(template.sampleScript);
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [isPlaying, toast]);

  // Use template
  const useTemplate = useCallback((template: typeof voiceAppTemplates[0]) => {
    // Store template data for BuilderIQ integration
    sessionStorage.setItem('voiceAppTemplate', JSON.stringify({
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      features: template.features,
      sampleScript: template.sampleScript,
      sampleVoice: template.sampleVoice,
    }));

    onSelectTemplate?.(template);

    // Navigate to BuilderIQ questionnaire with voice template context
    navigate(`/builderiq/questionnaire?voiceTemplate=${template.id}&category=${template.category.toLowerCase()}`);

    toast({
      title: `${template.name} Selected! 🎙️`,
      description: 'Starting voice app builder with this template...',
    });
  }, [navigate, onSelectTemplate, toast]);

  // Open preview modal
  const openPreview = (template: typeof voiceAppTemplates[0]) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <div className={showAsSidebar ? 'space-y-4' : 'space-y-8'}>
      {/* Header */}
      {!showAsSidebar && (
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30">
            <FileAudio className="w-3 h-3 mr-1" /> Voice-First Templates
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4">
            Voice App Blueprints & Templates
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Audio-first app templates with pre-generated voice content. Get both app structure AND voice samples in one go!
          </p>
        </div>
      )}

      {/* Featured Templates */}
      {!showAsSidebar && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Featured Voice Templates
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTemplates.filter(t => t.isFeatured).map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => openPreview(template)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                      </Badge>
                    </div>
                    <CardTitle className="text-white group-hover:text-cyan-300 transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} className="text-[10px] bg-slate-700/50 text-gray-300">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {template.estimatedBuild}
                      </span>
                      {template.price === 0 ? (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Free</Badge>
                      ) : (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          <Crown className="w-3 h-3 mr-1" /> ${template.price}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Templates by Category */}
      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">{category}</h3>
          <div className={`grid ${showAsSidebar ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {displayTemplates.filter(t => t.category === category && !t.isFeatured).map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group"
                  onClick={() => openPreview(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                            {template.name}
                          </h4>
                          {template.isPremium && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{template.complexity}</span>
                          <span>•</span>
                          <span>{template.estimatedBuild}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedTemplate.color} flex items-center justify-center`}>
                    <selectedTemplate.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedTemplate.name}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {selectedTemplate.category} • {selectedTemplate.complexity}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-gray-300">{selectedTemplate.description}</p>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.features.map((feature, i) => (
                      <Badge key={i} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Best For</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.useCases.map((useCase, i) => (
                      <Badge key={i} className="bg-slate-700 text-gray-300">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Voice Sample */}
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      Voice Sample
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => previewVoice(selectedTemplate)}
                      className={isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Listen
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-300 italic">"{selectedTemplate.sampleScript}"</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedTemplate.estimatedBuild}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {selectedTemplate.complexity}
                    </span>
                  </div>
                  {selectedTemplate.price === 0 ? (
                    <Badge className="bg-green-500/20 text-green-300 text-lg px-3">Free</Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-3">
                      ${selectedTemplate.price}
                    </Badge>
                  )}
                </div>
              </div>

              <DialogFooter className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-slate-600 text-gray-300"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    useTemplate(selectedTemplate);
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use This Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceAppTemplates;
