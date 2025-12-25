import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Lightbulb,
  Users,
  Layers,
  Database,
  Shield,
  Zap,
  CheckCircle2,
  ChevronRight,
  Rocket,
  Code2,
  Workflow,
  RefreshCw,
  Copy,
  Check,
  Download,
  FileText,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import DeploymentModal from '@/components/DeploymentModal';

// Deployment platforms with affiliate links
const DEPLOY_PLATFORMS = [
  {
    id: 'replit',
    name: 'Replit',
    logo: '🔄',
    color: 'from-orange-500 to-red-500',
    affiliateUrl: 'https://replit.com/refer/wthomas19542',
    techStack: ['50+ languages', 'Any framework', 'Built-in DB'],
    deployTime: '< 2 minutes',
    description: 'Browser IDE with AI assistance',
  },
  {
    id: 'bolt',
    name: 'Bolt.new',
    logo: '⚡',
    color: 'from-yellow-500 to-orange-500',
    affiliateUrl: 'https://bolt.new',
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    deployTime: '< 30 seconds',
    description: 'AI-powered full-stack builder',
  },
  {
    id: 'lovable',
    name: 'Lovable.dev',
    logo: '💜',
    color: 'from-purple-500 to-pink-500',
    affiliateUrl: 'https://lovable.dev',
    techStack: ['React', 'TypeScript', 'Supabase'],
    deployTime: '< 1 minute',
    description: 'Beautiful apps from text',
  },
  {
    id: 'v0',
    name: 'v0.dev',
    logo: '▲',
    color: 'from-gray-600 to-gray-800',
    affiliateUrl: 'https://v0.dev',
    techStack: ['React', 'shadcn/ui', 'Tailwind'],
    deployTime: 'Instant',
    description: 'AI UI generator by Vercel',
  },
];

interface Feature {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  icon: string;
}

interface UserFlow {
  name: string;
  steps: string[];
  actors: string[];
}

interface TechSuggestion {
  category: string;
  recommendation: string;
  reason: string;
}

interface StoryAnalysis {
  summary: string;
  problemIdentified: string;
  targetUsers: string[];
  suggestedAppType: string;
  features: Feature[];
  userFlows: UserFlow[];
  techStack: TechSuggestion[];
  estimatedComplexity: 'MVP' | 'Standard' | 'Enterprise';
  keyBenefits: string[];
  potentialChallenges: string[];
  nextSteps: string[];
}

