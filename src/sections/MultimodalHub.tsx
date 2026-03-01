import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Image, Video, Mic, Eye, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { title: '图像生成', desc: '文本到图像生成与编辑', href: '#image-gen', icon: Image },
  { title: '视频生成', desc: '文本/图像到视频', href: '#video-gen', icon: Video },
  { title: '语音生成', desc: 'TTS 与语音合成', href: '#audio-gen', icon: Mic },
  { title: '多模态理解', desc: '图文/音视频理解', href: '#multimodal-understanding', icon: Eye },
  { title: '多模态 Agent', desc: '多模态工具协作', href: '#multimodal-agent', icon: Sparkles },
];

export default function MultimodalHub() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.mm-item');
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
    <section ref={sectionRef} id="multimodal" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mm-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Sparkles className="w-4 h-4" />
            <span>多模态专区</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            图像 / 视频 / 语音 / 理解<span className="text-gradient">一体化</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            覆盖多模态生成与理解的关键能力与应用
          </p>
        </div>

        <div className="mm-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0">
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
