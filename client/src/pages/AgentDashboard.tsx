import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/config/api';
import BackButton from '@/components/BackButton';
import SectionLanding from '@/components/SectionLanding';
import EducationalHeader, { educationalContent } from '@/components/EducationalHeader';
import {
  Bot, Plus, Settings, Key, Code, BarChart3, Trash2, Edit,
  Copy, Check, Eye, EyeOff, RefreshCw, MessageSquare, Users,
  Zap, Globe, Palette, Volume2, Shield, Clock, ArrowRight,
  ExternalLink, Download, Play, Loader2, AlertCircle, Sparkles,
  GraduationCap, BookOpen, Trophy, Star, ChevronRight, Rocket,
  FileText, Link2, Unlink
} from 'lucide-react';
import { apiRequest } from '@/config/api';

// SEO-optimized content for public landing
const agentsLandingContent = {
  title: 'AI Agents - Custom Chatbots',
  definition: 'AI Agents are custom-built chatbots powered by advanced language models like Claude and GPT-4 that you can embed on any website. SmartPromptIQ lets you create, configure, and deploy intelligent conversational agents with custom personalities, knowledge bases, and behaviors—no coding required.',
  whatItsFor: 'AI Agents transform how businesses interact with customers, automate support, and generate leads. Using our visual builder, you can create chatbots with custom system prompts that define their personality, expertise, and conversation style. Each agent gets a unique API key for secure deployment and analytics tracking.',
  whoItsFor: [
    'Business owners wanting 24/7 automated customer support without hiring staff',
    'Agencies creating white-label chatbot solutions for clients',
    'SaaS companies needing in-app assistants for user onboarding',
    'E-commerce sites looking to automate product recommendations and FAQs',
    'Content creators building interactive experiences for their audience',
    'Developers wanting pre-built agent templates to accelerate projects'
  ],
  howItHelps: [
    'Create unlimited custom chatbots with unique personalities and expertise',
    'Embed agents on any website with a single script tag',
    'Track conversations, messages, and engagement analytics in real-time',
    'Choose between Claude, GPT-4, and other models based on your needs',
    'Customize appearance, colors, and positioning to match your brand',
    'Manage multiple API keys for different websites and use cases'
  ],
  internalLinks: [
    { label: 'Academy', href: '/academy', description: 'Learn to build better AI agents' },
    { label: 'AI Agents Course', href: '/academy/course/ai-agents-masterclass', description: 'Free masterclass on building chatbots' },
    { label: 'BuilderIQ', href: '/builderiq', description: 'Browse pre-built agent templates' },
    { label: 'Templates', href: '/templates', description: 'Access system prompt templates' },
    { label: 'Voice AI', href: '/voice', description: 'Add voice capabilities to your agents' },
    { label: 'Pricing', href: '/pricing', description: 'View agent limits and pricing' }
  ],
  stats: [
    { label: 'Active Agents', value: '10K+' },
    { label: 'Messages/Month', value: '1M+' },
    { label: 'Avg Response Time', value: '<2s' },
    { label: 'Satisfaction Rate', value: '98%' }
  ],
  faqs: [
    {
      question: 'What is an AI Agent and how does it differ from a regular chatbot?',
      answer: 'AI Agents are powered by advanced language models (LLMs) like Claude and GPT-4, giving them true conversational understanding unlike rule-based chatbots. They can handle complex queries, maintain context across conversations, and provide intelligent responses without predefined scripts.'
    },
    {
      question: 'How do I embed an AI Agent on my website?',
      answer: 'After creating your agent, you\'ll receive a simple JavaScript snippet to copy-paste before your closing </body> tag. The agent automatically appears as a chat widget. You can customize position (bottom-left or bottom-right), colors, and theme to match your site.'
    },
    {
      question: 'Can I train the agent on my own data or knowledge base?',
      answer: 'Yes! Each agent has a system prompt where you can provide detailed instructions, product information, FAQs, and guidelines. The agent uses this context to provide accurate, brand-specific responses. Enterprise plans also support document uploads.'
    },
    {
      question: 'What AI models can I use for my agents?',
      answer: 'SmartPromptIQ supports multiple models including Claude 3 Haiku (fast, cost-effective), Claude 3 Sonnet (balanced), Claude 3 Opus (powerful), GPT-3.5 Turbo, GPT-4, and GPT-4 Turbo. Choose based on your complexity needs and budget.'
    },
    {
      question: 'How is agent usage billed?',
      answer: 'Agents are billed based on the number of messages processed. Free plans include limited messages per month. Pro and Business plans include higher limits and multiple agents. All plans include API keys and analytics.'
    },
    {
      question: 'Can I add voice capabilities to my AI Agent?',
      answer: 'Yes! You can enable voice input and output for your agents using our Voice AI integration. This allows users to speak to your chatbot and receive spoken responses, perfect for accessibility and hands-free use cases.'
    }
  ]
};

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  provider: string;
  model: string;
  isActive: boolean;
  isPublic: boolean;
  totalConversations: number;
  totalMessages: number;
  apiKeyCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  usageCount: number;
  createdAt: string;
}

