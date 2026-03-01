import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Brain, Map, Wrench, MemoryStick, Network, Layers3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const agentPillars = [
  {
    title: 'Agent 架构',
    desc: '感知、规划、执行、记忆构成完整闭环。',
    icon: Layers3,
  },
  {
    title: '规划与分解',
    desc: '将复杂任务拆分为可执行步骤。',
    icon: Map,
  },
  {
    title: '工具调用',
    desc: '通过工具补足模型能力边界。',
    icon: Wrench,
  },
  {
    title: '记忆系统',
    desc: '短期/长期记忆提升持续对话能力。',
    icon: MemoryStick,
  },
  {
    title: '多Agent协作',
    desc: '分工协作处理复杂工作流。',
    icon: Network,
  },
  {
    title: '安全与控制',
    desc: '防止越权调用与错误输出。',
    icon: Brain,
  },
];

const agentFlows = [
  {
    step: '感知输入',
    detail: '理解用户目标与上下文约束。',
  },
  {
    step: '规划任务',
    detail: '生成任务计划与工具序列。',
  },
  {
    step: '执行工具',
    detail: '调用外部工具完成检索/计算等。',
  },
  {
    step: '总结输出',
    detail: '聚合结果并生成用户可读回答。',
  },
];

const agentTypes = [
  { name: 'ReAct', desc: '思考-行动交替驱动执行。' },
  { name: 'Plan & Execute', desc: '先规划再逐步执行。' },
  { name: 'Toolformer', desc: '模型内化工具调用能力。' },
  { name: 'Multi-Agent', desc: '多个角色协作完成任务。' },
];

export default function AgentModule() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.agent-item');
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
    <section ref={sectionRef} id="agents" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="agent-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Bot className="w-4 h-4" />
            <span>Agent 基础</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            从模型到<span className="text-gradient">智能体</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            了解 Agent 的核心组件、执行流程与典型范式，建立智能体系统的知识框架
          </p>
        </div>

        <div className="agent-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 opacity-0">
          {agentPillars.map((pillar) => (
            <div
              key={pillar.title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <pillar.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{pillar.title}</h3>
              <p className="text-sm text-white/60">{pillar.desc}</p>
            </div>
          ))}
        </div>

        <div className="agent-item grid lg:grid-cols-5 gap-6 opacity-0">
          <div className="lg:col-span-3 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-spacex-blue" />
              <h3 className="text-lg font-semibold">Agent 执行流程</h3>
            </div>
            <div className="space-y-4">
              {agentFlows.map((flow, index) => (
                <div key={flow.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm text-white/70">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium mb-1">{flow.step}</div>
                    <div className="text-sm text-white/60">{flow.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-spacex-orange" />
              <h3 className="text-lg font-semibold">典型范式</h3>
            </div>
            <div className="space-y-3">
              {agentTypes.map((item) => (
                <div key={item.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-medium mb-1">{item.name}</div>
                  <div className="text-sm text-white/60">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
