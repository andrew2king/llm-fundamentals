# 课时 5：LLM 与 Prompt 模板

> Agent 开发实战 - 模块二：LangChain 核心组件

## 一、本课目标

- 掌握 LangChain 的 LLM 抽象层设计
- 学会使用 PromptTemplate 进行动态提示
- 理解 Few-shot 提示技巧
- 实现多模型切换策略

---

## 二、LangChain LLM 抽象层

### 2.1 为什么需要抽象层？

**问题**：不同模型 API 差异大

```python
# OpenAI
import openai
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "你好"}]
)

# Claude
import anthropic
client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-3-opus",
    max_tokens=1024,
    messages=[{"role": "user", "content": "你好"}]
)
```

**解决方案**：LangChain 统一接口

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# 统一调用方式
openai_llm = ChatOpenAI(model="gpt-4")
claude_llm = ChatAnthropic(model="claude-3-opus")

# 相同的调用接口
response = openai_llm.invoke("你好")
response = claude_llm.invoke("你好")
```

### 2.2 LLM 类型层级

```
BaseLanguageModel
       │
       ├── BaseLLM (完成模型)
       │      ├── OpenAI
       │      ├── HuggingFaceHub
       │      └── ...
       │
       └── BaseChatModel (对话模型) ⭐ 推荐
              ├── ChatOpenAI
              ├── ChatAnthropic
              ├── ChatGoogleGenerativeAI
              └── ...
```

### 2.3 核心方法

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0)

# 1. 同步调用
response = llm.invoke("你好")

# 2. 批量调用
responses = llm.batch(["你好", "再见"])

# 3. 流式调用
for chunk in llm.stream("讲一个故事"):
    print(chunk.content, end="", flush=True)

# 4. 异步调用
response = await llm.ainvoke("你好")
```

### 2.4 模型配置参数

```python
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,          # 随机性 (0-2)
    max_tokens=1024,          # 最大输出长度
    top_p=0.9,                # 核采样
    frequency_penalty=0.5,    # 频率惩罚
    presence_penalty=0.5,     # 存在惩罚
    timeout=30,               # 超时时间
    max_retries=2,            # 重试次数
    request_timeout=60,       # 请求超时
)
```

---

## 三、PromptTemplate 动态提示

### 3.1 什么是 PromptTemplate？

**PromptTemplate** 是 LangChain 的提示模板系统，支持动态变量注入。

```python
from langchain.prompts import PromptTemplate

# 创建模板
template = PromptTemplate.from_template("请用{style}风格重写以下文字：{text}")

# 填充变量
prompt = template.format(style="幽默", text="今天天气真好")
print(prompt)
# 输出：请用幽默风格重写以下文字：今天天气真好
```

### 3.2 模板类型

**1. PromptTemplate（单轮提示）**

```python
from langchain.prompts import PromptTemplate

template = PromptTemplate(
    input_variables=["product", "feature"],
    template="为{product}写一句广告语，突出{feature}特点"
)

prompt = template.format(product="智能手表", feature="健康监测")
```

**2. ChatPromptTemplate（对话提示）**

```python
from langchain.prompts import ChatPromptTemplate

template = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}，擅长{skill}"),
    ("human", "{question}")
])

prompt = template.format(
    role="编程专家",
    skill="Python开发",
    question="如何优化代码性能？"
)
```

**3. FewShotPromptTemplate（少样本提示）**

```python
from langchain.prompts import FewShotPromptTemplate

# 示例
examples = [
    {"input": "开心", "output": "😊 开心是一种积极的情绪"},
    {"input": "难过", "output": "😢 难过是一种消极的情绪"}
]

# 示例模板
example_template = PromptTemplate(
    input_variables=["input", "output"],
    template="输入: {input}\n输出: {output}"
)

# 少样本模板
few_shot_template = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_template,
    prefix="分析以下情绪：",
    suffix="输入: {input}\n输出:",
    input_variables=["input"]
)

prompt = few_shot_template.format(input="愤怒")
```

### 3.3 模板组合

