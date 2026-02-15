import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Chrome,
  Zap,
  MousePointer2,
  Keyboard,
  Sparkles,
  CheckCircle,
  Copy,
  MessageSquare,
  Code,
  Home,
  Play,
  ArrowDown,
  MousePointer,
  Type,
  Send,
  Check
} from 'lucide-react';

// ============================================
// ANIMATED DEMO COMPONENT
// ============================================
function AnimatedDemo() {
  const [demoStep, setDemoStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const demoSteps = [
    { label: 'Select Text', icon: <MousePointer className="w-4 h-4" /> },
    { label: 'Right-Click', icon: <MousePointer2 className="w-4 h-4" /> },
    { label: 'Choose Action', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'AI Generates', icon: <Zap className="w-4 h-4" /> },
    { label: 'Result Ready', icon: <Check className="w-4 h-4" /> },
  ];

  const generatedPrompt = "Act as a senior marketing strategist. Analyze the following product description and create a compelling value proposition that highlights unique benefits, addresses customer pain points, and includes a clear call-to-action. Format with headers and bullet points.";

  // Cursor blink
  useEffect(() => {
    const blink = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(blink);
  }, []);

  // Auto-play demo
  const startDemo = () => {
    setIsPlaying(true);
    setDemoStep(0);
    setTypedText('');
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (demoStep < 3) {
      const timer = setTimeout(() => setDemoStep(prev => prev + 1), 1800);
      return () => clearTimeout(timer);
    }

    if (demoStep === 3) {
      // Type out the generated prompt
      let i = 0;
      setTypedText('');
      intervalRef.current = setInterval(() => {
        i++;
        setTypedText(generatedPrompt.slice(0, i));
        if (i >= generatedPrompt.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => setDemoStep(4), 600);
        }
      }, 18);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }

    if (demoStep === 4) {
      const timer = setTimeout(() => {
        setIsPlaying(false);
        setDemoStep(0);
        setTypedText('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [demoStep, isPlaying]);

  return (
    <section className="py-20 px-4" id="demo">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
            <Play className="w-3 h-3 mr-1" />
            Interactive Demo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See It In Action</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Watch how SmartPromptIQ transforms any text into a powerful AI prompt in seconds
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-10 flex-wrap">
          {demoSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 md:gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                i < demoStep ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                i === demoStep && isPlaying ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 scale-110 shadow-lg shadow-purple-500/20' :
                'bg-white/5 text-gray-500 border border-white/10'
              }`}>
                {i < demoStep ? <Check className="w-3.5 h-3.5" /> : step.icon}
                <span className="hidden md:inline">{step.label}</span>
              </div>
              {i < demoSteps.length - 1 && (
                <div className={`w-6 md:w-10 h-0.5 transition-all duration-500 ${
                  i < demoStep ? 'bg-green-500/50' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Demo Browser Window */}
        <div className="relative max-w-4xl mx-auto">
          {/* Glow effects */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 rounded-3xl blur-xl" />

          <div className="relative bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Browser Chrome */}
            <div className="bg-[#161b22] px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[#0d1117] rounded-lg px-4 py-1.5 text-sm text-gray-400 flex items-center gap-2 border border-white/5">
                  <span className="text-green-400">🔒</span>
                  <span>chatgpt.com/chat</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all duration-300 ${
                  isPlaying ? 'bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/30' : 'bg-[#21262d]'
                }`}>
                  🧠
                </div>
              </div>
            </div>

            {/* Browser Content */}
            <div className="p-6 md:p-8 min-h-[420px]">
              {/* Simulated ChatGPT Interface */}
              <div className="space-y-6">
                {/* Previous message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-[#1a1f2e] rounded-2xl rounded-tl-sm p-4 max-w-lg">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Welcome! How can I help you today? I can assist with writing, coding, analysis, and more.
                    </p>
                  </div>
                </div>

                {/* User's text with selection highlight */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-[#2f3542] rounded-2xl rounded-tr-sm p-4 max-w-lg relative">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      I need help with my{' '}
                      <span className={`transition-all duration-700 rounded px-0.5 ${
                        demoStep >= 1 && isPlaying
                          ? 'bg-blue-500/40 text-blue-200 border-b-2 border-blue-400'
                          : ''
                      }`}>
                        product marketing strategy for our new SaaS platform
                      </span>
                      . Can you help me create better prompts?
                    </p>

                    {/* Selection cursor animation */}
                    {demoStep === 0 && isPlaying && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 animate-bounce">
                        <MousePointer className="w-5 h-5 text-purple-400 drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    U
                  </div>
                </div>

                {/* Context Menu */}
                {demoStep >= 1 && demoStep < 3 && isPlaying && (
                  <div className="flex justify-end mr-12">
                    <div className="bg-[#1c2333] rounded-xl border border-white/20 shadow-2xl shadow-black/50 overflow-hidden w-64 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px]">🧠</div>
                        <span className="text-white text-xs font-semibold">SmartPromptIQ</span>
                      </div>
                      {[
                        { icon: '✨', label: 'Improve Text', active: false },
                        { icon: '🎯', label: 'Generate Prompt', active: demoStep >= 2 },
                        { icon: '💡', label: 'Explain', active: false },
                        { icon: '📋', label: 'Summarize', active: false },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-300 ${
                            item.active
                              ? 'bg-purple-500/30 text-purple-200'
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                          {item.active && (
                            <ArrowDown className="w-3 h-3 ml-auto text-purple-400 animate-pulse" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Prompt Result */}
                {demoStep >= 3 && isPlaying && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-5 relative">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs">🧠</div>
                        <span className="text-purple-300 text-xs font-semibold">SmartPromptIQ Generated</span>
                        {demoStep === 4 && (
                          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Copied to clipboard
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed font-mono">
                        {typedText}
                        {demoStep === 3 && showCursor && <span className="text-purple-400 ml-0.5">|</span>}
                      </p>
                      {demoStep === 4 && (
                        <div className="flex gap-2 mt-4">
                          <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium border border-purple-500/30 flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-medium border border-cyan-500/30 flex items-center gap-1">
                            <Send className="w-3 h-3" /> Insert into Chat
                          </button>
                          <button className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs font-medium border border-white/10 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Refine
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Play button overlay when not playing */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl">
              <button
                onClick={startDemo}
                className="group flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <span className="text-white font-semibold text-lg">Play Demo</span>
                <span className="text-gray-400 text-sm">See the extension in action</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats below demo */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
          {[
            { value: '< 3s', label: 'Generation Time' },
            { value: '10+', label: 'AI Platforms' },
            { value: '1-Click', label: 'Insert Result' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ChromeExtension() {
  const [copied, setCopied] = useState(false);

  const features = [
    {
      icon: <MousePointer2 className="w-6 h-6" />,
      title: 'Right-Click Context Menu',
      description: 'Select any text on the web, right-click, and choose from Improve, Explain, Summarize, or Generate Prompt actions.'
    },
    {
      icon: <Keyboard className="w-6 h-6" />,
      title: 'Lightning-Fast Shortcuts',
      description: 'Ctrl+Shift+P opens the popup instantly. Ctrl+Shift+G toggles the floating panel on AI chat pages.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '10+ AI Platforms Supported',
      description: 'Works on ChatGPT, Claude, Gemini, Copilot, Poe, Perplexity, You.com and more. Auto-detects the platform and inserts prompts directly.'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Smart Quick Actions',
      description: 'One-click actions to improve text, explain concepts, summarize content, or get code help - contextually aware of your selection.'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Auto-Sync Authentication',
      description: 'Sign in once on smartpromptiq.com and the extension automatically syncs. Your prompts, tokens, and settings sync everywhere.'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Offline Demo Mode',
      description: 'Even without internet, the extension provides demo prompts so you can keep working. Full features when connected.'
    }
  ];

  const quickActions = [
    { icon: '✨', label: 'Improve Text', description: 'Make your writing clearer and more professional' },
    { icon: '💡', label: 'Explain', description: 'Get simple explanations for complex topics' },
    { icon: '📋', label: 'Summarize', description: 'Condense long content into key points' },
    { icon: '💻', label: 'Code Help', description: 'Get coding assistance and solutions' }
  ];

  const steps = [
    {
      step: 1,
      title: 'Get Notified',
      description: 'Sign up to be notified when the extension is approved and available on the Chrome Web Store'
    },
    {
      step: 2,
      title: 'One-Click Install',
      description: 'Once available, simply click "Add to Chrome" on the Chrome Web Store to install instantly'
    },
    {
      step: 3,
      title: 'Auto-Connect Your Account',
      description: 'Sign in on smartpromptiq.com - the extension automatically syncs your authentication. No manual login needed!'
    },
    {
      step: 4,
      title: 'Start Generating Everywhere',
      description: 'Visit ChatGPT, Claude, Gemini or any supported platform. Use keyboard shortcuts, right-click context menu, or the floating button to generate prompts!'
    }
  ];

  const handleCopyShortcut = (shortcut: string) => {
    navigator.clipboard.writeText(shortcut);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-white font-medium">Chrome Extension</span>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Coming Soon
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full px-6 py-3 mb-8">
            <Chrome className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">SmartPromptIQ Extension</span>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              In Review
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Generate AI Prompts
            </span>
            <br />
            <span className="text-white">Anywhere on the Web</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Highlight text, right-click, and instantly generate powerful AI prompts.
            Works seamlessly with ChatGPT, Claude, Gemini, and more.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Notified When Available
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 px-8 py-6 text-lg"
              onClick={scrollToDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-purple-400">Under Chrome Web Store Review</span>
            </span>
            <span>|</span>
            <span>Manifest V3</span>
            <span>|</span>
            <span className="text-green-400">Free Forever</span>
          </div>
        </div>
      </section>

      {/* ANIMATED DEMO */}
      <AnimatedDemo />

      {/* Extension Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Popup Preview */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />

                <div className="relative bg-[#0f0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-[380px] mx-auto">
                  {/* Popup Header */}
                  <div className="bg-[#1a1a2e] p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-xl">
                        🧠
                      </div>
                      <div>
                        <h3 className="text-white font-bold">SmartPromptIQ</h3>
                        <span className="text-green-400 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          Connected
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-[#252542] rounded-lg flex items-center justify-center text-gray-400">
                      ⚙️
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl p-4 text-center">
                        <span className="text-2xl">✨</span>
                        <p className="text-white text-sm font-semibold mt-1">Generate</p>
                      </div>
                      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4 text-center">
                        <span className="text-2xl">📚</span>
                        <p className="text-white text-sm font-semibold mt-1">Library</p>
                      </div>
                    </div>

                    {/* Categories */}
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Category</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['📣 Marketing', '💻 Dev', '✍️ Writing'].map((cat, i) => (
                        <div
                          key={i}
                          className={`py-2 px-3 rounded-lg text-xs text-center ${
                            i === 0 ? 'bg-purple-500/20 border border-purple-500 text-purple-300' : 'bg-[#1a1a2e] border border-white/10 text-gray-400'
                          }`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>

                    {/* Generate Button */}
                    <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-white font-bold flex items-center justify-center gap-2">
                      🚀 Generate AI Prompt
                    </button>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Your AI Prompt Assistant
                </h2>
                <p className="text-gray-400 mb-8">
                  Access your SmartPromptIQ prompts and templates directly from any webpage.
                  Generate, improve, and insert prompts without leaving your current tab.
                </p>

                <div className="space-y-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <h4 className="text-white font-semibold">{action.label}</h4>
                        <p className="text-gray-400 text-sm">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Everything you need to supercharge your AI workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-white/10 hover:border-purple-500/50 transition-all hover:transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl text-purple-400 w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-3xl border border-purple-500/30 p-8 md:p-12">
            <div className="text-center mb-8">
              <Keyboard className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Keyboard Shortcuts</h2>
              <p className="text-gray-400">Work faster with these shortcuts</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div
                onClick={() => handleCopyShortcut('Ctrl+Shift+P')}
                className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10 cursor-pointer hover:border-purple-500/50 transition-all"
              >
                <div>
                  <p className="text-white font-semibold">Open Extension Popup</p>
                  <p className="text-gray-500 text-sm">Quick access to all features</p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-3 py-1 bg-slate-800 rounded-lg text-purple-300 font-mono text-sm border border-white/10">
                    Ctrl+Shift+P
                  </kbd>
                  <Copy className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div
                onClick={() => handleCopyShortcut('Ctrl+Shift+G')}
                className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10 cursor-pointer hover:border-purple-500/50 transition-all"
              >
                <div>
                  <p className="text-white font-semibold">Quick Generate</p>
                  <p className="text-gray-500 text-sm">Toggle floating panel</p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-3 py-1 bg-slate-800 rounded-lg text-purple-300 font-mono text-sm border border-white/10">
                    Ctrl+Shift+G
                  </kbd>
                  <Copy className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            {copied && (
              <p className="text-center text-green-400 text-sm mt-4">Copied to clipboard!</p>
            )}
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How to Install</h2>
            <p className="text-gray-400">Get started in minutes</p>
          </div>

          <div className="space-y-6">
            {steps.map((item, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Works With All Major AI Platforms</h2>
          <p className="text-gray-400 mb-8">One extension for all your AI conversations</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'ChatGPT', icon: '🤖', color: 'from-green-500 to-emerald-600' },
              { name: 'Claude', icon: '🟠', color: 'from-orange-500 to-amber-600' },
              { name: 'Gemini', icon: '✨', color: 'from-blue-500 to-indigo-600' },
              { name: 'Microsoft Copilot', icon: '🔵', color: 'from-cyan-500 to-blue-600' },
              { name: 'Poe', icon: '💬', color: 'from-purple-500 to-violet-600' },
              { name: 'Perplexity', icon: '🔍', color: 'from-teal-500 to-cyan-600' },
              { name: 'You.com', icon: '🌐', color: 'from-pink-500 to-rose-600' }
            ].map((platform, index) => (
              <div
                key={index}
                className={`px-5 py-3 bg-gradient-to-r ${platform.color} rounded-full text-white font-semibold flex items-center gap-2 shadow-lg`}
              >
                <span>{platform.icon}</span>
                {platform.name}
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-6">...and more platforms coming soon!</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Supercharge Your AI Workflow?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Get notified when the SmartPromptIQ Chrome Extension launches and start generating better prompts everywhere.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-10 py-6 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Notified - It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2025 SmartPromptIQ&trade; — The Intelligent Prompt Engineering Platform</p>
        </div>
      </footer>
    </div>
  );
}
