import{c as M,r as p,u as P,g as C,S as v,j as e,B as g,a as $}from"./index-DCB7oHBO.js";import{C as N}from"./clock-BTIF2D80.js";import{C as w}from"./circle-check-big-pRW0W-M4.js";import{C as T}from"./circle-DDFwvjOT.js";const R=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],E=M("chevron-left",R);C.registerPlugin(v);const n={totalLessons:24,totalHours:8,modules:[{id:"module-1",title:"Agent 基础概念",lessons:4,items:[{id:"lesson-1",title:"什么是 Agent？",duration:"15分钟",content:`
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
          `},{id:"lesson-2",title:"Agent 核心架构",duration:"20分钟",content:`
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
          `},{id:"lesson-3",title:"核心范式解析",duration:"25分钟",content:`
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
          `},{id:"lesson-4",title:"技术路线选择",duration:"20分钟",content:`
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
          `}]},{id:"module-2",title:"LangChain 核心组件",lessons:6,items:[{id:"lesson-5",title:"LLM 与 Prompt 模板",duration:"25分钟",content:`# 课时 5：LLM 与 Prompt 模板

LangChain 统一了不同模型的调用接口，支持动态 Prompt 生成。

## 核心概念

- **ChatOpenAI**: OpenAI 模型封装
- **PromptTemplate**: 动态提示模板
- **Few-shot**: 少样本提示技巧`},{id:"lesson-6",title:"Memory 记忆系统",duration:"20分钟",content:`# 课时 6：Memory 记忆系统

四种核心记忆类型：

1. **ConversationBuffer** - 完整记忆
2. **ConversationBufferWindow** - 滑动窗口
3. **ConversationSummary** - 摘要记忆
4. **VectorStoreMemory** - 向量记忆`},{id:"lesson-7",title:"Tool 工具定义与调用",duration:"25分钟",content:`# 课时 7：Tool 工具定义与调用

Tool 是 Agent 与外部世界交互的桥梁。

## 定义方式

- @tool 装饰器
- 继承 BaseTool
- Tool 类实例化`},{id:"lesson-8",title:"Chain 链式调用",duration:"20分钟",content:`# 课时 8：Chain 链式调用

将多个组件按顺序连接，形成确定的处理流程。

## 类型

- **LLMChain** - 基础链
- **SequentialChain** - 顺序链
- **RouterChain** - 路由链`},{id:"lesson-9",title:"OutputParser 结构化输出",duration:"20分钟",content:`# 课时 9：OutputParser 结构化输出

将 LLM 文本输出解析为结构化数据。

## 常用 Parser

- **PydanticOutputParser** - 解析为 Pydantic 模型
- **ListParser** - 解析列表
- **OutputFixingParser** - 自动修复错误`},{id:"lesson-10",title:"回调与调试",duration:"15分钟",content:`# 课时 10：回调与调试

## 回调机制

在特定事件发生时执行自定义代码。

## 调试工具

- **verbose=True** - 详细输出
- **LangSmith** - 可视化调试
- **Token 监控** - 成本追踪`}]},{id:"module-3",title:"Agent 开发进阶",lessons:6,items:[{id:"lesson-11",title:"AgentExecutor 原理解析",duration:"25分钟",content:`# 课时 11：AgentExecutor 原理解析

AgentExecutor 是运行 Agent 的核心引擎。

## 执行循环

1. Agent 决策
2. 工具调用
3. 观察结果
4. 判断是否完成`},{id:"lesson-12",title:"自定义 Tool 开发实战",duration:"30分钟",content:`# 课时 12：自定义 Tool 开发实战

## 开发规范

1. 清晰的描述
2. 类型提示
3. 错误处理
4. 安全控制`},{id:"lesson-13",title:"Multi-Agent 协作基础",duration:"30分钟",content:`# 课时 13：Multi-Agent 协作基础

## LangGraph

基于图结构的 Agent 编排框架。

## 协作模式

- 顺序协作
- 条件分支
- 并行协作
- 循环迭代`},{id:"lesson-14",title:"错误处理与重试策略",duration:"20分钟",content:`# 课时 14：错误处理与重试策略

## 错误类型

- 输入错误
- LLM 错误
- 工具错误
- 系统错误

## 重试策略

- 指数退避
- 降级策略`},{id:"lesson-15",title:"流式输出与用户体验",duration:"20分钟",content:`# 课时 15：流式输出与用户体验

## 实现

- WebSocket
- Server-Sent Events
- 打字机效果`},{id:"lesson-16",title:"成本优化技巧",duration:"15分钟",content:`# 课时 16：成本优化技巧

## 优化方向

- Prompt 压缩
- 缓存策略
- 模型选择
- 批量处理`}]},{id:"module-4",title:"实战项目",lessons:8,items:[{id:"lesson-17",title:"智能客服 Agent - 架构设计",duration:"25分钟",content:`# 课时 17：智能客服 Agent - 架构设计

## 项目目标

- 自动回答常见问题
- 查询订单、物流等业务数据
- 处理简单投诉`},{id:"lesson-18",title:"智能客服 Agent - 知识库对接",duration:"30分钟",content:`# 课时 18：智能客服 Agent - 知识库对接

## 知识库实现

- 向量化存储
- 相似度检索
- 多轮对话问答`},{id:"lesson-19",title:"智能客服 Agent - 系统集成",duration:"25分钟",content:`# 课时 19：智能客服 Agent - 系统集成

## 部署

- FastAPI 服务
- Docker 容器化
- 监控告警`},{id:"lesson-20",title:"文档问答 Agent - 文档解析",duration:"30分钟",content:`# 课时 20：文档问答 Agent - 文档解析

## 解析器

- PDF 解析
- Word 解析
- Markdown 解析`},{id:"lesson-21",title:"文档问答 Agent - 检索策略",duration:"25分钟",content:`# 课时 21：文档问答 Agent - 检索策略

## 检索方法

- 向量检索
- 关键词检索
- 混合检索`},{id:"lesson-22",title:"数据分析 Agent - SQL生成",duration:"30分钟",content:`# 课时 22：数据分析 Agent - SQL生成

## 实现

- Schema 管理
- 自然语言转 SQL
- 安全执行`},{id:"lesson-23",title:"数据分析 Agent - 图表生成",duration:"25分钟",content:`# 课时 23：数据分析 Agent - 图表生成

## 图表选择

- 折线图
- 柱状图
- 饼图
- 散点图`},{id:"lesson-24",title:"数据分析 Agent - 报告输出",duration:"20分钟",content:`# 课时 24：数据分析 Agent - 报告输出

## 报告生成

- Markdown 导出
- HTML 导出
- PDF 导出`}]}]};function O({content:d}){const t=h=>h.replace(/^### (.*$)/gm,'<h3 class="text-lg font-semibold mt-6 mb-3 text-white">$1</h3>').replace(/^## (.*$)/gm,'<h2 class="text-xl font-bold mt-8 mb-4 text-white border-b border-white/10 pb-2">$1</h2>').replace(/^# (.*$)/gm,'<h1 class="text-2xl font-bold mt-6 mb-4 text-gradient">$1</h1>').replace(/```(\w+)?\n([\s\S]*?)```/g,'<pre class="bg-black/50 rounded-lg p-4 my-4 overflow-x-auto border border-white/10"><code class="text-sm text-green-400">$2</code></pre>').replace(/`([^`]+)`/g,'<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm text-spacex-orange">$1</code>').replace(/\*\*(.+?)\*\*/g,'<strong class="text-white font-semibold">$1</strong>').replace(/^- (.*$)/gm,'<li class="ml-4 text-white/80">$1</li>').replace(/^(\d+)\. (.*$)/gm,'<li class="ml-4 text-white/80"><span class="text-spacex-orange mr-2">$1.</span>$2</li>').replace(/^---$/gm,'<hr class="border-white/10 my-6" />').replace(/^> (.*$)/gm,'<blockquote class="border-l-4 border-spacex-orange pl-4 my-4 text-white/70 italic">$1</blockquote>').replace(/\|(.+)\|/g,r=>{const c=r.split("|").filter(a=>a.trim());return c.some(a=>a.trim().match(/^-+$/))?"":`<tr class="text-white/80">${c.map(a=>`<td class="px-3 py-2 border border-white/10">${a.trim()}</td>`).join("")}</tr>`}).replace(/\n\n/g,'</p><p class="my-3 text-white/80 leading-relaxed">').replace(/\n/g,"<br />");return e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:392:5",className:"prose prose-invert max-w-none",dangerouslySetInnerHTML:{__html:t(d)}})}function G(){const d=p.useRef(null),[t,h]=p.useState(0),[r,c]=p.useState(0),[x,a]=p.useState(!0),{markSectionCompleted:A,learningProgress:b}=P(),i=n.modules[t]?.items[r],u=s=>b.completedSections.includes(s),f=()=>{const s=n.modules[t];r<s.items.length-1?c(r+1):t<n.modules.length-1&&(h(t+1),c(0)),window.scrollTo({top:0,behavior:"smooth"})},y=()=>{if(r>0)c(r-1);else if(t>0){const s=n.modules[t-1];h(t-1),c(s.items.length-1)}window.scrollTo({top:0,behavior:"smooth"})},L=()=>{i&&A(i.id),f()},j=(s,o)=>{h(s),c(o),window.scrollTo({top:0,behavior:"smooth"})};p.useEffect(()=>{const s=C.context(()=>{v.create({trigger:d.current,start:"top 80%",onEnter:()=>{const o=d.current?.querySelectorAll(".course-item");o&&o.length>0&&C.fromTo(o,{y:40,opacity:0},{y:0,opacity:1,duration:.6,stagger:.1,ease:"expo.out"})},once:!0})},d);return()=>s.revert()},[]);const V=n.totalLessons,S=b.completedSections.filter(s=>s.startsWith("lesson-")).length,k=Math.round(S/V*100);return e.jsx("section",{"code-path":"src/sections/CourseViewer.tsx:475:5",ref:d,id:"course-viewer",className:"relative py-20 min-h-screen",children:e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:476:7",className:"max-w-7xl mx-auto px-6",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:478:9",className:"course-item text-center mb-12 opacity-0",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:479:11",className:"inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4",children:[e.jsx(g,{"code-path":"src/sections/CourseViewer.tsx:480:13",className:"w-4 h-4"}),e.jsx("span",{"code-path":"src/sections/CourseViewer.tsx:481:13",children:"Agent 开发实战"})]}),e.jsxs("h2",{"code-path":"src/sections/CourseViewer.tsx:483:11",className:"text-4xl md:text-5xl font-bold mb-4",children:["课程",e.jsx("span",{"code-path":"src/sections/CourseViewer.tsx:484:15",className:"text-gradient",children:"学习中心"})]}),e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:486:11",className:"flex items-center justify-center gap-4 text-white/60",children:[e.jsxs("span",{"code-path":"src/sections/CourseViewer.tsx:487:13",className:"flex items-center gap-1",children:[e.jsx(N,{"code-path":"src/sections/CourseViewer.tsx:488:15",className:"w-4 h-4"}),n.totalHours," 小时"]}),e.jsx("span",{"code-path":"src/sections/CourseViewer.tsx:491:13",children:"•"}),e.jsxs("span",{"code-path":"src/sections/CourseViewer.tsx:492:13",children:[V," 课时"]}),e.jsx("span",{"code-path":"src/sections/CourseViewer.tsx:493:13",children:"•"}),e.jsxs("span",{"code-path":"src/sections/CourseViewer.tsx:494:13",className:"text-spacex-orange",children:[k,"% 完成"]})]})]}),e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:498:9",className:"flex gap-6",children:[x&&e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:501:13",className:"course-item w-72 flex-shrink-0 opacity-0 hidden lg:block",children:e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:502:15",className:"sticky top-24 bg-white/[0.03] rounded-xl border border-white/10 p-4 max-h-[calc(100vh-120px)] overflow-y-auto",children:[e.jsx("h3",{"code-path":"src/sections/CourseViewer.tsx:503:17",className:"text-sm font-semibold text-white/80 mb-4",children:"课程目录"}),e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:504:17",className:"space-y-4",children:n.modules.map((s,o)=>e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:506:21",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:507:23",className:"text-xs font-mono text-spacex-orange mb-2",children:["模块 ",o+1]}),e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:510:23",className:"text-sm font-medium text-white mb-2",children:s.title}),e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:513:23",className:"space-y-1",children:s.items.map((m,l)=>e.jsxs("button",{"code-path":"src/sections/CourseViewer.tsx:515:27",onClick:()=>j(o,l),className:`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${t===o&&r===l?"bg-spacex-orange/20 text-spacex-orange":"text-white/60 hover:bg-white/5 hover:text-white/80"}`,children:[u(m.id)?e.jsx(w,{"code-path":"src/sections/CourseViewer.tsx:525:31",className:"w-3 h-3 text-green-500"}):e.jsx(T,{"code-path":"src/sections/CourseViewer.tsx:527:31",className:"w-3 h-3"}),e.jsx("span",{"code-path":"src/sections/CourseViewer.tsx:529:29",className:"truncate",children:m.title})]},m.id))})]},s.id))})]})}),e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:541:11",className:"course-item flex-1 min-w-0 opacity-0",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:542:13",className:"bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:544:15",className:"bg-white/[0.02] border-b border-white/10 px-6 py-4",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:545:17",className:"flex items-center justify-between",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:546:19",className:"flex items-center gap-3",children:[e.jsxs("span",{"code-path":"src/sections/CourseViewer.tsx:547:21",className:"px-2 py-1 rounded bg-spacex-orange/20 text-spacex-orange text-xs font-mono",children:["模块 ",t+1]}),e.jsxs("span",{"code-path":"src/sections/CourseViewer.tsx:550:21",className:"text-white/60 text-sm",children:["课时 ",r+1]})]}),e.jsx("button",{"code-path":"src/sections/CourseViewer.tsx:554:19",onClick:()=>a(!x),className:"lg:hidden text-white/60 hover:text-white",children:e.jsx(g,{"code-path":"src/sections/CourseViewer.tsx:558:21",className:"w-5 h-5"})})]}),e.jsx("h1",{"code-path":"src/sections/CourseViewer.tsx:561:17",className:"text-2xl font-bold mt-3 text-white",children:i?.title}),e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:564:17",className:"flex items-center gap-4 mt-2 text-sm text-white/60",children:[e.jsxs("span",{"code-path":"src/sections/CourseViewer.tsx:565:19",className:"flex items-center gap-1",children:[e.jsx(N,{"code-path":"src/sections/CourseViewer.tsx:566:21",className:"w-4 h-4"}),i?.duration]}),u(i?.id||"")&&e.jsxs("span",{"code-path":"src/sections/CourseViewer.tsx:570:21",className:"flex items-center gap-1 text-green-500",children:[e.jsx(w,{"code-path":"src/sections/CourseViewer.tsx:571:23",className:"w-4 h-4"}),"已完成"]})]})]}),e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:579:15",className:"px-6 py-8 prose-invert max-w-none",children:i&&e.jsx(O,{"code-path":"src/sections/CourseViewer.tsx:581:19",content:i.content})}),e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:586:15",className:"bg-white/[0.02] border-t border-white/10 px-6 py-4",children:e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:587:17",className:"flex items-center justify-between",children:[e.jsxs("button",{"code-path":"src/sections/CourseViewer.tsx:588:19",onClick:y,disabled:t===0&&r===0,className:"flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:[e.jsx(E,{"code-path":"src/sections/CourseViewer.tsx:593:21",className:"w-4 h-4"}),"上一课"]}),e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:597:19",className:"flex items-center gap-3",children:[e.jsxs("button",{"code-path":"src/sections/CourseViewer.tsx:598:21",onClick:L,className:`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${u(i?.id||"")?"bg-green-500/20 text-green-400":"bg-spacex-orange text-white hover:bg-spacex-orange/80"}`,children:[e.jsx(w,{"code-path":"src/sections/CourseViewer.tsx:606:23",className:"w-4 h-4"}),u(i?.id||"")?"已完成":"标记完成"]}),e.jsxs("button",{"code-path":"src/sections/CourseViewer.tsx:610:21",onClick:f,disabled:t===n.modules.length-1&&r===n.modules[t].items.length-1,className:"flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",children:["下一课",e.jsx($,{"code-path":"src/sections/CourseViewer.tsx:620:23",className:"w-4 h-4"})]})]})]})})]}),e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:628:13",className:"lg:hidden mt-4",children:[e.jsxs("button",{"code-path":"src/sections/CourseViewer.tsx:629:15",onClick:()=>a(!x),className:"w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 flex items-center justify-center gap-2",children:[e.jsx(g,{"code-path":"src/sections/CourseViewer.tsx:633:17",className:"w-4 h-4"}),x?"隐藏目录":"显示目录"]}),x&&e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:638:17",className:"mt-4 bg-white/[0.03] rounded-xl border border-white/10 p-4",children:n.modules.map((s,o)=>e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:640:21",className:"mb-4",children:[e.jsxs("div",{"code-path":"src/sections/CourseViewer.tsx:641:23",className:"text-xs font-mono text-spacex-orange mb-1",children:["模块 ",o+1]}),e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:644:23",className:"text-sm font-medium text-white mb-2",children:s.title}),e.jsx("div",{"code-path":"src/sections/CourseViewer.tsx:647:23",className:"grid grid-cols-4 gap-1",children:s.items.map((m,l)=>e.jsx("button",{"code-path":"src/sections/CourseViewer.tsx:649:27",onClick:()=>j(o,l),className:`px-2 py-1 rounded text-xs ${t===o&&r===l?"bg-spacex-orange text-white":"bg-white/5 text-white/60"}`,children:l+1},l))})]},s.id))})]})]})]})]})})}export{G as default};
