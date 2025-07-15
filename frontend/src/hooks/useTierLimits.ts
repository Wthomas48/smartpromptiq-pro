import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface TierLimits {
  dailyPrompts: number;
  monthlyPrompts: number;
  categories: string[] | "all";
  templates: number | "all";
  teamMembers: number | "unlimited";
  analytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    dailyPrompts: 3,
    monthlyPrompts: 10,
    categories: ["business-strategy", "marketing"], // Only 2 categories for free
    templates: 5,
    teamMembers: 0,
    analytics: false,
    apiAccess: false,
    prioritySupport: false
  },
  pro: {
    dailyPrompts: 100,
    monthlyPrompts: 1000,
    categories: "all",
    templates: "all",
    teamMembers: 5,
    analytics: true,
    apiAccess: false,
    prioritySupport: true
  },
  enterprise: {
    dailyPrompts: 1000,
    monthlyPrompts: 10000,
    categories: "all",
    templates: "all",
    teamMembers: "unlimited",
    analytics: true,
    apiAccess: true,
    prioritySupport: true
  }
};

const ALL_CATEGORIES = [
  "business-strategy",
  "marketing", 
  "product-development",
  "financial-planning",
  "education",
  "personal-development"
];

export function useTierLimits() {
  const { isAuthenticated } = useAuth();

  // Fetch current subscription
  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated
  });

  // Fetch usage stats
  const { data: usageStats } = useQuery({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated
  });

  const currentTier = subscription?.subscriptionTier || "free";
  const limits = TIER_LIMITS[currentTier];

  // Helper functions to check permissions
  const canAccessCategory = (categoryId: string): boolean => {
    if (!isAuthenticated) return false;
    if (limits.categories === "all") return true;
    return Array.isArray(limits.categories) && limits.categories.includes(categoryId);
  };

  const canCreatePrompt = (): boolean => {
    if (!isAuthenticated) return false;
    if (!usageStats?.daily) return true; // Allow if no usage data yet
    return usageStats.daily.remaining > 0;
  };

  const canAccessAnalytics = (): boolean => {
    return isAuthenticated && limits.analytics;
  };

  const canAccessTeams = (): boolean => {
    return isAuthenticated && limits.teamMembers > 0;
  };

  const canAccessAPI = (): boolean => {
    return isAuthenticated && limits.apiAccess;
  };

  const getAvailableCategories = () => {
    if (!isAuthenticated) return [];
    if (limits.categories === "all") return ALL_CATEGORIES;
    return Array.isArray(limits.categories) ? limits.categories : [];
  };

  const getRestrictedCategories = () => {
    if (!isAuthenticated || limits.categories === "all") return [];
    const available = Array.isArray(limits.categories) ? limits.categories : [];
    return ALL_CATEGORIES.filter(cat => !available.includes(cat));
  };

  const getUpgradeReason = (feature: string): string => {
    const tierNames = { free: "Free", pro: "Pro", enterprise: "Enterprise" };
    
    switch (feature) {
      case "category":
        return `Access to all categories requires ${currentTier === "free" ? "Pro" : "Enterprise"} plan`;
      case "analytics":
        return "Analytics dashboard requires Pro or Enterprise plan";
      case "teams":
        return "Team collaboration requires Pro or Enterprise plan";
      case "api":
        return "API access requires Enterprise plan";
      case "prompts":
        return `You've reached your daily limit. Upgrade to ${currentTier === "free" ? "Pro" : "Enterprise"} for more prompts`;
      default:
        return "This feature requires a paid plan";
    }
  };

  return {
    currentTier,
    limits,
    usageStats,
    subscription,
    // Permission checkers
    canAccessCategory,
    canCreatePrompt,
    canAccessAnalytics,
    canAccessTeams,
    canAccessAPI,
    // Category helpers
    getAvailableCategories,
    getRestrictedCategories,
    // Utility
    getUpgradeReason,
    isAuthenticated
  };
}