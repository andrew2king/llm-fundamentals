import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wrench, Braces, Shield, Route, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: 'Function Calling', desc: '模型输出结构化调用参数。', icon: Braces },
  { title: '工具选择', desc: '根据任务动态选择工具。', icon: Route },
  { title: '安全限制', desc: '权限控制与沙箱执行。', icon: Shield },
  { title: '结果校验', desc: '返回值校验与回退策略。', icon: CheckCircle2 },
];

export default function ToolCalling() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.tool-item');
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
    <section ref={sectionRef} id="tool-calling" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="tool-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Wrench className="w-4 h-4" />
            <span>工具调用</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Function Calling 与<span className="text-gradient">工具编排</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            让模型安全、可靠地调用外部工具，形成可执行工作流
          </p>
        </div>

        <div className="tool-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 opacity-0">
          {items.map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
