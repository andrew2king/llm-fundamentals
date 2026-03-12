# 课时 7：Tool 工具定义与调用

> Agent 开发实战 - 模块二：LangChain 核心组件

## 一、本课目标

- 理解 Tool 在 Agent 中的作用
- 掌握 Tool 定义与注册方式
- 学会开发自定义工具
- 理解工具调用流程

---

## 二、Tool 概述

### 2.1 什么是 Tool？

**Tool（工具）** 是 Agent 与外部世界交互的桥梁，让 Agent 能够：
- 查询数据（数据库、API）
- 执行操作（发送邮件、创建文件）
- 获取信息（搜索、计算）

```
┌─────────────────────────────────────────────┐
│                   Agent                      │
│                                             │
│   决策 → [Tool 1] → 结果                     │
│        → [Tool 2] → 结果                     │
│        → [Tool 3] → 结果                     │
│                                             │
│   综合结果 → 输出                            │
└─────────────────────────────────────────────┘
```

### 2.2 Tool 的核心属性

```python
from langchain.tools import Tool

tool = Tool(
    name="search",           # 工具名称（唯一标识）
    description="搜索网页内容", # 工具描述（帮助 Agent 理解何时使用）
    func=search_function,     # 执行函数
    return_direct=False       # 是否直接返回结果
)
```

---

## 三、内置工具使用

### 3.1 常用内置工具

```python
from langchain.tools import (
    DuckDuckGoSearchRun,    # 搜索
    PythonREPLTool,          # Python 执行
    ShellTool,               # Shell 命令
    WikipediaQueryRun        # 维基百科
)
from langchain_community.utilities import GoogleSerperAPIWrapper

# 搜索工具
search = DuckDuckGoSearchRun()
result = search.run("LangChain 是什么")

# Python 执行工具
python_repl = PythonREPLTool()
result = python_repl.run("print(1 + 1)")

# 维基百科
wikipedia = WikipediaQueryRun()
result = wikipedia.run("Python programming language")
```

### 3.2 工具列表

| 工具名 | 功能 | 使用场景 |
|-------|------|---------|
| DuckDuckGoSearchRun | 网页搜索 | 获取实时信息 |
| PythonREPLTool | 执行 Python | 计算和数据处理 |
| ShellTool | 执行 Shell | 系统操作 |
| WikipediaQueryRun | 维基百科 | 知识查询 |
| GoogleSerperAPIWrapper | Google 搜索 | 精准搜索 |

---

## 四、自定义 Tool 开发

### 4.1 方式一：使用 @tool 装饰器

```python
from langchain.tools import tool
from typing import Optional

@tool
def get_weather(city: str, date: Optional[str] = None) -> str:
    """
    查询指定城市的天气信息

    Args:
        city: 城市名称，如"北京"、"上海"
        date: 日期，格式为"YYYY-MM-DD"，默认为今天

    Returns:
        天气信息字符串
    """
    # 实际调用天气 API
    # 这里用模拟数据演示
    weather_data = {
        "北京": "晴，15-25°C",
        "上海": "多云，18-26°C",
        "广州": "小雨，22-30°C"
    }
    result = weather_data.get(city, "未找到该城市天气")
    if date:
        return f"{city}{date}天气：{result}"
    return f"{city}今天天气：{result}"


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """
    发送邮件

    Args:
        to: 收件人邮箱地址
        subject: 邮件主题
        body: 邮件正文

    Returns:
        发送结果
    """
    # 实际调用邮件 API
    print(f"发送邮件到 {to}")
    print(f"主题: {subject}")
    print(f"正文: {body}")
    return f"邮件已发送到 {to}"
```

### 4.2 方式二：继承 BaseTool 类

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Optional, Type

# 定义输入参数模型
class WeatherInput(BaseModel):
    """天气查询输入参数"""
    city: str = Field(description="城市名称")
    date: Optional[str] = Field(default=None, description="日期，格式YYYY-MM-DD")

