# 课时 11：AgentExecutor 原理解析

> Agent 开发实战 - 模块三：Agent 开发进阶

## 一、本课目标

- 深入理解 AgentExecutor 的工作原理
- 掌握 AgentExecutor 的核心参数
- 学会自定义 Agent 类

---

## 二、AgentExecutor 概述

### 2.1 什么是 AgentExecutor？

**AgentExecutor** 是 LangChain 中运行 Agent 的核心引擎，负责：
- 管理 Agent 的执行循环
- 处理工具调用
- 控制迭代次数
- 处理错误和超时

```
┌─────────────────────────────────────────────┐
│            AgentExecutor 架构               │
│                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │  Agent  │ ←→ │  Tools  │ ←→ │  LLM    │ │
│  └─────────┘    └─────────┘    └─────────┘ │
│       │                                     │
│       ↓                                     │
│  ┌─────────────────────────────────────┐   │
│  │         执行循环 (Loop)              │   │
│  │  1. Agent 决策                       │   │
│  │  2. 工具调用                         │   │
│  │  3. 观察结果                         │   │
│  │  4. 判断是否完成                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 2.2 核心执行流程

```python
# AgentExecutor 伪代码
def run(self, input):
    while not finished:
        # 1. Agent 决策下一步行动
        action = agent.plan(input, intermediate_steps)

        # 2. 判断是否完成
        if action.is_finish:
            return action.output

        # 3. 执行工具
        observation = tool.run(action.tool_input)

        # 4. 记录中间步骤
        intermediate_steps.append((action, observation))

        # 5. 检查迭代限制
        if iterations >= max_iterations:
            return handle_early_stop()
```

---

## 三、核心参数详解

### 3.1 创建 AgentExecutor

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI
from langchain.tools import Tool

# 创建 LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 创建工具
tools = [
    Tool(name="search", func=search, description="搜索信息"),
    Tool(name="calculator", func=calculate, description="计算")
]

# 创建 Agent
agent = create_react_agent(llm, tools, prompt)

# 创建 AgentExecutor
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10,
    max_execution_time=30,
    handle_parsing_errors=True,
    return_intermediate_steps=False
)
```

### 3.2 参数详解

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `agent` | Agent | 必填 | Agent 实例 |
| `tools` | List[Tool] | 必填 | 可用工具列表 |
| `verbose` | bool | False | 是否打印详细日志 |
| `max_iterations` | int | 10 | 最大迭代次数 |
| `max_execution_time` | float | None | 最大执行时间（秒） |
| `handle_parsing_errors` | bool/str | False | 是否处理解析错误 |
| `return_intermediate_steps` | bool | False | 是否返回中间步骤 |
| `early_stopping_method` | str | "force" | 提前停止方式 |
| `handle_parsing_errors` | bool/str | False | 解析错误处理策略 |

### 3.3 参数选择指南

```python
# 场景1：简单任务，快速响应
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,           # 限制迭代
    max_execution_time=10,      # 限制时间
    handle_parsing_errors=True  # 自动处理错误
)

# 场景2：复杂任务，需要详细调试
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,                       # 打印详情
    max_iterations=20,                  # 允许更多迭代
    return_intermediate_steps=True      # 返回中间步骤
)

# 场景3：生产环境，稳定优先
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=10,
    max_execution_time=30,
    handle_parsing_errors=True,
    early_stopping_method="generate"    # 生成最终答案而非强制停止
)
```

---

## 四、执行过程详解

### 4.1 单步执行过程

```python
# 查看 Agent 的决策过程
result = agent_executor.invoke({"input": "北京天气怎么样？"})

# 结果包含
{
    "input": "北京天气怎么样？",
    "output": "北京今天天气晴朗，气温25°C。",
    "intermediate_steps": [  # 如果 return_intermediate_steps=True
        (
            AgentAction(tool="search", tool_input="北京天气", log="..."),
            "北京今天天气晴朗，气温25°C"
        )
    ]
}
```

