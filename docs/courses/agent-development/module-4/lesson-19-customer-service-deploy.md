# 课时 19：智能客服 Agent - 系统集成与部署

> Agent 开发实战 - 模块四：实战项目

## 一、API 服务设计

### 1.1 FastAPI 服务实现

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI(title="Customer Service API")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求/响应模型
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    intent: Optional[str] = None
    need_human: bool = False

# Agent 实例
agent = CustomerServiceAgent()

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """对话接口"""
    # 生成会话 ID
    session_id = request.session_id or str(uuid.uuid4())

    # 处理消息
    result = agent.process(request.message, request.user_id)

    return ChatResponse(
        response=result["response"],
        session_id=session_id,
        intent=result.get("intent"),
        need_human=result.get("need_human", False)
    )

@app.post("/session/end")
async def end_session(session_id: str):
    """结束会话"""
    agent.end_session(session_id)
    return {"status": "success"}

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}
```

### 1.2 WebSocket 实时通信

```python
from fastapi import WebSocket, WebSocketDisconnect
import json

class ConnectionManager:
    """WebSocket 连接管理"""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        del self.active_connections[session_id]

    async def send_message(self, session_id: str, message: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # 处理消息
            result = agent.process(message["content"])

            # 流式返回
            for token in result["response"]:
                await websocket.send_text(json.dumps({
                    "type": "token",
                    "content": token
                }))

            await websocket.send_text(json.dumps({
                "type": "done",
                "intent": result.get("intent")
            }))

    except WebSocketDisconnect:
        manager.disconnect(session_id)
```

---

## 二、业务工具集成

### 2.1 订单查询工具

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type
import sqlite3

class OrderQueryInput(BaseModel):
    """订单查询输入"""
    order_id: str = Field(description="订单ID")

class OrderQueryTool(BaseTool):
    """订单查询工具"""

    name = "order_query"
    description = "查询订单状态，需要提供订单ID"
    args_schema: Type[BaseModel] = OrderQueryInput

    def __init__(self, db_path: str):
        super().__init__()
        self.db_path = db_path

    def _run(self, order_id: str) -> str:
        """执行查询"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT order_id, status, total, create_time
            FROM orders WHERE order_id = ?
        """, (order_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return f"订单号：{row[0]}\n状态：{row[1]}\n金额：{row[2]}元\n下单时间：{row[3]}"
        return f"未找到订单 {order_id}"

    async def _arun(self, order_id: str) -> str:
        return self._run(order_id)
```

### 2.2 物流跟踪工具

```python
class LogisticsInput(BaseModel):
    """物流查询输入"""
    tracking_number: str = Field(description="物流单号")

class LogisticsTool(BaseTool):
    """物流跟踪工具"""

    name = "logistics_query"
    description = "查询物流信息，需要物流单号"
    args_schema: Type[BaseModel] = LogisticsInput

    def _run(self, tracking_number: str) -> str:
        """查询物流"""
        # 模拟调用物流 API
        logistics_info = {
            "status": "运输中",
            "current_location": "北京转运中心",
            "estimated_arrival": "2024-01-20",
            "history": [
                {"time": "2024-01-18 10:00", "location": "上海", "action": "已揽收"},
                {"time": "2024-01-18 18:00", "location": "上海转运中心", "action": "已发出"},
                {"time": "2024-01-19 08:00", "location": "北京转运中心", "action": "到达"},
            ]
        }

        result = f"物流单号：{tracking_number}\n"
        result += f"状态：{logistics_info['status']}\n"
        result += f"当前位置：{logistics_info['current_location']}\n"
        result += f"预计到达：{logistics_info['estimated_arrival']}\n"
        result += "\n物流轨迹：\n"

        for item in logistics_info["history"]:
            result += f"  {item['time']} {item['location']} {item['action']}\n"

        return result
```

### 2.3 人工转接工具

```python
class HumanTransferInput(BaseModel):
    """人工转接输入"""
    reason: str = Field(description="转接原因")
    priority: str = Field(default="normal", description="优先级：high/normal/low")

class HumanTransferTool(BaseTool):
    """人工转接工具"""

    name = "human_transfer"
    description = "转接人工客服，用于无法自动处理的复杂问题"
    args_schema: Type[BaseModel] = HumanTransferInput

    def _run(self, reason: str, priority: str = "normal") -> str:
        """执行转接"""
        # 创建工单
        ticket_id = f"TK{int(time.time())}"

        # 发送通知（实际实现中调用消息队列或通知服务）
        print(f"[通知] 新工单：{ticket_id}，优先级：{priority}，原因：{reason}")

        return f"已为您转接人工客服，工单号：{ticket_id}。客服将尽快为您服务，请稍候..."
```

---

## 三、Docker 部署

### 3.1 Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.2 Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://user:password@db:5432/customer_service
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=customer_service
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3.3 启动服务

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f api
```

---

## 四、监控与运维

### 4.1 日志配置

```python
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    """配置日志"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler(
                'logs/app.log',
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            ),
            logging.StreamHandler()
        ]
    )
```

### 4.2 性能监控

```python
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

# 定义指标
REQUEST_COUNT = Counter(
    'chat_requests_total',
    'Total chat requests'
)

REQUEST_LATENCY = Histogram(
    'chat_request_latency_seconds',
    'Chat request latency'
)

@app.get("/metrics")
async def metrics():
    """Prometheus 指标"""
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )
```

### 4.3 健康检查

```python
@app.get("/health")
async def health_check():
    """健康检查"""
    checks = {
        "api": True,
        "database": await check_database(),
        "llm": await check_llm_connection()
    }

    all_healthy = all(checks.values())

    return {
        "status": "healthy" if all_healthy else "unhealthy",
        "checks": checks
    }

async def check_database() -> bool:
    """检查数据库连接"""
    try:
        # 执行简单查询
        return True
    except:
        return False

async def check_llm_connection() -> bool:
    """检查 LLM 连接"""
    try:
        llm.invoke("ping")
        return True
    except:
        return False
```

---

## 五、本课小结

### 5.1 关键要点

1. **API 服务**：FastAPI + WebSocket
2. **业务工具**：订单、物流、人工转接
3. **Docker 部署**：容器化 + 编排
4. **监控运维**：日志、指标、健康检查

### 5.2 项目一总结

智能客服 Agent 完整实现：
- 需求分析与架构设计
- 知识库对接与问答实现
- 系统集成与部署

---

**下一课**：文档问答 Agent - 文档解析与向量化