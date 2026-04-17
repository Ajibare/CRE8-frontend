'use client';

import { useMemo } from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface AchievementBadgesProps {
  userId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AchievementBadges(_props: AchievementBadgesProps) {

  // Use useMemo for synchronous data to avoid setState in effect warning
  const achievements = useMemo<Achievement[]>(() => [
    {
      id: 'first_submission',
      name: 'First Step',
      description: 'Submit your first creative work',
      icon: '🎯',
      unlocked: true,
      unlockedAt: '2024-01-15',
      progress: 1,
      maxProgress: 1,
      tier: 'bronze'
    },
    {
      id: 'voting_initiate',
      name: 'Supporter',
      description: 'Cast your first vote',
      icon: '🗳️',
      unlocked: true,
      unlockedAt: '2024-01-20',
      progress: 1,
      maxProgress: 1,
      tier: 'bronze'
    },
    {
      id: 'submission_streak',
      name: 'Consistent Creator',
      description: 'Submit for 3 consecutive weeks',
      icon: '🔥',
      unlocked: false,
      progress: 2,
      maxProgress: 3,
      tier: 'silver'
    },
    {
      id: 'top_contender',
      name: 'Top Contender',
      description: 'Reach top 10 in a contest',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      tier: 'silver'
    },
    {
      id: 'vote_magnet',
      name: 'Vote Magnet',
      description: 'Receive 100 votes on a single submission',
      icon: '🌟',
      unlocked: false,
      progress: 45,
      maxProgress: 100,
      tier: 'gold'
    },
    {
      id: 'contest_winner',
      name: 'Champion',
      description: 'Win first place in a contest',
      icon: '👑',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      tier: 'platinum'
    },
    {
      id: 'social_sharer',
      name: 'Influencer',
      description: 'Share your work on 3 different platforms',
      icon: '📢',
      unlocked: true,
      unlockedAt: '2024-02-01',
      progress: 3,
      maxProgress: 3,
      tier: 'bronze'
    },
    {
      id: 'portfolio_complete',
      name: 'Portfolio Master',
      description: 'Complete your profile with bio, skills, and social links',
      icon: '🎨',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      tier: 'bronze'
    }
  ], []);

  const loading = false;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-violet-400 to-violet-600';
      default:
        return 'from-gray-200 to-gray-400';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'Bronze';
      case 'silver':
        return 'Silver';
      case 'gold':
        return 'Gold';
      case 'platinum':
        return 'Platinum';
      default:
        return '';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
          <p className="text-sm text-gray-600">
            {unlockedCount} of {totalCount} unlocked
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-violet-600">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div
          className="bg-gradient-to-r from-violet-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
        ></div>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'border-violet-200 bg-violet-50 shadow-md'
                : 'border-gray-200 bg-gray-50 opacity-75'
            }`}
          >
            {/* Badge icon */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getTierColor(achievement.tier)} flex items-center justify-center text-2xl mx-auto mb-3 ${
              achievement.unlocked ? 'shadow-lg' : 'grayscale'
            }`}>
              {achievement.icon}
            </div>

            {/* Info */}
            <div className="text-center">
              <h4 className={`font-semibold text-sm mb-1 ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h4>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {achievement.description}
              </p>

              {/* Tier badge */}
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                achievement.tier === 'bronze'
                  ? 'bg-orange-100 text-orange-700'
                  : achievement.tier === 'silver'
                  ? 'bg-gray-200 text-gray-700'
                  : achievement.tier === 'gold'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-violet-100 text-violet-700'
              }`}>
                {getTierLabel(achievement.tier)}
              </span>

              {/* Progress or unlocked date */}
              {achievement.unlocked ? (
                <p className="text-xs text-violet-600 mt-2">
                  Unlocked {achievement.unlockedAt}
                </p>
              ) : (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div
                      className="bg-violet-400 h-1.5 rounded-full"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {achievement.progress}/{achievement.maxProgress}
                  </p>
                </div>
              )}
            </div>

            {/* Lock overlay for locked achievements */}
            {!achievement.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/50 rounded-xl">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips section */}
      <div className="mt-6 bg-violet-50 rounded-xl p-4">
        <h4 className="font-semibold text-violet-900 mb-2">💡 Tips to earn more badges:</h4>
        <ul className="text-sm text-violet-700 space-y-1">
          <li>• Submit creative work consistently every week</li>
          <li>• Share your submissions on social media</li>
          <li>• Vote for other creatives to get votes back</li>
          <li>• Complete your profile to attract more voters</li>
        </ul>
      </div>
    </div>
  );
}
