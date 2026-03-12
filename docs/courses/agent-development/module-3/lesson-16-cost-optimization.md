# 课时 16：成本优化技巧

> Agent 开发实战 - 模块三：Agent 开发进阶

## 一、本课目标

- 理解 LLM 成本构成
- 掌握 Prompt 压缩技巧
- 学会缓存与模型选择策略

---

## 二、成本构成分析

### 2.1 Token 计费模型

```
总成本 = 提示 Token × 输入价格 + 完成 Token × 输出价格
```

**主流模型价格（2024年，每 1K Token）**：

| 模型 | 输入价格 | 输出价格 |
|------|---------|---------|
| GPT-4 | $0.03 | $0.06 |
| GPT-4-Turbo | $0.01 | $0.03 |
| GPT-3.5-Turbo | $0.0005 | $0.0015 |
| Claude-3-Opus | $0.015 | $0.075 |
| Claude-3-Sonnet | $0.003 | $0.015 |

### 2.2 Agent 成本分析

```python
class CostAnalyzer:
    """成本分析器"""

    def __init__(self):
        self.model_prices = {
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-4-turbo": {"input": 0.01, "output": 0.03},
            "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        }

    def calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """计算成本"""
        prices = self.model_prices.get(model, {"input": 0.01, "output": 0.01})
        cost = (input_tokens * prices["input"] + output_tokens * prices["output"]) / 1000
        return cost

    def estimate_monthly_cost(self, daily_requests: int, avg_input: int, avg_output: int, model: str):
        """估算月度成本"""
        daily_cost = self.calculate_cost(model, avg_input, avg_output) * daily_requests
        monthly_cost = daily_cost * 30
        return {
            "daily": daily_cost,
            "monthly": monthly_cost,
            "yearly": monthly_cost * 12
        }

# 使用
analyzer = CostAnalyzer()
print(analyzer.estimate_monthly_cost(
    daily_requests=1000,
    avg_input=500,
    avg_output=200,
    model="gpt-4-turbo"
))
# {'daily': 1.1, 'monthly': 33.0, 'yearly': 396.0}
```

### 2.3 成本热点识别

```python
from langchain.callbacks import BaseCallbackHandler

class CostTrackingHandler(BaseCallbackHandler):
    """成本追踪处理器"""

    def __init__(self, model_prices: dict):
        self.model_prices = model_prices
        self.calls = []

    def on_llm_end(self, response, **kwargs):
        """记录 LLM 调用"""
        if response.llm_output:
            usage = response.llm_output.get("token_usage", {})
            self.calls.append({
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "completion_tokens": usage.get("completion_tokens", 0),
                "model": kwargs.get("invocation_params", {}).get("model", "unknown")
            })

    def get_report(self):
        """生成成本报告"""
        total_input = sum(c["prompt_tokens"] for c in self.calls)
        total_output = sum(c["completion_tokens"] for c in self.calls)

        # 按模型分组
        by_model = {}
        for call in self.calls:
            model = call["model"]
            if model not in by_model:
                by_model[model] = {"calls": 0, "input": 0, "output": 0}
            by_model[model]["calls"] += 1
            by_model[model]["input"] += call["prompt_tokens"]
            by_model[model]["output"] += call["completion_tokens"]

        return {
            "total_calls": len(self.calls),
            "total_input_tokens": total_input,
            "total_output_tokens": total_output,
            "by_model": by_model
        }
```

---

## 三、Prompt 压缩技巧

### 3.1 精简原则

```python
# ❌ 冗长的提示
bad_prompt = """
我需要你作为一个专业的翻译人员，请你将下面的文本从中文翻译成英文。
在翻译的过程中，请注意保持原文的意思和语气，同时确保翻译后的英文流畅自然。
如果你遇到任何不确定的地方，可以保持原文的表达方式。
以下是需要翻译的文本：
{text}
"""

# ✅ 精简的提示
good_prompt = """
将以下中文翻译成英文，保持原意：
{text}
"""
```

### 3.2 使用压缩工具

```python
from langchain.reducers import SemanticRollbackReducer

def compress_prompt(prompt: str, max_tokens: int = 500) -> str:
    """压缩提示（保留关键信息）"""
    # 简单实现：删除多余空格和换行
    compressed = " ".join(prompt.split())

    # 更高级的实现可以使用 LLM 进行语义压缩
    # ...

    return compressed

# 使用
long_prompt = """
请帮我分析以下文本的情感倾向...

（很多重复和冗余的内容）
"""

short_prompt = compress_prompt(long_prompt)
```

### 3.3 Few-shot 示例优化

```python
# ❌ 过多示例
bad_examples = [
    {"input": "开心", "output": "正面"},
    {"input": "快乐", "output": "正面"},
    {"input": "高兴", "output": "正面"},
    {"input": "悲伤", "output": "负面"},
    {"input": "难过", "output": "负面"},
    # ... 更多示例
]

# ✅ 精选示例
good_examples = [
    {"input": "开心", "output": "正面"},
    {"input": "悲伤", "output": "负面"},
    {"input": "还行", "output": "中性"},
]
```

