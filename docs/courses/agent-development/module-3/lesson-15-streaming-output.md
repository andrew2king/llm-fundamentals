# 课时 15：流式输出与用户体验

> Agent 开发实战 - 模块三：Agent 开发进阶

## 一、本课目标

- 理解流式输出的原理与优势
- 掌握 LangChain 流式输出实现
- 优化 Agent 响应的用户体验

---

## 二、为什么需要流式输出？

### 2.1 传统响应 vs 流式响应

**传统响应**：
```
用户请求 → [等待 10s] → 完整响应
```

**流式响应**：
```
用户请求 → [0.5s] → 第一块内容 → [0.3s] → 第二块内容 → ... → 完成
```

### 2.2 流式输出的优势

| 优势 | 说明 |
|------|------|
| **感知速度更快** | 用户立即看到响应 |
| **减少等待焦虑** | 持续的进度反馈 |
| **便于取消** | 可以中途停止 |
| **节省内存** | 不需要缓存完整响应 |

---

## 三、LangChain 流式输出

### 3.1 基础流式调用

```python
from langchain_openai import ChatOpenAI

# 创建流式 LLM
llm = ChatOpenAI(
    model="gpt-4",
    streaming=True,
    temperature=0
)

# 流式调用
for chunk in llm.stream("写一首关于春天的诗"):
    print(chunk.content, end="", flush=True)
```

### 3.2 异步流式调用

```python
import asyncio

async def stream_response():
    llm = ChatOpenAI(model="gpt-4", streaming=True)

    async for chunk in llm.astream("写一首诗"):
        print(chunk.content, end="", flush=True)

# 运行
asyncio.run(stream_response())
```

### 3.3 带回调的流式输出

```python
from langchain.callbacks import StreamingStdOutCallbackHandler, BaseCallbackHandler

class CustomStreamingHandler(BaseCallbackHandler):
    """自定义流式处理器"""

    def on_llm_new_token(self, token: str, **kwargs):
        """收到新 token"""
        print(token, end="", flush=True)

        # 可以添加自定义逻辑
        # 如：保存到文件、发送到 WebSocket 等

# 使用
llm = ChatOpenAI(
    model="gpt-4",
    streaming=True,
    callbacks=[CustomStreamingHandler()]
)

llm.invoke("写一首诗")
```

---

## 四、Agent 流式输出

### 4.1 AgentExecutor 流式

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI
from langchain.callbacks import StreamingStdOutCallbackHandler

# 创建流式 LLM
llm = ChatOpenAI(
    model="gpt-4",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# 创建 Agent
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    streaming=True  # 启用流式
)

# 执行
for chunk in agent_executor.stream({"input": "北京天气怎么样？"}):
    # 处理不同类型的输出
    if "actions" in chunk:
        for action in chunk["actions"]:
            print(f"\n[使用工具: {action.tool}]")
    elif "steps" in chunk:
        for step in chunk["steps"]:
            print(f"\n[观察: {step.observation}]")
    elif "output" in chunk:
        print(f"\n[最终答案: {chunk['output']}]")
```

### 4.2 解析流式事件

```python
def process_stream_events(stream):
    """处理流式事件"""
    for event in stream:
        event_type = event.get("event")

        if event_type == "on_chain_start":
            print(f"\n开始执行: {event['name']}")

        elif event_type == "on_llm_start":
            print("\nLLM 开始生成...")

        elif event_type == "on_llm_stream":
            token = event["data"]["chunk"].content
            print(token, end="", flush=True)

        elif event_type == "on_llm_end":
            print("\n\nLLM 生成完成")

        elif event_type == "on_tool_start":
            print(f"\n调用工具: {event['name']}")

        elif event_type == "on_tool_end":
            print(f"工具返回: {event['data']['output']}")

        elif event_type == "on_chain_end":
            print(f"\n执行完成: {event['name']}")

# 使用
stream = agent_executor.stream_events({"input": "查询天气"})
process_stream_events(stream)
```

---

## 五、前端集成

### 5.1 WebSocket 流式传输

```python
# 后端 (FastAPI)
from fastapi import FastAPI, WebSocket
from langchain_openai import ChatOpenAI
import asyncio

app = FastAPI()

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()

    llm = ChatOpenAI(model="gpt-4", streaming=True)

    async for message in websocket.iter_text():
        # 流式响应
        async for chunk in llm.astream(message):
            await websocket.send_text(chunk.content)

        # 发送结束标记
        await websocket.send_text("[DONE]")
```

```javascript
// 前端
const ws = new WebSocket('ws://localhost:8000/ws/chat');

ws.onopen = () => {
    ws.send('写一首诗');
};

ws.onmessage = (event) => {
    if (event.data === '[DONE]') {
        console.log('完成');
        return;
    }
    document.getElementById('output').textContent += event.data;
};
```

### 5.2 Server-Sent Events (SSE)

```python
# 后端 (FastAPI)
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from langchain_openai import ChatOpenAI
import asyncio

app = FastAPI()

async def generate_stream(prompt: str):
    """生成 SSE 流"""
    llm = ChatOpenAI(model="gpt-4", streaming=True)

    async for chunk in llm.astream(prompt):
        # SSE 格式
        yield f"data: {chunk.content}\n\n"

    yield "data: [DONE]\n\n"