interface AgentDetails extends Agent {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  welcomeMessage: string | null;
  primaryColor: string;
  position: string;
  theme: string;
  voiceEnabled: boolean;
  apiKeys: ApiKey[];
}

const AgentDashboard: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Show SEO-optimized public landing for non-authenticated users
  if (!isAuthenticated) {
    return (
      <SectionLanding
        title={agentsLandingContent.title}
        definition={agentsLandingContent.definition}
        whatItsFor={agentsLandingContent.whatItsFor}
        whoItsFor={agentsLandingContent.whoItsFor}
        howItHelps={agentsLandingContent.howItHelps}
        internalLinks={agentsLandingContent.internalLinks}
        heroGradient="from-purple-600 via-violet-600 to-indigo-600"
        ctaText="Create Your First Agent"
        ctaHref="/signup"
        secondaryCtaText="Watch Tutorial"
        secondaryCtaHref="/academy/course/ai-agents-masterclass"
        stats={agentsLandingContent.stats}
        faqs={agentsLandingContent.faqs}
        icon={<Bot className="w-8 h-8 text-white" />}
      />
    );
  }

  // State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Knowledge Base state
  const [agentDocs, setAgentDocs] = useState<any[]>([]);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Form state for creating/editing agents
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    systemPrompt: '',
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
    maxTokens: 1024,
    welcomeMessage: '',
    primaryColor: '#6366f1',
    position: 'bottom-right',
    theme: 'light',
    voiceEnabled: false,
  });

  const apiBase = getApiBaseUrl();

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const response = await fetch(`${apiBase}/api/agents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast({ title: 'Error', description: 'Failed to load agents', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single agent details
  const fetchAgentDetails = async (agentId: string) => {
    try {
      const response = await fetch(`${apiBase}/api/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSelectedAgent(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
    }
  };

  // Create agent
  const createAgent = async () => {
    try {
      const response = await fetch(`${apiBase}/api/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: 'Success!', description: 'Agent created successfully. Save your API key!' });
        setNewApiKey(data.data.apiKey);
        fetchAgents();
        setShowCreateModal(false);
        // Reset form
        setFormData({
          name: '',
          slug: '',
          description: '',
          systemPrompt: '',
          provider: 'anthropic',
          model: 'claude-3-haiku-20240307',
          temperature: 0.7,
          maxTokens: 1024,
          welcomeMessage: '',
          primaryColor: '#6366f1',
          position: 'bottom-right',
          theme: 'light',
          voiceEnabled: false,
        });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create agent', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast({ title: 'Error', description: 'Failed to create agent', variant: 'destructive' });
    }
  };

  // Delete agent
  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This cannot be undone.')) return;

    try {
      const response = await fetch(`${apiBase}/api/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: 'Deleted', description: 'Agent deleted successfully' });
        setSelectedAgent(null);
        fetchAgents();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete agent', variant: 'destructive' });
    }
  };

  // Get embed code
  const getEmbedCode = async (agentId: string) => {
    try {
      const response = await fetch(`${apiBase}/api/agents/${agentId}/embed-code`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setEmbedCode(data.data.embedCode);
        setShowEmbedCode(true);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to get embed code', variant: 'destructive' });
    }
  };

  // Generate new API key
  const generateApiKey = async (agentId: string, name: string) => {
    try {
      const response = await fetch(`${apiBase}/api/agents/${agentId}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();

      if (data.success) {
        setNewApiKey(data.data.apiKey);
        toast({ title: 'API Key Created', description: 'Save this key - it won\'t be shown again!' });
        if (selectedAgent) {
          fetchAgentDetails(selectedAgent.id);
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create API key', variant: 'destructive' });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // ── Knowledge Base functions ─────────────────────────────
  const fetchAgentDocuments = async (agentId: string) => {
    setIsLoadingDocs(true);
    try {
      const res = await apiRequest('GET', `/api/agents/${agentId}/documents`);
      const data = await res.json();
      setAgentDocs(data.data || []);
    } catch (e) {
      console.error('Failed to load agent documents:', e);
    }
    setIsLoadingDocs(false);
  };

  const fetchUserDocuments = async () => {
    try {
      const res = await apiRequest('GET', '/api/documents');
      const data = await res.json();
      setUserDocs((data.documents || []).filter((d: any) => d.status === 'ready'));
    } catch (e) {
      console.error('Failed to load user documents:', e);
    }
  };

  const attachDocument = async (agentId: string, documentId: string) => {
    try {
      await apiRequest('POST', `/api/agents/${agentId}/documents`, { documentId });
      toast({ title: 'Document attached', description: 'Knowledge base updated.' });
      fetchAgentDocuments(agentId);
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const detachDocument = async (agentId: string, documentId: string) => {
    try {
      await apiRequest('DELETE', `/api/agents/${agentId}/documents/${documentId}`);
      toast({ title: 'Document removed' });
      fetchAgentDocuments(agentId);
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Educational Context Header */}
      <EducationalHeader
        title={educationalContent.aiAgents.title}
        definition={educationalContent.aiAgents.definition}
        icon={<Bot className="w-5 h-5" />}
        academyLink={educationalContent.aiAgents.academyLink}
        relatedLinks={educationalContent.aiAgents.relatedLinks}
        gradient={educationalContent.aiAgents.gradient}
      />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <BackButton />

            <div className="mt-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Bot className="w-8 h-8 text-purple-400" />
                  My AI Agents
                </h2>
                <p className="text-gray-400 mt-1">Create and manage embeddable AI chat agents for your websites</p>
              </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* AI Agents Masterclass Promo - Awesome Animated Card */}
        <div className="mb-8 group">
          <div
            onClick={() => navigate('/academy/course/ai-agents-masterclass')}
            className="relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/25"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-x" />

            {/* Animated particles/stars effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Glowing orbs */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-400 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-fuchsia-400 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Left side - Icon and Badge */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                    {/* Animated ring */}
                    <div className="absolute -inset-1 rounded-2xl border-2 border-white/30 animate-ping opacity-20" />
                    {/* Badge */}
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      FREE
                    </div>
                  </div>
                </div>

                {/* Middle - Text content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-200 text-sm font-medium flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      New to AI Agents?
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-purple-100 transition-colors">
                    AI Agents Masterclass
                  </h3>
                  <p className="text-purple-100 text-sm md:text-base mb-3 max-w-xl">
                    Learn to build, deploy, and monetize AI chatbots for any website. From basics to advanced automation.
                  </p>

                  {/* Course stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      30 min
                    </span>
                    <span className="flex items-center gap-1.5 text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      <BookOpen className="w-4 h-4" />
                      6 Lessons
                    </span>
                    <span className="flex items-center gap-1.5 text-yellow-300 bg-white/10 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-300" />
                      Intermediate
                    </span>
                    <span className="flex items-center gap-1.5 text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      Certificate
                    </span>
                  </div>
                </div>

                {/* Right side - CTA Button */}
                <div className="flex-shrink-0">
                  <button className="group/btn relative inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-purple-50 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket className="w-5 h-5 group-hover/btn:animate-bounce" />
                      Start Learning
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-purple-200/50 to-transparent" />
                  </button>
                </div>
              </div>

              {/* Bottom progress indicator for course completion */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    2,847 students enrolled
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Most popular course this week
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New API Key Alert */}
        {newApiKey && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-400">Save Your API Key!</h3>
                <p className="text-sm text-gray-300 mb-2">This key will only be shown once. Store it securely.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-slate-800 rounded text-sm text-white font-mono">
                    {newApiKey}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(newApiKey, 'API Key')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {copiedKey === 'API Key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewApiKey(null)}
                className="text-gray-400"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Agent Grid */}
        {agents.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <Bot className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Agents Yet</h3>
              <p className="text-gray-400 mb-6">Create your first AI agent to embed on your website</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => {
                  fetchAgentDetails(agent.id);
                  setActiveTab('overview');
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{agent.name}</CardTitle>
                        <p className="text-sm text-gray-500">/{agent.slug}</p>
                      </div>
                    </div>
                    <Badge className={agent.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {agent.description && (
                    <CardDescription className="text-gray-400 mt-2">
                      {agent.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{agent.totalConversations}</p>
                      <p className="text-xs text-gray-500">Conversations</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{agent.totalMessages}</p>
                      <p className="text-xs text-gray-500">Messages</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{agent.apiKeyCount}</p>
                      <p className="text-xs text-gray-500">API Keys</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        getEmbedCode(agent.id);
                      }}
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Embed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAgentDetails(agent.id);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Agent Details Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAgent(null)}>
            <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                      <p className="text-gray-400">/{selectedAgent.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => getEmbedCode(selectedAgent.id)}
                      className="border-purple-500 text-purple-400"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Get Embed Code
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedAgent(null)} className="text-gray-400">
                      Close
                    </Button>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
                <TabsList className="bg-slate-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="knowledge" onClick={() => { fetchAgentDocuments(selectedAgent.id); fetchUserDocuments(); }}>Knowledge Base</TabsTrigger>
                  <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                  <TabsTrigger value="embed">Embed</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedAgent.totalConversations}</p>
                        <p className="text-xs text-gray-500">Conversations</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4 text-center">
                        <Zap className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedAgent.totalMessages}</p>
                        <p className="text-xs text-gray-500">Messages</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4 text-center">
                        <Key className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedAgent.apiKeys?.length || 0}</p>
                        <p className="text-xs text-gray-500">API Keys</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4 text-center">
                        <Globe className="w-8 h-8 mx-auto text-green-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedAgent.isActive ? 'Live' : 'Off'}</p>
                        <p className="text-xs text-gray-500">Status</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">System Prompt</h3>
                    <pre className="bg-slate-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-40">
                      {selectedAgent.systemPrompt}
                    </pre>
                  </div>

                  {/* Delete */}
                  <div className="pt-4 border-t border-slate-700">
                    <Button
                      variant="destructive"
                      onClick={() => deleteAgent(selectedAgent.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Agent
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Provider</Label>
                      <p className="text-white capitalize">{selectedAgent.provider}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <p className="text-white">{selectedAgent.model}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Temperature</Label>
                      <p className="text-white">{selectedAgent.temperature}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Max Tokens</Label>
                      <p className="text-white">{selectedAgent.maxTokens}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Theme</Label>
                      <p className="text-white capitalize">{selectedAgent.theme}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Position</Label>
                      <p className="text-white">{selectedAgent.position}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: selectedAgent.primaryColor }} />
                        <p className="text-white">{selectedAgent.primaryColor}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300">Voice Enabled</Label>
                      <p className="text-white">{selectedAgent.voiceEnabled ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="knowledge" className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Knowledge Base</h3>
                    <p className="text-sm text-gray-400 mb-4">Attach documents so this agent can answer questions using your content.</p>
                  </div>

                  {/* Attached documents */}
                  {isLoadingDocs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                  ) : agentDocs.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Attached Documents</p>
                      {agentDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                              <p className="text-xs text-gray-500">{doc.fileType?.toUpperCase()} · {doc.chunkCount} chunks</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => detachDocument(selectedAgent.id, doc.id)}
                          >
                            <Unlink className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                      <FileText className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">No documents attached yet</p>
                      <p className="text-xs text-gray-500 mt-1">Upload documents in Doc Chat, then attach them here</p>
                    </div>
                  )}

                  {/* Available documents to attach */}
                  {userDocs.filter((d) => !agentDocs.some((ad) => ad.id === d.id)).length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-slate-700">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Documents</p>
                      {userDocs
                        .filter((d) => !agentDocs.some((ad) => ad.id === d.id))
                        .map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-300 truncate">{doc.title}</p>
                                <p className="text-xs text-gray-500">{doc.fileType?.toUpperCase()} · {doc.chunkCount} chunks</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                              onClick={() => attachDocument(selectedAgent.id, doc.id)}
                            >
                              <Link2 className="w-4 h-4 mr-1" />
                              Attach
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="api-keys" className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">API Keys</h3>
                    <Button
                      size="sm"
                      onClick={() => generateApiKey(selectedAgent.id, `Key ${(selectedAgent.apiKeys?.length || 0) + 1}`)}
                      className="bg-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Generate New Key
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedAgent.apiKeys?.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{key.name}</p>
                          <p className="text-sm text-gray-500">
                            {key.keyPrefix}... | Used {key.usageCount} times
                            {key.lastUsedAt && ` | Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge className={key.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {key.isActive ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="embed" className="mt-6 space-y-4">
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">How to Embed Your Agent</h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">1</div>
                        <div>
                          <p className="font-medium text-white">Get Your API Key</p>
                          <p className="text-sm text-gray-400">Copy your API key from the API Keys tab above</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">2</div>
                        <div>
                          <p className="font-medium text-white">Add the Widget Script</p>
                          <p className="text-sm text-gray-400">Copy and paste this code before &lt;/body&gt; on your website:</p>
                          <pre className="mt-2 p-4 bg-slate-900 rounded text-sm text-green-400 overflow-x-auto">
{`<!-- SmartPromptIQ Chat Widget -->
<script
  src="https://smartpromptiq.com/widget.js"
  data-api-key="YOUR_API_KEY_HERE"
  data-agent="${selectedAgent.slug}"
  data-theme="${selectedAgent.theme}"
  data-position="${selectedAgent.position}"
  data-primary-color="${selectedAgent.primaryColor}"
></script>`}
                          </pre>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => copyToClipboard(
                              `<!-- SmartPromptIQ Chat Widget -->\n<script\n  src="https://smartpromptiq.com/widget.js"\n  data-api-key="YOUR_API_KEY_HERE"\n  data-agent="${selectedAgent.slug}"\n  data-theme="${selectedAgent.theme}"\n  data-position="${selectedAgent.position}"\n  data-primary-color="${selectedAgent.primaryColor}"\n></script>`,
                              'Embed Code'
                            )}
                          >
                            {copiedKey === 'Embed Code' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            Copy Code
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">3</div>
                        <div>
                          <p className="font-medium text-white">Replace YOUR_API_KEY_HERE</p>
                          <p className="text-sm text-gray-400">Replace the placeholder with your actual API key</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                        <div>
                          <p className="font-medium text-white">Done!</p>
                          <p className="text-sm text-gray-400">The chat widget will appear on your website</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Plus className="w-6 h-6 text-purple-400" />
                  Create New Agent
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Basic Information</h3>

                  <div>
                    <Label className="text-gray-300">Agent Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value)
                        });
                      }}
                      placeholder="e.g., Customer Support Agent"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Slug *</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                      placeholder="e.g., customer-support"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens only)</p>
                  </div>

                  <div>
                    <Label className="text-gray-300">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of what this agent does..."
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">System Prompt *</Label>
                    <Textarea
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      placeholder="You are a helpful customer support agent..."
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Define your agent's personality, knowledge, and behavior</p>
                  </div>

                  <div>
                    <Label className="text-gray-300">Welcome Message</Label>
                    <Input
                      value={formData.welcomeMessage}
                      onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                      placeholder="Hi! How can I help you today?"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                {/* Model Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Model Settings</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Provider</Label>
                      <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                          <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <Select value={formData.model} onValueChange={(v) => setFormData({ ...formData, model: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.provider === 'anthropic' ? (
                            <>
                              <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku (Fast)</SelectItem>
                              <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet (Balanced)</SelectItem>
                              <SelectItem value="claude-3-opus-20240229">Claude 3 Opus (Powerful)</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</SelectItem>
                              <SelectItem value="gpt-4">GPT-4 (Powerful)</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Latest)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Widget Appearance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Widget Appearance</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Theme</Label>
                      <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (System)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Position</Label>
                      <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-12 h-10 p-1 bg-slate-800 border-slate-700"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1 bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={createAgent}
                  disabled={!formData.name || !formData.slug || !formData.systemPrompt}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Embed Code Modal */}
        {showEmbedCode && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowEmbedCode(false)}>
            <div className="bg-slate-900 rounded-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Embed Code
                </h2>
              </div>
              <div className="p-6">
                <pre className="p-4 bg-slate-800 rounded-lg text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
                  {embedCode}
                </pre>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => copyToClipboard(embedCode, 'Embed Code')} className="bg-purple-600">
                    {copiedKey === 'Embed Code' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    Copy Code
                  </Button>
                  <Button variant="outline" onClick={() => setShowEmbedCode(false)} className="border-slate-700">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">1</div>
              <div>
                <h3 className="font-semibold text-white">Create an Agent</h3>
                <p className="text-sm text-gray-400">Define your agent's personality, knowledge base, and behavior with a system prompt</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">2</div>
              <div>
                <h3 className="font-semibold text-white">Get Your API Key</h3>
                <p className="text-sm text-gray-400">Secure API key to authenticate your widget and track usage</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">3</div>
              <div>
                <h3 className="font-semibold text-white">Embed on Your Site</h3>
                <p className="text-sm text-gray-400">Add a single script tag to your website and the chat widget appears</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button onClick={() => navigate('/builderiq/agents')} variant="outline" className="border-slate-700">
              <Bot className="w-4 h-4 mr-2" />
              Browse Agent Templates
            </Button>
            <Button onClick={() => window.open('https://smartpromptiq.com/docs/agents', '_blank')} variant="outline" className="border-slate-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
