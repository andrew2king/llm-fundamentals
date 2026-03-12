# 课时 4：技术路线选择

> Agent 开发实战 - 模块一：Agent 基础概念

## 一、本课目标

- 理解 Agent、Chain、RAG 的本质区别
- 掌握不同技术路线的适用场景
- 学会根据业务需求做出正确选择

---

## 二、三大技术路线概览

### 2.1 演进历程

```
2022          2023              2024
  │            │                 │
Chain ────→ RAG ────→ Agent ────→ Multi-Agent
  │            │                 │
链式调用     检索增强          自主决策       协作执行
```

### 2.2 核心区别

| 技术路线 | 核心能力 | 自主程度 | 适用场景 |
|---------|---------|---------|---------|
| **Chain** | 固定流程执行 | 低 | 流程确定的任务 |
| **RAG** | 知识检索增强 | 中 | 知识问答场景 |
| **Agent** | 自主决策执行 | 高 | 开放式任务 |
| **Multi-Agent** | 协作完成复杂任务 | 最高 | 大型复杂项目 |

---

## 三、Chain：固定流程执行

### 3.1 什么是 Chain？

**Chain（链）** 是将多个组件按固定顺序连接，形成确定的执行流程。

```
输入 → [组件A] → [组件B] → [组件C] → 输出
```

### 3.2 典型 Chain 示例

**示例 1：翻译链**

```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4")

# 翻译模板
translate_template = """
将以下文本从{source_lang}翻译成{target_lang}：

{text}
"""

translate_prompt = PromptTemplate.from_template(translate_template)
translate_chain = LLMChain(llm=llm, prompt=translate_prompt)

# 执行
result = translate_chain.run(
    source_lang="中文",
    target_lang="英文",
    text="你好，世界！"
)
# 输出：Hello, World!
```

**示例 2：摘要链**

```python
# 摘要 + 翻译组合链
from langchain.chains import SimpleSequentialChain

# 链1：摘要
summary_chain = LLMChain(llm=llm, prompt=summary_prompt)

# 链2：翻译
translate_chain = LLMChain(llm=llm, prompt=translate_prompt)

# 组合
overall_chain = SimpleSequentialChain(
    chains=[summary_chain, translate_chain],
    verbose=True
)

result = overall_chain.run(long_article)
```

### 3.3 Chain 的特点

| 优点 | 缺点 |
|------|------|
| 流程确定，结果可预测 | 无法处理意外情况 |
| 开发简单，调试方便 | 灵活性差 |
| 成本可控 | 无法自主决策 |
| 适合标准化流程 | 无法动态调整 |

### 3.4 适用场景

- 翻译、摘要、改写等文本处理任务
- 固定流程的表单处理
- 数据转换管道
- 需要确定输出的场景

---

## 四、RAG：知识检索增强

### 4.1 什么是 RAG？

**RAG（Retrieval-Augmented Generation）** = 检索 + 生成

先从知识库检索相关内容，再基于检索结果生成回答。

```
问题 → [检索器] → 相关文档 → [LLM] → 回答
         ↑
      知识库
```

### 4.2 RAG 架构

```
┌─────────────────────────────────────────────┐
│                    RAG 架构                  │
│                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │  查询   │ ─→ │  检索   │ ─→ │  生成   │ │
│  │ Query   │    │Retrieve │    │Generate │ │
│  └─────────┘    └────┬────┘    └─────────┘ │
│                      ↑                      │
│               ┌──────┴──────┐              │
│               │   知识库    │              │
│               │ Vector DB   │              │
│               └─────────────┘              │
└─────────────────────────────────────────────┘
```

### 4.3 RAG 实现示例

```python
from langchain.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. 文档处理
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
documents = text_splitter.split_documents(raw_documents)

# 2. 向量化存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(documents, embeddings)

# 3. 创建 RAG 链
llm = ChatOpenAI(model="gpt-4")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
)

# 4. 问答
question = "公司的退货政策是什么？"
answer = qa_chain.run(question)
```

