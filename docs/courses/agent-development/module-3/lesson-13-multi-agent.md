# 课时 13：Multi-Agent 协作基础

> Agent 开发实战 - 模块三：Agent 开发进阶

## 一、本课目标

- 理解多 Agent 协作的必要性
- 掌握 LangGraph 基础概念
- 实现简单的多 Agent 协作系统

---

## 二、为什么需要多 Agent？

### 2.1 单 Agent 的局限

```
单个 Agent 面临的问题：
├── 能力瓶颈：一个 Agent 无法精通所有领域
├── 复杂度爆炸：复杂任务难以规划
├── 效率低下：串行处理，无法并行
└── 容错性差：单点故障导致整体失败
```

### 2.2 多 Agent 的优势

```
┌─────────────────────────────────────────────┐
│            Multi-Agent 协作架构             │
│                                             │
│                  ┌─────────┐                │
│                  │ 协调器  │                │
│                  │Coordinator│              │
│                  └────┬────┘                │
│        ┌───────────┬──┴──┬───────────┐     │
│        ↓           ↓     ↓           ↓     │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│   │Agent 1  │ │Agent 2  │ │Agent 3  │      │
│   │ 研究员  │ │  写手   │ │  编辑   │      │
│   └─────────┘ └─────────┘ └─────────┘      │
│                                             │
│   每个 Agent 专注自己的领域                  │
└─────────────────────────────────────────────┘
```

| 优势 | 说明 |
|------|------|
| **专业化** | 每个 Agent 专注于特定领域 |
| **并行化** | 多个 Agent 同时工作 |
| **可扩展** | 添加新 Agent 扩展能力 |
| **容错性** | 一个 Agent 失败不影响整体 |

---

## 三、LangGraph 基础

### 3.1 什么是 LangGraph？

**LangGraph** 是 LangChain 推出的多 Agent 编排框架，基于图结构定义 Agent 协作流程。

```python
# 安装
pip install langgraph
```

### 3.2 核心概念

```
StateGraph（状态图）
│
├── State（状态）：在 Agent 间共享的数据
├── Node（节点）：Agent 或处理函数
├── Edge（边）：节点间的转换关系
└── Conditional Edge（条件边）：根据条件选择下一个节点
```

### 3.3 基础示例

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

# 1. 定义状态
class AgentState(TypedDict):
    messages: list
    next_agent: str

# 2. 定义节点函数
def researcher(state: AgentState) -> AgentState:
    """研究员 Agent"""
    messages = state["messages"]
    llm = ChatOpenAI(model="gpt-4")

    prompt = f"""你是一个研究员，负责收集和整理信息。
    当前对话：{messages}
    请提供相关研究结果。"""

    response = llm.invoke(prompt)
    state["messages"].append({"role": "researcher", "content": response.content})
    state["next_agent"] = "writer"
    return state

def writer(state: AgentState) -> AgentState:
    """写手 Agent"""
    messages = state["messages"]
    llm = ChatOpenAI(model="gpt-4")

    prompt = f"""你是一个专业写手，负责撰写内容。
    研究结果：{messages}
    请基于研究结果撰写文章。"""

    response = llm.invoke(prompt)
    state["messages"].append({"role": "writer", "content": response.content})
    state["next_agent"] = END
    return state

# 3. 构建图
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("researcher", researcher)
workflow.add_node("writer", writer)

# 设置入口
workflow.set_entry_point("researcher")

# 添加边
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", END)

# 4. 编译并运行
app = workflow.compile()

result = app.invoke({
    "messages": [{"role": "user", "content": "写一篇关于 AI Agent 的文章"}],
    "next_agent": ""
})

print(result["messages"][-1]["content"])
```

---

## 四、协作模式详解

### 4.1 顺序协作

```
用户 → Agent1 → Agent2 → Agent3 → 输出
```

```python
from langgraph.graph import StateGraph, END

def agent1(state):
    # 处理
    state["step"] = 1
    return state

