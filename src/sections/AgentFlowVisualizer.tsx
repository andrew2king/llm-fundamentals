import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Play,
  Pause,
  RotateCcw,
  Bot,
  Wrench,
  Database,
  CheckCircle2,
  MessageSquare,
  Cpu,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type StepDetail = {
  id: string;
  title: string;
  desc: string;
  icon: typeof Bot;
  tool?: {
    name: string;
    input: string;
    output: string;
  };
  memory?: {
    write: string;
    read: string;
  };
  trace: string[];
};

const steps: StepDetail[] = [
  {
    id: 'perception',
    title: '感知输入',
    desc: '解析用户目标与上下文约束。',
    icon: MessageSquare,
    trace: ['解析需求：竞品分析', '识别约束：2页以内，需含数据来源'],
  },
  {
    id: 'plan',
    title: '规划任务',
    desc: '生成子任务与执行顺序。',
    icon: CheckCircle2,
    trace: ['拆分：收集资料 → 归纳要点 → 输出结论', '选择工具：搜索 + 表格整理'],
  },
  {
    id: 'tool',
    title: '调用工具',
    desc: '检索、计算或访问外部系统。',
    icon: Wrench,
    tool: {
      name: 'SearchTool',
      input: '“竞品A 用户量 2024 数据”',
      output: '抓取 3 条可信来源 + 关键指标',
    },
    trace: ['执行工具调用', '收集结构化结果'],
  },
  {
    id: 'memory',
    title: '记忆更新',
    desc: '写入短期/长期记忆。',
    icon: Database,
    memory: {
      read: '读取历史竞品分析模板',
      write: '写入竞品关键指标与引用',
    },
    trace: ['更新短期记忆', '写入长期知识库'],
  },
  {
    id: 'compose',
    title: '生成输出',
    desc: '整合结果并输出结论。',
    icon: Cpu,
    trace: ['合并数据与要点', '生成结论与风险提示'],
  },
];

export default function AgentFlowVisualizer() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.flow-item');
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

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1700);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = steps[activeStep];

  return (
    <section ref={sectionRef} id="agent-flow" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flow-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Bot className="w-4 h-4" />
            <span>Agent 流程可视化</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Agent 如何<span className="text-gradient">执行任务</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            观察 Agent 在感知、规划、工具调用与记忆更新之间的流转
          </p>
        </div>

        <div className="flow-item flex items-center justify-center gap-3 mb-8 opacity-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-spacex-blue/30 border border-spacex-blue flex items-center justify-center hover:bg-spacex-blue/50 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flow-item grid md:grid-cols-5 gap-4 mb-8 opacity-0">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(index);
              }}
              className={`text-left p-5 rounded-2xl border transition-all duration-300 ${
                activeStep === index
                  ? 'border-spacex-orange bg-white/[0.08]'
                  : 'border-white/10 bg-white/[0.03] hover:border-spacex-orange/40'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <step.icon className="w-5 h-5 text-spacex-orange" />
              </div>
              <div className="font-medium mb-1">{step.title}</div>
              <div className="text-sm text-white/60">{step.desc}</div>
            </button>
          ))}
        </div>

        <div className="flow-item grid lg:grid-cols-3 gap-6 opacity-0">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-sm text-white/40 mb-2">当前步骤</div>
            <div className="text-xl font-semibold mb-3">{current.title}</div>
            <div className="text-white/70 mb-4">{current.desc}</div>
            <div className="space-y-2 text-sm text-white/60">
              {current.trace.map((line) => (
                <div key={line} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-spacex-orange" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-6">
              <div
                className="h-full bg-gradient-to-r from-spacex-blue to-spacex-orange transition-all duration-500"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div>
              <div className="text-sm text-white/40 mb-2">工具调用</div>
              {current.tool ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">
                  <div className="font-medium mb-1">{current.tool.name}</div>
                  <div className="text-xs text-white/40 mb-2">输入: {current.tool.input}</div>
                  <div className="text-xs text-white/40">输出: {current.tool.output}</div>
                </div>
              ) : (
                <div className="text-sm text-white/40">当前步骤无工具调用</div>
              )}
            </div>

            <div>
              <div className="text-sm text-white/40 mb-2">记忆读写</div>
              {current.memory ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">
                  <div className="text-xs text-white/40 mb-2">读取: {current.memory.read}</div>
                  <div className="text-xs text-white/40">写入: {current.memory.write}</div>
                </div>
              ) : (
                <div className="text-sm text-white/40">当前步骤无记忆操作</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
