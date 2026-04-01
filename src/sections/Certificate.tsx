import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Download, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

gsap.registerPlugin(ScrollTrigger);

export default function Certificate() {
  const sectionRef = useRef<HTMLElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const userContext = useUser();
  const [copied, setCopied] = useState(false);
  // 使用 useState 懒初始化，只在首次渲染时生成证书 ID
  const [certificateId] = useState(() => `LLM-${Date.now().toString(36).toUpperCase()}`);

  // 防御性获取数据
  const user = userContext?.user;
  const getOverallProgress = userContext?.getOverallProgress || (() => 0);
  const learningProgress = userContext?.learningProgress;

  const overallProgress = getOverallProgress();
  const canGetCertificate = overallProgress >= 80;
  const completedCount = learningProgress?.completedSections?.length || 0;

  const userName = user?.name || '学习者';
  const certificateDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.cert-item');
          if (items && items.length > 0) {
            gsap.fromTo(
              items,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }
            );
          }
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleDownload = async () => {
    // In a real implementation, this would generate a PNG/PDF of the certificate
    // For now, we'll just show a success message
    alert('证书下载功能即将上线！请联系管理员获取正式证书。');
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    const text = `我刚刚完成了 LLM基础 学习课程，获得了学习证书！已完成 ${completedCount} 个模块的学习。`;
    const url = window.location.origin;

    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!canGetCertificate) {
    return (
      <section ref={sectionRef} id="certificate" className="relative py-32 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="cert-item opacity-0">
            <Award className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">学习证书</h2>
            <p className="text-white/60 mb-4">
              完成 80% 以上的学习内容即可获得学习证书
            </p>
            <p className="text-white/40 text-sm">
              当前进度：{overallProgress}%
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="certificate" className="relative py-32 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="cert-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Award className="w-4 h-4" />
            <span>学习证书</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            恭喜<span className="text-gradient">完成学习</span>
          </h2>
          <p className="text-white/60">
            你已完成 LLM 基础课程的学习，以下是你的专属证书
          </p>
        </div>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="cert-item relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-spacex-orange/30 p-8 md:p-12 opacity-0"
        >
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-spacex-orange rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-spacex-orange rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-spacex-orange rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-spacex-orange rounded-br-2xl" />

          {/* Content */}
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L28 8V24L16 30L4 24V8L16 2Z"
                  stroke="url(#cert-gradient)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path d="M16 8L22 11V21L16 24L10 21V11L16 8Z" fill="white" />
                <defs>
                  <linearGradient id="cert-gradient" x1="4" y1="2" x2="28" y2="30">
                    <stop stopColor="#FF6B35" />
                    <stop offset="1" stopColor="#005288" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2">学习证书</h1>
            <p className="text-white/60 text-sm mb-8">CERTIFICATE OF COMPLETION</p>

            <p className="text-white/70 mb-2">兹证明</p>
            <h2 className="text-3xl md:text-4xl font-bold text-spacex-orange mb-4">
              {userName}
            </h2>
            <p className="text-white/70 mb-8">
              已完成「LLM基础」课程学习，掌握了 {completedCount} 个核心模块的知识内容。
            </p>

            <div className="flex justify-center gap-8 text-sm text-white/50 mb-8">
              <div>
                <p className="font-medium text-white/70">完成日期</p>
                <p>{certificateDate}</p>
              </div>
              <div>
                <p className="font-medium text-white/70">证书编号</p>
                <p className="font-mono">{certificateId}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="text-center">
                <div className="w-24 h-0.5 bg-spacex-orange mx-auto mb-2" />
                <p className="text-sm text-white/70">LLM基础 学习平台</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="cert-item flex flex-wrap justify-center gap-4 mt-8 opacity-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            下载证书
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare('twitter')}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="分享到 Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="分享到 LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="复制链接"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}