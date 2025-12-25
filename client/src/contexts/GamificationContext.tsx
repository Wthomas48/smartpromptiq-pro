import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'milestone' | 'skill' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// Level definitions
export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  perks: string[];
  color: string;
}

// Streak data
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakFreezes: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: number;
  rank: number;
}

// XP Transaction
export interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  category: string;
  timestamp: Date;
}

// Gamification state
interface GamificationState {
  xp: number;
  level: number;
  levelProgress: number;
  badges: Badge[];
  unlockedBadges: string[];
  streak: StreakData;
  recentXP: XPTransaction[];
  weeklyXP: number;
  monthlyXP: number;
  rank: number;
}

// Context type
interface GamificationContextType extends GamificationState {
  // Actions
  awardXP: (amount: number, reason: string, category?: string) => void;
  checkAndAwardBadge: (badgeId: string) => boolean;
  updateStreak: () => void;
  getLeaderboard: (type: 'daily' | 'weekly' | 'monthly' | 'allTime') => Promise<LeaderboardEntry[]>;
  getLevelInfo: (level: number) => Level;
  getNextLevelXP: () => number;
  // Computed
  currentLevel: Level;
  nextLevel: Level | null;
  xpToNextLevel: number;
  isLoading: boolean;
}

// Level definitions
const LEVELS: Level[] = [
  { level: 1, name: 'Novice', minXP: 0, maxXP: 100, perks: ['Access to basic features'], color: 'from-gray-400 to-gray-500' },
  { level: 2, name: 'Apprentice', minXP: 100, maxXP: 300, perks: ['Unlock 5 extra templates'], color: 'from-green-400 to-green-500' },
  { level: 3, name: 'Practitioner', minXP: 300, maxXP: 600, perks: ['Custom prompt saving'], color: 'from-blue-400 to-blue-500' },
  { level: 4, name: 'Specialist', minXP: 600, maxXP: 1000, perks: ['Priority support access'], color: 'from-purple-400 to-purple-500' },
  { level: 5, name: 'Expert', minXP: 1000, maxXP: 1500, perks: ['Early access to new features'], color: 'from-pink-400 to-pink-500' },
  { level: 6, name: 'Master', minXP: 1500, maxXP: 2200, perks: ['Exclusive badge', '10% token bonus'], color: 'from-orange-400 to-orange-500' },
  { level: 7, name: 'Grandmaster', minXP: 2200, maxXP: 3000, perks: ['Marketplace seller access'], color: 'from-red-400 to-red-500' },
  { level: 8, name: 'Sage', minXP: 3000, maxXP: 4000, perks: ['Featured creator status'], color: 'from-cyan-400 to-cyan-500' },
  { level: 9, name: 'Legend', minXP: 4000, maxXP: 5500, perks: ['Custom profile badge'], color: 'from-yellow-400 to-yellow-500' },
  { level: 10, name: 'Prompt God', minXP: 5500, maxXP: Infinity, perks: ['All perks unlocked', 'Exclusive community'], color: 'from-amber-400 via-yellow-500 to-orange-500' },
];

