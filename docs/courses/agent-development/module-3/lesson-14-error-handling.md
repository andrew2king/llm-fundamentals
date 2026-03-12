# 课时 14：错误处理与重试策略

> Agent 开发实战 - 模块三：Agent 开发进阶

## 一、本课目标

- 识别 Agent 系统中的常见错误类型
- 掌握重试机制设计
- 实现优雅的降级策略

---

## 二、常见错误类型

### 2.1 错误分类

```
Agent 系统错误
│
├── 输入错误
│   ├── 参数缺失
│   ├── 格式不正确
│   └── 超出范围
│
├── LLM 错误
│   ├── API 超时
│   ├── Rate Limit
│   ├── Token 超限
│   └── 输出解析失败
│
├── 工具错误
│   ├── 工具不存在
│   ├── 执行失败
│   └── 返回异常
│
└── 系统错误
    ├── 内存不足
    ├── 网络故障
    └── 服务不可用
```

### 2.2 错误示例

```python
# 常见错误示例

# 1. LLM API 错误
from openai import RateLimitError, APITimeoutError

# 2. 解析错误
from pydantic import ValidationError

# 3. 工具执行错误
class ToolExecutionError(Exception):
    pass
```

---

## 三、重试机制设计

### 3.1 基础重试

```python
import time
from functools import wraps

def retry(max_attempts=3, delay=1, backoff=2):
    """重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    if attempt < max_attempts - 1:
                        wait_time = delay * (backoff ** attempt)
                        print(f"第 {attempt + 1} 次失败，{wait_time}秒后重试...")
                        time.sleep(wait_time)
            raise last_error
        return wrapper
    return decorator

# 使用
@retry(max_attempts=3, delay=1)
def call_llm(prompt):
    return llm.invoke(prompt)
```

### 3.2 使用 tenacity 库

```python
from tenacity import (
    retry,
    stop_after_attempt,
    stop_after_delay,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)
import logging

# 配置重试策略
@retry(
    stop=stop_after_attempt(5),           # 最多重试5次
    wait=wait_exponential(multiplier=1, min=2, max=60),  # 指数退避
    retry=retry_if_exception_type(RateLimitError),  # 只对特定错误重试
    before_sleep=before_sleep_log(logging.getLogger(), logging.INFO)
)
def call_llm_with_retry(prompt):
    """带重试的 LLM 调用"""
    return llm.invoke(prompt)
```

### 3.3 不同错误的重试策略

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from openai import RateLimitError, APITimeoutError, APIConnectionError

class RetryStrategy:
    """重试策略"""

    @staticmethod
    def is_retryable(error):
        """判断是否可重试"""
        # Rate Limit 可重试
        if isinstance(error, RateLimitError):
            return True
        # 超时可重试
        if isinstance(error, APITimeoutError):
            return True
        # 连接错误可重试
        if isinstance(error, APIConnectionError):
            return True
        # 其他错误不重试
        return False

# 应用策略
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(min=1, max=30),
    retry=retry_if_exception(RetryStrategy.is_retryable)
)
def safe_llm_call(prompt):
    return llm.invoke(prompt)
```

---

## 四、降级策略

### 4.1 降级模式

```python
class FallbackChain:
    """降级链"""

    def __init__(self, providers: list):
        self.providers = providers
        self.current_index = 0

    def execute(self, prompt: str) -> str:
        """依次尝试，直到成功"""
        errors = []

        for i, provider in enumerate(self.providers):
            try:
                result = provider.invoke(prompt)
                return result
            except Exception as e:
                errors.append(f"{provider.__class__.__name__}: {e}")
                print(f"Provider {i} 失败: {e}")

        # 所有 Provider 都失败
        raise Exception(f"所有服务都不可用:\n" + "\n".join(errors))

# 使用
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

fallback_chain = FallbackChain([
    ChatOpenAI(model="gpt-4"),
    ChatAnthropic(model="claude-3-sonnet"),
    ChatOpenAI(model="gpt-3.5-turbo")
])

