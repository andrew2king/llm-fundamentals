import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, ShieldCheck, Activity, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const metrics = [
  { title: '检索召回率', desc: '相关文档是否被找回', icon: Target },
  { title: '生成准确率', desc: '回答是否正确且有依据', icon: ShieldCheck },
  { title: '引用覆盖率', desc: '回答是否有引用支持', icon: BarChart3 },
  { title: '在线反馈', desc: '用户反馈与错误回归', icon: Activity },
];

const checklist = [
  '构建带引用的验证集',
  '引入 Rerank 对比实验',
  '上线后记录失败样本',
  '定期回归评测',
];

export default function RAGEvaluation() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.rageval-item');
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
    <section ref={sectionRef} id="rag-evaluation" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rageval-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BarChart3 className="w-4 h-4" />
            <span>RAG 评测与监控</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            RAG 系统的<span className="text-gradient">评估闭环</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            从离线指标到在线反馈，构建可持续优化机制
          </p>
        </div>

        <div className="rageval-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 opacity-0">
          {metrics.map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rageval-item p-6 rounded-2xl bg-white/[0.03] border border-white/10 opacity-0">
          <div className="text-sm text-white/40 mb-3">评测与监控清单</div>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-white/70">
            {checklist.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-spacex-orange mt-2" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
