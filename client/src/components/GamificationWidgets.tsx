import React, { useState } from 'react';
import { useGamification, Badge, LeaderboardEntry, LEVELS } from '@/contexts/GamificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Trophy, Flame, Star, Zap, Crown, Medal,
  TrendingUp, Target, Gift, Lock, ChevronRight,
  Sparkles, Award, Users, Calendar
} from 'lucide-react';

// XP Progress Bar with Level Info
export const XPProgressBar: React.FC<{ className?: string; compact?: boolean }> = ({ className, compact = false }) => {
  const { xp, level, levelProgress, currentLevel, nextLevel, xpToNextLevel } = useGamification();

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br", currentLevel.color)}>
          <span className="text-white text-sm font-bold">{level}</span>
        </div>
        <div className="flex-1">
          <Progress value={levelProgress} className="h-2" />
        </div>
        <span className="text-xs text-gray-400">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-slate-800/50 rounded-xl p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", currentLevel.color)}>
            <span className="text-white text-xl font-bold">{level}</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{currentLevel.name}</h3>
            <p className="text-sm text-gray-400">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{xp.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total XP</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress to Level {level + 1}</span>
          <span className="text-purple-400">{levelProgress}%</span>
        </div>
        <Progress value={levelProgress} className="h-3" />
        {nextLevel && (
          <p className="text-xs text-gray-500 text-right">
            {xpToNextLevel.toLocaleString()} XP to {nextLevel.name}
          </p>
        )}
      </div>

      {currentLevel.perks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-gray-400 mb-2">Current Perks:</p>
          <div className="flex flex-wrap gap-1">
            {currentLevel.perks.map((perk, i) => (
              <UIBadge key={i} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                {perk}
              </UIBadge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Streak Display
export const StreakDisplay: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ className, size = 'md' }) => {
  const { streak } = useGamification();

  const sizeClasses = {
    sm: 'p-2 gap-2',
    md: 'p-4 gap-3',
    lg: 'p-6 gap-4',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn(
      "bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 flex items-center",
      sizeClasses[size],
      className
    )}>
      <div className={cn(
        "rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-2",
        size === 'lg' && "p-3"
      )}>
        <Flame className={cn("text-white", iconSizes[size])} />
      </div>
      <div>
        <p className={cn(
          "font-bold text-white",
          size === 'sm' && "text-lg",
          size === 'md' && "text-2xl",
          size === 'lg' && "text-3xl"
        )}>
          {streak.currentStreak}
        </p>
        <p className={cn(
          "text-orange-300",
          size === 'sm' && "text-xs",
          size === 'md' && "text-sm",
          size === 'lg' && "text-base"
        )}>
          Day Streak
        </p>
      </div>
      {size !== 'sm' && (
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Best: {streak.longestStreak} days</p>
          {streak.streakFreezes > 0 && (
            <p className="text-xs text-cyan-400">❄️ {streak.streakFreezes} freezes</p>
          )}
        </div>
      )}
    </div>
  );
};

// Badge Grid
export const BadgeGrid: React.FC<{
  className?: string;
  showLocked?: boolean;
  limit?: number;
  category?: Badge['category'];
}> = ({ className, showLocked = true, limit, category }) => {
  const { badges, unlockedBadges } = useGamification();

  let displayBadges = badges;
  if (category) {
    displayBadges = badges.filter(b => b.category === category);
  }
  if (limit) {
    displayBadges = displayBadges.slice(0, limit);
  }

  const rarityColors = {
    common: 'from-gray-400 to-gray-500 border-gray-500/50',
    rare: 'from-blue-400 to-blue-500 border-blue-500/50',
    epic: 'from-purple-400 to-purple-500 border-purple-500/50',
    legendary: 'from-yellow-400 to-orange-500 border-yellow-500/50',
  };

  return (
    <div className={cn("grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3", className)}>
      {displayBadges.map((badge) => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        if (!showLocked && !isUnlocked) return null;

        return (
          <div
            key={badge.id}
            className={cn(
              "relative group cursor-pointer",
              !isUnlocked && "opacity-40"
            )}
            title={`${badge.name}: ${badge.description}`}
          >
            <div className={cn(
              "w-full aspect-square rounded-xl flex items-center justify-center text-2xl border-2 transition-transform group-hover:scale-110",
              isUnlocked
                ? `bg-gradient-to-br ${rarityColors[badge.rarity]}`
                : "bg-slate-800 border-slate-700"
            )}>
              {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-gray-500" />}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
              <p className="text-sm font-semibold text-white">{badge.name}</p>
              <p className="text-xs text-gray-400">{badge.description}</p>
              <p className="text-xs text-purple-400 mt-1">+{badge.xpReward} XP</p>
            </div>

            {/* Rarity indicator */}
            <div className={cn(
              "absolute -top-1 -right-1 w-3 h-3 rounded-full",
              badge.rarity === 'common' && "bg-gray-400",
              badge.rarity === 'rare' && "bg-blue-400",
              badge.rarity === 'epic' && "bg-purple-400",
              badge.rarity === 'legendary' && "bg-yellow-400 animate-pulse"
            )} />
          </div>
        );
      })}
    </div>
  );
};

// Badge Showcase (recent/featured badges)
export const BadgeShowcase: React.FC<{ className?: string }> = ({ className }) => {
  const { badges, unlockedBadges } = useGamification();

  const recentBadges = badges
    .filter(b => unlockedBadges.includes(b.id) && b.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  if (recentBadges.length === 0) {
    return (
      <div className={cn("bg-slate-800/50 rounded-xl p-4 text-center", className)}>
        <Medal className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No badges yet!</p>
        <p className="text-gray-500 text-xs">Complete actions to earn badges</p>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-4", className)}>
      {recentBadges.map((badge) => (
        <div
          key={badge.id}
          className="flex-1 bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-xl p-4 border border-purple-500/20"
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <h4 className="font-semibold text-white text-sm">{badge.name}</h4>
          <p className="text-xs text-gray-400">{badge.description}</p>
        </div>
      ))}
    </div>
  );
};

// Leaderboard
export const Leaderboard: React.FC<{ className?: string }> = ({ className }) => {
  const { getLeaderboard } = useGamification();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      const data = await getLeaderboard(timeframe);
      setLeaderboard(data);
      setIsLoading(false);
    };
    loadLeaderboard();
  }, [getLeaderboard, timeframe]);

  const rankIcons = ['👑', '🥈', '🥉'];

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Leaderboard
          </CardTitle>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="bg-slate-700/50">
              <TabsTrigger value="weekly" className="text-xs">Week</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">Month</TabsTrigger>
              <TabsTrigger value="allTime" className="text-xs">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  i < 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "bg-slate-700/30",
                  "hover:bg-slate-700/50"
                )}
              >
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <span className="text-xl">{rankIcons[i]}</span>
                  ) : (
                    <span className="text-gray-400 font-semibold">#{entry.rank}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{entry.username}</p>
                  <p className="text-xs text-gray-400">Level {entry.level} • {entry.badges} badges</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-400">{entry.xp.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Level Progress Card
export const LevelProgressCard: React.FC<{ className?: string }> = ({ className }) => {
  const { level, currentLevel, nextLevel, xpToNextLevel, levelProgress } = useGamification();

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700 overflow-hidden", className)}>
      <div className={cn("h-2 bg-gradient-to-r", currentLevel.color)} />
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white text-2xl font-bold",
            currentLevel.color
          )}>
            {level}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{currentLevel.name}</h3>
            {nextLevel && (
              <>
                <Progress value={levelProgress} className="h-2 mt-2" />
                <p className="text-sm text-gray-400 mt-1">
                  {xpToNextLevel.toLocaleString()} XP to {nextLevel.name}
                </p>
              </>
            )}
          </div>
        </div>

        {nextLevel && nextLevel.perks.length > 0 && (
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Gift className="w-3 h-3" /> Next level rewards:
            </p>
            <div className="flex flex-wrap gap-1">
              {nextLevel.perks.map((perk, i) => (
                <UIBadge key={i} className="bg-purple-500/20 text-purple-300 text-xs">
                  {perk}
                </UIBadge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Daily Challenges (placeholder for future)
export const DailyChallenges: React.FC<{ className?: string }> = ({ className }) => {
  const challenges = [
    { id: 1, title: 'Generate 3 prompts', progress: 1, max: 3, xp: 30, icon: '📝' },
    { id: 2, title: 'Complete 1 Academy lesson', progress: 0, max: 1, xp: 20, icon: '📚' },
    { id: 3, title: 'Rate 2 pieces of content', progress: 2, max: 2, xp: 15, completed: true, icon: '⭐' },
  ];

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Daily Challenges
          <UIBadge className="ml-auto bg-green-500/20 text-green-300">
            +65 XP Available
          </UIBadge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={cn(
              "p-3 rounded-lg border",
              challenge.completed
                ? "bg-green-500/10 border-green-500/30"
                : "bg-slate-700/30 border-slate-600"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{challenge.icon}</span>
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  challenge.completed ? "text-green-300 line-through" : "text-white"
                )}>
                  {challenge.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress
                    value={(challenge.progress / challenge.max) * 100}
                    className="h-1.5 flex-1"
                  />
                  <span className="text-xs text-gray-400">
                    {challenge.progress}/{challenge.max}
                  </span>
                </div>
              </div>
              <UIBadge className={cn(
                "text-xs",
                challenge.completed
                  ? "bg-green-500/20 text-green-300"
                  : "bg-purple-500/20 text-purple-300"
              )}>
                {challenge.completed ? '✓ Done' : `+${challenge.xp} XP`}
              </UIBadge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// XP Notification Toast Component
export const XPNotification: React.FC<{
  amount: number;
  reason: string;
  onClose: () => void;
}> = ({ amount, reason, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-52 right-4 z-40 animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 shadow-lg shadow-purple-500/25 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg">+{amount} XP</p>
          <p className="text-white/80 text-sm">{reason}</p>
        </div>
      </div>
    </div>
  );
};

// Mini Gamification Widget for Header/Sidebar
export const GamificationMiniWidget: React.FC<{ className?: string }> = ({ className }) => {
  const { xp, level, levelProgress, streak, currentLevel } = useGamification();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Level Badge */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br",
        currentLevel.color
      )}>
        {level}
      </div>

      {/* XP Bar */}
      <div className="flex-1 min-w-[100px]">
        <div className="flex items-center justify-between text-xs mb-0.5">
          <span className="text-gray-400">{xp} XP</span>
          <span className="text-purple-400">{levelProgress}%</span>
        </div>
        <Progress value={levelProgress} className="h-1.5" />
      </div>

      {/* Streak */}
      {streak.currentStreak > 0 && (
        <div className="flex items-center gap-1 text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-semibold">{streak.currentStreak}</span>
        </div>
      )}
    </div>
  );
};

export default {
  XPProgressBar,
  StreakDisplay,
  BadgeGrid,
  BadgeShowcase,
  Leaderboard,
  LevelProgressCard,
  DailyChallenges,
  XPNotification,
  GamificationMiniWidget,
};
