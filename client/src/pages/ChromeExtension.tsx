import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Chrome,
  Zap,
  MousePointer2,
  Keyboard,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  MessageSquare,
  Code,
  FileText,
  Lightbulb,
  Home,
  Play
} from 'lucide-react';

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
            Download the SmartPromptIQ Chrome Extension and start generating better prompts today.
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
          <p>© 2025 SmartPromptIQ™ — The Intelligent Prompt Engineering Platform</p>
        </div>
      </footer>
    </div>
  );
}
