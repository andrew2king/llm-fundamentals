import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Scale,
  Eye,
  FileWarning,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const riskAreas = [
  {
    title: '幻觉与误导',
    desc: '模型可能生成看似可信但错误的信息。',
    icon: AlertTriangle,
  },
  {
    title: '偏见与公平',
    desc: '训练数据偏差可能导致不公平或歧视性输出。',
    icon: Scale,
  },
  {
    title: '提示注入',
    desc: '恶意提示可能绕过系统规则或泄露信息。',
    icon: FileWarning,
  },
  {
    title: '隐私泄露',
    desc: '对话或上下文可能包含敏感信息。',
    icon: Eye,
  },
];

const alignmentMethods = [
  {
    title: 'RLHF / RLAIF',
    desc: '通过人类/AI反馈对齐模型行为。',
  },
  {
    title: 'Constitutional AI',
    desc: '基于规则原则约束输出。',
  },
  {
    title: '安全微调',
    desc: '加入安全数据集与拒答示例。',
  },
  {
    title: '多层防护',
    desc: '内容过滤、审计、规则与监控协作。',
  },
];

const guardrailChecklist = [
  '输入与输出敏感词过滤',
  '系统提示约束与模版化',
  '知识库权限与脱敏策略',
  '攻击样本红队测试',
  '安全日志与人工复核机制',
];

export default function SafetyAlignment() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.safety-item');
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
    <section ref={sectionRef} id="safety" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="safety-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <ShieldAlert className="w-4 h-4" />
            <span>安全与对齐</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            构建可信的<span className="text-gradient">大模型系统</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            识别风险、设计安全策略并建立对齐机制，让模型输出更可靠
          </p>
        </div>

        <div className="safety-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 opacity-0">
          {riskAreas.map((risk) => (
            <div
              key={risk.title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <risk.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{risk.title}</h3>
              <p className="text-sm text-white/60">{risk.desc}</p>
            </div>
          ))}
        </div>

        <div className="safety-item grid lg:grid-cols-5 gap-6 opacity-0">
          <div className="lg:col-span-3 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-spacex-blue" />
              <h3 className="text-lg font-semibold">对齐与安全方法</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {alignmentMethods.map((method) => (
                <div
                  key={method.title}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="font-medium mb-1">{method.title}</div>
                  <div className="text-sm text-white/60">{method.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-white/50">
              结合规则、数据与人类反馈，构建多层次安全策略。
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-spacex-orange" />
              <h3 className="text-lg font-semibold">Guardrail 清单</h3>
            </div>
            <div className="space-y-3">
              {guardrailChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-white/40">
              建议结合业务场景制定分级安全策略，并持续监控与迭代。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
