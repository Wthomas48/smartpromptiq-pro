import { useState, useEffect, useRef, memo, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Target, 
  CheckCircle,
  Briefcase,
  BookOpen,
  Users,
  Zap,
  Brain,
  Rocket,
  TrendingUp,
  DollarSign,
  Heart,
  Lightbulb,
  Coffee,
  Home,
  Star,
  Globe,
  Mic,
  Camera,
  Code,
  Palette,
  Calculator,
  MessageSquare,
  Shield,
  Award
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { PDFExport } from "@/components/PDFExport";
import { useDemoGenerationWithStatus } from "@/hooks/useDemoGeneration";
import { RateLimitStatus, CooldownTimer } from "@/components/RateLimitStatus";
import { RequestQueueMonitor } from "@/components/RequestQueueMonitor";

// Memoized output component to prevent excessive re-renders
const OutputSection = memo(({
  generatedContent,
  selectedTemplateData,
  showOutput,
  outputRef
}: {
  generatedContent: {title: string, content: string} | null;
  selectedTemplateData: any;
  showOutput: boolean;
  outputRef: React.RefObject<HTMLDivElement>;
}) => {
  const contentToRender = useMemo(() => {
    if (!generatedContent && !selectedTemplateData?.sampleOutput) return null;

    const content = generatedContent ? generatedContent.content : selectedTemplateData?.sampleOutput?.content || 'No content available';

    try {
      // Simple markdown-like formatting for common patterns
      return content
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-gray-900">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-4 text-gray-800">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 text-gray-700">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        .split('\n')
        .map((line, index) => {
          // Handle list items
          if (line.startsWith('- ')) {
            return (
              <div
                key={index}
                className="ml-4 mb-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-blue-500 mr-2">•</span>
                <span dangerouslySetInnerHTML={{ __html: line.slice(2) }} />
              </div>
            );
          }

          // Handle headers and formatted text
          if (line.includes('<h1') || line.includes('<h2') || line.includes('<h3') ||
              line.includes('<strong') || line.includes('<em')) {
            return (
              <div
                key={index}
                dangerouslySetInnerHTML={{ __html: line }}
                className="animate-fade-in mb-4"
                style={{ animationDelay: `${index * 0.05}s` }}
              />
            );
          }

          // Handle regular paragraphs
          if (line.trim()) {
            return (
              <div
                key={index}
                className="mb-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                dangerouslySetInnerHTML={{ __html: line }}
              />
            );
          }

          return null;
        });
    } catch (error) {
      console.error('Markdown rendering error:', error);
      // Fallback to plain text
      return (
        <div className="animate-fade-in">
          {content}
        </div>
      );
    }
  }, [generatedContent?.content, selectedTemplateData?.sampleOutput?.content]);

  // Early return if no content to display
  if (!showOutput || !generatedContent) {
    console.log('OutputSection: Early return - showOutput:', showOutput, 'generatedContent:', !!generatedContent);
    return null;
  }
  console.log('OutputSection: Rendering content - showOutput:', showOutput, 'generatedContent:', !!generatedContent);

  return (
    <div
      ref={outputRef}
      className="space-y-6 animate-fade-in transition-all duration-700 transform"
      style={{
        border: generatedContent ? '3px solid #10b981' : '2px solid #e5e7eb',
        minHeight: '200px',
        padding: '20px',
        backgroundColor: generatedContent ? '#f0fdf4' : '#f9fafb',
        borderRadius: '16px',
        boxShadow: generatedContent ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        animation: generatedContent ? 'borderGlow 2s ease-in-out' : 'none'
      }}
    >
      <div className="bg-white border-2 border-green-300 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-bold">
              {generatedContent ? generatedContent.title : selectedTemplateData?.sampleOutput?.title || 'Generated Content'}
            </h4>
          </div>
        </div>
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed markdown-content">
              {contentToRender}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Demo() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{title: string, content: string} | null>(null);

  // Add CSS animations
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
@keyframes borderGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes highlight {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.3);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
`;

    if (!document.head.querySelector('style[data-demo-enhancements]')) {
      styleSheet.setAttribute('data-demo-enhancements', 'true');
      document.head.appendChild(styleSheet);
    }
  }, []);
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(true);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [isDebounced, setIsDebounced] = useState(false);
  const [demoCache, setDemoCache] = useState<Record<string, {content: any, timestamp: number}>>({});

  // Advanced demo generation with queue monitoring
  const {
    loading: hookLoading,
    error: hookError,
    data: hookData,
    queueStatus,
    systemLoad,
    generateDemo: generateDemoAdvanced,
    progress,
    isRetrying,
    canRetry,
    canGenerate,
    retry,
    checkRateLimit,
    remaining,
    retryAfter,
    cooldownUntil,
    isDebouncing
  } = useDemoGenerationWithStatus();

  // Sync the local isGenerating state with the hook loading state
  useEffect(() => {
    setIsGenerating(hookLoading);
  }, [hookLoading]);

  // REMOVED: Sync hookData with local generatedContent state
  // This was causing duplicate state updates and conflicts
  // State is now managed directly in the generation handler

  const demoStats = {
    promptsGenerated: 47283,
    activeUsers: 8947,
    successRate: 98.7,
    timesSaved: 2847
  };

  // Enhanced demo templates with interactive questionnaires
  const demoTemplates = {
    "startup-pitch": {
      name: "Startup Pitch Generator",
      category: "Business Strategy",
      icon: Briefcase,
      color: "blue",
      description: "Create compelling pitch presentations for investors",
      questions: [
        {
          id: "businessName",
          label: "What's Your Business Name?",
          type: "input",
          placeholder: "e.g., EcoTrack, TechFlow, GreenSpace",
          context: "Choose a memorable name that reflects your business identity and mission. This will be the foundation of your brand.",
          helpText: "💡 Keep it simple, memorable, and relevant to your industry. Avoid complex or hard-to-spell names."
        },
        {
          id: "industry",
          label: "Which Industry Are You In?",
          type: "select",
          options: ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Education", "Environmental"],
          context: "Your industry classification helps determine market size, competition, regulations, and growth opportunities.",
          helpText: "🎯 Choose the primary industry that best represents your core business activities and target market."
        },
        {
          id: "problem",
          label: "What Problem Are You Solving?",
          type: "textarea",
          placeholder: "Describe the specific pain point or challenge your business addresses",
          context: "A clear problem statement is crucial for MVP success. The bigger and more urgent the problem, the better your market opportunity.",
          helpText: "🔍 Be specific! Focus on real problems people face daily and are willing to pay to solve."
        },
        {
          id: "solution",
          label: "How Do You Solve This Problem?",
          type: "textarea",
          placeholder: "Explain your unique approach and what makes your solution better",
          context: "Your solution should directly address the problem with a clear value proposition that sets you apart from alternatives.",
          helpText: "⭐ Focus on what makes you unique and why customers would choose you over existing solutions."
        },
        {
          id: "targetMarket",
          label: "Who Are Your Ideal Customers?",
          type: "textarea",
          placeholder: "Describe demographics, behaviors, and characteristics of your target audience",
          context: "Understanding your target market deeply helps you build features they actually want and find the right marketing channels.",
          helpText: "👥 Be specific: age, income, job titles, pain points, where they spend time online, buying behavior."
        },
        {
          id: "revenueModel",
          label: "How Will You Make Money?",
          type: "select",
          options: ["SaaS Subscription", "One-time Purchase", "Freemium", "Marketplace Commission", "Advertising", "Licensing"],
          context: "Your revenue model determines pricing strategy, customer acquisition costs, and long-term business sustainability.",
          helpText: "💰 Consider what your customers prefer to pay for and how competitors monetize similar solutions."
        }
      ],
      demoData: {
        "businessName": "EcoTrack",
        "industry": "Environmental",
        "problem": "Small businesses struggle to track and reduce their carbon footprint",
        "solution": "AI-powered carbon tracking and reduction platform",
        "targetMarket": "Small to medium businesses (10-500 employees)",
        "revenueModel": "SaaS Subscription"
      },
      sampleResponses: {
        "Business Name": "EcoTrack",
        "Industry": "Environmental Technology",
        "Problem": "Small businesses struggle to track and reduce their carbon footprint",
        "Solution": "AI-powered carbon tracking and reduction platform",
        "Target Market": "Small to medium businesses (10-500 employees)",
        "Revenue Model": "SaaS subscription with tiered pricing"
      },
      sampleOutput: {
        title: "EcoTrack: AI-Powered Carbon Management for SMBs",
        content: `# EcoTrack Pitch Deck

## The Problem
Small and medium businesses account for 60% of global carbon emissions, yet 78% lack the tools to effectively track and reduce their environmental impact. Current solutions are either too expensive or too complex for SMBs.

## Our Solution
EcoTrack is an AI-powered platform that automatically tracks business carbon footprints and provides actionable insights for reduction. Our solution integrates with existing business systems to provide real-time environmental impact data.

## Market Opportunity
- $12B carbon management software market
- 32M SMBs globally seeking sustainability solutions
- 40% annual growth in environmental compliance requirements

## Business Model
- Starter: $49/month (up to 50 employees)
- Professional: $149/month (up to 200 employees)  
- Enterprise: $349/month (up to 500 employees)

## Financial Projections
- Year 1: $500K ARR with 200 customers
- Year 2: $2.5M ARR with 800 customers
- Year 3: $8M ARR with 2,000 customers

## Funding Request
Seeking $2M Series A to:
- Expand engineering team (40% of funds)
- Scale sales and marketing (35% of funds)
- Develop enterprise features (25% of funds)

## Why Now?
- New ESG regulations requiring carbon reporting
- Growing consumer demand for sustainable businesses
- AI technology making automated tracking affordable`
      }
    },
    "social-campaign": {
      name: "Social Media Campaign",
      category: "Marketing",
      icon: Target,
      color: "green",
      description: "Launch engaging social media campaigns across platforms",
      questions: [
        {
          id: "productService",
          label: "What Are You Promoting?",
          type: "input",
          placeholder: "e.g., Organic Skincare Line, Mobile App, Online Course",
          context: "Clearly define what you're marketing to create focused, relevant content that resonates with your audience.",
          helpText: "🎯 Be specific about the main product or service this campaign will focus on."
        },
        {
          id: "targetAudience",
          label: "Who Is Your Ideal Customer?",
          type: "textarea",
          placeholder: "Describe your ideal customers: age, interests, demographics, online behavior",
          context: "Understanding your audience deeply allows you to create content that speaks directly to their needs and interests.",
          helpText: "👥 Include: age range, gender, interests, pain points, where they hang out online, buying behavior."
        },
        {
          id: "campaignGoal",
          label: "What's Your Main Campaign Goal?",
          type: "select",
          options: ["Brand Awareness", "Lead Generation", "Sales Conversion", "Product Launch", "Community Building", "Customer Retention"],
          context: "Your goal determines the type of content, messaging, and metrics you'll focus on throughout the campaign.",
          helpText: "🎪 Choose ONE primary goal to keep your campaign focused and measurable."
        },
        {
          id: "budget",
          label: "What's Your Marketing Budget?",
          type: "select",
          options: ["$500-1,000", "$1,000-5,000", "$5,000-10,000", "$10,000-25,000", "$25,000+"],
          context: "Your budget determines platform choices, ad spend allocation, and the scale of content production you can afford.",
          helpText: "💰 Include both paid advertising and content creation costs in your budget planning."
        },
        {
          id: "duration",
          label: "How Long Will Your Campaign Run?",
          type: "select",
          options: ["1-2 weeks", "3-4 weeks", "6-8 weeks", "2-3 months", "Ongoing"],
          context: "Campaign duration affects content planning, budget allocation, and the time needed to see meaningful results.",
          helpText: "⏰ Longer campaigns allow for testing and optimization, but require sustained content creation."
        },
        {
          id: "platforms",
          label: "Which Platforms Will You Use?",
          type: "textarea",
          placeholder: "e.g., Instagram, TikTok, Facebook, LinkedIn, Twitter - and why",
          context: "Platform selection should align with where your target audience spends time and your content capabilities.",
          helpText: "📱 Focus on 2-3 platforms maximum for better quality content and engagement."
        }
      ],
      demoData: {
        "productService": "Organic Skincare Line",
        "targetAudience": "Health-conscious women aged 25-45",
        "campaignGoal": "Product Launch",
        "budget": "$1,000-5,000",
        "duration": "6-8 weeks",
        "platforms": "Instagram, TikTok, Facebook"
      },
      sampleResponses: {
        "Product/Service": "Organic Skincare Line",
        "Target Audience": "Health-conscious women aged 25-45",
        "Campaign Goal": "Launch new anti-aging serum and increase brand awareness",
        "Budget": "$5,000",
        "Duration": "6 weeks",
        "Platforms": "Instagram, TikTok, Facebook"
      },
      sampleOutput: {
        title: "Glow Naturally: Organic Anti-Aging Campaign",
        content: `# Social Media Campaign: Glow Naturally

## Campaign Overview
A 6-week integrated social media campaign to launch our new organic anti-aging serum, targeting health-conscious women aged 25-45 across Instagram, TikTok, and Facebook.

## Content Strategy

### Week 1-2: Education & Awareness
**Theme: "Nature's Secret to Youthful Skin"**
- Instagram: Before/after carousel posts featuring natural ingredients
- TikTok: Quick ingredient spotlight videos (15-30 seconds)
- Facebook: Long-form educational posts about organic skincare benefits

### Week 3-4: Product Spotlight
**Theme: "Meet Your New Skincare Hero"**
- Instagram: Product flat lays and lifestyle shots
- TikTok: Unboxing and first impressions videos
- Facebook: Customer testimonials and reviews

### Week 5-6: Launch & Conversion
**Theme: "Transform Your Routine"**
- Instagram: Launch announcement with limited-time offer
- TikTok: Routine integration tutorials
- Facebook: Live Q&A sessions with skincare experts

## Content Calendar (Sample Week)

**Monday**: Instagram Reel - "3 Signs Your Skin Needs Vitamin C"
**Tuesday**: TikTok - "POV: Finding your holy grail serum"
**Wednesday**: Facebook - Educational post about retinol alternatives
**Thursday**: Instagram Story - Behind-the-scenes production
**Friday**: TikTok - "Get Ready With Me" featuring the serum
**Saturday**: Instagram Post - User-generated content repost
**Sunday**: Facebook - Community poll about skincare concerns

## Hashtag Strategy
Primary: #GlowNaturally #OrganicSkincare #AntiAging
Secondary: #CleanBeauty #SkincareRoutine #HealthySkin
Trending: #SelfCare #NaturalBeauty #SkincareAddict

## Influencer Partnerships
- 3 micro-influencers (10K-100K followers): $1,500
- 1 mid-tier influencer (100K-500K followers): $2,000
- Skincare expert collaboration: $500

## Budget Allocation
- Content Creation: $1,000
- Paid Advertising: $2,500
- Influencer Partnerships: $2,000
- Tools & Analytics: $500

## KPIs & Success Metrics
- Reach: 500K unique users
- Engagement Rate: 4.5%+
- Website Traffic: 25% increase
- Email Signups: 1,000 new subscribers
- Sales: $15K in serum sales`
      }
    },
    "financial-planner": {
      name: "Financial Planning Guide",
      category: "Finance",
      icon: DollarSign,
      color: "green",
      description: "Create comprehensive financial planning strategies and investment guides",
      questions: [
        {
          id: "age",
          label: "What's Your Age Group?",
          type: "select",
          options: ["20-30", "30-40", "40-50", "50-60", "60+"],
          context: "Age determines your investment timeline, risk tolerance, and the financial strategies that work best for your life stage.",
          helpText: "📊 Different life stages require different financial strategies and investment approaches."
        },
        {
          id: "income",
          label: "What's Your Annual Income?",
          type: "select",
          options: ["$30K-50K", "$50K-100K", "$100K-200K", "$200K+"],
          context: "Income level affects how much you can save, invest, and the types of financial products available to you.",
          helpText: "💼 Choose your household income range to get personalized savings and investment recommendations."
        },
        {
          id: "goals",
          label: "What Are Your Financial Goals?",
          type: "textarea",
          placeholder: "e.g., retirement planning, home buying, debt reduction, emergency fund, children's education",
          context: "Clear financial goals help prioritize where to allocate your money and create a roadmap for success.",
          helpText: "🎯 List your top 3-5 financial goals in order of priority, with specific amounts if possible."
        },
        {
          id: "timeline",
          label: "What's Your Planning Timeline?",
          type: "select",
          options: ["1-2 years", "3-5 years", "5-10 years", "10+ years"],
          context: "Your timeline determines investment strategies, risk levels, and the types of accounts you should prioritize.",
          helpText: "⏰ Longer timelines allow for more aggressive growth strategies, shorter ones require safer approaches."
        }
      ],
      demoData: {
        "age": "30-40",
        "income": "$50K-100K",
        "goals": "Save for home down payment, build emergency fund, start retirement savings",
        "timeline": "3-5 years"
      },
      sampleResponses: {
        "Target Age Group": "30-40",
        "Income Level": "$75,000 annually", 
        "Financial Goals": "Save for home down payment, build emergency fund, start retirement savings",
        "Planning Timeline": "5 years",
        "Risk Tolerance": "Moderate",
        "Current Savings": "$15,000"
      },
      sampleOutput: {
        title: "Comprehensive 5-Year Financial Plan for Young Professionals",
        content: `# 5-Year Financial Roadmap: Building Wealth in Your 30s

## Executive Summary
A strategic financial plan designed for 30-40 year olds earning $75K annually, focused on homeownership, emergency preparedness, and retirement readiness.

## Current Financial Assessment
- Annual Income: $75,000
- Current Savings: $15,000
- Monthly Net Income: ~$4,800
- Recommended Savings Rate: 20% ($960/month)

## Year 1-2: Foundation Building
### Emergency Fund Priority
**Goal**: Build 6-month emergency fund ($28,800)
- Monthly Allocation: $400
- Timeline: 18 months (adding to existing $15K)
- Account Type: High-yield savings (4.5% APY)

### Initial Retirement Contributions
**Goal**: Establish retirement savings habit
- 401(k) Contribution: 6% ($375/month)
- Employer Match: 3% ($187.50/month)
- Total Monthly Retirement: $562.50

## Year 3-4: Homeownership Preparation
### Down Payment Fund
**Goal**: Save $60,000 for home down payment
- Target Home Price: $300,000
- Down Payment: 20% ($60,000)
- Monthly Allocation: $800
- Investment Strategy: Conservative portfolio (60/40 stocks/bonds)

### Credit Optimization
- Target Credit Score: 750+
- Pay down high-interest debt
- Monitor credit reports quarterly
- Consider mortgage pre-approval in Year 4

## Year 5+: Wealth Acceleration
### Post-Home Purchase Strategy
**Retirement Acceleration**
- Increase 401(k) to 10% ($625/month)
- Open Roth IRA: $500/month
- Total Retirement Savings: $1,125/month

### Investment Portfolio Diversification
- Taxable Investment Account: $300/month
- Portfolio Allocation: 70% stocks, 25% bonds, 5% alternatives
- Consider real estate investment trusts (REITs)

## Monthly Budget Breakdown (Year 1)
### Income: $4,800
- Emergency Fund: $400 (8.3%)
- Retirement (401k): $375 (7.8%)
- Living Expenses: $3,200 (66.7%)
- Discretionary: $825 (17.2%)

## Investment Strategy by Timeline
### Short-term (1-3 years): Emergency Fund
- High-yield savings accounts
- Money market funds
- Short-term CDs

### Medium-term (3-5 years): Home Down Payment
- Conservative balanced funds
- Target-date funds
- Bond index funds

### Long-term (5+ years): Retirement
- S&P 500 index funds
- International stock funds
- Target-date retirement funds

## Risk Management
### Insurance Coverage Review
- Life Insurance: 10x annual salary ($750K term)
- Disability Insurance: 60-70% income replacement
- Health Insurance: Maximize HSA contributions
- Umbrella Policy: $1M coverage

## Tax Optimization Strategies
- Maximize 401(k) contributions for tax deduction
- Utilize Roth IRA for tax-free growth
- Consider HSA as retirement vehicle
- Tax-loss harvesting in taxable accounts

## Milestone Checkpoints
### Year 1 Targets
- Emergency fund: $20,400
- Retirement balance: $6,750
- Net worth increase: $27,150

### Year 3 Targets
- Emergency fund: Complete ($28,800)
- Down payment fund: $19,200
- Retirement balance: $22,500

### Year 5 Targets
- Home purchased
- Retirement balance: $65,000
- Net worth: $150,000+

## Action Steps - Next 90 Days
1. Open high-yield savings account for emergency fund
2. Increase 401(k) contribution to 6%
3. Set up automatic transfers for savings goals
4. Review and optimize insurance coverage
5. Create monthly budget tracking system

## Professional Support Recommendations
- Fee-only financial advisor (Year 3+)
- CPA for tax planning (when income exceeds $100K)
- Estate planning attorney (after home purchase)
- Insurance agent review (annually)

This plan provides a clear roadmap to financial security, balancing immediate needs with long-term wealth building goals.`
      }
    },
    "course-creator": {
      name: "Online Course Creator",
      category: "Education",
      icon: BookOpen,
      color: "purple",
      description: "Design comprehensive online courses with structured modules",
      questions: [
        {
          id: "topic",
          label: "What's Your Course Topic?",
          type: "input",
          placeholder: "e.g., Digital Marketing, Web Development, Photography",
          context: "Choose a subject you're passionate about and have expertise in. This will be the foundation of your entire course.",
          helpText: "💡 Tip: Be specific! 'Social Media Marketing for Restaurants' is better than just 'Marketing'"
        },
        {
          id: "audience",
          label: "Who Are Your Ideal Students?",
          type: "textarea",
          placeholder: "Describe your ideal students: their background, current skill level, goals, and challenges",
          context: "Understanding your students deeply helps create content that truly resonates and delivers value.",
          helpText: "🎯 Consider: What do they already know? What struggles do they face? What outcome do they want?"
        },
        {
          id: "duration",
          label: "How Long Should Your Course Be?",
          type: "select",
          options: ["2-4 weeks", "4-6 weeks", "6-8 weeks", "8-12 weeks", "12+ weeks"],
          context: "Course length should match the complexity of your topic and your students' available time commitment.",
          helpText: "⏰ Remember: Shorter courses have higher completion rates, but complex topics need adequate time"
        },
        {
          id: "format",
          label: "What Learning Experience Will You Create?",
          type: "textarea",
          placeholder: "Describe your teaching methods: Video lessons, interactive worksheets, live sessions, community discussions, practical projects, quizzes, etc.",
          context: "The format determines how engaging and effective your course will be. Mix different learning styles for maximum impact.",
          helpText: "🚀 Pro tip: Combine multiple formats! Videos + worksheets + community = higher engagement and better results"
        }
      ],
      demoData: {
        "topic": "Digital Marketing for Small Businesses",
        "audience": "Small business owners with no marketing experience who want to learn cost-effective strategies to grow their customer base",
        "duration": "6-8 weeks",
        "format": "Video lessons, practical worksheets, live Q&A sessions, and peer discussion forums"
      },
      sampleResponses: {
        "Course Topic": "Digital Marketing for Small Businesses",
        "Target Audience": "Small business owners with no marketing experience",
        "Course Duration": "8 weeks",
        "Learning Format": "Video lessons, worksheets, live Q&A sessions",
        "Skill Level": "Beginner",
        "Main Outcome": "Students can create and execute a complete digital marketing strategy"
      },
      sampleOutput: {
        title: "Digital Marketing Mastery for Small Business",
        content: `# Course: Digital Marketing Mastery for Small Business

## Course Overview
An 8-week comprehensive program designed to teach small business owners how to create and execute effective digital marketing strategies, even with zero marketing experience.

## Learning Objectives
By the end of this course, students will be able to:
- Develop a complete digital marketing strategy
- Create engaging content for social media platforms
- Set up and optimize Google Ads campaigns
- Build email marketing funnels that convert
- Measure and analyze marketing performance

## Course Structure

### Module 1: Marketing Foundations (Week 1)
**Learning Objectives**: Understand marketing basics and identify target audience
- Lesson 1.1: What is Digital Marketing? (15 min video)
- Lesson 1.2: Identifying Your Ideal Customer (20 min video)
- Lesson 1.3: Setting SMART Marketing Goals (18 min video)
- **Worksheet**: Customer Avatar Template
- **Live Session**: Q&A - Finding Your Niche (60 min)

### Module 2: Website Optimization (Week 2)
**Learning Objectives**: Create a conversion-focused website
- Lesson 2.1: Website Essentials for Conversions (22 min video)
- Lesson 2.2: SEO Basics for Small Business (25 min video)
- Lesson 2.3: Landing Page Design Principles (20 min video)
- **Worksheet**: Website Audit Checklist
- **Assignment**: Optimize one page on your website

### Module 3: Content Marketing (Week 3)
**Learning Objectives**: Develop content that attracts and engages customers
- Lesson 3.1: Content Marketing Strategy (18 min video)
- Lesson 3.2: Creating Valuable Blog Content (24 min video)
- Lesson 3.3: Content Calendar Planning (16 min video)
- **Worksheet**: 30-Day Content Calendar Template
- **Live Session**: Content Ideas Brainstorming (45 min)

### Module 4: Social Media Marketing (Week 4)
**Learning Objectives**: Build and engage your social media audience
- Lesson 4.1: Choosing the Right Platforms (20 min video)
- Lesson 4.2: Creating Engaging Social Content (26 min video)
- Lesson 4.3: Social Media Scheduling and Tools (15 min video)
- **Worksheet**: Platform-Specific Content Guide
- **Assignment**: Create and schedule one week of social posts

### Module 5: Email Marketing (Week 5)
**Learning Objectives**: Build and nurture email lists that convert
- Lesson 5.1: Email Marketing Fundamentals (19 min video)
- Lesson 5.2: Creating Lead Magnets (23 min video)
- Lesson 5.3: Email Sequence Design (21 min video)
- **Worksheet**: Email Campaign Planner
- **Live Session**: Email Template Review (60 min)

### Module 6: Paid Advertising (Week 6)
**Learning Objectives**: Create profitable ad campaigns
- Lesson 6.1: Google Ads for Beginners (28 min video)
- Lesson 6.2: Facebook Ads Setup and Targeting (25 min video)
- Lesson 6.3: Ad Copy and Creative Best Practices (22 min video)
- **Worksheet**: Ad Campaign Planner
- **Assignment**: Create your first ad campaign

### Module 7: Analytics and Optimization (Week 7)
**Learning Objectives**: Measure and improve marketing performance
- Lesson 7.1: Setting Up Google Analytics (17 min video)
- Lesson 7.2: Key Metrics to Track (20 min video)
- Lesson 7.3: A/B Testing Strategies (18 min video)
- **Worksheet**: Marketing Dashboard Template
- **Live Session**: Analytics Deep Dive (75 min)

### Module 8: Putting It All Together (Week 8)
**Learning Objectives**: Create a comprehensive marketing plan
- Lesson 8.1: Creating Your Marketing Calendar (15 min video)
- Lesson 8.2: Budget Allocation Strategies (20 min video)
- Lesson 8.3: Scaling Your Marketing Efforts (22 min video)
- **Final Project**: Complete Marketing Strategy Document
- **Live Session**: Strategy Presentations and Feedback (90 min)

## Assessment Methods
- Weekly worksheet submissions (40%)
- Two practical assignments (30%)
- Final marketing strategy project (30%)

## Resources Provided
- All video lessons with transcripts
- Downloadable worksheets and templates
- Private Facebook community access
- Monthly office hours for 6 months post-course
- Bonus resource library with 50+ marketing tools

## Course Pricing
- Early Bird: $497 (limited time)
- Regular Price: $697
- Payment Plan: 3 payments of $249

## Instructor Support
- Weekly live Q&A sessions
- Community forum responses within 24 hours
- One-on-one strategy call for final project`
      }
    },
    "wellness-coach": {
      name: "Wellness Coaching Program",
      category: "Health & Wellness", 
      icon: Heart,
      color: "pink",
      description: "Create personalized wellness and lifestyle coaching programs",
      questions: [
        {
          id: "focus",
          label: "What's Your Primary Wellness Focus?",
          type: "select",
          options: ["Weight Loss", "Stress Management", "Fitness", "Nutrition", "Sleep", "Mental Health"],
          context: "Your focus area determines the program structure, techniques, and outcomes you'll deliver to clients.",
          helpText: "🎯 Choose the area where you have the most expertise and passion for helping others."
        },
        {
          id: "duration",
          label: "How Long Is Your Program?",
          type: "select",
          options: ["4 weeks", "8 weeks", "12 weeks", "6 months"],
          context: "Program length affects pricing, depth of transformation, and client commitment levels you can expect.",
          helpText: "⏰ Longer programs allow deeper transformation but require higher client commitment and investment."
        },
        {
          id: "audience",
          label: "Who Are Your Ideal Clients?",
          type: "textarea",
          placeholder: "Describe demographics, challenges, motivation levels, and what they want to achieve",
          context: "Understanding your ideal clients helps create targeted messaging and program content that attracts the right people.",
          helpText: "👥 Be specific: age, lifestyle, current challenges, motivation level, what they've tried before."
        },
        {
          id: "approach",
          label: "What's Your Coaching Philosophy?",
          type: "textarea",
          placeholder: "Describe your unique methodology, techniques, and what makes your approach different",
          context: "Your coaching approach differentiates you from competitors and helps clients understand what to expect.",
          helpText: "⭐ Include your core beliefs, techniques you use, and what makes your style unique and effective."
        }
      ],
      demoData: {
        "focus": "Stress Management",
        "duration": "8 weeks",
        "audience": "Busy professionals experiencing work-life balance challenges and high stress levels",
        "approach": "Mindfulness-based stress reduction combined with practical time management and boundary-setting tools"
      },
      sampleResponses: {
        "Primary Focus Area": "Stress Management for Professionals",
        "Program Duration": "8 weeks",
        "Target Audience": "Busy professionals experiencing work-life balance challenges",
        "Coaching Approach": "Mindfulness-based stress reduction with practical tools"
      },
      sampleOutput: {
        title: "8-Week Stress Mastery Program for Busy Professionals",
        content: `# Stress Mastery: From Overwhelmed to Optimized

## Program Overview
An 8-week intensive coaching program designed specifically for busy professionals who want to master stress, improve work-life balance, and boost their overall well-being without sacrificing career success.

## Program Philosophy
"You can't eliminate stress, but you can master your response to it."

Our evidence-based approach combines mindfulness practices, stress physiology education, and practical tools that fit into even the busiest schedules.

## Week-by-Week Breakdown

### Week 1: Understanding Your Stress Profile
**Theme: Awareness Before Action**
- Stress assessment and personal stress triggers identification
- Introduction to the stress response system
- Baseline measurements: cortisol patterns, sleep quality, energy levels
- **Homework**: Stress diary tracking for 7 days
- **Tool Introduction**: 5-minute morning mindfulness routine

### Week 2: The Science of Stress Recovery
**Theme: Knowledge is Power**
- Neuroplasticity and stress: how your brain adapts
- The difference between acute and chronic stress
- Introduction to breathwork fundamentals
- **Practice**: 4-7-8 breathing technique
- **Implementation**: Stress recovery micro-breaks (2 minutes, 3x daily)

### Week 3: Mindful Productivity
**Theme: Working Smarter, Not Harder**
- Single-tasking vs. multitasking science
- The Pomodoro Technique for stress reduction
- Mindful transition practices between tasks
- **Challenge**: One day of complete single-tasking
- **Tool**: Mindful email and meeting practices

### Week 4: Boundary Setting Mastery
**Theme: Protecting Your Energy**
- The neuroscience of saying "no"
- Creating healthy work boundaries
- Communication scripts for difficult conversations
- **Assignment**: Implement one new boundary
- **Practice**: Evening shutdown ritual

### Week 5: Physical Stress Management
**Theme: Your Body is Your Foundation**
- Exercise as stress medicine (not punishment)
- Desk-based movement routines
- Sleep hygiene for busy professionals
- **Challenge**: 7-day movement consistency
- **Tool**: Progressive muscle relaxation

### Week 6: Emotional Regulation Techniques
**Theme: Mastering Your Internal Weather**
- Understanding emotional triggers in workplace
- The STOP technique for emotional regulation
- Cognitive reframing for stressful situations
- **Practice**: Daily emotional check-ins
- **Implementation**: Pre-meeting centering routine

### Week 7: Building Your Support Systems
**Theme: You Don't Have to Do This Alone**
- Identifying your stress support network
- Professional vs. personal support strategies
- Creating accountability partnerships
- **Action**: Reach out to three support connections
- **Development**: Personal stress management toolkit

### Week 8: Sustainable Integration
**Theme: Making It Stick**
- Creating your personalized stress mastery plan
- Identifying potential obstacles and solutions
- Building habits that stick
- **Milestone**: 30-day post-program planning
- **Celebration**: Acknowledging your transformation

## Daily Practice Structure (20 minutes total)

### Morning Routine (8 minutes)
- 5-minute mindfulness meditation
- 3-minute intention setting

### Workday Integration (7 minutes)
- 3 x 2-minute stress reset breaks
- 1-minute transition breathing between meetings

### Evening Wind-down (5 minutes)
- 3-minute gratitude practice
- 2-minute body scan relaxation

## Tools & Resources Provided

### Digital Resources
- Guided meditation app with custom tracks
- Stress tracking journal templates
- Breathing technique video library
- Emergency stress toolkit (5-minute solutions)

### Worksheets & Assessments
- Personal stress profile assessment
- Values and boundaries clarification exercises
- Weekly reflection templates
- Progress tracking sheets

### Bonus Materials
- "Stress-Free Meetings" guide
- "Healthy Boundaries Scripts" template library
- "5-Minute Office Yoga" routine cards
- "Mindful Eating for Busy People" guide

## Success Metrics
By program completion, participants typically experience:
- 40-60% reduction in perceived stress levels
- 25% improvement in sleep quality
- 30% increase in work productivity
- Significant improvement in work-life satisfaction scores

## Investment Options

### Self-Study Package: $297
- All 8 weeks of content immediately accessible
- Digital tools and resources
- Email support
- Private online community access

### Guided Cohort: $697
- Weekly 90-minute group coaching calls
- Personal check-ins with coach
- Accountability partner matching
- All self-study materials included

### VIP 1:1 Coaching: $1,497
- All group program benefits
- 4 individual 60-minute coaching sessions
- Personalized stress management plan
- 30 days post-program support

## Guarantee
30-day money-back guarantee. If you don't feel more equipped to handle stress after 4 weeks of implementing the program, receive a full refund.

## Next Steps
1. Complete the free stress assessment
2. Schedule a 15-minute program consultation
3. Choose your learning path
4. Begin your transformation to stress mastery

*"The goal isn't to eliminate stress—it's to develop an unshakeable inner calm that allows you to thrive under pressure."*`
      }
    },
    "app-developer": {
      name: "Mobile App Development Plan",
      category: "Technology",
      icon: Code,
      color: "blue",
      description: "Create comprehensive mobile app development strategies and technical specifications",
      questions: [
        {
          id: "appType",
          label: "What Type of App Are You Building?",
          type: "select",
          options: ["E-commerce", "Social Media", "Productivity", "Health & Fitness", "Education", "Entertainment"],
          context: "App type determines development complexity, required features, monetization strategies, and target audience.",
          helpText: "📱 Choose the category that best describes your app's primary purpose and functionality."
        },
        {
          id: "platform",
          label: "Which Platform Will You Target?",
          type: "select",
          options: ["iOS Only", "Android Only", "Cross-Platform"],
          context: "Platform choice affects development costs, timeline, user reach, and technical requirements.",
          helpText: "🎯 Cross-platform reaches more users but may cost more initially. Single platforms are faster to develop."
        },
        {
          id: "features",
          label: "What Are Your Core Features?",
          type: "textarea",
          placeholder: "List the essential features that make your app valuable: user authentication, main functionality, key interactions, etc.",
          context: "Core features define your MVP scope, development complexity, and what users will pay for.",
          helpText: "⭐ Focus on 3-5 essential features for your MVP. Advanced features can be added in future versions."
        },
        {
          id: "timeline",
          label: "What's Your Development Timeline?",
          type: "select",
          options: ["3-6 months", "6-9 months", "9-12 months", "12+ months"],
          context: "Timeline affects team size, budget requirements, feature scope, and when you can start generating revenue.",
          helpText: "⏰ Be realistic! Complex apps with many features need more time. Simple MVPs can launch faster."
        }
      ],
      demoData: {
        "appType": "Health & Fitness",
        "platform": "Cross-Platform",
        "features": "Workout tracking, meal planning, progress photos, social sharing, coach messaging, custom workout creation, nutrition database, progress analytics",
        "timeline": "6-9 months"
      },
      sampleResponses: {
        "App Type": "Fitness & Wellness",
        "Target Platform": "Cross-platform (iOS and Android)",
        "Core Features": "Workout tracking, meal planning, progress photos, social sharing, coach messaging",
        "Development Timeline": "6-9 months",
        "Target Audience": "Fitness enthusiasts aged 25-45",
        "Monetization": "Freemium with premium subscriptions"
      },
      sampleOutput: {
        title: "FitTrack Pro: Complete Fitness & Wellness App Development Plan",
        content: `# FitTrack Pro: Mobile App Development Strategy

## App Concept Overview
A comprehensive cross-platform fitness and wellness application designed for fitness enthusiasts aged 25-45, featuring workout tracking, meal planning, progress monitoring, and social community features.

## Market Analysis

### Market Opportunity
- Global fitness app market: $4.4B (2023)
- Expected CAGR: 14.7% through 2028
- Target demographic spending: $1,200/year on fitness
- Market gap: Integrated nutrition and social features

### Competitive Landscape
**Direct Competitors:**
- MyFitnessPal (nutrition focus)
- Strava (social fitness)
- Nike Training Club (workouts)

**Competitive Advantage:**
Integrated approach combining workout tracking, nutrition planning, and social motivation in one platform.

## Technical Specifications

### Platform Strategy
**Cross-Platform Development: React Native**
- Single codebase for iOS and Android
- 60% faster development time
- Consistent user experience
- Cost-effective maintenance

### Core Architecture
**Frontend:**
- React Native with TypeScript
- Redux Toolkit for state management
- React Navigation for routing
- Async Storage for offline capability

**Backend:**
- Node.js with Express framework
- MongoDB for flexible data storage
- JWT authentication
- RESTful API design

**Cloud Infrastructure:**
- AWS hosting and services
- S3 for media storage
- CloudFront CDN
- Auto-scaling EC2 instances

## Feature Development Roadmap

### Phase 1: MVP (Months 1-3)
**Core Features:**
- User registration and authentication
- Basic workout logging
- Simple meal tracking
- Progress photo uploads
- Basic profile management

**Technical Milestones:**
- Backend API development
- Database schema design
- User authentication system
- Basic UI components

### Phase 2: Enhanced Features (Months 4-6)
**Advanced Features:**
- Custom workout creation
- Nutrition goal setting
- Progress analytics dashboard
- Social feed implementation
- Push notifications

**Technical Milestones:**
- Real-time data synchronization
- Advanced analytics implementation
- Social features backend
- Performance optimization

### Phase 3: Premium Features (Months 7-9)
**Premium Subscription Features:**
- AI-powered workout recommendations
- Advanced nutrition analysis
- Coach messaging system
- Detailed progress reports
- Integration with fitness devices

**Technical Milestones:**
- Payment processing integration
- AI/ML recommendation engine
- Third-party API integrations
- Advanced security measures

## User Experience Design

### Design Principles
- **Simplicity**: Clean, intuitive interface
- **Motivation**: Progress visualization and achievements
- **Consistency**: Unified design system
- **Accessibility**: WCAG 2.1 AA compliance

### User Journey Mapping
1. **Onboarding**: Goal setting and preference selection
2. **Daily Use**: Quick workout/meal logging
3. **Progress Tracking**: Weekly progress reviews
4. **Social Engagement**: Community interaction
5. **Goal Achievement**: Milestone celebrations

## Monetization Strategy

### Freemium Model
**Free Tier Features:**
- Basic workout tracking
- Simple meal logging
- Limited progress photos
- Basic progress charts

**Premium Subscription ($9.99/month):**
- Unlimited progress photos
- Advanced analytics
- AI workout recommendations
- Nutrition goal customization
- Coach messaging
- Ad-free experience

### Revenue Projections
**Year 1:**
- 10,000 downloads
- 5% conversion to premium
- Monthly recurring revenue: $5,000

**Year 2:**
- 50,000 downloads
- 8% conversion rate
- Monthly recurring revenue: $40,000

## Development Team Structure

### Core Team (6 months)
- **Project Manager**: Timeline and deliverable management
- **Lead Developer**: React Native and architecture
- **Backend Developer**: API and database development
- **UI/UX Designer**: Interface and user experience
- **QA Engineer**: Testing and quality assurance

### Estimated Costs
- Development Team: $180,000 (6 months)
- Design and Prototyping: $25,000
- Third-party Services: $15,000
- Marketing and Launch: $30,000
- **Total MVP Investment: $250,000**

## Testing Strategy

### Testing Phases
**Alpha Testing (Month 5):**
- Internal team testing
- Core functionality validation
- Performance benchmarking

**Beta Testing (Month 6):**
- 100 selected users
- Real-world usage scenarios
- Feedback collection and iteration

**Quality Assurance:**
- Automated unit testing
- Manual UI testing
- Device compatibility testing
- Performance testing

## Launch Strategy

### Pre-Launch (Month 8)
- App Store optimization
- Landing page development
- Influencer partnerships
- Content marketing campaign

### Launch Phase
- Staged rollout (10% → 50% → 100%)
- Social media campaign
- Press release distribution
- User acquisition campaigns

### Post-Launch (Months 9+)
- User feedback implementation
- Feature iteration
- Scaling infrastructure
- Premium feature development

## Risk Assessment

### Technical Risks
- **Cross-platform compatibility**: Mitigation through thorough testing
- **Scalability challenges**: Cloud-native architecture
- **Data security**: Encryption and compliance measures

### Market Risks
- **Competition**: Focus on unique value proposition
- **User acquisition costs**: Organic growth strategy
- **Retention rates**: Engagement features and personalization

## Success Metrics

### Key Performance Indicators
- **Downloads**: 10K in first 6 months
- **Daily Active Users**: 25% of total users
- **User Retention**: 40% after 30 days
- **Premium Conversion**: 5-8% in year one
- **App Store Rating**: 4.5+ stars

## Next Steps
1. Finalize technical requirements
2. Assemble development team
3. Create detailed wireframes
4. Set up development environment
5. Begin MVP development

This comprehensive development plan provides a roadmap to successfully launch FitTrack Pro as a competitive player in the fitness app market.`
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTryTemplate = (templateId: string) => {
    console.log('TEMPLATE SELECTED: Clearing output for template', templateId);
    setSelectedTemplate(templateId);

    // ✅ FIXED: Don't clear output immediately - let handleGenerateDemo check cache first
    // setShowOutput(false); // REMOVED - this was preventing cached content from showing
    setCurrentStep(0);

    const template = demoTemplates[templateId as keyof typeof demoTemplates];

    if (template && template.questions) {
      // Template has interactive questionnaire - start interactive mode with pre-filled data
      // Pre-fill data FIRST, then show interactive demo
      if (template.demoData) {
        setUserResponses(template.demoData);
      } else {
        setUserResponses({});
      }

      // Use React's batching by setting state in the same synchronous block
      setShowInteractiveDemo(true);
    } else {
      // Template has no questions - generate immediately with sample responses
      setShowInteractiveDemo(false);
      setUserResponses({});
      // Trigger immediate generation without delay
      handleGenerateDemo(templateId);
    }
  };

  const handleStartInteractiveDemo = () => {
    // Pre-fill form with demo data FIRST if available
    const template = selectedTemplate ? demoTemplates[selectedTemplate as keyof typeof demoTemplates] : null;
    if (template && template.demoData) {
      setUserResponses(template.demoData);
    }

    // Then show interactive demo and reset step
    setCurrentStep(0);
    setShowInteractiveDemo(true);
  };

  const handleNextStep = () => {
    const template = selectedTemplate ? demoTemplates[selectedTemplate as keyof typeof demoTemplates] : null;
    if (template && template.questions && currentStep < template.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerateDemo();
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setUserResponses(prev => ({ ...prev, [questionId]: value }));
  };

  // Generate cache key based on template and responses
  const generateCacheKey = (template: string, responses: Record<string, string>) => {
    const sortedResponses = Object.keys(responses).sort().reduce((obj: Record<string, string>, key) => {
      obj[key] = responses[key];
      return obj;
    }, {});
    return `${template}:${JSON.stringify(sortedResponses)}`;
  };

  // Check if cached result is still valid (30 minutes)
  const isCacheValid = (timestamp: number) => {
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const handleGenerateDemo = async (templateId?: string) => {

    const templateToUse = templateId || selectedTemplate;
    if (!templateToUse) {
      console.error('❌ No template selected');
      return;
    }

    // Implement debouncing to prevent double-clicks
    const now = Date.now();
    const DEBOUNCE_TIME = 2000; // 2 seconds

    if (now - lastRequestTime < DEBOUNCE_TIME) {
      setIsDebounced(true);
      setTimeout(() => setIsDebounced(false), DEBOUNCE_TIME - (now - lastRequestTime));
      return;
    }

    setLastRequestTime(now);
    setIsDebounced(false);

    // Prepare request data in the correct format for the backend API
    const requestData = {
      templateType: templateToUse,  // ✅ Backend expects 'templateType'
      userResponses: Object.keys(userResponses).length > 0 ? userResponses : selectedTemplateData?.sampleResponses || {},
      userEmail: email || undefined
    };

    // Check cache first
    const cacheKey = generateCacheKey(templateToUse, requestData.userResponses);
    const cachedResult = demoCache[cacheKey];

    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      console.log('CACHE HIT: Using cached result', cachedResult.content);
      const cachedContent = {
        title: `${cachedResult.content.title || 'Generated Content'} (Cached)`,
        content: cachedResult.content.content || 'Cached content'
      };
      console.log('CACHE: Setting generated content', cachedContent);
      setGeneratedContent(cachedContent);
      setShowOutput(true);
      setIsGenerating(false);
      console.log('✅ State updated, content should display (CACHED)');

      // ✅ CRITICAL: Scroll to output and show feedback for cached content
      requestAnimationFrame(() => {
        const output = document.querySelector('.demo-output') as HTMLElement;
        if (output) {
          output.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Highlight the output briefly
          output.style.animation = 'highlight 2s ease-in-out';
        }
      });
      return;
    }

    // Set local loading state to sync with legacy UI
    console.log('CLEARING: About to clear content and start generation');
    setIsGenerating(true);
    setShowOutput(false);
    setGeneratedContent(null);
    console.log('CLEARING: Content cleared, generation starting');

    try {
      // Start timing the generation
      setGenerationStartTime(Date.now());

      // Use the advanced hook for generation with queue management
      const result = await generateDemoAdvanced(requestData);

      // Process the result directly since the hook returns it
      if (result && typeof result === 'object') {
        const resultData = result as any;

        // Handle the actual API response format: {id, type, title, description, content, generatedAt}
        let generatedData;
        if (resultData.content) {
          // Direct API response format - use as is
          generatedData = resultData;
        } else if (resultData.success && resultData.data) {
          // Wrapped response format
          generatedData = resultData.data;
        } else if (resultData.data) {
          // Hook wrapped the response
          generatedData = resultData.data;
        } else {
          // Fallback to result itself
          generatedData = resultData;
        }

        const contentToSet = {
          title: generatedData.title || selectedTemplateData?.sampleOutput?.title || 'Generated AI Prompt',
          content: generatedData.content || generatedData.prompt || 'Generated content'
        };

        // Cache the result for future use
        const cacheKey = generateCacheKey(templateToUse, requestData.userResponses);
        setDemoCache(prev => ({
          ...prev,
          [cacheKey]: {
            content: contentToSet,
            timestamp: Date.now()
          }
        }));

        setGeneratedContent(contentToSet);
        setShowOutput(true);
        setIsGenerating(false);
        console.log('✅ Content state updated successfully');

        // ✅ CRITICAL: Scroll to output and show feedback
        requestAnimationFrame(() => {
          const output = document.querySelector('.demo-output') as HTMLElement;
          if (output) {
            output.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Highlight the output briefly
            output.style.animation = 'highlight 2s ease-in-out';
          }
        });

        // ✅ ADD: Show success banner
        const banner = document.createElement('div');
        banner.className = 'success-banner';
        banner.textContent = '✅ Content generated! Scroll down to view your results.';
        banner.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #10b981;
          color: white;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);

        // Trigger success notification
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);

        // Auto-scroll to output with smooth animation
        setTimeout(() => {
          if (outputRef.current) {
            outputRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 300);

        // Optionally send results to email if provided
        if (email) {
          try {
            await fetch('/api/demo/send-results', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                templateName: generatedData.title || 'Generated AI Prompt',
                generatedPrompt: generatedData.content || generatedData.prompt || 'Generated content'
              }),
            });
          } catch (emailError) {
            console.log('Could not send email, but generation succeeded');
          }
        }
      } else {
        console.error('❌ Hook returned invalid result:', result);
        throw new Error('Invalid response from generation hook');
      }
    } catch (error) {
      console.error('❌ Hook threw error:', error);
      console.error('Advanced demo generation error:', error);

      // Enhanced error handling with user-friendly messages
      let userFriendlyMessage = 'Something went wrong';
      let showRetryButton = false;
      let retryMessage = '';

      if (error instanceof Error) {
        // Parse different error types
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          userFriendlyMessage = 'Rate limit reached';
          retryMessage = 'You\'ve reached the demo limit. Please wait a moment or create a free account for unlimited access.';
          showRetryButton = true;
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          userFriendlyMessage = 'Connection issue';
          retryMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
          showRetryButton = true;
        } else if (error.message.includes('timeout')) {
          userFriendlyMessage = 'Request timed out';
          retryMessage = 'The request took too long to complete. Please try again.';
          showRetryButton = true;
        } else {
          userFriendlyMessage = 'Service temporarily unavailable';
          retryMessage = 'Our AI service is temporarily unavailable. Please try again in a few moments.';
          showRetryButton = true;
        }
      }

      // Check if we have sample output to fall back to
      if (selectedTemplateData?.sampleOutput) {
        setGeneratedContent({
          title: `${selectedTemplateData.sampleOutput.title} (Sample Content)`,
          content: `${selectedTemplateData.sampleOutput.content}\n\n---\n\n## ⚠️ ${userFriendlyMessage}\n\n${retryMessage}\n\n*This is sample content to show you what our AI can generate. Create a free account to access the live AI generation service.*`
        });
        setShowOutput(true);
        setIsGenerating(false);
      } else {
        // Final fallback if no sample content exists
        setGeneratedContent({
          title: `⚠️ ${userFriendlyMessage}`,
          content: `# ${userFriendlyMessage}\n\n${retryMessage}\n\n## What you can do:\n\n- **Try again in a few moments** - temporary issues usually resolve quickly\n- **Create a free account** - get unlimited access to our AI generation service\n- **Contact support** - if the problem persists, we're here to help\n\n---\n\n*SmartPromptIQ is committed to providing reliable AI-powered content generation. We apologize for any inconvenience.*`
        });
        setShowOutput(true);
        setIsGenerating(false);
      }
    } finally {
      setIsGenerating(false);

    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      pink: "from-pink-500 to-rose-500",
      cyan: "from-cyan-500 to-teal-500"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const selectedTemplateData = selectedTemplate ? demoTemplates[selectedTemplate as keyof typeof demoTemplates] : null;

  const handleEmailSubmit = () => {
    if (email && email.includes('@')) {
      // Store email for later (could send to backend)
      localStorage.setItem('demo_email', email);
      setEmailCaptured(true);
      setShowEmailCapture(false);
      console.log('Demo email captured:', email);
    }
  };

  const handleSkipEmail = () => {
    setShowEmailCapture(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">

      {/* Advanced Request Queue Monitor */}
      <div className="fixed top-4 right-4 z-50 max-w-xs">
        <RequestQueueMonitor showControls={false} />
      </div>

      {/* Email Capture Modal */}
      <Dialog open={showEmailCapture} onOpenChange={setShowEmailCapture}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              🎮 Welcome to the SmartPromptIQ Demo!
            </DialogTitle>
            <DialogDescription className="text-center">
              Get the full experience and receive demo results via email (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email Address</Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
              />
              <p className="text-xs text-muted-foreground">
                We'll send you the demo results and updates about SmartPromptIQ
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleEmailSubmit} disabled={!email || !email.includes('@')} className="flex-1">
                Continue with Email
              </Button>
              <Button variant="outline" onClick={handleSkipEmail} className="flex-1">
                Skip for Now
              </Button>
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-center text-gray-600 mb-3">
                Ready to create your own prompts?
              </p>
              <Button
                onClick={() => setLocation('/register')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 mb-6">
              <Play className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Interactive Demo - No Signup Required</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Experience the Future of
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AI Prompt Generation
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Watch AI transform your ideas into professional content in real-time. Try our interactive demo with live AI generation - completely free!
            </p>
            
            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  47,283
                </div>
                <div className="text-white/80 text-sm">Prompts Generated</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  8,947
                </div>
                <div className="text-white/80 text-sm">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  98.7%
                </div>
                <div className="text-white/80 text-sm">Success Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  2,847
                </div>
                <div className="text-white/80 text-sm">Hours Saved</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => document.getElementById('demo-templates')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Try Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-medium rounded-lg backdrop-blur-sm"
                onClick={() => setLocation('/signin')}
              >
                Start Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="demo-templates">
        {!selectedTemplate ? (
          /* Template Selection */
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Choose Your Demo Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Select any template below to see how SmartPromptIQ creates professional, comprehensive content in seconds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(demoTemplates).map(([id, template]) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-indigo-300 bg-white"
                    onClick={() => {
                      console.log('CARD CLICK: Template card clicked for ID:', id);
                      handleTryTemplate(id);
                    }}
                  >
                    
                    <CardHeader className="relative z-10">
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getColorClasses(template.color)} text-white text-sm mb-4 shadow-lg`}>
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{template.category}</span>
                      </div>
                      <CardTitle className="flex items-start justify-between">
                        <span className="text-xl font-bold group-hover:text-indigo-600 transition-colors leading-tight">
                          {template.name}
                        </span>
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
                      </CardTitle>
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                        Try This Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Enhanced Benefits Section */}
            <div className="mt-20 bg-gradient-to-r from-gray-50 to-white rounded-3xl p-12 border border-gray-200">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SmartPromptIQ?</h3>
                <p className="text-gray-600 text-lg">Experience the difference that makes us the #1 AI prompt generator</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Fast Generation</h4>
                  <p className="text-gray-600">Professional content in under 30 seconds</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">No Risk Trial</h4>
                  <p className="text-gray-600">Try without signup or credit card</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">AI-Powered</h4>
                  <p className="text-gray-600">Advanced AI technology for quality results</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Proven Results</h4>
                  <p className="text-gray-600">98.7% success rate with 47,000+ prompts</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Enhanced Template Demo */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
                className="hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                ← Back to Templates
              </Button>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                  Live Demo
                </Badge>
                {selectedTemplateData?.questions && (
                  <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                    Interactive Mode Available
                  </Badge>
                )}
              </div>
            </div>

            {selectedTemplateData && (
              <Card className="border-2 border-indigo-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(selectedTemplateData.color)} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <selectedTemplateData.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{selectedTemplateData.name}</CardTitle>
                        <CardDescription className="text-lg text-gray-600">{selectedTemplateData.description}</CardDescription>
                        <Badge className={`mt-3 bg-gradient-to-r ${getColorClasses(selectedTemplateData.color)} text-white border-0`}>
                          {selectedTemplateData.category}
                        </Badge>
                      </div>
                    </div>
                    {selectedTemplateData.questions && !showInteractiveDemo && (
                      <Button 
                        onClick={handleStartInteractiveDemo}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Try Interactive Mode
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Interactive Questionnaire */}
                  {showInteractiveDemo && selectedTemplateData.questions ? (
                    <div className="space-y-6">
                      {selectedTemplateData.demoData && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-800 font-medium text-sm">
                                Demo Mode: Form pre-filled with example data - feel free to edit!
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setUserResponses(selectedTemplateData.demoData || {})}
                              className="text-green-700 border-green-300 hover:bg-green-100"
                            >
                              Reset to Demo Data
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Interactive Questionnaire</h3>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-500">
                            Question {currentStep + 1} of {selectedTemplateData.questions.length}
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${((currentStep + 1) / selectedTemplateData.questions.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {selectedTemplateData.questions[currentStep] && (
                        <div className="bg-white border-2 border-indigo-100 rounded-xl p-6">
                          <div className="space-y-4 mb-6">
                            <h4 className="text-xl font-semibold text-gray-900">
                              {selectedTemplateData.questions[currentStep].label}
                            </h4>
                            {selectedTemplateData.questions[currentStep].context && (
                              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                                <p className="text-indigo-800 text-sm leading-relaxed">
                                  {selectedTemplateData.questions[currentStep].context}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {selectedTemplateData.questions[currentStep].type === 'input' && (
                            <div className="relative">
                              <Input
                                placeholder={selectedTemplateData.questions[currentStep].placeholder}
                                value={userResponses[selectedTemplateData.questions[currentStep].id] || ''}
                                onChange={(e) => handleResponseChange(selectedTemplateData.questions[currentStep].id, e.target.value)}
                                className={`text-lg p-4 border-2 focus:border-indigo-500 ${
                                  userResponses[selectedTemplateData.questions[currentStep].id] && selectedTemplateData.demoData
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200'
                                }`}
                              />
                              {userResponses[selectedTemplateData.questions[currentStep].id] && selectedTemplateData.demoData && (
                                <div className="absolute -top-2 -right-2">
                                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Pre-filled
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedTemplateData.questions[currentStep].type === 'textarea' && (
                            <div className="relative">
                              <Textarea
                                placeholder={selectedTemplateData.questions[currentStep].placeholder}
                                value={userResponses[selectedTemplateData.questions[currentStep].id] || ''}
                                onChange={(e) => handleResponseChange(selectedTemplateData.questions[currentStep].id, e.target.value)}
                                className={`text-lg p-4 border-2 focus:border-indigo-500 min-h-[100px] ${
                                  userResponses[selectedTemplateData.questions[currentStep].id] && selectedTemplateData.demoData
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200'
                                }`}
                              />
                              {userResponses[selectedTemplateData.questions[currentStep].id] && selectedTemplateData.demoData && (
                                <div className="absolute -top-2 -right-2">
                                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Pre-filled
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {selectedTemplateData.questions[currentStep].type === 'select' && (
                            <Select
                              value={userResponses[selectedTemplateData.questions[currentStep].id] || ''}
                              onValueChange={(value) => handleResponseChange(selectedTemplateData.questions[currentStep].id, value)}
                            >
                              <SelectTrigger className="text-lg p-4 border-2 border-gray-200">
                                <SelectValue placeholder="Choose an option..." />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedTemplateData.questions[currentStep].options?.map((option) => (
                                  <SelectItem key={option} value={option} className="text-lg">
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {selectedTemplateData.questions[currentStep].helpText && (
                            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <p className="text-gray-700 text-sm font-medium">
                                {selectedTemplateData.questions[currentStep].helpText}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between mt-6">
                            <Button 
                              variant="outline"
                              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                              disabled={currentStep === 0}
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={handleNextStep}
                              disabled={!userResponses[selectedTemplateData.questions?.[currentStep]?.id || '']}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {currentStep === (selectedTemplateData.questions?.length || 1) - 1 ? (
                                <>Generate Content</>
                              ) : (
                                <>Next <ArrowRight className="ml-2 w-4 h-4" /></>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Sample Responses */
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Sample Questionnaire Responses</h3>
                        <Badge className="bg-blue-100 text-blue-800 px-3 py-1">Pre-filled Demo Data</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(selectedTemplateData.sampleResponses).map(([question, answer], index) => (
                          <div key={question} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="font-semibold text-indigo-700 mb-2 flex items-center">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                              {question}
                            </div>
                            <div className="text-gray-900 font-medium">{answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Generate Button */}
                  {!showInteractiveDemo && (
                    <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
                      {!showOutput && !isGenerating && (
                        <div className="space-y-4">
                          <h4 className="text-xl font-bold text-gray-900 mb-4">Ready to see the magic happen?</h4>

                          <RateLimitStatus
                            remaining={remaining}
                            retryAfter={retryAfter}
                            cooldownUntil={cooldownUntil}
                            isDebouncing={isDebouncing}
                            canGenerate={canGenerate}
                            loading={isGenerating}
                            error={hookError}
                          />

                          {/* Enhanced Rate Limit Info Badge */}
                          {remaining !== -1 && (
                            <div className="flex items-center justify-center mb-4">
                              <div className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${
                                remaining > 10
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : remaining > 5
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    : remaining > 0
                                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                      : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    remaining > 10 ? 'bg-green-500' :
                                    remaining > 5 ? 'bg-yellow-500' :
                                    remaining > 0 ? 'bg-orange-500' : 'bg-red-500'
                                  } ${remaining === 0 ? 'animate-pulse' : ''}`} />
                                  <span>
                                    {remaining > 0
                                      ? `${remaining} demo requests remaining`
                                      : 'Rate limit reached - please wait'}
                                  </span>
                                  {remaining <= 5 && remaining > 0 && (
                                    <Badge variant="outline" className="text-xs ml-2">
                                      Sign up for unlimited
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <Button
                              size="lg"
                              disabled={!canGenerate || isGenerating || isDebounced}
                              onClick={() => {
                                if (!isGenerating && canGenerate && !isDebounced) {
                                  console.log('BUTTON CLICKED: Generate Professional Content button');
                                  handleGenerateDemo();
                                }
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200"
                            >
                              {isGenerating
                                ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                  </div>
                                )
                                : isDebounced
                                  ? (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      Please wait...
                                    </div>
                                  )
                                  : 'Generate Professional Content'}
                            </Button>

                            <CooldownTimer
                              cooldownUntil={cooldownUntil}
                              retryAfter={retryAfter}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                    {isGenerating && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-12 text-center">
                        <div className="mb-6">
                          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4">Generating your content...</h4>
                        <div className="text-gray-600">
                          <div className="flex items-center justify-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>AI processing your requirements</span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Admin Debug Mode */}
                  {isAdmin() && (
                    <div className="debug-info mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                      <h4 className="font-bold text-gray-800 mb-2">🔧 Admin Debug Info</h4>
                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify({
                          showOutput,
                          hasContent: !!generatedContent,
                          contentPreview: (generatedContent?.content || '').slice(0, 50) + ((generatedContent?.content?.length || 0) > 50 ? '...' : ''),
                          isGenerating,
                          userRole: user?.role,
                          generationTime: generationStartTime ? Date.now() - generationStartTime : null
                        }, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Visual Progress Indicators */}
                  {isGenerating && (
                    <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-blue-800 mb-1">🚀 Generating content...</div>
                          <div className="text-sm text-blue-600">Processing your request with AI magic ✨</div>
                        </div>
                        <div className="text-blue-500 animate-bounce">📝</div>
                      </div>
                    </div>
                  )}

                  {/* Success Notification */}
                  {showNotification && generatedContent && (
                    <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl animate-bounce">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div className="flex-1">
                          <div className="text-green-800 font-semibold">✅ Content generated successfully!</div>
                          <div className="text-green-600 text-sm">
                            Generated in {generationStartTime ? Math.round((Date.now() - generationStartTime) / 1000) : 0} seconds
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 animate-pulse">🎉 New Content!</Badge>
                      </div>
                    </div>
                  )}


                  {/* Optimized Output Section */}
                  <OutputSection
                    generatedContent={generatedContent}
                    selectedTemplateData={selectedTemplateData}
                    showOutput={showOutput}
                    outputRef={outputRef}
                  />

                  {/* Actual output with demo-output class */}
                  {showOutput && generatedContent && (
                    <div className="demo-output" style={{
                      marginTop: '40px',
                      padding: '20px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        color: '#1f2937'
                      }}>{generatedContent.title}</h2>
                      <div style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        color: '#374151'
                      }}>{generatedContent.content}</div>
                    </div>
                  )}

                  {/* Legacy Output Section - Remove after testing */}
                  {false && (showOutput || generatedContent) && (
                    <div
                      ref={outputRef}
                      className="space-y-6 animate-fade-in transition-all duration-700 transform"
                      style={{
                        border: generatedContent ? '3px solid #10b981' : '2px solid #e5e7eb',
                        minHeight: '200px',
                        padding: '20px',
                        backgroundColor: generatedContent ? '#f0fdf4' : '#f9fafb',
                        borderRadius: '16px',
                        boxShadow: generatedContent ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                        animation: generatedContent ? 'borderGlow 2s ease-in-out' : 'none'
                      }}
                    >
                      <div className={`rounded-2xl p-6 border-2 ${
                        generatedContent?.title?.includes('⚠️') || generatedContent?.title?.includes('Sample Content')
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              generatedContent?.title?.includes('⚠️') || generatedContent?.title?.includes('Sample Content')
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}>
                              {generatedContent?.title?.includes('⚠️') ? (
                                <Target className="w-6 h-6 text-white" />
                              ) : (
                                <CheckCircle className="w-6 h-6 text-white animate-pulse" />
                              )}
                            </div>
                            <div>
                              <h3 className={`text-2xl font-bold ${
                                generatedContent?.title?.includes('⚠️') || generatedContent?.title?.includes('Sample Content')
                                  ? 'text-yellow-800'
                                  : 'text-green-800'
                              }`}>
                                {generatedContent?.title?.includes('⚠️')
                                  ? '⚠️ Demo Service Issue'
                                  : generatedContent?.title?.includes('Sample Content')
                                    ? '📝 Sample Content (Service Issue)'
                                    : '🚀 Real AI Magic Generated!'
                                }
                              </h3>
                              <p className={`text-sm ${
                                generatedContent?.title?.includes('⚠️') || generatedContent?.title?.includes('Sample Content')
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}>
                                {generatedContent?.title?.includes('⚠️')
                                  ? 'Showing fallback content'
                                  : generatedContent?.title?.includes('Sample Content')
                                    ? 'Showing sample due to service issue'
                                    : generatedContent ? '✨ Live AI Generation' : '📝 Sample Output'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`px-4 py-2 text-sm font-semibold ${
                              generatedContent?.title?.includes('⚠️') || generatedContent?.title?.includes('Sample Content')
                                ? 'bg-yellow-500 text-white'
                                : 'bg-green-500 text-white'
                            }`}>
                              {generatedContent?.title?.includes('⚠️') ? 'Error Fallback' : 'Demo Output'}
                            </Badge>
                            {(generatedContent?.title?.includes('⚠️') || generatedContent?.title?.includes('Sample Content')) && (
                              <Button
                                size="sm"
                                onClick={() => handleGenerateDemo()}
                                disabled={isGenerating || isDebounced}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <ArrowRight className="w-4 h-4 mr-1" />
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className={`text-lg ${
                          generatedContent?.title?.includes('⚠️') || generatedContent?.title?.includes('Sample Content')
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}>
                          {generatedContent?.title?.includes('⚠️')
                            ? 'We encountered an issue with the live AI service. You can still see what our AI typically generates.'
                            : generatedContent?.title?.includes('Sample Content')
                              ? 'Here\'s sample content showing what our AI creates. The live service is temporarily unavailable.'
                              : 'Here\'s what SmartPromptIQ created based on the questionnaire responses. This is actual AI-generated content!'
                          }
                        </p>
                      </div>
                      
                      <div className="bg-white border-2 border-green-300 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-2xl font-bold">
                              {generatedContent ? generatedContent.title : selectedTemplateData?.sampleOutput?.title || 'Generated Content'}
                            </h4>
                            <div className="flex items-center space-x-2 text-green-100">
                              <Star className="w-5 h-5 fill-current" />
                              <span className="text-sm font-medium">
                                {generatedContent ? 'AI Generated' : 'Professional Quality'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-8">
                          <div className="prose prose-lg max-w-none">
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed markdown-content">
                              {/* Enhanced Markdown Rendering with Fallback */}
                              {(() => {
                                const content = generatedContent ? generatedContent.content : selectedTemplateData?.sampleOutput?.content || 'No content available';
                                try {
                                  // Simple markdown-like formatting for common patterns
                                  return content
                                    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-gray-900">$1</h1>')
                                    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-4 text-gray-800">$1</h2>')
                                    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 text-gray-700">$1</h3>')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
                                    .split('\n')
                                    .map((line, index) => {
                                      // Handle list items
                                      if (line.startsWith('- ')) {
                                        return (
                                          <div
                                            key={index}
                                            className="ml-4 mb-2 animate-fade-in"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                          >
                                            <span className="text-blue-500 mr-2">•</span>
                                            <span dangerouslySetInnerHTML={{ __html: line.slice(2) }} />
                                          </div>
                                        );
                                      }

                                      // Handle headers and formatted text
                                      if (line.includes('<h1') || line.includes('<h2') || line.includes('<h3') ||
                                          line.includes('<strong') || line.includes('<em')) {
                                        return (
                                          <div
                                            key={index}
                                            dangerouslySetInnerHTML={{ __html: line }}
                                            className="animate-fade-in mb-4"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                          />
                                        );
                                      }

                                      // Handle regular paragraphs
                                      if (line.trim()) {
                                        return (
                                          <div
                                            key={index}
                                            className="mb-4 animate-fade-in"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                            dangerouslySetInnerHTML={{ __html: line }}
                                          />
                                        );
                                      }

                                      return <div key={index} className="mb-2" />;
                                    });
                                } catch (error) {
                                  console.error('Markdown rendering error:', error);
                                  // Fallback to plain text with basic formatting
                                  return (
                                    <div className="animate-fade-in">
                                      {content}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PDF Export Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <PDFExport
                          content={{
                            title: generatedContent ? generatedContent.title : selectedTemplateData.sampleOutput.title,
                            content: generatedContent ? generatedContent.content : selectedTemplateData.sampleOutput.content,
                            category: selectedTemplateData.category,
                            metadata: {
                              generatedAt: new Date().toISOString(),
                              templateType: selectedTemplate,
                              userEmail: email || 'demo@smartpromptiq.com'
                            }
                          }}
                          variant="card"
                        />

                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Zap className="w-5 h-5 text-blue-600" />
                              <span>Zapier Integration</span>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Automation
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-blue-700">
                              Automatically trigger workflows when content is generated. Connect to 5000+ apps.
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Auto-Save to Drive</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Email Notifications</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>Slack Updates</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>CRM Integration</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => window.open('https://zapier.com', '_blank')}
                            >
                              <Zap className="mr-2 w-4 h-4" />
                              Connect Zapier
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Professional CTA Section */}
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
                        
                        <div className="relative z-10">
                          <h3 className="text-3xl font-bold mb-4">
                            Ready to Create Your Own?
                          </h3>
                          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                            Get unlimited access to 15+ categories, team collaboration, and save all your generated content.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
                            <div className="bg-white/10 rounded-lg p-4">
                              <Globe className="w-6 h-6 mx-auto mb-2" />
                              <div className="font-medium text-sm">15+ Categories</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                              <Users className="w-6 h-6 mx-auto mb-2" />
                              <div className="font-medium text-sm">Team Collaboration</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                              <Shield className="w-6 h-6 mx-auto mb-2" />
                              <div className="font-medium text-sm">Save & Export</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Button
                              size="lg"
                              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium rounded-lg"
                              onClick={() => setLocation('/register')}
                            >
                              Create Free Account
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              className="border-white/50 text-white hover:bg-white/10 px-6 py-3 text-lg font-medium rounded-lg"
                              onClick={() => setLocation('/signin')}
                            >
                              Sign In
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              className="border-white/30 text-white/80 hover:bg-white/5 px-6 py-3 text-base font-medium rounded-lg"
                              onClick={() => setSelectedTemplate(null)}
                            >
                              Try Another Demo
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-center space-x-6 mt-8 text-white/80">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>No credit card required</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>10 free AI prompts</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Cancel anytime</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}