export default function BuilderIQStoryAnalysis() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [storyInput, setStoryInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<StoryAnalysis | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [copied, setCopied] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof DEPLOY_PLATFORMS[0] | null>(null);

  // Get story from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const input = params.get('input');
    if (input) {
      setStoryInput(decodeURIComponent(input));
    } else {
      // No story input, redirect back
      setLocation('/builderiq');
    }
  }, [setLocation]);

  // Simulate AI analysis
  useEffect(() => {
    if (!storyInput) return;

    const phases = [
      { text: 'Understanding your story...', duration: 1000 },
      { text: 'Identifying pain points...', duration: 800 },
      { text: 'Analyzing user needs...', duration: 900 },
      { text: 'Suggesting features...', duration: 1100 },
      { text: 'Designing user flows...', duration: 1000 },
      { text: 'Recommending architecture...', duration: 800 },
      { text: 'Finalizing blueprint...', duration: 600 },
    ];

    let currentProgress = 0;
    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);

    const runPhases = async () => {
      for (const phase of phases) {
        setCurrentPhase(phase.text);
        await new Promise((resolve) => setTimeout(resolve, phase.duration));
        currentProgress += (phase.duration / totalDuration) * 100;
        setProgress(Math.min(currentProgress, 100));
      }

      // Generate analysis based on story
      const generatedAnalysis = generateAnalysis(storyInput);
      setAnalysis(generatedAnalysis);
      setIsAnalyzing(false);
    };

    runPhases();
  }, [storyInput]);

  const generateAnalysis = (story: string): StoryAnalysis => {
    const storyLower = story.toLowerCase();

    // Detect patterns in the story
    const hasInventory = storyLower.includes('inventory') || storyLower.includes('stock');
    const hasCustomer = storyLower.includes('customer') || storyLower.includes('client');
    const hasTracking = storyLower.includes('track') || storyLower.includes('manage');
    const hasManual = storyLower.includes('manual') || storyLower.includes('spreadsheet') || storyLower.includes('hours');
    const hasScheduling = storyLower.includes('schedule') || storyLower.includes('appointment') || storyLower.includes('booking');
    const hasTeam = storyLower.includes('team') || storyLower.includes('employee') || storyLower.includes('staff');
    const hasSales = storyLower.includes('sales') || storyLower.includes('order') || storyLower.includes('purchase');
    const hasReporting = storyLower.includes('report') || storyLower.includes('analytics') || storyLower.includes('data');

    // Generate features based on detected patterns
    const features: Feature[] = [];

    if (hasInventory) {
      features.push({
        name: 'Smart Inventory Management',
        description: 'Real-time inventory tracking with automatic low-stock alerts and reorder suggestions',
        priority: 'high',
        complexity: 'moderate',
        icon: 'database',
      });
    }

    if (hasCustomer) {
      features.push({
        name: 'Customer Relationship Hub',
        description: 'Centralized customer profiles with interaction history and preferences',
        priority: 'high',
        complexity: 'moderate',
        icon: 'users',
      });
    }

    if (hasTracking || hasManual) {
      features.push({
        name: 'Automated Workflow Engine',
        description: 'Replace manual processes with automated workflows and smart notifications',
        priority: 'high',
        complexity: 'complex',
        icon: 'workflow',
      });
    }

    if (hasScheduling) {
      features.push({
        name: 'Intelligent Scheduling',
        description: 'Smart calendar with conflict detection, availability management, and automated reminders',
        priority: 'high',
        complexity: 'moderate',
        icon: 'clock',
      });
    }

    if (hasTeam) {
      features.push({
        name: 'Team Collaboration Dashboard',
        description: 'Real-time team coordination with task assignment, progress tracking, and communication tools',
        priority: 'medium',
        complexity: 'moderate',
        icon: 'users',
      });
    }

    if (hasSales) {
      features.push({
        name: 'Sales Pipeline Manager',
        description: 'Track deals from lead to close with forecasting and performance analytics',
        priority: 'high',
        complexity: 'complex',
        icon: 'trending',
      });
    }

    if (hasReporting) {
      features.push({
        name: 'Analytics Dashboard',
        description: 'Visual insights with customizable reports and trend analysis',
        priority: 'medium',
        complexity: 'simple',
        icon: 'chart',
      });
    }

    // Add default features
    features.push({
      name: 'Mobile-First Design',
      description: 'Access your app from anywhere with responsive mobile interface',
      priority: 'medium',
      complexity: 'simple',
      icon: 'phone',
    });

    features.push({
      name: 'Role-Based Access Control',
      description: 'Secure user permissions with customizable roles and access levels',
      priority: 'low',
      complexity: 'moderate',
      icon: 'shield',
    });

    // Generate user flows
    const userFlows: UserFlow[] = [];

    if (hasInventory) {
      userFlows.push({
        name: 'Inventory Check & Reorder',
        steps: [
          'View inventory dashboard',
          'Filter by low-stock items',
          'Review reorder suggestions',
          'Approve or modify quantities',
          'Generate purchase order',
          'Receive confirmation',
        ],
        actors: ['Inventory Manager', 'Purchasing'],
      });
    }

    if (hasCustomer) {
      userFlows.push({
        name: 'Customer Service Resolution',
        steps: [
          'Receive customer inquiry',
          'Search customer profile',
          'View interaction history',
          'Identify solution',
          'Update customer record',
          'Send follow-up',
        ],
        actors: ['Support Agent', 'Customer'],
      });
    }

    userFlows.push({
      name: 'Daily Operations Overview',
      steps: [
        'Log into dashboard',
        'Review priority alerts',
        'Check pending tasks',
        'Process urgent items',
        'Update status',
        'Log activity',
      ],
      actors: ['Manager', 'Team Member'],
    });

    // Determine app complexity
    let complexity: 'MVP' | 'Standard' | 'Enterprise' = 'Standard';
    if (features.length <= 4) complexity = 'MVP';
    if (features.length > 6 || features.some((f) => f.complexity === 'complex')) complexity = 'Enterprise';

    return {
      summary: `Based on your story, SmartPromptIQ has identified opportunities to streamline your operations through intelligent automation and real-time data management. Your challenges with ${hasManual ? 'manual processes' : 'efficiency'} can be addressed with a custom solution.`,
      problemIdentified: hasManual
        ? 'Time-consuming manual processes are creating bottlenecks, causing errors, and preventing your team from focusing on high-value activities.'
        : 'Lack of visibility and coordination is leading to inefficiencies, missed opportunities, and frustrated stakeholders.',
      targetUsers: [
        'Business Owner/Manager',
        hasTeam ? 'Team Members/Staff' : 'Individual Users',
        hasCustomer ? 'Customer Support' : 'Operations',
      ],
      suggestedAppType: hasInventory
        ? 'Operations Management Platform'
        : hasScheduling
        ? 'Scheduling & Booking System'
        : hasSales
        ? 'Sales & CRM Platform'
        : 'Business Process Automation Tool',
      features,
      userFlows,
      techStack: [
        {
          category: 'Frontend',
          recommendation: 'React with TypeScript',
          reason: 'Modern, type-safe development with excellent component ecosystem',
        },
        {
          category: 'Backend',
          recommendation: 'Node.js with Express',
          reason: 'Fast API development with JavaScript/TypeScript consistency',
        },
        {
          category: 'Database',
          recommendation: hasInventory || hasSales ? 'PostgreSQL' : 'MongoDB',
          reason: hasInventory
            ? 'Relational data integrity for inventory and transactions'
            : 'Flexible document storage for varied data types',
        },
        {
          category: 'Authentication',
          recommendation: 'JWT with OAuth2',
          reason: 'Secure, industry-standard authentication with SSO options',
        },
      ],
      estimatedComplexity: complexity,
      keyBenefits: [
        hasManual ? 'Save 3-5 hours per day on manual tasks' : 'Improve operational visibility',
        'Reduce errors and inconsistencies by 80%',
        hasCustomer ? 'Faster customer response times' : 'Better decision-making with real-time data',
        'Scalable solution that grows with your business',
      ],
      potentialChallenges: [
        'Data migration from existing systems',
        'Team training and adoption period',
        'Integration with third-party tools',
      ],
      nextSteps: [
        'Review and customize the suggested features',
        'Prioritize MVP features for initial launch',
        'Create detailed wireframes for key screens',
        'Set up development environment and project structure',
      ],
    };
  };

  const handleCopyBlueprint = () => {
    if (!analysis) return;
    const blueprintText = `
# App Blueprint Generated by SmartPromptIQ

## Summary
${analysis.summary}

## Problem Identified
${analysis.problemIdentified}

## Suggested App Type
${analysis.suggestedAppType}

## Target Users
${analysis.targetUsers.map((u) => `- ${u}`).join('\n')}

## Key Features
${analysis.features.map((f) => `- **${f.name}** (${f.priority} priority): ${f.description}`).join('\n')}

## User Flows
${analysis.userFlows.map((flow) => `### ${flow.name}\n${flow.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`).join('\n\n')}

## Tech Stack Recommendations
${analysis.techStack.map((t) => `- **${t.category}**: ${t.recommendation} - ${t.reason}`).join('\n')}

## Key Benefits
${analysis.keyBenefits.map((b) => `- ${b}`).join('\n')}

## Next Steps
${analysis.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
    `;

    navigator.clipboard.writeText(blueprintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Blueprint Copied!',
      description: 'Your app blueprint has been copied to clipboard',
    });
  };

  const handleStartBuilding = () => {
    // Store analysis in session and navigate to blueprint page
    sessionStorage.setItem('storyAnalysis', JSON.stringify(analysis));
    setLocation('/builderiq/blueprint');
  };

  const handleDeployToPlatform = (platform: typeof DEPLOY_PLATFORMS[0]) => {
    setSelectedPlatform(platform);
    setDeployModalOpen(true);
  };

  // Generate blueprint prompt for deployment
  const getBlueprintPrompt = () => {
    if (!analysis) return '';
    return `
# SmartPromptIQ App Blueprint

## App Name: ${analysis.suggestedAppType}

## Summary
${analysis.summary}

## Problem to Solve
${analysis.problemIdentified}

## Target Users
${analysis.targetUsers.join(', ')}

## Key Features to Build
${analysis.features.map((f) => `- ${f.name}: ${f.description}`).join('\n')}

## User Flows
${analysis.userFlows.map((flow) => `### ${flow.name}\n${flow.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`).join('\n\n')}

## Tech Stack
${analysis.techStack.map((t) => `- ${t.category}: ${t.recommendation}`).join('\n')}

## Requirements
- Modern, responsive design
- Clean code architecture
- Production-ready quality
- User authentication if needed
- Database for data persistence

Generated by SmartPromptIQ - Your AI App Builder Partner
    `.trim();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'complex':
        return 'text-purple-400';
      case 'moderate':
        return 'text-blue-400';
      case 'simple':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'database':
        return Database;
      case 'users':
        return Users;
      case 'workflow':
        return Workflow;
      case 'clock':
        return Clock;
      case 'trending':
        return TrendingUp;
      case 'chart':
        return Target;
      case 'phone':
        return Zap;
      case 'shield':
        return Shield;
      default:
        return Lightbulb;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/builderiq">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to BuilderIQ
          </Button>
        </Link>

        {/* Analyzing state */}
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">Analyzing Your Story</h2>
              <p className="text-gray-400 mb-8">{currentPhase}</p>

              <div className="max-w-md mx-auto mb-4">
                <Progress value={progress} className="h-2" />
              </div>
              <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>

              <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-gray-400 italic">"{(storyInput || '').slice(0, 150)}..."</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Your App Blueprint</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">{analysis?.summary}</p>
              </div>

              {/* Problem & Solution */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <Target className="w-5 h-5" />
                      Problem Identified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{analysis?.problemIdentified}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <Rocket className="w-5 h-5" />
                      Suggested Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white text-lg font-semibold mb-2">{analysis?.suggestedAppType}</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis?.targetUsers.map((user, i) => (
                        <Badge key={i} variant="outline" className="border-slate-600 text-gray-300">
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Features */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Layers className="w-5 h-5 text-purple-400" />
                    Suggested Features
                  </CardTitle>
                  <CardDescription>
                    Based on your story, here are the features we recommend for your app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis?.features.map((feature, i) => {
                      const IconComponent = getFeatureIcon(feature.icon);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium mb-1">{feature.name}</h4>
                              <p className="text-sm text-gray-400 mb-2">{feature.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge className={getPriorityColor(feature.priority)}>
                                  {feature.priority}
                                </Badge>
                                <span className={`text-xs ${getComplexityColor(feature.complexity)}`}>
                                  {feature.complexity}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* User Flows */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Workflow className="w-5 h-5 text-blue-400" />
                    User Flows
                  </CardTitle>
                  <CardDescription>Key workflows your users will follow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysis?.userFlows.map((flow, i) => (
                      <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm text-blue-400">
                            {i + 1}
                          </span>
                          {flow.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {flow.actors.map((actor, j) => (
                            <Badge key={j} variant="outline" className="border-blue-500/30 text-blue-400">
                              <Users className="w-3 h-3 mr-1" />
                              {actor}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {flow.steps.map((step, j) => (
                            <div key={j} className="flex items-center">
                              <span className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-gray-300">
                                {step}
                              </span>
                              {j < flow.steps.length - 1 && (
                                <ChevronRight className="w-4 h-4 text-gray-600 mx-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tech Stack */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                    Recommended Tech Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {analysis?.techStack.map((tech, i) => (
                      <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                        <div className="text-sm text-gray-500 mb-1">{tech.category}</div>
                        <div className="text-white font-semibold mb-2">{tech.recommendation}</div>
                        <p className="text-xs text-gray-400">{tech.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits & Challenges */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="w-5 h-5" />
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis?.keyBenefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Shield className="w-5 h-5" />
                      Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis?.potentialChallenges.map((challenge, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-xs text-yellow-400">{i + 1}</span>
                          </div>
                          <span className="text-gray-300">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Complexity & Next Steps */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="text-gray-400 mb-1">Estimated Complexity</div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-lg px-4 py-1 ${
                            analysis?.estimatedComplexity === 'MVP'
                              ? 'bg-green-500/20 text-green-400'
                              : analysis?.estimatedComplexity === 'Standard'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {analysis?.estimatedComplexity}
                        </Badge>
                        <span className="text-gray-400">
                          {analysis?.estimatedComplexity === 'MVP'
                            ? '~ 2-4 weeks'
                            : analysis?.estimatedComplexity === 'Standard'
                            ? '~ 4-8 weeks'
                            : '~ 8-12 weeks'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={handleCopyBlueprint}
                        className="border-slate-600 text-gray-300 hover:text-white"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy Blueprint'}
                      </Button>
                      <Button
                        onClick={handleStartBuilding}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Start Building
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {analysis?.nextSteps.map((step, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                          <span className="text-indigo-400 font-bold">{i + 1}</span>
                        </div>
                        <p className="text-gray-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Deploy Now Section */}
              <Card className="bg-gradient-to-br from-slate-800/80 to-purple-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Rocket className="w-5 h-5 text-purple-400" />
                    Deploy Your App Now
                  </CardTitle>
                  <CardDescription>
                    Choose a platform to deploy your app. We'll copy your blueprint and open the builder.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {DEPLOY_PLATFORMS.map((platform) => (
                      <motion.button
                        key={platform.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeployToPlatform(platform)}
                        className={`p-4 rounded-xl bg-gradient-to-br ${platform.color} hover:shadow-lg transition-all border border-white/10`}
                      >
                        <div className="text-3xl mb-2">{platform.logo}</div>
                        <div className="text-white font-semibold text-sm">{platform.name}</div>
                        <div className="text-white/70 text-xs mt-1">{platform.deployTime}</div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/deployment-hub">
                      <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:text-white">
                        <Globe className="w-4 h-4 mr-2" />
                        View All 20+ Platforms
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Re-analyze option */}
              <div className="text-center">
                <Link href="/builderiq">
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tell a Different Story
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Deployment Modal */}
      <DeploymentModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        platform={selectedPlatform}
        blueprintPrompt={getBlueprintPrompt()}
        appName={analysis?.suggestedAppType || 'My App'}
      />
    </div>
  );
}
