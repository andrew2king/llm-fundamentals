import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Database, Layers, Filter, Shuffle, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { title: '数据治理', desc: '清洗、去重、切分与标注。' },
  { title: '索引策略', desc: '稀疏/稠密/混合检索。' },
  { title: '检索与重排', desc: '召回 + Rerank 提升质量。' },
  { title: '生成与引用', desc: '回答生成 + 引用追溯。' },
  { title: '评估与监控', desc: '准确率、覆盖率、反馈回路。' },
];

export default function RAGDeepDive() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.rag-item');
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
    <section ref={sectionRef} id="rag" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rag-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Database className="w-4 h-4" />
            <span>RAG 专题</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            检索增强生成<span className="text-gradient">全链路</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            从数据治理到评估监控，构建可靠的 RAG 系统
          </p>
        </div>

        <div className="rag-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
          {[
            { icon: Filter, title: '数据治理', desc: '清洗/切分/去重' },
            { icon: Layers, title: '索引策略', desc: '稠密/稀疏/混合' },
            { icon: Shuffle, title: '检索与重排', desc: '召回 + Rerank' },
            { icon: CheckCircle2, title: '生成与引用', desc: '回答 + 引用追溯' },
            { icon: Database, title: '评估监控', desc: '质量/覆盖/反馈' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rag-item mt-8 grid md:grid-cols-5 gap-4 opacity-0">
          {steps.map((step, index) => (
            <div key={step.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/40 mb-1">步骤 {index + 1}</div>
              <div className="font-medium mb-1">{step.title}</div>
              <div className="text-sm text-white/60">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
