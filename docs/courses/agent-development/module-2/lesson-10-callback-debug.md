# 课时 10：回调与调试

> Agent 开发实战 - 模块二：LangChain 核心组件

## 一、本课目标

- 理解 LangChain 回调机制
- 学会使用 LangSmith 进行调试
- 掌握 Token 消耗监控方法
- 了解调试最佳实践

---

## 二、回调机制概述

### 2.1 什么是回调？

**回调（Callback）** 是一种在特定事件发生时执行自定义代码的机制。

```
Agent 执行过程
    │
    ├── 开始 → on_chain_start
    ├── LLM 调用 → on_llm_start
    ├── LLM 响应 → on_llm_end
    ├── 工具调用 → on_tool_start
    ├── 工具响应 → on_tool_end
    └── 结束 → on_chain_end
```

### 2.2 回调的作用

| 作用 | 说明 |
|------|------|
| **日志记录** | 记录执行过程 |
| **性能监控** | 统计耗时、Token |
| **调试** | 追踪问题 |
| **用户体验** | 实时显示进度 |

---

## 三、使用回调处理器

### 3.1 BaseCallbackHandler

```python
from langchain.callbacks import BaseCallbackHandler
from langchain.schema import LLMResult

class MyCallbackHandler(BaseCallbackHandler):
    """自定义回调处理器"""

    def on_llm_start(self, serialized, prompts, **kwargs):
        """LLM 开始调用"""
        print(f"[LLM 开始] 提示: {prompts[0][:50]}...")

    def on_llm_end(self, response: LLMResult, **kwargs):
        """LLM 调用结束"""
        print(f"[LLM 结束] Token 使用: {response.llm_output.get('token_usage')}")

    def on_llm_error(self, error, **kwargs):
        """LLM 调用出错"""
        print(f"[LLM 错误] {error}")

    def on_chain_start(self, serialized, inputs, **kwargs):
        """Chain 开始"""
        print(f"[Chain 开始] 输入: {inputs}")

    def on_chain_end(self, outputs, **kwargs):
        """Chain 结束"""
        print(f"[Chain 结束] 输出: {outputs}")

    def on_tool_start(self, serialized, input_str, **kwargs):
        """工具开始调用"""
        print(f"[工具开始] 输入: {input_str}")

    def on_tool_end(self, output, **kwargs):
        """工具调用结束"""
        print(f"[工具结束] 输出: {output}")
```

### 3.2 使用回调

```python
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# 创建回调处理器
handler = MyCallbackHandler()

# 创建 LLM（传入回调）
llm = ChatOpenAI(
    model="gpt-4",
    callbacks=[handler],
    verbose=True
)

# 执行
result = llm.invoke("你好")
```

### 3.3 内置回调处理器

**StdOutCallbackHandler**：输出到控制台

```python
from langchain.callbacks import StdOutCallbackHandler

handler = StdOutCallbackHandler()

llm = ChatOpenAI(model="gpt-4", callbacks=[handler])
```

**FileCallbackHandler**：输出到文件

```python
from langchain.callbacks import FileCallbackHandler

handler = FileCallbackHandler("logs/execution.log")

llm = ChatOpenAI(model="gpt-4", callbacks=[handler])
```

---

## 四、LangSmith 调试

### 4.1 什么是 LangSmith？

**LangSmith** 是 LangChain 官方的调试和监控平台，提供：
- 可视化执行链路
- Token 消耗统计
- 性能分析
- 版本对比

### 4.2 配置 LangSmith

```bash
# 设置环境变量
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your_api_key
export LANGCHAIN_PROJECT=my-project
```

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your_api_key"
os.environ["LANGCHAIN_PROJECT"] = "my-project"

from langchain_openai import ChatOpenAI

# 所有调用会自动追踪
llm = ChatOpenAI(model="gpt-4")
result = llm.invoke("你好")
```

### 4.3 LangSmith 功能

**追踪执行链路**：

```
Chain: conversation_chain
├── LLM Call: gpt-4
│   ├── Prompt: "你好"
│   ├── Duration: 1.2s
│   └── Tokens: 15 input + 25 output
└── Output: "你好！有什么我可以帮助你的吗？"
```

**查看详细信息**：
- 输入输出
- Token 统计
- 耗时分析
- 错误信息

---

## 五、Token 消耗监控

### 5.1 使用回调监控

```python
from langchain.callbacks import get_openai_callback

# 使用上下文管理器
with get_openai_callback() as cb:
    result = llm.invoke("写一首诗")

    print(f"Token 使用统计：")
    print(f"  - 提示 Tokens: {cb.prompt_tokens}")
    print(f"  - 完成 Tokens: {cb.completion_tokens}")
    print(f"  - 总 Tokens: {cb.total_tokens}")
    print(f"  - 总成本: ${cb.total_cost:.4f}")
```

### 5.2 持续监控

```python
class TokenMonitor(BaseCallbackHandler):
    """Token 监控器"""

    def __init__(self):
        self.total_tokens = 0
        self.total_cost = 0
        self.calls = []

    def on_llm_end(self, response: LLMResult, **kwargs):
        """记录 Token 使用"""
        if response.llm_output:
            token_usage = response.llm_output.get('token_usage', {})
            prompt_tokens = token_usage.get('prompt_tokens', 0)
            completion_tokens = token_usage.get('completion_tokens', 0)
            total = prompt_tokens + completion_tokens

            # 估算成本（GPT-4 价格）
            cost = (prompt_tokens * 0.03 + completion_tokens * 0.06) / 1000

            self.total_tokens += total
            self.total_cost += cost

            self.calls.append({
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'cost': cost
            })

    def summary(self):
        """输出统计摘要"""
        print(f"总 Token 数: {self.total_tokens}")
        print(f"总成本: ${self.total_cost:.4f}")
        print(f"调用次数: {len(self.calls)}")

# 使用
monitor = TokenMonitor()
llm = ChatOpenAI(model="gpt-4", callbacks=[monitor])

# 多次调用
llm.invoke("你好")
llm.invoke("写一首诗")
llm.invoke("翻译这段话")

# 查看统计
monitor.summary()
```

### 5.3 成本估算

```python
# 各模型价格参考（2024年）
MODEL_PRICES = {
    "gpt-4": {"prompt": 0.03, "completion": 0.06},      # per 1K tokens
    "gpt-4-turbo": {"prompt": 0.01, "completion": 0.03},
    "gpt-3.5-turbo": {"prompt": 0.0005, "completion": 0.0015},
    "claude-3-opus": {"prompt": 0.015, "completion": 0.075},
    "claude-3-sonnet": {"prompt": 0.003, "completion": 0.015},
}

def estimate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    """估算成本"""
    prices = MODEL_PRICES.get(model, {"prompt": 0.01, "completion": 0.01})
    cost = (prompt_tokens * prices["prompt"] + completion_tokens * prices["completion"]) / 1000
    return cost
```

---

## 六、调试最佳实践

### 6.1 Verbose 模式

```python
from langchain.agents import initialize_agent, AgentType
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4")

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True  # 开启详细输出
)

# 执行时会打印详细过程
agent.run("查询北京天气")
```

输出示例：

```
> Entering new AgentExecutor chain...
I need to check the weather in Beijing
Action: weather
Action Input: 北京
Observation: 北京天气：晴，15-25°C
Thought: I now know the weather
Final Answer: 北京今天天气晴朗，气温15-25摄氏度。
> Finished chain.
```

### 6.2 日志记录

```python
import logging
from langchain.callbacks import StdOutCallbackHandler

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='langchain.log'
)

logger = logging.getLogger(__name__)

class LoggingCallbackHandler(BaseCallbackHandler):
    """日志回调处理器"""

    def on_llm_start(self, serialized, prompts, **kwargs):
        logger.info(f"LLM 开始: {prompts}")

    def on_llm_end(self, response, **kwargs):
        logger.info(f"LLM 结束: {response}")

    def on_llm_error(self, error, **kwargs):
        logger.error(f"LLM 错误: {error}")
```

### 6.3 断点调试

```python
class DebugCallbackHandler(BaseCallbackHandler):
    """调试回调处理器"""

    def on_llm_start(self, serialized, prompts, **kwargs):
        print("\n" + "="*50)
        print("LLM 调用即将开始")
        print(f"提示: {prompts}")
        print("="*50)
        # 可以在这里设置断点
        # import pdb; pdb.set_trace()

    def on_llm_end(self, response, **kwargs):
        print("\n" + "="*50)
        print("LLM 调用结束")
        print(f"响应: {response}")
        print("="*50)
```

### 6.4 性能分析

```python
import time
from functools import wraps

