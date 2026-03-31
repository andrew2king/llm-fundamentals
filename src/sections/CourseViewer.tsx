import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

gsap.registerPlugin(ScrollTrigger);

// 课程数据
const courseData = {
  id: 'agent-dev',
  title: 'Agent 开发实战',
  description: '从零开始构建智能 Agent 系统',
  totalLessons: 24,
  totalHours: 8,
  modules: [
    {
      id: 'module-1',
      title: 'Agent 基础概念',
      lessons: 4,
      items: [
        {
          id: 'lesson-1',
          title: '什么是 Agent？',
          duration: '15分钟',
          content: `
# 课时 1：什么是 Agent？

## 一、定义

**Agent（智能体）** 是一个能够**自主感知环境、做出决策、执行行动**的智能系统。

用一句话概括：

> Agent = LLM + 规划能力 + 工具使用 + 记忆

## 二、与普通 LLM 应用的区别

| 特性 | 普通 LLM 应用 | Agent |
|------|--------------|-------|
| 交互模式 | 一问一答 | 多轮自主执行 |
| 工具使用 | 无或简单调用 | 主动选择和使用工具 |
| 记忆能力 | 无状态 | 持久记忆与上下文 |
| 决策能力 | 无 | 自主规划与决策 |

## 三、核心能力

1. **感知能力** - 理解用户意图和环境状态
2. **决策能力** - 任务规划、步骤分解、策略选择
3. **行动能力** - 工具调用、API 执行、结果输出
4. **记忆能力** - 短期记忆、长期记忆、工作记忆

## 四、应用场景

- 智能客服 Agent
- 数据分析 Agent
- 文档问答 Agent
- 代码助手 Agent
- 自动化工作流 Agent
          `,
        },
        {
          id: 'lesson-2',
          title: 'Agent 核心架构',
          duration: '20分钟',
          content: `
# 课时 2：Agent 核心架构

## 一、三层架构模型

\`\`\`
感知层 → 决策层 → 行动层
    ↑           ↓
    └─ 记忆层 ──┘
\`\`\`

## 二、各层职责

### 感知层
- 用户意图识别
- 多模态输入处理
- 环境状态感知

### 决策层
- 任务分解
- 行动规划
- 推理判断

### 行动层
- 工具调用
- API 执行
- 结果处理

### 记忆层
- 短期记忆（对话上下文）
- 长期记忆（知识存储）
- 工作记忆（任务状态）

## 三、架构设计原则

1. **单一职责** - 每个组件只做一件事
2. **松耦合** - 组件间通过接口交互
3. **可观测** - 每个步骤都有日志输出
4. **容错性** - 任何步骤都可能失败，需要处理
          `,
        },
        {
          id: 'lesson-3',
          title: '核心范式解析',
          duration: '25分钟',
          content: `
# 课时 3：核心范式解析

## 一、ReAct 范式

**ReAct = Reasoning + Acting**

交替进行思考和行动：
\`\`\`
思考 → 行动 → 观察 → 思考 → ...
\`\`\`

### 适用场景
- 需要调用多个工具的任务
- 信息收集与分析任务

## 二、Plan-and-Execute 范式

先规划，后执行：
\`\`\`
规划 → [步骤1, 步骤2, ...] → 逐步执行
\`\`\`

### 适用场景
- 复杂多步骤任务
- 可以预先规划的任务

## 三、Reflection 范式

执行 + 反思 + 改进：
\`\`\`
执行 → 反思 → 改进 → 执行 → ...
\`\`\`

### 适用场景
- 需要高质量输出的任务
- 创作类任务

## 四、范式选择

| 场景 | 推荐范式 |
|------|---------|
| 工具调用 | ReAct |
| 复杂任务 | Plan-and-Execute |
| 高质量输出 | Reflection |
          `,
        },
        {
          id: 'lesson-4',
          title: '技术路线选择',
          duration: '20分钟',
          content: `
# 课时 4：技术路线选择

## 一、三大技术路线

### Chain（链）
- 固定流程执行
- 适合标准化任务
- 成本可控

### RAG（检索增强）
- 知识检索增强
- 适合知识问答
- 准确性高

### Agent（智能体）
- 自主决策执行
- 适合开放式任务
- 灵活性强

## 二、选择决策树

\`\`\`
任务流程是否确定？
├─ 是 → Chain
└─ 否
    └─ 需要外部知识？
        ├─ 是 → RAG 或 Agent + RAG
        └─ 否 → Agent
\`\`\`

## 三、决策口诀

\`\`\`
流程固定用 Chain，
知识问答用 RAG，
复杂任务用 Agent，
组合使用效果佳。
\`\`\`
          `,
        },
      ],
    },
    {
      id: 'module-2',
      title: 'LangChain 核心组件',
      lessons: 6,
      items: [
        {
          id: 'lesson-5',
          title: 'LLM 与 Prompt 模板',
          duration: '25分钟',
          content: `# 课时 5：LLM 与 Prompt 模板\n\nLangChain 统一了不同模型的调用接口，支持动态 Prompt 生成。\n\n## 核心概念\n\n- **ChatOpenAI**: OpenAI 模型封装\n- **PromptTemplate**: 动态提示模板\n- **Few-shot**: 少样本提示技巧`,
        },
        {
          id: 'lesson-6',
          title: 'Memory 记忆系统',
          duration: '20分钟',
          content: `# 课时 6：Memory 记忆系统\n\n四种核心记忆类型：\n\n1. **ConversationBuffer** - 完整记忆\n2. **ConversationBufferWindow** - 滑动窗口\n3. **ConversationSummary** - 摘要记忆\n4. **VectorStoreMemory** - 向量记忆`,
        },
        {
          id: 'lesson-7',
          title: 'Tool 工具定义与调用',
          duration: '25分钟',
          content: `# 课时 7：Tool 工具定义与调用\n\nTool 是 Agent 与外部世界交互的桥梁。\n\n## 定义方式\n\n- @tool 装饰器\n- 继承 BaseTool\n- Tool 类实例化`,
        },
        {
          id: 'lesson-8',
          title: 'Chain 链式调用',
          duration: '20分钟',
          content: `# 课时 8：Chain 链式调用\n\n将多个组件按顺序连接，形成确定的处理流程。\n\n## 类型\n\n- **LLMChain** - 基础链\n- **SequentialChain** - 顺序链\n- **RouterChain** - 路由链`,
        },
        {
          id: 'lesson-9',
          title: 'OutputParser 结构化输出',
          duration: '20分钟',
          content: `# 课时 9：OutputParser 结构化输出\n\n将 LLM 文本输出解析为结构化数据。\n\n## 常用 Parser\n\n- **PydanticOutputParser** - 解析为 Pydantic 模型\n- **ListParser** - 解析列表\n- **OutputFixingParser** - 自动修复错误`,
        },
        {
          id: 'lesson-10',
          title: '回调与调试',
          duration: '15分钟',
          content: `# 课时 10：回调与调试\n\n## 回调机制\n\n在特定事件发生时执行自定义代码。\n\n## 调试工具\n\n- **verbose=True** - 详细输出\n- **LangSmith** - 可视化调试\n- **Token 监控** - 成本追踪`,
        },
      ],
    },
    {
      id: 'module-3',
      title: 'Agent 开发进阶',
      lessons: 6,
      items: [
        {
          id: 'lesson-11',
          title: 'AgentExecutor 原理解析',
          duration: '25分钟',
          content: `# 课时 11：AgentExecutor 原理解析\n\nAgentExecutor 是运行 Agent 的核心引擎。\n\n## 执行循环\n\n1. Agent 决策\n2. 工具调用\n3. 观察结果\n4. 判断是否完成`,
        },
        {
          id: 'lesson-12',
          title: '自定义 Tool 开发实战',
          duration: '30分钟',
          content: `# 课时 12：自定义 Tool 开发实战\n\n## 开发规范\n\n1. 清晰的描述\n2. 类型提示\n3. 错误处理\n4. 安全控制`,
        },
        {
          id: 'lesson-13',
          title: 'Multi-Agent 协作基础',
          duration: '30分钟',
          content: `# 课时 13：Multi-Agent 协作基础\n\n## LangGraph\n\n基于图结构的 Agent 编排框架。\n\n## 协作模式\n\n- 顺序协作\n- 条件分支\n- 并行协作\n- 循环迭代`,
        },
        {
          id: 'lesson-14',
          title: '错误处理与重试策略',
          duration: '20分钟',
          content: `# 课时 14：错误处理与重试策略\n\n## 错误类型\n\n- 输入错误\n- LLM 错误\n- 工具错误\n- 系统错误\n\n## 重试策略\n\n- 指数退避\n- 降级策略`,
        },
        {
          id: 'lesson-15',
          title: '流式输出与用户体验',
          duration: '20分钟',
          content: `# 课时 15：流式输出与用户体验\n\n## 实现\n\n- WebSocket\n- Server-Sent Events\n- 打字机效果`,
        },
        {
          id: 'lesson-16',
          title: '成本优化技巧',
          duration: '15分钟',
          content: `# 课时 16：成本优化技巧\n\n## 优化方向\n\n- Prompt 压缩\n- 缓存策略\n- 模型选择\n- 批量处理`,
        },
      ],
    },
    {
      id: 'module-4',
      title: '实战项目',
      lessons: 8,
      items: [
        {
          id: 'lesson-17',
          title: '智能客服 Agent - 架构设计',
          duration: '25分钟',
          content: `# 课时 17：智能客服 Agent - 架构设计\n\n## 项目目标\n\n- 自动回答常见问题\n- 查询订单、物流等业务数据\n- 处理简单投诉`,
        },
        {
          id: 'lesson-18',
          title: '智能客服 Agent - 知识库对接',
          duration: '30分钟',
          content: `# 课时 18：智能客服 Agent - 知识库对接\n\n## 知识库实现\n\n- 向量化存储\n- 相似度检索\n- 多轮对话问答`,
        },
        {
          id: 'lesson-19',
          title: '智能客服 Agent - 系统集成',
          duration: '25分钟',
          content: `# 课时 19：智能客服 Agent - 系统集成\n\n## 部署\n\n- FastAPI 服务\n- Docker 容器化\n- 监控告警`,
        },
        {
          id: 'lesson-20',
          title: '文档问答 Agent - 文档解析',
          duration: '30分钟',
          content: `# 课时 20：文档问答 Agent - 文档解析\n\n## 解析器\n\n- PDF 解析\n- Word 解析\n- Markdown 解析`,
        },
        {
          id: 'lesson-21',
          title: '文档问答 Agent - 检索策略',
          duration: '25分钟',
          content: `# 课时 21：文档问答 Agent - 检索策略\n\n## 检索方法\n\n- 向量检索\n- 关键词检索\n- 混合检索`,
        },
        {
          id: 'lesson-22',
          title: '数据分析 Agent - SQL生成',
          duration: '30分钟',
          content: `# 课时 22：数据分析 Agent - SQL生成\n\n## 实现\n\n- Schema 管理\n- 自然语言转 SQL\n- 安全执行`,
        },
        {
          id: 'lesson-23',
          title: '数据分析 Agent - 图表生成',
          duration: '25分钟',
          content: `# 课时 23：数据分析 Agent - 图表生成\n\n## 图表选择\n\n- 折线图\n- 柱状图\n- 饼图\n- 散点图`,
        },
        {
          id: 'lesson-24',
          title: '数据分析 Agent - 报告输出',
          duration: '20分钟',
          content: `# 课时 24：数据分析 Agent - 报告输出\n\n## 报告生成\n\n- Markdown 导出\n- HTML 导出\n- PDF 导出`,
        },
      ],
    },
  ],
};