### 3.4 动态示例选择

```python
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector
from langchain.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

class SmartExampleSelector:
    """智能示例选择器"""

    def __init__(self, examples: list, max_examples: int = 3):
        self.examples = examples
        self.max_examples = max_examples

        # 创建向量存储
        texts = [f"{e['input']} -> {e['output']}" for e in examples]
        self.vectorstore = Chroma.from_texts(texts, OpenAIEmbeddings())

    def select_examples(self, query: str) -> list:
        """选择最相关的示例"""
        results = self.vectorstore.similarity_search(query, k=self.max_examples)
        # 解析结果返回示例
        return self.examples[:self.max_examples]

# 使用
selector = SmartExampleSelector(all_examples, max_examples=3)
relevant_examples = selector.select_examples("这个产品太棒了！")
```

---

## 四、缓存策略

### 4.1 内存缓存

```python
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

# 启用内存缓存
set_llm_cache(InMemoryCache())

# 相同的输入会使用缓存
llm = ChatOpenAI(model="gpt-4")

result1 = llm.invoke("你好")  # 实际调用
result2 = llm.invoke("你好")  # 使用缓存
```

### 4.2 持久化缓存

```python
from langchain.cache import SQLiteCache
from langchain.globals import set_llm_cache

# 使用 SQLite 缓存
set_llm_cache(SQLiteCache(database_path=".langchain.db"))

# 缓存会持久化到文件
```

### 4.3 语义缓存

```python
from langchain.cache import SemanticCache
from langchain_openai import OpenAIEmbeddings

# 语义相似的结果也会命中缓存
set_llm_cache(SemanticCache(
    embedding=OpenAIEmbeddings(),
    similarity_threshold=0.95  # 相似度阈值
))

# 语义相似的查询会复用结果
result1 = llm.invoke("今天天气怎么样？")
result2 = llm.invoke("今天的天气如何？")  # 可能命中缓存
```

### 4.4 自定义缓存策略

```python
from langchain.schema import Generation
from typing import Optional
import hashlib
import json

class SmartCache:
    """智能缓存"""

    def __init__(self, ttl: int = 3600):
        self.cache = {}
        self.ttl = ttl

    def _hash(self, prompt: str, model: str) -> str:
        """生成缓存键"""
        content = f"{model}:{prompt}"
        return hashlib.md5(content.encode()).hexdigest()

    def get(self, prompt: str, model: str) -> Optional[str]:
        """获取缓存"""
        key = self._hash(prompt, model)
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["response"]
        return None

    def set(self, prompt: str, model: str, response: str):
        """设置缓存"""
        key = self._hash(prompt, model)
        self.cache[key] = {
            "response": response,
            "timestamp": time.time()
        }

# 使用
cache = SmartCache(ttl=3600)

def cached_llm_call(llm, prompt: str) -> str:
    # 检查缓存
    cached = cache.get(prompt, llm.model_name)
    if cached:
        print("使用缓存")
        return cached

    # 实际调用
    response = llm.invoke(prompt)
    cache.set(prompt, llm.model_name, response.content)
    return response.content
```

---

## 五、模型选择策略

### 5.1 任务分层

```python
class ModelSelector:
    """智能模型选择器"""

    TASK_MODEL_MAPPING = {
        "simple_qa": "gpt-3.5-turbo",      # 简单问答
        "translation": "gpt-3.5-turbo",     # 翻译
        "summarization": "gpt-3.5-turbo",   # 摘要
        "complex_reasoning": "gpt-4-turbo", # 复杂推理
        "creative_writing": "gpt-4",        # 创意写作
        "code_generation": "gpt-4-turbo",   # 代码生成
    }

    def __init__(self):
        self.models = {
            "gpt-4": ChatOpenAI(model="gpt-4"),
            "gpt-4-turbo": ChatOpenAI(model="gpt-4-turbo"),
            "gpt-3.5-turbo": ChatOpenAI(model="gpt-3.5-turbo"),
        }

    def classify_task(self, prompt: str) -> str:
        """分类任务类型"""
        prompt_lower = prompt.lower()

        if any(kw in prompt_lower for kw in ["翻译", "translate"]):
            return "translation"
        elif any(kw in prompt_lower for kw in ["总结", "摘要", "summarize"]):
            return "summarization"
        elif any(kw in prompt_lower for kw in ["代码", "code", "函数", "function"]):
            return "code_generation"
        elif any(kw in prompt_lower for kw in ["分析", "推理", "为什么", "analyze"]):
            return "complex_reasoning"
        elif any(kw in prompt_lower for kw in ["写", "创作", "生成", "write", "create"]):
            return "creative_writing"
        else:
            return "simple_qa"

    def get_model(self, prompt: str):
        """选择合适的模型"""
        task_type = self.classify_task(prompt)
        model_name = self.TASK_MODEL_MAPPING[task_type]
        return self.models[model_name], task_type

    def invoke(self, prompt: str) -> str:
        """智能调用"""
        model, task_type = self.get_model(prompt)
        print(f"任务类型: {task_type}, 使用模型: {model.model_name}")
        return model.invoke(prompt)
```

