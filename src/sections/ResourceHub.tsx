import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Library, Play, BookOpen, Wrench, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: '资源库', desc: '统一资源入口与筛选', href: '#resource-library', icon: Library },
  { title: '视频教程', desc: '精选视频课程', href: '#videos', icon: Play },
  { title: '论文精选', desc: '关键论文与综述', href: '#papers', icon: BookOpen },
  { title: '工具与社区', desc: '工具生态与社区资源', href: '#resource-library', icon: Wrench },
  { title: '社区与讨论', desc: '开发者社区入口', href: '#resource-library', icon: Users },
];

export default function ResourceHub() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.res-item');
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
    <section ref={sectionRef} id="resource-hub" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="res-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Library className="w-4 h-4" />
            <span>资源库</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            一站式学习<span className="text-gradient">资源入口</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            论文、视频、课程、工具与社区的统一入口
          </p>
        </div>

        <div className="res-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
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
