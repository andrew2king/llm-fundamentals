/**
 * Referral System Components
 *
 * User referral and invitation functionality:
 * - Generate unique referral links
 * - Track referral signups
 * - Display referral rewards
 */

import { useState, useCallback, useEffect } from 'react';
import { Gift, Link, Users, Copy, Check, Share2, ChevronRight } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

// ============================================
// Types
// ============================================

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  earnedRewards: number;
  referralLink: string;
}

interface ReferralReward {
  id: string;
  name: string;
  description: string;
  requiredReferrals: number;
  icon: React.ReactNode;
  claimed: boolean;
}

// ============================================
// Referral Link Generator
// ============================================

interface ReferralLinkProps {
  referralCode?: string;
  onGenerateCode?: () => Promise<string>;
  className?: string;
}

export function ReferralLink({
  referralCode: initialCode,
  onGenerateCode,
  className = '',
}: ReferralLinkProps) {
  const [referralCode, setReferralCode] = useState(initialCode || '');
  const [copied, setCopied] = useState(false);
  const { trackShare, trackCTA } = useAnalytics();

  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}`
    : '';

  const generateCode = useCallback(async () => {
    if (onGenerateCode) {
      const code = await onGenerateCode();
      setReferralCode(code);
    } else {
      // Generate a random code for demo
      const code = `LLM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setReferralCode(code);
    }

    trackCTA('generate_referral_code', 'referral_system', undefined, {});
  }, [onGenerateCode, trackCTA]);

  const copyLink = useCallback(async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      trackShare('achievement' as any, referralCode, 'copy_link', {
        referralLink,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [referralLink, referralCode, trackShare]);

  useEffect(() => {
    if (!referralCode) {
      generateCode();
    }
  }, [referralCode, generateCode]);

  return (
    <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Link className="w-4 h-4 text-spacex-orange" />
        <span className="text-sm font-medium">专属邀请链接</span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 px-4 py-3 bg-white/5 rounded-lg text-sm text-white/60 truncate">
          {referralLink || '生成中...'}
        </div>
        <button
          onClick={copyLink}
          disabled={!referralLink}
          className="px-4 py-3 min-w-[80px] rounded-lg bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-white/40 mt-3">
        分享此链接，好友注册后你们都将获得奖励
      </p>
    </div>
  );
}

// ============================================
// Referral Stats Card
// ============================================

interface ReferralStatsCardProps {
  stats: ReferralStats;
  className?: string;
}

export function ReferralStatsCard({ stats, className = '' }: ReferralStatsCardProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
        <div className="text-sm text-white/60">邀请人数</div>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-green-500">{stats.successfulReferrals}</div>
        <div className="text-sm text-white/60">成功注册</div>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-yellow-500">{stats.pendingRewards}</div>
        <div className="text-sm text-white/60">待领取奖励</div>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-2xl font-bold text-spacex-orange">{stats.earnedRewards}</div>
        <div className="text-sm text-white/60">已获得奖励</div>
      </div>
    </div>
  );
}

// ============================================
// Referral Rewards List
// ============================================

const DEFAULT_REWARDS: ReferralReward[] = [
  {
    id: 'reward-1',
    name: '优惠券 ¥10',
    description: '任意课程使用',
    requiredReferrals: 1,
    icon: <Gift className="w-6 h-6" />,
    claimed: false,
  },
  {
    id: 'reward-2',
    name: '优惠券 ¥30',
    description: '任意课程使用',
    requiredReferrals: 3,
    icon: <Gift className="w-6 h-6" />,
    claimed: false,
  },
  {
    id: 'reward-3',
    name: '免费课程',
    description: '任选一门免费课程',
    requiredReferrals: 5,
    icon: <Gift className="w-6 h-6" />,
    claimed: false,
  },
  {
    id: 'reward-4',
    name: 'VIP会员',
    description: '30天VIP会员权益',
    requiredReferrals: 10,
    icon: <Gift className="w-6 h-6" />,
    claimed: false,
  },
];

interface ReferralRewardsProps {
  rewards?: ReferralReward[];
  currentReferrals: number;
  onClaimReward?: (rewardId: string) => void;
  className?: string;
}

