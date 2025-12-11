import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import useVoiceActivation from '@/hooks/useVoiceActivation';
import { useVoiceService } from '@/services/voiceService';
import BackButton from '@/components/BackButton';
import {
  Mic, MicOff, ArrowRight, ArrowLeft, Sparkles, Check,
  Monitor, Smartphone, Globe, Chrome, Laptop,
  Users, Building2, Briefcase, GraduationCap, Heart,
  Upload, BarChart3, Palette, Share2, Save, Mail,
  Lock, Key, CreditCard, Bot, Zap, Eye,
  Moon, Sun, Wand2, Building, Church, Rocket,
  Volume2, VolumeX, MessageSquare, HelpCircle
} from 'lucide-react';

// Questionnaire data structure
interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  voiceAliases?: string[]; // Words that can trigger this option via voice
}

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'text' | 'textarea' | 'scale' | 'color';
  title: string;
  subtitle?: string;
  description?: string;
  voicePrompt?: string; // What the voice says when asking this question
  voiceHelp?: string; // Help text read when user says "help"
  options?: QuestionOption[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  showIf?: (responses: Record<string, any>) => boolean;
}

// Complete questionnaire questions with voice prompts
const questions: Question[] = [
  // Q1: App Type
  {
    id: 'app_type',
    type: 'single',
    title: 'What type of app do you want to build?',
    subtitle: 'Choose your primary platform',
    voicePrompt: "Let's start with the basics. What type of app do you want to build? You can say: Web app, Mobile app, Both web and mobile, Chrome extension, or Desktop app.",
    voiceHelp: "This determines where your app will run. Web apps work in browsers, mobile apps on phones, and desktop apps on computers. Say 'both' if you want web and mobile.",
    required: true,
    options: [
      { value: 'web', label: 'Web App', description: 'Browser-based application', icon: <Globe className="w-5 h-5" />, voiceAliases: ['web', 'website', 'browser', 'web app', 'web application'] },
      { value: 'mobile', label: 'Mobile App', description: 'iOS & Android native', icon: <Smartphone className="w-5 h-5" />, voiceAliases: ['mobile', 'phone', 'ios', 'android', 'mobile app'] },
      { value: 'both', label: 'Both', description: 'Web + Mobile responsive', icon: <Monitor className="w-5 h-5" />, voiceAliases: ['both', 'web and mobile', 'all platforms', 'everywhere'] },
      { value: 'chrome', label: 'Chrome Extension', description: 'Browser extension', icon: <Chrome className="w-5 h-5" />, voiceAliases: ['chrome', 'extension', 'browser extension', 'chrome extension'] },
      { value: 'desktop', label: 'Desktop App', description: 'Windows, Mac, Linux', icon: <Laptop className="w-5 h-5" />, voiceAliases: ['desktop', 'windows', 'mac', 'linux', 'computer'] },
    ],
  },

  // Q2: Target Audience
  {
    id: 'target_audience',
    type: 'multiple',
    title: 'Who is your target audience?',
    subtitle: 'Select all that apply',
    voicePrompt: "Who will use your app? Tell me your target audience. You can say multiple options like: small business owners, students, healthcare professionals, or coaches. Say 'done' when you've listed them all.",
    voiceHelp: "Think about who will benefit most from your app. You can select multiple audiences. Some examples are: real estate investors, traders, creators, churches, or enterprise companies.",
    required: true,
    options: [
      { value: 'real_estate', label: 'Real Estate Investors', icon: <Building2 className="w-5 h-5" />, voiceAliases: ['real estate', 'property', 'investors', 'real estate investors'] },
      { value: 'small_business', label: 'Small Business Owners', icon: <Briefcase className="w-5 h-5" />, voiceAliases: ['small business', 'business owners', 'entrepreneurs', 'small business owners'] },
      { value: 'traders', label: 'Traders & Investors', icon: <BarChart3 className="w-5 h-5" />, voiceAliases: ['traders', 'investors', 'trading', 'stock traders'] },
      { value: 'students', label: 'Students', icon: <GraduationCap className="w-5 h-5" />, voiceAliases: ['students', 'learners', 'education', 'school'] },
      { value: 'creators', label: 'Creators & Artists', icon: <Palette className="w-5 h-5" />, voiceAliases: ['creators', 'artists', 'designers', 'content creators'] },
      { value: 'churches', label: 'Churches & Religious Orgs', icon: <Church className="w-5 h-5" />, voiceAliases: ['churches', 'religious', 'faith', 'ministry'] },
      { value: 'coaches', label: 'Coaches & Consultants', icon: <Users className="w-5 h-5" />, voiceAliases: ['coaches', 'consultants', 'trainers', 'mentors'] },
      { value: 'healthcare', label: 'Healthcare Professionals', icon: <Heart className="w-5 h-5" />, voiceAliases: ['healthcare', 'doctors', 'medical', 'health professionals'] },
      { value: 'enterprises', label: 'Enterprise Companies', icon: <Building className="w-5 h-5" />, voiceAliases: ['enterprise', 'corporations', 'large companies', 'big business'] },
      { value: 'startups', label: 'Startups', icon: <Rocket className="w-5 h-5" />, voiceAliases: ['startups', 'startup founders', 'new businesses'] },
    ],
  },

  // Q3: Main Purpose
  {
    id: 'main_purpose',
    type: 'textarea',
    title: 'What is the main purpose of your app?',
    subtitle: 'Describe in one clear sentence',
    description: 'Example: "Help real estate investors track property performance and analyze deals"',
    voicePrompt: "Now, describe the main purpose of your app in one sentence. For example: 'Help real estate investors track property performance'. Just speak naturally and describe what your app will do.",
    voiceHelp: "Try to be specific about who the app helps and what problem it solves. Start with 'Help' or 'Enable' followed by your target users and the main benefit.",
    required: true,
    placeholder: 'My app will help [target users] to [achieve goal] by [main functionality]...',
  },

  // Q4: Key Features
  {
    id: 'key_features',
    type: 'multiple',
    title: 'What key features should your app include?',
    subtitle: 'Select all features you need',
    voicePrompt: "What features do you want in your app? You can say things like: dashboard, analytics, messaging, calendar, or file storage. Say 'done' when you've listed all the features you want.",
    voiceHelp: "Features are the main capabilities of your app. Common ones include: user dashboard, admin panel, notifications, search, and social features. You can select as many as you need.",
    required: true,
    options: [
      { value: 'user_dashboard', label: 'User Dashboard', description: 'Central hub for users', voiceAliases: ['dashboard', 'user dashboard', 'home screen', 'main screen'] },
      { value: 'admin_panel', label: 'Admin Panel', description: 'Backend management', voiceAliases: ['admin', 'admin panel', 'administration', 'backend'] },
      { value: 'analytics', label: 'Analytics & Reports', description: 'Data visualization', voiceAliases: ['analytics', 'reports', 'charts', 'data', 'statistics'] },
      { value: 'notifications', label: 'Push Notifications', description: 'Real-time alerts', voiceAliases: ['notifications', 'alerts', 'push notifications', 'reminders'] },
      { value: 'messaging', label: 'In-App Messaging', description: 'User communication', voiceAliases: ['messaging', 'chat', 'messages', 'communication'] },
      { value: 'calendar', label: 'Calendar & Scheduling', description: 'Booking system', voiceAliases: ['calendar', 'scheduling', 'bookings', 'appointments'] },
      { value: 'file_storage', label: 'File Storage', description: 'Document management', voiceAliases: ['files', 'storage', 'documents', 'uploads', 'file storage'] },
      { value: 'search', label: 'Advanced Search', description: 'Filter & find', voiceAliases: ['search', 'filter', 'find', 'advanced search'] },
      { value: 'social', label: 'Social Features', description: 'Profiles, following', voiceAliases: ['social', 'profiles', 'following', 'social features', 'community'] },
      { value: 'marketplace', label: 'Marketplace', description: 'Buy/sell functionality', voiceAliases: ['marketplace', 'buy', 'sell', 'commerce', 'shop'] },
      { value: 'api', label: 'API Integration', description: 'Third-party connections', voiceAliases: ['api', 'integration', 'third party', 'connect'] },
      { value: 'offline', label: 'Offline Mode', description: 'Works without internet', voiceAliases: ['offline', 'offline mode', 'no internet'] },
    ],
  },

  // Q5: User Actions
  {
    id: 'user_actions',
    type: 'multiple',
    title: 'What actions should users be able to perform?',
    subtitle: 'Select all user interactions',
    voicePrompt: "What should users be able to do in your app? Say things like: upload files, view charts, share results, or save projects. Say 'done' when finished.",
    voiceHelp: "Think about the main tasks users will perform. Common actions include uploading files, entering data, viewing analytics, sharing content, and exporting reports.",
    required: true,
    options: [
      { value: 'upload_files', label: 'Upload Files', icon: <Upload className="w-4 h-4" />, voiceAliases: ['upload', 'upload files', 'add files'] },
      { value: 'enter_data', label: 'Enter Data / Forms', icon: <Briefcase className="w-4 h-4" />, voiceAliases: ['enter data', 'forms', 'input', 'data entry'] },
      { value: 'view_charts', label: 'View Charts & Graphs', icon: <BarChart3 className="w-4 h-4" />, voiceAliases: ['charts', 'graphs', 'view charts', 'visualizations'] },
      { value: 'generate_designs', label: 'Generate Designs / AI Content', icon: <Wand2 className="w-4 h-4" />, voiceAliases: ['generate', 'ai content', 'designs', 'create content'] },
      { value: 'share_results', label: 'Share Results', icon: <Share2 className="w-4 h-4" />, voiceAliases: ['share', 'share results', 'sharing'] },
      { value: 'save_projects', label: 'Save Projects', icon: <Save className="w-4 h-4" />, voiceAliases: ['save', 'save projects', 'projects'] },
      { value: 'email_outputs', label: 'Email Outputs', icon: <Mail className="w-4 h-4" />, voiceAliases: ['email', 'email outputs', 'send email'] },
      { value: 'export_data', label: 'Export Data (PDF, CSV)', icon: <Briefcase className="w-4 h-4" />, voiceAliases: ['export', 'pdf', 'csv', 'download'] },
      { value: 'collaborate', label: 'Collaborate with Team', icon: <Users className="w-4 h-4" />, voiceAliases: ['collaborate', 'team', 'teamwork', 'collaboration'] },
      { value: 'customize', label: 'Customize Settings', icon: <Palette className="w-4 h-4" />, voiceAliases: ['customize', 'settings', 'preferences'] },
    ],
  },

  // Q6: Authentication
  {
    id: 'authentication',
    type: 'single',
    title: 'Does your app require authentication?',
    subtitle: 'How should users log in?',
    voicePrompt: "How should users log into your app? Say: no authentication for public access, basic login for email and password, OAuth for Google and Apple sign-in, or subscription for paid access tiers.",
    voiceHelp: "Authentication controls who can access your app. No authentication means anyone can use it. Basic login uses email and password. OAuth allows sign-in with Google or Apple. Subscription-based adds paid tiers.",
    required: true,
    options: [
      { value: 'none', label: 'No Authentication', description: 'Public access only', icon: <Globe className="w-5 h-5" />, voiceAliases: ['none', 'no', 'no authentication', 'public', 'no login'] },
      { value: 'basic', label: 'Basic Login', description: 'Email & password', icon: <Lock className="w-5 h-5" />, voiceAliases: ['basic', 'basic login', 'email', 'password', 'email and password'] },
      { value: 'oauth', label: 'OAuth', description: 'Google, Apple, GitHub', icon: <Key className="w-5 h-5" />, voiceAliases: ['oauth', 'google', 'apple', 'social login', 'google sign in'] },
      { value: 'subscription', label: 'Subscription-Based', description: 'Paid access tiers', icon: <CreditCard className="w-5 h-5" />, voiceAliases: ['subscription', 'paid', 'tiers', 'subscription based'] },
    ],
  },

  // Q7: AI Content
  {
    id: 'ai_content',
    type: 'single',
    title: 'Will your app generate content or analysis?',
    subtitle: 'Does it need AI capabilities?',
    voicePrompt: "Will your app use AI to generate content or analyze data? Say 'yes' for AI features, or 'no' for manual user input only.",
    voiceHelp: "AI features can generate text, images, recommendations, or analyze data automatically. If your app only displays what users enter, you don't need AI.",
    required: true,
    options: [
      { value: 'yes', label: 'Yes - AI Required', description: 'Generate content, analyze data, or provide recommendations', icon: <Bot className="w-5 h-5" />, voiceAliases: ['yes', 'ai', 'artificial intelligence', 'generate', 'ai required'] },
      { value: 'no', label: 'No - Manual Input', description: 'Users enter and manage their own data', icon: <Users className="w-5 h-5" />, voiceAliases: ['no', 'manual', 'no ai', 'manual input'] },
    ],
  },

  // Q7b: AI Features (conditional)
  {
    id: 'ai_features',
    type: 'multiple',
    title: 'What AI features do you need?',
    subtitle: 'Select all AI capabilities',
    voicePrompt: "What AI features do you want? You can say: text generation, image generation, data analysis, recommendations, chatbot, translation, or voice features. Say 'done' when finished.",
    voiceHelp: "Text generation creates written content. Image generation creates visuals. Data analysis provides insights. Recommendations personalize the experience. Chatbot handles customer support.",
    showIf: (responses) => responses.ai_content === 'yes',
    options: [
      { value: 'text_generation', label: 'Text Generation', description: 'Articles, descriptions, copy', voiceAliases: ['text', 'text generation', 'writing', 'content'] },
      { value: 'image_generation', label: 'Image Generation', description: 'AI-created visuals', voiceAliases: ['image', 'images', 'image generation', 'pictures', 'visuals'] },
      { value: 'data_analysis', label: 'Data Analysis', description: 'Insights from data', voiceAliases: ['data analysis', 'analysis', 'insights', 'analyze'] },
      { value: 'recommendations', label: 'Recommendations', description: 'Personalized suggestions', voiceAliases: ['recommendations', 'suggestions', 'personalization'] },
      { value: 'chatbot', label: 'AI Chatbot', description: 'Customer support bot', voiceAliases: ['chatbot', 'chat bot', 'support bot', 'assistant'] },
      { value: 'translation', label: 'Translation', description: 'Multi-language support', voiceAliases: ['translation', 'translate', 'languages', 'multilingual'] },
      { value: 'voice', label: 'Voice Features', description: 'Speech-to-text, text-to-speech', voiceAliases: ['voice', 'speech', 'voice features', 'text to speech'] },
    ],
  },

  // Q8: Payments
  {
    id: 'payments',
    type: 'single',
    title: 'Do you want the app to include payments?',
    subtitle: 'How will you monetize?',
    voicePrompt: "How will your app handle payments? Say: one-time payments, subscriptions, both, or no payments.",
    voiceHelp: "One-time payments are for single purchases. Subscriptions are recurring monthly or yearly billing. You can have both, or no payments if the app is free.",
    required: true,
    options: [
      { value: 'stripe_onetime', label: 'Stripe One-Time', description: 'Single purchases', icon: <CreditCard className="w-5 h-5" />, voiceAliases: ['one time', 'one-time', 'single', 'one time payments'] },
      { value: 'stripe_subscription', label: 'Stripe Subscriptions', description: 'Recurring billing', icon: <Zap className="w-5 h-5" />, voiceAliases: ['subscription', 'subscriptions', 'recurring', 'monthly'] },
      { value: 'both', label: 'Both', description: 'One-time + subscriptions', voiceAliases: ['both', 'both payments', 'one time and subscriptions'] },
      { value: 'none', label: 'No Payments', description: 'Free app or external billing', voiceAliases: ['none', 'no', 'no payments', 'free'] },
    ],
  },

  // Q9: Design Style
  {
    id: 'design_style',
    type: 'single',
    title: 'What is your preferred design style?',
    subtitle: 'Choose the overall aesthetic',
    voicePrompt: "What design style do you prefer? Say: minimal, professional, playful, corporate, spiritual, or futuristic.",
    voiceHelp: "Minimal is clean and simple. Professional is business-focused. Playful is fun and colorful. Corporate is formal. Spiritual is calm and inspiring. Futuristic is modern and tech-forward.",
    required: true,
    options: [
      { value: 'minimal', label: 'Minimal', description: 'Clean, simple, lots of whitespace', voiceAliases: ['minimal', 'minimalist', 'clean', 'simple'] },
      { value: 'professional', label: 'Professional', description: 'Business-focused, trustworthy', voiceAliases: ['professional', 'business', 'trustworthy'] },
      { value: 'playful', label: 'Playful', description: 'Fun, colorful, engaging', voiceAliases: ['playful', 'fun', 'colorful', 'engaging'] },
      { value: 'corporate', label: 'Corporate', description: 'Enterprise, formal, structured', voiceAliases: ['corporate', 'enterprise', 'formal'] },
      { value: 'spiritual', label: 'Spiritual', description: 'Calm, peaceful, inspiring', voiceAliases: ['spiritual', 'calm', 'peaceful', 'zen'] },
      { value: 'futuristic', label: 'Futuristic', description: 'Modern, tech-forward, innovative', voiceAliases: ['futuristic', 'modern', 'tech', 'innovative'] },
    ],
  },

  // Q10: Color Scheme
  {
    id: 'color_scheme',
    type: 'single',
    title: 'What colors should the app use?',
    subtitle: 'Choose your color palette',
    voicePrompt: "What color scheme do you want? Say: purple and blue, light theme, dark theme, or custom for your own brand colors.",
    voiceHelp: "Purple and blue is a modern tech aesthetic. Light theme uses white backgrounds. Dark theme uses dark backgrounds. Custom lets you specify your brand colors.",
    required: true,
    options: [
      { value: 'purple_black_blue', label: 'Purple / Black / Blue', description: 'Modern tech aesthetic', voiceAliases: ['purple', 'blue', 'purple and blue', 'tech'] },
      { value: 'light', label: 'Light Theme', description: 'Clean whites and grays', voiceAliases: ['light', 'light theme', 'white', 'bright'] },
      { value: 'dark', label: 'Dark Theme', description: 'Dark mode focused', voiceAliases: ['dark', 'dark theme', 'dark mode', 'night'] },
      { value: 'custom', label: 'Custom Brand Colors', description: 'I have specific brand colors', voiceAliases: ['custom', 'brand', 'my colors', 'custom colors'] },
    ],
  },

  // Q10b: Custom colors (conditional)
  {
    id: 'custom_colors',
    type: 'text',
    title: 'Enter your brand colors',
    subtitle: 'Provide hex codes or color names',
    voicePrompt: "What are your brand colors? You can say color names like 'navy blue and coral' or hex codes.",
    voiceHelp: "Describe your brand colors using names like red, blue, coral, or navy. You can also use hex codes like hashtag F F 6 B 0 0.",
    placeholder: 'e.g., #FF6B00, Navy Blue, Coral',
    showIf: (responses) => responses.color_scheme === 'custom',
  },

  // Q11: Marketing Materials
  {
    id: 'marketing_materials',
    type: 'multiple',
    title: 'Should BuilderIQ generate marketing materials?',
    subtitle: 'We can create these for you',
    voicePrompt: "Do you want marketing materials generated? Say: homepage copy, app store description, blog post, social media posts, or brand kit. Say 'skip' if you don't need any, or 'done' when finished.",
    voiceHelp: "We can generate marketing copy for your homepage, app store listing, SEO blog post, social media, and even logo suggestions. These help you launch faster.",
    options: [
      { value: 'homepage_copy', label: 'Homepage Copy', description: 'Hero text, features, CTAs', voiceAliases: ['homepage', 'homepage copy', 'landing page', 'website copy'] },
      { value: 'app_store', label: 'App Store Description', description: 'iOS/Android listing text', voiceAliases: ['app store', 'app store description', 'store listing'] },
      { value: 'seo_blog', label: 'SEO Blog Post', description: 'Launch announcement article', voiceAliases: ['blog', 'seo', 'blog post', 'article'] },
      { value: 'social_posts', label: 'Social Media Posts', description: 'Twitter, LinkedIn, Instagram', voiceAliases: ['social', 'social media', 'twitter', 'linkedin', 'instagram'] },
      { value: 'brand_kit', label: 'Logo + Brand Kit', description: 'Logo suggestions, brand guidelines', voiceAliases: ['brand kit', 'logo', 'branding', 'brand guidelines'] },
    ],
  },

  // Q12: App Name
  {
    id: 'app_name',
    type: 'text',
    title: 'What would you like to call your app?',
    subtitle: 'Enter a name or leave blank for suggestions',
    voicePrompt: "What do you want to call your app? Just say the name, or say 'skip' and I'll suggest some names based on your answers.",
    voiceHelp: "Choose a memorable name that reflects your app's purpose. Keep it short and easy to spell. Say 'skip' to get AI-generated name suggestions.",
    placeholder: 'e.g., PropertyPro, FitTrack, LearnHub...',
  },

  // Q13: Complexity
  {
    id: 'complexity',
    type: 'single',
    title: 'What level of complexity do you need?',
    subtitle: 'Be realistic about your resources',
    voicePrompt: "Finally, what complexity level do you need? Say: M V P for a quick launch, standard for core features, complex for advanced features, or enterprise for full scale.",
    voiceHelp: "MVP is the minimum viable product - just the core feature to validate your idea. Standard includes all essential features. Complex adds advanced functionality. Enterprise is full-scale with everything.",
    required: true,
    options: [
      { value: 'mvp', label: 'MVP / Micro-Launch', description: '1 killer feature, validate fast', voiceAliases: ['mvp', 'minimum', 'micro', 'quick', 'simple'] },
      { value: 'standard', label: 'Standard App', description: 'Core features, ready for users', voiceAliases: ['standard', 'normal', 'regular', 'core'] },
      { value: 'complex', label: 'Complex App', description: 'Advanced features, multiple user types', voiceAliases: ['complex', 'advanced', 'multiple'] },
      { value: 'enterprise', label: 'Enterprise', description: 'Full-scale, all features, scalable', voiceAliases: ['enterprise', 'full', 'full scale', 'everything'] },
    ],
  },
];

