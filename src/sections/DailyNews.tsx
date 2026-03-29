import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Newspaper, BookOpen, ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import type { DailyData, DailyNewsItem, DailyPaperItem } from '@/types/daily';
import { getLatestDaily, formatDate, getRelativeTime } from '@/lib/daily';

gsap.registerPlugin(ScrollTrigger);

// 默认数据（用于开发/无数据时显示）
const DEFAULT_DATA: DailyData = {
  date: new Date().toISOString().split('T')[0],
  title: 'AI日报',
  summary: '每日精选 AI 行业资讯与论文',
  news: [],
  papers: [],
};

export default function DailyNews() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dailyData, setDailyData] = useState<DailyData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 加载日报数据
    const loadDaily = async () => {
      const data = await getLatestDaily();
      if (data) {
        setDailyData(data);
      }
      setIsLoading(false);
    };
    loadDaily();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Entry animation
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading]);

  const hasData = dailyData.news.length > 0 || dailyData.papers.length > 0;

  return (
    <section
      ref={sectionRef}
      id="daily-news"
      className="relative py-24 bg-black overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(0, 82, 136, 0.1) 0%, transparent 50%)',
          }}
        />
      </div>

      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Newspaper className="w-4 h-4 text-spacex-orange" />
              <span className="text-sm font-medium text-white/80">
                每日更新
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {dailyData.title}
            </h2>
            <p className="text-white/60 max-w-xl">
              {dailyData.summary}
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center gap-3 text-white/50">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {isLoading ? '加载中...' : formatDate(dailyData.date)}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
              {getRelativeTime(dailyData.date)}
            </span>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-spacex-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="text-center py-20 text-white/50">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>今日日报正在准备中...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* News Section */}
            {dailyData.news.length > 0 && (
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-spacex-orange/20 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-spacex-orange" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    行业新闻
                  </h3>
                  <span className="ml-auto text-xs text-white/40">
                    {dailyData.news.length} 条
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  {dailyData.news.map((item, index) => (
                    <NewsCard key={item.id} item={item} index={index + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Papers Section */}
            {dailyData.papers.length > 0 && (
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    arXiv 论文
                  </h3>
                  <span className="ml-auto text-xs text-white/40">
                    {dailyData.papers.length} 篇
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  {dailyData.papers.map((item, index) => (
                    <PaperCard key={item.id} item={item} index={index + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Archive Link */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 hover:text-white transition-all duration-300 group">
            <Calendar className="w-4 h-4" />
            <span>查看历史日报</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}

// News Card Component
function NewsCard({ item, index }: { item: DailyNewsItem; index: number }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-spacex-orange/20 text-spacex-orange text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium leading-snug mb-2 group-hover:text-spacex-orange transition-colors">
            {item.title}
          </h4>
          <p className="text-white/60 text-sm leading-relaxed mb-3 line-clamp-2">
            {item.summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              {item.source}
            </span>
            <span>·</span>
            <span>{item.publishedAt}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

// Paper Card Component
function PaperCard({ item, index }: { item: DailyPaperItem; index: number }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium leading-snug mb-2 group-hover:text-blue-400 transition-colors">
            {item.title}
          </h4>
          <p className="text-white/60 text-sm leading-relaxed mb-3 line-clamp-2">
            {item.summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              arXiv
            </span>
            <span>·</span>
            <span>{item.publishedAt}</span>
          </div>
        </div>
      </div>
    </a>
  );
}