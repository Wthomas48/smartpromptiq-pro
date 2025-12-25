import { useState, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Play,
  Copy,
  Check,
  Sparkles,
  Zap,
  Settings2,
  History,
  Save,
  Share2,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Cpu,
  DollarSign,
  Clock,
  BarChart3,
  Wand2,
  Lightbulb,
  ArrowRight,
  Star,
  MessageSquare,
  ArrowLeft,
  Home,
  Rocket,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// AI Model configurations
const AI_MODELS = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    icon: '🧠',
    color: 'from-green-500 to-emerald-600',
    costPer1k: 0.03,
    speed: 'Medium',
    quality: 'Excellent',
    bestFor: 'Complex reasoning, coding, analysis'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-600',
    costPer1k: 0.002,
    speed: 'Fast',
    quality: 'Good',
    bestFor: 'Quick tasks, chat, simple queries'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    icon: '🎭',
    color: 'from-orange-500 to-amber-600',
    costPer1k: 0.015,
    speed: 'Medium',
    quality: 'Excellent',
    bestFor: 'Long-form content, nuanced responses'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    icon: '📝',
    color: 'from-purple-500 to-violet-600',
    costPer1k: 0.003,
    speed: 'Fast',
    quality: 'Very Good',
    bestFor: 'Balanced speed and quality'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    icon: '💎',
    color: 'from-red-500 to-pink-600',
    costPer1k: 0.001,
    speed: 'Fast',
    quality: 'Good',
    bestFor: 'Multimodal, Google integration'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    icon: '🦙',
    color: 'from-indigo-500 to-blue-600',
    costPer1k: 0.0008,
    speed: 'Fast',
    quality: 'Good',
    bestFor: 'Open source, privacy-focused'
  },
];

// Prompt templates for quick start
const PROMPT_TEMPLATES = [
  {
    id: 'business',
    name: 'Business Strategy',
    icon: '📊',
    template: 'Act as a business strategist. Analyze the following business idea and provide:\n1. SWOT Analysis\n2. Target market identification\n3. Revenue model suggestions\n4. Go-to-market strategy\n\nBusiness idea: [YOUR IDEA HERE]'
  },
  {
    id: 'code',
    name: 'Code Generation',
    icon: '💻',
    template: 'You are an expert software developer. Write clean, well-documented code for:\n\n[DESCRIBE YOUR REQUIREMENTS]\n\nTech stack: [SPECIFY TECHNOLOGIES]\n\nInclude:\n- Error handling\n- Comments\n- Best practices'
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    icon: '✍️',
    template: 'You are a creative writing expert. Create compelling content with:\n\nTone: [casual/professional/humorous]\nAudience: [target audience]\nFormat: [blog/social/email]\n\nTopic: [YOUR TOPIC]'
  },
  {
    id: 'marketing',
    name: 'Marketing Copy',
    icon: '📢',
    template: 'Act as a marketing copywriter. Create persuasive copy for:\n\nProduct/Service: [DESCRIPTION]\nUSP: [Unique selling point]\nCTA: [Desired action]\n\nInclude: Headlines, body copy, and call-to-action variations.'
  },
];

