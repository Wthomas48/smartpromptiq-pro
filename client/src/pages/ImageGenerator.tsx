import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, getApiBaseUrl } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import {
  Image as ImageIcon,
  Download,
  Trash2,
  Loader2,
  Sparkles,
  Wand2,
  Settings2,
  Clock,
  Coins,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ZoomIn,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  model: string;
  size: string;
  quality: string;
  style: string;
  revisedPrompt?: string;
  tokensUsed: number;
  createdAt: string;
}

interface GenerateResponse {
  success: boolean;
  imageUrl: string;
  revisedPrompt: string;
  model: string;
  size: string;
  quality: string;
  style: string;
  tokensUsed: number;
  apiCost: number;
  generationId: string;
  error?: string;
}

// ============================================
// STYLE PRESETS
// ============================================

const STYLE_PRESETS = [
  { id: 'none', label: 'None', suffix: '', icon: '✏️' },
  { id: 'photorealistic', label: 'Photo', suffix: ', ultra realistic photograph, 8k, highly detailed photography, natural lighting', icon: '📷' },
  { id: 'digital-art', label: 'Digital Art', suffix: ', digital art, vibrant colors, detailed illustration, trending on artstation', icon: '🎨' },
  { id: 'anime', label: 'Anime', suffix: ', anime style, manga illustration, cel shaded, studio ghibli inspired', icon: '🌸' },
  { id: '3d-render', label: '3D Render', suffix: ', 3D render, octane render, cinema 4d, unreal engine, photorealistic 3d', icon: '🧊' },
  { id: 'watercolor', label: 'Watercolor', suffix: ', watercolor painting, soft edges, artistic, paper texture', icon: '🎭' },
  { id: 'minimalist', label: 'Minimal', suffix: ', minimalist, clean design, modern, flat illustration, simple', icon: '◻️' },
  { id: 'cyberpunk', label: 'Cyberpunk', suffix: ', cyberpunk aesthetic, neon lights, futuristic, glowing, dark atmosphere', icon: '🌃' },
  { id: 'oil-painting', label: 'Oil Paint', suffix: ', oil painting, classical art style, textured brush strokes, renaissance', icon: '🖼️' },
];

const SIZE_OPTIONS = [
  { value: '1024x1024', label: 'Square (1:1)', desc: '1024 x 1024' },
  { value: '1792x1024', label: 'Landscape (16:9)', desc: '1792 x 1024' },
  { value: '1024x1792', label: 'Portrait (9:16)', desc: '1024 x 1792' },
];

// ============================================
// COMPONENT
// ============================================

