import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight, BookOpen, Layers, Sparkles,
  TrendingUp, Target, Code, Briefcase, GraduationCap,
  Heart, PenTool, Users
} from 'lucide-react';

interface CategorySEOData {
  id: string;
  name: string;
  definition: string;
  whatItCovers: string;
  benefits: string[];
  academyCourses: { title: string; slug: string }[];
  templateCount: number;
  icon: React.ComponentType<any>;
  gradient: string;
}

// SEO-optimized category content
export const categoryContent: Record<string, CategorySEOData> = {
  marketing: {
    id: 'marketing',
    name: 'AI for Marketing',
    definition: 'AI-powered marketing prompts help automate campaigns, content creation, ad copywriting, email sequences, and social media strategy. Generate high-converting copy, analyze competitors, and optimize your marketing workflow with intelligent AI assistants.',
    whatItCovers: 'Our marketing prompts cover the full marketing stack: content marketing (blog posts, articles, SEO), social media (posts, captions, hashtags), email marketing (sequences, subject lines, newsletters), advertising (Google Ads, Facebook Ads, copy), brand strategy (positioning, messaging, voice), and analytics (reports, insights, recommendations).',
    benefits: [
      'Generate weeks of social media content in minutes',
      'Create high-converting ad copy with proven frameworks',
      'Build complete email sequences for any funnel stage',
      'Analyze competitors and identify market opportunities',
      'Maintain consistent brand voice across all channels'
    ],
    academyCourses: [
      { title: 'AI Marketing Mastery', slug: 'ai-marketing-mastery' },
      { title: 'Content Creation with AI', slug: 'content-creation-ai' },
      { title: 'Social Media Automation', slug: 'social-media-automation' }
    ],
    templateCount: 25,
    icon: TrendingUp,
    gradient: 'from-orange-500 to-red-500'
  },
  business: {
    id: 'business',
    name: 'AI for Business Strategy',
    definition: 'Business strategy prompts help executives and managers analyze data, create reports, develop strategic plans, and make better decisions. From SWOT analysis to financial modeling, AI accelerates strategic thinking and execution.',
    whatItCovers: 'Our business prompts span strategic planning (vision, mission, OKRs), financial analysis (projections, budgets, reports), operations (process optimization, SOPs), HR (job descriptions, reviews, policies), sales (proposals, pitches, scripts), and market research (analysis, trends, insights).',
    benefits: [
      'Create comprehensive business plans in hours, not weeks',
      'Generate financial projections with professional formatting',
      'Develop SOPs and documentation consistently',
      'Analyze market data and identify strategic opportunities',
      'Prepare investor pitches and board presentations'
    ],
    academyCourses: [
      { title: 'AI Business Strategy', slug: 'ai-business-strategy' },
      { title: 'Financial Analysis with AI', slug: 'financial-analysis-ai' },
      { title: 'Executive Communication', slug: 'executive-communication' }
    ],
    templateCount: 20,
    icon: Briefcase,
    gradient: 'from-slate-500 to-gray-600'
  },
  development: {
    id: 'development',
    name: 'AI for Development',
    definition: 'Development prompts help programmers write, review, debug, and document code faster. From code generation to architecture design, AI coding assistants accelerate the entire software development lifecycle.',
    whatItCovers: 'Our development prompts cover code generation (functions, classes, APIs), code review (bugs, security, best practices), documentation (README, API docs, comments), testing (unit tests, integration tests), debugging (error analysis, fixes), and architecture (system design, database schemas).',
    benefits: [
      'Generate boilerplate code and reduce repetitive tasks',
      'Get instant code reviews with security insights',
      'Create comprehensive documentation automatically',
      'Write unit tests that cover edge cases',
      'Debug complex issues with AI-assisted analysis'
    ],
    academyCourses: [
      { title: 'AI Coding Assistant', slug: 'ai-coding-assistant' },
      { title: 'Code Review Mastery', slug: 'code-review-mastery' },
      { title: 'Technical Documentation', slug: 'technical-documentation' }
    ],
    templateCount: 30,
    icon: Code,
    gradient: 'from-blue-500 to-cyan-500'
  },
  education: {
    id: 'education',
    name: 'AI for Education',
    definition: 'Education prompts help teachers, trainers, and course creators develop curriculum, create lessons, generate assessments, and personalize learning. Transform how you teach with AI-powered educational content.',
    whatItCovers: 'Our education prompts span curriculum design (learning objectives, lesson plans), content creation (lectures, explanations, examples), assessments (quizzes, exams, rubrics), student support (feedback, explanations, tutoring), and course development (outlines, modules, certifications).',
    benefits: [
      'Create complete course curricula with aligned objectives',
      'Generate engaging lesson content for any subject',
      'Build comprehensive assessments with answer keys',
      'Provide personalized feedback at scale',
      'Develop professional training materials'
    ],
    academyCourses: [
      { title: 'AI for Educators', slug: 'ai-for-educators' },
      { title: 'Course Creation Mastery', slug: 'course-creation-mastery' },
      { title: 'Assessment Design', slug: 'assessment-design' }
    ],
    templateCount: 18,
    icon: GraduationCap,
    gradient: 'from-green-500 to-emerald-500'
  },
  personal: {
    id: 'personal',
    name: 'AI for Personal Development',
    definition: 'Personal development prompts help individuals set goals, build habits, improve productivity, and achieve personal growth. From journaling to career planning, AI supports your self-improvement journey.',
    whatItCovers: 'Our personal prompts cover goal setting (SMART goals, action plans), productivity (time management, routines), journaling (prompts, reflection, gratitude), career (resumes, cover letters, interviews), health (fitness, nutrition, mental wellness), and relationships (communication, boundaries).',
    benefits: [
      'Create actionable goal plans with milestones',
      'Build sustainable habits with proven frameworks',
      'Maintain a meaningful journaling practice',
      'Prepare for career opportunities professionally',
      'Improve communication in all relationships'
    ],
    academyCourses: [
      { title: 'AI-Powered Productivity', slug: 'ai-powered-productivity' },
      { title: 'Career Growth with AI', slug: 'career-growth-ai' },
      { title: 'Personal Branding', slug: 'personal-branding' }
    ],
    templateCount: 15,
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500'
  },
  creative: {
    id: 'creative',
    name: 'AI for Creative Work',
    definition: 'Creative prompts help writers, designers, and artists generate ideas, overcome blocks, and produce original work. From storytelling to brainstorming, AI amplifies your creative potential.',
    whatItCovers: 'Our creative prompts span writing (stories, scripts, poetry), design (concepts, briefs, feedback), ideation (brainstorming, mind mapping), copywriting (headlines, taglines, hooks), art direction (mood boards, style guides), and content (video scripts, podcast outlines).',
    benefits: [
      'Generate endless creative ideas on demand',
      'Overcome writer\'s block with structured prompts',
      'Develop compelling narratives and storylines',
      'Create diverse content variations quickly',
      'Maintain creative consistency across projects'
    ],
    academyCourses: [
      { title: 'Creative Writing with AI', slug: 'creative-writing-ai' },
      { title: 'Storytelling Mastery', slug: 'storytelling-mastery' },
      { title: 'Content Ideation', slug: 'content-ideation' }
    ],
    templateCount: 22,
    icon: PenTool,
    gradient: 'from-purple-500 to-violet-500'
  }
};

