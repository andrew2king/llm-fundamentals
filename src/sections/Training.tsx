import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Database, Split, Brain, Sliders, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    title: '数据收集',
    description:
      '从书籍、网站、文章和其他来源收集数十亿字的文本数据，构建训练语料库。',
    icon: Database,
  },
  {
    number: '02',
    title: 'Tokenization',
    description:
      '将文本分解为token——词、子词或字符，供模型处理和理解。',
    icon: Split,
  },
  {
    number: '03',
    title: '预训练',
    description:
      '模型学习使用自监督学习预测序列中的下一个token，掌握语言的基本规律。',
    icon: Brain,
  },
  {
    number: '04',
    title: '微调',
    description:
      '在特定数据集上调整模型，以专门化其行为，适应特定任务需求。',
    icon: Sliders,
  },
  {
    number: '05',
    title: 'RLHF',
    description:
      '基于人类反馈的强化学习，使模型与人类偏好对齐，提升输出质量。',
    icon: Users,
  },
];

export default function Training() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

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

      // Timeline line draw
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: timelineRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              lineRef.current,
              { scaleY: 0 },
              { scaleY: 1, duration: 1.5, ease: 'expo.out', delay: 0.3 }
            );
          },
          once: true,
        })
      );

      // Steps animation
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: timelineRef.current,
          start: 'top 80%',
          onEnter: () => {
            const steps = timelineRef.current?.querySelectorAll('.step-item');
            steps?.forEach((step, index) => {
              const direction = index % 2 === 0 ? -80 : 80;
              gsap.fromTo(
                step,
                { x: direction, opacity: 0 },
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.7,
                  delay: 0.5 + index * 0.15,
                  ease: 'expo.out',
                }
              );
            });
          },
          once: true,
        })
      );

      // Step badges glow on scroll
      const stepBadges = timelineRef.current?.querySelectorAll('.step-badge');
      stepBadges?.forEach((badge) => {
        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: badge,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => {
              gsap.to(badge, {
                scale: 1.2,
                boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)',
                duration: 0.3,
                ease: 'expo.out',
              });
            },
            onLeave: () => {
              gsap.to(badge, {
                scale: 1,
                boxShadow: '0 0 0px rgba(255, 107, 53, 0)',
                duration: 0.3,
              });
            },
            onEnterBack: () => {
              gsap.to(badge, {
                scale: 1.2,
                boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)',
                duration: 0.3,
              });
            },
            onLeaveBack: () => {
              gsap.to(badge, {
                scale: 1,
                boxShadow: '0 0 0px rgba(255, 107, 53, 0)',
                duration: 0.3,
              });
            },
          })
        );
      });

      return () => {
        scrollTriggers.forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="training"
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/training-data.jpg"
          alt="Training Data"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20">
          <div className="header-item inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-6 opacity-0">
            <span>04</span>
            <span className="w-8 h-[1px] bg-spacex-orange" />
            <span>训练</span>
          </div>
          <h2 className="header-item text-4xl md:text-5xl font-bold mb-6 opacity-0">
            模型是如何训练的
          </h2>
          <p className="header-item text-lg text-white/60 max-w-2xl mx-auto opacity-0">
            创建大语言模型的逐步过程，从数据收集到模型优化。
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 hidden md:block">
            <div
              ref={lineRef}
              className="w-full h-full origin-top"
              style={{
                background:
                  'linear-gradient(to bottom, #005288, #FF6B35, #005288)',
                backgroundSize: '100% 200%',
                animation: 'gradient-shift 5s linear infinite',
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`step-item relative grid md:grid-cols-2 gap-8 items-center opacity-0 ${
                  index % 2 === 0 ? '' : 'md:[direction:rtl]'
                }`}
              >
                {/* Content */}
                <div
                  className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
                >
                  <div
                    className={`inline-flex items-center gap-4 mb-4 ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="step-badge w-12 h-12 rounded-full bg-spacex-orange/20 border border-spacex-orange flex items-center justify-center transition-all duration-300">
                      <step.icon className="w-5 h-5 text-spacex-orange" />
                    </div>
                    <span className="text-4xl font-bold text-white/10 font-mono">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-white/60 leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Visual placeholder for opposite side */}
                <div className="hidden md:block" />

                {/* Mobile line */}
                <div className="md:hidden absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-spacex-blue to-spacex-orange" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