// Badge definitions
const ALL_BADGES: Badge[] = [
  // Achievement badges
  { id: 'first_prompt', name: 'First Steps', description: 'Generate your first prompt', icon: '🎯', category: 'achievement', rarity: 'common', xpReward: 50 },
  { id: 'prompt_10', name: 'Getting Started', description: 'Generate 10 prompts', icon: '📝', category: 'achievement', rarity: 'common', xpReward: 100 },
  { id: 'prompt_50', name: 'Prompt Enthusiast', description: 'Generate 50 prompts', icon: '✨', category: 'achievement', rarity: 'rare', xpReward: 250 },
  { id: 'prompt_100', name: 'Prompt Master', description: 'Generate 100 prompts', icon: '🏆', category: 'achievement', rarity: 'epic', xpReward: 500 },
  { id: 'prompt_500', name: 'Prompt Legend', description: 'Generate 500 prompts', icon: '👑', category: 'achievement', rarity: 'legendary', xpReward: 1000 },

  // Milestone badges
  { id: 'first_save', name: 'Collector', description: 'Save your first prompt', icon: '💾', category: 'milestone', rarity: 'common', xpReward: 25 },
  { id: 'first_template', name: 'Template User', description: 'Use your first template', icon: '📋', category: 'milestone', rarity: 'common', xpReward: 25 },
  { id: 'first_export', name: 'Exporter', description: 'Export your first prompt as PDF', icon: '📄', category: 'milestone', rarity: 'common', xpReward: 50 },
  { id: 'upgrade_plan', name: 'Investor', description: 'Upgrade your subscription', icon: '💎', category: 'milestone', rarity: 'rare', xpReward: 200 },

  // Skill badges
  { id: 'all_categories', name: 'Explorer', description: 'Generate prompts in all categories', icon: '🧭', category: 'skill', rarity: 'epic', xpReward: 300 },
  { id: 'refine_master', name: 'Perfectionist', description: 'Refine 20 prompts', icon: '🔧', category: 'skill', rarity: 'rare', xpReward: 150 },
  { id: 'quick_learner', name: 'Quick Learner', description: 'Complete 5 Academy lessons', icon: '📚', category: 'skill', rarity: 'common', xpReward: 100 },
  { id: 'scholar', name: 'Scholar', description: 'Complete a full Academy course', icon: '🎓', category: 'skill', rarity: 'rare', xpReward: 300 },
  { id: 'professor', name: 'Professor', description: 'Complete 5 Academy courses', icon: '👨‍🏫', category: 'skill', rarity: 'epic', xpReward: 750 },

  // Social badges
  { id: 'team_player', name: 'Team Player', description: 'Join or create a team', icon: '👥', category: 'social', rarity: 'common', xpReward: 75 },
  { id: 'collaborator', name: 'Collaborator', description: 'Share 5 prompts with team', icon: '🤝', category: 'social', rarity: 'rare', xpReward: 150 },
  { id: 'reviewer', name: 'Reviewer', description: 'Rate 10 lessons or prompts', icon: '⭐', category: 'social', rarity: 'common', xpReward: 50 },
  { id: 'influencer', name: 'Influencer', description: 'Get 50 likes on your prompts', icon: '💫', category: 'social', rarity: 'epic', xpReward: 400 },

  // Streak badges
  { id: 'streak_3', name: 'On Fire', description: '3-day login streak', icon: '🔥', category: 'achievement', rarity: 'common', xpReward: 50 },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day login streak', icon: '⚡', category: 'achievement', rarity: 'rare', xpReward: 150 },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day login streak', icon: '🌟', category: 'achievement', rarity: 'epic', xpReward: 500 },
  { id: 'streak_100', name: 'Centurion', description: '100-day login streak', icon: '💯', category: 'achievement', rarity: 'legendary', xpReward: 1500 },

  // Special badges
  { id: 'early_adopter', name: 'Early Adopter', description: 'Joined during beta', icon: '🚀', category: 'special', rarity: 'legendary', xpReward: 500 },
  { id: 'builder_iq', name: 'App Builder', description: 'Create your first app with BuilderIQ', icon: '🏗️', category: 'special', rarity: 'rare', xpReward: 200 },
  { id: 'voice_pioneer', name: 'Voice Pioneer', description: 'Use voice commands 10 times', icon: '🎤', category: 'special', rarity: 'rare', xpReward: 150 },
  { id: 'night_owl', name: 'Night Owl', description: 'Generate prompts after midnight', icon: '🦉', category: 'special', rarity: 'common', xpReward: 25 },
  { id: 'early_bird', name: 'Early Bird', description: 'Generate prompts before 6 AM', icon: '🐦', category: 'special', rarity: 'common', xpReward: 25 },
];

