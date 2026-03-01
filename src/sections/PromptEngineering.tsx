import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Braces, Copy, CheckCircle2, Wand2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const techniques = [
  {
    title: 'CoT / 推理链',
    desc: '显式推理步骤，提升复杂问题准确率。',
  },
  {
    title: 'Self-Consistency',
    desc: '多次采样并投票，稳定输出质量。',
  },
  {
    title: 'ReAct',
    desc: '推理 + 行动交替，结合工具使用。',
  },
  {
    title: '结构化输出',
    desc: '使用 JSON schema 规范输出格式。',
  },
  {
    title: '约束性提示',
    desc: '加入规则与边界，降低偏差与幻觉。',
  },
  {
    title: '模板化提示',
    desc: '可复用提示模板提升一致性。',
  },
];

const promptPatterns = [
  {
    title: '角色 + 任务 + 约束',
    example: '你是资深产品经理，请在 200 字内总结本文并列出 3 个要点。',
  },
  {
    title: '步骤化输出',
    example: '先分析要点，再输出结论，最后给出风险。',
  },
  {
    title: '结构化 JSON',
    example: '{"title": "", "summary": "", "risks": []}',
  },
];

export default function PromptEngineering() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.prompt-item');
          if (items && items.length > 0) {
            gsap.fromTo(
              items,
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
    <section ref={sectionRef} id="prompt-advanced" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="prompt-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Prompt 进阶</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            让提示词<span className="text-gradient">更有效</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            通过结构化、约束与范式化设计，提升模型输出稳定性与可控性
          </p>
        </div>

        <div className="prompt-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 opacity-0">
          {techniques.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prompt-item grid lg:grid-cols-2 gap-6 opacity-0">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Braces className="w-5 h-5 text-spacex-blue" />
              <h3 className="text-lg font-semibold">常见提示模板</h3>
            </div>
            <div className="space-y-3">
              {promptPatterns.map((pattern) => (
                <div key={pattern.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-medium mb-1">{pattern.title}</div>
                  <div className="text-sm text-white/60">{pattern.example}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Copy className="w-5 h-5 text-spacex-orange" />
              <h3 className="text-lg font-semibold">提示设计清单</h3>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              {[
                '明确角色与目标',
                '给出输入/输出格式',
                '限制范围与长度',
                '提供示例或边界条件',
                '要求逐步推理或引用来源',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
