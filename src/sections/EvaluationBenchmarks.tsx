import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, Shield, Code2, Brain, Calculator, BookOpen, Trophy } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const benchmarkCards = [
  {
    title: '通用知识',
    desc: '评估跨学科知识与综合推理能力。',
    items: ['MMLU', 'ARC', 'HellaSwag'],
    icon: Brain,
    color: 'from-spacex-blue/30 to-transparent',
  },
  {
    title: '数学与推理',
    desc: '考察数学习题、链式推理与符号推导。',
    items: ['GSM8K', 'MATH', 'AQuA'],
    icon: Calculator,
    color: 'from-spacex-orange/30 to-transparent',
  },
  {
    title: '代码能力',
    desc: '衡量代码生成、理解与执行正确性。',
    items: ['HumanEval', 'MBPP', 'APPS'],
    icon: Code2,
    color: 'from-emerald-500/30 to-transparent',
  },
  {
    title: '安全与对齐',
    desc: '评估安全性、拒答与偏见风险。',
    items: ['BBQ', 'TruthfulQA', 'ToxiGen'],
    icon: Shield,
    color: 'from-rose-500/30 to-transparent',
  },
];

const evaluationSteps = [
  {
    title: '定义目标',
    desc: '明确使用场景与关键指标，选择匹配基准。',
  },
  {
    title: '构建数据',
    desc: '收集真实业务样本，建立私有评测集。',
  },
  {
    title: '多维评估',
    desc: '自动指标 + 人类评估，覆盖准确性与稳定性。',
  },
  {
    title: '持续回归',
    desc: '模型迭代后复测，记录趋势并对比版本。',
  },
];

const benchmarkTable = [
  { name: 'MMLU', type: '知识', focus: '多学科理解', metric: 'Accuracy' },
  { name: 'GSM8K', type: '数学', focus: '多步推理', metric: 'Exact Match' },
  { name: 'HumanEval', type: '代码', focus: '函数正确性', metric: 'Pass@1' },
  { name: 'TruthfulQA', type: '对齐', focus: '事实与安全', metric: 'Truthfulness' },
  { name: 'MT-Bench', type: '对话', focus: '综合对话能力', metric: 'GPT-4 Judge' },
  { name: 'LongBench', type: '长文本', focus: '长上下文理解', metric: 'Avg Score' },
];

export default function EvaluationBenchmarks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.bench-item');
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
    <section ref={sectionRef} id="benchmarks" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bench-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BarChart3 className="w-4 h-4" />
            <span>评估与基准</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            LLM <span className="text-gradient">能力评估</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            了解主流基准测试，建立可靠的模型选型与迭代评估体系
          </p>
        </div>

        <div className="bench-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 opacity-0">
          {benchmarkCards.map((card) => (
            <div
              key={card.title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-white/60 mb-4">{card.desc}</p>
              <div className="flex flex-wrap gap-2">
                {card.items.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bench-item grid lg:grid-cols-5 gap-6 opacity-0">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-spacex-orange" />
              <h3 className="text-lg font-semibold">评估流程建议</h3>
            </div>
            <div className="space-y-4">
              {evaluationSteps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm text-white/70">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium mb-1">{step.title}</div>
                    <div className="text-sm text-white/60">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-spacex-blue" />
              <h3 className="text-lg font-semibold">常用基准一览</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/60">
                    <th className="text-left py-2 pr-3">基准</th>
                    <th className="text-left py-2 pr-3">类型</th>
                    <th className="text-left py-2 pr-3">侧重点</th>
                    <th className="text-left py-2">指标</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkTable.map((row) => (
                    <tr key={row.name} className="border-b border-white/5 hover:bg-white/[0.03]">
                      <td className="py-2 pr-3 font-medium">{row.name}</td>
                      <td className="py-2 pr-3 text-white/70">{row.type}</td>
                      <td className="py-2 pr-3 text-white/70">{row.focus}</td>
                      <td className="py-2 text-white/70">{row.metric}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-white/40">
              注: 各基准测试的具体指标与评分方式可能随版本更新而变化。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