result = fallback_chain.execute("你好")
```

### 4.2 模型降级

```python
class ModelFallback:
    """模型降级策略"""

    MODELS = [
        {"name": "gpt-4", "provider": "openai", "priority": 1},
        {"name": "claude-3-sonnet", "provider": "anthropic", "priority": 2},
        {"name": "gpt-3.5-turbo", "provider": "openai", "priority": 3},
    ]

    def __init__(self):
        self.current_model_index = 0

    def get_model(self):
        """获取当前模型"""
        model_config = self.MODELS[self.current_model_index]
        if model_config["provider"] == "openai":
            return ChatOpenAI(model=model_config["name"])
        else:
            return ChatAnthropic(model=model_config["name"])

    def fallback(self):
        """降级到下一个模型"""
        if self.current_model_index < len(self.MODELS) - 1:
            self.current_model_index += 1
            return True
        return False

    def invoke(self, prompt: str, max_fallbacks: int = 3) -> str:
        """带降级的调用"""
        fallback_count = 0

        while fallback_count <= max_fallbacks:
            model = self.get_model()
            try:
                return model.invoke(prompt)
            except Exception as e:
                print(f"模型 {self.MODELS[self.current_model_index]['name']} 失败: {e}")
                if self.fallback():
                    fallback_count += 1
                else:
                    raise Exception("所有模型都不可用")
```

### 4.3 功能降级

```python
class GracefulDegradation:
    """优雅降级"""

    def __init__(self):
        self.features = {
            "advanced_reasoning": True,
            "tool_calling": True,
            "streaming": True
        }
        self.error_counts = {k: 0 for k in self.features}

    def record_error(self, feature: str):
        """记录错误"""
        self.error_counts[feature] += 1
        if self.error_counts[feature] >= 3:
            self.features[feature] = False
            print(f"功能 {feature} 已禁用（错误次数过多）")

    def is_available(self, feature: str) -> bool:
        """检查功能是否可用"""
        return self.features.get(feature, False)

    def execute_with_fallback(self, feature: str, primary_func, fallback_func):
        """带降级的执行"""
        if self.is_available(feature):
            try:
                return primary_func()
            except Exception as e:
                self.record_error(feature)
                return fallback_func()
        else:
            return fallback_func()

# 使用
degradation = GracefulDegradation()

def advanced_analysis(data):
    """高级分析（使用 GPT-4）"""
    return ChatOpenAI(model="gpt-4").invoke(f"分析：{data}")

def basic_analysis(data):
    """基础分析（使用 GPT-3.5）"""
    return ChatOpenAI(model="gpt-3.5-turbo").invoke(f"分析：{data}")

result = degradation.execute_with_fallback(
    "advanced_reasoning",
    lambda: advanced_analysis("数据"),
    lambda: basic_analysis("数据")
)
```

---

## 五、错误处理最佳实践

### 5.1 完整的错误处理流程

```python
from dataclasses import dataclass
from typing import Optional, Any
import logging

