import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Image, Video, Mic, Eye, Sparkles, Wand2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const pipelines = [
  {
    title: '图像生成流程',
    desc: '提示词 → 风格约束 → 生成 → 细节修复',
    icon: Image,
    example: '生成一张“未来城市夜景，赛博朋克风格，超清”。',
  },
  {
    title: '视频生成流程',
    desc: '脚本 → 分镜 → 关键帧 → 视频生成',
    icon: Video,
    example: '生成 5 秒短视频：海边日落，镜头缓慢拉远。',
  },
  {
    title: '语音生成流程',
    desc: '文本 → 说话人设定 → 音色/情感 → 输出',
    icon: Mic,
    example: '用温和男声朗读：今天的AI新闻摘要。',
  },
  {
    title: '多模态理解流程',
    desc: '图文输入 → 目标检测 → 问答/推理',
    icon: Eye,
    example: '这张图中有几辆车？它们在什么位置？',
  },
  {
    title: '多模态 Agent',
    desc: '识别 → 调用工具 → 生成结果',
    icon: Sparkles,
    example: '识别图片中的文字并生成摘要。',
  },
];

const tips = [
  '使用清晰的场景描述与镜头指令',
  '加入风格/质量限制词（如“电影质感”）',
  '明确输出格式与时长',
  '对多模态结果进行结构化校验',
];

export default function MultimodalPlaybook() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const nodes = sectionRef.current?.querySelectorAll('.mmplay-item');
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
    <section ref={sectionRef} id="multimodal-playbook" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mmplay-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Wand2 className="w-4 h-4" />
            <span>多模态实战流程</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            多模态生成<span className="text-gradient">方法论</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            以流程视角理解图像/视频/语音/理解的输入输出设计
          </p>
        </div>

        <div className="mmplay-item grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 opacity-0">
          {pipelines.map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-spacex-orange" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60 mb-3">{item.desc}</p>
              <div className="text-xs text-white/50">示例：{item.example}</div>
            </div>
          ))}
        </div>

        <div className="mmplay-item p-6 rounded-2xl bg-white/[0.03] border border-white/10 opacity-0">
          <div className="text-sm text-white/40 mb-3">多模态提示设计建议</div>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-white/70">
            {tips.map((tip) => (
              <div key={tip} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-spacex-orange mt-2" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
