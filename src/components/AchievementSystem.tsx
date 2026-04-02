/**
 * Achievement System Components
 *
 * Gamification elements to increase user engagement:
 * - Badges for completing milestones
 * - Levels based on learning progress
 * - Leaderboard for competition
 */

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  BookOpen,
  CheckCircle,
  Flame,
  Crown,
  Medal,
  Lock,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUser } from '@/contexts/UserContext';

// ============================================
// Badge Definitions
// ============================================

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    name: '初学者',
    description: '完成第一个课时',
    icon: <BookOpen className="w-6 h-6" />,
    color: '#6B7280',
    requirement: '完成1个课时',
    points: 10,
    rarity: 'common',
  },
  {
    id: 'first_course',
    name: '课程完成者',
    description: '完成一门完整课程',
    icon: <CheckCircle className="w-6 h-6" />,
    color: '#10B981',
    requirement: '完成1门课程',
    points: 50,
    rarity: 'common',
  },
  {
    id: 'week_streak',
    name: '周冠军',
    description: '连续学习7天',
    icon: <Flame className="w-6 h-6" />,
    color: '#F59E0B',
    requirement: '连续学习7天',
    points: 30,
    rarity: 'rare',
  },
  {
    id: 'month_streak',
    name: '月度达人',
    description: '连续学习30天',
    icon: <Zap className="w-6 h-6" />,
    color: '#8B5CF6',
    requirement: '连续学习30天',
    points: 100,
    rarity: 'epic',
  },
  {
    id: 'quiz_master',
    name: '测验达人',
    description: '在测验中获得满分',
    icon: <Target className="w-6 h-6" />,
    color: '#EC4899',
    requirement: '测验获得100分',
    points: 25,
    rarity: 'rare',
  },
  {
    id: 'certificate_earner',
    name: '证书持有者',
    description: '获得学习证书',
    icon: <Award className="w-6 h-6" />,
    color: '#3B82F6',
    requirement: '获得1张证书',
    points: 75,
    rarity: 'rare',
  },
  {
    id: 'all_courses',
    name: '知识大师',
    description: '完成所有课程',
    icon: <Crown className="w-6 h-6" />,
    color: '#FFD700',
    requirement: '完成所有课程',
    points: 500,
    rarity: 'legendary',
  },
  {
    id: 'social_sharer',
    name: '分享达人',
    description: '分享课程或证书10次',
    icon: <Star className="w-6 h-6" />,
    color: '#06B6D4',
    requirement: '分享10次',
    points: 40,
    rarity: 'rare',
  },
];

// ============================================
// Badge Component
// ============================================

