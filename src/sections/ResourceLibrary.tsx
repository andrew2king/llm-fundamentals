import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Play, Wrench, Users, ExternalLink, Filter } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  link: string;
  tags: string[];
};

type ResourceData = {
  lastUpdated: string;
  source: string;
  categories: string[];
  items: ResourceItem[];
};

const fallbackData: ResourceData = {
  lastUpdated: '2026-02-25',
  source: '本地示例数据',
  categories: ['论文', '课程', '工具', '社区'],
  items: [
    {
      id: 'attention-paper',
      title: 'Attention Is All You Need',
      description: 'Transformer 经典论文，理解注意力机制的起点。',
      category: '论文',
      level: '中级',
      link: 'https://arxiv.org/abs/1706.03762',
      tags: ['Transformer', 'Attention'],
    },
    {
      id: 'llm-survey',
      title: 'A Survey of Large Language Models',
      description: '系统梳理 LLM 发展脉络与关键方向。',
      category: '论文',
      level: '初级',
      link: 'https://arxiv.org/abs/2303.18223',
      tags: ['综述', 'LLM'],
    },
    {
      id: 'dl-course',
      title: 'Deep Learning Specialization',
      description: '深度学习经典课程，打牢基础。',
      category: '课程',
      level: '初级',
      link: 'https://www.coursera.org/specializations/deep-learning',
      tags: ['基础', 'Andrew Ng'],
    },
    {
      id: 'nlp-course',
      title: 'CS224N: NLP with Deep Learning',
      description: '斯坦福 NLP 课程，覆盖 Transformer 与语言模型。',
      category: '课程',
      level: '中级',
      link: 'https://web.stanford.edu/class/cs224n/',
      tags: ['NLP', 'Transformer'],
    },
    {
      id: 'hf',
      title: 'Hugging Face Transformers',
      description: '最流行的开源 LLM 工具库与模型生态。',
      category: '工具',
      level: '中级',
      link: 'https://github.com/huggingface/transformers',
      tags: ['开源', '模型库'],
    },
    {
      id: 'vllm',
      title: 'vLLM',
      description: '高性能推理框架，支持高吞吐服务化。',
      category: '工具',
      level: '高级',
      link: 'https://github.com/vllm-project/vllm',
      tags: ['推理', '部署'],
    },
    {
      id: 'openai-community',
      title: 'OpenAI Developer Forum',
      description: '开发者讨论社区，获取最佳实践。',
      category: '社区',
      level: '初级',
      link: 'https://community.openai.com/',
      tags: ['社区', '讨论'],
    },
    {
      id: 'paperswithcode',
      title: 'Papers With Code',
      description: '论文 + 实现 + 指标一站式检索。',
      category: '工具',
      level: '初级',
      link: 'https://paperswithcode.com/',
      tags: ['论文', '代码'],
    },
  ],
};

const categoryIcons: Record<string, typeof BookOpen> = {
  论文: BookOpen,
  课程: Play,
  工具: Wrench,
  社区: Users,
};

export default function ResourceLibrary() {
  const sectionRef = useRef<HTMLElement>(null);
  const [data, setData] = useState<ResourceData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const preset = localStorage.getItem('llm_resource_category');
    if (preset) {
      localStorage.removeItem('llm_resource_category');
      return preset;
    }
    return '全部';
  });
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.resource-item');
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
    fetch('/data/resources.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<ResourceData>;
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
        setLoadError('资源数据加载失败，已回退到本地示例数据。');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => ['全部', ...data.categories], [data.categories]);
  const levels = useMemo(() => {
    const set = new Set<string>();
    data.items.forEach((item) => set.add(item.level));
    return ['全部', ...Array.from(set)];
  }, [data.items]);

  const filtered = data.items.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm =
      term.length === 0 ||
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.tags.some((tag) => tag.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    const matchesLevel = selectedLevel === '全部' || item.level === selectedLevel;
    return matchesTerm && matchesCategory && matchesLevel;
  });

  return (
    <section ref={sectionRef} id="resource-library" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="resource-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BookOpen className="w-4 h-4" />
            <span>资源库</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            精选<span className="text-gradient">学习与工具</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            按类别整理论文、课程、工具与社区，快速找到适合你的资源
          </p>
        </div>

        <div className="resource-item flex flex-col lg:flex-row gap-4 mb-8 opacity-0">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="搜索标题、标签或描述..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-spacex-orange transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60">
              <Filter className="w-4 h-4" />
              <span>筛选</span>
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
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-spacex-orange"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="resource-item flex items-center justify-between text-sm text-white/50 mb-6 opacity-0">
          <span>
            共 <span className="text-white font-semibold">{filtered.length}</span> 条资源
          </span>
          <span>
            更新: {data.lastUpdated} · 来源: {data.source}
            {loadError ? ` · ${loadError}` : ''}
          </span>
        </div>

        <div className="resource-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
          {filtered.map((item) => {
            const Icon = categoryIcons[item.category] ?? BookOpen;
            return (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white/70 group-hover:text-spacex-orange transition-colors" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-spacex-orange transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-spacex-orange transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-white/60 mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{item.category}</span>
                  <span>{item.level}</span>
                </div>
              </a>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/40">
            暂无匹配资源
          </div>
        )}
      </div>
    </section>
  );
}
