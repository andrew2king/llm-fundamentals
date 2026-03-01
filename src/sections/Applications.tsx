import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PenTool,
  Code2,
  Headphones,
  Globe,
  Search,
  GraduationCap,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const applications = [
  {
    icon: PenTool,
    title: '内容创作',
    description:
      '生成文章、故事、营销文案、社交媒体帖子等，大幅提升创作效率。',
  },
  {
    icon: Code2,
    title: '代码辅助',
    description:
      '编写、调试和解释各种编程语言的代码，是开发者的得力助手。',
  },
  {
    icon: Headphones,
    title: '客户支持',
    description:
      '为查询提供即时、准确的响应，全天候服务，提升客户满意度。',
  },
  {
    icon: Globe,
    title: '语言翻译',
    description: '以自然流畅的方式在语言之间翻译文本，打破语言障碍。',
  },
  {
    icon: Search,
    title: '研究与分析',
    description: '总结研究论文、分析数据并提取见解，加速科研进程。',
  },
  {
    icon: GraduationCap,
    title: '教育辅导',
    description: '以个性化方式解释概念并回答学生问题，实现因材施教。',
  },
];

export default function Applications() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      // Header animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: headerRef.current,
          start: 'top 80%',
          onEnter: () => {
            const items = headerRef.current?.querySelectorAll('.header-item');
            if (items && items.length > 0) {
              gsap.fromTo(
                items,
                { y: 30, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.6,
                  stagger: 0.08,
                  ease: 'expo.out',
                }
              );
            }
          },
          once: true,
        })
      );

      // Cards 3D rise animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: 'top 80%',
          onEnter: () => {
            const cards = cardsRef.current?.querySelectorAll('.app-card');
            cards?.forEach((card, index) => {
              gsap.fromTo(
                card,
                { y: 80, rotateX: 15, opacity: 0 },
                {
                  y: 0,
                  rotateX: 2,
                  opacity: 1,
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: 'expo.out',
                }
              );
            });
          },
          once: true,
        })
      );

      return () => {
        scrollTriggers.forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="applications"
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/applications.jpg"
          alt="Applications"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div className="header-item inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-6 opacity-0">
            <span>05</span>
            <span className="w-8 h-[1px] bg-spacex-orange" />
            <span>应用</span>
          </div>
          <h2 className="header-item text-4xl md:text-5xl font-bold mb-6 opacity-0">
            现实世界的应用
          </h2>
          <p className="header-item text-lg text-white/60 max-w-2xl mx-auto opacity-0">
            大语言模型正在改变各行各业，赋能新能力，推动数字化转型。
          </p>
        </div>

        {/* Cards Grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ perspective: '1000px' }}
        >
          {applications.map((app, index) => (
            <div
              key={index}
              className="app-card group relative p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.08] hover:border-spacex-orange/50 opacity-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg)',
              }}
            >
              {/* Hover effect */}
              <div
                className="absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"
                style={{
                  transform: 'translateZ(30px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                }}
              />

              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-spacex-blue/30 to-spacex-orange/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-300">
                  <app.icon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 w-14 h-14 rounded-xl bg-spacex-orange/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-spacex-orange transition-colors duration-300">
                {app.title}
              </h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {app.description}
              </p>

              {/* Border glow on hover */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-spacex-blue to-spacex-orange opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