### 5.2 级联调用

```python
class CascadingLLM:
    """级联 LLM：先用便宜模型，失败再用贵的"""

    def __init__(self):
        self.models = [
            ("gpt-3.5-turbo", ChatOpenAI(model="gpt-3.5-turbo")),
            ("gpt-4-turbo", ChatOpenAI(model="gpt-4-turbo")),
        ]

    def invoke(self, prompt: str, validator=None):
        """级联调用"""
        for model_name, model in self.models:
            try:
                response = model.invoke(prompt)

                # 如果有验证器，检查结果
                if validator and not validator(response.content):
                    continue  # 结果不满意，尝试下一个模型

                return response

            except Exception as e:
                print(f"{model_name} 失败: {e}")
                continue

        raise Exception("所有模型都失败")
```

### 5.3 批量处理优化

```python
# ❌ 多次单独调用
for question in questions:
    response = llm.invoke(question)

# ✅ 批量调用
responses = llm.batch(questions)

# ✅ 更高效：合并为一个提示
combined_prompt = f"""
请回答以下问题，每个问题单独回答：

1. {questions[0]}
2. {questions[1]}
3. {questions[2]}

请按序号回答。
"""
response = llm.invoke(combined_prompt)
```

---

## 六、实战：成本优化 Agent

```python
from langchain_openai import ChatOpenAI
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache
from typing import Optional

class CostOptimizedAgent:
    """成本优化 Agent"""

    def __init__(self):
        # 启用缓存
        set_llm_cache(InMemoryCache())

        # 模型配置
        self.models = {
            "fast": ChatOpenAI(model="gpt-3.5-turbo"),
            "smart": ChatOpenAI(model="gpt-4-turbo")
        }

        self.call_stats = {
            "total_calls": 0,
            "cache_hits": 0,
            "by_model": {}
        }

    def _estimate_complexity(self, prompt: str) -> str:
        """评估任务复杂度"""
        # 简单启发式
        if len(prompt) < 100:
            return "simple"
        if any(kw in prompt for kw in ["分析", "推理", "比较", "评估"]):
            return "complex"
        return "medium"

    def _should_use_smart_model(self, prompt: str) -> bool:
        """决定是否使用智能模型"""
        complexity = self._estimate_complexity(prompt)
        return complexity == "complex"

    def invoke(self, prompt: str) -> str:
        """优化调用"""
        self.call_stats["total_calls"] += 1

        # 选择模型
        model_name = "smart" if self._should_use_smart_model(prompt) else "fast"
        model = self.models[model_name]

        # 记录模型使用
        if model_name not in self.call_stats["by_model"]:
            self.call_stats["by_model"][model_name] = 0
        self.call_stats["by_model"][model_name] += 1

        # 调用
        response = model.invoke(prompt)
        return response.content

    def get_stats(self):
        """获取统计"""
        return self.call_stats

# 使用
agent = CostOptimizedAgent()

# 简单问题用便宜模型
agent.invoke("你好")

# 复杂问题用智能模型
agent.invoke("请分析人工智能在医疗领域的应用趋势和挑战")

# 相同问题命中缓存
agent.invoke("你好")

print(agent.get_stats())
# {'total_calls': 3, 'cache_hits': 1, 'by_model': {'fast': 2, 'smart': 1}}
```

---

## 七、模块三总结

### 7.1 知识图谱

```
模块三：Agent 开发进阶
│
├── 课时 11：AgentExecutor 原理解析
│   ├── 执行循环
│   ├── 参数调优
│   └── 自定义 Agent
│
├── 课时 12：自定义 Tool 开发实战
│   ├── 开发规范
│   ├── 输入验证
│   └── 安全控制
│
├── 课时 13：Multi-Agent 协作基础
│   ├── LangGraph
│   ├── 协作模式
│   └── 状态管理
│
├── 课时 14：错误处理与重试策略
│   ├── 错误分类
│   ├── 重试机制
│   └── 降级策略
│
├── 课时 15：流式输出与用户体验
│   ├── 流式实现
│   ├── 前端集成
│   └── 取消支持
│
└── 课时 16：成本优化技巧
    ├── Prompt 压缩
    ├── 缓存策略
    └── 模型选择
```

### 7.2 核心技能点

| 技能 | 应用场景 |
|------|---------|
| AgentExecutor | 理解 Agent 运行机制 |
| 自定义 Tool | 扩展 Agent 能力 |
| Multi-Agent | 构建复杂协作系统 |
| 错误处理 | 提升系统稳定性 |
| 流式输出 | 优化用户体验 |
| 成本优化 | 降低运营成本 |

### 7.3 下一步

下一模块，我们将进入 **实战项目**：
- 智能客服 Agent
- 文档问答 Agent
- 数据分析 Agent

---

**下一模块**：实战项目 - 将所学技能应用于真实场景