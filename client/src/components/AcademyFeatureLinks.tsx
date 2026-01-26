import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Layers, Hammer, Bot, Volume2, Store,
  Sparkles, ArrowRight, ChevronRight
} from 'lucide-react';

interface FeatureLinkProps {
  compact?: boolean;
  showTitle?: boolean;
}

/**
 * AcademyFeatureLinks - Links Academy content to platform features
 * This tells Google: "Academy is the core knowledge center of the platform"
 */
const AcademyFeatureLinks: React.FC<FeatureLinkProps> = ({
  compact = false,
  showTitle = true
}) => {
  const features = [
    {
      icon: Sparkles,
      label: 'Create Prompt',
      href: '/questionnaire',
      description: 'Build custom AI prompts with our guided creator',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Layers,
      label: 'Templates',
      href: '/templates',
      description: 'Browse 100+ ready-to-use prompt templates',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Hammer,
      label: 'BuilderIQ',
      href: '/builderiq',
      description: 'Transform ideas into app blueprints',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Bot,
      label: 'AI Agents',
      href: '/agents',
      description: 'Create custom chatbots for your website',
      color: 'from-violet-500 to-indigo-500'
    },
    {
      icon: Volume2,
      label: 'Voice AI',
      href: '/voice',
      description: 'Generate professional AI voiceovers',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Store,
      label: 'Marketplace',
      href: '/marketplace',
      description: 'Buy and sell professional prompts',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700"
            >
              <feature.icon className="w-3 h-3 mr-1 text-indigo-600 dark:text-indigo-400" />
              {feature.label}
            </Badge>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Apply What You've Learned
          </h3>
        </div>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Put your knowledge into practice with SmartPromptIQ's powerful tools:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="group cursor-pointer hover:shadow-md transition-all border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm flex items-center">
                      {feature.label}
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AcademyFeatureLinks;

/**
 * LessonFeatureCallout - Contextual feature link for specific lesson content
 */
export const LessonFeatureCallout: React.FC<{
  feature: 'templates' | 'builderiq' | 'agents' | 'voice' | 'marketplace' | 'create';
  context?: string;
}> = ({ feature, context }) => {
  const featureConfig = {
    create: {
      icon: Sparkles,
      href: '/questionnaire',
      title: 'Try It: Create Your Own Prompt',
      description: context || 'Apply this lesson by creating your own custom prompt',
      cta: 'Create Prompt',
      color: 'from-yellow-500 to-orange-500'
    },
    templates: {
      icon: Layers,
      href: '/templates',
      title: 'Explore: Prompt Templates',
      description: context || 'See professional examples of this concept in action',
      cta: 'View Templates',
      color: 'from-indigo-500 to-purple-500'
    },
    builderiq: {
      icon: Hammer,
      href: '/builderiq',
      title: 'Build: App Blueprints',
      description: context || 'Use AI to create complete app specifications',
      cta: 'Open BuilderIQ',
      color: 'from-purple-500 to-pink-500'
    },
    agents: {
      icon: Bot,
      href: '/agents',
      title: 'Create: AI Chatbot',
      description: context || 'Build a custom AI agent using these techniques',
      cta: 'Create Agent',
      color: 'from-violet-500 to-indigo-500'
    },
    voice: {
      icon: Volume2,
      href: '/voice',
      title: 'Generate: AI Voiceover',
      description: context || 'Turn your prompt output into professional audio',
      cta: 'Voice Studio',
      color: 'from-orange-500 to-red-500'
    },
    marketplace: {
      icon: Store,
      href: '/marketplace',
      title: 'Discover: Pro Prompts',
      description: context || 'Find battle-tested prompts from experts',
      cta: 'Browse Marketplace',
      color: 'from-green-500 to-emerald-500'
    }
  };

  const config = featureConfig[feature];

  return (
    <Link href={config.href}>
      <div className={`group my-6 p-4 rounded-xl bg-gradient-to-r ${config.color} bg-opacity-10 border border-current/20 cursor-pointer hover:shadow-lg transition-all`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
            <config.icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {config.description}
            </p>
          </div>
          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {config.cta}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};
