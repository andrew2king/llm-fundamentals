# 课时 6：Memory 记忆系统

> Agent 开发实战 - 模块二：LangChain 核心组件

## 一、本课目标

- 理解 Agent 记忆系统的作用与类型
- 掌握 4 种核心记忆机制
- 学会根据场景选择合适的记忆策略

---

## 二、为什么需要记忆？

### 2.1 问题场景

**无记忆的对话**：

```
用户：我叫张三
AI：你好，张三！

用户：我叫什么名字？
AI：抱歉，我不知道您的名字。
```

**有记忆的对话**：

```
用户：我叫张三
AI：你好，张三！

用户：我叫什么名字？
AI：您叫张三。
```

### 2.2 记忆的作用

| 作用 | 说明 |
|------|------|
| **上下文保持** | 记住之前对话内容 |
| **个性化服务** | 记住用户偏好 |
| **任务连续性** | 记住任务进度和状态 |
| **知识积累** | 存储和检索长期知识 |

---

## 三、四种核心记忆类型

### 3.1 记忆类型总览

```
┌─────────────────────────────────────────────────┐
│                LangChain 记忆系统                │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ Conversation │  │ Conversation │              │
│  │   Buffer    │  │ BufferWindow │              │
│  │  (完整记忆)  │  │  (滑动窗口)   │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ Conversation │  │  VectorStore │              │
│  │   Summary   │  │   Memory    │              │
│  │  (摘要记忆)  │  │  (向量记忆)   │              │
│  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────┘
```

### 3.2 ConversationBuffer：完整记忆

**特点**：保存所有对话历史

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

# 创建记忆
memory = ConversationBufferMemory()

# 创建对话链
llm = ChatOpenAI(model="gpt-4")
conversation = ConversationChain(llm=llm, memory=memory, verbose=True)

# 对话
conversation.predict(input="你好，我叫张三")
conversation.predict(input="我喜欢打篮球")
conversation.predict(input="我叫什么名字？我喜欢什么？")

# 查看记忆内容
print(memory.load_memory_variables())
# {'history': 'Human: 你好，我叫张三\nAI: 你好张三！很高兴认识你...\n...'}
```

**优缺点**：

| 优点 | 缺点 |
|------|------|
| 信息完整 | Token 消耗随对话增长 |
| 实现简单 | 长对话成本高 |
| 适合短对话 | 可能超出上下文限制 |

### 3.3 ConversationBufferWindow：滑动窗口

**特点**：只保留最近 N 轮对话

```python
from langchain.memory import ConversationBufferWindowMemory

# 只保留最近 3 轮对话
memory = ConversationBufferWindowMemory(k=3)

conversation = ConversationChain(llm=llm, memory=memory, verbose=True)

conversation.predict(input="第1轮对话")
conversation.predict(input="第2轮对话")
conversation.predict(input="第3轮对话")
conversation.predict(input="第4轮对话")  # 第1轮被丢弃

# 查看记忆
print(memory.load_memory_variables())
# 只能看到第2、3、4轮对话
```

**优缺点**：

| 优点 | 缺点 |
|------|------|
| Token 消耗可控 | 早期对话丢失 |
| 适合长对话 | 可能丢失重要信息 |
| 性能稳定 | 需要调参 |

### 3.4 ConversationSummary：摘要记忆

**特点**：自动压缩历史对话成摘要

```python
from langchain.memory import ConversationSummaryMemory

# 创建摘要记忆
memory = ConversationSummaryMemory(llm=llm)

conversation = ConversationChain(llm=llm, memory=memory, verbose=True)

# 长对话会被自动压缩
conversation.predict(input="我叫张三，今年25岁")
conversation.predict(input="我在北京工作，是一名程序员")
conversation.predict(input="我喜欢打篮球和看电影")

