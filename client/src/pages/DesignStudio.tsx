/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - AI DESIGN STUDIO & PRINT SHOP
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Create stunning designs with AI and print them on merchandise!
 *
 * Features:
 * - 🎨 AI Image Generation (Multiple providers)
 * - 🖼️ Thumbnail & Cover Art Creator
 * - 👕 Print-on-Demand Merchandise
 * - 📱 Social Media Templates
 * - 🎬 Video Thumbnail Generator
 * - 🏪 Connect to Printful/Printify
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Image as ImageIcon,
  Palette,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  Settings2,
  Layers,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Zap,
  ShoppingBag,
  Shirt,
  Coffee,
  Smartphone,
  Frame,
  BookOpen,
  Monitor,
  Play,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Music,
  Mic,
  Film,
  Camera,
  Brush,
  PenTool,
  Droplet,
  Sun,
  Moon,
  CloudLightning,
  Flame,
  Leaf,
  Mountain,
  Waves,
  Building,
  Rocket,
  Crown,
  Gift,
  ShoppingCart,
  Check,
  Copy,
  ExternalLink,
  Info,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Grid,
  List,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  Save,
  FolderOpen,
  Upload,
  ImagePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// AI IMAGE PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════

interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  models: string[];
  pricing: string;
  features: string[];
  color: string;
  apiEndpoint?: string;
  free?: boolean;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'stability',
    name: 'Stable Diffusion',
    description: 'Open-source AI image generation',
    icon: <Sparkles className="w-5 h-5" />,
    models: ['SDXL 1.0', 'SD 3.0', 'Stable Video'],
    pricing: 'Free tier available',
    features: ['High quality', 'Fast generation', 'Many styles'],
    color: 'from-purple-500 to-pink-500',
    free: true,
  },
  {
    id: 'dalle',
    name: 'DALL-E 3',
    description: 'OpenAI premium image generation',
    icon: <Wand2 className="w-5 h-5" />,
    models: ['DALL-E 3', 'DALL-E 2'],
    pricing: '$0.04-0.12/image',
    features: ['Best quality', 'Text in images', 'Artistic'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: 'Artistic AI image generation',
    icon: <Brush className="w-5 h-5" />,
    models: ['v6', 'v5.2', 'niji'],
    pricing: '$10-60/month',
    features: ['Most artistic', 'Unique style', 'Community'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'leonardo',
    name: 'Leonardo.ai',
    description: 'Game asset & character generation',
    icon: <Crown className="w-5 h-5" />,
    models: ['Phoenix', 'Lightning', 'Anime'],
    pricing: 'Free tier + paid',
    features: ['Game assets', 'Characters', 'Textures'],
    color: 'from-amber-500 to-orange-500',
    free: true,
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Multi-model API platform',
    icon: <Layers className="w-5 h-5" />,
    models: ['FLUX', 'SDXL', 'Kandinsky'],
    pricing: '$0.0036/run',
    features: ['Many models', 'Easy API', 'Pay per use'],
    color: 'from-rose-500 to-red-500',
    free: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

interface DesignTemplate {
  id: string;
  name: string;
  category: 'thumbnail' | 'social' | 'print' | 'brand';
  dimensions: { width: number; height: number };
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
}

const DESIGN_TEMPLATES: DesignTemplate[] = [
  // Thumbnails
  { id: 'yt-thumbnail', name: 'YouTube Thumbnail', category: 'thumbnail', dimensions: { width: 1280, height: 720 }, icon: <Youtube className="w-5 h-5" />, description: '16:9 video thumbnail', popular: true },
  { id: 'podcast-cover', name: 'Podcast Cover', category: 'thumbnail', dimensions: { width: 3000, height: 3000 }, icon: <Mic className="w-5 h-5" />, description: 'Square podcast artwork', popular: true },
  { id: 'course-thumb', name: 'Course Thumbnail', category: 'thumbnail', dimensions: { width: 1920, height: 1080 }, icon: <BookOpen className="w-5 h-5" />, description: 'Online course cover' },
  { id: 'stream-overlay', name: 'Stream Overlay', category: 'thumbnail', dimensions: { width: 1920, height: 1080 }, icon: <Monitor className="w-5 h-5" />, description: 'Twitch/YouTube stream' },

  // Social Media
  { id: 'ig-post', name: 'Instagram Post', category: 'social', dimensions: { width: 1080, height: 1080 }, icon: <Instagram className="w-5 h-5" />, description: 'Square feed post', popular: true },
  { id: 'ig-story', name: 'Instagram Story', category: 'social', dimensions: { width: 1080, height: 1920 }, icon: <Instagram className="w-5 h-5" />, description: '9:16 story format' },
  { id: 'twitter-post', name: 'Twitter/X Post', category: 'social', dimensions: { width: 1200, height: 675 }, icon: <Twitter className="w-5 h-5" />, description: 'Optimal Twitter image' },
  { id: 'linkedin-post', name: 'LinkedIn Post', category: 'social', dimensions: { width: 1200, height: 627 }, icon: <Linkedin className="w-5 h-5" />, description: 'Professional post' },
  { id: 'fb-cover', name: 'Facebook Cover', category: 'social', dimensions: { width: 820, height: 312 }, icon: <Facebook className="w-5 h-5" />, description: 'Page cover photo' },

  // Print Products
  { id: 'tshirt', name: 'T-Shirt Design', category: 'print', dimensions: { width: 4500, height: 5400 }, icon: <Shirt className="w-5 h-5" />, description: 'Front print design', popular: true },
  { id: 'mug', name: 'Mug Design', category: 'print', dimensions: { width: 2700, height: 1100 }, icon: <Coffee className="w-5 h-5" />, description: 'Wrap-around mug' },
  { id: 'phone-case', name: 'Phone Case', category: 'print', dimensions: { width: 1242, height: 2688 }, icon: <Smartphone className="w-5 h-5" />, description: 'iPhone/Android case' },
  { id: 'poster', name: 'Poster', category: 'print', dimensions: { width: 3600, height: 5400 }, icon: <Frame className="w-5 h-5" />, description: '24x36 inch poster' },
  { id: 'sticker', name: 'Sticker Pack', category: 'print', dimensions: { width: 1500, height: 1500 }, icon: <Star className="w-5 h-5" />, description: 'Die-cut stickers' },

  // Brand Assets
  { id: 'logo', name: 'Logo Design', category: 'brand', dimensions: { width: 1000, height: 1000 }, icon: <Crown className="w-5 h-5" />, description: 'Square logo', popular: true },
  { id: 'banner', name: 'Channel Banner', category: 'brand', dimensions: { width: 2560, height: 1440 }, icon: <Monitor className="w-5 h-5" />, description: 'YouTube channel art' },
  { id: 'business-card', name: 'Business Card', category: 'brand', dimensions: { width: 1050, height: 600 }, icon: <Square className="w-5 h-5" />, description: '3.5x2 inch card' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT ON DEMAND PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════

interface PrintProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  products: string[];
  shipping: string;
  apiUrl: string;
  features: string[];
  featured?: boolean;
  integrated?: boolean;
  badge?: string;
  color?: string;
  websiteUrl?: string;
}

const PRINT_PROVIDERS: PrintProvider[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // IMPOSSIBLE PRINT - Your Primary POD Platform (Featured)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'impossible-print',
    name: 'Impossible Print',
    description: 'Premium quality printing with impossible standards - Our partner platform!',
    logo: '🚀',
    products: [
      'Premium T-Shirts', 'Designer Hoodies', 'Canvas Prints', 'Metal Prints',
      'Acrylic Prints', 'Photo Books', 'Business Cards', 'Stickers',
      'Banners', 'Posters', 'Mugs', 'Phone Cases', 'Tote Bags',
      'All-Over Print Apparel', 'Custom Packaging', 'Promotional Items'
    ],
    shipping: 'US, UK, EU, CA, AU (Express Available)',
    apiUrl: 'https://api.impossibleprint.com',
    websiteUrl: 'https://impossibleprint.com',
    features: [
      'SmartPromptIQ Integration',
      'Direct Design Upload',
      'AI-Powered Mockups',
      'Premium Materials',
      'Express 24h Printing',
      'Bulk Discounts',
      'White-Label Options',
      'Dedicated Support',
      'Quality Guarantee',
      'Eco-Friendly Options'
    ],
    featured: true,
    integrated: true,
    badge: 'Partner',
    color: 'from-violet-500 to-purple-600',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // OTHER PRINT-ON-DEMAND PLATFORMS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'printful',
    name: 'Printful',
    description: 'Premium print-on-demand with global fulfillment',
    logo: '🖨️',
    products: ['T-Shirts', 'Hoodies', 'Mugs', 'Posters', 'Phone Cases', 'Hats', 'Embroidery'],
    shipping: 'US, EU, AU, JP, MX, CA, BR',
    apiUrl: 'https://api.printful.com',
    websiteUrl: 'https://printful.com',
    features: ['High quality', 'Fast shipping', 'Brand customization', 'Warehousing', 'Embroidery'],
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'printify',
    name: 'Printify',
    description: 'Large network of print providers',
    logo: '🎨',
    products: ['Apparel', 'Accessories', 'Home & Living', 'Kids', 'Stationery'],
    shipping: 'Worldwide (90+ providers)',
    apiUrl: 'https://api.printify.com',
    websiteUrl: 'https://printify.com',
    features: ['Price comparison', 'Multiple suppliers', 'Lower prices', 'Mock-up generator'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'gooten',
    name: 'Gooten',
    description: 'Enterprise-grade POD solution',
    logo: '📦',
    products: ['Apparel', 'Drinkware', 'Wall Art', 'Bags', 'Pet Products'],
    shipping: 'Global network',
    apiUrl: 'https://api.gooten.com',
    websiteUrl: 'https://gooten.com',
    features: ['Enterprise API', 'Quality control', 'Dropshipping', 'White-label'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'gelato',
    name: 'Gelato',
    description: 'Global print network with local production',
    logo: '🌍',
    products: ['Wall Art', 'Photo Products', 'Apparel', 'Mugs', 'Stationery', 'Cards'],
    shipping: 'Local production in 32 countries',
    apiUrl: 'https://api.gelato.com',
    websiteUrl: 'https://gelato.com',
    features: ['Local printing', 'Eco-friendly', 'Fast delivery', 'Photo products'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'redbubble',
    name: 'Redbubble',
    description: 'Artist marketplace with built-in audience',
    logo: '🔴',
    products: ['Stickers', 'T-Shirts', 'Art Prints', 'Phone Cases', 'Home Decor', 'Gifts'],
    shipping: 'Worldwide',
    apiUrl: 'https://www.redbubble.com',
    websiteUrl: 'https://redbubble.com',
    features: ['Built-in marketplace', 'Artist community', 'No upfront cost', 'Trending designs'],
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'society6',
    name: 'Society6',
    description: 'Premium art-focused marketplace',
    logo: '🎭',
    products: ['Art Prints', 'Canvas', 'Furniture', 'Home Decor', 'Tech Accessories', 'Apparel'],
    shipping: 'Worldwide',
    apiUrl: 'https://society6.com',
    websiteUrl: 'https://society6.com',
    features: ['Artist-focused', 'Premium quality', 'Unique products', 'Furniture prints'],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'teespring',
    name: 'Spring (Teespring)',
    description: 'Creator-focused merch platform',
    logo: '🌸',
    products: ['T-Shirts', 'Hoodies', 'Accessories', 'Home Items', 'Drinkware'],
    shipping: 'US, EU, Worldwide',
    apiUrl: 'https://api.spri.ng',
    websiteUrl: 'https://spri.ng',
    features: ['Creator tools', 'Social integrations', 'No upfront cost', 'YouTube Merch Shelf'],
    color: 'from-teal-500 to-green-500',
  },
  {
    id: 'zazzle',
    name: 'Zazzle',
    description: 'Customizable products marketplace',
    logo: '✨',
    products: ['Invitations', 'Business Cards', 'Apparel', 'Home Decor', 'Gifts', 'Labels'],
    shipping: 'Worldwide',
    apiUrl: 'https://www.zazzle.com/api',
    websiteUrl: 'https://zazzle.com',
    features: ['Customization tools', 'Templates', 'Business products', 'Event items'],
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'spreadshirt',
    name: 'Spreadshirt',
    description: 'European POD leader',
    logo: '👕',
    products: ['T-Shirts', 'Hoodies', 'Accessories', 'Kids Apparel', 'Bags'],
    shipping: 'EU, US, AU',
    apiUrl: 'https://api.spreadshirt.com',
    websiteUrl: 'https://spreadshirt.com',
    features: ['EU-based', 'Quality fabrics', 'Designer marketplace', 'Bulk orders'],
    color: 'from-lime-500 to-green-500',
  },
  {
    id: 'tpop',
    name: 'T-Pop',
    description: 'Eco-friendly European POD',
    logo: '🌿',
    products: ['Organic T-Shirts', 'Eco Hoodies', 'Tote Bags', 'Posters', 'Mugs'],
    shipping: 'EU, UK, US',
    apiUrl: 'https://api.tpop.com',
    websiteUrl: 'https://tpop.com',
    features: ['100% Organic', 'Carbon neutral', 'Eco packaging', 'Fair trade'],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'prodigi',
    name: 'Prodigi (formerly Pwinty)',
    description: 'Professional print API',
    logo: '🖼️',
    products: ['Fine Art Prints', 'Canvas', 'Framed Prints', 'Photo Products', 'Cards'],
    shipping: 'Worldwide',
    apiUrl: 'https://api.prodigi.com',
    websiteUrl: 'https://prodigi.com',
    features: ['Developer-focused', 'High-end prints', 'Museum quality', 'Framing options'],
    color: 'from-gray-600 to-gray-800',
  },
  {
    id: 'customink',
    name: 'CustomInk',
    description: 'Group ordering & events specialist',
    logo: '🎽',
    products: ['Team Apparel', 'Event Shirts', 'Corporate Merch', 'Uniforms', 'Promotional'],
    shipping: 'US',
    apiUrl: 'https://www.customink.com',
    websiteUrl: 'https://customink.com',
    features: ['Group ordering', 'Event coordination', 'Design lab', 'Rush delivery'],
    color: 'from-blue-600 to-blue-800',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// AI STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

interface StylePreset {
  id: string;
  name: string;
  prompt: string;
  icon: React.ReactNode;
  example?: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'photorealistic', name: 'Photorealistic', prompt: 'ultra realistic, 8k, detailed, professional photography', icon: <Camera className="w-4 h-4" /> },
  { id: 'digital-art', name: 'Digital Art', prompt: 'digital art, vibrant colors, detailed illustration', icon: <PenTool className="w-4 h-4" /> },
  { id: 'anime', name: 'Anime Style', prompt: 'anime style, manga, japanese animation, cel shaded', icon: <Star className="w-4 h-4" /> },
  { id: '3d-render', name: '3D Render', prompt: '3D render, octane render, blender, cinema 4d, realistic lighting', icon: <Square className="w-4 h-4" /> },
  { id: 'watercolor', name: 'Watercolor', prompt: 'watercolor painting, soft edges, artistic, traditional media', icon: <Droplet className="w-4 h-4" /> },
  { id: 'oil-painting', name: 'Oil Painting', prompt: 'oil painting, classical art, masterpiece, textured brushstrokes', icon: <Brush className="w-4 h-4" /> },
  { id: 'minimalist', name: 'Minimalist', prompt: 'minimalist design, clean, simple, modern, flat design', icon: <Circle className="w-4 h-4" /> },
  { id: 'neon', name: 'Neon Cyberpunk', prompt: 'neon lights, cyberpunk, futuristic, glowing, dark background', icon: <Zap className="w-4 h-4" /> },
  { id: 'retro', name: 'Retro/Vintage', prompt: 'retro style, vintage, 80s aesthetic, nostalgic, grain effect', icon: <Sun className="w-4 h-4" /> },
  { id: 'fantasy', name: 'Fantasy Art', prompt: 'fantasy art, magical, epic, detailed, concept art', icon: <CloudLightning className="w-4 h-4" /> },
  { id: 'logo', name: 'Logo Design', prompt: 'logo design, vector, clean, professional, brand identity', icon: <Crown className="w-4 h-4" /> },
  { id: 'icon', name: 'App Icon', prompt: 'app icon, iOS style, rounded corners, glossy, simple', icon: <Smartphone className="w-4 h-4" /> },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DesignStudio() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [activeTab, setActiveTab] = useState<'generate' | 'templates' | 'print' | 'gallery'>('generate');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AI_PROVIDERS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [selectedPrintProvider, setSelectedPrintProvider] = useState<PrintProvider>(PRINT_PROVIDERS[0]);

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Settings
  const [imageWidth, setImageWidth] = useState(1024);
  const [imageHeight, setImageHeight] = useState(1024);
  const [numImages, setNumImages] = useState(4);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(30);

  // Gallery state
  const [savedDesigns, setSavedDesigns] = useState<string[]>([]);

  // Generate AI image
  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Enter a Prompt',
        description: 'Please describe what you want to create',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Build the full prompt with style
      const fullPrompt = `${prompt}, ${selectedStyle.prompt}`;

      // Simulated API call - in production, this would call the actual AI API
      // For demo, we'll use placeholder images
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate placeholder images (in production, these would be real AI-generated images)
      const placeholderImages = Array.from({ length: numImages }, (_, i) =>
        `https://picsum.photos/seed/${Date.now() + i}/${imageWidth}/${imageHeight}`
      );

      setGeneratedImages(placeholderImages);
      setSelectedImage(placeholderImages[0]);

      toast({
        title: 'Images Generated!',
        description: `Created ${numImages} images with ${selectedProvider.name}`,
      });

      // In production, you would call the actual API:
      /*
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider.id,
          prompt: fullPrompt,
          negativePrompt,
          width: imageWidth,
          height: imageHeight,
          numImages,
          guidanceScale,
          steps,
        }),
      });
      const data = await response.json();
      setGeneratedImages(data.images);
      */

    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Generation Failed',
        description: 'There was an error generating your images',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save design to gallery
  const saveToGallery = (imageUrl: string) => {
    setSavedDesigns(prev => [...prev, imageUrl]);
    toast({
      title: 'Design Saved!',
      description: 'Added to your gallery',
    });
  };

  // Download image
  const downloadImage = (imageUrl: string, filename: string = 'design') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `smartpromptiq-${filename}-${Date.now()}.png`;
    link.click();

    toast({
      title: 'Download Started',
      description: 'Your design is being downloaded',
    });
  };

  // Send to print provider
  const sendToPrint = async (imageUrl: string) => {
    toast({
      title: 'Preparing for Print',
      description: `Connecting to ${selectedPrintProvider.name}...`,
    });

    // In production, this would open the print provider's product customizer
    // or use their API to create a product
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Ready to Print!',
      description: `Your design is ready on ${selectedPrintProvider.name}`,
    });
  };

  // Apply template dimensions
  const applyTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setImageWidth(template.dimensions.width);
    setImageHeight(template.dimensions.height);

    toast({
      title: `Template: ${template.name}`,
      description: `${template.dimensions.width}x${template.dimensions.height}px`,
    });
  };

  // Filter templates by category
  const thumbnailTemplates = DESIGN_TEMPLATES.filter(t => t.category === 'thumbnail');
  const socialTemplates = DESIGN_TEMPLATES.filter(t => t.category === 'social');
  const printTemplates = DESIGN_TEMPLATES.filter(t => t.category === 'print');
  const brandTemplates = DESIGN_TEMPLATES.filter(t => t.category === 'brand');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  AI Design Studio
                </h1>
                <p className="text-gray-400">Create stunning designs with AI & print on merchandise</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Print Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="generate" className="data-[state=active]:bg-indigo-500">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-indigo-500">
                  <Layers className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="print" className="data-[state=active]:bg-indigo-500">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Print Shop
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:bg-indigo-500">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Gallery
                </TabsTrigger>
              </TabsList>

              {/* Generate Tab */}
              <TabsContent value="generate" className="space-y-6 mt-6">
                {/* AI Provider Selection */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">AI Provider</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {AI_PROVIDERS.map((provider) => (
                        <motion.button
                          key={provider.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedProvider(provider)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedProvider.id === provider.id
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center mb-2`}>
                            {provider.icon}
                          </div>
                          <h4 className="font-medium text-white text-sm">{provider.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{provider.pricing}</p>
                          {provider.free && (
                            <Badge className="mt-2 bg-green-500/20 text-green-400 text-xs">Free</Badge>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Prompt Input */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Type className="w-5 h-5 text-indigo-400" />
                      Describe Your Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to create... (e.g., 'A futuristic city skyline at sunset with flying cars')"
                      className="w-full h-32 p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
                    />

                    {/* Style Presets */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Style Preset</label>
                      <div className="flex flex-wrap gap-2">
                        {STYLE_PRESETS.map((style) => (
                          <Button
                            key={style.id}
                            variant={selectedStyle.id === style.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedStyle(style)}
                            className={selectedStyle.id === style.id ? 'bg-indigo-500' : ''}
                          >
                            {style.icon}
                            <span className="ml-1">{style.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Negative Prompt */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Negative Prompt (what to avoid)
                      </label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blurry, low quality, distorted, watermark..."
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Generation Settings */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-indigo-400" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Dimensions */}
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Width: {imageWidth}px
                        </label>
                        <Slider
                          value={[imageWidth]}
                          onValueChange={([v]) => setImageWidth(v)}
                          min={512}
                          max={2048}
                          step={64}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Height: {imageHeight}px
                        </label>
                        <Slider
                          value={[imageHeight]}
                          onValueChange={([v]) => setImageHeight(v)}
                          min={512}
                          max={2048}
                          step={64}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Images: {numImages}
                        </label>
                        <Slider
                          value={[numImages]}
                          onValueChange={([v]) => setNumImages(v)}
                          min={1}
                          max={8}
                          step={1}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Guidance: {guidanceScale}
                        </label>
                        <Slider
                          value={[guidanceScale]}
                          onValueChange={([v]) => setGuidanceScale(v)}
                          min={1}
                          max={20}
                          step={0.5}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Steps: {steps}
                        </label>
                        <Slider
                          value={[steps]}
                          onValueChange={([v]) => setSteps(v)}
                          min={10}
                          max={100}
                          step={5}
                        />
                      </div>
                    </div>

                    {/* Quick Size Buttons */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Quick Sizes</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Square', w: 1024, h: 1024 },
                          { label: '16:9', w: 1920, h: 1080 },
                          { label: '9:16', w: 1080, h: 1920 },
                          { label: '4:3', w: 1024, h: 768 },
                          { label: 'Portrait', w: 768, h: 1024 },
                        ].map((size) => (
                          <Button
                            key={size.label}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImageWidth(size.w);
                              setImageHeight(size.h);
                            }}
                          >
                            {size.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  size="lg"
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generating {numImages} Images...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate with {selectedProvider.name}
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6 mt-6">
                {/* Thumbnails */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-red-400" />
                    Video Thumbnails
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {thumbnailTemplates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyTemplate(template)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTemplate?.id === template.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {template.icon}
                          <span className="font-medium text-white text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">{template.dimensions.width}x{template.dimensions.height}</p>
                        {template.popular && (
                          <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 text-xs">Popular</Badge>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-400" />
                    Social Media
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {socialTemplates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyTemplate(template)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTemplate?.id === template.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {template.icon}
                          <span className="font-medium text-white text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">{template.dimensions.width}x{template.dimensions.height}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Print Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-green-400" />
                    Print Products
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {printTemplates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyTemplate(template)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTemplate?.id === template.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {template.icon}
                          <span className="font-medium text-white text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">{template.description}</p>
                        {template.popular && (
                          <Badge className="mt-2 bg-green-500/20 text-green-400 text-xs">Popular</Badge>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Brand Assets */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    Brand Assets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {brandTemplates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyTemplate(template)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTemplate?.id === template.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {template.icon}
                          <span className="font-medium text-white text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">{template.dimensions.width}x{template.dimensions.height}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Print Shop Tab */}
              <TabsContent value="print" className="space-y-6 mt-6">
                {/* Featured Partner - Impossible Print */}
                {PRINT_PROVIDERS.filter(p => p.featured).map((provider) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative overflow-hidden rounded-2xl border-2 ${
                      selectedPrintProvider.id === provider.id
                        ? 'border-violet-500'
                        : 'border-violet-500/50'
                    }`}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${provider.color || 'from-violet-500 to-purple-600'} opacity-20`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    <div className="relative p-6">
                      {/* Partner Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 px-3 py-1">
                          <Rocket className="w-3 h-3 mr-1" />
                          {provider.badge || 'Featured Partner'}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="text-6xl">{provider.logo}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white">{provider.name}</h3>
                            {provider.integrated && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <Check className="w-3 h-3 mr-1" />
                                Integrated
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-300 mb-4">{provider.description}</p>

                          {/* Features Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                            {provider.features.slice(0, 10).map((feature, i) => (
                              <Badge key={i} variant="secondary" className="bg-white/10 text-white text-xs justify-center">
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          {/* Products */}
                          <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-2">Available Products:</p>
                            <div className="flex flex-wrap gap-1">
                              {provider.products.slice(0, 8).map((product, i) => (
                                <span key={i} className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded">
                                  {product}
                                </span>
                              ))}
                              {provider.products.length > 8 && (
                                <span className="text-xs text-violet-400">+{provider.products.length - 8} more</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Button
                              className={`bg-gradient-to-r ${provider.color || 'from-violet-500 to-purple-600'} text-white hover:opacity-90`}
                              onClick={() => {
                                setSelectedPrintProvider(provider);
                                toast({
                                  title: `${provider.name} Selected!`,
                                  description: 'Ready to print your designs with our partner platform.',
                                });
                              }}
                            >
                              <Rocket className="w-4 h-4 mr-2" />
                              {selectedPrintProvider.id === provider.id ? 'Selected' : 'Select Partner'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => window.open(provider.websiteUrl || provider.apiUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Visit Website
                            </Button>
                            {selectedImage && (
                              <Button
                                variant="outline"
                                className="border-green-500 text-green-400 hover:bg-green-500/10"
                                onClick={() => {
                                  toast({
                                    title: 'Opening Design Editor',
                                    description: `Preparing your design for ${provider.name}...`,
                                  });
                                  // In production, this would open the Impossible Print design editor
                                }}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Design
                              </Button>
                            )}
                          </div>

                          {/* Shipping Info */}
                          <p className="text-xs text-gray-500 mt-4">
                            Shipping: {provider.shipping}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Other Print Providers */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-green-400" />
                      More Print-on-Demand Providers
                    </CardTitle>
                    <CardDescription>
                      Connect with other leading POD platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {PRINT_PROVIDERS.filter(p => !p.featured).map((provider) => (
                        <motion.div
                          key={provider.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPrintProvider.id === provider.id
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                          onClick={() => setSelectedPrintProvider(provider)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`text-3xl p-2 rounded-lg bg-gradient-to-br ${provider.color || 'from-gray-500 to-gray-600'} bg-opacity-20`}>
                              {provider.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white truncate">{provider.name}</h4>
                                {selectedPrintProvider.id === provider.id && (
                                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{provider.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {provider.features.slice(0, 3).map((feature, i) => (
                                  <Badge key={i} variant="secondary" className="bg-white/10 text-gray-300 text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500 truncate">
                                  {provider.products.slice(0, 2).join(', ')}...
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(provider.websiteUrl || provider.apiUrl, '_blank');
                                  }}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Products Preview */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gift className="w-5 h-5 text-pink-400" />
                      Popular Products from {selectedPrintProvider.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[
                        { icon: <Shirt className="w-8 h-8" />, name: 'T-Shirt', price: '$15-25', category: 'Apparel' },
                        { icon: <Coffee className="w-8 h-8" />, name: 'Mug', price: '$8-15', category: 'Drinkware' },
                        { icon: <Smartphone className="w-8 h-8" />, name: 'Phone Case', price: '$12-20', category: 'Tech' },
                        { icon: <Frame className="w-8 h-8" />, name: 'Canvas Print', price: '$25-80', category: 'Wall Art' },
                        { icon: <Star className="w-8 h-8" />, name: 'Stickers', price: '$3-10', category: 'Accessories' },
                        { icon: <ShoppingBag className="w-8 h-8" />, name: 'Tote Bag', price: '$12-20', category: 'Bags' },
                        { icon: <BookOpen className="w-8 h-8" />, name: 'Photo Book', price: '$20-50', category: 'Print' },
                        { icon: <Crown className="w-8 h-8" />, name: 'Metal Print', price: '$30-100', category: 'Premium' },
                        { icon: <Layers className="w-8 h-8" />, name: 'Acrylic', price: '$35-120', category: 'Premium' },
                        { icon: <Gift className="w-8 h-8" />, name: 'Gift Box', price: '$25-45', category: 'Gifts' },
                        { icon: <Monitor className="w-8 h-8" />, name: 'Desk Mat', price: '$20-35', category: 'Office' },
                        { icon: <Heart className="w-8 h-8" />, name: 'Pillow', price: '$18-30', category: 'Home' },
                      ].map((product, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all cursor-pointer border border-white/5"
                        >
                          <div className="text-indigo-400 mb-2 flex justify-center">{product.icon}</div>
                          <h5 className="text-sm font-medium text-white">{product.name}</h5>
                          <p className="text-xs text-gray-400">{product.price}</p>
                          <Badge className="mt-2 bg-white/5 text-gray-500 text-xs">{product.category}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions for Selected Provider */}
                {selectedPrintProvider && (
                  <Card className={`border-2 ${selectedPrintProvider.featured ? 'border-violet-500/50' : 'border-green-500/50'} bg-gradient-to-br from-white/5 to-white/10`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{selectedPrintProvider.logo}</div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{selectedPrintProvider.name}</h4>
                            <p className="text-sm text-gray-400">Ready to create products</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {selectedImage ? (
                            <>
                              <Button
                                className={`bg-gradient-to-r ${selectedPrintProvider.color || 'from-green-500 to-emerald-600'} text-white`}
                                onClick={() => {
                                  toast({
                                    title: 'Starting Product Creator',
                                    description: `Opening ${selectedPrintProvider.name} product editor...`,
                                  });
                                }}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Create Product
                              </Button>
                              <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download Design
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" onClick={() => setActiveTab('generate')}>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate a Design First
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Info */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <h5 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    How Print-on-Demand Works
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      { step: '1', title: 'Generate', desc: 'Create your design with AI' },
                      { step: '2', title: 'Choose', desc: 'Select a print provider' },
                      { step: '3', title: 'Customize', desc: 'Pick products & placement' },
                      { step: '4', title: 'Order', desc: 'Get samples or go live' },
                      { step: '5', title: 'Sell', desc: 'Start selling online!' },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold flex items-center justify-center mx-auto mb-2">
                          {item.step}
                        </div>
                        <h6 className="text-sm font-medium text-white">{item.title}</h6>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="space-y-6 mt-6">
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                      Your Saved Designs
                    </CardTitle>
                    <CardDescription>
                      {savedDesigns.length} designs saved
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedDesigns.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {savedDesigns.map((image, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className="relative group rounded-lg overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Design ${index + 1}`}
                              className="w-full aspect-square object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button size="sm" variant="secondary" onClick={() => downloadImage(image)}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => sendToPrint(image)}>
                                <ShoppingBag className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSavedDesigns(prev => prev.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No saved designs yet</p>
                        <p className="text-sm mt-2">Generate some images and save them here!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview & Results */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-400" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden bg-white/5">
                      <img
                        src={selectedImage}
                        alt="Selected design"
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => downloadImage(selectedImage)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => saveToGallery(selectedImage)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                        onClick={() => sendToPrint(selectedImage)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Generate images to preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Images Grid */}
            {generatedImages.length > 0 && (
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Generated Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {generatedImages.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedImage(image)}
                        className={`rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === image
                            ? 'border-indigo-500'
                            : 'border-transparent hover:border-white/20'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Generated ${index + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Settings */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Current Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Provider:</span>
                  <span className="text-white">{selectedProvider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{imageWidth}x{imageHeight}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Style:</span>
                  <span className="text-white">{selectedStyle.name}</span>
                </div>
                {selectedTemplate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Template:</span>
                    <span className="text-white">{selectedTemplate.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <h5 className="font-medium text-indigo-400 mb-2">Pro Tips</h5>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Be specific in your prompts for better results</li>
                    <li>• Use style presets to maintain consistency</li>
                    <li>• Higher steps = more detail (but slower)</li>
                    <li>• Save your best designs to the gallery</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
