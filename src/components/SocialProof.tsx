/**
 * Social Proof Components
 *
 * Displays social proof elements to build trust and encourage conversions.
 * Includes: user counts, ratings, testimonials, certifications.
 */

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Users, Star, Award, TrendingUp, CheckCircle, Globe } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

// ============================================
// Stats Counter Component
// ============================================

interface StatItem {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

interface StatsCounterProps {
  stats?: StatItem[];
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
  animated?: boolean;
}

const defaultStats: StatItem[] = [
  { icon: <Users className="w-6 h-6" />, value: 12500, label: '学习者', suffix: '+' },
  { icon: <Star className="w-6 h-6" />, value: 4.9, label: '平均评分', suffix: '/5' },
  { icon: <Award className="w-6 h-6" />, value: 3500, label: '证书颁发', suffix: '+' },
  { icon: <Globe className="w-6 h-6" />, value: 50, label: '覆盖国家', suffix: '+' },
];

export function StatsCounter({
  stats = defaultStats,
  variant = 'default',
  className = '',
  animated = true,
}: StatsCounterProps) {
  const [displayValues, setDisplayValues] = useState<number[]>(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { trackCTA } = useAnalytics();

  useEffect(() => {
    if (!animated || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Track stats view
            trackCTA('view_stats', 'social_proof', undefined, {
              statsCount: stats.length,
            });

            // Animate numbers
            stats.forEach((stat, index) => {
              const duration = 2000;
              const steps = 60;
              const increment = stat.value / steps;
              let current = 0;

              const timer = setInterval(() => {
                current += increment;
                if (current >= stat.value) {
                  current = stat.value;
                  clearInterval(timer);
                }
                setDisplayValues((prev: number[]) => {
                  const next = [...prev];
                  next[index] = Math.round(current * 10) / 10;
                  return next;
                });
              }, duration / steps);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animated, hasAnimated, stats, trackCTA]);

  if (variant === 'compact') {
    return (
      <div ref={ref} className={`flex items-center gap-6 ${className}`}>
        {stats.slice(0, 3).map((stat, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-spacex-orange">{stat.icon}</span>
            <span className="font-bold">
              {stat.prefix}
              {displayValues[index].toLocaleString()}
              {stat.suffix}
            </span>
            <span className="text-white/60 text-sm">{stat.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div ref={ref} className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-spacex-orange/20 text-spacex-orange mb-3">
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gradient">
              {stat.prefix}
              {displayValues[index].toLocaleString()}
              {stat.suffix}
            </div>
            <div className="text-white/60 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div ref={ref} className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="text-spacex-orange">{stat.icon}</div>
          <div>
            <div className="text-xl font-bold">
              {stat.prefix}
              {displayValues[index].toLocaleString()}
              {stat.suffix}
            </div>
            <div className="text-sm text-white/60">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Testimonials Component
// ============================================

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  courseName?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: '张工程师',
    role: 'AI工程师',
    company: '字节跳动',
    content: '课程内容非常系统，从基础到实战都有涵盖。Agent开发实战让我真正理解了如何构建生产级的AI应用。',
    rating: 5,
    courseName: 'Agent 开发实战',
  },
  {
    id: '2',
    name: '李产品',
    role: '产品经理',
    company: '阿里巴巴',
    content: '作为非技术背景的产品经理，这门课程让我能够更好地理解LLM的能力边界，与技术团队的沟通也更加顺畅了。',
    rating: 5,
    courseName: 'Prompt 工程进阶',
  },
  {
    id: '3',
    name: '王研究员',
    role: '算法研究员',
    company: '腾讯',
    content: 'RAG实战指南的内容深度和广度都很到位，尤其是评估和监控部分，对实际工作帮助很大。',
    rating: 5,
    courseName: 'RAG 实战指南',
  },
];

export function Testimonials({
  testimonials = defaultTestimonials,
  className = '',
}: TestimonialsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { trackCTA } = useAnalytics();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.testimonial-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  // Track testimonial view
  useEffect(() => {
    trackCTA('view_testimonial', 'social_proof', undefined, {
      testimonialCount: testimonials.length,
    });
  }, [testimonials.length, trackCTA]);

  return (
    <div ref={ref} className={`${className}`}>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="testimonial-card p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-spacex-orange/30 transition-colors"
          >
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < testimonial.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-white/80 mb-4 line-clamp-4">"{testimonial.content}"</p>

            {/* Course */}
            {testimonial.courseName && (
              <div className="text-xs text-spacex-orange mb-4">
                📚 {testimonial.courseName}
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spacex-orange to-orange-600 flex items-center justify-center text-white font-bold">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-sm text-white/60">
                  {testimonial.role}
                  {testimonial.company && ` @ ${testimonial.company}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Trust Badges Component
// ============================================

interface TrustBadge {
  icon: React.ReactNode;
  label: string;
  description?: string;
}

interface TrustBadgesProps {
  badges?: TrustBadge[];
  className?: string;
}

const defaultBadges: TrustBadge[] = [
  {
    icon: <CheckCircle className="w-5 h-5" />,
    label: '7天无理由退款',
    description: '不满意全额退款',
  },
  {
    icon: <Award className="w-5 h-5" />,
    label: '权威认证证书',
    description: '完成课程获证书',
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: '专属学习社群',
    description: '与同学交流互动',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    label: '持续更新',
    description: '课程内容持续迭代',
  },
];

export function TrustBadges({
  badges = defaultBadges,
  className = '',
}: TrustBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
        >
          <span className="text-spacex-orange">{badge.icon}</span>
          <span className="text-sm text-white/80">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Live Activity Indicator
// ============================================

interface LiveActivityProps {
  className?: string;
}

// Simulated recent activities
const recentActivities = [
  { action: '完成了课程', user: '张**', course: 'Agent 开发实战', time: '2分钟前' },
  { action: '获得了证书', user: '李**', course: 'RAG 实战指南', time: '5分钟前' },
  { action: '开始学习', user: '王**', course: 'Prompt 工程进阶', time: '8分钟前' },
  { action: '完成了课程', user: '赵**', course: 'Agent 开发实战', time: '12分钟前' },
  { action: '获得了证书', user: '陈**', course: 'Agent 开发实战', time: '15分钟前' },
];

export function LiveActivity({ className = '' }: LiveActivityProps) {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentActivity((prev: number) => (prev + 1) % recentActivities.length);
        setVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activity = recentActivities[currentActivity];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 ${className}`}
    >
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
      </div>
      <p
        className={`text-sm text-white/80 transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="font-medium">{activity.user}</span> {activity.action}{' '}
        <span className="text-spacex-orange">{activity.course}</span>
        <span className="text-white/40 ml-2">{activity.time}</span>
      </p>
    </div>
  );
}

// ============================================
// Rating Summary Component
// ============================================

interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: number[];
  className?: string;
}

export function RatingSummary({
  averageRating,
  totalRatings,
  ratingDistribution,
  className = '',
}: RatingSummaryProps) {
  return (
    <div className={`flex items-start gap-8 ${className}`}>
      {/* Average Rating */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gradient">{averageRating}</div>
        <div className="flex items-center justify-center gap-1 my-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(averageRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-white/20'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-white/60">{totalRatings.toLocaleString()} 评价</div>
      </div>

      {/* Rating Distribution */}
      <div className="flex-1 space-y-2">
        {ratingDistribution.map((count, index) => {
          const percentage = (count / totalRatings) * 100;
          const stars = 5 - index;

          return (
            <div key={index} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm text-white/60">{stars}</span>
                <Star className="w-3 h-3 text-white/40" />
              </div>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-white/40 w-10 text-right">
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatsCounter;