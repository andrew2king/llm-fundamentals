# 课时 2：Agent 核心架构

> Agent 开发实战 - 模块一：Agent 基础概念

## 一、本课目标

- 理解 Agent 的三层架构设计
- 掌握各层组件的职责与交互方式
- 学会分析现有 Agent 系统的架构

---

## 二、Agent 架构总览

### 2.1 三层架构模型

```
┌────────────────────────────────────────────┐
│                 用户交互层                   │
│              (User Interface)               │
├────────────────────────────────────────────┤
│                 决策规划层                   │
│           (Planning & Reasoning)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  规划器   │  │  推理器   │  │  反思器   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├────────────────────────────────────────────┤
│                 执行行动层                   │
│              (Action Layer)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 工具调用  │  │ API 执行  │  │ 结果处理  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├────────────────────────────────────────────┤
│                 记忆存储层                   │
│              (Memory Layer)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 短期记忆  │  │ 长期记忆  │  │ 工作记忆  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────────────────────────┘
```

### 2.2 架构特点

- **模块化**：各层职责清晰，可独立优化
- **可扩展**：新增工具、策略不影响核心架构
- **可观测**：每层输出可监控、调试

---

## 三、感知层：理解世界

### 3.1 感知层的职责

```
输入 → [感知层] → 结构化理解
```

**核心功能**：
- 用户意图识别
- 多模态输入处理（文本、图像、音频）
- 环境状态感知
- 上下文理解

### 3.2 关键组件

**1. 意图识别器**

```python
# 示例：用户输入解析
user_input = "帮我查一下北京明天的天气，然后预订一张去上海的机票"

# 意图识别结果
intents = [
    {"action": "query_weather", "params": {"city": "北京", "date": "明天"}},
    {"action": "book_flight", "params": {"destination": "上海"}}
]
```

**2. 实体抽取器**

```python
# 从自然语言中提取关键实体
entities = {
    "city": "北京",
    "date": "明天",
    "destination": "上海"
}
```

**3. 上下文管理器**

```python
# 维护对话上下文
context = {
    "conversation_id": "xxx",
    "history": [...],
    "current_task": "weather_query",
    "user_preferences": {...}
}
```

### 3.3 感知层设计要点

| 要点 | 说明 | 最佳实践 |
|------|------|---------|
| 容错性 | 用户输入可能模糊 | 提供澄清机制 |
| 多模态 | 支持多种输入类型 | 统一抽象接口 |
| 隐私保护 | 敏感信息处理 | 本地处理或脱敏 |

---

## 四、决策层：规划与推理

### 4.1 决策层的职责

```
目标 → [决策层] → 行动计划
```

**核心功能**：
- 任务分解（Task Decomposition）
- 行动规划（Action Planning）
- 推理判断（Reasoning）
- 策略选择（Strategy Selection）

### 4.2 核心组件详解

**1. 规划器（Planner）**

```python
# 任务分解示例
goal = "帮我准备一份市场分析报告"

plan = [
    {"step": 1, "action": "search", "query": "市场分析报告模板"},
    {"step": 2, "action": "search", "query": "行业最新数据"},
    {"step": 3, "action": "analyze", "data": "step2_result"},
    {"step": 4, "action": "write", "template": "step1_result", "content": "step3_result"}
]
```

**2. 推理器（Reasoner）**

```python
# 推理链示例
observation = "API 返回 401 错误"
reasoning = """
观察：API 返回 401 未授权错误
思考：可能是 token 过期或无效
决策：先尝试刷新 token，如果失败则提示用户重新登录
"""
action = "refresh_token"
```

**3. 反思器（Reflector）**

```python
# 反思机制
task_result = execute_plan(plan)
reflection = """
评估：
- 任务完成度：80%
- 遗漏问题：未包含竞品分析
改进方案：
- 补充竞品分析章节
- 增加数据来源引用
"""
```

### 4.3 决策策略

| 策略 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **ReAct** | 需要工具调用的任务 | 简单高效 | 可能陷入循环 |
| **Plan-and-Execute** | 复杂多步骤任务 | 结构清晰 | 灵活性较低 |
| **Reflection** | 需要高质量输出 | 结果更准确 | 成本较高 |

---

## 五、行动层：执行与反馈

### 5.1 行动层的职责

```
行动计划 → [行动层] → 执行结果
```

**核心功能**：
- 工具调用（Tool Calling）
- API 执行（API Execution）
- 结果处理（Result Processing）
- 错误处理（Error Handling）

### 5.2 工具调用机制

**工具定义示例**：

```python
from langchain.tools import Tool

def search_web(query: str) -> str:
    """搜索网页内容"""
    # 调用搜索 API
    results = search_api(query)
    return results

def send_email(to: str, subject: str, body: str) -> str:
    """发送邮件"""
    # 调用邮件 API
    return email_api.send(to, subject, body)

# 注册工具
tools = [
    Tool(
        name="web_search",
        func=search_web,
        description="搜索网页获取信息，输入搜索关键词"
    ),
    Tool(
        name="send_email",
        func=send_email,
        description="发送邮件，参数：收件人、主题、正文"
    )
]
```

### 5.3 执行流程

```
1. 接收决策层的行动计划
      ↓
2. 解析行动参数
      ↓
3. 选择对应工具
      ↓
4. 执行工具调用
      ↓
5. 收集执行结果
      ↓
6. 返回结果给决策层
```

### 5.4 错误处理策略

```python
def execute_with_retry(action, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = execute_action(action)
            return result
        except RateLimitError:
            wait_time = 2 ** attempt  # 指数退避
            time.sleep(wait_time)
        except InvalidInputError:
            # 输入错误，不需要重试
            return {"error": "Invalid input"}
        except Exception as e:
            if attempt == max_retries - 1:
                return {"error": str(e)}
```

---

## 六、记忆层：存储与检索

### 6.1 记忆层的职责

```
信息 → [记忆层] → 存储与检索
```

### 6.2 三种记忆类型

**1. 短期记忆（Short-term Memory）**

```python
# 对话上下文记忆
conversation_history = [
    {"role": "user", "content": "帮我查一下天气"},
    {"role": "assistant", "content": "请问是哪个城市？"},
    {"role": "user", "content": "北京"},
    {"role": "assistant", "content": "北京明天晴，气温 15-25°C"}
]
```

**2. 长期记忆（Long-term Memory）**

```python
# 向量数据库存储
from langchain.vectorstores import Chroma

# 存储知识
vectorstore = Chroma.from_texts(
    texts=["公司成立于 2020 年", "主营产品是 AI 助手"],
    embedding=embeddings
)

# 检索知识
relevant_info = vectorstore.similarity_search("公司什么时候成立的？")
```

**3. 工作记忆（Working Memory）**

```python
# 当前任务状态
working_memory = {
    "current_task": "prepare_report",
    "completed_steps": ["search_template", "collect_data"],
    "pending_steps": ["analyze", "write"],
    "intermediate_results": {...}
}
```

### 6.3 记忆管理策略

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| 滑动窗口 | 只保留最近 N 条对话 | 简单对话场景 |
| 摘要压缩 | 历史对话压缩成摘要 | 长对话场景 |
| 向量检索 | 按相关性检索历史 | 知识问答场景 |
| 分层记忆 | 短期+长期+工作记忆 | 复杂任务场景 |

---

## 七、架构设计最佳实践

### 7.1 设计原则

1. **单一职责**：每个组件只做一件事
2. **松耦合**：组件间通过接口交互
3. **可观测**：每个步骤都有日志输出
4. **容错性**：任何步骤都可能失败，需要处理

### 7.2 常见架构模式

**模式一：Pipeline 模式**

```
感知 → 决策 → 行动 → 反馈
```

**模式二：循环迭代模式**

```
感知 ↔ 决策 ↔ 行动
        ↑
       反思
```

**模式三：多 Agent 协作模式**

```
      ┌─────────┐
      │ 协调器   │
      └────┬────┘
    ┌───┬───┴───┬───┐
    ↓   ↓       ↓   ↓
 Agent1 Agent2 Agent3 Agent4
```

---

## 八、本课小结

### 8.1 关键要点

1. **三层架构**：感知 → 决策 → 行动，记忆贯穿始终
2. **感知层**：理解用户意图和环境状态
3. **决策层**：规划、推理、反思
4. **行动层**：工具调用、执行、反馈
5. **记忆层**：短期、长期、工作三种记忆

### 8.2 思考题

1. 如果让你设计一个订餐 Agent，各层需要什么组件？
2. 记忆管理中，如何平衡存储成本和检索效率？
3. 决策层的反思机制什么时候应该启用？

---

## 九、代码示例：简单 Agent 架构

```python
from typing import List, Dict
from dataclasses import dataclass

@dataclass
class Action:
    name: str
    parameters: Dict

class SimpleAgent:
    def __init__(self):
        self.memory = []
        self.tools = {}

    def perceive(self, user_input: str) -> Dict:
        """感知层：理解用户输入"""
        # 简化的意图识别
        return {"intent": "query", "content": user_input}

    def decide(self, perception: Dict) -> List[Action]:
        """决策层：规划行动"""
        # 简化的决策逻辑
        return [Action(name="search", parameters={"query": perception["content"]})]

    def act(self, actions: List[Action]) -> str:
        """行动层：执行行动"""
        results = []
        for action in actions:
            if action.name in self.tools:
                result = self.tools[action.name](**action.parameters)
                results.append(result)
        return "\n".join(results)

    def remember(self, input_data: str, output_data: str):
        """记忆层：存储对话"""
        self.memory.append({"input": input_data, "output": output_data})

    def run(self, user_input: str) -> str:
        """完整执行流程"""
        # 1. 感知
        perception = self.perceive(user_input)

        # 2. 决策
        actions = self.decide(perception)

        # 3. 行动
        result = self.act(actions)

        # 4. 记忆
        self.remember(user_input, result)

        return result
```

---

**下一课**：核心范式解析 - ReAct、Plan-and-Execute、Reflection 详解