import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Map,
  CheckCircle,
  Circle,
  Lock,
  BookOpen,
  Code,
  Cpu,
  Rocket,
  Award,
  ChevronRight,
  ChevronDown,
  Clock,
  Star,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type LearningStep = {
  title: string;
  description: string;
  resources: string[];
  time: string;
};

type LearningPath = {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: string;
  icon: keyof typeof iconMap;
  color: string;
  steps: LearningStep[];
};

type LearningData = {
  lastUpdated: string;
  source: string;
  paths: LearningPath[];
};

const iconMap = {
  BookOpen,
  Code,
  Cpu,
  Rocket,
  Award,
  Star,
} as const;

const fallbackData: LearningData = {
  lastUpdated: '2026-02-25',
  source: '本地示例数据',
  paths: [
    {
      id: 'beginner',
      name: '入门路线',
      description: '零基础学习大语言模型，从基础概念到简单应用',
      duration: '4-6周',
      level: '初级',
      icon: 'BookOpen',
      color: 'from-green-500 to-emerald-500',
      steps: [
        {
          title: 'AI与机器学习基础',
          description: '了解人工智能、机器学习、深度学习的基本概念',
          resources: ['吴恩达机器学习课程', '《深度学习》第一章'],
          time: '1周',
        },
        {
          title: '神经网络基础',
          description: '学习感知机、反向传播、激活函数等核心概念',
          resources: ['神经网络与深度学习', 'PyTorch入门教程'],
          time: '1周',
        },
        {
          title: '自然语言处理入门',
          description: '了解NLP的基本任务：分词、词性标注、命名实体识别',
          resources: ['NLP入门指南', 'spaCy官方教程'],
          time: '1周',
        },
        {
          title: 'Transformer初探',
          description: '理解注意力机制和Transformer架构的基本原理',
          resources: ['Attention Is All You Need', 'Transformer图解'],
          time: '1周',
        },
        {
          title: 'Prompt基础',
          description: '学习基础提示结构与格式化输出',
          resources: ['Prompt模板', '结构化输出示例'],
          time: '1周',
        },
        {
          title: '使用预训练模型',
          description: '学习如何使用Hugging Face Transformers库',
          resources: ['Transformers官方文档', 'BERT实践教程'],
          time: '1周',
        },
      ],
    },
    {
      id: 'intermediate',
      name: '进阶路线',
      description: '深入理解大模型原理，掌握微调和优化技术',
      duration: '8-12周',
      level: '中级',
      icon: 'Code',
      color: 'from-blue-500 to-cyan-500',
      steps: [
        {
          title: '深入Transformer',
          description: '详细理解多头注意力、位置编码、层归一化',
          resources: ['The Illustrated Transformer', 'Transformer代码实现'],
          time: '2周',
        },
        {
          title: '预训练技术',
          description: '学习MLM、CLM、NSP等预训练任务',
          resources: ['BERT论文', 'RoBERTa论文'],
          time: '2周',
        },
        {
          title: '模型微调',
          description: '掌握全量微调和参数高效微调(PEFT)技术',
          resources: ['LoRA论文', 'Hugging Face PEFT库'],
          time: '2周',
        },
        {
          title: 'Prompt Engineering',
          description: '学习提示工程技巧：Zero-shot、Few-shot、CoT',
          resources: ['Prompt Engineering Guide', 'Chain-of-Thought论文'],
          time: '2周',
        },
        {
          title: 'Agent 入门',
          description: '理解Agent执行流程与工具调用模式',
          resources: ['ReAct论文', 'Agent流程示例'],
          time: '2周',
        },
        {
          title: '模型部署',
          description: '学习模型量化、蒸馏、服务化部署',
          resources: ['ONNX Runtime', 'TensorRT', 'vLLM'],
          time: '2周',
        },
      ],
    },
    {
      id: 'advanced',
      name: '专家路线',
      description: '掌握大模型训练、对齐和前沿研究',
      duration: '16-24周',
      level: '高级',
      icon: 'Cpu',
      color: 'from-purple-500 to-violet-500',
      steps: [
        {
          title: '大规模训练',
          description: '学习分布式训练、数据并行、模型并行、ZeRO优化',
          resources: ['DeepSpeed文档', 'Megatron-LM', 'FSDP教程'],
          time: '4周',
        },
        {
          title: 'RLHF与对齐',
          description: '理解人类反馈强化学习和模型对齐技术',
          resources: ['InstructGPT论文', 'RLHF综述', 'Constitutional AI'],
          time: '4周',
        },
        {
          title: '长上下文与效率',
          description: '学习位置外推、稀疏注意力、FlashAttention',
          resources: ['ALiBi', 'RoPE', 'FlashAttention论文'],
          time: '3周',
        },
        {
          title: '多模态与Agent',
          description: '探索视觉-语言模型和AI Agent技术',
          resources: ['CLIP', 'GPT-4V', 'ReAct', 'AutoGPT'],
          time: '3周',
        },
        {
          title: 'Skill 体系化',
          description: '构建可复用的技能库与评测机制',
          resources: ['技能模板库', 'Skill评测案例'],
          time: '3周',
        },
        {
          title: '前沿研究',
          description: '跟踪最新研究：MoE、Mamba、RetNet等新架构',
          resources: ['arXiv每日论文', 'Papers With Code'],
          time: '持续',
        },
      ],
    },
  ],
};

