# 课时 8：Chain 链式调用

> Agent 开发实战 - 模块二：LangChain 核心组件

## 一、本课目标

- 理解 Chain 的概念与作用
- 掌握常用 Chain 类型
- 学会组合多个 Chain 构建复杂流程

---

## 二、Chain 概述

### 2.1 什么是 Chain？

**Chain（链）** 是将多个组件按顺序连接，形成确定的处理流程。

```
输入 → [组件1] → [组件2] → [组件3] → 输出
```

### 2.2 Chain vs Agent

| 特性 | Chain | Agent |
|------|-------|-------|
| 执行方式 | 固定流程 | 自主决策 |
| 灵活性 | 低 | 高 |
| 可预测性 | 高 | 低 |
| 调试难度 | 低 | 高 |
| 适用场景 | 标准化流程 | 开放式任务 |

**选择原则**：能用 Chain 就不用 Agent

---

## 三、基础 Chain 类型

### 3.1 LLMChain：最基础的链

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# 创建 LLM
llm = ChatOpenAI(model="gpt-4")

# 创建提示模板
template = PromptTemplate.from_template("为{product}写一句广告语")

# 创建 LLMChain
chain = LLMChain(llm=llm, prompt=template)

# 执行
result = chain.run(product="智能手表")
print(result)
# 输出：智能手表，掌握时间，更掌控生活。
```

### 3.2 SequentialChain：顺序链

**将多个 Chain 按顺序执行，前一个的输出作为后一个的输入。**

```python
from langchain.chains import SequentialChain

# Chain 1：生成产品描述
description_template = PromptTemplate.from_template("为{product}写一段产品描述")
description_chain = LLMChain(
    llm=llm,
    prompt=description_template,
    output_key="description"
)

# Chain 2：翻译成英文
translate_template = PromptTemplate.from_template("将以下中文翻译成英文：\n{description}")
translate_chain = LLMChain(
    llm=llm,
    prompt=translate_template,
    output_key="english_description"
)

# Chain 3：生成广告语
slogan_template = PromptTemplate.from_template("基于以下产品描述，写一句简短的广告语：\n{english_description}")
slogan_chain = LLMChain(
    llm=llm,
    prompt=slogan_template,
    output_key="slogan"
)

# 组合成顺序链
overall_chain = SequentialChain(
    chains=[description_chain, translate_chain, slogan_chain],
    input_variables=["product"],
    output_variables=["description", "english_description", "slogan"],
    verbose=True
)

# 执行
result = overall_chain({"product": "智能手表"})
print(result["slogan"])
```

### 3.3 SimpleSequentialChain：简单顺序链

**只有一个输入和一个输出的简化版本。**

```python
from langchain.chains import SimpleSequentialChain

# Chain 1：生成故事大纲
outline_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate.from_template("为主题'{topic}'生成一个故事大纲")
)

# Chain 2：根据大纲写故事
story_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate.from_template("根据以下大纲写一个完整故事：\n{outline}")
)

# 组合
chain = SimpleSequentialChain(chains=[outline_chain, story_chain], verbose=True)

# 执行
result = chain.run("时间旅行")
```

---

## 四、高级 Chain 类型

### 4.1 RouterChain：路由链

**根据输入动态选择执行哪个 Chain。**

```python
from langchain.chains.router import MultiPromptChain
from langchain.chains.router.llm_router import LLMRouterChain, RouterOutputParser
from langchain.chains import ConversationChain

# 定义不同领域的 Chain
physics_template = """你是一个物理学家，回答物理相关问题。
问题：{input}"""

math_template = """你是一个数学家，回答数学相关问题。
问题：{input}"""

history_template = """你是一个历史学家，回答历史相关问题。
问题：{input}"""