// Markdown 渲染组件
function MarkdownRenderer({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    return text
      // 标题
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-white">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-white border-b border-white/10 pb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gradient">$1</h1>')
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-black/50 rounded-lg p-4 my-4 overflow-x-auto border border-white/10"><code class="text-sm text-green-400">$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm text-spacex-orange">$1</code>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      // 列表
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-white/80">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-white/80"><span class="text-spacex-orange mr-2">$1.</span>$2</li>')
      // 分隔线
      .replace(/^---$/gm, '<hr class="border-white/10 my-6" />')
      // 引用
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-spacex-orange pl-4 my-4 text-white/70 italic">$1</blockquote>')
      // 表格处理
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.some(c => c.trim().match(/^-+$/))) {
          return ''; // 跳过分隔行
        }
        const cellHtml = cells.map(c => `<td class="px-3 py-2 border border-white/10">${c.trim()}</td>`).join('');
        return `<tr class="text-white/80">${cellHtml}</tr>`;
      })
      // 段落
      .replace(/\n\n/g, '</p><p class="my-3 text-white/80 leading-relaxed">')
      .replace(/\n/g, '<br />');
  };

  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

export default function CourseViewer() {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const { markSectionCompleted, learningProgress } = useUser();

  const currentLessonData = courseData.modules[currentModule]?.items[currentLesson];
  const isCompleted = (lessonId: string) =>
    (learningProgress?.completedSections || []).includes(lessonId);

  const handleNextLesson = () => {
    const module = courseData.modules[currentModule];
    if (currentLesson < module.items.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else if (currentModule < courseData.modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentLesson(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    } else if (currentModule > 0) {
      const prevModule = courseData.modules[currentModule - 1];
      setCurrentModule(currentModule - 1);
      setCurrentLesson(prevModule.items.length - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkComplete = () => {
    if (currentLessonData) {
      markSectionCompleted(currentLessonData.id);
    }
    handleNextLesson();
  };

  const handleSelectLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // 计算进度
  const totalLessons = courseData.totalLessons;
  const completedLessons = (learningProgress?.completedSections || []).filter(id =>
    id.startsWith('lesson-')
  ).length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  return (
    <section ref={sectionRef} id="course-viewer" className="relative py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="course-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Agent 开发实战</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            课程<span className="text-gradient">学习中心</span>
          </h2>
          <div className="flex items-center justify-center gap-4 text-white/60">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {courseData.totalHours} 小时
            </span>
            <span>•</span>
            <span>{totalLessons} 课时</span>
            <span>•</span>
            <span className="text-spacex-orange">{progressPercent}% 完成</span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          {showSidebar && (
            <div className="course-item w-72 flex-shrink-0 opacity-0 hidden lg:block">
              <div className="sticky top-24 bg-white/[0.03] rounded-xl border border-white/10 p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                <h3 className="text-sm font-semibold text-white/80 mb-4">课程目录</h3>
                <div className="space-y-4">
                  {courseData.modules.map((module, mIdx) => (
                    <div key={module.id}>
                      <div className="text-xs font-mono text-spacex-orange mb-2">
                        模块 {mIdx + 1}
                      </div>
                      <div className="text-sm font-medium text-white mb-2">
                        {module.title}
                      </div>
                      <div className="space-y-1">
                        {module.items.map((lesson, lIdx) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(mIdx, lIdx)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                              currentModule === mIdx && currentLesson === lIdx
                                ? 'bg-spacex-orange/20 text-spacex-orange'
                                : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                            }`}
                          >
                            {isCompleted(lesson.id) ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Circle className="w-3 h-3" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="course-item flex-1 min-w-0 opacity-0">
            <div className="bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden">
              {/* Lesson Header */}
              <div className="bg-white/[0.02] border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-spacex-orange/20 text-spacex-orange text-xs font-mono">
                      模块 {currentModule + 1}
                    </span>
                    <span className="text-white/60 text-sm">
                      课时 {currentLesson + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="lg:hidden text-white/60 hover:text-white"
                  >
                    <BookOpen className="w-5 h-5" />
                  </button>
                </div>
                <h1 className="text-2xl font-bold mt-3 text-white">
                  {currentLessonData?.title}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentLessonData?.duration}
                  </span>
                  {isCompleted(currentLessonData?.id || '') && (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      已完成
                    </span>
                  )}
                </div>
              </div>

              {/* Lesson Content */}
              <div className="px-6 py-8 prose-invert max-w-none">
                {currentLessonData && (
                  <MarkdownRenderer content={currentLessonData.content} />
                )}
              </div>

              {/* Navigation */}
              <div className="bg-white/[0.02] border-t border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevLesson}
                    disabled={currentModule === 0 && currentLesson === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一课
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleMarkComplete}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isCompleted(currentLessonData?.id || '')
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-spacex-orange text-white hover:bg-spacex-orange/80'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isCompleted(currentLessonData?.id || '') ? '已完成' : '标记完成'}
                    </button>

                    <button
                      onClick={handleNextLesson}
                      disabled={
                        currentModule === courseData.modules.length - 1 &&
                        currentLesson ===
                          courseData.modules[currentModule].items.length - 1
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      下一课
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar Toggle */}
            <div className="lg:hidden mt-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                {showSidebar ? '隐藏目录' : '显示目录'}
              </button>

              {showSidebar && (
                <div className="mt-4 bg-white/[0.03] rounded-xl border border-white/10 p-4">
                  {courseData.modules.map((module, mIdx) => (
                    <div key={module.id} className="mb-4">
                      <div className="text-xs font-mono text-spacex-orange mb-1">
                        模块 {mIdx + 1}
                      </div>
                      <div className="text-sm font-medium text-white mb-2">
                        {module.title}
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {module.items.map((_, lIdx) => (
                          <button
                            key={lIdx}
                            onClick={() => handleSelectLesson(mIdx, lIdx)}
                            className={`px-2 py-1 rounded text-xs ${
                              currentModule === mIdx && currentLesson === lIdx
                                ? 'bg-spacex-orange text-white'
                                : 'bg-white/5 text-white/60'
                            }`}
                          >
                            {lIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}