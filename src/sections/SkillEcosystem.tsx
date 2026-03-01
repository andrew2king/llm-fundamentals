import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, ExternalLink, Filter } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type EcosystemItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  link: string;
};

type EcosystemData = {
  lastUpdated: string;
  source: string;
  items: EcosystemItem[];
};

const fallbackData: EcosystemData = {
  lastUpdated: '2026-02-25',
  source: '本地示例数据',
  items: [
    {
      id: 'sundial',
      name: 'Sundial',
      category: 'Registry',
      description: '开放的 Agent Skills 注册表，强调可复用技能与开放规范。',
      link: 'https://www.sundialhub.com/',
    },
    {
      id: 'clawiskill',
      name: 'Clawiskill',
      category: 'Registry',
      description: '面向 Agent 的技能注册与交换平台。',
      link: 'https://clawiskill.com/',
    },
    {
      id: 'skillmill',
      name: 'SkillMill',
      category: 'Trust Layer',
      description: '技能安全扫描与认证的信任层目录。',
      link: 'https://skillmill.ai/',
    },
    {
      id: 'crewai-tools',
      name: 'CrewAI Tools',
      category: 'Tool Ecosystem',
      description: 'CrewAI 的工具生态与自定义工具机制。',
      link: 'https://docs.crewai.com/en/concepts/tools',
    },
  ],
};

export default function SkillEcosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const [data, setData] = useState<EcosystemData>(fallbackData);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.eco-item');
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
    fetch('/data/skill-ecosystem.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<EcosystemData>;
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
        setLoadError('生态数据加载失败，已回退到本地示例数据。');
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
    if (selectedCategory === '全部') return data.items;
    return data.items.filter((item) => item.category === selectedCategory);
  }, [data.items, selectedCategory]);

  return (
    <section ref={sectionRef} id="skill-ecosystem" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="eco-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Globe className="w-4 h-4" />
            <span>Skill 生态</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Skill / Tool <span className="text-gradient">生态版图</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            了解主流技能注册表、工具生态与信任层，建立行业认知
          </p>
        </div>

        <div className="eco-item flex flex-wrap items-center gap-3 mb-8 opacity-0">
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

        <div className="eco-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
          {filtered.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="font-semibold text-lg">{item.name}</div>
                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-spacex-orange" />
              </div>
              <div className="text-xs text-white/40 mb-3">{item.category}</div>
              <p className="text-sm text-white/60">{item.description}</p>
            </a>
          ))}
        </div>

        <div className="eco-item mt-6 text-xs text-white/40 opacity-0">
          更新: {data.lastUpdated} · 来源: {data.source}
          {loadError ? ` · ${loadError}` : ''}
        </div>
      </div>
    </section>
  );
}