def timing_decorator(func):
    """计时装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 耗时: {end - start:.2f}s")
        return result
    return wrapper

class PerformanceMonitor(BaseCallbackHandler):
    """性能监控回调"""

    def __init__(self):
        self.timings = {}
        self._start_times = {}

    def on_chain_start(self, serialized, inputs, **kwargs):
        key = serialized.get('name', 'unknown')
        self._start_times[key] = time.time()

    def on_chain_end(self, outputs, **kwargs):
        # 计算耗时
        pass
```

---

## 七、实战：构建完整的监控系统

### 7.1 需求

构建一个 Agent 监控系统：
- 记录所有调用
- 统计 Token 消耗
- 记录错误日志
- 生成执行报告

### 7.2 实现

```python
from langchain.callbacks import BaseCallbackHandler
from langchain.schema import LLMResult
from datetime import datetime
import json
from typing import List, Dict, Any

class AgentMonitor(BaseCallbackHandler):
    """Agent 监控系统"""

    def __init__(self, log_file: str = "monitor_log.json"):
        self.log_file = log_file
        self.logs: List[Dict[str, Any]] = []
        self.session_start = datetime.now()
        self.total_tokens = 0
        self.total_cost = 0
        self.errors: List[Dict] = []

    def on_llm_start(self, serialized, prompts, **kwargs):
        """记录 LLM 开始"""
        self._current_call = {
            "type": "llm",
            "start_time": datetime.now().isoformat(),
            "prompts": prompts,
            "model": serialized.get("name", "unknown")
        }

    def on_llm_end(self, response: LLMResult, **kwargs):
        """记录 LLM 结束"""
        if not hasattr(self, '_current_call'):
            return

        self._current_call["end_time"] = datetime.now().isoformat()

        # Token 统计
        if response.llm_output and 'token_usage' in response.llm_output:
            usage = response.llm_output['token_usage']
            self._current_call["tokens"] = usage
            self.total_tokens += usage.get('total_tokens', 0)

            # 成本估算
            cost = self._estimate_cost(usage)
            self._current_call["cost"] = cost
            self.total_cost += cost

        # 响应内容
        if response.generations:
            self._current_call["response"] = response.generations[0][0].text

        self.logs.append(self._current_call)
        self._persist()

    def on_llm_error(self, error, **kwargs):
        """记录错误"""
        error_log = {
            "type": "error",
            "time": datetime.now().isoformat(),
            "error": str(error)
        }
        self.errors.append(error_log)
        self.logs.append(error_log)
        self._persist()

    def on_tool_start(self, serialized, input_str, **kwargs):
        """记录工具调用"""
        self._current_tool = {
            "type": "tool",
            "start_time": datetime.now().isoformat(),
            "tool_name": serialized.get("name", "unknown"),
            "input": input_str
        }

    def on_tool_end(self, output, **kwargs):
        """记录工具响应"""
        if hasattr(self, '_current_tool'):
            self._current_tool["end_time"] = datetime.now().isoformat()
            self._current_tool["output"] = output
            self.logs.append(self._current_tool)
            self._persist()

    def _estimate_cost(self, usage: dict) -> float:
        """估算成本（GPT-4 价格）"""
        prompt_tokens = usage.get('prompt_tokens', 0)
        completion_tokens = usage.get('completion_tokens', 0)
        return (prompt_tokens * 0.03 + completion_tokens * 0.06) / 1000

    def _persist(self):
        """持久化日志"""
        with open(self.log_file, 'w') as f:
            json.dump({
                "session_start": self.session_start.isoformat(),
                "logs": self.logs,
                "summary": self.get_summary()
            }, f, ensure_ascii=False, indent=2)

    def get_summary(self) -> dict:
        """获取统计摘要"""
        return {
            "session_duration": str(datetime.now() - self.session_start),
            "total_calls": len(self.logs),
            "total_tokens": self.total_tokens,
            "total_cost": f"${self.total_cost:.4f}",
            "error_count": len(self.errors)
        }

    def print_report(self):
        """打印执行报告"""
        summary = self.get_summary()
        print("\n" + "="*50)
        print("Agent 执行报告")
        print("="*50)
        print(f"会话时长: {summary['session_duration']}")
        print(f"总调用次数: {summary['total_calls']}")
        print(f"总 Token 数: {summary['total_tokens']}")
        print(f"总成本: {summary['total_cost']}")
        print(f"错误次数: {summary['error_count']}")
        print("="*50)


# 使用示例
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool

# 创建监控器
monitor = AgentMonitor()

# 创建 LLM（带监控）
llm = ChatOpenAI(model="gpt-4", callbacks=[monitor])

# 定义工具
def calculator(expression: str) -> str:
    return str(eval(expression))

tools = [
    Tool(name="calculator", func=calculator, description="计算数学表达式")
]

# 创建 Agent（带监控）
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=[monitor],
    verbose=True
)

# 执行
result = agent.run("计算 123 * 456")

# 打印报告
monitor.print_report()
```

---

## 八、模块二总结

### 8.1 知识图谱

```
模块二：LangChain 核心组件
│
├── 课时 5：LLM 与 Prompt 模板
│   ├── LLM 抽象层
│   ├── PromptTemplate 动态提示
│   └── Few-shot 提示技巧
│
├── 课时 6：Memory 记忆系统
│   ├── ConversationBuffer
│   ├── ConversationBufferWindow
│   ├── ConversationSummary
│   └── VectorStoreMemory
│
├── 课时 7：Tool 工具定义与调用
│   ├── 内置工具
│   ├── 自定义工具
│   └── 工具调用流程
│
├── 课时 8：Chain 链式调用
│   ├── LLMChain
│   ├── SequentialChain
│   ├── RouterChain
│   └── TransformChain
│
├── 课时 9：OutputParser 结构化输出
│   ├── PydanticOutputParser
│   ├── ListParser
│   └── 错误处理
│
└── 课时 10：回调与调试
    ├── 回调机制
    ├── LangSmith
    ├── Token 监控
    └── 调试最佳实践
```

### 8.2 核心技能点

| 组件 | 核心能力 |
|------|---------|
| LLM | 统一模型调用接口 |
| Prompt | 动态生成提示 |
| Memory | 对话上下文管理 |
| Tool | 扩展 Agent 能力 |
| Chain | 构建处理流程 |
| Parser | 结构化输出 |
| Callback | 监控和调试 |

### 8.3 下一步

下一模块，我们将学习 **Agent 开发进阶**：
- AgentExecutor 原理解析
- 自定义 Tool 开发实战
- Multi-Agent 协作基础
- 错误处理与重试策略

---

**下一模块**：Agent 开发进阶 - 从理解原理到实战应用