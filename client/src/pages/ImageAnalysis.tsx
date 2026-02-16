import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import { useAnalyzeImage, useVisionAnalyses, AnalyzeResponse } from '@/hooks/useVision';
import {
  Eye,
  Upload,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Clock,
  Coins,
  Bot,
  Trash2,
  Image as ImageIcon,
  X,
} from 'lucide-react';

// ============================================
// IMAGE ANALYSIS PAGE
// ============================================

export default function ImageAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [copied, setCopied] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalyzeResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const analyzeMutation = useAnalyzeImage();
  const { data: historyData } = useVisionAnalyses();

  const handleFileSelect = useCallback((file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Unsupported format', description: 'Use JPEG, PNG, GIF, or WebP', variant: 'destructive' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 20 MB', variant: 'destructive' });
      return;
    }

    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      // Extract base64 without the data:mime;base64, prefix
      const base64 = dataUrl.split(',')[1];
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const clearImage = () => {
    setImagePreview(null);
    setImageData(null);
    setMimeType('');
    setFileName('');
    setCurrentResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (!imageData || !mimeType) {
      toast({ title: 'No image', description: 'Upload an image first', variant: 'destructive' });
      return;
    }
    const analysisPrompt = prompt.trim() || 'Describe this image in detail. What do you see?';

    analyzeMutation.mutate(
      {
        imageData,
        mimeType,
        prompt: analysisPrompt,
        fileName,
        ...(selectedProvider !== 'auto' && { provider: selectedProvider }),
      },
      {
        onSuccess: (data) => {
          setCurrentResult(data);
          toast({ title: 'Analysis complete' });
        },
        onError: (error) => {
          toast({ title: 'Analysis failed', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const copyAnalysis = async () => {
    if (!currentResult) return;
    await navigator.clipboard.writeText(currentResult.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard' });
  };

  const providers = [
    { id: 'auto', label: 'Auto', desc: 'Best available (Gemini preferred)' },
    { id: 'openai', label: 'GPT-4o', desc: 'OpenAI Vision' },
    { id: 'anthropic', label: 'Claude', desc: 'Anthropic Vision' },
    { id: 'gemini', label: 'Gemini', desc: 'Google Vision' },
  ];

  const suggestions = [
    'Describe this image in detail',
    'What text or writing is visible?',
    'Identify objects and their positions',
    'What emotions or mood does this convey?',
    'Extract any data, charts, or numbers',
    'Is there anything unusual in this image?',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <BackButton />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Image Analysis</h2>
            <p className="text-slate-600 text-lg">
              Upload any image and let AI analyze, describe, and extract information
            </p>
          </div>

          {/* Upload + Prompt Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            {/* Image Upload Area */}
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6 ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700 font-medium mb-1">
                  Drop an image here or click to upload
                </p>
                <p className="text-sm text-slate-400">JPEG, PNG, GIF, WebP — up to 20 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative mb-6">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={imagePreview}
                    alt="Uploaded"
                    className="max-h-80 w-full object-contain"
                  />
                </div>
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-slate-500 mt-2 text-center">{fileName}</p>
              </div>
            )}

            {/* Analysis Prompt */}
            <div className="mb-4">
              <textarea
                placeholder="What would you like to know about this image? (Optional — defaults to general description)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 placeholder-slate-400 resize-none transition-all"
              />
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 rounded-lg text-xs transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Options Row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">AI:</span>
                <div className="flex gap-1">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProvider(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedProvider === p.id
                          ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={p.desc}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs text-slate-400">3 tokens per analysis</span>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!imageData || analyzeMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Image
                </>
              )}
            </button>
          </div>

          {/* Analysis Result */}
          {currentResult && !analyzeMutation.isPending && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">AI Analysis</span>
                <span className="text-slate-500 text-xs ml-auto">
                  {currentResult.provider === 'openai' ? 'GPT-4o' : currentResult.provider === 'anthropic' ? 'Claude' : currentResult.provider === 'gemini' ? 'Gemini' : currentResult.model}
                </span>
              </div>

              <div className="prose prose-invert prose-sm max-w-none mb-6">
                {currentResult.analysis.split('\n').map((paragraph, i) => {
                  if (!paragraph.trim()) return null;
                  // Handle markdown headers
                  if (paragraph.startsWith('##')) {
                    return <h3 key={i} className="text-lg font-semibold text-white mt-4 mb-2">{paragraph.replace(/^#+\s*/, '')}</h3>;
                  }
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return <li key={i} className="text-slate-200 ml-4">{paragraph.replace(/^[-*]\s*/, '')}</li>;
                  }
                  return <p key={i} className="text-slate-200 leading-relaxed mb-3">{paragraph}</p>;
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700">
                <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Coins className="w-3.5 h-3.5" />
                  {currentResult.tokensUsed} tokens
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                  {currentResult.usage.total_tokens} API tokens
                </span>
                <button
                  onClick={copyAnalysis}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {analyzeMutation.isPending && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <p className="text-slate-600 text-lg font-medium">Analyzing image...</p>
              <p className="text-slate-400 text-sm mt-1">AI is studying your image</p>
            </div>
          )}

          {/* History */}
          {historyData && historyData.analyses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Analysis History
              </h3>
              <div className="space-y-3">
                {historyData.analyses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.prompt}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.response.slice(0, 150)}...</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">{item.model}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State (no image loaded and no history) */}
          {!imagePreview && !currentResult && (!historyData || historyData.analyses.length === 0) && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100/50 mb-6">
                <Eye className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">AI-Powered Image Analysis</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Upload any image — screenshots, photos, diagrams, charts, documents — and ask questions about it. Works with GPT-4o, Claude, and Gemini.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
