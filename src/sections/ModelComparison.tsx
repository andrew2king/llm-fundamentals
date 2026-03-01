import { useState, useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Scale, Database, Zap, Globe, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type ModelScore = {
  reasoning: number;
  coding: number;
  multilingual: number;
  speed: number;
  cost: number;
};

type ModelEntry = {
  name: string;
  company: string;
  release: string;
  params: { display: string; valueB: number | null };
  context: { display: string; valueK: number | null };
  strengths: string[];
  weaknesses: string[];
  scores: ModelScore;
  color: string;
};

type ModelData = {
  lastUpdated: string;
  source: string;
  models: ModelEntry[];
};

const fallbackData: ModelData = {
  lastUpdated: '2026-02-28',
  source: '综合公开信息整理',
  models: [
  {
    name: 'GPT-4o',
    release: '2024',
    company: 'OpenAI',
    params: { display: '未公开', valueB: null },
    context: { display: '128K', valueK: 128 },
    strengths: ['多模态', '推理能力', '代码生成'],
    weaknesses: ['成本较高', '不透明'],
    scores: { reasoning: 96, coding: 94, multilingual: 90, speed: 85, cost: 55 },
    color: '#FF6B35',
  },
  {
    name: 'Claude 3.7',
    release: '2025',
    company: 'Anthropic',
    params: { display: '未公开', valueB: null },
    context: { display: '200K', valueK: 200 },
    strengths: ['推理深度', '代码能力', '长文本'],
    weaknesses: ['响应速度', '成本'],
    scores: { reasoning: 97, coding: 95, multilingual: 85, speed: 70, cost: 50 },
    color: '#10b981',
  },
  {
    name: 'Gemini 2.0',
    release: '2024',
    company: 'Google',
    params: { display: '未公开', valueB: null },
    context: { display: '1M', valueK: 1000 },
    strengths: ['多模态', '超长上下文', '搜索集成'],
    weaknesses: ['一致性', '中文支持'],
    scores: { reasoning: 94, coding: 90, multilingual: 88, speed: 85, cost: 70 },
    color: '#8b5cf6',
  },
  {
    name: 'Llama 3.3',
    release: '2024',
    company: 'Meta',
    params: { display: '70B', valueB: 70 },
    context: { display: '128K', valueK: 128 },
    strengths: ['开源', '可本地部署', '隐私'],
    weaknesses: ['硬件要求高', '生态较小'],
    scores: { reasoning: 88, coding: 86, multilingual: 80, speed: 88, cost: 95 },
    color: '#f59e0b',
  },
  {
    name: 'DeepSeek-V3',
    release: '2024',
    company: 'DeepSeek',
    params: { display: '671B', valueB: 671 },
    context: { display: '128K', valueK: 128 },
    strengths: ['性价比高', '代码能力强', '开源'],
    weaknesses: ['生态较新', '英文为主'],
    scores: { reasoning: 92, coding: 94, multilingual: 75, speed: 85, cost: 92 },
    color: '#0ea5e9',
  },
  ],
};

export default function ModelComparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const [modelData, setModelData] = useState<ModelData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([
    fallbackData.models[0]?.name ?? '',
    fallbackData.models[1]?.name ?? '',
  ].filter(Boolean));
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'radar'>('table');

  // Derive valid selected models - filter out invalid names and ensure at least one selection
  const validSelectedModels = useMemo(() => {
    const names = new Set(modelData.models.map((m) => m.name));
    const filtered = selectedModels.filter((name) => names.has(name));
    if (filtered.length >= 1) return filtered;
    return modelData.models.slice(0, 2).map((m) => m.name);
  }, [modelData.models, selectedModels]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.compare-item');
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
    fetch('/data/models.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<ModelData>;
      })
      .then((data) => {
        if (!isMounted) return;
        if (data?.models?.length) {
          setModelData(data);
          setLoadError(null);
        } else {
          setLoadError('数据为空，已回退到本地示例数据。');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('模型数据加载失败，已回退到本地示例数据。');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const comparisonData = useMemo(
    () =>
      modelData.models.map((m) => ({
        name: m.name,
        参数量: m.params.valueB ?? 0,
        上下文: m.context.valueK ?? 0,
      })),
    [modelData.models]
  );

  const radarData = useMemo(() => {
    const subjects = [
      { label: '推理能力', key: 'reasoning' },
      { label: '代码生成', key: 'coding' },
      { label: '多语言', key: 'multilingual' },
      { label: '响应速度', key: 'speed' },
      { label: '成本效益', key: 'cost' },
    ] as const;

    const selected = modelData.models.filter((m) => validSelectedModels.includes(m.name));
    return subjects.map((subject) => {
      const row: Record<string, string | number> = { subject: subject.label };
      selected.forEach((model) => {
        row[model.name] = model.scores[subject.key];
      });
      return row;
    });
  }, [modelData.models, validSelectedModels]);

  const toggleModel = (name: string) => {
    if (selectedModels.includes(name)) {
      setSelectedModels(selectedModels.filter((m) => m !== name));
    } else if (selectedModels.length < 3) {
      setSelectedModels([...selectedModels, name]);
    }
  };

  return (
    <section ref={sectionRef} id="compare" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="compare-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Scale className="w-4 h-4" />
            <span>模型对比</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            主流LLM<span className="text-gradient">对比分析</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            对比不同大语言模型的性能指标，选择最适合你需求的模型
          </p>
        </div>

        {/* Model Selector */}
        <div className="compare-item flex flex-wrap items-center justify-center gap-3 mb-8 opacity-0">
          <span className="text-sm text-white/40 mr-2">选择模型对比 (最多3个):</span>
          {modelData.models.map((model) => (
            <button
              key={model.name}
              onClick={() => toggleModel(model.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedModels.includes(model.name)
                  ? 'bg-spacex-orange text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {selectedModels.includes(model.name) && <Check className="w-4 h-4" />}
              {model.name}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="compare-item flex items-center justify-center gap-2 mb-8 opacity-0">
          {[
            { id: 'table', label: '表格', icon: Database },
            { id: 'chart', label: '图表', icon: BarChart },
            { id: 'radar', label: '雷达图', icon: Zap },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as 'table' | 'chart' | 'radar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                viewMode === mode.id
                  ? 'bg-spacex-blue/30 text-white border border-spacex-blue'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="compare-item opacity-0">
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-white/60 font-medium">模型</th>
                    <th className="text-left py-4 px-4 text-white/60 font-medium">参数量</th>
                    <th className="text-left py-4 px-4 text-white/60 font-medium">上下文</th>
                    <th className="text-left py-4 px-4 text-white/60 font-medium">发布</th>
                    <th className="text-left py-4 px-4 text-white/60 font-medium">优势</th>
                    <th className="text-left py-4 px-4 text-white/60 font-medium">劣势</th>
                  </tr>
                </thead>
                <tbody>
                  {modelData.models
                    .filter((m) => selectedModels.length === 0 || selectedModels.includes(m.name))
                    .map((model) => (
                      <tr
                        key={model.name}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold">{model.name}</div>
                          <div className="text-sm text-white/40">{model.company}</div>
                        </td>
                        <td className="py-4 px-4 font-mono">{model.params.display}</td>
                        <td className="py-4 px-4 font-mono">{model.context.display}</td>
                        <td className="py-4 px-4">{model.release}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {model.strengths.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {model.weaknesses.map((w) => (
                              <span
                                key={w}
                                className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'chart' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-spacex-orange" />
                  参数量对比 (B)
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="参数量" fill="#005288" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-spacex-orange" />
                  上下文长度对比 (K tokens)
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="上下文" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {viewMode === 'radar' && (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <h4 className="text-lg font-semibold mb-6 text-center">综合能力雷达图</h4>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.6)" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  {selectedModels.map((name) => {
                    const model = modelData.models.find((m) => m.name === name);
                    if (!model) return null;
                    return (
                      <Radar
                        key={model.name}
                        name={model.name}
                        dataKey={model.name}
                        stroke={model.color}
                        fill={model.color}
                        fillOpacity={0.2}
                      />
                    );
                  })}
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {selectedModels.map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          modelData.models.find((m) => m.name === name)?.color ?? '#ffffff',
                      }}
                    />
                    <span className="text-sm text-white/60">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="compare-item mt-12 p-6 rounded-xl bg-gradient-to-r from-spacex-blue/10 to-spacex-orange/10 border border-white/10 opacity-0">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-spacex-orange" />
            选型建议
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-white/60">
            <div>
              <strong className="text-white">追求性能:</strong> GPT-4、Claude 3
            </div>
            <div>
              <strong className="text-white">追求性价比:</strong> GPT-3.5、Llama 3
            </div>
            <div>
              <strong className="text-white">长文本处理:</strong> Gemini Pro、Claude 3
            </div>
          </div>
          <div className="mt-4 text-xs text-white/40">
            数据更新时间: {modelData.lastUpdated} · 来源: {modelData.source}
            {loadError ? ` · ${loadError}` : ''}
          </div>
        </div>
      </div>
    </section>
  );
}
