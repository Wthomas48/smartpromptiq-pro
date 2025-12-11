import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import useVoiceActivation from '@/hooks/useVoiceActivation';
import BackButton from '@/components/BackButton';
import {
  Copy, Download, Share2, Save, Edit2, Sparkles,
  Code, Palette, Users, Shield, CreditCard, Rocket,
  FileText, Image, MessageSquare, BarChart3, Check,
  ChevronRight, ExternalLink, Volume2, VolumeX,
  Zap, Star, Clock, Target, Layers, Database
} from 'lucide-react';

interface BlueprintData {
  appName: string;
  appDescription: string;
  industry: string;
  category: string;
  complexity: string;
  appType: string;
  targetAudience: string[];
  mainPurpose: string;
  features: string[];
  userActions: string[];
  authentication: string;
  aiFeatures: string[];
  payments: string;
  designStyle: string;
  colorScheme: string;
  marketingMaterials: string[];
}

const BuilderIQBlueprint: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Voice for reading the blueprint
  const voice = useVoiceActivation({
    speakResponses: true,
    voicePersonality: 'professional',
  });

  // Get responses from localStorage
  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('builderiq_responses');
    if (stored) {
      const responses = JSON.parse(stored);
      setBlueprintData(transformResponsesToBlueprint(responses));
    }
  }, []);

  // Transform questionnaire responses to blueprint
  const transformResponsesToBlueprint = (responses: Record<string, any>): BlueprintData => {
    // Generate app name if not provided
    const appName = responses.app_name || generateAppName(responses);

    return {
      appName,
      appDescription: responses.main_purpose || 'A modern application built with BuilderIQ',
      industry: responses.industry || detectIndustry(responses),
      category: detectCategory(responses),
      complexity: responses.complexity || 'standard',
      appType: responses.app_type || 'web',
      targetAudience: responses.target_audience || [],
      mainPurpose: responses.main_purpose || '',
      features: responses.key_features || [],
      userActions: responses.user_actions || [],
      authentication: responses.authentication || 'basic',
      aiFeatures: responses.ai_features || [],
      payments: responses.payments || 'none',
      designStyle: responses.design_style || 'professional',
      colorScheme: responses.color_scheme || 'purple_black_blue',
      marketingMaterials: responses.marketing_materials || [],
    };
  };

  // Generate app name based on responses
  const generateAppName = (responses: Record<string, any>): string => {
    const prefixes = ['Smart', 'Pro', 'Quick', 'Easy', 'Ultra', 'Next', 'Swift'];
    const suffixes = ['Hub', 'Flow', 'Pro', 'IQ', 'Lab', 'App', 'Suite'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix}`;
  };

  // Detect industry from responses
  const detectIndustry = (responses: Record<string, any>): string => {
    const audience = responses.target_audience || [];
    if (audience.includes('healthcare')) return 'Healthcare';
    if (audience.includes('traders')) return 'Finance';
    if (audience.includes('students')) return 'Education';
    if (audience.includes('real_estate')) return 'Real Estate';
    return 'Technology';
  };

  // Detect category from features
  const detectCategory = (responses: Record<string, any>): string => {
    const features = responses.key_features || [];
    if (features.includes('marketplace')) return 'Marketplace';
    if (features.includes('analytics')) return 'Analytics Platform';
    if (features.includes('messaging')) return 'Communication';
    if (features.includes('calendar')) return 'Scheduling';
    return 'Management System';
  };

  // Generate the master prompt
  const generateMasterPrompt = (): string => {
    if (!blueprintData) return '';

    return `# ${blueprintData.appName} - Complete App Blueprint

## 📋 APP OVERVIEW
**Name:** ${blueprintData.appName}
**Description:** ${blueprintData.appDescription}
**Industry:** ${blueprintData.industry}
**Category:** ${blueprintData.category}
**Complexity:** ${blueprintData.complexity.charAt(0).toUpperCase() + blueprintData.complexity.slice(1)}
**Platform:** ${blueprintData.appType === 'both' ? 'Web + Mobile' : blueprintData.appType.charAt(0).toUpperCase() + blueprintData.appType.slice(1)}

## 🎯 TARGET USERS
${blueprintData.targetAudience.map(t => `- ${formatLabel(t)}`).join('\n')}

## 🚀 CORE PURPOSE
${blueprintData.mainPurpose}

## ✨ KEY FEATURES
${blueprintData.features.map(f => `- ${formatLabel(f)}`).join('\n')}

## 👆 USER ACTIONS
Users should be able to:
${blueprintData.userActions.map(a => `- ${formatLabel(a)}`).join('\n')}

## 🔐 AUTHENTICATION
**Type:** ${formatLabel(blueprintData.authentication)}
${blueprintData.authentication === 'oauth' ? '- Google OAuth\n- Apple Sign In\n- GitHub (optional)' : ''}
${blueprintData.authentication === 'subscription' ? '- Tiered access (Free, Pro, Enterprise)\n- Role-based permissions' : ''}

## 🤖 AI CAPABILITIES
${blueprintData.aiFeatures.length > 0
  ? blueprintData.aiFeatures.map(f => `- ${formatLabel(f)}`).join('\n')
  : '- No AI features required (manual user input)'}

## 💳 PAYMENTS & MONETIZATION
**Payment Type:** ${formatLabel(blueprintData.payments)}
${blueprintData.payments === 'stripe_subscription' ? `
Suggested Pricing Tiers:
- Free: Basic features, limited usage
- Pro ($29/mo): Full features, priority support
- Enterprise (Custom): API access, dedicated support` : ''}

## 🎨 DESIGN SPECIFICATIONS
**Style:** ${formatLabel(blueprintData.designStyle)}
**Color Scheme:** ${formatLabel(blueprintData.colorScheme)}

### Design Guidelines:
- Clean, modern interface
- Mobile-responsive design
- Accessibility compliant (WCAG 2.1)
- Dark/Light mode toggle
- Consistent spacing and typography

## 🏗️ RECOMMENDED TECH STACK

### Frontend:
- React 18+ with TypeScript
- Tailwind CSS for styling
- Shadcn/UI component library
- React Query for data fetching
- Wouter for routing

### Backend:
- Node.js with Express
- Prisma ORM
- PostgreSQL database
- JWT authentication

### Infrastructure:
- Vercel or Railway for hosting
- Stripe for payments
- Resend for emails
- Cloudflare for CDN

## 📱 SCREEN ARCHITECTURE

### Core Screens:
1. **Landing Page** - Hero, features, pricing, CTA
2. **Authentication** - Sign in, sign up, forgot password
3. **Dashboard** - Main user hub with key metrics
4. **[Primary Feature]** - Main functionality screen
5. **Settings** - User preferences, billing, profile
6. **Admin Panel** - User management, analytics

### User Flows:
1. Onboarding → Dashboard → Primary Feature
2. Browse → Select → Action → Confirmation
3. Create → Edit → Preview → Publish

## 📊 DATABASE SCHEMA

### Core Tables:
- users (id, email, password, role, subscription_tier, created_at)
- [feature_items] (id, user_id, title, data, status, created_at)
- subscriptions (id, user_id, tier, status, stripe_id)
- analytics (id, user_id, event, metadata, timestamp)

## 🔒 SECURITY CONSIDERATIONS
- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Rate limiting
- Input validation and sanitization
- HTTPS only
${blueprintData.industry === 'Healthcare' ? '- HIPAA compliance considerations\n- End-to-end encryption for sensitive data' : ''}
${blueprintData.industry === 'Finance' ? '- PCI DSS compliance for payments\n- Audit logging for transactions' : ''}

## 🚀 DEPLOYMENT CHECKLIST
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Stripe webhooks set up
- [ ] Email service connected
- [ ] Monitoring enabled
- [ ] Backup strategy in place

---

## 📝 MASTER PROMPT FOR AI CODE GENERATION

Use this prompt with Claude, GPT-4, or similar AI to generate your app:

\`\`\`
Build a ${blueprintData.appType} application called "${blueprintData.appName}" for ${blueprintData.targetAudience.map(formatLabel).join(', ')}.

The app should ${blueprintData.mainPurpose.toLowerCase()}.

Technical Requirements:
- Platform: ${blueprintData.appType === 'both' ? 'Web + Mobile responsive' : blueprintData.appType}
- Authentication: ${formatLabel(blueprintData.authentication)}
${blueprintData.payments !== 'none' ? `- Payments: ${formatLabel(blueprintData.payments)} with Stripe` : ''}
${blueprintData.aiFeatures.length > 0 ? `- AI Features: ${blueprintData.aiFeatures.map(formatLabel).join(', ')}` : ''}

Core Features:
${blueprintData.features.map(f => `- ${formatLabel(f)}`).join('\n')}

User Actions:
${blueprintData.userActions.map(a => `- ${formatLabel(a)}`).join('\n')}

Design:
- Style: ${formatLabel(blueprintData.designStyle)}
- Colors: ${formatLabel(blueprintData.colorScheme)}
- Modern, responsive, accessible

Use React, TypeScript, Tailwind CSS, Express, Prisma, and PostgreSQL.
Include proper error handling, loading states, and toast notifications.
\`\`\`

---
Generated with BuilderIQ by SmartPromptIQ
`;
  };

  // Format label from snake_case to Title Case
  const formatLabel = (value: string): string => {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const prompt = generateMasterPrompt();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your blueprint is ready to use with any AI tool',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as markdown
  const handleDownload = () => {
    const prompt = generateMasterPrompt();
    const blob = new Blob([prompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprintData?.appName || 'app'}-blueprint.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Blueprint saved as markdown file',
    });
  };

  // Read blueprint aloud
  const handleReadAloud = () => {
    if (voice.isSpeaking) {
      voice.stopSpeaking();
    } else {
      const summary = `
        Your app is called ${blueprintData?.appName}.
        It's a ${blueprintData?.complexity} ${blueprintData?.category} for ${blueprintData?.industry}.
        Key features include ${blueprintData?.features.slice(0, 3).map(formatLabel).join(', ')}.
        The design style is ${formatLabel(blueprintData?.designStyle || '')}.
        Your blueprint is ready for development!
      `;
      voice.speak(summary);
    }
  };

  if (!blueprintData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No blueprint data found</p>
          <Button onClick={() => navigate('/builderiq')} className="bg-purple-500 hover:bg-purple-600">
            Start Building
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <BackButton />

          <div className="mt-6 flex items-start justify-between">
            <div>
              <Badge className="mb-2 bg-green-500/20 text-green-300 border-green-500/30">
                <Check className="w-3 h-3 mr-1" /> Blueprint Generated
              </Badge>
              <h1 className="text-4xl font-bold text-white mb-2">{blueprintData.appName}</h1>
              <p className="text-gray-400 max-w-2xl">{blueprintData.appDescription}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReadAloud}
                className="border-slate-700 text-gray-300"
              >
                {voice.isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="border-slate-700 text-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleCopy}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Platform', value: blueprintData.appType === 'both' ? 'Web + Mobile' : blueprintData.appType, icon: Layers },
            { label: 'Complexity', value: blueprintData.complexity, icon: Target },
            { label: 'Industry', value: blueprintData.industry, icon: BarChart3 },
            { label: 'Features', value: `${blueprintData.features.length} Core`, icon: Zap },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="font-semibold text-white capitalize">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 p-1 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
              <FileText className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-purple-500">
              <Zap className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-purple-500">
              <Code className="w-4 h-4 mr-2" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="prompt" className="data-[state=active]:bg-purple-500">
              <Sparkles className="w-4 h-4 mr-2" />
              Master Prompt
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Target Audience */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {blueprintData.targetAudience.map((audience) => (
                      <Badge key={audience} variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {formatLabel(audience)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Authentication */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{formatLabel(blueprintData.authentication)}</p>
                  {blueprintData.authentication === 'oauth' && (
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="border-slate-600">Google</Badge>
                      <Badge variant="outline" className="border-slate-600">Apple</Badge>
                      <Badge variant="outline" className="border-slate-600">GitHub</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Design */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-pink-400" />
                    Design Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-2">{formatLabel(blueprintData.designStyle)}</p>
                  <p className="text-sm text-gray-500">Colors: {formatLabel(blueprintData.colorScheme)}</p>
                </CardContent>
              </Card>

              {/* Payments */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-yellow-400" />
                    Monetization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{formatLabel(blueprintData.payments)}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Features */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Key Features</CardTitle>
                  <CardDescription>Core functionality for your app</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {blueprintData.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {formatLabel(feature)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* User Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">User Actions</CardTitle>
                  <CardDescription>What users can do</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {blueprintData.userActions.map((action) => (
                      <li key={action} className="flex items-center gap-2 text-gray-300">
                        <ChevronRight className="w-4 h-4 text-purple-400" />
                        {formatLabel(action)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* AI Features */}
              {blueprintData.aiFeatures.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {blueprintData.aiFeatures.map((feature) => (
                        <Badge key={feature} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {formatLabel(feature)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Recommended Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Frontend</h4>
                    <ul className="space-y-1 text-gray-400">
                      <li>• React 18+ with TypeScript</li>
                      <li>• Tailwind CSS</li>
                      <li>• Shadcn/UI Components</li>
                      <li>• React Query</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3">Backend</h4>
                    <ul className="space-y-1 text-gray-400">
                      <li>• Node.js + Express</li>
                      <li>• Prisma ORM</li>
                      <li>• PostgreSQL</li>
                      <li>• JWT Auth</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3">Infrastructure</h4>
                    <ul className="space-y-1 text-gray-400">
                      <li>• Railway / Vercel</li>
                      <li>• Stripe Payments</li>
                      <li>• Resend Email</li>
                      <li>• Cloudflare CDN</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Master Prompt Tab */}
          <TabsContent value="prompt">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Master Prompt</CardTitle>
                  <CardDescription>Copy this prompt to use with Claude, GPT-4, or any AI</CardDescription>
                </div>
                <Button onClick={handleCopy} className="bg-purple-500 hover:bg-purple-600">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-slate-900 rounded-xl text-gray-300 text-sm overflow-auto max-h-[600px] whitespace-pre-wrap font-mono">
                  {generateMasterPrompt()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/builderiq/questionnaire')}
            className="border-slate-700 text-gray-300"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Responses
          </Button>
          <Button
            onClick={() => window.open('https://claude.ai', '_blank')}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Claude
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/builderiq/templates')}
            className="border-slate-700 text-gray-300"
          >
            <Layers className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuilderIQBlueprint;