interface BadgeProps {
  badge: BadgeDefinition;
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

export function Badge({
  badge,
  earned = false,
  earnedAt,
  size = 'md',
  showDetails = false,
  onClick,
}: BadgeProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const rarityBorders = {
    common: 'border-gray-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

  const rarityGlow = {
    common: '',
    rare: 'shadow-blue-500/20',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-yellow-500/40',
  };

  return (
    <div
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Badge Container */}
      <div
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          border-2 ${earned ? rarityBorders[badge.rarity] : 'border-white/20'}
          ${earned ? rarityGlow[badge.rarity] : ''}
          ${earned ? 'shadow-lg' : 'opacity-40 grayscale'}
          transition-all duration-300 hover:scale-105
        `}
        style={{
          backgroundColor: earned ? `${badge.color}20` : 'rgba(255,255,255,0.05)',
        }}
      >
        {earned ? (
          <div style={{ color: badge.color }}>
            {badge.icon}
          </div>
        ) : (
          <Lock className={iconSizes[size]} />
        )}
      </div>

      {/* Rarity Indicator */}
      {earned && badge.rarity !== 'common' && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: badge.color }}
        >
          <span className="text-[8px] font-bold text-white">
            {badge.rarity === 'legendary' ? '★' : badge.rarity === 'epic' ? '◆' : '●'}
          </span>
        </div>
      )}

      {/* Details Tooltip */}
      {showDetails && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 min-w-[200px]">
          <div className="font-bold text-sm">{badge.name}</div>
          <div className="text-xs text-white/60 mt-1">{badge.description}</div>
          <div className="text-xs text-white/40 mt-2">{badge.requirement}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <span className="text-xs text-spacex-orange">+{badge.points} 积分</span>
            <span className="text-xs capitalize text-white/40">{badge.rarity}</span>
          </div>
          {earned && earnedAt && (
            <div className="text-xs text-green-500 mt-2">
              ✓ 获得于 {new Date(earnedAt).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Badge Gallery Component
// ============================================

interface BadgeGalleryProps {
  earnedBadgeIds?: string[];
  className?: string;
}

export function BadgeGallery({ earnedBadgeIds = [], className = '' }: BadgeGalleryProps) {
  const { trackCTA } = useAnalytics();

  const handleBadgeClick = useCallback(
    (badgeId: string, earned: boolean) => {
      trackCTA(earned ? 'view_earned_badge' : 'view_locked_badge', 'achievement_gallery', undefined, {
        badgeId,
        earned,
      });
    },
    [trackCTA]
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">成就徽章</h3>
        <div className="text-sm text-white/60">
          {earnedBadgeIds.length} / {BADGE_DEFINITIONS.length} 已解锁
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {BADGE_DEFINITIONS.map((badge) => (
          <Badge
            key={badge.id}
            badge={badge}
            earned={earnedBadgeIds.includes(badge.id)}
            size="md"
            onClick={() => handleBadgeClick(badge.id, earnedBadgeIds.includes(badge.id))}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// User Level Component
// ============================================

interface UserLevelProps {
  level: number;
  experience: number;
  experienceToNext: number;
  title?: string;
  showProgress?: boolean;
  className?: string;
}

const LEVEL_TITLES: Record<number, string> = {
  1: '新手学习者',
  2: '初级探索者',
  3: '知识学徒',
  4: '学习达人',
  5: '技能专家',
  6: '知识大师',
  7: '学习导师',
  8: '领域专家',
  9: '行业领袖',
  10: '知识传奇',
};

export function UserLevel({
  level,
  experience,
  experienceToNext,
  title,
  showProgress = true,
  className = '',
}: UserLevelProps) {
  const progress = (experience / experienceToNext) * 100;
  const displayTitle = title || LEVEL_TITLES[Math.min(level, 10)] || '学习者';

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Level Badge */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{
            background: `linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)`,
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
          }}
        >
          {level}
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 rounded-full text-xs font-bold text-black">
          Lv.{level}
        </div>
      </div>

      {/* Level Info */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold">{displayTitle}</span>
          <span className="text-sm text-white/60">
            {experience} / {experienceToNext} XP
          </span>
        </div>

        {showProgress && (
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-spacex-orange to-orange-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Leaderboard Component
// ============================================

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  level: number;
  points: number;
  completedCourses: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  timeFrame?: 'week' | 'month' | 'all';
  className?: string;
}

export function Leaderboard({
  entries,
  currentUserId,
  className = '',
}: LeaderboardProps) {
  const { trackCTA } = useAnalytics();

  useEffect(() => {
    trackCTA('view_leaderboard', 'achievement_system', undefined, {
      entryCount: entries.length,
    });
  }, [entries.length, trackCTA]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-white/40 font-mono">#{rank}</span>;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          学习排行榜
        </h3>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={`
              flex items-center gap-4 p-3 rounded-xl transition-colors
              ${entry.isCurrentUser || entry.userId === currentUserId
                ? 'bg-spacex-orange/20 border border-spacex-orange/50'
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
          >
            {/* Rank */}
            <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spacex-orange to-orange-600 flex items-center justify-center text-white font-bold">
              {entry.userName.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {entry.userName}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs text-spacex-orange">(你)</span>
                )}
              </div>
              <div className="text-xs text-white/60">
                Lv.{entry.level} · {entry.completedCourses} 门课程
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className="font-bold text-spacex-orange">{entry.points.toLocaleString()}</div>
              <div className="text-xs text-white/40">积分</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Achievement Notification Component
// ============================================

interface AchievementNotificationProps {
  badge: BadgeDefinition;
  visible: boolean;
  onClose: () => void;
}

export function AchievementNotification({
  badge,
  visible,
  onClose,
}: AchievementNotificationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      gsap.fromTo(
        ref.current,
        { x: 400, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'back.out' }
      );

      // Auto close after 5 seconds
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="fixed bottom-6 right-6 z-50 p-4 bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-w-sm"
    >
      <div className="flex items-start gap-4">
        {/* Badge */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${badge.color}20` }}
        >
          <div style={{ color: badge.color }}>{badge.icon}</div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="text-xs text-yellow-400 font-medium mb-1">🏆 成就解锁!</div>
          <div className="font-bold">{badge.name}</div>
          <div className="text-sm text-white/60">{badge.description}</div>
          <div className="text-sm text-spacex-orange mt-1">+{badge.points} 积分</div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ============================================
// Learning Streak Component
// ============================================

interface LearningStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastSevenDays: boolean[];
  className?: string;
}

export function LearningStreak({
  currentStreak,
  longestStreak,
  lastSevenDays,
  className = '',
}: LearningStreakProps) {
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold">学习连续天数</span>
        </div>
        <div className="text-2xl font-bold text-orange-500">{currentStreak} 天</div>
      </div>

      {/* Last 7 Days */}
      <div className="flex justify-between mb-4">
        {lastSevenDays.map((completed, index) => (
          <div key={index} className="text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                completed
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-white/30'
              }`}
            >
              {completed ? '✓' : '·'}
            </div>
            <span className="text-xs text-white/40">{dayNames[index]}</span>
          </div>
        ))}
      </div>

      {/* Longest Streak */}
      <div className="text-sm text-white/60">
        最长连续: <span className="text-white">{longestStreak}</span> 天
      </div>
    </div>
  );
}

// ============================================
// Hook for Achievement Management
// ============================================

export function useAchievements() {
  const { trackEvent } = useAnalytics();
  const { learningProgress } = useUser();

  // Calculate earned badges based on user progress
  const getEarnedBadges = useCallback((): string[] => {
    const earned: string[] = [];
    const completedSections = learningProgress?.completedSections || [];

    // First lesson badge
    if (completedSections.length >= 1) {
      earned.push('first_lesson');
    }

    // Course completion badge (simplified check)
    if (completedSections.filter((id: string) => id.startsWith('lesson-')).length >= 24) {
      earned.push('first_course');
    }

    // Certificate badge - check if any certificate entries exist
    const hasCertificate = completedSections.some((id: string) => id.includes('certificate'));
    if (hasCertificate) {
      earned.push('certificate_earner');
    }

    return earned;
  }, [learningProgress]);

  // Calculate total points
  const getTotalPoints = useCallback((earnedBadgeIds: string[]): number => {
    return BADGE_DEFINITIONS
      .filter((badge) => earnedBadgeIds.includes(badge.id))
      .reduce((sum, badge) => sum + badge.points, 0);
  }, []);

  // Calculate level from points
  const getLevelFromPoints = useCallback((points: number): { level: number; title: string } => {
    // Simple level calculation: every 100 points = 1 level
    const level = Math.floor(points / 100) + 1;
    const title = LEVEL_TITLES[Math.min(level, 10)] || '学习者';
    return { level, title };
  }, []);

  // Award a badge (to be called when achievement is unlocked)
  const awardBadge = useCallback(
    (badgeId: string) => {
      const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
      if (badge) {
        trackEvent('badge_earned' as any, {
          badgeId,
          badgeName: badge.name,
          badgeRarity: badge.rarity,
          points: badge.points,
        });
      }
    },
    [trackEvent]
  );

  return {
    badgeDefinitions: BADGE_DEFINITIONS,
    getEarnedBadges,
    getTotalPoints,
    getLevelFromPoints,
    awardBadge,
  };
}

export default BadgeGallery;