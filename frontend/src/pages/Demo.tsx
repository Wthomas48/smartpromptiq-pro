import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Zap
} from "lucide-react";
import BackButton from "@/components/BackButton";

export default function Demo() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Demo templates with pre-filled responses and sample outputs
  const demoTemplates = {
    "startup-pitch": {
      name: "Startup Pitch Generator",
      category: "Business Strategy",
      icon: Briefcase,
      color: "blue",
      description: "Create compelling pitch presentations for investors",
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
    "course-creator": {
      name: "Online Course Creator",
      category: "Education",
      icon: BookOpen,
      color: "purple",
      description: "Design comprehensive online courses with structured modules",
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
    }
  };

  const handleTryTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowOutput(false);
  };

  const handleGenerateDemo = () => {
    setIsGenerating(true);
    setShowOutput(false);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowOutput(true);
    }, 3000);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const selectedTemplateData = selectedTemplate ? demoTemplates[selectedTemplate as keyof typeof demoTemplates] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton />
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700 mb-4">
              <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300 font-medium">Try Demo Without Signup</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Experience Smart PromptIQ
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how our AI generates professional prompts in seconds. Try our demo templates with real sample outputs - no signup required!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!selectedTemplate ? (
          /* Template Selection */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Choose a Template to Try
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select any template below to see how Smart PromptIQ creates professional prompts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(demoTemplates).map(([id, template]) => {
                const Icon = template.icon;
                return (
                  <Card key={id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-indigo-200 dark:hover:border-indigo-700" onClick={() => handleTryTemplate(id)}>
                    <CardHeader>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getColorClasses(template.color)} text-white text-sm mb-3`}>
                        <Icon className="w-4 h-4" />
                        <span>{template.category}</span>
                      </div>
                      <CardTitle className="flex items-start justify-between">
                        <span className="text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {template.name}
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                      <CardDescription>
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        Try This Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Benefits Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">See professional prompts generated in seconds</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Commitment</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Try everything without creating an account</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real Quality</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Experience the same quality as our paid users</p>
              </div>
            </div>
          </div>
        ) : (
          /* Template Demo */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                ← Back to Templates
              </Button>
              <Badge variant="secondary" className="text-sm">Demo Mode</Badge>
            </div>

            {selectedTemplateData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <selectedTemplateData.icon className="w-8 h-8 text-indigo-600" />
                    <div>
                      <CardTitle className="text-2xl">{selectedTemplateData.name}</CardTitle>
                      <CardDescription>{selectedTemplateData.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sample Responses */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sample Questionnaire Responses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedTemplateData.sampleResponses).map(([question, answer]) => (
                        <div key={question} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">{question}</div>
                          <div className="text-gray-900 dark:text-white">{answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Generate Button */}
                  <div className="text-center">
                    {!showOutput && !isGenerating && (
                      <Button 
                        size="lg" 
                        onClick={handleGenerateDemo}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate AI Prompt
                      </Button>
                    )}

                    {isGenerating && (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        <div className="text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 inline mr-2" />
                          AI is generating your prompt...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Output */}
                  {showOutput && selectedTemplateData.sampleOutput && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                          ✓ Generated Prompt
                        </h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Sample Output
                        </Badge>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
                        <h4 className="text-xl font-bold mb-4">{selectedTemplateData.sampleOutput.title}</h4>
                        <div className="prose dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{selectedTemplateData.sampleOutput.content}</pre>
                        </div>
                      </div>

                      {/* CTA Section */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          Ready for Real AI Prompts?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                          This was just a sample! Sign up to create unlimited custom prompts with our advanced AI, save your work, collaborate with teams, and access 15+ categories.
                        </p>
                        <div className="space-y-4">
                          <Link href="/api/login">
                            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 mr-4">
                              Sign Up to Use Real AI Prompts
                            </Button>
                          </Link>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Free tier includes 10 AI-generated prompts • No credit card required
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