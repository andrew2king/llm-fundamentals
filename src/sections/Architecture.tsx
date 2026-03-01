import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const components = [
  {
    title: '输入嵌入',
    description: '将输入token转换为密集矢量表示',
    detail: '为位置信息添加位置编码',
  },
  {
    title: '注意力头',
    description: '计算token之间的注意力分数',
    detail: '多头注意力允许关注不同方面',
  },
  {
    title: '前馈网络',
    description: '独立处理每个位置',
    detail: '应用非线性变换',
  },
  {
    title: '层归一化',
    description: '稳定训练过程',
    detail: '归一化跨特征的值',
  },
];

export default function Architecture() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const componentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      // Image animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: imageRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              imageRef.current,
              { scale: 1.1, opacity: 0 },
              { scale: 1, opacity: 1, duration: 1, ease: 'expo.out' }
            );
          },
          once: true,
        })
      );

      // Content slide in
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: contentRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              contentRef.current,
              { x: 100, opacity: 0, filter: 'blur(10px)' },
              {
                x: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.8,
                ease: 'expo.out',
                delay: 0.3,
              }
            );
          },
          once: true,
        })
      );

      // Components stagger
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: componentsRef.current,
          start: 'top 80%',
          onEnter: () => {
            const items = componentsRef.current?.querySelectorAll('.component-item');
            if (items && items.length > 0) {
              gsap.fromTo(
                items,
                { x: 50, opacity: 0 },
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.6,
                  stagger: 0.15,
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
            if (imageRef.current) {
              gsap.set(imageRef.current, {
                y: (self.progress - 0.5) * 80,
              });
            }
            if (contentRef.current) {
              gsap.set(contentRef.current, {
                y: (self.progress - 0.5) * 40,
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
      id="architecture"
      className="relative py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative rounded-2xl overflow-hidden opacity-0"
          >
            <img
              src="/transformer-arch.jpg"
              alt="Transformer Architecture"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/50" />

            {/* Animated overlay lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 300"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M0 150 Q100 100 200 150 T400 150"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="8 8"
                className="animate-pulse"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#005288" stopOpacity="0" />
                  <stop offset="50%" stopColor="#005288" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="relative lg:-ml-20 bg-black/80 backdrop-blur-xl p-8 lg:p-12 rounded-2xl border border-white/10 opacity-0"
            style={{ transform: 'rotateY(-3deg)', transformStyle: 'preserve-3d' }}
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-6">
              <span>03</span>
              <span className="w-8 h-[1px] bg-spacex-orange" />
              <span>架构</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Transformer
              <br />
              <span className="text-gradient">架构</span>
            </h2>

            {/* Description */}
            <p className="text-white/70 leading-relaxed mb-8">
              Transformer架构通过引入自注意力机制，彻底改变了自然语言处理，使模型能够处理长距离依赖关系，并行处理序列数据。
            </p>

            {/* Components */}
            <div ref={componentsRef} className="space-y-4">
              {components.map((component, index) => (
                <div
                  key={index}
                  className="component-item group p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300 cursor-pointer opacity-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-spacex-blue/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-spacex-orange/30 transition-colors duration-300">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 group-hover:text-spacex-orange transition-colors duration-300">
                        {component.title}
                      </h4>
                      <p className="text-sm text-white/60 mb-1">
                        {component.description}
                      </p>
                      <p className="text-xs text-white/40">{component.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button className="mt-8 group flex items-center gap-2 text-spacex-orange hover:text-white transition-colors duration-300">
              <span className="font-medium">深入了解架构</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
