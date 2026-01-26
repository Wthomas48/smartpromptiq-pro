import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight, CheckCircle, Users, Target, Lightbulb,
  ChevronRight, Sparkles, BookOpen
} from 'lucide-react';
import PublicLandingLayout from './PublicLandingLayout';
import BRAND from '@/config/brand';

interface InternalLink {
  label: string;
  href: string;
  description?: string;
}

interface SectionLandingProps {
  title: string;
  definition: string; // 40-60 words SEO definition
  whatItsFor: string;
  whoItsFor: string[];
  howItHelps: string[];
  internalLinks: InternalLink[];
  heroGradient?: string;
  icon?: React.ReactNode;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  stats?: { label: string; value: string }[];
  faqs?: { question: string; answer: string }[];
}

/**
 * SectionLanding - SEO-optimized landing page component for Google AI Overview
 * Features:
 * - Featured snippet optimized definition (40-60 words)
 * - Schema.org structured data
 * - Semantic HTML with proper headings
 * - Internal linking for SEO juice
 * - FAQ section for "People Also Ask"
 */
const SectionLanding: React.FC<SectionLandingProps> = ({
  title,
  definition,
  whatItsFor,
  whoItsFor,
  howItHelps,
  internalLinks,
  heroGradient = 'from-indigo-600 via-purple-600 to-cyan-600',
  icon,
  ctaText = 'Get Started Free',
  ctaHref = '/signup',
  secondaryCtaText = 'Learn More',
  secondaryCtaHref = '/academy',
  stats,
  faqs
}) => {
  // Generate Schema.org structured data for SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": definition,
    "provider": {
      "@type": "Organization",
      "name": "SmartPromptIQ",
      "url": "https://smartpromptiq.com"
    },
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": title,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "description": definition
    }
  };

  // FAQ Schema for "People Also Ask"
  const faqSchema = faqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <PublicLandingLayout heroGradient={heroGradient}>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hero Section with Featured Snippet Optimization */}
      <section
        className={`relative py-20 lg:py-32 bg-gradient-to-br ${heroGradient} overflow-hidden`}
        itemScope
        itemType="https://schema.org/WebPage"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              SmartPromptIQ Platform
            </Badge>

            {/* H1 - Primary SEO Target */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              itemProp="name"
            >
              {title}
            </h1>

            {/* Featured Snippet Definition (40-60 words) */}
            <div className="max-w-3xl mx-auto mb-8">
              <p
                className="text-xl md:text-2xl text-white/90 leading-relaxed"
                itemProp="description"
              >
                {definition}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-xl"
                >
                  {ctaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href={secondaryCtaHref}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg"
                >
                  {secondaryCtaText}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                    <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Platform Context Banner - Learning-to-Execution Loop */}
      <section className="py-8 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-200 text-lg">
            <span className="text-white font-semibold">Part of SmartPromptIQ</span> — {BRAND.definition.split('.')[0]}.
          </p>
          <p className="text-indigo-300 text-sm mt-2">
            Learn how AI works, then immediately apply that knowledge to build real solutions — all inside one platform.
          </p>
        </div>
      </section>

      {/* What It's For Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              What is {title}?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {whatItsFor}
            </p>
          </div>

          {/* Who It's For */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {whoItsFor.map((audience, index) => (
              <Card key={index} className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${heroGradient} flex items-center justify-center flex-shrink-0`}>
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Perfect for:
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {audience}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How {title} Helps You
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Transform the way you work with AI-powered solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {howItHelps.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${heroGradient} flex items-center justify-center flex-shrink-0`}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links Section - SEO Juice */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore More Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover everything SmartPromptIQ has to offer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internalLinks.map((link, index) => (
              <Link key={index} href={link.href}>
                <a className="group block p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {link.label}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  {link.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {link.description}
                    </p>
                  )}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - "People Also Ask" Optimization */}
      {faqs && faqs.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Everything you need to know about {title}
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-white mb-3"
                    itemProp="name"
                  >
                    {faq.question}
                  </h3>
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p
                      className="text-gray-600 dark:text-gray-300"
                      itemProp="text"
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className={`py-20 bg-gradient-to-br ${heroGradient}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started with {title}?
          </h2>
          <p className="text-xl text-white/90 mb-4">
            Join thousands of professionals already using SmartPromptIQ to transform their workflow.
          </p>
          <p className="text-lg text-white/70 mb-8 italic">
            Learn the skills, use the tools, build real solutions — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ctaHref}>
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-xl"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLandingLayout>
  );
};

export default SectionLanding;
