import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Mail,
  Users,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  Share2,
  Edit2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReferral } from '@/hooks/useReferral';

interface ReferralWidgetProps {
  variant?: 'compact' | 'full' | 'card';
  showLeaderboard?: boolean;
  className?: string;
}

export const ReferralWidget: React.FC<ReferralWidgetProps> = ({
  variant = 'card',
  showLeaderboard = false,
  className = '',
}) => {
  const {
    referralCode,
    stats,
    leaderboard,
    isLoading,
    isAuthenticated,
    copyReferralLink,
    shareOnTwitter,
    shareOnLinkedIn,
    shareByEmail,
    customizeCode,
  } = useReferral();

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [editError, setEditError] = useState('');

  const handleCopy = async () => {
    const success = await copyReferralLink();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCustomizeCode = async () => {
    if (!newCode.trim()) {
      setEditError('Please enter a code');
      return;
    }
    setEditError('');
    const success = await customizeCode(newCode.trim());
    if (success) {
      setIsEditing(false);
      setNewCode('');
    } else {
      setEditError('Code is already taken or invalid');
    }
  };

  if (isLoading && !referralCode) {
    return (
      <div className={`animate-pulse bg-slate-800/50 rounded-2xl p-6 ${className}`}>
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-700 rounded mb-3"></div>
        <div className="h-8 bg-slate-700 rounded w-2/3"></div>
      </div>
    );
  }

  // Compact variant - just the link and copy button
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2 font-mono text-sm text-purple-300 truncate">
          {referralCode?.link || 'Loading...'}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="border-purple-500/30 hover:bg-purple-500/10"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  // Full variant - complete referral dashboard
  if (variant === 'full') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Referral Program</h2>
              <p className="text-gray-400 text-sm">Earn tokens by inviting friends</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{stats?.totalEarnings || 0}</div>
            <div className="text-xs text-gray-500">Tokens Earned</div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-300">Your Referral Link</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
            >
              <Edit2 className="w-3 h-3" />
              Customize
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex gap-2">
                  <Input
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="YOURCODE"
                    maxLength={12}
                    className="font-mono uppercase"
                  />
                  <Button onClick={handleCustomizeCode} size="sm">
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setNewCode('');
                      setEditError('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {editError && <p className="text-red-400 text-xs">{editError}</p>}
                <p className="text-xs text-gray-500">4-12 alphanumeric characters</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 bg-slate-800/80 rounded-xl px-4 py-3 font-mono text-purple-300 text-sm truncate">
                  {referralCode?.link}
                </div>
                <Button
                  onClick={handleCopy}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700/50">
            <span className="text-xs text-gray-500">Share via:</span>
            <button
              onClick={shareOnTwitter}
              className="p-2 bg-slate-800/50 hover:bg-[#1DA1F2]/20 rounded-lg transition-colors group"
            >
              <Twitter className="w-4 h-4 text-gray-400 group-hover:text-[#1DA1F2]" />
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="p-2 bg-slate-800/50 hover:bg-[#0A66C2]/20 rounded-lg transition-colors group"
            >
              <Linkedin className="w-4 h-4 text-gray-400 group-hover:text-[#0A66C2]" />
            </button>
            <button
              onClick={shareByEmail}
              className="p-2 bg-slate-800/50 hover:bg-purple-500/20 rounded-lg transition-colors group"
            >
              <Mail className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats?.totalReferrals || 0}</div>
            <div className="text-xs text-gray-500">Total Referrals</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats?.successfulReferrals || 0}</div>
            <div className="text-xs text-gray-500">Converted</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats?.pendingReferrals || 0}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        {/* Milestone Progress */}
        {stats?.milestones?.next && (
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Next Milestone</span>
              </div>
              <span className="text-xs text-purple-400">
                +{stats.milestones.next.bonus} tokens
              </span>
            </div>
            <div className="mb-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.milestones.progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{stats.successfulReferrals} referrals</span>
              <span>{stats.milestones.next.count} needed</span>
            </div>
          </div>
        )}

        {/* Rewards Info */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">How it works</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-purple-400" />
              Your friend gets <span className="text-purple-300 font-medium">{referralCode?.refereeRewardTokens || 25} tokens</span> on signup
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-purple-400" />
              You earn <span className="text-purple-300 font-medium">{referralCode?.referrerRewardTokens || 50} tokens</span> when they upgrade
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-purple-400" />
              Bonus tokens at every milestone!
            </li>
          </ul>
        </div>

        {/* Leaderboard */}
        {showLeaderboard && leaderboard.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Top Referrers</h3>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : entry.rank === 2
                          ? 'bg-gray-400/20 text-gray-300'
                          : entry.rank === 3
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-slate-700 text-gray-500'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <span className="text-sm text-gray-300">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-400">
                      {entry.referrals} referrals
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default card variant
  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-purple-500/20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Invite Friends</h3>
          <p className="text-xs text-gray-400">
            Earn {referralCode?.referrerRewardTokens || 50} tokens per referral
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-slate-800/80 rounded-lg px-3 py-2 font-mono text-sm text-purple-300 truncate">
          {isLoading ? 'Loading...' : referralCode?.code || 'Sign in to get your code'}
        </div>
        <Button
          size="sm"
          onClick={handleCopy}
          className="bg-purple-600 hover:bg-purple-500"
          disabled={!referralCode}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{stats?.totalReferrals || 0} referrals</span>
        <span>{stats?.totalEarnings || 0} tokens earned</span>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
        <button
          onClick={shareOnTwitter}
          disabled={!referralCode}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800/50 hover:bg-[#1DA1F2]/20 rounded-lg transition-colors text-xs text-gray-400 hover:text-[#1DA1F2] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Twitter className="w-3 h-3" />
          Tweet
        </button>
        <button
          onClick={shareOnLinkedIn}
          disabled={!referralCode}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800/50 hover:bg-[#0A66C2]/20 rounded-lg transition-colors text-xs text-gray-400 hover:text-[#0A66C2] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Linkedin className="w-3 h-3" />
          Share
        </button>
        <button
          onClick={shareByEmail}
          disabled={!referralCode}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800/50 hover:bg-purple-500/20 rounded-lg transition-colors text-xs text-gray-400 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-3 h-3" />
          Email
        </button>
      </div>
    </div>
  );
};

export default ReferralWidget;
