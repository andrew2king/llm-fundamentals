import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers3, Database, Wrench, Braces, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: 'RAG', desc: '检索增强生成完整链路', href: '#rag', icon: Database },
  { title: '工具调用', desc: 'Function Calling 与工具编排', href: '#tool-calling', icon: Wrench },
  { title: '结构化输出', desc: 'Schema/JSON 规范化输出', href: '#structured-output', icon: Braces },
  { title: '长上下文', desc: '长文本处理与压缩策略', href: '#long-context', icon: Clock },
  { title: '应用案例', desc: '行业落地应用场景', href: '#cases', icon: Layers3 },
];

export default function ApplicationsHub() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.apphub-item');
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
    <section ref={sectionRef} id="applications" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="apphub-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Layers3 className="w-4 h-4" />
            <span>应用与增强</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            从模型到<span className="text-gradient">应用系统</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            覆盖 RAG、工具调用、结构化输出与长上下文等关键能力
          </p>
        </div>

        <div className="apphub-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
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