export default function ImageGenerator() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid');
  const [activePreset, setActivePreset] = useState('none');

  // UI state
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [copied, setCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Token cost
  const tokenCost = quality === 'hd' ? 12 : 8;

  // Fetch history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/images/history'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/images/history?limit=20');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const preset = STYLE_PRESETS.find(p => p.id === activePreset);
      const fullPrompt = preset && preset.suffix
        ? prompt.trim() + preset.suffix
        : prompt.trim();

      const res = await apiRequest('POST', '/api/images/generate', {
        prompt: fullPrompt,
        size,
        quality,
        style,
      });
      return res.json() as Promise<GenerateResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentImage({
          id: data.generationId,
          prompt: prompt.trim(),
          imageUrl: data.imageUrl,
          model: data.model,
          size: data.size,
          quality: data.quality,
          style: data.style,
          revisedPrompt: data.revisedPrompt,
          tokensUsed: data.tokensUsed,
          createdAt: new Date().toISOString(),
        });
        toast({ title: 'Image generated!', description: `Used ${data.tokensUsed} tokens` });
        queryClient.invalidateQueries({ queryKey: ['/api/images/history'] });
      } else {
        toast({ title: 'Generation failed', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to generate image';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const res = await apiRequest('DELETE', `/api/images/${imageId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Image deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/images/history'] });
      if (currentImage && deleteMutation.variables === currentImage.id) {
        setCurrentImage(null);
      }
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: 'Enter a prompt', description: 'Describe the image you want to create', variant: 'destructive' });
      return;
    }
    generateMutation.mutate();
  };

  const handleDownload = async (imageUrl: string, imageName?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageName || `smartpromptiq-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const historyImages: GeneratedImage[] = historyData?.images || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Image AI
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full">
                  NEW
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate images with DALL-E 3</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Coins className="w-4 h-4" />
            <span>{tokenCost} tokens per image</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Describe your image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city at sunset with flying cars and neon signs, viewed from a rooftop garden..."
                className="w-full h-28 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                maxLength={4000}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{prompt.length} / 4000</span>
                <span className="text-xs text-gray-400">Ctrl+Enter to generate</span>
              </div>
            </div>

            {/* Style Presets */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Style Preset
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setActivePreset(preset.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      activePreset === preset.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Row */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-full"
              >
                <Settings2 className="w-4 h-4" />
                Generation Settings
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showSettings ? 'rotate-180' : ''}`} />
              </button>

              {showSettings && (
                <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {/* Size */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Size</label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {SIZE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} — {opt.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Quality</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setQuality('standard')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          quality === 'standard'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                        }`}
                      >
                        Standard
                        <div className="text-[10px] opacity-70">8 tokens</div>
                      </button>
                      <button
                        onClick={() => setQuality('hd')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          quality === 'hd'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                        }`}
                      >
                        HD
                        <div className="text-[10px] opacity-70">12 tokens</div>
                      </button>
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Style</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStyle('vivid')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          style === 'vivid'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                        }`}
                      >
                        Vivid
                      </button>
                      <button
                        onClick={() => setStyle('natural')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          style === 'natural'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                        }`}
                      >
                        Natural
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Image — {tokenCost} tokens
                </>
              )}
            </button>

            {/* History Gallery */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Generations
                </h3>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/images/history'] })}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {historyLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  ))}
                </div>
              ) : historyImages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No images generated yet</p>
                  <p className="text-xs mt-1">Your creations will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {historyImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                      onClick={() => {
                        setCurrentImage(img);
                      }}
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.prompt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14">Expired</text></svg>';
                        }}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end">
                        <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                          <p className="text-white text-[10px] line-clamp-2">{img.prompt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-4">
            {/* Preview Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-6">
              {currentImage ? (
                <>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setLightboxImage(currentImage.imageUrl)}
                  >
                    <img
                      src={currentImage.imageUrl}
                      alt={currentImage.prompt}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f3f4f6" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16">URL expired - click refresh</text></svg>';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" />
                      Click to zoom
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Prompt</span>
                        <button
                          onClick={() => handleCopyPrompt(currentImage.revisedPrompt || currentImage.prompt)}
                          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {currentImage.prompt}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        {currentImage.size}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        {currentImage.quality.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        {currentImage.style}
                      </span>
                      <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        {currentImage.tokensUsed} tokens
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleDownload(currentImage.imageUrl)}
                        className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setPrompt(currentImage.prompt);
                          setActivePreset('none');
                        }}
                        className="py-2.5 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Reuse this prompt"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this image?')) {
                            deleteMutation.mutate(currentImage.id);
                          }
                        }}
                        className="py-2.5 px-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Revised prompt */}
                    {currentImage.revisedPrompt && currentImage.revisedPrompt !== currentImage.prompt && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-medium text-gray-400 mb-1">DALL-E revised prompt:</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 italic line-clamp-4">
                          {currentImage.revisedPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Your image will appear here</h3>
                  <p className="text-sm text-gray-400">Enter a prompt and click Generate</p>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5">
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3">Tips for better results</h4>
              <ul className="space-y-2 text-xs text-emerald-700 dark:text-emerald-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#9679;</span>
                  Be specific about subjects, colors, lighting, and composition
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#9679;</span>
                  Use style presets to add professional art direction automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#9679;</span>
                  HD quality gives finer details and better textures
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#9679;</span>
                  "Vivid" creates bold, colorful images; "Natural" is more realistic
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Full size preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(lightboxImage);
            }}
            className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white w-10 h-10 rounded-full text-lg font-medium hover:bg-white/30 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