prompt_infos = [
    {
        "name": "physics",
        "description": "适合回答物理相关问题",
        "prompt_template": physics_template
    },
    {
        "name": "math",
        "description": "适合回答数学相关问题",
        "prompt_template": math_template
    },
    {
        "name": "history",
        "description": "适合回答历史相关问题",
        "prompt_template": history_template
    }
]

# 创建路由链
dest_chains = {}
for info in prompt_infos:
    prompt = PromptTemplate(template=info["prompt_template"], input_variables=["input"])
    chain = LLMChain(llm=llm, prompt=prompt)
    dest_chains[info["name"]] = chain

# 创建默认 Chain
default_chain = ConversationChain(llm=llm, output_key="text")

# 创建路由 Chain
router_chain = LLMRouterChain.from_llm(llm)

# 组合
chain = MultiPromptChain(
    router_chain=router_chain,
    destination_chains=dest_chains,
    default_chain=default_chain,
    verbose=True
)

# 执行
result = chain.run("什么是相对论？")  # 会路由到 physics chain
result = chain.run("1+1等于几？")      # 会路由到 math chain
```

### 4.2 TransformChain：转换链

**对输入数据进行预处理转换。**

```python
from langchain.chains import TransformChain

def transform_func(inputs: dict) -> dict:
    """转换函数：提取文本中的关键信息"""
    text = inputs["text"]

    # 简单的关键词提取
    keywords = []
    words = text.split()
    for word in words:
        if len(word) > 3:  # 长词作为关键词
            keywords.append(word)

    return {"keywords": keywords}

# 创建转换链
transform_chain = TransformChain(
    input_variables=["text"],
    output_variables=["keywords"],
    transform=transform_func
)

# 与其他链组合
analysis_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate.from_template("分析以下关键词的含义：{keywords}")
)

# 组合
from langchain.chains import SequentialChain
overall_chain = SequentialChain(
    chains=[transform_chain, analysis_chain],
    input_variables=["text"],
    output_variables=["keywords", "text"]
)

result = overall_chain({"text": "人工智能正在改变我们的生活方式"})
```

### 4.3 BranchingChain：分支链

**根据条件执行不同的分支。**

```python
from langchain.chains import LLMChain

class ConditionalChain:
    """条件分支链"""

    def __init__(self, condition_func, true_chain, false_chain):
        self.condition_func = condition_func
        self.true_chain = true_chain
        self.false_chain = false_chain

    def run(self, input_text: str) -> str:
        if self.condition_func(input_text):
            return self.true_chain.run(input_text)
        else:
            return self.false_chain.run(input_text)

# 使用
short_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate.from_template("简要回答：{input}")
)

long_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate.from_template("详细回答：{input}")
)

def is_simple_question(text: str) -> bool:
    """判断是否是简单问题"""
    simple_keywords = ["什么", "是谁", "在哪"]
    return any(kw in text for kw in simple_keywords)

conditional = ConditionalChain(is_simple_question, short_chain, long_chain)

result = conditional.run("Python是什么？")      # 简短回答
result = conditional.run("解释一下机器学习的原理")  # 详细回答
```

---

## 五、Chain 组合模式

### 5.1 管道模式

```python
from langchain.chains import SequentialChain

# 输入 → 处理1 → 处理2 → 处理3 → 输出
pipeline = SequentialChain(
    chains=[extract_chain, analyze_chain, summarize_chain, format_chain],
    input_variables=["raw_input"],
    output_variables=["final_output"]
)
```

### 5.2 并行模式

```python
from concurrent.futures import ThreadPoolExecutor

def parallel_chains(chains: list, input_data: dict) -> list:
    """并行执行多个 Chain"""
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(chain.run, input_data) for chain in chains]
        results = [f.result() for f in futures]
    return results

# 使用
results = parallel_chains(
    [sentiment_chain, topic_chain, entity_chain],
    "这是一段文本..."
)
```

### 5.3 循环模式

```python
def iterative_chain(chain, input_data: dict, max_iterations: int = 5):
    """迭代执行 Chain 直到满足条件"""
    result = input_data

    for i in range(max_iterations):
        result = chain.run(result)

        # 检查终止条件
        if is_good_enough(result):
            break

    return result
