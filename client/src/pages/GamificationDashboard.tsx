import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import BackButton from '@/components/BackButton';
import { useGamification, ALL_BADGES, LEVELS, XP_REWARDS } from '@/contexts/GamificationContext';
import {
  XPProgressBar,
  StreakDisplay,
  BadgeGrid,
  Leaderboard,
  LevelProgressCard,
  DailyChallenges,
} from '@/components/GamificationWidgets';
import {
  Trophy, Flame, Star, Zap, Crown, Medal,
  TrendingUp, Target, Gift, Award, Users,
  Sparkles, ChevronRight, Clock, Calendar,
  BarChart3, Lock, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GamificationDashboard: React.FC = () => {
  const [, navigate] = useLocation();
  const {
    xp, level, levelProgress, streak, unlockedBadges,
    badges, recentXP, weeklyXP, monthlyXP, currentLevel, rank
  } = useGamification();
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>('all');

  // Calculate stats
  const totalBadges = ALL_BADGES.length;
  const unlockedCount = unlockedBadges.length;
  const badgeProgress = Math.round((unlockedCount / totalBadges) * 100);

  // Filter badges by category
  const filteredBadges = selectedBadgeCategory === 'all'
    ? badges
    : badges.filter(b => b.category === selectedBadgeCategory);

  // Badge categories
  const badgeCategories = [
    { id: 'all', label: 'All', count: badges.length },
    { id: 'achievement', label: 'Achievements', count: badges.filter(b => b.category === 'achievement').length },
    { id: 'milestone', label: 'Milestones', count: badges.filter(b => b.category === 'milestone').length },
    { id: 'skill', label: 'Skills', count: badges.filter(b => b.category === 'skill').length },
    { id: 'social', label: 'Social', count: badges.filter(b => b.category === 'social').length },
    { id: 'special', label: 'Special', count: badges.filter(b => b.category === 'special').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <BackButton />

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Your Progress</h1>
                  <p className="text-gray-400">Track your achievements and climb the leaderboard</p>
                </div>
              </div>
            </div>
            <StreakDisplay size="lg" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{xp.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Total XP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", currentLevel.color)}>
                  <span className="text-xl font-bold text-white">{level}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{currentLevel.name}</p>
                  <p className="text-sm text-gray-400">Current Level</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Medal className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{unlockedCount}/{totalBadges}</p>
                  <p className="text-sm text-gray-400">Badges Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{weeklyXP.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">XP This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Level Progress */}
            <LevelProgressCard />

            {/* Daily Challenges */}
            <DailyChallenges />

            {/* Badges Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Badges Collection
                    <Badge className="ml-2 bg-purple-500/20 text-purple-300">
                      {unlockedCount}/{totalBadges}
                    </Badge>
                  </CardTitle>
                  <Progress value={badgeProgress} className="w-24 h-2" />
                </div>
                <CardDescription className="text-gray-400">
                  Complete actions to unlock badges and earn XP rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {badgeCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedBadgeCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedBadgeCategory(cat.id)}
                      className={cn(
                        selectedBadgeCategory === cat.id
                          ? 'bg-purple-600'
                          : 'border-slate-600 text-gray-300'
                      )}
                    >
                      {cat.label} ({cat.count})
                    </Button>
                  ))}
                </div>

                {/* Badge Grid */}
                <BadgeGrid
                  category={selectedBadgeCategory === 'all' ? undefined : selectedBadgeCategory as any}
                  showLocked={true}
                />
              </CardContent>
            </Card>

            {/* XP History */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentXP.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No XP earned yet</p>
                    <p className="text-gray-500 text-sm">Start generating prompts to earn XP!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentXP.slice(0, 10).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm">{tx.reason}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300">
                          +{tx.amount} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <Leaderboard />

            {/* XP Rewards Guide */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-400" />
                  XP Rewards
                </CardTitle>
                <CardDescription className="text-gray-400">
                  How to earn XP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(XP_REWARDS).slice(0, 8).map(([action, xp]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                  >
                    <span className="text-gray-300 text-sm">
                      {action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                    </span>
                    <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                      +{xp} XP
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Level Roadmap */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Level Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LEVELS.map((lvl) => {
                  const isCurrentLevel = lvl.level === level;
                  const isUnlocked = lvl.level <= level;

                  return (
                    <div
                      key={lvl.level}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        isCurrentLevel && "bg-purple-500/20 border border-purple-500/30",
                        !isUnlocked && "opacity-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                        isUnlocked
                          ? `bg-gradient-to-br ${lvl.color} text-white`
                          : "bg-slate-700 text-gray-500"
                      )}>
                        {isUnlocked ? lvl.level : <Lock className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium",
                          isUnlocked ? "text-white" : "text-gray-500"
                        )}>
                          {lvl.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lvl.minXP.toLocaleString()} XP
                        </p>
                      </div>
                      {isCurrentLevel && (
                        <Badge className="bg-purple-500/30 text-purple-300 text-xs">
                          Current
                        </Badge>
                      )}
                      {isUnlocked && !isCurrentLevel && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Level Up?</h3>
              <p className="text-gray-400 mb-6">
                Generate prompts, complete courses, and climb the leaderboard!
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => navigate('/categories')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Prompts
                </Button>
                <Button
                  onClick={() => navigate('/academy/courses')}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Browse Academy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
