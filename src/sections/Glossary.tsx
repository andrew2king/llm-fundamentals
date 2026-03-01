import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, BookOpen, ChevronRight, Bookmark, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const glossaryTerms = [
  {
    term: 'Attention (注意力)',
    category: '架构',
    definition: '一种机制，允许模型在处理序列时动态地关注输入的不同部分。',
    detail: '注意力机制通过计算查询(Query)、键(Key)和值(Value)之间的相似度，为每个输出位置分配输入位置的权重。这是Transformer架构的核心组件。',
    related: ['Self-Attention', 'Multi-Head Attention', 'Transformer'],
  },
  {
    term: 'Transformer',
    category: '架构',
    definition: '一种基于注意力机制的神经网络架构，彻底改变了NLP领域。',
    detail: 'Transformer由Encoder和Decoder组成，完全依赖注意力机制来捕捉输入和输出之间的全局依赖关系，无需使用循环或卷积。',
    related: ['Attention', 'BERT', 'GPT'],
  },
  {
    term: 'Token',
    category: '基础',
    definition: '文本被分割成的基本单元，可以是词、子词或字符。',
    detail: 'Tokenization是将文本转换为模型可处理格式的第一步。不同模型使用不同的tokenization策略，如BPE、WordPiece等。',
    related: ['Tokenization', 'BPE', 'Embedding'],
  },
  {
    term: 'Embedding (嵌入)',
    category: '基础',
    definition: '将离散的token映射到连续向量空间的技术。',
    detail: '词嵌入将高维稀疏的one-hot向量转换为低维稠密的向量表示，捕捉词的语义信息。语义相近的词在嵌入空间中距离更近。',
    related: ['Word2Vec', 'Token', 'Vector Space'],
  },
  {
    term: 'Fine-tuning (微调)',
    category: '训练',
    definition: '在预训练模型的基础上，使用特定任务数据进行进一步训练。',
    detail: '微调可以让通用模型适应特定领域或任务，如情感分析、问答系统等。相比从头训练，微调需要的计算资源和时间更少。',
    related: ['Pre-training', 'Transfer Learning', 'LoRA'],
  },
  {
    term: 'Prompt (提示词)',
    category: '应用',
    definition: '输入给语言模型的文本指令，用于引导模型生成期望的输出。',
    detail: 'Prompt Engineering是设计和优化提示词的技术，通过调整提示词的格式、内容和示例，可以显著提升模型性能。',
    related: ['Prompt Engineering', 'Few-shot', 'Zero-shot'],
  },
  {
    term: 'Temperature',
    category: '生成',
    definition: '控制模型输出随机性的参数。',
    detail: 'Temperature越高，输出越随机、创造性越强；Temperature越低，输出越确定、保守。通常在0.1到1.0之间调整。',
    related: ['Top-p', 'Sampling', 'Generation'],
  },
  {
    term: 'Hallucination (幻觉)',
    category: '问题',
    definition: '模型生成看似合理但实际错误或虚构的内容。',
    detail: '幻觉是大语言模型的固有问题，源于模型基于概率生成文本而非真实理解事实。可通过RAG、事实核查等方法缓解。',
    related: ['RAG', 'Fact-checking', 'Grounding'],
  },
  {
    term: 'RAG',
    category: '技术',
    definition: 'Retrieval-Augmented Generation，检索增强生成。',
    detail: 'RAG结合信息检索和文本生成，先从外部知识库检索相关信息，再让模型基于检索结果生成回答，有效减少幻觉。',
    related: ['Vector DB', 'Embedding', 'Hallucination'],
  },
  {
    term: 'LoRA',
    category: '训练',
    definition: 'Low-Rank Adaptation，低秩适应，一种高效的微调方法。',
    detail: 'LoRA通过引入低秩矩阵来微调预训练模型，只训练少量参数，大幅减少计算和存储成本，同时保持模型性能。',
    related: ['Fine-tuning', 'PEFT', 'Adapter'],
  },
  {
    term: 'Context Window (上下文窗口)',
    category: '基础',
    definition: '模型一次能处理的最大token数量。',
    detail: '上下文窗口决定了模型能"记住"多少信息。长上下文模型可以处理整本书、长文档或复杂的多轮对话。',
    related: ['Token', 'Long Context', 'RAG'],
  },
  {
    term: 'RLHF',
    category: '训练',
    definition: 'Reinforcement Learning from Human Feedback，基于人类反馈的强化学习。',
    detail: 'RLHF通过人类对模型输出的偏好反馈来训练奖励模型，再用强化学习优化语言模型，使输出更符合人类期望。',
    related: ['PPO', 'Reward Model', 'Alignment'],
  },
];

const categories = ['全部', '基础', '架构', '训练', '应用', '生成', '技术', '问题'];

export default function Glossary() {
  const sectionRef = useRef<HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTerm, setSelectedTerm] = useState<typeof glossaryTerms[0] | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.glossary-item');
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

  const filteredTerms = glossaryTerms.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (term: string) => {
    if (bookmarked.includes(term)) {
      setBookmarked(bookmarked.filter((t) => t !== term));
    } else {
      setBookmarked([...bookmarked, term]);
    }
  };

  return (
    <section ref={sectionRef} id="glossary" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="glossary-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BookOpen className="w-4 h-4" />
            <span>术语词典</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            LLM<span className="text-gradient">术语表</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            快速查阅大语言模型领域的核心概念和术语
          </p>
        </div>

        {/* Search & Filter */}
        <div className="glossary-item flex flex-col md:flex-row items-center gap-4 mb-8 opacity-0">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索术语..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-spacex-orange transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-spacex-orange text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms Grid */}
        <div className="glossary-item grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-0">
          {filteredTerms.map((term) => (
            <div
              key={term.term}
              onClick={() => setSelectedTerm(term)}
              className="group p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/50 cursor-pointer transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                  {term.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(term.term);
                  }}
                  className={`transition-colors ${
                    bookmarked.includes(term.term)
                      ? 'text-spacex-orange'
                      : 'text-white/20 hover:text-white/60'
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={bookmarked.includes(term.term) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h4 className="font-semibold mb-2 group-hover:text-spacex-orange transition-colors">
                {term.term}
              </h4>
              <p className="text-sm text-white/60 line-clamp-2">{term.definition}</p>
              <div className="flex items-center gap-1 mt-3 text-spacex-orange text-sm">
                <span>查看详情</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTerms.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">未找到匹配的术语</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedTerm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTerm(null)}
          >
            <div
              className="w-full max-w-2xl p-8 rounded-2xl bg-[#1a1a2e] border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs bg-spacex-orange/20 text-spacex-orange mb-3 inline-block">
                    {selectedTerm.category}
                  </span>
                  <h3 className="text-2xl font-bold">{selectedTerm.term}</h3>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white/40 mb-2">定义</h4>
                  <p className="text-lg">{selectedTerm.definition}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/40 mb-2">详细说明</h4>
                  <p className="text-white/70 leading-relaxed">{selectedTerm.detail}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/40 mb-2">相关术语</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.related.map((related) => (
                      <span
                        key={related}
                        className="px-3 py-1 rounded-lg text-sm bg-white/5 text-white/60 border border-white/10"
                      >
                        {related}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
