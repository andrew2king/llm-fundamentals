import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Award, BookOpen, CheckCircle, Circle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

gsap.registerPlugin(ScrollTrigger);

// 所有 section 列表 - 直接定义避免导入问题
const ALL_SECTIONS = [
  'learning-path',
  'core-knowledge',
  'what-is-llm',
  'core-concepts',
  'architecture',
  'visualizer',
  'training',
  'code',
  'stats',
  'compare',
  'benchmarks',
  'safety',
  'applications',
  'rag',
  'rag-evaluation',
  'tool-calling',
  'structured-output',
  'long-context',
  'deployment',
  'cases',
  'agent-system',
  'agents',
  'agent-flow',
  'agent-teams',
  'prompt-skill',
  'prompt-advanced',
  'prompt-library',
  'skills',
  'skill-library',
  'skill-ecosystem',
  'multimodal',
  'papers',
  'videos',
  'glossary',
  'quiz',
  'calculator',
  'resource-hub',
  'resource-library',
  'resources',
];

const sectionNames: Record<string, string> = {
  'learning-path': '学习路径',
  'core-knowledge': '核心知识',
  'what-is-llm': '什么是LLM',
  'core-concepts': '核心概念',
  'architecture': '架构原理',
  'visualizer': '注意力可视化',
  'training': '模型训练',
  'code': '代码示例',
  'stats': '统计数据',
  'compare': '模型对比',
  'benchmarks': '评估基准',
  'safety': '安全对齐',
  'applications': '应用场景',
  'rag': 'RAG专题',
  'rag-evaluation': 'RAG评估',
  'tool-calling': '工具调用',
  'structured-output': '结构化输出',
  'long-context': '长上下文',
  'deployment': '部署工程',
  'cases': '案例分析',
  'agent-system': 'Agent系统',
  'agents': 'Agent基础',
  'agent-flow': 'Agent流程',
  'agent-teams': 'Agent团队',
  'prompt-skill': 'Prompt&Skill',
  'prompt-advanced': 'Prompt进阶',
  'prompt-library': 'Prompt库',
  'skills': 'Skill工具',
  'skill-library': 'Skill库',
  'skill-ecosystem': 'Skill生态',
  'multimodal': '多模态',
  'papers': '论文库',
  'videos': '视频教程',
  'glossary': '术语表',
  'quiz': '知识测验',
  'calculator': '参数计算器',
  'resource-hub': '资源中心',
  'resource-library': '资源库',
  'resources': '探索资源',
};

export default function Progress() {
  const sectionRef = useRef<HTMLElement>(null);
  const userContext = useUser();
  const [showAll, setShowAll] = useState(false);

  // 确保 learningProgress 有默认值 - 使用多重保护
  const learningProgress = userContext?.learningProgress;
  const getOverallProgress = userContext?.getOverallProgress || (() => 0);
  const progress = {
    completedSections: learningProgress?.completedSections || [],
    visitedSections: learningProgress?.visitedSections || [],
    quizScores: learningProgress?.quizScores || {},
    lastVisit: learningProgress?.lastVisit || '',
  };

  // 如果 userContext 为 null，显示默认状态
  if (!userContext) {
    return (
      <section ref={sectionRef} id="progress" className="relative py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">学习进度</h2>
            <p className="text-white/60">加载中...</p>
          </div>
        </div>
      </section>
    );
  }

  const overallProgress = getOverallProgress();
  const visitedCount = progress.visitedSections.length;
  const completedCount = progress.completedSections.length;

  const displayedSections = showAll
    ? (ALL_SECTIONS || [])
    : (ALL_SECTIONS || []).slice(0, 12);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.progress-item');
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} id="progress" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="progress-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>学习进度</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            我的<span className="text-gradient">学习进度</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            追踪你的学习旅程，完成所有模块即可获得学习证书
          </p>
        </div>

        {/* Stats Cards */}
        <div className="progress-item grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 opacity-0">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <div className="text-4xl font-bold text-spacex-orange mb-2">
              {overallProgress}%
            </div>
            <div className="text-sm text-white/60">整体进度</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {completedCount}
            </div>
            <div className="text-sm text-white/60">已完成模块</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {visitedCount}
            </div>
            <div className="text-sm text-white/60">已浏览模块</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {Object.keys(progress.quizScores).length}
            </div>
            <div className="text-sm text-white/60">完成测验</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-item mb-12 opacity-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">学习进度</span>
            <span className="text-sm font-medium">{overallProgress}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-spacex-blue to-spacex-orange transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Section List */}
        <div className="progress-item opacity-0">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-spacex-orange" />
            模块进度
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedSections.map((sectionId) => {
              const isCompleted = progress.completedSections.includes(sectionId);
              const isVisited = progress.visitedSections.includes(sectionId);
              const name = sectionNames[sectionId] || sectionId;

              return (
                <button
                  key={sectionId}
                  onClick={() => scrollToSection(sectionId)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-500/10 border border-green-500/30'
                      : isVisited
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.05]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isVisited ? (
                    <Circle className="w-5 h-5 text-blue-400 fill-blue-400/30" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/30" />
                  )}
                  <span className={`text-sm ${isCompleted ? 'text-green-400' : isVisited ? 'text-blue-300' : 'text-white/70'}`}>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>

          {!showAll && (ALL_SECTIONS || []).length > 12 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 mx-auto block text-sm text-spacex-orange hover:underline"
            >
              显示全部 {(ALL_SECTIONS || []).length} 个模块
            </button>
          )}
        </div>

        {/* Certificate CTA */}
        {overallProgress >= 80 && (
          <div className="progress-item mt-12 p-6 rounded-2xl bg-gradient-to-r from-spacex-blue/20 to-spacex-orange/20 border border-white/10 text-center opacity-0">
            <Award className="w-12 h-12 text-spacex-orange mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">恭喜你！</h3>
            <p className="text-white/60 mb-4">
              你已完成 {overallProgress}% 的学习内容，可以获取学习证书了！
            </p>
            <button
              onClick={() => scrollToSection('certificate')}
              className="px-6 py-3 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors"
            >
              获取证书
            </button>
          </div>
        )}
      </div>
    </section>
  );
}