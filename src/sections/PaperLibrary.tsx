import { useState, useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Search,
  ExternalLink,
  Download,
  BookOpen,
  Calendar,
  Users,
  Star,
  Filter,
  ChevronDown,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type PaperEntry = {
  id: number;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  citations: number;
  abstract: string;
  tags: string[];
  pdfUrl: string;
  codeUrl: string;
  difficulty: string;
  readTime: string;
  isClassic: boolean;
};

type PaperData = {
  lastUpdated: string;
  source: string;
  papers: PaperEntry[];
};

const fallbackData: PaperData = {
  lastUpdated: '2026-02-25',
  source: '本地示例数据',
  papers: [
  {
    id: 1,
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    year: 2017,
    venue: 'NeurIPS',
    citations: 127000,
    abstract: '提出了Transformer架构，完全基于注意力机制，无需递归和卷积，在机器翻译任务上取得了最先进的成果。',
    tags: ['Transformer', 'Attention', '架构'],
    pdfUrl: 'https://arxiv.org/abs/1706.03762',
    codeUrl: 'https://github.com/tensorflow/tensor2tensor',
    difficulty: '中级',
    readTime: '30分钟',
    isClassic: true,
  },
  {
    id: 2,
    title: 'BERT: Pre-training of Deep Bidirectional Transformers',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    year: 2019,
    venue: 'NAACL',
    citations: 89000,
    abstract: '引入双向Transformer预训练，通过掩码语言模型和下一句预测任务，在多项NLP任务上取得突破。',
    tags: ['BERT', '预训练', '双向编码'],
    pdfUrl: 'https://arxiv.org/abs/1810.04805',
    codeUrl: 'https://github.com/google-research/bert',
    difficulty: '中级',
    readTime: '25分钟',
    isClassic: true,
  },
  {
    id: 3,
    title: 'Language Models are Few-Shot Learners (GPT-3)',
    authors: ['Tom B Brown', 'Benjamin Mann', 'Nick Ryder', 'Melanie Subbiah', 'Jared Kaplan', 'Prafulla Dhariwal', 'Arvind Neelakantan', 'Pranav Shyam'],
    year: 2020,
    venue: 'NeurIPS',
    citations: 45000,
    abstract: '展示了1750亿参数的语言模型通过少量示例就能完成各种任务，无需梯度更新或微调。',
    tags: ['GPT-3', 'Few-shot', '大规模'],
    pdfUrl: 'https://arxiv.org/abs/2005.14165',
    codeUrl: 'https://github.com/openai/gpt-3',
    difficulty: '高级',
    readTime: '45分钟',
    isClassic: true,
  },
  {
    id: 4,
    title: 'Llama 2: Open Foundation and Fine-Tuned Chat Models',
    authors: ['Hugo Touvron', 'Louis Martin', 'Kevin Stone', 'Peter Albert', 'Amjad Almahairi', 'Yasmine Babaei', 'Nikolay Bashlykov'],
    year: 2023,
    venue: 'arXiv',
    citations: 8000,
    abstract: 'Meta发布的开源大语言模型系列，包括7B到70B参数，以及专门优化对话的Chat版本。',
    tags: ['Llama', '开源', '对话'],
    pdfUrl: 'https://arxiv.org/abs/2307.09288',
    codeUrl: 'https://github.com/meta-llama/llama',
    difficulty: '中级',
    readTime: '35分钟',
    isClassic: false,
  },
  {
    id: 5,
    title: 'Chain-of-Thought Prompting Elicits Reasoning in LLMs',
    authors: ['Jason Wei', 'Xuezhi Wang', 'Dale Schuurmans', 'Maarten Bosma', 'Brian Ichter', 'Fei Xia', 'Ed Chi', 'Quoc Le', 'Denny Zhou'],
    year: 2022,
    venue: 'NeurIPS',
    citations: 12000,
    abstract: '通过思维链提示，让大型语言模型生成中间推理步骤，显著提升复杂推理能力。',
    tags: ['CoT', '推理', '提示工程'],
    pdfUrl: 'https://arxiv.org/abs/2201.11903',
    codeUrl: 'https://github.com/google-research/chain-of-thought',
    difficulty: '初级',
    readTime: '20分钟',
    isClassic: true,
  },
  {
    id: 6,
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: ['Edward Hu', 'Yelong Shen', 'Phillip Wallis', 'Zeyuan Allen-Zhu', 'Yuanzhi Li', 'Shean Wang', 'Lu Wang', 'Weizhu Chen'],
    year: 2021,
    venue: 'ICLR',
    citations: 9000,
    abstract: '提出低秩适应方法，通过训练少量参数来微调大模型，大幅减少计算和存储成本。',
    tags: ['LoRA', '微调', '高效训练'],
    pdfUrl: 'https://arxiv.org/abs/2106.09685',
    codeUrl: 'https://github.com/microsoft/LoRA',
    difficulty: '高级',
    readTime: '40分钟',
    isClassic: true,
  },
  {
    id: 7,
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP',
    authors: ['Patrick Lewis', 'Ethan Perez', 'Aleksandra Piktus', 'Fabio Petroni', 'Vladimir Karpukhin', 'Naman Goyal', 'Heinrich Küttler'],
    year: 2020,
    venue: 'NeurIPS',
    citations: 7000,
    abstract: 'RAG将预训练语言模型与知识检索结合，让模型在生成时访问外部知识库。',
    tags: ['RAG', '检索', '知识增强'],
    pdfUrl: 'https://arxiv.org/abs/2005.11401',
    codeUrl: 'https://github.com/huggingface/transformers',
    difficulty: '中级',
    readTime: '30分钟',
    isClassic: true,
  },
  {
    id: 8,
    title: 'Scaling Laws for Neural Language Models',
    authors: ['Jared Kaplan', 'Sam McCandlish', 'Tom Henighan', 'Tom B Brown', 'Benjamin Chess', 'Rewon Child', 'Scott Gray', 'Alec Radford'],
    year: 2020,
    venue: 'arXiv',
    citations: 5000,
    abstract: '系统研究了语言模型的缩放规律，发现性能与模型大小、数据量和计算量呈幂律关系。',
    tags: ['缩放规律', '理论', '分析'],
    pdfUrl: 'https://arxiv.org/abs/2001.08361',
    codeUrl: '',
    difficulty: '高级',
    readTime: '50分钟',
    isClassic: true,
  },
  {
    id: 9,
    title: 'InstructGPT: Training Language Models to Follow Instructions',
    authors: ['Long Ouyang', 'Jeffrey Wu', 'Xu Jiang', 'Diogo Almeida', 'Carroll Wainwright', 'Pamela Mishkin', 'Chong Zhang', 'Sandhini Agarwal'],
    year: 2022,
    venue: 'NeurIPS',
    citations: 6000,
    abstract: '使用人类反馈强化学习(RLHF)微调GPT-3，使其更好地遵循用户意图。',
    tags: ['RLHF', '指令微调', '对齐'],
    pdfUrl: 'https://arxiv.org/abs/2203.02155',
    codeUrl: '',
    difficulty: '中级',
    readTime: '35分钟',
    isClassic: true,
  },
  {
    id: 10,
    title: 'A Survey of Large Language Models',
    authors: ['Wayne Xin Zhao', 'Kun Zhou', 'Junyi Li', 'Tianyi Tang', 'Xiaolei Wang', 'Yupeng Hou', 'Yingqian Min', 'Beichen Zhang'],
    year: 2023,
    venue: 'arXiv',
    citations: 3000,
    abstract: '全面综述大语言模型的发展历程、关键技术、应用场景和未来方向。',
    tags: ['综述', '调查', '全面'],
    pdfUrl: 'https://arxiv.org/abs/2303.18223',
    codeUrl: '',
    difficulty: '初级',
    readTime: '120分钟',
    isClassic: false,
  },
  ],
};

export default function PaperLibrary() {
  const sectionRef = useRef<HTMLElement>(null);
  const [paperData, setPaperData] = useState<PaperData>(fallbackData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState('全部');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperEntry | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.paper-item');
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
    fetch('/data/papers.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<PaperData>;
      })
      .then((data) => {
        if (!isMounted) return;
        if (data?.papers?.length) {
          setPaperData(data);
          setLoadError(null);
        } else {
          setLoadError('数据为空，已回退到本地示例数据。');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('论文数据加载失败，已回退到本地示例数据。');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const tags = new Set<string>();
    paperData.papers.forEach((paper) => {
      paper.tags.forEach((tag) => tags.add(tag));
    });
    return ['全部', ...Array.from(tags)];
  }, [paperData.papers]);

  const difficulties = useMemo(() => {
    const diffs = new Set<string>();
    paperData.papers.forEach((paper) => diffs.add(paper.difficulty));
    return ['全部', ...Array.from(diffs)];
  }, [paperData.papers]);

  // Derive valid category and difficulty
  const validCategory = categories.includes(selectedCategory) ? selectedCategory : '全部';
  const validDifficulty = difficulties.includes(selectedDifficulty) ? selectedDifficulty : '全部';

  const filteredPapers = paperData.papers.filter((paper) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term.length === 0 ||
      paper.title.toLowerCase().includes(term) ||
      paper.abstract.toLowerCase().includes(term) ||
      paper.authors.some((a) => a.toLowerCase().includes(term));
    const matchesCategory =
      validCategory === '全部' || paper.tags.some((t) => t.includes(validCategory));
    const matchesDifficulty = validDifficulty === '全部' || paper.difficulty === validDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const formatCitations = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <section ref={sectionRef} id="papers" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="paper-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BookOpen className="w-4 h-4" />
            <span>论文库</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            经典论文<span className="text-gradient">收藏</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            精选大语言模型领域最具影响力的研究论文，从Transformer到GPT，一站式阅读
          </p>
        </div>

        {/* Search & Filters */}
        <div className="paper-item mb-8 opacity-0">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="搜索论文标题、作者或关键词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-spacex-orange transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                showFilters
                  ? 'bg-spacex-orange/20 border-spacex-orange text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>筛选</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-white/40 mb-2 block">主题分类</span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedCategory === cat
                            ? 'bg-spacex-orange text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-white/40 mb-2 block">难度等级</span>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedDifficulty === diff
                            ? 'bg-spacex-blue text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="paper-item flex items-center justify-between mb-6 opacity-0">
          <span className="text-white/60">
            共 <span className="text-white font-semibold">{filteredPapers.length}</span> 篇论文
            <span className="ml-3 text-xs text-white/40">
              更新: {paperData.lastUpdated} · 来源: {paperData.source}
              {loadError ? ` · ${loadError}` : ''}
            </span>
          </span>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
              经典论文
            </span>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="paper-item group p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/50 transition-all duration-300 opacity-0"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {paper.isClassic && (
                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-500 flex items-center gap-1">
                      <Star className="w-3 h-3" fill="currentColor" />
                      经典
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                    {paper.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-white/40 text-sm">
                  <Calendar className="w-4 h-4" />
                  {paper.year}
                </div>
              </div>

              {/* Title */}
              <h3
                onClick={() => setSelectedPaper(paper)}
                className="text-lg font-semibold mb-2 group-hover:text-spacex-orange transition-colors cursor-pointer"
              >
                {paper.title}
              </h3>

              {/* Authors */}
              <div className="flex items-center gap-1 text-sm text-white/40 mb-3">
                <Users className="w-4 h-4" />
                <span className="truncate">
                  {paper.authors.slice(0, 3).join(', ')}
                  {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
                </span>
              </div>

              {/* Abstract */}
              <p className="text-sm text-white/60 line-clamp-2 mb-4">{paper.abstract}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {paper.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-xs bg-spacex-blue/20 text-spacex-blue">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span>{paper.venue}</span>
                  <span>{formatCitations(paper.citations)} 引用</span>
                  <span>{paper.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-spacex-orange/20 hover:text-spacex-orange transition-all"
                    title="查看论文"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {paper.codeUrl && (
                    <a
                      href={paper.codeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-spacex-blue/20 hover:text-spacex-blue transition-all"
                      title="查看代码"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPapers.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">未找到匹配的论文</p>
          </div>
        )}

        {/* Paper Detail Modal */}
        {selectedPaper && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPaper(null)}
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-[#1a1a2e] border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPaper.isClassic && (
                      <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-500">
                        <Star className="w-3 h-3 inline" fill="currentColor" /> 经典
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                      {selectedPaper.difficulty}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{selectedPaper.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-white/40 mb-2">作者</h4>
                  <p className="text-white/80">{selectedPaper.authors.join(', ')}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-white/40 mb-1">发表年份</h4>
                    <p>{selectedPaper.year}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/40 mb-1">会议/期刊</h4>
                    <p>{selectedPaper.venue}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/40 mb-1">引用数</h4>
                    <p>{selectedPaper.citations.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/40 mb-1">阅读时间</h4>
                    <p>{selectedPaper.readTime}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/40 mb-2">摘要</h4>
                  <p className="text-white/80 leading-relaxed">{selectedPaper.abstract}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/40 mb-2">关键词</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPaper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg text-sm bg-spacex-blue/20 text-spacex-blue"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <a
                    href={selectedPaper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    查看论文
                  </a>
                  {selectedPaper.codeUrl && (
                    <a
                      href={selectedPaper.codeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      查看代码
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