interface CategorySEOSectionProps {
  categoryId: string;
  showFull?: boolean;
}

/**
 * CategorySEOSection - SEO-optimized category page content
 * Unlocks dozens of keywords per category
 */
const CategorySEOSection: React.FC<CategorySEOSectionProps> = ({
  categoryId,
  showFull = true
}) => {
  const category = categoryContent[categoryId];

  if (!category) return null;

  const Icon = category.icon;

  return (
    <section
      className="mb-12"
      itemScope
      itemType="https://schema.org/WebPage"
    >
      {/* Category Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2
            className="text-3xl font-bold text-gray-900 dark:text-white"
            itemProp="name"
          >
            {category.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {category.templateCount}+ templates available
          </p>
        </div>
      </div>

      {/* Definition */}
      <p
        className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
        itemProp="description"
      >
        {category.definition}
      </p>

      {showFull && (
        <>
          {/* What It Covers */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What {category.name} Covers
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {category.whatItCovers}
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              How It Helps You
            </h3>
            <ul className="space-y-3">
              {category.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Sparkles className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Academy Courses */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Learn {category.name} in Academy
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {category.academyCourses.map((course) => (
                <Link key={course.slug} href={`/academy/course/${course.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-md transition-all border-gray-200 dark:border-gray-700 hover:border-indigo-300">
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600">
                        {course.title}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/templates?category=${categoryId}`}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-indigo-50 border-indigo-200 px-4 py-2"
              >
                <Layers className="w-4 h-4 mr-2 text-indigo-600" />
                View {category.name} Templates
              </Badge>
            </Link>
            <Link href={`/questionnaire/${categoryId}`}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-purple-50 border-purple-200 px-4 py-2"
              >
                <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                Create {category.name} Prompt
              </Badge>
            </Link>
            <Link href="/academy">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-green-50 border-green-200 px-4 py-2"
              >
                <GraduationCap className="w-4 h-4 mr-2 text-green-600" />
                Browse All Courses
              </Badge>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default CategorySEOSection;
