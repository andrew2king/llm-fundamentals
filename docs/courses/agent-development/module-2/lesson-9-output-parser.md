# 课时 9：OutputParser 结构化输出

> Agent 开发实战 - 模块二：LangChain 核心组件

## 一、本课目标

- 理解 OutputParser 的作用
- 掌握常用 Parser 类型
- 学会处理结构化输出和错误处理

---

## 二、为什么需要 OutputParser？

### 2.1 问题场景

LLM 输出的是自由文本，但程序需要结构化数据：

```python
# LLM 输出（文本）
"北京，晴，25度，空气质量良好"

# 程序需要（结构化）
{
    "city": "北京",
    "weather": "晴",
    "temperature": 25,
    "air_quality": "良好"
}
```

### 2.2 OutputParser 的作用

```
LLM 文本输出 → [OutputParser] → 结构化数据
```

---

## 三、常用 Parser 类型

### 3.1 PydanticOutputParser

**将 LLM 输出解析为 Pydantic 模型。**

```python
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing import List

# 定义数据模型
class WeatherInfo(BaseModel):
    """天气信息"""
    city: str = Field(description="城市名称")
    weather: str = Field(description="天气状况")
    temperature: int = Field(description="温度（摄氏度）")
    air_quality: str = Field(description="空气质量")

# 创建 Parser
parser = PydanticOutputParser(pydantic_object=WeatherInfo)

# 创建提示（包含格式说明）
prompt = PromptTemplate(
    template="提取以下文本中的天气信息。\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

# LLM 调用
llm = ChatOpenAI(model="gpt-4")
_input = prompt.format(query="北京今天晴天，气温25度，空气质量良好")
output = llm.invoke(_input)

# 解析
result = parser.parse(output.content)
print(result)
# WeatherInfo(city='北京', weather='晴', temperature=25, air_quality='良好')

print(result.city)  # 北京
print(result.temperature)  # 25
```

**Parser 生成的格式说明**：

```json
{
    "properties": {
        "city": {"description": "城市名称", "type": "string"},
        "weather": {"description": "天气状况", "type": "string"},
        "temperature": {"description": "温度（摄氏度）", "type": "integer"},
        "air_quality": {"description": "空气质量", "type": "string"}
    },
    "required": ["city", "weather", "temperature", "air_quality"]
}
```

### 3.2 ListParser

**解析列表输出。**

```python
from langchain.output_parsers import CommaSeparatedListOutputParser

# 创建 Parser
parser = CommaSeparatedListOutputParser()

# 格式说明
format_instructions = parser.get_format_instructions()
print(format_instructions)
# Your response should be a list of comma separated values, eg: `foo, bar, baz`

# 提示
prompt = PromptTemplate(
    template="列出5种常见的编程语言。\n{format_instructions}",
    partial_variables={"format_instructions": format_instructions}
)

# 调用
output = llm.invoke(prompt.format())
result = parser.parse(output.content)
print(result)
# ['Python', 'Java', 'JavaScript', 'C++', 'Go']
```

### 3.3 DatetimeParser

**解析日期时间。**

```python
from langchain.output_parsers import DatetimeOutputParser

parser = DatetimeOutputParser()

prompt = PromptTemplate(
    template="以下事件是什么时候发生的？\n{query}\n{format_instructions}",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

output = llm.invoke(prompt.format(query="Python语言首次发布"))
result = parser.parse(output.content)
print(result)
# 1991-02-20 00:00:00
```

### 3.4 EnumParser

**解析枚举值。**

```python
from langchain.output_parsers import EnumOutputParser
from enum import Enum

class Sentiment(str, Enum):
    POSITIVE = "正面"
    NEGATIVE = "负面"
    NEUTRAL = "中性"

parser = EnumOutputParser(enum=Sentiment)

prompt = PromptTemplate(
    template="分析以下评论的情感倾向（正面/负面/中性）：\n{query}\n{format_instructions}",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

output = llm.invoke(prompt.format(query="这个产品太棒了，非常好用！"))
result = parser.parse(output.content)
print(result)
# Sentiment.POSITIVE
```

---

## 四、组合 Parser

### 4.1 嵌套结构

```python
from typing import List, Optional

class Author(BaseModel):
    name: str = Field(description="作者姓名")
    email: Optional[str] = Field(description="邮箱")

class Article(BaseModel):
    """文章信息"""
    title: str = Field(description="标题")
    authors: List[Author] = Field(description="作者列表")
    keywords: List[str] = Field(description="关键词")
    summary: str = Field(description="摘要")

parser = PydanticOutputParser(pydantic_object=Article)

# 自动生成嵌套结构的格式说明
print(parser.get_format_instructions())
```

### 4.2 OutputFixingParser

**自动修复解析错误。**

```python
from langchain.output_parsers import OutputFixingParser

# 基础 Parser
base_parser = PydanticOutputParser(pydantic_object=WeatherInfo)

# 带自动修复的 Parser
fixing_parser = OutputFixingParser.from_llm(
    parser=base_parser,
    llm=ChatOpenAI(model="gpt-4")
)

# 假设 LLM 输出格式有问题
bad_output = '{"city": "北京", "weather": "晴", "temperature": "二十五度"}'  # temperature 类型错误

# 自动修复并解析
try:
    result = fixing_parser.parse(bad_output)
    print(result)
    # 会自动调用 LLM 修复格式问题
except Exception as e:
    print(f"解析失败: {e}")
```

### 4.3 RetryWithErrorParser

**重试并给出错误提示。**

