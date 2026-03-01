import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 175, suffix: 'B+', label: '参数数量' },
  { value: 1, suffix: 'T+', label: '训练token' },
  { value: 96, suffix: '', label: '注意力头' },
  { value: 2048, suffix: '', label: '上下文长度' },
];

function AnimatedCounter({
  value,
  suffix,
  isVisible,
}: {
  value: number;
  suffix: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);
  const countRef = useRef({ value: 0 });

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const currentValue = Math.floor(eased * value);
      setCount(currentValue);
      countRef.current.value = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isVisible]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  return (
    <span className="font-mono">
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 70%',
          onEnter: () => {
            setIsVisible(true);
            const items = sectionRef.current?.querySelectorAll('.stat-item');
            if (items && items.length > 0) {
              gsap.fromTo(
                items,
                { scale: 0.5, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.8,
                  stagger: 0.15,
                  ease: 'expo.out',
                }
              );
            }
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
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-spacex-blue/10 via-transparent to-spacex-orange/10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-item relative text-center py-8 opacity-0"
            >
              {/* Divider */}
              {index < stats.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[60%]">
                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                  />
                </div>
              )}

              {/* Number */}
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-glow">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  isVisible={isVisible}
                />
              </div>

              {/* Label */}
              <div className="text-sm md:text-base text-white/60 uppercase tracking-wider">
                {stat.label}
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-spacex-blue/5 blur-[60px] rounded-full -z-10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