### 4.4 RAG 的特点

| 优点 | 缺点 |
|------|------|
| 基于事实，减少幻觉 | 依赖知识库质量 |
| 可解释性强 | 检索精度影响效果 |
| 知识可更新 | 无法处理复杂推理 |
| 适合知识问答 | 无法调用外部工具 |

### 4.5 适用场景

- 企业知识库问答
- 文档问答系统
- 客服机器人
- 需要准确引用来源的场景

---

## 五、Agent：自主决策执行

### 5.1 什么是 Agent？

**Agent** 是能够自主规划、决策、执行任务的智能体。

```
目标 → [Agent] → 自主完成
         │
         ├── 规划任务
         ├── 选择工具
         ├── 执行行动
         └── 调整策略
```

### 5.2 Agent vs Chain vs RAG

**场景对比**：用户问「帮我分析一下公司上季度的销售数据」

| 技术路线 | 处理方式 |
|---------|---------|
| **Chain** | 无法处理，需要预先定义输入格式 |
| **RAG** | 检索销售报告文档，返回文档内容摘要 |
| **Agent** | 1. 连接数据库 2. 执行 SQL 查询 3. 分析数据 4. 生成报告 |

### 5.3 Agent 实现示例

```python
from langchain.agents import initialize_agent, AgentType, Tool
from langchain_openai import ChatOpenAI

# 定义工具
def query_sales(quarter: str) -> str:
    """查询指定季度的销售数据"""
    # 实际连接数据库查询
    return f"{quarter}销售额：1000万，同比增长20%"

def generate_chart(data: str) -> str:
    """根据数据生成图表"""
    # 实际生成图表
    return "图表已生成：sales_chart.png"

tools = [
    Tool(name="SalesQuery", func=query_sales,
         description="查询销售数据，参数：季度"),
    Tool(name="ChartGenerator", func=generate_chart,
         description="生成数据图表，参数：数据")
]

# 创建 Agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 执行
result = agent.run("帮我分析一下公司上季度的销售数据")
```

### 5.4 Agent 的特点

| 优点 | 缺点 |
|------|------|
| 自主决策，灵活应对 | 不确定性高 |
| 可调用工具扩展能力 | 成本难以预测 |
| 适合开放式任务 | 调试复杂 |
| 能处理复杂推理 | 可能有幻觉 |

### 5.5 适用场景

- 需要多步推理的任务
- 需要调用外部工具的任务
- 开放式、不确定的任务
- 自动化工作流

---

## 六、技术选择决策树

### 6.1 决策流程

```
                        开始
                          │
            ┌─────────────┴─────────────┐
            │   任务流程是否确定？        │
            └─────────────┬─────────────┘
                    ┌─────┴─────┐
                   是│         │否
                    ↓           ↓
            ┌───────────┐ ┌───────────────┐
            │   Chain   │ │需要外部知识？   │
            └───────────┘ └───────┬───────┘
                        ┌─────────┴─────────┐
                       是│                 │否
                        ↓                   ↓
                ┌───────────────┐   ┌───────────────┐
                │需要调用工具？   │   │需要调用工具？   │
                └───────┬───────┘   └───────┬───────┘
                    ┌───┴───┐         ┌───┴───┐
                   是│      │否       是│      │否
                    ↓      ↓          ↓      ↓
              ┌───────┐ ┌─────┐  ┌───────┐ ┌─────┐
              │Agent  │ │RAG  │  │Agent  │ │LLM  │
              │+ RAG  │ │     │  │       │ │直接 │
              └───────┘ └─────┘  └───────┘ └─────┘
```

### 6.2 场景映射表

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 文档翻译 | Chain | 流程固定 |
| 企业知识问答 | RAG | 需要检索知识库 |
| 智能客服 | RAG + Agent | 知识问答 + 工具调用 |
| 数据分析助手 | Agent | 需要调用数据库和工具 |
| 代码生成 | Agent + Reflection | 需要迭代优化 |
| 报告自动生成 | Chain + RAG | 固定流程 + 知识检索 |

