import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRatingSystemContext } from "@/components/RatingSystemProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import BackButton from "@/components/BackButton";
import TokenBalance from "@/components/TokenBalance";
import {
  Search, Grid, List, Star, TrendingUp, Crown, Heart, Clock, Users,
  AlertCircle, CheckCircle, Settings, Zap, Eye, RefreshCw, Play,
  Briefcase, TrendingDown, DollarSign, GraduationCap, Target, Lightbulb,
  PenTool, MessageSquare, BarChart3, Rocket, Brain, Sparkles, Lock, Shield
} from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import TierIndicator from "@/components/TierIndicator";
import UpgradePrompt from "@/components/UpgradePrompt";

export default function Templates() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { trackFeatureUsage, trackMilestone } = useRatingSystemContext();

  // Mock user subscription tier - this would come from your auth/user context
  const userTier = isAuthenticated ? "free" : null; // "free", "starter", "pro", "business"

  // Use feature access hook
  const { checkFeatureAccess } = useFeatureAccess(userTier || 'free');
  const [upgradePromptConfig, setUpgradePromptConfig] = useState<{
    isOpen: boolean;
    template?: any;
  }>({ isOpen: false });

  const handleRestrictedTemplateClick = (template: any) => {
    if (!isAuthenticated) {
      setLocation('/signin');
      return;
    }
    setUpgradePromptConfig({
      isOpen: true,
      template
    });
  };

  // Define tier hierarchy for access checks
  const tierHierarchy = {
    free: 1,
    starter: 2,
    pro: 3,
    business: 4
  };

  const canAccessTemplate = (template: any) => {
    if (!template.tier || template.tier === "free") return true;
    if (!isAuthenticated) return false;
    return tierHierarchy[userTier as keyof typeof tierHierarchy] >= tierHierarchy[template.tier as keyof typeof tierHierarchy];
  };
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Template customization state
  const [customizations, setCustomizations] = useState({
    tone: "professional",
    length: "medium",
    industry: "",
    targetAudience: "",
    specificGoals: "",
    additionalContext: ""
  });

  // Comprehensive template data with rich customization options
  const templateCategories = {
    "business-strategy": {
      name: "Business Strategy",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
      description: "Strategic planning, market analysis, and competitive positioning",
      painPoint: "Businesses struggle to create clear, actionable strategies that drive growth",
      templates: [
        {
          id: "startup-pitch-deck",
          name: "Startup Pitch Deck Mastery",
          description: "Create investor-ready pitch decks that secure funding with compelling storytelling",
          painPoint: "90% of startups fail to get funding due to unclear value propositions",
          solution: "Structured narrative framework that converts investors into believers",
          tags: ["Fundraising", "Investment", "Storytelling", "Startup"],
          difficulty: "Advanced" as const,
          estimatedTime: "15-25 min",
          usageCount: 3247,
          rating: 4.9,
          featured: true,
          trending: true,
          premium: true,
          tier: "pro", // "free", "starter", "pro", "business"
          categoryKey: "business-strategy",
          previewPrompt: "Create a compelling 10-slide investor pitch deck for [COMPANY_NAME] in the [INDUSTRY] sector...",
          customizationFields: [
            { label: "Company Name", type: "text" as const, required: true, placeholder: "Your startup name" },
            { label: "Industry", type: "select" as const, required: true, options: ["SaaS", "E-commerce", "FinTech", "HealthTech", "EdTech", "AI/ML", "Other"] },
            { label: "Funding Stage", type: "select" as const, required: true, options: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"] },
            { label: "Funding Amount", type: "text" as const, required: true, placeholder: "e.g., $500K, $2M" },
            { label: "Target Market", type: "textarea" as const, required: true, placeholder: "Describe your target customers" },
            { label: "Unique Value Proposition", type: "textarea" as const, required: true, placeholder: "What makes you different?" }
          ]
        },
        {
          id: "market-penetration",
          name: "Market Penetration Strategy",
          description: "Develop data-driven strategies to capture and dominate market segments",
          painPoint: "Companies struggle to gain market share in competitive landscapes",
          solution: "Systematic market entry framework with tactical execution plans",
          tags: ["Market Strategy", "Competition", "Growth", "Analysis"],
          difficulty: "Expert" as const,
          estimatedTime: "20-30 min",
          usageCount: 2156,
          rating: 4.8,
          featured: true,
          trending: false,
          premium: true,
          categoryKey: "business-strategy",
          previewPrompt: "Develop a comprehensive market penetration strategy for [PRODUCT/SERVICE] targeting [TARGET_MARKET]...",
          customizationFields: [
            { label: "Product/Service", type: "text" as const, required: true, placeholder: "What are you launching?" },
            { label: "Target Market", type: "text" as const, required: true, placeholder: "Primary market segment" },
            { label: "Budget Range", type: "select" as const, required: true, options: ["$10K-50K", "$50K-200K", "$200K-1M", "$1M+"] },
            { label: "Key Competitors", type: "textarea" as const, required: true, placeholder: "List main competitors" },
            { label: "Timeline", type: "select" as const, required: true, options: ["3 months", "6 months", "12 months", "18+ months"] }
          ]
        },
        {
          id: "business-model-canvas",
          name: "Business Model Innovation",
          description: "Design and validate innovative business models that create sustainable value",
          painPoint: "Traditional business models fail in today's rapidly changing markets",
          solution: "Modern business model framework adapted for digital transformation",
          tags: ["Business Model", "Innovation", "Strategy", "Revenue"],
          difficulty: "Intermediate" as const,
          estimatedTime: "18-22 min",
          usageCount: 1834,
          rating: 4.7,
          featured: false,
          trending: true,
          premium: false,
          categoryKey: "business-strategy",
          previewPrompt: "Create an innovative business model for [BUSINESS_CONCEPT] that addresses [KEY_PROBLEM]...",
          customizationFields: [
            { label: "Business Concept", type: "text" as const, required: true, placeholder: "Your business idea" },
            { label: "Key Problem", type: "textarea" as const, required: true, placeholder: "What problem are you solving?" },
            { label: "Revenue Model", type: "select" as const, required: true, options: ["Subscription", "One-time", "Freemium", "Commission", "Advertising", "Other"] },
            { label: "Target Customer", type: "text" as const, required: true, placeholder: "Who is your ideal customer?" }
          ]
        },
        {
          id: "competitive-analysis",
          name: "Competitive Intelligence Framework",
          description: "Conduct deep competitive analysis to identify opportunities and threats",
          painPoint: "Businesses lack systematic approaches to understand their competitive landscape",
          solution: "Comprehensive competitive intelligence methodology with actionable insights",
          tags: ["Competition", "Analysis", "Intelligence", "Strategy"],
          difficulty: "Advanced" as const,
          estimatedTime: "25-35 min",
          usageCount: 1567,
          rating: 4.6,
          featured: false,
          trending: false,
          premium: false,
          tier: "free",
          categoryKey: "business-strategy",
          previewPrompt: "Develop a competitive analysis framework for [YOUR_COMPANY] in the [INDUSTRY] market...",
          customizationFields: [
            { label: "Your Company", type: "text" as const, required: true, placeholder: "Your company name" },
            { label: "Industry", type: "text" as const, required: true, placeholder: "Your industry" },
            { label: "Key Competitors", type: "textarea" as const, required: true, placeholder: "List 3-5 main competitors" },
            { label: "Analysis Focus", type: "select" as const, required: true, options: ["Pricing", "Features", "Marketing", "Customer Service", "All Areas"] }
          ]
        }
      ]
    },
    "marketing-sales": {
      name: "Marketing & Sales",
      icon: TrendingUp,
      color: "from-pink-500 to-rose-500",
      description: "High-converting campaigns, sales funnels, and customer acquisition",
      painPoint: "Marketing campaigns fail to generate qualified leads and sales",
      templates: [
        {
          id: "viral-social-campaign",
          name: "Viral Social Media Campaign",
          description: "Create psychology-driven social campaigns that achieve massive organic reach",
          painPoint: "Most social content gets lost in the noise with zero engagement",
          solution: "Science-based viral content framework that triggers sharing behaviors",
          tags: ["Social Media", "Viral", "Engagement", "Psychology"],
          difficulty: "Intermediate" as const,
          estimatedTime: "12-18 min",
          usageCount: 4521,
          rating: 4.8,
          featured: true,
          trending: true,
          premium: false,
          categoryKey: "marketing-sales",
          previewPrompt: "Design a viral social media campaign for [BRAND/PRODUCT] targeting [AUDIENCE] on [PLATFORM]...",
          customizationFields: [
            { label: "Brand/Product", type: "text" as const, required: true, placeholder: "What are you promoting?" },
            { label: "Target Audience", type: "text" as const, required: true, placeholder: "Who is your audience?" },
            { label: "Primary Platform", type: "select" as const, required: true, options: ["Instagram", "TikTok", "LinkedIn", "Twitter", "Facebook", "YouTube"] },
            { label: "Campaign Goal", type: "select" as const, required: true, options: ["Brand Awareness", "Lead Generation", "Sales", "Engagement", "App Downloads"] },
            { label: "Budget Range", type: "select" as const, required: false, options: ["Organic Only", "$100-500", "$500-2K", "$2K-10K", "$10K+"] }
          ]
        },
        {
          id: "sales-funnel-optimizer",
          name: "High-Converting Sales Funnel",
          description: "Build sales funnels that convert cold traffic into paying customers",
          painPoint: "Sales funnels leak customers at every stage, wasting marketing spend",
          solution: "Conversion-optimized funnel architecture with psychological triggers",
          tags: ["Sales Funnel", "Conversion", "Lead Generation", "Revenue"],
          difficulty: "Advanced" as const,
          estimatedTime: "20-28 min",
          usageCount: 3156,
          rating: 4.9,
          featured: true,
          trending: true,
          premium: true,
          tier: "business",
          categoryKey: "marketing-sales",
          previewPrompt: "Create a high-converting sales funnel for [PRODUCT/SERVICE] with [TRAFFIC_SOURCE] targeting [CUSTOMER_TYPE]...",
          customizationFields: [
            { label: "Product/Service", type: "text" as const, required: true, placeholder: "What are you selling?" },
            { label: "Price Point", type: "select" as const, required: true, options: ["Under $100", "$100-500", "$500-2K", "$2K-10K", "$10K+"] },
            { label: "Traffic Source", type: "select" as const, required: true, options: ["Google Ads", "Facebook Ads", "Organic Social", "Email", "Referrals", "SEO"] },
            { label: "Customer Type", type: "select" as const, required: true, options: ["B2B", "B2C", "Both"] },
            { label: "Current Conversion Rate", type: "text" as const, required: false, placeholder: "If known (e.g., 2%)" }
          ]
        },
        {
          id: "email-sequence",
          name: "Email Marketing Mastery",
          description: "Craft email sequences that nurture leads and drive consistent sales",
          painPoint: "Email campaigns have low open rates and even lower conversion rates",
          solution: "Behavioral email sequences that build trust and drive action",
          tags: ["Email Marketing", "Nurturing", "Automation", "Sales"],
          difficulty: "Intermediate" as const,
          estimatedTime: "15-20 min",
          usageCount: 2834,
          rating: 4.7,
          featured: false,
          trending: true,
          premium: false,
          categoryKey: "marketing-sales",
          previewPrompt: "Create an email nurture sequence for [BUSINESS] to convert [LEAD_TYPE] into [DESIRED_ACTION]...",
          customizationFields: [
            { label: "Business/Product", type: "text" as const, required: true, placeholder: "Your business or product" },
            { label: "Lead Type", type: "text" as const, required: true, placeholder: "Type of leads (e.g., webinar attendees)" },
            { label: "Sequence Goal", type: "select" as const, required: true, options: ["Product Sale", "Service Booking", "Demo Request", "Download", "Subscription"] },
            { label: "Sequence Length", type: "select" as const, required: true, options: ["3 emails", "5 emails", "7 emails", "10+ emails"] },
            { label: "Sending Frequency", type: "select" as const, required: true, options: ["Daily", "Every 2 days", "Weekly", "Custom timing"] }
          ]
        },
        {
          id: "brand-positioning",
          name: "Brand Positioning Strategy",
          description: "Position your brand uniquely in customers' minds for maximum impact",
          painPoint: "Brands blend together, failing to create memorable differentiation",
          solution: "Strategic brand positioning that creates lasting competitive advantages",
          tags: ["Branding", "Positioning", "Differentiation", "Strategy"],
          difficulty: "Advanced" as const,
          estimatedTime: "22-30 min",
          usageCount: 1923,
          rating: 4.8,
          featured: false,
          trending: false,
          premium: true,
          tier: "starter",
          categoryKey: "marketing-sales",
          previewPrompt: "Develop a unique brand positioning strategy for [BRAND] in the [MARKET] targeting [AUDIENCE]...",
          customizationFields: [
            { label: "Brand Name", type: "text" as const, required: true, placeholder: "Your brand name" },
            { label: "Market/Industry", type: "text" as const, required: true, placeholder: "Your market or industry" },
            { label: "Target Audience", type: "text" as const, required: true, placeholder: "Primary audience" },
            { label: "Key Differentiator", type: "textarea" as const, required: true, placeholder: "What makes you different?" },
            { label: "Brand Personality", type: "select" as const, required: true, options: ["Premium", "Friendly", "Innovative", "Trustworthy", "Rebellious", "Expert", "Other"] }
          ]
        }
      ]
    },
    "content-creation": {
      name: "Content Creation",
      icon: PenTool,
      color: "from-purple-500 to-indigo-500",
      description: "Engaging content that captures attention and drives action",
      painPoint: "Content creators struggle to consistently produce engaging, high-quality content",
      templates: [
        {
          id: "youtube-viral-script",
          name: "YouTube Viral Script Formula",
          description: "Write YouTube scripts that hook viewers and drive massive engagement",
          painPoint: "Most YouTube videos lose 70% of viewers in the first 30 seconds",
          solution: "Proven viral script structure that maximizes retention and engagement",
          tags: ["YouTube", "Video Script", "Viral", "Engagement"],
          difficulty: "Intermediate" as const,
          estimatedTime: "15-22 min",
          usageCount: 5234,
          rating: 4.9,
          featured: true,
          trending: true,
          premium: false,
          categoryKey: "content-creation",
          previewPrompt: "Create a viral YouTube script about [TOPIC] for [AUDIENCE] that [GOAL]...",
          customizationFields: [
            { label: "Video Topic", type: "text" as const, required: true, placeholder: "Main topic of your video" },
            { label: "Target Audience", type: "text" as const, required: true, placeholder: "Who is watching?" },
            { label: "Video Length", type: "select" as const, required: true, options: ["Under 5 min", "5-10 min", "10-20 min", "20+ min"] },
            { label: "Content Goal", type: "select" as const, required: true, options: ["Educate", "Entertain", "Inspire", "Sell", "Build Authority"] },
            { label: "Channel Niche", type: "text" as const, required: false, placeholder: "Your channel niche" }
          ]
        },
        {
          id: "blog-content-strategy",
          name: "SEO Blog Content Domination",
          description: "Create blog content that ranks #1 on Google and converts readers",
          painPoint: "Blog posts fail to rank on Google or convert readers into customers",
          solution: "SEO-optimized content strategy that dominates search results",
          tags: ["SEO", "Blog", "Content Strategy", "Google"],
          difficulty: "Advanced" as const,
          estimatedTime: "18-25 min",
          usageCount: 3567,
          rating: 4.8,
          featured: true,
          trending: false,
          premium: true,
          categoryKey: "content-creation",
          previewPrompt: "Create an SEO blog content strategy for [BUSINESS] targeting [KEYWORDS] to [GOAL]...",
          customizationFields: [
            { label: "Business/Website", type: "text" as const, required: true, placeholder: "Your business or website" },
            { label: "Primary Keywords", type: "textarea" as const, required: true, placeholder: "List main keywords to target" },
            { label: "Content Goal", type: "select" as const, required: true, options: ["Drive Traffic", "Generate Leads", "Build Authority", "Increase Sales"] },
            { label: "Publishing Frequency", type: "select" as const, required: true, options: ["Daily", "3x per week", "Weekly", "Bi-weekly", "Monthly"] },
            { label: "Content Length", type: "select" as const, required: true, options: ["800-1200 words", "1200-2000 words", "2000-3000 words", "3000+ words"] }
          ]
        },
        {
          id: "social-media-calendar",
          name: "Social Media Content Calendar",
          description: "Plan and create consistent, engaging social media content that builds community",
          painPoint: "Inconsistent posting and lack of engagement kills social media growth",
          solution: "Strategic content calendar with proven engagement formulas",
          tags: ["Social Media", "Content Calendar", "Planning", "Engagement"],
          difficulty: "Beginner" as const,
          estimatedTime: "12-18 min",
          usageCount: 4123,
          rating: 4.6,
          featured: false,
          trending: true,
          premium: false,
          categoryKey: "content-creation",
          previewPrompt: "Create a 30-day social media content calendar for [BRAND] on [PLATFORMS] targeting [AUDIENCE]...",
          customizationFields: [
            { label: "Brand/Business", type: "text" as const, required: true, placeholder: "Your brand or business" },
            { label: "Platforms", type: "select" as const, required: true, options: ["Instagram only", "Instagram + Facebook", "LinkedIn", "TikTok", "All platforms"] },
            { label: "Posting Frequency", type: "select" as const, required: true, options: ["Daily", "5x per week", "3x per week", "Weekly"] },
            { label: "Content Mix", type: "select" as const, required: true, options: ["Educational", "Entertainment", "Behind-the-scenes", "Mixed content"] },
            { label: "Business Type", type: "text" as const, required: true, placeholder: "What type of business?" }
          ]
        },
        {
          id: "copywriting-formulas",
          name: "High-Converting Copywriting",
          description: "Master proven copywriting formulas that compel action and drive sales",
          painPoint: "Copy fails to persuade readers to take action, resulting in lost sales",
          solution: "Time-tested copywriting formulas that tap into psychology and drive results",
          tags: ["Copywriting", "Sales Copy", "Persuasion", "Conversion"],
          difficulty: "Advanced" as const,
          estimatedTime: "20-30 min",
          usageCount: 2845,
          rating: 4.9,
          featured: true,
          trending: false,
          premium: true,
          categoryKey: "content-creation",
          previewPrompt: "Write high-converting copy for [PRODUCT/SERVICE] targeting [AUDIENCE] using [FORMULA] to [ACTION]...",
          customizationFields: [
            { label: "Product/Service", type: "text" as const, required: true, placeholder: "What are you promoting?" },
            { label: "Target Audience", type: "text" as const, required: true, placeholder: "Who are you writing for?" },
            { label: "Copy Type", type: "select" as const, required: true, options: ["Sales Page", "Email", "Ad Copy", "Landing Page", "Product Description"] },
            { label: "Desired Action", type: "select" as const, required: true, options: ["Buy Now", "Sign Up", "Download", "Book Call", "Subscribe"] },
            { label: "Tone", type: "select" as const, required: true, options: ["Professional", "Friendly", "Urgent", "Authoritative", "Conversational"] }
          ]
        }
      ]
    },
    "personal-development": {
      name: "Personal Development",
      icon: Brain,
      color: "from-emerald-500 to-teal-500",
      description: "Goal achievement, productivity, and personal growth strategies",
      painPoint: "People struggle to achieve their goals and reach their full potential",
      templates: [
        {
          id: "goal-achievement-system",
          name: "Goal Achievement Master Plan",
          description: "Create bulletproof systems to achieve any goal with consistent progress",
          painPoint: "92% of people fail to achieve their New Year's goals due to lack of systems",
          solution: "Science-backed goal achievement methodology with built-in accountability",
          tags: ["Goals", "Achievement", "Planning", "Success"],
          difficulty: "Intermediate" as const,
          estimatedTime: "18-25 min",
          usageCount: 2156,
          rating: 4.8,
          featured: true,
          trending: true,
          premium: false,
          categoryKey: "personal-development",
          previewPrompt: "Create a comprehensive goal achievement plan for [GOAL] with [TIMELINE] using [APPROACH]...",
          customizationFields: [
            { label: "Primary Goal", type: "text" as const, required: true, placeholder: "What do you want to achieve?" },
            { label: "Timeline", type: "select" as const, required: true, options: ["30 days", "90 days", "6 months", "1 year", "2+ years"] },
            { label: "Goal Category", type: "select" as const, required: true, options: ["Career", "Health", "Relationships", "Financial", "Learning", "Other"] },
            { label: "Biggest Challenge", type: "textarea" as const, required: true, placeholder: "What's holding you back?" },
            { label: "Success Measure", type: "text" as const, required: true, placeholder: "How will you measure success?" }
          ]
        },
        {
          id: "productivity-system",
          name: "Ultimate Productivity System",
          description: "Build personalized productivity systems that multiply your output",
          painPoint: "Busy professionals waste hours on low-value tasks while important work suffers",
          solution: "Customized productivity framework that maximizes focus and output",
          tags: ["Productivity", "Time Management", "Focus", "Efficiency"],
          difficulty: "Advanced" as const,
          estimatedTime: "22-30 min",
          usageCount: 1834,
          rating: 4.7,
          featured: false,
          trending: true,
          premium: true,
          categoryKey: "personal-development",
          previewPrompt: "Design a productivity system for [ROLE] with [CHALLENGES] to achieve [OUTCOME]...",
          customizationFields: [
            { label: "Your Role/Job", type: "text" as const, required: true, placeholder: "Your current role or job" },
            { label: "Main Challenges", type: "textarea" as const, required: true, placeholder: "What productivity challenges do you face?" },
            { label: "Work Style", type: "select" as const, required: true, options: ["Deep Work", "Collaborative", "Mixed", "Remote", "Office-based"] },
            { label: "Priority Goal", type: "text" as const, required: true, placeholder: "What's your #1 productivity goal?" },
            { label: "Available Time", type: "select" as const, required: true, options: ["2-4 hours", "4-6 hours", "6-8 hours", "8+ hours"] }
          ]
        },
        {
          id: "habit-formation",
          name: "Atomic Habit Builder",
          description: "Create powerful habit stacks that transform your life through small changes",
          painPoint: "People fail to build lasting habits, reverting to old patterns within weeks",
          solution: "Scientific habit formation system based on behavioral psychology",
          tags: ["Habits", "Behavior Change", "Psychology", "Transformation"],
          difficulty: "Beginner" as const,
          estimatedTime: "12-18 min",
          usageCount: 3245,
          rating: 4.9,
          featured: true,
          trending: false,
          premium: false,
          categoryKey: "personal-development",
          previewPrompt: "Build a habit formation system for [HABIT] that fits [LIFESTYLE] with [MOTIVATION]...",
          customizationFields: [
            { label: "Target Habit", type: "text" as const, required: true, placeholder: "What habit do you want to build?" },
            { label: "Current Lifestyle", type: "textarea" as const, required: true, placeholder: "Describe your typical day" },
            { label: "Motivation Level", type: "select" as const, required: true, options: ["High", "Medium", "Low", "Varies"] },
            { label: "Previous Attempts", type: "select" as const, required: false, options: ["Never tried", "Tried once", "Multiple attempts", "Always struggle"] },
            { label: "Success Timeline", type: "select" as const, required: true, options: ["2 weeks", "1 month", "2 months", "3+ months"] }
          ]
        }
      ]
    },
    "social-media": {
      name: "Social Media & Content Creation",
      icon: MessageSquare,
      color: "from-pink-500 to-purple-600",
      description: "Viral content creation for TikTok, Instagram, Facebook, and all social platforms",
      painPoint: "95% of content creators struggle to consistently create engaging, viral content",
      templates: [
        {
          id: "viral-tiktok-script",
          name: "Viral TikTok Script Generator",
          description: "Create scroll-stopping TikTok videos that get millions of views and followers",
          painPoint: "Most TikToks get under 100 views because they don't follow viral patterns",
          solution: "Proven viral script formulas used by top creators to guarantee engagement",
          tags: ["TikTok", "Viral Content", "Short Form", "Engagement"],
          difficulty: "Beginner" as const,
          estimatedTime: "5-10 min",
          usageCount: 8924,
          rating: 4.9,
          featured: true,
          trending: true,
          premium: false,
          tier: "free",
          categoryKey: "social-media",
          previewPrompt: "Create a viral TikTok script for [TOPIC] targeting [AUDIENCE] using the [HOOK_TYPE] formula...",
          customizationFields: [
            { label: "Video Topic", type: "text" as const, required: true, placeholder: "What's your video about?" },
            { label: "Target Audience", type: "select" as const, required: true, options: ["Gen Z", "Millennials", "Gen X", "Everyone", "Business Owners"] },
            { label: "Hook Type", type: "select" as const, required: true, options: ["Question Hook", "Shocking Statement", "Trending Sound", "Before/After", "Storytime"] },
            { label: "Video Length", type: "select" as const, required: true, options: ["15-30 seconds", "30-60 seconds", "60+ seconds"] },
            { label: "Call-to-Action", type: "select" as const, required: false, options: ["Follow for more", "Like if you agree", "Comment your thoughts", "Share with friends", "Save for later"] }
          ]
        },
        {
          id: "instagram-reels-viral",
          name: "Instagram Reels Viral Formula",
          description: "Master the Instagram algorithm with Reels that explode your reach and engagement",
          painPoint: "Instagram Reels get buried in the algorithm without the right viral elements",
          solution: "Algorithm-optimized Reels templates that guarantee maximum reach and saves",
          tags: ["Instagram", "Reels", "Algorithm", "Viral Growth"],
          difficulty: "Intermediate" as const,
          estimatedTime: "8-15 min",
          usageCount: 6543,
          rating: 4.8,
          featured: true,
          trending: true,
          premium: true,
          tier: "starter",
          categoryKey: "social-media",
          previewPrompt: "Create an Instagram Reel for [NICHE] using [TRENDING_FORMAT] to [GOAL]...",
          customizationFields: [
            { label: "Your Niche", type: "select" as const, required: true, options: ["Fitness", "Business", "Lifestyle", "Food", "Fashion", "Education", "Entertainment", "DIY"] },
            { label: "Trending Format", type: "select" as const, required: true, options: ["Before/After", "Day in the Life", "Tutorial", "Transformation", "Behind the Scenes", "Q&A"] },
            { label: "Primary Goal", type: "select" as const, required: true, options: ["Gain Followers", "Drive Sales", "Build Authority", "Increase Engagement", "Go Viral"] },
            { label: "Content Pillar", type: "select" as const, required: true, options: ["Educational", "Entertaining", "Inspiring", "Personal", "Promotional"] }
          ]
        },
        {
          id: "facebook-ads-copy",
          name: "Facebook Ads Copy That Converts",
          description: "Write Facebook ad copy that stops the scroll and drives massive conversions",
          painPoint: "Most Facebook ads have terrible copy that wastes thousands in ad spend",
          solution: "Conversion-optimized ad copy formulas that reduce CPA and maximize ROAS",
          tags: ["Facebook Ads", "Conversion Copy", "Marketing", "Sales"],
          difficulty: "Advanced" as const,
          estimatedTime: "15-25 min",
          usageCount: 4367,
          rating: 4.9,
          featured: false,
          trending: false,
          premium: true,
          tier: "pro",
          categoryKey: "social-media",
          previewPrompt: "Write Facebook ad copy for [PRODUCT] targeting [AUDIENCE] with [PAIN_POINT] focus...",
          customizationFields: [
            { label: "Product/Service", type: "text" as const, required: true, placeholder: "What are you selling?" },
            { label: "Target Audience", type: "textarea" as const, required: true, placeholder: "Describe your ideal customer" },
            { label: "Main Pain Point", type: "textarea" as const, required: true, placeholder: "What problem does your product solve?" },
            { label: "Unique Selling Proposition", type: "textarea" as const, required: true, placeholder: "Why choose you over competitors?" },
            { label: "Price Point", type: "select" as const, required: true, options: ["Under $50", "$50-200", "$200-500", "$500-2K", "$2K+"] },
            { label: "Campaign Objective", type: "select" as const, required: true, options: ["Lead Generation", "Sales", "App Downloads", "Website Traffic", "Brand Awareness"] }
          ]
        },
        {
          id: "youtube-shorts-viral",
          name: "YouTube Shorts Viral Mastery",
          description: "Create YouTube Shorts that explode your subscriber count and monetization",
          painPoint: "YouTube Shorts creators struggle to break through the noise and gain subscribers",
          solution: "Proven Shorts strategies that top creators use to get millions of views",
          tags: ["YouTube Shorts", "Viral Growth", "Monetization", "Subscribers"],
          difficulty: "Intermediate" as const,
          estimatedTime: "10-20 min",
          usageCount: 5789,
          rating: 4.7,
          featured: true,
          trending: false,
          premium: true,
          tier: "starter",
          categoryKey: "social-media",
          previewPrompt: "Create a YouTube Short script for [NICHE] using [VIRAL_FORMAT] to gain [GOAL]...",
          customizationFields: [
            { label: "Channel Niche", type: "select" as const, required: true, options: ["Tech Reviews", "Gaming", "Comedy", "Education", "Lifestyle", "Business", "Health", "Finance"] },
            { label: "Viral Format", type: "select" as const, required: true, options: ["Quick Tips", "Reaction", "Tutorial", "List/Countdown", "Comparison", "Storytime"] },
            { label: "Main Goal", type: "select" as const, required: true, options: ["Gain Subscribers", "Increase Watch Time", "Drive Traffic", "Build Authority", "Go Viral"] }
          ]
        },
        {
          id: "linkedin-viral-posts",
          name: "LinkedIn Viral Post Formula",
          description: "Write LinkedIn posts that go viral and build your professional brand",
          painPoint: "LinkedIn posts get ignored because they sound corporate and boring",
          solution: "Authentic storytelling formulas that make your LinkedIn posts irresistible",
          tags: ["LinkedIn", "Professional Brand", "B2B", "Networking"],
          difficulty: "Intermediate" as const,
          estimatedTime: "12-18 min",
          usageCount: 3421,
          rating: 4.6,
          featured: false,
          trending: true,
          premium: true,
          tier: "pro",
          categoryKey: "social-media",
          previewPrompt: "Write a viral LinkedIn post about [TOPIC] using [STORYTELLING_FORMAT] for [AUDIENCE]...",
          customizationFields: [
            { label: "Post Topic", type: "text" as const, required: true, placeholder: "What's your post about?" },
            { label: "Storytelling Format", type: "select" as const, required: true, options: ["Personal Story", "Industry Insight", "Behind the Scenes", "Lesson Learned", "Controversial Take"] },
            { label: "Target Audience", type: "select" as const, required: true, options: ["Entrepreneurs", "Corporate Executives", "Sales Professionals", "Marketers", "HR Leaders", "Job Seekers"] },
            { label: "Call-to-Action", type: "select" as const, required: true, options: ["Engage in Comments", "Share Your Experience", "Connect with Me", "Follow for More", "Visit My Profile"] }
          ]
        },
        {
          id: "cross-platform-content",
          name: "Cross-Platform Content Strategy",
          description: "Create content that dominates across ALL social media platforms simultaneously",
          painPoint: "Managing content across multiple platforms is overwhelming and time-consuming",
          solution: "Master content adaptation strategy to maximize reach across every platform",
          tags: ["Multi-Platform", "Content Strategy", "Efficiency", "Viral Marketing"],
          difficulty: "Advanced" as const,
          estimatedTime: "25-35 min",
          usageCount: 2156,
          rating: 4.8,
          featured: true,
          trending: false,
          premium: true,
          tier: "business",
          categoryKey: "social-media",
          previewPrompt: "Create a cross-platform content strategy for [BRAND] in [INDUSTRY] targeting [AUDIENCE] across [PLATFORMS]...",
          customizationFields: [
            { label: "Brand/Business", type: "text" as const, required: true, placeholder: "Your brand name" },
            { label: "Industry", type: "select" as const, required: true, options: ["E-commerce", "SaaS", "Coaching", "Agency", "Creator Economy", "B2B Services", "Healthcare", "Finance"] },
            { label: "Target Platforms", type: "select" as const, required: true, options: ["TikTok + Instagram", "All Major Platforms", "LinkedIn + Twitter", "YouTube + Instagram", "Facebook + Instagram"] },
            { label: "Content Themes", type: "textarea" as const, required: true, placeholder: "What topics will you cover?" },
            { label: "Publishing Frequency", type: "select" as const, required: true, options: ["Daily", "3x per week", "Weekly", "Multiple times daily"] },
            { label: "Team Size", type: "select" as const, required: true, options: ["Solo creator", "2-3 people", "Small team (4-10)", "Large team (10+)"] }
          ]
        }
      ]
    }
  };

  // Create flat array of all templates
  const allTemplates = Object.entries(templateCategories).flatMap(([categoryKey, category]) =>
    (Array.isArray(category.templates) ? category.templates : []).map(template => ({ ...template, categoryName: category.name, categoryKey }))
  );

  // Get all unique tags
  const allTags = Array.from(new Set((Array.isArray(allTemplates) ? allTemplates : []).flatMap(t => t.tags)));

  // Filter and sort templates
  const filteredTemplates = allTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || template.categoryKey === activeCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      const matchesTag = selectedTag === 'all' || template.tags.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTag;
    })
    .sort((a, b) => {
      // Sort by featured first, then trending, then usage count
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      return b.usageCount - a.usageCount;
    });

  // Template statistics
  const stats = {
    totalTemplates: allTemplates.length,
    featuredCount: allTemplates.filter(t => t.featured).length,
    trendingCount: allTemplates.filter(t => t.trending).length,
    avgRating: (allTemplates.reduce((sum, t) => sum + t.rating, 0) / allTemplates.length).toFixed(1)
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );

    toast({
      title: favorites.includes(templateId) ? "Removed from favorites" : "Added to favorites",
      description: "Your template library has been updated."
    });
  };

  const handleUseTemplate = (template: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use templates.",
        variant: "destructive",
      });
      setLocation('/signin');
      return;
    }

    // Check tier access
    if (!canAccessTemplate(template)) {
      toast({
        title: "Upgrade Required",
        description: `This template requires ${template.tier} subscription. Upgrade to access premium features!`,
        variant: "destructive",
      });
      // Redirect to pricing page with the required tier pre-selected
      setLocation(`/pricing?upgrade=${template.tier}&feature=template&template=${template.id}`);
      return;
    }

    // Track template usage for rating system
    trackFeatureUsage('template_use', template.categoryKey);

    // Track milestone if this is user's first template
    if (!sessionStorage.getItem('first_template_used')) {
      sessionStorage.setItem('first_template_used', 'true');
      trackMilestone('first_template_saved');
    }

    // Store template data for questionnaire
    sessionStorage.setItem('questionnaire', JSON.stringify({
      category: template.categoryKey,
      templateData: template,
      isTemplate: true,
      customizations: customizations
    }));

    setLocation(`/questionnaire/${template.categoryKey}`);
  };

  const handleCustomizeTemplate = (template: any) => {
    setSelectedTemplate(template);
    setCustomizationOpen(true);
  };

  const handleCustomizationSubmit = () => {
    if (!selectedTemplate) return;

    // Store customized template data
    const customizedTemplate = {
      ...selectedTemplate,
      customizations,
      isCustomized: true
    };

    sessionStorage.setItem('selectedTemplate', JSON.stringify(customizedTemplate));
    setCustomizationOpen(false);

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your customized template.",
        variant: "destructive",
      });
      setLocation('/signin');
      return;
    }

    setLocation(`/questionnaire/${selectedTemplate.categoryKey}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-4">
          <BackButton />
          {isAuthenticated && (
            <div className="hidden md:block">
              <TokenBalance />
            </div>
          )}
        </div>
      </div>

      {/* Spectacular Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-600 font-medium text-sm mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Extraordinary Template Experience
          </div>

          <h1 className="text-6xl font-bold text-slate-900 mb-6">
            Premium <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">AI Templates</span>
          </h1>
          <p className="text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Skip months of trial and error. Start with battle-tested templates that deliver extraordinary results,
            <span className="font-semibold text-slate-800"> fully customizable to your unique needs.</span>
          </p>

          {/* Dynamic Stats with Animation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { label: "Premium Templates", value: stats.totalTemplates, icon: Target, color: "from-blue-500 to-cyan-500" },
              { label: "Featured", value: stats.featuredCount, icon: Star, color: "from-yellow-500 to-orange-500" },
              { label: "Trending Now", value: stats.trendingCount, icon: TrendingUp, color: "from-pink-500 to-rose-500" },
              { label: "Avg Rating", value: stats.avgRating, icon: Users, color: "from-emerald-500 to-teal-500" }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {typeof stat.value === 'number' && stat.value > 10 ? (
                      <AnimatedCounter end={stat.value} duration={2000 + index * 300} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Filters Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* Search and Primary Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1 min-w-[350px]">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search templates, categories, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-white/20 shadow-sm text-base"
                  />
                </div>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[200px] h-12 bg-white/80 backdrop-blur-sm border-white/20 shadow-sm">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[200px] h-12 bg-white/80 backdrop-blur-sm border-white/20 shadow-sm">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {(Array.isArray(allTags) ? allTags : []).map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results and View Toggle */}
              <div className="flex items-center justify-between gap-6">
                <p className="text-slate-600 font-medium">
                  Showing <span className="font-bold text-slate-900 text-lg">{filteredTemplates.length}</span> templates
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="w-12 h-10 p-0"
                  >
                    <Grid className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="w-12 h-10 p-0"
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                onClick={() => setActiveCategory("all")}
                size="lg"
                className="h-12 px-6 font-semibold"
              >
                All Categories
              </Button>
              {(Array.isArray(Object.entries(templateCategories)) ? Object.entries(templateCategories) : []).map(([key, category]) => {
                const Icon = category.icon;
                const isActive = activeCategory === key;
                return (
                  <Button
                    key={key}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setActiveCategory(key)}
                    size="lg"
                    className={`h-12 px-6 flex items-center space-x-3 font-semibold transition-all ${
                      isActive ? 'shadow-lg scale-105' : 'hover:scale-102'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Extraordinary Templates Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid gap-8 ${
          viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {(Array.isArray(filteredTemplates) ? filteredTemplates : []).map((template, index) => (
            <Card
              key={`${template.categoryKey}-${template.id}`}
              className="group relative bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-[1.02] cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium Badges */}
              <div className="absolute top-6 left-6 flex space-x-2 z-20">
                {template.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {template.trending && (
                  <Badge className="bg-gradient-to-r from-pink-400 to-rose-500 text-white text-xs font-semibold px-3 py-1 shadow-lg">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {template.tier && template.tier !== 'free' && (
                  <Badge className={`text-white text-xs font-semibold px-3 py-1 shadow-lg ${
                    template.tier === 'starter' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    template.tier === 'pro' ? 'bg-gradient-to-r from-purple-400 to-indigo-500' :
                    template.tier === 'business' ? 'bg-gradient-to-r from-amber-400 to-orange-600' :
                    'bg-gradient-to-r from-purple-400 to-indigo-500'
                  }`}>
                    {template.tier === 'starter' && <Shield className="w-3 h-3 mr-1" />}
                    {template.tier === 'pro' && <Crown className="w-3 h-3 mr-1 fill-current" />}
                    {template.tier === 'business' && <Star className="w-3 h-3 mr-1 fill-current" />}
                    {template.tier.charAt(0).toUpperCase() + template.tier.slice(1)}
                  </Badge>
                )}
              </div>

              {/* Access Lock Overlay */}
              {!canAccessTemplate(template) && (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30 cursor-pointer hover:bg-black/70 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestrictedTemplateClick(template);
                  }}
                >
                  <div className="text-center text-white p-6">
                    <div className="relative mb-4">
                      <Lock className="w-16 h-16 mx-auto text-white/80 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
                    </div>
                    <h4 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      {template.tier?.charAt(0).toUpperCase() + template.tier?.slice(1)} Required
                    </h4>
                    <p className="text-white/90 mb-4">
                      Click to see upgrade options
                    </p>
                    <TierIndicator
                      requiredTier={template.tier || 'starter'}
                      currentTier={userTier || 'free'}
                      featureName={template.name}
                      variant="badge"
                      size="md"
                    />
                  </div>
                </div>
              )}

              {/* Favorite Heart */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
                className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm border border-white/30 hover:scale-110 transition-all shadow-lg"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(template.id)
                      ? 'text-red-500 fill-current'
                      : 'text-slate-400 hover:text-red-400'
                  }`}
                />
              </button>

              <CardHeader className="pb-6">
                <div className="pt-12">
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base leading-relaxed mb-6">
                    {template.description}
                  </CardDescription>
                </div>

                {/* Pain Point & Solution */}
                <div className="space-y-4 mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-2">Problem</p>
                        <p className="text-sm text-red-600 leading-relaxed">{template.painPoint}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">Solution</p>
                        <p className="text-sm text-green-600 leading-relaxed">{template.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Meta Information */}
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <Badge className={`${getDifficultyColor(template.difficulty)} font-semibold border`}>
                    {template.difficulty}
                  </Badge>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{template.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{template.usageCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span className="font-bold text-yellow-600">{template.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(Array.isArray(template.tags) ? template.tags : []).slice(0, 4).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs px-3 py-1 bg-slate-100 text-slate-700 font-medium">
                      +{template.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                    variant="outline"
                    className="w-full h-12 bg-white/50 hover:bg-white/80 border-slate-200 hover:border-indigo-300 transition-all font-semibold"
                    size="lg"
                  >
                    <Eye className="w-5 h-5 mr-3" />
                    Preview Template
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCustomizeTemplate(template);
                      }}
                      className="h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Customize
                    </Button>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                      className="h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </Button>
                  </div>

                  {/* Signup Options */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Link href="/register" className="flex-1">
                        <Button variant="outline" className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 font-medium py-2">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create Account
                        </Button>
                      </Link>
                      <Link href="/demo" className="flex-1">
                        <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium py-2">
                          Try Demo
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Spectacular Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* No Results State */}
        {filteredTemplates.length === 0 && (
          <Card className="bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardContent className="py-20">
              <div className="text-center max-w-lg mx-auto">
                <div className="w-32 h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Search className="text-indigo-500" size={48} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">No templates found</h3>
                <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                  Try adjusting your search terms or explore different categories to find the perfect template for your needs.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDifficulty('all');
                    setSelectedTag('all');
                    setActiveCategory('all');
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <RefreshCw className="w-5 h-5 mr-3" />
                  Reset All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call-to-Action Section */}
        {filteredTemplates.length > 0 && (
          <Card className="mt-16 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-cyan-50/80 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center max-w-4xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Lightbulb className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-6">
                  Need Something Custom? 🎯
                </h3>
                <p className="text-slate-600 mb-10 text-xl leading-relaxed">
                  Can't find the perfect template? Our intelligent questionnaire system creates
                  <span className="font-semibold text-slate-800"> completely custom prompts tailored to your specific needs and goals.</span>
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={() => setLocation('/categories')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Lightbulb className="w-6 h-6 mr-3" />
                    Create Custom Prompt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/dashboard')}
                    className="border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold px-8 py-4 text-lg transition-all"
                  >
                    <BarChart3 className="w-6 h-6 mr-3" />
                    View My Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Template Preview</DialogTitle>
            <DialogDescription className="text-base">
              Get a preview of what this template will generate
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">{previewTemplate.name}</h3>
                <p className="text-slate-600 mb-4">{previewTemplate.description}</p>
                <div className="bg-slate-50 border rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Preview Prompt:</p>
                  <p className="text-slate-600 italic">{previewTemplate.previewPrompt}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <div className="space-x-2">
                  <Button onClick={() => {
                    setPreviewTemplate(null);
                    handleCustomizeTemplate(previewTemplate);
                  }}>
                    <Settings className="w-4 h-4 mr-2" />
                    Customize This Template
                  </Button>
                  <Button onClick={() => {
                    setPreviewTemplate(null);
                    handleUseTemplate(previewTemplate);
                  }} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Play className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Customization Dialog */}
      <Dialog open={customizationOpen} onOpenChange={setCustomizationOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Customize Template</DialogTitle>
            <DialogDescription className="text-base">
              Personalize this template to match your specific needs
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedTemplate.name}</h3>
                <p className="text-slate-600 text-sm">{selectedTemplate.description}</p>
              </div>

              {/* General Customizations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={customizations.tone} onValueChange={(value) =>
                    setCustomizations(prev => ({ ...prev, tone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="length">Content Length</Label>
                  <Select value={customizations.length} onValueChange={(value) =>
                    setCustomizations(prev => ({ ...prev, length: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short & Concise</SelectItem>
                      <SelectItem value="medium">Medium Detail</SelectItem>
                      <SelectItem value="long">Comprehensive</SelectItem>
                      <SelectItem value="very-long">Very Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="industry">Industry/Niche</Label>
                <Input
                  placeholder="e.g., SaaS, E-commerce, Consulting"
                  value={customizations.industry}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  placeholder="e.g., Small business owners, Tech professionals"
                  value={customizations.targetAudience}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, targetAudience: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="goals">Specific Goals</Label>
                <Textarea
                  placeholder="What do you want to achieve with this template?"
                  value={customizations.specificGoals}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, specificGoals: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="context">Additional Context</Label>
                <Textarea
                  placeholder="Any additional information that would help customize this template"
                  value={customizations.additionalContext}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, additionalContext: e.target.value }))}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCustomizationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCustomizationSubmit} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <Rocket className="w-4 h-4 mr-2" />
                  Continue with Customization
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt Modal */}
      {upgradePromptConfig.isOpen && upgradePromptConfig.template && (
        <UpgradePrompt
          isOpen={upgradePromptConfig.isOpen}
          onClose={() => setUpgradePromptConfig({ isOpen: false })}
          currentTier={userTier || 'free'}
          requiredTier={upgradePromptConfig.template.tier || 'starter'}
          featureName={upgradePromptConfig.template.name}
          featureDescription={`This premium template helps: ${upgradePromptConfig.template.solution}`}
        />
      )}
    </div>
  );
}