import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, UserCircle, Route, ShieldCheck, Workflow } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const teamModes = [
  { title: '角色分工', desc: '规划者、执行者、审校者协作。', icon: Users },
  { title: '任务路由', desc: '根据任务选择合适 Agent。', icon: Route },
  { title: '协作策略', desc: '并行协作与投票机制。', icon: Workflow },
  { title: '安全控制', desc: '权限隔离与风险拦截。', icon: ShieldCheck },
];

export default function AgentTeams() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.team-item');
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
    <section ref={sectionRef} id="agent-teams" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="team-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <UserCircle className="w-4 h-4" />
            <span>Agent Teams</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            多 Agent 协作<span className="text-gradient">体系</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            通过角色分工与协作策略，让复杂任务高效完成
          </p>
        </div>

        <div className="team-item grid md:grid-cols-2 lg:grid-cols-4 gap-5 opacity-0">
          {teamModes.map((mode) => (
            <div key={mode.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <mode.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{mode.title}</h3>
              <p className="text-sm text-white/60">{mode.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
