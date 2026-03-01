import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Puzzle, Filter, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type SkillItem = {
  id: string;
  name: string;
  category: string;
  level: string;
  description: string;
  inputs: string[];
  outputs: string[];
};

type SkillData = {
  lastUpdated: string;
  source: string;
  items: SkillItem[];
};

const fallbackData: SkillData = {
  lastUpdated: '2026-02-25',
  source: '本地示例数据',
  items: [
    {
      id: 'web-summary',
      name: '网页摘要',
      category: '内容',
      level: '初级',
      description: '提取网页核心内容并输出要点。',
      inputs: ['URL', '摘要长度'],
      outputs: ['摘要', '关键要点'],
    },
    {
      id: 'data-struct',
      name: '表格结构化',
      category: '数据',
      level: '中级',
      description: '从文档中抽取结构化字段。',
      inputs: ['文档', '字段列表'],
      outputs: ['JSON', '表格'],
    },
    {
      id: 'qa-rag',
      name: '知识问答',
      category: '检索',
      level: '中级',
      description: '结合知识库进行问答。',
      inputs: ['问题', '知识库'],
      outputs: ['答案', '引用'],
    },
    {
      id: 'report-gen',
      name: '报告生成',
      category: '内容',
      level: '高级',
      description: '基于数据生成分析报告。',
      inputs: ['数据', '报告模板'],
      outputs: ['报告', '要点'],
    },
    {
      id: 'agent-plan',
      name: '任务分解',
      category: '规划',
      level: '中级',
      description: '将目标拆解为执行步骤。',
      inputs: ['任务目标'],
      outputs: ['计划', '子任务'],
    },
    {
      id: 'prompt-check',
      name: '提示校验',
      category: '安全',
      level: '高级',
      description: '检测提示风险与违规内容。',
      inputs: ['Prompt'],
      outputs: ['风险等级', '建议'],
    },
  ],
};

export default function SkillLibrary() {
  const sectionRef = useRef<HTMLElement>(null);
  const [category, setCategory] = useState('全部');
  const [level, setLevel] = useState('全部');
  const [data, setData] = useState<SkillData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.skilllib-item');
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
    let isMounted = true;
    fetch('/data/skills.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<SkillData>;
      })
      .then((payload) => {
        if (!isMounted) return;
        if (payload?.items?.length) {
          setData(payload);
          setLoadError(null);
        } else {
          setLoadError('数据为空，已回退到本地示例数据。');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('技能数据加载失败，已回退到本地示例数据。');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(data.items.map((s) => s.category)))],
    [data.items]
  );
  const levels = useMemo(
    () => ['全部', ...Array.from(new Set(data.items.map((s) => s.level)))],
    [data.items]
  );

  const filtered = data.items.filter((item) => {
    const matchesCategory = category === '全部' || item.category === category;
    const matchesLevel = level === '全部' || item.level === level;
    return matchesCategory && matchesLevel;
  });

  return (
    <section ref={sectionRef} id="skill-library" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="skilllib-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Puzzle className="w-4 h-4" />
            <span>Skill 案例库</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            可复用的<span className="text-gradient">技能模板</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            按类别筛选常见技能，理解输入输出与使用场景
          </p>
        </div>

        <div className="skilllib-item flex flex-wrap items-center gap-3 mb-8 opacity-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60">
            <Filter className="w-4 h-4" />
            筛选
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-spacex-orange"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-spacex-orange"
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="skilllib-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
          {filtered.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-lg">{item.name}</div>
                <span className="text-xs text-white/50">{item.level}</span>
              </div>
              <p className="text-sm text-white/60 mb-4">{item.description}</p>
              <div className="text-xs text-white/40 mb-2">输入</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {item.inputs.map((input) => (
                  <span key={input} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                    {input}
                  </span>
                ))}
              </div>
              <div className="text-xs text-white/40 mb-2">输出</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.outputs.map((output) => (
                  <span key={output} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                    {output}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{item.category}</span>
                <span className="flex items-center gap-1">示例</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/40">暂无匹配技能</div>
        )}

        <div className="skilllib-item mt-6 text-xs text-white/40 opacity-0 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          更新: {data.lastUpdated} · 来源: {data.source}
          {loadError ? ` · ${loadError}` : ''}
        </div>
      </div>
    </section>
  );
}