@app.get("/stream")
async def stream_chat(prompt: str):
    return StreamingResponse(
        generate_stream(prompt),
        media_type="text/event-stream"
    )
```

```javascript
// 前端
const eventSource = new EventSource('/stream?prompt=写一首诗');

eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
        eventSource.close();
        return;
    }
    document.getElementById('output').textContent += event.data;
};
```

---

## 六、用户体验优化

### 6.1 进度指示

```python
from langchain.callbacks import BaseCallbackHandler

class ProgressHandler(BaseCallbackHandler):
    """进度显示处理器"""

    def __init__(self):
        self.step = 0
        self.total_steps = 0
        self.current_action = ""

    def on_chain_start(self, serialized, inputs, **kwargs):
        self.step += 1
        print(f"\r步骤 {self.step}...", end="", flush=True)

    def on_tool_start(self, serialized, input_str, **kwargs):
        tool_name = serialized.get("name", "unknown")
        print(f"\r使用工具: {tool_name}...", end="", flush=True)

    def on_llm_start(self, serialized, prompts, **kwargs):
        print(f"\r思考中...", end="", flush=True)

    def on_llm_new_token(self, token, **kwargs):
        # 实时输出 token
        print(token, end="", flush=True)
```

### 6.2 打字机效果

```python
import time
import random

def typewriter_effect(text: str, delay: float = 0.02):
    """打字机效果"""
    for char in text:
        print(char, end="", flush=True)
        # 随机延迟，更自然
        time.sleep(delay * (0.5 + random.random()))

async def async_typewriter(text: str, websocket, delay: float = 0.02):
    """异步打字机效果"""
    for char in text:
        await websocket.send_text(char)
        await asyncio.sleep(delay)
```

### 6.3 取消支持

```python
import asyncio
from typing import Optional

class CancellableStream:
    """可取消的流式输出"""

    def __init__(self):
        self._cancelled = False

    def cancel(self):
        """取消流"""
        self._cancelled = True

    async def stream(self, llm, prompt: str):
        """流式输出，可取消"""
        async for chunk in llm.astream(prompt):
            if self._cancelled:
                print("\n[已取消]")
                return
            yield chunk.content

# 使用
streamer = CancellableStream()

async def run():
    llm = ChatOpenAI(model="gpt-4", streaming=True)
    async for content in streamer.stream(llm, "写一首诗"):
        print(content, end="", flush=True)

# 取消（可以在其他地方调用）
# streamer.cancel()
```

### 6.4 错误恢复显示

```python
class StreamingWithRetry:
    """带重试的流式输出"""

    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries
        self.buffer = []

    async def stream_with_retry(self, llm, prompt: str):
        """流式输出，失败时从断点恢复"""
        for attempt in range(self.max_retries):
            try:
                # 从缓冲区恢复
                full_prompt = prompt
                if self.buffer:
                    print(f"\n[重试，从断点恢复...]")
                    full_prompt = f"{prompt}\n已输出：{''.join(self.buffer)}"

                async for chunk in llm.astream(full_prompt):
                    self.buffer.append(chunk.content)
                    yield chunk.content

                # 成功完成，清空缓冲
                self.buffer = []
                return

            except Exception as e:
                print(f"\n[连接中断，重试中... ({attempt + 1}/{self.max_retries})]")
                await asyncio.sleep(2 ** attempt)

        raise Exception("流式输出失败，请重试")
```

---

## 七、完整示例：流式聊天应用

```python
from fastapi import FastAPI, WebSocket
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
import asyncio
import json

app = FastAPI()

class StreamingChat:
    """流式聊天"""

    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", streaming=True)
        self.memory = ConversationBufferMemory()

    async def chat(self, websocket: WebSocket, message: str):
        """处理聊天消息"""
        # 发送状态：开始思考
        await websocket.send_text(json.dumps({
            "type": "status",
            "content": "thinking"
        }))

        # 获取历史
        history = self.memory.load_memory_variables({}).get("history", "")

        # 构建提示
        prompt = f"""
历史对话：
{history}

用户：{message}
助手："""

        # 流式输出
        full_response = ""
        async for chunk in self.llm.astream(prompt):
            full_response += chunk.content
            await websocket.send_text(json.dumps({
                "type": "token",
                "content": chunk.content
            }))

        # 保存到记忆
        self.memory.save_context(
            {"input": message},
            {"output": full_response}
        )

        # 发送完成
        await websocket.send_text(json.dumps({
            "type": "done",
            "content": ""
        }))

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    chat = StreamingChat()

    try:
        async for message in websocket.iter_text():
            data = json.loads(message)
            await chat.chat(websocket, data["content"])
    except Exception as e:
        print(f"WebSocket 错误: {e}")
    finally:
        await websocket.close()
```

---

## 八、本课小结

### 8.1 关键要点

1. **流式输出**：提升感知速度，减少等待
2. **实现方式**：回调、async 迭代、WebSocket、SSE
3. **用户体验**：进度指示、打字机效果、取消支持
4. **错误恢复**：断点续传、自动重试

### 8.2 最佳实践

| 场景 | 推荐方案 |
|------|---------|
| Web 应用 | SSE 或 WebSocket |
| CLI 工具 | 回调 + 直接输出 |
| 长文本 | 流式 + 取消支持 |
| 生产环境 | 错误恢复 + 监控 |

---

**下一课**：成本优化技巧 - 让 Agent 更经济