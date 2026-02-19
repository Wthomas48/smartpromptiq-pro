import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import { useSearchSynthesize, SynthesizedSearchResponse } from '@/hooks/useWebSearch';
import {
  Globe,
  Search,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Clock,
  Coins,
  Zap,
  Bot,
  ChevronDown,
} from 'lucide-react';

// ============================================
// WEB SEARCH PAGE
// ============================================

export default function WebSearch() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auth guard — redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/signin');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDepth, setSearchDepth] = useState<'basic' | 'advanced'>('basic');
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [copied, setCopied] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SynthesizedSearchResponse[]>([]);
  const [currentResult, setCurrentResult] = useState<SynthesizedSearchResponse | null>(null);

  const synthesizeMutation = useSearchSynthesize();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      toast({ title: 'Query too short', description: 'Enter at least 2 characters', variant: 'destructive' });
      return;
    }

    synthesizeMutation.mutate(
      {
        query,
        searchDepth,
        maxResults: searchDepth === 'advanced' ? 8 : 5,
        ...(selectedProvider !== 'auto' && { provider: selectedProvider }),
      },
      {
        onSuccess: (data) => {
          setCurrentResult(data);
          setSearchHistory((prev) => [data, ...prev.slice(0, 9)]);
        },
        onError: (error) => {
          toast({ title: 'Search Failed', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !synthesizeMutation.isPending) {
      handleSearch();
    }
  };

  const copyAnswer = async () => {
    if (!currentResult) return;
    await navigator.clipboard.writeText(currentResult.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard' });
  };

  const loadHistoryItem = (item: SynthesizedSearchResponse) => {
    setCurrentResult(item);
    setSearchQuery(item.query);
  };

  // Render citation links in answer text
  const renderAnswer = (text: string) => {
    // Replace [1], [2] etc. with styled badges
    return text.replace(/\[(\d+)\]/g, (_, num) => `**[${num}]**`);
  };

  const providers = [
    { id: 'auto', label: 'Auto', desc: 'Best available' },
    { id: 'openai', label: 'GPT-4o', desc: 'OpenAI' },
    { id: 'anthropic', label: 'Claude', desc: 'Anthropic' },
    { id: 'gemini', label: 'Gemini', desc: 'Google' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <BackButton />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Web Search</h2>
            <p className="text-slate-600 text-lg">
              Search the web and get AI-synthesized answers with source citations
            </p>
          </div>

          {/* Search Input Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            {/* Search Bar */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask anything... e.g. 'What are the latest AI trends?'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={synthesizeMutation.isPending}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 placeholder-slate-400 text-lg transition-all disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={synthesizeMutation.isPending || searchQuery.trim().length < 2}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {synthesizeMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Search
              </button>
            </div>

            {/* Options Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Depth */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Depth:</span>
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setSearchDepth('basic')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      searchDepth === 'basic'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                    Basic (3 tokens)
                  </button>
                  <button
                    onClick={() => setSearchDepth('advanced')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      searchDepth === 'advanced'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                    Deep (5 tokens)
                  </button>
                </div>
              </div>

              {/* Provider Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">AI:</span>
                <div className="flex gap-1">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProvider(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedProvider === p.id
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={p.desc}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {synthesizeMutation.isPending && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-slate-600 text-lg font-medium">Searching the web...</p>
              <p className="text-slate-400 text-sm mt-1">Finding and synthesizing the best sources</p>
            </div>
          )}

          {/* AI Answer */}
          {currentResult && !synthesizeMutation.isPending && (
            <>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-medium text-sm">AI Answer</span>
                  <span className="text-slate-500 text-xs ml-auto">
                    powered by {currentResult.provider === 'openai' ? 'GPT-4o' : currentResult.provider === 'anthropic' ? 'Claude' : currentResult.provider === 'gemini' ? 'Gemini' : currentResult.model}
                  </span>
                </div>

                {/* Answer Content */}
                <div className="prose prose-invert prose-sm max-w-none mb-6">
                  {currentResult.answer.split('\n').map((paragraph, i) => {
                    if (!paragraph.trim()) return null;
                    // Render citation numbers as badges
                    const parts = paragraph.split(/(\[\d+\])/g);
                    return (
                      <p key={i} className="text-slate-200 leading-relaxed mb-3">
                        {parts.map((part, j) => {
                          const citationMatch = part.match(/^\[(\d+)\]$/);
                          if (citationMatch) {
                            const num = parseInt(citationMatch[1]);
                            const source = currentResult.sources.find((s) => s.index === num);
                            return (
                              <a
                                key={j}
                                href={source?.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-5 h-5 rounded bg-cyan-500/30 text-cyan-300 text-xs font-bold mx-0.5 hover:bg-cyan-500/50 transition-colors cursor-pointer no-underline"
                                title={source?.title}
                              >
                                {num}
                              </a>
                            );
                          }
                          return <span key={j}>{part}</span>;
                        })}
                      </p>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {(currentResult.timeTakenMs / 1000).toFixed(1)}s
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Coins className="w-3.5 h-3.5" />
                    {currentResult.tokensUsed} tokens
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    {currentResult.sources.length} sources
                  </span>
                  <button
                    onClick={copyAnswer}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Sources */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Sources ({currentResult.sources.length})
                </h3>
                <div className="space-y-3">
                  {currentResult.sources.map((source) => (
                    <a
                      key={source.index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600 text-sm font-bold">
                        {source.index}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {source.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {source.url}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Search History */}
          {searchHistory.length > 1 && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {searchHistory.slice(1).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate flex-1">{item.query}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0">{item.sources.length} sources</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!currentResult && !synthesizeMutation.isPending && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100/50 mb-6">
                <Globe className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Search the web with AI</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Ask any question and get an AI-synthesized answer with cited sources from across the web.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'What are the latest AI trends in 2026?',
                  'Compare React vs Vue.js for enterprise apps',
                  'Best practices for API security',
                  'Latest news in tech industry',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
