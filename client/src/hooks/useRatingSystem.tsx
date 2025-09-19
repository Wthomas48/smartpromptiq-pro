import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RatingTrigger {
  type: 'feature_use' | 'session_end' | 'error_recovery' | 'milestone' | 'manual';
  context: any;
  feature?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
}

interface RatingConfig {
  enabled: boolean;
  sessionMinutes: number;
  featureUsageCount: number;
  errorRecoveryDelay: number;
  milestoneEvents: string[];
  cooldownHours: number;
  maxDailyPopups: number;
}

interface RatingSystemHook {
  isRatingOpen: boolean;
  currentTrigger: RatingTrigger | null;
  showRating: (trigger: RatingTrigger) => void;
  hideRating: () => void;
  canShowRating: (triggerType: RatingTrigger['type']) => boolean;
  trackFeatureUsage: (feature: string, category?: string) => void;
  trackMilestone: (event: string) => void;
  trackErrorRecovery: (error: string, resolution: string) => void;
}

// Default configuration
const defaultConfig: RatingConfig = {
  enabled: true,
  sessionMinutes: 10, // Show after 10 minutes of usage
  featureUsageCount: 3, // Show after using 3 different features
  errorRecoveryDelay: 2000, // Wait 2 seconds after error recovery
  milestoneEvents: [
    'first_prompt_generated',
    'first_template_saved',
    'first_collaboration',
    'profile_completed',
    'subscription_upgraded'
  ],
  cooldownHours: 24, // Don't show again for 24 hours after rating
  maxDailyPopups: 2 // Maximum 2 rating popups per day
};

export function useRatingSystem(): RatingSystemHook {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<RatingTrigger | null>(null);
  const [sessionStartTime] = useState(Date.now());
  const [featuresUsed, setFeaturesUsed] = useState<Set<string>>(new Set());
  const [milestonesReached, setMilestonesReached] = useState<Set<string>>(new Set());

  // Check if rating is enabled via environment variable
  const ratingEnabled = import.meta.env.VITE_RATING_ENABLED === "true";

  // Load rating configuration
  const { data: config = defaultConfig } = useQuery<RatingConfig>({
    queryKey: ["/api/rating/config"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/rating/config");
        return await response.json();
      } catch {
        return defaultConfig; // Fallback to default if API fails
      }
    },
    enabled: ratingEnabled, // Only fetch if rating is enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Load user rating history
  const { data: ratingHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/rating/history"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/rating/history");
        return await response.json();
      } catch {
        return []; // Fallback to empty array
      }
    },
    enabled: ratingEnabled, // Only fetch if rating is enabled
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Check if we can show rating based on cooldown and daily limits
  const canShowRating = useCallback((triggerType: RatingTrigger['type']): boolean => {
    if (!config.enabled) return false;

    const now = Date.now();
    const today = new Date().toDateString();

    // Check daily popup limit
    const todaysRatings = ratingHistory.filter(rating =>
      new Date(rating.timestamp).toDateString() === today
    );
    if (todaysRatings.length >= config.maxDailyPopups) return false;

    // Check cooldown period
    const lastRating = ratingHistory[0];
    if (lastRating) {
      const hoursSinceLastRating = (now - new Date(lastRating.timestamp).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastRating < config.cooldownHours) return false;
    }

    // Special rules based on trigger type
    switch (triggerType) {
      case 'session_end':
        const sessionMinutes = (now - sessionStartTime) / (1000 * 60);
        return sessionMinutes >= config.sessionMinutes;

      case 'feature_use':
        return featuresUsed.size >= config.featureUsageCount;

      case 'milestone':
        return true; // Always allow milestone triggers (but still respect cooldown)

      case 'error_recovery':
        return true; // Always allow error recovery feedback

      case 'manual':
        return true; // Always allow manual triggers

      default:
        return true;
    }
  }, [config, ratingHistory, sessionStartTime, featuresUsed.size]);

  // Show rating popup
  const showRating = useCallback((trigger: RatingTrigger) => {
    if (!canShowRating(trigger.type)) return;

    setCurrentTrigger(trigger);
    setIsRatingOpen(true);
  }, [canShowRating]);

  // Hide rating popup
  const hideRating = useCallback(() => {
    setIsRatingOpen(false);
    setCurrentTrigger(null);
  }, []);

  // Track feature usage
  const trackFeatureUsage = useCallback((feature: string, category?: string) => {
    setFeaturesUsed(prev => new Set([...prev, feature]));

    // Auto-trigger rating if threshold met
    if (featuresUsed.size + 1 >= config.featureUsageCount) {
      const trigger: RatingTrigger = {
        type: 'feature_use',
        context: {
          feature,
          category,
          totalFeatures: featuresUsed.size + 1,
          featuresUsed: Array.from(featuresUsed)
        },
        feature,
        category,
        priority: 'medium'
      };

      // Delay showing to avoid interrupting user flow
      setTimeout(() => showRating(trigger), 1000);
    }
  }, [featuresUsed, config.featureUsageCount, showRating]);

  // Track milestone achievements
  const trackMilestone = useCallback((event: string) => {
    if (!config.milestoneEvents.includes(event)) return;
    if (milestonesReached.has(event)) return;

    setMilestonesReached(prev => new Set([...prev, event]));

    const trigger: RatingTrigger = {
      type: 'milestone',
      context: {
        milestone: event,
        totalMilestones: milestonesReached.size + 1,
        milestonesReached: Array.from(milestonesReached)
      },
      category: 'achievement',
      priority: 'high'
    };

    // Show immediately for milestones
    showRating(trigger);
  }, [config.milestoneEvents, milestonesReached, showRating]);

  // Track error recovery
  const trackErrorRecovery = useCallback((error: string, resolution: string) => {
    const trigger: RatingTrigger = {
      type: 'error_recovery',
      context: {
        error,
        resolution,
        recoveredAt: Date.now()
      },
      category: 'error_handling',
      priority: 'high'
    };

    // Delay showing to let user see the resolution
    setTimeout(() => showRating(trigger), config.errorRecoveryDelay);
  }, [config.errorRecoveryDelay, showRating]);

  // Auto-trigger session end rating
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (canShowRating('session_end')) {
        const trigger: RatingTrigger = {
          type: 'session_end',
          context: {
            sessionDuration: Date.now() - sessionStartTime,
            featuresUsed: Array.from(featuresUsed),
            milestonesReached: Array.from(milestonesReached)
          },
          category: 'session',
          priority: 'low'
        };

        // For session end, we store in localStorage to show on next visit
        // since we can't show popup during page unload
        localStorage.setItem('pendingRating', JSON.stringify(trigger));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [canShowRating, sessionStartTime, featuresUsed, milestonesReached]);

  // Check for pending rating on load
  useEffect(() => {
    const pendingRating = localStorage.getItem('pendingRating');
    if (pendingRating) {
      try {
        const trigger = JSON.parse(pendingRating);
        localStorage.removeItem('pendingRating');

        // Show after a brief delay to let the page load
        setTimeout(() => showRating(trigger), 2000);
      } catch (error) {
        console.warn('Failed to parse pending rating:', error);
        localStorage.removeItem('pendingRating');
      }
    }
  }, [showRating]);

  return {
    isRatingOpen,
    currentTrigger,
    showRating,
    hideRating,
    canShowRating,
    trackFeatureUsage,
    trackMilestone,
    trackErrorRecovery
  };
}