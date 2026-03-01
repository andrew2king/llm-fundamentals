import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Server,
  Database,
  Cpu,
  Layers3,
  Workflow,
  Gauge,
  Boxes,
  Cloud,
  ShieldCheck,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    title: '推理优化',
    desc: '量化、蒸馏、KV Cache 与高性能推理框架。',
    icon: Gauge,
    target: '#deploy-inference',
  },
  {
    title: 'RAG 架构',
    desc: '检索、向量库、重排与上下文压缩。',
    icon: Database,
    target: '#deploy-rag',
  },
  {
    title: '服务化部署',
    desc: '弹性扩缩容、负载均衡与API网关。',
    icon: Server,
    target: '#deploy-serving',
  },
  {
    title: '成本治理',
    desc: 'Token预算、缓存策略与调用审计。',
    icon: Cpu,
    target: '#deploy-cost',
  },
  {
    title: '可观测性',
    desc: '日志、追踪、质量评分与回归测试。',
    icon: Workflow,
    target: '#deploy-observability',
  },
  {
    title: '安全合规',
    desc: '数据脱敏、权限控制与合规审计。',
    icon: ShieldCheck,
    target: '#deploy-security',
  },
];

const pipeline = [
  {
    step: '数据准备',
    detail: '清洗、分块、去重、标签与元数据。',
  },
  {
    step: '索引与检索',
    detail: 'Embedding + Vector DB + Hybrid Search。',
  },
  {
    step: '重排与压缩',
    detail: 'Reranker + Context Compression。',
  },
  {
    step: '生成与评估',
    detail: 'Prompt 模版 + 评估 + Guardrails。',
  },
  {
    step: '上线与监控',
    detail: '灰度、AB、质量回归与报警。',
  },
];

const stacks = [
  {
    title: '推理与服务',
    items: ['vLLM', 'TGI', 'TensorRT-LLM', 'Ray Serve'],
    icon: Layers3,
  },
  {
    title: '向量数据库',
    items: ['Milvus', 'Pinecone', 'Weaviate', 'Qdrant'],
    icon: Boxes,
  },
  {
    title: '云与部署',
    items: ['Kubernetes', 'Autoscaling', 'GPU 调度', '多租户隔离'],
    icon: Cloud,
  },
];

export default function DeploymentEngineering() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.deploy-item');
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

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} id="deployment" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="deploy-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Server className="w-4 h-4" />
            <span>部署与工程实践</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            让 LLM 真正<span className="text-gradient">落地生产</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            从推理优化到RAG架构，构建可扩展、可观测的生产级系统
          </p>
        </div>

        <div className="deploy-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 opacity-0">
          {pillars.map((pillar) => (
            <button
              key={pillar.title}
              onClick={() => scrollTo(pillar.target)}
              className="text-left p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <pillar.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{pillar.title}</h3>
              <p className="text-sm text-white/60">{pillar.desc}</p>
            </button>
          ))}
        </div>

        <div className="deploy-item grid lg:grid-cols-5 gap-6 opacity-0">
          <div className="lg:col-span-3 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Workflow className="w-5 h-5 text-spacex-blue" />
              <h3 className="text-lg font-semibold">RAG 实践流水线</h3>
            </div>
            <div className="space-y-4">
              {pipeline.map((item, index) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm text-white/70">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium mb-1">{item.step}</div>
                    <div className="text-sm text-white/60">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Boxes className="w-5 h-5 text-spacex-orange" />
              <h3 className="text-lg font-semibold">工程栈参考</h3>
            </div>
            <div className="space-y-4">
              {stacks.map((stack) => (
                <div key={stack.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <stack.icon className="w-4 h-4 text-white/70" />
                    <span className="font-medium">{stack.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item) => (
                      <span key={item} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="deploy-item grid md:grid-cols-2 gap-6 mt-10 opacity-0">
          <div id="deploy-inference" className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-semibold mb-2">推理优化</h3>
            <p className="text-sm text-white/60 mb-4">
              通过量化、蒸馏、KV Cache 与批处理提升吞吐与降低延迟。
            </p>
            <div className="flex flex-wrap gap-2">
              {['INT8/INT4', 'KV Cache', 'Batching', 'FlashAttention'].map((item) => (
                <span key={item} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div id="deploy-rag" className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-semibold mb-2">RAG 架构</h3>
            <p className="text-sm text-white/60 mb-4">
              构建检索增强生成流水线，提升事实性与可控性。
            </p>
            <div className="flex flex-wrap gap-2">
              {['向量检索', 'Hybrid Search', 'Reranker', 'Context Compression'].map((item) => (
                <span key={item} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div id="deploy-serving" className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-semibold mb-2">服务化部署</h3>
            <p className="text-sm text-white/60 mb-4">
              实现弹性扩缩容、版本灰度、API 网关与限流。
            </p>
            <div className="flex flex-wrap gap-2">
              {['Autoscaling', 'Canary', 'Rate Limit', 'API Gateway'].map((item) => (
                <span key={item} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div id="deploy-cost" className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-semibold mb-2">成本治理</h3>
            <p className="text-sm text-white/60 mb-4">
              预算与配额、缓存策略、低价值请求削减。
            </p>
            <div className="flex flex-wrap gap-2">
              {['Token Budget', 'Response Cache', 'Cost Metering', 'Usage Alert'].map((item) => (
                <span key={item} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div id="deploy-observability" className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-semibold mb-2">可观测性</h3>
            <p className="text-sm text-white/60 mb-4">
              追踪质量、延迟、失败率与安全事件。
            </p>
            <div className="flex flex-wrap gap-2">
              {['Tracing', 'Latency', 'Quality Score', 'Feedback Loop'].map((item) => (
                <span key={item} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div id="deploy-security" className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-semibold mb-2">安全合规</h3>
            <p className="text-sm text-white/60 mb-4">
              数据脱敏、权限控制、审计与合规策略。
            </p>
            <div className="flex flex-wrap gap-2">
              {['PII Masking', 'Access Control', 'Audit Log', 'Compliance'].map((item) => (
                <span key={item} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