class WeatherTool(BaseTool):
    """天气查询工具"""

    name = "weather"
    description = "查询城市天气信息"
    args_schema: Type[BaseModel] = WeatherInput

    def _run(self, city: str, date: Optional[str] = None) -> str:
        """执行查询"""
        weather_data = {
            "北京": "晴，15-25°C",
            "上海": "多云，18-26°C"
        }
        result = weather_data.get(city, "未找到")
        return f"{city}天气：{result}"

    async def _arun(self, city: str, date: Optional[str] = None) -> str:
        """异步执行"""
        return self._run(city, date)

# 使用
weather_tool = WeatherTool()
result = weather_tool.run({"city": "北京"})
```

### 4.3 方式三：从函数创建 Tool

```python
from langchain.tools import Tool

def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"计算错误：{e}"

# 创建 Tool
calculator_tool = Tool(
    name="calculator",
    description="计算数学表达式，如'1+1'、'2*3'",
    func=calculate
)
```

---

## 五、工具调用流程

### 5.1 Agent 调用工具的完整流程

```
1. 用户输入
      ↓
2. Agent 分析意图，选择工具
      ↓
3. Agent 构造工具参数
      ↓
4. 执行工具，获取结果
      ↓
5. Agent 根据结果继续推理
      ↓
6. 重复 2-5 直到完成任务
      ↓
7. 输出最终结果
```

### 5.2 示例：天气查询 Agent

```python
from langchain.agents import initialize_agent, AgentType
from langchain_openai import ChatOpenAI

# 准备工具
tools = [get_weather, send_email]

# 创建 Agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True  # 显示推理过程
)

# 执行
result = agent.run("帮我查一下北京今天的天气，然后发邮件给test@example.com告诉结果")

# 输出示例：
# > Entering new AgentExecutor chain...
# I need to check the weather in Beijing and send an email
// Action: get_weather
// Action Input: 北京
// Observation: 北京今天天气：晴，15-25°C
// Thought: Now I need to send an email with this weather info
// Action: send_email
// Action Input: to="test@example.com", subject="北京天气", body="北京今天天气：晴，15-25°C"
// Observation: 邮件已发送到 test@example.com
// Thought: I have completed both tasks
// Final Answer: 已查询北京天气（晴，15-25°C）并发送邮件到 test@example.com
```

### 5.3 工具选择机制

Agent 如何知道该用哪个工具？

1. **描述匹配**：根据工具的 description 判断
2. **参数匹配**：检查输入是否匹配工具参数
3. **历史学习**：根据之前的成功调用

**写好 description 很重要**：

```python
# 好的描述
@tool
def search_product(product_id: str) -> str:
    """
    根据产品ID查询产品详细信息

    适用场景：
    - 用户询问某个产品的详情
    - 需要查询产品价格、库存等信息

    输入：产品ID，如"PROD001"
    输出：产品详细信息
    """
    pass

# 不好的描述
@tool
def search_product(product_id: str) -> str:
    """查询产品"""  # 太模糊
    pass
```

---

## 六、高级工具模式

### 6.1 返回结构化数据

```python
from pydantic import BaseModel
from typing import List

class SearchResult(BaseModel):
    """搜索结果结构"""
    title: str
    url: str
    snippet: str

@tool
def search_web(query: str) -> List[SearchResult]:
    """搜索网页，返回结构化结果"""
    # 模拟搜索结果
    return [
        SearchResult(
            title="LangChain 官方文档",
            url="https://python.langchain.com",
            snippet="LangChain 是一个用于开发..."
        ),
        SearchResult(
            title="LangChain GitHub",
            url="https://github.com/langchain-ai",
            snippet="Build context-aware reasoning applications..."
        )
    ]
```

### 6.2 工具链

```python
from langchain.tools import Tool
from langchain.chains import SequentialChain

# 工具1：搜索
def search(query):
    return f"搜索结果：{query}"

# 工具2：总结
def summarize(text):
    return f"摘要：{text[:50]}..."

# 组合成工具链
tools = [
    Tool(name="search", func=search, description="搜索"),
    Tool(name="summarize", func=summarize, description="总结")
]

