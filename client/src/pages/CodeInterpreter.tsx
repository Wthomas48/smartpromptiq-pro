import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import { useLanguages, useExecuteCode, ExecutionOutput } from '@/hooks/useCodeExecution';
import {
  Play,
  Code2,
  Loader2,
  Copy,
  Check,
  Terminal,
  Coins,
  ChevronDown,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

// ============================================
// CODE INTERPRETER PAGE
// ============================================

export default function CodeInterpreter() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Auth guard — redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/signin');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // State
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionOutput | null>(null);

  const { data: langData } = useLanguages();
  const executeMutation = useExecuteCode();

  // Load default template when language changes
  useEffect(() => {
    if (langData?.templates && langData.templates[selectedLanguage]) {
      setCode(langData.templates[selectedLanguage]);
      setExecutionResult(null);
    }
  }, [selectedLanguage, langData]);

  const handleRun = () => {
    if (!code.trim()) {
      toast({ title: 'No code', description: 'Write some code first', variant: 'destructive' });
      return;
    }

    executeMutation.mutate(
      { language: selectedLanguage, code, ...(stdin && { stdin }) },
      {
        onSuccess: (data) => {
          setExecutionResult(data);
        },
        onError: (error) => {
          toast({ title: 'Execution Failed', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const copyOutput = async () => {
    if (!executionResult) return;
    const output = executionResult.run.output || executionResult.run.stdout || executionResult.run.stderr;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLang = langData?.languages?.find((l) => l.id === selectedLanguage);
  const hasError = executionResult && (executionResult.run.exitCode !== 0 || executionResult.run.stderr);
  const hasCompileError = executionResult?.compile && executionResult.compile.exitCode !== 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <section className="py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <BackButton />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg mb-4">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Code Interpreter</h2>
            <p className="text-slate-600 text-lg">
              Write, run, and test code in 15+ languages — sandboxed and secure
            </p>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
              >
                <span>{currentLang?.icon || '🖥️'}</span>
                <span>{currentLang?.label || selectedLanguage}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 w-56 max-h-80 overflow-y-auto">
                  {(langData?.languages || []).map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                        selectedLanguage === lang.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span className="font-medium">{lang.label}</span>
                      <span className="text-xs text-slate-400 ml-auto">{lang.version}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stdin Toggle */}
            <button
              onClick={() => setShowStdin(!showStdin)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                showStdin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
              stdin
            </button>

            {/* Clear */}
            <button
              onClick={() => { setCode(''); setExecutionResult(null); }}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
              Clear
            </button>

            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">1 token per run</span>

            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={executeMutation.isPending || !code.trim()}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium text-sm hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
            >
              {executeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run
            </button>
          </div>

          {/* Code Editor */}
          <div className="bg-slate-900 border-x border-slate-200">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder="// Write your code here..."
              className="w-full min-h-[300px] bg-transparent text-green-400 font-mono text-sm p-4 outline-none resize-y placeholder-slate-600"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Stdin Input */}
          {showStdin && (
            <div className="bg-slate-800 border-x border-slate-200 px-4 py-3">
              <label className="text-xs text-slate-400 font-medium mb-1 block">Standard Input (stdin)</label>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Input data for your program..."
                rows={2}
                className="w-full bg-slate-700 text-slate-200 font-mono text-sm p-3 rounded-lg outline-none resize-y placeholder-slate-500"
              />
            </div>
          )}

          {/* Output */}
          <div className="bg-slate-950 rounded-b-2xl border border-t-0 border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400 font-medium">Output</span>
                {executionResult && (
                  <>
                    <span className="text-xs text-slate-500">
                      {executionResult.language} {executionResult.version}
                    </span>
                    {executionResult.run.exitCode !== null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          executionResult.run.exitCode === 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        exit: {executionResult.run.exitCode}
                      </span>
                    )}
                  </>
                )}
              </div>
              {executionResult && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Coins className="w-3 h-3" />
                    {executionResult.tokensUsed} token
                  </span>
                  <button
                    onClick={copyOutput}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 min-h-[120px] max-h-[400px] overflow-y-auto">
              {executeMutation.isPending ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Running...</span>
                </div>
              ) : executionResult ? (
                <>
                  {/* Compile errors */}
                  {hasCompileError && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 text-red-400 text-xs mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Compilation Error
                      </div>
                      <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                        {executionResult.compile!.stderr || executionResult.compile!.output}
                      </pre>
                    </div>
                  )}

                  {/* Stdout */}
                  {executionResult.run.stdout && (
                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                      {executionResult.run.stdout}
                    </pre>
                  )}

                  {/* Stderr */}
                  {executionResult.run.stderr && (
                    <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap mt-2">
                      {executionResult.run.stderr}
                    </pre>
                  )}

                  {/* No output */}
                  {!executionResult.run.stdout && !executionResult.run.stderr && !hasCompileError && (
                    <span className="text-slate-500 text-sm italic">Program finished with no output</span>
                  )}
                </>
              ) : (
                <span className="text-slate-600 text-sm italic">
                  Press Run or Ctrl+Enter to execute your code
                </span>
              )}
            </div>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 font-mono text-[10px]">Ctrl</kbd>
              {' + '}
              <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 font-mono text-[10px]">Enter</kbd>
              {' to run  ·  '}
              <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 font-mono text-[10px]">Tab</kbd>
              {' for indent  ·  15+ languages supported'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