// XP rewards for actions
export const XP_REWARDS = {
  GENERATE_PROMPT: 10,
  SAVE_PROMPT: 5,
  USE_TEMPLATE: 5,
  REFINE_PROMPT: 8,
  EXPORT_PDF: 5,
  COMPLETE_LESSON: 15,
  COMPLETE_QUIZ: 20,
  COMPLETE_COURSE: 100,
  RATE_CONTENT: 3,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 5, // per day of streak
  FIRST_OF_DAY: 15,
  SHARE_PROMPT: 10,
  BUILDERIQ_CREATE: 25,
  VOICE_COMMAND: 2,
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState] = useState<GamificationState>({
    xp: 0,
    level: 1,
    levelProgress: 0,
    badges: ALL_BADGES,
    unlockedBadges: [],
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      streakFreezes: 0,
    },
    recentXP: [],
    weeklyXP: 0,
    monthlyXP: 0,
    rank: 0,
  });

  // Calculate level from XP
  const calculateLevel = useCallback((xp: number): number => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) {
        return LEVELS[i].level;
      }
    }
    return 1;
  }, []);

  // Get level info
  const getLevelInfo = useCallback((level: number): Level => {
    return LEVELS[level - 1] || LEVELS[0];
  }, []);

  // Calculate progress to next level
  const calculateLevelProgress = useCallback((xp: number, level: number): number => {
    const currentLevelInfo = getLevelInfo(level);
    const nextLevelInfo = getLevelInfo(level + 1);

    if (!nextLevelInfo || currentLevelInfo.maxXP === Infinity) return 100;

    const xpInCurrentLevel = xp - currentLevelInfo.minXP;
    const xpNeededForLevel = currentLevelInfo.maxXP - currentLevelInfo.minXP;

    return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));
  }, [getLevelInfo]);

  // Load gamification data
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    const loadData = () => {
      try {
        // Load from localStorage (in production, this would be from API)
        const savedData = localStorage.getItem(`gamification_${user.id}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          const level = calculateLevel(parsed.xp || 0);
          setState(prev => ({
            ...prev,
            ...parsed,
            level,
            levelProgress: calculateLevelProgress(parsed.xp || 0, level),
          }));
        }
      } catch (error) {
        console.error('Error loading gamification data:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, [isAuthenticated, user, calculateLevel, calculateLevelProgress]);

  // Save gamification data
  const saveData = useCallback((newState: GamificationState) => {
    if (!user) return;
    try {
      localStorage.setItem(`gamification_${user.id}`, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }, [user]);

  // Award XP
  const awardXP = useCallback((amount: number, reason: string, category: string = 'general') => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > prev.level;

      const transaction: XPTransaction = {
        id: `xp_${Date.now()}`,
        amount,
        reason,
        category,
        timestamp: new Date(),
      };

      const newState = {
        ...prev,
        xp: newXP,
        level: newLevel,
        levelProgress: calculateLevelProgress(newXP, newLevel),
        recentXP: [transaction, ...(prev.recentXP || []).slice(0, 49)],
        weeklyXP: prev.weeklyXP + amount,
        monthlyXP: prev.monthlyXP + amount,
      };

      // Show XP toast
      toast({
        title: `+${amount} XP`,
        description: reason,
        duration: 2000,
      });

      // Show level up toast
      if (leveledUp) {
        const newLevelInfo = getLevelInfo(newLevel);
        setTimeout(() => {
          toast({
            title: '🎉 Level Up!',
            description: `You're now ${newLevelInfo.name} (Level ${newLevel})!`,
            duration: 5000,
          });
        }, 500);
      }

      saveData(newState);
      return newState;
    });
  }, [calculateLevel, calculateLevelProgress, getLevelInfo, saveData, toast]);

  // Check and award badge
  const checkAndAwardBadge = useCallback((badgeId: string): boolean => {
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge) return false;

    setState(prev => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;

      const newUnlockedBadges = [...prev.unlockedBadges, badgeId];
      const newXP = prev.xp + badge.xpReward;
      const newLevel = calculateLevel(newXP);

      // Show badge unlock toast
      toast({
        title: `🏅 Badge Unlocked!`,
        description: `${badge.icon} ${badge.name} - ${badge.description}`,
        duration: 5000,
      });

      const newState = {
        ...prev,
        unlockedBadges: newUnlockedBadges,
        xp: newXP,
        level: newLevel,
        levelProgress: calculateLevelProgress(newXP, newLevel),
        badges: prev.badges.map(b =>
          b.id === badgeId ? { ...b, unlockedAt: new Date() } : b
        ),
      };

      saveData(newState);
      return newState;
    });

    return true;
  }, [calculateLevel, calculateLevelProgress, saveData, toast]);

  // Update streak
  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();

    setState(prev => {
      const lastActive = prev.streak.lastActiveDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = prev.streak.currentStreak;
      let freezesUsed = 0;

      if (lastActive === today) {
        // Already logged in today
        return prev;
      } else if (lastActive === yesterday) {
        // Continuing streak
        newStreak += 1;
      } else if (lastActive && prev.streak.streakFreezes > 0) {
        // Use streak freeze
        freezesUsed = 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      const newState = {
        ...prev,
        streak: {
          currentStreak: newStreak,
          longestStreak: Math.max(prev.streak.longestStreak, newStreak),
          lastActiveDate: today,
          streakFreezes: prev.streak.streakFreezes - freezesUsed,
        },
      };

      // Award streak XP
      if (newStreak > prev.streak.currentStreak) {
        const streakBonus = XP_REWARDS.DAILY_LOGIN + (XP_REWARDS.STREAK_BONUS * newStreak);
        awardXP(streakBonus, `${newStreak}-day streak bonus!`, 'streak');

        // Check streak badges
        if (newStreak >= 3) checkAndAwardBadge('streak_3');
        if (newStreak >= 7) checkAndAwardBadge('streak_7');
        if (newStreak >= 30) checkAndAwardBadge('streak_30');
        if (newStreak >= 100) checkAndAwardBadge('streak_100');
      }

      saveData(newState);
      return newState;
    });
  }, [awardXP, checkAndAwardBadge, saveData]);

  // Get leaderboard (mock implementation - would be API call)
  const getLeaderboard = useCallback(async (type: 'daily' | 'weekly' | 'monthly' | 'allTime'): Promise<LeaderboardEntry[]> => {
    // In production, this would fetch from API
    // For now, return mock data with current user
    const mockUsers: LeaderboardEntry[] = [
      { userId: '1', username: 'PromptMaster', xp: 5200, level: 9, badges: 18, rank: 1 },
      { userId: '2', username: 'AIWizard', xp: 4800, level: 9, badges: 15, rank: 2 },
      { userId: '3', username: 'CreativeGenius', xp: 4100, level: 8, badges: 14, rank: 3 },
      { userId: '4', username: 'TechNinja', xp: 3500, level: 8, badges: 12, rank: 4 },
      { userId: '5', username: 'DataDriven', xp: 2900, level: 7, badges: 11, rank: 5 },
    ];

    // Add current user if authenticated
    if (user) {
      const userEntry: LeaderboardEntry = {
        userId: user.id,
        username: user.username || user.email?.split('@')[0] || 'You',
        xp: state.xp,
        level: state.level,
        badges: state.unlockedBadges.length,
        rank: 0,
      };
      mockUsers.push(userEntry);
      mockUsers.sort((a, b) => b.xp - a.xp);
      mockUsers.forEach((u, i) => u.rank = i + 1);
    }

    return mockUsers.slice(0, 10);
  }, [user, state.xp, state.level, state.unlockedBadges.length]);

  // Computed values
  const currentLevel = getLevelInfo(state.level);
  const nextLevel = state.level < LEVELS.length ? getLevelInfo(state.level + 1) : null;
  const xpToNextLevel = nextLevel ? nextLevel.minXP - state.xp : 0;
  const getNextLevelXP = useCallback(() => xpToNextLevel, [xpToNextLevel]);

  // Update streak on mount
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      updateStreak();
    }
  }, [isAuthenticated, isLoading, updateStreak]);

  return (
    <GamificationContext.Provider
      value={{
        ...state,
        awardXP,
        checkAndAwardBadge,
        updateStreak,
        getLeaderboard,
        getLevelInfo,
        getNextLevelXP,
        currentLevel,
        nextLevel,
        xpToNextLevel,
        isLoading,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export { ALL_BADGES, LEVELS, GamificationContext };