### 4.2 多步执行过程

```python
# 复杂任务：查天气 + 发邮件
result = agent_executor.invoke({
    "input": "查询北京天气，如果下雨就发邮件提醒我带伞，收件人test@example.com"
})

# 执行过程
"""
> Entering new AgentExecutor chain...

Thought: 需要先查询天气，然后判断是否需要发邮件
Action: search
Action Input: 北京天气
Observation: 北京今天有小雨，气温18°C

Thought: 天气显示有小雨，需要发邮件提醒
Action: send_email
Action Input: {"to": "test@example.com", "subject": "天气提醒", "body": "北京今天有小雨，请带伞"}
Observation: 邮件已发送

Thought: 任务完成
Final Answer: 已查询北京天气（小雨，18°C），并已发送邮件提醒您带伞。

> Finished chain.
"""
```

### 4.3 中间步骤分析

```python
# 获取中间步骤
result = agent_executor.invoke(
    {"input": "计算 1+1 等于几"},
    return_intermediate_steps=True
)

for step in result["intermediate_steps"]:
    action, observation = step
    print(f"工具: {action.tool}")
    print(f"输入: {action.tool_input}")
    print(f"输出: {observation}")
    print(f"日志: {action.log}")
    print("---")
```

---

## 五、自定义 Agent 类

### 5.1 继承 BaseSingleActionAgent

```python
from langchain.agents import BaseSingleActionAgent, AgentExecutor
from langchain.schema import AgentAction, AgentFinish
from typing import List, Tuple, Any, Union

class CustomAgent(BaseSingleActionAgent):
    """自定义 Agent"""

    @property
    def input_keys(self):
        return ["input"]

    def plan(
        self,
        intermediate_steps: List[Tuple[AgentAction, str]],
        **kwargs: Any
    ) -> Union[AgentAction, AgentFinish]:
        """规划下一步行动"""

        input_text = kwargs["input"]

        # 简单的关键词匹配策略
        if "天气" in input_text:
            return AgentAction(
                tool="search",
                tool_input=input_text.replace("天气", "").strip() + "天气",
                log="使用搜索工具查询天气"
            )
        elif "计算" in input_text:
            return AgentAction(
                tool="calculator",
                tool_input=input_text.replace("计算", "").strip(),
                log="使用计算器工具"
            )
        else:
            return AgentFinish(
                return_values={"output": "我无法处理这个请求"},
                log="无法匹配工具"
            )

    async def aplan(
        self,
        intermediate_steps: List[Tuple[AgentAction, str]],
        **kwargs: Any
    ) -> Union[AgentAction, AgentFinish]:
        """异步规划"""
        return self.plan(intermediate_steps, **kwargs)
```

### 5.2 使用自定义 Agent

```python
from langchain.tools import Tool

# 定义工具
def search(query: str) -> str:
    return f"搜索结果: {query}"

def calculate(expression: str) -> str:
    try:
        return str(eval(expression))
    except:
        return "计算错误"

tools = [
    Tool(name="search", func=search, description="搜索"),
    Tool(name="calculator", func=calculate, description="计算")
]

# 创建自定义 Agent
agent = CustomAgent()

# 创建 AgentExecutor
executor = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True
)

# 执行
result = executor.invoke({"input": "北京天气"})
print(result["output"])
```

### 5.3 基于 LLM 的自定义 Agent

