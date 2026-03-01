import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Image, Video, Mic, Eye, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const sections = [
  {
    id: 'image-gen',
    title: '图像生成',
    desc: '文本生成图像、图像编辑与风格迁移。',
    icon: Image,
  },
  {
    id: 'video-gen',
    title: '视频生成',
    desc: '文本/图像生成视频与镜头控制。',
    icon: Video,
  },
  {
    id: 'audio-gen',
    title: '语音生成',
    desc: 'TTS、音色克隆与语音合成。',
    icon: Mic,
  },
  {
    id: 'multimodal-understanding',
    title: '多模态理解',
    desc: '图文理解、视觉问答与跨模态推理。',
    icon: Eye,
  },
  {
    id: 'multimodal-agent',
    title: '多模态 Agent',
    desc: '多模态工具协作与任务执行。',
    icon: Sparkles,
  },
];

export default function MultimodalSections() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.mmsec-item');
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
    <section ref={sectionRef} className="relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((item) => (
            <div key={item.id} id={item.id} className="mmsec-item p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