// Simulated AI response (in production, this would call actual APIs)
const simulateAIResponse = async (prompt: string, model: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const safePrompt = prompt || '';
  const responses: Record<string, string> = {
    'gpt-4': `**GPT-4 Analysis:**\n\nBased on your prompt, here's a comprehensive response:\n\n1. **Key Insights:** Your request shows clear intent for ${safePrompt.length > 50 ? 'detailed analysis' : 'quick information'}.\n\n2. **Recommendations:**\n   - Consider breaking down complex tasks\n   - Use specific examples for better results\n   - Iterate on the output for refinement\n\n3. **Next Steps:** I can help you expand on any of these points. Just ask!\n\n*Token usage: ~${Math.floor(safePrompt.length / 4)} input, ~150 output*`,

    'gpt-3.5-turbo': `Here's a quick response to your query:\n\n${safePrompt.slice(0, 100)}...\n\nI've analyzed your request and here are the key points:\n• Fast processing completed\n• Main concepts identified\n• Ready for follow-up questions\n\nNeed more detail? Just ask!`,

    'claude-3-opus': `I've carefully considered your request. Here's my thoughtful analysis:\n\n**Understanding Your Needs:**\nYour prompt indicates you're looking for ${safePrompt.includes('business') ? 'business insights' : safePrompt.includes('code') ? 'technical solutions' : 'creative assistance'}.\n\n**My Approach:**\nI'll provide a nuanced, comprehensive response that considers multiple perspectives.\n\n**Key Considerations:**\n1. Context matters - I've considered the broader implications\n2. Quality over speed - Taking time to think deeply\n3. Actionable insights - Practical next steps included\n\n**Conclusion:**\nThis is a starting point for deeper exploration. I'm happy to dive deeper into any aspect.`,

    'claude-3-sonnet': `Here's a balanced response:\n\n**Quick Summary:**\n${safePrompt.slice(0, 80)}...\n\n**Analysis:**\n- Identified main request\n- Processed context\n- Generated relevant response\n\n**Output:**\nYour request has been processed efficiently. I've balanced speed with quality to give you useful results quickly.\n\nWant me to elaborate on any point?`,

    'gemini-pro': `🔍 **Gemini Analysis:**\n\nI've processed your request using Google's latest AI capabilities.\n\n**Findings:**\n• Query type: ${safePrompt.length > 100 ? 'Complex' : 'Standard'}\n• Confidence: High\n• Related topics identified\n\n**Response:**\nBased on my analysis, here are actionable insights tailored to your needs.\n\n**Pro Tip:** Try adding more context for even better results!`,

    'llama-3-70b': `**Open Source AI Response:**\n\nProcessed with Llama 3 70B:\n\n> ${safePrompt.slice(0, 60)}...\n\n**Results:**\n- Analysis complete\n- Privacy-focused processing\n- No data retention\n\n**Output:**\nHere's what I found based on your query. As an open-source model, I prioritize transparency and user privacy.\n\n*Community-driven AI at your service!*`,
  };

  return responses[model] || responses['gpt-4'];
};