```python
from langchain.prompts import PipelinePromptTemplate

# 基础模板
full_template = PromptTemplate.from_template("""
{introduction}

{examples}

{question}
""")

# 子模板
introduction = PromptTemplate.from_template("你是一个{role}")
examples = PromptTemplate.from_template("示例：\n{example_list}")
question = PromptTemplate.from_template("问题：{query}")

# 组合
pipeline = PipelinePromptTemplate(
    final_prompt=full_template,
    pipeline_prompts=[
        ("introduction", introduction),
        ("examples", examples),
        ("question", question)
    ]
)

prompt = pipeline.format(
    role="翻译专家",
    example_list="苹果 -> Apple",
    query="香蕉怎么翻译？"
)
```

---

## 四、Few-shot 提示技巧

### 4.1 什么是 Few-shot？

**Few-shot Learning** = 通过少量示例教会模型新任务

```
零样本 (Zero-shot):  直接问模型
单样本 (One-shot):   给一个示例
少样本 (Few-shot):   给多个示例
```

### 4.2 Few-shot 最佳实践

**示例选择原则**：

1. **代表性**：示例覆盖典型场景
2. **多样性**：不同类型的示例
3. **简洁性**：示例简短明了
4. **一致性**：格式统一

```python
from langchain.prompts import FewShotChatMessagePromptTemplate, ChatPromptTemplate

# 优秀示例
examples = [
    {
        "input": "这个产品太差了！",
        "output": "负面 | 表达对产品的不满"
    },
    {
        "input": "虽然价格贵，但质量很好",
        "output": "正面 | 肯定产品质量，提及价格因素"
    },
    {
        "input": "还行吧，没什么特别的",
        "output": "中性 | 表达中立态度"
    }
]

# 创建 Few-shot 模板
example_prompt = ChatPromptTemplate.from_messages([
    ("human", "{input}"),
    ("ai", "{output}")
])

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples
)

# 最终提示
final_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个情感分析专家，分析用户评论的情感倾向。"),
    few_shot_prompt,
    ("human", "{input}")
])
```

### 4.3 动态示例选择

```python
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector
from langchain.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# 示例库
examples = [
    {"input": "服务态度很好", "output": "正面"},
    {"input": "物流太慢了", "output": "负面"},
    {"input": "性价比不错", "output": "正面"},
    # ... 更多示例
]

# 语义相似度选择器
example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    Chroma,
    k=2  # 选择最相似的2个示例
)

# 动态选择示例
selected = example_selector.select_examples({"input": "配送速度很慢"})
# 会选择 "物流太慢了" 等相似示例
```

---

## 五、多模型切换策略

### 5.1 为什么需要多模型？

- **成本优化**：简单任务用小模型，复杂任务用大模型
- **容灾备份**：一个模型不可用时切换到另一个
- **能力互补**：不同模型擅长不同任务

### 5.2 模型路由实现

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from typing import Literal

class ModelRouter:
    """智能模型路由器"""

    def __init__(self):
        self.models = {
            "fast": ChatOpenAI(model="gpt-3.5-turbo"),    # 快速模型
            "smart": ChatOpenAI(model="gpt-4"),           # 智能模型
            "creative": ChatAnthropic(model="claude-3-opus")  # 创意模型
        }

    def route(self, task_type: Literal["simple", "complex", "creative"]) -> str:
        """根据任务类型选择模型"""
        routing = {
            "simple": "fast",
            "complex": "smart",
            "creative": "creative"
        }
        return routing[task_type]

    def invoke(self, prompt: str, task_type: str = "simple"):
        model_name = self.route(task_type)
        model = self.models[model_name]
        return model.invoke(prompt)

# 使用
router = ModelRouter()
response = router.invoke("翻译这句话", task_type="simple")  # 用 gpt-3.5
response = router.invoke("分析市场趋势", task_type="complex")  # 用 gpt-4
```

### 5.3 自动降级策略

```python
import time
from langchain.schema import HumanMessage

class FallbackLLM:
    """带降级策略的 LLM"""

    def __init__(self, models: list):
        self.models = models  # 按优先级排列
        self.current_index = 0

    def invoke(self, prompt: str, max_retries: int = 3):
        for attempt in range(max_retries):
            for i, model in enumerate(self.models):
                try:
                    return model.invoke(prompt)
                except Exception as e:
                    print(f"模型 {i} 调用失败: {e}")
                    if i < len(self.models) - 1:
                        print(f"切换到备用模型...")
                    time.sleep(1)

        raise Exception("所有模型都不可用")

# 使用
fallback_llm = FallbackLLM([
    ChatOpenAI(model="gpt-4"),
    ChatAnthropic(model="claude-3-sonnet"),
    ChatOpenAI(model="gpt-3.5-turbo")
])