export function ReferralRewards({
  rewards = DEFAULT_REWARDS,
  currentReferrals,
  onClaimReward,
  className = '',
}: ReferralRewardsProps) {
  const { trackCTA } = useAnalytics();

  const handleClaim = useCallback(
    (rewardId: string) => {
      if (onClaimReward) {
        onClaimReward(rewardId);
      }

      trackCTA('claim_referral_reward', 'referral_system', undefined, {
        rewardId,
        currentReferrals,
      });
    },
    [onClaimReward, currentReferrals, trackCTA]
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-spacex-orange" />
        <h3 className="font-bold">邀请奖励</h3>
      </div>

      <div className="space-y-3">
        {rewards.map((reward) => {
          const canClaim = currentReferrals >= reward.requiredReferrals && !reward.claimed;
          const progress = Math.min(100, (currentReferrals / reward.requiredReferrals) * 100);

          return (
            <div
              key={reward.id}
              className={`p-4 rounded-xl border transition-colors ${
                reward.claimed
                  ? 'bg-green-500/10 border-green-500/30'
                  : canClaim
                  ? 'bg-spacex-orange/10 border-spacex-orange/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    reward.claimed
                      ? 'bg-green-500/20 text-green-500'
                      : canClaim
                      ? 'bg-spacex-orange/20 text-spacex-orange'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {reward.icon}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-medium">{reward.name}</div>
                  <div className="text-sm text-white/60">{reward.description}</div>

                  {/* Progress */}
                  {!reward.claimed && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                        <span>
                          {currentReferrals} / {reward.requiredReferrals} 人
                        </span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            canClaim ? 'bg-spacex-orange' : 'bg-white/40'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action */}
                {reward.claimed ? (
                  <div className="text-sm text-green-500 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    已领取
                  </div>
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaim(reward.id)}
                    className="px-4 py-2 min-h-[36px] rounded-lg bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors flex items-center gap-1"
                  >
                    领取
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-sm text-white/40">
                    还差 {reward.requiredReferrals - currentReferrals} 人
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Referral Invitation Card
// ============================================

interface ReferralInvitationCardProps {
  inviterName?: string;
  rewardDescription?: string;
  onAccept?: () => void;
  className?: string;
}

export function ReferralInvitationCard({
  inviterName = '朋友',
  rewardDescription = '注册即获得 ¥10 优惠券',
  onAccept,
  className = '',
}: ReferralInvitationCardProps) {
  const { trackCTA } = useAnalytics();

  const handleAccept = useCallback(() => {
    trackCTA('accept_referral', 'referral_invitation', undefined, {
      inviterName,
    });

    if (onAccept) {
      onAccept();
    }
  }, [inviterName, onAccept, trackCTA]);

  return (
    <div
      className={`p-6 rounded-2xl bg-gradient-to-br from-spacex-orange/20 to-orange-600/10 border border-spacex-orange/30 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-spacex-orange flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold">来自 {inviterName} 的邀请</div>
          <div className="text-sm text-white/60">加入 LLM基础 学习平台</div>
        </div>
      </div>

      <p className="text-white/80 mb-4">
        你的朋友 <span className="font-medium">{inviterName}</span> 邀请你加入 LLM基础 学习平台。
        {rewardDescription && (
          <span className="text-spacex-orange"> {rewardDescription}</span>
        )}
      </p>

      <button
        onClick={handleAccept}
        className="w-full py-3 min-h-[44px] rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors flex items-center justify-center gap-2"
      >
        <Users className="w-4 h-4" />
        接受邀请
      </button>

      <p className="text-xs text-white/40 text-center mt-3">
        接受邀请后，你和邀请人都将获得奖励
      </p>
    </div>
  );
}

// ============================================
// Share to Friends Component
// ============================================

interface ShareToFriendsProps {
  referralCode: string;
  message?: string;
  className?: string;
}

export function ShareToFriends({
  referralCode,
  message = '我在 LLM基础 学习平台上学习 LLM 相关知识，邀请你一起加入！',
  className = '',
}: ShareToFriendsProps) {
  const { trackShare } = useAnalytics();

  const shareMethods = [
    {
      id: 'wechat',
      name: '微信',
      action: () => {
        trackShare('achievement' as any, referralCode, 'wechat', {});
        // In real app, would use WeChat JS-SDK
        alert('请复制链接后在微信中分享');
      },
    },
    {
      id: 'weibo',
      name: '微博',
      action: () => {
        trackShare('achievement' as any, referralCode, 'weibo', {});
        const url = `${window.location.origin}/?ref=${referralCode}`;
        window.open(
          `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(message)}`,
          'share',
          'width=600,height=400'
        );
      },
    },
  ];

  return (
    <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-spacex-orange" />
        <span className="text-sm font-medium">分享给好友</span>
      </div>

      <div className="flex gap-2">
        {shareMethods.map((method) => (
          <button
            key={method.id}
            onClick={method.action}
            className="flex-1 py-3 min-h-[44px] rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            {method.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Hook for Referral Management
// ============================================

export function useReferral() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({
    referralCode: '',
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingRewards: 0,
    earnedRewards: 0,
    referralLink: '',
  });

  // Generate referral code
  const generateReferralCode = useCallback(async (): Promise<string> => {
    // In production, this would call an API
    const code = `LLM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setReferralCode(code);
    setStats((prev) => ({
      ...prev,
      referralCode: code,
      referralLink: `${window.location.origin}/?ref=${code}`,
    }));
    return code;
  }, []);

  // Check for referral parameter in URL
  const checkReferralParam = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  }, []);

  // Track referral conversion
  const trackReferralConversion = useCallback(
    (referralCode: string) => {
      // In production, this would call an API
      console.log('Referral conversion tracked:', referralCode);
    },
    []
  );

  return {
    referralCode,
    stats,
    generateReferralCode,
    checkReferralParam,
    trackReferralConversion,
  };
}

export default ReferralLink;