export default function PromptPlayground() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4']);
  const [responses, setResponses] = useState<Record<string, { text: string; time: number; tokens: number }>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId]
    );
  };

  const runPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Enter a prompt',
        description: 'Please enter a prompt to test',
        variant: 'destructive',
      });
      return;
    }

    if (selectedModels.length === 0) {
      toast({
        title: 'Select a model',
        description: 'Please select at least one AI model',
        variant: 'destructive',
      });
      return;
    }

    // Add to history
    setPromptHistory(prev => [prompt, ...prev.slice(0, 9)]);

    // Run all selected models
    for (const modelId of selectedModels) {
      setIsLoading(prev => ({ ...prev, [modelId]: true }));

      const startTime = Date.now();
      try {
        const response = await simulateAIResponse(prompt, modelId);
        const endTime = Date.now();

        setResponses(prev => ({
          ...prev,
          [modelId]: {
            text: response,
            time: endTime - startTime,
            tokens: Math.floor(response.length / 4),
          }
        }));
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to get response from ${modelId}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(prev => ({ ...prev, [modelId]: false }));
      }
    }
  };

  const copyToClipboard = async (text: string, modelId: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(modelId);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied!',
      description: 'Response copied to clipboard',
    });
  };

  const applyTemplate = (template: string) => {
    setPrompt(template);
    toast({
      title: 'Template applied',
      description: 'Edit the placeholders to customize your prompt',
    });
  };

  const calculateEstimatedCost = () => {
    const inputTokens = Math.floor(prompt.length / 4);
    let totalCost = 0;

    selectedModels.forEach(modelId => {
      const model = AI_MODELS.find(m => m.id === modelId);
      if (model) {
        totalCost += (inputTokens / 1000) * model.costPer1k * 2; // Input + estimated output
      }
    });

    return totalCost.toFixed(4);
  };

  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      {/* Header with Back Navigation */}
      <div className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Breadcrumb & Back Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-purple-400">
                  <Home className="w-4 h-4" />
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white font-medium">Playground</span>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/app-builders">
                <Button variant="outline" size="sm" className="border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-purple-400">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  App Builders
                </Button>
              </Link>
              <Link href="/deployment-hub">
                <Button variant="outline" size="sm" className="border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-purple-400">
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Hub
                </Button>
              </Link>
            </div>
          </div>

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Prompt Playground
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Test, compare, and refine prompts across AI models</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white">
                <Settings2 className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-600 dark:to-pink-600 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Prompt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Prompt Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Templates */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Quick Start Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PROMPT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.template)}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all text-left group"
                    >
                      <span className="text-2xl">{template.icon}</span>
                      <p className="text-sm text-white mt-2 font-medium">{template.name}</p>
                      <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">Click to use</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    Your Prompt
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{prompt.length} characters</span>
                    <span>|</span>
                    <span>~{Math.floor(prompt.length / 4)} tokens</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here... Be specific and detailed for best results."
                  className="min-h-[200px] bg-black/30 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>Est. cost: ${calculateEstimatedCost()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Cpu className="w-4 h-4" />
                      <span>{selectedModels.length} model(s) selected</span>
                    </div>
                  </div>

                  <Button
                    onClick={runPrompt}
                    disabled={Object.values(isLoading).some(v => v)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {Object.values(isLoading).some(v => v) ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Prompt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            {showSettings && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-400">Temperature</label>
                      <span className="text-sm text-white">{temperature[0]}</span>
                    </div>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Higher = more creative, Lower = more focused</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-400">Max Tokens</label>
                      <span className="text-sm text-white">{maxTokens[0]}</span>
                    </div>
                    <Slider
                      value={maxTokens}
                      onValueChange={setMaxTokens}
                      max={4000}
                      step={100}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Maximum length of the response</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responses */}
            {Object.keys(responses).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Responses
                </h3>

                <div className="grid gap-4">
                  {selectedModels.map((modelId) => {
                    const model = AI_MODELS.find(m => m.id === modelId);
                    const response = responses[modelId];
                    const loading = isLoading[modelId];

                    if (!model) return null;

                    return (
                      <Card key={modelId} className="bg-white/5 border-white/10 overflow-hidden">
                        <div className={`h-1 bg-gradient-to-r ${model.color}`} />
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{model.icon}</span>
                              <div>
                                <CardTitle className="text-lg text-white">{model.name}</CardTitle>
                                <p className="text-xs text-gray-400">{model.provider}</p>
                              </div>
                            </div>
                            {response && (
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {(response.time / 1000).toFixed(2)}s
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="w-4 h-4" />
                                  {response.tokens} tokens
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(response.text, modelId)}
                                >
                                  {copied === modelId ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {loading ? (
                            <div className="flex items-center justify-center py-8">
                              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                              <span className="ml-3 text-gray-400">Generating response...</span>
                            </div>
                          ) : response ? (
                            <div className="prose prose-invert max-w-none">
                              <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-black/30 p-4 rounded-lg">
                                {response.text}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">Run the prompt to see results</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Model Selection */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  Select AI Models
                </CardTitle>
                <p className="text-sm text-gray-400">Compare responses across models</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedModels.includes(model.id)
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{model.icon}</span>
                        <span className="font-medium text-white">{model.name}</span>
                      </div>
                      {selectedModels.includes(model.id) && (
                        <Check className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Badge variant="outline" className="text-xs">
                        {model.speed}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ${model.costPer1k}/1K
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{model.bestFor}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Export to App Builders */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  Ready to Build?
                </CardTitle>
                <p className="text-sm text-gray-400">Export your prompt to app builders</p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => window.location.href = '/deployment-hub'}
                >
                  Go to Deployment Hub
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Prompt History */}
            {promptHistory.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <History className="w-5 h-5 text-gray-400" />
                    Recent Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(promptHistory || []).slice(0, 5).map((historyPrompt, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(historyPrompt)}
                      className="w-full p-2 rounded bg-white/5 hover:bg-white/10 text-left text-sm text-gray-400 truncate"
                    >
                      {(historyPrompt || '').slice(0, 50)}...
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
