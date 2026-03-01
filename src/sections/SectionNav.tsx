import { useEffect, useMemo, useState } from 'react';

type SectionItem = {
  id: string;
  label: string;
};

type SectionNavProps = {
  items?: SectionItem[];
};

const defaultItems: SectionItem[] = [
  { id: 'learning-path', label: '学习路径' },
  { id: 'core-knowledge', label: '核心知识' },
  { id: 'applications', label: '应用与增强' },
  { id: 'agent-system', label: 'Agent系统' },
  { id: 'prompt-skill', label: 'Prompt&Skill' },
  { id: 'multimodal', label: '多模态' },
  { id: 'evaluation-safety', label: '评估安全' },
  { id: 'resource-hub', label: '资源库' },
];

export default function SectionNav({ items }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>('');
  const sections = useMemo(() => items ?? defaultItems, [items]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        setActiveId(visible[0].target.id);
      }
    };

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) return;
      const observer = new IntersectionObserver(handleIntersect, {
        rootMargin: '-40% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      });
      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sections]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-t border-white/10">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeId === item.id
                ? 'bg-spacex-orange text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