# 查看摘要
print(memory.load_memory_variables())
# {'history': '用户是张三，25岁，在北京做程序员，喜欢打篮球和看电影'}
```

**优缺点**：

| 优点 | 缺点 |
|------|------|
| 大幅节省 Token | 有信息损失 |
| 适合超长对话 | 需要额外 LLM 调用 |
| 保留关键信息 | 摘要质量依赖 LLM |

### 3.5 VectorStoreMemory：向量记忆

**特点**：将对话存储到向量数据库，按相关性检索

```python
from langchain.memory import VectorStoreMemory
from langchain.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(embedding_function=embeddings)

# 创建向量记忆
memory = VectorStoreMemory(
    vectorstore=vectorstore,
    memory_key="history",
    input_key="input"
)

# 对话会被向量化存储
conversation = ConversationChain(llm=llm, memory=memory)

conversation.predict(input="公司成立于2020年")
conversation.predict(input="主要产品是AI助手")
conversation.predict(input="公司什么时候成立的？")  # 会检索相关信息
```

**优缺点**：

| 优点 | 缺点 |
|------|------|
| 可存储海量记忆 | 实现复杂 |
| 按相关性检索 | 需要向量数据库 |
| 支持语义搜索 | 检索精度影响效果 |

---

## 四、记忆类型选择指南

### 4.1 决策树

```
对话长度？
│
├─ 短对话（<10轮）
│   └─ ConversationBuffer（完整记忆）
│
├─ 中等对话（10-50轮）
│   └─ ConversationBufferWindow（滑动窗口）
│
└─ 长对话（>50轮）
    │
    ├─ 需要保留所有信息？
    │   ├─ 是 → VectorStoreMemory（向量检索）
    │   └─ 否 → ConversationSummary（摘要压缩）
    │
    └─ 需要精确回忆？
        └─ VectorStoreMemory + ConversationBufferWindow 组合
```

### 4.2 场景映射

| 场景 | 推荐记忆类型 | 原因 |
|------|-------------|------|
| 智能客服 | ConversationBufferWindow | 对话中等长度，需近期上下文 |
| 个人助理 | VectorStoreMemory | 需长期记忆和语义检索 |
| 代码助手 | ConversationBuffer | 代码上下文需要完整 |
| 文档问答 | ConversationSummary | 长对话，可接受摘要 |

---

## 五、高级记忆管理

### 5.1 组合记忆

```python
from langchain.memory import CombinedMemory

# 组合多种记忆
buffer_memory = ConversationBufferMemory(memory_key="chat_history")
summary_memory = ConversationSummaryMemory(
    llm=llm,
    memory_key="summary_history"
)

combined_memory = CombinedMemory(
    memories=[buffer_memory, summary_memory]
)

# 可以同时访问两种记忆
conversation = ConversationChain(
    llm=llm,
    memory=combined_memory,
    verbose=True
)
```

### 5.2 自定义记忆

```python
from langchain.memory import BaseChatMemory
from typing import Dict, List, Any

class CustomMemory(BaseChatMemory):
    """自定义记忆：按主题分类存储"""

    def __init__(self):
        self.topics: Dict[str, List[str]] = {}
        self.current_topic = "default"

    def save_context(self, inputs: Dict[str, Any], outputs: Dict[str, str]) -> None:
        """保存对话到当前主题"""
        input_str = inputs.get("input", "")
        output_str = outputs.get("output", "")

        if self.current_topic not in self.topics:
            self.topics[self.current_topic] = []

        self.topics[self.current_topic].append(f"User: {input_str}\nAI: {output_str}")

    def load_memory_variables(self, inputs: Dict[str, Any]) -> Dict[str, str]:
        """加载当前主题的对话"""
        return {
            "history": "\n".join(self.topics.get(self.current_topic, []))
        }

    def switch_topic(self, topic: str):
        """切换主题"""
        self.current_topic = topic

    def clear(self):
        """清空记忆"""
        self.topics = {}
```

### 5.3 记忆持久化

```python
import json
from pathlib import Path

