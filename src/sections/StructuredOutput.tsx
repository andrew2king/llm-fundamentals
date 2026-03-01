import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Braces, CheckCircle2, FileJson } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const bullets = [
  '定义 JSON Schema 或明确字段格式',
  '对输出进行校验与修复',
  '将结构化结果用于下游系统',
];

export default function StructuredOutput() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.struct-item');
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
    <section ref={sectionRef} id="structured-output" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="struct-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <FileJson className="w-4 h-4" />
            <span>结构化输出</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            让结果可用<span className="text-gradient">可解析</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            通过 Schema/JSON 约束输出，使其可直接进入业务系统
          </p>
        </div>

        <div className="struct-item grid md:grid-cols-2 gap-6 opacity-0">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Braces className="w-5 h-5 text-spacex-orange" />
              <h3 className="text-lg font-semibold">设计要点</h3>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              {bullets.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-sm text-white/40 mb-2">示例 Schema</div>
            <pre className="text-sm text-white/70 whitespace-pre-wrap bg-black/40 rounded-xl p-4 border border-white/10">
{`{
  "title": "",
  "summary": "",
  "tags": [],
  "sources": []
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
