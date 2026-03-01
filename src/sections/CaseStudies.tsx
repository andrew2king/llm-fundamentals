import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Briefcase,
  Code,
  MessageSquare,
  Search,
  FileText,
  Bot,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  X,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const caseStudies = [
  {
    id: 1,
    title: '智能客服机器人',
    company: '某电商平台',
    industry: '电商',
    icon: Bot,
    description: '基于大语言模型构建的智能客服系统，能够处理90%以上的常见咨询问题。',
    challenge: '人工客服成本高，响应慢，无法24小时服务，高峰期排队严重。',
    solution: '使用GPT-4构建智能客服机器人，结合RAG技术接入商品知识库，实现精准回答。',
    results: [
      '客服成本降低 70%',
      '平均响应时间从 5分钟 降至 3秒',
      '客户满意度从 82% 提升至 94%',
      '问题解决率达到 89%',
    ],
    tech: ['GPT-4', 'RAG', 'Vector DB', 'FastAPI'],
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 2,
    title: '代码辅助编程',
    company: '某科技公司',
    industry: '软件开发',
    icon: Code,
    description: '为开发团队提供智能代码补全、Bug检测和代码审查功能。',
    challenge: '开发人员花费大量时间在重复性编码和Debug上，影响创新效率。',
    solution: '基于Codex模型开发内部代码助手，集成到IDE中，提供实时代码建议。',
    results: [
      '编码效率提升 35%',
      'Bug检出率提升 45%',
      '代码审查时间减少 50%',
      '新人上手时间缩短 60%',
    ],
    tech: ['Codex', 'VS Code Extension', 'TypeScript', 'Node.js'],
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 3,
    title: '智能文档处理',
    company: '某金融机构',
    industry: '金融',
    icon: FileText,
    description: '自动化处理合同、报告等金融文档，提取关键信息并生成摘要。',
    challenge: '每天处理数千份文档，人工审核耗时耗力，容易出错。',
    solution: '使用LangChain构建文档处理流水线，结合OCR和LLM实现端到端自动化。',
    results: [
      '文档处理速度提升 10倍',
      '人工审核工作量减少 80%',
      '信息提取准确率达到 96%',
      '年度节省成本 500万+',
    ],
    tech: ['GPT-4', 'LangChain', 'PaddleOCR', 'PostgreSQL'],
    color: 'from-purple-500/20 to-violet-500/20',
  },
  {
    id: 4,
    title: '智能搜索问答',
    company: '某知识库平台',
    industry: '教育',
    icon: Search,
    description: '基于企业知识库的智能问答系统，员工可以快速找到所需信息。',
    challenge: '企业知识分散，员工查找信息困难，培训成本高。',
    solution: '构建RAG系统，将企业文档向量化存储，实现语义搜索和精准问答。',
    results: [
      '信息查找时间减少 75%',
      '培训成本降低 60%',
      '员工满意度提升 40%',
      '知识复用率提升 3倍',
    ],
    tech: ['Llama 2', 'ChromaDB', 'Sentence-Transformers', 'React'],
    color: 'from-orange-500/20 to-amber-500/20',
  },
  {
    id: 5,
    title: '多语言内容本地化',
    company: '某游戏公司',
    industry: '游戏',
    icon: MessageSquare,
    description: '自动化游戏内容翻译和本地化，支持20+语言。',
    challenge: '游戏内容更新频繁，传统翻译流程慢，成本高。',
    solution: '使用GPT-4进行初翻，结合术语库和风格指南，人工审核后发布。',
    results: [
      '翻译成本降低 65%',
      '本地化周期从 2周 缩短至 2天',
      '支持语言从 5种 扩展至 23种',
      '翻译质量评分 4.5/5',
    ],
    tech: ['GPT-4', 'Translation Memory', 'Python', 'Airflow'],
    color: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 6,
    title: '销售助手',
    company: '某B2B企业',
    industry: '销售',
    icon: Briefcase,
    description: '为销售团队提供客户洞察、话术建议和合同生成。',
    challenge: '销售人员难以快速了解客户背景，准备销售材料耗时。',
    solution: '集成CRM数据，使用LLM生成客户画像和销售话术，自动起草合同。',
    results: [
      '销售准备时间减少 70%',
      '成交率提升 25%',
      '合同起草时间从 2小时 降至 10分钟',
      '销售团队规模扩大 2倍',
    ],
    tech: ['Claude', 'Salesforce API', 'Next.js', 'Prisma'],
    color: 'from-teal-500/20 to-cyan-500/20',
  },
];

const industries = ['全部', '电商', '软件开发', '金融', '教育', '游戏', '销售'];

export default function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedIndustry, setSelectedIndustry] = useState('全部');
  const [selectedCase, setSelectedCase] = useState<typeof caseStudies[0] | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.case-item');
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

  const filteredCases = caseStudies.filter(
    (c) => selectedIndustry === '全部' || c.industry === selectedIndustry
  );

  return (
    <section ref={sectionRef} id="cases" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="case-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Briefcase className="w-4 h-4" />
            <span>实战案例</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            企业应用<span className="text-gradient">案例</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            探索大语言模型在各行业的成功应用，了解真实的落地效果
          </p>
        </div>

        {/* Industry Filter */}
        <div className="case-item flex flex-wrap items-center justify-center gap-2 mb-12 opacity-0">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedIndustry === ind
                  ? 'bg-spacex-orange text-white'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseStudy) => (
            <div
              key={caseStudy.id}
              onClick={() => setSelectedCase(caseStudy)}
              className="case-item group cursor-pointer opacity-0"
            >
              <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/50 transition-all duration-300 h-full">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${caseStudy.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-spacex-orange/20 group-hover:scale-110 transition-all">
                    <caseStudy.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Industry Tag */}
                  <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60 mb-2 inline-block">
                    {caseStudy.industry}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-spacex-orange transition-colors">
                    {caseStudy.title}
                  </h3>

                  {/* Company */}
                  <p className="text-sm text-white/40 mb-3">{caseStudy.company}</p>

                  {/* Description */}
                  <p className="text-sm text-white/60 line-clamp-2 mb-4">{caseStudy.description}</p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caseStudy.tech.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60"
                      >
                        {tech}
                      </span>
                    ))}
                    {caseStudy.tech.length > 3 && (
                      <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60">
                        +{caseStudy.tech.length - 3}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-spacex-orange text-sm">
                    <span>查看详情</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Case Detail Modal */}
        {selectedCase && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCase(null)}
          >
            <div
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-[#1a1a2e] border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedCase.color} flex items-center justify-center`}
                  >
                    <selectedCase.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60 mb-2 inline-block">
                      {selectedCase.industry}
                    </span>
                    <h3 className="text-2xl font-bold">{selectedCase.title}</h3>
                    <p className="text-white/60">{selectedCase.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Challenge */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <h4 className="font-semibold mb-2 text-red-400 flex items-center gap-2">
                    挑战
                  </h4>
                  <p className="text-white/80">{selectedCase.challenge}</p>
                </div>

                {/* Solution */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h4 className="font-semibold mb-2 text-blue-400 flex items-center gap-2">
                    解决方案
                  </h4>
                  <p className="text-white/80">{selectedCase.solution}</p>
                </div>

                {/* Results */}
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h4 className="font-semibold mb-3 text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    成果
                  </h4>
                  <ul className="space-y-2">
                    {selectedCase.results.map((result, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="font-semibold mb-3">技术栈</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 rounded-lg text-sm bg-white/10 text-white/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4 pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                    了解更多
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                    联系咨询
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
