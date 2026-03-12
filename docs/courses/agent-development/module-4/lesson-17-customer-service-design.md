# 课时 17：智能客服 Agent - 需求分析与架构设计

> Agent 开发实战 - 模块四：实战项目

## 一、项目概述

### 1.1 项目背景

智能客服是企业最常见的 AI 应用场景之一。传统客服面临的问题：
- 人工成本高
- 响应速度慢
- 服务质量参差不齐
- 7x24 小时难以保障

### 1.2 项目目标

构建一个智能客服 Agent，能够：
- 自动回答常见问题
- 查询订单、物流等业务数据
- 处理简单投诉
- 复杂问题转人工

### 1.3 技术指标

| 指标 | 目标值 |
|------|--------|
| 首次响应时间 | < 2 秒 |
| 问题解决率 | > 80% |
| 用户满意度 | > 85% |
| 转人工率 | < 20% |

---

## 二、需求分析

### 2.1 用户故事

```
作为一名用户，我希望：
1. 能够用自然语言提问，不需要学习特定指令
2. 快速获得准确答案
3. 查询我的订单状态
4. 在需要时能够转接人工客服
5. 获得一致的优质服务体验
```

### 2.2 功能需求

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **问答系统** | FAQ 自动问答 | P0 |
| | 多轮对话 | P0 |
| | 上下文理解 | P1 |
| **业务查询** | 订单查询 | P0 |
| | 物流跟踪 | P1 |
| | 产品咨询 | P1 |
| **工单系统** | 创建工单 | P2 |
| | 工单查询 | P2 |
| **人工转接** | 智能转接 | P1 |
| | 对话记录传递 | P2 |

### 2.3 非功能需求

| 需求 | 说明 |
|------|------|
| **性能** | 响应时间 < 2s，支持并发 |
| **可用性** | 99.9% 可用性 |
| **安全性** | 数据加密，权限控制 |
| **可扩展** | 支持快速添加新功能 |

---

## 三、架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面层                                │
│         Web Chat │ 微信小程序 │ APP │ API                       │
├─────────────────────────────────────────────────────────────────┤
│                        接入网关层                                │
│     认证鉴权 │ 限流熔断 │ 负载均衡 │ 日志                       │
├─────────────────────────────────────────────────────────────────┤
│                        Agent 服务层                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ 意图识别 │  │ 对话管理 │  │ 知识检索 │  │ 工具调用 │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                        工具服务层                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │订单查询  │  │物流跟踪  │  │工单系统  │  │人工转接  │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                        数据存储层                                │
│   知识库 │ 向量数据库 │ 业务数据库 │ 缓存 │ 日志存储            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Agent 架构

```
┌─────────────────────────────────────────────┐
│            CustomerServiceAgent              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │          意图识别器 (Intent)         │   │
│  │   分类：问答/查询/投诉/其他          │   │
│  └─────────────────────────────────────┘   │
│                    ↓                        │
│  ┌─────────────────────────────────────┐   │
│  │          路由分发器 (Router)         │   │
│  │   根据意图选择处理流程               │   │
│  └─────────────────────────────────────┘   │
│         ↓         ↓         ↓              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ QA Chain│ │ Query   │ │ Complaint│      │
│  │         │ │ Agent   │ │ Handler  │      │
│  └─────────┘ └─────────┘ └─────────┘      │
│                    ↓                        │
│  ┌─────────────────────────────────────┐   │
│  │          响应生成器 (Generator)      │   │
│  │   生成用户友好的回复                 │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 3.3 数据流

```
用户消息
    │
    ↓
[意图识别] → 判断用户意图类型
    │
    ↓
[路由分发] → 选择处理流程
    │
    ├─ 问答 → [知识库检索] → [答案生成]
    │
    ├─ 查询 → [工具调用] → [结果格式化]
    │
    └─ 投诉 → [情感分析] → [工单创建/人工转接]
    │
    ↓
[响应输出] → 返回给用户
```

---

## 四、技术选型

### 4.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| LLM | GPT-4 / Claude-3 | 复杂任务用大模型 |
| | GPT-3.5-Turbo | 简单问答用小模型 |
| 框架 | LangChain | Agent 开发框架 |
| 向量数据库 | Chroma / Milvus | 知识检索 |
| 业务数据库 | PostgreSQL | 业务数据存储 |
| 缓存 | Redis | 对话缓存 |
| 后端服务 | FastAPI | Python 异步框架 |
| 部署 | Docker + K8s | 容器化部署 |

### 4.2 核心组件

```python
# 项目结构
customer-service-agent/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置管理
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py          # Agent 基类
│   │   ├── intent.py        # 意图识别
│   │   ├── qa_chain.py      # 问答链
│   │   └── query_agent.py   # 查询 Agent
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── order.py         # 订单查询工具
│   │   ├── logistics.py     # 物流跟踪工具
│   │   └── ticket.py        # 工具工具
│   ├── memory/
│   │   └── conversation.py  # 对话记忆
│   ├── knowledge/
│   │   ├── loader.py        # 知识加载
│   │   └── retriever.py     # 知识检索
│   └── utils/
│       ├── logger.py        # 日志工具
│       └── monitor.py       # 监控工具
├── tests/
├── docs/
├── requirements.txt
└── Dockerfile
```

---

## 五、核心代码实现

### 5.1 Agent 基类

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory

class BaseCustomerServiceAgent(ABC):
    """客服 Agent 基类"""

    def __init__(
        self,
        llm: ChatOpenAI,
        memory: Optional[ConversationBufferMemory] = None
    ):
        self.llm = llm
        self.memory = memory or ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

    @abstractmethod
    def process(self, user_input: str, context: Dict[str, Any]) -> str:
        """处理用户输入"""
        pass

    def get_chat_history(self) -> str:
        """获取对话历史"""
        return self.memory.load_memory_variables({}).get("chat_history", "")

    def save_to_memory(self, user_input: str, response: str):
        """保存到记忆"""
        self.memory.save_context(
            {"input": user_input},
            {"output": response}
        )
```

