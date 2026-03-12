# 课时 3：核心范式解析

> Agent 开发实战 - 模块一：Agent 基础概念

## 一、本课目标

- 掌握三大核心范式：ReAct、Plan-and-Execute、Reflection
- 理解各范式的适用场景与优缺点
- 学会根据任务特点选择合适的范式

---

## 二、为什么需要范式？

### 2.1 Agent 面临的挑战

```
用户：帮我分析竞争对手的营销策略，并给出建议
```

**Agent 需要解决的问题**：

1. **任务分解**：如何将复杂任务拆解？
2. **执行顺序**：先做什么，后做什么？
3. **错误处理**：遇到问题怎么办？
4. **结果验证**：如何确保结果正确？

### 2.2 范式的作用

> 范式（Pattern）= 解决特定问题的通用方法

不同的范式适用于不同类型的任务，选择正确的范式是 Agent 开发的关键。

---

## 三、ReAct 范式

### 3.1 核心思想

**ReAct = Reasoning + Acting**

交替进行思考和行动，形成「思考 → 行动 → 观察 → 思考...」的循环。

```
┌─────────────────────────────────────┐
│                                     │
│   ┌─────────┐      ┌─────────┐     │
│   │ 思考    │ ───→ │ 行动    │     │
│   │Thought  │      │ Action  │     │
│   └────┬────┘      └────┬────┘     │
│        ↑                │          │
│        │    ┌─────────┐ │          │
│        └────│ 观察    │←┘          │
│             │Observe  │            │
│             └─────────┘            │
└─────────────────────────────────────┘
```

### 3.2 工作流程示例

**任务**：北京和上海明天的天气对比

```python
# ReAct 执行过程

Thought 1: 用户想知道北京和上海明天的天气对比，我需要分别查询两个城市的天气
Action 1: search_weather("北京", "明天")
Observation 1: 北京明天晴，气温 15-25°C，空气质量良好

Thought 2: 已获取北京天气，现在查询上海天气
Action 2: search_weather("上海", "明天")
Observation 2: 上海明天多云转小雨，气温 18-26°C，有轻微雾霾

Thought 3: 已获取两地天气，现在进行对比分析
Action 3: finish("对比结果：北京晴天较凉爽，上海多云有雨较温暖...")

# 最终回答
"北京明天晴，气温15-25°C；上海明天多云转小雨，气温18-26°C。
对比来看，北京天气更好适合户外活动，上海较温暖但需备伞..."
```

### 3.3 LangChain 实现

```python
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool
from langchain_openai import ChatOpenAI

# 定义工具
def search_weather(city: str, date: str = "今天") -> str:
    """查询天气"""
    # 实际调用天气 API
    return f"{city}{date}天气：晴，15-25°C"

tools = [
    Tool(
        name="WeatherSearch",
        func=lambda x: search_weather(*x.split(",")),
        description="查询城市天气，输入格式：城市,日期"
    )
]

# 创建 ReAct Agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True  # 显示思考过程
)

# 执行
result = agent.run("北京和上海明天的天气对比")
```

### 3.4 ReAct 的优缺点

| 优点 | 缺点 |
|------|------|
| 简单直观，易于理解 | 可能陷入无效循环 |
| 灵活应对变化 | 思考过程可能冗余 |
| 实时观察调整 | Token 消耗较大 |
| 适合工具调用场景 | 复杂任务规划不足 |

### 3.5 适用场景

- 需要调用多个工具的任务
- 信息收集与分析任务
- 需要根据中间结果调整策略的任务

---

## 四、Plan-and-Execute 范式

### 4.1 核心思想

**Plan-and-Execute = 先规划，后执行**

将任务分解和执行分离，先生成完整的执行计划，再按计划逐步执行。

```
┌─────────────────────────────────────────────────┐
│                    规划阶段                       │
│                                                 │
│   任务 → [规划器] → [步骤1, 步骤2, 步骤3, ...]   │
│                                                 │
├─────────────────────────────────────────────────┤
│                    执行阶段                       │
│                                                 │
│   步骤1 → 步骤2 → 步骤3 → ... → 完成             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.2 工作流程示例

**任务**：准备一份 AI 行业市场分析报告

```python
# Plan-and-Execute 执行过程

# 阶段一：规划
Plan:
  Step 1: 搜索 AI 行业最新发展动态
  Step 2: 收集市场规模和增长数据
  Step 3: 分析主要竞争对手
  Step 4: 整理技术趋势
  Step 5: 生成报告结构
  Step 6: 撰写报告内容

# 阶段二：执行
Executing Step 1: 搜索完成，找到 20 篇相关文章
Executing Step 2: 数据收集完成，市场规模 500 亿
Executing Step 3: 竞争对手分析完成，主要玩家：OpenAI、Google、百度...
Executing Step 4: 技术趋势整理完成：大模型、Agent、多模态...
Executing Step 5: 报告结构确定：概述、市场分析、竞争格局、趋势预测
Executing Step 6: 报告撰写完成，共 5000 字

# 最终输出
"AI 行业市场分析报告已生成，详见附件..."
```

### 4.3 LangChain 实现

```python
from langchain_experimental.plan_and_execute import (
    PlanAndExecute,
    load_agent_executor,
    load_chat_planner
)
from langchain_openai import ChatOpenAI

# 创建规划器和执行器
llm = ChatOpenAI(model="gpt-4", temperature=0)

planner = load_chat_planner(llm)
executor = load_agent_executor(llm, tools, verbose=True)

# 创建 Plan-and-Execute Agent
agent = PlanAndExecute(planner=planner, executor=executor, verbose=True)