---

## 七、组合使用最佳实践

### 7.1 RAG + Agent 组合

```python
class RAGAgent:
    """RAG + Agent 组合：知识问答 + 工具调用"""

    def __init__(self):
        self.rag_chain = create_rag_chain()
        self.agent = create_agent_with_tools()

    def run(self, query: str) -> str:
        # 先尝试 RAG 回答
        rag_result = self.rag_chain.run(query)

        if self._need_tools(query):
            # 需要工具调用，交给 Agent
            return self.agent.run(query)
        else:
            # RAG 足够，直接返回
            return rag_result

    def _need_tools(self, query: str) -> bool:
        """判断是否需要工具调用"""
        tool_keywords = ["查询", "执行", "生成", "发送", "创建"]
        return any(kw in query for kw in tool_keywords)
```

### 7.2 Chain + Agent 组合

```python
class HybridSystem:
    """Chain + Agent 组合：标准化流程 + 灵活决策"""

    def __init__(self):
        self.preprocess_chain = create_preprocess_chain()
        self.agent = create_agent()
        self.postprocess_chain = create_postprocess_chain()

    def run(self, input_text: str) -> str:
        # 前处理 Chain
        processed = self.preprocess_chain.run(input_text)

        # Agent 处理核心任务
        result = self.agent.run(processed)

        # 后处理 Chain
        final = self.postprocess_chain.run(result)

        return final
```

---

## 八、成本与效果权衡

### 8.1 成本对比

| 技术路线 | Token 消耗 | 延迟 | 开发成本 |
|---------|-----------|------|---------|
| Chain | 低 | 低 | 低 |
| RAG | 中 | 中 | 中 |
| Agent | 高 | 高 | 高 |
| Multi-Agent | 很高 | 很高 | 很高 |

### 8.2 效果对比

| 技术路线 | 灵活性 | 准确性 | 能力上限 |
|---------|-------|-------|---------|
| Chain | 低 | 高 | 低 |
| RAG | 中 | 高 | 中 |
| Agent | 高 | 中 | 高 |
| Multi-Agent | 很高 | 中 | 很高 |

### 8.3 选择建议

1. **能用 Chain 就不用 Agent**：成本更低，结果更确定
2. **需要知识就用 RAG**：准确性更好，可解释性更强
3. **复杂任务才用 Agent**：当其他方案无法满足时
4. **组合使用效果更佳**：各取所长

---

## 九、本课小结

### 9.1 关键要点

1. **Chain**：固定流程，适合标准化任务
2. **RAG**：检索增强，适合知识问答
3. **Agent**：自主决策，适合开放式任务
4. 选择技术路线要看任务特点，不是越复杂越好

### 9.2 决策口诀

```
流程固定用 Chain，
知识问答用 RAG，
复杂任务用 Agent，
组合使用效果佳。
```

### 9.3 思考题

1. 你目前的项目中，哪些可以用 Chain 解决？哪些需要 Agent？
2. 如何评估一个场景是否需要 RAG？
3. Agent 的不确定性如何控制？

---

## 十、模块一总结

### 10.1 知识图谱

```
模块一：Agent 基础概念
│
├── 课时 1：什么是 Agent？
│   └── Agent = LLM + 规划 + 工具 + 记忆
│
├── 课时 2：核心架构
│   └── 感知 → 决策 → 行动（记忆贯穿）
│
├── 课时 3：核心范式
│   └── ReAct / Plan-and-Execute / Reflection
│
└── 课时 4：技术路线选择
    └── Chain vs RAG vs Agent
```

### 10.2 下一步

下一模块，我们将深入学习 **LangChain 核心组件**，包括：
- LLM 与 Prompt 模板
- Memory 记忆系统
- Tool 工具定义
- Chain 链式调用

---

**下一模块**：LangChain 核心组件 - 从基础到实战