response = fallback_llm.invoke("你好")
```

---

## 六、实战：构建智能客服提示系统

### 6.1 需求分析

- 根据用户问题类型选择不同提示模板
- 支持多轮对话上下文
- 可动态注入业务知识

### 6.2 完整实现

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from typing import List, Dict

class CustomerServicePromptSystem:
    """智能客服提示系统"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.7)
        self._setup_templates()

    def _setup_templates(self):
        """设置不同场景的模板"""

        # 产品咨询模板
        self.product_template = ChatPromptTemplate.from_messages([
            ("system", """你是一个专业的产品顾问。
            产品信息：
            {product_info}

            回答要求：
            1. 准确介绍产品特点
            2. 对比不同型号
            3. 给出购买建议"""),
            ("human", "{question}")
        ])

        # 售后服务模板
        self.service_template = ChatPromptTemplate.from_messages([
            ("system", """你是一个耐心的售后客服。
            处理原则：
            1. 先安抚用户情绪
            2. 了解具体问题
            3. 提供解决方案

            常见问题FAQ：
            {faq}"""),
            ("human", "{question}")
        ])

        # 投诉处理模板（Few-shot）
        complaint_examples = [
            {
                "input": "你们的产品质量太差了！",
                "output": "非常抱歉给您带来了不好的体验，请问具体是什么问题呢？我们会尽快为您处理。"
            },
            {
                "input": "等了这么久还没发货，什么破服务！",
                "output": "非常抱歉让您久等了，我马上帮您查询订单状态，并为您加急处理。"
            }
        ]

        example_prompt = ChatPromptTemplate.from_messages([
            ("human", "{input}"),
            ("ai", "{output}")
        ])

        self.complaint_template = ChatPromptTemplate.from_messages([
            ("system", "你是一个专业的投诉处理专员，要妥善处理用户投诉。"),
            FewShotChatMessagePromptTemplate(
                example_prompt=example_prompt,
                examples=complaint_examples
            ),
            ("human", "{question}")
        ])

    def get_response(self, question: str, context: Dict) -> str:
        """根据问题类型选择模板并生成回答"""

        # 分类问题
        question_type = self._classify_question(question)

        # 选择模板
        if question_type == "product":
            template = self.product_template
            prompt = template.format(
                product_info=context.get("product_info", ""),
                question=question
            )
        elif question_type == "service":
            template = self.service_template
            prompt = template.format(
                faq=context.get("faq", ""),
                question=question
            )
        else:  # complaint
            template = self.complaint_template
            prompt = template.format(question=question)

        return self.llm.invoke(prompt)

    def _classify_question(self, question: str) -> str:
        """简单的问题分类"""
        product_keywords = ["产品", "价格", "功能", "型号", "对比"]
        service_keywords = ["退货", "换货", "物流", "订单"]
        complaint_keywords = ["差", "投诉", "不满", "垃圾", "骗"]

        for kw in complaint_keywords:
            if kw in question:
                return "complaint"

        for kw in service_keywords:
            if kw in question:
                return "service"

        return "product"


# 使用示例
service = CustomerServicePromptSystem()

context = {
    "product_info": "智能手表 Pro 版：支持心率监测、睡眠追踪、运动记录，售价 1999 元",
    "faq": "退货政策：7天无理由退货，30天质量问题包换"
}

response = service.get_response("这个手表有什么功能？", context)
print(response.content)
```

---

## 七、本课小结

### 7.1 关键要点

1. **LLM 抽象层**：统一不同模型的调用接口
2. **PromptTemplate**：动态生成提示，支持变量注入
3. **Few-shot**：通过示例教会模型新任务
4. **多模型策略**：路由、降级、容灾

### 7.2 最佳实践

| 场景 | 推荐做法 |
|------|---------|
| 简单任务 | 用小模型 + 简单模板 |
| 复杂任务 | 用大模型 + Few-shot |
| 生产环境 | 实现自动降级 |
| 多场景 | 模板路由系统 |

### 7.3 思考题

1. 如何评估一个任务需要 Few-shot 还是 Zero-shot？
2. 多模型切换时，如何保证输出格式一致？
3. 提示模板如何版本管理？

---

## 八、代码资源

完整代码示例：`examples/lesson-05-llm-prompt.ipynb`

---

**下一课**：Memory 记忆系统 - 对话记忆与上下文管理