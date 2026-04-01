import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

type SectionItem = {
  id: string;
  title: string;
  keywords: string[];
};

type SiteSearchProps = {
  isOpen: boolean;
  onClose: () => void;
};

const sections: SectionItem[] = [
  { id: 'concepts', title: '概念', keywords: ['入门', '基础', '定义'] },
  { id: 'architecture', title: '架构', keywords: ['Transformer', '模型结构'] },
  { id: 'visualizer', title: '可视化', keywords: ['注意力', '演示'] },
  { id: 'code', title: '代码示例', keywords: ['示例', '实现'] },
  { id: 'learning-path', title: '学习路径', keywords: ['路线', '进阶'] },
  { id: 'core-knowledge', title: '核心知识', keywords: ['概念', '架构', '训练'] },
  { id: 'applications', title: '应用与增强', keywords: ['RAG', '工具', '结构化'] },
  { id: 'agent-system', title: 'Agent 系统', keywords: ['Agent', '智能体'] },
  { id: 'prompt-skill', title: 'Prompt & Skill', keywords: ['提示', '技能'] },
  { id: 'multimodal', title: '多模态', keywords: ['图像', '视频', '语音'] },
  { id: 'evaluation-safety', title: '评估与安全', keywords: ['评估', '安全', '合规'] },
  { id: 'resource-hub', title: '资源库入口', keywords: ['资源', '论文', '视频'] },
  { id: 'compare', title: '模型对比', keywords: ['对比', '选型'] },
  { id: 'benchmarks', title: '评估基准', keywords: ['评估', '基准', 'benchmark'] },
  { id: 'safety', title: '安全与对齐', keywords: ['安全', '对齐', '风险'] },
  { id: 'deployment', title: '部署与工程', keywords: ['部署', 'RAG', '工程'] },
  { id: 'agents', title: 'Agent 基础', keywords: ['Agent', '智能体'] },
  { id: 'agent-flow', title: 'Agent 流程可视化', keywords: ['流程', '执行'] },
  { id: 'agent-teams', title: 'Agent Teams', keywords: ['协作', '多Agent'] },
  { id: 'prompt-advanced', title: 'Prompt 进阶', keywords: ['提示', 'prompt'] },
  { id: 'prompt-library', title: 'Prompt 模板库', keywords: ['模板', '复制'] },
  { id: 'skills', title: 'Skill / Tool', keywords: ['技能', '工具'] },
  { id: 'skill-library', title: 'Skill 案例库', keywords: ['技能库', '模板'] },
  { id: 'skill-ecosystem', title: 'Skill 生态', keywords: ['生态', 'registry', 'market'] },
  { id: 'rag', title: 'RAG 专题', keywords: ['检索', 'RAG'] },
  { id: 'rag-evaluation', title: 'RAG 评测', keywords: ['评估', '监控'] },
  { id: 'tool-calling', title: '工具调用', keywords: ['Function Calling', '工具'] },
  { id: 'structured-output', title: '结构化输出', keywords: ['JSON', 'schema'] },
  { id: 'long-context', title: '长上下文', keywords: ['上下文', '压缩'] },
  { id: 'multimodal-understanding', title: '多模态理解', keywords: ['图文', '理解'] },
  { id: 'image-gen', title: '图像生成', keywords: ['图像', '生成'] },
  { id: 'video-gen', title: '视频生成', keywords: ['视频', '生成'] },
  { id: 'audio-gen', title: '语音生成', keywords: ['语音', 'TTS'] },
  { id: 'multimodal-agent', title: '多模态 Agent', keywords: ['多模态', 'agent'] },
  { id: 'multimodal-playbook', title: '多模态实战流程', keywords: ['流程', '方法论'] },
  { id: 'cases', title: '案例', keywords: ['case', '应用'] },
  { id: 'papers', title: '论文库', keywords: ['论文', 'paper'] },
  { id: 'videos', title: '视频教程', keywords: ['视频', '课程'] },
  { id: 'glossary', title: '术语表', keywords: ['术语', '词汇'] },
  { id: 'quiz', title: '测验', keywords: ['测验', '答题'] },
  { id: 'calculator', title: '参数计算器', keywords: ['计算', '参数'] },
  { id: 'resource-library', title: '资源库', keywords: ['资源', '工具', '课程'] },
  { id: 'resources', title: '继续探索', keywords: ['资源', '探索'] },
];

export default function SiteSearch({ isOpen, onClose }: SiteSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sections;
    return sections.filter((item) => {
      return (
        item.title.toLowerCase().includes(term) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(term))
      );
    });
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="搜索"
    >
      <div className="mt-24 w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-[#0b0b14] shadow-xl">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/60" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索页面内容..."
            className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
            aria-label="搜索"
            autoComplete="off"
          />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
            aria-label="关闭搜索"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto" role="listbox" aria-label="搜索结果">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const el = document.querySelector(`#${item.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
                onClose();
              }}
              className="w-full text-left px-5 py-4 border-b border-white/5 hover:bg-white/[0.04] transition-colors"
              role="option"
            >
              <div className="text-white font-medium">{item.title}</div>
              <div className="text-xs text-white/40 mt-1">#{item.id}</div>
            </button>
          ))}
          {results.length === 0 && (
            <div className="px-5 py-8 text-center text-white/40" role="status">
              没有找到匹配结果
            </div>
          )}
        </div>
        <div className="px-5 py-3 text-xs text-white/40 flex items-center justify-between" aria-hidden="true">
          <span>快捷键: ⌘/Ctrl + K</span>
          <span>输入 / 打开搜索</span>
        </div>
      </div>
    </div>
  );
}
