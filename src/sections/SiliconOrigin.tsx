import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Cpu, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SiliconOrigin() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(contentRef.current, { opacity: 0, y: 50 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(contentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'expo.out',
          });
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="silicon-origin"
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(0,82,136,0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,107,53,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={contentRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-spacex-orange" />
            <span className="text-sm font-medium text-white/80">内容品牌</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            关注「硅基起源」
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            深度AI技术分析、行业洞察、前沿趋势解读
            <br />
            与LLM101学习平台深度联动，提供技术干货与行业洞察
          </p>
        </div>

        {/* QR Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
          {/* 公众号 */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-spacex-orange/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-spacex-orange" />
            </div>
            <h3 className="text-lg font-semibold mb-2">微信公众号</h3>
            <p className="text-white/50 text-sm mb-4">搜索"硅基起源"关注</p>
            <div className="bg-white rounded-lg p-3 inline-block">
              <img
                src="/公众号二维码.JPG"
                alt="硅基起源公众号二维码"
                className="w-28 h-28 rounded"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-white/40 mt-4">AI技术深度分析 · 行业洞察</p>
          </div>

          {/* 视频号 */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-spacex-blue/20 flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-6 h-6 text-spacex-blue" />
            </div>
            <h3 className="text-lg font-semibold mb-2">微信视频号</h3>
            <p className="text-white/50 text-sm mb-4">搜索"硅基起源"关注</p>
            <div className="bg-white rounded-lg p-3 inline-block">
              <img
                src="/视频号二维码.JPG"
                alt="硅基起源视频号二维码"
                className="w-28 h-28 rounded"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-white/40 mt-4">AI前沿视频 · 技术分享</p>
          </div>
        </div>

        {/* Description Card */}
        <div className="max-w-2xl mx-auto bg-white/[0.02] border border-white/5 rounded-lg p-6">
          <p className="text-white/70 text-center leading-relaxed">
            「硅基起源」专注AI领域深度内容，涵盖大模型、AIGC、智能体、算力基础设施等前沿话题。
            由亿喆科技团队运营，与Oak智算云业务深度联动，为企业数字化转型提供技术支撑与知识服务。
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="https://52oak.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              了解亿喆科技企业服务
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}