import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Clock, ArrowRight, CheckCircle, Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const courses = [
  {
    id: 'agent-dev',
    title: 'Agent 开发实战',
    subtitle: '从零开始构建智能 Agent 系统',
    description: '4大模块24课时，涵盖Agent基础概念、LangChain核心组件、Agent开发进阶、3个完整实战项目。',
    price: 29.9,
    originalPrice: 99,
    duration: '8 小时',
    lessons: 24,
    students: 0,
    rating: 0,
    level: '中级',
    tags: ['Agent', 'LangChain', '实战'],
    features: [
      'Agent 核心概念与架构',
      'LangChain 全栈实战',
      '智能客服/文档问答/数据分析 Agent',
      'Multi-Agent 协作开发',
      '源码与项目模板',
    ],
    isPaid: true,
    previewLessons: 3,
    buyUrl: 'https://t.zsxq.com/agent-dev', // 创建知识星球后替换
    status: 'available',
  },
  {
    id: 'rag-guide',
    title: 'RAG 实战指南',
    subtitle: '构建企业级检索增强生成系统',
    description: '从数据治理到评估监控，全面掌握 RAG 系统设计与实现。',
    price: 29.9,
    originalPrice: 99,
    duration: '6 小时',
    lessons: 18,
    students: 0,
    rating: 0,
    level: '中级',
    tags: ['RAG', '向量数据库', '企业应用'],
    features: [
      'RAG 架构设计',
      '向量数据库选型',
      '检索策略优化',
      'Rerank 重排技术',
      '评估与监控',
    ],
    isPaid: true,
    previewLessons: 2,
    buyUrl: 'https://t.zsxq.com/rag-guide',
    status: 'coming_soon',
  },
  {
    id: 'prompt-eng',
    title: 'Prompt 工程进阶',
    subtitle: '打造高质量 AI 对话体验',
    description: '从基础技巧到高级策略，掌握与 LLM 有效沟通的艺术。',
    price: 19.9,
    originalPrice: 69,
    duration: '4 小时',
    lessons: 12,
    students: 0,
    rating: 0,
    level: '入门',
    tags: ['Prompt', '对话设计', '技巧'],
    features: [
      'Prompt 基础原则',
      'Few-shot 与 CoT',
      '结构化输出技巧',
      '多轮对话设计',
      '实战模板库',
    ],
    isPaid: true,
    previewLessons: 2,
    buyUrl: 'https://t.zsxq.com/prompt-eng',
    status: 'coming_soon',
  },
];

export default function Courses() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.course-item');
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

  return (
    <section ref={sectionRef} id="courses" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="course-item text-center mb-16 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BookOpen className="w-4 h-4" />
            <span>付费课程</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            深度学习<span className="text-gradient">实战课程</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            系统化的实战课程，助你从入门到精通。每门课程都有免费试看内容。
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-item group relative rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-spacex-orange/50 transition-all duration-300 opacity-0"
            >
              {/* Status Badge */}
              {course.status === 'coming_soon' && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                  即将上线
                </div>
              )}
              {course.status === 'available' && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  已上线
                </div>
              )}

              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-spacex-orange transition-colors">
                  {course.title}
                </h3>
                <p className="text-white/60 text-sm mb-4">{course.subtitle}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded text-xs bg-white/5 text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons} 课时
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {course.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-2xl font-bold text-spacex-orange">
                    ¥{course.price}
                  </span>
                  <span className="text-sm text-white/40 line-through">
                    ¥{course.originalPrice}
                  </span>
                </div>

                {/* CTA */}
                {course.status === 'available' ? (
                  <a
                    href={course.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors flex items-center justify-center gap-2"
                  >
                    立即购买
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-white/10 text-white/50 font-medium cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    敬请期待
                  </button>
                )}

                {/* Preview info */}
                <p className="text-center text-xs text-white/40 mt-3">
                  前 {course.previewLessons} 课时免费试看
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="course-item text-center mt-12 opacity-0">
          <p className="text-white/60 mb-4">
            所有课程均支持 7 天无理由退款
          </p>
          <a
            href="https://t.zsxq.com/llm-fundamentals"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            加入学习社群
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}