const certifications = [
  {
    name: 'LLM基础认证',
    description: '证明你掌握了大语言模型的基础概念',
    requirements: ['完成入门路线', '通过基础测验', '完成实践项目'],
    icon: Award,
  },
  {
    name: 'LLM开发工程师',
    description: '证明你能够开发和部署大模型应用',
    requirements: ['完成进阶路线', '完成3个实战项目', '通过技术面试'],
    icon: Rocket,
  },
  {
    name: 'LLM研究员',
    description: '证明你具备大模型研究和创新能力',
    requirements: ['完成专家路线', '发表研究论文或开源项目', '通过专家答辩'],
    icon: Star,
  },
];

export default function LearningPath() {
  const sectionRef = useRef<HTMLElement>(null);
  // Initialize state with localStorage data if available
  const [selectedPath, setSelectedPath] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('llm_learning_progress');
      if (saved) {
        const parsed = JSON.parse(saved) as { selectedPath?: string };
        if (parsed.selectedPath) return parsed.selectedPath;
      }
    } catch {
      // ignore
    }
    return 'beginner';
  });

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('llm_learning_progress');
      if (saved) {
        const parsed = JSON.parse(saved) as { completedSteps?: Record<string, boolean> };
        if (parsed.completedSteps) return parsed.completedSteps;
      }
    } catch {
      // ignore
    }
    return {};
  });
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<LearningData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.path-item');
          if (items && items.length > 0) {
            gsap.fromTo(
              items,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }
            );
          }
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch('/data/learning-paths.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<LearningData>;
      })
      .then((payload) => {
        if (!isMounted) return;
        if (payload?.paths?.length) {
          setData(payload);
          setLoadError(null);
        } else {
          setLoadError('数据为空，已回退到本地示例数据。');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('学习路径加载失败，已回退到本地示例数据。');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({
      selectedPath,
      completedSteps,
    });
    localStorage.setItem('llm_learning_progress', payload);
  }, [selectedPath, completedSteps]);

  // Ensure selectedPath is valid when data changes - derive valid path
  const validSelectedPath = data.paths.find((p) => p.id === selectedPath)
    ? selectedPath
    : (data.paths[0]?.id ?? 'beginner');

  const currentPath = data.paths.find((p) => p.id === validSelectedPath);

  const toggleStep = (pathId: string, stepIndex: number) => {
    const key = `${pathId}-${stepIndex}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleExpand = (pathId: string, stepIndex: number) => {
    const key = `${pathId}-${stepIndex}`;
    setExpandedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getProgress = (path: LearningPath) => {
    const completed = path.steps.filter((_, i) => completedSteps[`${path.id}-${i}`]).length;
    return Math.round((completed / path.steps.length) * 100);
  };

  return (
    <section ref={sectionRef} id="learning-path" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="path-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Map className="w-4 h-4" />
            <span>学习路线</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            系统学习<span className="text-gradient">路径</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            从入门到专家，为你规划清晰的LLM学习路线图
          </p>
        </div>

        {/* Path Selector */}
        <div className="path-item flex flex-wrap items-center justify-center gap-4 mb-12 opacity-0">
          {data.paths.map((path) => {
            const progress = getProgress(path);
            const isSelected = selectedPath === path.id;
            const Icon = iconMap[path.icon] ?? BookOpen;

            return (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                className={`relative p-4 sm:p-6 rounded-2xl border transition-all duration-300 text-left w-full sm:w-auto sm:min-w-[280px] min-h-[44px] active:scale-95 ${
                  isSelected
                    ? 'bg-white/10 border-spacex-orange'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/30'
                }`}
              >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-2xl overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${path.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{path.name}</h3>
                    <p className="text-sm text-white/60 mb-2">{path.description}</p>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {path.duration}
                      </span>
                      <span>{path.level}</span>
                      <span>{progress}% 完成</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Steps */}
        {currentPath && (
          <div className="path-item mb-16 opacity-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">{currentPath.name} - 学习步骤</h3>
                <div className="text-xs text-white/40 mt-1">
                  更新: {data.lastUpdated} · 来源: {data.source}
                  {loadError ? ` · ${loadError}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">总进度:</span>
                <span className="text-spacex-orange font-semibold">{getProgress(currentPath)}%</span>
              </div>
            </div>

            <div className="space-y-4">
              {currentPath.steps.map((step, index) => {
                const isCompleted = completedSteps[`${currentPath.id}-${index}`];
                const isExpanded = expandedSteps[`${currentPath.id}-${index}`];

                return (
                  <div
                    key={index}
                    className={`rounded-xl border transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500/5 border-green-500/30'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Clickable Header */}
                    <button
                      onClick={() => toggleExpand(currentPath.id, index)}
                      className="w-full p-4 sm:p-6 min-h-[44px] flex items-start gap-4 text-left active:scale-95 transition-all"
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(currentPath.id, index);
                        }}
                        className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/40 hover:bg-white/20 active:scale-90'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4
                            className={`font-semibold ${
                              isCompleted ? 'text-green-400 line-through opacity-60' : ''
                            }`}
                          >
                            {index + 1}. {step.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                            {step.time}
                          </span>
                        </div>
                        {/* Always show short description */}
                        <p className={`text-sm mt-1 truncate ${isCompleted ? 'text-white/40' : 'text-white/60'}`}>
                          {step.description}
                        </p>
                      </div>

                      {isExpanded ? (
                        <ChevronDown className={`w-5 h-5 flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-spacex-orange'}`} />
                      ) : (
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform ${isCompleted ? 'text-green-500' : 'text-white/40'}`} />
                      )}
                    </button>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-0 ml-10">
                        <p className={`text-sm mb-3 ${isCompleted ? 'text-white/40' : 'text-white/60'}`}>
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((resource) => (
                            <span
                              key={resource}
                              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/60 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3" />
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        <div className="path-item opacity-0 mb-[80px]">
          <h3 className="text-xl font-semibold mb-6">认证体系</h3>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="p-4 sm:p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/50 active:scale-95 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                  <cert.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-semibold mb-2">{cert.name}</h4>
                <p className="text-sm text-white/60 mb-4">{cert.description}</p>
                <div className="space-y-2">
                  <span className="text-xs text-white/40">获得条件:</span>
                  {cert.requirements.map((req) => (
                    <div key={req} className="flex items-center gap-2 text-sm text-white/60">
                      <Lock className="w-3 h-3" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
