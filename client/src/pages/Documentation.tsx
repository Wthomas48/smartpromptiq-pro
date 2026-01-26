import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TutorialSectionAudio from '@/components/TutorialSectionAudio';
import TutorialSlideshow, { Slide } from '@/components/TutorialSlideshow';
import { LiveChatWidget, ContactFormModal, ScheduleCallModal } from '@/components/SupportWidgets';
import {
  BookOpen,
  Rocket,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  Brain,
  MessageSquare,
  Target,
  Shield,
  Zap,
  Lightbulb,
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Sparkles,
  Heart,
  Trophy,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Share2,
  Globe,
  Mail,
  Phone,
  HelpCircle,
  Plus,
  Minus,
  ArrowRight,
  Volume2
} from 'lucide-react';

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<number | null>(null);
  const [, navigate] = useLocation();

  // Support widget states
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showScheduleCall, setShowScheduleCall] = useState(false);

  const navigationItems = [
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'features', label: 'Core Features', icon: Sparkles },
    { id: 'categories', label: 'AI Categories', icon: Brain },
    { id: 'pricing', label: 'Pricing & Plans', icon: DollarSign },
    { id: 'api', label: 'API Reference', icon: FileText },
    { id: 'tutorials', label: 'Tutorials', icon: PlayCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'support', label: 'Support', icon: MessageSquare }
  ];

  const features = [
    {
      title: 'AI-Powered Prompt Generation',
      description: 'Advanced AI creates professional prompts tailored to your specific needs and industry.',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      capabilities: ['Industry-specific prompts', 'Context-aware generation', 'Multi-language support', 'Custom tone adjustment']
    },
    {
      title: 'Smart Categories System',
      description: 'Organized categories covering business, education, marketing, and personal development.',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      capabilities: ['15+ specialized categories', 'Custom category requests', 'Intelligent categorization', 'Category-specific questionnaires']
    },
    {
      title: 'Interactive Questionnaires',
      description: 'Guided questionnaires that understand your goals and generate perfect prompts.',
      icon: MessageSquare,
      color: 'from-green-500 to-teal-500',
      capabilities: ['Dynamic question flow', 'Context-aware questions', 'Save & resume sessions', 'Export responses']
    },
    {
      title: 'Team Collaboration',
      description: 'Work together with your team on projects with shared templates and analytics.',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      capabilities: ['Shared workspaces', 'Role-based permissions', 'Team analytics', 'Collaboration tools']
    },
    {
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your AI usage, performance, and cost optimization.',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      capabilities: ['Usage tracking', 'Performance metrics', 'Cost analysis', 'Export reports']
    },
    {
      title: 'Template Management',
      description: 'Create, save, and manage your favorite prompts and templates for future use.',
      icon: FileText,
      color: 'from-pink-500 to-rose-500',
      capabilities: ['Personal templates', 'Public template library', 'Version control', 'Smart tagging']
    }
  ];

  const categories = [
    { name: 'Marketing & Sales', icon: TrendingUp, prompts: '50+ prompts', color: 'bg-blue-500' },
    { name: 'Product Development', icon: Lightbulb, prompts: '40+ prompts', color: 'bg-green-500' },
    { name: 'Financial Planning', icon: DollarSign, prompts: '35+ prompts', color: 'bg-yellow-500' },
    { name: 'Education & Training', icon: BookOpen, prompts: '45+ prompts', color: 'bg-purple-500' },
    { name: 'Personal Development', icon: Heart, prompts: '30+ prompts', color: 'bg-pink-500' },
    { name: 'Business Strategy', icon: Target, prompts: '42+ prompts', color: 'bg-indigo-500' },
    { name: 'Content Creation', icon: FileText, prompts: '55+ prompts', color: 'bg-cyan-500' },
    { name: 'Team Management', icon: Users, prompts: '38+ prompts', color: 'bg-orange-500' }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['5 AI prompts/month', '5 voice generations', '3 music tracks', 'Community support'],
      color: 'border-gray-200',
      popular: false
    },
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      features: ['50 AI prompts/month', '50 voice generations', '10 music tracks', 'HD video export', 'Email support'],
      color: 'border-blue-500',
      popular: false
    },
    {
      name: 'Academy+',
      price: '$29',
      period: '/month',
      features: ['All 57 courses', '100 prompts/month', '75 voice generations', 'Certificates', 'Email support'],
      color: 'border-teal-500',
      popular: false
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      features: ['200 prompts/month', '200 voice generations', '50 music tracks', 'Commercial license', 'Priority support'],
      color: 'border-indigo-500',
      popular: true
    },
    {
      name: 'Team Pro',
      price: '$99',
      period: '/month',
      features: ['1,000 prompts/month', '500 voice generations', '4K video export', '2-5 team members', 'API access'],
      color: 'border-purple-500',
      popular: false
    },
    {
      name: 'Enterprise',
      price: '$299',
      period: '/month',
      features: ['5,000+ prompts', 'Unlimited generations', 'Unlimited team members', 'White-label', 'Dedicated manager', 'SSO & security'],
      color: 'border-amber-500',
      popular: false
    }
  ];

  const faqs = [
    {
      id: 'what-is-smartpromptiq',
      question: 'What is SmartPromptIQ™ Pro?',
      answer: 'SmartPromptIQ™ Pro is an advanced AI-powered platform that generates professional, industry-specific prompts for businesses, educators, and individuals. Our intelligent system uses questionnaires to understand your needs and creates tailored prompts that deliver exceptional results.'
    },
    {
      id: 'how-does-ai-work',
      question: 'How does the AI prompt generation work?',
      answer: 'Our AI analyzes your responses to dynamic questionnaires, considers your industry context, and generates prompts optimized for your specific use case. The system learns from millions of successful prompts to ensure high-quality, relevant results every time.'
    },
    {
      id: 'pricing-model',
      question: 'How does the pricing work?',
      answer: 'We offer flexible pricing with both subscription plans and pay-per-use options. Subscriptions include monthly prompt allowances with rollover unused prompts. You can also purchase additional token packages as needed. All plans include core features with advanced capabilities in higher tiers.'
    },
    {
      id: 'team-collaboration',
      question: 'Can I collaborate with my team?',
      answer: 'Yes! Our team features allow you to create shared workspaces, collaborate on projects, share templates, and access team analytics. You can invite team members with different permission levels and track usage across your organization.'
    },
    {
      id: 'custom-categories',
      question: 'Can I request custom categories?',
      answer: 'Absolutely! We offer custom category development for specific industries or use cases. Simply submit a request through our platform, and our team will work with you to create specialized prompts and questionnaires tailored to your needs within 24-48 hours.'
    },
    {
      id: 'data-security',
      question: 'Is my data secure?',
      answer: 'Security is our top priority. We use enterprise-grade encryption, secure data storage, and follow strict privacy protocols. Your prompts, templates, and business information are never shared with third parties and are stored securely in compliance with GDPR and other privacy regulations.'
    },
    {
      id: 'api-access',
      question: 'Do you offer API access?',
      answer: 'Yes, Pro and Business plans include API access. Our RESTful API allows you to integrate SmartPromptIQ into your existing workflows, applications, and systems. Comprehensive documentation and SDKs are available for easy implementation.'
    },
    {
      id: 'support-options',
      question: 'What support options are available?',
      answer: 'We offer multiple support channels: community forums for Free users, email support for Starter plans, priority email support for Pro users, and 24/7 dedicated support for Business customers. We also provide comprehensive documentation, video tutorials, and live chat assistance.'
    },
    {
      id: 'token-system',
      question: 'How does the token system work?',
      answer: 'Our token system is based on prompt complexity: Simple prompts (1 token), Standard prompts (3 tokens), Complex prompts (7 tokens), and Custom prompts (15 tokens). Unused tokens from subscriptions roll over monthly, and you can purchase additional token packages anytime.'
    },
    {
      id: 'getting-started',
      question: 'How do I get started?',
      answer: 'Getting started is easy! Sign up for a free account to get 5 free prompts, explore our categories, try our questionnaires, and see the AI in action. No credit card required for the free tier. You can upgrade anytime as your needs grow.'
    }
  ];

  const tutorials = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running with SmartPromptIQ™ Pro in under 5 minutes',
      audioContent: 'Welcome to the Quick Start Guide! In just 5 minutes, you will learn how to create your account, choose from our specialized AI categories, complete your first questionnaire, and generate professional prompts. This is the perfect starting point for new users who want to experience the power of SmartPromptIQ Pro right away.',
      duration: '5 min',
      level: 'Beginner',
      steps: ['Create account', 'Choose category', 'Complete questionnaire', 'Generate your first prompt'],
      slides: [
        {
          title: 'Welcome to SmartPromptIQ Pro!',
          content: 'SmartPromptIQ Pro is your AI-powered assistant for creating professional, industry-specific prompts. Whether you\'re in marketing, education, business, or personal development, we\'ve got you covered.',
          narration: 'Welcome to SmartPromptIQ Pro! This powerful platform uses artificial intelligence to help you create professional, industry-specific prompts. Whether you work in marketing, education, business strategy, or personal development, SmartPromptIQ Pro has specialized tools designed just for you. Let\'s get you started on your journey to mastering AI-powered prompt generation.',
          tips: ['No credit card required for free tier', 'Get 5 free prompts to explore', 'Access all basic features instantly']
        },
        {
          title: 'Step 1: Create Your Account',
          content: 'Sign up in seconds using your email or social login. Your account gives you access to all features, saved prompts, templates, and analytics.',
          narration: 'Let\'s create your account. You can sign up in just seconds using your email address or through social login options like Google. Once registered, you\'ll have access to all platform features including saved prompts, custom templates, usage analytics, and more. Head to the Sign Up page and fill in your details to get started.',
          tips: ['Use a business email for team features', 'Enable two-factor authentication for security', 'Complete your profile for personalized recommendations']
        },
        {
          title: 'Step 2: Choose Your Category',
          content: 'Browse 15+ specialized categories including Marketing, Education, Business Strategy, Content Creation, and more. Each category has tailored questionnaires and prompts.',
          narration: 'Now it\'s time to choose your category. We offer over 15 specialized categories including Marketing and Sales, Education and Training, Business Strategy, Content Creation, Personal Development, and many more. Each category has been carefully designed with tailored questionnaires and industry-specific prompts. Click on any category that matches your needs to begin.',
          tips: ['Start with your primary use case', 'You can always switch categories later', 'Request custom categories for specific needs']
        },
        {
          title: 'Step 3: Complete the Questionnaire',
          content: 'Answer intelligent questions that help our AI understand exactly what you need. The more context you provide, the better your prompts will be.',
          narration: 'This is where the magic happens. Our intelligent questionnaire system asks smart questions to understand exactly what you need. Answer each question thoughtfully, and remember that the more context and detail you provide, the better your generated prompts will be. Take your time here because quality input leads to quality output.',
          tips: ['Be specific about your goals', 'Include your target audience details', 'Mention any brand voice or tone preferences']
        },
        {
          title: 'Step 4: Generate Your Prompt!',
          content: 'Click generate and watch as our AI creates a professional, tailored prompt in seconds. Save it, copy it, or refine it further.',
          narration: 'You\'re ready to generate your first prompt! Click the Generate button and watch as our AI creates a professional, perfectly tailored prompt in just seconds. You can save it to your library, copy it directly to use with any AI tool, or refine it further with additional customizations. Congratulations, you\'ve just created your first SmartPromptIQ Pro prompt!',
          tips: ['Save prompts you like as templates', 'Use the copy button to instantly use your prompt', 'Try different variations for best results']
        },
        {
          title: 'You\'re All Set!',
          content: 'Congratulations! You\'ve completed the Quick Start Guide. Explore more features, try different categories, and start creating amazing AI prompts.',
          narration: 'Congratulations! You have completed the Quick Start Guide and are now ready to explore everything SmartPromptIQ Pro has to offer. Try different categories, experiment with various question responses, and build your library of powerful prompts. Welcome to the future of AI-powered productivity!',
          tips: ['Explore the template library', 'Check out advanced tutorials', 'Join our community for tips and tricks']
        }
      ] as Slide[]
    },
    {
      title: 'Mastering Questionnaires',
      description: 'Learn how to get the best results from our AI questionnaires',
      audioContent: 'Our intelligent questionnaires are the key to generating perfect prompts. In this tutorial, you will learn to understand different question types, how to provide detailed context for better results, using advanced options for customization, and saving your responses for future use. Master these skills to unlock the full potential of AI-powered prompt generation.',
      duration: '10 min',
      level: 'Intermediate',
      steps: ['Understanding question types', 'Providing detailed context', 'Using advanced options', 'Saving & reusing responses'],
      slides: [
        {
          title: 'The Power of Smart Questionnaires',
          content: 'Our questionnaires are the secret sauce behind perfect prompts. They use dynamic logic to ask the right questions based on your previous answers.',
          narration: 'Welcome to Mastering Questionnaires! Our smart questionnaire system is the secret sauce that makes SmartPromptIQ Pro so powerful. Unlike static forms, our questionnaires use dynamic logic to ask exactly the right questions based on your previous answers. This adaptive approach ensures you get perfectly tailored prompts every single time.',
          tips: ['Questionnaires adapt to your answers', 'Different categories have unique questions', 'Your responses directly shape your prompts']
        },
        {
          title: 'Understanding Question Types',
          content: 'We use multiple question formats: single choice, multiple choice, text input, sliders, and conditional branching to gather precise information.',
          narration: 'Let\'s understand the different question types you\'ll encounter. We use single choice questions for specific selections, multiple choice when several options apply, text input for detailed descriptions, sliders for preferences like tone or complexity, and conditional branching that shows different questions based on your previous answers. Each type is designed to gather the most useful information efficiently.',
          tips: ['Text inputs allow for the most customization', 'Multiple choice helps capture nuanced needs', 'Sliders are great for tone and style preferences']
        },
        {
          title: 'Providing Rich Context',
          content: 'The quality of your output depends on your input. Be specific, include examples, mention constraints, and describe your ideal outcome.',
          narration: 'Here\'s a crucial tip: the quality of your generated prompt directly depends on the quality of your input. When answering questions, be specific about your goals, include relevant examples when asked, mention any constraints or requirements, and clearly describe your ideal outcome. Think of it like briefing a skilled assistant. The more context you provide, the better they can help you.',
          tips: ['Include your target audience details', 'Mention specific industry terminology', 'Describe the desired tone and style', 'Share examples of what you like']
        },
        {
          title: 'Advanced Options & Customization',
          content: 'Unlock advanced settings to control prompt length, creativity level, technical depth, and output format for precise results.',
          narration: 'For even more control, explore our advanced options. You can adjust prompt length from concise to comprehensive, set the creativity level from conservative to innovative, control technical depth for expert versus general audiences, and specify output formats like bullet points, paragraphs, or structured frameworks. These settings give you fine-grained control over your results.',
          tips: ['Higher creativity for brainstorming', 'Lower creativity for factual content', 'Adjust technical depth for your audience', 'Choose formats that match your use case']
        },
        {
          title: 'Saving & Reusing Responses',
          content: 'Save time by storing your questionnaire responses. Reuse them as starting points for similar prompts without re-entering information.',
          narration: 'Here\'s a productivity hack: save your questionnaire responses! When you complete a questionnaire, you can save those responses as a template. Next time you need a similar prompt, start from your saved responses and just tweak what\'s different. This saves tremendous time and ensures consistency across related prompts.',
          tips: ['Save responses for recurring needs', 'Create variations from saved templates', 'Share response templates with your team']
        },
        {
          title: 'Pro Tips from the Experts',
          content: 'Think like your audience, iterate on your prompts, use the feedback system, and don\'t be afraid to experiment with different approaches.',
          narration: 'Let me share some expert tips. First, always think from your audience\'s perspective when answering questions. Second, don\'t stop at your first prompt. Iterate and refine for better results. Third, use our feedback system to rate prompts because this helps improve our AI. Finally, experiment! Try different category combinations and unexpected approaches. Sometimes the best prompts come from creative exploration.',
          tips: ['Think like your end user', 'Iterate for better results', 'Rate prompts to improve the AI', 'Experiment with different approaches']
        }
      ] as Slide[]
    },
    {
      title: 'Team Collaboration Setup',
      description: 'Set up your team workspace and manage collaboration',
      audioContent: 'Collaboration is essential for teams. This advanced tutorial covers creating shared team workspaces, inviting team members with different permission levels, managing access controls, and tracking team analytics to measure productivity. Perfect for managers and team leads who want to maximize their team\'s AI capabilities.',
      duration: '15 min',
      level: 'Advanced',
      steps: ['Create team workspace', 'Invite team members', 'Set permissions', 'Track team analytics'],
      slides: [
        {
          title: 'Why Team Collaboration Matters',
          content: 'Teams that collaborate on prompts see 3x better results. Shared knowledge, consistent messaging, and collective learning accelerate everyone\'s success.',
          narration: 'Welcome to Team Collaboration Setup! Did you know that teams who collaborate on prompts see three times better results than individuals working alone? Shared knowledge means everyone benefits from discoveries. Consistent messaging keeps your brand voice unified. And collective learning accelerates everyone\'s success. Let\'s set up your team for maximum impact.',
          tips: ['Shared prompts ensure brand consistency', 'Team analytics reveal best practices', 'Collaboration reduces duplicate effort']
        },
        {
          title: 'Creating Your Team Workspace',
          content: 'A workspace is your team\'s home base. It contains shared prompts, templates, analytics, and settings. One workspace can support your entire organization.',
          narration: 'Let\'s create your team workspace. Think of it as your team\'s home base for all things prompt-related. Your workspace will contain shared prompts that everyone can access, team templates for consistent outputs, combined analytics for insights, and centralized settings. Navigate to the Teams section and click Create Workspace to get started.',
          tips: ['Choose a clear workspace name', 'Add a description for clarity', 'Set default permissions thoughtfully']
        },
        {
          title: 'Inviting Team Members',
          content: 'Add team members via email invitation. They\'ll receive a link to join your workspace with their existing account or create a new one.',
          narration: 'Now let\'s invite your team. Click Invite Members and enter their email addresses. They\'ll receive an invitation link to join your workspace. If they already have a SmartPromptIQ account, they\'ll be added instantly. New users will be guided to create an account first. You can invite individuals or upload a list for bulk invitations.',
          tips: ['Use business emails for easier management', 'Send a personal note with invitations', 'Start with key team members, expand gradually']
        },
        {
          title: 'Setting Role-Based Permissions',
          content: 'Assign roles: Admin, Editor, or Viewer. Admins manage everything, Editors create and modify content, Viewers can only use existing prompts.',
          narration: 'Permissions keep your workspace organized and secure. We offer three roles: Admins have full control including billing and member management. Editors can create, modify, and share prompts and templates. Viewers can use existing prompts but cannot make changes. Assign roles based on each person\'s responsibilities to maintain order while enabling productivity.',
          tips: ['Limit Admin access to key stakeholders', 'Most team members work well as Editors', 'Use Viewer for external collaborators']
        },
        {
          title: 'Sharing Prompts & Templates',
          content: 'Share your best prompts with the team. Create team templates that anyone can use as starting points for consistent, high-quality outputs.',
          narration: 'Sharing is where collaboration becomes powerful. When you create a great prompt, share it with your team so everyone can benefit. Even better, turn your best prompts into team templates. These become starting points that any team member can use, ensuring consistent quality and saving everyone time. Build a shared library of your organization\'s prompt expertise.',
          tips: ['Tag templates by use case', 'Include usage notes for context', 'Regularly review and update shared templates']
        },
        {
          title: 'Team Analytics & Insights',
          content: 'Track usage patterns, popular prompts, token consumption, and productivity metrics. Use data to optimize your team\'s AI workflow.',
          narration: 'Analytics reveal how your team uses AI. Track which prompts are most popular, how tokens are being consumed, who\'s most active, and what categories drive the most value. Use these insights to optimize workflows, identify training needs, and demonstrate return on investment to stakeholders. Data-driven teams get better results.',
          tips: ['Review analytics weekly', 'Identify and share top performers', 'Use data to plan token budgets']
        },
        {
          title: 'Best Practices for Team Success',
          content: 'Establish naming conventions, create a template library, hold regular sharing sessions, and celebrate prompt wins to build a culture of AI excellence.',
          narration: 'Let me share best practices for team success. First, establish clear naming conventions so prompts are easy to find. Second, build a comprehensive template library covering common use cases. Third, hold regular sharing sessions where team members present their best prompts. Finally, celebrate wins! Recognizing great prompts builds enthusiasm and encourages innovation. You\'re now ready to lead your team to AI excellence.',
          tips: ['Create a naming convention guide', 'Schedule monthly prompt reviews', 'Recognize top contributors', 'Document lessons learned']
        }
      ] as Slide[]
    },
    {
      title: 'Template Management',
      description: 'Create, organize, and share templates effectively',
      audioContent: 'Templates save time and ensure consistency. Learn how to save your best prompts as reusable templates, organize them with smart tagging, share templates with your team, and discover public templates from other users. This tutorial will help you build a powerful library of prompts for any situation.',
      duration: '8 min',
      level: 'Intermediate',
      steps: ['Save prompts as templates', 'Organize with tags', 'Share with team', 'Use public templates'],
      slides: [
        {
          title: 'The Power of Templates',
          content: 'Templates transform one-time prompts into reusable assets. Save hours of work by building a library of proven prompts ready for instant use.',
          narration: 'Welcome to Template Management! Templates are one of the most powerful features in SmartPromptIQ Pro. They transform your one-time prompts into reusable assets that save hours of work. Imagine having a library of proven, effective prompts ready for instant use whenever you need them. Let\'s learn how to build that library.',
          tips: ['Templates maintain consistency', 'Reuse saves significant time', 'Great templates can be shared and monetized']
        },
        {
          title: 'Saving Prompts as Templates',
          content: 'After generating a prompt you love, click "Save as Template". Add a name, description, and tags to make it easy to find later.',
          narration: 'When you generate a prompt that works perfectly, don\'t let it disappear! Click the Save as Template button to preserve it. Give your template a clear, descriptive name that explains what it does. Add a detailed description of when and how to use it. This metadata makes your templates discoverable and useful for you and your team.',
          tips: ['Use descriptive template names', 'Include use case in the description', 'Note any customization points']
        },
        {
          title: 'Organizing with Smart Tags',
          content: 'Tags are searchable labels. Use category tags, purpose tags, audience tags, and format tags to create a system that scales.',
          narration: 'Organization is key to a useful template library. We recommend a multi-dimensional tagging system. Use category tags like marketing or education. Add purpose tags like email, social post, or presentation. Include audience tags like B2B or consumer. And don\'t forget format tags like bullet points or long-form. This system scales beautifully as your library grows.',
          tips: ['Create a consistent tag vocabulary', 'Use 3-5 tags per template', 'Review and consolidate tags periodically']
        },
        {
          title: 'Template Folders & Collections',
          content: 'Group related templates into folders and collections. Create folders by project, client, campaign, or any organization that works for you.',
          narration: 'Beyond tags, folders and collections provide another layer of organization. Create folders for specific projects, clients, or campaigns. Collections can group templates that work well together, like a complete social media campaign kit. This hierarchical organization helps you navigate large template libraries effortlessly.',
          tips: ['Mirror your project structure', 'Create collections for common workflows', 'Archive old folders to reduce clutter']
        },
        {
          title: 'Sharing Templates',
          content: 'Share templates with your team for consistent outputs. Set permissions to control who can view, use, or edit shared templates.',
          narration: 'Sharing multiplies the value of your templates. Share with your team to ensure everyone has access to your best work. When sharing, you can set permissions: allow only viewing, enable usage, or permit editing. Strategic sharing builds organizational capability while protecting your intellectual work.',
          tips: ['Share proven templates only', 'Include usage instructions', 'Get feedback to improve templates']
        },
        {
          title: 'Discovering Public Templates',
          content: 'Browse thousands of public templates created by the community. Find inspiration, learn new approaches, and jumpstart your prompt creation.',
          narration: 'You\'re not alone in this journey! Our public template library contains thousands of templates created by the SmartPromptIQ community. Browse by category, search by keyword, or explore trending templates. These public resources provide inspiration, teach new approaches, and help you jumpstart prompt creation in unfamiliar areas.',
          tips: ['Check ratings and reviews', 'Customize public templates for your needs', 'Consider contributing your best work']
        }
      ] as Slide[]
    }
  ];

  // Audio content for the tutorials section header
  const tutorialsSectionAudio = {
    title: 'Video Tutorials Overview',
    content: 'Welcome to the SmartPromptIQ Pro Video Tutorials section. Here you will find step-by-step guides to help you master our AI-powered prompt generation platform. We offer tutorials for all skill levels, from beginners just getting started to advanced users looking to maximize their productivity. Each tutorial includes clear instructions, practical examples, and tips from our experts. Click on any tutorial to start learning, or use the audio buttons to listen to descriptions before watching.'
  };

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <BackButton />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">SmartPromptIQ™ Pro Documentation</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Everything You Need to Know
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Complete documentation, tutorials, and guides to help you master AI-powered prompt generation 
              and unlock your creative potential with SmartPromptIQ™ Pro.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-white/90"
                onClick={() => setActiveSection('getting-started')}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setActiveSection('tutorials')}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Tutorials
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Documentation</CardTitle>
                  <CardDescription>Navigate through our guides</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 transition-colors ${
                            activeSection === item.id ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' : 'text-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Getting Started Section */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Getting Started with SmartPromptIQ™ Pro</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Welcome to SmartPromptIQ™ Pro! This guide will help you get up and running quickly with our AI-powered prompt generation platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Create Account', icon: Users, description: 'Sign up for free and get 5 free prompts to start exploring' },
                    { title: 'Choose Category', icon: Target, description: 'Select from 15+ specialized categories or request a custom one' },
                    { title: 'Complete Questionnaire', icon: MessageSquare, description: 'Answer intelligent questions that understand your needs' },
                    { title: 'Generate Prompts', icon: Sparkles, description: 'Get professional, tailored prompts instantly generated by AI' },
                    { title: 'Save Templates', icon: FileText, description: 'Save your best prompts as reusable templates' },
                    { title: 'Track Analytics', icon: BarChart3, description: 'Monitor usage, performance, and optimize your results' }
                  ].map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <Card key={index} className="border-2 hover:border-indigo-200 transition-colors">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Step {index + 1}: {step.title}</h3>
                          <p className="text-slate-600 text-sm mb-4">{step.description}</p>

                          {/* Signup Options */}
                          <div className="space-y-2 mt-4">
                            <Link href="/signin" className="block">
                              <Button variant="outline" className="w-full border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium py-2 text-sm">
                                <Sparkles className="w-4 h-4 mr-1" />
                                Get Started
                              </Button>
                            </Link>
                            <div className="flex space-x-2">
                              <Link href="/register" className="flex-1">
                                <Button variant="outline" className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 font-medium py-1.5 text-xs">
                                  Create Account
                                </Button>
                              </Link>
                              <Link href="/demo" className="flex-1">
                                <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium py-1.5 text-xs">
                                  Try Demo
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900 mb-2">Pro Tip: Start with Simple Prompts</h3>
                        <p className="text-green-800">
                          New to AI prompting? Begin with our simple prompt categories like "Email Writing" or "Social Media Posts" 
                          to get familiar with the platform before moving to complex business strategies.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Features</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Explore the powerful features that make SmartPromptIQ™ Pro the leading AI prompt generation platform.
                  </p>
                </div>

                <div className="space-y-8">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="overflow-hidden shadow-lg">
                        <div className="p-8">
                          <div className="flex items-start gap-6">
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                              <p className="text-slate-600 text-lg mb-6">{feature.description}</p>
                              <div className="grid grid-cols-2 gap-3">
                                {feature.capabilities.map((capability, capIndex) => (
                                  <div key={capIndex} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-slate-700">{capability}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categories Section */}
            {activeSection === 'categories' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">AI Categories</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Our specialized AI categories are designed for specific industries and use cases, each with tailored prompts and questionnaires.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-2">{category.name}</h3>
                          <p className="text-sm text-slate-600 mb-3">{category.prompts}</p>
                          <Badge variant="secondary" className="text-xs">Professional Grade</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Need a Custom Category?</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      Can't find the perfect category for your industry? Our team can create custom AI categories 
                      tailored specifically to your business needs and use cases.
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Request Custom Category
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pricing Section */}
            {activeSection === 'pricing' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Pricing & Plans</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Choose the perfect plan for your needs. All plans include our core AI features with additional capabilities in higher tiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {pricingTiers.map((tier, index) => (
                    <Card key={index} className={`relative ${tier.color} ${tier.popular ? 'ring-2 ring-indigo-500 scale-105' : ''}`}>
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-indigo-600 text-white px-3 py-1">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        <div className="flex items-baseline justify-center">
                          <span className="text-2xl font-bold">{tier.price}</span>
                          <span className="text-slate-500 text-sm ml-1">{tier.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-2">
                          {tier.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-xs">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-4" size="sm" variant={tier.popular ? "default" : "outline"}>
                          {tier.name === 'Free' ? 'Get Started' : tier.name === 'Enterprise' ? 'Contact Sales' : 'Choose Plan'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Token System
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Simple prompts</span>
                          <Badge variant="secondary">1 token</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Standard prompts</span>
                          <Badge variant="secondary">3 tokens</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Complex prompts</span>
                          <Badge variant="secondary">7 tokens</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Custom prompts</span>
                          <Badge variant="secondary">15 tokens</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Enterprise Solutions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        Need higher volumes or custom integrations? Our enterprise solutions offer:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Unlimited prompts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">White-label solutions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Custom integrations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Dedicated support</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* API Reference Section */}
            {activeSection === 'api' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">API Reference</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Integrate SmartPromptIQ™ Pro into your applications with our comprehensive REST API.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                        <CardDescription>Secure API access using JWT tokens</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                          <div className="text-green-400">// Authentication header</div>
                          <div className="text-white">Authorization: Bearer YOUR_JWT_TOKEN</div>
                          <br />
                          <div className="text-green-400">// Login endpoint</div>
                          <div className="text-blue-400">POST</div> <span className="text-white">/api/auth/login</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Generate Prompts</CardTitle>
                        <CardDescription>Create AI-powered prompts programmatically</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                          <div className="text-green-400">// Generate prompt</div>
                          <div className="text-blue-400">POST</div> <span className="text-white">/api/prompts/generate</span>
                          <br />
                          <div className="text-yellow-400">&#123;</div>
                          <div className="ml-4 text-white">"category": "marketing",</div>
                          <div className="ml-4 text-white">"answers": &#123;...&#125;,</div>
                          <div className="ml-4 text-white">"complexity": "standard"</div>
                          <div className="text-yellow-400">&#125;</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Templates</CardTitle>
                        <CardDescription>Manage your prompt templates via API</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-sm">/api/templates</code>
                            <span className="text-sm text-slate-600">List templates</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                            <Badge className="bg-green-500">POST</Badge>
                            <code className="text-sm">/api/templates</code>
                            <span className="text-sm text-slate-600">Create template</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                            <Badge className="bg-yellow-600">PUT</Badge>
                            <code className="text-sm">/api/templates/:id</code>
                            <span className="text-sm text-slate-600">Update template</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Rate Limits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Starter Plan</span>
                          <Badge variant="outline">100/hour</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pro Plan</span>
                          <Badge variant="outline">500/hour</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Business Plan</span>
                          <Badge variant="outline">2000/hour</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>SDKs Available</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {['JavaScript/Node.js', 'Python', 'PHP', 'Ruby', 'Go'].map((sdk) => (
                          <div key={sdk} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{sdk}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-900 font-medium mb-1">API Documentation</p>
                            <p className="text-sm text-blue-800">
                              Full API documentation with examples and SDKs available in your dashboard.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Tutorials Section */}
            {activeSection === 'tutorials' && (
              <div className="space-y-8">
                {/* Slideshow Modal */}
                {selectedTutorial !== null && tutorials[selectedTutorial] && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-5xl">
                      <TutorialSlideshow
                        title={tutorials[selectedTutorial].title}
                        description={tutorials[selectedTutorial].description}
                        slides={tutorials[selectedTutorial].slides}
                        level={tutorials[selectedTutorial].level}
                        duration={tutorials[selectedTutorial].duration}
                        onClose={() => setSelectedTutorial(null)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-3xl font-bold text-slate-900">Interactive Tutorials with Voice Narration</h2>
                    <TutorialSectionAudio
                      title={tutorialsSectionAudio.title}
                      content={tutorialsSectionAudio.content}
                      variant="hero"
                    />
                  </div>
                  <p className="text-slate-600 text-lg mb-4">
                    Step-by-step interactive slideshows with AI voice narration to help you master SmartPromptIQ™ Pro.
                  </p>
                  <div className="flex items-center gap-4 mb-8">
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Voice Narrated
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      <PlayCircle className="w-3 h-3 mr-1" />
                      Interactive Slides
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Pro Tips Included
                    </Badge>
                  </div>
                </div>

                {/* Section Audio Player - Full Version */}
                <div className="mb-8">
                  <TutorialSectionAudio
                    title={tutorialsSectionAudio.title}
                    content={tutorialsSectionAudio.content}
                    variant="default"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tutorials.map((tutorial, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-purple-300"
                      onClick={() => setSelectedTutorial(index)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
                          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse delay-700" />
                        </div>

                        {/* Play button */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 border-2 border-white/30">
                            <PlayCircle className="w-10 h-10 text-white" />
                          </div>
                          <span className="mt-3 text-white font-medium bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm">
                            Start Tutorial
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                            {tutorial.duration}
                          </Badge>
                          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                            {tutorial.slides.length} slides
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-white/90">{tutorial.level}</Badge>
                        </div>

                        {/* Voice indicator */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                          <Volume2 className="w-4 h-4 text-white" />
                          <span className="text-white text-xs">Voice Narrated</span>
                        </div>

                        {/* Audio preview button */}
                        <div className="absolute bottom-4 right-4" onClick={(e) => e.stopPropagation()}>
                          <TutorialSectionAudio
                            title={tutorial.title}
                            content={tutorial.audioContent}
                            variant="hero"
                          />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                            {tutorial.title}
                          </h3>
                          <div onClick={(e) => e.stopPropagation()}>
                            <TutorialSectionAudio
                              title={tutorial.title}
                              content={tutorial.audioContent}
                              variant="inline"
                            />
                          </div>
                        </div>
                        <p className="text-slate-600 mb-4">{tutorial.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">What you'll learn:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {(Array.isArray(tutorial?.steps) ? tutorial.steps : []).map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-slate-600">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div onClick={(e) => e.stopPropagation()}>
                            <TutorialSectionAudio
                              title={tutorial.title}
                              content={tutorial.audioContent}
                              variant="compact"
                            />
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Watch Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Need Personalized Training?</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      Our team offers personalized onboarding sessions and custom training for teams and enterprise customers.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button>
                        <Mail className="w-4 h-4 mr-2" />
                        Schedule Training
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Live Chat Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* FAQ Section */}
            {activeSection === 'faq' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Find answers to the most common questions about SmartPromptIQ™ Pro, pricing, features, and more.
                  </p>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-6 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <h3 className="text-lg font-semibold text-slate-900 pr-4">{faq.question}</h3>
                          {expandedFaq === faq.id ? (
                            <Minus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <Plus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaq === faq.id && (
                          <div className="px-6 pb-6">
                            <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Still Have Questions?</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      Can't find what you're looking for? Our support team is here to help you succeed with SmartPromptIQ™ Pro.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                      <Button variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Us
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Support Section */}
            {activeSection === 'support' && (
              <div className="space-y-8">
                {/* Support Widget Modals */}
                <LiveChatWidget isOpen={showLiveChat} onClose={() => setShowLiveChat(false)} />
                <ContactFormModal isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
                <ScheduleCallModal isOpen={showScheduleCall} onClose={() => setShowScheduleCall(false)} />

                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Support & Help</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Get the help you need with multiple support channels and resources available 24/7.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Live Chat Support */}
                  <Card className="hover:shadow-lg transition-shadow hover:border-green-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Live Chat Support</h3>
                      <p className="text-slate-600 text-sm mb-3">Instant AI-powered help available anytime</p>
                      <Badge variant="secondary" className="text-xs mb-4">24/7 Available</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => setShowLiveChat(true)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Email Support */}
                  <Card className="hover:shadow-lg transition-shadow hover:border-blue-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Email Support</h3>
                      <p className="text-slate-600 text-sm mb-3">Detailed help for all your questions</p>
                      <Badge variant="secondary" className="text-xs mb-4">24-48 hour response</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => setShowContactForm(true)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Phone Support */}
                  <Card className="hover:shadow-lg transition-shadow hover:border-purple-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Phone Support</h3>
                      <p className="text-slate-600 text-sm mb-3">Schedule a call with our support team</p>
                      <Badge variant="secondary" className="text-xs mb-4">Business hours</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                        onClick={() => setShowScheduleCall(true)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Schedule Call
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Community Forum */}
                  <Card className="hover:shadow-lg transition-shadow hover:border-orange-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Community Forum</h3>
                      <p className="text-slate-600 text-sm mb-3">Connect with other users and get tips</p>
                      <Badge variant="secondary" className="text-xs mb-4">Always open</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                        onClick={() => window.open('https://discord.gg/smartpromptiq', '_blank')}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Join Forum
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Knowledge Base */}
                  <Card className="hover:shadow-lg transition-shadow hover:border-teal-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Knowledge Base</h3>
                      <p className="text-slate-600 text-sm mb-3">Comprehensive guides and tutorials</p>
                      <Badge variant="secondary" className="text-xs mb-4">Always available</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                        onClick={() => setActiveSection('getting-started')}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Browse Articles
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Video Tutorials */}
                  <Card className="hover:shadow-lg transition-shadow hover:border-pink-300 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Video Tutorials</h3>
                      <p className="text-slate-600 text-sm mb-3">Step-by-step visual guides</p>
                      <Badge variant="secondary" className="text-xs mb-4">On-demand</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-pink-200 text-pink-700 hover:bg-pink-50"
                        onClick={() => setActiveSection('tutorials')}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Watch Videos
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Support Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Email Support</span>
                        <Badge>24/7</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Live Chat (Pro)</span>
                        <Badge variant="secondary">9 AM - 6 PM EST</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Live Chat (Business)</span>
                        <Badge>24/7</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Phone Support</span>
                        <Badge variant="secondary">9 AM - 6 PM EST</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Priority Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        Get faster response times and priority handling with our Pro and Business plans.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Dedicated support channel</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Faster response times</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Screen sharing support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Account manager (Business)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Enterprise Support</h3>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                      Large organization? Our enterprise support includes dedicated account management, 
                      custom training, and priority development for your specific needs.
                    </p>
                    <Button
                      className="bg-white text-slate-900 hover:bg-slate-100"
                      onClick={() => {
                        window.location.href = 'mailto:sales@smartpromptiq.com?subject=Enterprise%20Sales%20Inquiry&body=Hello%20SmartPromptIQ%20Sales%20Team%2C%0A%0AI%20am%20interested%20in%20learning%20more%20about%20your%20Enterprise%20solutions.%0A%0ACompany%20Name%3A%20%0ATeam%20Size%3A%20%0AUse%20Case%3A%20%0A%0APlease%20contact%20me%20to%20discuss%20our%20requirements.%0A%0AThank%20you!';
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SmartPromptIQ™ Pro</h3>
              <p className="text-slate-400 text-sm mb-4">
                AI-powered prompt generation for professionals, teams, and enterprises.
              </p>
              <div className="flex gap-4">
                <Button size="sm" variant="ghost" className="text-white hover:text-slate-300">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:text-slate-300">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:text-slate-300">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Tutorials</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 SmartPromptIQ™ Pro. All rights reserved. Empowering creativity with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}