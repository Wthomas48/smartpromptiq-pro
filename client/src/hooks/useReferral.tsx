import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralCode {
  code: string;
  link: string;
  referrerRewardTokens: number;
  refereeRewardTokens: number;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  isActive: boolean;
}

interface ReferralStats {
  hasReferralCode: boolean;
  code?: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  recentReferrals: Array<{
    id: string;
    status: string;
    tokensAwarded: number;
    signedUpAt: string;
    convertedAt?: string;
  }>;
  recentRewards: Array<{
    id: string;
    type: string;
    tokens: number;
    description?: string;
    createdAt: string;
  }>;
  milestones: {
    current?: { count: number; bonus: number; name: string };
    next?: { count: number; bonus: number; name: string };
    progress: number;
  };
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  referrals: number;
  earnings: number;
}

interface UseReferralReturn {
  referralCode: ReferralCode | null;
  stats: ReferralStats | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  fetchReferralCode: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  customizeCode: (newCode: string) => Promise<boolean>;
  copyReferralLink: () => Promise<boolean>;
  shareOnTwitter: () => void;
  shareOnLinkedIn: () => void;
  shareByEmail: () => void;
}

export function useReferral(): UseReferralReturn {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const fetchReferralCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/api/referral/my-code');
      if (response.success) {
        setReferralCode(response.data);
      } else {
        // Don't set error for auth issues - user just isn't logged in
        if (!response.message?.includes('401') && !response.message?.includes('Unauthorized')) {
          setError('Failed to fetch referral code');
        }
      }
    } catch (err: any) {
      // Silently handle 401 errors - user isn't logged in
      if (!err.message?.includes('401') && !err.message?.includes('Unauthorized')) {
        setError(err.message || 'Failed to fetch referral code');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/api/referral/stats');
      if (response.success) {
        setStats(response.data);
      } else {
        // Don't set error for auth issues - user just isn't logged in
        if (!response.message?.includes('401') && !response.message?.includes('Unauthorized')) {
          setError('Failed to fetch referral stats');
        }
      }
    } catch (err: any) {
      // Silently handle 401 errors - user isn't logged in
      if (!err.message?.includes('401') && !err.message?.includes('Unauthorized')) {
        setError(err.message || 'Failed to fetch referral stats');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await apiRequest('GET', '/api/referral/leaderboard');
      if (response.success && Array.isArray(response.data)) {
        setLeaderboard(response.data);
      } else {
        // Return empty leaderboard if response is invalid
        setLeaderboard([]);
      }
    } catch (err: any) {
      // Silently handle errors - just set empty leaderboard
      console.log('Leaderboard not available:', err.message);
      setLeaderboard([]);
    }
  }, []);

  const customizeCode = useCallback(async (newCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/api/referral/customize-code', { newCode });
      if (response.success) {
        setReferralCode(prev => prev ? { ...prev, ...response.data } : null);
        return true;
      } else {
        setError(response.error || 'Failed to customize code');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to customize code');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyReferralLink = useCallback(async (): Promise<boolean> => {
    if (!referralCode?.link) return false;
    try {
      await navigator.clipboard.writeText(referralCode.link);
      return true;
    } catch (err) {
      console.error('Failed to copy link:', err);
      return false;
    }
  }, [referralCode]);

  const shareOnTwitter = useCallback(() => {
    if (!referralCode?.link) return;
    const text = encodeURIComponent(
      `I'm using SmartPromptIQ to supercharge my AI prompts! Join me and get ${referralCode.refereeRewardTokens} free tokens:`
    );
    const url = encodeURIComponent(referralCode.link);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }, [referralCode]);

  const shareOnLinkedIn = useCallback(() => {
    if (!referralCode?.link) return;
    const url = encodeURIComponent(referralCode.link);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }, [referralCode]);

  const shareByEmail = useCallback(() => {
    if (!referralCode?.link) return;
    const subject = encodeURIComponent('Join me on SmartPromptIQ!');
    const body = encodeURIComponent(
      `Hey!\n\nI've been using SmartPromptIQ to create amazing AI prompts and I think you'd love it too.\n\nSign up with my referral link and get ${referralCode.refereeRewardTokens} free tokens:\n${referralCode.link}\n\nLet me know what you think!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [referralCode]);

  // Load initial data - only if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchReferralCode();
      fetchStats();
    }
    // Leaderboard is public, can always fetch
    fetchLeaderboard();
  }, [isAuthenticated, fetchReferralCode, fetchStats, fetchLeaderboard]);

  return {
    referralCode,
    stats,
    leaderboard,
    isLoading,
    isAuthenticated,
    error,
    fetchReferralCode,
    fetchStats,
    fetchLeaderboard,
    customizeCode,
    copyReferralLink,
    shareOnTwitter,
    shareOnLinkedIn,
    shareByEmail,
  };
}

// Utility function to validate referral code during signup
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  bonusTokens?: number;
  referrerName?: string;
  message?: string;
}> {
  try {
    const response = await apiRequest('POST', '/api/referral/validate', { code });
    if (response.success && response.valid) {
      return {
        valid: true,
        bonusTokens: response.data.bonusTokens,
        referrerName: response.data.referrerName,
        message: response.data.message,
      };
    }
    return { valid: false, message: response.message };
  } catch (err) {
    return { valid: false, message: 'Failed to validate referral code' };
  }
}

// Utility function to track referral on signup
export async function trackReferralSignup(
  referralCode: string,
  newUserId: string,
  source?: string
): Promise<boolean> {
  try {
    const response = await apiRequest('POST', '/api/referral/track-signup', {
      referralCode,
      newUserId,
      source,
    });
    return response.success;
  } catch (err) {
    console.error('Failed to track referral signup:', err);
    return false;
  }
}

export default useReferral;