def agent2(state):
    # 处理
    state["step"] = 2
    return state

def agent3(state):
    # 处理
    state["step"] = 3
    return state

workflow = StateGraph(State)
workflow.add_node("agent1", agent1)
workflow.add_node("agent2", agent2)
workflow.add_node("agent3", agent3)

workflow.set_entry_point("agent1")
workflow.add_edge("agent1", "agent2")
workflow.add_edge("agent2", "agent3")
workflow.add_edge("agent3", END)
```

### 4.2 条件分支

```
              ┌── Agent A ──┐
用户 → 路由 ──┼── Agent B ──┼── 合并 → 输出
              └── Agent C ──┘
```

```python
def router(state):
    """根据输入选择 Agent"""
    task_type = state.get("task_type", "general")
    if task_type == "code":
        return "coder"
    elif task_type == "write":
        return "writer"
    else:
        return "general_agent"

workflow = StateGraph(State)
workflow.add_node("router", router)
workflow.add_node("coder", coder_agent)
workflow.add_node("writer", writer_agent)
workflow.add_node("general_agent", general_agent)

workflow.set_entry_point("router")

# 条件边
workflow.add_conditional_edges(
    "router",
    router,
    {
        "coder": "coder",
        "writer": "writer",
        "general_agent": "general_agent"
    }
)

workflow.add_edge("coder", END)
workflow.add_edge("writer", END)
workflow.add_edge("general_agent", END)
```

### 4.3 并行协作

```python
from langgraph.graph import StateGraph, END
import asyncio

async def parallel_research(state):
    """并行执行多个研究任务"""
    topics = state.get("topics", [])

    # 并行执行
    tasks = [research_topic(topic) for topic in topics]
    results = await asyncio.gather(*tasks)

    state["research_results"] = results
    return state

async def research_topic(topic):
    """研究单个主题"""
    llm = ChatOpenAI(model="gpt-4")
    response = await llm.ainvoke(f"研究主题：{topic}")
    return response.content
```

### 4.4 循环迭代

```python
def should_continue(state):
    """判断是否继续迭代"""
    iterations = state.get("iterations", 0)
    quality_score = state.get("quality_score", 0)

    if iterations >= 5 or quality_score >= 0.9:
        return END
    return "improve"

workflow = StateGraph(State)
workflow.add_node("draft", draft_agent)
workflow.add_node("review", review_agent)
workflow.add_node("improve", improve_agent)

workflow.set_entry_point("draft")
workflow.add_edge("draft", "review")
workflow.add_conditional_edges("review", should_continue)
```

---

## 五、实战：构建内容创作团队

### 5.1 需求

构建一个内容创作团队：
- **研究员**：收集资料
- **写手**：撰写初稿
- **编辑**：审核修改
- **协调器**：管理流程

### 5.2 实现

```python
from typing import TypedDict, List, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

# 定义状态
class ContentState(TypedDict):
    topic: str
    research_notes: str
    draft: str
    feedback: str
    final_content: str
    iterations: int
    max_iterations: int

