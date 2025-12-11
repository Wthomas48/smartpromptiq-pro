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

  // Load rating configuration (with optimized caching)
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
    staleTime: 30 * 60 * 1000, // ✅ Increased to 30 minutes (config rarely changes)
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false, // ✅ Don't refetch on window focus
    refetchOnMount: false, // ✅ Use cached data on mount
  });

  // Load user rating history (with optimized caching)
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
    staleTime: 30 * 60 * 1000, // ✅ Increased to 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false, // ✅ Don't refetch on window focus
    refetchOnMount: false, // ✅ Use cached data on mount
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
    setFeaturesUsed(prev => {
      const newSet = new Set([...prev, feature]);

      // Auto-trigger rating if threshold met (using prev state, not stale closure)
      if (newSet.size >= config.featureUsageCount && !prev.has(feature)) {
        const trigger: RatingTrigger = {
          type: 'feature_use',
          context: {
            feature,
            category,
            totalFeatures: newSet.size,
            featuresUsed: Array.from(newSet)
          },
          feature,
          category,
          priority: 'medium'
        };

        // Delay showing to avoid interrupting user flow
        setTimeout(() => showRating(trigger), 1000);
      }

      return newSet;
    });
  }, [config.featureUsageCount, showRating]); // ✅ Removed featuresUsed from deps

  // Track milestone achievements
  const trackMilestone = useCallback((event: string) => {
    if (!config.milestoneEvents.includes(event)) return;

    setMilestonesReached(prev => {
      // Check if already reached (prevent duplicate)
      if (prev.has(event)) return prev;

      const newSet = new Set([...prev, event]);

      const trigger: RatingTrigger = {
        type: 'milestone',
        context: {
          milestone: event,
          totalMilestones: newSet.size,
          milestonesReached: Array.from(newSet)
        },
        category: 'achievement',
        priority: 'high'
      };

      // Show immediately for milestones
      showRating(trigger);

      return newSet;
    });
  }, [config.milestoneEvents, showRating]); // ✅ Removed milestonesReached from deps

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

  // Auto-trigger session end rating (optimized - disabled by default to prevent performance issues)
  useEffect(() => {
    // Only enable if explicitly needed - this can cause freezes on page unload
    if (!config.enabled || !ratingEnabled) return;

    const handleBeforeUnload = () => {
      // Quick check - avoid heavy operations during unload
      const sessionMinutes = (Date.now() - sessionStartTime) / (1000 * 60);
      if (sessionMinutes < config.sessionMinutes) return;

      try {
        const trigger: RatingTrigger = {
          type: 'session_end',
          context: {
            sessionDuration: Date.now() - sessionStartTime,
            featuresUsedCount: featuresUsed.size, // Just count, not full array
            milestonesCount: milestonesReached.size // Just count, not full array
          },
          category: 'session',
          priority: 'low'
        };

        // Store in localStorage to show on next visit (async-safe)
        localStorage.setItem('pendingRating', JSON.stringify(trigger));
      } catch (error) {
        // Silently fail - don't block page unload
        console.warn('Failed to save pending rating:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [config.enabled, config.sessionMinutes, ratingEnabled, sessionStartTime, featuresUsed.size, milestonesReached.size]);

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