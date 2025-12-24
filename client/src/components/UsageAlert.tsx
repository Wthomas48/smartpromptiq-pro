import React from 'react';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Sparkles, X } from 'lucide-react';

interface UsageAlertProps {
  usagePercent: number;
  currentUsage: number;
  limit: number;
  resourceType: 'prompts' | 'playground' | 'courses' | 'api';
  currentTier: string;
  onDismiss?: () => void;
}

export default function UsageAlert({
  usagePercent,
  currentUsage,
  limit,
  resourceType,
  currentTier,
  onDismiss
}: UsageAlertProps) {
  const [, setLocation] = useLocation();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Only show if usage is > 75%
  if (usagePercent < 75 || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  const getUpgradeMessage = () => {
    // FREE TIER UPGRADES
    if (currentTier === 'free') {
      if (resourceType === 'courses' && usagePercent >= 75) {
        return {
          icon: '📚',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: `You've completed ${currentUsage} of ${limit} free courses`,
          description: 'Unlock all 57 courses, earn certificates, and get 50 playground tests per month',
          cta: 'Upgrade to Academy+ ($29/mo)',
          tier: 'academy_plus',
          savings: 'Perfect for learners who want full education',
          features: ['All 57 courses', 'Earn certificates', '50 playground tests/mo']
        };
      }

      if (resourceType === 'playground' && usagePercent >= 75) {
        return {
          icon: '🎯',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: `You've used ${currentUsage} of ${limit} playground tests`,
          description: 'Upgrade to practice more and test your prompts without limits',
          cta: 'Upgrade to Starter ($19/mo)',
          tier: 'starter',
          savings: '25 tests/month + creative tools',
          features: ['25 playground tests/mo', '50 prompts/mo', 'HD video export']
        };
      }

      if (resourceType === 'prompts' && usagePercent >= 75) {
        return {
          icon: '⚡',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: `You've used ${currentUsage} of ${limit} free prompts`,
          description: 'Upgrade to Starter for 50 AI prompts per month + creative tools',
          cta: 'Upgrade to Starter ($19/mo)',
          tier: 'starter',
          savings: 'Entry-level creative tools',
          features: ['50 AI prompts/mo', '50 voice generations', '10 music tracks']
        };
      }
    }

    // STARTER → ACADEMY+ or PRO UPGRADES
    if (currentTier === 'starter') {
      if (resourceType === 'courses' && usagePercent >= 75) {
        return {
          icon: '📚',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: 'Want full Academy access?',
          description: 'Upgrade to Academy+ for all 57 courses with certificates',
          cta: 'Upgrade to Academy+ ($29/mo)',
          tier: 'academy_plus',
          savings: 'Only $10 more per month',
          features: ['All 57 courses', 'Certificates', '100 prompts/mo']
        };
      }

      if (resourceType === 'prompts' && usagePercent >= 75) {
        return {
          icon: '🚀',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: `You've used ${currentUsage} of ${limit} prompts this month`,
          description: 'Upgrade to Pro for 200 AI prompts + commercial license',
          cta: 'Upgrade to Pro ($49/mo)',
          tier: 'pro',
          savings: '4x more prompts + commercial license',
          features: ['200 AI prompts/mo', 'Commercial license', 'Priority support']
        };
      }
    }

    // ACADEMY+ → PRO UPGRADES
    if (currentTier === 'academy' || currentTier === 'academy_plus') {
      if (resourceType === 'playground' && usagePercent >= 75) {
        return {
          icon: '🚀',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: `You've used ${currentUsage} of ${limit} playground tests`,
          description: 'Loving the practice? Upgrade to Pro for 200 tests + AI generation tools',
          cta: 'Upgrade to Pro ($49/mo)',
          tier: 'pro',
          savings: 'Only $20 more per month',
          features: ['200 playground tests', '200 AI prompts/mo', 'Commercial license']
        };
      }

      return {
        icon: '✨',
        severity: 'info',
        title: 'Ready to build with Pro tools?',
        description: 'You\'ve mastered the courses. Now generate production-ready AI prompts.',
        cta: 'Upgrade to Pro ($49/mo)',
        tier: 'pro',
        savings: '+$20/mo for full execution tools',
        features: ['Keep all Academy features', '200 AI prompts/mo', 'Commercial license']
      };
    }

    // PRO → TEAM PRO UPGRADES
    if (currentTier === 'pro') {
      if (resourceType === 'prompts' && usagePercent >= 75) {
        return {
          icon: '👥',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: `You've used ${currentUsage} of ${limit} prompts this month`,
          description: 'Heavy user? Team Pro gives you 5x more prompts + team collaboration',
          cta: 'Upgrade to Team Pro ($99/mo)',
          tier: 'team_pro',
          savings: 'Perfect for teams of 2-5',
          features: ['1,000 prompts/mo', '2-5 team seats', '4K video export']
        };
      }

      if (resourceType === 'api' && usagePercent >= 75) {
        return {
          icon: '🔌',
          severity: usagePercent >= 90 ? 'urgent' : 'warning',
          title: 'Need more API access?',
          description: 'Team Pro includes 1,000 API calls per month + team features',
          cta: 'Upgrade to Team Pro ($99/mo)',
          tier: 'team_pro',
          savings: 'API + collaboration + 5x prompts',
          features: ['1,000 API calls/mo', '1,000 prompts/mo', 'Team workspace']
        };
      }
    }

    // TEAM PRO → ENTERPRISE
    if (currentTier === 'team' || currentTier === 'team_pro') {
      if (usagePercent >= 80) {
        return {
          icon: '🏢',
          severity: 'info',
          title: 'Growing fast? Consider Enterprise',
          description: 'Unlimited team members, 5,000+ prompts, custom branding, dedicated support',
          cta: 'Contact Sales ($299/mo)',
          tier: 'enterprise',
          savings: 'Unlimited everything',
          features: ['Unlimited users', '5,000+ prompts', 'Dedicated manager']
        };
      }
    }

    return null;
  };

  const message = getUpgradeMessage();
  if (!message) return null;

  const getSeverityStyles = () => {
    switch (message.severity) {
      case 'urgent':
        return {
          border: 'border-red-300',
          bg: 'bg-red-50',
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          badge: 'bg-red-100 text-red-700'
        };
      case 'warning':
        return {
          border: 'border-orange-300',
          bg: 'bg-orange-50',
          icon: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700',
          badge: 'bg-orange-100 text-orange-700'
        };
      case 'info':
        return {
          border: 'border-blue-300',
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          badge: 'bg-blue-100 text-blue-700'
        };
      default:
        return {
          border: 'border-purple-300',
          bg: 'bg-purple-50',
          icon: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700',
          badge: 'bg-purple-100 text-purple-700'
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <Alert className={`mb-6 ${styles.border} ${styles.bg} border-2 relative`}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <AlertCircle className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{message.icon}</span>
            <h4 className="font-bold text-gray-900">{message.title}</h4>
            {usagePercent >= 90 && (
              <Badge className={styles.badge}>
                {Math.round(usagePercent)}% used
              </Badge>
            )}
          </div>

          <p className="text-gray-700 mb-3">
            {message.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-3">
            {message.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="bg-white/50">
                ✓ {feature}
              </Badge>
            ))}
          </div>

          {/* Savings */}
          <p className="text-sm text-gray-600 mb-4">
            💡 <strong>{message.savings}</strong>
          </p>

          {/* CTA Button */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                if (message.tier === 'enterprise') {
                  setLocation('/contact');
                } else {
                  setLocation(`/pricing?recommended=${message.tier}`);
                }
              }}
              className={`${styles.button} text-white shadow-md`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {message.cta}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="bg-white"
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}

// Usage example in a component:
// <UsageAlert
//   usagePercent={85}
//   currentUsage={170}
//   limit={200}
//   resourceType="prompts"
//   currentTier="pro"
//   onDismiss={() => console.log('Alert dismissed')}
// />
