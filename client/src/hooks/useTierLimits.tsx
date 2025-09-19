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
    dailyPrompts: 2,
    monthlyPrompts: 5,
    categories: ["business-strategy", "marketing", "education"],
    templates: 5,
    teamMembers: 0,
    analytics: false,
    apiAccess: false,
    prioritySupport: false
  },
  starter: {
    dailyPrompts: 10,
    monthlyPrompts: 200,
    categories: "all",
    templates: 50,
    teamMembers: 1,
    analytics: true,
    apiAccess: false,
    prioritySupport: false
  },
  pro: {
    dailyPrompts: 35,
    monthlyPrompts: 1000,
    categories: "all",
    templates: "all",
    teamMembers: 5,
    analytics: true,
    apiAccess: true,
    prioritySupport: true
  },
  business: {
    dailyPrompts: 170,
    monthlyPrompts: 5000,
    categories: "all",
    templates: "all",
    teamMembers: 25,
    analytics: true,
    apiAccess: true,
    prioritySupport: true
  },
  enterprise: {
    dailyPrompts: -1, // Unlimited
    monthlyPrompts: -1, // Unlimited
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

  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated
  });

  const { data: usageStats } = useQuery({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated
  });

  const currentTier = subscription?.subscriptionTier || "free";
  const limits = TIER_LIMITS[currentTier];

  const canAccessCategory = (categoryId: string): boolean => {
    if (!isAuthenticated) return false;
    if (limits.categories === "all") return true;
    return Array.isArray(limits.categories) && limits.categories.includes(categoryId);
  };

  const canCreatePrompt = (): boolean => {
    if (!isAuthenticated) return false;
    if (!usageStats?.daily) return true;
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
    const tierNames = { free: "Free", starter: "Starter", pro: "Pro", business: "Business", enterprise: "Enterprise" };

    switch (feature) {
      case "category":
        return `Access to all categories requires ${currentTier === "free" ? "Starter" : "Pro"} plan`;
      case "analytics":
        return "Analytics dashboard requires Starter, Pro, Business or Enterprise plan";
      case "teams":
        return "Team collaboration requires Pro, Business or Enterprise plan";
      case "api":
        return "API access requires Pro, Business or Enterprise plan";
      case "prompts":
        return `You've reached your daily limit. Upgrade to ${currentTier === "free" ? "Starter" : currentTier === "starter" ? "Pro" : currentTier === "pro" ? "Business" : "Enterprise"} for more prompts`;
      default:
        return "This feature requires a paid plan";
    }
  };

  return {
    currentTier,
    limits,
    usageStats,
    subscription,
    canAccessCategory,
    canCreatePrompt,
    canAccessAnalytics,
    canAccessTeams,
    canAccessAPI,
    getAvailableCategories,
    getRestrictedCategories,
    getUpgradeReason,
    isAuthenticated
  };
}