```python
from langchain.agents import BaseSingleActionAgent
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
import json

class LLMAgent(BaseSingleActionAgent):
    """基于 LLM 的自定义 Agent"""

    llm: ChatOpenAI
    tools: List[Tool]
    prompt: PromptTemplate

    @property
    def input_keys(self):
        return ["input"]

    def plan(self, intermediate_steps, **kwargs):
        """使用 LLM 规划"""

        # 构建历史
        history = "\n".join([
            f"工具: {action.tool}, 输入: {action.tool_input}, 结果: {obs}"
            for action, obs in intermediate_steps
        ])

        # 构建提示
        tool_descriptions = "\n".join([
            f"- {tool.name}: {tool.description}"
            for tool in self.tools
        ])

        prompt = f"""
你是一个智能助手，可以使用以下工具：
{tool_descriptions}

历史操作：
{history if history else "无"}

用户输入：{kwargs["input"]}

请决定下一步行动。以 JSON 格式输出：
{{"action": "工具名或FINISH", "tool_input": "输入参数", "answer": "最终答案（仅当action为FINISH时）"}}
"""

        response = self.llm.invoke(prompt)
        result = json.loads(response.content)

        if result["action"] == "FINISH":
            return AgentFinish(
                return_values={"output": result["answer"]},
                log=response.content
            )
        else:
            return AgentAction(
                tool=result["action"],
                tool_input=result["tool_input"],
                log=response.content
            )

# 使用
from pydantic import Field

llm = ChatOpenAI(model="gpt-4")
tools = [
    Tool(name="search", func=search, description="搜索信息"),
    Tool(name="calculator", func=calculate, description="计算数学表达式")
]

agent = LLMAgent(
    llm=llm,
    tools=tools,
    prompt=None
)

executor = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True
)
```

---

## 六、错误处理与调试

### 6.1 常见错误类型

```python
from langchain.agents import AgentExecutor

executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_parsing_errors=True,  # 自动处理解析错误
    max_iterations=10,
    verbose=True
)

try:
    result = executor.invoke({"input": "复杂任务"})
except Exception as e:
    print(f"执行错误: {e}")
```

### 6.2 超时处理

```python
import signal
from contextlib import contextmanager

@contextmanager
def timeout(seconds):
    def timeout_handler(signum, frame):
        raise TimeoutError("执行超时")
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)

# 使用
try:
    with timeout(30):
        result = executor.invoke({"input": "任务"})
except TimeoutError:
    print("执行超时")
```

### 6.3 重试机制

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def run_agent_with_retry(executor, input_text):
    return executor.invoke({"input": input_text})

result = run_agent_with_retry(executor, "查询天气")
```

---

## 七、性能优化

### 7.1 减少迭代次数

```python
# 方法1：限制最大迭代
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5  # 限制为5次
)

# 方法2：优化提示词
# 让 Agent 更准确地选择工具，减少无效迭代
```

### 7.2 流式输出

```python
from langchain.callbacks import StreamingStdOutCallbackHandler

# 创建流式回调
streaming_handler = StreamingStdOutCallbackHandler()

llm = ChatOpenAI(
    model="gpt-4",
    streaming=True,
    callbacks=[streaming_handler]
)
```

### 7.3 缓存结果

```python
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

# 启用缓存
set_llm_cache(InMemoryCache())

# 相同的输入会使用缓存
result1 = executor.invoke({"input": "北京天气"})
result2 = executor.invoke({"input": "北京天气"})  # 使用缓存
```

---

## 八、本课小结

### 8.1 关键要点

1. **AgentExecutor** 是运行 Agent 的核心引擎
2. **执行循环**：决策 → 执行 → 观察 → 判断
3. **参数调优**：根据场景调整迭代次数、超时等
4. **自定义 Agent**：继承 BaseSingleActionAgent 实现

### 8.2 最佳实践

| 场景 | 推荐配置 |
|------|---------|
| 简单任务 | max_iterations=5, max_execution_time=10 |
| 复杂任务 | max_iterations=15, return_intermediate_steps=True |
| 生产环境 | handle_parsing_errors=True, early_stopping_method="generate" |

### 8.3 思考题

1. 如何判断一个任务需要多少次迭代？
2. AgentExecutor 的 early_stopping_method 有什么区别？
3. 如何监控 AgentExecutor 的执行效率？

---

**下一课**：自定义 Tool 开发实战 - 扩展 Agent 能力边界