# 执行
result = agent.run("准备一份 AI 行业市场分析报告")
```

### 4.4 Plan-and-Execute 的优缺点

| 优点 | 缺点 |
|------|------|
| 结构清晰，易于跟踪 | 规划可能不完整 |
| 减少无效探索 | 灵活性不足 |
| 适合复杂多步骤任务 | 执行中无法调整计划 |
| Token 消耗可控 | 需要好的规划能力 |

### 4.5 适用场景

- 复杂多步骤任务
- 需要清晰执行流程的任务
- 可以预先规划的任务

---

## 五、Reflection 范式

### 5.1 核心思想

**Reflection = 执行 + 反思 + 改进**

在执行任务后，进行自我评估和反思，发现问题并改进，形成迭代优化循环。

```
┌───────────────────────────────────────────────┐
│                                               │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│   │  执行   │ ─→ │  反思   │ ─→ │  改进   │  │
│   │ Execute │    │Reflect  │    │ Improve │  │
│   └────┬────┘    └─────────┘    └────┬────┘  │
│        │                              │       │
│        └──────────────────────────────┘       │
│                    迭代循环                    │
└───────────────────────────────────────────────┘
```

### 5.2 工作流程示例

**任务**：写一首关于春天的诗

```python
# Reflection 执行过程

# 第一轮
Draft 1: "春天来了花开了，小鸟叫着飞来了..."
Reflection 1: 这首诗过于直白，缺乏意境和修辞，建议加入更多意象

# 第二轮（基于反思改进）
Draft 2: "春风拂面柳丝长，桃花灼灼映朝阳..."
Reflection 2: 意境有所提升，但结构还可以更工整

# 第三轮（继续改进）
Draft 3: "春风轻拂柳丝长，桃花灼灼映朝阳。
         燕子归来寻旧巢，一树梨花满院香。"
Reflection 3: 结构工整，意境优美，任务完成

# 最终输出
"春风轻拂柳丝长，桃花灼灼映朝阳。
 燕子归来寻旧巢，一树梨花满院香。"
```

### 5.3 LangChain 实现

```python
from langchain.agents import AgentExecutor
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0)

# 反思模板
reflection_prompt = PromptTemplate.from_template("""
你是一个写作专家。请评估以下内容：

内容：{content}

请从以下角度评估：
1. 语言表达
2. 结构逻辑
3. 内容质量

评分（1-10）：
改进建议：
""")

def reflect_and_improve(content: str, max_iterations: int = 3):
    for i in range(max_iterations):
        # 反思
        reflection = llm.invoke(reflection_prompt.format(content=content))

        # 检查是否满意
        if "评分：9" in reflection or "评分：10" in reflection:
            break

        # 改进
        improve_prompt = f"""
        原内容：{content}

        反思结果：{reflection}

        请根据反思改进内容：
        """
        content = llm.invoke(improve_prompt)

    return content
```

### 5.4 Reflection 的优缺点

| 优点 | 缺点 |
|------|------|
| 输出质量高 | 成本高（多次迭代） |
| 自我纠错能力强 | 可能过度优化 |
| 适合需要高质量输出的任务 | 反思标准需要设计 |

### 5.5 适用场景

- 需要高质量输出的任务
- 创作类任务（写作、代码、设计）
- 需要迭代优化的任务

---

## 六、范式对比与选择

### 6.1 对比总结

| 维度 | ReAct | Plan-and-Execute | Reflection |
|------|-------|-----------------|------------|
| **核心特点** | 思行交替 | 先规划后执行 | 迭代优化 |
| **灵活性** | 高 | 中 | 高 |
| **可预测性** | 中 | 高 | 中 |
| **成本** | 中 | 低 | 高 |
| **输出质量** | 中 | 中 | 高 |
| **复杂度** | 低 | 中 | 高 |

### 6.2 选择指南

```
任务类型？

├─ 需要调用多个工具？
│   └─ 是 → ReAct
│
├─ 复杂多步骤任务？
│   └─ 是 → Plan-and-Execute
│
├─ 需要高质量输出？
│   └─ 是 → Reflection
│
└─ 组合场景
    ├─ 工具调用 + 高质量 → ReAct + Reflection
    ├─ 复杂任务 + 高质量 → Plan-and-Execute + Reflection
    └─ 工具调用 + 复杂任务 → ReAct + Plan-and-Execute
```

### 6.3 组合使用示例

```python
# ReAct + Reflection 组合
def react_with_reflection(task: str):
    # 第一阶段：ReAct 执行
    result = react_agent.run(task)

    # 第二阶段：反思改进
    reflection = llm.invoke(f"评估这个结果：{result}")

    if "需要改进" in reflection:
        result = improve_result(result, reflection)

    return result
```

---

## 七、本课小结

### 7.1 关键要点

1. **ReAct**：思考-行动-观察循环，适合工具调用场景
2. **Plan-and-Execute**：先规划后执行，适合复杂多步骤任务
3. **Reflection**：执行-反思-改进循环，适合高质量输出场景
4. 可以组合使用多种范式

### 7.2 思考题

1. 电商客服场景应该选择哪种范式？
2. 如何判断任务是否需要 Reflection？
3. 如果 Agent 陷入循环，应该如何处理？

---

## 八、延伸阅读

- [ReAct 论文](https://arxiv.org/abs/2210.03629)
- [Reflexion 论文](https://arxiv.org/abs/2303.11366)
- [LangChain Agents 文档](https://python.langchain.com/docs/modules/agents/)

---

**下一课**：技术路线选择 - Agent vs Chain vs RAG