```

---

## 六、实战：构建文档处理流水线

### 6.1 需求

构建一个文档处理流程：
1. 提取文档关键信息
2. 分类文档类型
3. 生成摘要
4. 提取关键实体
5. 生成最终报告

### 6.2 实现

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, SequentialChain

class DocumentPipeline:
    """文档处理流水线"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)
        self._build_pipeline()

    def _build_pipeline(self):
        """构建处理流水线"""

        # Step 1: 提取关键信息
        extract_prompt = PromptTemplate.from_template("""
从以下文档中提取关键信息：

{document}

请提取：
1. 主题
2. 核心观点
3. 重要数据

以JSON格式输出。
""")
        self.extract_chain = LLMChain(
            llm=self.llm,
            prompt=extract_prompt,
            output_key="key_info"
        )

        # Step 2: 分类文档
        classify_prompt = PromptTemplate.from_template("""
根据以下关键信息，判断文档类型：

{key_info}

文档类型选项：
- 技术文档
- 商业报告
- 新闻资讯
- 学术论文

只输出类型名称。
""")
        self.classify_chain = LLMChain(
            llm=self.llm,
            prompt=classify_prompt,
            output_key="doc_type"
        )

        # Step 3: 生成摘要
        summary_prompt = PromptTemplate.from_template("""
请为以下{doc_type}生成一段200字以内的摘要：

{document}
""")
        self.summary_chain = LLMChain(
            llm=self.llm,
            prompt=summary_prompt,
            output_key="summary"
        )

        # Step 4: 提取实体
        entity_prompt = PromptTemplate.from_template("""
从以下文档中提取所有实体（人名、地名、机构名、日期）：

{document}

以列表形式输出。
""")
        self.entity_chain = LLMChain(
            llm=self.llm,
            prompt=entity_prompt,
            output_key="entities"
        )

        # 组合流水线
        self.pipeline = SequentialChain(
            chains=[
                self.extract_chain,
                self.classify_chain,
                self.summary_chain,
                self.entity_chain
            ],
            input_variables=["document"],
            output_variables=["key_info", "doc_type", "summary", "entities"],
            verbose=True
        )

    def process(self, document: str) -> dict:
        """处理文档"""
        result = self.pipeline({"document": document})

        # 格式化报告
        report = f"""
# 文档分析报告

## 文档类型
{result['doc_type']}

## 关键信息
{result['key_info']}

## 摘要
{result['summary']}

## 实体
{result['entities']}
"""
        return {
            "report": report,
            "details": result
        }


# 使用
pipeline = DocumentPipeline()

document = """
人工智能技术的快速发展正在深刻改变各个行业。
根据最新报告，2024年全球AI市场规模预计达到5000亿美元。
主要参与者包括OpenAI、Google、百度等科技巨头。
专家预测，到2030年，AI将为全球经济贡献15万亿美元。
"""

result = pipeline.process(document)
print(result["report"])
```

---

## 七、本课小结

### 7.1 关键要点

1. **LLMChain**：最基础的链，LLM + Prompt
2. **SequentialChain**：顺序执行多个链
3. **RouterChain**：根据输入动态路由
4. **TransformChain**：数据预处理转换

### 7.2 Chain 选择指南

| 需求 | 推荐的 Chain |
|------|-------------|
| 简单的单步处理 | LLMChain |
| 多步骤顺序处理 | SequentialChain |
| 不同类型输入不同处理 | RouterChain |
| 需要数据预处理 | TransformChain |

### 7.3 思考题

1. Chain 和 Agent 如何选择？
2. 如何处理 Chain 中某个步骤失败的情况？
3. 如何优化 Chain 的执行效率？

---

**下一课**：OutputParser 结构化输出 - 让 Agent 输出更规范