# 定义 Agents
class ContentTeam:
    """内容创作团队"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.7)
        self._build_workflow()

    def _build_workflow(self):
        """构建工作流"""
        workflow = StateGraph(ContentState)

        # 添加节点
        workflow.add_node("researcher", self.researcher)
        workflow.add_node("writer", self.writer)
        workflow.add_node("editor", self.editor)

        # 设置流程
        workflow.set_entry_point("researcher")
        workflow.add_edge("researcher", "writer")
        workflow.add_edge("writer", "editor")

        # 条件边：编辑决定是否需要修改
        workflow.add_conditional_edges(
            "editor",
            self._should_revise,
            {
                "revise": "writer",
                "publish": END
            }
        )

        self.app = workflow.compile()

    def researcher(self, state: ContentState) -> ContentState:
        """研究员：收集资料"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个专业研究员，负责收集和整理资料。"),
            ("human", "请为主题 '{topic}' 收集关键信息和要点。")
        ])

        response = self.llm.invoke(prompt.format(topic=state["topic"]))
        state["research_notes"] = response.content
        print("✓ 研究员完成资料收集")
        return state

    def writer(self, state: ContentState) -> ContentState:
        """写手：撰写内容"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个专业写手，负责撰写高质量内容。"),
            ("human", """
            主题：{topic}
            研究资料：{research_notes}
            {"上一版本的反馈：" + feedback if feedback else ""}

            请撰写一篇完整的内容。
            """)
        ])

        response = self.llm.invoke(prompt.format(
            topic=state["topic"],
            research_notes=state["research_notes"],
            feedback=state.get("feedback", "")
        ))
        state["draft"] = response.content
        state["iterations"] = state.get("iterations", 0) + 1
        print(f"✓ 写手完成初稿（第{state['iterations']}版）")
        return state

    def editor(self, state: ContentState) -> ContentState:
        """编辑：审核内容"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", """你是一个严格但公正的编辑。
            审核内容质量，给出评分（0-10）和修改建议。
            如果评分>=8，回复 APPROVED。
            否则回复 NEEDS_REVISION 并说明需要修改的地方。"""),
            ("human", """
            主题：{topic}
            内容：{draft}

            请审核以上内容。
            """)
        ])

        response = self.llm.invoke(prompt.format(
            topic=state["topic"],
            draft=state["draft"]
        ))

        content = response.content
        if "APPROVED" in content:
            state["final_content"] = state["draft"]
            print("✓ 编辑审核通过")
        else:
            state["feedback"] = content
            print(f"✗ 编辑要求修改：{content[:100]}...")

        return state

    def _should_revise(self, state: ContentState) -> str:
        """判断是否需要修改"""
        if state.get("final_content"):
            return "publish"
        if state["iterations"] >= state.get("max_iterations", 3):
            state["final_content"] = state["draft"]
            return "publish"
        return "revise"

    def create_content(self, topic: str, max_iterations: int = 3) -> str:
        """创作内容"""
        result = self.app.invoke({
            "topic": topic,
            "research_notes": "",
            "draft": "",
            "feedback": "",
            "final_content": "",
            "iterations": 0,
            "max_iterations": max_iterations
        })
        return result["final_content"]

# 使用
team = ContentTeam()
content = team.create_content("人工智能在医疗领域的应用")
print("\n" + "="*50)
print("最终内容：")
print(content)
```

---

## 六、最佳实践

### 6.1 Agent 设计原则

| 原则 | 说明 |
|------|------|
| **单一职责** | 每个 Agent 只做一件事 |
| **明确接口** | 清晰的输入输出定义 |
| **容错设计** | 处理其他 Agent 的错误输出 |
| **可观测性** | 记录执行日志便于调试 |

### 6.2 状态管理

```python
# 使用 TypedDict 明确状态结构
class MyState(TypedDict):
    # 必填字段
    required_field: str

    # 可选字段
    optional_field: NotRequired[str]

    # 带默认值
    counter: Annotated[int, "default=0"]
```

### 6.3 调试技巧

```python
# 添加调试节点
def debug_node(state):
    print(f"当前状态: {state}")
    return state

# 在关键节点前后添加
workflow.add_node("debug", debug_node)
workflow.add_edge("agent1", "debug")
workflow.add_edge("debug", "agent2")
```

---

## 七、本课小结

### 7.1 关键要点

1. **多 Agent 协作**：专业化分工，提升效率
2. **LangGraph**：基于图结构的 Agent 编排
3. **协作模式**：顺序、分支、并行、循环
4. **状态管理**：在 Agent 间共享数据

### 7.2 思考题

1. 什么场景适合使用多 Agent 协作？
2. 如何设计 Agent 之间的通信协议？
3. 多 Agent 系统如何处理冲突？

---

**下一课**：错误处理与重试策略 - 构建健壮的 Agent 系统