class PersistentMemory:
    """可持久化的记忆"""

    def __init__(self, file_path: str = "memory.json"):
        self.file_path = Path(file_path)
        self.memory = self._load()

    def _load(self) -> dict:
        """从文件加载"""
        if self.file_path.exists():
            return json.loads(self.file_path.read_text())
        return {"conversations": []}

    def save(self, user_input: str, ai_output: str):
        """保存对话"""
        self.memory["conversations"].append({
            "user": user_input,
            "ai": ai_output,
            "timestamp": datetime.now().isoformat()
        })
        self._persist()

    def _persist(self):
        """持久化到文件"""
        self.file_path.write_text(json.dumps(self.memory, ensure_ascii=False, indent=2))

    def get_recent(self, n: int = 5) -> list:
        """获取最近 N 条"""
        return self.memory["conversations"][-n:]
```

---

## 六、实战：构建有记忆的客服机器人

### 6.1 需求

- 记住用户信息（姓名、偏好）
- 记住对话上下文
- 支持长对话

### 6.2 实现

```python
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferWindowMemory, ConversationSummaryMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate

class SmartCustomerBot:
    """智能客服机器人"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.7)

        # 双层记忆：窗口 + 摘要
        self.short_term_memory = ConversationBufferWindowMemory(k=5)
        self.long_term_memory = ConversationSummaryMemory(llm=self.llm)

        # 用户信息存储
        self.user_info = {}

        self._setup_chain()

    def _setup_chain(self):
        """设置对话链"""
        template = """你是一个专业的客服助手。

当前用户信息：
{user_info}

最近对话：
{history}

用户：{input}
客服："""

        self.prompt = PromptTemplate(
            input_variables=["history", "input", "user_info"],
            template=template
        )

    def chat(self, user_input: str) -> str:
        """对话"""
        # 获取记忆
        short_term = self.short_term_memory.load_memory_variables({})["history"]
        long_term = self.long_term_memory.load_memory_variables({})["history"]

        # 组合记忆
        combined_history = f"摘要：{long_term}\n\n最近：{short_term}"

        # 用户信息字符串
        user_info_str = "\n".join([f"{k}: {v}" for k, v in self.user_info.items()])

        # 生成回复
        prompt = self.prompt.format(
            history=combined_history,
            input=user_input,
            user_info=user_info_str
        )
        response = self.llm.invoke(prompt)

        # 保存到记忆
        self.short_term_memory.save_context(
            {"input": user_input},
            {"output": response.content}
        )

        # 提取用户信息
        self._extract_user_info(user_input)

        return response.content

    def _extract_user_info(self, text: str):
        """从对话中提取用户信息"""
        # 简单的关键词提取
        if "我叫" in text:
            name = text.split("我叫")[1].split()[0]
            self.user_info["姓名"] = name
        if "喜欢" in text:
            preference = text.split("喜欢")[1].split()[0]
            self.user_info["偏好"] = preference

# 使用
bot = SmartCustomerBot()

print(bot.chat("你好，我叫张三"))
print(bot.chat("我喜欢电子产品"))
print(bot.chat("我叫什么名字？"))  # 能记住
print(bot.chat("根据我的偏好推荐产品"))  # 能使用偏好信息
```

---

## 七、本课小结

### 7.1 关键要点

1. **ConversationBuffer**：完整记忆，适合短对话
2. **ConversationBufferWindow**：滑动窗口，适合中等对话
3. **ConversationSummary**：摘要压缩，适合长对话
4. **VectorStoreMemory**：向量检索，适合海量记忆

### 7.2 选择原则

- 短对话用 Buffer
- 长对话用 Window 或 Summary
- 需要精确检索用 VectorStore
- 复杂场景可组合使用

### 7.3 思考题

1. 如何判断一个对话系统需要哪种记忆？
2. 记忆系统的成本和效果如何平衡？
3. 如何处理记忆中的敏感信息？

---

**下一课**：Tool 工具定义与调用 - 扩展 Agent 能力边界