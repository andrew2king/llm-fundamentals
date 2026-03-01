import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Puzzle, BookOpen, Boxes } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: 'Prompt 进阶', desc: '技巧与设计原则', href: '#prompt-advanced', icon: Sparkles },
  { title: 'Prompt 模板库', desc: '可复制的模板集合', href: '#prompt-library', icon: BookOpen },
  { title: 'Skill 体系', desc: 'Skill/Tool 基础', href: '#skills', icon: Puzzle },
  { title: 'Skill 案例库', desc: '可复用技能模板', href: '#skill-library', icon: Boxes },
  { title: 'Skill 生态', desc: 'Registry 与生态图谱', href: '#skill-ecosystem', icon: Boxes },
];

export default function PromptSkillHub() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.ps-item');
          if (nodes && nodes.length > 0) {
            gsap.fromTo(
              nodes,
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
    <section ref={sectionRef} id="prompt-skill" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="ps-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Prompt & Skill</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            提示与技能的<span className="text-gradient">方法体系</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            从提示技巧到技能库，构建可复用的能力模块
          </p>
        </div>

        <div className="ps-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
          {items.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                const el = document.querySelector(item.href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
