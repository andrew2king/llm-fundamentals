import { Skeleton } from '@/components/ui/skeleton';

interface SectionSkeletonProps {
  /** 标题高度，默认 h-12 */
  titleHeight?: string;
  /** 是否显示副标题 */
  showSubtitle?: boolean;
  /** 卡片数量，默认 3 */
  cardCount?: number;
  /** 卡片布局方式 */
  layout?: 'grid' | 'flex';
  /** 最小高度 */
  minHeight?: string;
  /** 额外类名 */
  className?: string;
}

/**
 * Section 加载骨架屏组件
 * 用于代码分割时的加载占位
 */
export default function SectionSkeleton({
  titleHeight = 'h-12',
  showSubtitle = true,
  cardCount = 3,
  layout = 'grid',
  minHeight = 'min-h-[400px]',
  className = '',
}: SectionSkeletonProps) {
  return (
    <section className={`relative py-32 overflow-hidden ${minHeight} ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          {/* Label */}
          <Skeleton className="h-6 w-24 mx-auto mb-4 rounded-full" />

          {/* Title */}
          <Skeleton className={`${titleHeight} w-2/3 mx-auto mb-4`} />

          {/* Subtitle */}
          {showSubtitle && <Skeleton className="h-6 w-1/2 mx-auto" />}
        </div>

        {/* Content Skeleton */}
        {layout === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
              >
                {/* Icon */}
                <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                {/* Title */}
                <Skeleton className="h-6 w-3/4 mb-2" />
                {/* Description */}
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-5 justify-center">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
              >
                <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Hero Section 骨架屏
 */
export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="max-w-2xl">
          <Skeleton className="h-8 w-40 rounded-full mb-8" />
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-20 w-3/4 mb-10" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-5/6 mb-10" />
          <div className="flex gap-4">
            <Skeleton className="h-14 w-32 rounded" />
            <Skeleton className="h-14 w-32 rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Quiz Section 骨架屏
 */
export function QuizSkeleton() {
  return (
    <section className="relative py-32">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <Skeleton className="h-6 w-24 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-12 w-2/3 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10">
          <Skeleton className="h-8 w-full mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}