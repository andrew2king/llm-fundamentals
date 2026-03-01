import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, Layers, Scissors, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { title: '上下文窗口', desc: '理解模型可处理的最大 token', icon: Clock },
  { title: '上下文压缩', desc: '摘要/分段/检索增强', icon: Scissors },
  { title: '记忆策略', desc: '短期/长期记忆结合', icon: Layers },
  { title: '安全隔离', desc: '敏感信息过滤与隔离', icon: ShieldCheck },
];

export default function LongContext() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.ctx-item');
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
    <section ref={sectionRef} id="long-context" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="ctx-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Clock className="w-4 h-4" />
            <span>长上下文</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            处理长文本的<span className="text-gradient">策略</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            长上下文带来更强的记忆能力，也需要压缩与安全策略
          </p>
        </div>

        <div className="ctx-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 opacity-0">
          {cards.map((card) => (
            <div key={card.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <card.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-white/60">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
