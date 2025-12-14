/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - FEATURE GATE HOOK
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * React hook for checking feature access and showing upgrade prompts.
 * Uses the featureAccess configuration for tier-based feature gating.
 *
 * Usage:
 * const { canAccess, showUpgrade, UpgradeModal } = useFeatureGate('voiceDownloads');
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import {
  TIER_LIMITS,
  TIER_DISPLAY_NAMES,
  TIER_COLORS,
  TIER_PRICING,
  TierLimits,
  SubscriptionTier,
  normalizeTier,
  hasFeatureAccess,
  getFeatureLimit,
  getMinimumTierForFeature,
  getUpgradeFeatures,
  isUnlimited,
} from '@/config/featureAccess';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Sparkles, Lock, ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE DISPLAY NAMES
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURE_DISPLAY_NAMES: Partial<Record<keyof TierLimits, string>> = {
  voiceDownloads: 'Voice Downloads',
  audioDownloads: 'Audio Downloads',
  voiceGenerationsPerMonth: 'Voice Generation',
  elevenLabsVoices: 'Premium ElevenLabs Voices',
  premiumElevenLabsVoices: 'Ultra-Premium Voices',
  voiceCommercialUse: 'Commercial Voice Usage',
  introOutroAccess: 'Intro/Outro Builder',
  introOutroDownloads: 'Intro/Outro Downloads',
  premiumMusicLibrary: 'Premium Music Library',
  voiceMusicMixing: 'Voice + Music Mixing',
  musicTracksPerMonth: 'Music Generation',
  storyModeVoice: 'Story Mode Voice',
  blueprintsPerMonth: 'BuilderIQ Blueprints',
  appTemplates: 'App Templates',
  deploymentHub: 'Deployment Hub',
  codeExport: 'Code Export',
  advancedModels: 'GPT-4 & Claude Models',
  imageGenerationsPerMonth: 'Image Generation',
  dalle3Access: 'DALL-E 3 Access',
  dalleAccess: 'DALL-E Access',
  printIntegration: 'Print Integration',
  impossiblePrintPriority: 'Priority Printing',
  allCourses: 'All Academy Courses',
  certificates: 'Completion Certificates',
  earlyAccess: 'Early Access Features',
  pdfExport: 'PDF Export',
  jsonExport: 'JSON Export',
  videoExport: 'Video Export',
  removeBranding: 'Remove Branding',
  apiAccess: 'API Access',
  teamMembers: 'Team Members',
  teamWorkspace: 'Team Workspace',
  adminDashboard: 'Admin Dashboard',
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

interface UseFeatureGateResult {
  // Current user tier
  userTier: SubscriptionTier;
  tierName: string;

  // Access checks
  canAccess: boolean;
  limit: number | boolean | string;
  isUnlimited: boolean;
  requiredTier: SubscriptionTier;

  // Upgrade modal
  showUpgrade: () => void;
  hideUpgrade: () => void;
  isUpgradeOpen: boolean;
  UpgradeModal: React.FC;

  // Helper for checking against usage
  checkUsage: (currentUsage: number) => {
    canUse: boolean;
    remaining: number;
    percentUsed: number;
    isNearLimit: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useFeatureGate(featureKey: keyof TierLimits): UseFeatureGateResult {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Get normalized user tier
  const userTier = useMemo(() => {
    return normalizeTier(user?.subscriptionTier);
  }, [user?.subscriptionTier]);

  const tierName = TIER_DISPLAY_NAMES[userTier];

  // Check if user has access
  const canAccess = useMemo(() => {
    return hasFeatureAccess(user?.subscriptionTier, featureKey);
  }, [user?.subscriptionTier, featureKey]);

  // Get the limit value
  const limit = useMemo(() => {
    return getFeatureLimit(user?.subscriptionTier, featureKey);
  }, [user?.subscriptionTier, featureKey]);

  // Check if unlimited
  const unlimited = useMemo(() => {
    return typeof limit === 'number' && isUnlimited(limit);
  }, [limit]);

  // Get minimum required tier
  const requiredTier = useMemo(() => {
    return getMinimumTierForFeature(featureKey);
  }, [featureKey]);

  // Show/hide upgrade modal
  const showUpgrade = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=' + window.location.pathname);
      return;
    }
    setIsUpgradeOpen(true);
  }, [isAuthenticated, navigate]);

  const hideUpgrade = useCallback(() => {
    setIsUpgradeOpen(false);
  }, []);

  // Check usage against limit
  const checkUsage = useCallback((currentUsage: number) => {
    if (typeof limit !== 'number') {
      return { canUse: false, remaining: 0, percentUsed: 100, isNearLimit: true };
    }

    if (limit === -1) {
      return { canUse: true, remaining: Infinity, percentUsed: 0, isNearLimit: false };
    }

    const remaining = Math.max(0, limit - currentUsage);
    const percentUsed = Math.min(100, (currentUsage / limit) * 100);
    const isNearLimit = percentUsed >= 80;
    const canUse = currentUsage < limit;

    return { canUse, remaining, percentUsed, isNearLimit };
  }, [limit]);

  // Upgrade Modal Component
  const UpgradeModal: React.FC = useCallback(() => {
    const featureName = FEATURE_DISPLAY_NAMES[featureKey] || featureKey;
    const requiredTierName = TIER_DISPLAY_NAMES[requiredTier];
    const requiredTierColor = TIER_COLORS[requiredTier];
    const requiredTierPrice = TIER_PRICING[requiredTier];
    const upgradeFeatures = getUpgradeFeatures(userTier, requiredTier);

    return (
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${requiredTierColor} flex items-center justify-center`}>
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Upgrade to {requiredTierName}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              <span className="text-white font-medium">{featureName}</span> requires the{' '}
              <Badge className={`bg-gradient-to-r ${requiredTierColor} text-white border-0`}>
                {requiredTierName}
              </Badge>{' '}
              plan or higher
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current tier indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>Your plan:</span>
              <Badge variant="outline" className="border-gray-600">
                {tierName}
              </Badge>
              <ArrowRight className="w-4 h-4" />
              <Badge className={`bg-gradient-to-r ${requiredTierColor} text-white border-0`}>
                {requiredTierName}
              </Badge>
            </div>

            {/* Features unlocked */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Features you'll unlock
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {upgradeFeatures.slice(0, 6).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {upgradeFeatures.length > 6 && (
                  <li className="text-gray-500 text-xs">
                    + {upgradeFeatures.length - 6} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Pricing */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Starting at just{' '}
                <span className="text-amber-400 font-bold text-lg">
                  ${(requiredTierPrice.monthly / 100).toFixed(0)}/month
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Save {Math.round((1 - requiredTierPrice.yearly / (requiredTierPrice.monthly * 12)) * 100)}% with yearly billing
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={hideUpgrade}
              className="border-slate-600 text-gray-300 hover:bg-slate-800"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                hideUpgrade();
                navigate('/pricing');
              }}
              className={`bg-gradient-to-r ${requiredTierColor} hover:opacity-90 flex-1`}
            >
              <Crown className="w-4 h-4 mr-2" />
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [isUpgradeOpen, featureKey, userTier, requiredTier, tierName, hideUpgrade, navigate]);

  return {
    userTier,
    tierName,
    canAccess,
    limit,
    isUnlimited: unlimited,
    requiredTier,
    showUpgrade,
    hideUpgrade,
    isUpgradeOpen,
    UpgradeModal,
    checkUsage,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE HOOKS FOR COMMON FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

export function useVoiceDownloadGate() {
  return useFeatureGate('voiceDownloads');
}

export function useElevenLabsGate() {
  return useFeatureGate('elevenLabsVoices');
}

export function useIntroOutroGate() {
  return useFeatureGate('introOutroAccess');
}

export function useMusicLibraryGate() {
  return useFeatureGate('premiumMusicLibrary');
}

export function useStoryModeGate() {
  return useFeatureGate('storyModeVoice');
}

export function useBuilderIQGate() {
  return useFeatureGate('blueprintsPerMonth');
}

export function useAdvancedModelsGate() {
  return useFeatureGate('advancedModels');
}

export function useApiAccessGate() {
  return useFeatureGate('apiAccess');
}

export function useTeamGate() {
  return useFeatureGate('teamWorkspace');
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE GATE WRAPPER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface FeatureGateProps {
  feature: keyof TierLimits;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLock?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showLock = true,
}) => {
  const { canAccess, showUpgrade, UpgradeModal, requiredTier } = useFeatureGate(feature);

  if (canAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLock) {
    return (
      <>
        <div
          className="relative cursor-pointer group"
          onClick={showUpgrade}
        >
          <div className="relative opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-slate-900/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-full text-sm font-medium">
              <Lock className="w-4 h-4" />
              {TIER_DISPLAY_NAMES[requiredTier]} Required
            </div>
          </div>
        </div>
        <UpgradeModal />
      </>
    );
  }

  return null;
};

export default useFeatureGate;
