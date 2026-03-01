import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Play, Wrench, Users, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const resources = [
  {
    icon: FileText,
    title: '研究论文',
    description:
      '关于Transformer、GPT和其他LLM架构的开创性研究论文，深入理解技术原理。',
    category: '论文',
  },
  {
    icon: Play,
    title: '在线课程',
    description:
      '学习深度学习、NLP和Transformer模型的优质课程，从入门到精通。',
    category: '课程',
  },
  {
    icon: Wrench,
    title: '交互式工具',
    description:
      '使用这些工具尝试LLM并可视化其工作原理，动手实践加深理解。',
    category: '工具',
  },
  {
    icon: Users,
    title: '社区',
    description:
      '加入讨论、提问并向AI从业者学习，与志同道合的人一起成长。',
    category: '社区',
  },
];

export default function Resources() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      // Content animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: contentRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              contentRef.current,
              { x: -50, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }
            );
          },
          once: true,
        })
      );

      // Cards animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: 'top 80%',
          onEnter: () => {
            const cards = cardsRef.current?.querySelectorAll('.resource-card');
            if (cards && cards.length > 0) {
              gsap.fromTo(
                cards,
                { scale: 0.9, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.6,
                  stagger: 0.1,
                  ease: 'expo.out',
                }
              );
            }
          },
          once: true,
        })
      );

      // Parallax
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            if (contentRef.current) {
              gsap.set(contentRef.current, {
                y: (self.progress - 0.5) * 40,
              });
            }
            if (cardsRef.current) {
              gsap.set(cardsRef.current, {
                y: (0.5 - self.progress) * 40,
              });
            }
          },
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
      id="resources"
      className="relative py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          {/* Content */}
          <div ref={contentRef} className="lg:col-span-2 opacity-0">
            <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-6">
              <span>06</span>
              <span className="w-8 h-[1px] bg-spacex-orange" />
              <span>资源</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              继续探索
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-8">
              通过我们精选的资源，深入了解大语言模型的世界。从研究论文到交互式工具，找到适合你的学习路径。
            </p>
            <div className="flex items-center gap-2 text-spacex-orange">
              <span className="w-12 h-[2px] bg-spacex-orange" />
              <span className="text-sm font-medium">持续更新</span>
            </div>
          </div>

          {/* Cards */}
          <div
            ref={cardsRef}
            className="lg:col-span-3 grid sm:grid-cols-2 gap-5"
          >
            {resources.map((resource, index) => (
              <button
                key={index}
                onClick={() => {
                  localStorage.setItem('llm_resource_category', resource.category);
                  const element = document.querySelector('#resource-library');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="resource-card group relative p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300 opacity-0 text-left"
              >
                {/* Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-spacex-orange/20 transition-colors duration-300">
                    <resource.icon className="w-6 h-6 text-white/70 group-hover:text-spacex-orange transition-colors duration-300" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-spacex-orange group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-spacex-orange transition-colors duration-300">
                  {resource.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {resource.description}
                </p>

                {/* Hover glow */}
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-spacex-blue to-spacex-orange opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300 -z-10" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