@dataclass
class AgentResult:
    """Agent 执行结果"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    fallback_used: bool = False

class RobustAgent:
    """健壮的 Agent"""

    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = tools
        self.logger = logging.getLogger(__name__)

    def execute(self, task: str) -> AgentResult:
        """执行任务"""
        try:
            # 1. 验证输入
            self._validate_input(task)

            # 2. 执行主流程
            result = self._execute_main(task)
            return AgentResult(success=True, data=result)

        except ValidationError as e:
            self.logger.warning(f"输入验证失败: {e}")
            return AgentResult(success=False, error=f"输入错误: {e}")

        except RateLimitError as e:
            self.logger.warning(f"Rate Limit: {e}")
            # 尝试降级
            result = self._execute_with_fallback(task)
            return AgentResult(success=True, data=result, fallback_used=True)

        except APITimeoutError as e:
            self.logger.error(f"API 超时: {e}")
            return AgentResult(success=False, error="服务超时，请稍后重试")

        except Exception as e:
            self.logger.error(f"未知错误: {e}", exc_info=True)
            return AgentResult(success=False, error=f"系统错误: {e}")

    def _validate_input(self, task: str):
        """验证输入"""
        if not task or len(task.strip()) == 0:
            raise ValidationError("任务不能为空")
        if len(task) > 10000:
            raise ValidationError("任务过长")

    def _execute_main(self, task: str):
        """主执行流程"""
        return self.llm.invoke(task)

    def _execute_with_fallback(self, task: str):
        """降级执行"""
        # 使用备用模型
        fallback_llm = ChatOpenAI(model="gpt-3.5-turbo")
        return fallback_llm.invoke(task)
```

### 5.2 错误恢复

```python
class ErrorRecovery:
    """错误恢复"""

    def __init__(self):
        self.checkpoints = {}

    def save_checkpoint(self, agent_id: str, state: dict):
        """保存检查点"""
        self.checkpoints[agent_id] = {
            "state": state,
            "timestamp": time.time()
        }

    def restore(self, agent_id: str) -> Optional[dict]:
        """恢复状态"""
        checkpoint = self.checkpoints.get(agent_id)
        if checkpoint:
            return checkpoint["state"]
        return None

    def execute_with_recovery(self, agent_id: str, func, *args, **kwargs):
        """带恢复的执行"""
        max_retries = 3

        for attempt in range(max_retries):
            try:
                # 恢复状态
                state = self.restore(agent_id)
                if state:
                    kwargs["state"] = state

                # 执行
                result, new_state = func(*args, **kwargs)

                # 保存检查点
                self.save_checkpoint(agent_id, new_state)

                return result

            except Exception as e:
                print(f"执行失败 (尝试 {attempt + 1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    raise
```

### 5.3 用户友好的错误提示

```python
ERROR_MESSAGES = {
    "rate_limit": "服务繁忙，请稍后再试",
    "timeout": "请求超时，请检查网络后重试",
    "invalid_input": "输入格式不正确，请检查后重试",
    "tool_error": "工具执行失败，请稍后重试",
    "unknown": "系统暂时不可用，请稍后重试"
}

def get_user_friendly_error(error: Exception) -> str:
    """获取用户友好的错误信息"""
    error_type = type(error).__name__

    if "RateLimit" in error_type:
        return ERROR_MESSAGES["rate_limit"]
    elif "Timeout" in error_type:
        return ERROR_MESSAGES["timeout"]
    elif "Validation" in error_type:
        return ERROR_MESSAGES["invalid_input"]
    elif "Tool" in error_type:
        return ERROR_MESSAGES["tool_error"]
    else:
        return ERROR_MESSAGES["unknown"]

# 使用
try:
    result = agent.run(task)
except Exception as e:
    user_message = get_user_friendly_error(e)
    print(f"抱歉，{user_message}")
    # 同时记录详细错误
    logging.error(f"详细错误: {e}", exc_info=True)
```

---

## 六、监控与告警

### 6.1 错误监控

```python
from collections import defaultdict
from datetime import datetime, timedelta

class ErrorMonitor:
    """错误监控器"""

    def __init__(self, alert_threshold: int = 10):
        self.errors = defaultdict(list)
        self.alert_threshold = alert_threshold

    def record_error(self, error_type: str, details: str):
        """记录错误"""
        timestamp = datetime.now()
        self.errors[error_type].append({
            "timestamp": timestamp,
            "details": details
        })

        # 检查是否需要告警
        self._check_alert(error_type)

    def _check_alert(self, error_type: str):
        """检查告警阈值"""
        # 统计最近5分钟的错误
        recent = [
            e for e in self.errors[error_type]
            if datetime.now() - e["timestamp"] < timedelta(minutes=5)
        ]

        if len(recent) >= self.alert_threshold:
            self._send_alert(error_type, len(recent))

    def _send_alert(self, error_type: str, count: int):
        """发送告警"""
        print(f"⚠️ 告警: {error_type} 错误在5分钟内发生 {count} 次")

    def get_error_stats(self) -> dict:
        """获取错误统计"""
        stats = {}
        for error_type, errors in self.errors.items():
            stats[error_type] = len(errors)
        return stats

# 使用
monitor = ErrorMonitor()

try:
    result = agent.run(task)
except RateLimitError as e:
    monitor.record_error("rate_limit", str(e))
except Exception as e:
    monitor.record_error("unknown", str(e))
```

---

## 七、本课小结

### 7.1 关键要点

1. **错误分类**：输入错误、LLM 错误、工具错误、系统错误
2. **重试策略**：指数退避、条件重试、重试次数限制
3. **降级策略**：模型降级、功能降级、优雅降级
4. **用户友好**：清晰的错误提示

### 7.2 检查清单

- [ ] 所有外部调用都有重试机制
- [ ] 关键功能有降级方案
- [ ] 错误信息用户友好
- [ ] 有错误监控和告警
- [ ] 记录详细日志便于排查

---

**下一课**：流式输出与用户体验 - 让 Agent 响应更快