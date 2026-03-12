# LangChain 入门：从零开始构建你的第一个 LLM 应用

> 适合人群：有 Python 基础，想学习 LLM 应用开发
> 预计阅读：10 分钟
> 难度：入门

---

## 前言

ChatGPT 爆火之后，每个人都想用 LLM 做点什么。但面对 API 文档和海量框架，很多人不知道从哪开始。

今天这篇文章，带你从零开始，用 LangChain 构建你的第一个 LLM 应用。

## 一、什么是 LangChain？

简单来说，**LangChain 是一个帮你快速开发 LLM 应用的框架**。

它把开发 LLM 应用需要的常见功能都封装好了：

- 📝 **Prompt 模板**：动态生成提示词
- 🧠 **记忆系统**：记住对话上下文
- 🔧 **工具调用**：让 LLM 能执行操作
- 🔗 **链式调用**：组合多个步骤
- 📊 **RAG 检索**：基于知识库问答

## 二、5 分钟快速开始

### 2.1 安装

```bash
pip install langchain langchain-openai
```

### 2.2 第一个程序

```python
from langchain_openai import ChatOpenAI

# 创建 LLM 实例
llm = ChatOpenAI(model="gpt-4")

# 简单调用
response = llm.invoke("用一句话解释什么是 Agent")

print(response.content)
```

输出：
```
Agent 是一种能够自主感知环境、做出决策并采取行动以实现目标的智能实体。
```

就这么简单！你已经完成了第一个 LLM 应用。

## 三、进阶：使用 Prompt 模板

实际开发中，我们经常需要动态生成提示词。LangChain 提供了 PromptTemplate：

```python
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

# 创建模板
template = PromptTemplate.from_template("""
你是一个{role}。

请用{style}的风格，回答以下问题：
{question}
""")

# 填充变量
prompt = template.format(
    role="资深程序员",
    style="幽默",
    question="什么是递归？"
)

# 调用 LLM
llm = ChatOpenAI(model="gpt-4")
response = llm.invoke(prompt)

print(response.content)
```

## 四、实战：构建对话机器人

让我们把学到的知识组合起来，构建一个简单的对话机器人：

```python
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 创建 LLM
llm = ChatOpenAI(model="gpt-4", temperature=0.7)

# 创建记忆
memory = ConversationBufferMemory()

# 创建对话链
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True  # 显示详细过程
)

# 对话
print(conversation.predict(input="你好，我叫张三"))
print(conversation.predict(input="我叫什么名字？"))  # 会记住！
```

## 五、学习路径建议

掌握了基础之后，推荐的学习顺序：

```
1. LLM 基础 → 调用 API、Prompt 工程
      ↓
2. LangChain 核心 → Prompt、Memory、Chain
      ↓
3. 工具与 Agent → Tool、AgentExecutor
      ↓
4. RAG 系统 → 向量数据库、检索增强
      ↓
5. 实战项目 → 完整应用开发
```

## 六、总结

今天我们学习了：

1. LangChain 是什么
2. 如何快速开始
3. Prompt 模板使用
4. 构建简单对话机器人

这只是冰山一角。LangChain 还有更多强大的功能等你探索。

---

## 下一步

想系统学习 Agent 开发？推荐我的实战课程：

👉 **Agent 开发实战**：24 课时，3 个完整项目，从入门到精通

关注公众号回复「**LangChain**」获取完整代码示例。

---

*本文是「LLM 学习营」系列教程第 1 篇*