```python
from langchain.output_parsers import RetryWithErrorOutputParser

retry_parser = RetryWithErrorOutputParser.from_llm(
    parser=base_parser,
    llm=ChatOpenAI(model="gpt-4"),
    max_retries=3
)

# 解析失败时会重新生成
result = retry_parser.parse_with_prompt(bad_output, original_prompt)
```

---

## 五、自定义 Parser

### 5.1 实现 BaseOutputParser

```python
from langchain.schema import BaseOutputParser
from typing import Any

class CustomJSONParser(BaseOutputParser):
    """自定义 JSON 解析器"""

    def parse(self, output: str) -> dict:
        """解析输出"""
        import json
        import re

        # 提取 JSON 块
        json_match = re.search(r'```json\s*(.*?)\s*```', output, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = output

        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # 尝试修复常见问题
            json_str = json_str.replace("'", '"')
            return json.loads(json_str)

    @property
    def _type(self) -> str:
        return "custom_json_parser"

# 使用
parser = CustomJSONParser()
result = parser.parse('```json\n{"name": "test"}\n```')
```

### 5.2 带验证的 Parser

```python
from pydantic import validator

class ValidatedWeatherInfo(BaseModel):
    """带验证的天气信息"""
    city: str
    temperature: int

    @validator('temperature')
    def validate_temperature(cls, v):
        if v < -50 or v > 60:
            raise ValueError(f'温度 {v} 超出合理范围')
        return v

# 使用验证过的模型创建 Parser
parser = PydanticOutputParser(pydantic_object=ValidatedWeatherInfo)
```

---

## 六、错误处理最佳实践

### 6.1 完整的错误处理流程

```python
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from pydantic import ValidationError
import json

def safe_parse(llm_output: str, parser: PydanticOutputParser, llm) -> dict:
    """安全的解析流程"""

    # 1. 直接解析
    try:
        return parser.parse(llm_output)
    except (json.JSONDecodeError, ValidationError) as e:
        print(f"直接解析失败: {e}")

    # 2. 使用 OutputFixingParser
    try:
        fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=llm)
        return fixing_parser.parse(llm_output)
    except Exception as e:
        print(f"自动修复失败: {e}")

    # 3. 返回默认值或抛出异常
    raise ValueError("无法解析 LLM 输出")

# 使用
try:
    result = safe_parse(output.content, parser, llm)
except ValueError as e:
    print(f"处理失败: {e}")
    result = None  # 使用默认值
```

### 6.2 重试机制

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def parse_with_retry(llm, prompt, parser):
    """带重试的解析"""
    output = llm.invoke(prompt)
    return parser.parse(output.content)
```

---

## 七、实战：构建结构化数据提取系统

### 7.1 需求

从非结构化文本中提取产品信息：
- 产品名称
- 价格
- 特性列表
- 用户评价（正面/负面）

### 7.2 实现

```python
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from langchain.prompts import PromptTemplate
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum

# 定义枚举
class Sentiment(str, Enum):
    POSITIVE = "正面"
    NEGATIVE = "负面"
    NEUTRAL = "中性"

# 定义模型
class ProductReview(BaseModel):
    """产品评价"""
    content: str = Field(description="评价内容")
    sentiment: Sentiment = Field(description="情感倾向")

class ProductInfo(BaseModel):
    """产品信息"""
    name: str = Field(description="产品名称")
    price: float = Field(description="价格（元）")
    features: List[str] = Field(description="产品特性列表")
    reviews: List[ProductReview] = Field(description="用户评价列表")

    @validator('price')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('价格不能为负')
        return v

class ProductExtractor:
    """产品信息提取器"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=ProductInfo)
        self.fixing_parser = OutputFixingParser.from_llm(
            parser=self.parser,
            llm=self.llm
        )

        self.prompt = PromptTemplate(
            template="""从以下文本中提取产品信息。

{format_instructions}

文本：
{text}

请严格按照 JSON 格式输出。""",
            input_variables=["text"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )

    def extract(self, text: str) -> ProductInfo:
        """提取产品信息"""
        # 生成提示
        _input = self.prompt.format(text=text)

        # LLM 调用
        output = self.llm.invoke(_input)

        # 解析（带自动修复）
        try:
            result = self.fixing_parser.parse(output.content)
            return result
        except Exception as e:
            print(f"解析失败: {e}")
            print(f"原始输出: {output.content}")
            raise

# 使用
extractor = ProductExtractor()

text = """
新品上市！智能手表Pro，售价1299元。
主要特性：
- 心率监测
- 睡眠追踪
- 运动模式
- 7天续航

用户评价：
- "非常好用，功能齐全" - 张三
- "续航有点短" - 李四
- "性价比高，推荐购买" - 王五
"""

result = extractor.extract(text)
print(f"产品名称: {result.name}")
print(f"价格: {result.price} 元")
print(f"特性: {result.features}")
print(f"评价数量: {len(result.reviews)}")
for review in result.reviews:
    print(f"  - [{review.sentiment.value}] {review.content}")
```

---

## 八、本课小结

### 8.1 关键要点

1. **PydanticOutputParser**：解析为 Pydantic 模型
2. **ListParser**：解析列表输出
3. **OutputFixingParser**：自动修复解析错误
4. **自定义 Parser**：处理特殊格式

### 8.2 最佳实践

| 实践 | 说明 |
|------|------|
| 使用 Pydantic 验证 | 确保数据格式正确 |
| 提供格式说明 | 让 LLM 知道输出格式 |
| 使用自动修复 | 处理格式问题 |
| 实现重试机制 | 提高成功率 |

### 8.3 思考题

1. 如何处理 LLM 输出格式不稳定的问题？
2. 复杂嵌套结构如何设计 Parser？
3. Parser 和 Agent 如何配合使用？

---

**下一课**：回调与调试 - 监控 Agent 执行过程