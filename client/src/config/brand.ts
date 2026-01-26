/**
 * SmartPromptIQ Brand Definitions
 * Centralized SEO-optimized content for Google ranking and AI Overview
 */

export const BRAND = {
  name: 'SmartPromptIQ',
  tagline: 'Learn the Skills, Use the Tools, Build Real Solutions',

  // Core definition for Google AI Overview (40-60 words)
  definition: `SmartPromptIQ™ is an all-in-one AI prompt engineering and application-building platform that teaches users how to design effective prompts and immediately apply them to real-world tools, workflows, and AI-powered applications. Through structured education and intelligent builders, users turn ideas into production-ready solutions without coding.`,

  // Extended definition for featured snippets
  extendedDefinition: `SmartPromptIQ™ combines comprehensive AI education with powerful creation tools. Our Academy offers 57 courses and 555+ lessons teaching prompt engineering from basics to advanced techniques. BuilderIQ transforms ideas into complete app blueprints. AI Agents let you create custom chatbots. Voice AI generates professional voiceovers. The Marketplace connects prompt engineers worldwide.`,

  // Learning-to-Execution Loop - Key Differentiator
  learningLoop: `SmartPromptIQ is built on a powerful learning-to-execution loop. Learn how AI works, then immediately apply that knowledge to build real solutions — all inside one platform. This is not just education. This is not just tools. This is a system.`,

  // Academy Definition - SEO Entity
  academyDefinition: `The SmartPromptIQ Academy is a structured AI education system designed to teach prompt engineering, AI workflows, and real-world application building from beginner to advanced levels. With 57 courses and 555+ lessons, it's the most comprehensive AI prompt engineering curriculum available.`,

  // What SmartPromptIQ is for
  whatItsFor: `SmartPromptIQ bridges the gap between learning AI and building with AI. Instead of just teaching prompt theory, we provide the actual tools to create prompts, generate app specifications, build AI agents, and produce professional content. Users go from "I want to learn AI" to "I built this with AI" in the same platform.`,

  // Who SmartPromptIQ is for
  whoItsFor: [
    'Entrepreneurs turning AI ideas into real applications without hiring developers',
    'Marketers automating content creation, campaigns, and customer engagement',
    'Developers accelerating their workflow with AI-powered code generation and review',
    'Educators creating courses, curricula, and learning experiences at scale',
    'Business professionals streamlining operations with AI-driven automation',
    'Content creators producing videos, podcasts, and written content faster',
    'Career changers entering the high-demand field of AI and prompt engineering',
    'Agencies delivering AI solutions to clients with white-label tools'
  ],

  // How SmartPromptIQ helps
  howItHelps: [
    'Learn prompt engineering through 57 structured courses with hands-on exercises',
    'Create custom AI prompts using guided questionnaires and templates',
    'Generate complete app blueprints from simple idea descriptions',
    'Build and deploy AI chatbots on any website without coding',
    'Produce professional voiceovers with 20+ AI voices',
    'Access 100+ battle-tested prompt templates for any industry',
    'Earn certifications that prove your AI skills to employers',
    'Connect with 10,000+ prompt engineers in our community'
  ],

  // Platform pillars
  pillars: {
    academy: {
      name: 'Academy',
      tagline: 'Learn AI prompt engineering from experts',
      description: '57 courses, 555+ lessons covering everything from basic prompts to advanced AI systems',
      stats: { courses: 57, lessons: 555, students: 10000 }
    },
    builderIQ: {
      name: 'BuilderIQ',
      tagline: 'Transform ideas into app blueprints',
      description: 'AI-powered app specification generator that creates complete blueprints from your descriptions',
      stats: { templates: 100, industries: 12, appsCreated: 5000 }
    },
    templates: {
      name: 'Templates',
      tagline: 'Battle-tested prompts ready to use',
      description: '100+ professionally crafted prompt templates for marketing, sales, development, and more',
      stats: { templates: 100, categories: 6, downloads: 50000 }
    },
    agents: {
      name: 'AI Agents',
      tagline: 'Custom chatbots for any website',
      description: 'Create, configure, and deploy intelligent chatbots powered by Claude and GPT',
      stats: { agents: 10000, messages: 1000000, satisfaction: 98 }
    },
    voice: {
      name: 'Voice AI',
      tagline: 'Professional AI voiceovers in seconds',
      description: 'Convert text to natural speech with 20+ premium AI voices from ElevenLabs and OpenAI',
      stats: { voices: 20, languages: 10, audioGenerated: 100000 }
    },
    marketplace: {
      name: 'Marketplace',
      tagline: 'Buy and sell professional prompts',
      description: 'Connect with prompt engineers worldwide to buy proven prompts or sell your expertise',
      stats: { prompts: 5000, sellers: 500, downloads: 100000 }
    }
  },

  // Schema.org Organization data
  schema: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SmartPromptIQ',
    url: 'https://smartpromptiq.com',
    logo: 'https://smartpromptiq.com/logo.png',
    description: 'SmartPromptIQ™ is an all-in-one AI prompt engineering and application-building platform that teaches users how to design effective prompts and immediately apply them to real-world tools, workflows, and AI-powered applications.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/smartpromptiq',
      'https://linkedin.com/company/smartpromptiq',
      'https://youtube.com/@smartpromptiq'
    ],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '99',
      offerCount: '4'
    }
  },

  // Schema.org WebApplication data
  webAppSchema: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SmartPromptIQ',
    url: 'https://smartpromptiq.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    description: 'AI prompt engineering and application-building platform with courses, templates, and intelligent builders.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2847',
      bestRating: '5'
    }
  }
};

// SEO meta tags generator
export const generateMetaTags = (page: string) => {
  const baseTitle = 'SmartPromptIQ - AI Prompt Engineering & App Building Platform';
  const titles: Record<string, string> = {
    home: baseTitle,
    academy: 'SmartPromptIQ Academy - Learn AI Prompt Engineering | 57 Courses',
    templates: 'AI Prompt Templates - 100+ Ready-to-Use Prompts | SmartPromptIQ',
    builderiq: 'BuilderIQ - AI App Builder | Create App Blueprints | SmartPromptIQ',
    agents: 'AI Agents - Build Custom Chatbots | SmartPromptIQ',
    voice: 'Voice AI - Text to Speech | 20+ Premium Voices | SmartPromptIQ',
    marketplace: 'Prompt Marketplace - Buy & Sell AI Prompts | SmartPromptIQ'
  };

  return {
    title: titles[page] || baseTitle,
    description: BRAND.definition,
    keywords: 'AI prompt engineering, prompt templates, AI app builder, chatbot builder, text to speech, AI courses, prompt marketplace, SmartPromptIQ'
  };
};

export default BRAND;
