import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Copy, Check, Sparkles, Filter, Search } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type PromptItem = {
  id: string;
  title: string;
  category: string;
  prompt: string;
};

type PromptData = {
  lastUpdated: string;
  source: string;
  items: PromptItem[];
};

const fallbackData: PromptData = {
  lastUpdated: '2026-02-28',
  source: '综合最佳实践整理',
  items: [
    {
      id: 'summary',
      title: '摘要模板',
      category: '内容',
      prompt:
        '你是专业的内容分析师。请用 5 个要点总结以下内容，并给出 1 句结论：\n\n{{content}}',
    },
    {
      id: 'code-review',
      title: '代码审查模板',
      category: '代码',
      prompt:
        '请审查以下代码，从【可读性、性能、安全、最佳实践】四个方面给出建议：\n\n```{{language}}\n{{code}}\n```',
    },
    {
      id: 'data-analysis',
      title: '数据分析模板',
      category: '数据',
      prompt:
        '你是一位数据分析师。请分析以下数据并给出洞察和建议：\n\n数据描述：{{description}}\n数据样本：{{sample}}',
    },
    {
      id: 'blog-post',
      title: '博客文章模板',
      category: '写作',
      prompt:
        '请写一篇博客文章，要求：标题吸引人、开头引人入胜、结构清晰、结尾有行动号召\n\n主题：{{topic}}',
    },
  ],
};

export default function PromptLibrary() {
  const sectionRef = useRef<HTMLElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [data, setData] = useState<PromptData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.promptlib-item');
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
    fetch('/data/prompts.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<PromptData>;
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
        setLoadError('提示模板加载失败，已回退到本地示例数据。');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.items.forEach((item) => set.add(item.category));
    return ['全部', ...Array.from(set)];
  }, [data.items]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.items.filter((item) => {
      const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
      const matchesTerm =
        term.length === 0 ||
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.prompt.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [data.items, query, selectedCategory]);

  const copyPrompt = (item: PromptItem) => {
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section ref={sectionRef} id="prompt-library" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="promptlib-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Prompt 模板库</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            可复制的<span className="text-gradient">提示模板</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            直接使用高质量模板，提高输出一致性与效率
          </p>
        </div>

        <div className="promptlib-item flex flex-col lg:flex-row gap-4 mb-8 opacity-0">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索模板标题或内容..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-spacex-orange"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60">
              <Filter className="w-4 h-4" />
              分类
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-spacex-orange"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="promptlib-item grid md:grid-cols-2 gap-5 opacity-0">
          {filtered.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-lg">{item.title}</div>
                  <div className="text-xs text-white/40">{item.category}</div>
                </div>
                <button
                  onClick={() => copyPrompt(item)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制
                    </>
                  )}
                </button>
              </div>
              <pre className="text-sm text-white/70 whitespace-pre-wrap bg-black/40 rounded-xl p-4 border border-white/10">
{item.prompt}
              </pre>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/40">暂无匹配模板</div>
        )}

        <div className="promptlib-item mt-6 text-xs text-white/40 opacity-0">
          更新: {data.lastUpdated} · 来源: {data.source}
          {loadError ? ` · ${loadError}` : ''}
        </div>
      </div>
    </section>
  );
}
