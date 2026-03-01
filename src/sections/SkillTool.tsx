import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wrench, Puzzle, Layers, CheckCircle2, Boxes, Workflow } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const skillBlocks = [
  {
    title: 'Skill 定义',
    desc: '可复用的能力模块，具备输入/输出与边界。',
    icon: Puzzle,
  },
  {
    title: 'Tool 调用',
    desc: '调用外部 API、数据库或计算引擎。',
    icon: Wrench,
  },
  {
    title: '组合编排',
    desc: '多个技能组合为工作流。',
    icon: Workflow,
  },
  {
    title: '版本管理',
    desc: '技能迭代时保持可追溯与回归。',
    icon: Layers,
  },
  {
    title: '能力评测',
    desc: '通过测试集与指标衡量技能效果。',
    icon: CheckCircle2,
  },
  {
    title: '技能库',
    desc: '沉淀常用技能形成资产。',
    icon: Boxes,
  },
];

const skillExamples = [
  { name: '网页摘要', detail: '输入 URL → 输出摘要与要点' },
  { name: '表格结构化', detail: '输入文档 → 输出结构化表格' },
  { name: '报告生成', detail: '输入数据 → 输出分析报告' },
  { name: '知识问答', detail: '输入问题 → 基于知识库回答' },
];

export default function SkillTool() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.skill-item');
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
    <section ref={sectionRef} id="skills" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="skill-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Puzzle className="w-4 h-4" />
            <span>Skill / Tool</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            构建可复用的<span className="text-gradient">能力模块</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            学会设计技能与工具，形成可扩展的能力体系
          </p>
        </div>

        <div className="skill-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 opacity-0">
          {skillBlocks.map((block) => (
            <div
              key={block.title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <block.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{block.title}</h3>
              <p className="text-sm text-white/60">{block.desc}</p>
            </div>
          ))}
        </div>

        <div className="skill-item grid lg:grid-cols-2 gap-6 opacity-0">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-spacex-blue" />
              <h3 className="text-lg font-semibold">技能设计要点</h3>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              {[
                '明确输入输出与约束条件',
                '对失败场景设置回退策略',
                '尽量保持单一职责与可组合性',
                '通过测试集持续回归验证',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Boxes className="w-5 h-5 text-spacex-orange" />
              <h3 className="text-lg font-semibold">常见技能示例</h3>
            </div>
            <div className="space-y-3">
              {skillExamples.map((item) => (
                <div key={item.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-medium mb-1">{item.name}</div>
                  <div className="text-sm text-white/60">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
