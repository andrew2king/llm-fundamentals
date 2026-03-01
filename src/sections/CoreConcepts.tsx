import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Grid3X3,
  Focus,
  Layers,
  Puzzle,
  PanelTop,
  SlidersHorizontal,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const concepts = [
  {
    icon: Grid3X3,
    title: '词嵌入',
    description:
      '词被转换为高维矢量，以数学形式捕捉语义含义，让计算机能够理解语言。',
  },
  {
    icon: Focus,
    title: '注意力机制',
    description:
      '模型权衡不同词之间的重要性，以理解上下文和关系，是Transformer的核心。',
  },
  {
    icon: Layers,
    title: 'Transformer',
    description:
      '处理输入数据的神经网络架构，使用自注意力机制，彻底改变了NLP领域。',
  },
  {
    icon: Puzzle,
    title: 'Token',
    description:
      '文本被分解成的小单元，可以是词、字符或子词，是模型处理的基本单位。',
  },
  {
    icon: PanelTop,
    title: '上下文窗口',
    description:
      '模型一次可以处理的token数量，决定其理解长文本和保持连贯性的能力。',
  },
  {
    icon: SlidersHorizontal,
    title: '微调',
    description:
      '在特定数据集上调整预训练模型，以专门化其行为，适应特定任务需求。',
  },
];

export default function CoreConcepts() {
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

      // Cards 3D flip animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: 'top 80%',
          onEnter: () => {
            const cards = cardsRef.current?.querySelectorAll('.concept-card');
            cards?.forEach((card, index) => {
              const direction = index % 2 === 0 ? -90 : 90;
              gsap.fromTo(
                card,
                { rotateY: direction, opacity: 0 },
                {
                  rotateY: index % 2 === 0 ? 3 : -3,
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
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div className="header-item inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-6 opacity-0">
            <span>02</span>
            <span className="w-8 h-[1px] bg-spacex-orange" />
            <span>关键概念</span>
          </div>
          <h2 className="header-item text-4xl md:text-5xl font-bold mb-6 opacity-0">
            核心概念
          </h2>
          <p className="header-item text-lg text-white/60 max-w-2xl mx-auto opacity-0">
            理解构成大语言模型基础的基本构建模块，掌握AI的核心技术原理。
          </p>
        </div>

        {/* Cards Grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ perspective: '1000px' }}
        >
          {concepts.map((concept, index) => (
            <div
              key={index}
              className="concept-card group relative p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.08] hover:border-spacex-orange/50 hover:-translate-y-3 opacity-0"
              style={{
                transformStyle: 'preserve-3d',
                transform:
                  index % 2 === 0
                    ? 'perspective(1000px) rotateY(3deg) rotateX(-2deg)'
                    : 'perspective(1000px) rotateY(-3deg) rotateX(2deg)',
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  style={{ transform: 'skewX(-15deg)' }}
                />
              </div>

              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-spacex-blue/30 to-spacex-orange/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <concept.icon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 w-14 h-14 rounded-xl bg-spacex-blue/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-spacex-orange transition-colors duration-300">
                {concept.title}
              </h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {concept.description}
              </p>

              {/* Hover border glow */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-spacex-blue to-spacex-orange opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
