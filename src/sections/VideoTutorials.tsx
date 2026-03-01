import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Clock, Eye, Star, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const tutorials = [
  {
    id: 1,
    title: 'Transformer架构详解',
    description: '从零开始理解Attention机制和Transformer的完整工作原理',
    duration: '25:30',
    views: '128K',
    rating: 4.9,
    thumbnail: 'transformer',
    category: '架构',
    level: '中级',
    url: 'https://www.youtube.com/watch?v=4Bdc55j80l8',
    tags: ['Attention', 'Transformer', 'Self-Attention'],
  },
  {
    id: 2,
    title: 'BERT模型完全指南',
    description: '深入理解BERT的双向编码表示和预训练任务',
    duration: '32:15',
    views: '96K',
    rating: 4.8,
    thumbnail: 'bert',
    category: '预训练',
    level: '中级',
    url: 'https://www.youtube.com/watch?v=6vCzVf1q2b0',
    tags: ['BERT', 'MLM', 'NSP', '预训练'],
  },
  {
    id: 3,
    title: 'GPT系列模型演进',
    description: '从GPT-1到GPT-4，看大语言模型的发展历程',
    duration: '45:00',
    views: '156K',
    rating: 4.9,
    thumbnail: 'gpt',
    category: '历史',
    level: '初级',
    url: 'https://www.youtube.com/watch?v=Gx3y7nG3Gf8',
    tags: ['GPT', 'GPT-3', 'GPT-4', '演进'],
  },
  {
    id: 4,
    title: 'LoRA微调实战',
    description: '使用LoRA高效微调大语言模型，节省99%的显存',
    duration: '28:45',
    views: '72K',
    rating: 4.7,
    thumbnail: 'lora',
    category: '微调',
    level: '高级',
    url: 'https://www.youtube.com/watch?v=Jr5WDaG8QuE',
    tags: ['LoRA', 'PEFT', '微调', '高效训练'],
  },
  {
    id: 5,
    title: 'RAG检索增强生成',
    description: '构建基于外部知识库的问答系统，消除模型幻觉',
    duration: '35:20',
    views: '84K',
    rating: 4.8,
    thumbnail: 'rag',
    category: '应用',
    level: '中级',
    url: 'https://www.youtube.com/watch?v=RAPB8jRYc4g',
    tags: ['RAG', 'Vector DB', 'Embedding', '问答'],
  },
  {
    id: 6,
    title: 'Prompt Engineering精通',
    description: '掌握提示工程技巧，让大模型发挥最大潜力',
    duration: '40:30',
    views: '210K',
    rating: 4.9,
    thumbnail: 'prompt',
    category: '应用',
    level: '初级',
    url: 'https://www.youtube.com/watch?v=uvP2yH4h3w8',
    tags: ['Prompt', 'CoT', 'Few-shot', '提示工程'],
  },
];

const categories = ['全部', '架构', '预训练', '微调', '应用', '历史'];
const levels = ['全部', '初级', '中级', '高级'];

export default function VideoTutorials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedLevel, setSelectedLevel] = useState('全部');

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.video-item');
          if (items && items.length > 0) {
            gsap.fromTo(
              items,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }
            );
          }
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const filteredTutorials = tutorials.filter((t) => {
    const matchesCategory = selectedCategory === '全部' || t.category === selectedCategory;
    const matchesLevel = selectedLevel === '全部' || t.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  return (
    <section ref={sectionRef} id="videos" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="video-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Play className="w-4 h-4" />
            <span>视频教程</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            视频演示<span className="text-gradient">学习</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            通过精心制作的视频教程，直观理解大语言模型的核心概念和实践技巧
          </p>
        </div>

        {/* Filters */}
        <div className="video-item flex flex-wrap items-center justify-center gap-4 mb-12 opacity-0">
          {/* Category Filter */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-spacex-orange text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedLevel === level
                    ? 'bg-spacex-blue text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Video */}
        <div className="video-item mb-12 opacity-0">
          <a
            href={tutorials[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group cursor-pointer rounded-2xl overflow-hidden block"
          >
            <div className="aspect-video bg-gradient-to-br from-spacex-blue/30 to-spacex-orange/30 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{tutorials[0].title}</h3>
                <p className="text-white/60">{tutorials[0].description}</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {tutorials[0].duration}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {tutorials[0].views}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  {tutorials[0].rating}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-sm bg-spacex-orange/20 text-spacex-orange flex items-center gap-1">
                观看视频
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="video-item group cursor-pointer opacity-0 block"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-white/5 to-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-spacex-orange/30 group-hover:scale-110 transition-all">
                    <Play className="w-8 h-8 text-white ml-0.5" fill="white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs bg-black/60">
                  {video.duration}
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs bg-spacex-blue/60">
                  {video.level}
                </div>
              </div>

              {/* Info */}
              <h3 className="font-semibold mb-1 group-hover:text-spacex-orange transition-colors line-clamp-1">
                {video.title}
              </h3>
              <p className="text-sm text-white/60 line-clamp-2 mb-3">{video.description}</p>

              <div className="flex items-center justify-between text-sm text-white/40">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {video.rating}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-white/10">{video.category}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
