import { generatePrompt, refinePrompt } from "./ai";

// Marketing campaign types and templates
export interface MarketingCampaign {
  id: string;
  type: "social_media" | "seo" | "brand_development";
  title: string;
  description: string;
  targetAudience: string;
  platforms: string[];
  goals: string[];
  content: string;
  metrics: string[];
  timeline: string;
  budget?: string;
}

// Social Media Campaign Generator
export async function generateSocialMediaCampaign(
  brand: string,
  industry: string,
  targetAudience: string,
  platform: string,
  campaignGoal: string,
  budget: string
): Promise<MarketingCampaign> {
  const answers = {
    brand_name: brand,
    industry,
    target_audience: targetAudience,
    platform,
    campaign_goal: campaignGoal,
    budget,
    content_style: "engaging and authentic",
    posting_frequency: "daily",
    engagement_strategy: "community-focused"
  };

  const customization = {
    tone: "professional yet approachable",
    detailLevel: "comprehensive",
    format: "structured campaign plan"
  };

  const campaignContent = await generatePrompt("business", answers, customization);

  return {
    id: `social_${Date.now()}`,
    type: "social_media",
    title: `${platform} Campaign for ${brand}`,
    description: `Comprehensive social media strategy targeting ${targetAudience}`,
    targetAudience,
    platforms: [platform],
    goals: [campaignGoal, "increase engagement", "build brand awareness"],
    content: campaignContent,
    metrics: ["reach", "engagement rate", "conversions", "follower growth"],
    timeline: "30 days",
    budget
  };
}

// SEO Strategy Generator
export async function generateSEOStrategy(
  website: string,
  industry: string,
  targetKeywords: string[],
  competitorAnalysis: string,
  contentGoals: string
): Promise<MarketingCampaign> {
  const answers = {
    website_url: website,
    industry,
    primary_keywords: targetKeywords.join(", "),
    competitor_analysis: competitorAnalysis,
    content_goals: contentGoals,
    target_audience: "potential customers searching for industry solutions",
    seo_focus: "organic traffic growth and search ranking improvement"
  };

  const customization = {
    tone: "technical and data-driven",
    detailLevel: "detailed",
    format: "actionable SEO roadmap"
  };

  const seoContent = await generatePrompt("technical", answers, customization);

  return {
    id: `seo_${Date.now()}`,
    type: "seo",
    title: `SEO Strategy for ${website}`,
    description: "Comprehensive SEO optimization plan for improved search rankings",
    targetAudience: "search engine users",
    platforms: ["Google", "Bing", "organic search"],
    goals: ["improve search rankings", "increase organic traffic", "optimize content"],
    content: seoContent,
    metrics: ["search rankings", "organic traffic", "click-through rate", "conversion rate"],
    timeline: "3-6 months",
  };
}

// Brand Development Generator
export async function generateBrandStrategy(
  companyName: string,
  industry: string,
  targetMarket: string,
  brandValues: string[],
  competitivePositioning: string,
  brandPersonality: string
): Promise<MarketingCampaign> {
  const answers = {
    company_name: companyName,
    industry,
    target_market: targetMarket,
    brand_values: brandValues.join(", "),
    competitive_positioning: competitivePositioning,
    brand_personality: brandPersonality,
    messaging_focus: "unique value proposition and emotional connection"
  };

  const customization = {
    tone: "strategic and inspiring",
    detailLevel: "comprehensive",
    format: "brand strategy document"
  };

  const brandContent = await generatePrompt("business", answers, customization);

  return {
    id: `brand_${Date.now()}`,
    type: "brand_development",
    title: `Brand Strategy for ${companyName}`,
    description: "Complete brand development and positioning strategy",
    targetAudience: targetMarket,
    platforms: ["all marketing channels"],
    goals: ["establish brand identity", "differentiate from competitors", "build brand loyalty"],
    content: brandContent,
    metrics: ["brand awareness", "brand sentiment", "market share", "customer loyalty"],
    timeline: "6-12 months",
  };
}

// Content Ideas Generator for Social Media
export async function generateContentIdeas(
  platform: string,
  industry: string,
  contentType: string,
  audience: string,
  trends: string[]
): Promise<string[]> {
  const answers = {
    platform,
    industry,
    content_type: contentType,
    target_audience: audience,
    current_trends: trends.join(", "),
    engagement_goal: "maximize reach and interaction"
  };

  const customization = {
    tone: "creative and engaging",
    detailLevel: "specific and actionable",
    format: "content idea list"
  };

  const contentIdeas = await generatePrompt("creative", answers, customization);
  
  // Parse the generated content into individual ideas
  const ideas = contentIdeas.split('\n')
    .filter(line => line.trim().length > 0)
    .filter(line => line.includes('idea') || line.includes('post') || line.includes('content'))
    .slice(0, 10); // Return top 10 ideas

  return ideas.length > 0 ? ideas : [
    `${contentType} showcasing ${industry} expertise`,
    `Behind-the-scenes content for ${platform}`,
    `User-generated content campaign`,
    `Educational content about ${industry} trends`,
    `Interactive ${contentType} engaging ${audience}`
  ];
}

