import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Map, Workflow, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: 'Agent 基础', desc: '核心组件与范式', href: '#agents', icon: Bot },
  { title: 'Agent 流程', desc: '执行流程可视化', href: '#agent-flow', icon: Workflow },
  { title: 'Agent Teams', desc: '多 Agent 协作机制', href: '#agent-teams', icon: Users },
  { title: '安全与控制', desc: '安全策略与约束', href: '#safety', icon: Map },
];

export default function AgentSystemHub() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.agenthub-item');
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
    <section ref={sectionRef} id="agent-system" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="agenthub-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Bot className="w-4 h-4" />
            <span>Agent 系统</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            构建可执行的<span className="text-gradient">智能体系统</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            了解 Agent 的组件、流程、协作与安全控制
          </p>
        </div>

        <div className="agenthub-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 opacity-0">
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
