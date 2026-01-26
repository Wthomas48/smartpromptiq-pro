import React from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Lightbulb } from 'lucide-react';

interface RelatedLink {
  label: string;
  href: string;
}

interface EducationalHeaderProps {
  title: string;
  definition: string;
  icon?: React.ReactNode;
  academyLink?: string;
  relatedLinks?: RelatedLink[];
  gradient?: string;
}

/**
 * EducationalHeader - SEO-friendly educational context above app UI
 * Adds semantic context for:
 * - SEO crawlers
 * - Accessibility
 * - Google AI Overview
 * - User understanding
 */
const EducationalHeader: React.FC<EducationalHeaderProps> = ({
  title,
  definition,
  icon,
  academyLink,
  relatedLinks = [],
  gradient = 'from-indigo-500/10 to-purple-500/10'
}) => {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} border-b border-gray-200 dark:border-gray-700`}
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title and Definition */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {icon && <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>}
              <h1
                className="text-xl font-bold text-gray-900 dark:text-white"
                itemProp="name"
              >
                {title}
              </h1>
              {academyLink && (
                <Link href={academyLink}>
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-indigo-300 text-indigo-600 dark:text-indigo-400"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    Learn More
                  </Badge>
                </Link>
              )}
            </div>
            <p
              className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl"
              itemProp="description"
            >
              {definition}
            </p>
          </div>

          {/* Related Links */}
          {relatedLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Lightbulb className="w-3 h-3 mr-1" />
                Related:
              </span>
              {relatedLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center">
                    {link.label}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationalHeader;

// Pre-configured educational content for each section
export const educationalContent = {
  aiAgents: {
    title: 'AI Agents',
    definition: 'AI agents are autonomous systems that execute tasks, decisions, and workflows using structured prompts and automation logic. Create custom chatbots for your website with personalized behaviors and knowledge.',
    academyLink: '/academy/course/ai-agents-masterclass',
    relatedLinks: [
      { label: 'Templates', href: '/templates' },
      { label: 'BuilderIQ', href: '/builderiq' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-purple-500/10 to-violet-500/10'
  },
  templates: {
    title: 'AI Prompt Templates',
    definition: 'Prompt templates are pre-written, battle-tested instructions designed to get optimal results from AI models. Skip trial and error with professionally crafted prompts for marketing, sales, coding, and content creation.',
    academyLink: '/academy/course/prompt-engineering-fundamentals',
    relatedLinks: [
      { label: 'Create Custom', href: '/questionnaire' },
      { label: 'AI Agents', href: '/agents' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-indigo-500/10 to-cyan-500/10'
  },
  builderIQ: {
    title: 'BuilderIQ App Builder',
    definition: 'BuilderIQ transforms your ideas into complete application blueprints using AI-powered analysis. Describe your app concept and receive detailed specifications, tech stack recommendations, and implementation guides.',
    academyLink: '/academy/course/builderiq-mastery',
    relatedLinks: [
      { label: 'Templates', href: '/templates' },
      { label: 'AI Agents', href: '/agents' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-purple-500/10 to-pink-500/10'
  },
  voiceAI: {
    title: 'Voice AI Studio',
    definition: 'Voice AI converts text into natural-sounding speech using neural networks from ElevenLabs and OpenAI. Create professional voiceovers for videos, podcasts, e-learning, and applications in seconds.',
    academyLink: '/academy/course/voice-ai-fundamentals',
    relatedLinks: [
      { label: 'Templates', href: '/templates' },
      { label: 'BuilderIQ', href: '/builderiq' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-orange-500/10 to-red-500/10'
  },
  marketplace: {
    title: 'Prompt Marketplace',
    definition: 'The marketplace connects prompt engineers with professionals seeking battle-tested AI instructions. Buy proven prompts or sell your expertise to earn passive income from your prompt engineering skills.',
    academyLink: '/academy/course/marketplace-success',
    relatedLinks: [
      { label: 'Templates', href: '/templates' },
      { label: 'Create Prompts', href: '/questionnaire' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-green-500/10 to-emerald-500/10'
  },
  academy: {
    title: 'SmartPromptIQ Academy',
    definition: 'Academy is your comprehensive learning hub for AI prompt engineering. Master the art of communicating with AI through structured courses, hands-on projects, and industry-recognized certifications.',
    relatedLinks: [
      { label: 'Templates', href: '/templates' },
      { label: 'BuilderIQ', href: '/builderiq' },
      { label: 'AI Agents', href: '/agents' },
      { label: 'Voice AI', href: '/voice' }
    ],
    gradient: 'from-purple-500/10 to-indigo-500/10'
  },
  marketing: {
    title: 'AI for Marketing',
    definition: 'AI-powered prompts help automate campaigns, content creation, and marketing strategy. Generate ad copy, social media posts, email sequences, and SEO content that converts.',
    academyLink: '/academy/course/ai-marketing-mastery',
    relatedLinks: [
      { label: 'Marketing Templates', href: '/templates?category=marketing' },
      { label: 'Create Campaign', href: '/questionnaire/marketing' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-orange-500/10 to-amber-500/10'
  },
  development: {
    title: 'AI for Development',
    definition: 'AI coding assistants help write, review, and debug code faster. Generate documentation, create tests, refactor legacy code, and accelerate your development workflow.',
    academyLink: '/academy/course/ai-coding-assistant',
    relatedLinks: [
      { label: 'Dev Templates', href: '/templates?category=development' },
      { label: 'BuilderIQ', href: '/builderiq' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-blue-500/10 to-cyan-500/10'
  },
  business: {
    title: 'AI for Business',
    definition: 'AI tools streamline business operations from strategy planning to customer service. Automate reports, analyze data, create presentations, and make better decisions faster.',
    academyLink: '/academy/course/ai-business-strategy',
    relatedLinks: [
      { label: 'Business Templates', href: '/templates?category=business' },
      { label: 'Create Strategy', href: '/questionnaire/business' },
      { label: 'Academy', href: '/academy' }
    ],
    gradient: 'from-slate-500/10 to-gray-500/10'
  }
};
