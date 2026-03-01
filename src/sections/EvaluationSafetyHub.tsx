import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, BarChart3, AlertTriangle, Scale } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: '评估基准', desc: '能力评估与基准测试', href: '#benchmarks', icon: BarChart3 },
  { title: '安全与对齐', desc: '安全策略与对齐方法', href: '#safety', icon: Shield },
  { title: '攻击与防护', desc: 'Prompt Injection 与防御', href: '#safety', icon: AlertTriangle },
  { title: '合规与伦理', desc: '公平性与合规要求', href: '#safety', icon: Scale },
];

export default function EvaluationSafetyHub() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.eval-item');
          if (nodes && nodes.length > 0) {
            gsap.fromTo(
              nodes,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'expo.out' }
            );
          }
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="evaluation-safety" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="eval-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Shield className="w-4 h-4" />
            <span>评估与安全</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            可信与可控的<span className="text-gradient">核心保障</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            评估体系与安全策略是大模型落地的基本保障
          </p>
        </div>

        <div className="eval-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 opacity-0">
          {items.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                const el = document.querySelector(item.href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