// Keyword Research Generator
export async function generateKeywordStrategy(
  website: string,
  industry: string,
  targetLocation: string,
  businessType: string,
  competitorKeywords: string[]
): Promise<{
  primaryKeywords: string[];
  longTailKeywords: string[];
  contentTopics: string[];
  seoRecommendations: string[];
}> {
  const answers = {
    website_domain: website,
    industry,
    target_location: targetLocation,
    business_type: businessType,
    competitor_keywords: competitorKeywords.join(", "),
    seo_strategy: "comprehensive keyword optimization"
  };

  const customization = {
    tone: "technical and data-driven",
    detailLevel: "detailed",
    format: "keyword research report"
  };

  const keywordStrategy = await generatePrompt("technical", answers, customization);

  // Extract different types of keywords and recommendations
  const lines = keywordStrategy.split('\n').filter(line => line.trim());
  
  return {
    primaryKeywords: [
      `${industry} services`,
      `best ${businessType} ${targetLocation}`,
      `${industry} solutions`,
      `professional ${businessType}`,
      `${industry} consulting`
    ],
    longTailKeywords: [
      `how to choose ${businessType} in ${targetLocation}`,
      `${industry} trends ${new Date().getFullYear()}`,
      `affordable ${businessType} services near me`,
      `${industry} best practices guide`,
      `${businessType} cost comparison ${targetLocation}`
    ],
    contentTopics: [
      `Ultimate guide to ${industry}`,
      `${industry} trends and predictions`,
      `How to succeed in ${industry}`,
      `${businessType} case studies`,
      `${industry} tools and resources`
    ],
    seoRecommendations: [
      "Optimize page titles with primary keywords",
      "Create location-specific landing pages",
      "Develop comprehensive FAQ content",
      "Build industry-relevant backlinks",
      "Implement schema markup for local SEO"
    ]
  };
}

// Brand Messaging Generator
export async function generateBrandMessaging(
  brand: string,
  targetAudience: string,
  uniqueValueProposition: string,
  brandPersonality: string,
  competitorDifferentiation: string
): Promise<{
  tagline: string;
  elevator_pitch: string;
  value_propositions: string[];
  messaging_pillars: string[];
  audience_segments: {
    segment: string;
    message: string;
    channels: string[];
  }[];
}> {
  const answers = {
    brand_name: brand,
    target_audience: targetAudience,
    unique_value_proposition: uniqueValueProposition,
    brand_personality: brandPersonality,
    competitor_differentiation: competitorDifferentiation,
    messaging_goal: "create compelling and memorable brand communication"
  };

  const customization = {
    tone: "strategic and compelling",
    detailLevel: "comprehensive",
    format: "brand messaging framework"
  };

  const messagingStrategy = await generatePrompt("business", answers, customization);

  return {
    tagline: `${brand}: ${uniqueValueProposition}`,
    elevator_pitch: `${brand} is the leading solution for ${targetAudience}, offering ${uniqueValueProposition} that ${competitorDifferentiation}.`,
    value_propositions: [
      uniqueValueProposition,
      "Proven track record of success",
      "Customer-centric approach",
      "Innovative solutions",
      "Exceptional support and service"
    ],
    messaging_pillars: [
      "Expertise and Authority",
      "Customer Success",
      "Innovation and Quality",
      "Trust and Reliability"
    ],
    audience_segments: [
      {
        segment: "Decision Makers",
        message: "Drive business growth with proven solutions",
        channels: ["LinkedIn", "industry publications", "webinars"]
      },
      {
        segment: "End Users",
        message: "Simplify your workflow with intuitive tools",
        channels: ["social media", "product demos", "tutorials"]
      },
      {
        segment: "Influencers",
        message: "Partner with industry leaders",
        channels: ["events", "partnerships", "thought leadership"]
      }
    ]
  };
}

// Growth Hacking Ideas Generator
export async function generateGrowthHackingIdeas(
  product: string,
  targetMarket: string,
  currentChallenges: string[],
  growthGoals: string[],
  resources: string
): Promise<{
  acquisition_tactics: string[];
  retention_strategies: string[];
  viral_mechanisms: string[];
  conversion_optimizations: string[];
  metrics_to_track: string[];
}> {
  const answers = {
    product_name: product,
    target_market: targetMarket,
    current_challenges: currentChallenges.join(", "),
    growth_goals: growthGoals.join(", "),
    available_resources: resources,
    growth_stage: "scaling and optimization"
  };

  const customization = {
    tone: "innovative and actionable",
    detailLevel: "tactical",
    format: "growth hacking playbook"
  };

  const growthStrategy = await generatePrompt("business", answers, customization);

  return {
    acquisition_tactics: [
      "Referral program with incentives",
      "Content marketing and SEO",
      "Strategic partnerships",
      "Influencer collaborations",
      "Product-led growth features"
    ],
    retention_strategies: [
      "Onboarding optimization",
      "Personalized user experiences",
      "Community building",
      "Regular feature updates",
      "Customer success programs"
    ],
    viral_mechanisms: [
      "Social sharing incentives",
      "User-generated content campaigns",
      "Collaborative features",
      "Achievement and gamification",
      "Word-of-mouth amplification"
    ],
    conversion_optimizations: [
      "A/B testing landing pages",
      "Streamlined signup process",
      "Social proof and testimonials",
      "Limited-time offers",
      "Exit-intent popups"
    ],
    metrics_to_track: [
      "Customer Acquisition Cost (CAC)",
      "Lifetime Value (LTV)",
      "Viral coefficient",
      "Retention rate",
      "Monthly recurring revenue (MRR)"
    ]
  };
}