import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Lock, ArrowRight } from 'lucide-react';
import { getTierById } from '@/../../shared/pricing/config';

interface TierIndicatorProps {
  requiredTier: string;
  currentTier?: string;
  featureName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'button' | 'banner';
  onClick?: () => void;
  className?: string;
}

const TierIndicator: React.FC<TierIndicatorProps> = ({
  requiredTier,
  currentTier = 'free',
  featureName,
  size = 'md',
  variant = 'badge',
  onClick,
  className = ''
}) => {
  const requiredTierData = getTierById(requiredTier);
  const currentTierData = getTierById(currentTier);

  if (!requiredTierData) return null;

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'starter': return <Star className="w-4 h-4" />;
      case 'pro': return <Crown className="w-4 h-4" />;
      case 'business': return <Zap className="w-4 h-4" />;
      case 'enterprise': return <Crown className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'starter': return 'indigo';
      case 'pro': return 'purple';
      case 'business': return 'pink';
      case 'enterprise': return 'amber';
      default: return 'gray';
    }
  };

  const getTierGradient = (tierId: string) => {
    switch (tierId) {
      case 'starter': return 'from-indigo-500 to-purple-600';
      case 'pro': return 'from-purple-500 to-pink-600';
      case 'business': return 'from-pink-500 to-red-600';
      case 'enterprise': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const isUpgradeNeeded = () => {
    if (!currentTierData) return true;
    const tierOrder = ['free', 'starter', 'pro', 'business', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const requiredIndex = tierOrder.indexOf(requiredTier);
    return currentIndex < requiredIndex;
  };

  const needsUpgrade = isUpgradeNeeded();
  const color = getTierColor(requiredTier);
  const gradient = getTierGradient(requiredTier);

  if (variant === 'badge') {
    return (
      <Badge
        variant={needsUpgrade ? "secondary" : "default"}
        className={`
          ${needsUpgrade ? `bg-gradient-to-r ${gradient} text-white border-0` : 'bg-green-100 text-green-800 border-green-200'}
          ${size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1'}
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          ${className}
        `}
        onClick={onClick}
      >
        <div className="flex items-center space-x-1">
          {needsUpgrade ? <Lock className="w-3 h-3" /> : getTierIcon(requiredTier)}
          <span>{needsUpgrade ? `${requiredTierData.name} Required` : `${requiredTierData.name} Feature`}</span>
        </div>
      </Badge>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant={needsUpgrade ? "default" : "outline"}
        size={size}
        onClick={onClick}
        className={`
          ${needsUpgrade ? `bg-gradient-to-r ${gradient} hover:opacity-90 text-white border-0` : ''}
          ${className}
        `}
      >
        <div className="flex items-center space-x-2">
          {needsUpgrade ? <Lock className="w-4 h-4" /> : getTierIcon(requiredTier)}
          <span>
            {needsUpgrade
              ? `Upgrade to ${requiredTierData.name}`
              : `${requiredTierData.name} Feature`
            }
          </span>
          {needsUpgrade && <ArrowRight className="w-4 h-4" />}
        </div>
      </Button>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`
          ${needsUpgrade
            ? `bg-gradient-to-r ${gradient} text-white`
            : 'bg-green-50 text-green-800 border border-green-200'
          }
          p-3 rounded-lg ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
          ${className}
        `}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              ${needsUpgrade ? 'bg-white/20' : 'bg-green-100'}
              ${needsUpgrade ? 'text-white' : 'text-green-600'}
              w-8 h-8 rounded-full flex items-center justify-center
            `}>
              {needsUpgrade ? <Lock className="w-4 h-4" /> : getTierIcon(requiredTier)}
            </div>
            <div>
              <p className="font-medium">
                {needsUpgrade
                  ? `${featureName || 'This feature'} requires ${requiredTierData.name}`
                  : `${featureName || 'Feature'} available with ${requiredTierData.name}`
                }
              </p>
              <p className={`text-sm ${needsUpgrade ? 'text-white/80' : 'text-green-600'}`}>
                {needsUpgrade
                  ? `Upgrade to unlock ${featureName || 'this feature'} and more`
                  : `You have access to this ${requiredTierData.name} feature`
                }
              </p>
            </div>
          </div>
          {needsUpgrade && onClick && (
            <ArrowRight className="w-5 h-5 text-white/80" />
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default TierIndicator;