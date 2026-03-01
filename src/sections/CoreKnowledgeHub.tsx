import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Cpu, Layers, Brain, BarChart3, Library } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: 'LLM 概念', desc: '基础定义与核心术语', href: '#concepts', icon: BookOpen },
  { title: 'Transformer 架构', desc: '注意力机制与结构', href: '#architecture', icon: Layers },
  { title: '训练与对齐', desc: '预训练、微调、RLHF', href: '#training', icon: Cpu },
  { title: '评估基准', desc: '模型能力与指标', href: '#benchmarks', icon: BarChart3 },
  { title: '模型对比', desc: '主流模型选型', href: '#compare', icon: Brain },
  { title: '论文精选', desc: '关键研究脉络', href: '#papers', icon: Library },
];

export default function CoreKnowledgeHub() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.core-item');
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
    <section ref={sectionRef} id="core-knowledge" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="core-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BookOpen className="w-4 h-4" />
            <span>核心知识</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            构建<span className="text-gradient">大模型基础</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            从概念、架构到评估与论文，建立完整知识框架
          </p>
        </div>

        <div className="core-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
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