# 在 Agent 中可以串联调用
```

### 6.3 带状态的工具

```python
class DatabaseTool(BaseTool):
    """数据库查询工具（带连接池）"""

    name = "database"
    description = "查询数据库"

    def __init__(self, connection_string: str):
        super().__init__()
        self.connection_string = connection_string
        self._connection = None

    @property
    def connection(self):
        if self._connection is None:
            # 创建连接
            self._connection = create_connection(self.connection_string)
        return self._connection

    def _run(self, query: str) -> str:
        cursor = self.connection.cursor()
        cursor.execute(query)
        return str(cursor.fetchall())

# 使用
db_tool = DatabaseTool("postgresql://localhost/mydb")
```

---

## 七、工具调试与测试

### 7.1 单独测试工具

```python
# 直接调用测试
result = get_weather.invoke({"city": "北京"})
print(result)

# 测试不同输入
test_cases = [
    {"city": "北京"},
    {"city": "上海", "date": "2024-01-15"},
    {"city": "不存在的城市"}
]

for case in test_cases:
    result = get_weather.invoke(case)
    print(f"输入: {case}, 输出: {result}")
```

### 7.2 查看工具信息

```python
# 查看工具 schema
print(get_weather.args_schema.schema())

# 输出：
{
    'properties': {
        'city': {'description': '城市名称', 'title': 'City', 'type': 'string'},
        'date': {'default': None, 'description': '日期', 'title': 'Date', 'type': 'string'}
    },
    'required': ['city'],
    'title': 'WeatherInput',
    'type': 'object'
}
```

### 7.3 Agent 调试模式

```python
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,  # 显示推理过程
    max_iterations=5,  # 最大迭代次数
    early_stopping_method="generate"  # 提前停止策略
)

# 查看 Agent 的提示词
print(agent.agent.llm_chain.prompt.template)
```

---

## 八、实战：构建多工具助手

### 8.1 需求

创建一个助手，能够：
- 查天气
- 搜索网页
- 计算数学表达式
- 发送邮件

### 8.2 完整实现

```python
from langchain.tools import tool
from langchain.agents import initialize_agent, AgentType
from langchain_openai import ChatOpenAI
import requests

@tool
def get_weather(city: str) -> str:
    """查询城市天气"""
    # 实际调用天气 API
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid=YOUR_API_KEY"
    try:
        response = requests.get(url)
        data = response.json()
        temp = data['main']['temp'] - 273.15  # 转摄氏度
        desc = data['weather'][0]['description']
        return f"{city}天气：{desc}，温度{temp:.1f}°C"
    except:
        return f"无法获取{city}的天气信息"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        # 安全计算
        allowed_chars = set('0123456789+-*/.() ')
        if not all(c in allowed_chars for c in expression):
            return "只支持基本数学运算"
        result = eval(expression)
        return f"计算结果：{result}"
    except Exception as e:
        return f"计算错误：{e}"

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """发送邮件（模拟）"""
    print(f"[模拟发送邮件]")
    print(f"  收件人: {to}")
    print(f"  主题: {subject}")
    print(f"  正文: {body}")
    return f"邮件已发送到 {to}"

# 创建工具列表
tools = [get_weather, calculate, send_email]

# 创建 Agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,  # 使用 OpenAI 函数调用
    verbose=True
)

# 使用
result = agent.run("北京今天的天气怎么样？如果温度低于20度，发邮件提醒我带外套，收件人是test@example.com")
```

---

## 九、本课小结

### 9.1 关键要点

1. **Tool 定义**：name + description + func
2. **三种定义方式**：@tool 装饰器、继承 BaseTool、Tool 类
3. **调用流程**：分析 → 选择 → 执行 → 反馈
4. **描述很重要**：好的描述让 Agent 正确选择工具

### 9.2 最佳实践

| 实践 | 说明 |
|------|------|
| 清晰的描述 | 让 Agent 知道何时使用 |
| 类型提示 | 帮助 Agent 构造参数 |
| 错误处理 | 工具应该优雅地处理错误 |
| 单一职责 | 每个工具只做一件事 |

### 9.3 思考题

1. 如何设计工具的描述让 Agent 正确选择？
2. 工具返回错误时，Agent 应该如何处理？
3. 如何限制 Agent 使用某些工具？

---

**下一课**：Chain 链式调用 - 构建复杂工作流