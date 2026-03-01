import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Database, Layers, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Brain,
    text: '基于预测下一个词的原理',
  },
  {
    icon: Database,
    text: '在大量文本数据上训练',
  },
  {
    icon: Layers,
    text: '使用Transformer架构',
  },
  {
    icon: MessageSquare,
    text: '可以生成类似人类的文本',
  },
];

export default function WhatIsLLM() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const definitionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      // Label animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: labelRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              labelRef.current,
              { x: -30, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }
            );
          },
          once: true,
        })
      );

      // Title animation with word split
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: titleRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              titleRef.current,
              { y: 50, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
            );
          },
          once: true,
        })
      );

      // Definition box animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: definitionRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              definitionRef.current,
              { scale: 0.9, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }
            );
          },
          once: true,
        })
      );

      // Content animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: contentRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              contentRef.current,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.2 }
            );
          },
          once: true,
        })
      );

      // Features stagger animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: featuresRef.current,
          start: 'top 80%',
          onEnter: () => {
            const items = featuresRef.current?.querySelectorAll('.feature-item');
            if (items && items.length > 0) {
              gsap.fromTo(
                items,
                { x: -40, opacity: 0 },
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.5,
                  stagger: 0.1,
                  ease: 'expo.out',
                }
              );
            }
          },
          once: true,
        })
      );

      // Image 3D rotation animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: imageRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              imageRef.current,
              { rotateY: -30, x: 100, opacity: 0 },
              { rotateY: 0, x: 0, opacity: 1, duration: 1, ease: 'expo.out' }
            );
          },
          once: true,
        })
      );

      // Parallax effect
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            if (imageRef.current) {
              gsap.set(imageRef.current, {
                y: (self.progress - 0.5) * 100,
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
      id="concepts"
      className="relative py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="relative z-10">
            {/* Label */}
            <div
              ref={labelRef}
              className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-6 opacity-0"
            >
              <span>01</span>
              <span className="w-8 h-[1px] bg-spacex-orange" />
              <span>基础</span>
            </div>

            {/* Title */}
            <h2
              ref={titleRef}
              className="text-4xl md:text-5xl font-bold mb-8 opacity-0"
            >
              什么是
              <br />
              <span className="text-gradient">大语言模型？</span>
            </h2>

            {/* Definition Box */}
            <div
              ref={definitionRef}
              className="relative p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 mb-8 opacity-0"
            >
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-spacex-blue to-spacex-orange opacity-30 blur-sm" />
              <p className="relative text-lg font-medium leading-relaxed">
                大语言模型（LLM）是一种人工智能系统，通过从大量文本数据中学习模式和关系，来预测序列中的下一个词。
              </p>
            </div>

            {/* Description */}
            <div ref={contentRef} className="opacity-0">
              <p className="text-white/70 leading-relaxed mb-8">
                LLM使用深度学习技术，特别是Transformer架构，来处理和生成类似人类的文本。它们在来自书籍、文章、网站和其他来源的数十亿字上进行训练，从而掌握语言的复杂模式和结构。
              </p>
            </div>

            {/* Features */}
            <div ref={featuresRef} className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-item flex items-center gap-4 group opacity-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-spacex-orange/20 group-hover:border-spacex-orange/50 transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-white/70 group-hover:text-spacex-orange transition-colors duration-300" />
                  </div>
                  <span className="text-white/80 group-hover:text-white transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div
            ref={imageRef}
            className="relative lg:-mr-16 opacity-0"
            style={{ perspective: '1000px' }}
          >
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/llm-concept.jpg"
                alt="AI Brain Visualization"
                className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-spacex-blue/10" />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-spacex-blue/20 blur-[80px] rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