const BuilderIQQuestionnaire: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Get URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const initialIndustry = searchParams.get('industry');
  const initialMood = searchParams.get('mood');

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [voiceModeReady, setVoiceModeReady] = useState(false); // Track when voice mode is fully ready

  // Refs for voice control
  const hasAskedRef = useRef(false);
  const voicesLoadedRef = useRef(false);
  const voiceModeJustActivated = useRef(false); // Track fresh voice mode activation

  // Preload voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices();
      if (voices && voices.length > 0) {
        voicesLoadedRef.current = true;
        console.log('🎙️ Voices loaded:', voices.length);
      }
    };

    // Load voices immediately and on change
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Some browsers need a small delay
      setTimeout(loadVoices, 100);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Filter questions based on conditional logic
  const visibleQuestions = questions.filter(q =>
    !q.showIf || q.showIf(responses)
  );

  const currentQuestion = visibleQuestions[currentIndex];
  const progress = ((currentIndex + 1) / visibleQuestions.length) * 100;

  // Unified voice service for consistent voice across app
  const voiceService = useVoiceService('enthusiastic');

  // Voice activation for speech recognition
  const voice = useVoiceActivation({
    wakeWord: '',  // No wake word needed in questionnaire
    continuous: true,
    speakResponses: false, // We'll use voiceService instead
    voicePersonality: 'friendly',
    onTranscript: (transcript) => {
      // Only process if voice mode is ready and not currently speaking
      if (voiceModeReady && !voiceService.isSpeaking) {
        handleVoiceInput(transcript);
      }
    },
    onCommand: (command) => {
      // Only handle commands if voice mode is ready and not speaking
      if (!voiceModeReady || voiceService.isSpeaking) return;
      if (command === 'next') goNext();
      if (command === 'back') goPrevious();
      if (command === 'help') readHelp();
    },
    onListeningChange: (isListening) => {
      console.log('🎤 Listening changed:', isListening, 'voiceMode:', voiceMode);
    },
  });

  // Ask the current question via unified voice service
  const askCurrentQuestion = useCallback(() => {
    if (!currentQuestion) {
      console.log('🎤 No current question to ask');
      return;
    }

    if (isAskingQuestion) {
      console.log('🎤 Already asking a question, skipping');
      return;
    }

    const prompt = currentQuestion.voicePrompt || currentQuestion.title;
    console.log('🎤 Asking question:', prompt);

    // Stop listening while speaking to prevent hearing ourselves
    if (voice.isListening) {
      console.log('🎤 Pausing listening while speaking...');
      voice.stopListening();
    }

    setIsAskingQuestion(true);

    // Use voice service if ready, otherwise use fallback
    if (voiceService.isReady) {
      voiceService.speak(prompt, {
        personality: 'enthusiastic',
        onStart: () => {
          console.log('🔊 Speech started');
        },
        onEnd: () => {
          console.log('🔊 Speech ended, resuming listening...');
          setIsAskingQuestion(false);
          // Resume listening after speaking finishes
          if (voiceMode) {
            setTimeout(() => {
              console.log('🎤 Starting listening after question...');
              voice.startListening();
            }, 300);
          }
        },
        onError: (e) => {
          console.error('Speech error:', e);
          setIsAskingQuestion(false);
          // Try to resume listening even after error
          if (voiceMode) {
            setTimeout(() => voice.startListening(), 300);
          }
        },
      });
    } else {
      // Fallback to direct speech synthesis if service not ready
      console.log('🔊 Using fallback speech synthesis');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(prompt);
        utterance.rate = 1.1;
        utterance.pitch = 1.15;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
          v.name.includes('Google') && v.lang.startsWith('en')
        ) || voices.find(v =>
          v.name.includes('Microsoft') && v.lang.startsWith('en')
        ) || voices[0];

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
          console.log('🔊 Fallback speech ended');
          setIsAskingQuestion(false);
          // Resume listening after speaking
          if (voiceMode) {
            setTimeout(() => voice.startListening(), 300);
          }
        };
        utterance.onerror = () => {
          console.error('🔊 Fallback speech error');
          setIsAskingQuestion(false);
          if (voiceMode) {
            setTimeout(() => voice.startListening(), 300);
          }
        };

        window.speechSynthesis.speak(utterance);
      } else {
        console.error('Speech synthesis not supported');
        setIsAskingQuestion(false);
        // Still try to start listening
        if (voiceMode) {
          voice.startListening();
        }
      }
    }
  }, [currentQuestion, isAskingQuestion, voiceMode, voice, voiceService]);

  // Read help text using unified voice service
  const readHelp = useCallback(() => {
    if (currentQuestion?.voiceHelp) {
      // Stop listening while speaking help
      if (voice.isListening) {
        voice.stopListening();
      }

      voiceService.speak(currentQuestion.voiceHelp, {
        personality: 'teacher',
        onEnd: () => {
          // Resume listening after help is read
          if (voiceMode) {
            setTimeout(() => voice.startListening(), 300);
          }
        },
        onError: () => {
          if (voiceMode) {
            setTimeout(() => voice.startListening(), 300);
          }
        }
      });
    }
  }, [currentQuestion, voiceService, voiceMode, voice]);

  // Anti-repeat: Track last processed transcript to avoid duplicates
  const lastProcessedTranscript = useRef<string>('');
  const lastProcessedTime = useRef<number>(0);

  // Helper to speak feedback with proper listening pause/resume
  const speakFeedback = useCallback((text: string, personality: 'enthusiastic' | 'friendly' | 'teacher' = 'enthusiastic', afterCallback?: () => void) => {
    // Stop listening while speaking
    if (voice.isListening) {
      voice.stopListening();
    }

    voiceService.speak(text, {
      personality,
      onEnd: () => {
        // Execute callback if provided
        afterCallback?.();
        // Resume listening after speaking (unless callback handled it)
        if (voiceMode && !afterCallback) {
          setTimeout(() => voice.startListening(), 300);
        }
      },
      onError: () => {
        afterCallback?.();
        if (voiceMode && !afterCallback) {
          setTimeout(() => voice.startListening(), 300);
        }
      }
    });
  }, [voice, voiceService, voiceMode]);

  // Process voice input with smart responses
  const handleVoiceInput = useCallback((transcript: string) => {
    const lower = transcript.toLowerCase().trim();
    const now = Date.now();

    // Anti-repeat: Skip if same transcript within 2 seconds
    if (lower === lastProcessedTranscript.current && now - lastProcessedTime.current < 2000) {
      console.log('🎤 Skipping duplicate transcript:', lower);
      return;
    }

    // Anti-repeat: Skip very short or empty transcripts
    if (lower.length < 2) {
      return;
    }

    lastProcessedTranscript.current = lower;
    lastProcessedTime.current = now;
    console.log('🎤 Processing voice input:', lower);

    // ========== GREETING & CONVERSATIONAL COMMANDS ==========

    // "Hello SmartPrompt" - Friendly greeting with app building context
    if (lower.includes('hello smart') || lower.includes('hey smart') || lower.includes('hi smart') ||
        lower.includes('hello prompt') || lower.includes('hey prompt') || lower.includes('hi prompt')) {
      speakFeedback(
        "Hey there! I'm SmartPrompt, your AI app building assistant! " +
        "What kind of app would you like to build today? You can say things like " +
        "'I want to build a shopping app' or 'help me create a booking system'. Let's make something amazing!",
        'enthusiastic'
      );
      return;
    }

    // "What can you do?" / "What can you help with?"
    if (lower.includes('what can you') || lower.includes('what do you do') || lower.includes('how can you help')) {
      speakFeedback(
        "I can help you build any kind of app! Just tell me what you're thinking. " +
        "For example: e-commerce stores, booking systems, dashboards, social platforms, " +
        "portfolio sites, SaaS products, mobile apps, and much more. " +
        "What's your idea?",
        'friendly'
      );
      return;
    }

    // "I want to build..." / "Help me create..." / "Make me a..."
    if (lower.includes('i want to build') || lower.includes('help me create') || lower.includes('make me a') ||
        lower.includes('i need a') || lower.includes('build me a') || lower.includes('create a')) {
      // Extract what they want to build
      const buildMatch = lower.match(/(?:build|create|make|need)\s+(?:a\s+)?(.+)/);
      const appIdea = buildMatch ? buildMatch[1] : 'your app';
      speakFeedback(
        `Awesome! ${appIdea.charAt(0).toUpperCase() + appIdea.slice(1)} sounds exciting! ` +
        "Let me ask you a few questions to understand exactly what you need. " +
        "This will only take a couple of minutes, and then I'll generate a complete blueprint for you!",
        'enthusiastic'
      );
      // Ask the first question after greeting
      setTimeout(() => askCurrentQuestion(), 2500);
      return;
    }

    // "Thank you" / "Thanks"
    if (lower.includes('thank you') || lower.includes('thanks')) {
      speakFeedback(
        "You're welcome! I'm here to help you build something amazing. Let's keep going!",
        'friendly'
      );
      return;
    }

    // "Good job" / "Great" / "Perfect" / "Awesome"
    if (lower.includes('good job') || lower.includes('great') || lower.includes('perfect') ||
        lower.includes('awesome') || lower.includes('excellent') || lower.includes('nice')) {
      speakFeedback(
        "Thanks! I love your energy! Let's keep building!",
        'enthusiastic'
      );
      return;
    }

    // "Stop" / "Pause" / "Wait"
    if (lower === 'stop' || lower === 'pause' || lower === 'wait' || lower.includes('hold on')) {
      voiceService.stop();
      speakFeedback("Okay, I'll wait. Say 'continue' when you're ready!", 'friendly');
      return;
    }

    // "Start over" / "Reset"
    if (lower.includes('start over') || lower.includes('reset') || lower.includes('begin again')) {
      speakFeedback(
        "No problem! Let's start fresh. I'll take you back to the first question.",
        'friendly',
        () => setCurrentIndex(0)
      );
      return;
    }

    // "How long will this take?"
    if (lower.includes('how long') || lower.includes('how many questions')) {
      const remaining = visibleQuestions.length - currentIndex;
      speakFeedback(
        `You're doing great! There are ${remaining} questions left. ` +
        "Most people finish in about 2 to 3 minutes. Let's keep going!",
        'friendly'
      );
      return;
    }

    // ========== NAVIGATION COMMANDS ==========

    if (lower.includes('next') || lower.includes('continue') || lower.includes('proceed') || lower.includes('move on')) {
      goNext();
      return;
    }
    if (lower.includes('back') || lower.includes('previous') || lower.includes('go back')) {
      goPrevious();
      return;
    }
    if (lower.includes('help') || lower.includes('what are my options') || lower.includes('options')) {
      readHelp();
      return;
    }
    if (lower.includes('skip') || lower.includes('skip this')) {
      if (!currentQuestion.required) {
        speakFeedback("Skipping this question!", 'enthusiastic', () => goNext());
      } else {
        speakFeedback("This question is required, but I can help! " + (currentQuestion.voiceHelp || "What would you like to answer?"), 'friendly');
      }
      return;
    }
    if (lower.includes('done') || lower.includes('that\'s all') || lower.includes('finished') || lower.includes("that's it")) {
      if (currentQuestion.type === 'multiple') {
        const selected = responses[currentQuestion.id] || [];
        if (selected.length > 0) {
          speakFeedback(`Perfect! You selected ${selected.length} options. Moving on!`, 'enthusiastic', () => goNext());
        } else {
          speakFeedback("You haven't selected anything yet. What would you like to choose?", 'friendly');
        }
      } else {
        // Treat as "next" for non-multiple questions
        goNext();
      }
      return;
    }
    if (lower.includes('repeat') || lower.includes('say again') || lower.includes('what was the question') || lower.includes('say that again')) {
      askCurrentQuestion();
      return;
    }

    // ========== ANSWER PROCESSING ==========

    if (currentQuestion.type === 'single' && currentQuestion.options) {
      // Try to match voice input to an option
      for (const option of currentQuestion.options) {
        const aliases = option.voiceAliases || [option.value, option.label.toLowerCase()];
        for (const alias of aliases) {
          if (lower.includes(alias.toLowerCase())) {
            handleSingleSelect(option.value);
            speakFeedback(`${option.label}! Great choice. Say 'next' to continue!`, 'enthusiastic');
            return;
          }
        }
      }
      // No match found - be helpful
      const optionNames = currentQuestion.options.slice(0, 3).map(o => o.label).join(', ');
      speakFeedback(
        `I didn't quite catch that. You can say options like: ${optionNames}. Or say 'help' for all options!`,
        'friendly'
      );
    } else if (currentQuestion.type === 'multiple' && currentQuestion.options) {
      let matched = false;
      let matchedOptions: string[] = [];
      const currentSelections = [...(responses[currentQuestion.id] || [])];

      for (const option of currentQuestion.options) {
        const aliases = option.voiceAliases || [option.value, option.label.toLowerCase()];
        for (const alias of aliases) {
          if (lower.includes(alias.toLowerCase())) {
            if (!currentSelections.includes(option.value)) {
              currentSelections.push(option.value);
              matchedOptions.push(option.label);
              matched = true;
            }
          }
        }
      }

      if (matched) {
        setResponses(prev => ({ ...prev, [currentQuestion.id]: currentSelections }));
        const feedbackText = matchedOptions.length > 1
          ? `Added ${matchedOptions.join(' and ')}!`
          : `${matchedOptions[0]} added!`;
        speakFeedback(feedbackText + " Say more options or 'done' when finished!", 'enthusiastic');
      } else if (!lower.includes('done')) {
        const optionNames = currentQuestion.options.slice(0, 3).map(o => o.label).join(', ');
        speakFeedback(
          `Hmm, I didn't recognize that. Try saying: ${optionNames}. Or say 'help' for all options!`,
          'friendly'
        );
      }
    } else if (currentQuestion.type === 'text' || currentQuestion.type === 'textarea') {
      // For text questions - clean up the transcript before saving
      const cleanTranscript = transcript.trim();
      if (cleanTranscript.length > 0) {
        const currentValue = responses[currentQuestion.id] || '';
        const newValue = currentValue ? `${currentValue} ${cleanTranscript}` : cleanTranscript;
        setResponses(prev => ({ ...prev, [currentQuestion.id]: newValue }));
        speakFeedback("Got it! Keep talking to add more, or say 'next' when done!", 'enthusiastic');
      }
    }
  }, [currentQuestion, responses, speakFeedback, askCurrentQuestion, readHelp, visibleQuestions.length, currentIndex, voiceService]);

  // Auto-ask question when question changes (NOT when voice mode toggles - that's handled in toggleVoiceMode)
  useEffect(() => {
    // Only auto-ask if:
    // 1. Voice mode is active and ready
    // 2. We haven't just activated voice mode (that's handled in toggleVoiceMode)
    // 3. We haven't already asked this question
    if (voiceMode && voiceModeReady && currentQuestion && !hasAskedRef.current && !voiceModeJustActivated.current) {
      console.log('🎤 Auto-asking question on question change');
      hasAskedRef.current = true;
      // Small delay to let the page render
      const timer = setTimeout(() => {
        askCurrentQuestion();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, voiceModeReady]);

  // Reset the asked flag when question changes
  useEffect(() => {
    hasAskedRef.current = false;
    voiceModeJustActivated.current = false; // Reset after first question change
  }, [currentIndex]);

  // Toggle voice mode
  const toggleVoiceMode = async () => {
    if (!voiceMode) {
      console.log('🎤 Activating voice mode...');
      setVoiceMode(true);
      setVoiceModeReady(false);
      voiceModeJustActivated.current = true;
      hasAskedRef.current = false;

      // Force initialize voice service (unlocks audio on user gesture)
      voiceService.forceInit();

      // Speak activation message (this also serves as user gesture for audio)
      voiceService.speak("Yes! Voice mode activated! I'm so excited to guide you through each question. Let's build something amazing!", {
        personality: 'enthusiastic',
        onEnd: () => {
          console.log('🎤 Activation speech complete, now asking question...');
          setVoiceModeReady(true);
          // Now ask the first question and start listening
          setTimeout(() => {
            askCurrentQuestion();
          }, 200);
        },
        onError: () => {
          console.log('🎤 Activation speech error, trying to continue...');
          setVoiceModeReady(true);
          // Still try to ask question
          setTimeout(() => {
            askCurrentQuestion();
          }, 200);
        }
      });
    } else {
      console.log('🎤 Deactivating voice mode...');
      setVoiceMode(false);
      setVoiceModeReady(false);
      voiceModeJustActivated.current = false;
      hasAskedRef.current = false;

      // Stop listening first
      voice.stopListening();

      // Cancel any ongoing speech
      voiceService.stop();

      // Say goodbye
      voiceService.speak("Voice mode deactivated. You can continue typing your answers. Talk to you later!", { personality: 'friendly' });
    }
  };

  // Handle response changes
  const handleSingleSelect = (value: string) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleMultiSelect = (value: string, checked: boolean) => {
    setResponses(prev => {
      const current = prev[currentQuestion.id] || [];
      if (checked) {
        return { ...prev, [currentQuestion.id]: [...current, value] };
      } else {
        return { ...prev, [currentQuestion.id]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const handleTextChange = (value: string) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  // Navigation
  const canGoNext = useCallback(() => {
    if (!currentQuestion?.required) return true;
    const value = responses[currentQuestion.id];
    if (currentQuestion.type === 'multiple') {
      return Array.isArray(value) && value.length > 0;
    }
    return !!value;
  }, [currentQuestion, responses]);

  const goNext = useCallback(() => {
    if (!canGoNext()) {
      const message = 'Please answer this question before continuing';
      toast({
        title: 'Required',
        description: message,
        variant: 'destructive',
      });
      if (voiceMode) {
        speakFeedback(message, 'friendly');
      }
      return;
    }

    if (currentIndex < visibleQuestions.length - 1) {
      // Stop listening before transition
      if (voice.isListening) {
        voice.stopListening();
      }
      voiceService.stop(); // Cancel any ongoing speech

      hasAskedRef.current = false; // Reset so auto-ask can work
      setCurrentIndex(currentIndex + 1);
      // The auto-ask useEffect will handle asking the next question
    } else {
      handleComplete();
    }
  }, [currentIndex, visibleQuestions.length, voiceMode, voice, voiceService, speakFeedback, toast, canGoNext]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      // Stop listening before transition
      if (voice.isListening) {
        voice.stopListening();
      }
      voiceService.stop(); // Cancel any ongoing speech

      hasAskedRef.current = false; // Reset so auto-ask can work
      setCurrentIndex(currentIndex - 1);
      // The auto-ask useEffect will handle asking the previous question
    }
  }, [currentIndex, voice, voiceService]);

  const handleComplete = async () => {
    setIsGenerating(true);

    if (voiceMode) {
      voiceService.speak("Excellent! I have all the information I need! Generating your app blueprint now. This is going to be amazing!", { personality: 'enthusiastic' });
    }

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Store responses and navigate to blueprint
    localStorage.setItem('builderiq_responses', JSON.stringify(responses));
    navigate('/builderiq/blueprint');
  };

  // Render question content based on type
  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'single':
        return (
          <RadioGroup
            value={responses[currentQuestion.id] || ''}
            onValueChange={handleSingleSelect}
            className="grid gap-3"
          >
            {currentQuestion.options?.map((option, index) => (
              <label
                key={option.value}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  responses[currentQuestion.id] === option.value
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
              >
                <RadioGroupItem value={option.value} className="border-slate-500" />
                <span className="text-sm text-gray-500 font-mono w-6">{index + 1}</span>
                {option.icon && (
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-purple-400">
                    {option.icon}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-white">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-400">{option.description}</div>
                  )}
                </div>
                {responses[currentQuestion.id] === option.value && (
                  <Check className="w-5 h-5 text-purple-400" />
                )}
              </label>
            ))}
          </RadioGroup>
        );

      case 'multiple':
        return (
          <div className="grid gap-3 md:grid-cols-2">
            {currentQuestion.options?.map((option, index) => {
              const isChecked = (responses[currentQuestion.id] || []).includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isChecked
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleMultiSelect(option.value, checked as boolean)}
                    className="border-slate-500"
                  />
                  <span className="text-xs text-gray-500 font-mono w-4">{index + 1}</span>
                  {option.icon && (
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-purple-400">
                      {option.icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-white">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-400">{option.description}</div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <div className="relative">
            <Input
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="py-6 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 text-lg pr-12"
            />
            <button
              onClick={() => voiceMode ? voice.stopListening() : voice.startListening()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                voice.isListening ? 'bg-red-500' : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {voice.isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
            </button>
          </div>
        );

      case 'textarea':
        return (
          <div className="relative">
            <Textarea
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 pr-12"
            />
            <button
              onClick={() => voiceMode ? voice.stopListening() : voice.startListening()}
              className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${
                voice.isListening ? 'bg-red-500' : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {voice.isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/30" />
            <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-purple-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Generating Your Blueprint</h2>
          <p className="text-gray-400">BuilderIQ is analyzing your requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <BackButton />

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Question {currentIndex + 1} of {visibleQuestions.length}
                </Badge>
                {voiceMode && (
                  <Badge className={`border transition-all duration-300 ${
                    voiceService.isSpeaking
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : voice.isListening
                        ? 'bg-green-500/20 text-green-300 border-green-500/30 animate-pulse'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}>
                    {voiceService.isSpeaking ? (
                      <><Volume2 className="w-3 h-3 mr-1" /> Speaking</>
                    ) : voice.isListening ? (
                      <><Mic className="w-3 h-3 mr-1" /> Listening</>
                    ) : (
                      <><Mic className="w-3 h-3 mr-1" /> Voice Ready</>
                    )}
                  </Badge>
                )}
              </div>
              <Progress value={progress} className="h-2 bg-slate-800" />
            </div>

            {/* Voice Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Voice Mode</span>
              <Switch
                checked={voiceMode}
                onCheckedChange={toggleVoiceMode}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Voice Status - Enhanced with speaking/listening indicators */}
        {voiceMode && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
            voiceService.isSpeaking
              ? 'bg-blue-500/20 border-blue-500/30'
              : voice.isListening
                ? 'bg-purple-500/20 border-purple-500/30'
                : 'bg-slate-800/50 border-slate-700'
          }`}>
            <div className="flex items-center gap-3">
              {/* Animated Voice Visualizer */}
              <div className="flex items-end gap-0.5 h-8 min-w-[40px]">
                {voiceService.isSpeaking ? (
                  // Speaking animation (sound wave)
                  [...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-blue-400 rounded-full transition-all"
                      style={{
                        height: `${12 + Math.sin((Date.now() / 200) + i) * 12}px`,
                        animation: 'pulse 0.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))
                ) : voice.isListening ? (
                  // Listening animation (microphone waves)
                  [...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-purple-400 rounded-full animate-pulse"
                      style={{
                        height: `${8 + (voice.audioLevel * 24) + Math.random() * 8}px`,
                        animationDelay: `${i * 0.08}s`
                      }}
                    />
                  ))
                ) : (
                  // Idle state
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-2 bg-slate-600 rounded-full" />
                  ))
                )}
              </div>

              {/* Status Text */}
              <div className="flex-1">
                {voiceService.isSpeaking ? (
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-blue-300 font-medium">BuilderIQ is speaking...</span>
                  </div>
                ) : voice.isListening ? (
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-purple-300">
                      {voice.interimTranscript || "Listening... Speak your answer"}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Voice mode ready - waiting to start</span>
                )}
              </div>

              {/* Confidence indicator when listening */}
              {voice.isListening && voice.confidence > 0 && (
                <div className="flex items-center gap-1 text-xs text-purple-400">
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-200"
                      style={{ width: `${voice.confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(voice.confidence * 100)}%</span>
                </div>
              )}
            </div>

            {/* Show last recognized text */}
            {voice.transcript && !voiceService.isSpeaking && (
              <div className="mt-3 p-3 bg-slate-800/70 rounded-lg border border-slate-700">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">You said:</span>
                    <p className="text-white text-sm leading-relaxed">"{voice.transcript.slice(-150)}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentQuestion.title}
                  </h2>
                  {currentQuestion.subtitle && (
                    <p className="text-gray-400">{currentQuestion.subtitle}</p>
                  )}
                  {currentQuestion.description && (
                    <p className="text-sm text-gray-500 mt-2">{currentQuestion.description}</p>
                  )}
                </div>

                {/* Read question aloud button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={askCurrentQuestion}
                  className="text-gray-400 hover:text-white"
                  title="Read question aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {renderQuestionContent()}

            {/* Help button */}
            {currentQuestion.voiceHelp && (
              <button
                onClick={readHelp}
                className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Need help with this question?
              </button>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="border-slate-700 text-gray-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {visibleQuestions.slice(
              Math.max(0, currentIndex - 3),
              Math.min(visibleQuestions.length, currentIndex + 4)
            ).map((_, i) => {
              const actualIndex = Math.max(0, currentIndex - 3) + i;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    actualIndex === currentIndex
                      ? 'w-6 bg-purple-500'
                      : actualIndex < currentIndex
                      ? 'bg-purple-500/50'
                      : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <Button
            onClick={goNext}
            disabled={!canGoNext()}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            {currentIndex === visibleQuestions.length - 1 ? (
              <>
                Generate Blueprint
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Voice commands hint - Enhanced */}
        {voiceMode && (
          <div className="mt-8 p-5 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border border-slate-700">
            <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Voice Commands Available
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-300">"Next"</span>
                <span className="text-gray-500">- Continue</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-300">"Back"</span>
                <span className="text-gray-500">- Go back</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">"Help"</span>
                <span className="text-gray-500">- Get help</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-gray-300">"Repeat"</span>
                <span className="text-gray-500">- Hear again</span>
              </div>
              {currentQuestion.type === 'multiple' && (
                <div className="flex items-center gap-2 text-xs col-span-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <span className="text-gray-300">"Done"</span>
                  <span className="text-gray-500">- Finish selecting multiple options</span>
                </div>
              )}
              {!currentQuestion.required && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-gray-300">"Skip"</span>
                  <span className="text-gray-500">- Skip question</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700">
              <p className="text-xs text-gray-400">
                {currentQuestion.type === 'single' || currentQuestion.type === 'multiple'
                  ? '💡 Tip: Just say the option name to select it (e.g., "web app", "mobile")'
                  : '💡 Tip: Speak freely and your answer will be recorded'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderIQQuestionnaire;