### 5.2 意图识别器

```python
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import Literal

class IntentResult(BaseModel):
    """意图识别结果"""
    intent: Literal["qa", "query", "complaint", "chitchat", "other"] = Field(
        description="用户意图类型"
    )
    confidence: float = Field(description="置信度 0-1")
    entities: dict = Field(default_factory=dict, description="提取的实体")

class IntentClassifier:
    """意图识别器"""

    INTENT_PROMPT = """
    分析用户消息的意图，返回意图类型和相关实体。

    意图类型：
    - qa: 咨询问题（产品、政策、服务等）
    - query: 查询业务数据（订单、物流、账户等）
    - complaint: 投诉或不满
    - chitchat: 闲聊
    - other: 其他

    用户消息：{user_input}

    {format_instructions}
    """

    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.parser = PydanticOutputParser(pydantic_object=IntentResult)

    def classify(self, user_input: str) -> IntentResult:
        """识别意图"""
        prompt = ChatPromptTemplate.from_template(self.INTENT_PROMPT)

        chain = prompt | self.llm | self.parser

        result = chain.invoke({
            "user_input": user_input,
            "format_instructions": self.parser.get_format_instructions()
        })

        return result
```

### 5.3 主 Agent 实现

```python
from typing import Dict, Any
from langchain_openai import ChatOpenAI

class CustomerServiceAgent:
    """智能客服 Agent"""

    def __init__(self):
        # 初始化 LLM
        self.llm_smart = ChatOpenAI(model="gpt-4-turbo", temperature=0)
        self.llm_fast = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

        # 初始化组件
        self.intent_classifier = IntentClassifier(self.llm_fast)
        self.qa_chain = QAChain(self.llm_fast)
        self.query_agent = QueryAgent(self.llm_smart)
        self.complaint_handler = ComplaintHandler(self.llm_smart)

        # 路由映射
        self.handlers = {
            "qa": self.qa_chain,
            "query": self.query_agent,
            "complaint": self.complaint_handler,
            "chitchat": self.qa_chain,  # 闲聊也用问答链处理
        }

    def process(self, user_input: str, user_id: str = None) -> Dict[str, Any]:
        """处理用户消息"""
        # 1. 意图识别
        intent_result = self.intent_classifier.classify(user_input)

        # 2. 路由到对应处理器
        handler = self.handlers.get(intent_result.intent, self.qa_chain)

        # 3. 执行处理
        context = {
            "user_id": user_id,
            "intent": intent_result.intent,
            "entities": intent_result.entities
        }

        response = handler.process(user_input, context)

        return {
            "response": response,
            "intent": intent_result.intent,
            "confidence": intent_result.confidence
        }

    def chat(self, user_input: str, user_id: str = None) -> str:
        """对话接口"""
        result = self.process(user_input, user_id)
        return result["response"]
```

---

## 六、测试计划

### 6.1 测试场景

| 场景 | 输入示例 | 预期输出 |
|------|---------|---------|
| FAQ 问答 | "退货政策是什么？" | 返回退货政策说明 |
| 订单查询 | "我的订单 12345 到哪了？" | 返回订单状态 |
| 物流跟踪 | "包裹到哪了？" | 返回物流信息 |
| 投诉处理 | "服务太差了！" | 安抚并创建工单 |
| 闲聊 | "你好" | 友好回应 |

### 6.2 评估指标

```python
def evaluate_agent(agent, test_cases):
    """评估 Agent 表现"""
    results = []

    for case in test_cases:
        response = agent.chat(case["input"])

        results.append({
            "input": case["input"],
            "expected": case["expected"],
            "actual": response,
            "correct": evaluate_response(response, case["expected"])
        })

    accuracy = sum(r["correct"] for r in results) / len(results)
    return {"accuracy": accuracy, "details": results}
```

---

## 七、本课小结

### 7.1 关键要点

1. **需求分析**：明确功能需求和性能指标
2. **架构设计**：分层架构，职责清晰
3. **技术选型**：根据场景选择合适技术
4. **意图识别**：Agent 路由的基础

### 7.2 下一课

下一课将实现知识库对接与问答功能。

---

**下一课**：智能客服 Agent - 知识库对接与问答实现