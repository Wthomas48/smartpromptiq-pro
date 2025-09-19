import { useState, useCallback } from 'react';
import { getTierById, isFeatureAvailable, PRICING_TIERS } from '@/../../shared/pricing/config';

interface FeatureAccessConfig {
  featureName: string;
  featureDescription?: string;
  requiredTier: string;
  onUpgradeClick?: () => void;
}

interface FeatureCheckResult {
  hasAccess: boolean;
  showUpgradePrompt: () => void;
  UpgradePromptComponent: React.ComponentType;
}

export const useFeatureAccess = (currentUserTier: string = 'free'): {
  checkFeatureAccess: (config: FeatureAccessConfig) => FeatureCheckResult;
  isUpgradePromptOpen: boolean;
  closeUpgradePrompt: () => void;
} => {
  const [upgradePromptState, setUpgradePromptState] = useState<{
    isOpen: boolean;
    config: FeatureAccessConfig | null;
  }>({
    isOpen: false,
    config: null
  });

  const checkFeatureAccess = useCallback((config: FeatureAccessConfig): FeatureCheckResult => {
    const currentTier = getTierById(currentUserTier);
    const requiredTier = getTierById(config.requiredTier);

    if (!currentTier || !requiredTier) {
      return {
        hasAccess: false,
        showUpgradePrompt: () => {},
        UpgradePromptComponent: () => null
      };
    }

    // Check if current tier meets or exceeds required tier
    const currentTierIndex = PRICING_TIERS.findIndex(t => t.id === currentUserTier);
    const requiredTierIndex = PRICING_TIERS.findIndex(t => t.id === config.requiredTier);

    const hasAccess = currentTierIndex >= requiredTierIndex;

    const showUpgradePrompt = () => {
      if (!hasAccess) {
        setUpgradePromptState({
          isOpen: true,
          config
        });
      }
    };

    const UpgradePromptComponent = () => {
      if (!upgradePromptState.isOpen || !upgradePromptState.config) return null;

      // Dynamically import to avoid circular dependencies
      const UpgradePrompt = require('@/components/UpgradePrompt').default;

      return (
        <UpgradePrompt
          isOpen={upgradePromptState.isOpen}
          onClose={() => setUpgradePromptState({ isOpen: false, config: null })}
          currentTier={currentUserTier}
          requiredTier={upgradePromptState.config.requiredTier}
          featureName={upgradePromptState.config.featureName}
          featureDescription={upgradePromptState.config.featureDescription}
        />
      );
    };

    return {
      hasAccess,
      showUpgradePrompt,
      UpgradePromptComponent
    };
  }, [currentUserTier, upgradePromptState]);

  const closeUpgradePrompt = useCallback(() => {
    setUpgradePromptState({ isOpen: false, config: null });
  }, []);

  return {
    checkFeatureAccess,
    isUpgradePromptOpen: upgradePromptState.isOpen,
    closeUpgradePrompt
  };
};

// Hook for checking specific tier limits
export const useTierLimits = (currentUserTier: string = 'free') => {
  const currentTier = getTierById(currentUserTier);

  const checkUsageLimit = (
    featureKey: keyof typeof currentTier.limits,
    currentUsage: number,
    actionName: string = 'use this feature'
  ) => {
    if (!currentTier) return { canUse: false, isNearLimit: false, usage: 0 };

    const limit = currentTier.limits[featureKey];

    // Handle unlimited cases
    if (limit === 'unlimited' || limit === -1) {
      return { canUse: true, isNearLimit: false, usage: 0 };
    }

    if (typeof limit !== 'number') {
      return { canUse: false, isNearLimit: false, usage: 0 };
    }

    const canUse = currentUsage < limit;
    const usagePercentage = (currentUsage / limit) * 100;
    const isNearLimit = usagePercentage >= 80; // 80% or higher

    return {
      canUse,
      isNearLimit,
      usage: usagePercentage,
      limit,
      currentUsage
    };
  };

  return {
    currentTier,
    checkUsageLimit,
    limits: currentTier?.limits || null
  };
};

// Helper function for creating restricted feature components
export const createRestrictedFeature = (
  WrappedComponent: React.ComponentType<any>,
  featureConfig: FeatureAccessConfig
) => {
  return (props: any) => {
    // This would need to get user tier from context/props
    const userTier = props.userTier || 'free';
    const { checkFeatureAccess } = useFeatureAccess(userTier);
    const { hasAccess, showUpgradePrompt, UpgradePromptComponent } = checkFeatureAccess(featureConfig);

    const handleRestrictedClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showUpgradePrompt();
    };

    if (!hasAccess) {
      return (
        <>
          <div
            className="relative cursor-pointer"
            onClick={handleRestrictedClick}
          >
            <div className="relative">
              <WrappedComponent {...props} disabled={true} />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-transparent rounded-lg flex items-center justify-end pr-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <span>🔒 {featureConfig.requiredTier.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
          <UpgradePromptComponent />
        </>
      );
    }

    return <WrappedComponent {...props} />;
  };
};